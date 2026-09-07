/* ============================================================
   ESQUIVA ACADÉMICA — Juego 2D de esquivar códigos
   El profesor lanza snippets de HTML/CSS/JS/Python y tú
   esquivas… o disparas correcciones para destruirlos.
   ============================================================ */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

/* ---------- CONFIGURACIÓN ---------- */
const CONFIG = {
  PLAYER_W: 147,
  PLAYER_H: 61,
  PLAYER_Y: H - 90,
  DESK_H: 22,
  PLAYER_SPEED: 390,
  SHOT_SPEED: 420,
  SHOT_COOLDOWN: 0.28,
  LIVES: 3,
  GRACE: 1.6,
  CODE_W: 72,
  CODE_H: 72,
  PROF_X: W / 2,
  PROF_Y: 70,
  BOSS_MAX_HEALTH: 30,
  BOSS_RADIUS: 51,
  BOSS_DODGE_SPEED: 170,
  /* Barras / libro */
  KNOWLEDGE_MAX: 100,
  KNOW_BASE: 8,         // puntos base al esquivar
  KNOW_KILL: 14,        // puntos base al destruir
  SIDE_OBSTACLE_W: 75,
  SIDE_OBSTACLE_H: 75,
  SIDE_MIN_INTERVAL: 2.6,  // segundos mínimos entre obstáculos laterales
  SIDE_WARN_TIME: 0.8      // segundos de anticipación visual
};

/* ---------- NIVELES (4: HTML, CSS, JS, BOSS) ---------- */
const LEVELS = [
  { name: 'HTML Básico',       types: ['html'],                 speed: 80,  rate: 1.6, target: 10, desc: 'Etiquetas <b>&lt;div&gt;</b>, <b>&lt;a&gt;</b>, <b>&lt;img&gt;</b>...<br>Esquiva o destruye.' },
  { name: 'CSS en caída',      types: ['html','css'],           speed: 92,  rate: 1.9, target: 12, desc: 'Propiedades <b>CSS</b> como <b>color</b>, <b>padding</b>, <b>flex</b>...<br>¡Más rápido!' },
  { name: 'JS Dinámico',       types: ['html','css','js'],      speed: 105, rate: 2.3, target: 14, desc: 'Funciones <b>JS</b>, callbacks y variables volando.<br>Cuidado.' },
  { name: 'BOSS FINAL',        types: ['html','css','js','py'], speed: 130, rate: 3.0, target: 1,  boss: true, desc: '¡Llegó el PROF. FROGGIO! 👑<br>Esquiva sus <b>etiquetas de cualquier lenguaje</b>.<br>Recoge objetos: <b>🛡️ escudo</b>, <b>🔫 balas</b> y <b>❓ preguntas</b>.<br>¡Responde bien y gana balas para atacarlo!' }
];

/* ---------- BANCA DE CÓDIGOS POR TIPO ---------- */
const CODE_SNIPPETS = {
  html: ['<div>','<span>','<p>','<h1>','<ul>','<li>','<section>','<article>','<form>','<button>','<a>','<img>'],
  css:  ['color','margin','padding','display','flex-direction','justify-content','align-items','font-size','border','background','position','transform'],
  js:   ['function()','const','let','=>','console.log()','addEventListener','querySelector','map()','filter()','Promise','async','await'],
  py:   ['def','print()','for','if','else','list','dict','import','class','lambda','return','range()']
};
const TYPE_COLOR = { html:'#e65100', css:'#1565c0', js:'#f9a825', py:'#2e7d32' };
const TYPE_LABEL = { html:'HTML', css:'CSS', js:'JS', py:'Python' };

