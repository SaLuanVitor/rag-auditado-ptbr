# Remedição: AULA-14-query-routing.md

**Alvo:** `E:/Projetos/rag/rag-auditado-ptbr/AULA-14-query-routing.md` (330 linhas)
**Fonte da verdade:** `E:/Projetos/rag/RAG-from-First-Principles/`, commit `17c6942ddca140c7e2269ea4513c606f0299d1fb`
**Data:** 2026-09-16
**Interpretador usado:** `E:/tmp/rag-venv/Scripts/python.exe` (langchain-core 0.3.33, langchain-openai 0.3.3, pydantic 2.13.4)

**Declaração de método.** Não abri `avaliacao/GATE-AULAS-v1.md` em momento nenhum, nem antes nem
depois de formar esta nota. A nota anterior que conheço é a que o briefing informou, e ela não foi
usada como âncora: as seis dimensões foram pontuadas contra o arquivo atual.

---

## Nota

| Dim | Nome | Nota | Justificativa em uma linha |
| --- | --- | :-: | --- |
| **E** | Evidência | **2** | 34 citações, 33 validadas por ferramenta e a 34ª à mão; abri cerca de 20 e todas contêm o que a aula afirma. |
| **C** | Correção técnica | **2** | Todo mecanismo afirmado se confirma no fonte ou em execução, inclusive os três desfechos do `with_structured_output`, que reproduzi. |
| **H** | Honestidade epistêmica | **2** | Limite declarado em cada afirmação que exigia medição, método de reprodução declarado, autoria da síntese separada do repositório. |
| **O** | Coerência | **2** | Números internos batem entre si, e as 9 referências externas conferem na aula referida, três delas bidirecionalmente. |
| **D** | Didática | **2** | Ensina o mecanismo (`Literal` vira `enum`, docstring vira `description`), não a API; a pergunta motivadora é respondida na primeira página. |
| **A** | Acionabilidade | **1** | Exercícios excelentes em desenho, mas todos os sete passos exigem duas chaves pagas, e o duplo de teste sem chave que o próprio autor usou é citado sem ser entregue. |

**Total: 2 + 2 + 2 + 2 + 2 + 1 = 11 / 12** (conferido: soma das seis linhas acima igual ao total).

**Achados: 7. Nenhum `−1`.**

---

## Os dois pontos do histórico

### 1. "Dois desfechos" contra três: corrigido

A aula hoje enumera **três** desfechos (linhas 217 a 224), com o terceiro nomeado de forma
explícita: o modelo não chama a tool, o `with_structured_output` devolve `None` em silêncio e
`01-LogicalRouting.py:40` estoura `AttributeError` sobre um `NoneType`. A mesma enumeração é
repetida de forma consistente no exercício 2 (linhas 259 a 261).

**Reproduzi os três**, sem rede e sem chave, com um duplo de teste, como a aula declara ter feito.
Primeiro isolando o parser, depois pelo caminho completo do `with_structured_output`:

```
E:/tmp/rag-venv/Scripts/python.exe <scratchpad>/duplo.py
  1-valida:           retorno=RouteQuery(datasource='python_docs')
  2a-fora-do-Literal: EXCECAO ValidationError: unexpected value; permitted: 'python_docs', 'js_docs', 'golang_docs'
  2b-campo-ausente:   EXCECAO ValidationError: field required
  3-prosa-sem-tool:   retorno=None  ->  .datasource -> AttributeError: 'NoneType' object has no attribute 'datasource'

E:/tmp/rag-venv/Scripts/python.exe <scratchpad>/duplo2.py   (FakeChat + with_structured_output real)
  prosa-sem-tool: result=None ; result.datasource -> AttributeError: 'NoneType' object has no attribute 'datasource'
  rota-valida:    result=RouteQuery(datasource='js_docs')
```

O caminho de código está confirmado na biblioteca instalada: o `with_structured_output` com
`method="function_calling"` monta `PydanticToolsParser(tools=[schema], first_tool_only=True)`, e
esse parser devolve `None` quando não há tool call.

