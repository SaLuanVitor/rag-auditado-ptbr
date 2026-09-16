# Retest da lacuna 1: resposta do `@rag-specialist` (Vetor)

Módulo alvo: `05-PreRetrieval/` do clone pinado `RAG-from-First-Principles`, commit `17c6942`
(`git log -1 --format='%H'`). Todos os comandos abaixo rodaram com `cwd` em
`RAG-from-First-Principles/05-PreRetrieval/`.

Ferramental obrigatório cumprido antes de escrever: `FATOS.md` consultado (34 menções a
`05-PreRetrieval`, linhas 182 a 222) e `node ferramentas/vigia.js` executado. O verificador de
citações e o `contagem.js` rodaram sobre este arquivo antes da entrega; o resultado está no fim.

---

## Parte 1

### As seis medições pedidas

| # | O que | Número | Comando |
|---|---|---|---|
| 1 | arquivos `.py` no módulo | **21** | `find . -type f -name '*.py' \| wc -l` |
| 2 | subdiretórios de primeiro nível | **3** | `find . -mindepth 1 -maxdepth 1 -type d \| sort` |
| 3 | `.py` que importam `langchain` | **8** | `grep -rlE '^[[:space:]]*(from\|import)[[:space:]]+langchain' --include='*.py' . \| wc -l` |
| 4 | `.py` que importam `llama_index` | **0** | `grep -rlE '^[[:space:]]*(from\|import)[[:space:]]+llama_index' --include='*.py' . \| wc -l` |
| 5 | `.py` que não importam nenhum dos dois | **13** | `for f in $(find . -type f -name '*.py'); do grep -qE '^[[:space:]]*(from\|import)[[:space:]]+(langchain\|llama_index)' "$f" \|\| echo "$f"; done \| wc -l` |
| 6 | `.py` com caminho absoluto de disco | **0** | `grep -rnE '(^\|[^A-Za-z0-9_])[A-Za-z]:[\\/]' --include='*.py' .` e `grep -rnE '["'"'"']/[A-Za-z]' --include='*.py' .`, ambos exit 1 |

**Os 3 subdiretórios, nomeados** (item 2): `01-QueryConstruction`, `02-QueryTranslation`,
`03-QueryRouting`.

**Os 8 com `langchain`** (item 3), na ordem em que o `grep -rl` os devolve:

1. `01-QueryConstruction/BuildingMetadataFilter/01-LoadYoutubeExample.py`
2. `01-QueryConstruction/BuildingMetadataFilter/02-GenerateMetadataInQuery.py`
3. `02-QueryTranslation/01-QueryRewriting-2-RePhraseQueryRetriever.py`
4. `02-QueryTranslation/02-QueryDecomposition-1-MultiQueryRetriever.py`
5. `02-QueryTranslation/02-QueryDecomposition-2-MultiQueryRetriever.py`
6. `02-QueryTranslation/04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py`
7. `03-QueryRouting/01-LogicalRouting.py`
8. `03-QueryRouting/02-SemanticRouting.py`

**Os 13 sem nenhum dos dois** (item 5): os 12 sob `01-QueryConstruction/`
(`Text2Cypher/03-Text2Cypher-SNOMED-v1-Failed.py`,
`Text2Cypher/03-Text2Cypher-SNOMED-v2-Succeeded.py`,
`Text2SQL/01-Text2SQL-CreateDatabaseTable.py`, `Text2SQL/02-Text2SQL-LLM-DeepSeek.py`,
`Text2SQL/02-Text2SQL-LLM-OpenAI.py`, `Text2SQL/Sakila/01-generate-ddl.py`,
`Text2SQL/Sakila/02-ingest-ddl.py`, `Text2SQL/Sakila/03-ingest-q2sql.py`,
`Text2SQL/Sakila/04-ingest-db-desc.py`, `Text2SQL/Sakila/05-text2sql-rag-v1-error.py`,
`Text2SQL/Sakila/05-text2sql-rag-v2-ok.py`, `Text2SQL/Sakila/05-text2sql-rag-v3-agent.py`)
mais `02-QueryTranslation/01-QueryRewriting-1-RewriteViaPrompt.py`. Fecha a conta:
8 + 0 + 13 = 21.

### Duas medições de controle, e por que elas estão aqui

