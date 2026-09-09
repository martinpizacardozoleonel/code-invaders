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
 },
 start(){
  this.load();
  if(this.interval) clearInterval(this.interval);
  this.interval=setInterval(()=>this.load(),3000);
 },
 stop(){ if(this.interval){ clearInterval(this.interval); this.interval=null; } },
 async load(){
  const box=document.getElementById('chatMessages');
  const hint=document.getElementById('chatHint');
  const isLogged=typeof Auth!=='undefined'&&Auth.isLogged;
  const inp=document.getElementById('chatInput');
  const btn=document.getElementById('chatSendBtn');
  if(inp) inp.disabled=!isLogged;
  if(btn) btn.disabled=!isLogged;
  if(hint) hint.textContent=isLogged?'💾 Mensajes guardados en la BD persistente (Postgres). No se borran al refrescar.':'🔒 Debes iniciar sesión para chatear.';
  try{
   const data=await API.getChat();
   const msgs=data.messages||[];
   if(!msgs.length){ box.innerHTML='<p class="lead">No hay mensajes aún. ¡Sé el primero!</p>'; return; }
   const meId=(typeof Auth!=='undefined'&&Auth.user)?Auth.user.id:null;
   box.innerHTML=msgs.map(m=>{
    const own=m.userId===meId;
    const date=new Date(m.createdAt).toLocaleString('es-AR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'});
    const del=own?`<button class="chat-del" data-id="${m.id}" title="Borrar">🗑️</button>`:'';
    return `<div class="chat-msg ${own?'own':''}"><div class="chat-head"><span class="chat-user">${this.esc(m.username)}</span><span class="chat-time">${date}</span>${del}</div><div class="chat-text">${this.esc(m.text)}</div></div>`;
   }).join('');
   box.querySelectorAll('.chat-del').forEach(b=>b.addEventListener('click',()=>this.del(b.dataset.id)));
   box.scrollTop=box.scrollHeight;
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
