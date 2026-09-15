// Teste do gerador do FATOS.md.
//
// Ele foi a unica ferramenta desta casa sem suite, e o plano de fechamento o
// listava como "sem uso", o que estava errado: `--stdout` roda com exit 0 e
// reproduz o FATOS.md versionado, e sete documentos citam a saida dele, entre
// eles a definicao do @rag-specialist e o exame v2. O que faltava era teste.
//
// O CONTRATO que esta suite fixa e um so, e e a razao de o FATOS.md existir:
// uma citacao `arquivo:linha` acompanhada do CONTEUDO LITERAL daquela linha. O
// gate v1 do agente registrou tres alucinacoes, todas de asserção factual feita
// de memoria, e este indice existe para remover a etapa em que a memoria
// preenche o caminho. Um gerador que erre a linha por um nao produz ruido: ele
// produz uma citacao com aparencia de prova, que e pior que nenhuma.
//
// Por isso o positivo plantado desta suite e o off-by-one, e nao uma falha
// ruidosa: e o defeito que passaria despercebido.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'gerar-fatos-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

// O script resolve a fonte por __dirname/../../RAG-from-First-Principles, entao
// o teste monta a arvore inteira em volta de uma copia dele: curso ao lado de
// um clone de mentira. Supor o caminho em vez de montar a arvore deixaria a
// suite medindo o repositorio de verdade, e ela passaria a depender do pin.
let n = 0;
function cenario(arquivos, { args = ['--stdout'], ferramenta } = {}) {
  const raiz = path.join(TMP, 'c' + (++n));
  const curso = path.join(raiz, 'curso');
  fs.mkdirSync(path.join(curso, 'ferramentas'), { recursive: true });
  for (const [rel, txt] of Object.entries(arquivos)) {
    const alvo = path.join(raiz, 'RAG-from-First-Principles', rel);
    fs.mkdirSync(path.dirname(alvo), { recursive: true });
    fs.writeFileSync(alvo, txt, 'utf8');
  }
  const script = path.join(curso, 'ferramentas', 'gerar-fatos.js');
  fs.writeFileSync(script, fs.readFileSync(ferramenta || path.join(FERR, 'gerar-fatos.js'), 'utf8'));
  const r = spawnSync('node', [script, ...args], { encoding: 'utf8', cwd: curso });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status, curso };
}

// Cada linha aqui e uma agulha diferente, e a posicao delas e o que a suite
// mede. `similarity_top_k` esta na linha 4, `chunk_size` na 6.
const FONTE = [
  'import os',                                   // 1
  'from llama_index.core import Settings',       // 2
  '',                                            // 3
  'retriever = index.as_retriever(similarity_top_k=5)', // 4
  '',                                            // 5
  'splitter = SentenceSplitter(chunk_size=512)', // 6
  '',                                            // 7
].join('\n');

// ---------- 1. o contrato: citacao e conteudo literal batem ----------
let r = cenario({ '00-SimpleRAG/demo.py': FONTE });
const linha4 = /`00-SimpleRAG\/demo\.py:4`\s*\|\s*`retriever = index\.as_retriever\(similarity_top_k=5\)`/;
const linha6 = /`00-SimpleRAG\/demo\.py:6`\s*\|\s*`splitter = SentenceSplitter\(chunk_size=512\)`/;
checa('cita a linha 4 com o conteúdo literal da linha 4', linha4.test(r.saida), r.saida);
checa('cita a linha 6 com o conteúdo literal da linha 6', linha6.test(r.saida), r.saida);

// ---------- 2. a numeracao e de 1, e o off-by-one nao passa ----------
// Redundante com o caso 1 de proposito: ele e o que o positivo plantado ataca,
// e um caso que so olha "existe uma citacao" nao o pegaria.
checa('não cita a linha 3 nem a 5, que estão vazias',
  !/demo\.py:3`/.test(r.saida) && !/demo\.py:5`/.test(r.saida), r.saida);

// ---------- 3. o pipe do conteudo e escapado ----------
// Sem isso a linha de codigo quebra a tabela em que ela mora, e o indice fica
// ilegivel justamente onde o fato e mais especifico.
r = cenario({ '00-SimpleRAG/pipe.py': 'x = a if top_k = 1 else b  # a | b\n' });
// A asserção olha a LINHA da pipe.py, e não a saída inteira: um `\|` em
// qualquer outro lugar do documento aprovaria uma varredura ampla sem medir
// nada, e era assim que a primeira versão deste caso passava.
const linhaPipe = r.saida.split('\n').find((l) => l.includes('pipe.py')) || '';
checa('escapa o pipe do conteúdo para não quebrar a tabela',
  /`x = a if top_k = 1 else b  # a \\\| b`/.test(linhaPipe), linhaPipe || r.saida);
