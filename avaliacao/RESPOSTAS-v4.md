# RESPOSTAS-v4 — `@rag-specialist` (Vetor)

**Data das medições:** 2026-09-16 (todas as execuções deste documento são de hoje).

**Ambiente declarado:**

| Eixo | Valor |
| --- | --- |
| Clone da fonte | `E:/Projetos/rag/RAG-from-First-Principles`, `HEAD` em `17c6942`, `git status` vazio, nunca tocado |
| Repositório do curso | `E:/Projetos/rag/rag-auditado-ptbr`, nada escrito por mim |
| Interpretador pinado | `E:/tmp/rag-venv/Scripts/python.exe` (`langchain-core` 0.3.33, `pymilvus` 2.5.4, `llama-index-core` 0.12.15, `pydantic` 2.13.4, `setuptools` 80.10.2), confere com `ferramentas/montar-ambiente.sh:43-46` |
| Interpretador corrente | `E:/tmp/rag-venv-corrente/Scripts/python.exe` (`langchain-core` 1.6.3, `pydantic` 2.13.5) |
| Shell | Git Bash no Windows |
| Rede | disponível (o `vigia.js` consultou `git ls-remote` e o PyPI) |
| Instalações feitas | nenhuma |

**Registros usados**, conforme a seção 2 da minha definição: `fato verificado` traz `arquivo:linha` ou
comando; `conhecimento de domínio` é afirmado direto; `julgamento:` vem rotulado.

**Convenção de caminho, declarada porque os dois repositórios têm arquivos de mesmo nome.** Caminho
que começa com número de módulo (`00-` a `10-`, `90-`, `91-`, `92-`, `99-EN`) é do **clone**,
`RAG-from-First-Principles/`. Todo o resto (`AULA-*.md`, `README.md`, `HANDOFF.md`,
`PROMPT-CONTINUAR.md`, `GLOSSARIO.md`, `FATOS.md`, `ferramentas/*`, `agente/*`, `avaliacao/*`) é do
curso, `rag-auditado-ptbr/`.

**Verificador rodado, e o limite dele declarado.** `node ferramentas/verify-citations.js <este
arquivo>` foi executado e achou erro meu: um `BAD_ANCHOR` numa faixa que eu tinha escrito sem
repetir o arquivo, corrigido, e o relatório agora traz `BAD_ANCHOR: 0`.

Ele **não** serve de veredito sobre este documento, por escopo, e o modo de falha vale registrar
porque é o desta casa. Ele resolve todo caminho contra o clone da fonte, e os dois repositórios têm
um `README.md`: o do curso tem 356 linhas, o do clone tem 242. Este arquivo faz **23 ocorrências** de
citação ao `README.md` do curso, em **17 citações distintas**, cobrindo **33 linhas**. Dessas 23, o
verificador reprova **10**, as que trazem linha acima de 242, e **aprova as outras 13 contra o arquivo
errado**, porque a linha cabe nos dois. As 13 "OK" não valem nada aqui, e é exatamente a divisão que
o `README.md:335-340` do curso escreve: o verificador pega caminho inexistente e linha fora de
intervalo, não pega conteúdo.

O que fecha essa lacuna é conferência, não o portão: li as **33** linhas de `README.md` que cito, uma
a uma, com `sed -n "<N>p" README.md` na raiz do curso, e as 33 reproduzem o que afirmo.

`contagem.js` e `cauda.js` também rodaram sobre este arquivo. O `contagem.js` fecha em "Nenhuma
divergencia", depois de eu corrigir o único alerta dele. Os seis achados do `cauda.js` são citação
literal do `GATE` e repetição deliberada. Restam **4** `NO_ANCHOR`, todos nas questões `Q07` e `Q08`,
onde a faixa vem logo depois de o arquivo ser nomeado por extenso na mesma frase.

---

## Q01 `F`

**27 arquivos `.py`**, distribuídos assim pelos subdiretórios de primeiro nível:

| Subdiretório de primeiro nível | `.py` |
| --- | --- |
| `HybridRetrieval/` | 3 |
| `LlamaIndex/` | 0 |
| `Milvus/` | 21 |
| `MultimodalRetrieval/` | 3 |

Comando, rodado na raiz do clone:

```bash
find 04-VectorDB -type f -name '*.py' | wc -l
# 27
find 04-VectorDB -type f -name '*.py' | awk -F/ '{print $2}' | sort | uniq -c
#       3 HybridRetrieval
#      21 Milvus
#       3 MultimodalRetrieval
```

**O `LlamaIndex/` aparece com zero e por isso não sai no `uniq -c`.** Ele existe, tem 7 arquivos, e
nenhum é `.py`: um `.env.example`, o notebook `CreateLocalVectorStore-BuildIndex.ipynb` e cinco JSON
em `saved_index/`. Medido com `find 04-VectorDB -type f | awk -F/ '{print $2}' | sort | uniq -c`,
que devolve `4 HybridRetrieval · 7 LlamaIndex · 23 Milvus · 7 MultimodalRetrieval`, mais o
`.env.example` e o `requirements.txt` na raiz do módulo.

Dentro de `Milvus/`, os 21 se quebram em `01-CollectionsAndEntities/` 4, `02-Indexes/` 5,
`03-SearchAndMetrics/` 10, mais `a-working-sample.py` e `create_milvus_db.py` soltos na raiz do
subdiretório. Soma conferida: 4 + 5 + 10 + 2 = 21.

---

## Q02 `F`

**Os 27 importam `pymilvus`. Nenhum importa `weaviate`. Não há arquivo que importe os dois,
nem neste módulo nem no repositório inteiro.**

```bash
grep -rln --include='*.py' -E '^\s*(from|import)\s+pymilvus' 04-VectorDB/ | wc -l
# 27
grep -rn  --include='*.py' -iE '^\s*(from|import)\s+weaviate' 04-VectorDB/
# (nenhuma saída)
grep -rli 'weaviate' 04-VectorDB/
# (nenhuma saída: o termo não aparece nem em comentário, nem no requirements)
```

Caminhos, um por subdiretório, com a linha do import:

- `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:1` — `from pymilvus import MilvusClient, DataType`
- `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:99` — `from pymilvus import AnnSearchRequest, WeightedRanker, RRFRanker`
- `04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-PureRetrievalProgram.py:6` — `from pymilvus import MilvusClient`

**Onde o `weaviate` mora de fato**, porque "zero no módulo" não é "zero no repositório":

```bash
grep -rn --include='*.py' -E '^\s*(from|import)\s+weaviate' .
# ./10-AdvanceRAG/05-MultiModalRAG/01-Weaviate-Multimodal-Search.py:1,4,5
# ./10-AdvanceRAG/05-MultiModalRAG/02-Weaviate-Multimodal-RAG.py:5,6
```

São 2 arquivos, no módulo 10, com `docker-compose.yml` próprio no mesmo diretório. A busca pelos
dois juntos:

```bash
for f in $(grep -rl --include='*.py' -E '^\s*(from|import)\s+pymilvus' .); do
  grep -qE '^\s*(from|import)\s+weaviate' "$f" && echo "AMBOS: $f"
done
# (nenhuma saída, sobre os 37 .py do repositório que importam pymilvus)
```

---

## Q03 `A`

**A premissa embute três afirmações e as três estão erradas**, em graus diferentes.

**1. "O módulo ensina Milvus" é quase verdade, e a exceção está dentro dele.** O
`04-VectorDB/LlamaIndex/CreateLocalVectorStore-BuildIndex.ipynb` não menciona Milvus uma vez:
`grep -c -i 'milvus'` nele devolve `0`. Os imports que ele tem são
`from llama_index.core import SimpleDirectoryReader`, `... import VectorStoreIndex` e
`from llama_index.core.node_parser import SentenceSplitter`, e o produto dele são os cinco JSON de
`04-VectorDB/LlamaIndex/saved_index/`. É armazenamento vetorial local do LlamaIndex, não Milvus.

**2. "Todo script sobe um Milvus" confunde duas coisas que o módulo escreve diferente.** Dos 27
`.py`, **19 falam com um servidor e 8 usam arquivo local**:

| Forma | Quantos | Evidência |
| --- | --- | --- |
| Servidor, `uri="http://localhost:19530"` | 19 | `04-VectorDB/Milvus/02-Indexes/01-milvus_flat_index.py:5`, `04-VectorDB/Milvus/03-SearchAndMetrics/09-metadata-query.py:5` e `:128` |
| Arquivo local (Milvus Lite) | 8 | `04-VectorDB/Milvus/a-working-sample.py:25-26` (`db_path = "./wukong.db"`), `04-VectorDB/Milvus/create_milvus_db.py:30` (`"backend/db/snomed_bge_m3.db"`), `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py:20` (`"./wukong_v4.db"`), `-v2-Detailed.py:48` e `-v3-Reranked.py:48` (`connections.connect(uri="./wukong.db")`), `04-VectorDB/MultimodalRetrieval/...-Chinese.py:93` e `...-English.py:93` (`"./wukong_images.db"`), `...-PureRetrievalProgram.py:34` com o caminho vindo do `__main__` em `:143` |

19 + 8 = 27, e o comando que separa é
`grep -rn --include='*.py' -E 'MilvusClient\(|uri\s*=|connections\.connect' 04-VectorDB/`.

**3. Mesmo nos 19, o script não sobe nada: ele conecta.** Um `MilvusClient(uri="http://localhost:19530")`
falha se não houver servidor de pé; quem sobe o servidor é o leitor, fora do script. O próprio
módulo diz isso em `04-VectorDB/.env.example:1-3`: os scripts usam "modelos de embedding locais
(BGE-M3 / Visual-BGE) e uma instância local de Milvus", ou seja, a instância é pressuposto, não
produto.

**O que é verdade:** o módulo é sobre Milvus, e a API `pymilvus` está em 27 de 27 `.py` (Q02). O que
ele ensina é `pymilvus` contra duas implantações diferentes, servidor e embutida, e uma pasta dele
não usa Milvus nenhum.

**Limite declarado:** não executei nenhum dos dois caminhos. O `milvus_lite` não está no ambiente
pinado, por decisão escrita em `ferramentas/montar-ambiente.sh:16-17`, e eu confirmei:
`importlib.util.find_spec('milvus_lite')` devolve `None` e `MilvusClient(uri='./x.db')` levanta
`ModuleNotFoundError: No module named 'milvus_lite'` no interpretador pinado. A separação acima é
leitura de código, não execução.

---

## Q04 `C`

**Os dois números diferem porque medem objetos diferentes: "importa" é uma linha, "usa" é um caminho
de execução.** Entre um e outro cabem, no mínimo, quatro casos:

1. **Import morto.** O símbolo entra no espaço de nomes e nada o chama. Medido hoje no repositório,
   `10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:18` traz
   `from langgraph.prebuilt import ToolNode, tools_condition`, e `grep -n 'ToolNode\|tools_condition'`
   no arquivo devolve **só essa linha**. O arquivo parece usar o grafo pré-fabricado do LangGraph e
   não usa.
2. **Uso sem import direto.** Um pacote chamado por reexportação, por string de configuração ou por
   plugin não aparece na busca de import.
3. **Import condicional ou tardio**, dentro de `if` ou de função, que uma busca por linha inicial
   não vê. `04-VectorDB/Milvus/03-SearchAndMetrics/09-metadata-query.py:125` importa `connections` e
   `Collection` na linha 125, no meio do arquivo, depois de o `MilvusClient` já ter sido usado.
4. **Arquivo que não é `.py`.** O notebook do `04-VectorDB/LlamaIndex/` ensina indexação vetorial e
   nenhuma contagem de `.py` o alcança (Q01, Q03).

