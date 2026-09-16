# Respostas ao Exame v3, agente `rag-specialist` (Vetor)

**Data:** 15/09/2026. **Quem responde:** Vetor, o `@rag-specialist` definido em
`agente/rag-specialist.md`. **Quem corrige:** outro. Não há autonota neste arquivo.

## Ambiente usado, declarado

| Item | Valor | Como sei |
| --- | --- | --- |
| Clone pinado | `RAG-from-First-Principles` em `17c6942` | `git -C ... rev-parse HEAD` |
| Ponta do upstream | `17c6942`, igual | `git ls-remote <url> HEAD` |
| Ambiente do curso | `E:/tmp/rag-venv`, `langchain-core` 0.3.33, `pydantic` 2.13.4 | `python -c "import langchain_core; print(...)"` |
| Ambiente corrente | `E:/tmp/rag-venv-corrente`, `langchain-core` 1.6.3, `pydantic` 2.13.5 | idem |
| SO | Windows 11, shell Git Bash | ambiente da sessão |

**Ferramental obrigatório rodado nesta sessão, antes de entregar:**

```
node ferramentas/verify-citations.js --all   -> PASS, OK: 2193, 0 invalidas, exit 0
node ferramentas/entreaulas.js               -> PASS, OK: 1, SEM_PROVA: 4, exit 0
node ferramentas/vigia.js                    -> MUDOU, 8 itens, fonte NAO andou
node ferramentas/dod.js                      -> 9 decidiveis passam, a 10a pendente de leitura
```

**Contrato cumprido:** nada foi escrito nos dois repositórios. Nenhum `git fetch`, nenhum
`git pull`, nenhuma instalação de pacote. `gerar-fatos.js` não foi executado.

**O verificador rodado sobre ESTE arquivo, com o resultado declarado em vez de maquiado.** Como ele
é obrigatório antes de entregar `.md` com citação, rodei:

```
$ node ferramentas/verify-citations.js <caminho deste arquivo>
OK: 122   BAD_LINE: 0   MISPLACED: 4   NOT_FOUND: 2   FAIL
```

As **seis** não são citação inválida, e cada uma tem causa medida:

- **4 `MISPLACED`, todas `README.md:296` e `:342`.** O verificador indexa por *basename* e há dois
  `README.md` nas raízes que ele conhece. Ele resolve para o do clone, que tem 242 linhas, em vez
  do deste repositório, que tem 354 (`grep -c '' README.md`). **Testei três notações para
  desambiguar e nenhuma funciona:** `README.md`, `./README.md` e `rag-auditado-ptbr/README.md` caem
  no mesmo lugar, e `curso:README.md` sai como `UNKNOWN`. É colisão de basename entre as duas
  raízes, e não tem saída pela notação. As quatro citações são válidas contra
  `E:/Projetos/rag/rag-auditado-ptbr/README.md`, conferidas à mão por `sed -n '342p'`.
- **2 `NOT_FOUND`, os dois arquivos de `ragas`.** Estão dentro do `venv`
  (`E:/tmp/rag-venv/Lib/site-packages/ragas/`), fora dos dois repositórios por construção. Cito com
  caminho absoluto e com o comando `inspect.getsource(...)` que os reproduz, porque é a única forma
  de outro auditor conferir.

Declaro em vez de silenciar: o exit code não é zero, e a razão é limitação conhecida do instrumento
sobre um documento que mora fora do repositório, não citação fabricada.

---

## Q01 `F`

**As três versões pinadas, e onde:**

| Versão | Em quantos `requirements` | Arquivos |
| --- | --- | --- |
| `0.12.15` | 5 | `91-Environment/archive/requirements_llamaindex_20250305(Ubuntu-with-GPU).txt:50` · `91-Environment/requirements_langchain_20250413_Ubuntu-with-GPU.txt:61` · `91-Environment/requirements_llamaindex_20250413_Ubuntu-with-GPU.txt:81` · `91-Environment/requirements_llamaindex_NoGPU_Mac-Win.txt:50` · `91-Environment/requirements_llamaindex_Ubuntu-with-CPU.txt:52` |
| `0.12.23.post2` | 2 | `91-Environment/requirements_camelot_20250413.txt:70` · `91-Environment/requirements_marker_20250413.txt:71` |
| `0.12.25` | 1 | `91-Environment/requirements_llamaindex_SimpleRAG_AdditionalPackagesNeededForLaterModules.txt:35` |

**A pergunta diz "qual arquivo", no singular, e são oito.** Corrijo a premissa
menor em vez de escolher um para caber na frase. Os oito que declaram o pacote **sem** `==`
são os `requirements.txt` por módulo:

```
$ grep -rn "^llama-index-core$" --include="requirements*.txt" .
./00-SimpleRAG/requirements.txt:13       ./07-PostRetrieval/requirements.txt:18
./01-DataLoading/requirements.txt:13     ./08-Generation/requirements.txt:16
./02-DocChunking/requirements.txt:6      ./09-Evaluation/requirements.txt:4
./06-Indexing/requirements.txt:10        ./10-AdvanceRAG/requirements.txt:17
```

**A divisão tem sentido e vale nomeá-la:** os arquivos de `91-Environment/` são congelamentos de
ambiente inteiro, com versão em tudo; os de módulo são listas de dependência direta, sem versão.
Quem instala pelo módulo não reproduz o ambiente medido, instala a ponta do PyPI daquele dia.
Hoje isso é `0.14.24` (`node ferramentas/vigia.js`), dois minor acima do que o curso mediu.

**Julgamento:** a versão que importa para o curso é `0.12.15`, porque é a que os cinco
congelamentos de ambiente principal usam e a que cinco aulas citam. `0.12.23.post2` e `0.12.25`
vêm de ambientes acessórios (camelot, marker, pacotes extras do SimpleRAG).

---

## Q02 `A`

**A premissa é falsa, e o erro não está na medição: está na atribuição.**

A AULA-20 está **certa** e diz o contrário do que a pergunta conclui. Ela escreve, em
`AULA-20-saida-estruturada.md:247-249`:

> **Medido** no `pydantic` 2.13.4 do ambiente de medição deste curso: o arquivo roda inteiro,
> `model_dump()` e `model_dump_json()` incluídos. O repositório pina outra, `2.10.6`, nos doze
> `requirements` de `91-Environment/`

**O que o repositório pina, medido agora:**

```
$ grep -rn "pydantic" --include="requirements*.txt" . | grep "=="
... doze arquivos de 91-Environment/, todos pydantic==2.10.6
$ grep -rn "^pydantic$" --include="requirements*.txt" .
./05-PreRetrieval/requirements.txt:12  ./08-Generation/requirements.txt:10  ./10-AdvanceRAG/requirements.txt:11
```

Zero ocorrências de `2.13.4` no clone. **2.13.4 é a versão do INSTRUMENTO**, o `venv` de quem
mediu, e confirmei que é ela mesma: `E:/tmp/rag-venv/Scripts/python.exe -c "import pydantic;
print(pydantic.VERSION)"` devolve `2.13.4`.

O `vigia.js` classifica exatamente assim, sem eu dizer nada:

```
Versoes de INSTRUMENTO, nao vigiadas contra o PyPI:
   pydantic 2.13.4  (o clone pina 2.10.6)  AULA-20-saida-estruturada.md
```

**O que é verdade:** o repositório pina `pydantic==2.10.6`; a medição foi feita em `2.13.4`; e a
AULA-20 declara as duas, mais a razão de a diferença não invalidar o achado (`model_dump` existe
desde a 2.0). Esse é o formato correto. Inferir o pin a partir da versão medida é a confusão que
já custou um `−1` a esta auditoria, conforme o próprio `vigia.js` registra.

---

## Q03 `C`

**Pin da fonte** é um par `pacote==versão` que existe em algum `requirements` do clone. É uma
**afirmação sobre o repositório**, verificável por `grep` e estável enquanto o commit pinado não
mudar.

**Versão do instrumento** é a versão instalada no ambiente de quem executou a medição. É uma
**afirmação sobre o experimento**, verificável só por quem tem aquele ambiente, e ela não diz
nada sobre o repositório.

**Por que confundir produz falsidade mesmo com a medição certa.** São duas proposições
independentes:

1. "O arquivo se comporta assim quando executado": decidida pela execução.
2. "O repositório declara esta versão": decidida pelo `requirements`.

Medir bem estabelece (1) e não toca (2). Escrever "o repositório pina 2.13.4" afirma (2) usando a
evidência de (1), e (2) é falsa: o clone pina 2.10.6. A frase fica falsa com a medição intacta.

**O dano prático tem três faces:**

- **Autoridade emprestada.** O pin é auditável por qualquer leitor com o clone; o instrumento não
  é. Carimbar o instrumento de pin transfere ao número uma verificabilidade que ele não tem, e o
  leitor que for conferir por `grep` não acha nada e conclui que a aula inventou.
- **Vigilância errada.** Pin envelhece contra o **PyPI**: quando a ponta anda, a afirmação sobre a
  fonte continua verdadeira mas o leitor precisa saber que o mundo andou. Instrumento envelhece
  contra o **pin**: o que importa nele é bater, ou não bater, com o que o repositório declara.
  Vigiar instrumento contra o PyPI produz alarme permanente e sem conteúdo.
- **Reprodutibilidade ao contrário.** Quem monta o ambiente pelo pin e não reproduz o número não
  sabe se achou um defeito ou se está só em outra versão, porque a aula escondeu qual era qual.

**A forma correta**, e a AULA-20 a exibe, é declarar as duas lado a lado, mais a razão de a
diferença importar ou não importar para aquele achado.

---

## Q04 `F`

**Duas medições, duas versões, na mesma sonda.** Construí um `BaseChatModel` mínimo (subclasse com
`_generate` e `_llm_type`) e chamei `llm("oi")`.

**No ambiente do curso, `langchain-core` 0.3.33: FUNCIONA, com aviso.**

```
$ E:/tmp/rag-venv/Scripts/python.exe probe2.py
langchain_core 0.3.33
instancia e callable()? True
llm('oi') FUNCIONOU -> AIMessage(content='ok', ...)
   aviso: LangChainDeprecationWarning The method `BaseChatModel.__call__` was deprecated in
          langchain-core 0.1.7 and will be removed in 1.0. Use :meth:`~invoke` instead.
```

**Com o `langchain-core` corrente, 1.6.3: LEVANTA.**

```
$ E:/tmp/rag-venv-corrente/Scripts/python.exe probe2.py
langchain_core 1.6.3
instancia e callable()? False
llm('oi') LEVANTOU -> TypeError : 'Fake' object is not callable
```

`invoke("oi")` devolve o mesmo `AIMessage` nas duas, então o caminho corrente não mudou; o que
sumiu foi o atalho.

