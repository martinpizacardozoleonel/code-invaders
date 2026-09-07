const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const LEVELS = require('./levels.js');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json({ limit: '6mb' }));
app.use(express.static(path.join(__dirname, 'public')));

/* ---------------- BASE DE DATOS (JSON) ---------------- */

function defaultDb() {
  return { users: [], sessions: [], notifications: [], tournaments: [] };
}

function loadDb() {
  if (!fs.existsSync(DB_FILE)) return defaultDb();
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return defaultDb();
  }
}

function saveDb(db) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

let db = loadDb();
if (!db.tournaments) db.tournaments = [];
db.users.forEach(ensureShopFields);
saveDb(db);

/* ---------------- SEGURIDAD ---------------- */

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function findUserByToken(req) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return null;
  const session = db.sessions.find((s) => s.token === token);
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) || null;
}

const SKINS = [
  { id:'default', name:'DEV Cyan', price:0, body:'#00e5ff', glow:'#00e5ff' },
  { id:'crimson', name:'Crimson Fury', price:120, body:'#ff1744', glow:'#ff5252' },
  { id:'gold', name:'Golden Nova', price:200, body:'#ffd600', glow:'#ffea00' },
  { id:'neon', name:'Neon Viper', price:300, body:'#00e676', glow:'#69f0ae' },
  { id:'violet', name:'Violet Storm', price:350, body:'#7c4dff', glow:'#b388ff' },
  { id:'pixel', name:'Pixel Phantom', price:500, body:'#ff6d00', glow:'#ff9e00' },
  { id:'tournament_silver', name:'🥈 Silver Ranked', price:0, body:'#c0c0c0', glow:'#e0e0e0', exclusive:true }
];

const FRAMES = [
  { id:'none',    name:'Sin marco',       price:0 },
  { id:'bronce',  name:'Marco Bronce',    price:200 },
  { id:'plata',   name:'Marco Plata',     price:400 },
  { id:'oro',     name:'Marco Oro',       price:700 },
  { id:'neon',    name:'Marco Neón',      price:1000 },
  { id:'diamante',name:'Marco Diamante',  price:1500 },
  { id:'campeon', name:'🏆 Marco Campeón (Animado)', price:0, animated:true, exclusive:true }
];

/* Niveles de EXP */
function levelFromExp(exp) {
  let lv = 1, left = Number(exp) || 0, need = 100;
  while (left >= need) { left -= need; lv++; need = 100 + (lv - 1) * 50; }
  return { level: lv, into: left, need };
}
function expForLevel(lv) { return 100 + (lv - 1) * 50; }

function formatSpeedrunMs(ms){
  const s=ms/1000, m=Math.floor(s/60), sec=Math.floor(s%60), cs=Math.floor((ms%1000)/10);
  return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0')+'.'+String(cs).padStart(2,'0');
}
function publicUser(u) {
  return {
    id: u.id, username: u.username, createdAt: u.createdAt, coins: u.coins||0,
    skins: u.skins||['default'], equipped: u.equipped||'default',
    profilePic: u.profilePic||'', theme: u.theme||'dark',
    hoursPlayed: Math.floor((u.hoursPlayed||0) / 3600),
    exp: u.exp||0, frames: u.frames||[], equippedFrame: u.equippedFrame||'none',
    speedrunBest: u.speedrunBest||null
  };
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

app.get('/favicon.ico', (req, res) => res.status(204).end());

/* ---------------- API: AUTH ---------------- */

app.post('/api/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
  if (String(username).length < 3) return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
  if (String(password).length < 4) return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
  if (db.users.some((u) => u.username === username)) return res.status(409).json({ error: 'Ese usuario ya existe' });

  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID(),
    username,
    salt,
    passwordHash: hashPassword(password, salt),
    progress: [],
    coins: 0,
    skins: ['default'],
    equipped: 'default',
    profilePic: '',
    theme: 'dark',
    hoursPlayed: 0,
    exp: 0,
    frames: ['none'],
    equippedFrame: 'none',
    speedrunBest: null,
    speedrunHistory: [],
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  const token = createToken();
  db.sessions.push({ token, userId: user.id });
  saveDb(db);

  pushNotification(user.id, 'Bienvenido a Code Invaders 👾', '¡Cuenta creada con éxito! Empieza a jugar en la sección Juego.', 'success');
  res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.users.find((u) => u.username === username);
  if (!user || user.passwordHash !== hashPassword(password, user.salt)) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }
  const token = createToken();
  db.sessions.push({ token, userId: user.id });
  saveDb(db);
  pushNotification(user.id, 'Sesión iniciada ✅', `Hola ${user.username}, ¡buen regreso!`, 'info');
  res.json({ token, user: publicUser(user) });
});

