# AULA 02 — Vetores, embeddings e similaridade

**Fase 0 — Fundamentos** · Exercício próprio em `exercicios/aula-02-similaridade.py`

---

## Pergunta motivadora

Um computador não entende "cachorro" nem "canino". Como ele conclui que essas duas
palavras são parecidas, e que "cachorro" e "planilha" não são?

Toda a busca semântica de RAG depende dessa única ideia. Se você entender esta
aula de verdade, metade dos problemas de recuperação das aulas seguintes vira
óbvio.

---

## Modelo mental

### Texto como coordenada

Imagine um mapa onde cada texto é um ponto. Textos com significado próximo ficam
perto; distantes, longe. Um mapa de duas dimensões não dá conta da riqueza da
linguagem, então usamos centenas: `all-MiniLM-L6-v2` usa **384** dimensões,
`text-embedding-3-small` da OpenAI usa **1536**.

Um **embedding** é exatamente isso: a lista de coordenadas de um texto nesse espaço.
Um vetor de 384 números reais.

```
"cachorro"  → [ 0.21, -0.05,  0.88, ...,  0.12]   (384 números)
"canino"    → [ 0.19, -0.03,  0.91, ...,  0.10]   ← quase o mesmo ponto
"planilha"  → [-0.44,  0.71, -0.02, ..., -0.63]   ← outro canto do espaço
```

Ninguém programou "cachorro é parecido com canino". O modelo de embedding aprendeu
isso lendo bilhões de frases e observando que essas palavras aparecem em contextos
equivalentes. É a hipótese distribucional: **o significado de uma palavra é dado
pela companhia que ela mantém.**

### O que cada dimensão significa

Nada interpretável. Não existe "a dimensão 47 é masculinidade". As dimensões são
um espaço latente aprendido; individualmente são opacas, coletivamente carregam
semântica. Não perca tempo tentando ler uma dimensão isolada — é a geometria do
conjunto que importa.

### Por que buscar por vetor bate buscar por palavra-chave

Busca por palavra-chave falha em três situações que embedding resolve:

| Situação                                                | Palavra-chave | Embedding |
| ------------------------------------------------------- | ------------- | --------- |
| Sinônimo ("rescindir" vs. "cancelar")                   | falha         | acerta    |
| Paráfrase ("como devolvo?" vs. "política de devolução") | falha         | acerta    |
| Outro idioma (com modelo multilíngue)                   | falha         | acerta    |

E **falha** onde palavra-chave é imbatível:

| Situação                                        | Palavra-chave | Embedding           |
| ----------------------------------------------- | ------------- | ------------------- |
| Código de produto `SKU-88213-B`                 | acerta        | erra                |
| Nome próprio raro                               | acerta        | frequentemente erra |
| Termo técnico ausente do treino                 | acerta        | erra                |
| Negação ("contratos **sem** cláusula de multa") | parcial       | erra feio           |

Esta tabela é o argumento inteiro a favor de **busca híbrida** (Aula 11). Não é que
uma abordagem é melhor: elas falham em conjuntos disjuntos de casos. Guarde isso —
é a lição mais rentável do curso.

O caso da negação merece destaque, porque surpreende: o embedding de "contrato com
cláusula de multa" e o de "contrato sem cláusula de multa" são **muito parecidos**,
já que compartilham quase todo o vocabulário. O espaço vetorial captura _assunto_,
não _polaridade_. Se seu domínio depende de negação, planeje para isso.

### Medindo proximidade

Três medidas aparecem no código do repositório, e escolher a errada corrompe o
ranking em silêncio.

**Similaridade de cosseno** — cosseno do ângulo entre os vetores. Ignora
comprimento, compara só direção. Vai de −1 (opostos) a 1 (idênticos). É o padrão
em RAG textual porque os modelos de recuperação são **treinados com objetivo
contrastivo sobre cosseno**: o espaço é calibrado para ângulo, e a magnitude não
carrega semântica treinada. (A maioria desses modelos já entrega vetor
normalizado, onde a norma é constante por construção.)

> ⚠️ **O intervalo teórico não é o intervalo prático — e isso decide qualquer
> limiar.** Embeddings de texto ocupam um cone estreito do espaço (anisotropia):
> pares **sem relação nenhuma** costumam pontuar bem acima de 0, em alguns modelos
> perto de 0,6. Quem sai daqui achando que 0,5 é "meio parecido" vai calibrar
> limiar errado — e as Aulas 11 e 14 recomendam usar limiar.
>
> Três consequências: score de cosseno **não é probabilidade**; **não é comparável**
> entre modelos nem entre corpora; e qualquer limiar é propriedade do par
> (modelo, corpus). O procedimento para achá-lo: pegue pares que você sabe serem
> relevantes e pares que sabe serem irrelevantes, meça a distribuição de scores de
> cada grupo, e escolha o corte onde elas se separam. Isso se mede, não se adivinha.

```
cos(A, B) = (A · B) / (‖A‖ × ‖B‖)
```

**Produto interno (dot product / IP)** — soma dos produtos componente a componente.
Considera direção _e_ magnitude. Quando os vetores estão normalizados
(‖v‖ = 1), é **matematicamente idêntico** ao cosseno — e mais rápido, porque
dispensa a divisão. Vários modelos já entregam vetores normalizados, o que torna
IP a escolha eficiente.

**Distância euclidiana (L2)** — distância em linha reta. Aqui a armadilha:
**menor é mais parecido**, invertendo o sentido em relação às duas anteriores. Se
você trocar cosseno por L2 e esquecer de inverter a ordenação, seu retriever passa
a devolver os documentos _menos_ relevantes — e não vai lançar erro nenhum.

