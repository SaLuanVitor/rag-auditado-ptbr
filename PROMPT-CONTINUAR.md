# Prompt para retomar em sessão nova

Copie o bloco abaixo inteiro e cole como **primeira mensagem** de uma sessão nova do Claude Code,
aberta em `E:\Projetos\rag\rag-auditado-ptbr`.

> ## ESTADO CORRENTE, 15/09/2026. Leia este bloco antes de qualquer número abaixo.
>
> **O portão está ABERTO e a fase mudou: não há mais nota a subir.** Os dois critérios
> eliminatórios passam ao mesmo tempo, o que nunca tinha acontecido: nenhuma aula abaixo de 6/12 e
> **zero** notas `−1`, em **29 de 29** aulas medidas por dimensão, sem nenhuma desconhecida e
> nenhuma livre por aritmética. O curso está em **259/348**.
>
> **O contador é a fonte, não este arquivo:** `node ferramentas/portao.js`.
>
> Tudo o que vem depois deste bloco é **registro de 20/08**, e continua valendo como método e como
> história. Os números dele estão superados, e os que mais enganam são estes:
>
> | O texto abaixo diz | Hoje |
> | --- | --- |
> | "1638 OK" no verificador | mais de 2000; reconte, nunca decore |
> | "nove commits em main" | dezenas; conte com `git log` |
> | "leia estes quatro arquivos" | ver a lista corrigida logo abaixo |
> | fase "subir a nota" | fase **manutenção**: o portão abriu e o que resta é vigiar |
>
> **O que mudou de ferramental:** eram duas ferramentas em 20/08 e são **doze**, com doze suítes em
> `ferramentas/testes/`. As três que mudam o começo de uma sessão nova são o `portao.js`, que
> reconta os critérios; o `entreaulas.js`, que valida citação de linha de uma aula para outra; e o
> `vigia.js`, que diz se a fonte pinada ou as bibliotecas andaram. O `README.md` tem a lista
> inteira por momento de uso.
>
> **O que ficou aberto**, e é decisão de quem paga e não trabalho pendente: reproduzir os três
> números do RAGAS, que exige chave da OpenAI; e a condição 4 do DoD, verificação própria de cada
> lote de conserto, que **não fecha por construção** e tem régua de parada declarada no `GATE`.

**O bloco de 20/08 começa aqui.** Atualizado então depois da **terceira** rodada de renota (29 de
29) e de 32 correções. A fase mudou duas vezes naquele dia: primeiro de "medir" para "subir a nota",
e depois para **"subir a nota sabendo que o instrumento anterior media menos"** — a terceira rodada
deu nota **menor** que a segunda porque foi a primeira com uma aula por auditor e orçamento dobrado.

Este repositório é standalone, **sem o framework AIOX**. Não invoque agente do AIOX nesta sessão.

---

