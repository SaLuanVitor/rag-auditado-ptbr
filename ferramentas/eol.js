// Acha e normaliza arquivo com os dois fins de linha no mesmo conteudo.
//
// Nasceu de um custo medido em 14/09/2026. O GATE tinha 2786 quebras CRLF e 545
// LF, porque as secoes de cada rodada entravam por heredoc do bash enquanto o
// resto do arquivo vinha do checkout com `core.autocrlf=true`. O `lock.js` ve o
// CRLF dominante, converte a ancora para CRLF, e ela nao casa no trecho em LF.
// A trava aborta, que e o certo, mas o relatorio dizia `casou 0x`, que manda
// procurar erro de digitacao num texto correto ate o ultimo caractere.
//
// O `lock.js` hoje nomeia a causa. Este script e o conserto, e existe separado
// porque reescrever o fim de linha de um arquivo inteiro e efeito grande demais
// para uma trava de edicao tomar por conta.
//
// O alvo e o fim de linha DOMINANTE, nao o CRLF por decreto: um `.sh` que seja
// todo LF esta certo e nao aparece aqui, porque so entra arquivo MISTURADO.
//
// Uso: node ferramentas/eol.js <arquivo> [...] [--gravar]
const fs = require('fs');

const alvos = process.argv.slice(2).filter((a) => a !== '--gravar');
if (!alvos.length) { console.error('uso: node ferramentas/eol.js <arquivo> [...] [--gravar]'); process.exit(2); }

const achados = [];
for (const arq of alvos) {
  const t = fs.readFileSync(arq, 'utf8');
  const crlf = (t.match(/\r\n/g) || []).length;
  const lf = (t.match(/(^|[^\r])\n/g) || []).length;
  if (crlf && lf) achados.push({ arq, crlf, lf, t });
}

if (!achados.length) { console.log('Nenhum arquivo com fim de linha misturado.'); process.exit(0); }

for (const a of achados) console.log(`${a.arq}  ${a.crlf} CRLF, ${a.lf} LF`);

// Grava so com --gravar, e o padrao e ensaio, pela mesma razao do requebra.js:
// ferramenta que reescreve arquivo inteiro por padrao ja reescreveu uma aula no
// meio de uma auditoria neste projeto.
if (!process.argv.includes('--gravar')) {
  console.log(`\n${achados.length} arquivo(s) MISTURADO(S). Nada foi escrito: repita com --gravar.`);
  process.exit(1);
}

for (const a of achados) {
  const dominante = a.crlf >= a.lf ? '\r\n' : '\n';
  const novo = a.t.replace(/\r?\n/g, dominante);
  // A prova: so o fim de linha pode ter mudado.
  if (novo.replace(/\r\n/g, '\n') !== a.t.replace(/\r\n/g, '\n')) {
    console.error(`${a.arq}: ABORTADO, a normalizacao mudaria o conteudo.`);
    process.exit(1);
  }
  fs.writeFileSync(a.arq, novo);
  console.log(`${a.arq}: normalizado para ${dominante === '\r\n' ? 'CRLF' : 'LF'}.`);
}
process.exit(0);
