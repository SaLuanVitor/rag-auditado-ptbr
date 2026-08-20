# AULA 17 — Reranking: RRF, cross-encoder, ColBERT, Cohere, RankLLM e recência

**Fase 6 — Pós-recuperação** · Módulo do repo: `07-PostRetrieval/01-Reranking/` (6 arquivos)

---

## Pergunta motivadora

O retriever devolveu 20 documentos ordenados por similaridade. Por que reordená-los?

Porque a ordem que o retriever produziu foi feita para ser **rápida**, não para ser **certa**. O
bi-encoder compara vetores pré-computados — barato o suficiente para varrer um acervo, e cego para
a interação entre a pergunta e cada documento. Reranking é o estágio que gasta mais por documento,
sobre poucos documentos, para acertar a ordem.

**Julgamento:** é a melhor relação custo-benefício de todo o pipeline RAG. E é a aula que várias anteriores
prometeram.

---

## Modelo mental

### Recuperar largo, entregar estreito

```
acervo  →  [retriever: barato, k=20]  →  [reranker: caro, k=20→5]  →  LLM
           bi-encoder, índice ANN         cross-encoder ou LLM
```

O desenho de dois estágios existe por duas restrições, que esta aula estabelece agora — a Aula 08
apresentou bi-encoder e cross-encoder, mas não tratou de indexabilidade:

- **Bi-encoder é indexável, cross-encoder não.** Não há vetor de documento para guardar
  num cross-encoder — ele julga pares. Logo, N forward passes por query, impossível no acervo
  inteiro.
- **Contexto longo degrada a geração** (o _lost in the middle_ da Aula 01). Entregar 20 chunks é
  pior que entregar 5 bons.

Reranking resolve os dois: recupera-se largo para não perder recall, reordena-se com um modelo
preciso, e entrega-se estreito.

⚠️ **Uma correção necessária, porque é o erro que este curso cometeu:** reranking **desloca** o
trade-off precision/recall — não o elimina. Ele adiciona latência, custo computacional e a
imperfeição do próprio reranker. Dizer que "permite não pagar o preço" foi um overclaim registrado
em [`avaliacao/GATE-RAG-SPECIALIST.md`](avaliacao/GATE-RAG-SPECIALIST.md).

### Duas famílias de reranker

| Família                       | Como decide                       | Precisa de modelo? |
| ----------------------------- | --------------------------------- | ------------------ |
| **Fusão de rankings**         | combina posições de várias listas | não                |
| **Reavaliação de relevância** | julga cada par (query, documento) | sim                |

RRF é da primeira. Cross-encoder, ColBERT, Cohere e RankLLM são da segunda. E recência é uma
terceira coisa — ponderação por sinal externo, sem julgar relevância.

---

## Os seis arquivos

| Arquivo                          | Técnica                                                  | Evidência                                                            |
| -------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| `01-RRF-Reranking.py`            | RRF **implementado à mão**                               | `def reciprocal_rank_fusion(results: list[list], k=60)` na linha 98  |
| `02-CrossEncoder-Reranking.py`   | `transformers` + `cross-encoder/ms-marco-MiniLM-L-12-v2` | modelo na linha 33, `AutoModelForSequenceClassification` na 40       |
| `03-CoBERT-Reranking.py`         | ColBERT sobre `bert-base-uncased`                        | modelo na linha 35, `AutoModel` na 41                                |
| `04-Cohere-Reranking.py`         | `CohereRerank` (API) + `BM25Retriever`                   | import na linha 2, instância na 87                                   |
| `05-RankLLM-Reranking.py`        | `RankLLMRerank`                                          | `langchain_community.document_compressors.rankllm_rerank` na linha 6 |
| `06-RecencyWeightedReranking.py` | ponderação temporal                                      | `datetime` e `faiss` nas linhas 1–4                                  |

---

## Parte 1 — RRF, da fórmula à aritmética

`01-RRF-Reranking.py` implementa Reciprocal Rank Fusion **sem biblioteca**, e é o segundo arquivo
do curso em que você vê um algoritmo de recuperação por inteiro — depois do BM25 e do
`calculate_similarity()` do CoBERT, os dois que a Aula 08 mostra.

A assinatura, na linha 98:

```python
def reciprocal_rank_fusion(results: list[list], k=60):
```

O score, na linha 140, e o acúmulo na 141:

```python
            rrf_score = 1 / (rank + k)
            fused_scores[doc_str] += rrf_score
```

