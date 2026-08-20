# AULA 00 — Setup do ambiente

**Fase 0 — Fundamentos** · Módulo do repo: `91-Environment/`, `00-SimpleRAG/`

---

## Pergunta motivadora

Você tem 396 arquivos à disposição (`git ls-files | wc -l`) — dos quais **189 são código** (`.py` e `.ipynb`); o resto
é dado, PDF e imagem — e 12 arquivos de `requirements` em `91-Environment/`, dois deles em
`archive/`, que você não vai usar
diferentes. Qual instalar, e por que existem tantos?

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
2. **Provedor de LLM:** API paga ou modelo local? — Esta é a decisão que mais
   afeta seu bolso ao longo do curso.
3. **Isolamento:** um ambiente virtual por módulo, ou um só? — Um por família de
   framework. Detalhado abaixo.

---

## Decisão 2, em detalhe: onde o LLM roda

Os scripts do repositório vêm em variantes por provedor. Veja o padrão de
nomenclatura em `00-SimpleRAG/`:

| Sufixo do arquivo       | Provedor                        | Custo                                | Chave necessária                     |
| ----------------------- | ------------------------------- | ------------------------------------ | ------------------------------------ |
| `_OpenAI` ou sem sufixo | OpenAI                          | pago por token                       | `OPENAI_API_KEY`                     |
| `_DeepSeek`             | DeepSeek                        | pago, ordem de magnitude mais barato | `DEEPSEEK_API_KEY`                   |
| `_Claude`               | Anthropic                       | pago por token                       | `CLAUDE_API_KEY`                     |
| `_Ollama`               | local, na sua máquina           | zero                                 | nenhuma                              |
| `_HuggingFace`          | modelos locais via transformers | zero                                 | nenhuma (às vezes token de download) |

O `00-SimpleRAG/.env.example` documenta cada uma dessas variáveis, inclusive um
endpoint genérico compatível com OpenAI (`CUSTOM_API_KEY` + `CUSTOM_API_BASE_URL`)
usado por `01_03_LlamaIndex_SwitchToOpenAICompatibleModel.py`.

**Recomendação para este curso:** faça as Fases 0 a 2 com **Ollama**, custo zero, e
deixe a API paga para quando chegar em geração e avaliação (Fases 7 e 8), onde a
qualidade do modelo realmente muda o que você observa. Embedding local é
excelente hoje. **Julgamento:** para acompanhar este curso, um bi-encoder pequeno basta — e o
que você vai ver rodando nos scripts `01_0x` é o `BAAI/bge-small-zh`, não o `all-MiniLM-L6-v2`,
que só aparece nos `05_RAG_from_Scratch_*`. Geração local é
mediana, e você vai querer um modelo bom quando estiver julgando qualidade de
resposta.

Uma nuance que vale saber desde já: **embedding e geração são decisões
independentes**. Você pode embutir localmente e gerar via API. Os scripts
`01_02_LlamaIndex_SwitchEmbeddingModel.py` e
`01_03_LlamaIndex_SwitchGenerationModel.py` parecem existir para isolar essas duas trocas — mas
não isolam. Abra o `01_03` na **linha 9**: ele define `Settings.embed_model` com o mesmo
`BAAI/bge-small-zh` do `01_02` **e** troca o LLM para DeepSeek. O nome promete uma variável; o
arquivo muda duas. É o primeiro caso de nome-vs-código do curso; a Aula 28 cataloga outros catorze. O que o par realmente demonstra é uma migração completa para fora da OpenAI, não um teste
controlado.

---

## Mão na massa

### Passo 1 — Python e ambientes virtuais

Use Python 3.10 ou 3.11. Os requirements pinam versões de 2025 que não têm wheels
para 3.13 em várias dependências (`faiss-cpu`, `torch`).

Crie dois ambientes na raiz do clone:

```bash
cd ../RAG-from-First-Principles
python -m venv .venv-langchain
python -m venv .venv-llamaindex
```

