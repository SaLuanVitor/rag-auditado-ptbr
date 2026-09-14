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

Além disso, em acervo pequeno FLAT tende a ser mais rápido na prática: não há overhead de navegação,
e a varredura de poucos vetores provavelmente cabe em cache — plausível, e não medido aqui. É por
isso que `00-SimpleRAG/05_RAG_from_Scratch_Ollama.py:30` usa `faiss.IndexFlatL2` para nove
documentos — ANN ali seria absurdo.

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

São **dois** parâmetros novos, `m` e `nbits` (`03-ivf_pq_index.py:39` e `:40`). O `m` diz em
quantos sub-vetores o vetor é partido, e o comentário do arquivo traz a restrição com exemplo:
_"usually dim/m >= 2; here 128/32=4"_, ou seja, com dimensão 128 e `m: 32` cada sub-vetor tem 4
componentes. O `nbits` diz com quantos bits cada sub-vetor é codificado, e é o par que fixa a
compressão: com `m: 32` e `nbits: 8`, um vetor de 128 dimensões passa de 512 bytes em float32 para
32 bytes, **16 vezes menos**.

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

HNSW costuma ter o melhor equilíbrio recall/latência, e é o default de muitos sistemas — **doutrina
corrente de ANN, não algo que este repositório meça:** nenhum dos cinco arquivos de `02-Indexes/`
compara índices entre si. O que ele cobra:

- **memória** — as listas de adjacência do grafo ocupam espaço além dos vetores;
- **tempo de construção** — bem maior que inserção em FLAT ou IVF;
- **remoção e atualização** — grafos HNSW tipicamente marcam como excluído (_tombstone_) em vez
  de remover de fato, e degradam com muita rotatividade (também doutrina geral: nenhum arquivo do
  módulo exercita remoção ou rotatividade);
- **filtro escalar restritivo** — o grafo foi construído sem conhecer o filtro; se poucos nós
  sobrevivem, pode não haver caminho entre eles e a navegação degrada.

### DiskANN — índice em disco

Para acervos que não caberiam em RAM. O parâmetro de busca é **`search_list: 32`** (linha 62) —
o tamanho da lista de candidatos.

Um detalhe que vale registrar: `05-DiskANN.py:34` traz o comentário _"Supports L2, IP, or
COSINE"_, e é o único dos cinco que documenta explicitamente as métricas suportadas.

A troca aqui é **latência por capacidade**: acesso a disco é ordens de magnitude mais lento que
RAM, e o índice é desenhado para minimizar o número de leituras. Use quando o volume manda, não
por preferência.

---

## Métricas: o erro que não avisa

`03-SearchAndMetrics/02-ann-diff-metrics.py` monta o experimento certo. Nas linhas 15-16:

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

Parece a Aula 02 aplicada, e não é: **normalizar só a consulta não muda ranking nenhum.** Escalar
a query por `1/‖q‖` multiplica todos os produtos internos pela mesma constante positiva, então a
ordem sai idêntica. Medido com 1000 vetores em 128 dimensões: a permutação completa de IP com
query crua e de IP com query normalizada é a mesma, até o último elemento.

O que de fato separa IP de COSINE neste arquivo é a **linha 20**, onde os vetores **armazenados**
são sorteados e nunca normalizados, somada à normalização que o Milvus aplica por dentro na
collection COSINE. Com o mesmo dado e a mesma consulta, IP e COSINE dividiram 3 dos 10 primeiros.
A lição da Aula 02 continua de pé, e a linha que a carrega é outra: **normalização é propriedade
do acervo, não da consulta.** Com os dois lados normalizados, IP e cosseno coincidem; com nenhum
dos dois, IP favorece vetores de maior magnitude, e em texto magnitude correlaciona com
comprimento.

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
dentro** de uma busca vetorial — `client.search(..., anns_field="vector", ..., filter=...)` na linha
112, com o `filter` definido na 107 (as linhas 59, 75 e 91 do mesmo arquivo são buscas vetoriais
puras, sem `filter`) —, o mesmo padrão do filtro escalar de `03-filtered-search.py`, não um
substituto da busca. Já em `09-metadata-query.py`, só os passos finais (`.get()`, `.query()`,
`.query_iterator()`) são consulta sem vetor. Um vector DB moderno acumula os dois papéis, e é isso
que permite o roteamento de fonte que a Aula 12 pediu, sem trocar de banco.

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

Depois monte a medição que a aula pede — mas **cinco coisas nos arquivos impedem que ela funcione como
estão escritos**, e consertá-las é a primeira parte do exercício:

- **Os arquivos 01 a 04 usam a mesma collection.** Todos declaram
  `COLLECTION_NAME = "flat_index_demo"` na linha 6, e cada um faz `drop_collection` na abertura:
  rodar o `02` **apaga** o FLAT que você acabou de construir. Dê a cada arquivo um nome próprio
  (`flat_demo`, `ivf_flat_demo`, `ivf_pq_demo`, `hnsw_demo`), para que as coleções coexistam.
