# Gate de avaliação v3, agente `rag-specialist` (Vetor)

**Data:** 2026-09-16
**Tentativa:** v3 (exame novo, 30 questões inéditas)
**Exame:** `avaliacao/EXAME-RAG-v3.md` · **Respostas:** `RESPOSTAS-v3.md` (scratchpad)
**Rubrica:** `avaliacao/RUBRICA.md` · **Gates anteriores:** `GATE-RAG-SPECIALIST.md` (v1),
`GATE-RAG-SPECIALIST-v2.md` (v2)
**Método:** corretor único, somente-leitura sobre os dois repositórios, instruído a refutar. Toda
citação de fato foi conferida abrindo o arquivo citado; toda medição de comportamento foi
reexecutada nos dois interpretadores (`E:/tmp/rag-venv` e `E:/tmp/rag-venv-corrente`). O agente não
corrigiu o próprio exame.

---

## Veredito

# L3 — Praticante avançado (mantido)

**58/60 (96,7%)** · **1 alucinação** · **2 portas de L4 violadas, e as duas pelo mesmo defeito**

Subiu de 50/60 (83,3%) no v2. O gargalo que o v2 nomeou, o tipo `F`, fechou: 65% no v2, **100%**
aqui. O rótulo "especialista" continua não sustentado, e agora por uma linha só.

---

## Nota por questão

