# AULA 26 — Agentic RAG e Adaptive RAG com LangGraph

**Fase 9 — Avançado** · Módulo do repo: `10-AdvanceRAG/04-AgenticRAG/` — 6 arquivos (`ls`): 2 scripts (235 e 243 linhas), 3 PNGs e um `.env.example`

---

## Pergunta motivadora

O que faz um RAG ser **agentic**?

A resposta preguiçosa é "ele tem um grafo com condicionais". Mas o CRAG da Aula 18 tem grafo com condicionais, e ninguém o chama de agente. O Self-RAG da Aula 21 tem três juízes e três ciclos, e também não.

A Aula 25 nos deu a régua para responder, e ela tem dois eixos:

1. **Quem decide** — o código, por regra escrita à mão, ou o **modelo**?
2. **O que se decide** — qual prompt usar, qual fonte consultar, ou se vale continuar?

Os dois arquivos deste módulo respondem de formas diferentes, e nenhum dos dois é o que o nome sugere. É a última aula do curso que lê um grafo LangGraph — a Aula 27 ainda lê código, os dois scripts Weaviate —, e ela vai usar tudo o que as vinte e cinco anteriores construíram — inclusive o hábito de conferir o nome contra o arquivo.

---

## Modelo mental

### Agente é quem escolhe a ação

A distinção mínima, e ela é sobre **onde mora a decisão**:

|                   | Quem decide                                      | Exemplo no curso                   |
| ----------------- | ------------------------------------------------ | ---------------------------------- |
| Grafo condicional | o código, lendo um veredito                      | CRAG (Aula 18), Self-RAG (Aula 21) |
| Roteador          | o código, lendo a saída de um classificador      | Aula 14 (embedding), Aula 19 (LLM) |
| **Agente**        | **o modelo**, emitindo uma chamada de ferramenta | este módulo, arquivo `01`          |

Num grafo condicional, o LLM produz um **dado** (`yes`/`no`, um rótulo) e o código decide o que fazer com ele. Num agente, o LLM produz uma **ação** — a chamada de ferramenta da Aula 20 — e a decisão de agir já é dele.

A diferença prática não é filosófica. É que no primeiro caso o conjunto de caminhos possíveis está escrito no grafo, e no segundo o modelo pode escolher chamar, não chamar, ou chamar outra coisa. Você troca controle por flexibilidade — e ganha um modo de falha novo: o agente que decide não usar a ferramenta e responde de memória.

### "Adaptive" tem dois sentidos, e eles se confundem

A Aula 25 leu no paper Modular RAG que o **adaptive (active) retrieval** é o subtipo de laço em que o sistema _"can actively determine the timing of retrieval"_ — decide **quando** recuperar, com FLARE e Self-RAG como exemplos.

Existe outro uso corrente da palavra: **adaptar a rota à pergunta** — decidir **onde** buscar. É o padrão _conditional_ da mesma taxonomia.

Os dois se chamam "adaptive" na literatura de blog, e o arquivo `02` deste módulo é o segundo sentido, não o primeiro. Esta aula verifica isso no código em vez de aceitar pelo nome — foi exatamente o que o plano desta aula pedia.

---

## Parte 1 — O inventário, e o import morto mais antigo deste curso

`ls` no diretório mostra dois scripts e **três** PNGs: `01-AgenticRAG-Graph.png` (86.250 bytes), `02-AdaptiveRAG-Flow.png` (139.564) e `02-AdaptiveRAG-Graph.png` (123.644). Não abri nenhum dos três; afirmo só o que o `ls` mostra. Note que o arquivo `02` tem **dois** diagramas, um chamado "Flow" e outro "Graph" — a diferença entre eles não se infere do nome, e conferir exigiria abri-los.

E o achado mais antigo deste curso está na primeira tela do primeiro arquivo
(`10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:18`):

```python
from langgraph.prebuilt import ToolNode, tools_condition
```

