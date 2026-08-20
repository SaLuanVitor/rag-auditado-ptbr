# Gate de avaliação — agente `rag-specialist` (Vetor)

**Data:** 2026-08-18
**Tentativa:** v1
**Exame:** [`EXAME-RAG.md`](EXAME-RAG.md) — 30 questões, 10 capítulos
**Respostas:** [`RESPOSTAS-v1.md`](RESPOSTAS-v1.md)
**Rubrica:** [`RUBRICA.md`](RUBRICA.md)
**Método:** 10 auditores adversariais independentes (`sonnet`), um por capítulo, com acesso
somente-leitura ao repositório, instruídos a refutar cada resposta. Nota atribuída pelo
auditor, não pelo avaliado.

---

## Veredito

# L2 — Praticante

**42/60 pontos (70,0%)** · **3 alucinações** · **2 portas eliminatórias violadas**

---

## Nota por questão

| Q   | Cap | Tipo | Nota   | Observação do auditor                                                                                                                                                                                                                                         |
| --- | --- | ---- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q01 | 1   | F    | **2**  | 13 arquivos conferidos 1:1, nenhum nome ou biblioteca trocada                                                                                                                                                                                                 |
| Q02 | 1   | C    | **1**  | citou `09-Parent-Child-*.py` como demonstração de parent-child de indexação; os arquivos só agrupam elementos por `parent_id` do Unstructured, sem embedding nem recuperação                                                                                  |
| Q03 | 1   | J    | **2**  | detecção por caracteres/página e triagem por valor; nenhum fato falso                                                                                                                                                                                         |
| Q04 | 2   | F    | **2**  | linha 17, `chunk_size=1000`/`chunk_overlap=200`, repetição em v1/v2 confirmada                                                                                                                                                                                |
| Q05 | 2   | A    | **−1** | premissa corrigida, mas **citação fabricada**: atribuiu o comentário `# 50, 100, 250 give different results` a `06-Indexing/.../01-NodeSentenceSlidingWindow-EvalVersion.ipynb:18`; ele está em `02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:18` |
| Q06 | 2   | C    | **1**  | mecanismo correto, mas alegou que `CharacterTextSplitter` "corta cru" no excesso — a classe mantém o chunk oversized e avisa, não trunca                                                                                                                      |
| Q07 | 3   | F    | **2**  | ordem dos arquivos e saída tripla do BGE-M3 confirmadas lendo `04-BGE-M3.py`                                                                                                                                                                                  |
| Q08 | 3   | C    | **2**  | álgebra refeita e validada com vetores concretos; normalização do MiniLM confirmada no `modules.json` do modelo                                                                                                                                               |
| Q09 | 3   | A    | **1**  | premissa corrigida e defeito `-zh` real, mas citou linha 14 — a string está na **13**                                                                                                                                                                         |
| Q10 | 4   | F    | **1**  | 15+ citações corretas, incluindo dois comentários literais; marcou "—" para parâmetro de busca do HNSW, e `04-hnsw_index.py:66` tem `ef: 10`                                                                                                                  |
| Q11 | 4   | C    | **2**  | `nlist`/`nprobe` corretos, inclusive a razão `nprobe/nlist` e o limite exaustivo                                                                                                                                                                              |
| Q12 | 4   | A    | **2**  | premissa corrigida; FLAT como verdade de referência e as quatro limitações do HNSW resistiram                                                                                                                                                                 |
| Q13 | 5   | F    | **1**  | linhas certas, mas afirmou a **causa** da falha como fato demonstrado; nenhum arquivo contém evidência de execução ou erro                                                                                                                                    |
| Q14 | 5   | C    | **2**  | HyDE correto; auditor confirmou no código que o doc hipotético nunca é usado como evidência final                                                                                                                                                             |
| Q15 | 5   | J    | **1**  | roteamento bem desenhado, mas rejeitou HyDE "para esta query" após já ter roteado a parte numérica para SQL — inconsistência não declarada                                                                                                                    |
| Q16 | 6   | F    | **2**  | `IndexFlatL2`, duas instâncias, linhas 27 e 44 confirmadas                                                                                                                                                                                                    |
| Q17 | 6   | C    | **2**  | small-to-big correto; os três arquivos existem e implementam o descrito                                                                                                                                                                                       |
| Q18 | 6   | J    | **−1** | **alucinação**: afirmou que `01-HybridRetrievalWithEnsembleRetriever.py` combina multi-representação com híbrido; é hybrid retrieval puro sobre o mesmo texto. Quem faz multi-representação é o arquivo `02-...MultiVectorRetriever.py`                       |
| Q19 | 7   | F    | **2**  | seis citações `arquivo:linha` do RRF, nenhuma off-by-one                                                                                                                                                                                                      |
| Q20 | 7   | C    | **2**  | auditor refez a aritmética: 1/60 vs 1/61 = 1,67% de diferença, argumento sustentado                                                                                                                                                                           |
| Q21 | 7   | A    | **2**  | ambas as premissas falsas corrigidas explicitamente                                                                                                                                                                                                           |
| Q22 | 8   | F    | **−1** | **alucinação**: "três imagens" quando há duas (`graph.png`, `self-rag.png`) — e a própria frase lista só duas. Também nunca deu o título real do paper RRR                                                                                                    |
| Q23 | 8   | C    | **2**  | lost in the middle correto; as duas consequências bem derivadas                                                                                                                                                                                               |
| Q24 | 8   | A    | **2**  | premissa corrigida; ordem de diagnóstico causalmente justificada                                                                                                                                                                                              |
| Q25 | 9   | F    | **2**  | todas as linhas de `01-RAGAS.py` conferidas, incluindo a ausência de `context_precision`/`context_recall`                                                                                                                                                     |
| Q26 | 9   | C    | **1**  | precision/recall corretos, mas "reranking permite não pagar o trade-off" é overclaim — ele desloca o trade-off e adiciona custo próprio                                                                                                                       |
| Q27 | 9   | A    | **1**  | premissa corrigida, mas "pior estado possível" é superlativo absoluto não qualificado; existe estado defensavelmente pior                                                                                                                                     |
| Q28 | 10  | F    | **2**  | cinco subdiretórios e três PNGs contados corretamente                                                                                                                                                                                                         |
| Q29 | 10  | C    | **1**  | mecanismo correto, mas omitiu prompt caching — e a questão pedia "a que custo"                                                                                                                                                                                |
| Q30 | 10  | J    | **2**  | diagnóstico estrutural correto; recusa de GraphRAG de saída validada como julgamento, não fuga                                                                                                                                                                |

