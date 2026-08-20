# AULA 27 — Multimodal RAG com Weaviate

**Fase 9 — Avançado** · Módulo do repo: `10-AdvanceRAG/05-MultiModalRAG/` — 4 arquivos (`ls`): 2 scripts (131 e 107 linhas), um `docker-compose.yml` e um `.env.example`

---

## Pergunta motivadora

A Aula 11 já colocou imagem e texto no mesmo espaço vetorial, com Visualized-BGE e Milvus, e enunciou o que isso habilita: buscar imagem **escrevendo texto**, sem legenda, sem tag, sem metadado descritivo.

Então o que sobra para esta aula?

Três coisas, e as duas primeiras são as que fazem este módulo diferente de todos os outros do repositório:

1. **Mais de duas modalidades.** O vetorizador aqui aceita imagem, áudio e vídeo — e o modelo por trás dele projeta ainda mais que isso.
2. **Infraestrutura própria com custo declarado.** É a **segunda** vez que um exemplo traz o seu `docker-compose.yml` — a primeira foi o Milvus da Aula 09, com etcd, MinIO e standalone. O que é inédito aqui é o `mem_limit` explícito em cada serviço: o custo de rodar aparece como número, não como julgamento.
3. **Geração multimodal.** O segundo script não termina na recuperação: ele descreve a imagem recuperada e **gera uma imagem nova**.

E há a pergunta que o método deste curso obriga a fazer antes de qualquer entusiasmo: **os dois arquivos fazem o que os nomes dizem?** Um faz. O outro insere uma string de exemplo no lugar da imagem.

---

## Modelo mental

### Um espaço para todas as modalidades

A ideia é a mesma da Aula 11, estendida: um modelo treinado para projetar **entradas de tipos diferentes** no mesmo espaço vetorial, de modo que a distância entre um texto e uma imagem seja calculável.

O que muda com mais de duas modalidades é o que você pode perguntar. Com imagem e texto, você busca imagem por texto. Com áudio no mesmo espaço, você busca vídeo por som, imagem por áudio, e assim por diante — cada par de modalidades é uma consulta possível, sem escrever código para cada combinação.

### Espaço único e filtro por modalidade não são alternativas

Este é o ponto que a leitura do código esclarece e que o nome "multimodal" esconde. Há duas maneiras de organizar um acervo com tipos diferentes:

| Estratégia              | Como funciona                                      | O que permite              |
| ----------------------- | -------------------------------------------------- | -------------------------- |
| **Espaço único**        | um vetorizador multimodal; tudo na mesma coleção   | comparar entre modalidades |
| **Filtro por metadado** | um campo que registra o tipo; a consulta restringe | pedir "só imagens"         |

O repositório usa **as duas**, e é a combinação que faz sentido: o espaço único torna a comparação possível, e o filtro torna o resultado utilizável. Sem o filtro, uma busca por texto num acervo misto devolve o que estiver mais próximo — que pode ser um áudio, quando você queria uma foto.

### Multimodal cobra infraestrutura, não só API

O custo aqui é **um serviço de inferência que você hospeda**, e é a primeira vez no curso que o
requisito de memória vem **quantificado no próprio arquivo**: `mem_limit: 12g` — doze gigabytes,
com o sufixo de unidade do Compose, não um número em bytes — é ocorrência única no
repositório (`grep -rn "mem_limit"` nos `.yml` devolve só
`10-AdvanceRAG/05-MultiModalRAG/docker-compose.yml:21`). Infraestrutura hospedada em si não é
novidade — a Aula 09 já subiu Milvus com etcd e MinIO, como a Parte 1 abaixo registra —, mas lá o
custo era em contêineres a manter, não em memória com número. É um tipo de custo que não some
quando o corpus para de crescer: ele fica de pé enquanto o sistema existir.

---

## Parte 1 — O `docker-compose.yml`, e o que ele revela

Segundo arquivo de infraestrutura do curso — depois do Milvus da Aula 09 — e ele cabe em 23 linhas. O núcleo está em
`10-AdvanceRAG/05-MultiModalRAG/docker-compose.yml:12-13`:

```yaml
ENABLE_MODULES: 'multi2vec-bind'
BIND_INFERENCE_API: 'http://multi2vec-bind:8080'
```