Este é o bug mais insidioso de RAG iniciante. Ele não quebra: ele piora.

### A ligação com o índice do vector DB

Na Aula 10 você vai declarar `metric_type` ao criar o índice no Milvus:
`COSINE`, `IP` ou `L2`. Essa escolha **precisa casar** com o modelo de embedding.
FAISS, usado em `00-SimpleRAG/05_RAG_from_Scratch_*.py`, tem
`IndexFlatL2` (euclidiana) e `IndexFlatIP` (produto interno) como classes
separadas — a métrica é escolhida no tipo do índice.

Note que o script do repositório usa `IndexFlatL2` com vetores do
`all-MiniLM-L6-v2`. Esse modelo entrega vetores normalizados, e para vetores
normalizados a ordenação por L2 e por cosseno é equivalente — L2 crescente
corresponde a cosseno decrescente. Por isso funciona. Mas é uma coincidência
conveniente, não um princípio: com vetores não normalizados, o resultado
divergiria.

---

## Mão na massa

Rode o exercício desta aula:

```powershell
cd exercicios
python aula-02-similaridade.py
```

Ele usa apenas `sentence-transformers` e `numpy`, já instalados na Aula 00. O
script:

1. gera embeddings de um punhado de frases em português
2. mostra a dimensão do vetor e um recorte dos primeiros valores
3. calcula cosseno, produto interno e L2 entre todos os pares
4. ranqueia as frases contra uma consulta pelas três métricas, lado a lado
5. demonstra o caso da negação
6. demonstra a falha com código de produto

Observe, na saída, três coisas:

- **Pares sinônimos** têm cosseno alto sem compartilhar palavra **de conteúdo** alguma (as
  stopwords "o" e "no" aparecem nos dois; nenhum substantivo ou verbo aparece). É a busca
  semântica funcionando.
- **Cosseno e IP** produzem ranking idêntico, porque o modelo normaliza. **L2**
  produz a ordem inversa nos números, mas o mesmo ranking depois de inverter.
- A frase com **negação** fica próxima da sua afirmativa. Exatamente o problema
  descrito acima, medido na sua tela.

---

## Quebre de propósito

Três experimentos, em ordem de valor:

**1. Ranqueie por L2 sem inverter a ordem.** O script tem um comentário marcando
onde. Faça isso e veja o retriever devolver o pior resultado como primeiro. Fixe
esse sintoma na memória: quando um RAG seu retornar resultados sistematicamente
absurdos, essa é a primeira hipótese.

**2. Troque o modelo por um multilíngue.** Substitua `all-MiniLM-L6-v2` por
`paraphrase-multilingual-MiniLM-L12-v2`. Compare os cossenos entre as frases em
português. Aumentam. Motivo: o primeiro modelo foi treinado predominantemente em
inglês e representa português de forma mais grosseira — questão prática direta para
qualquer RAG em português.

**3. Adicione uma frase com jargão do seu domínio.** Algo como
"o CFOP 5102 exige destaque de ICMS na nota". Compare com uma frase genérica sobre
impostos. O cosseno será mais baixo do que a relação real justifica: o modelo não
conhece `CFOP`. É o argumento empírico para fine-tuning de embedding (Aula 08) ou
para busca híbrida (Aula 11).

---

## Armadilhas de produção

- **Trocar de modelo de embedding sem reindexar.** Vetores de modelos diferentes
  vivem em espaços incompatíveis. Comparar um com outro produz ruído, não
  similaridade. Trocou de modelo, reindexa tudo.
- **Métrica do índice incompatível com o modelo.** Silencioso, como descrito.
- **Assumir que cosseno alto significa "responde à pergunta".** Cosseno mede
  proximidade de assunto. Um documento pode falar exatamente do tema e não conter a
  resposta. É o que reranking (Aula 17) existe para corrigir.
- **Ignorar o limite de tokens do modelo de embedding.** Cada modelo trunca acima
  de um limite (512 tokens é comum). Chunk maior que isso tem o excedente
  **descartado em silêncio** — você acredita que indexou o parágrafo inteiro e
  indexou metade. Liga direto com a Aula 07.
- **Custo de embutir.** Reindexar milhões de chunks via API paga é caro. Um modelo
  local resolve — e é por isso que a decisão embedding/geração é separada.
- **Dimensionalidade como métrica de qualidade.** 1536 dimensões não é
  "melhor" que 384. Custa mais memória e mais tempo de busca. Meça recall no _seu_
  corpus; não escolha por número.

---

## Checkpoint

1. O que um embedding representa, e por que uma dimensão isolada não é
   interpretável?
2. Cite dois casos em que busca por palavra-chave vence embedding, e dois em que
   perde.
3. Quando produto interno é equivalente à similaridade de cosseno?
4. Por que L2 é a métrica mais perigosa de configurar errado?
5. Por que "contrato com multa" e "contrato sem multa" têm embeddings próximos, e
   que consequência prática isso traz?
6. O que acontece com um chunk maior que o limite de tokens do modelo de embedding?
7. Você trocou de modelo de embedding. O que precisa ser feito no índice existente?

---

## Vocabulário

`embedding` · `dimension` · `dense vector` · `sparse vector` ·
`cosine similarity` · `dot product` · `euclidean distance (L2)` · `metric type`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 01 — O que é RAG](AULA-01-o-que-e-rag.md)
**Próxima:** [AULA 03 — Seu primeiro RAG](AULA-03-primeiro-rag.md)