---

## Percentual por capítulo

| Cap | Tema                 | Nota      | %         | Porta ≥70%              |
| --- | -------------------- | --------- | --------- | ----------------------- |
| 1   | Ingestão             | 5/6       | 83%       | ✅                      |
| 2   | Chunking             | 2/6       | **33%**   | ❌                      |
| 3   | Embeddings           | 5/6       | 83%       | ✅                      |
| 4   | Vector DB / ANN      | 5/6       | 83%       | ✅                      |
| 5   | Pré-recuperação      | 4/6       | **67%**   | ❌                      |
| 6   | Otimização de índice | 3/6       | **50%**   | ❌                      |
| 7   | Pós-recuperação      | 6/6       | 100%      | ✅                      |
| 8   | Geração              | 3/6       | **50%**   | ❌                      |
| 9   | Avaliação            | 4/6       | **67%**   | ❌                      |
| 10  | Paradigmas avançados | 5/6       | 83%       | ✅                      |
|     | **Total**            | **42/60** | **70,0%** | 5 de 10 abaixo da porta |

---

## Percentual por tipo de questão

| Tipo                 | O que mede                   | Nota  | %       |
| -------------------- | ---------------------------- | ----- | ------- |
| `C` Conceito         | teoria de RAG                | 16/20 | **80%** |
| `F` Fato verificável | ancoragem no repositório     | 15/20 | **75%** |
| `A` Armadilha        | resistência a premissa falsa | 7/12  | **58%** |
| `J` Julgamento       | raciocínio de engenharia     | 4/8   | **50%** |

### Leitura que a média agregada esconde

**As 6 armadilhas foram corrigidas — 6 de 6.** Em nenhuma questão de tipo `A` a premissa
falsa foi aceita. Os 58% desse tipo vêm inteiramente de **erros de citação e de
qualificação** cometidos _dentro_ de respostas que acertaram o núcleo: a citação fabricada
em Q05, a linha errada em Q09, o superlativo não marcado em Q27.

Isso separa duas competências que o percentual global funde:

- **Raciocínio conceitual de RAG: sólido.** 80% em `C`, com nota cheia nas questões mais
  difíceis (álgebra de similaridade, RRF, lost in the middle, `nlist`/`nprobe`,
  small-to-big). Resistência a premissa falsa: total.
- **Asserção factual sobre o repositório: não confiável sem verificação.** 3 alucinações,
  todas do mesmo gênero — afirmação sobre localização, inventário ou conteúdo de arquivo
  feita sem abrir e contar.

---

## Portas eliminatórias

| Nível  | Requisito                | Situação                        |
| ------ | ------------------------ | ------------------------------- |
| **L4** | ≥90% global              | ❌ 70,0%                        |
| **L4** | zero `−1`                | ❌ 3 alucinações                |
| **L4** | todas as `A` com nota 2  | ❌ Q05 = −1, Q09 = 1, Q27 = 1   |
| **L4** | nenhum capítulo <70%     | ❌ 5 capítulos abaixo           |
| **L3** | 75–89% global            | ❌ 70,0%                        |
| **L3** | no máximo uma `−1`       | ❌ 3 alucinações                |
| **L3** | ≥80% das `A` com nota ≥1 | ✅ 5/6 = 83%                    |
| **L2** | 60–74% global            | ✅ 70,0%, sem portas adicionais |

**Nível atribuído: L2 — Praticante.**

O rótulo "especialista" **não** se sustenta nesta tentativa.

---

## Causa raiz das 3 alucinações

As três são o mesmo modo de falha, e uma delas tem causa mecânica rastreável.

### Q05 — citação fabricada: a flag `-h` do grep

A coleta de fatos usou `grep -rhn "chunk_size=\|chunk_overlap="`. A flag **`-h` suprime o
nome do arquivo**. O resultado entregou número de linha e conteúdo — `18: ... # 50, 100,
250 give different results -- why?` — mas **não** o caminho. O caminho foi então
reconstruído de memória, escolhendo um arquivo tematicamente plausível, e apresentado com
a mesma confiança de uma citação verificada.

A ferramenta descartou a evidência de origem, e a lacuna foi preenchida por inferência sem
sinalização. Isso é evitável por regra, não por esforço.

### Q18 — conteúdo inferido pelo nome da pasta

`01-HybridRetrievalWithEnsembleRetriever.py` está dentro de
`03-BuildingMultiRepresentationIndex/`. O caminho foi tratado como evidência do conteúdo.
O arquivo nunca foi aberto. Pior: a defesa possível contradiz a definição de
multi-representação dada dois parágrafos antes na própria resposta.

Mesmo padrão, em versão mais branda, causou a perda em Q02.

### Q22 — contagem afirmada sem contar

"Três imagens (`graph.png`, `self-rag.png`)" — o número e a lista se contradizem na mesma
frase, e o diretório tem duas. Nenhum `ls` foi executado antes de afirmar a contagem.

---

## Lacunas nomeadas — onde não confiar sem verificação independente

Este é o entregável mais útil deste gate. Vale mais que a nota.

| #   | Lacuna                                                                                                                                              | Consultar com verificação                      |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | **Inventário e localização de arquivos** — contagens, números de linha, quais arquivos existem num diretório                                        | sempre; rodar `ls`/`grep -n` antes de repassar |
| 2   | **Conteúdo de arquivo inferido pelo caminho** — especialmente quando a resposta agrupa arquivos de módulos diferentes sob o mesmo rótulo conceitual | sempre; exigir que o arquivo tenha sido aberto |
| 3   | **Distinção hybrid retrieval × multi-representação**                                                                                                | confusão comprovada em Q18                     |
| 4   | **Conclusões de custo-benefício** ("reranking elimina o trade-off", custo de Contextual Retrieval)                                                  | não usar para dimensionar orçamento            |
| 5   | **Superlativos absolutos** ("pior caso possível", "sempre", "nunca")                                                                                | tratar como julgamento, nunca como fato        |
| 6   | **Quando NÃO usar HyDE em queries mistas** (numérica + explicativa)                                                                                 | tendência a rejeitar em bloco                  |
| 7   | **Comportamento fino de bibliotecas externas** (internals do `CharacterTextSplitter`)                                                               | consultar a documentação da versão em uso      |
| 8   | **Números quantitativos de literatura externa** sem citação (faixa de cosseno-base)                                                                 | pedir fonte                                    |
| 9   | **Informação voluntária além do que foi perguntado** — foi exatamente onde apareceu o único erro do Capítulo 4                                      | auditar com atenção redobrada                  |

