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
(para busca semântica) e **campos escalares** (para filtro). Naquele DDL os escalares são
`difficulty_level`, `boss_name` e `created_at`; no seu sistema seriam coisas como `tenant_id`, ano ou
categoria. É sobre campos desse tipo que a filtered search da Aula 10 opera.

Guardar tudo como texto embutido perde o filtro. Guardar só escalares perde a semântica. A
collection existe para hospedar os dois.

---

## Parte 1 — A infraestrutura

O `04-VectorDB/Milvus/docker-compose.yml` sobe **três serviços**, e vale entender por quê. O
caminho inteiro importa: existe outro `docker-compose.yml` em `10-AdvanceRAG/05-MultiModalRAG/`, com
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

O módulo traz ainda `create_milvus_db.py` e `a-working-sample.py`. Cuidado com esses dois: eles
**não usam o servidor que você acabou de subir** — instanciam `MilvusClient` com caminho de arquivo
(`MilvusClient("./wukong.db")`, linhas 25-26), que é **Milvus Lite**, o modo embutido. São
referência de forma, não de execução: no Windows nem rodam, porque o Lite é pacote separado sem
wheel para a plataforma. As Armadilhas de produção voltam a esses arquivos no fim da aula.

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
existe levanta erro, e o arquivo **tenta** tratar isso nas linhas 31-35 — a intenção certa, com o
nome errado. A Mão na massa desta aula mostra por que aquele `except` nunca captura nada, e
conserta. Guarde a forma da lição: **`except` presente não é erro tratado.**

Database em Milvus é isolamento lógico, como em Postgres. Serve para separar ambientes
(dev/prod) ou inquilinos. A escolha entre isolar por database e isolar por partição é a decisão de
desenho multi-tenant, retomada nas Armadilhas de produção desta própria aula.

> ⚠️ **E aqui há uma lacuna do material que vale saber antes de rodar.** Nenhuma aula do curso
> **explica** particionamento em prosa — a Aula 10 o cita de passagem, numa linha, como alternativa
> para filtro muito seletivo. Mas o `02-collection.py`, que o "Mão na massa" desta aula manda
> executar, roda cinco operações de partição nas linhas 87-128 (`list_partitions`,
> `create_partition`, `has_partition`, `load_partitions`/`release_partitions`, `drop_partition`).
> Você vai executar o recurso sem que ele tenha sido apresentado. Leia essas linhas com atenção: é
> isolamento **dentro** de uma collection, o degrau mais fino que o `database` do começo desta aula.
> E não procure no `GLOSSARIO.md`: o único verbete `Partition` de lá é a função do Unstructured que
> quebra documento em elementos — homônimo, outro assunto.

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
embedding**. Divergência aqui **deve** dar erro na inserção, não degradação silenciosa — é das poucas falhas
desta fase que aparecem na hora. _Previsão, não medição: verificar exigiria um servidor Milvus de pé, que não tenho aqui._

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

**2. `VARCHAR` exige `max_length`.** Campo de texto precisa de tamanho declarado. Errar para menos
custa caro — o exercício 3 de "Quebre de propósito" faz você medir se o Milvus trunca ou recusa —, e
errar para mais desperdiça. Vale medir o percentil 99 do seu corpus antes de fixar.

**3. Tipo do vetor.** `FLOAT_VECTOR` são floats de 32 bits — o padrão. O arquivo segue
mostrando **binary vector** como alternativa: vetores de bits, muito menores e comparados por
distância de Hamming. Servem quando o volume é enorme e a precisão pode ceder — o mesmo
trade-off do `IVF_PQ` que a Aula 10 vai detalhar, num lugar diferente do pipeline.

**Julgamento:** o `03-schema.py` é o arquivo mais importante desta aula. Os outros três mostram como usar; este
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

O campo `color` parece decorativo e é, **julgamento**, o mais instrutivo da aula. Ele é o **campo escalar** que
não participa da busca vetorial e existe para ser filtrado. Quando a Aula 10 mostrar filtered
search — com o filtro real do `03-filtered-search.py`, `color like "color_%" and likes > 500` —, é
este tipo de campo que estará em jogo. (As cores deste arquivo são `red_7025`, `pink_8682` e afins,
numa collection diferente; `color like "red%"` filtraria aqui, mas não é a expressão que a Aula 10
usa.)

