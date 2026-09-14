# AULA 06 — Tabelas, CSV e bancos SQL como fonte

**Fase 1 — Ingestão** · Módulo do repo: `01-DataLoading/05-TableDataLoading/` (13 arquivos, contando o `.env.example`)

---

## Pergunta motivadora

Uma tabela tem a resposta que o usuário quer. Por que o RAG erra tanto com tabelas?

Porque tabela é a estrutura de dados que **mais depende de posição** e o texto é a
representação que **menos preserva posição**. O número `1.842` só significa algo em relação ao
cabeçalho da coluna, ao rótulo da linha e, muitas vezes, a um título acima da tabela. Extraia
como texto corrido e você indexa `1.842` solto — um token sem semântica, que nenhum embedding
consegue conectar à pergunta "qual foi a receita do segundo trimestre?".

Este é o segundo módulo mais numeroso da Fase 1: **13 arquivos** — mais que os 12 de texto simples,
menos que os 14 de PDF da Aula 05. Não é acaso. **Julgamento:** é o reconhecimento de que tabela é
onde a ingestão mais falha.

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

**Julgamento:** a parte 3 é a mais importante, e é a que passa despercebida. `source_column="Name"`
faz o metadado `source` de cada documento apontar para o valor da coluna `Name` em vez do caminho
do arquivo. Vale olhar o arquivo antes de chamar essa coluna de "nome do personagem": das seis
linhas, quatro são equipamento ou habilidade (`Bronzecloud Staff`, `Folk Opera Armor`,
`Heavenly Thunder Strike`, `Flame Dance`) e só duas são personagem. É o rótulo do registro,
qualquer que seja a categoria dele. Consequência prática: quando o sistema citar a fonte, ele diz _qual registro_, não
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

O `02-01` traz, em comentário nas linhas 7 a 14, o **DDL da tabela de exemplo** (a linha 3 é o
cabeçalho da seção, as 4 e 5 são as instruções de criação e uso do banco; a 6 é o cabeçalho que
anuncia a tabela):

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

⚠️ **Duas bases de caminho no mesmo módulo, e é preciso trocar de diretório no meio.** O
`01-01-ImportCSV.py` aponta para `"../../99-EN/..."` e só roda **de dentro** desta pasta; já os
arquivos de PDF (`03-01`, `04-01`, `04-02`, `05-02`, `05-03`, `06-01`) apontam para
`"90-Data/ComplexPDF/..."` e só rodam **da raiz** do repositório. A única exceção é o
`05-01-unstructured-TableExtraction.py`, que se corrige sozinho com um `os.chdir` na linha 48. E há
um terceiro caso, que não roda de canto nenhum: o `01-02` aponta para `data/black myth`, diretório
que o repositório não tem. O parecido que existe é `90-Data/BlackMythWukong/`, com outro nome. Leia
o `01-02` pelo padrão (`loader_cls`), não o execute. Rode o `01-01` daqui e faça `cd ../..` antes
dos que
leem PDF.

Aqui estão sete dos treze arquivos, cobrindo quatro bibliotecas. É o problema difícil da aula.

### `camelot`

`03-01-camelot-ExtractPDFTable.py`, linha 10:

```python
tables = camelot.read_pdf(pdf_path, pages="all")
```

Especializado em tabelas e só nisso. Devolve objetos com `.df` (DataFrame do pandas), o que
significa que a tabela sai **como grade**, não como texto. O arquivo importa `time` (linha 7) e cronometra a
própria execução. Isso não diz nada sobre o camelot em particular: o `04-01` e o `06-01`
cronometram do mesmo jeito, então a instrumentação é hábito do módulo e não queixa sobre uma
biblioteca. Nenhum número de tempo aparece no repositório nem nesta aula, e produzi-lo é o
exercício 4 do "Quebre de propósito".

Exige dependências de sistema, e isso **está** documentado: o `01-DataLoading/requirements.txt`
registra na linha 6 que "camelot-py needs Ghostscript installed on the system". Existe também um
`91-Environment/requirements_camelot_20250413.txt` à parte — mas isso não é isolamento: o mesmo
`01-DataLoading/requirements.txt` lista `camelot-py[cv]` na linha 25, junto do resto do capítulo, e
o `requirements_marker_20250413.txt` também traz `camelot-py`. Por que existe um arquivo dedicado, o
repositório não diz. Instale por onde preferir; o que você precisa garantir é o Ghostscript no
sistema.

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

