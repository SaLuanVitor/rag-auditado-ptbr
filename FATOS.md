# FATOS — índice canônico do repositório

> **Arquivo gerado.** Não editar à mão. Regenere com:
> `node ferramentas/gerar-fatos.js`

Fonte: `../RAG-from-First-Principles/`. Cada linha traz a citação e o
**conteúdo literal** daquela linha, extraídos por script.

Existe porque o gate v1 do `@rag-specialist` registrou 3 alucinações, todas de
asserção factual sobre arquivos feita de memória. Citar deste índice remove a
etapa em que a memória preenchia o caminho. Se o fato não está aqui, rode um
`grep -n` direcionado — nunca reconstrua a citação de cabeça.

---

## 00-SimpleRAG

**23 arquivos.** Por extensão: `.py` 20 · `.example` 1 · `.ipynb` 1 · `.txt` 1

| Tema        | Citação                                                             | Conteúdo literal                                                                                                                |
| ----------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| modelo      | `00-SimpleRAG/01_02_LlamaIndex_SwitchEmbeddingModel.py:3`           | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding # requires pip install llama-index-embeddings-huggingface` |
| modelo      | `00-SimpleRAG/01_02_LlamaIndex_SwitchEmbeddingModel.py:12`          | `embed_model = HuggingFaceEmbedding(`                                                                                           |
| modelo      | `00-SimpleRAG/01_02_LlamaIndex_SwitchEmbeddingModel.py:13`          | `model_name="BAAI/bge-small-zh" # model path/name (downloaded from HuggingFace on first run)`                                   |
| modelo      | `00-SimpleRAG/01_03_LlamaIndex_SwitchGenerationModel.py:3`          | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding # requires pip install llama-index-embeddings-huggingface` |
| modelo      | `00-SimpleRAG/01_03_LlamaIndex_SwitchGenerationModel.py:9`          | `Settings.embed_model = HuggingFaceEmbedding("BAAI/bge-small-zh")`                                                              |
| modelo      | `00-SimpleRAG/01_03_LlamaIndex_SwitchToOpenAICompatibleModel.py:18` | `llm_model_name = "gpt-4" # or another chat model your API supports`                                                            |
| modelo      | `00-SimpleRAG/01_03_LlamaIndex_SwitchToOpenAICompatibleModel.py:19` | `embedding_model_name = "text-embedding-ada-002" # or another embedding model your API supports`                                |
| modelo      | `00-SimpleRAG/01_04_LlamaIndex_5LineCode_DeepSeek.py:3`             | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding`                                                           |
| modelo      | `00-SimpleRAG/01_04_LlamaIndex_5LineCode_DeepSeek.py:12`            | `embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-zh")`                                                            |
| modelo      | `00-SimpleRAG/01_05_LlamaIndex_5LineCode_Ollama.py:18`              | `OLLAMA_MODEL=qwen:7b  # or another downloaded model name`                                                                      |
| modelo      | `00-SimpleRAG/01_05_LlamaIndex_5LineCode_Ollama.py:23`              | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding`                                                           |
| modelo      | `00-SimpleRAG/01_05_LlamaIndex_5LineCode_Ollama.py:32`              | `embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-zh")`                                                            |
| modelo      | `00-SimpleRAG/01_05_LlamaIndex_5LineCode_Ollama.py:36`              | `model=os.getenv("OLLAMA_MODEL"),`                                                                                              |
| chunking    | `00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py:18`              | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |
| modelo      | `00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py:22`              | `from langchain_huggingface import HuggingFaceEmbeddings # pip install langchain-huggingface`                                   |
| modelo      | `00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py:24`              | `embeddings = HuggingFaceEmbeddings(`                                                                                           |
| modelo      | `00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py:25`              | `model_name="BAAI/bge-small-zh-v1.5",`                                                                                          |
| métrica     | `00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py:27`              | `encode_kwargs={'normalize_embeddings': True}`                                                                                  |
| recuperação | `00-SimpleRAG/02_01_LangChain_DeepSeek_Model_v1.py:40`              | `retrieved_docs = vector_store.similarity_search(question, k=3)`                                                                |
| chunking    | `00-SimpleRAG/02_02_LangChain_DeepSeek_Model_v2.py:17`              | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |
| modelo      | `00-SimpleRAG/02_02_LangChain_DeepSeek_Model_v2.py:21`              | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                       |
| modelo      | `00-SimpleRAG/02_02_LangChain_DeepSeek_Model_v2.py:23`              | `embeddings = HuggingFaceEmbeddings(`                                                                                           |
| modelo      | `00-SimpleRAG/02_02_LangChain_DeepSeek_Model_v2.py:24`              | `model_name="BAAI/bge-small-zh-v1.5",`                                                                                          |
| métrica     | `00-SimpleRAG/02_02_LangChain_DeepSeek_Model_v2.py:26`              | `encode_kwargs={'normalize_embeddings': True}`                                                                                  |
| recuperação | `00-SimpleRAG/02_02_LangChain_DeepSeek_Model_v2.py:39`              | `retrieved_docs = vector_store.similarity_search(question, k=3)`                                                                |
| chunking    | `00-SimpleRAG/02_03_LangChain_OpenAI_Model.py:14`                   | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |
| recuperação | `00-SimpleRAG/02_03_LangChain_OpenAI_Model.py:30`                   | `retrieved_docs = vector_store.similarity_search(question, k=3)`                                                                |
| chunking    | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:12`              | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |
| modelo      | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:16`              | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                       |
| modelo      | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:18`              | `embeddings = HuggingFaceEmbeddings(`                                                                                           |
| modelo      | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:19`              | `model_name="BAAI/bge-small-zh-v1.5",`                                                                                          |
| métrica     | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:21`              | `encode_kwargs={'normalize_embeddings': True}`                                                                                  |
| recuperação | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:34`              | `retrieved_docs = vector_store.similarity_search(question, k=3)`                                                                |
| modelo      | `00-SimpleRAG/02_04_LangChain_HuggingFace_Model.py:55`              | `model_name = "Qwen/Qwen2.5-1.5B"`                                                                                              |
| modelo      | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:18`                   | `OLLAMA_MODEL=qwen:7b  # or another downloaded model name`                                                                      |
| chunking    | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:35`                   | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |
| modelo      | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:39`                   | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                       |
| modelo      | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:41`                   | `embeddings = HuggingFaceEmbeddings(`                                                                                           |
| modelo      | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:42`                   | `model_name="BAAI/bge-small-zh-v1.5",`                                                                                          |
| métrica     | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:44`                   | `encode_kwargs={'normalize_embeddings': True}`                                                                                  |
| recuperação | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:56`                   | `retrieved_docs = vector_store.similarity_search(question, k=3)`                                                                |
| modelo      | `00-SimpleRAG/02_05_LangChain_Ollama_Model.py:72`                   | `llm = ChatOllama(model=os.getenv("OLLAMA_MODEL"))`                                                                             |
| chunking    | `00-SimpleRAG/03_LangChain_LCEL_RAG_v1.py:16`                       | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |
| recuperação | `00-SimpleRAG/03_LangChain_LCEL_RAG_v1.py:31`                       | `retriever = vectorstore.as_retriever(search_kwargs={"k": 3})`                                                                  |
| chunking    | `00-SimpleRAG/03_LangChain_LCEL_RAG_v2.py:16`                       | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`                                            |

_37 ocorrências adicionais omitidas (limite 45 por módulo). Rode um grep -n direcionado para as demais._

## 01-DataLoading

**61 arquivos.** Por extensão: `.py` 50 · `.example` 7 · `.ipynb` 3 · `.txt` 1

**Subdiretórios:** `01-SimpleTextLoading` · `02-StructuredDocumentLoading` · `03-ParsingImageAndTextData` · `04-PDFFileLoading` · `05-TableDataLoading` · `99-Others`

| Tema        | Citação                                                        | Conteúdo literal                                                           |
| ----------- | -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| chunking    | `01-DataLoading/99-Others/15_LangChain_PDF-PyPDFLoader.py:21`  | `chunk_size=1000,`                                                         |
| chunking    | `01-DataLoading/99-Others/15_LangChain_PDF-PyPDFLoader.py:22`  | `chunk_overlap=200,`                                                       |
| recuperação | `01-DataLoading/99-Others/15_LangChain_PDF-PyPDFLoader.py:35`  | `retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),`              |
| chunking    | `01-DataLoading/99-Others/15_LangChain_PDF_Unstructured.py:21` | `chunk_size=1000,`                                                         |
| chunking    | `01-DataLoading/99-Others/15_LangChain_PDF_Unstructured.py:22` | `chunk_overlap=200,`                                                       |
| recuperação | `01-DataLoading/99-Others/15_LangChain_PDF_Unstructured.py:35` | `retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),`              |
| recuperação | `01-DataLoading/99-Others/15_LlamaIndex_PDF.py:29`             | `similarity_top_k=3,`                                                      |
| chunking    | `01-DataLoading/99-Others/15_LlamaIndex_PDF_Small2Big.py:20`   | `Settings.node_parser = SentenceSplitter(chunk_size=72, chunk_overlap=20)` |
| chunking    | `01-DataLoading/99-Others/15_LlamaIndex_PDF_Small2Big.py:24`   | `window_size=3,`                                                           |
| recuperação | `01-DataLoading/99-Others/15_LlamaIndex_PDF_Small2Big.py:39`   | `similarity_top_k=3,`                                                      |
| recuperação | `01-DataLoading/99-Others/15_LlamaParse_PDF no_Rerank.py:48`   | `similarity_top_k=15,  verbose=True`                                       |
| recuperação | `01-DataLoading/99-Others/15_LlamaParse_PDF no_Rerank.py:52`   | `similarity_top_k=15,`                                                     |
| recuperação | `01-DataLoading/99-Others/15_LlamaParse_PDF.py:50`             | `similarity_top_k=15, node_postprocessors=[reranker], verbose=True`        |
| recuperação | `01-DataLoading/99-Others/15_LlamaParse_PDF.py:54`             | `similarity_top_k=3, node_postprocessors=[reranker]`                       |
| chunking    | `01-DataLoading/99-Others/15_LlamaPaser_PDF_Small2Big.py:22`   | `window_size=3,`                                                           |
| recuperação | `01-DataLoading/99-Others/15_LlamaPaser_PDF_Small2Big.py:39`   | `similarity_top_k=3,`                                                      |

## 02-DocChunking

**9 arquivos.** Por extensão: `.py` 7 · `.example` 1 · `.txt` 1

| Tema        | Citação                                                           | Conteúdo literal                                                                                                          |
| ----------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| chunking    | `02-DocChunking/01-LangChain-CharacterTextSplitter.py:7`          | `chunk_size=100,  # each text chunk is 50 characters`                                                                     |
| chunking    | `02-DocChunking/01-LangChain-CharacterTextSplitter.py:8`          | `chunk_overlap=10,  # no overlap between chunks`                                                                          |
| chunking    | `02-DocChunking/02-LangChain-RecursiveharacterTextSplitter.py:9`  | `chunk_size=100,`                                                                                                         |
| chunking    | `02-DocChunking/02-LangChain-RecursiveharacterTextSplitter.py:10` | `chunk_overlap=10,`                                                                                                       |
| chunking    | `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:18`     | `Settings.node_parser = SentenceSplitter(chunk_size=250, chunk_overlap=20) # 50, 100, 250 give different results -- why?` |
| recuperação | `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:31`     | `similarity_top_k=3,`                                                                                                     |
| chunking    | `02-DocChunking/04-LangChain-ChunkingForCode.py:71`               | `chunk_size=1000,`                                                                                                        |
| chunking    | `02-DocChunking/04-LangChain-ChunkingForCode.py:72`               | `chunk_overlap=0`                                                                                                         |
| chunking    | `02-DocChunking/04-LangChain-PlainChunkingForCode.py:66`          | `chunk_size=1000,  # size of each chunk`                                                                                  |
| chunking    | `02-DocChunking/04-LangChain-PlainChunkingForCode.py:67`          | `chunk_overlap=00,  # overlap between adjacent chunks`                                                                    |
| modelo      | `02-DocChunking/05-LlamaIndex-SemanticChunking.py:12`             | `# from llama_index.embeddings.huggingface import HuggingFaceEmbedding`                                                   |
| modelo      | `02-DocChunking/05-LlamaIndex-SemanticChunking.py:13`             | `# embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-zh")`                                                    |
| chunking    | `02-DocChunking/05-LlamaIndex-SemanticChunking.py:18`             | `buffer_size=3,  # buffer size`                                                                                           |
| chunking    | `02-DocChunking/05-LlamaIndex-SemanticChunking.py:24`             | `# chunk_size=512`                                                                                                        |
| chunking    | `02-DocChunking/05-LlamaIndex-SemanticChunking.py:49`             | `If buffer_size=2 and breakpoint_percentile_threshold=90: every 2 sentences are grouped`                                  |
| chunking    | `02-DocChunking/05-LlamaIndex-SemanticChunking.py:52`             | `If buffer_size=3 and breakpoint_percentile_threshold=98: every 3 sentences are grouped`                                  |

