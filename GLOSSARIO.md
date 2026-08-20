# Glossário RAG — inglês → português

Os termos permanecem em inglês porque é assim que aparecem no código, na
documentação das bibliotecas e nos papers. Traduzir o termo prejudica você na hora
de pesquisar; entender o termo é o que importa.

Ordenado por tema, não alfabeticamente — a ideia é que você leia de cima para
baixo e o vocabulário se construa em camadas.

---

## Fundamentos

**RAG (Retrieval-Augmented Generation)** — Geração aumentada por recuperação.
Arquitetura em que, antes de responder, o sistema busca trechos relevantes num
acervo próprio e os injeta no prompt do LLM. O modelo passa a responder com base
em documentos, não só no que memorizou no treino.

**Hallucination** — Alucinação. Resposta do LLM factualmente errada mas
apresentada com confiança. Não é bug: é o comportamento esperado de um modelo que
prevê o token mais provável, sem checar verdade. RAG reduz, não elimina.

**Grounding** — Ancoragem. Fazer a resposta se sustentar em evidência recuperada.
Uma resposta "grounded" pode ser rastreada a um trecho específico do corpus.

**Context window** — Janela de contexto. Limite de tokens que o modelo processa
numa chamada. Define quanto material recuperado cabe no prompt.

**Token** — Unidade de texto processada pelo modelo, tipicamente um pedaço de
palavra. Custo e limites são medidos em tokens, não caracteres.

**Corpus** — Acervo de documentos que alimenta o sistema.

**Knowledge cutoff** — Data-limite do conhecimento do modelo. Um dos motivos de
existir RAG: informação posterior ao cutoff só chega via recuperação.

---

## Ingestão

**Loader / Reader** — Componente que lê um formato de arquivo e produz objetos
`Document`. `TextLoader`, `JSONLoader`, `PyPDFLoader`, `SimpleDirectoryReader`.

**Document** — Objeto que carrega `page_content` (o texto) e `metadata` (fonte,
página, autor). Os metadados são o que viabiliza filtragem depois — subestimá-los
é erro clássico.

**Parsing** — Extrair texto estruturado de um formato bruto. Um PDF não "tem
texto": tem instruções de desenho, e o parser reconstrói a leitura.

**OCR (Optical Character Recognition)** — Reconhecimento de caracteres em imagem.
Necessário quando o PDF é digitalização, não texto nativo.

**Layout analysis** — Detecção da estrutura visual da página (título, parágrafo,
tabela, cabeçalho). Preserva hierarquia que o texto corrido perde.

**Unstructured** — Biblioteca que particiona documentos em elementos tipados
(`Title`, `NarrativeText`, `Table`, `Image`).

**Partition** — Função do Unstructured que quebra o documento em elementos.

**Parent-child** — Estratégia em que se indexa o filho pequeno (preciso na busca)
mas se entrega o pai grande (rico em contexto) ao LLM.

**Multi-representação** — Estratégia em que o **mesmo** conteúdo é indexado de mais de uma forma —
texto integral, resumo, pergunta hipotética — para que consultas de naturezas diferentes encontrem
o mesmo documento por caminhos diferentes. Não confundir com busca híbrida, que procura o mesmo
texto por dois mecanismos (denso e esparso); aqui o que muda é **o que se indexa**, não como se
procura.

---

## Chunking

**Chunk** — Pedaço de documento que é indexado e recuperado como unidade. A
decisão de tamanho de chunk é a de maior impacto em qualidade de resposta, e a
mais negligenciada.

**Chunk size** — Tamanho do chunk, em caracteres ou tokens.

**Chunk overlap** — Sobreposição entre chunks consecutivos. Evita que uma frase
relevante seja cortada exatamente na fronteira.

**Fixed-size chunking** — Corte por contagem fixa. Simples, e cego a estrutura.

