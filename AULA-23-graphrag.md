# AULA 23 — GraphRAG: quando o grafo ganha do vetor

**Fase 9 — Avançado** · Módulo do repo: `10-AdvanceRAG/01-GraphRAG/` — **dois arquivos**, e nenhum deles é código (`ls` no diretório: o PDF do paper e um `.env.example`)

---

## Pergunta motivadora

Pergunte ao seu RAG: **"quais são os temas principais deste acervo?"**

Nada do que as vinte e duas aulas anteriores construíram responde isso. O `k` é 3, ou 10, ou 50 — e
a resposta correta depende de **todo** o corpus. Não existe um trecho que contenha "os temas
principais"; o tema é uma propriedade do conjunto, e não está escrito em lugar nenhum para ser
recuperado.

O paper deste diretório nomeia a distinção com precisão. O corpo do abstract:

> _"RAG fails on global questions directed at an entire text corpus, such as 'What are the main
> themes in the dataset?', since this is inherently a query-focused summarization (QFS) task, rather
> than an explicit retrieval task."_

E aqui esta aula tem uma segunda pergunta, imposta pelo estado do repositório: **este diretório não
tem uma linha de código.** O que se faz com um capítulo assim, e o que se pode aprender dele com
honestidade, é parte do assunto.

---

## Modelo mental

### Pergunta local e pergunta global

|                    | Local                           | Global                                              |
| ------------------ | ------------------------------- | --------------------------------------------------- |
| Exemplo            | "qual a política de reembolso?" | "quais os temas recorrentes nas reclamações?"       |
| A resposta está…   | em um ou poucos trechos         | espalhada por todo o corpus, e em nenhum trecho     |
| Top-k resolve?     | sim, é para isso que existe     | não — aumentar `k` só traz mais amostra, não o todo |
| Natureza da tarefa | recuperação                     | **sumarização**                                     |

Isto reordena tudo o que veio antes: as Fases 1 a 8 otimizaram recuperação. Se a pergunta não é de
recuperação, otimizar recuperação não a alcança. Nenhum reranker, nenhum `chunk_size`, nenhum índice
ANN transforma amostragem em cobertura.

### Por que não basta "resumir tudo"

A alternativa óbvia é map-reduce sobre o corpus inteiro: dividir, resumir cada pedaço, resumir os
resumos. Funciona — o paper usa exatamente isso como um dos baselines, chamado `TS` (_text
summarization_) — e é caríssimo: **todo** o texto passa pelo modelo em **toda** consulta.

O grafo entra aqui, e a proposta é essa: fazer o trabalho caro **uma vez**, na indexação, produzindo
uma estrutura que responda perguntas globais lendo pouco.

### O grafo do GraphRAG não é um banco de grafos

Distinção que a palavra "grafo" esconde, e que este repositório permite ver lado a lado:

- **Consultar um grafo que já existe** — é a Aula 12, com Text2Cypher sobre Neo4j. O grafo foi
  modelado por alguém, com schema, e o LLM só escreve a consulta.
- **Construir o grafo a partir do texto, com o LLM** — é o GraphRAG. Não há schema prévio: o modelo
  lê os documentos e extrai entidades, relações e afirmações.

O primeiro tem código no repositório. O segundo não tem, e é o assunto desta aula.

### O grafo é um meio; a hierarquia é o mecanismo

O que responde a pergunta global não é o grafo em si — é a **partição hierárquica** dele em
comunidades, cada uma com um resumo pré-gerado. A pergunta global vira: leia os resumos do nível
adequado, produza respostas parciais, junte.

Se isso soa como a Aula 16, é porque é o mesmo movimento: agregar em níveis para não ler tudo. A
diferença é o critério do agrupamento — lá, proximidade no documento; aqui, conectividade entre
entidades.

---

## Parte 1 — O que este diretório contém, e o que isso significa

`ls` no diretório devolve dois arquivos:

| Arquivo                       | Tamanho             |
| ----------------------------- | ------------------- |
| `GraphRAG - 2404.16130v2.pdf` | 6.893.854 bytes     |
| `.env.example`                | 116 bytes, 2 linhas |

E o `.env.example` diz exatamente o que é (`10-AdvanceRAG/01-GraphRAG/.env.example:1-2`):

```python
# This folder has no Python scripts (reference PDF only), so no API keys or
# environment variables are required.
```

Duas leituras, e as duas importam.

**A favor do repositório: aqui a documentação está correta.** Depois de quatro módulos em que a
frase _"Every script here loads this file via load_dotenv()"_ era falsa, este `.env.example` declara
com precisão que não há script. E o `10-AdvanceRAG/.env.example:5-13` lista as chaves como usadas
"across 02-ContextRetrieval, 04-AgenticRAG, 05-MultiModalRAG" — omitindo o `01` e o `03`
corretamente.

**Contra: o livro anuncia o paradigma como coberto.** O `README.md` na raiz do clone da Packt — não
o deste curso —, na linha 29, lista entre os assuntos _"advanced paradigms including GraphRAG, Agentic RAG, and Modular RAG"_. Dos três,
dois não têm implementação: `01-GraphRAG/` e `03-ModularRAG/` contêm apenas o PDF do respectivo paper
(`find` nos dois diretórios devolve só `.env.example` e o `.pdf`). Isso vale como aviso de
planejamento para quem estuda por este repositório: a Aula 25 vai encontrar a mesma situação.

Confirmação de que a ausência é real e não um arquivo fora de lugar: `grep -rln` por `networkx`,
`graspologic`, `leiden` ou `from graphrag` em **todos** os `.py` do repositório não retorna nada. E o
`10-AdvanceRAG/requirements.txt` não lista nenhuma biblioteca de grafo — as dependências são
Weaviate, LangChain, LangGraph, Milvus, LlamaIndex e Tavily.

O único `.py` do repositório que fala com um banco de grafos é o par Text2Cypher da Aula 12 —
`05-PreRetrieval/01-QueryConstruction/Text2Cypher/03-Text2Cypher-SNOMED-v2-Succeeded.py:2` importa
`GraphDatabase` do driver `neo4j`. É outra técnica, como a seção anterior separou.

**Consequência para esta aula:** a fonte primária é o paper, que eu li. Onde eu falar do
comportamento do sistema, é o paper falando — não código deste repositório, porque não existe. Onde
for julgamento, está marcado.

---

## Parte 2 — O pipeline, como o paper o descreve

A figura 1 do paper resume a arquitetura, e a legenda nomeia as três peças do índice:

> _"This graph index spans nodes (e.g., entities), edges (e.g., relationships) and covariates (e.g.,
> claims) that have been detected, extracted, and summarized by LLM prompts tailored to the domain of
> the dataset."_

Três coisas a extrair de cada chunk, então: **entidades**, **relações** e **afirmações**. Nada disso
vem de um schema — vem de prompt, e o paper diz que o prompt é adaptado ao domínio do dataset.
Julgamento: essa é a primeira fonte de custo escondido, e a menos discutida. Um extrator de entidades
por prompt precisa ser ajustado ao domínio, e ajustá-lo exige olhar a saída.

### Do grafo para as comunidades

O agrupamento é o coração do método:

> _"In our pipeline, we use Leiden community detection (Traag et al., 2019) in a hierarchical manner,
> recursively detecting sub-communities within each detected community until reaching leaf communities
> that can no longer be partitioned."_

E a propriedade que faz o método funcionar:

> _"Each level of this hierarchy provides a community partition that covers the nodes of the graph in
> a mutually exclusive, collectively exhaustive way [...]"_

**Mutuamente exclusivo e coletivamente exaustivo.** Ler isso com atenção é entender o método: em cada
nível, todo nó pertence a exatamente uma comunidade. É o que permite ler os resumos de um nível
inteiro sem contar nada duas vezes e sem deixar nada de fora — a cobertura que o top-k não tem.

