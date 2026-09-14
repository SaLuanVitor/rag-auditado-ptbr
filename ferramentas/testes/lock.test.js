// Teste da trava de casamento unico.
//
// A propriedade que importa nao e "aplica quando casa uma vez". E ATOMICIDADE:
// se QUALQUER ancora do lote falhar, NENHUM arquivo e tocado. Foi isso que
// impediu sete edicoes tortas em 14/09/2026, todas por colapso de contrabarra.
//
// Cada teste abaixo tem de FALHAR se a guarda `if (n !== 1)` for removida do
// lock.js. Rode `node ferramentas/testes/lock.test.js --provar` para plantar
// esse defeito e confirmar que a suite o pega.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(os.tmpdir(), 'lock-test-' + process.pid);
const LOCK = path.resolve(__dirname, '..', 'lock.js');
let falhas = 0;

function monta(arquivos) {
  fs.rmSync(RAIZ, { recursive: true, force: true });
  fs.mkdirSync(RAIZ, { recursive: true });
  for (const [nome, conteudo] of Object.entries(arquivos)) {
    fs.writeFileSync(path.join(RAIZ, nome), conteudo);
  }
}
const le = (nome) => fs.readFileSync(path.join(RAIZ, nome), 'utf8');

// Roda a trava num processo separado, porque ela chama process.exit no abort.
function aplica(edicoes, lock = LOCK) {
  const script = `require(${JSON.stringify(lock)})(${JSON.stringify(RAIZ)}, ${JSON.stringify(edicoes)}, 'teste');`;
  try {
    const saida = execFileSync(process.execPath, ['-e', script], { encoding: 'utf8', stdio: 'pipe' });
    return { ok: true, saida };
  } catch (e) {
    return { ok: false, saida: (e.stdout || '') + (e.stderr || '') };
  }
}

function checa(nome, condicao, detalhe) {
  if (condicao) { console.log(`  ok    ${nome}`); return true; }
  console.log(`  FALHA ${nome}${detalhe ? '  -> ' + detalhe : ''}`);
  falhas++;
  return false;
}

// ---------- 1. caso feliz ----------
monta({ 'a.md': 'alfa beta gama' });
let r = aplica([['a.md', 'beta', 'DELTA']]);
checa('aplica quando a âncora casa exatamente uma vez', r.ok && le('a.md') === 'alfa DELTA gama', le('a.md'));

// ---------- 2. zero casamentos aborta e nao escreve ----------
monta({ 'a.md': 'alfa beta gama' });
r = aplica([['a.md', 'ausente', 'X']]);
checa('aborta quando a âncora não casa', !r.ok);
checa('não escreve nada quando a âncora não casa', le('a.md') === 'alfa beta gama', le('a.md'));

// ---------- 3. dois casamentos abortam ----------
monta({ 'a.md': 'beta e beta' });
r = aplica([['a.md', 'beta', 'X']]);
checa('aborta quando a âncora casa duas vezes', !r.ok);
checa('não escreve nada quando a âncora é ambígua', le('a.md') === 'beta e beta', le('a.md'));

// ---------- 4. ATOMICIDADE: uma âncora ruim impede TODO o lote ----------
monta({ 'a.md': 'alfa beta', 'b.md': 'gama delta' });
r = aplica([['a.md', 'beta', 'X'], ['b.md', 'ausente', 'Y']]);
checa('aborta o lote inteiro se uma âncora falha', !r.ok);
checa('preserva o arquivo cuja âncora era válida', le('a.md') === 'alfa beta', le('a.md'));
checa('preserva o arquivo cuja âncora falhou', le('b.md') === 'gama delta', le('b.md'));

// ---------- 5. CRLF: a âncora escrita com \n casa em arquivo CRLF ----------
monta({ 'crlf.md': 'linha um\r\nlinha dois\r\nfim' });
r = aplica([['crlf.md', 'linha um\nlinha dois', 'UM\nDOIS']]);
checa('adapta a âncora ao fim de linha do arquivo', r.ok && le('crlf.md') === 'UM\r\nDOIS\r\nfim',
      JSON.stringify(le('crlf.md')));

// ---------- 6. o relatório nomeia o que falhou ----------
monta({ 'a.md': 'alfa' });
r = aplica([['a.md', 'inexistente', 'X']]);
checa('o abort diz quantas vezes casou', /casou 0x/.test(r.saida), r.saida.trim());

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: removendo a guarda do lock.js --');
  const fonte = fs.readFileSync(LOCK, 'utf8');
  // Fora de RAIZ de proposito: o monta() abaixo apaga RAIZ, e a primeira
  // versao deste teste gravava o lock cego la dentro. O proprio positivo
  // plantado pegou esse bug do teste.
  const cego = path.join(os.tmpdir(), 'lock-cego-' + process.pid + '.js');
  const semGuarda = fonte.replace('if (n !== 1) erros.push', 'if (false) erros.push');
  if (semGuarda === fonte) {
    console.log('  FALHA não achei a guarda para remover; o teste do teste não vale');
    falhas++;
  } else {
    fs.writeFileSync(cego, semGuarda);
    monta({ 'a.md': 'alfa beta', 'b.md': 'gama delta' });
    const rc = aplica([['a.md', 'beta', 'X'], ['b.md', 'ausente', 'Y']], cego);
    checa('sem a guarda, a atomicidade se perde (é isto que a suíte protege)',
          rc.ok && le('a.md') !== 'alfa beta',
          'o lock cego deveria ter escrito, e não escreveu');
  }
}

fs.rmSync(RAIZ, { recursive: true, force: true });
fs.rmSync(path.join(os.tmpdir(), 'lock-cego-' + process.pid + '.js'), { force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