**Recursive chunking** — Tenta cortar em separadores de prioridade decrescente
(parágrafo, linha, frase, palavra), preservando fronteiras naturais.
`RecursiveCharacterTextSplitter`.

**Semantic chunking** — Corta onde o significado muda, medindo distância de
embedding entre sentenças vizinhas. Mais caro, mais coerente.

**Sliding window** — Janela deslizante. Cada sentença é indexada com suas
vizinhas como contexto.

**Small-to-big** — Recuperar por unidade pequena e precisa, entregar ao LLM
uma unidade maior. Nome da família que inclui sliding window, pai-filho e
expansão para frente e para trás; o que se indexa não precisa ser o que se
entrega.

---

## Embeddings

**Assimetria consulta/passagem** — Modelos de recuperação modernos são treinados em
pares consulta–passagem, não em pares de textos parecidos. Famílias como E5 exigem os
prefixos `query: ` e `passage: `; BGE pede instrução no lado da consulta. Sem eles, o
recall cai sem erro nem aviso.

**Anisotropia** — Embeddings de texto ocupam um cone estreito do espaço: pares sem
relação pontuam bem acima de 0. Consequência prática: score de cosseno não é
probabilidade nem é comparável entre modelos, e qualquer limiar se encontra medindo a
distribuição de pares relevantes e irrelevantes no seu corpus.

**Embedding** — Representação de texto (ou imagem) como vetor de números reais,
onde proximidade geométrica aproxima proximidade semântica.

**Dimension** — Número de componentes do vetor. `all-MiniLM-L6-v2` produz 384;
`text-embedding-3-small` produz 1536. Mais dimensões não é automaticamente melhor.

**Dense vector** — Vetor denso: quase todas as posições têm valor não-zero.
Captura semântica, tolera sinônimo e paráfrase.

**Sparse vector** — Vetor esparso: quase tudo zero, uma posição por termo do
vocabulário. Captura correspondência literal — código, SKU, nome próprio.

**Bi-encoder** — Codifica query e documento separadamente. Rápido, permite
pré-computar o índice. É o que todo vector DB usa.

**Cross-encoder** — Codifica query e documento juntos, numa passada. Muito mais
preciso e muito mais lento — por isso serve para reranking dos top-k, não para
busca no acervo inteiro.

**BM25** — Função de ranqueamento léxica clássica (família TF-IDF). Baseline forte
e injustamente esquecida: em muitos domínios técnicos ela vence embedding puro.

**BGE-M3** — Modelo que emite representação densa, esparsa e multi-vetorial de uma
vez. Base natural para busca híbrida.

**ColBERT** — Late interaction: guarda um vetor por token e compara token a token.
Precisão próxima de cross-encoder com custo menor.

**Multimodal embedding** — Texto e imagem no mesmo espaço vetorial, permitindo
buscar imagem por texto.

**Fine-tuning de embedding** — Ajustar o modelo ao seu domínio. Vale quando seu
jargão não existe no treino original.

---

## Similaridade

**Cosine similarity** — Cosseno do ângulo entre vetores. Ignora magnitude,
compara direção. Padrão em RAG textual. Faixa −1 a 1.

**Dot product** — Produto interno. Considera direção e magnitude. Equivale ao
cosseno quando os vetores são normalizados.

**Euclidean distance (L2)** — Distância em linha reta. Menor é mais parecido —
atenção: inverte o sentido da comparação em relação ao cosseno.

**Metric type** — Métrica configurada no índice (`COSINE`, `IP`, `L2`). Precisa
casar com o modelo de embedding usado, ou o ranking sai errado silenciosamente.

---

## Vector DB e índices

**Vector database** — Banco especializado em busca por vizinhos mais próximos em
espaço vetorial. Milvus, Weaviate, Qdrant, pgvector, Pinecone.

**Collection** — Equivalente a uma tabela: conjunto de entidades com o mesmo
schema.

**Entity** — Registro: id, vetor e campos escalares.

