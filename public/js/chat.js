const Chat={
 interval:null,
 init(){
  const inp=document.getElementById('chatInput');
  const btn=document.getElementById('chatSendBtn');
  if(!inp||!btn) return;
  btn.addEventListener('click',()=>this.send());
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.send(); }});
  document.querySelectorAll('[data-view="chat"]').forEach(b=>b.addEventListener('click',()=>this.start()));
  document.querySelectorAll('[data-view]').forEach(b=>{ if(b.dataset.view!=='chat') b.addEventListener('click',()=>{ if(!document.getElementById('view-chat').classList.contains('active')) this.stop(); });});
  if(document.getElementById('view-chat').classList.contains('active')) this.start();
  this.initBg();
 },
 initBg(){
  const picker=document.getElementById('chatBgPicker');
  if(!picker) return;
  picker.querySelectorAll('.bg-opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      picker.querySelectorAll('.bg-opt').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      this.applyBg(btn.dataset.bg);
      if(typeof Auth!=='undefined' && Auth.isLogged){
        fetch('/api/settings',{method:'PUT',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('fx_token')},body:JSON.stringify({chatBg:btn.dataset.bg})}).catch(()=>{});
      } else {
        try{ localStorage.setItem('ci_chat_bg',btn.dataset.bg); }catch(e){}
      }
    });
  });
  let bg='';
  try{
    if(typeof Auth!=='undefined' && Auth.user && Auth.user.chatBg) bg=Auth.user.chatBg;
    else bg=localStorage.getItem('ci_chat_bg')||'';
  }catch(e){}
  if(bg) { const b=picker.querySelector(`[data-bg="${bg}"]`); if(b){ picker.querySelectorAll('.bg-opt').forEach(x=>x.classList.remove('active')); b.classList.add('active'); } this.applyBg(bg); }
 },
 applyBg(bg){
  const card=document.getElementById('chatCard');
  const msgs=document.getElementById('chatMessages');
  const map={'':'',gradient:'linear-gradient(135deg,#1a1a2e,#16213e)',neon:'linear-gradient(135deg,#00e5ff22,#7c4dff22)',forest:'linear-gradient(135deg,#1b5e20,#2e7d32)'};
  if(card) card.style.background = map[bg] || '';
  if(msgs){
    const bg2={gradient:'rgba(0,0,0,0.3)',neon:'rgba(124,77,255,0.08)',forest:'rgba(0,100,0,0.15)','':''};
    msgs.style.background = bg2[bg] || '';
  }
 },
 start(){
  this.load();
  if(this.interval) clearInterval(this.interval);
  this.interval=setInterval(()=>this.load(),3000);
 },
 stop(){ if(this.interval){ clearInterval(this.interval); this.interval=null; } },
  _chatUserScrolling:false,
  async load(){
   const box=document.getElementById('chatMessages');
   const hint=document.getElementById('chatHint');
   const isLogged=typeof Auth!=='undefined'&&Auth.isLogged;
   const inp=document.getElementById('chatInput');
   const btn=document.getElementById('chatSendBtn');
   if(inp) inp.disabled=!isLogged;
   if(btn) btn.disabled=!isLogged;
   if(hint) hint.textContent=isLogged?'💾 Mensajes guardados en la BD persistente (Postgres). No se borran al refrescar.':'🔒 Debes iniciar sesión para chatear.';
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
     const prevCount = box.dataset.msgCount ? parseInt(box.dataset.msgCount)||0 : 0;
     const nearBottom = box.dataset.userAtBottom !== '0';
     const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 80 || wasEmpty || nearBottom;
     const prevTop = box.scrollTop;
     const data=await API.getChat();
     const msgs=data.messages||[];
     if(!msgs.length){ box.innerHTML='<p class="lead">No hay mensajes aún. ¡Sé el primero!</p>'; box.dataset.loaded='1'; box.dataset.msgCount='0'; return; }
     if(!wasEmpty && msgs.length===prevCount && !this._chatUserScrolling){
     } else {
       const meId=(typeof Auth!=='undefined'&&Auth.user)?Auth.user.id:null;
       box.innerHTML=msgs.map(m=>{
        const own=m.userId===meId;
        const date=new Date(m.createdAt).toLocaleString('es-AR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
        const del=own?`<button class="chat-del" data-id="${m.id}" title="Borrar">🗑️</button>`:'';
        return `<div class="chat-msg ${own?'own':''}"><div class="chat-head"><span class="chat-user">${this.esc(m.username)}</span><span class="chat-time">${date}</span>${del}</div><div class="chat-text">${this.esc(m.text)}</div></div>`;
       }).join('');
       box.querySelectorAll('.chat-del').forEach(b=>b.addEventListener('click',()=>this.del(b.dataset.id)));
       if(atBottom){
         requestAnimationFrame(()=>{ box.scrollTop=box.scrollHeight; });
       } else {
         box.scrollTop = prevTop;
       }
       box.dataset.msgCount=String(msgs.length);
     }
     box.dataset.loaded='1';
    }catch(e){ box.innerHTML='<p class="lead">Error al cargar chat.</p>'; }
  },
 esc(s){ const d=document.createElement('div'); d.textContent=s; return d.innerHTML; },
 async send(){
  const inp=document.getElementById('chatInput');
  const t=(inp.value||'').trim();
  if(!t) return;
  try{ await API.sendChat(t); inp.value=''; await this.load(); }catch(e){ if(typeof Toast!=='undefined') Toast.error(e.message); else alert(e.message); }
 },
 async del(id){
  if(!confirm('¿Borrar mensaje?')) return;
  try{ await API.deleteChat(id); await this.load(); }catch(e){ if(typeof Toast!=='undefined') Toast.error(e.message); }
 }
};
document.addEventListener('DOMContentLoaded',()=>Chat.init());