/* ---------- BANCO DE PREGUNTAS ---------- */
/* Cada pregunta: category, difficulty(1-3), q, code?(opcional), options[4], answer(índice), explanation */
const QUESTIONS = [
  // HTML - básico
  { cat:'html', diff:1, q:['¿Qué etiqueta HTML se usa para crear un enlace?'], options:['<p>','<a>','<div>','<br>'], a:1, exp:'La etiqueta <a> (anchor) crea hipervínculos. Usa href="..." para la URL.' },
  { cat:'html', diff:1, q:['¿Cuál etiqueta HTML define el contenido principal de una página?'], options:['<header>','<nav>','<main>','<section>'], a:2, exp:'<main> envuelve el contenido principal único de la página.' },
  { cat:'html', diff:1, q:['¿Qué etiqueta usas para insertar una imagen?'], options:['<img>','<picture>','<figure>','<src>'], a:0, exp:'<img> con src="..." es la etiqueta estándar de imágenes.' },
  { cat:'html', diff:1, q:['¿Qué etiqueta HTML se usa para listas ordenadas?'], options:['<ul>','<ol>','<li>','<menu>'], a:1, exp:'<ol> crea listas ordenadas; <ul> listas no ordenadas; <li> es cada ítem.' },
  // CSS
  { cat:'css', diff:1, q:['¿Cuál propiedad CSS controla el espaciado interno (inside)?'], options:['margin','border','padding','gap'], a:2, exp:'padding añade espacio dentro del borde; margin crea espacio fuera.' },
  { cat:'css', diff:1, q:['¿Qué valor de display crea un cuadro flexible?'], options:['inline','block','flex','grid'], a:2, exp:'display: flex; activa el layout flexbox.' },
  { cat:'css', diff:2, q:['¿Qué propiedad CSS alinea elementos verticalmente en flexbox?'], options:['justify-content','align-items','align-content','flex-direction'], a:1, exp:'align-items controla el eje transversal (vertical en flex-direction: row).' },
  { cat:'css', diff:2, q:['¿Qué propiedad cambia el orden visual de un item flex?'], options:['order','flex','z-index','float'], a:0, exp:'order reordena items flex sin cambiar el DOM.' },
  // JS - básico
  { cat:'js', diff:1, q:['¿Qué palabra reservada se usa para declarar una constante?'], options:['let','var','const','static'], a:2, exp:'const declara una variable cuyo valor no se reassigna.' },
  { cat:'js', diff:1, q:['¿Cuál es el operador "estrictamente igual" en JavaScript?'], options:['==','===','!=','!=='], a:1, exp:'=== compara valor y tipo; == convierte tipos antes de comparar.' },
  { cat:'js', diff:2, q:['¿Qué imprime este código?'], code:'let x = 5;\nconsole.log(x);', options:['0','5','x','Error'], a:1, exp:'console.log(x) imprime el valor de x, que es 5.' },
  { cat:'js', diff:2, q:['¿Cuál es el resultado de "3" + 2 en JavaScript?'], options:['3','5','32','Error'], a:2, exp:'El + con un string convierte el número a string: "3"+2 = "32".' },
  { cat:'js', diff:3, q:['¿Qué imprime este código?'], code:'let a = 1;\nfunction foo() {\n  console.log(a);\n  let a = 2;\n}', options:['1','2','undefined','Error'], a:3, exp:'let tiene "temporal dead zone"; referenciar a antes de declarar lanza ReferenceError.' },
  // Python
  { cat:'py', diff:1, q:['¿Qué palabra clave define una función en Python?'], options:['func','function','def','lambda'], a:2, exp:'def crea funciones con nombre; lambda crea funciones anónimas.' },
  { cat:'py', diff:1, q:['¿Qué imprime este código?'], code:'x = 5\nprint(x)', options:['5','x','None','Error'], a:0, exp:'print(x) muestra el valor de x = 5.' },
  { cat:'py', diff:2, q:['¿Cuál es el resultado de 10 // 3 en Python?'], options:['3.33','3','3.0','4'], a:1, exp:'// es división entera: 10//3 = 3 (sin decimales).' },
  { cat:'py', diff:3, q:['¿Qué imprime este código?'], code:'def foo():\n    return\nprint(foo())', options:['None','0','""','Error'], a:0, exp:'return sin valor devuelve None; print(None) muestra "None".' },
  // Trampa
  { cat:'trampa', diff:1, q:['¿Qué ocurre al ejecutar este código?'], code:'let x = 10;\nif (x > 10) {\n  console.log("Correcto");\n}', options:['Imprime "Correcto"','No imprime nada','El programa se cierra','x cambia a 0'], a:1, exp:'El operador > es estricto: 10 no es mayor que 10, la condición es falsa.' },
  { cat:'trampa', diff:2, q:['¿Qué imprime este código?'], code:'var x = 1;\nfunction f() { console.log(x); var x = 2; }', options:['1','2','undefined','Error'], a:2, exp:'var se eleva pero no inicializa: x es undefined dentro de f() antes de la línea var x=2.' },
  { cat:'trampa', diff:2, q:['¿Qué ocurre en este CSS?'], code:'.a { color: red; }\n.a { color: blue; }', options:['Rojo','Azul','Rosa','Error'], a:1, exp:'La última regla gana: azul sobrescribe rojo (misma especificidad).' },
  { cat:'trampa', diff:3, q:['¿Qué imprime este código?'], code:'console.log([] + []);', options:['[]','""','0','null'], a:1, exp:'[] + [] concatena a strings: "" + "" = "". La respuesta es cadena vacía.' },
  { cat:'trampa', diff:3, q:['¿Qué imprime este código?'], code:'console.log(typeof NaN === "number");', options:['true','false','undefined','Error'], a:0, exp:'typeof NaN es "number", así que la comparación === "number" es true.' }
];

/* Categorías por dificultad para selección progresiva */
function questionsForLevel(lv) {
  const lvl = lv + 1;
  const easy = QUESTIONS.filter(q => q.diff <= 1);
  const medium = QUESTIONS.filter(q => q.diff <= 2);
  const hard = QUESTIONS.filter(q => q.diff <= 3);
  const traps = QUESTIONS.filter(q => q.cat === 'trampa');
  if (lvl <= 2) return easy;
  if (lvl <= 4) return [...easy, ...medium];
  if (lvl <= 6) return [...medium, ...hard];
  if (lvl <= 8) return [...medium, ...hard, ...traps];
  return [...hard, ...traps];
}

/* ---------- PREGUNTAS SORPRESA DEL JEFE ---------- */
const BOSS_QUIZ = [
  { q: 'HTML es un lenguaje de programación.', opts: ['Verdadero','Falso'], a: 1, exp: 'HTML es un lenguaje de MARCAS (marcado), no de programación.' },
  { q: 'CSS se usa para dar estilo y diseño a las páginas web.', opts: ['Verdadero','Falso'], a: 0, exp: '¡Correcto! CSS controla colores, tamaños, posiciones y más.' },
  { q: 'Python fue creado por Guido van Rossum.', opts: ['Verdadero','Falso'], a: 0, exp: '¡Sí! Python nació en 1991 con Guido como creador.' },
  { q: 'El símbolo // se usa para comentarios de una línea en JavaScript.', opts: ['Verdadero','Falso'], a: 0, exp: 'Correcto. En Python se usa # para comentarios.' },
  { q: 'Un bucle for sirve para repetir acciones varias veces.', opts: ['Verdadero','Falso'], a: 0, exp: 'Los bucles repiten un bloque mientras se cumpla la condición.' },
  { q: 'Las variables sirven para guardar datos.', opts: ['Verdadero','Falso'], a: 0, exp: 'Sí, guardan números, texto, listas y más.' },
  { q: '¿Qué significa programación?', opts: ['Dar instrucciones a la computadora','Jugar videojuegos','Diseñar logos','Redactar documentos'], a: 0, exp: 'Programar es escribir instrucciones que la computadora ejecuta.' },
  { q: '¿Cuál de estos es un lenguaje de etiquetas?', opts: ['HTML','Python','Java','C++'], a: 0, exp: 'HTML (HyperText Markup Language) es de marcado.' },
  { q: '¿Para qué sirve CSS?', opts: ['Dar estilo visual','Guardar datos','Hacer operaciones matemáticas','Conectar a internet'], a: 0, exp: 'CSS da color, layout y tipografía a las páginas.' },
  { q: '¿Qué imprime?  print("Hola")  en Python', opts: ['Hola','Error','Hola()','0'], a: 0, exp: 'print() muestra "Hola" en pantalla.' },
  { q: 'Git sirve para controlar versiones de código.', opts: ['Verdadero','Falso'], a: 0, exp: 'Git guarda el historial de cambios de un proyecto.' },
  { q: 'JavaScript y Java son exactamente el mismo lenguaje.', opts: ['Verdadero','Falso'], a: 1, exp: 'Son lenguajes distintos con propósitos diferentes.' },
  { q: '¿Qué lenguaje es conocido como el "lenguaje de la web"?', opts: ['JavaScript','SQL','Fortran','Ensamblador'], a: 0, exp: 'JavaScript corre en los navegadores para hacer webs interactivas.' }
];

