const Dodge = (() => {
  const CONFIG = {
    PLAYER_W: 147, PLAYER_H: 61, PLAYER_SPEED: 340,
    CODE_W: 72, CODE_H: 72, CODE_FALL_SPEED: 260,
    BOSS_RADIUS: 51, BOSS_Y: 100, BOSS_MAX_HEALTH: 30,
    SHOT_COOLDOWN: 0.28, SHOT_SPEED: 650, SHOT_SIZE: 14,
    PROF_Y: 90, PROF_SPEED: 65, PROF_OFFSET: 140,
    SIDE_OBSTACLE: 75, SIDE_SPEED: 5,
  };

  const LEVELS = [
    { name: 'HTML Básico', types: ['html'], speed: 190, rate: 1.6, target: 10, desc: 'Etiquetas HTML básicas.<br>Esquiva o destruye <b>10 etiquetas</b>.' },
    { name: 'CSS en caída', types: ['css', 'html'], speed: 230, rate: 1.4, target: 12, desc: 'Etiquetas CSS y HTML.<br>Esquiva o destruye <b>12 etiquetas</b>.' },
    { name: 'JS Dinámico', types: ['js', 'css', 'html'], speed: 265, rate: 1.25, target: 14, desc: 'JavaScript, CSS y HTML.<br>Esquiva o destruye <b>14 etiquetas</b>.' },
    { name: 'BOSS FINAL', types: ['html', 'css', 'js', 'py'], speed: 130, rate: 3.0, target: 1, boss: true,
      desc: '¡Llegó el PROF. FROGGIO! 🐸<br>Esquiva sus <b>etiquetas de cualquier lenguaje</b>.<br>Recoge objetos: <b>🛡️ escudo</b>, <b>🔫 balas</b> y <b>❓ preguntas</b>.<br>¡Responde bien y gana balas para atacarlo!' }
  ];

  const TAG_DEFS = [
    { tag: '<h1>', type: 'html', color: '#e44d26' }, { tag: '<p>', type: 'html', color: '#e44d26' },
    { tag: '<a>', type: 'html', color: '#e44d26' }, { tag: '<img>', type: 'html', color: '#e44d26' },
    { tag: '<ul>', type: 'html', color: '#e44d26' }, { tag: '<li>', type: 'html', color: '#e44d26' },
    { tag: '<div>', type: 'html', color: '#e44d26' }, { tag: '<span>', type: 'html', color: '#e44d26' },
    { tag: '<form>', type: 'html', color: '#e44d26' }, { tag: '<table>', type: 'html', color: '#e44d26' },
    { tag: '.class', type: 'css', color: '#264de4' }, { tag: '#id', type: 'css', color: '#264de4' },
    { tag: 'margin', type: 'css', color: '#264de4' }, { tag: 'padding', type: 'css', color: '#264de4' },
    { tag: 'display', type: 'css', color: '#264de4' }, { tag: 'flexbox', type: 'css', color: '#264de4' },
    { tag: ':hover', type: 'css', color: '#264de4' }, { tag: '@media', type: 'css', color: '#264de4' },
    { tag: 'var', type: 'js', color: '#f0db4f' }, { tag: 'let', type: 'js', color: '#f0db4f' },
    { tag: 'const', type: 'js', color: '#f0db4f' }, { tag: '=>', type: 'js', color: '#f0db4f' },
    { tag: 'async', type: 'js', color: '#f0db4f' }, { tag: 'fetch()', type: 'js', color: '#f0db4f' },
    { tag: 'map()', type: 'js', color: '#f0db4f' }, { tag: 'filter()', type: 'js', color: '#f0db4f' },
    { tag: 'for', type: 'js', color: '#f0db4f' }, { tag: 'if', type: 'js', color: '#f0db4f' },
    { tag: 'def', type: 'py', color: '#3572A5' }, { tag: 'print()', type: 'py', color: '#3572A5' },
    { tag: 'import', type: 'py', color: '#3572A5' }, { tag: 'class', type: 'py', color: '#3572A5' },
    { tag: 'self', type: 'py', color: '#3572A5' }, { tag: 'lambda', type: 'py', color: '#3572A5' },
  ];

  const BOSS_QUIZ = [
    { q: '¿Qué es una etiqueta HTML?', tipo: 'vf', options: ['Un elemento que define la estructura de una página web', 'Un tipo de variable en JavaScript'], a: 0, exp: 'Las etiquetas HTML son los bloques de construcción de páginas web.' },
    { q: '¿JavaScript y Java son lo mismo?', tipo: 'vf', options: ['No, son lenguajes completamente diferentes', 'Sí, son el mismo lenguaje'], a: 0, exp: 'Aunque comparten nombre, son lenguajes muy diferentes.' },
    { q: '¿Qué hace CSS?', tipo: 'vf', options: ['Define el estilo y apariencia de una página', 'Programa la lógica del servidor'], a: 0, exp: 'CSS controla colores, fuentes, layouts y más.' },
    { q: '¿Cuál es la etiqueta para crear un enlace?', tipo: 'op', options: ['<link>', '<a>', '<href>', '<url>'], a: 1, exp: 'La etiqueta <a> (anchor) crea enlaces en HTML.' },
    { q: '¿Qué significa CSS?', tipo: 'op', options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], a: 1, exp: 'CSS = Cascading Style Sheets (Hojas de Estilo en Cascada).' },
    { q: '¿Qué es programación?', tipo: 'vf', options: ['Dar instrucciones a una computadora para que realice tareas', 'Dibujar imágenes en pantalla'], a: 0, exp: 'Programar es escribir código que una computadora puede ejecutar.' },
    { q: '¿Qué lenguaje usa "def" para definir funciones?', tipo: 'op', options: ['JavaScript', 'Java', 'Python', 'C++'], a: 2, exp: 'Python usa "def" para definir funciones: def mi_funcion():' },
    { q: '¿Qué es una variable?', tipo: 'vf', options: ['Un contenedor que guarda datos', 'Un tipo de bucle'], a: 0, exp: 'Las variables almacenan datos como números, texto, etc.' },
    { q: '¿Qué operador compara valores y tipo en JS?', tipo: 'op', options: ['==', '=', '===', '!='], a: 2, exp: '=== compara valor Y tipo (igualdad estricta).' },
    { q: '¿Qué es un array?', tipo: 'vf', options: ['Una colección ordenada de elementos', 'Una función matemática'], a: 0, exp: 'Un array guarda múltiples valores en una variable: [1, 2, 3].' },
    { q: '¿Cuál es la función de "console.log()"?', tipo: 'op', options: ['Borrar la consola', 'Mostrar información en la consola', 'Crear una variable', 'Cerrar el navegador'], a: 1, exp: 'console.log() imprime valores para depurar código.' },
    { q: '¿Qué es un framework?', tipo: 'vf', options: ['Una estructura que facilita el desarrollo', 'Un tipo de virus informático'], a: 0, exp: 'Frameworks como React, Angular facilitan crear aplicaciones.' },
    { q: '¿Python es un lenguaje de programación?', tipo: 'vf', options: ['Sí, es popular para IA y ciencia de datos', 'No, solo sirve para dibujar'], a: 0, exp: 'Python es uno de los lenguajes más populares del mundo.' },
  ];

  let canvas, ctx, W, H;
  let state, level, score, lives;
  let player, keys, codes, particles, shots;
  let bossHealth, bossPhase, professor;
  let spawnTimer, codeTimer, itemTimer;
  let ammo, shield, shieldTimer;
  let quizItem, quizLocked;
  let items, playTime, playFlush, ammoWarn;
  let ProfX, levelHandled, levelPause;
  let frameId;
  let dodgeActive = false;

  function init() {
    canvas = document.getElementById('dodgeCanvas');
    if (!canvas) return;
    canvas.width = 1200;
    canvas.height = 825;
    ctx = canvas.getContext('2d');
    W = 1200;
    H = 825;

    keys = {};
    document.addEventListener('keydown', e => {
      if (!dodgeActive) return;
      keys[e.key] = true;
      if (state === 'PLAYING' && e.key === ' ') e.preventDefault();
    });
    document.addEventListener('keyup', e => { keys[e.key] = false; });

    const startBtn = document.getElementById('dodgeStartBtn');
    if (startBtn) startBtn.addEventListener('click', startGame);

    showBtns();
    requestAnimationFrame(loop);
  }

  function showBtns() {
    const btns = document.getElementById('dodgeBtns');
    const startBtn = document.getElementById('dodgeStartBtn');
    if (btns) btns.classList.remove('hidden');
    if (startBtn) startBtn.classList.remove('hidden');
  }

  function hideBtns() {
    const startBtn = document.getElementById('dodgeStartBtn');
    if (startBtn) startBtn.classList.add('hidden');
  }

  function startGame() {
    hideBtns();
    dodgeActive = true;
    score = 0;
    lives = 3;
    level = 0;
    items = [];
    playTime = 0;
    playFlush = 0;
    beginLevel();
  }

  function beginLevel() {
    const L = LEVELS[level];
    state = 'PLAYING';
    bossPhase = !!L.boss;
    bossHealth = bossPhase ? CONFIG.BOSS_MAX_HEALTH : 0;
    ammo = bossPhase ? 0 : 0;
    shield = 0;
    shieldTimer = 0;
    items = [];
    itemTimer = 0;
    quizItem = null;
    quizLocked = false;
    ammoWarn = 0;
    levelHandled = 0;
    levelPause = 0;
    codes = [];
    shots = [];
    particles = [];
    spawnTimer = 0;
    codeTimer = 0;
    player = { x: W / 2, y: H - 110, w: CONFIG.PLAYER_W, h: CONFIG.PLAYER_H, speed: CONFIG.PLAYER_SPEED };
    professor = { x: W / 2, y: CONFIG.PROF_Y, dir: 1 };
    ProfX = W / 2;
    document.getElementById('dodgeLevelVal').textContent = level + 1;
    document.getElementById('dodgeLevelTotal').textContent = LEVELS.length;
    updateHud();
  }

  function resetGameState() {
    codes = [];
    shots = [];
    particles = [];
    items = [];
    spawnTimer = 0;
    codeTimer = 0;
    itemTimer = 0;
    ammo = 0;
    shield = 0;
    shieldTimer = 0;
    quizItem = null;
    quizLocked = false;
    ammoWarn = 0;
  }

  function loop(ts) {
    if (dodgeActive && state) {
      update(ts);
      render();
      updateHud();
    }
    frameId = requestAnimationFrame(loop);
  }

  function update(ts) {
    const dt = 1 / 60;
    if (state === 'PLAYING') {
      handlePlayerMovement(dt);
      handleShooting(dt);
      updateCodes(dt);
      updateShots(dt);
      updateParticles(dt);
      if (bossPhase) {
        updateProfessor(dt);
        updateItems(dt);
        if (shield > 0) { shieldTimer -= dt; if (shieldTimer <= 0) shield = 0; }
      }
      playTime += dt;
      playFlush += dt;
      if (playFlush >= 10) { if (typeof Profile !== 'undefined') Profile.addPlaytime(10); playFlush = 0; }
      if (ammoWarn > 0) ammoWarn -= dt;
    }
    if (state === 'LEVEL_COMPLETE') {
      levelPause -= dt;
      if (levelPause <= 0) {
        if (level >= LEVELS.length - 1) {
          state = 'VICTORY';
        } else {
          level++;
          beginLevel();
        }
      }
    }
    if (state === 'GAMEOVER') {
      levelPause -= dt;
      if (levelPause <= 0) {
        state = 'MENU';
        showBtns();
      }
    }
  }

  function handlePlayerMovement(dt) {
    const moveLeft = keys['ArrowLeft'] || keys['a'];
    const moveRight = keys['ArrowRight'] || keys['d'];
    if (moveLeft) player.x -= player.speed * dt;
    if (moveRight) player.x += player.speed * dt;
    player.x = Math.max(player.w / 2, Math.min(W - player.w / 2, player.x));
  }

  function handleShooting(dt) {
    if (bossPhase && ammo <= 0) {
      if ((keys[' '] || keys['ArrowUp']) && ammoWarn <= 0) {
        showToast('¡Necesitas balas! Recoge 🔫');
        ammoWarn = 1.2;
      }
      return;
    }
    if ((keys[' '] || keys['ArrowUp']) && (Date.now() / 1000 - (player.lastShot || 0)) >= CONFIG.SHOT_COOLDOWN) {
      player.lastShot = Date.now() / 1000;
      shots.push({ x: player.x, y: player.y - player.h / 2, speed: CONFIG.SHOT_SPEED, size: CONFIG.SHOT_SIZE });
      if (bossPhase) ammo--;
      playSound('laser');
    }
  }

  function updateCodes(dt) {
    const L = LEVELS[level];
    codeTimer += dt;
    const interval = 1 / L.rate;
    while (codeTimer >= interval) {
      codeTimer -= interval;
      spawnCode();
    }
    for (let i = codes.length - 1; i >= 0; i--) {
      const c = codes[i];
      c.y += c.speed * dt;
      c.rot += c.rotSpeed * dt;
      if (checkCodeCollision(c)) {
        hitPlayer();
        codes.splice(i, 1);
        continue;
      }
      if (c.y > H + 60) {
        levelHandled++;
        codes.splice(i, 1);
        if (levelHandled >= L.target && !bossPhase) {
          state = 'LEVEL_COMPLETE';
          levelPause = 2.5;
          if (typeof Profile !== 'undefined') Profile.addExp(40, 40);
          showToast(`¡Nivel ${level + 1} completado! +40 EXP`);
        }
      }
    }
  }

  function spawnCode() {
    const L = LEVELS[level];
    const type = L.types[Math.floor(Math.random() * L.types.length)];
    const available = TAG_DEFS.filter(t => L.types.includes(t.type));
    const tag = available[Math.floor(Math.random() * available.length)];
    const wide = level >= 2 ? 440 : level >= 1 ? 240 : 147;
    const x = (W / 2) + (Math.random() - 0.5) * wide * 2;
    codes.push({
      x, y: -40, w: CONFIG.CODE_W, h: CONFIG.CODE_H,
      speed: L.speed + Math.random() * 40,
      rot: 0, rotSpeed: (Math.random() - 0.5) * 2,
      tag: tag.tag, color: tag.color, type: tag.type,
      glow: 0
    });
  }

  function checkCodeCollision(c) {
    const px = player.x - player.w / 2;
    const py = player.y - player.h / 2;
    const cx = c.x - c.w / 2;
    const cy = c.y - c.h / 2;
    return px < cx + c.w && px + player.w > cx && py < cy + c.h && py + player.h > cy;
  }

  function hitPlayer() {
    if (shield > 0) {
      shield = Math.max(0, shield - 1);
      playSound('hit');
      for (let i = 0; i < 6; i++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({ x: player.x, y: player.y, vx: Math.cos(a) * 3, vy: Math.sin(a) * 3, life: 20, maxLife: 20, color: '#40c4ff', size: 3 });
      }
      return;
    }
    lives--;
    playSound('hit');
    explode(player.x, player.y, '#f44', 15);
    if (lives <= 0) {
      state = 'GAMEOVER';
      levelPause = 3;
    }
  }

  function updateShots(dt) {
    for (let i = shots.length - 1; i >= 0; i--) {
      const s = shots[i];
      s.y -= s.speed * dt;
      if (s.y < -20) { shots.splice(i, 1); continue; }
      if (bossPhase) {
        const bDist = Math.sqrt((s.x - professor.x) ** 2 + (s.y - professor.y) ** 2);
        if (bDist < CONFIG.BOSS_RADIUS + s.size) {
          damageBoss(5);
          shots.splice(i, 1);
          playSound('explosion');
          continue;
        }
      }
      for (let j = codes.length - 1; j >= 0; j--) {
        const c = codes[j];
        if (Math.abs(s.x - c.x) < c.w / 2 + s.size && Math.abs(s.y - c.y) < c.h / 2 + s.size) {
          levelHandled++;
          explode(c.x, c.y, c.color, 8);
          playSound('explosion');
          codes.splice(j, 1);
          shots.splice(i, 1);
          score++;
          if (levelHandled >= LEVELS[level].target && !bossPhase) {
            state = 'LEVEL_COMPLETE';
            levelPause = 2.5;
            if (typeof Profile !== 'undefined') Profile.addExp(40, 40);
            showToast(`¡Nivel ${level + 1} completado! +40 EXP`);
          }
          break;
        }
      }
    }
  }

  function damageBoss(dmg) {
    bossHealth = Math.max(0, bossHealth - dmg);
    if (bossHealth <= 0) {
      state = 'BOSS_DEFEATED';
      levelPause = 3;
      if (typeof Profile !== 'undefined') Profile.addExp(200, 150);
      showToast('¡JEFE DERROTADO! +200 EXP, +150 puntos');
    }
  }

  function updateProfessor(dt) {
    const L = LEVELS[level];
    const spd = level >= 3 ? CONFIG.PROF_SPEED * 2 : CONFIG.PROF_SPEED;
    professor.x += professor.dir * spd * dt;
    if (professor.x > W - CONFIG.PROF_OFFSET || professor.x < CONFIG.PROF_OFFSET) professor.dir *= -1;
    codeTimer += dt;
    if (codeTimer >= 1 / L.rate) {
      codeTimer = 0;
      const spawnCount = level >= 1 ? 2 : 1;
      for (let i = 0; i < spawnCount; i++) {
        const available = TAG_DEFS.filter(t => L.types.includes(t.type));
        const tag = available[Math.floor(Math.random() * available.length)];
        codes.push({
          x: professor.x + (Math.random() - 0.5) * 100,
          y: professor.y + 40,
          w: CONFIG.CODE_W, h: CONFIG.CODE_H,
          speed: L.speed + Math.random() * 30,
          rot: 0, rotSpeed: (Math.random() - 0.5) * 2,
          tag: tag.tag, color: tag.color, type: tag.type,
          glow: 0
        });
      }
    }
    if (bossPhase) {
      itemTimer += dt;
      if (itemTimer >= 4.5 + Math.random() * 3) {
        itemTimer = 0;
        spawnBossItem();
      }
    }
  }

  function spawnBossItem() {
    const types = ['shield', 'bullets', 'quiz'];
    const weights = [0.35, 0.45, 0.2];
    let r = Math.random();
    let type = types[0];
    let acc = 0;
    for (let i = 0; i < types.length; i++) {
      acc += weights[i];
      if (r < acc) { type = types[i]; break; }
    }
    const colors = { shield: '#40c4ff', bullets: '#ffab00', quiz: '#ffd54f' };
    const labels = { shield: '🛡️', bullets: '🔫', quiz: '❓' };
    items.push({
      x: 150 + Math.random() * (W - 300),
      y: 180 + Math.random() * 300,
      type, color: colors[type], label: labels[type],
      bob: Math.random() * Math.PI * 2
    });
  }

  function updateItems(dt) {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      item.bob += dt * 2;
      const ix = item.x;
      const iy = item.y + Math.sin(item.bob) * 8;
      if (Math.abs(player.x - ix) < 55 && Math.abs(player.y - iy) < 55) {
        collectBossItem(item);
        items.splice(i, 1);
      }
    }
  }

  function collectBossItem(item) {
    playSound('pickup');
    if (item.type === 'shield') {
      shield = 6;
      shieldTimer = 6;
      showToast('🛡️ ¡Escudo activado! 6 segundos');
    } else if (item.type === 'bullets') {
      ammo += 4;
      showToast('🔫 +4 balas');
    } else if (item.type === 'quiz') {
      openBossQuiz();
    }
  }

  function openBossQuiz() {
    const q = BOSS_QUIZ[Math.floor(Math.random() * BOSS_QUIZ.length)];
    quizItem = q;
    quizLocked = true;
    state = 'QUIZ';
    const overlay = document.getElementById('quizOverlay');
    const qText = document.getElementById('quizQuestion');
    const optionsDiv = document.getElementById('quizOptions');
    const feedback = document.getElementById('quizFeedback');
    overlay.classList.remove('hidden');
    qText.textContent = q.q;
    feedback.classList.add('hidden');
    feedback.textContent = '';
    optionsDiv.innerHTML = '';
    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt;
      btn.addEventListener('click', () => answerQuiz(idx));
      optionsDiv.appendChild(btn);
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay && state === 'QUIZ') {
        overlay.classList.add('hidden');
        state = 'PLAYING';
        quizLocked = false;
      }
    });
  }

  function answerQuiz(idx) {
    if (!quizItem || quizLocked) return;
    quizLocked = true;
    const btns = document.querySelectorAll('#quizOptions .quiz-option');
    const feedback = document.getElementById('quizFeedback');
    btns.forEach((b, i) => {
      b.disabled = true;
      if (i === quizItem.a) b.classList.add('correct');
      if (i === idx && idx !== quizItem.a) b.classList.add('wrong');
    });
    if (idx === quizItem.a) {
      ammo += 8;
      feedback.textContent = `✅ ¡Correcto! +8 balas. ${quizItem.exp}`;
      feedback.className = 'quiz-feedback correct';
    } else {
      feedback.textContent = `❌ Incorrecto. ${quizItem.exp}`;
      feedback.className = 'quiz-feedback wrong';
    }
    feedback.classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('quizOverlay').classList.add('hidden');
      state = 'PLAYING';
      quizLocked = false;
    }, 2200);
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function explode(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 4;
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 25 + Math.random() * 20, maxLife: 45, color, size: 2 + Math.random() * 3 });
    }
  }

  let audioCtx = null;
  function initAudio() {
    if (audioCtx) return;
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (Ctor) audioCtx = new Ctor();
  }
  function playSound(type) {
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    const g = audioCtx.createGain();
    const o = audioCtx.createOscillator();
    o.type = 'sine';
    switch (type) {
      case 'laser': o.frequency.setValueAtTime(880, now); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.12); o.connect(g).connect(audioCtx.destination); o.start(now); o.stop(now + 0.12); break;
      case 'explosion': o.type = 'sawtooth'; o.frequency.setValueAtTime(180, now); g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3); o.connect(g).connect(audioCtx.destination); o.start(now); o.stop(now + 0.3); break;
      case 'hit': o.frequency.setValueAtTime(130, now); g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25); o.connect(g).connect(audioCtx.destination); o.start(now); o.stop(now + 0.25); break;
      case 'pickup': o.frequency.setValueAtTime(440, now); o.frequency.setValueAtTime(880, now + 0.1); g.gain.setValueAtTime(0.12, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25); o.connect(g).connect(audioCtx.destination); o.start(now); o.stop(now + 0.25); break;
    }
  }

  function updateHud() {
    const lifeEl = document.getElementById('dodgeLifeVal');
    const shieldHud = document.getElementById('dodgeShieldHud');
    const shieldVal = document.getElementById('dodgeShieldVal');
    const ammoHud = document.getElementById('dodgeAmmoHud');
    const ammoVal = document.getElementById('dodgeAmmoVal');
    const scoreEl = document.getElementById('dodgeScoreVal');
    if (lifeEl) lifeEl.textContent = '♥'.repeat(Math.max(0, lives));
    if (bossPhase) {
      if (shieldHud) shieldHud.style.display = shield > 0 ? '' : 'none';
      if (shieldVal) shieldVal.textContent = Math.ceil(shield) + 's';
      if (ammoHud) ammoHud.style.display = '';
      if (ammoVal) ammoVal.textContent = ammo;
    } else {
      if (shieldHud) shieldHud.style.display = 'none';
      if (ammoHud) ammoHud.style.display = 'none';
    }
    if (scoreEl) scoreEl.textContent = score;
  }

  function render() {
    ctx.fillStyle = '#0f1e18';
    ctx.fillRect(0, 0, W, H);
    drawStars();
    if (state === 'MENU') {
      drawMenu();
    } else if (state === 'PLAYING' || state === 'QUIZ') {
      drawPlayer();
      drawCodes();
      drawShots();
      drawParticles();
      if (bossPhase) {
        drawProfessor();
        drawBossHealth();
        drawItems();
        if (shield > 0) drawShieldAura();
      }
      drawLevelProgress();
    } else if (state === 'LEVEL_COMPLETE') {
      drawLevelComplete();
    } else if (state === 'BOSS_DEFEATED') {
      drawBossDefeated();
    } else if (state === 'VICTORY') {
      drawVictory();
    } else if (state === 'GAMEOVER') {
      drawGameOver();
    }
  }

  let stars = [];
  for (let i = 0; i < 80; i++) stars.push({ x: Math.random() * 1200, y: Math.random() * 825, s: 0.5 + Math.random() * 1.5 });

  function drawStars() {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (const s of stars) ctx.fillRect(s.x, s.y, s.s, s.s);
  }

  function drawMenu() {
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🐸 Esquiva Académica', W / 2, H / 2 - 50);
    ctx.font = '22px monospace';
    ctx.fillStyle = '#7a8a9a';
    ctx.fillText('Esquiva o destruye las etiquetas de código', W / 2, H / 2);
    ctx.fillText('⬅ ➡ Mover  |  SPACE Disparar', W / 2, H / 2 + 35);
    ctx.fillText('4 niveles: HTML, CSS, JS y el BOSS FINAL 🐸', W / 2, H / 2 + 70);
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = '#00e676';
    ctx.fillRect(-player.w / 2, -player.h / 2, player.w, player.h);
    ctx.fillStyle = '#0a0e1a';
    ctx.font = '36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🧑‍🎓', 0, 0);
    ctx.restore();
  }

  function drawProfessor() {
    ctx.save();
    ctx.translate(professor.x, professor.y);
    ctx.fillStyle = '#7c4dff';
    ctx.beginPath();
    ctx.arc(0, 0, CONFIG.BOSS_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐸', 0, 2);
    ctx.restore();
  }

  function drawBossHealth() {
    const barW = 200;
    const barH = 14;
    const x = W / 2 - barW / 2;
    const y = 25;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barW, barH);
    const pct = bossHealth / CONFIG.BOSS_MAX_HEALTH;
    ctx.fillStyle = pct > 0.5 ? '#00e676' : pct > 0.25 ? '#ffd600' : '#f44';
    ctx.fillRect(x, y, barW * pct, barH);
    ctx.strokeStyle = '#fff';
    ctx.strokeRect(x, y, barW, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`❤️ ${bossHealth}/${CONFIG.BOSS_MAX_HEALTH}`, W / 2, y + 11);
  }

  function drawCodes() {
    for (const c of codes) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.fillStyle = c.color + '33';
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.strokeStyle = c.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.tag, 0, 0);
      ctx.restore();
    }
  }

  function drawShots() {
    ctx.fillStyle = '#ffd600';
    for (const s of shots) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawItems() {
    for (const item of items) {
      const iy = item.y + Math.sin(item.bob) * 8;
      ctx.save();
      ctx.translate(item.x, iy);
      ctx.fillStyle = item.color + '44';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.label, 0, 2);
      ctx.restore();
    }
  }

  function drawShieldAura() {
    ctx.save();
    ctx.strokeStyle = '#40c4ff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 200) * 0.2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(player.x, player.y, 70, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawLevelProgress() {
    const L = LEVELS[level];
    if (bossPhase) return;
    const pct = Math.min(1, levelHandled / L.target);
    const barW = 180;
    const x = W - barW - 20;
    const y = 20;
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barW, 10);
    ctx.fillStyle = '#00e676';
    ctx.fillRect(x, y, barW * pct, 10);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${levelHandled}/${L.target}`, x - 5, y + 9);
  }

  function drawLevelComplete() {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 42px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`🎉 ¡Nivel ${level + 1} completado!`, W / 2, H / 2 - 20);
    ctx.font = '20px monospace';
    ctx.fillStyle = '#ffd600';
    ctx.fillText('+40 EXP  |  +40 puntos', W / 2, H / 2 + 25);
  }

  function drawBossDefeated() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 ¡JEFE DERROTADO!', W / 2, H / 2 - 20);
    ctx.font = '22px monospace';
    ctx.fillStyle = '#00e676';
    ctx.fillText('+200 EXP  |  +150 puntos', W / 2, H / 2 + 25);
    ctx.fillStyle = '#7a8a9a';
    ctx.fillText('Siguiente nivel...', W / 2, H / 2 + 60);
  }

  function drawVictory() {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 52px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🏆 ¡VICTORIA TOTAL!', W / 2, H / 2 - 40);
    ctx.font = '22px monospace';
    ctx.fillStyle = '#00e676';
    ctx.fillText('Completaste todos los niveles', W / 2, H / 2 + 10);
    ctx.fillText(`Puntaje final: ${score}`, W / 2, H / 2 + 45);
    state = 'MENU';
    levelPause = 0;
    showBtns();
  }

  function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#f44';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('💀 GAME OVER', W / 2, H / 2 - 20);
    ctx.font = '20px monospace';
    ctx.fillStyle = '#7a8a9a';
    ctx.fillText('Volviendo al menú...', W / 2, H / 2 + 25);
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:30px;left:50%;transform:translateX(-50%);background:#1b2838;color:#00e676;padding:12px 24px;border-radius:8px;font-family:monospace;font-size:14px;z-index:9999;border:1px solid #00e676;box-shadow:0 4px 16px rgba(0,0,0,0.5);';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  function activate() { dodgeActive = true; }
  function deactivate() { dodgeActive = false; }

  return { init, activate, deactivate };
})();
