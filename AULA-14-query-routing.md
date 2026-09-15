# AULA 14 — Query routing lógico e semântico

**Fase 4 — Pré-recuperação** · Módulo do repo: `05-PreRetrieval/03-QueryRouting/` (3 arquivos, contando o `.env.example`)

---

## Pergunta motivadora

As Aulas 12 e 13 entregaram um problema: existem agora Text2SQL, filtro de metadado, reescrita,
decomposição, HyDE e clarificação — cada um custando uma chamada de LLM e latência. Aplicar todos
em toda pergunta é caro, lento e frequentemente contraproducente.

Falta a peça que decide **o que fazer com esta pergunta específica**. É o roteador.

O menor módulo da Fase 4 — dois arquivos, 49 e 52 linhas — e o que torna todo o resto viável em
produção.

---

## Modelo mental

### Roteamento é a decisão que vem antes de tudo

```
pergunta
   │
   ▼
┌──────────┐
│ ROTEADOR │ ─── SQL? grafo? índice A? índice B? clarificar?
└──────────┘
   │
   ▼
o pipeline escolhido, com as técnicas que aquele caminho exige
```

Sem roteador, o pipeline é único: toda pergunta passa pelo mesmo caminho. Com roteador, cada
pergunta paga só pelo que precisa — e perguntas de tipos diferentes deixam de competir por uma
configuração média que não serve bem a nenhuma.

### Duas famílias, informação diferente

|                          | **Lógico**                        | **Semântico**                          |
| ------------------------ | --------------------------------- | -------------------------------------- |
| Decide com               | rótulo estruturado (LLM ou regra) | similaridade de embedding              |
| Saída                    | uma de N opções discretas         | a rota mais próxima no espaço vetorial |
| Testável?                | sim — dada X, rota Y              | difícil — é geometria                  |
| Escala para muitas rotas | fica verboso                      | naturalmente                           |
| Absorve fraseado novo    | só se o LLM generalizar           | sim                                    |

A diferença de fundo: o **lógico classifica**, o **semântico mede distância**. Isso determina onde
cada um falha.

---

## Parte 1 — Roteamento lógico

`01-LogicalRouting.py` tem 49 linhas e o mecanismo inteiro cabe em três trechos.

**A declaração das rotas**, com `Literal` e Pydantic (linhas 2, 5, 12 e 14):

```python
from typing import Literal
from langchain_core.pydantic_v1 import BaseModel, Field

class RouteQuery(BaseModel):
    datasource: Literal["python_docs", "js_docs", "golang_docs"] = Field(
```

**A saída estruturada** (linha 23):

```python
    structured_llm = llm.with_structured_output(RouteQuery)
```

E as duas funções que organizam: `create_router()` (linha 19) e `route_question(question)`
(linha 36).

**Duas ressalvas que o exemplo não anuncia.** A primeira é a que mais importa: **nada a jusante
consome o rótulo.** `route_question` devolve uma string (linha 40) e o `__main__` a imprime
(linha 48). O arquivo demonstra a decisão, não o desvio: o eixo está declarado, não exercido, e é
a Aula 25 que registra isso. Quem exerce o desvio de fonte de verdade é o
`02-LangChain-AdaptiveRAG.py` da Aula 26. A segunda é de custo: `route_question` chama
`create_router()` a cada pergunta (linha 38), remontando o modelo, o `with_structured_output` e o
`ChatPromptTemplate` por consulta. Em produção isso se constrói uma vez.

Três coisas para notar:

**1. `Literal` declara o espaço de saída — e o Pydantic recusa o que sair dele.** As rotas válidas
são exatamente três, declaradas no tipo. Se o modelo devolver uma quarta, você recebe uma **exceção
de validação** em vez de uma rota inválida seguindo em silêncio — e isso é a diferença entre "peço
ao LLM para classificar" e "restrinjo o LLM a classificar". **Mas não é impossibilidade de gerar:**
é indução forte mais validação com erro, o que a Aula 20 chama de **grau 4a** e diz explicitamente
que "não é garantia". Garantia de estrutura só existe no grau 4b (`json_schema` com
`strict: true`), que nenhum arquivo deste repositório usa. (A Aula 20 trabalha com
`bind_tools`, `response_format` e Pydantic; o `with_structured_output` em si reaparece nas Aulas
18, 21 e 26.)