**Schema** — Definição dos campos, tipos e dimensão do vetor.

**ANN (Approximate Nearest Neighbor)** — Vizinho mais próximo aproximado. Troca um
pouco de recall por ganho enorme de velocidade. É o que torna busca vetorial
viável em escala.

**FLAT** — Busca exaustiva, exata. Recall perfeito, custo linear. Ótima como
verdade de referência para medir os índices aproximados.

**IVF_FLAT** — Particiona o espaço em clusters e busca só nos mais próximos.
Parâmetros `nlist` (número de clusters) e `nprobe` (quantos visitar).

**IVF_PQ** — IVF com Product Quantization: comprime os vetores. Economiza memória,
perde precisão.

**HNSW** — Grafo hierárquico navegável. Melhor equilíbrio recall/latência para a
maioria dos casos. Parâmetros `M` e `efConstruction`/`ef`.

**DiskANN** — Índice em disco, para acervos que não caberiam em RAM.

**Recall@k** — Fração dos documentos verdadeiramente relevantes que apareceram nos
top-k. A métrica de recuperação que mais importa.

**Filtered search** — Busca vetorial combinada com filtro escalar
(`where price < 100`). Filtrar antes ou depois muda resultado e custo.

**Range search** — Retorna tudo dentro de um raio de similaridade, em vez de um
top-k fixo.

---

## Recuperação

**Retriever** — Componente que, dada uma query, devolve documentos.

**Top-k** — Quantidade de resultados retornados. Baixo demais perde evidência;
alto demais dilui o contexto e encarece.

**Dense retrieval** — Recuperação por embedding.

**Sparse retrieval** — Recuperação léxica (BM25).

**Hybrid search** — Combina densa e esparsa. Quase sempre melhor que qualquer uma
isolada, porque as duas falham em situações diferentes.

**RRF (Reciprocal Rank Fusion)** — Fusão de rankings por soma de
`1/(k + posição)`. Não exige que os scores sejam comparáveis entre si — daí ser o
método padrão de fusão.

**Reranking** — Reordenar os top-k com um modelo mais caro e preciso. Melhor
relação custo/ganho de todo o pipeline RAG.

**MMR (Maximal Marginal Relevance)** — Seleção que equilibra relevância e
diversidade, evitando k resultados quase idênticos.

---

## Pré-recuperação

**Query rewriting** — Reescrever a pergunta do usuário em forma mais recuperável.

**Query decomposition** — Quebrar pergunta composta em subperguntas, recuperar
para cada uma.

**HyDE (Hypothetical Document Embeddings)** — O LLM inventa uma resposta
hipotética e você busca pelo embedding dela. Funciona porque resposta se parece
mais com documento do que pergunta se parece.

**Query expansion** — Enriquecer a query com sinônimos e termos relacionados.

**Query routing** — Direcionar a query para a fonte certa. Roteamento lógico usa
regras/LLM; semântico usa similaridade com descrições das fontes.

**Text2SQL** — Traduzir linguagem natural em SQL. Recuperação sobre dado
estruturado.

**Text2Cypher** — O mesmo para Cypher, a linguagem de consulta do Neo4j.

**Metadata filter** — Filtro extraído da própria pergunta ("artigos de 2024" →
`year = 2024`).

---

## Pós-recuperação e geração

**Context compression** — Reduzir o contexto recuperado ao que de fato responde à
pergunta, antes de enviar ao LLM.

**LLMLingua** — Biblioteca de compressão de prompt.

**Lost in the middle** — Fenômeno em que o modelo presta menos atenção ao que está
no meio de um contexto longo. Argumento direto a favor de reranking e compressão.

**Prompt template** — Molde de prompt com espaços para contexto e pergunta.

**Few-shot** — Incluir exemplos de resposta no prompt para fixar formato e tom.

