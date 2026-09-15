// Acha numeral que promete uma contagem e lista que entrega outra.
//
// E a forma que mais reincidiu nesta auditoria depois da cauda que cola, e ela
// nasce sempre do mesmo jeito: o conserto entra no CORPO do paragrafo e o
// cabecalho, o intro ou o checkpoint ficam na versao antiga. Seis ocorrencias
// medidas ate 14/09/2026:
//
//   "Dois comentarios que mentem"      -> o corpo cita tres linhas
//   "Tres coisas para conferir"        -> quatro marcadores
//   "tres coisas nos arquivos impedem" -> a lista tinha de ter cinco
//   "mais duas mudancas"               -> tres
//   "com uma excecao declarada"        -> dois orfaos
//   "as seis decisoes escondidas em"   -> a tabela atribui a quatro chamadas
//
// E ALERTA DE LEITURA, nao veredito. Numeral em prosa nem sempre anuncia a
// lista que vem depois, e o script nao tem como saber: ele aponta, quem le
// decide. Medido no acervo, a razao de ruido esta declarada no fim deste
// comentario, e vale remedir antes de citar.
//
// Uso: node ferramentas/contagem.js <arquivo.md> [...]
const fs = require('fs');

const NUM = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5,
  seis: 6, sete: 7, oito: 8, nove: 9, dez: 10,
};
// Ordinais NAO sao numerais que anunciam: eles FECHAM a conta. "Cinco deles tem
// correspondencia... O SEXTO nao tem fase propria" descreve corretamente uma
// tabela de seis, e o script acusava porque via o cinco e nao via o sexto.
//
// Eles entram so como ABSOLVICAO, nunca como acusacao: um ordinal que bate com a
// contagem inocenta a linha, e um ordinal sozinho nunca abre alerta. Sem essa
// assimetria, "o terceiro argumento" numa frase antes de uma lista de cinco
// viraria falso positivo novo, que e o oposto do que este conserto quer.
const ORD = {
  primeiro: 1, primeira: 1, segundo: 2, segunda: 2, terceiro: 3, terceira: 3,
  quarto: 4, quarta: 4, quinto: 5, quinta: 5, sexto: 6, sexta: 6,
  setimo: 7, setima: 7, oitavo: 8, oitava: 8, nono: 9, nona: 9,
  decimo: 10, decima: 10,
};
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Ate onde procurar a lista depois do numeral.
//
// A janela era 14 e o resultado foi inutil: 534 alertas no acervo, quase todos
// numeral de prosa que nao anuncia lista nenhuma ("rodando diff entre os dois"
// fala de dois arquivos, nao da tabela abaixo). O que separa os seis casos reais
// do ruido e a POSICAO: nos seis, o numeral esta em cabecalho ou numa frase que
// fecha em dois-pontos logo antes da lista. Sem esse filtro a ferramenta nao
// serve, e com ele o alcance encolhe de proposito.
const JANELA = 3;

function itens(linhas, ini) {
  // Acha o primeiro bloco de lista ou tabela dentro da janela e conta.
  let fence = false;
  for (let i = ini; i < Math.min(linhas.length, ini + JANELA); i++) {
    const l = linhas[i];
    if (l.trimStart().startsWith('```')) { fence = !fence; continue; }
    if (fence) continue;
    const marcador = /^\s*(?:[-*+]\s|\d+\.\s)/;
    const tabela = /^\s*\|/;
    if (marcador.test(l)) {
      let n = 0;
      for (let j = i; j < linhas.length; j++) {
        if (linhas[j].trim() === '') break;
        if (marcador.test(linhas[j])) n++;
      }
      return { tipo: 'lista', n, linha: i + 1 };
    }
    if (tabela.test(l)) {
      let n = 0, colunas = 0;
      for (let j = i; j < linhas.length; j++) {
        if (!tabela.test(linhas[j])) break;
        // O cabecalho e o separador nao sao itens.
        if (/^\s*\|[\s:|-]+\|\s*$/.test(linhas[j])) { n = 0; continue; }
        if (!colunas) {
          // Colunas do cabecalho, descontando a primeira se for o rotulo de
          // linha (celula vazia). Tabela de comparacao e o maior gerador de
          // falso positivo aqui: "Duas familias" nomeia as COLUNAS, e contar
          // linhas acusava toda tabela de comparacao do acervo.
          // So conta como "tabela de comparacao" a que tem a PRIMEIRA CELULA DO
          // CABECALHO VAZIA, que e a forma em que o numeral nomeia as colunas e
          // a coluna 1 e so o rotulo da linha. Descontar coluna em qualquer
          // tabela engolia o caso legitimo: "Duas estrategias" sobre uma tabela
          // Nome/O-que-faz de tres linhas tem duas colunas e o defeito e real.
          const cs = linhas[j].split('|').slice(1, -1);
          colunas = cs[0].trim() === '' ? cs.length - 1 : 0;
        }
        n++;
      }
      return { tipo: 'tabela', n, colunas, linha: i + 1 };
    }
  }
  return null;
}

