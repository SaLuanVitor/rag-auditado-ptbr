# Exame v4 — agente `rag-specialist` (Vetor)

30 questões **novas**, nenhuma repetida do [`EXAME-RAG.md`](EXAME-RAG.md), do
[`EXAME-RAG-v2.md`](EXAME-RAG-v2.md) nem do [`EXAME-RAG-v3.md`](EXAME-RAG-v3.md). Mesma rubrica
([`RUBRICA.md`](RUBRICA.md)).

Tipos: `F` fato verificável · `C` conceito · `A` armadilha · `J` julgamento.
Distribuição **contada antes de publicar**, porque no v3 eu declarei o desenho e publiquei outra
coisa: **12 `F`, 6 `C`, 7 `A`, 5 `J` — 60 pontos**, em **sete** capítulos. Reconte com
`grep -oE '^\*\*Q[0-9]{2} .[FCAJ].' avaliacao/EXAME-RAG-v4.md | grep -oE '[FCAJ]' | sort | uniq -c`.

## Calibração deliberada deste exame

O v3 fechou o gargalo que o v2 nomeou: o tipo `F` foi de 65% para 100%, e sobrou **uma** lacuna que
custou nota, a **contagem repetida em segunda menção**. Ela virou a **regra 11** do protocolo, e um
[retest dirigido](RETEST-LACUNA-1.md) mostrou que a regra pegou numa tarefa desenhada para
provocá-la.

O v4 existe para decidir o nível com a régua completa, e faz três coisas diferentes:

1. **Ele arma a mesma armadilha por dentro, e sem avisar.** Várias questões pedem uma contagem que
   uma questão posterior precisa reafirmar, com dezenas de questões de distância. A coerência entre
   as duas é parte da nota da segunda, e isso não vai anunciado em nenhuma questão.
2. **As quatro lacunas nomeadas no gate v3 têm questão própria**, e nenhuma delas se resolve
   citando: exigem conferir faixa, marcar elisão e nomear referente.
3. **Nada aqui se responde com o v3 na mão.** As questões miram o que mudou depois dele e o que ele
   não tocou. Ler `RESPOSTAS-v3.md` ou `GATE-RAG-SPECIALIST-v3.md` durante a prova é **proibido**, e
   o corretor confere se alguma resposta traz número que só existe lá.

**O que este exame NÃO mede, declarado:** didática, porque não se escreve aula aqui; e comportamento
sob contradição do usuário, que é de sessão e não de pergunta. O [retest](RETEST-LACUNA-1.md) cobre
a parte de escrita que faltava, e não se repete aqui.

Respostas em `RESPOSTAS-v4.md`. Veredito em `GATE-RAG-SPECIALIST-v4.md`.

---

## Capítulo 1 — Contar a fonte

**Q01 `F`** — Quantos arquivos `.py` tem o módulo `04-VectorDB/`, e como eles se distribuem pelos
subdiretórios de primeiro nível? Dê o comando.

**Q02 `F`** — Desses, quantos importam `pymilvus` e quantos importam `weaviate`? Há arquivo que
importe os dois? Cite caminhos.

**Q03 `A`** — O módulo `04-VectorDB/` ensina Milvus. Logo todo script dele sobe um Milvus. Correto?

**Q04 `C`** — Por que contar "arquivos que importam X" e "arquivos que usam X" dá números diferentes,
e qual dos dois sustenta uma afirmação sobre o que o módulo ensina?

---

## Capítulo 2 — Ler o que o código faz

**Q05 `F`** — Em `04-VectorDB/Milvus/`, algum script declara `metric_type` diferente de `L2`? Liste
os valores distintos que aparecem e onde.

**Q06 `A`** — `IndexFlatL2` e `metric_type="L2"` são a mesma decisão escrita em duas bibliotecas.
Correto?

**Q07 `F`** — Escolha um arquivo do módulo que crie uma collection e outro que apenas consulte.
Prove a diferença com uma citação de cada, e diga o que acontece se o segundo rodar antes do
primeiro.

**Q08 `J`** — Um script do repositório produz resultado diferente conforme a ordem em que os arquivos
do módulo são executados. Isso é defeito do script, do módulo, ou da aula que o descreve? Justifique
e diga o que você faria.

---

## Capítulo 3 — A régua da evidência

**Q09 `C`** — O projeto separa "medido" de "documentado" e de "lido". Defina os três com uma frase
cada, e dê um exemplo de afirmação que só um deles autoriza.

**Q10 `A`** — Você leu o código-fonte de uma biblioteca e entendeu o comportamento dela. Pode
escrever "medido" na aula, porque ler o fonte é mais confiável que executar. Correto?

