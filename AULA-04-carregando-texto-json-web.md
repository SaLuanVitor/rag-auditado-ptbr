# AULA 04 — Carregando texto, JSON, Markdown e páginas web

**Fase 1 — Ingestão** · Módulo do repo: `01-DataLoading/01-SimpleTextLoading/` e `/02-StructuredDocumentLoading/`

---

## Pergunta motivadora

Ler um arquivo de texto é `open()`. Por que existem dez bibliotecas para isso, e por que o
livro dedica 61 arquivos ao assunto?

Porque "ler" não é o problema. O problema é **o que sobra depois de ler**. Um mesmo arquivo
JSON pode virar uma string única e inútil ou vinte documentos com metadados aproveitáveis,
dependendo de qual loader você escolhe — e essa escolha acontece antes de qualquer embedding,
antes de qualquer chunk, antes de qualquer decisão que os capítulos seguintes vão tomar.

Esta é a origem de falha que a Aula 01 põe **em primeiro lugar na ordem de diagnóstico** (é a
terceira na ordem em que aquela aula as apresenta) e, como lá, a mais silenciosa — julgamento, não
medição: **falha de
ingestão não gera erro.** Gera um acervo que o sistema simplesmente não conhece.

---

## Modelo mental

### O que um loader realmente produz

Todo loader do LangChain devolve uma lista de objetos `Document`, e cada um tem duas partes:

| Campo          | Conteúdo                                        | Por que importa                             |
| -------------- | ----------------------------------------------- | ------------------------------------------- |
| `page_content` | o texto                                         | vira embedding, vira chunk, vai ao LLM      |
| `metadata`     | fonte, página, categoria, o que o loader souber | **viabiliza filtro, citação e diagnóstico** |

**Julgamento:** a assimetria de atenção entre os dois campos é o erro de iniciante mais caro
desta fase.
Todo mundo cuida do `page_content`; quase ninguém cuida do `metadata`. E é o `metadata` que
permite responder "só documentos de 2024", citar a fonte na resposta, e — no dia em que algo
der errado — descobrir de onde veio o trecho ruim.

**Metadado descartado na ingestão não volta.** Recuperá-lo depois significa reprocessar o
acervo inteiro.

### As três decisões desta aula

1. **Um arquivo ou um diretório?** Carregar em lote traz problemas que o arquivo único não
   tem: tipos misturados, arquivos corrompidos, e a pergunta de qual parser aplicar a quê.
2. **O dado tem estrutura?** JSON e Markdown carregam hierarquia. Você pode preservá-la ou
   achatá-la — e achatar é o default silencioso.
3. **A fonte é local ou viva?** Página web muda, bloqueia e quebra reprodutibilidade.

---

## Parte 1 — Texto simples e diretórios

`01-DataLoading/01-SimpleTextLoading/` tem **11 arquivos**. Note que a numeração salta o
`04` — não existe arquivo com esse prefixo. Separados por biblioteca, conferindo os imports e
não os nomes:

| Biblioteca              | Arquivos                                                                                                                                                                                                                                                                                                                                           | Total |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| **LangChain**           | `00-SimpleDocumentImport(LangChain).ipynb`, `01-LoadTxtFileWithLangChain.py`, `02-BuildLangChainDocumentObject.py`, `03-01-LoadAllDocumentsInDirectoryWithLangChain.py`, `03-02-SpecifyParamsWhenLoadingDirectoryWithLangChain.py`, `03-03-ChangeToolWhenLoadingDirectoryWithLangChain.py`, `03-04-SkipErrorsWhenLoadingDirectoryWithLangChain.py` | 7     |
| **LlamaIndex**          | `05-LoadDirectoryDocumentsWithLlamaIndex.py`, `06-LlamaIndex-BuildDocumentObject.py`                                                                                                                                                                                                                                                               | 2     |
| **Unstructured direto** | `07-UsingUnstructured_v1.py`, `07-UsingUnstructured_v2.py`                                                                                                                                                                                                                                                                                         | 2     |

O par `01`/`02` e o par `05`/`06` são simétricos de propósito: cada biblioteca aparece
**carregando** um arquivo e depois **construindo à mão** um objeto `Document`. Construir à mão
é o exercício que revela que `Document` não tem mágica — é um par (texto, metadados) que você
pode montar de qualquer fonte, inclusive de um banco ou de uma API que loader nenhum cobre.

### A escada do `DirectoryLoader`

