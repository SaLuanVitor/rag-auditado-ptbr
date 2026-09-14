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

O `diff` remove 78 linhas e acrescenta 32 (73 e 28 se você contar só as com conteúdo), e o peso da
mudança **não está no nível grosseiro**,
está no de detalhe. Duas leituras, e a segunda é a que importa.

A primeira é de nomenclatura, e é real: o `01` declara `FieldSchema(name="summary",
dtype=DataType.VARCHAR, max_length=500)` e insere `"summary": sheet_name`, ou seja, o campo se chama
resumo e recebe **o nome da planilha**. O `02` traz o comentário `# Insert the summary data - only
store the table name`, tornando explícito o que está armazenado. Um campo chamado `summary` que
guarda um identificador induz quem lê a erro. Mas isso é **uma linha das 78**.

A segunda leitura é a que muda o veredito. O `01` insere **uma entidade por linha da planilha**
(`01-...:93`, `for _, row in df.iterrows()`), dez por aba, e o segundo nível ordena dez candidatos
para cinco (`:220-221`, o filtro por `table_name` com `limit=5`). O `02` insere **a tabela inteira
como uma entidade só** (`02-...:80`, `df.to_string(index=False)`) e o segundo nível filtra com
`limit=1` (`:180-181`). O conjunto filtrado tem cardinalidade **um**: o embedding da pergunta não
decide nada ali.

Ou seja, a versão apresentada como bem-sucedida simplificou o código e, no caminho, **apagou a
discriminação do nível fino**. É exatamente o segundo nível decorativo que esta aula levanta como
alerta central sobre o `98`, dentro do arquivo que o repositório apresenta como o certo. E a lição
que sai daí é mais fina que a do `98`: um nível não precisa de código morto para ser decorativo,
basta que a cardinalidade efetiva dele seja um.

Isso conecta com o padrão que atravessa este repositório e este curso: **o nome promete o que o
conteúdo não é.** Aqui o autor versionou as duas versões justamente para você ver a correção.

### Grosso-para-fino com `RecursiveRetriever`

`04-CoarseToFineExample.py` usa duas peças do LlamaIndex que vale conhecer (linhas 2 e 5):

```python
from llama_index.core.schema import IndexNode, Document
from llama_index.core.retrievers import RecursiveRetriever
```

O `IndexNode` é o mecanismo: é um nó que **aponta para outro índice** em vez de ser o texto final
entregue (ele **herda** de `TextNode`, então carrega texto — o resumo que a busca de nível 1 usa). O
`RecursiveRetriever` segue esses apontamentos — recupera no nível de cima, encontra um `IndexNode`,
e desce recursivamente ao índice que ele referencia.

A recursão permite mais de dois níveis: resumo de seção → resumo de subseção → chunk.

**Mas o `04` não instancia o diagrama de forma estrita, e vale medir antes de tomá-lo como
modelo.** A linha 78 junta num índice só os nós de texto final e os `IndexNode` (`all_nodes =
doc_nodes + index_nodes`), e a linha 81 pede `similarity_top_k=2`. Com o `node_parser` padrão o
arquivo produz três de cada, então os dois acertos do topo podem ser nós de texto comum, e aí o
`RecursiveRetriever` **não desce**. É um dois-níveis opcional, não o dois-níveis do diagrama, em
que o nível 1 só tem resumos.

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

⚠️ **Duas medições antes de acreditar na demonstração.** O `WebBaseLoader` devolve **um**
`Document` por URL, e o script passa uma URL só: o Chroma guarda **um vetor**, o docstore guarda
**uma entrada**, e o retriever não escolhe entre nada. E há **uma** representação por documento,
não várias, o que é o oposto do que o modelo mental desta aula desenha. Some-se que a linha 48
passa `n_results=1`, que o `MultiVectorRetriever` **ignora em silêncio**: o
`_get_relevant_documents` não aceita `**kwargs`, e o `k` real vem de `search_kwargs`, que ali está
vazio. Para ver multi-representação de fato, carregue três ou quatro URLs e construa o retriever
com `search_kwargs={"k": 1}`. O arquivo demonstra a **arquitetura** certa, artefato indexado
diferente de artefato entregue, com uma representação só. O "multi" do nome ainda não aconteceu
ali, que é o mesmo padrão que esta aula nomeia duas seções acima.

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

⚠️ **Dois consertos de caminho antes de rodar, e os dois são do repositório.** A linha 19 do `00-*` é
`file_path = "90-Data/ComplexPDF/billionaires_page-1-5.pdf"`, relativa à **raiz** do repositório: de
dentro desta pasta ela não resolve. Prefixe com `../../`.

E o `98-TwoTierIndex-FAISS.py` tem o mesmo problema **mais um pior**: a linha 31 aponta para
`WorldTopTenBillionaires.xlsx`, cujas abas têm nome em chinês (`2023年10大首富`, …), enquanto
as linhas
57 e 63 montam a chave `billionaires_table_{matched_year+2}` — `_2` a `_6`, que são as abas do
**outro** arquivo da mesma pasta, `billionaires_merged.xlsx`. Com o caminho certo e o workbook
errado você recebe `KeyError: 'billionaires_table_2'`. Troque a linha 31 por
`"../../90-Data/ComplexPDF/TopTenBillionaires/billionaires_merged.xlsx"`.

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
o exercício de leitura crítica que considero mais valioso do módulo.

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