O item 4 deu zero, e zero por regex ancorada pede controle. Rodei a busca solta, sem âncora de
import e sem distinguir maiúscula:
`grep -rniE 'llama[_-]?index' --include='*.py' .` volta vazia (exit 1). E
`grep -rnE '^[[:space:]]+(from|import)[[:space:]]+(langchain|llama_index)' --include='*.py' .`,
que pegaria import indentado dentro de função, também volta vazia. A âncora de início de linha
não perdeu nada.

O item 6 também deu zero, e a primeira regex que tentei era larga demais:
`[A-Za-z]:[\\/]` casava `https://` e a sequência `Descriptions:\n` dentro de f-string. A regex da
tabela exige que a letra do drive não seja precedida de caractere de palavra. Como controle do
zero, listei como os arquivos de fato referenciam caminho, descartando linha de comentário
(`grep -rnE '(open\(|TextLoader\()' --include='*.py' . | grep -vE ':[0-9]+:[[:space:]]*#'`):
são **8** referências, todas relativas, e em duas convenções diferentes,
`90-Data/sakila/...` (relativa à raiz do repositório) e `../../99-EN/...` (relativa ao diretório
do script). A busca larga devolve 9 linhas, e a nona é um comentário em
`05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/03-ingest-q2sql.py:13`, que nomeia o mesmo
arquivo aberto na linha seguinte. Menção não é referência, e contar sem esse filtro era o erro.

### Duas medições auxiliares, usadas nas Partes 2 e 4

| # | O que | Número | Comando |
|---|---|---|---|
| A | `.py` que chamam `load_dotenv()` | **14** | `grep -rl 'load_dotenv()' --include='*.py' . \| wc -l` |
| B | arquivos que não são `.py` | **6** | `find . -type f \| sed 's/.*\.//' \| sort \| uniq -c` |

Os 7 que não chamam `load_dotenv()` são o complemento de A sobre os 21:
`01-QueryConstruction/BuildingMetadataFilter/01-LoadYoutubeExample.py`,
`01-QueryConstruction/Text2SQL/01-Text2SQL-CreateDatabaseTable.py`,
`01-QueryConstruction/Text2SQL/02-Text2SQL-LLM-DeepSeek.py`,
`01-QueryConstruction/Text2SQL/Sakila/02-ingest-ddl.py`,
`01-QueryConstruction/Text2SQL/Sakila/03-ingest-q2sql.py`,
`01-QueryConstruction/Text2SQL/Sakila/04-ingest-db-desc.py` e
`02-QueryTranslation/01-QueryRewriting-1-RewriteViaPrompt.py`. Fecha: 14 + 7 = 21.

Os 6 do item B: quatro `.env.example` (raiz do módulo e um por subdiretório), um
`requirements.txt` e um notebook,
`02-QueryTranslation/03-QueryClarification-BuildQueryClarificationTree.ipynb`. Com os 21 `.py`,
o módulo tem 27 arquivos.

---

## Parte 2

### Estado do material

O `05-PreRetrieval/` é o módulo em que o curso para de mexer no corpus e passa a mexer na
pergunta. Ele tem 27 arquivos, dos quais 21 são `.py` e 6 são infraestrutura: quatro
`.env.example`, um `requirements.txt` e um notebook,
`02-QueryTranslation/03-QueryClarification-BuildQueryClarificationTree.ipynb`.

A divisão de primeiro nível tem 3 subdiretórios, e eles são o roteiro da aula:
`01-QueryConstruction` (a pergunta vira consulta em outra linguagem, SQL ou Cypher),
`02-QueryTranslation` (a pergunta vira outra pergunta) e `03-QueryRouting` (a pergunta escolhe
para onde vai).

O que decide como esta aula é montada não é o tema, é a biblioteca. Dos 21 scripts, 8 importam
algo de `langchain`, contando qualquer submódulo, e 13 não importam nem `langchain` nem
`llama_index`. A contagem de `llama_index` é 0, e não por recorte de regex: a busca solta pelo
nome, sem âncora de import, volta vazia no módulo inteiro.

Os 13 sem framework não são os exemplos menores. Doze deles estão sob `01-QueryConstruction/`,
onde Text2SQL e Text2Cypher falam direto com o driver:
`05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v1-error.py:61` chama
`retrieve("ddl_knowledge", q_emb.tolist(), top_k=3, fields=["ddl_text"])`, uma função escrita à
mão sobre `pymilvus`, sem retriever de biblioteca no meio. O décimo terceiro é
`02-QueryTranslation/01-QueryRewriting-1-RewriteViaPrompt.py`, e ele é o caso da Parte 4.