**Uma armadilha de método que vale registrar, porque eu quase caí nela.** A primeira sonda
perguntou `hasattr(BaseChatModel, "__call__")` e devolveu `True` **nas duas versões**. Isso é
falso positivo estrutural: `BaseChatModel` é uma classe, e toda classe é chamável via
`type.__call__`, que é o construtor. O discriminante correto é `"__call__" in
BaseChatModel.__dict__` (`True` em 0.3.33, `False` em 1.6.3) ou `callable(instancia)`. Perguntar
à classe responde sobre o construtor; a pergunta era sobre a instância.

**Consequência para o acervo:** as AULAS 20 e 26 citam a depreciação, e ela deixou de ser
depreciação e virou remoção. Os dois scripts do repositório que usam a forma antiga quebram com a
biblioteca corrente, nessas linhas. O `vigia.js` nomeia as aulas: `langchain-core 0.3.33 -> PyPI
em 1.6.3 ANDOU AULA-19 AULA-20 AULA-26`.

---

## Q05 `F`

**Assimétrico: chaves a mais são ignoradas em silêncio, chaves a menos levantam `KeyError`.**

```
$ python probe4.py   # identico nas duas versoes: 0.3.33 e 1.6.3
langchain_core 0.3.33
input_variables: ['contexto', 'pergunta']
-- MAIS chaves (contexto, pergunta, sobrando) --
   ACEITOU. saida = 'Contexto: C\nPergunta: P'
-- MENOS chaves (so contexto) --
   LEVANTOU KeyError : 'pergunta'
```

Vale igual para `format` e para `invoke`. Não é mudança de versão: medi nas duas e o
comportamento é o mesmo.

**O defeito do repositório para o qual isso importa:**
`08-Generation/02-OptimizingResponseViaPrompts/04-SelectAppropriatePromptTemplateViaRouting.py`.

Cada um dos três templates declara **duas** variáveis:

```
$ grep -n "{[a-z_]*}" 04-SelectAppropriatePromptTemplateViaRouting.py
13:    {similar_cases}          27:    {similar_cases}          41:    {similar_cases}
15:    ... {customer_feedback}  29:    ... {issue_description}  43:    ... {business_issue}
```

E o laço passa **quatro**, nas linhas 133-138, ao template escolhido na linha 141:

```python
    template_vars = {                      # :133
        "customer_feedback": query,        # :134
        "issue_description": query,        # :135
        "business_issue": query,           # :136
        "similar_cases": similar_cases     # :137
    }                                      # :138
    ...
    response = llm.invoke(prompt_template.format(**template_vars))   # :141
```

Em toda iteração, **duas das quatro chaves sobram** e são descartadas sem aviso. O arquivo só roda
porque `format` ignora o excedente. Se a política fosse a simétrica, as três iterações abortariam.

**Por que a assimetria é o que torna isso perigoso, e não apenas feio.** O código está protegido
exatamente na direção que esconde o problema de desenho e desprotegido na oposta. Consequências
concretas:

- O roteador pode escolher o template **errado** e o `format` continua passando, porque as chaves
  dos três estão todas no dicionário. A cobertura acidental apaga o sinal de erro de roteamento.
- Um erro de digitação no nome de um placeholder do template vira `KeyError` barulhento (bom); um
  erro de digitação no nome da chave passada vira silêncio (ruim). O modo de falhar mais fácil de
  cometer é o que não aparece.
- Transposto para RAG: uma cadeia que passa `context` a um template que não declara `{context}`
  gera resposta **sem contexto nenhum**, sem exceção, sem log, com aparência de RAG funcionando. É
  a falha de recuperação que o estágio 2 da minha ordem de diagnóstico existe para pegar, e ela
  não se vê olhando a resposta.

---

## Q06 `A`

**A conclusão está certa neste caso e o raciocínio é inválido.** Separar as duas é o ponto.

**Por que o raciocínio não vale.** Um aviso de depreciação é uma **promessa do mantenedor no
momento em que ele depreciou**, não uma medição do estado atual. Ele descreve intenção passada
sobre futuro, e intenção não é evidência. Prazo de remoção escorrega por rotina, porque remover
quebra usuários, e a decisão é retomada a cada release.

**E neste caso a própria biblioteca diz duas coisas diferentes sobre o mesmo método, na mesma
versão.** Medido em 0.3.33: o aviso de runtime diz "will be removed in 1.0"; a docstring do mesmo
`BaseChatModel.__call__` diz "It will not be removed until langchain-core==1.0". A segunda é um
**piso**, não uma data: ela promete que não sai antes da 1.0, e não promete que saiu na 1.0. Quem
lê a primeira e conclui "logo já não existe" está tratando como data o que a outra superfície da
mesma biblioteca declara como limite inferior.

**Como eu sei, então: medindo.** Num segundo ambiente com `langchain-core` 1.6.3, sem tocar no
pinado:

```
BaseChatModel.__call__:               0.3.33 DEFINIDO -> 1.6.3 AUSENTE
BaseChatModel.predict:                0.3.33 DEFINIDO -> 1.6.3 AUSENTE
BaseChatModel.predict_messages:       0.3.33 DEFINIDO -> 1.6.3 AUSENTE
BaseChatModel.call_as_llm:            0.3.33 DEFINIDO -> 1.6.3 AUSENTE
BaseLLM.__call__ / predict / predict_messages:        idem, AUSENTE
BaseRetriever.get_relevant_documents / aget_...:      idem, AUSENTE
BaseChatModel.generate_prompt / invoke:               DEFINIDO nas duas
```

O teste é `"nome" in Classe.__dict__`, não `hasattr`, pela razão da Q04.

**Uma honestidade que a resposta exige:** varri os decoradores `@deprecated` sobrevivos em 1.6.3 e
todos os 15 miram `removal="2.0.0"`. Ou seja, **não achei nesta biblioteca um contraexemplo de
prazo estourado**, e não vou inventar um para ornamentar o argumento. O argumento se sustenta sem
ele: a promessa não é do tipo certo de evidência, e o custo de medir aqui é um `venv` e um
`import`. Declarar limite quando abrir custa trivialmente seria evasão.

---

## Q07 `J`

**O que faço, em ordem:**

1. **Leio a passagem que carrega a afirmação** e vejo qual versão ela nomeia. A aula declara a
   versão junto do número, e é ela que decide se a afirmação ainda vale.
2. **Classifico a versão** com `node ferramentas/vigia.js`: PIN da fonte ou INSTRUMENTO. Muda o
   que a divergência significa (Q03).
3. **Monto um SEGUNDO ambiente**, separado, com a versão corrente, e mede-se lá.
4. **Escrevo a sonda mínima que separa as duas hipóteses**, e ela testa a **instância**, não a
   classe (Q04). Roda o mesmo arquivo de sonda nos dois ambientes, para que a única variável seja
   a versão.
5. **Registro as duas versões lado a lado** na aula, com o que cada uma devolveu e a data. Uma não
   substitui a outra.
6. **Reporto a quem paga a rodada** se a diferença obriga reauditar.

**O que eu NÃO faço, e por quê:**

- **Não atualizo a biblioteca no ambiente pinado.** É a decisão central. `pip install --upgrade`
  ali responde uma pergunta e **invalida todas as outras medições já feitas e todas as futuras**,
  porque o ambiente deixa de ser o ambiente do curso. E não é reversível por `pip install
  pacote==antiga`: as dependências transitivas re-resolvem e o que volta não é o que estava.
  Troco uma resposta por um instrumento.
- **Não dou `git fetch` nem `git pull` no clone.** Não é o mesmo objeto, mas é o mesmo contrato, e
  a pergunta não precisa disso.
- **Não repino nem proponho repinar** como parte desta medição. Repinar é reauditar, e reauditar é
  decisão de quem paga.
- **Não troco o número no texto da aula pelo novo.** Isso produz afirmação nova que ninguém
  verificou, na forma exata que este projeto chama de corrigir invenção inventando outro detalhe.
- **Não concluo por `hasattr` na classe**, nem por leitura do `CHANGELOG`, nem pelo texto do aviso
  de depreciação. Os três respondem outra pergunta (Q06).
- **Não declaro "não verifiquei" quando montar o segundo ambiente é barato.** Aqui era: dois
  comandos. Declarar limite no lugar de trabalho trivial é evasão disfarçada de rigor.

**Julgamento:** o custo assimétrico é o que decide. Um segundo ambiente custa disco e minutos; um
ambiente pinado corrompido custa toda a auditoria, e o pior é que ele não se anuncia, porque nada
em `git status` muda quando um `venv` muda.

---

## Q08 `C`

**As duas perguntas:**

| Pergunta | Evidência que responde | O que ela não alcança |
| --- | --- | --- |
| "Este identificador ainda **existe** como oferta do fornecedor, desde quando não existe, e o que o substitui?" | **Documentação do fornecedor** (página de depreciações, changelog, anúncio) | não diz o que acontece numa chamada concreta |
| "O que **este** endpoint responde a **esta** chave, hoje?" | **Execução** da chamada | não diz o status oficial nem a data do desligamento nem o substituto |

**Por que nenhuma cobre a outra.**

A documentação é a **única** fonte para a proposição histórica e institucional: quando foi
anunciado, quando desligou, qual o sucessor, se há janela de tolerância. Nenhuma execução recupera
uma data de desligamento passada, e uma execução bem-sucedida hoje não prova que o modelo não
está em desligamento agendado.

A execução é a **única** fonte para o comportamento efetivo, e ele varia por eixos que a
documentação não enumera: conta, organização, região, camada de acesso, alias legado mantido em
silêncio, roteamento para um sucessor sem aviso. O fornecedor documenta a política; o endpoint
executa a implementação, e as duas divergem.

**E a execução é ambígua na direção do fracasso.** Um erro numa chamada não identifica a causa: um
`404 model_not_found` pode ser modelo retirado, chave sem permissão para aquele modelo,
organização sem acesso, erro de digitação ou região errada. Para ler o fracasso como "modelo
retirado" é preciso a documentação. Já um sucesso é inequívoco na outra direção: se respondeu,
existe para mim hoje, e nenhuma página de depreciação desmente isso.

**Resumo operacional:** a documentação decide se o identificador existe; a execução diria o que a
API responde a quem insistir. Quem só tem a documentação pode afirmar o status e **não** pode
afirmar que a chamada falha. Quem só tem a execução pode afirmar o que recebeu e **não** pode
afirmar o status.

---

## Q09 `A`

**A premissa encadeia três saltos, e cada um é um defeito diferente.**

**Salto 1: inferir de nome.** "É um identificador de preview, logo é retirado" lê o sufixo em vez
do fato. Caminho e nome não são evidência de conteúdo nem de estado; foi essa a classe que gerou
alucinação no gate v1. Nem todo `-preview` foi retirado, e a data do desligamento não está no
nome.

**Salto 2: confundir documentação com execução.** Mesmo estabelecido que foi retirado, isso é uma
proposição sobre o **catálogo do fornecedor**, e "a chamada falha hoje" é uma proposição sobre o
**endpoint**. A segunda exige execução, e execução exige chave e gasto (Q08).

