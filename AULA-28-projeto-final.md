# AULA 28 — Projeto final: um RAG seu, medido e defendido

**Encerramento** · Módulo do repo: todos. O repositório inteiro foi lido — de `00-SimpleRAG` ao `docker-compose.yml` de `10-AdvanceRAG/05-MultiModalRAG/`

---

> **Nota de estrutura.** As vinte e oito aulas anteriores (00 a 27) seguiram oito seções fixas, porque todas
> liam um módulo. Esta não lê nada: ela devolve o curso a você. As seções são outras, e a mudança é
> deliberada — anunciá-la é mais honesto que forçar o formato.

---

## Pergunta motivadora

Você vai construir um RAG. Alguém vai perguntar por que ele está bom.

As respostas ruins são conhecidas: "usei as melhores práticas", "o chunk_size é 1000 porque é o
padrão", "testei e pareceu bom". Nenhuma sobrevive a uma segunda pergunta.

Este curso teve um objetivo que só agora fica explícito: torná-lo capaz de responder **por que cada
peça do seu sistema está do jeito que está** — e de mostrar o número que sustenta a resposta.

Um RAG **defendido** é um que satisfaz três condições:

1. Cada decisão foi **tomada**, não herdada de um exemplo.
2. Existe um **conjunto de avaliação**, e o número dele foi reportado com a sua incerteza.
3. Você sabe **onde o sistema falha** e o que custaria consertar.

Nada disso exige técnica avançada. Um RAG ingênuo bem medido é defensável; um Self-RAG com três
graders e nenhuma métrica não é.

---

## Modelo mental

### O curso todo em uma frase por fase

| Fase                     | A pergunta que ela responde                                         |
| ------------------------ | ------------------------------------------------------------------- |
| 0 · Fundamentos          | o que é recuperação, e por que similaridade não é relevância        |
| 1 · Ingestão             | o dado entrou de forma utilizável?                                  |
| 2 · Representação        | em que unidades e em que espaço vetorial ele vive?                  |
| 3 · Vector DB            | onde ele mora, com qual índice e qual métrica?                      |
| 4 · Pré-recuperação      | a pergunta que chega é a pergunta que deve ser buscada?             |
| 5 · Otimização de índice | o que se indexa é o que se entrega?                                 |
| 6 · Pós-recuperação      | o que voltou está na ordem certa, no tamanho certo, e serve?        |
| 7 · Geração              | o que se diz ao modelo, como se cobra a forma, e quando parar?      |
| 8 · Avaliação            | como você sabe?                                                     |
| 9 · Avançado             | quando a pergunta não é de recuperação, e o que a literatura nomeia |

Guarde a ordem: ela é a ordem de **diagnóstico**. Quando o sistema responde mal, a investigação
desce essa tabela de cima para baixo, e o erro mais comum, **julgamento**, é começar pela Fase 7 porque o
prompt é o que está visível.

### Toda decisão tem custo, e o curso nomeou cada um

Vinte e sete das vinte e oito aulas terminaram numa seção de armadilhas de produção — a exceção é a
Aula 01, que traz "Quando _não_ usar RAG" no lugar. Elas não são
uma lista de erros dos outros: são o **preço** de cada escolha. `chunk_overlap` alto sai caro,
reranking soma latência, multi-representação multiplica o índice, laço sem contador é dívida, e assim
por diante.

O que faz um projeto ser de engenharia e não de configuração é que os custos foram **escolhidos**.

### O que não se decide sem medir

Há uma classe de perguntas que o curso se recusou a responder, sempre com a mesma justificativa:
`chunk_size`, `k`, modelo de embedding, índice, limiar de rerank, temperatura. Não existe valor
universal porque a resposta depende do seu corpus e do tipo de pergunta que ele recebe.

Isso não é evasão. É a razão de a Fase 8 existir, e é o que separa este projeto final de um tutorial.

---

## Parte 1 — As decisões, fase por fase

Este é o checklist do projeto. Cada linha é uma decisão que você **vai** tomar — se não tomar, o
framework toma por você, e é isso que a Aula 03 chamou de aceitar os padrões como se fossem decisões.

Para cada uma: a pergunta, a aula que a trata, e o custo que a escolha carrega.

### Fase 1 — Ingestão

