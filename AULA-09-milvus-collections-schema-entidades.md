# AULA 09 — Vector DB de verdade: collections, schema e entidades no Milvus

**Fase 3 — Armazenamento e busca** · Módulo do repo: `04-VectorDB/Milvus/01-CollectionsAndEntities/` (4 arquivos) + infraestrutura

---

## Pergunta motivadora

Até aqui você usou `InMemoryVectorStore`, FAISS e Chroma sem pensar em nada disso. Por que
trocar por um banco que exige Docker, três contêineres e um schema declarado?

Porque as três primeiras fases produziram vetores, e agora a pergunta muda de "como
representar" para **"como guardar milhões deles e achar o certo em milissegundos, com filtro,
sem perder tudo quando o processo reiniciar"**. Um índice em memória responde às três
perguntas com "não".

Esta aula é sobre a estrutura de dados. A busca vem na Aula 10, e a busca híbrida na 11.

---

## Modelo mental

### O mapeamento que economiza confusão

Se você conhece banco relacional, o Milvus mapeia quase inteiro:

| Relacional     | Milvus            | Observação                       |
| -------------- | ----------------- | -------------------------------- |
| database       | **database**      | isolamento lógico                |
| tabela         | **collection**    | onde os vetores moram            |
| coluna         | **field**         | escalar ou vetorial              |
| linha          | **entity**        | um registro: id + vetor + campos |
| chave primária | **primary field** | `is_primary=True`                |
| índice B-tree  | **índice ANN**    | Aula 10                          |

A diferença que importa: numa tabela relacional o índice é acessório — sem ele a consulta é
lenta, mas funciona. Numa collection, **o índice vetorial é o que torna a busca possível em
escala**, e escolhê-lo é decisão de arquitetura, não otimização tardia.

### Vetor e escalar convivem

Este é o ponto que a Aula 06 antecipou com o DDL de `game_scenes`: uma entity tem o **vetor**
(para busca semântica) e **campos escalares** (para filtro). `tenant_id`, `ano`, `categoria`,
`preço` são escalares, e é sobre eles que a filtered search da Aula 10 opera.

Guardar tudo como texto embutido perde o filtro. Guardar só escalares perde a semântica. A
collection existe para hospedar os dois.

---

## Parte 1 — A infraestrutura

O `04-VectorDB/Milvus/docker-compose.yml` sobe **três serviços**, e vale entender por quê. O
caminho inteiro importa: existe outro `docker-compose.yml` no módulo `05-MultiModalRAG`, com
outro conteúdo e outro tamanho.

| Serviço | Imagem                                                | Papel                               |
| ------- | ----------------------------------------------------- | ----------------------------------- |
| etcd    | `quay.io/coreos/etcd:v3.5.18` (linha 6)               | metadados e coordenação             |
| MinIO   | `minio/minio:RELEASE.2023-03-20T20-16-18Z` (linha 23) | armazenamento de objetos (os dados) |
| Milvus  | `milvusdb/milvus:v2.5.10` (linha 41)                  | o motor de busca vetorial           |

As portas expostas pelo Milvus (linhas 57–58):

- **`19530`** — a porta do cliente. É a que aparece em `uri="http://localhost:19530"` em
  **todos** os quatro arquivos da aula.
- **`9091`** — métricas e saúde. O healthcheck da linha 51 usa
  `curl -f http://localhost:9091/healthz`.

A arquitetura de três contêineres explica uma característica do Milvus: ele **separa
metadados (etcd) de dados (MinIO) de computação (Milvus)**. É o que permite escalar
horizontalmente em produção — e é também por que ele é pesado demais para um protótipo, onde
FAISS ou Chroma resolvem.

```powershell
cd RAG-from-First-Principles/04-VectorDB/Milvus
docker compose up -d
```

Antes de rodar qualquer exemplo, confirme a saúde:

```bash
curl -f http://localhost:9091/healthz
```

O módulo traz ainda `create_milvus_db.py` e `a-working-sample.py` — este último é o exemplo
completo que funciona de ponta a ponta, útil como referência quando algum passo falhar.

---

## Parte 2 — Os quatro degraus

Os arquivos de `01-CollectionsAndEntities/` sobem um nível de cada vez. Leia nesta ordem.

### `01-database.py` — isolamento

```python
from pymilvus import MilvusClient, exceptions   # linha 16
client = MilvusClient(uri="http://localhost:19530")   # linhas 23–24
client.create_database(db_name="my_database_1")       # linha 32
```

Repare no import da linha 16: ele traz `exceptions` junto com o cliente. Criar database que já
existe levanta erro, e o arquivo trata isso — detalhe pequeno que separa exemplo de script
utilizável.

