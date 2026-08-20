# RAG auditado — PT-BR

Curso de **Retrieval-Augmented Generation** em português, 29 aulas, construído por
leitura direta de um repositório de código real: o de _RAG from First Principles_
(Jia Huang, Packt). Cada afirmação factual sobre aquele código carrega
`arquivo:linha`, e **cada citação é conferida por ferramenta**.

O diferencial não é a quantidade de aulas. É o aparato de verificação:

| | |
| --- | --- |
| Aulas | **29** (`AULA-00` a `AULA-28`), ~86 mil palavras |
| Citações `arquivo:linha` verificadas | **1 602**, zero inválidas |
| Cobertura da auditoria adversarial | **29 de 29** aulas com nota independente |
| Glossário | 162 termos de RAG, em inglês, definidos em português |
| Agente especialista versionado | `@rag-specialist` (Vetor), nível L3 |

## Por que "auditado"

Material didático sobre código erra de um jeito específico: cita a linha errada,
descreve um `diff` que não conferiu, ou afirma "o único arquivo que" sem grepar.
Este curso trata isso como defeito mensurável, não como risco aceitável.

Três camadas de verificação, e as três estão neste repositório:

1. **Ferramenta.** [`ferramentas/verify-citations.js`](ferramentas/verify-citations.js)
   valida caminho e faixa de linha de toda citação, incluindo as referências soltas
   (```:NNN``` e "linha 45" em prosa) resolvidas por janela de ancoragem.
   `node ferramentas/verify-citations.js --all` precisa terminar em **PASS**.
2. **Rubrica.** [`avaliacao/RUBRICA-AULAS.md`](avaliacao/RUBRICA-AULAS.md) — seis
   dimensões, escala de `−1` (alucinação) a `2`, portas eliminatórias. Nota `−1`
   existe para tornar impossível compensar invenção com volume.
3. **Auditores adversariais independentes**, instruídos a **refutar** cada afirmação,
   com viés declarado contra o material. Auto-avaliação não conta: a nota é sempre de
   quem tentou derrubar a aula e não conseguiu.

O que a ferramenta **não** pega — e por isso a auditoria humana existe — está
documentado: citação cuja linha existe mas não diz o que a aula afirma, contradição
entre a tabela e a prosa da mesma aula, e superlativo não marcado como julgamento.

## Estado honesto

**Nenhuma classificação de publicação é declarada.** A cobertura da auditoria fechou
em 29/29, mas a **renota** — reavaliar o material depois das correções — está em
**9 de 29 aulas**. As nove subiram de 55/108 para 86/108, e duas aulas ainda não
renotadas estão abaixo da porta mínima da rubrica.

Declarar "publicável" agora seria o erro que a Aula 22 deste curso ensina a não
cometer: veredicto grande sobre amostra pequena. O que falta está listado em
[`HANDOFF.md`](HANDOFF.md).

Restam ainda 16 citações com glob ou elipse e 20 referências sem arquivo antecedente,
que são conferência à mão **por desenho** — não defeito.

## Como usar

O curso é sobre um repositório que não vive aqui. Clone-o como **irmão** desta pasta:

```bash
git clone https://github.com/PacktPublishing/RAG-from-First-Principles.git
```

A estrutura tem de ficar assim, ou o verificador não resolve as citações:

```
.
├── RAG-from-First-Principles/   # o clone, NUNCA modificado
└── rag-auditado-ptbr/           # este repositório
```

Depois, da raiz deste repositório:

```bash
node ferramentas/verify-citations.js --all
```

**Contrato inegociável:** o clone da Packt não é modificado. `git status` dentro dele
deve terminar vazio. Isso mantém o repo idêntico ao upstream, faz `git pull` nunca
conflitar, e deixa claro o que é fonte original e o que é material de estudo.

## O que tem aqui

| Caminho | Conteúdo |
| --- | --- |
| `AULA-00` … `AULA-28` | as 29 aulas, em oito seções fixas cada |
| [`GLOSSARIO.md`](GLOSSARIO.md) | 162 termos, agrupados por tema |
| [`FATOS.md`](FATOS.md) | inventário por módulo, gerado por script, com `arquivo:linha` e conteúdo literal |
| `agente/` | o `@rag-specialist`: persona, protocolo de citação de 10 regras, limites declarados |
| `avaliacao/` | rubricas, dois exames do agente, gates de auditoria, dossiê mecânico |
| `exercicios/` | script executável de similaridade (cosseno, IP, L2, com bug proposital) |
| `ferramentas/` | o verificador de citações e o gerador do `FATOS.md` |
| [`HANDOFF.md`](HANDOFF.md) | estado verificado, achados, e o que falta |

