# AULA 08 — Embeddings na prática, BM25 esparso e BGE-M3 híbrido

**Fase 2 — Representação** · Módulo do repo: `03-Embedding/` (8 arquivos, contando o `.env.example`)

---

## Pergunta motivadora

Na Aula 02 você entendeu o que é um embedding. Agora: por que um módulo sobre embeddings
dedica **dois dos seis arquivos ao BM25**, que não é embedding e é de 1994?

Porque o capítulo não é sobre vetores densos — é sobre **representação de informação para
recuperação**, e há mais de uma família. A ordem dos arquivos conta a história: dois exemplos
densos, dois de BM25 esparso, um de BGE-M3 que emite os dois, e um multimodal. É uma
progressão deliberada que termina na busca híbrida da Aula 11.

---

## Modelo mental

### Duas famílias, falhas disjuntas

|             | **Denso** (embedding)               | **Esparso** (BM25)                             |
| ----------- | ----------------------------------- | ---------------------------------------------- |
| Dimensões   | centenas, quase todas não-zero      | uma por termo do vocabulário, quase todas zero |
| Captura     | semântica, sinônimo, paráfrase      | correspondência literal de termo               |
| Acerta em   | "rescindir" ≈ "cancelar"            | `SKU-88213-B`, `CFOP 5102`                     |
| Erra em     | identificador, jargão novo, negação | sinônimo, outra língua                         |
| Explicável? | não — só um número de cosseno       | sim — você vê qual termo casou                 |

A última linha é subestimada. Quando o denso traz um documento errado, você tem um cosseno e
nenhuma explicação. Quando o BM25 erra, você vê o termo que casou. Para depurar recuperação em
produção, isso vale bastante.

**As duas famílias não competem: falham em conjuntos disjuntos de casos.** É esse fato — e não
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

O mecanismo é o da Aula 02, aplicado: embute a avaliação do usuário, embute os itens do guia,
e compara com `cosine_similarity` do scikit-learn (linha 50, com o `[0,0]` para extrair o
escalar da matriz 1×1). Quem escreveu avaliações sobre combate recebe recomendações sobre
combate — sem nenhuma regra escrita.

O que isso ensina para RAG: **o "documento" pode ser qualquer coisa que você decida embutir.**
Aqui é a preferência de um usuário. No seu projeto pode ser um perfil, uma consulta anterior,
o histórico de uma sessão.

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

A tokenização é por **vírgula**, não por espaço. Faz sentido para o corpus do exemplo — logs de
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

O `encode` pede as três saídas — `return_dense=True`, `return_sparse=True`,
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
Ele reaparece no reranking da Aula 17.

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

As linhas 2 a 6 trazem um aviso do próprio autor sobre a instalação do `visual_bge`, com link
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

Comece por aqui, não pelo `01`. É o único arquivo do curso inteiro em que você vê um algoritmo de
**pontuação query-documento** escrito por completo, sem abstração. O outro algoritmo escrito à
mão no repositório é o `reciprocal_rank_fusion` de
`07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:98` — mas ele refunde posições de listas já
recuperadas, em vez de pontuar relevância; são estágios diferentes do pipeline. Leia a saída
junto com a fórmula da linha 29.

```powershell
python 03-LangChain-BM25.py
```

Compare os resultados do `BM25Retriever` com os do Chroma para a mesma consulta. Anote uma
consulta em que discordam — ela é o seu argumento a favor do híbrido.

```powershell
python 01-openai-embedding-recomendation-system.py
python 02-jina-embeddings-v3-clustering.py
```

O primeiro exige `OPENAI_API_KEY`; o segundo, chave da Jina. Se estiver no caminho local, leia
os arquivos e rode os outros — o mecanismo já está claro pela Aula 02.

```powershell
python 04-BGE-M3.py
```

Imprima o **shape** de cada uma das três saídas. Ver que `colbert_vecs` tem uma dimensão a mais
que `dense_vecs` é o que torna concreto "um vetor por token".

---

## Quebre de propósito

**1. Mexa no `k1` e no `b`.** Em `03-BM25.py`, teste `k1=0.1` (saturação quase imediata — a
frequência quase não importa) e `b=0` (sem normalização por comprimento — documentos longos
passam a dominar). Rode e compare o ranking. Você acabou de sentir o que cada hiperparâmetro
faz, o que quase ninguém que usa BM25 sabe.

**2. Troque a tokenização.** Na linha 23, mude `log.split(",")` para `log.split()`. Se o corpus
usa vírgula como separador de campo, o ranking degrada. Fixa que BM25 é tão bom quanto sua
tokenização.

**3. Consulte por identificador.** No `03-LangChain-BM25.py`, faça uma consulta com um código
ou nome próprio raro. Compare BM25 e Chroma. É a demonstração mais rápida do ponto cego do
denso — o mesmo que o exercício da Aula 02 mostrou com `SKU-88213-B`.

**4. Mude `n_clusters`.** Em `02-jina-embeddings-v3-clustering.py`, teste 2 e 6 em vez de 3.
Os agrupamentos ainda fazem sentido? Se nenhum valor produzir clusters reconhecíveis, o modelo
não está separando bem o seu domínio.

---

## Armadilhas de produção

- **Trocar de modelo sem reindexar.** Vetores de modelos diferentes vivem em espaços
  incompatíveis. Trocou, reindexa tudo — e o custo disso é o argumento para escolher com
  cuidado desde o começo.
- **Modelo no idioma errado.** Vale repetir o defeito real deste repositório, visto na Aula 03:
  `bge-small-zh` sobre corpus inglês degrada recall sem lançar erro. Para português,
  `intfloat/multilingual-e5-*` ou `paraphrase-multilingual-*` são pontos de partida melhores.
- 🔴 **Recuperação com bi-encoder moderno é assimétrica, e o prefixo faz parte do texto.** A família
  **E5** exige `query: ` antes da consulta e `passage: ` antes do documento; a família **BGE** pede
  uma instrução do lado da consulta. Sem isso, o modelo é usado fora da distribuição em que foi
  treinado e o recall cai — **sem erro, sem aviso**, que é a assinatura de falha que este curso
  inteiro ensina a caçar.

  **E o detalhe muda por família, então não generalize:** na **E5**, o prefixo entra nos **dois**
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
