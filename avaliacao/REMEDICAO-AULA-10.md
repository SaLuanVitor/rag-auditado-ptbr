# Remedição: AULA 10, índices ANN

**Alvo:** `E:/Projetos/rag/rag-auditado-ptbr/AULA-10-indices-ann.md`, como está hoje.
**Fonte da verdade:** `E:/Projetos/rag/RAG-from-First-Principles/`, commit `17c6942` (conferido).
**Método:** nota formada antes de qualquer consulta ao `GATE-AULAS-v1.md`. Histórico não consultado.

---

## Nota

| Dim | Nome | Nota | Justificativa em uma linha |
| --- | --- | --- | --- |
| **E** | Evidência | **2** | 51 citações validadas pela ferramenta e 4 âncoras implícitas conferidas à mão, zero inválidas; abri cerca de 20 no par arquivo:linha e o conteúdo alegado estava lá em todas. |
| **C** | Correção técnica | **1** | O achado que derrubou o `C` anterior está consertado e eu o provei numericamente; sobra uma imprecisão material, "o que governa latência é `nprobe` absoluto", que contradiz a própria tabela duas linhas acima. |
| **H** | Honestidade epistêmica | **2** | Separa doutrina de medição em quatro pontos, marca dois julgamentos, declara que o script não tem semente e entrega faixa p5-p95 em vez de ponto, e assume erro anterior do próprio curso com link. |
| **O** | Coerência | **1** | As seis referências cruzadas conferem na aula referida, e a Aula 22 reciproca a distinção de recall; internamente, anuncia "cinco coisas" e lista seis, e a frase de latência briga com a tabela. |
| **D** | Didática | **2** | Ensina mecanismo, não API: por que o recall segue a razão e não o absoluto, por que o dado uniforme decide o número, e as duas coisas que se chamam recall; a pergunta motivadora é respondida. |
| **A** | Acionabilidade | **2** | "Mão na massa" nomeia cada bloqueio com o conserto, e "Quebre de propósito" antecipa a falha da quebra ingênua nos itens 4 e 5, com números medidos para substituir os do exemplo. |

**Total: 2 + 1 + 2 + 1 + 2 + 2 = 10 / 12** (83%).

Soma conferida: `E 2` + `C 1` + `H 2` + `O 1` + `D 2` + `A 2` = **10**.

---

## O achado central da remedição: consertado, e verificado

A leitura da linha 106 de `02-ann-diff-metrics.py` hoje diz, corretamente, que normalizar só a
consulta é no-op sob produto interno. Verifiquei a afirmação, não só a li.

```
python replica.py  ->  A perm identica: True
```

Script em `scratchpad/replica.py`, rodado com `E:/tmp/rag-venv/Scripts/python.exe` (numpy 1.26.4):
1000 vetores uniformes em 128 dimensões, `argsort(-(V @ q))` contra `argsort(-(V @ q/||q||))`,
permutação **completa** idêntica. É exatamente o que a aula afirma, inclusive o "até o último
elemento".

E a linha que a aula passou a apontar como a que de fato separa IP de COSINE, a 20, confere:

```
grep -n 'vectors = ' 04-VectorDB/Milvus/03-SearchAndMetrics/02-ann-diff-metrics.py
20:    vectors = [[random.random() for _ in range(dim)] for _ in range(num_vectors)]
```

Os vetores armazenados são sorteados e nunca normalizados. A conclusão da aula, "normalização é
propriedade do acervo, não da consulta", está certa.

---

## Achados

**Total: 6. Nenhum `−1`. Nenhum CRÍTICO.**

### 1. MÉDIO. Anuncia cinco bloqueios e lista seis (`O`)

**Trecho:** "mas **cinco coisas nos arquivos impedem que ela funcione como estão escritos**"
(linha 315), seguido de seis marcadores.

**Comando:**
```
awk 'NR>=315 && NR<=345 && /^- \*\*/ {c++} END{print c}' AULA-10-indices-ann.md
6
```

Os seis: collection compartilhada (318), ausência de semente (322), ruído uniforme (327),
`ann_field` (336), `release_collection` (340), mil vetores é pouco (342).

