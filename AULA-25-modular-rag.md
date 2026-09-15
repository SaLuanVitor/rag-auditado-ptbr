# AULA 25 — Modular RAG como arquitetura

**Fase 9 — Avançado** · Módulo do repo: `10-AdvanceRAG/03-ModularRAG/` — **dois arquivos, nenhum de código** (`ls -A`: o PDF do paper e um `.env.example` de 2 linhas; o `ls` simples mostra só o PDF)

---

## Pergunta motivadora

Vinte e quatro aulas produziram peças: divisores de texto, dois tipos de índice, busca híbrida com duas fusões, reescrita de consulta, roteamento por embedding e por LLM, small-to-big, índice hierárquico, reranking, compressão, correção reflexiva, três graders, saída estruturada, contextualização de chunk.

Cada peça foi apresentada isolada, e o curso vem repetindo uma pergunta que não respondeu: **como isso se monta?** Existe uma gramática, ou cada sistema é um arranjo improvisado dos componentes que o autor conhecia?

O paper deste diretório responde que existe gramática, e a escreve. Ele propõe três coisas:

1. Uma **taxonomia** em três níveis — módulos, submódulos, operadores.
2. Uma representação: o sistema RAG como **grafo computacional**.
3. Um catálogo de **padrões de fluxo** recorrentes, com algoritmos.

E há uma segunda pergunta, que esta trilha já teve de enfrentar duas aulas atrás: **este diretório também não tem código.** É a segunda vez, o método já está estabelecido, e o interessante é que o assunto desta aula é justamente arquitetura — a coisa que menos precisa de código para ser ensinada e a que mais precisa dele para ser conferida.

---

## Modelo mental

### Os três paradigmas são encaixados, não alternativos

A frase mais útil do paper para desfazer confusão de vocabulário:

> _"Advanced RAG is a special case of Modular RAG, while Naive RAG is a special case of Advanced RAG."_

Não são três escolas em competição. São três graus de generalidade, e a relação é de herança:

| Paradigma    | O que caracteriza                                                                  |
| ------------ | ---------------------------------------------------------------------------------- |
| Naive RAG    | recuperar, colar no prompt, gerar — cadeia linear de dois passos                   |
| Advanced RAG | acrescenta indexação hierárquica, pré-recuperação e pós-recuperação — ainda linear |
| Modular RAG  | acrescenta **controle de fluxo**: condição, ramificação, laço                      |

O paper chega a escrever o Naive RAG em notação, como um caso degenerado do formalismo geral — a consulta atravessa um retriever e um LLM, e acabou.

E o diagnóstico de por que isso não basta está na legenda da figura 1: mesmo o Advanced RAG, com toda a melhoria de precisão de recuperação, tem o problema de que _"these relevant documents have not been used correctly"_. Trazer o trecho certo e usá-lo mal é uma falha que nenhuma otimização de recuperação alcança.

### O que muda quando o fluxo deixa de ser linear

O paper nomeia os custos, e vale ler porque é raro um survey fazer isso. A flexibilidade _"makes the orchestration and scheduling of workflows more complex, posing greater challenges to system design"_, e os desafios listados incluem:

- **Integração de fontes heterogêneas** — texto, tabelas, grafos de conhecimento;
- **Interpretabilidade, controlabilidade e manutenibilidade** — com a complexidade, _"system maintenance and debugging have become more challenging"_, e é preciso _"quickly pinpoint the specific components that require optimization"_;
- **Seleção e otimização de componentes** — mais redes neurais no sistema significa mais escolhas e mais requisitos de coordenação.

Repare que o segundo item é exatamente a razão de existir do primeiro: a taxonomia serve para você **saber onde olhar** quando o sistema responde mal. Uma arquitetura nomeada é uma ferramenta de diagnóstico antes de ser uma ferramenta de construção.

### Grafo, e não pipeline

A representação proposta é um grafo computacional em que **os nós são operadores**. Isso não é metáfora: é a mesma estrutura que a Aula 18 e a Aula 21 já construíram com LangGraph, agora com nome e formalismo. Um fluxo é uma sequência de módulos parametrizados, e ele _"can be decomposed into a graph of sub-functions"_ — no caso mais simples, uma cadeia linear.