**Abstention (abstenção)** — Autorizar explicitamente o modelo a dizer que o contexto
não responde à pergunta. Uma frase no prompt; muda o comportamento na falta de
evidência. Custo: aumenta a recusa em casos em que o contexto serviria.

**Prompt routing** — Escolher qual template de prompt usar conforme a pergunta. Pode
ser por similaridade de embedding ou por classificação com LLM.

**Chat template** — Formato de conversa (papéis e marcadores de turno) em que um
modelo de instrução foi ajustado. `apply_chat_template` o aplica; enviar texto cru a
um modelo de instrução ignora esse formato.

**Full fine-tuning** — Ajustar todos os pesos do modelo, em oposição a adaptadores
(LoRA/PEFT), que treinam um conjunto pequeno de parâmetros adicionais.

**Instruction tuning** — Fine-tuning cujo objetivo é comportamento — seguir instrução,
responder a partir de contexto dado — e não conhecimento novo.

**Sampling** — Amostrar o próximo token de uma distribuição em vez de tomar o mais
provável. Ligado (`do_sample=True`), duas execuções do mesmo prompt diferem.

**Greedy decoding** — Sempre escolher o token mais provável. Saída reprodutível; é o
que se usa para comparar prompts sem ruído.

**Temperature** — Achata ou concentra a distribuição antes da amostragem. Mais alta,
mais variação; mais baixa, mais repetição.

**Top-p (nucleus sampling)** — Amostrar apenas dentro da menor fatia de tokens cuja
probabilidade acumulada atinge `p`.

**Output parser** — Componente que valida e converte a saída do modelo em
estrutura (JSON, objeto Pydantic).

**Function calling / Tool use** — O modelo emite uma chamada de função estruturada
em vez de texto livre.

**Structured output** — Saída do modelo que obedece a uma estrutura declarada
(esquema), em vez de texto livre. Garante forma, não veracidade dos valores.

**JSON mode** — Parâmetro de API (`response_format={'type': 'json_object'}`) que
obriga a saída a ser JSON sintaticamente válido. Não define quais chaves.

**JSON Schema** — Descrição da estrutura esperada (tipos, campos obrigatórios) que
viaja no protocolo da chamada. É o que um schema Pydantic se torna ao ser enviado.

**Pydantic** — Biblioteca de validação por tipos em Python. Um modelo Pydantic serve
de validador local e de contrato de saída para o LLM.

**tool_call_id** — Identificador que amarra o resultado de uma ferramenta ao pedido
que o modelo fez. Sem ele o modelo não sabe a que chamada o resultado responde.

**Response synthesizer** — Componente (LlamaIndex) que decide como transformar N
chunks recuperados em uma resposta.

**ResponseMode** — A estratégia do synthesizer: `SIMPLE_SUMMARIZE`, `COMPACT`,
`REFINE`, `TREE_SUMMARIZE`, `ACCUMULATE` e variantes. Decisão de custo por consulta e
de como a informação se perde na agregação.

**Refine** — Percorrer os chunks um a um, levando a resposta parcial adiante e
refinando-a a cada passo.

**Tree summarize** — Agregar em árvore: resumir grupos de chunks e depois resumir os
resumos, até uma resposta.

**CRAG (Corrective RAG)** — Avalia a qualidade do que foi recuperado e corrige o
curso — refaz busca, busca na web — quando o material é ruim.

**Self-RAG** — O modelo decide se precisa recuperar, critica o que recuperou e
critica a própria resposta.

**Reflection token** — Token especial que o Self-RAG do paper aprende a emitir junto
com o texto, sinalizando necessidade de recuperação ou juízo sobre a saída. São quatro
tipos: `Retrieve`, `ISREL`, `ISSUP`, `ISUSE`.

**ISREL / ISSUP / ISUSE** — Os três tokens de crítica do Self-RAG: o documento é
relevante; a resposta é sustentada pelo documento; a resposta é útil. Numa
implementação emulada por prompt, cada um vira um grader externo.

