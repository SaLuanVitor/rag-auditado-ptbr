# AULA 22 — Medir RAG: RAGAS, TruLens, DeepEval e a avaliação do LlamaIndex

**Fase 8 — Avaliação** · Módulo do repo: `09-Evaluation/` — 4 scripts, `requirements.txt` e `.env.example` (`ls` no diretório: 6 arquivos)

---

## Pergunta motivadora

Vinte e uma aulas produziram decisões: `chunk_size`, `k`, índice, métrica de distância, reranking,
compressão, prompt, schema, três graders. Cada uma foi apresentada como um trade-off — e nenhuma foi
**medida**.

Três aulas anteriores terminaram na mesma dívida. A Aula 19 pediu para guardar a taxa de acerto do
roteador "para a Aula 22". A Aula 21 pediu para medir a qualidade dos próprios juízes. A Aula 15
prometeu que aqui se veria se a janela de sentenças está ajudando. É hoje.

A pergunta prática é uma: **como você sabe que a mudança de ontem melhorou algo?** E as três
subperguntas que decidem se a resposta é confiável:

1. Medir **o quê** — recuperação, geração, ou as duas?
2. Medir **onde** — no fim do pipeline, ou dentro dele?
3. Medir **contra o quê** — precisa de gabarito? De onde ele vem?

Os quatro scripts deste diretório respondem de quatro formas diferentes. Nenhum responde tudo.

---

## Modelo mental

### A tríade: três perguntas que cobrem o pipeline

Toda avaliação de RAG se reduz a três perguntas encadeadas, e cada uma isola um estágio:

| Pergunta                                     | Nome usual                        | O que o resultado ruim acusa                  |
| -------------------------------------------- | --------------------------------- | --------------------------------------------- |
| O contexto recuperado serve para a pergunta? | **context relevance** / precision | recuperação — ou ingestão, antes dela         |
| A resposta se sustenta no contexto?          | **faithfulness** / groundedness   | geração inventando                            |
| A resposta responde à pergunta?              | **answer relevancy**              | geração desviando, ou pergunta mal recuperada |

A utilidade do encadeamento é diagnóstica, e é a ordem da persona deste curso: contexto ruim com
resposta fiel é problema de recuperação; contexto bom com resposta infiel é problema de geração;
tudo bom e resposta que não responde é problema de prompt.

Note o que **falta** na tríade: ela mede o que o sistema trouxe, nunca o que ele **deixou** de
trazer. Para isso é preciso `context recall`, e `recall` exige saber qual era a resposta certa.

### Antes do juiz, as métricas que não precisam de juiz

A tríade acima é medida por LLM — cara, lenta e com variância. Mas se o seu gabarito anota **qual
trecho** sustenta cada resposta (e a Aula 28 vai pedir exatamente isso), duas métricas clássicas de
recuperação de informação saem de uma comparação de **ids**, sem juiz nenhum:

| Métrica        | O que mede                                                           | Como se calcula                          |
| -------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| **hit rate@k** | em que fração das consultas algum trecho relevante apareceu no top-k | acertou / total                          |
| **MRR**        | quão **alto** o primeiro acerto aparece                              | média de 1/posição do primeiro relevante |

São **determinísticas, reprodutíveis e gratuitas** — e o `RetrieverEvaluator` do LlamaIndex, que a
Aula 24 vai encontrar em uso, calcula as duas. Julgamento de engenharia: comece por elas. Métrica
por juiz entra depois, para o que não se reduz a acerto de id — fidelidade e relevância da
**resposta**, que nenhuma comparação de ids alcança.

E note a diferença de sentido, porque a palavra colide: o `recall@k` **do índice** da Aula 10 mede
fidelidade da busca aproximada contra a exata; o `recall` desta fase mede fração dos **relevantes**
recuperada. O primeiro é pré-requisito, nunca substituto.

### Gabarito: três origens, três problemas

| Origem                                                      | Custo                    | Problema                                                                                   |
| ----------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| Humano                                                      | alto, e é o gargalo real | poucos exemplos; e onde há ambiguidade, dois anotadores discordam                          |
| Sintético (LLM gera pergunta e resposta a partir do corpus) | baixo                    | mede se o sistema recupera o que **um LLM achou notável**, não o que os usuários perguntam |
| Perguntas reais de usuários, respostas anotadas depois      | médio                    | só existe depois de o sistema estar em produção                                            |

O repositório usa as três primeiras linhas dessa tabela sem discutir a diferença. Esta aula discute.

### Sem gabarito, você mede coerência, não correção

É o teto de qualquer métrica que só olha pergunta, contexto e resposta: ela diz se as três coisas
combinam entre si. Uma resposta fiel a um contexto errado tem `faithfulness` alto. `faithfulness`
não é sinônimo de verdade — a Aula 20 já disse isso sobre schema, e vale igual aqui.

