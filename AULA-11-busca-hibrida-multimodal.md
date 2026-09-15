# AULA 11 — Busca híbrida densa + esparsa, e recuperação multimodal

**Fase 3 — Armazenamento e busca** · Módulo do repo: `04-VectorDB/HybridRetrieval/` (4 arquivos, contando o `.env.example`) e `/MultimodalRetrieval/` (3 scripts, 3 imagens e um `.env.example`)

---

## Pergunta motivadora

A Aula 08 mostrou que denso e esparso falham em conjuntos disjuntos de casos. A Aula 10 mostrou
como construir um índice. Agora: como usar **os dois ao mesmo tempo** e transformar dois
rankings em um?

O problema não é buscar duas vezes — isso é fácil. É que os dois retrievers devolvem scores em
escalas incomparáveis: um cosseno em faixa estreita e um score BM25 ilimitado. Somar é somar
unidades diferentes. Esta aula é sobre as duas formas de resolver isso, e sobre por que uma
delas dispensa que os scores sejam comparáveis.

---

## Modelo mental

### O que o híbrido resolve

| Consulta                        | Denso                | Esparso         | Híbrido |
| ------------------------------- | -------------------- | --------------- | ------- |
| "como cancelo minha assinatura" | acerta (≈ rescindir) | erra            | acerta  |
| `SKU-88213-B`                   | erra                 | acerta          | acerta  |
| "erro ORA-01555 em produção"    | parcial              | acerta o código | acerta  |

A terceira coluna é o argumento inteiro. Híbrido não é "o melhor dos dois" por otimismo — é a
união de duas coberturas com **falhas complementares**.

O custo, que precisa ser dito: dois índices para manter, uma etapa de fusão, mais latência, e
um parâmetro novo (o peso ou o `k` do ranker). Não é gratuito.

### Duas formas de fundir

**Weighted (por score ponderado).** Normaliza os scores das duas listas e soma com pesos:
`score = w_denso × s_denso + w_esparso × s_esparso`. Você controla a mistura diretamente.
Exige que os scores sejam comparáveis — e eles não são por natureza, então a normalização faz
esse trabalho, com as fragilidades que a Aula 17 vai detalhar.

**RRF (Reciprocal Rank Fusion).** Ignora os scores e usa só a **posição**: cada documento
recebe `1/(k + rank)` em cada lista, e os valores são somados. Como só a ordinalidade entra na
conta, não importa que uma lista traga cosseno e a outra BM25.

A escolha entre as duas não é estética:

|                             | Weighted            | RRF                          |
| --------------------------- | ------------------- | ---------------------------- |
| Usa                         | scores normalizados | apenas posições              |
| Precisa scores comparáveis? | **sim**             | **não**                      |
| Controle da mistura         | direto (pesos)      | indireto                     |
| Sensível a outlier de score | sim                 | não                          |
| Perde informação            | não                 | **sim** — descarta magnitude |

RRF é mais robusto e menos ajustável. Weighted é mais ajustável e mais frágil. O `k=60` não é
invenção da Aula 17: o `v3` já o fixa em `rrf_k = 60`
(`Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:108`), e a Aula 17 volta à aritmética dele.

---

## Parte 1 — Os três scripts, e o que o nome esconde

`HybridRetrieval/` tem três variantes que usam BGE-M3 (o modelo da Aula 08, que emite denso e
esparso de uma vez) sobre Milvus:

| Arquivo                                        | Linhas  | Ranker                                   |
| ---------------------------------------------- | ------- | ---------------------------------------- |
| `Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py`  | **326** | `WeightedRanker` (L12)                   |
| `Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py` | 203     | `WeightedRanker` (L99)                   |
| `Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py` | 212     | `WeightedRanker` **e** `RRFRanker` (L99) |