Sobre portabilidade, o módulo acerta num eixo e erra noutro. Caminho absoluto de disco:
0 ocorrências nos 21 scripts. As 8 referências a arquivo são todas relativas, mas em duas
convenções que não convivem, umas relativas à raiz do repositório e outras ao diretório do
script. Já a carga de credencial é irregular: 14 dos 21 chamam `load_dotenv()`, e os outros 7
dependem de a variável já estar exportada.

Uma armadilha de versão fica anotada, não resolvida.
`05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py:5` traz
`from langchain_core.pydantic_v1 import BaseModel, Field`, um atalho de compatibilidade, e
o `requirements.txt` do módulo não pina versão nenhuma (zero ocorrências de `==` em 19 linhas de
pacote). O vigia registra `langchain-core` medido em 0.3.33 e corrente em 1.6.3. Se esse atalho
sobrevive à travessia é medição que esta aula não fez, e o correto é dizer isso em vez de
afirmar qualquer um dos dois lados.

*(341 palavras, contadas da primeira linha de prosa do bloco até a última, por
`awk '/^O .05-PreRetrieval/,/afirmar qualquer um dos dois lados\.$/' RETEST-RESPOSTA.md | wc -w`.
A primeira redação deu 368 e passou do teto de 350: dois trechos sem função saíram e um
terceiro foi encurtado.)*

---

## Parte 3

### Checkpoint

Responda sem consultar. Cada pergunta cobra um número ou um nome que o bloco anterior afirma.

1. O módulo tem 21 arquivos `.py`. Quantos deles importam algo de `langchain`, e quantos não
   importam nem `langchain` nem `llama_index`? As duas parcelas mais a de `llama_index` têm de
   fechar em 21.
2. Nomeie os 3 subdiretórios de primeiro nível e diga, em uma frase cada, que transformação da
   pergunta cada um representa.
3. Quantos dos 21 scripts trazem caminho absoluto de disco? E qual é o problema que sobra nas
   referências relativas, já que o número anterior não é o fim da história?
4. `14` dos 21 scripts chamam `load_dotenv()`. Qual é o modo de falha dos outros 7, e por que ele
   não aparece no momento em que o script é escrito?
5. Onde vive a maior parte dos 13 scripts sem framework, e o que essa concentração diz sobre o
   custo de escrever Text2SQL sem retriever de biblioteca?

### Armadilhas de produção

1. **A âncora do caminho relativo muda de arquivo para arquivo.** As 8 referências a arquivo do
   módulo são todas relativas, e a relatividade é o único ponto pacífico.
   `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/01-generate-ddl.py:43`
   abre `90-Data/sakila/ddl_statements.yaml`, que só resolve com o `cwd` na raiz do repositório;
   `05-PreRetrieval/02-QueryTranslation/04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py:15` abre
   `../../99-EN/black-myth-wukong/black_myth_wukong_wiki.txt`, que só resolve com o `cwd` na
   pasta do script. Copiar um trecho de um para o outro produz `FileNotFoundError` que parece
   dado faltando. Julgamento de engenharia: resolver caminho contra `__file__` custa uma linha e
   fecha a classe inteira.
2. **Credencial ausente não falha onde a leitura acontece.** Os 7 scripts sem `load_dotenv()`
   leem a variável de ambiente e seguem. O erro aparece na primeira chamada de rede, com
   mensagem de autenticação, longe da linha que causou. Julgamento: falhe cedo, com uma checagem
   explícita logo depois da leitura, em vez de deixar o provedor reportar.
3. **Versão não pinada num módulo que usa atalho de compatibilidade.** O `requirements.txt` do
   módulo nomeia pacote sem `==`, e `05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py:5` importa de
   `langchain_core.pydantic_v1`. Instalar hoje e instalar no mês que vem não dão o mesmo
   ambiente. O que a mitigação custa, dito por inteiro: pinar congela o exemplo e transfere o
   problema para a data em que alguém precisar de uma correção de segurança do pacote. Pinar
   resolve reprodutibilidade, não manutenção.

### Mão na massa

1. **Reproduza as seis contagens e quebre uma delas de propósito.** Rode os comandos da Parte 1 e
   confira que 8 + 0 + 13 = 21. Depois troque a regex do item 3 por uma sem âncora de início de
   linha (`grep -rl 'langchain'`) e explique, por arquivo, quais entradas novas apareceram e por
   que nenhuma delas é import. O exercício é sobre a diferença entre contar menção e contar uso.
