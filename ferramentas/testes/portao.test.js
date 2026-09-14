// Teste do contador do portao.
//
// A propriedade que importa: a nota vigente de uma aula e a ULTIMA gravada, e
// nao a primeira nem a maior. O GATE cresce por acrescimo, uma secao por rodada,
// e uma aula remedida aparece varias vezes. Um contador que pegasse a primeira
// ocorrencia devolveria o estado de tres rodadas atras com cara de atual, e
// ninguem perceberia: o numero sai plausivel.
//
// A segunda propriedade: DESCONHECIDO NAO E ZERO. Aula sem tabela por dimensao
// nao conta como livre de -1, a menos que a aritmetica a livre (nota 10 ou mais,
// porque com um -1 o teto e 5x2 + (-1) = 9).
//
// `--provar` cega a regra da ultima ocorrencia e exige que a suite pegue.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'portao-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

// Monta um GATE de mentira com as 29 aulas, para o contador nao reclamar de
// aula sem nota, e deixa o chamador sobrescrever o que quiser.
function gate(extra = '', notaPadrao = 8) {
  let s = '# GATE de teste\n\n| Aula | Nota |\n| --- | --- |\n';
  for (let i = 0; i < 29; i++) {
    const k = String(i).padStart(2, '0');
    s += `| [${k}](../AULA-${k}-x.md) | **${notaPadrao}**/12 | nada |\n`;
  }
  return s + '\n' + extra;
}

function roda(conteudo, ferramenta) {
  const arq = path.join(TMP, 'g-' + Math.random().toString(36).slice(2) + '.md');
  fs.writeFileSync(arq, conteudo, 'utf8');
  const r = spawnSync('node', [ferramenta || path.join(FERR, 'portao.js'), arq], { encoding: 'utf8' });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}

// ---------- 1. a ultima ocorrencia e que vale ----------
const REMEDIDA = '| [07](../AULA-07-x.md) | 8/12 | **3**/12 | 1 | 0 | 0 | 1 | 1 | 0 | caiu |\n';
let r = roda(gate(REMEDIDA));
// 29 aulas a 8 = 232; a 07 e remedida para 3, entao 232 - 8 + 3 = 227.
checa('usa a ultima nota gravada, nao a primeira', /Soma: 227\/348/.test(r.saida), r.saida.split('\n').slice(0, 8).join('\n'));
checa('e a conta a como abaixo do portao', /1 abaixo: 07\(3\)/.test(r.saida), r.saida);

// ---------- 2. desconhecido nao e zero ----------
r = roda(gate());
checa('sem tabela por dimensao, nenhuma aula e dada como livre de -1',
      /medidas por dimensao: 0/.test(r.saida) && /DESCONHECIDAS: 29/.test(r.saida), r.saida);
checa('e o veredito do criterio 2 fica inconclusivo', /INCONCLUSIVO/.test(r.saida), r.saida);

// ---------- 3. nota 10 ou mais livra por aritmetica ----------
r = roda(gate('', 10));
checa('nota 10 livra de -1 sem tabela por dimensao',
      /aritmetica \(nota >= 10\): 29/.test(r.saida) && /DESCONHECIDAS: 0/.test(r.saida), r.saida);

// ---------- 4. o -1 e contado da tabela por dimensao ----------
const COM_MENOS = `| [09](../AULA-09-x.md) | 5/12 | **2**/12 | 1 | −1 | 1 | 0 | 1 | 0 | com -1 |\n`;
r = roda(gate(COM_MENOS));
checa('conta o -1 escrito com o sinal de menos da rubrica', /-1 contados: 1/.test(r.saida), r.saida);
checa('e o marca na aula', /09\(1x -1\)/.test(r.saida), r.saida);

// ---------- 5. dois -1 reprovam o criterio 2 ----------
const DOIS = COM_MENOS + `| [11](../AULA-11-x.md) | 5/12 | **2**/12 | 1 | −1 | 1 | 0 | 1 | 0 | outro |\n`;
r = roda(gate(DOIS));
checa('dois -1 reprovam o criterio 2', /-1 contados: 2/.test(r.saida) && /veredito: REPROVA/.test(r.saida), r.saida);

// ---------- 6. dimensoes que nao somam o total sao denunciadas ----------
const TORTA = `| [09](../AULA-09-x.md) | 5/12 | **9**/12 | 1 | 1 | 1 | 1 | 1 | 1 | soma 6, nao 9 |\n`;
r = roda(gate(TORTA));
checa('denuncia dimensoes que nao somam o total gravado', /DIVERGENCIA/.test(r.saida), r.saida);

// ---------- 6b. o numero de colunas antes da nota varia por rodada ----------
// A oitava rodada gravava "| aula | R6 | nota | dims |", uma coluna intermediaria.
// A S6 grava "| aula | R6 | R8 | nota | dims |", tres. A regra antiga exigia
// exatamente uma, entao duas aulas ficaram DESCONHECIDAS com as seis dimensoes
// gravadas logo ali ao lado, e o criterio 2 media menos do que o arquivo trazia.
const TRES_COLUNAS = '| [11](../AULA-11-x.md) | 9/12 | 5/12 | **7**/12 | 2 | 1 | 1 | 1 | 1 | 1 | tres colunas antes |\n';
r = roda(gate(TRES_COLUNAS));
checa('le as dimensoes com tres colunas antes da nota',
  /medidas por dimensao: 1 -> 11\b/.test(r.saida), r.saida);
checa('e nao a deixa entre as DESCONHECIDAS', !/DESCONHECIDAS:[^\n]*\b11=/.test(r.saida), r.saida);

// ---------- 7. aula sem nota fecha o portao ----------
r = roda('# vazio\n');
checa('aula sem nota gravada fecha o portao', r.code === 1 && /SEM NOTA/.test(r.saida), r.saida);

// ---------- 8. portao aberto quando tudo passa ----------
r = roda(gate('', 10));
checa('portao ABERTO com as 29 acima do minimo e sem -1', r.code === 0 && /PORTAO: ABERTO/.test(r.saida), r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a regra da ultima ocorrencia --');
  const fonte = fs.readFileSync(path.join(FERR, 'portao.js'), 'utf8');
  // A regra da ultima ocorrencia vive na SOBRESCRITA do Map, uma linha por vez,
  // e nao no n[n.length-1]: dentro de uma linha so a nota nova vem em negrito.
  // Mutar o indice do array seria no-op, e foi o que eu tentei primeiro.
  const alvo = 'if (n.length) notas.set(m[1], n[n.length - 1]);';
  const cego = path.join(TMP, 'portao-cego.js');
  if (!fonte.includes(alvo)) {
    checa('achei a regra para cegar', false, 'o alvo da mutacao nao existe mais');
  } else {
    fs.writeFileSync(cego, fonte.replace(alvo,
      'if (n.length && !notas.has(m[1])) notas.set(m[1], n[n.length - 1]);'));
    const c = roda(gate(REMEDIDA), cego);
    checa('cego, ele devolve a nota velha e a reprovacao some',
          /Soma: 232\/348/.test(c.saida) && !/1 abaixo/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
