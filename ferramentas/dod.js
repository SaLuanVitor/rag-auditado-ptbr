// DoD: as dez condicoes, uma a uma, com o comando que decide cada uma.
//
// E a capacidade de ESTADO na forma que este projeto precisava, e a razao de ela
// existir foi medida em 15/09/2026, no pior defeito do dia: eu declarei cumprida
// a condicao que diz "o HANDOFF E O PROMPT-CONTINUAR descrevem o estado medido"
// tendo aberto UM dos dois arquivos que ela nomeia. Julguei o conjunto em vez de
// ler o criterio item a item.
//
// Este script nao deixa julgar o conjunto: ele imprime dez linhas.
//
// A DECISAO DE DESENHO QUE IMPORTA, e ela e o oposto de um portao verde:
//
//   Nem toda condicao e decidivel por maquina. A decima e leitura humana, porque
//   "descreve o estado medido" exige comparar prosa com o mundo. Um script que
//   imprimisse 10/10 estaria fazendo exatamente o que eu fiz: dar por cumprida
//   uma condicao que ninguem conferiu.
//
//   Entao ele separa DECIDIDAS de PENDENTE DE LEITURA, e o veredito final diz as
//   duas coisas. Zero reprovando com uma pendente de leitura NAO e "pronto": e
//   "a maquina fez a parte dela".
//
// Uso:
//   node ferramentas/dod.js            todas as condicoes
//   node ferramentas/dod.js --rapido   pula a suite, que e a mais lenta
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const GATE = path.join(RAIZ, 'avaliacao', 'GATE-AULAS-v1.md');
const rapido = process.argv.includes('--rapido');

function roda(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', cwd: RAIZ });
  return { code: r.status, saida: (r.stdout || '') + (r.stderr || '') };
}
const node = (rel, ...a) => roda(process.execPath, [path.join('ferramentas', rel), ...a]);

// A condicao 4 nao se decide rodando nada: ela pergunta se a PARADA esta
// registrada. O discriminante e a secao do GATE que traz o pior achado da ultima
// passada, e o marcador e o titulo dela.
function reguaRegistrada() {
  if (!fs.existsSync(GATE)) return { ok: false, nota: 'GATE ausente' };
  const t = fs.readFileSync(GATE, 'utf8');
  const tem = /Onde esta rodada para, e por qu/.test(t);
  return { ok: tem, nota: tem ? 'a seção da régua está no GATE' : 'a seção da régua não está no GATE' };
}

const CONDICOES = [
  { n: 1, texto: 'Nenhuma aula abaixo de 6/12', decide: () => {
      const r = node('portao.js');
      return { ok: /Criterio 1[^\n]*PASSA/.test(r.saida), nota: 'node ferramentas/portao.js' };
    } },
  { n: 2, texto: 'No máximo uma nota -1 no curso', decide: () => {
      const r = node('portao.js');
      const semDesconhecida = /DESCONHECIDAS: 0/.test(r.saida);
      return {
        ok: /veredito: PASSA/.test(r.saida) && semDesconhecida,
        nota: semDesconhecida ? 'zero desconhecidas' : 'HA DESCONHECIDAS: desconhecido nao e zero',
      };
    } },
  { n: 3, texto: 'Percentual apurado numa rodada completa das 29', decide: () => {
      const r = node('portao.js');
      const m = r.saida.match(/Notas gravadas: (\d+) de (\d+)/);
      return { ok: !!m && m[1] === m[2], nota: m ? `${m[1]} de ${m[2]}` : 'nao consegui ler a cobertura' };
    } },
  { n: 4, texto: 'Último lote verificado, OU parada pela régua registrada', decide: reguaRegistrada },
  { n: 5, texto: 'Citações contra a fonte válidas', decide: () => {
      const r = node('verify-citations.js', '--all');
      return { ok: r.code === 0 && /PASS/.test(r.saida), nota: 'verify-citations.js --all' };
    } },
  { n: 6, texto: 'Citação de linha entre aulas válida', decide: () => {
      const r = node('entreaulas.js');
      return { ok: r.code === 0, nota: 'entreaulas.js' };
    } },
  { n: 7, texto: 'Sem resíduo verbatim', decide: () => {
      const r = node('residuo.js');
      return { ok: r.code === 0, nota: 'residuo.js' };
    } },
  { n: 8, texto: 'Ambiente reprodutível', decide: () => {
      const p = path.join(RAIZ, 'ferramentas', 'montar-ambiente.sh');
      if (!fs.existsSync(p)) return { ok: false, nota: 'montar-ambiente.sh ausente' };
      // Versionado, e nao so presente: arquivo solto no disco nao reconstroi nada
      // para quem clonar.
      const r = roda('git', ['ls-files', '--error-unmatch', 'ferramentas/montar-ambiente.sh']);
      return { ok: r.code === 0, nota: r.code === 0 ? 'script versionado' : 'script NAO versionado' };
    } },
  { n: 9, texto: 'Ferramentas com teste próprio e positivo plantado', decide: () => {
      if (rapido) return { pulada: true, nota: '--rapido: nao rodei a suite' };
      const r = roda('bash', ['ferramentas/testes/rodar.sh']);
      return { ok: r.code === 0 && /SUITE VERDE/.test(r.saida), nota: 'testes/rodar.sh' };
    } },
];

// A decima fica FORA da lista de propósito: misturá-la com as nove decidiveis é
// o que permite ler um "10/10" que ninguém conferiu.
const HUMANA = {
  n: 10,
  texto: 'HANDOFF e PROMPT-CONTINUAR descrevem o estado medido',
  como: 'Abrir OS DOIS e conferir cada número por comando. A condição nomeia dois arquivos.',
};

console.log('DoD do curso: dez condições, e a décima não é de máquina.\n');

let reprovando = 0, puladas = 0;
for (const c of CONDICOES) {
  const r = c.decide();
  if (r.pulada) {
    puladas++;
    console.log(`  [ -- ]  ${c.n}. ${c.texto}`);
    console.log(`          ${r.nota}`);
    continue;
  }
  if (!r.ok) reprovando++;
  console.log(`  [${r.ok ? ' ok ' : 'FALHA'}]  ${c.n}. ${c.texto}`);
  console.log(`          ${r.nota}`);
}

console.log(`\n  [ ?? ]  ${HUMANA.n}. ${HUMANA.texto}`);
console.log(`          NAO DECIDIVEL POR MAQUINA. ${HUMANA.como}`);
console.log('          Foi esta condicao que eu dei por cumprida sem abrir os dois arquivos.');

console.log('');
if (reprovando) {
  console.log(`DOD: ${reprovando} condição(ões) reprovando.`);
} else if (puladas) {
  console.log(`DOD: nenhuma reprovando, ${puladas} pulada(s), 1 pendente de leitura humana.`);
} else {
  console.log('DOD: as nove decidíveis por máquina passam. A décima continua pendente de leitura.');
}
console.log('Nove verdes NAO sao dez. A ultima e trabalho de ler, e nenhum verde a substitui.');
process.exit(reprovando ? 1 : 0);