Detalhe de implementação que o paper dá e que vale para qualquer um que reimplemente: o Leiden foi
rodado com a biblioteca `graspologic`, e a indexação usou janela de 600 tokens.

### Como cada resumo de comunidade é montado

Para as comunidades folha, o paper descreve uma priorização explícita:

> _"for each community edge in decreasing order of combined source and target node degree (i.e.,
> overall prominence), add descriptions of the source node, target node, the edge itself, and related
> claims"_

Ou seja: as arestas entram em ordem decrescente de **grau somado das duas pontas**, até a janela
encher. Traduzindo a decisão de projeto: quando não cabe tudo, o que sobrevive é o que conecta as
entidades mais proeminentes. É uma escolha razoável e tem um custo nomeável — o detalhe periférico,
que às vezes é justamente a resposta, é o primeiro a cair. É o mesmo trade-off da compressão na Aula
18, aplicado na indexação em vez da consulta.

Comunidades de nível mais alto se resumem a partir dos resumos das de baixo. O resumo nunca lê o
corpus outra vez — lê o nível abaixo.

### Como a pergunta é respondida

A legenda da figura 1 descreve o caminho da consulta:

> _"The 'global answer' to a given query is produced using a final round of query-focused
> summarization over all community summaries reporting relevance to that query."_

Map-reduce, portanto, mas sobre **resumos de comunidade** em vez de sobre o texto: cada resumo produz
uma resposta parcial, e uma rodada final junta as parciais numa resposta global.

O paper também registra um uso que não é o dele, e que é útil saber que existe:

> _"a user may scan through community summaries at one level looking for general themes of interest,
> then read linked reports at a lower level that provide additional details for each subtopic"_

Isto é navegação humana da hierarquia — o índice serve para explorar, não só para responder.

---

## Parte 3 — Os números, e o que eles realmente dizem

Aqui a aula fica interessante, porque os resultados do paper são mais matizados do que a reputação do
método sugere.

### O ganho

Contra RAG vetorial convencional (a condição `SS`), medindo com juiz LLM:

| Critério                     | Podcast           | Notícias          |
| ---------------------------- | ----------------- | ----------------- |
| Comprehensiveness (win rate) | 72–83% (p < .001) | 72–80% (p < .001) |
| Diversity (win rate)         | 75–82% (p < .001) | 62–71% (p < .01)  |

São ganhos grandes e reportados com significância — o que, depois da Aula 22, é a diferença entre um
resultado e uma impressão.

### O que o vetor ganha

E o paper diz, na mesma seção:

> _"Our use of directness as a validity test confirmed that vector RAG produces the most direct
> responses across all comparisons."_

`directness` foi incluída como **teste de validade** — uma métrica em que se espera que o baseline
ganhe, para confirmar que o juiz não está apenas premiando texto longo. E o vetor ganha em todas as
comparações. Para pergunta local, direta, o RAG das vinte e duas aulas anteriores continua sendo a
ferramenta certa. GraphRAG não substitui; ele cobre outra classe de pergunta.

Em `empowerment` — quão bem a resposta ajuda o leitor a julgar por conta própria — o paper reporta
resultado **misto**, tanto do global contra vetorial quanto do GraphRAG contra sumarização de texto.

### O que o grafo adiciona sobre "ser global"

Este é o achado que muda a leitura, e está na descrição da figura 2:

> _"Conditions C1-C3 also showed slight improvements in answer comprehensiveness and diversity over
> TS (global text summarization without a graph index)."_

`TS` é map-reduce sobre o texto, sem grafo nenhum, e a legenda descreve a diferença como **slight**.
Mas a legenda não é o resultado — e a seção de resultados do mesmo paper é mais precisa:

> _"community summaries generally provided a small but consistent improvement in answer
> comprehensiveness and diversity, except for root-level summaries. Intermediate-level summaries in
> the Podcast dataset and low-level community summaries in the News dataset achieved
> comprehensiveness win rates of 57% (p < .001) and 64% (p < .001), respectively."_