Os três arquivos `05-*` usam `partition_pdf` numa escada de parâmetros. Todo `diff` que envolve o
`05-01` esconde a escada, porque é dominado pelo docstring de troubleshooting de 38 linhas e pelo
bloco de `os.chdir` que só ele tem: 97 linhas de saída contra o `05-02`, 78 contra o `05-03`. Já o
par `05-02` contra `05-03` sai limpo, em 28 linhas, e o degrau aparece de cara. A tabela abaixo
compara só as chamadas:

| Arquivo                                                    | `strategy`               | `infer_table_structure` |
| ---------------------------------------------------------- | ------------------------ | ----------------------- |
| `05-01-unstructured-TableExtraction.py`                    | `"hi_res"` (linha 81)    | —                       |
| `05-02-unstructured-TableExtractionWithContext.py`         | **comentado** (linha 20) | —                       |
| `05-03-unstructured-TableExtractionInferTableStructure.py` | `"hi_res"` (linha 21)    | `True` (linha 22)       |

O `infer_table_structure=True` do `05-03` é o parâmetro que faz o Unstructured tentar
reconstruir a **grade** da tabela, e não apenas detectar que há uma. Com ele, o elemento
`Table` ganha uma representação em HTML no metadado (`metadata.text_as_html`), com linhas e células
preservadas. Isso é o que a documentação do Unstructured descreve, e não foi medido aqui: o
ambiente de verificação do curso deixa o `unstructured` de fora. O que se confirma por leitura é
onde olhar. Os três scripts imprimem `vars(element.metadata)`, então o campo, se aparecer, aparece
nesse despejo, e comparar o do `05-03` com o dos outros dois é o teste que fecha a questão.

E o `05-02` merece atenção pelo nome: **WithContext**. Ele imprime, ao lado de cada tabela, os três
elementos que a **precedem** — tipicamente o parágrafo que a introduz. Legenda posterior fica de
fora, porque o laço só olha para trás. É a resposta ao terceiro problema do modelo
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
vetor difuso, que é o problema de média de direções da Aula 07. A ressalva de lá é mais estreita do
que "explicação corrente": ela diz que o mecanismo vale para os modelos que reduzem os tokens por
média, e que não foi medido quais dos modelos deste curso fazem isso.

**3. Gerar um resumo em linguagem natural e indexar o resumo**, guardando a tabela original
para entrega. É multi-representação (Aula 16): indexa-se o texto descritivo, devolve-se a
grade.

