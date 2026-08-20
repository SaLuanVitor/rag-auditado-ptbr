# AULA 24 — Contextual Retrieval

**Fase 9 — Avançado** · Módulo do repo: `10-AdvanceRAG/02-ContextRetrieval/` — 2 scripts e um `.env.example`; 1.325 linhas de código, das quais 980 num único arquivo

---

## Pergunta motivadora

Um chunk diz: _"O prazo é de 30 dias, contados da notificação."_

Prazo de quê? Notificação de quem? A frase está completa **no documento** e incompleta **no chunk** — e o índice guarda o chunk. Quando alguém pergunta "qual o prazo para contestar a multa?", esse trecho pode não ser recuperado, porque nada nele diz "multa" ou "contestação".

Este é o problema do isolamento semântico, e a Aula 07 já o encontrou: o chunking corta o vínculo com o entorno. A Aula 15 respondeu com small-to-big — indexar pequeno, entregar grande. A Aula 16 respondeu com multi-representação — indexar um resumo ao lado do texto.

A resposta desta aula é outra: **reescrever o chunk, antes de indexar, para que ele carregue o próprio contexto.** O LLM lê o documento inteiro e o chunk, e produz uma versão do chunk que se explica sozinha.

E aqui há uma segunda pergunta, que a Aula 22 nos deu o direito de fazer: **como esses dois arquivos sabem que a técnica funcionou?** A resposta, nos dois, é o assunto que considero mais instrutivo da aula.

---

## Modelo mental

### Onde o contexto entra

Quatro respostas para o mesmo problema, três já vistas:

| Técnica                       | Onde age    | O que é indexado                              |
| ----------------------------- | ----------- | --------------------------------------------- |
| `chunk_overlap` (Aula 07)     | chunking    | trecho com as bordas repetidas                |
| Small-to-big (Aula 15)        | recuperação | a sentença; entrega-se a janela               |
| Multi-representação (Aula 16) | indexação   | um resumo **ao lado** do texto                |
| **Contextual Retrieval**      | indexação   | o chunk **reescrito** com o contexto embutido |

A diferença entre as duas últimas é sutil e decide o comportamento: na multi-representação o texto original permanece intacto e ganha um vizinho; aqui o texto que vai para o índice **passou por um LLM**.

### O custo que essa escolha traz

Nomeando o que se paga, porque é o que decide a adoção:

1. **Uma chamada de LLM por chunk, na indexação.** Não por consulta — o que é a boa notícia. Mas por chunk, e um corpus tem muitos.
2. **O documento inteiro entra no prompt, a cada chunk.** Um documento de 50 chunks manda o documento 50 vezes. É onde o cache de prompt do provedor deixa de ser otimização e passa a ser requisito de viabilidade.
3. **O texto indexado deixa de ser o texto.** Se o modelo alterar um número, omitir uma exceção ou "melhorar" a redação, o índice guarda a alteração. E, mais adiante nesta aula, veremos que isso tem consequência direta em **como avaliar**.

### Duas variantes que o repositório não distingue

Há uma diferença material entre:

- **Prefixar** — gerar uma ou duas frases de contexto e colar antes do chunk, preservando o original íntegro;
- **Reescrever** — pedir ao LLM o chunk enriquecido, integrado.

A primeira mantém o texto original recuperável e auditável. A segunda produz texto mais fluido e perde o original, a menos que você guarde os dois. O arquivo grande deste módulo escolhe reescrever — e, como veremos, guarda os dois campos, o que é a decisão certa.

---

## Parte 1 — O par, e o que o `diff` revelou

Os dois arquivos têm o mesmo assunto e **nada em comum**: `diff -u` entre eles não encontra uma única linha compartilhada no início, e os tamanhos já contam a história — `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py` tem 345 linhas; `10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py` tem **980**, e é o único dos dois com shebang (`#!/usr/bin/env python` na linha 1) — o que **não**
quer dizer que seja executável: `git ls-tree HEAD` devolve modo `100644` para os dois, e o
repositório inteiro não tem um único arquivo `100755`. O `ls -l` do Git Bash mostra `-rwxr-xr-x`
aqui, mas isso é o MSYS inferindo o bit `x` da presença do shebang, não um bit versionado. (Os dois arquivos terminam sem newline final, então `wc -l` devolve 344 e 979 — um a menos em cada. A contagem certa é `awk 'END{print NR}'`, e a versão anterior desta aula trazia o 979 de `wc -l` ao lado do 345 de `awk`, misturando os dois métodos na mesma frase.)