**Salto 3: supor que a linha é alcançada.** O identificador vive numa função. Medido, em
`10-AdvanceRAG/05-MultiModalRAG/02-Weaviate-Multimodal-RAG.py`:

```
 61:        "model": "gpt-4-vision-preview",      # dentro do payload de generate_description_from_image_gpt4
 73:    response_oai = requests.post("https://api.openai.com/v1/chat/completions", ...)
 15: client = weaviate.connect_to_local()        # no topo do modulo, fora de qualquer funcao
 33:    image_base64 = "<YOUR_IMAGE_BASE64_STRING>"   # placeholder literal
101:    description = generate_description_from_image_gpt4(...)   # so aqui a linha 61 e usada
```

Executado do zero, o script morre na linha 15 por falta de Weaviate local, muito antes da 61. E se
passasse, a linha 33 insere um placeholder literal como imagem. **A chamada ao modelo retirado não
é o primeiro defeito que um aluno encontra, é o quarto**, e uma aula que afirmar "a chamada falha
hoje" está descrevendo uma execução que ninguém conseguiu chegar a fazer.

**O que é verdade, e a AULA-27 acerta o registro** (`AULA-27-multimodal-rag.md:250`):

> **`gpt-4-vision-preview`** (`:61`) **está desligado, e desde antes do commit que este curso
> audita.** [...] **Documentado pelo fornecedor, não medido por mim:** eu não executei a chamada,
> que exigiria chave e gasto, e o cliente `weaviate` também não está instalado no ambiente pinado.

Ou seja: o achado é legítimo, a fonte é a página de depreciações do fornecedor, e o limite vem
declarado em vez de encoberto. **O que a aula pode afirmar** é que o identificador está desligado
por declaração do fornecedor e que o script já nascia chamando um modelo retirado. **O que ela não
pode afirmar** é o que a API responde hoje, nem que a falha observável seja essa.

**Um defeito extra que a premissa faz perder de vista, e que vale mais que ela:** a linha 74 faz
`response_oai.json()['choices'][0]['message']['content']` sem conferir status. Quando a API
devolver erro, o corpo não tem `choices`, e o aluno recebe `KeyError: 'choices'`, que não diz nada
sobre modelo retirado. **A lição transferível não é o identificador, é o tratamento de resposta**,
porque o identificador envelhece de novo e o padrão de erro não.

---

## Q10 `F`

**Sete arquivos, e os sete alimentam geração. Nenhum é apenas carregado.**

```
$ grep -rn "rlm/rag-prompt" .
./00-SimpleRAG/04_LangGraph_RAG.ipynb:141
./00-SimpleRAG/04_LangGraph_RAG.py:32
./00-SimpleRAG/04_LangGraph_RAG_Ollama.py:33
./07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py:128
./08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py:77
./10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py:150
./10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py:158
```

Rastreei a variável em cada um, porque carregar não é usar:

| Arquivo | Puxa em | Alimenta geração? | Onde se prova |
| --- | --- | --- | --- |
| `00-SimpleRAG/04_LangGraph_RAG.py` | `:32` | sim | `:53` `prompt.invoke({...})` dentro do nó `generate`, e a saída vai ao `llm` |
| `00-SimpleRAG/04_LangGraph_RAG_Ollama.py` | `:33` | sim | `:54`, idem |
| `00-SimpleRAG/04_LangGraph_RAG.ipynb` | célula 4 | sim | célula 7 define `generate` e faz `prompt.invoke({...})` seguido de `llm.invoke(messages)` |
| `07-PostRetrieval/03-Correction/01-CRAG-ReflectiveRetrieval.py` | `:128` | sim | `:147` monta `rag_chain = prompt \| llm \| StrOutputParser()`, invocada em `:150` e `:272` |
| `08-Generation/04-DynamicGenerationOptimizationStrategies/Self-RAG-FullImplementation.py` | `:77` | sim | `:87` monta a cadeia, invocada em `:90` e `:219` |
| `10-AdvanceRAG/04-AgenticRAG/01-LangChain-AgenticRAG.py` | `:150` | sim | `:152` monta, `:153` `chain.invoke(...)`; e `generate` é nó do grafo, registrado em `:167` e alcançado por `:172-173` |
| `10-AdvanceRAG/04-AgenticRAG/02-LangChain-AdaptiveRAG.py` | `:158` | sim | `:159` monta, `:166` `rag_chain.invoke(...)` |

**Uma diferença de forma que importa e que a contagem esconde:** em seis dos sete o `hub.pull`
está no **nível do módulo**, executado uma vez no import; em `01-LangChain-AgenticRAG.py` ele está
**dentro do nó `generate`** (`:150`), então a rede é consultada a cada execução daquele nó e só
quando o grafo chega lá. Para quem roda offline, os seis quebram no import e o sétimo quebra no
meio do grafo.

**Alerta de leitura, não veredito.** A AULA-19 (`:53`) e a AULA-22 (`:172`) dizem **seis**
arquivos. O número fecha se a conta for só de `.py`; a sétima ocorrência é o notebook
`04_LangGraph_RAG.ipynb`, que é arquivo do repositório e puxa da rede quando executado. Não
corrijo as duas aulas por conta própria: pode ser recorte deliberado ("os seis scripts"), e
quem escreveu decide. Registro para um humano decidir, que é o formato que este projeto usa para
divergência entre superfícies vivas.

---

## Q11 `J`

**A ressalva que a aula tem de carregar, e ela tem quatro partes, nenhuma dispensável:**

1. **A data da leitura.** O valor é de um instante, não do arquivo.
2. **O caminho exato pelo qual foi lido**, igual ao do script, com a versão da biblioteca. Não é
   ornamento: `hub.pull` pode resolver diferente entre versões de cliente.
3. **A declaração de que o valor pode mudar sem que uma linha do repositório mude.** É o núcleo.
4. **O comando pelo qual o leitor confere antes de confiar**, e não o valor sozinho.

A AULA-21 (`AULA-21-self-rag.md:212-227`) faz as quatro:

> **O conteúdo, puxado em 15/09/2026** pelo mesmo caminho que o script usa
> (`hub.pull("rlm/rag-prompt")`, `langchain` 0.3.17). [...] **E a medição não fecha o problema de
> auditoria, ela o demonstra.** O valor acima é o de uma data; o prompt pode ter mudado desde
> então sem que nada no repositório mude. Se você rodar, confira antes de confiar:
> `print(prompt.messages[0].prompt.template)`.

**Por que transcrever não fecha o problema de auditoria.** A transcrição resolve a **legibilidade**
e não toca a **verificabilidade**. Três razões, em ordem de gravidade:

- **A afirmação deixa de ser falsificável de dentro do repositório.** Toda citação deste projeto
  resolve contra um arquivo num commit pinado; esta não resolve contra nada. O
  `verify-citations.js` não tem caminho para validar, o `entreaulas.js` não tem alvo, e o
  `vigia.js` vigia `pacote==versão`, não conteúdo remoto. **Nenhum dos quatro instrumentos da casa
  alcança este valor**, e o exame é este: qual comando separa "o prompt continua assim" de "o
  prompt mudou"? Nenhum, sem rede.
- **A mudança é muda e retroativa.** O dono do prompt pode reescrevê-lo sem versão, sem anúncio e
  sem que `git status`, o portão ou qualquer suíte acusem. A transcrição vira, sozinha, uma
  afirmação falsa com aparência de citação verificada, que é a forma mais cara de defeito deste
  projeto.
- **O que se transcreve é uma amostra, não o objeto.** O objeto é um `ChatPromptTemplate` com
  `input_variables`, estrutura de mensagens e metadados; a transcrição do texto é a face visível.
  Duas versões podem ter o mesmo texto e `input_variables` diferentes.

**Julgamento: transcrever ainda é obrigatório, e é obrigatório justamente por não fechar.** A
alternativa, não transcrever, deixa o leitor sem saber que o prompt impõe teto de três frases em
toda geração dos arquivos que o puxam, que é um limite que **nenhuma leitura do repositório
revela**. A transcrição converte um desconhecido invisível num conhecido datado. O que fecharia o
problema é outra coisa: versionar o prompt no repositório, ou congelá-lo num arquivo local e
passar a `hub.pull` a papel de referência. Isso é mudança na fonte, e a fonte não se modifica.

---

## Q12 `F`

**Escritas à mão. O arquivo não tem pipeline nenhum.**

`09-Evaluation/01-RAGAS.py:25` abre a lista literal, dentro do dicionário `data` que começa em
`:19`:

```python
    "answer": [                                                        # :25
        "The main character in Black Myth: Wukong is Sun Wukong, ...",  # :26
        "Black Myth: Wukong's combat system combines ...",              # :27
        "Black Myth: Wukong is developed using Unreal Engine 5, ...",   # :28
    ],                                                                  # :29
```

Os `contexts` também são literais (`:30-43`). E a ausência é estrutural, não acidental: no arquivo
inteiro não há retriever, não há vector store, não há `hub.pull`, não há chamada de geração. O
único LLM instanciado (`:15`) é o **juiz**, embrulhado em `LangchainLLMWrapper`, não um gerador. A
AULA-22 mede o mesmo e registra em `:177-178`.

**A consequência para o que os números medem, e ela é dupla:**

**1. Os números não medem pipeline algum.** `faithfulness 0.6071` diz o quanto três respostas
escritas por uma pessoa são sustentadas por três contextos escritos pela mesma pessoa, na leitura
de um juiz LLM. Nenhum componente de RAG participou: nem chunking, nem embedding, nem índice, nem
`top_k`, nem prompt de geração. **Mudar qualquer decisão de engenharia do curso não move este
número**, porque nada do curso entra nele. O arquivo é demonstração da **métrica**, e é honesto
como tal; ele deixa de ser honesto no instante em que alguém o cita como avaliação de um sistema.

**2. O dado é o melhor caso possível, e enviesa para cima.** Resposta e contexto foram escritos
juntos, pela mesma mão, sobre o mesmo assunto. Não há erro de recuperação, não há contexto
irrelevante, não há a assimetria que existe em produção, onde a resposta vem de um modelo e o
contexto de um índice. Um `0.6071` **nesse** cenário é informação ruim, e é o dado mais
interessante do arquivo: a métrica reprovou o caso mais fácil que existe, o que diz mais sobre a
severidade do juiz do que sobre as respostas.

**E há um achado de ausência:** com contexto de referência escrito à mão e sem gabarito,
`context_precision` poderia ter sido medida e não foi; `context_recall`, que exige gabarito, não
tinha como. O arquivo se chama avaliação de RAG e não mede nenhum eixo de recuperação.

---

## Q13 `F`

**Guarda nota por amostra, uma por linha do dataset.** Medido na versão que o módulo pina,
`ragas` 0.2.15 (`09-Evaluation/requirements.txt:23` declara `ragas<0.3`;
`91-Environment/requirements_langchain_Ubuntu-with-CPU.txt:266` pina `ragas==0.2.15`, que é a
instalada no ambiente do curso).

