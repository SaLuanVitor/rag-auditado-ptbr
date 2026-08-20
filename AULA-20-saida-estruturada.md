# AULA 20 — Saída estruturada: output parsers, Pydantic e function calling

**Fase 7 — Geração** · Módulo do repo: `08-Generation/03-ControllingFormatViaOutputParsing/` (7 arquivos `.py`)

---

## Pergunta motivadora

A Aula 19 terminou com um template que pede um relatório em seções. Funciona porque quem lê é
humano: se o modelo trocar a ordem, incluir um parágrafo extra ou escrever "Nome do Personagem" em
vez de "Character Name", a pessoa entende.

Troque o leitor por um programa e nada disso passa. `json.loads` não perdoa uma vírgula sobrando,
`resposta["campo"]` estoura se o campo veio com outro nome, e uma frase educada antes do JSON —
_"Aqui está o resultado:"_ — quebra tudo.

A pergunta desta aula é onde colocar a garantia de formato:

1. No **prompt** — pedir educadamente.
2. Na **validação** — aceitar o texto e conferir depois.
3. Na **API do provedor** — obrigar o formato na chamada.
4. No **schema como contrato** — declarar a estrutura e deixar a plataforma cobrá-la.

Os sete arquivos deste módulo dão exemplo de cada uma. E a lição que considero mais importante não é qual escolher
— é que **nenhuma delas garante que o conteúdo esteja certo**. Duas delas, como veremos, chegam a
forçar o modelo a inventar.

---

## Modelo mental

### Quatro graus de garantia, e onde cada um falha

| Grau | Mecanismo            | O que garante                | O que não garante                | No módulo                                               |
| ---- | -------------------- | ---------------------------- | -------------------------------- | ------------------------------------------------------- |
| 1    | pedir no prompt      | nada                         | nada                             | `01`, e 4 dos 5 blocos de `02`                          |
| 2    | validar depois       | que você **detecte** o erro  | que ele não aconteça             | `01` (`parser.parse`); `04-Pydantic-v1.py` só em espírito¹ |
| 3    | obrigar na API       | JSON sintaticamente válido   | campos, tipos, semântica         | `03-JSON-Output.py:34`                                  |
| 4    | schema como contrato | estrutura e tipos dos campos | que os valores sejam verdadeiros | `02:36`, `04-Pydantic-v2.py:23`, `05-v1:19`, `05-v2:12` |

¹ **Em espírito, não em fato:** o grau 2 pressupõe saída de LLM sendo conferida, e o
`04-Pydantic-v1.py` não chama LLM nenhum (Parte 3) — valida um dicionário fixo. Ele demonstra o
_mecanismo_ de validação posterior sem que haja geração alguma antes. Fica na tabela porque é onde
se aprende o mecanismo, não porque seja um caso de grau 2.

> ⚠️ **O grau 4 tem dois degraus, e o repositório só mostra o de baixo.**
> **4a — schema validado depois:** function calling e `OpenAIPydanticProgram` **induzem** fortemente
> a estrutura, e o Pydantic **valida** o que voltou. Se o modelo desobedecer, você recebe uma
> exceção de validação — erro em vez de silêncio, que já é muito melhor que o grau 3, mas não é
> garantia.
> **4b — schema imposto na decodificação:** `response_format={"type": "json_schema", …,
"strict": true}` restringe a geração ao schema, e violação de estrutura deixa de ser possível.
> Custo: o schema fica limitado ao subconjunto que o provedor suporta, e a latência do primeiro
> token aumenta. Nenhum arquivo deste módulo usa 4b — `grep` por `json_schema` no repositório não
> encontra nada, e nenhuma das **três** ocorrências de `strict` tem relação com decodificação
> restrita (`02-DocChunking/05-LlamaIndex-SemanticChunking.py:47` e
> `Self-RAG-FullImplementation.py:54`). Ao ler a tabela acima, leia o grau 4 como **4a**.

A coluna que importa é a terceira. Subir de grau reduz uma classe de falha e deixa a próxima
intacta:

- do 1 para o 2 você passa a **saber** que falhou;
- do 2 para o 3 você deixa de receber texto que não é JSON;
- do 3 para o 4 você deixa de receber JSON com campos errados;
- e depois do 4 **ainda** pode receber um objeto perfeito com valores inventados.

O grau 4 é o teto do que a plataforma resolve. Verdade do conteúdo é assunto de recuperação
(Fases 1 a 6) e de avaliação (Aula 22) — não de parser.