### O juiz é um LLM, e isso tem duas consequências

A primeira é conhecida: viés e variância. A segunda é mais sutil e aparece neste módulo — **o juiz é
frequentemente um modelo mais forte que o avaliado**. Dois dos quatro scripts fazem isso
deliberadamente: geram com `gpt-3.5-turbo` e julgam com `gpt-4`. É a decisão certa, e o custo é que
a sua conta de avaliação pode ser mais cara que a de produção.

### Uma métrica sem incerteza não é um resultado

Três exemplos, uma pergunta, ou trinta perguntas amostradas sem semente produzem números com
variância que ninguém reporta. Guarde essa régua: você vai ver, neste módulo, um script declarar um
vencedor com base em três exemplos.

---

## Parte 1 — RAGAS: duas métricas, dois embeddings e uma conclusão frágil

`09-Evaluation/01-RAGAS.py` tem 143 linhas e avalia **offline**: o dataset é literal no arquivo, com
três perguntas, três respostas e dois trechos de contexto por pergunta
(`09-Evaluation/01-RAGAS.py:19-44`). Nenhum pipeline roda — o que se avalia é um registro do que um
pipeline **teria** produzido.

Isso é uma virtude, não um defeito: separar avaliação de execução permite reavaliar o mesmo conjunto
depois de mudar o sistema, e é assim que se compara duas versões.

As duas métricas estão nas linhas `09-Evaluation/01-RAGAS.py:57` e `09-Evaluation/01-RAGAS.py:83-84`:

```python
faithfulness_metric = [Faithfulness(llm=llm)] # Only need to provide the generation model
```

```python
opensource_relevancy = [AnswerRelevancy(llm=llm, embeddings=opensource_embedding)]
openai_relevancy = [AnswerRelevancy(llm=llm, embeddings=openai_embedding)]
```

E o próprio arquivo explica a diferença entre elas, num `print` didático
(`09-Evaluation/01-RAGAS.py:51-53`):

```python
print("- Evaluates whether the generated answer is faithful to the context content")
print("- By breaking down the answer into simple statements and verifying if each statement can be inferred from the context")
print("- This metric only relies on LLM and does not require an embedding model")
```

Vale ler duas vezes: `Faithfulness` **decompõe a resposta em afirmações** e verifica cada uma contra
o contexto. Isso explica por que a nota costuma ser mais baixa do que a impressão de um leitor
humano — uma frase de passagem não sustentada pelo contexto derruba a média mesmo quando o miolo da
resposta está certo.

### O que este arquivo não mede, e por quê

Nenhuma das duas métricas avalia recuperação. A tabela do Modelo mental diz qual falta:
`context precision` e `context recall`.

A causa está no dataset: as chaves são `question`, `answer` e `contexts`
(`09-Evaluation/01-RAGAS.py:20`, `09-Evaluation/01-RAGAS.py:25`, `09-Evaluation/01-RAGAS.py:30`) — e **não há `ground_truth`**. Conhecimento de
domínio: `context recall` compara o que foi recuperado com a resposta de referência; sem referência,
a métrica não tem contra o que comparar. A ausência da métrica é consequência da ausência do
gabarito, não um esquecimento de import.

### O achado: o arquivo guarda uma execução real

O fim do arquivo é um bloco de texto entre `'''` com a saída de uma execução do autor
(`09-Evaluation/01-RAGAS.py:109-143`). Os números:

| Métrica                               | Valor      |
| ------------------------------------- | ---------- |
| Faithfulness                          | **0.6071** |
| Answer Relevancy (MiniLM open-source) | 0.8565     |
| Answer Relevancy (OpenAI ada-002)     | 0.9426     |
| Diferença                             | 0.0861     |

Isto é material de leitura crítica de primeira qualidade. Olhe as três respostas do dataset
(`09-Evaluation/01-RAGAS.py:26-28`): são descritivas, bem escritas e aparentemente sustentadas pelos
contextos. E a fidelidade medida foi **0,61**.

Duas leituras possíveis, e as duas ensinam: ou as respostas afirmam coisas que os contextos não
sustentam — por exemplo, detalhes que o contexto não menciona —, ou a decomposição em afirmações é
severa. Julgamento: provavelmente as duas coisas, e é por isso que **0,61 não é um veredito, é um
ponto de partida**. O uso correto de uma métrica assim é comparativo: 0,61 hoje contra 0,71 depois de
mudar o chunking.

### A conclusão que o arquivo tira, e que não se sustenta

A última linha da comparação (`09-Evaluation/01-RAGAS.py:106`):

```python
print(f"Difference: {diff:.4f} ({'OpenAI is better' if diff > 0 else 'Open-source model is better' if diff < 0 else 'Similar'})")
```

