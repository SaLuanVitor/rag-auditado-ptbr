// Teste do verificador de residuo.
//
// A propriedade que importa: um trecho apagado num arquivo e que SOBREVIVE em
// outro e residuo, e tem de aparecer. Foi essa classe que custou o dia 14/09,
// quando o "12 GB que nao somem" sobreviveu na AULA-28 depois de a AULA-27
// deixar de dizer isso.
//
// O teste monta um repositorio git de verdade em temporario, porque a
// ferramenta le `git diff` e `git ls-files`: testar so a funcao pura deixaria
// a analise do diff sem cobertura, e e ali que mora o parsing frágil.
//
// `--provar` planta um defeito na logica central e exige que a suite o pegue.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const RAIZ = path.join(os.tmpdir(), 'residuo-test-' + process.pid);
let falhas = 0;

const git = (...args) => execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', stdio: 'pipe' });

// Monta um repo com os arquivos commitados, depois aplica as mudancas de
// trabalho. A ferramenta le o diff entre os dois estados.
function monta(commitado, trabalho) {
  fs.rmSync(RAIZ, { recursive: true, force: true });
  fs.mkdirSync(RAIZ, { recursive: true });
  git('init', '-q');
  git('config', 'user.email', 'teste@local');
  git('config', 'user.name', 'teste');
  for (const [n, c] of Object.entries(commitado)) fs.writeFileSync(path.join(RAIZ, n), c);
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  for (const [n, c] of Object.entries(trabalho)) fs.writeFileSync(path.join(RAIZ, n), c);
}

function roda(ferramenta) {
  try {
    return execFileSync(process.execPath, [ferramenta], { cwd: RAIZ, encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

function checa(nome, condicao, detalhe) {
  if (condicao) { console.log(`  ok    ${nome}`); return true; }
  console.log(`  FALHA ${nome}${detalhe ? '\n          -> ' + String(detalhe).trim().slice(0, 220) : ''}`);
  falhas++;
  return false;
}

const LONGA = 'Esta é uma frase suficientemente longa para passar do limiar de quarenta caracteres.';
const CURTA = 'frase curta demais';

// ---------- 1. apagado e nao sobrevive: limpo ----------
monta({ 'a.md': `abertura\n${LONGA}\nfecho\n` }, { 'a.md': 'abertura\nfecho\n' });
let s = roda(path.join(FERR, 'residuo.js'));
checa('não acusa quando o trecho apagado não sobrevive', /Nenhum residuo/.test(s), s);

// ---------- 2. sobrevive em OUTRO arquivo: o caso que motivou a ferramenta ----------
monta({ 'a.md': `abertura\n${LONGA}\nfecho\n`, 'b.md': `outro doc\n${LONGA}\n` },
       { 'a.md': 'abertura\nfecho\n', 'b.md': `outro doc\n${LONGA}\n` });
s = roda(path.join(FERR, 'residuo.js'));
checa('acusa quando o trecho sobrevive em outro arquivo', /OUTRO ARQUIVO/.test(s), s);
checa('nomeia o arquivo de origem e o de destino', /removido de a\.md/.test(s) && /sobrevive em b\.md/.test(s), s);

// ---------- 3. sobrevive no mesmo arquivo: reflow, marcado diferente ----------
monta({ 'a.md': `abertura\n${LONGA}\nfecho\n` }, { 'a.md': `abertura\nfecho\n${LONGA} E mais.\n` });
s = roda(path.join(FERR, 'residuo.js'));
checa('distingue sobrevivência no mesmo arquivo', /\[mesmo arquivo\]/.test(s) && !/OUTRO ARQUIVO/.test(s), s);

// ---------- 4. o limiar: trecho curto que sobrevive nao vira ruido ----------
monta({ 'a.md': `abertura\n${CURTA}\nfecho\n`, 'b.md': `${CURTA}\n` },
       { 'a.md': 'abertura\nfecho\n', 'b.md': `${CURTA}\n` });
s = roda(path.join(FERR, 'residuo.js'));
checa('ignora trecho abaixo do limiar de 40 caracteres', /Nenhum residuo/.test(s), s);

// ---------- 5. so olha .md ----------
monta({ 'a.md': `abertura\n${LONGA}\nfecho\n`, 'b.txt': `${LONGA}\n` },
       { 'a.md': 'abertura\nfecho\n', 'b.txt': `${LONGA}\n` });
s = roda(path.join(FERR, 'residuo.js'));
checa('não procura fora dos .md rastreados', /Nenhum residuo/.test(s), s);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a busca do residuo.js --');
  const fonte = fs.readFileSync(path.join(FERR, 'residuo.js'), 'utf8');
  const cego = path.join(os.tmpdir(), 'residuo-cego-' + process.pid + '.js');
  const semBusca = fonte.replace('if (!c.includes(txt)) continue;', 'continue;');
  if (semBusca === fonte) {
    console.log('  FALHA não achei a linha de busca para cegar');
    falhas++;
  } else {
    fs.writeFileSync(cego, semBusca);
    monta({ 'a.md': `abertura\n${LONGA}\nfecho\n`, 'b.md': `outro\n${LONGA}\n` },
           { 'a.md': 'abertura\nfecho\n', 'b.md': `outro\n${LONGA}\n` });
    const sc = roda(cego);
    checa('cego, ele deixa de achar o resíduo entre arquivos', /Nenhum residuo/.test(sc), sc);
    fs.rmSync(cego, { force: true });
  }
}

fs.rmSync(RAIZ, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
