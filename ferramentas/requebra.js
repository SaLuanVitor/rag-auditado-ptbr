// Requebra paragrafos de prosa a <=100 colunas, provando que a sequencia de
// palavras nao mudou. Sem essa prova, requebrar e onde a cauda que cola nasce.
const fs = require('fs');
const alvo = process.argv[2], LIM = 100;
const bruto = fs.readFileSync(alvo, 'utf8');
const crlf = bruto.includes('\r\n');
const linhas = bruto.split(/\r?\n/);

const prosa = (l) => l.length > 0 && !/^[|>#\-*+\d\s]/.test(l) && !l.startsWith('```')
                     && !/^\s{2,}/.test(l) && !l.startsWith('⚠');

// Delimita paragrafos: blocos contiguos de linhas nao vazias fora de fence.
let dentroFence = false, blocos = [], atual = null;
linhas.forEach((l, i) => {
  if (l.trimStart().startsWith('```')) { dentroFence = !dentroFence; atual = null; return; }
  if (dentroFence || l.trim() === '') { atual = null; return; }
  if (!atual) { atual = { ini: i, fim: i }; blocos.push(atual); } else atual.fim = i;
});

const alvos = blocos.filter(b => {
  const ls = linhas.slice(b.ini, b.fim + 1);
  if (!ls.every(prosa)) return false;
  if (ls.some(l => l.length > 108)) return true;
  // A quebra orfa: linha curta no MEIO de um paragrafo largo. E a assinatura de
  // texto inserido sem requebrar o paragrafo em volta, e o diff dela parece
  // cosmetico do mesmo jeito que o da linha longa. A ultima linha fica de fora
  // porque toda ultima linha de paragrafo e curta por construcao.
  const mx = Math.max(...ls.map((l) => l.length));
  return mx > 90 && ls.slice(0, -1).some((l) => l.length < 75);
});

let mudou = 0;
for (const b of alvos) {
  const orig = linhas.slice(b.ini, b.fim + 1);
  const palavras = orig.join(' ').split(/\s+/).filter(Boolean);
  const novas = [];
  let linha = '';
  for (const p of palavras) {
    if (linha === '') linha = p;
    else if ((linha + ' ' + p).length <= LIM) linha += ' ' + p;
    else { novas.push(linha); linha = p; }
  }
  if (linha) novas.push(linha);

  const antes = palavras.join('\u0001');
  const depois = novas.join(' ').split(/\s+/).filter(Boolean).join('\u0001');
  if (antes !== depois) {
    console.error(`ABORTADO: sequencia de palavras mudou no bloco da linha ${b.ini + 1}`);
    process.exit(1);
  }
  if (novas.join('\n') !== orig.join('\n')) {
    linhas.splice(b.ini, orig.length, ...novas);
    // Reindexa os blocos seguintes.
    const delta = novas.length - orig.length;
    for (const o of alvos) if (o.ini > b.ini) { o.ini += delta; o.fim += delta; }
    mudou++;
  }
}

if (!mudou) { console.log('Nada a requebrar.'); process.exit(0); }
fs.writeFileSync(alvo, linhas.join(crlf ? '\r\n' : '\n'), 'utf8');
console.log(`${mudou} paragrafo(s) requebrado(s); sequencia de palavras identica em todos.`);
