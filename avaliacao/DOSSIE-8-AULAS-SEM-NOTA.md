# Dossiê mecânico — as 8 aulas sem nota independente

**Gerado por script em 19/08/2026, antes da auditoria. Não contém nota** — nota é do auditor
independente (`RUBRICA-AULAS.md`, "Auto-avaliação não conta"). Isto é o levantamento que um
script faz melhor que um auditor, para o auditor não gastar turno com ele.

As oito são **08, 15, 16, 19, 20, 21, 22 e 23** — as que nunca receberam nota, conforme a
"Recontagem de 19/08/2026" em `GATE-AULAS-v1.md`.

## Volume e citações

| Aula | Linhas | Palavras | Citações OK | BAD_LINE | BAD_ANCHOR | SKIPPED | NO_ANCHOR |
| ---- | ------ | -------- | ----------- | -------- | ---------- | ------- | --------- |
| 08   | 375    | 2606     | 27          | 0        | 3          | 0       | 8         |
| 15   | 325    | 2091     | 18          | 0        | 0          | 2       | 5         |
| 16   | 303    | 2109     | 16          | 0        | 0          | 2       | 4         |
| 19   | 640    | 4529     | 93          | 0        | 0          | 0       | 1         |
| 20   | 641    | 4664     | 97          | 0        | 9          | 0       | 14        |
| 21   | 561    | 4220     | 92          | 0        | 1          | 0       | 9         |
| 22   | 637    | 4909     | 123         | 0        | 2          | 0       | 0         |
| 23   | 510    | 4491     | 14          | 0        | 0          | 0       | 0         |

`BAD_LINE`/`MISPLACED`/`NOT_FOUND` em 0 nas oito. `BAD_ANCHOR` e `NO_ANCHOR` **não são erro
confirmado** — são referências que a heurística de âncora não resolveu, e fazem parte dos 49 em
triagem. Estão listadas por aula abaixo, com a linha, para o auditor conferir de qual arquivo a
referência fala.

**A tabela mede cobertura de citação, não qualidade.** A AULA-23 tem 14 citações em 4 490
palavras porque o módulo `01-GraphRAG/` do repositório não tem código — a aula é leitura de paper,
e isso está declarado nela. Poucas citações ali não é defeito; poucas citações numa aula sobre
código seria.

---

## AULA-08 — `AULA-08-embeddings-bm25-bge-m3.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:19` Modelo mental
- `:47` Os seis arquivos
- `:64` Parte 1 — Denso na prática, fora do RAG
- `:117` Parte 2 — BM25, da fórmula à biblioteca
- `:195` Parte 3 — BGE-M3: as três representações de uma vez
- `:234` Parte 4 — Multimodal
- `:252` Mão na massa
- `:290` Quebre de propósito
- `:311` Armadilhas de produção
- `:345` Checkpoint
- `:360` Vocabulário

**Referências cruzadas a abrir (7):** AULA-02, AULA-03, AULA-07, AULA-09, AULA-11, AULA-17, AULA-27 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (11):**

- `.env.example`
- `01-openai-embedding-recomendation-system.py`
- `02-jina-embeddings-v3-clustering.py`
- `03-BM25.py`
- `03-LangChain-BM25.py`
- `04-BGE-M3.py`
- `05-MultimodalEmbedding.py`
- `../99-EN/journey-of-extinction-husun/jina_games.csv`
- `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py`
- `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py`
- `GLOSSARIO.md`

**Referências que a âncora não resolveu (9):** NO_ANCHOR@75, NO_ANCHOR@82, NO_ANCHOR@92, NO_ANCHOR@93, NO_ANCHOR@99, NO_ANCHOR@100, BAD_ANCHOR@130, BAD_ANCHOR@136, NO_ANCHOR@155

