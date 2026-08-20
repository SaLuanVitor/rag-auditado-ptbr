# AULA 06 — Tabelas, CSV e bancos SQL como fonte

**Fase 1 — Ingestão** · Módulo do repo: `01-DataLoading/05-TableDataLoading/` (12 arquivos)

---

## Pergunta motivadora

Uma tabela tem a resposta que o usuário quer. Por que o RAG erra tanto com tabelas?

Porque tabela é a estrutura de dados que **mais depende de posição** e o texto é a
representação que **menos preserva posição**. O número `1.842` só significa algo em relação ao
cabeçalho da coluna, ao rótulo da linha e, muitas vezes, a um título acima da tabela. Extraia
como texto corrido e você indexa `1.842` solto — um token sem semântica, que nenhum embedding
consegue conectar à pergunta "qual foi a receita do segundo trimestre?".

Este é o segundo módulo mais numeroso da Fase 1: **12 arquivos** — mais que os 11 de texto
simples, menos que os 13 de PDF da Aula 05.
Não é acaso. **Julgamento:** é o reconhecimento de que tabela é onde a ingestão mais falha.

---

## Modelo mental

### Tabela não é um problema, são três

| Problema                               | Sintoma                                | Onde se resolve                                  |
| -------------------------------------- | -------------------------------------- | ------------------------------------------------ |
| **Detectar** que existe uma tabela     | ela vira parágrafo de números          | parser com análise de layout                     |
| **Extrair** a grade (linhas × colunas) | células se misturam, colunas se fundem | `camelot`, `pdfplumber`, `infer_table_structure` |
| **Representar** para o embedding       | o chunk perde cabeçalho ou contexto    | serialização e contexto adjacente                |

A maioria das discussões sobre "RAG com tabelas" trata só do segundo. O terceiro é o que
decide a qualidade da resposta, e é o menos discutido — uma tabela perfeitamente extraída,
serializada sem cabeçalho, continua inútil.

### A decisão que antecede tudo

Antes de escolher biblioteca, responda: **a pergunta pede um número exato ou uma descrição?**

- **Número exato** ("qual foi a receita de março?") → o caminho certo é **consulta
  estruturada**. Carregue a tabela num banco e use Text2SQL (Aula 12). RAG vetorial sobre
  prosa devolve aproximação; SQL devolve o valor. (**"RAG" aqui e no resto desta aula quer dizer RAG
  vetorial.** A Aula 12 argumenta que Text2SQL bem feito também é RAG — a oposição desta seção é
  entre _busca vetorial_ e _consulta estruturada_, não entre "RAG" e "não-RAG".)
- **Descrição ou comparação** ("como a receita evoluiu e por quê?") → aí sim RAG, porque a
  explicação está no texto ao redor da tabela, não na tabela.

Este módulo cobre os dois caminhos: os arquivos `02-*` levam ao banco, e os `03-*` a `06-*`
extraem tabelas de PDF para o índice.

---

## Parte 1 — CSV: quatro formas no mesmo arquivo

`01-01-ImportCSV.py` é uma aula em si. Ele contém **quatro variantes**, três comentadas e uma
ativa:

| Parte                       | Chamada                                                | O que muda                                          |
| --------------------------- | ------------------------------------------------------ | --------------------------------------------------- |
| 1 (linha 4, comentada)      | `CSVLoader(file_path=file_path)`                       | o caso simples: uma linha do CSV vira um `Document` |
| 2 (linha 12, comentada)     | `CSVLoader(...)` com argumentos                        | controla delimitador, nomes de coluna               |
| 3 (linha 29, comentada)     | `CSVLoader(file_path=file_path, source_column="Name")` | define qual coluna vira o `source` no metadado      |
| 4 (linhas 39–40, **ativa**) | `UnstructuredCSVLoader(file_path=file_path)`           | trata o CSV como tabela, não como linhas            |

**Julgamento:** a parte 3 é a mais importante, e é a que passa despercebida. `source_column="Name"` faz o
metadado `source` de cada documento apontar para o nome do personagem em vez do caminho do
arquivo. Consequência prática: quando o sistema citar a fonte, ele diz _qual registro_, não
_qual arquivo_. Isso é rastreabilidade em nível de linha, decidida com um parâmetro na
ingestão.

