# AULA 10 — Índices ANN: FLAT, IVF_FLAT, IVF_PQ, HNSW e DiskANN

**Fase 3 — Armazenamento e busca** · Módulo do repo: `04-VectorDB/Milvus/02-Indexes/` (5 arquivos) e `/03-SearchAndMetrics/` (10 arquivos)

---

## Pergunta motivadora

Você tem um milhão de vetores e uma consulta. Comparar a consulta com todos é exato e leva
segundos. Comparar com alguns é rápido e pode errar. Como escolher, e como saber quanto está
errando?

Esta é uma das aulas mais quantitativas do curso, e a primeira em que a resposta certa é **medir**
— a Aula 22 volta ao tema com o instrumental completo. Os
cinco arquivos de `02-Indexes/` são cinco pontos diferentes na mesma curva de troca entre
**recall**, **latência** e **memória** — e o primeiro deles existe justamente para você poder
medir os outros quatro.

---

## Modelo mental

### Por que ANN existe

Busca exata (força bruta) compara a query com cada vetor do acervo. O custo cresce linearmente,
e em escala isso deixa de caber no orçamento de latência.

**ANN — Approximate Nearest Neighbor** — troca uma fração do recall por ganho enorme de
velocidade. A palavra que importa é _aproximado_: o índice **pode não encontrar** o vizinho
verdadeiro. Quanto ele erra é uma propriedade mensurável, não um detalhe a ignorar.

### As três dimensões do trade-off

| Dimensão     | O que é                                     | Como se mede                 |
| ------------ | ------------------------------------------- | ---------------------------- |
| **Recall**   | fração dos verdadeiros vizinhos encontrados | comparar com FLAT            |
| **Latência** | tempo por consulta                          | cronometrar, olhando p95/p99 |
| **Memória**  | RAM ocupada pelo índice                     | medir o processo             |

Nenhum índice ganha nas três. Toda escolha aqui é decidir **qual das três você pode ceder** no
seu caso — e isso depende do volume, do orçamento de latência e do hardware.

### A distinção que organiza tudo

Cada índice tem **dois grupos de parâmetros**, e confundi-los é a origem da maioria dos erros:

- **Parâmetros de construção** — fixados quando o índice é criado. Mudá-los exige reconstruir.
- **Parâmetros de busca** — ajustáveis por consulta, sem reconstruir nada.

O primeiro grupo define o teto de qualidade possível; o segundo, onde você opera dentro desse
teto. É por isso que um índice mal construído não se conserta ajustando a busca.

---

## Os cinco índices

Todos os cinco arquivos de `02-Indexes/` seguem a mesma estrutura: `metric_type` na **linha
34** e `index_type` na **linha 35**. Os cinco declaram `metric_type="L2"`.

| Arquivo                   | `index_type` | Construção                              | Busca                   |
| ------------------------- | ------------ | --------------------------------------- | ----------------------- |
| `01-milvus_flat_index.py` | `FLAT`       | nenhum                                  | —                       |
| `02-ivf_flat_index.py`    | `IVF_FLAT`   | `nlist: 64` (L38)                       | `nprobe: 10` (L65)      |
| `03-ivf_pq_index.py`      | `IVF_PQ`     | `nlist: 64`, `m: 32` (L38–39)           | `nprobe: 10` (L67)      |
| `04-hnsw_index.py`        | `HNSW`       | `M: 64`, `efConstruction: 100` (L38–39) | `ef: 10` (L66)          |
| `05-DiskANN.py`           | `DISKANN`    | —                                       | `search_list: 32` (L62) |

### FLAT — a verdade de referência

Nenhum parâmetro, nenhuma aproximação: compara com tudo. **Recall = 1.0 por definição.**

O erro conceitual comum é tratar FLAT como o índice ruim que existe por legado. Ele tem um
papel que nenhum outro cumpre: **é contra ele que você mede o recall dos demais.** Sem FLAT
você não sabe se seu HNSW está em 0,92 ou 0,99 — e essa diferença é a informação mais
importante de um sistema de recuperação.

Além disso, em acervo pequeno FLAT é mais rápido na prática: não há overhead de navegação e a
varredura cabe em cache. É por isso que `00-SimpleRAG/05_RAG_from_Scratch_Ollama.py:30` usa
`faiss.IndexFlatL2` para nove documentos — ANN ali seria absurdo.