A docstring da linha 106 registra que **60 é "an empirical value"** — valor empírico, não derivado.
E o item 4 do docstring, na linha 27, mais a docstring da 113 descrevem a fórmula.

### O que o `k` faz, com números

Aula 11 prometeu a aritmética. Aqui está, e ela explica a escolha de projeto:

| Posição | `rank` | Score `1/(rank+60)` |
| ------- | ------ | ------------------- |
| 1º      | 0      | 1/60 ≈ 0,016667     |
| 2º      | 1      | 1/61 ≈ 0,016393     |
| 3º      | 2      | 1/62 ≈ 0,016129     |

A diferença entre 1º e 2º é de **1,67%**. Com `k` pequeno — digamos 1 — o 1º valeria 1,0 e o 2º
0,5: uma diferença de 50%.

Isso é uma **aposta deliberada**: com `k=60`, um único retriever muito confiante não domina a
fusão. **Concordância entre listas passa a valer mais que convicção de uma só.** É o que torna o
RRF robusto — e é também o que ele perde.

### Por que RRF dispensa scores comparáveis

O score de um documento é a **soma** de `1/(rank+k)` sobre todas as listas em que ele aparece —
é isso que o `+=` da linha 141 faz. Só a **posição** entra na conta.

Consequência: não importa que uma lista traga cosseno em [0,1], outra BM25 numa escala ilimitada, e
uma terceira distância L2 onde menor é melhor. Todas são reduzidas a "1º, 2º, 3º".

A alternativa — normalizar e somar — é frágil por três razões:

1. **Normalização não torna scores comparáveis**, só os coloca na mesma faixa. Um cosseno de 0,8 e
   um BM25 normalizado de 0,8 não representam graus equivalentes de relevância.
2. **Min-max depende do conjunto.** O mínimo e o máximo vêm da própria lista recuperada, então o
   score normalizado de um documento **muda se você mudar `top_k`** — resultados deixam de ser
   comparáveis entre execuções.
3. **Outlier comprime tudo.** Um documento com score altíssimo empurra os outros para perto de
   zero.

O custo do RRF: ele **descarta magnitude**. Quando o 1º lugar era genuinamente muito melhor que o
2º, essa informação se perde. Troca consciente de precisão por robustez.

---

## Parte 2 — Reavaliação de relevância

### Cross-encoder

`02-CrossEncoder-Reranking.py` usa `cross-encoder/ms-marco-MiniLM-L-12-v2` (linha 33), carregado
com `AutoModelForSequenceClassification` (linha 40).

A classe do `transformers` já revela o mecanismo: é **classificação de par**, não geração de
embedding. O modelo recebe query e documento concatenados e emite um score de relevância. Não
existe "o vetor do documento" — e é exatamente por isso que ele não serve para indexar e
serve muito bem para reordenar 20 candidatos.

O `ms-marco` no nome indica o dataset de treino: MS MARCO, de ranking de passagens. Reranker
treinado em ranking, aplicado a ranking.

### ColBERT — com uma ressalva importante

`03-CoBERT-Reranking.py` usa `bert-base-uncased` (linha 35) com `AutoModel` (linha 41).

Duas observações que só a leitura do arquivo dá:

1. **O nome tem grafia própria** — "CoBERT", sem o `l` de ColBERT.
2. **Não é um checkpoint ColBERT treinado.** É BERT base, e o comentário do autor na linha 35 admite
   que pode ser substituído por _"a model fine-tuned specifically for ColBERT"_.

Ou seja: o arquivo demonstra o **mecanismo de late interaction** — guardar um vetor por token e
comparar token a token —, não ColBERT em qualidade de produção. Quem rodar esperando resultado de
ColBERT vai se decepcionar, e a decepção seria com a expectativa, não com o código.

A conexão com a Aula 08: o BGE-M3 emite `colbert_vecs` justamente para isso. Late interaction fica
entre bi-encoder e cross-encoder — mais preciso que o primeiro, mais barato que o segundo, e com
custo de armazenamento bem maior, porque são dezenas de vetores por chunk.

### Cohere — reranking como serviço

`04-Cohere-Reranking.py` importa `CohereRerank` (linha 2) e o instancia na linha 87, combinado com
`BM25Retriever`.

O ponto arquitetural: **reranking como API**. Você não hospeda modelo, não gerencia GPU, e paga por
chamada. O documento sai da sua infraestrutura — a mesma decisão de conformidade que a Aula 05
levantou sobre o LlamaParse.

Note a combinação com BM25: recuperar com esparso e reordenar com um reranker neural é um pipeline
comum e barato — o esparso é rápido e inspecionável, o reranker corrige a ordem.

