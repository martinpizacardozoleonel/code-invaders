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
app.use(express.static(path.join(__dirname, 'public')));

const DATABASE_URL = process.env.DATABASE_URL;
let USE_PG = !!DATABASE_URL;
let pool = null;
if (USE_PG) {
  try {
    const { Pool } = require('pg');
    pool = new Pool({ connectionString: DATABASE_URL, ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } });
    console.log('📦 Usando PostgreSQL persistente');
  } catch(e) {
    console.log('⚠️ pg no instalado, usando archivo JSON. Instala con npm i pg');
    USE_PG = false;
  }
}
if (!USE_PG) console.log('📁 Usando archivo JSON local (efímero en Render free sin Postgres)');

function defaultDb(){ return { users: [], sessions: [], notifications: [], tournaments: [], chat: [] }; }
function loadDb(){ if(!fs.existsSync(DB_FILE)) return defaultDb(); try{ return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }catch(e){ return defaultDb(); } }
function saveDb(db){ if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR,{recursive:true}); fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2)); }
let fileDb = loadDb();
if(!fileDb.tournaments) fileDb.tournaments=[];
if(!fileDb.chat) fileDb.chat=[];
if(!fileDb.notifications) fileDb.notifications=[];
if(!fileDb.sessions) fileDb.sessions=[];
if(!fileDb.users) fileDb.users=[];