⚠️ **O arquivo chamado "Minimal" é o maior dos três**, 326 linhas contra 203 e 212. O `diff` com o
`v2` mostra que a diferença não vem de um bloco só: o `v1` tem 70 chamadas a `print(` contra 22 do
`v2`, e a instrumentação está espalhada. A parte mais visível é a **inspeção de vetores esparsos**,
nas linhas 69 a 84, que imprime tipo, shape, índices de coluna e dados das primeiras posições, com
`hasattr` para lidar com formatos diferentes de matriz esparsa do `scipy`. A outra é mecânica: o
`v1` converte cada linha esparsa para o dicionário do Milvus à mão (linhas 162 a 168 e 254 a 259),
enquanto o `v2` entrega `docs_embeddings["sparse"]._getrow(j)` direto
(`Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:90`).

Ou seja, "minimal" descreve a **estratégia de fusão** (uma só, sem alternativas), não o tamanho
do arquivo. Se você abrir esperando o exemplo curto, vai se surpreender — e é mais um caso
deste curso em que o nome do arquivo promete algo diferente do que o código faz.

Esse bloco de inspeção, aliás, é, **julgamento**, a parte mais didática do `v1`: ele **mostra o que é um vetor
esparso** na prática — pares de índice e valor, em vez de uma lista densa de floats. Vale ler
antes de tratá-lo como abstração.

### O mecanismo, no `v2`

O `v2-Detailed` é, **julgamento**, o mais legível dos três. A sequência:

```python
from pymilvus import AnnSearchRequest, WeightedRanker      # linha 99

dense_req = AnnSearchRequest(...)                          # linha 135
sparse_req = AnnSearchRequest(...)                         # linha 141
rerank = WeightedRanker(weights["sparse"], weights["dense"])  # linha 147
results = collection.hybrid_search(...)                    # linha 176
```

Quatro passos que valem entender como padrão:

1. **`AnnSearchRequest`** — cada busca é declarada como um objeto, não executada de imediato.
   Uma para o campo denso, outra para o esparso.
2. **O ranker** — a estratégia de fusão é um objeto separado das buscas.
3. **`hybrid_search`** — recebe as duas requisições e o ranker, e o Milvus executa tudo
   **do lado do servidor**.
4. O resultado já vem fundido.

O ponto de arquitetura: a fusão acontece **no banco**, não na aplicação. Isso importa porque
evita trazer duas listas grandes pela rede para combiná-las no cliente — e é a diferença entre
o híbrido nativo do Milvus e o `EnsembleRetriever` do LangChain, que funde no lado do cliente.

Note a ordem dos argumentos em `WeightedRanker(weights["sparse"], weights["dense"])`: o peso
esparso vem primeiro. A ordem dos pesos precisa corresponder à ordem em que as requisições são
passadas ao `hybrid_search` — trocar os dois inverte a mistura sem lançar erro.

> 🔴 **E os dois arquivos que esta aula manda usar não satisfazem essa regra.** No `v2`, o ranker
> está em `WeightedRanker(weights["sparse"], weights["dense"])`
> (`Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:147`) e as requisições em
> `reqs=[dense_req, sparse_req]` (`Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:177`) — esparso
> primeiro no ranker, denso primeiro nas
> requisições. O `v3` repete o mesmo par (`Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:152` e
> `Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:186`). O **único** dos três em que as ordens
> correspondem é o `Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py`, nas linhas 270 e 274, justamente
> o que a leitura recomendada deixa
> para depois.
>
> **Limite declarado, e o que ele não abrange.** Não rodei o pipeline, e o motivo não é servidor:
> o `v2` abre um banco em arquivo com `connections.connect(uri="./wukong.db")`
> (`Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:48`). O que falta é ambiente Python com o
> `milvus-model` e os pesos do BGE-M3. Mas parte da pergunta se responde no próprio arquivo, sem
> biblioteca alguma:
> `weights` é `{"sparse": 0.7, "dense": 1.0}` (linha 106) e a chamada é
> `WeightedRanker(weights["sparse"], weights["dense"])` (linha 147) — **dois floats posicionais nus**,
> `0.7` e depois `1.0`. As chaves `"sparse"` e `"dense"` são resolvidas dentro do script e nunca
> atravessam a fronteira da chamada: a biblioteca não recebe nome nenhum, só ordem. Logo a associação
> peso↔campo **não pode** ser por nome, e os nomes das chaves enganam quem lê — o peso 0,7, escrito
> como `sparse`, chega primeiro, e a linha 177 declara `reqs=[dense_req, sparse_req]`. O que depende
> da biblioteca **estava** em aberto e agora está medido, no `pymilvus` 2.5.4 que o repositório pina:
> a assinatura é `WeightedRanker.__init__(self, *nums)` — só varargs. `WeightedRanker(0.7, 1.0)`
> guarda `_weights = [0.7, 1.0]`, e passar nome (`WeightedRanker(sparse=0.7, dense=1.0)`) levanta
> `TypeError`. Posição não é apenas o canal que o script usa: é o **único** que a biblioteca aceita.
> O que continua sem medição é só se o i-ésimo peso casa com `reqs[i]` dentro do `hybrid_search`. O que está verificado,
> independentemente da semântica da biblioteca, é a **incoerência**: a aula enuncia uma regra e o
> seu próprio exemplo canônico não a satisfaz.