**2. O `Field` é uma das três superfícies de prompt.** A descrição do campo é instrução, não
documentação, exatamente como o `AttributeInfo` do self-query da Aula 12. Mas ela não está
sozinha: a docstring da classe (linha 13) vira a `description` da tool, e a mensagem `system`
(linhas 26-27) é a mais específica das três, porque é a única que diz **por qual critério** rotear.
Descrição vaga produz roteamento errado, e o sintoma aparece longe da causa.

**3. É testável.** Dado que a saída é um de três rótulos, você pode escrever um teste: pergunta X
deve rotear para `python_docs`. E é a linha 22 que torna isso possível: o `temperature=0` do
`ChatDeepSeek` fixa a decodificação. Sem ela o mesmo teste dá respostas diferentes, que é a
armadilha nomeada na Aula 19. Isso é raro no resto do pipeline RAG e é, **julgamento**, a vantagem prática mais subestimada do
roteamento lógico: **você consegue medir o roteador separadamente do retriever**, o que evita
atribuir ao índice uma falha que foi de rota.

O exemplo usa três rotas de documentação de linguagens. A generalização óbvia: no seu sistema as
rotas seriam `fiscal`, `juridico`, `suporte` — ou `sql`, `vetorial`, `grafo`, generalizando os três
alvos de tradução da Aula 12 (SQL, Cypher e filtro de metadado) para uma decisão de rota. A Aula 12
encaminha explicitamente o recorte temporal para cá (`AULA-12:266-267`), e **a classificação dele
como roteamento lógico é desta aula**, na tabela da Parte 3. O resto da ponte, a generalização dos
três alvos de tradução para uma decisão de rota, é minha.

---

## Parte 2 — Roteamento semântico

`02-SemanticRouting.py` tem 52 linhas e nenhum classificador. A decisão é geometria pura.

**As rotas são prompts, e são embutidas** (linhas 29–30):

```python
prompt_templates = [combat_template, story_template]
prompt_embeddings = embeddings.embed_documents(prompt_templates)
```

**A decisão é o argmax do cosseno** — dentro da `prompt_router` (linha 33), o cálculo está nas linhas 37 e 38:

```python
def prompt_router(input):
    ...
    similarity = cosine_similarity([query_embedding], prompt_embeddings)[0]
    most_similar = prompt_templates[similarity.argmax()]
```

Aqui está a Aula 02 fechando o ciclo: `cosine_similarity` importado de `langchain.utils.math`
(linha 3), aplicado não a documentos, mas a **prompts**. E `argmax` — a rota mais próxima ganha,
sem limiar, sem empate tratado.

Um detalhe de arquitetura no import da linha 6: `RunnableLambda` e `RunnablePassthrough`. O
roteador é embrulhado como um _runnable_ do LCEL, ou seja, encaixa numa cadeia com o operador `|`
como qualquer outro estágio. Roteamento não é um `if` antes do pipeline — é parte do pipeline.

### O que o exemplo roteia

Note que as rotas são `combat_template` e `story_template` — **dois prompts diferentes**, não dois
índices. Isso é importante e é fácil passar batido: o roteamento semântico aqui escolhe **como
perguntar ao LLM**, não **onde buscar**.

É um uso legítimo e distinto: uma pergunta sobre mecânica de combate merece um prompt com instruções
diferentes de uma pergunta sobre narrativa. Roteamento de prompt é a mesma técnica aplicada ao
estágio de geração — e reaparece em
`08-Generation/02-.../04-SelectAppropriatePromptTemplateViaRouting.py`, que é a Aula 19.

### Onde o semântico falha

O `argmax` sem limiar é o ponto frágil, e vale enumerar os casos:

- **Negação e polaridade.** "documentos que **não** são fiscais" fica próximo da rota fiscal,
  porque o espaço vetorial captura assunto e não polaridade. A Aula 02 já montou o par, uma frase e
  a sua negação, para você medir o cosseno entre as duas.
- **Condição estrutural.** "quantos" contra "quais" decide entre agregação SQL e recuperação de
  trecho — e as duas perguntas são semanticamente vizinhas.
- **Rotas com assunto sobreposto.** "jurídico" e "compliance" têm descrições próximas; o roteador
  oscila entre elas, e **a oscilação é silenciosa**.
- **Recorte por permissão ou por tempo.** "só o que eu tenho acesso" não é uma direção no espaço
  de embedding.
- **Nenhuma rota serve.** Com `argmax`, alguma rota **sempre** ganha, mesmo que a similaridade
  seja baixíssima. Não há "nenhuma das anteriores" — o mesmo problema do top-k que sempre devolve
  k, visto na Aula 10.

