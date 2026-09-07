const lt = require('localtunnel');
(async () => {
  try {
    const tunnel = await lt({ port: 3000, subdomain: 'code-invaders-gustavo' });
    console.log('TUNNEL_URL:', tunnel.url);
    tunnel.on('close', () => { console.log('Tunnel closed'); process.exit(1); });
    setInterval(()=>{}, 1000000);
  } catch(e){
    console.error('Tunnel error', e);
    try{
      const tunnel2 = await lt({ port: 3000 });
      console.log('TUNNEL_URL:', tunnel2.url);
      tunnel2.on('close', () => { console.log('Tunnel closed'); process.exit(1); });
    } catch(e2){ console.error(e2); process.exit(1); }
  }
})();
