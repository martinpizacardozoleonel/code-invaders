const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

const server = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  detached: true,
  stdio: 'ignore'
});
server.unref();

console.log('Server starting, PID:', server.pid);

let attempts = 0;
function check() {
  attempts++;
  http.get('http://localhost:3000/', (res) => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
      console.log('Server UP, STATUS:', res.statusCode);
      process.exit(0);
    });
  }).on('error', () => {
    if (attempts > 20) { console.log('TIMEOUT'); process.exit(1); }
    setTimeout(check, 500);
  });
}
setTimeout(check, 1500);