```
Estou retomando um trabalho em andamento. Leia estes quatro arquivos ANTES de qualquer outra
coisa, na ordem:

1. HANDOFF.md                    (estado corrente no topo, depois o histórico)
2. agente/rag-specialist.md      (protocolo de citação, ferramental obrigatório, vigilância)
3. avaliacao/RUBRICA-AULAS.md    (como a nota é atribuída, e o que é e não é -1)
4. avaliacao/GATE-AULAS-v1.md    (notas e defeitos de todas as rodadas — leia as ÚLTIMAS seções)
5. README.md                     (as doze ferramentas, por momento de uso)

CONTEXTO EM UMA FRASE: curso de RAG em português COMPLETO (29 aulas, AULA-00 a AULA-28) construído
sobre o repositório de código de RAG from First Principles (Packt), que precisa estar clonado como
pasta IRMÃ em ../RAG-from-First-Principles/. Acompanha um agente especialista versionado
(@rag-specialist, nível L3) e um aparato de verificação: ferramenta de citações, rubrica de seis
dimensões, dois exames e gates de auditoria adversarial.

ONDE ESTÁ: público em https://github.com/SaLuanVitor/rag-auditado-ptbr, branch main, autoria só do
usuário (conte os commits com git log, não decore o número). NESTE repo os commits NÃO levam Co-Authored-By Claude — decisão do usuário,
vale só aqui. Licença definida: CC BY-SA 4.0 para o material, MIT para o código (ver LICENSE).

NÃO escreva aula nova. Não há aula pendente. E não renote você mesmo o material que corrigir —
auto-atribuir nota é o que a RUBRICA proíbe.

CONTRATO INEGOCIÁVEL: o clone ../RAG-from-First-Principles/ NÃO é modificado. `git status` dentro
dele deve terminar vazio. Ao longo de duas rodadas, três auditores violaram isso por acidente — um
gravou um .bin dentro do clone, dois criaram arquivo no %TEMP% com `>` — e todos se autodenunciaram.
Na rodada de 20/08 não houve violação: um auditor tentou um `>`, o comando falhou com Permission
denied, e ele reportou de todo modo. Se precisar extrair PDF, use `pdftotext arquivo.pdf -` para
stdout, NUNCA com arquivo de saída.

CONFIRA O ESTADO ANTES DE AGIR (da raiz deste repositório):
  node ferramentas/portao.js                    <- os dois criterios, e e a FONTE da nota
  node ferramentas/verify-citations.js --all    <- citacoes contra o clone
  node ferramentas/entreaulas.js                <- citacao de linha de aula para aula
  bash ferramentas/testes/rodar.sh              <- as doze suites, com positivo plantado
  git -C ../RAG-from-First-Principles status --short --ignored
  git log --oneline

CUIDADO COM O SHELL: o terminal padrão aqui é PowerShell, onde `tail` NÃO existe. Use
`| Select-Object -Last 10`, ou rode pela ferramenta Bash. E para anexar seção longa a um .md,
NÃO use heredoc: neste ambiente ele colapsa a contrabarra e falha com "unexpected EOF". Escreva o
trecho num arquivo e concatene com `cat arquivo >> destino`.

O esperado hoje: `PORTAO: ABERTO` com os dois critérios passando; `PASS` no verificador e no
`entreaulas`, com zero inválidas; `SUITE VERDE`; clone vazio inclusive com `--ignored`. **As
contagens saíram desta linha de propósito**, porque elas envelhecem a cada commit e já envelheceram
duas vezes aqui: o número de citações cresce quando se escreve, e o de commits, sempre. Reconte, e
se o veredito divergir, o `HANDOFF` é que está velho — corrija-o antes de seguir.

Nota de método sobre a linha acima: ela NÃO fixa o hash do HEAD de propósito. Um arquivo que afirma
o próprio hash fica falso no instante em que é commitado, e "afirmação de estado escrita quando era
verdadeira e nunca revisitada" é a classe de defeito dominante deste projeto. Conte os commits e
confira o assunto do último; não decore hash.

E não confie em resumo: CONTE. O gate já afirmou cobertura 29/29 quando eram 21, e o número falso
foi repassado ao HANDOFF por quem leu o resumo em vez de contar as notas registradas. Extraia todo
par (aula, nota) por script e liste quais dos números 00 a 28 não aparecem.

AS REGRAS QUE MAIS IMPORTAM (as quatro primeiras estão entre as 10 da persona; todas nasceram de erro
real medido). **Este cabeçalho não conta mais as regras, de propósito.** Ele dizia "AS CINCO" e virou
falso quando entraram a sexta e a sétima; dizia "AS SETE" e viraria falso agora, com a oitava e a
nona. Cabeçalho que afirma a própria contagem é exatamente o defeito que a lista abaixo ensina a
evitar — a lição inteira deste projeto em miniatura, cometida duas vezes pelo documento que a ensina.
A contagem saiu; a lista fica:
- Nunca `grep -h` para citar. A flag suprime o caminho, e caminho ausente vira caminho inventado.
- Par de arquivos exige `diff`. Nunca inferir a diferença pelo sufixo do nome.
- Import não é uso. Grepar se o símbolo é exercitado antes de citá-lo como evidência.
- Contagem à mão é onde este material erra. `awk 'END{print NR}'`, nunca `wc -l` (subconta 1 em
  arquivo sem newline final — já produziu quatro defeitos, em AULA-22, 24, 26 e 27). Razão calculada
  de cabeça também: "dez vezes" onde era 5,7. Soma de nota, idem: um relatório de auditor somou
  8 onde as dimensões davam 10.
- NOVA, de 20/08: achado de auditor sobre CITAÇÃO LITERAL também se confere na fonte antes de
  aplicar. O lote 10 de 19/08 mandou remover a palavra "final" de uma citação do paper Modular RAG
  alegando que o paper não a tinha. O paper TEM. A correção degradou uma citação correta, e a rodada
  seguinte apontou o defeito que a auditoria anterior criou. O viés é contra o material — isso é
  certo para dar nota, não para editar sem verificar.
- NOVA, de 20/08 (quarta rodada): **o `GLOSSARIO.md` é irmão de TODA afirmação de aula.** As 29
  aulas apontam para ele como fonte de definição, então uma correção que não chega nele deixa a
  versão errada na fonte que o leitor consulta. Dois casos no mesmo dia: (1) a AULA-21 corrigiu
  "o Self-RAG decide se precisa recuperar" — verdade do paper, falsa da implementação — e a
  correção chegou na AULA-18 e na AULA-20 e NÃO no glossário, que seguia afirmando a versão nua;
  (2) a AULA-07 marca como julgamento "a decisão de maior impacto do pipeline" e o glossário
  afirmava o mesmo superlativo como definição de dicionário. Ao corrigir qualquer alegação:
  `grep -n "<termo>" GLOSSARIO.md` junto com o grep nas aulas irmãs. **E o CHECKPOINT é irmão do
  corpo da própria aula:** a AULA-18 estabelece no corpo que o código produz duas saídas, e a
  pergunta 11 do checkpoint reafirmava "as três saídas" sem a ressalva — quem revisa só pelo
  checkpoint reaprende o que o corpo acabou de corrigir. Irmãos são: as outras aulas, o glossário,
  e as seções de fecho da mesma aula.
- NOVA, de 20/08: **medir uma direção do erro não é medir.** O `checar-vocabulario.js` reportava
  "0 termos faltando" enquanto o glossário tinha NOVE entradas duplicadas — cinco inseridas por um
  script meu em termos que já tinham entrada, e uma delas contradizia a entrada boa. Verificador
  que só procura ausência é cego para excesso. Ele conta as duas coisas agora.
- NOVA, de 20/08 (sexta rodada): **proveniência fabricada dentro de ressalva honesta.** É a classe
  que mais escapa, porque a *forma* parece honesta e o revisor para de ler na ressalva. Três casos:
  a AULA-07 dizia "não rodei este experimento: exige `unstructured`" — o script usa `PDFReader`/`pypdf`
  e o `requirements.txt` do módulo tem zero `unstructured`; e as AULAS 23 e 25 diziam "é como as
  citações desta aula foram conferidas" sobre uma receita de extração por `zlib` que **não recupera
  nenhuma frase de duas palavras** daqueles PDFs, porque o espaço entre palavras é posicionamento e
  não literal. Em todos, o limite declarado era verdadeiro e a **razão** dada era inventada. Regra
  operacional: ao escrever "não verifiquei porque X", verificar X. E ao ler uma ressalva de outro
  auditor — ou minha, de ontem —, conferir a razão, não só a existência da ressalva.
- NOVA, de 20/08 (sexta rodada): **corrigir no ponto citado sem greppar os irmãos deixa o defeito de
  pé.** Já aconteceu dentro de UM arquivo: consertei a alegação de `Literal` na Parte 2 da AULA-14 e
  deixei três passagens dizendo a coisa removida, uma delas o checkpoint. E acontece na forma pior,
  em que o conserto se nega a si mesmo: a nota de rodapé que escrevi na AULA-24 explica que
  small-to-big se divide em três e fecha com uma frase — resíduo da versão anterior da célula — que
  diz o oposto. Ao editar: grep do termo em TODAS as aulas, no `GLOSSARIO.md`, e no restante do
  próprio arquivo, incluindo a célula que a nota anota.
- NOVA, de 21/08 (varredura da classe 4): **contagem nunca sai de saída que você truncou.** Escrevi
  "o único dos **oito** modos" depois de ler os ramos de um factory através de um `grep | head -30` e
  de um `sed -n '60,140p'`. O enum tem **nove** membros e o factory despacha nove ramos — o nono
  ficou fora da janela que eu mesmo impus. Não é "contagem à mão": é contagem sobre evidência
  mutilada antes de ser olhada, e é pior, porque a mutilação foi deliberada. Se o número importa, o
  comando termina em `awk 'END{print NR}'` ou `grep -c`, que não truncam. E se o comando de
  conferência for ambíguo, **leia a coisa**: um `grep -c "^|"` numa tabela conta o separador e quase
  me fez "corrigir" um acerto.
- NOVA, de 21/08 (varredura da classe 4): **aumentar o rigor da forma pode quebrar a substância.** O
  conserto da AULA-23 ampliou um `grep` de `--include=*.py` para "qualquer extensão", exatamente para
  ser mais rigoroso — e isso tornou a frase **falsa**, porque o PDF do paper casa `leiden` nos
  próprios bytes. Restrito a código o retorno é vazio; irrestrito devolve um arquivo. Toda vez que
  você ampliar o escopo de um comando citado, **rode o comando ampliado** antes de escrever a frase.
- NOVA, de 21/08: **ambiente é instrumento, e montar um responde o que reler não responde.** Um venv
  isolado com os pins exatos do curso converteu oito limites declarados em medição, e rendeu um
  defeito que nenhuma leitura daria (o `pymilvus` do curso importa `pkg_resources`, removido no
  `setuptools` 81). Antes de declarar um limite de ambiente, pergunte se o limite é do ambiente ou da
  falta de vontade de montá-lo. E note o que basta: as perguntas eram sobre **mecanismo**, então sete
  pacotes resolveram o que os 274 do curso resolveriam — sem torch, sem GB de download.
- NOVA, de 21/08 (passada de verificação): **um em cada quatro blocos que eu escrevo tem defeito.**
  Quatro auditores revisaram só o meu diff de uma sessão — 176 blocos, 723 linhas — e acharam **42**
  defeitos meus. Eu estimava 11%; era 24%. Isso não é argumento para parar de consertar; é orçamento:
  **toda rodada de conserto precisa da sua própria passada de verificação**, e ela tem de revisar só
  o diff, contra a fonte, sem procurar defeito novo no material. Varredura por classe abre trabalho a
  cada rodada; passada sobre o diff fecha.
- NOVA, de 21/08: **recuar além da evidência não é mais seguro que avançar além dela.** Removi
  "similaridade não normalizada", que era falso, e pus um "não sei" no lugar — quando o docstring de
  `similarity_search_with_relevance_scores` responde ("Return docs and relevance scores in the range
  [0, 1]"). Pior: o recuo **enfraqueceu a tese do parágrafo**, porque a incomensurabilidade que
  sobrava não era de escala e sim de significado, e o leitor ficou sem saber por que a soma é errada.
  Ao remover um excesso, a pergunta é **se a fonte responde** — não se dá para não responder.
- NOVA, de 21/08: **não generalize do seu ambiente de verificação para o ambiente do material.** Os
  cinco defeitos da AULA-00 têm essa raiz: escrevi sobre os `requirements` do curso a partir de um
  venv meu de sete pacotes, sem abrir os `requirements`. O caso que dói: afirmei que `numpy==1.26.4`
  trava em cp312 quando o `numpy-1.26.4` **instalado no venv que eu mesmo montei** tem
  `Tag: cp313-cp313-win_amd64`, sob Python 3.13.11. O ambiente que eu construí para verificar coisas
  falsificava a afirmação, e eu não consultei. Se a frase é sobre o material, a fonte é o material.
- NOVA, de 21/08: **nunca cite texto que você apagou.** A AULA-15 citava literalmente, entre aspas,
  uma frase que eu havia removido da AULA-22 horas antes — e a substituição dizia o contrário. É a
  forma mais grave do problema dos irmãos, porque as aspas **afirmam** que a outra aula diz aquilo.
  Ao substituir qualquer frase citável, `grep` o trecho apagado no repositório inteiro antes de
  commitar.
- NOVA, de 21/08: **citação que se declara literal não pode ser limpa.** Escrevi
  "`Use invoke instead.`" marcado como **medido**, e a saída real é "`Use :meth:`~invoke` instead.`".
  Arrumar a pontuação de uma string apresentada como medição é falsificá-la. Ou cole o byte exato, ou
  descreva o conteúdo em prosa sem aspas.
- NOVA, de 21/08: **enumerador erra na primeira tentativa, sempre, e sempre por definir a unidade
  errada.** Três vezes numa sessão: 1422 candidatas de contagem quando eram 440 (faltava o
  discriminador de referência ao repositório); zero receitas em treze aulas quando eram 129 (contava
  só item numerado, e aquelas aulas usam blocos de comando); e dez órfãs no glossário quando eram
  três (títulos com barra tratados como string única). Iterar não é desperdício — **despachar
  auditores sobre a primeira versão é.** E imprima sempre o que o filtro descartou, com o motivo:
  filtro de ruído é afirmação sobre o que não importa, e afirmação não verificada é a falha dominante
  deste projeto.
- NOVA, de 21/08 (passada de escopo apertado): **quando o conserto é uma prescrição, execute a**
  **prescrição.** Todas as outras regras desta lista são sobre a **verdade da frase**. Esta é sobre a
  **executabilidade da instrução**, e é classe distinta: escrevi "ponha `random.seed(42)` antes da
  linha 23" quando a linha **22** é a que sorteia os vetores — a semente ficava **depois** do sorteio
  e o conserto derrotava o próprio propósito, com toda a análise em volta correta. E mandei trocar um
  corpus "por um arquivo do acervo de turismo" numa aula cujas perguntas são sobre outro assunto,
  sem checar que nenhum arquivo do repositório tem tamanho para o exercício funcionar. É pior que
  erro de fato, porque **quem paga é o leitor que obedece**: alegação falsa o leitor atento
  desconfia; instrução que não funciona ele descobre gastando tempo. Antes de escrever "faça X",
  faça X.
- NOVA, de 21/08: **peça ao verificador o que PASSOU, não só o que falhou.** Nas primeiras passadas
  eu pedia só defeitos, e ficava sem saber se uma reprodução havia sido feita ou apenas omitida — um
  relatório sem defeitos era indistinguível de um relatório sem trabalho. Listar nominalmente as
  alegações a reproduzir, e exigir o veredito de cada uma, revelou que eu havia escrito
  `draw_ascii()` **sem checar** que o método existe (existe) e que o `CSVLoader` devolve 6 documentos
  num arquivo de 8 linhas (devolve).
- NOVA, de 21/08: **briefing não deve oferecer categoria onde esconder erro próprio.** O contrato dos
  auditores dizia "o clone deve terminar com apenas dois untracked pré-existentes" — o que dava a um
  auditor descuidado um balde pronto para arquivo dele. Com o clone limpo, virou "deve terminar
  **vazio**", e qualquer coisa que apareça é dele. Exceção nomeada num contrato é porta.

ESTADO DA AVALIAÇÃO: QUATRO rodadas completas, 29 de 29 cada. Curso em 231/348 = 66,4% (R4).
Classificação pela RUBRICA: REQUER REVISÃO, quatro rodadas no mesmo rótulo. Na R4 o percentual
decide sozinho — 66,4% fica ABAIXO do piso de 70% de "Publicável com ressalvas", sem precisar das
portas. OITO aulas abaixo de 50%: 09 (0), 11 (1), 07 (3), 17 (3), 00 (4), 14 (4), 01 (5), 15 (5).
Detalhe na seção "QUARTA rodada" do GATE.

LACUNA DO REGISTRO, e o próximo que anotar nota precisa não repetir: nas 12 aulas dos lotes 1 e 2
da R4 eu anotei SÓ O TOTAL, não as seis dimensões. Resultado: a contagem de notas -1 da R4 não
está estabelecida (são 8 nas 17 com dimensão registrada). Registre SEMPRE as seis dimensões — é o
que permite recontar sem reauditar.

⚠️ A QUINTA RODADA QUEBROU A SEQUÊNCIA DE QUEDAS, e vale entender por quê antes de comemorar: ela
renotou SÓ as oito aulas abaixo de 50%, DEPOIS de 23 consertos, e com briefing UNIFORME onde a R4
usava briefing dirigido. Resultado 25/96 -> 77/96. Mas 6 dos 13 defeitos que ela achou foram
introduzidos pelos MEUS consertos horas antes, incluindo o único -1 -- ou seja, a rodada continuava
discriminando. O confundimento (conserto + briefing mudaram juntos) é real e não se resolve com
esses dados. NÃO some as 21 notas da R4 com as 8 da R5 e chame de nota do curso.

⚠️ E LEIA ISTO ANTES DE COMPARAR NOTAS: a nota caiu TRÊS RODADAS SEGUIDAS — 73,0% na R2, 70,4% na
R3, 66,4% na R4 — e cada rodada mediu depois de dezenas de correções. Na R4 a prova ficou nítida:
ordenei os lotes do mais fraco ao mais forte pela nota da R3, e a QUEDA CRESCE conforme a nota
anterior sobe (lote 3: 54 contra 60; lote 4: 56 contra 62; lote 5: 31 contra 56). As aulas que uma
rodada dá como 11 ou 12 são as que a rodada seguinte mais rebaixa: a AULA-22 saiu de 12/12 para 8,
a AULA-14 de 11 para 4. Nota alta neste projeto significa "não medida fundo ainda", não "boa".
A terceira rodada já dava nota MENOR que a segunda (70,4% contra 73,0%) mesmo depois de 15
correções. Não é o material que piorou — é que a terceira mediu
mais fundo. Ela foi a primeira com UMA AULA POR AUDITOR e dez citações mínimas em vez de cinco, e nas
quatro aulas com dois auditores, em QUATRO DE QUATRO o de orçamento dobrado deu nota menor E achou
defeito verificável que o de par perdeu. Trate as notas das rodadas 1 e 2 como piso otimista, não
como medida.

TAREFA 1 — ~~VARREDURA DE SUPERLATIVOS~~. FECHADA em 20/08/2026.
Varredura por script nas 29 aulas: 154 candidatos não marcados, triados um a um, 64 corrigidos em 26
arquivos, resíduo de 94 — e o resíduo é legítimo por triagem (comparativo delimitado e verificável,
conhecimento de domínio, pergunta de Checkpoint, e "espaço único" da AULA-27, que é termo técnico e
não superlativo). Detalhe do que foi corrigido e por qual das três saídas está no HANDOFF, seção 1b.

Se precisar refazer ou estender a varredura, o método que funcionou:
  1. Se é alegação de FATO (unicidade, primazia, contagem) — CONFIRA por grep/ls/script. Se cai,
     corrija o fato. Foi assim que "o único caminho absoluto do repo" virou "um dos dois", e
     "três vezes" para o modelo -zh virou 27 arquivos em sete módulos.
  2. Se é JULGAMENTO de valor — prefixe com "Julgamento:", marque inline, ou reescreva como
     descrição. Prefixar 60 vezes deixa o texto ilegível; escolha por trecho.
  3. Se não sustenta nem como fato nem como julgamento útil — remova.
Aplique por script com TRAVA DE CASAMENTO ÚNICO: cada substituição precisa casar exatamente uma vez,
e qualquer divergência aborta a execução sem escrever nada. A trava disparou duas vezes na primeira
tentativa (os .md são CRLF, e um trecho diferia do esperado) e evitou edição às cegas. Nunca faça
busca-e-substitui cega: cada caso exige ler a frase.

TAREFA 2 — ~~TERCEIRA RODADA DE RENOTA~~. FECHADA em 20/08/2026, com 32 correções aplicadas.
O desenho que funcionou, para reusar: general-purpose em sonnet, UMA aula por auditor, mínimo de dez
citações abertas, nota anterior NÃO revelada, proibido abrir GATE-AULAS-v1.md / HANDOFF.md /
PROMPT-CONTINUAR.md. E três cláusulas que nasceram de defeito medido:
  1. Dizer o que conta como julgamento marcado (prefixo, inline, ou hedge de primeira pessoa) E que
     MARCADOR MAL POSICIONADO é falha. Sem isso a rodada mede a sua notação, não o material.
  2. Mandar somar as seis dimensões por script antes de escrever o total — um relatório da rodada
     anterior deu E2 C2 H0 O2 D2 A2 e escreveu "Total: 8/12".
  3. "Ausência de uma string não é ausência do comportamento" — antes de concluir "os outros não
     fazem X", procure os sinônimos.
E no contrato: SE CRIAR ARQUIVO POR ACIDENTE, REPORTE E DEIXE LÁ. Apagar é a segunda violação. Essa
cláusula funcionou na terceira rodada (um auditor criou, reportou, não apagou) depois de outro, na
rodada anterior, ter usado rm -f e violado duas cláusulas.

TAREFA 2b — ZERAR AS -1 E TIRAR CINCO AULAS DE BAIXO DOS 50%. É a próxima, e é o caminho concreto
para "publicável com ressalvas".
As 32 correções de 20/08 atacaram a maioria das -1, mas EU NÃO PODE MEDIR ISSO — auto-atribuir nota
ao que acabei de corrigir é o que a RUBRICA proíbe. Só uma quarta rodada diz onde ficou.
Antes de lançar a quarta rodada, leia a seção "O que EU errei, com contagem" do GATE. Doze defeitos
da terceira rodada foram criados ou deixados por quem aplicou as correções da segunda, em dois
padrões, e as regras que saíram disso são:
  1. A afirmação que SUBSTITUI também é afirmação, e precisa da mesma prova — inclusive a evidência
     que vem com ela. Uma faixa de linhas nova é uma citação nova.
  2. Depois de corrigir, grepe a alegação no CURSO INTEIRO, não no arquivo editado. Dois dos doze
     casos tinham o irmão em outro arquivo.
  3. Corrija os MÉDIO também. Deixar passar não economiza: transfere o trabalho para a rodada
     seguinte, a preço de auditor. Três defeitos da segunda rodada voltaram na terceira por isso.
  4. Reconcilie entre arquivos. Nenhum auditor pode pedir isso, porque cada um vê uma aula só.

TAREFA 3 — CERTIFICADOS. O usuário mencionou querer certificados no repo. Nenhum foi encontrado em
disco (a varredura só achou bundles de CA de biblioteca Python). Adiado por decisão dele em 20/08.
PERGUNTE, não decida, e a pergunta é dupla: onde os arquivos estão, OU se o pedido era o repositório
EMITIR certificado de conclusão para quem terminar as 29 aulas e os dois exames — que é feature a
projetar, não arquivo a mover.

O QUE NÃO É O PRÓXIMO PASSO, e por que:
- Renotar você mesmo depois de corrigir. É a autoavaliação que a RUBRICA proíbe.
- Declarar "publicável com ressalvas" a partir do percentual. As portas são eliminatórias, não
  bônus, e a rubrica é explícita nisso. O percentual válido é o da última rodada COMPLETA (a sexta,
  234/348 = 67,2%); a sétima foi parcial, só nas quatro piores, e não produz percentual de curso.
- Escrever aula nova, exercício novo ou exame v3 antes de as aulas abaixo de 50% subirem. Estado
  medido em 03/09: das oito da sexta rodada, quatro foram remedidas na sétima e **duas seguem
  abaixo** (24 e 08, ambas em 4/12); as outras quatro (00, 23, 25, 26) receberam conserto e **não
  foram remedidas**.
  Há trabalho opcional de sobra listado na seção 9 do HANDOFF; nenhum dele destrava a publicação.
```

