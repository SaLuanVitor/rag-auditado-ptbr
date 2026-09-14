# AULA 07 — Chunking: por caractere, recursivo, por código e semântico

**Fase 2 — Representação** · Módulo do repo: `02-DocChunking/` (9 arquivos)

---

## Pergunta motivadora

Você tem um documento de 40 páginas e um modelo de embedding que aceita 512 tokens. Precisa
cortar. Onde?

Parece decisão de implementação, um parâmetro a preencher. **É, no meu julgamento, a decisão de
maior impacto em qualidade de resposta de todo o pipeline, e a mais negligenciada.** Ela determina o
que é possível recuperar: **informação cortada ao meio não é recuperável por nenhum modelo de
embedding, nenhum reranking e nenhum prompt.** Os capítulos seguintes só conseguem trabalhar com o
que esta aula deixou intacto.

---

## Modelo mental

### A tensão que não tem solução dentro de um número só

Escolher `chunk_size` é escolher entre dois objetivos que puxam em direções opostas:

| Objetivo               | Quer chunk… | Por quê                                                  |
| ---------------------- | ----------- | -------------------------------------------------------- |
| **Embedding preciso**  | **menor**   | um chunk sobre um assunto só produz vetor bem localizado |
| **Geração competente** | **maior**   | o LLM precisa do entorno para responder                  |

O lado do embedding merece cuidado, porque a intuição engana. Um chunk grande não produz "um vetor
com mais informação" — produz um vetor que se aproxima da **média** das direções dos assuntos que
ele contém. (Isto vale para modelos que reduzem os tokens por média; não medi qual dos modelos deste
curso o faz.) Média de direções distintas aponta para o meio de lugar nenhum: o vetor fica
equidistante de tudo e próximo de nada. É por isso que chunk grande degrada recuperação em vez de
melhorá-la.

Do outro lado, a sentença isolada "o prazo é de 30 dias" tem embedding lindo e é inútil na
geração: prazo de quê?

Com um único número você escolhe qual dos dois sacrificar. **A Aula 15 (small-to-big) dissolve
a tensão** desacoplando o que se indexa do que se entrega. Esta aula é sobre fazer a melhor
escolha enquanto ela ainda é uma escolha só — e sobre entender por que ela dói.

### Os quatro mecanismos, em ordem crescente de sofisticação

**1. Corte por contagem fixa** (`CharacterTextSplitter`). Um separador, um tamanho. Cego à
estrutura: corta no meio de frase com frequência, e meia frase produz embedding ruim e
contexto inútil.

**2. Corte recursivo** (`RecursiveCharacterTextSplitter`). Uma **lista ordenada** de
separadores. Tenta o primeiro; se o pedaço ainda exceder o tamanho, aplica o próximo
separador _só naquele pedaço_, e assim por diante. O efeito é respeitar a hierarquia natural
do texto: só quebra parágrafo quando obrigado, só quebra frase quando obrigado, só quebra
palavra em último caso. É o default sensato para prosa.

**3. Corte por linguagem de programação** (`from_language`). Mesmo algoritmo recursivo, lista
de separadores trocada pelas palavras-chave de declaração da linguagem — `class `, `def `
para Python. O splitter passa a preferir quebrar **entre** declarações.

**4. Corte semântico** (`SemanticSplitterNodeParser`). Abandona separadores. Embute grupos de
sentenças e corta onde a **distância entre vizinhos cresce**, sinalizando mudança de assunto.
O texto decide onde ser cortado.

Note a progressão: 1 e 2 são **sintáticos** (olham caracteres), 3 é **sintático com
conhecimento de domínio** (sabe o que é uma função), 4 é **semântico** (usa embeddings para
decidir). O custo **não** sobe em degraus iguais: 1, 2 e 3 são o mesmo trabalho de string e custam
praticamente o mesmo — o nível 3 é o algoritmo recursivo com outra lista de separadores. O salto
está no 4, que faz chamadas de embedding durante a _ingestão_ e em acervo grande costuma ser,
**julgamento**, o item mais caro do pipeline. Verificado em
`llama_index.core.node_parser.text.semantic_splitter`, que chama
`get_text_embedding_batch` sobre os grupos de sentenças e depois `similarity` por par de vizinhos,
na 0.12.15 extraída.

