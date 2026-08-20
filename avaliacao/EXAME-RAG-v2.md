# Exame v2 — agente `rag-specialist` (Vetor)

30 questões **novas**, nenhuma repetida do [`EXAME-RAG.md`](EXAME-RAG.md). Mesma rubrica
([`RUBRICA.md`](RUBRICA.md)) e mesmos 10 capítulos.

Tipos: `F` fato verificável · `C` conceito · `A` armadilha · `J` julgamento.
Distribuição: 10 `F`, 10 `C`, 5 `A`, 5 `J` — **60 pontos**.

## Calibração deliberada deste exame

O v2 é mais duro que o v1 em dois eixos, de propósito:

1. **Mais julgamento.** `J` subiu de 4 para 5 questões. Foi o pior tipo no v1 (50%).
2. **Questões factuais miram as lacunas do `FATOS.md`.** O índice gerado cobre
   `03-Embedding` com 1 fato, `08-Generation` com 7, `91-Environment` com zero, e trunca
   `00-SimpleRAG`, `04-VectorDB` e `06-Indexing` no limite de 45. Várias questões `F` caem
   exatamente aí — logo exigem `grep -n` direcionado, não consulta ao índice. Isso testa o
   passo 2 do workflow, não só o passo 1.

Respostas em [`RESPOSTAS-v2.md`](RESPOSTAS-v2.md). Veredito em
[`GATE-RAG-SPECIALIST-v2.md`](GATE-RAG-SPECIALIST-v2.md).

---

## Capítulo 1 — Ingestão (`01-DataLoading`)

**Q01 `F`** — Liste os arquivos de `01-DataLoading/01-SimpleTextLoading/` e separe-os por
biblioteca: quais usam LangChain e quais usam LlamaIndex? Quantos são no total?

**Q02 `C`** — Qual a diferença entre "extrair texto de um documento" e "particionar um
documento em elementos tipados"? Por que a segunda abordagem preserva informação que a
primeira destrói?

**Q03 `A`** — PDF é um formato de texto. Então basta extrair o texto e indexar. Correto?

---

## Capítulo 2 — Chunking (`02-DocChunking`)

**Q04 `F`** — Que `chunk_size`, `chunk_overlap` e lista de separadores estão configurados em
`02-DocChunking/01-LangChain-CharacterTextSplitter.py` e em
`02-DocChunking/02-LangChain-RecursiveharacterTextSplitter.py`? Cite linhas. Há algo
inconsistente nos comentários desses arquivos?

**Q05 `C`** — O módulo tem `04-LangChain-ChunkingForCode.py` e
`04-LangChain-PlainChunkingForCode.py`. Por que código precisa de estratégia de chunking
própria, e qual o mecanismo que o LangChain oferece para isso?

**Q06 `J`** — Você vai indexar um acervo misto: contratos jurídicos, tickets de suporte e
código-fonte de um monorepo. Uma estratégia de chunking só, ou várias? Justifique e diga
como decidiria.

---

## Capítulo 3 — Embeddings (`03-Embedding`)

**Q07 `F`** — Para cada um dos 6 arquivos `.py` de `03-Embedding/`, diga qual modelo ou
técnica de embedding é usado. Cite arquivo e linha onde o modelo é declarado.

**Q08 `C`** — Explique por que um cross-encoder não pode ser usado para indexar um acervo,
mesmo sendo mais preciso que um bi-encoder. O que exatamente impede?

**Q09 `A`** — BM25 é de 1994. Modelos de embedding modernos já capturam tudo que ele captura,
com mais nuance. Posso descartar o esparso?

---

## Capítulo 4 — Vector DB (`04-VectorDB`)

**Q10 `F`** — Quais operações de busca o diretório `04-VectorDB/Milvus/03-SearchAndMetrics/`
cobre? Liste os arquivos. Dois deles tratam do mesmo tema com sufixos diferentes — quais, e
qual a diferença?

**Q11 `C`** — Em busca vetorial com filtro escalar, explique a diferença entre filtrar antes
e filtrar depois da busca ANN. Qual o risco de cada abordagem?

