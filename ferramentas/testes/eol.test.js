// Teste do normalizador de fim de linha.
//
// A propriedade que importa: normalizar NAO pode mudar o conteudo. E a mesma
// prova que o requebra.js faz sobre a sequencia de palavras, e pela mesma razao:
// ferramenta que reescreve arquivo inteiro precisa provar que so mexeu no que
// prometeu mexer.
//
// A segunda: arquivo coerente nao aparece. Um `.sh` todo em LF esta certo, e uma
// ferramenta que o "consertasse" para CRLF quebraria o shebang em alguns shells.
//
// `--provar` cega a deteccao e exige que a suite perceba.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'eol-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

let n = 0;
function escreve(conteudo) {
  const arq = path.join(TMP, 'e' + (++n) + '.md');
  fs.writeFileSync(arq, conteudo, 'utf8');
  return arq;
}
function roda(arq, args, ferramenta) {
  const r = spawnSync('node', [ferramenta || path.join(FERR, 'eol.js'), arq, ...(args || [])], { encoding: 'utf8' });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}
const le = (a) => fs.readFileSync(a, 'utf8');

// ---------- 1. o caso real, na forma em que ele apareceu ----------
const MISTO = 'veio do checkout\r\nveio do checkout\r\nveio do heredoc\nveio do heredoc\r\n';
let arq = escreve(MISTO);
let r = roda(arq);
checa('acha o arquivo misturado', r.code === 1 && /3 CRLF, 1 LF/.test(r.saida), r.saida);
checa('e nao escreve sem --gravar', le(arq) === MISTO, JSON.stringify(le(arq)));

// ---------- 2. com --gravar, normaliza para o dominante ----------
r = roda(arq, ['--gravar']);
checa('grava com --gravar', r.code === 0 && /normalizado para CRLF/.test(r.saida), r.saida);
checa('o resultado e todo CRLF', le(arq) === 'veio do checkout\r\nveio do checkout\r\nveio do heredoc\r\nveio do heredoc\r\n',
  JSON.stringify(le(arq)));
checa('e o conteudo nao mudou', le(arq).replace(/\r\n/g, '\n') === MISTO.replace(/\r\n/g, '\n'));

// ---------- 3. arquivo coerente nao aparece ----------
// Um .sh todo em LF esta certo. Se esta ferramenta o "consertasse" para CRLF,
// o shebang quebraria em alguns shells.
arq = escreve('#!/usr/bin/env bash\nset -u\necho ok\n');
r = roda(arq);
checa('nao toca arquivo todo em LF', r.code === 0 && /Nenhum arquivo/.test(r.saida), r.saida);

arq = escreve('tudo\r\nem\r\nCRLF\r\n');
r = roda(arq);
checa('nao toca arquivo todo em CRLF', r.code === 0 && /Nenhum arquivo/.test(r.saida), r.saida);

// ---------- 4. LF dominante puxa para LF, nao para CRLF ----------
// O alvo e o fim de linha do arquivo, nao o CRLF por decreto.
arq = escreve('a\nb\nc\nd\r\n');
r = roda(arq, ['--gravar']);
checa('normaliza para LF quando o LF domina', r.code === 0 && /normalizado para LF/.test(r.saida), r.saida);
checa('e o resultado nao tem CR', !le(arq).includes('\r'), JSON.stringify(le(arq)));

// ---------- 5. sem argumento, recusa ----------
r = spawnSync('node', [path.join(FERR, 'eol.js')], { encoding: 'utf8' });
checa('sem argumento, sai com codigo 2', r.status === 2, String(r.stderr).trim());

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a deteccao de mistura --');
  const fonte = fs.readFileSync(path.join(FERR, 'eol.js'), 'utf8');
  const alvo = 'if (crlf && lf) achados.push({ arq, crlf, lf, t });';
  const cego = path.join(TMP, 'eol-cego.js');
  if (!fonte.includes(alvo)) {
    checa('achei a deteccao para cegar', false, 'o alvo da mutacao nao existe mais');
  } else {
    fs.writeFileSync(cego, fonte.replace(alvo, ''));
    const a2 = escreve(MISTO);
    const c = roda(a2, [], cego);
    checa('cega, ela deixa de achar o arquivo misturado', c.code === 0 && /Nenhum arquivo/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