### IVF_FLAT — particionar o espaço

O IVF (_inverted file_) agrupa os vetores em células por k-means. Na busca, visita só as células
mais próximas da query.

- **`nlist`** (construção) — quantas células. O comentário do autor em
  `03-ivf_pq_index.py:38` dá a heurística: *"usually set to 4*sqrt(n), where n is the number of
  vectors"\*.
- **`nprobe`** (busca) — quantas células visitar.

O par governa o comportamento, e a relação entre eles é o que importa:

| Ação                        | Recall   | Latência |
| --------------------------- | -------- | -------- |
| ↑ `nprobe`                  | **sobe** | **sobe** |
| ↑ `nlist` com `nprobe` fixo | **cai**  | cai      |

A segunda linha é contra-intuitiva e é onde as pessoas se enganam. Mais células com o mesmo
`nprobe` significa inspecionar uma **fração menor** do espaço — e o recall despenca. O que
governa recall é a razão `nprobe/nlist`; o que governa latência é `nprobe` absoluto.

No limite `nprobe = nlist` você visita tudo: recall igual ao FLAT, e nenhuma vantagem de
velocidade. Se você chegou aí, o índice não está ajudando.

### IVF_PQ — comprimir os vetores

Acrescenta **Product Quantization** ao IVF: o vetor é dividido em sub-vetores e cada um é
substituído pelo centroide mais próximo de um pequeno dicionário. O resultado ocupa uma fração
da memória original.

O parâmetro novo é **`m`** — quantos sub-vetores. O comentário de `03-ivf_pq_index.py:39` traz
a restrição e um exemplo: _"usually dim/m >= 2; here 128/32=4"_. Ou seja, com dimensão 128 e
`m: 32`, cada sub-vetor tem 4 componentes.

A troca é explícita: **memória por precisão.** A quantização é lossy — vetores diferentes podem
colapsar no mesmo código —, então o recall cai em relação ao IVF_FLAT com os mesmos `nlist` e
`nprobe`. Vale quando o índice não caberia em RAM de outra forma.

### HNSW — grafo navegável

Constrói um grafo hierárquico em camadas: as de cima são esparsas e servem para saltos longos;
as de baixo são densas e refinam localmente. A busca desce as camadas aproximando-se do alvo.

- **`M`** (construção) — número máximo de vizinhos por nó. O comentário da linha 38 diz
  _"Maximum number of neighbors"_.
- **`efConstruction`** (construção) — tamanho da lista de candidatos durante a construção
  (linha 39: _"Number of candidate neighbors during construction"_).