checa('e a linha segue sendo UMA linha de tabela de três colunas',
  linhaPipe.split(/(?<!\\)\|/).length === 5, linhaPipe);

// ---------- 4. LIMITE: uma linha, um fato ----------
// A linha abaixo casa 'recuperação' e 'modelo' ao mesmo tempo. O script para no
// primeiro padrao, e isso e escolha, nao acidente: duas linhas identicas com
// rotulos diferentes inflariam o indice sem acrescentar fato.
r = cenario({ '00-SimpleRAG/duplo.py': 'r = f(model_name="x", top_k=3)\n' });
checa('LIMITE: linha que casa dois padrões entra uma vez só',
  (r.saida.match(/duplo\.py:1`/g) || []).length === 1, r.saida);

// ---------- 5. so extensao de codigo ----------
r = cenario({ '00-SimpleRAG/leia.md': 'chunk_size=999\n', '00-SimpleRAG/demo.py': FONTE });
checa('não indexa linha de arquivo que não é código', !/leia\.md/.test(r.saida), r.saida);
checa('mas conta o arquivo no inventário', /`\.md` 1/.test(r.saida), r.saida);

// ---------- 6. modulo vazio nao vira secao ----------
r = cenario({ '00-SimpleRAG/demo.py': FONTE });
checa('não emite seção para módulo que não existe na fonte',
  !/## 09-Evaluation/.test(r.saida), r.saida);

// ---------- 7. fonte ausente reprova com codigo proprio ----------
// Sem isso o script escreveria um FATOS.md vazio e o indice "confirmaria" que o
// repositorio nao tem nenhum fato, que e a forma silenciosa de errar.
r = cenario({});
checa('acusa fonte ausente e sai com código 2', r.code === 2 && /ERRO/.test(r.saida), r.saida);

// ---------- 8. --stdout nao escreve ----------
// Pino de seguranca: e como esta suite e a conferencia de deriva rodam sem
// tocar no FATOS.md versionado.
r = cenario({ '00-SimpleRAG/demo.py': FONTE });
checa('--stdout imprime sem escrever o FATOS.md',
  !fs.existsSync(path.join(r.curso, 'FATOS.md')), 'o arquivo foi escrito mesmo com --stdout');

// ---------- 9. sem --stdout, escreve ----------
r = cenario({ '00-SimpleRAG/demo.py': FONTE }, { args: [] });
checa('sem --stdout, grava o FATOS.md ao lado do curso',
  fs.existsSync(path.join(r.curso, 'FATOS.md')) && /FATOS\.md gerado/.test(r.saida), r.saida);

// ---------- 10. o teto por modulo e declarado, nao silencioso ----------
const muitas = Array.from({ length: 60 }, (_, i) => `a${i} = f(top_k=${i})`).join('\n') + '\n';
r = cenario({ '00-SimpleRAG/muitas.py': muitas });
checa('corta no teto por módulo E declara quantas omitiu',
  /ocorrências adicionais omitidas/.test(r.saida)
  && (r.saida.match(/muitas\.py:/g) || []).length === 45, r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: tirando o +1 da numeração de linha --');
  const fonte = fs.readFileSync(path.join(FERR, 'gerar-fatos.js'), 'utf8');
  const alvo = 'citation: `${moduleName}/${relative}:${index + 1}`,';
  const cego = path.join(TMP, 'gerar-fatos-off-by-one.js');
  if (!fonte.includes(alvo)) {
    checa('achei a numeração de linha para quebrar', false, 'o alvo da mutação não existe mais');
  } else {
    fs.writeFileSync(cego, fonte.replace(alvo, 'citation: `${moduleName}/${relative}:${index}`,'));
    const c = cenario({ '00-SimpleRAG/demo.py': FONTE }, { ferramenta: cego });
    checa('com o off-by-one, a citação deixa de bater com o conteúdo',
      !linha4.test(c.saida) && !linha6.test(c.saida), c.saida);
    checa('e ele sai com exit 0 mesmo assim, que é o motivo de a suíte existir',
      c.code === 0, c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