const alvos = process.argv.slice(2);
if (!alvos.length) { console.error('uso: node ferramentas/contagem.js <arquivo.md> [...]'); process.exit(2); }

let total = 0;
for (const arq of alvos) {
  const linhas = fs.readFileSync(arq, 'utf8').split(/\r?\n/);
  let fence = false;
  linhas.forEach((l, i) => {
    if (l.trimStart().startsWith('```')) { fence = !fence; return; }
    if (fence) return;
    // O numeral tem de estar em prosa, nao dentro de item de lista: item que
    // comeca com numeral fala de outra coisa.
    if (/^\s*(?:[-*+]\s|\d+\.\s)/.test(l)) return;
    // So vale numeral que ANUNCIA a lista: em cabecalho, ou em frase que fecha
    // em dois-pontos. Ver a nota do JANELA para a medicao que obrigou a isto.
    if (!/^#{1,6}\s/.test(l) && !/:\s*$/.test(l.trimEnd())) return;

    const bloco = itens(linhas, i + 1);
    if (!bloco) return;

    // Todos os numerais da linha, sem o 1: "um" e "uma" quase nunca anunciam
    // lista ("um `.env.example`", "em uma frase por fase"), e incluí-los dobrava
    // o ruido. Custo declarado: o caso real "com uma excecao declarada", que
    // eram duas, fica fora do alcance desta ferramenta.
    const achados = [];
    for (const m of l.matchAll(/\b([A-Za-zÀ-ÿ]+)\b/g)) {
      const v = NUM[semAcento(m[1])];
      if (v && v > 1) achados.push({ palavra: m[1], v });
    }
    if (!achados.length) return;

    // Se QUALQUER numeral da linha bate com a contagem, a linha esta coerente:
    // os outros sao referencia interna ("Tres coisas, e as duas primeiras...").
    if (achados.some((a) => a.v === bloco.n)) return;
    // Absolvicao por ordinal: se a linha nomeia "o sexto" e o bloco tem seis, a
    // conta fecha e o cardinal menor e um subconjunto declarado, nao um erro.
    for (const m of l.matchAll(/\b([A-Za-zÀ-ÿ]+)\b/g)) {
      if (ORD[semAcento(m[1])] === bloco.n) return;
    }
    // Em tabela, o numeral pode nomear as COLUNAS em vez das linhas: "Os quatro,
    // lado a lado" sobre uma tabela de comparacao de quatro arquivos em quatro
    // colunas. O desconto estava calculado e nao estava sendo usado, e por isso
    // a ferramenta acusava toda tabela de comparacao do acervo.
    if (bloco.tipo === 'tabela' && achados.some((a) => a.v === bloco.colunas)) return;

    const a = achados[0];
    total++;
    console.log(`${arq}:${i + 1}  "${a.palavra}" promete ${a.v}, ${bloco.tipo} de ${bloco.n} na linha ${bloco.linha}`);
    console.log(`    ${l.trim().slice(0, 110)}`);
  });
}

console.log(total ? `\n${total} divergencia(s) a conferir.` : 'Nenhuma divergencia.');
process.exit(total ? 1 : 0);