### Validar não é instruir

Um `output parser` faz duas coisas independentes, e é fácil usar só metade:

1. **Instruir** — produzir a descrição do formato para colar no prompt.
2. **Parsear** — converter e validar o texto que voltou.

Se você só parseia, o modelo nunca soube o que você esperava, e o parser vira detector de erro em
vez de prevenção. É exatamente o que o primeiro arquivo do módulo faz — e o repositório inteiro,
como veremos, nunca usa a metade que instrui.

### Function calling é output parsing por outro nome

O uso original é ferramenta: o modelo pede que você execute algo. Mas o mecanismo é uma
**estrutura declarada que a plataforma cobra do modelo** — e usá-lo apenas para extrair um objeto,
sem função nenhuma para executar, é prática corrente. É a razão de function calling estar num
capítulo chamado _output parsing_, e não num capítulo de agentes.

---

## Parte 1 — O parser que valida mas não instrui

`08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py` tem 18 linhas e
é o exemplo mais curto do módulo.

O formato é pedido em prosa
(`08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py:11-12`):

```python
parser = JsonOutputParser()
prompt = PromptTemplate.from_template("Please return user information in JSON format: {query}")
```

E é conferido depois
(`08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py:17`):

```python
parsed_output = parser.parse(output.content)
```

Repare no que **não** acontece entre as duas linhas: o `parser` nunca é consultado sobre o formato
que ele espera. `JsonOutputParser` tem um método que gera essa instrução, e
`get_format_instructions` **não aparece em nenhum `.py` do repositório** — `grep -rn` sobre todos os
arquivos `.py` não retorna nada. Todo o repositório usa parser como grau 2, nunca como grau 1+2.

Consequência prática: a única coisa que diz ao modelo o que fazer é a frase `"in JSON format"` da
linha 12. Se ele responder com JSON embrulhado em ` ```json `, ou precedido de uma frase, o
`parse` da linha 17 é que descobre — em tempo de execução, com exceção. Julgamento: para um exemplo
de 18 linhas isso é aceitável; num serviço, gerar a instrução a partir do próprio parser evita que
prompt e validador divirjam quando um dos dois mudar.

Duas anotações de API:

**A chamada usa o modelo como função**
(`08-Generation/03-ControllingFormatViaOutputParsing/01-LangChain-OutputParsing.py:15`):

```python
output = llm(prompt.format(query="User ID 123"))
```

`llm(...)` é a forma antiga; a interface atual do LangChain é `.invoke(...)` — e é o que os outros
arquivos do repo usam, incluindo `05-function-calling-v1-LangChain.py:22`. Conhecimento de domínio,
não afirmação sobre execução: em versões recentes essa chamada emite aviso de depreciação, e em
alguma versão futura deixa de funcionar. `langchain` **não está instalado neste ambiente**, então
não vou afirmar o que ela imprime hoje.

**`PromptTemplate.from_template` com `{query}`** (linha 12) é o formato do LangChain. Guarde o
contraste: o LlamaIndex, na Parte 5, usa `{query_str}`.

---

## Parte 2 — Grau 3: obrigar o JSON na chamada

`08-Generation/03-ControllingFormatViaOutputParsing/03-JSON-Output.py` tem 39 linhas e muda o lugar
da garantia (`08-Generation/03-ControllingFormatViaOutputParsing/03-JSON-Output.py:34-36`):

```python
    response_format={
        'type': 'json_object'
    }
```

Com isso, a saída é JSON válido por construção — a garantia vem do provedor, não da boa vontade do
modelo. E o consumo pode ser direto, sem tentativa de resgate
(`08-Generation/03-ControllingFormatViaOutputParsing/03-JSON-Output.py:39`):

```python
print(json.loads(response.choices[0].message.content))
```

O que o exemplo faz **além** do parâmetro, e que é a parte instrutiva: o system prompt traz um
exemplo de entrada e um exemplo de saída
(`08-Generation/03-ControllingFormatViaOutputParsing/03-JSON-Output.py:16-23`):

```python
EXAMPLE INPUT:
Which is the highest mountain in the world? Mount Everest.