Leia com cuidado, porque muda a conclusão em dois pontos:

1. O ganho do grafo sobre o map-reduce de texto é **pequeno, consistente e estatisticamente
   significativo** — não é ausência de ganho.
2. A exceção é o **nível raiz** — justamente o nível sobre o qual o argumento de escala se apoia.

Então: a maior parte do ganho **sobre o RAG vetorial** vem de a abordagem ser global; o índice de
grafo acrescenta um incremento menor por cima disso, nos níveis intermediário e folha. E o custo
desse ganho é o assunto seguinte.

### A tabela que justifica o método

A Table 2 do paper reporta, por condição, o número de unidades de contexto, os tokens
correspondentes e o percentual do máximo:

| Condição     | Podcast: unidades / tokens / % | Notícias: unidades / tokens / % |
| ------------ | ------------------------------ | ------------------------------- |
| `C0` (raiz)  | 34 / 26.657 / **2,6%**         | 55 / 39.770 / **2,3%**          |
| `C1`         | 367 / 225.756 / 22,2%          | 555 / 352.641 / 20,7%           |
| `C2`         | 969 / 565.720 / 55,8%          | 1.797 / 980.898 / 57,4%         |
| `C3` (folha) | 1.310 / 746.100 / 73,5%        | 2.142 / 1.140.266 / 66,8%       |
| `TS` (texto) | 1.669 / 1.014.611 / 100%       | 3.197 / 1.707.694 / 100%        |

E as três leituras que o paper tira dela:

> _"Root-level community summaries (C0) require dramatically fewer tokens per query (9x-43x)."_

> _"for low-level community summaries (C3), GraphRAG required 26-33% fewer context tokens, while for
> root-level community summaries (C0), it required over 97% fewer tokens"_

> _"For a modest drop in performance compared with other global methods, root-level GraphRAG offers a
> highly efficient method for the iterative question answering that characterizes sensemaking
> activity, while retaining advantages in comprehensiveness (72% win rate) and diversity"_

Junte com a seção anterior e a tese fica precisa — em três partes, porque a versão de uma frase
erra:

1. **Sobre o RAG vetorial**, a maior parte do ganho vem de a abordagem ser **global**.
2. **Sobre o map-reduce de texto**, o grafo acrescenta um incremento pequeno e significativo — nos
   níveis intermediário e folha, não no raiz.
3. **No nível raiz**, você **troca** esse incremento por 97% menos tokens: 2,6% do orçamento
   mantendo 72% de win rate contra o vetorial, com o que o paper chama de _"a modest drop in
   performance compared with other global methods"_.

É o item 3 que torna viável perguntar dez vezes seguidas — que é como sensemaking realmente
acontece. Dizer apenas "o grafo compra escala" é metade da leitura: a escala do `C0` custa a
qualidade que os níveis de baixo tinham conquistado.

### O custo que não aparece na tabela

A tabela mede tokens **por consulta**. A indexação é paga uma vez, e o paper informa o número:

> _"Graph indexing with a 600 token window (explained in Section A.2) took 281 minutes for the
> Podcast dataset"_

281 minutos, numa VM de 16 GB com `gpt-4-turbo`, para um dataset da ordem de 1 milhão de tokens.
Julgamento de engenharia, e é a decisão prática que esta aula existe para informar: GraphRAG faz
sentido quando o corpus é **estável** e as perguntas globais são **repetidas**. Um acervo que muda
todo dia paga a indexação todo dia, e aí a conta inverte.

---

## Parte 4 — Como o paper mede, e por que isso interessa depois da Aula 22

A Aula 22 terminou dizendo que o GraphRAG é difícil de avaliar porque o que ele faz melhor não é o
que a tríade mede. O paper confirma isso pelo caminho mais direto: ele **não** usa faithfulness,
context precision ou context recall. Usa quatro critérios próprios, e a razão está escrita:

> _"Given the lack of gold standard answers to our activity-based sensemaking questions, we adopt the
> head-to-head comparison approach using an LLM evaluator"_

Sem gabarito, não há acerto a medir — então a avaliação é **comparação pareada**, exatamente o método
que a Aula 22 apontou como mais estável e que o `PairwiseComparisonEvaluator` do LlamaIndex faria (o
import morto de `09-Evaluation/04-LlamaIndexEvaluation.py:19`).

Os quatro critérios, nas palavras do próprio prompt do juiz (Apêndice F):

| Critério            | Definição literal, abreviada                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `comprehensiveness` | _"How much detail does the answer provide to cover all the aspects and details of the question?"_                         |
| `diversity`         | _"How varied and rich is the answer in providing different perspectives and insights on the question?"_                   |
| `empowerment`       | _"How well does the answer help the reader understand and make informed judgements about the topic without being misled"_ |
| `directness`        | _"How specifically and clearly does the answer address the question?"_ — usado como teste de validade                     |

E o juiz devolve saída estruturada — o prompt pede um objeto JSON com `"winner"` e `"reasoning"`. É a
Aula 20 aparecendo na metodologia de um paper: o veredito precisa cair num campo para ser agregado em
tabela.

### As perguntas também são sintéticas — e o procedimento está descrito

O paper gera as perguntas com personas, e dá o algoritmo:

> _"1. Describe personas of K potential users of the dataset. 2. For each user, identify N tasks
> relevant to the user. 3. Specific to each user & task pair, generate M high-level questions that:
> Require understanding of the entire corpus. Do not require retrieval of specific low-level facts."_

Com `K = M = N = 5`, são **125 perguntas por dataset**, e cada comparação foi repetida cinco vezes e
mediada.

Compare com o que a Aula 22 encontrou no repositório: três exemplos no RAGAS, uma pergunta no TruLens,
trinta no LlamaIndex — e, no RAGAS, um vencedor declarado sem variância. Aqui: 125 perguntas, cinco
repetições, valores-p reportados. É o contraste que fecha a Fase 8 com um exemplo do que "medido"
significa.

E a circularidade da Aula 22 reaparece, agora assumida: o LLM inventa as personas, o LLM escreve as
perguntas, o LLM julga as respostas. O paper é explícito sobre o motivo — não há gabarito para
perguntas de sensemaking. Julgamento: é a melhor coisa disponível para essa classe de pergunta, e
continua medindo concordância com um juiz, não acerto. Um painel humano numa amostra é o que calibra
isso, e é o que a Aula 22 recomendou.

---

## Parte 5 — Reconhecer a pergunta global no seu próprio sistema

Sem código para rodar, o exercício útil é de diagnóstico. Três sinais de que a pergunta que chegou é
global e o seu RAG vai falhar nela em silêncio:

1. **A resposta correta não caberia em nenhum trecho.** "Quais os principais riscos citados nos
   contratos?" — nenhum contrato lista os principais riscos do conjunto.
2. **Aumentar `k` melhora um pouco e nunca resolve.** Se a qualidade sobe com `k` e continua
   incompleta em qualquer `k`, você está amostrando um todo.
3. **O usuário reclama de "faltou coisa", não de "está errado".** Falha de cobertura, não de
   precisão. E — ponto que liga com a Fase 8 — `faithfulness` alto é perfeitamente compatível com
   isso: o que veio está fielmente resumido, e o que faltou não aparece em nenhuma métrica que só
   olha o que veio.

O terceiro é o mais perigoso, e é a razão pela qual `context recall` exige gabarito: só ele mede
ausência.

Julgamento, para quem tem esse problema e não vai construir um grafo: antes de GraphRAG há degraus
mais baratos. Um resumo por documento, indexado junto do texto (a multi-representação da Aula 16), já
responde uma parte das perguntas globais. Uma taxonomia de temas mantida à mão, com contagem, responde
outra parte melhor que qualquer LLM. O grafo é a resposta quando as entidades e suas relações são o
que interessa, e quando o corpus justifica o custo de indexação.