```
$ E:/tmp/rag-venv/Scripts/python.exe -c "import inspect; from ragas.dataset_schema import
  EvaluationResult; print(inspect.getsource(EvaluationResult.__getitem__))"

    def __getitem__(self, key: str) -> t.List[float]:
        return self._scores_dict[key]
```

E o `__post_init__` mostra de onde vem: `self._scores_dict = {k: [d[k] for d in self.scores] for k
in self.scores[0].keys()}`. O campo `scores` é `t.List[t.Dict[str, t.Any]]`, uma entrada por
amostra, e `_scores_dict` apenas transpõe para dicionário de listas. O objeto carrega também
`to_pandas()`, que devolve a tabela por amostra com as colunas de entrada ao lado.

**O que o script faz com isso: descarta, em três lugares.**

```python
scores = faithfulness_result['faithfulness']                                    # :62
mean_score = np.mean(scores) if isinstance(scores, (list, np.ndarray)) else scores   # :64
...
opensource_mean = np.mean(scores) if ...                                        # :91
openai_mean = np.mean(scores) if ...                                            # :98
```

**A linha 64 é a que importa, e ela tem um ramo morto.** Como `__getitem__` sempre devolve
`t.List[float]`, o `isinstance(scores, (list, np.ndarray))` é sempre verdadeiro e o `else scores`
**nunca executa** nesta versão. O código foi escrito prevendo uma API que devolvesse escalar, e a
que existe não devolve.

**O custo concreto:** o desvio entre as três amostras está no objeto, de graça, e é jogado fora na
linha em que a média é calculada. Trocar por `result.to_pandas()` custa uma linha e **zero
chamadas de LLM**, e é isso que permitiria dizer se `0.6071` é "três amostras em torno de 0,61" ou
"1,0 / 0,82 / 0,0". Os dois casos imprimem o mesmo `Faithfulness Score: 0.6071` e significam
coisas opostas. O arquivo tinha a dispersão na mão e imprimiu só o centro.

---

## Q14 `C`

**A razão, e ela é interna a cada amostra.** Medido em `ragas` 0.2.15,
`E:/tmp/rag-venv/Lib/site-packages/ragas/metrics/_faithfulness.py`, método `_compute_score`:

```python
faithful_statements = sum(1 if answer.verdict else 0 for answer in answers.statements)
num_statements = len(answers.statements)
score = faithful_statements / num_statements
```

**Denominador:** `num_statements`, o número de afirmações em que a resposta foi decomposta.

**Quem o produz:** o **próprio LLM juiz**, num primeiro passo que quebra a resposta em afirmações
atômicas. Depois um segundo passo, também do LLM, dá um veredito de sustentação por afirmação
contra o contexto, e isso preenche o numerador.

**A consequência: o denominador não é um dado, é uma saída do instrumento.** Numa medição comum, o
denominador é fixo pelo desenho (3 perguntas, 100 documentos) e o ruído entra só no numerador.
Aqui **o instrumento define a unidade de medida a cada execução**. A mesma resposta pode virar 5
afirmações numa passada e 7 na seguinte, e `3/5` e `4/7` não são o mesmo número nem medem a mesma
coisa: a granularidade mudou. Uma decomposição mais fina dilui uma afirmação errada; uma mais
grossa a concentra.

**Por isso "repetir a medição" e "reportar o desvio entre amostras" respondem perguntas
diferentes, e nenhuma cobre a outra:**

| | O que varia | O que a variação estima | O que ela não diz |
| --- | --- | --- | --- |
| **Repetir a medição** | o juiz, no mesmo dataset: decomposição, veredito, amostragem do modelo | a **instabilidade do instrumento**, incluindo a do denominador | nada sobre se o sistema é bom ou ruim num caso ou noutro |
| **Desvio entre amostras** | as amostras, numa execução só | a **heterogeneidade do objeto**: quais perguntas o sistema responde bem e quais não | nada sobre quanto do desvio é o juiz mudando de régua entre amostras |

**E a segunda é contaminada pela primeira.** O desvio observado entre as três amostras de uma
execução mistura variação real do sistema com variação do juiz, porque cada amostra foi medida com
uma decomposição própria e independente. Não se separam sem repetir: **é preciso repetir para
estimar o ruído do instrumento e só então ler o desvio entre amostras como propriedade do
sistema**. As duas são complementares, e a leitura errada é tratar o desvio entre amostras como se
o instrumento fosse fixo.

**Julgamento:** por isso a decisão de engenharia correta, num dataset de três amostras, é reportar
a distribuição por amostra **e** o número de repetições, nunca a média sozinha. A média sozinha
esconde os dois eixos ao mesmo tempo.

---

## Q15 `A`

**Falso. Repetir ataca a fonte de erro menos importante das cinco que estão na mesa**, e uma delas
nenhuma repetição resolve.

**O que o arquivo faz** (`09-Evaluation/01-RAGAS.py:101-106`):

```python
diff = openai_mean - opensource_mean                                            # :103
print(f"Difference: {diff:.4f} ({'OpenAI is better' if diff > 0 else ...})")     # :106
```

e o resultado transcrito na docstring (`:137-140`): `0.8565` contra `0.9426`, diferença `0.0861`,
"OpenAI is better".

**1. O comparador não tem limiar nem banda de empate.** `diff > 0` declara vencedor com qualquer
diferença não nula, inclusive `0.0001`. Repetir não conserta isso: conserta-se com um critério.

**2. `n = 3`, e as três amostras não são independentes.** São três perguntas sobre um único jogo,
escritas à mão pela mesma pessoa (Q12). Repetir a medição não aumenta `n`: aumenta o número de
leituras das mesmas três. O intervalo de confiança da diferença entre dois modelos sobre 3
observações pareadas é largo demais para `0,0861` sair dele, e nenhuma quantidade de repetições
estreita a amostragem do **corpus**.

**3. As duas notas vivem em espaços de cosseno diferentes, e isso é o achado que mata a
comparação.** Medido em `E:/tmp/rag-venv/Lib/site-packages/ragas/metrics/_answer_relevance.py`: `answer_relevancy` gera
`strictness=3` perguntas hipotéticas a partir da resposta e devolve a **média dos cossenos** entre
a pergunta original e as geradas, no espaço do **embedder daquele braço**.

```python
        cosine_sim = self.calculate_similarity(question, gen_questions)
        score = cosine_sim.mean() * int(not committal)
```

O juiz LLM é o mesmo nos dois braços; o que muda é o espaço em que o cosseno é calculado.
Distribuições de cosseno não são comparáveis entre espaços de embedding: modelos diferentes têm
pisos e escalas diferentes para pares não relacionados. `0,9426` num espaço e `0,8565` noutro
podem ser o **mesmo percentil**. **Julgamento de engenharia:** a diferença medida é indistinguível
de um efeito de calibração de escala, e repetir dez mil vezes reproduz o mesmo viés com desvio
menor, que é precisão crescente sobre um número que não significa o que se quer que signifique.
O experimento que separaria as duas hipóteses é outro: normalizar por uma linha de base de pares
aleatórios em cada espaço, ou comparar por ordenação (qual embedder põe a resposta certa acima das
erradas) em vez de por valor absoluto.

**4. A dispersão foi descartada** na linha 64 e nas 91 e 98 (Q13). Sem ela não há teste pareado
possível, e é o teste pareado, não a média repetida, que decidiria esta comparação com `n = 3`.

**5. Os números da docstring são de uma execução só**, e o `answer_relevancy` depende de perguntas
geradas por LLM, que não são determinísticas nem com `temperature=0`.

**O que seria preciso, em ordem de retorno:** (a) definir a banda em que a diferença não decide;
(b) ampliar e diversificar o corpus, que é o único remédio para `n = 3`; (c) reportar por amostra e
fazer teste pareado; (d) medir em escala comparável entre os dois espaços; (e) só então repetir,
para estimar o ruído do juiz. **Repetir sozinho é o passo (e) sem (a) a (d)**, e a AULA-22 já
registra que `0,61` "não é um veredito, é um ponto de partida".

---

## Q16 `C`

**Superfície de fecho é o lugar, dentro do mesmo artefato, que reafirma um fato de forma condensada
depois de o corpo o ter estabelecido.** O `ferramentas/fechos.js` as enumera por quatro classes
medidas no acervo:

```js
const CLASSES = [
  ['Checkpoint', (l) => /^\d+\.\s/.test(l)],
  ['Titulo',     (l) => /^\*\*[^*]{4,70}\.\*\*/.test(l)],
  ['Rodape',     (l) => /^\*\*(Próxima|Anterior):\*\*/.test(l)],
  ['Tabela',     (l) => /^\|/.test(l) && !/^\|[\s:|-]+\|/.test(l)],
];
```

Checkpoint de fim de aula, título em negrito que resume o parágrafo, rodapé de navegação e linha de
tabela. São as formas que **restam na memória do leitor** e as que ele consulta quando volta.

**Por que consertar só o corpo é o mesmo defeito que não consertar.** A afirmação sobre o assunto
não é o parágrafo: é a **conjunção** de tudo que o documento diz sobre ele. Enquanto o checkpoint
carrega a versão antiga, o documento continua afirmando a coisa errada, agora com um agravante:
**ele afirma as duas**, e quem lê não tem como saber qual vale. A contradição interna é pior que o
erro original, porque destrói a confiança no documento inteiro em vez de num parágrafo.

**E o fecho é o que mais gente lê.** O corpo tem trinta linhas e o checkpoint tem uma. Quem revisa,
quem consulta depois e quem cita pega o fecho. Consertar o corpo e deixar o fecho é consertar a
parte que menos circula e deixar intacta a que mais circula. Um resumo errado viaja sozinho, e ele
viaja **sem** o parágrafo que o corrigiria.

**A classe é medida, não teórica.** O `ferramentas/contagem.js` existe porque esta forma reincidiu:
o cabeçalho diz "Dois comentários que mentem" e o corpo cita três; "Três coisas para conferir" e a
lista tem quatro marcadores. Em todos os casos o conserto entrou no corpo e o numeral do fecho
ficou na versão anterior.

**O `fechos.js` não julga, e a escolha é medida.** O comentário registra que o juiz automático por
sobreposição de palavras reprovou: 98 pares com limiar 2 (ruído) e 0 com limiar 3 mais hedge
(cego), validado contra um positivo plantado que ele não pegou. **O sinal não é lexical**, então a
ferramenta lista e a leitura decide. É a diferença entre reduzir uma lista infinita a uma finita e
fingir que a decisão é mecânica.

**Distinção que o par de ferramentas marca:** `fechos.js` enumera superfície de fecho **dentro** de
um arquivo; `superficies.js` enumera arquivos **através** do acervo. São complementares e nenhum
substitui o outro, e a Q18 percorre os dois.

---

## Q17 `F`

