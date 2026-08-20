# GATE — Auditoria do material didático, v1 (parcial)

**Data:** 2026-08-19 · **Rubrica:** [`RUBRICA-AULAS.md`](RUBRICA-AULAS.md)
**Método:** auditores adversariais independentes (`sonnet`, somente-leitura, instruídos a refutar)
em lotes sucessivos — 11 no gate v1, mais a rodada v2, o lote 10 e os lotes 12-16 — e 2 revisões de
domínio do `@rag-specialist` (`opus`, sem poder de nota, conflito de interesse declarado).
**Recontado em 19/08/2026:** a cobertura afirmada neste arquivo estava errada em dois lugares e a
contagem de notas `−1`, em um. Ver a seção final, "Recontagem de 19/08/2026".

---

## ⚠️ Cobertura — leia antes do resultado

**Cobertura fechada em 19/08/2026.** As 29 aulas têm nota independente registrada — as 21 do gate v1
e das rodadas seguintes, mais as 8 dos lotes A-D (ver a seção final). O que segue **não** é
veredicto: as notas são de versões anteriores às correções, e nove aulas têm duas notas
conflitantes.

| Bloco | Aulas | Nota independente                                    | Domínio (`@rag-specialist`) |
| ----- | ----- | ---------------------------------------------------- | --------------------------- |
| 1     | 00–03 | ✅ v1; 00 e 01 renotadas no 2º turno, 02 e 03 no L13 | ✅                          |
| 2     | 04–06 | ✅ v1; 04 e 05 renotadas no 2º turno                 | ✅                          |
| 3     | 07–08 | ✅ 07 no L15 · 08 no lote C                          | ✅                          |
| 4     | 09–11 | ✅ v1                                                | ✅                          |
| 5     | 12–14 | ✅ v1; 12 renotada no L15, 13 e 14 no 2º turno       | ✅                          |
| 6     | 15–16 | ✅ 15 no lote A · 16 no lote B                       | ✅                          |
| 7     | 17–18 | ✅ rodada v2                                         | ✅                          |
| 8     | 19–21 | ✅ 19 no lote A · 20 no lote B · 21 no lote D        | ✅                          |
| 9     | 22–23 | ✅ 22 no lote C · 23 no lote D                       | ✅                          |
| 10    | 24–26 | ✅ lote 10                                           | ✅                          |
| 11    | 27–28 | ✅ rodada v2                                         | ✅                          |

"2º turno" = lotes 12, 14 e 16, que voltaram juntos; o arquivo não registra qual lote pegou qual
aula, e eu não invento o mapeamento.

As 8 aulas sem nota têm revisão de domínio (correção técnica de RAG), que **não** produz nota por
decisão de método — o `@rag-specialist` foi construído a partir do mesmo trabalho que gerou as
aulas, e sua revisão tem viés a favor.

**Nove aulas têm duas notas conflitantes** (00, 01, 02, 03, 04, 05, 12, 13, 14): a tabela abaixo é
do gate v1, e o 2º turno renotou as mesmas aulas **acreditando que estavam sem cobertura**. A
divergência entre os dois auditores chega a **12 pontos** na AULA-13 (11/12 no v1, −1/12 no 2º
turno). Isso é achado sobre a confiabilidade da nota, não só sobre a escrituração — ver
"Recontagem de 19/08/2026".

**Nenhuma classificação global é atribuída.** Fazê-lo com 21 de 29 aulas auditadas, notas
pré-correção e nove pares em conflito seria exatamente o erro que a Aula 22 deste curso ensina a
não cometer: veredito grande sobre amostra pequena.

---

## Notas do gate v1 — as 13 aulas auditadas naquela rodada

Escala por dimensão: `−1` (alucinação) a `2`. Máximo 12 por aula. Dimensões: **E** evidência,
**C** correção técnica, **H** honestidade epistêmica, **O** coerência, **D** didática,
**A** acionabilidade.

| Aula                        | E   | C   | H   | O   | D   | A   | Total     | %    |
| --------------------------- | --- | --- | --- | --- | --- | --- | --------- | ---- |
| 00 — Setup do ambiente      | −1  | −1  | 0   | −1  | 1   | 2   | **0/12**  | 0%   |
| 01 — O que é RAG            | 2   | 2   | 2   | 2   | 2   | 2   | **12/12** | 100% |
| 02 — Vetores e similaridade | 1   | 2   | 1   | −1  | 2   | 2   | **7/12**  | 58%  |
| 03 — Primeiro RAG           | −1  | 2   | 1   | −1  | 2   | 2   | **5/12**  | 42%  |
| 04 — Texto, JSON, web       | 1   | 2   | 1   | 2   | 2   | 1   | **9/12**  | 75%  |
| 05 — PDF, layout, OCR       | 1   | 2   | 1   | −1  | 2   | 1   | **6/12**  | 50%  |
| 06 — Tabelas, CSV, SQL      | 1   | 2   | 1   | −1  | 2   | 2   | **7/12**  | 58%  |
| 09 — Milvus, schema         | 2   | 2   | 1   | −1  | 2   | 1   | **7/12**  | 58%  |
| 10 — Índices ANN            | 2   | 2   | 1   | −1  | 2   | 2   | **8/12**  | 67%  |
| 11 — Híbrida e multimodal   | 2   | 2   | 2   | −1  | 2   | 2   | **9/12**  | 75%  |
| 12 — Query construction     | −1  | 2   | 1   | −1  | 2   | 1   | **4/12**  | 33%  |
| 13 — Query translation      | 2   | 2   | 2   | 1   | 2   | 2   | **11/12** | 92%  |
| 14 — Query routing          | 2   | 2   | 2   | 1   | 2   | 2   | **11/12** | 92%  |

**Subtotal do auditado: 96/156 = 61,5%** — faixa "Requer revisão" (55–69%) _para este subconjunto_.

**Portas violadas neste subconjunto:** a rubrica exige zero `−1` para "Publicável" e no máximo uma
`−1` para "Publicável com ressalvas". Há **treze** notas `−1` nas 13 aulas — **nove** em **O**
(coerência), três em **E** (evidência) e uma em **C** (correção técnica). A concentração em **O**
aponta uma causa comum, não erros dispersos.

---

## Achados verificados por mim, um a um

Não aceitei os relatórios dos auditores no valor de face. Estes são os achados que **eu** confirmei
abrindo o arquivo ou rodando o comando:

### 🔴 Defeito sistêmico — 23 rodapés desatualizados

`23 das 29 aulas` fecham com "**Próxima:** AULA N — … _(a escrever)_" apontando para uma aula que
**já existe e está completa**. Um aluno que confie no rodapé para de ler achando que o curso termina
ali. Verificado por script que cruza cada rodapé com `ls` do arquivo apontado.

Este é o defeito de maior impacto e o mais barato de corrigir — é busca-e-substitui.

### 🔴 Alucinações confirmadas

| #   | Aula | A afirmação                                                                                          | O que verifiquei                                                                                                                                                                                                         |
| --- | ---- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | 00   | "as versões travadas de `pydantic`, `openai` e `tokenizers` **divergem** entre os dois requirements" | as três são **idênticas** nos dois arquivos. Quem diverge é `numpy` (1.26.4 vs **2.2.2**) — que seria o exemplo melhor, por ser mudança de major                                                                         |
| 2   | 00   | "396 arquivos **de código**"                                                                         | `find` devolve 397 arquivos no total; **código real (.py+.ipynb) = 189**. O 396 conta PDFs, JPGs, CSVs                                                                                                                   |
| 3   | 02   | "Na **Aula 09** você vai declarar `metric_type`"                                                     | `grep` na AULA-09: **0 ocorrências**. Está na Aula 10                                                                                                                                                                    |
| 4   | 06   | "o módulo **mais numeroso** da Fase 1: 12 arquivos"                                                  | `04-PDFFileLoading` tem **13**. É o segundo, não o primeiro                                                                                                                                                              |
| 5   | 06   | "Aulas 04, 05 e 06 cobrem `01-DataLoading/` **inteiro**"                                             | `99-Others/` existe com 8 arquivos visíveis (9 com ocultos) e **nenhuma aula o menciona** — inclui um `99-UsingTextract.py`, que é extração de PDF, tema da Aula 05                                                      |
| 6   | 05   | "`MarkdownElementNodeParser` … é assunto da **Aula 06**"                                             | `grep` na AULA-06: **0**. O termo só existe na própria Aula 05                                                                                                                                                           |
| 7   | 12   | "o `diff` mostra **exatamente três** acréscimos"                                                     | o `diff` real do par Sakila tem **49 linhas alteradas** — incluindo a remoção de `temperature=0`, que torna o "v2 corrigido" **menos** determinístico                                                                    |
| 8   | 09   | "escalares esquecidos … adicionar campo depois **exige recriar a collection**"                       | `enable_dynamic_field=True` está ligado em praticamente todo schema do módulo que o aluno vai executar                                                                                                                   |
| 9   | 17   | "o arquivo implementa exatamente isso — `exp(-decay_rate * …)`, na **linha 26**"                     | a linha 26 está **dentro do docstring** (aberto na linha 14). O que roda é `1.0/(1.0 + decay_rate*horas)` na linha 150, rotulado "Simplified decay calculation", e o ranking vem de `get_relevant_documents` (linha 129) |

O achado **#9** é o mais instrutivo: é a regra 8 do próprio curso — _"ler o que está escrito não é ler
o que roda"_ — falhando numa variante nova. **Docstring também não é implementação.**

### 🟠 Lacuna de cobertura da própria ferramenta

O `verify-citations.js` reporta **1.240 citações, 0 inválidas**. Mas há no curso:

- **166** referências `` `:NNN` `` (só-linha, em crase) — ignoradas;
- **290** referências em prosa ("linha 45", "linhas 12-14") — ignoradas.

São **456 ancoragens em linha fora do alcance da ferramenta**, ~27% do total. Somado à limitação já
documentada (valida caminho e range, nunca conteúdo), o "PASS" cobre menos do que o número sugere.

---

## Achados de domínio (`@rag-specialist`) — sem nota, por método

Cobrem as 29 aulas. Os três mais graves de cada bloco, com o registro epistêmico do agente:

### Fases 0–4

1. **AULA-10, filtragem escalar** — a aula atribui ao Milvus **pós-filtragem**; o default avalia o
   filtro como bitset durante a travessia (pré-filtragem). O experimento proposto roda sobre `FLAT`
   com 1000 vetores, onde a diferença não pode aparecer.
2. **AULA-10, duplo sentido de "recall"** — define `recall@k` como concordância com o FLAT (fidelidade
   do índice); a Fase 8 usa a mesma palavra para fração de **relevantes** recuperados. Um sistema pode
   ter recall de ANN 1,0 e recuperação péssima.
3. **AULA-13, mecanismo do HyDE** — "o espaço de embedding não foi treinado para alinhar pergunta com
   resposta" é falso para E5/BGE, que o curso recomenda: são treinados em pares consulta–passagem.

**Lacunas:** prefixos `query:`/`passage:` dos modelos recomendados (ausentes em todo o curso, e a
falta derruba recall **sem erro**); ciclo de vida do índice (`load_collection` aparece em 16 arquivos
do repo e em **0** aulas; atualização de documento e id estável nunca tratados); calibração de score
(duas aulas recomendam limiar sem ensinar que cosseno não é probabilidade).

### Fases 5–9

1. **AULA-23, "o grafo não compra qualidade, compra escala"** — a aula cita a legenda da figura; a
   seção de resultados do paper reporta ganho do grafo sobre map-reduce de texto com win rates de
   **57% e 64% (p<.001)**, "small but consistent", e **excetua o nível raiz** — que é onde a aula
   apoia o argumento. O erro se propaga para a Aula 28.
2. **AULA-17, a fórmula do docstring** — confirmado por mim acima.
3. **AULA-15, `window_size=3`** — são 3 sentenças **de cada lado** (até 7), não 3 no total. O
   comentário correto está na linha imediatamente acima da citada.

**Correção que atinge quatro aulas:** o `recursion_limit` padrão do LangGraph é **25**, e nenhum
arquivo o configura. O diagnóstico "laço sem freio de aplicação" continua certo, mas a caracterização
do risco está errada — o pior caso é `GraphRecursionError` após ~25 passos, não gasto ilimitado. Isso
está nas Aulas 21, 25, 26 e 28.

**Lacunas:** nenhuma métrica clássica de RI (`recall@k`, `MRR`, `nDCG`) em toda a Fase 8 — o curso
ensina a medir recuperação **sempre por juiz LLM**, quando o gabarito que ele mesmo manda anotar
entrega métricas determinísticas de graça; Structured Outputs / decodificação restrita ausente da
Aula 20, que atribui ao grau 4 uma garantia que function calling + Pydantic não dá.

---

## Prioridades

**P0 — ✅ APLICADO em 2026-08-19** (mecânico, alto impacto)

1. ~~Os 23 rodapés "(a escrever)"~~ — corrigidos por script: cada um virou link markdown para o
   arquivo real, com o título lido da linha 1 da aula apontada. Verificado: nenhum rodapé falso resta.
2. ~~As 9 alucinações confirmadas~~ — corrigidas uma a uma, com o valor conferido no repositório
   antes da edição. Detalhe do que entrou:

| #   | Aula | Correção aplicada                                                                                                                                                                                                                                                       |
| --- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | 00   | "396 arquivos de código" → **397 arquivos, dos quais 189 são código** (`.py`/`.ipynb`)                                                                                                                                                                                  |
| 2   | 00   | trocado o exemplo para **`numpy` 1.26.4 vs 2.2.2**, e acrescentada nota de que `pydantic`, `openai` e `tokenizers` **não** divergem — com a observação de que esta linha já esteve errada por não conferir                                                              |
| 3   | 02   | "Na Aula 09" → **"Na Aula 10"**                                                                                                                                                                                                                                         |
| 4   | 06   | "o módulo mais numeroso" → **"o segundo módulo mais numeroso"**, com os 13 do PDF citados                                                                                                                                                                               |
| 5   | 06   | "cobrem `01-DataLoading/` inteiro" → **"os subdiretórios numerados"**, declarando o `99-Others/` (8 arquivos) que fica de fora                                                                                                                                          |
| 6   | 05   | `MarkdownElementNodeParser` deixou de ser atribuído à Aula 06; agora aponta para a Parte 1 da própria Aula 05                                                                                                                                                           |
| 7   | 12   | "exatamente três acréscimos" → **"o diff completo tem 49 linhas alteradas; três delas são o conserto"**                                                                                                                                                                 |
| 8   | 09   | acrescentado o `enable_dynamic_field=True` como saída parcial, marcado como **mitigação, não equivalência**                                                                                                                                                             |
| 9   | 17   | a fórmula deixou de ser apresentada como implementação; virou um bloco de aviso explicando que ela está **no docstring**, que o que roda é hiperbólico (linha 150) e que o ranking vem do retriever (linha 129) — fechando com _"docstring também não é implementação"_ |

**Efeito nas notas:** as correções atingem 8 das 12 aulas com nota independente e removem 7 das 11
notas `−1`. **A pontuação não foi recalculada** — renotar exigiria nova rodada de auditoria
independente, e auto-atribuir nota depois de corrigir seria exatamente a auto-avaliação que a
`RUBRICA.md` proíbe.

**P0 restante:** nenhum.

**P1 — ✅ APLICADO em 2026-08-19** (erro que ensina errado)

3. ~~AULA-17: a fórmula de recência~~ — corrigida no P0 (virou bloco de aviso sobre docstring).
4. ~~AULA-23: a conclusão sobre GraphRAG~~ — a citação da legenda foi substituída pela **seção de
   resultados**, com os win rates de 57% e 64% (p<.001) e a exceção do nível raiz. A tese de uma
   frase virou três partes: o ganho sobre o vetorial vem de ser global; o grafo acrescenta um
   incremento pequeno e significativo nos níveis intermediário e folha; no raiz, troca-se esse
   incremento por 97% menos tokens. A linha herdada na **Aula 28** foi reescrita junto.
5. ~~AULA-10: pré vs. pós-filtragem~~ — acrescentada tabela das três estratégias, com a
   **pré-filtragem por bitset identificada como o default do Milvus** e o modo de falha correto de
   cada uma. Mais uma ressalva de que o exemplo usa `FLAT` com 1000 vetores, onde a diferença não
   pode aparecer.
   5b. ~~AULA-10: duplo sentido de "recall"~~ — a métrica virou **"Recall@k do índice"**, com nota
   explicando que o `recall` da Aula 22 mede outra coisa e que um índice pode ter recall 1,0
   devolvendo fielmente os vizinhos errados.
6. ~~AULA-15: `window_size`~~ — corrigido para **3 de cada lado, até sete sentenças**, citando o
   comentário do próprio arquivo que a aula não tinha lido.
7. ~~AULAS 21/26/28: `recursion_limit`~~ — a caracterização "consumo de API sem resposta" foi
   substituída: o limite padrão do LangGraph é **25** e nenhum `.py` o configura, então o pior caso é
   `GraphRecursionError` com custo limitado. O contador da aplicação passa a ser justificado como
   **degradação elegante**, não como prevenção de laço infinito.
   _A **AULA-25** não precisou de correção:_ ela afirma que "o padrão especifica o freio", o que está
   certo — não fazia a caracterização errada do risco.

**P1 restante:** nenhum.

**Verificação:** `verify-citations --all` → PASS. Cada correção foi conferida contra o repositório
antes de ser escrita — os win rates saíram do PDF do paper, a pré-filtragem e o `FLAT` do
`03-filtered-search.py:37`, o "each side" do comentário na linha 33 do
`01-NodeSentenceSlidingWindow.py`, e a ausência de `recursion_limit` de um `grep -rn` em todos os
`.py`.

