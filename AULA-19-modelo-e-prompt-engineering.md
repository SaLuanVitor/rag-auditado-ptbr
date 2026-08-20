# AULA 19 — Escolha de modelo e prompt engineering para RAG

**Fase 7 — Geração** · Módulo do repo: `08-Generation/01-ModelSelectionAndInvocation/` (2 arquivos) e `/02-OptimizingResponseViaPrompts/` (4 arquivos)

---

## Pergunta motivadora

Dezoito aulas foram gastas para trazer o trecho certo. Agora ele está montado num contexto e
precisa virar resposta. Três perguntas nascem aqui:

1. **Qual modelo** recebe esse contexto — e por que essa pergunta vem depois, não antes?
2. **O que dizer a ele** além do contexto e da pergunta?
3. Quando o problema **não é** prompt — e o reflexo de mexer no prompt está atrasando o
   diagnóstico?

A terceira é a mais importante, e é a que esta aula vai insistir em separar das outras duas. A
Aula 03 deixou uma dívida: uma única frase no template (_"I cannot find relevant information in the
provided context."_) é a diferença entre um RAG que admite ignorância e um que inventa. Essa dívida
se paga aqui — e o exemplo principal deste módulo é justamente um que **não tem** essa frase.

---

## Modelo mental

### Prompt é o último lugar a mexer, e o primeiro que todo mundo mexe

A ordem de diagnóstico é ingestão → recuperação → geração. Prompt é o estágio final do último
item. É também a parte visível, editável sem redeploy de índice e barata de testar — por isso é
onde a mão vai primeiro.

Julgamento de engenharia: se você mudou o prompt antes de imprimir o que a recuperação devolveu,
você não está otimizando, está adivinhando. O prompt não conserta contexto errado. Ele decide o
que o modelo faz **com** o contexto que chegou, seja ele bom ou lixo.

### Prompt em RAG tem quatro trabalhos, não um

Escrever "responda com base no contexto" cobre um deles. Os quatro:

| Trabalho                  | O que o prompt precisa dizer                            | Se falta                                                                 |
| ------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Delimitar a fonte**     | responda **a partir do contexto**, não do que você sabe | o modelo mistura memória paramétrica com evidência, e você não distingue |
| **Autorizar a abstenção** | se o contexto não responde, diga que não responde       | o modelo preenche a lacuna com plausibilidade                            |
| **Fixar o formato**       | estrutura, seções, extensão                             | saída livre, impossível de consumir por programa                         |
| **Fixar o tom e o nível** | público, registro, profundidade                         | resposta certa e inutilizável                                            |

Os exemplos deste módulo cobrem **formato** com cuidado e **abstenção** com nada. Isso não é
crítica gratuita: é a leitura crítica que o curso propõe. O aluno que copiar o template de
`01-UsePromptTemplateToClarifyGenerationGoal.py` para produção herda um RAG que nunca diz "não sei".

### Escolha de modelo é uma decisão de restrição, não de ranking

A pergunta "qual o melhor modelo para RAG?" é malformada, pela mesma razão que "qual o melhor
`chunk_size`?" é. As restrições que decidem:

- **O dado pode sair da sua rede?** Se não pode, o conjunto de candidatos é local, e o resto da
  discussão acontece dentro dele. É a restrição que elimina mais opções de uma vez.
- **Qual o tamanho do contexto que você monta?** k × tamanho de chunk define o piso da janela.
- **A saída vai ser lida por humano ou por programa?** A segunda exige aderência a formato, que é
  o assunto da Aula 20.
- **Latência tolerada e custo por consulta.** Reranking, roteamento por LLM e Self-RAG somam
  chamadas; cada uma volta a bater aqui.

Nenhum desses itens se responde com benchmark de blog. Todos se respondem com o seu corpus e o
seu conjunto de avaliação — que é a Aula 22.

### RAG ensina fato, fine-tuning ensina comportamento

A Aula 01 estabeleceu a distinção. Este módulo é o único lugar do repositório onde ela aparece em
código, lado a lado, no mesmo subdiretório e sobre o mesmo modelo. Vale ler os dois arquivos
seguidos justamente por isso.

---

## Parte 1 — Invocar um modelo local (e o que o nome do diretório promete)

`08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py` tem 34 linhas e **nenhum RAG**:
sem loader, sem chunking, sem vector store, sem contexto. É invocação pura.

O modelo é fixo (`08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py:6`):

```python
model_name = "Qwen/Qwen3-0.6B"  # Small model version of Qwen3
```

Carga e geração (`08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py:9-14` e `:22-28`):

```python
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    trust_remote_code=True
).eval()
```

```python
outputs = model.generate(
    **inputs,
    max_new_tokens=200,
    do_sample=True,
    temperature=0.7,
    top_p=0.9
)
```

Três leituras que importam mais que a API:

**1. `device_map="auto"` é o único lugar onde hardware aparece.** Sem GPU, a carga cai para CPU e
a geração fica lenta o suficiente para mudar sua percepção do exemplo. Custo nomeado: um modelo de
0,6 B roda em CPU; os de 7 B para cima, na prática, não — não sem quantização, que este exemplo não
cobre.

**2. O prompt vai cru para o tokenizer** (`08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py:21`):

```python
inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
```

Qwen3 é um modelo de instrução, e modelos de instrução são treinados com um formato de conversa
(papéis, marcadores de turno) que o `tokenizer.apply_chat_template` monta. `apply_chat_template`
**não aparece em nenhum `.py` do repositório** — verificado por `grep -rn` sobre todos os arquivos
`.py`. Consequência (conhecimento de domínio, não afirmação sobre este código): tokenizar o texto
cru entrega ao modelo uma sequência fora da distribuição em que ele foi ajustado, e a saída fica
pior do que o modelo é capaz de dar. Esse é o tipo de detalhe que faz alguém concluir "modelo
pequeno é ruim" quando o problema era o formato de entrada.

**3. O `print` da resposta inclui a pergunta** (`08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py:30`):

```python
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
```

`generate` devolve a sequência completa — prompt mais continuação. O script decodifica `outputs[0]`
inteiro, sem cortar o prefixo de entrada. Você vai ver o prompt ecoado antes da resposta, e isso é
comportamento esperado do código como está escrito, não bug do modelo.

### O que este subdiretório não faz

Ele se chama `01-ModelSelectionAndInvocation`. **Invocação** existe. **Seleção** não: os dois
arquivos usam o mesmo modelo, fixo em `08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py:6` e em
`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:44`. Não há comparação entre
modelos, nem critério, nem medição — nada que se pareça com escolher.

É mais um caso do padrão que o curso mapeia em vários outros módulos: o nome promete o que o
código não faz. Registre e siga; o valor do exemplo está na invocação, e a seleção você vai fazer
com o método da Aula 22, não com este arquivo.

Detalhe honesto a favor do repo: o `.env.example` deste subdiretório declara que não há chave
envolvida (`08-Generation/01-ModelSelectionAndInvocation/.env.example:1-2`) — o modelo é local, e
a documentação está correta aqui.

---

## Parte 2 — O único fine-tuning do repositório

`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py` tem 112 linhas e é o **único
arquivo do repositório** que treina um modelo — `grep -rln "TrainingArguments\|SFTTrainer\|peft\|LoraConfig"`
sobre todos os `.py` retorna esse caminho e nenhum outro.

O dado de treino é SQuAD, cem exemplos, formatados assim
(`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:14` e `:18`):

```python
dataset = load_dataset("squad", split="train[:100]")  # Use the first 100 data points as an example
```

```python
prompt = f"Question: {example['question']}\nContext: {example['context']}\nAnswer: {example['answers']['text'][0]}"
```

Pare nesta linha. O formato de treino é **pergunta + contexto + resposta**: exatamente a forma de
um turno de RAG. O que este fine-tuning ensina não é o conteúdo do SQuAD — cem exemplos não ensinam
fato nenhum. Ele ensina **a se comportar como um modelo que responde a partir de um contexto dado**.
É a Aula 01 em código: RAG traz o fato, fine-tuning fixa o comportamento.

Os hiperparâmetros estão todos explícitos (`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:60-71`), o que é a virtude
pedagógica do arquivo. Quatro observações de custo:

**Treino é completo, não adaptador.** Não há PEFT nem LoRA — o mesmo `grep` acima confirma a
ausência. Ajustar todos os pesos de um modelo de 0,6 B é factível numa GPU modesta; a técnica não
sobe direto para modelos maiores sem trocar a estratégia.

**`fp16=True`** (`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:70`) pressupõe GPU com suporte a meia precisão. Rodar
em CPU não é questão de lentidão: essa linha muda o requisito de ambiente.

**Todo token entra no cálculo da perda.** O collator é
(`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:74-77`):

```python
data_collator = DataCollatorForLanguageModeling(
    tokenizer=tokenizer,
    mlm=False  # Do not use masked language modeling
)
```

Com `mlm=False`, os rótulos são os próprios `input_ids` — o modelo é treinado a prever pergunta e
contexto também, não apenas a resposta. Para ajuste de instrução costuma-se mascarar o prompt e
computar perda só na resposta. O exemplo não faz isso. Não é erro de sintaxe; é uma escolha que
dilui o sinal, e vale saber que ela está aí.

**`padding="max_length"` com `max_length=512`** (`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:28-30`) empurra todo
exemplo para 512 tokens, curtos inclusive. Paga-se computação em preenchimento.

Julgamento: como material didático o arquivo cumpre — mostra o ciclo inteiro, de dataset a modelo
salvo (`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:93-94`) e teste (`08-Generation/01-ModelSelectionAndInvocation/02-FineTuningQwen3.py:98-106`). Como receita
de produção, não: cem exemplos, uma época, sem divisão de validação e sem métrica. Não há como
saber se o treino melhorou algo — o script imprime uma resposta e termina.

---

## Parte 3 — Prompt que fixa formato, e um RAG que não recupera

`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py`
tem 53 linhas e é o pipeline completo: carrega, divide, indexa, busca, monta prompt, gera.

O template (`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:31-39`) é a parte que dá nome ao
arquivo:

```python
Please analyze in detail and generate a character analysis report in the following format:

Character Name: [Provide full name]

Background Story: Introduce the character's origin and background, relationships with other characters, and their role in the story.
```

Isso é o trabalho "fixar o formato" da tabela do modelo mental, feito com clareza: rótulos de
seção, escopo de cada seção, ordem. Uma saída assim é comparável entre consultas e utilizável por
quem lê. Vale copiar o padrão.

O que **não** está no template: nenhuma instrução de abstenção. Nenhum "se o contexto não contiver
a informação, diga que não contém". A linha 39 pede o oposto —
`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:39`:

```python
Please conduct a detailed analysis based on the information, ensuring accuracy and coherence.
```

"Garanta exatidão" é um pedido que o modelo não tem como cumprir e vai atender de qualquer forma:
produzindo texto coerente. Compare com a Aula 03, onde a instrução de admitir ignorância estava
escrita. Aqui, se a recuperação trouxer o personagem errado, o relatório sai completo, formatado e
falso.

### O detalhe aritmético: a recuperação é decorativa neste exemplo

Três fatos, cada um verificável:

1. O corpus é `99-EN/black-myth-wukong/black_myth_wukong_setting.txt`
   (`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:10`), e `wc -c` nesse arquivo devolve
   **779 bytes**.
2. O divisor é `CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`
   (`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:14`).
3. A busca não passa `k`, e só o primeiro resultado é usado
   (`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:23-24`):

```python
docs = db.similarity_search(query)
retrieved_content = docs[0].page_content
```

Um documento de 779 caracteres com `chunk_size=1000` produz **um chunk**. A busca por similaridade
sobre um índice de um elemento devolve esse elemento. `docs[0]` é o documento inteiro.

Ou seja: neste exemplo, `retrieved_content` não é resultado de recuperação — é o arquivo. O
pipeline está sintaticamente completo e semanticamente inerte. Isso não invalida a lição sobre
prompt (que é o assunto do arquivo), mas invalida qualquer conclusão sobre recuperação tirada dele.
Um aluno que troque o corpus por um PDF de 300 páginas e mantenha `docs[0]` vai ver o exemplo
mudar de comportamento — e é por isso que essa aritmética merece ser feita.

Anotação de dependência: este arquivo usa `OpenAI` de `langchain_openai`
(`08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py:6`), que é a interface de _completion_, não de
_chat_.

---

## Parte 4 — Few-shot com exemplo escolhido por similaridade

`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py` tem
81 linhas e faz algo conceitualmente diferente de tudo que veio antes: o índice vetorial guarda
**exemplos**, não conhecimento (`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:43-44`):

```python
example_texts = [ex["context"] for ex in examples]
db = FAISS.from_texts(example_texts, embeddings)
```

A busca escolhe o exemplo mais parecido com o problema atual
(`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:50-51`):

```python
docs = db.similarity_search(current_issue, k=1)
most_similar_example = next(ex for ex in examples if ex["context"] == docs[0].page_content)
```

**Isto é o "R" do RAG servindo comportamento, não conhecimento.** Recupera-se um par
problema/resposta-modelo para que o modelo copie a **forma**. É a mesma inversão que a Aula 14
mostrou no roteamento semântico, onde as rotas eram `combat_template` e `story_template` — prompts,
não índices. Vale fixar a generalização: recuperação é um mecanismo de seleção; o que ela seleciona
é decisão de arquitetura sua.

Três fragilidades, todas de leitura direta:

**O casamento de volta é por igualdade de string.** `next(...)` sem valor padrão levanta
`StopIteration` se nenhum `ex["context"]` for exatamente igual a `docs[0].page_content`. Funciona
aqui porque os textos entraram inteiros no índice. Passe os exemplos por um divisor, ou por
qualquer normalização, e essa linha quebra em vez de degradar.

**O banco tem dois exemplos** (`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:10-39`, dois
dicionários). Com `k=1` sobre dois candidatos, a "seleção dinâmica" tem pouco espaço para
demonstrar-se. A técnica é boa; a escala do exemplo não a exercita.

**Três imports não são usados.** `grep -n` no arquivo mostra `PromptTemplate`, `TextLoader` e
`CharacterTextSplitter` apenas nas linhas 1, 2 e 3 — nunca depois. A montagem do prompt é
`str.format` puro (`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:72-76`), não
`PromptTemplate`. Import não é uso: se você ler a lista de imports para deduzir a arquitetura,
vai concluir que o script carrega arquivo e faz chunking. Não faz nenhum dos dois.

Nota didática do arquivo, essa a favor: ele imprime o prompt montado antes de chamar o modelo
(`08-Generation/02-OptimizingResponseViaPrompts/02-UseFewShotsToProvideReferenceForResponse.py:78`). Ver o prompt final é o hábito que mais
economiza tempo em depuração de geração.

---

## Parte 5 — A diversidade que o código não produz

`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py`
tem 54 linhas e é o terceiro caso deste módulo em que o nome promete mais que o código entrega.

**Não há recuperação nenhuma.** A função devolve uma string literal
(`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py:6` e `:34`):

```python
def get_code_snippet() -> str:
```

```python
retrieved_content = get_code_snippet()
```

A variável se chama `retrieved_content` e nada foi recuperado. É o mesmo hábito de nomear pela
intenção em vez do fato — e é bom exercício encontrar isso, porque em código alheio essa
divergência custa horas.

**A diversidade é pedida ao prompt, não ao decodificador**
(`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py:39`):

```python
Note: Please provide multiple different analytical perspectives, covering input exceptions, permission control, call chain, etc.
```

E a saída é lida como se houvesse vários candidatos
(`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py:53-54`):

```python
for i, choice in enumerate(response.choices):
    print(f"Candidate Analysis {i+1}:{choice.message.content.strip()}\n")
```

Fato do código, verificado por `grep -n "n=\|choices"` no arquivo: **o parâmetro `n` não existe**;
`choices` aparece só na linha 53. Conhecimento de domínio: a API de _chat completions_ devolve um
elemento em `choices` quando `n` não é informado. Logo o laço "Candidate Analysis" itera uma vez —
o rótulo plural descreve uma intenção que a chamada não solicitou.

A distinção que fica: pedir múltiplas perspectivas **dentro de uma resposta** (o que o prompt faz)
e gerar múltiplas respostas **independentes** (o que `n>1`, ou várias chamadas, faria) são
mecanismos diferentes, com custos diferentes. O primeiro cabe numa chamada e pode produzir
perspectivas que se contaminam entre si; o segundo multiplica custo e latência por amostra e
depois exige critério de escolha ou fusão. O arquivo faz o primeiro e nomeia o segundo.

Duas anotações de ambiente:

- É o único script deste subdiretório que chama `load_dotenv()`
  (`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py:2` e `:4`) — `grep -rn "load_dotenv"`
  nos dois subdiretórios só encontra aqui. Mas o
  `08-Generation/02-OptimizingResponseViaPrompts/.env.example:2` afirma: _"Every script here loads
  this file via python-dotenv's load_dotenv()."_ É falso para três dos quatro. Nos arquivos 01, 02 e
  04 a chave precisa já estar exportada no ambiente, ou `os.getenv` devolve `None`. Documentação que
  descreve a intenção, não o código — e o `08-Generation/.env.example:2` repete a mesma frase.
- Usa o cliente `openai` apontado para outro provedor
  (`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py:31-32`):

```python
client = OpenAI(base_url="https://api.deepseek.com",
                api_key=os.getenv("DEEPSEEK_API_KEY"))
```

Trocar o `base_url` é o padrão para provedores com API compatível, e é a razão pela qual "escolha
de modelo" muitas vezes é uma linha de configuração — não uma reescrita.

---

## Parte 6 — Roteamento de prompt, e um teste que não testa o roteador

`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py` tem
143 linhas e fecha o gancho que a Aula 14 deixou. Lá, o roteamento escolhia prompt por **geometria**
(argmax do cosseno entre a pergunta e os templates embutidos). Aqui, escolhe por **classificação com
LLM** (`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:83` e `:86`):

```python
Only return the corresponding scenario identifier, e.g., 'customer_service'
```

```python
intent = llm.invoke(intent_prompt).strip()
```

O contraste vale a comparação explícita:

|                    | Aula 14 — semântico                      | Aqui — por LLM                                                                                                          |
| ------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Mecanismo          | cosseno entre pergunta e prompts         | LLM classifica em rótulo                                                                                                |
| Custo por consulta | um embedding                             | uma chamada de LLM completa                                                                                             |
| Falha típica       | rota vizinha ganha por pouco, sem limiar | rótulo fora do conjunto, texto extra na saída                                                                           |
| Tratamento no repo | `argmax`, sem empate nem limiar          | `raise ValueError` (`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:91`) |
| Auditável          | similaridades são inspecionáveis         | decisão em texto livre                                                                                                  |

Julgamento: o roteador por LLM é mais flexível para rótulos que dependem de nuance, e mais caro e
menos determinístico. O `.strip()` da linha 86 é a única defesa contra saída suja; qualquer
explicação adicional do modelo derruba a comparação `intent in templates`
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:88`) e o `ValueError` estoura.

### O bug que ensina mais que o exemplo

No laço de teste, o template vem do roteador
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:123`):