`ToolNode` e `tools_condition` são os componentes prontos do LangGraph para executar ferramentas e rotear com base em chamadas de ferramenta. Eles aparecem **uma única vez** neste arquivo — nesta linha. E `grep -rn "ToolNode"` em todos os `.py` do módulo `10-AdvanceRAG` devolve **só ela**, no repositório inteiro.

Isso foi registrado na primeira auditoria deste curso e agora está confirmado com o arquivo aberto por inteiro: o roteamento real é escrito à mão, em `should_use_tools` (`01-LangChain-AgenticRAG.py:122`) e `route_after_grading` (`:83`), e a execução da ferramenta também (`:90-101`).

Não é o único. **Sete imports estão mortos** neste arquivo — sete **símbolos**, distribuídos em quatro linhas —, cada um com ocorrência única, a da própria linha de import:

| Símbolo                        | Linha |
| ------------------------------ | ----- |
| `ToolNode`, `tools_condition`  | `:18` |
| `TavilySearchResults`          | `:16` |
| `Annotated`, `Literal`, `List` | `:3`  |
| `pprint`                       | `:4`  |

O `TavilySearchResults` é o mais informativo dos sete: busca na web está importada e o arquivo **não faz** busca na web. Quem lê a lista de imports para deduzir a arquitetura conclui que este agente tem duas ferramentas. Ele tem uma.

E o `10-AdvanceRAG/04-AgenticRAG/.env.example:2` afirma que todo script carrega o `.env` via `load_dotenv()` — aqui no caso extremo, porque **nenhum dos dois** carrega. `grep -c "load_dotenv"` nos dois arquivos devolve **zero** e **zero**. Em vez disso, os dois pedem as chaves interativamente com `getpass` (`01-LangChain-AgenticRAG.py:21-24` e `02-LangChain-AdaptiveRAG.py:23-29`) — o que impede execução não interativa.

---

## Parte 2 — O arquivo `01`: um agente de verdade, com três defeitos

Comece pelo que ele é. A ferramenta é criada a partir do retriever (`01-LangChain-AgenticRAG.py:44-48`):

```python
retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_blog_posts",
    "Searches and returns information about agents, prompt engineering, and adversarial attacks from Lilian Weng's blog."
)
```

E é entregue ao modelo (`01-LangChain-AgenticRAG.py:105-106`):

```python
    model = ChatOpenAI(temperature=0, model="gpt-4o", streaming=True)
    model = model.bind_tools(tools)
```

`bind_tools` é a Aula 20 reaparecendo como arquitetura: o schema da ferramenta vai ao modelo, e o modelo pode emitir uma chamada. **Este é o único arquivo do módulo em que a decisão de agir é do modelo** — portanto o único candidato legítimo ao rótulo "agentic".

O grafo tem cinco nós (`01-LangChain-AgenticRAG.py:163-167`) e esta topologia (`:169-174`):

```
START → agent → ┬ (usa ferramenta) → retrieve → grade_documents → ┬ relevante → generate → END
                └ (não usa)        → END                          └ irrelevante → rewrite ─┐
                                                                                            │
agent ◄─────────────────────────────────────────────────────────────────────────────────────┘
```

### Defeito 1 — a decisão de agir é tomada por busca de substring

O roteamento depois do agente está em `01-LangChain-AgenticRAG.py:126-127`:

```python
    if (hasattr(last_msg, "tool_calls") and last_msg.tool_calls) or \
       (isinstance(last_msg.content, str) and "retrieve" in last_msg.content.lower()):
```

A primeira condição é a correta: existe chamada de ferramenta. A segunda é um `or` que dispara se a palavra `retrieve` aparecer **em qualquer lugar** do texto da resposta. Um modelo que escreva "I could retrieve more information, but…" é roteado para a recuperação sem ter pedido nada.

É exatamente o problema que o `tools_condition` importado e não usado resolve. Julgamento: o `or` provavelmente foi acrescentado para fazer o exemplo funcionar quando o modelo não chamava a ferramenta — o que aponta para a causa raiz, no defeito seguinte.

Repare também na instrução que o agente recebe (`01-LangChain-AgenticRAG.py:112`):