**Candidatos a superlativo / alegação de unicidade (5)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:86` (_qualquer_) — O que isso ensina para RAG: **o "documento" pode ser qualquer coisa que você decida embutir.**
- `:144` (_todos os_) — - **`idf`** — termo raro no acervo pesa mais. Um termo presente em todos os documentos tem IDF
- `:259` (_único_) — Comece por aqui, não pelo `01`. É o único arquivo do curso inteiro em que você vê um algoritmo de
- `:318` (_a melhor_) — `intfloat/multilingual-e5-*` ou `paraphrase-multilingual-*` são pontos de partida melhores.
- `:329` (_única_) — regra única, e é por isso que a instrução real é ler o cartão do modelo antes de embutir o

## AULA-15 — `AULA-15-small-to-big.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:23` Modelo mental
- `:58` Parte 1 — Janela deslizante de sentenças
- `:119` Parte 2 — Pai-filho: o parent-child de verdade
- `:190` Parte 3 — Expansão para frente e para trás
- `:225` Mão na massa
- `:254` Quebre de propósito
- `:276` Armadilhas de produção
- `:295` Checkpoint
- `:311` Vocabulário

**Referências cruzadas a abrir (8):** AULA-01, AULA-04, AULA-05, AULA-07, AULA-14, AULA-16, AULA-17, AULA-22 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Candidatas a referência, a decidir à mão (1):** AULA-18 na linha 265 — número de dois dígitos numa linha que fala de outra Aula. Metade das candidatas do curso é referência real; a outra metade é contagem que só parece número de aula.

**Arquivos do repo citados (9):**

- `01-NodeSentenceSlidingWindow.py`
- `09-Evaluation/04-LlamaIndexEvaluation.py`
- `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py`
- `avaliacao/GATE-RAG-SPECIALIST.md`
- `02-ParentChildTextChunkRetrieval.py`
- `01-DataLoading/.../09-Parent-Child-*.py`
- `06-Indexing/.../02-ParentChildTextChunkRetrieval.py`
- `03-ForwardBackwardContextExpansion.py`
- `GLOSSARIO.md`

**Referências que a âncora não resolveu (6):** SKIPPED@163, NO_ANCHOR@60, NO_ANCHOR@88, NO_ANCHOR@89, NO_ANCHOR@90, NO_ANCHOR@193

**Candidatos a superlativo / alegação de unicidade (4)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:16` (_único_) — E a conclusão foi: com um único `chunk_size` você escolhe qual dos dois sacrificar.
- `:105` (_qualquer_) — nos dois "é o que torna a comparação uma comparação". Iguale o `top_k` antes de concluir qualquer
- `:205` (_sempre_) — - **`PrevNextNodePostprocessor(docstore=docstore, num_nodes=2)`** — expansão **fixa**: sempre
- `:264` (_a melhor_) — enorme; observe se a resposta melhora ou piora. Esse é o ponto onde _lost in the middle_ começa a

## AULA-16 — `AULA-16-indice-hierarquico-multi-representacao.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:22` Modelo mental
- `:74` Parte 1 — Índice hierárquico
- `:144` Parte 2 — Multi-representação
- `:194` Mão na massa
- `:228` Quebre de propósito
- `:251` Armadilhas de produção
- `:271` Checkpoint
- `:288` Vocabulário

**Referências cruzadas a abrir (4):** AULA-05, AULA-11, AULA-15, AULA-17 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (15):**

- `03-BuildingMultiRepresentationIndex/01-HybridRetrievalWithEnsembleRetriever.py`
- `avaliacao/GATE-RAG-SPECIALIST.md`
- `00-DirectlyLoadDocumentsIndexAndQA.py`
- `01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py`
- `02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py`
- `03-TwoTierIndex-PandasNode.py`
- `04-CoarseToFineExample.py`
- `05-HierarchicalMergingExample.py`
- `98-TwoTierIndex-FAISS.py`
- `99-QueryTest.py`
- `01-...WorkingButImmatureVersion.py`
- `02-...SuccessfulHierarchicalIndex.py`
- `02-BuildMultiRepresentationIndexWithMultiVectorRetriever.py`
- `01-HybridRetrievalWithEnsembleRetriever.py`
- `GLOSSARIO.md`

**Referências que a âncora não resolveu (5):** SKIPPED@99, NO_ANCHOR@117, NO_ANCHOR@134, NO_ANCHOR@215, NO_ANCHOR@238

