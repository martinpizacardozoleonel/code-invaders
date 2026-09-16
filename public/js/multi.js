const MultiSkins=[{id:'default',body:'#00e5ff',accent:'#80d8ff',glow:'#00e5ff'},{id:'crimson',body:'#ff1744',accent:'#ff8a80',glow:'#ff5252'},{id:'gold',body:'#ffd600',accent:'#fff176',glow:'#ffea00'},{id:'neon',body:'#00e676',accent:'#69f0ae',glow:'#00e676'},{id:'violet',body:'#7c4dff',accent:'#b388ff',glow:'#7c4dff'},{id:'pixel',body:'#ff6d00',accent:'#ffab40',glow:'#ff6d00'},{id:'ocean',body:'#2196f3',accent:'#82b4ff',glow:'#2196f3'},{id:'rosa',body:'#ff4081',accent:'#ff8a80',glow:'#ff4081'},{id:'lima',body:'#c6ff00',accent:'#eaff8a',glow:'#c6ff00'},{id:'ghost',body:'#eceff1',accent:'#ffffff',glow:'#eceff1'},{id:'camo',body:'#7c9a3f',accent:'#b2d67c',glow:'#7c9a3f'},{id:'magma',body:'#ff3d00',accent:'#ff8a65',glow:'#ff3d00'},{id:'ice',body:'#80d8ff',accent:'#e1f5fe',glow:'#80d8ff'},{id:'nebula',body:'#e040fb',accent:'#ea80fc',glow:'#e040fb'},{id:'solar',body:'#fff176',accent:'#fff9c4',glow:'#ffd600'},{id:'platinum',body:'#cfd8dc',accent:'#ffffff',glow:'#cfd8dc'},{id:'obsidian',body:'#1a1a2e',accent:'#5c6bc0',glow:'#ff1744'},{id:'diamond',body:'#b3ffff',accent:'#ffffff',glow:'#b3ffff'},{id:'tournament_silver',body:'#c0c0c0',accent:'#e0e0e0',glow:'#e0e0e0'}];
const MultiUI={
 open:false, timer:null, ready:false, mode:'normal', view:'rooms', currentRoom:null, rooms:[], lastKey:'', fetching:false, roomsFetching:false, lastRoomsAt:0, failCount:0, picCache:{}, seenShots:{}, lastMatchId:null, createIsPublic:true, createMode:'normal', createMax:4,
 init(){
  const mb=document.getElementById('multiBtn'); if(mb) mb.addEventListener('click',()=>this.openLobby());
  const mn=document.getElementById('multiModeNormalBtn'); if(mn) mn.addEventListener('click',()=>this.setRoomMode('normal'));
  const ms=document.getElementById('multiModeSpeedrunBtn'); if(ms) ms.addEventListener('click',()=>this.setRoomMode('speedrun'));
  const cb=document.getElementById('multiCloseBtn'); if(cb) cb.addEventListener('click',()=>this.close());
  const cb2=document.getElementById('multiCloseBtn2'); if(cb2) cb2.addEventListener('click',()=>this.close());
  const rbk=document.getElementById('multiRoomsBackBtn'); if(rbk) rbk.addEventListener('click',()=>this.close());
  const back=document.getElementById('multiBackBtn'); if(back) back.addEventListener('click',()=>this.backToRooms());
  const rb=document.getElementById('multiReadyBtn'); if(rb) rb.addEventListener('click',()=>this.toggleReady());
  const lv=document.getElementById('multiLeaveBtn'); if(lv) lv.addEventListener('click',()=>this.leave());
  const cs=document.getElementById('multiChatSend'); if(cs) cs.addEventListener('click',()=>this.sendChat());
  const ci=document.getElementById('multiChatInput'); if(ci) ci.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sendChat(); }});
  const ab=document.getElementById('multiAnswerBtn'); if(ab) ab.addEventListener('click',()=>this.sendAnswer());
  const ai=document.getElementById('multiAnswer'); if(ai) ai.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sendAnswer(); }});
  const ex=document.getElementById('multiExitBtn'); if(ex) ex.addEventListener('click',()=>{ if(confirm('¿Abandonar la partida? Perderás la racha.')) this.leave(); });
  const st=document.getElementById('multiStayBtn'); if(st) st.addEventListener('click',async()=>{ this.ready=false; try{ await API.multiReady(false); }catch(e){} this.show('lobby'); this.poll(true); });
  const qt=document.getElementById('multiQuitBtn'); if(qt) qt.addEventListener('click',()=>this.leave());
  const cr=document.getElementById('multiCreateBtn'); if(cr) cr.addEventListener('click',()=>this.createRoom());
  const rn=document.getElementById('multiRoomName'); if(rn) rn.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.createRoom(); }});
  const sw=document.getElementById('multiPublicSwitch'); if(sw) sw.addEventListener('click',()=>this.toggleCreatePublic());
  const cn=document.getElementById('multiCreateNormalBtn'); if(cn) cn.addEventListener('click',()=>this.setCreateMode('normal'));
  const csp=document.getElementById('multiCreateSpeedrunBtn'); if(csp) csp.addEventListener('click',()=>this.setCreateMode('speedrun'));
  const mx=document.getElementById('multiMaxPick'); if(mx) mx.querySelectorAll('[data-max]').forEach(b=>b.addEventListener('click',()=>this.setCreateMax(b.dataset.max)));
  const jb=document.getElementById('multiJoinCodeBtn'); if(jb) jb.addEventListener('click',()=>this.joinByCode());
  const ji=document.getElementById('multiJoinCode'); if(ji) ji.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.joinByCode(); }});
  const sb=document.getElementById('multiRoomSearchBtn'); if(sb) sb.addEventListener('click',()=>this.loadRooms(true));
  const si=document.getElementById('multiRoomSearch'); if(si) si.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.loadRooms(true); }});
  const rsw=document.getElementById('multiRoomPublicSwitch'); if(rsw) rsw.addEventListener('click',()=>this.toggleRoomPublic());
  const ccb=document.getElementById('multiCopyCodeBtn'); if(ccb) ccb.addEventListener('click',()=>this.copyCode());
 },
 toggleCreatePublic(){
  this.createIsPublic=!this.createIsPublic;
  const tr=document.getElementById('multiPublicTrack'), lb=document.getElementById('multiPublicLabel'), hint=document.getElementById('multiPublicHint'), sw=document.getElementById('multiPublicSwitch');
  if(tr) tr.classList.toggle('on',this.createIsPublic);
  if(lb) lb.textContent=this.createIsPublic?'🌍 Pública':'🔒 Privada';
  if(sw) sw.setAttribute('aria-checked',this.createIsPublic?'true':'false');
  if(hint) hint.textContent=this.createIsPublic?'Pública: aparece en el buscador y cualquiera se une con 1 click.':'Privada: NO aparece para unirse con click, se genera un código que solo el creador comparte.';
 },
 setCreateMode(m){
  this.createMode=(m==='speedrun')?'speedrun':'normal';
  const cn=document.getElementById('multiCreateNormalBtn'), cs=document.getElementById('multiCreateSpeedrunBtn');
  if(cn) cn.classList.toggle('active',this.createMode==='normal');
  if(cs) cs.classList.toggle('active',this.createMode==='speedrun');
 },
 setCreateMax(m){
  m=Math.min(4,Math.max(2,Math.round(Number(m)||4)));
  this.createMax=m;
  const mx=document.getElementById('multiMaxPick');
  if(mx) mx.querySelectorAll('[data-max]').forEach(b=>b.classList.toggle('active',Number(b.dataset.max)===m));
 },
 setMode(m){
  this.mode=(m==='speedrun')?'speedrun':'normal';
  const mn=document.getElementById('multiModeNormalBtn'), ms=document.getElementById('multiModeSpeedrunBtn'), hint=document.getElementById('multiModeHint');
  if(mn) mn.classList.toggle('active',this.mode==='normal');
  if(ms) ms.classList.toggle('active',this.mode==='speedrun');
  if(hint) hint.innerHTML='Modo multi: <b>'+(this.mode==='speedrun'?'⚡ SPEEDRUN':'▶ JUGAR')+'</b>';
 },
 async setRoomMode(m){
  const want=(m==='speedrun')?'speedrun':'normal';
  if(!this.currentRoom){ this.setMode(want); return; }
  if(!this.currentRoom.isOwner){ Toast.info('Solo el creador puede cambiar el modo'); this.setMode(this.currentRoom.mode||'normal'); return; }
  this.setMode(want);
  try{ const r=await API.multiUpdateRoom({mode:want}); if(r&&r.room){ this.currentRoom=r.room; this.setMode(r.room.mode); } }catch(e){ Toast.error(e.message); }
  this.poll(true);
 },
 async toggleRoomPublic(){
  if(!this.currentRoom){ return; }
  if(!this.currentRoom.isOwner){ Toast.info('Solo el creador puede cambiar la privacidad'); return; }
  const want=!this.currentRoom.isPublic;
  try{ const r=await API.multiUpdateRoom({isPublic:want}); if(r&&r.room){ this.currentRoom=r.room; this.renderRoomHeader(); Toast.success(want?'🌍 Sala pública':'🔒 Sala privada'); } }catch(e){ Toast.error(e.message); }
  this.poll(true);
 },
 copyCode(){
  const i=document.getElementById('multiCodeInput');
  const code=(i&&i.value)||(this.currentRoom&&this.currentRoom.code)||'';
  if(!code){ Toast.info('Esta sala es pública, no tiene código'); return; }
  const done=()=>Toast.success('📋 Código copiado: '+code);
  try{
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done).catch(()=>{ i.select(); document.execCommand('copy'); done(); });
    else { i.select(); document.execCommand('copy'); done(); }
  }catch(e){ try{ i.select(); document.execCommand('copy'); done(); }catch(ee){ Toast.info('Código: '+code); } }
 },
 async createRoom(){
  const inp=document.getElementById('multiRoomName');
  const name=(inp?inp.value:'').trim();
  if(name.length<3){ Toast.error('Poné un nombre de 3+ letras'); if(inp) inp.focus(); return; }
  const btn=document.getElementById('multiCreateBtn');
  if(btn){ btn.disabled=true; btn.textContent='Creando...'; }
  try{
    const r=await API.multiCreateRoom(name,this.createIsPublic,this.createMode,this.createMax);
    if(inp) inp.value='';
    this.currentRoom=r.room; this.ready=false; this.setMode(r.room.mode||'normal');
    this.show('lobby'); this.poll(true);
    Toast.success((r.room.isPublic?'🌍 Sala pública creada: ':'🔒 Sala privada creada: ')+r.room.name);
  }catch(e){ Toast.error(e.message); }
  finally{ if(btn){ btn.disabled=false; btn.textContent='➕ Crear y entrar'; } }
 },
 async joinRoom(roomId,isPublic){
  if(!isPublic){ Toast.info('🔒 Sala privada: pedí el código al creador e ingresalo arriba'); const ji=document.getElementById('multiJoinCode'); if(ji) ji.focus(); return; }
  try{ const r=await API.multiJoinRoom(roomId,''); this.currentRoom=r.room; this.ready=false; this.setMode(r.room.mode||'normal'); this.show('lobby'); this.poll(true); Toast.success('Entraste a '+r.room.name); }
  catch(e){ Toast.error(e.message); }
 },
 async joinByCode(){
  const inp=document.getElementById('multiJoinCode');
  const code=(inp?inp.value:'').trim().toUpperCase();
  if(!code){ Toast.error('Pegá el código de la sala privada'); return; }
  try{ const r=await API.multiJoinRoom('',code); if(inp) inp.value=''; this.currentRoom=r.room; this.ready=false; this.setMode(r.room.mode||'normal'); this.show('lobby'); this.poll(true); Toast.success('Entraste a '+r.room.name); }
  catch(e){ Toast.error(e.message); }
 },
 async loadRooms(force){
  if(this.roomsFetching) return;
  const now=Date.now();
  if(!force && now-this.lastRoomsAt<2500) return;
  this.roomsFetching=true;
  try{
    const q=(document.getElementById('multiRoomSearch')||{}).value||'';
    const d=await API.multiRooms(q.trim());
    this.rooms=d.rooms||[]; this.lastRoomsAt=Date.now();
    this.renderRooms();
  }catch(e){ const l=document.getElementById('multiRoomsList'); if(l&&!this.rooms.length) l.innerHTML='<p class="hint">Sin conexión... reintentando</p>'; }
  finally{ this.roomsFetching=false; }
 },
 renderRooms(){
  const box=document.getElementById('multiRoomsList'); if(!box) return;
  if(!this.rooms.length){ box.innerHTML='<p class="hint empty-hint">📭 Sin salas. ¡Creá la tuya arriba! 👆</p>'; return; }
  box.innerHTML=this.rooms.map(r=>{
    const pub=!!r.isPublic;
    const mx=r.maxPlayers||4;
    const full=(r.players||0)>=mx;
    const modeBadge=(r.mode==='speedrun')?'<span class="mini-badge">⚡ SPEEDRUN</span>':'<span class="mini-badge">▶ JUGAR</span>';
    const privBadge=pub?'<span class="mini-badge">🌍 Pública</span>':'<span class="mini-badge">🔒 Privada</span>';
    const st=r.status==='playing'?'<span class="mini-badge">⚔️ en batalla</span>':'<span class="mini-badge">🟢 lobby</span>';
    const capBadge='<span class="mini-badge">👥 '+r.players+'/'+mx+'</span>';
    let btn;
    if(!pub) btn='<button class="btn btn-ghost btn-sm" data-priv="'+r.id+'" title="Sala privada: necesitás el código">🔒 Privada</button>';
    else if(full) btn='<button class="btn btn-ghost btn-sm" disabled title="Sala llena">🚫 Llena</button>';
    else btn='<button class="btn btn-primary btn-sm" data-join="'+r.id+'">Unirse</button>';
    return '<div class="multi-room"><div class="multi-room-info"><p class="multi-name">'+this.esc(r.name)+'</p><p class="hint">👑 '+this.esc(r.ownerName||'?')+' · '+capBadge+' '+privBadge+' '+modeBadge+' '+st+'</p></div>'+btn+'</div>';
  }).join('');
  box.querySelectorAll('[data-join]').forEach(b=>b.addEventListener('click',()=>this.joinRoom(b.dataset.join,true)));
  box.querySelectorAll('[data-priv]').forEach(b=>b.addEventListener('click',()=>this.joinRoom(b.dataset.priv,false)));
 },
 renderRoomHeader(){
  const r=this.currentRoom; if(!r) return;
  const t=document.getElementById('multiRoomTitle');
  if(t) t.innerHTML='🚀 '+this.esc(r.name||'LOBBY')+' · '+(r.isPublic?'🌍 Pública':'🔒 Privada')+' · '+((r.mode==='speedrun')?'⚡ SPEEDRUN':'▶ JUGAR')+' · 👥 '+(r.players!=null?r.players:'?')+'/'+(r.maxPlayers||4)+' · 👑 '+this.esc(r.ownerName||'');
  const bar=document.getElementById('multiOwnerBar');
  if(bar) bar.classList.toggle('hidden',!r.isOwner);
  const sw=document.getElementById('multiRoomPublicSwitch'), tr=document.getElementById('multiRoomPublicTrack'), lb=document.getElementById('multiRoomPublicLabel');
  if(tr) tr.classList.toggle('on',!!r.isPublic);
  if(lb) lb.textContent=r.isPublic?'🌍 Pública':'🔒 Privada';
  if(sw) sw.setAttribute('aria-checked',r.isPublic?'true':'false');
  const codeBox=document.getElementById('multiCodeBox'), codeInp=document.getElementById('multiCodeInput');
  const showCode=!!(r.isOwner&&!r.isPublic&&r.code);
  if(codeBox) codeBox.classList.toggle('hidden',!showCode);
  if(codeInp&&showCode) codeInp.value=r.code||'';
  this.setMode(r.mode||'normal');
 },
 async openLobby(){
  if(typeof Auth==='undefined'||!Auth.isLogged){ Toast.info('Inicia sesión para jugar online'); return; }
  document.getElementById('multiOverlay').classList.remove('hidden');
  this.open=true; this.ready=false; this.currentRoom=null; this.lastKey=''; this.seenShots={}; this.lastMatchId=null;
  this.setMode(this.mode||'normal');
  this.show('rooms');
  this.failCount=0;
  await this.loadRooms(true);
  this.poll(true);
  if(this.timer) clearInterval(this.timer);
  this.timer=setInterval(()=>this.poll(),1500);
 },
 async backToRooms(){
  try{ await API.multiLeave(); }catch(e){}
  this.ready=false; this.currentRoom=null; this.lastKey=''; this.seenShots={}; this.lastMatchId=null;
  const rb=document.getElementById('multiReadyBtn'); if(rb) rb.textContent='✅ ¡LISTO!';
  this.show('rooms');
  this.loadRooms(true);
  this.poll(true);
 },
 close(){
  document.getElementById('multiOverlay').classList.add('hidden');
  this.open=false;
  if(this.timer){ clearInterval(this.timer); this.timer=null; }
 },
 async leave(){
  try{ await API.multiLeave(); }catch(e){}
  this.ready=false; this.currentRoom=null;
  const rb=document.getElementById('multiReadyBtn'); if(rb) rb.textContent='✅ ¡LISTO!';
  this.show('rooms');
  this.loadRooms(true);
 },
  async toggleReady(){
   this.ready=!this.ready;
   const btn=document.getElementById('multiReadyBtn');
   if(btn){ btn.textContent=this.ready?'⏳ Cancelar listo':'✅ ¡LISTO!'; btn.disabled=true; }
   try{ await API.multiReady(this.ready); }catch(e){ this.ready=!this.ready; if(btn) btn.textContent=this.ready?'⏳ Cancelar listo':'✅ ¡LISTO!'; Toast.error(e.message); if(btn) btn.disabled=false; return; }
   if(btn) btn.disabled=false;
   this.poll(true);
  },
 show(which){
  this.view=which;
  ['multiRooms','multiLobby','multiBattle','multiResults'].forEach(id=>{ const el=document.getElementById(id); if(el) el.classList.add('hidden'); });
  if(which==='rooms'){ const el=document.getElementById('multiRooms'); if(el) el.classList.remove('hidden'); }
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
 picFetching:{},
 picHtml(p){
  if(p.profilePic) this.picCache[p.userId]=p.profilePic;
  if(!this.picCache[p.userId]){
    try{
      const meId=(typeof Auth!=='undefined'&&Auth.user&&Auth.user.id)||null;
      if(p.userId===meId){
        const own=(typeof Auth!=='undefined'&&Auth.user&&Auth.user.profilePic)||(typeof Profile!=='undefined'&&Profile.user&&Profile.user.profilePic)||'';
        if(own) this.picCache[p.userId]=own;
      }
    }catch(e){}
  }
  const src=p.profilePic||this.picCache[p.userId]||'';
  if(!src&&(p.hasPic)&&p.userId&&!this.picFetching[p.userId]){
    this.picFetching[p.userId]=1;
    fetch('/api/user/'+encodeURIComponent(p.userId)).then(r=>r.json()).then(u=>{
      if(u&&u.profilePic){ this.picCache[p.userId]=u.profilePic;
        document.querySelectorAll('.multi-avatar[data-pic="'+p.userId+'"]').forEach(av=>{ av.innerHTML='<img src="'+u.profilePic.replace(/"/g,'&quot;')+'" loading="lazy" alt="">'; });
      }
    }).catch(()=>{}).finally(()=>{ delete this.picFetching[p.userId]; });
  }
  const pic=src?'<img src="'+src.replace(/"/g,'&quot;')+'" loading="lazy" alt="">':'<span>👾</span>';
  return pic;
 },
 async poll(force){
  if(!this.open||this.fetching) return;
  this.fetching=true;
  let d; try{ d=await API.multiState(); this.failCount=0; }catch(e){ this.fetching=false; this.failCount=(this.failCount||0)+1; if(this.failCount===2) Toast.error('Internet lento... reintentando'); return; }
  this.fetching=false;
  if(!d.room){
    this.currentRoom=null;
    if(this.view!=='rooms') this.show('rooms');
    this.loadRooms(force===true);
    return;
  }
  this.currentRoom=d.room;
  this.renderRoomHeader();
  const me=d.me;
  const lobby=d.lobby||[]; const match=d.match; const chat=d.chat||[];
  const lp=document.getElementById('multiPlayers');
  if(lp){
    if(!lobby.length) lp.innerHTML='<p class="hint empty-hint">🚀 Sala vacía. ¡Compartí el nombre o el código e invita a tu escuadrón!</p>';
    else lp.innerHTML=lobby.map(p=>{
      const pic=this.picHtml(p);
      return '<div class="multi-player'+(p.ready?' is-ready':'')+'"><div class="multi-avatar frame-'+(p.frame||'none')+'" data-pic="'+p.userId+'">'+pic+'</div><p class="multi-name">'+this.esc(p.username)+'</p><span class="status-pill '+(p.ready?'online':'offline')+'">'+(p.ready?'✅ LISTO':'⏳ esperando')+'</span>'+(p.userId===me?'<span class="mini-badge">TÚ</span>':'')+((d.room&&d.room.ownerId===p.userId)?'<span class="mini-badge">👑 CREADOR</span>':'')+'</div>';
    }).join('');
  }
  const cb=document.getElementById('multiChatBox');
  if(cb){
    cb.innerHTML=chat.length?chat.map(m=>{
      if(m.userId==='sys') return '<div class="chat-msg sys"><div class="chat-text">🤖 '+this.esc(m.text)+'</div></div>';
      let body=this.esc(m.text);
      if(m.text.startsWith('[sticker]')) body='<div class="chat-sticker">'+this.esc(m.text.slice(9,20))+'</div>';
      const bub=(m.equippedBubble&&m.equippedBubble!=='none')?' chat-bubble-wrap bubble-'+m.equippedBubble:'';
      return '<div class="chat-msg"><div class="chat-body"><div class="chat-head"><span class="chat-user" style="color:'+this.esc(m.nameColor||'#00e5ff')+'">'+this.esc(m.username)+'</span></div><div class="chat-text'+bub+'">'+body+'</div></div></div>';
    }).join(''):'<p class="hint">Sin mensajes. ¡Saluda! 👋</p>';
    cb.scrollTop=cb.scrollHeight;
  }
  if(!match){ this.show('lobby'); this.lastKey=''; this.seenShots={}; this.lastMatchId=null; return; }
  if(match.status==='playing'){
    if(this.lastMatchId!==match.id){ this.lastMatchId=match.id; this.seenShots={}; (match.shots||[]).forEach(s=>this.seenShots[s.id]=1); }
    this.show('battle');
    const my=match.players.find(p=>p.userId===me);
    if(my) document.getElementById('multiWaveBanner').textContent=((d.room&&d.room.mode==='speedrun')?'⚡ SPEEDRUN · ':'⚔️ ')+(my.desc||('HORNADA '+my.wave))+(my.alive?'':' · 💀 ELIMINADO');
    const cols=document.getElementById('multiColumns');
    const key=match.players.map(p=>p.userId+':'+p.wave+':'+p.alive+':'+(p.lives==null?2:p.lives)+':'+p.enemies.length+':'+p.hits+':'+p.misses).join('|');
    if(force||key!==this.lastKey){
      this.lastKey=key;
      cols.innerHTML=match.players.map(p=>{
        const isMe=p.userId===me;
        const pic=this.picHtml(p);
        const lives=(p.lives==null?2:p.lives);
        const hearts=lives>1?'❤️❤️':(lives===1?'❤️🤍':'🤍🤍');
        const pct=p.timeTotal?Math.min(100,Math.max(0,(1-p.timeLeft/p.timeTotal)*100)):0;
        const ens=p.enemies.map(e=>'<div class="multi-enemy ship cat-'+e.cat+'" data-q="'+this.esc(e.q)+'" title="'+this.esc(e.q)+'"><span class="ship-cat" style="background:'+this.catColor(e.cat)+'">'+e.cat+'</span><span class="ship-q">'+this.esc(e.q)+'</span><span class="ship-type">⌨️ escribe la etiqueta</span></div>').join('')||'<p class="hint">¡Oleada superada!</p>';
        return '<div class="multi-col'+(isMe?' me':'')+(!p.alive?' dead':'')+'" data-uid="'+p.userId+'"><div class="multi-col-head"><div class="multi-avatar small frame-'+(p.frame||'none')+'" data-pic="'+p.userId+'">'+pic+'</div><div><p class="multi-name">'+this.esc(p.username)+(isMe?' (TÚ)':'')+'</p><p class="hint">Oleada '+p.wave+' · <span class="lives">'+hearts+'</span> · 🔥'+p.streak+' · ✅'+p.hits+' ❌'+p.misses+'</p></div>'+(!p.alive?'<span class="dead-tag">💀</span>':'')+'</div><div class="multi-timer"><div class="multi-timer-fill" style="width:'+pct+'%"></div></div>'+(p.alive?'<p class="hint">⏱ '+p.timeLeft+'s · '+hearts+' '+lives+'/2 vidas</p>':'<p class="hint">Eliminado en oleada '+p.wave+'</p>')+'<div class="multi-enemies">'+ens+'</div>'+this.shipHtml(p.skin,p.alive)+'</div>';
      }).join('');
    } else {
      match.players.forEach(p=>{
        const idx=match.players.indexOf(p);
        const col=cols.children[idx]; if(!col) return;
        const pct=p.timeTotal?Math.min(100,Math.max(0,(1-p.timeLeft/p.timeTotal)*100)):0;
        const f=col.querySelector('.multi-timer-fill'); if(f) f.style.width=pct+'%';
      });
    }
    this.showRemoteShots(match,me);
    const ai=document.getElementById('multiAnswer');
    if(my&&!my.alive&&ai){ ai.disabled=true; ai.placeholder='💀 Eliminado... esperando final'; }
    else if(ai){ ai.disabled=false; ai.placeholder='Escribe la etiqueta para disparar... (Enter)'; }
  } else if(match.status==='finished'){
    this.show('results');
    const arr=[...match.players].sort((a,b)=>(b.wave-a.wave)||(b.hits-a.hits)||(a.misses-b.misses));
    document.getElementById('multiTable').innerHTML='<div class="multi-table">'+arr.map((p,i)=>{
      const medal=i===0?'🥇':(i===1?'🥈':(i===2?'🥉':(i+1)+'°'));
      const pic=this.picHtml(p);
      return '<div class="multi-row'+(i===0?' winner':'')+'"><span class="multi-pos">'+medal+'</span><div class="multi-avatar small frame-'+(p.frame||'none')+'" data-pic="'+p.userId+'">'+pic+'</div><span class="multi-name">'+this.esc(p.username)+'</span><span class="mini-badge">🔥 racha '+p.best+'</span><span class="mini-badge">✅ '+p.hits+'</span><span class="mini-badge">❌ '+p.misses+'</span><span class="mini-badge">🌊 '+p.wave+'</span><span class="mini-badge">+'+(p.expWon||0)+' EXP · +'+(p.coinsWon||0)+' pts</span></div>';
    }).join('')+'</div>';
    this.ready=false;
    const rb=document.getElementById('multiReadyBtn'); if(rb) rb.textContent='✅ ¡LISTO!';
  }
 },
 async sendChat(){
  const i=document.getElementById('multiChatInput'); const t=(i.value||'').trim(); if(!t) return;
  try{ await API.multiChatSend(t); i.value=''; this.poll(true); }catch(e){ Toast.error(e.message); }
 },
 fireLaserIn(col,killedQ,miss,quiet){
  try{
    if(!col) return;
    const ship=col.querySelector('.multi-ship'); if(!ship) return;
    const qs=col.querySelectorAll('.multi-enemy');
    let target=null;
    if(killedQ){ for(const el of qs){ if((el.dataset.q||'')===killedQ){ target=el; break; } } }
    if(!target&&qs.length) target=qs[killedQ?0:Math.floor(Math.random()*qs.length)];
    if(!target){ const zone=col.querySelector('.multi-enemies'); if(zone){ target=zone; } else return; }
    const cRect=col.getBoundingClientRect(), sRect=ship.getBoundingClientRect(), tRect=target.getBoundingClientRect();
    const x1=sRect.left-cRect.left+sRect.width/2, y1=sRect.top-cRect.top;
    const x2=tRect.left-cRect.left+tRect.width/2, y2=tRect.top-cRect.top+tRect.height/2;
    const dx=x2-x1, dy=y2-y1, len=Math.max(20,Math.sqrt(dx*dx+dy*dy)), ang=Math.atan2(dy,dx)*180/Math.PI;
    const beam=document.createElement('div'); beam.className='multi-laser'+(miss?' miss':'');
    beam.style.cssText='left:'+x1+'px;top:'+y1+'px;width:'+len+'px;transform:rotate('+ang+'deg)';
    col.style.position='relative'; col.appendChild(beam);
    requestAnimationFrame(()=>beam.classList.add('on'));
    if(target.classList&&target.classList.contains('multi-enemy')) target.classList.add(miss?'shake':'dying');
    setTimeout(()=>{ try{beam.remove();}catch(e){} },650);
    if(!quiet&&!miss){ try{ const C=window.AudioContext||window.webkitAudioContext; if(C){ this._ac=this._ac||new C(); const o=this._ac.createOscillator(),g=this._ac.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(900,this._ac.currentTime); o.frequency.exponentialRampToValueAtTime(120,this._ac.currentTime+.35); o.connect(g); g.connect(this._ac.destination); g.gain.value=.06; o.start(); o.stop(this._ac.currentTime+.4); } }catch(e){} }
  }catch(e){}
 },
 fireLaser(killedQ,miss){
  try{
    const cols=document.getElementById('multiColumns'); if(!cols) return;
    const meCol=cols.querySelector('.multi-col.me'); if(!meCol) return;
    this.fireLaserIn(meCol,killedQ,miss,false);
  }catch(e){}
 },
 showRemoteShots(match,me){
  try{
    if(!match||!match.shots) return;
    const cols=document.getElementById('multiColumns'); if(!cols) return;
    for(const s of match.shots){
      if(this.seenShots[s.id]) continue;
      this.seenShots[s.id]=1;
      if(s.userId===me) continue;
      const col=cols.querySelector('.multi-col[data-uid="'+s.userId+'"]');
      if(col) this.fireLaserIn(col,s.q,!s.hit,true);
    }
    const ids=Object.keys(this.seenShots); if(ids.length>60){ ids.slice(0,ids.length-60).forEach(k=>delete this.seenShots[k]); }
  }catch(e){}
 },
 async sendAnswer(){
  if(this.sending) return;
  const i=document.getElementById('multiAnswer'); const t=(i.value||'').trim(); if(!t) return;
  const fb=document.getElementById('multiFeedback');
  i.value=''; this.sending=true;
  try{
    const r=await API.multiAnswer(t);
    if(r.hit){
      const kq=r.killed&&r.killed.q;
      this.fireLaser(kq,false);
      fb.textContent='💥 ¡Destruido! '+(r.killed&&r.killed.a?r.killed.a+' · ':'')+'Oleada '+r.wave+' · racha '+r.streak; fb.style.color='#00e676';
      if(r.waveUp) setTimeout(()=>Toast.success('¡Hornada superada! Oleada '+r.wave),600);
      this.lastKey='';
      setTimeout(()=>this.poll(true),550);
    }
    else {
      this.fireLaser(null,true);
      if(r.dead){ fb.textContent='💀 ¡Eliminado! Sin vidas (❌ '+r.misses+')'; }
      else { fb.textContent='❌ Fallo ('+r.misses+') · Pierdes 1 vida '+(r.lives!=null?('· quedan '+(r.lives)+'/2'):''); }
      fb.style.color='#ff5252';
      this.lastKey='';
      setTimeout(()=>this.poll(true),550);
    }
  }catch(e){ fb.textContent='💀 '+(e.message||'Error'); fb.style.color='#ff5252'; this.lastKey=''; setTimeout(()=>this.poll(true),550); }
  finally{ this.sending=false; const ai=document.getElementById('multiAnswer'); if(ai&&!ai.disabled) ai.focus(); }
 }
};
document.addEventListener('DOMContentLoaded',()=>MultiUI.init());