**RRR (Rewrite-Retrieve-Read)** — Pipeline que insere uma reescrita da consulta antes
da recuperação, no lugar do `retrieve-then-read` direto. Paper de Ma et al. (EMNLP
2023), presente no repositório.

**Grader / critic** — Componente que emite juízo binário ou graduado sobre um artefato
do pipeline (documento, resposta). Quando é um LLM, tem os mesmos modos de falha do
gerador que ele julga.

**Conditional edge** — Aresta de grafo cujo destino é decidido em tempo de execução por
uma função que lê o estado. É o que permite ciclo e correção num pipeline.

**Graph state** — Dicionário tipado que atravessa os nós de um grafo, acumulando
pergunta, documentos e geração. Cada nó devolve o estado atualizado.

**Iteration limit** — Contador que impede um ciclo de correção de girar
indefinidamente, mais o comportamento definido para quando ele estoura. Ausente nos
exemplos do repositório.

---

## Avaliação

**Ground truth** — Conjunto de perguntas com resposta correta conhecida. Sem ele
você não está medindo, está achando.

**Faithfulness** — A resposta é sustentada pelo contexto recuperado? Mede
alucinação.

**Answer relevancy** — A resposta responde à pergunta feita?

**Context precision** — Dos trechos recuperados, quantos eram de fato relevantes?

**Context recall** — Do que era relevante, quanto foi recuperado?

**RAGAS / TruLens / DeepEval** — Frameworks de avaliação de RAG.

**LLM-as-a-judge** — Usar um LLM para pontuar saídas. Escalável e enviesado —
calibre contra julgamento humano numa amostra.

**RAG triad** — As três perguntas que cobrem o pipeline: o contexto serve? a resposta
se sustenta nele? a resposta responde à pergunta? Falha em cada uma acusa um estágio
diferente.

**Groundedness** — Mesmo conceito de `faithfulness` sob outro nome: a resposta é
sustentada pelo contexto. Termo usado pelo TruLens.

**Context relevance** — O contexto recuperado é relevante para a pergunta. Mede
recuperação sem exigir gabarito.

**Judge model** — O modelo que atribui as notas. Costuma ser mais forte que o avaliado.
Se não for fixado explicitamente, uma atualização da biblioteca muda a sua série
histórica.

**Synthetic evaluation dataset** — Perguntas e respostas de referência geradas por LLM
a partir do próprio corpus. Barato e circular: mede concordância com o LLM que o
escreveu, não acerto perante um usuário.

**Instrumentation / tracing** — Gravar entradas, saídas e tempos de cada etapa do
pipeline em execução, permitindo avaliar valores internos (o retorno do `retrieve`, por
exemplo) sem alterar o código de negócio.

**Pairwise comparison** — Mostrar duas respostas ao juiz e perguntar qual é melhor, em
vez de pedir nota absoluta. Costuma ser mais estável que pontuação direta.

**Semantic similarity** — Comparar embeddings da resposta e da referência. Barato e
determinístico; cego a inversão de sentido com vocabulário parecido.

**Evaluation gate** — Limiar por métrica que reprova uma mudança automaticamente. Um
limiar sobre a média das métricas deixa passar falha localizada.

---

## Paradigmas avançados

**ImageBind** — Modelo da Meta que alinha várias modalidades num espaço vetorial comum.
É o que permite consultar entre modalidades sem código específico por par.

**multi2vec-bind** — Módulo do Weaviate que expõe o ImageBind como vetorizador. Roda como
serviço próprio: no exemplo do repositório, com 12 GB de limite de memória e sem GPU.

**near_text / near_image / near_media** — Consultas por similaridade em que a entrada é,
respectivamente, texto, imagem ou outra mídia. Num espaço comum, qualquer uma alcança
qualquer modalidade indexada.

