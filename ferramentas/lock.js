// Trava de casamento unico para edicao em lote.
//
// Valida TODAS as ancoras antes de escrever QUALQUER uma. Se alguma nao casar
// exatamente uma vez, aborta sem tocar em disco. Isso e o que transforma erro
// silencioso em erro visivel: o colapso de contrabarra do heredoc (`\` vira
// `\`) foi pego por ela tres vezes em 03/09, sempre como `casou 0x`.
//
// Vive aqui, e nao no scratchpad, porque o scratchpad e limpo durante a sessao
// sem aviso. Medido em 14/09: 17 scripts e o venv do curso desapareceram.
//
// Uso:
//   const aplicar = require('./ferramentas/lock.js');
//   aplicar(raiz, [[arquivo, de, para], ...], 'rotulo do lote');
const fs = require('fs');
const path = require('path');

const eol = (c) => (c.includes('\r\n') ? '\r\n' : '\n');
const adapta = (s, fim) => s.split('\n').join(fim);

module.exports = function aplicar(raiz, edicoes, rotulo) {
  const cache = new Map();
  const erros = [];

  // Passe 1: valida tudo, escreve nada.
  for (const [arq, de] of edicoes) {
    const p = path.join(raiz, arq);
    if (!cache.has(p)) cache.set(p, fs.readFileSync(p, 'utf8'));
    const c = cache.get(p);
    const n = c.split(adapta(de, eol(c))).length - 1;
    if (n !== 1) erros.push(`${arq}: casou ${n}x -> ${JSON.stringify(de.slice(0, 60))}`);
  }
  if (erros.length) {
    console.error('ABORTADO - nada escrito:');
    erros.forEach((e) => console.error('  ' + e));
    process.exit(1);
  }

  // Passe 2: aplica.
  for (const [arq, de, para] of edicoes) {
    const p = path.join(raiz, arq);
    const fim = eol(cache.get(p));
    cache.set(p, cache.get(p).split(adapta(de, fim)).join(adapta(para, fim)));
  }
  for (const [p, c] of cache) fs.writeFileSync(p, c);
  console.log(`${edicoes.length} consertos (${rotulo}).`);
};