**Qual dos dois sustenta afirmação sobre o que o módulo ensina: nenhum dos dois sozinho, e entre os
dois, "usa".** Import é o que o autor escreveu; uso é o que o leitor vai executar. Uma aula que
afirma "o módulo ensina X" está afirmando sobre comportamento, e comportamento se lê no caminho de
execução. É a regra 8 do meu protocolo, e ela existe porque ler o que está escrito não é ler o que
roda.

**A régua prática:** contar import é barato e serve de **triagem**; a afirmação se fecha abrindo os
arquivos que a triagem devolveu. Quando isso é caro, o correto é declarar o que foi contado, com o
comando, e não trocar de substantivo no meio do caminho.

**Medição de controle neste módulo:** varri os 27 `.py` de `04-VectorDB` comparando cada símbolo
importado de `pymilvus` contra o restante do arquivo, e **não achei nenhum símbolo morto**. Aqui,
para `pymilvus`, os dois números coincidem. Isso é resultado medido neste módulo, não propriedade
geral do repositório, como o caso 1 acima mostra.

---

## Q05 `F`

**Sim. Em `04-VectorDB/Milvus/` aparecem quatro valores distintos de `metric_type`: `L2`, `IP`,
`COSINE` e `BM25`.**

```bash
grep -rn --include='*.py' 'metric_type' 04-VectorDB/Milvus/
```

| Valor | Onde, com a linha | Forma |
| --- | --- | --- |
| `L2` | `02-Indexes/01-milvus_flat_index.py:34`, `02-Indexes/05-DiskANN.py:34`, `03-SearchAndMetrics/01-basic-ann.py:34` e `:56`, e mais 13 arquivos | literal, no índice e no `search_params` |
| `IP` | `03-SearchAndMetrics/02-ann-diff-metrics.py:15` | dentro da lista `metric_types = ["L2", "IP", "COSINE"]`, consumida em `:50` como `metric_type=metric_type` |
| `COSINE` | `03-SearchAndMetrics/02-ann-diff-metrics.py:15` (mesma lista) e `create_milvus_db.py:86` | na lista, e literal em `metric_type="COSINE",  # use cosine similarity as the vector similarity metric` |
| `BM25` | `03-SearchAndMetrics/06-full-text-search-bm25-ch.py:42` e `06-full-text-search-bm25-en.py:42` | literal, sobre `index_type="SPARSE_INVERTED_INDEX"` em `:41` |

**Duas ressalvas que a leitura do `grep` cru não dá:**

**O `05-DiskANN.py:34` não é um quarto valor.** A linha é
`metric_type="L2",  # Supports L2, IP, or COSINE`. `IP` e `COSINE` ali estão em **comentário**, não
em declaração. Quem contasse por ocorrência de string acharia valor onde não há decisão.

**O par `-ch` / `-en` foi conferido com `diff`, e não pelo sufixo do nome**, que é a regra 7 do meu
protocolo:

```bash
diff 04-VectorDB/Milvus/03-SearchAndMetrics/06-full-text-search-bm25-ch.py \
     04-VectorDB/Milvus/03-SearchAndMetrics/06-full-text-search-bm25-en.py
# 61c61
# <     {'text': 'Information retrieval is a research field.'},
# ---
# >     {'text': 'Information retrieval is a field of study.'},
# 81c81
# < query_text = "information"
# ---
# > query_text = "information retrieval"
```

Os dois diferem em **duas linhas de texto de exemplo**, e em mais nada. O sufixo `-ch`/`-en` não
corresponde a analisador de idioma diferente nem a `metric_type` diferente: os dois declaram `BM25`
com os mesmos `bm25_k1: 1.2` e `bm25_b: 0.75` (`:44-46` nos dois).

---

## Q06 `A`

**Não. `IndexFlatL2` é duas decisões num nome só, e `metric_type="L2"` é uma delas.**

`faiss.IndexFlatL2(dimension)` (`00-SimpleRAG/05_RAG_from_Scratch_Ollama.py:30`) fixa, no mesmo
construtor, **a estrutura do índice** (`Flat`, varredura exaustiva, sem aproximação) e **a métrica**
(`L2`). Trocar a métrica em FAISS significa trocar de classe, para `IndexFlatIP`.

Em Milvus a métrica e a estrutura são parâmetros ortogonais da mesma chamada, `metric_type` e
`index_type`, e o módulo prova a ortogonalidade em cinco arquivos:

| Arquivo | `metric_type` | `index_type` |
| --- | --- | --- |
| `04-VectorDB/Milvus/02-Indexes/01-milvus_flat_index.py:34-35` | `"L2"` | `"FLAT"` |
| `04-VectorDB/Milvus/02-Indexes/02-ivf_flat_index.py:34-35` | `"L2"` | `"IVF_FLAT"` |
| `04-VectorDB/Milvus/02-Indexes/03-ivf_pq_index.py:34-35` | `"L2"` | `"IVF_PQ"` |
| `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:34-35` | `"L2"` | `"HNSW"` |
| `04-VectorDB/Milvus/02-Indexes/05-DiskANN.py:34-35` | `"L2"` | `"DISKANN"` |

**O mesmo `metric_type="L2"` aparece com cinco estruturas diferentes.** Só o primeiro par equivale a
`IndexFlatL2`. Os outros quatro têm a mesma métrica e uma decisão de recall, memória e latência
completamente diferente: é justamente a decisão que `IndexFlatL2` esconde por não ter como nomear
separado.

**Duas assimetrias a mais, medidas:**

**Em Milvus a métrica é declarada duas vezes, e nos dois momentos.** Em
`04-VectorDB/Milvus/03-SearchAndMetrics/01-basic-ann.py`, `metric_type="L2"` na construção do índice
(`:34`) e `search_params={"metric_type": "L2"}` na busca (`:56`, `:72`, `:88`). Em FAISS a métrica
existe uma vez, na construção. São modelos diferentes de onde a decisão vive, e isso importa: em
Milvus há uma superfície onde as duas podem divergir.

**Milvus tem `metric_type` que não é métrica de vetor denso.** `metric_type="BM25"` sobre
`index_type="SPARSE_INVERTED_INDEX"` (`03-SearchAndMetrics/06-full-text-search-bm25-en.py:41-42`)
não tem análogo de classe em FAISS.

**Conhecimento de domínio, marcado como tal:** `IndexFlatL2` do FAISS devolve distância euclidiana
**ao quadrado**, e o ranking é o mesmo da euclidiana, mas o número não é. Não medi isso aqui: o
`faiss` está fora do ambiente pinado, por decisão escrita em `ferramentas/montar-ambiente.sh:16-17`.
Se alguém for comparar escores entre as duas bibliotecas, é o primeiro experimento a fazer.

**Julgamento:** a premissa da pergunta é a forma mais cara de erro de portabilidade, porque ela
passa no teste. Quem traduz `IndexFlatL2` para `metric_type="L2"` e deixa o `index_type` no default
troca varredura exaustiva por índice aproximado sem perceber, e a diferença sai como recall pior,
não como exceção.

---

## Q07 `F`

**Cria:** `04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-MultimodalRetrieval-English.py:97-102`

```python
milvus_client.create_collection(
    collection_name=collection_name,
    dimension=dim,
    auto_id=True,
    enable_dynamic_field=True
)
```

O alvo é `collection_name = "wukong_scenes"` (`:92`) dentro de
`MilvusClient(uri="./wukong_images.db")` (`:93`), a dimensão vem do modelo em `:96`
(`dim = len(list(image_dict.values())[0])`), e o `insert` está em `:123-126`.

**Apenas consulta:** `04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-PureRetrievalProgram.py:71-82`

```python
        results = self.client.search(
            collection_name=self.collection_name,
            data=[query_vector],
            filter=filter_expr,
            limit=limit,
```

A prova de que ele **só** consulta não é o nome do arquivo nem a docstring de `:1-3`
("performs retrieval against an already-built Milvus vector store"), que são caminho e prosa. É
esta busca, que não casa nada:

```bash
grep -nE 'create_collection|\.insert\(|drop_collection|create_index|create_schema' \
  04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-PureRetrievalProgram.py
# (nenhuma saída, exit 1)
```

E o `__main__` do arquivo aponta exatamente para o que o primeiro construiu:
`searcher = MilvusSearcher("./wukong_images.db", "wukong_scenes")` (`:143`), mesmo arquivo de banco
e mesmo nome de coleção do `:92-93` do outro script.

**O que acontece se o segundo rodar antes do primeiro.** O `MilvusClient` abre um arquivo de banco
vazio, a coleção `wukong_scenes` não existe, e o `search` de `:71` falha. Ele falha **antes** disso,
aliás: o `WukongEncoder.__init__` de `:16` carrega o `Visualized_BGE` e o `:140` aponta para
`./Visualized_base_en_v1.5.pth`, um peso que o repositório não traz. A diferença que importa é que
nenhuma das duas falhas é sutil: são exceções, não resultado errado.

**`NÃO_EXECUTADO`, e digo o que falta.** Não rodei nenhum dos dois. O `milvus_lite` está fora do
ambiente pinado por decisão escrita em `ferramentas/montar-ambiente.sh:16-17`, e eu confirmei hoje
no interpretador pinado que `importlib.util.find_spec('milvus_lite')` devolve `None` e que
`MilvusClient(uri='./sonda.db')` levanta `ModuleNotFoundError: No module named 'milvus_lite'`. O que
decidiria a forma exata da exceção é um ambiente com `milvus-lite` instalado, fora do pinado, rodando
o `PureRetrievalProgram` com um `.pth` disponível contra um `wukong_images.db` recém-criado. O tipo e
a mensagem da exceção eu **não** afirmo.

---

## Q08 `J`

**O caso é real e é neste módulo, então respondo sobre ele em vez de em abstrato.**

`Milvus+Visual-BGE-MultimodalRetrieval-Chinese.py` e `...-English.py` diferem em duas linhas,
conferidas com `diff` e não pelo sufixo:

```bash
diff 04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-MultimodalRetrieval-Chinese.py \
     04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-MultimodalRetrieval-English.py
# 37,38c37,38
# < model_name = "BAAI/bge-m3"
# < model_path = "./Visualized_m3.pth"
# ---
# > model_name = "BAAI/bge-base-en-v1.5"
# > model_path = "./Visualized_base_en_v1.5.pth"
```

**Modelos diferentes, e o mesmo destino:** os dois escrevem em `"./wukong_images.db"` (`:93` nos
dois) na coleção `"wukong_scenes"` (`:92` nos dois), com `dimension=dim` derivado do modelo (`:96`),
e **nenhum dos dois chama `drop_collection`** (`grep` por `drop_collection` em
`04-VectorDB/MultimodalRetrieval/` não casa nada). O `PureRetrievalProgram` lê desse mesmo par
(`:143`). Quem rodar os dois na ordem A depois B, e depois o terceiro, obtém um resultado; quem
rodar B depois A obtém outro.

**De quem é o defeito: dos três, e em proporções diferentes.**

**Do script, e é a menor parte.** Um script de demonstração que escolhe um nome de banco fixo não
está errado sozinho. O que ele deixou de fazer foi declarar o pré-requisito em uma linha.

**Do módulo, e é a maior parte.** O defeito não existe em nenhum arquivo: ele existe na **relação**
entre três arquivos que compartilham estado por um caminho de disco e não têm ordenação declarada.
Os demais scripts do módulo são numerados (`01-`, `02-`, `03-`), que é exatamente a convenção que
declara ordem, e os três de `MultimodalRetrieval/` não são. É defeito de organização do módulo.

