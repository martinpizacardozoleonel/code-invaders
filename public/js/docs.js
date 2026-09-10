const Docs = {
  sections: [
    {
      icon: '👾',
      title: '¿Qué es Code Invaders?',
      content: `
        <p>Code Invaders es un <b>juego estilo Galaga</b> donde defendes la galaxia programando.</p>
        <p>Naves enemigas se acercan con preguntas. Tu misión: escribir la respuesta correcta para destruirlas.</p>
        <ul>
          <li><b>5 niveles</b>: 3 normales (HTML, CSS, JS) + <b>2 JEFES</b> (Nivel 4 esquivar, Nivel 5 CSS)</li>
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
          <li><b>▶ NORMAL:</b> 3 niveles (HTML, CSS, JS) + <b>Nivel 4: 👑 JEFE FINAL</b> (esquivar por toda la pantalla, 12 HP) + <b>Nivel 5: 👑 JEFE CSS</b> (estacionario, tira 2 naves CSS, 10 HP, -2 por oleada). 20s de gracia antes de que avancen, vidas = 2.</li>
          <li><b>⚡ SPEEDRUN:</b> solo Nivel 1 pero <b>NO se puede dejar escapar</b>. Si una nave llega abajo → pierdes. Cronómetro mm:ss.cs.</li>
        </ul>
        <p>Tras ganar el Jefe Final (4) pasás automático al Jefe CSS (5). Solo al matar al CSS termina el juego.</p>
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
          <li>10 HP → al 0 ganas el juego.</li>
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
    grid.innerHTML=this.sections.map(s=>`
      <div class="doc-card">
        <h3>${s.icon} ${s.title}</h3>
        <div class="manual-content">${s.content}</div>
      </div>
    `).join('');
  }
};
