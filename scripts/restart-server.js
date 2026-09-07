const { exec } = require('child_process');

// Kill existing node
exec('taskkill /F /IM node.exe', () => {
  setTimeout(() => {
    const { spawn } = require('child_process');
    const child = spawn('node', ['server.js'], {
      cwd: __dirname.replace('\\scripts', ''),
      detached: true,
      stdio: ['ignore', 'ignore', 'ignore']
    });
    child.unref();
    
    setTimeout(() => {
      require('http').get('http://localhost:3000/', r => {
        let d = '';
        r.on('data', c => d += c);
        r.on('end', () => {
          console.log('Server PID:', child.pid, 'STATUS:', r.statusCode);
          process.exit(0);
        });
      }).on('error', e => {
        console.log('Server started but not yet ready, PID:', child.pid, 'ERR:', e.code);
        process.exit(0);
      });
    }, 3000);
  }, 2000);
});