**Por que é problema:** a rubrica pesa coerência interna por números que batem entre si. O aluno
que conta para conferir se cobriu tudo para no quinto.

**Correção:** trocar para "seis coisas", ou mover o marcador do `ann_field` para fora da lista,
já que a própria aula diz que ele "não quebra" e portanto não impede nada.

### 2. MÉDIO. "O que governa latência é `nprobe` absoluto" contradiz a tabela acima (`C`, `O`)

**Trecho:** "O que governa recall é a razão `nprobe/nlist`; o que governa latência é `nprobe`
absoluto." (linha 101), logo abaixo da tabela cuja segunda linha diz que subir `nlist` com
`nprobe` fixo faz a **latência cair** (linha 97).

**Comando:**
```
sed -n '94,101p' AULA-10-indices-ann.md
| ↑ `nlist` com `nprobe` fixo | **cai**  | cai      |
```

**Por que é problema:** os dois não podem valer juntos. Se a latência fosse governada por
`nprobe` absoluto, subir `nlist` com `nprobe` fixo a deixaria igual, não caindo. A física do IVF
dá razão à tabela: o número de vetores varridos é `nprobe × N/nlist`, ou seja, `N × (nprobe/nlist)`.
Recall e latência seguem **a mesma razão**, e é justamente por isso que a troca é uma troca. A
frase ensina um modelo mental errado numa aula cujo assunto é esse trade-off.

**Correção:** "o que governa recall e custo de varredura é a razão `nprobe/nlist`; o que a razão
não captura é o custo fixo de comparar a consulta com os `nlist` centroides, que sobe com `nlist`."

### 3. MÉDIO. "3 dos 10 primeiros" é sorteio único apresentado sem a variância que a aula declara em outro lugar (`H`, `E`)

**Trecho:** "Com o mesmo dado e a mesma consulta, IP e COSINE dividiram 3 dos 10 primeiros."
(linha 189).

**Comando:** replicação em `scratchpad/replica.py`, 200 execuções de 1000 vetores em 128
dimensões, IP sobre vetores crus contra IP sobre vetores normalizados nos dois lados:
```
B overlap amostra unica: 2 | 200 execucoes: media 2.86 min 0 max 6
```

**Por que é problema:** o número está certo como valor típico, e a média de 2,86 quase o crava.
O defeito é de apresentação: quem rodar uma vez pode ver 0 ou 6 e concluir que a aula errou. A
mesma aula faz o oposto, e melhor, na seção "Quebre de propósito": ali declara "medido em 400
execuções", dá desvio e faixa p5-p95, e avisa que "o script não tem semente, então cada execução
devolve um valor dessa faixa". O rigor não é uniforme entre as duas passagens.

Some-se que o arquivo citado busca com `limit=3` (linhas 89 e 112), não 10, então o "10 primeiros"
não vem da saída dele e o texto não diz de onde vem.

**Correção:** aplicar à linha 189 o mesmo tratamento da linha 406: dizer quantas execuções, dar a
faixa, e nomear que a medição é de um replicador em numpy, não da saída do script.

### 4. BAIXO. Checkpoint 9 ficou com a redação de antes do conserto (`D`)

**Trecho:** "9. Por que `02-ann-diff-metrics.py` normaliza os vetores de consulta só quando a
métrica é COSINE?" (linhas 448-449).

**Comando:**
```
sed -n '448,449p;182,183p' AULA-10-indices-ann.md
```
que devolve a pergunta ao lado da resposta do corpo: "**normalizar só a consulta não muda ranking
nenhum**".

**Por que é problema:** a pergunta pressupõe que há uma boa razão, e o corpo corrigido diz que não
há: a linha é no-op. A pergunta continua respondível pelo conteúdo, então não passa de BAIXO, mas
ela é resíduo do texto anterior ao conserto e induz o aluno à resposta ingênua que a aula desmonta.

**Correção:** "O que a normalização da consulta na linha 106 muda no ranking, e o que de fato
separa IP de COSINE neste arquivo?"