## 03-Embedding

**8 arquivos.** Por extensão: `.py` 6 · `.example` 1 · `.txt` 1

| Tema   | Citação                                     | Conteúdo literal                       |
| ------ | ------------------------------------------- | -------------------------------------- |
| modelo | `03-Embedding/05-MultimodalEmbedding.py:16` | `model_name = "BAAI/bge-base-en-v1.5"` |

## 04-VectorDB

**38 arquivos.** Por extensão: `.py` 27 · `.example` 5 · `.jpg` 3 · `.ipynb` 1 · `.yml` 1 · `.txt` 1

**Subdiretórios:** `HybridRetrieval` · `LlamaIndex` · `Milvus` · `MultimodalRetrieval`

| Tema       | Citação                                                                        | Conteúdo literal                                                                                         |
| ---------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py:126`  | `collection.create_index("sparse_vector", {"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"})` |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py:131`  | `collection.create_index("dense_vector", {"index_type": "AUTOINDEX", "metric_type": "IP"})`              |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py:238`  | `search_params_dense = {"metric_type": "IP", "params": {}}`                                              |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py:239`  | `search_params_sparse = {"metric_type": "IP", "params": {}}`                                             |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:70`  | `collection.create_index("sparse_vector", {"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"})` |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:71`  | `collection.create_index("dense_vector", {"index_type": "AUTOINDEX", "metric_type": "IP"})`              |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v2-Detailed.py:128` | `"metric_type": "IP",`                                                                                   |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:70`  | `collection.create_index("sparse_vector", {"index_type": "SPARSE_INVERTED_INDEX", "metric_type": "IP"})` |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:71`  | `collection.create_index("dense_vector", {"index_type": "AUTOINDEX", "metric_type": "IP"})`              |
| métrica    | `04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v3-Reranked.py:130` | `"metric_type": "IP",`                                                                                   |
| chunking   | `04-VectorDB/LlamaIndex/CreateLocalVectorStore-BuildIndex.ipynb:151`           | `"text_splitter = SentenceSplitter(chunk_size=512, chunk_overlap=10)\n",`                                |
| métrica    | `04-VectorDB/Milvus/02-Indexes/01-milvus_flat_index.py:34`                     | `metric_type="L2",`                                                                                      |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/01-milvus_flat_index.py:35`                     | `index_type="FLAT",`                                                                                     |
| métrica    | `04-VectorDB/Milvus/02-Indexes/02-ivf_flat_index.py:34`                        | `metric_type="L2",`                                                                                      |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/02-ivf_flat_index.py:35`                        | `index_type="IVF_FLAT",`                                                                                 |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/02-ivf_flat_index.py:38`                        | `"nlist": 64  # Set the number of clusters`                                                              |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/02-ivf_flat_index.py:65`                        | `"nprobe": 10  # Set the number of clusters to check during search`                                      |
| métrica    | `04-VectorDB/Milvus/02-Indexes/03-ivf_pq_index.py:34`                          | `metric_type="L2",`                                                                                      |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/03-ivf_pq_index.py:35`                          | `index_type="IVF_PQ",`                                                                                   |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/03-ivf_pq_index.py:38`                          | `"nlist": 64,  # Number of cluster centers, usually set to 4*sqrt(n), where n is the number of vectors`  |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/03-ivf_pq_index.py:39`                          | `"m": 32,      # Number of sub-vectors the vector is split into, usually dim/m >= 2; here 128/32=4`      |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/03-ivf_pq_index.py:67`                          | `"nprobe": 10  # Set the number of clusters to check during search`                                      |
| métrica    | `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:34`                            | `metric_type="L2",`                                                                                      |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:35`                            | `index_type="HNSW",`                                                                                     |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:38`                            | `"M": 64,  # Maximum number of neighbors`                                                                |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:39`                            | `"efConstruction": 100  # Number of candidate neighbors during construction`                             |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/04-hnsw_index.py:66`                            | `"ef": 10  # Number of candidate neighbors during search`                                                |
| métrica    | `04-VectorDB/Milvus/02-Indexes/05-DiskANN.py:34`                               | `metric_type="L2",  # Supports L2, IP, or COSINE`                                                        |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/05-DiskANN.py:35`                               | `index_type="DISKANN",  # Use the DiskANN index`                                                         |
| índice ANN | `04-VectorDB/Milvus/02-Indexes/05-DiskANN.py:62`                               | `"search_list": 32  # Candidate list size during search`                                                 |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/01-basic-ann.py:34`                    | `metric_type="L2",`                                                                                      |
| índice ANN | `04-VectorDB/Milvus/03-SearchAndMetrics/01-basic-ann.py:35`                    | `index_type="FLAT",`                                                                                     |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/01-basic-ann.py:56`                    | `search_params={"metric_type": "L2"}`                                                                    |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/01-basic-ann.py:72`                    | `search_params={"metric_type": "L2"}`                                                                    |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/01-basic-ann.py:88`                    | `search_params={"metric_type": "L2"},`                                                                   |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:15`             | `metric_types = ["L2", "IP", "COSINE"]`                                                                  |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:16`             | `collections = {metric: f"ann_search_demo_{metric.lower()}" for metric in metric_types}`                 |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:28`             | `def create_collection_with_metric(collection_name, metric_type):`                                       |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:50`             | `metric_type=metric_type,`                                                                               |
| índice ANN | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:51`             | `index_type="FLAT",`                                                                                     |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:65`             | `for metric_type, collection_name in collections.items():`                                               |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:66`             | `print(f"\nCreating collection for metric type {metric_type}...")`                                       |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:67`             | `create_collection_with_metric(collection_name, metric_type)`                                            |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:81`             | `for metric_type, collection_name in collections.items():`                                               |
| métrica    | `04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py:82`             | `print(f"\nSearching with metric type {metric_type}:")`                                                  |

_62 ocorrências adicionais omitidas (limite 45 por módulo). Rode um grep -n direcionado para as demais._

## 05-PreRetrieval

**27 arquivos.** Por extensão: `.py` 21 · `.example` 4 · `.ipynb` 1 · `.txt` 1

**Subdiretórios:** `01-QueryConstruction` · `02-QueryTranslation` · `03-QueryRouting`

| Tema        | Citação                                                                                           | Conteúdo literal                                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| modelo      | `05-PreRetrieval/01-QueryConstruction/BuildingMetadataFilter/02-GenerateMetadataInQuery.py:10`    | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                |
| modelo      | `05-PreRetrieval/01-QueryConstruction/BuildingMetadataFilter/02-GenerateMetadataInQuery.py:43`    | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")`                                                    |
| modelo      | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/02-ingest-ddl.py:11`                        | `embedding_function = model.dense.OpenAIEmbeddingFunction(model_name='text-embedding-3-large')`                          |
| métrica     | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/02-ingest-ddl.py:42`                        | `index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="COSINE", params={"nlist": 1024})`      |
| modelo      | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/03-ingest-q2sql.py:11`                      | `embedding_function = model.dense.OpenAIEmbeddingFunction(model_name='text-embedding-3-large')`                          |
| métrica     | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/03-ingest-q2sql.py:41`                      | `index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="COSINE", params={"nlist": 1024})`      |
| modelo      | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/04-ingest-db-desc.py:11`                    | `embedding_function = model.dense.OpenAIEmbeddingFunction(model_name='text-embedding-3-large')`                          |
| métrica     | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/04-ingest-db-desc.py:46`                    | `index_params.add_index(field_name="vector", index_type="AUTOINDEX", metric_type="COSINE", params={"nlist": 1024})`      |
| modelo      | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v1-error.py:26`             | `model_name='text-embedding-3-large',`                                                                                   |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v1-error.py:61`             | `ddl_hits = retrieve("ddl_knowledge", q_emb.tolist(), top_k=3, fields=["ddl_text"])`                                     |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v1-error.py:70`             | `q2sql_hits = retrieve("q2sql_knowledge", q_emb.tolist(), top_k=3, fields=["question", "sql_text"])`                     |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v1-error.py:82`             | `desc_hits = retrieve("dbdesc_knowledge", q_emb.tolist(), top_k=5, fields=["table_name", "column_name", "description"])` |
| modelo      | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v2-ok.py:27`                | `model_name='text-embedding-3-large',`                                                                                   |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v2-ok.py:77`                | `ddl_hits = retrieve("ddl_knowledge", q_emb.tolist(), top_k=3, fields=["ddl_text"])`                                     |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v2-ok.py:86`                | `q2sql_hits = retrieve("q2sql_knowledge", q_emb.tolist(), top_k=3, fields=["question", "sql_text"])`                     |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v2-ok.py:98`                | `desc_hits = retrieve("dbdesc_knowledge", q_emb.tolist(), top_k=8, fields=["table_name", "column_name", "description"])` |
| modelo      | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v3-agent.py:27`             | `model_name='text-embedding-3-large',`                                                                                   |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v3-agent.py:103`            | `ddl_hits = retrieve("ddl_knowledge", q_emb.tolist(), top_k=3, fields=["ddl_text"])`                                     |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v3-agent.py:112`            | `q2sql_hits = retrieve("q2sql_knowledge", q_emb.tolist(), top_k=3, fields=["question", "sql_text"])`                     |
| recuperação | `05-PreRetrieval/01-QueryConstruction/Text2SQL/Sakila/05-text2sql-rag-v3-agent.py:124`            | `desc_hits = retrieve("dbdesc_knowledge", q_emb.tolist(), top_k=5, fields=["table_name", "column_name", "description"])` |
| modelo      | `05-PreRetrieval/02-QueryTranslation/01-QueryRewriting-2-RePhraseQueryRetriever.py:8`             | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                |
| chunking    | `05-PreRetrieval/02-QueryTranslation/01-QueryRewriting-2-RePhraseQueryRetriever.py:20`            | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)`                                        |
| modelo      | `05-PreRetrieval/02-QueryTranslation/01-QueryRewriting-2-RePhraseQueryRetriever.py:23`            | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")`                                                    |
| modelo      | `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-1-MultiQueryRetriever.py:7`            | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                |
| chunking    | `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-1-MultiQueryRetriever.py:19`           | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)`                                        |
| modelo      | `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-1-MultiQueryRetriever.py:21`           | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")`                                                    |
| modelo      | `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-2-MultiQueryRetriever.py:8`            | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                |
| chunking    | `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-2-MultiQueryRetriever.py:22`           | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)`                                        |
| modelo      | `05-PreRetrieval/02-QueryTranslation/02-QueryDecomposition-2-MultiQueryRetriever.py:24`           | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")`                                                    |
| recuperação | `05-PreRetrieval/02-QueryTranslation/03-QueryClarification-BuildQueryClarificationTree.ipynb:213` | `"    pos = nx.spring_layout(G, k=2, iterations=50)\n",`                                                                 |
| modelo      | `05-PreRetrieval/02-QueryTranslation/04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py:6`  | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                |
| chunking    | `05-PreRetrieval/02-QueryTranslation/04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py:17` | `text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=0)`                                        |
| modelo      | `05-PreRetrieval/02-QueryTranslation/04-QueryExpansion-HyDE-HypotheticalDocumentGeneration.py:20` | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")`                                                    |