A diferença entre `CSVLoader` e `UnstructuredCSVLoader` (parte 4) é conceitual: o primeiro
produz **um documento por linha** — bom para busca por registro; o segundo trata o arquivo
como **uma tabela** — bom para perguntas sobre o conjunto. A escolha depende de a pergunta ser
sobre uma linha ou sobre a tabela.

`01-02-SpecifyCSVLoaderWhenImportingDirectory.py` aplica a lição da Aula 04: `DirectoryLoader`
com `loader_cls=CSVLoader` (linha 7), para carregar um diretório inteiro de CSVs sem cair no
parser default.

---

## Parte 2 — Banco de dados como fonte

Três arquivos, e a progressão é de infraestrutura para uso:

| Arquivo                                     | Papel                                          |
| ------------------------------------------- | ---------------------------------------------- |
| `02-02-SQLDB-connection-test-pymysql.py`    | teste de conexão com `pymysql` (linha 1)       |
| `02-03-SQLDB-connection-test-sqlalchemy.py` | teste com `sqlalchemy` + `pandas` (linhas 1–2) |
| `02-01-LlamaIndex-SQLDB.py`                 | `DatabaseReader` do LlamaIndex (linha 1)       |

Os dois testes de conexão existem porque a maior parte do tempo perdido aqui não é RAG — é
driver, credencial e rede. Rodá-los antes economiza depuração no lugar errado.

O `02-01` traz, em comentário nas linhas 7 a 14, o **DDL da tabela de exemplo** (as linhas 3 a 6 são as
instruções de criação e uso do banco, antes do `CREATE TABLE`):