app.post('/api/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDb(db);
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const lv = levelFromExp(user.exp);
  res.json({ user: publicUser(user), progress: user.progress, coins: user.coins, skins: user.skins, equipped: user.equipped, expLevel: lv });
});

/* ---------------- API: PROGRESO ---------------- */

app.get('/api/progress', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ progress: user.progress });
});

app.put('/api/progress', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const { level, attempts, solved, coinsEarned } = req.body || {};
  if (!level) return res.status(400).json({ error: 'Falta el nivel' });
  let entry = user.progress.find((p) => p.level === level);
  if (!entry) {
    entry = { level, attempts: 0, solved: false, solvedAt: null };
    user.progress.push(entry);
  }
  entry.attempts += Number(attempts) || 1;
  if (solved && !entry.solved) {
    entry.solved = true;
    entry.solvedAt = new Date().toISOString();
    pushNotification(user.id, '¡Nivel completado! 🎉', `Completaste el nivel ${level}. ¡Sigue así!`, 'success');
  }
  if (Number(coinsEarned)) user.coins += Number(coinsEarned);
  saveDb(db);
  res.json({ progress: user.progress, coins: user.coins });
});

app.get('/api/leaderboard', (req, res) => {
  const board = db.users
    .map((u) => ({
      id: u.id,
      username: u.username,
      solved: u.progress.filter((p) => p.solved).length,
      attempts: u.progress.reduce((a, p) => a + p.attempts, 0),
      exp: u.exp || 0,
      hoursPlayed: u.hoursPlayed || 0,
      profilePic: u.profilePic || '',
      equippedFrame: u.equippedFrame || 'none',
      coins: u.coins || 0
    }))
    .sort((a, b) => b.solved - a.solved || a.attempts - b.attempts);
  res.json({ board });
});

app.get('/api/leaderboard/speedrun', (req, res) => {
  const board = db.users
    .filter((u) => u.speedrunBest != null)
    .map((u) => ({
      id: u.id,
      username: u.username,
      speedrunBest: u.speedrunBest,
      solved: u.progress.filter((p) => p.solved).length,
      exp: u.exp || 0,
      profilePic: u.profilePic || '',
      equippedFrame: u.equippedFrame || 'none',
      coins: u.coins || 0
    }))
    .sort((a, b) => a.speedrunBest - b.speedrunBest);
  res.json({ board });
});

app.post('/api/speedrun', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const { time } = req.body || {};
  const t = Number(time);
  if (!Number.isFinite(t) || t <= 0) return res.status(400).json({ error: 'Tiempo inválido' });
  if (t < 3000 || t > 600000) return res.status(400).json({ error: 'Tiempo fuera de rango' });
  const isNewBest = user.speedrunBest == null || t < user.speedrunBest;
  if (isNewBest) {
    user.speedrunBest = t;
    user.speedrunHistory.push({ time: t, at: new Date().toISOString() });
    if (user.speedrunHistory.length > 20) user.speedrunHistory = user.speedrunHistory.slice(-20);
    saveDb(db);
    pushNotification(user.id, '⚡ Nuevo récord Speedrun', `⏱ ${formatSpeedrunMs(t)} — ¡Nuevo mejor tiempo!`, 'success');
  }
  res.json({ speedrunBest: user.speedrunBest, isNewBest });
});

app.get('/api/user/:id', (req, res) => {
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({
    id: user.id,
    username: user.username,
    profilePic: user.profilePic || '',
    equippedFrame: user.equippedFrame || 'none',
    exp: user.exp || 0,
    hoursPlayed: user.hoursPlayed || 0,
    coins: user.coins || 0,
    solved: user.progress.filter((p) => p.solved).length,
    attempts: user.progress.reduce((a, p) => a + p.attempts, 0),
    createdAt: user.createdAt,
    speedrunBest: user.speedrunBest || null
  });
});

/* ---------------- API: NOTIFICACIONES ---------------- */

function pushNotification(userId, title, body, type) {
  db.notifications.push({ id: crypto.randomUUID(), userId, title, body, type, read: false, createdAt: new Date().toISOString() });
}

