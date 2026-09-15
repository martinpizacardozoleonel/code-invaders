const MultiUI={
 open:false, timer:null, ready:false, lastKey:'',
 init(){
  const mb=document.getElementById('multiBtn'); if(mb) mb.addEventListener('click',()=>this.openLobby());
  const nb=document.getElementById('navMultiBtn'); if(nb) nb.addEventListener('click',()=>{ document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id==='view-game')); document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b===nb)); this.openLobby(); });
  const cb=document.getElementById('multiCloseBtn'); if(cb) cb.addEventListener('click',()=>this.close());
  const rb=document.getElementById('multiReadyBtn'); if(rb) rb.addEventListener('click',()=>this.toggleReady());
  const lv=document.getElementById('multiLeaveBtn'); if(lv) lv.addEventListener('click',()=>this.leave());
  const cs=document.getElementById('multiChatSend'); if(cs) cs.addEventListener('click',()=>this.sendChat());
  const ci=document.getElementById('multiChatInput'); if(ci) ci.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sendChat(); }});
  const ab=document.getElementById('multiAnswerBtn'); if(ab) ab.addEventListener('click',()=>this.sendAnswer());
  const ai=document.getElementById('multiAnswer'); if(ai) ai.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sendAnswer(); }});
  const st=document.getElementById('multiStayBtn'); if(st) st.addEventListener('click',async()=>{ this.ready=false; try{ await API.multiReady(false); }catch(e){} this.show('lobby'); this.poll(true); });
  const qt=document.getElementById('multiQuitBtn'); if(qt) qt.addEventListener('click',()=>this.leave());
 },
 async openLobby(){
  if(typeof Auth==='undefined'||!Auth.isLogged){ Toast.info('Inicia sesión para jugar online'); return; }
  document.getElementById('multiOverlay').classList.remove('hidden');
  this.open=true; this.ready=false;
  try{ await API.multiJoin(); }catch(e){ Toast.error(e.message); return; }
  this.show('lobby');
  this.poll(true);
  if(this.timer) clearInterval(this.timer);
  this.timer=setInterval(()=>this.poll(),2000);
 },
 close(){
  document.getElementById('multiOverlay').classList.add('hidden');
  this.open=false;
  if(this.timer){ clearInterval(this.timer); this.timer=null; }
 },
 async leave(){
  try{ await API.multiLeave(); }catch(e){}
  this.ready=false; this.close();
 },
 async toggleReady(){
  this.ready=!this.ready;
  try{ await API.multiReady(this.ready); }catch(e){ this.ready=!this.ready; Toast.error(e.message); return; }
  document.getElementById('multiReadyBtn').textContent=this.ready?'⏳ Cancelar listo':'✅ ¡LISTO!';
  this.poll(true);
 },
 show(which){
  ['multiLobby','multiBattle','multiResults'].forEach(id=>document.getElementById(id).classList.add('hidden'));
  if(which==='lobby') document.getElementById('multiLobby').classList.remove('hidden');
  if(which==='battle') document.getElementById('multiBattle').classList.remove('hidden');
  if(which==='results') document.getElementById('multiResults').classList.remove('hidden');
 },
 esc(s){ const d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; },
 catColor(c){ return c==='HTML'?'#ff7043':(c==='CSS'?'#40c4ff':'#ffd600'); },
 async poll(force){
  if(!this.open) return;
  let d; try{ d=await API.multiState(); }catch(e){ return; }
  const me=d.me;
  const lobby=d.lobby||[]; const match=d.match; const chat=d.chat||[];
  const lp=document.getElementById('multiPlayers');
  if(lp){
    if(!lobby.length) lp.innerHTML='<p class="hint empty-hint">Lobby vacío. ¡Invita a tus amigos!</p>';
    else lp.innerHTML=lobby.map(p=>{
      const pic=p.profilePic?'<img src="'+p.profilePic.replace(/"/g,'&quot;')+'" alt="">':'<span>👾</span>';
      return '<div class="multi-player'+(p.ready?' is-ready':'')+'"><div class="multi-avatar frame-'+(p.frame||'none')+'">'+pic+'</div><p class="multi-name">'+this.esc(p.username)+'</p><span class="status-pill '+(p.ready?'online':'offline')+'">'+(p.ready?'✅ LISTO':'⏳ esperando')+'</span>'+(p.userId===me?'<span class="mini-badge">TÚ</span>':'')+'</div>';
    }).join('');
  }
  const cb=document.getElementById('multiChatBox');
  if(cb){
    cb.innerHTML=chat.length?chat.map(m=>{
      if(m.userId==='sys') return '<div class="chat-msg sys"><div class="chat-text">🤖 '+this.esc(m.text)+'</div></div>';
      let body=this.esc(m.text);
      if(m.text.startsWith('[sticker]')) body='<div class="chat-sticker">'+this.esc(m.text.slice(9,20))+'</div>';
      return '<div class="chat-msg"><div class="chat-body"><div class="chat-head"><span class="chat-user">'+this.esc(m.username)+'</span></div><div class="chat-text">'+body+'</div></div></div>';
    }).join(''):'<p class="hint">Sin mensajes. ¡Saluda! 👋</p>';
    cb.scrollTop=cb.scrollHeight;
  }
  if(!match){ this.show('lobby'); this.lastKey=''; return; }
  if(match.status==='playing'){
    this.show('battle');
    const my=match.players.find(p=>p.userId===me);
    if(my) document.getElementById('multiWaveBanner').textContent='⚔️ '+(my.desc||('HORNADA '+my.wave))+(my.alive?'':' · 💀 ELIMINADO');
    const cols=document.getElementById('multiColumns');
    const key=match.players.map(p=>p.userId+':'+p.wave+':'+p.alive+':'+p.enemies.length+':'+p.hits).join('|');
    if(force||key!==this.lastKey){
      this.lastKey=key;
      cols.innerHTML=match.players.map(p=>{
        const isMe=p.userId===me;
        const pic=p.profilePic?'<img src="'+p.profilePic.replace(/"/g,'&quot;')+'" alt="">':'<span>👾</span>';
        const pct=p.timeTotal?Math.min(100,Math.max(0,(1-p.timeLeft/p.timeTotal)*100)):0;
        const ens=p.enemies.map(e=>'<div class="multi-enemy cat-'+e.cat+'"><span class="enemy-cat" style="background:'+this.catColor(e.cat)+'">'+e.cat+'</span><span class="enemy-q">'+this.esc(e.q)+'</span><span class="enemy-a">'+this.esc(e.a)+'</span></div>').join('')||'<p class="hint">¡Oleada superada!</p>';
        return '<div class="multi-col'+(isMe?' me':'')+(!p.alive?' dead':'')+'"><div class="multi-col-head"><div class="multi-avatar small frame-'+(p.frame||'none')+'">'+pic+'</div><div><p class="multi-name">'+this.esc(p.username)+(isMe?' (TÚ)':'')+'</p><p class="hint">Oleada '+p.wave+' · 🔥'+p.streak+' · ✅'+p.hits+' ❌'+p.misses+'</p></div>'+(!p.alive?'<span class="dead-tag">💀</span>':'')+'</div><div class="multi-timer"><div class="multi-timer-fill" style="width:'+pct+'%"></div></div>'+(p.alive?'<p class="hint">⏱ '+p.timeLeft+'s</p>':'<p class="hint">Eliminado en oleada '+p.wave+'</p>')+'<div class="multi-enemies">'+ens+'</div><div class="multi-ship">'+(p.alive?'🚀':'💥')+'</div></div>';
      }).join('');
    } else {
      match.players.forEach(p=>{
        const idx=match.players.indexOf(p);
        const col=cols.children[idx]; if(!col) return;
        const pct=p.timeTotal?Math.min(100,Math.max(0,(1-p.timeLeft/p.timeTotal)*100)):0;
        const f=col.querySelector('.multi-timer-fill'); if(f) f.style.width=pct+'%';
      });
    }
    const ai=document.getElementById('multiAnswer');
    if(my&&!my.alive&&ai){ ai.disabled=true; ai.placeholder='💀 Eliminado... esperando final'; }
    else if(ai){ ai.disabled=false; ai.placeholder='Escribe la etiqueta para disparar... (Enter)'; }
  } else if(match.status==='finished'){
    this.show('results');
    const arr=[...match.players].sort((a,b)=>(b.wave-a.wave)||(b.hits-a.hits)||(a.misses-b.misses));
    document.getElementById('multiTable').innerHTML='<div class="multi-table">'+arr.map((p,i)=>{
      const medal=i===0?'🥇':(i===1?'🥈':(i===2?'🥉':(i+1)+'°'));
      const pic=p.profilePic?'<img src="'+p.profilePic.replace(/"/g,'&quot;')+'" alt="">':'<span>👾</span>';
      return '<div class="multi-row'+(i===0?' winner':'')+'"><span class="multi-pos">'+medal+'</span><div class="multi-avatar small frame-'+(p.frame||'none')+'">'+pic+'</div><span class="multi-name">'+this.esc(p.username)+'</span><span class="mini-badge">🔥 racha '+p.best+'</span><span class="mini-badge">✅ '+p.hits+'</span><span class="mini-badge">❌ '+p.misses+'</span><span class="mini-badge">🌊 '+p.wave+'</span><span class="mini-badge">+'+(p.expWon||0)+' EXP · +'+(p.coinsWon||0)+' pts</span></div>';
    }).join('')+'</div>';
    this.ready=false;
    const rb=document.getElementById('multiReadyBtn'); if(rb) rb.textContent='✅ ¡LISTO!';
  }
 },
 async sendChat(){
  const i=document.getElementById('multiChatInput'); const t=(i.value||'').trim(); if(!t) return;
  try{ await API.multiChatSend(t); i.value=''; this.poll(true); }catch(e){ Toast.error(e.message); }
 },
 async sendAnswer(){
  const i=document.getElementById('multiAnswer'); const t=(i.value||'').trim(); if(!t) return;
  const fb=document.getElementById('multiFeedback');
  try{
    const r=await API.multiAnswer(t);
    if(r.hit){ fb.textContent='💥 ¡Destruido! Oleada '+r.wave+' · racha '+r.streak; fb.style.color='#00e676'; if(r.waveUp) Toast.success('¡Hornada superada! Oleada '+r.wave); }
    else { fb.textContent='❌ Fallo ('+r.misses+')'; fb.style.color='#ff5252'; }
    i.value=''; this.poll(true);
  }catch(e){ fb.textContent='💀 '+(e.message||'Error'); fb.style.color='#ff5252'; this.poll(true); }
 }
};
document.addEventListener('DOMContentLoaded',()=>MultiUI.init());
