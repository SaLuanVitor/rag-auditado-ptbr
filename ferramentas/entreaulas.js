// Valida citacao de LINHA de uma aula para outra aula.
//
// E a unica classe de defeito que reapareceu nas tres rodadas de 15/09/2026 e que
// nenhum instrumento desta casa alcancava. O verify-citations.js resolve citacao
// contra o CLONE da fonte; citacao de aula para aula ele nao ve, porque o alvo
// nao e um .py do repositorio auditado, e um .md daqui.
//
// A citacao da AULA-21 para a AULA-18 errou TRES VEZES, por tres causas
// diferentes, e a terceira e a que nomeia esta ferramenta:
//
//   1. apontava para :217, correto quando escrito, envelhecido quando a oitava
//      rodada reescreveu a AULA-18;
//   2. foi corrigida para :243-247, com o alvo medido na hora;
//   3. quebrou de novo no mesmo dia porque um conserto MEU na AULA-18, de outra
//      auditoria, acrescentou cinco linhas e empurrou a passagem para :248-252.
//
// EDITAR UM ARQUIVO INVALIDA TODA CITACAO DE LINHA QUE APONTE PARA ELE, e nada
// avisa. Quem achou a terceira quebra foi uma varredura redundante que um auditor
// despachou por conta propria, nao o auditor principal e nao uma ferramenta.
//
// O QUE ELE DECIDE, e o que ele nao decide:
//
//   DESLOCADA  a citacao traz uma transcricao logo depois e ela NAO esta nas
//              linhas citadas. E o unico veredito forte, e e o que pega o caso
//              acima. Reprova.
//   FORA       a linha citada passa do fim do arquivo alvo. Reprova.
//   SEM_PROVA  a citacao nao traz transcricao, entao so a faixa foi conferida.
//              Alerta de leitura, nao reprova: o alvo pode ter mudado de
//              conteudo sem mudar de tamanho, e daqui nao se decide.
//
// A convencao que tornaria tudo decidivel esta declarada e NAO imposta: citacao
// de linha entre aulas acompanhada de transcricao. Impo-la de uma vez marcaria
// tres das quatro citacoes do acervo, entao ela entra como alerta ate alguem
// decidir adota-la.
//
// Uso: node ferramentas/entreaulas.js [arquivo.md ...]   (padrao: todas as AULA-*.md)
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');

// Ate onde procurar a transcricao depois da linha que cita.
const JANELA = 4;

// Mapa do numero da aula para o arquivo, montado do disco e nao suposto: os nomes
// carregam o assunto depois do numero e mudam.
const porNumero = new Map();
for (const f of fs.readdirSync(RAIZ)) {
  const m = f.match(/^AULA-(\d{2})-.*\.md$/);
  if (m) porNumero.set(m[1], f);
}

const linhasDe = new Map();
function alvo(num) {
  const f = porNumero.get(num);
  if (!f) return null;
  if (!linhasDe.has(f)) linhasDe.set(f, fs.readFileSync(path.join(RAIZ, f), 'utf8').split(/\r?\n/));
  return { arquivo: f, linhas: linhasDe.get(f) };
}

