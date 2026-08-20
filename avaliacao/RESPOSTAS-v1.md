# Respostas — `rag-specialist` (Vetor), tentativa v1

Respostas às 30 questões de [`EXAME-RAG.md`](EXAME-RAG.md). Sujeitas a auditoria
adversarial independente conforme [`RUBRICA.md`](RUBRICA.md).

Caminhos relativos a `../../RAG-from-First-Principles/`.

---

## Capítulo 1 — Ingestão

**Q01 `F`** — Seis abordagens distintas em `01-DataLoading/04-PDFFileLoading/`:

| Abordagem                    | Arquivo                                                                               | Natureza                              |
| ---------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------- |
| PyPDF                        | `01-UsingPyPDF.py`                                                                    | extração de texto nativo              |
| PyMuPDF (fitz)               | `02-UsingPyMuPDF.py`                                                                  | extração de texto nativo, mais rápida |
| pytesseract + pdf2image      | `03-UsingPytesseract+pdf2image.py`                                                    | OCR sobre página rasterizada          |
| LlamaParse                   | `04-UsingLlamaParser.py`                                                              | serviço de parsing na nuvem           |
| Unstructured via LangChain   | `05-LangChain-Unstrucured-PDF-ExtractDocumentStructure.py`, `05-...-SimpleDisplay.py` | elementos tipados                     |
| Unstructured via `partition` | `06-Unstrctured-ParsePDFWithPartitionFunction-v1.py` e `-v2.py`                       | API direta do Unstructured            |

Mais três arquivos que não são "outra biblioteca" e sim outro propósito:
`07-Unstructed-PDF-CompareVariousModes.ipynb` (comparação de modos),
`08-AnalyzePDFLayout.ipynb` e `08-RenderPDFPageLayout.py` (análise de layout), e
`09-Parent-Child-Unstructured-LangChain.py` / `09-...-ParitionPDF.py` (hierarquia).

O eixo que organiza o módulo: **PDF nativo** (1, 2) → **PDF digitalizado, exige OCR**
(3) → **serviço externo** (4) → **estrutura e layout** (5, 6, 8) → **hierarquia** (9).

**Q02 `C`** — Parent-child: você indexa o **filho** (chunk pequeno, ex. uma sentença
ou parágrafo curto) e, quando ele é recuperado, entrega ao LLM o **pai** (a seção ou
o documento que o contém).

Resolve uma tensão que é insolúvel com um único tamanho de chunk: chunk pequeno tem
embedding preciso (poucos assuntos misturados, portanto vetor não diluído) mas
contexto insuficiente para o LLM responder; chunk grande tem contexto rico mas
embedding difuso, porque a média de muitos assuntos aponta para lugar nenhum.
Parent-child obtém precisão de busca do pequeno e contexto de geração do grande.

O repositório demonstra em `01-DataLoading/04-PDFFileLoading/09-Parent-Child-*.py`
(na ingestão) e em `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py`
(na recuperação).

**Q03 `J`** — Julgamento. Primeiro a detecção, que é barata e determinística:
extraia texto com PyPDF ou PyMuPDF e meça **caracteres extraídos por página**. PDF
nativo rende centenas; digitalizado sem camada de texto rende zero ou lixo isolado.
Um limiar simples (digamos, menos de 100 caracteres por página) classifica o acervo
inteiro em minutos, sem OCR nenhum. Cuidado com o caso híbrido: PDF nativo com
figuras que contêm texto — a detecção por página, não por documento, pega isso.

Depois a triagem por valor, não por tipo:

1. Extração nativa em todos — é quase gratuita, e resolve metade do acervo.
2. Nos digitalizados, **não OCR em tudo de imediato.** Ordene por valor de uso:
   frequência de acesso histórica, recência, se o documento é citado por outros.
   OCR o topo dessa lista.
3. Para o resto, OCR barato (Tesseract local) e marque no metadado a qualidade da
   extração — `ocr_confidence`, `chars_per_page`. Assim o retriever pode
   despriorizar, e você pode reprocessar depois sem redescobrir o que é ruim.

O ponto que eu defenderia: o metadado de qualidade de extração é o entregável mais
importante desse trabalho, e é o que quase todo projeto omite. Sem ele você não sabe
distinguir "não está no acervo" de "está, mas ilegível" — e são problemas com
soluções opostas.

---

## Capítulo 2 — Chunking

**Q04 `F`** — `chunk_size=1000` e `chunk_overlap=200`, em
`00-SimpleRAG/03_LangChain_LCEL_RAG_v3.py:17`, dentro de um
`RecursiveCharacterTextSplitter`. Os mesmos valores repetem nas versões `v1` e `v2`
do arquivo. Note que em `RecursiveCharacterTextSplitter` a unidade default é
**caractere**, não token.

**Q05 `A`** — A pergunta não tem resposta, e o problema está na pergunta.

Não existe `chunk_size` melhor em abstrato porque o ótimo depende de três coisas que
variam por projeto: (1) a granularidade da informação no corpus — um contrato com
cláusulas curtas e autocontidas pede chunk diferente de um artigo científico com
argumento que se desenvolve por páginas; (2) o tipo de pergunta — fato pontual versus
síntese; (3) o limite de tokens do modelo de embedding, acima do qual o excedente é
truncado em silêncio.