Os quatro arquivos `03-*` são a mesma chamada com o `DirectoryLoader` configurado de formas
diferentes — e **não** é uma escada aditiva, apesar de parecer. O `diff` mostra troca, não
acumulação: `03-01`→`03-02` acrescenta três parâmetros de uma vez (`glob`, `use_multithreading`,
`show_progress`); `03-02`→`03-03` acrescenta `loader_cls` e **remove** os dois últimos;
`03-03`→`03-04` acrescenta `silent_errors` e **remove** o `glob`, de modo que o último arquivo da
série já não filtra por Markdown. **Julgamento:** ainda é a sequência mais gradual
sequência didática do módulo:

| Arquivo                                                      | Chamada                                                             | O que acrescenta                   |
| ------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------- |
| `03-01-LoadAllDocumentsInDirectoryWithLangChain.py:66`       | `DirectoryLoader(data_dir)`                                         | o caso ingênuo: pega tudo          |
| `03-02-SpecifyParamsWhenLoadingDirectoryWithLangChain.py:10` | `+ glob="**/*.md"`, `use_multithreading=True`, `show_progress=True` | filtra por tipo e paraleliza       |
| `03-03-ChangeToolWhenLoadingDirectoryWithLangChain.py:11`    | `+ loader_cls=TextLoader`                                           | escolhe o parser                   |
| `03-04-SkipErrorsWhenLoadingDirectoryWithLangChain.py:12`    | `+ silent_errors=True`                                              | não morre no primeiro arquivo ruim |

O `loader_cls` do `03-03` existe porque o `DirectoryLoader` tem um default que muita gente
não sabe que está usando: quando você não especifica, ele recorre ao **Unstructured** para
formatos que o `TextLoader` não lê — `.pdf`, `.pptx`, `.jpg`. Por isso o `03-01` **depende** de
`unstructured` sem que nada no código diga isso: `grep "^import unstructured"` no arquivo não
encontra nada — os únicos imports são `os` e `DirectoryLoader` (linhas 57-58). A dependência é
transitiva, do comportamento padrão do loader, e só está registrada em prosa, dentro do
docstring de troubleshooting. O diretório-alvo contém de fato `.pptx` e `.pdf`. É um caso de
manual: o que quebra a instalação não aparece na lista de imports.

⚠️ **O `silent_errors=True` do `03-04` merece cautela em produção.** Ele resolve o sintoma
certo — um arquivo corrompido não deve derrubar a ingestão de dez mil — mas engole a
informação de _quais_ falharam. Sem log próprio, você fica com um acervo incompleto e nenhum
registro de o que ficou de fora. Combine com contagem: quantos arquivos existem no diretório
versus quantos `Document` voltaram. A diferença é o seu problema silencioso.

---

## Parte 2 — Dados estruturados

`01-DataLoading/02-StructuredDocumentLoading/` tem **6 arquivos**, e os dois primeiros formam
um contraste que vale ler com atenção.

### JSON como texto contra JSON como estrutura

**`01-LangChain-TextLoader-JSON.py:3`** carrega um arquivo JSON com o loader de **texto**:

```python
text_loader = TextLoader("../../99-EN/black-myth-wukong/journey_to_the_west_characters.json")
```

Funciona. Não dá erro. E produz **um único `Document`** cujo `page_content` é o arquivo
inteiro — chaves, colchetes, aspas e vírgulas incluídos. A estrutura vira ruído textual: o
embedding desse documento carrega `{`, `"name":` e todo o resto como se fossem conteúdo.

**`02-LangCHain-JSONLoader-JSON.py`** faz o oposto, com `jq_schema` — a sintaxe do `jq` para
extrair e formatar campos. E usa **dois loaders sobre o mesmo arquivo**:

```python
main_loader = JSONLoader(
    file_path="../../99-EN/black-myth-wukong/black_myth_wukong_characters.json",
    jq_schema='.mainCharacter | "Name: " + .name + ", Background: " + .backstory',   # linha 6
...
support_loader = JSONLoader(
    file_path="../../99-EN/black-myth-wukong/black_myth_wukong_characters.json",
    jq_schema='.supportCharacters[] | "Name: " + .name + ", Background: " + .background',  # linha 14
```

Três coisas para notar:

1. O `jq_schema` **não só extrai, ele formata**: monta a frase `"Name: X, Background: Y"`. O
   texto que vai virar embedding é escrito por você, não despejado pelo arquivo. Isso é
   controle sobre a representação — o assunto da Fase 2 começando aqui.
2. O `[]` na linha 14 itera o array: cada personagem de apoio vira **um `Document`
   separado**. Granularidade decidida na ingestão, antes de qualquer chunking.
3. Os dois loaders leem o **mesmo arquivo** com esquemas diferentes, porque o personagem
   principal e os secundários têm campos distintos — `backstory` contra `background`. Dado
   estruturado real é irregular assim, e um loader só não dá conta.