**Da aula, e é a parte que me cabe.** Uma aula que descreve esses arquivos e não diz "o
`PureRetrievalProgram` pressupõe que um dos dois anteriores já rodou, e o último a rodar decide qual
modelo indexou" está transmitindo um resultado como reprodutível quando ele é dependente de ordem.
Aqui vale a régua desta casa: o material não pode consertar o repositório, **e pode deixar de
esconder o que ele faz**.

**O que eu faria, nesta ordem, e é julgamento de engenharia:**

1. **Medir antes de escrever.** Montar `milvus-lite` num ambiente separado, jamais no pinado, e rodar
   as três permutações, registrando o que cada uma produz. Hoje isso é `NÃO_EXECUTADO` (Q07), e sem
   isso eu tenho mecanismo lido, não comportamento medido.
2. **Escrever na aula a dependência de ordem**, com as linhas que a produzem (`:92`, `:93`, `:96` nos
   dois, `:143` no terceiro), e não uma prescrição genérica sobre estado compartilhado.
3. **Não tocar no clone.** Corrigir o script seria a solução mais barata e é a que o contrato desta
   auditoria proíbe: o clone tem de seguir idêntico ao upstream da Packt.
4. **Propor o conserto como exercício do curso**, que é onde a correção pode viver sem quebrar o
   contrato: nome de banco por variável, ou `drop_collection` antes de criar.

**O que eu não faço:** não afirmo que rodar B depois de A levanta exceção de dimensão em vez de
sobrescrever silenciosamente. As duas hipóteses são compatíveis com o que li, e escolher entre elas
é o experimento do item 1. Dizer "é o pior caso possível" seria superlativo sem medição, e a regra 5
do meu protocolo o proíbe.

---

## Q09 `C`

| Registro | Definição em uma frase |
| --- | --- |
| **Medido** | o comportamento foi observado numa execução, num ambiente cuja versão está declarada |
| **Documentado** | a afirmação vem do que a biblioteca ou o repositório **diz** de si, em requirements, docstring, changelog ou manual |
| **Lido** | a afirmação vem do código-fonte da biblioteca, aberto e compreendido, sem execução |

**A afirmação que só um deles autoriza, uma para cada:**

**Só "medido" autoriza:** "no `langchain-core` 0.3.33 o `BaseChatModel` define `__call__`, e no 1.6.3
não define". Medido hoje, nos dois interpretadores:

```bash
"E:/tmp/rag-venv/Scripts/python.exe" -c "... '__call__' in BaseChatModel.__dict__"
# langchain-core 0.3.33 -> True   / BaseRetriever.get_relevant_documents -> True
"E:/tmp/rag-venv-corrente/Scripts/python.exe" -c "..."
# langchain-core 1.6.3  -> False  / BaseRetriever.get_relevant_documents -> False
```

**Só "documentado" autoriza:** "o `10-AdvanceRAG/requirements.txt` deixa o `llama-index-core` livre,
sem `==`", que é afirmação sobre o que o arquivo declara e se decide lendo o arquivo. A AULA-24 usa
essa forma em `AULA-24-contextual-retrieval.md:136-137`.

**Só "lido" autoriza:** "o default de `metadata_mode` em `TextNode.get_content` é
`MetadataMode.NONE`, então o BM25 não vê o metadado", que é o que a
`AULA-24-contextual-retrieval.md:137-142` escreve, e escreve marcado: `lido, não executado:`.

**O acervo carrega os três marcadores:** `AULA-20-saida-estruturada.md:50` diz
"Esse segundo ramo foi **lido, não executado**" e cinco linhas depois, em `:55`, diz
"**Medido** no `langchain-core` 0.3.33". A mesma passagem, dois registros, separados na frase.
`AULA-06-tabelas-csv-sql.md:125-130` abre uma seção inteira, "O que não se mede no ambiente de
verificação deste curso", e fixa que toda afirmação sobre `unstructured`, `camelot` e `pdfplumber`
sai marcada `NÃO_EXECUTADO`.

**A ordem de força é medido > lido > documentado**, e não é óbvia. Documentação é o registro mais
fraco porque descreve intenção: um changelog que anuncia depreciação não diz em qual versão a
remoção chegou. Fonte lida é mais forte que documentação e mais fraca que execução, pelo motivo da
Q10.

---

## Q10 `A`

**Não, e a inversão está na segunda metade da frase: ler o fonte não é mais confiável que executar.**

**A escala do repositório é o contrário da premissa**, e está escrita em
`ferramentas/montar-ambiente.sh:6-7`: "Sem ambiente, alegacao sobre comportamento de biblioteca vira
leitura de codigo, que e hipotese". Leitura de fonte é **hipótese sobre o que vai acontecer**;
execução é **o que aconteceu**.

**Quatro coisas que a leitura não decide, e a execução decide:**

1. **Qual código está instalado.** Você leu o fonte de uma versão; o ambiente do leitor resolve
   outra. Foi exatamente isso que `montar-ambiente.sh:48-52` documenta ter acontecido aqui: um `pip`
   por pacote promoveu o `langchain-core` de 0.3.33 para 0.3.86, e a conferência daquela versão do
   script só imprimia a versão em vez de compará-la, então o desvio passou.
2. **Qual ramo roda.** Despacho dinâmico, `__getattr__`, decorador, monkey patch e reexportação
   separam o arquivo que você abriu do código que executa.
3. **O que a dependência faz no meio.** `AULA-20:50-54` é exemplar disso: o que se leu no
   `llama-index-core` foi o **análogo da mesma família** porque o
   `llama-index-program-openai` não está no ambiente, e a aula diz isso na própria frase.
4. **Se importa sequer carrega.** O ambiente pinado emite hoje, em toda execução de `pymilvus`, o
   aviso `pkg_resources is deprecated`, que só aparece rodando, e que é a razão do `setuptools<81`
   em `montar-ambiente.sh:39-41`.

**O que a leitura de fonte autoriza, e não é pouco:** afirmar o mecanismo, com a assinatura copiada e
o caminho da chamada, marcado como lido. A `AULA-24:139-142` faz isso corretamente, nomeando
`metadata_mode: MetadataMode = MetadataMode.NONE` como default da assinatura e o ramo
`if mode == MetadataMode.NONE`.

**A permissão de ler fonte é recente aqui e é distinta de medir.** `HANDOFF.md:56-58` registra que
"ler fonte de biblioteca passou a ser **autorizado** (o contrato antigo confundia *ler* com
*instalar*)". Autorizado a ler não é autorizado a escrever "medido".

**Onde a premissa acerta:** ler o fonte é mais confiável que a **documentação**, e frequentemente é
o único caminho quando a versão não está instalável. O erro é o salto de registro, não a leitura.

---

## Q11 `F`

**Não fixa tudo. São 13 pacotes com `==`, um com limite superior e dois sem versão nenhuma.**

**Os 13 com `==`**, em `ferramentas/montar-ambiente.sh:43-46`:

```
PINS="langchain==0.3.17 langchain-core==0.3.33 langchain-community==0.3.16 \
langchain-openai==0.3.3 langchain-text-splitters==0.3.5 langgraph==0.2.69 \
pymilvus==2.5.4 llama-index-core==0.12.15 ragas==0.2.15 pydantic==2.13.4 \
openai==1.109.1 numpy==1.26.4 rank-bm25==0.2.2"
```

**Os três sem `==`, todos na linha 41:**

```
"$PY" -m pip install --quiet --upgrade pip "setuptools<81" wheel
```

| Pacote | Como está | Consequência |
| --- | --- | --- |
| `pip` | sem versão, com `--upgrade` | pega a mais nova do dia da execução |
| `wheel` | sem versão, com `--upgrade` | idem |
| `setuptools` | `<81`, limite superior sem piso | qualquer versão abaixo de 81 satisfaz |

**O `setuptools<81` é intencional e está justificado em `:39-40`:** "o pymilvus 2.5.4 importa
pkg_resources, que o setuptools removeu na 81". É restrição de compatibilidade, não pin de medição.

**O bloco de conferência de `:57-101` confere os 13 e o `setuptools`, e não confere `pip` nem
`wheel`.** O dicionário `esperado` de `:61-69` tem exatamente as 13 entradas; `:83-88` trata o
`setuptools` à parte, com `int(st.split(".")[0]) < 81`. Quem lesse "todos os pins conferem" (`:100`)
como "tudo que o script instala está fixado" estaria lendo mais do que o script diz.

**Medido hoje** no ambiente que ele monta, `E:/tmp/rag-venv`: as 13 versões batem, e o `setuptools`
está em 80.10.2, dentro do limite.

**Julgamento:** `pip` e `wheel` soltos são a escolha certa. Eles não entram em nenhuma medição de
comportamento, e pinar ferramenta de instalação é a forma mais rápida de um ambiente parar de montar
por motivo alheio ao que se quer medir. O que faltaria seria o script **declarar** isso, já que a
frase final "Todos os pins conferem" é lida como cobertura total.

---

## Q12 `J`

**A ordem importa mais que qualquer item isolado, e o primeiro passo é não fazer a coisa óbvia.**

**1. Não instalo no ambiente pinado.** É a proibição de contrato: o pinado é a régua contra a qual
todas as medições anteriores foram feitas, e mexer nele responde uma pergunta invalidando todas as
outras. É a mesma lógica da seção 7 da minha definição quanto a repinar a fonte.

**2. Pergunto se a afirmação precisa de execução.** Boa parte do que parece comportamento é conteúdo
de arquivo: "o repositório pina X", "o requirements deixa livre", "a assinatura tem este default".
Isso se decide com `grep -n` e `verify-citations.js`, e não custa ambiente nenhum.

**3. Rodo `node ferramentas/vigia.js`** para saber em que versão a biblioteca está pinada, em que
versão o PyPI está, e **quais aulas** carregam a afirmação. O vigia já nomeia as aulas, e sem isso eu
consertaria uma superfície e deixaria as outras.

**4. Classifico o pacote contra `ferramentas/montar-ambiente.sh`.** Duas saídas diferentes:

- **Está na lista de exclusão de `:16-17`** (`torch`, `chromadb`, `onnxruntime`,
  `sentence-transformers`, `transformers`, `weaviate`, `deepeval`, `trulens`, `camelot`,
  `unstructured`, `faiss`, `milvus_lite`): a ausência é **limite legítimo declarado**, e o caminho é
  escrever a afirmação marcada `NÃO_EXECUTADO`, com o que falta. O precedente é
  `AULA-06-tabelas-csv-sql.md:125-130`, que abre seção para isso.
- **Está nos 13 pins de `:43-46` e só não está no disco**: reconstruo, com
  `bash ferramentas/montar-ambiente.sh <destino>`, e o destino vai **fora do repositório e fora do
  scratchpad** (`:22`). Esse detalhe não é preciosismo: `:4-5` registra que o venv anterior vivia no
  scratchpad e foi apagado sem aviso em 14/09/2026, levando 17 scripts junto.

**5. Se a versão que interessa não é a pinada, monto um segundo ambiente**, nunca substituindo o
primeiro. É o ciclo que a minha seção 7 descreve e que eu reproduzi hoje: `langchain-core` 0.3.33 no
pinado e 1.6.3 no corrente, medidos lado a lado, `__call__` presente num e ausente no outro.

**6. Confiro o pin antes de medir, não só a presença.** O script faz isso em `:56-101`, e a razão
está em `:48-52`: instalar em sequência promoveu o `langchain-core` para 0.3.86 e a conferência de
então só imprimia a versão. Ambiente que parece montado e não é vale menos que ambiente ausente,
porque ausente eu declaro.

**7. Escrevo as duas versões lado a lado**, com o número e a versão juntos na mesma frase, e não uma
substituindo a outra.

**O que eu não faço, e por quê:**

