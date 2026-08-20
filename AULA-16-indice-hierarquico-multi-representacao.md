# AULA 16 — Índice hierárquico e multi-representação

**Fase 5 — Otimização de índice** · Módulo do repo: `06-Indexing/02-BuildingHierarchicalIndex/` (8 arquivos) e `/03-BuildingMultiRepresentationIndex/` (2 arquivos)

---

## Pergunta motivadora

A Aula 15 desacoplou o tamanho do que se indexa do tamanho do que se entrega. Esta aula ataca dois
problemas diferentes, que exigem mudanças de outra natureza:

1. **O acervo é grande demais** para busca plana ser eficiente, e tem estrutura de contenção
   natural. → **índice hierárquico**
2. **Os usuários perguntam a mesma coisa de mil formas**, e o texto do documento só casa com
   algumas. → **multi-representação**

A distinção que organiza a aula: **hierárquico ataca escala; multi-representação ataca
variabilidade de query.** São ortogonais e podem coexistir.

---

## Modelo mental

### Hierárquico: buscar em dois níveis

```
NÍVEL 1 (grosseiro)     resumos, descrições, nomes de tabela
        │                       ↓ seleciona candidatos
NÍVEL 2 (fino)          chunks, linhas, o conteúdo de verdade
```

Você busca no grosseiro para reduzir o espaço, e desce ao fino dentro do candidato.

O ganho é redução do espaço de busca. O risco é o que esta aula chama de cascata:
**um filtro errado no nível 1 é irrecuperável.** Se o resumo não menciona o detalhe que responde à
pergunta, o documento não é selecionado, e o nível 2 nunca é consultado. Busca plana teria achado.

### Multi-representação: indexar o mesmo conteúdo várias vezes

Aqui não há níveis. Há **várias representações do mesmo documento**, todas apontando para o
original:

| Representação indexada                    | Casa com                                      |
| ----------------------------------------- | --------------------------------------------- |
| o texto original                          | perguntas que usam o vocabulário do documento |
| um resumo gerado por LLM                  | perguntas sobre o tema geral                  |
| perguntas hipotéticas que ele responderia | perguntas parecidas com essas                 |
| palavras-chave extraídas                  | consultas curtas e diretas                    |

O que é **entregue** é sempre o documento original. O que varia é o que foi indexado para
encontrá-lo.

### A distinção precisa — e por que ela é escorregadia

Multi-representação **não é** busca híbrida (Aula 11). Vale enunciar sem ambiguidade:

|           | Multi-representação                            | Busca híbrida                    |
| --------- | ---------------------------------------------- | -------------------------------- |
| Varia     | **o que está indexado**                        | **como se busca**                |
| Artefatos | texto, resumo, perguntas — conteúdos distintos | um texto só                      |
| Mecanismo | vários vetores → mesmo original                | BM25 + denso sobre o mesmo texto |

Um resumo gerado é **conteúdo novo**: ele contém a síntese que o texto original não enuncia. Um
índice BM25 não é conteúdo novo — é outra forma de procurar o mesmo texto.

> ⚠️ Confundir os dois produziu uma das três alucinações registradas no gate v1 do agente: eu
> afirmei que `03-BuildingMultiRepresentationIndex/01-HybridRetrievalWithEnsembleRetriever.py`
> combinava multi-representação com híbrido. Ele é **hybrid retrieval puro**. O arquivo está
> naquela pasta, e o caminho não é evidência do conteúdo. Registro em
> [`avaliacao/GATE-RAG-SPECIALIST.md`](avaliacao/GATE-RAG-SPECIALIST.md).

---

## Parte 1 — Índice hierárquico

`02-BuildingHierarchicalIndex/` tem **8 arquivos**, e a numeração conta a progressão:

| Arquivo                                                 | Papel                                                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `00-DirectlyLoadDocumentsIndexAndQA.py`                 | **baseline sem hierarquia** — `VectorStoreIndex.from_documents` + `as_query_engine` |
| `01-TwoTierIndex-Milvus-WorkingButImmatureVersion.py`   | two-tier no Milvus, versão imatura                                                  |
| `02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py` | two-tier no Milvus, versão bem-sucedida                                             |
| `03-TwoTierIndex-PandasNode.py`                         | two-tier com `PandasQueryEngine` sobre DataFrame                                    |
| `04-CoarseToFineExample.py`                             | grosso-para-fino com `RecursiveRetriever`                                           |
| `05-HierarchicalMergingExample.py`                      | fusão hierárquica                                                                   |
| `98-TwoTierIndex-FAISS.py`                              | two-tier com FAISS                                                                  |
| `99-QueryTest.py`                                       | teste de consulta                                                                   |

O `00` existe para ser **medido contra**. Ele é `VectorStoreIndex.from_documents(documents)`
seguido de `as_query_engine` — busca plana, sem camada. Julgamento: se o seu hierárquico não bater
o `00` no seu conjunto de avaliação, ele está custando complexidade sem entregar recall. Essa
comparação é obrigatória e quase nunca é feita.

