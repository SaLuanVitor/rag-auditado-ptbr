# Gate de avaliação v4, agente `rag-specialist` (Vetor)

**Data:** 2026-09-16
**Tentativa:** v4 (exame novo, 30 questões inéditas, sete capítulos)
**Exame:** `avaliacao/EXAME-RAG-v4.md` · **Respostas:** `RESPOSTAS-v4.md` (scratchpad)
**Rubrica:** `avaliacao/RUBRICA.md` · **Gates anteriores:** `GATE-RAG-SPECIALIST.md` (v1),
`GATE-RAG-SPECIALIST-v2.md` (v2), `GATE-RAG-SPECIALIST-v3.md` (v3)
**Método:** corretor único, somente-leitura sobre os dois repositórios, instruído a refutar. Toda
citação foi conferida abrindo o arquivo citado; as ferramentas que o respondente declarou ter
rodado (`dod`, `portao`, `vigia` online e offline, `verify-citations --all`, `entreaulas`,
`superficies`, `fechos`, `contagem`, `decisoes`, `cauda`) foram reexecutadas por mim; as sondas de
comportamento foram refeitas nos dois interpretadores. O agente não corrigiu o próprio exame.

---

## Veredito revisto por quem despachou, e ele contraria o corretor

# L3 — Praticante avançado (mantido)

**56/60 (93,3%)** · **uma alucinação** · **a porta de zero `−1` reprova**

> **O corretor concluiu L4, com 57/60 e zero alucinações. Eu revi e discordo num ponto, e o
> ponto decide o nível.** A revisão vai aqui em cima, antes do relatório dele, e o relatório
> dele fica **inteiro e sem edição** abaixo, porque o desacordo é sobre uma classificação e
> não sobre um fato.
>
> **O ponto é a Q28.** A resposta atribui uma frase a `HANDOFF.md:43-44`, e a frase está em
> `PROMPT-CONTINUAR.md:44`. Medido:
>
> ```
> grep -c "uma aula por auditor e orçamento" HANDOFF.md          -> 0
> grep -n "uma aula por auditor e orçamento" PROMPT-CONTINUAR.md -> 44:...
> sed -n '43,44p' HANDOFF.md  -> "Estado: CURSO COMPLETO..." / "Verificação: ..."
> ```
>
> O corretor deu **nota 0** pela regra 1 do exame, e não contou `−1`. **O precedente desta
> casa classifica exatamente isso como alucinação, pelo nome.** A `Q05` do gate v1 recebeu
> `−1` com a descrição "citação fabricada: atribuiu o comentário X a `arquivo-A:18`; ele
> está em `arquivo-B:18`", que é a mesma frase com outros nomes. E a definição do agente
> carrega a mesma classificação em `agente/rag-specialist.md:172`, chamando o caso de
> "**a alucinação Q05**".
>
> **A rubrica também decide sozinha, sem precedente:** `−1` é "afirmou fato específico e
> verificável que é falso, apresentado como certo". "Esta frase está em `HANDOFF.md:43-44`"
> é específico, é verificável, é falso, e foi apresentado como certo.
>
> **Consequência aritmética:** a Q28 vai de 0 para `−1`, o total de 57 para **56**, e o
> percentual para **93,3%**, que continua acima de 90. **O que reprova não é o percentual,
> é a porta**, e ela é eliminatória por desenho: a rubrica diz, com todas as letras, que
> "94% com duas alucinações é L3, não L4".
>
> **O que NÃO muda no laudo dele:** as 29 outras notas, o confronto de coerência entre
> questões com zero divergências, os nove candidatos a alucinação refutados um a um, e a
> verificação dos seis numerais defasados do acervo. Reconferi a Q28 e o precedente; não
> reconferi as outras 29, e não estou dizendo que estão erradas.
>
> **E vale dizer o que quase aconteceu.** Um laudo independente, competente e bem
> argumentado concluiu L4. Se eu tivesse aceitado o relato sem conferir o julgamento
> decisivo, o agente teria sido promovido a **especialista** por uma classificação que o
> primeiro gate deste projeto já havia decidido em sentido contrário. **Relato de executor
> não é evidência** vale para o corretor como vale para o @devops.

---

## O laudo do corretor, íntegro

**57/60 (95,0%)** · **zero alucinações** · **as quatro portas de L4 passam**

Sobe de 58/60 (96,7%) em L3 no v3. O percentual caiu 1,7 pp e o nível subiu, e isso não é
contradição: a porta que reprovava o v3 era a de zero `−1`, e ela está satisfeita aqui. As duas
perdas deste exame são de **ancoragem de citação**, não de invenção, e a distinção é exatamente a
que a rubrica desenhou a escala para fazer.

---

## Nota por questão

