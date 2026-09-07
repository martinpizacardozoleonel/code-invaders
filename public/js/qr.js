const QRView = (() => {
  let url = '';
  function getUrl(){
    const host = location.origin;
    if(host.includes('localhost') || host.includes('127.0.0.1')){
      return 'https://code-invaders-gustavo.loca.lt';
    }
    return host;
  }
  function init(){
    url = getUrl();
    const img = document.getElementById('qrImg');
    const loading = document.getElementById('qrLoading');
    const urlEl = document.getElementById('qrUrl');
    const openBtn = document.getElementById('qrOpenBtn');
    if(!img || !urlEl) return;
    const qrSrc = typeof API!=='undefined' && API.qrUrl ? API.qrUrl(url, 300, '#00e5ff') : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=ffffff&color=00e5ff&data=${encodeURIComponent(url)}`;
    img.src = qrSrc;
    img.onload = () => { if(loading) loading.classList.add('hidden'); };
    img.onerror = () => { if(loading) loading.textContent='Error al generar QR'; };
    urlEl.textContent = url;
    if(openBtn) openBtn.href = url;
    const copyBtn = document.getElementById('qrCopyBtn');
    if(copyBtn) copyBtn.addEventListener('click', async () => {
      try{ await navigator.clipboard.writeText(url); copyBtn.textContent='✓ Copiado'; setTimeout(()=>copyBtn.textContent='📋 Copiar link',1500);}catch(e){
        const ta=document.createElement('textarea'); ta.value=url; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
        copyBtn.textContent='✓ Copiado'; setTimeout(()=>copyBtn.textContent='📋 Copiar link',1500);
      }
    });
    const shareBtn = document.getElementById('qrShareBtn');
    if(shareBtn) shareBtn.addEventListener('click', async () => {
      if(navigator.share){ try{ await navigator.share({title:'CODE INVADERS', text:'Jugá Code Invaders', url}); }catch(e){} }
      else {
        try{ await navigator.clipboard.writeText(url); shareBtn.textContent='✓ Link copiado'; setTimeout(()=>shareBtn.textContent='📤 Compartir',1500);}catch(e){}
      }
    });
    document.addEventListener('click', (e)=>{
      const t=e.target.closest('[data-view="qr"]');
      if(t) setTimeout(refresh,100);
    });
  }
  function refresh(){
    const img=document.getElementById('qrImg');
    if(!img) return;
    url=getUrl();
    const src = typeof API!=='undefined' && API.qrUrl ? API.qrUrl(url, 300, '#00e5ff') : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=ffffff&color=00e5ff&data=${encodeURIComponent(url)}`;
    img.src = src + '&t='+Date.now();
    const urlEl=document.getElementById('qrUrl');
    if(urlEl) urlEl.textContent=url;
    const openBtn=document.getElementById('qrOpenBtn');
    if(openBtn) openBtn.href=url;
  }
  return { init, refresh };
})();
document.addEventListener('DOMContentLoaded', ()=> QRView.init());