Por que dois: `91-Environment/` mantém requirements separados por framework
justamente porque há versões travadas que divergem entre eles. O caso mais
grave é o `numpy`: **1.26.4** no arquivo do LangChain contra **2.2.2** no do LlamaIndex — uma
mudança de versão maior, com quebra de compatibilidade. Um ambiente só funciona no começo e explode
na Fase 5.

> Confira você mesmo, e note o que **não** diverge: `pydantic`, `openai` e `tokenizers` estão
> travados na mesma versão nos dois arquivos. Conferir antes de repetir é o hábito que este curso
> ensina — e esta linha já esteve errada por não tê-lo seguido.

### Passo 2 — Ativar e instalar

No PowerShell:

```powershell
.\.venv-llamaindex\Scripts\Activate.ps1
pip install -r 91-Environment/requirements_llamaindex_NoGPU_Mac-Win.txt
```

Escolha o arquivo conforme sua máquina:

| Situação              | Arquivo LangChain                                     | Arquivo LlamaIndex                                     |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| Windows/Mac sem GPU   | `requirements_langchain_NoGPU_Mac-Win.txt`            | `requirements_llamaindex_NoGPU_Mac-Win.txt`            |
| Ubuntu com GPU NVIDIA | `requirements_langchain_20250413_Ubuntu-with-GPU.txt` | `requirements_llamaindex_20250413_Ubuntu-with-GPU.txt` |
| Ubuntu sem GPU        | `requirements_langchain_Ubuntu-with-CPU.txt`          | `requirements_llamaindex_Ubuntu-with-CPU.txt`          |

Você está no Windows 11, então os dois `NoGPU_Mac-Win`. São 274 e 130 linhas de
dependências pinadas — a instalação demora, `torch` é grande.

Existem ainda requirements especializados que você só instala quando a aula pedir:
`requirements_camelot_20250413.txt` (extração de tabelas, Aula 06) e
`requirements_marker_20250413.txt`, que **nenhuma aula usa**: `grep -rn "import marker"` no
repositório inteiro não encontra nada, e a única menção ao `marker_single` está numa tabela do
`README.md` da Packt, sobre a geração de um asset traduzido. Não instale.

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
local em `http://localhost:11434` e não precisa de chave — os scripts `_Ollama`
apenas conversam com esse servidor.

### Passo 5 — O arquivo `.env`

O `.gitignore` do repositório contém exatamente uma linha: `.env`. Isso é
deliberado — chave de API nunca entra em commit.

```powershell
cd 00-SimpleRAG
Copy-Item .env.example .env
```

Edite o `.env` e preencha **só o que você vai usar**. Para o caminho Ollama, basta:

```
OLLAMA_MODEL=llama3
```

Atenção a uma pegadinha real do repositório: cada módulo tem seu próprio
`.env.example`, e `load_dotenv()` sem argumento procura o `.env` a partir do
diretório de trabalho subindo na árvore. Se você rodar o script de dentro da pasta
dele, o `.env` daquela pasta é encontrado. Se rodar da raiz, não é. **Rode sempre
de dentro do diretório do módulo** — os caminhos relativos dos dados também
dependem disso (`../99-EN/...`).

### Passo 6 — Prova de que funciona

```powershell
cd 00-SimpleRAG
python 01_05_LlamaIndex_5LineCode_Ollama.py
```

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

Renomeie temporariamente o arquivo de dados:

```powershell
cd ../99-EN/black-myth-wukong
Rename-Item black_myth_wukong_setting.txt _oculto.txt
```

Rode o script de novo. Observe **qual** erro aparece e **em que linha** ele estoura.
Depois desfaça o rename.

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
5. Qual a única linha do `.gitignore` deste repositório, e qual risco ela mitiga?

---

## Vocabulário

`embedding` · `token` · `context window` · `corpus`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Próxima:** [AULA 01 — O que é RAG e qual problema real ele resolve](AULA-01-o-que-e-rag.md)