---

## Código do repositório

O módulo tem 9 arquivos — 7 `.py`, um `.env.example` e um `.txt`. Ordem de leitura:

| Ordem | Arquivo                                         | O que demonstra                            |
| ----- | ----------------------------------------------- | ------------------------------------------ |
| 1     | `01-LangChain-CharacterTextSplitter.py`         | corte fixo                                 |
| 2     | `02-LangChain-RecursiveharacterTextSplitter.py` | corte recursivo com separadores explícitos |
| 3     | `04-LangChain-PlainChunkingForCode.py`          | código cortado com splitter genérico       |
| 4     | `04-LangChain-ChunkingForCode.py`               | o mesmo código com splitter de linguagem   |
| 5     | `05-LlamaIndex-SemanticChunking.py`             | corte semântico, com controle              |
| 6     | `03_LlamaIndex-ChunkSizeAffectsAccuracy.py`     | o experimento que fecha a aula             |

Os arquivos `01` e `02` carregam **a mesma fonte** —
`TextLoader("../99-EN/shanxi-tourism/yungang_grottoes.txt")`, linha 3 em ambos — e usam
**os mesmos valores**, `chunk_size=100` e `chunk_overlap=10`. Contraste controlado: só o
algoritmo muda.

Repare no nome do arquivo `02`: `Recursiveharacter`, sem o `C`. Erro de digitação do
repositório, preservado aqui porque é assim que você vai encontrá-lo.

### Dois comentários que mentem — e por que isso interessa

Abra `01-LangChain-CharacterTextSplitter.py` nas linhas 5, 7 e 8. A 5 já mente nos dois valores
(`# Configure the splitter: chunk size of 50 characters, no overlap`, sobre um splitter de 100 com
sobreposição de 10), e as duas seguintes repetem a mentira campo a campo:

```python
    chunk_size=100,  # each text chunk is 50 characters
    chunk_overlap=10,  # no overlap between chunks
```

O comentário da linha 7 diz **50**; o valor é **100**. O da linha 8 diz que **não há**
sobreposição; o valor é **10**. Ambos errados, ambos plausíveis, ambos no primeiro arquivo do
módulo.

Isso não é curiosidade. É o hábito profissional que esta aula quer instalar: **o comentário é
opinião do autor no passado; o código é o que roda.** Quem lê o comentário sai com dois
números errados na cabeça e vai depurar o pipeline com o modelo mental trocado. Em todo este
curso, quando comentário e código divergem, o código vence.

### O separador que nunca casa

Em `02-LangChain-RecursiveharacterTextSplitter.py:6`:

```python
separators = ["\n\n", ".", "，", " "] # . is period, ， is comma, " " is space
```

O terceiro separador é `，` — a **vírgula de largura total** (U+FF0C, _fullwidth comma_), usada em
chinês, não a vírgula latina `,`. Num corpus em inglês ou português ela nunca casa, então a lista
efetiva é `["\n\n", ".", " "]`.

É resíduo da origem do livro, da mesma família do `bge-small-zh` que você viu na Aula 03. Não
quebra nada — só faz um separador ser decorativo. Para um corpus em português, a lista útil
seria `["\n\n", "\n", ".", ",", " ", ""]`.

### O par que isola a variável

`04-LangChain-ChunkingForCode.py` e `04-LangChain-PlainChunkingForCode.py` são, **julgamento**, o
experimento mais bem construído do módulo. Rodando `diff` entre os dois, a diferença **relevante**
está no splitter — o corpo de código de exemplo (`GAME_CODE`) é o mesmo, e o tamanho também. O
`diff` cru mostra mais que isso: **dois** blocos de import extras — `Language` na linha 2 e um
import agrupado nas linhas 6-9 que reimporta `Language` e o `RecursiveCharacterTextSplitter` que já
vinha na linha 1 —, a chamada de `get_separators_for_language(Language.JS)` que só existe no
primeiro, comentários e nomes de variável diferentes (`python_docs` vs. `text_chunks`). Nada disso
muda o experimento. A tabela abaixo é leitura da **configuração** dos dois arquivos, não do que eles
imprimem — na tela saem os chunks (`Content:` e `Metadata:`), não estes parâmetros:

|                 | `04-LangChain-ChunkingForCode.py`                                                            | `04-LangChain-PlainChunkingForCode.py`                    |
| --------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Splitter        | `RecursiveCharacterTextSplitter.from_language(language=Language.PYTHON, ...)` (linhas 69–70) | `RecursiveCharacterTextSplitter(...)` genérico (linha 65) |
| `chunk_size`    | `1000` (linha 71)                                                                            | `1000` (linha 66)                                         |
| `chunk_overlap` | `0` (linha 72)                                                                               | `00` (linha 67)                                           |
| Separadores     | os da linguagem Python                                                                       | default, com a linha `separators=` comentada              |

Mesma entrada, mesmo tamanho, splitter diferente. É assim que se isola uma variável — e é o
desenho que você deve copiar quando for medir qualquer decisão de chunking no seu projeto.

O arquivo `04-LangChain-ChunkingForCode.py` também traz, na linha 3, uma chamada útil para
inspeção:

```python
separators = RecursiveCharacterTextSplitter.get_separators_for_language(Language.JS)
```

Ela imprime a lista de separadores que a biblioteca usa para JavaScript. Rode e leia a saída —
é a forma de descobrir o que o LangChain considera fronteira em cada linguagem sem depender
de documentação.

### O corte semântico, com controle embutido

`05-LlamaIndex-SemanticChunking.py` constrói dois splitters de propósito:

```python
splitter = SemanticSplitterNodeParser(
    buffer_size=3,                       # linha 18
    breakpoint_percentile_threshold=90,  # linha 19
    embed_model=OpenAIEmbedding(...)     # linha 20
)
base_splitter = SentenceSplitter(        # linha 23; o "as a control" é o comentário da 22
```

E ao final imprime a **contagem de chunks de cada um** (linhas 61 e 70), lado a lado. O
arquivo já é o experimento.

Os dois parâmetros que governam o corte:

- **`buffer_size`** — quantas sentenças de cada lado entram na janela comparada. **Não são grupos
  disjuntos**, apesar do que o comentário do arquivo diz: no fonte do `llama-index-core`, o
  `_build_sentence_groups` monta **uma unidade por sentença**, formada por ela mais `buffer_size`
  vizinhas antes e `buffer_size` depois. Com `3`, são até sete sentenças por unidade, e janelas
  vizinhas se sobrepõem fortemente. É a sobreposição que suaviza, não o agrupamento.
- **`breakpoint_percentile_threshold`** — o percentil de distância a partir do qual se corta.
  `90` corta nos 10% de fronteiras mais dissimilares; subir para `98` corta menos, gerando
  chunks maiores.

O arquivo documenta esses parâmetros em prosa nas linhas 49 e 52, e é justamente ali que ele erra:
o modelo que o comentário descreve, "every 3 sentences are treated as a group", não é o que o
código faz. Vale como exemplo do hábito que esta aula acabou de instalar, duas seções acima.

As linhas 12–13 trazem comentado um caminho de embedding local com `HuggingFaceEmbedding`, e o
semântico embute muito, então a conta chega. Mas **atenção ao que está comentado ali**: é o
`bge-small-zh`, o modelo chinês que esta aula classificou como resíduo da origem, sobre um corpus
em inglês. Descomente trocando o `model_name` por um modelo da sua língua, e note que isso pede
`sentence-transformers`, que o `requirements.txt` deste módulo não declara.

### O arquivo cujo nome engana

`99-Tool-PDF-Splitting.py` **não faz chunking.** Apesar de "Splitting" no nome e de estar num
módulo sobre chunking, ele usa `PdfReader`/`PdfWriter` do `pypdf` para **extrair páginas** de
um PDF e salvar um novo arquivo — a função é `extract_pages(pdf_path, output_path,
page_numbers)`. É utilitário de preparação de dados, não estratégia de corte de texto.