| Decisão                                    | Custo nomeado                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Que formatos entram, e com qual carregador | metadado perdido na conversão; encoding; ordem e duplicata em diretório (Aula 04)           |
| PDF: extração simples, layout ou OCR       | `hi_res` como default em acervo grande sai caro; digitalizado sem OCR entra vazio (Aula 05) |
| Tabela: virar texto ou virar consulta SQL  | cabeçalho separado das linhas; usar RAG onde SQL resolve (Aula 06)                          |
| Que metadados sobrevivem à ingestão        | sem metadado de qualidade de extração, você não sabe o que foi mal lido (Aula 05)           |

A primeira pergunta do diagnóstico, e a menos glamourosa. A Aula 12 tem a advertência mais direta do
curso: se a pergunta é "quantos registros existem na categoria X", isso é `SELECT COUNT(*)`, não
recuperação.

### Fase 2 — Representação

| Decisão                                                          | Custo nomeado                                                                                       |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `chunk_size` e `chunk_overlap`                                   | overlap alto sai caro; rechunkar exige reindexar; chunking uniforme em acervo heterogêneo (Aula 07) |
| Estratégia de corte: caractere, recursivo, por código, semântico | truncamento silencioso quando o chunk excede o limite do embedder (Aula 07)                         |
| Modelo de embedding                                              | trocar de modelo sem reindexar; modelo no idioma errado; custo de embutir por API (Aula 08)         |
| Denso, esparso ou os dois                                        | esparso mal tokenizado; ColBERT e armazenamento (Aula 08)                                           |

Duas armadilhas se repetem nas Aulas 02, 07, 08 e 10 porque são, **julgamento**, as mais caras: **trocar de modelo
exige reindexar** e **modelo no idioma errado**. O segundo não é um caso isolado do repositório: `grep -rliE "bge[a-z-]*-zh"` nos `.py` devolve
**27 arquivos**, em sete módulos (`00-SimpleRAG` com 11, `06-Indexing` com 7, `05-PreRetrieval` com
5, e um cada em `02-DocChunking`, `04-VectorDB`, `07-PostRetrieval` e `10-AdvanceRAG`) — modelos com
sufixo `-zh` sobre corpus em inglês. É resíduo sistemático da origem, não descuido pontual.

### Fase 3 — Armazenamento e busca

| Decisão                                              | Custo nomeado                                                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Vector DB, ou nada disso                             | Milvus em protótipo é peso morto (Aula 09)                                                           |
| Schema: dimensão, escalares, `max_length`, `auto_id` | dimensão divergente do modelo; escalares esquecidos impedem filtro depois (Aula 09)                  |
| Índice ANN e seus parâmetros                         | ajustar `nprobe` sem olhar `nlist`; IVF_PQ por reflexo; trocar de índice exige reconstruir (Aula 10) |
| Métrica de distância                                 | métrica incompatível com o modelo — a armadilha citada nas Aulas 02 e 10                             |
| Híbrido e a fusão (RRF ou ponderada)                 | duas manutenções; latência somada; pesos escolhidos por intuição (Aula 11)                           |

A Aula 10 mostrou os cinco tipos de índice declarando `metric_type="L2"` e um deles normalizando os
vetores de consulta **apenas** quando a métrica é `COSINE` — o detalhe que liga a Fase 3 de volta à
Aula 02.

### Fase 4 — Pré-recuperação

| Decisão                                                   | Custo nomeado                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| A pergunta vai crua ao índice, ou passa por transformação | latência somada; reescrita que muda a intenção (Aula 13)                                |
| Reescrita, decomposição, HyDE ou clarificação             | HyDE em domínio desconhecido pelo modelo; HyDE em pergunta numérica (Aula 13)           |
| Roteamento: existe? por embedding ou por LLM?             | `argmax` sem limiar; **sem rota de fallback**; roteador sem conjunto de teste (Aula 14) |
| Consulta estruturada quando a fonte é banco               | executar SQL gerado sem validar; junção errada devolve número plausível (Aula 12)       |

Duas armadilhas da Aula 14 valem como requisitos: **logar a rota escolhida** e **ter fallback**. O
curso encontrou dois casos em que o roteador existia e o teste não o exercitava: na Aula 19, os casos
recuperados vinham do rótulo verdadeiro do laço em vez do que o roteador decidiu; na Aula 26, a única
pergunta que usaria a rota alternativa estava comentada.

