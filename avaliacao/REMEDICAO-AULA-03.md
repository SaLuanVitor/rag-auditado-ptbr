# Remedição: AULA 03 (primeiro RAG)

**Alvo:** `E:/Projetos/rag/rag-auditado-ptbr/AULA-03-primeiro-rag.md`, no estado de hoje (2026-09-16).
**Fonte da verdade:** `E:/Projetos/rag/RAG-from-First-Principles/`, commit `17c6942`.
**Interpretadores:** `E:/tmp/rag-venv/Scripts/python.exe` (`llama-index-core 0.12.15`, `huggingface_hub 1.31.0`).

Nota formada sem consultar `avaliacao/GATE-AULAS-v1.md`. O histórico não foi aberto nem depois.

---

## Nota

| Dim | Nome | Nota | Justificativa em uma linha |
| --- | --- | --- | --- |
| **E** | Evidência | **1** | Cerca de 30 citações `arquivo:linha` conferidas uma a uma, todas exatas, inclusive as difíceis (168 tokens, um nó, 4.422 caracteres em 5 chunks, `constants.py:69`). Duas contagens declaradas "Medido" não reproduzem, e um número vem com a unidade errada. |
| **C** | Correção técnica | **1** | O domínio está certo, inclusive a equivalência L2/cosseno para vetores normalizados e a separação entre `DEFAULT_CHUNK_OVERLAP` e `SENTENCE_CHUNK_OVERLAP`. Um ponto confunde sobreposição em tokens com sobreposição em caracteres, entre bibliotecas diferentes. |
| **H** | Honestidade epistêmica | **2** | Limite declarado oito vezes, e com granularidade rara: dentro de um parágrafo ela separa o que conferiu do que leu na documentação. Julgamento marcado como julgamento. Custo de cada mitigação nomeado (cobrança da geração, ida à rede, a cópia offline que serve aqui e não serve na Aula 04). |
| **O** | Coerência | **1** | Externa confere (Aula 02, nomes e temas das aulas 04 a 26, os seis módulos do repo existem). Interna tem um censo que não fecha e uma identidade falsa entre a Parte 1 e o Exercício 4. |
| **D** | Didática | **2** | Ensina mecanismo, não API: por que três das seis decisões ainda não agem, por que variável de ambiente lida no import não se corrige por código, por que o `02` é mais cru que o `03`. A pergunta motivadora é respondida e o retorno prometido na Parte 1 é pago na Parte 3. |
| **A** | Acionabilidade | **2** | O preâmbulo do "Quebre de propósito" desarma sozinho uma armadilha que consumiria a sessão do aluno, com os números de linha e o roteamento de cada exercício. Os quatro alvos existem no arquivo. Os sete checkpoints são respondíveis pelo texto. |

**Total: 1 + 1 + 2 + 1 + 2 + 2 = 9 / 12 (75%).**

---

## Achados

**8 achados. Nenhum `−1`.** Nenhuma afirmação específica e verificável foi apresentada como certa e
se revelou falsa a ponto de ensinar algo errado sobre RAG. Os dois achados ALTO são censo incompleto,
não invenção: os arquivos que a aula nomeia contêm de fato o que ela diz que contêm.

---

### 1. ALTO. O censo da cláusula de honestidade não fecha, e "os únicos" é falso

**Trecho (linhas 204-207):**

> Medido, `grep -rl "I cannot find relevant"` devolve oito dos scripts, os cinco `02_*` e os três
> `03_*` [...]. Os únicos que **não** têm a cláusula são os seis `01_*` da Parte 1.

**Comando:**

```bash
cd "E:/Projetos/rag/RAG-from-First-Principles/00-SimpleRAG" && grep -rl "I cannot find relevant" . | sort
```

Devolve **nove** caminhos: os cinco `02_*`, os três `03_*` e `./99_Testing.py`.

Os três `04_*` (`04_LangGraph_RAG.py`, `04_LangGraph_RAG_Ollama.py`, `04_LangGraph_RAG.ipynb`)
também **não** têm a cláusula, e a aula nunca os conta. O censo dela cobre 17 dos 21 scripts do
módulo (8 com a cláusula, 3 com o equivalente, 6 sem), deixando os três `04_*` e o `99_Testing.py`
de fora.

