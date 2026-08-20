# AULA 07 — Chunking: por caractere, recursivo, por código e semântico

**Fase 2 — Representação** · Módulo do repo: `02-DocChunking/` (9 arquivos)

---

## Pergunta motivadora

Você tem um documento de 40 páginas e um modelo de embedding que aceita 512 tokens. Precisa
cortar. Onde?

Parece decisão de implementação — um parâmetro a preencher. **Julgamento, e a frase inteira é
julgamento:** é a decisão de maior impacto em qualidade de resposta de todo o pipeline, e a mais
negligenciada. Nenhuma das duas metades é verificável por `grep`; a segunda nem em princípio. Ela determina o que é
possível recuperar: **informação cortada ao meio não é recuperável por nenhum modelo de
embedding, nenhum reranking e nenhum prompt.** Os capítulos seguintes só conseguem trabalhar
com o que esta aula deixou intacto.

---

## Modelo mental

### A tensão que não tem solução dentro de um número só

Escolher `chunk_size` é escolher entre dois objetivos que puxam em direções opostas:

| Objetivo               | Quer chunk… | Por quê                                                  |
| ---------------------- | ----------- | -------------------------------------------------------- |
| **Embedding preciso**  | **menor**   | um chunk sobre um assunto só produz vetor bem localizado |
| **Geração competente** | **maior**   | o LLM precisa do entorno para responder                  |

O lado do embedding merece cuidado, porque a intuição engana. Um chunk grande não produz "um
vetor com mais informação" — produz um vetor que se aproxima da **média** das direções
dos assuntos que ele contém. (Isto vale para os modelos de _mean pooling_, que são os usados neste
curso; é a explicação corrente do fenômeno, não uma medição que eu tenha feito aqui.) Média de direções distintas aponta para o meio de lugar nenhum:
o vetor fica equidistante de tudo e próximo de nada. É por isso que chunk grande degrada
recuperação em vez de melhorá-la.

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
decidir). O custo sobe junto: o semântico faz chamadas de embedding durante a _ingestão_, o
que em acervo grande costuma ser, **julgamento**, o item mais caro do pipeline.

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

Abra `01-LangChain-CharacterTextSplitter.py` nas linhas 7 e 8:

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

O terceiro separador é `，` — a **vírgula de largura total** (U+FF0C, _fullwidth comma_), usada em chinês, não a
vírgula latina `,`. Num corpus em inglês ou português ela nunca casa, então a lista efetiva
é `["\n\n", ".", " "]`.

É resíduo da origem do livro, da mesma família do `bge-small-zh` que você viu na Aula 03. Não
quebra nada — só faz um separador ser decorativo. Para um corpus em português, a lista útil
seria `["\n\n", "\n", ".", ",", " ", ""]`.

### O par que isola a variável

`04-LangChain-ChunkingForCode.py` e `04-LangChain-PlainChunkingForCode.py` são, **julgamento**, o experimento
mais bem construído do módulo. Rodando `diff` entre os dois, a diferença **relevante** está no
splitter — o corpo de código de exemplo (`GAME_CODE`) é o mesmo, e o tamanho também. O `diff` cru
mostra mais que isso: um import extra de `Language`, a chamada de
`get_separators_for_language(Language.JS)` que só existe no primeiro, comentários e nomes de
variável diferentes (`python_docs` vs. `text_chunks`). Nada disso muda o experimento, mas você vai
ver na tela:

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

- **`buffer_size`** — quantas sentenças são agrupadas antes de comparar. Com `1`, compara
  sentença a sentença, e o corte fica sensível a variação local. Com `3`, suaviza.
- **`breakpoint_percentile_threshold`** — o percentil de distância a partir do qual se corta.
  `90` corta nos 10% de fronteiras mais dissimilares; subir para `98` corta menos, gerando
  chunks maiores.

O próprio arquivo documenta o efeito, em prosa, nas linhas 49 e 52. E as linhas 12–13 trazem
comentado o caminho para usar embedding local (`HuggingFaceEmbedding`) em vez da OpenAI — vale
descomentar, porque o semântico embute muito e a conta chega.

### O arquivo cujo nome engana

`99-Tool-PDF-Splitting.py` **não faz chunking.** Apesar de "Splitting" no nome e de estar num
módulo sobre chunking, ele usa `PdfReader`/`PdfWriter` do `pypdf` para **extrair páginas** de
um PDF e salvar um novo arquivo — a função é `extract_pages(pdf_path, output_path,
page_numbers)`. É utilitário de preparação de dados, não estratégia de corte de texto.

