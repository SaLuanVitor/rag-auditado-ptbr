'use strict';

/**
 * gerar-fatos.js — extrai FATOS.md do repositório RAG-from-First-Principles.
 *
 * Motivação: o verify-citations.js valida caminho e range de linha, mas NÃO detecta
 * citação cujo conteúdo alegado não está na linha citada — foi assim que a alucinação
 * Q05 do gate v1 passaria batido (arquivo existe, linha existe, conteúdo é de outro
 * arquivo). A cobertura correta não é mais validação: é não depender da memória.
 *
 * Este script gera um índice de fatos canônicos — inventário por módulo e linhas-chave
 * com `arquivo:linha` MAIS o conteúdo literal. Citar a partir do FATOS.md elimina a
 * reconstrução de caminho por inferência, que foi a causa raiz das 3 alucinações.
 *
 * Uso:
 *   node gerar-fatos.js            # escreve ../FATOS.md
 *   node gerar-fatos.js --stdout   # imprime sem escrever
 *
 * Zero dependências externas.
 */

const fs = require('fs');
const path = require('path');

const CURSO_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(CURSO_ROOT, '..', 'RAG-from-First-Principles');
const OUTPUT_PATH = path.join(CURSO_ROOT, 'FATOS.md');

const MODULES = [
  '00-SimpleRAG', '01-DataLoading', '02-DocChunking', '03-Embedding', '04-VectorDB',
  '05-PreRetrieval', '06-Indexing', '07-PostRetrieval', '08-Generation', '09-Evaluation',
  '10-AdvanceRAG', '91-Environment',
];

/** Padrões cujas ocorrências são fatos que o especialista costuma precisar citar. */
const PATTERNS = [
  { label: 'chunking', regex: /chunk_size\s*=|chunk_overlap\s*=|buffer_size\s*=|window_size\s*=/ },
  { label: 'métrica', regex: /metric_type|IndexFlat(L2|IP)|normalize_embeddings/ },
  { label: 'índice ANN', regex: /index_type|"nlist"|"nprobe"|"M":|efConstruction|"ef"|search_list|"m":/ },
  { label: 'modelo', regex: /model_name\s*=|SentenceTransformer\(|HuggingFaceEmbedding|OLLAMA_MODEL/ },
  { label: 'recuperação', regex: /similarity_top_k|search_kwargs|top_k\s*=|\bk\s*=\s*\d+/ },
  { label: 'avaliação', regex: /from ragas|Faithfulness|AnswerRelevancy|context_precision|context_recall/ },
  { label: 'fusão', regex: /reciprocal_rank_fusion|rrf_score|fused_scores/ },
];

const CODE_EXTENSIONS = new Set(['.py', '.ipynb']);
const IGNORED_DIRS = new Set(['.git', 'node_modules', '__pycache__', '.idea', '.venv', 'saved_index']);
const MAX_FACTS_PER_MODULE = 45;

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
  return found.sort();
}

/** Inventário: contagem por extensão e lista de subdiretórios imediatos. */
function inventory(moduleName) {
  const moduleDir = path.join(REPO_ROOT, moduleName);
  const files = walk(moduleDir);
  const byExtension = new Map();
  const subdirectories = new Set();

  for (const relative of files) {
    const extension = path.extname(relative).toLowerCase() || '(sem extensão)';
    byExtension.set(extension, (byExtension.get(extension) || 0) + 1);
    const slashIndex = relative.indexOf('/');
    if (slashIndex > 0) subdirectories.add(relative.slice(0, slashIndex));
  }

  return {
    total: files.length,
    byExtension: [...byExtension.entries()].sort((a, b) => b[1] - a[1]),
    subdirectories: [...subdirectories].sort(),
    files,
  };
}

