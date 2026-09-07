const fs = require('fs');
const files = ['public/js/game.js', 'public/js/profile.js', 'public/js/app.js'];
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    new Function(code);
    console.log(f + ': OK');
  } catch(e) {
    console.log(f + ': ERROR - ' + e.message);
  }
}
