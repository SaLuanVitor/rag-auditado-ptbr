# AULA 15 — Small-to-big: janela deslizante, pai-filho e expansão de contexto

**Fase 5 — Otimização de índice** · Módulo do repo: `06-Indexing/01-FromSmallChunksToLargeContext/` (4 arquivos)

---

## Pergunta motivadora

A Aula 07 deixou uma dívida explícita. A tensão era:

| Objetivo           | Quer chunk… |
| ------------------ | ----------- |
| Embedding preciso  | **menor**   |
| Geração competente | **maior**   |

E a conclusão foi: com um único `chunk_size` você escolhe qual dos dois sacrificar.

Esta aula paga a dívida. A saída é simples de enunciar e muda a arquitetura:
**o que você indexa não precisa ser o que você entrega.**

---

## Modelo mental

### Desacoplar índice de entrega

```
INDEXAÇÃO          RECUPERAÇÃO           ENTREGA
chunk pequeno  →   casa com a query  →   contexto grande
(embedding                              (o que o LLM recebe)
 preciso)
```

O chunk pequeno serve à busca: um assunto só, vetor bem localizado. O contexto grande serve à
geração: o entorno que dá sentido ao trecho. Nenhum dos dois precisa ceder, porque **são objetos
diferentes**.

O nome da família — _small-to-big_ — descreve exatamente esse movimento: encontre pequeno,
entregue grande.

### Três formas de definir "o grande"

O módulo tem três estratégias, e a diferença entre elas é **como o contexto de entrega é
construído**:

| Estratégia                    | O grande é…                     | Definido           |
| ----------------------------- | ------------------------------- | ------------------ |
| **Janela deslizante**         | as N sentenças vizinhas         | na **indexação**   |
| **Pai-filho**                 | o chunk pai que contém o filho  | na **indexação**   |
| **Expansão para frente/trás** | os N nós adjacentes no docstore | na **recuperação** |

A terceira linha é a exceção à regra da Aula 01, e vale dizê-la em voz alta: otimização de índice
acontece na ingestão, antes de qualquer pergunta chegar. As três rodam parte do trabalho depois da
recuperação, como `node_postprocessors`, e não é isso que as separa. Nas duas primeiras o conteúdo
entregue já estava montado no índice; só na expansão para frente e para trás **o quanto entregar é
decidido com a pergunta na mão**. É por isso que a Aula 18 a encontra do outro lado do pipeline.

As duas primeiras decidem o contexto quando o documento entra; a terceira decide na hora da
consulta. Isso tem consequência prática: mudar o tamanho da janela ou o pai exige **reindexar**;
mudar quantos vizinhos expandir é ajuste de consulta.

---

## Parte 1 — Janela deslizante de sentenças

`01-NodeSentenceSlidingWindow.py` usa três peças que trabalham juntas (linhas 4, 7, 15, 34–35 e
50):

```python
from llama_index.core.node_parser import SentenceWindowNodeParser, SentenceSplitter
from llama_index.core.postprocessor import MetadataReplacementPostProcessor
...
Settings.text_splitter = SentenceSplitter(separator="\n", chunk_size=50, chunk_overlap=0)
...
node_parser = SentenceWindowNodeParser.from_defaults(
    window_size=3,
...
        MetadataReplacementPostProcessor(target_metadata_key="window")
```

O mecanismo, em três tempos:

1. **`SentenceWindowNodeParser`** divide o texto em sentenças. Cada nó tem **uma sentença** como
   conteúdo indexado, e guarda no metadado `window` a sentença mais `window_size=3` vizinhas **de cada
   lado** — até sete sentenças no total. O comentário do próprio arquivo, na linha imediatamente
   acima da chamada, diz literalmente _"keeps n sentences on each side of the target sentence"_.
2. A **busca** acontece sobre a sentença isolada — embedding preciso, um assunto só.
3. O **`MetadataReplacementPostProcessor`** com `target_metadata_key="window"` faz a troca: depois
   de recuperar, ele **substitui o conteúdo do nó pelo valor do metadado `window`**.

