# AULA 12 — Query construction: Text2SQL, Text2Cypher e filtros de metadados

**Fase 4 — Pré-recuperação** · Módulo do repo: `05-PreRetrieval/01-QueryConstruction/` (14 arquivos)

---

## Pergunta motivadora

Até agora todo o esforço foi do lado do índice: parsear melhor, chunkar melhor, escolher o
embedding, construir o índice ANN. A Fase 4 inverte o lado.

E começa pela pergunta mais desconfortável do curso: **e se a resposta não estiver em texto?**
"Quanto faturamos por região no último trimestre" não tem resposta em nenhum trecho de
documento. Está numa tabela, e a forma de obtê-la é **construir uma consulta**, não recuperar
um chunk.

Esta aula é sobre traduzir linguagem natural em consulta estruturada — SQL, Cypher, filtro de
metadado — e sobre a descoberta que organiza o módulo: **Text2SQL bem feito é RAG.**

---

## Modelo mental

### Três alvos de tradução

| De                | Para                   | Quando                                                          |
| ----------------- | ---------------------- | --------------------------------------------------------------- |
| linguagem natural | **SQL**                | dado em banco relacional; agregação, contagem, valor exato      |
| linguagem natural | **Cypher**             | dado em grafo; relações, caminhos, vizinhança                   |
| linguagem natural | **filtro de metadado** | o acervo é texto, mas a pergunta tem recorte (ano, autor, tipo) |

Os dois primeiros **substituem** a busca vetorial. O terceiro a **acompanha**: você continua
buscando por similaridade, mas restringe o espaço antes.

### O que a Aula 06 antecipou

A tabela `game_scenes` da Aula 06 tinha `description TEXT` ao lado de `difficulty_level INT`.
A conclusão de lá volta aqui como arquitetura: **prosa vai para o índice vetorial, escalar vira
filtro, número exato vira SQL.** Query construction é o mecanismo que decide qual caminho a
pergunta toma.

### Por que a tradução falha, e onde

A intuição diz que o problema é o LLM não saber SQL. Ele sabe. O módulo inteiro está construído
para mostrar que **a falha está em outro lugar**:

1. **O schema que o modelo recebe não corresponde ao schema real.** Nome de coluna abreviado,
   tabela sem documentação, regra de negócio implícita. O modelo gera SQL sintaticamente válido
   e semanticamente impossível.
2. **A saída do modelo não é SQL puro.** Vem embrulhada em cerca de markdown, com explicação
   antes e depois. Jogar isso direto no driver quebra.
3. **Junção errada não dá erro.** Retorna um número plausível, e ninguém percebe.

Os **dois primeiros** aparecem no código, com o "antes" e o "depois" versionados lado a lado. O terceiro não: `grep -rn "JOIN"` no módulo não encontra nenhuma cláusula de junção, nem par antes/depois. Fica como alerta conceitual, sem exemplo — e é justamente o mais difícil de pegar.

---

## Parte 1 — Text2SQL: o problema da saída

Comece pelos dois arquivos mais simples, `Text2SQL/02-Text2SQL-LLM-DeepSeek.py` e
`Text2SQL/02-Text2SQL-LLM-OpenAI.py`. Eles fazem a mesma coisa com provedores diferentes — e o
`diff` revela uma inconsistência que vale conhecer antes de rodar:

|                  | DeepSeek                         | OpenAI                |
| ---------------- | -------------------------------- | --------------------- |
| Caminho do banco | `'90-Data/tourism.db'` (linha 3) | `'data/tourism.db'`   |
| Carrega `.env`   | não, nesse trecho                | sim (`load_dotenv()`) |

⚠️ **Os dois apontam para caminhos diferentes do mesmo banco.** Um espera rodar da raiz do
repositório (`90-Data/`), o outro de um diretório com uma pasta `data/` ao lado. Pelo menos um
dos dois vai falhar dependendo de onde você executar — é o mesmo tipo de armadilha da Aula 07,
onde `03_LlamaIndex-ChunkSizeAffectsAccuracy.py` usa caminho relativo à raiz enquanto o resto do
módulo usa `../99-EN/`.

Antes de rodar, cheque o caminho e ajuste. E note que `tourism.db` é **criado por código** —
`Text2SQL/01-Text2SQL-CreateDatabaseTable.py` é o primeiro passo, não um arquivo versionado.

### O `diff` que ensina o bug

Agora o par que dá nome ao módulo: `Text2SQL/Sakila/05-text2sql-rag-v1-error.py` contra
`-v2-ok.py`. O `diff` completo tem 49 linhas alteradas; **cerca de vinte** são o conserto que dá nome ao
par:

```python
def extract_sql(text: str) -> str:
    # If no code block is found, try to match a SELECT statement
    select_match = re.search(r'SELECT.*?;', text, re.DOTALL)
...
    "Return only the SQL statement, without any explanation or commentary."
...
    sql = extract_sql(raw_sql)
```

Ou seja, o `v1` falha porque **manda a resposta bruta do LLM direto para o driver**. Se o modelo
devolver

````
Aqui está a consulta:
```sql
SELECT COUNT(*) FROM film;
```
````

o driver recebe a cerca de markdown e a frase em português junto com o SQL, e estoura.

A correção do `v2` tem duas frentes, e é importante notar que são **duas** e não uma:

1. **No prompt** — instruir o modelo a devolver só o SQL.
2. **No código** — extrair o SQL de qualquer forma, com regex, caso o modelo desobedeça.

Essa redundância é o desenho certo. Instrução de prompt é probabilística: funciona quase sempre,
e "quase sempre" em produção significa falhar todo dia. O `extract_sql()` é a rede de baixo —
mesmo padrão do verificador de citações deste curso, que existe porque regra em prosa depende de
memória.

Julgamento: eu acrescentaria uma terceira camada que o exemplo não tem — **validar a consulta
antes de executar**. Verificar que é um `SELECT` (e não um `DROP`), que as tabelas citadas
existem, e rodar com usuário somente-leitura. Text2SQL executa código gerado por LLM contra o
seu banco; tratar isso como entrada não confiável não é paranoia.

Há ainda o `05-text2sql-rag-v3-agent.py`, a versão agêntica, que itera quando a consulta falha —
um retry **com limite** (`max_retries: int = 3`) — exatamente o freio que a Aula 26 mostra estar ausente nos laços de LangGraph do repositório.

---

## Parte 2 — A tese do módulo: Text2SQL é RAG

O subdiretório `Text2SQL/Sakila/` tem **7 arquivos**, e os quatro primeiros são o argumento
central do capítulo:

| Arquivo                                        | O que faz                                                         |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `01-generate-ddl.py`                           | conecta no MySQL, roda `SHOW CREATE TABLE` por tabela, grava YAML |
| `02-ingest-ddl.py`                             | **indexa o DDL**                                                  |
| `03-ingest-q2sql.py`                           | **indexa pares pergunta→SQL**                                     |
| `04-ingest-db-desc.py`                         | **indexa descrições do banco em linguagem natural**               |
| `05-text2sql-rag-{v1-error,v2-ok,v3-agent}.py` | os três consumidores                                              |

Os três arquivos de ingestão geram embeddings (OpenAI `text-embedding-3-large`) e inserem em
collections do Milvus com `AUTOINDEX`/`COSINE` — o mesmo padrão de collection mais embedding que a
Aula 09 montou, com a métrica `COSINE` que a Aula 10 discute. O `AUTOINDEX` em si não aparece em
nenhuma das duas: é o atalho que deixa o Milvus escolher o índice, em vez dos cinco que a Aula 10
compara.

**O que está indexado não é documento de negócio. É metadado do banco.**

Por que isso resolve o problema 1 do modelo mental: em vez de despejar o schema inteiro no
prompt — que estoura o contexto num banco com 200 tabelas e dilui a atenção do modelo —, você
**recupera** as três coisas relevantes para aquela pergunta:

- o **DDL** das tabelas que provavelmente importam;
- **exemplos pergunta→SQL** parecidos, que funcionam como few-shot recuperado;
- a **descrição em linguagem natural**, que carrega o que o nome da coluna não diz. Em
  `90-Data/sakila/db_description.yaml`, `customer.active` é descrito como
  _"Indicator if the customer is active (1) or inactive (0)"_ — e é essa descrição, não o nome,
  que decide se o SQL gerado escreve `active = 1` ou `active = 'true'`.

O `03-ingest-q2sql.py` é, **julgamento**, o mais engenhoso dos três. Indexar pares pergunta→SQL significa que,
quando alguém faz uma pergunta parecida com uma já resolvida, o modelo recebe a solução anterior
como exemplo. **O sistema melhora à medida que consultas corretas são acumuladas** — e isso é
uma decisão de arquitetura, não um truque de prompt.

Julgamento: se eu fosse levar Text2SQL a produção, esse seria o primeiro investimento — um
acervo de pares pergunta→SQL validados, crescendo com o uso. Vale mais que trocar de modelo.

---

## Parte 3 — Text2Cypher: o schema que mente

`Text2Cypher/` tem dois arquivos, e os nomes já contam o desfecho:
`03-Text2Cypher-SNOMED-v1-Failed.py` e `03-Text2Cypher-SNOMED-v2-Succeeded.py`. O alvo é um
grafo Neo4j com SNOMED CT (terminologia clínica).

A diferença é onde o schema vem:

| Versão         | Como o schema chega ao LLM                                                        |
| -------------- | --------------------------------------------------------------------------------- |
| `v1-Failed`    | `schema_description` **escrito à mão** como string literal (a partir da linha 16) |
| `v2-Succeeded` | `get_database_schema()` (linha 15) — **introspecciona o banco**                   |

**Julgamento:** esta é a lição mais transferível da aula. Um schema escrito à mão:

- envelhece — o banco muda, a string não;
- omite relações que ninguém lembrou de documentar;
- erra nome de propriedade por descuido de digitação.

E o efeito é dos piores: o LLM gera Cypher **sintaticamente válido** referenciando uma
relação que não existe. O erro não é "o modelo não sabe Cypher" — é "o modelo foi informado
errado e obedeceu".

A correção não é prompt melhor. É **ler o schema da fonte**, a cada execução.

Uma ressalva de honestidade: os arquivos não contêm log de execução nem mensagem de erro
capturada. A causa da falha do `v1` é a leitura editorial mais razoável — o rótulo `Failed` do
autor mais a mudança estrutural para introspecção —, mas não há no código uma prova de qual
consulta quebrou. Registro isso porque o par `Text2SQL/Sakila/v1-error → v2-ok` **tem** a prova
no `diff` (o `extract_sql` ausente), e este não tem.

---

## Parte 4 — Filtro de metadado e self-query

`BuildingMetadataFilter/` tem dois arquivos, e o segundo é, **julgamento**, o mais sofisticado do módulo:

**`01-LoadYoutubeExample.py`** — carrega transcrições com
`YoutubeLoader.from_youtube_url(...)` (linhas 1 e 4). O ponto é o **metadado que vem de
brinde**: título, autor, duração, data de publicação, contagem de views. É a Aula 04 outra vez —
o loader define o que você poderá filtrar depois.