Note também que a inserção é uma **lista de dicionários** — não há SQL, não há `INSERT INTO`.
Cada dicionário é uma entity. E aqui há uma sutileza que a Armadilha "escalares esquecidos no
schema" cobra mais adiante: o quick setup do `02` declara **apenas** `id` e `vector`, e liga
`enable_dynamic_field=True` por conta própria — `_fast_create_collection` força o parâmetro quando
você não o passa. Ou seja, `color` **não é campo declarado** nesta collection: é metadado absorvido
pelo campo dinâmico. Funciona, filtra, e paga o preço em JSON e em eficiência de filtro. O
`03-schema.py` é onde `color` seria declarado de verdade. O nome
da collection, `quick_setup`, indica que ela veio pelo atalho do `02`, não pelo schema
explícito do `03`.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/04-VectorDB/Milvus
docker compose up -d
curl -f http://localhost:9091/healthz
```

O `cd` é indispensável: o `docker-compose.yml` está em `Milvus/`, e rodar de qualquer outro lugar
devolve `no configuration file provided: not found`.

Depois, na ordem dos degraus:

```powershell
cd 01-CollectionsAndEntities
python 01-database.py
python 02-collection.py
python 03-schema.py
python "04-entity(data).py"
```

O nome do quarto arquivo tem parênteses — aspas são necessárias no PowerShell.

Este exercício exige duas edições, e a segunda é o achado. Comente as duas chamadas de
`drop_database` do fim de `01-database.py`, nas linhas 86 e 92 — sem isso, o script apaga as duas databases ao
terminar e a segunda execução cria do zero, sem exercitar nada. **E conserte o tratamento de erro, que não
funciona.** Só o `my_database_1` tem `try/except`, nas linhas 31-35 — mas o nome que ele captura,
`exceptions.AlreadyExistError`, **não existe no `pymilvus` 2.5.4**, a versão que o curso pina (os
nomes reais são `PartitionAlreadyExistException`, `CollectionNotExistException` e afins). Como a
expressão do `except` só é avaliada quando alguma exceção sobe, a primeira execução passa e a
**segunda morre dentro do próprio tratador**, com `AttributeError: module 'pymilvus.exceptions' has no
attribute 'AlreadyExistError'`. O tratamento é decorativo.

Então: troque aquele nome por `exceptions.MilvusException`, que existe e captura, com o custo
de que ela é a **classe base de toda** exceção do `pymilvus`, `ConnectionNotExistException`
entre elas. O tratador passa a engolir servidor fora do ar como se fosse "já existe", e em
código de produção você imprimiria a exceção ou filtraria pelo código de erro. Envolva também
a criação de
`my_database_2` (linhas 40-43) no mesmo `try/except`. Com essas duas correções no tratador, a segunda execução cai no
`except` nas duas databases; sem elas, ela estoura na linha 34 antes de chegar à segunda.

É a diferença entre exemplo e script que sobrevive a um retry — e o arquivo mostra as duas metades
da lição, uma em cada database.

Depois de `04`, use `client.query` para conferir o que ficou, e **conte com um traceback antes
disso**: o arquivo chama `client.load()` na linha 68, que não existe no `pymilvus` 2.5.4, e morre
ali com `AttributeError` sem chegar ao `query` da 69. Troque a linha 68 por
`client.load_collection(collection_name="quick_setup")` e ele completa. As escritas das linhas 40
a 64 já aconteceram quando o erro sobe, então o estado no servidor é o descrito abaixo mesmo na
execução que falha. (O Milvus tem uma interface web, o
Attu, mas **este repositório não a provisiona**: o `docker-compose.yml` sobe só `etcd`, `minio` e
`standalone`, e `attu` não aparece em nenhum arquivo do repo. Subir o Attu é trabalho seu.) **E
não espere dez entidades:** o script insere dez, faz `upsert` em duas (ids 0 e 1, virando
`updated_pink_8682` e `updated_red_7025`) e depois **deleta a de id 0** — linhas 47 a 64. O estado
final tem **nove**, ids 1 a 9. O arquivo faz o ciclo completo de escrita (inserir, atualizar,
remover) e é isso que vale ver, não só a inserção.

---

## Quebre de propósito

**1. Insira um vetor com a dimensão errada.** Em `04-entity(data).py`, remova um número de um
dos vetores, deixando-o com 4 dimensões numa collection de 5. O `pymilvus` **não** confere isto no
cliente — `Prepare.row_insert_param` aceita a linha —, então a recusa, se vier, vem do servidor, e é
isso que este exercício mede. Compare com o truncamento silencioso do embedding da Aula 07: aqui se
**espera** aviso, lá não há.

**2. Troque `auto_id=False` por `True`.** Em `03-schema.py`, ative o auto-id — e note que este
exercício exige uma linha sua: **o arquivo não tem `insert` nenhum** (`grep -c insert` devolve 0), só
cria o schema, descreve e dropa. Antes do `drop_collection` da linha 144, acrescente o dicionário
**completo**. O cliente recusa campo declarado que falte **e** não tenha `nullable` nem
`default_value`, e neste schema isso vale para `id`, `text_vector`, `image_vector`, `age`,
`metadata` e `tags`. Os outros dois podem faltar: `title` é `is_nullable=True` com
`default_value="untitled"`, e `is_active` tem `default_value=True`. Passar todos é o caminho
curto, e o exercício 4 mede a diferença:

```python
client.insert(collection_name=collection_name, data=[{
    "id": 1, "text_vector": [0.1] * 768,
    "image_vector": bytes(32),      # BINARY_VECTOR dim=256 -> 256/8 = 32 bytes
    "title": "t", "age": 30, "is_active": True,
    "metadata": {}, "tags": ["a"],
}])
```

Com `auto_id=False` o `pymilvus` aceita. Com `auto_id=True` ele recusa **no cliente, sem tocar no
servidor**: `DataNotMatchException: Attempt to insert an unexpected field 'id' to collection without
enabling dynamic field`. A mensagem fala de campo dinâmico, mas a causa é o auto-id — o `id` deixou
de ser campo que você fornece. Depois pense: se o Milvus gera o id, como
você descobre a qual documento do seu sistema aquele resultado corresponde?

**3. Declare `VARCHAR` com `max_length` pequeno.** Em `03-schema.py`, baixe o `max_length` do campo
`title` para 10 e insira um texto maior — reaproveitando o `client.insert` que o exercício 2 mandou
acrescentar, já que este arquivo não tem `insert` nenhum (`grep -c insert` devolve 0). Veja se trunca
ou rejeita: a resposta vem do **servidor**, não do cliente — o `pymilvus` aceita a linha sem reclamar
—, e ela muda como você deve dimensionar o campo.

**4. Insira sem o campo escalar.** Omita `color` de uma das entidades de `04`. Vai passar — e o
motivo é o da Parte 3: `color` não é declarado ali, é dinâmico, e chave dinâmica ausente é
simplesmente ausente. Agora faça o mesmo contra um campo **declarado**: em `03-schema.py`, omita
`age` do `insert` que o exercício 2 mandou acrescentar. O `pymilvus` recusa **antes de falar com o
servidor**, com `DataNotMatchException: Insert missed an field 'age' to collection without set
nullable==true or set default_value`. A diferença entre os dois casos é a Armadilha inteira.

---

## Armadilhas de produção

- **Dimensão divergente do modelo.** Julgamento: é o erro mais comum ao subir de protótipo para
  Milvus.
  Guarde o nome do modelo de embedding junto com a collection — trocar de modelo exige
  reindexar, e sem esse registro ninguém lembra qual modelo gerou aquele índice.
- **`auto_id=True` sem referência externa.** Você perde a ponte entre o índice e a sua base.
  Se usar auto-id, crie um campo `source_id` e preencha sempre.
- **Escalares esquecidos no schema.** Campo **declarado** é o que se indexa e filtra com
  eficiência; acrescentar um depois exige recriar a collection e reindexar. O Milvus tem uma saída
  parcial — `enable_dynamic_field=True`, ligado em 15 dos 21 arquivos que definem schema explícito em
  `04-VectorDB/` (`grep -rln "enable_dynamic_field"` acha o parâmetro em 17 arquivos no módulo,
  todos com valor `True`; 15 deles estão entre os 21 que constroem schema à mão — não o
  `03-schema.py` desta aula, nem os três de `HybridRetrieval/`, nem os dois
  `06-full-text-search-bm25-*`), absorve o
  metadado que você esqueceu, ao custo de armazenamento em JSON e de filtro menos eficiente que
  campo declarado. É mitigação, não equivalência: pense nos filtros **antes**, e é barato incluir um
  campo a mais agora.
- 🔴 **Inserir não é publicar.** Uma collection que nunca foi carregada não responde a busca: ela
  precisa de `load_collection()` para subir ao query node, e o par `release_collection()` devolve
  a memória. O atalho esconde esse passo, e vale saber onde: `_fast_create_collection` termina
  chamando `load_collection` por você, então a collection dos exemplos `02` e `04` já sobe
  carregada. Quem constrói o schema à mão, como o `03-schema.py`, carrega por conta.
  `grep -rln "load_collection"` encontra o nome em 16 dos 27 `.py` de `04-VectorDB/` — e a
  conclusão fácil aqui é falsa: dos 11 restantes, **nove leem a collection** — oito com
  `search`/`hybrid_search`, e o `04-entity(data).py` com `query` — e por três caminhos
  diferentes, que vale separar.

  **Três carregam a collection com outro nome:** os três de `HybridRetrieval/` usam
  `collection.load()`, que existe no ORM (`pymilvus.Collection.load`). Aqui a lição é direta:
  ausência da string não é ausência do comportamento — a mesma armadilha do "import não é uso",
  virada do avesso.

  **E um escreve a chamada sem que ela exista, que é a mesma lição do outro lado.** O
  `04-entity(data).py` **desta própria aula** tem `client.load(collection_name="quick_setup")` na
  linha 68, com o comentário `# load into memory` do autor, e consulta na 69. Mas
  `MilvusClient.load` **não existe no `pymilvus` 2.5.4**, a versão que o curso pina: os nomes
  reais são `load_collection` e `load_partitions`. O script insere, atualiza e remove, e então
  morre na linha 68 com `AttributeError: 'MilvusClient' object has no attribute 'load'`, sem
  imprimir o `query`. Presença da string também não é presença do comportamento, e conferir
  custou uma linha: `hasattr(MilvusClient, "load")`.

  **Os outros cinco não carregam nada, e — julgamento — é o caso mais interessante:** `a-working-sample.py`,
  `create_milvus_db.py` e os três de `MultimodalRetrieval/` chamam `client.search()` sem nenhuma
  chamada de load, porque não falam com o servidor desta aula — instanciam `MilvusClient` com um
  caminho de arquivo local (`MilvusClient(db_path)`, `MilvusClient(uri="./wukong_images.db")`), que
  é **Milvus Lite**, o modo embutido. **Limite declarado:** se o Lite dispensa o load explícito ou
  se esses cinco arquivos simplesmente omitem uma etapa necessária, eu não sei — confirmar exige
  rodar, e aqui não roda: o Lite é um pacote separado (`milvus_lite`), sem wheel para Windows, e sem
  ele o `MilvusClient("./arquivo.db")` para antes de qualquer busca. Servidor não resolveria este
  caso — o modo embutido não usa nenhum. O que está verificado é que eles buscam,
  e que não chamam load. Se a sua busca voltar vazia, esta é a
  primeira hipótese, antes de qualquer suspeita sobre embedding. Dado recém-inserido também pode não
  aparecer de imediato, conforme o nível de consistência configurado.