E o serviço que atende essa API está em `10-AdvanceRAG/05-MultiModalRAG/docker-compose.yml:17-21`:

```yaml
multi2vec-bind:
  image: semitechnologies/multi2vec-bind:imagebind
  environment:
    ENABLE_CUDA: '0'
  mem_limit: 12g
```

Quatro leituras, e cada uma é uma decisão de projeto visível.

**1. O modelo é o ImageBind.** A tag da imagem Docker diz `imagebind`, e é o que dá ao módulo mais de duas modalidades. Conhecimento de domínio: o ImageBind é o modelo da Meta que alinha várias modalidades num espaço comum — imagem, texto, áudio e outras. O vetorizador que os scripts configuram declara três dessas: imagem, áudio e vídeo.

**2. Doze gigabytes de memória.** `mem_limit: 12g` é o número mais concreto que este curso encontrou sobre custo de infraestrutura. Não é uma estimativa minha: está escrito no arquivo. Julgamento: isso coloca o exemplo fora do alcance de uma máquina de 8 GB e o torna desconfortável numa de 16 — e é a informação que decide se você vai rodar este módulo hoje ou só ler sobre ele.

**3. Sem GPU.** `ENABLE_CUDA: '0'`. Combinado com o ImageBind e com o item anterior: a vetorização vai funcionar e vai ser lenta. Para três imagens de demonstração, tudo bem; para um acervo real, é a primeira coisa a mudar.

**4. Sem autenticação** (`10-AdvanceRAG/05-MultiModalRAG/docker-compose.yml:10`):

```yaml
AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
```

Correto para desenvolvimento local, e é preciso dizer o resto: um Weaviate assim, com a porta publicada, aceita qualquer requisição de quem alcançar a máquina. As duas portas são publicadas (`:5-7`) — 8080 e 50051, REST e gRPC.

Dois detalhes menores: há volume nomeado para persistência (`:15-16`, `:22-23`), o que significa que os dados sobrevivem ao `docker compose down` — e a chave `version: '3.4'` (`:1`) é obsoleta nas versões atuais do Compose, que a ignoram com aviso.

---

## Parte 2 — O arquivo `01`: a busca que funciona

`10-AdvanceRAG/05-MultiModalRAG/01-Weaviate-Multimodal-Search.py` tem 131 linhas e faz o que promete. A coleção é criada com três campos de mídia (`:15-22`):

```python
client.collections.create(
    name="Monkey",
    vectorizer_config=Configure.Vectorizer.multi2vec_bind(
        image_fields=["image"],
        audio_fields=["audio"],
        video_fields=["video"]
    )
)
```

O dado entra em base64 (`:25-27` e `:35-40`), com o tipo registrado num campo:

```python
    monkey.data.insert({
        "name": name,
        "path": path,
        "image": to_base64(path),
        "mediaType": "image"
    })
```

Note o `mediaType`: é o filtro da seção anterior sendo preparado na indexação. Aqui ele só é gravado; o arquivo `02` é que o usa para filtrar.

E as duas buscas funcionam nos dois sentidos. Por texto (`01-Weaviate-Multimodal-Search.py:67-72`):

```python
query = "Monkey with fire"
response = monkey.query.near_text(
    query=query,
```

E por imagem (`01-Weaviate-Multimodal-Search.py:88-93`):

```python
test_image_path = "../../99-EN/assets/multimodal/query_image.jpg"
response = monkey.query.near_image(
    near_image=to_base64(test_image_path),
```

`near_text` num acervo de imagens é a Aula 11 confirmada em outro banco: nenhuma legenda foi indexada, e a busca textual encontra imagens. `near_image` é a busca por exemplo — dê uma imagem, receba as parecidas.

### O corpus tem três imagens, e eu contei

`ls` em `99-EN/assets/multimodal/weaviate/` devolve exatamente três arquivos:
`wukong_demon_fight.jpg`, `wukong_fire_attack.jpg` e `wukong_vs_white_bone_spirit.jpg`. É esse diretório que o script indexa (`01-Weaviate-Multimodal-Search.py:30-31`).

