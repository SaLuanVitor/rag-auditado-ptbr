# AULA 05 — PDF de verdade: layout, OCR e hierarquia

**Fase 1 — Ingestão** · Módulo do repo: `01-DataLoading/04-PDFFileLoading/` (13 arquivos) e `/03-ParsingImageAndTextData/` (3 arquivos)

---

## Pergunta motivadora

Por que existem seis bibliotecas diferentes para extrair texto de PDF, se PDF é um formato
único e padronizado?

Porque **PDF não é um formato de texto.** É um formato de _descrição de página_: um conjunto
de instruções que posiciona glifos em coordenadas. Não existe "o texto do PDF" guardado como
parágrafo — existe "desenhe o glifo `a` em (x, y)". Cada biblioteca **reconstrói** a leitura a
partir dessas posições, com heurística própria, e é por isso que o mesmo arquivo produz saídas
diferentes em cada uma.

E há o caso pior: parte dos PDFs não tem camada de texto nenhuma. São imagens dentro de um
contêiner PDF. A extração "funciona" — devolve string vazia, sem erro. Você indexa nada, o
documento fica invisível para o retriever, e nenhuma métrica de geração acusa.

---

## Modelo mental

### Os três tipos de PDF, e o que cada um exige

| Tipo             | O que tem dentro                             | O que exige             |
| ---------------- | -------------------------------------------- | ----------------------- |
| **Nativo**       | glifos com coordenadas, gerados por software | extração de texto       |
| **Digitalizado** | uma imagem por página                        | **OCR**                 |
| **Híbrido**      | texto nativo + figuras com texto embutido    | extração + OCR seletivo |

O híbrido é o que pega desprevenido: o documento "tem texto", a extração roda, e o diagrama
que continha a informação decisiva não entra.

**Como classificar o acervo sem custo:** extraia texto e conte **caracteres por página**.
Nativo rende centenas; digitalizado rende zero ou lixo isolado. Um limiar simples separa o
acervo inteiro em minutos. Faça por página, não por documento — é assim que o híbrido aparece.

### A escada de fidelidade

O módulo está organizado por quanto de estrutura cada abordagem preserva:

```
texto corrido  →  elementos tipados  →  hierarquia  →  layout com coordenadas

(A escada ordena o **grau de estrutura que você obtém**, não a ordem dos arquivos: o
`05-LangChain-Unstrucured-PDF-ExtractDocumentStructure.py` já sobe dois degraus de uma vez — tem
reconstrução pai-filho por `parent_id`/`element_id` nas linhas 109-133 e uma função
`analyze_layout()` na 53. Sobre esta última, uma ressalva com o que dá para saber daqui: a linha 7 do arquivo tem
`# coordinates=True,` **comentada**. E o `08-AnalyzePDFLayout.ipynb`, no mesmo diretório e citado
adiante nesta aula, liga o parâmetro **explicitamente** e traz coordenadas reais na saída
(`points`, `layout_width`, `layout_height`). Isso é indício forte de que o parâmetro não vem ligado
por padrão — logo, de que o `analyze_layout()` do `05` roda sobre metadado vazio. **Não é prova:**
aquele notebook usa `partition_via_api=True`, então mede o caminho da API, não o `hi_res` local, e
sem instalar o `unstructured` não fecho a pergunta. Mas a evidência estava na mesma pasta, e é mais
honesto usá-la do que declarar a incerteza inteira.)
   PyPDF            partition()         parent-child      caixas na página
   PyMuPDF          Unstructured        Title→Text        fitz + matplotlib