---

## Mão na massa

Este é o primeiro módulo do curso sem nada para executar. O trabalho, então, é outro — e vale
igual, porque é o que você faria antes de adotar o método.

**1. Leia o paper com a tabela na mão.** Comece pela figura 1 e pela Table 2. São as duas peças que
sustentam a decisão de adotar ou não.

**2. Extraia o texto do PDF.** O PDF cede texto com stdlib: descomprimir cada `stream` com `zlib` e
coletar os literais entre parênteses. É como as citações desta aula foram conferidas, e serve para
buscar termos no paper sem depender de leitor gráfico.

**3. Estime o seu custo de indexação.** Pegue o número do paper — 281 minutos para ~1 milhão de
tokens com `gpt-4-turbo` — e escale para o seu corpus. Depois multiplique pela frequência com que ele
muda. Esse produto é a pergunta de viabilidade, e ele se responde antes de escrever código.

**4. Classifique cem perguntas reais.** Separe em local e global usando os três sinais da Parte 5.
A proporção decide se este capítulo é urgente ou curiosidade para você.

**5. Construa o baseline que o paper usa.** `TS` — map-reduce sobre o corpus — não precisa de grafo e
você já sabe fazer com o que a Fase 7 ensinou. Rode em uma pergunta global e meça tokens e tempo. É o
teto de custo contra o qual o GraphRAG se justifica.

**6. Use o degrau mais barato.** Com o código da Aula 16, indexe um resumo por documento junto do
texto e faça a mesma pergunta global. Compare com o `TS` do item anterior: quanto da resposta você
obteve por uma fração do custo?

**7. Avalie como o paper avalia.** Monte a comparação pareada da Parte 4 — duas respostas, um juiz,
JSON com `winner` e `reasoning`, cada par repetido algumas vezes. Você acabou de implementar o
`PairwiseComparisonEvaluator` que a Aula 22 encontrou morto no repositório.

---

## Quebre de propósito

Sem código, esta seção muda de natureza: em vez de mudanças que degradam a execução, são
contrafactuais sobre o desenho — cada um isolando uma peça do método para ver o que ela sustenta.

**1. Tire a hierarquia.** Suponha uma única partição, sem níveis. Você perde o `C0` — e com ele os
2,6% de tokens que tornam a consulta repetida viável. O que sobra é `TS` com passos extras.

**2. Tire a exaustividade.** Suponha que as comunidades se sobreponham ou não cubram todos os nós. A
resposta global passa a contar informação duas vezes ou a omitir parte do corpus, e **você não tem
como saber qual dos dois aconteceu**. A propriedade "mutuamente exclusivo e coletivamente exaustivo"
é o que separa cobertura de amostragem.

**3. Inverta a priorização.** Monte os resumos de comunidade folha em ordem **crescente** de grau —
periferia primeiro. O que entra na janela passa a ser o detalhe raro, e o que cai é a relação
central. Para "quais os temas principais", isso é o oposto do desejado; para "há algo anômalo aqui",
talvez não seja.

**4. Faça o extrator errar.** Se o prompt de extração confunde duas entidades homônimas — duas
pessoas com o mesmo nome, dois produtos com a mesma sigla —, elas viram um nó só. O grafo fica
plausível, as comunidades se formam, os resumos saem coerentes, e a resposta global mistura duas
coisas. É a alucinação da Aula 20 na camada de indexação: estrutura válida, conteúdo fundido.

**5. Julgue só por `directness`.** O paper mostra que o vetor ganha nesse critério em todas as
comparações. Escolhendo apenas essa métrica, você concluiria que GraphRAG piora o sistema — e a
conclusão seria correta para a classe de pergunta errada. Métrica escolhida é hipótese assumida.

---

## Armadilhas de produção

**Adotar o grafo pela pergunta errada.** Se as suas perguntas são locais, GraphRAG adiciona custo de
indexação e piora `directness`. O paper mede as duas coisas.

