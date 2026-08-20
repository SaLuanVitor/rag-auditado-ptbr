# AULA 01 — O que é RAG e qual problema real ele resolve

**Fase 0 — Fundamentos** · Sem código de framework. Só modelo mental.

---

## Pergunta motivadora

Um LLM já "sabe" muita coisa. Por que não simplesmente colocar seus documentos no
prompt e pronto?

Essa pergunta parece ingênua, mas é a que mais muda o resto, no meu julgamento — porque a resposta
honesta é: **às vezes é exatamente isso que você deve fazer.** Se seu acervo cabe
na janela de contexto, RAG é complexidade sem retorno. Saber quando _não_ usar RAG
é parte de ser especialista em RAG.

RAG existe para quando não cabe. E o "não cabe" tem quatro causas distintas.

---

## Modelo mental

### Os quatro limites que criam RAG

**1. Limite de volume.** Um modelo com 200 mil tokens de contexto engole umas 500
páginas. Sua base de conhecimento tem 50 mil documentos. Não há janela que resolva.

**2. Limite de custo e latência.** Mesmo que caiba, você paga por token de entrada
em _toda_ chamada. Enviar 200 mil tokens para responder "qual o prazo de garantia?"
é desperdício de duas a três ordens de magnitude. Além disso, prompt gigante é
prompt lento.

**3. Limite temporal.** O modelo tem um `knowledge cutoff`. Informação criada depois
dele — ou que muda toda semana, como preço e estoque — não existe para o modelo.
Retreinar não é opção; recuperar é.

**4. Limite de proveniência.** Este é, no meu julgamento, o mais subestimado. Quando o modelo responde
a partir de peso interno, você não tem como saber _de onde_ veio a afirmação.
Quando responde a partir de trecho recuperado, você cita a fonte. Em domínio
jurídico, médico ou fiscal, isso não é conveniência — é requisito.

O quarto limite é o que faz RAG sobreviver mesmo quando as janelas de contexto
crescem. Janela maior resolve volume; não resolve proveniência.

### O loop, em três movimentos

```
Pergunta do usuário
       │
       ▼
[1] RETRIEVE  ── busca no seu acervo os k trechos mais relevantes
       │
       ▼
[2] AUGMENT   ── monta um prompt: instruções + trechos + pergunta
       │
       ▼
[3] GENERATE  ── o LLM responde usando os trechos como evidência
       │
       ▼
Resposta ancorada, com fonte citável
```

Isso é RAG por inteiro. Todo o resto do curso — 27 aulas, da 02 à 28 — é sobre **por que cada
um desses três passos falha** e o que se faz a respeito.

### O que RAG realmente muda no comportamento do modelo

Sem RAG, o LLM é um estudante fazendo prova de memória: fluente, confiante, e
capaz de inventar quando não sabe.

Com RAG, é o mesmo estudante com consulta permitida. Continua fluente. **Ainda pode
inventar** — e essa é a expectativa que você precisa calibrar já na aula 01. RAG
reduz alucinação; não a elimina. Um modelo com contexto ruim alucina em cima do
contexto ruim, e o resultado é pior que alucinação óbvia: é alucinação com
aparência de fundamentação.

### O pipeline que você vai realmente construir

O loop de três passos é a versão de brochura. O pipeline de produção tem estágios
que mapeiam exatamente os módulos do repositório:

| Estágio             | O que faz                                      | Módulo                       |
| ------------------- | ---------------------------------------------- | ---------------------------- |
| **Ingestão**        | ler PDF, HTML, CSV, imagem → texto + metadados | `01-DataLoading`             |
| **Chunking**        | fatiar em pedaços recuperáveis                 | `02-DocChunking`             |
| **Embedding**       | virar vetor                                    | `03-Embedding`               |
| **Indexação**       | armazenar para busca rápida                    | `04-VectorDB`, `06-Indexing` |
| **Pré-recuperação** | tratar a query antes de buscar                 | `05-PreRetrieval`            |
| **Recuperação**     | buscar top-k                                   | `04-VectorDB`                |
| **Pós-recuperação** | reordenar, comprimir, corrigir                 | `07-PostRetrieval`           |
| **Geração**         | montar prompt e responder                      | `08-Generation`              |
| **Avaliação**       | medir se está bom                              | `09-Evaluation`              |

Note a ordem: **avaliação vem por último no livro e deveria vir primeiro no seu
projeto.** Sem conjunto de perguntas com resposta conhecida, você não otimiza — você
troca de configuração e acha que melhorou. Guarde isso; voltamos na Aula 22.

---

## As três origens de falha em RAG

Toda falha de RAG cai em uma destas três caixas. Aprender a classificar em qual
delas você está é a habilidade central do diagnóstico.

### Falha de recuperação — o trecho certo não veio

A resposta existia no acervo e o retriever não a trouxe. Causas típicas:

- chunk cortou a informação no meio, e nenhuma metade isolada responde
- a pergunta usa vocabulário diferente do documento ("rescisão" vs. "cancelamento")
- o modelo de embedding não conhece seu jargão de domínio
- top-k baixo demais e o trecho certo ficou em k+1
- métrica de similaridade incompatível com o modelo de embedding