**`02-GenerateMetadataInQuery.py`** — os imports contam a arquitetura (linhas 4 a 9):

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_deepseek import ChatDeepSeek
from langchain_community.document_loaders import YoutubeLoader
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever
from langchain_chroma import Chroma
```

Isso é **self-query**, e o mecanismo merece atenção porque é diferente de tudo que veio antes:

1. Você declara os campos filtráveis com `AttributeInfo` — nome, descrição e tipo de cada um.
2. O `SelfQueryRetriever` recebe a pergunta em linguagem natural.
3. Um LLM **decompõe a pergunta em duas partes**: o que é busca semântica e o que é filtro
   estruturado.
4. O retriever executa as duas coisas contra o vector store.

Um exemplo concreto do que acontece com "vídeos do canal X sobre LangChain publicados em 2024":

| Parte                | Vira                          |
| -------------------- | ----------------------------- |
| "sobre LangChain"    | consulta semântica            |
| "do canal X"         | filtro `author == "X"`        |
| "publicados em 2024" | filtro `publish_year == 2024` |

**Sem self-query, "2024" entra na busca semântica** — e você recupera vídeos de 2021 que
mencionam 2024, enquanto perde vídeos de 2024 que não escrevem o ano na transcrição. É a mesma armadilha do recorte temporal — e nenhuma aula posterior a retoma: o espaço vetorial
captura assunto, não recorte.

A qualidade do `AttributeInfo` é o que decide se funciona. A `description` de cada campo é lida
pelo LLM para decidir quando usá-lo — descrição vaga produz filtro errado. É prompt engineering
disfarçado de configuração de schema.

---

## Mão na massa

O módulo exige infraestrutura variada. Faça na ordem de menor atrito:

```powershell
cd RAG-from-First-Principles/05-PreRetrieval/01-QueryConstruction/BuildingMetadataFilter
python 01-LoadYoutubeExample.py
```

Comece aqui — só precisa de rede. Olhe o `metadata` do documento carregado e liste quais campos
existem. Esses são os seus candidatos a filtro.

```powershell
python 02-GenerateMetadataInQuery.py
```

Faça perguntas com e sem recorte, e observe o filtro que o `SelfQueryRetriever` gera.

Para Text2SQL com SQLite (sem servidor):

```powershell
cd ../Text2SQL
python 01-Text2SQL-CreateDatabaseTable.py
python 02-Text2SQL-LLM-OpenAI.py
```

⚠️ Confira o caminho do banco na linha 3 antes de rodar — os dois arquivos `02-*` divergem, como
a Parte 1 mostrou.

O pipeline Sakila exige MySQL e Milvus rodando. Se não quiser subir os dois, **leia os quatro
arquivos de ingestão sem executar** — a arquitetura é o conteúdo, e ela se entende lendo. O
`diff` entre `05-text2sql-rag-v1-error.py` e `-v2-ok.py` é o exercício que rende mais por
minuto:

```bash
diff Text2SQL/Sakila/05-text2sql-rag-v1-error.py Text2SQL/Sakila/05-text2sql-rag-v2-ok.py
```

Text2Cypher exige Neo4j com SNOMED CT carregado — infraestrutura pesada. Leia o par e compare as
duas formas de obter o schema.

---

## Quebre de propósito

**1. Remova a instrução do prompt, mantenha o `extract_sql()`.** No `v2-ok`, apague a linha
"Return only the SQL statement...". Provavelmente continua funcionando — porque a rede de baixo
segura. Depois faça o inverso: mantenha a instrução e remova o `extract_sql()`. Rode várias
vezes. A diferença entre "quase sempre funciona" e "sempre funciona" é o assunto do exercício.

**2. Estrague o schema de propósito.** No `Text2Cypher/v2-Succeeded`, substitua a chamada de
introspecção por uma string com um nome de relação errado. Veja o Cypher gerado: sintaticamente
impecável, semanticamente impossível. **Julgamento:** é o modo de falha mais importante desta aula.

**3. Piore uma `description` do `AttributeInfo`.** Troque a descrição de um campo por algo vago
("informação sobre o vídeo") e repita uma pergunta com recorte. O filtro deixa de ser gerado ou
vem errado — prova de que aquele texto é prompt, não documentação.

**4. Pergunte sem recorte a um self-query.** Faça uma pergunta puramente semântica e confirme
que nenhum filtro é gerado. Self-query não deve inventar filtro onde não há recorte.

**5. Peça uma agregação ao RAG vetorial.** Volte ao pipeline da Aula 11 e pergunte "quantos
registros existem na categoria X". Compare com o que um `SELECT COUNT(*)` daria. É o argumento
desta aula, medido.

---

## Armadilhas de produção

- **Executar SQL gerado sem validar.** É código de LLM contra o seu banco. Usuário
  somente-leitura, allowlist de operações, verificação de que as tabelas existem, e timeout. O
  exemplo não faz nada disso.
- **Junção errada retorna número plausível.** Nenhuma exceção, nenhum aviso. É o risco que torna
  Text2SQL, **no meu julgamento**, a parte mais perigosa de um RAG — erra com aparência de exatidão.
- **Schema no prompt em vez de recuperado.** Estoura o contexto em banco grande e dilui a
  atenção. Indexe o DDL, como o pipeline Sakila faz.
- **Schema escrito à mão.** Envelhece silenciosamente. Introspeccione.
- **Caminhos relativos divergentes.** Dois arquivos do mesmo diretório apontando para
  `90-Data/` e `data/` — confira antes de rodar, e no seu projeto resolva caminhos a partir da
  localização do módulo.
- **`AttributeInfo` mal descrito.** O LLM lê essa descrição para decidir o filtro. Trate como
  prompt e itere.
- **Recorte temporal virando busca semântica.** "2024" no texto da query recupera menções ao ano
  em vez de documentos do ano.
- **Não acumular pares pergunta→SQL.** Você joga fora o que considero o ativo mais valioso do sistema. Toda
  consulta validada deveria voltar para o índice.

---

## Checkpoint

1. Quais os três alvos de tradução desta aula? Quais substituem a busca vetorial e qual a
   acompanha?
2. Por que "Text2SQL bem feito é RAG"? O que é indexado no pipeline Sakila, e por quê?
3. Quais as **duas** correções que o `v2-ok` acrescenta ao `v1-error`? Por que duas e não uma?
4. Qual a diferença entre `v1-Failed` e `v2-Succeeded` no Text2Cypher, e qual o modo de falha que
   isso produz?
5. Por que "o modelo não sabe SQL" é o diagnóstico errado para a maioria das falhas de Text2SQL?
6. Explique o mecanismo do `SelfQueryRetriever` em quatro passos.
7. O que acontece com "publicados em 2024" se você **não** usar filtro de metadado?
8. Por que a `description` de um `AttributeInfo` é prompt e não documentação?
9. Que camada de segurança o exemplo de Text2SQL não tem, e que você deveria acrescentar?
10. Por que indexar pares pergunta→SQL faz o sistema melhorar com o uso?

---

## Vocabulário

`Text2SQL` · `Text2Cypher` · `metadata filter` · `query construction` · `few-shot` ·
`document` · `hybrid search`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 11 — Busca híbrida e multimodal](AULA-11-busca-hibrida-multimodal.md)
**Próxima:** [AULA 13 — Query translation: reescrita, decomposição, HyDE e clarificação](AULA-13-query-translation.md)

> Esta aula tratou a pergunta que **muda de destino** — vai para SQL, Cypher ou filtro. A Aula 13
> trata a pergunta que continua indo para o índice vetorial, mas precisa ser reescrita antes.
