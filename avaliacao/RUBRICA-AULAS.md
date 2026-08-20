# Rubrica de avaliação — as aulas do curso

Define o que "aula boa" significa aqui, para que a classificação seja um critério aplicado e não uma
impressão. Complementa a [`RUBRICA.md`](RUBRICA.md), que avalia o **agente**; esta avalia o
**material**.

---

## Princípio de método (herdado)

**Auto-avaliação não conta.** A nota vem de auditores independentes, com acesso ao repositório da
Packt e ao curso, instruídos a **refutar** cada afirmação. Uma aula sobrevive quando o auditor tenta
derrubá-la e não consegue.

O viés desta avaliação é **contra** o material. Em caso de dúvida, o auditor marca como falha.

**Ressalva registrada sobre o `@rag-specialist` como auditor:** o agente foi construído a partir do
mesmo trabalho que gerou as aulas. A revisão dele tem viés **a favor** e por isso entra como uma
segunda opinião de domínio, nunca como nota. A nota é sempre do auditor independente.

---

## Dimensões

Seis, cada uma pontuada de `−1` a `2` por aula.

| Dim   | Nome                   | O que mede                                                                                                                        | Como se verifica                    |
| ----- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **E** | Evidência              | toda afirmação factual sobre o repositório traz `arquivo:linha` conferível, e a linha contém o que a aula diz                     | abrir o arquivo na linha citada     |
| **C** | Correção técnica       | o que a aula afirma sobre RAG está certo                                                                                          | conhecimento de domínio do auditor  |
| **H** | Honestidade epistêmica | julgamento marcado como julgamento; limites declarados; custo de cada mitigação nomeado; sem superlativo absoluto não qualificado | leitura crítica do texto            |
| **O** | Coerência              | interna (números batem entre si) e externa (referências a outras aulas conferem na aula referida)                                 | conferir na aula citada             |
| **D** | Didática               | ensina o mecanismo, não só descreve a API; progressão clara; a "Pergunta motivadora" é respondida pela aula                       | leitura                             |
| **A** | Acionabilidade         | "Mão na massa" e "Quebre de propósito" são executáveis e informativos; "Checkpoint" é respondível pelo conteúdo da aula           | tentar seguir os passos mentalmente |

**Peso deliberado sobre `E` e `H`.** São as duas que separam material confiável de texto plausível.
Uma aula tecnicamente correta com evidência inventada é pior que uma aula modesta e verificável.

---

## Escala por dimensão

| Nota   | Significado                                                                                                                               |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **2**  | Plenamente atendida.                                                                                                                      |
| **1**  | Parcial: núcleo certo, com omissão relevante ou imprecisão que não invalida.                                                              |
| **0**  | Não atendida.                                                                                                                             |
| **−1** | **Alucinação**: afirmação factual específica e verificável que é **falsa**, apresentada como certa. Aplica-se sobretudo a `E`, `C` e `O`. |

A nota `−1` existe para tornar impossível compensar invenção com volume.

**Não confundir com limite declarado.** Uma aula que diz "não verifiquei X porque a biblioteca não
está instalada" está **certa** em `H` — declarar limite é o comportamento correto, não uma falha.
Alucinação é afirmar sem verificar, não abster-se de afirmar.

---

## Máximo e classificação

- Máximo por aula: **12** (6 dimensões × 2).
- Máximo do curso: **29 × 12 = 348**.

| Classificação                | Faixa  | Portas obrigatórias                                                           |
| ---------------------------- | ------ | ----------------------------------------------------------------------------- |
| **Publicável**               | ≥ 85%  | zero `−1` no curso; nenhuma aula abaixo de 70%; `E` ≥ 1 em **todas** as aulas |
| **Publicável com ressalvas** | 70–84% | no máximo uma `−1`; nenhuma aula abaixo de 50%                                |
| **Requer revisão**           | 55–69% | —                                                                             |
| **Requer reescrita**         | < 55%  | —                                                                             |

**As portas são eliminatórias, não bônus.** 90% com duas alucinações é "com ressalvas", não
"publicável". Material didático que inventa evidência ensina o hábito errado — e este curso tem uma
aula inteira sobre isso.

---

## Saída exigida do auditor

Por aula:

1. **Nota nas seis dimensões**, com uma linha de justificativa cada.
2. **Achados**, classificados por severidade:

| Severidade  | Critério                                                                                      |
| ----------- | --------------------------------------------------------------------------------------------- |
| **CRÍTICO** | alucinação, citação que não confere, contradição factual, erro técnico que ensina algo errado |
| **ALTO**    | afirmação sem evidência onde ela era exigida; julgamento apresentado como fato; custo omitido |
| **MÉDIO**   | imprecisão, omissão relevante, exercício que não roda como descrito                           |
| **BAIXO**   | estilo, repetição, oportunidade de melhoria didática                                          |

3. Para cada achado: **trecho citado**, **por que é um problema**, **correção sugerida**.
4. **Verificação amostral obrigatória**: ao menos **cinco** citações `arquivo:linha` por aula abertas
   e conferidas — não só a existência do arquivo, mas se a linha contém o que a aula afirma.

O último item é o que distingue esta auditoria do verificador automático. A ferramenta
`ferramentas/verify-citations.js` valida caminho e range de linha; ela **não** detecta citação cujo
conteúdo alegado não está naquela linha. Essa lacuna é o trabalho do auditor humano — ou do agente
auditor.

---

## O que NÃO é falha

Registrado para o auditor não penalizar o comportamento correto:

- **Limite declarado.** "Não executei porque a biblioteca não está instalada" é `H` = 2.
- **Julgamento marcado.** "Julgamento: eu começaria pelo índice plano" é opinião sinalizada, não
  afirmação sem evidência.
- **Preservar erro de digitação do repositório na citação.** É decisão editorial do curso: o aluno
  vai encontrar o erro, e a citação tem de bater com o arquivo.
- **Apontar defeito do repositório da Packt.** O curso trata o repo como material de leitura crítica;
  achados sobre ele são conteúdo, não crítica gratuita — desde que verificados.

---

_Estabelecida em 2026-08-19, antes da primeira auditoria do material._
