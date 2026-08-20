# AULA 21 — Self-RAG e estratégias dinâmicas de geração

**Fase 7 — Geração** · Módulo do repo: `08-Generation/04-DynamicGenerationOptimizationStrategies/` — 1 script, 2 papers em PDF, 2 diagramas PNG (`ls` no diretório: 6 arquivos, contando o `.env.example`)

---

## Pergunta motivadora

A Aula 18 fechou com uma frase que agora precisa ser cobrada:

> A diferença entre CRAG e Self-RAG, em uma linha: **CRAG critica o que foi recuperado; Self-RAG
> critica também a própria resposta e decide se precisa recuperar.**

Três coisas, então: criticar o material, criticar a resposta, decidir se recupera. Esta aula abre o
único script do diretório para ver quais das três estão implementadas — e a resposta é duas.

Mas a pergunta que organiza a aula é anterior a isso: **quem julga o julgador?** Se um LLM avalia se
o documento é relevante, se a resposta é fundamentada e se a resposta serve, então você trocou um
ponto de falha por quatro. Vale a troca? Sob que condição? E o que impede o sistema de girar em
falso quando os juízes discordam do gerador?

---

## Modelo mental

### Há dois Self-RAG, e eles não são a mesma coisa

**O do paper.** O PDF está no diretório
(`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG 2310.11511v1.pdf`) e a
formulação é explícita: _"SELF-RAG trains an arbitrary LM to generate text with reflection tokens by
unifying them as the next token prediction from the expanded model vocabulary."_ O modelo é
**treinado** a emitir tokens de reflexão, que passam a fazer parte do vocabulário. A crítica não é
uma chamada extra: é parte da geração.

A Table 1 do paper define quatro tipos:

| Token      | Entrada      | Saída                                                | Decide                                 |
| ---------- | ------------ | ---------------------------------------------------- | -------------------------------------- |
| `Retrieve` | `x` ou `x,y` | `{yes, no, continue}`                                | **se** deve recuperar                  |
| `ISREL`    | `x,d`        | `{relevant, irrelevant}`                             | se o documento serve                   |
| `ISSUP`    | `x,d,y`      | `{fully supported, partially supported, no support}` | se a resposta se sustenta no documento |
| `ISUSE`    | `x,y`        | `{5,4,3,2,1}`                                        | se a resposta é útil                   |

**O emulado por prompt.** É o que o repositório implementa: um LLM externo, chamado à parte, com
saída estruturada, respondendo às mesmas perguntas. Nenhum treino, nenhum vocabulário expandido.

Julgamento, e é a diferença que mais importa na prática: a versão emulada é a que você consegue
construir hoje, com API de terceiros e sem GPU — e paga uma chamada de LLM por juízo, por documento,
por rodada. A versão treinada embute o juízo no próprio passo de geração e não multiplica chamadas —
e exige treinar um modelo, o que a Aula 19 mostrou ser o único exemplo de fine-tuning do repositório
e nada trivial.

### Crítica é um laço, e laço precisa de freio

Uma vez que o sistema pode voltar atrás, ele pode voltar atrás **para sempre**. Todo desenho
reflexivo carrega três decisões que o exemplo desta aula deixa em aberto:

1. **Quantas voltas?** Sem limite, um veredito teimoso trava o pipeline.
2. **A entrada muda entre as voltas?** Repetir a mesma operação com a mesma entrada tende ao mesmo
   resultado.
3. **O que acontece quando o limite estoura?** Responder com ressalva, admitir falha ou escalar são
   escolhas de produto — e a ausência de escolha é um travamento.

### Binário barato, escala caro

O paper usa três valores para `ISSUP` e uma escala de 1 a 5 para `ISUSE`. O código reduz **tudo** a
`yes`/`no`. É uma decisão defensável — binário é mais estável de arrancar de um LLM e mais simples de
rotear — e o custo é perder o meio: "parcialmente sustentado" desaparece, e uma resposta
parcialmente fundamentada é classificada como fundamentada ou como alucinação, sem meio-termo.

---

## Parte 1 — Os três juízes, em código

O script instancia o mesmo padrão três vezes. Primeiro, o grader de recuperação
(`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py:41-46`):

```python
class GradeDocuments(BaseModel):
    """Binary score model for grading the relevance of retrieved documents"""

    binary_score: str = Field(
        description="Whether the document is relevant to the question, 'yes' or 'no'"
    )
```