- 🔴 **Acervo que muda exige ingestão idempotente.** O que acontece quando um documento é
  atualizado? Sem id determinístico por chunk — derivado de (fonte, versão, offset) —, reingerir
  gera duplicata; sem apagar antes de inserir, o chunk velho continua competindo no ranking e a
  resposta cita a versão revogada. É falha silenciosa, do gênero que a Fase 1 se propõe a caçar, e o
  contrato mínimo é: **id estável + delete-then-insert por documento**.
- **`max_length` subdimensionado.** Não conte com truncamento silencioso: no `pymilvus` 2.5.4 a
  inserção **por colunas** já recusa a string longa no próprio cliente, com `ParamError: length of
  string exceeds max length`, e a inserção **por dicionário** escapa dessa checagem, deixando a
  decisão para o servidor. Dimensione pelo percentil 99 do corpus em vez de contar com qualquer dos
  dois comportamentos.
- **Milvus em protótipo.** Três contêineres, etcd, MinIO — é infraestrutura demais para
  validar uma ideia. FAISS ou Chroma primeiro; Milvus quando o volume justificar.
- **Confundir database com collection.** Isolamento por database não é o mesmo que
  particionamento por partição, e a escolha entre eles muda o desenho multi-tenant.
- **Não versionar o schema.** Ele é código. Ele deve estar num arquivo versionado, não em
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
8. A dimensão declarada na collection não bate com a saída do modelo de embedding. Onde essa
   divergência **não** é barrada, e como a aula sabe disso? O que continua em aberto sobre o
   servidor, e o que faltaria para fechar?
9. Por que adicionar um campo escalar depois é caro?

---

## Vocabulário

`vector database` · `collection` · `entity` · `schema` · `dense vector` ·
`metadata filter` · `ANN`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 08 — Embeddings, BM25 e BGE-M3](AULA-08-embeddings-bm25-bge-m3.md)
**Próxima:** [AULA 10 — Índices ANN: FLAT, IVF_FLAT, IVF_PQ, HNSW e DiskANN](AULA-10-indices-ann.md)

> A collection desta aula é a estrutura vazia. A Aula 10 constrói o índice sobre ela e mede o
> que cada tipo custa em recall e em latência.