### Fase 5 — Otimização de índice

| Decisão                                             | Custo nomeado                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Indexar e entregar a mesma unidade, ou small-to-big | duplicação de armazenamento; janela cruzando fronteira; pai grande demais (Aula 15)              |
| Hierarquia de resumos                               | cascata irrecuperável; hierarquia artificial; segundo nível decorativo (Aula 16)                 |
| Multi-representação                                 | multiplica o índice; resumo gerado por LLM sem revisão (Aula 16)                                 |
| Contextualizar o chunk antes de indexar             | o texto indexado deixa de ser o texto; documento inteiro por chunk é o custo dominante (Aula 24) |

A Aula 16 traz o item que mais falta em projetos reais: **medir contra o baseline plano**. Uma
hierarquia que não é comparada com o índice simples é complexidade sem evidência.

### Fase 6 — Pós-recuperação

| Decisão                             | Custo nomeado                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| Reranking: existe? com o quê?       | latência do estágio extra; reranquear o acervo inteiro; RankLLM não determinístico (Aula 17)    |
| Compressão de contexto              | comprimir antes de reranquear; comprimir contexto já curto; **perder a proveniência** (Aula 18) |
| Correção quando a recuperação falha | grader sem log; busca web sem limites (Aula 18)                                                 |

A ordem importa e o curso a fixou: **rerank primeiro, comprimir só se ainda estiver longo**. E a
lembrança que a Aula 17 registra: reranking não recupera — ele reordena o que já veio.

### Fase 7 — Geração

| Decisão                                     | Custo nomeado                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Modelo, e onde ele roda                     | o dado pode sair da sua rede? é a restrição que elimina mais opções (Aula 19)               |
| Decodificação: amostragem ou determinística | amostragem ligada durante avaliação torna a comparação ruidosa (Aula 19)                    |
| O prompt: fonte, abstenção, formato, tom    | **o template que nunca diz "não sei"** (Aula 19)                                            |
| Saída livre ou schema                       | campo obrigatório sem fonte é invenção contratada; JSON válido não é dado correto (Aula 20) |
| Laço de autocrítica: existe?                | laço sem contador é dívida; regerar sem mudar a entrada (Aula 21)                           |

Quatro trabalhos do prompt, e a Aula 19 mostrou o exemplo do repositório que cobre três: delimitar a
fonte, fixar o formato, fixar o tom. O quarto — **autorizar a abstenção** — é o que faltava, e é uma
frase: a Aula 19 registra que os exemplos do módulo cobrem "formato com cuidado e abstenção com
nada".

### Fase 8 — Avaliação

| Decisão                                                  | Custo nomeado                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------- |
| Origem do gabarito: humano, sintético ou perguntas reais | sintético tratado como verdade mede concordância com um LLM (Aula 22) |
| Que métricas, e em que estágio                           | confundir fidelidade com verdade (Aula 22)                            |
| Qual modelo julga, e ele está fixado?                    | juiz não fixado muda a sua série histórica sem aviso (Aula 22)        |
| Tamanho da amostra e variância                           | amostra pequena e veredito grande (Aula 22)                           |
| Limiar por métrica, para virar gate                      | um limiar sobre a média deixa passar falha localizada (Aula 22)       |

### Fase 9 — Quando a pergunta é outra

| Decisão                                                    | Custo nomeado                                                                                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A pergunta é local ou global?                              | adotar o grafo pela pergunta errada; o ganho sobre o RAG vetorial vem de ser global, e o grafo acrescenta um incremento menor — decida pelo nível de hierarquia que vai consultar (Aula 23) |
| Padrão de fluxo: linear, condicional, ramificado, com laço | modularizar sem necessidade; laço sem escalonador (Aula 25)                                                                                                                                 |
| Quem decide a ação: código ou modelo?                      | descrição de ferramenta é prompt; roteamento por substring (Aula 26)                                                                                                                        |
| Modalidades além de texto                                  | 12 GB que não somem; CPU para vetorizar mídia; espaço comum sem filtro de tipo (Aula 27)                                                                                                    |

---

## Parte 2 — O critério de aceitação

Um RAG **defendido** tem um artefato que a maioria dos projetos não tem: um conjunto de avaliação
versionado, com resultado datado. A Aula 22 deu o método; aqui está o mínimo aceitável.

### O conjunto

- **Vinte a cinquenta perguntas**, escritas por quem usa o sistema — não geradas por LLM.
- Para cada uma, a **resposta correta** anotada à mão e, sempre que possível, **qual trecho** a
  sustenta. Sem essa segunda parte, `context recall` não existe, e recall é a única métrica que mede
  o que o sistema **deixou** de trazer.
- Guardado em arquivo, **versionado com o código**, tratado como teste.

Duas proibições que a Aula 24 comprou com exemplo:

1. **A pergunta não pode ser um pedaço da resposta.** O exemplo do repositório usava os primeiros 50
   caracteres do chunk-alvo como consulta — nesse teste, qualquer recuperação acerta.
2. **Nunca sobrescreva o gabarito.** O mesmo exemplo baixava o conjunto oficial e o substituía por um
   fabricado, no mesmo nome de arquivo, com download condicionado à existência — o gabarito real
   ficava permanentemente inacessível.

### As métricas

O mínimo são três, uma por estágio, e a Aula 22 mostrou por que uma só não basta:

| Estágio     | Métrica                                                    | O que um número ruim acusa        |
| ----------- | ---------------------------------------------------------- | --------------------------------- |
| Recuperação | **`hit rate@k` e `MRR`** (comparação de ids, **sem juiz**) | ingestão ou recuperação           |
| Recuperação | `context recall` (exige gabarito)                          | ingestão ou recuperação           |
| Recuperação | `context precision` / relevância                           | `k` alto demais, ou chunking ruim |
| Geração     | `faithfulness`                                             | o modelo inventando               |
| Geração     | `answer relevancy`                                         | prompt desviando                  |

Fidelidade alta com recall baixo é, **julgamento**, o caso mais perigoso: o sistema está **coerente e incompleto**, e
só a métrica de recuperação enxerga isso.

**Comece pela primeira linha da tabela.** Se o seu gabarito anota qual trecho sustenta cada resposta,
`hit rate@k` e `MRR` saem de uma comparação de ids — determinísticas, reprodutíveis, sem custo de API
e sem a variância de um juiz. As três linhas seguintes exigem LLM e entram depois, para o que não se
reduz a acerto de id.

### O relatório

Três linhas, e elas são a defesa:

1. **O número, com a variância.** Média de N perguntas, e o desvio entre execuções. Sem isso você
   tem uma impressão com casas decimais — foi o que a Aula 22 encontrou num exemplo que declarava um
   vencedor com diferença de 0,0861 em **três** perguntas.
2. **A configuração que o produziu.** Modelo de embedding, `chunk_size`, `k`, índice, métrica,
   modelo gerador, decodificação fixada. Um número sem configuração não é reproduzível.
3. **A data e o juiz.** Se um LLM julgou, qual, e fixado em qual versão.

### O gate

Um limiar **por métrica**, nunca sobre a média. E, quando o gate reprova, a pergunta seguinte é a da
tabela acima: qual estágio o número acusa?

---

## Parte 3 — O hábito que vale mais que as técnicas

Este curso catalogou **quinze** casos, no mesmo repositório, em que o nome de um arquivo ou
diretório prometia o que o código não fazia. Quatorze estão na tabela abaixo; o décimo quinto é o
primeiro que o curso encontrou e está na Aula 00 — o par `01_02`/`01_03` de `00-SimpleRAG/`, cujo
nome promete trocar uma variável e cujo
`00-SimpleRAG/01_03_LlamaIndex_SwitchGenerationModel.py:9` troca duas. Não é um repositório ruim: é um
repositório normal, lido com cuidado.

| #   | O caso, em uma linha                                                                               |
| --- | -------------------------------------------------------------------------------------------------- |
| 1   | `99-Tool-PDF-Splitting.py` não faz chunking — extrai páginas de PDF                                |
| 2   | O par `-ch`/`-en` de BM25 difere em duas linhas de texto de exemplo, e nenhum configura analisador |
| 3   | `01-LangChain-AgenticRAG.py:18` importa `ToolNode` e `tools_condition` e nunca os usa              |
| 4   | `04-Pydantic-v1.py` não chama LLM e usa `model_dump()`, API do Pydantic v2                         |
| 5   | O `HybridRetrieval-v1-Minimal` é o **maior** dos três arquivos                                     |
| 6   | `01-ModelSelectionAndInvocation/` invoca, mas não seleciona: modelo fixo nos dois arquivos         |
| 7   | "Comprehensiveness and Diversity" não passa `n`, e o laço de candidatos imprime um só              |
| 8   | Um "pipeline RAG" cujo corpus de 779 bytes cabe num chunk de 1000                                  |
| 9   | `04-Pydantic-v1/v2` não são um par: compartilham duas linhas de import                             |
| 10  | `05-function-calling-v1/v2` usam **o mesmo** provedor; o que difere é a camada                     |
| 11  | `Self-RAG-FullImplementation.py` compila o grafo e **nunca o executa**                             |
| 12  | O TruLens apaga o histórico que o próprio comentário promete usar para comparar versões            |
| 13  | Um "Contextual Retrieval" cujo contexto são os 50 primeiros caracteres do próprio chunk            |
| 14  | Um "AdaptiveRAG" que é roteamento de fonte, não retrieval adaptativo                               |

O que os quatorze da tabela têm em comum — e o décimo quinto, da Aula 00 — é o método que os
encontrou. Cinco hábitos, e nenhum é difícil:

1. **`ls` antes de contar.** Nenhum número de arquivos afirmado sem listar o diretório.
2. **Abrir antes de citar.** Caminho não é evidência de conteúdo: um arquivo dentro de
   `03-BuildingMultiRepresentationIndex/` não faz multi-representação por estar ali.
3. **`diff` em todo par.** Nunca inferir a diferença entre dois arquivos pelo sufixo do nome. Foi
   assim que os casos 9 e 10 apareceram — e o 10 desmentiu o que o nome sugeria.
4. **`grep` de uso, não de declaração.** Import não é uso; função definida não é função chamada. Os
   casos 3, 11 e 13 são disso.
5. **Ler o que está comentado.** Metade dos casos acima envolve código desligado: execuções
   comentadas, URLs comentadas, blocos que o autor deixou para depois.

Julgamento, e é a recomendação com que este curso se despede: esses cinco hábitos valem mais que
qualquer técnica das Fases 5 a 9. Técnica você reencontra na documentação. **Ler código como quem
desconfia do nome** é o que permite usar a documentação sem ser enganado por ela.

E vale para o seu próprio código, que é onde o hábito realmente paga.

---

## Parte 4 — O freio, se o seu sistema tiver ciclo

Um requisito, não uma sugestão. O curso encontrou quatro grafos **com aresta condicional** no repositório (`grep -rl "StateGraph("`
devolve seis arquivos; os dois de fora são os `00-SimpleRAG/04_LangGraph_RAG*.py`, lineares e sem
condicional):

| Grafo                 | Ciclos                               | Contador      |
| --------------------- | ------------------------------------ | ------------- |
| CRAG (Aula 18)        | **nenhum** — acíclico por construção | não se aplica |
| Self-RAG (Aula 21)    | 3                                    | ausente       |
| AgenticRAG (Aula 26)  | 1                                    | ausente       |
| AdaptiveRAG (Aula 26) | 3                                    | ausente       |

> ⚠️ **Método de contagem, porque o número depende dele.** Aqui, "ciclos" são **ciclos simples**
> (caminhos fechados sem repetir nó). A Aula 21 chega ao **mesmo** número — três — e registra que
> contar por pontos de entrada em laço daria dois; mesma topologia, corte diferente. Self-RAG e AdaptiveRAG têm de fato as **mesmas
> arestas de retorno**: `transform_query → retrieve` (`Self-RAG-FullImplementation.py:354` e
> `02-LangChain-AdaptiveRAG.py:201`) e o condicional final que devolve para `generate` ou para
> `transform_query` (`:355-364` e `:205-209`). Se você contar por outro critério, conte igual nas
> quatro linhas antes de comparar.

Três com laço, nenhum com limite. E a Aula 25 mostrou, lendo o paper de Modular RAG, que o padrão
canônico **especifica** o freio nos três subtipos — iterativo com número máximo de iterações,
recursivo com profundidade máxima e condição de saída — e nomeia o componente responsável por decidir
quando cessar a geração.