- **Não há semente.** Os 1000 vetores (linha 22) e o vetor de consulta são sorteados com
  `random.random()` em cada execução, e nenhum dos cinco arquivos chama `random.seed`. Sem semente,
  FLAT e IVF respondem sobre acervos diferentes, a perguntas diferentes — a interseção de ids é quase
  zero por construção, e não mede aproximação nenhuma. Ponha `random.seed(42)` antes da linha 22 em
  todos.
- **O dado é ruído uniforme, e é isso que decide o número.** Este é o bloqueio que domina os
  outros, e o único que nenhum conserto de configuração resolve. Os vetores são `random.random()`
  em 128 dimensões, sem agrupamento nenhum, e nesse dado o quinto vizinho fica cerca de 3% mais
  longe que o primeiro: o k-means não tem estrutura para particionar, e a vizinhança verdadeira se
  espalha por células que o `nprobe` não visita. Medido com um replicador de IVF em `numpy`, 100
  mil vetores, `nlist: 64`, `nprobe: 10`, `k=5`: **recall 0,40 no dado uniforme e 1,00 no mesmo
  tamanho com 200 clusters gaussianos.** O 0,40 mede a maldição da dimensionalidade, não o índice.
  Substitua o sorteio uniforme por embeddings reais do seu acervo, ou ao menos por mistura de
  gaussianas, antes de acreditar em qualquer linha da tabela.
- **Os cinco escrevem `ann_field` onde o parâmetro é `anns_field`.** Ele cai no `**kwargs` do
  `MilvusClient.search` e é descartado em silêncio; como há um campo vetorial só, o Milvus infere e
  a busca funciona. Não quebra, e por isso passa despercebido. O `07-text-match.py` usa a forma
  certa, nas linhas 62, 78, 94 e 111.
- **Todos terminam em `release_collection`.** As coleções coexistem no disco depois do conserto do
  primeiro item, mas para comparar numa sessão seguinte você precisa de `load_collection` antes.
- **Mil vetores é pouco para o exercício 1.** Com `nlist: 1024` você pediria mais células do que há
  vetores. Suba `num_vectors` para algo como 100000 se quiser que a tabela recall × latência tenha o
  que mostrar.

Feito isso, para um conjunto de consultas:

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
sistematicamente estranho, sem que nenhum erro seja lançado, é suspeita de métrica incompatível.

**4. Filtre de forma muito seletiva.** Em `03-filtered-search.py`, dois avisos antes de mexer.
O `likes` é sorteado em `[1, 1000]` na linha 27, então `likes > 999999` não elimina quase tudo:
elimina **tudo**, deterministicamente, e as duas estratégias devolvem zero. Use algo como
`likes > 990`, que deixa da ordem de 1% do acervo. E o arquivo constrói `FLAT` na linha 37 sobre
mil vetores, que é exatamente o caso em que a ressalva desta aula já disse que as estratégias não
divergem: troque para `IVF_FLAT` com `nlist: 64` antes de comparar, ou você mede duas vezes a
mesma varredura exaustiva. Feito isso, compare o comportamento sob `"hints": "iterative_filter"`
— e note que o filtro está escrito **duas vezes** no arquivo, uma na busca padrão e outra na
iterativa. Extraia-o para uma variável e passe-a nas duas
chamadas; trocando só a primeira, você compara filtros diferentes em vez de estratégias diferentes.

**5. Inverta `radius` e `range_filter` — depois de fazer a busca devolver algo.** A janela do exemplo
é vazia para o dado deste script, e isso não é bug de configuração: é a geometria do dado sintético.
Os 1000 vetores e a consulta são uniformes em [0,1) com 128 dimensões, e a distância média entre a
consulta e um vetor assim é **4,62** (medido em 400 execuções). O vizinho mais próximo fica em
torno de **15,0 na escala quadrática que o Milvus reporta para L2**, com desvio de 0,85 e faixa
p5-p95 de 13,6 a 16,3, o que dá cerca de 3,87 na escala linear. **O script não tem semente**, então
cada execução devolve um valor dessa faixa, não um número fixo. Nenhum vetor cai entre 0,5 e 1,0
(zero em 400 mil sorteios), então a busca devolve lista vazia. Se
você inverter a partir daí, compara vazio com vazio.

Então: primeiro leia as distâncias que a busca top-k do mesmo arquivo imprime e escolha `radius` e
`range_filter` em torno delas — algo como 20 e 15. Confirme que a busca traz resultados. **Só então**
ponha `range_filter` maior que `radius`, contra a nota da linha 100, e compare. Ajuste também a linha
de relatório: ela escreve os dois números como literais na f-string, e passa a mentir sobre a faixa
depois que você muda os parâmetros.

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