---

## Parte 1 — O diretório, pela segunda vez

`ls -A` em `10-AdvanceRAG/03-ModularRAG/` devolve dois arquivos — o `ls` simples mostra um, porque o `.env.example` é oculto: `ModularRAG-2407.21059v1.pdf`, com 2.583.566 bytes, e um `.env.example` de 116 bytes cujo conteúdo é idêntico ao do módulo de GraphRAG (`10-AdvanceRAG/03-ModularRAG/.env.example:1-2`):

```python
# This folder has no Python scripts (reference PDF only), so no API keys or
# environment variables are required.
```

A Aula 23 já havia confirmado isso por `find` e registrado o alerta de que esta aula encontraria a mesma situação. Encontrou. Dos três paradigmas avançados que o `README.md` da raiz do clone da Packt anuncia — GraphRAG, Agentic RAG e Modular RAG —, **dois são apenas papers**.

Julgamento, e é uma observação sobre o livro, não sobre a técnica: Modular RAG é o capítulo que **menos** perde por não ter código, porque é taxonomia. Um leitor que chegue aqui depois de vinte e quatro aulas de código tem os exemplos na cabeça; o que faltava era o nome de cada coisa. É o que esta aula entrega.

O que se perde, e vale dizer: sem código, ninguém confere se a taxonomia cobre os casos. Esta aula faz essa conferência à mão, mapeando cada padrão do paper às aulas anteriores, e cada correspondência foi verificada no paper **e** na aula, não inferida do nome.

---

## Parte 2 — Os seis módulos, e o que falta no curso

O paper estabelece seis módulos de topo, e a frase é literal:

> _"Based on the current stage of RAG development, we have established six main modules: Indexing, Pre-retrieval, Retrieval, Post-retrieval, Generation, and Orchestration."_

Cinco deles têm correspondência no curso, e ela é aproximada em vez de exata: `Indexing` se espalha por quatro fases e divide as Aulas 09-11 com `Retrieval`, porque o repositório trata schema, índice ANN e busca no mesmo módulo. O sexto não tem correspondência nenhuma:

| Módulo do paper    | Onde está no curso                       |
| ------------------ | ---------------------------------------- |
| **Indexing**       | Fases 1–3 (Aulas 04–11) e Fase 5 (15–16) |
| **Pre-retrieval**  | Fase 4 (Aulas 12–14)                     |
| **Retrieval**      | Fase 3 (Aulas 09–11)                     |
| **Post-retrieval** | Fase 6 (Aulas 17–18)                     |
| **Generation**     | Fase 7 (Aulas 19–21)                     |
| **Orchestration**  | **em nenhuma fase**                      |

Essa última linha é o achado desta aula. O curso — como o repositório, e como a maioria dos tutoriais — organiza o aprendizado pelos **estágios do dado**: entra, é dividido, é indexado, é buscado, é reordenado, é gerado. A orquestração não é um estágio do dado; é o que decide **qual estágio roda em seguida**. Ela aparece transversalmente, sempre como propriedade de outro assunto: dos três submódulos da seção IV.F, o curso ensina `Routing` nas Aulas 14 e 19 e `Fusion` nas Aulas 11 e 17, os dois com código, e o RRF da Aula 17 é implementado à mão. Ausente de verdade é só o `Scheduling`, que aparece emprestado nas Aulas 18 e 21 e vai reaparecer na 26. Nenhum dos três é assunto próprio de nenhuma fase.

O paper diz que o nível de topo _"not only inherits the main processes from the Advanced RAG paradigm but also introduces an orchestration module to control the coordination of RAG processes"_. No nível dos **módulos**, essa é a única peça genuinamente nova do paradigma. Todo o resto é herança. No nível de baixo a novidade encolhe: dos três submódulos dela, dois já tinham aparecido no curso sem esse nome.

Os três níveis, na descrição do paper: o topo trata cada estágio como módulo independente; o meio _"is composed of sub-modules within each module, further refining and optimizing the functions"_; a base _"consists of basic units of operation—operators"_.