Sintoma: o sistema diz "não encontrei" ou responde com evasiva, e você sabe que a
informação está lá.

### Falha de geração — o trecho certo veio e a resposta saiu errada

Aqui a recuperação funcionou. Causas típicas:

- contexto longo demais, e o trecho relevante estava no meio (`lost in the middle`)
- prompt não instruiu o modelo a se restringir ao contexto
- trechos recuperados se contradizem e o modelo escolheu o errado
- modelo fraco para a tarefa

Sintoma: você inspeciona o que foi recuperado, o trecho correto está ali, e a
resposta ignora ou distorce.

### Falha de ingestão — o dado nunca entrou de forma utilizável

**Julgamento, e as duas metades são julgamento:** a mais silenciosa e, na minha experiência, a mais
frequente em projetos reais. Não tenho número para nenhuma das duas.

- PDF digitalizado sem OCR: o "texto" indexado é vazio
- tabela virou papa de números sem cabeçalho
- estrutura hierárquica perdida: o parágrafo indexado não diz de qual seção é
- metadados descartados, impossibilitando filtro por data ou fonte

Sintoma: o sistema simplesmente não conhece parte do acervo, e ninguém percebe
porque as perguntas de teste caíram na parte que funcionou.

**Ordem de diagnóstico correta, na prática:** ingestão → recuperação → geração.
A intuição de todo mundo é começar mexendo no prompt, porque é a parte visível e
fácil de editar. É quase sempre o lugar errado para começar.

---

## Quando _não_ usar RAG

Ser especialista inclui recusar a ferramenta:

| Situação                                                                    | Alternativa melhor                         |
| --------------------------------------------------------------------------- | ------------------------------------------ |
| Acervo pequeno e estável (cabe no contexto)                                 | Coloque tudo no prompt, com prompt caching |
| Precisa de agregação global ("qual o tema recorrente em 5 mil avaliações?") | Análise em batch, ou GraphRAG (Aula 23)    |
| Precisa de número exato de base estruturada                                 | Text2SQL contra o banco — que a Aula 12 argumenta **ainda ser RAG**, só sem busca vetorial¹ |
| Precisa mudar o _comportamento_ ou o _estilo_ do modelo                     | Fine-tuning, não RAG                       |
| Pergunta é raciocínio puro, sem fato externo                                | Só o LLM                                   |

¹ **Aviso de fronteira, porque você vai encontrar as duas leituras nesta ordem.** A Aula 06 (que
vem antes) opõe Text2SQL a "RAG" como coisas distintas, usando "RAG" no sentido estrito de _busca
vetorial sobre prosa_. A Aula 12 (que vem depois) argumenta que Text2SQL bem feito **é** RAG, porque
o que se recupera vem de fora do modelo e entra no contexto — e o `GLOSSARIO.md` segue a Aula 12.
As duas leituras são defensáveis e a diferença é de definição, não de fato. Quando a Aula 06 disser
"aí sim RAG", leia "aí sim RAG vetorial".

A confusão que mais encontro no mercado — julgamento, não dado: RAG ensina **fatos** ao modelo, fine-tuning
ensina **comportamento**. Tentar ensinar fato via fine-tuning é caro e vaza; tentar
ensinar estilo via RAG não funciona.

---

## Mão na massa (sem código)

Faça este exercício de papel antes da próxima aula. Ele vale mais que rodar dez
scripts.

Escolha um caso real seu — pode ser a base de conhecimento do SIG Empresa, a
documentação do AIOX, qualquer acervo que você conheça — e escreva:

1. **Cinco perguntas** que um usuário real faria a esse acervo.
2. Para cada uma, **onde no acervo** está a resposta (qual arquivo, qual seção).
3. Para cada uma, classifique: precisa de **um** trecho, de **vários trechos
   combinados**, ou de **visão global do acervo inteiro**?
4. Identifique quais perguntas precisariam de **filtro por metadado** (data,
   autor, tipo de documento).

O item 3 é o que revela a arquitetura. Perguntas de um trecho: RAG básico resolve.
Vários trechos: você vai precisar de decomposição de query (Aula 13) e reranking
(Aula 17). Visão global: RAG vetorial vai falhar, e você vai precisar de GraphRAG
(Aula 23) ou outra abordagem.

Guarde esse documento. Ele vira seu conjunto de avaliação na Aula 22 e a base do
projeto final na Aula 28.

---

## Checkpoint

1. Cite os quatro limites que justificam RAG. Qual deles **não** é resolvido por
   janelas de contexto maiores?
2. RAG elimina alucinação? Justifique.
3. Quais são as três origens de falha, e em que ordem se deve investigá-las?
4. Qual a diferença entre o que RAG ensina ao modelo e o que fine-tuning ensina?
5. Dê um exemplo concreto em que RAG é a escolha errada.
6. Por que avaliação, último capítulo do livro, deveria ser a primeira coisa a
   construir no seu projeto?

---

## Vocabulário

`RAG` · `hallucination` · `grounding` · `context window` · `knowledge cutoff` ·
`token` · `corpus` · `lost in the middle`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 00 — Setup do ambiente](AULA-00-setup-do-ambiente.md)
**Próxima:** [AULA 02 — Vetores, embeddings e similaridade](AULA-02-vetores-embeddings-similaridade.md)
