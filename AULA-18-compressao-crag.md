# AULA 18 — Compressão de contexto e correção reflexiva (CRAG)

**Fase 6 — Pós-recuperação** · Módulo do repo: `07-PostRetrieval/02-Compression/` (3 arquivos) e `/03-Correction/` (1 arquivo)

---

## Pergunta motivadora

A Aula 17 reordenou o que voltou. Sobram duas perguntas que o reranking não responde:

1. E se o trecho certo veio, mas **enterrado em texto que não responde**?
2. E se **nada do que voltou serve**?

A primeira é compressão: remover o que não ajuda. A segunda é correção: perceber que a recuperação
falhou e **fazer algo a respeito** — em vez de gerar uma resposta sobre material ruim.

**Julgamento:** a segunda é a mais importante das duas, e é a menos implementada.

---

## Modelo mental

### Compressão não é economia, é qualidade

O reflexo é pensar em compressão como redução de custo de token. O ganho maior é outro: por causa
do _lost in the middle_, **contexto menor e mais denso é usado melhor pelo modelo**. Comprimir é
tirar o trecho bom do meio de um monte de texto irrelevante.

Mas a ordem importa, e ela foi estabelecida na Aula 17: **rerank primeiro, comprimir só se ainda
estiver longo.** Se depois de reordenar você entrega 3 a 5 chunks bem escolhidos, o contexto já é
curto — comprimir ali é risco sem retorno.

### Compressão tem três modos de falha

E nenhum deles é hipotético:

1. **Remove o que sustentaria a resposta.** A informação decisiva muitas vezes está numa cláusula
   de exceção, numa nota de rodapé, num "salvo quando" — trechos que parecem periféricos para um
   compressor que otimiza densidade aparente. O resultado é pior que contexto longo: contexto
   **mutilado com aparência de suficiente**.
2. **Destrói a proveniência literal.** Depois de comprimir, o trecho não corresponde mais ao
   documento fonte. Citar vira aproximação — inviável em domínio jurídico ou médico.
3. **Custa uma inferência por query.** No caminho da consulta, não na ingestão. Se o objetivo era
   reduzir custo, você pode acabar pagando mais: o compressor processa o contexto inteiro para
   depois encurtá-lo.

### Correção é outra categoria

Compressão trabalha **o que voltou**. Correção decide que **o que voltou não serve** e muda o
curso — refaz a busca, reformula a pergunta, ou vai buscar fora do acervo.

Isso exige algo que nenhuma técnica anterior tinha: **um desvio condicional** — o grafo escolhe o
que fazer depois de olhar o que recuperou. Um pipeline linear vai da
recuperação à geração e termina. Correção precisa voltar.

---

## Parte 1 — Compressão contextual

`02-Compression/01-ContextualCompressionRetriever-Compression.py` monta um
`ContextualCompressionRetriever` com `BM25Retriever` como base e **`CohereRerank` como
`base_compressor`**, invocado via `compression_retriever.invoke(query)`.

Repare no que isso revela: **o "compressor" aqui é um reranker.** No LangChain, a abstração
`document_compressors` — a mesma que a Aula 17 encontrou no `RankLLMRerank` — cobre qualquer
transformação que receba documentos e devolva menos documentos ou em outra ordem.

Ou seja, este arquivo não reduz o texto de cada documento; ele **reduz a quantidade** de documentos,
descartando os irrelevantes. É compressão no nível da lista, não da string.

A distinção vale para o vocabulário:

| Nível      | O que reduz                    | Exemplo                                     |
| ---------- | ------------------------------ | ------------------------------------------- |
| **Lista**  | quantos documentos             | `ContextualCompressionRetriever` + reranker |
| **String** | quanto texto dentro de cada um | LLMLingua, `SentenceEmbeddingOptimizer`     |

E note o `.invoke(query)`: o processamento acontece **no caminho da consulta**, não na ingestão. Todo
custo desta aula é por query.

---

## Parte 2 — LLMLingua, e uma ressalva do próprio exemplo

`02-Compression/02-LLMLingua-Compression.py` chama `llm_lingua.compress_prompt(...)` — compressão no
nível da string, que remove tokens de baixa informação do prompt.

⚠️ **Uma observação que só aparece lendo o arquivo:** na linha 33, o parâmetro `question=""` está
**vazio**. Isso significa que, nesta demonstração, a compressão **não está condicionada à
pergunta** — ela reduz o prompt por densidade de informação geral, não por relevância para a query
específica.

Isso importa porque a descrição usual da técnica — "remove o que não responde à pergunta" — só vale
quando a pergunta é informada. Com `question=""`, o compressor opera às cegas em relação à intenção.

