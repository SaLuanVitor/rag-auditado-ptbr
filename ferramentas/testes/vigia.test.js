// Teste do vigia.
//
// Um vigia so vale se disparar, e o modo de ele falhar em silencio e o pior de
// todos: ele roda, imprime "nada mudou", e o acervo esta apodrecendo. Metade
// desta suite existe para a pergunta "ele DISPARA quando deveria?".
//
// A rede e injetada. Um vigia que so pode ser testado com rede nao e testado, e
// pior: a suite passaria a depender de o PyPI e o GitHub estarem no ar, entao um
// vermelho deixaria de significar defeito.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const FERR = path.resolve(__dirname, '..');
const TMP = path.join(os.tmpdir(), 'vigia-test-' + process.pid);
let falhas = 0;
fs.mkdirSync(TMP, { recursive: true });

function checa(nome, ok, extra) {
  console.log(`  ${ok ? 'ok  ' : 'FALHA'} ${nome}`);
  if (!ok) { falhas++; if (extra) console.log('        ' + String(extra).replace(/\n/g, '\n        ')); }
}

// O vigia resolve o clone por __dirname/../../RAG-from-First-Principles e chama
// `git` nele, entao o cenario monta um clone de verdade, pequeno, com um commit.
let n = 0;
function cenario({ aulas = {}, reqs = {}, ferramenta } = {}) {
  const raiz = path.join(TMP, 'c' + (++n));
  const curso = path.join(raiz, 'curso');
  const clone = path.join(raiz, 'RAG-from-First-Principles');
  fs.mkdirSync(path.join(curso, 'ferramentas'), { recursive: true });
  fs.mkdirSync(clone, { recursive: true });

  for (const [nome, txt] of Object.entries(aulas)) fs.writeFileSync(path.join(curso, nome), txt, 'utf8');
  for (const [rel, txt] of Object.entries(reqs)) {
    const p = path.join(clone, rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, txt, 'utf8');
  }
  const g = (...a) => execFileSync('git', ['-C', clone, ...a], { encoding: 'utf8' });
  g('init', '-q');
  g('config', 'user.email', 't@t');
  g('config', 'user.name', 't');
  g('config', 'commit.gpgsign', 'false');
  // sem isto o `git add` avisa sobre fim de linha em toda execucao da suite, e
  // ruido constante numa suite treina a ignorar a saida dela
  g('config', 'core.autocrlf', 'false');
  g('remote', 'add', 'origin', 'https://exemplo.invalido/x.git');
  g('add', '-A');
  g('commit', '-q', '-m', 'base');
  const head = g('rev-parse', 'HEAD').trim();

  const destino = path.join(curso, 'ferramentas', 'vigia.js');
  fs.writeFileSync(destino, fs.readFileSync(ferramenta || path.join(FERR, 'vigia.js'), 'utf8'));
  return { curso, clone, head, mod: require(destino) };
}

function rodar(mod, opts) {
  const saida = [];
  const r = mod.vigiar(Object.assign({ log: (s) => saida.push(String(s)) }, opts));
  return { r, saida: saida.join('\n') };
}

const AULA = '# AULA 99\n\nMedido no `llama-index-core` 0.12.15 do repositório.\n';
const REQ = { '09-Evaluation/requirements.txt': 'llama-index-core==0.12.15\nnumpy\n' };

// ---------- 1. a fonte parada nao dispara ----------
let c = cenario({ aulas: { 'AULA-99-x.md': AULA }, reqs: REQ });
let { r, saida } = rodar(c.mod, {
  pontaUpstream: () => c.head,
  versaoNoPypi: () => '0.12.15',
});
checa('fonte parada e pin corrente: ESTAVEL', r.estado === 'ESTAVEL', saida);
checa('e diz que a fonte não andou', /NAO andou/.test(saida), saida);

// ---------- 2. a fonte andou: DISPARA ----------
({ r, saida } = rodar(c.mod, {
  pontaUpstream: () => 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
  versaoNoPypi: () => '0.12.15',
}));
checa('fonte que andou dispara', r.estado === 'MUDOU' && /A FONTE ANDOU/.test(saida), saida);
checa('e diz que repinar é reauditar', /Repinar e reauditar/.test(saida), saida);

// ---------- 3. a biblioteca andou: DISPARA ----------
({ r, saida } = rodar(c.mod, {
  pontaUpstream: () => c.head,
  versaoNoPypi: () => '0.14.24',
}));
checa('pin que envelheceu dispara', r.estado === 'MUDOU' && /ANDOU/.test(saida), saida);
checa('e nomeia a aula que carrega a afirmação', /AULA-99-x\.md/.test(saida), saida);