/** Linhas-chave: para cada padrão, ocorrências com arquivo:linha e conteúdo literal. */
function keyLines(moduleName) {
  const moduleDir = path.join(REPO_ROOT, moduleName);
  const facts = [];

  for (const relative of walk(moduleDir)) {
    if (!CODE_EXTENSIONS.has(path.extname(relative).toLowerCase())) continue;

    let lines;
    try {
      lines = fs.readFileSync(path.join(moduleDir, relative), 'utf8').split('\n');
    } catch (error) {
      continue;
    }

    lines.forEach((text, index) => {
      const trimmed = text.trim();
      if (trimmed.length === 0 || trimmed.length > 160) return;
      for (const pattern of PATTERNS) {
        if (pattern.regex.test(trimmed)) {
          facts.push({
            label: pattern.label,
            citation: `${moduleName}/${relative}:${index + 1}`,
            content: trimmed,
          });
          return;
        }
      }
    });
  }

  return facts;
}

function renderModule(moduleName) {
  const inv = inventory(moduleName);
  if (inv.total === 0) return '';

  const out = [];
  out.push(`## ${moduleName}`);
  out.push('');
  out.push(`**${inv.total} arquivos.** Por extensão: ` +
    inv.byExtension.map(([extension, count]) => `\`${extension}\` ${count}`).join(' · '));
  out.push('');

  if (inv.subdirectories.length > 0) {
    out.push(`**Subdiretórios:** ${inv.subdirectories.map((d) => `\`${d}\``).join(' · ')}`);
    out.push('');
  }

  const facts = keyLines(moduleName);
  if (facts.length > 0) {
    const shown = facts.slice(0, MAX_FACTS_PER_MODULE);
    out.push('| Tema | Citação | Conteúdo literal |');
    out.push('| --- | --- | --- |');
    for (const fact of shown) {
      const escaped = fact.content.replace(/\|/g, '\\|');
      out.push(`| ${fact.label} | \`${fact.citation}\` | \`${escaped}\` |`);
    }
    out.push('');
    if (facts.length > shown.length) {
      out.push(`_${facts.length - shown.length} ocorrências adicionais omitidas (limite ` +
        `${MAX_FACTS_PER_MODULE} por módulo). Rode um grep -n direcionado para as demais._`);
      out.push('');
    }
  }

  return out.join('\n');
}

function main() {
  if (!fs.existsSync(REPO_ROOT)) {
    process.stdout.write(`ERRO: repositório não encontrado em ${REPO_ROOT}\n`);
    process.exit(2);
  }

  const sections = [];
  sections.push('# FATOS — índice canônico do repositório');
  sections.push('');
  sections.push('> **Arquivo gerado.** Não editar à mão. Regenere com:');
  sections.push('> `node ferramentas/gerar-fatos.js`');
  sections.push('');
  sections.push('Fonte: `../RAG-from-First-Principles/`. Cada linha traz a citação e o');
  sections.push('**conteúdo literal** daquela linha, extraídos por script.');
  sections.push('');
  sections.push('Existe porque o gate v1 do `@rag-specialist` registrou 3 alucinações, todas de');
  sections.push('asserção factual sobre arquivos feita de memória. Citar deste índice remove a');
  sections.push('etapa em que a memória preenchia o caminho. Se o fato não está aqui, rode um');
  sections.push('`grep -n` direcionado — nunca reconstrua a citação de cabeça.');
  sections.push('');
  sections.push('---');
  sections.push('');

  let totalFacts = 0;
  for (const moduleName of MODULES) {
    const rendered = renderModule(moduleName);
    if (rendered.length > 0) {
      sections.push(rendered);
      totalFacts += (rendered.match(/\n\| /g) || []).length;
    }
  }

  const document = sections.join('\n');

  if (process.argv.includes('--stdout')) {
    process.stdout.write(document);
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, document, 'utf8');
  process.stdout.write(`FATOS.md gerado: ${OUTPUT_PATH}\n`);
  process.stdout.write(`${MODULES.length} módulos varridos, ~${totalFacts} linhas de fato indexadas\n`);
}

main();