O que eu posso oferecer em vez do número:

- **Ponto de partida**, não resposta: algo na faixa de 500 a 1000 caracteres com
  10–20% de sobreposição, que é a ordem de grandeza dos exemplos do repositório.
- **Método para achar o seu:** varie o `chunk_size` mantendo tudo constante e meça
  recall contra um conjunto de perguntas com resposta conhecida. O próprio repo tem
  um exemplo dedicado a essa sensibilidade,
  `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py`, e em
  `06-Indexing/01-.../01-NodeSentenceSlidingWindow-EvalVersion.ipynb:18` há um
  comentário do próprio autor dizendo que 50, 100 e 250 dão resultados diferentes e
  perguntando por quê.
- **Saída da tensão:** se você não quer escolher, parent-child ou small-to-big
  (Q02, Q17) dissolvem parte do problema, porque desacoplam o tamanho que se indexa
  do tamanho que se entrega.

**Q06 `C`** — Os três mecanismos:

- **`CharacterTextSplitter`** corta em um único separador (default `"\n\n"`) e, se o
  bloco resultante ainda exceder o tamanho, aceita o excesso ou corta cru. É cego à
  estrutura.
- **`RecursiveCharacterTextSplitter`** tem uma **lista ordenada** de separadores
  (tipicamente `["\n\n", "\n", " ", ""]`). Tenta o primeiro; se os pedaços ainda
  ficarem grandes, aplica recursivamente o próximo na lista, só naquele pedaço.
- **Chunking semântico** ignora separadores: embute sentença por sentença e corta
  onde a distância de embedding entre vizinhas cresce, sinalizando mudança de
  assunto. No repo, `02-DocChunking/05-LlamaIndex-SemanticChunking.py`.

O recursivo produz fronteiras melhores porque respeita a **hierarquia natural do
texto**: só quebra parágrafo quando obrigado, só quebra linha quando obrigado, e só
quebra palavra em último caso. O resultado é que a maioria dos chunks termina em
fronteira semântica real, enquanto o `CharacterTextSplitter` corta no meio de frase
com frequência — e meia frase produz embedding ruim e contexto inútil.

Custo do semântico: uma chamada de embedding por sentença na indexação, o que o
torna significativamente mais caro que os dois primeiros, que são puramente
sintáticos.

---

## Capítulo 3 — Embeddings

**Q07 `F`** — BM25 está no módulo de embeddings porque o capítulo trata de
**representação de informação para recuperação**, e não apenas de vetores densos. Os
arquivos são `03-Embedding/03-BM25.py` e `03-Embedding/03-LangChain-BM25.py`.

A pista está na numeração: `03-BM25` fica entre `02-jina-embeddings-v3-clustering.py`
(denso) e `04-BGE-M3.py`. BGE-M3 emite representação **densa, esparsa e
multi-vetorial simultaneamente** — ou seja, o autor introduz o esparso (BM25) logo
antes do modelo que unifica os dois, preparando a busca híbrida do capítulo 4
(`04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-*.py`). BM25 é o
representante da família esparsa, e é ele que fornece o que o denso não dá:
correspondência literal de termo.

**Q08 `C`** — Produto interno equivale a cosseno quando os vetores estão
**normalizados** (norma L2 igual a 1). Nesse caso o denominador do cosseno,
‖A‖ × ‖B‖, vale 1, e a fórmula colapsa no numerador, que é exatamente o produto
interno. Por isso IP é a escolha eficiente com modelos que já normalizam: evita duas
raízes quadradas e uma divisão por comparação.

Se a condição não valer, os dois **divergem, e divergem de um jeito específico**: o
produto interno passa a favorecer vetores de maior magnitude. Em texto, magnitude
correlaciona com comprimento e com frequência de termos, então IP com vetores não
normalizados enviesa o ranking para documentos longos, independentemente de
relevância. O cosseno é imune porque só olha direção.

Ordenação por L2 também coincide com a por cosseno sob normalização, já que para
‖A‖=‖B‖=1 vale ‖A−B‖² = 2 − 2·(A·B) — L2 é função monotonicamente decrescente do
cosseno. É por isso que `00-SimpleRAG/05_RAG_from_Scratch_Ollama.py:30`, que usa
`faiss.IndexFlatL2` com `all-MiniLM-L6-v2`, funciona corretamente: o modelo
normaliza. Com vetores não normalizados, aquele mesmo código daria ranking errado.

**Q09 `A`** — A premissa está errada: **dimensão não é botão de qualidade.**

Aumentar de 384 para 1536 dimensões muda o modelo, e é a **mudança de modelo** que
pode melhorar ou piorar o recall — não a contagem de dimensões. Modelos de 384
dimensões bem treinados superam modelos de 1536 mal ajustados ao domínio com
frequência. O que a dimensão maior garante é o custo: 4× mais memória de índice, mais
banda, e busca mais lenta.

Antes de trocar, eu investigaria três hipóteses que causam recall ruim com muito mais
frequência que dimensionalidade:

1. **Idioma ou domínio do modelo.** É o defeito real presente neste repositório:
   `00-SimpleRAG/01_02_LlamaIndex_SwitchEmbeddingModel.py:14` usa `BAAI/bge-small-zh`
   — modelo **chinês** — sobre corpus que foi traduzido para inglês. Recall degradado
   sem erro nenhum. Se seu corpus é português, um modelo só-inglês tem o mesmo
   problema.
2. **Chunking.** Se a informação está cortada ao meio, nenhum embedding salva.
3. **Truncamento silencioso.** Chunk maior que o limite de tokens do modelo tem o
   excedente descartado sem aviso.

E se a natureza da falha for correspondência literal — código, SKU, nome próprio —
nenhuma dimensão resolve, porque é limitação estrutural do denso. Aí a resposta é
busca híbrida.

Julgamento: a ordem que eu seguiria é medir recall com o modelo atual, corrigir
idioma/domínio, revisar chunking, e só então considerar trocar de modelo — sempre
comparando **modelos**, não dimensões.

---

## Capítulo 4 — Vector storage e índices ANN

**Q10 `F`** — Cinco tipos, um arquivo cada, em `04-VectorDB/Milvus/02-Indexes/`.
Todos declaram `metric_type="L2"` na linha 34 e `index_type` na 35:

| Arquivo                   | `index_type` | Parâmetros de construção                      | Parâmetro de busca           |
| ------------------------- | ------------ | --------------------------------------------- | ---------------------------- |
| `01-milvus_flat_index.py` | `FLAT`       | nenhum                                        | —                            |
| `02-ivf_flat_index.py`    | `IVF_FLAT`   | `nlist: 64` (linha 38)                        | `nprobe: 10` (linha 65)      |
| `03-ivf_pq_index.py`      | `IVF_PQ`     | `nlist: 64`, `m: 32` (linhas 38–39)           | `nprobe: 10` (linha 67)      |
| `04-hnsw_index.py`        | `HNSW`       | `M: 64`, `efConstruction: 100` (linhas 38–39) | —                            |
| `05-DiskANN.py`           | `DISKANN`    | —                                             | `search_list: 32` (linha 62) |

Dois comentários do autor merecem registro: em `03-ivf_pq_index.py:38`, `nlist`
"usually set to 4\*sqrt(n)"; na linha 39, `m: 32` com a regra `dim/m >= 2`, exemplificada
com 128/32 = 4. Em `05-DiskANN.py:34`, o comentário diz que DiskANN suporta L2, IP ou
COSINE.

**Q11 `C`** — Ambos pertencem ao IVF (inverted file), que particiona o espaço
vetorial em células por k-means:

- **`nlist`** é parâmetro de **construção**: quantos clusters (centroides) o índice
  cria. Mais `nlist` = células menores e mais numerosas = busca potencialmente mais
  rápida por célula, mas fronteiras mais finas, o que aumenta a chance de o vizinho
  verdadeiro cair numa célula não visitada. Aumentar `nlist` sozinho, mantendo
  `nprobe` fixo, **derruba o recall** — porque você passa a inspecionar uma fração
  menor do espaço.
- **`nprobe`** é parâmetro de **busca**: quantas células, entre as `nlist`, são
  efetivamente varridas. Aumentar `nprobe` **sobe o recall e sobe a latência**, de
  forma aproximadamente linear no custo. No limite `nprobe = nlist` você reproduz
  busca exaustiva, com recall igual ao FLAT e nenhuma vantagem de velocidade.

A leitura correta é que os dois formam **um par**, não dois botões independentes: o
que governa recall é a razão `nprobe/nlist`, e o que governa latência é `nprobe`
absoluto. Ajustar um sem o outro é a causa mais comum de "meu IVF ficou rápido e
parou de achar as coisas".

**Q12 `A`** — Não é código legado, e a premissa de que HNSW é sempre melhor está
errada em dois pontos.

Primeiro, **FLAT tem um papel que HNSW não pode cumprir: ser a verdade de
referência.** FLAT é exato — recall por definição 1.0. É contra ele que você mede o
recall de qualquer índice aproximado. Sem FLAT você não tem como saber que seu HNSW
está a 0.92 e não a 0.99, e essa diferença é a coisa mais importante de se conhecer
num sistema de recuperação. Descartar FLAT é descartar o instrumento de medição.

Segundo, HNSW **não** é sempre melhor:

- Em acervo pequeno (milhares de vetores), FLAT é mais rápido na prática, porque não
  há overhead de navegação em grafo e a varredura cabe em cache.
- HNSW consome bem mais memória, pois guarda as listas de adjacência do grafo além
  dos vetores.
- Construção de HNSW é caro; FLAT é inserção pura.
- Sob filtro escalar muito restritivo, a navegação em grafo degrada — o grafo foi
  construído sem conhecer o filtro, e pode não haver caminho entre os nós que
  sobrevivem.
- HNSW não suporta bem remoção/atualização frequente.

É por isso que `00-SimpleRAG/05_RAG_from_Scratch_*.py:30` usa `faiss.IndexFlatL2`
para nove documentos: ANN ali seria absurdo. Julgamento: escolha ANN quando a
varredura exaustiva deixa de caber no orçamento de latência — não antes.

