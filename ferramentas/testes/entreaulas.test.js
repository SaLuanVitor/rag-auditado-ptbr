// Teste do validador de citacao de linha entre aulas.
//
// O caso 1 e o defeito real de 15/09/2026, reduzido: a AULA-21 citava uma faixa
// da AULA-18 e um conserto na AULA-18 empurrou a passagem cinco linhas adiante. A
// faixa continuou CABENDO no arquivo, entao nenhuma checagem de tamanho o pegaria;
// so a transcricao decide.
//
// Os casos 4 a 7 sao o outro lado, e metade desta suite existe para eles: o que a
// ferramenta NAO pode acusar. Dois dos quatro primeiros achados do grep que a
// originou eram falso positivo, "linha 5" falando de um .py, e uma ferramenta que
// os acusasse viraria ruido no acervo inteiro.
//
// `--provar` cega a comparacao central e exige que a suite perceba.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'entreaulas-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

// A ferramenta resolve o alvo pelo diretorio dela, entao o teste monta um acervo
// de mentira e roda uma copia do script apontada para la.
let n = 0;
function acervo(arquivos, ferramenta) {
  const dir = path.join(TMP, 'a' + (++n));
  fs.mkdirSync(path.join(dir, 'ferramentas'), { recursive: true });
  for (const [nome, txt] of Object.entries(arquivos)) {
    const alvo = path.join(dir, nome);
    fs.mkdirSync(path.dirname(alvo), { recursive: true });
    fs.writeFileSync(alvo, txt, 'utf8');
  }
  const fonte = fs.readFileSync(ferramenta || path.join(FERR, 'entreaulas.js'), 'utf8');
  const script = path.join(dir, 'ferramentas', 'entreaulas.js');
  fs.writeFileSync(script, fonte);
  const r = spawnSync('node', [script], { encoding: 'utf8', cwd: dir });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}

const ALVO = [
  '# AULA 18 — compressao',        // 1
  '',                              // 2
  'prosa de enchimento aqui.',     // 3
  '',                              // 4
  'A diferença entre CRAG e Self-RAG: CRAG critica o que foi recuperado.', // 5
  '',
].join('\n');

const CITA_CERTO = [
  '# AULA 21 — self-rag',
  '',
  'A Aula 18 deixou uma promessa. Ela está nas linhas 5 a 5 daquela aula, e a',
  'ressalva é parte da frase:',
  '',
  '> A diferença entre CRAG e Self-RAG: CRAG critica o que foi recuperado.',
  '',
].join('\n');

// ---------- 1. o caso real: faixa cabe, transcricao esta noutro lugar ----------
let r = acervo({
  'AULA-18-compressao.md': ALVO,
  'AULA-21-self-rag.md': CITA_CERTO.replace('linhas 5 a 5', 'linhas 3 a 4'),
});
checa('acha a citação deslocada', r.code === 1 && /DESLOCADA/.test(r.saida), r.saida);
checa('e diz em que linha a transcrição está', /a partir de 5/.test(r.saida), r.saida);

// ---------- 2. citacao certa passa ----------
r = acervo({ 'AULA-18-compressao.md': ALVO, 'AULA-21-self-rag.md': CITA_CERTO });
checa('aceita a citação que confere', r.code === 0 && /OK: 1/.test(r.saida), r.saida);

// ---------- 3. o requebra nao pode reprovar ----------
// O alvo quebra a frase em duas linhas e a transcricao em uma. Comparar linha a
// linha acusaria todo reempacotamento, e o requebra.js roda em todo commit.
r = acervo({
  'AULA-18-compressao.md': ALVO.replace(
    'A diferença entre CRAG e Self-RAG: CRAG critica o que foi recuperado.',
    'A diferença entre CRAG e Self-RAG: CRAG critica\no que foi recuperado.'),
  'AULA-21-self-rag.md': CITA_CERTO.replace('linhas 5 a 5', 'linhas 5 a 6'),
});
checa('não reprova por quebra de linha diferente', r.code === 0 && /OK: 1/.test(r.saida), r.saida);

// ---------- 4. LIMITE: sem transcricao, so a faixa se confere ----------
r = acervo({
  'AULA-18-compressao.md': ALVO,
  'AULA-21-self-rag.md': '# AULA 21\n\nA Aula 18 trata disso (`AULA-18:5`), e o resto é meu.\n',
});
checa('LIMITE: sem transcrição, reporta SEM_PROVA e não reprova',
  r.code === 0 && /SEM_PROVA/.test(r.saida), r.saida);