```python
    system_msg = HumanMessage(content="Please use the retrieval tool to answer the question.")
```

A variável se chama `system_msg` e o objeto é uma `HumanMessage`. Um pedido para usar a ferramenta chega como se fosse fala do usuário. Some isso ao `or` da linha 127 e o desenho fica claro: o exemplo empurra o modelo para a ferramenta por dois caminhos, nenhum deles sendo o mecanismo de ferramenta.

### Defeito 2 — a descrição da ferramenta promete o que o índice não tem

A descrição (`01-LangChain-AgenticRAG.py:47`) anuncia _"agents, prompt engineering, and adversarial attacks"_. Agora veja a lista de fontes (`01-LangChain-AgenticRAG.py:27-31`):

```python
urls = [
    "https://lilianweng.github.io/posts/2023-06-23-agent/",
    # "https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/",
    # "https://lilianweng.github.io/posts/2023-10-25-adv-attack-llm/",
]
```

Dois dos três posts estão comentados. O índice contém **apenas** o de agentes.

Isto é mais grave do que parece, e é a diferença entre um agente e um pipeline: a descrição da ferramenta **é o prompt pelo qual o modelo decide chamá-la**. Uma descrição que promete três assuntos e entrega um faz o agente chamar a ferramenta para perguntas sobre prompt engineering, receber lixo semanticamente próximo, e passar o lixo ao grader. A falha nasce na indexação, aparece na decisão do agente, e o sintoma vai surgir três nós adiante.

### Defeito 3 — o laço apaga a pergunta original

A aresta `rewrite → agent` (`01-LangChain-AgenticRAG.py:174`) fecha o ciclo, e o nó de reescrita faz isto (`:138-143`):

```python
    return {
        "messages": [resp],  # Reset messages here, keep only the new question
        "retrieval_done": False,
        "graded": False,
        "grade_result": ""
    }
```

O comentário é honesto: `Reset messages here`. O histórico é descartado e **só a pergunta reescrita sobrevive**.

A Aula 21 encontrou a deriva branda — o reescritor recebia a pergunta já reescrita, e a original não era guardada. Aqui é a versão dura: a pergunta original é **destruída** no estado. Na segunda volta, nada no sistema sabe o que o usuário perguntou. E como todos os nós leem `msgs[0].content` como sendo "a pergunta" (`:71`, `:93`, `:134`, `:148`), depois do primeiro `rewrite` a "pergunta" passa a ser o texto produzido pelo modelo.

E, pela terceira vez neste curso, **o ciclo não tem contador**. Nada limita quantas vezes `agent → retrieve → grade_documents → rewrite → agent` pode girar.

### Duas anotações menores

**Campos de estado decorativos.** `retrieval_done` e `graded` (`01-LangChain-AgenticRAG.py:54-55`) são escritos por todos os cinco nós e lidos **apenas nos `print`** das linhas 213-214. Nenhuma função de decisão os consulta. São dois campos que carregam informação que nada consome — e que dão a impressão, ao leitor, de que existe controle de fluxo baseado neles.

**O bloco comentado de salvar o diagrama** (`01-LangChain-AgenticRAG.py:177-190`) grava num caminho que não existe: `10-AdvanceRAG/04-AgenticRAG/` seguido de `AgenticRAG-Graph.png`, relativo à raiz do repo e **sem** o prefixo `01-` do arquivo real — e a mensagem de sucesso na linha 188 diz `"Saved as: AdaptiveRAG-Graph.png"`, o nome do **outro** script. Três nomes diferentes para o mesmo arquivo.

E o `hub.pull("rlm/rag-prompt")` (`01-LangChain-AgenticRAG.py:150`) é o mesmo prompt vindo da rede que a Aula 21 não pôde auditar. Segue não auditável.

---

## Parte 3 — O arquivo `02`: o roteamento de fonte que o curso ainda não tinha visto

`02-LangChain-AdaptiveRAG.py` é o exemplo mais completo do repositório em número de componentes: um roteador de fonte, três graders, um reescritor, busca na web e cinco nós.