```bash
grep -n "hub.pull" 00-SimpleRAG/04_LangGraph_RAG.py     # 32: prompt = hub.pull("rlm/rag-prompt")
grep -o "rlm/rag-prompt" 00-SimpleRAG/04_LangGraph_RAG.ipynb | wc -l   # 1
```

**Por que é problema.** A frase é apresentada como medida e a palavra "únicos" é categórica. O
comando que a própria aula nomeia a desmente.

**Limite meu, declarado:** o `rlm/rag-prompt` é puxado do hub pela rede e eu **não** confirmei o
texto dele. Se ele contiver instrução equivalente, a conclusão de fundo da aula (só os `01_*` rodam
sem instrução de honestidade) sobrevive, e sobra o censo. Foi por isso que não marquei `−1`.

**Correção sugerida.** "O `grep` devolve nove: os cinco `02_*`, os três `03_*` e o `99_Testing.py`,
que é rascunho de teste. Os três `05_*` dizem o equivalente com outras palavras, e os três `04_*`
puxam o prompt do hub (`rlm/rag-prompt`), fora do arquivo. Sem nenhuma instrução de honestidade
ficam os seis `01_*`."

---

### 2. ALTO. A contagem "oito" da linha 204 não reproduz

Destacado à parte do achado 1 porque é o número, não a enumeração: a aula escreve o comando e o
resultado, e o resultado é 9. É o tipo de defeito que a rubrica separa do verificador automático,
já que `verify-citations.js` não executa `grep`.

```bash
grep -rl "I cannot find relevant" . | wc -l   # 9
```

**Correção:** trocar "oito" por "nove" e nomear o nono, ou restringir o comando
(`grep -rl ... 0[123]_*.py`), que aí devolve oito.

---

### 3. MÉDIO. "O mesmo 200" liga duas sobreposições que não são a mesma coisa

**Trecho (linhas 98-99):**

> `SentenceSplitter().chunk_overlap` devolve `200`, e é o mesmo 200 que o Exercício 4 vai mandar
> você zerar.

**Comando:**

```bash
"E:/tmp/rag-venv/Scripts/python.exe" -c "from llama_index.core.node_parser import SentenceSplitter; print(SentenceSplitter().chunk_overlap)"   # 200
grep -n "chunk_overlap" 00-SimpleRAG/03_LangChain_LCEL_RAG_v3.py
# 17: text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
```

**Por que é problema.** O 200 da Parte 1 é sobreposição **em tokens**, do `SentenceSplitter` do
LlamaIndex. O 200 do Exercício 4 é sobreposição **em caracteres**, do
`RecursiveCharacterTextSplitter` do LangChain, em outro arquivo e em outra biblioteca. A coincidência
numérica é real; a identidade não. Um aluno pode sair achando que zerar o overlap no `v3` mexe no
padrão do LlamaIndex que a Parte 1 acabou de medir.

**Correção sugerida.** "e por coincidência é o mesmo número que o Exercício 4 vai mandar você zerar,
embora ali seja sobreposição em caracteres, de outro splitter."

---

### 4. MÉDIO. O Exercício 2 diz que o aluno mediu uma quantidade

**Trecho (linhas 312-313):**

> Você acabou de medir, na prática, quanto uma única frase de prompt reduz alucinação.

**Por que é problema.** O exercício manda apagar uma frase, perguntar uma coisa e comparar antes e
depois. Isso é uma observação qualitativa de uma execução, não uma medição de "quanto". Numa aula
que policia exatamente esse deslize (a Parte 1 recusa chamar de dado o que não mediu, e a linha 122
diz "não medição minha"), a palavra destoa.

**Atenuante registrado:** a própria aula se retrata doze linhas adiante, em "Armadilhas de produção":
"Você vai fazer estes quatro experimentos e julgar 'melhorou' por impressão." A retratação é
explícita e está no mesmo documento, e foi por isso que `H` ficou em 2.

**Correção sugerida.** "Você acabou de ver, numa execução, o efeito de uma única frase de prompt.
Quanto ela reduz alucinação é pergunta da Aula 22."

---

### 5. MÉDIO. Julgamento sobre ajuste de `k` apresentado como fato

**Trecho (linhas 261-262):**

