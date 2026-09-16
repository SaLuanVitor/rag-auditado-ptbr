# Remedição — AULA 04, carregando texto, JSON, Markdown e páginas web

**Alvo:** `E:/Projetos/rag/rag-auditado-ptbr/AULA-04-carregando-texto-json-web.md`, estado de
`bcdd2a7b41560fceefb7d378b38ca2d49cb93688`.
**Fonte da verdade:** `E:/Projetos/rag/RAG-from-First-Principles/`, commit `17c6942`.
**Interpretador:** `E:/tmp/rag-venv/Scripts/python.exe` (Python 3.13.11, `langchain-community` 0.3.16).
**Data:** 2026-09-16.

Nota anterior não consultada antes de formar esta. Declaração de conferência ao fim do documento.

---

## Nota

| Dim | Nome | Nota |
| --- | --- | --- |
| `E` | Evidência | 2 |
| `C` | Correção técnica | 1 |
| `H` | Honestidade epistêmica | 2 |
| `O` | Coerência | 2 |
| `D` | Didática | 2 |
| `A` | Acionabilidade | 1 |

**Total: 2 + 1 + 2 + 2 + 2 + 1 = 10 / 12 (83%).** Soma conferida termo a termo.

### Justificativa de uma linha por dimensão

- **`E` = 2.** As 55 citações passam pelo verificador com zero inválidas, e as que ele não alcança
  (biblioteca instalada) foram abertas à mão e contêm exatamente o que a aula diz; toda medição
  numérica do texto reproduziu no interpretador pinado.
- **`C` = 1.** Núcleo técnico certo e incomumente fundo, com uma renderização de mojibake errada por
  um caractere e uma generalização sobre o `TextLoader` que o próprio texto refuta antes.
- **`H` = 2.** Quatro julgamentos marcados como julgamento, medição escopada a máquina, sistema
  operacional e versão de biblioteca, e o texto declara os limites do próprio instrumento de
  verificação antes que o auditor precise apontá-los.
- **`O` = 2.** Números internos fecham entre si (12, 7, 61, 9/8/7, "buraco real é 2") e as quatro
  referências externas conferem na aula referida, inclusive a mais difícil, a de ordem na Aula 01.
- **`D` = 2.** A pergunta motivadora é respondida na abertura e sustentada ao longo do texto, e a
  aula ensina o mecanismo em todos os pontos onde descrever a API seria mais fácil.
- **`A` = 1.** Os exercícios que rodam reproduzem exatamente o que a aula prevê, mas dois deles
  dependem do pacote `jq`, que a aula não nomeia e que o `requirements.txt` do módulo, citado pela
  própria aula como fonte de dependências, não lista.

---

## Verificação amostral de citações, exigida pela rubrica

Mínimo de cinco. Foram abertas 19, todas conferindo conteúdo e não só existência.

| Citação da aula | O que a aula afirma | Conferido |
| --- | --- | --- |
| `03-01-...py:66` | `DirectoryLoader(data_dir)` | linha 66 é exatamente `loader = DirectoryLoader(data_dir)` |
| `03-01-...py:57-58` | únicos imports, `os` e `DirectoryLoader` | confere; o `import nltk` da linha 53 está dentro da docstring, como a aula diz |
| `03-02-...py:10-14`, 11, 12, 13 | `glob`, `use_multithreading`, `show_progress` | confere linha a linha |
| `03-03-...py:11-14`, 13 | `+ loader_cls=TextLoader`, remove os dois últimos | confere |
| `03-04-...py:12-15`, 13 | `+ silent_errors=True`, remove o `glob` | confere |
| `directory.py:38` | `loader_cls: FILE_LOADER_TYPE = UnstructuredFileLoader` | confere, literal |
| `text.py:20`, `:30`, `:42` | docstring, default `None`, `open(..., encoding=self.encoding)` | as três conferem |
| `json_loader.py:180-183` | o `raise ValueError` com contrabarra de continuação | confere |
| `01-LangChain-TextLoader-JSON.py:3` | `TextLoader(".../journey_to_the_west_characters.json")` | confere, literal |
| `02-LangCHain-...py:6`, `:14`, `:7` | os dois `jq_schema`, `text_content=True` | conferem, literais |
| `04-...Markdown...py:4`, `:5`, `:10` | caminho, modo default, `mode="elements"` | conferem |
| `03-LangChain-WebBaseLoader.py:4`, `5-11`, `15` | url, versão ingênua comentada, versão boa | conferem |
| `05-01-Unstrutured-SimpleExample.py:7` | `f'{doc.metadata["category"]}: {doc.page_content}'` | confere, literal |
| `05-02-...py:8-9`, `12-17`, `16`, `23` | inicialização comentada, lógica, `elif`, `parent.metadata` | conferem |
| `02-BuildLangChainDocumentObject.py:9` | `"master_and_disciples.txt "` com espaço no fim | confere |

