// Enumerador de superficies de fecho, para as aulas que o diff tocou.
//
// NAO julga. So lista, e marca quais o diff ja alterou. O que sobra sem marca
// e a lista finita que a leitura precisa percorrer contra os consertos.
//
// Existe porque a alternativa automatica reprovou, medido em 2026-09-03: um
// juiz por sobreposicao de palavras da 98 pares com limiar 2 (ruido) e 0 com
// limiar 3 mais hedge (cego -- validado contra um positivo plantado, o
// Checkpoint 9 da AULA-27, que ele nao pegou). O sinal nao e lexical.
const { execSync } = require('child_process');
const fs = require('fs');

// Aceita um intervalo do git como argumento; sem ele, usa o diff de trabalho.
const faixa = process.argv[2] ? process.argv[2] + ' ' : '';
const diff = execSync('git diff -U0 ' + faixa, { maxBuffer: 64 * 1024 * 1024 }).toString();
const tocadas = new Map();
let arq = null;
for (const l of diff.split('\n')) {
  if (l.startsWith('+++ b/')) { arq = l.slice(6).trim(); tocadas.set(arq, new Set()); continue; }
  if (!arq) continue;
  if ((l.startsWith('+') && !l.startsWith('+++')) || (l.startsWith('-') && !l.startsWith('---'))) {
    tocadas.get(arq).add(l.slice(1).trim());
  }
}

const CLASSES = [
  ['Checkpoint', (l) => /^\d+\.\s/.test(l)],
  ['Titulo', (l) => /^\*\*[^*]{4,70}\.\*\*/.test(l)],
  ['Rodape', (l) => /^\*\*(Próxima|Anterior):\*\*/.test(l)],
  ['Tabela', (l) => /^\|/.test(l) && !/^\|[\s:|-]+\|/.test(l)],
];

for (const [a, mudou] of tocadas) {
  if (!a.endsWith('.md') || !a.startsWith('AULA-')) continue;
  const linhas = fs.readFileSync(a, 'utf8').split(/\r?\n/);
  const porClasse = new Map(CLASSES.map(([n]) => [n, { conferir: 0, mudadas: 0 }]));
  const conferir = [];
  linhas.forEach((raw, i) => {
    const l = raw.trim();
    if (l.length < 25) return;
    const cls = CLASSES.find(([, teste]) => teste(l));
    if (!cls) return;
    const c = porClasse.get(cls[0]);
    if (mudou.has(l)) { c.mudadas++; return; }
    c.conferir++;
    conferir.push(`  ${cls[0].padEnd(10)} :${i + 1}  ${l.slice(0, 92)}`);
  });
  const soma = [...porClasse].map(([n, c]) => `${n} ${c.conferir}/${c.conferir + c.mudadas}`).join(' · ');
  console.log(`\n${a}`);
  console.log(`  ${soma}   (a conferir / total)`);
  conferir.forEach((l) => console.log(l));
}
