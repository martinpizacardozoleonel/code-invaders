/* Smoke test 2: jugador activo — completa el nivel 1 y pasa al 2 */
const puppeteer = require('puppeteer-core');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'http://localhost:3000/dodge-game/index.html';

function pressFor(durationMs, key) {
  return new Promise(resolve => {
    page.keyboard.down(key).then(resolve);
  });
}

let page, browser;
(async () => {
  browser = await puppeteer.launch({
    executablePath: EDGE, headless: 'new',
    args: ['--no-sandbox', '--window-size=1000,700']
  });
  page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  /* Iniciar juego: ENTER (menú) → ENTER (intro) */
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));
  await page.keyboard.press('Enter');
  await new Promise(r => setTimeout(r, 600));

  /* Disparar continuamente durante 6s para destruir códigos y completar el nivel */
  await page.keyboard.down('Space');
  for (let i = 0; i < 30; i++) {
    await page.keyboard.down('ArrowLeft');
    await new Promise(r => setTimeout(r, 180));
    await page.keyboard.up('ArrowLeft');
    await page.keyboard.down('ArrowRight');
    await new Promise(r => setTimeout(r, 180));
    await page.keyboard.up('ArrowRight');
  }
  await page.keyboard.up('Space');
  await new Promise(r => setTimeout(r, 2200));

  const result = await page.evaluate(() => {
    return {
      level: document.getElementById('level').textContent,
      levelTotal: document.getElementById('levelTotal').textContent,
      levelProgress: document.getElementById('levelProgress').value,
      score: document.getElementById('score').textContent,
      dodged: document.getElementById('dodged').textContent,
      destroyed: document.getElementById('destroyed').textContent,
      levelOverlayHidden: document.getElementById('levelOverlay').classList.contains('hidden')
    };
  });

  console.log('Resultado tras jugar activamente:');
  console.log(JSON.stringify(result, null, 2));

  const ok = result.level === '2' || result.levelProgress === '100';
  console.log(ok ? '\nNIVEL 1 COMPLETADO ✅' : '\nNo se completó el nivel 1');

  if (errors.length) console.log('\nERRORES:\n' + [...new Set(errors)].join('\n'));
  await browser.close();
  process.exit(ok && !errors.length ? 0 : 1);
})().catch(e => { console.error('FATAL:', e); if (browser) browser.close(); process.exit(2); });