O prefixo `99` marca o que fica **fora da sequência numerada**: aqui uma ferramenta, no
`01-DataLoading` um diretório `99-Others`, e na raiz o próprio `99-EN` de onde vêm os textos deste
módulo. Registro isto porque é o tipo de coisa que faz alguém perder meia hora procurando a
estratégia de chunking que o arquivo não contém.

---

## Mão na massa

### Passo 1 — Fixo contra recursivo, mesma fonte

```powershell
cd RAG-from-First-Principles/02-DocChunking
python 01-LangChain-CharacterTextSplitter.py
python 02-LangChain-RecursiveharacterTextSplitter.py
```

Compare as saídas. E prepare-se para o resultado contrariar a intuição: o que segue foi **medido**
no ambiente pinado
do curso. O `CharacterTextSplitter` do `01` usa o separador default `"\n\n"`: corta **só** em linha
em branco, **ignora** o `chunk_size=100` (a saída traz nove avisos `Created a chunk of size 779,
which is longer than the specified 100`) e produz 20 chunks de tamanho selvagemente desigual — 16,
779, 11, 319 — que **nunca** partem uma palavra. O recursivo do `02`, com os quatro separadores da
linha 6, produz 72 chunks e **nenhum passa de 100 caracteres** — regulares, não irregulares. E é
**ele** quem parte frase ao meio, porque cai no separador `" "`: um chunk termina em "about 17
kilometers west" e o seguinte começa em "west of Datong".

A lição é a inversa da esperada, e melhor que ela: **quem respeita o `chunk_size` é o recursivo, e o
preço de respeitá-lo é cortar onde a frase não acaba.** O fixo respeita a fronteira da frase e
desrespeita o número que você pediu.

### Passo 2 — Código, com e sem conhecimento de linguagem

```powershell
python 04-LangChain-PlainChunkingForCode.py
python 04-LangChain-ChunkingForCode.py
```

Olhe onde cada um cortou. No genérico, procure funções partidas: corpo sem assinatura,
assinatura sem corpo, um `def` órfão no fim de um chunk. No específico, os cortes devem cair
entre declarações.

Pergunte-se o que aconteceria com uma busca por "função que calcula o dano do ataque" contra
cada um dos dois índices.

### Passo 3 — Semântico contra sentença

```powershell
python 05-LlamaIndex-SemanticChunking.py
```

O script imprime as duas contagens. Observe a diferença de **número** de chunks e, mais
importante, leia dois ou três chunks semânticos por inteiro: eles devem terminar em mudanças
de assunto, não em contagens.

Este script chama a API de embedding da OpenAI durante o corte. Para o caminho local, descomente
as linhas 12–13, troque o `model_name` chinês pelo da sua língua e ajuste o `embed_model` da
linha 20. Note que `HuggingFaceEmbedding` não é Ollama: ele pede `sentence-transformers` e
`torch`, que não estão no `requirements.txt` deste módulo.

### Passo 4 — O experimento que fecha a aula

**Julgamento:** `03_LlamaIndex-ChunkSizeAffectsAccuracy.py` é o mais importante do módulo. Ele indexa uma
relatório financeiro da Uber e faz uma pergunta **numérica**. O arquivo se chama
`uber_10q_march_2022_page26.pdf` e tem `/Count 3`: são três páginas, as impressas 25, 26 e 27,
como o `99-Tool-PDF-Splitting.py:38` confirma ao extrair `[26, 27, 28]`. O nome engana, e esta aula
tem uma seção sobre isso.

A pergunta:

```python
Settings.node_parser = SentenceSplitter(chunk_size=250, chunk_overlap=20) # 50, 100, 250 give different results -- why?
...
query = "how much is the Loss from operations for 2022?"
```

O comentário da linha 18 é um convite do autor: **50, 100 e 250 dão resultados diferentes —
por quê?** Responder isso é o objetivo desta aula.

⚠️ **Atenção ao caminho.** A linha 23 carrega
`file="90-Data/ComplexPDF/uber_10q_march_2022_page26.pdf"` — caminho relativo à **raiz do
repositório**, e não ao diretório do módulo como todos os outros arquivos daqui. Rodando de
dentro de `02-DocChunking/`, ele não acha o arquivo. Rode da raiz:

```powershell
cd ..   # você está em 02-DocChunking desde o Passo 1; o alvo é o diretório pai
python 02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py
```

O PDF existe — confirmei em `90-Data/ComplexPDF/`, ao lado de `uber_10q_march_2022.pdf`
(completo) e `uber_10q_march_2022_page1-3.pdf`.

Agora rode três vezes, mudando só o `chunk_size` para 50, 100 e 250, e anote a resposta de
cada. **Antes de rodar, escreva sua previsão.**

**Previsão do autor, não medição.** Não rodei este experimento: exige chave de API da OpenAI, uma
chamada de embedding por chunk e uma de LLM por execução, três execuções ao todo. Nada abaixo é
saída observada. E um aviso de unidade antes da previsão: o `chunk_size` do `SentenceSplitter`
conta **tokens** do `cl100k_base`, não caracteres. Medido, `chunk_size=50` produz nós de até 50
tokens e 281 caracteres. É o que eu espero, e o motivo — que é
exatamente o que vale comparar com a sua própria previsão. Se a sua execução divergir, a execução
ganha.

- **`chunk_size=50`** — pequeno demais para uma linha de tabela financeira. O rótulo ("Loss
  from operations") e o valor devem cair em chunks diferentes, e o sistema recupera um pedaço com o
  rótulo e sem o número, ou o inverso. Espero resposta errada ou recusa.
- **`chunk_size=250`** — deve caber a linha inteira, com rótulo, valor e coluna do ano juntos.
- **Entre os dois** existe um limiar, e ele não é uma propriedade do modelo nem da biblioteca:
  é uma propriedade **daquela tabela**. Num documento com linhas mais longas, o limiar seria
  outro.

É a resposta à pergunta do autor, e a lição central: **o ótimo de `chunk_size` é uma
propriedade do seu corpus, não um valor a decorar.** Note também `similarity_top_k=3` na
linha 31 — com `k=3`, se o chunk certo não estiver entre os três melhores, nada o salva.

---

## Quebre de propósito

**1. Zere a sobreposição.** Em `02-LangChain-RecursiveharacterTextSplitter.py:10`, mude
`chunk_overlap=10` para `0`. Este arquivo não recupera nada — ele só imprime os chunks, sem embedding,
índice ou retriever —, então a observação é textual: compare as duas configurações **palavra a
palavra** na primeira fronteira em que elas divergem. Medido no corpus do módulo, com overlap 10 o
chunk começa em `west of Datong…` e com 0 ele começa em `of Datong…`. **Os dez caracteres compram
uma palavra de contexto, não uma frase**, e com `chunk_size=100` nenhuma frase longa está inteira
em chunk nenhum, nas duas configurações. É essa a escala real do overlap: ele é seguro contra o
corte cair uma palavra fora do lugar, não contra perder a frase.

**2. Aplique o splitter de código a prosa.** Rode um texto comum pelo
`from_language(Language.PYTHON)`. Os separadores dele são
`['\nclass ', '\ndef ', '\n\tdef ', '\n\n', '\n', ' ', '']`, com quebra de linha antes de `class` e
`def`, e a **cauda** dessa lista é literalmente a lista default. Como os três primeiros não
aparecem em prosa, o splitter cai na cauda e vira o splitter genérico: medido no corpus do módulo,
**56 chunks nos dois casos, saída idêntica**. Nada degenera, e é aí que está a lição: a aposta
falhada não custa nem entrega nada, ela simplesmente não acontece, e é por isso que o mecanismo
não avisa.

**3. Suba o `breakpoint_percentile_threshold`.** Em `05-LlamaIndex-SemanticChunking.py:19`, troque
`90` por `98`. Menos fronteiras qualificam como corte, e os chunks crescem. Compare a
contagem com a do `base_splitter`. Em que ponto os chunks ficam grandes demais para produzir
embedding útil?

**4. Corrija os comentários errados.** Edite mentalmente as linhas 7 e 8 do arquivo `01` para
que digam a verdade. É trivial, e é, **julgamento**, o exercício de leitura crítica mais valioso
do módulo,
porque a próxima divergência entre comentário e código que você encontrar estará no seu
código, e ninguém vai apontá-la.

---

## Armadilhas de produção

- **Truncamento silencioso.** Todo modelo de embedding tem limite de tokens (512 é comum).
  Chunk maior que o limite tem o excedente **descartado sem aviso** — você acredita ter
  indexado o parágrafo inteiro e indexou metade. Sempre confira o limite do seu modelo contra
  o seu `chunk_size`, lembrando que `chunk_size` em `RecursiveCharacterTextSplitter` conta
  **caracteres**, não tokens, e a razão varia com o idioma.
- **Tabelas.** Chunking de texto corrido destrói tabelas: o cabeçalho fica num chunk e as
  linhas em outro, e cada número perde o significado. Tabela pede tratamento próprio na
  ingestão (Aula 06), não `chunk_size` maior.
- **Rechunkar exige reindexar.** Mudou a estratégia, todo o índice precisa ser reconstruído.
  Em acervo grande via API paga, isso é uma conta real — e é o motivo para acertar cedo.
- **Overlap alto sai caro, mas menos do que a intuição diz.** Medido no corpus deste módulo com
  `chunk_size=100` e os separadores do arquivo: overlap 0 dá 71 chunks e overlap 50 dá 76, ou seja
  **+7%**, não o dobro. Com os separadores default o pior caso que medi foi 1,50x, e a razão cai
  conforme o chunk cresce (1,20x a 300, 1,15x a 500). O `_merge_splits` só recupera a sobreposição
  que ainda cabe. O custo real não é dobrar o índice: é duplicata competindo no top-k. A faixa de
  10 a 20% é ponto de partida, não lei.
- **Chunking uniforme para acervo heterogêneo.** Contrato, ticket e código pedem estratégias
  diferentes. Pior que o tamanho errado é o fato de fontes distintas competirem no mesmo
  ranking — trate isso com índices separados ou filtro por metadado, e roteamento (Aula 14).
- **Ajustar sem medir.** Sem um conjunto de perguntas com resposta conhecida, você troca
  `chunk_size` e forma uma impressão. O experimento do passo 4 é o formato mínimo de medição:
  uma pergunta cuja resposta correta você conhece, e três configurações comparadas.

---

## Checkpoint

1. Por que um chunk grande produz embedding _pior_, e não apenas mais caro?
2. Qual a diferença de mecanismo entre `CharacterTextSplitter` e
   `RecursiveCharacterTextSplitter`? Por que o segundo produz fronteiras melhores?
3. O que `from_language` troca em relação ao splitter recursivo comum? E o que acontece se
   você aplicá-lo a um texto que não é código?
4. O que `buffer_size` e `breakpoint_percentile_threshold` controlam no corte semântico? Qual
   deles você mexeria para obter chunks maiores?
5. Responda à pergunta do autor: por que 50, 100 e 250 dão resultados diferentes na consulta
   sobre "Loss from operations"?
6. O que acontece com um chunk maior que o limite de tokens do modelo de embedding? Como você
   detecta isso?
7. Nos arquivos `01` e `02`, qual é a diferença entre o que o comentário diz e o que o código
   faz? Por que essa distinção vira um hábito profissional?
8. Por que `99-Tool-PDF-Splitting.py` está neste módulo, e por que ele não responde a nenhuma
   pergunta sobre chunking?

---

## Vocabulário

`chunk` · `chunk size` · `chunk overlap` · `fixed-size chunking` · `recursive chunking` ·
`semantic chunking` · `token`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 06 — Tabelas, CSV e SQL](AULA-06-tabelas-csv-sql.md) — na ordem de leitura do
curso. Na ordem de **dependência**, esta aula só precisa das Aulas 00 a 03 (ver nota abaixo)
**Próxima:** [AULA 08 — Embeddings na prática, BM25 esparso e BGE-M3 híbrido](AULA-08-embeddings-bm25-bge-m3.md)

> **Nota de ordem:** esta aula é autossuficiente e depende apenas das Aulas 00 a 03, embora venha
> depois das Aulas 04 a 06 no pipeline.