Um vencedor declarado por uma diferença de 0,0861 em **três** perguntas, sem desvio-padrão, sem
repetição, sem teste. Julgamento, e é o mais importante desta aula: esse é exatamente o gênero de
conclusão que uma avaliação existe para evitar. O procedimento correto — dezenas a centenas de
perguntas, e a variância reportada ao lado da média — não caberia num exemplo didático, mas o
veredito categórico também não deveria.

Detalhe honesto a favor do repositório: o `requirements.txt` deste módulo pina a versão e **explica
por quê** (`09-Evaluation/requirements.txt:21-23`):

```python
# Kept on the 0.2.x API generation: the code uses ragas.llms.LangchainLLMWrapper /
# ragas.embeddings.LangchainEmbeddingsWrapper, which matches this generation's API.
ragas<0.3
```

Frameworks de avaliação mudam de API rápido. Pinar a versão e registrar o motivo é o comportamento
correto, e é raro.

---

## Parte 2 — TruLens: medir por dentro do pipeline

`09-Evaluation/02-Trulens.py` tem 124 linhas e é o único dos quatro cuja avaliação está
**instrumentada dentro da execução**, em vez de aplicada a um lote de respostas já coletado. O
`04-LlamaIndexEvaluation.py` também roda o pipeline — a tabela da Parte 5 marca os dois —, mas
avalia depois, sobre o lote. A diferença está num decorador
(`09-Evaluation/02-Trulens.py:38-42`):

```python
    @instrument
    def retrieve(self, query: str):
        """Retrieve relevant documents"""
        results = vector_store.query(query_texts=[query], n_results=2)
        return results["documents"][0] if results["documents"] else []
```

`@instrument` marca o método para gravação: entrada, saída, tempo, erro. Os três métodos da classe
`RAG` são instrumentados — `retrieve` (`09-Evaluation/02-Trulens.py:39`), `generate_completion` (`09-Evaluation/02-Trulens.py:45`) e `query` (`09-Evaluation/02-Trulens.py:56`).

E aí vem o mecanismo que justifica a existência da biblioteca: a métrica aponta para um **valor
interno** do pipeline (`09-Evaluation/02-Trulens.py:98-99`):

```python
f_context_relevance = Feedback(provider.context_relevance_with_cot_reasons, name="Context Relevance") \
    .on_input().on(Select.RecordCalls.retrieve.rets[:]).aggregate(np.mean)
```

Leia o seletor: `Select.RecordCalls.retrieve.rets[:]` é "cada elemento do valor de retorno do método
`retrieve`". A avaliação não recebe o contexto por parâmetro — ela o **pesca de dentro da execução**.
É o que a Aula 21 não conseguiu fazer com os graders embutidos no grafo: ali, medir o juízo exigia
alterar o código; aqui, a medição é externa ao código de negócio.

A tríade completa está nas três `Feedback` (`09-Evaluation/02-Trulens.py:83`, `09-Evaluation/02-Trulens.py:90`, `09-Evaluation/02-Trulens.py:98`):
groundedness sobre o retorno de `retrieve` mais a saída final; answer relevance sobre entrada e
saída; context relevance sobre entrada e cada contexto. Este é o único dos quatro scripts que mede as
três pontas da tríade num só lugar.

Duas decisões deliberadas e boas:

**O juiz é mais forte que o gerador.** Julga com `gpt-4` (`09-Evaluation/02-Trulens.py:72`) e gera
com `gpt-3.5-turbo` (`09-Evaluation/02-Trulens.py:50`). Custo nomeado: cada consulta avaliada paga uma geração barata e três
juízos caros, cada um com cadeia de raciocínio (`_with_cot_reasons`).

**Agregação declarada.** `.aggregate(np.mean)` (`09-Evaluation/02-Trulens.py:99`) diz explicitamente como dois contextos viram
um número. Média é uma escolha — o mínimo seria mais severo, e a escolha estar visível é o que
importa.

### Três ressalvas, uma delas contra o próprio comentário

**1. O banco é apagado a cada execução** (`09-Evaluation/02-Trulens.py:67`):

```python
session.reset_database()
```

Agora leia o que o comentário da última linha promete
(`09-Evaluation/02-Trulens.py:123`):

```python
# This leaderboard is very useful for comparing performance differences between different versions of an application (e.g., after changing prompts, models, or retrieval strategies).
```

Comparar versões é exatamente o que `reset_database()` impede: o histórico da execução anterior foi
apagado antes de a atual começar. O `app_version="base"` (`09-Evaluation/02-Trulens.py:108`) existe para essa comparação e não
tem com quem ser comparado. Para um exemplo reproduzível, limpar faz sentido; para o uso que o
comentário descreve, é o oposto do necessário.

**2. Um documento no store, `n_results=2`.** O corpus é um único `add` com um texto
(`09-Evaluation/02-Trulens.py:27-32`), e a busca pede dois resultados (`09-Evaluation/02-Trulens.py:41`). A `context_relevance`
medida sobre um índice de um elemento não informa nada sobre a qualidade da recuperação — é o mesmo
padrão que as Aulas 19 e 20 encontraram nos corpora minúsculos.