/* ---------- UTILIDADES ---------- */
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/* ---------- ENTIDADES ---------- */

/* Jugador (pupil) */
class Player {
  constructor() {
    this.w = CONFIG.PLAYER_W;
    this.h = CONFIG.PLAYER_H;
    this.x = W / 2 - this.w / 2;
    this.y = CONFIG.PLAYER_Y;
    this.vx = 0;
    this.color = '#5d4037';
  }
  update(dt, keys) {
    const acc = 46;
    if (keys.left)  this.vx -= acc * dt;
    if (keys.right) this.vx += acc * dt;
    const target = (keys.left || keys.right) ? (keys.left ? -CONFIG.PLAYER_SPEED : CONFIG.PLAYER_SPEED) : 0;
    this.vx = lerp(this.vx, target, 0.18);
    this.x += this.vx * dt;
    const pad = 16;
    this.x = Math.max(pad, Math.min(W - this.w - pad, this.x));
  }
  render() {
    const px = this.x, py = this.y;
    ctx.fillStyle = this.color;
    ctx.fillRect(px, py + this.h * 0.55, this.w, this.h * 0.45);
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(px + 8, py + 8, this.w - 16, this.h * 0.38);
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath(); ctx.arc(px + this.w * 0.22, py + this.h * 0.28, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + this.w * 0.78, py + this.h * 0.28, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(px + 14, py + 14, this.w - 28, this.h * 0.26);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(px + 6, py + 40, this.w - 12, 10);
  }
}

/* Snippet de código (proyectil del profesor) */
class CodePiece {
  constructor(type, x, y) {
    this.type = type;
    this.color = TYPE_COLOR[type];
    this.label = TYPE_LABEL[type];
    this.snippet = CODE_SNIPPETS[type][randInt(0, CODE_SNIPPETS[type].length - 1)];
    this.x = x;
    this.y = y;
    this.w = CONFIG.CODE_W;
    this.h = CONFIG.CODE_H;
    this.vx = rand(-48, 48);
    this.vy = 0;
    this.rotation = rand(0, Math.PI * 2);
    this.spin = rand(0.4, 1.6) * (Math.random() < 0.5 ? 1 : -1);
  }
  update(dt, speed) {
    this.vy += speed * dt + 90 * dt;
    this.y += this.vy * dt;
    this.x += this.vx * dt;
    this.rotation += this.spin * dt;
  }
  offscreen() { return this.y > H + 50; }
  render() {
    const pulse = 1 + Math.sin(performance.now() / 300) * 0.04;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.rotation);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Segoe UI"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, -7);
    ctx.font = 'bold 9px "Courier New"';
    ctx.fillText(this.snippet.length > 10 ? this.snippet.slice(0, 9) + '…' : this.snippet, 0, 6);
    ctx.restore();
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ---------- OBSTÁCULO LATERAL ---------- */
class SideWarning {
  constructor(side, type) {
    this.side = side;               // 'left' | 'right'
    this.type = type;
    this.color = TYPE_COLOR[type];
    this.label = TYPE_LABEL[type];
    this.x = side === 'left' ? 12 : W - 12;
    this.time = CONFIG.SIDE_WARN_TIME;
    this.pulse = 0;
  }
  update(dt) {
    this.time -= dt;
    this.pulse += dt * 6;
  }
  expired() { return this.time <= 0; }
  render() {
    const y = CONFIG.PLAYER_Y + CONFIG.PLAYER_H * 0.3;
    const pulse = 1 + Math.sin(this.pulse) * 0.15;
    ctx.save();
    ctx.translate(this.x, y);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.4 + this.time / CONFIG.SIDE_WARN_TIME * 0.4;
    ctx.fillRect(-14, -14, 28, 28);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(this.label, 0, 4);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = this.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

class SideObstacle {
  constructor(side, type) {
    this.side = side;               // 'left' | 'right'
    this.type = type;
    this.color = TYPE_COLOR[type];
    this.label = TYPE_LABEL[type];
    this.snippet = CODE_SNIPPETS[type][randInt(0, CODE_SNIPPETS[type].length - 1)];
    this.w = CONFIG.SIDE_OBSTACLE_W + rand(-6, 6);
    this.h = CONFIG.SIDE_OBSTACLE_H + rand(-6, 6);
    this.x = side === 'left' ? -this.w - 20 : W + this.w + 20;
    this.y = rand(CONFIG.PLAYER_Y - 40, H - 180);
    const spd = rand(140, 210);
    this.vx = side === 'left' ? spd : -spd;
    this.vy = rand(-30, 30);
    this.rotation = rand(0, Math.PI * 2);
    this.spin = rand(0.5, 1.4) * (Math.random() < 0.5 ? 1 : -1);
  }
  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.spin * dt;
  }
  offscreen() { return this.x < -this.w - 40 || this.x > W + this.w + 40; }
  render() {
    const pulse = 1 + Math.sin(performance.now() / 300) * 0.06;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.rotation);
    ctx.scale(pulse, pulse);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, -this.w / 2, -this.h / 2, this.w, this.h, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 11px "Segoe UI"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.label, 0, -6);
    ctx.font = 'bold 8px "Courier New"';
    ctx.fillText(this.snippet.length > 8 ? this.snippet.slice(0, 7) + '…' : this.snippet, 0, 7);
    ctx.restore();
  }
}

/* Proyectil de corrección (fight-back) */
class Shot {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 18; this.h = 28;
    this.vx = rand(-30, 30);
    this.vy = -CONFIG.SHOT_SPEED;
    this.color = '#c8e6c9';
  }
  update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; }
  offscreen() { return this.y < -30; }
  render() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(this.w / 2, this.h); ctx.lineTo(-this.w / 2, this.h); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#4caf50'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#2e7d32'; ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', 0, 18);
    ctx.restore();
  }
}

