const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const PROJECT = path.join(__dirname, '..');

// Kill any existing node processes
try { execSync('taskkill /F /IM node.exe 2>nul'); } catch(e) {}

// Wait a moment
const wait = (ms) => { const s = Date.now(); while(Date.now() - s < ms) {} };
wait(1500);

// Start server
const { spawn } = require('child_process');
const child = spawn('node', ['server.js'], {
  cwd: PROJECT,
  detached: true,
  stdio: 'ignore',
  windowsHide: true
});
child.unref();

// Wait for server to be ready and test
wait(3000);

const http = require('http');
http.get('http://localhost:3000/api/tournament', (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('DATA:', data.substring(0, 300));
    process.exit(0);
  });
}).on('error', (e) => {
  console.log('ERROR:', e.message);
  process.exit(1);
});
