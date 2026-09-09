const Friends={
  sel:null,
  hb:null,
  init(){
    if(!document.getElementById('view-friends')) return;
    this.bind();
    this.heartbeat();
    setInterval(()=>this.heartbeat(), 60000);
    setInterval(()=>{ const vf=document.getElementById('view-friends'); if(vf&&vf.classList.contains('active')) this.load(); }, 15000);
    document.querySelectorAll('[data-view="friends"]').forEach(b=>b.addEventListener('click',()=>this.load()));
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
 },
 async heartbeat(){ try{ await API.heartbeat(); }catch(e){} },
 async load(){
   const list=document.getElementById('friendsList');
   const reqs=document.getElementById('friendReqs');
   if(!list) return;
   list.innerHTML='<p class="lead">Cargando...</p>';
   try{
     const data=await API.getFriends();
     const all=data.friends||[];
     const pending=all.filter(f=>f.status==='pending' && !f.isRequester);
     const accepted=all.filter(f=>f.status==='accepted');
     const sent=all.filter(f=>f.status==='pending' && f.isRequester);
     if(reqs){
       if(!pending.length) reqs.innerHTML='<p class="hint">Sin solicitudes</p>';
       else reqs.innerHTML=pending.map(f=>`<div class="friend-req"><span style="color:${f.nameColor}">${f.username}</span><span class="dot ${f.online?'online':'offline'}"></span><div class="btn-row" style="margin-left:auto"><button class="btn btn-primary btn-sm" data-acc="${f.id}">Aceptar</button><button class="btn btn-ghost btn-sm" data-rej="${f.id}">Rechazar</button></div></div>`).join('');
       reqs.querySelectorAll('[data-acc]').forEach(b=>b.addEventListener('click',()=>this.accept(b.dataset.acc)));
       reqs.querySelectorAll('[data-rej]').forEach(b=>b.addEventListener('click',()=>this.reject(b.dataset.rej)));
     }
     if(!accepted.length && !sent.length){ list.innerHTML='<p class="lead">Sin amigos aún. ¡Busca por nombre y agrega!</p>'; this.updatePrivList(accepted); return; }
     let html='';
     if(sent.length) html+=`<h4 style="margin:8px 0;color:var(--text-dim)">Enviadas</h4>`+sent.map(f=>`<div class="friend-card"><span>${f.username}</span><span class="hint">pendiente</span><button class="btn btn-ghost btn-sm" data-cancel="${f.id}">Cancelar</button></div>`).join('');
     html+=`<h4 style="margin:12px 0;color:var(--text-dim)">Amigos (${accepted.length})</h4>`+accepted.map(f=>`<div class="friend-card friend-open" data-fid="${f.otherId}"><span class="dot ${f.online?'online':'offline'}"></span><span style="color:${f.nameColor};font-weight:800">${f.username}</span><span class="hint">${f.online?'en línea':'desconectado'}</span><button class="btn btn-ghost btn-sm" data-open="${f.otherId}">💬</button><button class="btn btn-ghost btn-sm" data-del="${f.id}" style="color:#ff5252">✕</button></div>`).join('');
     list.innerHTML=html;
     list.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>this.reject(b.dataset.cancel)));
     list.querySelectorAll('[data-del]').forEach(b=>b.addEventListener('click',()=>this.remove(b.dataset.del)));
     list.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>this.openPriv(b.dataset.open)));
     list.querySelectorAll('.friend-open').forEach(c=>c.addEventListener('click',e=>{ if(e.target.closest('button')) return; this.openPriv(c.dataset.fid); }));
     this.updatePrivList(accepted);
   }catch(e){ list.innerHTML='<p class="lead">Debes iniciar sesión</p>'; }
 },
 updatePrivList(accepted){
   const sel=document.getElementById('privFriendSelect');
   if(!sel) return;
   sel.innerHTML='<option value="">-- elige amigo --</option>'+accepted.map(f=>`<option value="${f.otherId}">${f.username} ${f.online?'🟢':'🔴'}</option>`).join('');
   sel.onchange=()=>{ this.sel=sel.value||null; if(this.sel) this.loadPriv(); else document.getElementById('privMessages').innerHTML='<p class="hint">Selecciona un amigo</p>'; };
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
   const sec=document.getElementById('view-friends');
   if(sec && !sec.classList.contains('active')){ document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-friends')); document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view==='friends')); }
   const sel=document.getElementById('privFriendSelect');
   if(sel) sel.value=friendId;
   await this.loadPriv();
   if(this.hb) clearInterval(this.hb);
   this.hb=setInterval(()=>this.loadPriv(),3000);
 },
  async loadPriv(){
    if(!this.sel) return;
    const box=document.getElementById('privMessages');
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
      if(!msgs.length){ box.innerHTML='<p class="hint">Sin mensajes privados aún</p>'; box.dataset.userAtBottom='1'; return; }
      const me=(typeof Auth!=='undefined'&&Auth.user)?Auth.user.id:null;
      box.innerHTML=msgs.map(m=>`<div class="chat-msg ${m.senderId===me?'own':''}"><div class="chat-text">${this.esc(m.text)}</div><div class="chat-time">${new Date(m.createdAt).toLocaleString('es-AR',{hour:'2-digit',minute:'2-digit'})}</div></div>`).join('');
      if(atBottom) requestAnimationFrame(()=>{ box.scrollTop=box.scrollHeight; });
      else box.scrollTop = prevTop;
    }catch(e){ box.innerHTML='<p class="hint">Error</p>'; }
  },
 async sendPriv(){
   if(!this.sel) return Toast.info('Elige un amigo');
   const inp=document.getElementById('privInput');
   const t=(inp.value||'').trim(); if(!t) return;
   try{ await API.sendPrivate(this.sel,t); inp.value=''; await this.loadPriv(); }catch(e){ Toast.error(e.message); }
 },
 esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; }
};
document.addEventListener('DOMContentLoaded',()=>Friends.init());
