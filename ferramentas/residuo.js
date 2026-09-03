// Verificador de residuo. Le o diff de trabalho, extrai os trechos REMOVIDOS e
// procura cada um no acervo inteiro. Um trecho que eu apaguei num lugar e que
// continua vivo em outro e residuo: ou a frase antiga sobreviveu ao conserto,
// ou eu passei a citar texto que nao existe mais.
//
// Nao decide semantica. Decide presenca, que e a classe medida como dominante
// na setima rodada: 3 das 4 aulas tiveram a nota travada por isso.
const { execSync } = require('child_process');
const fs = require('fs');

const MIN = 40;   // n-grama curto casa em prosa comum e enche de ruido
const raiz = process.cwd();
const diff = execSync('git diff -U0', { cwd: raiz, maxBuffer: 64 * 1024 * 1024 }).toString();

// Trechos removidos, por arquivo de origem.
const removidos = [];
let arquivo = null;
for (const linha of diff.split('\n')) {
  if (linha.startsWith('+++ b/')) { arquivo = linha.slice(6).trim(); continue; }
  if (!linha.startsWith('-') || linha.startsWith('---')) continue;
  const txt = linha.slice(1).trim();
  if (txt.length < MIN) continue;
  removidos.push({ arquivo, txt });
}

// Acervo: todos os .md rastreados.
const alvos = execSync('git ls-files "*.md"', { cwd: raiz }).toString().trim().split('\n');
const conteudo = new Map(alvos.map((a) => [a, fs.readFileSync(a, 'utf8')]));

// Uma linha removida pode ter sido apenas reflowada dentro do proprio arquivo.
// Residuo de verdade e o trecho que sobrevive em OUTRO lugar, ou que sobrevive
// no mesmo arquivo depois de eu ter dito que ele saiu. Reporto os dois, com a
// origem marcada, e deixo o julgamento para a leitura.
const achados = [];
for (const { arquivo: orig, txt } of removidos) {
  for (const [alvo, c] of conteudo) {
    if (!c.includes(txt)) continue;
    achados.push({ orig, alvo, txt, mesmo: orig === alvo });
  }
}

if (!achados.length) {
  console.log(`Nenhum residuo: ${removidos.length} trechos removidos (>=${MIN} chars), nenhum sobrevive no acervo.`);
  process.exit(0);
}
console.log(`${achados.length} residuo(s) em ${removidos.length} trechos removidos:\n`);
for (const a of achados) {
  console.log(`  ${a.mesmo ? '[mesmo arquivo]' : '[OUTRO ARQUIVO]'} removido de ${a.orig}`);
  console.log(`     sobrevive em ${a.alvo}`);
  console.log(`     "${a.txt.slice(0, 100)}${a.txt.length > 100 ? '...' : ''}"\n`);
}