---

## Regras que a sétima rodada acrescentou

### O conserto pode estar certo e a propagação falhar

Medido na sétima rodada, em três das quatro aulas: o corpo foi reescrito com precisão, e
Checkpoint, título de seção, referência cruzada e rodapé continuaram cobrando a versão antiga.
O auditor da AULA-09 foi explícito: "os seis consertos que você aplicou estão todos corretos e
provados. O que trava a nota é resíduo."

Releitura da aula não pega isso, porque a leitura reconstrói o sentido novo e passa por cima da
frase velha. Use `ferramentas/fechos.js` depois de cada lote: ele enumera as superfícies de fecho
das aulas que o diff tocou e marca as que o diff alterou. O que sobra sem marca é a lista finita
a percorrer. **Título de seção é a pior delas**, porque é o que o leitor apressado leva embora, e
foi onde o `mem_limit` sobreviveu a dois consertos do corpo.

### Percorra a lista de achados até o fim

O `12 GB que não somem` da AULA-28 foi apontado por um auditor com correção pronta para colar, e
não foi aplicado. Isso é pior que resíduo: resíduo é frase que sobreviveu a uma emenda, isto é
item que nunca foi lido. Ao fechar um lote, confira a contagem de achados do relatório contra a
contagem de edições aplicadas, e diga qual achado você recusou e por quê.

