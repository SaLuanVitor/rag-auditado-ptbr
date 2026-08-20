'use strict';

/**
 * verify-citations.js — valida citações `arquivo:linha` em documentos Markdown.
 *
 * Motivação: o gate v1 do agente `rag-specialist` registrou 3 alucinações, todas do
 * mesmo gênero — asserção sobre localização, inventário ou conteúdo de arquivo feita
 * sem abrir e conferir. Regra em prosa depende de memória; este script não.
 *
 * O que ele detecta:
 *   ERRO   NOT_FOUND  — caminho citado não existe em nenhuma raiz conhecida
 *   ERRO   MISPLACED  — o arquivo existe, mas em outro caminho (o padrão da alucinação Q05)
 *   ERRO   BAD_LINE   — o arquivo existe e a linha citada está fora do range
 *   AVISO  SKIPPED    — citação com glob/elipse, não verificável automaticamente
 *
 * Uso:
 *   node verify-citations.js <arquivo.md> [mais.md ...]
 *   node verify-citations.js --all
 *
 * Exit code 0 = nenhuma citação inválida. 1 = há erros. 2 = uso incorreto.
 *
 * Zero dependências externas — apenas stdlib do Node.
 */

const fs = require('fs');
const path = require('path');

const CURSO_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(CURSO_ROOT, '..', 'RAG-from-First-Principles');


const SEARCH_ROOTS = [
  { label: 'repo', dir: REPO_ROOT },
  { label: 'curso', dir: CURSO_ROOT },
];

const KNOWN_EXTENSIONS = new Set([
  '.py', '.ipynb', '.md', '.txt', '.json', '.csv', '.yaml', '.yml',
  '.pdf', '.pptx', '.jpg', '.jpeg', '.png', '.db', '.example', '.js',
]);

// Tokens que contêm estes caracteres são código ou padrão, não caminho literal.
const NOT_A_PATH = ['*', '...', '{', '}', '<', '>', '=', '(', ')', '|', '\\'];

// Primeira palavra do token indica comando de shell, nao caminho de arquivo.
const COMMAND_PREFIXES = new Set([
  'node', 'python', 'python3', 'pip', 'npm', 'npx', 'git', 'ls', 'cat', 'grep',
  'wsl', 'cd', 'ollama', 'winget', 'docker', 'sed', 'find', 'bash', 'sh',
]);

const IGNORED_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.idea', '.venv']);

/** Percorre um diretório e devolve todos os caminhos de arquivo, relativos à raiz. */
function walk(root) {
  const found = [];
  if (!fs.existsSync(root)) return found;

  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (error) {
      // Diretório ilegível não invalida a verificação dos demais.
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRS.has(entry.name)) stack.push(full);
      } else {
        found.push(path.relative(root, full).split(path.sep).join('/'));
      }
    }
  }
  return found;
}

/**
 * Índice basename -> lista de caminhos, para diagnosticar MISPLACED e para ancorar
 * referência solta quando o basename identifica um arquivo só.
 *
 * As SEARCH_ROOTS se sobrepõem: `curso` e `repo` moram dentro de `aiox`. Sem deduplicar,
 * cada arquivo do clone da Packt entrava no índice duas vezes (rótulos `repo` e `aiox`,
 * caminhos relativos diferentes), então `alternatives.length !== 1` era verdade para
 * TODOS eles e nenhum basename-só ancorava. Era a causa de 41 dos 48 BAD_ANCHOR na
 * triagem de 19/08/2026 — a AULA-24 sozinha tinha 17, todos por citar
 * `Milvus-Implementation.py` sem o diretório, sendo que esse basename é único no repo.
 *
 * A deduplicação é pelo caminho ABSOLUTO real, e a ordem de SEARCH_ROOTS (repo, curso,
 * aiox) faz a raiz mais específica ganhar o rótulo. Basename genuinamente ambíguo segue
 * ambíguo: `docker-compose.yml` existe em dois módulos da Packt e continua não ancorando.
 */
function buildBasenameIndex() {
  const index = new Map();
  const absolutosVistos = new Set();
  for (const root of SEARCH_ROOTS) {
    for (const relative of walk(root.dir)) {
      const absolute = path.resolve(root.dir, relative);
      if (absolutosVistos.has(absolute)) continue;
      absolutosVistos.add(absolute);
      const base = path.basename(relative);
      if (!index.has(base)) index.set(base, []);
      index.get(base).push(`${root.label}:${relative}`);
    }
  }
  return index;
}

