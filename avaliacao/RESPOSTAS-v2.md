# Respostas — `rag-specialist` (Vetor), tentativa v2

Respostas às 30 questões de [`EXAME-RAG-v2.md`](EXAME-RAG-v2.md).

**Workflow aplicado** (persona § "Ferramental obrigatório"): fatos consultados no
`FATOS.md` quando presentes; onde o índice tem lacuna (`03-Embedding`, `08-Generation`,
`91-Environment`) ou está truncado no limite de 45, feito `grep -n`/`ls` direcionado **com o
path visível**. Verificador rodado antes de entregar.

Caminhos relativos a `../../RAG-from-First-Principles/`.

---

## Capítulo 1 — Ingestão

**Q01 `F`** — **11 arquivos.** Separação feita por `grep -ln` nos imports, não pelo nome:

| Biblioteca              | Arquivos                                                                                                                                                                                                                                                                                                                                           | Total |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **LangChain**           | `00-SimpleDocumentImport(LangChain).ipynb`, `01-LoadTxtFileWithLangChain.py`, `02-BuildLangChainDocumentObject.py`, `03-01-LoadAllDocumentsInDirectoryWithLangChain.py`, `03-02-SpecifyParamsWhenLoadingDirectoryWithLangChain.py`, `03-03-ChangeToolWhenLoadingDirectoryWithLangChain.py`, `03-04-SkipErrorsWhenLoadingDirectoryWithLangChain.py` | 7     |
| **LlamaIndex**          | `05-LoadDirectoryDocumentsWithLlamaIndex.py`, `06-LlamaIndex-BuildDocumentObject.py`                                                                                                                                                                                                                                                               | 2     |
| **Unstructured direto** | `07-UsingUnstructured_v1.py`, `07-UsingUnstructured_v2.py`                                                                                                                                                                                                                                                                                         | 2     |

7 + 2 + 2 = 11, e a numeração salta o `04` — não há arquivo com esse prefixo.

Um detalhe que o `grep` revelou e o nome esconderia: `03-01-LoadAllDocumentsInDirectoryWithLangChain.py`
aparece **nas duas** buscas, por `langchain` e por `unstructured`. Não é contradição — o
`DirectoryLoader` do LangChain usa `UnstructuredLoader` como classe default, então o arquivo
importa os dois. Ele conta na coluna LangChain porque é essa a API que o exemplo exercita; o
Unstructured entra como dependência interna, e é justamente o que
`03-03-ChangeToolWhenLoadingDirectoryWithLangChain.py` mostra como trocar.

**Q02 `C`** — **Extrair texto** produz uma sequência de caracteres: você recebe o conteúdo e
perde tudo que não é conteúdo. **Particionar em elementos tipados** produz uma lista de
objetos, cada um com um rótulo — `Title`, `NarrativeText`, `Table`, `ListItem`, `Image` — e
metadados de posição.

O que a primeira abordagem destrói, concretamente:

- **Hierarquia.** Um parágrafo extraído como texto corrido não sabe de qual seção veio. Com
  elementos tipados, o `Title` anterior é recuperável — e é isso que viabiliza parent-child.
- **Tabelas.** Texto corrido transforma uma tabela em números soltos sem cabeçalho. O tipo
  `Table` preserva a estrutura, e o chunk pode ser indexado como tabela.
- **Ordem de leitura em layout multicoluna.** Extração ingênua lê a página da esquerda para a
  direita atravessando colunas, intercalando frases de colunas diferentes. Análise de layout
  reconstrói a ordem correta.
- **A distinção conteúdo/ruído.** Cabeçalho, rodapé e número de página entram no texto
  extraído como se fossem conteúdo, e depois poluem chunks e embeddings.

No repositório, é a diferença entre `01-DataLoading/04-PDFFileLoading/01-UsingPyPDF.py`
(extração) e `01-DataLoading/04-PDFFileLoading/06-Unstrctured-ParsePDFWithPartitionFunction-v1.py`
(partição em elementos).

**Q03 `A`** — A premissa está errada em dois níveis, e o segundo é o que morde em produção.

**Primeiro: PDF não é formato de texto.** É um formato de _descrição de página_ — um conjunto
de instruções de desenho que posicionam glifos em coordenadas. Não existe "o texto do PDF"
armazenado como parágrafo; existe "coloque o glifo 'a' em (x,y)". O parser **reconstrói** a
leitura a partir de posições, e é por isso que existem várias bibliotecas com resultados
diferentes para o mesmo arquivo — cada uma tem heurística própria de agrupamento. É também
por isso que `01-DataLoading/04-PDFFileLoading/` tem seis abordagens distintas em vez de uma.

**Segundo: parte dos PDFs não tem camada de texto nenhuma.** Um PDF digitalizado é uma imagem
dentro de um contêiner PDF. A extração "funciona" — retorna string vazia, sem erro. Você
indexa nada, o documento fica invisível para o retriever, e nenhuma métrica de geração
acusa. É por isso que `03-UsingPytesseract+pdf2image.py` existe: rasteriza a página e roda
OCR.

O que eu faria em vez de "extrair e indexar": medir caracteres extraídos por página para
classificar o acervo, e tratar cada classe de forma diferente — nativo vai por extração,
digitalizado vai por OCR, e a qualidade da extração vira metadado. Julgamento: esse metadado
é o item que quase todo projeto omite, e sem ele você não distingue "não está no acervo" de
"está, mas ilegível".

---

## Capítulo 2 — Chunking

**Q04 `F`** — Os dois arquivos usam **os mesmos valores**, `chunk_size=100` e
`chunk_overlap=10`:

| Arquivo                                                        | `chunk_size` | `chunk_overlap` | Separadores             |
| -------------------------------------------------------------- | ------------ | --------------- | ----------------------- |
| `02-DocChunking/01-LangChain-CharacterTextSplitter.py`         | linha 7      | linha 8         | não declarado (default) |
| `02-DocChunking/02-LangChain-RecursiveharacterTextSplitter.py` | linha 9      | linha 10        | linha 6                 |

Separadores da linha 6 do segundo arquivo: `["\n\n", ".", "，", " "]`, com o comentário do
autor explicando que `.` é ponto, `，` é vírgula e `" "` é espaço.

**Sim, há duas inconsistências — e ambas estão nos comentários do arquivo 01:**

1. Linha 7: `chunk_size=100,  # each text chunk is 50 characters` — o comentário diz 50, o
   valor é 100.
2. Linha 8: `chunk_overlap=10,  # no overlap between chunks` — o comentário diz que não há
   sobreposição, e o valor é 10.

São resíduos de edição: o autor provavelmente ajustou os valores e não atualizou os
comentários. Material didático direto para a Aula 07 — e um bom exercício de leitura crítica,
porque um leitor apressado sai do arquivo com dois números errados na cabeça.