"Two-tier" aparece em quatro arquivos com **backends diferentes** — Milvus no `01` e `02`, Pandas
no `03`, FAISS no `98`. A técnica é independente do banco; o que muda é onde os dois níveis moram.

### O que separa o imaturo do bem-sucedido

O `diff` entre `01-...WorkingButImmatureVersion.py` e `02-...SuccessfulHierarchicalIndex.py` mostra
a diferença no **schema do nível grosseiro**:

- O `01` declara `FieldSchema(name="summary", dtype=DataType.VARCHAR, max_length=500)` e insere
  `"summary": sheet_name` — ou seja, o campo se chama resumo mas recebe **o nome da planilha**.
- O `02` traz o comentário `# Insert the summary data - only store the table name`, tornando
  explícito o que está sendo armazenado, e no nível de detalhe usa
  `table_content = df.to_string(index=False)`.

Ou seja, a "imaturidade" do `01` é em boa parte de **honestidade de nomenclatura e de organização
do que vai em cada nível** — um campo chamado `summary` que guarda um identificador induz quem lê
a erro, e a busca no nível grosseiro passa a operar sobre algo que não é resumo.

Isso conecta com o padrão que atravessa este repositório e este curso: **o nome promete o que o
conteúdo não é.** Aqui o autor versionou as duas versões justamente para você ver a correção.

### Grosso-para-fino com `RecursiveRetriever`

`04-CoarseToFineExample.py` usa duas peças do LlamaIndex que vale conhecer (linhas 2 e 5):

```python
from llama_index.core.schema import IndexNode, Document
from llama_index.core.retrievers import RecursiveRetriever
```

O `IndexNode` é o mecanismo: é um nó que **aponta para outro índice** em vez de conter texto final.
O `RecursiveRetriever` segue esses apontamentos — recupera no nível de cima, encontra um
`IndexNode`, e desce recursivamente ao índice que ele referencia.

É a implementação idiomática do modelo mental de dois níveis, e a recursão permite mais de dois:
resumo de seção → resumo de subseção → chunk.

### O segundo nível decorativo

Vale registrar aqui um achado, porque neste arquivo ele é o alerta central da aula: em
`98-TwoTierIndex-FAISS.py`, a busca no segundo índice (linha 58) calcula `distances, indices` e
**o resultado nunca é usado** — o retorno da função vem apenas do primeiro nível.

É o caso extremo do risco do hierárquico: toda a complexidade de dois índices, nenhum benefício.
E ele passa desapercebido porque o código roda e devolve resposta. Se você for construir um índice
de dois níveis, **verifique que o segundo nível está de fato influenciando o resultado** — não
presuma.

---

## Parte 2 — Multi-representação

`03-BuildingMultiRepresentationIndex/` tem **2 arquivos**, e apenas um faz multi-representação.

### O que faz de verdade

`02-BuildMultiRepresentationIndexWithMultiVectorRetriever.py` usa o `MultiVectorRetriever` do
LangChain com dois armazenamentos:

```python
retriever.vectorstore.add_documents(summary_docs)      # resumos → Chroma, embutidos
retriever.docstore.mset(list(zip(doc_ids, docs)))      # documentos completos → docstore
```

O mecanismo: **indexa-se o resumo, entrega-se o documento completo.** Os `doc_ids` são a ponte —
cada resumo carrega o id do documento que representa, e o retriever usa esse id para buscar o
original no docstore.

Compare com o pai-filho da Aula 15: lá, o que se indexava era um **pedaço** do documento; aqui, é
um **artefato derivado** dele. O resumo não existe no documento original — foi gerado. É essa
diferença que faz multi-representação ser uma família distinta.

### O que não faz

`01-HybridRetrievalWithEnsembleRetriever.py`, apesar de estar nessa pasta, é **hybrid retrieval
puro**: `BM25Retriever` + FAISS combinados por `EnsembleRetriever`, sobre a **mesma lista de
documentos**. Não há resumo, não há pergunta hipotética, não há segundo artefato — há dois
algoritmos de busca sobre um texto só.

Ele pertence conceitualmente à Aula 11. Estar neste diretório é organização do repositório, não
classificação da técnica.

### Como gerar as representações

O exemplo usa resumos. As outras opções, e o custo de cada uma — julgamento, porque o repositório
não as compara:

| Representação         | Como gerar                       | Custo                                                   |
| --------------------- | -------------------------------- | ------------------------------------------------------- |
| Resumo                | uma chamada de LLM por documento | alto na ingestão, pago uma vez                          |
| Perguntas hipotéticas | uma chamada de LLM por documento | idem, e rende quando as perguntas reais são previsíveis |
| Palavras-chave        | extração estatística (sem LLM)   | baixo                                                   |
| Título e cabeçalhos   | do próprio parser (Aula 05)      | quase zero                                              |