**Quinze ferramentas, quinze suítes, cobertura total.**

```
$ ls ferramentas/*.js | wc -l                 -> 15
$ ls ferramentas/testes/*.test.js | wc -l     -> 15
$ for f in ferramentas/*.js; do b=$(basename $f .js);
    [ -f "ferramentas/testes/$b.test.js" ] || echo "SEM TESTE: $b"; done
  (nenhuma saida)
```

As quinze: `cauda`, `contagem`, `decisoes`, `dod`, `entreaulas`, `eol`, `fechos`, `gerar-fatos`,
`lock`, `portao`, `requebra`, `residuo`, `superficies`, `verify-citations`, `vigia`.

**Precisão sobre o denominador:** `ferramentas/` tem **dezesseis** arquivos, porque há também
`montar-ambiente.sh`. Ele não entra na conta de quinze que o `rag-auditado-ptbr/README.md:296` e o
`PROMPT-CONTINUAR.md:25` declaram, e não tem suíte. O DoD o cobre por outro caminho, a condição 8,
que exige que ele esteja **versionado**, não testado (`ferramentas/dod.js`, condição 8:
`git ls-files --error-unmatch ferramentas/montar-ambiente.sh`).

**O comando que roda todas:**

```
bash ferramentas/testes/rodar.sh
```

**O que a suíte exige além de passar: positivo plantado, e ele não é opcional.** O `rodar.sh`
invoca cada teste com `--provar`:

```bash
for t in "$(dirname "$0")"/*.test.js; do
  node "$t" --provar || falhou=1
done
```

Sob `--provar`, o teste **cega a própria ferramenta**: lê o fonte, substitui a linha que faz a
detecção, grava a cópia mutilada num diretório temporário e **exige que ela deixe de achar** o caso
que a versão sã acha. Em `cauda.test.js:75-86`:

```js
const alvo = 'for (let j = 0; j < k; j++) if (ps[i + j] !== ps[i + k + j]) { igual = false; break; }';
fs.writeFileSync(cego, fonte.replace(alvo, 'igual = false;'));
checa('cega, ela deixa de achar a oração repetida', c.code === 0 && /Nenhuma cauda/.test(c.saida), ...);
```

**A razão está escrita no `rodar.sh` e é medida:** "sem `--provar` uma suíte verde não prova nada:
ela pode estar aprovando por não medir. Foi assim que sete verificadores deste projeto aprovaram em
silêncio antes de 14/09/2026." O teste também falha se o alvo da mutação **não existir mais**, o
que impede o positivo plantado de virar letra morta quando a ferramenta é refatorada.

---

## Q18 `J`

Corrigi um conceito numa aula. **A sequência, e ela vai do mais estreito ao mais largo, porque cada
passo define o escopo do seguinte.**

**1. Fecho dentro da própria aula.** `node ferramentas/fechos.js` sobre o diff de trabalho. Ele
lista checkpoint, título em negrito, rodapé e linha de tabela que o diff **não** tocou, e essa é a
lista finita que a leitura percorre. **O que ele não vê:** o conteúdo. Ele não julga se a linha
listada contradiz o conserto, porque o juiz automático foi medido e reprovou, e o sinal não é
lexical. Julgo eu, linha a linha.

**2. Frase antiga sobrevivendo em outro lugar.** `node ferramentas/residuo.js`. Ele extrai os
trechos **removidos** do diff e procura cada um no acervo inteiro: o que apaguei aqui e continua
vivo ali é resíduo. **O que ele não vê:** semântica; ele decide presença, com piso de 40
caracteres. Paráfrase do trecho removido escapa inteira, e trecho curto não entra.

**3. O mesmo fato em outras superfícies.** `node ferramentas/superficies.js "<termo>"`, com os
termos do conceito e seus sinônimos. Ele separa **VIVA** (aulas, `README`, `HANDOFF`,
`PROMPT-CONTINUAR`, `GLOSSARIO`, `FATOS`, `agente/`), onde divergência é defeito, de **REGISTRO**
(`avaliacao/`), onde divergência está certa e não se toca. **O que ele não vê**, e vem declarado no
próprio cabeçalho: ele acha **termo**, não conceito, então paráfrase escapa; e **não alcança o
artefato do plano**, que vive fora do repositório e foi a superfície esquecida três vezes no dia
que originou a ferramenta.

**4. Citação de linha que apontava para o trecho editado.** `node ferramentas/entreaulas.js`. Se o
conserto mudou o número de linhas da aula, **toda citação de outra aula para ela ficou inválida, e
nada avisa**. O veredito forte é `DESLOCADA`: a citação traz transcrição e ela não está nas linhas
citadas. **O que ele não vê:** `SEM_PROVA`, quando a citação não traz transcrição. Aí só a faixa
foi conferida, e o alvo pode ter mudado de conteúdo sem mudar de tamanho. Hoje o acervo tem 4
nesse estado, e são alerta de leitura, não aprovação.

**5. Citação contra a fonte.** `node ferramentas/verify-citations.js --all`. Se o conserto trocou,
acrescentou ou removeu citação ao clone, ela se valida aqui. **O que ele não vê, e é a lacuna mais
importante do ferramental:** ele valida que o caminho existe e que a linha está no range, e **não**
detecta citação cujo conteúdo alegado não está naquela linha. Foi testado contra a alucinação Q05
do gate v1, que passa como válida. A cobertura dessa lacuna não é validação, é não depender da
memória: consultar o `FATOS.md`, que traz `arquivo:linha` mais o conteúdo literal extraído por
script.

**6. Comportamento de biblioteca, se o conceito o envolve.** `node ferramentas/vigia.js`. **O que
ele não vê:** conteúdo remoto que não seja `pacote==versão`. Um prompt puxado da rede, um modelo do
fornecedor, um dataset baixado, nenhum entra.

**7. O DoD.** `node ferramentas/dod.js`, para não julgar o conjunto. **O que ele não vê:** a décima
condição, que é leitura humana dos dois documentos que ela nomeia.

**8. O que nenhuma ferramenta vê, e sobra para mim:** paráfrase do conceito corrigido em qualquer
superfície; o artefato do plano, fora do repositório; e os comentários de cabeçalho das próprias
quinze ferramentas, que carregam fatos medidos e **não estão na lista VIVAS** do `superficies.js`.

**Julgamento sobre a ordem:** ela não é arbitrária. Do estreito para o largo, cada passo reduz o
espaço de busca do seguinte, e os passos 4 e 5 vêm depois de 1 a 3 porque consertos feitos naqueles
passos mudam contagens de linha e criam trabalho novo para estes. Rodar o verificador antes de
terminar os consertos é aprová-lo sobre um estado que não é o entregue.

---

## Q19 `A`

**Falso, e a premissa erra duas vezes: no que a varredura alcança e no que "superfície viva"
significa.**

**Erro 1: a varredura não devolveu "todas as superfícies vivas". Devolveu as que contêm o
TERMO.** O cabeçalho do `ferramentas/superficies.js` declara:

> Nao acha CONCEITO, acha TERMO. Parafrase escapa, e foi assim que a leitura antiga sobreviveu em
> prosa a 23 linhas da celula corrigida. Depois de usar esta ferramenta, a busca por sinonimo
> continua sendo trabalho de leitura.

A busca é `l.toLowerCase().includes(alvo)`, substring literal. Um parágrafo que explica o mesmo
conceito sem usar a palavra não aparece, e o exemplo é medido: **23 linhas** depois da célula
corrigida, na mesma aula, a leitura antiga continuava em prosa.

**Erro 2: a lista VIVAS é finita e não é o acervo.** Lida do código:

```js
const VIVAS = [
  { dir: '.',      re: /^AULA-\d{2}-.*\.md$/ },
  { dir: '.',      re: /^(README|HANDOFF|PROMPT-CONTINUAR|GLOSSARIO|FATOS)\.md$/ },
  { dir: 'agente', re: /\.md$/ },
];
```

**Ficam de fora**, e carregam afirmação: `ferramentas/*.js`, cujos cabeçalhos guardam números
medidos e decisões de desenho; `ferramentas/testes/*.test.js`; `exercicios/`; e a **quarta
superfície**, o artefato do plano publicado fora do repositório, que o próprio cabeçalho declara
não alcançar e que foi a esquecida três vezes no dia em que a ferramenta nasceu.

**Erro 3, e é o que a premissa mais deixa passar: superfície de fecho.** Ainda que o termo apareça
e o arquivo seja varrido, o `superficies.js` lista **arquivos e linhas**, não decide se cada
ocorrência precisa mudar. Checkpoint, título e célula de tabela dentro de uma aula já varrida
continuam sendo trabalho do `fechos.js` e da leitura (Q16, Q18).

**Erro 4: a ferramenta declara o que é.** A última linha da saída é literal:

```
Alerta de leitura, nao portao. Termo nao e conceito: parafrase escapa,
e o artefato do plano vive fora do repositorio e nao entra nesta conta.
```

Ler alerta como veredito é o que a frase existe para impedir.

**O que é verdade:** a varredura devolve a lista finita de **candidatos por termo** nas superfícies
que ela cobre, e separa as vivas, que têm de concordar, do registro, que não se toca. Isso reduz
uma busca aberta a uma lista percorrível, que é muito. **Não é** prova de completude, e a
completude por termo nem sequer implicaria completude por conceito.

---

## Q20 `C`

**Porque `avaliacao/` é registro, e registro cita o estado do dia em que mediu.** A regra que
atravessa este projeto separa dois tipos de documento:

| Tipo | Quem | O que uma citação envelhecida significa |
| --- | --- | --- |
| **Vivo** | aulas, `README`, `HANDOFF`, `PROMPT-CONTINUAR`, `GLOSSARIO`, `agente/` | **defeito**: o documento descreve o estado atual e aponta para um estado que não existe |
| **Registro** | `avaliacao/` | **correto**: o documento descreve uma rodada passada, e a citação é parte do que se registrou |

O `entreaulas.js` implementa a divisão. Ele varre as aulas mais cinco documentos vivos da raiz, e o
comentário explica a escolha com o achado que a motivou:

> o `HANDOFF.md` citava `AULA-18:157` como forma exemplar de ressalva, e a linha tinha ido para
> 160 e o texto citado era a versao anterior, reescrita no mesmo dia. Documento vivo tem de apontar
> para o estado atual. Registro de auditoria e o oposto: ele cita o estado do dia em que mediu, e
> uma citacao que envelhece ali esta CERTA.

**O que aconteceria se `avaliacao/` entrasse.** Duas coisas, e a segunda é a grave.

**1. Ruído em massa, que afogaria o sinal.** O `GATE-AULAS-v1.md` tem quase cinco mil linhas e
cita dezenas de `AULA-XX:NNN` de rodadas antigas. Quase todas apontariam para linha deslocada ou
para conteúdo trocado, porque as aulas foram reescritas depois. A ferramenta reprovaria
permanentemente, a condição 6 do DoD nunca fecharia, e um portão que nunca fecha é um portão que se
aprende a ignorar. Os quatro `SEM_PROVA` legítimos de hoje ficariam invisíveis no meio de dezenas
de `DESLOCADA` espúrias.