Não são duas versões da mesma coisa. São dois trabalhos diferentes:

|                                | LlamaIndex                                                | Milvus                                                            |
| ------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------- |
| Origem declarada               | cookbook do LlamaIndex (`LlamaIndex-Implementation.py:3`) | método da Anthropic (`Milvus-Implementation.py:6`)                |
| Chama LLM para contextualizar? | **não**                                                   | **sim** (`Milvus-Implementation.py:447`)                          |
| Retrievers comparados          | 6 (denso, BM25, híbrido+rerank — com e sem contexto)      | 3 experimentos (padrão, contextual, contextual+rerank)            |
| Métricas                       | `mrr`, `hit_rate` (`LlamaIndex-Implementation.py:126`)    | `pass_at_n`, `average_score` (`Milvus-Implementation.py:691-695`) |
| Gabarito                       | 3 perguntas fixas, mapeamento **posicional**              | conjunto da Anthropic — **sobrescrito** por um fabricado          |

Anotação de nome, do gênero que este curso vem catalogando: a primeira linha do arquivo LlamaIndex declara
`LlamaIndex-Implementation.py:1`:

```python
# Filename: contextual_retrieval.py
```

O nome interno não é o nome do arquivo. Detalhe inofensivo, e vale como aviso de que o cabeçalho veio de outro lugar — o que a linha 3 confirma, creditando o cookbook oficial. Crédito dado é uma virtude; este curso registra as duas coisas.

Detalhe honesto a favor do módulo: aqui o `10-AdvanceRAG/02-ContextRetrieval/.env.example:2`
finalmente **está correto**. Os dois scripts chamam `load_dotenv()` — `LlamaIndex-Implementation.py:20-21` e `Milvus-Implementation.py:161-162`. Depois de cinco módulos, a frase é verdadeira.

---

## Parte 2 — O arquivo LlamaIndex: a estrutura certa em volta de um miolo simulado

Comece pelo que este arquivo faz bem, porque é bastante.

**Ele monta seis retrievers e compara.** Denso, BM25 e híbrido-com-rerank, cada um em duas versões — com e sem contexto (`LlamaIndex-Implementation.py:231-252`). É o desenho experimental que a Aula 22 pediu: uma variável muda, o resto fica igual.

**O híbrido é implementado à mão, e vale ler.** A classe `EmbeddingBM25RerankerRetriever` (`LlamaIndex-Implementation.py:91`) funde os dois conjuntos de resultados deduplicando por id (`:105-108`) e passa o conjunto ao reranker (`:114-119`). É a Aula 11 (busca híbrida) com a Aula 17 (reranking) em vinte linhas legíveis — e sem RRF: a fusão aqui é união simples, e a ordenação final é inteiramente do reranker.

**As métricas são de recuperação.** `RetrieverEvaluator.from_metric_names(["mrr", "hit_rate"], ...)` (`LlamaIndex-Implementation.py:125-127`). Depois da Aula 22, onde o RAGAS do repositório não media recuperação, isso é exatamente o instrumento que faltava.

### E agora o miolo

O passo que dá nome à técnica está nas linhas `LlamaIndex-Implementation.py:200-203`:

```python
        # Simulate LLM generated context
        simulated_context = f"This section discusses: {node.get_content()[:50]}..."
        new_metadata = node.metadata.copy() if hasattr(node, 'metadata') else {}
        new_metadata["generated_context"] = simulated_context
```

Leia com cuidado o que isso faz: pega os **primeiros 50 caracteres do próprio chunk**, cola um prefixo fixo, e chama isso de contexto gerado. Não há documento. Não há LLM. O comentário do autor é honesto — diz `Simulate` —, e o efeito é que **o "Contextual Retrieval" deste arquivo não contextualiza nada**.