**Ignorar que o ganho de qualidade vem de "global", não de "grafo".** A diferença entre GraphRAG e
map-reduce sobre texto é pequena — significativa, mas pequena, e ausente no nível raiz. Se você só precisa
responder algumas perguntas globais por mês, `TS` pode bastar — e não exige extrator de entidades
nenhum.

**Indexação recorrente sobre corpus que muda.** 281 minutos pagos uma vez é infraestrutura; pagos
toda semana é um problema de arquitetura. Reindexação incremental é o assunto que o paper não
resolve.

**Extrator de entidades sem inspeção.** O paper diz que os prompts de extração são adaptados ao
domínio. Um extrator não inspecionado produz nós duplicados, entidades fundidas e relações
inventadas — e nada disso aparece na resposta final como erro, só como imprecisão difusa.

**Confiar na resposta global sem citação.** Uma resposta montada a partir de resumos de resumos está
a três saltos do texto original. Rastrear de volta até o documento exige carregar a procedência em
cada nível, e é trabalho que precisa ser desenhado desde o começo.

**Comparar com o baseline errado.** Contra RAG vetorial, o global ganha em comprehensiveness; contra
`TS`, ganha pouco em qualidade e muito em tokens. Reportar só a primeira comparação é o gênero de
conclusão que a Aula 22 ensinou a desconfiar.

**Tratar o benchmark sintético como o seu.** As 125 perguntas do paper vieram de personas geradas por
LLM sobre dois datasets específicos. O seu `k`, o seu domínio e as perguntas dos seus usuários não
estão nesse número.

---

## Checkpoint

Responda sem consultar:

1. Qual a diferença entre pergunta local e pergunta global, e por que aumentar `k` não resolve a
   segunda?
2. Por que o paper classifica a pergunta global como tarefa de sumarização, e não de recuperação?
3. Quais são as três coisas que o LLM extrai de cada chunk para montar o índice de grafo?
4. O que significa a partição ser "mutuamente exclusiva e coletivamente exaustiva", e o que se perde
   sem essa propriedade?
5. Em que ordem as arestas entram no resumo de uma comunidade folha, e o que isso privilegia?
6. Em que critério o RAG vetorial vence, e por que o paper incluiu esse critério?
7. Qual é o ganho de qualidade do GraphRAG **sobre map-reduce de texto**, e o que isso diz sobre o
   papel do grafo?
8. Quantos tokens por consulta o nível raiz usa, em percentual do máximo, e qual win rate ele
   mantém?
9. Quanto tempo levou a indexação do dataset Podcast, e como esse número entra numa decisão de
   adoção?
10. Por que o paper não usa faithfulness nem context recall?
11. Como as 125 perguntas foram geradas, e qual circularidade isso introduz?
12. O que existe neste diretório do repositório, e onde está o único código do repo que fala com um
    banco de grafos?

---

## Vocabulário

`GraphRAG` · `global question` · `local question` · `QFS (query-focused summarization)` ·
`sensemaking` · `graph index` · `entity extraction` · `claim / covariate` · `community detection` ·
`Leiden` · `community summary` · `map-reduce summarization` · `comprehensiveness` · `diversity` ·
`empowerment` · `directness` · `pairwise comparison`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 22 — Medir RAG: RAGAS, TruLens, DeepEval e a avaliação do LlamaIndex](AULA-22-avaliacao.md)
**Próxima:** [AULA 24 — Contextual Retrieval](AULA-24-contextual-retrieval.md)

> A Fase 9 começou por um capítulo sem código, e o método para lidar com isso ficou estabelecido: ler
> a fonte primária, separar o que o paper mede do que ele promete, e nomear o custo. A Aula 24 volta
> ao código — `10-AdvanceRAG/02-ContextRetrieval/` tem duas implementações, uma em LlamaIndex e outra
> em Milvus, e o par pede `diff` antes de qualquer frase comparativa.
