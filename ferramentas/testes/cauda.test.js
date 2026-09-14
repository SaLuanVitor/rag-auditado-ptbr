// Teste do detector de cauda que cola.
//
// A cauda que cola e a forma mais frequente de defeito desta auditoria, onze
// ocorrencias ate 14/09/2026, e a varredura que existia antes deste script nao
// alcancava o caso real. Ela era um grep por PALAVRA repetida, e o defeito da
// AULA-16 era uma ORACAO repetida separada por travessao: nenhuma palavra
// aparecia duas vezes lado a lado. O caso 1 abaixo e aquele texto, verbatim.
//
// Os casos 2 a 5 sao o outro lado: repeticao deliberada que a ferramenta NAO
// pode acusar, senao o alerta vira ruido e ninguem o le. Sem eles a varredura
// devolvia 38 achados no acervo, a maioria tabela legitima.
//
// `--provar` cega a comparacao central e exige que a suite perceba.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'cauda-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

function roda(texto, ferramenta) {
  const arq = path.join(TMP, 'c-' + Math.random().toString(36).slice(2) + '.md');
  fs.writeFileSync(arq, texto, 'utf8');
  const r = spawnSync('node', [ferramenta || path.join(FERR, 'cauda.js'), arq], { encoding: 'utf8' });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}

// ---------- 1. o caso real, verbatim da AULA-16 ----------
const REAL = 'a chave `billionaires_table_{matched_year+2}` — `_2` a `_6`, que são as abas — que são\nas abas do **outro** arquivo da mesma pasta.\n';
let r = roda(REAL);
checa('acha a oração repetida separada por travessão', r.code === 1 && /cauda de 4 palavra/.test(r.saida), r.saida);

// ---------- 2. tabela nao dispara ----------
r = roda('| Gabarito | não tem | não tem |\n| --- | --- | --- |\n');
checa('nao acusa célula de tabela que repete', r.code === 0 && /Nenhuma cauda/.test(r.saida), r.saida);

// ---------- 3. bloco de codigo nao dispara ----------
r = roda('abertura\n\n```python\nx = x\nfoo bar foo bar\n```\n');
checa('nao olha dentro de fence', r.code === 0 && /Nenhuma cauda/.test(r.saida), r.saida);

// ---------- 4. identificador de codigo repetido nao dispara ----------
r = roda('A aresta vai de `generate` → `generate`, e isso é um laço.\n');
checa('nao acusa identificador de código repetido', r.code === 0 && /Nenhuma cauda/.test(r.saida), r.saida);

// ---------- 5. paragrafos separados nao se fundem ----------
// Sem isto, o fim de um paragrafo e o comeco do seguinte formariam pares falsos.
r = roda('a frase termina aqui\n\na frase termina aqui\n');
checa('nao junta parágrafos separados por linha em branco', r.code === 0 && /Nenhuma cauda/.test(r.saida), r.saida);

// ---------- 6. repeticao de palavra longa lado a lado ainda dispara ----------
// E o caso que a varredura antiga pegava, e que nao pode ter sido perdido.
r = roda('a busca devolve o resultado resultado esperado.\n');
checa('ainda acha a palavra repetida lado a lado', r.code === 1 && /cauda de 1 palavra/.test(r.saida), r.saida);

// ---------- 7. LIMITE DECLARADO: copia separada por conectivo nao e achada ----------
// "A chamada de chamada que" foi uma cauda real desta auditoria e NAO e pega,
// nem por este script nem pela varredura antiga, porque as duas copias tem uma
// palavra entre elas. Este caso nasceu de uma expectativa ERRADA minha, escrita
// aqui como se a ferramenta o pegasse; ela nunca pegou. Alargar para aceitar um
// vao de uma palavra acusaria "resumos de resumos", que e o mecanismo do RAPTOR
// na AULA-23. O limite fica, e fica medido: quem procura esta forma procura a
// olho.
r = roda('a chamada de chamada que devolve o resultado esperado.\n');
checa('LIMITE: nao acha cópia separada por conectivo', r.code === 0 && /Nenhuma cauda/.test(r.saida), r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a comparação de n-gramas --');
  const fonte = fs.readFileSync(path.join(FERR, 'cauda.js'), 'utf8');
  const alvo = 'for (let j = 0; j < k; j++) if (ps[i + j] !== ps[i + k + j]) { igual = false; break; }';
  const cego = path.join(TMP, 'cauda-cega.js');
  if (!fonte.includes(alvo)) {
    checa('achei a comparação para cegar', false, 'o alvo da mutação não existe mais');
  } else {
    fs.writeFileSync(cego, fonte.replace(alvo, 'igual = false;'));
    const c = roda(REAL, cego);
    checa('cega, ela deixa de achar a oração repetida', c.code === 0 && /Nenhuma cauda/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
