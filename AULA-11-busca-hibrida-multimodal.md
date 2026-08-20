# AULA 11 — Busca híbrida densa + esparsa, e recuperação multimodal

**Fase 3 — Armazenamento e busca** · Módulo do repo: `04-VectorDB/HybridRetrieval/` (3 arquivos) e `/MultimodalRetrieval/` (3 scripts + 3 imagens)

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

RRF é mais robusto e menos ajustável. Weighted é mais ajustável e mais frágil. A Aula 17 volta
a isso com a aritmética do `k=60`.

---

## Parte 1 — Os três arquivos, e o que o nome esconde

`HybridRetrieval/` tem três variantes que usam BGE-M3 (o modelo da Aula 08, que emite denso e
esparso de uma vez) sobre Milvus:

| Arquivo                                        | Linhas  | Ranker                                   |
| ---------------------------------------------- | ------- | ---------------------------------------- |
| `Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py`  | **326** | `WeightedRanker` (L12)                   |
| `Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py` | 203     | `WeightedRanker` (L99)                   |
| `Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py` | 212     | `WeightedRanker` **e** `RRFRanker` (L99) |

⚠️ **O arquivo chamado "Minimal" é o maior dos três** — 326 linhas contra 203 e 212. O `diff`
explica por quê: o `v1` carrega um bloco extenso de **inspeção de vetores esparsos**, imprimindo
tipo, shape, índices de coluna e dados das primeiras posições, com `hasattr` para lidar com
formatos diferentes de matriz esparsa do `scipy`.

Ou seja, "minimal" descreve a **estratégia de fusão** (uma só, sem alternativas), não o tamanho
do arquivo. Se você abrir esperando o exemplo curto, vai se surpreender — e é mais um caso
deste curso em que o nome do arquivo promete algo diferente do que o código faz.

Esse bloco de inspeção, aliás, é a parte mais didática do `v1`: ele **mostra o que é um vetor
esparso** na prática — pares de índice e valor, em vez de uma lista densa de floats. Vale ler
antes de tratá-lo como abstração.

### O mecanismo, no `v2`

O `v2-Detailed` é o mais legível dos três. A sequência:

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
| `Milvus+Visual-BGE-PureRetrievalProgram.py`        | só a recuperação, sem o resto |

E — incomum no repositório — **três imagens de saída** versionadas:

- `search_results.jpg`
- `search_without_filter.jpg`
- `search_with_filter.jpg`

Os dois últimos nomes contam a história do módulo: é uma comparação **com e sem filtro
escalar**, aplicada a busca de imagens. O autor guardou o resultado visual porque aqui a saída
é visual — você _vê_ quais imagens foram recuperadas, e vê o filtro mudar o conjunto.

Isso conecta com a Aula 10 de forma direta: `03-filtered-search.py` mostrou a mecânica do
filtro em dados sintéticos; aqui o efeito do filtro aparece em imagens que você reconhece. É o
mesmo recurso, com feedback visual.

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

```powershell
cd RAG-from-First-Principles/04-VectorDB
docker compose up -d   # se ainda não estiver rodando (compose está em Milvus/)
```

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

E abra `search_without_filter.jpg` ao lado de `search_with_filter.jpg`. A comparação visual
economiza um parágrafo de explicação.

---

## Quebre de propósito

**1. Zere um dos pesos.** No `v2`, ponha o peso esparso em 0. Você reduziu o híbrido a busca
densa pura. Depois zere o denso. Faça uma consulta com identificador (`SKU-`, código de erro) e
outra com paráfrase — cada configuração vence em uma. É a tabela do "Modelo mental" medida.

**2. Inverta a ordem dos pesos.** Em `WeightedRanker(weights["sparse"], weights["dense"])`,
troque os dois argumentos sem trocar as requisições. Nenhum erro; a mistura inverte. Fixe o
sintoma: híbrido que se comporta como o oposto do configurado é suspeita de ordem trocada.

**3. Compare RRF e Weighted com pesos desequilibrados.** No `v3`, configure Weighted com 0,9
para um lado e compare com RRF na mesma consulta. O RRF é indiferente à sua intenção de
desequilíbrio — porque só olha posição. Isso mostra o que você ganha em robustez e perde em
controle.

**4. Busque imagem por texto que não existe no acervo.** No multimodal, procure algo
claramente ausente. O sistema devolve as imagens **menos distantes**, não "nada" — porque
top-k sempre devolve k. É o argumento para range search (Aula 10) ou para um limiar de
similaridade.

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
9. Por que o módulo multimodal versiona imagens de saída, algo que nenhum outro faz?
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
