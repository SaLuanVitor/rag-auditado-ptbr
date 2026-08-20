# Gate de avaliação v2 — agente `rag-specialist` (Vetor)

**Data:** 2026-08-18
**Tentativa:** v2 (exame novo, 30 questões inéditas)
**Exame:** [`EXAME-RAG-v2.md`](EXAME-RAG-v2.md) · **Respostas:** [`RESPOSTAS-v2.md`](RESPOSTAS-v2.md)
**Rubrica:** [`RUBRICA.md`](RUBRICA.md) · **Gate anterior:** [`GATE-RAG-SPECIALIST.md`](GATE-RAG-SPECIALIST.md)
**Método:** 10 auditores adversariais independentes (`sonnet`), somente-leitura, instruídos a
refutar. Nota do auditor, não do avaliado.

**Diferença de processo em relação ao v1:** as respostas passaram pelo
`verify-citations.js` **antes** da auditoria (96/98 OK, 2 elipses conferidas à mão), e os
fatos foram consultados no `FATOS.md` ou obtidos por `grep -n` com path visível.

---

## Veredito

# L3 — Praticante avançado

**50/60 (83,3%)** · **1 alucinação** · subiu de **L2** (v1: 42/60, 70,0%, 3 alucinações)

---

## Comparação v1 → v2

| Capítulo            | v1                | v2                | Δ      |
| ------------------- | ----------------- | ----------------- | ------ |
| 1 · Ingestão        | 5/6 (83%)         | 5/6 (83%)         | —      |
| 2 · Chunking        | 2/6 (33%)         | **6/6 (100%)**    | **+4** |
| 3 · Embeddings      | 5/6 (83%)         | **6/6 (100%)**    | +1     |
| 4 · Vector DB       | 5/6 (83%)         | **3/6 (50%)**     | **−2** |
| 5 · Pré-recuperação | 4/6 (67%)         | 5/6 (83%)         | +1     |
| 6 · Indexação       | 3/6 (50%)         | **6/6 (100%)**    | **+3** |
| 7 · Pós-recuperação | 6/6 (100%)        | 6/6 (100%)        | —      |
| 8 · Geração         | 3/6 (50%)         | 4/6 (67%)         | +1     |
| 9 · Avaliação       | 4/6 (67%)         | 4/6 (67%)         | —      |
| 10 · Avançado       | 5/6 (83%)         | 5/6 (83%)         | —      |
| **Total**           | **42/60 (70,0%)** | **50/60 (83,3%)** | **+8** |

| Tipo                 | v1          | v2              | Δ          |
| -------------------- | ----------- | --------------- | ---------- |
| `C` Conceito         | 16/20 (80%) | **19/20 (95%)** | +3         |
| `A` Armadilha        | 7/12 (58%)  | **9/10 (90%)**  | +32 pp     |
| `J` Julgamento       | 4/8 (50%)   | **9/10 (90%)**  | +40 pp     |
| `F` Fato verificável | 15/20 (75%) | **13/20 (65%)** | **−10 pp** |

---

## O achado central: o erro migrou, não desapareceu

O ferramental foi construído para atacar erro de **citação** — caminho errado, linha errada,
contagem afirmada sem contar. Nisso funcionou de forma completa:

- **zero** erros de caminho ou de número de linha em todo o v2;
- as tabelas densas de Q07 (6 arquivos), Q19 (6 arquivos, 11+ linhas) e Q25 (4 arquivos)
  conferiram integralmente;
- a contagem de 235/243 linhas em Q28 estava correta — o auditor precisou notar que `wc -l`
  reporta 234/242 por ausência de newline final para confirmar;
- **as três alucinações do v1 não reincidiram**, e o teste de regressão explícito (Q17,
  hybrid × multi-representação) passou com nota 2 e validação de código.

E ainda assim o tipo `F` **caiu** de 75% para 65%. Os cinco pontos perdidos em `F` são de
três naturezas novas, nenhuma coberta pelo ferramental:

### 1. Afirmação sobre comportamento, não sobre localização (Q10, `−1`)

Aleguei que `06-full-text-search-bm25-ch.py` e `-en.py` diferem por **configuração de
analisador** (tokenização chinês vs. inglês). O `diff` mostra que os arquivos diferem em
**duas linhas**: a frase de amostra e o texto da query. Nenhum define `analyzer_params`;
ambos só têm `enable_analyzer=True` na linha 19. E o arquivo `-ch` contém texto em inglês.