Ao adaptar este exemplo, passe a `question` de verdade. E registre o contraste: é o tipo de detalhe
em que a expectativa criada pelo nome da técnica não corresponde ao que o código demonstra — o mesmo
padrão que atravessa este repositório.

---

## Parte 3 — Otimização por embedding de sentença

`02-Compression/03-SentenceEmbeddingOptimizer-Compression.py` é, **julgamento**, o mais didático do trio, porque
mostra o **mesmo mecanismo com dois critérios de corte** (linhas 13 e 18):

```python
query_engine = index.as_query_engine(node_postprocessors=[SentenceEmbeddingOptimizer(percentile_cutoff=0.5)])
...
query_engine = index.as_query_engine(node_postprocessors=[SentenceEmbeddingOptimizer(threshold_cutoff=0.7)])
```

O mecanismo do `SentenceEmbeddingOptimizer`: dentro de cada chunk recuperado, ele **embute as
sentenças individualmente** e mantém só as mais similares à query. É compressão semântica em nível
de sentença — e é o `node_postprocessors` do LlamaIndex, a mesma abstração que a Aula 15 usou para
o `MetadataReplacementPostProcessor` e para a expansão prev/next.

A diferença entre os dois cortes é de natureza, não de valor:

| Parâmetro               | Critério     | Comportamento                               |
| ----------------------- | ------------ | ------------------------------------------- |
| `percentile_cutoff=0.5` | **relativo** | mantém as 50% melhores sentenças, sempre    |
| `threshold_cutoff=0.7`  | **absoluto** | mantém as que passam de 0,7 de similaridade |

O percentil remove **cerca de** metade, mesmo quando todas as sentenças eram relevantes — e o
"cerca de" é literal: o corte é `int(len(sentenças) * 0.5)`, e num chunk de **uma** sentença isso dá
`0`, que a implementação trata como _sem limite_ (o teste é `if similarity_top_k and …`, e zero é
falsy). Chunk curto passa inteiro.

O limiar é o mais arriscado dos três (**julgamento**), mas não pelo motivo que se espera: se nenhuma
sentença atinge 0,7, o resultado **não** é chunk vazio chegando ao LLM — é
`ValueError("Optimizer returned zero sentences.")`, levantado antes de qualquer geração. A falha é
alta e barulhenta, o que é melhor que silenciosa; o risco real é a consulta quebrar em produção para
um documento cujo vocabulário se afasta do da pergunta, e você não saber disso até acontecer.

_Limite: conferido lendo `llama_index.core.postprocessor.optimizer` e
`llama_index.core.indices.query.embedding_utils` do `llama-index-core` 0.11.17; não executei._

Isso é o problema de calibração de similaridade absoluta que a Aula 02 antecipou: o valor de cosseno
não é calibrado entre modelos nem entre domínios. Um `threshold_cutoff` copiado de exemplo é chute.
Julgamento: prefira `percentile_cutoff` até ter medido a distribuição de similaridade no seu corpus,
e então considere o limiar.

O arquivo roda as três versões em sequência — sem otimização, percentil e limiar — o que faz dele o
experimento controlado do módulo.

---

## Parte 4 — CRAG: a recuperação que se corrige

**Julgamento:** `03-Correction/01-CRAG-ReflectiveRetrieval.py` é o arquivo mais importante da
Fase 6.

O comentário da linha 68 nomeia o componente central sem rodeios: _"Part 2: Retrieval grader — the
core component of CRAG"_.

A peça é um **avaliador estruturado** (linhas 72–74 e 93):

```python
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
...
structured_llm_grader = llm.with_structured_output(GradeDocuments)
```

E o critério vive no prompt, a partir da linha 97:

```
You are a grader assessing the relevance of a retrieved document to a user question.
If the document contains keyword(s) or semantic meaning related to the question, grade it as relevant.
```

Três coisas para notar:

**1. É o mesmo padrão de saída estruturada da Aula 14.** `with_structured_output(GradeDocuments)`
com Pydantic — o modelo é **restringido** a emitir um veredito, não instruído a emiti-lo. Isso torna
a decisão discreta e utilizável como aresta de um grafo.

**2. O critério é generoso de propósito.** "Contém palavra-chave **ou** significado relacionado"
qualifica como relevante. É um avaliador com viés para aprovar — o que faz sentido para o papel: ele
não escolhe o melhor documento, ele **detecta a falha grosseira** de nada servir.