### 5. BAIXO. Pré-filtragem: o bitset é construído antes, não avaliado durante (`C`)

**Trecho:** "a expressão escalar é avaliada **durante** a travessia, como bitset" (linha 257).

**Comando:**
```
grep -n 'hints' 04-VectorDB/Milvus/03-SearchAndMetrics/03-filtered-search.py
77:        "hints": "iterative_filter"  # Enable iterative filtering
```
A existência do hint confirma o resto do parágrafo: o default é pré-filtragem, e a filtragem
iterativa existe para o caso em que ela degrada.

**Por que é problema:** a expressão é avaliada **antes**, produzindo o bitset; o que acontece
durante a travessia é a consulta ao bitset. A distinção importa porque explica o próprio modo de
falha que a aula descreve quatro linhas depois, "o grafo HNSW percorre vizinhos que o bitset já
eliminou": o bitset já estar pronto é a razão de o custo ser pago na navegação.

**Correção:** "a expressão escalar é avaliada antes da busca, produzindo um bitset consultado
durante a travessia".

### 6. BAIXO. A normalização interna do Milvus em COSINE é afirmada sem citação (`E`)

**Trecho:** "somada à normalização que o Milvus aplica por dentro na collection COSINE"
(linha 188-189).

**Comando:** a afirmação é sobre o servidor, e o servidor não sobe aqui.
```
"E:/tmp/rag-venv/Scripts/python.exe" -c "import milvus_lite"
ModuleNotFoundError  ->  NÃO_EXECUTADO, por decisão declarada em ferramentas/montar-ambiente.sh
```

**Por que é problema:** é o segundo pilar da leitura corrigida, e o único dos dois sem lastro no
repositório nem execução. Está **certo** (é comportamento documentado do Milvus para a métrica
COSINE), mas a aula é rigorosa em citar onde cita, e aqui não cita nada.

**Correção:** citar a documentação do Milvus na frase, ou marcá-la como doutrina, no mesmo padrão
que a aula já usa para HNSW ("doutrina corrente de ANN, não algo que este repositório meça").

---

## Verificação amostral de citações (exigido: 5 mínimo; feitas: 20)

Todas abertas no arquivo e conferidas por conteúdo, não só por existência.

| # | Afirmação da aula | Comando | Veredito |
| --- | --- | --- | --- |
| 1 | `metric_type` na L34 e `index_type` na L35 nos cinco; os cinco com `"L2"` | `grep -n 'metric_type\|index_type' 02-Indexes/*.py` | confere nos 5 |
| 2 | `02`: `nlist: 64` (L38), `nprobe: 10` (L65) | idem | confere |
| 3 | `03`: `nlist`, `m`, `nbits` em L38, L39, L40 | idem | confere |
| 4 | `04`: `M: 64` e `efConstruction: 100` (L38-39), `ef: 10` (L66) | idem | confere |
| 5 | `05`: `search_list: 32` (L62) | idem | confere |
| 6 | `05-DiskANN.py:34` traz "Supports L2, IP, or COSINE", único dos cinco a documentar métricas | `sed -n '34p' 05-DiskANN.py` e os outros 4 | confere, e a exclusividade também |
| 7 | `03-ivf_pq_index.py:38` traz "usually set to 4*sqrt(n)..." | `sed -n '38p'` | confere verbatim |
| 8 | comentário "usually dim/m >= 2; here 128/32=4" | `sed -n '39p'` | confere verbatim |
| 9 | `COLLECTION_NAME = "flat_index_demo"` na L6 dos arquivos **01 a 04** | `grep -n 'COLLECTION_NAME =' *.py` | confere, e o `05` é `"index_demo"`, corretamente excluído do escopo |
| 10 | os 1000 vetores na L22, sorteados com `random.random()` | `sed -n '21,22p' 02-ivf_flat_index.py` | confere (L21 é `num_vectors`, L22 é o sorteio) |
| 11 | nenhum dos cinco chama `random.seed` | `grep -rn 'random.seed' 02-Indexes/` (exit 1) | confere |
| 12 | os cinco escrevem `ann_field`; `07-text-match.py` usa a forma certa em L62, 78, 94, 111 | `grep -n 'ann_field\|anns_field'` nos dois lugares | confere, nas 4 linhas exatas |
| 13 | `MilvusClient.search` tem `anns_field` e `**kwargs`, logo `ann_field` cai no kwargs | `inspect.signature(MilvusClient.search)` | confere: `..., anns_field: Optional[str] = None, **kwargs` |
| 14 | `02-ann-diff-metrics.py` L15-16 e L106, verbatim | `sed -n '15,16p;106p'` | confere caractere a caractere |
| 15 | `03-filtered-search.py:59` filtro; L77 `"hints": "iterative_filter"`; L37 `FLAT`; L27 `likes` em [1,1000] | `grep -n` no arquivo | confere nas 4 |
| 16 | o filtro está escrito duas vezes no arquivo | L59 e L79 | confere |
| 17 | `04-range-search.py` L100 (nota do autor), L109-110 (radius/range_filter) | `sed -n '100p;109,110p'` | confere verbatim |
| 18 | `07-text-match.py`: `filter` definido na 107, usado na 112; L59, 75, 91 são buscas sem filtro | `grep -n 'client.search\|filter'` | confere nas 6 linhas |
| 19 | o par `06` difere em duas linhas (frase de amostra e query), ambos só com `enable_analyzer=True` na L19, e o `-ch` tem texto em inglês | `diff 06-...-ch.py 06-...-en.py` | confere: exatamente 2 hunks, linhas 61 e 81 |
| 20 | `00-SimpleRAG/05_RAG_from_Scratch_Ollama.py:30` usa `faiss.IndexFlatL2` para nove documentos | `sed -n '30p'` e contagem do array `docs` | confere: L30 exata, e são 9 documentos |