Nota adicional: o separador `，` é a vírgula ideográfica (U+FF0C), usada em chinês. Num corpus
em inglês ou português ela nunca casa, então na prática a lista efetiva de separadores desse
exemplo é `["\n\n", ".", " "]` — resíduo da origem do livro, do mesmo gênero do
`bge-small-zh`.

**Q05 `C`** — Código quebra as premissas do chunking de prosa. Um splitter de texto corta em
parágrafo, frase e espaço; em código, essas fronteiras não correspondem a unidades
semânticas. Cortar no meio de uma função produz um chunk com corpo sem assinatura — que não
diz o que faz — e outro com assinatura sem corpo. Pior: a indentação, que em Python carrega
o escopo, perde o referencial.

O mecanismo do LangChain é trocar a **lista de separadores** por uma específica da linguagem,
mantendo o mesmo algoritmo recursivo. Em
`02-DocChunking/04-LangChain-ChunkingForCode.py` isso aparece de duas formas:

- linha 3: `RecursiveCharacterTextSplitter.get_separators_for_language(Language.JS)` — obtém
  a lista de separadores de JavaScript, útil para inspecionar o que a biblioteca considera
  fronteira naquela linguagem;
- linhas 69–70: `RecursiveCharacterTextSplitter.from_language(language=Language.PYTHON, ...)`
  — o construtor que já vem com os separadores da linguagem.

Os separadores por linguagem são as palavras-chave de declaração: `class `, `def `,
`\nclass`, `\ndef` para Python; `function `, `const `, `class ` para JS. O splitter então
prefere quebrar **entre** declarações, e só desce a linha e espaço quando obrigado.

O par `04-LangChain-PlainChunkingForCode.py` é o contraste deliberado: mesmo código, splitter
genérico (linha 1 importa apenas `RecursiveCharacterTextSplitter`, sem `Language`). Comparar
as duas saídas é o exercício — o genérico corta dentro de funções, o específico não.

**Q06 `J`** — Julgamento: **várias estratégias, uma por tipo de conteúdo**, e a decisão é de
arquitetura de ingestão, não de parâmetro.

O motivo é que os três acervos têm granularidade de resposta diferente:

| Acervo    | Unidade que responde                      | Estratégia                                                                                       |
| --------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Contratos | a cláusula — curta, autocontida, numerada | recursivo com separador de cláusula; parent-child para devolver o artigo inteiro                 |
| Tickets   | o ticket, ou o par pergunta-resolução     | **não chunkar** se o ticket é curto: um ticket = um chunk. Chunkar quebra o par problema-solução |
| Código    | a função ou classe                        | splitter por linguagem (`from_language`), como em Q05                                            |

O ponto que eu defenderia: **misturar os três num único índice com um único `chunk_size` é o
erro mais caro aqui**, e não por causa do tamanho. É porque as três fontes competem no
ranking. Uma pergunta sobre cláusula de multa vai recuperar tickets que mencionam multa, e
eles vão ocupar posições do top-k. A resposta não é ajustar o chunk: é **separar por índice
ou por metadado** e rotear (`05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py`), ou no
mínimo filtrar por tipo de fonte.

Como eu decidiria, em ordem: (1) escrever 15–20 perguntas reais, cinco por acervo; (2) marcar
para cada uma qual fonte e qual trecho responde; (3) o item 2 revela a unidade de resposta de
cada acervo, e é ela que define o chunking; (4) medir recall por acervo separadamente —
média global esconderia um acervo quebrado, exatamente como a média por capítulo esconderia
no gate v1.

Custo dessa abordagem: três pipelines de ingestão para manter em vez de um, e a necessidade
de roteamento. Vale quando os acervos têm formatos realmente distintos — não vale para
variações de prosa.

---

## Capítulo 3 — Embeddings

**Q07 `F`** — Seis arquivos. O `FATOS.md` cobre este módulo com apenas 1 fato, então isto
veio de `grep -n` direcionado:

| Arquivo                                       | Modelo / técnica                                 | Onde                                                                       |
| --------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------- |
| `01-openai-embedding-recomendation-system.py` | OpenAI `text-embedding-3-small`                  | linha 16, como default de `get_embedding(text, model=...)`                 |
| `02-jina-embeddings-v3-clustering.py`         | `jina-embeddings-v3`, via API HTTP               | linha 22, no payload `"model"`                                             |
| `03-BM25.py`                                  | **BM25 implementado à mão** — nenhum modelo      | linhas 1–2: só `collections.Counter` e `math`                              |
| `03-LangChain-BM25.py`                        | BM25 pelo LangChain, com `ChatOpenAI` na geração | linha 3 importa `langchain_openai.ChatOpenAI`                              |
| `04-BGE-M3.py`                                | `BAAI/bge-m3` via `BGEM3FlagModel`               | linha 1 importa de `FlagEmbedding`; linha 4 instancia com `use_fp16=False` |
| `05-MultimodalEmbedding.py`                   | `Visualized_BGE` (Visualized-BGE)                | linha 11 importa de `visual_bge.modeling`                                  |

Dois detalhes que só a leitura dá: `03-BM25.py` é implementação didática do zero — a fórmula
com `Counter` e `math`, sem biblioteca de retrieval — e é o par de `03-LangChain-BM25.py`,
que faz o mesmo com a abstração pronta. E `05-MultimodalEmbedding.py` traz nas linhas 2–6 um
aviso do próprio autor sobre a instalação chata do `visual_bge`, com link para o README do
FlagEmbedding.

**Q08 `C`** — O que impede é a **combinatória da indexação**, não a precisão.

Um **bi-encoder** codifica query e documento **separadamente**. Isso permite pré-computar o
embedding de cada documento uma vez, guardar num índice, e na hora da query codificar só a
query e comparar por produto interno. Custo por busca: 1 forward pass + N comparações
vetoriais baratas — e com ANN, muito menos que N.

Um **cross-encoder** codifica query e documento **juntos**, num único forward pass sobre o
par concatenado, e emite um score de relevância. Não existe "o vetor do documento" para
guardar: o cross-encoder não produz representação do documento isolado, produz um julgamento
sobre um par. Consequência direta: para ranquear um acervo de N documentos você precisa de
**N forward passes por query**. Com um milhão de documentos, é um milhão de inferências de
transformer para cada pergunta.

Ou seja: não é que seria lento — é que **não há nada para indexar**. O índice vetorial existe
porque a representação do documento é independente da query, e essa independência é
exatamente o que o cross-encoder abandona para ganhar precisão.

É daí que sai a arquitetura de dois estágios do capítulo 7: bi-encoder recupera os top-k
baratos, cross-encoder reordena só esses k. Em
`07-PostRetrieval/01-Reranking/02-CrossEncoder-Reranking.py` o modelo é
`cross-encoder/ms-marco-MiniLM-L-12-v2` (linha 33), carregado com
`AutoModelForSequenceClassification` (linha 40) — classificação de par, não geração de
embedding, e a classe do `transformers` já revela isso.