### Nota que cai não é necessariamente regressão

Precisão errada pontua pior que vagueza. Um conserto que troca "os experimentos isolam a variável
certa" por alegações exatas sobre `top_k`, `MetadataMode` e listas idênticas cria alegações
checáveis onde antes não havia nenhuma, e a rubrica passa a poder reprovar. Duas das quatro aulas
caíram, e em uma delas a queda veio de um defeito **pré-existente** que a lente do conserto
anterior tornou visível: o `Pass@5` do experimento 3 da AULA-24 é idêntico ao do 2.

Separe os dois casos antes de concluir. Regressão é prescrição nova que não funciona, como a da
AULA-08. Defeito recém-visível não é regressão, e apagar a precisão para recuperar a nota seria
o pior conserto possível.

### Valide o verificador contra um positivo plantado antes de reportar o zero dele

Um juiz automático de desalinho, por sobreposição de palavras, deu 98 pares com limiar frouxo e
**zero** com limiar estreito. O zero teria sido reportado como lote limpo. Plantar um positivo
conhecido (reverter o Checkpoint 9 da AULA-27 ao texto defeituoso) mostrou que ele não dispara
nem no caso para o qual foi construído. A ferramenta não foi instalada.

Vale para qualquer verificador novo: antes de acreditar no que ele **não** achou, plante um
defeito que você sabe que existe e confirme que ele acha.