2. **Torne portável um dos 13 sem framework.** Pegue
   `01-QueryConstruction/Text2SQL/Sakila/03-ingest-q2sql.py`, que abre
   `90-Data/sakila/q2sql_pairs.json` na linha 14 e está entre os 7 sem `load_dotenv()`. Faça duas
   mudanças e só essas duas: resolva o caminho contra a localização do próprio arquivo, e
   carregue o `.env` com falha explícita quando a chave não existir. Rode antes e depois a partir
   de dois diretórios diferentes e registre as quatro saídas.

---

## Parte 4

### A faixa que prova

O arquivo é `02-QueryTranslation/01-QueryRewriting-1-RewriteViaPrompt.py`, que tem 31 linhas e é
o décimo terceiro da lista de 13 sem framework, o único fora de `01-QueryConstruction/`. As três
partes abaixo saem todas da mesma faixa,
`05-PreRetrieval/02-QueryTranslation/01-QueryRewriting-1-RewriteViaPrompt.py:1-7`:

> ```python
> from openai import OpenAI
> from os import getenv
> # Initialize the OpenAI client, pointing it at the DeepSeek URL
> client = OpenAI(
>     base_url="https://api.deepseek.com",
>     api_key=getenv("DEEPSEEK_API_KEY")
> )
> ```

**O que a faixa decide.** As linhas 1 e 2 são o bloco de import inteiro do arquivo, e nele não
há `langchain`: o script usa o SDK da OpenAI apontado, pela linha 5, ao endpoint da DeepSeek.
É a decisão que o coloca entre os 13, e ela tem lógica, porque reescrever pergunta é uma chamada
de completions e não precisa de cadeia. O preço aparece na comparação com o vizinho
`05-PreRetrieval/02-QueryTranslation/01-QueryRewriting-2-RePhraseQueryRetriever.py:32`, que
reescreve a mesma pergunta, literalmente a mesma string de teste, só que dentro de um retriever
que ainda monta o vector store. O leitor atravessa dois estilos de código na mesma pasta, sem que
nada no arquivo explique por quê.

**O que a faixa omite.** A linha 6 lê `DEEPSEEK_API_KEY` do ambiente, e não existe `load_dotenv`
em lugar nenhum da faixa. Como as linhas 1 e 2 são o bloco de import completo e a linha 4 já é o
uso, a omissão não pode estar noutro ponto anterior: o arquivo lê a variável sem nunca carregar o
`.env` que o módulo distribui. Este é o único dos cinco `.py` de `02-QueryTranslation/` nessa
condição, e é a diferença que o nome do arquivo não anuncia.

**O que a faixa não protege.** O resultado de `getenv` entra direto no construtor, sem valor
padrão, sem checagem e sem mensagem. Se a variável não estiver exportada, o que chega à linha 6 é
`None`. O comentário da linha 3 documenta a escolha do `base_url` e não diz nada sobre a
dependência de ambiente, que é a parte frágil das duas. **Limite declarado:** se `None` faz o
construtor da linha 4 levantar erro na hora ou se a falha só aparece na primeira chamada de rede
depende da versão do pacote `openai`, e eu não medi isso. O vigia reporta que o clone pina
`openai` em 1.61.0, 1.65.5, 1.68.0 e 1.68.2 conforme o ambiente, com 1.109.1 como versão de
instrumento, então a resposta muda com o ambiente e tem de ser medida, não deduzida da faixa.

---

## Ferramental, resultado

- `node ferramentas/verify-citations.js <este arquivo>`: sem citação inválida.
- `node ferramentas/contagem.js <este arquivo>`: sem alerta de numeral que anuncia lista e
  entrega outra.
- `node ferramentas/vigia.js`: a fonte não andou (`17c6942` nos dois lados); 8 bibliotecas
  mudaram desde a medição das aulas.
- Busca manual por numeral, exigida pela regra 11 porque o `contagem.js` só alcança numeral na
  linha dos dois-pontos. Conferidos um a um contra a Parte 1: `21`, `3`, `8` (duas grandezas
  distintas, os scripts com `langchain` e as referências a arquivo), `0`, `13`, `14`, `7`, `6`,
  `27`, `12`, `5`, `31`, `19`, `34`, `341`. Dois números caíram na conferência e estão corrigidos
  no lugar, com o erro declarado: as palavras da Parte 2 (368 na primeira redação, acima do teto)
  e as referências a arquivo (9 pela busca larga, 8 depois de descartar a linha de comentário).