- **Não instalo nada no pinado**, item 1.
- **Não troco o número na aula sem remedir.** Trocar "0.12.15" por "0.14.24" no texto produz uma
  afirmação nova que ninguém verificou, que é corrigir invenção inventando outro detalhe.
- **Não chamo leitura de fonte de "medido"**, Q10.
- **Não declaro "não dá para verificar" antes de tentar.** É a regra 10 do meu protocolo: o v1 errou
  afirmando sem verificar e o v2 errou recusando-se a verificar. Montar ambiente custa minutos, e
  declarar limite no lugar de trabalho barato é evasão disfarçada de rigor.
- **Não peço repinagem por conta própria.** Repinar é reauditar, e reauditar é decisão de quem paga
  a rodada.

---

## Q13 `F`

**`ferramentas/` tem 16 arquivos fora do diretório `testes/`. `ferramentas/testes/` tem 15 suítes.
A que fica de fora é o `montar-ambiente.sh`.**

```bash
ls -1 ferramentas/ | grep -v '^testes$' | wc -l          # 16
ls -1 ferramentas/testes/*.test.js | wc -l               # 15
comm -23 <(ls -1 ferramentas/ | grep -v '^testes$' | sed 's/\.js$//;s/\.sh$//' | sort) \
         <(ls -1 ferramentas/testes/*.test.js | sed 's#.*/##;s/\.test\.js$//' | sort)
# montar-ambiente
```

Os 16: `cauda.js`, `contagem.js`, `decisoes.js`, `dod.js`, `entreaulas.js`, `eol.js`, `fechos.js`,
`gerar-fatos.js`, `lock.js`, `montar-ambiente.sh`, `portao.js`, `requebra.js`, `residuo.js`,
`superficies.js`, `verify-citations.js`, `vigia.js`. Quinze são `.js` e cada um tem a sua
`<nome>.test.js`; o décimo sexto é o shell script.

**A conta do repositório é 15 e 15**, e ela também está certa: `README.md:296-297` diz "O curso tem
**quinze** ferramentas em `ferramentas/`, com **quinze suítes**", e `README.md:91` repete. O
`montar-ambiente.sh` aparece na tabela de comandos do `README.md:322` sem entrar naquele quinze. As
duas leituras diferem no que contam, arquivos ou ferramentas em `node`, e eu declaro as duas em vez
de escolher, porque a `Q30` vai reusar o número.

**Por que ele fica de fora, e aqui separo o que é mecânico do que é julgamento.**

**Mecânico, e é fato:** `ferramentas/testes/rodar.sh:10` itera sobre `"$(dirname "$0")"/*.test.js` e
executa `node "$t" --provar` (`:12`). O laço é de suíte em `node`, por construção. E a exigência da
linha 12, positivo plantado, precisa de um ponto onde cegar a comparação central; um instalador não
tem comparação central para cegar.

**Julgamento de engenharia:** exercitar o `montar-ambiente.sh` de verdade significa criar venv e
chamar `pip` pela rede. A suíte testaria o `pip` e o PyPI, levaria minutos e ficaria vermelha por
motivo alheio, o que é o inverso do que a suíte deste projeto serve para fazer. O repositório **não
declara essa razão em lugar nenhum**: `node ferramentas/decisoes.js "montar-ambiente"` devolve zero
seções no `GATE` e zero commits no assunto. Estou preenchendo uma lacuna do acervo, e marco como
preenchimento.

**O que substitui a suíte, e isso é fato:** a condição 8 do DoD verifica o script por outro eixo. Em
`ferramentas/dod.js:82-89`, "Ambiente reprodutível" decide por `git ls-files --error-unmatch
ferramentas/montar-ambiente.sh`, ou seja, exige que ele esteja **versionado** e não só presente no
disco, com o comentário de `:85-86`: "arquivo solto no disco nao reconstroi nada para quem clonar".
Rodado hoje, passa.

**Alerta de leitura, não achado meu a corrigir:** `README.md:298-299` diz "As duas primeiras
nasceram depois que o gate v1 ... as outras dez nasceram durante a auditoria adversarial". 2 + 10 =
12, e o mesmo parágrafo abre com quinze. É a família da regra 11, numeral solto sem referente
enumerado, numa superfície viva. Não toquei: não corrijo artefato durante prova.

---

## Q14 `C`

**A diferença de objeto é uma preposição: o `fechos.js` olha DENTRO de um arquivo, o `superficies.js`
olha ATRAVÉS do acervo.** Está escrito no cabeçalho do segundo, `ferramentas/superficies.js:15-16`:
"O `fechos.js` enumera superficie de fecho DENTRO de um arquivo. Este enumera arquivos ATRAVES do
acervo. Sao complementares e nenhum substitui o outro."

| | `fechos.js` | `superficies.js` |
| --- | --- | --- |
| Entrada | um intervalo do `git`, ou o diff de trabalho (`:14-15`) | um ou mais termos (`:76-80`) |
| Escopo | só `AULA-*.md` tocadas pelo diff (`:34`) | aulas, `README`, `HANDOFF`, `PROMPT-CONTINUAR`, `GLOSSARIO`, `FATOS`, `agente/*.md` (`:46-50`) |
| O que devolve | as quatro classes de fecho do arquivo, marcando quais o diff já alterou (`:26-31`, `:44-47`) | em que arquivos o termo aparece, separando **viva** de **registro** (`:89-111`) |
| Pergunta que responde | "o que mais neste arquivo ainda fala a versão antiga?" | "onde mais este fato mora, e quem tem de concordar?" |

**Um caso em que um acha e o outro não, medido hoje** sobre o commit `91792e0`, que tocou AULA-19,
AULA-21, AULA-22 e `README.md`:

```bash
node ferramentas/fechos.js "91792e0~1..91792e0"
```

Ele lista AULA-19, 21 e 22, e para a AULA-19 imprime `Checkpoint 20/20 · Titulo 29/29 · Rodape 2/2 ·
Tabela 11/11 (a conferir / total)`, com 62 superfícies nominais a reler, entre elas
`Titulo :356  **Três imports não são usados.**`. **Nada disso é alcançável pelo `superficies.js`**,
porque não há termo: são linhas do mesmo arquivo que o conserto não tocou.

**E o `README.md` não aparece na saída do `fechos.js`**, embora o commit o tenha alterado, porque o
filtro de `fechos.js:34` só admite `AULA-*.md`. A mensagem daquele commit diz que o defeito no
`README` era um número, `2192` onde o comando já devolvia `2193`.

Na direção inversa:

```bash
node ferramentas/superficies.js "rlm/rag-prompt"
```

devolve 11 ocorrências em 5 superfícies vivas: AULA-19, AULA-21, AULA-22, **AULA-26** e
**`HANDOFF.md`**. As duas últimas o commit não tocou, e o `fechos.js` não tem como vê-las, porque ele
só enxerga o que está no diff.

**Resumo operacional, e é julgamento:** `superficies.js` é o primeiro comando de uma varredura,
porque define o conjunto; `fechos.js` é o último de cada arquivo, porque fecha o que sobrou dentro
dele. Trocar a ordem faz a varredura parecer completa cedo.

---

## Q15 `A`

**Não, e o próprio script recusa essa leitura, em linha impressa.**

`ferramentas/dod.js` decide **nove** condições e imprime a décima como `[ ?? ]`, com o texto de
`:121-123`: "NAO DECIDIVEL POR MAQUINA. Abrir OS DOIS e conferir cada número por comando." A frase
final, `:133`, é literal:

> `Nove verdes NAO sao dez. A ultima e trabalho de ler, e nenhum verde a substitui.`

**O exit 0 mede uma coisa só: nenhuma das nove decidíveis está reprovando.** Em `:134`,
`process.exit(reprovando ? 1 : 0)`, e `reprovando` só é incrementado em `:116`, dentro do laço das
nove. A décima nunca entra nessa conta. O comentário de `:18-20` diz o desenho: "Zero reprovando com
uma pendente de leitura NAO e 'pronto': e 'a maquina fez a parte dela'".

**Exit 0 também sai com condição pulada.** Com `--rapido` (`:33`, `:91`) a condição 9 não roda, e
`:128-129` imprime "nenhuma reprovando, N pulada(s), 1 pendente de leitura humana" com exit 0 do
mesmo jeito. Quem lê só o código de saída não distingue as duas situações.

**Rodado hoje, sem `--rapido`:** as nove passam, a décima sai `[ ?? ]`, o rodapé é "as nove decidíveis
por máquina passam. A décima continua pendente de leitura", exit 0.

**Por que a décima não é de máquina.** Ela diz "`HANDOFF` e `PROMPT-CONTINUAR` descrevem o estado
medido", e isso exige comparar prosa com o mundo. O comentário de `:11-16` guarda a origem: quem
escreveu o script deu a condição por cumprida tendo aberto um dos dois arquivos que ela nomeia, e
"Um script que imprimisse 10/10 estaria fazendo exatamente o que eu fiz".

**E a décima pendente hoje não é hipotética.** Ao conferi-la para a `Q29`, achei números defasados em
superfície viva: `README.md:13` diz "1 602" citações verificadas e o comando devolve hoje 2198;
`README.md:43-46` diz que a renota está em "9 de 29 aulas" e em "55/108 para 86/108", enquanto
`node ferramentas/portao.js` devolve "Notas gravadas: 29 de 29" e "259/348". O `dod.js` saiu com exit
0 com isso no disco, e saiu certo: o `README` não é um dos dois arquivos que a condição 10 nomeia.

---

## Q16 `F`

**Exige que cada suíte seja rodada com `--provar`, o positivo plantado.**

Onde está escrito, `ferramentas/testes/rodar.sh:10-12`:

```bash
for t in "$(dirname "$0")"/*.test.js; do
  echo "== $(basename "$t")"
  node "$t" --provar || falhou=1
```

A razão está no cabeçalho do mesmo arquivo, `:2-7`:

> `# Roda todas as suites, sempre com o positivo plantado.`
> `# Sem `--provar` uma suite verde nao prova nada: ela pode estar aprovando por`
> `# nao medir. Foi assim que sete verificadores deste projeto aprovaram em`
> `# silencio antes de 14/09/2026, e e por isso que aqui o positivo plantado nao e`
> `# opcional.`

**Repetido numa segunda superfície viva:** `README.md:332-333` diz que o `rodar.sh` "roda as quinze
suítes, sempre com **positivo plantado**: sem ele, suíte verde não prova nada, e sete verificadores
deste projeto já aprovaram por não medir".

**O que `--provar` faz em cada suíte, e a forma varia com o objeto.** As 15 suítes implementam o
mesmo contrato no fim do arquivo, sempre em `if (process.argv.includes('--provar'))`. O que ele
planta é escolhido para atacar a comparação central daquela ferramenta:

- `ferramentas/testes/cauda.test.js:13` e `contagem.test.js:12`: "`--provar` cega a comparacao
  central e exige que a suite perceba";
- `ferramentas/testes/portao.test.js:13`: "cega a regra da ultima ocorrencia";
- `ferramentas/testes/requebra.test.js:14`: "planta um defeito que apaga uma palavra";
- `ferramentas/testes/dod.test.js:19-20`: "o positivo plantado transforma a condicao humana em
  decidida, e a suite tem de perceber", que é o ataque exato à propriedade de desenho daquele script.

**Uma exigência a mais, colateral e implícita:** `rodar.sh:10` só alcança `*.test.js`. Uma ferramenta
que não seja `node` não entra no laço, que é o mecanismo do `montar-ambiente.sh` na `Q13`.

**Rodado hoje** pela condição 9 do `dod.js` (`:92-93`, `roda('bash', ['ferramentas/testes/rodar.sh'])`
exigindo `SUITE VERDE`), passou.