## 06-Indexing

**23 arquivos.** Por extensão: `.py` 16 · `.example` 5 · `.ipynb` 1 · `.txt` 1

**Subdiretórios:** `01-FromSmallChunksToLargeContext` · `02-BuildingHierarchicalIndex` · `03-BuildingMultiRepresentationIndex` · `99-OtherTests`

| Tema        | Citação                                                                                              | Conteúdo literal                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:21`     | `"from llama_index.embeddings.huggingface import HuggingFaceEmbedding\n",`                   |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:27`     | `"    window_size=3,\n",`                                                                    |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:36`     | `"embed_model = HuggingFaceEmbedding(\n",`                                                   |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:37`     | `"    model_name=\"sentence-transformers/all-mpnet-base-v2\", max_length=512\n",`            |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:121`    | `"    similarity_top_k=2,\n",`                                                               |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:275`    | `"query_engine = base_index.as_query_engine(similarity_top_k=2)\n",`                         |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:297`    | `"query_engine = base_index.as_query_engine(similarity_top_k=5)\n",`                         |
| avaliação   | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:563`    | `"    FaithfulnessEvaluator,\n",`                                                            |
| avaliação   | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:575`    | `"evaluator_f = FaithfulnessEvaluator(llm=OpenAI(model=\"gpt-4\"))\n",`                      |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:599`    | `"base_query_engine = base_index.as_query_engine(similarity_top_k=2)\n",`                    |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow-EvalVersion.ipynb:602`    | `"    similarity_top_k=2,\n",`                                                               |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow.py:6`                     | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding`                        |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow.py:14`                    | `Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-zh")`                |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow.py:15`                    | `Settings.text_splitter = SentenceSplitter(separator="\n",  chunk_size=50, chunk_overlap=0)` |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow.py:35`                    | `window_size=3,`                                                                             |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow.py:48`                    | `similarity_top_k=2,`                                                                        |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/01-NodeSentenceSlidingWindow.py:55`                    | `similarity_top_k=6`                                                                         |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py:4`                 | `from langchain_huggingface import HuggingFaceEmbeddings`                                    |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py:11`                | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")`                        |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py:23`                | `chunk_size=1000,`                                                                           |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py:24`                | `chunk_overlap=200,`                                                                         |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py:29`                | `chunk_size=200,`                                                                            |
| chunking    | `06-Indexing/01-FromSmallChunksToLargeContext/02-ParentChildTextChunkRetrieval.py:30`                | `chunk_overlap=50,`                                                                          |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/03-ForwardBackwardContextExpansion.py:6`               | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding`                        |
| modelo      | `06-Indexing/01-FromSmallChunksToLargeContext/03-ForwardBackwardContextExpansion.py:15`              | `Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-zh")`                |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/03-ForwardBackwardContextExpansion.py:33`              | `similarity_top_k=1,`                                                                        |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/03-ForwardBackwardContextExpansion.py:38`              | `similarity_top_k=1,`                                                                        |
| recuperação | `06-Indexing/01-FromSmallChunksToLargeContext/03-ForwardBackwardContextExpansion.py:46`              | `similarity_top_k=1,`                                                                        |
| recuperação | `06-Indexing/02-BuildingHierarchicalIndex/00-DirectlyLoadDocumentsIndexAndQA.py:34`                  | `similarity_top_k=3,`                                                                        |
| modelo      | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:17`    | `embedding_function = SentenceTransformer(`                                                  |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:141`   | `index_type="IVF_FLAT",  # Index type`                                                       |
| métrica     | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:142`   | `metric_type="COSINE",  # Use cosine similarity as the vector similarity metric`             |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:143`   | `params={"nlist": 1024}  # Index parameters`                                                 |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:159`   | `index_type="IVF_FLAT",  # Index type`                                                       |
| métrica     | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:160`   | `metric_type="COSINE",  # Use cosine similarity as the vector similarity metric`             |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:161`   | `params={"nlist": 1024}  # Index parameters`                                                 |
| métrica     | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:191`   | `"metric_type": "COSINE",`                                                                   |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:192`   | `"params": {"nprobe": 10}`                                                                   |
| métrica     | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:224`   | `"metric_type": "COSINE",`                                                                   |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py:225`   | `"params": {"nprobe": 10}`                                                                   |
| modelo      | `06-Indexing/02-BuildingHierarchicalIndex/02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py:17`  | `embedding_function = SentenceTransformer(`                                                  |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py:117` | `index_type="IVF_FLAT",  # Index type`                                                       |
| métrica     | `06-Indexing/02-BuildingHierarchicalIndex/02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py:118` | `metric_type="COSINE",  # Use cosine similarity as the vector similarity metric`             |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py:119` | `params={"nlist": 1024}  # Index parameters`                                                 |
| índice ANN  | `06-Indexing/02-BuildingHierarchicalIndex/02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py:135` | `index_type="IVF_FLAT",  # Index type`                                                       |

_35 ocorrências adicionais omitidas (limite 45 por módulo). Rode um grep -n direcionado para as demais._

## 07-PostRetrieval

**15 arquivos.** Por extensão: `.py` 10 · `.example` 4 · `.txt` 1

**Subdiretórios:** `01-Reranking` · `02-Compression` · `03-Correction`

| Tema        | Citação                                                                               | Conteúdo literal                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| modelo      | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:6`                                 | `from langchain_huggingface import HuggingFaceEmbeddings`                                                               |
| chunking    | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:82`                                | `chunk_size=300,      # Maximum number of characters per text chunk`                                                    |
| chunking    | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:83`                                | `chunk_overlap=50     # Overlapping characters between adjacent chunks, to keep context continuous`                     |
| modelo      | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:91`                                | `embed_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")`                                                    |
| recuperação | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:98`                                | `def reciprocal_rank_fusion(results: list[list], k=60):`                                                                |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:124`                               | `fused_scores = {}  # Stores the cumulative score for each document`                                                    |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:136`                               | `if doc_str not in fused_scores:`                                                                                       |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:137`                               | `fused_scores[doc_str] = 0`                                                                                             |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:140`                               | `rrf_score = 1 / (rank + k)`                                                                                            |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:141`                               | `fused_scores[doc_str] += rrf_score`                                                                                    |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:145`                               | `print(f"    Document {rank+1}: RRF score = 1/({rank}+{k}) = {rrf_score:.4f}")`                                         |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:150`                               | `for doc, score in sorted(fused_scores.items(), key=lambda x: x[1], reverse=True)`                                      |
| fusão       | `07-PostRetrieval/01-Reranking/01-RRF-Reranking.py:215`                               | `reranked_docs = reciprocal_rank_fusion(all_results)`                                                                   |
| modelo      | `07-PostRetrieval/01-Reranking/02-CrossEncoder-Reranking.py:33`                       | `model_name = "cross-encoder/ms-marco-MiniLM-L-12-v2"  # A small model trained on the MS MARCO dataset`                 |
| modelo      | `07-PostRetrieval/01-Reranking/03-CoBERT-Reranking.py:35`                             | `model_name = "bert-base-uncased"  # Base BERT model, can be replaced with a model fine-tuned specifically for ColBERT` |
| recuperação | `07-PostRetrieval/01-Reranking/04-Cohere-Reranking.py:82`                             | `retriever.k = 3  # Set to return the top 3 results`                                                                    |
| modelo      | `07-PostRetrieval/01-Reranking/05-RankLLM-Reranking.py:3`                             | `from langchain_huggingface import HuggingFaceEmbeddings`                                                               |
| chunking    | `07-PostRetrieval/01-Reranking/05-RankLLM-Reranking.py:56`                            | `chunk_size=500,       # 500 characters per document chunk`                                                             |
| chunking    | `07-PostRetrieval/01-Reranking/05-RankLLM-Reranking.py:57`                            | `chunk_overlap=100     # 100-character overlap between chunks to preserve context continuity`                           |
| modelo      | `07-PostRetrieval/01-Reranking/05-RankLLM-Reranking.py:72`                            | `embed_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-zh")  # Use an embedding model optimized for Chinese`   |
| recuperação | `07-PostRetrieval/01-Reranking/05-RankLLM-Reranking.py:75`                            | `search_kwargs={"k": 20}  # First stage retrieves the top 20 documents`                                                 |
| métrica     | `07-PostRetrieval/01-Reranking/06-RecencyWeightedReranking.py:57`                     | `index = faiss.IndexFlatL2(1536)  # OpenAI embeddings have a dimension of 1536`                                         |
| métrica     | `07-PostRetrieval/01-Reranking/06-RecencyWeightedReranking.py:58`                     | `print(f"    Index type: IndexFlatL2")`                                                                                 |
| recuperação | `07-PostRetrieval/02-Compression/01-ContextualCompressionRetriever-Compression.py:29` | `retriever.k = 3  # Return the top 3 results`                                                                           |
| modelo      | `07-PostRetrieval/02-Compression/02-LLMLingua-Compression.py:17`                      | `model_name="NousResearch/Llama-2-7b-hf",`                                                                              |
| chunking    | `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:49`                    | `# chunk_size=250: each document chunk has at most 250 tokens`                                                          |
| chunking    | `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:50`                    | `# chunk_overlap=0: no overlap between chunks, avoiding duplicated information`                                         |
| chunking    | `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:52`                    | `chunk_size=250, chunk_overlap=0`                                                                                       |
| modelo      | `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:132`                   | `llm = ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0)`                                                           |
| recuperação | `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:190`                   | `# k=3: return at most 3 search results`                                                                                |
| recuperação | `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:191`                   | `web_search_tool = TavilySearchResults(k=3)`                                                                            |

## 08-Generation

**24 arquivos.** Por extensão: `.py` 14 · `.example` 5 · `.pdf` 2 · `.png` 2 · `.txt` 1

**Subdiretórios:** `01-ModelSelectionAndInvocation` · `02-OptimizingResponseViaPrompts` · `03-ControllingFormatViaOutputParsing` · `04-DynamicGenerationOptimizationStrategies`

| Tema        | Citação                                                                                            | Conteúdo literal                                                            |
| ----------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| modelo      | `08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py:6`                                  | `model_name = "Qwen/Qwen3-0.6B"  # Small model version of Qwen3`            |
| modelo      | `08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:44`                            | `model_name = "Qwen/Qwen3-0.6B"`                                            |
| chunking    | `08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:14`  | `text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)` |
| recuperação | `08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:50`  | `docs = db.similarity_search(current_issue, k=1)`                           |
| recuperação | `08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:94` | `def get_similar_cases(scenario, query, k=2):`                              |
| chunking    | `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py:21`       | `chunk_size=250, chunk_overlap=0`                                           |
| modelo      | `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py:80`       | `llm = ChatOpenAI(model_name="gpt-4o", temperature=0)`                      |

## 09-Evaluation

**6 arquivos.** Por extensão: `.py` 4 · `.example` 1 · `.txt` 1

| Tema        | Citação                                        | Conteúdo literal                                                                                                             |
| ----------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| avaliação   | `09-Evaluation/01-RAGAS.py:6`                  | `from ragas.metrics import Faithfulness, AnswerRelevancy`                                                                    |
| avaliação   | `09-Evaluation/01-RAGAS.py:7`                  | `from ragas.llms import LangchainLLMWrapper`                                                                                 |
| avaliação   | `09-Evaluation/01-RAGAS.py:8`                  | `from ragas.embeddings import LangchainEmbeddingsWrapper`                                                                    |
| modelo      | `09-Evaluation/01-RAGAS.py:10`                 | `from langchain_huggingface import HuggingFaceEmbeddings`                                                                    |
| avaliação   | `09-Evaluation/01-RAGAS.py:11`                 | `from ragas import evaluate`                                                                                                 |
| modelo      | `09-Evaluation/01-RAGAS.py:15`                 | `llm = LangchainLLMWrapper(ChatOpenAI(model_name="gpt-3.5-turbo"))`                                                          |
| avaliação   | `09-Evaluation/01-RAGAS.py:50`                 | `print("\n1. Faithfulness")`                                                                                                 |
| avaliação   | `09-Evaluation/01-RAGAS.py:55`                 | `# Evaluate Faithfulness`                                                                                                    |
| avaliação   | `09-Evaluation/01-RAGAS.py:56`                 | `# Create Faithfulness evaluation metric, which only requires an LLM for evaluation`                                         |
| avaliação   | `09-Evaluation/01-RAGAS.py:57`                 | `faithfulness_metric = [Faithfulness(llm=llm)] # Only need to provide the generation model`                                  |
| avaliação   | `09-Evaluation/01-RAGAS.py:58`                 | `print("\nEvaluating Faithfulness...")`                                                                                      |
| avaliação   | `09-Evaluation/01-RAGAS.py:65`                 | `print(f"Faithfulness Score: {mean_score:.4f}")`                                                                             |
| avaliação   | `09-Evaluation/01-RAGAS.py:67`                 | `print("\n2. AnswerRelevancy")`                                                                                              |
| modelo      | `09-Evaluation/01-RAGAS.py:76`                 | `HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")`                                                 |
| avaliação   | `09-Evaluation/01-RAGAS.py:81`                 | `# Create AnswerRelevancy evaluation metric`                                                                                 |
| avaliação   | `09-Evaluation/01-RAGAS.py:82`                 | `# Create AnswerRelevancy evaluation metrics for both embedding models`                                                      |
| avaliação   | `09-Evaluation/01-RAGAS.py:83`                 | `opensource_relevancy = [AnswerRelevancy(llm=llm, embeddings=opensource_embedding)]`                                         |
| avaliação   | `09-Evaluation/01-RAGAS.py:84`                 | `openai_relevancy = [AnswerRelevancy(llm=llm, embeddings=openai_embedding)]`                                                 |
| avaliação   | `09-Evaluation/01-RAGAS.py:111`                | `Removed HuggingfaceEmbeddings import from ragas.embeddings.base`                                                            |
| modelo      | `09-Evaluation/01-RAGAS.py:112`                | `Changed to import LangChain's HuggingFaceEmbeddings`                                                                        |
| modelo      | `09-Evaluation/01-RAGAS.py:113`                | `Used LangchainEmbeddingsWrapper to wrap LangChain's HuggingFaceEmbeddings`                                                  |
| modelo      | `09-Evaluation/01-RAGAS.py:115`                | `LangChain's HuggingFaceEmbeddings is a complete implementation that includes all necessary methods`                         |
| avaliação   | `09-Evaluation/01-RAGAS.py:118`                | `1. Faithfulness`                                                                                                            |
| avaliação   | `09-Evaluation/01-RAGAS.py:123`                | `Evaluating Faithfulness...`                                                                                                 |
| avaliação   | `09-Evaluation/01-RAGAS.py:125`                | `Faithfulness Score: 0.6071`                                                                                                 |
| modelo      | `09-Evaluation/02-Trulens.py:22`               | `model_name="text-embedding-ada-002")`                                                                                       |
| avaliação   | `09-Evaluation/03-DeepEval.py:1`               | `from deepeval.metrics import ContextualPrecisionMetric, AnswerRelevancyMetric`                                              |
| avaliação   | `09-Evaluation/03-DeepEval.py:14`              | `answer_relevancy = AnswerRelevancyMetric()`                                                                                 |
| modelo      | `09-Evaluation/04-LlamaIndexEvaluation.py:13`  | `from llama_index.embeddings.huggingface import HuggingFaceEmbedding`                                                        |
| avaliação   | `09-Evaluation/04-LlamaIndexEvaluation.py:19`  | `CorrectnessEvaluator, SemanticSimilarityEvaluator, RelevancyEvaluator, FaithfulnessEvaluator, PairwiseComparisonEvaluator,` |
| modelo      | `09-Evaluation/04-LlamaIndexEvaluation.py:31`  | `embed_model = HuggingFaceEmbedding(`                                                                                        |
| modelo      | `09-Evaluation/04-LlamaIndexEvaluation.py:32`  | `model_name="sentence-transformers/all-mpnet-base-v2", max_length=512`                                                       |
| chunking    | `09-Evaluation/04-LlamaIndexEvaluation.py:36`  | `window_size=3,`                                                                                                             |
| recuperação | `09-Evaluation/04-LlamaIndexEvaluation.py:67`  | `similarity_top_k=2,`                                                                                                        |
| recuperação | `09-Evaluation/04-LlamaIndexEvaluation.py:82`  | `base_query_engine = base_index.as_query_engine(similarity_top_k=2)`                                                         |
| avaliação   | `09-Evaluation/04-LlamaIndexEvaluation.py:128` | `evaluator_f = FaithfulnessEvaluator(llm=OpenAI(model="gpt-4", api_key=os.getenv("OPENAI_API_KEY")))`                        |
| recuperação | `09-Evaluation/04-LlamaIndexEvaluation.py:147` | `base_query_engine = base_index.as_query_engine(similarity_top_k=2)`                                                         |
| recuperação | `09-Evaluation/04-LlamaIndexEvaluation.py:149` | `similarity_top_k=2,`                                                                                                        |

## 10-AdvanceRAG

**19 arquivos.** Por extensão: `.example` 6 · `.py` 6 · `.png` 3 · `.pdf` 2 · `.yml` 1 · `.txt` 1

**Subdiretórios:** `01-GraphRAG` · `02-ContextRetrieval` · `03-ModularRAG` · `04-AgenticRAG` · `05-MultiModalRAG`

| Tema        | Citação                                                              | Conteúdo literal                                                                                                     |
| ----------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:56`  | `def create_embedding_retriever(nodes, similarity_top_k=3):`                                                         |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:58`  | `# Ensure similarity_top_k does not exceed the number of nodes`                                                      |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:59`  | `adjusted_top_k = min(similarity_top_k, len(nodes))`                                                                 |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:60`  | `if adjusted_top_k < similarity_top_k:`                                                                              |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:61`  | `print(f"Warning: similarity_top_k adjusted from {similarity_top_k} to {adjusted_top_k} due to node count limit")`   |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:64`  | `adjusted_top_k = max(1, adjusted_top_k)`                                                                            |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:67`  | `return index.as_retriever(similarity_top_k=adjusted_top_k)`                                                         |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:70`  | `def create_bm25_retriever(nodes, similarity_top_k=3):`                                                              |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:81`  | `adjusted_top_k = min(similarity_top_k, len(text_nodes))`                                                            |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:82`  | `if adjusted_top_k < similarity_top_k:`                                                                              |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:83`  | `print(f"Warning: similarity_top_k adjusted from {similarity_top_k} to {adjusted_top_k} due to corpus size limit")`  |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:86`  | `adjusted_top_k = max(1, adjusted_top_k)`                                                                            |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:88`  | `return BM25Retriever.from_defaults(nodes=text_nodes, similarity_top_k=adjusted_top_k)`                              |
| chunking    | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:183` | `splitter = SentenceSplitter(chunk_size=256, chunk_overlap=50)`                                                      |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:214` | `similarity_top_k = min(3, len(nodes))`                                                                              |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:215` | `print(f"Retrieval parameter similarity_top_k set to {similarity_top_k}")`                                           |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:222` | `top_n=similarity_top_k`                                                                                             |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:232` | `nodes, similarity_top_k=similarity_top_k`                                                                           |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:235` | `nodes, similarity_top_k=similarity_top_k`                                                                           |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:243` | `nodes_contextual, similarity_top_k=similarity_top_k`                                                                |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:246` | `nodes_contextual, similarity_top_k=similarity_top_k`                                                                |
| métrica     | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:323`     | `field_name="dense_vector", index_type="FLAT", metric_type="IP"`                                                     |
| índice ANN  | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:330`     | `index_type="SPARSE_INVERTED_INDEX",  # Inverted index specifically for sparse vectors`                              |
| métrica     | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:331`     | `metric_type="IP",`                                                                                                  |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:493`     | `def search(self, query, k=5):`                                                                                      |
| métrica     | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:529`     | `search_params = {"metric_type": "IP", "params": {"nprobe": 10}}`                                                    |
| recuperação | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:568`     | `def evaluate_retrieval(eval_data, retrieval_function, db, k=5):`                                                    |
| modelo      | `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:854`     | `dense_ef = SentenceTransformerEmbeddingFunction(model_name='BAAI/bge-large-zh')  # Use Chinese-optimized BGE model` |
| chunking    | `10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:36`          | `splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=100, chunk_overlap=50)`                  |
| modelo      | `10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:151`         | `llm = ChatOpenAI(model_name="gpt-4o", temperature=0, streaming=True)`                                               |
| chunking    | `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py:43`         | `splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(chunk_size=500, chunk_overlap=0)`                   |
| recuperação | `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py:118`        | `web_search_tool = TavilySearchResults(k=3)`                                                                         |
| modelo      | `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py:159`        | `rag_chain = prompt \| ChatOpenAI(model_name="gpt-3.5-turbo", temperature=0) \| StrOutputParser()`                   |

## 91-Environment

**12 arquivos.** Por extensão: `.txt` 12

**Subdiretórios:** `archive`
