# Exame v3 — agente `rag-specialist` (Vetor)

30 questões **novas**, nenhuma repetida do [`EXAME-RAG.md`](EXAME-RAG.md) nem do
[`EXAME-RAG-v2.md`](EXAME-RAG-v2.md). Mesma rubrica ([`RUBRICA.md`](RUBRICA.md)).

Tipos: `F` fato verificável · `C` conceito · `A` armadilha · `J` julgamento.
Distribuição **contada, não pretendida**: **10 `F`, 7 `C`, 8 `A`, 5 `J` — 60 pontos.**

> O primeiro rascunho declarava “8 `C`, 6 `A`, 6 `J`”, que era o desenho, e as questões
> escritas deram outra coisa. **Cabeçalho que afirma a própria contagem** é a forma que este
> projeto mais cometeu, e o `contagem.js` não a alcança aqui porque o numeral não anuncia uma
> lista. Contado por comando antes de publicar; a intenção de subir `A` e `J` se cumpriu, e a de
> manter seis de cada não.

## Calibração deliberada deste exame

O v3 muda de eixo em relação aos dois anteriores, e a razão está medida no
[gate v2](GATE-RAG-SPECIALIST-v2.md): o gargalo deixou de ser **localizar** e passou a ser
**verificar comportamento**. As lacunas de citação foram resolvidas por ferramental, com zero erros
desse tipo no v2; o tipo `F` ficou em 65% porque depende de abrir arquivo e conferir o que ele faz.

Três decisões, e cada uma tem um porquê:

1. **`A` sobe de 5 para 8 e `C` cai de 10 para 7**, com `J` em 5. Conceito era o tipo mais forte nos
   dois exames. Armadilha e julgamento são onde o nível L4 se decide, e onde um agente que sabe a
   teoria ainda erra.
2. **Metade das `F` exige executar ou comparar versões, não localizar.** Várias só se respondem com
   o ambiente montado, e o agente tem `ferramentas/montar-ambiente.sh` para isso. Uma questão cuja
   resposta sai do `FATOS.md` não mede mais nada que os dois exames anteriores não tenham medido.
3. **Seis questões miram o que mudou depois do v2**, e nenhuma pode ser respondida de memória do v2:
   a capacidade de vigilância, as doze formas de defeito, a distinção entre pin e instrumento, as
   remoções do `langchain-core` 1.x, a separação entre superfície viva e registro, e o DoD.

**O que este exame NÃO mede, declarado:** ele não mede didática, porque o agente não escreve aula
durante o exame; e não mede o que a persona faz sob contradição do usuário, que é comportamento de
sessão e não de pergunta.

Respostas em `RESPOSTAS-v3.md`. Veredito em `GATE-RAG-SPECIALIST-v3.md`.

---

## Capítulo 1 — A fonte e o que ela pina

**Q01 `F`** — O repositório pina `llama-index-core` em mais de uma versão. Quais são, em quantos
`requirements` cada uma aparece, e qual arquivo o deixa **sem** versão? Cite os caminhos.

**Q02 `A`** — A AULA-20 diz "medido no `pydantic` 2.13.4". Logo o repositório pina o `pydantic`
2.13.4. Correto?

**Q03 `C`** — Qual a diferença entre **pin da fonte** e **versão do instrumento**, e por que
confundir as duas produz uma afirmação falsa sobre o repositório mesmo quando a medição está certa?

---

## Capítulo 2 — Comportamento, não localização

**Q04 `F`** — Com o ambiente do curso montado, `llm(...)` num `BaseChatModel` funciona ou levanta?
E com a versão corrente do `langchain-core`? Responda as duas, dizendo em que versão mediu cada uma.

**Q05 `F`** — `PromptTemplate.format` recebendo **mais** chaves do que o template declara: rejeita
ou ignora? E recebendo **menos**? A assimetria importa para qual defeito do repositório?

**Q06 `A`** — Um aviso de depreciação diz "will be removed in 1.0". Como a biblioteca está em 1.6,
o método já não existe. Correto, e como você sabe?

**Q07 `J`** — Você precisa medir se uma API foi removida na versão nova. O ambiente pinado do curso
está montado e funcionando. Descreva o que você faz, e diga o que **não** faz e por quê.

---

## Capítulo 3 — Evidência, e de que tipo

**Q08 `C`** — Documentação do fornecedor e execução respondem perguntas diferentes sobre um modelo
retirado. Quais são as duas perguntas, e qual evidência responde qual?

**Q09 `A`** — O `gpt-4-vision-preview` de `10-AdvanceRAG/05-MultiModalRAG/` é um identificador de
preview, e previews são retirados. Então a aula pode afirmar que a chamada falha hoje. Correto?