E há um detalhe que só aparece com `md5sum`: o diretório-pai `99-EN/assets/multimodal/` contém dez arquivos — `01.jpg` a `09.jpg` mais `query_image.jpg` —, e **as três imagens do subdiretório são duplicatas exatas** de `01.jpg`, `02.jpg` e `03.jpg`. Os hashes coincidem par a par. O mesmo conteúdo está versionado duas vezes, com dois esquemas de nome: numérico no pai, descritivo no subdiretório.

Isso explica um bloco comentado no fim do arquivo (`01-Weaviate-Multimodal-Search.py:120-128`), que insere um arquivo chamado `"02.jpg"` a partir do caminho de `wukong_fire_attack.jpg` — os dois nomes do mesmo arquivo, no mesmo trecho de código.

Vale registrar o que fica de fora: as imagens `04.jpg` a `09.jpg` existem no repositório e **nenhum script deste módulo as usa** — mas elas não estão órfãs. Os scripts multimodais da Aula 11, em
`04-VectorDB/MultimodalRetrieval/`, apontam para o diretório-pai inteiro, e portanto indexam as nove.
O acervo é compartilhado entre os dois módulos multimodais do repositório: o de Milvus usa tudo, o de
Weaviate usa o subdiretório com as três duplicatas.

### Três modalidades declaradas, uma exercitada

Áudio e vídeo estão configurados no vetorizador (`:19-20`) e comentados na inserção — `01-Weaviate-Multimodal-Search.py:42-52` para áudio e `:54-64` para vídeo —, assim como nas buscas por mídia (`:98-107` e `:109-118`). Os diretórios que eles esperam (`./data/audio/`, `./data/video/`) não existem no repositório.

E aqui está o detalhe que denuncia a origem do código: os blocos comentados usam a variável `animals`
(`01-Weaviate-Multimodal-Search.py:47`, `:59`, `:100`, `:111`, `:124`), e **esta variável não existe neste arquivo** — aqui a coleção se chama `monkey` (`:32`). `animals` é o nome usado no arquivo `02`. Cinco ocorrências de uma variável fantasma, herdadas de copy-paste.

Consequência prática: descomentar qualquer um desses blocos não funciona sem trocar o nome da variável. Um aluno que tente ligar a busca por áudio recebe `NameError`, não um erro sobre áudio.

Duas anotações finais sobre o `01`:

- **`NearMediaType` é import morto na prática.** Ele é importado (`:5`) e usado apenas nas linhas comentadas `:102` e `:113`.
- **A coleção é destruída e recriada a cada execução** (`:12-13`). Correto para reprodutibilidade, e cada execução paga a vetorização das três imagens outra vez — no ImageBind, em CPU.
- **O cliente é fechado** (`:131`). Registro porque o outro arquivo não faz isso.

---

## Parte 3 — O arquivo `02`: o pipeline que insere um texto no lugar da imagem

`10-AdvanceRAG/05-MultiModalRAG/02-Weaviate-Multimodal-RAG.py` tem 107 linhas e a maior ambição dos dois scripts do módulo: recuperar imagem, descrevê-la com um modelo de visão e **gerar uma imagem nova**.

E ele começa com um aviso do autor (`02-Weaviate-Multimodal-RAG.py:1-2`):

```python
# Homework: Students can try to generate an image using MultimodalRAG based on this code framework.
# Not only implement Multimodal retrieval, but also further combine all information based on the retrieved content, and use modern LLMs to generate new text or images.
```

O arquivo se declara, na primeira linha, um **esqueleto para dever de casa**. Isso muda a régua com que ele deve ser lido — e ainda assim o `__main__` executa a cadeia inteira, o que torna o próximo achado relevante.

### O defeito central: a imagem é uma string de exemplo

`02-Weaviate-Multimodal-RAG.py:30-38`:

```python
def insert_multimodal_data():
    animals = client.collections.get("Animals")
    # Assuming there is a base64 string of an image here
    image_base64 = "<YOUR_IMAGE_BASE64_STRING>"
    animals.data.insert({
        "name": "puppy",
        "image": image_base64,
        "mediaType": "image"
    })
```