**3. Uma pergunta.** `n = 1` (`09-Evaluation/02-Trulens.py:117`). O `get_leaderboard()` (`09-Evaluation/02-Trulens.py:124`) vai
exibir a média de uma amostra.

---

## Parte 3 — DeepEval: vinte e uma linhas, e o único com gabarito explícito

`09-Evaluation/03-DeepEval.py` tem 21 linhas e é o exemplo mais enxuto do módulo — e o único que
carrega uma resposta de referência escrita à mão
(`09-Evaluation/03-DeepEval.py:5-10`):

```python
test_case = LLMTestCase(
    input="What if these shoes don't fit?",
    actual_output="We offer a 30-day no-questions-asked full refund service.",
    expected_output="Customers can return the goods within 30 days and get a full refund.",
    retrieval_context=["All customers are eligible for a 30-day no-questions-asked full refund service."]
)
```

Quatro campos que valem como definição do que é um caso de teste de RAG: a pergunta, o que o sistema
respondeu, o que **deveria** ter respondido, e o contexto que a recuperação trouxe. Note que
`expected_output` e `actual_output` dizem a mesma coisa com palavras diferentes — e é aí que está o
ponto: a comparação não pode ser textual.

As duas métricas (`09-Evaluation/03-DeepEval.py:13-14`):

```python
contextual_precision = ContextualPrecisionMetric()
answer_relevancy = AnswerRelevancyMetric()
```

`ContextualPrecisionMetric` é a métrica de **recuperação** que faltava no RAGAS deste módulo — ela
avalia o contexto, e usa a resposta esperada como referência para decidir o que era relevante. O
módulo, portanto, cobre a lacuna da Parte 1 em outro arquivo. Foi por isso que valeu abrir os quatro
antes de escrever a aula: ler só o `01-RAGAS.py` sugeriria que o capítulo ignora recuperação, e não é
o caso.

Três observações:

**Nenhum juiz é configurado.** As métricas são instanciadas sem argumentos, e o `.env.example` do
módulo explica de onde sai o modelo (`09-Evaluation/.env.example:4-6`): as métricas usam juiz e
embedding **padrão**, que leem `OPENAI_API_KEY` do ambiente. Consequência: a nota depende de um
modelo que você não escolheu e que pode mudar com uma atualização da biblioteca. Para um resultado
que você vai comparar com o de mês que vem, fixar o juiz é obrigatório.

**Nenhum limiar.** As métricas têm um conceito de aprovação, e aqui só os escores são impressos
(`09-Evaluation/03-DeepEval.py:20-21`). Escore é diagnóstico; limiar é o que transforma avaliação em
gate de CI. Este exemplo para no diagnóstico.

**Sem `load_dotenv()`.** `grep -rn "load_dotenv" 09-Evaluation/` encontra apenas
`01-RAGAS.py:2-3` e `04-LlamaIndexEvaluation.py:8,25`. O `09-Evaluation/.env.example:2` afirma que
todo script do diretório carrega o `.env` — falso para o `02` e para o `03`. Não é a primeira vez que
essa frase não corresponde ao código, e a auditoria consolidada da Aula 27 mede o alcance: a frase
aparece em 30 `.env.example` e é falsa em 15 dos 23 testáveis. Não é uma sequência de módulos
seguidos — o módulo `08-Generation/04-`, entre a Aula 21 e esta, tem um único script e ele **chama**
`load_dotenv()` (`Self-RAG-FullImplementation.py:5-6`).

---

## Parte 4 — LlamaIndex: o A/B controlado deste módulo

`09-Evaluation/04-LlamaIndexEvaluation.py` tem 182 linhas e é o arquivo que a Aula 15 prometeu: ele
compara **duas estratégias de recuperação** com as mesmas perguntas e as mesmas métricas.

As duas estratégias são as da Aula 15 — janela de sentenças contra chunk direto
(`09-Evaluation/04-LlamaIndexEvaluation.py:147-151`):

```python
    base_query_engine = base_index.as_query_engine(similarity_top_k=2)
    window_query_engine = sentence_index.as_query_engine(
        similarity_top_k=2,
        node_postprocessors=[MetadataReplacementPostProcessor(target_metadata_key="window")],
    )
```

Repare no `similarity_top_k=2` **nos dois**. É o que torna a comparação uma comparação: uma variável
muda, o resto fica igual. Sem isso você não sabe se o ganho vem da janela ou do `k`.

Quatro avaliadores, com o juiz fixado
(`09-Evaluation/04-LlamaIndexEvaluation.py:125-128` e `09-Evaluation/04-LlamaIndexEvaluation.py:131-136`):