Repare também no nome do arquivo: `LangCHain`, com o `H` maiúsculo. Erro de digitação do
repositório, preservado aqui porque é assim que você vai encontrá-lo.

### Markdown: dois modos no mesmo arquivo

`04-LangChain-UnstructuredMarkdownLoader.py` carrega
`"../../99-EN/black-myth-wukong/black_myth_wukong_versions.md"` (linha 4) de **duas maneiras**:

```python
loader = UnstructuredMarkdownLoader(markdown_path)                      # linha 5  — default
loader = UnstructuredMarkdownLoader(markdown_path, mode="elements")     # linha 10 — elementos
```

O default entrega o documento como texto corrido. O `mode="elements"` entrega **uma lista de
elementos tipados** — título, parágrafo, item de lista — cada um com sua categoria no
metadado. É a diferença entre extrair e particionar, e está demonstrada com uma linha de
diferença no mesmo arquivo.

### Página web: o que carregar e o que descartar

`03-LangChain-WebBaseLoader.py` carrega
`page_url = "https://en.wikipedia.org/wiki/Black_Myth:_Wukong"` (linha 4). O arquivo traz a
versão ingênua **comentada** nas linhas 5 a 11, e a versão boa ativa a partir da linha 15:

```python
loader = WebBaseLoader(
    web_paths=[page_url],
    bs_kwargs={
        "parse_only": bs4.SoupStrainer(id="bodyContent"),
    },
)
```

O `SoupStrainer(id="bodyContent")` restringe o parsing ao corpo do artigo. Sem ele, você
indexa menu de navegação, rodapé, barra lateral, avisos de licença — texto que compete no
ranking sem responder pergunta nenhuma. O autor deixou as duas versões justamente para você
rodar as duas e comparar o volume.

Duas ressalvas que a aula precisa fazer e o arquivo não faz:

- **Reprodutibilidade.** A página muda. Seu teste de hoje não é o teste de amanhã, e a
  Wikipédia pode bloquear requisições automatizadas. Para desenvolver, prefira a cópia
  offline em `99-EN/black-myth-wukong/black_myth_wukong_wiki.txt`.
- **O seletor é específico do site.** `id="bodyContent"` é da Wikipédia. Em outro site você
  precisa inspecionar o HTML e descobrir o seletor certo — e ele quebra quando o site muda de
  layout. Scraping para RAG é manutenção contínua, não configuração única.

### Elementos tipados, e o que eles ainda não são

Os dois últimos arquivos usam o Unstructured **via LangChain** (`from langchain_unstructured import
UnstructuredLoader`) — não confundir com o uso direto de `07-UsingUnstructured_v1/_v2.py`, que
importam `unstructured.partition` sem wrapper nenhum. A Aula 05 mantém essa mesma distinção:

- **`05-01-Unstrutured-SimpleExample.py:7`** imprime
  `f'{doc.metadata["category"]}: {doc.page_content}'` — mostra que cada elemento vem com uma
  **categoria**.
- **`05-02-Unstrutured-OrganizeParentChildElements.py`** agrupa elementos em pares pai-filho.
  A lógica está nas linhas 12 a 17: quando a categoria é `Title` ou `Table`, o elemento vira
  pai e seu `element_id` é guardado; os elementos seguintes cujo `parent_id` bate são
  associados a ele.

⚠️ **Uma distinção que vale evitar confundir** — e que eu próprio confundi na primeira
avaliação deste curso: isto **não é** a estratégia parent-child de indexação da Aula 15. Aqui
não há embedding, não há índice e não há recuperação. É reconstrução de **hierarquia
documental** a partir dos metadados que o parser produziu. O nome é o mesmo, o mecanismo é
outro. O que este código entrega é a informação estrutural que _permitiria_ fazer
parent-child de indexação depois — matéria-prima, não a técnica.

