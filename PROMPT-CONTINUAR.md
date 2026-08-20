# Prompt para retomar em sessão nova

Copie o bloco abaixo inteiro e cole como **primeira mensagem** de uma sessão nova do Claude Code,
aberta em `E:\Projetos\rag\rag-auditado-ptbr`.

**Atualizado em 20/08/2026,** depois de o curso migrar do monorepo `aiox` para este repositório
próprio. A versão anterior deste arquivo abria com `*aiox-master` — que **não existe aqui**: este
repo é standalone, sem o framework AIOX. Não invoque agente do AIOX nesta sessão.

---

```
Estou retomando um trabalho em andamento. Leia estes quatro arquivos ANTES de qualquer outra
coisa, na ordem:

1. HANDOFF.md                    (estado, workflow, achados, próximo passo)
2. agente/rag-specialist.md      (as 10 regras do protocolo de citação)
3. avaliacao/RUBRICA-AULAS.md    (como a nota é atribuída)
4. avaliacao/GATE-AULAS-v1.md    (notas e defeitos das rodadas anteriores)

CONTEXTO EM UMA FRASE: curso de RAG em português COMPLETO (29 aulas, AULA-00 a AULA-28) construído
sobre o repositório de código de RAG from First Principles (Packt), que precisa estar clonado como
pasta IRMÃ em ../RAG-from-First-Principles/. Acompanha um agente especialista versionado
(@rag-specialist, nível L3) e um aparato de verificação: ferramenta de citações, rubrica de seis
dimensões, dois exames e gates de auditoria adversarial.

ONDE ESTÁ: este repositório é público em https://github.com/SaLuanVitor/rag-auditado-ptbr
(branch main, um commit, autoria só do usuário). NESTE repo os commits NÃO levam
Co-Authored-By Claude — é decisão do usuário, vale só aqui.

NÃO escreva aula nova. Não há aula pendente.

CONTRATO INEGOCIÁVEL: o clone ../RAG-from-First-Principles/ NÃO é modificado. `git status` dentro
dele deve terminar vazio. Três auditores de rodadas anteriores já violaram isso por acidente — um
gravou um .bin dentro do clone, dois criaram arquivo no %TEMP% com `>` — e todos se autodenunciaram.
Se precisar extrair PDF, use `pdftotext arquivo.pdf -` para stdout, NUNCA com arquivo de saída.

CONFIRA O ESTADO ANTES DE AGIR (três comandos, da raiz deste repositório):
  node ferramentas/verify-citations.js --all | tail -8
  git -C ../RAG-from-First-Principles status --short
  git log --oneline

O esperado em 20/08/2026: PASS, 1610 OK, zero inválidas (BAD_LINE, MISPLACED, NOT_FOUND e
BAD_ANCHOR todos em 0; 16 SKIPPED e 20 NO_ANCHOR são conferência à mão por desenho); clone vazio;
um commit, 6658768a. Se divergir, o HANDOFF é que está velho — corrija-o antes de seguir.

E não confie em resumo de cobertura: CONTE as notas registradas no GATE antes de afirmar quantas
aulas foram auditadas. O gate já afirmou 29/29 quando eram 21, e esse número falso foi repassado
para o HANDOFF por quem leu o resumo em vez de contar.

AS QUATRO REGRAS QUE MAIS IMPORTAM (das 10 na persona, todas nasceram de erro real medido):
- Nunca `grep -h` para citar. A flag suprime o caminho, e caminho ausente vira caminho inventado.
- Par de arquivos exige `diff`. Nunca inferir a diferença pelo sufixo do nome.
- Import não é uso. Grepar se o símbolo é exercitado antes de citá-lo como evidência.
- Contagem à mão é onde este material erra. `awk 'END{print NR}'`, nunca `wc -l` (subconta 1 em
  arquivo sem newline final — já produziu duas alucinações). Razão calculada de cabeça também:
  "dez vezes" onde era 5,7.

TAREFA 1 — TERMINAR A RENOTA. Faltam 20 aulas.
9 das 29 foram renotadas em 19/08: subtotal 86/108 contra 55/108 antes, Delta médio +3,44, seis
subiram, duas empataram, uma caiu. Dez lotes morreram por limite de sessão da API. Relançar
exatamente estes, general-purpose em sonnet, somente-leitura, 2 aulas por lote:
  B (08+09)  E (15+04)  G (19+01)  I (21+00)  J (22+02)
  K (23+14)  L (24+03)  M (26+25)  N (27+16)  O (28+11)

Três coisas que NÃO podem faltar no prompt de cada auditor:
  1. NÃO revelar a nota anterior. É o que dá sentido à comparação. As notas antigas estão no GATE;
     instrua a ignorar se topar com uma.
  2. Dizer que o --all está em PASS e que reconferir caminho/range não rende nota. O trabalho é:
     conteúdo da linha citada, contradição interna, superlativo não marcado, coerência externa.
  3. pdftotext para stdout, contrato somente-leitura citando as violações anteriores.

O desenho completo dos lotes e o resultado das 9 estão na seção "Renota adversarial — rodada
PARCIAL" do avaliacao/GATE-AULAS-v1.md. Vale considerar DOIS auditores por aula onde o Delta for
grande: a rodada parcial mediu de +11 (AULA-13) a -2 (AULA-10), e com um auditor por aula a nota é
sinal, não gate.

TAREFA 2 — LICENÇA. O README tem uma seção "Licença: ainda não definida". Repo público sem licença
deixa o leitor sem saber o que pode fazer. Escolher é decisão do usuário — PERGUNTE, não decida.
O material didático é original; o repositório de código analisado é de terceiros e não está incluído.

TAREFA 3 — CERTIFICADOS. O usuário mencionou querer certificados no repo. Nenhum foi encontrado em
disco (a busca só achou arquivos de biblioteca Python). PERGUNTE onde estão antes de qualquer coisa.

DEPOIS DAS TRÊS: com a renota completa, aí sim dá para falar de classificação de publicação segundo
a RUBRICA. Hoje duas aulas não renotadas (AULA-03 = 0/12, AULA-25 = 4/12) estão abaixo da porta de
50% que a rubrica exige até para "publicável com ressalvas". Nenhuma classificação é declarada, e
declarar antes seria o erro que a AULA-22 deste curso ensina a não cometer.
```

