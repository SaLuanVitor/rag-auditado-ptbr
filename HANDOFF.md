# HANDOFF — Curso RAG PT-BR e agente `@rag-specialist`

**Data:** 2026-08-20
**Estado:** ✅ **CURSO COMPLETO — 29 de 29 aulas** (`AULA-00` a `AULA-28`) · agente em **L3**
**Verificação:** `verify-citations --all` = **PASS** — 1622 OK, zero inválidas. `BAD_LINE`,
`MISPLACED`, `NOT_FOUND` e `BAD_ANCHOR` todos em **0**; restam 16 `SKIPPED` (glob ou elipse) e
20 `NO_ANCHOR`, ambos conferência à mão por desenho
**Auditoria:** cobertura **29 de 29** — as 8 que faltavam (08, 15, 16, 19-23) foram auditadas nos
lotes A-D em 19/08. **Recontado por script em 20/08:** as 29 aulas têm nota registrada no GATE, sem
lacuna. Todas as 29 notas são **pré-correção**, então o que ainda bloqueia o veredicto é a renota
**Renota:** ✅ **29 de 29 — COMPLETA.** As 9 de 19/08 mais as 20 de 20/08 (lotes B, E, G, I, J, K, L,
M, N, O, todos concluídos). Total do curso **251/348 = 72,1%**. A rodada de 20/08 deu 165/240 = 68,8%
contra 155/240 antes: Δ médio **+0,50**, 10 subiram, 8 caíram, 2 empataram — o +3,44 da rodada
parcial **não se sustentou** com a amostra completa
**Classificação:** **Requer revisão.** Os 72,1% cairiam na faixa de "Publicável com ressalvas"
(70–84%), mas as duas portas eliminatórias dessa faixa falham: **18** notas `−1` (o máximo é uma) e
**quatro** aulas abaixo de 50% (00, 25, 26, 28). Vale para a versão que os auditores leram — os 15
defeitos que produziram as `−1` de 20/08 foram corrigidos no mesmo dia, e somar correção à própria
nota é a autoavaliação que a rubrica proíbe
**Distância até "com ressalvas":** zerar as `−1` e tirar quatro aulas de baixo dos 50%
**Licença:** definida em 20/08 — **CC BY-SA 4.0** para o material didático, **MIT** para o código
(`ferramentas/`, `exercicios/`). Escopo em `LICENSE`; texto do MIT em `LICENSE-CODE`
**Git:** **um commit**, `6658768`, na branch `main`, **sincronizado com `origin/main`** — nada
pendente de push. Repo público em https://github.com/SaLuanVitor/rag-auditado-ptbr
**Convenção deste repo:** os commits **não** levam trailer `Co-Authored-By: Claude`. Decisão do
autor, vale só aqui
**Sincronizado:** 2026-08-20 — o bloco Git deste cabeçalho estava obsoleto (afirmava quatro commits
locais em `developer` e push pendente; o histórico foi refeito em um commit único em `main`, já
publicado) e a contagem de citações estava em 1592. Corrigidos contra os três comandos da seção 14.
A sincronização anterior, de 19/08, está na seção 14
**Para quem retoma:** este documento é autossuficiente. Leia-o inteiro antes do primeiro comando.

---

## 1. O que é este trabalho

Dois entregáveis que se sustentam mutuamente:

1. **Um curso de RAG em português**, em ``, construído
   sobre o repositório de código de _RAG from First Principles_ (Jia Huang, Packt), clonado em
   `../RAG-from-First-Principles/`.
2. **Um agente especialista versionado**, `agente/rag-specialist.md` (Vetor), avaliado
   duas vezes por auditoria adversarial e atualmente em nível **L3 — Praticante avançado**.

**Perfil do aluno:** sólido em programação, zero em RAG. Isso calibra tudo — as três primeiras
aulas são conceituais sem framework.

---

## 2. Contrato inegociável

> **O clone `../RAG-from-First-Principles/` NÃO é modificado.**

Todo material vive neste repositório, fora do clone. `git status` no clone deve retornar
**vazio** — confira sempre antes de encerrar. Isso mantém o repo idêntico ao upstream da Packt e
faz `git pull` nunca conflitar.

---

## 3. O que existe em disco

### Curso (raiz deste repositório)

| Arquivo                              | Conteúdo                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `README.md`                          | análise do repo + plano das 29 aulas + ritmos + link para tudo                                               |
| `GLOSSARIO.md`                       | 162 termos de RAG, em inglês, definidos em português, agrupados por tema                                     |
| `FATOS.md`                           | **gerado por script** — inventário por módulo + ~330 linhas-chave com `arquivo:linha` **e conteúdo literal** |
| `AULA-00` a `AULA-28`                | **29 aulas — curso completo** (ver seção 4)                                                                  |
| `exercicios/aula-02-similaridade.py` | script executável: cosseno/IP/L2, bug de L2 invertido, negação, ponto cego com SKU                           |
| `ferramentas/verify-citations.js`    | valida caminho e range de linha de toda citação nos `.md`                                                    |
| `ferramentas/gerar-fatos.js`         | regenera o `FATOS.md` a partir do repo                                                                       |
| `avaliacao/`                         | rubrica, dois exames, duas rodadas de respostas, dois gates                                                  |

### Agente

`agente/rag-specialist.md` — persona **Vetor**, `model: opus`, invocável via
`@rag-specialist`. Contém: fonte de conhecimento, três registros de resposta (fato / domínio /
julgamento), o que recusa (premissa falsa), ordem de diagnóstico, **10 regras do protocolo de
citação**, ferramental obrigatório, nível vigente e limites declarados.

---

## 4. Aulas escritas — 29 de 29, nada pendente

| Fase                     | Aulas                                                                                    | Estado |
| ------------------------ | ---------------------------------------------------------------------------------------- | ------ |
| 0 · Fundamentos          | 00 setup · 01 o que é RAG · 02 vetores/similaridade · 03 primeiro RAG                    | ✅     |
| 1 · Ingestão             | 04 texto/JSON/web · 05 PDF/OCR/layout · 06 tabelas/CSV/SQL                               | ✅     |
| 2 · Representação        | 07 chunking · 08 embeddings/BM25/BGE-M3                                                  | ✅     |
| 3 · Vector DB            | 09 Milvus/schema · 10 índices ANN · 11 híbrida/multimodal                                | ✅     |
| 4 · Pré-recuperação      | 12 query construction · 13 query translation · 14 routing                                | ✅     |
| 5 · Otimização de índice | 15 small-to-big · 16 hierárquico/multi-representação                                     | ✅     |
| 6 · Pós-recuperação      | 17 reranking · 18 compressão/CRAG                                                        | ✅     |
| 7 · Geração              | 19 modelo/prompt · 20 output parsing · 21 Self-RAG                                       | ✅     |
| 8 · Avaliação            | 22 RAGAS/TruLens/DeepEval/LlamaIndex                                                     | ✅     |
| 9 · Avançado             | 23 GraphRAG · 24 Contextual · 25 Modular · 26 Agentic · 27 Multimodal · 28 projeto final | ✅     |

O plano completo, com o módulo do repo que cada aula cobre, está no `README.md`.

**Nota histórica de ordem de escrita:** a AULA-07 foi escrita fora de ordem (antes das 04–06)
por ser o capítulo mais fraco do gate v1; o resto seguiu linear. Para **leitura**, a ordem é
00 → 28.

---

## 5. Workflow obrigatório para escrever uma aula

Este processo não é opcional — ele existe porque a auditoria mostrou onde o erro nasce.

```
1. Consultar FATOS.md para o módulo da aula
2. Abrir os arquivos que o índice não cobre (grep -n / ls / sed, com o PATH VISÍVEL)
3. diff em TODO par de arquivos (-v1/-v2, -ch/-en, -Failed/-Succeeded, Plain/Specific)
4. Escrever a aula seguindo as 8 seções (seção 6 abaixo)
5. node ferramentas/verify-citations.js AULA-XX.md   → precisa dar PASS
6. Expandir elipses que virarem SKIPPED, para a ferramenta checar tudo
7. Linkar a aula no README.md (a linha da tabela já existe, só virar link)
8. node ferramentas/verify-citations.js --all         → PASS final
9. Conferir que git status no clone da Packt está vazio
```

### As 10 regras do protocolo de citação

Estão em `agente/rag-specialist.md`. As quatro mais importantes na prática:

- **Nunca `grep -h`** para citar — a flag suprime o caminho, e caminho ausente vira caminho
  inventado. Foi a causa mecânica da primeira alucinação.
- **Par de arquivos exige `diff`** — nunca inferir a diferença do sufixo do nome.
- **Import não é uso** — grepar se o símbolo é exercitado antes de citá-lo como evidência de
  arquitetura.
- **"Não afirmo" tem pré-requisito** — se o arquivo está no escopo e é pequeno, abrir é
  obrigatório. Declarar limite no lugar de trabalho trivial é evasão, não rigor.

---

## 6. Estrutura fixa de cada aula

Oito seções, na ordem:

1. **Pergunta motivadora** — o problema concreto que a aula resolve
2. **Modelo mental** — a intuição antes da API
3. **Código do repositório** — quais arquivos, em que ordem de leitura
4. **Mão na massa** — o que rodar e o que observar
5. **Quebre de propósito** — mudança que degrada o resultado, para ver o mecanismo ao contrário
6. **Armadilhas de produção** — o que morde depois
7. **Checkpoint** — perguntas respondíveis sem consultar
8. **Vocabulário** — termos com entrada no `GLOSSARIO.md`

Fecha com links **Anterior** / **Próxima**.

**Tom:** português correto com acentuação. Julgamento marcado como julgamento. Custos de
mitigações nomeados. Nada de superlativo absoluto sem qualificar. Erros de digitação do
repositório são preservados nas citações e apontados, porque é assim que o aluno vai encontrá-los.

---

## 7. Avaliação do agente — estado e método

**Método:** 10 auditores adversariais independentes (`sonnet`), somente-leitura, um por capítulo,
instruídos a **refutar**. A nota é do auditor, nunca do avaliado. Auto-avaliação não conta.

|             | v1              | v2                           |
| ----------- | --------------- | ---------------------------- |
| Pontos      | 42/60 (70,0%)   | **50/60 (83,3%)**            |
| Alucinações | 3               | 1                            |
| Nível       | L2 — Praticante | **L3 — Praticante avançado** |

Por tipo de questão, v1 → v2: conceito 80→95%, armadilha 58→90%, julgamento 50→90%, **fato
75→65%**.

**O achado central:** o ferramental resolveu erro de **citação** (zero erro de caminho ou linha
no v2), e o erro **migrou** para asserção sobre comportamento e para evasão. `F` caiu porque as
perdas passaram a ser de outra natureza — não porque as citações voltaram a falhar.

**Para chegar a L4:** ≥90% global, zero alucinação, todas as armadilhas com nota 2, nenhum
capítulo abaixo de 70%. O gargalo é o tipo `F` em 65%, e **não é mais resolvível por ferramental
de citação** — depende de abrir arquivos e verificar comportamento.

**Um v3 exige exame novo.** Reusar o v2 mediria memória das correções. Detalhes das 9 lacunas
em `avaliacao/GATE-RAG-SPECIALIST-v2.md`.

---

## 8. Achados sobre o repositório da Packt

Acumulados nas duas auditorias e nas 12 aulas. Todos verificados em código, todos usados como
material de leitura crítica.

### O padrão: o nome promete o que o código não faz — 14 casos

1. **`02-DocChunking/99-Tool-PDF-Splitting.py`** — não faz chunking; extrai páginas de PDF com
   `pypdf`.
2. **`04-VectorDB/Milvus/03-SearchAndMetrics/06-full-text-search-bm25-{ch,en}.py`** — sugere
   versões por idioma; diferem em **2 linhas** (frase de amostra e query), nenhum configura
   analisador, e o `-ch` está em inglês.
3. **`10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:18`** — importa `ToolNode` e
   `tools_condition` e **nunca os usa**; o roteamento real está em `should_use_tools` e
   `route_after_grading`.
4. **`08-Generation/03-.../04-Pydantic-v1.py`** — não chama LLM nenhum e usa `model_dump()`, que
   é API do Pydantic **v2**. O sufixo é numeração de variante, não versão de biblioteca.
5. **`04-VectorDB/HybridRetrieval/Milvus+BGE-M3-HybridRetrieval-v1-Minimal.py`** — é o **maior**
   dos três (326 linhas contra 203 e 212). "Minimal" descreve a estratégia de fusão.
6. **`08-Generation/01-ModelSelectionAndInvocation/`** — há invocação, não há **seleção**: os dois
   arquivos usam o mesmo `Qwen/Qwen3-0.6B` fixo (`01-UsingQwen3.py:6` e `02-FineTuningQwen3.py:44`).
   Nenhuma comparação, critério ou medição entre modelos.
7. **`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py`**
   — o nome promete diversidade e o código não pede nenhuma: sem parâmetro `n`, a chamada volta com
   um elemento, mas o laço da linha 53 imprime `Candidate Analysis {i+1}` como se houvesse vários.
   A diversidade existe só como instrução no prompt (linha 39). E não há RAG: `retrieved_content`
   (linha 34) recebe string literal de `get_code_snippet()` (linha 6).
8. **`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py`**
   — o pipeline RAG é decorativo: o corpus `99-EN/black-myth-wukong/black_myth_wukong_setting.txt`
   tem **779 bytes** e `chunk_size=1000` (linha 14) ⇒ um único chunk; `similarity_search(query)` sem
   `k` e `docs[0]` (linhas 23–24) devolvem o documento inteiro.
9. **`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v1.py` e `04-Pydantic-v2.py`**
   — **não são um par.** `diff` mostra que compartilham só as duas primeiras linhas (imports de
   `pydantic` e `typing`); são exemplos distintos. O `-v1` não chama LLM nenhum e usa `model_dump()`
   (linhas 35, 39), API do Pydantic **v2**; o `-v2` usa `OpenAIPydanticProgram` do LlamaIndex
   (linha 22). O sufixo é numeração de variante do capítulo.
10. **`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v1-LangChain.py` e
    `05-function-calling-v2-DeepSeek.py`** — o sufixo `-DeepSeek` sugere provedor diferente, mas
    **ambos falam com a DeepSeek**: `ChatDeepSeek` + `DEEPSEEK_API_KEY` (v1:16) e cliente `OpenAI`
    com `base_url` da DeepSeek + a mesma chave (v2:16-19). O que difere é a **camada** (framework
    vs. HTTP direto), não o provedor. Diferença material: o `v1` para na tool_call (25–30); só o
    `v2` fecha o ciclo com papel `tool` e `tool_call_id` (50–53).
11. **`08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py`** —
    "FullImplementation" compila o grafo (`:366`) e **nunca o executa**: as duas execuções de exemplo
    e o desenho do diagrama estão comentados (`:367-401`); `grep -n "app\."` retorna três
    ocorrências, todas em comentário. O que roda são os testes soltos de cada componente
    (`:69`, `:90-91`, `:118`, `:145`, `:166`) — e três deles descartam o resultado. Além disso, o
    Self-RAG **do paper** treina o modelo a emitir reflection tokens; esta implementação emula os
    juízos com graders externos, e o token `Retrieve` (decidir **se** recupera) não tem
    correspondente — `:344` recupera sempre.
12. **`09-Evaluation/02-Trulens.py`** — o comentário final (`:123`) apresenta o leaderboard como
    ferramenta para **comparar versões** da aplicação, e `session.reset_database()` (`:67`) apaga o
    histórico antes de cada execução. O `app_version="base"` (`:108`) não tem com quem ser comparado.
13. **`10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py`** — o "Contextual Retrieval"
    **não contextualiza nada**: a linha `:201` monta o "contexto" como
    `f"This section discusses: {node.get_content()[:50]}..."` — os primeiros 50 caracteres do próprio
    chunk, com o comentário `# Simulate LLM generated context`. Três coisas declaradas e nunca usadas
    (grep confirma ocorrência única de cada): `CONTEXT_PROMPT_TEMPLATE` (`:45`), `llm` (`:32`) e o
    import `generate_question_context_pairs` (`:12`). O tratamento e o controle do experimento diferem
    por um prefixo fixo.
14. **`10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py`** — não é o "adaptive (active)
    retrieval" do paper Modular RAG (decidir **quando** recuperar, como FLARE/Self-RAG). É roteamento
    de **fonte** — índice vs. web (`:50-54`, `:188-192`) —, o padrão _conditional_ da mesma taxonomia.
    Técnica boa, outro nome. Verificado contra o paper na Aula 25 e contra o código na 26.

### Outros

- **`02-DocChunking/01-LangChain-CharacterTextSplitter.py:7-8`** — dois comentários errados:
  diz "50 characters" com valor 100, e "no overlap" com valor 10.
- **`02-DocChunking/02-...:6`** — o separador `，` é a vírgula ideográfica (U+FF0C); nunca casa
  em texto ocidental.
- **`00-SimpleRAG/01_02_...:13`** e **`03_LangChain_LCEL_RAG_v3.py`** — usam `bge-small-zh`
  (modelo **chinês**) sobre corpus traduzido para inglês. Resíduo de origem.
- **`02-DocChunking/03_LlamaIndex-ChunkSizeAffectsAccuracy.py:23`** — usa caminho relativo à
  **raiz do repo** (`90-Data/...`), ao contrário do resto do módulo (`../99-EN/...`). Rodar de
  dentro da pasta quebra.
- **`06-Indexing/02-.../98-TwoTierIndex-FAISS.py:58`** — busca no segundo índice e **nunca usa o
  resultado**; o retorno vem só do primeiro nível.
- **`05-PreRetrieval/.../Sakila/05-text2sql-rag-v1-error.py`** — falha por não extrair o SQL da
  resposta do LLM (sem regex, sem instrução de "só o SQL" no prompt).
