# AULA 08 — Embeddings na prática, BM25 esparso e BGE-M3 híbrido

**Fase 2 — Representação** · Módulo do repo: `03-Embedding/` (8 arquivos: 6 scripts, mais o `.env.example` e o `requirements.txt`)

---

## Pergunta motivadora

Na Aula 02 você entendeu o que é um embedding. Agora: por que um módulo sobre embeddings
dedica **dois dos seis arquivos ao BM25**, que não é embedding e é de 1994?

Porque o capítulo não é sobre vetores densos — é sobre **representação de informação para
recuperação**, e há mais de uma família. A ordem dos arquivos conta a história: dois exemplos
densos, dois de BM25 esparso, um de BGE-M3 que emite as três, e um multimodal. É uma
progressão deliberada que termina na busca híbrida da Aula 11.

---

## Modelo mental

### Duas famílias, falhas disjuntas

|             | **Denso** (embedding)               | **Esparso** (BM25)                             |
| ----------- | ----------------------------------- | ---------------------------------------------- |
| Dimensões   | centenas a milhares (1024 no BGE-M3, 1536 no `text-embedding-3-small`), quase todas não-zero | uma por termo do vocabulário, quase todas zero |
| Captura     | semântica, sinônimo, paráfrase      | correspondência literal de termo               |
| Acerta em   | "rescindir" ≈ "cancelar"            | `SKU-88213-B`, `CFOP 5102`                     |
| Erra em     | identificador, jargão novo, negação | sinônimo, outra língua                         |
| Explicável? | não — só um número de cosseno       | sim — você vê qual termo casou                 |

A última linha é subestimada. Quando o denso traz um documento errado, você tem um cosseno e
nenhuma explicação. Quando o BM25 erra, você vê o termo que casou. Para depurar recuperação em
produção, isso vale bastante.

**As duas famílias não competem: falham em conjuntos largamente complementares de casos.** Não são
disjuntos, e o contraexemplo importa: um identificador digitado errado derruba os dois, porque o
BM25 perde o literal e o denso nunca soube o código. É essa complementaridade — e não
nostalgia — que sustenta a busca híbrida.

### Embedding não serve só para RAG

Os dois primeiros arquivos do módulo não fazem RAG nenhum. Fazem **recomendação** e
**clusterização**. É uma escolha didática que vale registrar: o mesmo mecanismo — texto vira
vetor, vetores se comparam — resolve problemas diferentes. Ver embedding fora do contexto de
RAG ajuda a entender que RAG é uma _aplicação_ da ideia, não a ideia.

---

## Os seis arquivos

| #   | Arquivo                                       | Representação                        | O que faz                      |
| --- | --------------------------------------------- | ------------------------------------ | ------------------------------ |
| 1   | `01-openai-embedding-recomendation-system.py` | densa (API)                          | recomendação por similaridade  |
| 2   | `02-jina-embeddings-v3-clustering.py`         | densa (API)                          | clusterização com KMeans       |
| 3   | `03-BM25.py`                                  | **esparsa, do zero**                 | a fórmula implementada à mão   |
| 4   | `03-LangChain-BM25.py`                        | esparsa (biblioteca)                 | BM25 contra denso, lado a lado |
| 5   | `04-BGE-M3.py`                                | **densa + esparsa + multi-vetorial** | as três de uma vez             |
| 6   | `05-MultimodalEmbedding.py`                   | densa multimodal                     | imagem e texto no mesmo espaço |

Note que os dois arquivos de BM25 compartilham o prefixo `03`, e que o nome do primeiro tem
`recomendation` com um `m` só. Erros de digitação do repositório, preservados aqui porque é
assim que você vai encontrá-los.

---

## Parte 1 — Denso na prática, fora do RAG

### Recomendação

`01-openai-embedding-recomendation-system.py` carrega duas fontes:

```python
df = pd.read_csv("../99-EN/journey-of-extinction-husun/user_reviews.csv")   # linha 9
with open("../99-EN/journey-of-extinction-husun/game_guide.json", "r") as f:  # linha 12
```

E define o embedder na linha 16:

```python
def get_embedding(text, model="text-embedding-3-small"):
```