E ele traz o que a Aula 25 apontou como faltando. O paper Modular RAG diz que rotas divergem em _"retrieval sources, retrieval processes, configurations, models, and prompts"_ — cinco eixos —, e a Aula 25 registrou que o curso só havia visto roteamento de **prompt** (Aulas 14 e 19). Aqui está o eixo da **fonte** (`02-LangChain-AdaptiveRAG.py:50-54`):

```python
class RouteQuery(BaseModel):
    """Route to vector store or web search based on the question."""
    datasource: Literal["vectorstore", "web_search"] = Field(
        ..., description="Select 'vectorstore' or 'web_search' based on the question."
    )
```

`Literal` como contrato — a Aula 20 recomendou exatamente isso e observou que o repositório usava `str` solto. Aqui o roteador não pode devolver um rótulo fora do conjunto.

E o roteamento acontece **na aresta que sai do START** (`02-LangChain-AdaptiveRAG.py:188-192`):

```python
wf.add_conditional_edges(
    START,
    lambda s: question_router.invoke({"question": s.question}).datasource,
    {"vectorstore": "retrieve", "web_search": "web_search"}
)
```

Compare com o Self-RAG da Aula 21, cuja primeira aresta era `START → retrieve` incondicional. Aqui a primeira decisão é **se o índice é a fonte certa**. É o mais próximo que o repositório chega do token `Retrieve` do paper Self-RAG — ainda não é "decidir se recupera", é "decidir onde recuperar", mas a diferença com o resto do repositório é real.

Os três graders (`02-LangChain-AdaptiveRAG.py:66`, `:80`, `:93`) repetem a estrutura da Aula 21 — relevância, alucinação, resposta —, todos com `with_structured_output` e todos em `gpt-4o`, enquanto a geração roda em `gpt-3.5-turbo` (`:159`). Juiz mais forte que o avaliado, como a Aula 22 recomendou.

Há também uma abstenção explícita, e vale elogiar (`02-LangChain-AdaptiveRAG.py:163-164`):

```python
    if not docs:
        gen = "No relevant documents retrieved, unable to generate an answer."
```

Depois de a Aula 19 mostrar um template que nunca dizia "não sei", aqui está o caso em que o código decide não gerar.

### O que dá errado

**A rota da web escapa do controle de qualidade.** As arestas (`02-LangChain-AdaptiveRAG.py:194` e `:203`):

```python
wf.add_edge("retrieve", "grade_documents")
```

```python
wf.add_edge("web_search", "generate")
```

O que vem do índice é graduado documento por documento; o que vem da web vai **direto para a geração**. Julgamento: é uma assimetria difícil de justificar — resultado de busca na web é, se algo, menos confiável que o índice curado. E ela tem consequência no laço: se a rota escolhida foi a web e o resultado é ruim, o único caminho de correção é o `retry` da geração, que não muda o contexto.

**Três ciclos, nenhum com freio.** As arestas condicionais pós-geração (`02-LangChain-AdaptiveRAG.py:205-209`):

```python
wf.add_conditional_edges(
    "generate",
    lambda s: grade_generation_node(s)["decision"],
    {"retry": "generate", "rewrite": "transform_query", "end": END}
)
```

`retry` volta a `generate` com o mesmo `documents`, a mesma `question` e `temperature=0` — o cenário que a Aula 21 descreveu e que a Aula 25 mostrou ser a omissão do `scheduling module`. Os outros dois ciclos são `generate → transform_query → retrieve → grade_documents → generate` e `grade_documents → transform_query → retrieve → grade_documents`. Nenhum contador em nenhum dos três.

**A função de decisão tem forma de nó e não é um nó.** `grade_generation_node` (`02-LangChain-AdaptiveRAG.py:170`) devolve `{"decision": ...}`, e `decision` **não existe** no `GraphState` (`:121-124`, que tem `question`, `generation` e `documents`). Ela também não está entre os cinco `add_node` (`:181-185`). Funciona porque o lambda da linha 207 lê a chave direto do dicionário devolvido — mas o nome, o comentário `# Hallucination and Answer Evaluation Node` (`:169`) e o formato de retorno dizem "nó", e ela é uma aresta. Custo real: cada avaliação dispara uma ou duas chamadas de LLM dentro de um lambda de roteamento, onde ninguém procura custo.