/* Objeto misterioso del nivel JEFE */
class BossItem {
  constructor(kind) {
    this.kind = kind;          // 'shield' | 'bullets' | 'quiz'
    this.color = kind === 'shield' ? '#40c4ff' : kind === 'bullets' ? '#ffab00' : '#ffd54f';
    this.icon = kind === 'shield' ? '🛡️' : kind === 'bullets' ? '🔫' : '❓';
    this.label = kind === 'shield' ? 'ESCUDO' : kind === 'bullets' ? '+4 BALAS' : 'PREGUNTA';
    this.x = rand(70, W - 70);
    this.y = -50;
    this.vy = 95;
    this.w = 46;
    this.h = 46;
    this.bob = rand(0, Math.PI * 2);
  }
  update(dt) {
    this.y += this.vy * dt;
    this.bob += dt * 3.2;
  }
  offscreen() { return this.y > H + 60; }
  render() {
    ctx.save();
    const bobY = Math.sin(this.bob) * 6;
    ctx.translate(this.x, this.y + bobY);
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 30);
    glow.addColorStop(0, this.color + 'aa');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    ctx.font = '26px "Segoe UI"';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, 0, 2);
    ctx.restore();
    ctx.font = 'bold 9px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.color;
    ctx.fillText(this.label, this.x, this.y + bobY + 34);
  }
}

/* Partícula de efecto */
class Particle {
  constructor(x, y, color) {
    this.x = x; this.y = y;
    this.vx = rand(-80, 80); this.vy = rand(-120, -40);
    this.life = 0.6; this.color = color; this.s = rand(3, 7);
  }
  update(dt) { this.life -= dt; this.x += this.vx * dt; this.y += this.vy * dt; this.vy += 150 * dt; }
  render() {
    if (this.life > 0) { ctx.fillStyle = this.color; ctx.fillRect(this.x, this.y, this.s, this.s); }
  }
}

/* ---------- ESTADO DEL JUEGO ---------- */
const state = {
  mode: 'MENU',
  level: 0,
  lives: CONFIG.LIVES,
  score: 0,
  dodged: 0,
  destroyed: 0,
  combo: 0,
  levelProgress: 0,
  levelHandled: 0,
  player: new Player(),
  codes: [],
  shots: [],
  particles: [],
  lastShot: 0,
  spawnTimer: 0,
  grace: 0,
  profOffset: 0,
  profDir: 0.6,
  screenShake: 0,
  keys: {},
  bossPhase: false,
  showStartHint: true,
  bossHealth: 0,
  bossHitFlash: 0,
  /* Objetos del jefe */
  items: [],
  itemTimer: 0,
  ammo: 0,
  shield: 0,
  quizItem: null,
  quizLocked: false,
  playTime: 0,
  playFlush: 0,
  ammoWarn: 0,
  /* Obstáculos laterales */
  sideObstacles: [],
  sideWarnings: [],
  sideTimer: 0,
  /* Barra de conocimiento */
  knowledge: 0,
  multiplier: 1,
  multiplierTimer: 0,
  /* Libro interactivo */
  bookMode: 'IDLE',     // 'IDLE' | 'APPEARING' | 'OPEN' | 'CLOSING'
  bookTimer: 0,
  bookScale: 0,
  currentQuestion: null,
  bookAnswers: [],
  bookResult: null,
  bookResultTimer: 0
};

/* ---------- INPUT ---------- */
const KEY_MAP = { ArrowLeft: 'left', ArrowRight: 'right', KeyA: 'left', KeyD: 'right' };
window.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  // Si una ventana modal está abierta, no responder a teclas del juego
  const uiOpen = ['guiaOverlay', 'settingsOverlay', 'quizOverlay'].some(id => !document.getElementById(id).classList.contains('hidden'));
  if (uiOpen && state.mode !== 'PLAYING') {
    if (e.code === 'Escape') {
      ['guiaOverlay', 'settingsOverlay', 'quizOverlay'].forEach(id => document.getElementById(id).classList.add('hidden'));
    }
    return;
  }
  if (KEY_MAP[e.code]) state.keys[KEY_MAP[e.code]] = true;
  state.keys[e.code] = true;
  if (e.code === 'Space') { e.preventDefault(); handleShoot(); }
  if (e.code === 'Enter') {
    if (state.mode === 'MENU') startGame();
    else if (state.mode === 'INTRO') beginLevel();
    else if (state.mode === 'GAMEOVER' || state.mode === 'VICTORY') startGame();
  }
  if (e.code === 'KeyP') togglePause();
});
window.addEventListener('keyup', (e) => {
  if (KEY_MAP[e.code]) state.keys[KEY_MAP[e.code]] = false;
  state.keys[e.code] = false;
});

/* También soporte táctil: tocar para disparar / mover */
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const cx = touch.clientX - rect.left;
  if (cx < W / 2) { state.keys.left = true; } else { state.keys.right = true; }
  handleShoot();
}, { passive: false });
canvas.addEventListener('touchend', () => { state.keys.left = false; state.keys.right = false; });

function handleShoot() {
  if (state.mode !== 'PLAYING') return;
  if (state.lastShot > 0) return;
  if (state.bossPhase) {
    if (state.ammo <= 0) {
      if (!state.ammoWarn || state.ammoWarn <= 0) {
        state.ammoWarn = 1.2;
        Toast.info('🔫 ¡Necesitas balas! Recoge objetos o responde preguntas ❓', 1300);
      }
      return;
    }
    state.ammo--;
  }
  state.lastShot = CONFIG.SHOT_COOLDOWN;
  state.shots.push(new Shot(state.player.x + state.player.w / 2, state.player.y));
  updateHUD();
}
function togglePause() {
  if (state.mode === 'PLAYING') { state.mode = 'PAUSED'; Toast.info('⏸ Pausado', 1000); }
  else if (state.mode === 'PAUSED') { state.mode = 'PLAYING'; }
}

/* ---------- BOTONES HUD ---------- */
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('goLevelBtn').addEventListener('click', beginLevel);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('victoryRestartBtn').addEventListener('click', startGame);