**mediaType filter** — Campo de metadado que registra o tipo de cada objeto, permitindo
restringir a busca a uma modalidade. Complemento necessário do espaço único: sem ele, uma
busca textual num acervo misto pode devolver áudio quando se queria imagem.

**Inference service** — Serviço que você hospeda para gerar embeddings, em oposição a uma
API por chamada. Custo permanente enquanto o sistema existir, e não proporcional ao
volume de consultas.

**Agentic RAG** — RAG em que a decisão de agir é do **modelo**: ele recebe o schema das
ferramentas e emite (ou não) uma chamada. Distingue-se do grafo condicional, em que o LLM
produz um dado e o código decide. Modo de falha próprio: o agente decide não usar a
ferramenta e responde de memória.

**Adaptive RAG** — Termo ambíguo. No paper Modular RAG é o subtipo de laço em que o
sistema decide **quando** recuperar (FLARE, Self-RAG). No uso corrente de blog — e no
exemplo do repositório — é decidir **onde** buscar, o que é o padrão _conditional_.

**Tool description** — O texto que descreve a ferramenta ao modelo. Num sistema agentic é
prompt, não documentação: é por ele que o modelo decide chamar. Desatualizado em relação
ao índice, produz chamadas erradas cuja causa está longe do sintoma.

**Datasource routing** — Roteamento que escolhe a **fonte** (índice vetorial, busca web,
banco relacional), não o prompt. Um dos cinco eixos de divergência de rota que o paper
Modular RAG lista.

**Web search fallback** — Rota alternativa quando o índice não cobre a pergunta. Exige o
mesmo controle de qualidade aplicado ao índice; sem isso, torna-se caminho preferencial
para material não verificado.

**Modular RAG** — Paradigma que define o sistema RAG em três níveis (módulos,
submódulos, operadores) e o representa como grafo computacional cujos nós são
operadores. Naive RAG é caso especial de Advanced RAG, que é caso especial de Modular
RAG — a relação é de herança, não de alternativa.

**Naive RAG** — Recuperar, colar no prompt, gerar. Cadeia linear de dois passos.

**Advanced RAG** — Naive RAG mais indexação hierárquica, pré e pós-recuperação. Ainda
linear: o que ele não resolve é o uso incorreto de documentos corretamente recuperados.

**Module / sub-module / operator** — Os três níveis da taxonomia. O operador é a unidade
básica de operação — e, na prática, a fronteira que permite substituir um componente sem
tocar no resto.

**RAG Flow** — A orquestração de módulos e operadores. Decompõe-se em grafo de
subfunções; no caso mais simples, uma cadeia linear.

**Flow pattern** — Estrutura recorrente de fluxo. São quatro: linear, condicional,
branching e loop.

**Linear pattern** — Módulos em ordem fixa. Exemplo canônico: RRR
(Rewrite-Retrieve-Read).

**Conditional pattern** — Um módulo de roteamento escolhe qual fluxo a consulta
atravessa. Rotas podem divergir em fonte, processo, configuração, modelo e prompt — não
apenas no prompt.

**Branching pattern** — Ramos paralelos, para aumentar diversidade. Pré-recuperação: cada
ramo recupera e gera, agrega no fim. Pós-recuperação: uma recuperação, geração por chunk,
agrega.

**Loop pattern** — Recuperação e geração interdependentes, com retorno controlado por um
módulo Judge. Subdivide-se em iterativo (número fixo de iterações), recursivo
(profundidade máxima e condição de saída) e adaptativo/ativo (o sistema decide quando
recuperar e quando parar).

**Scheduling module** — Componente que identifica quando recuperar dado externo, avalia a
adequação da resposta e decide cessar a geração ou iniciar novo laço. É o freio que o
padrão de laço especifica.

**Rule judge** — Juízo por regra e limiar — tipicamente sobre a confiança dos tokens da
resposta tentativa. Grátis em custo de API e dependente de acesso aos logits.

