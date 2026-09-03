# AULA 00 — Setup do ambiente

**Fase 0 — Fundamentos** · Módulo do repo: `91-Environment/`, `00-SimpleRAG/`

---

## Pergunta motivadora

Você tem 396 arquivos à disposição (`git ls-files | wc -l`) — dos quais **189 são código** (`.py` e `.ipynb`); o resto
é dado, PDF e imagem — e 12 arquivos de `requirements` em `91-Environment/` — dois deles em
`archive/`, que você não vai usar. Qual instalar, e por que existem tantos?

Porque RAG tem uma dependência incômoda: modelos de embedding rodam localmente e
querem GPU. O autor separou os ambientes por SO e por presença de GPU, e separou
LangChain de LlamaIndex — as duas bibliotecas competem por versões das mesmas
dependências transitivas e brigam se instaladas juntas sem cuidado.

Esta aula termina com você rodando um script de RAG de verdade. Nada de
"prepare-se para na próxima aula finalmente rodar algo".

---

## Modelo mental

Você vai tomar três decisões, nesta ordem:

1. **Framework:** LangChain ou LlamaIndex? — Ambos. O livro usa os dois de
   propósito, porque comparar as duas APIs no mesmo problema ensina o que é
   essencial ao RAG e o que é escolha de biblioteca.
2. **Provedor de LLM:** API paga ou modelo local? — **Julgamento:** é a decisão que mais afeta seu
   bolso ao longo do curso.
3. **Isolamento:** um ambiente virtual por módulo, ou um só? — Um por família de
   framework. Detalhado abaixo.

---

## Decisão 2, em detalhe: onde o LLM roda

Os scripts do repositório vêm em variantes por provedor. Veja o padrão de
nomenclatura em `00-SimpleRAG/`:

| Sufixo do arquivo       | Provedor                        | Custo                                | Chave necessária                     |
| ----------------------- | ------------------------------- | ------------------------------------ | ------------------------------------ |
| `_OpenAI`               | OpenAI                          | pago por token                       | `OPENAI_API_KEY`                     |
| `_DeepSeek`             | DeepSeek                        | pago, ordem de magnitude mais barato | `DEEPSEEK_API_KEY`                   |
| `_Claude`               | Anthropic                       | pago por token                       | `CLAUDE_API_KEY`                     |
| `_Ollama`               | local, na sua máquina           | zero                                 | nenhuma                              |
| `_HuggingFace`          | modelos locais via transformers | zero                                 | nenhuma (às vezes token de download) |

O token do provedor não é sempre o fim do nome: na série `02_*` ele vem seguido de `_Model`
(`02_04_LangChain_HuggingFace_Model.py`), e há sufixos de versão (`_v1`, `_v2`) depois disso. Procure
o token, não a terminação.

O `00-SimpleRAG/.env.example` documenta cada uma dessas variáveis, inclusive um
endpoint genérico compatível com OpenAI (`CUSTOM_API_KEY` + `CUSTOM_API_BASE_URL`)
usado por `01_03_LlamaIndex_SwitchToOpenAICompatibleModel.py`.

**Recomendação para este curso:** faça as Fases 0 a 2 com **Ollama**, custo zero, e
deixe a API paga para quando chegar em geração e avaliação (Fases 7 e 8), onde a
qualidade do modelo realmente muda o que você observa. **Julgamento:** embedding local está bom hoje, e geração local ainda não. Para acompanhar este curso, um bi-encoder pequeno basta — e o
que você vai ver rodando nos `01_0x` que usam embedding local é o `BAAI/bge-small-zh`, não o
`all-MiniLM-L6-v2`. Esse entra a partir dos `05_RAG_from_Scratch_*` e reaparece depois em
`06-Indexing/02-BuildingHierarchicalIndex/98-TwoTierIndex-FAISS.py:22`,
`07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:91` e `09-Evaluation/01-RAGAS.py:76`.