---

## Por que este prompt é assim

- **Não abre com `*aiox-master`.** Este repositório não tem o framework AIOX. A versão anterior
  deste arquivo abria assim e mandaria a sessão nova invocar um agente que não existe.
- **Aponta para o `HANDOFF.md` em vez de repetir tudo.** Duas fontes divergem; uma não.
- **Manda conferir o estado com três comandos, e dá o número esperado.** Este projeto já viu nove
  afirmações de estado ficarem obsoletas por nunca serem revisitadas. O prompt diz o número e manda
  corrigir o handoff se não bater.
- **Manda contar, não confiar.** O `GATE-AULAS-v1.md` afirmou cobertura de 29/29 quando eram 21, e
  o número falso foi repassado por quem leu o resumo em vez de contar as notas registradas.
- **Fixa o modelo dos auditores em `sonnet`.** Não é custo: trocar o modelo torna as notas
  incomparáveis com a rodada anterior, e a comparação é o único jeito de saber se as correções
  funcionaram.
- **Proíbe revelar a nota anterior ao auditor.** Foi a decisão que deu sentido à renota. Sem isso a
  segunda medida vira confirmação da primeira.
- **Diz explicitamente para não escrever aula.** Sem essa linha, a sessão nova encontra 29 aulas e um
  workflow de escrita detalhado no handoff e conclui que o trabalho é escrever a trigésima.
- **Manda perguntar sobre licença e certificados.** As duas são decisões do usuário, e uma delas
  (licença) tem consequência jurídica num repo público.
