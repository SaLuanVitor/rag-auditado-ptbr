"""
AULA 02 — Vetores, embeddings e similaridade.

Exercicio proprio do curso PT-BR. Nao faz parte do repositorio da Packt.

Dependencias (ja instaladas na Aula 00):
    pip install sentence-transformers numpy

Execucao:
    python aula-02-similaridade.py

O que este script demonstra:
    1. O que e, concretamente, um embedding
    2. Cosseno, produto interno e L2 calculados na mao
    3. Que as tres metricas produzem o MESMO ranking com vetores normalizados
    4. Que L2 sem inversao de ordem quebra o ranking silenciosamente
    5. Que negacao nao e capturada pelo espaco vetorial
    6. Que codigo de produto e o ponto cego do embedding
"""

import numpy as np
from sentence_transformers import SentenceTransformer

# Troque por 'paraphrase-multilingual-MiniLM-L12-v2' no experimento 2 da aula.
MODELO = 'sentence-transformers/all-MiniLM-L6-v2'

FRASES = [
    'O cachorro dormiu no sofa da sala.',
    'O cao descansou no estofado.',                      # sinonimo, zero palavras em comum
    'A planilha de custos foi fechada no prazo.',         # assunto totalmente distinto
    'Este contrato possui clausula de multa rescisoria.',
    'Este contrato nao possui clausula de multa rescisoria.',  # negacao da anterior
    'O produto SKU-88213-B esta esgotado no estoque.',
    'O item de codigo diferente continua disponivel.',
]

CONSULTA = 'Onde o animal de estimacao ficou deitado?'


def cosseno(a, b):
    """Cosseno do angulo entre a e b. Faixa -1 a 1. Maior = mais parecido."""
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def produto_interno(a, b):
    """Produto interno. Identico ao cosseno quando os vetores sao normalizados."""
    return float(np.dot(a, b))


def distancia_l2(a, b):
    """Distancia euclidiana. MENOR = mais parecido. Atencao a inversao."""
    return float(np.linalg.norm(a - b))


def secao(titulo):
    print()
    print('=' * 78)
    print(titulo)
    print('=' * 78)


def main():
    secao('1. O QUE E UM EMBEDDING')

    modelo = SentenceTransformer(MODELO)
    vetores = modelo.encode(FRASES)

    print(f'Modelo:     {MODELO}')
    print(f'Frases:     {len(FRASES)}')
    print(f'Shape:      {vetores.shape}   (linhas = frases, colunas = dimensoes)')
    print(f'Dimensoes:  {vetores.shape[1]}')
    print()
    print(f'Frase 0: "{FRASES[0]}"')
    print(f'Primeiros 8 valores do vetor: {np.round(vetores[0][:8], 4)}')
    print()
    normas = [round(float(np.linalg.norm(v)), 4) for v in vetores]
    print(f'Norma (comprimento) de cada vetor: {normas}')
    print('Se as normas sao ~1.0, o modelo entrega vetores normalizados —')
    print('e nesse caso produto interno == cosseno.')

    secao('2. RANKING PELAS TRES METRICAS, LADO A LADO')

    v_consulta = modelo.encode([CONSULTA])[0]
    print(f'Consulta: "{CONSULTA}"')
    print()

    linhas = []
    for i, frase in enumerate(FRASES):
        linhas.append({
            'idx': i,
            'frase': frase,
            'cos': cosseno(v_consulta, vetores[i]),
            'ip': produto_interno(v_consulta, vetores[i]),
            'l2': distancia_l2(v_consulta, vetores[i]),
        })

    print(f'{"cos":>8} {"ip":>8} {"l2":>8}   frase')
    print('-' * 78)
    for r in sorted(linhas, key=lambda x: x['cos'], reverse=True):
        print(f'{r["cos"]:>8.4f} {r["ip"]:>8.4f} {r["l2"]:>8.4f}   {r["frase"][:48]}')

    print()
    print('Ordenado por cosseno DECRESCENTE. Note que ip acompanha na mesma ordem,')
    print('e l2 cresce monotonicamente — ou seja, os tres concordam.')

    secao('3. O BUG SILENCIOSO: L2 ORDENADO NO SENTIDO ERRADO')

    # >>> EXPERIMENTO 1 DA AULA <<<
    # Troque reverse=False por reverse=True e veja o ranking se inverter.
    # Em L2, MENOR e mais parecido. Ordenar decrescente devolve o PIOR primeiro,
    # e nenhum erro e lancado.
    errado = sorted(linhas, key=lambda x: x['l2'], reverse=True)
    certo = sorted(linhas, key=lambda x: x['l2'], reverse=False)

    print('Top-1 com L2 ordenado ERRADO (decrescente):')
    print(f'  -> {errado[0]["frase"]}')
    print()
    print('Top-1 com L2 ordenado CERTO (crescente):')
    print(f'  -> {certo[0]["frase"]}')
    print()
    print('Nenhuma excecao, nenhum aviso. So resultados ruins. Este e o bug')
    print('mais insidioso de RAG iniciante.')

    secao('4. NEGACAO NAO E CAPTURADA')

    i_com, i_sem = 3, 4
    sim = cosseno(vetores[i_com], vetores[i_sem])
    print(f'A: "{FRASES[i_com]}"')
    print(f'B: "{FRASES[i_sem]}"')
    print()
    print(f'Cosseno(A, B) = {sim:.4f}')
    print()
    print('Sao afirmacoes OPOSTAS, com cosseno altissimo. O espaco vetorial')
    print('captura ASSUNTO, nao POLARIDADE. Se o seu dominio depende de negacao,')
    print('busca vetorial pura vai te trair.')

    secao('5. O PONTO CEGO: CODIGO DE PRODUTO')

    consulta_sku = 'SKU-88213-B'
    v_sku = modelo.encode([consulta_sku])[0]

    print(f'Consulta: "{consulta_sku}"')
    print()
    print(f'{"cos":>8}   frase')
    print('-' * 78)
    for r in sorted(
        [{'frase': f, 'cos': cosseno(v_sku, vetores[i])} for i, f in enumerate(FRASES)],
        key=lambda x: x['cos'],
        reverse=True,
    ):
        print(f'{r["cos"]:>8.4f}   {r["frase"][:56]}')

    print()
    print('A frase que contem literalmente o SKU nao domina o ranking como deveria.')
    print('BM25 acertaria isso trivialmente. Este e o argumento empirico para')
    print('BUSCA HIBRIDA (Aula 11): densa e esparsa falham em casos DIFERENTES.')

    print()
    print('=' * 78)
    print('Fim. Volte para AULA-02 e faca os experimentos 2 e 3.')
    print('=' * 78)


if __name__ == '__main__':
    main()
