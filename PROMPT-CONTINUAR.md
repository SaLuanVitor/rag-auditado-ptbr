# Prompt para retomar em sessão nova

Copie o bloco abaixo inteiro e cole como **primeira mensagem** de uma sessão nova do Claude Code,
aberta na raiz deste repositório.

**Sincronizado em 19/08/2026.** A versão anterior mandava escrever a AULA-19 e dizia "19 de 29 aulas
escritas" — as 29 estão prontas há duas rodadas. A fase mudou: não se escreve mais aula. O que falta é
auditar: a cobertura fechou em 29/29 no dia 19/08, mas todas as 29 notas são pré-correção, então o
que falta é a **renota**.

---

```
*aiox-master

Estou retomando um trabalho em andamento. Leia estes quatro arquivos ANTES de qualquer outra
coisa, na ordem:

1. HANDOFF.md        (estado, workflow, achados, próximo passo)
2. agente/rag-specialist.md                            (as 10 regras do protocolo de citação)
3. avaliacao/RUBRICA-AULAS.md   (como a nota é atribuída)
4. avaliacao/GATE-AULAS-v1.md   (notas e defeitos da rodada anterior)

CONTEXTO EM UMA FRASE: o curso de RAG em português está COMPLETO (29 de 29 aulas, AULA-00 a
AULA-28) sobre o repositório clonado da Packt em ../RAG-from-First-Principles/,
com um agente especialista versionado (@rag-specialist, nível L3). A auditoria adversarial cobriu
as 29 aulas (as 8 que faltavam — 08, 15, 16, 19-23 — foram auditadas nos lotes A-D). Mas as 29 notas
são ANTERIORES às correções, inclusive as oito mais novas: os defeitos que elas apontaram foram
corrigidos na mesma sessão. Nenhum veredicto de publicação até a renota.

NÃO escreva aula nova. Não há aula pendente.

CONTRATO INEGOCIÁVEL: o clone ../RAG-from-First-Principles/ NÃO é modificado. Todo material vai neste repositório. `git status` no clone deve terminar vazio — um auditor da rodada anterior
gravou um arquivo lá dentro, foi pego pelo git status e removido.

CONFIRA O ESTADO ANTES DE AGIR (três comandos, da raiz deste repositório):
  node ferramentas/verify-citations.js --all | tail -8
  git -C ../RAG-from-First-Principles status --short
  git log --oneline -4
O esperado ao fim de 19/08/2026: PASS, 1592 OK, zero inválidas (BAD_LINE, MISPLACED, NOT_FOUND e
BAD_ANCHOR em 0; 16 SKIPPED e 20 NO_ANCHOR são conferência à mão por desenho); clone vazio; quatro
commits locais, o último 3c30f75e. Se divergir, o HANDOFF é que está velho — corrija-o.
E não confie em resumo de cobertura: conte as notas registradas no GATE antes de afirmar quantas
aulas foram auditadas. O gate já afirmou 29/29 quando eram 21.

AS QUATRO REGRAS QUE MAIS IMPORTAM (das 10 na persona, todas nasceram de erro real medido):
- Nunca `grep -h` para citar. A flag suprime o caminho, e caminho ausente vira caminho inventado.
- Par de arquivos exige `diff`. Nunca inferir a diferença pelo sufixo do nome.
- Import não é uso. Grepar se o símbolo é exercitado antes de citá-lo como evidência.
- "Não afirmo" tem pré-requisito. Se o arquivo está no escopo e é pequeno, abrir é obrigatório —
  declarar limite no lugar de trabalho trivial é evasão, não rigor.

TAREFA 1 — TERMINAR A RENOTA: faltam 20 aulas.
9 das 29 foram renotadas em 19/08 (subtotal 86/108 contra 55/108 antes). Dez lotes morreram por
limite de sessão da API. Relançar estes, general-purpose em sonnet, somente-leitura, 2 aulas cada:
  B (08+09)  E (15+04)  G (19+01)  I (21+00)  J (22+02)
  K (23+14)  L (24+03)  M (26+25)  N (27+16)  O (28+11)
Três coisas que NÃO podem faltar no prompt de cada auditor:
  1. NÃO revelar a nota anterior — é o que dá sentido à comparação. Instrua a ignorar as notas
     antigas do GATE se topar com elas.
  2. Dizer que o --all está em PASS e que reconferir caminho/range não rende nota. O trabalho é
     conteúdo da linha citada, contradição interna, superlativo não marcado, coerência externa.
  3. pdftotext arquivo.pdf - para stdout, NUNCA com arquivo de saída. Duas violações do contrato
     já aconteceram por > acidental.
O desenho completo e o resultado das 9 estão na seção "Renota adversarial — rodada PARCIAL" do
avaliacao/GATE-AULAS-v1.md.


TAREFA 2 — FEITA. A triagem dos 48 BAD_ANCHOR fechou em 19/08: nenhum era defeito do material.
Dois bugs da ferramenta e onze redações ambíguas foram corrigidos, e o --all está em PASS. Se ele
voltar a dar FAIL, leia a seção "Triagem dos BAD_ANCHOR" do GATE antes de investigar do zero.

TAREFA 3 — PUSH (delegar a @devops):
O commit já aconteceu (84b1c77e). Faltam quatro commits locais na branch developer sem
correspondente no remote; o upstream configurado é origin/main e não existe origin/developer, então
decidir a branch de destino é parte da tarefa. Push é autoridade exclusiva do @devops
(Constitution, Artigo II).

Nesta ordem: 1, depois 2, depois 3. Me pergunte antes de mudar a ordem ou o escopo.
```

---

## Por que este prompt é assim

- **Aponta para o `HANDOFF.md` em vez de repetir tudo.** O handoff tem 14 seções verificadas; copiar
  o conteúdo dele no prompt criaria duas fontes que podem divergir.
- **Mas repete as quatro regras críticas.** Se o handoff não for lido com atenção, essas quatro são
  as que impedem os erros que já custaram nota nas avaliações.
- **Manda conferir o estado com três comandos antes de agir.** Esta é a mudança de 19/08: o handoff
  já divergiu do disco seis vezes, sempre por afirmação de estado escrita quando era verdadeira e
  nunca revisitada. O prompt agora diz o número esperado e manda corrigir o handoff se não bater.
- **Começa com `*aiox-master`.** Ativa o orquestrador do ecossistema AIOX, conforme a Constitution
  do projeto.
- **Fixa o modelo dos auditores em `sonnet`.** Não é preferência de custo: trocar o modelo torna as
  notas incomparáveis com a rodada anterior, e a comparação é o único jeito de saber se as correções
  funcionaram.
- **Diz explicitamente para não escrever aula.** Sem essa linha, a sessão nova encontra 29 aulas e um
  workflow de escrita detalhado na seção 5 e conclui que o trabalho é escrever a trigésima.
- **Pede confirmação antes de mudar escopo.** As decisões desta trilha estão registradas na seção 11
  do handoff justamente para não serem relitigadas.
- **Manda contar, não confiar.** O `GATE-AULAS-v1.md` afirmava cobertura de 29/29 em duas seções; a
  contagem mecânica das notas que ele mesmo registra dá 21. A sincronização de 19/08 repassou o 29/29
  para o HANDOFF antes de contar — por isso o prompt agora diz para contar.