Três confirmações por `grep`, porque asserção sobre comportamento exige verificar:

- `CONTEXT_PROMPT_TEMPLATE` é definido em `LlamaIndex-Implementation.py:45` e a busca pelo nome no arquivo devolve **só essa linha**. O prompt de contextualização existe e nunca é usado.
- `llm = OpenAI(model="gpt-3.5-turbo")` está em `LlamaIndex-Implementation.py:32`, e `llm` também aparece **só ali**. O modelo é instanciado e nunca chamado.
- `generate_question_context_pairs` é importado em `LlamaIndex-Implementation.py:12` e nunca usado — a geração de dataset sintético do LlamaIndex, que a Aula 22 viu em ação, está importada e substituída por três perguntas escritas à mão.

Julgamento: como esqueleto de experimento, o arquivo é útil e eu o recomendaria como ponto de partida. Como demonstração de que Contextual Retrieval melhora a recuperação, ele não pode demonstrar nada — o tratamento e o controle diferem por um prefixo de 50 caracteres.

### E o contexto vai para o metadado

`LlamaIndex-Implementation.py:206-210` cria o nó novo assim:

```python
        contextual_node = TextNode(
            text=node.get_content(),
            metadata=new_metadata,
            id_=node.node_id
        )
```

O campo `text` é **idêntico** ao do nó original; o contexto vive em `metadata`. Se esse metadado entra ou não no texto que é embutido e no que o BM25 indexa depende do `metadata_mode` que a biblioteca aplica em cada caminho — `llama_index` **não está instalado neste ambiente** e eu não executei nada, então não afirmo o resultado. O que é verificável na leitura: o texto passado ao BM25 é `node.get_content()` (`LlamaIndex-Implementation.py:73`), e o construtor do nó contextual não declara nenhuma chave de exclusão de metadado.

### O gabarito é posicional

Este é o defeito que invalida os números, e é independente do anterior. O dataset de avaliação tem três perguntas fixas (`LlamaIndex-Implementation.py:258-262`) e o mapeamento de relevância é montado assim (`LlamaIndex-Implementation.py:266-269`):

```python
    if nodes:
        for i, query_id in enumerate(fixed_queries.keys()):
            node_index = min(i, len(nodes)-1)  # Ensure index is within bounds
            relevant_docs_mapping[query_id] = [nodes[node_index].node_id]
```

A pergunta 1 é declarada relevante ao nó 1, a 2 ao nó 2, a 3 ao nó 3 — **por posição**. Nada verifica que o nó `i` responde à pergunta `i`. Se o `SentenceSplitter` produzir os chunks em outra ordem, ou se o texto mudar, o gabarito continua "válido" e passa a apontar para outro lugar.

E `hit_rate` e `mrr` medem exatamente concordância com esse gabarito. Um retriever que traga o chunk **certo** para a pergunta 1 é penalizado se o chunk certo não for o primeiro da lista. A Aula 22 tinha um nome para isso: gabarito ruim reprova sistema bom, e é a falha mais cara de uma avaliação.

### Três fabricações de dado, no mesmo arquivo

Elas merecem uma lista, porque o padrão é o mesmo — evitar que o script quebre inserindo dado falso:

1. **Nós de teste.** Se houver menos de 3 nós, o script cria nós com o texto `"Sample text N: This is an additional text node for testing."` (`LlamaIndex-Implementation.py:191-194`). O corpus de avaliação passa a conter frases que não são do documento.
2. **Nó de amostra no BM25.** Se não houver `TextNode` válido, cria um com o texto `"Sample Text"` (`LlamaIndex-Implementation.py:78`).
3. **Zero como resultado.** Se a avaliação falhar, `display_results` devolve uma linha com `hit_rate` e `mrr` iguais a `0.0` e uma nota `"Evaluation Failed"` (`LlamaIndex-Implementation.py:140-145`). O erro entra na tabela final como **desempenho ruim**.

O terceiro é, **julgamento**, o mais perigoso dos três em produção: uma falha de API vira um número na comparação, e quem lê a tabela conclui que o retriever é pior.