```python
evaluator_c = CorrectnessEvaluator(llm=OpenAI(model="gpt-4", api_key=os.getenv("OPENAI_API_KEY")))
evaluator_s = SemanticSimilarityEvaluator()
evaluator_r = RelevancyEvaluator(llm=OpenAI(model="gpt-4", api_key=os.getenv("OPENAI_API_KEY")))
evaluator_f = FaithfulnessEvaluator(llm=OpenAI(model="gpt-4", api_key=os.getenv("OPENAI_API_KEY")))
```

`SemanticSimilarityEvaluator` é o único sem LLM — compara embeddings da resposta e da referência.
Métrica barata, determinística e cega a nuance: duas frases que dizem o oposto com o mesmo
vocabulário pontuam alto. Ter uma métrica sem juiz ao lado de três com juiz é bom desenho: quando as
quatro discordam, você tem informação sobre o juiz, não só sobre o sistema.

E o resultado sai como tabela comparativa
(`09-Evaluation/04-LlamaIndexEvaluation.py:172-176`):

```python
    results_df = get_results_df(
        [eval_results, base_eval_results],
        ["Sentence Window Retriever", "Base Retriever"],
        ["correctness", "relevancy", "faithfulness", "semantic_similarity"],
    )
```

Duas linhas, quatro colunas. É o artefato que decide se a janela da Aula 15 valeu a complexidade que
adicionou.

### O gabarito é sintético — e a geração está comentada

O dataset de referência vem de arquivo (`09-Evaluation/04-LlamaIndexEvaluation.py:121`):

```python
eval_dataset = QueryResponseDataset.from_json("90-Data/ComplexPDF/ipcc_eval_qr_dataset.json")
```

O JSON **existe** no repositório (`90-Data/ComplexPDF/ipcc_eval_qr_dataset.json`, 59.197 bytes) e
contém duas chaves, `queries` e `responses`, com **60 entradas cada** — coerente com as 30 amostras
de nós e duas perguntas por chunk do bloco que o gerou.

Esse bloco está comentado (`09-Evaluation/04-LlamaIndexEvaluation.py:111-118`):

```python
# dataset_generator = DatasetGenerator(
#     sample_eval_nodes,
#     llm=OpenAI(model="gpt-4"),
#     show_progress=True,
#     num_questions_per_chunk=2,
# )
```

Aqui está a circularidade que esta aula precisa nomear: **`gpt-4` escreveu as perguntas, `gpt-4`
escreveu as respostas de referência, e `gpt-4` julga**. `CorrectnessEvaluator` compara a resposta do
sistema com uma referência que um LLM inventou a partir do mesmo documento.

Isso não invalida o método — é uma forma legítima e muito usada de sair do zero, e mede algo real:
se o pipeline recupera o que está no documento. Mas o custo precisa ser dito: você está medindo
concordância com um LLM, não acerto perante um usuário. Se o gerador de perguntas tem viés — e ele
tende a perguntar sobre o que é explícito e bem redigido no texto —, o seu benchmark herda o viés, e
as perguntas difíceis que usuários fazem não aparecem.

E o script usa apenas metade do que gerou: `max_samples = 30`
(`09-Evaluation/04-LlamaIndexEvaluation.py:142`) corta as 60 perguntas em 30. Trinta ainda é o maior
`n` do módulo — comparado com 3 no RAGAS e 1 no TruLens.

### Dois defeitos que impedem rodar, e um trabalho descartado

**Caminho absoluto da máquina do autor** (`09-Evaluation/04-LlamaIndexEvaluation.py:47`):

```python
pdf_path = "/home/huangj2/Documents/rag-in-action/90-Data/ComplexPDF/IPCC_AR6_WGII_Chapter03.pdf"
```

um `grep -rn` por `/home/huangj2` restrito a arquivos `.py` no repositório inteiro retorna **esta única linha**. O
arquivo referenciado existe no repo, em `90-Data/ComplexPDF/IPCC_AR6_WGII_Chapter03.pdf` — o conserto
é trocar o caminho. Note também o nome do projeto no caminho: `rag-in-action`, que é como este
repositório se chamava antes.

**E os dois caminhos do mesmo arquivo são incoerentes entre si.** A linha 47 é absoluta; a linha 121
é relativa **à raiz do repositório**. Rodar de dentro de `09-Evaluation/` quebra a segunda; rodar da
raiz não conserta a primeira. É o mesmo gênero de problema que a Aula 07 registrou em
`02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:23`.

**Amostragem sem semente, e para nada** (`09-Evaluation/04-LlamaIndexEvaluation.py:108-109`):

```python
num_nodes_eval = 30
sample_eval_nodes = random.sample(base_nodes[:200], num_nodes_eval)
```

