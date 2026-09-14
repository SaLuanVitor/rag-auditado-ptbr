// Teste do verificador de citacoes.
//
// E a ferramenta que mais roda no projeto, e a que pegou duas citacoes minhas
// quebradas em 14/09/2026. As propriedades a proteger:
//
//   1. OK quando arquivo existe e a linha cabe;
//   2. BAD_LINE quando a linha passa do fim do arquivo;
//   3. NOT_FOUND quando o arquivo citado nao existe;
//   4. BAD_ANCHOR quando um numero de linha solto nao cabe em nenhum arquivo
//      citado por perto;
//   5. NO_ANCHOR quando nao ha arquivo citado ANTES do numero;
//   6. a janela de ancoragem olha SO PARA TRAS. E a propriedade mais sutil e a
//      que me custou dois consertos: nomear o arquivo depois do numero nao
//      ancora nada;
//   7. o codigo de saida: 0 em PASS, 1 em FAIL. E o que o portao usa.
//
// O fixture replica a topologia real, porque a ferramenta resolve o clone por
// caminho relativo ao proprio arquivo: CURSO_ROOT e o pai de ferramentas/, e o
// clone e irmao dele. Testar com outra topologia testaria outra coisa.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ORIGEM = path.resolve(__dirname, '..', 'verify-citations.js');
const BASE = path.join(os.tmpdir(), 'vc-test-' + process.pid);
const CURSO = path.join(BASE, 'curso');
const CLONE = path.join(BASE, 'RAG-from-First-Principles');
let falhas = 0;

function monta(doc, ferramenta = ORIGEM) {
  fs.rmSync(BASE, { recursive: true, force: true });
  fs.mkdirSync(path.join(CURSO, 'ferramentas'), { recursive: true });
  fs.mkdirSync(path.join(CLONE, 'modulo'), { recursive: true });
  fs.copyFileSync(ferramenta, path.join(CURSO, 'ferramentas', 'vc.js'));
  // Fonte com 10 linhas exatas, para BAD_LINE ser inequívoco.
  fs.writeFileSync(path.join(CLONE, 'modulo', 'exemplo.py'),
    Array.from({ length: 10 }, (_, i) => `linha ${i + 1}`).join('\n') + '\n');
  fs.writeFileSync(path.join(CURSO, 'AULA-99-teste.md'), doc);
  return path.join(CURSO, 'ferramentas', 'vc.js');
}

function roda(vc) {
  try {
    const out = execFileSync(process.execPath, [vc, path.join(CURSO, 'AULA-99-teste.md')],
      { encoding: 'utf8', stdio: 'pipe' });
    return { rc: 0, out };
  } catch (e) {
    return { rc: e.status, out: (e.stdout || '') + (e.stderr || '') };
  }
}

function checa(nome, cond, detalhe) {
  if (cond) { console.log(`  ok    ${nome}`); return true; }
  console.log(`  FALHA ${nome}${detalhe ? '\n          -> ' + String(detalhe).trim().slice(0, 500) : ''}`);
  falhas++;
  return false;
}

// ---------- 1. OK e codigo de saida 0 ----------
let r = roda(monta('O trecho está em `modulo/exemplo.py:5`, no meio do arquivo.\n'));
checa('aceita citação cuja linha cabe no arquivo', /PASS/.test(r.out), r.out);
checa('sai com código 0 em PASS', r.rc === 0, 'rc=' + r.rc);

// ---------- 2. BAD_LINE e codigo de saida 1 ----------
r = roda(monta('O trecho está em `modulo/exemplo.py:999`, que não existe.\n'));
checa('acusa BAD_LINE quando a linha passa do fim', /BAD_LINE/.test(r.out) && /FAIL/.test(r.out), r.out);
checa('sai com código 1 em FAIL', r.rc === 1, 'rc=' + r.rc);

// ---------- 3. NOT_FOUND ----------
r = roda(monta('Veja `modulo/inexistente.py:3` para o detalhe.\n'));
checa('acusa NOT_FOUND quando o arquivo não existe', /NOT_FOUND/.test(r.out), r.out);

// ---------- 4. BAD_ANCHOR: numero solto que nao cabe no arquivo citado antes ----------
r = roda(monta('O `modulo/exemplo.py` faz o trabalho, e a linha 999 mostra como.\n'));
checa('acusa BAD_ANCHOR para linha solta que não cabe na janela', /BAD_ANCHOR/.test(r.out), r.out);

// ---------- 5. ancora para tras funciona ----------
r = roda(monta('O `modulo/exemplo.py` faz o trabalho, e a linha 7 mostra como.\n'));
checa('resolve linha solta contra arquivo citado ANTES', /PASS/.test(r.out) && r.rc === 0, r.out);

// ---------- 6. A PROPRIEDADE SUTIL: a janela NAO olha para frente ----------
r = roda(monta('A linha 7 mostra como, no `modulo/exemplo.py` que faz o trabalho.\n'));
checa('NÃO ancora em arquivo citado DEPOIS do número (janela só para trás)',
      /NO_ANCHOR/.test(r.out), r.out);
checa('e NO_ANCHOR não reprova o portão, porque é para conferir à mão',
      /PASS/.test(r.out) && r.rc === 0, 'rc=' + r.rc + ' | ' + r.out.slice(-120));

// ---------- 7. intervalo de linhas ----------
r = roda(monta('O bloco de `modulo/exemplo.py:3-8` resolve.\n'));
checa('aceita intervalo cujas duas pontas cabem', /PASS/.test(r.out), r.out);
r = roda(monta('O bloco de `modulo/exemplo.py:3-99` resolve.\n'));
checa('acusa intervalo cuja ponta final não cabe', /FAIL/.test(r.out), r.out);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a checagem de limite de linha --');
  const fonte = fs.readFileSync(ORIGEM, 'utf8');
  const cego = path.join(os.tmpdir(), 'vc-cego-' + process.pid + '.js');
  // A guarda de BAD_LINE vive em checkLine; neutralizo o status.
  const semGuarda = fonte.replace(/'BAD_LINE'/g, "'OK'");
  if (semGuarda === fonte) {
    console.log('  FALHA não achei o status BAD_LINE para cegar');
    falhas++;
  } else {
    fs.writeFileSync(cego, semGuarda);
    const vc = monta('O trecho está em `modulo/exemplo.py:999`, que não existe.\n', cego);
    const rc = roda(vc);
    checa('cego, ele aprova a citação fora de alcance (é isto que a suíte protege)',
          /PASS/.test(rc.out) && rc.rc === 0, rc.out);
    fs.rmSync(cego, { force: true });
  }
}

fs.rmSync(BASE, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
