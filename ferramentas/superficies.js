// Superficies: onde um fato mora, e quais delas TEM de concordar.
//
// E a forma minima da capacidade de "impacto" que o plano de fechamento
// descreve, e a razao de ela existir foi medida em 15/09/2026: num unico dia,
// SEIS defeitos nasceram do mesmo mecanismo, um fato consertado numa superficie
// e nao nas outras.
//
//   "duas ferramentas" na definicao do agente, sobre uma tabela de quatro;
//   "tres documentos vivos" no GATE, uma hora depois de virarem cinco;
//   "consequencia nao medida" no GATE, no agente e no artefato, medida no meio;
//   "duas ferramentas" tambem no README, e la desde agosto;
//   "1638 OK" no PROMPT-CONTINUAR, tres rodadas atras;
//   "disjuntas" no titulo de uma secao cujo corpo dizia "disjuntos".
//
// O `fechos.js` enumera superficie de fecho DENTRO de um arquivo. Este enumera
// arquivos ATRAVES do acervo. Sao complementares e nenhum substitui o outro.
//
// A DISTINCAO QUE FAZ A FERRAMENTA VALER, e sem ela ela viraria um `grep -l`:
//
//   VIVA      aula, README, HANDOFF, PROMPT-CONTINUAR, GLOSSARIO, definicao do
//             agente. Descrevem o estado ATUAL, entao divergencia entre elas e
//             defeito e TEM de ser reconciliada.
//   REGISTRO  `avaliacao/`. Cita o estado do dia em que mediu, entao divergencia
//             ali esta CERTA. Consertar registro para bater com o presente
//             destroi a historia, e e por isso que estas linhas saem separadas e
//             marcadas "nao toque".
//
// O QUE ELE NAO FAZ:
//
//   Nao acha CONCEITO, acha TERMO. Parafrase escapa, e foi assim que a leitura
//   antiga sobreviveu em prosa a 23 linhas da celula corrigida. Depois de usar
//   esta ferramenta, a busca por sinonimo continua sendo trabalho de leitura.
//
//   NAO ALCANCA O ARTEFATO DO PLANO, que mora fora do repositorio e foi
//   justamente a superficie esquecida tres vezes no dia que originou isto. A
//   quarta superficie continua sendo responsabilidade humana.
//
// Uso: node ferramentas/superficies.js "<termo>" ["<termo>" ...]
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

const VIVAS = [
  { dir: '.', re: /^AULA-\d{2}-.*\.md$/ },
  { dir: '.', re: /^(README|HANDOFF|PROMPT-CONTINUAR|GLOSSARIO|FATOS)\.md$/ },
  { dir: 'agente', re: /\.md$/ },
];
const REGISTRO = [{ dir: 'avaliacao', re: /\.md$/ }];

function listar(grupos) {
  const out = [];
  for (const g of grupos) {
    const dir = path.join(RAIZ, g.dir);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!g.re.test(f)) continue;
      out.push(g.dir === '.' ? f : `${g.dir}/${f}`);
    }
  }
  return out.sort();
}

function ocorrencias(rel, termo) {
  const linhas = fs.readFileSync(path.join(RAIZ, rel), 'utf8').split(/\r?\n/);
  const alvo = termo.toLowerCase();
  const achadas = [];
  linhas.forEach((l, i) => {
    if (l.toLowerCase().includes(alvo)) achadas.push({ linha: i + 1, texto: l.trim() });
  });
  return achadas;
}

const termos = process.argv.slice(2);
if (!termos.length) {
  console.error('uso: node ferramentas/superficies.js "<termo>" ["<termo>" ...]');
  process.exit(2);
}

const vivas = listar(VIVAS);
const registro = listar(REGISTRO);

for (const termo of termos) {
  console.log(`\n=== "${termo}"`);

  let nVivas = 0, nOcor = 0;
  for (const rel of vivas) {
    const o = ocorrencias(rel, termo);
    if (!o.length) continue;
    nVivas++; nOcor += o.length;
    console.log(`  ${rel}  (${o.length})`);
    for (const x of o.slice(0, 3)) {
      console.log(`      :${x.linha}  ${x.texto.slice(0, 96)}`);
    }
    if (o.length > 3) console.log(`      ... mais ${o.length - 3}`);
  }

  if (!nVivas) {
    console.log('  nenhuma superficie viva. Se o termo deveria estar no GLOSSARIO, esta e a resposta.');
  } else {
    console.log(`  -> ${nOcor} ocorrencia(s) em ${nVivas} superficie(s) VIVA(s): as ${nVivas} tem de concordar.`);
  }

  const emRegistro = registro.filter((rel) => ocorrencias(rel, termo).length);
  if (emRegistro.length) {
    const tot = emRegistro.reduce((s, rel) => s + ocorrencias(rel, termo).length, 0);
    console.log(`  registro (NAO TOQUE): ${tot} ocorrencia(s) em ${emRegistro.join(', ')}`);
    console.log('      cita o estado do dia em que mediu; divergencia ali esta certa.');
  }
}

console.log('\nAlerta de leitura, nao portao. Termo nao e conceito: parafrase escapa,');
console.log('e o artefato do plano vive fora do repositorio e nao entra nesta conta.');