O passo 3 é onde o small-to-big acontece literalmente. O nó que foi recuperado por ser preciso é
reescrito, antes de ir ao LLM, com o texto que tem contexto.

Cuidado com a linha 15: o `SentenceSplitter(..., chunk_size=50, chunk_overlap=0)` **não** configura
o parser de janela. O `SentenceWindowNodeParser` da linha 34 não recebe `chunk_size` — a
granularidade dele vem do tokenizador de sentenças interno. A linha 15 alimenta os `base_nodes`
(`01-NodeSentenceSlidingWindow.py:42`) e o `base_query_engine`
(`01-NodeSentenceSlidingWindow.py:54`), que é o **baseline de comparação** que o script roda em
paralelo e imprime junto. São dois pipelines no mesmo arquivo, e confundi-los é, **julgamento**, o
erro mais fácil de cometer aqui.

O que a janela dispensa: onde ela é o mecanismo, cada nó carrega as vizinhas no
metadado, então não é preciso duplicar texto entre chunks — o papel que o `chunk_overlap` da
Aula 07 cumpria.

**Armadilha de leitura crítica no próprio script.** O `window_query_engine` roda com
`similarity_top_k=2` (`01-NodeSentenceSlidingWindow.py:48`) e o `base_query_engine` com
`similarity_top_k=6` (`01-NodeSentenceSlidingWindow.py:55`). São duas variáveis mudando ao mesmo
tempo — mecanismo **e** `k` —, então a comparação que o script imprime não é controlada. A Aula 22
encontra o mesmo problema pela metade em `09-Evaluation/04-LlamaIndexEvaluation.py`: lá o
`similarity_top_k` é igual nos dois motores, o que controla o **número** de itens recuperados mas não
o volume de texto, porque as unidades indexadas têm tamanhos muito diferentes. Iguale o `top_k` antes
de concluir qualquer coisa das duas saídas — e depois pergunte quanto texto cada lado entregou.

O módulo traz também `01-NodeSentenceSlidingWindow-EvalVersion.ipynb`, a mesma técnica com
avaliação acoplada — útil para medir se a janela está ajudando, e antecipando a Aula 22.

> ⚠️ Nota de leitura: se você procurar neste notebook o comentário do autor sobre 50, 100 e 250
> darem resultados diferentes, não está lá. Ele está em
> `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:18`. Registro porque confundir os dois
> foi um erro documentado deste curso, em
> [`avaliacao/GATE-RAG-SPECIALIST.md`](avaliacao/GATE-RAG-SPECIALIST.md).

---

## Parte 2 — Pai-filho: o parent-child de verdade

`02-ParentChildTextChunkRetrieval.py` é o arquivo que fecha a confusão que atravessou o curso.

**Dois splitters, dois tamanhos** (linhas 22–23 e 28–29):

```python
parent_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
...
child_splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,
```

**Duas divisões do mesmo documento** (linhas 34–35):

```python
parent_docs = parent_splitter.split_documents(documents)
child_docs = child_splitter.split_documents(documents)
```

> ⚠️ **As duas variáveis acima são código morto, e é bom saber disso antes de copiar o arquivo.**
> `grep -c` devolve **1** para `parent_docs` e **1** para `child_docs`: só a atribuição, nunca uma
> leitura. O que popula o `vectorstore` e o `docstore` é `retriever.add_documents(documents)` (linha
> 52), que **resplita `documents`** internamente com os splitters passados ao construtor (45-50) —
> não usa as listas das linhas 34-35. **O número também muda**, e não só o entendimento: a linha 35
> corta o documento inteiro em 15 filhos, e o que o retriever indexa são **16**, porque ele corta
> cada **pai**, e as fronteiras de 1000 caracteres não coincidem com as do documento. Medido com os
> `separators` customizados do arquivo (linhas 25 e 31), que são o que faz a conta fechar.