EXAMPLE JSON OUTPUT:
{
    "question": "Which is the highest mountain in the world?",
    "answer": "Mount Everest"
}
```

Isso é few-shot da Aula 19 aplicado a **esquema**: o modo JSON garante que virá um objeto, mas não
diz **quais chaves** ele deve ter. As chaves `question` e `answer` vêm do exemplo. É a combinação
que funciona — grau 3 para a sintaxe, few-shot para o vocabulário.

Custo nomeado: o modo JSON de provedores costuma exigir que o prompt mencione JSON explicitamente, e
não impede um objeto sintaticamente válido com as chaves erradas. O grau 3 elimina o erro de parse,
não o erro de contrato.

A troca de provedor por `base_url` reaparece
(`08-Generation/03-ControllingFormatViaOutputParsing/03-JSON-Output.py:8-11`):

```python
client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com",
)
```

---

## Parte 3 — O par `04-Pydantic` que não é um par

⚠️ Este é o ponto do módulo em que a regra 7 do protocolo de citação existe. Os nomes
`04-Pydantic-v1.py` e `04-Pydantic-v2.py` sugerem duas versões do mesmo exemplo, uma para cada
versão da biblioteca. O `diff` diz outra coisa: **os dois arquivos compartilham exatamente as duas
primeiras linhas** — os imports de `pydantic` e de `typing`. Nada mais. São exemplos distintos, com
modelos distintos, resolvendo problemas distintos.

**`04-Pydantic-v1.py` (42 linhas) não chama LLM nenhum.** É Pydantic puro: um modelo com validação
declarativa (`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v1.py:8-10`):

```python
    username: str = Field(min_length=3, max_length=20)
    email: str = Field(pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
    age: Optional[int] = Field(gt=0, lt=120)
```

Um dicionário fixo é validado (`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v1.py:25`), e o resultado é serializado
(`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v1.py:35` e `:39`):

```python
    print(user.model_dump())
```

E aqui está o detalhe que dá nome ao achado: `model_dump()` e `model_dump_json()` são API do
**Pydantic v2**. Num arquivo chamado `-v1`. O sufixo é numeração de variante do capítulo — como o
`05-...-v1` e `-v2` da Parte 4 —, não versão de biblioteca. `pydantic` **não está instalado neste
ambiente** e eu não executei nada; a leitura é do nome do método, que é literal no arquivo.

O valor pedagógico do arquivo é real e independe do nome: ele mostra que `min_length`, `pattern` e
`gt`/`lt` são **restrições que o schema carrega**. Quando esse mesmo modelo virar contrato de saída
de um LLM, essas restrições passam a ser cobradas da geração — e é por isso que valer a pena
declarar um campo `str` com `pattern` em vez de um `str` solto.

**`04-Pydantic-v2.py` (66 linhas) é o grau 4 completo.** O schema é aninhado — uma lista de
`CodeIssue` dentro de `CodeAnalysis`
(`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:17`):

```python
    issues: List[CodeIssue] = Field(default_factory=list, description="List of issues found")
```

E o schema vira o contrato da chamada
(`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:22-23`):

```python
program = OpenAIPydanticProgram.from_defaults(
    output_cls=CodeAnalysis,
```

Três leituras:

**As `description` de cada campo são prompt.** Em
`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:8-11` cada `Field` traz uma descrição — inclusive o domínio esperado
(`"Severity of the issue: high/medium/low"`). Essas descrições viajam para o modelo junto com o
schema. Escrever `description` é engenharia de prompt disfarçada de tipagem, e é o lugar certo para
colocá-la: fica ao lado do campo que ela governa.

**`overall_quality` é `str`, não enumeração.** A linha
`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:18` enumera `excellent/good/fair/poor` **na descrição**, não no tipo. O
schema aceita qualquer string. Julgamento: com `Literal["excellent","good","fair","poor"]` ou um
`Enum`, a restrição sairia da prosa e entraria no contrato — e a validação passaria a rejeitar
"pretty good". Custo: menos tolerância a variação legítima, e uma exceção a tratar onde antes havia
uma string estranha.

**`Optional` é importado e não usado** (`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:2`; `grep -n "Optional"` no arquivo
retorna só essa linha). Import não é uso — o mesmo alerta que a Aula 19 registrou, ali com três
símbolos de uma vez.

---

## Parte 4 — O par `05-function-calling`: mesma tarefa, mesmo provedor, camadas diferentes

⚠️ Segunda aplicação da regra 7, e o resultado é mais surpreendente que o do par anterior. Os nomes
são `05-function-calling-v1-LangChain.py` e `05-function-calling-v2-DeepSeek.py`. A leitura natural
— "um usa LangChain, o outro usa DeepSeek" — sugere provedores diferentes. Os arquivos dizem que
**ambos falam com a DeepSeek**:

- `08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v1-LangChain.py:16` usa
  `ChatDeepSeek(model="deepseek-chat", api_key=os.getenv("DEEPSEEK_API_KEY"))`;
- `08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v2-DeepSeek.py:16-19` usa
  o cliente `OpenAI` com `base_url="https://api.deepseek.com"` e a **mesma** variável de ambiente.

O que difere é a **camada de abstração**: framework contra cliente HTTP direto. O sufixo `-DeepSeek`
nomeia o provedor que os dois usam.

### A mesma ferramenta, declarada de duas formas

Via classe Pydantic (`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v1-LangChain.py:10-13` e `:19`):

```python
class get_weather(BaseModel):
    """Get weather information"""
    location: str = Field(..., description="City name")
    temperature: float = Field(..., description="Temperature")
```

```python
llm_with_tools = llm.bind_tools([get_weather])
```

Via JSON Schema escrito à mão (`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v2-DeepSeek.py:27-36`):

```python
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    }
                },
                "required": ["location"]
            },