O que é inserido na coleção multimodal é o texto literal `"<YOUR_IMAGE_BASE64_STRING>"`. E o `__main__` chama essa função sem qualquer substituição (`02-Weaviate-Multimodal-RAG.py:97`), com o comentário da linha 96 pedindo para trocar antes — um pedido que nada verifica.

O resultado é uma coleção com um único objeto, cujo campo de imagem não é uma imagem. A recuperação seguinte (`:42-52`) pede `limit=1` e acessa `response.objects[0]` sem verificar se houve resultado. Depois disso, a descrição por visão e a geração recebem esse conteúdo.

Julgamento: o arquivo não pode demonstrar o que se propõe. Como esqueleto — o que ele declara ser — a sequência das quatro etapas é útil e legível. Como exemplo executável, ele monta o pipeline sobre um placeholder.

E há uma ironia de acervo: as **nove** imagens de `99-EN/assets/multimodal/` estão em disco, o arquivo `01` mostra como carregá-las em três linhas, e o `02` prefere um placeholder.

### O corpus mental é de outro tutorial

`"puppy"` (`:35`), a consulta `"dog with a sign"` (`:99`) e o prompt `"This is a picture of my pet, please provide a cute and vivid description."` (`:102`) não têm relação com nada no repositório — cujo acervo multimodal é de imagens de _Black Myth: Wukong_. É código trazido de outro contexto e não adaptado, no mesmo gênero do caminho absoluto que a Aula 22 encontrou.

### O filtro por modalidade, e aqui ele é usado

Uma coisa que o `02` faz e o `01` não (`02-Weaviate-Multimodal-RAG.py:44-49`):

```python
    response = animals.query.near_text(
        query=query,
        filters=wvc.query.Filter(path="mediaType").equal("image"),
```

Este é o filtro escalar da Aula 10 aplicado a **modalidade**: busca no espaço único, restrição ao tipo desejado. É a metade que faltava no modelo mental desta aula, e é o padrão a copiar — num acervo com áudio e vídeo, `near_text` sem filtro pode devolver um vídeo quando você queria uma foto.

### Duas formas de chamar a mesma API, no mesmo arquivo

A descrição da imagem é feita com HTTP cru (`02-Weaviate-Multimodal-RAG.py:60-73`):

```python
    payload = {
        "model": "gpt-4-vision-preview",
```

E a geração da imagem, com o SDK (`02-Weaviate-Multimodal-RAG.py:80-87`):

```python
    openai_client = OpenAI(api_key=openai_api_key)
    response_oai = openai_client.images.generate(
        model="dall-e-3",
```

O SDK está importado (`:8`) e é usado só na segunda função. Julgamento: o `requests.post` da primeira provavelmente vem do exemplo original da documentação de visão; manter os dois estilos no mesmo arquivo é o tipo de inconsistência que atrapalha quem for estender o código.

Duas fragilidades acompanham a chamada crua:

- **`gpt-4-vision-preview`** (`:61`) é um identificador de preview. Conhecimento de domínio, não leitura deste arquivo: modelos com `-preview` no nome são retirados; a capacidade de visão hoje vive nos modelos principais. Não executei nada — nenhuma biblioteca deste módulo está instalada neste ambiente —, então não afirmo o que a chamada devolve hoje.
- **O resultado é acessado sem tratamento de erro** (`:74`): `response_oai.json()['choices'][0]['message']['content']`. Se a API devolver um objeto de erro, o que se vê é um `KeyError`, não a mensagem do provedor. `grep` por `try:` no arquivo não encontra nada.

### E dois defeitos de ciclo de vida

**A coleção é criada sem verificar se existe.** `create_multimodal_collection` (`:18-27`) chama `collections.create` direto — enquanto o `01` deleta antes de criar (`:12-13`). Rodar o `02` duas vezes seguidas tende a falhar na criação, e o `__main__` chama a função sempre (`:95`).

**A conexão nunca é fechada.** O arquivo termina na chamada do DALL-E (`:107`), e `grep` por `client.close` não encontra nada — enquanto o `01-Weaviate-Multimodal-Search.py` fecha na linha 131.

---

## Parte 4 — O que "RAG" significa aqui

Vale parar num ponto conceitual, porque ele fecha um fio que a Aula 19 abriu.