---

## Por que este prompt é assim

- **Não abre com `*aiox-master`.** Este repositório não tem o framework AIOX. Uma versão antiga
  deste arquivo abria assim e mandaria a sessão nova invocar um agente que não existe.
- **Aponta para o `HANDOFF.md` em vez de repetir tudo.** Duas fontes divergem; uma não.
- **Manda conferir o estado com três comandos, e dá o número esperado.** Este projeto já viu dez
  afirmações de estado ficarem obsoletas por nunca serem revisitadas — inclusive um bloco inteiro
  sobre commits numa branch cujos hashes já não existiam. O prompt diz o número e manda corrigir o
  handoff se não bater.
- **Avisa do PowerShell e do heredoc.** Duas armadilhas de ambiente que custaram tempo de verdade:
  `tail` não existe no shell padrão, e o heredoc do Bash colapsa a contrabarra e falha com erro de
  aspas não fechadas, que não parece o que é.
- **Manda contar, não confiar.** O `GATE-AULAS-v1.md` afirmou cobertura de 29/29 quando eram 21, e o
  número falso foi repassado por quem leu o resumo em vez de contar as notas registradas.
- **Fixa o modelo dos auditores em `sonnet`.** Não é custo: trocar o modelo torna as notas
  incomparáveis com as rodadas anteriores, e a comparação é o único jeito de saber se as correções
  funcionaram.