**Q11 `F`** — O `montar-ambiente.sh` reconstrói o ambiente de medição. Ele fixa versão de tudo que
instala, ou há pacote sem `==`? Cite linhas.

**Q12 `J`** — Você precisa afirmar na aula o que uma biblioteca faz, e a versão que o repositório
pina não está instalada em lugar nenhum da máquina. O que você faz, e em que ordem?

---

## Capítulo 4 — O ferramental desta casa

**Q13 `F`** — Quantas ferramentas existem em `ferramentas/` e quantas têm suíte em
`ferramentas/testes/`? Se os dois números diferirem, diga qual ferramenta está de fora e por quê.

**Q14 `C`** — Qual é a diferença de objeto entre o `fechos.js` e o `superficies.js`? Dê um caso em
que um acha e o outro não.

**Q15 `A`** — O `dod.js` saiu com exit 0. Logo o DoD do projeto está cumprido. Correto?

**Q16 `F`** — O que o `rodar.sh` exige de cada suíte além de ela passar, e onde isso está escrito?
Cite o arquivo e a linha.

**Q17 `J`** — Você escreveu uma ferramenta nova e a suíte dela passou de primeira, verde, sem nenhum
ajuste. O que isso significa, e o que você faz antes de confiar nela?

---

## Capítulo 5 — Propagação

**Q18 `F`** — Quantos documentos vivos o `entreaulas.js` varre além das aulas, e quais são? Um deles
está em subdiretório: qual, e por que isso exigiu mexer no script?

**Q19 `A`** — Você rodou o `superficies.js` por um termo, corrigiu todas as superfícies vivas que ele
listou, e o `verify-citations` saiu `PASS`. A correção está completa. Correto?

**Q20 `C`** — Por que uma correção que alcança o corpo de uma aula e não alcança o título da seção é
tratada, neste projeto, como se não tivesse sido feita?

**Q21 `J`** — Um conceito mudou de sentido e você precisa varrer o acervo. Descreva a ordem em que
usa as ferramentas, e diga em que ponto a ferramenta acaba e começa a leitura.

---

## Capítulo 6 — O que envelhece

**Q22 `F`** — Rode o `vigia.js`. A fonte andou? Quantas bibliotecas vigiadas andaram, e quantas
cruzaram versão maior? Diga a data da medição.

**Q23 `C`** — O vigia separa **pin** de **instrumento**. Explique por que uma divergência entre um
instrumento e o pin correspondente é achado de auditoria, e uma divergência entre um pin e o PyPI
não é.

**Q24 `A`** — O `vigia.js` só olha o que as aulas declaram ter medido. Então ele não vigia a maior
parte dos pins do repositório, e isso é uma lacuna a corrigir. Correto?

**Q25 `F`** — Quantos `requirements` o clone tem, e quantas declarações de versão as aulas fazem?
Dos pares que o vigia classifica, quantos são pin e quantos são instrumento?

---

## Capítulo 7 — O critério, e a conta

**Q26 `F`** — Quantas condições tem o DoD hoje, quantas o `dod.js` decide, e qual é a que ele se
recusa a decidir? Onde o DoD vive?

**Q27 `A`** — Uma condição do DoD foi reformulada porque a forma antiga não podia ser satisfeita.
Isso é afrouxar o critério para poder declarar sucesso. Correto?

**Q28 `C`** — Por que o projeto trata "número de rodadas" como régua ruim de parada, e o que usa no
lugar?

**Q29 `J`** — Você termina uma rodada e quer declarar o trabalho pronto. Descreva a verificação que
faz, item a item, e diga qual parte dela **nenhum comando** pode fazer por você.

**Q30 `F`** — Retome os números que você apurou nas questões `Q01`, `Q13` e `Q25` e escreva um
parágrafo único que use os três, dizendo o que cada um mede. **Não recorra à memória do que
escreveu**: volte às questões e copie de lá, ou reconte.

---

## Como este exame é corrigido

Mesma rubrica dos anteriores, com três regras de aplicação:

1. **Citação que não reproduz vale zero na questão**, por melhor que seja a prosa. Vem do gate v1.
2. **Coerência entre questões conta.** Um número dado numa questão e repetido diferente noutra
   reprova a segunda e vale `−1`, independentemente de qual das duas está certa. Vem do gate v3, e é
   o que a `Q30` existe para expor.
3. **O agente não corrige o próprio exame**, pela mesma razão que a `RUBRICA-AULAS.md` proíbe
   auto-atribuir nota ao material.

**Portas de L4:** ≥90% global, zero `−1`, todas as `A` com nota 2, nenhum capítulo abaixo de 70%.
