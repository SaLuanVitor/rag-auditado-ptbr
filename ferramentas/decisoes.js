// Decisoes: onde foi decidido, e por que.
//
// E a capacidade de LOCALIZACAO na forma que o plano de fechamento nomeou: "um
// indice de decisoes, hoje espalhadas em commits". Elas estao em dois lugares e
// nenhum deles se procura do mesmo jeito:
//
//   o GATE, em secoes com titulo, que e onde mora a RAZAO;
//   as mensagens de commit, que e onde mora a DATA e o que mudou junto.
//
// Sem isto, "onde foi decidido que o clone nao se modifica" custa um grep no
// GATE de quase cinco mil linhas mais um `git log --grep`, e quem nao sabe que
// sao dois lugares acha so metade.
//
// A ESCOLHA DE REFERENCIA, e ela vem da decima segunda forma de defeito:
//
//   secao do GATE se cita pelo TITULO, nunca pelo numero de linha, porque a
//   linha anda a cada secao acrescentada e o titulo nao;
//   commit se cita pelo HASH, que nao se move nunca.
//
// O numero de linha aparece so para voce abrir o arquivo agora, e vem marcado
// como o que e: conveniencia de hoje, nao referencia.
//
// Uso:
//   node ferramentas/decisoes.js               lista tudo
//   node ferramentas/decisoes.js "<termo>"     filtra por termo
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const GATE = path.join(RAIZ, 'avaliacao', 'GATE-AULAS-v1.md');

function secoesDoGate() {
  if (!fs.existsSync(GATE)) return [];
  const linhas = fs.readFileSync(GATE, 'utf8').split(/\r?\n/);
  const out = [];
  let fence = false;
  linhas.forEach((l, i) => {
    if (l.trimStart().startsWith('```')) { fence = !fence; return; }
    if (fence) return;
    const m = l.match(/^(#{1,2})\s+(.*\S)\s*$/);
    if (m) out.push({ nivel: m[1].length, titulo: m[2], linha: i + 1 });
  });
  return out;
}

function commits() {
  try {
    const saida = execFileSync('git', ['log', '--pretty=%h\t%ad\t%s', '--date=short'],
      { encoding: 'utf8', cwd: RAIZ, maxBuffer: 8 * 1024 * 1024 });
    return saida.split('\n').filter(Boolean).map((l) => {
      const [hash, data, ...resto] = l.split('\t');
      return { hash, data, assunto: resto.join('\t') };
    });
  } catch (e) {
    return null;
  }
}

const termo = process.argv.slice(2).join(' ').trim();
const casa = (s) => !termo || s.toLowerCase().includes(termo.toLowerCase());

const secs = secoesDoGate().filter((s) => casa(s.titulo));
const cs = commits();

console.log(termo ? `Decisões que casam "${termo}"\n` : 'Índice de decisões\n');

console.log(`== No GATE, onde mora a razão  (${secs.length})`);
if (!secs.length) console.log('   nenhuma seção com esse termo no título.');
for (const s of secs) {
  console.log(`   ${'  '.repeat(s.nivel - 1)}${s.titulo}`);
  console.log(`   ${'  '.repeat(s.nivel - 1)}  cite pelo título; hoje está na linha ${s.linha}`);
}

console.log('');
if (cs === null) {
  console.log('== Nos commits: NAO CONSULTADO. `git log` falhou, e ausência de resultado');
  console.log('   aqui não é ausência de decisão.');
} else {
  const filtrados = cs.filter((c) => casa(c.assunto));
  console.log(`== Nos commits, onde mora a data  (${filtrados.length} de ${cs.length})`);
  if (!filtrados.length) console.log('   nenhum commit com esse termo no assunto.');
  for (const c of filtrados.slice(0, 40)) {
    console.log(`   ${c.hash}  ${c.data}  ${c.assunto}`);
  }
  if (filtrados.length > 40) console.log(`   ... mais ${filtrados.length - 40}`);
}

console.log('');
console.log('Casa TITULO de seção e ASSUNTO de commit, não o corpo de nenhum dos dois.');
console.log('Para o corpo, `grep -n` no GATE ou `git log -S`. Para onde um fato MORA,');
console.log('`node ferramentas/superficies.js "<termo>"`.');