```sql
CREATE TABLE game_scenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scene_name VARCHAR(100) NOT NULL,
  description TEXT,
  difficulty_level INT,
  boss_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Olhe o schema com atenção, porque ele ilustra a decisão central deste caminho: a coluna
`description` é `TEXT` — prosa livre — enquanto `difficulty_level` é `INT` e `created_at` é
`TIMESTAMP`. **A mesma tabela tem conteúdo para RAG e conteúdo para SQL.**

A leitura correta: `description` deve ser embutida e indexada; `difficulty_level` e
`created_at` devem virar **metadados filtráveis**, não texto. Uma pergunta como "cenários
difíceis com chefe de fogo" quer filtro numérico em `difficulty_level` combinado com busca
semântica em `description`. Achatar tudo em texto perde o filtro; ignorar o texto perde a
semântica.

O `DatabaseReader` faz a ponte: executa uma query e devolve `Document`. Cabe a você decidir o
que vai para `page_content` e o que vai para `metadata` — a decisão da Aula 04, agora sobre
dado estruturado.

---

## Parte 3 — Tabelas dentro de PDF

Aqui estão sete dos doze arquivos, cobrindo quatro bibliotecas. É o problema difícil da aula.

### `camelot`

`03-01-camelot-ExtractPDFTable.py`, linha 10:

```python
tables = camelot.read_pdf(pdf_path, pages="all")
```

Especializado em tabelas e só nisso. Devolve objetos com `.df` (DataFrame do pandas), o que
significa que a tabela sai **como grade**, não como texto. O arquivo importa `time` (linha 7),
sinal de que o autor mede duração — camelot é lento.

Exige dependências de sistema (Ghostscript), e é por isso que
`91-Environment/requirements_camelot_20250413.txt` existe separado: instalar camelot junto do
resto costuma quebrar o ambiente.

### `pdfplumber`

Dois arquivos, e o segundo fecha o ciclo:

- `04-01-pdfplumber-ExtractPDFTable.py` — extração pura (linha 1: `import pdfplumber`)
- `04-02-pdfplumber-ExtractPDFTableAndQA.py` — extração **mais RAG**: importa `pdfplumber`,
  `pandas`, e do LlamaIndex o `VectorStoreIndex` e o `Document` (linhas 1–4), montando um
  query engine (linha 41; a 40 é o comentário)

O `04-02` é o único arquivo do módulo que vai da tabela até a pergunta respondida. É o que
você deve ler para entender **como uma tabela extraída vira algo recuperável** — o passo que a
extração sozinha não dá.

### Unstructured, em três degraus

Os três arquivos `05-*` usam `partition_pdf` numa escada de parâmetros. O `diff` entre eles
**não** mostra isso de forma limpa — é dominado por um docstring de troubleshooting e por blocos de
`os.chdir`; a escada aparece quando você compara só as chamadas:

| Arquivo                                                    | `strategy`               | `infer_table_structure` |
| ---------------------------------------------------------- | ------------------------ | ----------------------- |
| `05-01-unstructured-TableExtraction.py`                    | `"hi_res"` (linha 81)    | —                       |
| `05-02-unstructured-TableExtractionWithContext.py`         | **comentado** (linha 20) | —                       |
| `05-03-unstructured-TableExtractionInferTableStructure.py` | `"hi_res"` (linha 21)    | `True` (linha 22)       |

O `infer_table_structure=True` do `05-03` é o parâmetro que faz o Unstructured tentar
reconstruir a **grade** da tabela, e não apenas detectar que há uma. Com ele, o elemento
`Table` ganha uma representação em HTML no metadado (`metadata.text_as_html`, segundo a
documentação do Unstructured — nenhum dos três scripts imprime esse campo, então aqui não é
comportamento observado) — linhas e células preservadas.

E o `05-02` merece atenção pelo nome: **WithContext**. Ele extrai a tabela _junto com o texto
ao redor_ — o parágrafo que a introduz, a legenda. É a resposta ao terceiro problema do modelo
mental: uma tabela sem o texto que a apresenta perde o referente. "Tabela 3" não diz do que
trata; o parágrafo anterior diz.

Note que o `05-02` tem `strategy="hi_res"` **comentado**, ao contrário dos outros dois. Ou
seja, ele roda na estratégia default — mais rápida, menos fiel ao layout. Rode os três e
compare: é a forma de sentir o que `hi_res` compra em tabela.

### LlamaParse

`06-01-llamaparser-ExtractPDFTable.py` fecha o módulo com a abordagem da Aula 05: converter o
PDF em Markdown, formato que já representa tabela nativamente. Para tabelas, é onde o
`result_type="markdown"` mais rende — uma tabela Markdown é legível pelo LLM sem serialização
adicional.

---

## Como representar uma tabela para o embedding

O módulo demonstra extração; a representação fica por conta de quem monta o pipeline. As três
formas usuais, com o trade-off de cada:

**1. Serializar linha a linha, repetindo o cabeçalho.** Cada linha vira um `Document`:
`"Cenário: Floresta Negra | Dificuldade: 8 | Chefe: Rei Lobo"`. Bom para pergunta sobre
registro específico; perde a visão do conjunto e multiplica o número de chunks.

**2. Manter a tabela inteira como HTML ou Markdown.** É o que `infer_table_structure=True`
entrega. Bom para o LLM ler e comparar; ruim para o embedding, porque a tabela inteira vira um
vetor difuso — o problema de média de direções da Aula 07.

**3. Gerar um resumo em linguagem natural e indexar o resumo**, guardando a tabela original
para entrega. É multi-representação (Aula 16): indexa-se o texto descritivo, devolve-se a
grade.

Julgamento: para pergunta sobre valor exato, nenhuma das três compete com carregar a tabela num
banco e consultar. As três valem quando a tabela precisa conviver com prosa no mesmo índice.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/01-DataLoading/05-TableDataLoading
python 01-01-ImportCSV.py
```

Roda a parte 4 (`UnstructuredCSVLoader`). Agora **descomente a parte 1** e rode de novo: conte
os `Document` de cada. Um documento por linha contra um documento por tabela — a mesma fonte,
duas granularidades.

Depois descomente a parte 3 e olhe o campo `source` no metadado. Antes era o caminho do
arquivo; agora é o nome do personagem.

```powershell
python 05-01-unstructured-TableExtraction.py
python 05-03-unstructured-TableExtractionInferTableStructure.py
```

Compare os elementos `Table` dos dois. Com `infer_table_structure=True`, procure a
representação em HTML no metadado — é a grade preservada, com a ressalva de documentação da
Parte 3.

```powershell
python 04-02-pdfplumber-ExtractPDFTableAndQA.py
```

O único que vai da tabela até a resposta. Faça uma pergunta cujo valor você conhece e confira.

---

## Quebre de propósito