Se o seu projeto tiver aresta que volta, ele precisa de três coisas:

1. **Um contador no estado**, com limite.
2. **Mudança de entrada entre as voltas.** Regerar com a mesma entrada e temperatura zero tende a
   produzir a mesma saída — e o mesmo veredito.
3. **Um comportamento definido quando o limite estoura.** Responder com ressalva, admitir falha ou
   escalar. A ausência de escolha não é travamento — é deixar a plataforma abortar por você: o
   `recursion_limit` padrão do LangGraph (25) devolve uma exceção onde deveria haver uma resposta.

E um cuidado extra, que a Aula 26 encontrou na forma dura: **guarde a pergunta original.** Um laço
que reescreve a reescrita se afasta da intenção; um laço que apaga o histórico não converge.

---

## Parte 5 — O roteiro

Sete etapas, cada uma com um entregável. A ordem é a do diagnóstico, e a Etapa 3 vem antes de
qualquer otimização de propósito.

### Etapa 1 — Escolha o corpus e as perguntas

**Entregável:** um diretório com os documentos e uma lista de 20 a 50 perguntas reais.

Comece pelas perguntas. Escreva-as antes de olhar o corpus, se possível com quem vai usar o sistema.
Depois classifique cada uma: **local** (respondida por um trecho) ou **global** (propriedade do
acervo, no sentido da Aula 23). Se a maioria for global, você tem um problema de sumarização, e a
Fase 9 é o começo do caminho — não o `chunk_size`.

### Etapa 2 — Anote o gabarito

**Entregável:** o conjunto de avaliação em arquivo versionado.

Para cada pergunta: a resposta correta e, quando der, o trecho que a sustenta. Este é o trabalho mais
chato do projeto e o que dá valor a todo o resto. Não terceirize para um LLM nesta etapa — depois,
para ampliar cobertura, é legítimo.

### Etapa 3 — Construa o baseline ingênuo

**Entregável:** um RAG de cinco linhas, e a primeira medição.

Carregue, divida, indexe, busque, gere. Sem reranking, sem reescrita, sem laço. Meça com as métricas
da Parte 2 e **anote o número com a configuração**.

Este número é o seu ponto de comparação para tudo o que vem depois. Sem ele, qualquer melhoria é
alegação — e a primeira armadilha da Aula 03 é literalmente "aceitar os padrões do
framework como se fossem decisões".

### Etapa 4 — Inspecione o que foi recuperado

**Entregável:** para cada pergunta que falhou, o diagnóstico do estágio.

Imprima os trechos recuperados **antes** de olhar a resposta. Classifique cada falha:

- o trecho certo **não estava** no índice → problema de ingestão (Fase 1)
- estava no índice e **não voltou** → problema de recuperação (Fases 2 a 5)
- voltou e a resposta o **ignorou ou contradisse** → problema de geração (Fase 7)

Essa classificação decide o que fazer na etapa seguinte. Mexer no prompt antes de fazê-la é o erro de
método que o curso repetiu como advertência da Aula 19 à 22.

### Etapa 5 — Uma mudança por vez, medida

**Entregável:** uma tabela com uma linha por experimento.

Escolha a mudança que ataca o estágio que a Etapa 4 acusou. Mude **uma** variável — o exemplo da
Aula 22 que fez isso certo mantinha `similarity_top_k=2` nos dois motores comparados. Meça com o
mesmo conjunto. Registre.

Se a mudança não melhorou, registre isso também. Um experimento negativo documentado vale mais que
uma configuração adotada por fé.

### Etapa 6 — Some o custo

**Entregável:** chamadas de LLM e de embedding por consulta, e o custo de indexação.

Conte por estágio. Reranking, reescrita, roteamento por LLM e graders somam — a Aula 21 tinha três
juízes — o de relevância roda **por documento** recuperado, os outros dois por geração —, e a Aula 26
encontrou uma função de decisão que gasta uma ou duas chamadas dentro de um lambda de aresta, onde
ninguém procura custo.

Do lado da indexação: contextualizar chunk manda o documento inteiro por chunk; o GraphRAG do paper
da Aula 23 levou 281 minutos para um corpus de ~1 milhão de tokens; o multimodal da Aula 27 pede 12
GB de memória permanentes.