**E a arquitetura de armazenamento** (linhas 37–38):

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore
```

O `ParentDocumentRetriever` orquestra dois armazenamentos distintos:

| Armazenamento                  | Guarda                                    | Para que             |
| ------------------------------ | ----------------------------------------- | -------------------- |
| **vetorstore** (Chroma)        | os filhos de 200 caracteres, embutidos    | busca precisa        |
| **docstore** (`InMemoryStore`) | os pais de 1000 caracteres, sem embedding | entrega com contexto |

Quando uma query chega, o retriever busca nos filhos, descobre a qual pai cada filho pertence, e
**devolve os pais** — deduplicados, porque vários filhos podem apontar para o mesmo pai.

### A confusão que esta aula desfaz

As Aulas 04 e 05 mostraram arquivos chamados `Parent-Child` em `01-DataLoading/`, e as duas
avisaram: **aquilo não era isto.** Agora dá para enunciar a diferença com precisão:

|                  | `01-DataLoading/.../09-Parent-Child-*.py`        | `06-Indexing/.../02-ParentChildTextChunkRetrieval.py` |
| ---------------- | ------------------------------------------------ | ----------------------------------------------------- |
| O que faz        | agrupa elementos do Unstructured por `parent_id` | indexa filhos, recupera pais                          |
| Tem embedding?   | **não**                                          | sim                                                   |
| Tem índice?      | **não**                                          | sim (Chroma)                                          |
| Tem recuperação? | **não**                                          | sim                                                   |
| O que é          | reconstrução de **hierarquia documental**        | **estratégia de indexação**                           |

Os dois se chamam parent-child e são coisas diferentes: o primeiro produz a informação estrutural
que _poderia_ alimentar o segundo. Confundi-los foi um dos erros registrados nas avaliações deste
curso — e é o tipo de erro que o nome do arquivo convida a cometer.

### Janela contra pai-filho

Julgamento: a escolha depende de **como o contexto relevante se distribui** no seu corpus.

- **Janela** funciona bem em prosa corrida, onde o que dá sentido à sentença são as sentenças
  adjacentes. Contexto simétrico e local.
- **Pai-filho** funciona bem quando existe uma **unidade natural de contenção** — cláusula dentro
  de artigo, parágrafo dentro de seção, função dentro de arquivo. O pai tem uma fronteira que
  significa algo.

Em texto sem estrutura, o pai-filho de 1000 caracteres é um recorte arbitrário — a janela é mais
honesta. Em documento estruturado, a janela pode cruzar fronteiras que importam.

---

## Parte 3 — Expansão para frente e para trás

`03-ForwardBackwardContextExpansion.py` resolve o mesmo problema **na recuperação**, não na
indexação (linhas 4, 40 e 48).

⚠️ **Antes do mecanismo, um fato que muda o que você vai ver ao rodar: o script não expande nada.**
A linha 16 põe `Settings.node_parser = SentenceSplitter()`, cujo padrão é `chunk_size=1024`
**tokens**, e o `game_story` tem 731. O documento vira **um** nó, e medido nos pins do curso as
`relationships` dele trazem só `SOURCE`: não há `NEXT` nem `PREVIOUS` para onde ir. Os três motores
das linhas 32, 37 e 45 devolvem o mesmo nó único, e o `Auto` ainda paga a chamada de LLM para
decidir uma expansão impossível. Para ver a técnica funcionar, troque a linha 16 por
`SentenceSplitter(chunk_size=200, chunk_overlap=0)`: o corpus passa a **4** nós, e aí a expansão
move contexto. Leia o resto desta parte com isso em mente.

```python
from llama_index.core.postprocessor import PrevNextNodePostprocessor, AutoPrevNextNodePostprocessor
...
        PrevNextNodePostprocessor(docstore=docstore, num_nodes=2)