O mecanismo é o da Aula 02, aplicado — mas leia com atenção **o que** ele embute: só as descrições
do `game_guide.json` (linha 31). O texto da avaliação **nunca é embutido**: `review_text` e `rating`
têm zero usos no arquivo, e o vetor do usuário é a **média das descrições dos jogos que ele
avaliou** (linha 41). Depois compara com `cosine_similarity` do scikit-learn (linha 50, com o
`[0,0]` para extrair o escalar da matriz 1×1). E a saída não recomenda jogos a um usuário: fixa um
jogo-alvo (linha 25) e ranqueia os usuários mais propensos a gostar dele (linhas 54-57) — e o corpus tem exatamente 5, então o `head()` devolve a lista inteira, sem seleção.

E aí está o defeito real do exemplo, que vale mais que o acerto: uma avaliação `rating=2` entra na
média exatamente como uma `rating=5`. O sinal usado é "quais jogos este usuário tocou", não "o que
ele achou".

O que isso ensina para RAG: **o "documento" é o que você de fato embute, não o que a variável se
chama.** `user_vectors` sugere preferência; o que está lá dentro é catálogo. No seu projeto o
"documento" pode ser um perfil, uma consulta anterior ou o histórico de uma sessão — desde que você
confira que é isso que chega ao modelo.

### Clusterização

`02-jina-embeddings-v3-clustering.py` usa a API da Jina por HTTP — `import requests` na linha 4,
e o modelo no payload da linha 22:

```python
    "model": "jina-embeddings-v3",
```

Depois agrupa com KMeans (linha 5 importa `sklearn.cluster.KMeans`; linha 41 instancia com
`n_clusters=3, random_state=42`), sobre o CSV que a **linha 17** carrega:
`../99-EN/journey-of-extinction-husun/jina_games.csv`.

Dois pontos que valem para RAG:

1. **O modelo é acessado por HTTP puro**, não por SDK. Útil de ver: embedding é uma chamada de
   API que devolve uma lista de floats, e trocar de provedor é trocar de endpoint.
2. **Clusterizar o corpus antes de indexar é diagnóstico barato.** Se os clusters não
   corresponderem a temas que você reconhece, seu modelo de embedding não está separando bem o
   seu domínio — sinal para trocar de modelo ou considerar fine-tuning, antes de descobrir isso
   via recall ruim.

O `random_state=42` fixa a semente: mesma execução, mesmo resultado. Reprodutibilidade em
experimento é o que permite comparar antes e depois.

---

## Parte 2 — BM25, da fórmula à biblioteca

### A fórmula, escrita à mão

**Julgamento:** `03-BM25.py` é o arquivo mais valioso do módulo e o mais fácil de pular. Ele implementa BM25
com **`Counter` e `math`, sem biblioteca de retrieval** (linhas 1–2). Os dois hiperparâmetros
canônicos estão explícitos:

```python
k1 = 1.5   # linha 10
b = 0.75   # linha 11
```

O IDF, na linha 18:

```python
idf = {word: math.log((N - df[word] + 0.5) / (df[word] + 0.5) + 1) for word in vocabulary}
```

E o score, dentro de `bm25_sparse_embedding(log)` (linha 22), na linha 29:

```python
score = idf[word] * (freq * (k1 + 1)) / (freq + k1 * (1 - b + b * log_len / avg_log_len))
```

Vale ler a fórmula por partes, porque cada pedaço é uma decisão de projeto:

- **`idf`** — termo raro no acervo pesa mais. Um termo presente em todos os documentos tem IDF
  próximo de zero e praticamente não discrimina. É o que faz "de", "a", "o" não atrapalharem.
- **`freq * (k1 + 1) / (freq + k1 * ...)`** — **saturação**. A quinta ocorrência de um termo
  acrescenta muito menos que a segunda. Sem isso, um documento que repete a palavra cem vezes
  venceria um documento que a usa três vezes de forma pertinente. `k1` controla a velocidade
  dessa saturação.
- **`(1 - b + b * log_len / avg_log_len)`** — **normalização por comprimento**. Documento longo
  naturalmente contém mais ocorrências de tudo; sem esse termo, o ranking favoreceria os longos.
  `b` controla quanto se normaliza: `b=0` desliga, `b=1` normaliza totalmente. `0.75` é o
  default clássico.

Um detalhe fácil de passar batido, na linha 23:

```python
tf = Counter(log.split(","))
```