### Etapa 7 — Escreva a defesa

**Entregável:** um documento de uma página.

Quatro seções:

1. **As decisões**, com uma linha de justificativa cada — usando o checklist da Parte 1.
2. **O número**, com variância, configuração, data e juiz.
3. **Onde falha**, com exemplos concretos das perguntas que erraram e o estágio responsável.
4. **O que não foi feito**, e por quê. Esta é a seção que distingue um projeto honesto: as técnicas
   que você considerou, mediu ou descartou, e o custo que não valeu.

---

## Rubrica de autoavaliação

Doze itens. Cada um vale um ponto, e todos são verificáveis por outra pessoa lendo o seu repositório.

| #   | Item                                                                             |
| --- | -------------------------------------------------------------------------------- |
| 1   | O conjunto de avaliação existe, está versionado e tem ≥ 20 perguntas reais       |
| 2   | O gabarito não foi fabricado a partir do texto-alvo                              |
| 3   | O baseline ingênuo foi medido antes de qualquer otimização                       |
| 4   | Há métrica de **recuperação**, não só de geração                                 |
| 5   | Os números vêm com variância e com a configuração que os produziu                |
| 6   | O juiz (se houver) está fixado em modelo e versão                                |
| 7   | Cada mudança adotada tem um experimento que a sustenta, com uma variável por vez |
| 8   | O prompt autoriza a abstenção, e isso foi testado com contexto irrelevante       |
| 9   | Se há ciclo, há contador, mudança de entrada e comportamento definido no limite  |
| 10  | Se há roteamento, há rota de fallback e log da rota escolhida                    |
| 11  | O custo por consulta e o de indexação estão contados                             |
| 12  | O documento de defesa tem a seção "o que não foi feito"                          |

**Nove ou mais** e o sistema é defensável. **Doze** e ele é melhor documentado que a maioria dos
exemplos que este curso leu — inclusive os do repositório em que ele foi construído.

---

## Onde continuar

Três direções, e nenhuma delas é "aprender mais técnicas":

**Meça o que você não mediu.** Os pontos que este curso declarou como não verificados — porque as
bibliotecas não estavam instaladas no ambiente em que ele foi escrito — são exercícios prontos, e
estão listados no `HANDOFF.md`. Rodar o `01-RAGAS.py` e comparar os seus números com os que o próprio
arquivo registra é meia hora de trabalho e ensina mais sobre variância que qualquer explicação.

**Leia o código dos frameworks que você usa.** O curso mostrou o que uma camada esconde: `bind_tools`
é um serializador de schema, e o JSON Schema de dezenove linhas existe embaixo dele. Quando a chamada
falhar, é ali que você vai depurar.

**Leia os papers que estão no repositório.** São quatro, e os quatro foram usados aqui: Self-RAG e RRR (na
Aula 21), GraphRAG (na 23) e Modular RAG (na 25). Eles cedem texto com uma dúzia de linhas de Python
e stdlib — a ferramenta que a Aula 21 improvisou está descrita no `HANDOFF.md`.

---

## Fecho

Vinte e nove aulas, onze módulos, um repositório lido inteiro.

O que fica não é uma configuração recomendada — o curso se recusou a dar uma, e a recusa era o
conteúdo. O que fica é isto: **cada peça de um RAG é uma decisão com custo, e a única defesa de uma
decisão é o número que a mediu.**

E o hábito, que é a parte transferível: abrir o arquivo, rodar o `diff`, grepar o uso, contar com
`ls`, ler o que está comentado. Foi assim que este curso encontrou quinze arquivos cujo nome
prometia mais do que o código entregava — e é assim que você vai evitar que o décimo sexto seja seu.

---

**Anterior:** [AULA 27 — Multimodal RAG com Weaviate](AULA-27-multimodal-rag.md)

> **Curso concluído.** O plano, o glossário com todos os termos e as duas ferramentas de verificação
> estão em [`README.md`](README.md), [`GLOSSARIO.md`](GLOSSARIO.md) e `ferramentas/`. O `HANDOFF.md`
> guarda os achados por módulo, os números extraídos dos papers e a lista do que ficou por verificar.