async function initPg(){
  if(!USE_PG) return;
  try{
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL, password_hash TEXT NOT NULL,
      progress TEXT NOT NULL DEFAULT '[]', coins INT NOT NULL DEFAULT 0, skins TEXT NOT NULL DEFAULT '["default"]',
      equipped TEXT NOT NULL DEFAULT 'default', profile_pic TEXT NOT NULL DEFAULT '', theme TEXT NOT NULL DEFAULT 'dark',
      hours_played INT NOT NULL DEFAULT 0, exp INT NOT NULL DEFAULT 0, frames TEXT NOT NULL DEFAULT '["none"]',
      equipped_frame TEXT NOT NULL DEFAULT 'none', speedrun_best INT, speedrun_history TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, title TEXT NOT NULL, body TEXT NOT NULL, type TEXT NOT NULL, read BOOLEAN NOT NULL DEFAULT false, created_at TEXT NOT NULL)`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tournaments (id TEXT PRIMARY KEY, status TEXT NOT NULL, start_date TEXT NOT NULL, end_date TEXT NOT NULL, results TEXT NOT NULL DEFAULT '{}')`);
    await pool.query(`CREATE TABLE IF NOT EXISTS chat_messages (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, username TEXT NOT NULL, text TEXT NOT NULL, created_at TEXT NOT NULL)`);
    console.log('✅ Tablas PG listas');
    const r = await pool.query('SELECT COUNT(*) FROM users');
    if(parseInt(r.rows[0].count)===0 && fileDb.users.length>0){
      console.log('📥 Migrando usuarios de db.json a Postgres...');
      for(const u of fileDb.users){ await pgUpsertUser(u); }
      for(const s of fileDb.sessions){ try{ await pool.query('INSERT INTO sessions(token,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[s.token,s.userId]); }catch(e){} }
      for(const n of fileDb.notifications){ try{ await pool.query('INSERT INTO notifications(id,user_id,title,body,type,read,created_at) VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING',[n.id,n.userId,n.title,n.body,n.type,n.read,n.createdAt]); }catch(e){} }
      for(const t of fileDb.tournaments){ try{ await pool.query('INSERT INTO tournaments(id,status,start_date,end_date,results) VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',[t.id,t.status,t.startDate,t.endDate,JSON.stringify(t.results||{})]); }catch(e){} }
    }
  }catch(e){ console.error('PG init error',e.message); USE_PG=false; }
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
}
fileDb.users.forEach(ensureShopFields);
if(!USE_PG) saveDb(fileDb);

function pgRowToUser(r){
  return {
    id:r.id, username:r.username, salt:r.salt, passwordHash:r.password_hash,
    progress: JSON.parse(r.progress||'[]'), coins:r.coins, skins: JSON.parse(r.skins||'["default"]'),
    equipped:r.equipped, profilePic:r.profile_pic||'', theme:r.theme||'dark',
    hoursPlayed:r.hours_played||0, exp:r.exp||0, frames: JSON.parse(r.frames||'["none"]'),
    equippedFrame:r.equipped_frame||'none', speedrunBest:r.speedrun_best, speedrunHistory: JSON.parse(r.speedrun_history||'[]'),
    createdAt:r.created_at
  };
}
async function pgUpsertUser(u){
  ensureShopFields(u);
  await pool.query(`INSERT INTO users(id,username,salt,password_hash,progress,coins,skins,equipped,profile_pic,theme,hours_played,exp,frames,equipped_frame,speedrun_best,speedrun_history,created_at)
  VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
  ON CONFLICT(id) DO UPDATE SET username=EXCLUDED.username, salt=EXCLUDED.salt, password_hash=EXCLUDED.password_hash, progress=EXCLUDED.progress, coins=EXCLUDED.coins, skins=EXCLUDED.skins, equipped=EXCLUDED.equipped, profile_pic=EXCLUDED.profile_pic, theme=EXCLUDED.theme, hours_played=EXCLUDED.hours_played, exp=EXCLUDED.exp, frames=EXCLUDED.frames, equipped_frame=EXCLUDED.equipped_frame, speedrun_best=EXCLUDED.speedrun_best, speedrun_history=EXCLUDED.speedrun_history`,
  [u.id,u.username,u.salt,u.passwordHash,JSON.stringify(u.progress||[]),u.coins||0,JSON.stringify(u.skins||['default']),u.equipped||'default',u.profilePic||'',u.theme||'dark',u.hoursPlayed||0,u.exp||0,JSON.stringify(u.frames||['none']),u.equippedFrame||'none',u.speedrunBest,JSON.stringify(u.speedrunHistory||[]),u.createdAt]);
}
async function getAllUsers(){
  if(USE_PG){ const r=await pool.query('SELECT * FROM users'); return r.rows.map(pgRowToUser); }
  return fileDb.users;
}
async function getUserById(id){
  if(USE_PG){ const r=await pool.query('SELECT * FROM users WHERE id=$1',[id]); return r.rows[0]?pgRowToUser(r.rows[0]):null; }
  return fileDb.users.find(u=>u.id===id)||null;
}
async function getUserByUsername(username){
  if(USE_PG){ const r=await pool.query('SELECT * FROM users WHERE username=$1',[username]); return r.rows[0]?pgRowToUser(r.rows[0]):null; }
  return fileDb.users.find(u=>u.username===username)||null;
}
async function createUser(u){
  if(USE_PG) await pgUpsertUser(u);
  else { fileDb.users.push(u); saveDb(fileDb); }
}
async function updateUser(u){
  if(USE_PG) await pgUpsertUser(u);
  else saveDb(fileDb);
}
async function deleteUser(id){
  if(USE_PG) await pool.query('DELETE FROM users WHERE id=$1',[id]);
  else { fileDb.users=fileDb.users.filter(u=>u.id!==id); fileDb.sessions=fileDb.sessions.filter(s=>s.userId!==id); fileDb.notifications=fileDb.notifications.filter(n=>n.userId!==id); saveDb(fileDb); }
}
async function getSessions(){ if(USE_PG){ const r=await pool.query('SELECT * FROM sessions'); return r.rows.map(x=>({token:x.token,userId:x.user_id})); } return fileDb.sessions; }
async function findSession(token){ if(USE_PG){ const r=await pool.query('SELECT * FROM sessions WHERE token=$1',[token]); return r.rows[0]?{token:r.rows[0].token,userId:r.rows[0].user_id}:null; } return fileDb.sessions.find(s=>s.token===token)||null; }
async function createSession(token,userId){ if(USE_PG) await pool.query('INSERT INTO sessions(token,user_id) VALUES($1,$2)',[token,userId]); else { fileDb.sessions.push({token,userId}); saveDb(fileDb); } }
async function deleteSession(token){ if(USE_PG) await pool.query('DELETE FROM sessions WHERE token=$1',[token]); else { fileDb.sessions=fileDb.sessions.filter(s=>s.token!==token); saveDb(fileDb); } }
async function deleteSessionsByUser(userId){ if(USE_PG) await pool.query('DELETE FROM sessions WHERE user_id=$1',[userId]); else { fileDb.sessions=fileDb.sessions.filter(s=>s.userId!==userId); saveDb(fileDb); } }
async function getNotifications(userId){
  if(USE_PG){ const r=await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC',[userId]); return r.rows.map(x=>({id:x.id,userId:x.user_id,title:x.title,body:x.body,type:x.type,read:x.read,createdAt:x.created_at})); }
  return fileDb.notifications.filter(n=>n.userId===userId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
async function pushNotification(userId,title,body,type){
  const n={id:crypto.randomUUID(),userId,title,body,type,read:false,createdAt:new Date().toISOString()};
  if(USE_PG) await pool.query('INSERT INTO notifications(id,user_id,title,body,type,read,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[n.id,n.userId,n.title,n.body,n.type,n.read,n.createdAt]);
  else { fileDb.notifications.push(n); saveDb(fileDb); }
}
async function markNotifications(userId,id){
  if(USE_PG){ if(id) await pool.query('UPDATE notifications SET read=true WHERE user_id=$1 AND id=$2',[userId,id]); else await pool.query('UPDATE notifications SET read=true WHERE user_id=$1',[userId]); }
  else { fileDb.notifications.forEach(n=>{ if(n.userId===userId && (!id||n.id===id)) n.read=true; }); saveDb(fileDb); }
}
async function getTournaments(){
  if(USE_PG){ const r=await pool.query('SELECT * FROM tournaments'); return r.rows.map(x=>({id:x.id,status:x.status,startDate:x.start_date,endDate:x.end_date,results:JSON.parse(x.results||'{}')})); }
  return fileDb.tournaments;
}
async function createTournament(t){
  if(USE_PG) await pool.query('INSERT INTO tournaments(id,status,start_date,end_date,results) VALUES($1,$2,$3,$4,$5)',[t.id,t.status,t.startDate,t.endDate,JSON.stringify(t.results||{})]);
  else { fileDb.tournaments.push(t); saveDb(fileDb); }
}
async function updateTournament(t){
  if(USE_PG) await pool.query('UPDATE tournaments SET status=$1, results=$2 WHERE id=$3',[t.status,JSON.stringify(t.results||{}),t.id]);
  else saveDb(fileDb);
}
async function getChat(limit=100){
  if(USE_PG){ const r=await pool.query('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT $1',[limit]); return r.rows.map(x=>({id:x.id,userId:x.user_id,username:x.username,text:x.text,createdAt:x.created_at})).reverse(); }
  return (fileDb.chat||[]).slice(-limit);
}
async function addChat(msg){
  if(USE_PG) await pool.query('INSERT INTO chat_messages(id,user_id,username,text,created_at) VALUES($1,$2,$3,$4,$5)',[msg.id,msg.userId,msg.username,msg.text,msg.createdAt]);
  else { fileDb.chat.push(msg); if(fileDb.chat.length>500) fileDb.chat=fileDb.chat.slice(-500); saveDb(fileDb); }
}
async function deleteChatByUser(userId){
  if(USE_PG) await pool.query('DELETE FROM chat_messages WHERE user_id=$1',[userId]);
  else { fileDb.chat=(fileDb.chat||[]).filter(c=>c.userId!==userId); saveDb(fileDb); }
}

function hashPassword(password,salt){ return crypto.scryptSync(password,salt,64).toString('hex'); }
function createToken(){ return crypto.randomBytes(32).toString('hex'); }
async function findUserByToken(req){
  const token=(req.headers.authorization||'').replace('Bearer ','');
  if(!token) return null;
  const session=await findSession(token);
  if(!session) return null;
  return await getUserById(session.userId);
}

const SKINS=[
  { id:'default', name:'DEV Cyan', price:0, body:'#00e5ff', glow:'#00e5ff' },
  { id:'crimson', name:'Crimson Fury', price:120, body:'#ff1744', glow:'#ff5252' },
  { id:'gold', name:'Golden Nova', price:200, body:'#ffd600', glow:'#ffea00' },
  { id:'neon', name:'Neon Viper', price:300, body:'#00e676', glow:'#69f0ae' },
  { id:'violet', name:'Violet Storm', price:350, body:'#7c4dff', glow:'#b388ff' },
  { id:'pixel', name:'Pixel Phantom', price:500, body:'#ff6d00', glow:'#ff9e00' },
  { id:'tournament_silver', name:'🥈 Silver Ranked', price:0, body:'#c0c0c0', glow:'#e0e0e0', exclusive:true }
];
const FRAMES=[
  { id:'none',    name:'Sin marco',       price:0 },
  { id:'bronce',  name:'Marco Bronce',    price:200 },
  { id:'plata',   name:'Marco Plata',     price:400 },
  { id:'oro',     name:'Marco Oro',       price:700 },
  { id:'neon',    name:'Marco Neón',      price:1000 },
  { id:'diamante',name:'Marco Diamante',  price:1500 },
  { id:'campeon', name:'🏆 Marco Campeón (Animado)', price:0, animated:true, exclusive:true }
];
function levelFromExp(exp){ let lv=1,left=Number(exp)||0,need=100; while(left>=need){ left-=need; lv++; need=100+(lv-1)*50; } return {level:lv,into:left,need}; }
function formatSpeedrunMs(ms){ const s=ms/1000,m=Math.floor(s/60),sec=Math.floor(s%60),cs=Math.floor((ms%1000)/10); return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs).padStart(2,'0'); }
function publicUser(u){ return { id:u.id, username:u.username, createdAt:u.createdAt, coins:u.coins||0, skins:u.skins||['default'], equipped:u.equipped||'default', profilePic:u.profilePic||'', theme:u.theme||'dark', hoursPlayed: Math.floor((u.hoursPlayed||0)/3600), exp:u.exp||0, frames:u.frames||[], equippedFrame:u.equippedFrame||'none', speedrunBest:u.speedrunBest||null }; }

app.get('/favicon.ico',(req,res)=>res.status(204).end());

app.post('/api/register', async (req,res)=>{
  const {username,password}=req.body||{};
  if(!username||!password) return res.status(400).json({error:'Usuario y contraseña son obligatorios'});
  if(String(username).length<3) return res.status(400).json({error:'El usuario debe tener al menos 3 caracteres'});
  if(String(password).length<4) return res.status(400).json({error:'La contraseña debe tener al menos 4 caracteres'});
  if(await getUserByUsername(username)) return res.status(409).json({error:'Ese usuario ya existe'});
  const salt=crypto.randomBytes(16).toString('hex');
  const user={ id:crypto.randomUUID(), username, salt, passwordHash:hashPassword(password,salt), progress:[], coins:0, skins:['default'], equipped:'default', profilePic:'', theme:'dark', hoursPlayed:0, exp:0, frames:['none'], equippedFrame:'none', speedrunBest:null, speedrunHistory:[], createdAt:new Date().toISOString() };
  await createUser(user);
  const token=createToken();
  await createSession(token,user.id);
  await pushNotification(user.id,'Bienvenido a Code Invaders 👾','¡Cuenta creada con éxito! Empieza a jugar en la sección Juego.','success');
  res.status(201).json({token,user:publicUser(user)});
});
app.post('/api/login', async (req,res)=>{
  const {username,password}=req.body||{};
  const user=await getUserByUsername(username);
  if(!user || user.passwordHash!==hashPassword(password,user.salt)) return res.status(401).json({error:'Usuario o contraseña incorrectos'});
  const token=createToken();
  await createSession(token,user.id);
  await pushNotification(user.id,'Sesión iniciada ✅',`Hola ${user.username}, ¡buen regreso!`,'info');
  res.json({token,user:publicUser(user)});
});
app.post('/api/logout', async (req,res)=>{
  const token=(req.headers.authorization||'').replace('Bearer ','');
  if(token) await deleteSession(token);
  res.json({ok:true});
});
app.get('/api/me', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const lv=levelFromExp(user.exp);
  res.json({user:publicUser(user),progress:user.progress,coins:user.coins,skins:user.skins,equipped:user.equipped,expLevel:lv});
});
app.get('/api/progress', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  res.json({progress:user.progress});
});
app.put('/api/progress', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {level,attempts,solved,coinsEarned}=req.body||{};
  if(!level) return res.status(400).json({error:'Falta el nivel'});
  let entry=user.progress.find(p=>p.level===level);
  if(!entry){ entry={level,attempts:0,solved:false,solvedAt:null}; user.progress.push(entry); }
  entry.attempts+=Number(attempts)||1;
  if(solved && !entry.solved){ entry.solved=true; entry.solvedAt=new Date().toISOString(); await pushNotification(user.id,'¡Nivel completado! 🎉',`Completaste el nivel ${level}. ¡Sigue así!`,'success'); }
  if(Number(coinsEarned)) user.coins+=Number(coinsEarned);
  await updateUser(user);
  res.json({progress:user.progress,coins:user.coins});
});
app.get('/api/leaderboard', async (req,res)=>{
  const users=await getAllUsers();
  const board=users.map(u=>({id:u.id,username:u.username,solved:u.progress.filter(p=>p.solved).length,attempts:u.progress.reduce((a,p)=>a+p.attempts,0),exp:u.exp||0,hoursPlayed:u.hoursPlayed||0,profilePic:u.profilePic||'',equippedFrame:u.equippedFrame||'none',coins:u.coins||0})).sort((a,b)=>b.solved-a.solved||a.attempts-b.attempts);
  res.json({board});
});
app.get('/api/leaderboard/speedrun', async (req,res)=>{
  const users=await getAllUsers();
  const board=users.filter(u=>u.speedrunBest!=null).map(u=>({id:u.id,username:u.username,speedrunBest:u.speedrunBest,solved:u.progress.filter(p=>p.solved).length,exp:u.exp||0,profilePic:u.profilePic||'',equippedFrame:u.equippedFrame||'none',coins:u.coins||0})).sort((a,b)=>a.speedrunBest-b.speedrunBest);
  res.json({board});
});
app.post('/api/speedrun', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {time}=req.body||{}; const t=Number(time);
  if(!Number.isFinite(t)||t<=0) return res.status(400).json({error:'Tiempo inválido'});
  if(t<3000||t>600000) return res.status(400).json({error:'Tiempo fuera de rango'});
  const isNewBest=user.speedrunBest==null||t<user.speedrunBest;
  if(isNewBest){ user.speedrunBest=t; user.speedrunHistory.push({time:t,at:new Date().toISOString()}); if(user.speedrunHistory.length>20) user.speedrunHistory=user.speedrunHistory.slice(-20); await updateUser(user); await pushNotification(user.id,'⚡ Nuevo récord Speedrun',`⏱ ${formatSpeedrunMs(t)} — ¡Nuevo mejor tiempo!`,'success'); }
  res.json({speedrunBest:user.speedrunBest,isNewBest});
});
app.get('/api/user/:id', async (req,res)=>{
  const user=await getUserById(req.params.id);
  if(!user) return res.status(404).json({error:'Usuario no encontrado'});
  res.json({id:user.id,username:user.username,profilePic:user.profilePic||'',equippedFrame:user.equippedFrame||'none',exp:user.exp||0,hoursPlayed:user.hoursPlayed||0,coins:user.coins||0,solved:user.progress.filter(p=>p.solved).length,attempts:user.progress.reduce((a,p)=>a+p.attempts,0),createdAt:user.createdAt,speedrunBest:user.speedrunBest||null});
});
app.get('/api/notifications', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  const list=await getNotifications(user.id);
  res.json({notifications:list,unread:list.filter(n=>!n.read).length});
});
app.post('/api/notifications/read', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  const {id}=req.body||{};
  await markNotifications(user.id,id);
  res.json({ok:true});
});
app.get('/api/shop',(req,res)=>{ res.json({skins:SKINS}); });
app.post('/api/shop/buy', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {skinId}=req.body||{}; const skin=SKINS.find(s=>s.id===skinId); if(!skin) return res.status(404).json({error:'Skin no existe'});
  if(user.skins.includes(skinId)) return res.status(400).json({error:'Ya tienes esta skin'});
  if(user.coins<skin.price) return res.status(400).json({error:'Puntos insuficientes'});
  user.coins-=skin.price; user.skins.push(skinId);
  await updateUser(user); await pushNotification(user.id,'¡Skin comprada! 🛒',`Desbloqueaste ${skin.name}`,'success');
  res.json({coins:user.coins,skins:user.skins});
});
app.post('/api/shop/equip', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {skinId}=req.body||{};
  if(!user.skins.includes(skinId)) return res.status(400).json({error:'No tienes esta skin'});
  user.equipped=skinId; await updateUser(user);
  res.json({equipped:user.equipped});
});
app.delete('/api/account', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  const userId=user.id;
  await deleteUser(userId);
  await deleteSessionsByUser(userId);
  if(USE_PG) await pool.query('DELETE FROM notifications WHERE user_id=$1',[userId]);
  else { fileDb.notifications=fileDb.notifications.filter(n=>n.userId!==userId); saveDb(fileDb); }
  await deleteChatByUser(userId);
  const tours=await getTournaments();
  for(const t of tours){ if(t.results && t.results[userId]){ delete t.results[userId]; await updateTournament(t); } }
  res.json({ok:true});
});
app.put('/api/settings', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {username,theme,profilePic}=req.body||{};
  if(username!==undefined){
    const name=String(username).trim();
    if(name.length<3) return res.status(400).json({error:'El nombre debe tener al menos 3 caracteres'});
    const all=await getAllUsers();
    if(all.some(u=>u.id!==user.id && u.username===name)) return res.status(409).json({error:'Ese nombre ya está en uso'});
    user.username=name;
  }
  if(theme==='dark'||theme==='light') user.theme=theme;
  if(profilePic!==undefined) user.profilePic=String(profilePic).slice(0,3_500_000);
  await updateUser(user);
  const lv=levelFromExp(user.exp);
  res.json({user:publicUser(user),expLevel:lv});
});
app.post('/api/stats', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {seconds=0,exp=0,coins=0}=req.body||{};
  user.hoursPlayed=(user.hoursPlayed||0)+(Number(seconds)||0);
  user.exp=(user.exp||0)+(Number(exp)||0);
  user.coins=(user.coins||0)+(Number(coins)||0);
  await updateUser(user);
  const lv=levelFromExp(user.exp);
  res.json({user:publicUser(user),expLevel:lv,expGained:Number(exp)||0});
});
app.get('/api/frames',(req,res)=>{ res.json({frames:FRAMES}); });
app.post('/api/frames/buy', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {frameId}=req.body||{}; const frame=FRAMES.find(f=>f.id===frameId);
  if(!frame) return res.status(404).json({error:'El marco no existe'});
  if(user.frames.includes(frameId)) return res.status(400).json({error:'Ya tienes este marco'});
  if((user.coins||0)<frame.price) return res.status(400).json({error:'Puntos insuficientes'});
  user.coins-=frame.price; user.frames.push(frameId);
  await updateUser(user); await pushNotification(user.id,'¡Marco comprado! 🖼️',`Desbloqueaste ${frame.name}`,'success');
  res.json({coins:user.coins,frames:user.frames});
});
app.post('/api/frames/equip', async (req,res)=>{
  const user=await findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const {frameId}=req.body||{};
  if(!user.frames.includes(frameId)) return res.status(400).json({error:'No tienes este marco'});
  user.equippedFrame=frameId; await updateUser(user);
  res.json({equippedFrame:user.equippedFrame});
});
app.get('/api/levels', async (req,res)=>{
  const user=await findUserByToken(req);
  const solved=user?user.progress.filter(p=>p.solved).map(p=>p.level):[];
  res.json({total:LEVELS.length,solved,levels:LEVELS});
});