**2. Compare contra o baseline, depois de igualar o resto.** O `00` lê um PDF com `PyMuPDFReader`,
embute com `text-embedding-3-small` e gera com `gpt-3.5-turbo`. Nos two-tier, o `01`, o `02` e o
`99` embutem com `bge-m3`, o `98` com `all-MiniLM-L6-v2`, e os quatro geram com `deepseek-chat`.
Contra esses, rodar a mesma pergunta compara **quatro coisas de uma vez**, e nenhuma delas é a
hierarquia.

**O `03` é a exceção, e é o atalho:** as linhas 24 e 25 dele já usam `gpt-3.5-turbo` e
`text-embedding-3-small`, os mesmos do `00`, então ali sobram só dois eixos, corpus e loader. É o
ponto do módulo onde a comparação chega mais perto de ser justa de fábrica. Nos outros, antes de
comparar, aponte o `00` para a mesma planilha, troque o `PyMuPDFReader` por um leitor de planilha
e iguale embedder e gerador; só então a diferença que sobrar é
da arquitetura. A comparação continua sendo a medição que quase ninguém faz, e o repositório não a
entrega pronta.

**3. Conserte o segundo nível do `98` — e note que consertar o `return` não basta, e que o conserto
óbvio é pior.** Use o `indices` que `98-TwoTierIndex-FAISS.py:58` calcula e faça o retorno
depender dele. O resultado
**não muda**, e a razão é o que o
exercício ensina: a consulta do segundo nível é o embedding **da própria tabela já escolhida**, e essa
tabela está indexada no `table_index` — buscar num `IndexFlatL2` um vetor idêntico a um vetor indexado
devolve ele mesmo, a distância zero. O `indices[0][0]` reaponta para a mesma tabela.

Para o segundo nível influenciar de fato, troque a consulta pelo embedding **da pergunta** e mantenha
uma lista que mapeie a posição do índice de volta ao nome da aba. Aí compare: é a diferença entre um
segundo nível decorativo e um funcional — e o exercício ensina duas coisas, porque a primeira
tentativa mede zero.

**E o repositório já tem o padrão certo, em dois lugares que esta aula não usava.** O
`99-QueryTest.py:48` e o `02-TwoTierIndex-Milvus-SuccessfulHierarchicalIndex.py:180` fazem
`filter=f"table_name == '{matched_table}'"`: o Milvus restringe o segundo nível por metadado, e a
lista paralela deixa de ser necessária. Num `IndexFlatL2` não há metadado, então ali a lista é o
equivalente mais próximo, mas se você for reescrever isso em Milvus, copie de lá.

**4. Não popule o docstore do multi-representação.** Pule o `mset`, em vez de remover o
`docstore`: sem ele o construtor recusa a montagem, pedindo um `byte_store`. Sem popular, o
retriever devolve **lista vazia** — e
não o resumo, que seria a suposição intuitiva. O `MultiVectorRetriever` busca no vetorstore, junta
os ids e faz `docstore.mget(ids)`; sem docstore populado o `mget` devolve `None` para cada id, e a
compreensão de lista que vem depois filtra todos. Some tudo, silenciosamente.

Isso é mais instrutivo que o resumo teria sido: **o resumo nunca é entregue ao LLM em nenhum
caminho.** Ele existe só para ser encontrado. Confirmado na fonte do `MultiVectorRetriever`, cujo
`_get_relevant_documents` termina em `docs = self.docstore.mget(ids)` seguido de
`return [d for d in docs if d is not None]`.

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

`multi-representação` · `IndexNode` · `RecursiveRetriever` ·
`MultiVectorRetriever` · `parent-child` · `small-to-big`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 15 — Small-to-big](AULA-15-small-to-big.md)
**Próxima:** [AULA 17 — Reranking: RRF, cross-encoder, ColBERT, Cohere, RankLLM e recência](AULA-17-reranking.md)

> **Fase 5 concluída.** As Aulas 15 e 16 cobrem os três primeiros subdiretórios de `06-Indexing/`,
> com uma exceção declarada: o `05-HierarchicalMergingExample.py`, que aplica `AutoMergingRetriever`
> sobre `HierarchicalNodeParser`, fica de fora do curso, e nenhuma aula o trata. Quem quiser seguir
> por ali tem no small-to-big da Aula 15 o modelo mental mais próximo. O que as duas aulas cobrem é
> desacoplar índice de entrega, subir
> um nível de busca, e indexar o mesmo conteúdo de várias formas. A Fase 6 muda de estágio: a Fase
> 5 reorganiza **o que entra no índice**, na ingestão, antes de qualquer pergunta chegar; a Fase 6
> trata do que fazer com o que voltou.