```

O segundo é o que viaja no protocolo; o primeiro é gerado a partir da classe. Ver os dois lado a
lado é, **julgamento**, a forma mais direta de entender que `bind_tools` não é mágica — é um serializador de schema.

Preserve a leitura literal da descrição da ferramenta
(`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v2-DeepSeek.py:26`), com os erros de digitação do repositório:

```python
            "description": "Get weather of an location, the user shoud supply a location first",
```

"an location" e "shoud" estão no arquivo. Aponto porque essa descrição **vai para o modelo** — é
prompt, e prompt com erro de digitação é prompt.

### A diferença que muda o que o exemplo ensina

`v1` **para na intenção** (`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v1-LangChain.py:25-30`):

```python
if response.tool_calls:
    for tool_call in response.tool_calls:
        print(f"Tool Name: {tool_call['name']}")
        print(f"Arguments: {tool_call['args']}")
else:
    print("No tool calls")
```

Imprime o pedido do modelo e termina. Nenhuma função é executada, nada volta para o modelo. Isso é
suficiente quando o objetivo é **extração estruturada** — você queria o objeto, e o objeto está em
`tool_call['args']`.

`v2` **fecha o ciclo** (`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v2-DeepSeek.py:49-53`):

```python
tool = message.tool_calls[0]
messages.append(message)