**Q09 `A`** — Não pode descartar, e a premissa erra ao tratar "mais nuance" como
"superconjunto de capacidades". São capacidades **diferentes**, e falham em conjuntos
disjuntos de casos.

BM25 opera sobre correspondência de termo com pesagem estatística. Ele acerta exatamente onde
o denso erra:

- **Identificadores**: `SKU-88213-B`, `CFOP 5102`, `ORA-01555`, o nome de uma função. O
  embedding coloca strings alfanuméricas raras em regiões pouco treinadas do espaço; BM25 casa
  o token literalmente.
- **Termo fora do vocabulário de treino**: jargão interno, produto novo, sigla da empresa. O
  denso não tem representação boa; BM25 não precisa de nenhuma.
- **Nome próprio raro.**
- **Precisão exigida**: quando o usuário digita um termo exato porque _sabe_ o termo, ele
  espera correspondência exata, não "algo parecido".

E há um argumento que não é sobre qualidade: BM25 é **inspecionável**. Quando ele traz um
documento errado, você vê qual termo casou. Quando o denso traz um documento errado, você
tem um número de cosseno e nenhuma explicação. Para depurar recuperação em produção, isso
vale bastante.

O repositório trata os dois como complementares por construção, não por nostalgia: BM25 está
no meio do módulo de embeddings (`03-Embedding/03-BM25.py`), imediatamente antes de
`04-BGE-M3.py` — modelo que emite representação densa, esparsa e multi-vetorial de uma vez —
e desemboca em `04-VectorDB/HybridRetrieval/`, onde as duas se fundem.

Julgamento: em domínios técnicos com muito identificador, eu começaria híbrido e mediria a
contribuição de cada lado, em vez de assumir que o denso basta. O custo do híbrido é real —
dois índices para manter, uma etapa de fusão, mais latência — e é por isso que se mede em vez
de adotar por reflexo.

---

## Capítulo 4 — Vector DB

**Q10 `F`** — **10 arquivos** em `04-VectorDB/Milvus/03-SearchAndMetrics/`:

| Arquivo                          | Operação                                       |
| -------------------------------- | ---------------------------------------------- |
| `01-basic-ann.py`                | busca ANN básica                               |
| `02-ann-diff-metrics.py`         | ANN comparando métricas (`L2`, `IP`, `COSINE`) |
| `03-filtered-search.py`          | busca com filtro escalar                       |
| `04-range-search.py`             | busca por raio de similaridade em vez de top-k |
| `05-group-search.py`             | agrupamento de resultados                      |
| `06-full-text-search-bm25-ch.py` | full-text BM25 — chinês                        |
| `06-full-text-search-bm25-en.py` | full-text BM25 — inglês                        |
| `07-text-match.py`               | correspondência literal de texto               |
| `08-search-iter.py`              | busca iterativa (paginação de resultados)      |
| `09-metadata-query.py`           | consulta por metadado, sem vetor               |

O par com sufixo diferente é o `06`, em variantes `-ch` e `-en`. A diferença é o **analisador
de texto**: BM25 exige tokenização, e chinês não separa palavras por espaço — precisa de
segmentação por dicionário ou modelo, enquanto inglês tokeniza por whitespace e pontuação.
São o mesmo recurso do Milvus com configuração de analisador distinta, e existirem em
duplicata é a forma de o autor mostrar que **full-text search é sensível a idioma** de um
jeito que a busca densa não é tão diretamente.

Vale notar que `09-metadata-query.py` e `07-text-match.py` não são busca vetorial — são
consulta estruturada sobre a mesma collection. Um vector DB moderno acumula os dois papéis.

**Q11 `C`** — As duas ordens têm nomes na literatura e riscos opostos:

**Pré-filtragem** — o filtro escalar é aplicado antes, e a busca ANN roda só sobre o
subconjunto que passou. Garante que você receba `k` resultados válidos. O risco é de
**desempenho e de correção do índice**: o grafo HNSW ou os clusters IVF foram construídos
sobre o acervo **inteiro**, sem conhecer o filtro. Ao restringir muito, a estrutura de
navegação fica esburacada — muitos vizinhos do grafo não pertencem ao subconjunto — e o
percurso degrada, podendo não alcançar regiões válidas. No limite, o motor cai para varredura
sobre o subconjunto, e o índice deixa de ajudar.

**Pós-filtragem** — a busca ANN roda no acervo inteiro, retorna os top-k, e o filtro remove o
que não casa. Preserva a eficiência do índice. O risco é **perder resultados**: se você pede
`k=10` e os 10 mais próximos são todos de outro tenant, você recebe **zero** resultados —
mesmo existindo documentos relevantes daquele tenant um pouco mais distantes. Isso é o
problema clássico, e a mitigação usual é buscar `k` inflado (`k * fator`) e filtrar depois,
o que é heurística: o fator certo depende da seletividade do filtro, que varia por query.

A leitura que junta as duas: a escolha depende da **seletividade**. Filtro pouco seletivo
(remove 10%) → pós-filtragem com `k` levemente inflado. Filtro muito seletivo (remove 99%) →
pré-filtragem, ou melhor, particionamento físico, que é a Q12.

**Q12 `J`** — Julgamento. Os números da pergunta apontam para uma solução que não é "escolher
o índice certo": 2 milhões de vetores no total, nenhum tenant acima de 5 mil, e **filtro por
`tenant_id` em toda query**. Isso significa que a busca real nunca é sobre 2 milhões — é
sempre sobre no máximo 5 mil.

O que eu faria, na ordem:

1. **Particionar por `tenant_id`** — no Milvus, partições (ou collections separadas por
   tenant, se o número de tenants for gerenciável). Isso transforma o filtro em seleção de
   partição, que é resolvida antes de qualquer busca vetorial. A pergunta "pré ou pós
   filtragem" desaparece: não há filtro a aplicar, há um espaço de busca menor.
2. **Dentro da partição, `FLAT`** — e esta é a parte contraintuitiva. Com no máximo 5 mil
   vetores por tenant, busca exaustiva é rápida, exata (recall 1.0), sem parâmetro para
   afinar, sem custo de construção e sem degradação sob atualização. HNSW sobre 5 mil vetores
   adiciona memória de grafo e um recall aproximado em troca de um ganho de latência que
   provavelmente não é perceptível.
3. **Só considerar ANN se a medição mostrar necessidade** — se o p99 de latência estourar o
   orçamento, ou se a distribuição mudar e aparecerem tenants com centenas de milhares de
   documentos. Aí HNSW por partição, e ainda medindo recall contra o FLAT anterior, que passa
   a ser a verdade de referência.

O risco que eu declararia ao cliente: particionamento por tenant cria **muitas partições
pequenas**, e há custo de metadados e de gerenciamento por partição — se forem dezenas de
milhares de tenants, isso vira problema próprio, e a saída passa a ser agrupar tenants
pequenos numa partição compartilhada com filtro escalar interno. O ponto de virada é
operacional, não teórico, e se mede.

---

## Capítulo 5 — Pré-recuperação