```python
prompt_template = get_prompt_template_by_question(query)
```

E os casos históricos vêm de outra fonte
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:128`):

```python
similar_cases = get_similar_cases(scenario, query)
```

`scenario` é a variável do laço (`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:117`), isto é,
**o rótulo verdadeiro**, não o que o roteador decidiu. O `intent` produzido dentro de
`get_prompt_template_by_question` nunca é comparado com `scenario`, e nunca sai da função.

Consequências, em ordem de gravidade:

1. **O teste não testa o roteador.** Se o roteamento errasse, os casos recuperados continuariam
   vindo do cenário correto, e a saída pareceria razoável. O erro ficaria invisível — a menos que
   você lesse o template impresso na linha 125 e notasse que é o de outro cenário.
2. **Em produção não existe `scenario`.** Só existe a pergunta. Um consumidor real deste código
   precisa usar o `intent` do roteador para escolher a base de casos — e aí o erro de roteamento
   passa a custar recuperação errada, não só template errado.

Este é o exercício de leitura crítica mais valioso do módulo: o arquivo demonstra a técnica e ao
mesmo tempo demonstra como um teste pode passar sem exercitar o que ele parece exercitar.

### Custo de recuperação escondido numa função

`get_similar_cases` reconstrói o índice a cada chamada
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:96-97`):