---

## Q17 `J`

**Significa uma coisa e sugere outra, e é preciso separá-las: significa que a suíte não reprovou, e
sugere, com força, que ela pode não estar medindo.**

**Este projeto tem a base para dizer isso, e não é impressão:** `ferramentas/testes/rodar.sh:4-6`
registra que "sete verificadores deste projeto" aprovaram em silêncio antes de 14/09/2026, por não
medir. E o caso melhor documentado está em `ferramentas/entreaulas.js:99-103`: a primeira versão
daquela função "abortava ali, e o resultado foi a ferramenta passar VERDE com zero verificacoes de
conteudo, que e exatamente o defeito que ela existe para nao repetir". A seção do `GATE` que a
descreve é ainda mais dura: "Ela reportava `PASS` com `OK: 0`".

**Conclusão de julgamento:** verde de primeira sem nenhum ajuste é **sinal de alerta**, não de
qualidade. Uma ferramenta nova erra; uma suíte que não pegou nenhum desses erros provavelmente está
comparando um valor com ele mesmo.

**O que eu faço antes de confiar nela, nesta ordem:**

1. **Planto o positivo.** Implemento o `--provar` que **cega a comparação central** da ferramenta e
   exijo que a suíte fique vermelha. Se ela continuar verde com a comparação cega, o defeito é da
   suíte, e o verde anterior não valia nada. É a exigência de `ferramentas/testes/rodar.sh:12` e o
   padrão das 15 suítes.
2. **Leio o contador de acertos, não o veredito.** `OK: 0` com `PASS` é a assinatura da falha. O
   `entreaulas.js:214` imprime `OK: N  SEM_PROVA: N  reprovando: N` justamente para que o número
   apareça ao lado do veredito.
3. **Rodo contra um defeito real conhecido**, e não só contra fixtura montada por mim. Fixtura minha
   herda a minha hipótese. O `superficies.js` foi assim: `GATE`, seção "4. As capacidades restantes
   do agente", registra que o primeiro uso sobre `grau 4a` devolveu um conjunto **diferente** do
   esperado, achando cinco aulas e não achando o `GLOSSARIO`, onde o conceito mora sem o termo.
4. **Decido de propósito se a suíte é de unidade ou de integração, e declaro.**
   `ferramentas/testes/dod.test.js:3-6` declara que contraria o padrão das outras porque o objeto é a
   **composição** de nove ferramentas, e "simular as nove testaria o simulador".
5. **Procuro o falso negativo, não o falso positivo.** Rodo a ferramenta sobre o acervo inteiro e
   conto quantos alertas ela produz. Zero num acervo grande é suspeito. O `contagem.js:43-51` mostra
   o oposto, uma janela de 14 que produzia 534 alertas inúteis, e por que ela encolheu para 3.
6. **Escrevo o limite no cabeçalho antes de usar a ferramenta em decisão.** Ferramenta cujo limite
   não está escrito vira portão na cabeça de quem a usa.

**Prova de que o passo 6 não é retórica, medida hoje.** O `contagem.js` roda limpo sobre o
`PROMPT-CONTINUAR.md` ("Nenhuma divergencia"), e o arquivo tem, em `:51-58`, "Leia estes quatro
arquivos ANTES de qualquer outra coisa, na ordem:" seguido de **cinco** itens numerados. Ele não
pega, e não é defeito: `contagem.js:105-106` pula o que está dentro de cerca de código, e a lista
está dentro da cerca aberta em `:50`. É a limitação que a minha regra 11 já declara, "ele nao
substitui a busca". Sem o cabeçalho dizendo isso, um verde ali seria lido como ausência de defeito.

**O que eu não faço:** não entrego ferramenta nova com base na suíte dela. Suíte prova que a
ferramenta faz o que eu pensei; ela não prova que eu pensei a coisa certa. Isso só se decide rodando
contra o acervo real e lendo a saída.

---

## Q18 `F`

**Cinco documentos vivos, além das aulas**, na constante `VIVOS` de
`ferramentas/entreaulas.js:149-155`:

```javascript
const VIVOS = [
  'HANDOFF.md',
  'GLOSSARIO.md',
  'README.md',
  'PROMPT-CONTINUAR.md',
  'agente/rag-specialist.md',
];
```

O padrão de varredura é `AULA-*.md` mais esses cinco, montado em `:156-160`, e **não** inclui
`avaliacao/`. A distinção está em `:121-131`: documento vivo tem de apontar para o estado atual;
registro de auditoria cita o dia em que mediu, e "Varrer `avaliacao/` transformaria historia em
defeito". O achado que a produziu também está lá: o `HANDOFF.md` citava `AULA-18:157`, a linha tinha
ido para 160 e o texto citado era a versão anterior.

Rodado hoje: `node ferramentas/entreaulas.js` devolve `OK: 1  SEM_PROVA: 4  reprovando: 0` e `PASS`,
e um dos `SEM_PROVA` é `HANDOFF.md:185`, ou seja, a cobertura dos vivos está exercitada.

**O que está em subdiretório: `agente/rag-specialist.md`.**

**Por que isso exigiu mexer no script**, e a resposta está em `:139-148`: a versão anterior resolvia o
alvo por `path.basename`, então `agente/rag-specialist.md` seria procurado **na raiz**. O comentário
declara que isso foi **medido**, e que o modo de falha não é o que se supôs:

> `MEDIDO com a resolucao antiga: ele nao silencia, ele QUEBRA, com ENOENT no`
> `readFileSync, e leva a varredura inteira junto.`

E `:144-148` registra a correção da própria suposição: "eu tinha escrito o contrario: supus silencio,
que e o modo de falhar mais comum deste projeto, e a prova avulsa mostrou barulho. A consequencia
pratica e a mesma, cobertura zero naquele arquivo, mas o diagnostico nao e".

O conserto é a separação de `rel` e `base` em `:166-167`: `rel` é o caminho relativo à raiz, usado
para ler e para reportar, e `base` é só o nome do arquivo, usado apenas para a aula não se citar a si
mesma (`:93-94`). O comentário de `:164-165` explica: "um nome solto nao acha o arquivo quando ele
mora em subdiretorio".

**Uma observação de escopo, e vale como alerta de leitura.** O `entreaulas.js` tem cinco vivos; o
`superficies.js:46-50` tem os mesmos cinco **mais o `FATOS.md`**. Os dois conjuntos de "vivo" não
coincidem, e nenhum dos dois cita o outro. Não digo qual está certo: o `FATOS.md` é gerado por script
e provavelmente não carrega citação de linha entre aulas, o que tornaria a diferença inofensiva.
Aponto porque a divergência não está declarada em lugar nenhum.

---

## Q19 `A`

**Não. Nenhum dos dois passos cobre o que a pergunta supõe que eles cobrem, e o `superficies.js` diz
isso na própria saída.**

**Quatro lacunas, todas declaradas na ferramenta ou medidas hoje.**

**1. O `superficies.js` acha termo, não conceito.** `:30-32`: "Nao acha CONCEITO, acha TERMO.
Parafrase escapa, e foi assim que a leitura antiga sobreviveu em prosa a 23 linhas da celula
corrigida." A saída fecha com a mesma advertência em `:114-115`. Medido hoje:
`node ferramentas/superficies.js "rlm/rag-prompt"` não devolve o `README.md`, e o
`superficies.js:13` guarda o caso exemplar, "disjuntas" no título de uma seção cujo corpo dizia
"disjuntos", que nenhuma busca por um dos dois termos alcança de uma vez.

**2. Ele não alcança o artefato do plano.** `:34-36`: "NAO ALCANCA O ARTEFATO DO PLANO, que mora fora
do repositorio e foi justamente a superficie esquecida tres vezes no dia que originou isto. A quarta
superficie continua sendo responsabilidade humana."

**3. A lista `VIVAS` de `:46-50` não cobre o acervo inteiro.** Ela alcança as aulas, seis arquivos da
raiz e `agente/*.md`. **Não alcança `ferramentas/` nem `exercicios/`.** Medido hoje:
`ferramentas/testes/dod.test.js:4` diz "contraria o padrao das outras doze", e há 15 suítes em
`ferramentas/testes/`, portanto 14 outras. É um numeral defasado em código do próprio ferramental,
fora do alcance da ferramenta que serve para achá-lo.

**4. O `PASS` do `verify-citations` decide menos do que o nome sugere.** Ele valida que o caminho
existe e que a linha está no intervalo. Ele **não** valida que a linha diz o que a aula afirma, e
isso foi testado contra a alucinação real do gate v1, que passa como válida; está declarado na minha
definição, `agente/rag-specialist.md:171-175`, e no `README.md:335-340`. Ele também não vê citação de
**aula para aula**, que é objeto do `entreaulas.js` (`README.md:306`, e `entreaulas.js:4-6`). E o
`PASS` de hoje vem acompanhado de `SKIPPED: 29` e `NO_ANCHOR: 15`, que são conferência à mão por
desenho.

**A prova de que a incompletude não é teórica, medida hoje.** O `verify-citations --all` sai `PASS`
com estes números defasados em superfície viva:

| Superfície | Diz | Comando devolve hoje |
| --- | --- | --- |
| `README.md:13` | `1 602` citações verificadas | `OK: 2198` |
| `README.md:43-45` | renota em `9 de 29`, `55/108` para `86/108` | `portao.js`: `29 de 29`, `259/348` |
| `README.md:52-53` | `16` com glob ou elipse, `20` sem antecedente | `SKIPPED: 29`, `NO_ANCHOR: 15` |
| `README.md:89` | "dois exames do agente" | quatro arquivos `EXAME-RAG*` em `avaliacao/` |

Nenhum desses é citação inválida, então nenhum portão os vê.

**O que fecha a correção**, e é a ordem da `Q21`: rodar o `superficies.js` por **sinônimos e
paráfrases**, não por um termo; rodar o `fechos.js` em cada aula tocada, porque título e checkpoint
são onde o conserto falha; rodar `contagem.js`, `cauda.js` e `residuo.js`; rodar `entreaulas.js` além
do `verify-citations`; e **ler**, que é o único passo que alcança a paráfrase.

**Julgamento:** `PASS` é ausência de uma classe de defeito, nunca presença de correção. É a divisão
que o `README.md:339-340` escreve inteira: "o verificador é a rede de baixo, e o que evita a queda é
sempre outra coisa".

---

## Q20 `C`

**Porque o título é a superfície pela qual o resto do mundo cita aquela seção, e quem lê rápido lê
só ele. Um corpo novo sob um título velho não é meia correção: é uma contradição publicada, e ela é
mais cara que o erro original, porque agora o documento discorda de si mesmo.**

Quatro razões, cada uma ancorada:

**1. É a forma de defeito que mais reincidiu aqui.** `ferramentas/contagem.js:3-5` nomeia o
mecanismo: "ela nasce sempre do mesmo jeito: o conserto entra no CORPO do paragrafo e o cabecalho, o
intro ou o checkpoint ficam na versao antiga". E lista seis ocorrências medidas até 14/09/2026,
entre elas `"Dois comentarios que mentem" -> o corpo cita tres linhas`.

**2. O título é referência externa, e referência não pode envelhecer.**
`ferramentas/decisoes.js:16-17` fixa a convenção desta casa: "secao do GATE se cita pelo TITULO,
nunca pelo numero de linha, porque a linha anda a cada secao acrescentada e o titulo nao". Um título
defasado quebra toda citação feita por ele, e nenhuma ferramenta vê essa quebra, porque o título
continua existindo.