Comando do verificador:

```
cd /e/Projetos/rag/rag-auditado-ptbr && node ferramentas/verify-citations.js AULA-04-carregando-texto-json-web.md
# => 55 citações, 48 OK, BAD_LINE 0, MISPLACED 0, NOT_FOUND 0. PASS — 0 citações inválidas
# os 4 UNKNOWN são arquivos de biblioteca, abertos à mão abaixo
```

---

## Medições do texto reproduzidas

Todas conferiram. Registro porque a aula apresenta cada uma como medida, e medição apresentada como
medida que não reproduz é achado.

```
cd /e/Projetos/rag/RAG-from-First-Principles/01-DataLoading/01-SimpleTextLoading
/e/tmp/rag-venv/Scripts/python.exe -c "
import locale, os
print('preferred encoding:', locale.getpreferredencoding(False))
from langchain_community.document_loaders import DirectoryLoader, TextLoader
d='../../99-EN/black-myth-wukong/'
for enc in ['cp1252','utf-8']:
    l=DirectoryLoader(d, silent_errors=True, loader_cls=TextLoader, loader_kwargs={'encoding': enc})
    docs=l.load()
    print('encoding=',enc,'-> docs:',len(docs))
    for x in docs: print('   ', os.path.basename(x.metadata['source']), len(x.page_content))
"
```

- `locale.getpreferredencoding(False)` devolve `cp1252`. A aula afirma isso.
- `cp1252`: **8** documentos. A aula afirma 9 contra 8.
- `utf-8`: **7** documentos. A aula afirma 9 contra 7.
- `black_myth_wukong_slides.pdf` entra na contagem `cp1252` com **4609** caracteres. A aula afirma 4609.
- Em `utf-8` o `.pdf` vira o segundo aviso em stderr. Confirmado, dois avisos na execução.
- O diretório tem **9** arquivos (`ls | wc -l` em `99-EN/black-myth-wukong/`), nenhum oculto.

```
/e/tmp/rag-venv/Scripts/python.exe -c "
for name in ['black_myth_wukong_slides.pdf','black_myth_wukong_slides.pptx']:
    b=open(name,'rb').read()
    try: s=b.decode('cp1252'); print(name,'cp1252 OK', len(s), repr(s[:12]), 'ReportLab' in s, 'FlateDecode' in s)
    except UnicodeDecodeError as e: print(name,'cp1252 FAIL 0x%02x pos %d'%(b[e.start],e.start))
    try: b.decode('utf-8'); print('  utf8 OK')
    except UnicodeDecodeError as e: print('  utf8 FAIL 0x%02x pos %d'%(b[e.start],e.start))
"
# .pdf  cp1252 OK 4759 '%PDF-1.4\r\n%' ReportLab True FlateDecode True | utf8 FAIL 0x93 pos 11
# .pptx cp1252 FAIL 0x9d pos 1277                                       | utf8 FAIL 0xff pos 14
```

- `0x93` na posição 11 do `.pdf`: a aula afirma exatamente isso.
- `0x9d` na posição 1277 do `.pptx`: idem, e "falha nas duas" confere.
- `%PDF-1.4`, `ReportLab`, `FlateDecode` presentes; zero palavras do `slides.md` no texto decodificado
  (`re.findall(r'[A-Za-z]{5,}')` sobre o `.md`, interseção vazia com o texto do `.pdf`).
- Bytes indefinidos em `cp1252`: `0x81 0x8d 0x8f 0x90 0x9d`, **cinco**. A aula afirma cinco.

```
/e/tmp/rag-venv/Scripts/python.exe 03-04-SkipErrorsWhenLoadingDirectoryWithLangChain.py; echo "EXIT=$?"
# stderr: Error loading file ...black_myth_wukong_slides.pptx: Error loading ...
# stdout: caminho do diretório + 100 caracteres, nenhuma contagem
# EXIT=0
```

Confirma três afirmações do exercício 3 de uma vez: código 0, aviso em stderr nomeando o `.pptx`, e
ausência de contagem no script como está.