- **Proíbe revelar a nota anterior ao auditor, e proíbe abrir o GATE.** Foi a decisão que deu sentido
  à renota. Sem isso a segunda medida vira confirmação da primeira.
- **Traz a regra nova sobre citação literal.** É a única regressão documentada da auditoria: uma
  correção aplicada sem conferir a fonte degradou uma citação que estava correta.
- **Põe a varredura de superlativos ANTES da terceira rodada.** Na outra ordem, a rodada nova só
  reencontra as 18 instâncias já apontadas, e gasta dez lotes para dizer o que já se sabe.
- **Nomeia as quatro aulas que bloqueiam.** "Requer revisão" é um rótulo; 00, 25, 26 e 28 abaixo de
  50% é um alvo.
- **Diz explicitamente para não escrever aula.** Sem essa linha, a sessão nova encontra 29 aulas e um
  workflow de escrita detalhado no handoff e conclui que o trabalho é escrever a trigésima.
- **Tem uma seção de "o que NÃO é o próximo passo".** Três das quatro sessões anteriores começaram
  fazendo a coisa errada por ler o handoff como catálogo de possibilidades em vez de ordem de
  prioridade.

### Como usar o `fechos.js`, medido em 03/09

Ele não julga: enumera. Rodado sobre o commit de 47 consertos, listou **197 superfícies de fecho**
não tocadas, o que é lista demais para ler. O que funcionou foi um passo a mais, e é ele que vale
como técnica:

```bash
node ferramentas/fechos.js 'HEAD~1..HEAD' | grep -iE "<conceitos que o conserto mudou de sentido>"
```

Na prática: a reescrita da AULA-25 mudou o sentido de escalonador, juiz, laço, limite e operador.
Filtrar as 197 por esses termos deixou **18 linhas**, e duas eram achado — o título da armadilha
central da AULA-25, que continuava dizendo "laço sem escalonador" três seções depois de o corpo
passar a dizer que o repositório **tem** escalonador, e uma célula de tabela da AULA-26 afirmando
`scheduling module | ausente`.

Ou seja: **os dois eram a mesma classe que aquele commit consertava em outro lugar.** Consertar a
classe num arquivo não a consertou no vizinho, e nenhuma releitura das aulas os teria achado com
esse custo.

Duas notas de uso. Passe o intervalo como `HEAD~1..HEAD`; a forma com `^` é comida por alguma
camada do shell e o script sai vazio, sem erro. E a régua para escolher os termos do filtro é a
mesma da lista de achados: para cada conserto, qual palavra mudou de sentido?

### A taxa de defeito próprio é 33%, não 24%, e ela sobe com o tamanho do conserto

Medida em 03/09 sobre o commit de 47 consertos, por duas verificações de escopo apertado:
**17 defeitos em 52 blocos**. A sessão vinha citando 24%, de uma medição anterior sobre consertos
menores.

