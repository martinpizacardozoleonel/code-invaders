const http = require('http');
http.get('http://localhost:3000/dodge-game/index.html', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const checks = {
      'settingsMenuBtn': d.includes('settingsMenuBtn'),
      'guiaOverlay': d.includes('guiaOverlay'),
      'profileJs': d.includes('profile.js'),
      'settingsOverlay': d.includes('settingsOverlay'),
      'quizOverlay': d.includes('quizOverlay'),
      'shieldHud': d.includes('shieldHud'),
      'ammoHud': d.includes('ammoHud'),
      'levelTotal=4': d.includes('levelTotal">4<'),
      'themeDarkBtn': d.includes('themeDarkBtn'),
      'themeLightBtn': d.includes('themeLightBtn'),
      'picInput': d.includes('picInput'),
      'changeNameInput': d.includes('changeNameInput'),
      'framesGrid': d.includes('framesGrid'),
      'settingsLoginBtn': d.includes('settingsLoginBtn'),
      'settingsLogoutBtn': d.includes('settingsLogoutBtn'),
      'profileHead': d.includes('profileHead'),
      'avatarFrame': d.includes('avatarFrame'),
      'profileLevel': d.includes('profileLevel'),
      'profileHours': d.includes('profileHours'),
      'profileCoins': d.includes('profileCoins'),
      'quizQuestion': d.includes('quizQuestion'),
      'quizOptions': d.includes('quizOptions'),
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