E o contrato é cobrado com o mecanismo da Aula 20
(`Self-RAG-FullImplementation.py:49-50`):

```python
llm = ChatOpenAI(model="gpt-4o", temperature=0)
structured_llm_grader = llm.with_structured_output(GradeDocuments)
```

Isso é o grau 4 da aula anterior aplicado a **julgamento**: o valor precisa caber num campo, e o
roteamento do grafo vai ler esse campo. Se a saída fosse texto livre, cada `if` do grafo seria um
parser frágil.

O critério é deliberadamente generoso (`Self-RAG-FullImplementation.py:53-56`):

```python
system = """You are a grader that evaluates the relevance of retrieved documents to a user question.\n
    This does not need to be a strict test. The goal is to filter out irrelevant retrieval results.\n
```

Isso repete o que a Aula 18 já observou no CRAG, e a razão é a mesma: o grader de relevância é um
filtro de lixo, não um reranker. Um grader severo joga fora material que sustentaria a resposta, e o
custo de um falso negativo aqui é uma volta inteira do laço.

Os outros dois juízes seguem a forma. Fundamentação
(`Self-RAG-FullImplementation.py:96-101` e `Self-RAG-FullImplementation.py:108-109`):

```python
class GradeHallucinations(BaseModel):
    """Binary score for hallucination in generated answers"""

    binary_score: str = Field(
        description="Whether the answer is based on facts, 'yes' or 'no'"
    )
```

Utilidade (`Self-RAG-FullImplementation.py:123-128`):

```python
class GradeAnswer(BaseModel):
    """Binary score for evaluating whether the answer solves the problem"""

    binary_score: str = Field(
        description="Whether the answer solves the problem, 'yes' or 'no'"
    )
```

### O mapeamento com o paper — e o que falta

| Token do paper | Grader no código      | Linha  |
| -------------- | --------------------- | ------ |
| `ISREL`        | `GradeDocuments`      | `:41`  |
| `ISSUP`        | `GradeHallucinations` | `:96`  |
| `ISUSE`        | `GradeAnswer`         | `:123` |
| **`Retrieve`** | **nenhum**            | —      |

O token que decide **se** vale recuperar não tem correspondente. E o grafo confirma: a primeira
aresta é incondicional (`Self-RAG-FullImplementation.py:344`):

```python
workflow.add_edge(START, "retrieve")
```

Toda pergunta passa pelo índice. Aquela pergunta que não precisa de conhecimento externo — o próprio
paper usa esse caso como exemplo do desperdício que o `Retrieve` evita — é recuperada igual.

Correção honesta do que esta trilha afirmou antes: a Aula 18 disse que o Self-RAG "decide se precisa
recuperar". Isso é verdade **do paper**. Da implementação do repositório, não é: ela critica o
material e critica a resposta, e recupera sempre.

Duas anotações de leitura:

**A granularidade caiu.** `ISSUP` no paper tem três valores; `GradeHallucinations` tem dois. `ISUSE`
tem cinco; `GradeAnswer` tem dois.

**Um vestígio de migração.** A linha `Self-RAG-FullImplementation.py:37` é um import comentado:

```python
# from langchain_core.pydantic_v1 import BaseModel, Field
```

O arquivo importa `pydantic` diretamente (linha 36) e deixou a alternativa antiga desligada ao lado.
É outro episódio da confusão pydantic v1/v2, de natureza diferente do que a Aula 20 achou.

---

## Parte 2 — O gerador, e o prompt que você não pode auditar

A cadeia de geração tem três linhas (`Self-RAG-FullImplementation.py:77`, `Self-RAG-FullImplementation.py:80` e `Self-RAG-FullImplementation.py:87`):

```python
prompt = hub.pull("rlm/rag-prompt")
```

```python
llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
```

```python
rag_chain = prompt | llm | StrOutputParser()
```

Três observações, em ordem de importância.

**1. O prompt não está no repositório.** `hub.pull` busca no LangChain Hub, pela rede, em tempo de
execução. Consequências concretas: o script não roda offline; o texto do prompt pode mudar sem que
uma linha do repo mude; e — o que mais dói para este curso — **não é possível verificar aqui se esse
prompt autoriza a abstenção**, que foi o assunto central da Aula 19. Não vou afirmar o que
`rlm/rag-prompt` contém: não o abri, e ele não está em disco. Se você rodar, o primeiro comando útil
é `print(prompt.messages[0].prompt.template)` — leia antes de confiar.

