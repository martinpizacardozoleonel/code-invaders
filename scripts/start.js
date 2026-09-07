const { spawn } = require('child_process');
const s = spawn('node', ['server.js'], { cwd: 'D:\\gustavo proyectos\\Juego_tutorial', detached: true, stdio: 'ignore' });
s.unref();
console.log('Server starting, PID:', s.pid);
process.exit(0);