Há ainda um caminho silencioso no reranker: `CohereRerank` é criado com `api_key=os.environ.get("COHERE_API_KEY", "your-api-key")` (`LlamaIndex-Implementation.py:220`), dentro de um `try` cujo `except` faz `cohere_rerank = None` (`:225-227`). Sem a chave, o pipeline segue **sem reranking** — e o nome do retriever na tabela continua sendo `"Embedding + BM25 + Reranker Retriever"`.

---

## Parte 3 — O arquivo Milvus: a contextualização de verdade

Aqui a técnica é a técnica. O método é atribuído explicitamente (`Milvus-Implementation.py:6`):

```python
Based on the method proposed by Anthropic, addressing semantic isolation in traditional RAG
```

E o prompt recebe **as duas coisas** (`Milvus-Implementation.py:428-437`):

```python
        prompt = f"""
        <document>
        {doc_content}
        </document>
        <chunk>
        {chunk_content}
        </chunk>

        I need you to enrich the above <chunk> using the content from <document> to provide background and contextual information.
        Your answer should include the complete content of the <chunk> and ensure semantic coherence. Only return the enriched text content, do not add any explanations or interpretations.
```

Documento inteiro em `<document>`, chunk em `<chunk>`, e a instrução de enriquecer um usando o outro. A assinatura do método deixa claro que é assim que o dado chega (`Milvus-Implementation.py:390`):

```python
    def insert_contextualized_data(self, doc_content, chunk_content, metadata):
```

A chamada usa `gpt-3.5-turbo` com `temperature=0` e `max_tokens=1000` (`Milvus-Implementation.py:447-455`), e o resultado é o texto que vai ser embutido (`:458`).

**Uma diferença em relação ao método original, que vale conhecer:** o prompt pede que a resposta **contenha o chunk completo** enriquecido — ou seja, uma reescrita. A formulação original da Anthropic gera um contexto curto para ser **prefixado** ao chunk, preservando o original. Conhecimento de domínio, não leitura deste arquivo: reescrever é mais fluido e mais arriscado, porque o texto indexado passa a ser produção do modelo. A boa decisão que este arquivo toma é guardar **os dois** campos, `content` e `contextualized_content` (`Milvus-Implementation.py:540`), o que mantém o original recuperável.

**A troca de provedor está documentada e reversível.** O cabeçalho avisa (`Milvus-Implementation.py:19-22`) que a versão original usava Claude e que o código do Claude foi comentado — e ele está lá, em `Milvus-Implementation.py:462-468`, com `claude-3-haiku-20240307`. Julgamento: manter a alternativa comentada ao lado, com a razão declarada, é melhor que apagá-la.

**O reranking é aplicado ao contextualizado, e a busca sabe disso** (`Milvus-Implementation.py:551`):

```python
                content = hit["entity"].get("contextualized_content", hit["entity"].get("content", ""))
```

Prioriza o texto enriquecido para reordenar, com o original como reserva. Coerente: se o índice foi construído sobre o enriquecido, o reranker deve ver o enriquecido.

**Os três experimentos isolam a variável certa.** Padrão (`Milvus-Implementation.py:869-888`), contextual (`:917-942`) e contextual+rerank — e o terceiro **reusa o mesmo retriever** apenas ligando a chave (`Milvus-Implementation.py:954-955`):

```python
    contextual_retriever.use_reranker = True
    contextual_retriever.rerank_function = cohere_rf
```

Nada mais muda entre o experimento 2 e o 3. É exatamente o cuidado que o `similarity_top_k=2` nos dois motores da Aula 22 representava.

### O embedding é chinês, o corpus é código em inglês

`Milvus-Implementation.py:854`:

```python
    dense_ef = SentenceTransformerEmbeddingFunction(model_name='BAAI/bge-large-zh')  # Use Chinese-optimized BGE model
```

O comentário assume o que o nome do modelo diz: `-zh` é chinês. E o corpus são os chunks de código do cookbook da Anthropic, baixados em tempo de execução
(`10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py:763`) — código e prosa técnica em inglês. É o mesmo resíduo de origem que o curso já registrou em `00-SimpleRAG`, aqui na versão grande do modelo. Efeito esperado (domínio): representações piores para o corpus, portanto recuperação pior — em **todos** os três experimentos igualmente, o que ao menos preserva a comparação relativa.