**2. `model_name=` aqui, `model=` nas outras quatro.** As cinco instanciações de `ChatOpenAI` estão
nas linhas `Self-RAG-FullImplementation.py:49`, `Self-RAG-FullImplementation.py:80`, `Self-RAG-FullImplementation.py:104`, `Self-RAG-FullImplementation.py:131` e `Self-RAG-FullImplementation.py:150`; só a `Self-RAG-FullImplementation.py:80` usa `model_name=`. Ambas funcionam por
compatibilidade, e a mistura no mesmo arquivo é o tipo de detalhe que a regra 9 do protocolo de
citação existe para preservar: quem copia a linha errada e depois grepa por `model=` não encontra.

**3. `format_docs` é definida e nunca usada.** As linhas `Self-RAG-FullImplementation.py:83-84` definem a função, e `grep -n
"format_docs"` no arquivo retorna **só a linha 83**. O contexto vai cru para a cadeia
(`Self-RAG-FullImplementation.py:90`, e a `Self-RAG-FullImplementation.py:219` com `documents`):

```python
generation = rag_chain.invoke({"context": docs, "question": question})
```

`docs` é a lista de objetos `Document`, não a string concatenada que `format_docs` produziria. A
função é herança de template — e ela está morta **também** no CRAG da Aula 18: em
`07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py`, `grep -n "format_docs"` devolve
apenas a linha 135, a definição. Dois arquivos, a mesma função inútil, o mesmo ancestral.

---

## Parte 3 — O reescritor, e o segundo paper do diretório

O quarto componente reescreve a pergunta (`Self-RAG-FullImplementation.py:153-154`):

```python
system = """You are a question rewriter that converts the input question into a better version more suitable for vector store retrieval.\n
     Review the input and try to understand the underlying semantic intent/meaning."""
```

Este é o único componente que roda num modelo diferente
(`Self-RAG-FullImplementation.py:150`):

```python
llm = ChatOpenAI(model="gpt-3.5-turbo-0125", temperature=0)
```

Julgamento: faz sentido econômico — reescrever é a tarefa mais simples das cinco. E tem uma ironia
embutida: o componente mais barato é o que **governa o laço**. Se a reescrita for ruim, a próxima
recuperação também será, e o grafo volta a reescrever.

### O paper que ninguém abriu ainda

O segundo PDF do diretório é
`08-Generation/04-DynamicGenerationOptimizationStrategies/RRR - 2023.emnlp-main.322.pdf`, e o título
é _"Query Rewriting for Retrieval-Augmented Large Language Models"_ (EMNLP 2023, Ma et al.). O
abstract propõe trocar o pipeline _retrieve-then-read_ por **Rewrite-Retrieve-Read**, com o argumento
de que _"there is inevitably a gap between the input text and the needed knowledge in retrieval"_.

É a fundamentação do nó `transform_query`, e conecta com a Aula 13 (query translation): lá a
reescrita acontecia **uma vez, antes** da recuperação; aqui ela acontece **depois de uma recuperação
que falhou**, como correção. Mesma técnica, gatilho diferente.

Uma diferença que o paper marca e o código não implementa: o RRR propõe também um esquema treinável
para alinhar o reescritor aos módulos congelados. O `transform_query` daqui é reescrita por prompt,
sem treino — a mesma relação paper-versus-código da Parte 1.

**Ponto de atenção do laço.** `transform_query` substitui a pergunta no estado
(`Self-RAG-FullImplementation.py:266-267`):

```python
    better_question = question_rewriter.invoke({"question": question})
    return {"documents": documents, "question": better_question}
```

Na segunda volta, o reescritor recebe a **pergunta já reescrita**, não a original. Reescrever uma
reescrita algumas vezes afasta o texto da intenção inicial, e nada no código guarda a pergunta
original para comparar. É deriva silenciosa: quanto mais o sistema tenta, mais longe da pergunta ele
busca.

---

## Parte 4 — O grafo, e os ciclos sem freio

Quatro nós (`Self-RAG-FullImplementation.py:338-341`), todos alcançáveis — cada um aparece como
destino de alguma aresta:

```python
workflow.add_node("retrieve", retrieve)  # Retrieve
workflow.add_node("grade_documents", grade_documents)  # Grade documents
workflow.add_node("generate", generate)  # Generate
workflow.add_node("transform_query", transform_query)  # Transform query
```