messages.append({"role": "tool", "tool_call_id": tool.id, "content": "24℃"})
message = send_messages(messages)
```

Três elementos que só aparecem aqui, e que são o protocolo de _tool use_ inteiro: a mensagem do
assistente é **reanexada** ao histórico (linha 50), o resultado vem com `role: "tool"` amarrado pelo
`tool_call_id` (linha 52), e há uma **segunda chamada** ao modelo para transformar o dado em resposta
(linha 53). Sem o `tool_call_id`, o modelo não sabe a qual pedido aquele resultado responde.

Duas ressalvas, uma de cada arquivo:

- **`v2` não executa função nenhuma tampouco.** O resultado é a string literal `"24℃"` (linha 52).
  O ciclo é demonstrado, a integração não. Honesto para um exemplo; registre antes de copiar.
- **`v2` assume que houve tool call.** A linha 47 indexa `message.tool_calls[0]` sem verificar. Se o
  modelo responder em texto — o que acontece quando a pergunta não pede ferramenta —, essa linha
  falha. O `v1` verifica (linha 25). Em produção, a verificação do `v1` com o ciclo do `v2` é a
  combinação que você quer.

---

## Parte 5 — O único arquivo do módulo com RAG, e cinco modos de sintetizar

`08-Generation/03-ControllingFormatViaOutputParsing/02-LlamaIndex-OutputParsing.py` tem 88 linhas e
é o **único dos sete** que recupera algo: os outros seis operam sobre dados fixos no próprio arquivo.
Ele carrega e indexa
(`08-Generation/03-ControllingFormatViaOutputParsing/02-LlamaIndex-OutputParsing.py:19-20`):

```python
documents = SimpleDirectoryReader(input_files=["../../99-EN/black-myth-wukong/black_myth_wukong_wiki.txt"], encoding="utf-8").load_data()
index = VectorStoreIndex.from_documents(documents)
```

Note o corpus: `black_myth_wukong_wiki.txt`, e não o `black_myth_wukong_setting.txt` que a Aula 19 usou. `wc -c`
devolve **4.462 bytes** — **5,7 vezes** o corpus de 779 bytes que a Aula 19 usou, e ainda assim
pequeno. Guarde o número para a ressalva do fim desta parte.

O conteúdo novo do arquivo são os cinco `ResponseMode`, um por bloco:

| Bloco | Modo                 | Linha | O que a chamada traz de diferente                                  |
| ----- | -------------------- | ----- | ------------------------------------------------------------------ |
| 1     | `COMPACT`            | `:25` | só o modo                                                          |
| 2     | `REFINE`             | `:35` | **`output_cls=GameInfo`** (`:36`)                                  |
| 3     | `TREE_SUMMARIZE`     | `:53` | `summary_template=table_prompt` (`:54`)                            |
| 4     | `COMPACT_ACCUMULATE` | `:67` | `text_qa_template=bullet_prompt` (`:68`), `use_async=True` (`:70`) |
| 5     | `SIMPLE_SUMMARIZE`   | `:82` | `text_qa_template=story_prompt` (`:83`)                            |

O que os modos decidem (conhecimento de domínio do LlamaIndex, não leitura deste arquivo): como
juntar N chunks recuperados numa resposta. `SIMPLE_SUMMARIZE` concatena e faz uma chamada;
`COMPACT` empacota o máximo de texto por chamada para gastar menos; `REFINE` percorre chunk a chunk
levando a resposta parcial adiante; `TREE_SUMMARIZE` resume em árvore, agregando resumos de resumos;
`ACCUMULATE` responde por chunk e junta as respostas. É uma decisão de custo por consulta e de como
a informação se perde: refinar propaga o que já foi dito, acumular preserva a origem de cada
resposta, comprimir economiza chamadas.

### O que este arquivo revela sobre o nome do diretório

O diretório se chama `03-ControllingFormatViaOutputParsing`. Neste arquivo, **um** dos cinco blocos
usa parsing de fato — o bloco 2, com `output_cls=GameInfo` na linha 36, o único lugar do arquivo
onde o schema `GameInfo` (linhas 9–16) é usado. Os outros quatro controlam formato por **instrução
de prompt**: tabela (`:50`), lista numerada (`:64`), linha de tempo (`:79`).

Ou seja: quatro dos cinco blocos são grau 1 num capítulo sobre grau 4. Não é erro — é o material
que permite comparar os dois no mesmo arquivo. Rode o bloco 3 e o bloco 2 e olhe qual dos dois
resultados você conseguiria consumir por programa sem escrever um parser à mão.

### Dois cuidados de leitura

**Os slots de template têm nomes diferentes por modo.** Em
`08-Generation/03-ControllingFormatViaOutputParsing/02-LlamaIndex-OutputParsing.py`, o bloco 3
passa `summary_template` (`:54`); os blocos 4 e 5 passam `text_qa_template` (`:68`, `:83`). São
parâmetros distintos, e qual
deles cada modo consome é decisão da biblioteca. `llama_index` **não está instalado neste ambiente**
— não verifiquei o que acontece ao passar o slot que o modo não usa. Julgamento, e é o tipo de erro
que não avisa: se o template cair num slot que aquele modo ignora, você vê a saída sem formatação e
conclui que "o modelo não obedeceu".

**O corpus é pequeno para o que os modos se propõem.** Com 4.462 bytes, o número de chunks é baixo,
e `REFINE`, `TREE_SUMMARIZE` e `ACCUMULATE` só se diferenciam quando há **muitos** chunks para
combinar — é justamente aí que refinar, resumir em árvore ou acumular divergem. Com um punhado de
chunks, os cinco blocos tendem a produzir resultados parecidos, e a diferença que o arquivo quer
demonstrar não aparece. É o mesmo padrão que a Aula 19 encontrou no corpus de 779 bytes: o exemplo
está correto e o dado não o exercita.

Por fim, a variável do template do LlamaIndex é `{query_str}` (`:50`, `:64`, `:79`), não `{query}`
como no LangChain da Parte 1. Trocar uma pela outra produz um template que nunca é preenchido.

---

## Parte 6 — Quando o schema obriga o modelo a inventar

Esta é a parte que fecha a aula, e ela atravessa dois arquivos.

**Caso 1.** Em `04-Pydantic-v2.py`, o campo `file_name` é obrigatório
(`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:16`):

```python
    file_name: str = Field(..., description="Name of the file being analyzed")