```

Cada degrau custa mais e entrega mais contexto recuperável. A pergunta de engenharia não é
"qual é o melhor", é **qual degrau o meu corpus exige** — e isso depende de quanta informação
está na estrutura em vez de estar no texto.

---

## Parte 1 — Extração: as seis abordagens

`04-PDFFileLoading/` tem **13 arquivos**, e a contagem por _abordagem de biblioteca_ é seis —
o resto são comparações, análise de layout e hierarquia:

| #   | Abordagem                        | Arquivo                                                          | Import-chave                                   |
| --- | -------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| 1   | **PyPDF**                        | `01-UsingPyPDF.py`                                               | `PyPDFLoader` (linha 1)                        |
| 2   | **PyMuPDF**                      | `02-UsingPyMuPDF.py`                                             | `import pymupdf` (linha 1)                     |
| 3   | **OCR**                          | `03-UsingPytesseract+pdf2image.py`                               | `pdf2image` + `pytesseract` (linhas 5–6)       |
| 4   | **LlamaParse**                   | `04-UsingLlamaParser.py`                                         | `from llama_parse import LlamaParse` (linha 6) |
| 5   | **Unstructured via LangChain**   | `05-LangChain-Unstrucured-PDF-*.py` (2 arquivos)                 | `UnstructuredLoader` (linha 2)                 |
| 6   | **Unstructured via `partition`** | `06-Unstrctured-ParsePDFWithPartitionFunction-*.py` (2 arquivos) | `partition()`                                  |

Mais três propósitos distintos: comparação de modos (`07-*.ipynb`), análise de layout
(`08-AnalyzePDFLayout.ipynb`, `08-RenderPDFPageLayout.py`) e hierarquia (`09-Parent-Child-*.py`,
2 arquivos).

Note as grafias do repositório: `Unstrucured` no `05` (sem o segundo `t`), `Unstrctured` no
`06` (sem o `u`), `Unstructed` no `07`, e `ParitionPDF` no `09`. Quatro
erros de digitação diferentes na mesma pasta. Preservo aqui porque é assim que você vai
encontrá-los ao navegar.

### PyPDF contra PyMuPDF

Os dois extraem texto nativo. A diferença prática:

- **PyPDF** vem embrulhado como loader do LangChain — devolve `Document` já com metadados de
  página, pronto para o pipeline.
- **PyMuPDF** (importado como `pymupdf`, historicamente `fitz`) é biblioteca de baixo nível:
  mais rápida, com acesso a coordenadas, imagens e anotações — e sem o embrulho. Você monta o
  `Document` à mão, como a Aula 04 mostrou.

Julgamento: se você só precisa do texto e vai usar LangChain, PyPDF basta. Se precisa de
posição, imagem ou desempenho em acervo grande, PyMuPDF paga o trabalho extra. É o mesmo
PyMuPDF que reaparece no `08-RenderPDFPageLayout.py` para desenhar o layout.

### O caminho do OCR

`03-UsingPytesseract+pdf2image.py` é um pipeline de dois passos, e a linha 14 mostra o
primeiro:

```python
images = pdf2image.convert_from_path('../../99-EN/black-myth-wukong/black_myth_wukong_slides.pdf')
```

**Rasterizar** (PDF → imagens) e depois **reconhecer** (imagem → texto, via `pytesseract`).
Note que o exemplo aplica isso a um PDF que provavelmente é nativo — o objetivo é demonstrar o
mecanismo, não porque seja necessário ali.

Duas coisas que a aula acrescenta e o arquivo não diz: OCR é **ordens de magnitude mais lento**
que extração nativa, e é **imperfeito** — confunde `0`/`O`, `1`/`l`, erra em tabela e em texto
girado. Nunca aplique OCR indiscriminadamente: classifique primeiro, OCR só no que precisa, e
**grave a qualidade da extração como metadado** (caracteres por página, confiança do OCR). Sem
esse metadado você não distingue "não está no acervo" de "está, mas ilegível" — e são
problemas com soluções opostas.

### LlamaParse: o PDF vira Markdown

`04-UsingLlamaParser.py` tem a abordagem conceitualmente mais distinta:

```python
documents = LlamaParse(result_type="markdown").load_data(   # linha 7
...
from llama_index.core.node_parser import MarkdownElementNodeParser   # linha 12
```

Em vez de extrair texto, ele **converte o PDF em Markdown** — títulos viram `#`, tabelas viram
tabelas de Markdown — e então usa um parser de elementos de Markdown para produzir os nós.

A ideia é forte: Markdown é um formato que já carrega hierarquia, e converter para ele
preserva estrutura que texto corrido perderia. O custo: é **serviço na nuvem**, exige chave de
API, e seu documento sai da sua infraestrutura. Para documento sensível, isso decide a questão
antes de qualquer comparação de qualidade.

### `strategy="hi_res"`, o parâmetro que mais muda resultado

Os dois arquivos `05-*` usam o `UnstructuredLoader` do LangChain com a mesma configuração
central — `strategy="hi_res"`, linha 5 em ambos:

| Arquivo                                                    | Propósito                       |
| ---------------------------------------------------------- | ------------------------------- |
| `05-LangChain-Unstrucured-PDF-SimpleDisplay.py`            | exibe os elementos              |
| `05-LangChain-Unstrucured-PDF-ExtractDocumentStructure.py` | extrai a estrutura do documento |

`hi_res` aciona análise de layout baseada em modelo de visão: em vez de ler a sequência de
glifos, o Unstructured **olha a página** e classifica regiões — isto é título, isto é tabela,
isto é figura. É o que permite lidar com layout de múltiplas colunas, em que a extração
ingênua atravessa colunas e intercala frases de trechos diferentes.

Custo: `hi_res` é significativamente mais lento que a estratégia rápida, e baixa modelos na
primeira execução. É a troca clássica desta aula — fidelidade estrutural contra tempo de
ingestão.

### O par 06: mesma técnica, verbosidade diferente

Rodando `diff` entre `06-Unstrctured-ParsePDFWithPartitionFunction-v1.py` e `-v2.py`, o núcleo
é idêntico: os dois chamam `partition(filename=filename, content_type="application/pdf")`.

A diferença é **o que cada um mostra**. O `v1` imprime a representação em string dos 10
primeiros elementos. O `v2` é comentado passo a passo e imprime o **tipo** de cada elemento
junto com o conteúdo, nos 5 primeiros.

Não é uma evolução de técnica — é a mesma chamada, uma vez enxuta e uma vez instrumentada para
inspeção. Rode o `v2`: ver os tipos (`Title`, `NarrativeText`, `Table`) é o que torna concreto
o que "elementos tipados" significa.

### Layout desenhado na página

`08-RenderPDFPageLayout.py` importa `fitz` (PyMuPDF), `matplotlib.patches`, `matplotlib.pyplot`
e `PIL.Image` — linhas 1 a 4. Ele **renderiza a página como imagem e desenha polígonos** sobre
as regiões detectadas.

**Julgamento:** é o exercício mais subestimado do módulo. Depurar ingestão de PDF lendo texto extraído é
adivinhação; **ver as caixas desenhadas sobre a página** mostra na hora que a coluna da direita
foi lida antes da esquerda, ou que a tabela virou um bloco só. Quando um PDF der problema no
seu projeto, comece por aqui.

### O par 09: hierarquia por dois caminhos

O `diff` mostra que os dois arquivos fazem a mesma coisa com APIs diferentes:

| Arquivo                                       | Como                                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `09-Parent-Child-Unstructured-LangChain.py`   | `UnstructuredLoader` do `langchain_unstructured`                                                         |
| `09-Parent-Child-Unstructured-ParitionPDF.py` | `partition_pdf` direto, importando `Title`, `NarrativeText`, `Text` de `unstructured.documents.elements` |

O segundo importa os **tipos de elemento explicitamente**, o que deixa a lógica de agrupamento
mais legível: você vê no código quais categorias viram pai.

⚠️ Repetindo a ressalva da Aula 04, porque aqui ela é ainda mais tentadora: **isto não é a
estratégia parent-child de indexação da Aula 15.** Não há embedding, índice nem recuperação
nestes arquivos. É reconstrução de hierarquia documental a partir dos metadados do parser —
a matéria-prima que _permitiria_ fazer small-to-big depois. Mesmo nome, mecanismo diferente.

---

## Parte 2 — Quando o conteúdo é imagem

`03-ParsingImageAndTextData/` tem 3 arquivos, e o terceiro muda o jogo:

| Arquivo                         | Abordagem                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `01-Unstructured-ReadImages.py` | `UnstructuredImageLoader` (linha 1) — OCR embrulhado                                                    |
| `02-Unstructured-ReadPPT.py`    | `partition_ppt(filename=".../black_myth_wukong_slides.pptx")` (a chamada está sozinha na linha 16; a 14 é o import)                            |
| `03-LLM-ReadImagesAndText.py`   | **modelo multimodal** — `convert_from_path` + `base64` + `OpenAI`, com `model="gpt-4o-mini"` (linha 35) |

O `03` é a abordagem mais recente e, **julgamento**, a mais poderosa: rasteriza a página, codifica em base64,
manda para um modelo de visão e pede a **descrição do conteúdo**. Depois embrulha o resultado
num `Document` (linha 59; a 56 é só o import).

O que isso resolve que OCR não resolve: OCR lê caracteres; o modelo multimodal **interpreta**.
Um gráfico de barras não tem texto além dos rótulos — o OCR devolve rótulos soltos, e o modelo
devolve "gráfico mostrando crescimento de receita de 2020 a 2024, com queda em 2022". A segunda
saída é recuperável por busca semântica; a primeira não.

O custo é proporcional: uma chamada de LLM multimodal **por página**, o que em acervo grande
domina o orçamento de ingestão. É custo pago uma vez, na ingestão, e não por query — mas é
real. Julgamento: reserve para as páginas onde a informação está na figura, não como default do
acervo. Isso exige saber quais são — o que nos devolve à classificação por tipo de página.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/01-DataLoading/04-PDFFileLoading
python 01-UsingPyPDF.py
python 02-UsingPyMuPDF.py
```

Compare as duas saídas para o mesmo arquivo. Quebras de linha, espaçamento e ordem podem
divergir — e a mesma página extraída por dois deles vira dois textos com fronteiras diferentes
quando você for chunkar. A Aula 07 trata de fronteiras de chunk, mas **não** retoma o efeito da
escolha de extrator sobre elas: é dívida aberta do curso, não promessa cumprida.

```powershell
python 06-Unstrctured-ParsePDFWithPartitionFunction-v2.py
```

Leia os **tipos** impressos. Esta é a diferença entre extrair e particionar, vista em saída
concreta.

```powershell
python 05-LangChain-Unstrucured-PDF-SimpleDisplay.py
```

Primeira execução baixa modelos de layout — leva tempo. Compare a estrutura obtida com a saída
crua do `01-UsingPyPDF.py`.

Depois abra `07-Unstructed-PDF-CompareVariousModes.ipynb`, que compara modos lado a lado, e
`08-AnalyzePDFLayout.ipynb`, que é onde as caixas aparecem desenhadas.

---

## Quebre de propósito

**1. Meça a densidade de texto.** Escreva um laço curto sobre as páginas do PDF com PyMuPDF
imprimindo `len(page.get_text())`. É o classificador nativo/digitalizado da seção "Modelo
mental", em cinco linhas. Rode nos PDFs de `90-Data/ComplexPDF/` e veja a distribuição.

**2. Troque `hi_res` pela estratégia rápida.** Em `05-LangChain-Unstrucured-PDF-SimpleDisplay.py`,
mude `strategy="hi_res"` para `"fast"`. Cronometre os dois e compare a estrutura. Quanto de
fidelidade o tempo comprou?

**3. Rode OCR num PDF nativo.** Aplique `03-UsingPytesseract+pdf2image.py` a um PDF que já tem
texto e compare com a extração direta. O OCR vai introduzir erros num arquivo que não precisava
dele — argumento empírico contra "OCR em tudo por segurança".

**4. Compare OCR com modelo multimodal na mesma página.** Escolha uma página com gráfico ou
diagrama, rode `01-Unstructured-ReadImages.py` e depois `03-LLM-ReadImagesAndText.py`. A
diferença entre ler caracteres e interpretar conteúdo fica óbvia em uma execução.

---

## Armadilhas de produção

- **PDF digitalizado sem OCR.** A falha mais silenciosa do RAG inteiro: extração devolve vazio,
  ninguém percebe, e parte do acervo simplesmente não existe para o sistema.
- **Sem metadado de qualidade de extração.** Sem `chars_per_page` ou confiança do OCR gravados,
  você não sabe distinguir ausência de ilegibilidade — e não sabe o que reprocessar quando
  tiver orçamento.
- **`hi_res` como default em acervo grande.** Multiplica o tempo de ingestão. Meça se a
  estratégia rápida já resolve para a maioria dos seus documentos, e reserve `hi_res` para os
  que têm layout complexo.
- **Layout de múltiplas colunas.** Extração ingênua atravessa colunas e produz frases
  intercaladas de trechos diferentes — texto que parece válido e é uma colagem. Só análise de
  layout resolve.
- **Serviço externo com documento sensível.** LlamaParse e APIs multimodais enviam seu conteúdo
  para fora. Para contrato, prontuário ou dado pessoal, isso é decisão de conformidade, não de
  qualidade.
- **Tabela em PDF.** Nenhuma abordagem desta aula resolve bem sozinha: o cabeçalho se separa das
  linhas e cada número perde o significado. É assunto da Aula 06, e é onde o `camelot` entra. O
  `MarkdownElementNodeParser` do LlamaParse, que a Parte 1 desta aula já mostrou, é a outra metade
  da resposta.
- **Custo do multimodal.** Uma chamada de LLM por página é o item que mais surpreende no
  orçamento. Aplique seletivamente.

---

## Checkpoint

1. Por que o mesmo PDF produz saídas diferentes em bibliotecas diferentes?
2. Quais são os três tipos de PDF, e como você classifica um acervo inteiro sem rodar OCR em
   tudo?
3. Por que a classificação deve ser por página e não por documento?
4. O que `strategy="hi_res"` aciona, e o que você paga por isso?
5. O que diferencia LlamaParse das outras abordagens de extração? Qual o custo não técnico?
6. Qual a diferença entre o que o OCR entrega e o que um modelo multimodal entrega para a mesma
   figura?
7. Os arquivos `09-Parent-Child-*` implementam a estratégia parent-child de indexação?
   Justifique.
8. Por que "OCR em tudo, por segurança" é má ideia?
9. Qual metadado desta fase é o mais valioso e o mais frequentemente esquecido?

---

## Vocabulário

`parsing` · `OCR` · `layout analysis` · `Unstructured` · `partition` · `parent-child` ·
`document` · `loader`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 04 — Carregando texto, JSON, Markdown e páginas web](AULA-04-carregando-texto-json-web.md)
**Próxima:** [AULA 06 — Tabelas, CSV e bancos SQL como fonte](AULA-06-tabelas-csv-sql.md)
