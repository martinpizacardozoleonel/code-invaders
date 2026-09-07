try {
  const server = require('../server.js');
} catch(e) {
  console.error('STARTUP ERROR:', e.message);
  console.error(e.stack);
}