```

O `...` do `Field` é o marcador de obrigatório do Pydantic. Agora olhe o que é enviado ao modelo: o
`prompt_template_str` (`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:24-32`) tem uma única variável, `{code}`, e a chamada
passa apenas o código (`08-Generation/03-ControllingFormatViaOutputParsing/04-Pydantic-v2.py:50`):

```python
    analysis = program(code=sample_code)
```

Nenhum nome de arquivo entra. Mas o contrato exige um. O modelo não tem a opção de omitir — o
schema não permite — então ele **preenche com algo plausível**. Um objeto perfeitamente válido, com
um campo inteiramente fabricado.

**Caso 2.** Em `05-function-calling-v1-LangChain.py`, a ferramenta declara dois parâmetros
obrigatórios (`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v1-LangChain.py:12-13`):

```python
    location: str = Field(..., description="City name")
    temperature: float = Field(..., description="Temperature")
```

`temperature` é o que uma função de clima **devolve**, não o que quem pergunta informa. Declarada
como parâmetro obrigatório, ela força o modelo a chegar com um número de temperatura para poder
pedir a temperatura. Compare com a versão em JSON Schema do outro arquivo
(`08-Generation/03-ControllingFormatViaOutputParsing/05-function-calling-v2-DeepSeek.py:35`), que exige apenas `location`:

```python
                "required": ["location"]
            },
```

A generalização, e é a lição desta aula: **o schema é um contrato de forma, e o modelo cumpre
contratos de forma mesmo quando não tem o dado.** Um campo obrigatório sem fonte no contexto não
produz erro — produz invenção com tipo correto. É a alucinação da Aula 19 vestida de objeto
validado, e mais difícil de notar justamente porque passou pela validação.

Duas mitigações, com o custo de cada uma:

- **Campo opcional com valor nulo permitido** — o modelo pode declarar ausência em vez de inventar.
  Custo: você passa a tratar `None` em todo consumidor, e a ausência pode ser preguiça em vez de
  falta real de dado.
- **Fornecer o dado em vez de exigi-lo** — `file_name` não deveria vir do modelo; deveria ser
  preenchido pelo código que sabe qual arquivo abriu. Custo: nenhum, neste caso. Boa parte dos
  campos inventados são campos que o chamador já conhecia.

E a ligação com a Aula 19: autorizar a abstenção em prosa (_"se o contexto não responde, diga
isso"_) não tem efeito sobre um campo que o schema marca como obrigatório. As duas garantias operam
em camadas diferentes, e a do schema é, **julgamento**, a mais forte das duas.

---

## Mão na massa

Este módulo precisa de chave: `DEEPSEEK_API_KEY` para os arquivos 01, 03 e os dois `05`;
`OPENAI_API_KEY` — o `08-Generation/03-ControllingFormatViaOutputParsing/.env.example:8-9` diz
apenas "used by some of the function-calling/output-parsing examples in this folder", sem nomear
quais. O `04-v2` precisa dela de forma verificável (importa `OpenAIPydanticProgram`, linha 3). Para
o `02`, é inferência de conhecimento de domínio — o LlamaIndex usa OpenAI para embeddings por
default —, não leitura do arquivo, e não a verifiquei por execução.
O `04-Pydantic-v1.py` roda sem chave nenhuma — comece por ele.

**1. Restrições de schema, sem LLM.** Rode `04-Pydantic-v1.py`. Depois viole cada restrição da
linha 8 à 10, uma por vez: `username` com dois caracteres, `email` sem arroba, `age` igual a 200.
Leia a mensagem de erro de cada uma. Essas mensagens são o que uma plataforma de saída estruturada
tem em mãos para cobrar o formato do modelo.

**2. O grau 3 isolado.** Em `03-JSON-Output.py`, remova o `response_format` das linhas 34–36 e rode
algumas vezes. Depois devolva o parâmetro. Você está medindo o que o grau 3 compra.

**3. O grau 3 sem o few-shot.** Ainda no `03`, mantenha o `response_format` e apague o bloco de
exemplo do system prompt (linhas 16–23). A saída continua sendo JSON válido — e as chaves podem
deixar de ser `question` e `answer`. É a demonstração de que grau 3 garante sintaxe, não contrato.

**4. Parser como prevenção, não como detector.** Em `01-LangChain-OutputParsing.py`, imprima
`parser.get_format_instructions()` e cole o resultado no template da linha 12. Compare a taxa de
sucesso do `parse` antes e depois, em algumas execuções. Você acabou de usar a metade do parser que
o repositório inteiro nunca usa.

**5. O campo inventado.** Rode `04-Pydantic-v2.py` e olhe o valor de `file_name`. Nenhum nome de
arquivo foi passado (linha 50). Depois torne o campo opcional e rode de novo. Guarde os dois
resultados: é a diferença entre um schema que aceita ausência e um que exige invenção.

**6. O parâmetro que não devia existir.** Em `05-function-calling-v1-LangChain.py`, rode como está
e leia os `Arguments` impressos na linha 28 — em especial o valor de `temperature`. Depois remova a
linha 13 e rode outra vez.

**7. O ciclo completo.** Em `05-function-calling-v2-DeepSeek.py`, troque o `"24℃"` da linha 52 por
um valor absurdo (`"-90℃"`) e leia a resposta final da linha 54. O modelo relata o que a ferramenta
disse. Essa é a lição de confiança: o resultado da ferramenta entra no contexto como fato, sem
crítica — o mesmo problema do contexto recuperado, num canal diferente.

**8. Os cinco modos.** Em `02-LlamaIndex-OutputParsing.py`, rode os cinco blocos e compare as
saídas. Verifique a ressalva da Parte 5: com 4.462 bytes de corpus, quanto os modos realmente
divergem? Depois aponte o `input_files` da linha 19 para um documento grande e repita.

---

## Quebre de propósito

**1. Peça JSON e não valide.** Em `01-LangChain-OutputParsing.py`, troque a linha 17 por
`print(output.content)` e rode algumas vezes. Observe se aparece cerca de código, texto antes do
objeto, ou vírgula final. Cada uma dessas variações é uma exceção que o grau 2 pegaria e o grau 1
não.

**2. Valide contra o schema errado.** Ainda no `01`, peça no prompt uma lista (`"in JSON array
format"`) e mantenha o `JsonOutputParser`. O parse pode até passar — e o consumidor que espera um
objeto quebra depois, longe daqui. Validar sintaxe não é validar contrato.

