# AULA 03 — Seu primeiro RAG: 5 linhas, e o mesmo sem framework

**Fase 0 — Fundamentos** · Módulo do repo: `00-SimpleRAG/` (23 arquivos)

---

## Pergunta motivadora

`VectorStoreIndex.from_documents(documents)` — uma linha, e você tem um sistema de
RAG funcionando. O que exatamente essa linha faz?

Esta aula responde de duas formas: primeiro rodando a versão de cinco linhas,
depois reconstruindo a mesma coisa manualmente. A comparação é o ponto. Enquanto o
framework for mágica, você não consegue depurá-lo.

---

## Modelo mental

O módulo `00-SimpleRAG/` é deliberadamente organizado em três níveis de abstração,
do mais alto ao mais baixo. Percorra nessa ordem:

| Grupo  | Arquivos                                          | Nível de abstração                             |
| ------ | ------------------------------------------------- | ---------------------------------------------- |
| `01_*` | 6 variantes LlamaIndex (dois com prefixo `01_03`) | **altíssimo** — 5 linhas, tudo implícito       |
| `02_*` | 5 pipelines LangChain completos                   | médio-baixo — oito passos explícitos, sem LCEL |
| `03_*` | 3 versões LCEL                                    | médio-baixo — pipeline explícito               |
| `04_*` | LangGraph (dois `.py` — OpenAI e Ollama — e um `.ipynb`) | baixo — grafo de estados                 |
| `05_*` | 3 variantes "from scratch"                        | **mais baixo** — sem framework de RAG          |

A numeração não é arbitrária: é uma escada descendente de abstração. Você vai
subir por ela ao contrário — do topo (`01`) ao chão (`05`) — porque o mais
instrutivo é ver a mágica primeiro e depois desmontá-la.

---

## Parte 1 — As cinco linhas

Abra `00-SimpleRAG/01_01_LlamaIndex_5LineCode.py`. Descontando imports e o
carregamento do `.env`, o núcleo é:

```python
documents = SimpleDirectoryReader(input_files=["../99-EN/black-myth-wukong/black_myth_wukong_setting.txt"]).load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
print(query_engine.query("What combat tools are there in Black Myth: Wukong?"))
```

Rode (use a variante `01_05_..._Ollama.py` se optou por local):

```powershell
cd RAG-from-First-Principles/00-SimpleRAG
python 01_01_LlamaIndex_5LineCode.py
```

### O que está escondido nessas linhas

Cada linha esconde decisões que os próximos oito módulos do curso vão abrir uma a
uma:

| Linha                        | Decisões implícitas                               | Aula que abre |
| ---------------------------- | ------------------------------------------------- | ------------- |
| `SimpleDirectoryReader(...)` | qual parser por extensão, que metadados preservar | 04, 05, 06    |
| `from_documents(...)`        | chunking (tamanho, sobreposição, estratégia)      | 07            |
| `from_documents(...)`        | qual modelo de embedding                          | 08            |
| `from_documents(...)`        | qual vector store, qual índice, qual métrica      | 09, 10        |
| `as_query_engine()`          | top-k, se há reranking, template de prompt        | 17, 19        |
| `.query(...)`                | qual LLM, temperatura, como o contexto é montado  | 19            |

Os padrões do LlamaIndex: chunk de 1024 tokens com 20 de sobreposição,
`text-embedding-ada-002` da OpenAI, índice em memória, `top_k = 2`. Nenhum deles é
o certo para o seu caso. Todos são razoáveis para começar.

**É por isso que "monta-se um RAG numa tarde".** E é por isso que ele funciona mal
em produção: você aceitou seis decisões arquiteturais sem saber que as tomou.

---

## Parte 2 — Isolando as trocas

Os arquivos `01_02` e `01_03` existem para provar que embedding e geração são
decisões independentes:

- `01_02_LlamaIndex_SwitchEmbeddingModel.py` — troca **só** o embedding, para
  `HuggingFaceEmbedding` local. O LLM segue OpenAI.
- `01_03_LlamaIndex_SwitchGenerationModel.py` — o nome diz que troca só o LLM, e não é verdade: a
  linha 9 também define `Settings.embed_model = HuggingFaceEmbedding("BAAI/bge-small-zh")`, código
  ativo, nunca sobrescrito. Troca as duas coisas — e herda o problema da Ressalva 1 abaixo.
- `01_03_LlamaIndex_SwitchToOpenAICompatibleModel.py` — aponta para qualquer
  endpoint compatível com a API da OpenAI, via `CUSTOM_API_BASE_URL`.

Rode `01_02` e observe: a primeira execução baixa o modelo do HuggingFace, e há
uma pausa. Da segunda em diante, roda do cache local, sem rede e sem custo.

### Duas ressalvas reais sobre este código

