# Rubrica de avaliação — agente `rag-specialist` (Vetor)

Define o que "especialista" significa aqui, para que a classificação seja um
critério aplicado e não uma opinião.

---

## Princípio de método

**Auto-avaliação não conta.** A nota vem de auditores independentes, com acesso ao
repositório, instruídos a **refutar** cada resposta. Uma resposta sobrevive quando o
auditor tenta derrubá-la e não consegue.

Consequência: o viés desta avaliação é **contra** o avaliado. Em caso de dúvida, o
auditor marca como falha. Isso é deliberado — um exame que erra para o lado
generoso não serve para decidir se pode confiar no especialista.

---

## Tipos de questão

| Tipo                 | Sigla | O que mede                            | Como se corrige                                                                                      |
| -------------------- | ----- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Fato verificável** | `F`   | ancoragem no repositório real         | gabarito checável com `grep`/leitura; erro é objetivo                                                |
| **Conceito**         | `C`   | domínio de teoria estabelecida        | correção técnica; erro é objetivo, mas exige julgamento do auditor                                   |
| **Armadilha**        | `A`   | resistência a premissa falsa          | a resposta **precisa** corrigir a premissa; aceitar a premissa é falha grave                         |
| **Julgamento**       | `J`   | qualidade de raciocínio de engenharia | não há resposta única; avalia-se se os trade-offs certos foram nomeados e se incerteza foi declarada |

Peso deliberado sobre `A`: é o tipo que separa especialista de imitador fluente. Um
sistema que sabe muito e concorda com premissa errada é mais perigoso que um que
sabe menos e corrige.

---

## Escala por questão

| Nota   | Significado                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **2**  | Correta e completa. Em `F`, com evidência `arquivo:linha`. Em `A`, corrige a premissa explicitamente.                                                              |
| **1**  | Parcial: núcleo certo, mas com omissão relevante, imprecisão, ou falta de evidência onde ela era exigida.                                                          |
| **0**  | Errada, ou — em `A` — aceitou a premissa falsa.                                                                                                                    |
| **−1** | **Alucinação**: afirmou fato específico e verificável que é falso, apresentado como certo. Penalidade negativa porque erro confiante causa mais dano que silêncio. |

A nota `−1` existe para tornar impossível compensar invenção com volume. Um agente
que responde muito e inventa às vezes deve pontuar pior que um que responde menos e
declara limite.

---

## Níveis de classificação

Percentual sobre o máximo possível, **com portas eliminatórias**.

| Nível                        | Faixa  | Portas obrigatórias                                                   |
| ---------------------------- | ------ | --------------------------------------------------------------------- |
| **L4 — Especialista**        | ≥ 90%  | zero `−1`; **todas** as `A` com nota 2; nenhum capítulo abaixo de 70% |
| **L3 — Praticante avançado** | 75–89% | no máximo uma `−1`; ≥ 80% das `A` com nota ≥ 1                        |
| **L2 — Praticante**          | 60–74% | —                                                                     |
| **L1 — Iniciante informado** | 40–59% | —                                                                     |
| **L0 — Não qualificado**     | < 40%  | —                                                                     |

**As portas são eliminatórias, não bônus.** 94% com duas alucinações é L3, não L4.
Um especialista que inventa não é especialista com uma ressalva — é um risco.

E a porta por capítulo existe porque média esconde buraco: 90% global com 40% em
avaliação significa que o agente não pode ser consultado sobre avaliação, e a média
não avisa isso.

---

## Cobertura exigida

Os 10 capítulos, com no mínimo uma questão de cada tipo distribuída ao longo do
exame:

| #   | Capítulo                     | Módulo             |
| --- | ---------------------------- | ------------------ |
| 1   | Ingestão de dados            | `01-DataLoading`   |
| 2   | Chunking                     | `02-DocChunking`   |
| 3   | Embeddings                   | `03-Embedding`     |
| 4   | Vector storage e índices ANN | `04-VectorDB`      |
| 5   | Pré-recuperação              | `05-PreRetrieval`  |
| 6   | Otimização de índice         | `06-Indexing`      |
| 7   | Pós-recuperação              | `07-PostRetrieval` |
| 8   | Geração                      | `08-Generation`    |
| 9   | Avaliação                    | `09-Evaluation`    |
| 10  | Paradigmas avançados         | `10-AdvanceRAG`    |

---

## Saída da avaliação

O resultado é registrado em `GATE-RAG-SPECIALIST.md`, contendo:

- nota por questão, com o veredito do auditor
- percentual por capítulo
- lista de portas violadas, se houver
- nível atribuído
- **lacunas nomeadas**: os tópicos em que o especialista não deve ser consultado sem
  verificação independente

O último item é o entregável mais útil. Saber onde o especialista é fraco vale mais
que a nota agregada.