| Q | Cap | Tipo | Nota | Veredito do corretor |
| --- | --- | --- | --- | --- |
| Q01 | 1 | F | **2** | 16 linhas de `requirements` conferidas 1:1; as 3 versões, as contagens 5/2/1 e os 8 arquivos sem `==` batem com `grep` exato. Corrige de passagem o singular da pergunta |
| Q02 | 1 | A | **2** | Premissa desmontada; `pydantic==2.10.6` em 12 arquivos e **zero** ocorrências de `2.13.4` no clone, medido. Citação de `AULA-20:247-249` reproduz verbatim |
| Q03 | 1 | C | **2** | Pin e instrumento separados como proposições independentes; as 3 faces do dano corretas. O "já custou um `−1`" confere no cabeçalho do `vigia.js` |
| Q04 | 2 | F | **2** | Reexecutei a sonda: 0.3.33 funciona com o aviso literal, 1.6.3 levanta `TypeError`. O discriminante `__dict__` contra `hasattr` confere (`hasattr` devolve `True` nas duas) |
| Q05 | 2 | F | **2** | Assimetria reproduzida nas duas versões, em `format` e `invoke`; as 9 citações de linha do arquivo de roteamento são exatas. O transporte para RAG casa com o estágio 2 do próprio agente |
| Q06 | 2 | A | **2** | Separa conclusão certa de raciocínio inválido; a docstring diz "It will not be removed until langchain-core==1.0", verbatim. Os 15 `@deprecated` com `removal="2.0.0"` conferem, descontados 2 repasses do `_api/` |
| Q07 | 2 | J | **2** | Seis "não faço" com razão cada, incluindo a irreversibilidade do downgrade e o custo assimétrico. Nada a refutar |
| Q08 | 3 | C | **2** | As duas perguntas separadas corretamente, mais a assimetria do fracasso (o 404 é ambíguo, o sucesso não) |
| Q09 | 3 | A | **2** | Três saltos nomeados; `:15`, `:33`, `:61`, `:73`, `:74`, `:101` conferidos; `AULA-27:250` reproduz verbatim. O achado extra do `KeyError: 'choices'` é real |
| Q10 | 3 | F | **2** | Sete arquivos, linhas exatas; conferi as 7 trilhas até a geração, inclusive as células 4 e 7 do `.ipynb`. O alerta sobre `AULA-19:53` e `AULA-22:172` estava **certo** e gerou o commit `91792e0` |
| Q11 | 3 | J | **1** | Núcleo certo, duas imprecisões: a faixa `AULA-21:212-227` cobre 2 das 4 partes que ela é oferecida para provar (as outras estão em `:228-230`), e "os quatro instrumentos" vem depois de nomear três |
| Q12 | 4 | F | **2** | `:19`, `:25`, `:26-28`, `:30-43`, `:15` exatos; a ausência de retriever, vector store, `hub.pull` e métrica de recuperação confirmada por `grep`. `AULA-22:177-178` reproduz |
| Q13 | 4 | F | **2** | `ragas==0.2.15` em `requirements_langchain_Ubuntu-with-CPU.txt:266` e instalado; `__getitem__` reproduz verbatim; `:62`, `:64`, `:91`, `:98` exatos; o ramo morto é ramo morto |
| Q14 | 4 | C | **2** | Denominador, produtor e a distinção entre os dois eixos, todos corretos contra `_compute_score`. O bloco citado abrevia o guard `if num_statements:` sem elipse: INFO, não desconto (ver §Observações) |
| Q15 | 4 | A | **2** | Cinco fontes de erro, uma delas fora do alcance de repetição; o argumento dos dois espaços de cosseno confere em `_calculate_score`, verbatim e adjacente. `:103`, `:106`, `:137-140` exatos |
| Q16 | 5 | C | **2** | As 4 classes do `fechos.js` reproduzem; o "documento passa a afirmar as duas" é o argumento certo; os exemplos do `contagem.js` conferem verbatim |
| Q17 | 5 | F | **2** | 15/15 reproduzido pelo mesmo teste; a precisão sobre o 16º arquivo está certa (16 arquivos mais `testes/`); `README:296`, `PROMPT-CONTINUAR:25` e a condição 8 do `dod.js` conferidos; `cauda.test.js:75-86` exato |
| Q18 | 5 | J | **2** | Oito passos, cada um com a ferramenta **e** o que ela não vê. Conferi as sete alegações de cegueira, uma a uma, e as sete procedem. Melhor resposta do exame |
| Q19 | 5 | A | **2** | Quatro erros na premissa; cabeçalho do `superficies.js` e a última linha da saída reproduzem verbatim; a lista de fora (`ferramentas/`, `testes/`, `exercicios/`, artefato do plano) confere |
| Q20 | 5 | C | **2** | Distinção certa e **implementada**, não interpretada; o comentário do `entreaulas.js` reproduz; `GATE:566` e `AULA-13:196` conferidos |
| Q21 | 6 | F | **2** | `remote get-url` e `ls-remote` reexecutados, hashes idênticos; os 6 limites estão corretos, inclusive "andou e voltou". A armadilha do `NAO RESPONDEU` reproduz verbatim |
| Q22 | 6 | C | **2** | O que o `fetch` escreve está certo item a item, e o ponto decisivo (o `git status --porcelain` não detecta a violação, então o contrato se cumpre antes) está correto |
| Q23 | 6 | A | **1** | Premissa destruída por fato e por lógica, com 6 razões que conferi todas. Mas afirma "**seis** arquivos puxam da rede", contra os **sete** que a própria Q10 provou. Ver §Alucinação |
| Q24 | 6 | J | **2** | Caso concreto correto (as 5 aulas conferem na saída do `vigia.js`); a tabela de 3 tipos de afirmação é a decomposição certa; 6 "não faço" com razão |
| Q25 | 7 | C | **2** | As 3 formas ordenadas certo, cada uma com exemplo medido: `GATE:4369-4373` confere, e "8 vigiadas, 8 andaram, 5 cruzaram major" bate exatamente com a minha execução |
| Q26 | 7 | A | **2** | Premissa desmontada no ponto exato; o texto antigo de `README:342` reproduz verbatim contra o commit medido. O acervo já adotou a forma proposta |
| Q27 | 7 | F | **2** | "Não é defeito", com os dois casos conferidos até a linha-alvo (`AULA-13:196` e `AULA-18:217`, ambas verbatim). O limite declarado da defesa é o que fecha a resposta |
| Q28 | 8 | F | **2** | `GATE:4770-4781` e o título em `:4763` exatos; as 10 condições reproduzem; o comentário `HUMANA` do `dod.js` verbatim; a nota sobre a condição 4 como `reguaRegistrada()` confere |
| Q29 | 8 | J | **2** | Nomeia o mecanismo (indecidível por construção), reformula preservando o propósito, exige que a forma nova ainda reprove, e declara o afrouxamento. Texto verbatim de `GATE:4756-4761` |
| Q30 | 8 | A | **2** | Denominador corrigido (dez, não nove); reproduzi o `exit 0` com a décima pendente. A qualificação de que o `README` **não** reprova formalmente a condição 10 é precisamente o tipo de precisão que esta casa cobra |