```
/e/tmp/rag-venv/Scripts/python.exe -c "
content={'a':1}
msg=(f'Expected page_content is string, got {type(content)} instead. \
                    Set \`text_content=False\` if the desired input for \
                    \`page_content\` is not a string')
import re; print(repr(msg)); print([len(m) for m in re.findall(r' {2,}', msg)]); print('linhas:', msg.count(chr(10)))
"
# corridas de espaço: [21, 21] · linhas: 0
```

A aula afirma "duas dobras viram corridas de 21 espaços" e "no terminal ela sai em uma linha só".
Confere nas duas pontas.

```
cd /e/Projetos/rag/RAG-from-First-Principles && wc -l -w 99-EN/black-myth-wukong/black_myth_wukong_wiki.txt
# 40 666 — a aula afirma 40 linhas e 666 palavras
grep -c "<" 99-EN/black-myth-wukong/black_myth_wukong_wiki.txt   # 0, "sem nenhum HTML" confere
find 01-DataLoading -type f | wc -l                              # 61 — a aula afirma 61 arquivos
ls -a 01-DataLoading/01-SimpleTextLoading | grep -v '^\.$\|^\.\.$' | wc -l   # 12
ls -a 01-DataLoading/02-StructuredDocumentLoading | grep -v '^\.$\|^\.\.$' | wc -l  # 7
```

Uma afirmação que quase virou achado e não é. A aula diz "o `langchain-community` 0.3.16 que o
repositório pina", e `01-DataLoading/requirements.txt` não pina versão nenhuma. Mas:

```
cd /e/Projetos/rag/RAG-from-First-Principles && grep -rn "langchain-community==" 91-Environment/
# 91-Environment/requirements_langchain_NoGPU_Mac-Win.txt:101:langchain-community==0.3.16
# 91-Environment/requirements_langchain_Ubuntu-with-CPU.txt:95:langchain-community==0.3.16
# 91-Environment/requirements_langchain_20250413_Ubuntu-with-GPU.txt:178:langchain-community==0.3.16
```

O repositório pina, em `91-Environment/`, e a versão instalada é essa. A afirmação é verdadeira.

---

## Achados

Cinco. Nenhum de severidade `−1`.

### 1. MÉDIO — o mojibake de `ção` está errado por um caractere (`C`)

**Trecho**, linha 374: "um arquivo **UTF-8** é que vira mojibake, com `ção` saindo como `cÃ§Ã£o`,
dois bytes por acento."

**Comando que provou:**

```
cd /e/Projetos/rag/rag-auditado-ptbr && /e/tmp/rag-venv/Scripts/python.exe -c "
s='\u00e7\u00e3o'
u=s.encode('utf-8').decode('cp1252')
print('origem:', [hex(ord(c)) for c in s])
print('utf8 lido como cp1252:', [hex(ord(c)) for c in u], 'len', len(u))
"
# origem: ['0xe7', '0xe3', '0x6f']
# utf8 lido como cp1252: ['0xc3', '0xa7', '0xc3', '0xa3', '0x6f'] len 5
```

E os codepoints do que a aula escreve, lidos do arquivo para não depender do terminal:

```
/e/tmp/rag-venv/Scripts/python.exe -c "
l=open('AULA-04-carregando-texto-json-web.md',encoding='utf-8').read().split(chr(10))[373]
print([hex(ord(c)) for c in l if ord(c)>0x60][:12])
"
# a origem no texto é ['0xe7','0xe3','0x6f'] e o resultado alegado é ['0x63','0xc3','0xa7','0xc3','0xa3','0x6f']
```

**Por que é problema.** A origem tem 3 caracteres e o resultado correto tem 5 (`Ã § Ã £ o`). O texto
mostra 6, com um `c` a mais na frente. O mecanismo alegado está certo, e "dois bytes por acento"
está certo, mas a string exibida é a de uma origem que não é a declarada. É exatamente o tipo de
linha que o aluno vai comparar caractere a caractere com o próprio terminal, e ele não vai bater.

**Correção sugerida:** trocar `cÃ§Ã£o` por `Ã§Ã£o`, ou declarar a origem como `cção`.

### 2. MÉDIO — a dependência `jq` não é nomeada, e dois exercícios não rodam sem ela (`A`)

**Trecho**, "Mão na massa": `python 02-LangCHain-JSONLoader-JSON.py`; e "Quebre de propósito" 4: "Em
`02-LangCHain-JSONLoader-JSON.py`, use `jq_schema='.'`."

**Comando que provou:**