app.get('/api/notifications', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  const list = db.notifications.filter((n) => n.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications: list, unread: list.filter((n) => !n.read).length });
});

app.post('/api/notifications/read', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  const { id } = req.body || {};
  db.notifications.forEach((n) => {
    if (n.userId === user.id && (!id || n.id === id)) n.read = true;
  });
  saveDb(db);
  res.json({ ok: true });
});

app.get('/api/shop', (req,res)=>{ res.json({ skins: SKINS }); });
app.post('/api/shop/buy', (req,res)=>{
  const user=findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const { skinId } = req.body||{};
  const skin=SKINS.find(s=>s.id===skinId); if(!skin) return res.status(404).json({error:'Skin no existe'});
  if(user.skins.includes(skinId)) return res.status(400).json({error:'Ya tienes esta skin'});
  if(user.coins < skin.price) return res.status(400).json({error:'Puntos insuficientes'});
  user.coins -= skin.price; user.skins.push(skinId);
  saveDb(db); pushNotification(user.id, '¡Skin comprada! 🛒', `Desbloqueaste ${skin.name}`, 'success');
  res.json({ coins:user.coins, skins:user.skins });
});
app.post('/api/shop/equip', (req,res)=>{
  const user=findUserByToken(req); if(!user) return res.status(401).json({error:'No autenticado'});
  ensureShopFields(user);
  const { skinId } = req.body||{};
  if(!user.skins.includes(skinId)) return res.status(400).json({error:'No tienes esta skin'});
  user.equipped=skinId; saveDb(db);
  res.json({ equipped:user.equipped });
});

/* ---------------- API: AJUSTES / PERFIL ---------------- */

app.put('/api/settings', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const { username, theme, profilePic } = req.body || {};
  if (username !== undefined) {
    const name = String(username).trim();
    if (name.length < 3) return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres' });
    if (db.users.some(u => u.id !== user.id && u.username === name)) return res.status(409).json({ error: 'Ese nombre ya está en uso' });
    user.username = name;
  }
  if (theme === 'dark' || theme === 'light') user.theme = theme;
  if (profilePic !== undefined) user.profilePic = String(profilePic).slice(0, 3_500_000);
  saveDb(db);
  const lv = levelFromExp(user.exp);
  res.json({ user: publicUser(user), expLevel: lv });
});

app.post('/api/stats', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const { seconds = 0, exp = 0, coins = 0 } = req.body || {};
  user.hoursPlayed = (user.hoursPlayed || 0) + (Number(seconds) || 0);
  user.exp = (user.exp || 0) + (Number(exp) || 0);
  user.coins = (user.coins || 0) + (Number(coins) || 0);
  saveDb(db);
  const lv = levelFromExp(user.exp);
  res.json({ user: publicUser(user), expLevel: lv, expGained: Number(exp) || 0 });
});

/* ---------------- API: MARCOS DE PERFIL (tienda) ---------------- */

app.get('/api/frames', (req, res) => { res.json({ frames: FRAMES }); });

app.post('/api/frames/buy', (req, res) => {
  const user = findUserByToken(req); if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const { frameId } = req.body || {};
  const frame = FRAMES.find(f => f.id === frameId);
  if (!frame) return res.status(404).json({ error: 'El marco no existe' });
  if (user.frames.includes(frameId)) return res.status(400).json({ error: 'Ya tienes este marco' });
  if ((user.coins || 0) < frame.price) return res.status(400).json({ error: 'Puntos insuficientes' });
  user.coins -= frame.price;
  user.frames.push(frameId);
  saveDb(db);
  pushNotification(user.id, '¡Marco comprado! 🖼️', `Desbloqueaste ${frame.name}`, 'success');
  res.json({ coins: user.coins, frames: user.frames });
});

app.post('/api/frames/equip', (req, res) => {
  const user = findUserByToken(req); if (!user) return res.status(401).json({ error: 'No autenticado' });
  ensureShopFields(user);
  const { frameId } = req.body || {};
  if (!user.frames.includes(frameId)) return res.status(400).json({ error: 'No tienes este marco' });
  user.equippedFrame = frameId;
  saveDb(db);
  res.json({ equippedFrame: user.equippedFrame });
});

/* ---------------- API: PÚBLICA (demo de APIs externas) ---------------- */