**3. Enfraqueça o contrato.** Em `04-Pydantic-v2.py`, troque `List[CodeIssue]` (linha 17) por
`List[str]`. Rode. Você perdeu `line_number`, `issue_type` e `severity` — a saída continua válida e
deixou de ser processável por linha. Estrutura aninhada é o que separa "um texto sobre problemas" de
"uma lista de problemas".

**4. Tire o `tool_call_id`.** Em `05-function-calling-v2-DeepSeek.py`, remova a chave
`tool_call_id` da mensagem da linha 52 e rode. É a amarra entre o pedido e o resultado; sem ela o
protocolo não fecha.

**5. Faça o modelo não chamar a ferramenta.** No mesmo arquivo, troque a pergunta da linha 41 por
algo que não peça clima ("Quem escreveu Dom Casmurro?"). A linha 47 indexa `tool_calls[0]` sem
verificar — veja a falha, e note que ela não menciona ferramenta nem schema.

**6. Passe o template no slot errado.** Em `02-LlamaIndex-OutputParsing.py`, troque o
`summary_template` da linha 54 por `text_qa_template` mantendo `TREE_SUMMARIZE`. Registre o que
acontece: a saída sai formatada, ou o template é ignorado sem aviso? Esta é a pergunta que a Parte 5
deixou aberta por não ter a biblioteca instalada.

**7. Troque `{query_str}` por `{query}`.** No mesmo arquivo, em qualquer um dos três templates. É o
erro que se comete ao copiar prompt de exemplo do LangChain para o LlamaIndex.

---

## Armadilhas de produção

**JSON válido não é dado correto.** O grau 4 entrega um objeto que casa com o schema. Se o contexto
recuperado estava errado, você agora tem um erro **estruturado** — mais fácil de consumir e mais
difícil de perceber, porque parece confiável. Nada nesta aula substitui a Fase 2 do diagnóstico.

**Campo obrigatório sem fonte é invenção contratada.** A Parte 6 mostrou dois casos no próprio
repositório. Antes de marcar um campo como obrigatório, pergunte de onde o valor vem. Se a resposta
for "o modelo deduz", ele vai inventar.

