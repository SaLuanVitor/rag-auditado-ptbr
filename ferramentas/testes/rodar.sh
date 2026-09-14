#!/usr/bin/env bash
# Roda todas as suites, sempre com o positivo plantado.
#
# Sem `--provar` uma suite verde nao prova nada: ela pode estar aprovando por
# nao medir. Foi assim que sete verificadores deste projeto aprovaram em
# silencio antes de 14/09/2026, e e por isso que aqui o positivo plantado nao e
# opcional.
set -u
falhou=0
for t in "$(dirname "$0")"/*.test.js; do
  echo "== $(basename "$t")"
  node "$t" --provar || falhou=1
  echo
done
[ $falhou -eq 0 ] && echo "SUITE VERDE" || echo "SUITE VERMELHA"
exit $falhou
