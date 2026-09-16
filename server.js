const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const LEVELS = require('./levels.js');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
app.use((req,res,next)=>{ res.header('Access-Control-Allow-Origin','*'); res.header('Access-Control-Allow-Headers','Content-Type, Authorization'); res.header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS'); if(req.method==='OPTIONS') return res.sendStatus(204); next(); });
app.use(express.json({ limit: '6mb' }));
app.use((req,res,next)=>{ if(req.method==='GET') res.set('Cache-Control','no-store'); next(); });
app.use(express.static(path.join(__dirname, 'public'),{maxAge:0,etag:false}));
const DATABASE_URL = process.env.DATABASE_URL;
let USE_PG = !!DATABASE_URL;
let pool = null;
if (USE_PG) {
  try { const { Pool } = require('pg'); pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } }); console.log('📦 Usando PostgreSQL persistente'); } catch(e) { console.log('⚠️ pg no instalado, usando archivo JSON. Instala con npm i pg'); USE_PG = false; }
}
if (!USE_PG) console.log('📁 Usando archivo JSON local (efímero en Render free sin Postgres)');
function defaultDb(){ return { users: [], sessions: [], notifications: [], tournaments: [], chat: [], friendships: [], privateMessages: [], gifts: [] }; }
function loadDb(){ if(!fs.existsSync(DB_FILE)) return defaultDb(); try{ const d=JSON.parse(fs.readFileSync(DB_FILE,'utf8')); if(!d.friendships) d.friendships=[]; if(!d.privateMessages) d.privateMessages=[]; if(!d.chat) d.chat=[]; if(!d.gifts) d.gifts=[]; return d; }catch(e){ return defaultDb(); } }
function saveDb(db){ if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true}); fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }
let fileDb = loadDb();
if(!fileDb.tournaments) fileDb.tournaments=[];
if(!fileDb.chat) fileDb.chat=[];
if(!fileDb.notifications) fileDb.notifications=[];
if(!fileDb.sessions) fileDb.sessions=[];
if(!fileDb.users) fileDb.users=[];
if(!fileDb.friendships) fileDb.friendships=[];
if(!fileDb.privateMessages) fileDb.privateMessages=[];
if(!fileDb.gifts) fileDb.gifts=[];
async function initPg(){
  if(!USE_PG) return;
  try{
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL,
      progress TEXT NOT NULL DEFAULT '[]', coins INT NOT NULL DEFAULT 0, skins TEXT NOT NULL DEFAULT '["default"]',
      equipped TEXT NOT NULL DEFAULT 'default', profile_pic TEXT NOT NULL DEFAULT '', theme TEXT NOT NULL DEFAULT 'dark',
      hours_played INT NOT NULL DEFAULT 0, exp INT NOT NULL DEFAULT 0, frames TEXT NOT NULL DEFAULT '["none"]',
      equipped_frame TEXT NOT NULL DEFAULT 'none', speedrun_best INT, speedrun_history TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL, last_seen TEXT, name_color TEXT NOT NULL DEFAULT '#ffffff', owned_name_colors TEXT NOT NULL DEFAULT '[]', chat_bg TEXT NOT NULL DEFAULT '', banners TEXT NOT NULL DEFAULT '["none"]', equipped_banner TEXT NOT NULL DEFAULT 'none', banner_img TEXT NOT NULL DEFAULT '', fonts TEXT NOT NULL DEFAULT '["normal"]', equipped_font TEXT NOT NULL DEFAULT 'normal', fxs TEXT NOT NULL DEFAULT '["none"]', equipped_fx TEXT NOT NULL DEFAULT 'none', description TEXT NOT NULL DEFAULT ''
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT NOT NULL, type TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT false, created_at TEXT NOT NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tournaments (id TEXT PRIMARY KEY, status TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, results TEXT NOT NULL DEFAULT '{}')`);
    await pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, username TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS friendships (id TEXT PRIMARY KEY, requester_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, addressee_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, status TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(requester_id, addressee_id))`);
    await pool.query(`CREATE TABLE IF NOT EXISTS private_messages (id TEXT PRIMARY KEY, sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, text TEXT NOT NULL, created_at TEXT NOT NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS gifts (id TEXT PRIMARY KEY, sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, amount INT NOT NULL, message TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TEXT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS name_color TEXT NOT NULL DEFAULT '#ffffff'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS owned_name_colors TEXT NOT NULL DEFAULT '[]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_bg TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banners TEXT NOT NULL DEFAULT '["none"]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_banner TEXT NOT NULL DEFAULT 'none'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS banner_img TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS fonts TEXT NOT NULL DEFAULT '["normal"]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_font TEXT NOT NULL DEFAULT 'normal'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS fxs TEXT NOT NULL DEFAULT '["none"]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_fx TEXT NOT NULL DEFAULT 'none'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS speedrun_best INT`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS speedrun_history TEXT NOT NULL DEFAULT '[]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT ''`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS achievements TEXT NOT NULL DEFAULT '[]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tournament_streak INT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS tournament_wins INT NOT NULL DEFAULT 0`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_bubbles TEXT NOT NULL DEFAULT '["none"]'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_bubble TEXT NOT NULL DEFAULT 'none'`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS lucky_spins INT NOT NULL DEFAULT 0`);
    console.log('✅ Tablas PG listas');
    try{
      const all = await pool.query('SELECT * FROM users');
      for(const row of all.rows){
        let u = pgRowToUser(row);
        if(stripChampion(u)){
          await pgUpsertUser(u);
          console.log('🧹 Limpieza campeon para',u.username);
        }
      }
    }catch(e){ console.error('cleanup campeon',e.message); }
    const r = await pool.query('SELECT COUNT(*) FROM users');
    if(parseInt(r.rows[0].count)===0 && fileDb.users.length>0){
      for(const u of fileDb.users){ await pgUpsertUser(u); }
      for(const s of fileDb.sessions){ try{ await pool.query('INSERT INTO sessions(token,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[s.token,s.userId]); }catch(e){} }
      for(const n of fileDb.notifications){ try{ await pool.query('INSERT INTO notifications(id,user_id,title,body,type,read,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[n.id,n.userId,n.title,n.body,n.type,n.read,n.createdAt]); }catch(e){} }
      for(const t of fileDb.tournaments){ try{ await pool.query('INSERT INTO tournaments(id,status,start_date,end_date,results) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[t.id,t.status,t.startDate,t.endDate,JSON.stringify(t.results||{})]); }catch(e){} }
    }
  }catch(e){ console.error('PG init error',e.message); USE_PG=false; }
}
function stripChampion(u){
  let changed=false;
  if(u.frames && u.frames.includes('campeon')){ u.frames=u.frames.filter(f=>f!=='campeon'); changed=true; }
  if(u.equippedFrame==='campeon'){ u.equippedFrame='none'; changed=true; }
  if(u.skins && u.skins.includes('tournament_silver')){ u.skins=u.skins.filter(s=>s!=='tournament_silver'); changed=true; }
  if(u.equipped==='tournament_silver'){ u.equipped='default'; changed=true; }
  return changed;
}
function ensureShopFields(u){
  if(u.coins===undefined) u.coins=0;
  if(!u.skins) u.skins=['default'];
  if(!u.equipped) u.equipped='default';
  if(!u.skins.includes('default')) u.skins.unshift('default');
  if(u.profilePic===undefined) u.profilePic='';
  if(!u.theme) u.theme='dark';
  if(u.hoursPlayed===undefined) u.hoursPlayed=0;
  if(u.exp===undefined) u.exp=0;
  if(!u.frames) u.frames=[];
  if(!u.equippedFrame) u.equippedFrame='none';
  if(!u.frames.includes('none')) u.frames.unshift('none');
  if(u.speedrunBest===undefined) u.speedrunBest=null;
  if(!u.speedrunHistory) u.speedrunHistory=[];
  if(!u.lastSeen) u.lastSeen=null;
  if(!u.nameColor) u.nameColor='#ffffff';
  if(!u.ownedNameColors) u.ownedNameColors=[];
  if(u.chatBg===undefined) u.chatBg='';
  stripChampion(u);
  if(!u.banners) u.banners=['none'];
  if(!u.equippedBanner) u.equippedBanner='none';
  if(!u.banners.includes('none')) u.banners.unshift('none');
  if(u.bannerImg===undefined) u.bannerImg='';
  if(!u.fonts) u.fonts=['normal'];
  if(!u.equippedFont) u.equippedFont='normal';
  if(!u.fxs) u.fxs=['none'];
  if(!u.equippedFx) u.equippedFx='none';
  if(!u.fxs.includes('none')) u.fxs.unshift('none');
  if(!u.fonts.includes('normal')) u.fonts.unshift('normal');
  if(u.description===undefined) u.description='';
  if(!u.progress) u.progress=[];
  if(!u.achievements) u.achievements=[];
  if(u.tournamentStreak===undefined) u.tournamentStreak=0;
  if(u.tournamentWins===undefined) u.tournamentWins=0;
  if(!u.chatBubbles) u.chatBubbles=['none'];
  if(!u.equippedBubble) u.equippedBubble='none';
  if(!u.chatBubbles.includes('none')) u.chatBubbles.unshift('none');
  if(u.luckySpins===undefined) u.luckySpins=0;
}
fileDb.users.forEach(ensureShopFields);
if(!USE_PG) saveDb(fileDb);
function pgRowToUser(r){
  return { id:r.id, username:r.username, salt:r.salt, passwordHash:r.password_hash, progress: JSON.parse(r.progress||'[]'), coins:r.coins, skins: JSON.parse(r.skins||'["default"]'), equipped:r.equipped, profilePic:r.profile_pic||'', theme:r.theme||'dark', hoursPlayed:r.hours_played||0, exp:r.exp||0, frames: JSON.parse(r.frames||'["none"]'), equippedFrame:r.equipped_frame||'none', speedrunBest:r.speedrun_best, speedrunHistory: JSON.parse(r.speedrun_history||'[]'), createdAt:r.created_at, lastSeen:r.last_seen||null, nameColor:r.name_color||'#ffffff', ownedNameColors: JSON.parse(r.owned_name_colors||'[]'), chatBg:r.chat_bg||'', banners: JSON.parse(r.banners||'["none"]'), equippedBanner:r.equipped_banner||'none', bannerImg:r.banner_img||'', fonts: JSON.parse(r.fonts||'["normal"]'), equippedFont:r.equipped_font||'normal', fxs: JSON.parse(r.fxs||'["none"]'), equippedFx:r.equipped_fx||'none', description:r.description||'', achievements: JSON.parse(r.achievements||'[]'), tournamentStreak: r.tournament_streak||0, tournamentWins: r.tournament_wins||0, chatBubbles: JSON.parse(r.chat_bubbles||'["none"]'), equippedBubble: r.equipped_bubble||'none', luckySpins: r.lucky_spins||0 };
}
async function pgUpsertUser(u){
  ensureShopFields(u);
  await pool.query(`INSERT INTO users(id,username,salt,password_hash,progress,coins,skins,equipped,profile_pic,theme,hours_played,exp,frames,equipped_frame,speedrun_best,speedrun_history,created_at,last_seen,name_color,owned_name_colors,chat_bg,banners,equipped_banner,banner_img,fonts,equipped_font,fxs,equipped_fx,description,achievements,tournament_streak,tournament_wins,chat_bubbles,equipped_bubble,lucky_spins)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35)
  ON CONFLICT(id) DO UPDATE SET username=EXCLUDED.username, salt=EXCLUDED.salt, password_hash=EXCLUDED.password_hash, progress=EXCLUDED.progress, coins=EXCLUDED.coins, skins=EXCLUDED.skins, equipped=EXCLUDED.equipped, profile_pic=EXCLUDED.profile_pic, theme=EXCLUDED.theme, hours_played=EXCLUDED.hours_played, exp=EXCLUDED.exp, frames=EXCLUDED.frames, equipped_frame=EXCLUDED.equipped_frame, speedrun_best=EXCLUDED.speedrun_best, speedrun_history=EXCLUDED.speedrun_history, last_seen=EXCLUDED.last_seen, name_color=EXCLUDED.name_color, owned_name_colors=EXCLUDED.owned_name_colors, chat_bg=EXCLUDED.chat_bg, banners=EXCLUDED.banners, equipped_banner=EXCLUDED.equipped_banner, banner_img=EXCLUDED.banner_img, fonts=EXCLUDED.fonts, equipped_font=EXCLUDED.equipped_font, fxs=EXCLUDED.fxs, equipped_fx=EXCLUDED.equipped_fx, description=EXCLUDED.description, achievements=EXCLUDED.achievements, tournament_streak=EXCLUDED.tournament_streak, tournament_wins=EXCLUDED.tournament_wins, chat_bubbles=EXCLUDED.chat_bubbles, equipped_bubble=EXCLUDED.equipped_bubble, lucky_spins=EXCLUDED.lucky_spins`,
  [u.id,u.username,u.salt,u.passwordHash,JSON.stringify(u.progress||[]),u.coins||0,JSON.stringify(u.skins||['default']),u.equipped||'default',u.profilePic||'',u.theme||'dark',u.hoursPlayed||0,u.exp||0,JSON.stringify(u.frames||['none']),u.equippedFrame||'none',u.speedrunBest,JSON.stringify(u.speedrunHistory||[]),u.createdAt,u.lastSeen||null,u.nameColor||'#ffffff',JSON.stringify(u.ownedNameColors||[]),u.chatBg||'',JSON.stringify(u.banners||['none']),u.equippedBanner||'none',u.bannerImg||'',JSON.stringify(u.fonts||['normal']),u.equippedFont||'normal',JSON.stringify(u.fxs||['none']),u.equippedFx||'none',u.description||'',JSON.stringify(u.achievements||[]),u.tournamentStreak||0,u.tournamentWins||0,JSON.stringify(u.chatBubbles||['none']),u.equippedBubble||'none',u.luckySpins||0]);
}
async function getAllUsers(){ if(USE_PG){ const r=await pool.query('SELECT * FROM users'); return r.rows.map(pgRowToUser); } return fileDb.users; }
async function getUserById(id){ if(USE_PG){ const r=await pool.query('SELECT * FROM users WHERE id=$1',[id]); return r.rows[0]?pgRowToUser(r.rows[0]):null; } return fileDb.users.find(u=>u.id===id)||null; }
async function getUserByUsername(username){ if(USE_PG){ const r=await pool.query('SELECT * FROM users WHERE username=$1',[username]); return r.rows[0]?pgRowToUser(r.rows[0]):null; } return fileDb.users.find(u=>u.username===username)||null; }
async function createUser(u){ if(USE_PG) await pgUpsertUser(u); else { fileDb.users.push(u); saveDb(fileDb); } }
async function updateUser(u){ if(USE_PG) await pgUpsertUser(u); else saveDb(fileDb); }
async function deleteUser(id){
  if(USE_PG){ await pool.query('DELETE FROM friendships WHERE requester_id=$1 OR addressee_id=$1',[id]); await pool.query('DELETE FROM private_messages WHERE sender_id=$1 OR receiver_id=$1',[id]); await pool.query('DELETE FROM gifts WHERE sender_id=$1 OR receiver_id=$1',[id]); await pool.query('DELETE FROM users WHERE id=$1',[id]); }
  else { fileDb.users=fileDb.users.filter(u=>u.id!==id); fileDb.sessions=fileDb.sessions.filter(s=>s.userId!==id); fileDb.notifications=fileDb.notifications.filter(n=>n.userId!==id); fileDb.friendships=fileDb.friendships.filter(f=>f.requesterId!==id&&f.addresseeId!==id); fileDb.privateMessages=fileDb.privateMessages.filter(m=>m.senderId!==id&&m.receiverId!==id); fileDb.gifts=fileDb.gifts.filter(g=>g.senderId!==id&&g.receiverId!==id); saveDb(fileDb); }
}
async function findSession(token){ if(USE_PG){ const r=await pool.query('SELECT * FROM sessions WHERE token=$1',[token]); return r.rows[0]?{token:r.rows[0].token,userId:r.rows[0].user_id}:null; } return fileDb.sessions.find(s=>s.token===token)||null; }
async function createSession(token,userId){ if(USE_PG) await pool.query('INSERT INTO sessions(token,user_id) VALUES($1,$2)',[token,userId]); else { fileDb.sessions.push({token,userId}); saveDb(fileDb); } }
async function deleteSession(token){ if(USE_PG) await pool.query('DELETE FROM sessions WHERE token=$1',[token]); else { fileDb.sessions=fileDb.sessions.filter(s=>s.token!==token); saveDb(fileDb); } }
async function deleteSessionsByUser(userId){ if(USE_PG) await pool.query('DELETE FROM sessions WHERE user_id=$1',[userId]); else { fileDb.sessions=fileDb.sessions.filter(s=>s.userId!==userId); saveDb(fileDb); } }
async function getNotifications(userId){ if(USE_PG){ const r=await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC',[userId]); return r.rows.map(x=>({id:x.id,userId:x.user_id,title:x.title,body:x.body,type:x.type,read:x.read,createdAt:x.created_at})); } return fileDb.notifications.filter(n=>n.userId===userId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
async function pushNotification(userId,title,body,type){ const n={id:crypto.randomUUID(),userId,title,body,type,read:false,createdAt:new Date().toISOString()}; if(USE_PG) await pool.query('INSERT INTO notifications(id,user_id,title,body,type,read,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[n.id,n.userId,n.title,n.body,n.type,n.read,n.createdAt]); else { fileDb.notifications.push(n); saveDb(fileDb); } }
async function markNotifications(userId,id){ if(USE_PG){ if(id) await pool.query('UPDATE notifications SET read=true WHERE user_id=$1 AND id=$2',[userId,id]); else await pool.query('UPDATE notifications SET read=true WHERE user_id=$1',[userId]); } else { fileDb.notifications.forEach(n=>{ if(n.userId===userId && (!id||n.id===id)) n.read=true; }); saveDb(fileDb); } }
async function getTournaments(){ if(USE_PG){ const r=await pool.query('SELECT * FROM tournaments'); return r.rows.map(x=>({id:x.id,status:x.status,startDate:x.start_date,endDate:x.end_date,results:JSON.parse(x.results||'{}')})); } return fileDb.tournaments; }
async function createTournament(t){ if(USE_PG) await pool.query('INSERT INTO tournaments(id,status,start_date,end_date,results) VALUES($1,$2,$3,$4,$5)',[t.id,t.status,t.startDate,t.endDate,JSON.stringify(t.results||{})]); else { fileDb.tournaments.push(t); saveDb(fileDb); } }
async function updateTournament(t){ if(USE_PG) await pool.query('UPDATE tournaments SET status=$1, results=$2 WHERE id=$3',[t.status,JSON.stringify(t.results||{}),t.id]); else saveDb(fileDb); }
async function getChat(limit=100){ let msgs; if(USE_PG){ const r=await pool.query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT $1',[limit]); msgs=r.rows.map(x=>({id:x.id,userId:x.user_id,username:x.username,text:x.text,createdAt:x.created_at})).reverse(); } else msgs=(fileDb.chat||[]).slice(-limit); try{ const users=await getAllUsers(); const map=new Map(users.map(u=>[u.id,u])); msgs=msgs.map(m=>{ const u=map.get(m.userId); return Object.assign({},m,{nameColor:u?(u.nameColor||'#ffffff'):'#ffffff',equippedFont:u?(u.equippedFont||'normal'):'normal',equippedFx:u?(u.equippedFx||'none'):'none',profilePic:u?(u.profilePic||''):'',equippedFrame:u?(u.equippedFrame||'none'):'none',equippedBubble:u?(u.equippedBubble||'none'):'none',frames:u?(u.frames||[]):[]}); }); }catch(e){} return msgs; }
async function addChat(msg){ if(USE_PG) await pool.query('INSERT INTO chat_messages(id,user_id,username,text,created_at) VALUES($1,$2,$3,$4,$5)',[msg.id,msg.userId,msg.username,msg.text,msg.createdAt]); else { fileDb.chat.push(msg); if(fileDb.chat.length>500) fileDb.chat=fileDb.chat.slice(-500); saveDb(fileDb); } }
async function deleteChatByUser(userId){ if(USE_PG) await pool.query('DELETE FROM chat_messages WHERE user_id=$1',[userId]); else { fileDb.chat=(fileDb.chat||[]).filter(c=>c.userId!==userId); saveDb(fileDb); } }
function hashPassword(password,salt){ return crypto.scryptSync(password,salt,64).toString('hex'); }
function createToken(){ return crypto.randomBytes(32).toString('hex'); }
async function findUserByToken(req){ const token=(req.headers.authorization||'').replace('Bearer ',''); if(!token) return null; const session=await findSession(token); if(!session) return null; return await getUserById(session.userId); }
const SKINS=[ { id:'default', name:'DEV Cyan', price:0, body:'#00e5ff', glow:'#00e5ff' }, { id:'crimson', name:'Crimson Fury', price:120, body:'#ff1744', glow:'#ff5252' }, { id:'gold', name:'Golden Nova', price:200, body:'#ffd600', glow:'#ffea00' }, { id:'neon', name:'Neon Viper', price:300, body:'#00e676', glow:'#69f0ae' }, { id:'violet', name:'Violet Storm', price:350, body:'#7c4dff', glow:'#b388ff' }, { id:'pixel', name:'Pixel Phantom', price:500, body:'#ff6d00', glow:'#ff9e00' },{ id:'ocean', name:'Oceano', price:600, body:'#2196f3', glow:'#82b4ff' },{ id:'rosa', name:'Rosa Neon', price:750, body:'#ff4081', glow:'#ff8a80' },{ id:'lima', name:'Lima Acida', price:850, body:'#c6ff00', glow:'#eaff8a' },{ id:'ghost', name:'Fantasma', price:950, body:'#eceff1', glow:'#ffffff' },{ id:'camo', name:'Camuflaje', price:1000, body:'#7c9a3f', glow:'#b2d67c' },{ id:'magma', name:'Magma', price:1200, body:'#ff3d00', glow:'#ff8a65' },{ id:'ice', name:'Hielo', price:1350, body:'#80d8ff', glow:'#e1f5fe' },{ id:'nebula', name:'Nebulosa', price:1500, body:'#e040fb', glow:'#ea80fc' },{ id:'solar', name:'Solar', price:1650, body:'#fff176', glow:'#ffd600' },{ id:'platinum', name:'Platino', price:1800, body:'#cfd8dc', glow:'#ffffff' },{ id:'obsidian', name:'Obsidiana', price:2100, body:'#1a1a2e', glow:'#ff1744' },{ id:'diamond', name:'Diamante', price:2500, body:'#b3ffff', glow:'#ffffff' }, { id:'tournament_silver', name:'🥈 Silver Ranked', price:0, body:'#c0c0c0', glow:'#e0e0e0', exclusive:true } ];
const FRAMES=[ { id:'none',    name:'Sin marco',       price:0 }, { id:'bronce',  name:'Marco Bronce',    price:200 }, { id:'plata',   name:'Marco Plata',     price:400 }, { id:'oro',     name:'Marco Oro',       price:700 }, { id:'neon',    name:'Marco Neón',      price:1000 }, { id:'diamante',name:'Marco Diamante',  price:1500 }, { id:'campeon', name:'🏆 Marco Campeón (Animado)', price:0, animated:true, exclusive:true }, { id:'inferno', name:'🔥 Marco Inferno (GIF)', price:20000, animated:true }, { id:'galaxy', name:'🌌 Marco Galaxia (GIF)', price:25000, animated:true }, { id:'glitch', name:'👾 Marco Glitch (GIF)', price:30000, animated:true }, { id:'void', name:'🕳️ Marco Vacío (GIF)', price:35000, animated:true }, { id:'dragon', name:'🐉 Marco Dragón (Épico)', price:50000, animated:true }, { id:'leyenda', name:'💎 Marco Leyenda (TRYHARD)', price:75000, animated:true }, { id:'universo', name:'🌌 Marco Universo (LOGRO)', price:0, animated:true, exclusive:true } ];
const NAME_COLORS=[ {id:'white',name:'Blanco',color:'#ffffff',price:3000},{id:'cyan',name:'Cyan',color:'#00e5ff',price:3000},{id:'gold',name:'Dorado',color:'#ffd600',price:3500},{id:'pink',name:'Rosa',color:'#ff4081',price:3000},{id:'green',name:'Verde',color:'#00e676',price:3000},{id:'violet',name:'Violeta',color:'#7c4dff',price:3500},{id:'red',name:'Rojo',color:'#ff1744',price:4000},{id:'rainbow',name:'🌈 Arcoíris',color:'rainbow',price:5000} ];
const BANNERS=[ {id:'none',name:'Sin banner',price:0,grad:'transparent',border:'#333'},{id:'bronce',name:'Bronce',price:300,grad:'linear-gradient(135deg,#6b3a1f,#cd7f32)',border:'#cd7f32'},{id:'plata',name:'Plata',price:600,grad:'linear-gradient(135deg,#6e7a80,#c0c0c0)',border:'#c0c0c0'},{id:'negro',name:'Negro',price:400,grad:'linear-gradient(135deg,#000000,#2a2a2e)',border:'#666'},{id:'blanco',name:'Blanco',price:400,grad:'linear-gradient(135deg,#cfd4da,#ffffff)',border:'#ffffff'},{id:'rojo',name:'Rojo',price:800,grad:'linear-gradient(135deg,#7a0e1e,#ff1744)',border:'#ff5252'},{id:'azul',name:'Azul',price:800,grad:'linear-gradient(135deg,#0d2a6b,#2979ff)',border:'#448aff'},{id:'verde',name:'Verde',price:800,grad:'linear-gradient(135deg,#0d4d1f,#00e676)',border:'#00e676'},{id:'rosa',name:'Rosa',price:1000,grad:'linear-gradient(135deg,#8a1c5c,#ff4081)',border:'#ff80ab'},{id:'celeste',name:'Celeste',price:1000,grad:'linear-gradient(135deg,#0d4d6b,#00e5ff)',border:'#00e5ff'},{id:'platino',name:'Platino',price:1200,grad:'linear-gradient(135deg,#3a4a5a,#40c4ff)',border:'#40c4ff'},{id:'dorado',name:'Dorado',price:2000,grad:'linear-gradient(135deg,#7a5a00,#ffd600)',border:'#ffd600'},{id:'oro_puro',name:'Oro Puro',price:3500,grad:'linear-gradient(135deg,#ff8c00,#ffe082,#ff8c00)',border:'#ffe082'},{id:'leyenda',name:'Leyenda Animado',price:5000,grad:'linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff)',border:'#fff',animated:true},{id:'aurora',name:'🌠 Aurora Veloz (LOGRO)',price:0,grad:'linear-gradient(90deg,#00e5ff,#7c4dff,#ff4081,#ffd600,#00e676)',border:'#00e5ff',animated:true,exclusive:true} ];
const FONTS=[ {id:'normal',name:'Normal',price:0,css:''}, {id:'titan',name:'Titan',price:3000,css:'font-weight:900;font-family:Impact,sans-serif;letter-spacing:1px;'}, {id:'mono',name:'Hacker Mono',price:3000,css:'font-family:monospace;font-weight:700;'}, {id:'cursiva',name:'Cursiva',price:3500,css:'font-style:italic;font-weight:700;font-family:cursive;letter-spacing:1px;'}, {id:'redonda',name:'Redondeada',price:4000,css:'font-family:Trebuchet MS,Verdana,sans-serif;font-weight:800;'}, {id:'elegante',name:'Elegante',price:4500,css:'font-family:Georgia,serif;font-style:italic;letter-spacing:1px;'}, {id:'gotica',name:'Gotica',price:5000,css:'font-family:Georgia,serif;font-weight:700;text-transform:uppercase;letter-spacing:3px;'}, {id:'minecraft',name:'Minecraft',price:6000,css:'font-family:monospace;font-weight:900;text-transform:uppercase;letter-spacing:2px;text-shadow:2px 2px 0 rgba(0,0,0,.65);'}, {id:'cuadrada',name:'Cuadrada',price:7000,css:'font-family:Verdana,sans-serif;font-weight:900;text-transform:uppercase;letter-spacing:1px;text-shadow:1px 1px 0 rgba(0,0,0,.6);'}, {id:'pixel',name:'Pixel',price:8000,css:'font-family:monospace;font-weight:900;text-transform:uppercase;letter-spacing:4px;text-shadow:0 0 8px currentColor;'}, {id:'sombra',name:'Sombra Neon',price:10000,css:'font-weight:900;letter-spacing:1px;text-shadow:0 0 10px currentColor,0 0 22px currentColor;'}, {id:'latido',name:'Latido',price:12000,css:'font-weight:900;display:inline-block;animation:fxBeat 1.2s ease-in-out infinite;'}, {id:'ola',name:'Ola',price:14000,css:'font-weight:800;display:inline-block;animation:fxWave 1.8s ease-in-out infinite;'}, {id:'neonvivo',name:'Neon Vivo',price:15000,css:'font-weight:900;animation:fxNeon 1.6s ease-in-out infinite;'}, {id:'fuego',name:'Fuego',price:18000,css:'font-weight:900;text-transform:uppercase;background:linear-gradient(180deg,#ffe082,#ff8c00,#ff1744);-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxFire 1.1s ease-in-out infinite;'}, {id:'glitch',name:'Glitch',price:20000,css:'font-family:monospace;font-weight:900;text-transform:uppercase;animation:fxGlitch 1.4s steps(2,end) infinite;'}, {id:'arcoiris',name:'Arcoiris Vivo',price:25000,css:'font-weight:900;background:linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff,#ff1744);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxRainbow 3s linear infinite;'} ];
const FXS=[ {id:'none',name:'Sin efecto',price:0,css:''}, {id:'latido',name:'Latido',price:12000,css:'display:inline-block;animation:fxBeat 1.2s ease-in-out infinite;'}, {id:'ola',name:'Ola',price:14000,css:'display:inline-block;animation:fxWave 1.8s ease-in-out infinite;'}, {id:'neon',name:'Neon',price:15000,css:'animation:fxNeon 1.6s ease-in-out infinite;'}, {id:'brillo',name:'Brillo',price:16000,css:'font-weight:900;background:linear-gradient(100deg,#8a93a6 30%,#ffffff 50%,#8a93a6 70%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxShine 2.4s linear infinite;'}, {id:'fuego',name:'Fuego',price:18000,css:'font-weight:900;text-transform:uppercase;background:linear-gradient(180deg,#ffe082,#ff8c00,#ff1744);-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxFire 1.1s ease-in-out infinite;'}, {id:'glitch',name:'Glitch',price:20000,css:'animation:fxGlitch 1.4s steps(2,end) infinite;'}, {id:'arcoiris',name:'Arcoiris',price:25000,css:'font-weight:900;background:linear-gradient(90deg,#ff1744,#ffd600,#00e676,#00e5ff,#7c4dff,#ff1744);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fxRainbow 3s linear infinite;'} ];
FONTS.push({id:'phantom',name:'👻 Fantasma Negro',price:0,css:'color:#000!important;text-shadow:0 0 8px rgba(255,255,255,.6);animation:phantomFade 3s ease-in-out infinite;',exclusive:true});
const CHAT_BUBBLES=[
 {id:'none',name:'Sin burbuja',price:0,css:'',preview:'#1a2332',rarity:'common',exclusive:false,gif:false},
 {id:'neon_blue',name:'💙 Burbuja Neon Azul',price:0,css:'',rarity:'rare',exclusive:true,gif:false},
 {id:'emerald',name:'💚 Burbuja Esmeralda',price:0,css:'',rarity:'rare',exclusive:true,gif:false},
 {id:'gold',name:'💛 Burbuja Dorada',price:0,css:'',rarity:'rare',exclusive:true,gif:false},
 {id:'fire',name:'🔥 Burbuja Fuego',price:0,css:'',rarity:'epic',exclusive:true,gif:true},
 {id:'galaxy',name:'🌌 Burbuja Galaxia',price:0,css:'',rarity:'epic',exclusive:true,gif:true},
 {id:'void',name:'🕳️ Burbuja Vacío',price:0,css:'',rarity:'epic',exclusive:true,gif:true},
 {id:'rainbow',name:'🌈 Burbuja Arcoíris',price:0,css:'',rarity:'legendary',exclusive:true,gif:true},
 {id:'diamond',name:'💎 Burbuja Diamante',price:0,css:'',rarity:'legendary',exclusive:true,gif:true},
 {id:'glitch',name:'👾 Burbuja Glitch',price:0,css:'',rarity:'legendary',exclusive:true,gif:true},
 {id:'exclusive_00',name:'👑 Burbuja Maestra 00',price:0,css:'',rarity:'mythic',exclusive:true,gif:true}
];
const LUCKY_ITEMS=[
 {id:'coins_500',type:'coins',amount:500,weight:30,name:'500 pts',rarity:'common'},
 {id:'coins_1000',type:'coins',amount:1000,weight:20,name:'1000 pts',rarity:'common'},
 {id:'exp_1000',type:'exp',amount:1000,weight:15,name:'1000 EXP',rarity:'common'},
 {id:'bubble_neon_blue',type:'bubble',bubbleId:'neon_blue',weight:12,rarity:'rare'},
 {id:'bubble_emerald',type:'bubble',bubbleId:'emerald',weight:8,rarity:'rare'},
 {id:'bubble_gold',type:'bubble',bubbleId:'gold',weight:6,rarity:'rare'},
 {id:'bubble_fire',type:'bubble',bubbleId:'fire',weight:4,rarity:'epic'},
 {id:'bubble_galaxy',type:'bubble',bubbleId:'galaxy',weight:3,rarity:'epic'},
 {id:'bubble_void',type:'bubble',bubbleId:'void',weight:2,rarity:'epic'},
 {id:'bubble_rainbow',type:'bubble',bubbleId:'rainbow',weight:1.5,rarity:'legendary'},
 {id:'bubble_diamond',type:'bubble',bubbleId:'diamond',weight:1,rarity:'legendary'},
 {id:'bubble_glitch',type:'bubble',bubbleId:'glitch',weight:0.8,rarity:'legendary'},
 {id:'bubble_exclusive_00',type:'bubble',bubbleId:'exclusive_00',weight:0.1,rarity:'mythic'}
];

const ACHIEVEMENTS=[
 {id:'triple_champion',name:'👑 Tricampeón',desc:'Gana 3 torneos seguidos',reward:'🌌 Marco Universo'},
 {id:'speed_demon',name:'⚡ Demonio Veloz',desc:'Haz speedrun en 11s o menos',reward:'🌠 Banner Aurora'},
 {id:'centurion',name:'💯 Centurión',desc:'Llega a 100.000 EXP',reward:'👻 Letra Fantasma + 100.000 pts'}
];
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
process.on('unhandledRejection',(e)=>{ console.error('[unhandled]',e&&e.message||e); });
async function checkAchievements(user){
 ensureShopFields(user);
 let newly=[];
 if(!user.achievements.includes('triple_champion') && (user.tournamentStreak||0)>=3){
   user.achievements.push('triple_champion');
   if(!user.frames.includes('universo')) user.frames.push('universo');
   newly.push('triple_champion');
   await pushNotification(user.id,'🏆 ¡LOGRO DESBLOQUEADO!','Tricampeón: 3 torneos seguidos → 🌌 Marco Universo desbloqueado','success');
 }
 if(!user.achievements.includes('speed_demon') && user.speedrunBest!=null && user.speedrunBest<=11000){
   user.achievements.push('speed_demon');
   if(!user.banners.includes('aurora')) user.banners.push('aurora');
   newly.push('speed_demon');
   await pushNotification(user.id,'⚡ ¡LOGRO DESBLOQUEADO!','Demonio Veloz: 11s o menos → 🌠 Banner Aurora desbloqueado','success');
 }
 if(!user.achievements.includes('centurion') && (user.exp||0)>=100000){
   user.achievements.push('centurion');
   if(!user.fonts.includes('phantom')) user.fonts.push('phantom');
   user.coins=(user.coins||0)+100000;
   newly.push('centurion');
   await pushNotification(user.id,'💯 ¡LOGRO DESBLOQUEADO!','Centurión: 100k EXP → 👻 Letra Fantasma + 100.000 pts','success');
 }
 return newly;
}
function pickLuckyItem(){
 const total=LUCKY_ITEMS.reduce((s,i)=>s+i.weight,0);
 let r=Math.random()*total;
 for(const it of LUCKY_ITEMS){ r-=it.weight; if(r<=0) return it; }
 return LUCKY_ITEMS[0];
}

function levelFromExp(exp){ let lv=1,left=Number(exp)||0,need=100; while(left>=need){ left-=need; lv++; need=100+(lv-1)*50; } return {level:lv,into:left,need}; }
function formatSpeedrunMs(ms){ const s=ms/1000,m=Math.floor(s/60),sec=Math.floor(s%60),cs=Math.floor((ms%1000)/10); return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs).padStart(2,'0'); }
function publicUser(u){ return { id:u.id, username:u.username, createdAt:u.createdAt, coins:u.coins||0, skins:u.skins||['default'], equipped:u.equipped||'default', profilePic:u.profilePic||'', theme:u.theme||'dark', hoursPlayed: Math.floor((u.hoursPlayed||0)/3600), exp:u.exp||0, frames:u.frames||[], equippedFrame:u.equippedFrame||'none', speedrunBest:u.speedrunBest||null, nameColor:u.nameColor||'#ffffff', ownedNameColors:u.ownedNameColors||[], chatBg:u.chatBg||'', banners:u.banners||['none'], equippedBanner:u.equippedBanner||'none', bannerImg:u.bannerImg||'', fonts:u.fonts||['normal'], equippedFont:u.equippedFont||'normal', fxs:u.fxs||['none'], equippedFx:u.equippedFx||'none', lastSeen:u.lastSeen||null, description:u.description||'', achievements:u.achievements||[], tournamentStreak:u.tournamentStreak||0, tournamentWins:u.tournamentWins||0, chatBubbles:u.chatBubbles||['none'], equippedBubble:u.equippedBubble||'none', luckySpins:u.luckySpins||0 }; }
function isOnline(lastSeen){ if(!lastSeen) return false; return (Date.now()-new Date(lastSeen).getTime()) < 5*60*1000; }
app.get('/favicon.ico',(req,res)=>res.status(204).end());
app.post('/api/register', async (req,res)=>{ try{ const {username,password}=req.body||{}; if(!username||!password) return res.status(400).json({error:'Usuario y contraseña son obligatorios'}); if(String(username).length<3) return res.status(400).json({error:'El usuario debe tener al menos 3 caracteres'}); if(String(password).length<4) return res.status(400).json({error:'La contraseña debe tener al menos 4 caracteres'}); if(await getUserByUsername(username)) return res.status(409).json({error:'Ese usuario ya existe'}); const salt=crypto.randomBytes(16).toString('hex'); const user={ id:crypto.randomUUID(), username, salt, passwordHash:hashPassword(password,salt), progress:[], coins:0, skins:['default'], equipped:'default', profilePic:'', theme:'dark', hoursPlayed:0, exp:0, frames:['none'], equippedFrame:'none', speedrunBest:null, speedrunHistory:[], createdAt:new Date().toISOString(), lastSeen:new Date().toISOString(), nameColor:'#ffffff', ownedNameColors:[], chatBg:'', banners:['none'], equippedBanner:'none', bannerImg:'', fonts:['normal'], equippedFont:'normal', fxs:['none'], equippedFx:'none', description:'' }; await createUser(user); const token=createToken(); await createSession(token,user.id); await pushNotification(user.id,'Bienvenido a Code Invaders 👾','¡Cuenta creada con éxito! Empieza a jugar en la sección Juego.','success'); res.status(201).json({token,user:publicUser(user)}); }catch(e){ console.error('[register]',e.message); res.status(500).json({error:'Error al registrar'}); } });
app.post('/api/login', async (req,res)=>{ try{ const {username,password}=req.body||{}; const user=await getUserByUsername(username); if(!user || user.passwordHash!==hashPassword(password,user.salt)) return res.status(401).json({error:'Usuario o contraseña incorrectos'}); user.lastSeen=new Date().toISOString(); await updateUser(user); const token=createToken(); await createSession(token,user.id); await pushNotification(user.id,'Sesión iniciada ✅',`Hola ${user.username}, ¡buen regreso!`,'info'); res.json({token,user:publicUser(user)}); }catch(e){ console.error('[login]',e.message); res.status(500).json({error:'Error al iniciar sesión'}); } });
app.post('/api/logout', async (req,res)=>{ try{ const token=(req.headers.authorization||'').replace('Bearer ',''); if(token) await deleteSession(token); res.json({ok:true}); }catch(e){ res.json({ok:true}); } });
app.get('/api/me', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const lv=levelFromExp(user.exp); res.json({user:publicUser(user),progress:user.progress,coins:user.coins,skins:user.skins,equipped:user.equipped,expLevel:lv}); }catch(e){ console.error('[me]',e.message); res.status(500).json({error:'Error al obtener datos'}); } });
app.post('/api/heartbeat', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); user.lastSeen=new Date().toISOString(); await updateUser(user); res.json({ok:true, online:true}); }catch(e){ res.status(500).json({error:'heartbeat error'}); } });
app.get('/api/progress', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); res.json({progress:user.progress}); }catch(e){ res.status(500).json({error:'progress error'}); } });
app.put('/api/progress', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {level,attempts,solved,coinsEarned}=req.body||{}; if(!level) return res.status(400).json({error:'Falta el nivel'}); let entry=user.progress.find(p=>p.level===level); if(!entry){ entry={level,attempts:0,solved:false,solvedAt:null}; user.progress.push(entry); } entry.attempts+=Number(attempts)||1; if(solved && !entry.solved){ entry.solved=true; entry.solvedAt=new Date().toISOString(); await pushNotification(user.id,'¡Nivel completado! 🎉',`Completaste el nivel ${level}. ¡Sigue así!`,'success'); }  if(Number(coinsEarned)) user.coins+=Number(coinsEarned);
 await checkAchievements(user);
 await updateUser(user); res.json({progress:user.progress,coins:user.coins}); }catch(e){ console.error('[progress]',e.message); res.status(500).json({error:'Error al guardar progreso'}); } });
app.get('/api/leaderboard', async (req,res)=>{ res.set('Cache-Control','no-store'); const users=await getAllUsers(); const board=users.map(u=>({id:u.id,username:u.username,solved:u.progress.filter(p=>p.solved).length,attempts:u.progress.reduce((a,p)=>a+p.attempts,0),exp:u.exp||0,hoursPlayed:Math.floor((u.hoursPlayed||0)/3600),profilePic:u.profilePic||'',equippedFrame:u.equippedFrame||'none',frames:u.frames||[],coins:u.coins||0,nameColor:u.nameColor||'#ffffff',equippedFont:u.equippedFont||'normal',equippedFx:u.equippedFx||'none',online:isOnline(u.lastSeen)})).sort((a,b)=>b.solved-a.solved||b.exp-a.exp||a.attempts-b.attempts); res.json({board}); });
app.get('/api/leaderboard/speedrun', async (req,res)=>{ res.set('Cache-Control','no-store'); const users=await getAllUsers(); const board=users.filter(u=>u.speedrunBest!=null).map(u=>({id:u.id,username:u.username,speedrunBest:u.speedrunBest,solved:u.progress.filter(p=>p.solved).length,exp:u.exp||0,profilePic:u.profilePic||'',equippedFrame:u.equippedFrame||'none',frames:u.frames||[],coins:u.coins||0,nameColor:u.nameColor||'#ffffff',equippedFont:u.equippedFont||'normal',equippedFx:u.equippedFx||'none',online:isOnline(u.lastSeen)})).sort((a,b)=>a.speedrunBest-b.speedrunBest); res.json({board}); });
app.post('/api/speedrun', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado, inicia sesión'}); ensureShopFields(user); const {time}=req.body||{}; const t=Math.round(Number(time)); if(!Number.isFinite(t)||t<=0) return res.status(400).json({error:'Tiempo inválido'}); if(t<1000||t>600000) return res.status(400).json({error:'Tiempo fuera de rango (1s - 10m)'}); const isNewBest=user.speedrunBest==null||t<user.speedrunBest; let savedToDb=false; if(isNewBest){ user.speedrunBest=t; if(!Array.isArray(user.speedrunHistory)) user.speedrunHistory=[]; user.speedrunHistory.push({time:t,at:new Date().toISOString()}); if(user.speedrunHistory.length>20) user.speedrunHistory=user.speedrunHistory.slice(-20); try{ await updateUser(user); savedToDb=true; await checkAchievements(user); }catch(dbErr){ console.error('[speedrun] updateUser FAIL',dbErr.message); try{ const dbUser=fileDb.users.find(u=>u.id===user.id); if(dbUser){ Object.assign(dbUser,user); } else { fileDb.users.push(user); } saveDb(fileDb); }catch(fe){ console.error('[speedrun] fallback file fail',fe.message); } } if(savedToDb){ try{ await pushNotification(user.id,'⚡ Nuevo récord Speedrun',`⏱ ${formatSpeedrunMs(t)} — ¡Nuevo mejor tiempo!`,'success'); }catch(e){ console.error('[speedrun] pushNotification fail',e.message); } } console.log(`[speedrun] ${user.username} ${t}ms isNew=${isNewBest} PG=${USE_PG} saved=${savedToDb}`); } else { console.log(`[speedrun] ${user.username} ${t}ms no mejora (best ${user.speedrunBest})`); } return res.json({speedrunBest:user.speedrunBest,isNewBest,savedToDb}); }catch(e){ console.error('[speedrun] error',e && e.stack||e); return res.status(500).json({error:'Error interno al guardar speedrun: '+(e.message||e)}); } });
app.get('/api/user/:id', async (req,res)=>{ const user=await getUserById(req.params.id); if(!user) return res.status(404).json({error:'Usuario no encontrado'}); res.json({id:user.id,username:user.username,profilePic:user.profilePic||'',equippedFrame:user.equippedFrame||'none',frames:user.frames||[],exp:user.exp||0,hoursPlayed:Math.floor((user.hoursPlayed||0)/3600),coins:user.coins||0,solved:user.progress.filter(p=>p.solved).length,attempts:user.progress.reduce((a,p)=>a+p.attempts,0),createdAt:user.createdAt,speedrunBest:user.speedrunBest||null,nameColor:user.nameColor||'#ffffff',equippedBanner:user.equippedBanner||'none',bannerImg:user.bannerImg||'',equippedFont:user.equippedFont||'normal',equippedFx:user.equippedFx||'none',online:isOnline(user.lastSeen),description:user.description||''}); });
app.get('/api/notifications', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const list=await getNotifications(user.id); res.json({notifications:list,unread:list.filter(n=>!n.read).length}); });
app.post('/api/notifications/read', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const {id}=req.body||{}; await markNotifications(user.id,id); res.json({ok:true}); });
app.get('/api/shop',(req,res)=>{ res.json({skins:SKINS}); });
app.post('/api/shop/buy', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {skinId}=req.body||{}; const skin=SKINS.find(s=>s.id===skinId); if(!skin) return res.status(404).json({error:'Skin no existe'}); if(user.skins.includes(skinId)) return res.status(400).json({error:'Ya tienes esta skin'}); if(user.coins<skin.price) return res.status(400).json({error:'Puntos insuficientes'}); user.coins-=skin.price; user.skins.push(skinId); await updateUser(user); await pushNotification(user.id,'¡Skin comprada! 🛒',`Desbloqueaste ${skin.name}`,'success'); res.json({coins:user.coins,skins:user.skins}); });
app.post('/api/shop/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {skinId}=req.body||{}; if(!user.skins.includes(skinId)) return res.status(400).json({error:'No tienes esta skin'}); user.equipped=skinId; await updateUser(user); res.json({equipped:user.equipped}); });
app.delete('/api/account', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const userId=user.id; await deleteUser(userId); await deleteSessionsByUser(userId); if(USE_PG) await pool.query('DELETE FROM notifications WHERE user_id=$1',[userId]); else { fileDb.notifications=fileDb.notifications.filter(n=>n.userId!==userId); saveDb(fileDb); } await deleteChatByUser(userId); const tours=await getTournaments(); for(const t of tours){ if(t.results && t.results[userId]){ delete t.results[userId]; await updateTournament(t); } } res.json({ok:true}); });
app.put('/api/settings', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {username,theme,profilePic,chatBg,bannerImg,description}=req.body||{}; if(username!==undefined){ const name=String(username).trim(); if(name.length<3) return res.status(400).json({error:'El nombre debe tener al menos 3 caracteres'}); const all=await getAllUsers(); if(all.some(u=>u.id!==user.id && u.username===name)) return res.status(409).json({error:'Ese nombre ya está en uso'}); user.username=name; } if(theme==='dark'||theme==='light') user.theme=theme;   if(profilePic!==undefined) user.profilePic=String(profilePic).slice(0,3_500_000); if(bannerImg!==undefined) user.bannerImg=String(bannerImg).slice(0,8000000); if(chatBg!==undefined) user.chatBg=String(chatBg).slice(0,800_000); if(description!==undefined) user.description=String(description).slice(0,200); await updateUser(user); const lv=levelFromExp(user.exp); res.json({user:publicUser(user),expLevel:lv}); });
app.post('/api/stats', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {seconds=0,exp=0,coins=0}=req.body||{}; user.hoursPlayed=(user.hoursPlayed||0)+(Number(seconds)||0); user.exp=(user.exp||0)+(Number(exp)||0); user.coins=(user.coins||0)+(Number(coins)||0);  user.lastSeen=new Date().toISOString();
 await checkAchievements(user);
 await updateUser(user); const lv=levelFromExp(user.exp); res.json({user:publicUser(user),expLevel:lv,expGained:Number(exp)||0}); });
app.get('/api/frames',(req,res)=>{ res.json({frames:FRAMES}); });
app.post('/api/frames/buy', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {frameId}=req.body||{}; const frame=FRAMES.find(f=>f.id===frameId); if(!frame) return res.status(404).json({error:'El marco no existe'}); if(frame.exclusive) return res.status(400).json({error:'Este marco es exclusivo y no se puede comprar'}); if(user.frames.includes(frameId)) return res.status(400).json({error:'Ya tienes este marco'}); if((user.coins||0)<frame.price) return res.status(400).json({error:'Puntos insuficientes'}); user.coins-=frame.price; user.frames.push(frameId); await updateUser(user); await pushNotification(user.id,'¡Marco comprado! 🖼️',`Desbloqueaste ${frame.name}`,'success'); res.json({coins:user.coins,frames:user.frames}); });
app.post('/api/frames/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {frameId}=req.body||{}; const frame=FRAMES.find(f=>f.id===frameId); if(frame && frame.exclusive) return res.status(400).json({error:'Este marco es exclusivo del torneo'}); if(!user.frames.includes(frameId)) return res.status(400).json({error:'No tienes este marco'}); user.equippedFrame=frameId; await updateUser(user); res.json({equippedFrame:user.equippedFrame}); });
app.get('/api/name-colors',(req,res)=>{ res.json({colors:NAME_COLORS}); });
app.post('/api/name-colors/buy', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {colorId}=req.body||{}; const col=NAME_COLORS.find(c=>c.id===colorId); if(!col) return res.status(404).json({error:'Color no existe'}); if(user.ownedNameColors.includes(colorId)) return res.status(400).json({error:'Ya tienes este color'}); if((user.exp||0)<col.price) return res.status(400).json({error:`Necesitas ${col.price} EXP (tienes ${user.exp})`}); user.exp-=col.price; user.ownedNameColors.push(colorId); await updateUser(user); await pushNotification(user.id,'¡Color comprado! 🎨',`Desbloqueaste ${col.name}`,'success'); res.json({exp:user.exp, ownedNameColors:user.ownedNameColors}); });
app.post('/api/name-colors/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {colorId}=req.body||{}; if(colorId==='white'){ user.nameColor='#ffffff'; await updateUser(user); return res.json({nameColor:user.nameColor}); } const col=NAME_COLORS.find(c=>c.id===colorId); if(!col) return res.status(404).json({error:'Color no existe'}); if(!user.ownedNameColors.includes(colorId)) return res.status(400).json({error:'No tienes este color'}); user.nameColor=col.color; await updateUser(user); res.json({nameColor:user.nameColor}); });
app.get('/api/banners',(req,res)=>{ res.json({banners:BANNERS}); });
app.post('/api/banners/buy', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {bannerId}=req.body||{}; const b=BANNERS.find(x=>x.id===bannerId); if(!b) return res.status(404).json({error:'Banner no existe'}); if(user.banners.includes(bannerId)) return res.status(400).json({error:'Ya tienes este banner'}); if((user.coins||0)<b.price) return res.status(400).json({error:'Puntos insuficientes'}); user.coins-=b.price; user.banners.push(bannerId); await updateUser(user); await pushNotification(user.id,'Banner comprado!','Desbloqueaste '+b.name,'success'); res.json({coins:user.coins,banners:user.banners}); });
app.post('/api/banners/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {bannerId}=req.body||{}; if(bannerId==='none'){ user.equippedBanner='none'; await updateUser(user); return res.json({equippedBanner:user.equippedBanner}); } const b=BANNERS.find(x=>x.id===bannerId); if(!b) return res.status(404).json({error:'Banner no existe'}); if(!user.banners.includes(bannerId)) return res.status(400).json({error:'No tienes este banner'}); user.equippedBanner=bannerId; await updateUser(user); res.json({equippedBanner:user.equippedBanner}); });

app.get('/api/fonts',(req,res)=>{ res.json({fonts:FONTS}); });
app.post('/api/fonts/buy', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {fontId}=req.body||{}; const f=FONTS.find(x=>x.id===fontId); if(!f) return res.status(404).json({error:'Letra no existe'}); if(user.fonts.includes(fontId)) return res.status(400).json({error:'Ya tienes esta letra'}); if((user.coins||0)<f.price) return res.status(400).json({error:'Puntos insuficientes'}); user.coins-=f.price; user.fonts.push(fontId); await updateUser(user); await pushNotification(user.id,'Letra comprada!','Desbloqueaste '+f.name,'success'); res.json({coins:user.coins,fonts:user.fonts}); });
app.post('/api/fonts/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {fontId}=req.body||{}; if(fontId==='normal'){ user.equippedFont='normal'; await updateUser(user); return res.json({equippedFont:user.equippedFont}); } const f=FONTS.find(x=>x.id===fontId); if(!f) return res.status(404).json({error:'Letra no existe'}); if(!user.fonts.includes(fontId)) return res.status(400).json({error:'No tienes esta letra'}); user.equippedFont=fontId; await updateUser(user); res.json({equippedFont:user.equippedFont}); });

app.get('/api/fxs',(req,res)=>{ res.json({fxs:FXS}); });
app.post('/api/fxs/buy', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {fxId}=req.body||{}; const f=FXS.find(x=>x.id===fxId); if(!f) return res.status(404).json({error:'Efecto no existe'}); if(user.fxs.includes(fxId)) return res.status(400).json({error:'Ya tienes este efecto'}); if((user.coins||0)<f.price) return res.status(400).json({error:'Puntos insuficientes'}); user.coins-=f.price; user.fxs.push(fxId); await updateUser(user); await pushNotification(user.id,'Efecto comprado!','Desbloqueaste '+f.name,'success'); res.json({coins:user.coins,fxs:user.fxs}); });
app.post('/api/fxs/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {fxId}=req.body||{}; if(fxId==='none'){ user.equippedFx='none'; await updateUser(user); return res.json({equippedFx:user.equippedFx}); } const f=FXS.find(x=>x.id===fxId); if(!f) return res.status(404).json({error:'Efecto no existe'}); if(!user.fxs.includes(fxId)) return res.status(400).json({error:'No tienes este efecto'}); user.equippedFx=fxId; await updateUser(user); res.json({equippedFx:user.equippedFx}); });
app.get('/api/bubbles', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); res.json({bubbles:CHAT_BUBBLES,owned:user.chatBubbles||['none'],equipped:user.equippedBubble||'none'}); }catch(e){ res.status(500).json({error:'bubbles error'}); } });
app.post('/api/bubbles/equip', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {bubbleId}=req.body||{}; if(bubbleId==='none'){ user.equippedBubble='none'; await updateUser(user); return res.json({equippedBubble:user.equippedBubble}); } const b=CHAT_BUBBLES.find(x=>x.id===bubbleId); if(!b) return res.status(404).json({error:'Burbuja no existe'}); if(!(user.chatBubbles||[]).includes(bubbleId)) return res.status(400).json({error:'Aún no ganaste esta burbuja (gírala en Lucky Coders)'}); user.equippedBubble=bubbleId; await updateUser(user); await pushNotification(user.id,'💬 Burbuja equipada','Ahora tus mensajes usan '+b.name,'success'); res.json({equippedBubble:user.equippedBubble}); });


app.get('/api/levels', async (req,res)=>{ const user=await findUserByToken(req); const solved=user?user.progress.filter(p=>p.solved).map(p=>p.level):[]; res.json({total:LEVELS.length,solved,levels:LEVELS}); });
app.get('/api/chat', async (req,res)=>{ const msgs=await getChat(30); res.set('Cache-Control','no-store'); res.json({messages:msgs}); });
 app.post('/api/chat', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'Debes iniciar sesión para chatear'}); ensureShopFields(user); const {text}=req.body||{}; const t=String(text||'').trim(); if(!t) return res.status(400).json({error:'Mensaje vacío'}); const isImg=t.startsWith('[img]'); const isGif=t.startsWith('[gif]'); const isSticker=t.startsWith('[sticker]'); const isMedia=isImg||isGif||isSticker; if(!isMedia && t.length>500) return res.status(400).json({error:'Mensaje muy largo (máx 500)'}); if(isMedia && t.length>700000) return res.status(400).json({error:'Imagen muy grande'}); if(isImg){ const d=t.slice(5); if(!/^data:image\/(png|jpe?g|gif|webp);base64,/.test(d)) return res.status(400).json({error:'Foto inválida'}); } if(isGif){ const u=t.slice(5,505); if(!/^https?:\/\/.{4,480}$/.test(u)) return res.status(400).json({error:'GIF inválido'}); } if(isSticker){ if(t.length>120) return res.status(400).json({error:'Sticker inválido'}); } const maxLen=isMedia?700000:500; const msg={id:crypto.randomUUID(),userId:user.id,username:user.username,text:t.slice(0,maxLen),createdAt:new Date().toISOString(),equippedBubble:user.equippedBubble||'none',equippedFrame:user.equippedFrame||'none',nameColor:user.nameColor||'#ffffff',equippedFont:user.equippedFont||'normal',equippedFx:user.equippedFx||'none',frames:user.frames||[],profilePic:user.profilePic||''}; await addChat(msg); res.json({message:msg}); });
app.delete('/api/chat/:id', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const id=req.params.id; if(USE_PG){ const r=await pool.query('SELECT * FROM chat_messages WHERE id=$1',[id]); if(!r.rows[0]) return res.status(404).json({error:'Mensaje no encontrado'}); if(r.rows[0].user_id!==user.id) return res.status(403).json({error:'No puedes borrar mensajes ajenos'}); await pool.query('DELETE FROM chat_messages WHERE id=$1',[id]); } else { const m=(fileDb.chat||[]).find(c=>c.id===id); if(!m) return res.status(404).json({error:'Mensaje no encontrado'}); if(m.userId!==user.id) return res.status(403).json({error:'No puedes borrar mensajes ajenos'}); fileDb.chat=fileDb.chat.filter(c=>c.id!==id); saveDb(fileDb); } res.json({ok:true}); });
/* FRIENDS */
async function getFriendships(userId){
  if(USE_PG){ const r=await pool.query('SELECT * FROM friendships WHERE requester_id=$1 OR addressee_id=$1',[userId]); return r.rows.map(x=>({id:x.id,requesterId:x.requester_id,addresseeId:x.addressee_id,status:x.status,createdAt:x.created_at})); }
  return fileDb.friendships.filter(f=>f.requesterId===userId||f.addresseeId===userId);
}
app.get('/api/friends', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const frs=await getFriendships(user.id); const users=await getAllUsers(); const map=new Map(users.map(u=>[u.id,u])); const out=frs.map(f=>{ const otherId=f.requesterId===user.id?f.addresseeId:f.requesterId; const other=map.get(otherId); return {id:f.id,otherId,username:other?other.username:'?',profilePic:other?other.profilePic:'',online:other?isOnline(other.lastSeen):false, nameColor:other?other.nameColor:'#ffffff', equippedFont:other?(other.equippedFont||'normal'):'normal', equippedFx:other?(other.equippedFx||'none'):'none', status:f.status, isRequester:f.requesterId===user.id, createdAt:f.createdAt}; }); res.json({friends:out}); });
app.post('/api/friends/request', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const {username,userId}=req.body||{}; let target=null; if(userId) target=await getUserById(userId); else if(username) target=await getUserByUsername(String(username).trim()); if(!target) return res.status(404).json({error:'Usuario no encontrado'}); if(target.id===user.id) return res.status(400).json({error:'No puedes agregarte a ti mismo'}); const existing=await getFriendships(user.id); if(existing.some(f=> (f.requesterId===user.id&&f.addresseeId===target.id)||(f.requesterId===target.id&&f.addresseeId===user.id)) ) return res.status(400).json({error:'Ya existe solicitud o amistad'}); const fr={id:crypto.randomUUID(),requesterId:user.id,addresseeId:target.id,status:'pending',createdAt:new Date().toISOString()}; if(USE_PG) await pool.query('INSERT INTO friendships(id,requester_id,addressee_id,status,created_at) VALUES($1,$2,$3,$4,$5)',[fr.id,fr.requesterId,fr.addresseeId,fr.status,fr.createdAt]); else { fileDb.friendships.push(fr); saveDb(fileDb); } await pushNotification(target.id,'👥 Solicitud de amistad',`${user.username} te envió solicitud de amistad. Acepta en Amigos.`,`info`); res.json({request:fr}); });
app.post('/api/friends/accept', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const {requestId}=req.body||{}; let fr=null; if(USE_PG){ const r=await pool.query('SELECT * FROM friendships WHERE id=$1',[requestId]); if(r.rows[0]) fr={id:r.rows[0].id,requesterId:r.rows[0].requester_id,addresseeId:r.rows[0].addressee_id,status:r.rows[0].status,createdAt:r.rows[0].created_at}; } else fr=fileDb.friendships.find(f=>f.id===requestId); if(!fr) return res.status(404).json({error:'Solicitud no encontrada'}); if(fr.addresseeId!==user.id) return res.status(403).json({error:'No autorizado'}); if(fr.status!=='pending') return res.status(400).json({error:'Ya procesada'}); fr.status='accepted'; if(USE_PG) await pool.query('UPDATE friendships SET status=$1 WHERE id=$2',['accepted',fr.id]); else saveDb(fileDb); const requester=await getUserById(fr.requesterId); await pushNotification(fr.requesterId,'✅ Amistad aceptada',`${user.username} aceptó tu solicitud. Ya pueden chatear en privado.`,`success`); res.json({ok:true}); });
app.post('/api/friends/reject', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const {requestId}=req.body||{}; let fr=null; if(USE_PG){ const r=await pool.query('SELECT * FROM friendships WHERE id=$1',[requestId]); if(r.rows[0]) fr={id:r.rows[0].id,requesterId:r.rows[0].requester_id,addresseeId:r.rows[0].addressee_id,status:r.rows[0].status}; } else fr=fileDb.friendships.find(f=>f.id===requestId); if(!fr) return res.status(404).json({error:'Solicitud no encontrada'}); if(fr.addresseeId!==user.id && fr.requesterId!==user.id) return res.status(403).json({error:'No autorizado'}); if(USE_PG) await pool.query('DELETE FROM friendships WHERE id=$1',[requestId]); else { fileDb.friendships=fileDb.friendships.filter(f=>f.id!==requestId); saveDb(fileDb); } res.json({ok:true}); });
app.delete('/api/friends/:id', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const id=req.params.id; let fr=null; if(USE_PG){ const r=await pool.query('SELECT * FROM friendships WHERE id=$1',[id]); if(r.rows[0]) fr={id:r.rows[0].id,requesterId:r.rows[0].requester_id,addresseeId:r.rows[0].addressee_id}; } else fr=fileDb.friendships.find(f=>f.id===id); if(!fr) return res.status(404).json({error:'No encontrado'}); if(fr.requesterId!==user.id && fr.addresseeId!==user.id) return res.status(403).json({error:'No autorizado'}); if(USE_PG) await pool.query('DELETE FROM friendships WHERE id=$1',[id]); else { fileDb.friendships=fileDb.friendships.filter(f=>f.id!==id); saveDb(fileDb); } res.json({ok:true}); });
app.get('/api/friends/private/:friendId', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const friendId=req.params.friendId; const frs=await getFriendships(user.id); const ok=frs.some(f=>f.status==='accepted' && (f.requesterId===friendId || f.addresseeId===friendId)); if(!ok) return res.status(403).json({error:'No son amigos'}); let msgs=[]; if(USE_PG){ const r=await pool.query('SELECT * FROM (SELECT * FROM private_messages WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at DESC LIMIT 30) t ORDER BY created_at ASC',[user.id,friendId]); msgs=r.rows.map(x=>({id:x.id,senderId:x.sender_id,receiverId:x.receiver_id,text:x.text,createdAt:x.created_at})); } else msgs=fileDb.privateMessages.filter(m=>(m.senderId===user.id&&m.receiverId===friendId)||(m.senderId===friendId&&m.receiverId===user.id)).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).slice(-30); try{ const u1=await getUserById(user.id); const u2=await getUserById(friendId); const bmap={}; if(u1) bmap[u1.id]=u1.equippedBubble||'none'; if(u2) bmap[u2.id]=u2.equippedBubble||'none'; msgs=msgs.map(m=>Object.assign({},m,{senderBubble:bmap[m.senderId]||m.senderBubble||'none'})); }catch(e){} res.set('Cache-Control','no-store'); res.json({messages:msgs}); });
app.post('/api/friends/private/:friendId', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); const friendId=req.params.friendId; const {text}=req.body||{}; const t=String(text||'').trim(); if(!t) return res.status(400).json({error:'Mensaje vacío'}); const isImg=t.startsWith('[img]'); const isGif=t.startsWith('[gif]'); const isSticker=t.startsWith('[sticker]'); const isMedia=isImg||isGif||isSticker; if(!isMedia && t.length>500) return res.status(400).json({error:'Muy largo'}); if(isMedia && t.length>700000) return res.status(400).json({error:'Imagen muy grande'}); if(isImg && !/^data:image\/(png|jpe?g|gif|webp);base64,/.test(t.slice(5))) return res.status(400).json({error:'Foto inválida'}); if(isGif && !/^https?:\/\/.{4,480}$/.test(t.slice(5,505))) return res.status(400).json({error:'GIF inválido'}); if(isSticker && t.length>120) return res.status(400).json({error:'Sticker inválido'}); const frs=await getFriendships(user.id); const ok=frs.some(f=>f.status==='accepted' && (f.requesterId===friendId || f.addresseeId===friendId)); if(!ok) return res.status(403).json({error:'No son amigos'}); const maxLen=isMedia?700000:500; const msg={id:crypto.randomUUID(),senderId:user.id,receiverId:friendId,text:t.slice(0,maxLen),createdAt:new Date().toISOString()}; if(USE_PG) await pool.query('INSERT INTO private_messages(id,sender_id,receiver_id,text,created_at) VALUES($1,$2,$3,$4,$5)',[msg.id,msg.senderId,msg.receiverId,msg.text,msg.createdAt]); else { fileDb.privateMessages.push(msg); if(fileDb.privateMessages.length>2000) fileDb.privateMessages=fileDb.privateMessages.slice(-2000); saveDb(fileDb); } let preview=t.slice(0,40); if(isImg) preview='📷 Foto'; else if(isGif) preview='🎞️ GIF'; else if(isSticker) preview='😎 '+t.slice(9,15); await pushNotification(friendId,'💬 Mensaje privado',`${user.username}: ${preview}`,`info`); res.json({message:msg}); });
/* GIFTS */
app.post('/api/friends/gift', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const {friendId,amount,message}=req.body||{}; const numAmount=Math.round(Number(amount)); if(!friendId) return res.status(400).json({error:'Falta el destinatario'}); if(!Number.isFinite(numAmount)||numAmount<10) return res.status(400).json({error:'Monto mínimo: 10 pts'}); if(numAmount>5000) return res.status(400).json({error:'Monto máximo: 5000 pts'}); if(user.coins<numAmount) return res.status(400).json({error:'Puntos insuficientes'}); const target=await getUserById(friendId); if(!target) return res.status(404).json({error:'Usuario no encontrado'}); if(target.id===user.id) return res.status(400).json({error:'No puedes enviarte obsequios a ti mismo'}); const frs=await getFriendships(user.id); const ok=frs.some(f=>f.status==='accepted' && (f.requesterId===friendId || f.addresseeId===friendId)); if(!ok) return res.status(400).json({error:'Solo puedes enviar obsequios a amigos'}); user.coins-=numAmount; await updateUser(user); target.coins=(target.coins||0)+numAmount; await updateUser(target); const gift={id:crypto.randomUUID(),senderId:user.id,receiverId:friendId,amount:numAmount,message:String(message||'').slice(0,100),createdAt:new Date().toISOString()}; if(USE_PG) await pool.query('INSERT INTO gifts(id,sender_id,receiver_id,amount,message,created_at) VALUES($1,$2,$3,$4,$5,$6)',[gift.id,gift.senderId,gift.receiverId,gift.amount,gift.message,gift.createdAt]); else { fileDb.gifts.push(gift); if(fileDb.gifts.length>2000) fileDb.gifts=fileDb.gifts.slice(-2000); saveDb(fileDb); } await pushNotification(friendId,'🎁 ¡Obsequio recibido!',`${user.username} te envió ${numAmount} pts${gift.message?': '+gift.message:''}`,'success'); res.json({coins:user.coins,gift}); }catch(e){ console.error('[gift]',e.message); res.status(500).json({error:'Error al enviar obsequio'}); } });
app.get('/api/friends/gifts', async (req,res)=>{ try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); let gifts=[]; if(USE_PG){ const r=await pool.query('SELECT * FROM gifts WHERE sender_id=$1 OR receiver_id=$1 ORDER BY created_at DESC LIMIT 50',[user.id]); gifts=r.rows.map(x=>({id:x.id,senderId:x.sender_id,receiverId:x.receiver_id,amount:x.amount,message:x.message,createdAt:x.created_at})); } else gifts=fileDb.gifts.filter(g=>g.senderId===user.id||g.receiverId===user.id).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,50); const users=await getAllUsers(); const map=new Map(users.map(u=>[u.id,u])); gifts=gifts.map(g=>({...g,senderName:map.get(g.senderId)?map.get(g.senderId).username:'?',receiverName:map.get(g.receiverId)?map.get(g.receiverId).username:'?'})); res.json({gifts}); }catch(e){ res.status(500).json({error:'Error al obtener obsequios'}); } });
const TOURNAMENT_DURATION_DAYS=15;
function computeEndDate(){ const d=new Date(); d.setDate(d.getDate()+TOURNAMENT_DURATION_DAYS); d.setHours(0,0,0,0); return d; }
async function getActiveTournament(){ const tours=await getTournaments(); return tours.find(t=>t.status==='active')||null; }
async function getPendingTournament(){ const tours=await getTournaments(); return tours.find(t=>t.status==='pending')||null; }
async function startTournament(){ const now=new Date(); const endDate=computeEndDate(); const tournament={id:crypto.randomUUID(),startDate:now.toISOString(),endDate:endDate.toISOString(),status:'active',results:{}}; await createTournament(tournament); return tournament; }
async function endTournament(tournament){ const users=await getAllUsers(); const board=users.map(u=>({id:u.id,username:u.username,solved:u.progress.filter(p=>p.solved).length,attempts:u.progress.reduce((a,p)=>a+p.attempts,0),exp:u.exp||0})).sort((a,b)=>b.solved-a.solved||b.exp-a.exp||a.attempts-b.attempts); board.forEach((entry,i)=>{ tournament.results[entry.id]={position:i+1}; }); for(const entry of board){ const pos=tournament.results[entry.id].position; const user=await getUserById(entry.id); if(!user) continue; ensureShopFields(user); let rewardText=''; if(pos===1){ if(user.frames && !user.frames.includes('campeon')) user.frames.push('campeon'); if(user.skins && !user.skins.includes('tournament_silver')) user.skins.push('tournament_silver'); user.exp=(user.exp||0)+5000; user.coins=(user.coins||0)+30000; user.tournamentStreak=(user.tournamentStreak||0)+1; user.tournamentWins=(user.tournamentWins||0)+1; rewardText='🏆 ¡Campeón! Marco Campeón + Nave Silver + 5000 EXP + 30000 pts'; } else { user.tournamentStreak=0; if(pos===2){ if(user.skins && !user.skins.includes('tournament_silver')) user.skins.push('tournament_silver'); user.exp=(user.exp||0)+3000; user.coins=(user.coins||0)+10000; rewardText='🥈 ¡Subcampeón! Nave Silver + 3000 EXP + 10000 pts'; } else if(pos===3){ user.exp=(user.exp||0)+2000; user.coins=(user.coins||0)+5000; rewardText='🥉 ¡Tercer puesto! 2000 EXP + 5000 pts'; } else { user.coins=(user.coins||0)+5000; rewardText=`🎯 Puesto #${pos}. + 5000 pts`; } } await checkAchievements(user); await updateUser(user); await pushNotification(user.id,'🏆 Torneo RANKED finalizado',`Quedaste en puesto #${pos}. ${rewardText}`,'success'); } tournament.status='finished'; await updateTournament(tournament); }
app.get('/api/tournament', async (req,res)=>{ let tournament=await getActiveTournament(); if(!tournament) tournament=await getPendingTournament(); const users=await getAllUsers(); const playerCount=users.length; res.json({tournament: tournament?{id:tournament.id,status:tournament.status,startDate:tournament.startDate,endDate:tournament.endDate,results:tournament.results}:null, playerCount, minPlayers:10, canStart: playerCount>=10}); });
app.post('/api/tournament/start', async (req,res)=>{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); if(await getActiveTournament()) return res.status(400).json({error:'Ya hay un torneo activo'}); const users=await getAllUsers(); if(users.length<10) return res.status(400).json({error:`Se necesitan 10 jugadores para empezar`}); const tournament=await startTournament(); res.json({tournament}); });
app.post('/api/tournament/check', async (req,res)=>{ const active=await getActiveTournament(); if(active){ if(new Date(active.endDate)<=new Date()){ await endTournament(active); return res.json({ended:true, tournament:active}); } return res.json({active:true,endDate:active.endDate}); } res.json({active:false}); });