**E não leia ausência de sufixo como OpenAI.** Na série `03_*` do mesmo diretório, o `v1` é OpenAI,
o `v2` é DeepSeek (`:50`) e o `v3` é Ollama (`:54`), sem que o nome diga. Confira o `os.getenv` do
arquivo antes de preencher chave: `grep -n getenv <arquivo>`. Você vai querer um modelo bom quando estiver
julgando qualidade de resposta.

Uma nuance que vale saber desde já: **embedding e geração são decisões independentes**, e cada uma
pesa numa etapa diferente. O modelo de **embedding** entra duas vezes: na indexação, quando os
documentos viram vetores, e na recuperação, quando a pergunta vira vetor para buscar — trocá-lo
obriga a reindexar tudo. O modelo de **geração** entra só no fim, ao sintetizar a resposta a partir
do que foi recuperado, e trocá-lo não mexe no índice. Você pode embutir localmente e gerar via API. Os scripts
`01_02_LlamaIndex_SwitchEmbeddingModel.py` e
`01_03_LlamaIndex_SwitchGenerationModel.py` parecem existir para isolar essas duas trocas — mas
não isolam. Abra o `01_03` na **linha 9**: ele define `Settings.embed_model` com o mesmo
`BAAI/bge-small-zh` do `01_02` **e** troca o LLM para DeepSeek. O nome promete uma variável; o
arquivo muda duas. É o primeiro caso de nome-vs-código do curso; a Aula 28 cataloga outros catorze. O que o par realmente demonstra é uma migração completa para fora da OpenAI, não um teste
controlado.

---

## Mão na massa

### Passo 1 — Python e ambientes virtuais

Use Python 3.10, 3.11 ou 3.12 — **não 3.13**. O bloqueio é uma dependência transitiva:
`onnxruntime==1.19.2`, que entra pelo `chromadb` e publica wheel só até cp312. O `torch==2.6.0` e o
`faiss-cpu==1.10.0` **já têm** wheel para 3.13, então não são o motivo (conferido na PyPI, release
por release, para `win_amd64`).

Crie dois ambientes na raiz do clone:

```powershell
cd ../RAG-from-First-Principles
python -m venv .venv-langchain
python -m venv .venv-llamaindex
```

Por que dois: `91-Environment/` mantém requirements separados por framework
justamente porque há versões travadas que divergem entre eles. Dos **102** pacotes pinados nos dois
arquivos, **seis** divergem: `async-timeout` (4.0.3 / 5.0.1), `beautifulsoup4` (4.8.2 / 4.12.3),
`certifi` (2025.1.31 / 2024.12.14 — o do LangChain é mais **novo**), `grpcio` (1.67.1 / 1.70.0),
`six` (1.12.0 / 1.17.0) e o `numpy`: **1.26.4** contra **2.2.2**.

Três dessas trocam o número principal, mas só a do `numpy` importa aqui: a 2.0 mudou a ABI, então
**pacote compilado contra a 1.x não carrega na 2.x** — e boa parte do que este curso instala
(`faiss`, `torch`, `pymilvus`) traz extensão compilada. E o conflito chega antes do que parece: os dois
frameworks já convivem em `00-SimpleRAG/`, ainda na Fase 0, com 12 arquivos de LangChain e 6 de
LlamaIndex. É por isso que o Passo 6 desta aula troca de ambiente no meio do caminho, e não por
capricho de organização.

> Confira você mesmo, e note o que **não** diverge: `pydantic`, `openai` e `tokenizers` estão
> travados na mesma versão nos dois arquivos. Conferir antes de repetir é o hábito que este curso
> ensina — e esta linha já esteve errada por não tê-lo seguido.

### Passo 2 — Ativar e instalar

No PowerShell:

```powershell
.\.venv-llamaindex\Scripts\Activate.ps1
pip install -r 91-Environment/requirements_llamaindex_NoGPU_Mac-Win.txt
```