/** Extrai tokens de código inline (entre backticks) de um texto Markdown. */
function extractInlineCode(text) {
  const tokens = [];
  const pattern = /`([^`\n]+)`/g;
  let match = pattern.exec(text);
  while (match !== null) {
    tokens.push(match[1].trim());
    match = pattern.exec(text);
  }
  return tokens;
}

/** Decide se um token parece ser referência a arquivo do repositório. */
function looksLikePath(token) {
  if (token.length === 0 || token.length > 200) return false;
  // Fragmentos de nome em enumerações — "`-v2-ok.py` e `-v3-agent.py`" — não são caminhos.
  if (token.startsWith('-')) return false;
  const firstWord = token.split(/\s+/)[0];
  if (COMMAND_PREFIXES.has(firstWord)) return false;
  for (const bad of NOT_A_PATH) {
    if (token.includes(bad)) return false;
  }
  const withoutLine = token.replace(/:\d+\s*[-–—]\s*\d+$/, '').replace(/:\d+$/, '');
  const extension = path.extname(withoutLine).toLowerCase();
  // Exige extensao conhecida: model IDs do HuggingFace ("BAAI/bge-small-zh-v1.5") tem
  // barra e um pseudo-sufixo (".5"), mas nao sao caminhos de arquivo.
  return KNOWN_EXTENSIONS.has(extension);
}

/** Separa o token em caminho e número de linha, quando presente. */
/**
 * Separa `caminho:linha` e `caminho:inicio-fim`.
 *
 * O range importa: sem ele, `arquivo.py:163-167` casava `(\d+)$` apenas com `167` e o filePath
 * ficava `arquivo.py:163-` -- um nome que nao resolve, entao a citacao nao ancorava as referencias
 * soltas seguintes e elas eram acusadas contra o arquivo errado. Ambas as pontas do range sao
 * conferidas: um range que comeca dentro e termina fora do arquivo e um defeito tanto quanto um
 * numero isolado fora dele.
 */
function parseCitation(token) {
  const range = /^(.*?):(\d+)\s*[-–—]\s*(\d+)$/.exec(token);
  if (range !== null) {
    return {
      filePath: range[1],
      line: Number.parseInt(range[2], 10),
      lastLine: Number.parseInt(range[3], 10),
    };
  }
  const match = /^(.*?):(\d+)$/.exec(token);
  if (match !== null) {
    return { filePath: match[1], line: Number.parseInt(match[2], 10), lastLine: null };
  }
  return { filePath: token, line: null, lastLine: null };
}

/** Normaliza prefixos relativos que aparecem nos documentos do curso. */
function normalize(filePath) {
  return filePath
    .replace(/^\.\/+/, '')
    .replace(/^(\.\.\/)+/, '')
    .replace(/^RAG-from-First-Principles\//, '');
}

function countLines(absolutePath) {
  const content = fs.readFileSync(absolutePath, 'utf8');
  const lines = content.split('\n');
  // Arquivo terminando em newline produz um último elemento vazio.
  if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  return lines.length;
}

function checkLine(absolutePath, label, relative, line) {
  const total = countLines(absolutePath);
  if (line >= 1 && line <= total) {
    return { status: 'OK', detail: `${label}:${relative} (${total} linhas)` };
  }
  return {
    status: 'BAD_LINE',
    detail: `linha ${line} fora do range: ${label}:${relative} tem ${total} linhas`,
  };
}

/**
 * Resolve uma citação contra as raízes conhecidas.
 *
 * A distinção que importa: um token COM caminho ('/') é uma afirmação sobre localização,
 * e errá-la é o padrão exato da alucinação Q05 do gate v1 — logo vira MISPLACED (erro).
 * Um token que é só basename é menção, não afirmação de caminho; basta existir.
 */
function resolveCitation(citation, basenameIndex) {
  const relative = normalize(citation.filePath);
  const asserts_path = relative.includes('/');
  const base = path.basename(relative);

  for (const root of SEARCH_ROOTS) {
    const candidate = path.join(root.dir, relative);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      if (citation.line === null) return { status: 'OK', detail: `${root.label}:${relative}` };
      const inicio = checkLine(candidate, root.label, relative, citation.line);
      if (inicio.status !== 'OK' || citation.lastLine === null) return inicio;
      return checkLine(candidate, root.label, relative, citation.lastLine);
    }
  }

  const alternatives = basenameIndex.get(base);
  const found = alternatives !== undefined && alternatives.length > 0;

  if (asserts_path) {
    if (found) {
      const isSuffix = alternatives.some((entry) => entry.split(':').slice(1).join(':').endsWith(relative));
      if (isSuffix) {
        return {
          status: 'PARTIAL',
          detail: `caminho parcial (sufixo válido) de: ${alternatives.slice(0, 2).join(' | ')}`,
        };
      }
      return {
        status: 'MISPLACED',
        detail: `caminho afirmado não existe; o arquivo está em: ${alternatives.slice(0, 3).join(' | ')}`,
      };
    }
    return { status: 'NOT_FOUND', detail: 'nenhum arquivo com este nome no clone da Packt nem neste repositório' };
  }

  // Menção por basename: existir basta. Se houver linha citada e um único match, confere a linha.
  if (found) {
    if (citation.line !== null && alternatives.length === 1) {
      const [only] = alternatives;
      const separatorIndex = only.indexOf(':');
      const label = only.slice(0, separatorIndex);
      const rel = only.slice(separatorIndex + 1);
      const root = SEARCH_ROOTS.find((entry) => entry.label === label);
      return checkLine(path.join(root.dir, rel), label, rel, citation.line);
    }
    return { status: 'OK', detail: `menção: ${alternatives.slice(0, 2).join(' | ')}` };
  }

  return {
    status: 'UNKNOWN',
    detail: 'basename não encontrado localmente — pode ser arquivo externo; confirmar à mão',
  };
}

/**
 * Resolve um token de arquivo ao caminho absoluto, quando ele identifica um arquivo só.
 * Devolve null se o token não resolve, ou se o basename é ambíguo (mais de um match).
 * Usado para ancorar as referências soltas a linha — ver resolveAnchoredLine.
 */
function resolveToAbsolute(filePathToken, basenameIndex) {
  const relative = normalize(filePathToken);
  const base = path.basename(relative);

  // Caminho direto SO para token que traz diretorio. Um basename nu casando na raiz de uma
  // SEARCH_ROOT e coincidencia, nao identificacao: a AULA-09 cita o `docker-compose.yml` do
  // modulo Milvus, e o token nu casava em um `docker-compose.yml` da raiz do projeto de origem (21 linhas, do
  // proprio AIOX), ancorando as linhas 23/41/51/57-58 no arquivo errado e produzindo cinco
  // BAD_ANCHOR falsos. Sem diretorio no token, so o indice de basename decide — e ele exige
  // unicidade.
  if (relative.includes('/') || relative.includes('\\')) {
    for (const root of SEARCH_ROOTS) {
      const candidate = path.join(root.dir, relative);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        return { abs: candidate, label: root.label, rel: relative };
      }
    }
  }

  // Sem caminho no token, um basename que existe em mais de um lugar nao identifica arquivo nenhum.
  // Ancorar no primeiro match seria adivinhar: foi o que fez a AULA-09 (`docker-compose.yml`, que
  // existe em dois modulos) ser acusada de citar linhas fora do range do arquivo errado.
  const alternatives = basenameIndex.get(base);
  if (alternatives === undefined || alternatives.length !== 1) return null;

  const [only] = alternatives;
  const separatorIndex = only.indexOf(':');
  const label = only.slice(0, separatorIndex);
  const rel = only.slice(separatorIndex + 1);
  const root = SEARCH_ROOTS.find((entry) => entry.label === label);
  if (root === undefined) return null;
  return { abs: path.join(root.dir, rel), label, rel };
}

/**
* Valida uma referencia a linha que NAO carrega o nome do arquivo -- `:NNN` ou "linha NNN" em prosa.
 *
 * O arquivo nao esta escrito, entao ele e inferido: a referencia e conferida contra a JANELA dos
 * arquivos citados por ultimo, nao contra um so. Rastrear apenas o mais recente produz falso
 * positivo sempre que um paragrafo compara dois arquivos -- foi o que aconteceu na primeira versao,
 * que acusou `:424-428` (do CRAG) contra o Self-RAG por ele ter sido citado uma linha antes.
 *
 * A regra e deliberadamente permissiva: basta a linha caber em ALGUM arquivo da janela. So o que
 * nao cabe em nenhum vira BAD_ANCHOR e conta como erro -- e nesse caso a mensagem lista os
 * candidatos, porque o defeito pode estar na linha OU na leitura da ancora, e quem confere precisa
 * dos dois lados. Sem janela, NO_ANCHOR: conferir a mao, nunca erro.
 */
const ANCHOR_WINDOW = 6;

function resolveAnchoredLine(line, window) {
  if (window.length === 0) {
    return { status: 'NO_ANCHOR', detail: `linha ${line} sem arquivo citado antes — conferir à mão` };
  }

  const sizes = window.map((entry) => ({ entry, total: countLines(entry.abs) }));
  const fits = sizes.filter((candidate) => line >= 1 && line <= candidate.total);

  if (fits.length === 1) {
    const [only] = fits;
    return { status: 'OK', detail: `linha ${line} de ${only.entry.label}:${only.entry.rel} (${only.total} linhas)` };
  }
  if (fits.length > 1) {
    return {
      status: 'OK',
      detail: `linha ${line} cabe em ${fits.length} arquivos da janela — ambíguo, mas dentro do range`,
    };
  }

  const maiores = sizes
    .map((candidate) => `${candidate.entry.rel} (${candidate.total})`)
    .slice(0, 3)
    .join(' | ');
  return {
    status: 'BAD_ANCHOR',
    detail: `linha ${line} não cabe em nenhum arquivo citado por perto: ${maiores}`,
  };
}

function extractLineReferences(text) {
  const found = [];
  const inlinePattern = /`:(\d+)(?:\s*[-–—]\s*(\d+))?`/g;
  let match = inlinePattern.exec(text);
  while (match !== null) {
    found.push({ first: Number(match[1]), last: match[2] ? Number(match[2]) : null, raw: match[0] });
    match = inlinePattern.exec(text);
  }
  const prosePattern = /\blinhas?\s+(\d+)(?:\s*[-–—]\s*(\d+))?/gi;
  match = prosePattern.exec(text);
  while (match !== null) {
    found.push({ first: Number(match[1]), last: match[2] ? Number(match[2]) : null, raw: match[0] });
    match = prosePattern.exec(text);
  }
  return found;
}

/**
 * Distancia maxima, em linhas do markdown, entre uma referencia solta e a citacao que a ancora.
 * Referencia mais longe que isso nao tem ancora: vira NO_ANCHOR, nunca erro.
 */
const ANCHOR_WINDOW_LINES = 40;

function verifyFile(documentPath, basenameIndex) {
  const results = [];
  const content = fs.readFileSync(documentPath, 'utf8');
  const lines = content.split('\n');

  // Linhas dentro de blocos ``` nao sao prosa: numeros ali sao codigo, nao citacao.
  const isProse = [];
  let insideFence = false;
  for (const lineText of lines) {
    if (/^\s*```/.test(lineText)) {
      insideFence = !insideFence;
      isProse.push(false);
      continue;
    }
    isProse.push(!insideFence);
  }

  // PASSE 1 — citacoes com nome de arquivo. Alimentam o relatorio e ancoram o passe 2.
  const anchors = [];
  lines.forEach((lineText, offset) => {
    if (!isProse[offset]) return;
    for (const token of extractInlineCode(lineText)) {
      const hasEllipsisOrGlob = token.includes('...') || token.includes('*');
      if (hasEllipsisOrGlob && /\.(py|ipynb|md|txt|json|csv|pdf)/i.test(token)) {
        results.push({
          documentLine: offset + 1,
          token,
          status: 'SKIPPED',
          detail: 'contém glob ou elipse — verificar à mão',
        });
        continue;
      }
      if (!looksLikePath(token)) continue;

      const citation = parseCitation(token);
      const outcome = resolveCitation(citation, basenameIndex);
      results.push({
        documentLine: offset + 1,
        token,
        status: outcome.status,
        detail: outcome.detail,
      });

      const resolved = resolveToAbsolute(citation.filePath, basenameIndex);
      if (resolved !== null) anchors.push({ at: offset + 1, file: resolved });
    }
  });

  // PASSE 2 — referencias que nao carregam o nome do arquivo.
  lines.forEach((lineText, offset) => {
    if (!isProse[offset]) return;
    const here = offset + 1;
    const window = [];
    for (const anchor of anchors) {
      if (anchor.at > here || here - anchor.at > ANCHOR_WINDOW_LINES) continue;
      if (!window.some((entry) => entry.abs === anchor.file.abs)) window.push(anchor.file);
    }

    for (const reference of extractLineReferences(lineText)) {
      for (const line of [reference.first, reference.last]) {
        if (line === null) continue;
        const outcome = resolveAnchoredLine(line, window);
        results.push({
          documentLine: here,
          token: reference.raw,
          status: outcome.status,
          detail: outcome.detail,
        });
      }
    }
  });

  return results;
}

/**
 * `--all` cobre o material didatico. Os meta-documentos (relatorios de auditoria, handoff) citam
 * linhas de arquivos discutidos em abstrato, longe de qualquer citacao que as ancore, e so geram
 * ruido -- passe o caminho explicitamente para verifica-los.
 */
const META_DOCUMENTS = /^(avaliacao\/|HANDOFF\.md$|PROMPT-)/;

function collectDefaultDocuments() {
  const documents = [];
  for (const relative of walk(CURSO_ROOT)) {
    const normalized = relative.split(path.sep).join('/');
    if (!normalized.endsWith('.md')) continue;
    if (META_DOCUMENTS.test(normalized)) continue;
    documents.push(path.join(CURSO_ROOT, relative));
  }
  return documents.sort();
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    process.stdout.write('uso: node verify-citations.js <arquivo.md> [...] | --all\n');
    process.exit(2);
  }

  const documents = argv[0] === '--all'
    ? collectDefaultDocuments()
    : argv.map((entry) => path.resolve(entry));

  if (!fs.existsSync(REPO_ROOT)) {
    process.stdout.write(`ERRO: repositório de referência não encontrado em ${REPO_ROOT}\n`);
    process.exit(2);
  }

  const basenameIndex = buildBasenameIndex();
  const totals = {
    OK: 0, BAD_LINE: 0, MISPLACED: 0, NOT_FOUND: 0, PARTIAL: 0, UNKNOWN: 0,
    SKIPPED: 0, BAD_ANCHOR: 0, NO_ANCHOR: 0,
  };

  for (const document of documents) {
    if (!fs.existsSync(document)) {
      process.stdout.write(`\n=== ${document}\n  ARQUIVO INEXISTENTE\n`);
      totals.NOT_FOUND += 1;
      continue;
    }

    const results = verifyFile(document, basenameIndex);
    const problems = results.filter((entry) => entry.status !== 'OK');
    for (const entry of results) totals[entry.status] += 1;

    const name = path.relative(CURSO_ROOT, document).split(path.sep).join('/');
    const okCount = results.length - problems.length;
    process.stdout.write(`\n=== ${name} — ${results.length} citações, ${okCount} OK\n`);

    for (const entry of problems) {
      process.stdout.write(
        `  [${entry.status}] linha ${entry.documentLine}: \`${entry.token}\`\n      ${entry.detail}\n`,
      );
    }
  }

  const errors = totals.BAD_LINE + totals.MISPLACED + totals.NOT_FOUND + totals.BAD_ANCHOR;
  process.stdout.write('\n--- RESUMO ---\n');
  process.stdout.write(`OK:        ${totals.OK}\n`);
  process.stdout.write(`BAD_LINE:  ${totals.BAD_LINE}\n`);
  process.stdout.write(`MISPLACED: ${totals.MISPLACED}\n`);
  process.stdout.write(`NOT_FOUND: ${totals.NOT_FOUND}\n`);
  process.stdout.write(`BAD_ANCHOR:${totals.BAD_ANCHOR}
`);
  process.stdout.write(`SKIPPED:   ${totals.SKIPPED} (verificar à mão)\n`);
  process.stdout.write(`NO_ANCHOR: ${totals.NO_ANCHOR} (sem arquivo antecedente)
`);
  process.stdout.write(`\n${errors === 0 ? 'PASS' : 'FAIL'} — ${errors} citações inválidas\n`);

  process.exit(errors === 0 ? 0 : 1);
}

main();