Ferramenta, como segunda passada:
```
node ferramentas/verify-citations.js AULA-10-indices-ann.md
OK: 51 | BAD_LINE: 0 | MISPLACED: 0 | NOT_FOUND: 0 | BAD_ANCHOR: 0 | NO_ANCHOR: 4
PASS — 0 citações inválidas
```
Os 4 `NO_ANCHOR` são as citações "linha 35", "linha 6" e "linha 22" sem arquivo antecedente na
mesma frase; conferi as três à mão, itens 1, 9 e 10 acima.

---

## Números medidos pela aula: replicados

Todos rodados em `E:/tmp/rag-venv/Scripts/python.exe`, numpy 1.26.4, scripts em
`scratchpad/replica.py` e `scratchpad/replica2.py`.

| Afirmação da aula | Valor da aula | Meu valor | Veredito |
| --- | --- | --- | --- |
| Permutação de IP com query crua e normalizada é a mesma | idêntica | idêntica | confere |
| Quinto vizinho mais longe que o primeiro, dado uniforme | "cerca de 3%" | 3,46% com 100 mil vetores; 3,99% com mil | confere |
| Recall IVF, 100 mil uniforme, `nlist 64`, `nprobe 10`, `k=5` | 0,40 | **0,424** (consulta sorteada fresca, como fazem os scripts) | confere |
| Mesmo teste, 200 clusters gaussianos | 1,00 | **1,000** | confere |
| Distância média consulta-vetor, uniforme 128d | 4,62 | 4,605 medido; 4,619 analítico (`sqrt(128/6)`) | confere |
| Vizinho mais próximo, escala quadrática do Milvus | 15,0, desvio 0,85, p5-p95 13,6 a 16,3 | 14,91, desvio 0,89, p5-p95 13,5 a 16,3 | confere |
| O mesmo na escala linear | "cerca de 3,87" | 3,861 | confere |
| Nenhum vetor entre 0,5 e 1,0 | zero em 400 mil sorteios | zero; menor quadrática observada 12,25 | confere |
| `m: 32`, `nbits: 8`: 512 bytes viram 32, "16 vezes menos" | 16x | 128 x 4 = 512; 32 x 8 bits = 32 bytes; 512/32 = 16 | confere |
| Com `nlist: 1024` você pediria mais células do que vetores | mil vetores | 1024 > 1000 | confere |
| `likes > 990` deixa da ordem de 1% | ~1% | `randint(1,1000)`, 10 de 1000 | confere |