/* ---------------- API: CHAT ---------------- */
app.get('/api/chat', async (req,res)=>{
  const msgs=await getChat(100);
  res.json({messages:msgs});
});
app.post('/api/chat', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'Debes iniciar sesión para chatear'});
  const {text}=req.body||{};
  const t=String(text||'').trim();
  if(!t) return res.status(400).json({error:'Mensaje vacío'});
  if(t.length>500) return res.status(400).json({error:'Mensaje muy largo (máx 500)'});
  const msg={id:crypto.randomUUID(),userId:user.id,username:user.username,text:t.slice(0,500),createdAt:new Date().toISOString()};
  await addChat(msg);
  res.json({message:msg});
});
app.delete('/api/chat/:id', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  const id=req.params.id;
  if(USE_PG){
    const r=await pool.query('SELECT * FROM chat_messages WHERE id=$1',[id]);
    if(!r.rows[0]) return res.status(404).json({error:'Mensaje no encontrado'});
    if(r.rows[0].user_id!==user.id) return res.status(403).json({error:'No puedes borrar mensajes ajenos'});
    await pool.query('DELETE FROM chat_messages WHERE id=$1',[id]);
  } else {
    const m=(fileDb.chat||[]).find(c=>c.id===id);
    if(!m) return res.status(404).json({error:'Mensaje no encontrado'});
    if(m.userId!==user.id) return res.status(403).json({error:'No puedes borrar mensajes ajenos'});
    fileDb.chat=fileDb.chat.filter(c=>c.id!==id); saveDb(fileDb);
  }
  res.json({ok:true});
});