A topologia, lida de `Self-RAG-FullImplementation.py:344-363`:

```
START → retrieve → grade_documents → ┬─ (nenhum doc sobrou) → transform_query ─┐
                                     └─ (sobrou algum)     → generate          │
                                                                               │
transform_query ───────────────────────────────────────────────► retrieve ◄────┘

generate → ┬─ "not supported" → generate        (volta a si mesmo)
           ├─ "not useful"    → transform_query
           └─ "useful"        → END
```

As duas decisões estão em funções separadas dos nós — é a distinção que o LangGraph faz entre nó
(faz trabalho, devolve estado) e aresta condicional (lê estado, devolve o nome do próximo nó).

A primeira é simples e boa (`Self-RAG-FullImplementation.py:285-289`):

```python
    if not filtered_documents:
        # All documents have been filtered for relevance
        # We will regenerate a new query
        print("---Decision: All documents irrelevant to question, transforming query---")
        return "transform_query"
```

A segunda encadeia os dois juízos de geração — fundamentação primeiro, utilidade depois
(`Self-RAG-FullImplementation.py:316-330`). A ordem importa e está certa: não faz sentido perguntar
se uma resposta é útil antes de saber se ela é inventada.

### Os freios que não existem

**Ciclo 1 — `generate` → `generate`.** A aresta `"not supported": "generate"`
(`Self-RAG-FullImplementation.py:359`) devolve o fluxo ao mesmo nó. Olhe o que muda entre as duas
passagens: nada. O nó `generate` (`Self-RAG-FullImplementation.py:204-220`) usa `state["question"]` e `state["documents"]`, e
nenhum dos dois foi alterado pelo veredito. A cadeia roda com `temperature=0` (`Self-RAG-FullImplementation.py:80`).

Julgamento fundamentado: regerar a mesma entrada, com o mesmo prompt e temperatura zero, tende a
produzir a mesma resposta — que será julgada "not supported" de novo. Não afirmo que trava sempre:
provedores não garantem determinismo perfeito, e o grader é ele mesmo um LLM que pode mudar de
opinião. Afirmo o que está no código: **não há contador de tentativas, não há mudança de entrada e
não há saída de emergência nessa aresta.**

**Ciclo 2 — `transform_query` → `retrieve` → `grade_documents` → `transform_query`.** Este pelo menos
muda a entrada a cada volta (a pergunta é reescrita). Mas também não tem limite, e sofre a deriva da
Parte 3.

**Ciclo 3 — `generate` → `transform_query` → `retrieve` → `grade_documents` → `generate`.** É a
volta longa: a resposta não passou no juízo de utilidade (`"not useful"`), a pergunta é reescrita, o
acervo é consultado de novo e o ciclo inteiro recomeça. Contando **ciclos simples** — caminhos
fechados sem repetir nó —, são três, e é assim que a Aula 26 conta o AdaptiveRAG, que tem
exatamente as mesmas arestas de retorno. Se você preferir contar pontos de entrada em laço, são
dois; o que não vale é contar de um jeito aqui e de outro lá, e depois comparar os números.

Compare com o CRAG da Aula 18, que resolveu isso por construção: lá, `generate` vai direto para o
fim (`07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:457`):

```python
workflow.add_edge("generate", END)
```

O CRAG é **acíclico** — uma tentativa de correção e acabou. O Self-RAG do repo é cíclico e mais
potente, e essa potência é exatamente o que exige um freio que ele não tem. Custo nomeado: sem
limite de iteração no seu código, o caso ruim não é resposta errada — é uma falha barulhenta no
meio do caminho.

> ⚠️ **Precisão sobre o risco.** O LangGraph tem um `recursion_limit` padrão de **25**
> super-steps — valor da documentação da biblioteca, que não pude confirmar localmente porque
> `langgraph` não está instalado neste ambiente — e `grep -rn "recursion_limit"` não encontra nenhuma configuração em nenhum `.py`
> do repositório. Ou seja: existe um freio, ele é da plataforma, e o pior caso não é gasto
> ilimitado — é uma `GraphRecursionError` depois de ~25 passos, com custo limitado e mensagem
> confusa. O contador que falta no estado da aplicação não serve para evitar laço infinito;
> serve para **degradar com elegância** antes de a plataforma abortar, entregando ao usuário uma
> resposta com ressalva em vez de uma exceção.