/* ---------- FLUJO DE ESTADOS ---------- */
function startGame() {
  resetGameState();
  hideAllOverlays();
  ['guiaOverlay', 'settingsOverlay', 'quizOverlay'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  showLevelIntro(0);
}

function resetGameState() {
  state.player = new Player();
  state.codes = []; state.shots = []; state.particles = [];
  state.sideObstacles = []; state.sideWarnings = [];
  state.items = [];
  state.ammo = 0; state.shield = 0; state.itemTimer = 2.2;
  state.quizItem = null; state.quizLocked = false;
  state.playTime = 0; state.playFlush = 0;
  state.lives = CONFIG.LIVES; state.score = 0; state.dodged = 0; state.destroyed = 0;
  state.combo = 0; state.levelProgress = 0; state.levelHandled = 0;
  state.lastShot = 0; state.spawnTimer = 0; state.grace = CONFIG.GRACE;
  state.screenShake = 0; state.showStartHint = true;
  state.level = 0;
  state.knowledge = 0; state.multiplier = 1; state.multiplierTimer = 0;
  state.bookMode = 'IDLE'; state.bookTimer = 0; state.bookScale = 0;
  state.currentQuestion = null; state.bookAnswers = []; state.bookResult = null; state.bookResultTimer = 0;
  state.sideTimer = 0;
  updateHUD();
}

function hideAllOverlays() {
  document.getElementById('menuOverlay').classList.add('hidden');
  document.getElementById('levelOverlay').classList.add('hidden');
  document.getElementById('gameOverOverlay').classList.add('hidden');
  document.getElementById('victoryOverlay').classList.add('hidden');
}

function showLevelIntro(idx) {
  state.level = idx;
  const lv = LEVELS[idx];
  document.getElementById('levelTitle').textContent = `Nivel ${idx + 1} · ${lv.name}`;
  document.getElementById('levelDesc').innerHTML = lv.desc;
  document.getElementById('level').textContent = idx + 1;
  document.getElementById('levelProgress').value = 0;
  document.getElementById('levelTotal').textContent = LEVELS.length;
  document.getElementById('levelOverlay').classList.remove('hidden');
  state.mode = 'INTRO';
  state.levelProgress = 0; state.levelHandled = 0; state.combo = 0;
  state.lastShot = 0; state.spawnTimer = 0;
  updateHUD();
}

function beginLevel() {
  state.mode = 'PLAYING';
  state.codes = []; state.shots = []; state.particles = [];
  state.sideObstacles = []; state.sideWarnings = []; state.sideTimer = 0;
  state.items = [];
  state.ammo = 0;
  state.shield = 0;
  state.itemTimer = 2.2;
  state.quizItem = null;
  state.quizLocked = false;
  state.spawnTimer = 0; state.grace = 1.2;
  state.bossPhase = state.level === 3;
  state.bossHealth = state.bossPhase ? CONFIG.BOSS_MAX_HEALTH : 0;
  state.bossHitFlash = 0;
  state.profOffset = 0;
  document.getElementById('levelOverlay').classList.add('hidden');
  updateHUD();
}

function levelComplete() {
  state.mode = 'LEVEL_COMPLETE';
  state.score += 120 + state.level * 32;
  const msg = `¡Nivel ${state.level + 1} superado! (${state.dodged} esquivados, ${state.destroyed} destruidos)`;
  Toast.success(msg, 2200);
  if (state.level < 3 && typeof Profile !== 'undefined' && Profile.isLogged) {
    Profile.addExp(40, 40);
  }
  setTimeout(() => nextLevel(), 1700);
}

function nextLevel() {
  state.level++;
  if (state.level >= LEVELS.length) { victory(); return; }
  showLevelIntro(state.level);
}

function victory() {
  state.mode = 'VICTORY';
  document.getElementById('victoryOverlay').classList.remove('hidden');
  document.getElementById('finalScoreVictory').textContent = state.score;
  document.getElementById('victoryDesc').innerHTML =
    `<p class="muted">Esquivaste <b>${state.dodged}</b> códigos y destruiste <b>${state.destroyed}</b>. ¡Eres maestro!</p>`;
  Toast.success('¡COMPLETASTE LOS 4 NIVELES! 🎓', 3000);
}

function gameOver(reason) {
  state.mode = 'GAMEOVER';
  document.getElementById('gameOverOverlay').classList.remove('hidden');
  document.getElementById('gameOverText').textContent = reason;
  document.getElementById('finalScore').textContent = state.score;
  Toast.error(`Game Over · ${reason}`, 2400);
}

/* ---------- UPDATE ---------- */
function update(dt) {
  const lv = LEVELS[state.level];

  state.player.update(dt, state.keys);

  // Proyectiles propios
  for (let i = state.shots.length - 1; i >= 0; i--) {
    state.shots[i].update(dt);
    if (state.shots[i].offscreen()) state.shots.splice(i, 1);
  }

  // Spawn de códigos
  state.spawnTimer -= dt;
  state.lastShot = Math.max(0, state.lastShot - dt);
  state.ammoWarn = Math.max(0, (state.ammoWarn || 0) - dt);

  // Movimiento del profesor (niveles 3-4: JS y BOSS)
  if (state.level >= 2) {
    const speed = state.level >= 3 ? 2 : 1;
    state.profOffset += state.profDir * dt * 30 * speed;
    if (Math.abs(state.profOffset) > (state.level >= 3 ? 140 : 120)) state.profDir *= -1;
  }

  let spawnCount = 1;
  if (state.level >= 1) spawnCount = 2;
  if (state.level === 3) spawnCount = 3;

  // Jefe esquiva disparos del jugador
  if (state.bossPhase && state.bossHealth > 0) {
    let dangerDir = 0;
    state.shots.forEach(s => {
      const dx = s.x - (CONFIG.PROF_X + state.profOffset);
      if (Math.abs(dx) < 110 && s.y > 120 && s.y < H * 0.55) dangerDir += dx > 0 ? 1 : -1;
    });
    if (dangerDir !== 0) {
      state.profOffset += (dangerDir > 0 ? 1 : -1) * CONFIG.BOSS_DODGE_SPEED * dt;
      state.profOffset = Math.max(-170, Math.min(170, state.profOffset));
    }
  }

  if (state.spawnTimer <= 0) {
    for (let i = 0; i < spawnCount; i++) {
      const type = lv.types[randInt(0, lv.types.length - 1)];
      const centerX = CONFIG.PROF_X + state.profOffset;
      const spread = (spawnCount > 1) ? (i - (spawnCount - 1) / 2) * (state.bossPhase ? 90 : 75) : 0;
      // Códigos caen de todo el ancho según el nivel (imposible de campear)
      const wide = state.bossPhase
        ? 0
        : (state.level >= 2 ? 440 : state.level >= 1 ? 240 : 147);
      const spawnX = state.bossPhase
        ? rand(CONFIG.CODE_W + 16, W - CONFIG.CODE_W - 16)
        : centerX + spread + rand(-wide, wide);
      state.codes.push(new CodePiece(type, spawnX, CONFIG.PROF_Y));
    }
    state.spawnTimer = 0.9 / lv.rate;
  }

  // Actualizar códigos
  for (let i = state.codes.length - 1; i >= 0; i--) {
    const code = state.codes[i];
    code.update(dt, lv.speed);

    // Colisión con disparo
    let hit = false;
    for (let si = state.shots.length - 1; si >= 0; si--) {
      const s = state.shots[si];
      if (rectsOverlap(code.x, code.y, code.w, code.h, s.x - s.w / 2 - 4, s.y - 2, s.w + 8, s.h + 4)) {
        destroyCode(i);
        state.shots.splice(si, 1);
        hit = true;
        break;
      }
    }
    if (hit) continue;

    // Offscreen → esquivado
    if (code.offscreen()) {
      state.codes.splice(i, 1);
      registerDodge(code);
      continue;
    }

    // Colisión con jugador (hitbox reducida: torso del estudiante)
    const ph = 30, pw = 70, px = state.player.x + (state.player.w - pw) / 2, py = state.player.y + 16;
    if (state.grace <= 0 && rectsOverlap(code.x, code.y, code.w, code.h, px, py, pw, ph)) {
      hitPlayer();
      state.codes.splice(i, 1);
    }
  }

  // Jefe: los disparos del jugador le hacen daño
  if (state.bossPhase && state.bossHealth > 0) {
    const bossX = CONFIG.PROF_X + state.profOffset;
    const bossY = CONFIG.PROF_Y + 30;
    for (let si = state.shots.length - 1; si >= 0; si--) {
      const s = state.shots[si];
      const dist = Math.hypot(s.x - bossX, s.y - bossY);
      if (dist < CONFIG.BOSS_RADIUS + s.w) {
        state.shots.splice(si, 1);
        damageBoss(5);
        break;
      }
    }
    state.bossHitFlash = Math.max(0, state.bossHitFlash - dt);
  }

  // Objetos misteriosos del jefe
  if (state.bossPhase) {
    state.itemTimer -= dt;
    if (state.itemTimer <= 0 && state.levelHandled < 999) {
      spawnBossItem();
      state.itemTimer = rand(4.5, 7.5);
    }
    for (let i = state.items.length - 1; i >= 0; i--) {
      const item = state.items[i];
      item.update(dt);
      if (item.offscreen()) { state.items.splice(i, 1); continue; }
      const px = state.player.x, py = state.player.y;
      if (rectsOverlap(item.x - item.w / 2, item.y - item.h / 2, item.w, item.h, px, py + 10, state.player.w, state.player.h)) {
        collectBossItem(item);
        state.items.splice(i, 1);
      }
    }
    if (state.shield > 0) state.shield = Math.max(0, state.shield - dt);
  }

  // Partículas
  state.particles = state.particles.filter(p => p.life > 0);
  state.particles.forEach(p => p.update(dt));

  // Tiempo de juego jugado (para el perfil)
  state.playTime += dt;
  state.playFlush += dt;
  if (state.playFlush >= 10) {
    state.playFlush = 0;
    if (typeof Profile !== 'undefined' && Profile.addPlaytime) Profile.addPlaytime(10);
  }

  if (state.grace > 0) state.grace -= dt;
  state.screenShake = Math.max(0, state.screenShake - dt);
}

function registerDodge(code) {
  state.dodged++;
  state.score += 10 + state.combo * 3;
  state.combo = Math.min(state.combo + 1, 99);
  spawnParticles(code.x + code.w / 2, code.y, code.color, 4);
  state.levelHandled++;
  updateProgress();
  updateHUD();
}

function destroyCode(index) {
  const code = state.codes[index];
  state.codes.splice(index, 1);
  state.destroyed++;
  state.combo = Math.min(state.combo + 3, 99);
  state.score += 25 + state.combo * 4;
  spawnParticles(code.x + code.w / 2, code.y + code.h / 2, code.color, 9);
  state.levelHandled++;
  updateProgress();
  updateHUD();
}

function hitPlayer() {
  if (state.shield > 0) {
    state.shield = 0;
    state.screenShake = 0.2;
    spawnParticles(state.player.x + state.player.w / 2, state.player.y, '#40c4ff', 18);
    Toast.info('🛡️ ¡Tu escudo absorbió el golpe!');
    updateHUD();
    return;
  }
  state.lives--;
  state.combo = 0;
  state.screenShake = 0.45;
  spawnParticles(state.player.x + state.player.w / 2, state.player.y, '#ff5252', 16);
  updateHUD();
  if (state.lives <= 0) gameOver('Te derrotó el profesor con demasiados códigos. ¡Practica más!');
}

function damageBoss(amount) {
  state.bossHealth = Math.max(0, state.bossHealth - amount);
  state.bossHitFlash = 0.35;
  state.screenShake = 0.2;
  spawnParticles(CONFIG.PROF_X + state.profOffset, CONFIG.PROF_Y + 30, '#ff5252', 12);
  updateHUD();
  Toast.info('¡Le hiciste daño al profesor! ❤️ ' + state.bossHealth, 900);
  if (state.bossHealth <= 0) bossDefeated();
}

/* ---------- OBJETOS DEL JEFE ---------- */
function spawnBossItem() {
  const kinds = ['shield', 'bullets', 'quiz'];
  const kind = kinds[randInt(0, kinds.length - 1)];
  state.items.push(new BossItem(kind));
}

function collectBossItem(item) {
  spawnParticles(item.x, item.y, item.color, 10);
  if (item.kind === 'shield') {
    state.shield = 6;
    Toast.success('🛡️ ¡Escudo activado! Eres invulnerable 6s');
  } else if (item.kind === 'bullets') {
    state.ammo = Math.min(state.ammo + 4, 99);
    Toast.info('🔫 +4 balas para disparar');
  } else if (item.kind === 'quiz') {
    openBossQuiz();
  }
  updateHUD();
}

/* ---------- PREGUNTA SORPRESA (❓) ---------- */
function openBossQuiz() {
  if (state.quizLocked) return;
  state.quizLocked = true;
  state.mode = 'QUIZ';
  const q = BOSS_QUIZ[randInt(0, BOSS_QUIZ.length - 1)];
  state.quizItem = q;
  const overlay = document.getElementById('quizOverlay');
  document.getElementById('quizQuestion').textContent = q.q;
  const optionsBox = document.getElementById('quizOptions');
  optionsBox.innerHTML = '';
  q.opts.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = opt;
    btn.addEventListener('click', () => answerBossQuiz(idx, btn));
    optionsBox.appendChild(btn);
  });
  const fb = document.getElementById('quizFeedback');
  fb.classList.add('hidden');
  fb.textContent = '';
  const sub = document.getElementById('quizSub');
  sub.textContent = 'Responde correctamente y gana balas 💥';
  overlay.classList.remove('hidden');
}