---

## Soma por tipo

| Tipo | Questões | Nota | % |
| --- | --- | --- | --- |
| `F` Fato verificável | Q01, Q04, Q05, Q10, Q12, Q13, Q17, Q21, Q27, Q28 | **20/20** | **100%** |
| `C` Conceito | Q03, Q08, Q14, Q16, Q20, Q22, Q25 | **14/14** | **100%** |
| `A` Armadilha | Q02, Q06, Q09, Q15, Q19, Q23, Q26, Q30 | **15/16** | **93,8%** |
| `J` Julgamento | Q07, Q11, Q18, Q24, Q29 | **9/10** | **90,0%** |
| | | **58/60** | **96,7%** |

Conferência: 20 + 14 + 15 + 9 = 58.

### Comparação v1 → v2 → v3

| Tipo | v1 | v2 | v3 | Δ v2→v3 |
| --- | --- | --- | --- | --- |
| `F` | 15/20 (75%) | 13/20 (65%) | **20/20 (100%)** | **+35 pp** |
| `C` | 16/20 (80%) | 19/20 (95%) | **14/14 (100%)** | +5 pp |
| `A` | 7/12 (58%) | 9/10 (90%) | **15/16 (93,8%)** | +4 pp |
| `J` | 4/8 (50%) | 9/10 (90%) | **9/10 (90%)** | igual |
| **Global** | 42/60 (70,0%) | 50/60 (83,3%) | **58/60 (96,7%)** | **+13,4 pp** |

**O gargalo declarado no v2 fechou.** Aquele gate disse que o tipo `F` "não é mais resolvível por
ferramental de citação, depende de abrir arquivos e verificar comportamento". As dez `F` deste exame
exigiam exatamente isso, e as dez saíram com nota cheia, cinco delas com execução em dois ambientes.
As três lacunas do v2 que eram de método (par de arquivos exige `diff`, import não é uso, "não
afirmo" tem pré-requisito) não reincidiram: a Q06 explicita que preferiu montar um segundo ambiente
a declarar limite, e a Q04 troca `hasattr` por `__dict__` justamente por a primeira responder sobre
outro objeto.

## Soma por capítulo

| Cap | Tema | Questões | Nota | % | Porta ≥70% |
| --- | --- | --- | --- | --- | --- |
| 1 | A fonte e o que ela pina | Q01-Q03 | 6/6 | 100% | ok |
| 2 | Comportamento, não localização | Q04-Q07 | 8/8 | 100% | ok |
| 3 | Evidência, e de que tipo | Q08-Q11 | 7/8 | 87,5% | ok |
| 4 | Medir o que a métrica não diz | Q12-Q15 | 8/8 | 100% | ok |
| 5 | Propagação e superfícies | Q16-Q20 | 10/10 | 100% | ok |
| 6 | O que apodrece sozinho | Q21-Q24 | 7/8 | 87,5% | ok |
| 7 | Referência que envelhece | Q25-Q27 | 6/6 | 100% | ok |
| 8 | O critério, e quem o julga | Q28-Q30 | 6/6 | 100% | ok |
| | **Total** | | **58/60** | **96,7%** | 0 abaixo da porta |

Conferência: 6 + 8 + 7 + 8 + 10 + 7 + 6 + 6 = 58. As duas somas independentes fecham no mesmo valor,
e a soma linha a linha da tabela de questões também: 28 questões com 2 mais 2 questões com 1 = 58.

---

## Alucinação: uma, e o comando que a prova falsa

### Q23, linha 1082 do arquivo de respostas: "seis arquivos puxam da rede"

**O que foi afirmado, como fato e sem hedge:**

> O conteúdo de `rlm/rag-prompt`, que seis arquivos puxam da rede e que pode mudar sem uma linha do
> repositório mudar (Q11).

**O comando que a prova falsa:**

```
$ cd E:/Projetos/rag/RAG-from-First-Principles && grep -rln "rlm/rag-prompt" . | wc -l
7
```

São sete, e o sétimo é o `00-SimpleRAG/04_LangGraph_RAG.ipynb`, que não é cópia do `.py` de mesmo
nome. **A própria resposta prova isso na Q10**, na linha 427: "Sete arquivos, e os sete alimentam
geração", com a listagem completa e a trilha até a geração de cada um, que eu conferi uma a uma.

**Por que conta como `−1` e não como descuido de redação.** É a classe que o gate v1 penalizou na
Q22 com `−1`, nas mesmas palavras: contagem afirmada que contradiz o que o mesmo documento
estabelece. A ação corretiva 4 daquele gate, "coerência interna antes de enviar", foi escrita para
este caso exato. E a Q16 desta mesma prova descreve a forma com precisão, citando o `contagem.js`:
o conserto entra no corpo e o numeral fica na versão anterior. A resposta cometeu, na Q23, a classe
que ela diagnostica na Q16.

**Gravidade relativa, declarada.** O dano é menor que o das alucinações anteriores: nada externo é
inventado, o número certo está no mesmo arquivo com prova, e nenhuma decisão derivada muda. Isso não
a reclassifica. A rubrica não tem faixa intermediária, e a porta de L4 é "zero", não "zero graves".

### Candidatos que investiguei e **não** são alucinação

Registro para que a próxima rodada não os reabra.

| Candidato | Por que não |
| --- | --- |
| "o `README.md` tem 354 linhas" | Verdadeiro no commit medido: `git show 6012ea7:README.md \| grep -c ''` devolve **354**. Hoje são 356 porque o commit `91792e0`, que a própria resposta provocou, acrescentou 2 linhas |
| "`README:342` afirma 2192 citações" | Verdadeiro no commit medido: `git show 6012ea7:README.md \| sed -n '342p'` reproduz a frase inteira, inclusive "27 `SKIPPED` e 15 `NO_ANCHOR`" |
| "`AULA-19:53` e `AULA-22:172` dizem **seis**" | Verdadeiro quando escrito, e o acervo foi corrigido por causa disso. As duas linhas hoje dizem "sete", nos mesmos números de linha |
| "os dois scripts do repositório que usam a forma antiga" (Q04) | Ambíguo, e resolve verdadeiro pelo antecedente mais próximo: os dois scripts que as AULAS 20 e 26 citam (`01-LangChain-OutputParsing.py:15` e `02-LangChain-AdaptiveRAG.py:132`), ambos quebrados em 1.6.3. Lido como censo de APIs removidas seria falso (`get_relevant_documents` está em 4 arquivos, 6 chamadas). Imprecisão, não invenção |
| "os 15 `@deprecated` sobrevivos miram `removal=2.0.0`" (Q06) | Verdadeiro. `grep -rn 'removal=' langchain_core` devolve 17, dos quais 2 são repasse de parâmetro em `_api/deprecation.py`. Os 15 restantes são todos `"2.0.0"` |

---

## A declaração de `verify-citations.js` do cabeçalho: procede, com uma correção de mecanismo

O respondente declarou `OK: 122, BAD_LINE: 0, MISPLACED: 4, NOT_FOUND: 2, FAIL`, e atribuiu as seis
a colisão de basename e a arquivos do `ragas` dentro do `venv`. **Procede.**

- As **4 `MISPLACED`** são reais e são as que ele descreve: linhas 761, 1176, 1219 e 1466, todas
  `rag-auditado-ptbr/README.md` em `:296` e `:342`. Conferi as quatro à mão contra
  `E:/Projetos/rag/rag-auditado-ptbr/README.md` e as quatro são válidas.
- As **2 `NOT_FOUND`** são os dois arquivos do `ragas` em `E:/tmp/rag-venv/Lib/site-packages/`, fora
  dos dois repositórios por construção. Reproduzi os dois trechos por `inspect.getsource` e os dois
  batem.
- **Correção de mecanismo, não de conclusão.** As quatro `MISPLACED` saem porque o caminho
  *prefixado* não existe nas raízes que o verificador conhece, e ele oferece `repo:README.md`,
  `repo:99-EN/README.md` e `curso:README.md`. A colisão de basename que ele descreve é verdadeira e
  se prova por outra via: a citação nua `README.md:296` sai `BAD_LINE` com "repo:README.md tem 242
  linhas", que é o `README` do clone. A causa declarada está certa; o caminho pelo qual o
  instrumento a manifesta é outro.
- **Rodando hoje o número é 10, não 6**, e isso não é discrepância: o próprio parágrafo em que ele
  declara as seis introduz mais quatro citações (linhas 38 a 44), que a execução anterior não podia
  contar. Nenhuma delas é citação fabricada.

Nenhum desconto por isto. Declarar `FAIL` com a causa medida, em vez de omitir, é o comportamento
que o v1 e o v2 pediram.

---

## Portas eliminatórias

| Nível | Requisito | Situação |
| --- | --- | --- |
| **L4** | ≥90% global | **ok**, 96,7% |
| **L4** | zero `−1` | **falha**, 1 alucinação (Q23) |
| **L4** | todas as `A` com nota 2 | **falha**, Q23 = 1 |
| **L4** | nenhum capítulo abaixo de 70% | **ok**, o menor é 87,5% |
| **L3** | 75–89% global | acima da faixa, e a rubrica lê a faixa como piso quando uma porta superior falha ("94% com duas alucinações é L3, não L4") |
| **L3** | no máximo uma `−1` | **ok**, exatamente 1 |
| **L3** | ≥80% das `A` com nota ≥1 | **ok**, 8/8 = 100%. Nenhuma premissa falsa foi aceita em nenhuma das oito |

**Nível atribuído: L3 — Praticante avançado, mantido.**

**O que faltou para L4, dito sem rodeio:** uma palavra. As duas portas violadas são a mesma
ocorrência, o numeral "seis" na linha 1082. Corrigido esse ponto, o exame teria 60/60, zero `−1`,
oito `A` com nota 2 e nenhum capítulo abaixo de 87,5%, ou seja, as quatro portas de L4. Não é
generosidade dizer isso: é a leitura literal da tabela acima. O que a rubrica recusa é converter
"quase" em nível, e ela recusa de propósito, porque a porta de zero alucinação existe justamente
para não ser negociada pela margem.

**Não há reteste implícito.** Um v4 mede um agente diferente do que respondeu este; a régua de zero
alucinação só significa alguma coisa se for aplicada à rodada em que o defeito apareceu.

---

## Lacunas nomeadas, v3

Substituem as nove do v2. As lacunas de citação (`arquivo:linha`, inventário, par de arquivos,
import contra uso) estão **resolvidas**: zero erros dessas classes em 136 citações, 125 das quais o
verificador validou e o resto eu conferi à mão. Sobraram quatro, todas de precisão, nenhuma de
conhecimento.

| # | Lacuna | Consultar com verificação |
| --- | --- | --- |
| 1 | **Contagem repetida em segunda menção.** O número certo aparece medido no lugar em que foi apurado e reaparece errado quando é citado de passagem, páginas depois | sempre: rodar `contagem.js` ou uma busca pelo numeral no próprio artefato antes de entregar. É a única classe que ainda custa nota |
| 2 | **Faixa de linhas que não cobre toda a transcrição que ela é oferecida para provar** (Q11: `:212-227` para um trecho que termina em `:230`) | quando a citação sustenta uma lista de N partes, conferir que a faixa contém as N |
| 3 | **Bloco de código citado como fonte, com elisão não marcada ou reformatação** (Q14 omite o `if num_statements:`; Q16 e Q19 realinham colunas; Q17 acentua um comentário que no fonte não tem acento) | se a literalidade importa para o argumento, copiar do arquivo sem retocar, e marcar toda elisão |
| 4 | **Numeral solto em prosa sem referente enumerado** ("os quatro instrumentos da casa" depois de nomear três; "os dois scripts" sem dizer quais) | pedir a lista. Não é invenção, mas é a porta de entrada da lacuna 1 |

O que **não** é lacuna, e vale registrar porque as rodadas anteriores nomearam o oposto:
resistência a premissa falsa (8 de 8, e as oito com a premissa desmontada explicitamente),
ancoragem factual no repositório (`F` em 100%), declaração de limite sem evasão (a Q06 declara não
ter achado contraexemplo em vez de fabricar um), e separação entre o que foi medido e o que foi
documentado (Q08, Q09).

---

## Achados sobre o repositório (subproduto desta correção)

Dois, e os dois são superfície viva divergindo. Aponto e não corrijo: o contrato desta prova proíbe
escrever nos dois repositórios, e `git status --porcelain` dos dois terminou vazio.

1. **`HANDOFF.md:848` ainda diz "seis", e devia dizer "sete".** O commit `91792e0` ("Sao sete
   arquivos que puxam o rlm/rag-prompt, nao seis") alcançou `AULA-19`, `AULA-21`, `AULA-22` e
   `README.md`, e deixou o `HANDOFF` para trás. A linha afirma: "E são **seis** arquivos que o
   puxam, não três". O `node ferramentas/superficies.js "rlm/rag-prompt"` já enumera as cinco
   superfícies vivas e avisa que "as 5 tem de concordar"; hoje quatro concordam. É exatamente o
   mecanismo que a Q18 percorre e que a Q19 diz que a varredura sozinha não fecha.

2. **`GATE-AULAS-v1.md:4781` marca a condição 10 como "passa", e o `dod.js` a reporta pendente.** A
   coluna "Hoje" da tabela do DoD dá as dez como cumpridas, enquanto `node ferramentas/dod.js`
   imprime `[ ?? ] 10 ... NAO DECIDIVEL POR MAQUINA` e fecha com "Nove verdes NAO sao dez". As duas
   superfícies discordam sobre o estado do próprio critério, e a tabela é a fonte que a Q28 cita.
   O respondente reproduziu a tabela sem a coluna "Hoje" e não notou a contradição, o que é
   coerente com a lacuna 1: o fecho condensado carregou o estado antigo.

O segundo achado é o mais caro dos dois, porque a condição 10 é a que existe para impedir que se
declare cumprido o que ninguém conferiu, e a tabela que a define já a declara cumprida.

---

## Onde esta rodada para, e por quê

Parou com o acervo inteiro conferido: as 136 citações do arquivo de respostas (125 pelo verificador,
11 à mão), as 4 ferramentas que o respondente declarou ter rodado (`verify-citations --all`,
`entreaulas`, `vigia`, `dod`), reexecutadas por mim com os mesmos resultados, e as 2 sondas de
comportamento refeitas nos dois interpretadores.

**Pior achado da última passada:** a alucinação da Q23, um numeral em prosa contradizendo a medição
do próprio documento. É o mesmo pior achado da rodada de aulas de 15/09, e é a razão de o
`contagem.js` existir.

**O que não foi feito, e por quê:** não executei as chamadas que custam chave e gasto
(`gpt-4-vision-preview`, os números do RAGAS), então as afirmações das Q09 e Q15 sobre o que a API
responderia ficam `NÃO_EXECUTADO` neste gate, como ficam nas aulas. A resposta declara o mesmo
limite, e não o converteu em afirmação.