E o outro, que você vai precisar a partir da Aula 03 — **não pule este passo por simetria com o de
cima**: o `.venv-langchain` criado no Passo 1 fica vazio até você rodar isto, e o conflito de
`numpy` que justifica os dois ambientes é exatamente o que faz instalar um dentro do outro sair
pior que um erro: o `pip` troca a versão sem reclamar, e a quebra só aparece depois, no import de
um pacote compilado.

```powershell
deactivate
.\.venv-langchain\Scripts\Activate.ps1
pip install -r 91-Environment/requirements_langchain_NoGPU_Mac-Win.txt
```

Escolha o arquivo conforme sua máquina:

| Situação              | Arquivo LangChain                                     | Arquivo LlamaIndex                                     |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Windows/Mac sem GPU   | `requirements_langchain_NoGPU_Mac-Win.txt`            | `requirements_llamaindex_NoGPU_Mac-Win.txt`            |
| Ubuntu com GPU NVIDIA | `requirements_langchain_20250413_Ubuntu-with-GPU.txt` | `requirements_llamaindex_20250413_Ubuntu-with-GPU.txt` |
| Ubuntu sem GPU        | `requirements_langchain_Ubuntu-with-CPU.txt`          | `requirements_llamaindex_Ubuntu-with-CPU.txt`          |

> ⚠️ **Um pin que falta em uma das trilhas, e que derruba o `pymilvus`.** O `pymilvus==2.5.4` que os
> requirements pinam importa `pkg_resources`, pacote que o `setuptools` marcou para remoção e retirou
> na versão 81. O `requirements_langchain_NoGPU_Mac-Win.txt` — o que esta aula recomenda para Windows
> — **já se protege**: pina `setuptools==76.0.0` na linha 221, e 76 ainda traz o `pkg_resources`. Quem
> cai na armadilha é quem instala pelo `requirements_langchain_Ubuntu-with-CPU.txt`, que pina o
> `pymilvus` e **não** pina o `setuptools`: num ambiente novo, o pip traz o mais recente e o import
> falha com `ModuleNotFoundError: No module named 'pkg_resources'`. Nesse caso, instale
> `setuptools<81` antes.

Você está no Windows 11, então os dois `NoGPU_Mac-Win`. São 274 e 130 linhas de
dependências pinadas — a instalação demora, `torch` é grande.

Existem ainda requirements especializados que você só instala quando a aula pedir:
`requirements_camelot_20250413.txt` (extração de tabelas, Aula 06); o par
`requirements_{langchain,llamaindex}_SimpleRAG_AdditionalPackagesNeededForLaterModules.txt`, que
acrescenta pouca coisa e quase nada em comum entre os dois — o do LangChain traz `colorama`,
`langchain-deepseek` e `langgraph-prebuilt`; o do LlamaIndex traz o mesmo `colorama` —
que é o **único** acréscimo comum aos dois — mais
`llama-cloud-services`, `python-dotenv`, `setuptools` e `sounddevice`. Dos **sete** pacotes
distintos, dois têm uso amplo e antecipado: o `python-dotenv`, que **83** arquivos importam, e o
`langchain-deepseek`, importado por **15** — entre eles o
`00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py`, que é material da Aula 03. O
`langgraph-prebuilt` aparece uma vez só, em
`10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py`, o módulo da Aula 26. E `colorama`,
`sounddevice` e `llama-cloud-services` não são importados em lugar nenhum do repositório.
**Os dois `04_LangGraph_RAG*.py` não precisam deste arquivo.** Do que ele acrescenta eles não
importam nada: o único pacote de LangGraph que usam é o base, por `from langgraph.graph import
START, StateGraph`, e ele já está na linha 110 do `NoGPU_Mac-Win`. Instale se
chegar na Aula 26 e o import falhar; e
`requirements_marker_20250413.txt`, que **nenhuma aula usa**: `grep -rn "import marker"` no
repositório inteiro não encontra nada, e as duas menções ao `marker_single` estão em tabelas de
`README.md` e de `99-EN/README.md` — a mesma linha, repetida nos dois —, sobre a geração de um asset
traduzido. Não instale.