O sinal está na distribuição, não na média. O lote das aulas 00 e 23, com consertos pontuais, deu
**6 em 23 (26%)**. O lote das aulas 25 e 26, que incluía a reescrita da Parte 4 inteira da 25, deu
**11 em 29 (38%)**. Reescrever uma seção é mais arriscado que emendar uma frase, e o risco não é
proporcional: é a cauda antiga que cola na frase nova.

Três formas foram responsáveis pela maioria, e as três só aparecem em conserto grande:

**Cauda que cola.** Ancorar num prefixo e deixar o fim da frase antiga emendar no texto novo.
Produziu `Advanced RAG é caso especial de Advanced RAG`, tautologia onde o original estava certo.
**Ao substituir, ancore na frase inteira, com o ponto final.**

**Cauda duplicada ou contraditória.** O bloco novo já disse o que a frase seguinte, não tocada,
repete ou nega. Aparece quando o conserto cresce e passa a cobrir o que vinha depois.

**Frase órfã.** Inserir no meio de um parágrafo desloca o referente de "aqui", "esse" e "ele" da
frase seguinte, sem quebrar nada visivelmente.

**Consequência para o planejamento:** um lote de N consertos custa o lote mais a verificação dele,
e a verificação acha um terço de N. Orçar sem isso é orçar metade do trabalho.