### RankLLM — o próprio LLM ordenando

`05-RankLLM-Reranking.py` importa `RankLLMRerank` de
`langchain_community.document_compressors.rankllm_rerank` (linha 6).

Aqui o reranker é um LLM: ele recebe a query e a lista de documentos e **devolve a ordem**. Não há
score por par; há uma permutação.

Vantagem: entende nuance que um cross-encoder pequeno não pega. Desvantagem: é, **julgamento**, o mais caro e o
mais lento dos cinco, e é **não determinístico** — a mesma lista pode sair ordenada diferente.
Julgamento: reservaria para top-k pequeno em domínio onde a ordem importa muito, e mediria contra o
cross-encoder antes de assumir que compensa.

Note o pacote: `document_compressors`. No LangChain, reranking e compressão são a mesma
abstração — um compressor recebe documentos e devolve menos ou reordenados. Isso antecipa a Aula 18.

---

## Parte 3 — Recência: o reranker sem modelo de relevância

`06-RecencyWeightedReranking.py` é o único que não julga relevância. Ele importa `datetime` e
`faiss` (linhas 1–4) e reordena por **sinal temporal**.

### Como combinar tempo com similaridade

Somar diretamente está errado por três razões:

1. **Escalas.** Cosseno vive em faixa estreita; idade em dias é ilimitada. `0.83 + 412` faz o tempo
   dominar e o termo semântico virar ruído.
2. **Direções opostas.** Similaridade: maior é melhor. Idade: menor é melhor.
3. **Não linearidade.** A diferença entre 1 e 8 dias importa; entre 400 e 407, quase nada. Um termo
   linear trata os dois deltas como iguais.

A forma correta é um **decaimento exponencial normalizado**: com o fator em [0,1], você combina de
forma comensurável — `score = similaridade × decaimento`, ou uma média ponderada com α ajustável.

> ⚠️ **E aqui o arquivo ensina uma lição que não pretendia.** A linha 26 traz
> `time_decay_factor = exp(-decay_rate * time_since_last_access)` — mas ela está **dentro do
> docstring** do módulo, aberto na linha 14. Nenhuma linha executável calcula isso. O que roda é
> outra coisa: o ranking vem do `TimeWeightedVectorStoreRetriever` (linha 129), e o fator exibido
> nos `print` é calculado na linha 150 como `1.0 / (1.0 + decay_rate * hours_passed)` — decaimento
> **hiperbólico**, rotulado no próprio arquivo como `Simplified decay calculation`. Três fórmulas
> convivem no arquivo, e a que o texto documenta é a única que não executa.
>
> É a regra que este curso repete desde a primeira auditoria — _ler o que está escrito não é ler o
> que roda_ — numa variante nova: **docstring também não é implementação**. Verifique com
> `sed -n '26p'` e depois com `sed -n '148,152p'`.

Duas escolhas de projeto que eu marco como julgamento, não como fato:

- **Multiplicativo contra ponderado.** No multiplicativo, um documento antiquíssimo tem o score
  fortemente suprimido mesmo sendo perfeito semanticamente — desejável para notícia, desastroso para
  norma jurídica antiga e vigente.
- **`decay_rate` é parâmetro de domínio.** Preço de produto decai em horas; jurisprudência em anos.
  Não há default defensável, e se encontra medindo com perguntas sensíveis a tempo no conjunto de
  avaliação.

Alternativa que evita a calibração: tratar tempo como **filtro** ("só os últimos 12 meses"). Perde
nuance, ganha previsibilidade.