O pipeline do `02` é: recuperar uma imagem → pedir a um modelo de visão que a descreva → pedir a um gerador de imagens que produza outra a partir da descrição.

Onde está a **augmented generation**? A descrição não é fundamentada em documento nenhum: ela vem do modelo de visão **olhando a imagem**. O texto gerado não afirma fatos sobre um acervo; ele descreve um pixel. E a imagem final não cita fonte alguma.

Isso não desqualifica o exemplo — mas nomeia o que ele é. Assim como na Aula 19, onde o índice guardava **exemplos** para o modelo copiar a forma, aqui a recuperação serve para **escolher o material de entrada**, não para trazer conhecimento que o modelo não tem. É um uso legítimo e distinto do "R" do RAG, e confundi-lo com fundamentação leva a esperar do sistema uma garantia que ele não oferece.

O que seria multimodal RAG no sentido pleno: recuperar imagem **e** o texto que a acompanha — legenda, laudo, seção do manual —, montar um contexto com os dois e gerar uma resposta que cite ambos. O módulo tem a peça mais difícil disso (o espaço comum) e não monta o contexto misto.

---

## Parte 5 — Os dois arquivos, lado a lado

`diff -u` entre eles não compartilha nada além do assunto: são dois programas distintos.

|                                 | `01-Weaviate-Multimodal-Search.py`            | `02-Weaviate-Multimodal-RAG.py`                 |
| ------------------------------- | --------------------------------------------- | ----------------------------------------------- |
| Linhas                          | 131                                           | 107                                             |
| Coleção                         | `Monkey` (`:11-14`)                           | `Animals` (`:20`)                               |
| Dado indexado                   | 3 imagens reais do repo (`:30-40`)            | **placeholder literal** (`:33`)                 |
| Modalidades declaradas / usadas | 3 / 1                                         | 3 / 1 (e a única é falsa)                       |
| Busca                           | `near_text` **e** `near_image` (`:68`, `:89`) | `near_text` com filtro de modalidade (`:44-49`) |
| Geração                         | nenhuma                                       | visão + DALL-E 3 (`:55`, `:79`)                 |
| Idempotente?                    | sim — deleta e recria (`:12-13`)              | **não** — cria sem verificar (`:19`)            |
| Fecha a conexão?                | sim (`:131`)                                  | **não**                                         |
| `load_dotenv()`                 | não (não precisa — Weaviate local)            | sim (`:12`)                                     |

O `.env.example` deste módulo merece nota, e ela fecha um fio que atravessou o curso inteiro. A linha
2 afirma que todo script do diretório carrega o `.env` via `load_dotenv()`, e `grep -c "load_dotenv"`
devolve **0** para o `01` e **2** para o `02`.

Esta aula aproveitou para auditar a frase no repositório todo. Ela aparece em **30** arquivos
`.env.example`. Descontados os sete diretórios que não têm scripts próprios, sobram 23 em que a
afirmação pode ser testada — e ela é **falsa em 15**, de `00-SimpleRAG` (19 de 20 scripts chamam) a
`10-AdvanceRAG/04-AgenticRAG` (0 de 2). É verdadeira em 8, entre eles todos os subdiretórios de
`06-Indexing` e o `10-AdvanceRAG/02-ContextRetrieval` da Aula 24.

Julgamento: a frase é um cabeçalho padronizado, provavelmente gerado de uma vez para todos os
diretórios, e por isso descreve a intenção do formato e não o conteúdo de cada script. As linhas
seguintes, essas sim escritas caso a caso, costumam estar certas — aqui elas dizem que a chave é usada
pelo `02` e que _"Weaviate itself connects to a local instance and needs no API key"_
(`10-AdvanceRAG/05-MultiModalRAG/.env.example:4-5`), e as duas coisas conferem. É a diferença entre
documentação gerada e documentação escrita.

Julgamento de engenharia sobre o par: o `01` é o arquivo a estudar e a copiar. O `02` é o esqueleto que ele mesmo declara ser — leia pela sequência de etapas, e substitua o placeholder pelo carregamento de imagem do `01` antes de rodar. É literalmente o primeiro exercício da próxima seção.

---

## Mão na massa

