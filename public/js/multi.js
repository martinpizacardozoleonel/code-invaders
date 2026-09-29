const MultiSkins=[{id:'default',body:'#00e5ff',accent:'#80d8ff',glow:'#00e5ff'},{id:'crimson',body:'#ff1744',accent:'#ff8a80',glow:'#ff5252'},{id:'gold',body:'#ffd600',accent:'#fff176',glow:'#ffea00'},{id:'neon',body:'#00e676',accent:'#69f0ae',glow:'#00e676'},{id:'violet',body:'#7c4dff',accent:'#b388ff',glow:'#7c4dff'},{id:'pixel',body:'#ff6d00',accent:'#ffab40',glow:'#ff6d00'},{id:'ocean',body:'#2196f3',accent:'#82b4ff',glow:'#2196f3'},{id:'rosa',body:'#ff4081',accent:'#ff8a80',glow:'#ff4081'},{id:'lima',body:'#c6ff00',accent:'#eaff8a',glow:'#c6ff00'},{id:'ghost',body:'#eceff1',accent:'#ffffff',glow:'#eceff1'},{id:'camo',body:'#7c9a3f',accent:'#b2d67c',glow:'#7c9a3f'},{id:'magma',body:'#ff3d00',accent:'#ff8a65',glow:'#ff3d00'},{id:'ice',body:'#80d8ff',accent:'#e1f5fe',glow:'#80d8ff'},{id:'nebula',body:'#e040fb',accent:'#ea80fc',glow:'#e040fb'},{id:'solar',body:'#fff176',accent:'#fff9c4',glow:'#ffd600'},{id:'platinum',body:'#cfd8dc',accent:'#ffffff',glow:'#cfd8dc'},{id:'obsidian',body:'#1a1a2e',accent:'#5c6bc0',glow:'#ff1744'},{id:'diamond',body:'#b3ffff',accent:'#ffffff',glow:'#b3ffff'},{id:'tournament_silver',body:'#c0c0c0',accent:'#e0e0e0',glow:'#e0e0e0'}];

