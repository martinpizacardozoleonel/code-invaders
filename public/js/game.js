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
    {id:5,title:'👑 JEFE CSS',isBoss:true,isCssBoss:true,bossHealth:10,questions:[{q:'Color de texto',a:'color'},{q:'Fondo',a:'background'},{q:'Margen exterior',a:'margin'},{q:'Margen interior',a:'padding'},{q:'Borde',a:'border'},{q:'Ancho',a:'width'},{q:'Altura',a:'height'},{q:'Posición',a:'position'},{q:'Alinear ítems',a:'align-items'},{q:'Justificar contenido',a:'justify-content'}],enemySpeed:0,spawnInterval:0,enemyHealth:1},
    {id:6,title:'👑 JEFE JAVASCRIPT',isBoss:true,isJsBoss:true,bossHealth:15,questions:[{tag:'<h1>'},{tag:'<p>'},{tag:'<a>'},{tag:'<img>'},{tag:'<ul>'},{tag:'<div>'},{tag:'<span>'},{tag:'<button>'},{tag:'<input>'},{tag:'<table>'},{tag:'margin'},{tag:'padding'},{tag:'border'},{tag:'display: flex'},{tag:'text-align'}],enemySpeed:0,spawnInterval:0,enemyHealth:1},
    {id:7,title:'Galaxia 2 · HTML + CSS + JS',galaxy:2,questions:[{q:'Etiqueta de negrita',a:'<strong>'},{q:'Etiqueta de cursiva',a:'<em>'},{q:'Salto de línea',a:'<br>'},{q:'Etiqueta de párrafo',a:'<p>'},{q:'Etiqueta de lista',a:'<ul>'},{q:'Etiqueta de divisor',a:'<hr>'},{q:'Etiqueta de cita',a:'<blockquote>'},{q:'Etiqueta de código',a:'<code>'},{q:'Margen exterior',a:'margin'},{q:'Margen interior',a:'padding'},{q:'Borde redondeado',a:'border-radius'},{q:'Sombra de la caja',a:'box-shadow'},{q:'Transición',a:'transition'}],enemySpeed:0.5,spawnInterval:90,enemyHealth:1}
  ];
  // El nivel 7 abre la segunda galaxia: de ahí en más el cartel que cuenta qué
  // hay que destruir se pinta con la paleta de esa galaxia.
  const GALAXIES={
    1:{bg:'#080c18',star:'180,200,255',accent:'#ab47bc',accent2:'#ce93d8',label:'GALAXIA 1 · SECTOR CÓDIGO'},
    2:{bg:'#1a0626',star:'255,170,235',accent:'#ff4fd8',accent2:'#ffb3ec',label:'GALAXIA 2 · NEBULOSA VIOLETA'}
  };
  // Etiquetas HTML y CSS que usa el jefe de JavaScript (nivel 6) para las naves
  // que tira en cada etapa.
  const JS_HTML_TAGS=['<h1>','<p>','<a>','<img>','<ul>','<div>','<span>','<button>','<input>','<table>','<strong>','<em>'];
  const JS_CSS_TAGS=['margin','padding','border','display','position','width','height','color','background','justify-content','align-items','text-align','border-radius','box-shadow','font-size'];
  // Cambia de galaxia: pinta el fondo del lienzo con la paleta de esa galaxia y
  // le pone una clase al <body> para que el cartel de nivel (la "mini
  // descripción" de qué hay que destruir) tome el mismo color.
  function setGalaxy(g){ galaxy=(Number(g)===2?2:1); document.body.classList.toggle('galaxy2',galaxy===2); }
  function gal(){ return GALAXIES[galaxy]||GALAXIES[1]; }
  let canvas,ctx,W,H;
  let inputEl,fireBtnEl,startBtnEl,levelsBtnEl,retryBtnEl,speedrunBtnEl,multiBtnEl,singlePlayerBtnEl,multiPlayerBtnEl,modeBackBtnEl,speedrunHudEl,exitBtnEl,exitOverlayEl,exitCancelEl,exitConfirmEl;
  let gameOptsBtnEl,gameOptsMenuEl,gameInfoBtnEl,gameAbandonBtnEl,gameBackBtnEl,gameInfoPanelEl,gameInfoBodyEl,gameInfoCloseBtnEl;
  let qBannerEl,qBannerTextEl;
  let state='title';
  let score=0,lives=2,level=0;
  let coins=0,ownedSkins=['default'],equipped='default';
  let ownedLasers=['default'],equippedLaser='default';
  let ownedImpacts=['default'],equippedImpact='default';
  let ownedLabelSkins=['default'],equippedLabelSkin='default';
  let ownedTitles=['none'],equippedTitle='none';
  let _titlesLoading=false,_titlesTries=0;
  let frameCount=0,shootCooldown=0;
  let keys={}; let titleStars=[];
  let particles=[],lasers=[],impacts=[];
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
  // ── Jefe de JavaScript (nivel 6) ────────────────────────────────────────
  // Va por etapas: 4 naves con etiqueta HTML, después 2 naves con vida (3
  // escrituras cada una), después se vuelve furioso (la galaxia tiembla) y
  // tira 5 naves con etiqueta CSS que sólo se destruyen disparando las balas
  // que se ganan escribiendo el código correcto. Al final abre un portal.
  let jsBoss=false,jsBossPhase=0,jsBossBullets=0,jsBossShake=0,jsBossFreeze=0,jsBossPortal=null,jsBossBubble='',jsBossBubbleTimer=0;
  let portalFade=0;
  let galaxy=1;
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
    levelsBtnEl=document.getElementById('levelsBtn');
    fireBtnEl=document.getElementById('fireBtn');
    speedrunBtnEl=document.getElementById('speedrunBtn');
    multiBtnEl=document.getElementById('multiBtn');
    singlePlayerBtnEl=document.getElementById('singlePlayerBtn');
    multiPlayerBtnEl=document.getElementById('multiPlayerBtn');
    modeBackBtnEl=document.getElementById('modeBackBtn');
    speedrunHudEl=document.getElementById('speedrunHud');
    exitBtnEl=document.getElementById('gameOptions');
    exitOverlayEl=document.getElementById('exitOverlay');
    exitCancelEl=document.getElementById('exitCancel');
    exitConfirmEl=document.getElementById('exitConfirm');
    gameOptsBtnEl=document.getElementById('gameOptionsBtn');
    gameOptsMenuEl=document.getElementById('gameOptionsMenu');
    gameInfoBtnEl=document.getElementById('gameInfoBtn');
    gameAbandonBtnEl=document.getElementById('gameAbandonBtn');
    gameBackBtnEl=document.getElementById('gameBackBtn');
    gameInfoPanelEl=document.getElementById('gameInfoPanel');
    gameInfoBodyEl=document.getElementById('gameInfoBody');
    gameInfoCloseBtnEl=document.getElementById('gameInfoCloseBtn');
    retryBtnEl=document.getElementById('retryBtn');
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
      // Etapa 3 del jefe de JavaScript: el SPACE dispara con las balas que
      // ganaste escribiendo, así que se lo sacamos al input para que no se
      // pegue un espacio en el medio del código.
      if(e.key===' '&&jsBoss&&state==='playing'&&jsBossPhase===3&&!jsBossPortal){
        e.preventDefault(); keys[' ']=true;
        if(isAnswerFocused&&inputEl&&inputEl.value.endsWith(' ')) inputEl.value=inputEl.value.slice(0,-1);
        return;
      }
      if(e.key==='Escape' && isInGame() && gameMenuOpen()){ e.preventDefault(); hideGameMenu(); if(isAnswerFocused&&inputEl) inputEl.focus(); return; }
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
    if(singlePlayerBtnEl) singlePlayerBtnEl.addEventListener('click', ()=>{ showSingleModes(); });
    if(multiPlayerBtnEl) multiPlayerBtnEl.addEventListener('click', ()=>{ openMultiEntry(); });
    if(modeBackBtnEl) modeBackBtnEl.addEventListener('click', ()=>{ showBtns(); });
    if(retryBtnEl) retryBtnEl.addEventListener('click', ()=>{ hideBtns(); speedrun?startSpeedrun():startNormal(); });
    if(gameOptsBtnEl) gameOptsBtnEl.addEventListener('click', (e)=>{ e.stopPropagation(); toggleGameMenu(); });
    if(gameInfoBtnEl) gameInfoBtnEl.addEventListener('click', (e)=>{ e.stopPropagation(); openGameInfo(); });
    if(gameAbandonBtnEl) gameAbandonBtnEl.addEventListener('click', (e)=>{ e.stopPropagation(); hideGameMenu(); showExitConfirm(); });
    if(gameBackBtnEl) gameBackBtnEl.addEventListener('click', (e)=>{ e.stopPropagation(); hideGameMenu(); if(isInGame()&&inputEl) inputEl.focus(); });
    if(gameInfoCloseBtnEl) gameInfoCloseBtnEl.addEventListener('click', (e)=>{ e.stopPropagation(); hideGameMenu(); if(isInGame()&&inputEl) inputEl.focus(); });
    document.addEventListener('click', (e)=>{ if(!gameMenuOpen()) return; const w=document.getElementById('gameOptions'); if(w&&!w.contains(e.target)) hideGameMenu(); });
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
        if(jsBoss){ if(!jsBossShoot()&&!inputEl.value.trim()) { try{ showToast(jsBossBullets>0?'💥 Dispará con SPACE o 💥':'Escribí el código de una nave'); }catch(err){} } return; }
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
      const af=(e)=>{ if(e) e.preventDefault(); if(Date.now()-_lastAF<450) return; _lastAF=Date.now(); if(bossDodge && !cssBoss) doBossDodgeShoot(); else if(jsBoss&&!jsBossShoot()&&!inputEl.value.trim()) fireJsBossAnswer(); else if(!jsBoss) fireAnswer(); };
      answerFireBtn.addEventListener('touchstart',af,{passive:false});
      answerFireBtn.addEventListener('click',af);
    }
    const unlockAudio=()=>{ initAudio(); document.body.removeEventListener('click',unlockAudio); document.removeEventListener('keydown',unlockAudio); };
    document.body.addEventListener('click',unlockAudio);
    document.addEventListener('keydown',unlockAudio);
    initShopUI();
    bindLevelsUI();
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
      const ol=st.getItem(pref+'ownedLasers'); if(ol){ try{ ownedLasers=JSON.parse(ol); }catch(e){} } else ownedLasers=['default'];
      const el=st.getItem(pref+'equippedLaser'); equippedLaser=el||'default';
      if(!ownedLasers.includes('default')) ownedLasers.unshift('default');
      if(!ownedLasers.includes(equippedLaser)) equippedLaser='default';
      const oi=st.getItem(pref+'ownedImpacts'); if(oi){ try{ ownedImpacts=JSON.parse(oi); }catch(e){} } else ownedImpacts=['default'];
      const ei=st.getItem(pref+'equippedImpact'); equippedImpact=ei||'default';
      if(!ownedImpacts.includes('default')) ownedImpacts.unshift('default');
      if(!ownedImpacts.includes(equippedImpact)) equippedImpact='default';
      const ok2=st.getItem(pref+'ownedLabelSkins'); if(ok2){ try{ ownedLabelSkins=JSON.parse(ok2); }catch(e){} } else ownedLabelSkins=['default'];
      const ek=st.getItem(pref+'equippedLabelSkin'); equippedLabelSkin=ek||'default';
      if(!ownedLabelSkins.includes('default')) ownedLabelSkins.unshift('default');
      if(!ownedLabelSkins.includes(equippedLabelSkin)) equippedLabelSkin='default';
      applyLabelSkin();
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
      st.setItem(pref+'ownedLasers', JSON.stringify(ownedLasers));
      st.setItem(pref+'equippedLaser', equippedLaser);
      st.setItem(pref+'ownedImpacts', JSON.stringify(ownedImpacts));
      st.setItem(pref+'equippedImpact', equippedImpact);
      st.setItem(pref+'ownedLabelSkins', JSON.stringify(ownedLabelSkins));
      st.setItem(pref+'equippedLabelSkin', equippedLabelSkin);
      st.setItem(pref+'score', String(score));
      if(speedrunBest!==null) st.setItem(pref+'speedrun_best', String(speedrunBest));
    }catch(e){}
  }