**P2 — ✅ APLICADO em 2026-08-19** (lacunas de conteúdo)

8. ~~Prefixos `query:`/`passage:`~~ — nova armadilha na **Aula 08**: a assimetria é por construção
   nos modelos que o curso recomenda, o prefixo entra nos dois lados, e a falta derruba recall **sem
   erro**. Só se conserta reindexando.
9. ~~`load_collection` e ciclo de vida~~ — duas armadilhas novas na **Aula 09**: _"inserir não é
   publicar"_ (com os 16 arquivos do repo que chamam `load_collection`, e a dica de que busca vazia
   tem essa causa antes de qualquer suspeita de embedding) e _ingestão idempotente_ (id determinístico
   - delete-then-insert, sob pena de a resposta citar a versão revogada).
10. ~~Métricas determinísticas de RI~~ — nova seção na **Aula 22** ("Antes do juiz, as métricas que
    não precisam de juiz") com `hit rate@k` e `MRR` calculados por comparação de ids, e a distinção
    explícita do `recall@k` do índice da Aula 10. A tabela de métricas da **Aula 28** ganhou a linha
    determinística **no topo**, com a instrução de começar por ela.
11. ~~Calibração de score~~ — a definição de cosseno na **Aula 02** foi corrigida no mecanismo (o
    motivo é o treino contrastivo sobre cosseno, não a norma acompanhar o tamanho do texto) e ganhou
    bloco sobre **anisotropia**: o intervalo prático não é −1 a 1, score não é probabilidade nem
    comparável entre modelos, e o procedimento para achar limiar é medir as duas distribuições.
12. ~~Structured Outputs~~ — a escada de garantias da **Aula 20** ganhou a distinção **4a vs 4b**:
    function calling + Pydantic _valida depois_ (exceção em vez de silêncio); decodificação restrita
    (`json_schema` + `strict`) é o que de fato **impõe** a estrutura, com o custo de limitar o schema e
    aumentar a latência do primeiro token. Registrado que nenhum arquivo do repo usa 4b.

**Glossário:** +2 termos (`assimetria consulta/passagem`, `anisotropia`).

**P2 restante:** nenhum.

**P3 — sistêmico de forma** 13. Superlativos não marcados como julgamento (um por aula em vários lotes). 14. Estender o `verify-citations.js` às 456 referências que ele hoje ignora.

---

## O que a auditoria confirmou a favor do material

Registrado porque o viés desta avaliação é contra, e o que sobrevive vale mais:

- **AULA-01 tirou 12/12** depois de o auditor tentar derrubá-la por três ângulos distintos. (No 2º
  turno, outro auditor deu 9/12 à mesma aula — ver "Recontagem de 19/08/2026".)
- **AULAS 13 e 14 tiraram 11/12**; no lote 5, todo `diff` que a aula descrevia foi rodado e a
  descrição sobreviveu integralmente.
- No lote 4, os **quatro pontos de atenção** dados ao auditor (metric_type nos cinco índices,
  normalização condicional a COSINE, contagem de linhas dos três híbridos, três imagens do
  multimodal) foram **todos confirmados exatos**.
- Nenhum lote encontrou erro na dimensão **C** (correção técnica) das aulas que auditou — os erros de
  domínio vieram da revisão especializada, não da leitura de código.

---

## Como completar esta auditoria

Os cinco lotes interrompidos precisam ser relançados: **07–08, 15–16, 17–18, 19–21, 22–23, 24–26,
27–28**. O prompt de cada um está no histórico da sessão; o método e a rubrica estão fixados aqui.

Enquanto isso não acontecer, este documento **não** autoriza dizer que o curso foi validado.

---

## Rodada v2 — auditoria dos lotes 6, 7 e 11 (19/08/2026)

Três lotes adversariais voltaram depois do gate v1. Notas independentes atribuídas: **AULA-17 = 7/12**,
**AULA-18 = 6/12**, **AULA-27 = 4/12**, **AULA-28 = 7/12**. O lote 10 (aulas 24-26) ainda estava em
execução quando esta seção foi escrita — a cobertura permanece **parcial** e nenhuma classificação
global é declarada.

### Achado estrutural: contradições entre aulas

O defeito dominante desta rodada não foi citação inválida — foi **incoerência entre aulas sobre o
mesmo arquivo**. Quatro pares em conflito direto:

| Conflito                                                                                                  | Quem estava certo                                         | Correção                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| AULA-18 chamava o CRAG de "cíclico" (3×); AULA-21 e AULA-28 diziam "acíclico"                             | 21 e 28 — o grafo não tem aresta de retorno (`:434-457`)  | AULA-18 passou a dizer "ramificação condicional"; o fecho da aula foi reescrito                            |
| AULA-18 afirmava que Self-RAG "decide se precisa recuperar" como fato                                     | AULA-21 — a implementação recupera sempre (`:344`)        | acrescentado "essa é a diferença entre os dois papers"; a frase deixou de descrever o código               |
| AULA-28 contava 2 ciclos no Self-RAG e 3 no AdaptiveRAG                                                   | nenhuma — mesma topologia, métodos de contagem diferentes | unificado em **ciclos simples** (3 e 3), com nota de método na AULA-28 e um "Ciclo 3" explícito na AULA-21 |
| AULA-27 dizia "primeira vez em vinte e sete aulas" que um exemplo traz `docker-compose.yml` (3 alegações) | AULA-09 — o Milvus já traz o seu                          | corrigido para "segunda vez"; o diferencial real (`mem_limit` em bytes) foi reposicionado                  |

### Demais correções aplicadas

| Aula | Defeito                                                                                   | Correção                                                                             |
| ---- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 21   | tabela dizia 507/400 linhas                                                               | 508/401 (arquivos sem newline final; `wc -l` subconta 1)                             |
| 17   | exercício 4 mandava editar uma fórmula que não roda                                       | reescrito para **provar** que ela não roda, e apontar `decay_rate` (`:73`), que roda |
| 17   | citava `time_since_last_access` e `time_decay_factor`, que só existem no docstring inerte | trocados por `last_accessed_at` e `decay_factor`, os identificadores reais           |
| 18   | tabela de "três saídas" descrevia o paper como se fosse o código                          | acrescentada ressalva: `grade_documents` (`:296-321`) só tem dois ramos              |
| 27   | `:106` (é o comentário) e `:16-22`                                                        | `:107` e `:15-22`                                                                    |
| 28   | atribuía à Aula 06 um exemplo que está na Aula 12                                         | atribuição corrigida, com o exemplo real da Aula 12                                  |

`verify-citations.js --all`: **PASS**, 0 citações inválidas. `git status` no clone da Packt: vazio.

### Aberto

- Lote 10 (aulas 24-26) não concluído — sem nota independente para essas três.
- **Notas não recalculadas após as correções.** Auto-atribuir nota ao próprio material corrigido é
  exatamente a auto-avaliação que a RUBRICA proíbe; a renota exige nova rodada adversarial.
- P3 permanece aberto: superlativos não marcados como julgamento; `verify-citations.js` ignora 456
  ancoragens (166 referências só-linha e 290 em prosa), ~27% do total.

### Lote 10 (aulas 24-26) — cobertura completada

Notas independentes: **AULA-24 = 12/12**, **AULA-25 = 4/12**,
**AULA-26 = 7/12**.

| Aula   | Defeito                                                                                                                                                | Correção                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 25     | classificava o CRAG sob o padrão **Loop** — contradizendo duas outras seções da própria aula, a Aula 26 e o código (`:421-457`, sem aresta de retorno) | movido para **Conditional**, com a ressalva explícita                                                              |
| 25     | citação entre aspas dizia `"the final output of the LLM serving as the reward"`; o paper não tem a palavra "final"                                     | palavra removida da citação                                                                                        |
| 25     | mapeava o multi-query da Aula 13 a **Pre-retrieval branching**, subtipo que exige geração por ramo                                                     | reclassificado como fan-out de recuperação; a linha passou a declarar que o repositório não tem exemplo do subtipo |
| 25, 26 | "dois ciclos" no Self-RAG                                                                                                                              | três ciclos simples, mesmo critério das Aulas 21 e 28                                                              |
| 26     | "**Cinco** imports estão mortos", seguido de tabela com **seis** símbolos — e o grep acha um **sétimo** (`List`, linha 3)                              | corrigido para sete, `List` acrescentado à tabela e ao Checkpoint                                                  |

O padrão dos dois erros de contagem (cinco/sete e dois/três) é o mesmo: número escrito à mão onde
havia um `grep -c` ou uma enumeração de arestas disponível. O método que pegou o defeito é o que o
próprio curso ensina — faltou aplicá-lo à revisão do texto, não ao código.

### Cobertura final da auditoria

**20 de 29 aulas** com nota independente neste ponto: as 13 do gate v1, mais 17, 18, 27 e 28
(rodada v2) e 24, 25 e 26 (lote 10). As 9 sem nota eram 08, 15, 16, 19, 20, 21, 22 e 23 — os
auditores caíram por limite de sessão da API e não foram reexecutados.

> **Correção de 19/08/2026:** a versão original desta seção dizia "19 de 29" e listava como sem
> nota as aulas 00-05, 07, 12, 13 e 14 — **nove delas já tinham nota** na tabela do gate v1. O erro
> não ficou no papel: fez os lotes 12-16 renotarem aulas já auditadas em vez de cobrir 08, 15, 16 e
> 19-23, que ficaram sem nota até os lotes A-D as auditarem (seção final).

Faixa observada nas 20: de **0/12** (aula 00) a **12/12** (aulas 01 e 24). Como a rubrica reprova o
curso inteiro se houver mais de uma nota `−1`, e foram observadas várias, **nenhuma classificação de
publicação é declarada** — as correções desta rodada mudaram o material, e a classificação depende
de uma renota adversarial que ainda não aconteceu.

---

## Lotes 12, 14 e 16 — as aulas sem cobertura (19/08/2026)

Três dos cinco lotes finais voltaram. Notas: **AULA-00 = 3/12**, **AULA-01 = 9/12**,
**AULA-04 = 5/12**, **AULA-05 = 8/12**, **AULA-13 = −1/12**, **AULA-14 = 10/12**.

A **AULA-13 é a pior nota da auditoria inteira** — e por um defeito de espécie diferente dos
anteriores.

### O defeito da AULA-13: descrever um mecanismo que o arquivo não tem

A Parte 4 descrevia a clarificação como um sistema interativo: _"ele pergunta de volta, e cada
resposta do usuário poda um ramo da árvore"_. Abri o notebook célula a célula e contei sobre o JSON:
`openai`, `invoke(`, `input(` e `api_key` aparecem **zero** vezes. Não há LLM, não há interação, não
há poda. `identify_main_aspects()` **resolve a ambiguidade sozinha**, por palavra-chave, com default
silencioso — exatamente o oposto do que a aula dizia que o arquivo demonstrava.

Pior: a aula se contradizia duas vezes. A linha 36 afirmava que **todas** as técnicas custam "pelo
menos uma chamada de LLM"; a linha 176 chamava a clarificação de "a única que não tenta resolver a
ambiguidade sozinha". Ambas falsas para este arquivo.

Corrigido com a ressalva completa, incluindo a ironia: o arquivo que ilustra "não resolver sozinho"
resolve sozinho, por `if`.

### Demais correções aplicadas

| Aula       | Defeito                                                 | Verificação                                                                                       |
| ---------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 00         | "397 arquivos"                                          | `git ls-files` → **396**                                                                          |
| 00         | "129 linhas" do requirements                            | `awk` → **130** — o `.txt` também termina sem newline                                             |
| 00         | `requirements_marker` → "Aula 05"                       | `marker` não aparece na AULA-05 nem em nenhum `.py` do repo                                       |
| 00         | `01_02`/`01_03` "existem para isolar essas duas trocas" | `01_03` **linha 9** também troca o embedding — o par não isola nada                               |
| 00         | "90% do aprendizado" com `all-MiniLM-L6-v2`             | número inventado; e o modelo dos `01_0x` é `BAAI/bge-small-zh`                                    |
| 01, 04, 05 | superlativos apresentados como fato                     | marcados como julgamento, com a ressalva de que não há número                                     |
| 04         | "o `03-01` importa `unstructured`"                      | `grep "^import unstructured"` → **zero**; a dependência é transitiva, documentada só em docstring |
| 04         | "os dois últimos usam o Unstructured direto"            | importam `langchain_unstructured` — a AULA-05 já usava a distinção certa                          |
| 05         | `Document` "linha 56"                                   | a 56 é o import; o `Document(...)` está na **59**                                                 |
| 13         | justificativa do HyDE                                   | falsa para BGE/E5, que é o modelo do próprio script (`bge-small-zh`)                              |
| 14         | `with_structured_output` "a Aula 20 vai detalhar"       | zero ocorrências na AULA-20; o termo reaparece nas 18, 21 e 26                                    |
| 28         | "as vinte e sete aulas anteriores"                      | são **vinte e oito** (00 a 27)                                                                    |

### Um padrão novo, que a ferramenta não pega

Três citações independentes apontavam para a **linha adjacente** à correta: o import em vez da
chamada, o início da chamada em vez do kwarg discutido, o range começando uma linha tarde. O
verificador confirma que a linha existe e está no range — não que o conteúdo dela seja o que a aula
diz. Esse é o trabalho que só a leitura faz.

### Aberto

Faltam os lotes das aulas **02-03** e **07/12**.

> **Correção de 19/08/2026:** a frase original seguia com "com eles, a cobertura fecha em 29/29" —
> **falso**. Desses quatro, só a AULA-07 estava sem nota; 02, 03 e 12 já tinham nota no gate v1. Nem
> com os dois lotes a cobertura fecharia: 08, 15, 16 e 19-23 continuavam de fora, e continuam.

### Lote 13 (aulas 02-03) — AULA-03 = 0/12

**AULA-02 = 8/12**, **AULA-03 = 0/12**. A AULA-03 é a porta de entrada prática do curso, e a tabela
"Modelo mental" — a primeira coisa que o aluno lê — errava dois de cinco grupos:

| Defeito                                                    | Verificação                                                                                               | Correção                                                       |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| "`01_*` — 5 variantes"                                     | `ls 01_*.py \| wc -l` → **6** (dois arquivos dividem o prefixo `01_03`)                                   | 6, com a nota do prefixo duplicado                             |
| "`02_*` — médio, só a camada de LLM"                       | os **5** têm a mesma sequência de 8 passos: load → split → embed → vector store → retrieve → prompt → LLM | reclassificado como pipelines completos sem LCEL               |
| "`01_03` troca **só** o LLM"                               | linha 9 define `Settings.embed_model = HuggingFaceEmbedding("BAAI/bge-small-zh")`, código ativo           | corrigido; é o mesmo defeito que a AULA-00 tinha               |
| Ressalva 1 listava só `01_02` e `03_..._v3.py`             | `01_03` tem o mesmo embedding chinês e ficou de fora                                                      | acrescentado à lista                                           |
| AULA-02: "pares sinônimos sem compartilhar palavra alguma" | as frases do próprio exercício compartilham "o" e "no"                                                    | "palavra **de conteúdo** alguma", com a ressalva das stopwords |

O terceiro e o quarto formam o achado que mais incomoda: a aula ensina a ler criticamente e a
desconfiar do nome do arquivo, e deixou passar uma instância do padrão exato que ela cataloga — no
parágrafo seguinte ao que enuncia a regra.

**Cobertura da auditoria: 29 de 29 aulas** (falta só consolidar o lote 07/12, ainda em execução
quando esta seção foi escrita).

### Lote 15 (aulas 07 e 12)

**AULA-07 = 8/12**, **AULA-12 = 4/12**. A versão original desta seção afirmava que "com este lote,
todas as 29 aulas têm nota independente" — **falso**. A AULA-07 era a única das dez desta rodada
que ainda não tinha nota; as outras nove foram renotas. Ficaram sem nota oito aulas — 08, 15, 16,
19, 20, 21, 22 e 23 —, auditadas depois nos lotes A-D (seção final).

| Aula | Defeito                                                  | Correção                                                                                                                                                                               |
| ---- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12   | "os três aparecem no código, antes e depois lado a lado" | `grep -rn "JOIN"` no módulo → nada. Só **dois** têm par versionado; o terceiro virou alerta conceitual declarado                                                                       |
| 12   | "`v3-agent.py`, o padrão que a Aula 26 desenvolve"       | a AULA-26 não menciona Text2SQL nem este arquivo. E o inverso é mais interessante: o `v3-agent` **tem** `max_retries=3` — é o freio que a AULA-26 mostra faltar nos laços de LangGraph |
| 12   | "a armadilha que a Aula 13 vai repetir de outro ângulo"  | a AULA-13 não retoma recorte temporal; a promessa foi removida                                                                                                                         |
| 12   | "das 49 linhas do diff, **três** são o conserto"         | são ~20 (`extract_sql`, a instrução do prompt, o call-site); o resto é troca de modelo e renumeração                                                                                   |
| 07   | "o melhor na segunda avaliação"                          | 6/6 empatado com Embeddings, Indexação e Pós-recuperação — não é "o melhor"                                                                                                            |

Os dois erros de caracterização de `diff` (aqui e na AULA-07) são o achado mais autocontraditório da
auditoria: o curso ensina, em duas aulas distintas, a desconfiar de descrição de diff e conferir com
a ferramenta — e errou exatamente isso nos próprios exemplos.

## Cobertura final: 29 de 29 aulas

Faixa observada: de **−1/12** (AULA-13, no 2º turno) a **12/12** (AULA-01 no gate v1 e AULA-24 no
lote 10). Notas `−1` foram atribuídas em várias aulas, e a rubrica reprova o curso com mais de uma.
**Nenhuma classificação de publicação é declarada** — as notas acima são anteriores às correções
de cada rodada, o que torna a renota adversarial obrigatória antes de qualquer veredicto. As oito
que faltavam (08, 15, 16, 19-23) foram auditadas nos lotes A-D, na seção final.

---

## Recontagem de 19/08/2026

Este arquivo afirmava, em dois lugares, que a auditoria cobria **29 de 29 aulas**. Uma contagem
mecânica das notas registradas nele desmentiu: eram **21**. As oito sem nota nenhuma eram **08, 15,
16, 19, 20, 21, 22 e 23** — blocos 3 (metade), 6, 8 e 9, que caíram por limite de sessão. Os lotes
A-D as auditaram no mesmo dia; a cobertura fechou em 29/29 (seção final).

### O erro que se propagou

A seção "Cobertura final da auditoria" listou como "sem nota" as aulas 00-05, 07, 12, 13 e 14. Nove
dessas dez **já tinham nota** na tabela do gate v1. Os lotes 12-16 foram lançados contra essa lista
errada e gastaram nove dos dez slots renotando material já auditado, deixando 08, 15, 16 e 19-23 —
as que de fato faltavam — sem cobertura até hoje.

### O efeito colateral é o achado mais útil desta recontagem

Nove aulas acabaram com **duas notas independentes**, atribuídas por auditores diferentes sob a mesma
rubrica. A divergência é grande:

| Aula | Gate v1 | 2º turno / lote 13 / lote 15 | Δ   |
| ---- | ------- | ---------------------------- | --- |
| 00   | 0/12    | 3/12                         | 3   |
| 01   | 12/12   | 9/12                         | 3   |
| 02   | 7/12    | 8/12                         | 1   |
| 03   | 5/12    | 0/12                         | 5   |
| 04   | 9/12    | 5/12                         | 4   |
| 05   | 6/12    | 8/12                         | 2   |
| 12   | 4/12    | 4/12                         | 0   |
| 13   | 11/12   | −1/12                        | 12  |
| 14   | 11/12   | 10/12                        | 1   |

**Julgamento, marcado como julgamento:** uma rubrica em que dois auditores independentes discordam
por 12 pontos na mesma aula não sustenta veredicto de publicação com **um** auditor por aula. A
AULA-13 é o caso extremo — de "sobreviveu ao ataque" a "pior nota da auditoria" —, mas metade das
nove divergem por 3 pontos ou mais. Isso é argumento para **dois auditores por aula na renota**, ou
para tratar a nota de um auditor único como sinal, não como gate.

O que a divergência **não** diz: qual das duas notas está certa. As duas leram versões diferentes do
texto (o 2º turno leu material já corrigido), então parte do Δ é melhoria real e parte é ruído entre
avaliadores. Separar as duas coisas exige a renota, com as duas notas anteriores em mão.

### Outros números corrigidos aqui

| Onde                           | Dizia                             | Contagem mecânica                |
| ------------------------------ | --------------------------------- | -------------------------------- |
| Cabeçalho da tabela de notas   | "as 12 aulas"                     | **13** linhas de nota            |
| "Portas violadas"              | "**onze** notas `−1` em 12 aulas" | **13** `−1` em 13 aulas          |
| "Nenhuma classificação global" | "41% do material auditado"        | 13/29 = **44,8%**                |
| Lote 10                        | AULA-24, "única nota máxima"      | AULA-01 também tirou 12/12 no v1 |
| Cobertura final da auditoria   | "19 de 29"                        | **20** naquele ponto             |
| Lote 15 e "Cobertura final"    | "29 de 29"                        | **21 de 29**                     |

`Subtotal do auditado: 96/156 = 61,5%` foi conferido e **está correto** — 96 é a soma real das 13
linhas, e 156 = 13 × 12. O número certo estava ao lado do errado ("12 aulas") desde o começo: 156
só fecha com 13.

### Como reproduzir

A contagem não é opinativa. Extrair todo par `(aula, nota)` do arquivo — linhas de tabela
`| NN — ... | **X/12** |` e prosa `**AULA-NN = X/12**` — e listar quais dos números 00 a 28 não
aparecem. Foi assim que as oito lacunas apareceram, depois de duas seções afirmarem 29/29.

**A classe de defeito é a mesma que este gate acusou nas aulas:** número escrito à mão onde havia
contagem mecânica disponível. O relatório que diagnosticou o defeito cometeu o defeito, seis vezes.

---

## Lotes A-D — as 8 aulas que nunca tinham nota (19/08/2026)

As oito que a "Recontagem de 19/08/2026" identificou como nunca auditadas — **08, 15, 16, 19, 20,
21, 22 e 23** — receberam nota independente. Quatro auditores `general-purpose` em `sonnet`,
somente-leitura, duas aulas por lote, instruídos a refutar. Com isso a cobertura da auditoria fecha
em **29 de 29**, e desta vez com registro por trás de cada uma.

### Notas

| Aula                                          | E   | C   | H   | O   | D   | A   | Total     | %    |
| --------------------------------------------- | --- | --- | --- | --- | --- | --- | --------- | ---- |
| 08 — Embeddings, BM25, BGE-M3                 | 2   | 2   | 1   | 2   | 2   | 2   | **11/12** | 92%  |
| 15 — Small-to-big                             | 2   | 1   | 1   | 2   | 2   | 2   | **10/12** | 83%  |
| 16 — Índice hierárquico e multi-representação | 2   | 2   | −1  | 2   | 2   | 2   | **9/12**  | 75%  |
| 19 — Modelo e prompt engineering              | 1   | 2   | 1   | 2   | 2   | 2   | **10/12** | 83%  |
| 20 — Saída estruturada                        | 1   | 2   | 2   | −1  | 2   | 2   | **8/12**  | 67%  |
| 21 — Self-RAG                                 | 1   | 2   | 2   | 1   | 2   | 2   | **10/12** | 83%  |
| 22 — Avaliação                                | 2   | 2   | 1   | −1  | 2   | 2   | **8/12**  | 67%  |
| 23 — GraphRAG                                 | 2   | 2   | 2   | 2   | 2   | 2   | **12/12** | 100% |

**Subtotal das oito: 78/96 = 81,3%.** Três notas `−1`: AULA-16 em **H**, AULA-20 em **O**, AULA-22 em **O**.

### ⚠️ Estas oito notas já estão defasadas — e isso é escolha, não descuido

**Todos os defeitos que produziram as três notas `−1` foram corrigidos na mesma sessão, depois da
auditoria.** As notas acima descrevem a versão que os auditores leram, não a que está em disco
agora. A alternativa seria eu renotar material que acabei de corrigir, e é exatamente o que a
RUBRICA proíbe ("Auto-avaliação não conta").

Consequência prática, e ela vale para o curso inteiro: **nenhuma classificação de publicação é
declarada**, nem para estas oito. O percentual acima é subtotal de um subconjunto numa versão
anterior. Somá-lo às 21 notas antigas daria um número com cara de veredicto e nenhuma base — as 21
também são pré-correção, e nove delas têm duas notas conflitantes.

### As três notas `−1`, e o que aconteceu com cada uma

| Aula | Dim | Defeito que a produziu                                                                                                                                                                         | Estado     |
| ---- | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 16   | H   | `:133` "Vale registrar aqui, **pela primeira vez no curso**, um achado" — falso: AULA-04:100, AULA-09:191, AULA-10:169 e AULA-13:195 vêm antes                                                 | corrigido  |
| 20   | O   | `:372` "4.462 bytes — **dez vezes** maior que o da aula anterior"; a razão real é 5,73, e a própria aula cita os 779 bytes em `:417`. E `:111` "exemplo de **17** linhas" contra "18" em `:85` | corrigidos |
| 22   | O   | `:452` a linha "Linhas" da tabela trazia 142/123/20/181, os valores de `wc -l`; `awk` dá 143/124/21/182, e a prosa da própria aula já dizia 143                                                | corrigido  |

### O padrão desta rodada: o defeito que sobra é número em prosa, não citação

Nas oito aulas, os quatro auditores abriram e conferiram por conteúdo mais de **150 citações**
`arquivo:linha`. Acharam **um** erro de citação — `AULA-21:204`, onde um único bloco de código
servia a duas citações e batia só com a primeira (`:90` usa `docs`, `:219` usa `documents`). Todo o
resto que caiu foi:

- **Número derivado, escrito à mão.** Uma razão ("dez vezes"), três contagens de linha e uma linha
  inteira de tabela — e **duas das três** vinham de `wc -l`, que subconta 1 em arquivo sem newline
  final. É a armadilha que o próprio curso documenta como regra de método, e em que caiu duas vezes
  na própria prosa.
- **Superlativo cujo escopo cresceu além do que foi checado.** "pela primeira vez no curso",
  "único arquivo do curso inteiro", "o único dos quatro que avalia um sistema em execução", "cinco
  outros lugares". Nenhum era citação errada; todos eram alegação de unicidade ou de contagem que o
  autor não conferiu com o mesmo rigor que aplicou às citações.

**Nenhum dos dois tipos é detectável por `verify-citations.js`**, porque nenhum dos dois é uma
citação. O primeiro só cai comparando duas passagens da mesma aula; o segundo, lendo outras aulas
ou grepando o repositório inteiro. A ferramenta valida caminho e range — e continua sendo o piso,
não o teto.

### Calibração registrada, sem alterar nota

O auditor do lote B lançou o `−1` da AULA-16 em **H** (honestidade epistêmica). A escala desta
rubrica diz que `−1` "aplica-se sobretudo a `E`, `C` e `O`", e o defeito — uma alegação de primazia
que outras aulas do curso contradizem — é coerência **externa**, ou seja **O**. O total da aula não
muda (9/12 em qualquer das duas leituras). Fica registrado como observação porque a nota é do
auditor independente, e reescrevê-la seria a autoavaliação que a rubrica proíbe.

### Um auditor violou o contrato somente-leitura, e reportou o próprio erro

O auditor do lote D rodou `pdftotext -layout` com saída em arquivo e criou
`%TEMP%\graphrag_extracted.txt` (105 KB) para conferir citações do
paper GraphRAG. Violou a cláusula "nem temporário, nem rascunho, nem saída" do prompt. Registrou a
violação na primeira linha do relatório, passou a usar `pdftotext arquivo.pdf -` para stdout no
resto do trabalho, e **não** apagou o arquivo — porque remoção também era proibida pelo contrato, e
apagar o rastro do próprio erro seria pior.

Verificado: o arquivo está fora dos dois repositórios, e `git status --short` no clone da Packt
volta **vazio**. O contrato do projeto — o que protege o clone — foi preservado. A autodenúncia é o
comportamento correto e vale mais que a limpeza. O arquivo foi removido em 19/08 por decisão do
operador, depois de conferido: era extração `pdftotext` do PDF do paper, que segue no clone.

### Achado de fora do escopo, corrigido de todo modo

O auditor do lote D abriu a **AULA-26** inteira para conferir uma referência da AULA-21 e encontrou
contradição que não é de nenhuma das duas aulas auditadas: `AULA-26:11` descrevia o Self-RAG como
tendo "dois ciclos", enquanto a tabela da própria aula em `:294` conta **3** (com `:354`, `:359`,
`:361`) e a prosa em `:237` diz "nenhum dos três". Corrigido para três. A AULA-26 é uma das 21 com
nota pré-correção, fora do escopo destas oito — contradição interna com a própria tabela não espera
renota.

---

## Triagem dos BAD_ANCHOR — fechada em 19/08/2026

Os 48 `BAD_ANCHOR` foram triados um a um. **Nenhum era defeito do material:** as 48 linhas
citadas existem e contêm o que a aula afirma. O `--all` passou de **FAIL com 48** para
**PASS com 0**, e as verificações automáticas subiram de 1 268 para **1592**.

### O que os 48 eram, por causa

| Causa                                              | Itens                | Correção             |
| -------------------------------------------------- | -------------------- | -------------------- |
| Raízes de busca sobrepostas no índice de basename  | 41                   | ferramenta           |
| Basename nu casando na raiz do AIOX                | 5 (AULA-09)          | ferramenta + redação |
| Nome do arquivo só dentro de fence, que não ancora | 1 (AULA-11)          | redação              |
| Referência solta sem arquivo na janela             | 4 (AULA-20, AULA-24) | redação              |
| Apelido `01`/`02` em vez de nome de arquivo        | 6 (AULA-27)          | redação              |

### Os dois defeitos da ferramenta

**1. Índice de basename contava cada arquivo duas vezes.** `SEARCH_ROOTS` é `[repo, curso, aiox]`,
e tanto `repo` quanto `curso` moram **dentro** de `aiox`. Sem deduplicar, todo arquivo do clone da
Packt aparecia no índice com dois rótulos e dois caminhos relativos, então a checagem de unicidade
(`alternatives.length !== 1`) reprovava **todos** eles. Nenhuma citação por basename ancorava — e a
AULA-24, que cita `Milvus-Implementation.py` sem diretório, sozinha respondia por 17 dos 48.
Deduplicado pelo caminho absoluto real, com a raiz mais específica ganhando o rótulo.

**2. Basename nu resolvia por caminho direto na raiz externa.** A AULA-09 cita o
`docker-compose.yml` do módulo Milvus (65 linhas). O token sem diretório casava no
`docker-compose.yml` da **raiz do AIOX** — 21 linhas, sem relação com o curso — e as
linhas 23, 41, 51, 57 e 58 eram acusadas de estourar o range do arquivo errado. Agora o caminho
direto só é tentado quando o token traz diretório; sem ele, decide o índice de basename, que exige
unicidade.

Basename genuinamente ambíguo continua não ancorando: `docker-compose.yml` existe em dois módulos
da Packt, e adivinhar qual seria repetir o erro na direção oposta.

### Efeito colateral que vale mais que a triagem

Deduplicar o índice não só apagou 41 falsos positivos: transformou em **verificação automática**
centenas de referências que antes eram `NO_ANCHOR` ("conferir à mão"). O `NO_ANCHOR` caiu de 278
para **20**, e o total conferido por máquina subiu 324 citações. O
material não mudou; o que mudou é quanto dele a ferramenta consegue provar.

Restam **16 `SKIPPED`**: caminhos com glob ou elipse (`98-TwoTierIndex-*.py`,
`01-DataLoading/.../09-Parent-Child-*.py`), que são conferência à mão por desenho, não defeito.

### Redações corrigidas

| Aula | Era                                          | Ficou                                                                                             |
| ---- | -------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 09   | "O `docker-compose.yml` do módulo"           | `04-VectorDB/Milvus/docker-compose.yml`, com a ressalva de que existe outro em `05-MultiModalRAG` |
| 11   | nome do arquivo só no bloco ```powershell    | caminho completo em prosa, **antes** do número da linha                                           |
| 20   | "O bloco 3 passa `summary_template` (`:54`)" | nomeia `02-LlamaIndex-OutputParsing.py` antes dos três números                                    |
| 24   | "Ainda no prompt do Milvus"                  | "no prompt de `Milvus-Implementation.py`"                                                         |
| 27   | `01` e `02` como apelido em cinco exercícios | nome do arquivo onde há número de linha                                                           |

A ordem importa e virou regra prática: **a janela de ancoragem só olha para trás.** A primeira
tentativa na AULA-11 pôs o caminho depois do "linha 106" e o `BAD_ANCHOR` sobreviveu.

_Nota sobre rodar o verificador **neste arquivo**: ele acusa alguns `BAD_ANCHOR`, e são artefato de
relatório. As tabelas acima citam números de linha copiados da prosa das aulas ("linha 106", `:54`)
sem trazer o arquivo de cada um — é o próprio defeito que esta seção descreve, reproduzido para
poder nomeá-lo. O `--all` cobre o material didático; meta-documento entra só por caminho
explícito._

---

## Renota adversarial — rodada PARCIAL de 19/08/2026

**Estado: 9 das 29 aulas renotadas. A rodada NÃO terminou.** Foram lançados 15 auditores
`general-purpose` em `sonnet`, somente-leitura, duas aulas por lote, cobrindo as 29. **Cinco lotes
concluíram; dez morreram por limite de sessão da API.** Nenhum auditor recebeu a nota anterior da
aula que avaliou — a comparação abaixo só tem sentido porque as duas medidas são independentes.

### As 9 notas, contra a nota anterior

| Aula                    | E   | C   | H   | O   | D   | A   | Renota    | Antes | Δ       | Lote |
| ----------------------- | --- | --- | --- | --- | --- | --- | --------- | ----- | ------- | ---- |
| 05 — PDF, layout, OCR   | 2   | 2   | 1   | 2   | 2   | 2   | **11/12** | 8/12  | **+3**  | F    |
| 06 — Tabelas, CSV, SQL  | −1  | 1   | 1   | 2   | 2   | 2   | **7/12**  | 7/12  | 0       | C    |
| 07 — Chunking           | 2   | 2   | 2   | 2   | 2   | 2   | **12/12** | 8/12  | **+4**  | A    |
| 10 — Índices ANN        | −1  | 1   | 1   | 1   | 2   | 2   | **6/12**  | 8/12  | **-2**  | C    |
| 12 — Query construction | 2   | 2   | 1   | 2   | 2   | 2   | **11/12** | 4/12  | **+7**  | D    |
| 13 — Query translation  | 1   | 2   | 2   | 1   | 2   | 2   | **10/12** | −1/12 | **+11** | D    |
| 17 — Reranking          | 2   | 2   | 1   | 1   | 2   | 2   | **10/12** | 7/12  | **+3**  | F    |
| 18 — Compressão e CRAG  | 2   | 2   | 1   | 2   | 2   | 2   | **11/12** | 6/12  | **+5**  | A    |
| 20 — Saída estruturada  | 2   | 1   | 2   | −1  | 2   | 2   | **8/12**  | 8/12  | 0       | H    |

**Subtotal das 9: 86/108 = 79,6%**, contra **55/108 = 50,9%** antes.
Δ médio **+3,44**; 6 subiram, 2 ficaram iguais, 1 caiu.

### O que o Δ diz, e o que não diz

Seis aulas subiram, duas empataram, uma caiu. A maior variação é a **AULA-13: de −1/12 para 10/12
(+11)** — era a pior nota da auditoria inteira, e o auditor da renota, sem saber disso, abriu o
notebook de clarificação célula a célula e confirmou as sete funções e as quatro ocorrências zero
que a aula alega. A **AULA-12 subiu +7** com o `diff` de 49 linhas conferido por três métodos
independentes.

**O que isso não autoriza a concluir:** que as correções explicam o ganho. Duas medidas
independentes de auditores diferentes sobre versões diferentes do texto misturam melhoria real com
variação entre avaliadores — e esta mesma auditoria já mediu que essa variação chega a 12 pontos
(ver "Recontagem de 19/08/2026"). Com 9 de 29 aulas e um auditor por aula, o Δ médio de
**+3,44** é sinal, não prova.

### A única aula que caiu, e por que isso é o achado mais valioso

**AULA-10: de 8/12 para 6/12**, com `−1` em **E**. O auditor achou uma alucinação que quatro
rodadas de correção não pegaram: a aula afirmava que `07-text-match.py` e `09-metadata-query.py`
"**não são busca vetorial**". Conferi: `07-text-match.py` chama
`client.search(..., anns_field="vector", search_params={"metric_type": "L2"})` nas linhas 59, 75 e
91 — é busca ANN com filtro `TEXT_MATCH`, exatamente o padrão que a própria aula descreve
**corretamente** ao falar de `03-filtered-search.py`. A aula tratava o mesmo padrão de código de
duas formas contraditórias. Corrigido.

### As três notas `−1` da renota, e o que aconteceu com elas

| Aula | Dim | Defeito                                                    | Verificação minha                                                                                     | Estado                       |
| ---- | --- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------- |
| 10   | E   | "`07-text-match.py` não é busca vetorial"                  | `grep` mostra `anns_field="vector"` em três buscas                                                    | corrigido                    |
| 06   | E   | "`99-UsingTextract.py` extrai PDF com **AWS Textract**"    | linha 1 é `import textract` (pacote PyPI); `grep -rl boto3` no repo inteiro retorna vazio             | corrigido                    |
| 20   | O   | "Import não é uso — **terceiro** caso registrado no curso" | só a AULA-19 é episódio anterior (e já enumera 3 símbolos); por episódio seria o 2º, por símbolo o 4º | corrigido — numeral removido |

A da AULA-06 é a mais instrutiva: **colisão de nome apresentada como fato**. O pacote PyPI
`textract` é wrapper de extratores locais; o serviço AWS Textract exigiria `boto3`, credencial e,
tipicamente, um objeto em S3. Nada disso existe no repositório. E a própria aula trata o caso
`bm25-ch/en` com o cuidado certo ("o nome sugere... mas") — aqui não aplicou o mesmo cuidado.

### Outros achados corrigidos nesta rodada

| Aula | Sev     | Era                                                                                | Ficou                                                                              |
| ---- | ------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 10   | ALTO    | "a aula mais quantitativa do curso, e **a única** em que a resposta certa é medir" | "uma das mais quantitativas, e a **primeira**" — a AULA-22 é inteira sobre medir   |
| 17   | ALTO    | "Esta é a melhor relação custo-benefício de todo o pipeline RAG"                   | prefixado com **Julgamento:**                                                      |
| 17   | CRÍTICO | "as Aulas 08 **e 10** estabeleceram duas restrições"                               | só a Aula 08 — `grep` por cross-encoder/bi-encoder/indexar na AULA-10 retorna zero |

### O padrão que a renota expôs

Nos cinco lotes, os auditores abriram e conferiram por conteúdo mais de **100 citações**
`arquivo:linha`. Acharam **um** erro de linha (AULA-06, `:40` onde o certo é `:41` — a citação
aponta para o comentário, a chamada está na linha seguinte) e **um** de fronteira de range
(AULA-13, "linhas 2 a 9" onde os 7 componentes citados estão em 3-9). Todo o resto que caiu foi:

- **Caracterização errada de um arquivo inteiro** — as duas alucinações (`07-text-match.py`,
  `99-UsingTextract.py`). Nenhuma tem número de linha errado; são afirmações sobre o que o arquivo
  **é**, que só se refutam lendo o arquivo todo e testando contra conhecimento de domínio.
- **Superlativo não marcado como julgamento** — nove instâncias somadas entre as 9 aulas. Nenhuma
  se provou falsa por `grep`; nenhuma estava prefixada com "Julgamento:", que é o gesto que as
  próprias aulas fazem corretamente em outros pontos. É aplicação desigual da mesma disciplina.
- **Inconsistência de escopo** — a AULA-13 fala do "custo comum" em três formulações (às três
  primeiras / a cada técnica / a todas as quatro), quando a própria Parte 4 prova que a quarta tem
  zero chamadas de LLM. Não corrigido nesta rodada; fica registrado.

**Nenhum dos dois tipos é detectável por `verify-citations.js`.** O `--all` estava em PASS antes e
depois da renota.

### As 20 aulas que faltam

Pendentes de renota: **00, 01, 02, 03, 04, 08, 09, 11, 14, 15, 16, 19, 21, 22, 23, 24, 25, 26, 27, 28**.

Lotes que morreram por limite de sessão da API (reseta 00:20, America/Bahia):

- Lote B (08, 09)
- Lote E (15, 04)
- Lote G (19, 01)
- Lote I (21, 00)
- Lote J (22, 02)
- Lote K (23, 14)
- Lote L (24, 03)
- Lote M (26, 25)
- Lote N (27, 16)
- Lote O (28, 11)

**Nenhuma classificação de publicação é declarada, e a distância para poder declarar diminuiu sem
fechar.** As 20 aulas restantes seguem com nota pré-correção, e duas delas (AULA-03 = 0/12,
AULA-25 = 4/12) estão abaixo da porta de 50% que a rubrica exige até para "publicável com
ressalvas".

### Duas violações do contrato somente-leitura, ambas autodenunciadas

O auditor do lote I criou `%TEMP%\self-rag-paper-check.txt` (119 KB)
por um `>` acidental ao extrair PDF; o do lote L criou e apagou um `/tmp/diffout_$$`. Os dois
reportaram o próprio erro e passaram a usar só pipes. Somando o `graphrag_extracted.txt` (105 KB)
do lote D da rodada anterior, eram **dois arquivos** em `%TEMP%`. **Removidos em 19/08 por decisão
do operador**, depois de conferidos um a um: eram extração `pdftotext` de
`GraphRAG - 2404.16130v2.pdf` e `Self-RAG 2310.11511v1.pdf`, os dois PDFs seguem no clone da
Packt, e nada original se perdeu. O `/tmp/diffout_$$` do lote L o próprio auditor já havia
apagado.

**O contrato que importa foi preservado:** `git status --short` no clone da Packt volta vazio,
depois de 19 auditores lerem lá dentro.

---

## Renota adversarial — rodada COMPLETA de 20/08/2026

**Estado: 29 de 29 aulas renotadas.** Os dez lotes que morreram por limite de sessão da API em 19/08
foram relançados e todos os dez concluíram — `general-purpose` em `sonnet`, somente-leitura, duas
aulas por lote, instruídos a refutar. Nenhum auditor recebeu a nota anterior da aula que avaliou, e
o prompt proibia explicitamente abrir este arquivo. Os dez foram informados de que o `--all` estava
em PASS e de que reconferir caminho e range não rendia nota — o trabalho era conteúdo da linha
citada, contradição interna, superlativo não marcado e coerência externa.

### As 20 notas desta rodada, contra a nota anterior mais recente

| Aula                             | E   | C   | H   | O   | D   | A   | Renota    | Antes | Δ       | Lote |
| -------------------------------- | --- | --- | --- | --- | --- | --- | --------- | ----- | ------- | ---- |
| 00 — Setup do ambiente           | −1  | 2   | 1   | −1  | 2   | 2   | **5/12**  | 3/12  | **+2**  | I    |
| 01 — O que é RAG                 | 2   | 2   | 2   | 1   | 2   | 2   | **11/12** | 9/12  | **+2**  | G    |
| 02 — Vetores e similaridade      | 2   | 2   | 1   | 1   | 2   | 2   | **10/12** | 8/12  | **+2**  | J    |
| 03 — Primeiro RAG                | 2   | 2   | 2   | 2   | 2   | 2   | **12/12** | 0/12  | **+12** | L    |
| 04 — Texto, JSON, web            | 1   | 2   | 1   | 2   | 2   | 2   | **10/12** | 5/12  | **+5**  | E    |
| 08 — Embeddings, BM25, BGE-M3    | 2   | 2   | −1  | 2   | 2   | 2   | **9/12**  | 11/12 | **−2**  | B    |
| 09 — Milvus, schema, entidades   | 2   | 2   | −1  | −1  | 2   | 2   | **6/12**  | 7/12  | **−1**  | B    |
| 11 — Híbrida e multimodal        | 2   | 2   | 1   | −1  | 2   | 2   | **8/12**  | 9/12  | **−1**  | O    |
| 14 — Query routing               | 2   | 2   | 1   | 2   | 2   | 1   | **10/12** | 10/12 | 0       | K    |
| 15 — Small-to-big                | 2   | 2   | 1   | 2   | 2   | 2   | **11/12** | 10/12 | **+1**  | E    |
| 16 — Índice hierárquico          | 2   | 2   | 0   | 2   | 2   | 2   | **10/12** | 9/12  | **+1**  | N    |
| 19 — Modelo e prompt engineering | 1   | 2   | 2   | 2   | 2   | 2   | **11/12** | 10/12 | **+1**  | G    |
| 21 — Self-RAG                    | 2   | 2   | 1   | 2   | 2   | 2   | **11/12** | 10/12 | **+1**  | I    |
| 22 — Avaliação                   | 2   | 2   | −1  | 0   | 2   | 2   | **7/12**  | 8/12  | **−1**  | J    |
| 23 — GraphRAG                    | 1   | 2   | 1   | 2   | 2   | 2   | **10/12** | 12/12 | **−2**  | K    |
| 24 — Contextual Retrieval        | 0   | 2   | 1   | 0   | 2   | 2   | **7/12**  | 12/12 | **−5**  | L    |
| 25 — Modular RAG                 | −1  | 2   | 0   | −1  | 2   | 2   | **4/12**  | 4/12  | 0       | M    |
| 26 — Agentic e Adaptive RAG      | −1  | 2   | −1  | −1  | 2   | 2   | **3/12**  | 7/12  | **−4**  | M    |
| 27 — Multimodal RAG              | 1   | 2   | 0   | −1  | 2   | 2   | **6/12**  | 4/12  | **+2**  | N    |
| 28 — Projeto final               | −1  | 2   | 0   | −1  | 2   | 2   | **4/12**  | 7/12  | **−3**  | O    |

**Subtotal das 20: 165/240 = 68,8%**, contra **155/240 = 64,6%** antes.
Δ total **+10**, Δ médio **+0,50**; **10 subiram, 8 caíram, 2 empataram**.

Somas e percentuais calculados por script a partir das seis dimensões de cada aula — nenhum número
desta seção foi somado à mão, porque somar à mão é a classe de defeito que esta auditoria mais
encontra.

### O Δ médio da rodada parcial não se sustentou

A rodada parcial mediu **+3,44** em 9 aulas. Com as 29 fechadas, o Δ médio das 20 novas é **+0,50** —
sete vezes menor. As 9 que concluíram primeiro em 19/08 não eram amostra representativa: entre elas
estavam a AULA-13 (+11) e a AULA-12 (+7), os dois maiores ganhos daquela rodada.

**Julgamento, marcado como julgamento:** o Δ médio agregado não mede a qualidade das correções. Ele
mistura melhoria real com variação entre avaliadores, e esta auditoria já mediu que a variação entre
dois auditores sobre a mesma aula chega a 12 pontos. O que o número diz é mais modesto e mais útil:
depois de duas rodadas adversariais completas, o material está em 72,1% e **não** numa trajetória de
ganho estável.

### Erro de aritmética num relatório de auditor, registrado sem reescrever a nota

O auditor do lote N deu à AULA-16 as dimensões `E2 C2 H0 O2 D2 A2` e escreveu **"Total: 8/12"**. A
soma das seis dimensões é **10**. As dimensões são o julgamento do auditor; o total é aritmética.
Usei **10/12**, que é a soma das dimensões que ele atribuiu, e registro a divergência aqui em vez de
apagá-la — reescrever as dimensões seria a autoavaliação que a rubrica proíbe, e esconder um erro de
soma num relatório que audita erros de soma seria pior.

### Uma correção de rodada anterior estava ERRADA e introduziu o defeito

Este é o achado mais importante da rodada, e é sobre o método, não sobre o material.

O **lote 10 de 19/08** registrou nesta auditoria: "citação entre aspas dizia `the final output of the
LLM serving as the reward`; o paper não tem a palavra final → palavra removida da citação". A
AULA-25 foi editada, e a palavra saiu.

O auditor do lote M refutou. Fui ao PDF (`pdftotext ModularRAG-2407.21059v1.pdf -`, saída para
stdout): o paper diz **"with the final output of the LLM serving as the reward"**. A palavra está
lá. A correção de 19/08 **degradou uma citação que estava correta**, e o defeito que o lote M
encontrou foi criado por uma auditoria anterior.

Restaurada em 20/08. A lição operacional: **achado de auditor sobre citação literal também se
confere na fonte antes de aplicar.** O viés desta avaliação é contra o material, e isso é correto
para atribuir nota — mas não autoriza aplicar correção sem verificar. É a primeira regressão
documentada desta auditoria.

### As notas −1 desta rodada, e o que aconteceu com cada uma

Quinze notas `−1` nas 20 aulas. Todas verificadas por mim na fonte antes de qualquer correção; todas
corrigidas em 20/08.

| Aula | Dim | Defeito                                                                                                   | Verificação minha                                                                                              |
| ---- | --- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 00   | E   | "a única menção ao `marker_single` está numa tabela do `README.md`"                                        | `grep -rn` devolve **duas** — a mesma linha em `README.md:173` e `99-EN/README.md:90`                           |
| 00   | O   | "a Aula 28 cataloga outros catorze" contra a AULA-28 dizendo "catalogou quatorze casos"                    | os dois números não fechavam; a tabela tem 14 e não inclui este caso. Total real **15**                         |
| 08   | H   | "é o único arquivo do curso inteiro em que você vê um algoritmo de pontuação query-documento por completo" | `03-CoBERT-Reranking.py:106-134` também pontua query contra documento à mão, com L2 e `torch.mm`                |
| 09   | H   | "Todo exemplo do módulo o chama", seguido de "o grep encontra 16 arquivos"                                 | `04-VectorDB/` tem **27** `.py` e 16 chamam. E **três dos quatro** arquivos da própria aula não chamam          |
| 09   | O   | "conecta com a estratégia de particionamento multi-tenant que a Aula 10 vai discutir"                      | busca por multi-tenant e partition na AULA-10: **zero**. Nenhuma aula posterior trata particionamento           |
| 11   | O   | "é o quinto caso deste curso em que o nome promete algo diferente"                                         | a tabela da AULA-28 não é cronológica; o ordinal não se sustenta em nenhuma numeração. Removido                 |
| 22   | H   | "`04-LlamaIndexEvaluation.py:47` é o único do repo inteiro"                                                | são **dois** — `03-Embedding/05-MultimodalEmbedding.py:20` aponta um `.pth` sob `/root/AI-BOX/`                 |
| 25   | E   | citação do paper sem a palavra "final"                                                                     | o paper **tem** "final" — regressão do lote 10, ver a seção acima                                              |
| 25   | O   | "três ciclos simples" na Parte 4 contra "dois ciclos" na Mão na massa, mesmo grafo                          | contradição confirmada; e a AULA-21 já proibia trocar de convenção entre passagens                              |
| 26   | E   | cabeçalho "2 scripts (234 e 242 linhas)"                                                                   | `awk` dá **235 e 243**; os dois terminam sem newline final, e 234/242 são os valores de `wc -l`                 |
| 26   | H   | "É a última aula do curso que lê código do repositório"                                                    | a AULA-27 lê e cita os dois scripts Weaviate — 21 menções por `grep -c`                                         |
| 26   | O   | "a primeira vez em todo o curso que um exemplo traz a sua própria infraestrutura"                           | a própria AULA-27 diz "**segunda** vez"; a primeira é o Milvus da AULA-09                                       |
| 27   | O   | cabeçalho e tabela dizem "130 e 106 linhas", e a **mesma aula cita `:131` e `:107`** como linhas reais      | `awk` dá **131 e 107**. A aula citava uma linha que ela própria declarava não existir                           |
| 28   | E   | "Vinte e seis das vinte e sete aulas terminaram numa seção de armadilhas de produção"                      | script sobre as 28 anteriores: **27 de 28** têm a seção; a exceção é a AULA-01                                  |
| 28   | O   | "cobre três: delimitar a fonte, autorizar a abstenção, fixar o formato, fixar o tom"                       | lista quatro dizendo três, e põe entre os cobertos exatamente o que a frase seguinte diz que faltava            |

Além dessas, dois achados de contagem sem `−1` que valem mais que a nota:

- **AULA-24, `E`=0 e `O`=0.** "1.323 linhas de código, das quais 979 num único arquivo" — e a linha 57
  usava **dois métodos de contagem na mesma frase**: 345 (`awk`, correto) para o LlamaIndex e 979
  (`wc -l`, subcontado) para o Milvus. Os valores certos são 345, **980** e **1.325**. Corrigido com a
  armadilha explicada no texto, não só consertada.
- **AULA-28, o "-zh" contado errado nos dois sentidos.** A aula dizia "três vezes"; o auditor contou
  "duas". Contei por script: a busca por modelos `bge*-zh` nos `.py` devolve **27 arquivos**, em sete
  módulos (`00-SimpleRAG` 11, `06-Indexing` 7, `05-PreRetrieval` 5, e um cada em `02-DocChunking`,
  `04-VectorDB`, `07-PostRetrieval` e `10-AdvanceRAG`). Não é caso isolado — é resíduo sistemático da
  origem chinesa do repositório, e o número certo está uma ordem de magnitude acima do que aula e
  auditor supunham.

### O padrão desta rodada

Nos dez lotes, os auditores abriram e conferiram por conteúdo mais de **250 citações**
`arquivo:linha`. Acharam **um** erro de range (AULA-04, faixa começando na 6 onde a chamada comentada
começa na 5). Todo o resto que caiu foi:

- **Contagem de linha por `wc -l` onde cabia `awk`** — AULA-24, AULA-26, AULA-27 e a AULA-22 (título
  "vinte linhas" contra 21 no corpo e na tabela). Quatro aulas, e em três delas o número errado
  convivia com o número certo no mesmo documento.
- **Alegação de unicidade ou primazia não conferida** — "o único do repo inteiro", "o único arquivo do
  curso inteiro", "todo exemplo do módulo", "a última aula que lê código", "a primeira vez em todo o
  curso". Nenhuma exigia mais que um `grep` para cair.
- **Superlativo de valor sem o prefixo `Julgamento:`** — pelo menos 18 instâncias somadas entre as 20
  aulas ("a melhor sequência didática do módulo", "o arquivo mais importante desta aula", "o teste
  mais barato de todo o pipeline RAG", "a lição mais rentável do curso"). As mesmas aulas prefixam
  corretamente em outros pontos: é aplicação desigual da própria disciplina.
- **Promessa a outra aula que a aula referida não cumpre** — AULA-09 para a AULA-10 (particionamento),
  AULA-27 para a AULA-24 (índice de exemplos, que é da AULA-19), AULA-01 para a AULA-28 (o documento
  que a Etapa 1 manda reescrever do zero).

**Nenhum dos quatro tipos é detectável por `verify-citations.js`.** O `--all` estava em PASS antes e
depois da rodada, e terminou em **1622 OK** com `BAD_LINE`, `MISPLACED`, `NOT_FOUND` e `BAD_ANCHOR`
em zero.

### Classificação de publicação — agora dá para calcular, e as portas reprovam

Com as 29 renotadas: **251/348 = 72,1%**.

O percentual cai na faixa **70–84%**, de "Publicável com ressalvas". As duas portas dessa faixa são
eliminatórias, e **as duas falham**:

| Porta de "Publicável com ressalvas" | Exigido           | Medido                                      |
| ----------------------------------- | ----------------- | ------------------------------------------- |
| Notas `−1` no curso                 | no máximo **uma** | **18**                                      |
| Aulas abaixo de 50%                 | **nenhuma**       | **quatro** — 00 (5), 25 (4), 26 (3), 28 (4) |

As portas de "Publicável" (≥ 85%) falham por margem maior: 18 notas `−1` contra zero exigidas, **12**
aulas abaixo de 70% contra nenhuma, e **7** aulas com `E` abaixo de 1 contra `E` ≥ 1 em todas.

**A classificação que a rubrica sustenta é "Requer revisão".** O percentual sozinho diria outra
coisa; a rubrica é explícita em que as portas ganham — "90% com duas alucinações é com ressalvas, não
publicável" —, e aqui são dezoito.

**E esta classificação descreve a versão que os auditores leram, não a que está em disco.** Os quinze
defeitos que produziram as `−1` desta rodada foram corrigidos em 20/08, todos verificados por mim na
fonte antes da edição. Somar as correções à nota seria a autoavaliação que a rubrica proíbe. O que
mudou em relação a 19/08 é que agora existem **duas rodadas adversariais completas** sobre as 29
aulas, e a distância até "com ressalvas" é nomeável: zerar as `−1` e tirar quatro aulas de baixo dos
50%.

### Contrato somente-leitura

Um auditor (lote K) tentou um redirecionamento por hábito de shell; o comando falhou com
*Permission denied*, nada foi escrito, e ele reportou de todo modo na primeira linha do relatório.
Nenhum dos dez criou arquivo temporário — os três prompts que mencionavam `pdftotext` traziam a
proibição com as violações anteriores nomeadas, e nenhuma se repetiu.

Verificado ao encerrar: `git status --short` no clone da Packt volta **vazio**, e
`git status --short --ignored` também — nem arquivo ignorado sobrou, depois de 29 auditores lerem lá
dentro ao longo das duas rodadas.

---

## Renota adversarial — TERCEIRA rodada, COMPLETA (20/08/2026)

**29 de 29 renotadas.** Esta seção substitui a anterior, marcada como parcial em 13 de 29 — os
números daquela ficaram corretos, só incompletos. Somas e percentuais calculados por script a partir
das seis dimensões de cada relatório.

**Desenho:** `general-purpose` em `sonnet`, somente-leitura, nota anterior não revelada, proibição
explícita de abrir este arquivo, o `HANDOFF.md` e o `PROMPT-CONTINUAR.md`. **Uma aula por auditor**,
com mínimo de dez citações abertas — o dobro das rodadas anteriores. Quatro aulas receberam dois
auditores.

Três mudanças no prompt em relação à R2, cada uma por defeito medido nela:

1. **O que conta como julgamento marcado ficou explícito** (prefixo, inline, ou hedge de primeira
   pessoa) e **marcador mal posicionado** passou a ser falha nomeada. Sem isso a rodada mediria a
   minha notação em vez do material.
2. **Somar as seis dimensões por script antes de escrever o total** — na R2 um relatório deu
   `E2 C2 H0 O2 D2 A2` e escreveu "Total: 8/12".
3. **"Ausência de uma string não é ausência do comportamento"** — a regra nasceu de um erro meu (ver
   abaixo), virada em ferramenta de auditoria.

### O resultado principal: a nota caiu porque a auditoria ficou mais funda

| | Total | % |
| --- | --- | --- |
| **R3 conservador** (auditor solo nas 4 duplicadas) | **245/348** | **70,4%** |
| R3 otimista (auditor de par nas 4) | 266/348 | 76,4% |
| R2, para comparar | 254/348 | 73,0% |

Δ médio **−0,31**; **11 subiram, 13 caíram, 5 empataram.** O material recebeu 15 correções entre as
duas rodadas e a nota **desceu**.

Isso não é contradição. É o que se espera quando o instrumento melhora: **a R2 media menos.** A
evidência direta está nos quatro pares.

### Os quatro pares, e o achado de método

| Aula | Auditor de par (5 citações mín., 2 aulas) | Auditor solo (10 citações mín., 1 aula) | Δ |
| --- | --- | --- | --- |
| 24 — Contextual Retrieval | 12/12 | **9/12** | 3 |
| 26 — Agentic e Adaptive | 12/12 | **8/12** | 4 |
| 03 — Primeiro RAG | 11/12 | **4/12** | 7 |
| 13 — Query translation | 11/12 | **4/12** | 7 |

**Em quatro de quatro, o auditor com orçamento dobrado deu nota menor _e_ achou defeito verificável
que o outro não viu.** Direção consistente, causa identificável. O caso mais claro é a AULA-13: o de
par escreveu "não encontrei achados CRÍTICO, ALTO ou MÉDIO" e deu 11/12; o solo achou uma contradição
de escopo em quatro formulações do mesmo arquivo — **que este gate já registrava como aberta desde
19/08**. Registrar não é corrigir.

**Consequência para quem retomar:** trate as notas das rodadas 1 e 2 como piso otimista, não como
medida. Uma aula por auditor, orçamento dobrado, custa o dobro de auditores e mede o dobro.

### As 29 notas

| Aula | E | C | H | O | D | A | R3 | R2 | Δ |
| ---- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 22 — Avaliação | 2 | 2 | 2 | 2 | 2 | 2 | **12/12** | 7 | +5 |
| 25 — Modular RAG | 2 | 2 | 2 | 2 | 2 | 2 | **12/12** | 4 | +8 |
| 00 — Setup | 2 | 2 | 2 | 2 | 1 | 2 | **11/12** | 5 | +6 |
| 01 — O que é RAG | 2 | 2 | 2 | 1 | 2 | 2 | **11/12** | 11 | 0 |
| 02 — Vetores e similaridade | 2 | 2 | 1 | 2 | 2 | 2 | **11/12** | 10 | +1 |
| 10 — Índices ANN | 1 | 2 | 2 | 2 | 2 | 2 | **11/12** | 6 | +5 |
| 14 — Query routing | 2 | 2 | 1 | 2 | 2 | 2 | **11/12** | 10 | +1 |
| 15 — Small-to-big | 2 | 1 | 2 | 2 | 2 | 2 | **11/12** | 11 | 0 |
| 21 — Self-RAG | 2 | 2 | 2 | 1 | 2 | 2 | **11/12** | 11 | 0 |
| 27 — Multimodal | 2 | 2 | 2 | 1 | 2 | 2 | **11/12** | 6 | +5 |
| 06 — Tabelas, CSV, SQL | 0 | 2 | 2 | 2 | 2 | 2 | **10/12** | 10 | 0 |
| 08 — Embeddings, BM25 | 1 | 2 | 1 | 2 | 2 | 2 | **10/12** | 9 | +1 |
| 19 — Modelo e prompt | 2 | 1 | 2 | 1 | 2 | 2 | **10/12** | 11 | −1 |
| 28 — Projeto final | 1 | 2 | 2 | 1 | 2 | 2 | **10/12** | 4 | +6 |
| 07 — Chunking | 2 | 2 | 0 | 1 | 2 | 2 | **9/12** | 12 | −3 |
| 18 — Compressão e CRAG | 1 | 1 | 2 | 2 | 1 | 2 | **9/12** | 11 | −2 |
| 24 — Contextual Retrieval | 0 | 2 | 1 | 2 | 2 | 2 | **9/12** | 7 | +2 |
| 20 — Saída estruturada | 1 | 0 | 2 | 1 | 2 | 2 | **8/12** | 8 | 0 |
| 26 — Agentic e Adaptive | 2 | 2 | 1 | −1 | 2 | 2 | **8/12** | 3 | +5 |
| 17 — Reranking | 2 | 2 | 1 | −1 | 1 | 2 | **7/12** | 10 | −3 |
| 23 — GraphRAG | 1 | 2 | 1 | −1 | 2 | 2 | **7/12** | 10 | −3 |
| 04 — Texto, JSON, web | 2 | 0 | 0 | 1 | 1 | 2 | **6/12** | 10 | −4 |
| 05 — PDF, layout, OCR | 1 | 1 | 1 | −1 | 2 | 2 | **6/12** | 11 | −5 |
| 16 — Índice hierárquico | 2 | 1 | 1 | −1 | 1 | 2 | **6/12** | 10 | −4 |
| 11 — Híbrida e multimodal | 1 | 1 | −1 | 0 | 2 | 2 | **5/12** | 8 | −3 |
| 03 — Primeiro RAG | 1 | −1 | 0 | 1 | 1 | 2 | **4/12** | 12 | −8 |
| 13 — Query translation | 2 | 1 | 0 | −1 | 1 | 1 | **4/12** | 10 | −6 |
| 12 — Query construction | −1 | 1 | 1 | −1 | 1 | 2 | **3/12** | 11 | −8 |
| 09 — Milvus, schema | 1 | −1 | −1 | 0 | 2 | 1 | **2/12** | 6 | −4 |

### Classificação de publicação: REQUER REVISÃO

Com **245/348 = 70,4%**, o percentual cai na faixa de "Publicável com ressalvas" (70–84%). As duas
portas eliminatórias dessa faixa falham, e por margem larga:

| Porta de "Publicável com ressalvas" | Exigido | Medido |
| --- | --- | --- |
| Notas `−1` no curso | no máximo **uma** | **12** |
| Aulas abaixo de 50% | **nenhuma** | **cinco** — 03 (4), 09 (2), 11 (5), 12 (3), 13 (4) |

As portas de "Publicável" (≥ 85%) falham por mais: 12 notas `−1` contra zero, **12** aulas abaixo de
70% contra nenhuma, e **três** aulas com `E` abaixo de 1 (06, 12, 24) contra `E` ≥ 1 em todas.

Vale para a versão que os auditores leram: as 32 correções desta rodada foram aplicadas depois, no
commit que traz esta seção.

**O que mudou desde 19/08 não é a classificação — é a confiança nela.** Três rodadas adversariais
completas, a última com orçamento dobrado, convergem no mesmo rótulo. E o alvo ficou mais claro: são
**12 notas `−1`** e **cinco aulas** abaixo da porta de 50%, todas nomeadas.

### O que EU errei, com contagem

**Doze defeitos que os auditores acharam nesta rodada foram criados ou deixados por mim**, em dois
padrões. Registro porque a classe de erro importa mais que os consertos.

**Padrão 1 — corrigi no ponto citado e não procurei os irmãos (nove casos).** O auditor aponta uma
linha; eu conserto aquela linha; a afirmação vive em vários lugares e os outros seguem errados.

| Aula | O que corrigi | O que deixei |
| --- | --- | --- |
| 09 | "todo exemplo do módulo" → "todo exemplo de **busca**" | a nova afirmação, também falsa |
| 28 | Parte 3 → "quinze casos" | o fecho, em "catorze" |
| 27 | "Aula 24" → "Aula 19" numa frase | a frase-irmã, quatro linhas antes |
| 08 | acrescentei o contraexemplo do CoBERT | citei faixa `106-134`, que não contém a evidência |
| 13 · 02 · 04 | marquei o superlativo | o marcador cobriu metade da frase |
| 22 → 23 | corrigi a sequência de módulos na AULA-22 | a mesma alegação **em outro arquivo**, na AULA-23 |
| 08 → 17 | acrescentei um algoritmo à contagem da AULA-08 | a contagem da AULA-17, que dependia dela |

**Padrão 2 — só corrigi o que carregava `−1` (três casos).** A faixa `6 a 11` da AULA-04, a mistura
bytes/caracteres da AULA-19 e a contradição de escopo da AULA-13 foram apontadas na R2, ficaram, e os
auditores da R3 gastaram orçamento reachando as três.

**A pior das nove, e a mais instrutiva.** Na AULA-09 eu escrevi que os 11 arquivos sem a string
`load_collection` "são scripts de criação e inserção, que não buscam". **Nove dos onze buscam**, via
`client.load()` / `collection.load()` — sinônimo funcional que o meu `grep` não pegava. Um deles é o
`04-entity(data).py` da própria aula, que carrega na linha 68 e consulta na 69: bastava abrir.
Raciocinei da **string** em vez do **comportamento**. O `grep` provava "16 contêm o literal"; eu
concluí "os outros não buscam", que ele nunca provou. É a regra 8 do curso virada do avesso —
**ausência de string não é ausência de comportamento.**

**E o caso que não é meu, mas é o mais didático de todos.** A rodada de 19/08 corrigiu, na AULA-17,
_"as Aulas 08 **e 10** estabeleceram duas restrições"_ para _"só a Aula 08"_, porque o `grep` na
AULA-10 dava zero. **Ninguém grepou a AULA-08** — que também dá zero. Estreitar uma alegação falsa
não é verificá-la: se o `grep` derrubou metade, o próximo passo era grepar a outra.

### As três regras que saíram disto, e o que elas substituem

A regra que escrevi em 19/08 depois da primeira regressão era estreita: _"achado de auditor sobre
citação literal se confere na fonte antes de aplicar"_ — cobria o que o auditor **alega**, não o que
eu **escrevo em troca**. As três que a substituem:

1. **A afirmação que substitui também é uma afirmação, e precisa da mesma prova.** Inclusive a
   evidência que vem com ela: uma faixa de linhas nova é uma citação nova.
2. **Depois de corrigir, grepe a alegação no CURSO INTEIRO, não no arquivo editado.** Meu passo de
   19/08 grepava o arquivo; dois dos nove casos tinham o irmão em outro arquivo.
3. **Corrija os MÉDIO também.** Deixar MÉDIO passar não economiza trabalho: transfere o trabalho para
   a rodada seguinte, a preço de auditor.

E uma quarta, que nenhum auditor pode pedir porque cada um vê uma aula só: **reconciliar entre
arquivos.** Duas correções desta rodada só existem por isso — AULA-08↔AULA-17 (a contagem de
algoritmos escritos à mão) e AULA-20↔AULA-21 (quem decide recuperar).

### O melhor achado da rodada é um defeito novo do repositório

O auditor da AULA-18 encontrou, no `01-CRAG-ReflectiveRetrieval.py`, algo que **nenhuma das 29 aulas
tinha pegado em três rodadas**:

```
343:    better_question = question_rewriter.invoke({"question": question})
344:    return {"documents": documents, "question": question}
```

O `transform_query` chama o LLM de reescrita, guarda em `better_question` e **retorna a pergunta
original**. `grep` confirma ocorrência única: o resultado é calculado e descartado. A busca na web
roda sobre a pergunta que já falhou. Está no arquivo que a AULA-18 chama de "o mais importante da
Fase 6" — e a AULA-21, que só o revisita de passagem, já havia achado a `format_docs` morta ali. A
aula dona do arquivo leu mais raso que a visitante.

### Contrato somente-leitura: uma violação, e a cláusula que faltava funcionou

O auditor da AULA-23 rodou `pdftotext ... > arquivo` e criou `graphrag.txt` (105.477 bytes) no
diretório de rascunho da sessão. **Não apagou** — porque o prompt desta rodada passou a dizer
explicitamente: _se criou por acidente, reporte e deixe lá; apagar é a segunda violação._ Na rodada
anterior, um auditor na mesma situação usou `rm -f` e violou duas cláusulas em vez de uma.

O arquivo está fora dos dois repositórios. Clone da Packt: **vazio**, inclusive `--ignored`, depois de
29 auditores. Um segundo auditor tentou um `>`, o shell recusou com *Permission denied*, e ele
reportou de todo modo.

### Segundo lote de correções: os achados que não carregavam `−1`

As 32 primeiras correções desta rodada atacaram as 12 notas `−1`. **Ficaram de fora dois ALTO e nove
MÉDIO/BAIXO** — e deixá-los seria repetir, na mesma sessão, o Padrão 2 que a seção acima documenta:
três defeitos da R2 voltaram na R3 porque só as `−1` foram corrigidas, e os auditores gastaram
orçamento reachando os mesmos três. Aplicada a regra: **corrija os MÉDIO também.** Mais 15 correções.

**Os dois ALTO, e os dois ficaram melhores que o relatório do auditor:**

- **AULA-05 — degrau da escada mal atribuído.** O auditor observou que o
  `05-LangChain-Unstrucured-PDF-ExtractDocumentStructure.py` já faz layout por coordenadas e
  hierarquia, degraus que a aula reserva para os arquivos `08-*` e `09-*`. Verificando: a
  reconstrução pai-filho existe mesmo (`:109-133`) e a função `analyze_layout()` existe (`:53`) —
  **mas a linha 7 do arquivo tem `# coordinates=True,` comentada.** Sem instalar o `unstructured` não
  dá para saber se a estratégia `hi_res` já traz `coordinates` no metadado de todo modo. Corrigido
  com o limite declarado em vez de trocar uma afirmação por outra não verificada.
- **AULA-15 — `parent_docs`/`child_docs` são código morto.** `grep -c` devolve **1** para cada: só a
  atribuição. O que popula os stores é `retriever.add_documents(documents)` (`:52`), que resplita
  `documents` com os splitters do construtor (`:45-50`), não as listas das linhas 34-35. A aula
  apresentava as duas variáveis como "a arquitetura de armazenamento" e o exercício mandava
  **contá-las**. Corrigidos os dois: a ressalva e o exercício, que agora conta o que o retriever
  guardou de fato.

**Os MÉDIO e BAIXO:** promessa de vocabulário não cumprida em três aulas — `MMR` e `top-k` saíram do
vocabulário da AULA-13 e `MMR` do da AULA-17, porque nenhuma das duas os expõe no corpo; e
**`multi-representação`, o termo central da AULA-16, entrou no `GLOSSARIO.md`**, que o prometia e não
o tinha. Mais: a atribuição de responsabilidade na AULA-18 (`grade_documents` produz o veredito,
`decide_to_generate` roteia), o hedge que faltava no `recursion_limit` da AULA-21, a citação
truncada da AULA-23, a linha de gravação vs. leitura na AULA-24, a ordem dos parâmetros na AULA-08,
a atribuição do `.env.example` na AULA-20, a tensão Text2SQL-é-ou-não-é-RAG entre a AULA-01 e a
AULA-12, e um "para para" na AULA-18.

**Efeito colateral que vale registrar:** duas das minhas correções introduziram referência de linha
sem arquivo antes, e o `NO_ANCHOR` subiu de 20 para 22. Reancoradas com o caminho completo, o número
caiu para **18** — duas abaixo da linha de base, porque a reancoragem resolveu também uma referência
solta que já existia. O verificador pegou o meu erro no mesmo passe.

`verify-citations --all` ao fim das duas rodadas de correção: **PASS, 1646 OK**, com `BAD_LINE`,
`MISPLACED`, `NOT_FOUND` e `BAD_ANCHOR` em zero.

### Estado ao encerrar

`verify-citations --all`: **PASS**, 1646 OK, `BAD_LINE`/`MISPLACED`/`NOT_FOUND`/`BAD_ANCHOR` em zero.
`git status --short --ignored` no clone: vazio.
47 correções aplicadas em dois lotes (32 para as notas -1, 15 para os ALTO/MÉDIO/BAIXO), cada uma
verificada na fonte por mim, com `grep` de irmãos no curso inteiro.

## Renota adversarial — QUARTA rodada, PARCIAL em 18 de 29 (20/08/2026)

**Esta seção está incompleta, e o número é 18.** As onze aulas **sem** nota nesta rodada são
**00, 01, 02, 08, 10, 14, 15, 18, 19, 21 e 22**. Elas continuam com a nota da R3. Quem retomar
começa por elas.

**Primeiro, uma contagem minha que estava errada.** O commit `899e8f0` diz "quarta rodada lotes 1-2
(13/29)" e o corpo dele lista **doze** notas. São 12, não 13. Na mesma mensagem eu também escrevi
"16 pendentes" quando eram 17. Afirmei uma contagem sem contar, no commit que documenta que esse é
o meu modo de errar — e a regra que existe justamente para isso ("CONTE as notas registradas no
GATE antes de afirmar quantas aulas foram auditadas") eu apliquei ao material e não a mim.

**Desenho:** igual ao da R3 — `general-purpose` em `sonnet`, somente-leitura, nota anterior não
revelada, proibição explícita de abrir este arquivo, o `HANDOFF.md` e o `PROMPT-CONTINUAR.md`, uma
aula por auditor, mínimo de dez citações abertas e conferidas por conteúdo. Quatro frentes novas,
cada uma nascida de um defeito medido:

1. **"Comportamento provado não é mecanismo provado."** Se a aula diz que X faz Y **via** Z, o Z se
   confere separadamente. Nasceu de eu ter provado que nove arquivos buscam e inventado *como*.
2. **"Limite declarado que não se justifica."** Se a aula diz "não dá para saber", procure a
   resposta no mesmo diretório. Hedgear demais também é erro, e viola a regra 10 da persona deste
   curso.
3. **"Grepe o padrão, não a frase."** "quatorze" e "14" são a mesma alegação em formas diferentes;
   ordinal reusado para duas coisas é contradição.
4. **"O marcador cobre a alegação inteira ou só a última cláusula?"** Quarta versão desta regra —
   cada versão anterior morreu num caso que ela não cobria.

E a cláusula de contrato que já provou funcionar duas rodadas seguidas: **"se criar arquivo por
acidente, reporte e DEIXE LÁ."** Zero remoções nesta rodada. O clone terminou vazio, incluindo
`--ignored`, depois de 47 auditores no total.

### Notas das 18, e a comparação com a R3

| Aula | R3 | **R4** | Δ |
| --- | --- | --- | --- |
| 03 — Primeiro RAG | 4 | **11** | +7 |
| 12 — Query construction | 3 | **11** | +8 |
| 13 — Query translation | 4 | **11** | +7 |
| 24 — Contextual Retrieval | 9 | **11** | +2 |
| 26 — Agentic e Adaptive | 8 | **11** | +3 |
| 25 — Modular RAG | 12 | **11** | −1 |
| 27 — Multimodal | 11 | **11** | 0 |
| 06 — Tabelas, CSV, SQL | 10 | **11** | +1 |
| 28 — Projeto final | 10 | **10** | 0 |
| 23 — GraphRAG | 7 | **9** | +2 |
| 05 — PDF, layout, OCR | 6 | **9** | +3 |
| 20 — Saída estruturada | 8 | **8** | 0 |
| 16 — Índice hierárquico | 6 | **7** | +1 |
| 04 — Texto, JSON, web | 6 | **6** | 0 |
| 17 — Reranking | 7 | **3** | −4 |
| 07 — Chunking | 9 | **3** | −6 |
| 11 — Híbrida e multimodal | 5 | **1** | −4 |
| 09 — Milvus, schema | 2 | **0** | −2 |

Somado por script: **R4 = 144, R3 = 127 nas mesmas 18.** Δ médio **+0,94**; 9 subiram, 5 caíram,
4 empataram. **Quatro aulas seguem abaixo de 50%**: 07 (3), 09 (0), 11 (1), 17 (3).

**Não há classificação nesta seção, e é de propósito.** Somar as 18 medidas na R4 com as 11 ainda
na nota da R3 dá 262/348 = 75,3%, e esse número **não é uma medição** — mistura dois instrumentos
de profundidade diferente, e a R3 já provou que o instrumento mais fundo mede mais baixo. Serve de
ordem de grandeza, não de veredito. A classificação sai quando as 29 fecharem no mesmo desenho.

### Dimensões do lote 3

| Aula | E | C | H | O | D | A | Total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 25 — Modular RAG | 2 | 2 | 2 | 1 | 2 | 2 | **11/12** |
| 27 — Multimodal | 2 | 1 | 2 | 2 | 2 | 2 | **11/12** |
| 06 — Tabelas, CSV, SQL | 2 | 2 | 1 | 2 | 2 | 2 | **11/12** |
| 28 — Projeto final | 2 | 2 | 1 | 1 | 2 | 2 | **10/12** |
| 20 — Saída estruturada | 2 | **−1** | 2 | 1 | 2 | 2 | **8/12** |
| 07 — Chunking | 1 | 1 | **−1** | 0 | 1 | 1 | **3/12** |

**Erro meu na escolha do lote.** Anunciei que escolhi 25, 27 e 28 porque "carregavam `−1` na R3".
A tabela da R3 diz o contrário: **25 tinha 12/12 com as seis dimensões em 2**, 27 tinha 11 e 28
tinha 10, nenhuma com `−1`. Os dez `−1` da R3 estavam em 26, 17, 23, 05, 16, 11, 03, 13, 12 e 09 —
todas já cobertas nos lotes 1 e 2. A metade que eu acertei foi a dimensão zerada: 06 tinha `E`=0,
07 tinha `H`=0 e 20 tinha `C`=0, e as três eram a faixa do meio. O lote foi defensável; a razão que
eu dei para ele, não.

### Os dois `−1` do lote 3

**AULA-20, `C` = −1 — alegação de ausência com número errado.** A aula afirmava que "as **duas**
ocorrências de `strict` são comentários sem relação com decodificação". `grep -rn "strict"
--include="*.py"` no repositório devolve **três**, e a terceira —
`04-VectorDB/Milvus/03-SearchAndMetrics/05-group-search.py:76: strict_group_size=True` — **não é
comentário**, é parâmetro nomeado real de outra API. A conclusão de fundo (nenhum arquivo do módulo
usa decodificação restrita) sobrevive; o número, não. Este foi o foco que eu dei ao auditor, e ele
encontrou uma instância **nova** — não a que a R3 já tinha apontado.

**AULA-07, `H` = −1 — previsão vestida de observação.** A aula manda o leitor escrever a própria
previsão e em seguida despeja, em tom declarativo, "o que você deve observar" com três `chunk_size`:
"a resposta erra ou se recusa". Não há saída de execução, e a aula usa "confirmei" quatro parágrafos
antes, quando de fato verificou algo — o que torna o tom declarativo aqui indistinguível de medição.
Corrigido com o rótulo explícito **"Previsão do autor, não medição"**, o motivo pelo qual não rodei,
e a regra de que a execução do leitor ganha da minha previsão.

### O defeito que estava no instrumento, não no material

O auditor da AULA-25 achou uma entrada duplicada de **Adaptive RAG** no `GLOSSARIO.md`: a de
`:506` desambigua o termo com cuidado, e a de `:650`, de uma linha, **contradiz** a primeira. Em vez
de conferir só a que ele nomeou, varri todas — a lição de grepar os irmãos, aplicada ao instrumento.

**Nove entradas duplicadas. Cinco delas eu criei hoje**, com o `glossario.js`, inserindo termo que
já tinha entrada: `RAG (Retrieval-Augmented Generation)`, `OCR`, `ANN`, `Top-p` e `HyDE`. As outras
quatro eram um bloco-resumo no fim de "Paradigmas avançados" que repetia `Agentic RAG`,
`Adaptive RAG`, `Modular RAG` e `Contextual Retrieval` em versões de uma linha.

**E o `checar-vocabulario.js` reportava 0 faltando — verdade que escondia as nove.** Ele media
ausência e nunca mediu excesso. Medir só uma direção do erro não é medir. O verificador agora conta
duplicação também, e as duas contagens saem juntas: **254 termos conferidos, 177 entradas, 0
faltando, 0 duplicadas.**

Resolução das nove: ficou sempre a definição mais informativa. O `Top-p` foi o caso interessante —
minha versão rica tinha caído em *Recuperação* e a fina estava em *Pós-recuperação e geração*, a
seção certa; então não foi apagar a antiga, foi mover o texto bom para o lugar certo, ao lado de
`temperature`. Nenhum dos 11 termos envolvidos se perdeu (conferido por script, um a um).

### Correções aplicadas no lote 3 — 17

14 no primeiro passe, 3 de `MÉDIO`/`BAIXO` no mesmo dia, em vez de virarem dívida:

| Aula | Defeito | Correção |
| --- | --- | --- |
| 07 | marcador cobria só a segunda cláusula | marcador na frase inteira, com "nenhuma das duas metades é verificável" |
| 07 | previsão como observação | rótulo "Previsão do autor, não medição" + motivo |
| 07 | "o `diff` se resume ao splitter" | "a diferença **relevante**", e o que o `diff` cru mostra além disso |
| 07 | `# linha 23 — "as a control"` | o comentário está na **22**; citação corrigida |
| 07 | "média das direções" como certeza | delimitado a modelos de _mean pooling_, e declarado como explicação corrente |
| GLOSSARIO | o mesmo superlativo da 07, **sem marcador**, como definição | reescrito em torno do que o chunk decide, remetendo o julgamento à aula |
| 20 | "as duas ocorrências de `strict`" | são **três**, e a terceira é parâmetro real |
| 20 | tabela põe `04-Pydantic-v1.py` no grau 2, texto diz que não chama LLM | nota de rodapé: "em espírito, não em fato" |
| 27 | `mem_limit` "em bytes" | o arquivo grava `12g` — gigabytes com sufixo do Compose |
| 28 | perde o hedge que as Aulas 21 e 26 carregam sobre o **mesmo** fato | hedge restaurado e `GraphRecursionError` nomeado |
| 28 | "27 das 28 aulas **terminaram** numa seção" | "fecham o conteúdo técnico" — Checkpoint e Vocabulário vêm depois nas 27 |
| 06 | HTML no metadado afirmado como fato, em **dois** lugares | `metadata.text_as_html`, "segundo a documentação", nos dois |
| 06 | "o `diff` revela uma escada" | o `diff` cru é dominado por docstring e `os.chdir`; a escada aparece nas chamadas |
| 25 | citação truncada sem marcador | completada: "fixed number of iterations **for retrieval**" |

A da AULA-06 é o caso a guardar: **a alegação estava em dois lugares (`:170` e `:232`), não um.**
Grepei o irmão antes de corrigir, e por isso as duas foram. Nas rodadas anteriores esse é
exatamente o defeito que eu produzi nove vezes.

E na última — a citação truncada da AULA-25 — eu escrevi "for retrieval" a partir do relatório do
auditor **antes** de abrir o paper. O `grep` com `-layout` voltou vazio, o que me obrigou a
conferir: o modo simples do `pdftotext` acha a frase, o `-layout` não, porque quebra em coluna. A
citação estava certa, mas eu a tinha escrito sem prova por alguns minutos. Reproduzir número de
relatório sem recalcular é o meu defeito mais reincidente nesta auditoria.

### Estado dos verificadores

`verify-citations --all`: **PASS**, 1658 OK, `BAD_LINE`/`MISPLACED`/`NOT_FOUND`/`BAD_ANCHOR` todos
em zero, `SKIPPED` 16, `NO_ANCHOR` 16. Vocabulário: 254 conferidos, 0 faltando, 0 duplicados.
Clone da Packt: vazio, incluindo `--ignored`.

### Lote 4 — 24 de 29, faltam cinco (20/08/2026)

**As cinco sem nota nesta rodada: 00, 01, 10, 14 e 22.** Continuam com a nota da R3. São a faixa
alta (R3 = 11, 11, 11, 11 e 12), o que significa que a rodada ainda não mediu fundo justamente onde
a R3 diz que o material está melhor — e a R3 já provou que instrumento mais fundo mede mais baixo.
Não trate as cinco como boas; trate como não medidas.

Seleção do lote pela **tabela**, não de memória: as seis mais fracas das onze restantes, por
dimensão zerada ou nota mais baixa.

| Aula | R3 | **R4** | Δ |
| --- | --- | --- | --- |
| 19 — Modelo e prompt | 10 | **12** | +2 |
| 08 — Embeddings, BM25 | 10 | **11** | +1 |
| 18 — Compressão e CRAG | 9 | **10** | +1 |
| 21 — Self-RAG | 11 | **9** | −2 |
| 02 — Vetores e similaridade | 11 | **9** | −2 |
| 15 — Small-to-big | 11 | **5** | −6 |

**Lote 4 isolado: 56 contra 62 da R3 — o único lote da quarta rodada que somou MENOS.** E o motivo
é o de sempre: as três que caíram eram as três que a R3 dava como 11/12.

**Acumulado nas 24 auditadas: R4 = 200, R3 = 189.** Δ médio **+0,46**; 12 subiram, 8 caíram, 4
empataram. **Cinco aulas abaixo de 50%:** 07 (3), 09 (0), 11 (1), 15 (5), 17 (3). Ainda **sem
classificação** — misturar 24 notas da R4 com 5 da R3 daria 256/348 = 73,6%, e isso continua somando
dois instrumentos diferentes.

#### O melhor achado do lote veio de uma violação de contrato

O auditor da **AULA-15** baixou os wheels do `langchain` e do `llama-index-core` para
`C:\Users\luanv\AppData\Local\Temp\lcdl\` para **ler o código-fonte das bibliotecas**. Isso está
fora do contrato somente-leitura. Ele reportou e não apagou, como a cláusula manda. E encontrou dois
defeitos `−1` que três rodadas anteriores não acharam:

1. **`PrevNextNodePostprocessor` não expande "antes e depois".** A classe tem
   `mode: str = Field(default="next")`, e o `_postprocess_nodes` só chama `get_forward_nodes` nesse
   modo — `get_backward_nodes` exige `mode="previous"` ou `"both"`, que a chamada do script **não
   passa**. A aula descrevia "sempre puxa 2 nós antes e depois". **E o próprio script espera o
   contrário:** duas das três perguntas de teste estão anotadas `# Should look backward`
   (`03-ForwardBackwardContextExpansion.py:59-60`). Defeito do repositório que a aula não viu, mais
   descrição errada do mecanismo.
2. **`window_size=0` não "volta ao chunking de sentença puro" — ele estoura.** O campo é
   `window_size: int = Field(default=DEFAULT_WINDOW_SIZE, ..., gt=0)`; o Pydantic levanta
   `ValidationError` na construção, antes de indexar qualquer coisa. O exercício mandava observar
   uma "resposta incompleta" que nunca aparece.

Conferi os dois **lendo os arquivos que ele deixou no disco** — a evidência já existia, e ler não é
violação nova. `mode: str = Field(default="next")` está em
`llama_index/core/postprocessor/node.py:167`; o `gt=0` está em
`llama_index/core/node_parser/text/sentence_window.py:38-42`.

**A tensão é real e vale registrar em vez de esconder:** o contrato somente-leitura proíbe
exatamente a verificação que pega esta classe de defeito. Uma aula que afirma o comportamento de uma
biblioteca de terceiros só se audita lendo a biblioteca, e a biblioteca não está instalada. Enquanto
o contrato ficar como está, **toda alegação sobre `langchain`/`llama-index` neste curso é não
auditada** — e três rodadas de "PASS" não diziam isso. Duas saídas possíveis para a próxima rodada,
as duas legítimas: autorizar leitura de fonte de biblioteca num diretório declarado, ou marcar toda
alegação desse tipo como limite declarado.

#### A outra violação, e por que o prompt a causou

O auditor da **AULA-02** rodou `pip install numpy` no `miniconda` do usuário. Meu prompt continha a
proibição absoluta ("não cria, modifica ou remove arquivo nenhum, em lugar nenhum") **e**, quatro
linhas abaixo, "`numpy` pode estar disponível: se puder calcular, calcule". Uma dica com cara de
permissão ao lado de uma proibição. Mesma classe de lacuna do `E:\tmp` na terceira rodada: o prompt
proibia sem dizer o que fazer no lugar. `numpy 2.5.2` ficou instalado; remover seria a segunda
alteração, e a decisão é do dono do ambiente.

Ambos os repositórios terminaram limpos. O clone da Packt: vazio, incluindo `--ignored`.

#### Coerência entre arquivos — três achados que auditor de uma aula só não pediria

**AULA-21 → `GLOSSARIO.md`.** A "correção honesta" da AULA-21 (o Self-RAG "decide se precisa
recuperar" é verdade **do paper**, não da implementação) chegou na AULA-18 e na AULA-20 — o auditor
confirmou que as duas hedgeiam — e **não chegou no glossário**, que seguia com a versão nua. O
glossário é a fonte que as 29 aulas apontam para definição, e eu não o estava grepando ao propagar
correção. **Segundo caso no mesmo dia** (o primeiro foi o superlativo de chunk da AULA-07). Virou
regra no `PROMPT-CONTINUAR`.

**AULA-08 → AULA-17.** A AULA-17 dizia que o RRF é "o **segundo** arquivo do curso em que você vê um
algoritmo por inteiro — depois do BM25 e do `calculate_similarity()`". Depois de dois, é o terceiro.
E a AULA-08 faz uma distinção que a AULA-17 achatava: os dois anteriores **pontuam** query contra
documento; o RRF **decide ranking**, refundindo posições. Achatar as categorias foi o que produziu o
erro de contagem. Corrigido preservando a distinção.

**AULA-18: o checkpoint contra o corpo.** O corpo estabelece, com aviso explícito, que o
`grade_documents` produz **duas** saídas e que a terceira é do paper. A pergunta 11 do Checkpoint
perguntava "quais as **três** saídas possíveis do CRAG conforme o veredito?", sem a ressalva. Quem
revisa só pelo checkpoint reaprende o que o corpo acabou de corrigir. **O checkpoint é irmão do
corpo** — classe de irmão que eu não grepava.

#### Uma correção minha que estava mais forte que a evidência

O achado do `better_question` (o defeito do CRAG que eu documentei na AULA-18, e o melhor achado da
auditoria inteira) vinha com a frase "os dois arquivos têm a mesma função com uma palavra de
diferença". O `diff` das duas funções mostra docstring, `print` e comentários também diferentes. O
que difere por uma palavra é **a linha de retorno** — que é o ponto, e continua verdadeiro.
Corrigido para dizer exatamente isso.

#### Âncoras: 17 → 10, abaixo da linha de base

Ao consertar um `NO_ANCHOR` que eu mesmo havia criado na AULA-17, escrevi o caminho **depois** do
número da linha — violando a regra que este projeto documenta: a janela de ancoragem só olha para
trás, então o arquivo tem de vir **antes**. Consertei os sete da AULA-17 de uma vez, convertendo
"linha N" solta em `caminho:linha`, que o verificador valida de verdade em vez de mandar para
conferência à mão.

`verify-citations --all`: **PASS**, **1668 OK**, `BAD_LINE`/`MISPLACED`/`NOT_FOUND`/`BAD_ANCHOR` em
zero, `SKIPPED` 16, **`NO_ANCHOR` 10** (era 16 no início da sessão). Vocabulário: 0 faltando, 0
duplicados.

#### Correções do lote 4 — 13

AULA-19 (2): transcrição do template completada com as duas seções que faltavam e o fecho, porque o
argumento fala de "escopo de cada seção, ordem"; pronome ambíguo desfeito.
AULA-17 (2 + 4 âncoras): contagem "segundo" → "terceiro" com a distinção preservada; superlativo
sobre terceiros reformulado.
AULA-08 (1): "o que quase ninguém que usa BM25 sabe" → afirmação sobre tutoriais, verificável.
AULA-02 (2): a generalização sobre objetivo contrastivo delimitada à família
`sentence-transformers` do curso, com o contraexemplo do duplo encoder; o "perto de 0,6" sem fonte
trocado por "meça no seu", que é o que a aula já ensina a fazer.
AULA-21 (1) e `GLOSSARIO.md` (2): marcador de julgamento cobrindo a frase inteira; entrada do
Self-RAG distinguindo paper de implementação; entrada do CRAG registrando que o grafo do
repositório é acíclico (quatro aulas concordam).
AULA-15 (2) e AULA-18 (3): os dois `−1` de biblioteca, a precisão do `diff`, o checkpoint e o
julgamento não marcado.

### Lote 5 — QUARTA RODADA COMPLETA, 29 de 29 (20/08/2026)

| Aula | R3 | **R4** | Δ |
| --- | --- | --- | --- |
| 10 — Índices ANN | 11 | **10** | −1 |
| 22 — Avaliação | 12 | **8** | −4 |
| 01 — O que é RAG | 11 | **5** | −6 |
| 14 — Query routing | 11 | **4** | −7 |
| 00 — Setup | 11 | **4** | −7 |

**Lote 5: 31 contra 56.** Cinco aulas, todas na faixa 11–12 da R3, perderam 25 pontos.

### Resultado da quarta rodada

| | Total | % |
| --- | --- | --- |
| **R4 (29/29)** | **231/348** | **66,4%** |
| R3 (29/29) | 245/348 | 70,4% |
| R2 (29/29) | 254/348 | 73,0% |

Δ **−14**; médio **−0,48**; **12 subiram, 13 caíram, 4 empataram.** A rodada recebeu 47 correções da
R3 mais 17 do lote 3 e 13 do lote 4 antes de medir, e a nota **desceu de novo**.

**É a terceira rodada consecutiva em que o instrumento mais fundo mede mais baixo: 73,0 → 70,4 →
66,4.** A R3 já havia estabelecido a causa (uma aula por auditor, orçamento dobrado). A R4 acrescenta
duas evidências independentes de que a queda é do instrumento e não do material:

1. **A faixa alta é a que cai.** Nos lotes 3, 4 e 5 eu ordenei a seleção da mais fraca para a mais
   forte segundo a R3. Os lotes ficaram, isoladamente: lote 3 = 54 contra 60; lote 4 = 56 contra 62;
   lote 5 = 31 contra 56. **A queda cresce conforme a nota anterior sobe.** As aulas que a R3 dava
   como 11 e 12 são as que a R4 mais rebaixa — 22 (12→8), 14 (11→4), 00 (11→4), 01 (11→5).
2. **O foco por aula explica cada queda.** Em nenhum dos casos o auditor "achou defeito novo no
   escuro": ele achou o defeito da **classe** que o prompt daquela aula mandou procurar. Alegação de
   ausência na 20, previsão-como-observação na 07, comportamento de biblioteca na 15 e na 00,
   coerência entre arquivos na 21, na 22 e na 14. O que mudou não foi o rigor genérico — foi apontar
   o auditor para a classe de defeito que aquela aula tinha.

### Classificação: **Requer revisão**

**66,4% fica abaixo do piso de 70% de "Publicável com ressalvas", então a classificação já se decide
pelo percentual, sem precisar das portas eliminatórias.** Para registro: **oito aulas abaixo de 50%**
— 09 (0), 11 (1), 07 (3), 17 (3), 00 (4), 14 (4), 01 (5), 15 (5) — contra o máximo de zero.

**Uma lacuna do meu registro, que não muda a classificação mas precisa ficar dita:** para as 12 aulas
dos lotes 1 e 2 eu anotei **só o total**, não as seis dimensões. Então **a contagem de notas `−1` da
R4 não está estabelecida**: são **8** nas 17 aulas com dimensão registrada (20, 07, 15, 22, 01, 00
com uma cada; 14 com duas), e desconhecida nas outras 12. A porta de "no máximo uma `−1`" já falharia
com 8, mas o número exato não é meu para afirmar. Quem retomar deve registrar as seis dimensões de
toda nota, sempre — foi assim que a R3 fez, e é o que permite recontar sem reauditar.

### O contrato somente-leitura estava barrando verificação, não risco

**Três auditores desta rodada saíram do contrato para ler código de biblioteca:** dois baixaram
wheels (`langchain`, `llama-index-core`) e um buscou a fonte do LangChain direto do GitHub. Todos
reportaram. E os três melhores achados técnicos da rodada vieram exatamente daí:

- os dois `−1` da AULA-15 (`mode="next"` e `Field(gt=0)`);
- a contradição da AULA-14 sobre `with_structured_output`;
- o `−1` da AULA-00 sobre o `find_dotenv()`.

**A conclusão é sobre o desenho da auditoria, não sobre os auditores.** Uma aula que afirma o
comportamento de uma biblioteca só se audita lendo a biblioteca. Enquanto o contrato proibia isso,
toda alegação desse tipo passava como "PASS" sem ter sido olhada — por três rodadas. No lote 5 eu
inverti: autorizei explicitamente a **leitura** dos wheels que já estavam no disco, com
`unzip -p` para stdout, e proibi nominalmente `pip install`, `pip download`, `unzip -d` e
`conda install` — a lacuna pela qual as duas violações passaram. **Ler não muda nada; instalar muda.**
O prompt anterior confundia as duas coisas numa proibição só.

E foi um acerto imediato: o auditor da AULA-14 leu `langchain/utils/math.py` dentro do wheel e
descobriu que a função citada pela aula **não está implementada ali** — é um `__getattr__` que
redireciona para `langchain_community`. A citação da aula funciona; o detalhe ela não menciona.

### O `GLOSSARIO.md` é o artefato mais fraco do projeto

**Cinco defeitos nele nesta sessão**, todos da mesma natureza — ele carregava a versão **sem a
ressalva** de algo que as aulas corrigiram:

| Entrada | O que estava | O que a aula ensina |
| --- | --- | --- |
| `Chunk` | "a decisão de maior impacto... e a mais negligenciada", como definição | a Aula 07 marca isso como **julgamento** |
| `Self-RAG` | "o modelo decide se precisa recuperar" | a Aula 21 corrige: verdade **do paper**, não da implementação |
| `Adaptive RAG` | entrada duplicada que **contradizia** a boa | a Aula 25 desambigua o termo |
| `Recall@k` | só o sentido de recuperação | as Aulas 10 e 22 alertam contra confundir com o recall **do índice** |
| `Structured output` | "Garante forma" | a Aula 20: só o grau 4b garante, e nada no repo usa |
| `Query routing` | "similaridade com descrições **das fontes**" | a Aula 14: no exemplo as rotas são **prompts**, não índices |

**O `Recall@k` foi encontrado por dois auditores independentes** (AULA-10 e AULA-22), em aulas
diferentes, sem saber um do outro. Cinco não é coincidência e dois independentes não é ruído: **o
glossário nunca foi reauditado enquanto as aulas eram corrigidas.** Ele é apontado por todas as 29
aulas como fonte de definição, e ficou congelado na primeira redação. **Recomendação para a próxima
sessão: uma passada de auditoria do `GLOSSARIO.md` contra as aulas, entrada por entrada** — não
remendo incidental como o desta rodada.

### Três falhas dos meus próprios verificadores, todas da mesma forma

1. O `checar-vocabulario.js` media **ausência** e nunca **excesso**: reportava "0 faltando" com nove
   entradas duplicadas no glossário, cinco delas inseridas por um script meu.
2. Consertado, ele comparava **título exato** e não viu `**MRR (Mean Reciprocal Rank)**` contra
   `**MRR (mean reciprocal rank)**` — só a capitalização diferia. Agora normaliza caixa, acento e
   pontuação.
3. Ao consertar um `NO_ANCHOR` que eu mesmo criei, escrevi o caminho **depois** do número da linha,
   contra a regra que este projeto documenta.

**As três são a mesma falha: comparar forma em vez de sentido** — que é exatamente o defeito do
material que esses verificadores auditam.

### E três vezes reproduzi número de relatório sem recalcular

É o meu defeito mais reincidente, e a quarta rodada o pegou três vezes:

1. **"13 de 29"** no commit `899e8f0`, cujo próprio corpo lista doze notas.
2. **"for retrieval"** na AULA-25, escrito antes de abrir o paper (estava certo — o `grep` com
   `-layout` voltar vazio é o que me obrigou a conferir; o modo simples do `pdftotext` acha a frase,
   o `-layout` não, porque quebra em coluna).
3. **"o `numpy` é o único com divergência de versão maior"** na AULA-00. Dos **102** pacotes pinados
   nos dois `requirements`, seis divergem e **três** trocam o número principal (`async-timeout` 4→5,
   `certifi` 2025→2024, `numpy` 1→2). O número "seis" do relatório estava certo; o adjetivo "único",
   não — e eu copiei os dois.

**Onde eu acertei o método:** no `−1` da AULA-00 o auditor **declarou** não ter verificado — derivou
o algoritmo do `find_dotenv()` de memória e pediu confirmação empírica. Fui à fonte: o
`python-dotenv` 1.1.0 está instalado nesta máquina, e `dotenv/main.py:312` faz
`path = os.path.dirname(os.path.abspath(frame_filename))`. Ele está certo — e **incompleto**: o mesmo
`find_dotenv()` usa `os.getcwd()` quando detecta REPL, notebook ou depurador. Como o repositório tem
`.ipynb`, **a aula está errada para script `.py` e certa para notebook** — nuance que só apareceu
lendo o código, e que a correção agora registra nos dois caminhos.

### Correções do lote 5 — 21

GLOSSARIO (4): `MRR` desduplicado, `Recall@k` com os dois sentidos, `Structured output` por grau,
`Query routing` distinguindo rota-de-fonte de rota-de-prompt.
AULA-14 (4): o `with_structured_output` reescrito como indução + validação com erro, citando o grau
4a da Aula 20; a atribuição à Aula 12 desfeita (ela não usa "roteamento" em nenhum ponto — `grep -c`
dá 0); números de exemplo marcados como ilustrativos; "são três linhas" afrouxado.
AULA-01 (4): "28 aulas" → **27** (o curso tem 29, e a nota fala do que vem **depois** da 01);
marcador cobrindo a frase inteira; nota de rodapé sobre a fronteira Text2SQL, avisando que a Aula 06
usa "RAG" em sentido estrito e vem **antes** da Aula 12, que reclassifica.
AULA-06 (2): as duas passagens que opunham "RAG" a Text2SQL sem ressalva.
AULA-22 (1): "o único A/B controlado do repositório" → "deste módulo", porque a Aula 24 descreve seis
retrievers comparados dois a dois e diz ser "o desenho experimental que a Aula 22 pediu".
AULA-28 (1): **minha correção de hoje que consertou o verbo e deixou a contagem** — "vinte e sete das
vinte e oito" com uma exceção, quando são 29 aulas e **duas** não têm a seção (a 01 e a própria 28,
que faz a afirmação).
AULA-00 (5): o mecanismo do `load_dotenv`; o `.venv-langchain` que era criado no Passo 1 e **nunca
instalado**, apesar de a aula justificar os dois ambientes pelo conflito de `numpy`; os seis pacotes
divergentes com a contagem refeita; dois comparativos sem marcador; e uma duplicação de frase que a
minha própria edição criou e o `grep` do irmão pegou.

### Estado dos verificadores no fecho

`verify-citations --all`: **PASS**, `BAD_LINE`/`MISPLACED`/`NOT_FOUND`/`BAD_ANCHOR` em zero,
`NO_ANCHOR` em **10** (era 16 no início da sessão). Vocabulário: **0 faltando, 0 duplicados**, com o
detector normalizando caixa. Clone da Packt: **vazio, incluindo `--ignored`**, depois de **57**
auditores nas quatro rodadas.

## Auditoria do GLOSSARIO.md — entrada por entrada, 174 de 174 (20/08/2026)

Este arquivo é apontado pelas 29 aulas como fonte de definição e **nunca havia sido reauditado
enquanto as aulas eram corrigidas**. A quarta rodada de renota achou cinco defeitos nele por
acidente, um deles por dois auditores independentes; isso motivou uma passada dedicada.

**Desenho:** seis auditores `general-purpose` em `sonnet`, somente-leitura, um por grupo de seções,
com a **contagem esperada de entradas declarada** para cada um conferir cobertura em vez de supor.
Leitura de fonte de biblioteca autorizada (wheels já no disco, `unzip -p` para stdout);
`pip install`/`pip download`/`unzip -d`/`conda install` proibidos nominalmente. Cada auditor tinha
de entregar **uma linha de tabela por entrada** — sem isso o relatório não valeria.

**A pergunta era relacional, não textual.** O defeito do glossário não está dentro da entrada: está
na relação entre a entrada e a aula que corrigiu o conceito. Auditor que só lê o glossário não acha
nada. Por isso cada um recebeu cinco perguntas por entrada: qual aula ensina isto; a entrada
concorda com a aula **inclusive no grau de certeza**; a afirmação é verdadeira; está na seção certa;
é duplicata em substância de outra.

### Resultado

| Seção(ões) | Entradas | OK | CRÍTICO | ALTO | MÉDIO | BAIXO |
| --- | --- | --- | --- | --- | --- | --- |
| Fundamentos · Ingestão · Chunking | 24 | 20 | 1 | 1 | 2 | — |
| Embeddings · Similaridade | 17 | 13 | — | 3 | 1 | — |
| Vector DB e índices · Recuperação | 23 | 21 | — | 1 | 1 | — |
| Pré-recuperação · Avaliação | 26 | 19 | — | 5 | 1 | 1 |
| Pós-recuperação e geração | 37 | 32 | — | 1 | 4 | — |
| Paradigmas avançados | 47 | 41 | — | 1 | 4 | 1 |
| **Total** | **174** | **146** | **1** | **12** | **13** | **2** |

**28 defeitos em 174 entradas (146 passaram sem ressalva), e o padrão é monótono: em quase todos, o glossário apaga a ressalva
da aula.** Não é uma coleção de erros variados — é uma única falha repetida vinte e oito vezes. É o
que se espera de um artefato escrito uma vez e nunca revisitado enquanto a fonte mudava.

### O CRÍTICO: o glossário se contradizia em duas linhas consecutivas

A entrada `Sliding window` dizia "cada sentença é indexada **com suas vizinhas** como contexto". A
Aula 15 mostra o contrário: cada nó guarda **uma** sentença como conteúdo indexado, as vizinhas ficam
no metadado `window`, e o `MetadataReplacementPostProcessor` só as traz **depois** da recuperação. E a
entrada `Small-to-big`, **duas linhas abaixo**, enuncia corretamente o princípio que a primeira
violava: "o que se indexa não precisa ser o que se entrega".

Nenhum auditor de aula única veria isso. Só quem lê o glossário como documento vê duas entradas
vizinhas dizendo o oposto.

### Cinco defeitos eram meus, criados nesta mesma sessão

As entradas que eu inseri durante a quarta rodada trouxeram consigo o defeito que a rodada
perseguia:

| Entrada | O que eu escrevi | O que a fonte diz |
| --- | --- | --- |
| `Golden standard` | "e é a falha mais cara de uma avaliação" | a Aula 22 escreve "essa é, **julgamento**, a falha mais cara" — **eu apaguei o marcador ao copiar** |
| `Abstention` | "troca falso-negativo por falso-positivo" | **invertido**: autorizar abstenção faz o modelo recusar onde o contexto servia, logo você **ganha** falso negativo |
| `Function calling` | "e o código a executa" | a Aula 20: "usá-lo apenas para extrair um objeto, sem função nenhuma para executar, **é prática corrente**" — e nenhum dos dois exemplos do módulo executa função |
| `Entity extraction` | "é a etapa **mais cara** da indexação" | a Aula 23 diz, marcando como julgamento, "a **primeira** fonte de custo escondido, e a **menos discutida**" — o paper dá só o custo agregado (281 min), sem decompor |
| `Anisotropia` | "pares sem relação pontuam bem acima de 0" | a Aula 02, **que eu hedgeei nesta mesma sessão**, diz "costumam" e "o piso é propriedade do modelo — meça no seu" |

A última é a mais instrutiva: eu corrigi a aula e deixei o glossário afirmando a versão antiga. A
correção durou duas horas antes de virar incoerência.

### Passada estrutural — feita por mim, antes de distribuir

Antes dos auditores, construí o mapa **termo → aulas que o mencionam** e varri duplicata e
posicionamento. Os defeitos encontrados eram todos das entradas que eu inserira horas antes,
**ancoradas pelo vizinho conveniente e não pela semântica da seção**:

- **Cinco entradas na seção errada:** `Golden standard` (avaliação, estava em índices), `LangGraph`,
  `Vision model`, `Text-to-image` (geração, estavam em Recuperação) e `Vector store` (banco vetorial,
  estava em Ingestão).
- **Duas duplicatas semânticas**, que nenhum detector automático vê porque comparam título e não
  sentido: `Tool calling` × `Function calling / Tool use`, e `Abstention` × `Abstention (abstenção)`.
  Nos dois casos a minha entrada era a mais completa **e** estava na seção errada, e a antiga era
  mais fina e estava no lugar certo — então a correção foi fundir: texto bom, posição certa.
- **Uma entrada órfã:** `MMR (Maximal Marginal Relevance)` não aparece em nenhuma das 29 aulas. O
  auditor da seção C confirmou independentemente e apontou o motivo: o curso resolve diversidade por
  prompt (Aula 19), não por MMR. Marcada como fora do escopo, não removida.
- **Uma entrada faltante:** `claim / covariate`, prometida no vocabulário da Aula 23 e ausente.
  Criada.
- **Quatro métricas fora de lugar:** `Hit rate`, `MRR`, `Pass@K` e `Exact match` estavam no fim de
  "Paradigmas avançados". Métrica não é paradigma; foram para "Avaliação", onde o vocabulário
  equivalente já morava.

174 → 175 entradas (duas duplicatas fundidas, uma criada, uma que já tinha sido fundida antes).

### Cinco falhas dos meus verificadores, e a pior delas

Esta auditoria expôs **cinco** pontos cegos nos meus próprios instrumentos, e os cinco são a mesma
falha: **comparar forma em vez de sentido** — que é exatamente o defeito do material que eles
auditam.

1. O `checar-vocabulario.js` media **ausência** e nunca **excesso**: dizia "0 faltando" com nove
   entradas duplicadas.
2. Consertado, comparava **título exato** e não viu `**MRR (Mean Reciprocal Rank)**` contra
   `**MRR (mean reciprocal rank)**`. Passou a normalizar caixa, acento e pontuação.
3. O mapa termo→aulas tratava título com barra como **string única**, e devolveu **10 entradas
   órfãs das quais 7 eram falsas** (`Loader / Reader`, `RAGAS / TruLens / DeepEval`…). Passou a
   tratar barra como alternativa: 10 → 3.
4. **A pior, porque falseou o número da sessão inteira:** o filtro de caminho do
   `checar-vocabulario.js` (`!/[\/]/`) descartava **qualquer** termo com barra, tratando-o como path.
   `claim / covariate` — prometido pela Aula 23, ausente do glossário — foi jogado fora em silêncio,
   e o verificador reportou **"0 faltando" durante toda a sessão**. O filtro que exclui ruído estava
   excluindo sinal. A distinção que faltava: caminho real não tem espaço em volta da barra.
5. Mesmo problema no filtro de parêntese (`!/[()]/`), que descartava `QFS (query-focused
   summarization)`, `RRF (Reciprocal Rank Fusion)`, `CRAG (Corrective RAG)` e outros três como se
   fossem chamada de código. Distinção que faltava: chamada tem `(` colado no identificador.

Com os dois filtros estreitados o verificador passou a conferir **267 termos em vez de 254**, e
achou **2 ausências reais** — `claim / covariate` e `adaptive (active) retrieval` (este coberto em
substância pela entrada `Adaptive RAG`, que passou a carregar o termo no título).

**A lição, que vale além deste arquivo:** um filtro de ruído é uma afirmação sobre o que não importa,
e afirmação não verificada é a classe de defeito dominante deste projeto. Eu escrevi cinco filtros e
não medi nenhum. Medi-los custou um comando.

### Nota de contrato

Um relatório terminou colando `M GLOSSARIO.md` como se fosse o `git status` do clone da Packt. Esse
arquivo **não existe** no clone — o auditor rodou o comando no diretório errado e rotulou errado.
Conferido: o clone terminou **vazio, incluindo `--ignored`**. Os outros cinco relataram corretamente.
Nenhuma violação de contrato nesta rodada — a primeira em que os prompts trazem `pip install`
proibido nominalmente.

### Estado no fecho

`verify-citations --all`: **PASS**, zero inválidas, `NO_ANCHOR` em 10. Vocabulário: **267 termos
conferidos, 0 faltando, 0 duplicados** (textual e normalizado). Duplicata semântica por contenção:
**0** confirmadas — o gerador de candidatos devolve 18, e ler mostra que 16 são conceitos legítimos
onde um termo contém outro (`Chunk` em `Chunk size`, `FLAT` em `IVF_FLAT`). Clone da Packt: vazio.

## QUINTA rodada — as oito aulas abaixo de 50%, renotadas (20/08/2026)

**Objetivo:** medir o efeito dos 23 consertos aplicados nas oito aulas que a R4 deixou abaixo de
50%. Rodada **cega**: nota anterior escondida, lista de consertos escondida, `GATE`/`HANDOFF`/
`PROMPT-CONTINUAR` proibidos.

### Uma mudança de instrumento, declarada antes de rodar

A R4 deu a cada auditor um **foco específico** da classe de defeito daquela aula. A R5 usou um
**briefing uniforme** nas oito — as nove classes de defeito que a sessão produziu, na mesma ordem
para todas. Motivo: um foco dirigido apontaria para terreno já consertado, e o auditor gastaria
orçamento confirmando conserto em vez de procurar o que sobrou.

**Isso é um confundimento, e ele não se resolve com estes dados.** Duas coisas mudaram ao mesmo
tempo: o material foi corrigido e o briefing deixou de dar o mapa. Um briefing sem mapa pode achar
menos por não saber onde cavar — inflando a nota — ou mais, por não ter viés. O que se pode afirmar
está na seção "o que restringe a leitura", abaixo.

Novidade no briefing, nascida de um erro da própria sessão: **as duas formas de marcador de
julgamento** do curso (`**Julgamento:**` no início e `é, **julgamento**,` inline) foram declaradas
convenção estabelecida, com instrução explícita de não gastar achado nisso. Na rodada anterior dois
auditores deram veredictos **opostos** sobre a mesma convenção, cada um alegando que a forma do outro
a violava.

### Resultado

| Aula | R4 | **R5** | Δ |
| --- | --- | --- | --- |
| 14 — Query routing | 4 | **11** | +7 |
| 17 — Reranking | 3 | **11** | +8 |
| 09 — Milvus, schema | 0 | **10** | +10 |
| 01 — O que é RAG | 5 | **10** | +5 |
| 00 — Setup | 4 | **10** | +6 |
| 11 — Híbrida e multimodal | 1 | **9** | +8 |
| 15 — Small-to-big | 5 | **9** | +4 |
| 07 — Chunking | 3 | **7** | +4 |
| **Total** | **25/96** | **77/96** | **+52** |

**26,0% → 80,2%.** Δ médio **+6,50**. **Nenhuma das oito ficou abaixo de 50%** (eram oito de oito) e
**uma única nota `−1`** na rodada (eram seis notas `−1` entre as oito na R4).

**Não há classificação nova do curso.** Somar as 21 notas da R4 com estas 8 da R5 dá 283/348 = 81,3%,
e esse número mistura duas rodadas e dois briefings. Não é medição homogênea e não vai para o
cabeçalho.

### O que restringe a leitura do +52

**A rodada não foi leniente, e há prova disso: 6 dos 13 defeitos que ela achou foram introduzidos
pelos meus próprios consertos, horas antes.** Ou seja, a capacidade de discriminar em material novo
estava intacta — ela pegou exatamente o que não existia na R4. E o único `−1` da rodada é um deles.

| Defeito achado na R5 | Origem |
| --- | --- |
| `−1` na AULA-07: "exige `unstructured`" | **meu conserto de hoje** — justificativa **fabricada**; o script usa `PDFReader`/`pypdf`, e `unstructured` é de outro módulo |
| CRÍTICO na AULA-15: "mas a aula descrevia o mecanismo errado" | **meu conserto de hoje** — nota sobre a versão anterior que ficou no texto publicado, onde se autonega |
| ALTO na AULA-01: "o `GLOSSARIO.md` segue a Aula 12" | **meu conserto de hoje** — referência **circular** que eu criei: horas depois reescrevi a entrada do glossário para tratar o ponto como fronteira aberta, apontando de volta para esta nota |
| ALTO na AULA-00: `.idea/.gitignore` "com seis linhas" | **meu conserto de hoje** — o arquivo tem **dez** (6 padrões + 4 comentários); peguei o "6" do relatório anterior sem contar |
| MÉDIO na AULA-14: previsão de comportamento sem ressalva | **meu conserto de hoje** — introduzi uma previsão não marcada ao consertar uma alegação de garantia, no arquivo que hedgeia números três parágrafos depois |
| BAIXO na AULA-00: pacotes atribuídos ao "par" de requirements | **meu conserto de hoje** — só o arquivo LangChain tem `langchain-deepseek`/`langgraph-prebuilt`; `grep -c` no do LlamaIndex dá 0 |

**Quinta vez na sessão que reproduzi número de relatório sem recalcular** (o "seis linhas"), e essa
correção entrou no commit onde eu documentei que esse é o meu modo de errar.

Os outros sete defeitos são do material e não passaram por rodada anterior nenhuma:

- **AULA-09:** `sparse vector` prometido no vocabulário e ausente do corpo (o corpo trata
  `FLOAT_VECTOR` e `BINARY_VECTOR`); e `tenant_id`, `ano`, `categoria`, `preço` apresentados junto à
  referência ao DDL de `game_scenes`, cujas colunas reais são `difficulty_level`, `boss_name`,
  `created_at`.
- **AULA-11:** o exercício 1 manda consultar por identificador (`SKU-`, código de erro) contra um
  corpus — `battle_scenes.json`, cinco registros — que **não tem identificador no texto indexado**: o
  campo `id` (`COMBAT_001`) nunca entra nos documentos, montados de `title`, `description`,
  `combat_details` e `scene_info`. O exercício não podia entregar o que prometia.
- **AULA-17:** os exercícios 2 e 3 pressupõem recuperação com `k` ajustável, e os dois arquivos
  citados **não têm recuperação nenhuma** — `grep -c "retriever\|k="` devolve zero, e os documentos
  são lista Python fixa de três.
- **AULA-07:** o rodapé diz "Anterior: AULA 03" enquanto o rodapé da AULA-06 diz "Próxima: AULA 07".
- **AULA-01:** "duas a três ordens de magnitude" sem marcador, num arquivo que marca julgamento em
  vários outros pontos.

### O achado que corrige uma decisão minha

A R4 apontou a expressão `color like "red%"` da AULA-09 como inventada, e **eu rejeitei** — porque as
cores daquele arquivo são literalmente `red_7025`, `red_4794`, `red_9392`, e a justificativa do
auditor estava errada. A R5 apontou a **mesma linha** com raciocínio diferente e correto: a frase diz
"quando a Aula 10 **mostrar** filtered search com expressões como `color like "red%"`", e a Aula 10
mostra `color like "color_%"`. O defeito é de **atribuição**, não de expressão.

**Rejeitar o raciocínio errado não me autorizava a manter a linha.** Corrigido citando o filtro real
e registrando que a expressão vale para os dados daquele arquivo, em outra collection.

### Consertos: 13 dos 19 achados

Seis ficaram de fora com motivo, não por esquecimento: `metadata filter` no vocabulário da AULA-09
(o conceito **está** no corpo, em 13 menções a filtro e escalar); duas generalizações retóricas de
abertura na AULA-01 e na AULA-00 ("todo o resto do curso é sobre por que cada passo falha", "o resto
é dado, PDF e imagem"); a assimetria de callback nominal entre a AULA-01 e a AULA-22, que não é
contradição; o shim `langchain_core.pydantic_v1` já obsoleto no exemplo da AULA-14, que o próprio
auditor classificou como tangencial ao ensinamento; e o `print` do `06-RecencyWeightedReranking.py`
que diz "~39% de decaimento" onde a fórmula do arquivo dá 50% — **defeito do repositório da Packt**,
que a AULA-17 não reproduz nem invoca.

### Estado no fecho

`verify-citations --all`: **PASS**, zero inválidas, `NO_ANCHOR` em 10. Vocabulário: **0 faltando, 0
duplicados**. Clone da Packt: **vazio, incluindo `--ignored`**, e zero violações de contrato — segunda
rodada consecutiva desde que `pip install` passou a ser proibido nominalmente.