// Duas formas, e as duas apareceram no acervo:
//   explicita: `AULA-18:243` ou `AULA-18:243-247`
//   em prosa:  "nas linhas 248 a 252 daquela aula"
//
// A forma em prosa so conta quando a mesma frase, ou a anterior, nomeia a aula.
// Sem isso, "linha 5" quase sempre fala de um .py, e foi assim em dois dos
// quatro casos que o primeiro grep desta ferramenta devolveu.
const RE_EXPLICITA = /AULA-(\d{2})[^\s`]*?:(\d+)(?:-(\d+))?/g;
const RE_PROSA = /linhas?\s+(\d+)(?:\s+a\s+(\d+))?\s+(?:daquela aula|da Aula\s+(\d{2}))/gi;
const RE_AULA_PERTO = /(?:^|[^-\w])Aula\s+(\d{2})\b/;

function citacoes(texto, arqOrigem) {
  const linhas = texto.split(/\r?\n/);
  const achadas = [];
  linhas.forEach((l, i) => {
    for (const m of l.matchAll(RE_EXPLICITA)) {
      achadas.push({ linha: i + 1, num: m[1], ini: +m[2], fim: m[3] ? +m[3] : +m[2], forma: 'explicita', bruto: m[0] });
    }
    for (const m of l.matchAll(RE_PROSA)) {
      // "daquela aula" precisa de antecedente: procura o numero na propria linha
      // ou na anterior, que e onde a frase costuma nomear a aula.
      let num = m[3];
      if (!num) {
        const antes = (linhas[i - 1] || '') + ' ' + l.slice(0, m.index);
        const a = antes.match(new RegExp(RE_AULA_PERTO.source + '(?![\\s\\S]*Aula\\s+\\d{2})'));
        num = a && a[1];
      }
      if (!num) continue;
      achadas.push({ linha: i + 1, num, ini: +m[1], fim: m[2] ? +m[2] : +m[1], forma: 'prosa', bruto: m[0] });
    }
  });
  // A propria aula citando a si mesma nao e o objeto desta ferramenta.
  const meu = arqOrigem.match(/^AULA-(\d{2})-/);
  return achadas.filter((c) => !meu || c.num !== meu[1]);
}

// A transcricao: bloco de citacao (`> `) que comeca dentro da janela.
//
// A janela NAO para na primeira linha de prosa, e a razao esta medida: a frase
// que cita quase sempre quebra em duas linhas e termina em dois-pontos antes do
// bloco. A primeira versao desta funcao abortava ali, e o resultado foi a
// ferramenta passar VERDE com zero verificacoes de conteudo, que e exatamente o
// defeito que ela existe para nao repetir.
function transcricao(linhas, apos) {
  for (let i = apos; i < Math.min(linhas.length, apos + JANELA); i++) {
    if (/^\s*>\s?\S/.test(linhas[i])) {
      const bloco = [];
      for (let j = i; j < linhas.length && /^\s*>/.test(linhas[j]); j++) {
        bloco.push(linhas[j].replace(/^\s*>\s?/, ''));
      }
      return bloco.filter((s) => s.trim());
    }
  }
  return null;
}

// Compara por PALAVRAS, nao por linha: o requebra.js move a quebra de linha sem
// mudar o texto, e uma comparacao literal acusaria todo reempacotamento.
const palavras = (s) => s.replace(/\s+/g, ' ').trim();

// O padrao varre as aulas E os documentos vivos da raiz, e NAO varre `avaliacao/`.
//
// A distincao e de proposito e custou um achado para ser vista: o `HANDOFF.md`
// citava `AULA-18:157` como forma exemplar de ressalva, e a linha tinha ido para
// 160 e o texto citado era a versao anterior, reescrita no mesmo dia. Documento
// vivo tem de apontar para o estado atual.
//
// Registro de auditoria e o oposto: ele cita o estado do dia em que mediu, e uma
// citacao que envelhece ali esta CERTA. O GATE tem linhas como "AULA-13:196 na
// versao anterior; a palavra foi removida em 7d516c0", que sao o registro
// funcionando. Varrer `avaliacao/` transformaria historia em defeito.
const VIVOS = ['HANDOFF.md', 'GLOSSARIO.md', 'README.md'];
const alvos = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(RAIZ)
      .filter((f) => /^AULA-\d{2}-.*\.md$/.test(f) || VIVOS.includes(f));

let reprova = 0, alertas = 0, ok = 0;
for (const arq of alvos) {
  const base = path.basename(arq);
  const texto = fs.readFileSync(path.join(RAIZ, base), 'utf8');
  const linhas = texto.split(/\r?\n/);
  for (const c of citacoes(texto, base)) {
    const a = alvo(c.num);
    if (!a) {
      console.log(`${base}:${c.linha}  FORA  "${c.bruto}": não há AULA-${c.num} neste diretório`);
      reprova++;
      continue;
    }
    if (c.fim > a.linhas.length) {
      console.log(`${base}:${c.linha}  FORA  "${c.bruto}": ${a.arquivo} tem ${a.linhas.length} linhas`);
      reprova++;
      continue;
    }
    const cit = transcricao(linhas, c.linha);
    if (!cit) {
      console.log(`${base}:${c.linha}  SEM_PROVA  "${c.bruto}" -> ${a.arquivo}: faixa cabe, conteúdo não conferível daqui`);
      alertas++;
      continue;
    }
    const naFaixa = palavras(a.linhas.slice(c.ini - 1, c.fim).join(' '));
    const primeira = palavras(cit[0]);
    if (naFaixa.includes(primeira)) { ok++; continue; }
    // Achar onde a transcricao de fato mora, para o relatorio dizer o conserto e
    // nao so que esta errado.
    //
    // A busca e por SEQUENCIA DE PALAVRAS com indice de linha, e nao por janela
    // de N linhas: o alvo quebra o texto em outro lugar que a transcricao, entao
    // comparar linha a linha nao acha, e comparar uma janela acha cedo demais. A
    // primeira versao desta busca devolvia 244 para uma passagem que comeca em
    // 248, porque a janela de cinco linhas a partir de 244 ja continha o trecho.
    let onde = 0;
    const seq = [];
    a.linhas.forEach((l, i) => { for (const p of palavras(l).split(' ')) if (p) seq.push({ p, linha: i + 1 }); });
    const alvoPal = primeira.split(' ').filter(Boolean);
    for (let i = 0; i + alvoPal.length <= seq.length; i++) {
      let bate = true;
      for (let j = 0; j < alvoPal.length; j++) if (seq[i + j].p !== alvoPal[j]) { bate = false; break; }
      if (bate) { onde = seq[i].linha; break; }
    }
    console.log(`${base}:${c.linha}  DESLOCADA  "${c.bruto}" -> ${a.arquivo}`);
    console.log(`    a transcrição não está em ${c.ini}-${c.fim}${onde ? `, e sim a partir de ${onde}` : ''}`);
    reprova++;
  }
}

console.log(`\nOK: ${ok}  SEM_PROVA: ${alertas}  reprovando: ${reprova}`);
if (alertas) console.log('SEM_PROVA é alerta de leitura: a faixa cabe e o conteúdo não se decide daqui.');
console.log(reprova ? 'FAIL' : 'PASS');
process.exit(reprova ? 1 : 0);