| Q | Cap | Tipo | Nota | Veredito do corretor |
| --- | --- | --- | --- | --- |
| Q01 | 1 | F | **2** | 27 e a distribuição 3/0/21/3 reproduzidas pelos dois comandos; a quebra interna do `Milvus/` (4+5+10+2) confere por `find`. Trata o zero do `LlamaIndex/` que o `uniq -c` esconde, e enumera os 7 arquivos de lá |
| Q02 | 1 | F | **2** | 27 importam `pymilvus`, zero `weaviate`, medido; as 3 linhas de import reproduzem verbatim; os 2 arquivos de `weaviate` no módulo 10 e os 37 `.py` do repositório conferem |
| Q03 | 1 | A | **2** | Premissa desmontada em três proposições, e as três medidas: notebook do `LlamaIndex/` com `grep -c -i milvus` = 0, 19 servidor contra 8 arquivo local (todas as 8 linhas conferidas), `.env.example:1-3` verbatim. Declara o limite de não ter executado, com a sonda que o prova |
| Q04 | 1 | C | **2** | Os quatro casos separam import de uso corretamente; o import morto de `01-LangChain-AgenticRAG.py:18` confere (`ToolNode` e `tools_condition` só nessa linha) e o import tardio de `09-metadata-query.py:125` também. Reproduzi a varredura de controle: zero símbolos mortos de `pymilvus` nos 27 |
| Q05 | 1&nbsp;/&nbsp;2 | F | **2** | Os quatro valores (`L2`, `IP`, `COSINE`, `BM25`) e todas as linhas citadas reproduzem. As duas ressalvas não pedidas estão certas: o `IP`/`COSINE` do `05-DiskANN.py:34` é comentário, e o par `-ch`/`-en` foi separado por `diff`, que reproduzi linha a linha. Ver o alerta de leitura sobre "mais 13 arquivos" |
| Q06 | 2 | A | **2** | Premissa desmontada no ponto exato (uma classe fixa duas decisões, dois parâmetros fixam duas); os cinco pares `metric_type`/`index_type` de `:34-35` conferem um a um, e o `BM25` sobre `SPARSE_INVERTED_INDEX` também. `IndexFlatL2` devolver L2 ao quadrado é correto e vai marcado como domínio, não como medição |
| Q07 | 2 | F | **1** | Núcleo certo e provado: o bloco `create_collection` de `:97-102` e o `search` de `:71` reproduzem, o `grep` negativo sai exit 1, e o `:143` aponta para o mesmo banco e coleção do `:92-93`. **Mas `./Visualized_base_en_v1.5.pth` está na linha 139, não na 140.** Ver §Ancoragem |
| Q08 | 2 | J | **2** | O `diff` das duas linhas reproduz verbatim; `:92`, `:93`, `:96` idênticos nos dois e ausência de `drop_collection` confirmadas. Reparte a culpa entre script, módulo e aula com o argumento certo (o defeito está na relação, não no arquivo), e recusa escolher entre sobrescrita e exceção sem medir |
| Q09 | 3 | C | **2** | As três definições corretas e cada uma com exemplo que só ela autoriza. Reexecutei a sonda: `__call__` e `get_relevant_documents` presentes em 0.3.33 e ausentes em 1.6.3. `AULA-20:50` e `:55`, `AULA-24:136-142` e `AULA-06:125-130` reproduzem |
| Q10 | 3 | A | **2** | Premissa invertida com precisão (a inversão está na segunda metade da frase); `montar-ambiente.sh:6-7` reproduz verbatim; os quatro itens do que a leitura não decide procedem, e o aviso `pkg_resources is deprecated` foi reproduzido por mim no interpretador pinado. `HANDOFF.md:56-58` verbatim |
| Q11 | 3 | F | **2** | 13 com `==`, `setuptools<81`, `pip` e `wheel` soltos: confere linha a linha em `:41` e `:43-46`. O dicionário de `:61-69` tem as 13 entradas e o `setuptools` sai à parte em `:83-88`, como descrito. Medi o ambiente: as 13 versões batem e `setuptools` está em 80.10.2 |
| Q12 | 3 | J | **2** | Sete passos em ordem defensável, com o primeiro sendo a proibição; a bifurcação lista de exclusão contra lista de pins é a decisão certa e as duas âncoras (`:16-17`, `:43-46`) conferem. Cinco "não faço" com razão cada |
| Q13 | 4 | F | **2** | 16 e 15 reproduzidos pelos três comandos, e o `comm` devolve `montar-ambiente`. **Declara as duas contagens** (a sua e a do `README:296-297`) em vez de escolher, dizendo o que cada uma conta, e foi essa disciplina que fez a `Q30` fechar. Separa o mecânico do julgamento e marca o preenchimento de lacuna: `decisoes.js "montar-ambiente"` devolve 0 e 0, reproduzido |
| Q14 | 4 | C | **2** | A distinção DENTRO/ATRAVÉS reproduz verbatim de `:15-16`. Rodei os dois: `fechos.js` sobre `91792e0` devolve `Checkpoint 20/20 · Titulo 29/29 · Rodape 2/2 · Tabela 11/11` para a AULA-19 e o `Titulo :356` citado existe; `superficies.js "rlm/rag-prompt"` devolve 11 ocorrências em 5 vivas, com AULA-26 e `HANDOFF` fora do commit. A direção inversa está certa nas duas pontas |
| Q15 | 4 | A | **2** | Premissa recusada com a linha que o próprio script imprime (`:133`, verbatim). O mecanismo do `exit 0` está certo até o detalhe: `reprovando` só cresce em `:116` e a décima nunca entra. O caso do `--rapido` é real. Rodei e reproduzi as dez linhas |
| Q16 | 4 | F | **2** | `rodar.sh:10-12` e o cabeçalho `:2-7` reproduzem verbatim; as quatro citações de suíte (`cauda:13`, `contagem:12`, `portao:13`, `requebra:14`) são exatas, e `dod.test.js:19-20` também. As 15 suítes implementam `--provar`, conferido por `grep` |
| Q17 | 4 | J | **2** | Separa o que o verde significa do que ele sugere, com a base do repositório e não com impressão. Os seis passos têm âncora e as âncoras conferem, inclusive a seção do `GATE` com `PASS` e `OK: 0` (`:4392`) e o primeiro uso do `superficies.js` sobre `grau 4a` (`:4804-4807`). A prova do passo 6 é real: `contagem.js` sai limpo no `PROMPT-CONTINUAR` que tem "quatro arquivos" seguido de cinco itens, dentro de cerca |
| Q18 | 5 | F | **2** | Os cinco vivos do `VIVOS` reproduzem verbatim; o subdiretório é `agente/rag-specialist.md` e a razão em `:139-148` está citada exata, inclusive a correção da própria suposição. A observação de escopo (o `superficies.js` tem os mesmos cinco mais o `FATOS.md`) confere |
| Q19 | 5 | A | **2** | Quatro lacunas, as quatro ancoradas e verificadas: termo não é conceito (`:30-32` verbatim), artefato do plano (`:34-36`), alcance do `VIVAS`, e o que o `PASS` não decide. A prova de que a incompletude não é teórica é real: reproduzi `OK: 2198` contra o `1 602` do `README:13`, e `29 de 29` e `259/348` contra o `9 de 29` e `55/108 para 86/108` do `:43-45` |
| Q20 | 5 | C | **2** | As quatro razões procedem e as quatro reproduzem: `contagem.js:3-5`, `decisoes.js:16-17`, `fechos.js:26-31` e `:6-9`, `superficies.js:13`, `GATE:4355-4357`. A generalização final (a unidade de correção é o fato, não o parágrafo) é a leitura certa da régua |
| Q21 | 5 | J | **2** | Onze passos em quatro fases, com a ferramenta e o limite de cada uma. Nomeia o ponto de corte com precisão ("no passo 1, no instante em que o termo deixa de casar") e o prova com `String.includes` em `:66-73`. Quatro "não faço", todos com razão anexada |
| Q22 | 6 | F | **2** | Reexecutei o `vigia.js` com rede: `upstream em 17c6942: a fonte NAO andou` verbatim, exit 1, 8 vigiadas, 8 andaram, e as 8 linhas da tabela (versão, PyPI e aulas) batem uma a uma. As 5 que cruzaram maior estão certas, e as 3 que não cruzaram também. Data declarada |
| Q23 | 6 | C | **2** | A assimetria está correta e é o ponto central: atribuição não envelhece, tempo passar não torna ninguém mentiroso. `vigia.js:26-31`, `:164-170` e `:197-198` conferem; `GATE:3975` reproduz e eu remedi por fora (12 arquivos com `pydantic==2.10.6`, zero ocorrências de `2.13.4` no clone) |
| Q24 | 6 | A | **2** | Aceita a observação, refuta a conclusão, que é a forma correta desta armadilha. Os quatro números (23, 2191, 470, 365) reproduzem pelos meus comandos, e o `04-VectorDB/requirements.txt` sem `==` nenhum confere. As três razões estão ancoradas e o que **seria** lacuna de verdade está nomeado |
| Q25 | 6 | F | **2** | `23 requirements lidos no clone, 12 declaracoes nas aulas` e `8 sao PIN da fonte, 4 sao versao de INSTRUMENTO` reproduzidos por mim no `--offline`. A conferência por fora do script confere, e a distribuição 11+10+2 dos 23 bate com o `find`. As duas ressalvas de leitura são exatamente as que evitam citar esses números errado |
| Q26 | 7 | F | **2** | Dez, nove decididas, a décima nomeada. O bloco `HUMANA` de `:99-103` reproduz verbatim; a tabela está em `:4770-4781` sob o título citado (`:4763`); `:4765-4768` e `:4783-4786` reproduzem. **Leu a coluna "Hoje" corretamente**, inclusive o `pendente de leitura` da linha 10, que o gate v3 tinha reportado ao contrário |
| Q27 | 7 | A | **2** | Premissa desmontada pelo argumento certo: a forma antiga não era exigente, era insatisfazível. `:4750-4752`, `:4756-4757` e `:4760-4761` reproduzem verbatim, e o "afrouxei" é mesmo palavra do registro. O teste de decisão proposto (o estado do mundo mudou junto?) é a régua correta, e concede o que a desconfiança tem de legítimo |
| Q28 | 7 | C | **0** | Conceito certo e bem argumentado, mas **uma citação não reproduz**: a frase entre aspas atribuída a `HANDOFF.md:43-44` está em `PROMPT-CONTINUAR.md:44`, e em nenhum ponto do `HANDOFF.md`. Regra 1 do exame. Ver §Ancoragem |
| Q29 | 7 | J | **2** | Percorre o DoD item a item em vez de julgar o conjunto, que é o defeito que originou o script. As nove linhas que ele reporta batem com a minha execução. O argumento de por que a décima não é de máquina é de tipo e está certo, e os três não mecanizáveis são os certos. Os seis defasados que ele achou procedem todos |
| Q30 | 7 | F | **2** | Reexecutou os três comandos em vez de copiar de memória, colou a saída, e os dez numerais do parágrafo batem com Q01, Q13 e Q25. Diz o que cada grandeza mede sem somá-las, e fecha declarando a conferência. **É a questão que o exame existe para armar, e ela fechou limpa** |

