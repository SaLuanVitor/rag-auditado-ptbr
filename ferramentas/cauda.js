// Acha a cauda que cola: texto que se repete imediatamente depois de si mesmo.
//
// E a forma mais frequente de defeito desta auditoria, onze ocorrencias ate
// 14/09/2026. Ela nasce de ancorar uma substituicao num prefixo ou num final de
// frase: o resto da frase antiga fica colado no texto novo, e o resultado
// repete ou nega a si mesmo.
//
// A varredura anterior era um grep por palavra repetida
// (`\b([a-za-u]{4,}) \1\b`) e nao alcancava o caso real: em
// "que sao as abas -- que sao as abas do outro arquivo" nenhuma PALAVRA se
// repete lado a lado, e a oracao inteira se repete. Este script procura
// n-gramas, de 1 a 8 palavras, ignorando pontuacao entre as duas copias.
//
// E um ALERTA DE LEITURA, nao um veredito: repeticao pode ser deliberada.
// Medido em 14/09/2026 sobre as 29 aulas e o glossario, os dois unicos achados
// de duas palavras ou mais eram legitimos: "resumos de resumos" e o mecanismo do
// RAPTOR na AULA-23, e "Function calling / Tool calling / Tool use" e uma lista
// de sinonimos no GLOSSARIO. Um terceiro apareceu depois, na AULA-10:
// "- **Cronometrar so a media.** A media esconde a cauda" e o estilo de rotulo em
// negrito da casa, rotulo e prosa comecando igual. Leia antes de consertar.
//
// Uso: node ferramentas/cauda.js <arquivo.md> [...]
const fs = require('fs');

const K_MAX = 8;
// Palavra e o que tem ao menos uma letra ou digito. Pontuacao solta (travessao,
// virgula, parenteses) nao conta como palavra: e exatamente ela que separa as
// duas copias e que fazia a varredura por palavra perder o caso.
const ehPalavra = (t) => /[0-9A-Za-zÀ-ÿ]/.test(t);

// Compara ignorando caixa e pontuacao grudada, porque "abas," e "abas" sao a
// mesma palavra para efeito de cauda.
const chave = (t) => t.toLowerCase().replace(/[^0-9a-zà-ÿ]/g, '');

function achados(texto) {
  const brutos = texto.split(/\s+/).filter(Boolean);
  const idx = [];
  const ps = [];
  brutos.forEach((t, i) => { if (ehPalavra(t)) { ps.push(chave(t)); idx.push(i); } });

  const res = [];
  const cobertas = new Set();
  // Do maior para o menor: uma oracao repetida de 4 palavras nao deve ser
  // reportada tambem como quatro repeticoes de 1.
  for (let k = K_MAX; k >= 1; k--) {
    for (let i = 0; i + 2 * k <= ps.length; i++) {
      if (cobertas.has(i)) continue;
      let igual = true;
      for (let j = 0; j < k; j++) if (ps[i + j] !== ps[i + k + j]) { igual = false; break; }
      if (!igual) continue;
      // Uma palavra so, curta, e ruido: "que que", "a a". Identificador de
      // codigo repetido tambem: `generate` -> `generate` e uma aresta de grafo,
      // nao uma cauda.
      if (k === 1 && (ps[i].length < 4 || brutos[idx[i]].includes("`") || brutos[idx[i+1]].includes("`"))) continue;
      for (let j = 0; j < 2 * k; j++) cobertas.add(i + j);
      res.push({ k, trecho: brutos.slice(idx[i], idx[i + 2 * k - 1] + 1).join(' ') });
    }
  }
  return res;
}

const alvos = process.argv.slice(2);
if (!alvos.length) { console.error('uso: node ferramentas/cauda.js <arquivo.md> [...]'); process.exit(2); }

let total = 0;
for (const arq of alvos) {
  const linhas = fs.readFileSync(arq, 'utf8').split(/\r?\n/);
  let fence = false, ini = 0, buf = [];
  const fecha = () => {
    if (!buf.length) return;
    for (const a of achados(buf.join(' '))) {
      total++;
      console.log(`${arq}:${ini}  cauda de ${a.k} palavra(s)`);
      console.log(`    ${a.trecho}`);
    }
    buf = [];
  };
  linhas.forEach((l, n) => {
    if (l.trimStart().startsWith('```')) { fecha(); fence = !fence; return; }
    // Linha de tabela sai: celula vizinha repete de proposito, e uma coluna
    // uniforme e informacao, nao defeito. Medido no acervo: sem este filtro,
    // 38 achados, dos quais a maioria e tabela legitima.
    if (fence || l.trim() === '' || l.trimStart().startsWith('|')) { fecha(); return; }
    if (!buf.length) ini = n + 1;
    buf.push(l);
  });
  fecha();
}

console.log(total ? `\n${total} cauda(s).` : 'Nenhuma cauda.');
process.exit(total ? 1 : 0);