**Ressalva 1 — o modelo de embedding é chinês, e o defeito é do módulo inteiro.**
`grep -rli "bge-small-zh"` em `00-SimpleRAG/` devolve **12 dos 23 arquivos** — os três mais
visíveis são `01_02`, `01_03_LlamaIndex_SwitchGenerationModel.py` e
`03_LangChain_LCEL_RAG_v3.py`, mas também herdam o mesmo embedding os `01_04`, `01_05`, os quatro
`02_0x` (`01`, `02`, `04`, `05`) e os três `04_*`. O embedding configurado é `BAAI/bge-small-zh` /
`BAAI/bge-small-zh-v1.5`. O sufixo `zh` significa **chinês**: são modelos treinados
para aquele idioma, resíduo da origem do livro. Como o corpus foi traduzido para
inglês, você está embutindo texto inglês com um modelo chinês — e vai obter recall
pior do que o exemplo sugere.

Isso não é um defeito a lamentar: é seu primeiro exercício real de diagnóstico.
Troque por `BAAI/bge-small-en-v1.5` e compare a qualidade da resposta. Para RAG em
português, `intfloat/multilingual-e5-small` ou
`paraphrase-multilingual-MiniLM-L12-v2` são pontos de partida melhores.

**Ressalva 2 — o espelho do HuggingFace.** `01_02` define
`os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'`, um espelho usado quando o
HuggingFace está bloqueado. No Brasil, isso só adiciona latência. Comente a linha.

**Julgamento:** estas duas observações valem mais que a aula que as cerca — **código de exemplo carrega o
contexto de quem o escreveu.** Ler criticamente é parte do ofício.

---

## Parte 3 — LCEL: o pipeline fica visível

Abra `03_LangChain_LCEL_RAG_v3.py`. Agora cada etapa é uma linha nomeada, com
comentários numerados de 1 a 8:

```python
loader = WebBaseLoader(web_paths=("https://en.wikipedia.org/wiki/Black_Myth:_Wukong",))
docs = loader.load()                                          # 1. carregar

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
all_splits = text_splitter.split_documents(docs)              # 2. fatiar

embeddings = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh-v1.5", ...)  # 3. embutir
vectorstore = InMemoryVectorStore(embeddings)
vectorstore.add_documents(all_splits)                          # 4. armazenar
retriever = vectorstore.as_retriever(search_kwargs={"k": 3})   # 5. recuperar
prompt = ChatPromptTemplate.from_template("""...""")           # 6. montar prompt
llm = ChatOllama(model=os.getenv("OLLAMA_MODEL"))              # 7. gerar
chain = {...} | prompt | llm | StrOutputParser()               # 8. encadear
```

Compare com as cinco linhas de `01_01`. **É o mesmo pipeline.** A diferença é que
aqui `chunk_size=1000`, `chunk_overlap=200` e `k=3` estão escritos, portanto podem
ser mudados com intenção.

Repare também no template de prompt: ele instrui explicitamente a dizer
_"I cannot find relevant information in the provided context."_ quando o contexto
não serve. Essa instrução é a diferença entre um RAG que admite ignorância e um que
inventa. Guarde para a Aula 19.

E note o operador `|` do LCEL: é encadeamento no estilo dos pipes do Unix, como o
próprio comentário do arquivo aponta. Cada estágio recebe a saída do anterior.

---

## Parte 4 — Sem framework nenhum

Aqui a aula se paga. Abra `05_RAG_from_Scratch_Ollama.py` (ou a variante
`_Claude` / `_DeepSeek`). São seis blocos numerados, sem LangChain nem LlamaIndex:

```python
# 1. documentos como lista de strings, direto no código
docs = ["Combat in Black Myth: Wukong feels like...", ...]

# 2. embedding
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
doc_embeddings = model.encode(docs)

# 3. vector store — FAISS cru
index = faiss.IndexFlatL2(doc_embeddings.shape[1])
index.add(doc_embeddings.astype('float32'))

# 4. busca por similaridade
query_embedding = model.encode([question])[0]
distances, indices = index.search(np.array([query_embedding]).astype('float32'), k=3)
context = [docs[idx] for idx in indices[0]]

# 5. montar o prompt — concatenação de string, nada mais
prompt = f"""Answer the question based on the reference information below, and cite the source numbers.
...
Reference information:
{chr(10).join(f"[{i+1}] {doc}" for i, doc in enumerate(context))}
Question: {question}
Answer:"""

# 6. gerar
response = chat(model=os.getenv("OLLAMA_MODEL"), messages=[{"role": "user", "content": prompt}])
```

**Não há chunking neste exemplo** — cada string já é um chunk. E é isso: RAG
inteiro em 64 linhas (`awk` no `05_RAG_from_Scratch_Ollama.py`), sem abstração alguma.

Três coisas para notar:

1. **`IndexFlatL2`** — busca exaustiva e exata, com métrica euclidiana. Nada de
   ANN. Para nove documentos, ANN seria absurdo. Conecta direto com a Aula 02:
   `all-MiniLM-L6-v2` normaliza os vetores, e para vetores normalizados a ordenação
   por L2 equivale à por cosseno. Por isso funciona.