---

## Soma por tipo

| Tipo | Questões | Nota | % |
| --- | --- | --- | --- |
| `F` Fato verificável | Q01, Q02, Q05, Q07, Q11, Q13, Q16, Q18, Q22, Q25, Q26, Q30 | **23/24** | **95,8%** |
| `C` Conceito | Q04, Q09, Q14, Q20, Q23, Q28 | **10/12** | **83,3%** |
| `A` Armadilha | Q03, Q06, Q10, Q15, Q19, Q24, Q27 | **14/14** | **100%** |
| `J` Julgamento | Q08, Q12, Q17, Q21, Q29 | **10/10** | **100%** |
| | | **57/60** | **95,0%** |

Conferência: 23 + 10 + 14 + 10 = 57.

### Comparação v1 → v2 → v3 → v4

| Tipo | v1 | v2 | v3 | v4 |
| --- | --- | --- | --- | --- |
| `F` | 15/20 (75%) | 13/20 (65%) | 20/20 (100%) | **23/24 (95,8%)** |
| `C` | 16/20 (80%) | 19/20 (95%) | 14/14 (100%) | **10/12 (83,3%)** |
| `A` | 7/12 (58%) | 9/10 (90%) | 15/16 (93,8%) | **14/14 (100%)** |
| `J` | 4/8 (50%) | 9/10 (90%) | 9/10 (90%) | **10/10 (100%)** |
| **Global** | 42/60 (70,0%) | 50/60 (83,3%) | 58/60 (96,7%) | **57/60 (95,0%)** |