- **`09-Evaluation/01-RAGAS.py:6`** importa só `Faithfulness` e `AnswerRelevancy` — nenhuma
  métrica de recuperação. **`02-Trulens.py:93-99`** tem `context_relevance` via `Feedback`.
- **`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:1-3`**
  — importa `PromptTemplate`, `TextLoader` e `CharacterTextSplitter` e **não usa nenhum dos três**;
  a montagem é `str.format` puro (linhas 72–76). Segundo caso de import morto no repo.
- **`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:123`
  vs `:128`** — o template vem do roteador, mas os casos vêm de `get_similar_cases(scenario, ...)`,
  onde `scenario` é o rótulo do laço (linha 117), não o `intent` decidido. **O teste não testa o
  roteador**; se ele errasse, a recuperação seguiria correta e o erro ficaria invisível.
- **`08-Generation/.env.example:2` e `08-Generation/02-OptimizingResponseViaPrompts/.env.example:2`**
  — afirmam que todo script carrega o `.env` via `load_dotenv()`. `grep -rn "load_dotenv"` nos dois
  subdiretórios só encontra `03-IncreaseComprehensivenessAndDiversityOfResponse.py:2,4`. Falso para
  três dos quatro.
- **`apply_chat_template` não aparece em nenhum `.py` do repositório** (`grep -rn`). Qwen3 é modelo
  de instrução e recebe prompt cru em `01-UsingQwen3.py:21`.
- **`02-FineTuningQwen3.py` é o único treino do repo** — `grep -rln "TrainingArguments|SFTTrainer|peft|LoraConfig"`
  retorna só ele. Fine-tuning **completo**, sem PEFT/LoRA; `mlm=False` (linhas 74–77) treina em
  pergunta+contexto+resposta, sem mascarar o prompt.
- **Schema obrigatório sem fonte no prompt = invenção contratada.** Dois casos:
  `08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:16` exige `file_name` e a
  chamada passa só `code` (linha 50); `05-function-calling-v1-LangChain.py:13` declara `temperature`
  como parâmetro **obrigatório** da ferramenta de clima — que é o que ela deveria devolver. O
  `05-function-calling-v2-DeepSeek.py:35` exige apenas `location`. Alucinação com tipo válido, mais
  difícil de notar porque passou pela validação.
- **`get_format_instructions` não aparece em nenhum `.py` do repositório** (`grep -rn`). Todo uso de
  output parser é grau 2 (validar depois), nunca grau 1+2 (instruir o modelo com o formato).
- **`08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py:15`** — chama
  `llm(...)` como função (interface antiga) em vez de `.invoke(...)`, que é o que o próprio
  `05-function-calling-v1-LangChain.py:22` usa.
- **`08-Generation/03-ControllingFormatViaOutputParsing/02-LlamaIndex-OutputParsing.py` é o único dos
  7 arquivos do módulo 03 com RAG.** Cinco `ResponseMode` num arquivo (`:25`, `:35`, `:53`, `:67`,
  `:82`), mas `output_cls` só no bloco 2 (`:36`) — os outros quatro controlam formato por prompt.
  Corpus de **4.462 bytes**, pequeno demais para os modos divergirem. `Optional` é import morto em
  `04-Pydantic-v2.py:2`.
- **`08-Generation/03-ControllingFormatViaOutputParsing/.env.example:2`** repete a frase falsa de
  todo script carregar `load_dotenv()`: 4 dos 7 chamam (`01`, `03`, os dois `05`); `02`, `04-v1` e
  `04-v2` não.
- **Ciclos sem limite de iteração no Self-RAG.** Duas arestas voltam
  (`Self-RAG-FullImplementation.py:359` `generate → generate` e `:361` `generate → transform_query`),
  e nenhuma tem contador nem saída de emergência. Na aresta `not supported` **nada muda entre as
  tentativas** — mesma pergunta, mesmos documentos, `temperature=0` (`:80`). O CRAG da Aula 18 não
  tem esse risco porque é acíclico (`01-CRAG-ReflectiveRetrieval.py:457` — `generate → END`).
- **`format_docs` é função morta em DOIS arquivos** — `Self-RAG-FullImplementation.py:83` e
  `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:135`; `grep -n "format_docs"` em
  cada um devolve só a linha da definição. O contexto vai cru para a cadeia (`:90`, `:219`). Herança
  de template comum.
- **`Self-RAG-FullImplementation.py:77` usa `hub.pull("rlm/rag-prompt")`** — o prompt de geração vem
  da rede, não do repositório. Não é auditável localmente, e é justamente ele que decidiria se o
  modelo pode se abster (assunto da Aula 19). Declarado como não verificado na Aula 21.
- **Mistura `model=` e `model_name=` no mesmo arquivo** — cinco instanciações de `ChatOpenAI` em
  `Self-RAG-FullImplementation.py` (`:49`, `:80`, `:104`, `:131`, `:150`); só a `:80` usa
  `model_name=`. O rewriter (`:150`) é o único em `gpt-3.5-turbo-0125`; os graders, em `gpt-4o`.
- **`transform_query` reescreve a reescrita** (`Self-RAG-FullImplementation.py:266-267`) — na segunda
  volta o rewriter recebe a pergunta já reescrita; a original não é guardada em nenhuma chave do
  `GraphState` (`:171-183`). Deriva silenciosa da intenção.
- **Código morto:** `Self-RAG-FullImplementation.py:282` é `state["question"]` sozinha, valor
  descartado. E o caminho no bloco comentado (`:372`) aponta para um diretório que não existe mais
  ("08-Response Generation-Generation/..."), de onde veio o `graph.png`.
- **`09-Evaluation/04-LlamaIndexEvaluation.py:47` tem um dos DOIS caminhos absolutos do repositório**
  (corrigido em 20/08 — este item afirmava "o ÚNICO", e a prova apresentada era um `grep` por
  `/home/huangj2`, que provava algo mais estreito que a alegação. O outro é
  `03-Embedding/05-MultimodalEmbedding.py:20`, um `.pth` sob `/root/AI-BOX/code/rag/rag-in-action/`;
  os dois carregam o nome antigo do projeto) —
  o valor de `pdf_path` é um absoluto sob `/home/huangj2` + `Documents/rag-in-action/` seguido de
  `90-Data/ComplexPDF/IPCC_AR6_WGII_Chapter03.pdf` (grep por `/home/huangj2` retorna só esta linha). O PDF existe no repo em `90-Data/ComplexPDF/`. Pior: a linha
  `:121` usa caminho relativo **à raiz do repo** — os dois caminhos do mesmo arquivo são incoerentes
  entre si. O nome antigo do projeto aparece no caminho: `rag-in-action`.
- **`09-Evaluation/01-RAGAS.py:109-143` guarda a saída de uma execução real** num bloco `'''`:
  Faithfulness **0.6071**, AnswerRelevancy MiniLM **0.8565**, OpenAI ada-002 **0.9426**, diff 0.0861.
  E a linha `:106` declara "OpenAI is better" com **n=3**, sem variância. Material de leitura crítica
  de primeira qualidade — números reais + conclusão que não se sustenta.
- **O RAGAS não avalia recuperação por causa do dataset, não do import** — as chaves são `question`,
  `answer`, `contexts` (`01-RAGAS.py:20`, `:25`, `:30`) e falta `ground_truth`; sem referência,
  `context_recall` não tem contra o que comparar. Corrige a leitura anterior do achado.
- **A lacuna do RAGAS é coberta em outro arquivo do módulo** — `03-DeepEval.py:13`
  (`ContextualPrecisionMetric`) e `02-Trulens.py:98` (`context_relevance`). Ler só o `01` sugeriria
  que o capítulo ignora recuperação.
- **`09-Evaluation/03-DeepEval.py` (20 linhas) é o único com gabarito humano** — `expected_output`
  (`:8`). E o único que não fixa o juiz: métricas instanciadas sem argumentos (`:13-14`) usam o
  padrão da biblioteca.
- **`09-Evaluation/04-LlamaIndexEvaluation.py` é o único A/B controlado do repo** — dois retrievers
  (janela de sentenças da Aula 15 vs. base) com o **mesmo** `similarity_top_k=2` (`:147-151`), 4
  métricas, tabela ao fim (`:172-176`), 30 perguntas. O gabarito é sintético: `gpt-4` gerou as
  perguntas e as respostas (`:113`, bloco comentado `:111-118`) e `gpt-4` julga (`:125`) —
  circularidade. O JSON existe (`90-Data/ComplexPDF/ipcc_eval_qr_dataset.json`, 60 pares); `:142` usa
  metade (`max_samples = 30`).
- **`sample_eval_nodes` (`04-LlamaIndexEvaluation.py:109`) é trabalho descartado** — `random.sample`
  sem semente, usado só na linha comentada `:112`. Imports mortos: `DatasetGenerator` (`:18`) e
  `PairwiseComparisonEvaluator` (`:19`).