---

## Parte 4 — A avaliação que se sabota, em três atos

Esta é a parte que a Aula 22 preparou. O arquivo Milvus tem uma estrutura de avaliação séria — `evaluate_retrieval` (`Milvus-Implementation.py:568`), `evaluate_db` (`:718`), casamento contra gabarito, `tqdm`, relatório comparativo no fim. E ela mede muito pouco, por três razões independentes.

### Ato 1 — O gabarito oficial é baixado e sobrescrito

`download_data()` busca dois arquivos do cookbook da Anthropic: os chunks e o **conjunto de avaliação** (`Milvus-Implementation.py:767-772`):

```python
    if not os.path.exists("evaluation_set.jsonl"):
        print("Downloading evaluation_set.jsonl...")
        urllib.request.urlretrieve(
            "https://raw.githubusercontent.com/anthropics/anthropic-cookbook/refs/heads/main/skills/contextual-embeddings/data/evaluation_set.jsonl",
            "evaluation_set.jsonl"
        )
```

E o `main`, mais adiante, escreve **no mesmo nome de arquivo** (`Milvus-Implementation.py:904-906`):

```python
    with open("evaluation_set.jsonl", "w") as f:
        for item in eval_data:
            f.write(json.dumps(item, ensure_ascii=False) + "\n")
```

Note a consequência de segunda ordem, que é pior que a primeira: o download é condicionado a `not os.path.exists`. Na primeira execução, o conjunto oficial é baixado e imediatamente substituído. Da segunda em diante, o arquivo existe — o fabricado —, então o oficial **nunca mais é baixado**. Recuperá-lo exige apagar o arquivo à mão, e nada no script avisa isso.

### Ato 2 — A pergunta é um pedaço da resposta

O conjunto que substitui o oficial é montado assim (`Milvus-Implementation.py:892-901`):

```python
    eval_data = []
    for doc in dataset[:2]:  # Use only the first 2 documents for evaluation
        for chunk in doc["chunks"][:2]:  # Take only the first 2 chunks from each document
            eval_data.append({
                "query": chunk["content"][:50],  # Use the first 50 characters of chunk content as query
                "references": [{
                    "doc_uuid": doc["original_uuid"],
                    "chunk_index": chunk["original_index"]
                }]
            })
```

A **query são os primeiros 50 caracteres do próprio chunk que é a resposta**. Quatro perguntas, portanto (2 documentos × 2 chunks) — supondo que os dois primeiros documentos
tenham ao menos dois chunks cada, o que não confirmei, porque o `codebase_chunks.json` é baixado em
tempo de execução e não está em disco aqui. Cada uma é um prefixo literal do seu alvo.

Julgamento, e é o ponto central desta aula: nenhuma técnica de recuperação pode se distinguir de outra nesse teste. Buscar um texto usando a sua própria primeira metade é o caso mais fácil que existe — denso acha, esparso acha, e a contextualização não tem como ajudar porque não havia dificuldade a resolver. Os três experimentos vão reportar valores próximos, e a "melhoria" impressa no fim
(`Milvus-Implementation.py:970-976`) será ruído.

Repare também que o comentário da linha 891 admite o problema: _"In actual applications, a specially designed evaluation dataset should be used"_. O autor sabe. O que o arquivo não diz é que o conjunto especialmente desenhado **já estava em disco**, baixado seis linhas antes.

### Ato 3 — O denominador conta o que foi descartado

Na função de avaliação, o contador incrementa antes de qualquer verificação (`Milvus-Implementation.py:622-623`):

```python
    for item in tqdm(eval_data, desc="Evaluating retrieval"):
        total_queries += 1
```

E, mais abaixo, uma query cujo documento-ouro não foi encontrado é abandonada (`Milvus-Implementation.py:660-662`):

```python
        if not golden_contents:
            print(f"Warning: Golden content not found for query: {query}")
            continue
```

O `continue` pula sem somar nada a `total_score`, mas `total_queries` **já foi incrementado**. A média final (`Milvus-Implementation.py:688`) divide por um denominador que inclui as queries puladas — cada uma entra valendo zero.