**E a pergunta que testaria o roteador está comentada** (`02-LangChain-AdaptiveRAG.py:229-232`):

```python
for q in [
    # "Who is the president of the United States?",
    "What types of memory do agents have?"
]:
```

A pergunta sobre o presidente é a que iria para `web_search`; a de memória de agentes vai para o `vectorstore`. Rodando como está, **a rota da web nunca é exercitada** — o roteador existe, decide, e sempre decide o mesmo. É o mesmo defeito que a Aula 19 encontrou no roteamento de prompt: um teste que não testa o roteador.

### Detalhes de leitura

- **A mesma descrição enganosa do arquivo `01`**: o prompt do roteador afirma que o vector store contém _"documents related to agents, prompt engineering, and adversarial attacks"_ (`02-LangChain-AdaptiveRAG.py:60`), e as mesmas duas URLs estão comentadas (`:37-38`). O roteador manda perguntas sobre prompt engineering para um índice que não as cobre — e, como a decisão é anterior à recuperação, o grader vai atribuir a falha ao documento.
- **API depreciada**: `retriever.get_relevant_documents(question)` (`02-LangChain-AdaptiveRAG.py:132`), no mesmo gênero do `llm(...)` da Aula 20. Não executei nada — `langchain` não está instalado neste ambiente —, então não afirmo o que ela imprime hoje.
- **Imports duplicados no meio do arquivo**: `Document` é importado em `:12` e novamente em `:106`; `StrOutputParser` em `:14` e em `:114`.
- **Chunking diferente entre os dois arquivos do mesmo módulo**: `chunk_size=100, chunk_overlap=50` no `01` (`01-LangChain-AgenticRAG.py:36`) contra `chunk_size=500, chunk_overlap=0` no `02` (`02-LangChain-AdaptiveRAG.py:43`). Cem tokens com metade de sobreposição é um regime bem diferente de quinhentos sem nenhuma — e nada nos arquivos justifica a escolha.
- **O salvamento do diagrama aqui não está comentado** (`02-LangChain-AdaptiveRAG.py:212-225`) e grava em `10-AdvanceRAG/04-AgenticRAG/` seguido de `AdaptiveRAG-Graph.png` — relativo à raiz do repo e **sem** o prefixo `02-` do arquivo real, ou seja, num caminho que não existe. Rodando de dentro da pasta, o `except` imprime o erro e o script continua.

---

## Parte 4 — Classificando os dois pela taxonomia da Aula 25

Agora a régua. Cada linha abaixo foi verificada no código, não inferida do nome:

|                                           | `01-LangChain-AgenticRAG.py`                                              | `02-LangChain-AdaptiveRAG.py`                                       |
| ----------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Quem decide a ação                        | **o modelo** (`bind_tools`, `:106`) — mais um `or` por substring (`:127`) | o código, lendo um roteador estruturado (`:190`)                    |
| Padrão de fluxo (Aula 25)                 | condicional + laço                                                        | condicional + laço                                                  |
| O que a condição escolhe                  | usar ferramenta ou encerrar; gerar ou reescrever                          | **a fonte** (índice ou web); gerar ou reescrever; retry/rewrite/fim |
| Nós                                       | 5 (`:163-167`)                                                            | 5 (`:181-185`)                                                      |
| Graders                                   | 1 — relevância (`:60`)                                                    | 3 — relevância, alucinação, resposta (`:66`, `:80`, `:93`)          |
| Fonte alternativa                         | não (Tavily importado e não usado)                                        | **sim**, busca na web (`:118`, `:152-155`)                          |
| Ciclos                                    | 1, sem limite                                                             | 3, sem limite                                                       |
| `scheduling module`                       | ausente                                                                   | ausente                                                             |
| É "adaptive (active) retrieval" do paper? | não                                                                       | **não** — decide _onde_, não _quando_                               |
| É agentic?                                | **sim**, no sentido mínimo                                                | não                                                                 |