- **`09-Evaluation/.env.example:2`** repete a frase falsa pela quarta vez: `load_dotenv` só em
  `01-RAGAS.py:2-3` e `04-LlamaIndexEvaluation.py:8,25`; o `02` e o `03` não chamam.
- **Detalhe a favor do repo:** `09-Evaluation/requirements.txt:21-23` pina `ragas<0.3` **e explica o
  motivo** (a API `LangchainLLMWrapper` é da geração 0.2.x). Raro e correto.
- 🔴 **DOIS subdiretórios de `10-AdvanceRAG/` não têm código nenhum** — `01-GraphRAG/` e
  `03-ModularRAG/` contêm apenas o PDF do respectivo paper e um `.env.example`. O do GraphRAG declara
  a ausência corretamente (`10-AdvanceRAG/01-GraphRAG/.env.example:1-2`: "This folder has no Python
  scripts (reference PDF only)"), e o `10-AdvanceRAG/.env.example:5-13` omite os dois ao listar quem
  usa cada chave. Mas o `README.md` da raiz do clone da Packt (linha 29) anuncia "advanced paradigms
  including GraphRAG, Agentic RAG, and Modular RAG" — dois dos três sem implementação. **Impacto
  direto na AULA-25 (Modular RAG): planeje uma aula baseada em paper, como a 23.**
- **Nenhuma biblioteca de grafo em todo o repositório** — `grep -rln` por `networkx`, `graspologic`,
  `leiden`, `from graphrag` nos `.py` não retorna nada, e `10-AdvanceRAG/requirements.txt` não lista
  nenhuma. O único código que fala com banco de grafos é o par Text2Cypher da Aula 12
  (`05-PreRetrieval/01-QueryConstruction/Text2Cypher/03-Text2Cypher-SNOMED-v2-Succeeded.py:2` importa
  `GraphDatabase` de `neo4j`) — consultar grafo pronto, não construir grafo do texto.
- 🔴 **`10-AdvanceRAG/02-ContextRetrieval/Milvus-Implementation.py` sobrescreve o gabarito oficial da
  Anthropic.** `download_data()` baixa `evaluation_set.jsonl` do cookbook (`:767-772`) e o `main`
  escreve **no mesmo nome** (`:904-906`) um conjunto fabricado em que a **query são os primeiros 50
  caracteres do próprio chunk-alvo** (`:896`), com 4 perguntas (2 docs × 2 chunks, `:893-894`). Pior:
  o download é condicionado a `not os.path.exists`, então a partir da 2ª execução o oficial **nunca
  mais é baixado**. Terceiro defeito, independente: `total_queries += 1` (`:623`) acontece **antes** do
  `continue` que descarta query sem golden doc (`:660-662`) — o denominador conta as puladas como zero,
  e o dataset é truncado em `dataset[:5]` (`:851`).
- **Milvus-Implementation.py é a contextualização de verdade** — prompt com `<document>` e `<chunk>`
  (`:428-437`), `gpt-3.5-turbo`, `temperature=0` (`:447-455`), Claude comentado e reversível
  (`:462-468`), guarda `content` **e** `contextualized_content` (`:540`), rerank sobre o contextualizado
  (`:551`), e o experimento 3 reusa o retriever do 2 só ligando `use_reranker` (`:954-955`). Diferença
  vs. método original da Anthropic: o prompt pede o **chunk completo reescrito** (`:437`), não um
  contexto curto prefixado.
- **`Milvus-Implementation.py:854` usa `BAAI/bge-large-zh`** — embedding **chinês** sobre
  `codebase_chunks.json` (código em inglês). Terceiro caso do resíduo `-zh` no repo.
- **Duas métricas que são a mesma:** `pass_at_n = average_score * 100`
  (`Milvus-Implementation.py:688-689`), embora o docstring (`:592-597`) as descreva como distintas; e
  `recall`, listado no docstring (`:598-599`), não está no retorno (`:691-695`). O relatório rotula
  `reranker - standard` como "Reranking **further** improved by" (`:970-975`) — é ganho acumulado, não
  incremental; o incremento real (`reranker - contextual`) não é calculado.
- **Gabarito posicional em `LlamaIndex-Implementation.py:266-269`** — a pergunta `i` é declarada
  relevante ao nó `i`, sem nada verificar que aquele nó a responde. `hit_rate` e `mrr` medem
  concordância com esse mapeamento. Mais três fabricações de dado no mesmo arquivo: nós
  `"Sample text N"` se houver menos de 3 (`:191-194`), `TextNode(text="Sample Text")` no BM25 (`:78`),
  e `hit_rate`/`mrr` = **0.0** com nota `"Evaluation Failed"` quando a avaliação falha (`:140-145`) —
  erro de infraestrutura entrando na tabela como desempenho. E `CohereRerank` com chave default
  `"your-api-key"` dentro de try/except que deixa `cohere_rerank = None` (`:220-227`): o pipeline segue
  sem reranking e o rótulo na tabela continua dizendo "+ Reranker".
- **Detalhe a favor do repo:** neste módulo o `.env.example:2` finalmente está correto — os dois
  scripts chamam `load_dotenv()` (`LlamaIndex-Implementation.py:20-21`,
  `Milvus-Implementation.py:161-162`).
- 🔴 **Terceiro e quarto grafos sem limite de iteração.** Tabela consolidada dos quatro grafos do
  repo: `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py` é **acíclico** (`:457`);
  `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py` tem 2
  ciclos (`:359`, `:361`); `10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py` tem 1 (`:174`);
  `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py` tem 3 (`:201`, `:208`). **Nenhum dos três
  cíclicos tem contador.** A Aula 25 mostrou que o paper Modular RAG especifica o freio nos três
  subtipos de laço e nomeia o `scheduling module` como responsável.
- **`01-LangChain-AgenticRAG.py` tem CINCO imports mortos** (ocorrência única de cada, por grep):
  `ToolNode` e `tools_condition` (`:18`), `TavilySearchResults` (`:16`), `Annotated` e `Literal`
  (`:3`), `pprint` (`:4`). `grep -rn "ToolNode"` no repositório inteiro devolve **só** a linha 18. O
  roteamento é escrito à mão em `should_use_tools` (`:122`) e `route_after_grading` (`:83`).
- **A decisão de agir é tomada por substring** — `should_use_tools:126-127` aceita
  `"retrieve" in last_msg.content.lower()` como equivalente a haver `tool_calls`. E o `system_msg`
  da linha 112 é uma `HumanMessage`, não uma system message. Julgamento registrado na Aula 26: o `or`
  parece ter sido acrescentado para o exemplo funcionar quando o modelo não chamava a ferramenta.
- **A descrição da ferramenta mente para quem decide** — `01-LangChain-AgenticRAG.py:47` promete
  "agents, prompt engineering, and adversarial attacks" e duas das três URLs estão comentadas
  (`:29-30`): o índice só tem o post de agentes. Mesma contradição no prompt do roteador do `02`
  (`:60` vs `:37-38`). Num sistema agentic a descrição **é prompt**, então a falha de indexação vira
  decisão errada do agente.
- **O `rewrite` do `01` apaga a pergunta original** — `:138-143` devolve `"messages": [resp]` com o
  comentário `# Reset messages here`. Todos os nós leem `msgs[0].content` como "a pergunta"
  (`:71`, `:93`, `:134`, `:148`), então depois da primeira volta a pergunta é texto gerado. Versão
  dura da deriva registrada na Aula 21.
- **Estado decorativo** — `retrieval_done` e `graded` (`01-...:54-55`) são escritos por todos os nós e
  lidos **só nos prints** (`:213-214`). Nenhuma decisão os consulta.
- **`02-LangChain-AdaptiveRAG.py`: a rota da web escapa do grading** (`:203` vai direto para
  `generate`, enquanto `:194` manda o índice para `grade_documents`); `grade_generation_node` (`:170`)
  **não é nó** (não está nos `add_node` de `:181-185`) e devolve `{"decision": ...}`, chave que não
  existe no `GraphState` (`:121-124`) — é chamada dentro do lambda da aresta (`:207`), gastando 1-2
  chamadas de LLM por avaliação em lugar onde ninguém conta custo; e **a pergunta que testaria o
  roteador está comentada** (`:230`), então a rota `web_search` nunca é exercitada.
- **Detalhe a favor:** o `02` usa `Literal[...]` como contrato do roteador (`:52`) — exatamente o que
  a Aula 20 recomendou e o repo não fazia — e tem abstenção explícita quando não há documentos
  (`:163-164`).
- **`.env.example:2` falso pela SEXTA vez** — `grep -c load_dotenv` nos dois scripts de
  `04-AgenticRAG/` devolve 0 e 0; as chaves são pedidas por `getpass` (`01-...:21-24`,
  `02-...:23-29`), o que impede execução não interativa.
- 🔴 **AUDITORIA CONSOLIDADA do `.env.example`** (feita na Aula 27, vale para o repo inteiro): a frase
  "Every script here loads this file via python-dotenv's load_dotenv()" aparece em **30** arquivos
  `.env.example`. Descontados os 7 diretórios sem scripts próprios, sobram 23 testáveis — e ela é
  **falsa em 15**: `00-SimpleRAG` (19/20), `01-DataLoading/03` (1/3), `/04` (1/11), `/05` (4/12),
  `/99` (7/8), `02-DocChunking` (2/7), `03-Embedding` (2/6), `05-PreRetrieval/02` (4/5),
  `07-PostRetrieval/01` (3/6), `/02` (1/3), `08-Generation/02` (1/4), `/03` (4/7), `09-Evaluation`
  (2/4), `10-AdvanceRAG/04` (0/2), `/05` (1/2). **Verdadeira em 8**, entre eles todos os
  subdiretórios de `06-Indexing` e `10-AdvanceRAG/02-ContextRetrieval`. Julgamento registrado: é
  cabeçalho gerado de uma vez para todos os diretórios; as linhas seguintes, escritas caso a caso,
  costumam estar corretas. **Este item substitui as menções soltas de "N-ésima vez" das aulas
  anteriores.**
- **`10-AdvanceRAG/05-MultiModalRAG/docker-compose.yml` é o ÚNICO arquivo de infraestrutura do repo** —
  Weaviate 1.30.2 + `multi2vec-bind:imagebind` (ImageBind da Meta), `mem_limit: 12g` (`:21`),
  `ENABLE_CUDA: '0'` (`:20`), `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'` (`:10`), portas 8080 e
  50051 publicadas (`:5-7`), volume nomeado (`:15-16`, `:22-23`), `version: '3.4'` obsoleta (`:1`).
  Primeiro custo de infraestrutura com número no curso inteiro.
- 🔴 **`02-Weaviate-Multimodal-RAG.py:33` insere o placeholder literal** `"<YOUR_IMAGE_BASE64_STRING>"`
  no campo de imagem, e o `__main__` chama a função sem substituir (`:97`). O arquivo se declara
  esqueleto de dever de casa na linha 1-2, e ainda assim executa a cadeia inteira: recuperar (`:42-52`,
  com `limit=1` e `objects[0]` sem verificação) → descrever com `gpt-4-vision-preview` via
  `requests.post` cru (`:61`, `:73`, sem `try`) → gerar com DALL-E 3 pelo SDK (`:79-90`). Duas formas
  de chamar a mesma API no mesmo arquivo. Corpus mental de outro tutorial ("puppy", "dog with a sign",
  "my pet") — as 9 imagens do repo não são usadas por ele.
- **`01-Weaviate-Multimodal-Search.py` é o arquivo bom do módulo** — indexa 3 imagens reais (`:30-40`),
  faz `near_text` (`:68`) **e** `near_image` (`:89`), grava `mediaType` na indexação e fecha o cliente
  (`:131`). Declara 3 modalidades e exercita 1: áudio e vídeo estão comentados (`:42-64`, `:98-118`) e
  os blocos comentados usam a variável **fantasma** `animals` (`:47`, `:59`, `:100`, `:111`, `:124`),
  que não existe neste arquivo (a coleção é `monkey`, `:32`) — descomentar dá `NameError`.
  `NearMediaType` (`:5`) é import morto na prática.
- **Assimetrias entre os dois:** o `01` deleta e recria a coleção (`:12-13`), o `02` cria sem verificar
  (`:19`) — rodar duas vezes tende a falhar; o `01` fecha a conexão, o `02` não; o `02` usa o filtro
  `Filter(path="mediaType").equal("image")` (`:46`) que o `01` só prepara.
- **Duplicatas de asset confirmadas por `md5sum`:** `99-EN/assets/multimodal/01.jpg`, `02.jpg` e
  `03.jpg` são idênticos a `weaviate/wukong_demon_fight.jpg`, `wukong_fire_attack.jpg` e
  `wukong_vs_white_bone_spirit.jpg`. O acervo é compartilhado: os scripts da Aula 11
  (`04-VectorDB/MultimodalRetrieval/`) apontam para o diretório-pai e indexam as 9; o de Weaviate usa
  só o subdiretório com as 3.
- **`TRANSLATION_PROGRESS.md` do repo está obsoleto** — declara diretórios como `pending`, mas a
  varredura CJK retorna zero arquivos com chinês. A tradução CN→EN está completa.

### Conceitos do paper Modular RAG (2407.21059v1), extraídos por leitura do PDF

Usados na Aula 25; guardados para não reextrair. Todas as frases abaixo são do paper.

- **Herança, não alternativa:** "Advanced RAG is a special case of Modular RAG, while Naive RAG is a
  special case of Advanced RAG."
- **Três níveis:** modules → sub-modules → **operators** ("basic units of operation"). Sistema
  representado como grafo computacional cujos nós são operadores.
- **Seis módulos de topo:** Indexing, Pre-retrieval, Retrieval, Post-retrieval, Generation,
  **Orchestration**. Os cinco primeiros são as fases deste curso; **Orchestration não tem fase** — é a
  única peça nova do paradigma ("introduces an orchestration module to control the coordination").
- **Quatro padrões de fluxo:** linear (exemplo RRR), conditional (módulo de roteamento; rotas divergem
  em "retrieval sources, retrieval processes, configurations, models, and prompts"), branching
  (pré-recuperação: cada ramo recupera e gera, agrega; pós-recuperação: uma recuperação, geração por
  chunk, agrega — exemplo REPLUG com "weighted possibility ensemble"), loop (grafo dirigido com módulo
  **Judge** decidindo o retorno).
- **Loop se subdivide em três, e todos têm freio:** iterativo ("fixed number of iterations", exemplo
  ITER-RETGEN), recursivo ("a clear termination mechanism as an exit condition", profundidade máxima,
  exemplo ToC), adaptativo/ativo (o sistema "can actively determine the timing of retrieval and decide
  when to conclude"). 🔴 **Isto valida a crítica da Aula 21:** o `Self-RAG-FullImplementation.py` tem
  dois ciclos sem limite (`:359`, `:361`) — o padrão canônico especifica o freio que o código omitiu.
- **`scheduling module`:** existe para "ensuring that the system makes informed decisions on when to
  cease generation or initiate a new retrieval loop". O grafo do repo tem os juízes e não tem o
  escalonador.
- **`rule judge`:** decisão por limiar, "often related to the confidence levels of individual tokens"
  — aceita a resposta tentativa só se todos os tokens passarem do limiar. Grátis em API, exige logits.
- **Adaptive dividido em Prompt-base (FLARE) e Tuning-base (Self-RAG).** O paper descreve o Self-RAG
  como: "prompt GPT-4 to obtain a suitable instruct fine-tuning dataset to fine-tune the deployed
  open-source LLM… output four specific tokens". **Confirmação independente** da distinção que a Aula
  21 fez entre o Self-RAG treinado e a emulação por graders do repositório.
- **RRR detalhado:** o reescritor é "a smaller trainable language model fine-tuned on T5-large",
  otimizado como MDP com a saída final do LLM como recompensa; retriever BM25. O `transform_query` do
  repo é reescrita por prompt — mesmo padrão, ordem de magnitude de esforço diferente.
- **RRF como agregador de ramos:** "especially potent in scenarios characterized by model or source
  heterogeneity" — casa com a comparação RRF vs. `WeightedRanker` da Aula 11.
- **Custos que o próprio paper nomeia:** integração de fontes heterogêneas; interpretabilidade,
  controlabilidade e **manutenibilidade** ("system maintenance and debugging have become more
  challenging"); seleção e otimização de componentes.

**Ferramenta — nota importante:** este PDF exige **filtro extra** no extrator. Streams de fonte
produzem lixo binário que passa pelo regex de parênteses; descartar literais com menos de ~85% de
caracteres ASCII imprimíveis reduz 504.843 chars de saída suja para 94.226 limpos. E exportar
`PYTHONIOENCODING=utf-8:replace`, senão o print quebra em cp1252.

### Números do paper GraphRAG (2404.16130v2), extraídos por leitura do PDF

Usados na Aula 23; guardados aqui para não precisar reextrair.

- **Win rates vs. RAG vetorial (`SS`):** comprehensiveness 72–83% (p<.001) Podcast e 72–80% (p<.001)
  News; diversity 75–82% (p<.001) e 62–71% (p<.01).
- **`directness`: o vetor vence em todas as comparações** — o paper a usa como teste de validade.
  `empowerment`: resultado misto.
- **Contra `TS` (map-reduce de texto, sem grafo): apenas "slight improvements"** em comprehensiveness
  e diversity. O ganho de qualidade vem de ser **global**, não de ser grafo; o grafo compra **escala**.
- **Table 2 — unidades / tokens / % do máximo.** Podcast: C0 34/26.657/2,6% · C1 367/225.756/22,2% ·
  C2 969/565.720/55,8% · C3 1.310/746.100/73,5% · TS 1.669/1.014.611/100%. News: C0 55/39.770/2,3% ·
  C1 555/352.641/20,7% · C2 1.797/980.898/57,4% · C3 2.142/1.140.266/66,8% · TS 3.197/1.707.694/100%.
- **C0 usa 9x–43x menos tokens** por consulta (>97% menos que TS) e mantém 72% de win rate em
  comprehensiveness. C3 usa 26–33% menos.
- **Indexação:** 281 minutos para o dataset Podcast (~1M tokens), janela de 600 tokens, VM de 16 GB,
  `gpt-4-turbo`. Leiden via `graspologic`.
- **Avaliação:** 125 perguntas por dataset (K=M=N=5 — personas × tarefas × perguntas, geradas por
  LLM), cada comparação repetida 5× e mediada; head-to-head porque não há gold standard; juiz devolve
  JSON com `winner` e `reasoning`.

**Ferramenta:** o extrator de PDF por `zlib` (descrito na seção 9) funciona nos PDFs deste repo e foi
como esses números foram obtidos.

---

## 9. Estado final e o que pode vir depois

**O curso está completo: 29 aulas, `AULA-00` a `AULA-28`, cobrindo os 11 módulos do repositório.**
Não há próxima aula a escrever. O que segue são trabalhos opcionais, em ordem de valor.

### 9.1 — Fechar as perguntas empíricas (maior valor, menor esforço)

Nada foi executado desde a Aula 19 porque nenhuma biblioteca do repositório está instalada neste
ambiente. Sete pontos ficaram **declarados no texto** como não verificados, e cada um é um exercício
de meia hora com o ambiente montado:

| #   | O que verificar                                                           | Onde                                                                                                    |
| --- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| a   | Chaves extras no `PromptTemplate.format` — rejeita ou ignora?             | `08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:133-138` |
| b   | O que a chamada depreciada `llm(...)` faz hoje                            | `08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py:15`                   |
| b2  | Idem para `retriever.get_relevant_documents()`                            | `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py:132`                                           |
| c   | Template no slot que o `ResponseMode` não consome é ignorado em silêncio? | `08-Generation/03-ControllingFormatViaOutputParsing/02-LlamaIndex-OutputParsing.py:54` vs `:68`         |
| d   | O conteúdo do prompt `rlm/rag-prompt` — ele autoriza abstenção?           | citado em três arquivos (Aulas 21 e 26)                                                                 |
| e   | Reproduzir os números e medir a variância que o arquivo não reporta       | `09-Evaluation/01-RAGAS.py:109-143`                                                                     |
| f   | O metadado `generated_context` entra no texto embutido e no BM25?         | `10-AdvanceRAG/02-ContextRetrieval/LlamaIndex-Implementation.py:206-210`                                |
| g   | `gpt-4-vision-preview` ainda responde?                                    | `10-AdvanceRAG/05-MultiModalRAG/02-Weaviate-Multimodal-RAG.py:61`                                       |

Ao fechar qualquer um: atualizar a passagem correspondente na aula (todas dizem explicitamente que
não foram verificadas) e riscar a linha aqui.

### 9.2 — Exercícios executáveis

O curso tem **um** (`exercicios/aula-02-similaridade.py`), e ele **nunca foi executado**
(`sentence-transformers` ausente; sintaxe validada com `py_compile`). Candidatos naturais, na ordem
em que as aulas os pedem: variar `chunk_size` e medir (Aula 07), medir recall@k contra FLAT (Aula 10),
e o conjunto de avaliação da Aula 22 aplicado ao baseline da Aula 03 — que é a Etapa 3 do projeto
final.

### 9.3 — Um v3 do exame do `@rag-specialist`

O agente está em **L3** desde o gate v2. Um v3 exige **exame novo** — reusar o v2 mediria memória das
correções. Material farto para questões: os 14 casos da seção 8, os quatro grafos e seus ciclos, os
números dos papers, e a auditoria do `.env.example`. A meta L4 pede ≥90% global, zero alucinação,
todas as armadilhas com nota 2 e nenhum capítulo abaixo de 70%.

### 9.4 — Imagens nunca abertas

`graph.png` e `self-rag.png` (`08-Generation/04-...`), os três PNGs de `10-AdvanceRAG/04-AgenticRAG/`
e as imagens de `99-EN/assets/multimodal/`. Todas as aulas afirmam apenas o que `ls` e `md5sum`
mostram. Abri-las poderia render notas sobre os diagramas — em particular a diferença entre
`02-AdaptiveRAG-Flow.png` e `02-AdaptiveRAG-Graph.png`, que **não** se infere do nome.

### 9.5 — Revisão de coerência entre aulas

A Aula 28 referencia as 28 anteriores e, ao escrevê-la, três imprecisões minhas apareceram e foram
corrigidas (contagem de aulas, contagem de papers, e "três juízes por resposta" quando o de relevância
roda por documento). Uma varredura dedicada de referências cruzadas — cada "a Aula N mostrou X"
conferido na aula N — é trabalho útil e mecânico.

## 10. Comandos essenciais

```bash
node ferramentas/verify-citations.js --all
```

```bash
node ferramentas/gerar-fatos.js
```

Classificação do verificador: `MISPLACED` / `BAD_LINE` / `NOT_FOUND` são **erros** (exit 1);
`PARTIAL` / `UNKNOWN` / `SKIPPED` são avisos.

**Limitação conhecida e testada:** o verificador valida caminho e range de linha; **não** detecta
citação cujo conteúdo alegado não está naquela linha. Testado explicitamente contra a alucinação
do gate v1 — ela recebe PASS. Essa lacuna é coberta pelo `FATOS.md` (citar de dados extraídos), e
não pelo verificador.

---

## 11. Decisões tomadas, para não relitigar

| Decisão                                             | Razão                                                               |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| Curso neste repositório, fora do clone          | `git pull` nunca conflita                                           |
| Material em PT-BR, código do repo intacto em inglês | é onde o aprendizado acontece; o repo segue o upstream              |
| Termos técnicos em inglês no glossário              | traduzir o termo prejudica a pesquisa                               |
| Auditoria adversarial em vez de auto-avaliação      | auto-nota é decorativa                                              |
| Rubrica com nota `−1` para alucinação               | impede compensar invenção com volume                                |
| Portas eliminatórias por capítulo                   | média esconde buraco localizado                                     |
| Auditores em `sonnet`, agente em `opus`             | planejar no modelo mais forte, executar no mais rápido              |

---

## 12. Pendências

- ~~Aulas do curso~~ — **as 29 estão escritas.** O que resta é verificação e exercício, abaixo.
- **Um v3 do exame**, com questões novas, depois de as regras 7–10 rodarem em mais trabalho real.
- **Exercícios executáveis** — só a Aula 02 tem um (`exercicios/aula-02-similaridade.py`). Outras
  aulas se beneficiariam, em especial a 07 (variar `chunk_size` e medir) e a 10 (medir recall@k
  contra FLAT).
- **O exercício da Aula 02 nunca foi executado** — `sentence-transformers` não está instalado
  neste ambiente. Sintaxe validada com `py_compile`; execução pendente.
- **Nenhum exemplo do repo foi executado nas Aulas 19 a 22** — as bibliotecas não estão instaladas
  neste ambiente. Cinco perguntas empíricas ficaram abertas (listadas na seção 9). Toda afirmação nas
  quatro aulas é leitura de código ou de paper, e os limites estão declarados no texto.
- **Os dois PNGs do módulo 08/04 não foram abertos** — `graph.png` e `self-rag.png`. A Aula 21
  afirma apenas o que o `ls` mostra (existência e tamanho). O mesmo vale para os três PNGs de
  `10-AdvanceRAG/04-AgenticRAG/`, que a Aula 26 vai encontrar.
- **As Aulas 23 e 25 não têm exercício executável** — os módulos `01-GraphRAG/` e `03-ModularRAG/` não
  têm código. A seção "Mão na massa" foi
  reescrita como trabalho de leitura, estimativa de custo e construção do baseline `TS` com o que as
  Fases 7 e 8 já ensinaram. Se um exercício executável for desejado depois, o caminho honesto é
  implementar um mini-GraphRAG **novo** em `exercicios/`, não alegar que o repo tem um.
- ~~**Commitado, sem push.**~~ **FECHADO.** O histórico foi refeito em **um commit** (`6658768`) na
  branch `main`, já publicado em https://github.com/SaLuanVitor/rag-auditado-ptbr. `git status -sb`
  em 20/08 dá `main...origin/main` sem divergência. Os hashes `fc78a38b`, `56094cc3`, `84b1c77e` e
  `3c30f75e` que este documento citava **não existem mais** neste repositório.
- **Certificados no repositório** — o autor mencionou querer certificados aqui. Nenhum foi
  encontrado em disco (a varredura só achou bundles de CA de biblioteca Python). Adiado por decisão
  do autor em 20/08: quando retomar, a primeira pergunta é **onde os arquivos estão** — ou se o
  pedido era o repositório **emitir** certificado de conclusão, que é feature a projetar, não
  arquivo a mover.
- **Working tree sujo em 20/08:** `PROMPT-CONTINUAR.md` modificado e `exercicios/__pycache__/` sem
  rastreamento. O `__pycache__` é lixo de execução e merece entrada no `.gitignore`, que hoje não o
  cobre.

---

## 13. Como retomar

```
@aiox-master
```

Depois: "Leia `HANDOFF.md` e execute a tarefa 1 da
seção PRÓXIMA SESSÃO." **Não há aula a escrever** — as 29 estão prontas.

Ou, para consultar o especialista em vez de escrever aula: `@rag-specialist`.

**Confiança de uso do agente:** sólido em conceito, arquitetura, julgamento e resistência a
premissa falsa (90–95%). Para afirmações sobre o que um arquivo específico faz, exija o `diff` ou
o `grep` — é a lacuna que o nível L3 registra.

---

## Estado em 19/08/2026 — auditoria adversarial concluída, correções aplicadas

### O que foi feito

As 29 aulas estão escritas. A auditoria adversarial rodou em lotes sucessivos (o último foi o 16) e
deu nota independente às **29**, fechando com os lotes A-D em 19/08. Cinco rodadas
de correção foram aplicadas (P0, P1, P2, v2 e as dos lotes 12-16), todas verificadas com
`node ferramentas/verify-citations.js --all` → `BAD_LINE`/`MISPLACED`/`NOT_FOUND` em **0**, e com
`git status` vazio no clone da Packt a cada rodada. O `--all` termina em **FAIL** desde o P3, pelos
49 `BAD_ANCHOR` não triados — e esse FAIL não é 49 defeitos confirmados (ver seção P3).

Relatório completo: `avaliacao/GATE-AULAS-v1.md` (inclui as seções da rodada v2, do lote 10 e dos
lotes 12-16, e a "Recontagem de 19/08/2026", que corrige a cobertura afirmada de 29/29 para 21/29).
Rubrica usada: `avaliacao/RUBRICA-AULAS.md`.

### Classe de defeito dominante

Não foi citação inválida — foi **incoerência entre aulas sobre o mesmo arquivo**, e **número escrito
à mão** onde havia contagem mecânica disponível. Os dois tipos foram corrigidos em todas as
ocorrências encontradas, mas o método de revisão que os produziu não mudou.

### Pendente

1. ~~**Renota adversarial das 29 aulas corrigidas.**~~ **FECHADA em 20/08/2026** — as 29 têm renota
   independente. O que fica aberto no mesmo lugar: as notas de 20/08 são, por sua vez, anteriores às
   correções de 20/08, e recalculá-las eu mesmo seria a autoavaliação que a RUBRICA proíbe. Uma
   terceira rodada é o que mediria o efeito das correções desta sessão.
2. ~~**Primeira auditoria das 8 aulas sem nota.**~~ **FECHADO em 19/08/2026.** Os lotes A-D deram
   nota independente a 08, 15, 16, 19, 20, 21, 22 e 23 — `sonnet`, somente-leitura, duas aulas por
   lote. Cobertura da auditoria: **29 de 29**. Notas e achados na seção "Lotes A-D" do
   `avaliacao/GATE-AULAS-v1.md`. Subtotal das oito: 78/96, com três `−1` **já corrigidos** — o que
   torna essas oito notas também pré-correção, como as 21.
3. ~~**P3 — metade feito.**~~ **FECHADO em 19/08/2026.** O verificador foi estendido às
   referências ancoradas, e a triagem dos 48 `BAD_ANCHOR` fechou o resto: nenhum era defeito do
   material, dois eram bugs da ferramenta (índice de basename com raízes sobrepostas; basename nu
   casando na raiz do AIOX) e onze eram redação ambígua. `--all` em **PASS**. Segue aberto apenas
   o item de superlativo não marcado como julgamento, que é trabalho de auditor.
4. **Classificação declarada em 20/08: "Requer revisão".** Com a renota completa (29 de 29), o curso
   está em **251/348 = 72,1%**. O percentual cairia em "Publicável com ressalvas" (70–84%), mas as
   duas portas eliminatórias dessa faixa falham: **18** notas `−1` contra o máximo de uma, e
   **quatro** aulas abaixo de 50% (00 = 5/12, 25 = 4/12, 26 = 3/12, 28 = 4/12). A rubrica é explícita
   em que as portas ganham do percentual. A AULA-03, que antes era 0/12 e bloqueava, foi a maior alta
   da rodada (12/12); as que bloqueiam agora são outras. Cálculo e portas na seção "Renota
   adversarial — rodada COMPLETA de 20/08/2026" do `avaliacao/GATE-AULAS-v1.md`.
5. **Commitado até `84b1c77e`, sem push.** As correções desta rodada foram commitadas em
   `84b1c77e`; restam quatro commits locais na branch `developer` sem correspondente no remote. O
   push depende de `@devops` (Constitution, Artigo II).

### Contrato preservado

`../RAG-from-First-Principles/` nunca foi modificado. Um auditor gravou um arquivo temporário lá
durante a rodada; foi detectado por `git status`, removido, e a proibição foi reforçada no prompt dos
lotes seguintes. Verificação final: `git status --short` no clone retorna vazio.

---

## P3 — verificador estendido às referências ancoradas (19/08/2026)

`ferramentas/verify-citations.js` só validava tokens no formato `caminho:linha`. Ficavam de fora as
referências que não carregam o nome do arquivo — `` `:355` `` e "linha 45"/"linhas 24–27" em prosa —
que somavam ~27% das ancoragens do curso.

### O que mudou

| Antes                                           | Depois                                                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1 passe, só citações com nome de arquivo        | 2 passes: (1) citações nomeadas, que viram âncoras; (2) referências soltas, validadas contra a janela de âncoras |
| ranges `arquivo.py:163-167` **não parseados**   | range reconhecido; **as duas pontas** conferidas                                                                 |
| blocos ``` tratados como prosa                  | fences detectados e ignorados                                                                                    |
| `--all` varria todo `.md`, relatórios inclusive | `--all` cobre o material didático; meta-documentos só por caminho explícito                                      |

Categorias novas: **BAD_ANCHOR** (a linha não cabe em nenhum arquivo citado nas 40 linhas anteriores
— conta como erro) e **NO_ANCHOR** (não há citação próxima que a resolva — conferir à mão, nunca
erro). Basename ambíguo não ancora: `docker-compose.yml` existe em dois módulos, e adivinhar qual
produziu acusação falsa contra a AULA-09 na primeira versão.

### Efeito medido

De 1 114 para **1 264 verificações automáticas** no material didático (medição daquele momento;
hoje são 1 268). `BAD_LINE`, `MISPLACED` e
`NOT_FOUND` seguem em **0**.

### Aberto, e é trabalho real

**49 `BAD_ANCHOR` não triados.** Não afirmo que sejam erros do material: a âncora é heurística, e os
casos inspecionados até agora eram da ferramenta, não das aulas. Dois padrões já identificados nas
aulas, ambos legítimos como sinal:

- **AULA-08:** _"sobre `.../jina_games.csv` (linha 17)"_ — "linha 17" é do `.py` em discussão, mas a
  citação imediatamente anterior é o CSV. A ferramenta ancora errado; **e um leitor também pode**.
  Vale desambiguar a redação, não só a ferramenta.
- **AULA-22:** _"compare seus números com os do ..., linhas 109–143"_ — mesma ambiguidade.

Ou seja: parte dos 49 aponta para prosa ambígua, não para número errado. Triar um a um é o próximo
passo; enquanto não for feito, o `--all` termina em FAIL e **esse FAIL não deve ser lido como 49
defeitos confirmados**.

---

## PRÓXIMA SESSÃO — três tarefas, nesta ordem

### 1. ~~Terminar a renota~~ — FECHADA em 20/08/2026

**29 de 29 renotadas.** Os dez lotes que faltavam (B, E, G, I, J, K, L, M, N, O) rodaram e todos os
dez concluíram. Notas, achados, correções e o cálculo da classificação estão na seção
**"Renota adversarial — rodada COMPLETA de 20/08/2026"** do `avaliacao/GATE-AULAS-v1.md`.

O prompt usado está reproduzível a partir daquela seção; as três coisas que não podiam faltar
faltaram em zero dos dez lotes: nota anterior não revelada (com proibição explícita de abrir o
GATE), `--all` declarado em PASS com as quatro frentes onde o trabalho de fato está, e `pdftotext`
para stdout com as violações anteriores nomeadas.

### 1b. O que a renota completa deixou aberto

**Dois auditores por aula, nas que divergem muito.** Segue valendo, e agora há critério medido para
escolher onde: as maiores oscilações entre rodadas são **AULA-24** (12 → 7), **AULA-03** (0 → 12),
**AULA-26** (7 → 3) e **AULA-13** (−1 → 10 na rodada parcial). Com um auditor por aula a nota é
sinal, não gate — e a divergência medida entre dois auditores sobre a mesma aula chega a 12 pontos.

~~**Superlativo sem `Julgamento:` é a dívida que sobra.**~~ **FECHADA em 20/08/2026.** Varredura por
script nas 29 aulas: 154 candidatos não marcados, triados um a um, **64 corrigidos** em 26 arquivos.
Resíduo de **94**, e ele é legítimo por triagem — comparativo delimitado e verificável ("o único dos
cinco que documenta as métricas", "o único A/B controlado do repositório", conferidos por `grep`),
conhecimento de domínio ("1536 não é melhor que 384; é mais caro"), pergunta de Checkpoint (não é
afirmação), termo técnico que o regex confunde com superlativo (**espaço único** na AULA-27 é espaço
compartilhado, não "o único espaço"), e negativa ("não escolhe o melhor documento").

O que foi corrigido, por saída:
- **Prefixado com `Julgamento:`** onde a frase se sustenta como opinião assumida — "o arquivo mais
  importante desta aula", "a ausência mais grave deste exemplo", "o erro experimental mais comum".
- **Marcado inline** com "**julgamento**" ou hedge de primeira pessoa onde prefixar quebraria a
  leitura — "é, **julgamento**, o mais legível dos três", "o exercício que considero mais valioso".
- **Reescrito como descrição** onde o superlativo não acrescentava nada — "é a melhor sequência
  didática do módulo" virou "é a mais gradual"; "o caso interessante e o mais caro" virou "o caso
  mais caro dos três, e o que exige decisão"; "o efeito é o pior possível" virou "é dos piores",
  porque "pior caso possível" é o exemplo que a própria RUBRICA usa do padrão a marcar.
- **Corrigido um marcador mal posicionado:** na AULA-00 o `**Julgamento:**` estava *entre* duas
  avaliações não marcadas ("embedding local é excelente", "geração local é mediana"), cobrindo
  nenhuma das duas. Agora cobre as duas.

Método, porque importa: as edições foram aplicadas por script com **trava de casamento único** — cada
substituição precisava casar exatamente uma vez, e qualquer divergência abortava a execução inteira
sem escrever nada. A trava disparou duas vezes na primeira tentativa (os arquivos são CRLF, e um
trecho da AULA-27 diferia do esperado), o que evitou edição às cegas.

**Uma regressão de auditoria ficou documentada e vale como regra nova:** o lote 10 de 19/08 mandou
remover a palavra "final" de uma citação do paper Modular RAG alegando que o paper não a tinha. O
paper **tem**. A correção foi aplicada e degradou uma citação correta; o lote M de 20/08 pegou.
Regra: **achado de auditor sobre citação literal também se confere na fonte antes de aplicar.**

### 2. ~~Triagem dos `BAD_ANCHOR`~~ — FECHADA

Feita em 19/08/2026. Os 48 itens foram triados um a um: **zero defeitos do material**. Detalhe e
causa de cada grupo na seção "Triagem dos BAD_ANCHOR" do `avaliacao/GATE-AULAS-v1.md`.

Uma regra prática que saiu dela: **a janela de ancoragem só olha para trás**, então o nome do
arquivo tem de vir antes do número da linha, ou na mesma linha. Citar "a linha 106 de `arquivo.py`"
não ancora; "`arquivo.py`, na linha 106" ancora.

### 3. ~~Push — @devops~~ — FECHADA

O repositório está publicado: **um commit**, `6658768`, na branch `main`, e
`git status -sb` dá `main...origin/main` sem divergência.
Público em https://github.com/SaLuanVitor/rag-auditado-ptbr, autoria só do autor.

Os quatro commits em `developer` que esta seção descrevia (`fc78a38b`, `56094cc3`, `84b1c77e`,
`3c30f75e`) **não existem mais** — o histórico foi refeito num commit único. Push segue sendo
autoridade exclusiva do `@devops` (Constitution, Artigo II) para o que vier depois.

**Convenção deste repositório:** commits **não** levam trailer `Co-Authored-By: Claude`. Decisão do
autor, vale só aqui.

### Estado verificado em 20/08/2026

`verify-citations --all`: **1612 OK**, `BAD_LINE`/`MISPLACED`/`NOT_FOUND`/`BAD_ANCHOR` = **0**,
16 `SKIPPED` e 20 `NO_ANCHOR` (conferência à mão por desenho) — **PASS**.
`git status --short` no clone da Packt: **vazio** — contrato preservado.
`git log --oneline`: um commit, `6658768`.

Cobertura da auditoria **recontada por script**, não lida do resumo: as 29 aulas têm nota
registrada no GATE (13 no gate v1 · 4 na rodada v2 · 3 no lote 10 · 6 nos lotes 12/14/16 · 2 no
lote 13 · 2 no lote 15 · 8 nos lotes A-D). Nenhuma aula de 00 a 28 sem nota. A renota estava em
**9 de 29** ao começar esta sessão — a seção "As 9 notas" do GATE tem exatamente nove linhas.

---

## 14. Sincronização de 19/08/2026 — o que este documento afirmava de errado

Um `*status` releu o disco e conferiu cada afirmação factual deste handoff contra o repositório.
Dez divergiam. Registro aqui o que mudou, porque a classe de erro importa mais que as correções:
**quase todas eram afirmação de estado escrita quando era verdadeira e nunca revisitada depois de o
trabalho andar.** Seis foram achadas na primeira passada; três mais apareceram ao reler as
correções (a lista "Pendente" referenciava a si mesma, "até 1 e 2 acontecerem", e o item 2 parecia
ter fechado). A décima é de outra espécie e está abaixo.

| #   | O documento dizia                                             | Verificado em disco                                                                 |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1   | "1240 citações verificadas, 0 inválidas"                      | `verify-citations --all` dá **1268 OK** e termina em **FAIL** pelos 49 `BAD_ANCHOR` |
| 2   | "**19 das 29 aulas** receberam nota independente"             | **21 de 29** por contagem mecânica — o gate afirmava 29/29, e errado                |
| 3   | Pendente 2: "primeira auditoria das 10 aulas sem cobertura"   | a lista estava errada; as que faltam são 08, 15, 16, 19-23 — item segue **ABERTO**  |
| 4   | §12: "**Nada foi commitado.**"                                | quatro commits locais em `developer`, working tree do curso limpo                   |
| 5   | Pendente 5 e tarefa 3: "nada commitado desde `56094cc3`"      | `84b1c77e` commitou as correções; falta **só o push**                               |
| 6   | §13: "escreva a AULA-12"                                      | não há aula a escrever                                                              |
| 7   | Pendente 1: "renota das **19** aulas corrigidas"              | são **29** — todas passaram por correção                                            |
| 8   | Pendente 3: "`verify-citations.js` só valida `arquivo:linha`" | o P3 estendeu o verificador; 1 114 → 1 264 verificações (hoje 1 268)                |
| 9   | Pendente 4: publicação bloqueada "até 1 e 2 acontecerem"      | só o 1 bloqueia; o 2 fechou                                                         |

Duas afirmações **não** mudaram porque a verificação as sustentou: `BAD_LINE`/`MISPLACED`/`NOT_FOUND`
seguem em **0**, e `git status --short` no clone da Packt volta **vazio** — o contrato da seção 2
está preservado do começo ao fim.

### O que fazer para isto não voltar

Este handoff afirma estado em quatro lugares — cabeçalho, §12, "Pendente" e "PRÓXIMA SESSÃO" — e
nada os amarra entre si. Antes de encerrar qualquer sessão, os quatro se conferem com três comandos:

```bash
node ferramentas/verify-citations.js --all | tail -8
git -C ../RAG-from-First-Principles status --short
git log --oneline -4
```

"Número escrito à mão onde havia contagem mecânica disponível" já está diagnosticado como a classe
de defeito dominante do próprio curso (seção "Classe de defeito dominante"). Ela reapareceu no
documento que descreve o curso — o método de revisão que a produziu segue o mesmo.

### A décima divergência: eu propaguei um número falso do gate

A primeira passada desta sincronização marcou a cobertura da auditoria como **29 de 29** e fechou o
item 2 da lista "Pendente". Errado. Vinha de duas linhas do `GATE-AULAS-v1.md` que afirmavam
"cobertura fecha em 29/29" e "todas as 29 aulas têm nota independente" — resumo que eu li e repassei
sem contar as notas do próprio arquivo.

A contagem mecânica dá **21**. Oito aulas — **08, 15, 16, 19, 20, 21, 22, 23** — não têm nota
nenhuma. E o erro do gate não ficou no papel: os lotes 12-16 foram lançados contra uma lista errada
de "aulas sem cobertura" e gastaram nove dos dez slots renotando material já auditado.

O efeito colateral virou o achado mais útil: nove aulas ficaram com **duas** notas independentes, e
os dois auditores discordam por até **12 pontos** (AULA-13: 11/12 no v1, −1/12 no 2º turno). A tabela
completa e o julgamento sobre o que isso faz com a confiabilidade da rubrica estão em
`avaliacao/GATE-AULAS-v1.md`, seção "Recontagem de 19/08/2026".

**A lição operacional, e ela é sobre mim:** "o gate diz X" não é evidência de X. Resumo de gate se
confere contra os números que o próprio gate registra, e a contagem é por script — foi o script que
achou as oito lacunas depois de duas seções afirmarem 29/29.
