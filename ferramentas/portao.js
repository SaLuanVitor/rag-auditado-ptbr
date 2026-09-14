// Reconta o portao a partir do que esta GRAVADO no GATE.
//
// A regra da casa e nao confiar em resumo de cobertura: conta-se a nota
// registrada. Este script existe porque a contagem ja circulou errada mais de
// uma vez nesta auditoria, e porque somar de cabeca ao longo de uma rodada de
// doze aulas e como o erro entra.
//
// Os dois criterios eliminatorios:
//   1. nenhuma aula abaixo de 6/12
//   2. no maximo um -1 no curso inteiro
//
// O segundo so e contavel onde a tabela por dimensao foi gravada. Onde nao foi,
// a aula entra como DESCONHECIDA, e desconhecido nao e zero. A excecao e
// aritmetica: com um -1 o teto de uma aula e 5x2 + (-1) = 9, entao nota 10 ou
// mais prova ausencia de -1 sem precisar das dimensoes.
//
// Uso: node ferramentas/portao.js [caminho/do/GATE.md]
const fs = require('fs');
const path = require('path');

const GATE = process.argv[2] ||
  path.join(__dirname, '..', 'avaliacao', 'GATE-AULAS-v1.md');
const txt = fs.readFileSync(GATE, 'utf8');
const MENOS = String.fromCharCode(0x2212); // o sinal de menos da rubrica, nao o hifen
const TOTAL_AULAS = 29;

// A ultima nota gravada de cada aula e a vigente: as rodadas sao acrescentadas
// ao fim do arquivo, e dentro de uma linha a coluna nova vem depois da antiga.
const notas = new Map();
for (const m of txt.matchAll(/^\|\s*\[(\d{2})\]\(\.\.\/AULA-[^)]+\)\s*\|(.*)$/gm)) {
  const n = [...m[2].matchAll(/\*\*(-?\d{1,2})\*\*\s*\/\s*12/g)].map((x) => Number(x[1]));
  if (n.length) notas.set(m[1], n[n.length - 1]);
}

// Linha que traz as seis dimensoes logo depois da nota.
//
// O numero de colunas ANTES da nota varia por rodada: a oitava trazia so a R6,
// a S6 traz R6, R8 e S6. A versao anterior desta regra exigia exatamente uma
// coluna intermediaria, entao as tabelas da S6 nao alimentavam o criterio 2 e
// duas aulas ficavam DESCONHECIDAS com as seis dimensoes gravadas logo ali.
// Agora a ancora e a ULTIMA nota em negrito da linha, e as seis dimensoes tem
// de vir imediatamente depois dela.
const dim = new Map();
const reLinha = /^\|\s*\[(\d{2})\]\(\.\.\/AULA-[^)]+\)\s*\|(.*)$/gm;
const reCauda = /\*\*(-?\d{1,2})\*\*\s*\/\s*12\s*\|((?:\s*[-−]?\d\s*\|){6})/g;
for (const m of txt.matchAll(reLinha)) {
  const caudas = [...m[2].matchAll(reCauda)];
  if (!caudas.length) continue;
  const c = caudas[caudas.length - 1];
  const vals = c[2].split('|').map((s) => s.trim()).filter(Boolean)
                   .map((s) => Number(s.replace(MENOS, '-')));
  dim.set(m[1], { total: Number(c[1]), vals });
}

const aulas = [...notas.keys()].sort();
const semNota = [];
for (let i = 0; i < TOTAL_AULAS; i++) {
  const k = String(i).padStart(2, '0');
  if (!notas.has(k)) semNota.push(k);
}

let soma = 0;
const abaixo = [];
for (const a of aulas) { soma += notas.get(a); if (notas.get(a) < 6) abaixo.push(`${a}(${notas.get(a)})`); }

let menosUm = 0;
const medidas = [], aritmetica = [], desconhecidas = [], divergentes = [];
for (const a of aulas) {
  const d = dim.get(a);
  if (d) {
    // Autoconferencia: se as seis nao somam o total, uma das duas esta errada.
    if (d.vals.reduce((x, y) => x + y, 0) !== d.total) divergentes.push(a);
    const n = d.vals.filter((v) => v < 0).length;
    menosUm += n;
    medidas.push(n ? `${a}(${n}x -1)` : a);
  } else if (notas.get(a) >= 10) aritmetica.push(a);
  else desconhecidas.push(`${a}=${notas.get(a)}`);
}

console.log(`GATE: ${GATE}`);
console.log(`\nNotas gravadas: ${aulas.length} de ${TOTAL_AULAS}`);
if (semNota.length) console.log(`  SEM NOTA: ${semNota.join(', ')}`);
if (divergentes.length) console.log(`  DIVERGENCIA dimensoes x total: ${divergentes.join(', ')}`);
console.log(`Soma: ${soma}/${TOTAL_AULAS * 12}  (${(100 * soma / (TOTAL_AULAS * 12)).toFixed(1)}%)`);

console.log(`\nCriterio 1, nenhuma abaixo de 6/12: ${abaixo.length ? 'REPROVA' : 'PASSA'}`);
if (abaixo.length) console.log(`  ${abaixo.length} abaixo: ${abaixo.join(' ')}`);

console.log(`\nCriterio 2, no maximo um -1:`);
console.log(`  medidas por dimensao: ${medidas.length} -> ${medidas.join(' ')}`);
console.log(`  livres por aritmetica (nota >= 10): ${aritmetica.length}${aritmetica.length ? ' -> ' + aritmetica.join(' ') : ''}`);
console.log(`  DESCONHECIDAS: ${desconhecidas.length}${desconhecidas.length ? ' -> ' + desconhecidas.join(' ') : ''}`);
console.log(`  -1 contados: ${menosUm}`);
console.log(`  veredito: ${menosUm > 1 ? 'REPROVA' : desconhecidas.length ? 'PASSA no que foi medido, INCONCLUSIVO no resto' : 'PASSA'}`);

const reprova = abaixo.length > 0 || menosUm > 1 || semNota.length > 0;
console.log(`\nPORTAO: ${reprova ? 'FECHADO' : 'ABERTO'}`);
process.exit(reprova ? 1 : 0);