**3. O grader é o que habilita a decisão.** Sem um veredito explícito por documento, o pipeline não
tem como saber que a recuperação foi ruim. Ele geraria uma resposta fiel a material irrelevante — o
estado que a Aula 22 vai mostrar ser invisível em faithfulness.

### O que o CRAG faz com o veredito

O arquivo carrega o acervo com `WebBaseLoader`, `RecursiveCharacterTextSplitter`, `Chroma` e
`OpenAIEmbeddings` (linhas 24–27), e sobre isso monta o grafo. A lógica do paper CRAG, em três
saídas possíveis:

| Veredito dos documentos | Ação                                             |
| ----------------------- | ------------------------------------------------ |
| relevantes              | seguir para a geração                            |
| **nenhum relevante**    | **buscar fora** — reformular e/ou recorrer à web |
| ambíguo                 | combinar: usar o que serve, complementar o resto |

> ⚠️ **A terceira linha é do paper, não deste arquivo.** O `grade_documents` de
> `01-CRAG-ReflectiveRetrieval.py:296-321` só produz
> **dois** resultados possíveis — e quem roteia com base neles é `decide_to_generate` (`:383-411`),
> passada como função de decisão em `add_conditional_edges` (441-448): zero documentos aprovados → busca na web; um ou mais aprovados → gera
> direto com os que sobraram. Não existe caminho que "complemente o resto" — o ambíguo desaparece
> dentro do ramo "relevantes", e o que foi reprovado é simplesmente descartado. Ao ler o código,
> espere duas saídas.

O segundo caso é o que dá nome à técnica: **corretiva**. Em vez de responder mal, o sistema admite
que não tem material e vai procurar.

### Onde isso nos coloca

Aqui a Fase 6 encontra a Fase 7. O grafo com arestas condicionais que o CRAG exige é o mesmo que
Self-RAG (Aula 21) e Adaptive RAG (Aula 26) usam — e é por isso que o repositório introduziu
LangGraph tão cedo, em `00-SimpleRAG/04_LangGraph_RAG.py`.