**Orchestration** — O sexto módulo do Modular RAG, e o único genuinamente novo do
paradigma: não é um estágio do dado, e sim o que decide qual estágio roda em seguida.

**Contextual Retrieval** — Reescrever (ou prefixar) cada chunk antes de indexar, usando
o documento inteiro como contexto, para que o chunk se explique sozinho. Paga uma
chamada de LLM por chunk na indexação, não por consulta.

**Semantic isolation** — O chunk perde o vínculo com o entorno ao ser cortado, e passa
a não conter os termos pelos quais seria procurado.

**Contextualized chunk** — O texto enriquecido que vai para o índice. Guardar o original
ao lado dele é o que mantém auditoria e comparação com gabarito possíveis.

**Prompt caching** — Reuso do prefixo do prompt entre chamadas. Em Contextual Retrieval,
onde o documento inteiro entra no prompt de cada chunk, deixa de ser otimização e passa a
ser requisito de viabilidade.

**Hit rate** — Fração das consultas em que algum documento relevante apareceu no top-k.

**MRR (mean reciprocal rank)** — Média do inverso da posição do primeiro acerto.
Diferente de `hit_rate`, penaliza acerto que vem em posição ruim.

**Pass@K** — Fração das consultas cujo alvo está entre os K primeiros resultados. Nome
usado no módulo de Contextual Retrieval do repositório, onde é calculado como a média
das frações de chunks corretos recuperados.

**Exact match** — Casamento literal de texto entre o recuperado e o gabarito. Barato e
frágil: qualquer reescrita do texto indexado o zera — razão pela qual a avaliação deve
comparar o campo original, não o contextualizado.

**Global question** — Pergunta cuja resposta é propriedade do corpus inteiro ("quais
os temas principais?") e não está escrita em nenhum trecho. Top-k não a alcança:
aumentar `k` amplia a amostra, não produz cobertura.

**Local question** — Pergunta respondida por um ou poucos trechos. É o caso para o qual
recuperação por similaridade existe.

**QFS (query-focused summarization)** — Resumir um corpus sob a ótica de uma pergunta.
É a natureza real da pergunta global — tarefa de sumarização, não de recuperação.

**Sensemaking** — Uso exploratório e iterativo de um acervo: entender o todo, achar
padrões, formular a próxima pergunta a partir da resposta anterior.

**Graph index** — Índice em que nós são entidades, arestas são relações e covariáveis
são afirmações, tudo extraído do texto por prompt de LLM — sem schema prévio.

**Community detection** — Particionar o grafo em grupos densamente conectados. O
GraphRAG usa Leiden de forma hierárquica e recursiva.

**Community summary** — Resumo pré-gerado de uma comunidade do grafo. Níveis mais altos
resumem os resumos dos níveis abaixo, nunca o corpus outra vez.

**Map-reduce summarization** — Cada unidade de contexto produz uma resposta parcial e
uma rodada final junta as parciais. No GraphRAG as unidades são resumos de comunidade;
no baseline `TS`, os próprios chunks de texto.

**Comprehensiveness / diversity / empowerment / directness** — Os quatro critérios do
paper GraphRAG, julgados por comparação pareada. `directness` entra como teste de
validade: é o critério em que o RAG vetorial vence.

**GraphRAG** — Constrói grafo de entidades e relações a partir do corpus.
Responde perguntas de síntese global que busca vetorial não alcança.

**Contextual Retrieval** — Prefixa cada chunk com um resumo do documento inteiro
antes de indexar, devolvendo ao chunk o contexto que o corte tirou.

**Agentic RAG** — Um agente decide iterativamente o que buscar, avalia e refina.

**Adaptive RAG** — Escolhe a estratégia conforme a complexidade da pergunta.

**Modular RAG** — Enxerga RAG como módulos recombináveis, não pipeline fixo.

**Multimodal RAG** — Recupera e gera sobre texto e imagem juntos.
