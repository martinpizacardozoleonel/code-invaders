/* Test E2E: juega los 13 niveles con sus respuestas en navegador headless */
const puppeteer = require('puppeteer-core');

const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const URL = 'http://localhost:3000';

const ANSWERS = [
  'justify-content: flex-end;',
  'justify-content: center;',
  'justify-content: space-between;',
  'justify-content: space-around;',
  'align-items: flex-end;',
  'align-items: center;',
  'justify-content: center;\nalign-items: flex-end;',
  'flex-direction: column;',
  'flex-direction: column-reverse;',
  'flex-wrap: wrap;',
  'flex-wrap: wrap-reverse;',
  '#t2 {\n  align-self: flex-end;\n}',
  '#t1 {\n  order: 1;\n}'
];

(async () => {
  const browser = await puppeteer.launch({
    executablePath: EDGE,
    headless: 'new',
    args: ['--no-sandbox', '--window-size=1280,900']
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 800));

  let allOk = true;
  for (let i = 0; i < ANSWERS.length; i++) {
    const answer = ANSWERS[i];
    const wantsRule = /^#[^{]+\{/m.test(answer);
    const editorText = wantsRule ? answer : '#pond {\n  ' + answer + '\n}';

    await page.evaluate((t) => {
      document.getElementById('cssEditor').value = t;
      document.getElementById('cssEditor').dispatchEvent(new Event('input'));
    }, editorText);
    await new Promise(r => setTimeout(r, 400));

    const curLevel = await page.evaluate(() => document.getElementById('levelNum').textContent);
    await page.click('#nextBtn');
    await new Promise(r => setTimeout(r, 1800));

    const fb = await page.evaluate(() => {
      const el = document.getElementById('levelFeedback');
      return { text: el.textContent, cls: el.className };
    });
    const pass = fb.cls.includes('ok');
    if (!pass) {
      const dbg = await page.evaluate(() => {
        const pond = document.getElementById('pond');
        const pr = pond.getBoundingClientRect();
        const pts = [...document.querySelectorAll('.pad')].map(p => ({ l: p.style.left, t: p.style.top }));
        const tiles = {};
        document.querySelectorAll('.tile:not(.hidden)').forEach(t => {
          const r = t.getBoundingClientRect();
          tiles[t.id] = { x: Math.round((r.left - pr.left + r.width / 2) / pr.width * 100) + '%', y: Math.round((r.top - pr.top + r.height / 2) / pr.height * 100) + '%' };
        });
        const pondC = getComputedStyle(pond);
        return { pts, tiles, jc: pondC.justifyContent, ai: pondC.alignItems, fd: pondC.flexDirection, fw: pondC.flexWrap, aw: getComputedStyle(pond).alignContent };
      });
      console.log('  nivel actual:', curLevel, JSON.stringify(dbg));
    }
    allOk = allOk && pass;
    console.log(`Nivel ${i + 1} (${ANSWERS[i].split('\n')[0].slice(0, 30)}): ${pass ? 'PASÓ ✅' : 'FALLÓ ❌'} ${pass ? '' : '-> ' + fb.text} [${fb.cls}]`);
  }

  const completion = await page.evaluate(() => document.getElementById('completionStat').textContent);
  console.log('Completados: ' + completion);

  /* Respuesta incorrecta debe fallar en nivel 1 */
  await page.click('#levelProgress .level-dot');
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => {
    const ed = document.getElementById('cssEditor');
    ed.value = '#pond {\n  justify-content: center;\n}';
    ed.dispatchEvent(new Event('input'));
  });
  await new Promise(r => setTimeout(r, 400));
  await page.click('#nextBtn');
  await new Promise(r => setTimeout(r, 1800));
  const badFb = await page.evaluate(() => document.getElementById('levelFeedback').className);
  console.log('Respuesta incorrecta rechazada: ' + (badFb.includes('bad') ? 'OK ✅' : 'FALLO ❌'));

  /* Flujo auth desde la UI */
  await page.evaluate(() => Modal.open('register'));
  await page.type('#authUser', 'tester' + Date.now().toString().slice(-4));
  await page.type('#authPass', '1234');
  await page.click('#authSubmit');
  await new Promise(r => setTimeout(r, 1500));
  const logged = await page.evaluate(() => document.getElementById('userBox').textContent);
  console.log('Registro desde la UI: ' + (logged.includes('tester') ? 'OK ✅' : 'FALLO ❌ -> ' + logged));

  const badge = await page.evaluate(() => document.getElementById('bellBadge').textContent);
  console.log('Badge notificaciones tras login: ' + badge);

  if (errors.length) console.log('\nERRORES DE PÁGINA:\n' + [...new Set(errors)].join('\n'));
  console.log('\nRESULTADO GLOBAL: ' + (allOk ? 'TODOS PASAN ✅' : 'HAY FALLOS ❌'));
  await browser.close();
  process.exit(allOk ? 0 : 1);
})().catch(e => { console.error('FATAL:', e); process.exit(2); });