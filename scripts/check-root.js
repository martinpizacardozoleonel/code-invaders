const http = require('http');
http.get('http://localhost:3000/', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const checks = {
      'dodgeModeBtn': d.includes('dodgeModeBtn'),
      'settingsNavBtn': d.includes('settingsNavBtn'),
      'view-dodge': d.includes('view-dodge'),
      'dodgeCanvas': d.includes('dodgeCanvas'),
      'dodge.js script': d.includes('dodge.js'),
      'profile.js script': d.includes('profile.js'),
      'settingsOverlay': d.includes('settingsOverlay'),
      'quizOverlay': d.includes('quizOverlay'),
    };
    let ok = true;
    for (const [k, v] of Object.entries(checks)) {
      if (!v) ok = false;
      console.log(`${k}: ${v ? 'OK' : 'FALTA!'}`);
    }
    console.log(ok ? '\nTODO OK' : '\nFALTAN ELEMENTOS');
    process.exit(0);
  });
}).on('error', e => { console.log('ERR:', e.code); process.exit(1); });
