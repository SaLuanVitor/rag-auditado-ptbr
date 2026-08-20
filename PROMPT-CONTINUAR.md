# Prompt para retomar em sessão nova

Copie o bloco abaixo inteiro e cole como **primeira mensagem** de uma sessão nova do Claude Code,
aberta em `E:\Projetos\rag\rag-auditado-ptbr`.

**Atualizado em 20/08/2026,** depois de a renota adversarial fechar em 29 de 29 e a licença ser
definida. A versão anterior mandava terminar a renota (faltavam 20 aulas), escolher licença e
perguntar dos certificados — as três fecharam ou avançaram. O que mudou de fase: **existe
classificação declarada** agora, e o trabalho deixou de ser "medir" para ser "subir a nota".

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

ONDE ESTÁ: público em https://github.com/SaLuanVitor/rag-auditado-ptbr, branch main, três commits,
autoria só do usuário. NESTE repo os commits NÃO levam Co-Authored-By Claude — decisão do usuário,
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

O esperado em 20/08/2026: PASS, 1622 OK, zero inválidas (BAD_LINE, MISPLACED, NOT_FOUND e
BAD_ANCHOR todos em 0; 16 SKIPPED e 20 NO_ANCHOR são conferência à mão por desenho); clone vazio
inclusive com --ignored; quatro commits em main, o mais recente sendo o que atualizou ESTE arquivo.
Se divergir, o HANDOFF é que está velho — corrija-o antes de seguir.

Nota de método sobre a linha acima: ela NÃO fixa o hash do HEAD de propósito. Um arquivo que afirma
o próprio hash fica falso no instante em que é commitado, e "afirmação de estado escrita quando era
verdadeira e nunca revisitada" é a classe de defeito dominante deste projeto. Conte os commits e
confira o assunto do último; não decore hash.

E não confie em resumo: CONTE. O gate já afirmou cobertura 29/29 quando eram 21, e o número falso
foi repassado ao HANDOFF por quem leu o resumo em vez de contar as notas registradas. Extraia todo
par (aula, nota) por script e liste quais dos números 00 a 28 não aparecem.

AS CINCO REGRAS QUE MAIS IMPORTAM (as quatro primeiras estão entre as 10 da persona; todas nasceram
de erro real medido):
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

ESTADO DA AVALIAÇÃO: renota COMPLETA, 29 de 29. Curso em 251/348 = 72,1%.
Classificação declarada pela RUBRICA: REQUER REVISÃO. Os 72,1% cairiam em "Publicável com
ressalvas" (70-84%), mas as duas portas eliminatórias dessa faixa falham — 18 notas -1 (o máximo é
uma) e quatro aulas abaixo de 50%: AULA-00 (5/12), AULA-25 (4/12), AULA-26 (3/12), AULA-28 (4/12).
Vale para a versão que os auditores leram: os 15 defeitos que produziram as -1 de 20/08 foram
corrigidos no mesmo dia. Detalhe na seção "Renota adversarial — rodada COMPLETA de 20/08/2026".

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

TAREFA 2 — TERCEIRA RODADA DE RENOTA. É a próxima, e agora é a primeira da fila.
Só ela mede o efeito das correções de 20/08 e da varredura de superlativos. Mesmo desenho:
general-purpose em
sonnet, somente-leitura, 2 aulas por lote, nota anterior NÃO revelada, proibido abrir o
GATE-AULAS-v1.md.
Três coisas que NÃO podem faltar no prompt de cada auditor:
  1. NÃO revelar a nota anterior. É o que dá sentido à comparação.
  2. Dizer que o --all está em PASS e que reconferir caminho/range não rende nota. O trabalho é:
     conteúdo da linha citada, contradição interna, superlativo não marcado, coerência externa.
  3. pdftotext para stdout, contrato somente-leitura citando as violações anteriores.
DOIS AUDITORES nestas quatro, que são as de maior oscilação medida entre rodadas — com um auditor
por aula a nota é sinal, não gate:
  AULA-24 (12 -> 7)   AULA-03 (0 -> 12)   AULA-26 (7 -> 3)   AULA-13 (-1 -> 10)
Priorize as quatro que estão abaixo da porta de 50%: 00, 25, 26, 28. São elas que bloqueiam.

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