**Q10 `F`** — O prompt `rlm/rag-prompt` é puxado da rede por quantos arquivos do repositório? Liste-os
e diga, para cada um, se ele alimenta uma geração ou só é carregado.

**Q11 `J`** — Um valor que só existe na rede em tempo de execução foi transcrito numa aula. Que
ressalva a aula **tem** de carregar junto, e por que transcrever não fecha o problema de auditoria?

---

## Capítulo 4 — Medir o que a métrica não diz

**Q12 `F`** — Em `09-Evaluation/01-RAGAS.py`, as respostas avaliadas são geradas por um pipeline ou
escritas à mão? Cite a linha. Que consequência isso tem para o que os números do arquivo medem?

**Q13 `F`** — O resultado de `evaluate()` no `ragas` que o módulo pina guarda uma nota por amostra ou
uma nota agregada? O que o script faz com isso, e em que linha?

**Q14 `C`** — A fidelidade de uma amostra é uma razão. Qual é o denominador, quem o produz, e por que
isso torna "repetir a medição" diferente de "reportar o desvio entre amostras"?

**Q15 `A`** — O arquivo declara um vencedor entre dois modelos de embedding por uma diferença de
0,0861. Para confiar nisso basta repetir a medição algumas vezes. Correto?

---

## Capítulo 5 — Propagação e superfícies

**Q16 `C`** — O que é uma **superfície de fecho**, e por que consertar um fato só no corpo de uma
aula é considerado, neste projeto, o mesmo defeito que não consertar?

**Q17 `F`** — Quantas ferramentas existem em `ferramentas/`, quantas têm suíte, e qual comando roda
todas? O que a suíte exige de cada ferramenta além de passar?

**Q18 `J`** — Você corrigiu um conceito numa aula. Descreva, em ordem, o que faz para garantir que a
correção alcançou tudo que precisa alcançar, nomeando as ferramentas e o que cada uma **não** vê.

**Q19 `A`** — Uma varredura por um termo devolveu todas as superfícies vivas que o mencionam. Logo a
correção está completa. Correto?

**Q20 `C`** — Por que `avaliacao/` fica **fora** da varredura de citação entre aulas, e o que
aconteceria se entrasse?

---

## Capítulo 6 — O que apodrece sozinho

**Q21 `F`** — Como se pergunta se o repositório-gabarito andou **sem** modificar o clone pinado?
Dê o comando e diga o que ele não consegue responder.

**Q22 `C`** — Por que `git fetch` no clone viola o contrato desta auditoria, se ele não muda nenhum
arquivo da árvore de trabalho?

**Q23 `A`** — O `vigia.js` rodou e não acusou mudança. Logo nada mudou. Correto?

**Q24 `J`** — O vigia acusa que uma biblioteca citada por cinco aulas andou duas versões maiores.
O que você faz, e em que ordem? Diga explicitamente o que **não** faz com o texto das aulas.

---

## Capítulo 7 — Referência que envelhece

**Q25 `C`** — Cite três formas de referência que apodrecem num documento vivo, ordenadas pela
velocidade com que envelhecem, e diga o que se cita no lugar de cada uma.

**Q26 `A`** — Um documento afirma "2192 citações verificadas". O número foi medido hoje por comando,
então é uma boa afirmação para um README. Correto?

**Q27 `F`** — O `GATE` registra uma citação que aponta para o estado de uma rodada anterior, e ela
não bate com o arquivo de hoje. É defeito? Justifique pela distinção que o projeto usa.

---

## Capítulo 8 — O critério, e quem o julga

**Q28 `F`** — Quantas condições tem o DoD do curso, onde elas vivem, e qual delas **não** é
decidível por máquina? Que comando reporta as demais?

**Q29 `J`** — Uma condição de DoD não pode ser satisfeita por execução nenhuma, porque verificar
produz trabalho novo que fica sem verificação. O que se faz com uma condição assim, e o que se
declara ao fazer?

**Q30 `A`** — Todas as nove condições verificáveis por comando passaram. O projeto cumpriu o DoD.
Correto?

---

## Como este exame é corrigido

Mesma rubrica dos anteriores, com uma regra de aplicação que vem do gate v1 e continua valendo:
**resposta com citação que não reproduz vale zero na questão**, independentemente da prosa.

E uma regra nova, desta rodada: **o agente não corrige o próprio exame**. Auto-atribuir nota é o que
a `RUBRICA-AULAS.md` proíbe para o material, e não há razão para valer menos aqui.