Nota sobre o recall de 0,40: com consultas tiradas do próprio acervo eu obtenho 0,536; com
consultas sorteadas frescas, que é o que os scripts do repositório fazem, obtenho 0,424. A aula
está no regime certo, e o conserto de metodologia que ela recomenda (trocar o sorteio uniforme por
embeddings reais ou mistura de gaussianas) é confirmado pelo 1,000 do caso gaussiano.

---

## Coerência externa: as seis referências a outras aulas

| Referência da aula 10 | Confere na aula referida |
| --- | --- |
| "a Aula 22 volta ao tema com o instrumental completo" e a distinção entre os dois recalls | `AULA-22-avaliacao.md:84-85` faz a distinção recíproca, nomeando a Aula 10 |
| "a lição da Aula 02 continua de pé", normalização e magnitude | `AULA-02:87,90,111,114` tratam magnitude, produto interno e normalização |
| "o campo escalar da Aula 09 finalmente em uso" | `AULA-09:43,47` definem campos escalares para filtro |
| "o roteamento de fonte que a Aula 12 pediu" | `AULA-12:30,267` tratam filtro de metadado e roteamento lógico |
| "a Aula 11 usa dois índices ao mesmo tempo, denso e esparso" | `AULA-11:9,40,44` confirmam |
| "o RRF que a Aula 17 vai detalhar" | `AULA-17:1,55,64` confirmam |

Links de arquivo, todos existentes: `GLOSSARIO.md`, `avaliacao/GATE-RAG-SPECIALIST-v2.md`,
`AULA-09-...md`, `AULA-11-...md`.

---

## O que **não** foi contado como falha

Aplicando a seção "O que NÃO é falha" da rubrica:

- **Limites declarados.** Quatro, e todos explícitos: "plausível, e não medido aqui" (L78);
  "doutrina corrente de ANN, não algo que este repositório meça: nenhum dos cinco arquivos compara
  índices entre si" (L138-140); "também doutrina geral: nenhum arquivo do módulo exercita remoção
  ou rotatividade" (L145-146); "O script não tem semente, então cada execução devolve um valor
  dessa faixa, não um número fixo" (L406). Isso é `H` alto, não `C` baixo.
- **Julgamento marcado.** Dois "**Julgamento:**" explícitos (L368, L422), mais "o detalhe que
  considero mais instrutivo" (L176).
- **Defeito do repositório da Packt apontado.** Collection compartilhada, ausência de semente,
  `ann_field`, o par `06` que não demonstra tokenização por idioma, a janela vazia do range search.
  Todos verificados por mim acima. É conteúdo, não crítica gratuita.
- **Exercícios não executados.** Nada da "Mão na massa" roda sem Milvus, ausente do ambiente por
  decisão de `ferramentas/montar-ambiente.sh`. `NÃO_EXECUTADO`, e por instrução não é defeito da
  aula. Compensei replicando em numpy os números que a aula afirma, e eles se sustentam.
- **Autocrítica do próprio curso.** A aula registra e linka um erro que o curso cometeu antes sobre
  o par `06`. Conferi: o link existe e o `diff` confirma a versão corrigida.

Conferi também que os cinco scripts de `02-Indexes/` **parseiam** (`ast.parse` nos cinco, OK), ou
seja, não há bloqueio de sintaxe que a aula tenha deixado de listar, e que
`04-VectorDB/Milvus/docker-compose.yml` existe, tornando o primeiro passo da "Mão na massa" válido.

---

## Estado dos repositórios

Nada foi escrito, criado ou apagado em nenhum dos dois. Todo artefato desta auditoria está no
scratchpad.

```
E:/Projetos/rag/rag-auditado-ptbr        git status --porcelain -> (vazio)
E:/Projetos/rag/RAG-from-First-Principles git status --porcelain -> (vazio), HEAD 17c6942
```

Nenhum `git fetch` ou `git pull`. Nenhum pacote instalado. `GATE-AULAS-v1.md` não foi aberto.