Database em Milvus é isolamento lógico, como em Postgres. Serve para separar ambientes
(dev/prod) ou inquilinos, e conecta com a estratégia de particionamento multi-tenant que a
Aula 10 vai discutir.

### `02-collection.py` — o atalho

```python
client.create_collection(
    ...
    dimension=5    # linha 25
)
```

Este é o **quick setup**: você informa a dimensão do vetor e o Milvus infere o resto — cria um
campo de id, um campo de vetor, e um índice default. Uma linha, e você tem onde inserir.

`dimension=5` é valor de brinquedo, escolhido para os vetores caberem legíveis na tela. Em uso
real seria 384, 768 ou 1536 — e **precisa bater exatamente com a saída do seu modelo de
embedding**. Divergência aqui é erro na inserção, não degradação silenciosa; é das poucas
falhas desta fase que aparecem na hora.

### `03-schema.py` — o controle

Aqui está a diferença entre usar o Milvus e **projetar** no Milvus:

```python
schema = MilvusClient.create_schema()   # linha 16

schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,   # chave primária
    auto_id=False      # não gerar o id automaticamente
)

schema.add_field(
    field_name="text_vector",
    datatype=DataType.FLOAT_VECTOR,   # vetor de float de 32 bits
    dim=768
)
```

Três decisões visíveis nesse trecho:

**1. Tipo da chave primária.** `INT64` com `auto_id=False` significa que **você** fornece o
id. O arquivo mostra a alternativa comentada logo abaixo: uma chave `VARCHAR` com
`auto_id=True` e `max_length=100`.

A escolha não é estética. Com `auto_id=False` você pode usar o id do seu sistema de origem —
o id do documento, do ticket, do produto — e isso torna trivial reconciliar o que está no
índice com o que está na sua base. Com `auto_id=True` o Milvus gera o id, e você precisa de um
campo extra para guardar a referência externa. **Escolher `auto_id=True` sem guardar a
referência é como perder a chave estrangeira.**

**2. `VARCHAR` exige `max_length`.** Campo de texto precisa de tamanho declarado. Subestimar
trunca; superestimar desperdiça. Vale medir o percentil 99 do seu corpus antes de fixar.

**3. Tipo do vetor.** `FLOAT_VECTOR` são floats de 32 bits — o padrão. O arquivo segue
mostrando **binary vector** como alternativa: vetores de bits, muito menores e comparados por
distância de Hamming. Servem quando o volume é enorme e a precisão pode ceder — o mesmo
trade-off do `IVF_PQ` que a Aula 10 vai detalhar, num lugar diferente do pipeline.

O `03-schema.py` é o arquivo mais importante desta aula. Os outros três mostram como usar; este
mostra o que você está escolhendo quando não escolhe.

### `04-entity(data).py` — os dados

```python
client.create_collection(
    ...
    dimension=5,             # linha 18
    vector_field_name="vector",
    id_type="int"
)

data=[
    {"id": 0, "vector": [0.358..., -0.602..., 0.184..., -0.262..., 0.902...], "color": "pink_8682"},
    ...
]

res = client.insert(collection_name="quick_setup", data=data)   # linha 40
```

São **10 entidades**, cada uma com três campos: `id`, `vector` de 5 dimensões, e `color` — uma
string como `"pink_8682"`.

O campo `color` parece decorativo e é o mais instrutivo da aula. Ele é o **campo escalar** que
não participa da busca vetorial e existe para ser filtrado. Quando a Aula 10 mostrar filtered
search com expressões como `color like "red%"`, é este campo que estará em jogo.

Note também que a inserção é uma **lista de dicionários** — não há SQL, não há `INSERT INTO`.
Cada dicionário é uma entity, e as chaves precisam corresponder aos campos declarados. O nome
da collection, `quick_setup`, indica que ela veio pelo atalho do `02`, não pelo schema
explícito do `03`.

---

## Mão na massa

```powershell
docker compose up -d
curl -f http://localhost:9091/healthz
```

Depois, na ordem dos degraus:

```powershell
cd 01-CollectionsAndEntities
python 01-database.py
python 02-collection.py
python 03-schema.py
python "04-entity(data).py"
```

O nome do quarto arquivo tem parênteses — aspas são necessárias no PowerShell.

Rode `01-database.py` **duas vezes**. A segunda deve cair no tratamento de exceção em vez de
estourar. É a diferença entre exemplo e script que sobrevive a um retry.

Depois de `04`, use `client.query` ou o Milvus Attu (interface web) para conferir que as 10
entidades estão lá. Ver o dado inserido fecha o ciclo.

---

## Quebre de propósito

**1. Insira um vetor com a dimensão errada.** Em `04-entity(data).py`, remova um número de um
dos vetores, deixando-o com 4 dimensões numa collection de 5. O erro aparece na inserção — e é
bom que apareça. Compare com o truncamento silencioso do embedding da Aula 07: aqui o sistema
avisa, lá não.

