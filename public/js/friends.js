const Friends={
  sel:null,
  hb:null,
  pendingImg:null,
  GIFS:['https://media.giphy.com/media/l0HlQ7LRalXfpBmXa/giphy.gif','https://media.giphy.com/media/3o7aCTPPm4bMzs8i08/giphy.gif','https://media.giphy.com/media/Ju7l5y9osyymQ/giphy.gif','https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif','https://media.giphy.com/media/26tn33aiTi1jkl6bc/giphy.gif','https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif','https://media.giphy.com/media/8lQyyys3SG0wZ6JD8v/giphy.gif','https://media.giphy.com/media/5ntdy5Ban1dIY/giphy.gif'],
  STICKERS:['👾','🛸','🚀','🔥','⚡','💥','👑','🎮','🤖','👻','💎','🏆','😎','🥷','🧠','❤️‍🔥','🪐','🎯'],
  init(){
    if(!document.getElementById('view-friends')) return;
    this.bind(); this.bindPrivMedia();
    this.heartbeat();
    setInterval(()=>this.heartbeat(), 60000);
    setInterval(()=>{ const vf=document.getElementById('view-friends'); if(vf&&vf.classList.contains('active')) this.load(); }, 15000);
    document.querySelectorAll('[data-view="friends"]').forEach(b=>b.addEventListener('click',()=>this.load()));
    document.addEventListener('click',e=>{ const img=e.target.closest&&e.target.closest('.chat-img'); if(img) window.open(img.src,'_blank'); });
  },
 bind(){
   const addBtn=document.getElementById('friendAddBtn');
   const addInp=document.getElementById('friendAddInput');
   if(addBtn) addBtn.addEventListener('click',()=>this.add());
   if(addInp) addInp.addEventListener('keydown',e=>{ if(e.key==='Enter') this.add(); });
   const sendBtn=document.getElementById('privSendBtn');
   const sendInp=document.getElementById('privInput');
   if(sendBtn) sendBtn.addEventListener('click',()=>this.sendPriv());
   if(sendInp) sendInp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sendPriv(); }});
   const giftBtn=document.getElementById('giftSendBtn');
   if(giftBtn) giftBtn.addEventListener('click',()=>this.sendGift());
 },
 bindPrivMedia(){
   const pBtn=document.getElementById('privPhotoBtn'); const file=document.getElementById('privFileInput');
   const gBtn=document.getElementById('privGifBtn'); const sBtn=document.getElementById('privStickerBtn');
   const gPanel=document.getElementById('privGifPanel'); const sPanel=document.getElementById('privStickerPanel');
   if(pBtn&&file) pBtn.addEventListener('click',()=>{ if(!this.sel) return Toast.info('Elige un amigo'); file.click(); });
   if(file) file.addEventListener('change',()=>this.handlePrivPhoto(file.files[0]));
   if(gBtn) gBtn.addEventListener('click',()=>{ if(!this.sel) return Toast.info('Elige un amigo'); gPanel.classList.toggle('hidden'); sPanel.classList.add('hidden'); this.renderPrivGifs(); });
   if(sBtn) sBtn.addEventListener('click',()=>{ if(!this.sel) return Toast.info('Elige un amigo'); sPanel.classList.toggle('hidden'); gPanel.classList.add('hidden'); this.renderPrivStickers(); });
   const gUrlBtn=document.getElementById('privGifSendUrl');
   if(gUrlBtn) gUrlBtn.addEventListener('click',()=>{ const i=document.getElementById('privGifUrl'); const v=(i.value||'').trim(); if(!v) return; if(!/^https?:\/\//.test(v)) return Toast.error('URL inválida'); i.value=''; this.sendPrivMedia('[gif]'+v); });
   const pc=document.getElementById('privPreviewCancel'); if(pc) pc.addEventListener('click',()=>this.clearPrivPreview());
   const ps=document.getElementById('privPreviewSend'); if(ps) ps.addEventListener('click',()=>this.sendPrivPhoto());
 },
 renderPrivGifs(){
   const g=document.getElementById('privGifGrid'); if(!g||g.dataset.done) return; g.dataset.done='1';
   g.innerHTML=this.GIFS.map(u=>'<img src="'+u+'" loading="lazy" onerror="this.style.display=\'none\'">').join('');
   g.querySelectorAll('img').forEach(im=>im.addEventListener('click',()=>this.sendPrivMedia('[gif]'+im.src)));
 },
 renderPrivStickers(){
   const g=document.getElementById('privStickerGrid'); if(!g||g.dataset.done) return; g.dataset.done='1';
   g.innerHTML=this.STICKERS.map(s=>'<button>'+s+'</button>').join('');
   g.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>this.sendPrivMedia('[sticker]'+b.textContent)));
 },
 handlePrivPhoto(file){
   if(!file) return; if(!this.sel) return Toast.info('Elige un amigo');
   if(!file.type.startsWith('image/')) return Toast.error('Solo imágenes');
   const isGif=file.type==='image/gif';
   if(isGif && file.size>1500000) return Toast.error('GIF máx 1.5MB');
   if(!isGif && file.size>3000000) return Toast.error('Máx 3MB');
   const r=new FileReader();
   r.onload=()=>{
     if(isGif){ this.showPrivPreview(r.result); return; }
     const img=new Image();
      img.onload=()=>{
       const c=document.createElement('canvas'); const max=640; let w=img.width,h=img.height;
       if(w>max||h>max){ const s=Math.min(max/w,max/h); w=Math.round(w*s); h=Math.round(h*s); }
       c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
       const out=c.toDataURL('image/jpeg',0.65);
       if(out.length>600000) return Toast.error('Foto muy pesada, probá otra más chica');
       this.showPrivPreview(out);
     };
     img.src=r.result;
   };
   r.readAsDataURL(file);
   document.getElementById('privFileInput').value='';
 },
 showPrivPreview(d){ this.pendingImg=d; document.getElementById('privPreviewImg').src=d; document.getElementById('privPreview').classList.remove('hidden'); },
 clearPrivPreview(){ this.pendingImg=null; const p=document.getElementById('privPreview'); if(p) p.classList.add('hidden'); },
 async sendPrivPhoto(){ if(!this.pendingImg) return; const d=this.pendingImg; this.clearPrivPreview(); await this.sendPrivMedia('[img]'+d); },
 optimisticPriv(raw){
   const box=document.getElementById('privMessages'); if(!box) return;
   const em=box.querySelector('.empty-chat'); if(em) em.remove();
   const d=document.createElement('div'); d.className='chat-msg own optimistic';
   d.innerHTML='<div class="chat-body"><div class="chat-text">'+this.renderPrivBody(raw)+'</div><div class="chat-time">enviando...</div></div>';
   box.appendChild(d); box.scrollTop=box.scrollHeight; box.dataset.userAtBottom='1';
 },
 async sendPrivMedia(text){
   if(!this.sel) return Toast.info('Elige un amigo');
   if(this._sendingPriv) return; this._sendingPriv=true;
   document.getElementById('privGifPanel').classList.add('hidden'); document.getElementById('privStickerPanel').classList.add('hidden');
   this.optimisticPriv(text);
   try{ await API.sendPrivate(this.sel,text); await this.loadPriv(true); }catch(e){ Toast.error(e.message); }
   finally{ this._sendingPriv=false; }
 },
 renderPrivBody(raw){
   if(!raw) return '';
   if(raw.startsWith('[img]')){ const src=raw.slice(5,700000); if(!src.startsWith('data:image')) return '<span>⚠️ Foto no disponible</span>'; return '<img class="chat-img" src="'+src.replace(/"/g,'&quot;')+'" loading="lazy" alt="foto">'; }
   if(raw.startsWith('[gif]')){ const src=raw.slice(5,600).trim(); if(!/^https?:\/\//.test(src)) return '<span>⚠️ GIF no disponible</span>'; return '<img class="chat-img chat-gif" src="'+src.replace(/"/g,'&quot;')+'" loading="lazy" onerror="this.outerHTML=\'<span>⚠️ GIF no disponible</span>\'" alt="gif">'; }
   if(raw.startsWith('[sticker]')){ return '<div class="chat-sticker">'+this.esc(raw.slice(9,20))+'</div>'; }
   let h=this.esc(raw);
   const imgs=[];
   h=h.replace(/(https?:\/\/[^\s<]+?\.(?:gif|png|jpe?g|webp)(\?[^\s<]*)?)/gi,(m)=>{ imgs.push(m); return '%%IMG'+(imgs.length-1)+'%%'; });
   h=h.replace(/(https?:\/\/[^\s<]+)/gi,'<a href="$1" target="_blank" rel="noopener">$1</a>');
   h=h.replace(/%%IMG(\d+)%%/g,(m,i)=>'<br><img class="chat-img" src="'+imgs[Number(i)]+'" loading="lazy" onerror="this.style.display=\'none\'">');
   return h;
 },
 async heartbeat(){ try{ await API.heartbeat(); }catch(e){} },
  async load(){
   const list=document.getElementById('friendsList');
   const reqs=document.getElementById('friendReqs');
   if(!list) return;
   const skel='<div class="arcade-mini-load"><div class="arcade-spinner small"></div><p>CARGANDO...</p></div>';
   list.innerHTML=skel; if(reqs) reqs.innerHTML=skel;
   try{
     const data=await API.getFriends();
     const all=data.friends||[];
     const pending=all.filter(f=>f.status==='pending' && !f.isRequester);
     const accepted=all.filter(f=>f.status==='accepted');
     const sent=all.filter(f=>f.status==='pending' && f.isRequester);
     if(reqs){
       if(!pending.length) reqs.innerHTML='<p class="hint empty-hint">📭 Sin solicitudes</p>';
       else reqs.innerHTML=pending.map(f=>`<div class="friend-req"><div class="friend-left"><span class="dot ${f.online?'online':'offline'}"></span><span class="friend-name" style="color:${f.nameColor};${API.fontStyle(f.equippedFont)}${API.fxStyle(f.equippedFx)}">${f.username}</span></div><div class="friend-actions"><button class="btn btn-primary btn-sm arcade-btn-xs" data-acc="${f.id}">✓ Aceptar</button><button class="btn btn-ghost btn-sm arcade-btn-xs" data-rej="${f.id}">Rechazar</button></div></div>`).join('');
       reqs.querySelectorAll('[data-acc]').forEach(b=>b.addEventListener('click',()=>this.accept(b.dataset.acc)));
       reqs.querySelectorAll('[data-rej]').forEach(b=>b.addEventListener('click',()=>this.reject(b.dataset.rej)));
     }
     if(!accepted.length && !sent.length){ list.innerHTML='<div class="empty-chat"><span class="empty-chat-icon">👾</span><p class="hint">Sin amigos aún.<br>¡Busca por nombre y agrega!</p></div>'; this.updatePrivList(accepted); this.updateGiftList(accepted); return; }
     let html='';
     if(sent.length) html+=`<h4 class="friends-count">📤 Enviadas (${sent.length})</h4>`+sent.map(f=>`<div class="friend-card sent"><div class="friend-left"><span class="friend-name">${f.username}</span><span class="status-pill pending">⏳ pendiente</span></div><button class="icon-btn danger" data-cancel="${f.id}" title="Cancelar">✕</button></div>`).join('');
     html+=`<h4 class="friends-count">🟢 Amigos (${accepted.length})</h4>`+accepted.map(f=>`<div class="friend-card friend-open ${f.online?'is-online':'is-offline'}" data-fid="${f.otherId}"><div class="friend-left"><span class="dot ${f.online?'online':'offline'}"></span><span class="friend-name" style="color:${f.nameColor};${API.fontStyle(f.equippedFont)}${API.fxStyle(f.equippedFx)}">${f.username}</span><span class="status-pill ${f.online?'online':'offline'}">${f.online?'en línea':'desconectado'}</span></div><div class="friend-actions"><button class="icon-btn chat" data-open="${f.otherId}" title="Chatear">💬</button><button class="icon-btn danger" data-rep="${f.otherId}" data-name="${String(f.username).replace(/"/g,'&quot;')}" title="Denunciar jugador">🚩</button><button class="icon-btn danger" data-del="${f.id}" title="Eliminar">✕</button></div></div>`).join('');
     list.innerHTML=html;
     list.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>this.reject(b.dataset.cancel)));
     list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>this.remove(b.dataset.del)));
     list.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>this.openPriv(b.dataset.open)));
     list.querySelectorAll('[data-rep]').forEach(b=>b.addEventListener('click',()=>{ if(typeof Report!=='undefined') Report.open(b.dataset.rep,b.dataset.name); }));
      list.querySelectorAll('.friend-open').forEach(c=>c.addEventListener('click',e=>{ if(e.target.closest('button')) return; this.openPriv(c.dataset.fid); }));
      this.updatePrivList(accepted);
      this.updateGiftList(accepted);
      this.loadGifts();
    }catch(e){ list.innerHTML='<p class="lead">Debes iniciar sesión</p>'; }
 },
 updatePrivList(accepted){
   const sel=document.getElementById('privFriendSelect');
   if(!sel) return;
   sel.innerHTML='<option value="">💬 -- elige amigo --</option>'+accepted.map(f=>`<option value="${f.otherId}">${f.username} ${f.online?'🟢':'🔴'}</option>`).join('');
   sel.onchange=()=>{ this.sel=sel.value||null; const box=document.getElementById('privMessages'); if(box) box.dataset.lastKey=''; if(this.sel) this.loadPriv(true); else if(box) box.innerHTML='<div class="empty-chat"><span class="empty-chat-icon">💬</span><p class="hint">Selecciona un amigo para chatear</p></div>'; };
   if(this.sel && accepted.some(f=>f.otherId===this.sel)) { sel.value=this.sel; this.loadPriv(); }
 },
 async add(){
   const inp=document.getElementById('friendAddInput');
   const v=(inp.value||'').trim(); if(!v) return;
   try{ await API.sendFriendRequest(v); inp.value=''; Toast.success('Solicitud enviada'); this.load(); }catch(e){ Toast.error(e.message); }
 },
 async accept(id){ try{ await API.acceptFriend(id); Toast.success('Amistad aceptada'); this.load(); if(typeof Notifications!=='undefined') Notifications.sync(); }catch(e){ Toast.error(e.message); } },
 async reject(id){ try{ await API.rejectFriend(id); this.load(); }catch(e){ Toast.error(e.message); } },
 async remove(id){ if(!confirm('¿Eliminar amigo?')) return; try{ await API.removeFriend(id); this.load(); }catch(e){ Toast.error(e.message); } },
  async openPriv(friendId){
   this.sel=friendId;
   const box=document.getElementById('privMessages'); if(box) box.dataset.lastKey='';
   const sec=document.getElementById('view-friends');
   if(sec && !sec.classList.contains('active')){ document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-friends')); document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='friends')); }
   const sel=document.getElementById('privFriendSelect');
   if(sel) sel.value=friendId;
   await this.loadPriv(true);
   if(this.hb) clearInterval(this.hb);
   this.hb=setInterval(()=>this.loadPriv(),3000);
  },
   async loadPriv(force){
    if(!this.sel) return;
    const box=document.getElementById('privMessages');
    if(!box) return;
    if(box && !box.dataset.scrollBound){
      box.dataset.scrollBound='1';
      box.addEventListener('scroll',()=>{
        const near = box.scrollTop + box.clientHeight >= box.scrollHeight - 60;
        box.dataset.userAtBottom = near ? '1':'0';
      }, {passive:true});
    }
    try{
      const prevTop = box.scrollTop;
      const atBottom = box.dataset.userAtBottom !== '0' || box.scrollTop + box.clientHeight >= box.scrollHeight - 60;
      const data=await API.getPrivate(this.sel);
      const msgs=data.messages||[];
      if(!msgs.length){ box.innerHTML='<div class="empty-chat"><span class="empty-chat-icon">✨</span><p class="hint">Sin mensajes aún. ¡Rompe el hielo! 👾</p></div>'; box.dataset.userAtBottom='1'; box.dataset.lastKey='empty'; return; }
      const lastKey=msgs.length+'|'+msgs[msgs.length-1].id+'|'+msgs[msgs.length-1].createdAt;
      if(!force && box.dataset.lastKey===lastKey) return;
      const me=(typeof Auth!=='undefined'&&Auth.user)?Auth.user.id:null;
      box.innerHTML=msgs.map(m=>{ const bub=(m.senderBubble&&m.senderBubble!=='none')?' chat-bubble-wrap bubble-'+m.senderBubble:''; return `<div class="chat-msg ${m.senderId===me?'own':''}"><div class="chat-body"><div class="chat-text${bub}">${this.renderPrivBody(m.text)}</div><div class="chat-time">${new Date(m.createdAt).toLocaleString('es-AR',{hour:'2-digit',minute:'2-digit'})}</div></div></div>`; }).join('');
      box.dataset.lastKey=lastKey;
      if(atBottom) requestAnimationFrame(()=>{ box.scrollTop=box.scrollHeight; });
      else box.scrollTop = prevTop;
    }catch(e){ if(!box.dataset.lastKey) box.innerHTML='<p class="hint">Error</p>'; }
  },
  async sendPriv(){
   if(!this.sel) return Toast.info('Elige un amigo');
   const inp=document.getElementById('privInput');
   const t=(inp.value||'').trim(); if(!t) return;
   try{ await API.sendPrivate(this.sel,t); inp.value=''; await this.loadPriv(true); }catch(e){ Toast.error(e.message); }
  },
 async sendGift(){
   const sel=document.getElementById('giftFriendSelect');
   const friendId=sel?sel.value:'';
   if(!friendId) return Toast.info('Elige un amigo');
   const amtInp=document.getElementById('giftAmountInput');
   const msgInp=document.getElementById('giftMsgInput');
   const amount=Number(amtInp?amtInp.value:0);
   const message=msgInp?msgInp.value.trim():'';
   if(!amount||amount<10) return Toast.info('Monto mínimo: 10 pts');
   if(amount>5000) return Toast.info('Monto máximo: 5000 pts');
   try{
     const res=await API.sendGift(friendId,amount,message);
     if(amtInp) amtInp.value='';
     if(msgInp) msgInp.value='';
     Toast.success('¡Obsequio enviado!');
     if(typeof Profile!=='undefined'&&Profile.user) Profile.user.coins=res.coins;
     this.loadGifts();
   }catch(e){ Toast.error(e.message); }
 },
 async loadGifts(){
   const box=document.getElementById('giftHistory');
   const coinsEl=document.getElementById('giftCoinsDisplay');
   if(!box) return;
   try{
     if(typeof Profile!=='undefined'&&Profile.user&&coinsEl) coinsEl.textContent=Profile.user.coins||0;
     const res=await API.getGifts();
     const gifts=res.gifts||[];
     if(!gifts.length){ box.innerHTML='<p class="hint">Sin obsequios aún</p>'; return; }
     const me=(typeof Auth!=='undefined'&&Auth.user)?Auth.user.id:null;
     box.innerHTML=gifts.map(g=>{
       const isSent=g.senderId===me;
       const otherName=isSent?g.receiverName:g.senderName;
       const icon=isSent?'➡️':'⬅️';
       const color=isSent?'var(--text-dim,#aaa)':'var(--accent,#43a047)';
       return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border,#333)"><span>${icon}</span><span style="flex:1"><strong style="color:${color}">${otherName}</strong> <span class="hint">${g.message?'"'+g.message+'"':''}</span></span><span style="font-weight:700;${isSent?'color:#ff5252':'color:#43a047'}">${isSent?'-':'+'} ${g.amount} pts</span><span class="hint" style="font-size:11px">${new Date(g.createdAt).toLocaleDateString('es-AR')}</span></div>`;
     }).join('');
     const giftSel=document.getElementById('giftFriendSelect');
     if(giftSel){
       const accepted=(typeof this._lastAccepted!=='undefined')?this._lastAccepted:[];
       giftSel.innerHTML='<option value="">-- elige amigo --</option>'+accepted.map(f=>`<option value="${f.otherId}">${f.username}</option>`).join('');
     }
   }catch(e){ box.innerHTML='<p class="hint">Error</p>'; }
 },
 updateGiftList(accepted){
   this._lastAccepted=accepted;
   const giftSel=document.getElementById('giftFriendSelect');
   if(giftSel) giftSel.innerHTML='<option value="">🎁 -- elige amigo --</option>'+accepted.map(f=>`<option value="${f.otherId}">${f.username}</option>`).join('');
 },
 esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
};
document.addEventListener('DOMContentLoaded',()=>Friends.init());