2. **O prompt numera as fontes** e pede citação — proveniência implementada com
   f-string. Não precisa de framework para ter rastreabilidade.
3. **`k=3`** aparece como número solto no meio do código. Em produção, isso é
   parâmetro de configuração, e ajustá-lo costuma render mais que trocar de modelo.

Depois de ler este arquivo, volte para `01_01`. As cinco linhas deixam de ser
mágica: agora você sabe que elas fazem estes seis passos, com padrões que alguém
escolheu por você.

---

## Parte 5 — LangGraph, um aperitivo

`04_LangGraph_RAG.py` (e o notebook equivalente) expressa o mesmo pipeline como
grafo de estados. Parece exagero para um fluxo linear — e é, neste caso.

O motivo de existir aqui: quando o pipeline precisar de **ciclos** — recuperou
material ruim, avalia, reformula a query, recupera de novo — o grafo passa a ser a
forma natural, e o pipeline linear não dá conta. É a base de Self-RAG (Aula 21),
CRAG (Aula 18) e Agentic RAG (Aula 26).

Nesta aula, apenas rode e observe a estrutura de nós e arestas. Voltaremos.

---

## Quebre de propósito

**1. Faça o retriever falhar por top-k.** Em `03_LangChain_LCEL_RAG_v3.py`, mude
`k=3` para `k=1`. Pergunte algo que exija combinar dois trechos ("compare os estilos
de combate e o sistema de transformações"). A resposta fica incompleta — e o
sistema não avisa. Volte para `k=3` e depois teste `k=10`: observe a resposta ficar
mais difusa. Existe um ótimo, e ele depende do corpus.

**2. Remova a instrução de honestidade.** No template de prompt, apague a frase
_"If the context doesn't contain relevant information, say..."_. Depois pergunte
algo que não está no documento — o preço do jogo, por exemplo. Compare o antes e o
depois. Você acabou de medir, na prática, quanto uma única frase de prompt reduz
alucinação.

**3. Troque o embedding chinês pelo inglês.** Em
`03_LangChain_LCEL_RAG_v3.py`, troque `BAAI/bge-small-zh-v1.5` por
`BAAI/bge-small-en-v1.5`. Faça a mesma pergunta antes e depois e compare o que foi
recuperado. É a Aula 02 se materializando: modelo de embedding errado para o idioma
degrada o recall silenciosamente.

**4. Corte o chunk overlap.** Mude `chunk_overlap=200` para `0`. Pergunte sobre algo
descrito num trecho que atravessa fronteira de chunk. Prepara a Aula 07.

---

## Armadilhas de produção

- **Aceitar os padrões do framework como se fossem decisões.** Chunk de 1024,
  `top_k=2`, embedding da OpenAI: são pontos de partida, e você precisa saber que
  existem.
- **`InMemoryVectorStore` em produção.** Some ao reiniciar o processo e reindexar do
  zero a cada deploy custa tempo e dinheiro. Aulas 09 a 11.
- **`WebBaseLoader` contra site ao vivo.** O conteúdo muda, a Wikipédia pode
  bloquear, e seu teste deixa de ser reproduzível. Para desenvolver, use a cópia
  offline em `99-EN/black-myth-wukong/black_myth_wukong_wiki.txt`.
- **Modelo de embedding no idioma errado.** Vale repetir: `-zh` para conteúdo
  inglês, ou modelo só-inglês para conteúdo português, custa recall sem lançar erro.
- **Nenhuma avaliação.** Você vai fazer estes quatro experimentos e julgar "melhorou"
  por impressão. Aula 22 conserta isso — mas note desde já que o julgamento por
  impressão é exatamente como a maioria dos RAGs de produção é ajustada.

---

## Checkpoint

1. Liste as seis decisões arquiteturais escondidas em
   `VectorStoreIndex.from_documents(documents)`.
2. Por que `01_02` e `01_03` são exemplos separados, e não um só?
3. Em `05_RAG_from_Scratch_*.py`, o que `IndexFlatL2` faz, e por que a métrica L2
   não estraga o resultado ali?
4. Onde, no exemplo sem framework, está implementada a proveniência (citação de
   fonte)?
5. Que problema o LangGraph resolve que o pipeline LCEL linear não resolve?
6. Qual o defeito no modelo de embedding usado em 12 dos 23 arquivos deste módulo, e como
   você o corrigiria para um corpus em português?
7. Por que `InMemoryVectorStore` é inadequado em produção?

---

## Vocabulário

`loader` · `document` · `chunk` · `chunk overlap` · `retriever` · `top-k` ·
`vector store` · `prompt template` · `output parser` · `FLAT`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 02 — Vetores, embeddings e similaridade](AULA-02-vetores-embeddings-similaridade.md)
**Próxima:** [AULA 04 — Carregando texto, JSON, Markdown e páginas web](AULA-04-carregando-texto-json-web.md)