**3. É superfície de fecho, e por isso tem ferramenta própria.** `ferramentas/fechos.js:26-31`
enumera quatro classes, `Checkpoint`, `Titulo`, `Rodape`, `Tabela`, exatamente porque são onde a
substituição não chega. A ferramenta existe porque o julgamento automático reprovou: `:6-9` registra
que um juiz por sobreposição de palavras deu 98 pares com limiar 2 e zero com limiar 3, cego
inclusive a um positivo plantado, e conclui "O sinal nao e lexical".

**4. O projeto já pagou por isso, e registrou o preço.** `ferramentas/superficies.js:13` lista, entre
os seis defeitos de um único dia, `"disjuntas" no titulo de uma secao cujo corpo dizia "disjuntos"`.
E `avaliacao/GATE-AULAS-v1.md:4355-4357` usa o achado desse tipo como **unidade de medida** do estado
do material: "o mais grave foi um título de seção. **Uma rodada cujo pior achado é a palavra num
cabeçalho mede um material diferente daquele em que a consulta gravada não tinha resposta no
corpus**". Num acervo em que o pior achado de uma passada é um cabeçalho, deixar um cabeçalho velho
é deixar exatamente a classe que define a fronteira.

**A generalização, e é o que a régua realmente diz:** a unidade de correção não é o parágrafo, é o
**fato**. Enquanto qualquer superfície do acervo afirmar a versão antiga, o fato antigo continua
disponível para ser lido, citado e propagado, e propagação é o que produz os seis defeitos de um dia.
Corrigir o corpo apenas move o erro de lugar.

---

## Q21 `J`

**A ordem tem uma lógica: primeiro definir o conjunto, depois trabalhar arquivo a arquivo, depois
fechar por portão, e só então registrar a decisão.**

**Fase 1, definir o conjunto (a ferramenta ainda manda).**

1. `node ferramentas/superficies.js "<termo>"`, com **o termo e os sinônimos que eu conseguir
   nomear**, cada um num argumento. Ele aceita vários (`:76`, `:85`). A saída separa **viva** de
   **registro** (`:89-111`), e o registro de `avaliacao/` não se toca: divergência ali está certa.
2. `node ferramentas/decisoes.js "<termo>"` para saber se aquele conceito já foi decidido antes e
   por quê. Sem isso eu arrisco reverter uma decisão registrada.
3. `git log -S "<termo>"` e `grep -rn` nos diretórios que o `superficies.js` não alcança, que hoje
   são `ferramentas/` e `exercicios/` (`superficies.js:46-50`).

**Fase 2, arquivo a arquivo (a ferramenta enumera, eu decido).**

4. Corrigir o corpo, usando `ferramentas/lock.js` quando for lote, porque ele valida **todas** as
   âncoras antes de escrever qualquer uma e aborta sem tocar em disco (`lock.js:3-4`).
5. `node ferramentas/fechos.js <intervalo>` em cada aula tocada, para percorrer as superfícies de
   fecho que o diff **não** alterou: checkpoint, título, rodapé, tabela.
6. `node ferramentas/contagem.js <arq>` em todo arquivo que tenha numeral, e **busca do numeral no
   próprio texto**, porque o `contagem.js` só alcança numeral que anuncia lista na linha dos
   dois-pontos e fora de cerca de código.
7. `node ferramentas/cauda.js <arq>`, para a oração antiga que colou na nova. É a forma mais
   frequente desta auditoria, onze ocorrências até 14/09/2026 (`cauda.js:3`).
8. `node ferramentas/residuo.js`, que lê o diff de trabalho e procura cada trecho removido no acervo
   inteiro (`residuo.js:1-4`).

**Fase 3, fechar (portão).**

9. `node ferramentas/verify-citations.js --all` e `node ferramentas/entreaulas.js`.
10. `node ferramentas/dod.js`, e ler as dez linhas, não o exit code.

**Fase 4, registrar.**

11. Escrever a razão numa seção do `GATE` com **título** estável, e o assunto do commit com o mesmo
    vocabulário, porque é assim que o `decisoes.js` acha depois (`decisoes.js:7-8`, `:16-18`).

**Onde a ferramenta acaba e começa a leitura, e o ponto é nomeável com precisão: no passo 1, no
instante em que o termo deixa de casar.**

O `superficies.js` casa `String.includes` em minúsculas (`:66-73`). Ele acha **termo**; o objeto da
varredura é **conceito**. Tudo que for paráfrase, sinônimo, definição sem o termo, ou a mesma ideia
noutra língua, passa por ele intacto. A ferramenta declara isso em `:30-32` e reimprime na saída em
`:114-115`. O caso medido do repositório é o `GLOSSARIO`, onde o conceito mora sem o termo e o
`superficies.js` não o acha.

Então a divisão real é esta: **a ferramenta me dá o conjunto que eu não teria lembrado; a leitura me
dá o conjunto que nenhuma string casa.** A primeira é finita e barata; a segunda é o trabalho.

**O que eu não faço:**

- **Não declaro varredura completa com base em `PASS`.** Ver `Q19`.
- **Não corrijo `avaliacao/`** para bater com o presente, mesmo divergindo. Consertar registro
  destrói história, e a ferramenta marca essas linhas "NAO TOQUE" (`superficies.js:109-110`).
- **Não confio na minha lista de sinônimos.** Escrevo a lista antes de rodar e peço revisão dela a
  quem conhece o domínio, porque um sinônimo esquecido não deixa rastro nenhum.
- **Não conto a quarta superfície como coberta.** O artefato do plano vive fora do repositório
  (`superficies.js:34-36`), e foi ele o esquecido três vezes no dia que originou a ferramenta.

---

## Q22 `F`

**Medição de 2026-09-16**, comando `node ferramentas/vigia.js` na raiz de `rag-auditado-ptbr`, com
rede, exit code 1.

**A fonte não andou.** O clone está em `17c6942` e o `git ls-remote` devolveu `17c6942` para o
`HEAD` do upstream. Saída literal: `upstream em 17c6942: a fonte NAO andou`.

**Oito bibliotecas vigiadas, e as oito andaram. Cinco cruzaram versão maior.**

| Biblioteca | Versão que as aulas declaram | PyPI hoje | Cruzou maior? | Aulas |
| --- | --- | --- | --- | --- |
| `langchain` | 0.3.17 | 1.4.0 | sim | AULA-17, AULA-21 |
| `langchain-community` | 0.3.16 | 0.4.2 | não | AULA-04 |
| `langchain-core` | 0.3.33 | 1.6.3 | sim | AULA-19, AULA-20, AULA-26 |
| `langchain-openai` | 0.3.3 | 1.6.2 | sim | AULA-21 |
| `langgraph` | 0.2.69 | 1.2.11 | sim | AULA-26, AULA-28 |
| `llama-index-core` | 0.12.15 | 0.14.24 | não | AULA-15, AULA-18, AULA-20, AULA-22, AULA-24 |
| `pymilvus` | 2.5.4 | 3.0.1 | sim | AULA-09, AULA-11 |
| `ragas` | 0.2.15 | 0.4.3 | não | AULA-22, AULA-28 |

Contagem conferida na tabela acima: 8 linhas, e a coluna "cruzou maior" tem `sim` em `langchain`,
`langchain-core`, `langchain-openai`, `langgraph` e `pymilvus`, o que dá **5**. As 3 restantes
mudaram dentro da mesma versão maior, que é 0 para `langchain-community`, `llama-index-core` e
`ragas`.

**"Vigiadas" aqui são as 8 classificadas como PIN**, e não todas as declarações das aulas: as outras
4 são instrumento e não se vigiam contra o PyPI, pelo motivo da `Q23`. A conta completa está na
`Q25`.

**O que o alarme obriga, e não fiz:** repinar é reauditar, e é decisão de quem paga a rodada. O que
cabe registrar é que **nenhuma aula ficou falsa por isso hoje**: as aulas nomeiam a versão junto do
número, e o vigia termina com "Nada disso quebra o acervo sozinho: decide-se por aula se vale
remedir" (`vigia.js:214`).

**O caso já fechado**, e eu o reproduzi hoje nos dois interpretadores para não repetir de memória:
`BaseChatModel.__call__` existe em `langchain-core` 0.3.33 e não existe em 1.6.3, e
`BaseRetriever.get_relevant_documents` idem. As duas depreciações que as AULAS 20 e 26 citam viraram
remoção na versão corrente.

---

## Q23 `C`

**Os dois nomes classificam de quem é a afirmação, e por isso o mesmo desvio numérico tem sentidos
opostos.** A definição está em `ferramentas/vigia.js:26-31` e é decidida pelo código em `:164-170`:

| Classe | Teste | De quem é a afirmação |
| --- | --- | --- |
| **PIN** | o par `pacote==versão` existe em algum `requirements` do clone (`:168`) | do **repositório-fonte**: "o curso é sobre um código que declara esta versão" |
| **INSTRUMENTO** | o pacote existe nos requirements, aquela versão não (`:169`) | do **ambiente de quem mediu**: "eu medi nesta versão" |

**Por que instrumento contra pin é achado de auditoria.** Uma versão de instrumento é a bancada, e a
bancada não é a fonte. Se a aula carimba de "pinado pelo repositório" um número que é do ambiente de
medição, ela está fazendo uma afirmação **sobre o repositório** que o repositório não sustenta. É
falsa hoje, não daqui a seis meses, e é falsa por atribuição, não por envelhecimento. O script diz o
preço em `:197-198`: "O que importa nelas e bater com o pin, nao com o PyPI. Divergencia aqui e
achado de auditoria, e ja custou um -1 a este projeto". A minha própria definição registra o mesmo em
`agente/rag-specialist.md:269-272`.

**Por que pin contra PyPI não é achado.** O PyPI andar não altera o que o `requirements` do clone
declara. A afirmação da aula, "o repositório pina X", continua verdadeira palavra por palavra. O que
o PyPI diz é outra coisa: que o leitor que instalar hoje **sem** o pin vai receber outra versão, e
que a medição feita naquela versão pode não transferir. Isso é **notícia**, e o que ela obriga é uma
decisão, não um conserto: `vigia.js:214` fecha com "Nada disso quebra o acervo sozinho: decide-se por
aula se vale remedir".

**A assimetria em uma frase:** instrumento contra pin é **erro de atribuição**, e atribuição não
envelhece, está errada desde que foi escrita. Pin contra PyPI é **passagem do tempo**, e tempo passar
não torna ninguém mentiroso.

**Os quatro instrumentos deste acervo, medidos hoje**, com o que o clone pina ao lado:

| Declaração na aula | O clone pina | Aula |
| --- | --- | --- |
| `langchain-core` 1.6.3 | 0.3.33, 0.3.47 | AULA-26 |
| `openai` 1.109.1 | 1.61.0, 1.65.5, 1.68.2, 1.68.0 | AULA-19 |
| `pydantic` 2.13.4 | 2.10.6 | AULA-20 |
| `python-dotenv` 1.1.0 | 1.0.1 | AULA-00 |

São quatro linhas, e quatro é o número que a `Q25` reporta. **Nenhuma das quatro é achado hoje**,
porque as aulas as apresentam como versão de medição, não como pin da fonte. O `pydantic` 2.13.4 é o
caso instrutivo: `avaliacao/GATE-AULAS-v1.md:3975` registra que o clone diz `2.10.6` doze vezes e que
"a string `2.13.4` não existe nele: ela é do `ferramentas/montar-ambiente.sh`". A versão é do banco de
medição, e o `montar-ambiente.sh:45` a pina, confirmado hoje no interpretador.

---

## Q24 `A`

**A observação está certa, a conclusão está errada. Não é lacuna: é o recorte, escolhido e escrito
antes de alguém perguntar.**

