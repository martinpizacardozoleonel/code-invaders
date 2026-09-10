const Intro = (() => {
  const STORAGE_KEY = 'ci_intro_seen_v2';
  const slides = [
    {
      id: 1,
      kicker: 'BIENVENIDO A LA GALAXIA',
      title: 'CODE<br>INVADERS',
      subtitle: 'Aprendé a programar defendiendo la galaxia',
      desc: 'Una aventura donde cada respuesta correcta es un disparo.',
      body: `
        <div class="intro-cover-visual">
          <div class="intro-ship">
            <div class="intro-ship-glow"></div>
            <div class="intro-ship-body">◆</div>
            <div class="intro-ship-flame"></div>
          </div>
          <div class="intro-code-rain">
            <span>&lt;h1&gt;</span><span>color</span><span>let</span><span>#</span><span>flex</span><span>async</span>
          </div>
        </div>
        <div class="intro-badges">
          <span class="intro-badge">SIN EXPERIENCIA</span>
          <span class="intro-badge intro-badge-gold">5 NIVELES</span>
          <span class="intro-badge intro-badge-cyan">2 MODOS</span>
        </div>
      `
    },
    {
      id: 2,
      kicker: '01 — CONCEPTO',
      title: '¿Qué es Code Invaders?',
      subtitle: 'Un shooter arcade donde tu código es tu arma.',
      body: `
        <p class="intro-lead">Defendés la galaxia resolviendo desafíos de programación. Cada nave enemiga trae una pregunta — tu respuesta la destruye.</p>
        <div class="intro-steps3">
          <div class="intro-step"><span class="intro-step-num">1</span><h4>APUNTÁ</h4><p>Seleccionás una nave enemiga con clic o touch.</p></div>
          <div class="intro-step"><span class="intro-step-num">2</span><h4>RESPONDÉ</h4><p>Escribís la respuesta correcta en el input.</p></div>
          <div class="intro-step"><span class="intro-step-num">3</span><h4>DESTRUÍ</h4><p>Presionás <code>ENTER</code> o <code>💥 DISPARAR</code>.</p></div>
        </div>
        <div class="intro-highlight"><span class="intro-highlight-icon">⚡</span><strong>Tu código es tu arma.</strong> Cada enemigo contiene una pregunta real del juego.</div>
        <div class="intro-examples">
          <div class="intro-ex"><span class="intro-ex-q">Párrafo</span><span class="intro-ex-a">&lt;p&gt;</span></div>
          <div class="intro-ex"><span class="intro-ex-q">Declarar variable</span><span class="intro-ex-a">let</span></div>
          <div class="intro-ex"><span class="intro-ex-q">Selector de ID</span><span class="intro-ex-a">#</span></div>
          <div class="intro-ex"><span class="intro-ex-q">Color de texto</span><span class="intro-ex-a">color</span></div>
        </div>
      `
    },
    {
      id: 3,
      kicker: '02 — CONTROLES',
      title: '¿Cómo se juega?',
      subtitle: 'Tu código es el arma. Seguí estos pasos.',
      body: `
        <div class="intro-cards4">
          <div class="intro-card-num"><span>1</span><h4>Elegí el modo</h4><p>Normal o Speedrun.</p></div>
          <div class="intro-card-num"><span>2</span><h4>Seleccioná nave</h4><p>Clic / touch sobre el enemigo.</p></div>
          <div class="intro-card-num"><span>3</span><h4>Escribí el comando</h4><p>Ej: <code>&lt;div&gt;</code>, <code>let</code>, <code>#</code>.</p></div>
          <div class="intro-card-num"><span>4</span><h4>Dispará</h4><p><code>ENTER</code> para atacar.</p></div>
        </div>
        <div class="intro-controls">
          <div class="intro-ctrl"><span class="intro-ctrl-key">← →</span><span class="intro-ctrl-label">o <b>A / D</b> — Mover nave</span></div>
          <div class="intro-ctrl"><span class="intro-ctrl-key">CLICK</span><span class="intro-ctrl-label">Seleccionar nave</span></div>
          <div class="intro-ctrl"><span class="intro-ctrl-key">ENTER</span><span class="intro-ctrl-label">Disparar</span></div>
          <div class="intro-ctrl"><span class="intro-ctrl-key">TOUCH</span><span class="intro-ctrl-label">◀ ▶ + 💥 en mobile</span></div>
        </div>
        <div class="intro-warn"><span>⚠️</span> Una respuesta correcta destruye <b>TODAS</b> las naves que comparten esa respuesta.</div>
      `
    },
    {
      id: 4,
      kicker: '03 — MODOS',
      title: 'Elegí tu desafío',
      subtitle: 'Empezá a tu ritmo o corré contra el reloj.',
      body: `
        <div class="intro-modes">
          <div class="intro-mode intro-mode-normal">
            <div class="intro-mode-head"><span class="intro-mode-icon">▶</span><h4>MODO NORMAL</h4><span class="intro-mode-tag">RECOMENDADO</span></div>
            <p class="intro-mode-desc">5 niveles: 3 de preguntas + 2 Jefes. Progreso guardado.</p>
            <ul>
              <li>Nivel 1: HTML básico (10 enemigos)</li>
              <li>Nivel 2: CSS básico (10 enemigos)</li>
              <li>Nivel 3: JavaScript básico (6 enemigos)</li>
              <li>Nivel 4: 👑 JEFE FINAL — esquivar por toda la pantalla (12 HP)</li>
              <li>Nivel 5: 👑 JEFE CSS — estacionario, burbujas, tira 2 naves CSS, 10 HP (-2 por oleada)</li>
            </ul>
            <div class="intro-mode-foot"><span class="intro-dot-cyan"></span> 5 niveles + ranking por EXP</div>
          </div>
          <div class="intro-mode intro-mode-speedrun">
            <div class="intro-mode-head"><span class="intro-mode-icon">⚡</span><h4>SPEEDRUN</h4><span class="intro-mode-tag intro-mode-tag-gold">RÉCORD</span></div>
            <p class="intro-mode-desc">Solo gana quien destruye TODO a tiempo.</p>
            <ul>
              <li>Nivel 1 acelerado (naves naranjas, 10s)</li>
              <li>Si una nave escapa → Game Over instantáneo</li>
              <li>Cronómetro mm:ss.cs (rojo &gt;45s)</li>
              <li>Mejor tiempo guardado y ranking speedrun</li>
            </ul>
            <div class="intro-mode-foot"><span class="intro-dot-gold"></span> Ranking por menor tiempo</div>
          </div>
        </div>
      `
    },
    {
      id: 5,
      kicker: '04 — INTRODUCCIÓN A LAS ETIQUETAS',
      title: 'Cada etiqueta, qué hace y cómo se usa',
      subtitle: 'Como en el juego: imagen → etiqueta → ejemplo. Todo lo que vas a disparar.',
      body: `
        <p class="intro-lead">En Code Invaders cada nave muestra una <b>pregunta</b> (“Párrafo”, “Botón”, etc.). Vos respondés con la <b>etiqueta/código exacto</b>. Acá tenés la guía visual completa:</p>
        <div class="intro-tag-section">
          <h4 class="intro-tag-head"><span class="intro-tag-icon" style="background:#e65100">HTML</span> Etiquetas — qué hace / cómo se usa</h4>
          <div class="intro-tag-table-wrap">
            <table class="intro-tag-table">
              <thead><tr><th>IMAGEN</th><th>ETIQUETA</th><th>QUÉ HACE</th><th>EJEMPLO</th></tr></thead>
              <tbody>
                <tr><td><span class="intro-tag-img">H1</span></td><td><code>&lt;h1&gt;</code></td><td>Encabezado grande</td><td><code>&lt;h1&gt;Título&lt;/h1&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">P</span></td><td><code>&lt;p&gt;</code></td><td>Párrafo de texto</td><td><code>&lt;p&gt;Hola mundo&lt;/p&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">A</span></td><td><code>&lt;a&gt;</code></td><td>Enlace</td><td><code>&lt;a href="/"&gt;Ir&lt;/a&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">IMG</span></td><td><code>&lt;img&gt;</code></td><td>Imagen</td><td><code>&lt;img src="foto.jpg"&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">UL</span></td><td><code>&lt;ul&gt;</code></td><td>Lista desordenada</td><td><code>&lt;ul&gt;&lt;li&gt;•&lt;/li&gt;&lt;/ul&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">DIV</span></td><td><code>&lt;div&gt;</code></td><td>Contenedor bloque</td><td><code>&lt;div&gt;...&lt;/div&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">SPAN</span></td><td><code>&lt;span&gt;</code></td><td>Contenedor en línea</td><td><code>&lt;span&gt;texto&lt;/span&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">BTN</span></td><td><code>&lt;button&gt;</code></td><td>Botón cliqueable</td><td><code>&lt;button&gt;Enviar&lt;/button&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">IN</span></td><td><code>&lt;input&gt;</code></td><td>Campo de entrada</td><td><code>&lt;input type="text"&gt;</code></td></tr>
                <tr><td><span class="intro-tag-img">TAB</span></td><td><code>&lt;table&gt;</code></td><td>Tabla</td><td><code>&lt;table&gt;...&lt;/table&gt;</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="intro-tag-section">
          <h4 class="intro-tag-head"><span class="intro-tag-icon" style="background:#1565c0">CSS</span> Selectores y Propiedades</h4>
          <div class="intro-tag-table-wrap">
            <table class="intro-tag-table">
              <thead><tr><th>IMAGEN</th><th>CÓDIGO</th><th>QUÉ HACE</th><th>EJEMPLO</th></tr></thead>
              <tbody>
                <tr><td><span class="intro-tag-img css">#</span></td><td><code>#</code></td><td>Selector por ID</td><td><code>#menu { }</code></td></tr>
                <tr><td><span class="intro-tag-img css">.</span></td><td><code>.</code></td><td>Selector por clase</td><td><code>.card { }</code></td></tr>
                <tr><td><span class="intro-tag-img css">C</span></td><td><code>color</code></td><td>Color de texto</td><td><code>color:red;</code></td></tr>
                <tr><td><span class="intro-tag-img css">BG</span></td><td><code>background</code></td><td>Fondo</td><td><code>background:#000;</code></td></tr>
                <tr><td><span class="intro-tag-img css">M</span></td><td><code>margin / padding</code></td><td>Margen ext/int</td><td><code>margin:8px; padding:12px;</code></td></tr>
                <tr><td><span class="intro-tag-img css">B</span></td><td><code>border</code></td><td>Borde</td><td><code>border:1px solid;</code></td></tr>
                <tr><td><span class="intro-tag-img css">F</span></td><td><code>display:flex</code></td><td>Activar flexbox</td><td><code>display:flex;</code></td></tr>
                <tr><td><span class="intro-tag-img css">JC</span></td><td><code>justify-content</code></td><td>Alinear eje principal</td><td><code>justify-content:center;</code></td></tr>
                <tr><td><span class="intro-tag-img css">AI</span></td><td><code>align-items</code></td><td>Alinear eje cruzado</td><td><code>align-items:center;</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="intro-tag-section">
          <h4 class="intro-tag-head"><span class="intro-tag-icon" style="background:#f9a825; color:#000">JS</span> JavaScript — qué hace / cómo se usa</h4>
          <div class="intro-tag-table-wrap">
            <table class="intro-tag-table">
              <thead><tr><th>IMAGEN</th><th>CÓDIGO</th><th>QUÉ HACE</th><th>EJEMPLO</th></tr></thead>
              <tbody>
                <tr><td><span class="intro-tag-img js">let</span></td><td><code>let</code></td><td>Variable mutable</td><td><code>let x=5;</code></td></tr>
                <tr><td><span class="intro-tag-img js">cst</span></td><td><code>const</code></td><td>Constante</td><td><code>const URL="/api";</code></td></tr>
                <tr><td><span class="intro-tag-img js">=></span></td><td><code>=&gt;</code></td><td>Función flecha</td><td><code>()=>{}</code></td></tr>
                <tr><td><span class="intro-tag-img js">if</span></td><td><code>if</code></td><td>Condición</td><td><code>if(x>0){}</code></td></tr>
                <tr><td><span class="intro-tag-img js">===</span></td><td><code>===</code></td><td>Igualdad estricta</td><td><code>a===b</code></td></tr>
                <tr><td><span class="intro-tag-img js">push</span></td><td><code>push()</code></td><td>Agregar al final</td><td><code>arr.push(1)</code></td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="intro-note">💡 Tip: En el juego la <b>imagen</b> es la pista, la <b>etiqueta</b> es lo que escribís y el <b>ejemplo</b> es código real.</div>
      `
    },
    {
      id: 6,
      kicker: '05 — TU MISIÓN + NUEVO',
      title: 'Tu misión y novedades',
      subtitle: 'Más que disparar: amigos, chat y personalización.',
      body: `
        <div class="intro-mission-grid">
          <div class="intro-mission"><span class="intro-m-icon">★</span><h4>PUNTOS</h4><p>10×nivel por acierto + bonus combo.</p></div>
          <div class="intro-mission"><span class="intro-m-icon">⭐</span><h4>EXP</h4><p>+10 por nave, +100 al ganar. Desbloquea colores de nombre (3000+ EXP).</p></div>
          <div class="intro-mission"><span class="intro-m-icon">🔥</span><h4>RACHAS</h4><p>3 seguidos → bonus y pista 💡 sobre la nave.</p></div>
          <div class="intro-mission"><span class="intro-m-icon">🛒</span><h4>TIENDA</h4><p>6 skins 0–500 🪙 + marcos. Todo guardado.</p></div>
          <div class="intro-mission"><span class="intro-m-icon">💬</span><h4>CHAT</h4><p>Global persistente + privado entre amigos. Fondo personalizable.</p></div>
          <div class="intro-mission"><span class="intro-m-icon">👥</span><h4>AMIGOS</h4><p>Solicitud → notificación campanita → aceptar → chat privado. Verde en línea / rojo desconectado.</p></div>
          <div class="intro-mission"><span class="intro-m-icon">🏆</span><h4>RANKED</h4><p>Orden: niveles → EXP → intentos. Torneo 15 días a las 00:00, banner animado al finalizar.</p></div>
          <div class="intro-mission intro-mission-boss"><span class="intro-m-icon">👑</span><h4>JEFES</h4><p>Nivel 4: Prof. Froggio esquivar (12 HP, se mueve por todos lados). Nivel 5: Jefe CSS (10 HP, tira 2 naves CSS, burbujas “¡Que burro!” / “¡Me enojo!”).</p></div>
        </div>
        <div class="intro-cta-wrap">
          <p class="intro-cta-text">¿Listo para defender la galaxia?</p>
          <button class="intro-cta" id="introPlayBtn">▶ COMENZAR — ELEGIR MODO</button>
          <p class="intro-cta-hint">Te llevará al selector de modo del juego real</p>
        </div>
      `
    }
  ];

  let current = 0;
  let overlay, contentEl, dotsEl, labelEl, prevBtn, nextBtn, progressFill, closeBtn, skipBtn, reopenBtn;

  function init() {
    overlay = document.getElementById('introOverlay');
    contentEl = document.getElementById('introContent');
    dotsEl = document.getElementById('introDots');
    labelEl = document.getElementById('introPageLabel');
    prevBtn = document.getElementById('introPrev');
    nextBtn = document.getElementById('introNext');
    progressFill = document.getElementById('introProgressFill');
    closeBtn = document.getElementById('introClose');
    skipBtn = document.getElementById('introSkip');
    reopenBtn = document.getElementById('introReopen');
    if (!overlay) return;
    buildDots();
    bindEvents();
    render();
    const seen = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return '1'; } })();
    if (!seen) setTimeout(open, 400);
    else if (reopenBtn) reopenBtn.classList.remove('hidden');
  }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = slides.map((_, i) => `<button class="intro-dot" data-i="${i}" aria-label="Ir a página ${i+1}"></button>`).join('');
    dotsEl.querySelectorAll('.intro-dot').forEach(d => d.addEventListener('click', () => goTo(parseInt(d.dataset.i))));
  }

  function bindEvents() {
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (skipBtn) skipBtn.addEventListener('click', close);
    if (reopenBtn) reopenBtn.addEventListener('click', open);
    const playBtn = () => document.getElementById('introPlayBtn');
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {} 
    });
    document.addEventListener('keydown', (e) => {
      if (overlay.classList.contains('hidden')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && current === slides.length - 1) {
        const b = document.getElementById('introPlayBtn');
        if (b) { e.preventDefault(); b.click(); }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
      if (e.key === 'ArrowLeft') prev();
    });
    overlay.addEventListener('click', (e) => {
      if (e.target.id === 'introPlayBtn') {
        closeToGame();
      }
    });
  }

  function render() {
    const s = slides[current];
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="intro-slide" data-slide="${s.id}">
          <div class="intro-kicker">${s.kicker}</div>
          <h2 class="intro-title">${s.title}</h2>
          <p class="intro-subtitle">${s.subtitle}</p>
          ${s.desc ? `<p class="intro-desc">${s.desc}</p>` : ''}
          <div class="intro-body">${s.body}</div>
        </div>
      `;
      contentEl.style.animation = 'none';
      contentEl.offsetHeight;
      contentEl.style.animation = '';
      const b = document.getElementById('introPlayBtn');
      if (b) b.addEventListener('click', closeToGame);
    }
    if (labelEl) labelEl.textContent = `Página ${current+1} de ${slides.length}`;
    if (dotsEl) dotsEl.querySelectorAll('.intro-dot').forEach((d,i)=> d.classList.toggle('active', i===current));
    if (prevBtn) prevBtn.disabled = current===0;
    if (nextBtn) {
      nextBtn.disabled = current===slides.length-1;
      nextBtn.style.visibility = current===slides.length-1 ? 'hidden' : 'visible';
    }
    if (progressFill) progressFill.style.width = ((current+1)/slides.length*100)+'%';
    if (contentEl) contentEl.scrollTop = 0;
  }

  function goTo(i) { if (i<0||i>=slides.length) return; current=i; render(); }
  function next() { if (current<slides.length-1) goTo(current+1); }
  function prev() { if (current>0) goTo(current-1); }
  function open() {
    current = 0; render();
    overlay.classList.remove('hidden');
    document.body.style.overflow='hidden';
    if (reopenBtn) reopenBtn.classList.add('hidden');
  }
  function close() {
    overlay.classList.add('hidden');
    document.body.style.overflow='';
    try { localStorage.setItem(STORAGE_KEY,'1'); }catch(e){}
    if (reopenBtn) {
      reopenBtn.classList.remove('hidden');
      reopenBtn.classList.add('intro-reopen-pop');
      setTimeout(()=> reopenBtn.classList.remove('intro-reopen-pop'), 600);
    }
  }
  function closeToGame() {
    close();
    const gameView = document.getElementById('view-game');
    if (gameView) {
      document.querySelectorAll('.view').forEach(v=> v.classList.toggle('active', v===gameView));
      document.querySelectorAll('.nav-btn').forEach(b=> b.classList.toggle('active', b.dataset.view==='game'));
      window.scrollTo({top:0, behavior:'smooth'});
    }
    setTimeout(()=>{
      const w = document.getElementById('gameCanvas');
      if(w) w.scrollIntoView({behavior:'smooth', block:'center'});
    }, 200);
  }

  return { init, open, close, goTo };
})();