Julgamento de engenharia: a utilidade prática desses três níveis não é catalogar. É que **operador é a unidade que você troca sem tocar no resto**. Se `rerank` é um operador do módulo de pós-recuperação, trocar Cohere por um cross-encoder local é uma substituição local. E a fronteira que permite a troca é a **injeção**: o híbrido escrito à mão da Aula 24 é exemplo **positivo** disso, porque o `EmbeddingBM25RerankerRetriever` recebe o reranker no construtor (`10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:93`) e o trata como opcional (`:114`), então trocar de reranker é trocar a construção de `:219`, que os dois retrievers recebem (`:238` e `:251`). Onde a fronteira não existe, a mesma troca vira cirurgia.

---

## Parte 3 — Os quatro padrões de fluxo

Esta é a parte que dá à aula seu valor prático. O paper define um padrão como uma sequência de módulos, cada um com seus operadores, e afirma que os padrões que ele catalogou _"transcend various application domains and demonstrate a high level of consistency and reusability"_.

São quatro — e aqui o paper dá três números diferentes para o próprio conjunto, o que vale registrar
numa aula cujo tema é a taxonomia. O abstract lista quatro ("linear, conditional, branching, and
looping"); a lista de contribuições afirma "six typical flow patterns"; e a seção V traz **cinco**
subseções, sendo a quinta o `E. Tuning Pattern` — retriever FT, generator FT e dual FT, com RA-DIT
como exemplo de ajuste conjunto. Esta aula cobre os quatro de **controle de fluxo**, e a razão de não
cobrir o quinto é que ele não descreve topologia de execução, e sim treino. Mas saiba que ele existe:
é lá que mora a diferença entre o RRR **treinado** da seção A e o `transform_query` por prompt do
repositório. E, para cada um dos quatro, o curso já viu ao menos uma instância.

### A. Linear

O caso mais simples: os módulos executam em ordem fixa. O exemplo canônico que o paper usa é o **RRR** — Rewrite-Retrieve-Read —, e vale notar que é o mesmo paper que está em `08-Generation/04-DynamicGenerationOptimizationStrategies/` e que a Aula 21 leu.

O paper acrescenta um detalhe sobre o RRR que a Aula 21 não tinha: o módulo de reescrita é _"a smaller trainable language model fine-tuned on T5-large"_, otimizado como um processo de decisão de Markov em que _"the final output of the LLM serving as the reward"_, e o retriever usa BM25.

Isto reposiciona o que a Aula 21 encontrou: o `transform_query` do Self-RAG do repositório é reescrita **por prompt**, com `gpt-3.5-turbo`. O RRR original **treina** o reescritor com a resposta final como recompensa. Mesmo padrão de fluxo, esforço de engenharia em outra ordem de magnitude.

### B. Conditional

Um módulo de roteamento escolhe qual fluxo a consulta atravessa. O paper define isso com uma função de roteamento que direciona para um módulo ou outro, e dá um exemplo que vale pela clareza: a tolerância a respostas geradas por LLM _"varies across questions related to serious issues, political matters, or entertainment topics"_ — e os fluxos alternativos _"often diverge in terms of retrieval sources, retrieval processes, configurations, models, and prompts"_.

Cinco coisas podem divergir entre rotas, portanto, e não apenas o prompt. O curso viu dois desses cinco eixos. **Prompt:** a Aula 14 roteou prompts por similaridade de embedding (`combat_template` / `story_template`) e a Aula 19 por classificação com LLM. E **fonte**, no `01-LogicalRouting.py` da mesma Aula 14, cujo `RouteQuery` devolve `datasource: Literal["python_docs", "js_docs", "golang_docs"]` (`05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py:14`) — com a ressalva de que ali o rótulo é devolvido e nada a jusante o consome: o eixo está **declarado, não exercido**. Quem o exerce de verdade é o `02-LangChain-AdaptiveRAG.py` da Aula 26, que roteia fonte na aresta que sai do `START`. Rotear processo, configuração ou modelo é a mesma estrutura aplicada a outra variável — e é aí que o padrão rende mais que o exemplo.

### C. Branching

Vários ramos rodam em paralelo, _"usually to increase the diversity of generated results"_. O paper separa em dois subtipos, e a distinção é operacional:

| Subtipo                      | O que acontece                                             | Onde o curso viu                                                                                                                                                                       |
| ---------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pre-retrieval branching**  | cada ramo recupera **e** gera separadamente; agrega no fim | nenhum exemplo no repositório — o multi-query da Aula 13 gera várias consultas, mas **une os documentos antes de uma única geração**, então é fan-out de recuperação, não este subtipo |
| **Post-retrieval branching** | uma recuperação; geração separada **por chunk**; agrega    | o `COMPACT_ACCUMULATE` do LlamaIndex, visto na Aula 20 — que é `class CompactAndAccumulate(Accumulate)`: reempacota os chunks e então responde por pedaço, concatenando. O `ACCUMULATE` puro, que responde por chunk sem reempacotar, **não aparece em nenhum arquivo do repositório**, como a Aula 20 registrou                                                                                                                                         |

O exemplo de post-retrieval branching que o paper detalha é o REPLUG, em que a probabilidade de cada token é prevista em cada ramo e os ramos são unidos por _"weighted possibility ensemble"_ — e o resultado serve para ajustar o retriever por feedback.

E a agregação dos ramos é onde a Aula 11 reaparece: o paper cita RRF como agregador, dizendo que ele é _"especially potent in scenarios characterized by model or source heterogeneity"_. A Aula 11 já havia comparado RRF com `WeightedRanker` — RRF ignora os scores e usa só a posição, o que é exatamente a propriedade que o torna robusto quando os ramos vêm de modelos diferentes, cujos scores não são comparáveis.

### D. Loop

O padrão que o paper trata como _"an important characteristic of Modular RAG"_: recuperação e geração interdependentes, com um **módulo de escalonamento** para controle de fluxo. A formalização é a de um grafo dirigido em que, se existe uma sequência de módulos que retorna ao início, o sistema tem um laço — e a decisão de voltar é de um **módulo Judge**.

É a estrutura que a Aula 21 (Self-RAG) construiu com arestas condicionais. **O CRAG da Aula 18 não
entra aqui** — apesar de também usar arestas condicionais, o grafo dele não tem nenhuma aresta de
retorno (`01-CRAG-ReflectiveRetrieval.py:421-457`), e o paper é explícito: laço é quando `M_in`
alcança `M_i1` de volta. O CRAG pertence ao padrão **Conditional** da seção B; o "Mão na massa" #4
e o "Quebre de propósito" #1 desta mesma aula já o classificam assim. O que o paper adiciona é a subdivisão em três, e ela é o assunto da próxima parte:

| Subtipo               | Como termina, segundo o paper                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Iterative**         | _"typically involving a fixed number of iterations for retrieval"_; o exemplo é o ITER-RETGEN, e a terminação _"is determined by a predefined number of iterations"_                   |
| **Recursive**         | dependência clara do passo anterior, aprofundamento progressivo, estrutura de árvore, e _"a clear termination mechanism as an exit condition"_ — com profundidade máxima |
| **Adaptive (active)** | o sistema _"can actively determine the timing of retrieval and decide when to conclude the entire process"_                                                              |

O exemplo de recursivo é o ToC (Tree of Clarifications), em que cada recursão usa a consulta gerada no passo anterior e _"the exploration of the tree concludes upon reaching the maximum number of valid nodes or the maximum depth"_.

---

## Parte 4 — O freio tem nome, e o repositório não o apertou

Aqui esta aula fecha uma conta aberta na Aula 21.

O Self-RAG de `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py` tem três ciclos simples, e nenhum deles tem limite de iteração: a aresta `"not supported"` volta ao nó `generate` (`:359`) e a aresta `"not useful"` volta a `transform_query` (`:361`). A Aula 21 apontou isso como ausência.

O paper mostra que não é uma ausência acidental — é a omissão de um parâmetro que o padrão canônico **especifica**:

- no laço **iterativo**, há um número máximo de iterações;
- no laço **recursivo**, há profundidade máxima e mecanismo explícito de saída;
- e o **scheduling module** existe justamente para _"ensuring that the system makes informed decisions on when to cease generation or initiate a new retrieval loop"_.

Cessar a geração é responsabilidade nomeada de um componente nomeado, e o nome dele é `scheduling module`, o submódulo 2 da seção IV.F, entre o `Routing` (1) e o `Fusion` (3). Este é o nível do meio da taxonomia, o dos submódulos, e é nele que o diagnóstico fica acionável: dizer "a orquestração falhou" ainda é vago, dizer "o escalonamento não parou" não é. Os operadores dele o paper batiza um por um: `Rule judge`, `LLM judge` e `Knowledge-guide scheduling`.

Isso **reposiciona** o grader do repositório em vez de o deixar de fora: ele **é** um `LLM judge`, no primeiro dos dois modos que o paper descreve, aquele que _"leverages LLM's in-context learning capability, and make judgments through prompt engineering"_. O repositório tem escalonador. O que ele não tem é o **limite** — e o limite não é peça, é argumento: os algoritmos 5, 6 e 7 o exigem na entrada (`maximum iterative times T` no iterativo e no ativo, `maximum recursive depth Kmax` no recursivo), e nenhum grafo do repositório declara nenhum dos dois.

O paper também descreve **como** esse juízo pode ser tomado. Um dos modos é o **rule judge**: o sistema avalia a qualidade da resposta por pontuação e a decisão de seguir ou parar depende de os escores passarem de limiares predefinidos, _"often related to the confidence levels of individual tokens"_. A formulação que ele dá aceita a resposta tentativa apenas se **todos** os tokens tiverem probabilidade acima de um limiar; caso contrário, regenera com o contexto recuperado.

Compare com o que a Aula 21 leu no código: um grader binário `yes`/`no` produzido por outro LLM. As duas coisas são juízes, e são caras de formas diferentes — probabilidade de token é grátis e exige acesso aos logits; um grader LLM funciona com qualquer API e custa uma chamada por juízo.

### E o paper confirma a distinção que a Aula 21 fez

Sobre o retrieval adaptativo, o paper separa duas famílias:

- **Prompt-base**, cujo exemplo é o FLARE: gera uma sentença provisória, verifica se há tokens de baixa probabilidade e, se houver, volta à recuperação — o critério vindo do prompt;
- **Tuning-base**, cujo exemplo é o Self-RAG: _"First, it prompt GPT-4 to obtain a suitable instruct fine-tuning dataset to fine-tune the deployed open-source LLM. This allows the model to output four specific tokens during generation, which are used to control the RAG process."_

A Aula 21 afirmou que há dois Self-RAG — o do paper, que **treina** o modelo a emitir tokens de reflexão, e o do repositório, que **emula** os juízos com graders externos. Um segundo paper, independente, descreve o Self-RAG exatamente assim. A distinção não era leitura minha; é como a literatura o classifica.

Nota de vocabulário para não confundir: o repositório do curso tem um arquivo chamado `02-LangChain-AdaptiveRAG.py` em `10-AdvanceRAG/04-AgenticRAG/`, que é assunto da Aula 26. "Adaptive" ali e "adaptive (active) retrieval" aqui **não** são a mesma coisa. Adaptive ali é decidir **onde** buscar: um roteador de fonte governa as arestas que saem do `START` (`:188-192`). Adaptive aqui é decidir **quando** recuperar, e os exemplos do paper para isso são o FLARE e o Self-RAG treinado. Mesma palavra, dois padrões: o **roteador** daquele arquivo é o `conditional` da seção B. O arquivo inteiro não é só isso, e a Aula 26 mede: além do roteador no `START`, ele tem arestas de retorno (`:201` e `:208`), então compõe condicional **com** laço. O nome não decidia nada, e foi por isso que o arquivo foi aberto.

---

## Parte 5 — Como usar a taxonomia amanhã

Julgamento de engenharia, explícito. Três usos que valem mais que a leitura do paper:

**1. Como ferramenta de diagnóstico.** Quando o sistema responde mal, a pergunta deixa de ser "o que eu ajusto?" e passa a ser "qual módulo?". A ordem da persona deste curso — ingestão, recuperação, geração — é uma travessia dos módulos do paper, e o quarto candidato, que só existe depois desta aula, é a orquestração: **o fluxo escolheu o caminho errado.** Antes desta aula, essa hipótese não tinha nome.

**2. Como fronteira de refatoração.** Se `rerank`, `compress` e `route` são operadores, eles têm assinatura estável e trocam de implementação sem tocar no resto. A Aula 24 mostrou o caso bem resolvido: o híbrido escrito à mão funde recuperação densa, esparsa e reranking numa classe só, mas recebe o reranker de fora e o trata como opcional, então desligá-lo é passar `reranker=None`. O `try/except` daquele arquivo é outra coisa, e a Aula 24 registra que ler o código não decide se ele chega a disparar.

**3. Como checklist de padrão.** Antes de construir, escolha o padrão: linear, condicional, ramificado ou com laço. Se for laço, você acabou de herdar três obrigações: limite de iteração, mudança de estado entre voltas e comportamento definido quando o limite estoura. Nenhuma das **três** implementações cíclicas do repositório tem as três: o Self-RAG da Aula 21, e os dois de `10-AdvanceRAG/04-AgenticRAG/` que a Aula 26 abre.

E o custo de tudo isso, para não vender arquitetura como grátis: cada módulo adicional é uma etapa a mais no caminho da consulta, muitas vezes uma chamada de modelo, uma dependência a mais para versionar e um lugar a mais para o erro nascer. O paper diz isso ao listar manutenibilidade entre os novos desafios. Modularizar não reduz a complexidade — organiza-a, e cobra em latência e em superfície de manutenção.

---

## Mão na massa

Segundo módulo do curso sem nada para executar. O trabalho é de leitura, mapeamento e diagnóstico — e o produto é um artefato que serve ao seu sistema.

**1. Extraia o texto do paper.** O PDF cede texto com stdlib: descomprimir cada `stream` com `zlib`, coletar os literais entre parênteses, **descartando os que tiverem menos de ~85% de caracteres ASCII imprimíveis** — este PDF tem streams de fonte que produzem lixo sem esse filtro. Rode e compare com `pdftotext ModularRAG-2407.21059v1.pdf -`: você vai obter cerca de 19 mil literais e vai descobrir que este PDF quebra palavras **no meio** por kerning — `"Advanced RAG is a special case"` sai como `RA`, `G`, `is`, `a`, `special`, `case`. Sem uma etapa de rejunção que esta receita não tem, nenhuma citação longa desta aula é localizável por busca literal. As citações daqui foram conferidas com o `pdftotext`; a rota por `zlib` vale pelo que ensina sobre como um PDF guarda texto.

**2. Desenhe o seu sistema como grafo de operadores.** Um nó por operador, uma aresta por transição. Depois marque em qual dos seis módulos cada nó vive. Os nós que você não conseguir atribuir a um módulo são os candidatos a estarem fazendo duas coisas.

**3. Classifique o seu fluxo.** Linear, condicional, ramificado ou com laço? Se tiver laço, escreva onde estão o limite, a mudança de estado e a saída de emergência. Se algum dos três não existir, você tem o defeito da Aula 21 no seu código.

**4. Reescreva um exemplo do repositório na notação do paper.** Comece pelo mais fácil: o pipeline de `00-SimpleRAG` é o Naive RAG que o paper formaliza. Depois faça o CRAG da Aula 18 — cinco nós, uma aresta condicional, acíclico — e o Self-RAG da Aula 21 — quatro nós, duas condicionais, três ciclos simples (a mesma convenção da Parte 4 e da Aula 21; se você contar pontos de entrada em laço, são dois — o que não vale é trocar de convenção entre duas passagens). A diferença entre as duas notações é a diferença entre os dois sistemas.

**5. Localize os cinco eixos de divergência de rota.** O paper diz que rotas divergem em fonte, processo, configuração, modelo e prompt. Pegue o roteamento da Aula 14, que exercia só o eixo do prompt e declarava o da fonte sem consumi-lo, e escreva o que mudaria em cada um dos outros três eixos para o seu domínio.

**6. Ponha no laço o limite que os algoritmos do paper exigem.** No grafo do Self-RAG (`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py`), acrescente ao `GraphState` (`:171`) uma chave de contagem e um teto. **Cuidado com onde cada metade mora, porque errar isso falha calado:** `decide_to_generate` (`:271`) e `grade_generation_v_documents_and_question` (`:295`) são funções de **aresta condicional** e devolvem string de rota, então só podem **ler** o contador. O incremento tem de ir num **nó**, junto do `return` de `generate` (`:220`) e de `transform_query` (`:267`), que são os que devolvem dicionário de estado. Um contador posto na função de decisão nunca sai de zero. Feito o incremento no nó, as duas funções de decisão passam a ler o contador antes de escolher a rota, que é o limite que falta ao juízo que elas já exercem. Compare o seu resultado com a descrição do rule judge do paper: você usou limiar de escore, contagem de voltas, ou os dois?

**7. Meça o custo de cada módulo.** Instrumente o seu pipeline para contar chamadas de LLM e de embedding por consulta, agrupadas por módulo. A tabela resultante é o que transforma "modularizar custa" em número — e é o insumo que a decisão do item 3 precisava.

---

## Quebre de propósito

Sem código, os contrafactuais isolam peças do desenho.

**1. Colapse o padrão.** Tome o CRAG da Aula 18 e remova a aresta condicional de `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:441-448`: sempre gere, nunca corrija. Você rebaixou um fluxo condicional a linear, e o paper diz onde ele para: sobram `retrieve`, `grade_documents` e `generate`, e `grade_documents` **é** pós-recuperação, então o que resta é Advanced RAG, não Naive. Para chegar a Naive faltaria tirar a graduação também, porque _"if there are no pre-retrieval and post-retrieval modules, it follows the Naive RAG paradigm"_. O que se perde no primeiro corte é o caso em que a recuperação falhou; no segundo, saber que ela falhou. E a herança que explica o rebaixamento é a outra metade da cadeia: Naive RAG é caso especial de Advanced RAG.

**2. Tire o Judge do laço, e escolha com cuidado por onde.** No Self-RAG, faça `grade_generation_v_documents_and_question` (`:295`) devolver sempre `"useful"`: o `END` fica alcançável na primeira volta e o laço desaparece. Agora faça devolver sempre `"not supported"` e veja o oposto: a aresta `generate` para `generate` de `:359` dispara até a plataforma abortar. Não é laço infinito: o `recursion_limit` padrão do LangGraph é 25 super-steps, medido na Aula 21, e o que você recebe é `GraphRecursionError` em vez de resposta. Sem juízo, o laço não vira cadeia — vira uma das duas degenerações, e qual delas você pega é escolha sua, não propriedade do grafo.

**3. Ramifique sem agregar.** No branching pós-recuperação, gere uma resposta por chunk e **não** una: devolva a primeira. Você transformou uma técnica de diversidade num top-1 caro. A agregação não é o acabamento do padrão — é o padrão.

**4. Agregue ramos heterogêneos por score.** Use `WeightedRanker` em vez de RRF para unir ramos de modelos diferentes, cujos escores não estão na mesma escala. O paper diz por que RRF é preferível aí; a Aula 11 mostrou a mecânica. Veja um ramo dominar a lista por ter escores maiores, não melhores.

**5. Confunda operador com módulo.** Pegue o `EmbeddingBM25RerankerRetriever` da Aula 24 e apague o parâmetro `reranker` do construtor (`10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:93`), instanciando o `CohereRerank` dentro do `_retrieve`. Funciona igual. Agora troque de reranker sem editar o retriever, e você verá o que a injeção estava comprando.

**6. Modularize o que não precisa.** Pegue um caso de uso com pergunta local, corpus pequeno e resposta direta, e monte um fluxo com laço, roteamento e três graders. Some as chamadas por consulta e compare com o Naive RAG. Nem toda pergunta merece arquitetura — e o custo dessa escolha é medido, não intuído.

---

## Armadilhas de produção

**Modularizar sem necessidade.** A flexibilidade cobra em latência, custo e manutenção. O paper lista manutenibilidade entre os novos desafios; um fluxo com laço num caso que se resolve linearmente é dívida contratada sem contrapartida.

**Laço sem limite.** É a armadilha central da aula, e repare no que ela **não** é: o juízo o repositório tem, no `LLM judge` que a Parte 4 identificou. O que falta é o teto. Iterativo pede número máximo de iterações; recursivo pede profundidade máxima e condição de saída; adaptativo pede as duas coisas, critério de parada e o mesmo teto `T`, que o algoritmo 7 exige na entrada. Nos algoritmos do paper esse teto é parâmetro de entrada, não componente, e implementar o laço sem ele é implementar metade do padrão.

**Juízo sem custo calculado.** Grader por LLM custa uma chamada por juízo; limiar de probabilidade de token é grátis e exige acesso aos logits, o que a maioria das APIs comerciais não dá. A escolha entre os dois é de infraestrutura, não de qualidade.

**Rota que divirja apenas em prompt.** Contando como roteador só o que escolhe entre alternativas de conteúdo, prompt ou fonte, e não toda função de aresta condicional, o repositório tem quatro: **dois escolhem prompt** (o semântico da Aula 14 e o por LLM da Aula 19); o terceiro escolhe fonte e **não** a consome (`01-LogicalRouting.py`), e só o quarto, que é assunto da Aula 26, escolhe fonte e a consome. Quando a diferença real entre os casos é a **fonte** — um índice jurídico e um índice de suporte —, rotear prompt não resolve nada e dá a impressão de que resolveu.

**Fronteira de operador mal desenhada.** Se você não consegue substituir um componente sem editar outro, não tem operadores — tem uma função grande com nomes de operadores nos comentários.

**Taxonomia como enfeite.** Nomear os módulos não melhora o sistema. O valor aparece quando o nome encurta o diagnóstico: "a orquestração escolheu o caminho errado" é uma hipótese acionável; "o RAG está ruim" não é.

**Confiar na correspondência pelo nome.** Um arquivo chamado `AdaptiveRAG` pode ou não ser o `adaptive (active) retrieval` do paper. Este curso vem registrando, aula a aula, os casos em que o nome prometia o que o código não fazia, e a Aula 26 fecha o décimo quarto — a taxonomia não isenta ninguém de abrir o arquivo.

---

## Checkpoint

Responda sem consultar:

1. Qual a relação entre Naive, Advanced e Modular RAG, segundo o paper?
2. Que problema o Advanced RAG **não** resolve, conforme a legenda da figura 1?
3. Quais são os três níveis da taxonomia, e qual deles é a unidade que se substitui isoladamente?
4. Cite os seis módulos de topo. Qual deles não corresponde a nenhuma fase deste curso, e por quê?
5. O que é um operador, e o que se ganha ao tratar o sistema como grafo cujos nós são operadores?
6. Quais são os quatro padrões de fluxo? Dê uma instância de cada, vista neste curso.
7. Qual a diferença entre branching pré-recuperação e pós-recuperação?
8. Por que RRF é preferível a fusão por score ponderado quando os ramos vêm de modelos diferentes?
9. Quais são os três subtipos do padrão de laço, e como cada um termina?
10. Onde o paper coloca os juízes na taxonomia, e por que o Self-RAG do repositório tem um `LLM judge` e ainda assim pode não parar?
11. O que é um `rule judge`, e por que ele é mais barato e menos portátil que um grader por LLM?
12. Como o paper classifica o Self-RAG, e por que isso confirma o que a Aula 21 afirmou?

---

## Vocabulário

`Modular RAG` · `Naive RAG` · `Advanced RAG` · `module / sub-module / operator` · `RAG Flow` ·
`flow pattern` · `linear pattern` · `conditional pattern` · `branching pattern` · `loop pattern` ·
`iterative retrieval` · `recursive retrieval` · `adaptive (active) retrieval` · `scheduling module` ·
`judge module` · `rule judge` · `orchestration`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 24 — Contextual Retrieval](AULA-24-contextual-retrieval.md)
**Próxima:** [AULA 26 — Agentic RAG e Adaptive RAG com LangGraph](AULA-26-agentic-adaptive-rag.md)

> A taxonomia chegou tarde no curso de propósito: ela só significa algo depois de as peças existirem
> na cabeça de quem lê. A Aula 26 é o teste dela — `10-AdvanceRAG/04-AgenticRAG/` tem dois scripts e
> três diagramas, e um deles já é conhecido: `01-LangChain-AgenticRAG.py:18` importa `ToolNode` e
> `tools_condition` e nunca os usa, achado registrado desde a primeira auditoria deste curso. O padrão
> de fluxo que ali se declara e o que ali se executa são perguntas separadas.