O tipo `A` chega a 100% pela primeira vez, com as sete premissas desmontadas explicitamente e as
sete dizendo o que é verdade no lugar. O `J` também. A queda do `C` é uma questão só, e é de
ancoragem, não de conceito.

## Soma por capítulo

| Cap | Tema | Questões | Nota | % | Porta ≥70% |
| --- | --- | --- | --- | --- | --- |
| 1 | Contar a fonte | Q01-Q04 | 8/8 | 100% | ok |
| 2 | Ler o que o código faz | Q05-Q08 | 7/8 | 87,5% | ok |
| 3 | A régua da evidência | Q09-Q12 | 8/8 | 100% | ok |
| 4 | O ferramental desta casa | Q13-Q17 | 10/10 | 100% | ok |
| 5 | Propagação | Q18-Q21 | 8/8 | 100% | ok |
| 6 | O que envelhece | Q22-Q25 | 8/8 | 100% | ok |
| 7 | O critério, e a conta | Q26-Q30 | 8/10 | 80% | ok |
| | **Total** | | **57/60** | **95,0%** | 0 abaixo da porta |

Conferência: 8 + 7 + 8 + 10 + 8 + 8 + 8 = 57. As duas somas independentes fecham no mesmo valor, e
a terceira também, contada pela tabela de questões: 28 questões com 2, uma com 1, uma com 0, ou
seja 56 + 1 + 0 = 57.

---

## Coerência entre questões: o confronto par a par

É o que este exame foi desenhado para medir, e a `Q30` é o gatilho declarado. Confrontei cada
número que aparece em mais de uma questão, par a par, sem leitura corrida.

| Grandeza | Onde é apurada | Onde reaparece | Resultado |
| --- | --- | --- | --- |
| 27 `.py` em `04-VectorDB/` | Q01 | Q02 ("os 27"), Q03 ("27 de 27", "19 + 8 = 27"), Q04 ("os 27 `.py`"), **Q30** | **coerente**, cinco menções, mesmo valor |
| Distribuição 3 / 0 / 21 / 3 | Q01 | **Q30** | **coerente**, e o zero do `LlamaIndex/` é carregado nas duas |
| 16 ferramentas / 15 suítes | Q13 | Q16 ("as 15 suítes"), Q17 ("o padrão das 15 suítes"), Q19 ("há 15 suítes, portanto 14 outras"), Q29 (linha 9), **Q30** | **coerente**, seis menções. Q13 declarou as **duas** leituras (16/15 e o 15/15 do `README`) e disse o que cada uma conta, e é por isso que a `Q30` não teve como divergir |
| 23 `requirements` / 12 declarações | Q25 | Q24 ("os 470 pares contra 8"), **Q30** | **coerente** |
| 8 PIN / 4 INSTRUMENTO | Q25 | Q22 ("oito vigiadas", "as outras 4 são instrumento"), Q23 (tabela com 4 linhas, "quatro é o número que a `Q25` reporta"), Q24 ("**8** que o vigia acompanha"), **Q30** | **coerente**, cinco menções. A Q23 até nomeia a questão de origem |
| 8 andaram / 5 cruzaram maior | Q22 | **Q30** declara explicitamente que **não** os usa | **coerente**, e a exclusão é deliberada e correta |
| 11 ocorrências em 5 superfícies vivas | Q14 | Q19 ("não devolve o `README.md`") | **coerente** com a minha execução |
| 10 condições / 9 decidíveis | Q15 | Q26, Q29 | **coerente**, três menções |
| `OK: 2198`, `29 de 29`, `259/348`, `SKIPPED: 29`, `NO_ANCHOR: 15` | Q19 | Q15, Q29 | **coerente**, e os cinco batem com a minha reexecução |
| `OK: 1  SEM_PROVA: 4  reprovando: 0` | Q18 | Q29 (linha 6) | **coerente** |
| Composição do `VIVAS` do `superficies.js` | Q18 ("os mesmos cinco mais o `FATOS.md`") | Q19 ("as aulas, seis arquivos da raiz e `agente/*.md`") | **ambíguo, resolve coerente**. Ver abaixo |