// ══ ARENA MULTIJUGADOR ═══════════════════════════════════════════════════
// Una sola pantalla. Cada jugador ocupa una franja vertical con su nave al
// fondo, separadas entre sí. Las naves enemigas caen dentro de la franja de
// su dueño y el fondo se desplaza como si el espacio avanzara. Las posiciones
// se calculan acá con requestAnimationFrame a partir del spawnAt del servidor,
// así el movimiento es fluido aunque el estado llegue cada 1,5 s.
  const MultiArena=(()=>{
  let cv=null,ctx=null,raf=null,dpr=1,W=0,H=0;
  let stars=[],beams=[],booms=[],shock=0;
  let players=[],enemies=[],seenEvents={},me='',clockOff=0,travelMs=5000,lastT=0,visible=false,wavePhase=1;

  function serverNow(){ return Date.now()+clockOff; }
  function syncClock(serverNowMs){ if(serverNowMs) clockOff=serverNowMs-Date.now(); }
  function laneRect(lane,count){
    const n=Math.max(1,count||1); const w=W/n;
    return { x:lane*w, w:w, cx:lane*w+w/2, pad:Math.max(6,w*0.06) };
  }
  function resize(){
    if(!cv) return;
    const box=cv.parentElement; if(!box) return;
    dpr=Math.min(2,window.devicePixelRatio||1);
    W=Math.max(320,box.clientWidth); H=Math.max(280,box.clientHeight);
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    cv.style.width=W+'px'; cv.style.height=H+'px';
    if(ctx) ctx.setTransform(dpr,0,0,dpr,0,0);
    buildStars();
  }
  function buildStars(){
    const n=Math.round((W*H)/5200)+40; stars=[];
    for(let i=0;i<n;i++) stars.push({ x:Math.random()*W, y:Math.random()*H, z:0.25+Math.random()*1.15, s:0.6+Math.random()*1.5 });
  }
  function enemyGeom(e,count){
    const L=laneRect(e.lane||0,count);
    const t=Math.max(0,serverNow()-e.spawnAt);
    const frac=Math.min(1.15,(t/1000)*(e.fall||0.3));
    const usable=H*0.86;
    return { L, y:usable*frac, w:Math.min(96,Math.max(56,L.w-18)), h:Math.min(74,Math.max(42,L.w*0.62)) };
  }
  function playerGeom(p,count){
    const L=laneRect(p.lane||0,count);
    return { L, x:L.cx, y:H*0.9 };
  }
  // Fondo de espacio: las estrellas van bajando y además hay nebulosas que
  // van cambiando de color y de posición a medida que avanza la partida, para
  // que se vea que estamos avanzando por el espacio.
  const NEBULAS=[
    { c:['rgba(0,120,255,.16)','rgba(124,77,255,.10)'], r:.75, sx:.00013, sy:.00009, px:.18, py:.22 },
    { c:['rgba(255,0,120,.13)','rgba(255,105,180,.08)'], r:.60, sx:-.00010, sy:.00014, px:.72, py:.18 },
    { c:['rgba(0,255,190,.10)','rgba(0,100,255,.10)'], r:.85, sx:.00008, sy:-.00012, px:.42, py:.70 },
    { c:['rgba(255,140,0,.10)','rgba(200,0,255,.09)'],  r:.55, sx:-.00014, sy:-.00007, px:.85, py:.62 },
    { c:['rgba(80,0,255,.13)','rgba(0,200,255,.09)'],  r:.70, sx:.00011, sy:.00011, px:.08, py:.66 }
  ];
  function drawStarfield(dt,t){
    ctx.fillStyle='#04060f'; ctx.fillRect(0,0,W,H);
    const g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'rgba(8,14,40,.55)'); g.addColorStop(.55,'rgba(4,6,16,0)'); g.addColorStop(1,'rgba(2,4,12,.6)');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    // Nebulosas: el color rota despacio con la fase de la partida.
    ctx.save();
    ctx.globalCompositeOperation='lighter';
    const rot=Math.floor(phase||0)%NEBULAS.length;
    for(let k=0;k<2;k++){
      const i=(rot+k)%NEBULAS.length, n=NEBULAS[i];
      const x=W*(n.px+Math.sin(t*n.sx+i)*.07);
      const y=H*(n.py+Math.cos(t*n.sy+i*1.7)*.06);
      const r=Math.max(W,H)*n.r;
      const gr=ctx.createRadialGradient(x,y,0,x,y,r);
      gr.addColorStop(0,n.c[0]); gr.addColorStop(1,n.c[1]);
      ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    const spd=26+(shock>0?90:0)+Math.min(60,(phase||0)*4);
    for(const s of stars){
      s.y+=s.z*spd*dt; if(s.y>H+2){ s.y=-2; s.x=Math.random()*W; }
      ctx.globalAlpha=Math.min(.9,.18+s.z*.45);
      ctx.fillStyle= s.z>1.05?'#a5f3fc':'#ffffff';
      ctx.fillRect(s.x,s.y,s.s,s.z>1.05?s.s*2.4:s.s);
    }
    ctx.globalAlpha=1;
  }
  function drawEnemy(e,count){
    const g=enemyGeom(e,count); if(g.y>H+40||g.y<-40) return;
    const x=g.L.cx, w=g.w, h=g.h, bob=Math.sin((serverNow()/260)+(e.lane||0))*h*.06;
    const y=g.y+bob;
    // Diseño de nave al azar: cada una se ve distinta a las de al lado.
    EnemyShips.draw(ctx,e.design||'html',x,y,w,h);
    // Carta con la barra de vida del dueño: se ve a quién hay que ayudar.
    const d=EnemyShips.byId(e.design||'html');
    ctx.save();
    ctx.textAlign='center';
    ctx.fillStyle=d.glow; ctx.font='800 9px system-ui,sans-serif';
    ctx.fillText(d.cat,x,y-h*.36);
    // Texto legible dentro de la nave, igual que en el modo de un jugador.
    EnemyShips.drawLabel(ctx,e.q,x,y+h*.16,w-10,{fontSize:10});
    ctx.restore();
  }
  function drawPlayer(p,count,t){
    const g=playerGeom(p,count);
    const bob=Math.sin(t/320+p.lane)*5;
    const sk=MultiSkins.find(s=>s.id===p.skin)||MultiSkins[0];
    const y=g.y+bob, s=Math.min(30,g.L.w*.22);
    ctx.save();
    ctx.shadowColor=sk.glow; ctx.shadowBlur=18;
    ctx.fillStyle=sk.body; ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(g.x,y-s*1.1); ctx.lineTo(g.x-s,y+s*.8); ctx.lineTo(g.x-s*.35,y+s*.45);
    ctx.lineTo(g.x,y+s*.72); ctx.lineTo(g.x+s*.35,y+s*.45); ctx.lineTo(g.x+s,y+s*.8);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.shadowBlur=0;
    ctx.fillStyle=sk.accent; ctx.beginPath(); ctx.arc(g.x,y-s*.16,s*.22,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ff6d00'; ctx.beginPath();
    ctx.moveTo(g.x-s*.28,y+s*.62); ctx.lineTo(g.x,y+s*1.05); ctx.lineTo(g.x+s*.28,y+s*.62); ctx.closePath(); ctx.fill();
    // separadores de franja
    ctx.shadowBlur=0;
    const lives=Math.max(0,p.lives==null?2:p.lives);
    ctx.textAlign='center';
    ctx.fillStyle= p.userId===me?'#00e5ff':(p.nameColor||'#ffffff');
    ctx.font=(p.userId===me?'800 ':'700 ')+'12px system-ui,sans-serif';
    ctx.fillText(p.username+(p.userId===me?' (TÚ)':''),g.x,y+s*1.5);
    ctx.fillStyle= lives>0?'#ff4d6d':'#555';
    ctx.font='15px system-ui,sans-serif';
    ctx.fillText('♥'.repeat(lives)+'♡'.repeat(Math.max(0,2-lives)),g.x,y+s*1.5+16);
    ctx.fillStyle='#9fb3c8'; ctx.font='600 10px system-ui,sans-serif';
    ctx.fillText('💥'+p.kills+'  🔥'+p.streak,g.x,y-s*1.5-4);
    ctx.restore();
  }
  function drawLanes(count,t){
    for(let i=0;i<count;i++){
      const L=laneRect(i,count);
      ctx.fillStyle=i%2?'rgba(255,255,255,.016)':'rgba(0,229,255,.022)';
      ctx.fillRect(L.x,0,L.w,H);
      ctx.strokeStyle='rgba(0,229,255,.10)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(L.x+.5,0); ctx.lineTo(L.x+.5,H); ctx.stroke();
    }
    // línea de peligro
    const y=H*0.86;
    ctx.strokeStyle='rgba(255,23,68,'+(0.25+Math.sin(t/220)*0.16)+')'; ctx.lineWidth=2;
    ctx.setLineDash([10,8]);
    ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    ctx.setLineDash([]);
  }
  function drawFx(dt){
    for(let i=beams.length-1;i>=0;i--){
      const b=beams[i]; b.t+=dt;
      if(b.t>=b.dur){ beams.splice(i,1); continue; }
      const k=b.t/b.dur;
      // El haz crece desde la nave hacia el objetivo.
      const reach=Math.min(1,k*2.2);
      const x2=b.x1+(b.x2-b.x1)*reach, y2=b.y1+(b.y2-b.y1)*reach;
      if(b.miss){
        ctx.save(); ctx.globalAlpha=1-k;
        ctx.strokeStyle='rgba(255,82,82,.85)'; ctx.lineWidth=2.6;
        ctx.shadowColor='#ff5252'; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.moveTo(b.x1,b.y1); ctx.lineTo(x2,y2); ctx.stroke();
        ctx.restore();
      }else{
        // El láser de cada jugador: mismo efecto que en la tienda.
        LaserFx.draw(ctx,b.fx||'default',b.x1,b.y1,x2,y2,b.t,{alpha:1-k,w:2.6,blur:12});
      }
    }
    for(let i=booms.length-1;i>=0;i--){
      const b=booms[i]; b.t+=dt;
      if(b.t>=b.dur){ booms.splice(i,1); continue; }
      const k=b.t/b.dur;
      ctx.save(); ctx.globalAlpha=1-k;
      const r=b.r*(0.4+k*1.1);
      const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,r);
      g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(.45,b.col+'cc'); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(b.x,b.y,r,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='800 '+Math.round(20+k*14)+'px system-ui,sans-serif'; ctx.textAlign='center';
      ctx.fillText('💥',b.x,b.y+6);
      ctx.restore();
    }
  }
  function frame(t){
    raf=requestAnimationFrame(frame);
    if(!ctx) return;
    const dt=Math.min(.05,lastT?(t-lastT)/1000:.016); lastT=t;
    if(shock>0) shock=Math.max(0,shock-dt*2.2);
    if(!visible){ return; }
    const count=Math.max(1,players.length);
    ctx.save();
    if(shock>0) ctx.translate((Math.random()-.5)*shock*10,(Math.random()-.5)*shock*10);
    drawStarfield(dt,t,wavePhase);
    drawLanes(count,t);
    for(const e of enemies) drawEnemy(e,count);
    for(const p of players) drawPlayer(p,count,t);
    drawFx(dt);
    if(shock>0){ ctx.fillStyle='rgba(255,23,68,'+(shock*.14)+')'; ctx.fillRect(0,0,W,H); }
    ctx.restore();
  }
  function ensureLoop(){
    if(raf) return;
    lastT=0; raf=requestAnimationFrame(frame);
  }
  function stopLoop(){ if(raf){ cancelAnimationFrame(raf); raf=null; } }

  return {
    attach(){
      cv=document.getElementById('multiCanvas'); if(!cv) return false;
      ctx=cv.getContext('2d');
      if(!ctx) return false;
      if(!this._bound){
        this._bound=true;
        window.addEventListener('resize',()=>{ resize(); });
      }
      resize(); ensureLoop();
      return true;
    },
    resize,
    enter(){ this.attach(); visible=true; buildStars(); ensureLoop(); },
    leave(){ visible=false; stopLoop(); },
    // Sincroniza el estado del servidor con el render local.
    setState(match,meId,serverNowMs){
      syncClock(serverNowMs);
      if(!match) return;
      me=meId||'';
      players=match.players||[];
      travelMs=match.travelMs||travelMs;
      wavePhase=match.wave||1;
      // El láser propio: el que tiene equipado en la tienda.
      const yo=players.find(p=>p.userId===me);
      this.equippedLaser=(yo&&yo.laser)||this.equippedLaser||'default';
      enemies=(match.enemies||[]).filter(e=>{
        if(e.spawnAt>serverNow()+2500) return false;
        return (serverNow()-e.spawnAt) < travelMs*1.25;
      });
      // eventos de ruptura de línea
      (match.events||[]).forEach(ev=>{
        if(seenEvents[ev.id]) return;
        seenEvents[ev.id]=1;
        if(ev.type==='breach'){ shock=1; this.flashBreach(); }
      });
      Object.keys(seenEvents).forEach(k=>{ if(!((match.events||[]).some(e=>e.id===k))) delete seenEvents[k]; });
    },
    // Disparo: traza el láser desde la nave del jugador hasta el objetivo.
    // killed puede ser la nave (con id) o sólo su dueño, porque cuando llega
    // la respuesta del servidor la nave ya no está en la lista local.
    fire(killed,miss){
      if(!ctx) return;
      const count=Math.max(1,players.length);
      const meP=players.find(p=>p.userId===me)||players[0];
      if(!meP) return;
      const pg=playerGeom(meP,count);
      const target=this.findTarget(killed,count);
      let x2=target?target.x:W/2, y2=target?target.y:H*0.3;
      if(target){
        booms.push({x:x2,y:y2,r:Math.min(70,Math.max(38,pg.L.w*.36)),t:0,dur:.55,col:'#00e5ff'});
      }
      beams.push({x1:pg.x,y1:pg.y-Math.min(30,pg.L.w*.22)*1.1,x2,y2,t:0,dur:.35,miss:!!miss,fx:this.equippedLaser||'default',col:'#00e5ff'});
      if(miss) shock=Math.max(shock,.5);
    },
    // Dónde estaba la nave destruida: la buscamos por id y, si ya no está,
    // reconstruimos la posición con la franja de su dueño.
    findTarget(killed,count){
      if(!killed) return null;
      const n=count||Math.max(1,players.length);
      const e=(killed.id&&enemies.find(x=>x.id===killed.id))||null;
      if(e){ const g=enemyGeom(e,n); return {x:g.L.cx,y:Math.max(6,g.y)}; }
      // La nave ya no está: se dibuja la explosión donde estaba más o menos,
      // a un 45% del alto de la franja de su dueño.
      const idx=players.findIndex(p=>p.userId===killed.ownerId);
      if(idx<0) return null;
      const L=laneRect(idx,n);
      return { x:L.cx, y:H*0.45 };
    },
    // Disparo de otro jugador: mismo efecto pero con su color de nave.
    remoteFire(s){
      if(!ctx||!s) return;
      const count=Math.max(1,players.length);
      const p=players.find(x=>x.userId===s.userId);
      if(!p) return;
      const pg=playerGeom(p,count);
      const sk=MultiSkins.find(x=>x.id===p.skin)||MultiSkins[0];
      let x2=pg.x, y2=H*0.3;
      const e=s.targetId&&enemies.find(x=>x.id===s.targetId);
      if(e){ const g=enemyGeom(e,count); x2=g.L.cx; y2=Math.max(6,g.y); }
      if(s.hit) booms.push({x:x2,y:y2,r:Math.min(60,Math.max(32,pg.L.w*.32)),t:0,dur:.45,col:sk.body});
      beams.push({x1:pg.x,y1:pg.y-Math.min(30,pg.L.w*.22)*1.1,x2,y2,t:0,dur:.3,miss:!s.hit,fx:p.laser||'default',col:sk.body});
    },
    flashBreach(){
      const f=document.getElementById('multiFlash'); if(!f) return;
      f.classList.remove('on'); void f.offsetWidth; f.classList.add('on');
      const a=document.getElementById('multiBreachAlert');
      if(a){ a.classList.remove('on'); void a.offsetWidth; a.classList.add('on'); }
    },
    ping(){ if(!ctx) return; shock=Math.max(shock,.35); }
  };
})();
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
   const ci=document.getElementById('multiChatInput'); if(ci) ci.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); this.sendChat(); } else if(e.key==='Escape'){ this.replyTo=null; this.renderReplyBar(); }});
   const rc=document.getElementById('multiReplyCancel'); if(rc) rc.addEventListener('click',()=>{ this.replyTo=null; this.renderReplyBar(); });
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
   if(hint) hint.innerHTML=this.createIsPublic?'🌍 <b>Pública:</b> aparece en el buscador y cualquiera se une con 1 click.':'🔒 <b>Privada:</b> NO aparece en el buscador, se genera un código que solo el creador comparte.';
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
   const btnOrig=btn?btn.innerHTML:'';
   if(btn){ btn.disabled=true; btn.innerHTML='<span>⏳ CREANDO...</span><small>TRANSMITIENDO ▶</small>'; }
   try{
     const r=await API.multiCreateRoom(name,this.createIsPublic,this.createMode,this.createMax);
     if(inp) inp.value='';
     this.currentRoom=r.room; this.ready=false; this.setMode(r.room.mode||'normal');
     this.show('lobby'); this.poll(true);
     Toast.success((r.room.isPublic?'🌍 Sala pública creada: ':'🔒 Sala privada creada: ')+r.room.name);
   }catch(e){ Toast.error(e.message); }
   finally{ if(btn){ btn.disabled=false; btn.innerHTML=btnOrig||'<span>➕ CREAR Y ENTRAR</span><small>PRESS START ▶</small>'; } }
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
     const next=d.rooms||[];
     const key=JSON.stringify(next.map(r=>[r.id,r.name,r.players,r.maxPlayers,r.isPublic,r.mode,r.status,r.ownerName]));
     if(force===true||key!==this._roomsKey){
       this.rooms=next; this._roomsKey=key; this.lastRoomsAt=Date.now();
       this.renderRooms();
     } else {
       this.rooms=next; this.lastRoomsAt=Date.now();
     }
   }catch(e){ const l=document.getElementById('multiRoomsList'); if(l&&!this.rooms.length) l.innerHTML='<p class="hint">Sin conexión... reintentando</p>'; }
   finally{ this.roomsFetching=false; }
  },
 renderRooms(){
   const box=document.getElementById('multiRoomsList'); if(!box) return;
   const badge=document.getElementById('lobbyCountBadge'); if(badge) badge.textContent=this.rooms.length;
   if(!this.rooms.length){ box.innerHTML='<div class="lobby-empty"><span class="lobby-empty-ico">🛸</span><p class="hint">📭 Sin salas en este sector.<br>¡Creá la tuya arriba y sé el primer piloto! 👆</p></div>'; return; }
   box.innerHTML=this.rooms.map((r,i)=>{
     const pub=!!r.isPublic;
     const mx=r.maxPlayers||4;
     const full=(r.players||0)>=mx;
     const isSpeed=r.mode==='speedrun';
     const playing=r.status==='playing';
     const modeBadge=isSpeed?'<span class="lobby-badge mode-s">⚡ SPEEDRUN</span>':'<span class="lobby-badge mode-n">▶ JUGAR</span>';
     const privBadge=pub?'<span class="lobby-badge pub">🌍 PÚBLICA</span>':'<span class="lobby-badge priv">🔒 PRIVADA</span>';
     const st=playing?'<span class="lobby-badge fighting">⚔️ EN BATALLA</span>':'<span class="lobby-badge live-b">🟢 LOBBY</span>';
     const capBadge='<span class="lobby-badge">👥 '+r.players+'/'+mx+'</span>';
     let btn;
     if(!pub) btn='<button class="btn btn-ghost btn-sm lobby-join-btn locked" data-priv="'+r.id+'" title="Sala privada: necesitás el código">🔒 CÓDIGO</button>';
     else if(full) btn='<button class="btn btn-ghost btn-sm" disabled title="Sala llena">🚫 LLENA</button>';
     else if(playing) btn='<button class="btn btn-ghost btn-sm" disabled title="Ya están jugando">⚔️ ...</button>';
     else btn='<button class="btn btn-primary btn-sm lobby-join-btn" data-join="'+r.id+'">▶ UNIRSE</button>';
     return '<div class="lobby-room-card'+(isSpeed?' mode-speedrun':'')+(playing?' status-playing':'')+'"><div class="lobby-room-main"><p class="lobby-room-name">🚀 '+this.esc(r.name)+'</p><div class="lobby-room-meta"><span class="lobby-badge owner">👑 '+this.esc(r.ownerName||'?')+'</span>'+capBadge+privBadge+modeBadge+st+'</div></div>'+btn+'</div>';
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
   this.open=false; MultiArena.leave();
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
  renderMultiBody(raw){
   const t=String(raw==null?'':raw);
   if(t.startsWith('[sticker]')) return '<div class="chat-sticker">'+this.esc(t.slice(9,20))+'</div>';
   return this.esc(t);
  },
  setReplyTo(m){
   if(!m){ this.replyTo=null; this.renderReplyBar(); return; }
   this.replyTo={userId:m.userId||'',username:m.username||'?',text:ChatReply.decode(m.text).text};
   this.renderReplyBar();
   const i=document.getElementById('multiChatInput'); if(i) i.focus();
  },
  renderReplyBar(){
   const bar=document.getElementById('multiReplyBar'); if(!bar) return;
   const r=this.replyTo;
   bar.classList.toggle('hidden',!r);
   if(!r) return;
   const t=document.getElementById('multiReplyText');
   if(t) t.textContent=ChatReply.preview(r);
  },
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
  const roomId=d.room.id||d.room.name||'';
  if(roomId!==this._roomId){ this._roomId=roomId; this._lobbyKey=null; this._chatKey=null; }
  this.currentRoom=d.room;
  this.renderRoomHeader();
  const me=d.me;
  const lobby=d.lobby||[]; const match=d.match; const chat=d.chat||[];
  const lp=document.getElementById('multiPlayers');
  if(lp){
    const lkey=lobby.map(p=>p.userId+':'+(p.ready?1:0)+':'+(p.username||'')).join('|')||'empty';
    if(force===true||lkey!==this._lobbyKey){
      this._lobbyKey=lkey;
      if(!lobby.length) lp.innerHTML='<p class="hint empty-hint">🚀 Sala vacía. ¡Compartí el nombre o el código e invita a tu escuadrón!</p>';
      else lp.innerHTML=lobby.map(p=>{
        const pic=this.picHtml(p);
        return '<div class="multi-player'+(p.ready?' is-ready':'')+'"><div class="multi-avatar frame-'+(p.frame||'none')+'" data-pic="'+p.userId+'">'+pic+'</div><p class="multi-name">'+this.esc(p.username)+'</p><span class="status-pill '+(p.ready?'online':'offline')+'">'+(p.ready?'✅ LISTO':'⏳ esperando')+'</span>'+(p.userId===me?'<span class="mini-badge">TÚ</span>':'')+((d.room&&d.room.ownerId===p.userId)?'<span class="mini-badge">👑 CREADOR</span>':'')+'</div>';
      }).join('');
    }
  }
  const cb=document.getElementById('multiChatBox');
  if(cb){
    if(!cb.dataset.scrollBound){
      cb.dataset.scrollBound='1';
      cb.addEventListener('scroll',()=>{
        cb.dataset.userAtBottom=(cb.scrollTop+cb.clientHeight>=cb.scrollHeight-60)?'1':'0';
     },{passive:true});
    }
    const last=chat[chat.length-1];
    const ckey=chat.length+'|'+(last?((last.id||'')+'|'+(last.createdAt||'')+'|'+String(last.text||'').slice(-80)):'empty');
    if(force===true||ckey!==this._chatKey){
      this._chatKey=ckey;
      const prevTop=cb.scrollTop;
      const nearBottom=cb.dataset.userAtBottom!=='0'||(cb.scrollTop+cb.clientHeight>=cb.scrollHeight-60);
      cb.innerHTML=chat.length?chat.map(m=>{
        if(m.userId==='sys') return '<div class="chat-msg sys"><div class="chat-text">🤖 '+this.esc(m.text)+'</div></div>';
        const dec=ChatReply.decode(m.text);
        let body=this.renderMultiBody(dec.text);
        if(dec.reply) body='<div class="chat-quote"><span class="chat-quote-arrow">↩</span><span class="chat-quote-text">'+this.esc(ChatReply.preview(dec.reply))+'</span></div><div class="chat-reply-body">'+body+'</div>';
        const bub=(m.equippedBubble&&m.equippedBubble!=='none')?' chat-bubble-wrap bubble-'+m.equippedBubble:'';
        const flag=(m.userId!==me)?'<button class="chat-flag" data-rep="'+m.userId+'" data-name="'+this.esc(m.username).replace(/"/g,'&quot;')+'" title="Denunciar jugador">🚩</button>':'';
        return '<div class="chat-msg" data-mid="'+m.id+'"><div class="chat-body"><div class="chat-head"><span class="chat-user" style="color:'+this.esc(m.nameColor||'#00e5ff')+'">'+this.esc(m.username)+'</span><button class="chat-reply-btn" data-mreply="'+m.id+'" title="Responder">↩</button>'+flag+'</div><div class="chat-text'+bub+'">'+body+'</div></div></div>';
      }).join(''):'<p class="hint">Sin mensajes. ¡Saluda! 👋</p>';
      cb.querySelectorAll('.chat-flag').forEach(b=>b.addEventListener('click',()=>{ if(typeof Report!=='undefined') Report.open(b.dataset.rep,b.dataset.name); }));
      cb.querySelectorAll('[data-mreply]').forEach(b=>b.addEventListener('click',()=>{
        const m=chat.find(x=>x.id===b.dataset.mreply);
        if(m) this.setReplyTo({userId:m.userId,username:m.username,text:m.text});
      }));
      if(nearBottom) requestAnimationFrame(()=>{ cb.scrollTop=cb.scrollHeight; });
      else cb.scrollTop=prevTop;
    }
  }
  if(!match){ MultiArena.leave(); this.show('lobby'); this.lastKey=''; this.seenShots={}; this.lastMatchId=null; return; }
  if(match.status==='playing'){
    if(this.lastMatchId!==match.id){ this.lastMatchId=match.id; this.seenShots={}; }
    this._lastMatch=match; this._me=me;
    this.show('battle');
    MultiArena.enter();
    MultiArena.setState(match,me,d.now);
    // Trayectorias de los disparos de todos: se ve a quién le pegó a qué.
    (match.shots||[]).forEach(s=>{
     if(this.seenShots[s.id]) return; this.seenShots[s.id]=1;
     if(s.userId!==me) MultiArena.remoteFire(s);
    });
    const my=match.players.find(p=>p.userId===me);
    const lives=my?(my.lives==null?2:my.lives):0;
    document.getElementById('multiWaveBanner').textContent=
      ((d.room&&d.room.mode==='speedrun')?'⚡ SPEEDRUN · ':'⚔️ OLEADA '+(match.wave||1))+
      ' · 👾 '+(match.enemies||[]).length+' naves · 🛡️ '+lives+' '+('❤️'.repeat(Math.max(0,lives))||'💀');
    // HUD: una tarjeta por piloto, con su vida, destruidas y racha
    const hud=document.getElementById('multiHud');
    if(hud){
      const hkey=(match.players||[]).map(p=>p.userId+':'+p.lives+':'+p.kills+':'+p.streak).join('|')+'|'+(match.wave||1);
      if(force||hkey!==this._hudKey){
        this._hudKey=hkey;
        hud.innerHTML=(match.players||[]).map(p=>{
          const isMe=p.userId===me; const pic=this.picHtml(p); const lv=Math.max(0,p.lives==null?2:p.lives);
          return '<div class="multi-hud-card'+(isMe?' me':'')+(lv<=0?' out':'')+'"><div class="multi-avatar small frame-'+(p.frame||'none')+'" data-pic="'+p.userId+'">'+pic+'</div><div class="multi-hud-info"><p class="multi-name" style="color:'+this.esc(p.nameColor||'#00e5ff')+'">'+this.esc(p.username)+(isMe?' (TÚ)':'')+'</p><p class="hint">🛡️ '+(lv>0?'❤️'.repeat(lv):'💀')+' · 💥 '+p.kills+' · 🔥 '+p.streak+' · ❌ '+p.misses+'</p></div></div>';
        }).join('');
      }
    }
    const ai=document.getElementById('multiAnswer');
    if(my&&lives<=0&&ai){ ai.disabled=true; ai.placeholder='💀 Sin vidas — esperá a tus compañeros…'; }
    else if(ai){ ai.disabled=false; ai.placeholder='Escribe la etiqueta para disparar... (Enter)'; }
  } else if(match.status==='finished'){
    MultiArena.leave();
    this.show('results');
    // Orden final: gana el que destruyó más naves enemigas; a igual cantidad
    // se rompe con menos errores.
    const arr=[...match.players].sort((a,b)=>(b.kills-a.kills)||(a.misses-b.misses));
    const winIds=match.winnerIds&&match.winnerIds.length?match.winnerIds:(match.winnerId?[match.winnerId]:[]);
    const isWinner=p=>winIds.indexOf(p.userId)>=0;
    const head=winIds.length===0?'<p class="hint" style="text-align:center;margin-bottom:10px">Partida terminada</p>'
      :(winIds.length>1?'<p class="hint" style="text-align:center;margin-bottom:10px">🤝 ¡Empate en el primer lugar!</p>'
                    :'<p class="hint" style="text-align:center;margin-bottom:10px">🏆 Ganó <b>'+this.esc((arr[0]||{}).username||'')+'</b> con '+((arr[0]||{}).kills||0)+' naves destruidas</p>');
    document.getElementById('multiTable').innerHTML=head+'<div class="multi-table">'+arr.map((p,i)=>{
      const medal=isWinner(p)?(winIds.length>1?'🥇':'🥇'):(i===0?'🥈':(i===1?'🥉':(i+1)+'°'));
      const pic=this.picHtml(p);
      return '<div class="multi-row'+(isWinner(p)?' winner':'')+'"><span class="multi-pos">'+medal+'</span><div class="multi-avatar small frame-'+(p.frame||'none')+'" data-pic="'+p.userId+'">'+pic+'</div><span class="multi-name">'+this.esc(p.username)+'</span><span class="mini-badge">🌊 oleada '+(match.wave||1)+'</span><span class="mini-badge">💥 '+p.kills+' destruidas</span><span class="mini-badge">⭐ '+(p.score||((p.kills||0)*100+(p.best||0)*25))+' pts</span><span class="mini-badge">🔥 racha '+p.best+'</span><span class="mini-badge">❌ '+p.misses+'</span><span class="mini-badge">+'+(p.expWon||0)+' EXP · +'+(p.coinsWon||0)+' pts</span></div>';
    }).join('')+'</div>';
    this.ready=false;
    const rb=document.getElementById('multiReadyBtn'); if(rb) rb.textContent='✅ ¡LISTO!';
  }
 },
  async sendChat(){
   const i=document.getElementById('multiChatInput'); const t=(i.value||'').trim(); if(!t) return;
   const reply=this.replyTo;
   try{
    await API.multiChatSend(ChatReply.encode(reply,t));
    i.value=''; this.replyTo=null; this.renderReplyBar();
    this.poll(true);
   }catch(e){ Toast.error(e.message); }
  },
  feedback(txt,kind){
   const el=document.getElementById('multiFeedback'); if(!el) return;
   el.textContent=txt||'';
   el.style.color=kind==='bad'?'#ff6b81':(kind==='good'?'#00e676':'#9fb3c8');
   clearTimeout(this._fbT);
   if(txt) this._fbT=setTimeout(()=>{ if(el.textContent===txt) el.textContent=''; },2600);
  },
  // Dispara la respuesta escrita contra las naves de la pantalla.
  async sendAnswer(){
   const inp=document.getElementById('multiAnswer'); const t=(inp.value||'').trim();
   if(!t) return;
   if(this._answerBusy) return;
   const my=(this._lastMatch&&this._lastMatch.players||[]).find(p=>p.userId===this._me);
   if(!this._lastMatch||this._lastMatch.status!=='playing'){ this.feedback('⚠️ No hay partida en curso','bad'); return; }
   if(my&&(my.lives==null?2:my.lives)<=0){ this.feedback('💀 Te quedaste sin vidas','bad'); return; }
   this._answerBusy=true;
   try{
    const r=await API.multiAnswer(t);
    inp.value='';
    if(r.hit){
     const k=r.killed||{};
     MultiArena.fire(k,false);
     this.feedback('💥 ¡'+this.esc((k.q||'').slice(0,24))+' → '+k.a+'!  ('+r.kills+')','good');
    }else{
     MultiArena.fire(null,true);
     this.feedback('❌ Fallaste: -1 vida · '+r.misses+' errores','bad');
     if(r.out) this.feedback('💀 Te quedaste sin vidas','bad');
    }
   }catch(e){ this.feedback('⚠️ '+(e.message||'error'),'bad'); }
   finally{
    this._answerBusy=false;
    this.poll(true);
    if(inp&&document.activeElement!==inp&&!inp.disabled) inp.focus();
   }
  }
};
document.addEventListener('DOMContentLoaded',()=>MultiUI.init());