### A escolha explícita, no `v3`

O `v3-Reranked` importa os dois rankers e torna a escolha um parâmetro:

```python
from pymilvus import AnnSearchRequest, WeightedRanker, RRFRanker   # linha 99
rerank_method = "rrf"  # options: 'weighted' or 'rrf'              # linha 106
```

E na linha 150 há um comentário do autor confirmando o desenho: _"Create a different reranker
depending on the selected rerank method"_.

Este é o arquivo para experimentar. Trocar `"rrf"` por `"weighted"` na linha 106 e comparar os
resultados na mesma consulta é o experimento controlado da aula — mesma busca, mesma coleção,
só a fusão muda.

---

## Parte 2 — Recuperação multimodal

`MultimodalRetrieval/` combina Milvus com **Visualized-BGE**, o modelo da Aula 08 que coloca
imagem e texto no mesmo espaço vetorial:

| Arquivo                                            | Papel                         |
| -------------------------------------------------- | ----------------------------- |
| `Milvus+Visual-BGE-MultimodalRetrieval-Chinese.py` | pipeline completo             |
| `Milvus+Visual-BGE-MultimodalRetrieval-English.py` | o mesmo, outra variante       |
| `Milvus+Visual-BGE-PureRetrievalProgram.py`        | só a recuperação, sobre um store já construído¹ |

E o nome engana aqui também, como na Parte 1. `Chinese.py` e `English.py` diferem em **duas
linhas**, as 37 e 38, e são o nome e o caminho do modelo: `BAAI/bge-m3` contra
`BAAI/bge-base-en-v1.5`. Os dois carregam o mesmo dataset em inglês, na mesma linha 76
(`Milvus+Visual-BGE-MultimodalRetrieval-Chinese.py:76`). O par nomeia o **modelo**, não o idioma
dos dados nem do código.

E, prática rara mas não exclusiva, o `10-AdvanceRAG/04-AgenticRAG/` também versiona três PNGs. Vale
olhar de onde eles vêm, porque só um corresponde a código vivo: o `02-LangChain-AdaptiveRAG.py:220`
grava `AdaptiveRAG-Graph.png`, sem o prefixo `02-` do arquivo commitado; o bloco que geraria o
`01-AgenticRAG-Graph.png` está inteiro comentado (`01-LangChain-AgenticRAG.py:180-188`); e nenhum
arquivo do repositório menciona o `02-AdaptiveRAG-Flow.png`. Aqui são **três imagens de saída**
versionadas:

- `search_results.jpg`
- `search_without_filter.jpg`
- `search_with_filter.jpg`