function answerBossQuiz(idx, btn) {
  if (!state.quizItem) return;
  const q = state.quizItem;
  const opts = document.querySelectorAll('#quizOptions .quiz-option');
  opts.forEach(b => b.disabled = true);
  const fb = document.getElementById('quizFeedback');
  fb.classList.remove('hidden');
  const sub = document.getElementById('quizSub');
  if (idx === q.a) {
    btn.classList.add('correct');
    state.ammo = Math.min(state.ammo + 8, 99);
    fb.textContent = '✓ ¡Correcto! +8 balas 🔫 ' + q.exp;
    Toast.success('¡Respuesta correcta! +8 balas 🔫');
    sub.textContent = '¡Bien hecho! Recibes balas para disparar al profesor.';
  } else {
    btn.classList.add('wrong');
    fb.textContent = '✗ Incorrecto. ' + q.exp;
    sub.textContent = '¡Lee la explicación y sigue esquivando!';
  }
  updateHUD();
  setTimeout(() => {
    document.getElementById('quizOverlay').classList.add('hidden');
    state.quizItem = null;
    state.quizLocked = false;
    if (state.mode === 'QUIZ') state.mode = 'PLAYING';
    if (state.bossHealth <= 0) { /* al morir el jefe se maneja aparte */ }
  }, 2200);
}