A diferença entre CRAG e Self-RAG, em uma linha: **CRAG critica o que foi recuperado; Self-RAG
critica também a própria resposta e decide se precisa recuperar.** Essa é a diferença **entre os
dois papers**; a Aula 21 vai abrir a implementação do repositório e mostrar que ela recupera sempre,
sem decidir nada — leia esta frase como descrição da técnica, não do código que vem a seguir. CRAG
é um subconjunto do
comportamento, focado no estágio de recuperação.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/07-PostRetrieval/02-Compression
python 03-SentenceEmbeddingOptimizer-Compression.py
```

Comece por este — ele roda as três configurações em sequência. Compare o **tamanho do contexto** e a
**resposta** em cada uma. A pergunta a fazer: a resposta piorou junto com o encurtamento, ou
melhorou?

```powershell
python 01-ContextualCompressionRetriever-Compression.py
python 02-LLMLingua-Compression.py
```

No `02`, **passe uma `question` de verdade** na linha 33 e compare com o comportamento original de
`question=""`. É a diferença entre comprimir por densidade e comprimir por relevância.

```powershell
cd ../03-Correction
python 01-CRAG-ReflectiveRetrieval.py
```

Imprima o **veredito do grader para cada documento**. Ver "relevante / não relevante" documento por
documento é o que torna o CRAG compreensível — e é a instrumentação que a Aula 22 vai pedir de
qualquer jeito.

---

## Quebre de propósito

**1. Suba o `threshold_cutoff` até esvaziar o chunk.** Ponha `threshold_cutoff=0.95`. Provavelmente
nenhuma sentença passa, e o LLM recebe contexto vazio. Observe o que ele responde — e por que limiar
absoluto sem medição é perigoso.

**2. Comprima depois de já ter reranqueado bem.** Recupere 20, rerank para 3, e então aplique
compressão. Compare com só o rerank. Se a resposta não melhorar, você acabou de medir que a
compressão era desnecessária ali — e a ordem da Aula 17 se justifica.

**3. Force o grader do CRAG a reprovar tudo.** Faça uma pergunta sobre assunto ausente do acervo.
Observe o caminho que o grafo toma quando nenhum documento é aprovado. Esse é o comportamento
corretivo em ação.

**4. Torne o critério do grader rigoroso.** Mude o prompt da linha 97 para exigir que o documento
**responda** à pergunta, não apenas se relacione. Mais documentos serão reprovados. O sistema passa
a buscar fora com mais frequência — mais custo, possivelmente mais qualidade. Onde está o ponto
certo?

**5. Meça faithfulness com e sem CRAG.** Numa pergunta cuja resposta não está no acervo, compare:
sem CRAG, o sistema gera algo fiel a material irrelevante; com CRAG, admite ou busca fora. É a
diferença entre parecer bem e estar certo.

---

## Armadilhas de produção

- **Comprimir antes de reranquear.** Você joga fora texto que o reranker usaria para julgar.
- **Comprimir contexto já curto.** Risco sem retorno.
- **`threshold_cutoff` copiado de exemplo.** Cosseno não é calibrado entre modelos e domínios.
- **Perder a proveniência.** Se o produto cita fonte literalmente, compressão em nível de string
  quebra a citação. Guarde o trecho original ao lado do comprimido.
- **`question=""` em produção.** Compressão não condicionada à pergunta remove por densidade, não
  por relevância.
- **Grader do CRAG sem log.** Sem registrar o veredito por documento, você não sabe se o sistema
  está corrigindo, nem com que frequência.
- 🔴 **A reescrita do CRAG é calculada e jogada fora — e o arquivo irmão prova que é defeito, não
  simplificação.** Em
  `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:343-344`, o `transform_query` faz
  `better_question = question_rewriter.invoke({"question": question})` e a linha seguinte devolve
  `{"documents": documents, "question": question}` — a **pergunta original**. `grep -c
  "better_question"` nesse arquivo devolve **1**: só a atribuição, nunca uma leitura.

  Agora o mesmo trecho no Self-RAG, que a Aula 21 vai abrir
  (`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py:266-267`):
  a atribuição é idêntica, e o retorno é `{"documents": documents, "question": better_question}`.
  `grep -c` devolve **2**. A **linha de retorno** difere por uma palavra, e só uma das duas liga o
  fio. (O `diff` das duas funções mostra mais que isso — docstring, `print` e comentários também
  mudaram; o que é idêntico é a lógica, e o que difere por uma palavra é o `return`.)

  Consequência no CRAG: a chamada de LLM da reescrita é paga e descartada, e a busca na web
  (`01-CRAG-ReflectiveRetrieval.py:367`, `web_search_tool.invoke(question)`) roda sobre a mesma
  pergunta que já havia falhado. O caminho "corretivo" corrige menos do que o nome promete. Se você
  copiar este grafo, capture `better_question` no retorno do nó — é uma palavra.

  **Julgamento:** é o defeito mais silencioso dos que este curso catalogou, porque nada quebra —
  o grafo roda, a aresta existe, o custo é pago, e o efeito simplesmente não acontece.
- **CRAG com busca web sem limites.** "Buscar fora" pode virar custo e latência imprevisíveis, e
  traz conteúdo não curado para dentro da resposta. Defina quando é permitido.
- **Assumir que compressão sempre economiza.** O compressor processa o contexto inteiro antes de
  encurtar. Meça a conta completa.

---

## Checkpoint

1. Quais as duas perguntas que o reranking não responde, e qual técnica atende cada uma?
2. Por que compressão é mais sobre qualidade que sobre custo?
3. Qual a ordem correta entre rerank e compressão, e por quê?
4. Cite os três modos de falha da compressão.
5. Qual a diferença entre compressão em nível de lista e em nível de string? Dê um exemplo de cada.
6. O que o `ContextualCompressionRetriever` com `CohereRerank` como `base_compressor` revela sobre a
   abstração do LangChain?
7. O que significa `question=""` no exemplo de LLMLingua, e por que isso muda a leitura da técnica?
8. Diferencie `percentile_cutoff` de `threshold_cutoff`. Qual pode esvaziar o chunk, e por quê?
9. Qual é o componente central do CRAG, e o que `with_structured_output(GradeDocuments)` garante?
10. Por que o critério do grader é deliberadamente generoso?
11. O paper do CRAG prevê três saídas conforme o veredito. Quantas o `grade_documents` de
    `01-CRAG-ReflectiveRetrieval.py` de fato produz, e o que acontece com o caso que sobra?
12. Qual a diferença entre CRAG e Self-RAG?

---

## Vocabulário

`context compression` · `LLMLingua` · `CRAG (Corrective RAG)` · `Self-RAG` · `reranking` ·
`lost in the middle` · `faithfulness` · `grounding`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 17 — Reranking](AULA-17-reranking.md)
**Próxima:** [AULA 19 — Escolha de modelo e prompt engineering para RAG](AULA-19-modelo-e-prompt-engineering.md)

> **Fase 6 concluída.** As Aulas 17 e 18 cobrem `07-PostRetrieval/`: reordenar, remover e corrigir.
> O CRAG introduziu a **ramificação condicional** — e a Fase 7 vai levá-la ao ciclo de fato, para que o modelo critique a própria resposta.