/* ---------------- API: TORNEO RANKED ---------------- */
const TOURNAMENT_DURATION_DAYS=7;
const TOURNAMENT_MIN_PLAYERS=10;
async function getActiveTournament(){ const tours=await getTournaments(); return tours.find(t=>t.status==='active')||null; }
async function getPendingTournament(){ const tours=await getTournaments(); return tours.find(t=>t.status==='pending')||null; }
async function startTournament(){
  const now=new Date(); const endDate=new Date(now); endDate.setDate(endDate.getDate()+TOURNAMENT_DURATION_DAYS);
  const tournament={id:crypto.randomUUID(),startDate:now.toISOString(),endDate:endDate.toISOString(),status:'active',results:{}};
  await createTournament(tournament); return tournament;
}
async function endTournament(tournament){
  const users=await getAllUsers();
  const board=users.map(u=>({id:u.id,username:u.username,solved:u.progress.filter(p=>p.solved).length,attempts:u.progress.reduce((a,p)=>a+p.attempts,0),exp:u.exp||0})).sort((a,b)=>b.solved-a.solved||a.attempts-b.attempts);
  board.forEach((entry,i)=>{ tournament.results[entry.id]={position:i+1}; });
  for(const entry of board){
    const pos=tournament.results[entry.id].position;
    const user=await getUserById(entry.id); if(!user) continue;
    ensureShopFields(user);
    let rewardText='';
    if(pos===1){ if(user.frames && !user.frames.includes('campeon')) user.frames.push('campeon'); if(user.skins && !user.skins.includes('tournament_silver')) user.skins.push('tournament_silver'); user.coins=(user.coins||0)+100; rewardText='🏆 ¡Campeón! Marco Campeón Animado + Nave Silver Ranked + 100 puntos'; }
    else if(pos===2){ if(user.skins && !user.skins.includes('tournament_silver')) user.skins.push('tournament_silver'); user.coins=(user.coins||0)+60; rewardText='🥈 ¡Subcampeón! Nave Silver Ranked + 60 puntos'; }
    else if(pos===3){ user.coins=(user.coins||0)+60; rewardText='🥉 ¡Tercer puesto! + 60 puntos'; }
    else { user.coins=(user.coins||0)+40; rewardText=`🎯 Puesto #${pos}. + 40 puntos`; }
    await updateUser(user);
    await pushNotification(user.id,'🏆 Torneo RANKED finalizado',`Quedaste en puesto #${pos}. ${rewardText}`,'success');
  }
  tournament.status='finished'; await updateTournament(tournament);
}
app.get('/api/tournament', async (req,res)=>{
  let tournament=await getActiveTournament();
  if(!tournament) tournament=await getPendingTournament();
  const users=await getAllUsers();
  const playerCount=users.length;
  res.json({tournament: tournament?{id:tournament.id,status:tournament.status,startDate:tournament.startDate,endDate:tournament.endDate,results:tournament.results}:null, playerCount, minPlayers:TOURNAMENT_MIN_PLAYERS, canStart: playerCount>=TOURNAMENT_MIN_PLAYERS});
});
app.post('/api/tournament/start', async (req,res)=>{
  const user=await findUserByToken(req);
  if(!user) return res.status(401).json({error:'No autenticado'});
  if(await getActiveTournament()) return res.status(400).json({error:'Ya hay un torneo activo'});
  const users=await getAllUsers();
  if(users.length<TOURNAMENT_MIN_PLAYERS) return res.status(400).json({error:`Se necesitan ${TOURNAMENT_MIN_PLAYERS} jugadores para empezar`});
  const tournament=await startTournament();
  res.json({tournament});
});
app.post('/api/tournament/check', async (req,res)=>{
  const active=await getActiveTournament();
  if(active){ if(new Date(active.endDate)<=new Date()){ await endTournament(active); return res.json({ended:true}); } return res.json({active:true,endDate:active.endDate}); }
  res.json({active:false});
});

(async()=>{ await initPg(); app.listen(PORT,()=>{ console.log(`👾 Code Invaders corriendo en http://localhost:${PORT} ${USE_PG?'[PG]':'[JSON]'}`); }); })();