/* ---------- RECOMPENSAS AL VENCER AL JEFE ---------- */
function bossDefeated() {
  state.mode = 'BOSS_DEFEATED';
  state.score += 600 + state.level * 50;
  spawnParticles(CONFIG.PROF_X + state.profOffset, CONFIG.PROF_Y + 30, '#ffeb3b', 40);
  Toast.success('¡DERROTASTE AL PROFESOR FROGGIO! 🐸👑', 2500);
  if (typeof Profile !== 'undefined' && Profile.isLogged) {
    Profile.addExp(200, 150);
  }
  setTimeout(() => victory(), 2000);
}

function spawnParticles(x, y, color, count) {
  for (let i = 0; i < count; i++) state.particles.push(new Particle(x, y, color));
}

function updateProgress() {
  const lv = LEVELS[state.level];
  state.levelProgress = Math.min(100, (state.levelHandled / lv.target) * 100);
  document.getElementById('levelProgress').value = state.levelProgress;
  // En el nivel del jefe no hay "objetivo de esquivar": se termina al derrotarlo.
  if (state.bossPhase) return;
  if (state.levelHandled >= lv.target) levelComplete();
}

/* ---------- RENDER ---------- */
function render() {
  drawBackground();
  drawProfessor();
  drawDeskStrip();

  state.particles.forEach(p => p.render());
  state.codes.forEach(c => c.render());
  state.shots.forEach(s => s.render());
  state.items.forEach(it => it.render());
  state.player.render();

  // Escudo del jugador
  if (state.shield > 0) {
    const px = state.player.x + state.player.w / 2, py = state.player.y + state.player.h / 2;
    ctx.strokeStyle = 'rgba(64,196,255,' + (0.4 + Math.sin(performance.now() / 200) * 0.3) + ')';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(px, py, 55, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(64,196,255,0.15)';
    ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(px, py, 70, 0, Math.PI * 2); ctx.stroke();
  }

  // Combo
  if (state.combo >= 4) {
    ctx.fillStyle = '#c8e6c9'; ctx.font = 'bold 24px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 COMBO x${state.combo}!`, W / 2, 170);
  }

  // Hint de inicio
  if (state.mode === 'MENU' && state.showStartHint) {
    drawStartHint();
  }
  // Pausa
  if (state.mode === 'PAUSED') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#c8e6c9'; ctx.font = 'bold 36px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.fillText('⏸ PAUSADO', W / 2, H / 2);
  }
}

function drawStartHint() {
  ctx.fillStyle = 'rgba(15,30,24,0.85)';
  ctx.fillRect(W / 2 - 260, H / 2 - 40, 520, 100);
  ctx.strokeStyle = var_green; ctx.lineWidth = 2;
  ctx.strokeRect(W / 2 - 260, H / 2 - 40, 520, 100);
  ctx.fillStyle = '#c8e6c9'; ctx.font = 'bold 15px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText('[ ← → ] Mover pupitre   |   [ ESPACIO ] Disparar corrección', W / 2, H / 2 - 4);
  ctx.fillText('ESQUIVA o DESTRUYE el código del profesor', W / 2, H / 2 + 18);
  ctx.fillStyle = '#81c784'; ctx.font = 'bold 13px "Segoe UI"';
    ctx.fillText('4 niveles: HTML, CSS, JS y el BOSS FINAL 👑', W / 2, H / 2 + 42);
}

const var_green = '#43a047';