```python
embeddings = OpenAIEmbeddings(openai_api_key=os.getenv("OPENAI_API_KEY"))
db = FAISS.from_texts(case_database[scenario], embeddings)
```

Três textos são re-embutidos por consulta. Com três casos por cenário
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:53-69`) isso é irrelevante em custo e fatal
como padrão: a mesma estrutura com dez mil casos re-indexa dez mil textos a cada pergunta. Índice
se constrói uma vez e se reusa — foi o que a Fase 3 inteira tratou.

Detalhe de estilo com consequência: `llm` é usado dentro de
`get_prompt_template_by_question` (`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:86`) mas só
é atribuído depois, no corpo do módulo
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:106`). Funciona porque a primeira chamada
acontece na linha 123, depois da atribuição. Mova a linha 106 para o fim do arquivo e o script
quebra com `NameError`.

**Um limite que declaro em vez de afirmar:** o dicionário passado ao template tem quatro chaves
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:133-138`) e cada template declara duas. Se o
`format` do `PromptTemplate` do LangChain rejeita chaves extras ou as ignora silenciosamente é
comportamento de biblioteca, e `langchain` **não está instalado neste ambiente** — a importação
falha. Não vou afirmar o resultado sem executar. É a primeira coisa que você descobre ao rodar o
arquivo, e está na lista da Mão na massa por isso.

---

## Mão na massa

O subdiretório 01 não precisa de chave; o 02 precisa. Comece pelo que roda sem conta.

**1. Invocação local, e a diferença do formato de conversa.** Rode
`08-Generation/01-ModelSelectionAndInvocation/01-UsingQwen3.py`. Observe duas coisas: quanto tempo a carga leva no
seu hardware, e que a saída impressa contém a pergunta antes da resposta. Depois, num interpretador,
compare o texto que vai ao modelo com e sem `tokenizer.apply_chat_template([{"role": "user",
"content": prompt}], tokenize=False, add_generation_prompt=True)`. A diferença entre as duas
sequências é a razão de a Parte 1 ter insistido nesse ponto.

**2. Amostragem.** No mesmo arquivo, troque `do_sample=True` por `do_sample=False` e rode duas
vezes. Depois volte para `True` com `temperature=0.7` e rode duas vezes. Você acabou de observar por
que uma avaliação de RAG precisa fixar a decodificação antes de comparar prompts: com amostragem
ligada, duas execuções do **mesmo** prompt diferem, e você não sabe se a mudança que testou fez
algo.

**3. O chunk único.** Em `08-Generation/02-OptimizingResponseViaPrompts/01-UsePromptTemplateToClarifyGenerationGoal.py`,
imprima `len(texts)` depois da linha 15 e `len(retrieved_content)` depois da linha 24. Confirme com
os próprios olhos o que a aritmética previu: um chunk, e o conteúdo recuperado do tamanho do
arquivo.

**4. O prompt final.** Rode `02-UseFewShotsToProvideReferenceForResponse.py` e leia com atenção o
que a linha 78 imprime, antes de olhar a resposta. Esse é o artefato que você depura quando a
geração sai errada — não o código que o montou.

**5. Chaves extras no template.** Rode `04-SelectAppropriatePromptTemplateViaRouting.py` e registre
o que acontece com as quatro chaves de `template_vars` contra templates de duas. É a pergunta que
esta aula deixou aberta de propósito.

**6. O roteador exposto.** No mesmo arquivo, faça `get_prompt_template_by_question` devolver também
o `intent`, e imprima `intent == scenario` a cada iteração do laço. Agora o teste testa o roteador.
Guarde o resultado: a taxa de acerto do roteador é uma métrica, e métrica é o assunto da Aula 22.

---

## Quebre de propósito

**1. Remova a delimitação de fonte.** Em
`01-UsePromptTemplateToClarifyGenerationGoal.py`, apague as linhas 28–29 (`Based on the following
retrieved information:` e `{context}`) e deixe só a instrução de formato. O relatório continua
saindo, completo e bem estruturado — agora inteiramente da memória do modelo. É a demonstração mais
curta de que formato bonito não é evidência de fundamentação.

**2. Troque o contexto por outro personagem.** Mantenha o template e substitua
`retrieved_content` pelo texto de um personagem diferente do que a `query` da linha 22 pergunta.
Veja o modelo produzir um relatório coerente sobre a pessoa errada. Nenhuma instrução do template
autoriza dizer "o contexto não fala disso" — porque ela não existe.

**3. Acrescente a frase da Aula 03.** Agora adicione ao template: _"If the context doesn't contain
relevant information about the character, say so and stop."_ Repita o teste 2. A diferença entre as
duas execuções é a dívida que esta aula veio pagar.

**4. Quebre o casamento por string.** Em `02-UseFewShotsToProvideReferenceForResponse.py`, corte um
caractere de um dos `ex["context"]` **depois** de o índice ser construído. O `next(...)` da linha 51
levanta `StopIteration` — uma falha que não menciona exemplo, nem prompt, nem similaridade.

**5. Peça diversidade de verdade.** Em `03-IncreaseComprehensivenessAndDiversityOfResponse.py`,
acrescente `n=3` à chamada e rode. Compare o resultado com o que a versão original imprime, e
compare também com o que uma única resposta contendo três perspectivas oferece. Duas técnicas, dois
custos.

**6. Faça o roteador errar.** Em `04-SelectAppropriatePromptTemplateViaRouting.py`, mude a
`test_queries["technical_support"]` para algo deliberadamente ambíguo (por exemplo, "meu pedido
chegou com erro no sistema"). Compare o template impresso na linha 125 com o cenário do laço. Você
verá o roteador errar **sem que a saída pareça errada** — porque os casos recuperados continuam
vindo do cenário certo.

---

## Armadilhas de produção

**Prompt como desculpa para não medir.** Iterar prompt é agradável, rápido e viciante. Sem conjunto
de avaliação, cada iteração é uma impressão substituindo outra. Se você não sabe dizer se a versão
de ontem era melhor, você não está iterando.

**Amostragem ligada durante avaliação.** `do_sample=True` com `temperature` alto torna qualquer
comparação de prompts ruidosa. Fixe a decodificação para avaliar; escolha a temperatura para servir.

**O template que nunca diz "não sei".** Autorizar a abstenção é uma frase. Custo nomeado, porque
não é grátis: o modelo passa a se recusar em casos em que o contexto **serviria** — falso negativo
troca de lugar com falso positivo. Onde calibrar isso depende do dano relativo entre inventar e não
responder, e essa é decisão de produto, não de prompt.

**Few-shot cresce o prompt.** Cada exemplo ocupa contexto que poderia ser evidência, e paga token
em toda consulta. Selecionar o exemplo por similaridade (Parte 4) existe para manter um exemplo
relevante em vez de cinco genéricos — e adiciona uma busca ao caminho da consulta.

**Roteamento por LLM na frente de tudo.** Uma chamada extra por consulta, antes de qualquer
recuperação, com saída em texto livre. Se o rótulo vier fora do conjunto, decida se você quer
`ValueError` ou rota padrão. O repo escolheu explodir
(`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py:91`); em produção uma rota de fallback é
quase sempre preferível — julgamento.

**Nome de variável não é contrato.** `retrieved_content` recebendo string literal
(`08-Generation/02-OptimizingResponseViaPrompts/03-IncreaseComprehensivenessAndDiversityOfResponse.py:34`) é inofensivo num exemplo de 53
linhas e caro num sistema em que alguém confia no nome para saber de onde o dado veio.

**Documentação que descreve a intenção.** O `.env.example:2` deste módulo afirma que todos os
scripts chamam `load_dotenv()`; três dos quatro não chamam. Verifique o comportamento, não o
comentário — inclusive nos seus próprios repositórios.

**Fine-tuning como solução para lacuna de fato.** O único fine-tuning do repositório ensina formato
de resposta com contexto, não conteúdo. Se o problema é que o modelo não conhece o seu documento,
treinar é o caminho caro para um resultado que vaza; recuperar é o caminho direto. A recíproca
também vale: se o problema é que o modelo não obedece ao formato, mais contexto não resolve.

---

## Checkpoint

Responda sem consultar:

1. Por que prompt é o último estágio na ordem de diagnóstico, e qual erro de método você comete se
   mexer nele primeiro?
2. Quais são os quatro trabalhos de um prompt de RAG? Qual deles falta no template de
   `01-UsePromptTemplateToClarifyGenerationGoal.py`?
3. Que restrição elimina mais candidatos de uma vez na escolha de modelo, e por quê?
4. O que o subdiretório `01-ModelSelectionAndInvocation` **não** faz, apesar do nome?
5. Por que tokenizar o prompt cru para um modelo de instrução tende a piorar a saída — e o que
   `apply_chat_template` resolveria?
6. Por que a resposta impressa por `01-UsingQwen3.py` contém a pergunta?
7. O fine-tuning de `02-FineTuningQwen3.py` ensina fato ou comportamento? Justifique pela linha que
   formata o exemplo de treino.
8. Que conta prova que a recuperação de `01-UsePromptTemplateToClarifyGenerationGoal.py` devolve o
   documento inteiro?
9. Em `02-UseFewShotsToProvideReferenceForResponse.py`, o que está indexado no FAISS — e por que
   isso é uma inversão em relação às aulas anteriores?
10. Por que o laço "Candidate Analysis" de
    `03-IncreaseComprehensivenessAndDiversityOfResponse.py` imprime um único candidato?
11. Compare o roteamento da Aula 14 com o deste módulo em mecanismo, custo por consulta e modo de
    falha.
12. Por que o laço de teste de `04-SelectAppropriatePromptTemplateViaRouting.py` não testa o
    roteador, e o que muda disso em produção?

---

## Vocabulário

`prompt template` · `few-shot` · `abstention` (abstenção) · `chat template` · `full fine-tuning` ·
`instruction tuning` · `sampling` · `temperature` · `top-p` · `greedy decoding` · `prompt routing` ·
`grounding`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 18 — Compressão de contexto e correção reflexiva (CRAG)](AULA-18-compressao-crag.md)
**Próxima:** [AULA 20 — Saída estruturada: output parsers, Pydantic e function calling](AULA-20-saida-estruturada.md)

> A Fase 7 começou pelo prompt em texto livre. A Aula 20 muda o requisito: quando a saída é lida por
> programa, "peça o formato no prompt" deixa de bastar — e o módulo
> `08-Generation/03-ControllingFormatViaOutputParsing/` traz o par `04-Pydantic-v1.py` /
> `04-Pydantic-v2.py`, que o curso já sabe não ser o que o nome sugere.
