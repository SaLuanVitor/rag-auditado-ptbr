// Teste do requebrador de linhas.
//
// A propriedade que importa nao e "as linhas ficaram curtas": e que requebrar
// NAO altere o texto. Requebrar foi, nesta auditoria, a operacao mais perigosa
// da rodada, porque o diff parece cosmetico e a cauda que cola nasce ali: dez
// ocorrencias em 14/09/2026, uma delas transformando uma frase correta numa
// tautologia. Por isso a ferramenta asserta que a sequencia de palavras e
// identica antes de gravar, e e essa guarda que este teste prova.
//
// A segunda propriedade: ela so toca prosa. Tabela, bloco de codigo, citacao e
// item de lista ficam como estao, porque requebrar um bloco de lista funde
// itens vizinhos numa linha so.
//
// `--provar` planta um defeito que apaga uma palavra e exige que a ferramenta
// ABORTE em vez de gravar.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'requebra-test-' + process.pid);
let falhas = 0;

fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

// Grava `texto` num arquivo temporario e roda a ferramenta sobre ele.
// A ferramenta so grava com --gravar, entao a suite o passa por padrao. O caso
// 10 e o que confere que SEM ele nada e escrito.
function roda(texto, ferramenta, extra = ['--gravar']) {
  const arq = path.join(TMP, 'caso-' + Math.random().toString(36).slice(2) + '.md');
  fs.writeFileSync(arq, texto, 'utf8');
  const r = spawnSync('node', [ferramenta || path.join(FERR, 'requebra.js'), arq, ...extra],
                      { encoding: 'utf8' });
  return { arq, saida: (r.stdout || '') + (r.stderr || ''), code: r.status,
           depois: fs.readFileSync(arq, 'utf8') };
}

const palavras = (s) => s.replace(/^>\s?/gm, '').split(/\s+/).filter(Boolean).join('\u0001');
const maiorLinha = (s) => Math.max(...s.split(/\r?\n/).map((l) => l.length));

// Uma palavra de 12 caracteres repetida da controle exato sobre o comprimento.
const P = 'palavralonga';
const LONGA = Array(14).fill(P).join(' '); // 14*13-1 = 181 caracteres

// ---------- 1. prosa longa e requebrada, e o texto nao muda ----------
let r = roda(`abertura curta\n\n${LONGA}\n\nfecho curto\n`);
// "requebrado" e nao so "paragrafo": a mensagem do ensaio tambem diz
// "1 paragrafo(s) A REQUEBRAR", e a assercao frouxa passava nos dois estados.
checa('requebra o paragrafo de prosa', r.code === 0 && /paragrafo\(s\) requebrado/.test(r.saida), r.saida);
checa('nenhuma linha passa de 100 colunas', maiorLinha(r.depois) <= 100, maiorLinha(r.depois));
checa('a sequencia de palavras sobrevive', palavras(r.depois) === palavras(`abertura curta\n\n${LONGA}\n\nfecho curto\n`));

// ---------- 2. bloco de codigo nao se toca ----------
r = roda(`abertura\n\n\`\`\`python\n${LONGA}\n\`\`\`\n`);
checa('nao requebra dentro de fence', r.code === 0 && r.depois.includes(LONGA), r.saida);

// ---------- 3. tabela nao se toca ----------
r = roda(`abertura\n\n| col | ${LONGA} |\n| --- | --- |\n`);
checa('nao requebra linha de tabela', r.code === 0 && r.depois.includes(LONGA), r.saida);

// ---------- 4. citacao nao se toca ----------
r = roda(`abertura\n\n> ${LONGA}\n`);
checa('nao requebra bloco de citacao', r.code === 0 && r.depois.includes(LONGA), r.saida);

// ---------- 5. item de lista nao se toca, senao funde itens ----------
r = roda(`abertura\n\n1. ${LONGA}\n2. segundo item\n`);
checa('nao funde itens de lista numerada', r.code === 0 && /2\. segundo item/.test(r.depois) && r.depois.includes(LONGA), r.depois);

// ---------- 6. arquivo ja curto nao e reescrito ----------
const curto = 'uma linha curta\n\noutra linha curta\n';
r = roda(curto);
checa('nao mexe em arquivo que ja cabe', r.depois === curto && /Nada a requebrar/.test(r.saida), r.saida);

// ---------- 7. CRLF sobrevive ----------
r = roda(`abertura\r\n\r\n${LONGA}\r\n`);
checa('preserva CRLF', r.code === 0 && r.depois.includes('\r\n') && !/[^\r]\n/.test(r.depois), JSON.stringify(r.depois.slice(0, 60)));

// ---------- 8. quebra orfa: linha curta no meio de paragrafo largo ----------
// Assinatura de texto inserido sem requebrar em volta. O diff parece cosmetico
// igual ao da linha longa, e nenhuma linha passa de 108.
const CHEIA = Array(8).fill(P).join(' '); // 103 caracteres, acima de 90 e abaixo de 108
r = roda(`abertura\n\n${CHEIA}\n${CHEIA}\ncurta no meio\n${CHEIA}\nfecho do paragrafo\n`);
checa('requebra paragrafo com quebra orfa', r.code === 0 && /1 paragrafo/.test(r.saida), r.saida);
checa('a sequencia de palavras sobrevive a orfa',
      palavras(r.depois) === palavras(`abertura\n\n${CHEIA}\n${CHEIA}\ncurta no meio\n${CHEIA}\nfecho do paragrafo\n`));

// ---------- 9. controle: ultima linha curta NAO e orfa ----------
// Todo paragrafo termina numa linha curta. Sem esta excecao a ferramenta
// requebraria o acervo inteiro e o diff cosmetico esconderia os consertos reais.
r = roda(`abertura\n\n${CHEIA}\n${CHEIA}\nfecho\n`);
checa('nao trata a ultima linha curta como orfa', r.code === 0 && /Nada a requebrar/.test(r.saida), r.saida);

// ---------- 10. sem --gravar, nada e escrito ----------
// Medido em 14/09/2026: um auditor sob contrato de nao editar nada rodou a
// ferramenta para ver o que ela fazia, e ela reescreveu a aula em auditoria.
// Este caso e o que impede a regressao.
const ANTES = `abertura\n\n${LONGA}\n`;
r = roda(ANTES, null, []);
checa('sem --gravar o arquivo fica intacto', r.code === 0 && r.depois === ANTES, JSON.stringify(r.depois.slice(0, 60)));
checa('e o ensaio diz que nada foi escrito', /Nada foi escrito/.test(r.saida), r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: quebra que apaga uma palavra --');
  const fonte = fs.readFileSync(path.join(FERR, 'requebra.js'), 'utf8');
  const mutante = path.join(TMP, 'requebra-mutante.js');
  const comDefeito = fonte.replace('{ novas.push(linha); linha = p; }',
                                   '{ novas.push(linha); linha = \'\'; }');
  if (comDefeito === fonte) {
    checa('achei a linha de quebra para mutar', false, 'o alvo da mutacao nao existe mais');
  } else {
    fs.writeFileSync(mutante, comDefeito);
    const antes = `abertura\n\n${LONGA}\n`;
    const m = roda(antes, mutante);
    checa('a guarda aborta quando uma palavra some', m.code !== 0 && /ABORTADO/.test(m.saida), m.saida);
    checa('e o arquivo fica intacto', m.depois === antes, JSON.stringify(m.depois.slice(0, 80)));
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