A tokenização é por **vírgula**, não por espaço. É deliberado e cobra caro, como a seção "Quebre de propósito" vai medir: cada campo vira um termo, nenhum se repete, e isso zera a saturação. Faz sentido para o formato do exemplo — logs de
batalha em campos separados por vírgula — e é um lembrete útil: **BM25 depende inteiramente da
tokenização**, e ela é escolha sua. Tokenizar mal destrói a técnica, e é por isso que BM25 em
idiomas sem separação por espaço exige segmentação dedicada.

O nome da função também diz algo: `bm25_sparse_embedding`. O autor está enquadrando BM25 como
**produtor de embedding esparso** — um vetor com uma posição por termo, quase todo zero. É a
ponte conceitual que faz BM25 pertencer a este capítulo.

### O mesmo, com biblioteca, contra o denso

`03-LangChain-BM25.py` faz a comparação direta:

```python
from langchain_community.retrievers import BM25Retriever # pip install rank_bm25   # linha 8
bm25_retriever = BM25Retriever.from_texts(battle_logs)                             # linha 19
bm25_response = bm25_retriever.invoke(request)                                     # linha 20
...
chroma_vs = Chroma.from_documents(                                                 # linha 25
chroma_response = chroma_retriever.invoke(request)                                 # linha 34
...
answer = llm.invoke(prompt.format(question=request, context=doc_content))          # linha 54
```

A estrutura é: **mesma consulta, dois retrievers, resultados lado a lado**, e no fim uma
resposta gerada. É o experimento controlado que a Aula 07 recomendou como desenho — só a forma
de buscar muda.

Rode e compare os dois conjuntos de resultados. É a demonstração empírica da tabela do "Modelo
mental": há consultas em que o BM25 traz exatamente o registro certo e o denso passa longe, e
vice-versa.

---

## Parte 3 — BGE-M3: as três representações de uma vez

`04-BGE-M3.py` é onde a aula converge:

```python
from FlagEmbedding import BGEM3FlagModel          # linha 1
model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=False)   # linha 4
passage_embeddings = model.encode(               # linha 8
```

O `encode` pede as três saídas — na ordem do arquivo, `return_sparse=True`, `return_dense=True`,
`return_colbert_vecs=True` — e o resultado traz `dense_vecs`, os pesos lexicais (`sparse`) e os
`colbert_vecs`.

Três representações, um modelo, uma passada:

| Saída             | O que é                | Serve para                        |
| ----------------- | ---------------------- | --------------------------------- |
| `dense_vecs`      | um vetor por texto     | busca semântica                   |
| `lexical_weights` | pesos por termo        | busca esparsa, no papel do BM25   |
| `colbert_vecs`    | **um vetor por token** | late interaction, comparação fina |

**Julgamento:** o terceiro é o mais interessante e o menos usado. **ColBERT** guarda um vetor por token e
compara token a token, obtendo precisão próxima de um cross-encoder com custo bem menor — e
custo de armazenamento bem maior, porque você guarda dezenas de vetores por chunk em vez de um.
Ele reaparece no reranking da Aula 17 — **com uma ressalva que vale antecipar:** o `03-CoBERT-Reranking.py` do repositório **não faz late interaction**. O `calculate_similarity()` reduz os vetores por _mean pooling_ antes de comparar (linhas 128-131), e o próprio docstring avisa, na linha 123, que o ColBERT de verdade usaria MaxSim. O `colbert_vecs` do BGE-M3 é a matéria-prima certa; o repositório não a consome como ColBERT.

O `use_fp16=False` merece nota: `fp16` (meia precisão) acelera em GPU e pode degradar
levemente a qualidade. `False` é a escolha segura para rodar em CPU, que é onde a maioria vai
executar este exemplo.

Por que este arquivo vem logo depois dos dois de BM25 fica claro agora: o autor apresenta o
esparso, depois mostra o modelo que produz esparso e denso juntos. O passo seguinte —
**fundir os dois rankings** — é a busca híbrida de
`04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py` e seus dois irmãos,
que é a Aula 11.

---

## Parte 4 — Multimodal

`05-MultimodalEmbedding.py` coloca imagem e texto no **mesmo espaço vetorial**:

```python
from visual_bge.modeling import Visualized_BGE   # linha 11
```

As linhas 2 a 7 trazem um aviso do próprio autor sobre a instalação do `visual_bge`, com link
para o README do FlagEmbedding — a dependência é chata de instalar, e ele avisa.