O último item é o que eu corrigiria primeiro no exemplo: um **limiar mínimo de similaridade**,
abaixo do qual a pergunta cai numa rota default ou vai para clarificação (Aula 13). Julgamento: o
valor do limiar é parâmetro de domínio e se encontra medindo, não se adivinha.

---

## Parte 3 — A combinação que eu recomendaria

Julgamento, e é o ponto onde esta aula sai do repositório: **os dois não competem, se compõem em
camadas.**

| Camada | Técnica       | Decide                                                                          |
| ------ | ------------- | ------------------------------------------------------------------------------- |
| 1      | **lógico**    | condições duras: permissão, tipo de resposta (número × texto), recorte temporal |
| 2      | **semântico** | dentro da rota escolhida, qual assunto/índice/prompt                            |

O raciocínio: condições de segurança e de estrutura **não podem** depender de geometria — errar
permissão por proximidade de embedding é falha grave, e é exatamente o tipo de coisa que o espaço
vetorial não representa. Já desambiguar assunto entre vinte áreas é onde enumerar regras não
escala e a similaridade brilha.

E há um item que precede as duas camadas: **logar a decisão de rota**. Sem registrar qual rota
cada pergunta tomou, um erro de roteamento é indistinguível de um erro de recuperação — você vai
ajustar o `chunk_size` de um índice que a pergunta nunca alcançou. É o mesmo princípio da ordem de
diagnóstico da Aula 01: descobrir em qual estágio a falha nasce antes de tratá-la.

---

## Mão na massa

```powershell
cd RAG-from-First-Principles/05-PreRetrieval/03-QueryRouting
python 01-LogicalRouting.py
```

São **duas chaves de provedores diferentes**, e o `.env.example` do módulo declara qual é de quem:
o `01` usa DeepSeek e o `02` usa OpenAI. O `01` ainda importa `langchain_deepseek`, cuja
distribuição a Aula 12 manda instalar e esta não mencionava.

Teste com perguntas de três tipos: uma claramente de uma rota, uma ambígua entre duas, e uma que
não pertence a nenhuma das três. Observe o que acontece no terceiro caso — e note que o `Literal`
**não** garante nada. Há **três** desfechos possíveis, ruins de formas diferentes, e os três foram
reproduzidos com um duplo de teste, sem rede e sem chave:

1. O modelo espreme a pergunta numa das três rotas, roteando errado em silêncio.
2. Ele tenta sair do schema e o Pydantic recusa com `ValidationError`, tanto para valor fora do
   `Literal` quanto para campo ausente.
3. **Ele não chama a tool de jeito nenhum**, responde em prosa, o `with_structured_output` devolve
   `None` em silêncio, e `01-LogicalRouting.py:40` estoura `AttributeError` sobre um `NoneType`.

O terceiro é o mais insidioso, e é o mais provável justamente para uma pergunta fora de escopo, que
o modelo sabe responder de cabeça: a mensagem de erro não menciona rota nenhuma. **Qual dos três é
mais frequente na prática eu não medi**, porque isso exige chave de API. Registre o que aconteceu
no seu caso, porque é isso que decide se você precisa de uma rota de fallback, de um tratamento de
exceção, ou de um teste do resultado nulo antes de `01-LogicalRouting.py:40`.

```powershell
python 02-SemanticRouting.py
```

Imprima o vetor de similaridades antes do `argmax`. Ver os números lado a lado é o que revela
quando a decisão foi confortável e quando foi um empate técnico — algo como 0,82 contra 0,31 no
primeiro caso e 0,54 contra 0,52 no segundo (números ilustrativos: rodar isto exige chave de API, e
eu não rodei) — e a segunda situação é a que precisa de limiar. **Não leve a faixa absoluta a
sério**: ela depende do modelo de embedding, e a Aula 02 avisa que cosseno de modelos diferentes
não se compara. O que decide aqui é a distância entre o primeiro e o segundo, não o valor de
nenhum dos dois.

Depois compare os dois na **mesma pergunta ambígua**. O lógico devolve um rótulo com aparência de
certeza; o semântico devolve um argmax que você pode inspecionar. Essa diferença de
observabilidade é, **julgamento**, um argumento a favor do semântico que raramente se menciona.

---

## Quebre de propósito

**1. Piore a descrição do `Field`.** No `01-LogicalRouting.py`, troque a descrição do campo
`datasource` por algo vago ("a fonte de dados"). Repita as mesmas perguntas. Se a degradação não
aparecer, não conclua que o texto era decorativo: as outras duas superfícies de prompt continuam
lá, e a mensagem `system` das linhas 26-27 sozinha já especifica a tarefa. Degrade as três, uma de
cada vez, e compare. É a comparação que mostra que aquele texto é prompt, não comentário.