### Passo 3 — Alternativa mais leve para começar

Cada módulo também tem seu próprio `requirements.txt`, sem versões pinadas. O de
`00-SimpleRAG/` cobre LangChain, LlamaIndex, LangGraph, FAISS,
`sentence-transformers` e Ollama de uma vez:

```powershell
pip install -r 00-SimpleRAG/requirements.txt
```

Se sua prioridade é rodar algo hoje, comece por aqui. Se sua prioridade é
reproduzir exatamente o ambiente do autor, use os arquivos de `91-Environment/`.

### Passo 4 — Ollama

```powershell
winget install Ollama.Ollama
ollama pull llama3
ollama list
```

O `.env.example` usa `OLLAMA_MODEL=llama3` como padrão. Ollama sobe um servidor
local em `http://localhost:11434` e não precisa de chave. Os scripts `_Ollama` mandam a **geração**
para esse servidor; o embedding deles não passa por ali, roda por HuggingFace na sua CPU, e é ele
que provoca a pausa de download da linha seguinte.

### Passo 5 — O arquivo `.env`

O `.gitignore` **da raiz** do repositório contém exatamente uma linha: `.env` (há também um
`.idea/.gitignore` gerado pela IDE, com dez linhas — seis padrões e quatro comentários — que não
interessam aqui). Isso é
deliberado — chave de API nunca entra em commit.

```powershell
cd 00-SimpleRAG
Copy-Item .env.example .env
```

Edite o `.env` e preencha **só o que você vai usar**. Para o caminho Ollama, basta:

```
OLLAMA_MODEL=llama3
```

Atenção a uma pegadinha real do repositório: cada módulo tem seu próprio `.env.example`. **Rode
sempre de dentro do diretório do módulo** — mas pela razão certa, que não é a que parece.

O motivo real são os **caminhos relativos dos dados** (`../99-EN/...`), que dependem do diretório de
trabalho. O `load_dotenv()` **não** depende dele quando você roda um `.py`: o `find_dotenv()` começa
a busca em `os.path.dirname(os.path.abspath(frame_filename))` — o diretório do **arquivo que
chamou** — e sobe na árvore a partir dali. Rodar `python 00-SimpleRAG/script.py` da raiz resolve o
mesmo diretório que rodar de dentro da pasta, e acha o mesmo `.env`.

> **Onde o diretório de trabalho volta a mandar:** o `find_dotenv()` usa `os.getcwd()` em vez do
> arquivo quando detecta REPL, notebook (`_is_interactive()`) ou depurador (`_is_debugger()`), ou
> quando você passa `usecwd=True`. Como este repositório tem `.ipynb`, os dois comportamentos
> aparecem no curso: **no notebook o `.env` encontrado é o da pasta de onde você abriu o Jupyter.**
> _Conferido lendo o código do módulo `dotenv.main` (`python-dotenv` 1.1.0, instalado fora deste
> repositório); não executei o teste. Versão diferente pode diferir._

### Passo 6 — Prova de que funciona

Duas coisas antes do comando. Você está em `00-SimpleRAG` desde o Passo 5 — não repita o `cd`. E o
Passo 2 deixou o `.venv-langchain` ativo, que **não** tem `llama_index`: o `requirements` do LangChain
não o instala (confira com `grep -i llama`). Este script importa `llama_index.core`, então volte ao
ambiente do outro framework primeiro. Repare no caminho: os venvs foram criados na **raiz** do
clone, no Passo 1, e você está um nível abaixo.