O prefixo `99` é a convenção do autor para "ferramenta auxiliar". Registro isto porque é o
tipo de coisa que faz alguém perder meia hora procurando a estratégia de chunking que o
arquivo não contém.

---

## Mão na massa

### Passo 1 — Fixo contra recursivo, mesma fonte

```powershell
cd RAG-from-First-Principles/02-DocChunking
python 01-LangChain-CharacterTextSplitter.py
python 02-LangChain-RecursiveharacterTextSplitter.py
```

Compare as saídas. Procure especificamente por **chunks que terminam no meio de uma palavra
ou de uma frase** no primeiro, e veja se o segundo os elimina. Conte quantos chunks cada um
produziu: o recursivo tende a gerar chunks de tamanho mais irregular, porque respeita
fronteiras em vez de cortar na contagem exata. Irregularidade aqui é sinal de saúde.

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

Este script chama a API de embedding da OpenAI durante o corte. Se estiver no caminho Ollama,
descomente as linhas 12–13 e troque o `embed_model` da linha 20.

### Passo 4 — O experimento que fecha a aula

**Julgamento:** `03_LlamaIndex-ChunkSizeAffectsAccuracy.py` é o mais importante do módulo. Ele indexa uma
página de um relatório financeiro da Uber e faz uma pergunta **numérica**:

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
cd RAG-from-First-Principles
python 02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py
```

O PDF existe — confirmei em `90-Data/ComplexPDF/`, ao lado de `uber_10q_march_2022.pdf`
(completo) e `uber_10q_march_2022_page1-3.pdf`.

Agora rode três vezes, mudando só o `chunk_size` para 50, 100 e 250, e anote a resposta de
cada. **Antes de rodar, escreva sua previsão.**

**Previsão do autor, não medição.** Não rodei este experimento: exige `unstructured`, chave de
API e três chamadas de LLM, e nada abaixo é saída observada. É o que eu espero, e o motivo — que é
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
`chunk_overlap=10` para `0`. Procure uma informação que atravesse a fronteira de dois chunks
e veja-a desaparecer da recuperação. Isso mostra para que serve overlap: não é redundância,
é seguro contra o corte cair no lugar errado.

**2. Aplique o splitter de código a prosa.** Rode um texto comum pelo
`from_language(Language.PYTHON)`. Como `class ` e `def ` não aparecem, o splitter cai nos
separadores de baixo da lista e o resultado degenera. Serve para fixar que os separadores por
linguagem são uma **aposta sobre o conteúdo** — quando a aposta falha, o mecanismo não avisa.

**3. Suba o `breakpoint_percentile_threshold`.** Em `05-LlamaIndex-SemanticChunking.py:19`, troque
`90` por `98`. Menos fronteiras qualificam como corte, e os chunks crescem. Compare a
contagem com a do `base_splitter`. Em que ponto os chunks ficam grandes demais para produzir
embedding útil?

**4. Corrija os comentários errados.** Edite mentalmente as linhas 7 e 8 do arquivo `01` para
que digam a verdade. É trivial — e é, **julgamento**, o exercício de leitura crítica mais valioso do módulo,
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
- **Overlap alto sai caro.** 50% de sobreposição significa quase o dobro de chunks: dobro de
  custo de embedding, dobro de armazenamento, e mais duplicatas competindo no top-k. A faixa
  de 10 a 20% é ponto de partida, não lei.
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
`semantic chunking` · `sliding window` · `token`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 03 — Seu primeiro RAG](AULA-03-primeiro-rag.md)
**Próxima:** [AULA 08 — Embeddings na prática, BM25 esparso e BGE-M3 híbrido](AULA-08-embeddings-bm25-bge-m3.md)

> **Nota de ordem:** esta aula foi escrita antes das Aulas 04 a 06 (ingestão), por ser o
> capítulo em que o agente `@rag-specialist` teve o pior desempenho na primeira avaliação e o
> um dos quatro que zeraram a distância para o máximo na segunda — ver [`avaliacao/GATE-RAG-SPECIALIST-v2.md`](avaliacao/GATE-RAG-SPECIALIST-v2.md).
> Ela é autossuficiente: depende apenas das Aulas 00 a 03.