```
grep -n -A12 "if method == \"function_calling\"" E:/tmp/rag-venv/Lib/site-packages/langchain_openai/chat_models/base.py
  1393:  tool_choice=tool_name,
  1403:  output_parser: Runnable = PydanticToolsParser(
  1405:      first_tool_only=True,
```

A aula também acerta o detalhe de que o desfecho 2 cobre **duas** causas, valor fora do `Literal`
e campo ausente: os dois casos `2a` e `2b` acima levantam `ValidationError`, como ela diz na
linha 222.

### 2. "O roteador lógico não roteia nada": é defeito do repositório, e a aula o reporta certo

A aula **não** afirma que o roteador roteia. Ela afirma o contrário, nas linhas 78 a 82:
"nada a jusante consome o rótulo", "o eixo está declarado, não exercido", e aponta quem exerce o
desvio de verdade. O fonte confirma cada elo:

```
cat -n E:/Projetos/rag/RAG-from-First-Principles/05-PreRetrieval/03-QueryRouting/01-LogicalRouting.py
  40:      return result.datasource            # devolve string, como a aula diz
  46-48:   result = route_question(...); print(f"Routing result: {result}")   # __main__ so imprime
  38:      router = create_router()            # remontado por pergunta, como a aula diz
```

Isto é achado legítimo sobre o repositório da Packt, que a própria rubrica lista em "O que NÃO é
falha" ("Apontar defeito do repositório da Packt"), e está verificado. Conta como `C` alto.

---

## Achados

### A1. MÉDIO · `tool_choice` forçado é omitido onde a aula estima probabilidade

**Trecho (linha 226):** "O terceiro é o mais insidioso, e é o mais provável justamente para uma
pergunta fora de escopo, que o modelo sabe responder de cabeça."

**Por que é problema.** O `with_structured_output` não só monta o parser: ele **força**
`tool_choice=tool_name` na chamada. Num provedor que honra o parâmetro, o modelo fica obrigado a
chamar a tool, e é exatamente isso que torna o desfecho 3 menos provável do que a frase sugere.
A aula é meticulosa com mecanismo em todo o resto e aqui omite o mecanismo que mais pesa sobre a
afirmação que faz. Some-se que "é o mais provável" é julgamento não marcado, num texto que marca
julgamento com a etiqueta **julgamento** em quatro outros lugares (linhas 107, 177, 246, 291).

```
grep -n "tool_choice" E:/tmp/rag-venv/Lib/site-packages/langchain_openai/chat_models/base.py
  1392:  bind_kwargs = self._filter_disabled_params(
  1393:      tool_choice=tool_name,
grep -n -A12 "def _filter_disabled_params" .../chat_models/base.py    # so remove o param se disabled_params o listar
```

**Não vira `−1`, e o porquê.** A frase seguinte da própria aula declara o limite:
"**Qual dos três é mais frequente na prática eu não medi**, porque isso exige chave de API".
Declarar limite é o comportamento correto pela rubrica. E o desfecho 3 não fica impossível: o
`ChatDeepSeek` herda de `BaseChatOpenAI` e pode listar `tool_choice` em `disabled_params`, o que
não pude conferir porque `langchain_deepseek` não está instalado em nenhum dos dois venvs
(`E:/tmp/rag-venv/Scripts/python.exe -m pip list | grep -i deepseek` devolve vazio).

**Correção sugerida.** Uma frase depois da enumeração: o `with_structured_output` força
`tool_choice`, então o desfecho 3 depende de o provedor honrar o parâmetro; marcar "o mais
provável" como julgamento.

### A2. MÉDIO · O duplo de teste sem chave é citado e não é entregue

**Trecho (linhas 217 a 218):** "os três foram reproduzidos com um duplo de teste, sem rede e sem
chave".

**Por que é problema.** Os dois blocos de "Mão na massa" e os cinco exercícios de "Quebre de
propósito" exigem, sem exceção, chave paga de dois provedores diferentes (DeepSeek no `01`,
OpenAI no `02`). O aluno sem chave não executa nenhum passo. O autor tinha em mãos o caminho que
dispensa chave, informa que ele existe, e não o mostra. É a única lacuna estrutural da aula, e é
o que sustenta `A = 1`.