Isso importa porque o dataset é truncado: `dataset = dataset[:5]` (`Milvus-Implementation.py:851`). Se o conjunto de avaliação apontasse para documentos fora desses cinco — que é exatamente o que aconteceria com o gabarito oficial da Anthropic —, a maioria das queries seria pulada e contada como zero. O sistema apareceria péssimo por um motivo que não tem nada a ver com recuperação.

### Duas métricas que são a mesma

O docstring descreve `Pass@K` e `Average Score` como coisas diferentes (`Milvus-Implementation.py:592-597`): a primeira, proporção de queries com resposta correta no top-K; a segunda, fração dos chunks corretos recuperados. O código faz (`Milvus-Implementation.py:688-689`):

```python
    average_score = total_score / total_queries
    pass_at_n = average_score * 100  # Convert to percentage
```

São o mesmo número em escalas diferentes. E `recall`, que o docstring lista como métrica (`Milvus-Implementation.py:598-599`), não aparece no dicionário de retorno (`:691-695`).

### Um rótulo errado no relatório

O fim do `main` calcula (`Milvus-Implementation.py:970-971`):

```python
    context_improvement = contextual_results['pass_at_n'] - standard_results['pass_at_n']
    rerank_improvement = reranker_results['pass_at_n'] - standard_results['pass_at_n']
```

E imprime `rerank_improvement` como _"Reranking further improved by"_ (`Milvus-Implementation.py:975`). "Further" sugere ganho **sobre o contextual**, mas a conta é contra o **padrão** — é o ganho acumulado, não o incremental. A linha seguinte (`:976`) imprime o mesmo valor como _"Overall improvement"_. O incremento real do reranking seria `reranker - contextual`, e ele não é calculado em lugar nenhum.

### Um detalhe de acoplamento

`evaluate_retrieval` recebe `eval_data`, `retrieval_function`, `db` e `k` — e usa `dataset` (`Milvus-Implementation.py:636`), que é uma **global** declarada dentro de `main` (`:846`). A função só funciona depois de `main` ter rodado. Não é bug no fluxo atual; é o motivo pelo qual essa função não pode ser reaproveitada em outro script sem levar a global consigo.

---

## Parte 5 — O que aproveitar de cada um

Julgamento de engenharia, explícito porque é recomendação:

**Do arquivo LlamaIndex, aproveite a estrutura.** Seis retrievers, duas condições, `mrr` e `hit_rate`, tabela final. Troque três coisas: o contexto simulado por uma chamada de LLM usando o `CONTEXT_PROMPT_TEMPLATE` que já está escrito (e que precisa passar a receber o documento, não só o chunk); o gabarito posicional por perguntas com relevância anotada à mão; e o `0.0` em caso de falha por uma exceção que interrompe.

**Do arquivo Milvus, aproveite o miolo.** O prompt `<document>`/`<chunk>`, a persistência dos dois campos, o reranking sobre o texto enriquecido e o isolamento de variável entre os experimentos 2 e 3. Troque uma coisa: **não sobrescreva o `evaluation_set.jsonl`**. Ele já está em disco, é o gabarito real da Anthropic, e usá-lo exige apenas inserir o dataset completo em vez de `[:5]` — ou filtrar o conjunto de avaliação para os documentos inseridos, **corrigindo o denominador** para não contar os descartados.

Juntando os dois, sai o experimento que nenhum dos dois faz: contextualização real medida contra gabarito real. É o exercício 5 da próxima seção.

---

## Mão na massa

Os dois scripts precisam de `OPENAI_API_KEY` e `COHERE_API_KEY` (`10-AdvanceRAG/02-ContextRetrieval/.env.example:4-9`). O arquivo Milvus também baixa dados da internet na primeira execução.

**1. Confirme o miolo simulado.** Em `LlamaIndex-Implementation.py`, imprima `simulated_context` para cada nó, na linha 201. Compare com o texto do nó. Depois procure onde `CONTEXT_PROMPT_TEMPLATE` é usado — e não encontre.