O que "mesmo espaço" significa: o embedding de uma foto de um gato e o embedding do texto
"gato" ficam próximos. Consequência direta — você **busca imagem escrevendo texto**, sem
metadado, sem legenda, sem tag. É a base da Aula 11 (recuperação multimodal) e da Aula 27
(Multimodal RAG com Weaviate).

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/03-Embedding
python 03-BM25.py
```

Comece por aqui, não pelo `01`. **Julgamento:** é o lugar mais didático do curso para ver a
**fórmula do BM25** escrita por completo, sem abstração — **e note o que ele não é:** o arquivo não
tem variável de consulta nenhuma. Ele calcula o **vetor esparso de cada documento**, com o IDF do
próprio corpus. Pontuar uma consulta contra documentos é o que a maior parte do repositório faz:
**79 dos 182** `.py` citam `retriever` ou `search` (`grep -rlE "retriever|search" --include=*.py .`
contra `find . -name '*.py' | awk 'END{print NR}'`), e citar o termo é indício, não prova de que o
arquivo pontue. O que é raro é
ver a **conta escrita à mão**, e pontuação de consulta aparece em outros dois lugares deste
caminho: no
`03-LangChain-BM25.py`, por biblioteca (`BM25Retriever`), e no `calculate_similarity()` de
`07-PostRetrieval/01-Reranking/03-CoBERT-Reranking.py:106-145`, esse sim à mão — normalização L2 nas linhas
137-138 e `torch.mm` na 141, mas sobre vetores já reduzidos por mean pooling, não token a token. O
que o `03-BM25.py` tem de particular é a fórmula clássica inteira — IDF, saturação por `k1` e
normalização de comprimento por `b` — num só lugar. Um **terceiro** algoritmo de ranking escrito à
mão é o `reciprocal_rank_fusion` de
`07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:98` — mas ele refunde posições de listas já
recuperadas, em vez de pontuar relevância; são estágios diferentes do pipeline. Leia a saída
junto com a fórmula da linha 29.

```powershell
# copie 03-Embedding/.env.example para .env e preencha O3_API_KEY / O3_BASE_URL antes desta linha
python 03-LangChain-BM25.py
```

Este é o primeiro script desta sequência que gasta chave: ele embute com `OpenAIEmbeddings` (linhas 27-31)
e gera com `gpt-4o` (linhas 49-52), ambos lendo `O3_API_KEY`/`O3_BASE_URL`. Sem o `.env`, o `print`
do BM25 (linha 21) sai e o script morre ao construir o `OpenAIEmbeddings` das linhas 27-31, com `OpenAIError: The api_key client option must be set`, antes de o Chroma ser chamado.

Compare os resultados do `BM25Retriever` com os do Chroma para a mesma consulta. Anote uma
consulta em que discordam — ela é o seu argumento a favor do híbrido.

```powershell
$env:OPENAI_API_KEY = "sk-..."   # este arquivo não lê o .env
python 01-openai-embedding-recomendation-system.py
python 02-jina-embeddings-v3-clustering.py
```

O primeiro exige `OPENAI_API_KEY`; o segundo, `JINA_API_KEY` — e essa o `.env.example` da pasta
**declara**, na linha 10, com o comentário dizendo qual script a usa. O `02` chama `load_dotenv()`
(linhas 6-7), então basta preencher o `.env`; sem a chave ele morre em `RuntimeError: API call
failed: 401` na linha 32. A pegadinha é só no `01`: ele é o único script do módulo que precisa de
chave e **não chama `load_dotenv()`**, então a variável tem de estar no ambiente do shell. Sem isso
a falha vem da SDK, antes de qualquer embedding: `OpenAIError: The api_key client option must be
set`. O que o `.env.example` **não** declara é `OPENAI_API_KEY`: os nomes que ele traz são
`O3_API_KEY`/`O3_BASE_URL`, do `03-LangChain-BM25.py`. E não confie no cabeçalho dele, que afirma
"Every script here loads this file via python-dotenv's `load_dotenv()`" — é falso para quatro dos seis. Se não quiser gastar chave nestes dois, leia os
arquivos em vez de rodá-los: o mecanismo já está claro pela Aula 02.

```powershell
python 04-BGE-M3.py
```

O script já imprime as três formas (linhas 19, 22, 25) — o exercício é **ler** a assimetria delas.
`dense_vecs[0].shape` é `(1024,)`; `colbert_vecs[0].shape` é `(n_tokens, 1024)`, uma dimensão a
mais, e é isso que torna concreto "um vetor por token". A esparsa não tem `shape` nenhum:
`lexical_weights[0]` é um **dicionário** termo→peso, e é por isso que a linha 22 usa `len()`. Essa
diferença de **tipo**, e não a de número, é o que separa as duas famílias na hora de guardar no banco.

---

## Quebre de propósito

**1. Mexa no `b`, e veja por que ele só aparece comparando documentos.** Em `03-BM25.py`, duas
coisas atrapalham antes de você começar. O `print` da linha 35 está fora do laço das linhas 33-34,
então a execução imprime um vetor só, o do último log: mova-o para dentro do laço. E `vocabulary` é
um `set` (linha 13), então os índices impressos **mudam a cada execução** — rode o script duas
vezes e confira. Troque a linha 13 por `sorted(set(...))`, ou imprima `{word: score}` alterando a
linha 30 para `embedding[word] = score`.

Feito isso, rode com `b=0.75` e com `b=0`, e compare o peso de `Flaming Fist` no **log 3** (11
campos) com o do **log 1** (9 campos). Com `b=0.75` o log longo é penalizado (0,4425 contra 0,4851);
com `b=0` os dois caem no mesmo 0,4700, que aqui é exatamente o `idf` do termo, porque com
frequência 1 e sem normalização de comprimento o resto da fórmula vale 1. O `idf` nunca dependeu
do `b`. **Dentro** de um único log a mudança não diz nada, e pela mesma razão o
`k1` também não serve aqui: neste corpus nenhum termo se repete dentro de nenhum log, porque a tokenização por vírgula produz
frases inteiras como termo — 16 dos 25 tokens do vocabulário têm espaço, e `Flaming Fist` e
`Flaming Fist.` são termos diferentes. Com a frequência sempre em 1, mudar `k1` reescala tudo por
igual e a curva não aparece. Para vê-la, duplique um campo no **terceiro** log (`,Flaming Fist,`
duas vezes, e é o terceiro porque é o mais longo, 11 campos, onde a duplicação também move o denominador de comprimento) e só então varie `k1` entre 0.1 e 3.0:
a razão entre `Flaming Fist` e `summons` vai de 0,505 a 0,783. Ranking de verdade é no
`03-LangChain-BM25.py`, que tem consulta.

**2. Troque a tokenização.** Na linha 23, mude `log.split(",")` para `log.split()` e rode. O vetor
impresso fica **vazio** — `Sparse embedding: {}` —, e o motivo é mais instrutivo que uma degradação:
o `vocabulary` da linha 13 continua sendo construído por vírgula, então quase nenhum token separado
por espaço passa pelo filtro `if word in vocabulary` da linha 27 — os tamanhos por log viram
`[0, 1, 0]`, e o único sobrevivente é o `and` do segundo log, que existe como campo isolado no
terceiro. O vetor **impresso** sai vazio porque o `print` mostra só o último, e esse é 0: a lição
aí é que você está vendo um documento, não o índice. Tokenização é acordo entre indexação e consulta — mudar um lado só não piora o
ranking, apaga o índice.

E **não** tente "a mesma troca" no `03-LangChain-BM25.py`: ali não existe `split(",")` — o
`BM25Retriever` usa o `default_preprocessing_func` do `langchain_community`, que é `text.split()`.
Se você forçar a vírgula com `BM25Retriever.from_texts(battle_logs, preprocess_func=lambda t:
t.split(","))`, o efeito é o mesmo zero, e por um motivo ainda mais direto: a consulta
`"What equipment and moves does Wukong have?"` não tem vírgula, então ela vira **um** token que não
existe em documento nenhum e todos os scores dão 0. Degradação **parcial** de ranking exige
descasamento **parcial** — stemming de um lado só, por exemplo, que é a armadilha do português mais
abaixo.

**3. Consulte por identificador.** No `03-LangChain-BM25.py`, faça uma consulta com um código
ou nome próprio raro. Compare BM25 e Chroma. **Julgamento:** é a demonstração mais rápida do ponto cego do
denso — o mesmo ponto cego que a **tabela** da Aula 02 registra com `SKU-88213-B`, e que o exercício 3 de lá prevê com `CFOP 5102`.

**4. Mude `n_clusters`.** Em `02-jina-embeddings-v3-clustering.py`, teste 2 e 6 em vez de 3.
Os agrupamentos ainda fazem sentido? Se nenhum valor produzir clusters reconhecíveis, o modelo
não está separando bem o seu domínio.

---

## Armadilhas de produção

- **Trocar de modelo sem reindexar.** Vetores de modelos diferentes vivem em espaços
  incompatíveis. Trocou, reindexa tudo — e o custo disso é o argumento para escolher com
  cuidado desde o começo.
- **Modelo no idioma errado.** Vale repetir o defeito real deste repositório, visto na Aula 03:
  `bge-small-zh` sobre corpus inglês custa recall sem lançar erro. E vale repetir com a condição que
  a Aula 03 mede: nos seis arquivos `01_*` o defeito é **latente**, porque o corpus cabe num nó
  único e o recall é 1,0 com qualquer embedder. Ele só age em acervo que se fatie, onde o `k` tem de
  escolher. Para português, `intfloat/multilingual-e5-*` ou `paraphrase-multilingual-*` são pontos
  de partida melhores.
- **Recuperação com bi-encoder moderno costuma ser assimétrica, e o prefixo faz parte do texto.**
  Sem o que o cartão do modelo pede, ele é usado fora da distribuição em que foi treinado e o recall
  cai — **sem erro, sem aviso**, que é a assinatura de falha que este curso inteiro ensina a caçar.

  **E o detalhe muda por família, então não generalize** — o que segue vem dos cartões de modelo, não
  de execução. Na **E5**, o prefixo entra nos **dois**
  lados — `passage: ` na ingestão e `query: ` na consulta. Nas famílias **BGE v1/v1.5**, a instrução
  vai **só** do lado da consulta; o documento entra cru. E o **BGE-M3** — justamente o modelo que
  esta aula ensina em `04-BGE-M3.py` — **não exige instrução nenhuma**. Ou seja: nem existe uma
  regra única, e é por isso que a instrução real é ler o cartão do modelo antes de embutir o
  primeiro documento. Depois, só se conserta reindexando.

- **Limite de tokens do embedder.** Chunk maior que o limite tem o excedente descartado em
  silêncio. Liga direto com a Aula 07.
- **Tokenização do BM25 em português.** Sem tratamento, "contrato" e "contratos" são termos
  distintos. Stemming ou lematização mudam bastante o resultado — e não são default.
- **Custo de embutir por API.** Reindexar milhões de chunks via API paga é conta real. Modelo
  local resolve, e é por isso que embedding e geração são decisões separadas.
- **Dimensão como proxy de qualidade.** 1536 não é melhor que 384; é mais caro. Meça recall no
  _seu_ corpus.
- **ColBERT e armazenamento.** Um vetor por token multiplica o tamanho do índice. O ganho de
  precisão é real e o custo também — decida com número, não com entusiasmo.

---

## Checkpoint

1. Por que um módulo sobre embeddings inclui dois arquivos de BM25?
2. O que `k1` e `b` controlam na fórmula do BM25? O que acontece com `b=0`?
3. Por que o IDF faz palavras muito comuns quase não influenciarem o ranking?
4. Em `03-BM25.py:23`, a tokenização é por vírgula. Que consequência isso teria num corpus de
   prosa em português?
5. Quais são as três saídas do BGE-M3, e para que serve cada uma?
6. O que `colbert_vecs` guarda que `dense_vecs` não guarda, e a que custo?
7. Cite dois casos em que BM25 vence embedding e dois em que perde.
8. O que significa imagem e texto estarem "no mesmo espaço vetorial"?
9. Por que clusterizar o corpus antes de indexar é um diagnóstico útil?

---

## Vocabulário

`embedding` · `dense vector` · `sparse vector` · `BM25` · `BGE-M3` · `ColBERT` ·
`bi-encoder` · `cross-encoder` · `multimodal embedding` · `fine-tuning de embedding`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 07 — Chunking](AULA-07-chunking.md)
**Próxima:** [AULA 09 — Vector DB de verdade: collections, schema e entidades no Milvus](AULA-09-milvus-collections-schema-entidades.md)

> **Fase 2 concluída.** As Aulas 07 e 08 cobrem a representação: como o texto é cortado e como
> cada pedaço vira vetor. Da Fase 3 em diante, o assunto é onde guardar esses vetores e como
> encontrá-los rápido.