## Como cada aula é feita

Oito seções fixas: **Pergunta motivadora**, **Modelo mental**, o código do
repositório, **Mão na massa**, **Quebre de propósito** (mudanças que degradam o
resultado, para ver o mecanismo funcionando ao contrário), **Armadilhas de
produção**, **Checkpoint** e **Vocabulário**.

Duas decisões de tom que importam: julgamento é marcado como julgamento, e o custo
de cada mitigação é nomeado — não existe "X elimina o trade-off". Erros de digitação
do repositório de origem são **preservados** nas citações e apontados, porque é assim
que o leitor vai encontrá-los.

## Licença

Ainda não definida. O material didático é original; o repositório de código que ele
analisa é de terceiros e não está incluído aqui.

---

## Análise do repositório de base

| Item              | Situação                                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------- |
| Origem            | [`PacktPublishing/RAG-from-First-Principles`](https://github.com/PacktPublishing/RAG-from-First-Principles) |
| Autor             | Jia Huang — Lead Research Engineer, A\*STAR (Singapura)                                                     |
| Arquivos          | 396 (excluindo `.git`)                                                                                      |
| Módulos de código | 11 diretórios numerados `00` a `10`, espelhando os 10 capítulos do livro                                    |
| Dados de exemplo  | `90-Data/` (64 arquivos) e `99-EN/` (43 arquivos, insumos em inglês)                                        |
| Ambientes         | `91-Environment/` — requirements separados por SO e por presença de GPU                                     |
| Idioma do código  | **Inglês.** A tradução CN→EN está concluída                                                                 |
| Stack             | Python, LangChain, LlamaIndex, LangGraph, Milvus, FAISS, Weaviate, Neo4j                                    |

### Ressalva sobre `TRANSLATION_PROGRESS.md`

O arquivo `TRANSLATION_PROGRESS.md` do repositório está **obsoleto**. Ele declara
`04-VectorDB` como `in_progress (4/28)` e marca `08-Generation`, `09-Evaluation`,
`10-AdvanceRAG`, `90-Data` e `91-Environment` como `pending`.

Varredura por caracteres CJK (faixa Unicode `U+4E00`–`U+9FFF`) nos 13 diretórios
retornou **zero arquivos com texto chinês**. A tradução está completa; o arquivo
de progresso apenas não foi atualizado ao final. Os únicos vestígios são nomes de
PDFs binários em `99-EN/assets/shanxi-tourism/` (ex. `云冈石窟-en.pdf`), cujo
conteúdo já é inglês.

Consequência prática: você pode ler qualquer script do repositório sem depender
de tradução.

### Corpus de exemplos

Os exemplos usam três corpora, todos já em inglês:

- **Black Myth: Wukong** — lore de videogame (`99-EN/black-myth-wukong/`). Usado
  nos módulos de ingestão, chunking e geração.
- **Journey of Extinction / Husun** — universo de jogo sintético
  (`99-EN/journey-of-extinction-husun/`). Usado em embeddings, busca híbrida e
  reescrita de query.
- **Turismo de Shanxi** — descrições de patrimônio cultural chinês, com PDFs em
  inglês (`99-EN/shanxi-tourism/`, `99-EN/assets/shanxi-tourism/`). Usado em
  chunking, reranking e compressão.

O tema não importa. O que importa é que são corpora com características
diferentes — prosa longa, JSON estruturado, CSV, PDF com layout, imagens — e cada
característica quebra o RAG de um jeito distinto. É esse o ponto pedagógico.

---

## Como esta trilha foi calibrada

Ponto de partida assumido: **sólido em programação, zero em RAG.** Portanto:

- As três primeiras aulas são **conceituais, sem framework**. Você vai entender o
  que é um embedding e por que a similaridade de cossenos resolve algo antes de
  escrever `VectorStoreIndex.from_documents()`.
- Nada de "cole este código e funciona". Cada aula carrega a pergunta
  **"por que isso falha?"** — que é a tese do livro: quase todo desenvolvedor
  monta um pipeline RAG numa tarde; pouquíssimos sabem diagnosticar por que a
  recuperação erra.
- Cada aula aponta para arquivos reais do repositório. Você lê, roda, quebra de
  propósito e conserta.

---

## Estrutura de cada aula

1. **Pergunta motivadora** — o problema concreto que a aula resolve
2. **Modelo mental** — a intuição antes da API
3. **Código do repositório** — quais arquivos abrir, em que ordem
4. **Mão na massa** — o que rodar e o que observar na saída
5. **Quebre de propósito** — uma mudança que degrada o resultado, para você ver o
   mecanismo funcionando ao contrário
6. **Armadilhas de produção** — o que morde depois
7. **Checkpoint** — perguntas que você deve responder sem consultar
8. **Vocabulário** — termos novos, com entrada no [`GLOSSARIO.md`](GLOSSARIO.md)

---

## Plano de aulas

### Fase 0 — Fundamentos (sem framework)

| Aula                                                  | Tema                                                             | Módulo do repo    |
| ----------------------------------------------------- | ---------------------------------------------------------------- | ----------------- |
| [AULA-00](AULA-00-setup-do-ambiente.md)               | Setup do ambiente, chaves de API e a escolha Ollama vs. API paga | `91-Environment/` |
| [AULA-01](AULA-01-o-que-e-rag.md)                     | O que é RAG e qual problema real ele resolve                     | —                 |
| [AULA-02](AULA-02-vetores-embeddings-similaridade.md) | Vetores, embeddings e medidas de similaridade                    | —                 |
| [AULA-03](AULA-03-primeiro-rag.md)                    | Seu primeiro RAG: 5 linhas, e o mesmo sem framework              | `00-SimpleRAG/`   |

### Fase 1 — Ingestão de dados

| Aula                                            | Tema                                               | Módulo do repo             |
| ----------------------------------------------- | -------------------------------------------------- | -------------------------- |
| [AULA-04](AULA-04-carregando-texto-json-web.md) | Carregando texto, JSON, Markdown e páginas web     | `01-DataLoading/01`, `/02` |
| [AULA-05](AULA-05-pdf-layout-ocr-hierarquia.md) | PDF de verdade: layout, OCR e hierarquia pai-filho | `01-DataLoading/03`, `/04` |
| [AULA-06](AULA-06-tabelas-csv-sql.md)           | Tabelas, CSV e bancos SQL como fonte               | `01-DataLoading/05`        |

### Fase 2 — Representação

| Aula                                         | Tema                                                       | Módulo do repo    |
| -------------------------------------------- | ---------------------------------------------------------- | ----------------- |
| [AULA-07](AULA-07-chunking.md)               | Chunking: por caractere, recursivo, por código e semântico | `02-DocChunking/` |
| [AULA-08](AULA-08-embeddings-bm25-bge-m3.md) | Embeddings na prática, BM25 esparso e BGE-M3 híbrido       | `03-Embedding/`   |

### Fase 3 — Armazenamento e busca vetorial

| Aula                                                      | Tema                                                                               | Módulo do repo                                        |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [AULA-09](AULA-09-milvus-collections-schema-entidades.md) | Vector DB de verdade: collections, schema e entidades no Milvus                    | `04-VectorDB/Milvus/01`                               |
| [AULA-10](AULA-10-indices-ann.md)                         | Índices ANN: FLAT, IVF_FLAT, IVF_PQ, HNSW, DiskANN — e o trade-off recall/latência | `04-VectorDB/Milvus/02`, `/03`                        |
| [AULA-11](AULA-11-busca-hibrida-multimodal.md)            | Busca híbrida densa + esparsa, e recuperação multimodal                            | `04-VectorDB/HybridRetrieval`, `/MultimodalRetrieval` |

### Fase 4 — Pré-recuperação

| Aula                                     | Tema                                                             | Módulo do repo       |
| ---------------------------------------- | ---------------------------------------------------------------- | -------------------- |
| [AULA-12](AULA-12-query-construction.md) | Query construction: Text2SQL, Text2Cypher e filtros de metadados | `05-PreRetrieval/01` |
| [AULA-13](AULA-13-query-translation.md)  | Query translation: reescrita, decomposição, HyDE e clarificação  | `05-PreRetrieval/02` |
| [AULA-14](AULA-14-query-routing.md)      | Query routing lógico e semântico                                 | `05-PreRetrieval/03` |

### Fase 5 — Otimização de índice

| Aula                                                         | Tema                                                              | Módulo do repo          |
| ------------------------------------------------------------ | ----------------------------------------------------------------- | ----------------------- |
| [AULA-15](AULA-15-small-to-big.md)                           | Small-to-big: janela deslizante, pai-filho e expansão de contexto | `06-Indexing/01`        |
| [AULA-16](AULA-16-indice-hierarquico-multi-representacao.md) | Índice hierárquico e multi-representação                          | `06-Indexing/02`, `/03` |

### Fase 6 — Pós-recuperação

| Aula                                  | Tema                                                              | Módulo do repo               |
| ------------------------------------- | ----------------------------------------------------------------- | ---------------------------- |
| [AULA-17](AULA-17-reranking.md)       | Reranking: RRF, cross-encoder, ColBERT, Cohere, RankLLM, recência | `07-PostRetrieval/01`        |
| [AULA-18](AULA-18-compressao-crag.md) | Compressão de contexto e correção reflexiva (CRAG)                | `07-PostRetrieval/02`, `/03` |

### Fase 7 — Geração

| Aula                                              | Tema                                                           | Módulo do repo            |
| ------------------------------------------------- | -------------------------------------------------------------- | ------------------------- |
| [AULA-19](AULA-19-modelo-e-prompt-engineering.md) | Escolha de modelo e prompt engineering para RAG                | `08-Generation/01`, `/02` |
| [AULA-20](AULA-20-saida-estruturada.md)           | Saída estruturada: output parsers, Pydantic e function calling | `08-Generation/03`        |
| [AULA-21](AULA-21-self-rag.md)                    | Self-RAG e estratégias dinâmicas de geração                    | `08-Generation/04`        |

### Fase 8 — Avaliação

| Aula                            | Tema                                                          | Módulo do repo   |
| ------------------------------- | ------------------------------------------------------------- | ---------------- |
| [AULA-22](AULA-22-avaliacao.md) | Medir RAG: RAGAS, TruLens, DeepEval e avaliação do LlamaIndex | `09-Evaluation/` |

### Fase 9 — Paradigmas avançados

| Aula                                       | Tema                                          | Módulo do repo     |
| ------------------------------------------ | --------------------------------------------- | ------------------ |
| [AULA-23](AULA-23-graphrag.md)             | GraphRAG: quando o grafo ganha do vetor       | `10-AdvanceRAG/01` |
| [AULA-24](AULA-24-contextual-retrieval.md) | Contextual Retrieval                          | `10-AdvanceRAG/02` |
| [AULA-25](AULA-25-modular-rag.md)          | Modular RAG como arquitetura                  | `10-AdvanceRAG/03` |
| [AULA-26](AULA-26-agentic-adaptive-rag.md) | Agentic RAG e Adaptive RAG com LangGraph      | `10-AdvanceRAG/04` |
| [AULA-27](AULA-27-multimodal-rag.md)       | Multimodal RAG com Weaviate                   | `10-AdvanceRAG/05` |
| [AULA-28](AULA-28-projeto-final.md)        | Projeto final: um RAG seu, medido e defendido | todos              |

---

## Ritmo sugerido

| Perfil                         | Ritmo          | Duração total |
| ------------------------------ | -------------- | ------------- |
| Intensivo (dedicação integral) | 2 aulas/dia    | ~3 semanas    |
| Consistente (2h/dia)           | 1 aula/dia     | ~6 semanas    |
| Noites e fins de semana        | 3 aulas/semana | ~10 semanas   |

Não pule as Fases 0 a 2 — é onde a intuição se forma. Da Fase 3 em diante você
pode reordenar conforme a necessidade do seu projeto.

---

## Ferramental (CLI First)

O curso tem duas ferramentas em `ferramentas/`, criadas depois que o gate v1 do agente
`@rag-specialist` registrou 3 alucinações de citação. Zero dependências externas.

| Comando                                      | O que faz                                                                                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `node ferramentas/gerar-fatos.js`            | Regenera `FATOS.md` — índice canônico com inventário por módulo e ~330 linhas-chave, cada uma com `arquivo:linha` **mais o conteúdo literal** |
| `node ferramentas/verify-citations.js --all` | Valida todas as citações dos `.md` do curso: caminho existe? linha está no range? Exit code 1 se houver inválida                              |

**Por que as duas, e não só o verificador:** o verificador pega caminho inexistente e linha
fora de range, mas **não** pega citação cujo conteúdo alegado não está naquela linha — isso
foi testado contra a alucinação real do gate, que passa como válida. O `FATOS.md` cobre essa
lacuna por construção: se a citação vem de dados extraídos por script, não há memória
preenchendo o caminho.

Estado atual: **1240 citações verificadas, 0 inválidas.**

---

## Referências

- [`GLOSSARIO.md`](GLOSSARIO.md) — termos técnicos de RAG em inglês, definidos em português
- [`HANDOFF.md`](HANDOFF.md) — **comece aqui** ao retomar em nova sessão: estado, workflow, achados e próximo passo
- [`FATOS.md`](FATOS.md) — índice canônico gerado a partir do repositório (não editar à mão)
- [`avaliacao/GATE-RAG-SPECIALIST.md`](avaliacao/GATE-RAG-SPECIALIST.md) — avaliação do agente `@rag-specialist`: nível L2, 3 alucinações, 9 lacunas onde não confiar sem verificar
- Livro: [_RAG from First Principles_, Packt](https://www.packtpub.com/en-us/product/rag-from-first-principles-first-edition/9781835888667)
- Repositório de código: `../RAG-from-First-Principles/`