`grep -n "sample_eval_nodes"` mostra a variável em duas linhas: a `109`, onde é criada, e a `112`,
**dentro do bloco comentado**. Ou seja: o script sorteia 30 nós a cada execução e não usa nenhum
deles. E, se o bloco fosse descomentado, a falta de `random.seed` faria cada execução gerar um
benchmark diferente — um conjunto de avaliação que muda não serve para comparar duas versões.

**Dois imports mortos**, no mesmo espírito da regra 8 do protocolo de citação: `DatasetGenerator`
(`09-Evaluation/04-LlamaIndexEvaluation.py:18`) e `PairwiseComparisonEvaluator` (`09-Evaluation/04-LlamaIndexEvaluation.py:19`) só aparecem
em linhas comentadas (`09-Evaluation/04-LlamaIndexEvaluation.py:111` e `09-Evaluation/04-LlamaIndexEvaluation.py:129`). O segundo é uma pena: comparação pareada — mostrar ao juiz as
duas respostas e perguntar qual é melhor — é frequentemente mais estável que pedir uma nota absoluta,
e seria o método mais adequado para o A/B que o arquivo faz.

Última anotação: o gerador roda com `temperature=0.1`
(`09-Evaluation/04-LlamaIndexEvaluation.py:30`), não zero. Ruído pequeno, e ele entra na comparação —
a Aula 19 já pediu para fixar a decodificação antes de comparar.

---

## Parte 5 — Os quatro, lado a lado

|                         | `01-RAGAS.py`                  | `02-Trulens.py`                  | `03-DeepEval.py`                   | `04-LlamaIndexEvaluation.py`          |
| ----------------------- | ------------------------------ | -------------------------------- | ---------------------------------- | ------------------------------------- |
| Linhas                  | 143                            | 124                              | 21                                 | 182                                   |
| Executa o pipeline?     | não                            | **sim**, instrumentado           | não                                | **sim**                               |
| Gabarito                | não tem                        | não tem                          | **humano** (`:8`)                  | **sintético por LLM** (`:113`)        |
| Mede recuperação?       | não                            | sim (`context_relevance`, `:98`) | sim (`ContextualPrecision`, `:13`) | indiretamente, via A/B                |
| Mede fidelidade?        | sim (`:57`)                    | sim (`groundedness`, `:83`)      | não                                | sim (`:128`)                          |
| Juiz                    | `gpt-3.5-turbo` (`:15`)        | `gpt-4` (`:72`)                  | **padrão da biblioteca**           | `gpt-4` (`:125`)                      |
| Tamanho da amostra      | 3                              | 1                                | 1                                  | 30                                    |
| Compara duas variantes? | dois **embeddings** (`:83-84`) | não (banco apagado, `:67`)       | não                                | **sim**, dois retrievers (`:147-151`) |

A leitura de conjunto: o módulo cobre as três pontas da tríade, mas **espalhadas em quatro
arquivos**, e nenhum deles é utilizável como está para decidir uma mudança de produção. O que se
aproveita de cada um:

- do RAGAS, a **separação entre avaliar e executar** — e a saída registrada, que é um exemplo raro de
  número real num repositório didático;
- do TruLens, a **instrumentação** — medir dentro do pipeline sem sujar o código de negócio;
- do DeepEval, a **forma do caso de teste** — quatro campos, gabarito humano, e o caminho mais curto
  para um gate de CI;
- do LlamaIndex, o **desenho experimental** — duas variantes, uma variável mudando, tabela ao fim.

Julgamento de engenharia: o primeiro conjunto de avaliação que eu construiria tem vinte a cinquenta
perguntas **escritas por quem usa o sistema**, com a resposta certa anotada à mão, guardadas em
arquivo versionado. Sintético entra depois, para ampliar cobertura — não para começar. E a primeira
métrica a acompanhar é `context recall`, porque recuperação é onde a maior parte das falhas nasce e é
a única coisa que nenhuma quantidade de prompt conserta.

---

## Mão na massa

Os quatro scripts precisam de `OPENAI_API_KEY` (`09-Evaluation/.env.example:4-7`); as dependências
estão em `09-Evaluation/requirements.txt`, com `ragas<0.3` pinado.

**1. Comece pelo mais curto.** Rode `03-DeepEval.py` e leia os dois escores. Depois estrague o
`actual_output` (`09-Evaluation/03-DeepEval.py:7`) — diga "oferecemos 90 dias" — e rode de novo. Qual das duas métricas cai? A
resposta diz o que cada uma mede.

**2. Adicione o limiar.** Ainda no `03`, compare os escores com um valor mínimo e faça o script sair
com código de erro quando não passar. Você acabou de transformar avaliação em gate.

**3. Reproduza a execução registrada.** Rode `01-RAGAS.py` e compare seus números com os do bloco das
linhas 109–143. Não espere igualdade: o juiz é um LLM. A diferença entre a sua execução e a do autor
é a medida da variância que o arquivo não reporta.