Note a grafia `Unstrutured`, sem o `c` nos dois nomes de arquivo.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/01-DataLoading/01-SimpleTextLoading
python 01-LoadTxtFileWithLangChain.py
python 02-BuildLangChainDocumentObject.py
```

Compare: o primeiro carrega, o segundo constrói. Olhe o `metadata` de cada — quais campos o
loader preencheu sozinho?

```powershell
python 03-01-LoadAllDocumentsInDirectoryWithLangChain.py
python 03-02-SpecifyParamsWhenLoadingDirectoryWithLangChain.py
```

Compare a **contagem de documentos**. O `03-01` pega tudo; o `03-02` filtra por `**/*.md`.
A diferença é o que o filtro excluiu — e a pergunta é se você queria excluir aquilo.

Agora o contraste central:

```powershell
cd ../02-StructuredDocumentLoading
python 01-LangChain-TextLoader-JSON.py
python 02-LangCHain-JSONLoader-JSON.py
```

Conte os `Document` que cada um produziu e leia o `page_content` do primeiro de cada. O
`TextLoader` produz um blob com sintaxe JSON no meio; o `JSONLoader` produz frases limpas.
Pergunte-se qual dos dois você gostaria de ter no índice quando alguém perguntar "quem é o
personagem principal?".

E o modo do Markdown:

```powershell
python 04-LangChain-UnstructuredMarkdownLoader.py
```

O arquivo roda os dois modos em sequência. Compare a saída do default com a de
`mode="elements"` e olhe o campo `category`.

---

## Quebre de propósito

**1. Remova o `SoupStrainer`.** Em `03-LangChain-WebBaseLoader.py`, descomente a versão
ingênua das linhas 6–11 e desative o filtro. Meça o tamanho do `page_content` antes e depois.
Quanto do que você indexaria seria menu e rodapé?

**2. Aponte o `TextLoader` para um PDF.** Em vez de `.json`, dê a ele um `.pdf`. Observe o
resultado: bytes binários como texto, ou erro. Isso fixa que loader não é intercambiável — e
prepara a Aula 05.

**3. Corrompa um arquivo e rode `03-04`.** Crie um arquivo inválido no diretório e rode a
versão com `silent_errors=True`. Ela conclui sem reclamar. Agora conte quantos documentos
voltaram contra quantos arquivos existem — e veja o buraco que o silêncio produziu.

**4. Troque o `jq_schema` por `.` puro.** Em `02-LangCHain-JSONLoader-JSON.py`, use
`jq_schema='.'`. Você volta ao comportamento do `TextLoader`: o JSON inteiro como texto. É a
prova de que o ganho do `JSONLoader` está no esquema, não na classe.

---

## Armadilhas de produção

- **Metadado perdido.** Se `metadata` sai vazio, você perdeu filtro, citação e diagnóstico de
  uma vez. Verifique o `metadata` do primeiro documento **sempre**, logo após carregar.
- **`silent_errors` sem contagem.** Silenciar erro sem contar o que ficou de fora é criar um
  acervo incompleto sem registro.
- **JSON achatado.** **Julgamento:** é a falha desta aula que mais aparece em produção, porque não dá erro:
  alguém aponta o `TextLoader` para um `.json`, o pipeline roda, e a recuperação fica ruim
  sem explicação.
- **Scraping como fonte permanente.** Site muda, bloqueia, muda de layout. Se o conteúdo
  importa, capture uma cópia e versione — não dependa da página no momento da ingestão.
- **Encoding.** `TextLoader` assume UTF-8. Arquivo em Latin-1 vira mojibake sem erro, e
  acentuação quebrada destrói a tokenização de qualquer texto em português. O parâmetro
  `encoding=` existe; use-o quando a origem for incerta.
- **Ordem e duplicata em diretório.** `DirectoryLoader` não garante ordem, e o mesmo conteúdo
  em dois arquivos vira dois documentos que competem no ranking. Deduplicar é trabalho da
  ingestão, não da recuperação.

---

## Checkpoint

1. Quais são os dois campos de um `Document`, e por que o segundo é mais negligenciado do que
   deveria?
2. Por que existem quatro arquivos `03-*` em vez de um? O que cada parâmetro acrescenta?
3. O que acontece quando você carrega um `.json` com `TextLoader`? Por que isso não dá erro?
4. O que o `jq_schema` faz além de extrair campos? Por que o exemplo precisa de **dois**
   loaders sobre o mesmo arquivo?
5. Qual a diferença entre `UnstructuredMarkdownLoader(path)` e o mesmo com
   `mode="elements"`?
6. Para que serve o `SoupStrainer` no `WebBaseLoader`, e por que ele é específico de cada
   site?
7. Em `05-02`, o agrupamento pai-filho **é** a estratégia parent-child de indexação? Justifique
   a diferença.
8. Por que `silent_errors=True` resolve um problema e cria outro?

---

## Vocabulário

`loader` · `document` · `parsing` · `layout analysis` · `parent-child` · `corpus`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 03 — Seu primeiro RAG](AULA-03-primeiro-rag.md)
**Próxima:** [AULA 05 — PDF de verdade: layout, OCR e hierarquia](AULA-05-pdf-layout-ocr-hierarquia.md)
**Relacionada:** [AULA 07 — Chunking](AULA-07-chunking.md), que decide o que fazer com o texto
que esta aula produziu.
