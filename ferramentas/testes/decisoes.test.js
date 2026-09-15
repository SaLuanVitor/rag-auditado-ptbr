// Teste do indice de decisoes.
//
// O que ele promete e estreito de proposito: casa TITULO de secao e ASSUNTO de
// commit, nao o corpo de nenhum dos dois. Metade desta suite fixa esse limite,
// porque um indice que parecesse buscar no corpo faria alguem concluir "nao foi
// decidido" a partir de uma busca que nunca olhou la.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'decisoes-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

let n = 0;
function cenario({ gate, commits = [], ferramenta } = {}) {
  const dir = path.join(TMP, 'c' + (++n));
  fs.mkdirSync(path.join(dir, 'ferramentas'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'avaliacao'), { recursive: true });
  if (gate !== undefined) fs.writeFileSync(path.join(dir, 'avaliacao', 'GATE-AULAS-v1.md'), gate, 'utf8');
  const g = (...a) => execFileSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  g('init', '-q');
  g('config', 'user.email', 't@t'); g('config', 'user.name', 't');
  g('config', 'commit.gpgsign', 'false'); g('config', 'core.autocrlf', 'false');
  for (const assunto of commits) {
    fs.writeFileSync(path.join(dir, 'x.txt'), assunto);
    g('add', '-A'); g('commit', '-q', '-m', assunto);
  }
  const script = path.join(dir, 'ferramentas', 'decisoes.js');
  fs.writeFileSync(script, fs.readFileSync(ferramenta || path.join(FERR, 'decisoes.js'), 'utf8'));
  return (termo) => {
    const r = spawnSync('node', termo ? [script, termo] : [script], { encoding: 'utf8', cwd: dir });
    return (r.stdout || '') + (r.stderr || '');
  };
}

const GATE = [
  '# Gate',
  '',
  '## O clone pinado não se modifica',
  '',
  'texto da razão, com a palavra fetch aqui dentro.',
  '',
  '## A régua de parada',
  '',
  'mais texto.',
  '',
  '```',
  '## isto é código, não seção',
  '```',
  '',
].join('\n');

let roda = cenario({ gate: GATE, commits: ['decide que o clone nao se modifica', 'outro assunto'] });

// ---------- 1. acha nos dois lugares ----------
let s = roda('clone');
checa('acha a seção do GATE pelo título', /O clone pinado não se modifica/.test(s), s);
checa('e acha o commit pelo assunto', /decide que o clone nao se modifica/.test(s), s);

// ---------- 2. cita por titulo e por hash, e marca a linha como conveniencia ----------
checa('manda citar pelo título, não pelo número de linha',
  /cite pelo título; hoje está na linha \d+/.test(s), s);
checa('e traz o hash curto do commit', /^\s+[0-9a-f]{7,}\s+\d{4}-\d{2}-\d{2}\s/m.test(s), s);

// ---------- 3. LIMITE: nao casa o CORPO ----------
// "fetch" so aparece no corpo da secao. Um indice que o achasse estaria
// prometendo uma busca que ele nao faz.
s = roda('fetch');
checa('LIMITE: não casa o corpo da seção, só o título',
  /nenhuma seção com esse termo no título/.test(s), s);
checa('e diz onde procurar o corpo', /grep -n. no GATE ou .git log -S/.test(s), s);

// ---------- 4. sem termo, lista tudo ----------
s = roda();
checa('sem termo, lista as duas seções', /O clone pinado/.test(s) && /A régua de parada/.test(s), s);

// ---------- 5. LIMITE: cabecalho dentro de fence nao e secao ----------
checa('LIMITE: cabeçalho dentro de bloco de código não vira seção',
  !/isto é código/.test(s), s);

// ---------- 6. GATE ausente nao quebra ----------
roda = cenario({ commits: ['um commit'] });
s = roda('um');
checa('GATE ausente não derruba a ferramenta',
  /nenhuma seção/.test(s) && /um commit/.test(s), s);

// ---------- positivo plantado ----------
// Cegar a leitura do GATE: a ferramenta passa a achar so commits, e continua
// imprimindo uma saida de aparencia normal. E o modo de falhar que importa,
// porque "nao foi decidido" a partir de meia busca e pior que erro.
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a leitura das seções do GATE --');
  const fonte = fs.readFileSync(path.join(FERR, 'decisoes.js'), 'utf8');
  const alvo = 'const m = l.match(/^(#{1,2})\\s+(.*\\S)\\s*$/);';
  if (!fonte.includes(alvo)) {
    checa('achei o casamento de cabeçalho para cegar', false, 'o alvo da mutação não existe mais');
  } else {
    const cego = path.join(TMP, 'decisoes-cega.js');
    fs.writeFileSync(cego, fonte.replace(alvo, 'const m = null;'));
    const r2 = cenario({ gate: GATE, commits: ['decide que o clone nao se modifica'], ferramenta: cego });
    const c = r2('clone');
    checa('cega, ela diz que não há seção e mostra só o commit',
      /nenhuma seção com esse termo no título/.test(c) && /decide que o clone/.test(c), c);
  }
}

try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* .git preso no Windows */ }
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