**2. Pergunte fora do escopo ao roteador lógico.** "Qual a capital da França?" Com três rotas de
documentação de linguagens, o `Literal` não abre uma quarta opção — mas também não obriga o modelo
a nada: ou ele espreme a pergunta numa das três, ou tenta fugir do schema e o Pydantic recusa, ou
não chama a tool e o resultado volta nulo. Observe qual dos três acontece — e conclua que falta
**uma rota de fallback e um teste do resultado nulo antes de `01-LogicalRouting.py:40`**.

**3. Roteie uma negação no semântico.** Pergunte algo com "não" e observe o argmax. A rota
escolhida tende a ser a do assunto negado. É a Aula 02 cobrando de novo, agora no roteador.

**4. Crie duas rotas com descrições parecidas.** No semântico, adicione um terceiro template com
assunto sobreposto a um existente e inclua-o em `prompt_templates` (linha 29). Antes de rodar, troque
a linha 40: ela é um `if/else` **binário** — qualquer vencedor que não seja o de combate é anunciado
como "storyline", e você não veria o terceiro ganhar. Ponha um rótulo por índice, algo como
`nomes = ["combate", "história", "o novo"]` e `print(f"Rota: {nomes[similarity.argmax()]} —
similaridades: {similarity}")`. Aí sim: faça perguntas na zona de fronteira e observe a oscilação —
sem erro, sem aviso.

**5. Implemente o limiar.** Acrescente ao `prompt_router` uma verificação: se
`similarity.max()` estiver abaixo de um valor, devolva uma rota default em vez do argmax. É a
correção que considero mais valiosa do exemplo, e cabe em poucas linhas.

---

## Armadilhas de produção

- **`argmax` sem limiar.** Alguma rota sempre ganha, mesmo quando nenhuma serve.
- **Sem rota de fallback.** Todo roteador precisa de "não sei" ou "geral". `Literal` com três
  opções e nenhuma delas sendo `outros` é um convite ao erro silencioso.
- **Não logar a rota escolhida.** Erro de roteamento vira erro de recuperação no diagnóstico, e
  você conserta o lugar errado.
- **Decisão de segurança no roteador semântico.** Permissão e escopo de acesso não são direções
  no espaço vetorial. Isso é camada lógica, ou melhor ainda, filtro no índice.
- **Roteador sem conjunto de teste.** O lógico é testável — aproveite. Uma planilha de
  pergunta → rota esperada é, **julgamento**, o teste mais barato de todo o pipeline RAG.
- **Rotas que crescem sem revisão.** Cada rota nova aumenta a chance de sobreposição com as
  existentes. Ao adicionar, releia as vizinhas.
- **Latência do roteador.** O lógico gasta uma chamada de LLM antes de qualquer coisa. O
  semântico gasta um embedding — bem mais barato, e é um argumento prático a favor dele em alto
  volume.

---

## Checkpoint

1. Qual problema criado pelas Aulas 12 e 13 o roteamento resolve?
2. Que informação o roteamento lógico usa para decidir? E o semântico?
3. Por que o roteador lógico é testável e o semântico não é, com a mesma facilidade?
4. O que o `Literal` **induz** e o que o Pydantic **valida** em `01-LogicalRouting.py`? Por que isso
   não é garantia de que só as três rotas declaradas possam sair do modelo?
5. Por que a descrição do `Field` é prompt e não documentação?
6. O que o `02-SemanticRouting.py` roteia — índices ou prompts? Por que a distinção importa?
7. Cite quatro situações em que o roteamento semântico falha.
8. Qual o problema do `argmax` sem limiar, e qual a correção que cabe em poucas linhas?
9. Por que decisões de permissão não devem ficar na camada semântica?
10. Por que logar a rota escolhida é pré-requisito de diagnóstico?

---

## Vocabulário

`query routing` · `cosine similarity` · `metadata filter` · `Text2SQL` · `prompt template` ·
`retriever`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 13 — Query translation](AULA-13-query-translation.md)
**Próxima:** [AULA 15 — Small-to-big: janela deslizante, pai-filho e expansão de contexto](AULA-15-small-to-big.md)

> **Fase 4 concluída.** As Aulas 12, 13 e 14 cobrem `05-PreRetrieval/` inteiro: construir a
> consulta, traduzir a pergunta, e decidir o caminho. A Fase 5 volta ao índice — mas agora para
> resolver a tensão que a Aula 07 deixou em aberto.
