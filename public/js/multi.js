const MultiSkins=[{id:'default',body:'#00e5ff',accent:'#80d8ff',glow:'#00e5ff'},{id:'crimson',body:'#ff1744',accent:'#ff8a80',glow:'#ff5252'},{id:'gold',body:'#ffd600',accent:'#fff176',glow:'#ffea00'},{id:'neon',body:'#00e676',accent:'#69f0ae',glow:'#00e676'},{id:'violet',body:'#7c4dff',accent:'#b388ff',glow:'#7c4dff'},{id:'pixel',body:'#ff6d00',accent:'#ffab40',glow:'#ff6d00'},{id:'ocean',body:'#2196f3',accent:'#82b4ff',glow:'#2196f3'},{id:'rosa',body:'#ff4081',accent:'#ff8a80',glow:'#ff4081'},{id:'lima',body:'#c6ff00',accent:'#eaff8a',glow:'#c6ff00'},{id:'ghost',body:'#eceff1',accent:'#ffffff',glow:'#eceff1'},{id:'camo',body:'#7c9a3f',accent:'#b2d67c',glow:'#7c9a3f'},{id:'magma',body:'#ff3d00',accent:'#ff8a65',glow:'#ff3d00'},{id:'ice',body:'#80d8ff',accent:'#e1f5fe',glow:'#80d8ff'},{id:'nebula',body:'#e040fb',accent:'#ea80fc',glow:'#e040fb'},{id:'solar',body:'#fff176',accent:'#fff9c4',glow:'#ffd600'},{id:'platinum',body:'#cfd8dc',accent:'#ffffff',glow:'#cfd8dc'},{id:'obsidian',body:'#1a1a2e',accent:'#5c6bc0',glow:'#ff1744'},{id:'diamond',body:'#b3ffff',accent:'#ffffff',glow:'#b3ffff'},{id:'tournament_silver',body:'#c0c0c0',accent:'#e0e0e0',glow:'#e0e0e0'}];
const MultiUI={
 open:false, timer:null, ready:false, lastKey:'', fetching:false, failCount:0, picCache:{},
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
  this.failCount=0;
  this.poll(true);
  if(this.timer) clearInterval(this.timer);
  this.timer=setInterval(()=>this.poll(),3000);
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
 skinById(id){ return MultiSkins.find(s=>s.id===id)||MultiSkins[0]; },
 shipHtml(skinId, alive){
  if(!alive) return '<div class="multi-ship dead">💥</div>';
  const sk=this.skinById(skinId||'default');
  return '<div class="multi-ship alive" title="'+this.esc(skinId||'default')+'"><svg width="44" height="38" viewBox="-22 -22 44 44" style="filter:drop-shadow(0 0 8px '+sk.glow+')"><path d="M0,-22 L-20,18 L-7,10 L0,16 L7,10 L20,18 Z" fill="'+sk.body+'" stroke="rgba(255,255,255,.85)" stroke-width="1.2"/><circle cx="0" cy="-4" r="4.5" fill="'+sk.accent+'" stroke="#fff" stroke-width=".8"/><path d="M-6,14 L0,22 L6,14 Z" fill="#ff6d00" opacity=".95"/></svg></div>';
 },
 picHtml(p){
  if(p.profilePic) this.picCache[p.userId]=p.profilePic;
  const src=p.profilePic||this.picCache[p.userId]||'';
  const pic=src?'<img src="'+src.replace(/"/g,'&quot;')+'" loading="lazy" alt="">':'<span>👾</span>';
  return pic;
 },
 async poll(force){
  if(!this.open||this.fetching) return;
  this.fetching=true;
  let d; try{ d=await API.multiState(); this.failCount=0; }catch(e){ this.fetching=false; this.failCount=(this.failCount||0)+1; if(this.failCount===2) Toast.error('Internet lento... reintentando'); return; }
  this.fetching=false;
  const me=d.me;
  const lobby=d.lobby||[]; const match=d.match; const chat=d.chat||[];
  const lp=document.getElementById('multiPlayers');
  if(lp){
    if(!lobby.length) lp.innerHTML='<p class="hint empty-hint">Lobby vacío. ¡Invita a tus amigos!</p>';
    else lp.innerHTML=lobby.map(p=>{
      const pic=this.picHtml(p);
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
        const pic=this.picHtml(p);
        const pct=p.timeTotal?Math.min(100,Math.max(0,(1-p.timeLeft/p.timeTotal)*100)):0;
        const ens=p.enemies.map(e=>'<div class="multi-enemy ship cat-'+e.cat+'" title="'+this.esc(e.q)+' → '+this.esc(e.a)+'"><span class="ship-cat" style="background:'+this.catColor(e.cat)+'">'+e.cat+'</span><span class="ship-q">'+this.esc(e.q)+'</span><span class="ship-a">'+this.esc(e.a)+'</span></div>').join('')||'<p class="hint">¡Oleada superada!</p>';
        return '<div class="multi-col'+(isMe?' me':'')+(!p.alive?' dead':'')+'"><div class="multi-col-head"><div class="multi-avatar small frame-'+(p.frame||'none')+'">'+pic+'</div><div><p class="multi-name">'+this.esc(p.username)+(isMe?' (TÚ)':'')+'</p><p class="hint">Oleada '+p.wave+' · 🔥'+p.streak+' · ✅'+p.hits+' ❌'+p.misses+'</p></div>'+(!p.alive?'<span class="dead-tag">💀</span>':'')+'</div><div class="multi-timer"><div class="multi-timer-fill" style="width:'+pct+'%"></div></div>'+(p.alive?'<p class="hint">⏱ '+p.timeLeft+'s</p>':'<p class="hint">Eliminado en oleada '+p.wave+'</p>')+'<div class="multi-enemies">'+ens+'</div>'+this.shipHtml(p.skin,p.alive)+'</div>';
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
      const pic=this.picHtml(p);
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
  if(this.sending) return;
  const i=document.getElementById('multiAnswer'); const t=(i.value||'').trim(); if(!t) return;
  const fb=document.getElementById('multiFeedback');
  i.value=''; this.sending=true;
  try{
    const r=await API.multiAnswer(t);
    if(r.hit){ fb.textContent='💥 ¡Destruido! Oleada '+r.wave+' · racha '+r.streak; fb.style.color='#00e676'; if(r.waveUp) Toast.success('¡Hornada superada! Oleada '+r.wave); }
    else { fb.textContent='❌ Fallo ('+r.misses+')'; fb.style.color='#ff5252'; }
    this.poll(true);
  }catch(e){ fb.textContent='💀 '+(e.message||'Error'); fb.style.color='#ff5252'; this.poll(true); }
  finally{ this.sending=false; const ai=document.getElementById('multiAnswer'); if(ai&&!ai.disabled) ai.focus(); }
 }
};
document.addEventListener('DOMContentLoaded',()=>MultiUI.init());