**2. Troque `auto_id=False` por `True`.** Em `03-schema.py`, ative o auto-id e tente inserir
fornecendo o `id` mesmo assim. Observe o conflito. Depois pense: se o Milvus gera o id, como
você descobre a qual documento do seu sistema aquele resultado corresponde?

**3. Declare `VARCHAR` com `max_length` pequeno.** Ponha `max_length=10` num campo e insira um
texto maior. Veja se trunca ou rejeita — a resposta muda como você deve dimensionar.

**4. Insira sem o campo escalar.** Omita `color` de uma das entidades de `04`. O schema aceita?
Se aceitar, o que acontece quando você filtrar por `color` depois?

---

## Armadilhas de produção

- **Dimensão divergente do modelo.** O erro mais comum ao subir de protótipo para Milvus.
  Guarde o nome do modelo de embedding junto com a collection — trocar de modelo exige
  reindexar, e sem esse registro ninguém lembra qual modelo gerou aquele índice.
- **`auto_id=True` sem referência externa.** Você perde a ponte entre o índice e a sua base.
  Se usar auto-id, crie um campo `source_id` e preencha sempre.
- **Escalares esquecidos no schema.** Campo **declarado** é o que se indexa e filtra com
  eficiência; acrescentar um depois exige recriar a collection e reindexar. O Milvus tem uma saída
  parcial — `enable_dynamic_field=True`, ligado em praticamente todo schema deste módulo, absorve o
  metadado que você esqueceu, ao custo de armazenamento em JSON e de filtro menos eficiente que
  campo declarado. É mitigação, não equivalência: pense nos filtros **antes**, e é barato incluir um
  campo a mais agora.
- 🔴 **Inserir não é publicar.** Depois do `insert`, a collection ainda precisa ser **carregada**
  para o query node: `load_collection()` (e o par `release_collection()` para devolver a memória).
  Todo exemplo do módulo o chama — `grep -rn "load_collection"` encontra 16 arquivos em
  `04-VectorDB/` —, e nenhuma aula até aqui o explicava. Se a sua busca voltar vazia, esta é a
  primeira hipótese, antes de qualquer suspeita sobre embedding. Dado recém-inserido também pode não
  aparecer de imediato, conforme o nível de consistência configurado.
- 🔴 **Acervo que muda exige ingestão idempotente.** O que acontece quando um documento é
  atualizado? Sem id determinístico por chunk — derivado de (fonte, versão, offset) —, reingerir
  gera duplicata; sem apagar antes de inserir, o chunk velho continua competindo no ranking e a
  resposta cita a versão revogada. É falha silenciosa, do gênero que a Fase 1 se propõe a caçar, e o
  contrato mínimo é: **id estável + delete-then-insert por documento**.
- **`max_length` subdimensionado.** Trunca conteúdo em silêncio, e você descobre em produção.
- **Milvus em protótipo.** Três contêineres, etcd, MinIO — é infraestrutura demais para
  validar uma ideia. FAISS ou Chroma primeiro; Milvus quando o volume justificar.
- **Confundir database com collection.** Isolamento por database não é o mesmo que
  particionamento por partição, e a escolha entre eles muda o desenho multi-tenant.
- **Não versionar o schema.** O schema é código. Ele deve estar num arquivo versionado, não em
  comandos digitados uma vez num notebook.

---

## Checkpoint

1. Traduza para o vocabulário do Milvus: tabela, linha, coluna, chave primária.
2. Por que o `docker-compose.yml` sobe três serviços? Qual o papel de cada um?
3. Qual a diferença entre as portas `19530` e `9091`?
4. O que o quick setup do `02-collection.py` decide por você que o `03-schema.py` deixa
   explícito?
5. Quais as consequências práticas de `auto_id=True` contra `auto_id=False`?
6. Por que `VARCHAR` exige `max_length` e o que acontece se você errar para menos?
7. Para que serve o campo `color` em `04-entity(data).py`, se ele não participa da busca
   vetorial?
8. O que acontece se a dimensão declarada na collection não bater com a saída do modelo de
   embedding? Esse erro é silencioso?
9. Por que adicionar um campo escalar depois é caro?

---

## Vocabulário

`vector database` · `collection` · `entity` · `schema` · `dense vector` · `sparse vector` ·
`metadata filter` · `ANN`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 08 — Embeddings, BM25 e BGE-M3](AULA-08-embeddings-bm25-bge-m3.md)
**Próxima:** AULA 10 — Índices ANN: FLAT, IVF*FLAT, IVF_PQ, HNSW e DiskANN *(a escrever)\_

> A collection desta aula é a estrutura vazia. A Aula 10 constrói o índice sobre ela e mede o
> que cada tipo custa em recall e em latência.
