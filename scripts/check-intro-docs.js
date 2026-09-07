const fs = require('fs');
const files = ['public/js/intro.js', 'public/js/docs.js'];
for (const f of files) {
  try {
    const code = fs.readFileSync(f, 'utf8');
    new Function(code);
    console.log(f + ': OK');
  } catch(e) {
    console.log(f + ': ERROR - ' + e.message);
  }
}