Os dois últimos nomes contam a história do módulo: é uma comparação **com e sem filtro
escalar**, aplicada a busca de imagens, e vale saber o que cada lado mostra antes de abri-las. O acervo tem 9 imagens, mas o `metadata.json` traz 10 entradas, porque `09.jpg` aparece duas vezes com títulos diferentes, e as 10 são inseridas. Com `limit=9`, o lado **sem filtro** devolve praticamente o acervo inteiro: não é demonstração de ordenação, é o corpus. O lado **com filtro** aplica `environment == "snowfield" and category == "combat"`, e como `category` vale `combat` nas 10 linhas, só o `environment` seleciona: **uma imagem**, com oito células vazias na grade. A comparação é entre os dois extremos, e é isso que ela ensina bem: filtro escalar não reordena, ele corta o candidato antes de a distância entrar na conta. Guardar o resultado visual faz sentido aqui, e é julgamento meu sobre o motivo: a saída
é visual — você _vê_ quais imagens foram recuperadas, e vê o filtro mudar o conjunto.

Isso conecta com a Aula 10 de forma direta: `03-filtered-search.py` mostrou a mecânica do filtro em
dados sintéticos; aqui ela aparece sobre imagens que você reconhece. O feedback visual é o ganho, e
o preço é que este corpus só permite o caso extremo: com uma linha sobrevivendo ao filtro, dá para
ver que o filtro cortou, não como ele reordena o que sobra.

O que "mesmo espaço vetorial" habilita, e vale enunciar sem exagero: você busca imagem
**escrevendo texto**, sem legenda, sem tag, sem metadado descritivo. O embedding do texto e o
da imagem são comparáveis porque o modelo foi treinado para isso. Note que o quanto isso
funciona bem depende do domínio — modelos multimodais são treinados em imagens genéricas da web,
e desempenho em imagens técnicas especializadas (radiografia, diagrama de engenharia) precisa
ser medido, não presumido.

O arquivo `PureRetrievalProgram` merece atenção pedagógica: separar "só a recuperação" do
pipeline completo é o que permite medir recuperação isoladamente — o hábito que a Aula 22 vai
formalizar.

---

## Mão na massa

⚠️ **Nenhum script desta aula precisa do servidor Milvus.** Os seis usam **Milvus Lite**, um banco
em arquivo local: `connections.connect(uri="./wukong.db")` no `v2`
(`Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:48`) e no `v3`
(`Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:48`); `MILVUS_URI = "./wukong_v4.db"`, literal na
linha 20 do `Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py`, apesar do nome sugerir variável de
ambiente; e `MilvusClient(uri="./wukong_images.db")` nos três multimodais
(`Milvus+Visual-BGE-MultimodalRetrieval-English.py:93`). O `.env.example` das duas pastas declara o
mesmo, em inglês: elas usam uma instância local. O `docker compose` de `04-VectorDB/Milvus/` serve
aos scripts daquela pasta, que apontam para `http://localhost:19530`
(`04-VectorDB/Milvus/01-CollectionsAndEntities/01-database.py:24`), e são os das Aulas 09 e 10.

```powershell
cd RAG-from-First-Principles/04-VectorDB
```

⚠️ **E instale uma dependência que a Aula 00 não instalou.** Os três scripts de `HybridRetrieval/`
importam `milvus_model.hybrid` (linha 30 do `v2`), e o `milvus-model` **não** está em nenhum dos dois
`requirements_*_NoGPU_Mac-Win.txt` (são dois arquivos, e nenhum o traz). Ele está em
`04-VectorDB/requirements.txt:6`, em `10-AdvanceRAG/requirements.txt:15` e em **dois dos quatro**
requirements de Ubuntu que a Aula 00 tabela: `requirements_langchain_Ubuntu-with-CPU.txt:263` e
`requirements_llamaindex_20250413_Ubuntu-with-GPU.txt:232`. Os dois não formam par, é um de cada
linha da tabela e de frameworks diferentes. Como a Aula 00 manda instalar os dois arquivos da sua
linha, quem seguiu o caminho Ubuntu acaba com o pacote de um jeito ou de outro. Sem ele o import falha
antes de qualquer conexão:

```powershell
pip install -r requirements.txt
```