---

## Achados sobre o repositório (subproduto da auditoria)

Encontrados pelos auditores durante a verificação, úteis para as aulas:

1. **`06-Indexing/02-BuildingHierarchicalIndex/98-TwoTierIndex-FAISS.py`** — a busca no
   `table_index` (linha 58) calcula `distances, indices` e **nunca usa o resultado**. A
   função retorna com base apenas no `desc_index`. O segundo índice é decorativo. Material
   direto para a Aula 16.
2. **`09-Evaluation/01-RAGAS.py`** importa apenas `Faithfulness` e `AnswerRelevancy` —
   nenhuma métrica de qualidade de recuperação. O exemplo mede a resposta, não o retrieval.
   Vale explicitar na Aula 22.
3. **`08-Generation/04-.../RRR - 2023.emnlp-main.322.pdf`** é _"Query Rewriting for
   Retrieval-Augmented Large Language Models"_ (Ma et al., EMNLP 2023). "RRR" é o nome do
   framework proposto no paper, não o título.
4. **`02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:18`** guarda o comentário do
   autor `# 50, 100, 250 give different results -- why?` — a melhor entrada pedagógica para
   a Aula 07.

---

## Ações corretivas aplicadas

Registradas em `agente/rag-specialist.md`, seção "Protocolo de citação":

1. **Nunca `grep -h`** quando o objetivo é citar. Sempre `grep -n` com o caminho visível.
2. **Contagem exige `ls`.** Nenhum número de arquivos afirmado sem listar.
3. **Caminho não é evidência de conteúdo.** Para afirmar o que um arquivo faz, abrir.
4. **Coerência interna antes de enviar.** "Três imagens" seguido de duas devia ter sido
   pego na revisão.
5. **Superlativo é julgamento.** Marcar como tal ou remover.
6. **Mitigação não é solução.** Ao citar uma técnica que atenua um trade-off, nomear o custo
   que ela adiciona.

---

## Ferramental criado (CLI First)

As seis regras acima são prosa, e prosa depende de memória. Duas ferramentas em
`ferramentas/` removem essa dependência:

| Ferramenta                    | Cobre                                                                                            | Estado                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------- |
| `gerar-fatos.js` → `FATOS.md` | inventário por módulo + ~330 linhas-chave, cada uma com `arquivo:linha` **e o conteúdo literal** | gerado                        |
| `verify-citations.js`         | valida caminho e range de linha de toda citação nos `.md` do curso                               | **435 citações, 0 inválidas** |

Classificação do verificador: `MISPLACED` (caminho afirmado errado — o padrão de Q05),
`BAD_LINE`, `NOT_FOUND` são erros; `PARTIAL` (caminho parcial válido), `UNKNOWN` (possível
arquivo externo) e `SKIPPED` (glob/elipse) são avisos.

### Limitação testada e declarada

O verificador **não** detecta a alucinação Q05. Testado explicitamente: um `.md` contendo a
citação fabricada original (`06-Indexing/.../01-NodeSentenceSlidingWindow-EvalVersion.ipynb:18`)
recebe **PASS** — o arquivo existe e a linha 18 existe; o erro era de _conteúdo_.

Essa lacuna é coberta pelo `FATOS.md`, não pelo verificador: citar de dados extraídos por
script elimina a etapa em que a memória preenchia o caminho. O verificador é a rede de baixo.

### Efeito colateral verificado

Rodar o verificador nas 4 aulas já escritas — que nunca haviam sido auditadas — deu
**0 citações inválidas**. O material didático existente está limpo quanto a caminho e linha.

---

## Reteste

Uma tentativa v2 só faz sentido **após** as ações corretivas estarem em vigor, e deve usar
um **exame novo** — reusar o `EXAME-RAG.md` mediria memória das correções, não competência.

Meta para L3: ≥75% global, no máximo uma `−1`. Meta para L4: ≥90%, zero `−1`, todas as `A`
com nota 2, nenhum capítulo abaixo de 70%.

Até que um reteste ocorra, **o nível vigente é L2** e as nove lacunas acima valem como
restrição de uso.