**4. Mate a conclusão frágil.** Duplique as três perguntas do dataset (`09-Evaluation/01-RAGAS.py:19-44`) até ter quinze,
variando o fraseado, e rode as duas variantes de embedding três vezes cada. A diferença de 0,0861 se
mantém? O sinal dela se mantém?

**5. Investigue o 0,61.** Rode só o `Faithfulness` e, para cada uma das três perguntas, leia a
resposta (`09-Evaluation/01-RAGAS.py:26-28`) contra os contextos (`09-Evaluation/01-RAGAS.py:30-43`) e aponte à mão qual afirmação não está sustentada.
É o exercício que ensina o que a métrica está fazendo.

**6. Veja a instrumentação por dentro.** Rode `02-Trulens.py` e leia o leaderboard. Depois adicione
mais documentos ao store (`09-Evaluation/02-Trulens.py:27-32`) e uma segunda pergunta (`09-Evaluation/02-Trulens.py:117`), e rode de novo — agora a
`context_relevance` tem sobre o que discriminar.

**7. Recupere o histórico.** Comente `session.reset_database()` (`09-Evaluation/02-Trulens.py:67`), rode duas vezes com
`app_version` diferente (`09-Evaluation/02-Trulens.py:108`) e veja o leaderboard fazer o que o comentário da linha 123 promete.

**8. Faça o A/B rodar.** Em `04-LlamaIndexEvaluation.py`, troque o caminho da linha 47 pelo caminho
relativo correto, decida de onde vai rodar o script para que a linha 121 também resolva, e execute.
A tabela final responde à pergunta da Aula 15: a janela de sentenças ajuda neste corpus?

**9. Gere o seu gabarito e compare com o versionado.** Descomente as linhas 111–118, adicione
`random.seed(42)` antes da linha 109, e gere um dataset novo. Compare as perguntas geradas com as do
JSON existente. Depois pergunte-se quais dessas perguntas um usuário real faria.

---

## Quebre de propósito

**1. Julgue com um modelo fraco.** Em `04-LlamaIndexEvaluation.py`, troque os três `gpt-4`
(`09-Evaluation/04-LlamaIndexEvaluation.py:125`, `09-Evaluation/04-LlamaIndexEvaluation.py:127`, `09-Evaluation/04-LlamaIndexEvaluation.py:128`) por um modelo pequeno e refaça o A/B. Se o ranking entre os dois retrievers
mudar, você descobriu que a sua conclusão era propriedade do juiz, não do sistema.

**2. Compare com `k` diferente.** No mesmo arquivo, deixe `similarity_top_k=2` num motor e `=5` no
outro (`09-Evaluation/04-LlamaIndexEvaluation.py:147-151`). A tabela final continua saindo, bonita e sem sentido — duas variáveis mudaram.
**Julgamento:** é o erro experimental mais comum, e o mais fácil de não notar.

**3. Meça fidelidade contra o contexto errado.** Em `01-RAGAS.py`, troque os `contexts` da terceira
pergunta (`09-Evaluation/01-RAGAS.py:39-42`) pelos da primeira e rode o `Faithfulness`. Observe a nota cair — e note que
nenhuma métrica deste arquivo diria que o problema foi **recuperação**.

**4. Fabrique fidelidade alta com resposta errada.** Ainda no `01`, escreva um `answer` que copie
literalmente trechos do `contexts` mas responda outra coisa que não a `question`. `Faithfulness` sobe,
`AnswerRelevancy` cai. Duas métricas, dois defeitos diferentes — é por isso que uma só não basta.

**5. Aponte o feedback para o lugar errado.** Em `02-Trulens.py`, troque
`Select.RecordCalls.retrieve.rets[:]` (`09-Evaluation/02-Trulens.py:99`) por `.on_output()`. A `context_relevance` passa a
avaliar a resposta como se fosse contexto. Continua produzindo um número.

**6. Tire a agregação.** Remova `.aggregate(np.mean)` (`09-Evaluation/02-Trulens.py:99`) e veja o que acontece quando há mais de
um contexto. A agregação não é decoração.

**7. Sabote o gabarito.** Em `03-DeepEval.py`, troque `expected_output` (`09-Evaluation/03-DeepEval.py:8`) por algo verdadeiro
mas irrelevante ("A loja abre às 9h"). Veja `ContextualPrecisionMetric` desabar com o sistema
intacto. Gabarito ruim reprova sistema bom — e essa é, **julgamento**, a falha mais cara de uma avaliação, porque ela
manda você consertar o que não está quebrado.

---

## Armadilhas de produção

**Otimizar antes de medir.** É a regra da persona deste curso e a razão desta aula existir. Sem
conjunto de avaliação, cada mudança é troca de configuração seguida de impressão.