```
cat E:/Projetos/rag/RAG-from-First-Principles/05-PreRetrieval/03-QueryRouting/.env.example
  DEEPSEEK_API_KEY=...   # 01-LogicalRouting.py
  OPENAI_API_KEY=...     # 02-SemanticRouting.py
```

**Correção sugerida.** Vinte linhas de duplo (modelo falso com `bind_tools`, três mensagens de
resposta) transformam o exercício 2 em executável por qualquer aluno. Reproduzi isso em menos de
uma página; a aula ganharia o exercício mais barato do curso.

### A3. MÉDIO · O ponteiro de instalação colide com a Aula 00

**Trecho (linhas 212 a 213):** "O `01` ainda importa `langchain_deepseek`, cuja distribuição a
Aula 12 manda instalar e esta não mencionava."

**Por que é problema.** A referência confere: `AULA-12:288` de fato manda `some langchain-deepseek`.
Mas a Aula 00 diz o oposto para o mesmo venv, e por um motivo concreto:

```
sed -n '153,155p' AULA-00-setup-do-ambiente.md
  "Do DeepSeek ele traz a distribuicao langchain-deepseek-official==0.1.0 (linha 103), que serve o
   mesmo modulo langchain_deepseek: nao instale langchain-deepseek por cima dela neste venv."

grep -n -i deepseek RAG-from-First-Principles/91-Environment/requirements_langchain_NoGPU_Mac-Win.txt
  103:langchain-deepseek-official==0.1.0        # confirma o pin que a Aula 00 cita
```

O aluno que seguiu a Aula 00 e agora segue o ponteiro da Aula 14 faz exatamente o que a Aula 00
proibiu. O defeito nasce na Aula 12, não aqui, e por isso **não derruba `O`**: o teste da dimensão
é se a referência confere na aula referida, e ela confere. Mas a Aula 14 é onde o aluno age, então
o custo cai sobre `A`.

**Correção sugerida.** Acrescentar: "se você montou o venv da Aula 00, o módulo já está lá pela
distribuição `langchain-deepseek-official`; não instale por cima".

### A4. BAIXO · O `print` do exercício 4 não sobrevive ao copiar e colar

**Trecho (linhas 271 a 272):** a f-string sugerida quebra no meio, entre `{nomes[...]}` e
`similaridades:`, por quebra de linha do markdown dentro do literal de string.

**Por que é problema.** Colado como está, é `SyntaxError` de string não terminada. O exercício é
bom (ver A7) e tropeça na formatação.

**Correção sugerida.** Pôr o trecho em bloco de código, não em código inline.

### A5. BAIXO · "o `Literal` não garante nada" ultrapassa o que a própria aula estabeleceu

**Trecho (linha 216):** "note que o `Literal` **não** garante nada".

**Por que é problema.** A Parte 1 explicou com precisão o que ele garante: um objeto devolvido tem
`datasource` em uma das três opções, sob pena de `ValidationError` (confirmei: caso `2a` acima).
O que não se garante é que o modelo produza a tool call. "Não garante nada" apaga a distinção que
a aula acabou de construir.

**Correção sugerida.** "o `Literal` não garante que haja rota nenhuma".

### A6. BAIXO · `temperature=0` como "fixa a decodificação", sem ressalva

**Trecho (linhas 105 a 106):** "o `temperature=0` do `ChatDeepSeek` fixa a decodificação. Sem ela
o mesmo teste dá respostas diferentes".

**Por que é problema.** `temperature=0` é decodificação gulosa, não determinismo garantido em API
hospedada. Numa aula que insiste corretamente em "não é garantia" a respeito do `Literal`, a
assimetria chama atenção. A linha citada existe e diz o que a aula afirma
(`01-LogicalRouting.py:22`, `temperature=0`), então é questão de alcance da afirmação, não de
evidência.

### A7. BAIXO · Checkpoint 7 pede quatro onde a aula lista cinco

**Trecho (linha 309):** "Cite quatro situações em que o roteamento semântico falha." A Parte 2
lista cinco (linhas 163 a 174). Respondível, porque quatro é subconjunto de cinco. Registro para
completude, sem custo.

---