Julgamento: para pergunta sobre valor exato, nenhuma das três compete com carregar a tabela num
banco e consultar. As três valem quando a tabela precisa conviver com prosa no mesmo índice.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/01-DataLoading/05-TableDataLoading
# ⚠️ este módulo mistura duas bases de caminho — leia a nota abaixo antes de rodar tudo daqui
python 01-01-ImportCSV.py
```

O `01-01-ImportCSV.py` roda a parte 4 (`UnstructuredCSVLoader`), que imprime a lista inteira na
linha 43: um documento. Agora **descomente a parte 1**, que imprime só `data[:2]`, e acrescente um
`print(len(data))` antes do laço para ver a contagem. Seis documentos na parte 1, um na parte 4: a
mesma fonte, duas granularidades.

Olhe os seis, não só os dois que o script imprime. O quinto vem torto: a linha do `Wukong` tem uma
vírgula sem aspas dentro da descrição, então os campos deslocam e o documento sai com
`Description: The protagonist`, o resto do texto em `PowerLevel` e o `100` numa chave `None`. O
loader não reclama, a contagem continua em seis, e o registro corrompido entraria no índice. É a
armadilha de CSV que nenhuma contagem mostra.

Depois descomente a parte 3 e olhe o campo `source` no metadado. Antes era o caminho do
arquivo; agora é o valor da coluna `Name`, que no primeiro registro é `Bronzecloud Staff`, um
equipamento.

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

**2. Rode `05-02` com e sem `hi_res`.** Ative `strategy="hi_res"` na linha 20 e compare com a
versão default. Depois compare o resultado do `05-02` com o do `05-01`. O `05-02` não responde nada — ele
**imprime** os nós vizinhos da tabela; leia o que saiu e julgue se aquele entorno bastaria para
responder uma pergunta sobre a tabela.

**3. Pergunte um valor exato ao pipeline vetorial.** Use `04-02` e peça um número que exija
somar duas linhas. O RAG vetorial não soma — ele recupera e o LLM tenta aritmética sobre o que
veio. Compare com o que um `SELECT SUM(...)` daria. É o argumento da Aula 12, sentido na pele.

**4. Meça o custo do camelot.** Três dos sete arquivos de PDF já cronometram, `03-01`, `04-01` e
`06-01`, e os dois que interessam aqui são os dois primeiros. É aí que está a armadilha: no
`03-01` as marcas estão nas linhas 9 e 11, cercando **só** a chamada de leitura do PDF; no `04-01`
estão nas linhas 6 e 39, cercando abertura, extração de todas as páginas, montagem dos DataFrames
**e** a impressão de cada um. Comparar os dois números impressos não compara as duas bibliotecas.
Iguale o escopo pelo denominador comum, que é só a extração: no `03-01` a marca já está certa,
cercando o `read_pdf`; no `04-01`, tire as marcas das linhas 6 e 39 e cerque apenas a linha 14, a
chamada `page.extract_tables()`, somando o tempo de cada página numa variável. Não basta mover o
`end_time` para antes do `print(df)`: dali para trás sobram o `pd.DataFrame(table)` da linha 25 e a
promoção de cabeçalho das linhas 29 e 30, e o equivalente disso no `03-01`, o `table.df` da linha
19, está fora da marca dele. Pelo mesmo motivo não estenda a marca do `03-01` até o fim do laço,
senão você inclui um `df.to_csv` por tabela que o `04-01` não faz. Rode os dois da raiz do
repositório, e note que o `03-01` grava um CSV por tabela no diretório de trabalho: rode-o onde
esses arquivos não incomodem.

---

## Armadilhas de produção

- **Cabeçalho separado das linhas.** A falha número um. Se o chunk tem valores sem nomes de
  coluna, cada número perde o significado — e nada no pipeline avisa.
- **Tabela que atravessa páginas.** O cabeçalho está na página 4, as linhas continuam na 5.
  Extração por página quebra a associação, e nenhuma das bibliotecas resolve isso sozinha.
- **Células mescladas.** Comuns em relatório corporativo, e a maior fonte de grade corrompida.
  Vale inspecionar manualmente uma amostra antes de confiar na extração em lote.
- **Usar busca vetorial onde SQL resolve.** Pergunta sobre valor exato, agregação ou contagem pede
  consulta estruturada. RAG vetorial devolve o trecho mais parecido, não o cálculo correto. Trocar
  a busca vetorial por Text2SQL é sair do RAG vetorial, que é o sentido em uso nesta aula; pela
  tese ampla da Aula 12 você continua dentro de RAG, só recuperando por outro meio.
- **Colunas numéricas como texto.** `difficulty_level` embutido como prosa não permite filtrar
  por faixa. Colunas escalares devem virar metadado filtrável.
- **Ghostscript esquecido.** O `camelot` não é pacote Python puro: sem Ghostscript no sistema, a
  importação passa e a extração falha. O `03-01` guarda o vestígio disso nas linhas 3 e 4, um
  `find_library("gs")` comentado que alguém deixou ali depois de tropeçar.
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
9. Quando você **não** deve usar RAG vetorial para responder sobre uma tabela? E por que a Aula 12
   diria que a alternativa ainda é RAG?

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
> texto e diretórios, dados estruturados, PDF, imagem e tabela. Fica de fora o `99-Others/`, com 9
> arquivos de material alternativo — entre eles um `99-UsingTextract.py`, que extrai PDF com o
> pacote PyPI `textract` (**não** o serviço AWS Textract, apesar do nome: a linha 1 é
> `import textract` e não há `boto3` em nenhum arquivo do repositório) e seria uma sétima abordagem
> para a Aula 05. O fio condutor das três é o mesmo — **o que o
> loader descarta não volta**, e metadado é a parte que todo mundo esquece.
