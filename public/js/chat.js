const Chat={
 interval:null, pendingImg:null,
 GIFS:[
  'https://media.giphy.com/media/l0HlQ7LRalXfpBmXa/giphy.gif',
  'https://media.giphy.com/media/3o7aCTPPm4bMzs8i08/giphy.gif',
  'https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif',
  'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
  'https://media.giphy.com/media/26tn33aiTi1jkl6bc/giphy.gif',
  'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif',
  'https://media.giphy.com/media/8lQyyys3SG0wZ6JD8v/giphy.gif',
  'https://media.giphy.com/media/5ntdy5Ban1dIY/giphy.gif'
 ],
 STICKERS:['👾','🛸','🚀','🔥','⚡','💥','👑','🎮','🤖','👻','💎','🏆','😎','🥷','🧠','❤️‍🔥','🪐','🎯'],
 init(){
  const inp=document.getElementById('chatInput');
  const btn=document.getElementById('chatSendBtn');
  if(!inp||!btn) return;
  btn.addEventListener('click',()=>this.send());
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.send(); }});
  document.querySelectorAll('[data-view="chat"]').forEach(b=>b.addEventListener('click',()=>this.start()));
  document.querySelectorAll('[data-view]').forEach(b=>{ if(b.dataset.view!=='chat') b.addEventListener('click',()=>{ if(!document.getElementById('view-chat').classList.contains('active')) this.stop(); });});
  if(document.getElementById('view-chat').classList.contains('active')) this.start();
  this.initBg(); this.initMedia();
 },
 initMedia(){
  const photoBtn=document.getElementById('chatPhotoBtn');
  const gifBtn=document.getElementById('chatGifBtn');
  const stBtn=document.getElementById('chatStickerBtn');
  const file=document.getElementById('chatFileInput');
  const gifPanel=document.getElementById('chatGifPanel');
  const stPanel=document.getElementById('chatStickerPanel');
  if(photoBtn&&file) photoBtn.addEventListener('click',()=>file.click());
  if(file) file.addEventListener('change',()=>this.handlePhoto(file.files[0]));
  if(gifBtn) gifBtn.addEventListener('click',()=>{ gifPanel.classList.toggle('hidden'); if(stPanel) stPanel.classList.add('hidden'); this.renderGifs(); });
  if(stBtn) stBtn.addEventListener('click',()=>{ stPanel.classList.toggle('hidden'); if(gifPanel) gifPanel.classList.add('hidden'); this.renderStickers(); });
  const gifUrlBtn=document.getElementById('chatGifSendUrl');
  if(gifUrlBtn) gifUrlBtn.addEventListener('click',()=>this.sendGifUrl());
  const prevCancel=document.getElementById('chatPreviewCancel');
  if(prevCancel) prevCancel.addEventListener('click',()=>this.clearPreview());
  const prevSend=document.getElementById('chatPreviewSend');
  if(prevSend) prevSend.addEventListener('click',()=>this.sendPhoto());
  document.addEventListener('click',e=>{
    const img=e.target.closest&&e.target.closest('.chat-img');
    if(img&&img.src.startsWith('data:')){ const w=window.open('','_blank'); if(w) w.document.write('<img src="'+img.src+'" style="max-width:100%">'); }
    else if(img){ window.open(img.src,'_blank'); }
  });
 },
 renderGifs(){
  const g=document.getElementById('chatGifGrid'); if(!g||g.dataset.done) return; g.dataset.done='1';
  g.innerHTML=this.GIFS.map(u=>'<img src="'+u+'" loading="lazy" onerror="this.style.display=\'none\'">').join('');
  g.querySelectorAll('img').forEach(im=>im.addEventListener('click',()=>this.sendGif(im.src)));
 },
 renderStickers(){
  const g=document.getElementById('chatStickerGrid'); if(!g||g.dataset.done) return; g.dataset.done='1';
  g.innerHTML=this.STICKERS.map(s=>'<button>'+s+'</button>').join('');
  g.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>this.sendSticker(b.textContent)));
 },
 handlePhoto(file){
  if(!file) return;
  if(!file.type.startsWith('image/')){ Toast.error('Solo imágenes'); return; }
  const isGif=file.type==='image/gif';
  if(isGif && file.size>1_500_000){ Toast.error('GIF máx 1.5MB (usa uno más liviano)'); return; }
  if(!isGif && file.size>3_000_000){ Toast.error('Máx 3MB'); return; }
  const r=new FileReader();
  r.onload=()=>{
    if(isGif){ this.showPreview(r.result); return; }
    const img=new Image();
    img.onload=()=>{
      const c=document.createElement('canvas'); const max=640; let w=img.width,h=img.height;
      if(w>max||h>max){ const s=Math.min(max/w,max/h); w=Math.round(w*s); h=Math.round(h*s); }
      c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
      const out=c.toDataURL('image/jpeg',0.65);
      if(out.length>600000){ Toast.error('Foto muy pesada, probá otra más chica'); return; }
      this.showPreview(out);
    };
    img.onerror=()=>Toast.error('No se pudo leer la imagen');
    img.src=r.result;
  };
  r.readAsDataURL(file);
  document.getElementById('chatFileInput').value='';
 },
 showPreview(dataUrl){
  this.pendingImg=dataUrl;
  document.getElementById('chatPreviewImg').src=dataUrl;
  document.getElementById('chatPreview').classList.remove('hidden');
 },
 clearPreview(){ this.pendingImg=null; document.getElementById('chatPreview').classList.add('hidden'); },
 optimistic(raw){
  const box=document.getElementById('chatMessages'); if(!box) return;
  const em=box.querySelector('.empty-chat'); if(em) em.remove();
  const d=document.createElement('div'); d.className='chat-msg own optimistic';
  d.innerHTML='<div class="chat-avatar chat-avatar-placeholder">👾</div><div class="chat-body"><div class="chat-head"><span class="chat-user">Tú</span><span class="chat-time">enviando...</span></div><div class="chat-text">'+this.renderBody(raw)+'</div></div>';
  box.appendChild(d); box.scrollTop=box.scrollHeight;
 },
 async sendPhoto(){
  if(!this.pendingImg||this._sending) return;
  const raw='[img]'+this.pendingImg; this.clearPreview(); document.getElementById('chatGifPanel').classList.add('hidden');
  this.optimistic(raw); this._sending=true;
  try{ await API.sendChat(raw); await this.load(true); }
  catch(e){ Toast.error(e.message); }
  finally{ this._sending=false; }
 },
 async sendGif(url){
  url=(url||'').trim(); if(!url||this._sending) return;
  document.getElementById('chatGifPanel').classList.add('hidden');
  this.optimistic('[gif]'+url); this._sending=true;
  try{ await API.sendChat('[gif]'+url); await this.load(true); }
  catch(e){ Toast.error(e.message); }
  finally{ this._sending=false; }
 },
 sendGifUrl(){ const i=document.getElementById('chatGifUrl'); const v=(i.value||'').trim(); if(!v) return Toast.info('Pega una URL'); if(!/^https?:\/\//.test(v)) return Toast.error('URL inválida'); i.value=''; this.sendGif(v); },
 async sendSticker(s){ if(this._sending) return; document.getElementById('chatStickerPanel').classList.add('hidden'); this.optimistic('[sticker]'+s); this._sending=true; try{ await API.sendChat('[sticker]'+s); await this.load(true); }catch(e){ Toast.error(e.message); } finally{ this._sending=false; } },
  initBg(){
   const picker=document.getElementById('chatBgPicker');
   if(!picker) return;
   const uploadBtn=document.getElementById('chatBgUploadBtn');
   const clearBtn=document.getElementById('chatBgClearBtn');
   const fileInp=document.getElementById('chatBgInput');
   if(picker.querySelectorAll) picker.querySelectorAll('.bg-opt').forEach(btn=>{
     btn.addEventListener('click',()=>{
       picker.querySelectorAll('.bg-opt').forEach(b=>b.classList.remove('active'));
       btn.classList.add('active');
       if(clearBtn) clearBtn.classList.add('hidden');
       this.applyBg(btn.dataset.bg);
       this.saveBg(btn.dataset.bg);
     });
   });
   if(uploadBtn && fileInp){
     uploadBtn.addEventListener('click',()=>fileInp.click());
     fileInp.addEventListener('change',()=>this.handleBgFile(fileInp.files[0]));
   }
   if(clearBtn) clearBtn.addEventListener('click',()=>{
     picker.querySelectorAll('.bg-opt').forEach(b=>b.classList.remove('active'));
     const def=picker.querySelector('.bg-opt[data-bg=""]'); if(def) def.classList.add('active');
     clearBtn.classList.add('hidden');
     this.applyBg(''); this.saveBg('');
   });
   let bg='';
   try{
     if(typeof Auth!=='undefined' && Auth.user && Auth.user.chatBg) bg=Auth.user.chatBg;
     else bg=localStorage.getItem('ci_chat_bg')||'';
   }catch(e){}
   if(bg) {
     const isImg = bg.startsWith('data:') || bg.startsWith('http') || bg.startsWith('blob:');
     if(isImg){
       picker.querySelectorAll('.bg-opt').forEach(x=>x.classList.remove('active'));
       if(clearBtn) clearBtn.classList.remove('hidden');
     } else {
       const b=picker.querySelector('[data-bg="'+bg+'"]'); if(b){ picker.querySelectorAll('.bg-opt').forEach(x=>x.classList.remove('active')); b.classList.add('active'); }
       if(clearBtn) clearBtn.classList.add('hidden');
     }
     this.applyBg(bg);
   }
  },
  saveBg(bg){
   if(typeof Auth!=='undefined' && Auth.isLogged){
     fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('fx_token')},body:JSON.stringify({chatBg:bg})}).catch(()=>{});
     try{ if(Auth.user) Auth.user.chatBg=bg; }catch(e){}
   }
   try{ localStorage.setItem('ci_chat_bg',bg); }catch(e){}
   const clearBtn=document.getElementById('chatBgClearBtn');
   const isImg = bg && (bg.startsWith('data:')||bg.startsWith('http'));
   if(clearBtn) clearBtn.classList.toggle('hidden', !isImg);
  },
  handleBgFile(file){
   if(!file) return;
   if(file.size>2_500_000){ Toast.error('Imagen muy grande (máx 2.5MB)'); return; }
   const r=new FileReader();
   r.onload=()=>{
     const data=r.result;
     const img=new Image();
     img.onload=()=>{
       const c=document.createElement('canvas'); const max=900; let w=img.width,h=img.height;
       if(w>max||h>max){ const s=Math.min(max/w,max/h); w=Math.round(w*s); h=Math.round(h*s); }
       c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
       const out=c.toDataURL('image/jpeg',0.75);
       document.getElementById('chatBgPicker').querySelectorAll('.bg-opt').forEach(b=>b.classList.remove('active'));
       this.applyBg(out); this.saveBg(out);
       Toast.success('Fondo aplicado');
     };
     img.src=data;
   };
   r.readAsDataURL(file);
  },
  applyBg(bg){
   const card=document.getElementById('chatCard');
   const msgs=document.getElementById('chatMessages');
   const isImg = bg && (bg.startsWith('data:')||bg.startsWith('http')||bg.startsWith('blob:'));
   if(isImg){
     if(msgs){
       msgs.style.backgroundImage='url("'+bg+'")';
       msgs.style.backgroundSize='cover';
       msgs.style.backgroundPosition='center';
       msgs.style.backgroundRepeat='no-repeat';
       msgs.style.backgroundColor='rgba(0,0,0,0.35)';
       msgs.style.backgroundBlendMode='overlay';
     }
     if(card) card.style.background='';
     const clearBtn=document.getElementById('chatBgClearBtn'); if(clearBtn) clearBtn.classList.remove('hidden');
     return;
   }
   if(msgs){ msgs.style.backgroundImage=''; msgs.style.backgroundBlendMode=''; msgs.style.backgroundSize=''; }
   const map={'':'',gradient:'linear-gradient(135deg,#1a1a2e,#16213e)',neon:'linear-gradient(135deg,#00e5ff22,#7c4dff22)',forest:'linear-gradient(135deg,#1b5e20,#2e7d32)'};
   if(card) card.style.background = map[bg] || '';
   if(msgs){
     const bg2={gradient:'rgba(0,0,0,0.3)',neon:'rgba(124,77,255,0.08)',forest:'rgba(0,100,0,0.15)','':''};
     msgs.style.background = bg2[bg] || '';
     msgs.style.backgroundColor = bg2[bg] || '';
   }
  },
 start(){
  this.load(true);
  if(this.interval) clearInterval(this.interval);
  this.interval=setInterval(()=>this.load(),3000);
 },
 stop(){ if(this.interval){ clearInterval(this.interval); this.interval=null; } },
  _chatUserScrolling:false,
  renderBody(raw){
   if(!raw) return '';
   if(raw.startsWith('[img]')){ const src=raw.slice(5,700000); if(!src.startsWith('data:image')) return '<span>⚠️ Foto no disponible</span>'; const safe=this.escAttr(src); return '<img class="chat-img" src="'+safe+'" loading="lazy" alt="foto">'; }
   if(raw.startsWith('[gif]')){ const src=raw.slice(5,600).trim(); if(!/^https?:\/\//.test(src)) return '<span>⚠️ GIF no disponible</span>'; const safe=this.escAttr(src); return '<img class="chat-img chat-gif" src="'+safe+'" loading="lazy" onerror="this.outerHTML=\'<span>⚠️ GIF no disponible</span>\'" alt="gif">'; }
   if(raw.startsWith('[sticker]')){ const s=raw.slice(9,20); return '<div class="chat-sticker">'+this.esc(s)+'</div>'; }
   let h=this.esc(raw);
   const imgs=[];
   h=h.replace(/(https?:\/\/[^\s<]+?\.(?:gif|png|jpe?g|webp)(\?[^\s<]*)?)/gi,(m)=>{ imgs.push(m); return '%%IMG'+(imgs.length-1)+'%%'; });
   h=h.replace(/(https?:\/\/[^\s<]+)/gi,'<a href="$1" target="_blank" rel="noopener">$1</a>');
   h=h.replace(/%%IMG(\d+)%%/g,(m,i)=>'<br><img class="chat-img" src="'+imgs[Number(i)]+'" loading="lazy" onerror="this.style.display=\'none\'">');
   return h;
  },
  async load(force){
   const box=document.getElementById('chatMessages');
   const isLogged=typeof Auth!=='undefined'&&Auth.isLogged;
   const inp=document.getElementById('chatInput');
   const btn=document.getElementById('chatSendBtn');
   if(inp) inp.disabled=!isLogged;
   if(btn) btn.disabled=!isLogged;
   ['chatPhotoBtn','chatGifBtn','chatStickerBtn'].forEach(id=>{ const b=document.getElementById(id); if(b) b.disabled=!isLogged; });
   if(inp&&!isLogged) inp.placeholder='Inicia sesión para chatear...';
    if(box && !box.dataset.scrollBound){
      box.dataset.scrollBound='1';
      let t=null;
      box.addEventListener('scroll',()=>{
        const nearBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 80;
        box.dataset.userAtBottom = nearBottom ? '1':'0';
        this._chatUserScrolling=true;
        if(t) clearTimeout(t);
        t=setTimeout(()=>{ this._chatUserScrolling=false; }, 600);
      }, {passive:true});
      box.addEventListener('wheel',()=>{ this._chatUserScrolling=true; }, {passive:true});
    }
    try{
     const wasEmpty = box.dataset.loaded !== '1';
     const prevKey = box.dataset.lastKey||'';
     const nearBottom = box.dataset.userAtBottom !== '0';
     const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 80 || wasEmpty || nearBottom;
     const prevTop = box.scrollTop;
     const data=await API.getChat();
     const msgs=data.messages||[];
     const cc=document.getElementById('chatCount'); if(cc) cc.textContent='👾 '+msgs.length;
     if(!msgs.length){ box.innerHTML='<div class="empty-chat"><span class="empty-chat-icon">👾</span><p class="hint">No hay mensajes aún.<br>¡Sé el primero en hablar!</p></div>'; box.dataset.loaded='1'; box.dataset.msgCount='0'; return; }
     const lastKey=msgs.length+'|'+(msgs[msgs.length-1]?msgs[msgs.length-1].id+'|'+msgs[msgs.length-1].createdAt:'');
     if(!force && !wasEmpty && lastKey===prevKey && !this._chatUserScrolling){ return; }
       const meId=(typeof Auth!=='undefined'&&Auth.user)?Auth.user.id:null;
        box.innerHTML=msgs.map(m=>{
         const own=m.userId===meId;
         const date=new Date(m.createdAt).toLocaleString('es-AR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
         const del=own?'<button class="chat-del" data-id="'+m.id+'" title="Borrar">🗑️</button>':'<button class="chat-flag" data-rep="'+m.userId+'" data-name="'+this.escAttr(m.username)+'" title="Denunciar jugador">🚩</button>';
         const frame=m.equippedFrame&&m.equippedFrame!=='none'?' frame-'+m.equippedFrame:'';
          const champClass=m.equippedFrame==='campeon'?' frame-campeon':(m.frames&&m.frames.includes('campeon')?' champion-active':'');
          const pic=m.profilePic?'<img class="chat-avatar '+frame+champClass+'" src="'+this.escAttr(m.profilePic)+'" alt="">':'<div class="chat-avatar chat-avatar-placeholder '+frame+champClass+'">👾</div>';
          const bub=m.equippedBubble&&m.equippedBubble!=='none'?' chat-bubble-wrap bubble-'+m.equippedBubble:'';
          return '<div class="chat-msg '+(own?'own':'')+'">'+pic+'<div class="chat-body"><div class="chat-head"><span class="chat-user" style="color:'+(m.nameColor||"#00e5ff")+';'+API.fontStyle(m.equippedFont)+API.fxStyle(m.equippedFx)+'">'+this.esc(m.username)+'</span><span class="chat-time">'+date+'</span>'+del+'</div><div class="chat-text'+bub+'">'+this.renderBody(m.text)+'</div></div></div>';
       }).join('');
       box.querySelectorAll('.chat-del').forEach(b=>b.addEventListener('click',()=>this.del(b.dataset.id)));
       box.querySelectorAll('.chat-flag').forEach(b=>b.addEventListener('click',()=>{ if(typeof Report!=='undefined') Report.open(b.dataset.rep,b.dataset.name); }));
       if(atBottom){
         requestAnimationFrame(()=>{ box.scrollTop=box.scrollHeight; });
       } else {
         box.scrollTop = prevTop;
       }
       box.dataset.msgCount=String(msgs.length);
     box.dataset.lastKey=lastKey;
     box.dataset.loaded='1';
    }catch(e){ if(box.dataset.loaded!=='1') box.innerHTML='<p class="lead" style="text-align:center">Error al cargar chat.</p>'; }
  },
 esc(s){ const d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; },
 escAttr(s){ return String(s||'').replace(/"/g,'&quot;'); },
 async send(){
  const inp=document.getElementById('chatInput');
  const t=(inp.value||'').trim();
  if(!t) return;
  try{ await API.sendChat(t); inp.value=''; await this.load(true); }catch(e){ if(typeof Toast!=='undefined') Toast.error(e.message); else alert(e.message); }
 },
 async del(id){
  if(!confirm('¿Borrar mensaje?')) return;
  try{ await API.deleteChat(id); await this.load(true); }catch(e){ if(typeof Toast!=='undefined') Toast.error(e.message); }
 }
};
document.addEventListener('DOMContentLoaded',()=>Chat.init());