## Verificação amostral de citações (exigência da rubrica: mínimo 5)

Ferramenta primeiro, depois leitura do conteúdo, que é o que a ferramenta não faz.

```
node ferramentas/verify-citations.js AULA-14-query-routing.md
  34 citacoes, 33 OK · BAD_LINE 0 · MISPLACED 0 · NOT_FOUND 0 · SKIPPED 1 (glob) · PASS
node ferramentas/entreaulas.js AULA-14-query-routing.md
  1 SEM_PROVA (AULA-12:266-267, faixa cabe, conteudo nao se decide dali) · reprovando 0 · PASS
```

Conferência de conteúdo, uma a uma, contra `cat -n` dos dois arquivos do módulo:

| Aula diz | Linha citada | Conteúdo real | Confere |
| --- | --- | --- | :-: |
| `Literal` importado | `01:2` | `from typing import Literal` | sim |
| Pydantic importado | `01:5` | `from langchain_core.pydantic_v1 import BaseModel, Field` | sim |
| docstring da classe vira `description` da tool | `01:13` | `"""Route the user's query to the most relevant data source"""` | sim |
| declaração das rotas | `01:14` | `datasource: Literal["python_docs","js_docs","golang_docs"] = Field(` | sim |
| `create_router()` | `01:19` | `def create_router():` | sim |
| `temperature=0` | `01:22` | `ChatDeepSeek(model="deepseek-chat", temperature=0, ...)` | sim |
| saída estruturada | `01:23` | `structured_llm = llm.with_structured_output(RouteQuery)` | sim |
| mensagem `system`, a mais específica | `01:26-27` | as duas linhas do `system`, e a segunda dá o critério de rota | sim |
| `route_question(question)` | `01:36` | `def route_question(question: str) -> str:` | sim |
| `create_router()` por pergunta | `01:38` | `router = create_router()` dentro de `route_question` | sim |
| devolve string; ponto do `AttributeError` | `01:40` | `return result.datasource` | sim |
| `__main__` imprime | `01:48` | `print(f"Routing result: {result}")` | sim |
| `cosine_similarity` de `langchain.utils.math` | `02:3` | `from langchain.utils.math import cosine_similarity` | sim |
| `RunnableLambda` e `RunnablePassthrough` | `02:6` | o import dos dois | sim |
| rotas são prompts e são embutidas | `02:29-30` | `prompt_templates = [...]` e `embed_documents(...)` | sim |
| `prompt_router` | `02:33` | `def prompt_router(input):` | sim |
| argmax do cosseno | `02:37-38` | `cosine_similarity(...)` e `prompt_templates[similarity.argmax()]` | sim |
| `if/else` binário a trocar | `02:40` | ternário que imprime combat ou storyline | sim |
| encaminhamento do recorte temporal | `AULA-12:266-267` | "A Aula 14 volta a este ponto, classificando recorte temporal como roteamento lógico" | sim |

Números do cabeçalho, conferidos:

```
wc -l 05-PreRetrieval/03-QueryRouting/*.py   ->  49 e 52          (aula: "49 e 52 linhas")
ls  05-PreRetrieval/03-QueryRouting/          ->  3 arquivos      (aula: "3 arquivos, contando o .env.example")
por modulo da Fase 4: 01-QueryConstruction 15 arquivos, 02-QueryTranslation 7, 03-QueryRouting 3
                                                              (aula: "o menor modulo da Fase 4")
ls 08-Generation/02-OptimizingResponseViaPrompts/ -> 04-SelectAppropriatePromptTemplateViaRouting.py existe
                                                              (a unica citacao que a ferramenta pulou)
```

Verificação empírica das "três superfícies de prompt" (linhas 98 a 101), que é afirmação de
mecanismo e não de linha:

```
E:/tmp/rag-venv/Scripts/python.exe <scratchpad>/tool.py   # convert_to_openai_tool(RouteQuery)
  "description": "Route the user's query to the most relevant data source"     <- docstring da classe
  "datasource": {"description": "Given the user's question, ...",              <- o Field
                 "enum": ["python_docs","js_docs","golang_docs"]}              <- o Literal vira enum
```