**2. A pressão de conserto destruiria a história, e essa é a razão de fundo.** Um portão vermelho
pede conserto, e o "conserto" aqui seria reescrever o registro para bater com o presente. O comando
pelo qual uma rodada foi julgada, a citação que provava um achado, a linha que mostrava onde o
defeito estava: tudo isso é evidência, e evidência atualizada para o presente deixa de ser
evidência. O GATE tem linhas como esta, em `avaliacao/GATE-AULAS-v1.md:566`:

> `AULA-04:100`, `AULA-09:191`, `AULA-10:169` e `AULA-13:196` **na versão anterior**; a palavra foi
> removida em `7d516c0`

Hoje `AULA-13:196` é "inventados, e a sonda arrasta a recuperação para documentos com números
parecidos e errados", que não tem relação com o achado. **A citação está desatualizada e está
certa**, porque a frase que a acompanha diz "na versão anterior" e nomeia o commit em que a
mudança entrou. Consertá-la apagaria a prova de que o achado existiu.

**Em uma linha:** varrer `avaliacao/` transformaria história em defeito, e o conserto do falso
defeito apagaria a história.

---

## Q21 `F`

**O comando:**

```
$ git -C <clone> remote get-url origin
https://github.com/PacktPublishing/RAG-from-First-Principles.git

$ git ls-remote https://github.com/PacktPublishing/RAG-from-First-Principles.git HEAD
17c6942ddca140c7e2269ea4513c606f0299d1fb	HEAD

$ git -C <clone> rev-parse HEAD
17c6942ddca140c7e2269ea4513c606f0299d1fb
```

Iguais: **a fonte não andou**, medido hoje, 15/09/2026. É o mesmo par que o `vigia.js` executa no
eixo 1, e ele reporta `upstream em 17c6942: a fonte NAO andou`.

**Por que `ls-remote` e não `fetch`:** `ls-remote` é uma consulta pura. Ele pergunta ao servidor
quais refs existem e com que hash, imprime na saída padrão, **e não escreve nada em lugar nenhum**,
nem no clone nem fora dele. Nem precisa de um clone para rodar: aceita a URL direta.

**O que ele não consegue responder, e o preço está pago de propósito:**

- **Quantos commits o upstream andou.** Ele devolve um hash, não uma distância. Saber a distância
  exige ter os objetos, e ter os objetos exige `fetch`, que escreve no clone.
- **O que mudou.** Sem os objetos não há diff, não há mensagem de commit, não há lista de arquivos
  tocados. Só se sabe **que** andou.
- **Se andou e voltou.** Um `force-push` que reponha a ponta no mesmo hash é indistinguível de
  nenhuma mudança. Hash igual prova identidade da ponta agora, não ausência de história entre as
  duas leituras.
- **Mudança fora da ref consultada.** `HEAD` é a ponta do branch padrão. Commits em outro branch,
  tags novas, releases, issues, um README reescrito no site: nada aparece. (`git ls-remote` sem
  `HEAD` listaria todas as refs e ampliaria isso, ao custo de mais ruído; o `vigia.js` escolheu
  `HEAD`.)
- **Se o repositório foi arquivado, renomeado ou tornado privado**, desde que o redirecionamento
  continue respondendo.
- **Mudança que não é git.** O conteúdo da rede que o curso consome (`rlm/rag-prompt`, modelos do
  fornecedor, pacotes do PyPI) não é ref nenhuma. É o eixo 2, e é outro comando.

**E há um modo de falhar que não é limite, é armadilha:** o comando pode **não responder**. O
`vigia.js` trata isso separadamente e a mensagem é deliberada: `upstream: NAO RESPONDEU. Sem
resposta nao e sinal de que nao mudou.` Silêncio de rede lido como estabilidade é a forma mais
barata de um alarme se apagar sozinho.

---

## Q22 `C`

**Porque o contrato é sobre o clone, e o clone não é a árvore de trabalho.** Um repositório git são
duas coisas: os arquivos que se veem e o `.git/` que os produz. `git fetch` não toca a primeira e
escreve na segunda, e a segunda é onde mora tudo que faz o pin valer.

**O que `fetch` escreve, concretamente:**

- **Objetos novos** no banco (`.git/objects/`, packfiles). O repositório passa a conter commits,
  árvores e blobs que não existiam.
- **Refs de rastreamento** (`refs/remotes/origin/*`) reapontadas para as pontas novas.
- **`FETCH_HEAD`**, e uma linha no `.git/logs/` das refs atualizadas.
- Eventualmente **poda** de refs remotas que sumiram, e **repack** se o `gc` automático disparar.

**Por que isso viola o contrato, em três níveis:**

**1. O contrato diz que o clone não se modifica, e o clone se modificou.** A regra não é "a árvore
de trabalho não muda", é "o clone não se modifica". Reduzi-la a arquivos visíveis é a mesma
substituição de critério que a Q30 recusa: trocar a condição pela parte dela que é fácil de
conferir.

**2. Cria a possibilidade de resolver contra o commit errado, sem que ninguém decida.** Toda
citação deste curso resolve contra `17c6942`. Depois de um `fetch`, o repositório passa a conter
**outra** versão de cada arquivo citado, alcançável por `origin/HEAD`, por um `checkout`, por um
`git show origin/main:arquivo.py`, por um `merge` acidental, por uma ferramenta que leia a ref
remota em vez da local. Antes do `fetch` esses caminhos **não existem**; depois, existem todos, e
nenhum deles precisa de decisão humana para ser tomado. A auditoria deixa de ser garantida pela
ausência dos objetos e passa a depender de ninguém errar.

**3. E a violação é invisível na verificação que o contrato usa.** `git status --porcelain`
continua vazio depois de um `fetch`. **O sinal que confirmaria o cumprimento do contrato não
detecta o descumprimento**, então o contrato tem de ser cumprido antes, na forma de não rodar o
comando, e não depois, na forma de conferir o resultado. É por isso que a regra é "não dê `fetch`",
e não "dê `fetch`, mas não faça `merge`": a segunda forma não é verificável.

**A alternativa existe e é gratuita**, o que remove o último argumento a favor: `git ls-remote`
responde a pergunta do eixo 1 sem escrever. O preço, não saber **quantos** commits andou, está
declarado e pago de propósito. Um contrato que se pode cumprir sem perder a capacidade não tem por
que ser afrouxado.

---

## Q23 `A`

**Falso, e a premissa é contrafactual hoje**, o que já a desmonta antes do argumento: rodei o vigia
nesta sessão e ele acusou.

```
VIGIA: 8 item(ns) mudaram desde a medicao.
  - langchain: 0.3.17 -> 1.4.0          - langchain-openai: 0.3.3 -> 1.6.2
  - langchain-community: 0.3.16 -> 0.4.2 - langgraph: 0.2.69 -> 1.2.11
  - langchain-core: 0.3.33 -> 1.6.3      - llama-index-core: 0.12.15 -> 0.14.24
  - pymilvus: 2.5.4 -> 3.0.1             - ragas: 0.2.15 -> 0.4.3
```

**Mas a inferência é inválida mesmo quando ele de fato não acusa**, por seis razões, e o próprio
script declara quatro delas.

**1. `--offline` não consulta nada, e diz isso.** `node ferramentas/vigia.js --offline` sai com
estado `OFFLINE` e a linha `OFFLINE: nada foi consultado. Ausencia de alarme aqui nao e ausencia de
mudanca.` Quem lê só o fim da saída vê ausência de alarme.

**2. Não responder não é não ter mudado, e são estados distintos.** Para a fonte:
`upstream: NAO RESPONDEU. Sem resposta nao e sinal de que nao mudou.` Para o PyPI:
`${pacote} ${versao}  PyPI nao respondeu`. E `versaoNoPypi` engole erro de rede devolvendo string
vazia, então falha de conectividade se apresenta como pacote sem resposta, não como falha do
script. **Nenhum dos dois incrementa `mexeu`**, ou seja, o script sai com "nada mudou" no veredito
final tendo consultado nada.

**3. A lista de vigilância é derivada das aulas, não do repositório.** O comentário declara: ele
não vigia os mais de 1700 pins, vigia "o que o ACERVO DIZ TER MEDIDO". Uma biblioteca que o curso
usa e nenhuma aula nomeia com versão **não está sendo vigiada**, e seu envelhecimento é
silencioso. Hoje são 12 declarações, 8 vigiadas, contra 23 arquivos de `requirements`.

**4. Versão de INSTRUMENTO é excluída por desenho.** As quatro de hoje (`langchain-core` 1.6.3,
`openai` 1.109.1, `pydantic` 2.13.4, `python-dotenv` 1.1.0) não são comparadas com o PyPI, e está
certo (Q03). Mas significa que "não acusou" nunca foi afirmação sobre elas.

**5. O eixo 1 só olha `HEAD`.** Todos os limites da Q21 valem: força bruta de branch, tag, retorno
ao mesmo hash, nada disso aparece.

**6. Há classes inteiras de envelhecimento que o vigia não mede, e são as que mais doem neste
curso.** O conteúdo de `rlm/rag-prompt`, que seis arquivos puxam da rede e que pode mudar sem uma
linha do repositório mudar (Q11). O catálogo de modelos do fornecedor, como o
`gpt-4-vision-preview` (Q09). O endereço dos corpora baixados. A `RE_VERSAO` também descarta
declaração que não case com o formato `` `pacote` X.Y.Z ``, e declarações cujo nome não bate com
nenhum `requirements` são só contadas, não investigadas.

**O que "não acusou" autoriza afirmar, e é bem menos:** que, na execução online de hoje, a ponta de
`HEAD` do upstream é igual ao commit pinado **e** que cada uma das versões classificadas como PIN
continua sendo a corrente no PyPI. Nada além disso. O próprio script fecha com a leitura correta do
alarme oposto: `Nada disso quebra o acervo sozinho: decide-se por aula se vale remedir.`

---

## Q24 `J`

**Caso concreto, e ele é o de hoje.** O vigia acusou `llama-index-core 0.12.15 -> PyPI em 0.14.24`,
citado por **cinco** aulas: `AULA-15`, `AULA-18`, `AULA-20`, `AULA-22`, `AULA-24`. Sigo esta ordem.

**1. Classifico antes de agir.** O vigia já o fez: `0.12.15` é **PIN**, não instrumento (o clone o
declara em cinco `requirements`). A consequência é imediata e reduz o trabalho: a frase "o
repositório pina `llama-index-core` 0.12.15" **continua verdadeira** e continuará enquanto o commit
pinado for `17c6942`. Nenhuma das cinco aulas está errada por o PyPI ter andado.

**2. Abro as cinco passagens e separo o tipo de afirmação.** É aqui que o trabalho está, e é
leitura, não comando. Três tipos, com destinos diferentes:

| O que a passagem afirma | O PyPI ter andado torna a frase falsa? | Destino |
| --- | --- | --- |
| "o repositório pina X" | não, nunca | nada a fazer |
| "com a versão X, o arquivo se comporta assim" | não: a afirmação vem datada e versionada | acrescentar, não trocar |
| "a versão corrente é X" ou "hoje o comportamento é" | **sim** | remedir, e é a única que obriga |

**3. Decido se vale remedir, e digo com base em quê.** O critério é se a mudança **pode ter
alterado o comportamento que a aula ensina**, não se o numeral mudou. Dois minor de
`llama-index-core` merecem ler o changelog antes de montar ambiente; cinco travessias de major em
oito bibliotecas, como as de hoje, pesam mais.

**4. Se for remedir, monto um SEGUNDO ambiente** com a versão corrente e rodo a mesma sonda nos
dois, exatamente como na Q07. O pinado não se toca.

**5. Registro as duas versões lado a lado**, com data, em cada uma das cinco aulas, e a ressalva de
qual é pin e qual é medição nova.

**6. Reporto a quem paga a rodada**, com o custo de reauditar se a decisão for repinar.

**O que eu NÃO faço com o texto das aulas, e é o cerne:**

- **Não troco `0.12.15` por `0.14.24`.** Isso produz uma afirmação nova que ninguém verificou, na
  forma exata que este projeto chama de corrigir invenção inventando outro detalhe. E é pior que o
  erro original: o número velho vinha com data e método; o novo vem só com aparência de atualidade.
- **Não apago a medição antiga ao acrescentar a nova.** As duas versões ficam lado a lado. A antiga
  documenta o repositório como ele é; a nova documenta o mundo como ele está. Substituir uma pela
  outra perde a informação de que elas divergem, que é o achado.
- **Não escrevo "esta aula está desatualizada".** Enquanto o clone estiver em `17c6942`, a aula
  descreve corretamente o que o repositório declara. O que mudou foi o PyPI, e o PyPI não é o
  objeto do curso.
- **Não repino o clone, e não proponho repinar como consequência automática.** Repinar é
  reauditar: toda citação de linha resolve contra o commit pinado, e um arquivo que ganhou cinco
  linhas invalida toda citação abaixo delas. O custo é a auditoria inteira, e a decisão é de quem
  paga.
- **Não atualizo o ambiente pinado** (Q07).
- **Não corrijo as cinco de uma vez por busca e substituição.** Cada passagem afirma uma coisa
  diferente, e três das cinco provavelmente não precisam de nada. Varredura uniforme sobre
  afirmações heterogêneas é como o erro entra.

**Julgamento:** o alarme do vigia é uma **hipótese**, não um veredito. O ciclo correto é vigia
levanta, ambiente separado mede, aula registra as duas. Tratar o alarme como ordem de edição
converte uma ferramenta de vigilância numa fábrica de afirmação não verificada.

---

## Q25 `C`

**Três formas, da mais rápida para a mais lenta, com o exemplo medido neste projeto e o que se cita
no lugar.**

**1. Número de linha para arquivo vivo (`arquivo:linha`).** Envelhece em **horas**, pela mão de
quem edita, e sem nenhum agente externo. Qualquer inserção acima do alvo desloca tudo abaixo, e
nada avisa.

*Medido:* a citação da AULA-21 para a AULA-18 errou três vezes, por três causas
(`ferramentas/entreaulas.js`, cabeçalho, e `avaliacao/GATE-AULAS-v1.md:4369-4373`): apontava para
`:217`, correta quando escrita e envelhecida por uma rodada; corrigida para `:243-247`, com o alvo
medido na hora; e **quebrou no mesmo dia**, porque um conserto de outra auditoria acrescentou cinco
linhas e empurrou a passagem para `:248`.

*No lugar:* a **transcrição literal ao lado da citação**, que é a convenção que o `entreaulas.js`
declara e ainda não impõe. Com ela, o número vira conveniência e o conteúdo vira a âncora, e a
ferramenta consegue decidir `DESLOCADA` em vez de `SEM_PROVA`. Para documento com seções, o
**título**; para commit, o **hash**, que não se move nunca.

**2. Contagem medida por comando ("N citações", "N ferramentas", "N aulas").** Envelhece a cada
commit que acrescente ou remova material, tipicamente **dias**.

*Medido, agora:* `rag-auditado-ptbr/README.md:342` afirma "**2192 citações verificadas**, 0 inválidas". Rodei hoje:

```
$ node ferramentas/verify-citations.js --all
OK:        2193
PASS — 0 citações inválidas
```

Uma unidade de diferença, numa superfície viva. E `--all` exclui `avaliacao/`, `HANDOFF.md` e
`PROMPT-*`, então a diferença **não** veio do exame novo: veio de edição nas aulas.

*No lugar:* o **comando e o invariante**. "0 inválidas, apurado por `node
ferramentas/verify-citations.js --all`" não envelhece, porque é uma propriedade que o portão
mantém, e quem quiser o número o obtém em um segundo. O numeral só se escreve onde ele é o objeto
do texto, e aí vem com a data e o comando.

**3. Versão corrente de biblioteca ou de serviço ("a versão atual é X", "hoje o comportamento
é").** Envelhece pelo calendário de terceiros, **sem que ninguém do projeto faça nada**, em semanas
a meses.

*Medido:* das 8 vigiadas, **8 andaram** e **5 cruzaram versão maior**, entre elas `langchain-core`
de 0.3.33 para 1.6.3, o que transformou duas depreciações em remoção (Q04).

*No lugar:* a **versão junto do número, com a data e a classificação**. "Medido em `langchain-core`
0.3.33, que o repositório pina, em 15/09/2026" é uma afirmação que **não envelhece nunca**, porque
é sobre um par (versão, resultado) e não sobre o presente. É a diferença entre uma afirmação
datada, que continua verdadeira, e uma afirmação de presente, que expira.

**O padrão que atravessa as três**, e que é a lição transferível: **substitui-se a referência ao
estado atual pela referência ao que não se move.** Linha vira conteúdo; contagem vira comando;
"corrente" vira par datado. A regra prática é perguntar, antes de escrever um número, **quem
precisa agir para que isto fique falso**. Se a resposta for "eu, amanhã" ou "ninguém", a referência
está errada.

---

## Q26 `A`

**Falso, e a premissa contém o erro no lugar exato onde ela acha que está a garantia.** Medir por
comando estabelece a verdade da frase **num instante**. Um README afirma no **presente contínuo**:
ele descreve o projeto para quem chega, hoje, amanhã e daqui a três commits. As duas coisas não se
encontram, e "foi medido" é irrelevante para a segunda.

**Prova, e ela está no próprio repositório.** `rag-auditado-ptbr/README.md:342` afirma:

> Estado atual: **2192 citações verificadas, 0 inválidas**, mais 27 `SKIPPED` e 15 `NO_ANCHOR`

Rodei o comando hoje:

```
$ node ferramentas/verify-citations.js --all
OK:        2193
SKIPPED:   27
NO_ANCHOR: 15
PASS — 0 citações inválidas
```

**O número já está errado**, em uma superfície viva, e foi medido por comando quando foi escrito. E
o defeito não é do autor: é da **forma**. A frase começa com "Estado atual", que é uma promessa que
nenhum numeral pode cumprir, porque o estado muda por edição e o numeral não.

**Três agravantes, e o terceiro é o pior:**

- **A caducidade é muda.** Nada em `git status` muda, nenhuma suíte fica vermelha, nenhuma
  condição do DoD reprova. O `verify-citations.js` valida citações e não se valida a si mesmo no
  README. O número apodrece sem sinal.
- **Ele apodrece quando o projeto vai bem.** A contagem sobe porque aulas ganham citações, ou seja,
  **o trabalho correto é o que torna a frase falsa**. Um número que caduca em resposta a progresso
  está mal colocado.
- **Ele gasta credibilidade sem comprar nada.** O leitor do README não precisa saber se são 2192 ou
  2193; precisa saber que a verificação existe, que passa, e como rodá-la. O numeral é
  precisão sem função, e é a que fica errada.

**O que vai no README no lugar**, e as duas partes não caducam:

> As citações contra a fonte são verificadas por `node ferramentas/verify-citations.js --all`. O
> portão exige **zero inválidas**; `SKIPPED` e `NO_ANCHOR` são conferência à mão por desenho e não
> reprovam.

Isso é uma afirmação sobre o **critério** e sobre o **comando**, e ambos são estáveis. Quem quiser
o número o obtém em um segundo, e o obtém **correto**, que é mais do que o README pode oferecer.

**Onde o numeral é legítimo:** no registro, em `avaliacao/`, que cita o dia em que mediu, e em
qualquer frase que traga a data e o comando e fale no passado. "Em 15/09/2026, `--all` reportou
2193 OK" é verdadeiro para sempre. "Estado atual: 2192" foi verdadeiro por algumas horas.

---

## Q27 `F`

**Não é defeito.** A distinção que decide é **superfície viva** contra **registro**, e ela está
escrita e implementada, não é interpretação minha.

**Regra:** documento vivo descreve o estado atual, e citação envelhecida ali é defeito; registro de
auditoria cita o estado do dia em que mediu, e citação envelhecida ali está **certa**. É por isso
que o `entreaulas.js` varre as aulas mais os cinco documentos vivos da raiz e **não** varre
`avaliacao/`, e que o `superficies.js` separa os achados de `avaliacao/` sob a marca "NAO TOQUE".

**O caso concreto, medido.** `avaliacao/GATE-AULAS-v1.md:566` registra um achado da rodada de
auditoria:

> `:133` "Vale registrar aqui, **pela primeira vez no curso**, um achado" — falso: `AULA-04:100`,
> `AULA-09:191`, `AULA-10:169` e `AULA-13:196` **na versão anterior**; a palavra foi removida em
> `7d516c0` vêm antes

Hoje:

```
$ sed -n '196p' AULA-13-query-translation.md
  inventados, e a sonda arrasta a recuperação para documentos com números parecidos e errados.