// ---------- 5. linha além do fim do alvo reprova ----------
r = acervo({
  'AULA-18-compressao.md': ALVO,
  'AULA-21-self-rag.md': '# AULA 21\n\nVer `AULA-18:900`.\n',
});
checa('acusa linha além do fim do arquivo alvo', r.code === 1 && /FORA/.test(r.saida), r.saida);

// ---------- 6. LIMITE: "linha N" de um .py nao e citacao entre aulas ----------
// Dois dos quatro primeiros achados do grep que originou a ferramenta eram isto.
r = acervo({
  'AULA-18-compressao.md': ALVO,
  'AULA-06-tabelas.md': '# AULA 06\n\nTroque o `path` da linha 5 e a lição é a da Aula 18.\n',
});
checa('LIMITE: não confunde linha de script com citação entre aulas',
  r.code === 0 && !/AULA-06/.test(r.saida), r.saida);

// ---------- 7. a aula citando a si mesma nao e o objeto ----------
r = acervo({
  'AULA-18-compressao.md': ALVO + '\nVer `AULA-18:3` acima.\n',
});
checa('ignora a aula que cita a si mesma', r.code === 0 && !/AULA-18.*AULA-18/.test(r.saida), r.saida);

// ---------- 8. aula citada que nao existe ----------
r = acervo({
  'AULA-18-compressao.md': ALVO,
  'AULA-21-self-rag.md': '# AULA 21\n\nVer `AULA-99:3`.\n',
});
checa('acusa citação a aula inexistente', r.code === 1 && /FORA/.test(r.saida), r.saida);

// ---------- 9. documento vivo em SUBDIRETORIO ----------
// A lacuna que motivou isto: o `VIVOS` listava tres nomes da raiz, e a resolucao
// era por `path.basename`. Acrescentar `agente/rag-specialist.md` sem mexer na
// resolucao daria um script procurando o arquivo na raiz, nao achando, e
// SILENCIANDO. O caso exige as duas coisas: que ele leia o subdiretorio e que o
// relatorio traga o caminho que acha o arquivo.
r = acervo({
  'AULA-18-compressao.md': ALVO,
  'agente/rag-specialist.md': [
    '# Vetor',
    '',
    'A Aula 18 fixa a diferença. Ela está nas linhas 3 a 4 daquela aula:',
    '',
    '> A diferença entre CRAG e Self-RAG: CRAG critica o que foi recuperado.',
    '',
  ].join('\n'),
});
checa('lê documento vivo em subdiretório e acha a citação deslocada',
  r.code === 1 && /DESLOCADA/.test(r.saida), r.saida);
checa('e o relatório traz o caminho que acha o arquivo, não o nome solto',
  /agente\/rag-specialist\.md:3/.test(r.saida), r.saida);

// ---------- 10. LIMITE: vivo que nao existe nao quebra a varredura ----------
// O `VIVOS` e uma lista fixa, e nem todo acervo tem os cinco. Um nome ausente
// nao pode derrubar a ferramenta inteira.
r = acervo({ 'AULA-18-compressao.md': ALVO });
checa('LIMITE: documento vivo ausente é ignorado, não derruba a varredura',
  r.code === 0 && /PASS/.test(r.saida), r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a comparação da transcrição --');
  const fonte = fs.readFileSync(path.join(FERR, 'entreaulas.js'), 'utf8');
  const alvoMut = 'if (naFaixa.includes(primeira)) { ok++; continue; }';
  const cego = path.join(TMP, 'entreaulas-cego.js');
  if (!fonte.includes(alvoMut)) {
    checa('achei a comparação para cegar', false, 'o alvo da mutação não existe mais');
  } else {
    fs.writeFileSync(cego, fonte.replace(alvoMut, 'ok++; continue;'));
    const c = acervo({
      'AULA-18-compressao.md': ALVO,
      'AULA-21-self-rag.md': CITA_CERTO.replace('linhas 5 a 5', 'linhas 3 a 4'),
    }, cego);
    checa('cega, ela aceita a citação deslocada', c.code === 0 && !/DESLOCADA/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