**O fato, medido hoje no clone.** O `04-VectorDB` sozinho já é o caso: o `requirements.txt` dele
(`04-VectorDB/requirements.txt`) lista `torch`, `pymilvus`, `milvus-model`, `opencv-python`,
`pillow`, `numpy`, `tqdm`, `scipy` e `pandas`, **nenhum com `==`**. No repositório inteiro:

```bash
find . -path ./.git -prune -o -iname 'requirements*.txt' -print | wc -l          # 23
cat $(find . -path ./.git -prune -o -iname 'requirements*.txt' -print) \
  | grep -cE '^[A-Za-z0-9._-]+\s*=='                                             # 2191
cat ... | grep -oE '^[A-Za-z0-9._-]+\s*==\s*[A-Za-z0-9._-]+' | tr -d ' ' | sort -u | wc -l  # 470
cat ... | grep -oE '^[A-Za-z0-9._-]+' | tr 'A-Z' 'a-z' | sort -u | wc -l          # 365
```

2191 linhas com `==`, 470 pares distintos `pacote==versão`, 365 pacotes distintos, contra **8** que o
vigia acompanha (Q22, Q25). A premissa acerta a proporção com folga, e bate com o que
`ferramentas/vigia.js:18-19` já dizia: "Sao mais de 1700 entre os arquivos de ambiente".

**Por que não é lacuna, e são três razões.**

**1. É decisão declarada, não omissão.** `vigia.js:8` abre a seção com "O QUE ELE NAO FAZ, e cada uma
e escolha", e `:18-21` diz o critério: "a maioria e dependencia transitiva que nenhuma aula cita. Ele
vigia o que o ACERVO DIZ TER MEDIDO, que e o conjunto cujo envelhecimento torna uma afirmacao falsa".

**2. O objeto da vigilância é a afirmação, não o pacote.** Um pin que nenhuma aula cita não sustenta
nenhuma frase do curso. Se o PyPI andar nele, nada no acervo passa a mentir, porque nada no acervo
fala dele. Vigiar os 470 pares produziria centenas de alertas por rodada sem afirmação nenhuma
atrás, e é assim que alarme vira ruído e ruído vira alarme ignorado.

**3. A lista se deriva, e não se escreve.** `vigia.js:23-24`: "A LISTA DE VIGILANCIA SE DERIVA, NAO
SE ESCREVE. Ela sai das proprias aulas". A implementação é `declaracoes()` em `:55-66`, varrendo as
aulas por `pacote X.Y.Z`, e a classificação contra os requirements em `:158-170`. Alargar para todos
os pins substituiria uma lista derivada do acervo por uma lista derivada do clone, e trocaria o
critério.

**O que seria lacuna de verdade, e digo para não virar defesa cega:**

- **Uma aula que afirma número sobre uma biblioteca sem nomear a versão.** Aí a declaração não é
  captada pela regex de `:48` e o pacote fica fora da lista sem ninguém notar. É o falso negativo
  real, e o vigia não o vê por construção.
- **A regex de `:48` exige o nome entre crases seguido da versão.** Uma aula que escreva a versão
  noutra forma escapa. Hoje isso não custa: 12 declarações capturadas, 0 descartadas por não serem
  nome de pacote.
- **Ausência de resposta não é ausência de mudança.** `vigia.js:143` imprime "upstream: NAO RESPONDEU.
  Sem resposta nao e sinal de que nao mudou", e `:180` faz o mesmo para o PyPI. Hoje todos
  responderam.

