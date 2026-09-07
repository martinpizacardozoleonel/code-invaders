/* Smoke test completo: niveles 4, progresión y objetos del jefe */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'http://localhost:3000/dodge-game/index.html';
let page, browser;
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  browser = await puppeteer.launch({
    executablePath: EDGE, headless: 'new',
    args: ['--no-sandbox', '--window-size=1400,1000']
  });
  page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 20000 });
  await sleep(800);

  // Empezar juego y pasar la intro
  await page.keyboard.press('Enter');
  await sleep(600);
  await page.keyboard.press('Enter');
  await sleep(800);

  // Jugar ~20s esquivando y disparando
  for (let t = 0; t < 50; t++) {
    await page.keyboard.press('Space');
    await page.keyboard.down('ArrowLeft');
    await sleep(100);
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('ArrowRight');
    await sleep(100);
    await page.keyboard.up('ArrowRight');
    const lv = await page.evaluate(() => document.getElementById('level').textContent);
    if (lv !== '1') break;
  }
  const lv1 = await page.evaluate(() => document.getElementById('level').textContent);
  const mode1 = await page.evaluate(() => state.mode);
  console.log('DESPUÉS NIVEL 1 -> level:', lv1, '| mode:', mode1);

  // Cerrar overlay de nivel si se completó
  await page.evaluate(() => {
    document.getElementById('levelOverlay').classList.add('hidden');
    if (state.mode === 'INTRO') { state.mode = 'PLAYING'; state.level = 1; }
  });
  await sleep(300);

  // Saltar directo al nivel del JEFE (índice 3)
  const boss = await page.evaluate(() => {
    state.level = 3;
    beginLevel();
    return { bossPhase: state.bossPhase, bossHealth: state.bossHealth, ammo: state.ammo, mode: state.mode };
  });
  console.log('JEFE INICIADO ->', JSON.stringify(boss));

  // Simular recolección de objetos
  const testItems = await page.evaluate(() => {
    const results = {};
    spawnBossItem(); spawnBossItem(); spawnBossItem();
    results.spawned = state.items.length;
    // escudo
    state.items.push(new BossItem('shield'));
    collectBossItem(state.items[state.items.length - 1]);
    results.shield = state.shield;
    state.items = state.items.slice(0, state.items.length - 1);
    // balas
    state.items.push(new BossItem('bullets'));
    collectBossItem(state.items[state.items.length - 1]);
    results.ammo = state.ammo;
    state.items = state.items.slice(0, state.items.length - 1);
    return results;
  });
  console.log('OBJETOS:', JSON.stringify(testItems));

  // Pregunta sorpresa: abrir y responder la correcta
  await page.evaluate(() => openBossQuiz());
  await sleep(400);
  const quizOpen = await page.evaluate(() => !document.getElementById('quizOverlay').classList.contains('hidden'));
  const quizQ = await page.evaluate(() => document.getElementById('quizQuestion').textContent);
  const quizMode = await page.evaluate(() => state.mode);
  console.log('QUIZ abierta:', quizOpen, '| ¿pregunta?:', quizQ ? 'sí' : 'no', '| mode:', quizMode);

  // Responder la opción correcta
  const correctClicked = await page.evaluate(() => {
    const q = state.quizItem;
    const btns = document.querySelectorAll('#quizOptions .quiz-option');
    btns[q.a].click();
    return { pickedIndex: q.a, opts: btns.length };
  });
  console.log('RESPUESTA ->', JSON.stringify(correctClicked));
  await sleep(2500);
  const afterQuiz = await page.evaluate(() => ({
    ammo: state.ammo,
    mode: state.mode,
    quizClosed: document.getElementById('quizOverlay').classList.contains('hidden')
  }));
  console.log('TRAS QUIZ ->', JSON.stringify(afterQuiz));

  // Disparo con/sin balas
  const shootTest = await page.evaluate(() => {
    state.ammo = 2;
    state.lastShot = 0;
    handleShoot();
    return { shotsAfter1: state.shots.length, ammoAfter1: state.ammo };
  });
  console.log('DISPARO ->', JSON.stringify(shootTest));

  const ok = lv1 === '2' && boss.bossPhase && boss.bossHealth > 0 &&
    testItems.shield === 6 && testItems.ammo === 4 && quizOpen && quizMode === 'QUIZ' &&
    afterQuiz.ammo >= 12 && afterQuiz.mode === 'PLAYING' && shootTest.shotsAfter1 === 1 && shootTest.ammoAfter1 === 1;

  console.log(ok ? '\nSMOKE TEST OK ✅' : '\nPROBLEMAS DETECTADOS');
  if (errors.length) console.log('ERRORES:\n' + [...new Set(errors)].join('\n'));
  await browser.close();
  process.exit(ok && !errors.length ? 0 : 1);
})().catch(e => { console.error('FATAL:', e); if (browser) browser.close(); process.exit(2); });