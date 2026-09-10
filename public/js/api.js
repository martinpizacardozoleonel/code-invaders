const API = (() => {
  const LOCAL_KEY='codeinvaders_local_db'; const TOKEN_KEY='fx_token';
  const SKINS_CATALOG=[{id:'default',name:'DEV Cyan',price:0,body:'#00e5ff',glow:'#00e5ff'},{id:'crimson',name:'Crimson Fury',price:120,body:'#ff1744',glow:'#ff5252'},{id:'gold',name:'Golden Nova',price:200,body:'#ffd600',glow:'#ffea00'},{id:'neon',name:'Neon Viper',price:300,body:'#00e676',glow:'#69f0ae'},{id:'violet',name:'Violet Storm',price:350,body:'#7c4dff',glow:'#b388ff'},{id:'pixel',name:'Pixel Phantom',price:500,body:'#ff6d00',glow:'#ff9e00'}];
  function getLocalDb(){ try{ const r=localStorage.getItem(LOCAL_KEY); if(r) return JSON.parse(r); }catch(e){} return {users:[],sessions:[],notifications:[]}; }
  function saveLocalDb(db){ try{ localStorage.setItem(LOCAL_KEY, JSON.stringify(db)); }catch(e){} }
  function ensureUser(u){ if(u.coins===undefined) u.coins=0; if(!u.skins) u.skins=['default']; if(!u.equipped) u.equipped='default'; if(!u.skins.includes('default')) u.skins.unshift('default'); if(u.speedrunBest===undefined) u.speedrunBest=null; if(!u.speedrunHistory) u.speedrunHistory=[]; }
  function localHash(s){ let h=0; for(let i=0;i<s.length;i++) h=((h<<5)-h)+s.charCodeAt(0)+s.charCodeAt(i); return 'lh_'+h; }
  function localToken(){ return 'lt_'+Math.random().toString(36).slice(2)+Date.now().toString(36); }
  function pushLocalNotif(uid,title,body,type){ const db=getLocalDb(); db.notifications.push({id:'n_'+Date.now()+Math.random().toString(36).slice(2),userId:uid,title,body,type,read:false,createdAt:new Date().toISOString()}); saveLocalDb(db); }
  const Local={
    register(username,password){
      const db=getLocalDb();
      if(!username||!password) throw new Error('Usuario y contraseña son obligatorios');
      if(username.length<3) throw new Error('El usuario debe tener al menos 3 caracteres');
      if(password.length<4) throw new Error('La contraseña debe tener al menos 4 caracteres');
      if(db.users.some(u=>u.username===username)) throw new Error('Ese usuario ya existe');
      const user={id:'u_'+Date.now()+Math.random().toString(36).slice(2),username,passwordHash:localHash(password),progress:[],coins:0,skins:['default'],equipped:'default',createdAt:new Date().toISOString()};
      db.users.push(user); const token=localToken(); db.sessions.push({token,userId:user.id}); saveLocalDb(db);
      pushLocalNotif(user.id,'Bienvenido a Code Invaders 👾','¡Cuenta creada en modo offline!','success');
      return {token,user:{id:user.id,username:user.username,createdAt:user.createdAt,coins:0,skins:['default'],equipped:'default'}};
    },
    login(username,password){
      const db=getLocalDb(); const user=db.users.find(u=>u.username===username);
      if(!user||user.passwordHash!==localHash(password)) throw new Error('Usuario o contraseña incorrectos');
      ensureUser(user); const token=localToken(); db.sessions.push({token,userId:user.id}); saveLocalDb(db);
      pushLocalNotif(user.id,'Sesión iniciada ✅',`Hola ${user.username}, ¡modo offline!`,'info');
      return {token,user:{id:user.id,username:user.username,createdAt:user.createdAt,coins:user.coins,skins:user.skins,equipped:user.equipped}};
    },
    logout(token){ if(!token) return; const db=getLocalDb(); db.sessions=db.sessions.filter(s=>s.token!==token); saveLocalDb(db); },
    me(token){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); if(!u) throw new Error('No autenticado'); ensureUser(u); return {user:{id:u.id,username:u.username,createdAt:u.createdAt,coins:u.coins,skins:u.skins,equipped:u.equipped},progress:u.progress,coins:u.coins,skins:u.skins,equipped:u.equipped}; },
    saveProgress(token,level,attempts,solved,coinsEarned){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); ensureUser(u); let e=u.progress.find(p=>p.level===level); if(!e){ e={level,attempts:0,solved:false,solvedAt:null}; u.progress.push(e);} e.attempts+=(Number(attempts)||1); if(solved&&!e.solved){ e.solved=true; e.solvedAt=new Date().toISOString(); pushLocalNotif(u.id,'¡Nivel completado! 🎉',`Completaste el nivel ${level}. ¡Sigue así!`,'success'); } if(Number(coinsEarned)) u.coins+=Number(coinsEarned); saveLocalDb(db); return {progress:u.progress,coins:u.coins}; },
    leaderboard(){ const db=getLocalDb(); const board=db.users.map(u=>({id:u.id,username:u.username,solved:u.progress.filter(p=>p.solved).length,attempts:u.progress.reduce((a,p)=>a+p.attempts,0),exp:u.exp||0,hoursPlayed:u.hoursPlayed||0,profilePic:u.profilePic||'',equippedFrame:u.equippedFrame||'none',coins:u.coins||0,speedrunBest:u.speedrunBest||null})).sort((a,b)=>b.solved-a.solved||a.attempts-b.attempts).slice(0,10); return {board}; },
    leaderboardSpeedrun(){ const db=getLocalDb(); const board=db.users.filter(u=>u.speedrunBest!=null).map(u=>({id:u.id,username:u.username,speedrunBest:u.speedrunBest,solved:u.progress.filter(p=>p.solved).length,exp:u.exp||0,profilePic:u.profilePic||'',equippedFrame:u.equippedFrame||'none',coins:u.coins||0})).sort((a,b)=>a.speedrunBest-b.speedrunBest).slice(0,10); return {board}; },
    saveSpeedrun(token,time){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); ensureUser(u); const t=Number(time); if(!Number.isFinite(t)||t<3000||t>600000) throw new Error('Tiempo inválido'); const isNew=u.speedrunBest==null||t<u.speedrunBest; if(isNew){ u.speedrunBest=t; u.speedrunHistory.push({time:t,at:new Date().toISOString()}); if(u.speedrunHistory.length>20) u.speedrunHistory=u.speedrunHistory.slice(-20); saveLocalDb(db); } return {speedrunBest:u.speedrunBest,isNewBest:isNew}; },
    notifications(token){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); const list=db.notifications.filter(n=>n.userId===u.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); return {notifications:list,unread:list.filter(n=>!n.read).length}; },
    markRead(token,id){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); db.notifications.forEach(n=>{ if(n.userId===u.id&&(!id||n.id===id)) n.read=true; }); saveLocalDb(db); return {ok:true}; },
    levels(token){ let solved=[]; if(token){ try{ solved=Local.me(token).progress.filter(p=>p.solved).map(p=>p.level);}catch(e){} } return {total:11,solved,levels:[]}; },
    shop(){ return {skins:SKINS_CATALOG}; },
    buy(token,skinId){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); ensureUser(u); const sk=SKINS_CATALOG.find(s=>s.id===skinId); if(!sk) throw new Error('Skin no existe'); if(u.skins.includes(skinId)) throw new Error('Ya tienes esta skin'); if(u.coins<sk.price) throw new Error('Puntos insuficientes'); u.coins-=sk.price; u.skins.push(skinId); saveLocalDb(db); pushLocalNotif(u.id,'¡Skin comprada! 🛒',`Desbloqueaste ${sk.name}`,'success'); return {coins:u.coins,skins:u.skins}; },
    equip(token,skinId){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===token); if(!sess) throw new Error('No autenticado'); const u=db.users.find(x=>x.id===sess.userId); ensureUser(u); if(!u.skins.includes(skinId)) throw new Error('No tienes esta skin'); u.equipped=skinId; saveLocalDb(db); return {equipped:u.equipped}; }
  };
  const API_BASE = (location.hostname.includes('github.io') ? 'https://code-invaders-maj5.onrender.com' : '');
  async function request(path,options={}){
    const url = API_BASE + path;
    const headers=Object.assign({'Content-Type':'application/json'},options.headers||{});
    const token=localStorage.getItem(TOKEN_KEY); if(token) headers['Authorization']='Bearer '+token;
    const res=await fetch(url,Object.assign({},options,{headers}));
    let data={}; try{ data=await res.json(); }catch(e){}
    if(!res.ok) throw new Error(data.error||'Error en la petición');
    return data;
  }
  return {
    async request(p,o){ return request(p,o); },
    async register(u,p){ try{ return await request('/api/register',{method:'POST',body:JSON.stringify({username:u,password:p})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.register(u,p); throw e; } },
    async login(u,p){ try{ return await request('/api/login',{method:'POST',body:JSON.stringify({username:u,password:p})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.login(u,p); throw e; } },
    async logout(){ const t=localStorage.getItem(TOKEN_KEY); try{ await request('/api/logout',{method:'POST'});}catch(e){ Local.logout(t);} },
    async me(){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/me'); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.me(t); throw e; } },
    async heartbeat(){ try{ return await request('/api/heartbeat',{method:'POST'});}catch(e){} },
    async saveProgress(level,attempts,solved,coinsEarned){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/progress',{method:'PUT',body:JSON.stringify({level,attempts,solved,coinsEarned})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.saveProgress(t,level,attempts,solved,coinsEarned); throw e; } },
    async leaderboard(){ try{ return await request('/api/leaderboard'); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.leaderboard(); throw e; } },
    async leaderboardSpeedrun(){ try{ return await request('/api/leaderboard/speedrun'); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.leaderboardSpeedrun(); throw e; } },
    async saveSpeedrun(time){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/speedrun',{method:'POST',body:JSON.stringify({time})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.saveSpeedrun(t,time); throw e; } },
    async getUserProfile(id){ try{ return await request('/api/user/'+id); }catch(e){ throw e; } },
    async getNotifications(){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/notifications'); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.notifications(t); throw e; } },
    async markNotificationsRead(id){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/notifications/read',{method:'POST',body:JSON.stringify({id})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.markRead(t,id); throw e; } },
    async getLevels(){ try{ return await request('/api/levels'); }catch(e){ const t=localStorage.getItem(TOKEN_KEY); if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.levels(t); throw e; } },
    async getShop(){ try{ return await request('/api/shop'); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.shop(); throw e; } },
    async buySkin(id){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/shop/buy',{method:'POST',body:JSON.stringify({skinId:id})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.buy(t,id); throw e; } },
    async equipSkin(id){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/shop/equip',{method:'POST',body:JSON.stringify({skinId:id})}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')) return Local.equip(t,id); throw e; } },
    async deleteAccount(){ const t=localStorage.getItem(TOKEN_KEY); try{ return await request('/api/account',{method:'DELETE'}); }catch(e){ if(e.message.includes('Failed to fetch')||e.message.includes('fetch')){ const db=getLocalDb(); const sess=db.sessions.find(s=>s.token===t); if(sess){ const uid=sess.userId; db.users=db.users.filter(u=>u.id!==uid); db.sessions=db.sessions.filter(s=>s.userId!==uid); db.notifications=db.notifications.filter(n=>n.userId!==uid); saveLocalDb(db); localStorage.removeItem(TOKEN_KEY); } return {ok:true}; } throw e; } },
    async getTournament(){ try{ return await request('/api/tournament'); }catch(e){ throw e; } },
    async startTournament(){ try{ return await request('/api/tournament/start',{method:'POST'}); }catch(e){ throw e; } },
    async checkTournament(){ try{ return await request('/api/tournament/check',{method:'POST'}); }catch(e){ throw e; } },
    async getChat(){ try{ return await request('/api/chat'); }catch(e){ throw e; } },
    async sendChat(text){ try{ return await request('/api/chat',{method:'POST',body:JSON.stringify({text})}); }catch(e){ throw e; } },
    async deleteChat(id){ try{ return await request('/api/chat/'+id,{method:'DELETE'}); }catch(e){ throw e; } },
    async getFriends(){ return request('/api/friends'); },
    async sendFriendRequest(username){ return request('/api/friends/request',{method:'POST',body:JSON.stringify({username})}); },
    async sendFriendRequestById(userId){ return request('/api/friends/request',{method:'POST',body:JSON.stringify({userId})}); },
    async acceptFriend(requestId){ return request('/api/friends/accept',{method:'POST',body:JSON.stringify({requestId})}); },
    async rejectFriend(requestId){ return request('/api/friends/reject',{method:'POST',body:JSON.stringify({requestId})}); },
    async removeFriend(id){ return request('/api/friends/'+id,{method:'DELETE'}); },
    async getPrivate(friendId){ return request('/api/friends/private/'+friendId); },
    async sendPrivate(friendId,text){ return request('/api/friends/private/'+friendId,{method:'POST',body:JSON.stringify({text})}); },
    async getNameColors(){ return request('/api/name-colors'); },
    async buyNameColor(colorId){ return request('/api/name-colors/buy',{method:'POST',body:JSON.stringify({colorId})}); },
    async getBanners(){ return request('/api/banners'); },
    async buyBanner(bannerId){ return request('/api/banners/buy', {method:'POST',body:JSON.stringify({bannerId})}); },
    async equipBanner(bannerId){ return request('/api/banners/equip', {method:'POST',body:JSON.stringify({bannerId})}); },
    async getFonts(){ return request('/api/fonts'); },
    async buyFont(fontId){ return request('/api/fonts/buy',{method:'POST',body:JSON.stringify({fontId})}); },
    async equipFont(fontId){ return request('/api/fonts/equip',{method:'POST',body:JSON.stringify({fontId})}); },
    fontStyle(id){
      if(!id||id==='normal') return '';
      const M={titan:'font-weight:900;font-family:Impact,sans-serif;letter-spacing:1px;',mono:'font-family:monospace;font-weight:700;',cursiva:'font-style:italic;font-weight:700;font-family:cursive;letter-spacing:1px;',redonda:'font-family:Trebuchet MS,Verdana,sans-serif;font-weight:800;',elegante:'font-family:Georgia,serif;font-style:italic;letter-spacing:1px;',gotica:'font-family:Georgia,serif;font-weight:700;text-transform:uppercase;letter-spacing:3px;',minecraft:'font-family:monospace;font-weight:900;text-transform:uppercase;letter-spacing:2px;text-shadow:2px 2px 0 rgba(0,0,0,.65);',cuadrada:'font-family:Verdana,sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-shadow:1px 1px 0 rgba(0,0,0,.6);',pixel:'font-family:monospace;font-weight:900;text-transform:uppercase;letter-spacing:4px;text-shadow:0 0 8px currentColor;',sombra:'font-weight:900;letter-spacing:1px;text-shadow:0 0 10px currentColor,0 0 22px currentColor;',latido:'font-weight:900;display:inline-block;animation:fxBeat 1.2s ease-in-out infinite;',ola:'font-weight:800;display:inline-block;animation:fxWave 1.8s ease-in-out infinite;',neonvivo:'font-weight:900;animation:fxNeon 1.6s ease-in-out infinite;',fuego:'font-weight:900;text-transform:uppercase;background:linear-gradient(180deg,#ffe082,#ff8c00,#ff1744);-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxFire 1.1s ease-in-out infinite;',glitch:'font-family:monospace;font-weight:900;text-transform:uppercase;animation:fxGlitch 1.4s steps(2,end) infinite;',arcoiris:'font-weight:900;background:linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff,#ff1744);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxRainbow 3s linear infinite;'};
      return M[id]||'';
    },
    async getFxs(){ return request('/api/fxs'); },
    async buyFx(fxId){ return request('/api/fxs/buy',{method:'POST',body:JSON.stringify({fxId})}); },
    async equipFx(fxId){ return request('/api/fxs/equip',{method:'POST',body:JSON.stringify({fxId})}); },
    fxStyle(id){
      if(!id||id==='none') return '';
      const M={latido:'display:inline-block;animation:fxBeat 1.2s ease-in-out infinite;',ola:'display:inline-block;animation:fxWave 1.8s ease-in-out infinite;',neon:'animation:fxNeon 1.6s ease-in-out infinite;',brillo:'font-weight:900;background:linear-gradient(100deg,#8a93a6 30%,#ffffff 50%,#8a93a6 70%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxShine 2.4s linear infinite;',fuego:'font-weight:900;text-transform:uppercase;background:linear-gradient(180deg,#ffe082,#ff8c00,#ff1744);-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxFire 1.1s ease-in-out infinite;',glitch:'animation:fxGlitch 1.4s steps(2,end) infinite;',arcoiris:'font-weight:900;background:linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff,#ff1744);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxRainbow 3s linear infinite;'};
      return M[id]||'';
    },
    async equipNameColor(colorId){ return request('/api/name-colors/equip',{method:'POST',body:JSON.stringify({colorId})}); },
    qrUrl:(text,size,color)=>{ const hex=(color||'#43a047').replace('#',''); return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&color=${hex}&bgcolor=ffffff&data=${encodeURIComponent(text)}`; },
    async geocode(q){ const url=`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`; const res=await fetch(url,{headers:{'User-Agent':'CodeInvaders/1.0'}}); return res.json(); }
  };
})();
