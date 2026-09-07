require('http').get('http://localhost:3000/', r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => { console.log('STATUS:', r.statusCode); process.exit(0); });
}).on('error', e => { console.log('ERR:', e.code); process.exit(1); });