**Q13 `F`** — **7 arquivos** em `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/`,
numerados como pipeline:

| Arquivo                       | Etapa                                                       |
| ----------------------------- | ----------------------------------------------------------- |
| `01-generate-ddl.py`          | gera o DDL do banco Sakila                                  |
| `02-ingest-ddl.py`            | indexa o DDL — o schema entra no acervo recuperável         |
| `03-ingest-q2sql.py`          | indexa pares pergunta→SQL, material de few-shot recuperável |
| `04-ingest-db-desc.py`        | indexa descrições do banco em linguagem natural             |
| `05-text2sql-rag-v1-error.py` | primeira tentativa, marcada como errada                     |
| `05-text2sql-rag-v2-ok.py`    | versão que funciona                                         |
| `05-text2sql-rag-v3-agent.py` | versão com agente                                           |

A arquitetura que os arquivos `02`, `03` e `04` revelam é o ponto do módulo: **Text2SQL bem
feito é RAG.** Em vez de despejar o schema inteiro no prompt, você indexa três coisas
distintas — DDL, exemplos pergunta→SQL, e descrição em linguagem natural — e **recupera** o
que é relevante para a pergunta antes de pedir o SQL. O acervo aqui não é documento de
negócio, é metadado do banco.

A progressão `v1-error → v2-ok → v3-agent` repete o padrão editorial que também aparece em
`Text2Cypher`: mostrar a falha antes do acerto, e depois a versão agêntica que itera. Sobre a
_causa_ específica do erro em `v1`, eu não abri o arquivo nesta rodada — não afirmo.

**Q14 `C`** — Ambos escolhem para onde mandar a query, com informação diferente:

**Roteamento lógico** — a decisão vem de **regra ou de classificação estruturada**. Você
descreve as rotas e pede ao LLM que devolva um rótulo (ou aplica condições sobre a query e
seus metadados). É discreto, auditável e determinístico o suficiente para testar: dada a
pergunta X, a rota é Y, e você pode escrever um teste para isso. No repo:
`05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py`.

**Roteamento semântico** — a decisão vem de **similaridade de embedding**. Cada rota tem uma
descrição (ou um conjunto de queries-exemplo) embutida; a query do usuário é embutida e vai
para a rota mais próxima. Não há regra, há geometria. Escala melhor para muitas rotas e
absorve variação de fraseado sem enumerar casos. No repo:
`05-PreRetrieval/03-QueryRouting/02-SemanticRouting.py`.

Onde o semântico falha e o lógico acerta: quando a decisão depende de algo que **não é
assunto**.

- **Negação e polaridade.** "documentos que _não_ são fiscais" fica próximo da rota fiscal,
  porque o espaço vetorial captura assunto e não polaridade.
- **Condição estrutural.** "quantos" versus "quais" decide entre agregação SQL e recuperação
  de trecho, mas as duas perguntas são semanticamente vizinhas.
- **Rotas com assuntos sobrepostos.** "jurídico" e "compliance" têm descrições próximas; o
  roteador semântico oscila entre elas, e a oscilação é silenciosa.
- **Recorte temporal ou por permissão.** "só o que eu tenho acesso" não é uma direção no
  espaço de embedding.

Julgamento: a combinação costuma ser melhor que a escolha — lógico para as condições
estruturais e de segurança, semântico para desambiguar assunto dentro da rota escolhida.

**Q15 `A`** — Não resolve tudo, e a premissa confunde **onde o dado está** com **que tipo de
pergunta se faz sobre ele**.

Text2SQL é excelente para o que SQL expressa: agregação, junção, filtro, ordenação, contagem
exata. "Quanto faturamos por região no último trimestre" deve sair de SQL, e sair **exato** —
recuperar trechos de relatório para responder isso é pior em todos os aspectos.

O que Text2SQL não alcança, mesmo com todos os dados no relacional:

1. **Conteúdo em campo de texto livre.** Bancos relacionais estão cheios de `TEXT`:
   descrição de ticket, observação de contrato, parecer, histórico de atendimento. `LIKE
'%multa%'` não é busca semântica — não acha "penalidade" nem "cláusula punitiva". Esse
   conteúdo pede índice vetorial, mesmo morando numa coluna.
2. **Perguntas sobre o "porquê".** "Por que a inadimplência subiu em março" não tem resposta
   em nenhuma agregação; a resposta está em ata, e-mail, parecer — texto.
3. **Schema que o modelo não entende.** Nome de coluna abreviado, tabela sem documentação,
   regra de negócio implícita em código. O LLM gera SQL sintaticamente válido e
   semanticamente errado. É exatamente o que o pipeline Sakila da Q13 endereça indexando DDL,
   exemplos e descrições — ou seja, **usando RAG para fazer Text2SQL funcionar**.
4. **Junções que o modelo erra silenciosamente.** SQL errado retorna número, não erro. Uma
   junção equivocada devolve um valor plausível e falso, e ninguém percebe.

Julgamento: a arquitetura que eu proporia é roteamento — números vão para SQL, texto livre e
"porquê" vão para o índice vetorial, e o schema é indexado para tornar o Text2SQL confiável.
E eu insistiria num ponto de risco: sem validação da consulta gerada, Text2SQL é a parte mais
perigosa de um RAG, porque erra com aparência de exatidão.

---

## Capítulo 6 — Otimização de índice

**Q16 `F`** — **8 arquivos** em `06-Indexing/02-BuildingHierarchicalIndex/`:

`00-DirectlyLoadDocumentsIndexAndQA.py` · `01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py` ·
`02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py` · `03-TwoTierIndex-PandasNode.py` ·
`04-CoarseToFineExample.py` · `05-HierarchicalMergingExample.py` ·
`98-TwoTierIndex-FAISS.py` · `99-QueryTest.py`

Os dois pedidos:

- **imaturo:** `01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py`
- **bem-sucedido:** `02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py`

Note que "two-tier" aparece em quatro arquivos (`01`, `02`, `03`, `98`), com backends
diferentes — Milvus em dois, Pandas em um, FAISS em um. E a numeração usa `00` para o
baseline sem hierarquia e `98`/`99` para variante e teste, convenção que o autor repete em
outros módulos.

**Q17 `C`** — Esta é a distinção que eu **errei no gate v1**, então vou ser preciso.

**Multi-representação**: o mesmo conteúdo é indexado sob **várias representações
diferentes**, todas apontando para o mesmo documento original. Você indexa o texto, um resumo
gerado por LLM, perguntas hipotéticas que aquele documento responderia, palavras-chave
extraídas — e o que é **entregue** é sempre o documento original. O objetivo é aumentar a
chance de casamento com formas variadas de perguntar.

**Hybrid retrieval**: o mesmo conteúdo é buscado por **vários métodos de busca** — denso e
esparso — sobre **a mesma representação textual**. O texto é um só; o que varia é o algoritmo
que o procura.