Duas conclusões que valem mais que a tabela.

**O `02` não é Adaptive RAG no sentido do paper.** O paper Modular RAG, lido na Aula 25, define adaptive (active) retrieval como o sistema decidindo **o momento** da recuperação, com FLARE (por prompt, checando tokens de baixa probabilidade) e Self-RAG (por fine-tuning) como exemplos. O `02` decide **a fonte**, antes de qualquer geração — o padrão _conditional_ da mesma taxonomia. É uma técnica boa e é outra técnica. Décimo quarto caso, neste curso, de nome que não corresponde ao que o código faz.

**O `01` é agentic, e o mínimo é mesmo mínimo.** Uma ferramenta, um `bind_tools`, e um roteamento que aceita substring como se fosse chamada de ferramenta. Comparado com o que a palavra "agente" costuma prometer — múltiplas ferramentas, planejamento, memória —, é o primeiro degrau. Julgamento: e está certo que seja, para um exemplo didático; o problema é o `or` da linha 127, que dilui justamente a única coisa que faz o arquivo ser agentic.

---

## Parte 5 — O freio ausente, terceira vez

Três arquivos deste repositório implementam laço, e nenhum implementa limite de iteração:

| Arquivo                                                                                   | Ciclos                                        | Contador      |
| ----------------------------------------------------------------------------------------- | --------------------------------------------- | ------------- |
| `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py`                           | **nenhum** — acíclico por construção (`:457`) | não se aplica |
| `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py` | 3 (`:354`, `:359`, `:361`)                    | ausente       |
| `10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py`                                  | 1 (`:174`)                                    | ausente       |
| `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py`                                 | 3 (`:201`, `:208`)                            | ausente       |

O paper Modular RAG especifica o freio em todos os três subtipos de laço, e nomeia o componente responsável — o `scheduling module`, cuja função é decidir _"when to cease generation or initiate a new retrieval loop"_. Nenhum dos três arquivos o tem.

Julgamento de engenharia, e é a recomendação prática desta aula: se você copiar qualquer um desses grafos, o primeiro acréscimo é um contador no estado, o segundo é a mudança de entrada entre as voltas, e o terceiro é uma resposta de última instância quando o contador estoura. Sem os três, o pior caso não é resposta errada — é uma exceção da plataforma no meio do caminho.

> ⚠️ **Precisão sobre o risco.** O LangGraph tem um `recursion_limit` padrão de **25**
> super-steps, e `grep -rn "recursion_limit"` não encontra nenhuma configuração em nenhum `.py`
> do repositório. Ou seja: existe um freio, ele é da plataforma, e o pior caso não é gasto
> ilimitado — é uma `GraphRecursionError` depois de ~25 passos, com custo limitado e mensagem
> confusa. O contador que falta no estado da aplicação não serve para evitar laço infinito;
> serve para **degradar com elegância** antes de a plataforma abortar, entregando ao usuário uma
> resposta com ressalva em vez de uma exceção.

E há um agravante específico do `01`: o `rewrite` que reseta as mensagens torna cada volta **menos** informada que a anterior. Um laço que perde informação a cada iteração não converge; ele se afasta.

---

## Mão na massa

Os dois scripts pedem chaves por `getpass` e carregam páginas da web. O `02` precisa também de `COHERE_API_KEY` e `TAVILY_API_KEY` (`10-AdvanceRAG/04-AgenticRAG/.env.example:7-11`).

**1. Veja a decisão do agente.** No `01`, imprima `last_msg.tool_calls` dentro de `should_use_tools` (`:122-129`) e registre, a cada execução, se o roteamento veio da chamada de ferramenta ou da substring. Essa contagem diz quanto do comportamento "agentic" é real.