**Confundir fidelidade com verdade.** **Julgamento:** `faithfulness` alto sobre contexto errado é o pior resultado
possível: o sistema está coerente e errado, e a métrica aplaude. Só métrica de recuperação — com
gabarito — pega isso.

**Amostra pequena e veredito grande.** Três exemplos não decidem entre dois modelos de embedding. Se
você não reporta a variância, o número que você reporta não é resultado.

**Gabarito sintético tratado como verdade.** Ele mede concordância com o LLM que o escreveu. Serve
para começar e para ampliar cobertura; não substitui perguntas reais com respostas anotadas.

**Conjunto de avaliação que muda.** `random.sample` sem semente
(`09-Evaluation/04-LlamaIndexEvaluation.py:109`) produz um benchmark novo a cada execução. Fixe a
semente, versione o arquivo, trate o conjunto como código.

**Juiz não fixado.** Métricas instanciadas sem modelo (`09-Evaluation/03-DeepEval.py:13-14`) herdam o
padrão da biblioteca. Uma atualização muda a sua série histórica sem que nada no seu repositório
mude.

**Histórico apagado.** `reset_database()` (`09-Evaluation/02-Trulens.py:67`) num script de
observabilidade é a contradição do módulo. Avaliação vale pela série, não pelo ponto.

**Custo da avaliação.** Três feedbacks com cadeia de raciocínio por consulta, num juiz mais caro que
o gerador, sobre trinta perguntas, a cada mudança. Some às chamadas de reranking, roteamento e
graders das aulas anteriores. Avaliação é barata comparada a decidir errado — e ainda assim é uma
conta que precisa ser feita antes, não descoberta na fatura.

**Métrica única como gate.** Um limiar por métrica, e nunca uma média das quatro: a média deixa uma
fidelidade péssima passar às costas de uma similaridade semântica ótima. É a mesma razão pela qual a
rubrica de avaliação do agente deste projeto tem portas eliminatórias por capítulo.

**Caminho absoluto no repositório.** `09-Evaluation/04-LlamaIndexEvaluation.py:47` é um dos **dois**
caminhos absolutos ativos do repositório — o outro é
`03-Embedding/05-MultimodalEmbedding.py:20`, que aponta um `.pth` sob `/root/AI-BOX/code/rag/rag-in-action/`.
Os dois trazem o nome antigo do projeto (`rag-in-action`) e cada um basta para o arquivo não rodar em
nenhuma outra máquina. Antes de concluir que um exemplo está errado, confira se ele está apenas
apontando para o lugar errado.

---

## Checkpoint

Responda sem consultar:

1. Quais são as três perguntas da tríade de avaliação, e que estágio cada resposta ruim acusa?
2. O que a tríade **não** mede, e qual métrica cobre essa lacuna?
3. Por que `01-RAGAS.py` não avalia recuperação? Qual chave falta no dataset?
4. O que `Faithfulness` faz com a resposta antes de compará-la ao contexto, e por que isso explica
   uma nota baixa em respostas que parecem boas?
5. Quais números a execução registrada no fim do `01-RAGAS.py` reporta, e por que a conclusão que ela
   tira não se sustenta?
6. O que o seletor `Select.RecordCalls.retrieve.rets[:]` faz, e por que isso distingue o TruLens dos
   outros três?
7. Por que `reset_database()` contradiz o que o comentário final do mesmo arquivo promete?
8. Quais são os quatro campos de um `LLMTestCase`, e qual deles os outros três scripts não têm?
9. O que torna o `04-LlamaIndexEvaluation.py` uma comparação controlada? Que linha prova isso?
10. Descreva a circularidade do gabarito sintético. O que ela mede de fato?
11. Que dois defeitos impedem o `04` de rodar, e por que eles são incoerentes entre si?
12. Por que um limiar por métrica é melhor que um limiar sobre a média das métricas?

---

## Vocabulário

`ground truth` · `context precision` · `context recall` · `faithfulness` · `groundedness` ·
`answer relevancy` · `context relevance` · `RAG triad` · `LLM-as-a-judge` · `judge model` ·
`synthetic evaluation dataset` · `instrumentation / tracing` · `pairwise comparison` ·
`semantic similarity` · `evaluation gate`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 21 — Self-RAG e estratégias dinâmicas de geração](AULA-21-self-rag.md)
**Próxima:** [AULA 23 — GraphRAG: quando o grafo ganha do vetor](AULA-23-graphrag.md)

> **Fase 8 concluída.** A dívida das vinte e uma aulas anteriores tem agora um instrumento: quatro
> frameworks, a tríade, e a diferença entre coerência e correção. A partir daqui, toda técnica nova
> da Fase 9 chega com a mesma pergunta grudada — **medida contra o quê?** A Aula 23 abre
> `10-AdvanceRAG/01-GraphRAG/`, onde a resposta a essa pergunta é especialmente difícil, porque o que
> o grafo faz melhor não é o que a tríade mede.
