// Vigia: o acervo envelhece em silencio, e este script e o alarme.
//
// Um curso ancorado num commit apodrece por duas vias, e as duas sao mudas: a
// FONTE anda, e as BIBLIOTECAS que as aulas dizem ter medido andam. Nenhuma das
// duas quebra teste, nenhuma aparece em `git status`, e o texto continua com
// aparencia de verdade enquanto deixa de ser.
//
// O QUE ELE NAO FAZ, e cada uma e escolha:
//
//   NAO da `fetch` no clone. O contrato desta auditoria e que o clone pinado
//   nao se modifica, e `fetch` escreve refs dentro dele. Entao a ponta remota se
//   pergunta com `git ls-remote`, que nao escreve nada em lugar nenhum. O preco
//   e nao saber QUANTOS commits o upstream andou, so que andou.
//
//   NAO decide repinar. Repinar e reauditar, e isso e decisao humana. Ele
//   reporta o que mudou e diz o que aquilo obriga a reler.
//
//   NAO vigia todos os pins do repositorio. Sao mais de 1700 entre os arquivos
//   de ambiente, e a maioria e dependencia transitiva que nenhuma aula cita. Ele
//   vigia o que o ACERVO DIZ TER MEDIDO, que e o conjunto cujo envelhecimento
//   torna uma afirmacao falsa.
//
// A LISTA DE VIGILANCIA SE DERIVA, NAO SE ESCREVE. Ela sai das proprias aulas,
// por busca de `pacote X.Y.Z`, e e classificada contra os requirements do clone:
//
//   PIN          o par pacote==versao existe em algum requirements do clone.
//                E afirmacao sobre a FONTE, e envelhece quando o PyPI anda.
//   INSTRUMENTO  o pacote existe nos requirements, mas naquela versao nao. E a
//                versao com que a medicao foi feita, e ela NAO deve ser vigiada
//                contra o PyPI: o que importa nela e bater com o pin, e essa
//                confusao ja custou um `-1` a esta auditoria.
//
// Uso:
//   node ferramentas/vigia.js              fonte + bibliotecas (usa a rede)
//   node ferramentas/vigia.js --offline    so o que se le em disco
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.join(__dirname, '..');
const CLONE = path.join(RAIZ, '..', 'RAG-from-First-Principles');

// `pacote 1.2.3` em prosa. A versao pode ter sufixo (`0.12.23.post2`), e o nome
// tem de parecer nome de pacote: sem extensao de arquivo, que e o que separava
// `self-rag.png (177.550` de um pin de verdade na primeira medicao.
const RE_VERSAO = /`([a-z][a-z0-9_-]*(?:[._-][a-z0-9]+)*)`\s+(\d+\.\d+(?:\.\d+)?(?:[.a-z0-9]+)?)/g;

function aulas() {
  return fs.readdirSync(RAIZ).filter((f) => /^AULA-\d{2}-.*\.md$/.test(f));
}

// Todo par (pacote, versao) que as aulas afirmam, com onde foi afirmado.
function declaracoes() {
  const m = new Map();
  for (const a of aulas()) {
    const txt = fs.readFileSync(path.join(RAIZ, a), 'utf8');
    for (const g of txt.matchAll(RE_VERSAO)) {
      const chave = `${g[1]}@${g[2].replace(/\.$/, '')}`;
      if (!m.has(chave)) m.set(chave, { pacote: g[1], versao: g[2].replace(/\.$/, ''), onde: new Set() });
      m.get(chave).onde.add(a);
    }
  }
  return [...m.values()];
}

// Os requirements do clone, lidos uma vez. Sem `git`: e leitura de disco, e o
// clone nao se toca nem para listar.
function requisitos() {
  const arqs = [];
  (function anda(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) anda(p);
      else if (/requirements.*\.txt$/i.test(e.name)) arqs.push(p);
    }
  })(CLONE);

  const nomes = new Set();
  const pins = new Map(); // pacote -> Set de versoes pinadas com ==
  for (const p of arqs) {
    for (const l of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const t = l.trim();
      if (!t || t.startsWith('#')) continue;
      const m = t.match(/^([A-Za-z0-9._-]+)\s*(?:==\s*([A-Za-z0-9._-]+))?/);
      if (!m) continue;
      const nome = m[1].toLowerCase();
      nomes.add(nome);
      if (m[2]) {
        if (!pins.has(nome)) pins.set(nome, new Set());
        pins.get(nome).add(m[2]);
      }
    }
  }
  return { nomes, pins, arquivos: arqs.length };
}

// ---------------------------------------------------------------- rede
// Injetaveis, e e por isso que a suite roda sem rede. Um vigia que so pode ser
// testado com rede nao e testado.
function pontaUpstream(url) {
  const saida = execFileSync('git', ['ls-remote', url, 'HEAD'], { encoding: 'utf8', timeout: 60000 });
  return saida.split(/\s/)[0];
}