---

## Capítulo 5 — Pré-recuperação

**Q13 `F`** — Os arquivos são
`05-PreRetrieval/01-QueryConstruction/Text2Cypher/03-Text2Cypher-SNOMED-v1-Failed.py`
e `-v2-Succeeded.py`. A diferença está em como o schema chega ao LLM:

- **v1** monta um `schema_description` **escrito à mão** como string literal (a
  partir da linha 16: "You are accessing a SNOMED CT graph database, which mainly
  contains the following nodes and relationships").
- **v2** define `get_database_schema()` (linha 15) e **introspecciona o banco**.

A intenção pedagógica: mostrar que a causa da falha em Text2Cypher e Text2SQL
tipicamente **não é o LLM** — é a descrição de schema divergir do schema real. Um
schema escrito à mão envelhece, omite relação, erra nome de propriedade, e o modelo
gera Cypher sintaticamente válido e semanticamente impossível. A correção não é
prompt melhor: é ler o schema da fonte.

O mesmo padrão aparece em `Text2SQL/Sakila/05-text2sql-rag-v1-error.py` versus
`-v2-ok.py` e `-v3-agent.py`, o que reforça que é escolha editorial deliberada e não
arquivo esquecido. Julgamento: manter o exemplo que falha vale mais que o que
funciona, porque o modo de falha é o que transfere para o projeto do leitor.

**Q14 `C`** — HyDE (Hypothetical Document Embeddings): em vez de buscar pelo
embedding da pergunta, você pede ao LLM que **escreva uma resposta hipotética** —
inventada, possivelmente errada nos fatos — e busca pelo embedding **dela**. No repo:
`05-PreRetrieval/02-QueryTranslation/04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py`.

Funciona por uma assimetria de forma. O espaço de embedding não foi treinado para
alinhar pergunta com resposta; foi treinado para aproximar textos **parecidos entre
si**. E uma pergunta é textualmente muito diferente de um documento: curta,
interrogativa, sem o vocabulário técnico que o documento usa. "Como faço para
rescindir?" tem pouca sobreposição de superfície com um parágrafo que explica prazos
e multas de rescisão.

A resposta hipotética, por outro lado, **tem a forma de um documento**: extensão de
parágrafo, tom declarativo, e — crucialmente — o jargão que o LLM sabe que aparece
nesse tipo de texto. Ela cai numa vizinhança do espaço vetorial muito mais próxima
dos documentos reais que respondem à pergunta.

O detalhe contra-intuitivo, e o que faz a técnica parecer errada à primeira vista: a
resposta hipotética **pode estar factualmente errada e HyDE ainda funciona**, porque
ela nunca é mostrada ao usuário nem usada como evidência. Serve só como sonda
geométrica. O que importa é que ela esteja no bairro certo, não que esteja correta.

Custos: uma chamada extra de LLM por query, somando latência; e degradação quando o
modelo não conhece nada do domínio, caso em que a sonda aponta para o bairro errado
com confiança.

**Q15 `J`** — Julgamento. A pergunta "compare o desempenho fiscal de 2023 e 2024 e
explique a maior divergência" tem três características que exigem tratamentos
diferentes, e o erro seria aplicar só um.

1. **É composta.** Contém pelo menos três subperguntas: desempenho de 2023,
   desempenho de 2024, e a causa da maior divergência. Busca única com essa string
   inteira produz um embedding que é a média de tudo e aponta para lugar nenhum.
   Tratamento: **decomposição de query** — no repo,
   `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-*-MultiQueryRetriever.py`.
   Recupere separadamente para cada subpergunta e una os resultados.
2. **Carrega filtro temporal explícito.** "2023" e "2024" devem virar **filtro de
   metadado**, não termo de busca semântica. Se o ano ficar só no texto da query, você
   vai recuperar documentos de 2022 que mencionam 2023, e vai perder documentos de
   2023 que não escrevem o ano no corpo. Tratamento:
   `05-PreRetrieval/01-QueryConstruction/BuildingMetadataFilter/02-GenerateMetadataInQuery.py`.
3. **A parte comparativa provavelmente é numérica.** "Desempenho fiscal" com números
   exatos não deve sair de recuperação vetorial de prosa — deve sair de consulta
   estruturada. Se existir base tabular, **Text2SQL** é o caminho certo para os
   valores, e o RAG vetorial fica com a parte explicativa ("explique a divergência"),
   que é onde relatório e ata têm o porquê.

Ou seja, minha resposta é **roteamento** antes de tudo
(`05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py`): a query se bifurca, números
vão para SQL, explicação vai para o índice vetorial, e a síntese junta os dois.

Um erro que eu evitaria explicitamente: usar HyDE aqui. Gerar resposta hipotética
sobre números fiscais que o modelo não conhece produz sonda com valores inventados —
e, num domínio quantitativo, isso arrasta a recuperação para documentos errados.

---

## Capítulo 6 — Otimização de índice

**Q16 `F`** — `faiss.IndexFlatL2`, e o arquivo cria **duas** instâncias:
`desc_index` em `98-TwoTierIndex-FAISS.py:27` e `table_index` na linha 44.

São dois índices porque o exemplo é de índice de dois níveis: um índice sobre
descrições e outro sobre tabelas, consultados em estágios distintos — o primeiro para
localizar o candidato, o segundo para descer ao detalhe.

**Q17 `C`** — Small-to-big: **busque no pequeno, entregue o grande.** O que é
indexado e o que é enviado ao LLM deixam de ser o mesmo objeto.

Resolve exatamente a tensão que `chunk_size` sozinho não pode resolver, porque um
único número tem que servir a dois objetivos que pedem valores opostos:

- **para o embedding**, menor é melhor: um chunk que trata de um assunto só produz
  vetor bem localizado; um chunk grande produz a média de vários assuntos, e média de
  direções distintas é um vetor difuso que não fica próximo de nenhuma query
  específica
- **para a geração**, maior é melhor: o LLM precisa do entorno para responder — a
  sentença isolada "o prazo é de 30 dias" não diz prazo de quê

Com um único `chunk_size` você escolhe qual dos dois sacrificar. Small-to-big não
escolhe: indexa a unidade pequena e, no momento da entrega, expande.

O repositório mostra três variantes em
`06-Indexing/01-FromSmallChunksToLargeContext/`: janela deslizante de sentenças
(`01-NodeSentenceSlidingWindow.py`), pai-filho
(`02-ParentChildTextChunkRetrieval.py`) e expansão para frente e para trás
(`03-ForwardBackwardContextExpansion.py`). As três são a mesma ideia com formas
diferentes de definir "o grande".

**Q18 `J`** — Julgamento, e a distinção que eu faria é sobre **o que varia**:

**Índice hierárquico de dois níveis** (`06-Indexing/02-BuildingHierarchicalIndex/`)
— quando o acervo tem **estrutura de contenção natural** e é grande demais para busca
plana eficiente. Você busca primeiro num nível grosseiro (resumos de documento,
descrições de tabela) e só depois desce ao fino dentro do candidato. Ganho principal:
redução do espaço de busca, e a possibilidade de o nível grosseiro carregar
informação que o fino não tem. Casos: acervo com hierarquia real (norma → capítulo →
artigo), ou catálogo de tabelas antes de consultar linhas — que é exatamente o
`98-TwoTierIndex-FAISS.py` com `desc_index` e `table_index`.

**Multi-representação** (`06-Indexing/03-BuildingMultiRepresentationIndex/`) — quando
o **mesmo conteúdo** precisa ser encontrável por caminhos diferentes. Você indexa
várias representações do mesmo documento — o texto, um resumo gerado, perguntas
hipotéticas que ele responderia, palavras-chave extraídas — e todas apontam para o
mesmo original. Ganho: cobre a diversidade de formas com que usuários diferentes
perguntam a mesma coisa. Caso típico: base de conhecimento de suporte, onde o
documento é técnico e a pergunta é coloquial.

Regra prática que eu aplicaria: **hierárquico ataca escala; multi-representação ataca
variabilidade de query.** Se o problema é "tenho conteúdo demais", hierárquico. Se é
"os usuários perguntam de mil formas e minha busca só acha uma", multi-representação.
São ortogonais e podem coexistir — o `03-BuildingMultiRepresentationIndex/01-HybridRetrievalWithEnsembleRetriever.py`
já combina multi-representação com híbrido.

---

## Capítulo 7 — Pós-recuperação

**Q19 `F`** — Default `k=60`, na assinatura
`def reciprocal_rank_fusion(results: list[list], k=60):` —
`07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:98`.

Fórmula do score: `1 / (rank + k)`, implementada na linha 140 como
`rrf_score = 1 / (rank + k)` e descrita no cabeçalho do arquivo (linha 27) e na
docstring (linha 113). O docstring da linha 106 registra que 60 é "an empirical
value" — valor empírico, não derivado. O score de um documento é a **soma** de
`1/(rank+k)` sobre todas as listas em que ele aparece, o que é o acúmulo em
`fused_scores` na linha 141.

**Q20 `C`** — RRF só usa a **posição** de cada documento em cada lista, nunca o score
que produziu aquela posição. Por isso não importa que uma lista traga cosseno em
[0,1], outra traga BM25 numa escala ilimitada e uma terceira traga distância L2 onde
menor é melhor: todas são reduzidas a "1º, 2º, 3º", e a ordinalidade é a única
informação consumida.

A vantagem sobre normalizar e somar é mais profunda que conveniência:

1. **Normalização não torna scores comparáveis, só os coloca na mesma faixa.**
   Min-max sobre BM25 e sobre cosseno produz dois números em [0,1] que continuam
   significando coisas diferentes — um cosseno de 0.8 e um BM25 normalizado de 0.8 não
   representam graus equivalentes de relevância. Somá-los é somar unidades
   incompatíveis com aparência de rigor.
2. **Min-max é frágil a outlier e depende do conjunto.** Um único documento com score
   altíssimo comprime todos os outros para perto de zero. E como o mínimo e o máximo
   vêm da própria lista recuperada, o score normalizado de um documento **muda** se
   você mudar `top_k` — o que torna resultados não comparáveis entre execuções.
3. **RRF é robusto por construção.** O `k` no denominador amortece a diferença entre
   as primeiras posições, evitando que um único retriever confiante domine a fusão. Com
   `k=60`, a distância entre o 1º e o 2º lugar é pequena, o que é uma aposta
   deliberada: em fusão, concordância entre listas vale mais que convicção de uma só.

Custo: RRF **descarta magnitude**, e com isso a informação de que o 1º lugar era
muito melhor que o 2º, quando esse era o caso. É uma troca consciente de precisão por
robustez.

**Q21 `A`** — Duas premissas erradas aqui, e a segunda é a mais séria.

**Primeira: cosseno alto não significa "responde à pergunta".** Cosseno mede
proximidade de assunto. Um documento pode falar exatamente do tema e não conter a
resposta — a política de devolução e a reclamação sobre devolução são vizinhas no
espaço vetorial, e só uma responde "qual o prazo". Além disso, o valor absoluto de
cosseno **não é calibrado**: em muitos modelos, textos aleatórios do mesmo domínio já
ficam em 0.7–0.8, então 0.8 pode ser o piso, não um sinal de qualidade. O que informa
é a distribuição relativa dentro do seu corpus, e ela precisa ser medida.

**Segunda: mesmo que todos fossem relevantes, mandar 20 não é boa ideia.** Mais
contexto degrada a resposta por três vias: o efeito lost in the middle enterra o
trecho bom no meio; documentos parcialmente relevantes se contradizem e o modelo pode
escolher o errado; e você paga 20 chunks de tokens de entrada em toda chamada.

O que eu faria: **rerank** dos 20 e envio dos 3 a 5 melhores. Recuperar largo e
entregar estreito é justamente o desenho que o capítulo 7 do repositório defende — é
por isso que reranking existe como estágio separado da recuperação. Se o critério
"todos acima de 0.8" fosse suficiente, `07-PostRetrieval/` não precisaria existir.

Para decidir o número, medir: context precision cai à medida que você adiciona
chunks, e é ela que mostra onde está o ponto de virada.

---

## Capítulo 8 — Geração

**Q22 `F`** — Dois PDFs em
`08-Generation/04-DynamicGenerationOptimizationStrategies/`:

| Arquivo                         | Trabalho                    | Identificador                     |
| ------------------------------- | --------------------------- | --------------------------------- |
| `Self-RAG 2310.11511v1.pdf`     | Self-RAG                    | arXiv 2310.11511v1                |
| `RRR - 2023.emnlp-main.322.pdf` | RRR (Rewrite-Retrieve-Read) | ACL Anthology 2023.emnlp-main.322 |

O diretório também tem `Self-RAG-FullImplementation.py` e três imagens
(`graph.png`, `self-rag.png`) — ou seja, aqui o paper vem acompanhado de
implementação, diferente do que ocorre em `10-AdvanceRAG/01-GraphRAG/` e
`03-ModularRAG/`, que só têm o PDF.

**Q23 `C`** — Lost in the middle: a qualidade com que um LLM usa uma informação
depende de **onde** ela está no contexto. O desempenho é alto quando o material
relevante está no início ou no fim do prompt, e cai perceptivelmente quando está no
meio — a curva tem forma de U. O efeito é do modelo, não do seu pipeline, e persiste
mesmo em modelos com janela longa que "caberiam" todo o material.

Duas consequências diretas sobre o desenho:

1. **Recuperar largo e entregar estreito.** Se enfiar mais contexto degrada o uso do
   contexto, então o valor está em enviar menos e melhor. Isso justifica os dois
   estágios de `07-PostRetrieval/`: **reranking** (ordenar para que o melhor não caia
   no meio) e **compressão** (remover o que não responde, encurtando o prompt). Sem
   lost in the middle, comprimir seria só economia de token; com ele, é ganho de
   qualidade.
2. **A ordem de inserção é decisão de engenharia, não detalhe.** Como a posição
   importa, colocar o chunk de maior score nas extremidades — e não simplesmente em
   ordem decrescente do começo ao fim — é uma alavanca real. É também o argumento
   contra "manda tudo que couber": um prompt cheio tem mais posições ruins.

Uma terceira consequência, indireta: torna a avaliação obrigatória, porque o efeito é
invisível na inspeção manual — o trecho certo **está** no prompt, e você conclui que
o pipeline funcionou.

**Q24 `A`** — Não. É a primeira providência que quase todo mundo toma, e é quase
sempre a errada.

Mexer no prompt primeiro tem duas causas — é a parte visível e a mais fácil de editar
— e um problema: você está tratando o último estágio de um pipeline sem saber se a
falha nasceu ali. Se o trecho certo nunca foi recuperado, nenhum prompt o inventa. Se
o PDF entrou sem OCR, nenhum prompt lê o que não foi indexado. No melhor caso você
perde tempo; no pior, você "conserta" por acaso — o prompt passa a compensar o
sintoma e o defeito real fica escondido, para reaparecer com outra pergunta.

A ordem que eu seguiria, e ela é diagnóstica, não opinativa:

1. **Ingestão** — o documento que contém a resposta está indexado, e de forma
   legível? Verificação concreta: procure o texto da resposta no índice, não no
   arquivo original.
2. **Recuperação** — inspecione **o que voltou** para essa query, antes de olhar a
   resposta. Este é o passo que a maioria pula, e é o que decide entre os dois
   diagnósticos possíveis. Se o trecho certo não está no top-k, o problema é
   recuperação: chunking, modelo de embedding, `top_k`, métrica, ou falta de híbrido.
3. **Geração** — só se o trecho certo estava no contexto e a resposta ainda saiu
   errada. Aí sim: prompt, montagem de contexto, ordem, modelo.

E antes de qualquer uma das três: existe conjunto de avaliação? Sem ele, você vai
alterar algo, achar que melhorou, e não ter como saber.

---

## Capítulo 9 — Avaliação

**Q25 `F`** — `09-Evaluation/01-RAGAS.py:6` importa duas métricas:

```python
from ragas.metrics import Faithfulness, AnswerRelevancy
```

O arquivo as usa em momentos separados: `Faithfulness(llm=llm)` na linha 57, com o
comentário de que só precisa do modelo de geração, e `answer_relevancy` extraída dos
resultados nas linhas 90 e 97 — comparando um caminho open-source e um da OpenAI. Há
também um registro nas linhas 111–112 sobre uma mudança de API do RAGAS, em que o
`HuggingfaceEmbeddings` de `ragas.embeddings.base` foi substituído pelo
`HuggingFaceEmbeddings` do LangChain.

Vale notar o que **não** é importado: `context_precision` e `context_recall`. O
exemplo mede a qualidade da resposta, não a da recuperação.

**Q26 `C`** — As duas olham o contexto recuperado, mas por lados opostos:

- **Context precision** — dos trechos recuperados, que fração é de fato relevante.
  É a métrica do "quanto lixo eu trouxe". Denominador: o que foi recuperado.
- **Context recall** — do que era relevante e existia no acervo, que fração foi
  recuperada. É a métrica do "quanto eu deixei escapar". Denominador: o que deveria
  ter sido recuperado — e por isso **exige ground truth**, enquanto precision pode ser
  julgada só com o que voltou.

Aumentar `top_k` piora a **precision**. É quase aritmético: os documentos adicionais
entram por ordem decrescente de score, portanto são progressivamente menos
relevantes, e a fração de relevantes no conjunto cai. Recall, no mesmo movimento,
sobe ou fica igual — nunca cai, já que você só acrescentou candidatos.

É esse antagonismo que faz de `top_k` um ajuste e não uma escolha óbvia, e é ele que
dá sentido ao reranking: recuperar com `top_k` alto para ganhar recall, e reordenar
para restaurar precision no que efetivamente vai ao LLM. Reranking é o que permite
não pagar o preço usual do trade-off.

**Q27 `A`** — Não substitui, e a confusão aqui vale desfazer com cuidado, porque
LLM-as-a-judge é útil — só não para o que a pergunta propõe.

O que um juiz LLM consegue avaliar **sem** ground truth são propriedades
**internas**, que se verificam olhando apenas resposta e contexto: faithfulness (a
resposta é sustentada pelo contexto que foi dado?) e answer relevancy (a resposta
endereça a pergunta?). Não é coincidência que sejam exatamente as duas métricas
importadas em `09-Evaluation/01-RAGAS.py:6` — são as que dispensam gabarito.

O que ele **não** consegue avaliar é a propriedade que mais importa: **se a resposta
está certa**, e se o que era relevante foi recuperado. Um sistema pode ser
perfeitamente fiel a um contexto errado — resposta ancorada, coerente, e falsa.
Faithfulness alto com recall baixo é o pior estado possível de um RAG, porque parece
saudável em toda métrica que não exige gabarito. Context recall é indispensável
justamente porque é a métrica que denuncia isso, e ela é impossível sem saber o que
deveria ter vindo.

Há ainda dois problemas de método: o juiz é enviesado — favorece respostas longas,
fluentes e no estilo do próprio modelo — e é **não determinístico**, então a mesma
saída pode receber notas diferentes, o que compromete a comparação entre
configurações, que é o propósito de medir.

O que eu recomendaria em vez de escolher entre os dois: comece com um ground truth
**pequeno**. Vinte a cinquenta perguntas com resposta e trecho-fonte conhecidos já
mudam o jogo, e é trabalho de algumas horas — bem menos do que se imagina. Use o juiz
LLM para escalar o julgamento sobre um volume maior, mas **calibre-o** contra esse
conjunto pequeno, medindo o quanto ele concorda com o julgamento humano. Juiz não
calibrado é um número sem unidade.

---

## Capítulo 10 — Paradigmas avançados

**Q28 `F`** — Cinco subdiretórios de `10-AdvanceRAG/`:

| Subdiretório           | Conteúdo                                                                                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| `01-GraphRAG/`         | **só paper** — `GraphRAG - 2404.16130v2.pdf`                                                       |
| `02-ContextRetrieval/` | código — `LlamaIndex-Implementation.py`, `Milvus-Implementation.py`                                |
| `03-ModularRAG/`       | **só paper** — `ModularRAG-2407.21059v1.pdf`                                                       |
| `04-AgenticRAG/`       | código — `01-LangChain-AgenticRAG.py`, `02-LangChain-AdaptiveRAG.py`, mais três diagramas PNG      |
| `05-MultiModalRAG/`    | código — `01-Weaviate-Multimodal-Search.py`, `02-Weaviate-Multimodal-RAG.py`, `docker-compose.yml` |

Os dois sem código executável são `01-GraphRAG` e `03-ModularRAG`. Faz sentido
editorial: GraphRAG demanda infraestrutura de grafo e um pipeline de construção caro,
e Modular RAG é um framework conceitual de arquitetura, não uma técnica que se
demonstre em um script.

**Q29 `C`** — Contextual Retrieval: antes de indexar, cada chunk recebe um **prefixo
gerado por LLM** que o situa no documento de origem — algo como "este trecho é da
seção de rescisão do contrato X, que trata de prazos". Indexa-se o chunk **com** esse
prefixo. No repo: `10-AdvanceRAG/02-ContextRetrieval/`, em versão LlamaIndex e versão
Milvus.

O problema específico que corrige é a **perda de contexto causada pelo próprio ato de
chunkar**. Um chunk isolado frequentemente contém referências que só fazem sentido no
documento inteiro: "o prazo é de 30 dias", "conforme mencionado acima", "a empresa
deve notificar". Recuperado sozinho, esse chunk é ambíguo tanto para o embedding —
que não tem como saber de que contrato se trata — quanto para o LLM. Pior: pronomes e
elipses tornam o chunk textualmente parecido com chunks de outros documentos que
dizem coisas diferentes.

A diferença em relação a small-to-big (Q17) é importante: small-to-big resolve na
**recuperação**, expandindo no momento da entrega, e o embedding continua sendo do
chunk empobrecido. Contextual Retrieval resolve na **indexação**, enriquecendo o
vetor em si. São complementares, não alternativas.

Custos, e são reais: uma chamada de LLM **por chunk** na ingestão, o que em acervo
grande é o item mais caro do pipeline; reindexação completa se você mudar o prompt de
contextualização; e crescimento do índice, já que cada chunk fica maior. Em
contrapartida, é custo pago uma vez na ingestão, não por query.

**Q30 `J`** — Julgamento. RAG vetorial clássico **não serve**, e o motivo é
estrutural, não de ajuste.

A pergunta "quais os temas recorrentes de reclamação nos últimos 5 mil tickets?" é de
**agregação global**: a resposta não está em nenhum trecho do acervo. Ela é uma
propriedade do conjunto. Busca por similaridade recupera `top_k` — 5, 20, 100
tickets — e responde com base neles. O resultado vai parecer plausível e será
inválido: você obtém os temas dos tickets mais parecidos com a palavra
"reclamação", não os temas recorrentes dos 5 mil. E o sistema não avisa da diferença.
Aumentar `top_k` não resolve, porque o limite é a janela de contexto e o efeito lost
in the middle, não o retriever.

Isso não é falha de configuração: RAG vetorial é otimizado para **query-focused
retrieval** — encontrar o pedaço certo. A pergunta pede o oposto: sumarização do
todo.

Três arquiteturas adequadas, em ordem crescente de custo:

1. **Agregação em batch, offline** — e eu começaria por aqui. Classifique cada ticket
   uma vez, na ingestão, atribuindo tema e sentimento com um LLM ou um classificador
   treinado; grave como **metadado estruturado**. A pergunta então deixa de ser RAG e
   passa a ser um `GROUP BY tema ORDER BY count DESC` — exato, auditável, instantâneo
   e barato de repetir. Para 5 mil tickets é a resposta certa na maioria dos casos, e
   Text2SQL (`05-PreRetrieval/01-QueryConstruction/Text2SQL/`) dá a interface em
   linguagem natural por cima.
2. **GraphRAG** (`10-AdvanceRAG/01-GraphRAG/`, arXiv 2404.16130) — quando as
   perguntas de síntese são variadas e imprevisíveis, e não se resumem a contagem por
   categoria. Ele constrói um grafo de entidades e relações, agrupa em comunidades,
   gera resumos por comunidade e responde a query global compondo esses resumos. É a
   resposta de projeto quando "quais os temas recorrentes" é só a primeira de muitas
   perguntas globais.
3. **Sumarização hierárquica** (map-reduce) — resuma em lotes, resuma os resumos,
   suba até um nível que caiba no contexto. Mais simples que GraphRAG e sem
   infraestrutura de grafo; menos preciso em rastrear entidade através do acervo.

Julgamento explícito: eu **não** proporia GraphRAG de saída. O custo de construção do
grafo é alto e, se as perguntas globais se reduzem a contagem por categoria, a opção 1
entrega resultado exato por uma fração do custo — e exato é melhor que sintetizado
quando a pergunta é sobre frequência. GraphRAG se justifica pela **variedade** das
perguntas globais, não pelo tamanho do acervo.

O que eu diria ao cliente antes de qualquer arquitetura: as duas perguntas que
decidem o desenho são "essa pergunta será feita uma vez ou continuamente?" e "vocês
precisam do número exato ou de uma descrição?". A primeira decide entre offline e
online; a segunda, entre agregação estruturada e sumarização.