**2. Faça a contextualização acontecer.** Ainda no arquivo LlamaIndex: use o `llm` da linha 32 e o `CONTEXT_PROMPT_TEMPLATE` da linha 45 para gerar o contexto de verdade. Note que o template só tem `{context_str}` — para contextualizar como manda a técnica, ele precisa receber também o documento. Rode a comparação antes e depois dessa mudança.

**3. Conserte o gabarito.** Leia os três chunks que o `SentenceSplitter` produz e mapeie cada uma das três perguntas ao chunk que **de fato** a responde, à mão, em vez do mapeamento posicional das linhas 266-269. Rode. Compare os `hit_rate` do gabarito posicional com os do gabarito correto — a diferença é o tamanho do erro que a Aula 22 chamou de mais caro.

**4. Veja o gabarito oficial que o script joga fora.** Antes de rodar o Milvus, execute apenas o `download_data()` e abra o `evaluation_set.jsonl` baixado. Leia três queries. Compare com as quatro que o `main` fabrica na linha 896. Guarde o arquivo com outro nome antes de rodar o script inteiro.

**5. O experimento que falta.** Rode o Milvus com o `evaluation_set.jsonl` **oficial**: comente as linhas 892-906, insira o dataset completo (ou filtre o conjunto de avaliação para os documentos que você inseriu) e conserte o denominador movendo o `total_queries += 1` para depois da verificação da linha 660. Agora os três experimentos medem algo. Registre os três `Pass@5`.

**6. Meça o custo real.** Instrumente `insert_contextualized_data` para contar chamadas e tokens de entrada. Multiplique pelo tamanho do seu corpus. Compare com o custo de indexação do GraphRAG que a Aula 23 registrou — as duas técnicas pagam na indexação, e é útil ter as duas contas na mesma unidade.

**7. Compare com o degrau mais barato.** Use a multi-representação da Aula 16 — resumo indexado ao lado do texto, sem reescrever nada — e meça com o mesmo gabarito do exercício 5. Se o resultado empatar, você economizou uma reescrita por chunk.

---

## Quebre de propósito

**1. Tire o documento do prompt.** No arquivo Milvus, troque `{doc_content}` por `{chunk_content}` na linha 430. Agora o LLM contextualiza o chunk com o próprio chunk — que é, conceitualmente, o que o arquivo LlamaIndex faz. Rode a avaliação do exercício 5 e veja quanto do ganho desaparece. Isso mede o valor do documento no prompt.

**2. Avalie contra o texto reescrito.** Em `evaluate_retrieval`, troque o campo de comparação para `contextualized_content` (as linhas 672-676 explicitamente escolhem `content` "to ensure fairness"). O casamento exato passa a nunca acontecer, e o `Pass@K` vai a zero com o sistema intacto. É a demonstração de por que aquela linha existe.

**3. Deixe o modelo alterar o conteúdo.** Ainda no prompt de `Milvus-Implementation.py`, remova a instrução _"Keep the core information of the original chunk unchanged"_ (linha 440) e peça explicitamente para resumir. Compare `content` e `contextualized_content` de alguns chunks e procure números ou exceções que mudaram. É o risco do "reescrever em vez de prefixar", visível.

**4. Rode sem a chave do Cohere.** No arquivo LlamaIndex, desligue `COHERE_API_KEY` e rode. O `except` da linha 225 deixa `cohere_rerank = None`, o pipeline segue, e a tabela final continua rotulando aquela linha como `"+ Reranker"`. Um experimento sem a variável que ele diz estar testando.

**5. Force a fabricação de nós.** Reduza o texto do ensaio na linha 36 até produzir menos de 3 chunks. Os nós `"Sample text N"` entram no corpus (linhas 191-194) e passam a ser candidatos de recuperação. Veja um deles aparecer num resultado.

**6. Aponte o gabarito para fora do dataset.** No Milvus, mantenha `dataset[:5]` e escreva um `evaluation_set.jsonl` cujas referências apontem para o sexto documento. Todas as queries serão puladas — e o `Pass@5` sairá **0,00%**, não "sem dados". Erro de configuração vestido de resultado.

---

## Armadilhas de produção

**Contextualizar sem o documento não é contextualizar.** É o defeito do primeiro arquivo, e é fácil de reproduzir sem perceber: se o prompt recebe apenas o chunk, o LLM produz um resumo do chunk. O ganho da técnica vem do que está **fora** do chunk.