A diferença precisa: em multi-representação varia **o que está indexado** (artefatos textuais
distintos, derivados do original). Em híbrido varia **como se busca** (algoritmos distintos
sobre o mesmo texto). Um resumo gerado é conteúdo novo; um índice BM25 não é conteúdo novo, é
outra forma de indexar o mesmo conteúdo.

Por que confundi-los é tentador: os dois podem ser descritos como "indexar duas vezes". Mas
BM25 e embedding sobre o mesmo texto não criam representação semântica nova — nenhum dos dois
sabe algo que o texto não diga. Um resumo sabe: ele contém a síntese que o texto original não
enuncia.

O arquivo que implementa multi-representação de fato é
`06-Indexing/03-BuildingMultiRepresentationIndex/02-BuildMultiRepresentationIndexWithMultiVectorRetriever.py`
— o `MultiVectorRetriever` do LangChain, com resumo indexado e documento completo devolvido
via docstore. O vizinho `01-HybridRetrievalWithEnsembleRetriever.py`, **apesar de estar nesse
mesmo diretório**, é hybrid retrieval puro: `BM25Retriever` + FAISS combinados por
`EnsembleRetriever`, sobre texto idêntico. Foi precisamente aí que eu inferi conteúdo pelo
nome da pasta no v1.

**Q18 `J`** — Julgamento. Três situações em que o hierárquico de dois níveis piora, e o
mecanismo de cada uma:

**1. Quando o nível grosseiro não é representativo do fino** — o caso mais comum. Você indexa
resumos de documento e desce ao chunk dentro do candidato. Se a resposta está num detalhe que
o resumo não menciona, o documento **não é selecionado no primeiro nível**, e o segundo nível
nunca é consultado. O erro é irrecuperável: um filtro grosseiro errado no estágio 1 não tem
como ser corrigido no estágio 2. Busca plana sobre chunks teria encontrado o trecho
diretamente. É o modo de falha clássico de recuperação em cascata — cada estágio só pode
perder recall, nunca recuperá-lo.

**2. Quando o acervo não tem hierarquia real** — se os "documentos" são unidades pequenas e
independentes (tickets, FAQ, parágrafos soltos), o nível grosseiro é artificial. Você paga
duas buscas, mais complexidade de índice, e o agrupamento não corresponde a nada — sem ganho
de espaço de busca porque não havia contenção para explorar.

**3. Quando a pergunta cruza documentos** — "compare o tratamento de rescisão nos contratos A
e B" exige trechos de dois pais. O hierárquico tende a convergir para um candidato no
primeiro nível e depois refinar dentro dele, o que estrutura a busca contra a pergunta.

Ligando ao repositório: `06-Indexing/02-BuildingHierarchicalIndex/00-DirectlyLoadDocumentsIndexAndQA.py`
existe como baseline sem hierarquia, e é isso que se deve medir contra. Se o hierárquico não
bater o `00` no seu conjunto de avaliação, ele está custando complexidade sem entregar recall.
E existe um exemplo concreto de fragilidade dessa família no próprio módulo: em
`98-TwoTierIndex-FAISS.py`, a busca no segundo índice (linha 58) calcula `distances, indices`
e o resultado nunca é usado — o retorno vem só do primeiro nível. Um segundo nível decorativo
é o caso extremo do problema: toda a complexidade, nenhum benefício.

---

## Capítulo 7 — Pós-recuperação

**Q19 `F`** — Seis arquivos, identificados pelos imports e pelas declarações de modelo:

| Arquivo                          | Técnica / biblioteca                                                   | Evidência                                                          |
| -------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `01-RRF-Reranking.py`            | RRF **implementado à mão**; embeddings `all-MiniLM-L6-v2`              | função própria na linha 98; modelo na linha 91                     |
| `02-CrossEncoder-Reranking.py`   | `transformers` com `cross-encoder/ms-marco-MiniLM-L-12-v2`             | linha 33 (modelo), linha 40 (`AutoModelForSequenceClassification`) |
| `03-CoBERT-Reranking.py`         | ColBERT com `transformers`, sobre `bert-base-uncased`                  | linha 35 (modelo), linha 41 (`AutoModel`)                          |
| `04-Cohere-Reranking.py`         | `CohereRerank` (API Cohere) + `BM25Retriever`                          | linha 2 (import), linha 87 (instância)                             |
| `05-RankLLM-Reranking.py`        | `RankLLMRerank` do `langchain_community`                               | linha 6: `langchain_community.document_compressors.rankllm_rerank` |
| `06-RecencyWeightedReranking.py` | ponderação por recência — **sem modelo de rerank**; FAISS + `datetime` | linhas 1–4 (`datetime`, `faiss`)                                   |

Dois pontos que a leitura revela e o nome não:

- O `03` chama-se "CoBERT" (grafia do repositório, sem o `l`) e usa `bert-base-uncased` com
  `AutoModel`, não um checkpoint ColBERT treinado. O comentário da linha 35 admite:
  "can be replaced with a model fine-tuned specifically for ColBERT". É uma **demonstração do
  mecanismo de late interaction**, não ColBERT em qualidade de produção — quem rodar esperando
  resultado de ColBERT vai se decepcionar.
- O `06` é o único que não usa modelo de relevância: reordena por sinal temporal. Isso o torna
  ortogonal aos outros cinco, e combinável com eles.

**Q20 `C`** — O mecanismo é reordenar por um score composto, mas **somar os dois diretamente
está errado por três razões**, e a terceira é a que mais atrapalha:

1. **Escalas diferentes.** Cosseno vive em faixa estreita e comprimida (na prática, valores
   próximos entre si para documentos do mesmo domínio). Idade em dias é ilimitada e cresce
   sem teto. Somar `0.83 + 412` faz a recência dominar completamente — o termo semântico
   torna-se ruído.
2. **Direções opostas.** Similaridade: maior é melhor. Idade: menor é melhor. Somar sem
   inverter ordena ao contrário no componente temporal.
3. **Relação não linear com o tempo.** A diferença entre 1 dia e 8 dias importa muito; entre
   400 e 407 dias, quase nada. Um termo linear em idade trata os dois deltas como iguais, o
   que não corresponde a como a relevância temporal decai.

A forma usual é um **decaimento normalizado e multiplicativo ou ponderado**: converter idade
num fator em [0,1] com decaimento exponencial — algo como `exp(-λ · idade)`, ou meia-vida
explícita — e então combinar, por exemplo `score = similaridade × decaimento` ou
`score = α · similaridade + (1−α) · decaimento`, com α ajustável. Assim os dois termos ficam
comensuráveis e a não linearidade fica no lugar certo.

Duas escolhas de projeto que eu explicitaria como julgamento, não como fato: **multiplicativo
versus ponderado** muda o comportamento — no multiplicativo, um documento antiquíssimo é
zerado mesmo sendo perfeito semanticamente, o que pode ser desejável (notícia) ou desastroso
(norma jurídica antiga e vigente). E **λ ou a meia-vida é parâmetro de domínio**: preço de
produto decai em horas, jurisprudência em anos. Não há valor default defensável, e isso se
mede com um conjunto de avaliação que contenha perguntas sensíveis a tempo — caso contrário
você não vê o efeito.