```

Nenhuma relação com o achado. **E está certo**, por dois motivos que se somam: a própria linha do
GATE diz "na versão anterior" e **nomeia o commit** em que a mudança entrou, e o documento inteiro
é o registro de uma rodada que aconteceu numa data.

**Um segundo caso, e ele é mais agudo.** `avaliacao/GATE-AULAS-v1.md:4370` registra:

> apontava para `AULA-18:217`, correto quando escrito e envelhecido pela oitava rodada

```
$ sed -n '217p' AULA-18-compressao-crag.md
estado que a Aula 22 vai mostrar ser invisível em faithfulness.
```

Aqui o GATE **cita uma citação que ele mesmo declara quebrada**. O alvo não bater é a prova de que
o registro está correto. Consertá-lo para `:248` destruiria a frase, que existe justamente para
documentar que `:217` deixou de servir.

**O critério operacional, em uma pergunta:** o documento afirma "isto **é** assim" ou "isto **era**
assim quando medi"? A primeira é viva e tem de apontar para o presente. A segunda é registro, e
apontar para o presente é que seria falsificá-la.

**O limite da defesa, declarado.** Isto não é licença para qualquer citação em `avaliacao/`. Se uma
linha do GATE afirmasse **no presente** que a aula diz algo, e apontasse para linha que não diz,
seria defeito de registro: registro errado sobre o passado é tão ruim quanto documento vivo errado
sobre o presente. A isenção é para o envelhecimento **esperado** de uma referência datada, não para
erro de medição.

---

## Q28 `F`

**Dez condições. Vivem no `GATE`, e passaram a viver lá em 15/09/2026.**

`avaliacao/GATE-AULAS-v1.md:4770-4781`, na seção "O DoD não existia neste repositório, e agora
existe" (o título dela está em `:4763`, e cito a seção pelo título porque número de linha anda a
cada seção acrescentada):

| # | Condição | Como se decide |
| --- | --- | --- |
| 1 | Nenhuma aula abaixo de 6/12 | `node ferramentas/portao.js` |
| 2 | No máximo uma `−1` no curso | idem, com zero desconhecidas |
| 3 | Percentual apurado numa rodada completa das 29 | 29 notas com o mesmo identificador |
| 4 | Último lote verificado, **ou** parada pela régua registrada | a seção do GATE |
| 5 | Citações contra a fonte válidas | `verify-citations.js --all` = `PASS` |
| 6 | Citação de linha entre aulas válida | `entreaulas.js` = `PASS` |
| 7 | Sem resíduo verbatim | `residuo.js` sem achado não justificado |
| 8 | Ambiente reprodutível | script versionado, executado do zero |
| 9 | Ferramentas com teste próprio e positivo plantado | `rodar.sh` = `SUITE VERDE` |
| 10 | `HANDOFF` e `PROMPT-CONTINUAR` descrevem o estado medido | ler os dois, **item a item** |

**Onde elas vivem, e a história importa:** até 15/09/2026 as nove condições viviam **só no artefato
do plano publicado na claude.ai**, fora do alcance de qualquer ferramenta, enquanto o `HANDOFF`
citava "a condição 4 do DoD" e a definição não estava em lugar nenhum do acervo. O `GATE` registra
isso como "a quarta superfície ao contrário: o critério pelo qual o projeto se declara pronto
morava fora do que as ferramentas alcançam". São **dez** e não nove porque a 6 foi acrescentada
depois de o `entreaulas.js` existir.

**A que não é decidível por máquina: a 10.** "`HANDOFF` e `PROMPT-CONTINUAR` descrevem o estado
medido" exige comparar prosa com o mundo, e nenhum comando faz isso. O `ferramentas/dod.js` a
mantém **fora** da lista de condições avaliadas, num objeto `HUMANA` separado, e o comentário
explica por quê:

> A decima fica FORA da lista de propósito: misturá-la com as nove decidiveis é o que permite ler
> um "10/10" que ninguém conferiu.

**O comando que reporta as demais:**

```
$ node ferramentas/dod.js
```

Saída de hoje, verbatim no essencial:

```
  [ ok ]  1. Nenhuma aula abaixo de 6/12            [ ok ]  6. Citação de linha entre aulas válida
  [ ok ]  2. No máximo uma nota -1 no curso         [ ok ]  7. Sem resíduo verbatim
  [ ok ]  3. Percentual apurado numa rodada ...     [ ok ]  8. Ambiente reprodutível
  [ ok ]  4. Último lote verificado, OU parada ...  [ ok ]  9. Ferramentas com teste próprio ...
  [ ok ]  5. Citações contra a fonte válidas

  [ ?? ]  10. HANDOFF e PROMPT-CONTINUAR descrevem o estado medido
          NAO DECIDIVEL POR MAQUINA.

DOD: as nove decidíveis por máquina passam. A décima continua pendente de leitura.
Nove verdes NAO sao dez. A ultima e trabalho de ler, e nenhum verde a substitui.
```

**Nota sobre a condição 4, porque ela é um caso híbrido:** não se decide rodando um verificador, se
decide por presença de uma seção no GATE. O `dod.js` a implementa como `reguaRegistrada()`,
procurando o título "Onde esta rodada para, e por quê". É decidível por máquina, mas o que a máquina
decide é se o **humano registrou**, não se o registro é honesto.

---

## Q29 `J`

**Diagnóstico primeiro: isso é regresso infinito, e é defeito do DoD, não do trabalho.** A condição
4 dizia "todo lote de conserto teve verificação própria aplicada". Verificar produz achados,
achados produzem consertos, consertos ficam sem verificação, e a condição se reabre a cada vez que
se tenta fechá-la. **Um item de DoD que nenhuma execução satisfaz** não é uma barra alta: é uma
barra que não é uma barra, porque não distingue estado nenhum de estado nenhum.

**O que se faz, em ordem:**

1. **Nomear o mecanismo, não o sintoma.** Não é "difícil de cumprir", é **indecidível por
   construção**, e a diferença muda a solução: uma se resolve trabalhando mais, a outra não se
   resolve trabalhando.
2. **Perguntar o que a condição queria proteger.** Aqui: que a rodada não terminasse escondendo
   trabalho por fazer. Isso é legítimo e precisa sobreviver à reformulação.
3. **Reformular para algo decidível que preserve o propósito**, tipicamente trocando "o trabalho
   acabou" por "onde ele parou está registrado, com o pior achado da última passada". A forma nova:

   > **4. O último lote de conserto teve verificação própria aplicada, OU a rodada parou pela régua
   > de classe e isso está registrado aqui com o pior achado da última passada.**

4. **Conferir que a forma nova ainda reprova alguma coisa.** Uma reformulação que passa sempre
   trocou um item impossível por um item vazio, o que é pior: o primeiro ao menos era visível.
   Esta reprova quem para sem registrar onde parou e qual era o pior achado.
5. **Registrar a decisão no mesmo lugar em que o critério vive**, com a forma antiga, a nova e o
   motivo.

**O que se declara ao fazer, e é a parte que não se pode omitir:**

> **Mudar critério é decisão, não medição**, então fica explícito: eu afrouxei uma condição que não
> fechava, e a troquei por uma que fecha e continua dizendo algo.

**Quatro coisas nessa declaração, e cada uma fecha uma porta:**

- **"Decisão, não medição"** impede que a mudança apareça depois como se o projeto tivesse
  melhorado. O verde novo veio de mexer na régua, e quem ler precisa saber disso.
- **"Eu afrouxei"** nomeia a direção. Não é reformulação neutra: a barra desceu, e chamá-la de
  esclarecimento seria a forma educada de esconder.
- **"Uma condição que não fechava"** dá a justificativa objetiva, que é o que separa isto de
  baixar a barra por conveniência.
- **"E continua dizendo algo"** é a promessa verificável: a nova forma ainda distingue estados.

**O que eu NÃO faço:**

- **Não removo a condição.** O propósito dela era válido; o que falhou foi a formulação.
- **Não a deixo vermelha para sempre** "por honestidade". Um item que nunca fecha treina todo mundo
  a ignorar o relatório, e aí os itens que importam também deixam de ser lidos.
- **Não a declaro cumprida com a forma antiga.** Isso é exatamente o defeito que originou o
  `dod.js`: dar por cumprida a condição que ninguém conferiu.
- **Não troco o texto em silêncio.** Reformulação sem declaração é o mesmo ato com a evidência
  apagada, e o resultado é um DoD que passa sem que ninguém saiba por que passou a passar.

**Julgamento:** a assimetria decide. Afrouxar declaradamente custa uma seção de texto e mantém o
critério auditável. Afrouxar em silêncio é barato hoje e destrói o valor do DoD inteiro, porque a
partir daí nenhum verde significa nada, já que o leitor não sabe contra que régua ele foi medido.

---

## Q30 `A`

**Falso, e a premissa erra no denominador.** Não são nove condições: são **dez**. A frase "todas as
nove verificáveis por comando passaram" é verdadeira hoje, e "o projeto cumpriu o DoD" não segue
dela, porque a décima existe e não é verificável por comando.

**Medido agora:**

```
$ node ferramentas/dod.js
DOD: as nove decidíveis por máquina passam. A décima continua pendente de leitura.
Nove verdes NAO sao dez. A ultima e trabalho de ler, e nenhum verde a substitui.
$ echo $?
0
```

**E note o exit code: zero, com a décima pendente.** O `dod.js` sai 0 quando nenhuma das nove
reprova. Quem automatizar "DoD cumprido = exit 0" reconstrói exatamente o erro que a ferramenta
existe para impedir. O script diz a frase certa na saída padrão e o código de saída não a carrega.

**A décima:** "`HANDOFF` e `PROMPT-CONTINUAR` descrevem o estado medido". Não é decidível por
máquina porque exige comparar prosa com o mundo, item a item, nos dois arquivos que ela nomeia. O
`dod.js` a mantém deliberadamente fora da lista, e o comentário registra a razão de origem: foi
esta condição que alguém deu por cumprida tendo aberto **um** dos dois arquivos que ela nomeia,
julgando o conjunto em vez de ler o critério item a item.

**E há evidência medida de que a leitura ainda deve algo, hoje.** `rag-auditado-ptbr/README.md:342` afirma "2192
citações verificadas" e o comando de hoje devolve 2193 (Q26). O `README` não é um dos dois arquivos
que a condição 10 nomeia, então **isto não a reprova formalmente**. Mas é a mesma classe: um número
numa superfície viva que deixou de reproduzir, invisível para as nove condições, e exatamente o que
a leitura humana existe para pegar. **Aponto e não corrijo:** não é meu repositório para editar
nesta sessão, e o contrato desta prova proíbe escrever nos dois.

**Dois erros de fundo na premissa, além da contagem:**

**1. Confunde "as ferramentas fizeram a parte delas" com "está pronto".** O próprio `dod.js`
declara: "Zero reprovando com uma pendente de leitura NAO e 'pronto': e 'a maquina fez a parte
dela'."

**2. Confunde DoD com qualidade.** Cumprir o DoD é atingir o **piso** que o projeto declarou, não
demonstrar que o material é bom. As nove verdes de hoje convivem com a condição 2 medindo "no
máximo uma `−1`" e não zero, e com a condição 1 admitindo aula em 6/12. **Um piso satisfeito é um
piso satisfeito.**

**O que é verdade:** hoje, 15/09/2026, as nove condições decidíveis por máquina passam, a fonte não
andou, e a décima continua pendente de leitura humana. Quem quiser afirmar que o DoD está cumprido
precisa abrir o `HANDOFF` e o `PROMPT-CONTINUAR` e conferir cada número por comando. **Nenhum verde
substitui esse trabalho, e é por isso que ele foi desenhado para não parecer um verde.**