**2. Tire o `or`.** No mesmo lugar, remova a segunda condição da linha 127 e rode. Se o grafo passar a terminar sem recuperar, você descobriu que o exemplo dependia da substring — e o próximo item explica por quê.

**3. Use o `tools_condition` que está importado.** Substitua `should_use_tools` pelo `tools_condition` da linha 18 e o nó `retrieve` pelo `ToolNode`. Compare o comportamento. É a versão do arquivo que o import prometia.

**4. Conserte a descrição da ferramenta.** Descomente as duas URLs (`01-LangChain-AgenticRAG.py:29-30`) para que o índice cubra o que a descrição da linha 47 promete. Depois pergunte algo sobre prompt engineering, antes e depois da mudança, e compare o veredito do grader.

**5. Preserve a pergunta original.** No `01`, acrescente uma chave `original_question` ao `AgentState` (`:52-56`), preencha-a na entrada e faça `rewrite` (`:132-143`) mantê-la. Depois faça `generate` usá-la em vez de `msgs[0].content`. Rode uma pergunta que force duas reescritas e compare as respostas.

**6. Exercite o roteador.** No `02`, descomente a pergunta sobre o presidente (`:230`). Agora a rota `web_search` é usada. Imprima a decisão do roteador para cada pergunta e verifique se ela é a que você esperava.

**7. Gradue o que vem da web.** No `02`, troque a aresta `web_search → generate` (`:203`) por `web_search → grade_documents`. Rode a pergunta sobre o presidente e veja o que o grader faz com resultado de busca web.

**8. Coloque o freio, nos dois.** Adicione um contador ao estado e um limite em cada função de decisão. No `02`, lembre que são três ciclos — e decida, para cada um, o que acontece quando o limite estoura: responder com ressalva, admitir falha ou cair na web.

**9. Conte o custo.** Instrumente os dois arquivos para contar chamadas de LLM por consulta. No `02`, note que `grade_generation_node` roda dentro de um lambda de aresta (`:207`) e dispara uma ou duas chamadas por avaliação. Compare o total com o Naive RAG da Aula 03.

---

## Quebre de propósito

**1. Faça o agente responder de memória.** No `01`, mude a instrução da linha 112 para "Responda com o que você já sabe". O `should_use_tools` manda para `END`, e você recebe uma resposta sem recuperação nenhuma. Esse é o modo de falha que só existe em sistema agentic: o agente decide não usar a ferramenta, e o pipeline não tem como obrigá-lo.

**2. Provoque o falso positivo da substring.** Force o modelo a escrever a palavra "retrieve" numa resposta que não pede ferramenta. O grafo vai recuperar de qualquer forma.

**3. Deixe o laço girar.** No `01`, faça o grader devolver sempre `"rewrite"`. Conte as voltas e observe a pergunta a cada uma — ela se afasta da original porque o `rewrite` apaga o histórico (`:139`).

**4. Minta na descrição da ferramenta.** Ainda no `01`, mude a descrição da linha 47 para um assunto que o índice não tem ("Searches Brazilian tax law"). O agente vai chamar a ferramenta para perguntas de direito tributário. A descrição é prompt; mentir nela é mentir para quem decide.

**5. Force o roteador ao rótulo errado.** No `02`, mude o system prompt do roteador (`:60`) para descrever o vector store como contendo notícias atuais. Pergunte sobre o presidente e veja a pergunta ir para o índice de posts de blog.

**6. Rebaixe o `Literal` a `str`.** No `RouteQuery` (`:52`), troque `Literal["vectorstore", "web_search"]` por `str`. Agora o roteador pode devolver um rótulo fora do dicionário de arestas. Veja o que acontece — e compare com o que a Aula 20 disse sobre enumeração escrita na descrição em vez de no tipo.

**7. Tire a abstenção.** No `02`, remova a guarda de documentos vazios (`:163-164`) e deixe a cadeia gerar com contexto vazio. É a dívida da Aula 19 reaparecendo no último exemplo do curso.

---

## Armadilhas de produção