**Prompt e validador que divergem.** Quando a instrução de formato é escrita à mão no template e o
schema vive noutro arquivo, os dois envelhecem em ritmos diferentes. Gerar a instrução a partir do
schema — o `get_format_instructions` que o repo nunca usa — mantém um só lugar da verdade. Custo: a
instrução gerada é verbosa e ocupa contexto.

**Enumeração escrita na descrição não é enumeração.** `overall_quality` como `str` com os valores
listados em prosa (`04-Pydantic-v2.py:18`) aceita qualquer coisa. `Literal` ou `Enum` movem a regra
para o contrato. Custo: exceções onde antes havia strings toleráveis, e menos folga para variação
legítima.

**Function calling sem verificar se houve chamada.** O caminho em que o modelo responde texto é
comum, não excepcional — e é uma linha de `if` (`05-function-calling-v1-LangChain.py:25`).

**Resultado de ferramenta entra no contexto como verdade.** O `"24℃"` da linha 52 do `v2` chega ao
modelo sem crítica, e o modelo o repassa. Se sua ferramenta pode falhar ou devolver dado velho, essa
informação precisa viajar junto — ou você criou um canal de alucinação com aparência de integração.

**A camada esconde o protocolo.** `bind_tools([get_weather])` é conveniente e é a mesma coisa que o
JSON Schema de 19 linhas do outro arquivo. Quando a chamada falhar com erro de schema, você vai
depurar no nível do JSON — vale saber que ele existe embaixo.

**Custo de chamadas dobradas.** O ciclo completo do `v2` são **duas** chamadas ao modelo por
pergunta (linhas 44 e 53). Somadas a roteamento por LLM (Aula 19), reranking (Aula 17) e ao grader do
CRAG (Aula 18), a conta de latência por consulta cresce rápido — e cada estágio precisa justificar o
seu lugar com medição.

---

## Checkpoint

Responda sem consultar:

1. Quais são os quatro graus de garantia de formato, e o que cada um deixa de garantir?
2. Que método do `JsonOutputParser` o repositório inteiro nunca usa, e o que se perde com isso?
3. Em `03-JSON-Output.py`, o que o `response_format` garante e o que vem do bloco de exemplo no
   system prompt?
4. Por que `04-Pydantic-v1.py` e `04-Pydantic-v2.py` **não** são duas versões do mesmo exemplo? Que
   comando responde isso sem chutar?
5. Que API do Pydantic v2 aparece no arquivo chamado `-v1`, e o que o sufixo significa de fato?
6. Os dois arquivos `05-function-calling-*` usam provedores diferentes? Justifique com as linhas.
7. Qual dos dois `05` demonstra o ciclo completo de _tool use_, e quais três elementos só existem
   nele?
8. Por que o `tool_call_id` é necessário?
9. Qual dos sete arquivos do módulo faz RAG, e como isso muda a leitura do capítulo?
10. Em `02-LlamaIndex-OutputParsing.py`, quantos dos cinco blocos usam schema? Como os outros
    controlam formato?
11. Por que `file_name` em `04-Pydantic-v2.py` é sempre inventado, e por que `temperature` em
    `05-function-calling-v1-LangChain.py` tem o mesmo defeito?
12. Por que a instrução de abstenção da Aula 19 não protege contra um campo obrigatório de schema?

---

## Vocabulário

`output parser` · `structured output` · `JSON mode` · `JSON Schema` · `Pydantic` · `function calling` ·
`tool use` · `tool_call_id` · `response synthesizer` · `ResponseMode` · `refine` · `tree summarize` ·
`prompt template`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 19 — Escolha de modelo e prompt engineering para RAG](AULA-19-modelo-e-prompt-engineering.md)
**Próxima:** [AULA 21 — Self-RAG e estratégias dinâmicas de geração](AULA-21-self-rag.md)

> As Aulas 19 e 20 trataram de como pedir e como cobrar. A Aula 21 inverte o sujeito: em
> `08-Generation/04-DynamicGenerationOptimizationStrategies/` o modelo critica o que recuperou e
> critica a própria resposta — e, **no paper**, decide se precisa recuperar; a implementação do
> repositório recupera sempre (`add_edge(START, "retrieve")` incondicional), como a Aula 21 mostra — e os dois papers dessa decisão (Self-RAG e
> RRR) estão no diretório, em PDF.
