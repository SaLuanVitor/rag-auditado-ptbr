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
