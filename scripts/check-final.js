const http = require('http');
http.get('http://localhost:3000/', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const checks = {
      'NO dodgeModeBtn': !d.includes('dodgeModeBtn'),
      'NO view-dodge': !d.includes('view-dodge'),
      'NO dodgeCanvas': !d.includes('dodgeCanvas'),
      'NO dodge.js': !d.includes('dodge.js'),
      'settingsNavBtn': d.includes('settingsNavBtn'),
      'settingsOverlay': d.includes('settingsOverlay'),
      'quizOverlay': d.includes('quizOverlay'),
      'settingsGuestNote': d.includes('settingsGuestNote'),
      'settingsLoginBtn': d.includes('settingsLoginBtn'),
      'settingsLogoutBtn': d.includes('settingsLogoutBtn'),
      'game.js v14': d.includes('game.js?v=14'),
      'profile.js v2': d.includes('profile.js?v=2'),
    };
    let ok = true;
    for (const [k, v] of Object.entries(checks)) {
      if (!v) ok = false;
      console.log(`${k}: ${v ? 'OK' : 'FALTA!'}`);
    }
    console.log(ok ? '\nTODO OK' : '\nPROBLEMAS');
    process.exit(0);
  });
}).on('error', e => { console.log('ERR:', e.code); process.exit(1); });
