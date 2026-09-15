// Teste do enumerador de superficies.
//
// O que ele decide e barato de acertar e caro de errar: se ele misturar
// superficie VIVA com REGISTRO, quem o usar vai "reconciliar" uma linha do
// `avaliacao/` que cita o estado de uma rodada passada, e isso destroi historia
// em vez de consertar defeito. Por isso o positivo plantado ataca a separacao, e
// nao a busca.
//
// Metade dos casos fixa o que ele NAO promete, e o principal deles e o limite
// que a propria ferramenta declara: termo nao e conceito.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'superficies-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

let n = 0;
function acervo(arquivos, termos, ferramenta) {
  const dir = path.join(TMP, 'a' + (++n));
  fs.mkdirSync(path.join(dir, 'ferramentas'), { recursive: true });
  for (const [rel, txt] of Object.entries(arquivos)) {
    const p = path.join(dir, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, txt, 'utf8');
  }
  const script = path.join(dir, 'ferramentas', 'superficies.js');
  fs.writeFileSync(script, fs.readFileSync(ferramenta || path.join(FERR, 'superficies.js'), 'utf8'));
  const r = spawnSync('node', [script, ...termos], { encoding: 'utf8', cwd: dir });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}

const ACERVO = {
  'AULA-20-saida.md': '# A\n\nO **grau 4a** é indução com validação.\n',
  'AULA-21-self.md': '# B\n\nMas é grau 4a, e a Aula 20 obriga a ressalva.\n',
  'agente/rag-specialist.md': '# Vetor\n\nAo citar o grau 4a, leia a AULA-20 antes.\n',
  'GLOSSARIO.md': '# Glossário\n\n**Structured output** — saída com schema.\n',
  'avaliacao/GATE-AULAS-v1.md': '# Gate\n\nO grau 4a precisou de três rodadas.\nE o grau 4a de novo.\n',
};

// ---------- 1. conta as superficies vivas e manda concordarem ----------
let r = acervo(ACERVO, ['grau 4a']);
checa('lista as três superfícies vivas', /AULA-20-saida\.md/.test(r.saida)
  && /AULA-21-self\.md/.test(r.saida) && /agente\/rag-specialist\.md/.test(r.saida), r.saida);
checa('e diz que as três têm de concordar', /3 superficie\(s\) VIVA\(s\)/.test(r.saida), r.saida);

// ---------- 2. o registro sai separado e marcado ----------
// E o caso que motiva a ferramenta inteira: sem esta linha, alguem "conserta" o
// GATE para bater com o presente.
checa('separa o registro e manda NÃO TOCAR',
  /registro \(NAO TOQUE\): 2 ocorrencia/.test(r.saida)
  && /avaliacao\/GATE-AULAS-v1\.md/.test(r.saida), r.saida);
checa('e o registro NÃO entra na contagem de vivas',
  !/5 superficie\(s\) VIVA/.test(r.saida), r.saida);

// ---------- 3. LIMITE: termo nao e conceito ----------
// O GLOSSARIO deste acervo fala do MESMO assunto sem usar o termo, e a
// ferramenta nao o lista. Nao e defeito: e o limite declarado, e ele fica fixado
// aqui para ninguem ler a saida como "estas sao TODAS as superficies".
checa('LIMITE: paráfrase sem o termo não aparece',
  !/GLOSSARIO/.test(r.saida) && /parafrase escapa/.test(r.saida), r.saida);

// ---------- 4. termo ausente diz que esta ausente ----------
r = acervo(ACERVO, ['reranking multivetorial']);
checa('termo sem superfície viva é reportado como ausente',
  /nenhuma superficie viva/.test(r.saida), r.saida);

// ---------- 5. a busca ignora caixa ----------
r = acervo(ACERVO, ['GRAU 4A']);
checa('acha independente de caixa', /AULA-20-saida\.md/.test(r.saida), r.saida);

// ---------- 6. sem argumento, recusa ----------
r = acervo(ACERVO, []);
checa('sem termo, sai com código 2 e explica o uso',
  r.code === 2 && /uso:/.test(r.saida), r.saida);

// ---------- 7. mais de um termo numa chamada ----------
r = acervo(ACERVO, ['grau 4a', 'Structured output']);
checa('aceita vários termos e separa a saída de cada um',
  (r.saida.match(/^=== "/gm) || []).length === 2, r.saida);

// ---------- positivo plantado ----------
// Cegar a SEPARACAO, nao a busca: se o registro entrar como viva, a ferramenta
// passa a mandar reconciliar historia, que e o pior conselho que ela pode dar.
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: fazendo o registro contar como superfície viva --');
  const fonte = fs.readFileSync(path.join(FERR, 'superficies.js'), 'utf8');
  const alvo = 'const registro = listar(REGISTRO);';
  if (!fonte.includes(alvo)) {
    checa('achei a separação para cegar', false, 'o alvo da mutação não existe mais');
  } else {
    const cego = path.join(TMP, 'superficies-cega.js');
    fs.writeFileSync(cego, fonte
      .replace('const vivas = listar(VIVAS);', 'const vivas = listar(VIVAS).concat(listar(REGISTRO));')
      .replace(alvo, 'const registro = [];'));
    const c = acervo(ACERVO, ['grau 4a'], cego);
    checa('cega, ela conta o GATE como superfície viva a reconciliar',
      /4 superficie\(s\) VIVA\(s\)/.test(c.saida) && !/NAO TOQUE/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