¹ Este arquivo **não roda sozinho no clone**, e vale saber antes de tentar: ele consulta um store que
o pipeline completo cria, e depende de um peso de modelo (`.pth`) que não vem no repositório —
`find . -name "*.pth"` e `find . -name "*.db"` devolvem zero. O `visual_bge` também não está no PyPI;
o `04-VectorDB/requirements.txt` traz o comando de instalação a partir do GitHub. Rode primeiro o
pipeline completo, que constrói o store, e só então a recuperação pura.

Comece pelo mais legível, não pelo `v1`:

```powershell
cd HybridRetrieval
python "Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py"
```

Depois abra o `v1` e leia **apenas o bloco de inspeção de vetores esparsos**. Ver os pares
índice/valor é o que torna concreto o "vetor esparso" da Aula 08.

Então o experimento central:

```powershell
python "Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py"
```

Rode com `rerank_method = "rrf"` em
`04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py`, na linha 106; anote
os resultados, troque para `"weighted"` e
rode de novo. **Mesma consulta, fusão diferente.** As diferenças de ordenação são o assunto da
Aula 17.

Para o multimodal:

```powershell
cd ../MultimodalRetrieval
python "Milvus+Visual-BGE-PureRetrievalProgram.py"
```

E abra `search_without_filter.jpg` ao lado de `search_with_filter.jpg`, sabendo o que vai
encontrar: nove células preenchidas de um lado, uma e oito vazias do outro. A imagem não substitui
a explicação da Parte 2, ela mostra o extremo que a explicação descreve.

---

## Quebre de propósito

**1. Zere um dos pesos, e leia o nome da chave com desconfiança.** No `v2`, ponha
`weights["sparse"]` em 0. Pelo alerta da Parte 1, esse valor ocupa a **primeira** posição do
ranker, e a primeira requisição de `reqs=[dense_req, sparse_req]` é a densa: se a correspondência
for posicional, você acabou de zerar o **denso** e ficou com busca esparsa pura. Depois zere
`weights["dense"]` e confira que o comportamento troca. O resultado observado é, ele próprio, a
medição do pareamento que a aula deixou em aberto. Faça uma consulta com paráfrase e outra com **termo raro e literal**
do corpus — e note que o exemplo de identificador da tabela do "Modelo mental" (`SKU-88213-B`) **não
se reproduz aqui**: o corpus é o `battle_scenes.json`, cinco registros, e apesar do nome do arquivo só dois são de categoria `combat` (os outros são `scene`, `ability` e `story`); o único
campo parecido com identificador (`id`, valores como `COMBAT_001`) **nunca entra no texto indexado** —
o `v2` monta os documentos de `title` e `description` inteiros, mas só de **cinco subcampos** dos
dois objetos: `combat_style` e `abilities_used` de `combat_details`, e `location`, `environment` e
`time_of_day` de `scene_info` (`Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:11-22`). A distinção
decide o exercício: `Giant Mountain Spirit` é único no JSON e **não** está indexado, porque vive em
`combat_details.opponent`. Para
ver o esparso ganhar, use um nome próprio que caia em **um só documento indexado**: `White Bone
Spirit` está apenas no `COMBAT_002`. O `Water Curtain Cave` serve também, com uma ressalva que ilustra
o ponto anterior — ele aparece em dois registros do JSON, `SCENE_001` e `STORY_001`, e só o do
`SCENE_001` entra no texto indexado, porque a ocorrência do `STORY_001` vive em
`story_elements.location`, que o construtor de documentos ignora. Não use um SKU que o corpus não tem. A tabela do "Modelo mental" descreve o padrão; medi-lo
de verdade exigiria um corpus com identificadores indexados.

**2. Alinhe a ordem dos pesos — e note que você está consertando, não quebrando.** Em
`WeightedRanker(weights["sparse"], weights["dense"])` do `v2`, troque os dois argumentos para
`(weights["dense"], weights["sparse"])`, deixando `reqs=[dense_req, sparse_req]` como está. Se a
correspondência for posicional, é **isto** que faz os nomes das chaves valerem o que dizem — o
estado original é que estava trocado (ver o alerta da Parte 1). Rode antes e depois com a mesma
consulta e compare os rankings. Fixe o sintoma na direção certa: híbrido que se comporta como o
oposto do configurado é suspeita de ordem trocada, e aqui a suspeita se confirma **antes** de você
mexer em nada.