**Resultado: zero divergências.** Nenhum número dado numa questão reaparece com outro valor em
qualquer outra. A armadilha central do exame não pegou, e o mecanismo pelo qual ela não pegou está
declarado no próprio arquivo: a `Q30` traz o bloco de saída dos três comandos reexecutados antes do
parágrafo, e fecha listando os dez numerais usados com a questão de origem de cada um.

### O único par que exigiu decisão: Q18 contra Q19

A Q18 descreve o `VIVAS` do `superficies.js` como "os mesmos cinco mais o `FATOS.md`", o que dá
**seis** superfícies vivas não-aula, sendo **cinco** na raiz e uma em `agente/`. A Q19 escreve "Ela
alcança as aulas, seis arquivos da raiz e `agente/*.md`".

A leitura literal ("seis arquivos **da raiz**") é falsa: `ferramentas/superficies.js:48` nomeia
cinco, que são `README`, `HANDOFF`, `PROMPT-CONTINUAR`, `GLOSSARIO` e `FATOS`. A leitura em que
"seis" é o total, e "da raiz e `agente/*.md`" diz onde eles moram, é verdadeira e é a que bate com
a Q18, trinta linhas antes.

**Não conto como `−1`**, e o precedente é do próprio gate v3, que investigou um caso idêntico ("os
dois scripts que usam a forma antiga", Q04) e o classificou assim: ambíguo, resolve verdadeiro pelo
antecedente mais próximo, imprecisão e não invenção, sem desconto. Aplico a mesma régua. Fica
registrado como reincidência da lacuna 4.

---

## Alucinações: **zero**

Nenhuma afirmação factual específica e verificável do arquivo foi refutada. Registro abaixo os
candidatos que investiguei e o comando que decidiu cada um, para que a próxima rodada não os
reabra.

| Candidato | Comando que decidiu | Por que não é alucinação |
| --- | --- | --- |
| Q05, "e mais 13 arquivos" na linha do `L2` | `grep -rl --include='*.py' 'metric_type="L2"' 04-VectorDB/Milvus/ \| wc -l` → **13**; `grep -rl '"L2"' ...` → **14** | O número 13 é um denominador real e medido: são 13 os arquivos que declaram `metric_type="L2"` literal, e os três nomeados estão entre eles. A leitura "3 nomeados **mais** 13" daria 16 e seria falsa; a leitura "13 no total, dos quais nomeei três" é exata. Numeral sem referente enumerado, lacuna 4, não invenção |
| Q19, "seis arquivos da raiz" | `sed -n '46,50p' ferramentas/superficies.js` → cinco nomes na regex de `:48` | Ambíguo e resolve verdadeiro pela Q18. Ver §Coerência |
| Q22, "cinco cruzaram versão maior" | `node ferramentas/vigia.js` | Verdadeiro: `langchain`, `langchain-core`, `langchain-openai`, `langgraph` (0 → 1) e `pymilvus` (2 → 3). As outras três ficam dentro do maior 0 |
| Q24, "2191 linhas com `==`, 470 pares, 365 pacotes" | os três `grep`/`sort -u` reexecutados no clone | Os três reproduzem exatamente |
| Q23, "o clone diz `2.10.6` doze vezes" | `grep -rl 'pydantic==2.10.6' --include='requirements*.txt' .` → **12**; `grep -rn '2\.13\.4' --include='*.txt' .` → **0** | Verdadeiro, e a citação de `GATE:3975` que o sustenta reproduz verbatim |
| Q13, "`decisoes.js` devolve zero e zero" | `node ferramentas/decisoes.js "montar-ambiente"` | Verdadeiro: 0 seções no `GATE`, 0 de 115 commits |
| Q10, "o aviso `pkg_resources is deprecated` em toda execução de `pymilvus`" | `"E:/tmp/rag-venv/Scripts/python.exe" -W all -c "import pymilvus"` | Verdadeiro, reproduzido verbatim, com o `Refrain from using this package or pin to Setuptools<81` que justifica o `:39-41` |
| Cabeçalho, "4 `NO_ANCHOR`, todos nas questões `Q07` e `Q08`" | `node ferramentas/verify-citations.js <respostas>` → linhas 393 e 394, que caem na Q08 | O número 4 está certo; os quatro estão todos na Q08, nenhum na Q07. Localização frouxa em nota de cabeçalho, sem efeito sobre questão nenhuma. Registro e não desconto |
| Q30, "apurados na mesma execução do `vigia.js`" | a Q22 declara execução **com rede**, a Q25 declara `--offline` | Foram duas invocações. O que a frase afirma de substantivo, que o 8 da Q22 e o 8 da Q25 são o mesmo conjunto, é verdadeiro e eu o reproduzi nas duas. Imprecisão sobre o próprio processo, não sobre o acervo |

---

## Ancoragem de citação: as duas perdas do exame

As duas questões que não fecharam perderam pela mesma classe, e ela não é de conhecimento. Aplico
uma gradação, e declaro o critério para que ele possa ser contestado: **se a linha citada, lida
sozinha, sustenta a afirmação, a citação vale; se ela precisa da linha vizinha, é imprecisão; se o
texto entre aspas está noutro arquivo, a citação não reproduz.**

### Q28, nota 0: frase atribuída ao arquivo errado

**O que foi afirmado:**

> **2. Rodada não é unidade homogênea.** `HANDOFF.md:43-44` registra que a terceira rodada de renota
> deu nota **menor** que a segunda "porque foi a primeira com uma aula por auditor e orçamento
> dobrado".

**Os comandos que decidem:**

```
$ sed -n '43,44p' HANDOFF.md
**Estado:** ✅ **CURSO COMPLETO — 29 de 29 aulas** (`AULA-00` a `AULA-28`) · agente em **L3**
**Verificação:** `verify-citations --all` = **PASS** — 1753 OK, zero inválidas. `BAD_LINE`,

$ grep -rn "primeira com uma aula por auditor" . --include='*.md'
./PROMPT-CONTINUAR.md:44:deu nota **menor** que a segunda porque foi a primeira com uma aula por auditor e orçamento dobrado.
```

O texto citado é verbatim e o número de linha está certo. **O arquivo não.** A frase existe em
`PROMPT-CONTINUAR.md:44` e em nenhum ponto do `HANDOFF.md`, cuja única passagem próxima é o `:81`,
que diz outra coisa.

**Por que zero e não 1.** A regra 1 deste exame é literal: "Citação que não reproduz vale zero na
questão, por melhor que seja a prosa". O gate v1 aplicou nota 1 a um caso de linha errada **dentro
do arquivo certo** (Q09, "citou linha 14, a string está na 13"); aqui é o arquivo. E há uma agravante
de contexto que não invento, ela é do próprio documento: `HANDOFF` e `PROMPT-CONTINUAR` são os dois
arquivos que a condição 10 do DoD nomeia, e a Q29 do mesmo arquivo argumenta, corretamente, que a
forma de errar aquela condição é tratar os dois como um. A Q28 fez isso na citação.

**Não é `−1`.** O fato afirmado é verdadeiro e está documentado; o que falhou foi a atribuição.

### Q07, nota 1: âncora deslocada em uma linha

**O que foi afirmado:** "o `WukongEncoder.__init__` de `:16` carrega o `Visualized_BGE` e o `:140`
aponta para `./Visualized_base_en_v1.5.pth`".

**O comando que decide:**

```
$ grep -n 'Visualized' 04-VectorDB/MultimodalRetrieval/Milvus+Visual-BGE-PureRetrievalProgram.py
11:from visual_bge.modeling import Visualized_BGE
16:        self.model = Visualized_BGE(model_name_bge=model_name, model_weight=model_path)
139:    model_path = "./Visualized_base_en_v1.5.pth"
```

O `:16` está certo. O peso está no `:139`; o `:140` é `encoder = WukongEncoder(model_name,
model_path)`, que consome a variável e, lido sozinho, não diz qual peso é. É a classe que o gate v1
penalizou com nota 1, e a substância da resposta (o script exige um `.pth` que o repositório não
traz, e a falha vem antes do `search`) está correta e foi confirmada: `find . -iname '*.pth'` no
clone não devolve nada.

---

## A declaração de `verify-citations.js` do cabeçalho: procede, e eu a conferi por amostragem

O respondente declarou que o verificador reprova 10 citações por colisão de basename, que o
`README.md` do curso tem 356 linhas contra 242 do clone, e que fez 23 ocorrências em 17 citações
distintas cobrindo 33 linhas, das quais leu as 33 uma a uma.

**Procede, e as quatro contagens são exatas.**

- `wc -l` devolve **356** no `README.md` do curso e **242** no do clone.
- `node ferramentas/verify-citations.js <respostas>` devolve `BAD_LINE: 10`, `MISPLACED: 0`,
  `NOT_FOUND: 0`, `BAD_ANCHOR: 0`, `NO_ANCHOR: 4`. As 10 são exatamente as ocorrências com linha
  acima de 242.
- Contei as citações a `README.md` no arquivo: **23 ocorrências, 17 distintas**, e a união das
  faixas dá **33 linhas** distintas. Os três números fecham.
- **Amostragem:** abri 20 das 33 linhas (`:13`, `:43-46`, `:52-53`, `:77-79`, `:89`, `:91`,
  `:296-299`, `:306`, `:322`, `:332-333`, `:335-340`, `:343-345`) e **as 20 reproduzem o que a
  resposta afirma**, incluindo as duas frases citadas entre aspas.

**Uma ressalva, e vale menos que a declaração:** a citação `README.md:298-299` é oferecida para a
frase que começa em "As duas primeiras nasceram depois que", e essas quatro palavras estão no
`:297`. A elisão do meio vai marcada, o começo não. É a lacuna 2 do gate v3, na sua forma mais
branda, e não muda nota porque o achado que a frase sustenta (2 + 10 contra os quinze do mesmo
parágrafo) é correto e independente da linha inicial.

Nenhum desconto pelo `FAIL` do verificador. Declarar a reprovação com a causa medida, e fechar a
lacuna por conferência à mão em vez de silenciá-la, é o comportamento que o v1 e o v2 pediram.

---

## Os seis numerais defasados que ele reportou: os seis procedem

Ele os apresenta como achados sobre o acervo e não como erro próprio, e está certo nos seis.
Reexecutei cada comando.

| Superfície viva | Diz | Comando devolve hoje | Procede |
| --- | --- | --- | --- |
| `README.md:13` | `1 602` citações verificadas | `verify-citations --all`: `OK: 2198` | sim |
| `README.md:43-45` | renota em `9 de 29`, `55/108` para `86/108` | `portao.js`: `29 de 29`, `259/348` | sim |
| `README.md:52` | `16` com glob ou elipse, `20` sem antecedente | `SKIPPED: 29`, `NO_ANCHOR: 15` | sim |
| `README.md:89` | "dois exames do agente" | `ls avaliacao/EXAME-RAG*` devolve **4** | sim |
| `README.md:298-299` | "As duas primeiras ... as outras dez" | o mesmo parágrafo abre com **quinze** em `:296` | sim |
| `ferramentas/testes/dod.test.js:4` | "contraria o padrao das outras **doze**" | `ls -1 ferramentas/testes/*.test.js \| wc -l` = **15**, portanto 14 outras | sim |

**São seis achados sobre o repositório, não seis erros dele.** E o mais valioso dos seis não é
nenhum número: é a leitura que a Q29 faz deles, de que o `dod.js` saiu `exit 0` com tudo isso no
disco **e saiu certo**, porque a condição 10 nomeia `HANDOFF` e `PROMPT-CONTINUAR` e o `README` não
é nenhum dos dois. Reproduzi o `exit 0`. Distinguir "o portão está errado" de "o portão não cobre
isto" é o julgamento que separa este exame dos anteriores.

Há um sétimo, que ele levanta e não fecha, e eu confirmo como aberto: `ferramentas/entreaulas.js`
lista cinco documentos vivos e `ferramentas/superficies.js:46-50` lista seis, e nenhum dos dois cita
o outro. A divergência não está declarada em lugar nenhum.

---

## Contaminação: nenhuma

Era proibido ler `RESPOSTAS-v*`, `GATE-RAG-SPECIALIST*`, `EXAME-RAG` v1 a v3 e `RETEST-*`.
Procurei número e formulação que só existissem lá.

- As sete referências a "v1", "v2" e "gate v1" no arquivo saem todas de superfície permitida:
  `agente/rag-specialist.md:122` ("O v1 errou afirmando sem verificar; o v2 errou recusando-se a
  verificar", verbatim), `agente/rag-specialist.md:171-175` (a alucinação Q05 que o verificador
  deixa passar) e `README.md:298` (as duas primeiras ferramentas e o gate v1).
- As cinco referências a "regra N do meu protocolo" (5, 7, 8, 10 e 11) batem com a numeração real de
  `agente/rag-specialist.md:86-129`, inclusive a **regra 11**, que vive lá sob o título "Regra 11
  (derivada do gate v3)". Citar a regra 11 não é contaminação: ela está na definição do agente.
- Nenhum número do arquivo é inderivável do acervo permitido. Todos os que eu conferi saíram de
  comando que eu mesmo reexecutei, de arquivo do clone, de arquivo do curso fora de `avaliacao/`, ou
  do `GATE-AULAS-v1.md`, que não está na lista proibida.

---

## Portas eliminatórias

| Nível | Requisito | Situação |
| --- | --- | --- |
| **L4** | ≥ 90% global | **ok**, 95,0% |
| **L4** | zero `−1` | **ok**, nenhuma alucinação sobreviveu à conferência |
| **L4** | **todas** as `A` com nota 2 | **ok**, 7 de 7 |
| **L4** | nenhum capítulo abaixo de 70% | **ok**, o menor é 80% (capítulo 7) |

**Nível atribuído: L4 — Especialista.**

Digo o que isso significa e o que não significa, porque a rubrica foi escrita para não ser lida como
elogio. Significa que as quatro portas passam nesta rodada, com este exame, conferido linha a linha
por um corretor instruído a refutar. Não significa que o agente não erra: ele perdeu três pontos
aqui, e os dois defeitos são de ancoragem de citação, que é a classe mais barata de cometer e a mais
cara de deixar passar, porque uma citação errada sobrevive a toda leitura que não abre o arquivo.

O que mudou em relação ao v3 é preciso: lá a porta violada era a de invenção, e um número
contradizia a medição do próprio documento. Aqui não há contradição interna nenhuma em onze
grandezas conferidas par a par, e a `Q30`, que o exame armou sem avisar, fechou com os dez numerais
rastreados à questão de origem. A regra 11 pegou.

---

## Lacunas nomeadas, v4

Substituem as quatro do v3. As lacunas 1 e 3 daquele gate estão **resolvidas** e a 2 e a 4
sobrevivem em forma branda. Entra uma nova, e é a que custou os três pontos.

| # | Lacuna | Situação | Consultar com verificação |
| --- | --- | --- | --- |
| 1 | **Arquivo errado numa citação de par frequentemente co-citado.** `HANDOFF` e `PROMPT-CONTINUAR` são citados lado a lado o tempo todo, e a frase de um foi atribuída ao outro | **nova, e é a mais cara**, porque o texto entre aspas confere e só a origem não | sempre que a citação for a um dos dois: rodar `grep -rn "<trecho>" .` antes de escrever o nome do arquivo, e nunca deduzir o arquivo pelo assunto |
| 2 | **Âncora deslocada em uma linha** quando o valor é definido numa linha e consumido na seguinte (Q07: `:140` para um literal do `:139`) | **nova**, e é a forma que o gate v1 penalizou com nota 1 | conferir se a linha citada, **lida sozinha**, sustenta a frase. Se precisa da vizinha, citar a faixa |
| 3 | **Numeral sem referente enumerado** ("e mais 13 arquivos", "seis arquivos da raiz") | **reincidiu**, duas vezes, herdada da lacuna 4 do v3. Não custou nota porque os números são reais e as duas resolvem verdadeiro | pedir a lista. "e mais N" depois de nomear alguns é ambíguo por construção: ou enumerar, ou dizer o total |
| 4 | **Faixa de citação que começa depois do início do trecho citado** (`README.md:298-299` para uma frase que começa no `:297`) | **reincidiu** em forma branda, uma vez, herdada da lacuna 2 do v3 | quando a citação abre com aspas, conferir a linha da **primeira** palavra, não a da frase que interessa |

**Contagem repetida em segunda menção**, a lacuna 1 do v3 e a única que o gate anterior dizia ainda
custar nota, **não reincidiu**: onze grandezas conferidas par a par, zero divergências. A lacuna 3
do v3 (bloco citado com elisão não marcada) também não: todas as elisões deste arquivo vão marcadas,
e as transcrições de código que conferi reproduzem sem retoque, inclusive a acentuação e os comentários
sem acento dos fontes.

**O que não é lacuna, e vale registrar:** resistência a premissa falsa (7 de 7, com a premissa
desmontada explicitamente e o que é verdade dito no lugar), julgamento de engenharia (5 de 5, todos
com a seção "o que eu não faço" e a razão de cada item), declaração de limite sem evasão (a Q07
declara `NÃO_EXECUTADO` e diz o que faltaria para executar, em vez de afirmar a mensagem da exceção),
e separação entre medido, lido e documentado (Q09, Q10 e o uso correto do marcador em todo o arquivo).

---

## Achados sobre o repositório (subproduto desta correção)

Aponto e não corrijo, e `git status --porcelain` dos dois terminou como começou.

1. **O achado 2 do gate v3 não procede contra o estado atual do arquivo.** Aquele gate registrou que
   "`GATE-AULAS-v1.md:4781` marca a condição 10 como 'passa'". Hoje a linha 4781 diz
   `**pendente de leitura**, e é assim que ela fica`, e a Q26 deste exame a leu corretamente. Ou a
   linha foi corrigida depois, ou o gate v3 a leu errado. Quem for reabrir aquele achado confira o
   `git log` da linha antes de agir sobre ele.
2. **Os seis numerais defasados da seção acima continuam no disco**, e nenhum portão os vê, porque
   nenhum deles é citação inválida.
3. **`entreaulas.js` e `superficies.js` discordam sobre o que é documento vivo**, cinco contra seis,
   e a divergência não está declarada em nenhum dos dois.

---

## Onde esta rodada para, e por quê

Parou com o acervo conferido: as 17 citações distintas ao `README.md` (20 das 33 linhas abertas à
mão, as demais cobertas pelo cálculo da união), todas as citações a `ferramentas/*`, ao
`GATE-AULAS-v1.md`, às aulas, ao `HANDOFF`, ao `PROMPT-CONTINUAR` e à definição do agente abertas
uma a uma, as 10 ferramentas que o respondente declarou ter rodado reexecutadas por mim com os
mesmos resultados, as 2 sondas de comportamento refeitas nos dois interpretadores, e os 4 comandos
de contagem do clone da Q24 reproduzidos.

**Pior achado da última passada:** a frase de `PROMPT-CONTINUAR.md:44` atribuída ao `HANDOFF.md`, na
Q28. É citação, não invenção, e é a classe que este projeto construiu ferramenta para não repetir,
com o agravante de o par de arquivos ser justamente o que a condição 10 do DoD nomeia.

**O que não foi feito, e por quê:** não executei nenhum script do `04-VectorDB/`, porque o
`milvus_lite` está fora do ambiente pinado por decisão escrita e instalá-lo invalidaria a régua. As
afirmações da Q07 e da Q08 sobre a forma exata da falha ficam `NÃO_EXECUTADO` neste gate, como ficam
na resposta, que declarou o mesmo limite e não o converteu em afirmação.