...
        AutoPrevNextNodePostprocessor(
```

Dois pós-processadores, e a diferença entre eles é quem decide:

- **`PrevNextNodePostprocessor(docstore=docstore, num_nodes=2)`** — expansão **fixa e, como está
  escrita, só para frente**. Determinístico, barato, previsível. A classe tem
  `mode: str = Field(default="next")`, e o `_postprocess_nodes` chama `get_forward_nodes` nesse
  modo; `get_backward_nodes` só entra com `mode="previous"` ou `mode="both"`, que a chamada do
  script **não passa**. Com o `chunk_size` reduzido a 200, como a Parte 3 explica, isso está
  **medido**: a partir do nó 3, `mode="next"` devolve `[3]`, e `mode="previous"` e `mode="both"`
  devolvem `[1, 2, 3]`. Ou seja, ela puxa para frente e ali não há para onde ir. Com o
  `chunk_size` padrão ela puxa **zero**, e é por isso que o efeito só aparece depois da troca.
  **E o próprio script espera o contrário:** duas das três perguntas de teste estão anotadas
  `# Should look backward` (linhas 59-60). A incoerência é do repositório: o script pede
  comportamento para trás e a chamada não o habilita.
- **`AutoPrevNextNodePostprocessor`** — expansão **decidida por LLM**: o modelo avalia se vale
  expandir e em qual direção. Adaptativo, e custa uma chamada de LLM **por nó recuperado**, porque o
  `_postprocess_nodes` tem um laço `for node in nodes` com a chamada dentro. No script isso dá uma
  por consulta só porque `similarity_top_k=1` (linha 46); com `k=6` seriam **pelo menos** seis, já
  que o que roda é um `response_synthesizer` em modo `COMPACT`, que faz uma chamada por nó enquanto
  o nó couber num prompt e mais de uma quando não couber.

Note o `docstore=docstore`, e note também o que ele **não** é. A ordem em si mora nas
`relationships` de cada nó, nos campos `PREVIOUS` e `NEXT` que o parser grava porque
`include_prev_next_rel` vem `True` por padrão; o docstore é o que permite **buscar o vizinho pelo
id**. São as duas coisas: com o docstore cheio e `include_prev_next_rel=False`, medido, a expansão
devolve o nó sozinho. O que o índice vetorial não sabe é qualquer uma das duas: ele só conhece
posições no espaço de embedding.

A vantagem desta abordagem sobre as duas anteriores: **é ajustável sem reindexar.** Mudar
`num_nodes` de 2 para 4 é mudar um parâmetro de consulta. Trocar `window_size` ou o `chunk_size`
do pai exige reconstruir o índice inteiro.

O `Auto` é o caso mais caro dos três, e o que exige decisão: expandir só quando necessário economiza
tokens de contexto (e ajuda com o _lost in the middle_ da Aula 01), mas troca uma decisão
determinística por uma probabilística no caminho da consulta. Julgamento: eu começaria com o fixo,
mediria, e só iria para o `Auto` se o desperdício de contexto fosse mensurável.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/06-Indexing/01-FromSmallChunksToLargeContext
python 01-NodeSentenceSlidingWindow.py
```

O exercício que faz a aula valer: **imprima o nó recuperado antes e depois** do
`MetadataReplacementPostProcessor`. Antes, uma sentença; depois, a sentença com até três vizinhas de
cada lado. Ver a substituição acontecer é o que torna o small-to-big concreto.

```powershell
python 02-ParentChildTextChunkRetrieval.py
```

Conte quantos filhos e quantos pais o retriever guardou de fato: `vectorstore._collection.count()`
para os filhos, `len(list(store.yield_keys()))` para os pais. (Não conte `parent_docs` e
`child_docs` de `02-ParentChildTextChunkRetrieval.py:34-35`: são código morto, como a ressalva acima
explica.) **A razão medida é 8**, dezesseis filhos para dois pais, e não os 5 que `1000/200` sugere.
A causa **não** são os `chunk_overlap`: zerando os dois, a razão só cai para 7,0. É que o filho
nominal de 200 sai com **126 caracteres em média** (mediana 123, máximo 194), porque a lista
`separators` das linhas 25 e 31 corta em vírgula e em espaço, e a fusão recursiva para antes de
encher o chunk. **`chunk_size` é teto, não tamanho**, e essa é a lição que o número esconde. Depois faça
uma query e observe: quantos filhos casaram, e quantos pais distintos voltaram? A diferença é a
deduplicação em ação.

```powershell
python 03-ForwardBackwardContextExpansion.py
```

Reduza antes o `chunk_size` da linha 16 para 200, como a Parte 3 explica: sem isso o corpus é um nó
só e as três configurações devolvem a mesma coisa. Feito isso, compare o contexto entregue com
`num_nodes=2` contra `num_nodes=0` (sem expansão), e rode a versão `Auto` na mesma query para ver
se o LLM decide expandir.

---

## Quebre de propósito

**1. Tente zerar a janela — e leia o erro.** No `01`, ponha `window_size=0`. **Não funciona, e é
isso que se aprende:** o campo é declarado
`window_size: int = Field(default=DEFAULT_WINDOW_SIZE, ..., gt=0)`, então o Pydantic levanta
`ValidationError` na construção do parser, antes de indexar ou recuperar qualquer coisa. Medido
nos pins do curso: a mensagem é `Input should be greater than 0`, e `window_size=1` constrói. A
biblioteca se recusa a montar uma janela vazia. Para de fato ver a degradação, use o mínimo
permitido. Com janela mínima você se aproxima do chunking de sentença puro — o
extremo "pequeno" da Aula 07, com embedding ótimo e contexto insuficiente. Faça uma pergunta que
exija o entorno e veja a resposta ficar incompleta.

**2. Iguale pai e filho.** No `02`, ponha `chunk_size=1000` nos dois splitters. Você desmontou o
small-to-big: agora indexa e entrega o mesmo objeto, e está de volta à tensão da Aula 07.

**3. Exagere o pai — e primeiro dê texto a ele.** O corpus embutido no `02` tem 1.745 caracteres de
texto, 1.748 com as quebras de linha das pontas, então com `chunk_size=8000` o divisor devolve
**um** pai, que é o documento inteiro: o
contexto entregue passa a ser o mesmo para toda pergunta, e nada fica "enorme". E o repositório não
resolve isso sozinho: o maior **corpus de texto corrido** de `99-EN/` tem 4.462 bytes (o
`README.md` de lá é maior, e os PDFs de `assets/shanxi-tourism/` são muito maiores, mas nenhum dos
dois é corpus de domínio deste módulo), então mesmo trocando o corpus pelo
maior arquivo disponível o pai de 8000 continua sendo um só. Duas saídas, e vale escolher
conscientemente. Se quiser manter as perguntas do script, troque o corpus por
`99-EN/black-myth-wukong/black_myth_wukong_wiki.txt` — mesmo domínio, duas vezes e meia mais texto — e
baixe o pai para algo que o corpus sustente, como 1500 contra 200 no filho. Se quiser o pai de 8000 de
verdade, traga um texto seu de uns 30 mil caracteres, e aí troque também as perguntas das linhas
74-77. O
contexto entregue fica enorme; observe se a resposta melhora ou piora. Esse é o ponto onde
_lost in the middle_ começa a cobrar, e prepara a Aula 17 (reranking) e a 18 (compressão).

**4. Remova o docstore da expansão. Não funciona, e é isso que se aprende:** no `03`, apague o
`docstore=docstore` da linha 40 e o Pydantic levanta `ValidationError` (campo obrigatório ausente) na
**construção** do `PrevNextNodePostprocessor` — antes de indexar ou consultar qualquer coisa. A
biblioteca se recusa a montar um expansor sem meio de resolver o vizinho: o id que as
`relationships` guardam só vira nó através do docstore, e o índice vetorial não faz essa busca. Para ver a expansão desligada e comparar contexto
entregue, use `num_nodes=0`, que a classe aceita, ou o `base_engine` da linha 32, que já é o
baseline. Com o `chunk_size` padrão da linha 16 os três já são o mesmo baseline, o que torna a
comparação vazia: reduza o `chunk_size` antes.
Medido no `llama-index-core` 0.12.15.

**5. Compare os três na mesma pergunta, depois de unificar o corpus.** O `01` e o `02` usam o
`game_knowledge`; o `03` usa um `game_story` narrativo e disjunto, então nenhuma pergunta é
respondível pelos três como estão. Cole o `game_knowledge` no `03` e ponha `chunk_size=100` na
linha 16, **não 200**: o `game_knowledge` tem 334 tokens, e a 200 ele vira só dois nós, com que
`num_nodes=2` entrega o corpus inteiro em toda consulta e a comparação degenera outra vez. A 100
são quatro nós, e a expansão volta a escolher. Só então rode uma consulta pelas três estratégias e compare o contexto entregue. Não há
vencedor universal; o exercício é perceber **qual formato de contexto**
sua pergunta precisava.

---

## Armadilhas de produção

- **Docstore em memória.** `InMemoryStore` some ao reiniciar o processo. Em produção, os pais
  precisam de armazenamento persistente — e reconstruí-los a cada deploy custa tempo.
- **Pai grande demais.** Small-to-big resolve a tensão do embedding, e **não** resolve o _lost in
  the middle_. Entregar 8000 caracteres porque "cabe" degrada a geração.
- **Duplicação de armazenamento.** Você guarda o texto duas vezes: filhos no vetorstore, pais no
  docstore. Em acervo grande, isso é custo real de disco.
- **Janela cruzando fronteira.** Em documento estruturado, as três sentenças vizinhas podem estar
  na seção seguinte, trazendo contexto de outro assunto.
- **Mudar janela ou pai sem reindexar.** São parâmetros de indexação. Só a expansão para
  frente/trás é ajustável a quente.
- **`Auto` sem medir.** A expansão decidida por LLM adiciona latência e custo **por nó
  recuperado**, portanto proporcional ao `top_k`.
  Justifique com número.
- **Deduplicação esquecida.** Se vários filhos apontam para o mesmo pai e você não deduplica, o
  LLM recebe o mesmo texto repetido — desperdício de contexto e viés de repetição.

---

## Checkpoint

1. Qual dívida da Aula 07 esta aula paga, e qual a frase que resume a solução?
2. Quais as três formas de definir "o grande" no módulo? Qual delas é ajustável sem reindexar?
3. Descreva os três tempos do mecanismo de janela deslizante. Qual componente faz a substituição?
4. O `01-NodeSentenceSlidingWindow.py:15` põe `chunk_overlap=0`. Em qual dos dois pipelines do
   arquivo esse parâmetro age, e
   por que o `SentenceWindowNodeParser` não tem `chunk_overlap` nenhum?
5. No pai-filho, o que vai para o vetorstore e o que vai para o docstore? Por quê?
6. Meça a razão entre número de filhos e de pais no `02`. Por que o que os `chunk_size` sozinhos
   preveem está errado?
7. Explique a diferença entre o parent-child de `01-DataLoading/` e o de `06-Indexing/`.
8. Qual a diferença entre `PrevNextNodePostprocessor` e `AutoPrevNextNodePostprocessor`?
9. Por que a expansão precisa do `docstore` e não pode se apoiar só no índice vetorial?
10. Quando você preferiria janela deslizante a pai-filho, e vice-versa?
11. Small-to-big resolve o _lost in the middle_? Justifique.

---

## Vocabulário

`small-to-big` · `sliding window` · `parent-child` · `chunk size` · `chunk overlap` ·
`document` · `lost in the middle`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 14 — Query routing lógico e semântico](AULA-14-query-routing.md)
**Próxima:** [AULA 16 — Índice hierárquico e multi-representação](AULA-16-indice-hierarquico-multi-representacao.md)

> Esta aula desacoplou o que se indexa do que se entrega. A Aula 16 sobe um nível: em vez de dois
> tamanhos do mesmo texto, **dois níveis de índice** e **várias representações** do mesmo conteúdo.