function drawBackground() {
  ctx.fillStyle = '#0f1e18';
  ctx.fillRect(0, 0, W, H);
  // Gradiente pizarra
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#2a4233'); grad.addColorStop(1, '#0f1e18');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  // Líneas de pizarra
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.lineWidth = 1;
  for (let i = 0; i < 8; i++) {
    const y = 100 + i * 60;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Puntos de tiza
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 34; i++) {
    const x = rand(0, W), y = rand(100, H - 130);
    const r = rand(0.6, 1.8);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
}

function drawProfessor() {
  const px = CONFIG.PROF_X + state.profOffset;
  const py = CONFIG.PROF_Y;
  ctx.fillStyle = '#37474f';
  ctx.fillRect(px - 22, py + 30, 44, 50);
  ctx.fillStyle = '#3949ab';
  ctx.fillRect(px - 20, py + 34, 40, 22);
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(px - 30, py - 10, 60, 16);
  ctx.fillStyle = '#37474f';
  ctx.fillRect(px - 30, py + 6, 60, 10);
  ctx.fillStyle = '#ffcc80';
  ctx.beginPath(); ctx.arc(px, py + 14, 12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#263238'; ctx.lineWidth = 2;
  ctx.strokeRect(px - 8, py + 9, 6, 5); ctx.strokeRect(px + 2, py + 9, 6, 5);
  const t = performance.now() / 220;
  const armX = px + 22 + 16 * Math.cos(t * 2);
  const armY = py + 42 + 10 * Math.sin(t * 2);
  ctx.strokeStyle = '#37474f'; ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px + 22, py + 42); ctx.lineTo(armX, armY); ctx.stroke();
  ctx.fillStyle = (state.bossHitFlash > 0 && state.bossHitFlash < 0.25) ? '#ff5252' : '#c8e6c9';
  ctx.font = 'bold 13px "Segoe UI"';
  ctx.textAlign = 'center';
  ctx.fillText('PROF. FROGGIO', px, py - 20);
  ctx.fillStyle = '#ffab00'; ctx.font = 'bold 11px "Segoe UI"';
  if (state.bossPhase) {
    ctx.fillStyle = '#ff5252';
    ctx.fillText(`⚡ ¡DISPARA AL PROFESOR!`, px, py + 92);
  } else {
    ctx.fillStyle = '#ffab00';
    ctx.fillText('📢 ¡Toma esto!', px, py + 92);
  }
  /* Aura roja del jefe herido */
  if (state.bossPhase && state.bossHitFlash > 0) {
    ctx.strokeStyle = 'rgba(255,82,82,0.8)';
    ctx.lineWidth = 3 + state.bossHitFlash * 6;
    ctx.beginPath(); ctx.arc(px, py + 30, CONFIG.BOSS_RADIUS + 4 + state.bossHitFlash * 10, 0, Math.PI * 2); ctx.stroke();
  }
}

function drawDeskStrip() {
  const py = CONFIG.PLAYER_Y + CONFIG.PLAYER_H * 0.55;
  ctx.fillStyle = CONFIG.DESK;
  ctx.fillRect(0, py, W, CONFIG.DESK_H);
  ctx.fillStyle = '#332b1f';
  ctx.font = 'bold 15px "Courier New"'; ctx.textAlign = 'center';
  ctx.fillText('SELECT * FROM knowledge WHERE esquivar = true;', W / 2, py + 15);
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(0, py - 8, W, 6);
}

/* ---------- MAIN LOOP ---------- */
let lastTime = 0;
function gameLoop(timestamp) {
  let dt = lastTime ? (timestamp - lastTime) / 1000 : 0;
  dt = Math.min(Math.max(dt, 0), 0.035);
  lastTime = timestamp;

  if (state.screenShake > 0) {
    ctx.save();
    ctx.translate(rand(-2, 2) * state.screenShake * 14, rand(-2, 2) * state.screenShake * 14);
    if (state.mode === 'PLAYING') update(dt);
    render();
    ctx.restore();
  } else {
    if (state.mode === 'PLAYING') update(dt);
    render();
  }
  requestAnimationFrame(gameLoop);
}

/* ---------- HUD ---------- */
function updateHUD() {
  document.getElementById('lives').textContent = state.lives;
  document.getElementById('level').textContent = state.level + 1;
  document.getElementById('score').textContent = state.score;
  document.getElementById('dodged').textContent = state.dodged;
  document.getElementById('destroyed').textContent = state.destroyed;
  document.getElementById('levelProgress').value = state.levelProgress;

  const bossBar = document.getElementById('bossBar');
  const fill = document.getElementById('bossHealthFill');
  const text = document.getElementById('bossHealthText');
  if (state.bossPhase && state.bossHealth > 0) {
    bossBar.classList.remove('hidden');
    const pct = (state.bossHealth / CONFIG.BOSS_MAX_HEALTH) * 100;
    fill.style.width = pct + '%';
    text.textContent = `${state.bossHealth} / ${CONFIG.BOSS_MAX_HEALTH}`;
    fill.style.background = pct < 30 ? 'linear-gradient(90,#ff5252,#c62828)' : pct < 60 ? 'linear-gradient(90,#ff9800,#ff5252)' : 'linear-gradient(90,#4caf50,#ffeb3b)';
  } else {
    bossBar.classList.add('hidden');
  }

  // Ammo y escudo
  const ammoHud = document.getElementById('ammoHud');
  const shieldHud = document.getElementById('shieldHud');
  if (ammoHud) {
    ammoHud.classList.toggle('hidden', !state.bossPhase);
    document.getElementById('ammoCount').textContent = state.ammo;
  }
  if (shieldHud) {
    shieldHud.classList.toggle('hidden', !state.bossPhase || state.shield <= 0);
    document.getElementById('shieldTime').textContent = Math.ceil(state.shield);
  }
}

/* ---------- TOASTS ---------- */
const Toast = {
  container: null,
  init() {
    this.container = document.createElement('div');
    this.container.className = 'toasts';
    document.body.appendChild(this.container);
  },
  success(msg, duration = 1800) { this.show(msg, '#4caf50', duration); },
  info(msg, duration = 1800) { this.show(msg, '#2196f3', duration); },
  error(msg, duration = 2000) { this.show(msg, '#f44336', duration); },
  show(msg, color, duration) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    t.style.borderLeft = `4px solid ${color}`;
    t.style.setProperty('--toast-color', color);
    this.container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.remove(); }, duration);
  }
};
Toast.init();

/* arrancar el loop */
requestAnimationFrame(gameLoop);