Detalhe de código morto, para fechar: a linha `Self-RAG-FullImplementation.py:282` é
`state["question"]` sozinha — uma expressão cujo valor é descartado. Provavelmente sobrou de uma
atribuição removida.

---

## Parte 5 — O "FullImplementation" que nunca executa o grafo

O grafo é compilado (`Self-RAG-FullImplementation.py:366`):

```python
app = workflow.compile()
```

E é a última linha executável do arquivo. Tudo depois disso está comentado: o desenho do diagrama
(`Self-RAG-FullImplementation.py:367-377`) e as duas execuções de exemplo (`Self-RAG-FullImplementation.py:379-401`). `grep -n "app\."` retorna três
ocorrências, **as três dentro de comentário** — `Self-RAG-FullImplementation.py:369`, `Self-RAG-FullImplementation.py:383` e `Self-RAG-FullImplementation.py:394`.

O que roda, então, ao executar `python Self-RAG-FullImplementation.py`? Os testes soltos de cada
componente, no nível do módulo: um documento graduado (`Self-RAG-FullImplementation.py:69`), uma geração (`Self-RAG-FullImplementation.py:90-91`), o grader de
alucinação (`Self-RAG-FullImplementation.py:118`), o de resposta (`Self-RAG-FullImplementation.py:145`) e o reescritor (`Self-RAG-FullImplementation.py:166`). Note que três dessas chamadas
não guardam nem imprimem o resultado — `Self-RAG-FullImplementation.py:118`, `Self-RAG-FullImplementation.py:145` e `Self-RAG-FullImplementation.py:166` invocam e descartam.

Isso reposiciona o arquivo: como **catálogo de componentes** ele serve bem, e é assim que esta aula
o usa. Como demonstração do comportamento reflexivo, ele não roda — o aluno tem que descomentar as
linhas 379–390 para ver o ciclo acontecer, e isso está na Mão na massa.

Um vestígio arqueológico no bloco comentado (`Self-RAG-FullImplementation.py:372`):

```python
#     with open("08-Response Generation-Generation/04-Dynamic Generation Optimization Strategies/graph.png", "wb") as f:
```

O caminho tem espaços e um nome de módulo que não existe mais — o diretório atual é
`08-Generation/04-DynamicGenerationOptimizationStrategies/`. É de onde vem o `graph.png` que está no
diretório, gerado antes de uma renomeação. Sobre os dois PNGs eu afirmo só o que o `ls` mostra: são
dois, `graph.png` (24.638 bytes) e `self-rag.png` (177.550 bytes). Não os abri.

---

## Parte 6 — CRAG e Self-RAG, lado a lado

A comparação que a Aula 18 prometeu, agora com os dois arquivos abertos:

|                         | CRAG (`07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py`) | Self-RAG (`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py`) |
| ----------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Linhas                  | 508                                                                    | 401                                                                                                  |
| Nós                     | 5 (`:424-428`)                                                         | 4 (`:338-341`)                                                                                       |
| Juízes                  | 1 — relevância (`:78`)                                                 | 3 — relevância (`:41`), fundamentação (`:96`), utilidade (`:123`)                                    |
| Critica a resposta?     | não                                                                    | sim                                                                                                  |
| Decide **se** recupera? | não                                                                    | não (`:344` é incondicional)                                                                         |
| Plano B quando falha    | **busca na web** (`TavilySearchResults(k=3)`, `:191`)                  | reescreve a pergunta e busca no **mesmo** índice (`:354`)                                            |
| Topologia               | acíclica — `generate → END` (`:457`)                                   | cíclica em dois pontos (`:359`, `:361`)                                                              |
| Limite de iterações     | não se aplica                                                          | **ausente**                                                                                          |

A leitura que fica: os dois compartilham metade da arquitetura, e cada um resolve o que o outro
deixa. O CRAG tem uma **fonte alternativa** — se o índice não tem, a web talvez tenha; e não corre
risco de laço. O Self-RAG tem **crítica da resposta** — o único dos dois que percebe uma resposta
inventada; e paga com a possibilidade de girar em falso.

Julgamento de engenharia: o desenho que eu levaria para produção pega três coisas de lugares
diferentes — os três juízes daqui, a fonte alternativa do CRAG, e um contador de iterações que
nenhum dos dois tem, com uma resposta de última instância quando o contador estoura.

---

## Mão na massa

