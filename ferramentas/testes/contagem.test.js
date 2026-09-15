// Teste do detector de numeral que promete uma contagem e lista que entrega outra.
//
// A primeira versao da ferramenta devolveu 534 alertas no acervo e era inutil,
// entao metade destes casos existe para fixar o que ela NAO pode acusar. Um
// alerta que ninguem le nao e alerta.
//
// O caso 6 e o que quase a reprovou de novo: o desconto de coluna estava
// calculado e nao estava sendo usado, e "Os quatro, lado a lado" sobre uma
// tabela de comparacao de quatro colunas disparava. O bug so apareceu depois de
// a ferramenta ja ter sido usada para achar um defeito real.
//
// `--provar` cega a comparacao central e exige que a suite perceba.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'contagem-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

function roda(texto, ferramenta) {
  const arq = path.join(TMP, 'n-' + Math.random().toString(36).slice(2) + '.md');
  fs.writeFileSync(arq, texto, 'utf8');
  const r = spawnSync('node', [ferramenta || path.join(FERR, 'contagem.js'), arq], { encoding: 'utf8' });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}

// ---------- 1. o caso real, o defeito que a ferramenta achou na AULA-27 ----------
const REAL = '## Duas anotações finais\n\n- a primeira\n- a segunda\n- a terceira\n';
let r = roda(REAL);
checa('acha o cabeçalho que promete 2 sobre lista de 3',
  r.code === 1 && /"Duas" promete 2, lista de 3/.test(r.saida), r.saida);

// ---------- 2. frase que fecha em dois-pontos tambem conta ----------
r = roda('São três coisas a conferir:\n\n- a\n- b\n- c\n- d\n');
checa('acha a frase em dois-pontos que promete 3 sobre lista de 4',
  r.code === 1 && /promete 3, lista de 4/.test(r.saida), r.saida);

// ---------- 3. contagem certa nao dispara ----------
r = roda('## Três coisas\n\n- a\n- b\n- c\n');
checa('não acusa quando o numeral bate', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- 4. segundo numeral da linha resolve ----------
// "Tres coisas, e as duas primeiras..." tem dois numerais e um deles bate.
r = roda('## Cinco pontos, e os três primeiros decidem\n\n- a\n- b\n- c\n');
checa('não acusa quando QUALQUER numeral da linha bate', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- 5. LIMITE DECLARADO: numeral em prosa nao anuncia lista ----------
// Foi a ausencia deste filtro que deu os 534 alertas. O numeral aqui fala de
// dois arquivos, nao da lista abaixo, e a ferramenta nao tem como saber: o que
// a salva e exigir cabecalho ou dois-pontos.
r = roda('Rodando diff entre os dois arquivos, o que muda é isto.\n\n- a\n- b\n- c\n');
checa('LIMITE: não olha numeral de prosa comum', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- 6. tabela de comparacao: o numeral nomeia as COLUNAS ----------
// Maior gerador de falso positivo do acervo, e o desconto existia no codigo sem
// estar ligado: `colunas` era calculado e nunca comparado.
r = roda('## Os quatro, lado a lado\n\n|   | a | b | c | d |\n| - | - | - | - | - |\n| x | 1 | 2 | 3 | 4 |\n| y | 1 | 2 | 3 | 4 |\n');
checa('não acusa tabela cujo numeral nomeia as colunas', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- 7. tabela com linhas divergentes ainda dispara ----------
r = roda('## Duas estratégias\n\n| Nome | O que faz |\n| - | - |\n| a | 1 |\n| b | 2 |\n| c | 3 |\n');
checa('ainda acusa tabela de 3 linhas prometida como 2',
  r.code === 1 && /promete 2, tabela de 3/.test(r.saida), r.saida);

// ---------- 8. bloco de codigo nao e lista ----------
r = roda('## Três passos:\n\n```\n- a\n- b\n```\n');
checa('não conta marcador dentro de fence', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- 9. LIMITE DECLARADO: o valor 1 esta fora ----------
// "com uma excecao declarada", que eram duas, e caso real desta auditoria e NAO
// e pego. Incluir o 1 dobrava o ruido ("um `.env.example`", "em uma frase").
r = roda('## Com uma exceção declarada\n\n- a\n- b\n');
checa('LIMITE: não olha o numeral 1', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- 10. janela de 3 linhas ----------
r = roda('## Duas coisas\n\ntexto\n\nmais texto\n\noutro\n\n- a\n- b\n- c\n');
checa('não alcança lista fora da janela', r.code === 0 && /Nenhuma divergencia/.test(r.saida), r.saida);

// ---------- ordinal ABSOLVE, e e o caso real da AULA-25 ----------
// "Cinco deles tem correspondencia... O sexto nao tem fase propria:" sobre uma
// tabela de SEIS. A conta fecha, 5 + 1, e o script acusava porque via o cardinal
// e nao via o ordinal que o completa.
r = roda('Cinco deles têm correspondência, e o sexto não tem fase própria:\n\n'
  + '| A | B |\n| --- | --- |\n| 1 | x |\n| 2 | x |\n| 3 | x |\n| 4 | x |\n| 5 | x |\n| 6 | x |\n');
checa('ordinal que fecha a conta absolve o cardinal menor', r.code === 0, r.saida);

// ---------- e a absolvicao NAO pode virar acusacao ----------
// Se o ordinal acusasse, "o terceiro argumento" antes de uma lista de cinco
// abriria alerta novo, que e o oposto do que o conserto quer. Ordinal sozinho,
// sem cardinal na linha, nunca abre nada.
r = roda('O terceiro argumento é o que decide:\n\n- a\n- b\n- c\n- d\n- e\n');
checa('LIMITE: ordinal sozinho não acusa, só absolve', r.code === 0, r.saida);

// ---------- e o cardinal errado continua reprovando com ordinal na linha ----------
// A absolvicao e por IGUALDADE com a contagem: um ordinal que nao bate nao
// inocenta nada, senao bastaria escrever "o segundo" para calar a ferramenta.
r = roda('São três coisas, e a segunda é a mais cara:\n\n- a\n- b\n- c\n- d\n- e\n');
checa('ordinal que NÃO bate com a contagem não absolve', r.code === 1, r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a comparação numeral × contagem --');
  const fonte = fs.readFileSync(path.join(FERR, 'contagem.js'), 'utf8');
  const alvo = 'if (achados.some((a) => a.v === bloco.n)) return;';
  const cego = path.join(TMP, 'contagem-cega.js');
  if (!fonte.includes(alvo)) {
    checa('achei a comparação para cegar', false, 'o alvo da mutação não existe mais');
  } else {
    fs.writeFileSync(cego, fonte.replace(alvo, 'return;'));
    const c = roda(REAL, cego);
    checa('cega, ela deixa de achar o cabeçalho que mente',
      c.code === 0 && /Nenhuma divergencia/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
