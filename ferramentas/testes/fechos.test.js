// Teste do enumerador de superficies de fecho.
//
// Ele NAO julga: lista o que a leitura precisa percorrer depois de um conserto,
// e marca o que o diff ja alterou. As propriedades a proteger sao tres:
//   1. classificar cada superficie (Checkpoint, Titulo, Rodape, Tabela);
//   2. NAO listar o que o diff tocou, senao a lista vira o diff inteiro;
//   3. listar o que o diff nao tocou, que e o trabalho de leitura que sobra.
//
// E ele tem um limite CONHECIDO e testado aqui: prosa nao e superficie de
// fecho, entao contradicao em paragrafo passa batida. Foi assim que a leitura
// antiga do escalonador sobreviveu na AULA-26 em 14/09. O teste fixa esse
// limite para que ninguem confunda o silencio dele com ausencia de defeito.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const RAIZ = path.join(os.tmpdir(), 'fechos-test-' + process.pid);
let falhas = 0;

const git = (...a) => execFileSync('git', a, { cwd: RAIZ, encoding: 'utf8', stdio: 'pipe' });

function monta(commitado, trabalho) {
  fs.rmSync(RAIZ, { recursive: true, force: true });
  fs.mkdirSync(RAIZ, { recursive: true });
  git('init', '-q');
  git('config', 'user.email', 'teste@local');
  git('config', 'user.name', 'teste');
  for (const [n, c] of Object.entries(commitado)) fs.writeFileSync(path.join(RAIZ, n), c);
  git('add', '-A');
  git('commit', '-q', '-m', 'base');
  for (const [n, c] of Object.entries(trabalho)) fs.writeFileSync(path.join(RAIZ, n), c);
}

function roda(ferramenta, faixa) {
  const args = faixa ? [ferramenta, faixa] : [ferramenta];
  try {
    return execFileSync(process.execPath, args, { cwd: RAIZ, encoding: 'utf8', stdio: 'pipe' });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

function checa(nome, condicao, detalhe) {
  if (condicao) { console.log(`  ok    ${nome}`); return true; }
  console.log(`  FALHA ${nome}${detalhe ? '\n          -> ' + String(detalhe).trim().slice(0, 700) : ''}`);
  falhas++;
  return false;
}

const AULA = [
  'Corpo do texto que muda de sentido quando o conserto entra, e é prosa comum.',
  '',
  '**Uma armadilha com título longo o bastante.** Explicação da armadilha aqui.',
  '',
  '| Coluna A que é longa o suficiente | Coluna B com conteúdo também longo |',
  '| --- | --- |',
  '',
  '7. Uma pergunta de checkpoint com tamanho suficiente para entrar na conta?',
  '8. Outra pergunta de checkpoint, também com tamanho suficiente para contar?',
  '',
  '**Próxima:** [AULA 02 — alguma coisa](AULA-02-alguma-coisa.md)',
  '',
  'curta',
].join('\n') + '\n';

// ---------- 1. o diff toca so a prosa: as superficies de fecho ficam a conferir ----------
monta({ 'AULA-01-teste.md': AULA }, { 'AULA-01-teste.md': AULA.replace('e é prosa comum', 'e agora diz outra coisa') });
let s = roda(path.join(FERR, 'fechos.js'));
checa('classifica Checkpoint', /Checkpoint\s+:8/.test(s), s);
checa('classifica Titulo', /Titulo\s+:3/.test(s), s);
checa('classifica Tabela', /Tabela\s+:5/.test(s), s);
checa('classifica Rodape', /Rodape\s+:11/.test(s), s);
checa('não classifica o separador de tabela como Tabela', !/:6/.test(s), s);
checa('ignora linha com menos de 25 caracteres', !/:13/.test(s), s);
checa('conta duas perguntas de checkpoint a conferir', /Checkpoint 2\/2/.test(s), s);

// ---------- 2. o diff toca uma superficie: ela sai da lista ----------
monta({ 'AULA-01-teste.md': AULA },
       { 'AULA-01-teste.md': AULA.replace('7. Uma pergunta de checkpoint com tamanho suficiente para entrar na conta?',
                                          '7. Uma pergunta de checkpoint reescrita e com tamanho suficiente também?') });
s = roda(path.join(FERR, 'fechos.js'));
checa('não lista a superfície que o diff alterou', !/:8/.test(s), s);
// O arquivo tem DOIS checkpoints. Reescrever um nao cria um terceiro: ele sai
// de 'a conferir' e continua no total. A primeira versao deste teste pedia
// 2/3, contando a linha antiga, que nao existe mais no arquivo lido.
checa('contabiliza a alterada no denominador', /Checkpoint 1\/2/.test(s), s);

// ---------- 3. so olha arquivos AULA-*.md ----------
monta({ 'OUTRO.md': AULA }, { 'OUTRO.md': AULA.replace('prosa comum', 'prosa mudada') });
s = roda(path.join(FERR, 'fechos.js'));
checa('ignora arquivo que não é AULA-*.md', s.trim() === '', s);

// ---------- 4. aceita intervalo do git ----------
monta({ 'AULA-01-teste.md': AULA }, {});
fs.writeFileSync(path.join(RAIZ, 'AULA-01-teste.md'), AULA.replace('prosa comum', 'prosa mudada'));
git('add', '-A'); git('commit', '-q', '-m', 'segundo');
s = roda(path.join(FERR, 'fechos.js'), 'HEAD~1..HEAD');
checa('aceita intervalo do git como argumento', /Checkpoint/.test(s), s);

// ---------- 5. o LIMITE conhecido: prosa nao e superficie de fecho ----------
monta({ 'AULA-01-teste.md': AULA }, { 'AULA-01-teste.md': AULA.replace('**Uma armadilha com título longo o bastante.**', '**Uma armadilha com título novo e diferente.**') });
s = roda(path.join(FERR, 'fechos.js'));
checa('LIMITE DECLARADO: a prosa da linha 1 nunca é listada, mesmo contradizendo o conserto',
      !/:1\s/.test(s), s);

// ---------- positivo plantado ----------
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a marcação do que o diff tocou --');
  const fonte = fs.readFileSync(path.join(FERR, 'fechos.js'), 'utf8');
  const cego = path.join(os.tmpdir(), 'fechos-cego-' + process.pid + '.js');
  const semMarca = fonte.replace('if (mudou.has(l)) { c.mudadas++; return; }', '');
  if (semMarca === fonte) {
    console.log('  FALHA não achei a marcação para cegar');
    falhas++;
  } else {
    fs.writeFileSync(cego, semMarca);
    monta({ 'AULA-01-teste.md': AULA },
           { 'AULA-01-teste.md': AULA.replace('7. Uma pergunta de checkpoint com tamanho suficiente para entrar na conta?',
                                              '7. Uma pergunta de checkpoint reescrita e com tamanho suficiente também?') });
    const sc = roda(cego);
    checa('cego, ele lista de volta a superfície já alterada', /Checkpoint 2\/2/.test(sc) && /Checkpoint\s+:8/.test(sc), sc);
    fs.rmSync(cego, { force: true });
  }
}

fs.rmSync(RAIZ, { recursive: true, force: true });
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
process.exit(falhas ? 1 : 0);