O script precisa de `OPENAI_API_KEY`
(`08-Generation/04-DynamicGenerationOptimizationStrategies/.env.example:4-5`) e de rede — os três
posts do blog da Lilian Weng são carregados por HTTP (`Self-RAG-FullImplementation.py:9-13`), e o
prompt vem do Hub (`Self-RAG-FullImplementation.py:77`).

**1. Leia o prompt que você não escreveu.** Antes de qualquer coisa, depois da linha 77, imprima o
template do `prompt`. Procure se existe alguma instrução de abstenção. O resultado muda a leitura de
todo o resto: se o prompt já manda admitir ignorância, o grader de alucinação é uma segunda linha de
defesa; se não manda, ele é a única.

**2. Veja um juiz discordar.** Rode como está e observe o que a linha 69 imprime — o veredito sobre
`docs[1]` (note: o **segundo** documento, escolhido arbitrariamente na linha 68). Depois troque
`question` na linha 66 para algo fora dos três posts ("como fazer pão de queijo") e rode de novo. O
veredito deve virar `no`.

**3. Ligue o grafo.** Descomente as linhas 379–390 e rode. Agora você vê os `print` dos nós na
ordem em que o grafo os visita. Essa saída é o valor real do arquivo.

**4. Force o ciclo 2.** Com o grafo ligado, use uma pergunta que o índice não responde. Conte
quantas vezes `---Transforming Query---` aparece antes de qualquer resposta, e olhe a pergunta em
cada volta — a deriva da Parte 3 fica visível.

**5. Instrumente a deriva.** Em `transform_query` (`Self-RAG-FullImplementation.py:251-267`), imprima a pergunta antiga e a nova
lado a lado. Depois guarde a pergunta original numa chave separada do `GraphState` (`Self-RAG-FullImplementation.py:171-183`) e
passe **sempre a original** ao reescritor. Compare os dois comportamentos.

**6. Coloque o freio que falta.** Adicione um contador ao `GraphState`, incremente-o em
`transform_query` e em `generate`, e faça as duas funções de decisão (`Self-RAG-FullImplementation.py:271` e `Self-RAG-FullImplementation.py:295`) devolverem
`"useful"` — ou um nó novo de desistência — quando o contador passar de, digamos, três. Esse é o
exercício que considero mais importante da aula, e é o que separa o exemplo didático de algo que
você deixaria
atendendo requisições.

**7. Meça o custo.** Conte quantas chamadas de LLM uma pergunta consome no melhor caso (recupera,
gradua N documentos, gera, julga fundamentação, julga utilidade) e no caso com duas voltas. Some às
chamadas de reranking (Aula 17) e de roteamento (Aula 19). É a conta que decide se reflexão cabe no
seu orçamento por consulta.

---

## Quebre de propósito