Alternativa que evita a calibração: tratar tempo como **filtro**, não como score ("só os
últimos 12 meses"). Perde nuance, ganha previsibilidade.

**Q21 `A`** — Não é sempre, e a premissa erra ao tratar compressão como operação sem risco.

Compressão remove texto **decidindo o que é irrelevante para a pergunta**, e esse decisor
erra. Três modos de falha concretos:

1. **Remove o que sustentaria a resposta.** A informação decisiva pode estar numa cláusula de
   exceção, numa nota de rodapé, num "salvo quando" — trechos que parecem periféricos para um
   compressor que otimiza densidade aparente. O resultado é pior que contexto longo: é
   contexto **mutilado com aparência de suficiente**.
2. **Destrói a proveniência.** Depois de comprimir, o trecho deixa de corresponder literalmente
   ao documento fonte. Citar vira aproximação, e em domínio jurídico ou médico isso pode
   inviabilizar o uso.
3. **Custa uma inferência por query.** `07-PostRetrieval/02-Compression/02-LLMLingua-Compression.py`
   e `01-ContextualCompressionRetriever-Compression.py` adicionam processamento **no caminho
   da query**, não na ingestão. Se o objetivo era reduzir custo, você pode acabar pagando mais
   — o compressor processa o contexto inteiro para depois encurtá-lo.

E há o caso em que compressão simplesmente não é necessária: se depois do reranking você
entrega 3 a 5 chunks bem escolhidos, o contexto já é curto. Comprimir aí é risco sem retorno.
A sequência importa: **rerank primeiro, comprimir só se ainda estiver longo.**

Julgamento: eu trataria compressão como último recurso, quando o contexto precisa ser longo
por natureza da tarefa (síntese de documento extenso, comparação de muitas fontes) e o
orçamento de tokens é restritivo. E mediria faithfulness **antes e depois** — se cair,
a compressão está removendo evidência, e o ganho de token não paga.

---

## Capítulo 8 — Geração

**Q22 `F`** — **7 arquivos** em `08-Generation/03-ControllingFormatViaOutputParsing/`,
demonstrando **5 abordagens distintas** (dois pares são variantes da mesma abordagem):

| Abordagem                      | Arquivo(s)                                                                  |
| ------------------------------ | --------------------------------------------------------------------------- |
| 1. Output parser do LangChain  | `01-LangChain-OutputParsing.py`                                             |
| 2. Output parser do LlamaIndex | `02-LlamaIndex-OutputParsing.py`                                            |
| 3. JSON como formato de saída  | `03-JSON-Output.py`                                                         |
| 4. Validação por Pydantic      | `04-Pydantic-v1.py`, `04-Pydantic-v2.py`                                    |
| 5. Function calling            | `05-function-calling-v1-LangChain.py`, `05-function-calling-v2-DeepSeek.py` |

A contagem é 7 arquivos, 5 abordagens: `04` tem duas variantes (que julgo serem Pydantic v1 e
v2 da biblioteca, pelo padrão de nomenclatura — não abri para confirmar, então não afirmo) e
`05` tem duas implementações do mesmo conceito, uma por LangChain e outra direto na API
DeepSeek.

A progressão do diretório é de garantia crescente: parser (extrai do texto livre, pode
falhar) → JSON (pede formato) → Pydantic (valida e tipa) → function calling (o provedor
restringe a saída).

**Q23 `C`** — A diferença é **onde a estrutura é imposta**, e ela é grande.

**Output parser** atua **depois** da geração, no cliente. O modelo produz texto livre; o
parser tenta interpretá-lo como estrutura. As instruções de formato vão no prompt, mas nada
impede o modelo de ignorá-las: ele pode adicionar prosa antes do JSON, cercar com
` ``` `, esquecer uma vírgula, ou trocar o nome de um campo. O parser então falha ou —
pior — extrai algo parcialmente errado. A estrutura é **esperança validada a posteriori**.

**Function calling** atua **durante** a geração, no servidor. Você declara um schema, e o
provedor restringe a decodificação a saídas que o satisfazem — na prática, decodificação
guiada por gramática ou uma cabeça de saída dedicada. O modelo não "escolhe obedecer": os
tokens que violariam o schema têm probabilidade suprimida. A estrutura é **garantia
sintática**.

Por que isso muda a taxa de falha: no parser, a probabilidade de erro cresce com a
complexidade do schema (mais campos, mais aninhamento, mais chance de desvio) e varia com o
modelo, a temperatura e até o conteúdo. Em function calling, o erro sintático essencialmente
desaparece.

O que function calling **não** garante, e é onde eu evitaria o overclaim: a saída é
sintaticamente válida, não semanticamente correta. O modelo pode preencher `valor_total` com
um número inventado, ou escolher a função errada. Ou seja, function calling elimina uma
classe de falha (formato) e não toca na outra (conteúdo) — que continua exigindo validação de
negócio. É por isso que Pydantic (`04-*`) continua útil junto com function calling: o schema
garante o formato, o validador garante as regras.

**Q24 `A`** — Não é só prompt, e a diferença é de **arquitetura de controle**.

O que se pode fazer com uma instrução no prompt é auto-crítica dentro de **uma passagem**: o
modelo gera e comenta a própria saída no mesmo fluxo. Isso ajuda um pouco e é barato, mas o
julgamento não altera o que já foi produzido, nem dispara nova recuperação. É reflexão sem
consequência.

Self-RAG (paper em
`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG 2310.11511v1.pdf`,
arXiv 2310.11511) muda o **fluxo de execução**. Suas peças, conforme a proposta:

- **decidir se recupera** — não toda pergunta precisa de recuperação, e recuperar sem
  necessidade injeta ruído;
- **criticar o que foi recuperado** — cada trecho é avaliado quanto a relevância antes de
  entrar no contexto;
- **criticar a própria resposta** — quanto a suporte na evidência e utilidade;
- **agir sobre essas críticas** — descartar trecho, recuperar de novo, regerar.

O último item é o que um prompt não dá: **ciclo**. É preciso um grafo com arestas
condicionais, capaz de voltar a um estágio anterior. Um pipeline linear vai da recuperação à
geração e termina; não há como reentrar. É exatamente por isso que
`08-Generation/04-.../Self-RAG-FullImplementation.py` existe como implementação separada, e
por que o repositório introduz LangGraph em `00-SimpleRAG/04_LangGraph_RAG.py` — o grafo é o
que permite ciclos.

O mesmo padrão aparece em `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py`, que tem
graders estruturados separados para documentos (linha 71), alucinação (linha 85) e resposta
(linha 97), cada um com `with_structured_output` — decisões discretas que governam arestas do
grafo, não parágrafos de instrução.

Julgamento: se o objetivo é reduzir alucinação com esforço mínimo, a instrução de honestidade
no prompt ("diga que não sabe se o contexto não contém") entrega boa parte do ganho por custo
quase zero, e eu começaria por ela. Self-RAG é o passo seguinte, e cobra latência e chamadas
extras de LLM por query.

---

## Capítulo 9 — Avaliação

**Q25 `F`** — Quatro frameworks, um por arquivo:

| Arquivo                                    | Framework      | Métricas / componentes importados                                                                                                              |
| ------------------------------------------ | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `09-Evaluation/01-RAGAS.py`                | **RAGAS**      | `Faithfulness`, `AnswerRelevancy` (linha 6); wrappers `LangchainLLMWrapper` (7) e `LangchainEmbeddingsWrapper` (8)                             |
| `09-Evaluation/02-Trulens.py`              | **TruLens**    | `TruSession`, `Feedback`, `Select` de `trulens.core` (linha 12); `TruApp`, `instrument` de `trulens.apps.app` (linha 13)                       |
| `09-Evaluation/03-DeepEval.py`             | **DeepEval**   | `ContextualPrecisionMetric`, `AnswerRelevancyMetric` (linha 1); instanciadas nas linhas 13–14                                                  |
| `09-Evaluation/04-LlamaIndexEvaluation.py` | **LlamaIndex** | `CorrectnessEvaluator`, `SemanticSimilarityEvaluator`, `RelevancyEvaluator`, `FaithfulnessEvaluator`, `PairwiseComparisonEvaluator` (linha 19) |

Duas observações que a comparação lado a lado permite:

- **Só o DeepEval traz métrica de recuperação** entre os dois primeiros:
  `ContextualPrecisionMetric`. O exemplo do RAGAS mede apenas qualidade de resposta —
  `context_precision` e `context_recall` não aparecem nos imports dele.
- **Só o LlamaIndex traz `CorrectnessEvaluator`**, que compara com resposta de referência e
  portanto exige ground truth. É o único dos quatro exemplos que avalia se a resposta está
  _certa_, e não apenas se é fiel ao contexto e pertinente à pergunta. O
  `PairwiseComparisonEvaluator` está importado mas a instância está comentada na linha 129 —
  os demais avaliadores são instanciados nas linhas 125–128.

**Q26 `C`** — Faithfulness mede se a resposta é **sustentada pelo contexto recuperado** — uma
relação entre resposta e contexto, e nada mais. Ela não olha o mundo, nem o acervo completo,
nem uma resposta de referência.

Logo, se o contexto recuperado está errado, incompleto ou desatualizado, uma resposta
perfeitamente fiel a ele está errada — e pontua alto. O caminho típico: a pergunta é sobre a
política vigente; o retriever traz a versão de 2019 (semanticamente muito próxima da atual);
o modelo responde exatamente o que aquele trecho diz. Faithfulness alto, answer relevancy
alto — a resposta endereça a pergunta —, e o usuário recebe informação errada com citação de
fonte. A citação, aqui, **aumenta** a confiança indevida.

Este é o estado de falha mais difícil de detectar, porque todas as métricas que dispensam
gabarito ficam verdes. Evito chamá-lo de "o pior possível" — é um julgamento, e há outros
candidatos —, mas é o mais **silencioso**, e silencioso é o que importa em produção.

A métrica que denuncia é **context recall**: do que era relevante e existia no acervo, quanto
foi efetivamente recuperado. No exemplo acima ela cai, porque o trecho da política vigente
existia e não veio. E ela **exige ground truth** — é preciso saber qual trecho deveria ter
sido recuperado, o que nenhum juiz automático deriva do nada. Complementarmente,
`CorrectnessEvaluator` (LlamaIndex, `09-Evaluation/04-LlamaIndexEvaluation.py:19`) compara a
resposta com a de referência e pega o erro pelo outro lado.

Resumo operacional: faithfulness e answer relevancy medem **coerência interna**; context
recall e correctness medem **acerto**. Só o segundo par precisa de gabarito, e é exatamente
por isso que se tenta evitá-lo — e por isso que o estado acima passa despercebido.

**Q27 `J`** — Julgamento. Duas semanas, produção rodando, zero avaliação. O que eu construo,
em ordem, e o que deixo de fora.

**Dias 1–2: instrumentação antes de métrica.** Antes de medir qualidade, é preciso **ver** o
que o sistema faz. Logar, por query: a pergunta, os chunks recuperados com id e score, o
prompt final e a resposta. Sem isso, qualquer diagnóstico é adivinhação — e essa é a
infraestrutura que os quatro frameworks do capítulo 9 pressupõem. Ganho colateral imediato:
o log de produção é a melhor fonte de perguntas reais para o conjunto de avaliação.

**Dias 3–5: conjunto de avaliação a partir do tráfego real.** Extrair as perguntas mais
frequentes do log, agrupar por intenção, escolher de 30 a 50 casos que cubram os tipos de
pergunta que importam. Para cada um, registrar a resposta correta **e o trecho-fonte** — o
trecho é o que habilita context recall, e é a parte que costuma ser omitida. Esse trabalho é
manual e é o mais valioso das duas semanas; envolver quem conhece o domínio.

**Dias 6–8: baseline e as duas métricas que pegam mais.** Rodar o conjunto contra o sistema
atual e registrar **recall@k** (o trecho-fonte apareceu no top-k?) e **faithfulness**. A
primeira é diagnóstica de recuperação, a segunda de geração, e juntas localizam o estágio da
falha. Um framework do capítulo 9 serve; a escolha importa menos que ter o número. Este
baseline é o entregável: sem ele, nenhuma mudança posterior é atribuível.

**Dias 9–12: uma iteração medida, para provar o ciclo.** Escolher **um** ajuste sugerido pelo
diagnóstico — chunking, `top_k`, modelo de embedding, adicionar híbrido — e medir antes e
depois. O objetivo não é o ganho em si: é demonstrar que o ciclo medir → mudar → medir
funciona, o que é o que sobrevive depois que eu saio.

**Dias 13–14: automação mínima e documentação.** Um comando que roda a suíte e imprime as
métricas, mais um documento curto explicando como adicionar caso novo. Sem isso, a suíte
apodrece em um mês.

**O que deixo de fora, deliberadamente:** conjunto grande (centenas de casos) — 30 a 50 bem
escolhidos revelam quase todos os problemas estruturais, e volume vem depois; LLM-as-a-judge
como métrica principal, porque não calibrado ele é número sem unidade — só o uso depois de
comparar com o gabarito pequeno; métricas exóticas, antes de recall e faithfulness estarem
estáveis; e comparação entre frameworks, que é discussão de ferramenta enquanto falta o
número.

O maior risco desse plano: os dias 3–5 dependem de tempo de especialista de domínio, que
raramente está disponível na hora. Se não estiver, eu reduziria para 20 casos e seguiria —
20 casos com gabarito valem mais que 200 sem.

---

## Capítulo 10 — Paradigmas avançados

**Q28 `F`** — A diferença está na **topologia do grafo e em quem decide**. Baseado no código,
não nos nomes:

**`01-LangChain-AgenticRAG.py`** — grafo com um **agente com tool-calling**. Importa
`ToolNode` e `tools_condition` de `langgraph.prebuilt` (linha 18), e registra os nós
`agent`, `retrieve`, `grade_documents`, `rewrite`, `generate` (linhas 163–167). O fluxo:
o nó `agent` (linha 104) decide **se** chama a ferramenta de recuperação; recuperado, o nó
`grade_documents` (linha 60) avalia relevância; se ruim, `rewrite` reformula a pergunta e o
ciclo volta. A decisão é **do agente**, tomada por tool-calling, e a iteração é o mecanismo
central.

**`02-LangChain-AdaptiveRAG.py`** — **roteador na entrada mais uma cadeia de graders
estruturados**, cada um com seu próprio LLM e schema via `with_structured_output`:

| Componente                        | Schema                | Linha                          |
| --------------------------------- | --------------------- | ------------------------------ |
| roteador de query                 | `RouteQuery`          | 57 (prompt e cadeia nas 58–63) |
| grader de relevância de documento | `GradeDocuments`      | 71 (cadeia na 77)              |
| grader de alucinação              | `GradeHallucinations` | 85 (cadeia na 90)              |
| grader de resposta                | —                     | 97                             |

A decisão principal acontece **antes de recuperar**: o roteador classifica a query e escolhe
a rota. Depois, três graders independentes controlam as arestas — documento relevante?
resposta alucinou? resposta serve?

Resumindo a distinção: **Agentic** dá autonomia a um agente que itera com ferramentas
(decide agir, avalia, reescreve, repete); **Adaptive** usa classificação estruturada para
escolher o caminho e validar cada etapa — mais determinístico, mais auditável, com pontos de
decisão fixos em vez de um laço aberto. Ambos são grafos com ciclo; o que muda é se o controle
é emergente do agente ou codificado nas arestas.

Detalhe verificado: os dois arquivos têm tamanho próximo (235 e 243 linhas), e ambos
instanciam `ChatOpenAI(model="gpt-4o", temperature=0)` para os componentes de decisão —
temperatura zero, coerente com decisões que precisam ser reprodutíveis.

**Q29 `C`** — No enquadramento do paper (`10-AdvanceRAG/03-ModularRAG/ModularRAG-2407.21059v1.pdf`,
arXiv 2407.21059), **módulo** é uma unidade funcional independente do RAG — indexação,
recuperação (pré e pós), geração, memória, roteamento, orquestração — com **interface
definida**, que pode ser substituída, duplicada, reordenada ou omitida sem reescrever o
resto. Os módulos se compõem em **padrões** de fluxo: linear, condicional, ramificado, em
laço.

A diferença em relação a "pipeline configurável" é de **grau de liberdade**:

- Pipeline configurável mantém **a topologia fixa** e expõe parâmetros. Você troca o modelo
  de embedding, ajusta `chunk_size`, muda `top_k` — mas a sequência
  carregar → chunkar → embutir → recuperar → gerar permanece, e a execução é sempre linear e
  de uma passada.
- Modular RAG trata **a própria topologia como objeto de projeto**. O fluxo pode ter
  condicional (roteamento decide o caminho), ramificação (recuperar de várias fontes em
  paralelo e fundir), e **laço** (recuperar, avaliar, recuperar de novo). Um módulo pode
  aparecer duas vezes com configurações distintas, ou não aparecer.

O laço é a distinção mais consequente: nenhuma quantidade de configuração transforma um
pipeline linear em cíclico. E é o que unifica as técnicas dos capítulos anteriores sob uma
mesma descrição — Self-RAG, CRAG, Adaptive RAG e Agentic RAG deixam de ser truques avulsos e
passam a ser **arranjos diferentes dos mesmos módulos**.

Julgamento sobre utilidade prática: o valor de Modular RAG é mais de vocabulário e de projeto
do que de implementação. Ele dá nome ao que se está montando e ajuda a enxergar que
"adicionar reranking" e "adicionar reescrita de query" são inserções de módulo em pontos
distintos do fluxo. Não é uma técnica que se "aplica" — é uma forma de descrever o que já se
faz, e é por isso que o diretório contém apenas o paper, sem código executável.

**Q30 `J`** — Julgamento. Eu não recuso nem aceito de saída: eu descubro se a **forma da
pergunta** que o cliente precisa responder é a forma que GraphRAG resolve. Cinco perguntas,
nesta ordem:

**1. "Me dê três perguntas reais que seus usuários fazem e que o sistema atual erra."** É a
pergunta que decide quase tudo. Se as três são de busca pontual — "qual o prazo de garantia
do produto X" —, GraphRAG é a ferramenta errada e o problema provavelmente está em chunking,
recuperação ou ausência de híbrido. GraphRAG serve a **perguntas globais**, de síntese sobre
o acervo inteiro: temas recorrentes, como um assunto evoluiu, quem se relaciona com quem.

**2. "Existe conjunto de avaliação? Qual o recall atual?"** Se não há medição, não há como
saber que o sistema atual falhou — nem como demonstrar que GraphRAG melhorou. Trocar
arquitetura sem baseline é substituir um sistema não medido por outro não medido, com mais
complexidade. Aqui eu seria direto: sem baseline, o projeto de GraphRAG não tem critério de
sucesso.

**3. "O acervo tem entidades e relações densas?"** GraphRAG rende quando o corpus é povoado de
entidades que se relacionam de formas variadas — pessoas, empresas, processos, componentes.
Num acervo de FAQ independentes, a extração produz um grafo esparso e o custo não se paga.

**4. "Qual o volume e a taxa de atualização?"** A construção do grafo custa uma passada de
LLM por documento — comparável ao Contextual Retrieval em ordem de grandeza. Acervo que muda
diariamente exige reconstrução ou atualização incremental, e isso é o item de custo recorrente
que costuma ser esquecido na decisão.

**5. "Precisa de número exato ou de descrição?"** Se a pergunta global é "quantos tickets por
categoria", a resposta certa é classificar na ingestão e fazer `GROUP BY` — exato, barato,
auditável. GraphRAG sintetiza; não conta.

O que eu ofereceria como caminho, em vez de sim ou não: implementar primeiro o **baseline
medido** e um experimento pequeno — GraphRAG sobre um subconjunto do acervo, avaliado nas
perguntas globais reais do item 1, comparado contra a alternativa mais barata (agregação
offline ou sumarização hierárquica map-reduce). Duas semanas de experimento decidem melhor
que qualquer argumento meu ou do post no LinkedIn.

E eu diria explicitamente o que **não** sei: o ganho de GraphRAG no acervo dele. Isso não
transfere de benchmark publicado — depende da densidade de entidades e da distribuição de
perguntas, que são propriedades do caso dele. Prometer número aqui seria inventar.
