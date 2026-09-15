// Teste do verificador do DoD.
//
// ESTA SUITE E DE INTEGRACAO, e a escolha vai declarada porque contraria o
// padrao das outras doze. Todas as outras montam um acervo de mentira; esta roda
// contra o repositorio real, porque o que ela verifica e a COMPOSICAO de nove
// ferramentas, e simular as nove testaria o simulador.
//
// O custo: se o acervo reprovar uma condicao, esta suite fica vermelha por um
// motivo que nao e defeito dela. Isso e aceitavel e ate desejavel, porque a
// unica leitura correta de um DoD vermelho e parar.
//
// O QUE ELA PROTEGE, e e uma propriedade de desenho e nao um numero:
//
//   A decima condicao NAO E DECIDIVEL POR MAQUINA, e o script nunca pode
//   conta-la como cumprida. Foi exatamente isso que eu fiz em 15/09, a mao: dei
//   por cumprida a condicao que nomeia dois arquivos tendo aberto um. Um script
//   que imprimisse "10/10" institucionalizaria o meu erro.
//
// Por isso o positivo plantado transforma a condicao humana em decidida, e a
// suite tem de perceber.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const RAIZ = path.resolve(FERR, '..');
const TMP = path.join(os.tmpdir(), 'dod-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

function roda(script, args) {
  const r = spawnSync('node', [script, ...args], { encoding: 'utf8', cwd: RAIZ });
  return { saida: (r.stdout || '') + (r.stderr || ''), code: r.status };
}

// `--rapido` pula a suite completa, que rodaria as treze de dentro desta.
let r = roda(path.join(FERR, 'dod.js'), ['--rapido']);

checa('lista as dez condições, uma por linha',
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every((n) => new RegExp(`\\s${n}\\. `).test(r.saida)), r.saida);

checa('marca a décima como NÃO decidível por máquina',
  /\[ \?\? \]\s+10\./.test(r.saida) && /NAO DECIDIVEL POR MAQUINA/.test(r.saida), r.saida);

// A propriedade central. Um "10/10" aqui seria o meu erro virado codigo.
checa('NUNCA declara as dez cumpridas',
  !/10\/10/.test(r.saida) && !/dez condições (estão )?cumpridas/i.test(r.saida)
  && /pendente de leitura/.test(r.saida), r.saida);

checa('--rapido pula a suíte e diz que pulou',
  /nao rodei a suite/.test(r.saida) && /\[ -- \]\s+9\./.test(r.saida), r.saida);

checa('e o veredito final repete que nove verdes não são dez',
  /Nove verdes NAO sao dez/.test(r.saida), r.saida);

// Estado real do acervo hoje: se isto ficar vermelho, o DoD esta reprovando e a
// leitura correta e parar, nao consertar o teste.
checa('as condições decidíveis passam no acervo atual',
  r.code === 0 && !/FALHA/.test(r.saida), r.saida);

// ---------- LIMITE: ele nao inventa veredito para a decima ----------
checa('LIMITE: a décima não recebe ok nem FALHA',
  !/\[ ok \]\s+10\./.test(r.saida) && !/\[FALHA\]\s+10\./.test(r.saida), r.saida);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: fazendo a condição humana contar como decidida --');
  const fonte = fs.readFileSync(path.join(FERR, 'dod.js'), 'utf8');
  const alvo = 'const HUMANA = {';
  if (!fonte.includes(alvo)) {
    checa('achei a condição humana para mover', false, 'o alvo da mutação não existe mais');
  } else {
    const cego = path.join(TMP, 'dod-cego.js');
    fs.writeFileSync(cego, fonte.replace(
      "CONDICOES = [",
      "CONDICOES = [\n  { n: 10, texto: 'HANDOFF e PROMPT-CONTINUAR descrevem o estado medido', decide: () => ({ ok: true, nota: 'dado por cumprido' }) },"));
    const c = roda(cego, ['--rapido']);
    checa('cego, ele dá a décima por cumprida sem ninguém ler',
      /\[ ok \]\s+10\./.test(c.saida) && /dado por cumprido/.test(c.saida), c.saida);
  }
}

fs.rmSync(TMP, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