Este é o segundo módulo do curso que exige Docker — o outro é o Milvus da Aula 09. Suba a infraestrutura primeiro, de dentro do diretório do módulo:

```bash
docker compose up -d
```

Espere o serviço de inferência ficar pronto antes de rodar qualquer script — o ImageBind em CPU leva tempo para carregar.

**1. Rode a busca que funciona.** Execute o `01` e leia os três blocos de resultado: `"Monkey with fire"`, `"Monsters"` e a busca por imagem. Compare os três conjuntos devolvidos. Você está buscando imagens sem que nenhuma legenda tenha sido indexada.

**2. Conserte o `02` com o `01`.** Em `02-Weaviate-Multimodal-RAG.py`, substitua o placeholder da linha 33 pelo `to_base64` do `01` apontando para uma das três imagens do acervo, e troque a consulta da linha 99 por algo pertinente às imagens. Agora o pipeline de descrição e geração tem uma imagem de verdade.

**3. Torne o `02` idempotente.** Acrescente a verificação de existência que o `01-Weaviate-Multimodal-Search.py` tem (`:12-13`) e um `client.close()` no fim. Rode duas vezes seguidas e confirme que a segunda funciona.

**4. Meça o custo de vetorizar.** Cronometre a inserção das três imagens no `01`. Multiplique pelo tamanho do seu acervo. Depois lembre que `ENABLE_CUDA` está em `0` — e que essa é a variável a mudar primeiro.

**5. Observe os 12 GB.** Com o serviço de pé, olhe o consumo real de memória do contêiner `multi2vec-bind`. Compare com o `mem_limit` declarado. É o número que decide se este módulo cabe na sua máquina.

**6. Use as imagens que ninguém usa.** Indexe `99-EN/assets/multimodal/` inteiro em vez de só o subdiretório `weaviate/`. Você passa de 3 para 9 imagens indexadas — e como três delas são duplicatas exatas das do subdiretório, verifique o que a busca faz com conteúdo idêntico e nomes diferentes.

**7. Busque com e sem o filtro de modalidade.** Aplique o `Filter(path="mediaType")` do `02-Weaviate-Multimodal-RAG.py` (`:46`) às buscas do `01` e compare. Com um acervo só de imagens a diferença é nula — e é isso que você quer confirmar antes de acreditar que o filtro está funcionando.

**8. Adicione uma segunda modalidade.** Descomente o bloco de áudio do `01-Weaviate-Multimodal-Search.py` (`:42-52`), **troque `animals` por `monkey`**, crie o diretório `./data/audio/` e coloque dois arquivos. Depois busque áudio por texto. Este é o exercício que mostra o espaço comum fazendo o que a Aula 11 não pôde demonstrar.

---

## Quebre de propósito

**1. Rode o `02` como está.** Antes de consertar nada. Veja o que acontece quando o campo de imagem contém `"<YOUR_IMAGE_BASE64_STRING>"`. Registre em que etapa o erro aparece — e note que não é na inserção.

**2. Descomente o áudio sem trocar a variável.** Em `01-Weaviate-Multimodal-Search.py`, descomente `:42-52` sem tocar em `animals`. O `NameError` que você recebe não menciona áudio, nem Weaviate, nem modalidade. É a demonstração de por que import e variável fantasma custam tempo de depuração.

**3. Tire o filtro de modalidade.** No `02` corrigido, indexe uma imagem e um áudio e remova o `filters` da linha 46. Busque por texto. Se vier o áudio, você acabou de ver por que o espaço único precisa do filtro.

**4. Peça o impossível ao espaço comum.** Busque por um conceito abstrato que não tem forma visual — "justiça", "recursão" — e veja o que as três imagens de macaco devolvem. O espaço comum sempre devolve o mais próximo; proximidade não é presença.

**5. Meça o domínio.** A Aula 11 avisou que desempenho de modelo multimodal em imagem técnica precisa ser medido, não presumido. Indexe cinco diagramas ou capturas de tela e busque por termos técnicos. Compare com o resultado nas imagens do jogo.

**6. Exponha o Weaviate.** Não faça isto em máquina acessível: `AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'` com a porta 8080 publicada aceita qualquer requisição. Leia a linha 10 do compose e pergunte-se o que aconteceria num servidor com IP público.

