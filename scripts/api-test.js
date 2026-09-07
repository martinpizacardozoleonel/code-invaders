const http = require('http');
const url = process.argv[2] || '/api/tournament';
http.get('http://localhost:3000' + url, (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => {
    console.log(d);
    process.exit(0);
  });
}).on('error', e => {
  console.log('ERR:', e.message);
  process.exit(1);
});