function versaoNoPypi(pacote) {
  const saida = execFileSync(process.execPath, ['-e', `
    const https = require('https');
    https.get('https://pypi.org/pypi/${pacote}/json', (r) => {
      let b = '';
      r.on('data', (d) => (b += d));
      r.on('end', () => {
        try { process.stdout.write(JSON.parse(b).info.version); }
        catch (e) { process.stdout.write(''); }
      });
    }).on('error', () => process.stdout.write(''));
  `], { encoding: 'utf8', timeout: 60000 });
  return saida.trim() || null;
}

// ---------------------------------------------------------------- relatorio
function vigiar(opts = {}) {
  const online = !opts.offline;
  const lerPonta = opts.pontaUpstream || pontaUpstream;
  const lerPypi = opts.versaoNoPypi || versaoNoPypi;
  const log = opts.log || console.log;

  const linhas = [];
  let mexeu = 0;

  // --- eixo 1: a fonte
  log('== A fonte');
  const pinado = execFileSync('git', ['-C', CLONE, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  log(`   clone pinado em ${pinado.slice(0, 7)}`);
  if (!online) {
    log('   upstream: nao consultado (--offline)');
  } else {
    const url = execFileSync('git', ['-C', CLONE, 'remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const ponta = lerPonta(url);
    if (!ponta) {
      log('   upstream: NAO RESPONDEU. Sem resposta nao e sinal de que nao mudou.');
    } else if (ponta === pinado) {
      log(`   upstream em ${ponta.slice(0, 7)}: a fonte NAO andou`);
    } else {
      log(`   upstream em ${ponta.slice(0, 7)}: A FONTE ANDOU`);
      log('   Repinar e reauditar: toda citacao de linha resolve contra o commit pinado.');
      log('   Quantos commits andou so se sabe com fetch, e fetch escreve no clone.');
      mexeu++;
      linhas.push('a fonte andou');
    }
  }

  // --- eixo 2: as bibliotecas que o acervo diz ter medido
  log('');
  log('== As bibliotecas que as aulas declaram');
  const { nomes, pins, arquivos } = requisitos();
  const decls = declaracoes();
  const naoPacote = [];
  const instrumentos = [];
  const vigiados = [];

  for (const d of decls) {
    const nome = d.pacote.toLowerCase();
    if (!nomes.has(nome)) { naoPacote.push(d); continue; }
    const pinadas = pins.get(nome);
    if (pinadas && pinadas.has(d.versao)) vigiados.push(d);
    else instrumentos.push(d);
  }
  log(`   ${arquivos} requirements lidos no clone, ${decls.length} declaracoes nas aulas`);
  log(`   ${vigiados.length} sao PIN da fonte, ${instrumentos.length} sao versao de INSTRUMENTO`);
  log('');

  for (const d of vigiados.sort((a, b) => a.pacote.localeCompare(b.pacote))) {
    const onde = [...d.onde].sort().join(' ');
    if (!online) { log(`   ${d.pacote} ${d.versao}  (pin)  ${onde}`); continue; }
    const corrente = lerPypi(d.pacote);
    if (!corrente) {
      log(`   ${d.pacote} ${d.versao}  PyPI nao respondeu`);
    } else if (corrente === d.versao) {
      log(`   ${d.pacote} ${d.versao}  corrente, nao andou`);
    } else {
      log(`   ${d.pacote} ${d.versao} -> PyPI em ${corrente}  ANDOU   ${onde}`);
      mexeu++;
      linhas.push(`${d.pacote}: ${d.versao} -> ${corrente}`);
    }
  }

  if (instrumentos.length) {
    log('');
    log('   Versoes de INSTRUMENTO, nao vigiadas contra o PyPI:');
    for (const d of instrumentos.sort((a, b) => a.pacote.localeCompare(b.pacote))) {
      const p = pins.get(d.pacote.toLowerCase());
      log(`   ${d.pacote} ${d.versao}  (o clone pina ${p ? [...p].join(', ') : 'sem =='})  ${[...d.onde].sort().join(' ')}`);
    }
    log('   O que importa nelas e bater com o pin, nao com o PyPI. Divergencia aqui');
    log('   e achado de auditoria, e ja custou um -1 a este projeto.');
  }

  if (naoPacote.length) {
    log('');
    log(`   ${naoPacote.length} declaracao(oes) descartada(s): o nome nao e pacote de nenhum requirements`);
  }

  log('');
  if (!online) {
    log('OFFLINE: nada foi consultado. Ausencia de alarme aqui nao e ausencia de mudanca.');
    return { estado: 'OFFLINE', mexeu: 0, linhas: [] };
  }
  if (mexeu) {
    log(`VIGIA: ${mexeu} item(ns) mudaram desde a medicao.`);
    for (const l of linhas) log(`  - ${l}`);
    log('Nada disso quebra o acervo sozinho: decide-se por aula se vale remedir.');
    return { estado: 'MUDOU', mexeu, linhas };
  }
  log('VIGIA: nada mudou desde a medicao.');
  return { estado: 'ESTAVEL', mexeu: 0, linhas: [] };
}

module.exports = { vigiar, declaracoes, requisitos };

if (require.main === module) {
  const r = vigiar({ offline: process.argv.includes('--offline') });
  process.exit(r.estado === 'MUDOU' ? 1 : 0);
}