**1. Serialize sem cabeçalho.** Pegue uma tabela extraída e monte os chunks só com os valores,
sem os nomes das colunas. Pergunte por um número. A resposta será errada ou ausente — e é a
demonstração mais direta, na minha leitura, de por que representação importa mais que extração.

**2. Rode `05-02` com e sem contexto.** Ative `strategy="hi_res"` na linha 20 e compare com a
versão default. Depois compare o resultado do `05-02` com o do `05-01`: o texto ao redor muda o
que você conseguiria responder?

**3. Pergunte um valor exato ao pipeline vetorial.** Use `04-02` e peça um número que exija
somar duas linhas. O RAG vetorial não soma — ele recupera e o LLM tenta aritmética sobre o que
veio. Compare com o que um `SELECT SUM(...)` daria. É o argumento da Aula 12, sentido na pele.

**4. Meça o custo do camelot.** O arquivo `03-01` já importa `time`. Cronometre-o contra o
`pdfplumber` do `04-01` no mesmo PDF.

---

## Armadilhas de produção

- **Cabeçalho separado das linhas.** A falha número um. Se o chunk tem valores sem nomes de
  coluna, cada número perde o significado — e nada no pipeline avisa.
- **Tabela que atravessa páginas.** O cabeçalho está na página 4, as linhas continuam na 5.
  Extração por página quebra a associação, e nenhuma das bibliotecas resolve isso sozinha.
- **Células mescladas.** Comuns em relatório corporativo, e a maior fonte de grade corrompida.
  Vale inspecionar manualmente uma amostra antes de confiar na extração em lote.
- **Usar busca vetorial onde SQL resolve.** Pergunta sobre valor exato, agregação ou contagem pede
  consulta estruturada. RAG vetorial devolve o trecho mais parecido, não o cálculo correto — e trocar
  a busca vetorial por Text2SQL não é sair do RAG, só recuperar por outro meio (Aula 12).
- **Colunas numéricas como texto.** `difficulty_level` embutido como prosa não permite filtrar
  por faixa. Colunas escalares devem virar metadado filtrável.
- **Camelot instalado junto do resto.** Dependências de sistema conflitantes; use o
  requirements dedicado.
- **Confiar em extração sem amostragem.** Extraia, e **olhe** dez tabelas do seu acervo antes
  de rodar em cem mil. **Julgamento:** é a inspeção mais barata e a mais pulada.

---

## Checkpoint

1. Por que tabela é a estrutura que mais sofre na conversão para texto?
2. Quais são os três problemas distintos de tabela, e qual deles é o mais negligenciado?
3. Qual a diferença entre `CSVLoader` e `UnstructuredCSVLoader`? Quando cada um serve?
4. O que `source_column` faz, e por que isso é rastreabilidade?
5. No DDL de `02-01-LlamaIndex-SQLDB.py`, quais colunas deveriam virar embedding e quais
   deveriam virar metadado filtrável? Por quê?
6. O que `infer_table_structure=True` acrescenta ao `partition_pdf`?
7. Por que existe um arquivo chamado `TableExtractionWithContext`? Que problema o contexto
   resolve?
8. Cite as três formas de representar uma tabela para o embedding e o trade-off de cada.
9. Quando você **não** deve usar RAG para responder sobre uma tabela?

---

## Vocabulário

`loader` · `document` · `metadata filter` · `parsing` · `Text2SQL` · `chunk` ·
`multi-representação`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 05 — PDF de verdade](AULA-05-pdf-layout-ocr-hierarquia.md)
**Próxima:** [AULA 07 — Chunking](AULA-07-chunking.md) — que decide o que fazer com todo o
texto que a Fase 1 produziu.

> **Fase 1 concluída.** Aulas 04, 05 e 06 cobrem os subdiretórios numerados de `01-DataLoading/`:
> texto e diretórios, dados estruturados, PDF, imagem e tabela. Fica de fora o `99-Others/`, com 8
> arquivos de material alternativo — entre eles um `99-UsingTextract.py`, que extrai PDF com o
> pacote PyPI `textract` (**não** o serviço AWS Textract, apesar do nome: a linha 1 é
> `import textract` e não há `boto3` em nenhum arquivo do repositório) e seria uma sétima abordagem
> para a Aula 05. O fio condutor das três é o mesmo — **o que o
> loader descarta não volta**, e metadado é a parte que todo mundo esquece.
