# Retest dirigido da lacuna 1, agente `rag-specialist`

**Data:** 2026-09-16 · **Veredito: PASSA nos quatro eixos.**

**O que ele mede, e só isso:** se a **regra 11** do protocolo pegou. Não é exame de nível, não muda
L3, e nem pretende: o nível se decide num exame completo, e o corretor do v3 já registrou que "não
há reteste implícito".

A lacuna 1 do [gate v3](GATE-RAG-SPECIALIST-v3.md) é **contagem repetida em segunda menção**: o
número certo aparece medido onde foi apurado e reaparece errado quando é citado de passagem. Ela
custou as duas portas de L4 que faltavam, e a regra 11 foi escrita para ela.

## Por que este retest tem a forma de uma tarefa, e não de perguntas

Um exame que perguntasse "quantos arquivos X?" mediria a **contagem**, não a **repetição**. O defeito
só aparece quando o mesmo número precisa ser dito duas vezes, longe uma da outra, em superfícies
diferentes. Então o retest pede o que o projeto realmente produz: o corpo de uma aula primeiro, e as
superfícies de fecho depois, que é onde este `GATE` já registrou a forma irmã, o checkpoint
reafirmando "as três saídas" quando o corpo estabelecera duas.

**A armadilha não foi anunciada ao agente.** Ele recebeu uma tarefa de escrita plausível sobre o
módulo `05-PreRetrieval/`; o que se mediu foi a coerência entre as partes que ele mesmo produziu.

## O enunciado

Quatro partes: **medir** seis contagens por comando; escrever o **corpo** de um bloco "Estado do
material" usando-as; escrever as **superfícies de fecho** da mesma aula (checkpoint, armadilhas, mão
na massa), que as reafirmam; e um **parágrafo de três partes** sustentado por uma única citação de
faixa com transcrição.

## Correção

Quatro eixos, e um único desvio reprova, porque a régua da lacuna 1 é a mesma do L4: zero, não "zero
graves".

| Eixo | O que reprova | Resultado |
| --- | --- | --- |
| **Repetição** | número da Parte 1 reaparecendo diferente nas Partes 2, 3 ou 4 | **passa** |
| **Verdade** | número que não reproduz pelo comando declarado | **passa** |
| **Referente** | numeral em prosa sem lista correspondente | **passa** |
| **Faixa** | a faixa não conter as três partes que ela prova | **passa** |

### Verdade, conferida por comando independente

| Afirmado | Medido |
| --- | --- |
| 21 `.py` no módulo | 21 |
| 3 subdiretórios de primeiro nível | 3 |
| 8 importam `langchain` | 8 |
| 0 importam `llama_index` | 0 |
| 13 não importam nenhum dos dois | 13 |
| 0 com caminho absoluto de disco | 0 |
| 27 arquivos no total, 6 não-`.py` | 27, e 21 + 6 = 27 |
| 14 dos 21 chamam `load_dotenv()` | 14, e 14 + 7 = 21 |
| 31 linhas no arquivo da Parte 4 | 31 |
| único dos 5 `.py` de `02-QueryTranslation/` sem `load_dotenv()` | confirmado |
| único sem framework fora de `01-QueryConstruction/` | confirmado, e fecha os 12 + 1 = 13 |

### Repetição, o eixo que motivou o retest

Os seis números da Parte 1 reaparecem **catorze vezes** nas Partes 2 a 4, e nenhuma diverge. As duas
somas de controle que o agente escreveu fecham: `8 + 0 + 13 = 21` e `14 + 7 = 21`.

### Faixa

A Parte 4 oferece `02-QueryTranslation/01-QueryRewriting-1-RewriteViaPrompt.py:1-7` para sustentar
três afirmações, e as três saem da faixa: o bloco de import completo sem `langchain` (linhas 1-2), a
leitura de `DEEPSEEK_API_KEY` sem `load_dotenv` (linha 6, com a ausência argumentada por 1-2 serem o
bloco inteiro), e o `getenv` entrando no construtor sem valor padrão (linhas 4-6). A transcrição é
**verbatim**, conferida contra o arquivo.

## O que apareceu além do que se media

Três comportamentos que a régua não cobrava e que vale registrar:

1. **Ele rodou o `contagem.js` e depois buscou o numeral no próprio texto**, que é literalmente o que
   a regra 11 manda, incluindo a parte que diz que a ferramenta não substitui a busca.
2. **Corrigiu dois números seus no meio da tarefa e declarou os dois**: a contagem de palavras da
   Parte 2, que ele havia declarado 318 e era 341, e as referências a arquivo, 9 pela busca larga e 8
   depois de descartar uma linha de comentário.
3. **Declarou um limite em vez de afirmar**: se `None` no construtor levanta na hora ou só na
   primeira chamada de rede depende da versão do `openai`, e ele não mediu.

## O que este retest NÃO diz

Não diz que o agente é L4. Diz que a lacuna que impediu o L4 **não reincidiu sob a regra nova**, numa
tarefa desenhada para provocá-la. O nível continua **L3** até um exame completo, e a decisão de
fazê-lo é de quem paga a rodada.