**Q12 `J`** — 2 milhões de vetores, multi-tenant: toda query filtra por `tenant_id`, e
nenhum tenant tem mais de 5 mil documentos. Que índice e que estratégia de particionamento
você escolheria, e por quê?

---

## Capítulo 5 — Pré-recuperação (`05-PreRetrieval`)

**Q13 `F`** — O diretório `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/` tem um
pipeline numerado. Liste os arquivos e descreva o que cada etapa faz.

**Q14 `C`** — Diferencie roteamento lógico de roteamento semântico. Que informação cada um
usa para decidir, e em que situação o semântico falha onde o lógico acerta?

**Q15 `A`** — Meus dados estão todos num banco relacional. Então Text2SQL resolve tudo e eu
não preciso de RAG vetorial. Certo?

---

## Capítulo 6 — Otimização de índice (`06-Indexing`)

**Q16 `F`** — Liste os arquivos de `06-Indexing/02-BuildingHierarchicalIndex/`. Dois deles
implementam índice two-tier no Milvus, um marcado como imaturo e outro como bem-sucedido —
identifique-os pelo nome exato.

**Q17 `C`** — Defina multi-representação e diga precisamente por que **hybrid retrieval não
é** multi-representação, embora ambos envolvam "mais de uma forma de buscar". Cite o arquivo
do repositório que implementa multi-representação de fato.

**Q18 `J`** — Em que situação um índice hierárquico de dois níveis **piora** o sistema em vez
de melhorar? Dê o caso e explique o mecanismo da degradação.

---

## Capítulo 7 — Pós-recuperação (`07-PostRetrieval`)

**Q19 `F`** — `07-PostRetrieval/01-Reranking/` tem 6 arquivos de reranking. Para cada um,
diga qual biblioteca ou técnica ele usa, com base nos imports.

**Q20 `C`** — Explique como combinar score de similaridade semântica com recência num
reranking, e por que somar os dois diretamente é um erro.

**Q21 `A`** — Compressão de contexto reduz tokens, então sempre melhora o pipeline: menos
custo e menos "lost in the middle". Posso aplicar sempre?

---

## Capítulo 8 — Geração (`08-Generation`)

**Q22 `F`** — Liste os arquivos de `08-Generation/03-ControllingFormatViaOutputParsing/` e
diga quantas abordagens distintas de controle de formato o diretório demonstra.

**Q23 `C`** — Output parser e function calling ambos produzem saída estruturada. Explique a
diferença de **mecanismo** entre os dois, e por que essa diferença afeta a taxa de falha.

**Q24 `A`** — Self-RAG é essencialmente um prompt melhor: você pede ao modelo para checar a
própria resposta. Posso implementar com uma instrução no prompt?

---

## Capítulo 9 — Avaliação (`09-Evaluation`)

**Q25 `F`** — Os 4 arquivos numerados de `09-Evaluation/` usam frameworks diferentes.
Identifique o framework de cada um e as métricas importadas, com arquivo e linha.

**Q26 `C`** — Explique como faithfulness pode estar alto enquanto a resposta ao usuário está
factualmente errada. Que métrica denuncia essa situação, e o que ela exige para funcionar?

**Q27 `J`** — Você assume um RAG em produção sem nenhum conjunto de avaliação e tem duas
semanas. Descreva o que constrói, em que ordem, e o que deixa de fora.

---

## Capítulo 10 — Paradigmas avançados (`10-AdvanceRAG`)

**Q28 `F`** — `10-AdvanceRAG/04-AgenticRAG/` tem `01-LangChain-AgenticRAG.py` e
`02-LangChain-AdaptiveRAG.py`. Qual a diferença de arquitetura entre os dois? Baseie-se no
código, não no nome.

**Q29 `C`** — No paper de Modular RAG, o que "módulo" significa concretamente? Como esse
enquadramento difere de "pipeline RAG configurável"?

**Q30 `J`** — Um cliente chega dizendo que quer GraphRAG porque leu um post no LinkedIn.
Como você conduz a conversa? O que pergunta antes de aceitar ou recusar?
