# AULA 13 — Query translation: reescrita, decomposição, HyDE e clarificação

**Fase 4 — Pré-recuperação** · Módulo do repo: `05-PreRetrieval/02-QueryTranslation/` (6 arquivos)

---

## Pergunta motivadora

A Aula 12 tratou a pergunta que **muda de destino** — vai para SQL, Cypher ou filtro. Esta trata
a que continua indo para o índice vetorial, mas **não deveria ir como veio**.

Motivo: a pergunta do usuário é otimizada para ser feita, não para ser recuperada. Ela é curta,
interrogativa, usa o vocabulário de quem não sabe a resposta, e às vezes contém três perguntas
disfarçadas de uma. O documento que responde é longo, declarativo, usa o jargão de quem sabe, e
trata de um assunto por vez.

**Query translation é o conjunto de técnicas que fecha essa distância** — reescrevendo,
quebrando, expandindo ou perguntando de volta.

---

## Modelo mental

### As quatro operações, e o que cada uma conserta

| Técnica             | Consulta vira                       | Conserta                                            |
| ------------------- | ----------------------------------- | --------------------------------------------------- |
| **Reescrita**       | uma consulta melhor                 | vocabulário, ruído, ambiguidade leve                |
| **Decomposição**    | várias consultas                    | pergunta composta                                   |
| **Expansão (HyDE)** | uma consulta com forma de documento | assimetria pergunta↔documento                       |
| **Clarificação**    | uma pergunta de volta ao usuário    | ambiguidade que o sistema não pode resolver sozinho |

As três primeiras são automáticas. A quarta é a única que admite que **nem toda ambiguidade tem
solução algorítmica** — e é a menos implementada em produção.

### O custo comum às três primeiras

Cada técnica desta aula adiciona **pelo menos uma chamada de LLM antes de recuperar**. Isso
significa latência somada em toda consulta, e custo por consulta, não por ingestão.

A consequência prática: aplicar tudo sempre é caro e lento. A decisão de qual técnica usar
depende do perfil das perguntas — o que devolve a bola para o roteamento da Aula 14 e para o
conjunto de avaliação da Aula 22.

---

## Parte 1 — Reescrita: manual contra abstração

O par `01-QueryRewriting-*` mostra a mesma ideia em dois níveis. E o `diff` de imports já entrega
a diferença:

| Arquivo                                         | Como                                                                                                       |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `01-QueryRewriting-1-RewriteViaPrompt.py`       | `from openai import OpenAI` (linha 1) — chamada direta, função `rewrite_query(question)` própria (linha 8) |
| `01-QueryRewriting-2-RePhraseQueryRetriever.py` | `RePhraseQueryRetriever` do LangChain (linha 4), com `Chroma` e `ChatDeepSeek`                             |

O `01-1` é o didático. Ele tem uma função explícita com docstring — _"Use an LLM to rewrite the
query"_ — e um prompt que vale ler por inteiro. Ele começa assim (linha 10):

```python
    prompt = """You are a game customer support agent, and you need to help the user rewrite their question.
```

Note o que esse prompt faz: **atribui um papel de domínio** ("agente de suporte de um jogo").
Não é enfeite. Reescrever "como faço pra passar da fase do lobo" para algo recuperável exige
saber que "fase do lobo" é um chefe do jogo, e o papel é o que carrega esse contexto para o
modelo.

Isso é o ponto transferível: **a reescrita é específica de domínio.** Um reescritor genérico
melhora pouco; um que conhece o vocabulário do seu acervo melhora muito. E é por isso que o `01-1`
merece ser lido antes do `01-2` — a abstração do LangChain esconde justamente o prompt, que é
onde o valor está.

O `01-2` é a versão de produção: o `RePhraseQueryRetriever` embrulha reescrita e recuperação num
retriever só, que você encaixa no lugar de qualquer outro. Ganha conveniência, e você precisa ir
atrás de qual prompt ele usa por baixo.

---

## Parte 2 — Decomposição: uma pergunta, várias buscas

O par `02-QueryDecomposition-*` usa o `MultiQueryRetriever` do LangChain, que gera **múltiplas
versões da pergunta** e une os resultados. O `diff` mostra que a diferença é controle:

| Arquivo                                          | Imports adicionais                                        |
| ------------------------------------------------ | --------------------------------------------------------- |
| `02-QueryDecomposition-1-MultiQueryRetriever.py` | só `MultiQueryRetriever` (linha 9)                        |
| `02-QueryDecomposition-2-MultiQueryRetriever.py` | `+ BaseOutputParser`, `+ PromptTemplate`, `+ typing.List` |

O `-2` acrescenta um **output parser próprio** (o comentário do arquivo diz _"Custom output
parser"_) e um `PromptTemplate` explícito. Ou seja: no `-1` você aceita o prompt e o parser
default da biblioteca; no `-2` você controla **como as subconsultas são geradas** e **como a saída
do LLM é convertida em lista**.

Por que o parser precisa ser customizável: o LLM devolve as subconsultas como texto — uma por
linha, ou numeradas, ou com bullet. O parser default assume um formato. Quando o modelo varia, a
lista sai errada ou vazia, e o retriever silenciosamente busca menos do que deveria. É o mesmo
problema da Aula 12, seção Text2SQL: **a saída do LLM não vem no formato que você espera**, e a
solução é a mesma — controlar a extração em vez de confiar.

### Uma distinção que o nome esconde

"Decomposição" e "multi-query" não são exatamente a mesma coisa, e o repositório usa o
`MultiQueryRetriever` para as duas:

- **Multi-perspectiva** — gerar N paráfrases da _mesma_ pergunta, para cobrir vocabulários
  diferentes. Une os resultados. O comentário da linha 9 do `-1` diz exatamente isso:
  _"Multi-perspective query retriever"_.
- **Decomposição real** — quebrar uma pergunta _composta_ em subperguntas _distintas_
  ("compare A e B" → "o que é A", "o que é B"), recuperar para cada e combinar.

A primeira aumenta recall sobre um assunto. A segunda cobre assuntos diferentes que a pergunta
exigia. Confundi-las leva a esperar que o multi-query resolva pergunta composta — e ele resolve
parcialmente, porque as paráfrases tendem a herdar a composição em vez de separá-la.

---

## Parte 3 — HyDE: a sonda geométrica

`04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py` é a técnica mais contra-intuitiva do
curso e, **julgamento**, a mais elegante.

A ideia: em vez de buscar pelo embedding da pergunta, você pede ao LLM que **escreva uma resposta
hipotética** — que pode estar factualmente errada — e busca pelo embedding **dela**.

Os imports (linhas 2 a 9) mostram o pipeline completo: `ChatPromptTemplate` e `StrOutputParser`
para gerar o documento hipotético, `ChatDeepSeek` como gerador, `HuggingFaceEmbeddings` para
embutir, `TextLoader` e `RecursiveCharacterTextSplitter` para o acervo, e `Chroma` como índice.

### Por que funciona

A explicação curta é que o espaço de embedding foi treinado para aproximar **textos parecidos entre
si**, não para alinhar pergunta com resposta — e uma pergunta é textualmente muito diferente de um
documento:

|             | Pergunta      | Documento   | Resposta hipotética |
| ----------- | ------------- | ----------- | ------------------- |
| Extensão    | curta         | parágrafos  | parágrafo           |
| Forma       | interrogativa | declarativa | **declarativa**     |
| Vocabulário | do leigo      | técnico     | **técnico**         |

A resposta hipotética tem a **forma de um documento**. Ela cai numa vizinhança do espaço vetorial
muito mais próxima dos documentos reais que respondem à pergunta.

### O detalhe que parece errado

A resposta hipotética **pode estar factualmente errada e HyDE ainda funciona** — porque ela nunca
é mostrada ao usuário nem usada como evidência. Serve apenas como sonda geométrica. O que importa
é que ela caia no bairro certo, não que esteja correta.

Isso é o que confunde quem vê a técnica pela primeira vez: parece que se está indexando ou
respondendo com invenção. Não — a resposta final vem dos documentos **reais** recuperados.

### Quando HyDE atrapalha

Julgamento, e vale explicitar porque é onde a técnica é mal aplicada:

- **Domínio que o modelo não conhece.** Se o LLM não sabe nada do seu jargão interno, a sonda
  aponta para o bairro errado com confiança.
- **Perguntas numéricas.** Gerar uma resposta hipotética sobre valores fiscais produz números
  inventados, e a sonda arrasta a recuperação para documentos com números parecidos e errados.
  Para esse caso, o caminho é a Aula 12 (Text2SQL), não HyDE.
- **Latência apertada.** É uma chamada de LLM antes de cada busca.

Uma ressalva sobre a ressalva: numa pergunta **mista** — parte numérica, parte explicativa — o
raciocínio não é rejeitar HyDE em bloco. Roteie a parte numérica para SQL e considere HyDE apenas
para a sub-pergunta explicativa. (Registro isso porque a versão anterior deste raciocínio, feita
numa avaliação deste curso, rejeitou HyDE inteiro para uma query mista e foi corretamente
apontada como inconsistente.)

---

## Parte 4 — Clarificação: a técnica honesta

`03-QueryClarification-BuildQueryClarificationTree.ipynb` é o único notebook do módulo, e a única
técnica que **não tenta resolver a ambiguidade sozinha**.

O nome descreve o **design**: uma **árvore de clarificação**. Diante de uma pergunta ambígua, o
sistema não escolheria uma interpretação — perguntaria de volta, e cada resposta do usuário podaria
um ramo da árvore até restar uma consulta específica.

> ⚠️ **Mas abra o notebook antes de acreditar nisso.** Nada disso está implementado.
> `03-QueryClarification-BuildQueryClarificationTree.ipynb` não tem uma única chamada de LLM, nem
> um `input()`, nem um laço de interação — contei sobre o JSON do notebook: `openai`, `invoke(`,
> `input(` e `api_key` aparecem **zero** vezes. O que existe são sete funções, e o que elas fazem é
> outra coisa: `identify_main_aspects()` **resolve a ambiguidade sozinha**, por correspondência de
> palavra-chave contra uma base fixa, com um default silencioso quando nada casa
> (`if not aspects: aspects.add("abilities")`); `build_clarification_tree()` expande **todos** os
> ramos de uma vez; `visualize_tree()` desenha o resultado no matplotlib e o programa termina. Não
> há poda, porque não há resposta do usuário para podar nada. O arquivo nem chega a tocar num
> retriever.
>
> Ou seja: este é o gerador de perguntas de clarificação, não o diálogo. Ele produz **o que
> perguntar**; quem pergunta, espera e poda é o sistema que você escreveria em volta dele. E note a
> ironia, que é, **julgamento**, o achado mais instrutivo desta aula: o arquivo que ilustra "não resolver a
> ambiguidade sozinho" resolve a ambiguidade sozinho, por `if`.

Por que isso importa: as três técnicas anteriores **assumem** que a intenção é recuperável do
texto da pergunta. Quando não é — "quanto custa?" sem dizer o quê, "e o outro?" sem contexto —
qualquer reescrita automática está adivinhando, e adivinhar errado com confiança é pior que
perguntar.

Custo real: **atrito na interface.** Cada pergunta de volta é uma etapa a mais para o usuário, e
sistemas que clarificam demais são abandonados. A engenharia aqui é decidir o **limiar** — quando
a ambiguidade é grande o bastante para justificar a pergunta. Isso não tem valor default; depende
do custo de errar no seu domínio. Num sistema de suporte, errar é barato e clarificar irrita. Num
sistema jurídico ou médico, o cálculo se inverte.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/05-PreRetrieval/02-QueryTranslation
python 01-QueryRewriting-1-RewriteViaPrompt.py
```

Comece por aqui e **leia o prompt completo** antes de rodar. Depois teste com perguntas de
qualidade decrescente: uma bem formulada, uma coloquial, uma com erro de digitação, uma com gíria.
Observe onde a reescrita ajuda e onde ela distorce.

```powershell
python 01-QueryRewriting-2-RePhraseQueryRetriever.py
python 02-QueryDecomposition-1-MultiQueryRetriever.py
python 02-QueryDecomposition-2-MultiQueryRetriever.py
```

No par `02`, o exercício é comparar as **subconsultas geradas**. Imprima-as (o
`MultiQueryRetriever` pode logá-las) e veja se são paráfrases da mesma pergunta ou subperguntas
distintas. Essa observação decide se você está fazendo multi-perspectiva ou decomposição.

```powershell
python 04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py
```

Imprima o **documento hipotético** antes de ele ser embutido. Ler o que o modelo inventou é o que
torna a técnica compreensível — e é também como você detecta que ela está apontando para o bairro
errado.

O notebook de clarificação abre no Jupyter:

```powershell
jupyter notebook 03-QueryClarification-BuildQueryClarificationTree.ipynb
```

---

## Quebre de propósito

**1. Remova o papel do prompt de reescrita.** No `01-1`, apague "You are a game customer support
agent" e deixe só a instrução genérica de reescrever. Compare as reescritas de uma pergunta com
jargão do domínio. A perda mostra que reescrita boa é reescrita informada.

**2. Faça o parser do multi-query falhar.** No `-2`, altere o `PromptTemplate` para pedir a saída
num formato que o parser não espera (por exemplo, separada por ponto e vírgula em vez de linhas).
Observe: o retriever não estoura — ele busca menos. **Falha silenciosa**, e é o padrão que a
Aula 12 já mostrou no Text2SQL.

**3. Rode HyDE num domínio que o modelo não conhece.** Troque o acervo por documentos de jargão
muito específico (interno da sua empresa, ou uma norma técnica obscura) e imprima o documento
hipotético. Ele vai ser plausível e desconectado — a sonda apontando para o bairro errado.

**4. Compare HyDE com busca direta na mesma pergunta.** Rode a recuperação com e sem HyDE e
compare os trechos retornados. Em perguntas curtas e coloquiais o ganho tende a aparecer; em
perguntas já bem formuladas e técnicas, tende a desaparecer. Isso indica **quando** ativar a
técnica em vez de aplicá-la sempre.

**5. Peça ao multi-query uma pergunta comparativa.** "Compare A e B." Veja se as consultas
geradas separam A de B ou se todas herdam a comparação. É a distinção da Parte 2, medida.

---

## Armadilhas de produção

- **Latência somada.** Toda técnica desta aula custa uma chamada de LLM **antes** de recuperar.
  Em cadeia (reescreve, decompõe, HyDE) você triplica o tempo até o primeiro resultado.
- **Reescrita que muda a intenção.** O modelo "corrige" a pergunta para algo que ele acha mais
  sensato, e você recupera resposta para outra pergunta. Registre a query original e a reescrita
  no log — sem isso, o diagnóstico é impossível.
- **Parser de subconsultas frágil.** Falha em silêncio, reduzindo o recall sem sinal.
- **HyDE em domínio desconhecido pelo modelo.** Piora ativamente, não fica neutro.
- **HyDE em pergunta numérica.** Números inventados na sonda arrastam a recuperação.
- **Multi-query multiplicando custo de embedding.** N subconsultas = N embeddings por pergunta.
  Com N alto e volume alto, isso aparece na fatura.
- **Clarificação em excesso.** Sistema que pergunta de volta o tempo todo é abandonado.
- **Aplicar tudo sempre.** Estas técnicas são condicionais. Sem roteamento (Aula 14) ou sem
  medição (Aula 22), você paga por todas em toda consulta e não sabe qual está ajudando.

---

## Checkpoint

1. Por que a pergunta do usuário não é boa consulta de recuperação? Cite três diferenças em
   relação ao documento que a responde.
2. Qual a diferença entre `01-1` e `01-2`, e por que ler o primeiro antes vale a pena?
3. O que o papel de domínio no prompt de reescrita acrescenta?
4. Qual a diferença entre multi-perspectiva e decomposição real? O `MultiQueryRetriever` resolve
   as duas igualmente bem?
5. O que o arquivo `02-...-2` acrescenta em relação ao `-1`, e que problema isso previne?
6. Explique por que HyDE funciona, usando a assimetria pergunta↔documento.
7. Por que a resposta hipotética pode estar errada sem invalidar a técnica?
8. Cite três situações em que HyDE atrapalha.
9. Por que a clarificação é a única técnica "honesta" desta aula, e qual o custo dela?
10. Qual o custo comum a todas as quatro técnicas, e o que isso implica para a arquitetura?

---

## Vocabulário

`query rewriting` · `query decomposition` · `query expansion` · `HyDE` · `MMR` ·
`top-k` · `retriever`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 12 — Query construction](AULA-12-query-construction.md)
**Próxima:** [AULA 14 — Query routing lógico e semântico](AULA-14-query-routing.md)

> As Aulas 12 e 13 transformam a pergunta. A Aula 14 decide **para onde ela vai** — e é o que
> torna possível aplicar estas técnicas seletivamente, em vez de pagar por todas sempre.
