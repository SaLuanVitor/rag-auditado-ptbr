#!/usr/bin/env bash
# Reconstroi o ambiente de medicao com os pins exatos do curso.
#
# Por que ele existe: o venv anterior vivia no scratchpad da sessao e foi
# apagado sem aviso em 14/09/2026, levando junto 17 scripts. Tres auditores da
# setima rodada declararam NAO_EXECUTADO por falta dele. Sem ambiente, alegacao
# sobre comportamento de biblioteca vira leitura de codigo, que e hipotese.
#
# NAO sao os 274 pacotes do curso. Sao os que respondem perguntas de mecanismo.
# Fora: torch, chromadb, onnxruntime, sentence-transformers, transformers,
# weaviate, deepeval, trulens, camelot, unstructured, faiss, milvus_lite. A
# ausencia deles e limite legitimo e deve ser declarada no relatorio, nao
# contornada.
#
# Uso:  bash ferramentas/montar-ambiente.sh [destino]
# Padrao: E:/tmp/rag-venv, fora do repositorio e fora do scratchpad.
set -u

DESTINO="${1:-/e/tmp/rag-venv}"
BASE_PY="${BASE_PY:-/c/Users/luanv/miniconda3/python.exe}"

echo "== Ambiente de medicao do curso =="
echo "   destino: $DESTINO"
"$BASE_PY" --version || { echo "ABORTADO: python base ausente em $BASE_PY"; exit 1; }

if [ -x "$DESTINO/Scripts/python.exe" ]; then
  echo "   ja existe, reaproveitando"
else
  "$BASE_PY" -m venv "$DESTINO" || { echo "ABORTADO: venv nao criou"; exit 1; }
fi
PY="$DESTINO/Scripts/python.exe"

# setuptools<81 e obrigatorio: o pymilvus 2.5.4 importa pkg_resources, que o
# setuptools removeu na 81. E o defeito que a AULA-00 documenta.
"$PY" -m pip install --quiet --upgrade pip "setuptools<81" wheel

PINS="langchain==0.3.17 langchain-core==0.3.33 langchain-community==0.3.16 \
langchain-openai==0.3.3 langchain-text-splitters==0.3.5 langgraph==0.2.69 \
pymilvus==2.5.4 llama-index-core==0.11.17 ragas==0.2.15 pydantic==2.13.4 \
openai==1.109.1 numpy==1.26.4 rank-bm25==0.2.2"

# Um pip por pacote deixa o resolvedor promover dependencia. Medido em 14/09:
# instalar em sequencia levou langchain-core de 0.3.33 para 0.3.86, porque um
# pacote posterior pediu mais novo, e a conferencia daquela versao do script
# so imprimia a versao em vez de compara-la, entao o desvio passou. Uma chamada
# so faz o resolvedor honrar todas as restricoes ao mesmo tempo.
echo "== instalando os pins, numa chamada so =="
if "$PY" -m pip install --quiet $PINS 2>&1 | grep -v "^$"; then :; fi

echo "== conferindo versao contra o pin, nao so a presenca =="
"$PY" - <<'PY'
import sys
from importlib.metadata import version, PackageNotFoundError

esperado = {
    "langchain": "0.3.17", "langchain-core": "0.3.33",
    "langchain-community": "0.3.16", "langchain-openai": "0.3.3",
    "langchain-text-splitters": "0.3.5", "langgraph": "0.2.69",
    "pymilvus": "2.5.4", "llama-index-core": "0.11.17",
    "ragas": "0.2.15", "pydantic": "2.13.4",
    "openai": "1.109.1", "numpy": "1.26.4",
    "rank-bm25": "0.2.2",
}
divergem, ausentes = [], []
for nome, quer in sorted(esperado.items()):
    try:
        tem = version(nome)
    except PackageNotFoundError:
        print(f"   AUSENTE  {nome}")
        ausentes.append(nome)
        continue
    marca = "ok " if tem == quer else "PIN"
    print(f"   {marca}      {nome:26s} {tem}" + ("" if tem == quer else f"   (pin: {quer})"))
    if tem != quer:
        divergem.append((nome, tem, quer))

try:
    st = version("setuptools")
    ok = int(st.split(".")[0]) < 81
    print(f"   {'ok ' if ok else 'PIN'}      {'setuptools':26s} {st}   (exige <81, pelo pkg_resources do pymilvus)")
    if not ok:
        divergem.append(("setuptools", st, "<81"))
except PackageNotFoundError:
    ausentes.append("setuptools")

if ausentes or divergem:
    print()
    if ausentes:
        print("REPROVA: ausentes ->", ", ".join(ausentes))
    if divergem:
        print("REPROVA: fora do pin ->", ", ".join(f"{n} {t} != {q}" for n, t, q in divergem))
    print("O ambiente NAO reproduz o do curso. Nao use para medir.")
    sys.exit(1)
print("\nTodos os pins conferem.")
PY
CONFERE=$?

echo
echo "== caminho do interpretador, para colar em briefing de auditor =="
echo "   $(cygpath -w "$PY" 2>/dev/null || echo "$PY")"
exit $CONFERE