// ---------- 4. o discriminante: PIN contra INSTRUMENTO ----------
// A versao que a aula cita NAO esta pinada: e o ambiente de quem mediu, e
// vigia-la contra o PyPI seria vigiar a coisa errada. Foi essa confusao que
// produziu um -1 nesta auditoria.
c = cenario({
  aulas: { 'AULA-98-y.md': '# A\n\nMedido no `pydantic` 2.13.4 do ambiente de medição.\n' },
  reqs: { 'r/requirements.txt': 'pydantic==2.10.6\n' },
});
({ r, saida } = rodar(c.mod, {
  pontaUpstream: () => c.head,
  versaoNoPypi: () => { throw new Error('nao devia consultar o PyPI para instrumento'); },
}));
checa('LIMITE: versão não pinada é INSTRUMENTO e não vai ao PyPI',
  r.estado === 'ESTAVEL' && /INSTRUMENTO/.test(saida), saida);
checa('e mostra ao lado o que o clone pina', /pydantic 2\.13\.4\s+\(o clone pina 2\.10\.6\)/.test(saida), saida);

// ---------- 5. LIMITE: o que não é pacote não entra ----------
// `self-rag.png (177.550` casava a primeira versao da busca. Nome com extensao
// de arquivo nao e pacote, e nenhum requirements o traz.
c = cenario({
  aulas: { 'AULA-97-z.md': '# A\n\nO arquivo `self-rag.png` 177.550 bytes, e `graph.png` 24.638.\n' },
  reqs: REQ,
});
({ r, saida } = rodar(c.mod, { pontaUpstream: () => c.head, versaoNoPypi: () => '0.12.15' }));
checa('LIMITE: nome que não é pacote de nenhum requirements é descartado',
  !/self-rag/.test(saida) && /descartada/.test(saida), saida);

// ---------- 6. offline não inventa tranquilidade ----------
c = cenario({ aulas: { 'AULA-99-x.md': AULA }, reqs: REQ });
({ r, saida } = rodar(c.mod, { offline: true }));
checa('offline devolve OFFLINE, nunca ESTAVEL', r.estado === 'OFFLINE', saida);
checa('e diz que ausência de alarme não é ausência de mudança',
  /Ausencia de alarme aqui nao e ausencia de mudanca/.test(saida), saida);

// ---------- 7. LIMITE: rede muda não é rede parada ----------
// PyPI fora do ar devolvendo null nao pode virar "nao andou".
({ r, saida } = rodar(c.mod, { pontaUpstream: () => null, versaoNoPypi: () => null }));
checa('LIMITE: upstream sem resposta não vira "não mudou"',
  /NAO RESPONDEU/.test(saida) && /Sem resposta nao e sinal/.test(saida), saida);
checa('e PyPI sem resposta também não', /PyPI nao respondeu/.test(saida), saida);
checa('e nada disso conta como mudança', r.estado === 'ESTAVEL', saida);

// ---------- positivo plantado ----------
// Cegar a comparacao da fonte: o vigia passa a dizer que nada mudou com a fonte
// andando, que e exatamente o modo de falhar que ele existe para nao ter.
if (process.argv.includes('--provar')) {
  console.log('\n-- positivo plantado: cegando a comparação da ponta --');
  const fonte = fs.readFileSync(path.join(FERR, 'vigia.js'), 'utf8');
  const alvo = '} else if (ponta === pinado) {';
  if (!fonte.includes(alvo)) {
    checa('achei a comparação da ponta para cegar', false, 'o alvo da mutação não existe mais');
  } else {
    const cego = path.join(TMP, 'vigia-cego.js');
    fs.writeFileSync(cego, fonte.replace(alvo, '} else if (true) {'));
    const cc = cenario({ aulas: { 'AULA-99-x.md': AULA }, reqs: REQ, ferramenta: cego });
    const out = rodar(cc.mod, {
      pontaUpstream: () => 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
      versaoNoPypi: () => '0.12.15',
    });
    checa('cego, ele diz que a fonte não andou com a fonte andando',
      out.r.estado === 'ESTAVEL' && !/A FONTE ANDOU/.test(out.saida), out.saida);
  }
}

console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os casos passaram.');
try { fs.rmSync(TMP, { recursive: true, force: true }); } catch (e) { /* o .git do cenario as vezes prende no Windows */ }
process.exit(falhas ? 1 : 0);
