const Ranked={
 clockInterval:null, checkInterval:null, activeTab:'normal', boards:{normal:[],speedrun:[]}, tournamentData:null,
 init(){ this.bindUI(); },
 bindUI(){
  const oc=document.getElementById('inspectCloseBtn'); const ov=document.getElementById('inspectOverlay');
  if(oc) oc.addEventListener('click',()=>ov.classList.add('hidden'));
  if(ov) ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.add('hidden'); });
  document.querySelectorAll('.ranked-tab').forEach(btn=>{ btn.addEventListener('click',()=>{ this.activeTab=btn.dataset.tab; document.querySelectorAll('.ranked-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===this.activeTab)); this.render(); }); });
 },
 formatTime(ms){ if(ms==null) return '—'; const s=ms/1000,m=Math.floor(s/60),sec=Math.floor(s%60),cs=Math.floor((ms%1000)/10); return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs).padStart(2,'0'); },
 async loadRanking(){
  const grid=document.getElementById('rankedGrid'); if(!grid) return; grid.innerHTML='<p class="lead">Cargando ranking...</p>';
  try{
   const [bd,sd,td]=await Promise.all([API.leaderboard(),API.leaderboardSpeedrun().catch(()=>({board:[]})),API.getTournament().catch(()=>({tournament:null,playerCount:0,minPlayers:10}))]);
   this.tournamentData=td; this.boards.normal=bd.board||[]; this.boards.speedrun=sd.board||[]; this.renderTournamentBanner(td); document.querySelectorAll('.ranked-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===this.activeTab)); this.render();
  }catch(e){ grid.innerHTML='<p class="lead">Error al cargar ranking.</p>'; }
 },
 render(){ const g=document.getElementById('rankedGrid'); if(!g) return; if(this.activeTab==='speedrun') this.renderSpeedrun(g); else this.renderNormal(g); },
 nameStyle(c){ if(!c||c==='#ffffff') return ''; if(c==='rainbow') return 'background:linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:900;'; return `color:${c};text-shadow:0 0 8px ${c}66;`; },
 renderNormal(grid){
  const board=this.boards.normal;
  if(!board.length){ grid.innerHTML='<p class="lead">No hay jugadores en el ranking todavía. ¡Jugá para aparecer!</p>'; return; }
  const t=this.tournamentData&&this.tournamentData.tournament; const isFinished=t&&t.status==='finished'; const res=isFinished?t.results:null;
  grid.innerHTML=board.map((u,i)=>{
   const medals=['🥇','🥈','🥉']; const medal=i<3?medals[i]:`<span class="ranked-pos">${i+1}</span>`;
   const frameClass=u.equippedFrame&&u.equippedFrame!=='none'?' frame-'+u.equippedFrame:'';
   const pic=u.profilePic?`<img src="${u.profilePic}" alt="${u.username}" class="ranked-avatar">`:`<span class="ranked-avatar-placeholder">👾</span>`;
   let posBadge=''; if(isFinished&&res&&res[u.id]){ const p=res[u.id].position; if(p<=3) posBadge=`<span class="ranked-position-badge ranked-pos-${p}">#${p}</span>`; }
   const timeBadge=u.speedrunBest?`<span class="ranked-time">⚡ ${this.formatTime(u.speedrunBest)}</span>`:'';
   const onlineDot=`<span class="dot ${u.online?'online':'offline'}" title="${u.online?'En línea':'Desconectado'}"></span>`;
   const nameSt=this.nameStyle(u.nameColor)+API.fontStyle(u.equippedFont)+API.fxStyle(u.equippedFx);
   return `<div class="ranked-card" data-user-id="${u.id}"><div class="ranked-medal">${medal}</div><div class="ranked-avatar-wrap${frameClass}">${pic}</div><div class="ranked-info"><p class="ranked-name" style="${nameSt}">${u.username} ${onlineDot} ${posBadge}</p><p class="ranked-stats">❤️ ${u.solved} niveles · ⭐ ${u.exp||0} EXP · ⏱ ${u.hoursPlayed||0}h ${timeBadge}</p></div><div class="ranked-coins">🪙 ${u.coins||0}</div><button class="btn btn-ghost btn-sm ranked-inspect" data-user-id="${u.id}">👤 Ver</button></div>`;
  }).join(''); this.bindCardEvents(grid);
 },
 renderSpeedrun(grid){
  const board=this.boards.speedrun;
  if(!board.length){ grid.innerHTML='<p class="lead">⚡ Aún nadie completó speedrun. ¡Sé el primero!</p>'; return; }
  grid.innerHTML=board.map((u,i)=>{
   const medals=['🥇','🥈','🥉']; const medal=i<3?medals[i]:`<span class="ranked-pos">${i+1}</span>`;
   const frameClass=u.equippedFrame&&u.equippedFrame!=='none'?' frame-'+u.equippedFrame:'';
   const pic=u.profilePic?`<img src="${u.profilePic}" alt="${u.username}" class="ranked-avatar">`:`<span class="ranked-avatar-placeholder">👾</span>`;
   const isTop3=i<3?` ranked-pos-${i+1}`:''; const nameSt=this.nameStyle(u.nameColor)+API.fontStyle(u.equippedFont)+API.fxStyle(u.equippedFx); const onlineDot=`<span class="dot ${u.online?'online':'offline'}"></span>`;
   return `<div class="ranked-card ranked-card-speedrun" data-user-id="${u.id}"><div class="ranked-medal">${medal}</div><div class="ranked-avatar-wrap${frameClass}">${pic}</div><div class="ranked-info"><p class="ranked-name" style="${nameSt}">${u.username} ${onlineDot}</p><p class="ranked-stats">⚡ <span class="ranked-time-main">${this.formatTime(u.speedrunBest)}</span> · ❤️ ${u.solved} niveles</p></div><div class="ranked-coins ranked-time-badge${isTop3}">⏱ ${this.formatTime(u.speedrunBest)}</div><button class="btn btn-ghost btn-sm ranked-inspect" data-user-id="${u.id}">👤 Ver</button></div>`;
  }).join(''); this.bindCardEvents(grid);
 },
 bindCardEvents(grid){
  grid.querySelectorAll('.ranked-inspect').forEach(b=>b.addEventListener('click',e=>{ e.stopPropagation(); this.inspectUser(b.dataset.userId); }));
  grid.querySelectorAll('.ranked-card').forEach(c=>c.addEventListener('click',()=>this.inspectUser(c.dataset.userId)));
 },
 renderTournamentBanner(data){
  const banner=document.getElementById('tournamentBanner'); if(!banner) return;
  const {tournament,playerCount,minPlayers,canStart}=data;
  if(tournament&&tournament.status==='active'){
   const end=new Date(tournament.endDate); const diff=end-new Date();
   const d=Math.max(0,Math.floor(diff/86400000)), h=Math.max(0,Math.floor((diff%86400000)/3600000)), m=Math.max(0,Math.floor((diff%3600000)/60000)), s=Math.max(0,Math.floor((diff%60000)/1000));
   banner.className='tournament-banner tournament-active';
   banner.innerHTML=`<div class="tournament-top"><div class="tournament-status"><span class="tournament-status-dot active"></span><span>🔴 TORNEO EN CURSO — 15 DÍAS</span></div><div class="tournament-clock" id="tournamentClock"></div></div><div class="tournament-countdown"><span class="tournament-countdown-label">Termina a las 00:00 — tiempo restante:</span><div class="tournament-countdown-timer"><div class="countdown-unit"><span class="countdown-val" id="cdDays">${String(d).padStart(2,'0')}</span><span class="countdown-label">Días</span></div><div class="countdown-unit"><span class="countdown-val" id="cdHours">${String(h).padStart(2,'0')}</span><span class="countdown-label">Horas</span></div><div class="countdown-unit"><span class="countdown-val" id="cdMins">${String(m).padStart(2,'0')}</span><span class="countdown-label">Min</span></div><div class="countdown-unit"><span class="countdown-val" id="cdSecs">${String(s).padStart(2,'0')}</span><span class="countdown-label">Seg</span></div></div></div><div class="tournament-end-date">📅 Finaliza: <strong>${end.toLocaleDateString('es-AR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</strong> a las <strong>00:00</strong></div><div class="tournament-rewards"><p class="tournament-rewards-title">🎁 Recompensas</p><div class="tournament-rewards-grid"><div class="tournament-reward reward-1"><span class="reward-pos">🥇 1°</span><span class="reward-item">Marco Campeón + Nave Silver + 100 pts</span></div><div class="tournament-reward reward-2"><span class="reward-pos">🥈 2°</span><span class="reward-item">Nave Silver + 60 pts</span></div><div class="tournament-reward reward-3"><span class="reward-pos">🥉 3°</span><span class="reward-item">60 pts</span></div><div class="tournament-reward reward-4"><span class="reward-pos">🎯 4°+</span><span class="reward-item">40 pts</span></div></div></div>`;
   this.startClock(end); this.startCountdown(end);
  } else if(tournament&&tournament.status==='finished'){
   this.stopClock(); if(this._cdInterval) clearInterval(this._cdInterval);
   banner.className='tournament-banner tournament-finished';
   banner.innerHTML=`<div class="tournament-finished-anim"><div class="tournament-confetti"></div><h2 class="tournament-finished-title">🏆 ¡TORNEO FINALIZADO! 🏆</h2><p class="tournament-finished-sub">¡Felicidades a los ganadores! Revisa el ranked y tus notificaciones.</p><div class="tournament-finished-shine"></div></div><div class="tournament-rewards"><p class="tournament-rewards-title">🎁 Recompensas entregadas</p><div class="tournament-rewards-grid"><div class="tournament-reward reward-1"><span class="reward-pos">🥇 1°</span><span class="reward-item">Marco Campeón + Nave Silver + 100 pts</span></div><div class="tournament-reward reward-2"><span class="reward-pos">🥈 2°</span><span class="reward-item">Nave Silver + 60 pts</span></div><div class="tournament-reward reward-3"><span class="reward-pos">🥉 3°</span><span class="reward-item">60 pts</span></div><div class="tournament-reward reward-4"><span class="reward-pos">🎯 4°+</span><span class="reward-item">40 pts</span></div></div></div>`;
  } else {
   this.stopClock();
   banner.className='tournament-banner tournament-pending';
   banner.innerHTML=`<div class="tournament-top"><div class="tournament-status"><span class="tournament-status-dot pending"></span><span>⏳ TORNEO PRÓXIMAMENTE — 15 días a las 00:00</span></div></div><div class="tournament-players-needed"><p class="tournament-players-count">${playerCount} / ${minPlayers} jugadores</p><p class="tournament-players-hint">Faltan <strong>${Math.max(0,minPlayers-playerCount)}</strong> para iniciar.</p><div class="tournament-progress-bar"><div class="tournament-progress-fill" style="width:${Math.min(100,(playerCount/minPlayers)*100)}%"></div></div></div><div class="tournament-rewards"><p class="tournament-rewards-title">🎁 Recompensas</p><div class="tournament-rewards-grid"><div class="tournament-reward reward-1"><span class="reward-pos">🥇 1°</span><span class="reward-item">Marco Campeón + Nave Silver + 100 pts</span></div><div class="tournament-reward reward-2"><span class="reward-pos">🥈 2°</span><span class="reward-item">Nave Silver + 60 pts</span></div><div class="tournament-reward reward-3"><span class="reward-pos">🥉 3°</span><span class="reward-item">60 pts</span></div><div class="tournament-reward reward-4"><span class="reward-pos">🎯 4°+</span><span class="reward-item">40 pts</span></div></div></div>${canStart?'<p class="tournament-ready">✅ ¡Ya hay suficientes jugadores!</p>':''}`;
  }
 },
 startClock(end){ this.stopClock(); const upd=()=>{ const el=document.getElementById('tournamentClock'); if(!el){ this.stopClock(); return; } const n=new Date(); el.textContent=`🕐 ${n.toLocaleTimeString('es-AR')} — ${n.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})}`; }; upd(); this.clockInterval=setInterval(upd,1000); },
 stopClock(){ if(this.clockInterval){ clearInterval(this.clockInterval); this.clockInterval=null; } },
 startCountdown(end){ if(this._cdInterval) clearInterval(this._cdInterval); const upd=()=>{ const diff=end-new Date(); if(diff<=0){ clearInterval(this._cdInterval); return; } const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000); const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=String(v).padStart(2,'0'); }; set('cdDays',d); set('cdHours',h); set('cdMins',m); set('cdSecs',s); }; upd(); this._cdInterval=setInterval(upd,1000); },
 async inspectUser(userId){
  const ov=document.getElementById('inspectOverlay'); const ct=document.getElementById('inspectContent'); if(!ov||!ct) return; ct.innerHTML='<p>Cargando...</p>'; ov.classList.remove('hidden');
  try{
   const data=await API.getUserProfile(userId);
   const frameClass=data.equippedFrame&&data.equippedFrame!=='none'?' frame-'+data.equippedFrame:''; const pic=data.profilePic?`<img src="${data.profilePic}" alt="${data.username}" class="inspect-avatar">`:`<span class="inspect-avatar-placeholder">👾</span>`;
   const expLevel=Math.floor((data.exp||0)/100)+1; const created=data.createdAt?new Date(data.createdAt).toLocaleDateString('es-AR'):'Desconocido'; const speedrunHtml=data.speedrunBest?`<p class="inspect-speedrun">⚡ Speedrun: <strong>${this.formatTime(data.speedrunBest)}</strong></p>`:'<p class="inspect-speedrun muted">⚡ Sin speedrun</p>';
   const nameSt=this.nameStyle(data.nameColor)+API.fontStyle(data.equippedFont)+API.fxStyle(data.equippedFx); const onlineDot=`<span class="dot ${data.online?'online':'offline'}"></span> ${data.online?'En línea':'Desconectado'}`;
   ct.innerHTML=`<div class="inspect-head"><div class="inspect-avatar-wrap${frameClass}">${pic}</div><div class="inspect-stats"><p class="inspect-name" style="${nameSt}">${data.username} ${onlineDot}</p><p class="inspect-level">Nivel ${expLevel} · ${data.exp||0} EXP</p><p class="inspect-hours">⏱ ${data.hoursPlayed||0} h</p><p class="inspect-coins">🪙 ${data.coins||0}</p>${speedrunHtml}</div></div><div class="inspect-details"><div class="inspect-detail"><span class="inspect-detail-label">Niveles</span><span class="inspect-detail-val">${data.solved}</span></div><div class="inspect-detail"><span class="inspect-detail-label">Intentos</span><span class="inspect-detail-val">${data.attempts}</span></div><div class="inspect-detail"><span class="inspect-detail-label">Miembro desde</span><span class="inspect-detail-val">${created}</span></div></div>`;
  }catch(e){ ct.innerHTML='<p>Error</p>'; }
 }
};

Ranked._bannersCache=null;
Ranked._bannerById=async function(id){
  if(!id||id==='none') return {id:'none',name:'Sin banner',grad:'',border:'#333'};
  try{
    if(!this._bannersCache){
      const d=await API.getBanners();
      this._bannersCache=d.banners||[];
    }
    return this._bannersCache.find(x=>x.id===id)||{id:'none',name:'',grad:'',border:'#333'};
  }catch(e){ return {id:'none',name:'',grad:'',border:'#333'}; }
};
Ranked.inspectUser=async function(userId){
  const ov=document.getElementById('inspectOverlay'); const ct=document.getElementById('inspectContent'); if(!ov||!ct) return; ct.innerHTML='<p>Cargando...</p>'; ov.classList.remove('hidden');
  const card=ov.querySelector('.inspect-card'); if(card){ card.style.background=''; card.style.borderColor=''; }
  try{
    const data=await API.getUserProfile(userId);
    const b=await this._bannerById(data.equippedBanner);
    const hasBanner=(data.equippedBanner&&data.equippedBanner!=='none')||data.bannerImg;
    const frameClass=data.equippedFrame&&data.equippedFrame!=='none'?' frame-'+data.equippedFrame:'';
    const pic=data.profilePic?('<img src="'+data.profilePic+'" alt="'+data.username+'" class="inspect-avatar">'):('<span class="inspect-avatar-placeholder">👾</span>');
    const expLevel=Math.floor((data.exp||0)/100)+1;
    const created=data.createdAt?new Date(data.createdAt).toLocaleDateString('es-AR'):'Desconocido';
    const speedrunHtml=data.speedrunBest?('<p class="inspect-speedrun">⚡ Speedrun: <strong>'+this.formatTime(data.speedrunBest)+'</strong></p>'):('<p class="inspect-speedrun muted">⚡ Sin speedrun</p>');
    const nameSt=this.nameStyle(data.nameColor)+API.fontStyle(data.equippedFont)+API.fxStyle(data.equippedFx);
    const onlineDot='<span class="dot '+(data.online?'online':'offline')+'"></span> '+(data.online?'En línea':'Desconectado');
    const inner='<div class="inspect-head"><div class="inspect-avatar-wrap'+frameClass+'">'+pic+'</div><div class="inspect-stats"><p class="inspect-name" style="'+nameSt+'">'+data.username+' '+onlineDot+'</p><p class="inspect-level">Nivel '+expLevel+' · '+(data.exp||0)+' EXP</p><p class="inspect-hours">⏱ '+(data.hoursPlayed||0)+' h</p><p class="inspect-coins">🪙 '+(data.coins||0)+'</p>'+speedrunHtml+'</div></div><div class="inspect-details"><div class="inspect-detail"><span class="inspect-detail-label">Niveles</span><span class="inspect-detail-val">'+data.solved+'</span></div><div class="inspect-detail"><span class="inspect-detail-label">Intentos</span><span class="inspect-detail-val">'+data.attempts+'</span></div><div class="inspect-detail"><span class="inspect-detail-label">Miembro desde</span><span class="inspect-detail-val">'+created+'</span></div></div>';
    if(hasBanner){
      const isVid=data.bannerImg&&data.bannerImg.startsWith('data:video');
      const bgImg=(data.bannerImg&&!isVid)?("background-image:url('"+data.bannerImg+"');"):'';
      const bgGrad=(!data.bannerImg&&b&&b.grad)?('background:'+b.grad+';'):'';
      const bcol=(b&&b.border)?b.border:'#333';
      const vid=isVid?('<video src="'+data.bannerImg+'" autoplay loop muted playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></video>'):'';
      if(card){ card.style.borderColor=bcol; }
      ct.innerHTML='<div class="inspect-fullbanner" style="'+bgGrad+bgImg+'border:2px solid '+bcol+';position:relative;overflow:hidden;">'+vid+inner+'</div>';
    } else {
      ct.innerHTML=inner;
    }
  }catch(e){ ct.innerHTML='<p>Error</p>'; }
};