app.get('/api/levels', (req, res) => {
  const user = findUserByToken(req);
  const solved = user ? user.progress.filter((p) => p.solved).map((p) => p.level) : [];
  res.json({ total: LEVELS.length, solved, levels: LEVELS });
});

/* ---------------- API: TORNEO RANKED ---------------- */

const TOURNAMENT_DURATION_DAYS = 7;
const TOURNAMENT_MIN_PLAYERS = 10;

function getActiveTournament() {
  return db.tournaments.find(t => t.status === 'active') || null;
}

function getPendingTournament() {
  return db.tournaments.find(t => t.status === 'pending') || null;
}

function startTournament() {
  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + TOURNAMENT_DURATION_DAYS);
  const tournament = {
    id: crypto.randomUUID(),
    startDate: now.toISOString(),
    endDate: endDate.toISOString(),
    status: 'active',
    results: {}
  };
  db.tournaments.push(tournament);
  saveDb(db);
  return tournament;
}

function endTournament(tournament) {
  const board = db.users
    .map(u => ({
      id: u.id,
      username: u.username,
      solved: u.progress.filter(p => p.solved).length,
      attempts: u.progress.reduce((a, p) => a + p.attempts, 0),
      exp: u.exp || 0
    }))
    .sort((a, b) => b.solved - a.solved || a.attempts - b.attempts);

  board.forEach((entry, i) => {
    tournament.results[entry.id] = { position: i + 1 };
  });

  const rewards = [
    { frame: 'campeon', ship: 'tournament_silver', coins: 100 },
    { frame: null, ship: 'tournament_silver', coins: 60 },
    { frame: null, ship: null, coins: 60 },
  ];

  board.forEach(entry => {
    const pos = tournament.results[entry.id].position;
    const user = db.users.find(u => u.id === entry.id);
    if (!user) return;
    ensureShopFields(user);

    let rewardText = '';
    if (pos === 1) {
      if (user.frames && !user.frames.includes('campeon')) user.frames.push('campeon');
      if (user.skins && !user.skins.includes('tournament_silver')) user.skins.push('tournament_silver');
      user.coins = (user.coins || 0) + 100;
      rewardText = '🏆 ¡Campeón! Marco Campeón Animado + Nave Silver Ranked + 100 puntos';
    } else if (pos === 2) {
      if (user.skins && !user.skins.includes('tournament_silver')) user.skins.push('tournament_silver');
      user.coins = (user.coins || 0) + 60;
      rewardText = '🥈 ¡Subcampeón! Nave Silver Ranked + 60 puntos';
    } else if (pos === 3) {
      user.coins = (user.coins || 0) + 60;
      rewardText = '🥉 ¡Tercer puesto! + 60 puntos';
    } else {
      user.coins = (user.coins || 0) + 40;
      rewardText = `🎯 Puesto #${pos}. + 40 puntos`;
    }

    pushNotification(user.id, '🏆 Torneo RANKED finalizado', `Quedaste en puesto #${pos}. ${rewardText}`, 'success');
  });

  tournament.status = 'finished';
  saveDb(db);
}

app.get('/api/tournament', (req, res) => {
  let tournament = getActiveTournament();
  if (!tournament) {
    tournament = getPendingTournament();
  }
  const playerCount = db.users.length;
  res.json({
    tournament: tournament ? {
      id: tournament.id,
      status: tournament.status,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      results: tournament.results
    } : null,
    playerCount,
    minPlayers: TOURNAMENT_MIN_PLAYERS,
    canStart: playerCount >= TOURNAMENT_MIN_PLAYERS
  });
});

app.post('/api/tournament/start', (req, res) => {
  const user = findUserByToken(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  if (getActiveTournament()) return res.status(400).json({ error: 'Ya hay un torneo activo' });
  if (db.users.length < TOURNAMENT_MIN_PLAYERS) return res.status(400).json({ error: `Se necesitan ${TOURNAMENT_MIN_PLAYERS} jugadores para empezar` });
  const tournament = startTournament();
  res.json({ tournament });
});

app.post('/api/tournament/check', (req, res) => {
  const active = getActiveTournament();
  if (active) {
    if (new Date(active.endDate) <= new Date()) {
      endTournament(active);
      return res.json({ ended: true });
    }
    return res.json({ active: true, endDate: active.endDate });
  }
  res.json({ active: false });
});

/* ---------------- SERVIDOR ---------------- */

app.listen(PORT, () => {
  console.log(`👾 Code Invaders corriendo en http://localhost:${PORT}`);
});