**Descrição de ferramenta é prompt.** Num sistema agentic, a descrição decide se a ferramenta é chamada. Uma descrição desatualizada em relação ao índice produz chamadas erradas cuja causa está três nós antes do sintoma. Versione a descrição junto do que foi indexado.

**Roteamento por substring.** Se você precisa de um `or` com busca de texto para o agente funcionar, o problema não é o roteamento — é que o modelo não está chamando a ferramenta, e a razão precisa ser investigada. Mascarar isso torna o comportamento não reproduzível.

**Laço que perde informação.** Resetar o estado a cada volta parece limpeza e é perda. Guarde a pergunta original, e faça as decisões seguintes contra ela.

**Ciclo sem contador, pela terceira vez.** Três dos quatro grafos deste repositório têm laço; nenhum tem limite. **Julgamento:** é o defeito mais recorrente do repositório inteiro, e o mais fácil de corrigir.

**Fonte alternativa sem controle de qualidade.** Se o índice é graduado e a web não é, você criou um caminho preferencial para material não verificado. E, como a Aula 21 observou sobre o resultado de ferramenta, o que entra no contexto entra como fato.

**Função de decisão que gasta.** Um lambda de aresta que dispara duas chamadas de LLM por avaliação é custo invisível: ele não aparece na lista de nós nem no diagrama do grafo. Se você conta custo por nó, vai errar a conta.

**Campos de estado que ninguém lê.** `retrieval_done` e `graded` sugerem controle de fluxo que não existe. Estado não consumido é documentação errada em forma de código.

**`getpass` em vez de variável de ambiente.** Impede execução automatizada e contradiz o `.env.example` do próprio diretório. Para um script que você vai agendar ou colocar em CI, é bloqueio.

---

## Checkpoint

Responda sem consultar:

1. Qual a diferença entre um grafo condicional e um agente, e onde mora a decisão em cada caso?
2. Os dois sentidos de "adaptive" — qual deles o arquivo `02` implementa, e como você verifica isso no código?
3. Quais sete imports estão mortos no arquivo `01`, e qual deles engana mais quem lê a arquitetura pela lista de imports?
4. Que problema o `tools_condition` importado e não usado resolveria?
5. Por que a segunda condição de `should_use_tools` é um defeito, e o que ela provavelmente estava consertando?
6. Como a descrição da ferramenta e a lista de URLs se contradizem, e por que isso é pior num sistema agentic que num pipeline?
7. O que o nó `rewrite` faz com o histórico, e por que um laço que perde informação não converge?
8. Que eixo de divergência de rota o arquivo `02` exercita, e por que ele é novo neste curso?
9. Por que a rota `web_search` do arquivo `02` é uma assimetria difícil de justificar?
10. `grade_generation_node` é um nó do grafo? Onde ele é chamado, e qual o custo escondido disso?
11. Qual pergunta está comentada no arquivo `02`, e o que a ausência dela impede de testar?
12. Quantos dos quatro grafos do repositório têm laço, e quantos têm limite de iteração?

---

## Vocabulário

`agentic RAG` · `adaptive RAG` · `tool calling` · `bind_tools` · `ToolNode` · `tools_condition` ·
`tool description` · `query routing` · `datasource routing` · `web search fallback` ·
`conditional edge` · `graph state` · `iteration limit` · `scheduling module`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 25 — Modular RAG como arquitetura](AULA-25-modular-rag.md)
**Próxima:** [AULA 27 — Multimodal RAG com Weaviate](AULA-27-multimodal-rag.md)

> Este foi o último grafo do curso, e o defeito que ele repete pela terceira vez é o mesmo que a Aula
> 25 mostrou estar especificado na literatura. A Aula 27 fecha a Fase 9 com
> `10-AdvanceRAG/05-MultiModalRAG/` — dois scripts Weaviate e um `docker-compose.yml`, a segunda vez
> em todo o curso que um exemplo traz a sua própria infraestrutura: a primeira foi o Milvus da Aula 09
> (`04-VectorDB/Milvus/docker-compose.yml`). O que a Aula 27 traz de novo é o requisito de memória
> **quantificado em bytes**.
