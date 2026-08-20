# Exame — agente `rag-specialist` (Vetor)

30 questões cobrindo os 10 capítulos. Tipos conforme [`RUBRICA.md`](RUBRICA.md):
`F` fato verificável · `C` conceito · `A` armadilha (premissa falsa) · `J` julgamento.

Respostas do avaliado em [`RESPOSTAS-v1.md`](RESPOSTAS-v1.md).
Veredito em [`GATE-RAG-SPECIALIST.md`](GATE-RAG-SPECIALIST.md).

Raiz do repositório de referência: `../../RAG-from-First-Principles/`

---

## Capítulo 1 — Ingestão de dados (`01-DataLoading`)

**Q01 `F`** — Quais bibliotecas/abordagens distintas de parsing de PDF o módulo
`01-DataLoading/04-PDFFileLoading/` demonstra? Cite arquivo por abordagem.

**Q02 `C`** — Explique a estratégia parent-child de ingestão: o que é indexado, o que
é entregue ao LLM, e qual problema isso resolve.

**Q03 `J`** — Você recebeu 40 mil PDFs, metade nativos e metade digitalizados. Sem
orçamento para processar todos com OCR de qualidade. Como você decide o que recebe
qual tratamento, e como detecta que um PDF precisa de OCR?

---

## Capítulo 2 — Chunking (`02-DocChunking`)

**Q04 `F`** — Que `chunk_size` e `chunk_overlap` estão configurados em
`00-SimpleRAG/03_LangChain_LCEL_RAG_v3.py`? Cite a linha.

**Q05 `A`** — Qual o melhor `chunk_size` para RAG?

**Q06 `C`** — Explique a diferença de mecanismo entre `CharacterTextSplitter`,
`RecursiveCharacterTextSplitter` e chunking semântico. Por que o recursivo produz
fronteiras melhores?

---

## Capítulo 3 — Embeddings (`03-Embedding`)

**Q07 `F`** — O módulo `03-Embedding/` é sobre embeddings, mas contém `03-BM25.py` e
`03-LangChain-BM25.py`. BM25 não é modelo de embedding. Por que está aí?

**Q08 `C`** — Quando a similaridade por produto interno é matematicamente idêntica à
de cosseno? E o que muda se essa condição não valer?

**Q09 `A`** — Meu recall está ruim. Vou trocar meu modelo de embedding de 384 para
1536 dimensões para melhorar. Faz sentido?

---

## Capítulo 4 — Vector storage e índices ANN (`04-VectorDB`)

**Q10 `F`** — Quais tipos de índice o diretório
`04-VectorDB/Milvus/02-Indexes/` cobre, e quais parâmetros de construção aparecem
no código? Cite valores e arquivos.

**Q11 `C`** — Explique o que `nlist` e `nprobe` controlam em IVF_FLAT, e o que
acontece com recall e latência ao aumentar cada um.

**Q12 `A`** — Se HNSW tem o melhor equilíbrio recall/latência, por que o repositório
ainda demonstra FLAT? É código legado?

---

## Capítulo 5 — Pré-recuperação (`05-PreRetrieval`)

**Q13 `F`** — Em `05-PreRetrieval/01-QueryConstruction/Text2Cypher/` existem dois
arquivos, um marcado `v1-Failed` e outro `v2-Succeeded`. Qual a intenção pedagógica
de versionar um exemplo que falha?

**Q14 `C`** — Explique HyDE. Por que gerar uma resposta hipotética e buscar pelo
embedding dela funciona melhor que buscar pelo embedding da pergunta?

**Q15 `J`** — Um usuário pergunta "compare o desempenho fiscal de 2023 e 2024 e
explique a maior divergência". Descreva o tratamento de query que você aplicaria e
por quê.

---

## Capítulo 6 — Otimização de índice (`06-Indexing`)

**Q16 `F`** — Que tipo de índice FAISS é usado em
`06-Indexing/02-BuildingHierarchicalIndex/98-TwoTierIndex-FAISS.py`, e quantas
instâncias de índice o arquivo cria? Cite linhas.

**Q17 `C`** — O que é a estratégia "small-to-big" e por que ela resolve uma tensão
que a escolha de `chunk_size` sozinha não resolve?

**Q18 `J`** — Índice hierárquico de dois níveis versus multi-representação: em que
situação você escolhe cada um?

---

## Capítulo 7 — Pós-recuperação (`07-PostRetrieval`)

**Q19 `F`** — Qual é o valor default do parâmetro `k` na função de RRF implementada
em `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py`, e qual a fórmula do score?
Cite a linha.

**Q20 `C`** — Por que RRF dispensa que os scores das listas fundidas sejam
comparáveis entre si? E por que isso é uma vantagem prática sobre somar scores
normalizados?

**Q21 `A`** — Recuperei os 20 melhores documentos por cosseno. Os cossenos são todos
acima de 0.8, então todos respondem à pergunta. Posso mandar todos ao LLM?

---

## Capítulo 8 — Geração (`08-Generation`)

**Q22 `F`** — Quais papers em PDF estão em
`08-Generation/04-DynamicGenerationOptimizationStrategies/`? Dê título e
identificador.

**Q23 `C`** — Explique o fenômeno "lost in the middle" e as duas consequências
diretas que ele tem sobre o desenho de um pipeline RAG.

**Q24 `A`** — Meu RAG está respondendo errado. Vou melhorar o prompt. Boa primeira
providência?

---

## Capítulo 9 — Avaliação (`09-Evaluation`)

**Q25 `F`** — Quais métricas do RAGAS são importadas em `09-Evaluation/01-RAGAS.py`?
Cite a linha do import.

**Q26 `C`** — Diferencie context precision de context recall, e diga qual delas
piora quando você aumenta o `top_k`.

**Q27 `A`** — Não tenho conjunto de perguntas com resposta conhecida, mas vou usar
LLM-as-a-judge. Isso substitui o ground truth?

---

## Capítulo 10 — Paradigmas avançados (`10-AdvanceRAG`)

**Q28 `F`** — Quais são os cinco subdiretórios de `10-AdvanceRAG/` e quais deles
contêm paper em PDF em vez de código executável?

**Q29 `C`** — Explique Contextual Retrieval. Qual problema específico do chunking ele
corrige, e a que custo?

**Q30 `J`** — Um cliente quer responder "quais os temas recorrentes de reclamação nos
últimos 5 mil tickets?". RAG vetorial clássico serve? Justifique e proponha a
arquitetura adequada.