**Candidatos a superlativo / alegação de unicidade (4)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:36` (_nunca_) — pergunta, o documento não é selecionado, e o nível 2 nunca é consultado. Busca plana teria achado.
- `:50` (_sempre_) — O que é **entregue** é sempre o documento original. O que varia é o que foi indexado para
- `:92` (_nunca_) — comparação é obrigatória e quase nunca é feita.
- `:135` (_nunca_) — **o resultado nunca é usado** — o retorno da função vem apenas do primeiro nível.

## AULA-19 — `AULA-19-modelo-e-prompt-engineering.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:24` Modelo mental
- `:75` Parte 1 — Invocar um modelo local (e o que o nome do diretório promete)
- `:155` Parte 2 — O único fine-tuning do repositório
- `:212` Parte 3 — Prompt que fixa formato, e um RAG que não recupera
- `:277` Parte 4 — Few-shot com exemplo escolhido por similaridade
- `:325` Parte 5 — A diversidade que o código não produz
- `:393` Parte 6 — Roteamento de prompt, e um teste que não testa o roteador
- `:486` Mão na massa
- `:522` Quebre de propósito
- `:556` Armadilhas de produção
- `:595` Checkpoint
- `:623` Vocabulário

**Referências cruzadas a abrir (6):** AULA-01, AULA-03, AULA-14, AULA-18, AULA-20, AULA-22 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (20):**

- `01-UsePromptTemplateToClarifyGenerationGoal.py`
- `08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py`
- `08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py`
- `.env.example`
- `08-Generation/01-ModelSelectionAndInvocation/.env.example`
- `08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py`
- `99-EN/black-myth-wukong/black_myth_wukong_setting.txt`
- `08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py`
- `08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py`
- `08-Generation/02-OptimizingResponseViaPrompts/.env.example`
- `08-Generation/.env.example`
- `08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py`
- `02-UseFewShotsToProvideReferenceForResponse.py`
- `04-SelectAppropriatePromptTemplateViaRouting.py`
- `03-IncreaseComprehensivenessAndDiversityOfResponse.py`
- `01-UsingQwen3.py`
- `02-FineTuningQwen3.py`
- `GLOSSARIO.md`
- `04-Pydantic-v1.py`
- `04-Pydantic-v2.py`

**Referências que a âncora não resolveu (1):** NO_ANCHOR@550

**Candidatos a superlativo / alegação de unicidade (30)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:18` (_única_) — Aula 03 deixou uma dívida: uma única frase no template (\_"I cannot find relevant information in the
- `:49` (_nunca_) — `01-UsePromptTemplateToClarifyGenerationGoal.py` para produção herda um RAG que nunca diz "não sei".
- `:53` (_o melhor_) — A pergunta "qual o melhor modelo para RAG?" é malformada, pela mesma razão que "qual o melhor
- `:57` (_elimina_) — discussão acontece dentro dele. É a restrição que elimina mais opções de uma vez.
- `:69` (_único_) — A Aula 01 estabeleceu a distinção. Este módulo é o único lugar do repositório onde ela aparece em
- `:109` (_único_) — **1. `device_map="auto"` é o único lugar onde hardware aparece.** Sem GPU, a carga cai para CPU e
- `:122` (_todos os_) — **não aparece em nenhum `.py` do repositório** — verificado por `grep -rn` sobre todos os arquivos
- `:155` (_único_) — ## Parte 2 — O único fine-tuning do repositório
- `:157` (_único_) — `08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py` tem 112 linhas e é o \*\*único
- `:159` (_todos os_) — sobre todos os `.py` retorna esse caminho e nenhum outro.
- `:181` (_todos os_) — ausência. Ajustar todos os pesos de um modelo de 0,6 B é factível numa GPU modesta; a técnica não
- `:208` (_o melhor_) — saber se o treino melhorou algo — o script imprime uma resposta e termina.
- `:240` (_qualquer_) — "Garanta exatidão" é um pedido que o modelo não tem como cumprir e vai atender de qualquer forma:
- `:267` (_qualquer_) — prompt (que é o assunto do arquivo), mas invalida qualquer conclusão sobre recuperação tirada dele.
- … e 16 outros no arquivo

## AULA-20 — `AULA-20-saida-estruturada.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:30` Modelo mental
- `:83` Parte 1 — O parser que valida mas não instrui
- `:134` Parte 2 — Grau 3: obrigar o JSON na chamada
- `:188` Parte 3 — O par `04-Pydantic` que não é um par
- `:258` Parte 4 — O par `05-function-calling`: mesma tarefa, mesmo provedor, camadas diferentes
- `:359` Parte 5 — O único arquivo do módulo com RAG, e cinco modos de sintetizar
- `:425` Parte 6 — Quando o schema obriga o modelo a inventar
- `:486` Mão na massa
- `:528` Quebre de propósito
- `:562` Armadilhas de produção
- `:600` Checkpoint
- `:624` Vocabulário

**Referências cruzadas a abrir (5):** AULA-17, AULA-18, AULA-19, AULA-21, AULA-22 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (18):**

- `04-Pydantic-v1.py`
- `03-JSON-Output.py`
- `04-Pydantic-v2.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py`
- `05-function-calling-v1-LangChain.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/03-JSON-Output.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v1.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py`
- `05-function-calling-v2-DeepSeek.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v1-LangChain.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v2-DeepSeek.py`
- `08-Generation/03-ControllingFormatViaOutputParsing/02-LlamaIndex-OutputParsing.py`
- `black_myth_wukong_wiki.txt`
- `black_myth_wukong_setting.txt`
- `08-Generation/03-ControllingFormatViaOutputParsing/.env.example`
- `01-LangChain-OutputParsing.py`
- `02-LlamaIndex-OutputParsing.py`
- `GLOSSARIO.md`

**Referências que a âncora não resolveu (18):** NO_ANCHOR@407, NO_ANCHOR@420, BAD_ANCHOR@501, BAD_ANCHOR@505, BAD_ANCHOR@510, BAD_ANCHOR@514, BAD_ANCHOR@515, BAD_ANCHOR@517, BAD_ANCHOR@518, BAD_ANCHOR@524, NO_ANCHOR@530, NO_ANCHOR@539, NO_ANCHOR@545, NO_ANCHOR@548, NO_ANCHOR@549, NO_ANCHOR@553, NO_ANCHOR@585, NO_ANCHOR@594

**Candidatos a superlativo / alegação de unicidade (26)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:25` (_garante_) — — é que **nenhuma delas garante que o conteúdo esteja certo**. Duas delas, como veremos, chegam a
- `:34` (_garante_) — | Grau | Mecanismo | O que garante | O que não garante | No módulo
- `:44` (_o melhor_) — > exceção de validação — erro em vez de silêncio, que já é muito melhor que o grau 3, mas não é
- `:70` (_nunca_) — Se você só parseia, o modelo nunca soube o que você esperava, e o parser vira detector de erro em
- `:72` (_nunca_) — como veremos, nunca usa a metade que instrui.
- `:103` (_nunca_) — Repare no que **não** acontece entre as duas linhas: o `parser` nunca é consultado sobre o formato
- `:105` (_todos os_) — `get_format_instructions` **não aparece em nenhum `.py` do repositório** — `grep -rn` sobre todos os
- `:106` (_nunca_) — arquivos `.py` não retorna nada. Todo o repositório usa parser como grau 2, nunca como grau 1+2.
- `:108` (_única_) — Consequência prática: a única coisa que diz ao modelo o que fazer é a frase `"in JSON format"` da
- `:168` (_garante_) — Isso é few-shot da Aula 19 aplicado a **esquema**: o modo JSON garante que virá um objeto, mas não
- `:173` (_elimina_) — não impede um objeto sintaticamente válido com as chaves erradas. O grau 3 elimina o erro de parse,
- `:248` (_qualquer_) — schema aceita qualquer string. Julgamento: com `Literal["excellent","good","fair","poor"]` ou um
- `:304` (_a melhor_) — lado é a melhor forma de entender que `bind_tools` não é mágica — é um serializador de schema.
- `:359` (_único_) — ## Parte 5 — O único arquivo do módulo com RAG, e cinco modos de sintetizar
- … e 12 outros no arquivo

## AULA-21 — `AULA-21-self-rag.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:24` Modelo mental
- `:73` Parte 1 — Os três juízes, em código
- `:172` Parte 2 — O gerador, e o prompt que você não pode auditar
- `:217` Parte 3 — O reescritor, e o segundo paper do diretório
- `:268` Parte 4 — O grafo, e os ciclos sem freio
- `:360` Parte 5 — O "FullImplementation" que nunca executa o grafo
- `:394` Parte 6 — CRAG e Self-RAG, lado a lado
- `:420` Mão na massa
- `:461` Quebre de propósito
- `:489` Armadilhas de produção
- `:525` Checkpoint
- `:544` Vocabulário

**Referências cruzadas a abrir (7):** AULA-13, AULA-17, AULA-18, AULA-19, AULA-20, AULA-22, AULA-26 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (9):**

- `.env.example`
- `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py`
- `Self-RAG-FullImplementation.py`
- `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py`
- `graph.png`
- `self-rag.png`
- `08-Generation/04-DynamicGenerationOptimizationStrategies/.env.example`
- `GLOSSARIO.md`
- `01-RAGAS.py`

**Referências que a âncora não resolveu (9):** NO_ANCHOR@137, NO_ANCHOR@138, NO_ANCHOR@139, NO_ANCHOR@167, NO_ANCHOR@203, NO_ANCHOR@379, BAD_ANCHOR@463, NO_ANCHOR@477, NO_ANCHOR@480

**Candidatos a superlativo / alegação de unicidade (20)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:15` (_único_) — único script do diretório para ver quais das três estão implementadas — e a resposta é duas.
- `:50` (_único_) — e exige treinar um modelo, o que a Aula 19 mostrou ser o único exemplo de fine-tuning do repositório
- `:55` (_sempre_) — Uma vez que o sistema pode voltar atrás, ele pode voltar atrás **para sempre**. Todo desenho
- `:154` (_sempre_) — material e critica a resposta, e recupera sempre.
- `:202` (_nunca_) — **3. `format_docs` é definida e nunca usada.** As linhas `Self-RAG-FullImplementation.py:83-84` definem a funç
- `:226` (_único_) — Este é o único componente que roda num modelo diferente
- `:318` (_sempre_) — produzir a mesma resposta — que será julgada "not supported" de novo. Não afirmo que trava sempre:
- `:319` (_garante_) — provedores não garantem determinismo perfeito, e o grader é ele mesmo um LLM que pode mudar de
- `:360` (_nunca_) — ## Parte 5 — O "FullImplementation" que nunca executa o grafo
- `:411` (_único_) — risco de laço. O Self-RAG tem **crítica da resposta** — o único dos dois que percebe uma resposta
- `:427` (_qualquer_) — **1. Leia o prompt que você não escreveu.** Antes de qualquer coisa, depois da linha 77, imprima o
- `:430` (_única_) — defesa; se não manda, ele é a única.
- `:441` (_qualquer_) — quantas vezes `---Transforming Query---` aparece antes de qualquer resposta, e olhe a pergunta em
- `:446` (_sempre_) — passe **sempre a original** ao reescritor. Compare os dois comportamentos.
- … e 6 outros no arquivo

## AULA-22 — `AULA-22-avaliacao.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:28` Modelo mental
- `:98` Parte 1 — RAGAS: duas métricas, dois embeddings e uma conclusão frágil
- `:194` Parte 2 — TruLens: medir por dentro do pipeline
- `:271` Parte 3 — DeepEval: vinte linhas, e o único com gabarito explícito
- `:323` Parte 4 — LlamaIndex: o único A/B controlado do repositório
- `:450` Parte 5 — Os quatro, lado a lado
- `:482` Mão na massa
- `:523` Quebre de propósito
- `:555` Armadilhas de produção
- `:596` Checkpoint
- `:618` Vocabulário

**Referências cruzadas a abrir (9):** AULA-07, AULA-10, AULA-15, AULA-19, AULA-20, AULA-21, AULA-23, AULA-24, AULA-28 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (15):**

- `requirements.txt`
- `.env.example`
- `09-Evaluation/01-RAGAS.py`
- `09-Evaluation/requirements.txt`
- `09-Evaluation/02-Trulens.py`
- `04-LlamaIndexEvaluation.py`
- `09-Evaluation/03-DeepEval.py`
- `01-RAGAS.py`
- `09-Evaluation/.env.example`
- `09-Evaluation/04-LlamaIndexEvaluation.py`
- `90-Data/ComplexPDF/ipcc_eval_qr_dataset.json`
- `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py`
- `02-Trulens.py`
- `03-DeepEval.py`
- `GLOSSARIO.md`

**Referências que a âncora não resolveu (1):** BAD_ANCHOR@495

**Candidatos a superlativo / alegação de unicidade (15)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:44` (_nunca_) — Note o que **falta** na tríade: ela mede o que o sistema trouxe, nunca o que ele **deixou** de
- `:65` (_nunca_) — recuperada. O primeiro é pré-requisito, nunca substituto.
- `:79` (_qualquer_) — É o teto de qualquer métrica que só olha pergunta, contexto e resposta: ela diz se as três coisas
- `:196` (_único_) — `09-Evaluation/02-Trulens.py` tem 124 linhas e é o único dos quatro cuja avaliação está
- `:228` (_único_) — saída; context relevance sobre entrada e cada contexto. Este é o único dos quatro scripts que mede as
- `:261` (_único_) — **2. Um documento no store, `n_results=2`.** O corpus é um único `add` com um texto
- `:271` (_único_) — ## Parte 3 — DeepEval: vinte linhas, e o único com gabarito explícito
- `:273` (_único_) — `09-Evaluation/03-DeepEval.py` tem 21 linhas e é o exemplo mais enxuto do módulo — e o único que
- `:323` (_único_) — ## Parte 4 — LlamaIndex: o único A/B controlado do repositório
- `:352` (_único_) — `SemanticSimilarityEvaluator` é o único sem LLM — compara embeddings da resposta e da referência.
- `:416` (_única_) — um `grep -rn` por `/home/huangj2` restrito a arquivos `.py` no repositório inteiro retorna \*_esta única linha_
- `:478` (_única_) — a única coisa que nenhuma quantidade de prompt conserta.
- `:586` (_única_) — **Métrica única como gate.** Um limiar por métrica, e nunca uma média das quatro: a média deixa uma
- `:588` (_elimina_) — rubrica de avaliação do agente deste projeto tem portas eliminatórias por capítulo.
- … e 1 outros no arquivo

## AULA-23 — `AULA-23-graphrag.md`

**Seções canônicas:** as 7 de título fixo estão presentes. A terceira seção ("Código do repositório") usa título próprio por aula — ver os `##` abaixo.

**Estrutura (`##`):**

- `:7` Pergunta motivadora
- `:28` Modelo mental
- `:75` Parte 1 — O que este diretório contém, e o que isso significa
- `:120` Parte 2 — O pipeline, como o paper o descreve
- `:189` Parte 3 — Os números, e o que eles realmente dizem
- `:298` Parte 4 — Como o paper mede, e por que isso interessa depois da Aula 22
- `:348` Parte 5 — Reconhecer a pergunta global no seu próprio sistema
- `:373` Mão na massa
- `:406` Quebre de propósito
- `:435` Armadilhas de produção
- `:467` Checkpoint
- `:492` Vocabulário

**Referências cruzadas a abrir (7):** AULA-12, AULA-16, AULA-18, AULA-20, AULA-22, AULA-24, AULA-25 — a RUBRICA pontua **O** (coerência externa) por conferir cada uma **na aula referida**.

**Arquivos do repo citados (8):**

- `.env.example`
- `10-AdvanceRAG/01-GraphRAG/.env.example`
- `10-AdvanceRAG/.env.example`
- `README.md`
- `10-AdvanceRAG/requirements.txt`
- `05-PreRetrieval/01-QueryConstruction/Text2Cypher/03-Text2Cypher-SNOMED-v2-Succeeded.py`
- `09-Evaluation/04-LlamaIndexEvaluation.py`
- `GLOSSARIO.md`

**Candidatos a superlativo / alegação de unicidade (13)** — a RUBRICA pontua **H** por "sem superlativo absoluto não qualificado"; cada um destes é candidato, **não** achado:

- `:110` (_único_) — O único `.py` do repositório que fala com um banco de grafos é o par Text2Cypher da Aula 12 —
- `:150` (_qualquer_) — Detalhe de implementação que o paper dá e que vale para qualquer um que reimplemente: o Leiden foi
- `:167` (_nunca_) — Comunidades de nível mais alto se resumem a partir dos resumos das de baixo. O resumo nunca lê o
- `:214` (_todas as_) — ganhe, para confirmar que o juiz não está apenas premiando texto longo. E o vetor ganha em todas as
- `:342` (_a melhor_) — perguntas de sensemaking. Julgamento: é a melhor coisa disponível para essa classe de pergunta, e
- `:355` (_nunca_) — 2. **Aumentar `k` melhora um pouco e nunca resolve.** Se a qualidade sobe com `k` e continua
- `:356` (_qualquer_) — incompleta em qualquer `k`, você está amostrando um todo.
- `:368` (_qualquer_) — outra parte melhor que qualquer LLM. O grafo é a resposta quando as entidades e suas relações são o
- `:411` (_única_) — **1. Tire a hierarquia.** Suponha uma única partição, sem níveis. Você perde o `C0` — e com ele os
- `:414` (_todos os_) — **2. Tire a exaustividade.** Suponha que as comunidades se sobreponham ou não cubram todos os nós. A
- `:429` (_todas as_) — **5. Julgue só por `directness`.** O paper mostra que o vetor ganha nesse critério em todas as
- `:487` (_único_) — 12. O que existe neste diretório do repositório, e onde está o único código do repo que fala com um
- `:509` (_qualquer_) — > em Milvus, e o par pede `diff` antes de qualquer frase comparativa.

---

## O que este dossiê NÃO faz

- **Não dá nota.** Nem parcial. A RUBRICA exige auditor independente instruído a refutar.
- **Não confere conteúdo de linha citada.** É a lacuna que a própria RUBRICA aponta como "o
  trabalho do auditor": a ferramenta valida caminho e range, não se a linha diz o que a aula
  afirma. Três citações da rodada anterior apontavam para a linha adjacente.
- **Não julga os superlativos listados.** "sempre" numa frase sobre matemática de vetores é
  correto; numa frase sobre desempenho de índice, é candidato a `H` baixo. A lista é ponto de
  partida, e marcar tudo como falha seria o erro inverso.

_Primeira versão deste dossiê marcava "Código do repositório" como seção ausente nas oito aulas.
Era falso positivo do detector: a seção existe, com título próprio em cada aula. Conferido em
`AULA-08-embeddings-bm25-bge-m3.md:47` ("Os seis arquivos") e `AULA-23-graphrag.md:75`._

_**O extrator de referências cruzadas deste dossiê teve três bugs, todos de subcontagem e todos
achados por comparação com verdade externa — nenhum por leitura do código.**_

_1. A versão que os lotes A-D usaram perdia o segundo número em "Aulas 04 e 05" e o número nu em
"e a 18". Listou 7 referências na AULA-15 quando havia 9; foi o auditor do lote A que pegou._

_2. A primeira correção passou a varrer linha por linha e perdeu a referência quebrada na virada de
linha — `AULA-23:164-165` traz "na Aula" numa linha e "18, aplicado" na seguinte. Apareceu ao
comparar a contagem antes e depois da correção._

_3. A segunda correção voltou a casar no texto inteiro, mas neutralizava spans de backtick também no
texto inteiro — e ``/`[^`]*`/`` atravessa a quebra de linha, então um span aberto num fence apagava
blocos e levava prosa junto. A AULA-20 caiu de 5 para 3 referências, perdendo "(Aula 17)" e
"(Aula 18)" em `:594-595`. Apareceu pela mesma comparação de contagem._

_Estado atual: as formas certas casam no texto inteiro, a neutralização de backtick roda por linha, e
as três verdades conhecidas estão fixadas como teste de regressão no extrator. A lição das três é a
mesma: **a contagem só se valida contra um número medido por fora**, e cada correção precisa rodar o
teste das anteriores._
