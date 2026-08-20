# Prompt para retomar em sessão nova

Copie o bloco abaixo inteiro e cole como **primeira mensagem** de uma sessão nova do Claude Code,
aberta em `E:\Projetos\rag\rag-auditado-ptbr`.

**Atualizado em 20/08/2026,** depois da **terceira** rodada de renota (29 de 29) e de 32 correções.
A fase mudou duas vezes hoje: primeiro de "medir" para "subir a nota", e agora para **"subir a nota
sabendo que o instrumento anterior media menos"** — a terceira rodada deu nota **menor** que a
segunda porque foi a primeira com uma aula por auditor e orçamento dobrado. O bloco `ESTADO DA
AVALIAÇÃO` abaixo explica, e é a coisa mais importante deste arquivo.

Este repositório é standalone, **sem o framework AIOX**. Não invoque agente do AIOX nesta sessão.

---

```
Estou retomando um trabalho em andamento. Leia estes quatro arquivos ANTES de qualquer outra
coisa, na ordem:

1. HANDOFF.md                    (estado, workflow, achados, próximo passo)
2. agente/rag-specialist.md      (as 10 regras do protocolo de citação)
3. avaliacao/RUBRICA-AULAS.md    (como a nota é atribuída)
4. avaliacao/GATE-AULAS-v1.md    (notas e defeitos de todas as rodadas — leia a ÚLTIMA seção)

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
  node ferramentas/verify-citations.js --all
  git -C ../RAG-from-First-Principles status --short --ignored
  git log --oneline

CUIDADO COM O SHELL: o terminal padrão aqui é PowerShell, onde `tail` NÃO existe. Use
`| Select-Object -Last 10`, ou rode pela ferramenta Bash. E para anexar seção longa a um .md,
NÃO use heredoc: neste ambiente ele colapsa a contrabarra e falha com "unexpected EOF". Escreva o
trecho num arquivo e concatene com `cat arquivo >> destino`.

O esperado em 20/08/2026: PASS, 1638 OK, zero inválidas (BAD_LINE, MISPLACED, NOT_FOUND e
BAD_ANCHOR todos em 0; 16 SKIPPED e 20 NO_ANCHOR são conferência à mão por desenho); clone vazio
inclusive com --ignored; nove commits em main, o mais recente sendo o que atualizou ESTE arquivo.
Se divergir, o HANDOFF é que está velho — corrija-o antes de seguir.

Nota de método sobre a linha acima: ela NÃO fixa o hash do HEAD de propósito. Um arquivo que afirma
o próprio hash fica falso no instante em que é commitado, e "afirmação de estado escrita quando era
verdadeira e nunca revisitada" é a classe de defeito dominante deste projeto. Conte os commits e
confira o assunto do último; não decore hash.

E não confie em resumo: CONTE. O gate já afirmou cobertura 29/29 quando eram 21, e o número falso
foi repassado ao HANDOFF por quem leu o resumo em vez de contar as notas registradas. Extraia todo
par (aula, nota) por script e liste quais dos números 00 a 28 não aparecem.

AS SETE REGRAS QUE MAIS IMPORTAM (as quatro primeiras estão entre as 10 da persona; todas nasceram
de erro real medido — e o "cinco" que estava aqui virou falso no instante em que eu acrescentei a
sexta e a sétima, que é a lição inteira deste projeto em miniatura):
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

ESTADO DA AVALIAÇÃO: QUATRO rodadas completas, 29 de 29 cada. Curso em 231/348 = 66,4% (R4).
Classificação pela RUBRICA: REQUER REVISÃO, quatro rodadas no mesmo rótulo. Na R4 o percentual
decide sozinho — 66,4% fica ABAIXO do piso de 70% de "Publicável com ressalvas", sem precisar das
portas. OITO aulas abaixo de 50%: 09 (0), 11 (1), 07 (3), 17 (3), 00 (4), 14 (4), 01 (5), 15 (5).
Detalhe na seção "QUARTA rodada" do GATE.

LACUNA DO REGISTRO, e o próximo que anotar nota precisa não repetir: nas 12 aulas dos lotes 1 e 2
da R4 eu anotei SÓ O TOTAL, não as seis dimensões. Resultado: a contagem de notas -1 da R4 não
está estabelecida (são 8 nas 17 com dimensão registrada). Registre SEMPRE as seis dimensões — é o
que permite recontar sem reauditar.

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
- Declarar "publicável com ressalvas" porque o percentual está em 72,1%. As portas são
  eliminatórias, não bônus — a rubrica é explícita nisso, e são 18 notas -1 contra o máximo de uma.
- Escrever aula nova, exercício novo ou exame v3 antes de as quatro aulas abaixo de 50% subirem.
  Há trabalho opcional de sobra listado na seção 9 do HANDOFF; nenhum dele destrava a publicação.
```

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
