const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: 'new', args: ['--window-size=1400,1000'] });
  const p = await b.newPage();
  await p.setViewport({ width: 1400, height: 1000 });
  await p.goto('http://localhost:3000/dodge-game/index.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await p.screenshot({ path: 'C:/Users/ADMINI~1/AppData/Local/Temp/opencode/screenshot-menu.png', fullPage: false });

  // Click Ajustes
  const hasAjustes = await p.evaluate(() => {
    const el = document.getElementById('settingsMenuBtn');
    if (el) { el.click(); return true; }
    return false;
  });
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({ path: 'C:/Users/ADMINI~1/AppData/Local/Temp/opencode/screenshot-ajustes.png', fullPage: false });

  // Click Guía
  await p.evaluate(() => { document.getElementById('settingsOverlay').classList.add('hidden'); });
  await p.evaluate(() => {
    const el = document.querySelector('a[href="#guia"]');
    if (el) el.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await p.screenshot({ path: 'C:/Users/ADMINI~1/AppData/Local/Temp/opencode/screenshot-guia.png', fullPage: false });

  console.log('Ajustes link found:', hasAjustes);
  console.log('Screenshots guardados en temp/opencode/');
  await b.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });