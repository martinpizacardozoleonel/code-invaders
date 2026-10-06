const Docs = {
  sections: [
    {
      icon: '👾',
      title: '¿Qué es Code Invaders?',
      content: `
        <p>Code Invaders es un <b>juego estilo Galaga</b> donde defendes la galaxia programando.</p>
        <p>Naves enemigas se acercan con preguntas. Tu misión: escribir la respuesta correcta para destruirlas.</p>
        <ul>
          <li><b>7 niveles</b>: 4 normales (HTML, CSS, JS y el nivel 7 en la galaxia 2) + <b>3 JEFES</b> (Nivel 4 esquivar, Nivel 5 CSS, Nivel 6 JavaScript)</li>
          <li><b>2 modos:</b> Normal y Speedrun (solo gana quien destruye TODO, si escapa una nave → Game Over)</li>
          <li><b>Amigos + Chat</b> global y privado, notificaciones campanita</li>
          <li><b>Personalización:</b> tienda skins, marcos, color de nombre (3000+ EXP), fondo de chat</li>
          <li><b>Ranking competitivo</b> por niveles → EXP → intentos. Torneo 15 días a las 00:00</li>
        </ul>
      `
    },
    {
      icon: '🎯',
      title: 'Modos de juego: Normal vs Speedrun',
      content: `
        <p>Al iniciar ves dos botones en el canvas:</p>
        <ul>
          <li><b>▶ NORMAL:</b> 3 niveles (HTML, CSS, JS) + <b>Nivel 4: 👑 JEFE FINAL</b> (esquivar por toda la pantalla, 12 HP) + <b>Nivel 5: 👑 JEFE CSS</b> (estacionario, tira 2 naves CSS, 10 HP, -2 por oleada) + <b>Nivel 6: 🤖 JEFE JAVASCRIPT</b> (3 etapas y portal) + <b>Nivel 7: 🌌 GALAXIA 2</b> (13 enemigos). 20s de gracia antes de que avancen, vidas = 2.</li>
          <li><b>⚡ SPEEDRUN:</b> solo Nivel 1 pero <b>NO se puede dejar escapar</b>. Si una nave llega abajo → pierdes. Cronómetro mm:ss.cs.</li>
        </ul>
        <p>Tras ganar el Jefe Final (4) pasás automático al Jefe CSS (5), después al Jefe JavaScript (6) y de ahí cruzás el portal a la <b>galaxia 2</b> con el nivel 7. Solo al ganar el nivel 7 termina el juego.</p>
      `
    },
    {
      icon: '👑',
      title: 'Jefe Final (Nivel 4) — Esquivar',
      content: `
        <p>El Prof. Froggio 🐸 ahora se mueve <b>por todos lados</b> (rebota en X e Y).</p>
        <ul>
          <li>Te lanza etiquetas que caen (HTML/CSS/JS/Python).</li>
          <li><b>⬅ ➡</b> para esquivar.</li>
          <li>Recogé 🔫 balas (SPACE dispara), ❓ preguntas (+3 balas), 💀 trampas (-1 vida o invertido).</li>
          <li>12 HP → al 0 pasás al siguiente jefe.</li>
        </ul>
      `
    },
    {
      icon: '🎨',
      title: 'Jefe CSS (Nivel 5) — Nuevo',
      content: `
        <p>Jefe estacionario azul con burbuja.</p>
        <ul>
          <li>Tira <b>2 naves CSS</b> a la vez que bajan velocidad normal (como nivel 3).</li>
          <li>Escribí la etiqueta CSS (<code>color</code>, <code>margin</code>...) para destruirlas.</li>
          <li>Si matás las 2 → jefe pierde <b>-2 HP</b> (de 10) y reacciona: <i>“¡Que burro! 😂”</i> si fallás, <i>“¡Me enojo! 🔥”</i> si le pegás.</li>
          <li>10 HP → al 0 pasás al nivel 6.</li>
        </ul>
      `
    },
    {
      icon: '🤖',
      title: 'Jefe JavaScript (Nivel 6) + portal',
      content: `
        <p>El jefe más enredado del juego: no se le dispara a él, hay que sacarle las naves que va tirando y cada etapa es más difícil.</p>
        <ul>
          <li><b>Etapa 1:</b> tira <b>4 naves con etiqueta HTML</b> (<code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code>…). Escribí la etiqueta y <b>ENTER</b> para destroyirla.</li>
          <li><b>Etapa 2:</b> se enoja y tira <b>2 naves con 3 de vida</b> y etiquetas HTML aleatorias: hay que escribir su código <b>3 veces</b> mientras bajan normal.</li>
          <li><b>Etapa 3 — FURIOSO:</b> la galaxia <b>se sacude</b> y entran <b>5 naves con etiqueta CSS</b>. Escribir el código correcto <b>no las destruye: te da 1 bala 🔫</b>. Recién ahí se las mata disparando: <b>1 bala = 1 nave</b>, o acumulás varias y las matás a todas de un tiro.</li>
          <li><b>Final:</b> al limpiar las 5, se enfurece tanto que <b>detiene el espacio</b> (los puntitos blancos se congelan), abre un <b>portal</b> y desaparece. Ponete abajo del portal (<b>⬅ ➡</b>) para meterte.</li>
        </ul>
      `
    },
    {
      icon: '🌌',
      title: 'Galaxia 2 (Nivel 7)',
      content: `
        <p>Cruzar el portal te deja en la <b>Nebulosa Violeta</b>: otra galaxia, con su propio color.</p>
        <ul>
          <li><b>13 naves</b> enemigas (más que cualquier nivel de la primera galaxia).</li>
          <li>Bajan <b>con la misma velocidad y el mismo tiempo</b> que las del nivel 1-6: lo que cambia es la cantidad.</li>
          <li>El <b>cartel de nivel</b> (la descripción de qué hay que destruir) y el fondo del espacio cambian de color a partir de acá, y siguen igual para todos los niveles de la galaxia 2.</li>
        </ul>
      `
    },
    {
      icon: '⏱',
      title: 'Cronómetro Speedrun',
      content: `
        <p>Exclusivo <b>⚡ SPEEDRUN</b>:</p>
        <ul>
          <li><code>⏱ 00:00.00</code> rojo si &gt;45s.</li>
          <li>Si una nave escapa → <b>Game Over instantáneo</b> (no vale dejar pasar).</li>
          <li>Se detiene al destruir la última nave. Pantalla speedrun con récord guardado.</li>
        </ul>
      `
    },
    {
      icon: '🎮',
      title: 'Cómo jugar',
      content: `
        <p><b>Niveles 1-3:</b></p>
        <ol>
          <li>Formación se mueve de lado a lado (20s gracia, -2s por error).</li>
          <li>Clic sobre nave para apuntarla.</li>
          <li>Escribí y <b>ENTER</b>. Destruye todas con esa respuesta.</li>
          <li>Espacio funciona en chat y no mueve la nave.</li>
        </ol>
        <p style="margin-top:12px"><b>Jefes:</b> ver secciones anteriores. Ojo contraseña 👁️ en todos los inputs.</p>
      `
    },
    {
      icon: '👥',
      title: 'Amigos y Chat',
      content: `
        <ul>
          <li><b>Chat Global:</b> en “💬 Chat”, fondo personalizable, scroll no te baja solo.</li>
          <li><b>Amigos:</b> en “👥 Amigos” buscá por nombre → Enviar solicitud → le llega notificación campanita.</li>
          <li>Al aceptar → <b>chat privado</b> entre ustedes.</li>
          <li>Punto verde 🟢 en línea (últimos 5 min), rojo 🔴 desconectado.</li>
          <li>Eliminar amigo disponible.</li>
        </ul>
      `
    },
    {
      icon: '🛒',
      title: 'Tienda y Personalización',
      content: `
        <p><b>Skins</b> (0–500 🪙) + <b>Marcos</b> + <b>Colores de nombre</b> (3000-5000 EXP): blanco, cyan, dorado, rosa, verde, violeta, rojo, arcoíris. Comprar descuenta EXP, equipar cambia tu nombre en chat/ranked. Fondo de chat se guarda en tu cuenta.</p>
        <p>La tienda tiene <b>una sección para cada cosa</b>: 🚀 <b>Naves</b>, ⚡ <b>Láseres</b> (tu disparo), 💥 <b>Impactos</b> (la explosión al destruir una nave) y 🏷️ <b>Etiquetas</b> (la cajita con el texto de las naves enemigas). Las cuatro se compran con los 🪙 puntos que ganás jugando, y las vistas previas de la tienda se animan con el mismo efecto que ves en el juego.</p>
      `
    },
    {
      icon: '🏆',
      title: 'Ranking y Torneo',
      content: `
        <p><b>Ranking competitivo:</b> orden por <b>niveles → EXP → intentos</b>. Si empatan niveles gana quien farmeó más EXP.</p>
        <p><b>Torneo:</b> dura <b>15 días hasta las 00:00</b>. Al finalizar aparece banner profesional animado con confetti y se entregan recompensas (campeón, silver...). También ranking speedrun por menor tiempo.</p>
      `
    },
    {
      icon: '📊',
      title: 'Niveles',
      content: `
        <table class="table" style="margin-top:10px;"><thead><tr><th>Nivel</th><th>Tema</th><th>Modo</th></tr></thead><tbody>
          <tr><td>1</td><td>HTML básico</td><td>Preguntas (destruir naves)</td></tr>
          <tr><td>2</td><td>CSS básico</td><td>Preguntas</td></tr>
          <tr><td>3</td><td>JS básico</td><td>Preguntas</td></tr>
          <tr><td>4</td><td>👑 JEFE FINAL</td><td>Esquivar + SPACE</td></tr>
          <tr><td>5</td><td>👑 JEFE CSS</td><td>2 naves CSS + burbujas</td></tr>
          <tr><td>6</td><td>🤖 JEFE JAVASCRIPT</td><td>3 etapas (HTML → vidas → balas) + portal</td></tr>
          <tr><td>7</td><td>🌌 GALAXIA 2</td><td>13 preguntas · otro color</td></tr>
        </tbody></table>
        <p style="margin-top:10px">QR y Ajustes ahora están dentro del <b>menú del logo 👾</b> arriba a la izquierda.</p>
      `
    },
    {
      icon: '🔐',
      title: 'Registro y Perfil',
      content: `<p>Tema oscuro/claro para todos, pero con cuenta guardás foto, marcos, colores, progreso, EXP, chat privado y fondo.</p>`
    },
    {
      icon: '⚙️',
      title: 'Detalles técnicos',
      content: `<ul><li>Canvas 2D 60fps, Node/Express + PostgreSQL (Render) / JSON local, Web Audio API</li><li>Persistencia: usuarios, ranked y chat no se borran al refrescar</li></ul>`
    }
  ],
  init(){ this.render(); },
  render(){
    const grid=document.getElementById('docsGrid');
    if(!grid) return;
    const tags=['01 · CONCEPTO','02 · MODOS','03 · JEFE FINAL','04 · JEFE CSS','05 · JEFE JAVASCRIPT','06 · GALAXIA 2','07 · SPEEDRUN','08 · CONTROLES','09 · SOCIAL','10 · TIENDA','11 · RANKING','12 · NIVELES','13 · CUENTA','14 · TECH'];
    grid.innerHTML=this.sections.map((s,i)=>`
      <div class="doc-card doc-anim" style="animation-delay:${Math.min(i*0.06,0.6)}s">
        <p class="doc-kicker">${tags[i]||'MANUAL'}</p>
        <h3><span class="doc-ico">${s.icon}</span><span>${s.title}</span><span class="doc-num">${String(i+1).padStart(2,'0')}</span></h3>
        <div class="manual-content">${s.content}</div>
      </div>
    `).join('');
  }
};
