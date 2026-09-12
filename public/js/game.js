const Game = (() => {
  const SKINS=[
    {id:'default',name:'DEV Cyan',price:0,body:'#00e5ff',accent:'#80d8ff',glow:'#00e5ff'},
    {id:'crimson',name:'Crimson Fury',price:120,body:'#ff1744',accent:'#ff8a80',glow:'#ff5252'},
    {id:'gold',name:'Golden Nova',price:200,body:'#ffd600',accent:'#fff176',glow:'#ffea00'},
    {id:'neon',name:'Neon Viper',price:300,body:'#00e676',accent:'#69f0ae',glow:'#00e676'},
    {id:'violet',name:'Violet Storm',price:350,body:'#7c4dff',accent:'#b388ff',glow:'#7c4dff'},
    {id:'pixel',name:'Pixel Phantom',price:500,body:'#ff6d00',accent:'#ffab40',glow:'#ff6d00'},{id:'ocean',name:'Oceano',price:600,body:'#2196f3',accent:'#82b4ff',glow:'#2196f3'},{id:'rosa',name:'Rosa Neon',price:750,body:'#ff4081',accent:'#ff8a80',glow:'#ff4081'},{id:'lima',name:'Lima Acida',price:850,body:'#c6ff00',accent:'#eaff8a',glow:'#c6ff00'},{id:'ghost',name:'Fantasma',price:950,body:'#eceff1',accent:'#ffffff',glow:'#eceff1'},{id:'camo',name:'Camuflaje',price:1000,body:'#7c9a3f',accent:'#b2d67c',glow:'#7c9a3f'},{id:'magma',name:'Magma',price:1200,body:'#ff3d00',accent:'#ff8a65',glow:'#ff3d00'},{id:'ice',name:'Hielo',price:1350,body:'#80d8ff',accent:'#e1f5fe',glow:'#80d8ff'},{id:'nebula',name:'Nebulosa',price:1500,body:'#e040fb',accent:'#ea80fc',glow:'#e040fb'},{id:'solar',name:'Solar',price:1650,body:'#fff176',accent:'#fff9c4',glow:'#ffd600'},{id:'platinum',name:'Platino',price:1800,body:'#cfd8dc',accent:'#ffffff',glow:'#cfd8dc'},{id:'obsidian',name:'Obsidiana',price:2100,body:'#1a1a2e',accent:'#5c6bc0',glow:'#ff1744'},{id:'diamond',name:'Diamante',price:2500,body:'#b3ffff',accent:'#ffffff',glow:'#b3ffff'}
  ];
  function skinById(id){ return SKINS.find(s=>s.id===id)||SKINS[0]; }
  const LEVELS=[
    {id:1,title:'HTML Básico',questions:[{q:'Encabezado grande',a:'<h1>'},{q:'Párrafo',a:'<p>'},{q:'Enlace',a:'<a>'},{q:'Imagen',a:'<img>'},{q:'Lista desordenada',a:'<ul>'},{q:'División',a:'<div>'},{q:'Elemento en línea',a:'<span>'},{q:'Botón',a:'<button>'},{q:'Campo de entrada',a:'<input>'},{q:'Tabla',a:'<table>'}],enemySpeed:0.5,spawnInterval:90,enemyHealth:1},
    {id:2,title:'CSS Básico',questions:[{q:'Margen exterior',a:'margin'},{q:'Color de texto',a:'color'},{q:'Borde',a:'border'},{q:'Posición',a:'position'},{q:'Selector por clase',a:'.'},{q:'Selector por ID',a:'#'},{q:'Tamaño de fuente',a:'font-size'},{q:'Alinear texto',a:'text-align'},{q:'Pseudoclase hover',a:':hover'},{q:'Activar flexbox',a:'display: flex'}],enemySpeed:0.7,spawnInterval:75,enemyHealth:1},
    {id:3,title:'JS Básico',questions:[{q:'Variable mutable',a:'let'},{q:'Variable constante',a:'const'},{q:'Comparación estricta',a:'==='},{q:'Función flecha',a:'=>'},{q:'Condición si',a:'if'},{q:'Bucle for',a:'for'}],enemySpeed:0.5,spawnInterval:95,enemyHealth:1},
    {id:4,title:'👑 JEFE FINAL',isBoss:true,bossHealth:12,questions:[{q:'Encabezado grande',a:'<h1>'},{q:'Color de texto',a:'color'},{q:'Variable mutable',a:'let'},{q:'Selector por ID',a:'#'},{q:'Borde',a:'border'},{q:'Función flecha',a:'=>'},{q:'Tabla',a:'<table>'},{q:'Obtener por ID',a:'getElementById()'},{q:'Petición HTTP',a:'fetch()'},{q:'Agregar al final',a:'push()'}],enemySpeed:0,spawnInterval:0,enemyHealth:12},
    {id:5,title:'👑 JEFE CSS',isBoss:true,isCssBoss:true,bossHealth:10,questions:[{q:'Color de texto',a:'color'},{q:'Fondo',a:'background'},{q:'Margen exterior',a:'margin'},{q:'Margen interior',a:'padding'},{q:'Borde',a:'border'},{q:'Ancho',a:'width'},{q:'Altura',a:'height'},{q:'Posición',a:'position'},{q:'Alinear ítems',a:'align-items'},{q:'Justificar contenido',a:'justify-content'}],enemySpeed:0,spawnInterval:0,enemyHealth:1}
  ];
  let canvas,ctx,W,H;
  let inputEl,fireBtnEl,startBtnEl,retryBtnEl,speedrunBtnEl,speedrunHudEl,exitBtnEl,exitOverlayEl,exitCancelEl,exitConfirmEl;
  let qBannerEl,qBannerTextEl;
  let state='title';
  let score=0,lives=2,level=0;
  let coins=0,ownedSkins=['default'],equipped='default';
  let frameCount=0,shootCooldown=0;
  let keys={}; let titleStars=[];
  let particles=[],lasers=[];
  let enemies=[],currentEnemy=null;
  let levelData=null,questionsLeft=[];
  let bossPool=[];
  let player={x:0,y:0,w:44,h:44,speed:6,baseSpeed:6,flash:0};
  let levelPause=0; let scorePop=0;
  let comboCount=0,comboTimer=0,comboPop=0;
  let slowTimer=0,fastTimer=0;
  let speedrun=false,speedrunFinished=false;
  let speedrunStart=0,speedrunTime=0,speedrunBest=null;
  let formationOffset=0,formationDrift=0,formationDir=1;
  let formationCountdown=0,formationSway=0.8,formationAdvance=0.2;
  const FORMATION_COUNTDOWN_FRAMES=20*60;
  const SPEEDRUN_COUNTDOWN=10*60;
  const CW=700,CH=500;
  let bossDodge=false,bossDodgeState='playing';
  let bossX,bossY,bossHP,bossMaxHP;
  let bossBullets=0,bossItems=[],bossTags=[];
  let bossItemTimer=0,bossTagTimer=0;
  let invertedTimer=0;
  let bossQuizActive=false,bossQuizData=null,bossQuizLocked=false;
  let bossDodgeScore=0;
  let playSecAcc=0;
  let cssBoss=false,cssBossWave=0,cssBossSpawnTimer=0,cssBossBubble='',cssBossBubbleTimer=0;
  let bossVX=1.8,bossVY=1.2;
  const BOSS_TAG_DEFS=[
    {tag:'<h1>',color:'#e44d26'},{tag:'<p>',color:'#e44d26'},{tag:'<a>',color:'#e44d26'},
    {tag:'.class',color:'#264de4'},{tag:'#id',color:'#264de4'},{tag:'margin',color:'#264de4'},
    {tag:'let',color:'#f0db4f'},{tag:'const',color:'#f0db4f'},{tag:'=>',color:'#f0db4f'},
    {tag:'def',color:'#3572A5'},{tag:'import',color:'#3572A5'},{tag:'class',color:'#3572A5'}
  ];
  const BOSS_QUIZ=[
    {q:'¿Qué es una variable?',tipo:'vf',options:['Un contenedor que guarda datos','Un tipo de bucle'],a:0,exp:'Las variables almacenan datos.'},
    {q:'¿Python usa "def" para funciones?',tipo:'vf',options:['Sí','No'],a:0,exp:'Python: def mi_funcion():'},
    {q:'¿Qué hace CSS?',tipo:'vf',options:['Estilo de páginas web','Programa lógica del servidor'],a:0,exp:'CSS controla la apariencia.'},
    {q:'¿Qué significa HTML?',tipo:'op',options:['Hyper Text Markup Language','High Tech Modern Language','Home Tool Markup Language'],a:0,exp:'HTML = Hyper Text Markup Language.'},
    {q:'¿Qué operador es igualdad estricta?',tipo:'op',options:['==','=','===','!='],a:2,exp:'=== compara valor Y tipo.'},
    {q:'¿Qué es un array?',tipo:'vf',options:['Colección ordenada de elementos','Una función matemática'],a:0,exp:'Un array guarda múltiples valores.'},
    {q:'¿Cuál es la función de console.log()?',tipo:'op',options:['Borrar consola','Mostrar info en consola','Crear variable'],a:1,exp:'console.log() imprime valores.'},
    {q:'¿Qué es programación?',tipo:'vf',options:['Dar instrucciones a una computadora','Dibujar imágenes'],a:0,exp:'Programar es escribir código.'},
    {q:'¿Qué lenguaje usa "self"?',tipo:'op',options:['JavaScript','Python','Java'],a:1,exp:'Python usa self en clases.'},
    {q:'¿Qué es un framework?',tipo:'vf',options:['Estructura para desarrollo','Un tipo de virus'],a:0,exp:'Frameworks facilitan crear apps.'},
  ];

  function isLogged(){ try{ return typeof Auth!=='undefined' && !!Auth.isLogged && !!Auth.user && !!Auth.user.id; }catch(e){ return false; } }
  function uid(){ try{ return isLogged()? Auth.user.id : null; }catch(e){ return null; } }
  function store(){ return isLogged()? localStorage : sessionStorage; }
  function pkey(k){ return isLogged()? `ci_${uid()}_${k}` : `ci_guest_${k}`; }
  function legacyGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function migrateIfNeeded(){
    if(!isLogged()) return;
    const pref=`ci_${uid()}_`;
    const map=[['shop_coins','coins'],['shop_owned','owned'],['shop_equipped','equipped'],['fx_score','score'],['speedrun_best','speedrun_best']];
    try{
      for(const [leg,short] of map){
        if(!localStorage.getItem(pref+short) && legacyGet(leg)){
          localStorage.setItem(pref+short, legacyGet(leg));
        }
      }
    }catch(e){}
  }
  function init(){
    canvas=document.getElementById('gameCanvas'); if(!canvas) return;
    canvas.width=CW; canvas.height=CH; ctx=canvas.getContext('2d'); W=CW; H=CH;
    inputEl=document.getElementById('answerInput');
    this.toggleLeaderboard=function(){ const lb=document.querySelector('.leaderboard'); if(lb) lb.classList.toggle('hidden', !isLogged()); };
    startBtnEl=document.getElementById('startBtn');
    fireBtnEl=document.getElementById('fireBtn');
    speedrunBtnEl=document.getElementById('speedrunBtn');
    speedrunHudEl=document.getElementById('speedrunHud');
    exitBtnEl=document.getElementById('exitBtn');
    exitOverlayEl=document.getElementById('exitOverlay');
    exitCancelEl=document.getElementById('exitCancel');
    exitConfirmEl=document.getElementById('exitConfirm');
    qBannerEl=document.getElementById('qBanner');
    qBannerTextEl=document.getElementById('qBannerText');
    migrateIfNeeded();
    loadShopLocal();
    syncShopFromServer();
    for(let i=0;i<120;i++) titleStars.push({x:Math.random()*CW,y:Math.random()*CH,speed:0.3+Math.random()*1.5,size:0.5+Math.random()*2});
    player.x=CW/2; player.y=CH-55;
    document.addEventListener('keydown',e=>{
      const ae=document.activeElement;
      const isAnswerFocused=ae===inputEl;
      const typing = isTyping();
      if(typing && !isAnswerFocused){
        if(e.key==='Escape' && isInGame() && exitOverlayEl && !exitOverlayEl.classList.contains('hidden')){ e.preventDefault(); hideExitConfirm(); return; }
        if(e.key==='Escape' && isInGame()){ e.preventDefault(); showExitConfirm(); return; }
        return;
      }
      if(typing && isAnswerFocused && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End',' '].includes(e.key)) return;
      if(!typing) keys[e.key]=true; else if(e.key!=='Enter') keys[e.key]=false;
      if(e.key==='Escape' && isInGame() && exitOverlayEl && !exitOverlayEl.classList.contains('hidden')){ e.preventDefault(); hideExitConfirm(); return; }
      if(e.key==='Escape' && isInGame()){ e.preventDefault(); showExitConfirm(); return; }
      if(state==='playing'&&e.key==='Enter'&&isAnswerFocused){ e.preventDefault(); fireAnswer(); return; }
      if(!typing && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
    });
    document.addEventListener('keyup',e=>{
      const ae=document.activeElement;
      const isAnswerFocused=ae===inputEl;
      const typing=isTyping();
      if(typing && !isAnswerFocused) return;
      keys[e.key]=false;
    });
    const pickEnemy=(mx,my)=>{
      let hit=null;
      for(let i=enemies.length-1;i>=0;i--){ const en=enemies[i]; if(Math.abs(mx-en.x)<=en.w/2&&Math.abs(my-en.y)<=en.h/2){hit=en;break;} }
      currentEnemy=hit; updateHUD();
    };
    canvas.addEventListener('click',e=>{
      if(state!=='playing'||!enemies.length) return;
      const rect=canvas.getBoundingClientRect();
      const mx=(e.clientX-rect.left)*(CW/rect.width);
      const my=(e.clientY-rect.top)*(CH/rect.height);
      pickEnemy(mx,my);
    });
    canvas.addEventListener('touchstart',e=>{
      if(state!=='playing'||!enemies.length) return;
      const t=e.touches[0]; if(!t) return;
      const rect=canvas.getBoundingClientRect();
      const mx=(t.clientX-rect.left)*(CW/rect.width);
      const my=(t.clientY-rect.top)*(CH/rect.height);
      pickEnemy(mx,my);
    },{passive:true});
    if(startBtnEl) startBtnEl.addEventListener('click', ()=>{ hideBtns(); startNormal(); });
    if(speedrunBtnEl) speedrunBtnEl.addEventListener('click', ()=>{ hideBtns(); startSpeedrun(); });
    if(retryBtnEl) retryBtnEl.addEventListener('click', ()=>{ hideBtns(); speedrun?startSpeedrun():startNormal(); });
    if(exitBtnEl) exitBtnEl.addEventListener('click', ()=>{ showExitConfirm(); });
    if(exitCancelEl) exitCancelEl.addEventListener('click', ()=>{ hideExitConfirm(); });
    if(exitConfirmEl) exitConfirmEl.addEventListener('click', ()=>{ hideExitConfirm(); doExit(); });
    if(exitOverlayEl) exitOverlayEl.addEventListener('click', (e)=>{ if(e.target===exitOverlayEl) hideExitConfirm(); });
    const tcLeft=document.getElementById('tcLeft'), tcRight=document.getElementById('tcRight'), tcFire=document.getElementById('tcFire');
    const bindHold=(el,key)=>{
      if(!el) return;
      const down=(e)=>{ e.preventDefault(); keys[key]=true; };
      const up=(e)=>{ e.preventDefault(); keys[key]=false; };
      el.addEventListener('touchstart',down,{passive:false});
      el.addEventListener('touchend',up,{passive:false});
      el.addEventListener('touchcancel',up,{passive:false});
      el.addEventListener('mousedown',down);
      window.addEventListener('mouseup',up);
    };
    bindHold(tcLeft,'ArrowLeft'); bindHold(tcRight,'ArrowRight');
    let _lastMobFire=0;
    if(tcFire){
      const mobileFire=(e)=>{
        if(e) e.preventDefault();
        if(Date.now()-_lastMobFire<450) return;
        _lastMobFire=Date.now();
        if(state!=='playing') return;
        if(bossDodge && !cssBoss){
          if(!doBossDodgeShoot()) {
            if(bossBullets<=0) { try{ showToast('🔫 Sin balas, recoge 🔫'); }catch(err){ if(inputEl) inputEl.placeholder='Sin balas, recoge 🔫'; } }
          }
          return;
        }
        fireAnswer();
      };
      tcFire.addEventListener('touchstart',mobileFire,{passive:false});
      tcFire.addEventListener('click',mobileFire);
      tcFire.addEventListener('touchend',(e)=>{ e.preventDefault(); },{passive:false});
    }
    if(inputEl){
      inputEl.addEventListener('keydown',(e)=>{
        if(e.key==='Enter'){ e.preventDefault(); if(bossDodge && !cssBoss) { if(!doBossDodgeShoot()) fireAnswer(); } else fireAnswer(); }
      });
    }
    const answerFireBtn=document.getElementById('answerFireBtn');
    if(answerFireBtn){
      let _lastAF=0;
      const af=(e)=>{ if(e) e.preventDefault(); if(Date.now()-_lastAF<450) return; _lastAF=Date.now(); if(bossDodge && !cssBoss) doBossDodgeShoot(); else fireAnswer(); };
      answerFireBtn.addEventListener('touchstart',af,{passive:false});
      answerFireBtn.addEventListener('click',af);
    }
    const unlockAudio=()=>{ initAudio(); document.body.removeEventListener('click',unlockAudio); document.removeEventListener('keydown',unlockAudio); };
    document.body.addEventListener('click',unlockAudio);
    document.addEventListener('keydown',unlockAudio);
    initShopUI();
    showBtns();
    this.toggleLeaderboard();
    requestAnimationFrame(loop);
  }
  function loadShopLocal(){
    try{
      const st=store(); const pref=isLogged()?`ci_${uid()}_`:`ci_guest_`;
      const c=st.getItem(pref+'coins'); if(c!==null) coins=parseInt(c)||0; else coins=0;
      const o=st.getItem(pref+'owned'); if(o) { try{ ownedSkins=JSON.parse(o); }catch(e){} } else ownedSkins=['default'];
      const e=st.getItem(pref+'equipped'); equipped=e||'default';
      if(!ownedSkins.includes('default')) ownedSkins.unshift('default');
      const sc=st.getItem(pref+'score'); if(sc!==null){ const s=parseInt(sc)||0; if(s>score) score=s; }
      const sb=st.getItem(pref+'speedrun_best'); if(sb!==null) speedrunBest=parseFloat(sb); else speedrunBest=null;
      updateShopUI(); updateHUD();
    }catch(e){}
  }
  function saveShopLocal(){
    try{
      const st=store(); const pref=isLogged()?`ci_${uid()}_`:`ci_guest_`;
      st.setItem(pref+'coins', String(coins));
      st.setItem(pref+'owned', JSON.stringify(ownedSkins));
      st.setItem(pref+'equipped', equipped);
      st.setItem(pref+'score', String(score));
      if(speedrunBest!==null) st.setItem(pref+'speedrun_best', String(speedrunBest));
    }catch(e){}
  }
  function clearGuestSession(){
    try{ const pref='ci_guest_'; sessionStorage.removeItem(pref+'coins'); sessionStorage.removeItem(pref+'owned'); sessionStorage.removeItem(pref+'equipped'); sessionStorage.removeItem(pref+'score'); sessionStorage.removeItem(pref+'speedrun_best'); }catch(e){}
  }
  async function syncShopFromServer(){
    if(typeof API==='undefined') return;
    try{
      const me=await API.me();
      if(me && me.coins!==undefined){
        coins=me.coins; if(me.skins) ownedSkins=me.skins; if(me.equipped) equipped=me.equipped;
        if(me.user && me.user.speedrunBest!=null) speedrunBest=me.user.speedrunBest;
        score=Math.max(score,coins);
        saveShopLocal(); updateShopUI(); updateHUD();
      }
    }catch(e){
      if(!isLogged()){
        loadShopLocal();
      }
    }
  }
  async function pushSpeedrun(time){
    if(typeof API==='undefined' || typeof API.saveSpeedrun!=='function') return;
    const t=Math.round(Number(time)||0);
    if(!isLogged()){
      try{ const st=store(); const pref=`ci_${uid()}_`; const cur=st.getItem(pref+'speedrun_best'); if(cur==null || t < Number(cur)) st.setItem(pref+'speedrun_best', String(t)); }catch(e){}
      try{ if(typeof Toast!=='undefined') Toast.error('Inicia sesión para guardar tu récord en el ranked'); else showToast('Inicia sesión para guardar récord'); }catch(e){}
      return;
    }
    try{
      const r=await API.saveSpeedrun(t);
      if(r && r.isNewBest){
        speedrunBest=t;
        try{ const st=store(); const pref=`ci_${uid()}_`; st.setItem(pref+'speedrun_best', String(t)); }catch(e){}
        try{ if(typeof Toast!=='undefined') Toast.success('⚡ Nuevo récord '+formatTime(t)+' guardado'); else showToast('⚡ Récord '+formatTime(t)+' guardado'); }catch(e){}
        if(typeof Ranked!=='undefined' && Ranked.loadRanking) try{ Ranked.loadRanking(); }catch(e){}
      } else {
        try{ if(typeof Toast!=='undefined') Toast.info('⏱ '+formatTime(t)+' - no superaste tu mejor ('+(speedrunBest?formatTime(speedrunBest):'-')+')'); else showToast('⏱ '+formatTime(t)); }catch(e){}
      }
    }catch(e){
      console.error('speedrun save fail',e);
      try{ const st=store(); const pref=`ci_${uid()}_`; const cur=st.getItem(pref+'speedrun_best'); if(cur==null || t < Number(cur)) st.setItem(pref+'speedrun_best', String(t)); }catch(err){}
      const msg=(e&&e.message)||'Error al guardar';
      try{ if(typeof Toast!=='undefined') Toast.error(msg); else showToast(msg); }catch(err){}
    }
  }
  function refreshSession(){
    migrateIfNeeded();
    if(isLogged()){
      coins=0; ownedSkins=['default']; equipped='default'; score=0; speedrunBest=null;
      try{
        const uid=Auth.user.id;
        const backup=localStorage.getItem('ci_'+uid+'_progress');
        if(backup && Auth.progress && !Auth.progress.length){
          try{ const arr=JSON.parse(backup); if(arr.length) Auth.progress=arr; }catch(e){}
        }
        if(Auth.progress && Auth.progress.length){
          localStorage.setItem('ci_'+uid+'_progress', JSON.stringify(Auth.progress));
        }
      }catch(e){}
    } else {
      try{
        const c=sessionStorage.getItem('ci_guest_coins'); coins=c?parseInt(c)||0:0;
        const o=sessionStorage.getItem('ci_guest_owned'); ownedSkins=o?JSON.parse(o):['default'];
        const e=sessionStorage.getItem('ci_guest_equipped'); equipped=e||'default';
        const sc=sessionStorage.getItem('ci_guest_score'); score=sc?parseInt(sc)||0:0;
        const sb=sessionStorage.getItem('ci_guest_speedrun_best'); speedrunBest=sb?parseFloat(sb):null;
      }catch(e){ coins=0; ownedSkins=['default']; equipped='default'; score=0; speedrunBest=null; }
    }
    loadShopLocal();
  }
  function onLogoutCleanup(){
    coins=0; score=0; ownedSkins=['default']; equipped='default'; speedrunBest=null;
    try{ clearGuestSession(); localStorage.removeItem('shop_coins'); localStorage.removeItem('shop_owned'); localStorage.removeItem('shop_equipped'); localStorage.removeItem('fx_score'); localStorage.removeItem('speedrun_best'); }catch(e){}
    updateShopUI(); updateHUD();
  }
  function formatTime(ms){ const s=ms/1000, m=Math.floor(s/60), sec=Math.floor(s%60), cs=Math.floor((ms%1000)/10); return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs).padStart(2,'0'); }
  function updateSpeedrunHud(){
    if(!speedrunHudEl) return;
    if(!speedrun||state==='title'){ speedrunHudEl.classList.add('hidden'); return; }
    speedrunHudEl.classList.remove('hidden');
    let ms=speedrunTime;
    if(state==='playing'||state==='intro') ms=speedrunFinished?speedrunTime:(performance.now()-speedrunStart);
    else if(speedrunFinished) ms=speedrunTime;
    speedrunHudEl.textContent='⏱ '+formatTime(ms);
    speedrunHudEl.classList.toggle('speedrun-warn', ms>45000);
  }
  function isMobileFS(){ try{ return window.matchMedia('(max-width:768px)').matches || ('ontouchstart' in window) || navigator.maxTouchPoints>0; }catch(e){ return false; } }
  function enterMobileFS(){
    if(!isMobileFS()) return;
    try{
      const el=document.documentElement;
      if(!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen().catch(()=>{});
      else if(!document.webkitFullscreenElement && el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    }catch(e){}
    setTimeout(()=>{ if(inputEl && state!=='title'){ inputEl.disabled=false; inputEl.focus(); } }, 300);
  }
  function exitMobileFS(){
    try{
      if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(()=>{});
      else if(document.webkitFullscreenElement && document.webkitExitFullscreen) document.webkitExitFullscreen();
    }catch(e){}
    if(inputEl) inputEl.blur();
  }
  document.addEventListener('fullscreenchange',()=>{
    if(!document.fullscreenElement && !document.webkitFullscreenElement && state==='title'){
      if(inputEl) inputEl.blur();
    }
  });
  function isTyping(){ const a=document.activeElement; return a && (a.tagName==='INPUT' || a.tagName==='TEXTAREA' || a.isContentEditable); }
  function isInGame(){ return state==='playing'||state==='intro'||state==='levelcomplete'||state==='bossquiz'; }
  function updateExitBtn(){ if(!exitBtnEl) return; if(isInGame()) exitBtnEl.classList.remove('hidden'); else exitBtnEl.classList.add('hidden'); if(exitOverlayEl && !isInGame()) exitOverlayEl.classList.add('hidden'); }
  function showExitConfirm(){ if(!isInGame()||!exitOverlayEl) return; exitOverlayEl.classList.remove('hidden'); if(inputEl) inputEl.blur(); }
  function hideExitConfirm(){ if(exitOverlayEl) exitOverlayEl.classList.add('hidden'); if(isInGame() && inputEl){ inputEl.focus(); } }
  function doExit(){ hideExitConfirm(); exitMobileFS(); state='title'; bossDodge=false; bossQuizActive=false; speedrun=false; speedrunFinished=false; if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); levelData=null; enemies=[]; currentEnemy=null; particles=[]; lasers=[]; bossTags=[]; bossItems=[]; if(inputEl){ inputEl.value=''; inputEl.disabled=false; inputEl.blur(); } updateHUD(); updateExitBtn(); showBtns(); if(typeof saveProgress==='function') saveProgress(false); }
  function showBtns(){
    if(startBtnEl){
      startBtnEl.textContent='▶ JUGAR';
      startBtnEl.classList.remove('hidden');
    }
    if(speedrunBtnEl) speedrunBtnEl.classList.remove('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); updateExitBtn(); }
  function showRetryBtn(){ if(startBtnEl) startBtnEl.classList.remove('hidden'); if(speedrunBtnEl) speedrunBtnEl.classList.remove('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); updateExitBtn(); }
  function hideBtns(){ if(startBtnEl) startBtnEl.classList.add('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(speedrunBtnEl) speedrunBtnEl.classList.add('hidden'); updateExitBtn(); }
  function startNormal(){ speedrun=false; speedrunFinished=false; speedrunTime=0; 
  if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); score=0; if(isLogged()){ try{ const v=localStorage.getItem(`ci_${uid()}_coins`); coins=v?parseInt(v)||0:0; }catch(e){ coins=0; } } else { try{ const v=sessionStorage.getItem('ci_guest_coins'); coins=v?parseInt(v)||0:0; }catch(e){ coins=0; } } lives=2;
  let sIdx=0;
  startLevel(sIdx); enterMobileFS(); }
  function startSpeedrun(){ speedrun=true; speedrunFinished=false; speedrunTime=0; speedrunStart=performance.now(); 
  score=0; lives=2; startLevel(0); if(speedrunHudEl) speedrunHudEl.classList.remove('hidden'); updateSpeedrunHud(); enterMobileFS(); }
  function startLevel(lvl){
    level=lvl; const base=LEVELS[level];
    if(speedrun && level===0){ levelData={...base,title:base.title+' ⚡ SPEEDRUN',enemySpeed:1.45,spawnInterval:45,enemyHealth:1}; }
    else levelData=base;
    questionsLeft=levelData.questions.map(q=>({...q}));
    bossPool=levelData.questions.map(q=>({...q}));
    enemies=[]; currentEnemy=null; particles=[]; lasers=[]; frameCount=0; shootCooldown=0;
    comboCount=0; comboTimer=0; comboPop=0; slowTimer=0; fastTimer=0;
    player.speed=player.baseSpeed; state='intro'; levelPause=90;
    if(inputEl){ inputEl.value=''; inputEl.disabled=true; }
    if(levelData.isBoss){
      if(levelData.isCssBoss){
        cssBoss=true; cssBossWave=0; cssBossSpawnTimer=0; cssBossBubble='¡Soy el Jefe CSS! Destruye mis etiquetas 😈'; cssBossBubbleTimer=90;
        bossDodge=false; bossX=CW/2; bossY=80; bossHP=levelData.bossHealth; bossMaxHP=levelData.bossHealth;
        enemies=[]; currentEnemy=null; particles=[]; bossTags=[]; bossItems=[];
      } else {
        cssBoss=false; bossDodge=true; bossDodgeState='playing';
        bossX=CW/2; bossY=100; bossHP=levelData.bossHealth; bossMaxHP=levelData.bossHealth;
        bossVX=1.8+Math.random()*0.8; bossVY=1.2+Math.random()*0.6;
        bossBullets=3; bossItems=[]; bossTags=[]; bossItemTimer=0; bossTagTimer=0;
        invertedTimer=0; bossQuizActive=false; bossQuizData=null; bossQuizLocked=false;
        bossDodgeScore=0;
      }
    } else {
      bossDodge=false; cssBoss=false;
    }
    updateHUD();
  }
  function buildFormation(){
    if(levelData.isBoss){ buildBoss(); return; }
    const qs=levelData.questions; const cols=5, spacingX=132;
    const totalCols=Math.min(qs.length,cols); const startX=CW/2-((totalCols-1)*spacingX)/2; const topY=104;
    qs.forEach((q,i)=>{ const col=i%cols, row=Math.floor(i/cols); enemies.push({baseX:startX+col*spacingX,baseY:topY+row*64,x:0,y:0,w:104,h:62,health:levelData.enemyHealth,maxHealth:levelData.enemyHealth,question:q.q,answer:q.a,flash:0,wobble:Math.random()*Math.PI*2,wobbleAmp:speedrun?0.9+Math.random()*1.0:0.5+Math.random()*0.4,wobbleSpeed:speedrun?0.07+Math.random()*0.05:0.04}); });
    questionsLeft=[]; formationOffset=0; formationDrift=0; formationDir=1;
    if(speedrun){ formationCountdown=SPEEDRUN_COUNTDOWN; formationSway=1.55; formationAdvance=0.45; } else { formationCountdown=FORMATION_COUNTDOWN_FRAMES; formationSway=0.6+levelData.enemySpeed*0.3; formationAdvance=0.08+levelData.enemySpeed*0.12; }
  }
  function buildBoss(){
    const q=bossPool[Math.floor(Math.random()*bossPool.length)];
    enemies=[{baseX:CW/2,baseY:110,x:CW/2,y:110,w:170,h:110,health:levelData.bossHealth,maxHealth:levelData.bossHealth,question:q.q,answer:q.a,flash:0,wobble:0,wobbleAmp:0,isBoss:true}];
    currentEnemy=enemies[0];
    formationCountdown=0; formationOffset=0; formationDrift=0;
  }
  function nextBossQuestion(){
    if(!levelData.isBoss||!enemies.length) return;
    const boss=enemies[0];
    let q=bossPool[Math.floor(Math.random()*bossPool.length)];
    if(bossPool.length>1){ let tries=0; while(q.q===boss.question && tries<8){ q=bossPool[Math.floor(Math.random()*bossPool.length)]; tries++; } }
    boss.question=q.q; boss.answer=q.a; boss.flash=12;
    currentEnemy=boss;
  }
  function moveFormation(){
    if(cssBoss && levelData && levelData.isCssBoss){
      return;
    }
    if(levelData && levelData.isBoss){
      if(enemies.length){ const b=enemies[0]; b.wobble=(b.wobble||0)+0.03; b.x=CW/2+Math.sin(b.wobble)*6; b.y=110+Math.sin(b.wobble*0.7)*4; if(b.flash>0) b.flash--; }
      return;
    }
    if(formationCountdown>0) formationOffset+=formationDir*formationSway;
    let minX=Infinity,maxX=-Infinity;
    for(const e of enemies){ const ex=e.baseX+formationOffset; if(ex-e.w/2<minX)minX=ex-e.w/2; if(ex+e.w/2>maxX)maxX=ex+e.w/2; }
    if(minX<=5){ formationOffset+=(5-minX); formationDir=1; }
    if(maxX>=CW-5){ formationOffset-=(maxX-(CW-5)); formationDir=-1; }
    if(formationCountdown<=0){ formationDrift+=formationAdvance; let cx=0; for(const e of enemies) cx+=e.baseX; cx=(enemies.length?cx/enemies.length:player.x)+formationOffset; const diff=player.x-cx; if(Math.abs(diff)>15) formationOffset+=Math.sign(diff)*formationAdvance*4; }
    for(const e of enemies){
      if(speedrun){ e.wobble+=e.wobbleSpeed; const extra=Math.sin(frameCount*0.03+e.baseX*0.01)*3.5; e.x=e.baseX+formationOffset+Math.sin(e.wobble)*e.wobbleAmp*3+extra; if(frameCount%120===0&&Math.random()<0.35) e.baseX+=(Math.random()-0.5)*12; }
      else{ e.wobble+=0.04; e.x=e.baseX+formationOffset+Math.sin(e.wobble)*e.wobbleAmp; }
      e.y=e.baseY+formationDrift; if(e.flash>0) e.flash--;
    }
  }
  function makeLaser(x1,y1,x2,y2,color){ lasers.push({x1,y1,x2,y2,color,life:15}); }
  function explode(x,y,color,count){ for(let i=0;i<count;i++){ const a=Math.random()*Math.PI*2,sp=1+Math.random()*4; particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:25+Math.random()*20,maxLife:45,color,size:2+Math.random()*3}); } }
  let audioCtx=null;
  function initAudio(){ if(audioCtx) return; const Ctor=window.AudioContext||window.webkitAudioContext; if(!Ctor) return; audioCtx=new Ctor(); }
  function resumeAudio(){ if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume(); }
  function _tone(freq,t,dur,type,vol){ if(!audioCtx) return; const g=audioCtx.createGain(),o=audioCtx.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t+dur); }
  function playSound(type){ if(!audioCtx) initAudio(); if(!audioCtx) return; resumeAudio(); const now=audioCtx.currentTime; switch(type){ case 'laser': _tone(880,now,0.12,'sine',0.18); break; case 'explosion': _tone(180,now,0.35,'sawtooth',0.25); _tone(90,now+0.05,0.3,'square',0.15); break; case 'hit': _tone(130,now,0.3,'sine',0.18); break; case 'combo': _tone(330,now,0.18,'sine',0.15); _tone(440,now+0.1,0.18,'sine',0.15); _tone(660,now+0.2,0.22,'sine',0.18); break; case 'pickup': _tone(440,now,0.2,'sine',0.14); _tone(880,now+0.12,0.25,'sine',0.14); break; } }
  function addCoins(n){ if(!n) return; coins+=n; score+=n; saveShopLocal(); updateHUD(); updateShopUI(); if(typeof API!=='undefined'&&typeof Auth!=='undefined'&&Auth.isLogged){ API.saveProgress(level+1,1,false,n).catch(()=>{}); } }
  function doBossDodgeShoot(){
    if(state!=='playing' || bossQuizActive) return false;
    if(shootCooldown>0 || bossBullets<=0) return false;
    shootCooldown=15; bossBullets--;
    makeLaser(player.x,player.y-22,bossX,bossY,'#ff0');
    bossHP--; bossDodgeScore+=15; addCoins(5); if(typeof Profile!=='undefined') Profile.addExp(10,0); scorePop=12; playSound('explosion');
    if(bossHP<=0){ explode(bossX,bossY,'#ff0',40); bossDodge=false; addCoins(100); if(typeof Profile!=='undefined') Profile.addExp(100,100); if(level < LEVELS.length-1){ state='levelcomplete'; saveProgress(true); setTimeout(()=>startLevel(level+1),1500); } else { state='bossWin'; showRetryBtn(); saveProgress(true); } }
    updateHUD(); return true;
  }
  function damagePlayer(){
    lives--; shootCooldown=45;
    comboCount=0; comboTimer=0; comboPop=0; slowTimer=0; fastTimer=0; player.speed=player.baseSpeed;
    explode(player.x,player.y,'#f44',12); playSound('hit');
    if(lives<=0){
      state='gameover'; if(typeof Profile!=='undefined') Profile.addExp(10*level,10*level); if(inputEl) inputEl.disabled=true;
      if(speedrun&&!speedrunFinished){ speedrunTime=performance.now()-speedrunStart; speedrunFinished=true; try{ if(!speedrunBest||speedrunTime<speedrunBest){ const st=store(); const pref=isLogged()?`ci_${uid()}_`:`ci_guest_`; st.setItem(pref+'speedrun_best', String(speedrunTime)); speedrunBest=speedrunTime; } }catch(e){} pushSpeedrun(speedrunTime); }
      showBtns();
      const mb=document.getElementById('modeBtns'); if(mb) mb.classList.remove('hidden');
      if(startBtnEl) startBtnEl.classList.remove('hidden');
      if(speedrunBtnEl) speedrunBtnEl.classList.remove('hidden');
      if(retryBtnEl) retryBtnEl.classList.add('hidden');
      if(speedrunHudEl) speedrunHudEl.classList.add('hidden');
      saveProgress(false);
    }
    updateHUD();
  }
  function checkLevelComplete(){
    if(levelData && levelData.isBoss) return;
    if(enemies.length===0&&questionsLeft.length===0&&state==='playing'){
      if(speedrun){ speedrunTime=performance.now()-speedrunStart; speedrunFinished=true; try{ if(!speedrunBest||speedrunTime<speedrunBest){ const st=store(); const pref=isLogged()?`ci_${uid()}_`:`ci_guest_`; st.setItem(pref+'speedrun_best', String(speedrunTime)); speedrunBest=speedrunTime; } }catch(e){} pushSpeedrun(speedrunTime); state='speedrunWin'; if(inputEl) inputEl.disabled=true; showRetryBtn(); saveProgress(true); return; }
      const earned=10*(level+1);
      addCoins(earned);
      state='levelcomplete'; if(inputEl) inputEl.disabled=true; saveProgress(true);
      if(level<LEVELS.length-1){ setTimeout(()=>startLevel(level+1),2000); } else { state='win'; if(typeof Profile!=='undefined') Profile.addExp(100,100); showRetryBtn(); }
    }
  }
  function updateBossDodge(){
    const dt=1/60;
    let moveSpd=player.baseSpeed;
    if(invertedTimer>0){ invertedTimer-=dt; moveSpd=-moveSpd; }
    if(!isTyping()){
      if(keys['ArrowLeft']||keys['a']||keys['A']) player.x-=moveSpd;
      if(keys['ArrowRight']||keys['d']||keys['D']) player.x+=moveSpd;
    }
    player.x=Math.max(player.w/2,Math.min(CW-player.w/2,player.x));
    bossX+=bossVX; bossY+=bossVY;
    if(bossX<=60 || bossX>=CW-60) bossVX*=-1;
    if(bossY<=60 || bossY>=160) bossVY*=-1;
    bossX=Math.max(60,Math.min(CW-60,bossX)); bossY=Math.max(60,Math.min(160,bossY));
    bossTagTimer+=dt;
    if(bossTagTimer>=0.9){ bossTagTimer=0; const t=BOSS_TAG_DEFS[Math.floor(Math.random()*BOSS_TAG_DEFS.length)]; bossTags.push({x:bossX+(Math.random()-0.5)*80,y:bossY+40,speed:2.5+Math.random()*1.5,tag:t.tag,color:t.color,rot:0,rotSpd:(Math.random()-0.5)*3,w:50,h:50}); }
    for(let i=bossTags.length-1;i>=0;i--){ const t=bossTags[i]; t.y+=t.speed; t.rot+=t.rotSpd*0.02; if(t.y>H+40){ bossTags.splice(i,1); continue; } if(Math.abs(player.x-t.x)<(player.w+t.w)/2-10&&Math.abs(player.y-t.y)<(player.h+t.h)/2-10){ bossTags.splice(i,1); if(!bossQuizActive) bossDamagePlayer(); } }
    bossItemTimer+=dt;
    if(bossItemTimer>=5+Math.random()*4){ bossItemTimer=0; spawnBossItem(); }
    for(let i=bossItems.length-1;i>=0;i--){ const it=bossItems[i]; it.y+=it.speed||1.4; it.bob+=dt*2.5; const iy=it.y+Math.sin(it.bob)*10; if(it.y>H+40){ bossItems.splice(i,1); continue; } if(Math.abs(player.x-it.x)<45&&Math.abs(player.y-iy)<45){ collectBossItem(it); bossItems.splice(i,1); } }
    if(bossQuizActive) return;
    if(keys[' ']&&shootCooldown<=0&&bossBullets>0){ doBossDodgeShoot(); }
    for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life--; if(p.life<=0) particles.splice(i,1); }
    updateHUD();
  }
  function spawnBossItem(){
    const types=['bullets','question','trap'];
    const weights=[0.4,0.3,0.3];
    let r=Math.random(),type=types[0],acc=0;
    for(let i=0;i<types.length;i++){ acc+=weights[i]; if(r<acc){ type=types[i]; break; } }
    const colors={bullets:'#ffab00',question:'#ffd54f',trap:'#f44'};
    const labels={bullets:'🔫',question:'❓',trap:'💀'};
    bossItems.push({x:100+Math.random()*(CW-200),y:bossY+30,type,color:colors[type],label:labels[type],bob:Math.random()*Math.PI*2,speed:1.2+Math.random()*0.8});
  }
  function collectBossItem(it){
    playSound('pickup');
    if(it.type==='bullets'){ bossBullets=Math.min(bossBullets+3,3); showToast('🔫 +3 balas (máx 3)'); }
    else if(it.type==='question'){ openBossQuiz(); }
    else if(it.type==='trap'){
      if(Math.random()<0.5){ lives--; showToast('💀 Trampa: -1 vida'); explode(player.x,player.y,'#f44',15); playSound('hit'); if(lives<=0){ bossDodge=false; state='gameover'; if(typeof Profile!=='undefined') Profile.addExp(10*level,10*level); showBtns(); saveProgress(false); } }
      else { invertedTimer=4; showToast('💀 Trampa: controles invertidos 4s'); }
    }
  }
  function openBossQuiz(){
    const q=BOSS_QUIZ[Math.floor(Math.random()*BOSS_QUIZ.length)];
    bossQuizData=q; bossQuizActive=true; bossQuizLocked=false;
    state='bossquiz';
    const overlay=document.getElementById('quizOverlay');
    const qText=document.getElementById('quizQuestion');
    const optionsDiv=document.getElementById('quizOptions');
    const feedback=document.getElementById('quizFeedback');
    overlay.classList.remove('hidden');
    qText.textContent=q.q;
    feedback.classList.add('hidden'); feedback.textContent='';
    optionsDiv.innerHTML='';
    q.options.forEach((opt,idx)=>{
      const btn=document.createElement('button');
      btn.className='quiz-option'; btn.textContent=opt;
      btn.addEventListener('click',()=>answerBossQuiz(idx));
      optionsDiv.appendChild(btn);
    });
    overlay.addEventListener('click',(e)=>{ if(e.target===overlay&&state==='bossquiz'){ overlay.classList.add('hidden'); state='playing'; bossQuizActive=false; } });
  }
  function answerBossQuiz(idx){
    if(!bossQuizData||bossQuizLocked) return;
    bossQuizLocked=true;
    const btns=document.querySelectorAll('#quizOptions .quiz-option');
    const feedback=document.getElementById('quizFeedback');
    btns.forEach((b,i)=>{ b.disabled=true; if(i===bossQuizData.a) b.classList.add('correct'); if(i===idx&&idx!==bossQuizData.a) b.classList.add('wrong'); });
    if(idx===bossQuizData.a){ bossBullets=Math.min(bossBullets+3,3); feedback.textContent='✅ ¡Correcto! +3 balas. '+bossQuizData.exp; feedback.className='quiz-feedback correct'; }
    else { feedback.textContent='❌ Incorrecto. '+bossQuizData.exp; feedback.className='quiz-feedback wrong'; }
    feedback.classList.remove('hidden');
    setTimeout(()=>{ document.getElementById('quizOverlay').classList.add('hidden'); state='playing'; bossQuizActive=false; },2200);
  }
  function bossDamagePlayer(){
    if(invertedTimer>0) return;
    lives--; playSound('hit'); explode(player.x,player.y,'#f44',12);
    if(lives<=0){
      bossDodge=false; cssBoss=false; state='gameover'; if(typeof Profile!=='undefined') Profile.addExp(10*level,10*level);
      showBtns();
      const mb=document.getElementById('modeBtns'); if(mb) mb.classList.remove('hidden');
      if(startBtnEl) startBtnEl.classList.remove('hidden');
      if(speedrunBtnEl) speedrunBtnEl.classList.remove('hidden');
      saveProgress(false);
    }
    updateHUD();
  }
  const CSS_FAIL_MSGS=['¡Que burro! 😂','¡Estudiá CSS! 📚','¡Fallaste! Yo me río 😈','¡Ni eso sabés? 🤣','¡Burro nivel Dios! 🐴'];
  const CSS_HIT_MSGS=['¡Auch! 😡','¡Me diste! 🤬','¡Sorpresa! 😲','¡Te odio! 👿','¡Me enojo! 🔥'];
  const CSS_KILL_MSGS=['¡Nooo! 💀','¡Imposible! 😱','¡Te odio más! 🤯','¡Me enfada! 😤'];
  function showCssBubble(txt,frames=90){ cssBossBubble=txt; cssBossBubbleTimer=frames; }
  function spawnCssWave(){
    const pool=levelData.questions;
    for(let i=0;i<2;i++){
      const q=pool[Math.floor(Math.random()*pool.length)];
      const sx=bossX + (i===0?-70:70) + (Math.random()*20-10);
      enemies.push({baseX:sx,baseY:130,x:sx,y:130,w:74,h:44,health:1,maxHealth:1,question:q.q,answer:q.a,flash:0,wobble:Math.random()*Math.PI*2,wobbleAmp:0.5,wobbleSpeed:0.04,vy:0.5+Math.random()*0.15});
    }
    cssBossWave++;
  }
  function updateCssBoss(){
    if(cssBossBubbleTimer>0) cssBossBubbleTimer--;
    if(enemies.length===0 && state==='playing'){
      cssBossSpawnTimer--;
      if(cssBossSpawnTimer<=0){
        spawnCssWave(); cssBossSpawnTimer=0;
      }
    }
    for(let i=enemies.length-1;i>=0;i--){
      const e=enemies[i];
      e.wobble+=e.wobbleSpeed; e.x=e.baseX+Math.sin(e.wobble)*3;
      e.y+=e.vy; if(e.flash>0) e.flash--;
      if(e.y>H+50){ if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); damagePlayer(); showCssBubble(CSS_FAIL_MSGS[Math.floor(Math.random()*CSS_FAIL_MSGS.length)],70); }
      else {
        const dx=e.x-player.x, dy=e.y-player.y;
        if(Math.abs(dx)<(e.w+player.w)/2-8 && Math.abs(dy)<(e.h+player.h)/2-8){ if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); explode(e.x,e.y,'#f44',12); damagePlayer(); showCssBubble(CSS_FAIL_MSGS[Math.floor(Math.random()*CSS_FAIL_MSGS.length)],70); }
      }
    }
    if(bossHP<=0){
      explode(bossX,bossY,'#ff0',40); cssBoss=false; bossDodge=false; addCoins(100); if(typeof Profile!=='undefined') Profile.addExp(100,100);
      if(level < LEVELS.length-1){
        state='levelcomplete'; saveProgress(true); setTimeout(()=>startLevel(level+1),1500);
      } else {
        state='bossWin'; showRetryBtn(); saveProgress(true);
      }
    }
    for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life--; if(p.life<=0) particles.splice(i,1); }
    for(let i=lasers.length-1;i>=0;i--){ lasers[i].life--; if(lasers[i].life<=0) lasers.splice(i,1); }
    if(!isTyping()){
      if(keys['ArrowLeft']||keys['a']||keys['A']) player.x-=player.speed;
      if(keys['ArrowRight']||keys['d']||keys['D']) player.x+=player.speed;
    }
    player.x=Math.max(player.w/2,Math.min(CW-player.w/2,player.x));
    updateHUD();
  }
  function drawCssBoss(){
    ctx.save();
    ctx.fillStyle='#264de4'; ctx.shadowColor='#1976d2'; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.ellipse(bossX,bossY+12,62,32,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#0d47a1'; ctx.beginPath();
    ctx.moveTo(bossX,bossY+26); ctx.lineTo(bossX-50,bossY-8); ctx.lineTo(bossX-28,bossY-26);
    ctx.lineTo(bossX,bossY-18); ctx.lineTo(bossX+28,bossY-26); ctx.lineTo(bossX+50,bossY-8); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#90caf9'; ctx.beginPath(); ctx.arc(bossX,bossY-6,20,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🎨',bossX,bossY-4);
    const bw=200,hp=bossHP/bossMaxHP;
    ctx.fillStyle='#400'; ctx.fillRect(bossX-bw/2,bossY-50,bw,8);
    ctx.fillStyle=hp>0.5?'#42a5f5':hp>0.25?'#ffd600':'#f44'; ctx.fillRect(bossX-bw/2,bossY-50,bw*hp,8);
    ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(bossX-bw/2,bossY-50,bw,8);
    ctx.fillStyle='#fff'; ctx.font='bold 10px monospace'; ctx.fillText('❤️ '+bossHP+'/'+bossMaxHP,bossX,bossY-42);
    if(cssBossBubble && cssBossBubbleTimer>0){
      const bx=bossX+90, by=bossY-30;
      ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.strokeStyle='#264de4'; ctx.lineWidth=2;
      const pad=8; ctx.font='bold 11px monospace'; const tw=ctx.measureText(cssBossBubble).width;
      const rw=tw+pad*2, rh=28;
      ctx.beginPath(); ctx.roundRect(bx,by-rw*0,rw,rh,10); ctx.fill(); ctx.stroke();
      ctx.fillStyle='#0d47a1'; ctx.textAlign='center'; ctx.fillText(cssBossBubble,bx+rw/2,by+rh/2+2);
      ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.moveTo(bx+10,by+rh-2); ctx.lineTo(bx+4,by+rh+8); ctx.lineTo(bx+18,by+rh-2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function drawBossDodge(){
    ctx.save();
    ctx.fillStyle='#ab47bc'; ctx.shadowColor='#a020f0'; ctx.shadowBlur=25;
    ctx.beginPath(); ctx.ellipse(bossX,bossY+14,55,35,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#6a1b9a'; ctx.beginPath();
    ctx.moveTo(bossX,bossY+30); ctx.lineTo(bossX-45,bossY-10); ctx.lineTo(bossX-25,bossY-30);
    ctx.lineTo(bossX,bossY-22); ctx.lineTo(bossX+25,bossY-30); ctx.lineTo(bossX+45,bossY-10);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ce93d8'; ctx.beginPath(); ctx.arc(bossX,bossY-8,18,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='24px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🐸',bossX,bossY-6);
    const bw=200,hp=bossHP/bossMaxHP;
    ctx.fillStyle='#400'; ctx.fillRect(bossX-bw/2,bossY-50,bw,8);
    ctx.fillStyle=hp>0.5?'#0f0':hp>0.25?'#ffd600':'#f44';
    ctx.fillRect(bossX-bw/2,bossY-50,bw*hp,8);
    ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(bossX-bw/2,bossY-50,bw,8);
    ctx.fillStyle='#fff'; ctx.font='bold 10px monospace'; ctx.fillText('❤️ '+bossHP+'/'+bossMaxHP,bossX,bossY-42);
    ctx.restore();
    for(const t of bossTags){ ctx.save(); ctx.translate(t.x,t.y); ctx.rotate(t.rot); ctx.fillStyle=t.color+'44'; ctx.fillRect(-t.w/2,-t.h/2,t.w,t.h); ctx.strokeStyle=t.color; ctx.lineWidth=2; ctx.strokeRect(-t.w/2,-t.h/2,t.w,t.h); ctx.fillStyle='#fff'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(t.tag,0,0); ctx.restore(); }
    for(const it of bossItems){ const iy=it.y+Math.sin(it.bob)*10; ctx.save(); ctx.translate(it.x,iy); ctx.fillStyle=it.color+'33'; ctx.beginPath(); ctx.arc(0,0,22,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=it.color; ctx.lineWidth=2; ctx.stroke(); ctx.font='20px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(it.label,0,2); ctx.restore(); }
    ctx.fillStyle='#7a8a9a'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    if(invertedTimer>0) ctx.fillText('💀 CONTROLES INVERTIDOS: '+Math.ceil(invertedTimer)+'s',CW/2,H-15);
    else if(bossBullets<=0) ctx.fillText('⬅ ➡ Mover  |  Recoge 🔫 para tener balas',CW/2,H-15);
    else ctx.fillText('⬅ ➡ Mover  |  SPACE Disparar (balas: '+bossBullets+')',CW/2,H-15);
  }

  function checkBossDefeat(){
    if(!levelData||!levelData.isBoss) return;
    if(enemies.length&&enemies[0].health<=0){
      explode(enemies[0].x,enemies[0].y,'#ff0',40);
      enemies=[]; currentEnemy=null;
      addCoins(100);
      if(level < LEVELS.length-1){
        state='levelcomplete'; if(inputEl) inputEl.disabled=true; saveProgress(true);
        setTimeout(()=>startLevel(level+1),1800);
      } else {
        state='bossWin'; if(inputEl) inputEl.disabled=true; showRetryBtn(); saveProgress(true);
      }
    }
  }
  function saveProgress(solved){
    const earned = solved ? (levelData&&levelData.isBoss?100:10*(level+1)) : 0;
    if(solved && Auth && Auth.progress){
      try{
        let e=Auth.progress.find(p=>p.level===level+1);
        if(!e){ e={level:level+1,attempts:1,solved:true,solvedAt:new Date().toISOString()}; Auth.progress.push(e); }
        else { e.solved=true; e.solvedAt=new Date().toISOString(); }
        if(isLogged()) localStorage.setItem('ci_'+uid()+'_progress', JSON.stringify(Auth.progress));
      }catch(err){}
    }
    if(typeof API!=='undefined'&&typeof Auth!=='undefined'&&Auth.isLogged) API.saveProgress(level+1,1,solved,earned).catch(()=>{});
    else if(earned) saveShopLocal();
  }
  function fireAnswer(){
    if(state!=='playing'||!inputEl) return;
    if(bossDodge && !cssBoss){
      if(!doBossDodgeShoot() && inputEl.value.trim()){
        const t=inputEl.value.trim().toLowerCase();
        const ok=bossTags.some(x=>x.tag.toLowerCase()===t);
        if(ok) doBossDodgeShoot();
        else { playSound('hit'); showToast('💥 Escribe o dispara con 💥'); }
      }
      inputEl.value=''; if(inputEl) inputEl.focus(); return;
    }
    if(shootCooldown>0) return;
    const typed=inputEl.value.trim(); if(!typed) return;
    shootCooldown=15; playSound('laser');
    if(cssBoss && levelData && levelData.isCssBoss){
      if(enemies.length===0){
        inputEl.value=''; if(inputEl) inputEl.focus(); updateHUD(); return;
      }
      const matching=enemies.filter(e=>e.answer.toLowerCase()===typed.toLowerCase());
      if(matching.length>0){
        for(const e of matching){ makeLaser(player.x,player.y-22,e.x,e.y,'#0f0'); explode(e.x,e.y,'#0f0',15); e.health=0; }
        const before=enemies.length;
        enemies=enemies.filter(e=>e.health>0);
        if(enemies.length < before){ score+=15; addCoins(5); scorePop=12; playSound('explosion'); showCssBubble(CSS_HIT_MSGS[Math.floor(Math.random()*CSS_HIT_MSGS.length)],70); }
        if(enemies.length===0){
          bossHP-=2; if(bossHP<0) bossHP=0; explode(bossX,bossY,'#0f0',10); showCssBubble(CSS_KILL_MSGS[Math.floor(Math.random()*CSS_KILL_MSGS.length)],90); playSound('explosion');
          if(bossHP<=0){ explode(bossX,bossY,'#ff0',40); cssBoss=false; bossDodge=false; addCoins(100); if(typeof Profile!=='undefined') Profile.addExp(100,100); state='bossWin'; showRetryBtn(); saveProgress(true); }
          else { cssBossSpawnTimer=60; }
        }
      } else {
        makeLaser(player.x,player.y-22,player.x+(Math.random()-0.5)*80,0,'#f66'); explode(player.x,player.y-30,'#f66',6);
        score=Math.max(0,score-3); coins=Math.max(0,coins-1); saveShopLocal(); scorePop=-8;
        showCssBubble(CSS_FAIL_MSGS[Math.floor(Math.random()*CSS_FAIL_MSGS.length)],80);
        damagePlayer();
      }
      inputEl.value=''; if(inputEl) inputEl.focus(); updateHUD(); return;
    }
    if(levelData&&levelData.isBoss){
      const boss=enemies[0];
      if(!boss) return;
      if(boss.answer.toLowerCase()===typed.toLowerCase()){
        makeLaser(player.x,player.y-22,boss.x,boss.y,'#0f0'); explode(boss.x,boss.y,'#0f0',18);
        boss.health--; boss.flash=14; score+=15; addCoins(5); scorePop=12; playSound('explosion');
        nextBossQuestion();
        checkBossDefeat();
      } else {
        makeLaser(player.x,player.y-22,player.x+(Math.random()-0.5)*80,0,'#f66'); explode(player.x,player.y-30,'#f66',6);
        score=Math.max(0,score-3); coins=Math.max(0,coins-1); saveShopLocal(); scorePop=-8;
        damagePlayer();
        if(state==='playing') nextBossQuestion();
      }
      inputEl.value=''; if(inputEl) inputEl.focus(); updateHUD(); return;
    }
    const matching=enemies.filter(e=>e.answer.toLowerCase()===typed.toLowerCase());
    if(matching.length>0){
      let destroyed=0;
      for(const e of matching){ makeLaser(player.x,player.y-22,e.x,e.y,'#0f0'); explode(e.x,e.y,'#0f0',15); e.health--; e.flash=12; if(e.health<=0){ explode(e.x,e.y,'#ff0',30); destroyed++; } }
      if(destroyed>0){
        enemies=enemies.filter(e=>e.health>0);
        if(currentEnemy&&currentEnemy.health<=0) currentEnemy=null;
        const prevCombo=comboCount; comboCount+=destroyed; comboTimer=1800; slowTimer=180; fastTimer=0; comboPop=24;
        const pts=destroyed*10*(level+1); score+=pts; addCoins(pts); if(typeof Profile!=='undefined') Profile.addExp(10*destroyed,0); if(comboCount>=3) { const b=destroyed*comboCount*2; score+=b; addCoins(b); }
        scorePop=12; playSound('explosion');
        if(comboCount>=3&&Math.floor(comboCount/3)>Math.floor(prevCombo/3)) playSound('combo');
        if(speedrun&&enemies.length>0&&destroyed>0&&Math.random()<0.5){ const idx=Math.floor(Math.random()*enemies.length); enemies[idx].baseX+=(Math.random()-0.5)*30; enemies[idx].wobbleAmp+=0.6; }
      }
    } else {
      makeLaser(player.x,player.y-22,player.x+(Math.random()-0.5)*80,0,'#f66'); explode(player.x,player.y-30,'#f66',5);
      score=Math.max(0,score-3); coins=Math.max(0,coins-1); saveShopLocal(); scorePop=-8;
      if(formationCountdown>0) formationCountdown=Math.max(0,formationCountdown-2*60);
      comboCount=0; comboTimer=0; fastTimer=60; slowTimer=0; comboPop=0; playSound('hit');
    }
    inputEl.value=''; if(inputEl) inputEl.focus(); updateHUD();
  }
  function update(){
    frameCount++; if(shootCooldown>0) shootCooldown--; if(scorePop>0) scorePop--; else if(scorePop<0) scorePop++; if(comboPop>0) comboPop--;
    if((state==='playing'||state==='intro') && frameCount%60===0){
      playSecAcc+=1;
      if(playSecAcc>=10 && typeof Profile!=='undefined' && Profile.addPlaytime){
        Profile.addPlaytime(playSecAcc);
        playSecAcc=0;
      }
    }
    if(state==='title' && playSecAcc>0 && typeof Profile!=='undefined' && Profile.flushTime){ Profile.addPlaytime(playSecAcc); Profile.flushTime(true); playSecAcc=0; }
    if(exitOverlayEl && !exitOverlayEl.classList.contains('hidden')) return;
    if(speedrun&&!speedrunFinished&&(state==='playing'||state==='intro')) updateSpeedrunHud();
    if(state==='title'||state==='gameover'||state==='win'||state==='speedrunWin'||state==='bossWin') return;
    if(state==='intro'){ levelPause--; if(levelPause<=0){ state='playing'; if(bossDodge){ } else buildFormation(); if(inputEl){ inputEl.disabled=false; inputEl.focus(); } } return; }
    if(state==='levelcomplete') return;
    if(cssBoss&&state==='playing'){ updateCssBoss(); return; }
    if(bossDodge&&state==='playing'){ updateBossDodge(); return; }
    if(slowTimer>0){ slowTimer--; player.speed=player.baseSpeed*0.4; } else if(fastTimer>0){ fastTimer--; player.speed=player.baseSpeed*1.3; } else player.speed=player.baseSpeed;
    if(comboTimer>0){ comboTimer--; if(comboTimer===0) comboCount=0; }
    if(!isTyping()){
      if(keys['ArrowLeft']||keys['a']||keys['A']) player.x-=player.speed;
      if(keys['ArrowRight']||keys['d']||keys['D']) player.x+=player.speed;
    }
    player.x=Math.max(player.w/2,Math.min(CW-player.w/2,player.x));
    if(player.flash>0) player.flash--;
    if(!levelData.isBoss){
      if(formationCountdown>0) formationCountdown--;
      if(speedrun&&formationCountdown<=0) formationAdvance=Math.min(0.85,0.45+frameCount*0.00015);
    }
    moveFormation();
    if(!levelData.isBoss){
      for(let i=enemies.length-1;i>=0;i--){ const e=enemies[i]; if(e.y>H+50){
        if(speedrun){
          enemies.splice(i,1); if(e===currentEnemy) currentEnemy=null;
          lives=0; state='gameover'; if(inputEl) inputEl.disabled=true; speedrunTime=performance.now()-speedrunStart; speedrunFinished=true; pushSpeedrun(speedrunTime);
          const mb=document.getElementById('modeBtns'); if(mb) mb.classList.remove('hidden');
          if(startBtnEl) startBtnEl.classList.remove('hidden'); if(speedrunBtnEl) speedrunBtnEl.classList.remove('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(speedrunHudEl) speedrunHudEl.classList.add('hidden');
          saveProgress(false); continue;
        }
        if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); damagePlayer(); continue; } const dx=e.x-player.x, dy=e.y-player.y; if(Math.abs(dx)<(e.w+player.w)/2-8&&Math.abs(dy)<(e.h+player.h)/2-8){ if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); explode(e.x,e.y,'#f44',20); damagePlayer(); } }
    }
    for(let i=lasers.length-1;i>=0;i--){ lasers[i].life--; if(lasers[i].life<=0) lasers.splice(i,1); }
    for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life--; if(p.life<=0) particles.splice(i,1); }
    checkLevelComplete(); updateHUD();
  }
  function render(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='#080c18'; ctx.fillRect(0,0,W,H); drawStars(); if(state==='title'){ drawTitle(); return; } if(state==='intro'){ drawIntro(); return; } if(cssBoss&&state==='playing'){ drawCssBoss(); drawEnemies(); drawPlayer(); drawLasers(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='bossWin') drawBossWin(); return; } if(bossDodge&&(state==='playing'||state==='bossquiz')){ drawPlayer(); drawBossDodge(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='bossWin') drawBossWin(); return; } drawEnemies(); drawPlayer(); drawLasers(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='win') drawWin(); if(state==='speedrunWin') drawSpeedrunWin(); if(state==='bossWin') drawBossWin(); if(state==='levelcomplete') drawLevelComplete(); }
  function drawStars(){ for(const s of titleStars){ s.y+=s.speed; if(s.y>H){ s.y=0; s.x=Math.random()*W; } ctx.fillStyle=`rgba(180,200,255,${0.3+Math.sin(frameCount*0.02+s.x)*0.2})`; ctx.fillRect(s.x,s.y,s.size,s.size); } }
  function drawPlayer(){
    const {x,y}=player; const sk=skinById(equipped); ctx.save(); if(player.flash>0&&player.flash%4<2) ctx.globalAlpha=0.4;
    ctx.fillStyle=sk.body; ctx.shadowColor=sk.glow; ctx.shadowBlur=12;
    ctx.beginPath(); ctx.moveTo(x,y-22); ctx.lineTo(x-20,y+18); ctx.lineTo(x-7,y+10); ctx.lineTo(x,y+16); ctx.lineTo(x+7,y+10); ctx.lineTo(x+20,y+18); ctx.closePath(); ctx.fill(); ctx.shadowBlur=0;
    ctx.fillStyle=sk.accent; ctx.beginPath(); ctx.arc(x,y-4,5,0,Math.PI*2); ctx.fill();
    const glow=8+Math.sin(frameCount*0.3)*4; ctx.fillStyle='#ff6d00'; ctx.beginPath(); ctx.moveTo(x-6,y+14); ctx.lineTo(x,y+14+glow); ctx.lineTo(x+6,y+14); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.fillText('DEV',x,y+2); ctx.restore();
  }
  function drawEnemies(){
    for(const e of enemies){
      ctx.save(); if(e.flash>0&&e.flash%3<2) ctx.globalAlpha=0.6;
      const isTarget=e===currentEnemy;
      const isBoss=e.isBoss;
      if(isBoss){
        ctx.shadowColor='#a020f0'; ctx.shadowBlur=20;
        ctx.fillStyle='#2a0a3a'; ctx.beginPath(); ctx.ellipse(e.x,e.y+14,e.w/2+12,e.h/2+8,0,0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=isTarget?'#ff1744':'#6a1b9a'; ctx.beginPath();
        ctx.moveTo(e.x,e.y+e.h/2); ctx.lineTo(e.x-e.w/2,e.y-e.h/3); ctx.lineTo(e.x-e.w/3,e.y-e.h/2); ctx.lineTo(e.x,e.y-e.h/2+10); ctx.lineTo(e.x+e.w/3,e.y-e.h/2); ctx.lineTo(e.x+e.w/2,e.y-e.h/3); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#ce93d8'; ctx.beginPath(); ctx.arc(e.x,e.y-6,18,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#ffeb3b'; ctx.shadowColor='#ffeb3b'; ctx.shadowBlur=10;
        for(let i=0;i<3;i++){ const ax=e.x-18+i*18; ctx.beginPath(); ctx.arc(ax,e.y-18,3.5,0,Math.PI*2); ctx.fill(); }
        ctx.shadowBlur=0;
        ctx.fillStyle='#fff'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; const txt=e.question.length>22?e.question.slice(0,21)+'…':e.question; ctx.fillText(txt,e.x,e.y+6);
        const bw=e.w-20; const hp=e.health/e.maxHealth; ctx.fillStyle='#400'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-14,bw,7); ctx.fillStyle=hp>0.5?'#0f0':hp>0.25?'#ffd600':'#f44'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-14,bw*hp,7);
        ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2; if(isTarget){ ctx.stroke(); }
        ctx.restore(); continue;
      }
      ctx.fillStyle=isTarget?'#ff1744':(speedrun?'#ff6d00':'#c62828');
      ctx.beginPath(); ctx.moveTo(e.x,e.y+e.h/2); ctx.lineTo(e.x-e.w/2,e.y-e.h/2); ctx.lineTo(e.x-e.w/4,e.y-e.h/4); ctx.lineTo(e.x,e.y-e.h/2+5); ctx.lineTo(e.x+e.w/4,e.y-e.h/4); ctx.lineTo(e.x+e.w/2,e.y-e.h/2); ctx.closePath(); ctx.fill();
      if(isTarget){ ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); const ring=27+Math.sin(frameCount*0.12)*3; ctx.strokeStyle='rgba(255,255,255,0.85)'; ctx.lineWidth=1.5; ctx.setLineDash([5,5]); ctx.strokeRect(e.x-ring,e.y-ring,ring*2,ring*2); ctx.setLineDash([]); ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.fillText('▼',e.x,e.y-ring+4); if(comboCount>=3){ ctx.save(); const ans=e.answer; const hint=ans.length>1&&ans.charAt(0)==='<'?ans:'<'+ans+'>'; ctx.globalAlpha=1; ctx.fillStyle='#ffeb3b'; ctx.shadowColor='#ffeb3b'; ctx.shadowBlur=8+Math.sin(frameCount*0.2)*4; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('💡 '+hint,e.x,e.y-e.h/2-16); ctx.restore(); } }
      if(e.maxHealth>1){ const bw=e.w-8; ctx.fillStyle='#400'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-7,bw,4); ctx.fillStyle='#f44'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-7,bw*(e.health/e.maxHealth),4); }
      const label=e.question.trim();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      let fontSize=10.5; ctx.font='800 '+fontSize+'px "Segoe UI", system-ui, monospace';
      const maxW=e.w-10;
      let lines=[label];
      if(ctx.measureText(label).width>maxW){
        const words=label.split(' ');
        if(words.length>1){
          let line1=words[0], line2=words.slice(1).join(' ');
          if(ctx.measureText(line1).width>maxW || ctx.measureText(line2).width>maxW){
            fontSize=9.5; ctx.font='800 '+fontSize+'px "Segoe UI", system-ui, monospace';
          }
          if(ctx.measureText(line1).width>maxW) line1=line1.slice(0,14);
          if(ctx.measureText(line2).width>maxW) line2=line2.slice(0,14);
          lines=[line1, line2];
        } else {
          fontSize=9.5; ctx.font='800 '+fontSize+'px "Segoe UI", system-ui, monospace';
          lines=[label.slice(0,16)];
        }
      }
      lines=lines.slice(0,2);
      const lineH=11, padX=6, padY=4;
      let maxLineW=0; for(const ln of lines){ const w=ctx.measureText(ln).width; if(w>maxLineW) maxLineW=w; }
      const boxW=Math.min(maxLineW+padX*2, e.w-6), boxH=lines.length*lineH+padY*2;
      const boxY=e.y+2;
      ctx.fillStyle='rgba(0,0,0,.78)'; ctx.beginPath();
      const bx=e.x-boxW/2, by=boxY-boxH/2;
      const r=4; ctx.moveTo(bx+r,by); ctx.lineTo(bx+boxW-r,by); ctx.quadraticCurveTo(bx+boxW,by,bx+boxW,by+r); ctx.lineTo(bx+boxW,by+boxH-r); ctx.quadraticCurveTo(bx+boxW,by+boxH,bx+boxW-r,by+boxH); ctx.lineTo(bx+r,by+boxH); ctx.quadraticCurveTo(bx,by+boxH,bx,by+boxH-r); ctx.lineTo(bx,by+r); ctx.quadraticCurveTo(bx,by,bx+r,by); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ffffff'; ctx.shadowColor='rgba(0,0,0,1)'; ctx.shadowBlur=4;
      ctx.strokeStyle='rgba(0,0,0,.65)'; ctx.lineWidth=2.5;
      if(lines.length===1){ ctx.strokeText(lines[0], e.x, boxY+0.5); ctx.fillText(lines[0], e.x, boxY+0.5); }
      else { ctx.strokeText(lines[0], e.x, boxY-5); ctx.fillText(lines[0], e.x, boxY-5); ctx.strokeText(lines[1], e.x, boxY+6); ctx.fillText(lines[1], e.x, boxY+6); }
      ctx.shadowBlur=0; ctx.restore();
    }
  }
  function drawLasers(){ for(const l of lasers){ ctx.save(); ctx.strokeStyle=l.color; ctx.lineWidth=3; ctx.shadowColor=l.color; ctx.shadowBlur=12; ctx.beginPath(); ctx.moveTo(l.x1,l.y1); ctx.lineTo(l.x2,l.y2); ctx.stroke(); ctx.restore(); } }
  function drawParticles(){ for(const p of particles){ ctx.save(); ctx.globalAlpha=p.life/p.maxLife; ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=6; ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size); ctx.restore(); } }
  function drawHUDCanvas(){
    ctx.textAlign='left'; ctx.fillStyle='#7a8a9a'; ctx.font='bold 10px monospace'; ctx.fillText('PUNTOS',12,16);
    const pop=scorePop>0; ctx.fillStyle='#ffd600'; ctx.shadowColor='#ffd600'; ctx.shadowBlur=pop?18:8; ctx.font=(pop?'bold 24px':'bold 18px')+' monospace'; ctx.fillText('★ '+score,12,36); ctx.shadowBlur=0; if(scorePop<0){ ctx.fillStyle='#f66'; ctx.fillText('-'+Math.min(3,score),12,52); }
    ctx.fillStyle='#7a8a9a'; ctx.font='bold 9px monospace'; ctx.textAlign='left'; ctx.fillText('🪙 '+coins,12,52);
    ctx.textAlign='right'; ctx.fillStyle='#7a8a9a'; ctx.font='bold 10px monospace'; ctx.fillText('VIDAS',W-12,16);
    const hs=16,gap=21,n=Math.min(Math.max(lives,0),2); ctx.save(); ctx.shadowColor='#ff1744'; ctx.shadowBlur=8; ctx.fillStyle='#ff1744'; for(let i=0;i<n;i++){ const hx=W-12-hs/2-(n-1-i)*gap; drawHeart(hx,20,hs); } ctx.restore();
    if(levelData&&levelData.isBoss){
      const b=enemies[0]; if(b){ ctx.fillStyle='#ce93d8'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('👑 JEFE: '+b.health+'/'+b.maxHealth+'  →  '+b.question, W/2, 44); }
      const bw=260; const hp=b?b.health/b.maxHealth:0; ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(W/2-bw/2,58,bw,8); ctx.fillStyle=hp>0.5?'#ab47bc':hp>0.25?'#ffd600':'#ff1744'; ctx.fillRect(W/2-bw/2,58,bw*hp,8); ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.strokeRect(W/2-bw/2,58,bw,8);
    } else if(currentEnemy){ ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.fillText('Destruye → '+currentEnemy.question,W/2,44); } else { ctx.fillStyle='#8af'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('Haz clic izquierdo en una nave para apuntarla',W/2,44); }
    if(levelData&&levelData.isBoss){
      if(cssBoss){
        ctx.fillStyle='#ce93d8'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('Escribe la propiedad CSS correcta y presiona ENTER. Fallo = -1 vida',W/2,78);
      } else {
        ctx.fillStyle='#ce93d8'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('¡El Jefe no avanza! Escribe la etiqueta y presiona ENTER. Fallo = -1 vida',W/2,78);
      }
    } else if(formationCountdown>0){ const secs=Math.ceil(formationCountdown/60); const color=secs<=3?'#ff1744':secs<=8?'#ffd600':'#7ff'; ctx.fillStyle=color; ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillText('⏱ Las naves bajan en '+secs+'s  (-2s por error)',W/2,64); const bw=160,pct=formationCountdown/(speedrun?SPEEDRUN_COUNTDOWN:FORMATION_COUNTDOWN_FRAMES); ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(W/2-bw/2,69,bw,4); ctx.fillStyle=color; ctx.fillRect(W/2-bw/2,69,bw*pct,4); } else if(!levelData.isBoss){ ctx.fillStyle='#f66'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('¡LAS NAVES AVANZAN!',W/2,64); }
    if(speedrun){ ctx.fillStyle='#ffd600'; ctx.font='bold 10px monospace'; ctx.textAlign='left'; const ms=speedrunFinished?speedrunTime:(state==='playing'||state==='intro'?performance.now()-speedrunStart:0); ctx.fillText('SPEEDRUN '+formatTime(ms),12,66); }
    if(comboCount>=3){ const pulse=comboPop>0?1+(comboPop/24)*0.3:1; ctx.save(); ctx.translate(W-12,36); ctx.scale(pulse,pulse); ctx.textAlign='right'; ctx.font=(comboPop>0?'bold 22px':'bold 18px')+' monospace'; ctx.fillStyle=comboPop>0?'#ffd600':'#ffeb3b'; ctx.shadowColor='#ffd600'; ctx.shadowBlur=comboPop>0?18:6; ctx.fillText('🔥 '+comboCount,0,0); ctx.restore(); ctx.fillStyle='#7a8a9a'; ctx.font='bold 9px monospace'; ctx.textAlign='right'; ctx.shadowBlur=0; ctx.fillText('racha',W-12,50); }
    if(slowTimer>0||fastTimer>0){ ctx.fillStyle=slowTimer>0?'#81d4fa':'#ff8a80'; ctx.shadowColor=ctx.fillStyle; ctx.shadowBlur=12; ctx.font='bold 12px monospace'; ctx.textAlign='center'; ctx.fillText(slowTimer>0?'✊ lento (destruido)':'⚡ rápido (error)',W/2,88); ctx.shadowColor='rgba(0,0,0,0)'; ctx.shadowBlur=0; }
  }
  function drawHeart(x,y,s){ ctx.beginPath(); ctx.moveTo(x,y+s*0.3); ctx.bezierCurveTo(x,y,x-s/2,y,x-s/2,y+s*0.3); ctx.bezierCurveTo(x-s/2,y+s*0.6,x,y+s*0.8,x,y+s*0.9); ctx.bezierCurveTo(x,y+s*0.8,x+s/2,y+s*0.6,x+s/2,y+s*0.3); ctx.bezierCurveTo(x+s/2,y,x,y,x,y+s*0.3); ctx.closePath(); ctx.fill(); }
  function drawTitle(){
    const glitch = (Math.floor(frameCount/180)%2===0)? 0 : Math.sin(frameCount*0.08)*1.5;
    const floatY = Math.sin(frameCount*0.06)*4;
    ctx.textAlign='center';
    ctx.save(); ctx.translate(0,floatY*0.5);
    ctx.fillStyle='#fff'; ctx.shadowColor='#00e5ff'; ctx.shadowBlur=14+Math.sin(frameCount*0.09)*5; ctx.font='800 26px "Segoe UI", system-ui, -apple-system, sans-serif'; ctx.letterSpacing='2px'; ctx.fillText('CODE INVADERS',W/2+glitch,H/2-72);
    ctx.shadowBlur=0;
    const grad=ctx.createLinearGradient(W/2-180,H/2-50,W/2+180,H/2-50);
    grad.addColorStop(0,'#ffd600'); grad.addColorStop(0.5,'#ffea00'); grad.addColorStop(1,'#ffd600');
    ctx.fillStyle=grad; ctx.font='700 12px "Segoe UI", monospace'; ctx.letterSpacing='1px'; ctx.fillText('aprende a programar defendiendo la galaxia.',W/2,H/2-44);
    ctx.restore();
    ctx.fillStyle='#d6e6ff'; ctx.shadowColor='rgba(0,229,255,.45)'; ctx.shadowBlur=10; ctx.font='700 14px "Segoe UI", system-ui, sans-serif'; ctx.fillText('Destruye naves escribiendo la respuesta correcta',W/2,H/2-18);
    ctx.shadowBlur=0;
  }
  function drawIntro(){
    const alpha=Math.min(1,(90-levelPause)/30); ctx.globalAlpha=alpha;
    if(levelData&&levelData.isBoss){ ctx.fillStyle='#ab47bc'; ctx.font='bold 32px monospace'; ctx.textAlign='center'; ctx.fillText(levelData.isCssBoss?'👑 JEFE CSS':'👑 JEFE FINAL',W/2,H/2-50); ctx.fillStyle='#fff'; ctx.font='16px monospace'; if(levelData.isCssBoss){ ctx.fillText('¡Destruye las naves escribiendo la propiedad CSS correcta!',W/2,H/2-10); ctx.font='13px monospace'; ctx.fillStyle='#ce93d8'; ctx.fillText('⬅ ➡ Mover  |  Escribe la respuesta y ENTER',W/2,H/2+20); ctx.fillText('Cada respuesta correcta daña al jefe -2 HP',W/2,H/2+40); ctx.fillText(bossHP+' HP para vencerlo',W/2,H/2+60); } else { ctx.fillText('¡Esquiva las etiquetas y derrota al Prof. Froggio!',W/2,H/2-10); ctx.font='13px monospace'; ctx.fillStyle='#ce93d8'; ctx.fillText('⬅ ➡ Mover  |  SPACE Disparar (con balas)',W/2,H/2+20); ctx.fillText('Recoge 🔫 balas  |  ❓ preguntas  |  💀 trampas',W/2,H/2+40); ctx.fillText(bossHP+' golpes para vencerlo',W/2,H/2+60); } }
    else { ctx.fillStyle=speedrun?'#ffd600':'#0a1'; ctx.font='bold 32px monospace'; ctx.textAlign='center'; ctx.fillText((speedrun?'NIVEL 1 ⚡ SPEEDRUN':'NIVEL '+levelData.id),W/2,H/2-30); ctx.fillStyle='#fff'; ctx.font='18px monospace'; ctx.fillText(levelData.title,W/2,H/2+10); ctx.font='13px monospace'; ctx.fillStyle='#aaa'; ctx.fillText(levelData.questions.length+' enemigos'+(speedrun?' • ¡MODO DIFÍCIL!':''),W/2,H/2+45); }
    ctx.globalAlpha=1;
  }
  function drawLevelComplete(){
    const pulse=Math.sin(frameCount*0.15)*0.06+1;
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.translate(W/2,H/2-10); ctx.scale(pulse,pulse);
    ctx.fillStyle='#0f0'; ctx.font='400 14px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.shadowColor='#0f0'; ctx.shadowBlur=8; ctx.fillText('¡NIVEL COMPLETADO!',0,0); ctx.restore();
    ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font='12px monospace'; ctx.fillText('Puntuación: '+score+'  🪙 '+coins,W/2,H/2+22);
  }
  function drawGameOver(){
    const glitch=Math.sin(frameCount*0.2)*1.2;
    ctx.fillStyle='rgba(0,0,0,0.78)'; ctx.fillRect(0,0,W,H);
    ctx.textAlign='center'; ctx.fillStyle='#ff1744'; ctx.shadowColor='#ff1744'; ctx.shadowBlur=12; ctx.font='400 18px "Press Start 2P", monospace'; ctx.fillText('GAME OVER',W/2+glitch,H/2-42);
    ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font='400 7px "Press Start 2P", monospace'; ctx.fillText('Puntuacion: '+score+'  monedas '+coins,W/2,H/2-10);
    ctx.font='400 6px "Press Start 2P", monospace'; ctx.fillText('Nivel: '+(levelData?levelData.id:'-'),W/2,H/2+8);
    if(speedrun){ ctx.fillStyle='#ffd600'; ctx.font='400 8px "Press Start 2P", monospace'; ctx.fillText('Tiempo: '+formatTime(speedrunTime),W/2,H/2+30); if(speedrunBest){ ctx.fillStyle='#aaa'; ctx.font='400 6px "Press Start 2P", monospace'; ctx.fillText('Mejor: '+formatTime(speedrunBest),W/2,H/2+44); } }
  }
  function drawWin(){
    const pulse=Math.sin(frameCount*0.12)*0.07+1;
    ctx.fillStyle='rgba(0,0,0,0.78)'; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.translate(W/2,H/2-38); ctx.scale(pulse,pulse); ctx.fillStyle='#0f0'; ctx.shadowColor='#0f0'; ctx.shadowBlur=10; ctx.font='400 15px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.fillText('¡VICTORIA!',0,0); ctx.restore();
    ctx.shadowBlur=0; ctx.fillStyle='#ffd600'; ctx.font='400 7px "Press Start 2P", monospace'; ctx.fillText('Completaste todos los niveles',W/2,H/2-6);
    ctx.fillStyle='#fff'; ctx.font='400 7px "Press Start 2P", monospace'; ctx.fillText('Puntuacion final: '+score+'  monedas '+coins,W/2,H/2+18);
  }
  function drawSpeedrunWin(){
    const pulse=Math.sin(frameCount*0.14)*0.06+1;
    ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.translate(W/2,H/2-52); ctx.scale(pulse,pulse); ctx.fillStyle='#ffd600'; ctx.shadowColor='#ffd600'; ctx.shadowBlur=10; ctx.font='400 11px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.fillText('¡SPEEDRUN COMPLETADO!',0,0); ctx.restore();
    ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font='400 12px "Press Start 2P", monospace'; ctx.fillText('Tiempo '+formatTime(speedrunTime),W/2,H/2-14);
    let bestTxt=''; let isRecord=false; if(speedrunBest&&Math.abs(speedrunBest-speedrunTime)<1){ bestTxt='¡NUEVO RECORD!'; isRecord=true; } else if(speedrunBest) bestTxt='Mejor: '+formatTime(speedrunBest);
    ctx.fillStyle=isRecord?'#0f0':'#aaa'; ctx.font='400 7px "Press Start 2P", monospace'; ctx.fillText(bestTxt,W/2,H/2+10);
    ctx.fillStyle='#8af'; ctx.font='400 6px "Press Start 2P", monospace'; ctx.fillText('Nivel 1 completado  Puntos: '+score,W/2,H/2+30);
  }
  function drawBossWin(){
    const pulse=Math.sin(frameCount*0.13)*0.08+1;
    ctx.fillStyle='rgba(0,0,0,0.85)'; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.translate(W/2,H/2-48); ctx.scale(pulse,pulse); ctx.fillStyle='#ab47bc'; ctx.shadowColor='#ab47bc'; ctx.shadowBlur=12; ctx.font='400 13px "Press Start 2P", monospace'; ctx.textAlign='center'; ctx.fillText('¡JEFE VENCIDO!',0,0); ctx.restore();
    ctx.shadowBlur=0; ctx.fillStyle='#ffd600'; ctx.font='400 8px "Press Start 2P", monospace'; ctx.fillText('¡Has salvado la galaxia!',W/2,H/2-14);
    ctx.fillStyle='#fff'; ctx.font='400 7px "Press Start 2P", monospace'; ctx.fillText('Puntuacion final: '+score+'  monedas '+coins,W/2,H/2+12);
    ctx.fillStyle='#ce93d8'; ctx.font='400 6px "Press Start 2P", monospace'; ctx.fillText('Bonus +100 puntos',W/2,H/2+30);
  }
  function updateHUD(){
    const eLevel=document.getElementById('levelVal'); const eTarget=document.getElementById('targetQuestion');
    if(eLevel) eLevel.textContent=levelData?(levelData.isBoss?(cssBoss?'👑 JEFE CSS':'👑 JEFE'):(speedrun?'1 ⚡':levelData.id)):'-';
    if(levelData&&levelData.isBoss){
      if(cssBoss && enemies.length>0){
        const qs=[...new Set(enemies.map(e=>e.question))];
        if(eTarget) eTarget.textContent=qs.join(' | ');
      } else {
        if(eTarget) eTarget.textContent=enemies[0]?enemies[0].question:'—';
      }
    }
    else if(currentEnemy){ if(eTarget) eTarget.textContent=currentEnemy.question; } else { if(eTarget) eTarget.textContent=state==='playing'?'clic en una nave':'—'; }
    if(qBannerEl&&qBannerTextEl){
      if(state==='intro'){ qBannerTextEl.textContent=(levelData&&levelData.isBoss?(cssBoss?'👑 Jefe CSS: ':'👑 Jefe Final: '):'')+'Preparando '+(levelData?levelData.title:'')+'...'; qBannerEl.classList.remove('hidden'); }
      else if(levelData&&levelData.isBoss&&cssBoss&&enemies.length>0){ const qs=[...new Set(enemies.map(e=>e.question))]; qBannerTextEl.textContent=qs.join('  |  '); qBannerEl.classList.remove('hidden'); }
      else if(levelData&&levelData.isBoss&&enemies[0]){ qBannerTextEl.textContent=enemies[0].question; qBannerEl.classList.remove('hidden'); }
      else if(currentEnemy){ qBannerTextEl.textContent=currentEnemy.question; qBannerEl.classList.remove('hidden'); }
      else if(state==='playing'){ qBannerTextEl.textContent=cssBoss?'Escribe la propiedad CSS y presiona ENTER':'Haz clic izquierdo en una nave para apuntarla'; qBannerEl.classList.remove('hidden'); }
      else qBannerEl.classList.add('hidden');
    }
    updateSpeedrunHud();
    updateExitBtn();
    const coinEl=document.getElementById('coinVal'); if(coinEl) coinEl.textContent=coins;
  }
  function initShopUI(){
    const btn=document.getElementById('shopBtn'); const modal=document.getElementById('shopModal');
    const close=document.getElementById('shopClose'); const grid=document.getElementById('shopGrid');
    if(!btn||!modal) return;
    btn.addEventListener('click', ()=>{ renderShop(); modal.classList.remove('hidden'); });
    if(close) close.addEventListener('click', ()=>modal.classList.add('hidden'));
    modal.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });
  }
  function renderShop(){
    const grid=document.getElementById('shopGrid'); const bal=document.getElementById('shopBalance');
    if(!grid) return; if(bal) bal.textContent='🪙 '+coins+' puntos';
    grid.innerHTML=SKINS.map(s=>{
      const owned=ownedSkins.includes(s.id); const eq=equipped===s.id;
      let action='';
      if(eq) action='<span class="shop-badge equipped">✓ Equipado</span>';
      else if(owned) action=`<button class="btn btn-ghost btn-sm" data-equip="${s.id}">Equipar</button>`;
      else action=`<button class="btn btn-primary btn-sm" data-buy="${s.id}" ${coins < s.price ? 'disabled' : ''}>Comprar ${s.price} 🪙</button>`;
      return `<div class="shop-card ${eq?'shop-equipped':''}" style="border-top-color:${s.body}"><div class="shop-preview" style="background:${s.body}22; border-color:${s.body}55"><div class="shop-ship" style="color:${s.body}; text-shadow:0 0 10px ${s.glow}">◆</div></div><h4>${s.name}</h4><p class="shop-price">${s.price===0?'Gratis':s.price+' 🪙'}</p>${action}</div>`;
    }).join('');
    grid.querySelectorAll('[data-buy]').forEach(b=>b.addEventListener('click', async ()=>{ const id=b.dataset.buy; b.disabled=true; b.textContent='...'; try{ const r=await API.buySkin(id); coins=r.coins; ownedSkins=r.skins; saveShopLocal(); renderShop(); updateHUD(); Toast.success('¡Comprado!'); }catch(e){ Toast.error(e.message); b.disabled=false; b.textContent='Comprar'; } }));
    grid.querySelectorAll('[data-equip]').forEach(b=>b.addEventListener('click', async ()=>{ const id=b.dataset.equip; try{ const r=await API.equipSkin(id); equipped=r.equipped; saveShopLocal(); renderShop(); Toast.success('Skin equipada'); }catch(e){ Toast.error(e.message); } }));
  }
  function updateShopUI(){ const el=document.getElementById('coinVal'); if(el) el.textContent=coins; }
  function resetGame(){ score=0; level=0; enemies=[]; currentEnemy=null; particles=[]; lasers=[]; startLevel(0); }
  function showToast(msg){ const t=document.createElement('div'); t.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1b2838;color:#00e676;padding:12px 24px;border-radius:8px;font-family:monospace;font-size:14px;z-index:9999;border:1px solid #00e676;box-shadow:0 4px 16px rgba(0,0,0,0.5);'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2500); }
  function loadProgress(){ refreshSession(); syncShopFromServer(); }
  function loop(){ update(); render(); requestAnimationFrame(loop); }
  return {init,loadProgress,refreshSession,onLogoutCleanup,clearGuestSession, get SKINS(){return SKINS;}, get coins(){return coins;}, set coins(v){coins=v;}};
})();