Falta ainda um pacote, e este é o defeito mais sério deste módulo. **Nenhum arquivo de
`91-Environment/` instala cliente de Ollama**, em nenhuma das trilhas: `grep -rn -i ollama
91-Environment/` não devolve nada. O `01_05` importa `llama_index.llms.ollama`, e o comentário na
linha 24 do próprio script já avisa que isso pede instalação à parte. Sem ela, a trilha que este
passo recomendou não roda o script que este passo manda rodar.

```powershell
deactivate
..\.venv-llamaindex\Scripts\Activate.ps1
pip install llama-index-llms-ollama
python 01_05_LlamaIndex_5LineCode_Ollama.py
```

Se você optou pelo caminho do Passo 3, o `00-SimpleRAG/requirements.txt` já traz
`llama-index-llms-ollama`, `langchain-ollama` e `ollama`, e nada falta.

Se você optou por OpenAI e preencheu `OPENAI_API_KEY`:

```powershell
python 01_01_LlamaIndex_5LineCode.py
```

Saída esperada: uma resposta em prosa sobre as ferramentas de combate em
_Black Myth: Wukong_, construída a partir de
`99-EN/black-myth-wukong/black_myth_wukong_setting.txt`.

Na primeira execução, se o embedding for local, haverá uma pausa de download do
modelo. É normal e acontece uma vez.

---

## Quebre de propósito

Renomeie temporariamente o arquivo de dados, **sem sair de `00-SimpleRAG`**. O caminho que o
script usa é relativo ao diretório de trabalho, e é isso que o Passo 5 estava treinando:

```powershell
Rename-Item ..\99-EN\black-myth-wukong\black_myth_wukong_setting.txt _oculto.txt
python 01_05_LlamaIndex_5LineCode_Ollama.py
Rename-Item ..\99-EN\black-myth-wukong\_oculto.txt black_myth_wukong_setting.txt
```

Observe **qual** erro aparece e **em que linha** ele estoura.

O objetivo: fixar que RAG tem duas fases distintas de falha — indexação
(documento não chegou) e recuperação (documento chegou mas não foi encontrado). O
erro aqui é da primeira. Diagnosticar RAG é, em boa parte, saber em qual das duas
você está.

---

## Armadilhas de produção

- **`.env` versionado.** O `.gitignore` protege este repo. Seu projeto pode não
  ter essa linha. Verifique antes do primeiro commit.
- **Caminhos relativos.** Os scripts usam `../99-EN/...`, dependentes do diretório
  de trabalho. Em produção, resolva caminhos a partir da localização do módulo,
  nunca do CWD.
- **Ambiente único para tudo.** Vai funcionar até você misturar Milvus, Weaviate e
  Neo4j. Isolar desde o começo custa dez minutos e economiza uma tarde.
- **Versões não pinadas.** Os `requirements.txt` por módulo são soltos. Ótimo para
  estudar, inaceitável em produção — o ecossistema LangChain quebra
  compatibilidade com frequência.
- **GPU presumida.** Vários exemplos de embedding rodam em CPU, apenas lentos. Se
  um script travar sem erro, provavelmente é CPU processando `sentence-transformers`,
  não deadlock.

---

## Checkpoint

Responda sem consultar:

1. Por que `91-Environment/` separa requirements de LangChain e LlamaIndex?
2. Qual a diferença entre trocar o modelo de embedding e trocar o modelo de
   geração? Cada troca afeta qual etapa do pipeline?
3. Você precisa de chave de API para rodar os scripts `_Ollama`? Por quê?
4. Por que rodar o script de dentro da pasta do módulo, e não da raiz?
5. Qual a única linha do `.gitignore` **da raiz** deste repositório, qual risco ela mitiga, e
   quantos `.gitignore` o repositório rastreia?

---

## Vocabulário

`embedding` · `token` · `context window` · `corpus`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Próxima:** [AULA 01 — O que é RAG e qual problema real ele resolve](AULA-01-o-que-e-rag.md)
