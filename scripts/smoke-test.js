const puppeteer = require('puppeteer-core');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  /* Respuesta incorrecta en nivel 1 (sesión limpia) */
  await page.evaluate(() => {
    const ed = document.getElementById('cssEditor');
    ed.value = '#pond {\n  justify-content: center;\n}';
    ed.dispatchEvent(new Event('input'));
  });
  await new Promise(r => setTimeout(r, 600));
  await page.click('#nextBtn');
  await new Promise(r => setTimeout(r, 1600));
  const wrong = await page.evaluate(() => document.getElementById('levelFeedback').className.includes('bad'));
  console.log('1) Respuesta incorrecta rechazada:', wrong ? 'OK ✅' : 'FALLO ❌');

  /* Documentación: demos con chips */
  await page.click('[data-view="docs"]');
  await new Promise(r => setTimeout(r, 600));
  const docs = await page.evaluate(() => {
    const cards = document.querySelectorAll('.doc-card').length;
    const chips = document.querySelectorAll('.demo-actions .chip').length;
    const cheat = document.querySelectorAll('#cheatBody tr').length;
    const demo = document.getElementById('docsGrid').querySelector('[data-box="2"]');
    document.querySelector('[data-demo="2"] .chip:nth-child(3)').click();
    const jc = getComputedStyle(demo).justifyContent;
    return { cards, chips, cheat, jc };
  });
  console.log('2) Docs:', docs.cards === 8 && docs.chips >= 30 && docs.cheat === 9 && docs.jc === 'flex-end' ? 'OK ✅' : 'FALLO ❌ ' + JSON.stringify(docs));

  /* QR: genera imagen desde API qrserver */
  await page.click('[data-view="qr"]');
  await new Promise(r => setTimeout(r, 2500));
  const qr = await page.evaluate(() => !!document.querySelector('#qrResult img'));
  console.log('3) QR generado (API qrserver):', qr ? 'OK ✅' : 'FALLO ❌');

  /* Mapas: Leaflet init + búsqueda Nominatim */
  await page.click('[data-view="maps"]');
  await new Promise(r => setTimeout(r, 1200));
  const mapInit = await page.evaluate(() => !!document.querySelector('#map .leaflet-tile-pane') || !!document.querySelector('#map .leaflet-container'));
  console.log('4) Leaflet inicializado:', mapInit ? 'OK ✅' : 'FALLO ❌');
  await page.type('#mapSearch', 'Buenos Aires');
  await page.click('#mapSearchBtn');
  await new Promise(r => setTimeout(r, 3500));
  const geo = await page.evaluate(() => document.getElementById('mapStatus').textContent);
  console.log('5) Búsqueda Nominatim:', geo.includes('Encontrado') ? 'OK ✅ (' + geo.slice(0, 60) + ')' : 'FALLO ❌ ' + geo);

  /* Notificaciones: volver al juego, completar nivel 1 y revisar campana */
  await page.click('[data-view="game"]');
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const ed = document.getElementById('cssEditor');
    ed.value = '#pond {\n  justify-content: flex-end;\n}';
    ed.dispatchEvent(new Event('input'));
  });
  await new Promise(r => setTimeout(r, 500));
  await page.click('#nextBtn');
  await new Promise(r => setTimeout(r, 2000));
  await page.click('#bellBtn');
  await new Promise(r => setTimeout(r, 400));
  const notif = await page.evaluate(() => document.querySelectorAll('.notif-item').length);
  console.log('6) Centro de notificaciones:', notif > 0 ? `OK ✅ (${notif} ítems)` : 'FALLO ❌');
  await page.click('#bellBtn');

  /* Login desde UI + guardado de progreso en BD */
  await page.evaluate(() => Modal.open('register'));
  const user = 'rana' + Date.now().toString().slice(-5);
  await page.type('#authUser', user);
  await page.type('#authPass', '1234');
  await page.click('#authSubmit');
  await new Promise(r => setTimeout(r, 1800));
  const logged = await page.evaluate((u) => document.getElementById('userBox').textContent.includes(u), user);
  console.log('7) Registro/login:', logged ? 'OK ✅' : 'FALLO ❌');

  /* Resolver nivel 2 y verificar progreso persistido en BD */
  await page.evaluate(() => {
    const ed = document.getElementById('cssEditor');
    ed.value = '#pond {\n  justify-content: center;\n}';
    ed.dispatchEvent(new Event('input'));
  });
  await new Promise(r => setTimeout(r, 500));
  await page.click('#nextBtn');
  await new Promise(r => setTimeout(r, 2000));
  const leader = await page.evaluate((u) => API.leaderboard().then(lb =>
    lb.board.some(b => b.username === u && b.solved >= 1)), user);
  console.log('8) Progreso guardado en BD (ranking):', leader ? 'OK ✅' : 'FALLO ❌');

  console.log('Errores JS:', errors.length ? errors.join(' | ') : 'ninguno ✅');
  await browser.close();
})().catch(e => { console.error('FATAL:', e); process.exit(1); });