---

## Armadilhas de produção

**Placeholder que roda.** `"<YOUR_IMAGE_BASE64_STRING>"` inserido num banco é o gênero de erro que atravessa o pipeline e falha longe da origem. Um `assert` de que o campo se parece com base64 custa uma linha.

**Doze gigabytes que não somem.** Custo de inferência hospedada é permanente, diferente de custo por consulta. Se o seu acervo multimodal é pequeno, um serviço gerenciado por chamada pode sair mais barato que manter o contêiner de pé.

**CPU para vetorizar mídia.** `ENABLE_CUDA: '0'` é o padrão do exemplo e o primeiro gargalo real. Vetorizar vídeo em CPU é impraticável em qualquer volume.

**Acesso anônimo publicado.** A configuração de desenvolvimento não é a de produção, e a diferença aqui é uma linha do compose.

**Coleção recriada em produção.** O `01` deleta e recria a coleção a cada execução (`:12-13`). Adequado para exemplo, catastrófico se o script vazar para um ambiente com dados.

**Conexão não fechada.** O cliente Weaviate v4 mantém recursos abertos; o `02` termina sem fechar. Em processo de vida longa, isso acumula.

**Espaço comum sem filtro de tipo.** Num acervo misto, `near_text` devolve a coisa mais próxima, de qualquer modalidade. Grave o tipo na indexação e filtre na consulta — as duas metades.

**Recuperar imagem não é fundamentar resposta.** Como a Parte 4 nomeou: quando o retrieval serve para escolher a entrada, e não para trazer conhecimento, não há garantia de fundamentação a cobrar. Se o seu caso exige citar a fonte, o contexto tem de incluir o texto associado à imagem.

**Desempenho de domínio presumido.** Modelos multimodais são treinados em mídia genérica. Radiografia, diagrama de engenharia e captura de tela são domínios em que o desempenho se mede — e a Aula 22 diz com o quê.

---

## Checkpoint

Responda sem consultar:

1. O que este módulo acrescenta ao que a Aula 11 já havia demonstrado sobre multimodal?
2. Qual modelo faz a vetorização, e em que arquivo você descobre isso?
3. Espaço vetorial único e filtro por metadado são alternativas? Onde cada um aparece neste módulo?
4. Quantos gigabytes o serviço de inferência declara precisar, e por que esse número é diferente dos custos das aulas anteriores?
5. O que `ENABLE_CUDA: '0'` implica para um acervo real?
6. Quantas modalidades a coleção declara, e quantas são exercitadas?
7. Que variável fantasma aparece nos blocos comentados do `01`, e de onde ela veio?
8. Quantas imagens o `01` indexa, e o que o `md5sum` revela sobre o acervo multimodal do repositório?
9. O que o `02` insere no campo de imagem, e em que etapa a falha aparece?
10. Que duas formas de chamar a API da OpenAI convivem no `02`?
11. Cite duas assimetrias de ciclo de vida entre o `01` e o `02`.
12. Por que o pipeline do `02` é multimodal e generativo, mas não é fundamentação? O que faltaria?

---

## Vocabulário

`multimodal embedding` · `ImageBind` · `multi2vec-bind` · `near_text` · `near_image` · `near_media` ·
`mediaType filter` · `filtered search` · `inference service` ·
`vision model` · `text-to-image`

Definições em [`GLOSSARIO.md`](GLOSSARIO.md).

---

**Anterior:** [AULA 26 — Agentic RAG e Adaptive RAG com LangGraph](AULA-26-agentic-adaptive-rag.md)
**Próxima:** [AULA 28 — Projeto final: um RAG seu, medido e defendido](AULA-28-projeto-final.md)

> **Fase 9 concluída, e o repositório inteiro foi lido.** Onze módulos, dos primeiros cinco arquivos de
> `00-SimpleRAG` ao `docker-compose.yml` deste. A Aula 28 não abre módulo novo: ela devolve o curso ao
> aluno, transformando as decisões de cada fase num roteiro de construção — e o instrumento da Aula 22
> no critério que separa um RAG defendido de um RAG que só parece funcionar.