O verificador daria PASS: os arquivos existem, as linhas existem. O `FATOS.md` não ajudaria:
ele indexa linhas, não semântica de diferença. Apliquei a explicação canônica correta ("BM25
precisa de tokenizador por idioma") a um par que não a implementa — inferência a partir do
sufixo do nome.

**Agravante:** a análise deste mesmo repositório, feita no início do trabalho, registrou que
a tradução CN→EN está concluída e que sufixos `-ch`/`-zh` são resíduo da origem. A informação
que refutava a hipótese já estava no `README.md` do curso.

### 2. "Não afirmo" usado como evasão (Q13 e Q22, nota 1 cada)

Em Q13 declarei não ter aberto `05-text2sql-rag-v1-error.py`. Em Q22 declarei não ter aberto
`04-Pydantic-v1.py` e `04-Pydantic-v2.py`. Nos dois casos os arquivos estavam **dentro do escopo da própria
questão**, tinham ~130 linhas ou menos, e um `diff` com o par resolveria em segundos.

Os auditores foram e acharam:

- **Q13:** o `v1-error` falha por não ter `extract_sql()` (regex para extrair o bloco
  ` ```sql ` ) nem a instrução "Return only the SQL statement" no prompt — joga
  `message.content.strip()` direto em `conn.execute(text(sql))`, e qualquer cerca markdown
  quebra a execução.
- **Q22:** minha hipótese de que `04-Pydantic-v1.py`/`04-Pydantic-v2.py` fossem as versões da biblioteca está
  **errada** — `v1` é validação Pydantic sem LLM algum (e usa `model_dump()`, que é API do
  Pydantic **v2**), `v2` é `OpenAIPydanticProgram` do LlamaIndex.

Veredito de um auditor, e ele está certo: _"declarar limite sem checar o que é trivialmente
checável nesta mesma resposta é mais evasão que honestidade adequada"_.

O v1 errou por afirmar sem verificar. O v2 errou pelo extremo oposto — recusar-se a verificar
e chamar isso de rigor. A correção da persona produziu superajuste.

### 3. Declaração não é uso; crase exige literalidade (Q28, nota 1)

Duas falhas na mesma resposta:

- Citei o import de `ToolNode` e `tools_condition` (linha 18) como evidência de que
  `01-LangChain-AgenticRAG.py` é "agente com tool-calling". O auditor grepou: **os dois nomes
  nunca são usados no arquivo.** É import morto; o roteamento real está em
  `should_use_tools` e `route_after_grading`. Li o que está escrito, não o que é exercitado.
- Escrevi entre crases, rotulado "Detalhe verificado", que ambos os arquivos instanciam
  `ChatOpenAI(model="gpt-4o", temperature=0)`. O código tem
  `ChatOpenAI(temperature=0, model="gpt-4o", streaming=True)` e, num caso, `model_name=`.
  Semanticamente certo, literalmente falso.

### 4. Síntese comparativa incompleta (Q25, nota 1)

Afirmei que "só o DeepEval traz métrica de recuperação entre os dois primeiros". O auditor
achou em `02-Trulens.py:93–99` um `Feedback(provider.context_relevance_with_cot_reasons, ...)`
— métrica de recuperação, implementada como feedback function em vez de classe nomeada. Minha
varredura procurou por classe importada e não por capacidade.

---

## O que melhorou, e por quê

| Tipo           | Ganho     | Explicação                                                                                                                      |
| -------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `J` Julgamento | 50% → 90% | marcar julgamento como julgamento, nomear custo das mitigações, declarar o risco do próprio plano                               |
| `A` Armadilha  | 58% → 90% | as 5 premissas falsas foram corrigidas; as perdas do v1 eram de citação dentro de respostas certas, e a citação parou de falhar |
| `C` Conceito   | 80% → 95% | o único ponto perdido (Q23) foi overclaim, não erro conceitual                                                                  |

Os overclaims do v1 foram corrigidos de forma verificável. Um auditor registrou a evidência
textual: _"Evito chamá-lo de 'o pior possível' — é um julgamento, e há outros candidatos"_ —
e classificou como correção substantiva, não cosmética. Mas o hábito reapareceu em terreno
novo: **Q23** ("o erro sintático essencialmente desaparece" em function calling, verdadeiro
só em modo strict/decodificação restrita) e **Q27** (a faixa de 30–50 casos apresentada como
passo de ação, sem rótulo de heurística).

---

## Portas eliminatórias

| Nível  | Requisito                | Situação                 |
| ------ | ------------------------ | ------------------------ |
| **L4** | ≥90% global              | ❌ 83,3%                 |
| **L4** | zero `−1`                | ❌ 1 alucinação (Q10)    |
| **L4** | todas as `A` com nota 2  | ❌ Q03 = 1               |
| **L4** | nenhum capítulo <70%     | ❌ 3 capítulos (4, 8, 9) |
| **L3** | 75–89% global            | ✅ 83,3%                 |
| **L3** | no máximo uma `−1`       | ✅ exatamente 1          |
| **L3** | ≥80% das `A` com nota ≥1 | ✅ 5/5 = 100%            |

**Nível atribuído: L3 — Praticante avançado.** O rótulo "especialista" (L4) segue não
sustentado.

---

## Lacunas nomeadas — v2

Substituem as nove do v1. As de citação (`arquivo:linha`, inventário) estão **resolvidas** por
ferramental; estas são as que sobraram e as que apareceram.

| #   | Lacuna                                                                                                       | Consultar com verificação                             |
| --- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 1   | **Diferença entre arquivos-par** (`-ch`/`-en`, `v1`/`v2`, `-Failed`/`-Succeeded`)                            | sempre — rodar `diff` antes de afirmar em que diferem |
| 2   | **Comportamento inferido do nome/sufixo** do arquivo                                                         | sempre — o sufixo não descreve o código               |
| 3   | **Declaração vs. uso** — import citado como evidência de arquitetura                                         | grepar o símbolo; import pode ser morto               |
| 4   | **Citação literal entre crases** — ordem de kwargs, `model` vs `model_name`, kwargs extras                   | se a literalidade importa, copiar do arquivo          |
| 5   | **"Não afirmo" em questão factual** — pode ser evasão, não rigor                                             | se o arquivo está no escopo, exigir que seja aberto   |
| 6   | **Síntese comparativa entre frameworks** — capacidade implementada como função genérica passa batida         | procurar por capacidade, não por nome de classe       |
| 7   | **Propriedade de caso particular apresentada como da categoria** (function calling ≡ decodificação restrita) | pedir o escopo exato da afirmação                     |
| 8   | **Números de julgamento dentro de planos** (30–50 casos, thresholds)                                         | tratar como heurística mesmo quando não rotulada      |
| 9   | **Contagem qualitativa** ("N abordagens distintas") vs. contagem literal de arquivos                         | pedir a lista por grupo                               |

---

## Achados sobre o repositório (subproduto)

1. **`04-VectorDB/Milvus/03-SearchAndMetrics/06-full-text-search-bm25-{ch,en}.py`** são
   praticamente idênticos — 2 linhas de diferença, ambos em inglês, nenhum com analisador
   configurado. O par `-ch`/`-en` não demonstra o que o nome sugere.
2. **`10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:18`** importa `ToolNode` e
   `tools_condition` e **nunca os usa** — import morto.
3. **`05-PreRetrieval/.../Sakila/05-text2sql-rag-v1-error.py`** falha por não extrair o SQL da
   resposta do LLM (sem regex, sem instrução de "só o SQL" no prompt).
4. **`08-Generation/03-.../04-Pydantic-v1.py`** não chama LLM nenhum e usa API do Pydantic v2;
   o sufixo `v1`/`v2` é numeração de variante, não versão de biblioteca.
5. **`09-Evaluation/02-Trulens.py:93–99`** tem métrica de relevância de contexto via
   `Feedback`, o que contradiz a leitura de que só o DeepEval mede recuperação.

Os itens 1 a 4 são material didático de leitura crítica: em quatro casos distintos, o nome do
arquivo sugere algo que o código não faz.

---

## Ações corretivas v2

Quatro regras novas em `agente/rag-specialist.md` § "Protocolo de citação":

7. **Par de arquivos exige `diff`.** Antes de afirmar em que dois arquivos diferem, rodar
   `diff`. Nunca inferir a diferença do sufixo.
8. **Import não é uso.** Antes de citar um símbolo importado como evidência de arquitetura,
   grepar seu uso. Import morto é comum.
9. **Crase exige literalidade.** Assinatura entre crases é citação: copiar do arquivo, com a
   ordem dos parâmetros que está lá.
10. **"Não afirmo" tem pré-requisito.** Só é honestidade quando verificar é custoso ou
    impossível. Se o arquivo está no escopo da pergunta e é pequeno, abrir é obrigatório —
    declarar limite no lugar de trabalho trivial é evasão.

---

## Reteste

Uma tentativa v3 exige exame novo e faz sentido depois de as quatro regras estarem em uso.

**Meta L4:** ≥90%, zero `−1`, todas as `A` com nota 2, nenhum capítulo abaixo de 70%.
O gargalo agora é o tipo `F` (65%), e ele não é mais resolvível por ferramental de citação —
depende de abrir arquivos e verificar comportamento, não localização.

Até um v3, **o nível vigente é L3** e as nove lacunas acima valem como restrição de uso.