> **`k=3`** aparece como número solto no meio do código. Em produção, isso é parâmetro de
> configuração, e ajustá-lo costuma render mais que trocar de modelo.

**Por que é problema.** "Costuma render mais que trocar de modelo" é comparação de eficácia entre
duas intervenções, sem origem e sem qualificação. A aula marca julgamento explicitamente em outros
dois lugares ("Julgamento:", "O esperado [...] não medição minha"), então aqui a omissão é notável.

**Correção sugerida.** Prefixar com "Julgamento:", ou condicionar ("num corpus já razoavelmente
recuperado, mexer em `k` costuma dar retorno mais rápido que trocar de modelo").

---

### 6. BAIXO. "773 bytes" é a contagem de caracteres, não de bytes

**Trecho (linha 76):** "São 773 bytes sobre capítulos, finais e cenários."
**Trecho (linha 89):** "tem 773 caracteres, **168 tokens**".

**Comando:**

```bash
"E:/tmp/rag-venv/Scripts/python.exe" -c "
p=r'E:/Projetos/rag/RAG-from-First-Principles/99-EN/black-myth-wukong/black_myth_wukong_setting.txt'
b=open(p,'rb').read(); print('bytes:',len(b), 'CR:', b.count(b'\r'))
print('chars modo texto:', len(open(p,encoding='utf-8').read().replace(chr(13),'')))"
# bytes: 779  CR: 6
# chars modo texto: 773
```

O arquivo tem 779 bytes em disco (CRLF, 6 quebras). 773 é a contagem após normalização de quebra de
linha, que é o que a própria aula escreve três parágrafos depois. A segunda formulação é a certa; a
primeira usa a unidade errada para o mesmo número.

**Correção sugerida.** Trocar "773 bytes" por "773 caracteres" na linha 76, igualando à linha 89.

---

### 7. BAIXO. A busca de rede não está na linha 10

**Trecho (linha 148):** "a linha 10 busca a página da Wikipédia pela rede, e ela muda."

**Comando:**

```bash
sed -n '9,12p' 00-SimpleRAG/03_LangChain_LCEL_RAG_v3.py
#  9: loader = WebBaseLoader(
# 10:     web_paths=("https://en.wikipedia.org/wiki/Black_Myth:_Wukong",)
# 11: )
# 12: docs = loader.load()
```

A linha 10 declara a URL; quem vai à rede é `loader.load()`, na linha 12. O ponto da aula (o corpus
não é estável) fica de pé.

**Correção sugerida.** "a URL da linha 10 é buscada pela rede na linha 12, e a página muda."

---

### 8. BAIXO. A troca pela cópia offline exige trocar o loader, e isso não é dito

**Trecho (linhas 148-150):** "troque o `WebBaseLoader` pela cópia offline
`99-EN/black-myth-wukong/black_myth_wukong_wiki.txt`".

O `WebBaseLoader` não lê arquivo local: a substituição exige outro loader (`TextLoader`) e outro
import. A mesma lacuna está em "Armadilhas de produção" ("Para desenvolver, use a cópia offline").

**Correção sugerida.** Acrescentar o "como": `from langchain_community.document_loaders import
TextLoader` e `TextLoader("../99-EN/black-myth-wukong/black_myth_wukong_wiki.txt").load()`.

---

## Verificação amostral (a rubrica exige cinco; foram conferidas 27)

Todas conferidas no commit `17c6942`. Salvo onde indicado, o conteúdo alegado **está** na linha
citada.

| # | Afirmação da aula | Comando | Resultado |
| --- | --- | --- | --- |
| 1 | Módulo tem 23 arquivos | `git ls-files 00-SimpleRAG \| wc -l` | 23 (inclui `.env.example`). **Confere** |
| 2 | `01_01:19` carrega o corpus, e o comentário chama isso de "Line 2" | `cat -n 01_01_LlamaIndex_5LineCode.py` | l.18 `# Line 2: load the data`, l.19 o `SimpleDirectoryReader`. **Confere** |
| 3 | Zero ocorrências de `combat`, `weapon`, `staff`, `transformation`, `tool` no corpus | contagem em Python sobre o `.txt` | 0, 0, 0, 0, 0. **Confere** |
| 4 | O corpus tem 168 tokens e o `SentenceSplitter` devolve um nó | `SentenceSplitter().get_nodes_from_documents([Document(text=txt)])` + `tiktoken cl100k_base` | 1 nó, 168 tokens. **Confere** |
| 5 | `DEFAULT_CHUNK_SIZE = 1024`, `DEFAULT_SIMILARITY_TOP_K = 2`, `DEFAULT_CHUNK_OVERLAP = 20` | leitura de `llama_index.core.constants` | 1024, 2, 20. **Confere** |
| 6 | `DEFAULT_CHUNK_OVERLAP` é do `TokenTextSplitter`, e `from_documents` roda o `SentenceSplitter` | `TokenTextSplitter().chunk_overlap` e `Settings.node_parser` | 20, e `SentenceSplitter`. **Confere** |
| 7 | `SENTENCE_CHUNK_OVERLAP = 200` e `SentenceSplitter().chunk_overlap == 200`, em `llama-index-core 0.12.15` | importação direta | 200, 200, versão 0.12.15. **Confere** |
| 8 | `grep -rli "bge-small-zh"` devolve 12 dos 23 arquivos, e a lista nominal | `grep -rli "bge-small-zh" . \| sort` | 12, e a enumeração da aula (3 visíveis + `01_04`, `01_05`, quatro `02_0x` sendo 01/02/04/05, três `04_*`) bate arquivo a arquivo. **Confere** |
| 9 | `01_03_SwitchGenerationModel.py:9` define `Settings.embed_model`, código ativo nunca sobrescrito | `cat -n` do arquivo | l.9 ativa, l.11 comentada. **Confere** |
| 10 | `01_02:11` seta `HF_ENDPOINT` e `01_02:3` já importou `HuggingFaceEmbedding` | `cat -n 01_02_...py` | l.3 import, l.11 `os.environ['HF_ENDPOINT']`. **Confere** |
| 11 | `huggingface_hub/constants.py:69` faz `ENDPOINT = os.getenv("HF_ENDPOINT", ...)` | `grep -n "HF_ENDPOINT" .../constants.py` | linha 69, literal idêntico. **Confere** |
| 12 | Setar a variável depois do import deixa `ENDPOINT` em `https://huggingface.co` | import de `constants`, `os.environ[...]`, releitura | `https://huggingface.co` antes e depois. **Confere** |
| 13 | `01_02:26` usa o LLM padrão, que `resolve_llm("default")` resolve para OpenAI validando a chave | `cat -n` + `llama_index/core/llms/utils.py:27-42` | l.26 `as_query_engine()`; `utils.py` l.41 `OpenAI()`, l.42 `validate_openai_api_key`. **Confere** |
| 14 | `01_02:5` avisa que a chave OpenAI ainda é usada | `cat -n 01_02_...py` | l.5 `# Load environment variables (OPENAI_API_KEY is still used for the default LLM)`. **Confere** |
| 15 | `DEFAULT_TEXT_QA_PROMPT_TMPL` diz "Given the context information and not prior knowledge, answer the query" e não oferece saída | `repr(DEFAULT_TEXT_QA_PROMPT_TMPL)` | literal presente, sem cláusula de recusa. **Confere** |
| 16 | `v3` tem comentários numerados de 1 a 9, e o `# 9. Run the query` fica no fim | `cat -n 03_LangChain_LCEL_RAG_v3.py` | 1(l.1), 2(l.14), 3(l.20), 4(l.29), 5(l.35), 6(l.38), 7(l.49), 8(l.56), 9(l.97). **Confere** |
| 17 | Segunda série de 1 a 5, de inspeção, entre eles | idem | l.77, 81, 85, 89, 93. **Confere** |
| 18 | `v3:99` calcula `response` e o arquivo acaba ali; `v1` imprime na 66, `v2` na 96 | `wc -l` + `grep -n print` | `v3` tem 99 linhas, sem `print(response)`; `v1:66` e `v2:96` imprimem. **Confere** |
| 19 | Os cinco `print` das linhas 79-95 rodam sobre `"test question"` da linha 75, não sobre a pergunta da 98 | `cat -n` | l.75 `question = "test question"`, prints em 79/83/87/91/95, l.98 reatribui. **Confere** |
| 20 | `v3` tem `chunk_size=1000`, `chunk_overlap=200`, `k=3`, `bge-small-zh-v1.5` e o template com a cláusula | `cat -n` | l.17, l.17, l.36, l.24, l.41-47. **Confere** |
| 21 | O comentário do `v3` compara o `\|` com os pipes do Unix | `cat -n` | l.57 `like Unix pipes (\|)`. **Confere** |
| 22 | A cópia offline tem 4.422 caracteres e dá exatamente cinco chunks com `chunk_size=1000, chunk_overlap=200` | leitura + `RecursiveCharacterTextSplitter(...).split_text` | 4.422 caracteres, 5 chunks, 40 linhas, 0 tags HTML. **Confere nos quatro números** |
| 23 | `05_RAG_from_Scratch_Ollama.py` tem 64 linhas, nove documentos, `IndexFlatL2`, `all-MiniLM-L6-v2`, `k=3`, e o prompt numera as fontes | `cat -n` + `wc -l` | 64 linhas, 9 strings (l.9-17), l.30, l.22, l.39, l.47-52. **Confere** |
| 24 | Os três `05_*` dizem o equivalente da cláusula com outras palavras | `grep -n "cannot" 05_*.py` | l.48 nos três: "If the answer cannot be found [...] say that you cannot answer". **Confere** |
| 25 | `draw_ascii()` levanta `ImportError: Install grandalf to draw graphs`, e `grandalf` não está no `requirements.txt` | `grep -n "Install grandalf" langchain_core/runnables/graph_ascii.py` + `cat requirements.txt` | l.171 a mensagem, l.172 `raise ImportError`; `grandalf` ausente das 25 linhas de dependência. **Confere** |
| 26 | `04_LangGraph_RAG.py` imprime só pergunta e resposta | `cat -n` | l.69-70, os dois únicos `print`. **Confere** |
| 27 | A Aula 02 sustenta a ligação L2/cosseno para vetores normalizados | `grep -n "L2" AULA-02-vetores-embeddings-similaridade.md` | l.131-133 diz exatamente isso sobre o `all-MiniLM-L6-v2` e o `IndexFlatL2`. **Coerência externa confere** |

Conferências adicionais que também passaram, sem linha própria na tabela: o `ImportError` de
`llama-index-readers-file` existe em `llama_index/core/readers/file/base.py:79` e é disparado na
construção do `SimpleDirectoryReader` qualquer que seja a extensão; os seis módulos citados
(`01-DataLoading`, `02-DocChunking`, `03-Embedding`, `04-VectorDB`, `07-PostRetrieval`,
`08-Generation`) existem na raiz; os cinco `02_*` têm exatamente oito passos numerados; os seis
`01_*` fazem a mesma pergunta sobre `combat tools` (inclusive o
`01_03_SwitchToOpenAICompatibleModel.py:67`, que a faz por variável); `CUSTOM_API_BASE_URL` está na
linha 12 desse mesmo arquivo; e o `04_LangGraph_RAG_Ollama.py:52` usa `ChatOllama`, contra o
`ChatOpenAI` da linha 51 do irmão, como a tabela do "Modelo mental" afirma.

---

## Observação sobre a nota anterior

A nota vigente de 6/12 com `C = 0` foi medida no commit `ff5a3ef`, que aplicou os consertos no mesmo
ato. Três dos consertos aparecem no texto de hoje e estão certos, medidos acima: a separação entre
`DEFAULT_CHUNK_OVERLAP = 20` (do `TokenTextSplitter`) e `SENTENCE_CHUNK_OVERLAP = 200` (do
`SentenceSplitter`, que é o que `from_documents` roda), item 7 da amostra; a explicação de por que
três das seis decisões ainda não agem no corpus de um nó, item 4; e a qualificação de que o defeito
do embedding chinês é latente nos `01_*`, sustentada pelo mesmo item 4.

`C = 0` não descreve o texto de hoje. O único defeito técnico que encontrei é o achado 3.

---

## Higiene

```
$ cd E:/Projetos/rag/rag-auditado-ptbr && git status --porcelain
(vazio)

$ cd E:/Projetos/rag/RAG-from-First-Principles && git status --porcelain
(vazio)
```

Nenhum arquivo criado, editado ou apagado nos dois repositórios. Sem `fetch`, sem `pull`, sem
instalação de pacote. O relatório está no scratchpad da sessão.