function clearGuestSession(){
    try{ const pref='ci_guest_'; sessionStorage.removeItem(pref+'coins'); sessionStorage.removeItem(pref+'owned'); sessionStorage.removeItem(pref+'equipped'); sessionStorage.removeItem(pref+'ownedLasers'); sessionStorage.removeItem(pref+'equippedLaser'); sessionStorage.removeItem(pref+'ownedImpacts'); sessionStorage.removeItem(pref+'equippedImpact'); sessionStorage.removeItem(pref+'ownedLabelSkins'); sessionStorage.removeItem(pref+'equippedLabelSkin'); sessionStorage.removeItem(pref+'score'); sessionStorage.removeItem(pref+'speedrun_best'); }catch(e){}
  }
  // La skin de etiqueta vive en ships.js para que el modo de un jugador y el
  // multijugador muestren las etiquetas iguales sin pasar nada por parámetro.
  function applyLabelSkin(){ try{ if(typeof EnemyShips!=='undefined'&&EnemyShips.setLabelSkin) EnemyShips.setLabelSkin(equippedLabelSkin); }catch(e){} }
  async function syncShopFromServer(){
    if(typeof API==='undefined') return;
    try{
      const me=await API.me();
      if(me && me.coins!==undefined){
coins=me.coins; if(me.skins) ownedSkins=me.skins; if(me.equipped) equipped=me.equipped;
        if(Array.isArray(me.lasers)) ownedLasers=me.lasers; if(me.equippedLaser) equippedLaser=me.equippedLaser;
        if(Array.isArray(me.impacts)) ownedImpacts=me.impacts; if(me.equippedImpact) equippedImpact=me.equippedImpact;
        if(Array.isArray(me.labelSkins)) ownedLabelSkins=me.labelSkins; if(me.equippedLabelSkin) equippedLabelSkin=me.equippedLabelSkin;
        if(Array.isArray(me.titles)) ownedTitles=me.titles; if(me.equippedTitle) equippedTitle=me.equippedTitle;
        if(me.user && me.user.speedrunBest!=null) speedrunBest=me.user.speedrunBest;
        applyLabelSkin();
        // Logros ganados retroactivamente (p. ej. un speedrun de 11.5s que se
        // habíaQualificado antes de que existiera el chequeo). Se avisa al
        // usuario al entrar, no queda en silencio.
        if(Array.isArray(me.unlocked) && me.unlocked.length){
          setTimeout(()=>showAchievementPop(me.unlocked),700);
        }
        score=Math.max(score,coins);
        saveShopLocal(); updateShopUI(); updateHUD();
      }
    }catch(e){
      if(!isLogged()){
        loadShopLocal();
      }
    }
  }
  const ACH_INFO={
  speed_demon:{icon:'⚡',name:'Demonio Veloz',desc:'Speedrun de 11.5s o menos',reward:'🌠 Banner Aurora'},
  triple_champion:{icon:'👑',name:'Tricampeón',desc:'3 torneos seguidos',reward:'🌌 Marco Universo'},
  centurion:{icon:'💯',name:'Centurión',desc:'100.000 EXP alcanzados',reward:'👻 Letra Fantasma + 100.000 pts'}
};
// Aviso grande y visible cuando se desbloquea un logro. Antes sólo se enviaba
// la notificación del campanita, que se pasa desapercibida.
function showAchievementPop(ids){
  const list=Array.isArray(ids)?ids.filter(x=>x&&ACH_INFO[x]):[];
  if(!list.length) return;
  const ov=document.getElementById('achPopOverlay');
  if(!ov) return;
  const a=list[0];
  const info=ACH_INFO[a];
  const set=(id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set('achPopIcon',info.icon);
  set('achPopTitle','¡LOGRO DESBLOQUEADO!');
  set('achPopName',info.name);
  set('achPopDesc',info.desc);
  set('achPopReward','Recompensa: '+info.reward);
  ov.classList.remove('hidden');
  try{ if(typeof Toast!=='undefined') Toast.success('🏆 '+info.name+' desbloqueado'); }catch(e){}
}
function bindAchievementPop(){
  const ov=document.getElementById('achPopOverlay'), ok=document.getElementById('achPopOk');
  if(ok) ok.addEventListener('click',()=>{ if(ov) ov.classList.add('hidden'); });
  if(ov) ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.add('hidden'); });
}
document.addEventListener('DOMContentLoaded',bindAchievementPop);

  async function pushSpeedrun(time){
    if(typeof API==='undefined' || typeof API.saveSpeedrun!=='function') return;
    const t=Math.round(Number(time)||0);
    if(!Number.isFinite(t)||t<=0){ console.error('[pushSpeedrun] tiempo invalido',time); return; }
    if(!isLogged()){
      try{ const st=store(); const pref=`ci_guest_speedrun_best`; const cur=st.getItem(pref); if(cur==null || t < Number(cur)) st.setItem(pref, String(t)); }catch(e){}
      try{ if(typeof Toast!=='undefined') Toast.error('Inicia sesión para guardar tu récord en el ranked'); else showToast('Inicia sesión para guardar récord'); }catch(e){}
      return;
    }
    try{
      console.log('[pushSpeedrun] enviando',t,'ms token',!!localStorage.getItem('fx_token'));
      const r=await API.saveSpeedrun(t);
      console.log('[pushSpeedrun] respuesta',r);
      if(r && r.isNewBest){
        speedrunBest=t;
        try{ const st=store(); const pref=`ci_${uid()}_speedrun_best`; st.setItem(pref, String(t)); }catch(e){}
        const savedToDb=r.savedToDb!==false;
        if(savedToDb){
          try{ if(typeof Toast!=='undefined') Toast.success('⚡ Nuevo récord '+formatTime(t)+' guardado en ranked'); else showToast('⚡ Récord '+formatTime(t)+' guardado en ranked'); }catch(e){}
          // Logro desbloqueado: se muestra el aviso grande apenas se guarda.
          if(r && Array.isArray(r.unlocked) && r.unlocked.length) showAchievementPop(r.unlocked);
        } else {
          try{ if(typeof Toast!=='undefined') Toast.warning('⚡ Nuevo récord '+formatTime(t)+' guardado localmente (problema con servidor)'); else showToast('⚡ Récord guardado localmente'); }catch(e){}
        }
        if(typeof Ranked!=='undefined' && Ranked.loadRanking) try{ await Ranked.loadRanking(); }catch(e){ console.error('Ranked reload fail',e); }
      } else {
        try{ if(typeof Toast!=='undefined') Toast.info('⏱ '+formatTime(t)+' - no superaste tu mejor ('+(speedrunBest?formatTime(speedrunBest):'-')+')'); else showToast('⏱ '+formatTime(t)); }catch(e){}
        if(typeof Ranked!=='undefined' && Ranked.loadRanking) try{ await Ranked.loadRanking(); }catch(e){}
      }
    }catch(e){
      console.error('[pushSpeedrun] save fail',e && e.message, e);
      try{ const st=store(); const pref=`ci_${uid()}_speedrun_best`; const cur=st.getItem(pref); if(cur==null || t < Number(cur)) st.setItem(pref, String(t)); }catch(err){}
      let msg=(e&&e.message)||'Error al guardar';
      if(msg.includes('No autenticado')) msg='Sesión expirada, inicia sesión de nuevo';
      else if(msg.includes('Tiempo fuera de rango')) msg='Tiempo fuera del rango permitido (1s-10m)';
      else if(msg.includes('Tiempo inválido')) msg='Error en el tiempo del speedrun';
      else if(msg.includes('Failed to fetch')||msg.includes('fetch')) msg='Sin conexión al servidor, guardado local';
      else if(msg.includes('Error interno')) msg='Error del servidor, intentá de nuevo';
      try{ if(typeof Toast!=='undefined') Toast.error(msg); else showToast(msg); }catch(err){}
    }
  }
  function refreshSession(){
    migrateIfNeeded();
    if(isLogged()){
      coins=0; ownedSkins=['default']; equipped='default'; ownedLasers=['default']; equippedLaser='default';
ownedImpacts=['default']; equippedImpact='default'; ownedLabelSkins=['default']; equippedLabelSkin='default'; ownedTitles=['none']; equippedTitle='none';
      score=0; speedrunBest=null;
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
        const ol=sessionStorage.getItem('ci_guest_ownedLasers'); ownedLasers=ol?JSON.parse(ol):['default'];
        const el=sessionStorage.getItem('ci_guest_equippedLaser'); equippedLaser=el||'default';
        const oi=sessionStorage.getItem('ci_guest_ownedImpacts'); ownedImpacts=oi?JSON.parse(oi):['default'];
        const ei=sessionStorage.getItem('ci_guest_equippedImpact'); equippedImpact=ei||'default';
        const os=sessionStorage.getItem('ci_guest_ownedLabelSkins'); ownedLabelSkins=os?JSON.parse(os):['default'];
        const es=sessionStorage.getItem('ci_guest_equippedLabelSkin'); equippedLabelSkin=es||'default';
        const sc=sessionStorage.getItem('ci_guest_score'); score=sc?parseInt(sc)||0:0;
        const sb=sessionStorage.getItem('ci_guest_speedrun_best'); speedrunBest=sb?parseFloat(sb):null;
      }catch(e){ coins=0; ownedSkins=['default']; equipped='default'; ownedLasers=['default']; equippedLaser='default'; ownedImpacts=['default']; equippedImpact='default'; ownedLabelSkins=['default']; equippedLabelSkin='default'; score=0; speedrunBest=null; }
    }
    // Si el catálogo de títulos no llegó (típico: la página cargó antes de
    // estar autenticado y /api/titles devolvió 401), se reintenta ahora que ya
    // hay sesión y también se sincronizan los títulos que el usuario posee.
    if(isLogged() && !(window.TitleCatalog && window.TitleCatalog.length)){
      _titlesTries=0; loadTitles();
    }
    loadShopLocal();
  }
  function onLogoutCleanup(){
    coins=0; score=0; ownedSkins=['default']; equipped='default'; speedrunBest=null;
    ownedImpacts=['default']; equippedImpact='default'; ownedLabelSkins=['default']; equippedLabelSkin='default'; applyLabelSkin();
    try{ clearGuestSession(); localStorage.removeItem('shop_coins'); localStorage.removeItem('shop_owned'); localStorage.removeItem('shop_equipped'); localStorage.removeItem('shop_ownedLasers'); localStorage.removeItem('shop_equippedLaser'); localStorage.removeItem('shop_ownedImpacts'); localStorage.removeItem('shop_equippedImpact'); localStorage.removeItem('shop_ownedLabelSkins'); localStorage.removeItem('shop_equippedLabelSkin'); localStorage.removeItem('fx_score'); localStorage.removeItem('speedrun_best'); }catch(e){}
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
  function isInGame(){ return state==='playing'||state==='intro'||state==='levelcomplete'||state==='bossquiz'||state==='portal'; }
  function updateExitBtn(){ if(!exitBtnEl) return; if(isInGame()) exitBtnEl.classList.remove('hidden'); else { exitBtnEl.classList.add('hidden'); hideGameMenu(); } if(exitOverlayEl && !isInGame()) exitOverlayEl.classList.add('hidden'); }
  function gameMenuOpen(){ return !!((gameOptsMenuEl&&!gameOptsMenuEl.classList.contains('hidden'))||(gameInfoPanelEl&&!gameInfoPanelEl.classList.contains('hidden'))); }
  function hideGameMenu(){ if(gameOptsMenuEl) gameOptsMenuEl.classList.add('hidden'); if(gameInfoPanelEl) gameInfoPanelEl.classList.add('hidden'); if(gameOptsBtnEl) gameOptsBtnEl.setAttribute('aria-expanded','false'); }
  function toggleGameMenu(){ if(!isInGame()||!gameOptsMenuEl) return; const willOpen=gameOptsMenuEl.classList.contains('hidden'); hideGameMenu(); if(willOpen){ gameOptsMenuEl.classList.remove('hidden'); if(gameOptsBtnEl) gameOptsBtnEl.setAttribute('aria-expanded','true'); } }
  function openGameInfo(){ if(!isInGame()) return; fillGameInfo(); if(gameOptsMenuEl) gameOptsMenuEl.classList.add('hidden'); if(gameInfoPanelEl) gameInfoPanelEl.classList.remove('hidden'); if(gameOptsBtnEl) gameOptsBtnEl.setAttribute('aria-expanded','true'); if(inputEl) inputEl.blur(); }
  function fillGameInfo(){
    if(!gameInfoBodyEl) return;
    const mode=speedrun?'⚡ SPEEDRUN':'▶ NORMAL (jugar)';
    const lvl=levelData?(levelData.isJsBoss?('Nivel '+levelData.id+' · '+levelData.title):(levelData.isBoss?(cssBoss?'👑 JEFE CSS':'👑 JEFE FINAL'):('Nivel '+levelData.id+' · '+levelData.title))):'—';
    let foes='—';
    if(levelData&&levelData.isJsBoss){ foes=jsBossPortal?'🌀 yendo al portal':('etapa '+jsBossPhase+'/3 · '+enemies.length+' naves · 🔫 '+jsBossBullets); }
    else if(levelData&&levelData.isBoss){ foes=cssBoss?(enemies.length+' naves + jefe '+bossHP+'❤'):('Jefe '+bossHP+'/'+bossMaxHP+'❤'); }
    else if(levelData){ foes=(enemies.length+questionsLeft.length)+' naves'; }
    let t='—';
    if(speedrun){ try{ t=formatTime(speedrunFinished?speedrunTime:(performance.now()-speedrunStart)); }catch(e){} }
    const rows=[['🎮 Modo',mode],['🌌 Galaxia',gal().label],['🗺 Nivel',lvl],['⭐ Puntos',String(score)],['🪙 Monedas',String(coins)],['❤ Vidas',String(Math.max(lives,0))],['👾 Enemigos',foes],['🔥 Racha',String(comboCount)],['⏱ Tiempo',t]];
    gameInfoBodyEl.innerHTML=rows.map(r=>'<div class="game-info-row"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('');
  }
  function showExitConfirm(){ if(!isInGame()||!exitOverlayEl) return; exitOverlayEl.classList.remove('hidden'); if(inputEl) inputEl.blur(); }
  function hideExitConfirm(){ if(exitOverlayEl) exitOverlayEl.classList.add('hidden'); if(isInGame() && inputEl){ inputEl.focus(); } }
  function doExit(){ hideExitConfirm(); exitMobileFS(); state='title'; bossDodge=false; bossQuizActive=false; speedrun=false; speedrunFinished=false; jsBoss=false; jsBossPhase=0; jsBossPortal=null; jsBossBullets=0; jsBossShake=0; jsBossFreeze=0; setGalaxy(1); if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); levelData=null; enemies=[]; currentEnemy=null; particles=[]; lasers=[]; impacts=[]; bossTags=[]; bossItems=[]; if(inputEl){ inputEl.value=''; inputEl.disabled=false; inputEl.blur(); } updateHUD(); updateExitBtn(); showBtns(); if(typeof saveProgress==='function') saveProgress(false); }
  function showBtns(){
    if(startBtnEl) startBtnEl.classList.add('hidden');
    if(speedrunBtnEl) speedrunBtnEl.classList.add('hidden');
    if(singlePlayerBtnEl) singlePlayerBtnEl.classList.remove('hidden');
    if(multiPlayerBtnEl) multiPlayerBtnEl.classList.remove('hidden');
    if(modeBackBtnEl) modeBackBtnEl.classList.add('hidden');
    if(multiBtnEl) multiBtnEl.classList.add('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(levelsBtnEl) levelsBtnEl.classList.add('hidden'); if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); updateExitBtn(); }
  function showSingleModes(){
    if(startBtnEl){
      startBtnEl.textContent='▶ JUGAR';
      startBtnEl.classList.remove('hidden');
    }
    if(speedrunBtnEl) speedrunBtnEl.classList.remove('hidden');
    if(levelsBtnEl) levelsBtnEl.classList.remove('hidden');
    if(modeBackBtnEl) modeBackBtnEl.classList.remove('hidden');
    if(singlePlayerBtnEl) singlePlayerBtnEl.classList.add('hidden');
    if(multiPlayerBtnEl) multiPlayerBtnEl.classList.add('hidden');
    if(multiBtnEl) multiBtnEl.classList.add('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(levelsBtnEl) levelsBtnEl.classList.add('hidden'); updateExitBtn(); }
  function openMultiEntry(){
    if(typeof MultiUI!=='undefined'&&MultiUI.openLobby) MultiUI.openLobby();
  }
  function showRetryBtn(){ if(startBtnEl) startBtnEl.classList.add('hidden'); if(speedrunBtnEl) speedrunBtnEl.classList.add('hidden'); if(singlePlayerBtnEl) singlePlayerBtnEl.classList.add('hidden'); if(multiPlayerBtnEl) multiPlayerBtnEl.classList.add('hidden'); if(modeBackBtnEl) modeBackBtnEl.classList.add('hidden'); if(multiBtnEl) multiBtnEl.classList.add('hidden'); if(retryBtnEl) retryBtnEl.classList.remove('hidden'); if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); updateExitBtn(); }
  function hideBtns(){ if(startBtnEl) startBtnEl.classList.add('hidden'); if(retryBtnEl) retryBtnEl.classList.add('hidden'); if(levelsBtnEl) levelsBtnEl.classList.add('hidden'); if(speedrunBtnEl) speedrunBtnEl.classList.add('hidden'); if(singlePlayerBtnEl) singlePlayerBtnEl.classList.add('hidden'); if(multiPlayerBtnEl) multiPlayerBtnEl.classList.add('hidden'); if(modeBackBtnEl) modeBackBtnEl.classList.add('hidden'); if(multiBtnEl) multiBtnEl.classList.add('hidden'); updateExitBtn(); }
  function startNormal(){ speedrun=false; speedrunFinished=false; speedrunTime=0; 
  if(speedrunHudEl) speedrunHudEl.classList.add('hidden'); score=0; setGalaxy(1); jsBoss=false; jsBossPhase=0; jsBossPortal=null; jsBossBullets=0; jsBossShake=0; jsBossFreeze=0; if(isLogged()){ try{ const v=localStorage.getItem(`ci_${uid()}_coins`); coins=v?parseInt(v)||0:0; }catch(e){ coins=0; } } else { try{ const v=sessionStorage.getItem('ci_guest_coins'); coins=v?parseInt(v)||0:0; }catch(e){ coins=0; } } lives=2;
  let sIdx=0;
  startLevel(sIdx); enterMobileFS(); }
  function startSpeedrun(){ speedrun=true; speedrunFinished=false; speedrunTime=0; speedrunStart=performance.now(); 
  score=0; lives=2; setGalaxy(1); jsBoss=false; jsBossPhase=0; jsBossPortal=null; startLevel(0); if(speedrunHudEl) speedrunHudEl.classList.remove('hidden'); updateSpeedrunHud(); enterMobileFS(); }
  function startLevel(lvl){
    level=lvl; const base=LEVELS[level];
    if(speedrun && level===0){ levelData={...base,title:base.title+' ⚡ SPEEDRUN',enemySpeed:1.45,spawnInterval:45,enemyHealth:1}; }
    else levelData=base;
    questionsLeft=levelData.questions.map(q=>({...q}));
    bossPool=levelData.questions.map(q=>({...q}));
    enemies=[]; currentEnemy=null; particles=[]; lasers=[]; frameCount=0; shootCooldown=0;
    comboCount=0; comboTimer=0; comboPop=0; slowTimer=0; fastTimer=0;
    player.speed=player.baseSpeed; state='intro'; levelPause=90;
    setGalaxy(levelData.galaxy||1);
    if(inputEl){ inputEl.value=''; inputEl.disabled=true; }
    if(levelData.isJsBoss){ startJsBoss(); updateHUD(); return; }
    jsBoss=false; jsBossPhase=0; jsBossBullets=0; jsBossPortal=null; jsBossShake=0; jsBossFreeze=0; jsBossBubble=''; jsBossBubbleTimer=0;
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
  // El disparo lleva el láser que el jugador tiene equipado y el reloj del
  // disparo, para que la animación vaya por donde va la bala y no con el
  // reloj de la pantalla.
  function makeLaser(x1,y1,x2,y2,color){ lasers.push({x1,y1,x2,y2,color,life:15,fx:equippedLaser,born:frameCount}); }
  // Chispas sueltas de siempre. Cuando la nave desaparece de verdad (big) se
// agrega además el impacto de la skin comprada, con el radio "r" (que se
// agranda con la nave que acaba de morir). Con el impacto "normal" no se agrega
// nada: las chispas de acá mismo SON la explosión de siempre.
function explode(x,y,color,count,big,r){ for(let i=0;i<count;i++){ const a=Math.random()*Math.PI*2,sp=1+Math.random()*4; particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:25+Math.random()*20,maxLife:45,color,size:2+Math.random()*3}); } if(big&&equippedImpact!=='default') impacts.push({x,y,born:frameCount,dur:42,color,r:r||34}); }
  // Los impactos van por su propia cuenta: nacen con un "born" y se van cuando
  // pasan los cuadros que dura. Se actualizan arriba de todo (junto con el
  // reloj) para que la explosión siga terminándose aunque el nivel se termine
  // en el mismo disparo. El avance (k) lo calcula el que dibuja.
  function updateImpacts(){ for(let i=impacts.length-1;i>=0;i--){ const im=impacts[i]; if(frameCount-im.born>im.dur) impacts.splice(i,1); } }
  function drawImpacts(){ if(equippedImpact==='default') return; for(const im of impacts){ const age=frameCount-(im.born||0); ImpactFx.draw(ctx,equippedImpact,im.x,im.y,age/im.dur,{t:age/60,r:im.r||34}); } }
  let audioCtx=null;
  function initAudio(){ if(audioCtx) return; const Ctor=window.AudioContext||window.webkitAudioContext; if(!Ctor) return; audioCtx=new Ctor(); }
  function resumeAudio(){ if(audioCtx&&audioCtx.state==='suspended') audioCtx.resume(); }
  function _tone(freq,t,dur,type,vol){ if(!audioCtx) return; const g=audioCtx.createGain(),o=audioCtx.createOscillator(); o.type=type||'sine'; o.frequency.setValueAtTime(freq,t); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g).connect(audioCtx.destination); o.start(t); o.stop(t+dur); }
  function playSound(type){ if(!audioCtx) initAudio(); if(!audioCtx) return; resumeAudio(); const now=audioCtx.currentTime; switch(type){ case 'laser': _tone(880,now,0.12,'sine',0.18); break; case 'explosion': _tone(180,now,0.35,'sawtooth',0.25); _tone(90,now+0.05,0.3,'square',0.15); break; case 'hit': _tone(130,now,0.3,'sine',0.18); break; case 'combo': _tone(330,now,0.18,'sine',0.15); _tone(440,now+0.1,0.18,'sine',0.15); _tone(660,now+0.2,0.22,'sine',0.18); break; case 'pickup': _tone(440,now,0.2,'sine',0.14); _tone(880,now+0.12,0.25,'sine',0.14); break; } }
  function addCoins(n){ if(!n) return; coins+=n; score+=n; saveShopLocal(); updateHUD(); updateShopUI(); if(typeof API!=='undefined'&&typeof Auth!=='undefined'&&Auth.isLogged){ API.saveProgress(level+1,0,false,n).catch(()=>{}); } }
  function doBossDodgeShoot(){
    if(state!=='playing' || bossQuizActive) return false;
    if(shootCooldown>0 || bossBullets<=0) return false;
    shootCooldown=15; bossBullets--;
    makeLaser(player.x,player.y-22,bossX,bossY,'#ff0');
    bossHP--; bossDodgeScore+=15; addCoins(5); if(typeof Profile!=='undefined') Profile.addExp(10,0); scorePop=12; playSound('explosion');
    if(bossHP<=0){ explode(bossX,bossY,'#ff0',40,true,58); bossDodge=false; addCoins(100); if(typeof Profile!=='undefined') Profile.addExp(100,100); onBossDefeated(); }
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
      saveProgress(false);
    }
    updateHUD();
  }
  const CSS_FAIL_MSGS=['¡Que burro! 😂','¡Estudiá CSS! 📚','¡Fallaste! Yo me río 😈','¡Ni eso sabés? 🤣','¡Burro nivel Dios! 🐴'];
  const CSS_HIT_MSGS=['¡Auch! 😡','¡Me diste! 🤬','¡Sorpresa! 😲','¡Te odio! 👿','¡Me enojo! 🔥'];
  const CSS_KILL_MSGS=['¡Nooo! 💀','¡Imposible! 😱','¡Te odio más! 🤯','¡Me enfada! 😤'];
  function showCssBubble(txt,frames=90){ cssBossBubble=txt; cssBossBubbleTimer=frames; }
  const JS_HIT_MSGS=['¡Auch! 😡','¡Mis naves! 🤬','¡Todavía sigo! 🔥','¡No me molestes! 👿'];
  const JS_ANGRY_MSGS=['¡YA BASTA! 😤','¡ESTOY FURIOSO! 🔥🔥','¡SE ME ACABÓ LA PACIENCIA! 😱','¡TE VOY A ROMPER! 💢'];
  const JS_FAIL_MSGS=['¡Error 404! 😂','¡undefined! 🤡','¡NaN! 🤣','¡SyntaxError! 💀','¡Bug en tu cabeza! 🐛'];
  function showJsBubble(txt,frames=100){ jsBossBubble=txt; jsBossBubbleTimer=frames; }
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
      explode(bossX,bossY,'#ff0',40,true,78); cssBoss=false; bossDodge=false; addCoins(100); if(typeof Profile!=='undefined') Profile.addExp(100,100);
      onBossDefeated();
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

  // ══ JEFE DE JAVASCRIPT (nivel 6) ══════════════════════════════════════
  // Es el jefe más enredado: no se le dispara a él, hay que sacarle las naves
  // que va tirando, y cada etapa es más difícil que la anterior.
  //   Etapa 1 → 4 naves con etiqueta HTML (1 escritura cada una).
  //   Etapa 2 → se enoja: 2 naves con vida, hay que escribir su código 3 veces.
  //   Etapa 3 → se vuelve furioso: la galaxia tiembla y tira 5 naves con
  //             etiqueta CSS. Escribir el código NO las destruye: da 1 bala.
  //             Recién con las balas (1 por nave, o todas juntas) se destruyen.
  //   Final   → abre un portal, el espacio se congela y hay que meterse.
  function jsNorm(s){ return String(s==null?'':s).toLowerCase().replace(/\s+/g,'').replace(/^</,'').replace(/>$/,''); }
  function startJsBoss(){
    jsBoss=true; jsBossPhase=0; jsBossBullets=0; jsBossShake=0; jsBossFreeze=0; jsBossPortal=null;
    jsBossBubble='¡Yo soy el Jefe JavaScript! 🤖'; jsBossBubbleTimer=120;
    cssBoss=false; bossDodge=false;
    bossX=CW/2; bossY=80; bossHP=levelData.bossHealth; bossMaxHP=levelData.bossHealth;
    enemies=[]; currentEnemy=null; particles=[]; lasers=[]; bossTags=[]; bossItems=[];
  }
  function spawnJsShips(tags,count,health,w,h,y,vy){
    // Sin repetir etiqueta dentro de la misma tanda: así cada nave pide un
    // código distinto y se lee bien cuál hay que escribir.
    const pool=tags.slice();
    const gap=count>1?(CW-200)/(count-1):0;
    for(let i=0;i<count;i++){
      const k=Math.floor(Math.random()*pool.length);
      const t=pool.splice(k,1)[0]||tags[Math.floor(Math.random()*tags.length)];
      const sx=CW/2+(i-(count-1)/2)*gap;
      enemies.push({baseX:sx,baseY:y,x:sx,y,w,h,health,maxHealth:health,question:t,answer:t,flash:0,wobble:Math.random()*Math.PI*2,wobbleAmp:0.5,wobbleSpeed:0.04,vy,jsShip:true});
    }
  }
  function jsBossNextPhase(){
    jsBossPhase++;
    if(jsBossPhase===1){ spawnJsShips(JS_HTML_TAGS,4,1,98,58,140,0.3); showJsBubble('Etapa 1 · Rompé mis 4 etiquetas HTML 😈',110); }
    else if(jsBossPhase===2){ spawnJsShips(JS_HTML_TAGS,2,3,116,66,140,0.45); showJsBubble('¡YA BASTA! Escribí el código 3 veces 😤',110); playSound('pickup'); }
    else if(jsBossPhase===3){ jsBossShake=1; spawnJsShips(JS_CSS_TAGS,5,1,96,58,150,0.5); showJsBubble('¡¡FURIOSO!! Escribí para ganar balas 🔫',120); playSound('pickup'); }
    else if(jsBossPhase===4){ openJsPortal(); }
    bossHP=Math.max(0,bossMaxHP-5*(jsBossPhase-1));
    updateHUD();
  }
  function openJsPortal(){
    // El portal se queda quieto en el lugar donde se abrió: el jugador sólo
    // tiene quecorrerse para underneath.
    jsBossPortal={x:Math.max(70,Math.min(CW-70,bossX)),y:bossY+16,t:0};
    jsBossFreeze=1; jsBossShake=0; jsBossBullets=0;
    showJsBubble('¡ABRÍ UN PORTAL! Metete debajo 🌀',180);
    explode(bossX,bossY,'#ff4fd8',30,true,50); playSound('pickup');
  }
  function jsBossShoot(){
    if(state!=='playing'||!jsBoss||jsBossPortal) return false;
    if(jsBossPhase!==3) return false;
    if(shootCooldown>0||jsBossBullets<=0) return false;
    const targets=enemies.filter(e=>e.jsShip).slice(0,jsBossBullets);
    if(!targets.length) return false;
    shootCooldown=18; jsBossBullets-=targets.length;
    for(const e of targets){ makeLaser(player.x,player.y-22,e.x,e.y,'#ffea00'); explode(e.x,e.y,'#ff0',22,true,40); }
    enemies=enemies.filter(e=>targets.indexOf(e)<0);
    const pts=targets.length*20; score+=pts; addCoins(pts); scorePop=14; playSound('explosion');
    showJsBubble(targets.length>1?('💥 ¡'+targets.length+' naves de un tiro!'):JS_HIT_MSGS[Math.floor(Math.random()*JS_HIT_MSGS.length)],80);
    if(enemies.length===0) jsBossNextPhase();
    updateHUD();
    return true;
  }
  function fireJsBossAnswer(){
    if(shootCooldown>0||jsBossPortal){ inputEl.value=''; if(inputEl) inputEl.focus(); return; }
    const typed=inputEl.value.trim(); if(!typed){ return; }
    shootCooldown=15;
    const hit=enemies.find(e=>e.jsShip&&jsNorm(e.answer)===jsNorm(typed));
    if(hit){
      makeLaser(player.x,player.y-22,hit.x,hit.y,'#0f0');
      hit.flash=12;
      if(jsBossPhase===3){
        jsBossBullets++; score+=5; addCoins(2); scorePop=10;
        showJsBubble('🔫 +1 BALA  (tenés '+jsBossBullets+')',80); playSound('pickup');
      } else {
        hit.health--; score+=10; addCoins(4); scorePop=12;
        explode(hit.x,hit.y,'#0f0',16,true,34); playSound('explosion');
        if(hit.health>0) showJsBubble('❤️ Le quedan '+hit.health+' golpes a '+hit.question,80);
        else { showJsBubble(JS_ANGRY_MSGS[Math.floor(Math.random()*JS_ANGRY_MSGS.length)],70); }
        if(hit.health<=0){ enemies=enemies.filter(e=>e!==hit); if(enemies.length===0) jsBossNextPhase(); }
      }
    } else {
      makeLaser(player.x,player.y-22,player.x+(Math.random()-0.5)*80,0,'#f66'); explode(player.x,player.y-30,'#f66',6);
      score=Math.max(0,score-3); coins=Math.max(0,coins-1); saveShopLocal(); scorePop=-8;
      showJsBubble(JS_FAIL_MSGS[Math.floor(Math.random()*JS_FAIL_MSGS.length)],80);
      damagePlayer();
    }
    inputEl.value=''; inputEl.focus(); updateHUD();
  }
  function updateJsBoss(){
    if(jsBossBubbleTimer>0) jsBossBubbleTimer--;
    if(jsBossShake>0) jsBossShake=Math.max(0,jsBossShake-0.004);
    if(state==='playing'&&jsBossPhase===0) jsBossNextPhase();
    if(!jsBossPortal){ bossX=CW/2+Math.sin(frameCount*0.011)*130; bossY=82+Math.sin(frameCount*0.028)*7; }
    if(jsBossPhase<4){
      for(let i=enemies.length-1;i>=0;i--){
        const e=enemies[i];
        e.wobble+=e.wobbleSpeed; e.x=e.baseX+Math.sin(e.wobble)*3;
        e.y+=e.vy; if(e.flash>0) e.flash--;
        if(e.y>H+50){ if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); damagePlayer(); showJsBubble(JS_FAIL_MSGS[Math.floor(Math.random()*JS_FAIL_MSGS.length)],70); continue; }
        const dx=e.x-player.x, dy=e.y-player.y;
        if(Math.abs(dx)<(e.w+player.w)/2-8&&Math.abs(dy)<(e.h+player.h)/2-8){ if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); explode(e.x,e.y,'#f44',14); damagePlayer(); showJsBubble(JS_FAIL_MSGS[Math.floor(Math.random()*JS_FAIL_MSGS.length)],70); }
      }
      // En la etapa 3 el SPACE dispara aunque estés escribiendo: el handler de
      // teclas le saca el preventDefault al espacio para que no se pegue en el
      // input (los códigos CSS que se escriben no llevan espacios).
      if(state==='playing'&&!jsBossPortal&&keys[' ']) jsBossShoot();
    }
    if(jsBossPortal){
      const p=jsBossPortal; p.t++;
      if(p.y<player.y) p.y=Math.min(player.y,p.y+0.9);
      if(p.y>=player.y-0.5&&Math.abs(player.x-p.x)<48){ enterJsPortal(); return; }
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
  function enterJsPortal(){
    if(state!=='playing') return;
    jsBossPortal=null; state='portal'; portalFade=0;
    addCoins(150); if(typeof Profile!=='undefined') Profile.addExp(150,100);
    explode(player.x,player.y,'#ff4fd8',40,true,60); playSound('explosion');
    saveProgress(true); updateHUD(); updateExitBtn();
  }
  function drawPortalTravel(){
    ctx.fillStyle='#05010c'; ctx.fillRect(0,0,W,H);
    const k=Math.min(1,portalFade/70), cx=W/2, cy=H/2;
    for(let i=0;i<10;i++){
      const r=Math.max(1,(14+k*440)*(1-i*0.07));
      ctx.strokeStyle='rgba(255,79,216,'+((0.12+k*0.75)*(1-i*0.08))+')';
      ctx.lineWidth=2+k*4;
      ctx.beginPath(); ctx.arc(cx,cy,r,frameCount*0.03*(i%2?1:-1),frameCount*0.03*(i%2?1:-1)+Math.PI*(1.4+k)); ctx.stroke();
    }
    ctx.fillStyle='rgba(255,179,236,'+(0.25+k*0.75)+')'; ctx.shadowColor='#ff4fd8'; ctx.shadowBlur=20+k*30;
    ctx.beginPath(); ctx.arc(cx,cy,Math.max(1,6+k*120),0,Math.PI*2); ctx.fill(); ctx.shadowBlur=0;
    if(k>0.3){
      ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.font='bold 26px monospace';
      ctx.fillText('🌌 GALAXIA 2',cx,cy-16);
      ctx.font='bold 12px monospace'; ctx.fillStyle='#ffb3ec';
      ctx.fillText('Nebulosa Violeta · te espera el nivel 7',cx,cy+16);
    }
  }
  function drawJsBoss(){
    // El jefe desaparece en cuanto abre el portal: sólo queda el portal.
    if(jsBossPortal){
      const p=jsBossPortal, r=p.r||Math.max(8,30+Math.sin(p.t*0.06)*3);
      ctx.save();
      // Guía punteada hasta tu fila: así se ve a dónde hay que meterse.
      ctx.strokeStyle='rgba(255,179,236,.45)'; ctx.lineWidth=2; ctx.setLineDash([6,8]);
      ctx.beginPath(); ctx.moveTo(p.x,p.y+r); ctx.lineTo(p.x,player.y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle='rgba(255,179,236,'+(0.35+Math.abs(Math.sin(p.t*0.12))*0.5)+')'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.ellipse(p.x,player.y,46,16,0,0,Math.PI*2); ctx.stroke();
      const g=ctx.createRadialGradient(p.x,p.y,2,p.x,p.y,r*2.1);
      g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(0.35,'rgba(255,79,216,.85)'); g.addColorStop(1,'rgba(120,20,160,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,r*2.1,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,179,236,.9)'; ctx.lineWidth=3;
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(p.x,p.y,r*(0.5+i*0.28),p.t*0.04+i,p.t*0.04+i+Math.PI*1.2); ctx.stroke(); }
      ctx.fillStyle='#fff'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      ctx.fillText('🌀 PORTAL — ponete abajo (⬅ ➡)',p.x,p.y-r-12);
      ctx.restore();
    }
    if(!jsBossPortal){
      ctx.save();
      // Ojitos furiosos
      ctx.fillStyle='#0b3d16'; ctx.shadowColor='#00e676'; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.ellipse(bossX,bossY,44,34,0,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle='#fff';
      for(const s of [-1,1]){ ctx.beginPath(); ctx.ellipse(bossX+s*16,bossY-6,12,9,0,0,Math.PI*2); ctx.fill(); }
      const angry=jsBossPhase>=3;
      ctx.fillStyle=angry?'#ff1744':'#0b3d16';
      for(const s of [-1,1]){ ctx.beginPath(); ctx.arc(bossX+s*16+Math.sin(frameCount*0.2)*2,bossY-4,5,0,Math.PI*2); ctx.fill(); }
      // Boca (cuanto más furioso, más grande)
      ctx.strokeStyle='#0b3d16'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(bossX,bossY+18,10+jsBossPhase*3,Math.PI*(angry?0.05:0.15),Math.PI*(angry?0.95:0.85)); ctx.stroke();
      // Antena con el "{ }" del lenguaje
      ctx.strokeStyle='#a5d6a7'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(bossX,bossY-30); ctx.lineTo(bossX,bossY-48); ctx.stroke();
      ctx.fillStyle='#ffea00'; ctx.beginPath(); ctx.arc(bossX,bossY-52,8,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0b3d16'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('{}',bossX,bossY-52);
      // Brazos
      ctx.strokeStyle='#2e7d32'; ctx.lineWidth=6; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(bossX-40,bossY+6); ctx.lineTo(bossX-58,bossY+22); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bossX+40,bossY+6); ctx.lineTo(bossX+58,bossY+22); ctx.stroke();
      // Barra de vida + etapa
      const bw=210, hp=Math.max(0,bossHP/bossMaxHP);
      ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(bossX-bw/2,bossY-76,bw,9);
      ctx.fillStyle=hp>0.5?'#00e676':hp>0.25?'#ffd600':'#ff1744'; ctx.fillRect(bossX-bw/2,bossY-76,bw*hp,9);
      ctx.strokeStyle='#fff'; ctx.lineWidth=1; ctx.strokeRect(bossX-bw/2,bossY-76,bw,9);
      ctx.fillStyle='#fff'; ctx.font='bold 10px monospace';
      ctx.fillText('🤖 JEFE JAVASCRIPT · etapa '+jsBossPhase+'/3 · '+bossHP+'❤',bossX,bossY-64);
      if(jsBossBubble&&jsBossBubbleTimer>0){
        const bw2=ctx.measureText(jsBossBubble).width+16;
        ctx.fillStyle='rgba(255,255,255,.95)'; ctx.strokeStyle='#2e7d32'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.roundRect(bossX-bw2/2,bossY-108,bw2,26,10); ctx.fill(); ctx.stroke();
        ctx.fillStyle='#0b3d16'; ctx.textAlign='center'; ctx.font='bold 11px monospace';
        ctx.fillText(jsBossBubble,bossX,bossY-95);
      }
      ctx.restore();
    }
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

  // Un jefe derrotado solo cierra el juego si era el último nivel. En cualquier
  // otro caso (Jefe Final, Jefe CSS, Jefe JavaScript) hay que encadenar al
  // siguiente nivel: antes esa comprobación faltaba en la ruta de responder y
  // el juego se terminaba de forma prematura al vencer al Jefe CSS.
  function onBossDefeated(){
    if(level < LEVELS.length-1){
      state='levelcomplete'; if(inputEl) inputEl.disabled=true; saveProgress(true);
      setTimeout(()=>startLevel(level+1),1500);
    } else {
      state='bossWin'; if(inputEl) inputEl.disabled=true; showRetryBtn(); saveProgress(true);
    }
  }
  function checkBossDefeat(){
    if(!levelData||!levelData.isBoss) return;
    if(enemies.length&&enemies[0].health<=0){
      explode(enemies[0].x,enemies[0].y,'#ff0',40,true,78);
      enemies=[]; currentEnemy=null;
      addCoins(100);
      onBossDefeated();
    }
  }
  // Diseño de nave que corresponde al nivel en curso: uno distinto para cada
  // nivel (los mismos que usa el multijugador). Del 6 para abajo (el nivel 7,
  // en la galaxia 2) se reciclan los modelos que ya había.
  const LEVEL_SHIP={1:'html',2:'css',3:'js',4:'boss',5:'bossCss',6:'js',7:'js'};
  function enemyDesignFor(){
    if(!levelData) return 'html';
    if(levelData.isJsBoss) return 'js';
    if(levelData.isCssBoss) return 'bossCss';
    if(levelData.isBoss) return 'boss';
    return LEVEL_SHIP[Number(levelData.id)]||'html';
  }
  // Guarda cómo va el nivel. solved=true cuando lo terminás; los intentos
  // sólo se cuentan cuando la partida se pierde o se abandona, así un nivel
  // superado no suma intentos falsos.
  function saveProgress(solved,countAttempt){
    const lvl=level+1;
    const isRealAttempt=countAttempt!==false&&!solved;
    const earned = solved ? (levelData&&levelData.isBoss?100:10*lvl) : 0;
    if(Auth && Auth.progress){
      try{
        let e=Auth.progress.find(p=>Number(p.level)===lvl);
        if(!e){ e={level:lvl,attempts:0,solved:false,solvedAt:null}; Auth.progress.push(e); }
        if(isRealAttempt) e.attempts=(Number(e.attempts)||0)+1;
        if(solved&&!e.solved){ e.solved=true; e.solvedAt=new Date().toISOString(); }
        if(typeof Auth.maxLevelReached!=='number'||Auth.maxLevelReached<lvl) Auth.maxLevelReached=lvl;
        if(isLogged()) localStorage.setItem('ci_'+uid()+'_progress', JSON.stringify(Auth.progress));
      }catch(err){}
    }
    if(typeof API!=='undefined'&&typeof Auth!=='undefined'&&Auth.isLogged) API.saveProgress(lvl,isRealAttempt?1:0,solved,earned).catch(()=>{});
    else if(earned) saveShopLocal();
  }
  function fireAnswer(){
    if(state!=='playing'||!inputEl) return;
    if(jsBoss){ fireJsBossAnswer(); return; }
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
        for(const e of matching){ makeLaser(player.x,player.y-22,e.x,e.y,'#0f0'); explode(e.x,e.y,'#0f0',15,true,28); e.health=0; }
        const before=enemies.length;
        enemies=enemies.filter(e=>e.health>0);
        if(enemies.length < before){ score+=15; addCoins(5); scorePop=12; playSound('explosion'); showCssBubble(CSS_HIT_MSGS[Math.floor(Math.random()*CSS_HIT_MSGS.length)],70); }
        if(enemies.length===0){
          bossHP-=2; if(bossHP<0) bossHP=0; explode(bossX,bossY,'#0f0',10); showCssBubble(CSS_KILL_MSGS[Math.floor(Math.random()*CSS_KILL_MSGS.length)],90); playSound('explosion');
          if(bossHP<=0){ explode(bossX,bossY,'#ff0',40,true,78); cssBoss=false; bossDodge=false; addCoins(100); if(typeof Profile!=='undefined') Profile.addExp(100,100); onBossDefeated(); }
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
      for(const e of matching){ makeLaser(player.x,player.y-22,e.x,e.y,'#0f0'); explode(e.x,e.y,'#0f0',15); e.health--; e.flash=12; if(e.health<=0){ explode(e.x,e.y,'#ff0',30,true,44); destroyed++; } }
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
    frameCount++; updateImpacts(); if(shootCooldown>0) shootCooldown--; if(scorePop>0) scorePop--; else if(scorePop<0) scorePop++; if(comboPop>0) comboPop--;
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
    if(state==='portal'){ portalFade++; if(portalFade>120){ setGalaxy(2); startLevel(level+1); } return; }
    if(state==='intro'){ levelPause--; if(levelPause<=0){ state='playing'; if(bossDodge||jsBoss){ } else buildFormation(); if(inputEl){ inputEl.disabled=false; inputEl.focus(); } } return; }
    if(state==='levelcomplete') return;
    if(jsBoss&&state==='playing'){ updateJsBoss(); return; }
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
          showBtns();
          saveProgress(false); continue;
        }
        if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); damagePlayer(); continue; } const dx=e.x-player.x, dy=e.y-player.y; if(Math.abs(dx)<(e.w+player.w)/2-8&&Math.abs(dy)<(e.h+player.h)/2-8){ if(e===currentEnemy) currentEnemy=null; enemies.splice(i,1); explode(e.x,e.y,'#f44',20,true,44); damagePlayer(); } }
    }
    for(let i=lasers.length-1;i>=0;i--){ lasers[i].life--; if(lasers[i].life<=0) lasers.splice(i,1); }
    for(let i=particles.length-1;i>=0;i--){ const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.06; p.life--; if(p.life<=0) particles.splice(i,1); }
    checkLevelComplete(); updateHUD();
  }
  function render(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle=gal().bg; ctx.fillRect(0,0,W,H);
    // Cuando el jefe de JavaScript se vuelve furioso la galaxia entera tiembla.
    ctx.save();
    if(jsBossShake>0&&(state==='playing'||state==='intro')){ const m=jsBossShake*7; ctx.translate((Math.random()-0.5)*m,(Math.random()-0.5)*m); }
    drawFrame();
    ctx.restore();
  }
  function drawFrame(){ drawStars(); if(state==='title'){ drawTitle(); return; } if(state==='portal'){ drawPortalTravel(); return; } if(state==='intro'){ drawIntro(); return; } if(jsBoss&&state==='playing'){ drawJsBoss(); drawEnemies(); drawPlayer(); drawLasers(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='bossWin') drawBossWin(); return; } if(cssBoss&&state==='playing'){ drawCssBoss(); drawEnemies(); drawPlayer(); drawLasers(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='bossWin') drawBossWin(); return; } if(bossDodge&&(state==='playing'||state==='bossquiz')){ drawPlayer(); drawBossDodge(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='bossWin') drawBossWin(); return; } drawEnemies(); drawPlayer(); drawLasers(); drawParticles(); drawHUDCanvas(); if(state==='gameover') drawGameOver(); if(state==='win') drawWin(); if(state==='speedrunWin') drawSpeedrunWin(); if(state==='bossWin') drawBossWin(); if(state==='levelcomplete') drawLevelComplete(); }
  // Las estrellas se congelan cuando el jefe abre el portal (el espacio "se
  // detiene") y el color depende de la galaxia en la que estemos.
  function drawStars(){ for(const s of titleStars){ if(!jsBossFreeze){ s.y+=s.speed; if(s.y>H){ s.y=0; s.x=Math.random()*W; } } ctx.fillStyle=`rgba(${gal().star},${0.3+Math.sin(frameCount*0.02+s.x)*0.2})`; ctx.fillRect(s.x,s.y,s.size,s.size); } }
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
      // Un diseño de nave distinto por nivel (compartido con el multijugador).
      EnemyShips.draw(ctx,e.design||enemyDesignFor(),e.x,e.y,e.w,e.h);
      if(isTarget){
        ctx.strokeStyle='#fff'; ctx.lineWidth=2;
        ctx.strokeRect(e.x-e.w/2,e.y-e.h/2,e.w,e.h);
        const ring=27+Math.sin(frameCount*0.12)*3;
        ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=1.5;
        ctx.setLineDash([5,5]);
        ctx.strokeRect(e.x-ring,e.y-ring,ring*2,ring*2);
        ctx.setLineDash([]);
        ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('▼',e.x,e.y-ring+4);
        if(comboCount>=3){
          const ans=e.answer; const hint=ans.length>1&&ans.charAt(0)==='<'?ans:'<'+ans+'>';
          ctx.save(); ctx.globalAlpha=1; ctx.fillStyle='#ffeb3b'; ctx.shadowColor='#ffeb3b';
          ctx.shadowBlur=8+Math.sin(frameCount*0.2)*4; ctx.font='bold 13px monospace';
          ctx.textAlign='center'; ctx.textBaseline='middle';
          ctx.fillText('💡 '+hint,e.x,e.y-e.h/2-16); ctx.restore();
        }
      }
      if(e.maxHealth>1){
        const bw=e.w-8; const hp=Math.max(0,e.health/e.maxHealth);
        ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(e.x-bw/2,e.y-e.h/2-7,bw,4);
        ctx.fillStyle=hp>0.5?'#00e676':(hp>0.25?'#ffd600':'#ff1744');
        ctx.fillRect(e.x-bw/2,e.y-e.h/2-7,bw*hp,4);
      }
      // Texto legible dentro de la nave: la cajita se pinta con la skin de
      // etiqueta que tenga equipada el jugador (la de la tienda).
      EnemyShips.drawLabel(ctx,e.question,e.x,e.y+(isBoss?e.h*.1:e.h*.06),e.w-(isBoss?20:10),{fontSize:isBoss?12:11,t:frameCount/60});
      ctx.restore();
    }
  }
  function drawLasers(){ for(const l of lasers){ LaserFx.draw(ctx,l.fx,l.x1,l.y1,l.x2,l.y2,(frameCount-(l.born||0))/60,{tint:l.color,w:3,blur:12}); } }
  function drawParticles(){ for(const p of particles){ ctx.save(); ctx.globalAlpha=p.life/p.maxLife; ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=6; ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size); ctx.restore(); } drawImpacts(); }
  function drawHUDCanvas(){
    ctx.textAlign='left'; ctx.fillStyle='#7a8a9a'; ctx.font='bold 10px monospace'; ctx.fillText('PUNTOS',12,16);
    const pop=scorePop>0; ctx.fillStyle='#ffd600'; ctx.shadowColor='#ffd600'; ctx.shadowBlur=pop?18:8; ctx.font=(pop?'bold 24px':'bold 18px')+' monospace'; ctx.fillText('★ '+score,12,36); ctx.shadowBlur=0; if(scorePop<0){ ctx.fillStyle='#f66'; ctx.fillText('-'+Math.min(3,score),12,52); }
    ctx.fillStyle='#7a8a9a'; ctx.font='bold 9px monospace'; ctx.textAlign='left'; ctx.fillText('🪙 '+coins,12,52);
    ctx.textAlign='right'; ctx.fillStyle='#7a8a9a'; ctx.font='bold 10px monospace'; ctx.fillText('VIDAS',W-12,16);
    const hs=16,gap=21,n=Math.min(Math.max(lives,0),2); ctx.save(); ctx.shadowColor='#ff1744'; ctx.shadowBlur=8; ctx.fillStyle='#ff1744'; for(let i=0;i<n;i++){ const hx=W-12-hs/2-(n-1-i)*gap; drawHeart(hx,20,hs); } ctx.restore();
    if(levelData&&levelData.isJsBoss){
      if(jsBossPortal){ ctx.fillStyle='#ffb3ec'; ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillText('🌀 ¡EL PORTAL ESTÁ ABIERTO! Ponete abajo para entrar',W/2,44); }
      else {
        ctx.fillStyle='#a5d6a7'; ctx.font='bold 13px monospace'; ctx.textAlign='center';
        const qs=[...new Set(enemies.map(e=>e.question))];
        ctx.fillText('🤖 Etapa '+jsBossPhase+'/3  →  '+(qs.length?qs.join('  |  '):'...'),W/2,44);
        const bw=260; const hp=bossHP/bossMaxHP;
        ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(W/2-bw/2,58,bw,8);
        ctx.fillStyle=hp>0.5?'#00e676':hp>0.25?'#ffd600':'#ff1744'; ctx.fillRect(W/2-bw/2,58,bw*hp,8);
        ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.strokeRect(W/2-bw/2,58,bw,8);
      }
    } else if(levelData&&levelData.isBoss){
      const b=enemies[0]; if(b){ ctx.fillStyle='#ce93d8'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('👑 JEFE: '+b.health+'/'+b.maxHealth+'  →  '+b.question, W/2, 44); }
      const bw=260; const hp=b?b.health/b.maxHealth:0; ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(W/2-bw/2,58,bw,8); ctx.fillStyle=hp>0.5?'#ab47bc':hp>0.25?'#ffd600':'#ff1744'; ctx.fillRect(W/2-bw/2,58,bw*hp,8); ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.strokeRect(W/2-bw/2,58,bw,8);
    } else if(currentEnemy){ ctx.fillStyle='#fff'; ctx.font='bold 16px monospace'; ctx.textAlign='center'; ctx.fillText('Destruye → '+currentEnemy.question,W/2,44); } else { ctx.fillStyle='#8af'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('Haz clic izquierdo en una nave para apuntarla',W/2,44); }
    if(levelData&&levelData.isJsBoss){
      ctx.fillStyle='#a5d6a7'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      const hint=jsBossPhase===1?'Escribí la etiqueta HTML y ENTER para destruirla'
        :jsBossPhase===2?'Estas tienen 3 ❤️ : escribí el código 3 veces'
        :jsBossPhase===3?'Escribí el código CSS = +1 🔫 · Dispará con SPACE o 💥 para matarlas'
        :'El jefe se enfureció 😱';
      ctx.fillText(hint,W/2,78);
      ctx.fillStyle='#ffd600'; ctx.font='bold 15px monospace'; ctx.textAlign='right';
      ctx.fillText('🔫 '+jsBossBullets,W-12,80);
    } else if(levelData&&levelData.isBoss){
      if(cssBoss){
        ctx.fillStyle='#ce93d8'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('Escribe la propiedad CSS correcta y presiona ENTER. Fallo = -1 vida',W/2,78);
      } else {
        ctx.fillStyle='#ce93d8'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('¡El Jefe no avanza! Escribe la etiqueta y presiona ENTER. Fallo = -1 vida',W/2,78);
      }
    } else if(formationCountdown>0){ const secs=Math.ceil(formationCountdown/60); const color=secs<=3?'#ff1744':secs<=8?'#ffd600':(galaxy===2?'#ffb3ec':'#7ff'); ctx.fillStyle=color; ctx.font='bold 14px monospace'; ctx.textAlign='center'; ctx.fillText('⏱ Las naves bajan en '+secs+'s  (-2s por error)',W/2,64); const bw=160,pct=formationCountdown/(speedrun?SPEEDRUN_COUNTDOWN:FORMATION_COUNTDOWN_FRAMES); ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(W/2-bw/2,69,bw,4); ctx.fillStyle=color; ctx.fillRect(W/2-bw/2,69,bw*pct,4); } else if(!levelData.isBoss){ ctx.fillStyle='#f66'; ctx.font='bold 13px monospace'; ctx.textAlign='center'; ctx.fillText('¡LAS NAVES AVANZAN!',W/2,64); }
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
    if(levelData&&levelData.isBoss){ ctx.fillStyle=gal().accent; ctx.font='bold 32px monospace'; ctx.textAlign='center'; ctx.fillText(levelData.isJsBoss?'👑 JEFE JAVASCRIPT':(levelData.isCssBoss?'👑 JEFE CSS':'👑 JEFE FINAL'),W/2,H/2-50); ctx.fillStyle='#fff'; ctx.font='16px monospace'; if(levelData.isJsBoss){ ctx.fillText('¡Tres etapas y un portal! Cuidado, se vuelve furioso 😈',W/2,H/2-10); ctx.font='12px monospace'; ctx.fillStyle=gal().accent2; ctx.fillText('1 · 4 naves HTML   |   2 · 2 naves con 3 vidas (3 escrituras)',W/2,H/2+16); ctx.fillText('3 · FURIOSO: la galaxia tiembla, escribí = +1 bala 🔫 y dispará',W/2,H/2+36); ctx.fillText('⬅ ➡ Mover  |  Escribe y ENTER  |  SPACE o 💥 para disparar',W/2,H/2+60); } else if(levelData.isCssBoss){ ctx.fillText('¡Destruye las naves escribiendo la propiedad CSS correcta!',W/2,H/2-10); ctx.font='13px monospace'; ctx.fillStyle='#ce93d8'; ctx.fillText('⬅ ➡ Mover  |  Escribe la respuesta y ENTER',W/2,H/2+20); ctx.fillText('Cada respuesta correcta daña al jefe -2 HP',W/2,H/2+40); ctx.fillText(bossHP+' HP para vencerlo',W/2,H/2+60); } else { ctx.fillText('¡Esquiva las etiquetas y derrota al Prof. Froggio!',W/2,H/2-10); ctx.font='13px monospace'; ctx.fillStyle='#ce93d8'; ctx.fillText('⬅ ➡ Mover  |  SPACE Disparar (con balas)',W/2,H/2+20); ctx.fillText('Recoge 🔫 balas  |  ❓ preguntas  |  💀 trampas',W/2,H/2+40); ctx.fillText(bossHP+' golpes para vencerlo',W/2,H/2+60); } }
    else { ctx.fillStyle=speedrun?'#ffd600':gal().accent; ctx.font='bold 32px monospace'; ctx.textAlign='center'; ctx.fillText((speedrun?'NIVEL 1 ⚡ SPEEDRUN':'NIVEL '+levelData.id),W/2,H/2-30); ctx.fillStyle='#fff'; ctx.font='18px monospace'; ctx.fillText(levelData.title,W/2,H/2+10); ctx.font='13px monospace'; ctx.fillStyle=gal().accent2; ctx.fillText(gal().label,W/2,H/2+34); ctx.fillStyle='#aaa'; ctx.fillText(levelData.questions.length+' enemigos'+(speedrun?' • ¡MODO DIFÍCIL!':''),W/2,H/2+55); }
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
    if(eLevel) eLevel.textContent=levelData?(levelData.isJsBoss?'🤖 JEFE JS':(levelData.isBoss?(cssBoss?'👑 JEFE CSS':'👑 JEFE'):(speedrun?'1 ⚡':levelData.id))):'-';
    if(levelData&&levelData.isJsBoss){
      if(jsBossPortal){ if(eTarget) eTarget.textContent='🌀 Ponete abajo para entrar al portal'; }
      else if(enemies.length>0){ const qs=[...new Set(enemies.map(e=>e.question))]; if(eTarget) eTarget.textContent=qs.join(' | '); }
      else if(state==='playing'){ if(eTarget) eTarget.textContent='etapa '+jsBossPhase+'/3 · 🔫 '+jsBossBullets; }
    }
    else if(levelData&&levelData.isBoss){
      if(cssBoss && enemies.length>0){
        const qs=[...new Set(enemies.map(e=>e.question))];
        if(eTarget) eTarget.textContent=qs.join(' | ');
      } else {
        if(eTarget) eTarget.textContent=enemies[0]?enemies[0].question:'—';
      }
    }
    else if(currentEnemy){ if(eTarget) eTarget.textContent=currentEnemy.question; } else { if(eTarget) eTarget.textContent=state==='playing'?'clic en una nave':'—'; }
    if(qBannerEl&&qBannerTextEl){
      if(state==='portal'){ qBannerTextEl.textContent='🌀 Entrando a la GALAXIA 2...'; qBannerEl.classList.remove('hidden'); }
      else if(state==='intro'){ qBannerTextEl.textContent=(levelData&&levelData.isJsBoss?'🤖 Jefe JavaScript: ':(levelData&&levelData.isBoss?(cssBoss?'👑 Jefe CSS: ':'👑 Jefe Final: '):''))+'Preparando '+(levelData?levelData.title:'')+'...'; qBannerEl.classList.remove('hidden'); }
      else if(levelData&&levelData.isJsBoss){
        if(jsBossPortal) qBannerTextEl.textContent='🌀 ¡PORTAL ABIERTO! Metete debajo';
        else if(enemies.length>0){ const qs=[...new Set(enemies.map(e=>e.question))]; qBannerTextEl.textContent='Etapa '+jsBossPhase+'/3 · 🔫 '+jsBossBullets+'  →  '+qs.join('  |  '); }
        else qBannerTextEl.textContent='🤖 Jefe JavaScript';
        qBannerEl.classList.remove('hidden');
      }
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
  /* ================= SELECTOR DE NIVELES ================= */
  const LEVEL_ICONS={1:'📄',2:'🎨',3:'⚡',4:'👑',5:'👑',6:'🤖',7:'🌌'};
  function escLv(s){ return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function openLevels(){
    const ov=document.getElementById('levelsOverlay');
    const grid=document.getElementById('levelsGrid');
    if(!ov||!grid) return;
    const done=((window.Auth&&Auth.progress)||[]).filter(p=>p&&p.solved).map(p=>p.level);
    grid.innerHTML=LEVELS.map((lv,i)=>{
      const solved=done.indexOf(lv.id)>=0;
      const kind=lv.isJsBoss?'jefe-js':(lv.isCssBoss?'jefe-css':(lv.isBoss?'jefe':'normal'));
      return '<button class="lv-card lv-'+kind+(solved?' solved':'')+'" data-lv="'+i+'">'
        +'<span class="lv-icon">'+(LEVEL_ICONS[lv.id]||'🚀')+'</span>'
        +'<b class="lv-title">'+escLv(lv.title)+'</b>'
        +'<small class="lv-num">Nivel '+lv.id+(lv.galaxy===2?' · Galaxia 2':'')+'</small>'
        +(solved?'<span class="lv-done">✓ Completado</span>':(lv.isBoss?'<span class="lv-boss">JEFE</span>':''))
        +'</button>';
    }).join('');
    grid.querySelectorAll('[data-lv]').forEach(b=>b.addEventListener('click',()=>{
      const i=Number(b.dataset.lv);
      ov.classList.add('hidden');
      speedrun=false; speedrunFinished=false; speedrunTime=0;
      if(speedrunHudEl) speedrunHudEl.classList.add('hidden');
      hideBtns();
      startLevel(i);
      enterMobileFS();
    }));
    ov.classList.remove('hidden');
  }
  function bindLevelsUI(){
    const btn=document.getElementById('levelsBtn');
    const ov=document.getElementById('levelsOverlay');
    const close=document.getElementById('levelsClose');
    const back=document.getElementById('levelsBack');
    if(btn) btn.addEventListener('click',()=>openLevels());
    if(close) close.addEventListener('click',()=>ov&&ov.classList.add('hidden'));
    if(back) back.addEventListener('click',()=>ov&&ov.classList.add('hidden'));
    if(ov) ov.addEventListener('click',e=>{ if(e.target===ov) ov.classList.add('hidden'); });
  }

  function initShopUI(){
    const btn=document.getElementById('shopBtn'); const modal=document.getElementById('shopModal');
    // Los catálogos (nombres y precios) vienen del servidor, así que no hay dos
    // listas que puedan desincronizarse. Mientras no lleguen, se usan los que
    // traen los módulos del navegador.
    if(typeof API!=='undefined'&&API.getLasers){
      API.getLasers().then(d=>{
        if(d&&Array.isArray(d.lasers)&&d.lasers.length) window.LaserCatalog=d.lasers;
        if(d&&Array.isArray(d.owned)&&d.owned.length) ownedLasers=d.owned;
        if(d&&d.equipped) equippedLaser=d.equipped;
        const lg=document.getElementById('laserGrid');
        if(lg&&!lg.classList.contains('hidden')) renderLasers();
      }).catch(()=>{});
    }
    if(typeof API!=='undefined'&&API.getImpacts){
      API.getImpacts().then(d=>{
        if(d&&Array.isArray(d.impacts)&&d.impacts.length) window.ImpactCatalog=d.impacts;
        if(d&&Array.isArray(d.owned)&&d.owned.length) ownedImpacts=d.owned;
        if(d&&d.equipped) equippedImpact=d.equipped;
        const ig=document.getElementById('impactGrid');
        if(ig&&!ig.classList.contains('hidden')) renderImpacts();
      }).catch(()=>{});
    }
    if(typeof API!=='undefined'&&API.getLabelSkins){
      API.getLabelSkins().then(d=>{
        if(d&&Array.isArray(d.labelSkins)&&d.labelSkins.length) window.LabelSkinCatalog=d.labelSkins;
        if(d&&Array.isArray(d.owned)&&d.owned.length) ownedLabelSkins=d.owned;
        if(d&&d.equipped){ equippedLabelSkin=d.equipped; applyLabelSkin(); }
        const kg=document.getElementById('labelGrid');
        if(kg&&!kg.classList.contains('hidden')) renderLabelSkins();
      }).catch(()=>{});
    }
    if(typeof API!=='undefined'&&API.getTitles){ loadTitles(); }
    const close=document.getElementById('shopClose'); const grid=document.getElementById('shopGrid');
    if(!btn||!modal) return;
    btn.addEventListener('click', ()=>{ renderShop(); renderLasers(); renderImpacts(); renderLabelSkins(); renderTitles(); modal.classList.remove('hidden'); });
    if(close) close.addEventListener('click', ()=>{ modal.classList.add('hidden'); stopAllPreviews(); });
    modal.addEventListener('click', e=>{ if(e.target===modal){ modal.classList.add('hidden'); stopAllPreviews(); } });
    const tabs=document.getElementById('shopTabs');
    if(tabs) tabs.querySelectorAll('.shop-tab').forEach(tab=>tab.addEventListener('click',()=>{
      tabs.querySelectorAll('.shop-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      const t=tab.dataset.tab;
      const sg=document.getElementById('shopGrid');
      const lg=document.getElementById('luckyGrid');
      const lw=document.getElementById('luckyWheelWrap');
      const layout=document.getElementById('luckyLayout');
      const modal=document.getElementById('shopModal');
      const modalBox=modal?modal.querySelector('.modal-shop'):null;
      if(sg) sg.classList.toggle('hidden',t!=='skins');
      const lg2=document.getElementById('laserGrid');
      if(lg2){ lg2.classList.toggle('hidden',t!=='lasers'); if(t==='lasers') renderLasers(); }
      const ig=document.getElementById('impactGrid');
      if(ig){ ig.classList.toggle('hidden',t!=='impacts'); if(t==='impacts') renderImpacts(); }
      const kg=document.getElementById('labelGrid');
      if(kg){ kg.classList.toggle('hidden',t!=='labels'); if(t==='labels') renderLabelSkins(); }
      const tg=document.getElementById('titleGrid');
      if(tg){ tg.classList.toggle('hidden',t!=='titles'); if(t==='titles') renderTitles(); }
      if(layout) layout.classList.toggle('hidden',t!=='lucky');
      if(lg) lg.classList.remove('hidden');
      if(lw) lw.classList.remove('hidden');
      if(modalBox) modalBox.classList.toggle('lucky-wide',t==='lucky');
      if(t==='lucky'){
        if(window.LuckyRoyale&&LuckyRoyale.draw) requestAnimationFrame(()=>{ try{LuckyRoyale.draw();}catch(e){} });
        const m=document.querySelector('#shopModal .modal-shop'); if(m) m.scrollTop=0;
        if(typeof Profile!=='undefined' && Profile.renderLucky) Profile.renderLucky();
      }
    }));
    const achBtn=document.getElementById('menuAchievements');
    const achModal=document.getElementById('achievementsModal');
    const achClose=document.getElementById('achievementsClose');
    const achBack=document.getElementById('achievementsBack');
    if(achBtn&&achModal){
      achBtn.addEventListener('click',()=>{ if(typeof Profile!=='undefined'&&Profile.renderAchievements) Profile.renderAchievements(); achModal.classList.remove('hidden'); });
      if(achClose) achClose.addEventListener('click',()=>achModal.classList.add('hidden'));
      if(achBack) achBack.addEventListener('click',()=>achModal.classList.add('hidden'));
      achModal.addEventListener('click',e=>{ if(e.target===achModal) achModal.classList.add('hidden'); });
    }
  }
  // Vista previa animada del láser: un canvas chiquito con el mismo
  // LaserFx que usa el juego, así se ve exactamente igual que al disparar.
  function laserPreviewHtml(l){
    const info=LaserFx.info(l.id);
    const anim=info.animated?' laser-anim':'';
    return '<div class="laser-preview'+anim+'" style="--lc:'+l.color+';--lg:'+l.glow+'"><canvas class="laser-preview-cv" width="150" height="54" data-laser="'+l.id+'"></canvas></div>';
  }
// ── Vistas previas animadas de la tienda ────────────────────────────────
// Cada tarjeta tiene un canvas chiquito que se dibuja solo con el mismo
// módulo que usa el juego, así se ve exactamente igual que al disparar o al
// destruir una nave.
//
// Ojo con esto: la grilla se vuelve a armar con innerHTML cada vez que se abre
// la tienda, así que los canvas viejos quedan sueltos en la página. Si sus
// bucles de animación siguieran vivos se irían acumulando (abrir la tienda N
// veces = N bucles pintando sobre nada, quemando CPU en el celular). Por eso
// antes de arrancar se cancelan todos los bucles anteriores de esa vista y
// sólo se animan los canvas que siguen conectados a la página.
const previewBufs={};
function stopPreviews(kind){
  const viejos=previewBufs[kind]||[];
  for(const cv of viejos){ try{ if(cv._raf) cancelAnimationFrame(cv._raf); }catch(e){} cv._raf=0; }
  previewBufs[kind]=[];
}
function paintPreviews(kind,attr,paint){
  stopPreviews(kind);
  const lista=[];
  document.querySelectorAll('['+attr+']').forEach(cv=>{
    if(!cv.isConnected) return;
    const id=cv.getAttribute(attr); if(!id) return;
    const ctx=cv.getContext('2d'); if(!ctx) return;
    const t0=performance.now();
    const loop=now=>{
      const t=(now-t0)/1000;
      ctx.clearRect(0,0,cv.width,cv.height);
      paint(ctx,cv,id,t);
      cv._raf=requestAnimationFrame(loop);
    };
    cv._raf=requestAnimationFrame(loop);
    lista.push(cv);
  });
  previewBufs[kind]=lista;
}
// Vista previa del láser: el mismo LaserFx que el disparo del juego.
function paintLaserPreviews(){
  if(typeof LaserFx==='undefined') return;
  paintPreviews('laser','data-laser',(ctx,cv,id,t)=>LaserFx.draw(ctx,id,10,cv.height-9,cv.width-10,7,t,{w:3,blur:11}));
}
// Vista previa del impacto: recorre toda la explosión en bucle.
function paintImpactPreviews(){
  if(typeof ImpactFx==='undefined') return;
  paintPreviews('impact','data-impact',(ctx,cv,id,t)=>ImpactFx.draw(ctx,id,cv.width/2,cv.height/2,(t*0.9)%1,{t:t,r:cv.height*0.42}));
}
// Vista previa de la etiqueta: el mismo EnemyShips.drawLabel del juego.
function paintLabelPreviews(){
  if(typeof EnemyShips==='undefined') return;
  paintPreviews('label','data-labelskin',(ctx,cv,id,t)=>EnemyShips.drawLabel(ctx,'Párrafo',cv.width/2,cv.height/2,cv.width-6,{fontSize:12,t:t,skin:id}));
}
// Cuando la tienda se cierra no hace falta seguir animando nada.
function stopAllPreviews(){ for(const k in previewBufs) stopPreviews(k); }
  function renderLasers(){
    const grid=document.getElementById('laserGrid'); const bal=document.getElementById('shopBalance');
    if(!grid) return; if(bal) bal.textContent='🪙 '+coins+' puntos';
    const lista=(typeof LaserCatalog!=='undefined'&&LaserCatalog&&LaserCatalog.length)?LaserCatalog:LaserFx.TIPOS.map(x=>Object.assign({name:x.id,price:0},x));
    grid.innerHTML=lista.map(l=>{
      const owned=ownedLasers.includes(l.id); const eq=equippedLaser===l.id;
      const anim=LaserFx.info(l.id).animated;
      let action='';
      if(eq) action='<span class="shop-badge equipped">✓ Equipado</span>';
      else if(owned) action=`<button class="btn btn-ghost btn-sm" data-lequip="${l.id}">Equipar</button>`;
      else action=`<button class="btn btn-primary btn-sm" data-lbuy="${l.id}" ${coins < l.price ? 'disabled' : ''}>Comprar ${l.price} 🪙</button>`;
      return `<div class="shop-card laser-card${eq?' shop-equipped':''}" style="border-top-color:${l.color}">`
        + laserPreviewHtml(l)
        + `<h4>${l.name}${anim?' <span class="laser-tag-anim" title="Se mueve">✨</span>':''}</h4>`
        + `<p class="shop-price">${l.price===0?'Gratis':l.price+' 🪙'}</p>${action}</div>`;
    }).join('');
    grid.querySelectorAll('[data-lbuy]').forEach(b=>b.addEventListener('click', async()=>{
      const id=b.dataset.lbuy; b.disabled=true; b.textContent='...';
      try{ const r=await API.buyLaser(id); coins=r.coins; ownedLasers=r.lasers; saveShopLocal(); renderLasers(); updateHUD(); Toast.success('⚡ Láser comprado!'); }
      catch(e){ Toast.error(e.message); b.disabled=false; b.textContent='Comprar'; }
    }));
    grid.querySelectorAll('[data-lequip]').forEach(b=>b.addEventListener('click', async()=>{
      const id=b.dataset.lequip;
      try{ const r=await API.equipLaser(id); equippedLaser=r.equippedLaser; saveShopLocal(); renderLasers(); Toast.success('Láser equipado'); }
      catch(e){ Toast.error(e.message); }
    }));
    paintLaserPreviews();
  }
  // El HTML de la tarjeta de impacto: el canvas es el que se anima solo (ver
  // paintImpactPreviews) y el "--ic" le da el marco y el brillo de su color.
  function impactPreviewHtml(im){
    const anim=ImpactFx.info(im.id).animated;
    return '<div class="impact-preview'+(anim?' impact-anim':'')+'" style="--ic:'+im.color+';--ig:'+im.glow+'"><canvas class="impact-preview-cv" width="120" height="90" data-impact="'+im.id+'"></canvas></div>';
  }
  function renderImpacts(){
    const grid=document.getElementById('impactGrid'); const bal=document.getElementById('shopBalance');
    if(!grid) return; if(bal) bal.textContent='🪙 '+coins+' puntos';
    const lista=(typeof ImpactCatalog!=='undefined'&&ImpactCatalog&&ImpactCatalog.length)?ImpactCatalog:ImpactFx.TIPOS.map(x=>Object.assign({name:x.id,price:0},x));
    grid.innerHTML=lista.map(im=>{
      const owned=ownedImpacts.includes(im.id); const eq=equippedImpact===im.id;
      const anim=ImpactFx.info(im.id).animated;
      let action='';
      if(eq) action='<span class="shop-badge equipped">✓ Equipado</span>';
      else if(owned) action=`<button class="btn btn-ghost btn-sm" data-ibuy-eq="${im.id}">Equipar</button>`;
      else action=`<button class="btn btn-primary btn-sm" data-ibuy="${im.id}" ${coins < im.price ? 'disabled' : ''}>Comprar ${im.price} 🪙</button>`;
      return `<div class="shop-card impact-card${eq?' shop-equipped':''}" style="border-top-color:${im.color}">`
        + impactPreviewHtml(im)
        + `<h4>${im.name}${anim?' <span class="impact-tag-anim" title="Se mueve">✨</span>':''}</h4>`
        + `<p class="shop-price">${im.price===0?'Gratis':im.price+' 🪙'}</p>${action}</div>`;
    }).join('');
    grid.querySelectorAll('[data-ibuy]').forEach(b=>b.addEventListener('click', async()=>{
      const id=b.dataset.ibuy; b.disabled=true; b.textContent='...';
      try{ const r=await API.buyImpact(id); coins=r.coins; ownedImpacts=r.impacts; saveShopLocal(); renderImpacts(); updateHUD(); Toast.success('💥 Impacto comprado!'); }
      catch(e){ Toast.error(e.message); b.disabled=false; b.textContent='Comprar'; }
    }));
    grid.querySelectorAll('[data-ibuy-eq]').forEach(b=>b.addEventListener('click', async()=>{
      const id=b.dataset.ibuyEq;
      try{ const r=await API.equipImpact(id); equippedImpact=r.equippedImpact; saveShopLocal(); renderImpacts(); Toast.success('Impacto equipado'); }
      catch(e){ Toast.error(e.message); }
    }));
    paintImpactPreviews();
  }
  // El HTML de la tarjeta de etiqueta: el canvas es el que se anima solo (ver
  // paintLabelPreviews) y el "--lc" le da el marco del color de la skin.
  function labelPreviewHtml(sk){
    return '<div class="label-preview" style="--lc:'+sk.border+'"><canvas class="label-preview-cv" width="150" height="46" data-labelskin="'+sk.id+'"></canvas></div>';
  }
  function renderLabelSkins(){
    const grid=document.getElementById('labelGrid'); const bal=document.getElementById('shopBalance');
    if(!grid) return; if(bal) bal.textContent='🪙 '+coins+' puntos';
    const lista=(typeof LabelSkinCatalog!=='undefined'&&LabelSkinCatalog&&LabelSkinCatalog.length)?LabelSkinCatalog:EnemyShips.LABEL_SKINS;
    grid.innerHTML=lista.map(sk=>{
      const owned=ownedLabelSkins.includes(sk.id); const eq=equippedLabelSkin===sk.id;
      let action='';
      if(eq) action='<span class="shop-badge equipped">✓ Equipado</span>';
      else if(owned) action=`<button class="btn btn-ghost btn-sm" data-kbuy-eq="${sk.id}">Equipar</button>`;
      else action=`<button class="btn btn-primary btn-sm" data-kbuy="${sk.id}" ${coins < sk.price ? 'disabled' : ''}>Comprar ${sk.price} 🪙</button>`;
      const mov=!!(sk.anim||sk.hue);
      return `<div class="shop-card label-card${eq?' shop-equipped':''}" style="border-top-color:${sk.border}">`
        + labelPreviewHtml(sk)
        + `<h4>${sk.name}${mov?' <span class="label-tag-anim" title="Se mueve">✨</span>':''}</h4>`
        + `<p class="shop-price">${sk.price===0?'Gratis':sk.price+' 🪙'}</p>${action}</div>`;
    }).join('');
    grid.querySelectorAll('[data-kbuy]').forEach(b=>b.addEventListener('click', async()=>{
      const id=b.dataset.kbuy; b.disabled=true; b.textContent='...';
      try{ const r=await API.buyLabelSkin(id); coins=r.coins; ownedLabelSkins=r.labelSkins; saveShopLocal(); renderLabelSkins(); updateHUD(); Toast.success('🏷️ Etiqueta comprada!'); }
      catch(e){ Toast.error(e.message); b.disabled=false; b.textContent='Comprar'; }
    }));
    grid.querySelectorAll('[data-kbuy-eq]').forEach(b=>b.addEventListener('click', async()=>{
      const id=b.dataset.kbuyEq;
      try{ const r=await API.equipLabelSkin(id); equippedLabelSkin=r.equippedLabelSkin; applyLabelSkin(); saveShopLocal(); renderLabelSkins(); Toast.success('Etiqueta equipada'); }
      catch(e){ Toast.error(e.message); }
    }));
paintLabelPreviews();
   }
   // Carga el catálogo de títulos bajo demanda. Antes se pedía una sola vez al
  // iniciar la página: si el usuario todavía no estaba autenticado el endpoint
  // devolvía 401, el .catch lo silenciaba y la grilla quedaba en "Cargando…"
  // para siempre. Ahora se reintenta solo y avisa si realmente falla.
  function loadTitles(){
    if(typeof API==='undefined'||!API.getTitles) return;
    if(_titlesLoading) return;
    if(_titlesTries>3){
      const g=document.getElementById('titleGrid');
      if(g) g.innerHTML='<p class="lead muted" style="grid-column:1/-1;text-align:center">⚠️ No se pudieron cargar los títulos. Reintentá recargando la página.</p>';
      return;
    }
    _titlesLoading=true; _titlesTries++;
    API.getTitles().then(d=>{
      _titlesLoading=false; _titlesTries=0;
      if(d&&Array.isArray(d.owned)&&d.owned.length) ownedTitles=d.owned;
      if(d&&d.equipped) equippedTitle=d.equipped;
      if(d&&Array.isArray(d.titles)&&d.titles.length){
        window.TitleCatalog=d.titles;
      } else {
        // Respuesta válida pero sin catálogo: no reintentar en bucle.
        const g=document.getElementById('titleGrid');
        if(g) g.innerHTML='<p class="lead muted" style="grid-column:1/-1;text-align:center">No hay títulos disponibles.</p>';
        return;
      }
      renderTitles();
    }).catch(e=>{
      _titlesLoading=false;
      // Sin esto la grilla se quedaba en "Cargando…" si el click del usuario
      // ocurría mientras la petición inicial seguía en vuelo.
      const g=document.getElementById('titleGrid');
      if(g) renderTitles();
    });
  }
  function renderTitles(){
    const grid=document.getElementById('titleGrid'); const bal=document.getElementById('shopBalance');
    if(!grid) return; if(bal) bal.textContent='🪙 '+coins+' puntos';
    const lista=(window.TitleCatalog&&window.TitleCatalog.length)?window.TitleCatalog:[];
    if(!lista.length){
      if(_titlesLoading){ grid.innerHTML='<p class="lead muted" style="grid-column:1/-1;text-align:center">Cargando títulos…</p>'; return; }
      if(_titlesTries===0){ grid.innerHTML='<p class="lead muted" style="grid-column:1/-1;text-align:center">Cargando títulos…</p>'; loadTitles(); return; }
      grid.innerHTML='<p class="lead muted" style="grid-column:1/-1;text-align:center">⚠️ No se pudieron cargar los títulos. ¿Estás conectado?</p>';
      return;
    }
    const TIER={common:'#94a3b8',rare:'#40c4ff',epic:'#7c4dff',legendary:'#ffd600',tryhard:'#ff6d00',exclusive:'#ff1744',none:'#555'};
    grid.innerHTML=lista.map(t=>{
      const owned=ownedTitles.includes(t.id); const eq=equippedTitle===t.id;
      let action='';
      if(eq) action='<span class="shop-badge equipped">✓ Equipado</span>';
      else if(t.exclusive&&!owned) action='<button class="btn btn-ghost btn-sm" disabled>🔒 Exclusivo</button>';
      else if(owned) action=`<button class="btn btn-primary btn-sm" data-t-eq="${t.id}">Equipar</button>`;
      else if(coins>=t.price) action=`<button class="btn btn-primary btn-sm" data-t-buy="${t.id}">🪙 ${t.price}</button>`;
      else action=`<button class="btn btn-ghost btn-sm" disabled>🔒 ${t.price}</button>`;
      const col=TIER[t.tier]||'#888';
      return `<div class="shop-card title-card${eq?' shop-equipped':''}" style="border-top-color:${col}">`
        + `<div class="title-preview" style="border-color:${col}"><span style="${t.css||''}">${t.name}</span></div>`
        + `<h4 style="color:${col}">${t.name}</h4>`
        + `<p class="shop-price">${t.exclusive?'Exclusivo':(t.price===0?'Gratis':t.price+' 🪙')}</p>${action}</div>`;
    }).join('');
    grid.querySelectorAll('[data-t-buy]').forEach(b=>b.addEventListener('click',async()=>{
      const id=b.dataset.tBuy; b.disabled=true; b.textContent='...';
      try{ const r=await API.buyTitle(id); coins=r.coins; ownedTitles=r.titles; renderTitles(); updateHUD(); Toast.success('👑 Título comprado!'); }
      catch(e){ Toast.error(e.message); b.disabled=false; }
    }));
    grid.querySelectorAll('[data-t-eq]').forEach(b=>b.addEventListener('click',async()=>{
      const id=b.dataset.tEq;
      try{ const r=await API.equipTitle(id); equippedTitle=r.equippedTitle; renderTitles(); Toast.success('Título equipado'); }
      catch(e){ Toast.error(e.message); }
    }));
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
  function resetGame(){ score=0; level=0; enemies=[]; currentEnemy=null; particles=[]; lasers=[]; impacts=[]; startLevel(0); }
  function showToast(msg){ const t=document.createElement('div'); t.style.cssText='position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1b2838;color:#00e676;padding:12px 24px;border-radius:8px;font-family:monospace;font-size:14px;z-index:9999;border:1px solid #00e676;box-shadow:0 4px 16px rgba(0,0,0,0.5);'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2500); }
  function loadProgress(){ refreshSession(); syncShopFromServer(); }
  function loop(){ update(); render(); requestAnimationFrame(loop); }
  return {init,loadProgress,refreshSession,onLogoutCleanup,clearGuestSession,showBtns,showSingleModes,openMultiEntry, stopPreviews:stopAllPreviews, get SKINS(){return SKINS;}, get coins(){return coins;}, set coins(v){coins=v;}, get impact(){return equippedImpact;}, get laser(){return equippedLaser;}, get labelSkin(){return equippedLabelSkin;}, get ownedImpacts(){return ownedImpacts;}, get ownedLabelSkins(){return ownedLabelSkins;} };
})();