const ADMIN_KEY = process.env.ADMIN_KEY || '';
async function dumpDb(){
  if(USE_PG){
    const users=(await pool.query('SELECT * FROM users')).rows.map(pgRowToUser);
    const sessions=(await pool.query('SELECT * FROM sessions')).rows.map(x=>({token:x.token,userId:x.user_id}));
    const notifications=(await pool.query('SELECT * FROM notifications')).rows.map(x=>({id:x.id,userId:x.user_id,title:x.title,body:x.body,type:x.type,read:x.read,createdAt:x.created_at}));
    const tournaments=(await pool.query('SELECT * FROM tournaments')).rows.map(x=>({id:x.id,status:x.status,startDate:x.start_date,endDate:x.end_date,results:JSON.parse(x.results||'{}')}));
    const chat=(await pool.query('SELECT * FROM chat_messages')).rows.map(x=>({id:x.id,userId:x.user_id,username:x.username,text:x.text,createdAt:x.created_at}));
    const friendships=(await pool.query('SELECT * FROM friendships')).rows.map(x=>({id:x.id,requesterId:x.requester_id,addresseeId:x.addressee_id,status:x.status,createdAt:x.created_at}));
    const privateMessages=(await pool.query('SELECT * FROM private_messages')).rows.map(x=>({id:x.id,senderId:x.sender_id,receiverId:x.receiver_id,text:x.text,createdAt:x.created_at}));
    const gifts=(await pool.query('SELECT * FROM gifts')).rows.map(x=>({id:x.id,senderId:x.sender_id,receiverId:x.receiver_id,amount:x.amount,message:x.message,createdAt:x.created_at}));
    return {version:1,exportedAt:new Date().toISOString(),users,sessions,notifications,tournaments,chat,friendships,privateMessages,gifts};
  }
  return Object.assign({version:1,exportedAt:new Date().toISOString()},JSON.parse(JSON.stringify(fileDb)));
}
async function importDb(d){
  if(!d||!Array.isArray(d.users)) throw new Error('Respaldo invalido');
  if(USE_PG){
    for(const u of d.users){ ensureShopFields(u); await pgUpsertUser(u); }
    for(const s of (d.sessions||[])){ try{ await pool.query('INSERT INTO sessions(token,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[s.token,s.userId]); }catch(e){} }
    for(const n of (d.notifications||[])){ try{ await pool.query('INSERT INTO notifications(id,user_id,title,body,type,read,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[n.id,n.userId,n.title,n.body,n.type,n.read,n.createdAt]); }catch(e){} }
    for(const t of (d.tournaments||[])){ try{ await pool.query('INSERT INTO tournaments(id,status,start_date,end_date,results) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[t.id,t.status,t.startDate,t.endDate,JSON.stringify(t.results||{})]); }catch(e){} }
    for(const m of (d.chat||[])){ try{ await pool.query('INSERT INTO chat_messages(id,user_id,username,text,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[m.id,m.userId,m.username,m.text,m.createdAt]); }catch(e){} }
    for(const f of (d.friendships||[])){ try{ await pool.query('INSERT INTO friendships(id,requester_id,addressee_id,status,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[f.id,f.requesterId,f.addresseeId,f.status,f.createdAt]); }catch(e){} }
    for(const m of (d.privateMessages||[])){ try{ await pool.query('INSERT INTO private_messages(id,sender_id,receiver_id,text,created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[m.id,m.senderId,m.receiverId,m.text,m.createdAt]); }catch(e){} }
    for(const g of (d.gifts||[])){ try{ await pool.query('INSERT INTO gifts(id,sender_id,receiver_id,amount,message,created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING',[g.id,g.senderId,g.receiverId,g.amount,g.message||'',g.createdAt]); }catch(e){} }
  } else {
    const byId=(arr)=>(new Map((arr||[]).map(x=>[x.id,x])));
    const mu=byId(fileDb.users); (d.users||[]).forEach(u=>{ ensureShopFields(u); mu.set(u.id,u); }); fileDb.users=[...mu.values()];
    const ms=byId(fileDb.sessions); (d.sessions||[]).forEach(s=>ms.set(s.token||s.id,s)); fileDb.sessions=[...ms.values()];
    const mn=byId(fileDb.notifications); (d.notifications||[]).forEach(n=>mn.set(n.id,n)); fileDb.notifications=[...mn.values()];
    const mt=byId(fileDb.tournaments); (d.tournaments||[]).forEach(x=>mt.set(x.id,x)); fileDb.tournaments=[...mt.values()];
    const mc=byId(fileDb.chat); (d.chat||[]).forEach(m=>mc.set(m.id,m)); fileDb.chat=[...mc.values()];
    const mf=byId(fileDb.friendships); (d.friendships||[]).forEach(f=>mf.set(f.id,f)); fileDb.friendships=[...mf.values()];
    const mp=byId(fileDb.privateMessages); (d.privateMessages||[]).forEach(m=>mp.set(m.id,m)); fileDb.privateMessages=[...mp.values()];
    const mg=byId(fileDb.gifts); (d.gifts||[]).forEach(g=>mg.set(g.id,g)); fileDb.gifts=[...mg.values()];
    saveDb(fileDb);
  }
  return {users:(d.users||[]).length};
}
app.post('/api/admin/export', async (req,res)=>{ const {key}=req.body||{}; if(!ADMIN_KEY||key!==ADMIN_KEY) return res.status(403).json({error:'Clave de admin incorrecta o no configurada'}); try{ const dump=await dumpDb(); res.json({dump}); }catch(e){ res.status(500).json({error:'No se pudo exportar'}); } });
app.post('/api/admin/import', async (req,res)=>{ const {key,dump}=req.body||{}; if(!ADMIN_KEY||key!==ADMIN_KEY) return res.status(403).json({error:'Clave de admin incorrecta o no configurada'}); try{ const r=await importDb(dump); res.json({ok:true,users:r.users}); }catch(e){ res.status(400).json({error:e.message||'Respaldo invalido'}); } });

/* ============ MULTIPLAYER SALAS (buscador + público/privado con código, polling) ============ */
const Rooms=new Map();
const UserRoom=new Map();
function makeRoomCode(){ const ABC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s=''; for(let i=0;i<6;i++) s+=ABC[Math.floor(Math.random()*ABC.length)]; return s; }
function getUserRoomId(uid){ return UserRoom.get(uid)||null; }
function getRoom(rid){ return Rooms.get(rid)||null; }
function findRoomOfUser(uid){ const rid=UserRoom.get(uid); return rid?Rooms.get(rid)||null:null; }
function roomCard(r){
  const lobbySize=r.lobby?r.lobby.size:0;
  const st=r.match?(r.match.status||'lobby'):'lobby';
  return { id:r.id, name:r.name, isPublic:!!r.isPublic, mode:r.mode||'normal', ownerId:r.ownerId, ownerName:r.ownerName||'', players:lobbySize, status:st, createdAt:r.createdAt };
}
function multiWaveTime(w){ return Math.max(12, 32 - w*1.2); }
function multiPickEnemies(){
  const pools=[];
  try{
    const html=(LEVELS[0]&&LEVELS[0].questions)||[]; const css=(LEVELS[1]&&LEVELS[1].questions)||[]; const js=(LEVELS[2]&&LEVELS[2].questions)||[];
    html.forEach(q=>pools.push({cat:'HTML',q:q.q,a:q.a})); css.forEach(q=>pools.push({cat:'CSS',q:q.q,a:q.a})); js.forEach(q=>pools.push({cat:'JS',q:q.q,a:q.a}));
  }catch(e){}
  if(!pools.length) pools.push({cat:'HTML',q:'Párrafo',a:'<p>'},{cat:'CSS',q:'Color de texto',a:'color'},{cat:'JS',q:'Variable mutable',a:'let'});
  const out=[];
  for(let i=0;i<3;i++){ const p=pools[Math.floor(Math.random()*pools.length)]; out.push({id:crypto.randomUUID().slice(0,8),cat:p.cat,q:p.q,a:p.a}); }
  return out;
}
function multiWaveDesc(w,enemies){
  const c={HTML:0,CSS:0,JS:0}; enemies.forEach(e=>{ if(c[e.cat]!==undefined) c[e.cat]++; });
  const parts=[]; if(c.HTML) parts.push(c.HTML+' HTML'); if(c.CSS) parts.push(c.CSS+' CSS'); if(c.JS) parts.push(c.JS+' JS');
  return 'HORNADA '+w+' · '+parts.join(' + ');
}
function leaveRoomInternal(uid){
  const r=findRoomOfUser(uid);
  if(!r) return;
  if(r.lobby) r.lobby.delete(uid);
  UserRoom.delete(uid);
  if(r.match && r.match.status==='playing' && r.match.players[uid]){ r.match.players[uid].alive=false; r.match.players[uid].streak=0; }
  if((!r.lobby || r.lobby.size===0) && (!r.match || r.match.status!=='playing')){ Rooms.delete(r.id); }
}
function tickRoom(r){
  const now=Date.now();
  for(const [id,p] of [...r.lobby]){ if(now-p.lastSeen>45000){ r.lobby.delete(id); if(UserRoom.get(id)===r.id) UserRoom.delete(id); } }
  if(r.match && r.match.status==='finished' && now-r.match.finishedAt>90000){ r.match=null; for(const p of r.lobby.values()) p.ready=false; }
  if(r.match && r.match.status==='playing'){
    for(const pid of Object.keys(r.match.players)){
      const ps=r.match.players[pid];
      if(ps.alive && now-ps.waveStart>multiWaveTime(ps.wave)*1000){
        ps.lives=(ps.lives==null?2:ps.lives)-1; ps.misses=(ps.misses||0)+1; ps.streak=0;
        if(ps.lives<=0){ ps.alive=false; } else { ps.waveStart=now; }
      }
    }
    const ids=Object.keys(r.match.players);
    const alive=ids.filter(id=>r.match.players[id].alive);
    if(ids.length>=2 && alive.length<=1 && !r.match.finishing){
      r.match.finishing=true;
      const m=r.match;
      (async()=>{
        try{
          const pls=ids.map(id=>m.players[id]);
          pls.sort((a,b)=> (b.alive-a.alive) || (b.wave-a.wave) || (b.hits-a.hits) || (a.misses-b.misses));
          const win=pls[0];
          for(const p of pls){
            const u=await getUserById(p.userId); if(!u) continue; ensureShopFields(u);
            const isWin=p.userId===win.userId;
            const expGain=isWin?(300+p.wave*20+p.hits*5):(p.hits*5);
            const coinGain=isWin?(500+ids.length*100+p.hits*5):(p.hits*10);
            u.exp=(u.exp||0)+expGain; u.coins=(u.coins||0)+coinGain; u.lastSeen=new Date().toISOString();
            await updateUser(u);
            p.expWon=expGain; p.coinsWon=coinGain;
            try{ await pushNotification(u.id, isWin?'🏆 ¡Ganaste el Multiplayer!':'💀 Multiplayer terminado', isWin?('Oleada '+p.wave+' · +'+expGain+' EXP +'+coinGain+' pts'):('Oleada '+p.wave+' · '+p.hits+' aciertos'), isWin?'success':'info'); }catch(e){}
          }
          m.status='finished'; m.finishedAt=Date.now(); m.winnerId=win.userId;
        }catch(e){ console.error('[multi finish]',e.message); m.status='finished'; m.finishedAt=Date.now(); }
      })();
    }
  }
  if(!r.match || r.match.status==='finished'){
    const l=[...r.lobby.values()];
    if(l.length>=2 && l.every(p=>p.ready)){
      const players={};
      l.forEach(p=>{ const en=multiPickEnemies(); players[p.userId]={userId:p.userId,username:p.username,profilePic:p.profilePic||'',frame:p.frame||'none',skin:p.skin||'default',nameColor:p.nameColor||'#ffffff',alive:true,lives:2,wave:1,enemies:en,waveStart:Date.now(),desc:multiWaveDesc(1,en),hits:0,misses:0,streak:0,best:0,expWon:0,coinsWon:0}; });
      r.match={id:crypto.randomUUID(),status:'playing',startedAt:Date.now(),players,shots:[]};
      r.chat.push({id:crypto.randomUUID(),userId:'sys',username:'SISTEMA',text:'⚔️ ¡Partida iniciada en '+r.name+'! Sobrevive hasta ser el último.',createdAt:new Date().toISOString()});
    }
  }
  if((!r.lobby || r.lobby.size===0) && (!r.match || r.match.status!=='playing')){ Rooms.delete(r.id); }
}
function tickAllRooms(){ for(const r of [...Rooms.values()]){ try{ tickRoom(r); }catch(e){} } }
function multiPublicState(){ tickAllRooms(); }
function multiSlimPic(pic){ if(!pic) return ''; if(pic.startsWith('data:') && pic.length>500) return ''; return pic; }
app.get('/api/multi/rooms', async (req,res)=>{
  try{
    tickAllRooms();
    const q=String(req.query.q||'').trim().toLowerCase();
    let list=[...Rooms.values()].map(roomCard);
    if(q) list=list.filter(r=>(r.name||'').toLowerCase().includes(q)||(r.ownerName||'').toLowerCase().includes(q));
    list.sort((a,b)=>(b.players-a.players)||((b.createdAt||'')<(a.createdAt||'')?-1:1));
    res.set('Cache-Control','no-store');
    res.json({rooms:list.slice(0,50)});
  }catch(e){ res.status(500).json({error:'rooms error'}); }
});
app.post('/api/multi/rooms', async (req,res)=>{
  try{
    const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
    ensureShopFields(user);
    const {name,isPublic,mode}=req.body||{};
    const nm=String(name||'').trim().slice(0,30);
    if(nm.length<3) return res.status(400).json({error:'El lobby necesita un nombre (3+ letras)'});
    const pub=isPublic!==false;
    const md=(mode==='speedrun')?'speedrun':'normal';
    leaveRoomInternal(user.id);
    const id=crypto.randomUUID();
    const room={ id, name:nm, isPublic:!!pub, code:pub?null:makeRoomCode(), mode:md, ownerId:user.id, ownerName:user.username, createdAt:new Date().toISOString(), lobby:new Map(), chat:[], match:null };
    room.lobby.set(user.id,{userId:user.id,username:user.username,profilePic:user.profilePic||'',frame:user.equippedFrame||'none',skin:user.equipped||'default',nameColor:user.nameColor||'#ffffff',ready:false,lastSeen:Date.now()});
    Rooms.set(id,room); UserRoom.set(user.id,id);
    room.chat.push({id:crypto.randomUUID(),userId:'sys',username:'SISTEMA',text:'🚀 Sala "'+nm+'" creada por '+user.username+(room.isPublic?' (pública)':' (privada)'),createdAt:new Date().toISOString()});
    tickRoom(room);
    res.json({ok:true,room:{...roomCard(room),code:(room.ownerId===user.id&&!room.isPublic)?room.code:null,isOwner:true}});
  }catch(e){ res.status(500).json({error:'create room error'}); }
});
app.post('/api/multi/rooms/join', async (req,res)=>{
  try{
    const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
    ensureShopFields(user);
    let {roomId,code}=req.body||{};
    roomId=String(roomId||'').trim(); code=String(code||'').trim().toUpperCase();
    let room=roomId?getRoom(roomId):null;
    if(!room && code){ for(const r of Rooms.values()){ if(r.code&&r.code===code){ room=r; break; } } }
    if(!room) return res.status(404).json({error:'Sala no encontrada'});
    tickRoom(room);
    if(!room.lobby) room.lobby=new Map();
    const isMember=room.lobby.has(user.id);
    const isOwner=room.ownerId===user.id;
    if(!room.isPublic && !isMember && !isOwner){
      if(!code || code!==room.code) return res.status(403).json({error:'🔒 Sala privada: pedí el código al creador'});
    }
    if(getUserRoomId(user.id) && getUserRoomId(user.id)!==room.id) leaveRoomInternal(user.id);
    if(!room.lobby.has(user.id)){
      room.lobby.set(user.id,{userId:user.id,username:user.username,profilePic:user.profilePic||'',frame:user.equippedFrame||'none',skin:user.equipped||'default',nameColor:user.nameColor||'#ffffff',ready:false,lastSeen:Date.now()});
      room.chat.push({id:crypto.randomUUID(),userId:'sys',username:'SISTEMA',text:'👋 '+user.username+' se unió a la sala',createdAt:new Date().toISOString()});
    } else { room.lobby.get(user.id).lastSeen=Date.now(); }
    UserRoom.set(user.id,room.id);
    tickRoom(room);
    res.json({ok:true,room:{...roomCard(room),code:(room.ownerId===user.id&&!room.isPublic)?room.code:null,isOwner:room.ownerId===user.id}});
  }catch(e){ res.status(500).json({error:'join room error'}); }
});
app.put('/api/multi/room', async (req,res)=>{
  try{
    const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
    const room=findRoomOfUser(user.id);
    if(!room) return res.status(400).json({error:'No estás en ninguna sala'});
    if(room.ownerId!==user.id) return res.status(403).json({error:'Solo el creador puede cambiar la sala'});
    const {name,isPublic,mode}=req.body||{};
    if(name!==undefined){ const nm=String(name).trim().slice(0,30); if(nm.length<3) return res.status(400).json({error:'Nombre muy corto'}); room.name=nm; }
    if(mode!==undefined) room.mode=(mode==='speedrun')?'speedrun':'normal';
    if(isPublic!==undefined){
      const want=!!isPublic;
      if(want!==room.isPublic){
        room.isPublic=want;
        if(!want){ if(!room.code) room.code=makeRoomCode(); }
        else { room.code=null; }
        room.chat.push({id:crypto.randomUUID(),userId:'sys',username:'SISTEMA',text:want?'🌍 La sala ahora es PÚBLICA':'🔒 La sala ahora es PRIVADA',createdAt:new Date().toISOString()});
      }
    }
    tickRoom(room);
    res.json({ok:true,room:{...roomCard(room),code:(room.ownerId===user.id&&!room.isPublic)?room.code:null,isOwner:true}});
  }catch(e){ res.status(500).json({error:'update room error'}); }
});
app.get('/api/multi/state', async (req,res)=>{
  try{
    const user=await findUserByToken(req);
    tickAllRooms();
    const room=user?findRoomOfUser(user.id):null;
    if(room && user && room.lobby.has(user.id)) room.lobby.get(user.id).lastSeen=Date.now();
    if(!room){ res.set('Cache-Control','no-store'); return res.json({room:null,lobby:[],match:null,chat:[],me:user?user.id:null}); }
    const lobby=[...room.lobby.values()].map(p=>({userId:p.userId,username:p.username,profilePic:multiSlimPic(p.profilePic),hasPic:!!(p.profilePic&&p.profilePic.length>500),frame:p.frame,skin:p.skin||'default',nameColor:p.nameColor,ready:!!p.ready,online:true}));
    let match=null;
    if(room.match){
      const now=Date.now();
      const players=Object.values(room.match.players).map(p=>({userId:p.userId,username:p.username,profilePic:multiSlimPic(p.profilePic),hasPic:!!(p.profilePic&&p.profilePic.length>500),frame:p.frame,skin:p.skin||'default',nameColor:p.nameColor,alive:p.alive,lives:(p.lives==null?2:p.lives),wave:p.wave,enemies:(p.enemies||[]).map(e=>({id:e.id,cat:e.cat,q:e.q})),desc:p.desc,hits:p.hits,misses:p.misses,streak:p.streak,best:p.best,expWon:p.expWon||0,coinsWon:p.coinsWon||0,timeLeft:p.alive?Math.max(0,Math.ceil(multiWaveTime(p.wave)-(now-p.waveStart)/1000)):0,timeTotal:multiWaveTime(p.wave)}));
      if(room.match.shots) room.match.shots=room.match.shots.filter(s=>now-s.at<8000).slice(-20);
      match={id:room.match.id,status:room.match.status,winnerId:room.match.winnerId||null,players,shots:(room.match.shots||[]).slice(-15)};
    }
    const info={...roomCard(room),code:(user&&room.ownerId===user.id&&!room.isPublic)?room.code:null,isOwner:!!(user&&room.ownerId===user.id)};
    res.set('Cache-Control','no-store');
    res.json({room:info,lobby,match,chat:room.chat.slice(-20),me:user?user.id:null});
  }catch(e){ res.status(500).json({error:'multi state error'}); }
});
app.post('/api/multi/join', async (req,res)=>{
  return res.status(410).json({error:'Usá el buscador de salas: creá o unite a una sala'});
});
app.post('/api/multi/leave', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  leaveRoomInternal(user.id);
  tickAllRooms();
  res.json({ok:true});
});
app.post('/api/multi/ready', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  const room=findRoomOfUser(user.id);
  if(!room) return res.status(400).json({error:'Unite a una sala primero'});
  const {ready}=req.body||{};
  const p=room.lobby.get(user.id);
  if(!p) return res.status(400).json({error:'Únete al lobby primero'});
  p.ready=!!ready; p.lastSeen=Date.now();
  tickRoom(room);
  res.json({ok:true,ready:p.ready});
});
app.get('/api/multi/chat', async (req,res)=>{ tickAllRooms(); const user=await findUserByToken(req); const room=user?findRoomOfUser(user.id):null; res.json({messages:(room?room.chat:[]).slice(-30)}); });
app.post('/api/multi/chat', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  const room=findRoomOfUser(user.id);
  if(!room) return res.status(400).json({error:'Unite a una sala primero'});
  const {text}=req.body||{}; const t=String(text||'').trim(); if(!t) return res.status(400).json({error:'Mensaje vacío'});
  const isSt=t.startsWith('[sticker]');
  if(!isSt && t.length>300) return res.status(400).json({error:'Máx 300'});
  if(isSt && t.length>120) return res.status(400).json({error:'Sticker inválido'});
  const m={id:crypto.randomUUID(),userId:user.id,username:user.username,text:t.slice(0,300),createdAt:new Date().toISOString(),equippedBubble:user.equippedBubble||'none',nameColor:user.nameColor||'#ffffff'};
  room.chat.push(m); if(room.chat.length>100) room.chat=room.chat.slice(-100);
  res.json({message:m});
});
app.post('/api/multi/answer', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  const {text}=req.body||{}; const t=String(text||'').trim(); if(!t) return res.status(400).json({error:'Vacío'});
  const _room=findRoomOfUser(user.id);
  if(_room) tickRoom(_room); else tickAllRooms();
  const m=_room?_room.match:null;
  if(!m || m.status!=='playing') return res.status(400).json({error:'Sin partida'});
  const ps=m.players[user.id];
  if(!ps) return res.status(400).json({error:'No estás en la partida'});
  if(!ps.alive) return res.status(400).json({error:'Estás eliminado'});
  const now=Date.now();
  const norm=s=>s.trim().replace(/\s+/g,' ').toLowerCase();
  if(now-ps.waveStart>multiWaveTime(ps.wave)*1000){ ps.lives=(ps.lives==null?2:ps.lives)-1; ps.misses=(ps.misses||0)+1; ps.streak=0; if(ps.lives<=0) ps.alive=false; else ps.waveStart=now; if(_room) tickRoom(_room); return res.status(400).json({error:'¡Te alcanzaron! Pierdes 1 vida'}); }
  const idx=ps.enemies.findIndex(e=>norm(e.a)===norm(t));
  m.shots=m.shots||[];
  const pushShot=(hit,q)=>{ m.shots.push({id:crypto.randomUUID(),userId:user.id,hit:!!hit,q:q||null,at:Date.now()}); if(m.shots.length>30) m.shots=m.shots.slice(-30); };
  if(idx>=0){
    const killed=ps.enemies.splice(idx,1)[0];
    ps.hits++; ps.streak++; if(ps.streak>ps.best) ps.best=ps.streak;
    pushShot(true,killed.q);
    let waveUp=false;
    if(!ps.enemies.length){ ps.wave++; const en=multiPickEnemies(); ps.enemies=en; ps.waveStart=now; ps.desc=multiWaveDesc(ps.wave,en); waveUp=true; }
    if(_room) tickRoom(_room);
    return res.json({hit:true,killed:{cat:killed.cat,q:killed.q,a:killed.a},waveUp,wave:ps.wave,enemies:(ps.enemies||[]).map(e=>({id:e.id,cat:e.cat,q:e.q})),desc:ps.desc,hits:ps.hits,streak:ps.streak,lives:(ps.lives==null?2:ps.lives)});
  } else {
    ps.misses++; ps.streak=0; ps.lives=(ps.lives==null?2:ps.lives)-1;
    pushShot(false,null);
    if(ps.lives<=0){ ps.alive=false; if(_room) tickRoom(_room); return res.json({hit:false,misses:ps.misses,lives:0,dead:true}); }
    return res.json({hit:false,misses:ps.misses,lives:ps.lives});
  }
});

app.get('/api/achievements', async (req,res)=>{
 try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); res.json({achievements:ACHIEVEMENTS,owned:user.achievements||[]}); }catch(e){ res.status(500).json({error:'achievements error'}); }
});
app.get('/api/achievements/redeem', async (req,res)=>{
 try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const id=req.query.id; const ach=ACHIEVEMENTS.find(a=>a.id===id); if(!ach) return res.status(404).json({error:'Logro no existe'}); if(!user.achievements.includes(id)) return res.status(400).json({error:'No tienes este logro'}); if(id==='triple_champion'){ if(!user.frames.includes('universo')) user.frames.push('universo'); await pushNotification(user.id,'🌌 Marco Universo activado','¡Ya puedes equipar tu Marco Universo desde la tienda!','success'); } if(id==='speed_demon'){ if(!user.banners.includes('aurora')) user.banners.push('aurora'); await pushNotification(user.id,'🌠 Banner Aurora activado','¡Ya puedes equipar tu Banner Aurora desde la tienda!','success'); } if(id==='centurion'){ if(!user.fonts.includes('phantom')) user.fonts.push('phantom'); user.coins=(user.coins||0)+100000; await pushNotification(user.id,'👻 Letra Fantasma + 100.000 pts','¡Recompensa canjeada!','success'); } await updateUser(user); res.json({coins:user.coins,frames:user.frames,banners:user.banners,fonts:user.fonts}); }catch(e){ res.status(500).json({error:'redeem error'}); }
});
app.get('/api/lucky/pool', (req,res)=>{ res.json({items:LUCKY_ITEMS.map(i=>({id:i.id,type:i.type,name:i.name||'',rarity:i.rarity,amount:i.amount,bubbleId:i.bubbleId}))}); });
const LUCKY_PACKS={1:1000,5:3000,10:5000};
app.post('/api/lucky/spin', async (req,res)=>{
 try{ const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'}); ensureShopFields(user); const count=Number((req.body||{}).count)||1; if(!LUCKY_PACKS[count]) return res.status(400).json({error:'Pack inválido (1, 5 o 10 giros)'}); const cost=LUCKY_PACKS[count]; if((user.coins||0)<cost) return res.status(400).json({error:'Puntos insuficientes (necesitas '+cost+' pts)'}); user.coins-=cost; const items=[]; for(let k=0;k<count;k++){ const item=pickLuckyItem(); items.push(item); if(item.type==='coins'){ user.coins=(user.coins||0)+item.amount; } else if(item.type==='exp'){ user.exp=(user.exp||0)+item.amount; } else if(item.type==='bubble'){ if(!user.chatBubbles.includes(item.bubbleId)) user.chatBubbles.push(item.bubbleId); } } user.luckySpins=(user.luckySpins||0)+count; await updateUser(user); const summary=items.map(i=>(i.name||i.bubbleId||'?').replace(/_/g,' ')).join(', '); await pushNotification(user.id,'🎰 Lucky Coders x'+count,`Ganaste: ${summary}`,'success'); res.json({item:items[0],items,coins:user.coins,exp:user.exp,chatBubbles:user.chatBubbles,luckySpins:user.luckySpins,count,cost}); }catch(e){ res.status(500).json({error:'spin error'}); }
});
app.use((err,req,res,next)=>{ console.error('[server]',err.message||err); if(!res.headersSent) res.status(500).json({error:'Error interno del servidor'}); });
app.get('/api/status', async (req,res)=>{ try{ const users=await getAllUsers(); res.json({storage:USE_PG?'postgres':'json-temporal',users:users.length,time:new Date().toISOString()}); }catch(e){ res.status(500).json({error:'status error'}); } });
(async()=>{ await initPg(); try{ const _u=await getUserByUsername('guguslu'); if(_u){ const _t=15020; _u.speedrunBest=_t; if(!_u.speedrunHistory) _u.speedrunHistory=[]; if(!_u.speedrunHistory.some(h=>h.time===_t)) _u.speedrunHistory.push({time:_t,at:new Date().toISOString()}); await updateUser(_u); console.log(`[fix] guguslu speedrun forced ${_t}ms`); } }catch(e){ console.log('fix guguslu',e.message); } try{ const _p=await getUserByUsername('piza'); if(_p){ const _t2=12020; _p.speedrunBest=_t2; if(!_p.speedrunHistory) _p.speedrunHistory=[]; if(!_p.speedrunHistory.some(h=>h.time===_t2)) _p.speedrunHistory.push({time:_t2,at:new Date().toISOString()}); await updateUser(_p); console.log(`[fix] piza speedrun forced ${_t2}ms`); } }catch(e){ console.log('fix piza',e.message); } try{ const _e=await getUserByUsername('enzo'); if(_e && _e.frames && _e.frames.includes('campeon')){ _e.frames=_e.frames.filter(f=>f!=='campeon'); if(_e.equippedFrame==='campeon') _e.equippedFrame='none'; await updateUser(_e); console.log(`[fix] Removed campeon frame from enzo`); } }catch(e){ console.log('fix enzo campeon',e.message); } app.listen(PORT,()=>{ console.log(`👾 Code Invaders corriendo en http://localhost:${PORT} ${USE_PG?'[PG]':'[JSON]'}`); }); })();