**3. Compare RRF e Weighted com pesos desequilibrados.** No `v3`, configure Weighted com 0,9
para um lado e compare com RRF na mesma consulta. O RRF é indiferente à sua intenção de
desequilíbrio — porque só olha posição. Isso mostra o que você ganha em robustez e perde em
controle.

**4. Busque imagem por texto que não existe no acervo.** No multimodal, procure algo
claramente ausente. O sistema devolve as imagens **menos distantes**, não "nada" — porque
top-k devolve k sempre que houver k candidatos. Repare que o `search_with_filter.jpg` deste mesmo
módulo é o contraexemplo: com o filtro cortando para uma linha, ele devolveu 1, não 9. É o
argumento para range search (Aula 10) ou para um limiar de similaridade.

---

## Armadilhas de produção

- **Ordem dos pesos.** Silenciosa e fácil de errar, como no exercício 2.
- **Pesos escolhidos por intuição.** O peso ótimo depende do corpus e da distribuição de
  consultas. Sem conjunto de avaliação, "0,7 denso / 0,3 esparso" é chute com aparência de
  configuração.
- **Dois índices, duas manutenções.** Reindexar passa a significar reconstruir os dois, e eles
  podem sair de sincronia se a ingestão falhar no meio.
- **Latência somada.** Duas buscas mais fusão. O híbrido nativo do Milvus mitiga porque funde
  no servidor, mas o custo não é zero — meça o p95.
- **Esparso mal tokenizado.** A Aula 08 já avisou: BM25 é tão bom quanto sua tokenização. Um
  híbrido com esparso ruim é um denso com latência extra.
- **Multimodal em domínio especializado.** Desempenho em imagem técnica não transfere de
  benchmark genérico. Meça no seu acervo antes de prometer.
- **Achar que híbrido dispensa reranking.** Fusão ordena; reranking reavalia relevância. São
  estágios diferentes, e o capítulo 7 existe depois deste de propósito.

---

## Checkpoint

1. Por que somar os scores de um retriever denso e um esparso diretamente é errado?
2. Qual a diferença de mecanismo entre `WeightedRanker` e `RRFRanker`? Qual dispensa scores
   comparáveis?
3. O que o RRF perde ao usar só posições?
4. Descreva os quatro passos do híbrido nativo do Milvus (`AnnSearchRequest` → ranker →
   `hybrid_search` → resultado). Onde a fusão acontece?
5. Por que a fusão no servidor é preferível à fusão no cliente?
6. Por que o arquivo chamado `v1-Minimal` é o maior dos três? O que "minimal" descreve?
7. O que a ordem dos argumentos de `WeightedRanker` exige que você respeite?
8. O que significa imagem e texto estarem no mesmo espaço vetorial, e o que isso habilita?
9. Por que o módulo multimodal versiona imagens de saída, e onde mais o repositório faz isso?
10. Cite três custos reais de adotar busca híbrida.

---

## Vocabulário

`hybrid search` · `RRF (Reciprocal Rank Fusion)` · `dense vector` · `sparse vector` ·
`BGE-M3` · `multimodal embedding` · `filtered search` · `reranking`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 10 — Índices ANN](AULA-10-indices-ann.md)
**Próxima:** [AULA 12 — Query construction: Text2SQL, Text2Cypher e filtros de metadados](AULA-12-query-construction.md)

> **Fase 3 concluída.** As Aulas 09, 10 e 11 cobrem `04-VectorDB/`: a estrutura (collection e
> schema), o índice (os cinco ANN e as métricas) e a busca combinada (híbrida e multimodal). Da
> Fase 4 em diante o assunto muda de lado: em vez de melhorar o índice, tratar **a pergunta**
> antes de buscar.