O arquivo usa `TimeWeightedVectorStoreRetriever`, e o nome do campo que ele grava — `last_accessed_at` —
revela que o sinal pode ser **acesso**, não só publicação. Recência de uso é um sinal diferente de
recência de criação, e em base de conhecimento interna costuma ser mais informativo.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/07-PostRetrieval/01-Reranking
python 01-RRF-Reranking.py
```

Comece aqui e leia a função da linha 98 junto com a saída. Depois **calcule à mão** os scores das
três primeiras posições com `k=60` e confira com o que o script imprime.

```powershell
python 02-CrossEncoder-Reranking.py
python 03-CoBERT-Reranking.py
```

Compare a ordem **antes e depois** do reranking na mesma consulta. O ganho aparece quando o
documento certo estava em 7º e sobe para 1º — e é essa observação que justifica o estágio.

```powershell
python 04-Cohere-Reranking.py
python 05-RankLLM-Reranking.py
python 06-RecencyWeightedReranking.py
```

O `04` exige chave da Cohere. No `06`, imprima o `decay_factor` da linha 150 de cada documento junto com a
similaridade — ver os dois números lado a lado é o que torna a combinação compreensível.

---

## Quebre de propósito

**1. Mude o `k` do RRF.** Troque `k=60` por `k=1` e por `k=1000`. Com `k=1`, o primeiro colocado de
cada lista domina; com `k=1000`, todas as posições ficam quase equivalentes e a fusão vira contagem
de aparições. Você acabou de sentir o que o parâmetro controla.

**2. Rerank sem recuperar largo.** Recupere `k=3` e reordene esses 3. O reranking não tem o que
consertar — ele só reordena o que veio. Isso mostra que **os dois estágios são interdependentes**:
recuperar estreito anula o ganho de reordenar.

**3. Recupere largo demais.** Vá para `k=100` e reordene. Meça o tempo. O cross-encoder faz 100
forward passes — e a latência mostra por que o estágio de recuperação precisa ser barato.

**4. Prove que a fórmula do arquivo não é a que ordena.** No `06`, troque o `decay_factor` da linha
150 por `1.0` — combinação de recência anulada — e rode. O ranking **não muda**: a ordem já veio
pronta da linha 129, de dentro da biblioteca; a linha 150 só calcula um número que é impresso
depois. Agora mexa em `decay_rate` (linha 73, valor `0.5`), que é o que a linha 83 entrega ao
`TimeWeightedVectorStoreRetriever` **antes** da busca — suba para `50.0` e volte para `0.01`,
comparando as duas ordens. A lição é qual dos dois números o seu código controla de fato.

**5. Rode o RankLLM duas vezes na mesma consulta.** Compare as ordens. Se divergirem, você
observou o não determinismo — e o problema que ele cria para comparar configurações.

---

## Armadilhas de produção

- **Reranquear o acervo inteiro.** Cross-encoder é O(N) em forward passes. Só sobre top-k.
- **Esquecer que reranking não recupera.** Se o documento certo não está no top-k do retriever,
  nenhum reranker o traz. Recall é responsabilidade do estágio anterior.
- **Latência do estágio extra.** Cross-encoder local, API externa ou LLM — os três somam tempo no
  caminho da consulta. Meça o p95.
- **RankLLM não determinístico.** Compromete comparação entre configurações. Fixe temperatura em
  zero e, mesmo assim, espere variação.
- **`decay_rate` copiado de exemplo.** É parâmetro de domínio.
- **Multiplicativo em corpus com documentos antigos válidos.** Norma de 1988 vigente não deve ser
  suprimida por idade.
- **Reranking sem medir.** Sem conjunto de avaliação você não sabe se o estágio ajudou. Meça
  context precision antes e depois.
- **Assumir que reranking dispensa bom chunking.** Reordenar chunks mal cortados entrega chunks mal
  cortados em melhor ordem.

---

## Checkpoint

1. Por que a ordem do retriever não é a ordem certa?
2. Por que cross-encoder não pode substituir o bi-encoder na recuperação?
3. Reranking elimina o trade-off precision/recall? Justifique.
4. Calcule os scores RRF do 1º e do 2º colocados com `k=60`. Qual a diferença relativa, e que
   aposta de projeto ela representa?
5. Por que RRF dispensa que os scores sejam comparáveis? O que ele perde em troca?
6. Cite as três fragilidades de normalizar e somar em vez de usar RRF.
7. O `03-CoBERT-Reranking.py` entrega ColBERT em qualidade de produção? O que ele demonstra?
8. Onde late interaction se situa entre bi-encoder e cross-encoder, e a que custo?
9. O que o pacote `document_compressors` do RankLLM sugere sobre reranking e compressão?
10. Por que somar similaridade e idade diretamente está errado? Cite as três razões.
11. Qual a diferença entre recência de publicação e `time_since_last_access`?
12. Se o documento certo não está no top-k do retriever, o reranking resolve?

---

## Vocabulário

`reranking` · `RRF (Reciprocal Rank Fusion)` · `cross-encoder` · `bi-encoder` · `ColBERT` ·
`top-k` · `context precision` · `lost in the middle`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 16 — Índice hierárquico e multi-representação](AULA-16-indice-hierarquico-multi-representacao.md)
**Próxima:** [AULA 18 — Compressão de contexto e correção reflexiva (CRAG)](AULA-18-compressao-crag.md)

> Esta aula reordenou o que voltou. A Aula 18 vai além: **remover** o que não responde, e **corrigir
> o curso** quando o que voltou é ruim.