A ordem de adoção que eu recomendaria é inversa ao custo: comece pelo que o parser já entrega —
título e estrutura —, meça, e só gere resumos por LLM se o ganho justificar. Cada representação
extra multiplica o número de vetores no índice.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/06-Indexing/02-BuildingHierarchicalIndex
python 00-DirectlyLoadDocumentsIndexAndQA.py
```

**Comece pelo baseline** e guarde as respostas. É o número contra o qual tudo aqui deve ser
comparado.

```powershell
python 04-CoarseToFineExample.py
```

Observe onde o `RecursiveRetriever` desce de nível. Se o exemplo logar os nós intermediários, veja
qual `IndexNode` foi seguido — é o momento em que a cascata acontece.

```powershell
python 98-TwoTierIndex-FAISS.py
```

Abra o arquivo e localize a linha 58. Confirme você mesmo que `indices` não é usado depois. Este é
o exercício de leitura crítica mais valioso do módulo.

```powershell
cd ../03-BuildingMultiRepresentationIndex
python 02-BuildMultiRepresentationIndexWithMultiVectorRetriever.py
```

Imprima o **resumo indexado** e o **documento devolvido**. Ver os dois lado a lado é o que fixa a
diferença em relação ao pai-filho: o resumo não é um trecho do documento.

---

## Quebre de propósito

**1. Faça o nível grosseiro perder o detalhe.** No two-tier, use resumos muito curtos — uma frase
por documento. Faça uma pergunta sobre um detalhe específico que o resumo não menciona. O documento
não é selecionado, e nenhum ajuste no nível 2 recupera. É a cascata cobrando.

**2. Compare contra o baseline.** Rode a mesma pergunta pelo `00` e pelo two-tier. Se o plano
vencer, você tem evidência de que a hierarquia não está pagando — e essa é a medição que quase
ninguém faz.

**3. Conserte o segundo nível do `98`.** Use o `indices` que a linha 58 calcula e faça o retorno
depender dele. Compare o resultado com a versão original. Você acabou de transformar um segundo
nível decorativo em funcional.

**4. Remova o docstore do multi-representação.** Sem ele, o retriever devolve o resumo em vez do
documento. Compare a resposta do LLM nos dois casos: responder a partir de um resumo é responder a
partir de uma paráfrase, com a perda que isso implica.

**5. Adicione uma segunda representação.** Ao lado dos resumos, indexe palavras-chave extraídas dos
mesmos documentos. Meça se o recall melhora — e conte quantos vetores o índice passou a ter.

---

## Armadilhas de produção

- **Cascata irrecuperável.** Erro no nível grosseiro não se conserta no fino. Se as perguntas do
  seu domínio dependem de detalhes que resumos omitem, hierárquico é a escolha errada.
- **Hierarquia artificial.** Se o acervo é feito de unidades pequenas e independentes — tickets,
  FAQ —, o nível grosseiro não corresponde a nada e você paga duas buscas por nada.
- **Segundo nível decorativo.** Verifique que ele influencia o resultado. O `98` do próprio
  repositório é o contraexemplo.
- **Pergunta que cruza documentos.** "Compare A e B" exige trechos de dois pais; o hierárquico
  tende a convergir para um candidato e refinar dentro dele.
- **Não medir contra o baseline plano.** Sem o `00`, você não sabe se a complexidade compra algo.
- **Multi-representação multiplicando o índice.** Cada representação extra é mais vetores, mais
  memória, mais custo de embedding.
- **Resumo gerado por LLM sem revisão.** Se o resumo distorce o documento, você indexou uma
  distorção — e ela decide o que é recuperado.
- **Reindexação em cascata.** Mudou o prompt que gera os resumos? Todos precisam ser regerados e
  reindexados.

---

## Checkpoint

1. Qual problema o hierárquico ataca, e qual a multi-representação? Por que são ortogonais?
2. Descreva o mecanismo de dois níveis. Qual o ganho e qual o risco?
3. Por que um erro no nível grosseiro é irrecuperável?
4. Para que serve o `00-DirectlyLoadDocumentsIndexAndQA.py`?
5. O que o `diff` entre as versões `01` e `02` do two-tier Milvus revela sobre o nível grosseiro?
6. O que é um `IndexNode`, e o que o `RecursiveRetriever` faz com ele?
7. Qual o problema em `98-TwoTierIndex-FAISS.py:58`, e por que ele passa desapercebido?
8. Defina multi-representação e explique por que hybrid retrieval **não** é multi-representação.
9. Qual dos dois arquivos de `03-BuildingMultiRepresentationIndex/` faz multi-representação de
   fato? O que o outro faz?
10. Qual a diferença entre o pai-filho da Aula 15 e o resumo indexado desta aula?
11. Cite quatro formas de gerar representações e a ordem de adoção que faz sentido pelo custo.

---

## Vocabulário

`multi-representação` · `parent-child` · `small-to-big` · `hybrid search` · `sparse vector` ·
`dense vector` · `recall@k`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 15 — Small-to-big](AULA-15-small-to-big.md)
**Próxima:** [AULA 17 — Reranking: RRF, cross-encoder, ColBERT, Cohere, RankLLM e recência](AULA-17-reranking.md)

> **Fase 5 concluída.** As Aulas 15 e 16 cobrem `06-Indexing/`: desacoplar índice de entrega, subir
> um nível de busca, e indexar o mesmo conteúdo de várias formas. A Fase 6 muda de estágio — não
> mais como buscar, mas o que fazer com o que voltou.