- **`ef`** (busca) — tamanho da lista de candidatos durante a busca (linha 66: _"Number of
  candidate neighbors during search"_).

`M` e `efConstruction` definem a qualidade do grafo — e o custo de construí-lo. `ef` é o botão
de operação: subir `ef` aumenta recall e latência, sem reconstruir nada.

HNSW costuma ter o melhor equilíbrio recall/latência, e por isso é o default de muitos
sistemas. O que ele cobra:

- **memória** — as listas de adjacência do grafo ocupam espaço além dos vetores;
- **tempo de construção** — bem maior que inserção em FLAT ou IVF;
- **remoção e atualização** — grafos HNSW tipicamente marcam como excluído (_tombstone_) em vez
  de remover de fato, e degradam com muita rotatividade;
- **filtro escalar restritivo** — o grafo foi construído sem conhecer o filtro; se poucos nós
  sobrevivem, pode não haver caminho entre eles e a navegação degrada.

### DiskANN — índice em disco

Para acervos que não caberiam em RAM. O parâmetro de busca é **`search_list: 32`** (linha 62) —
o tamanho da lista de candidatos.

Um detalhe do arquivo que vale registrar: a linha 34 traz o comentário _"Supports L2, IP, or
COSINE"_ — é o único dos cinco que documenta explicitamente as métricas suportadas.

A troca aqui é **latência por capacidade**: acesso a disco é ordens de magnitude mais lento que
RAM, e o índice é desenhado para minimizar o número de leituras. Use quando o volume manda, não
por preferência.

---

## Métricas: o erro que não avisa

`03-SearchAndMetrics/02-ann-diff-metrics.py` monta o experimento certo. Na linha 15:

```python
metric_types = ["L2", "IP", "COSINE"]
collections = {metric: f"ann_search_demo_{metric.lower()}" for metric in metric_types}
```

**Uma collection por métrica** — porque a métrica é propriedade do índice, não da consulta. Não
se compara métricas na mesma collection; constrói-se uma para cada.

E o detalhe que considero mais instrutivo do arquivo, na linha 106:

```python
search_vectors = normalized_query_vectors if metric_type == "COSINE" else query_vectors
```

O código **normaliza os vetores de consulta somente quando a métrica é COSINE**. É a Aula 02
aplicada: cosseno compara direção e ignora magnitude; produto interno considera as duas. Com
vetores normalizados, IP e cosseno coincidem — sem normalizar, IP passa a favorecer vetores de
maior magnitude, e em texto magnitude correlaciona com comprimento.

Escolher a métrica errada **não lança erro**. O sistema devolve resultados, o ranking está
comprometido, e nenhuma métrica de geração acusa. É a armadilha silenciosa do capítulo 4, e a
razão de a Aula 02 insistir tanto nisso.

---

## As dez operações de busca

`03-SearchAndMetrics/` tem **10 arquivos**, e vale saber que existem — várias respondem
perguntas que RAG vetorial puro não responde:

| Arquivo                          | Operação                         |
| -------------------------------- | -------------------------------- |
| `01-basic-ann.py`                | busca ANN básica                 |
| `02-ann-diff-metrics.py`         | comparação de métricas           |
| `03-filtered-search.py`          | busca com filtro escalar         |
| `04-range-search.py`             | busca por raio, não por top-k    |
| `05-group-search.py`             | agrupamento de resultados        |
| `06-full-text-search-bm25-ch.py` | full-text BM25                   |
| `06-full-text-search-bm25-en.py` | full-text BM25                   |
| `07-text-match.py`               | correspondência literal de texto |
| `08-search-iter.py`              | busca iterativa (paginação)      |
| `09-metadata-query.py`           | consulta por metadado, sem vetor |

⚠️ **Sobre o par `06`:** o nome sugere versões para chinês e inglês, mas rodando `diff` os dois
arquivos diferem em **duas linhas** — a frase de amostra e o texto da query. Nenhum dos dois
configura analisador de idioma; ambos usam apenas `enable_analyzer=True` na linha 19, e o
arquivo com sufixo `-ch` contém texto em inglês. É resíduo da tradução CN→EN do repositório, e
não uma demonstração de tokenização por idioma. (Esta é a correção de um erro que este curso
cometeu na primeira avaliação do agente `@rag-specialist` — registrada em
[`avaliacao/GATE-RAG-SPECIALIST-v2.md`](avaliacao/GATE-RAG-SPECIALIST-v2.md).)

Note também o que estes dois **não** são. O `07-text-match.py` usa `TEXT_MATCH` como **filtro
dentro** de uma busca vetorial — `client.search(..., anns_field="vector", ...)` nas linhas 59, 75
e 91 —, o mesmo padrão do filtro escalar de `03-filtered-search.py`, não um substituto da busca.
Já em `09-metadata-query.py`, só os passos finais (`.get()`, `.query()`, `.query_iterator()`) são
consulta sem vetor. Um vector DB moderno acumula os dois papéis, e é isso que permite o roteamento
de fonte que a Aula 12 pediu, sem trocar de banco.

### Filtro escalar

`03-filtered-search.py:59` mostra a sintaxe de expressão do Milvus:

```python
filter='color like "color_%" and likes > 500',
```

É o campo escalar da Aula 09 finalmente em uso: `color` com `like` e `likes` com comparação
numérica, combinados por `and`. Filtro é uma expressão sobre campos escalares, avaliada junto
com a busca vetorial.

O mesmo arquivo traz, na linha 77, uma pista de arquitetura:

```python
"hints": "iterative_filter"   # Enable iterative filtering
```

São três estratégias, e vale separá-las antes de escolher:

| Estratégia        | Como funciona                                                       | Onde acontece                             |
| ----------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| **Pré-filtragem** | a expressão escalar é avaliada **durante** a travessia, como bitset | é o comportamento padrão do Milvus        |
| **Pós-filtragem** | busca `top-k` e descarta o que não casa depois                      | frameworks costumam fazer isso no cliente |
| **Iterativa**     | continua a busca até juntar resultados válidos suficientes          | `hints: iterative_filter`                 |

A distinção importa porque o modo de falha é diferente em cada uma. Na **pós-filtragem**, se os `k`
melhores forem todos descartados você recebe **zero resultados** mesmo havendo documentos relevantes
um pouco mais distantes. Na **pré-filtragem** — o default daqui — isso não acontece; o que o filtro
muito seletivo provoca é **degradação de custo e de recall na navegação**: o grafo HNSW percorre
vizinhos que o bitset já eliminou, e o IVF varre células quase vazias. É para esse caso que a
filtragem iterativa existe.

Resposta prática: para filtro pouco seletivo, o default basta; para filtro muito seletivo,
filtragem iterativa ou particionamento físico.

> ⚠️ **Ressalva sobre o exemplo.** Este arquivo constrói `index_type="FLAT"` (linha 37) sobre 1000
> vetores. Num índice exaustivo e nesse tamanho, nenhuma das três estratégias diverge de forma
> observável — a diferença aparece em HNSW ou IVF, com filtro muito seletivo e volume. Para sentir o
> efeito, troque o índice antes de comparar.

### Busca por raio

`04-range-search.py` inverte a pergunta: em vez de "os `k` mais próximos", pede "todos dentro
de uma faixa de distância". As linhas 109–110:

```python
"radius": 1.0,        # Outer radius
"range_filter": 0.5   # Inner radius
```

E a nota do autor na linha 100 é a parte que evita um bug: _"for L2 distance, range_filter
should be smaller than radius"_.

Isso decorre da Aula 02: em **L2, menor é mais parecido**. O `range_filter` é o raio interno e
o `radius` o externo, formando uma coroa — e com uma métrica de similaridade, onde maior é
melhor, a relação se inverteria. Mais uma vez, a métrica muda o significado dos números.

Quando range search é melhor que top-k: quando você quer **todos** os itens suficientemente
similares, e não um número fixo. "Todos os documentos parecidos com este" pode ter 2 ou 200
respostas legítimas, e forçar `k=10` é arbitrário nos dois casos.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/04-VectorDB/Milvus
docker compose up -d
cd 02-Indexes
python 01-milvus_flat_index.py
python 02-ivf_flat_index.py
python 03-ivf_pq_index.py
python 04-hnsw_index.py
python 05-DiskANN.py
```

Rode nesta ordem e **guarde os resultados do FLAT** — eles são o gabarito de recall dos outros
quatro.

Depois monte a medição que a aula pede. Para um conjunto de consultas:

1. Rode contra FLAT e guarde os ids retornados. Este é o conjunto verdadeiro.
2. Rode contra cada índice aproximado.
3. **Recall@k do índice** = (ids em comum com o FLAT) / k, média sobre as consultas.
4. Cronometre cada um, olhando p95 e não só a média.

Com isso você tem a tabela recall × latência do **seu** corpus — que é a única que decide.

> ⚠️ **Duas coisas se chamam "recall", e confundi-las custa caro.** O desta seção é **recall do
> índice**: fidelidade da busca aproximada em relação à exata (o FLAT). O da Aula 22 é **recall de
> recuperação**: fração dos documentos **relevantes** que voltaram, medida contra um gabarito. São
> independentes — um índice pode ter recall 1,0 e devolver fielmente os vizinhos errados, se o
> embedding ou o chunking estiverem ruins. O primeiro é pré-requisito do segundo, nunca substituto.

```powershell
cd ../03-SearchAndMetrics
python 02-ann-diff-metrics.py
python 03-filtered-search.py
python 04-range-search.py
```

**Julgamento:** o `02` é o mais importante — veja como o mesmo dado ranqueia diferente sob L2,
IP e COSINE.

---

## Quebre de propósito

**1. Suba `nlist` mantendo `nprobe`.** Em `02-ivf_flat_index.py`, troque `nlist: 64` por
`nlist: 1024` deixando `nprobe: 10`. Meça o recall contra o FLAT. Ele cai — porque você passou
a inspecionar 10 de 1024 células em vez de 10 de 64. É a linha contra-intuitiva da tabela,
sentida na prática.

**2. Faça `nprobe = nlist`.** Recall vai a 1.0 e a latência se aproxima do FLAT. Você
reconstruiu a força bruta com passos extras — a prova de que ANN só faz sentido quando de fato
aproxima.

**3. Use a métrica errada de propósito.** Construa uma collection com `metric_type="IP"` e
busque com vetores **não** normalizados, comparando com a versão COSINE do
`02-ann-diff-metrics.py`. Nenhum erro é lançado; o ranking muda. Fixe esse sintoma: ranking
sistematicamente estranho, sem exceção nenhuma, é suspeita de métrica incompatível.

**4. Filtre de forma muito seletiva.** Em `03-filtered-search.py`, mude o filtro para algo que
elimine quase tudo (`likes > 999999`). Observe quantos resultados voltam, e depois compare com
o comportamento sob `"hints": "iterative_filter"`.

**5. Inverta `radius` e `range_filter`.** Em `04-range-search.py`, ponha `range_filter` maior
que `radius`, contra a nota da linha 100. Veja o que acontece — e por que a nota está lá.

---

## Armadilhas de produção

- **Métrica incompatível com o modelo de embedding.** Silencioso, e degrada tudo. Registre a
  métrica junto com o nome do modelo na documentação da collection.
- **Ajustar `nprobe` sem olhar `nlist`.** **Julgamento:** é a causa mais comum de "meu IVF ficou rápido e parou
  de achar as coisas".
- **Não medir recall.** Sem comparar contra FLAT, você não sabe o quanto seu índice erra — e
  vai atribuir a resposta ruim ao prompt.
- **Cronometrar só a média.** A média esconde a cauda. Orçamento de latência se cumpre no p95
  ou p99, não na média.
- **HNSW com muita rotatividade.** Remoções por tombstone acumulam; se o acervo muda muito,
  planeje reconstrução periódica.
- **IVF_PQ por reflexo.** Só vale quando memória é o gargalo. Se o índice cabe em RAM, a perda
  de precisão é gratuita e indesejada.
- **Trocar de índice sem reconstruir.** Parâmetros de construção não são ajustáveis a quente.
- **Assumir que o default é bom.** O default é razoável para o caso médio, e o seu corpus não é
  o caso médio.

---

## Checkpoint

1. Por que ANN existe, e o que exatamente ele troca?
2. Qual a diferença entre parâmetro de construção e parâmetro de busca? Por quê isso importa?
3. Qual o papel do FLAT que nenhum outro índice cumpre?
4. O que acontece com o recall quando você aumenta `nlist` mantendo `nprobe` fixo? Por quê?
5. O que `nprobe = nlist` produz?
6. O que `m` controla no IVF_PQ, e qual a restrição que o comentário do autor menciona?
7. Diferencie `M`, `efConstruction` e `ef` no HNSW. Quais exigem reconstruir o índice?
8. Cite quatro custos do HNSW.
9. Por que `02-ann-diff-metrics.py` normaliza os vetores de consulta só quando a métrica é
   COSINE?
10. Por que `range_filter` deve ser menor que `radius` quando a métrica é L2?
11. Que problema a filtragem iterativa resolve?
12. Como você mede recall@k na prática?

---

## Vocabulário

`ANN` · `FLAT` · `IVF_FLAT` · `IVF_PQ` · `HNSW` · `DiskANN` · `recall@k` · `metric type` ·
`cosine similarity` · `dot product` · `euclidean distance (L2)` · `filtered search` ·
`range search`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 09 — Milvus: collections, schema e entidades](AULA-09-milvus-collections-schema-entidades.md)
**Próxima:** [AULA 11 — Busca híbrida densa + esparsa, e recuperação multimodal](AULA-11-busca-hibrida-multimodal.md)

> Esta aula construiu o índice e mediu o que ele custa. A Aula 11 usa dois índices ao mesmo
> tempo — denso e esparso — e funde os rankings com o RRF que a Aula 17 vai detalhar.