**O texto indexado deixa de ser o texto.** Guarde os dois campos, como o arquivo Milvus faz. Sem o original, você perde a auditoria — e a comparação com gabarito passa a ser impossível.

**Documento inteiro por chunk é o custo dominante.** Um documento de N chunks manda o documento N vezes ao modelo. Cache de prompt do provedor é o que torna isso viável em escala; sem ele, calcule antes.

**Reindexação é reescrita.** Mudar de modelo de contextualização significa regerar todos os chunks. Como no GraphRAG da Aula 23, corpus que muda com frequência inverte a conta.

**Gabarito fabricado a partir do alvo mede zero.** Query como prefixo do documento correto é o antipadrão desta aula. Se a sua pergunta de teste contém as palavras exatas do trecho-alvo, você está medindo casamento de string, não recuperação.

**Nunca sobrescreva o conjunto de avaliação.** E menos ainda no mesmo nome de um arquivo baixado, com download condicionado à existência: o gabarito real fica inacessível de forma silenciosa e permanente.

**Erro que virou número.** `0.0` com nota `"Evaluation Failed"` numa tabela comparativa é pior que uma exceção. Falha de infraestrutura não é desempenho.

**Denominador que inclui o descartado.** Se você pula uma query, decida explicitamente se ela conta como zero ou se sai da conta — e diga qual dos dois no relatório. As duas escolhas são defensáveis; a ambiguidade não.

**Ganho acumulado rotulado como incremental.** `reranker - standard` não é o que o reranking adicionou ao contextual. Rótulo errado num relatório de experimento propaga para a decisão.

**Embedding de outro idioma.** `bge-large-zh` sobre corpus em inglês degrada tudo por igual — o que preserva a comparação relativa e destrói o número absoluto. Se você for comparar com um baseline externo, esse detalhe invalida.

---

## Checkpoint

Responda sem consultar:

1. Qual problema o Contextual Retrieval resolve, e como ele difere da multi-representação da Aula 16?
2. Qual a diferença entre **prefixar** e **reescrever** o chunk, e o que cada uma custa?
3. O que o `diff` entre os dois arquivos deste módulo revela?
4. O que a linha 201 do arquivo LlamaIndex faz, e por que isso impede o experimento de demonstrar a técnica?
5. Cite os três elementos do arquivo LlamaIndex que estão declarados e nunca usados.
6. O que é um gabarito **posicional**, e por que ele invalida `hit_rate` e `mrr`?
7. Quais são as três fabricações de dado do arquivo LlamaIndex, e qual delas é a mais perigosa em produção?
8. Que duas coisas o prompt do arquivo Milvus recebe, e por que a segunda é o que dá nome à técnica?
9. Por que a avaliação do Milvus compara o campo `content` e não o `contextualized_content`?
10. Descreva os três atos da sabotagem da avaliação no arquivo Milvus.
11. Por que o gabarito oficial nunca mais é baixado depois da primeira execução?
12. `Pass@K` e `Average Score` medem coisas diferentes neste arquivo? E o que o rótulo "Reranking further improved by" está de fato reportando?

---

## Vocabulário

`contextual retrieval` · `semantic isolation` · `contextualized chunk` · `prompt caching` ·
`hit rate` · `MRR` · `Pass@K` · `exact match` · `golden standard` · `hybrid retriever` ·
`Cohere rerank` · `BM25` · `multi-representação`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 23 — GraphRAG: quando o grafo ganha do vetor](AULA-23-graphrag.md)
**Próxima:** [AULA 25 — Modular RAG como arquitetura](AULA-25-modular-rag.md)

> Duas aulas seguidas encontraram o mesmo padrão em lugares diferentes: a Aula 23, um capítulo sem
> código; esta, código que implementa a técnica e mede o que não deveria. A Aula 25 volta à situação da
> 23 — `10-AdvanceRAG/03-ModularRAG/` tem apenas o PDF do paper, verificado por `find` durante a Aula
> 23 —, e o método já está estabelecido: ler a fonte primária, separar o que ela mede do que promete, e
> nomear o custo.