As três superfícies existem e são o que a aula diz. O `Literal` virar `enum` no schema da tool é
exatamente a "indução forte" que ela nomeia.

---

## Coerência externa: as nove referências

| Referência da Aula 14 | Confere onde | Resultado |
| --- | --- | :-: |
| Aula 25 registra "declarado, não exercido" | `AULA-25:128`, com a frase literal | confere |
| Aula 26 exerce o desvio no `02-LangChain-AdaptiveRAG.py` | `AULA-26:180` e `:196` | confere |
| Aula 20, grau 4a, "não é garantia" | `AULA-20:47` e `:50` | confere |
| Aula 20, grau 4b `json_schema` + `strict: true`, que nenhum arquivo do repo usa | `AULA-20:60-64`; e `grep -rn json_schema --include=*.py` no repo devolve vazio | confere |
| `with_structured_output` reaparece nas Aulas 18, 21 e 26, e não na 20 | `grep -c`: 3, 3, 1 e **0** na 20 | confere |
| Aula 12 encaminha o recorte temporal | `AULA-12:266-267` | confere |
| Aula 19 nomeia a armadilha da decodificação solta | `AULA-19`, "Amostragem ligada durante avaliação" | confere |
| Aula 02, o par frase/negação e cosseno entre modelos incomparável | `AULA-02:172` e `AULA-02:218-220` | confere |
| Aula 10, top-k que sempre devolve um número fixo | `AULA-10:293-295` ("forçar `k=10` é arbitrário") | confere, com outra fraseologia |
| Aula 01, ordem de diagnóstico | `AULA-01:159` | confere |

Três dessas referências são **bidirecionais**: a Aula 19 (linhas 477 a 483) e a Aula 25 (linhas
128, 222 e 256) citam a Aula 14 de volta, e citam o mesmo conteúdo, inclusive os três desfechos.
A Aula 19 escreve "a Aula 14 enumera três, e só o segundo é a exceção de validação", o que só é
verdade sobre o texto de hoje. As duas aulas estão sincronizadas com a correção.

Coerência interna: "3 arquivos" (linha 3), "dois arquivos, 49 e 52 linhas" (15), "49 linhas" (57),
"52 linhas" (122), "três rotas" e "três superfícies" e "três desfechos" repetidos sem divergir
entre as seções. Nenhum número briga com outro.

---

## Nota sobre `D`

O que sustenta `D = 2`, além de a pergunta motivadora ser respondida na linha 13: a aula ensina
por que a decisão funciona, não como se chama o método. O `Literal` vira `enum` no schema, a
docstring vira `description` da tool, o `Field` instrui o modelo, e a mensagem `system` é a única
que diz por qual critério rotear. Conferi as três superfícies por execução, e a hierarquia que a
aula propõe entre elas (a `system` é a mais específica) é sustentável pelo conteúdo real dos três
textos.

A Parte 3 é a melhor seção: a camada lógica para condição dura e a semântica para desambiguar
assunto, com o argumento certo, que decisão de permissão não é direção no espaço vetorial. Está
marcada como julgamento e declarada como saída do repositório, que é o tratamento correto.

O exercício 4 merece registro positivo: notar que o `if/else` da linha 40 é binário, e que por
isso um terceiro template vencedor apareceria anunciado como "storyline", é o tipo de armadilha
que só se acha lendo o fonte. Sem essa observação, o exercício de rotas sobrepostas falharia em
silêncio e o aluno concluiria o oposto do que a aula ensina.

---

## Estado dos repositórios ao fim da auditoria

```
cd E:/Projetos/rag/rag-auditado-ptbr        && git status --porcelain   ->  (vazio)
cd E:/Projetos/rag/RAG-from-First-Principles && git status --porcelain   ->  (vazio)
                                               git log -1 --format=%H   ->  17c6942ddca140c7e2269ea4513c606f0299d1fb
```

Nada foi escrito, criado ou apagado nos dois repositórios. Os três scripts de prova
(`duplo.py`, `duplo2.py`, `tool.py`) ficaram no scratchpad da sessão. Nenhum `fetch`, nenhum
`pull`, nenhum pacote instalado.