```
cd /e/Projetos/rag/RAG-from-First-Principles/01-DataLoading/02-StructuredDocumentLoading
/e/tmp/rag-venv/Scripts/python.exe 02-LangCHain-JSONLoader-JSON.py 2>&1 | tail -4
# ModuleNotFoundError: No module named 'jq'
# -> ImportError: jq package not found, please install it with `pip install jq`  (json_loader.py:123)
grep -n "jq" /e/Projetos/rag/RAG-from-First-Principles/01-DataLoading/requirements.txt  # nenhuma linha
grep -n "jq" /e/Projetos/rag/rag-auditado-ptbr/AULA-04-carregando-texto-json-web.md     # só "jq_schema" e "sintaxe do jq"
```

**Por que é problema.** A aula cita o `requirements.txt` do módulo como a fonte de dependências
("O `requirements.txt` do módulo pede os dois, e avisa no cabeçalho que `poppler` e `tesseract-ocr`
precisam estar no sistema", e esse trecho confere), e sinaliza com cuidado a dependência invisível do
`03-01` em `unstructured`. A do `02` em `jq` recebe o mesmo tratamento que o repositório dá: nenhum. O
resultado é que o "contraste central" da seção de exercícios para antes de produzir saída, pela
mesma classe de defeito que a Parte 1 da aula existe para ensinar.

**Mitigação que o achado precisa registrar:** o repositório pina `jq==1.8.0`, mas em
`91-Environment/requirements_langchain_NoGPU_Mac-Win.txt:88`, não no `requirements.txt` do módulo.
Quem montou o ambiente por ali tem o pacote. Quem seguiu o arquivo que a aula cita, não.

**Correção sugerida:** uma frase antes do bloco, no formato que a aula já usa para o `unstructured`:
o `JSONLoader` exige o pacote `jq`, que o `requirements.txt` do módulo não lista e o
`91-Environment/requirements_langchain_NoGPU_Mac-Win.txt:88` pina.

### 3. BAIXO — "o `TextLoader`, que aceitaria qualquer coisa" é refutado pela própria aula (`O`)

**Trecho**, linha 349: "sem um `jq_schema` que produza string, ele não aceita o documento — ao
contrário do `TextLoader`, que aceitaria qualquer coisa."

**Comando que provou:**

```
cd /e/Projetos/rag/RAG-from-First-Principles/01-DataLoading/01-SimpleTextLoading
/e/tmp/rag-venv/Scripts/python.exe 03-04-SkipErrorsWhenLoadingDirectoryWithLangChain.py 2>&1 | head -1
# Error loading file ...black_myth_wukong_slides.pptx: Error loading ...
```

**Por que é problema.** Duzentas e cinquenta linhas antes, a aula mede o `TextLoader` recusando o
`.pptx` nas duas codificações e recusando o `.pdf` em `utf-8`. A generalização é sobre tipo de
conteúdo e o contraste com o `JSONLoader` é legítimo, mas escrita sem qualificação ela contradiz a
medição que a mesma aula apresenta como central.

**Correção sugerida:** "ao contrário do `TextLoader`, que aceita qualquer coisa que o `open()`
consiga decodificar".

### 4. BAIXO — absoluto não qualificado sobre tokenização (`H`)

**Trecho**, linha 375: "Acentuação quebrada destrói a tokenização de qualquer texto em português."

**Comando que provou:** leitura. Nenhuma medição de tokenização aparece na aula, e o texto não marca
a frase como julgamento, ao contrário das outras quatro vezes em que ele faz isso explicitamente
(`grep -c "Julgamento" AULA-04-carregando-texto-json-web.md` devolve 3, mais "(julgamento, não
medição)" na linha 18).

**Por que é problema.** "Destrói" e "qualquer" são absolutos, e o efeito real depende do tokenizador:
um BPE moderno degrada, não anula. A rubrica cobra ausência de superlativo absoluto não qualificado
em `H`, e esta é a única ocorrência do texto.

**Correção sugerida:** "Acentuação quebrada degrada a tokenização de texto em português", ou marcar
como julgamento como o resto da aula faz.

### 5. BAIXO — "pega tudo" ignora que o glob padrão exclui ocultos (`E`)

**Trecho**, tabela da escada: `DirectoryLoader(data_dir)` | "o caso ingênuo: pega tudo".

**Comando que provou:**

```
awk 'NR==35' /e/tmp/rag-venv/Lib/site-packages/langchain_community/document_loaders/directory.py
#         glob: Union[List[str], Tuple[str], str] = "**/[!.]*",
ls -a /e/Projetos/rag/RAG-from-First-Principles/99-EN/black-myth-wukong/ | grep -c '^\.[^.]'   # 0
```

**Por que é problema.** O default é `**/[!.]*`, que exclui arquivo oculto. No diretório-alvo não há
nenhum, então a afirmação é verdadeira ali e não gera erro de contagem. Fica como BAIXO porque a
mesma aula é cuidadosa com arquivo oculto nos outros dois diretórios, onde conta o `.env.example`
que o `ls` simples não mostra, e aqui a régua afrouxa.

---

## O que não é achado, registrado para não ser recontado

- **`jq` ausente, `unstructured` ausente, `bs4` ausente, `langchain_unstructured` ausente** nos dois
  interpretadores. Limite do auditor, não da aula. Os exercícios que dependem deles foram conferidos
  estaticamente, lendo o fonte da biblioteca instalada. Os que não dependem foram executados.
- **A distinção parent-child da Aula 15.** Confere nos dois sentidos: `AULA-15-small-to-big.md:126`
  abre "Pai-filho: o parent-child de verdade" e a linha 186 diz "Os dois se chamam parent-child e são
  coisas diferentes: o primeiro produz a informação estrutural". `GLOSSARIO.md:64-66` registra a
  mesma distinção citando as Aulas 04 e 05.
- **A ordem de diagnóstico da Aula 01.** A aula 04 afirma que a Aula 01 põe a ingestão em primeiro
  lugar na ordem de diagnóstico e em terceiro na ordem de apresentação. `AULA-01-o-que-e-rag.md`
  apresenta recuperação (121), geração (134), ingestão (146), e a linha 159 diz "Ordem de diagnóstico
  correta, na prática: ingestão → recuperação → geração". Confere nas duas metades, inclusive a
  ressalva "(julgamento, não medição)": a Aula 01 escreve "na minha experiência" e "Não tenho número
  para nenhuma das duas afirmações".
- **"Não há despacho por extensão no `DirectoryLoader`".** Verificado:
  `grep -n "suffix\|splitext\|endswith\|extension" directory.py` só acha um comentário, e a linha 221
  é `loader = self.loader_cls(str(item), **self.loader_kwargs)`, aplicada a todo arquivo. A aula está
  certa num ponto em que a intuição da maioria está errada.
- **O `UnboundLocalError` e o conserto que não conserta, no `05-02`.** Não executável aqui, mas o
  mecanismo é decidível por leitura: `parent_id` é local, atribuído só na linha 13, lido na 16; com as
  linhas 8 e 9 descomentadas, `None == None` na 16 empilha `(None, doc)` na 17 e a linha 23 faz
  `parent.metadata`. As distâncias que a aula cita ("sete linhas depois, na 23") batem.
- **Travessão e meia-risca no texto.** Fora do escopo desta rubrica, que tem seis dimensões e nenhuma
  de tipografia. Não entra na nota.

---

## Conferência de histórico, feita depois de fechar a nota acima

Declarada conforme instruído. Só depois de fechar a tabela de notas e os cinco achados abri
`avaliacao/GATE-AULAS-v1.md`.

A linha vigente é a 3608: `7/12 → 5/12 → **6**/12`, com `E` 2, `C` 0, `H` 1, `O` 1, `D` 1, `A` 1, e o
comentário "Passa raspando, e o `C` continua em zero. O melhor achado da volta anterior era verdadeiro
**nesta máquina**". O parágrafo seguinte, nas linhas 3612-3614, registra o que motivou a remedição: a
afirmação sobre contagem de arquivos contra documentos é "verdadeira em `cp1252` e falsa em `utf-8`".

O que posso afirmar comparando: a aula de hoje **incorpora** aquele achado em vez de sofrê-lo. Ela
abre um parágrafo inteiro ("**'Nesta máquina' é literal**", linhas 109-117) declarando as duas
codificações, os dois resultados (9 contra 8 e 9 contra 7) e o byte que separa os dois casos, e eu
reproduzi os dois lados. As três medições que a rodada anterior contestava conferem hoje.

Os dois pontos onde a minha nota diverge mais da anterior são `C` (0 lá, 1 aqui) e `E` (2 nas duas).
Não tenho como julgar o `C` = 0 da rodada anterior sem a versão que ela mediu, que não é esta; pela
regra do exercício, não herdei aquela nota nem a usei como âncora, e a minha `C` = 1 se sustenta
sozinha no achado 1 deste documento.