**Julgamento:** se alguém quisesse cobertura dos 470 pares, o instrumento certo não é o vigia, é um
verificador de **instalabilidade** do clone, que responde outra pergunta ("o leitor consegue montar o
ambiente hoje?"). São dois alarmes, e misturá-los apagaria o sinal do primeiro.

---

## Q25 `F`

**Medido hoje, 2026-09-16**, com `node ferramentas/vigia.js --offline`, que lê tudo de disco:

```
   23 requirements lidos no clone, 12 declaracoes nas aulas
   8 sao PIN da fonte, 4 sao versao de INSTRUMENTO
```

| Grandeza | Valor |
| --- | --- |
| `requirements` no clone | **23** |
| Declarações de versão nas aulas | **12** |
| Classificadas **PIN** | **8** |
| Classificadas **INSTRUMENTO** | **4** |
| Descartadas por o nome não ser pacote de nenhum requirements | **0** |

8 + 4 = 12, e o vigia não imprimiu a linha de descarte de `:201-204`, o que confirma o zero.

**Os 23 conferidos por fora do script**, porque o número do script não deve ser a única fonte dele:

```bash
find . -path ./.git -prune -o -iname 'requirements*.txt' -print | wc -l   # 23
```

São 11 na raiz dos módulos `00-` a `10-`, um por módulo, mais 10 em `91-Environment/` e 2 em
`91-Environment/archive/`. O script os acha com a varredura recursiva de `vigia.js:70-79`, que filtra
por `/requirements.*\.txt$/i` e pula `.git`.

**Os 8 PIN** estão na tabela da `Q22`. **Os 4 INSTRUMENTO** estão na tabela da `Q23`.

**Duas ressalvas de leitura, porque estes números são fáceis de citar errado.**

**"12 declarações" não é "12 pacotes citados nas aulas".** A chave é `pacote@versão`
(`vigia.js:60`), então o mesmo pacote em duas versões conta duas vezes, e o mesmo par citado em
cinco aulas conta uma. O `langchain-core` aparece nas duas classes: 0.3.33 como PIN e 1.6.3 como
INSTRUMENTO, e são duas das doze.

**"23 requirements" é do clone, não do curso.** O `rag-auditado-ptbr` não tem `requirements.txt`
nenhum: os pins de medição dele vivem dentro de `ferramentas/montar-ambiente.sh:43-46`, que é onde a
`Q11` os conta.

---

## Q26 `F`

**Dez condições. O `dod.js` decide nove. A que ele se recusa a decidir é a décima.**

**A décima, literal, de `ferramentas/dod.js:99-103`:**

```javascript
const HUMANA = {
  n: 10,
  texto: 'HANDOFF e PROMPT-CONTINUAR descrevem o estado medido',
  como: 'Abrir OS DOIS e conferir cada número por comando. A condição nomeia dois arquivos.',
};
```

Ela fica **fora** do array `CONDICOES`, e o comentário de `:97-98` diz por quê: "A decima fica FORA da
lista de propósito: misturá-la com as nove decidiveis é o que permite ler um '10/10' que ninguém
conferiu". O motivo de fundo, em `:13-14`: "'descreve o estado medido' exige comparar prosa com o
mundo".

**Onde o DoD vive: em dois lugares, e os dois são necessários.**

**A definição** está em `avaliacao/GATE-AULAS-v1.md`, na seção de título
"3. O DoD não existia neste repositório, e agora existe", com a tabela das dez condições em
`:4770-4781`. Cito pelo título e não só pela linha, que é a convenção de `ferramentas/decisoes.js:16-17`.
`PROMPT-CONTINUAR.md:38` aponta para lá: "**O DoD vive no `GATE`**, com dez condições e o comando que
decide cada uma".

**O verificador** está em `ferramentas/dod.js:51-103`, e é a cópia executável.

**Que o DoD tenha passado a viver aqui é recente e foi achado.** `GATE:4765-4768`: "as nove condições
viviam só no artefato do plano, publicado na claude.ai ... É a quarta superfície ao contrário: o
critério pelo qual o projeto se declara pronto morava fora do que as ferramentas alcançam".

**São dez e eram nove.** `GATE:4783-4786`: a nova é a 6, citação de linha entre aulas, "o
`entreaulas.js` não existia quando o DoD foi escrito, e a classe que ele fecha reapareceu nas três
rodadas ... acrescentar critério **depois** de a ferramenta existir é o contrário de afrouxar".

**Rodado hoje**, `node ferramentas/dod.js`: as nove decidíveis passam, a décima sai `[ ?? ]`, o
rodapé é `Nove verdes NAO sao dez. A ultima e trabalho de ler, e nenhum verde a substitui.`

**Ressalva de leitura:** a coluna "Hoje" da tabela do `GATE` diz `passa` nas nove e
`pendente de leitura` na décima, e aquela coluna é registro do dia em que foi escrita. O estado de
agora se obtém rodando o script, não lendo a tabela. Foi o que fiz.

---

## Q27 `A`

**A premissa tem uma metade verdadeira e a conclusão errada, e o próprio registro já disse as duas
coisas antes de a pergunta existir.**

**O que de fato aconteceu**, em `avaliacao/GATE-AULAS-v1.md`, seção "2. Condição 4 do DoD:
REFORMULADA, porque era indecidível", `:4750-4761`. A forma antiga era "todo lote de conserto teve
verificação própria aplicada". A nova é:

> **4. O último lote de conserto teve verificação própria aplicada, OU a rodada parou pela régua de
> classe e isso está registrado aqui com o pior achado da última passada.**

**Por que não é afrouxar para poder declarar sucesso.**

**1. A forma antiga não era exigente: era impossível.** `:4750-4752`: "**Ela não pode fechar**:
verificar produz achados, achados produzem consertos, consertos ficam sem verificação. Um item de DoD
que nenhuma execução satisfaz é defeito do DoD, não do trabalho." Um critério que nenhum estado do
mundo satisfaz não mede trabalho: ele mede nada, e "nunca cumprida" é indistinguível de "não medida".
Trocá-lo não relaxa a régua, porque não havia régua, havia um regresso infinito.

**2. A forma nova não é um "ou" que se satisfaz de graça.** O segundo ramo exige que a parada esteja
**registrada, aqui, com o pior achado da última passada**. Isso é trabalho verificável, e o
`dod.js:44-49` o decide por procura do título da seção da régua no `GATE`, não por declaração. Quem
quisesse fechar a condição sem trabalho teria de escrever a seção e nomear o pior achado, o que é
exatamente o que a condição quer.

**3. Quem reformulou declarou que estava mudando critério, e registrou isso como decisão.**
`:4760-4761`: "**Mudar critério é decisão, não medição**, então fica explícito: eu afrouxei uma
condição que não fechava, e a troquei por uma que fecha e continua dizendo algo." A palavra
"afrouxei" é do próprio registro. A premissa da pergunta não descobriu nada escondido: ela repete uma
autoacusação já publicada, e ignora a segunda metade da frase, "e continua dizendo algo".

**4. No mesmo lote o DoD ganhou uma condição.** `:4783-4786`: passou de nove para dez com a citação de
linha entre aulas, "e acrescentar critério **depois** de a ferramenta existir é o contrário de
afrouxar". Um conjunto de critérios que perde uma forma impossível e ganha um critério novo verificável
por comando ficou mais apertado, não menos.

**O teste que decide, e é o que eu usaria em qualquer caso parecido:** a reformulação é afrouxamento
quando o estado do mundo **não mudou** e o critério passou a aceitá-lo. Aqui o estado mudou junto: a
rodada parou por régua de classe e o pior achado dela, uma palavra num cabeçalho, está escrito em
`:4355-4356`. Reformulação que exige produzir evidência nova é redefinição, não indulto.

**Onde a desconfiança da premissa é legítima, e não descarto:** reformular o próprio critério de
pronto é o movimento que mais frequentemente **é** afrouxamento, e um registro que diga "reformulei e
agora passa" merece exatamente essa pergunta. O que o salva aqui é a auditabilidade: a forma antiga
está escrita, a nova está escrita, a razão está escrita, e um terceiro pode discordar lendo as três.
**Julgamento:** o que eu acrescentaria seria uma data e o commit ao lado da seção, para que a
mudança de critério fosse rastreável sem `git log`.

---

## Q28 `C`

**Porque "número de rodadas" mede o esforço gasto e a pergunta é sobre o material. As duas
grandezas se descolam, e a régua certa é a direção e a classe do que cada rodada acha.**

A régua está em `avaliacao/GATE-AULAS-v1.md`, seção "Onde esta rodada para, e por quê",
`:4348-4349`:

> Isso é regresso infinito, e vale declará-lo em vez de fingir que fecha. O que decide onde parar não
> é o número de rodadas, é a **direção do que cada uma acha**

**Por que a contagem de rodadas é ruim, e são três razões distintas.**

**1. Ela não pode fechar, por construção.** `:4344-4345`: "conserto aplicado não é conserto
verificado, então uma nova passada acharia coisa nova, como esta achou". Verificar produz achados,
achados produzem consertos, consertos ficam sem verificação. Qualquer `N` fixo é arbitrário, e é o
mesmo defeito que derrubou a forma antiga da condição 4 (Q27).

**2. Rodada não é unidade homogênea.** `HANDOFF.md:43-44` registra que a terceira rodada de renota
deu nota **menor** que a segunda "porque foi a primeira com uma aula por auditor e orçamento
dobrado". Contar rodadas soma instrumentos diferentes como se fossem o mesmo.

**3. Mais rodadas podem piorar o material.** `HANDOFF.md:25-26` registra duas remedições que
pioraram a aula, AULA-19 de 5 para 4 e AULA-06 de 5 para 4. Número de rodadas não é monotônico com
qualidade.

**O que o projeto usa no lugar, e são dois eixos que trabalham juntos.**

**Eixo 1, a direção do achado: sobre o que a rodada está achando defeito.** `:4351-4353`:

- a oitava rodada achava defeito no **material**;
- a S6 achava defeito nos **consertos do material**;
- a última achou defeito nos **consertos dos consertos**, e onze dos catorze já eram assim.

Quando a rodada passa a achar defeito no próprio conserto, ela deixou de medir o material e passou a
medir o processo. É o ponto de retorno decrescente, e ele é observável, não arbitrado.

**Eixo 2, a classe do pior achado.** `:4355-4357`: "Os achados encolheram de classe: nenhuma `−1`,
nenhum BLOCK de mecanismo, e o mais grave foi um título de seção. **Uma rodada cujo pior achado é a
palavra num cabeçalho mede um material diferente daquele em que a consulta gravada não tinha resposta
no corpus.**" A rubrica já dá a escala, de `−1` a `2`, então "pior achado" é comparável entre
rodadas.

**E a régua é reportável, não só sentida.** A condição 4 do DoD exige que a parada por régua de
classe esteja **registrada com o pior achado da última passada** (`:4756-4757`), e o `dod.js:44-49`
verifica que a seção existe. Sem esse registro a régua viraria justificativa retrospectiva.

**O que esse critério deixa aberto, e é honesto dizer.** A régua diz quando parar de **consertar**;
não diz que o material está correto. `README.md:43-50` mantém "Nenhuma classificação de publicação é
declarada", e a continuidade fica com a vigilância da `Q22`, que é periódica e não tem fim.

---

## Q29 `J`

**A verificação que faço, item a item, e ela é a lista do DoD porque foi escrita exatamente para não
deixar julgar o conjunto.**

`ferramentas/dod.js:3-7` guarda o defeito que a originou: a condição que nomeia dois arquivos foi
dada por cumprida com um deles aberto. "Julguei o conjunto em vez de ler o criterio item a item."
Então:

**Passo 0.** `git status --porcelain` nos dois repositórios. O clone tem de terminar vazio, contrato
de `README.md:77-79`.

**Passo 1 a 9, um comando por condição**, via `node ferramentas/dod.js` sem `--rapido`, **lendo as
nove linhas** e não o exit code, pela razão da `Q15`:

| # | Condição | Como decidi hoje | Resultado |
| --- | --- | --- | --- |
| 1 | Nenhuma aula abaixo de 6/12 | `portao.js`, `Criterio 1 ... PASSA` | ok |
| 2 | No máximo uma `−1` | `portao.js`: `DESCONHECIDAS: 0`, `-1 contados: 0`, `veredito: PASSA` | ok |
| 3 | Rodada completa das 29 | `portao.js`, `Notas gravadas: 29 de 29`, `Soma: 259/348 (74.4%)` | ok |
| 4 | Último lote verificado ou parada registrada | seção da régua presente no `GATE` | ok |
| 5 | Citações contra a fonte | `verify-citations.js --all`, `OK: 2198`, `PASS` | ok |
| 6 | Citação de linha entre aulas | `entreaulas.js`, `OK: 1  SEM_PROVA: 4  reprovando: 0`, `PASS` | ok |
| 7 | Sem resíduo verbatim | `residuo.js` | ok |
| 8 | Ambiente reprodutível | `git ls-files --error-unmatch ferramentas/montar-ambiente.sh` | ok |
| 9 | Suítes com positivo plantado | `testes/rodar.sh`, `SUITE VERDE` | ok |

**Passo 10, e é o que nenhum comando faz por mim: abrir o `HANDOFF.md` e o `PROMPT-CONTINUAR.md` e
conferir cada número deles contra o comando que o produz.**

A condição nomeia **dois** arquivos, e a forma de errá-la é abrir um. O script diz isso em `:102`, "A
condição nomeia dois arquivos", e em `:123`, "Foi esta condicao que eu dei por cumprida sem abrir os
dois arquivos".

**Por que nenhum comando pode fazer isso, e a razão é de tipo, não de esforço.** A condição não
pergunta se os arquivos existem, nem se as citações resolvem: pergunta se a **prosa descreve o estado
medido**. Isso exige, para cada afirmação em linguagem natural, decidir qual comando a decidiria,
rodar, e comparar. Três coisas aí não são mecanizáveis:

1. **Traduzir frase em comando.** "A renota está em 9 de 29 aulas" precisa virar `portao.js`; nada no
   texto diz isso.
2. **Distinguir número vivo de número datado.** `HANDOFF.md:44` diz "1753 OK", e está **certo**,
   porque `:42` declara "Data do bloco histórico abaixo: 2026-08-20". O mesmo formato de número, na
   mesma frase, é defeito numa superfície viva e é registro correto num bloco datado. Nenhuma regex
   separa os dois: quem separa é quem lê o cabeçalho.
3. **Reconhecer o que o texto deixou de dizer.** Ausência não casa com busca nenhuma.

**Prova de que o passo 10 é trabalho, e não formalidade: ele achou defeito hoje.** Conferindo os
números de superfícies vivas contra os comandos:

| Onde | Diz | Comando devolve hoje |
| --- | --- | --- |
| `README.md:13` | `1 602` citações verificadas | `verify-citations --all`: `OK: 2198` |
| `README.md:43-45` | renota em `9 de 29`, `55/108` para `86/108` | `portao.js`: `29 de 29`, `259/348` |
| `README.md:52` | `16` com glob, `20` sem antecedente | `SKIPPED: 29`, `NO_ANCHOR: 15` |
| `README.md:89` | "dois exames do agente" | quatro `EXAME-RAG*` em `avaliacao/` |
| `README.md:298-299` | "As duas primeiras ... as outras dez" | são quinze, no mesmo parágrafo |
| `ferramentas/testes/dod.test.js:4` | "as outras doze" | 15 suítes, portanto 14 outras |

**E isto é o achado que importa, porque é sobre o critério e não sobre o `README`:** o `dod.js` saiu
**exit 0** com tudo isso no disco, e saiu certo. A condição 10 nomeia `HANDOFF` e `PROMPT-CONTINUAR`,
e o `README.md` não é nenhum dos dois. O `PROMPT-CONTINUAR` inclusive avisa, em `:20`, que o "1638 OK"
do bloco antigo virou "mais de 2000; reconte, nunca decore", e o `README.md:343-345` diz que o total
saiu da linha por envelhecer, enquanto `:13` do mesmo arquivo ainda carrega um.

**O que eu declaro ao fechar a rodada, e é a forma que evita o erro de origem:** "as nove decidíveis
por máquina passam; a décima foi conferida por leitura nos dois arquivos que ela nomeia; e ao
conferi-la achei seis números defasados fora do escopo dela, listados acima, que ficam como trabalho
e não como pendência da condição".

**O que eu não faço:** não declaro pronto pelo exit code; não conto a décima como cumprida por
inspeção parcial; não corrijo nada durante prova; e não estendo a condição 10 ao `README` por conta
própria, porque mudar critério é decisão de quem paga a rodada (Q27), e o que me cabe é reportar.

---

## Q30 `F`

Antes de escrever o parágrafo, voltei às três questões e **reexecutei os três comandos**, em vez de
copiar da minha memória do que escrevi acima. Saída literal, 2026-09-16:

```bash
# Q01
find 04-VectorDB -type f -name '*.py' | wc -l            # 27
find 04-VectorDB -type f -name '*.py' | awk -F/ '{print $2}' | sort | uniq -c
#       3 HybridRetrieval
#      21 Milvus
#       3 MultimodalRetrieval

# Q13
ls -1 ferramentas/ | grep -v '^testes$' | wc -l          # 16
ls -1 ferramentas/testes/*.test.js | wc -l               # 15

# Q25
node ferramentas/vigia.js --offline | grep -E 'requirements lidos|sao PIN'
#    23 requirements lidos no clone, 12 declaracoes nas aulas
#    8 sao PIN da fonte, 4 sao versao de INSTRUMENTO
```

**O parágrafo.** Os **27** arquivos `.py` de `04-VectorDB` (Q01), repartidos em 3 no
`HybridRetrieval/`, 21 no `Milvus/`, 3 no `MultimodalRetrieval/` e zero no `LlamaIndex/`, medem o
**tamanho da fonte** que este curso afirma coisas sobre: é o denominador de toda contagem que uma
aula faça daquele módulo, e ele só muda se o upstream andar, o que o vigia disse hoje que não
aconteceu. Os **16** arquivos de `ferramentas/` e as **15** suítes de `ferramentas/testes/` (Q13)
medem outra coisa, o **aparato de verificação** deste repositório: 15 são ferramentas em `node`, cada
uma com a sua suíte, e o décimo sexto é o `montar-ambiente.sh`, que fica fora do laço de
`ferramentas/testes/rodar.sh:10` porque não é `.js`, e cuja verificação equivalente é a condição 8 do
DoD, que exige que ele esteja versionado. E os **23** `requirements` do clone contra as **12**
declarações de versão nas aulas, das quais **8** são pin e **4** são instrumento (Q25), medem um
terceiro objeto: a **superfície de envelhecimento**, ou seja, quantas afirmações do acervo dependem de
uma versão nomeada e de quem é cada uma delas, do repositório-fonte nos 8 pins e da bancada de
medição nos 4 instrumentos. **Os três números não se somam nem se comparam:** 27 é fonte, 16 e 15 são
instrumento, 23 com 12 dividido em 8 e 4 é exposição ao tempo. O que os liga é a ordem de trabalho
desta casa: o primeiro diz o que há para afirmar, o segundo diz com que se confere a afirmação, e o
terceiro diz quando a afirmação conferida deixa de valer sem que ninguém tenha tocado em nada.

**Conferência de coerência antes de entregar**, que é o que a regra 11 exige: os numerais deste
parágrafo, 27, 3, 21, 3, 16, 15, 23, 12, 8 e 4, foram copiados do bloco de saída acima, e cada um
deles bate com a questão em que foi apurado, respectivamente Q01, Q13 e Q25. O 5 e o 8 da Q22
(bibliotecas que cruzaram versão maior, e bibliotecas vigiadas) não entram aqui; o 8 da Q25 e o 8 da
Q22 são o mesmo conjunto, os pins, e foram apurados na mesma execução do `vigia.js`.