**1. Torne o grader severo.** Troque a instrução da linha 54 (_"This does not need to be a strict
test"_) por uma exigência de correspondência estrita. Rode com o grafo ligado. Documentos bons
passam a ser descartados, `filtered_documents` esvazia, e o sistema entra no ciclo de reescrita sem
ter nada de errado com a recuperação. Você quebrou o pipeline apertando a qualidade.

**2. Inverta a ordem dos juízos.** Em `grade_generation_v_documents_and_question` (`Self-RAG-FullImplementation.py:295-330`),
avalie utilidade **antes** de fundamentação. Uma resposta inventada e útil passa como boa. É a
demonstração de que a ordem dos juízes é arquitetura, não estilo.

**3. Descarte o veredito.** Em `grade_documents` (`Self-RAG-FullImplementation.py:222-249`), aceite todos os documentos
independentemente do `binary_score`. Você acabou de transformar o Self-RAG num RAG comum — e o custo
das chamadas de grader continua sendo pago.

**4. Faça o ciclo 1 girar.** Mantenha `"not supported": "generate"` (`Self-RAG-FullImplementation.py:359`) e force o grader de
alucinação a responder `no` sempre (troque o system prompt da linha 108 por uma instrução que sempre
recuse). Rode e conte as chamadas. É o caso que a Parte 4 descreveu, provocado de propósito.

**5. Aponte o rewriter para um modelo pior.** Troque a linha 150 por um modelo mais fraco e observe
quantas voltas o ciclo 2 passa a levar. O componente mais barato governa o laço.

**6. Tire a saída estruturada.** Substitua `with_structured_output(GradeDocuments)` (`Self-RAG-FullImplementation.py:50`) por uma
chamada comum e tente ler `score.binary_score` (`Self-RAG-FullImplementation.py:242`). A falha mostra por que a Aula 20 vem antes
desta.

---

## Armadilhas de produção

**Julgamento, e a frase inteira é julgamento:** laço sem contador não é resiliência, é dívida — e é
a ausência mais grave deste exemplo. Todo grafo
com aresta que volta precisa de um limite e de um comportamento definido para quando o limite for
atingido.

**Regerar sem mudar a entrada.** A aresta `generate → generate` só faz sentido se algo mudar entre
as tentativas: temperatura maior, contexto diferente, ou a crítica do juízo anterior injetada no
prompt. Nenhuma das três acontece aqui.

**O juiz é um LLM, com todos os defeitos de um LLM.** Ele pode aprovar uma resposta inventada e
reprovar uma boa. Três juízes multiplicam a chance de um deles errar — e um erro do juiz custa uma
volta inteira. Não há, neste desenho, nada medindo a qualidade dos juízes; medir isso é a Aula 22.

**Binário esconde o meio.** Uma resposta parcialmente fundamentada — a mais comum em corpus real, no meu julgamento —
tem que virar `yes` ou `no`. O paper tem `partially supported` justamente porque essa é a categoria
que mais aparece.

**Prompt vindo da rede.** `hub.pull` (`Self-RAG-FullImplementation.py:77`) torna o comportamento do sistema dependente de um
recurso externo que você não versiona. Para produção, buscar uma vez e fixar no repositório é a
escolha conservadora. Custo: você deixa de receber melhorias do upstream, e passa a ser responsável
por revisá-lo.

**Reescrever a reescrita.** Guarde a pergunta original. Sem isso, cada tentativa se afasta um pouco
mais do que o usuário perguntou, e a resposta final pode responder outra coisa muito bem.

**Recuperar sempre.** O `Retrieve` do paper existe porque recuperação tem custo e pode **piorar** a
resposta quando não é necessária — contexto irrelevante ocupa janela e distrai. Um classificador
barato antes do índice é a versão pobre e viável desse token.

**Um script que não roda o que promete.** Antes de citar um arquivo como implementação de referência,
confira o que está comentado. Aqui, o grafo inteiro está construído e nunca é invocado — e nada no
nome do arquivo avisa.

---

## Checkpoint

Responda sem consultar:

1. Qual a diferença fundamental entre o Self-RAG do paper e o Self-RAG deste script?
2. Quais são os quatro tipos de reflection token da Table 1, e o que cada um decide?
3. Qual dos quatro **não** tem correspondente no código, e qual linha do grafo prova isso?
4. Como a granularidade de `ISSUP` e `ISUSE` foi alterada na implementação, e o que se perde?
5. Por que o grader de relevância é deliberadamente generoso?
6. Por que `hub.pull("rlm/rag-prompt")` é um problema de auditoria neste curso?
7. O que `format_docs` faz neste arquivo? E no CRAG da Aula 18?
8. Descreva os ciclos do grafo. Qual deles muda a entrada entre as voltas?
9. Por que a aresta `"not supported": "generate"` tende a repetir o mesmo resultado?
10. Que pergunta o `transform_query` recebe na segunda volta, e por que isso é um problema?
11. Cite três diferenças estruturais entre o grafo do CRAG e o deste arquivo.
12. O script executa o grafo quando você o roda? O que ele executa, então?

---

## Vocabulário

`Self-RAG` · `reflection token` · `ISREL` · `ISSUP` · `ISUSE` · `RRR (Rewrite-Retrieve-Read)` ·
`LangGraph` · `conditional edge` · `graph state` · `grader / critic` · `iteration limit` ·
`CRAG (Corrective RAG)` · `structured output`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 20 — Saída estruturada: output parsers, Pydantic e function calling](AULA-20-saida-estruturada.md)
**Próxima:** [AULA 22 — Medir RAG: RAGAS, TruLens, DeepEval e a avaliação do LlamaIndex](AULA-22-avaliacao.md)

> **Fase 7 concluída.** As Aulas 19, 20 e 21 cobrem `08-Generation/`: o que dizer ao modelo, como
> cobrar a forma da resposta, e como fazer o sistema julgar a si mesmo. Três aulas terminaram na
> mesma dívida — julgamento sem medição é impressão. A Fase 8 é essa dívida: `09-Evaluation/`, onde
> `01-RAGAS.py:6` importa apenas `Faithfulness` e `AnswerRelevancy` e nenhuma métrica de recuperação.
