const Docs = {
  sections: [
    {
      icon: '👾',
      title: '¿Qué es Code Invaders?',
      content: `
        <p>Code Invaders es un <b>juego estilo Galaga</b> donde defendes la galaxia programando.</p>
        <p>Naves enemigas se acercan con preguntas sobre programación. Tu misión: escribir la respuesta correcta para destruirlas antes de que lleguen a ti.</p>
        <ul>
          <li><b>4 niveles</b>: 3答题 (HTML, CSS, JS) + <b>👑 JEFE FINAL</b> modo esquivar</li>
          <li><b>2 modos:</b> Normal y Speedrun (contrarreloj)</li>
          <li><b>🛒 Tienda</b> de skins para tu nave + sistema de <b>puntuación, vidas, rachas y ranking</b></li>
          <li><b>⚙️ Ajustes</b>: tema oscuro/claro, foto de perfil, nombre, marcos (iniciá sesión)</li>
        </ul>
      `
    },
    {
      icon: '🎯',
      title: 'Modos de juego: Normal vs Speedrun',
      content: `
        <p>Al iniciar ves dos botones en el canvas:</p>
        <ul>
          <li><b>▶ NORMAL:</b> 3 niveles答题 (HTML, CSS, JS) + <b>Nivel 4: 👑 JEFE FINAL</b> modo esquivar. 20s de gracia antes de que las naves avancen, vidas = 3.</li>
          <li><b>⚡ SPEEDRUN:</b> contrarreloj <b>solo Nivel 1</b> pero <b>NO es fácil</b>. Dificultad aumentada y <b>cronómetro activo</b>. El tiempo se detiene al destruir la última nave.</li>
        </ul>
        <p><b>↺ REINTENTAR</b> reinicia en el mismo modo que elegiste.</p>
      `
    },
    {
      icon: '⏱',
      title: 'Cronómetro Speedrun',
      content: `
        <p>Exclusivo del modo <b>⚡ SPEEDRUN</b>:</p>
        <ul>
          <li>Aparece como <code>⏱ 00:00.00</code> (mm:ss.cs) al elegir Speedrun y no se pausa.</li>
          <li>Se vuelve <b style="color:#ff5252">rojo</b> si superas 45s.</li>
          <li><b>Se detiene</b> al destruir la última nave o al perder vidas. Pantalla <b>⚡ ¡SPEEDRUN COMPLETADO!</b> con récord guardado en <code>localStorage speedrun_best</code>.</li>
        </ul>
      `
    },
    {
      icon: '🎮',
      title: 'Cómo jugar',
      content: `
        <p><b>Niveles 1-3 (答题):</b></p>
        <ol>
          <li>Las naves se colocan en <b>formación</b> y se mueven de lado a lado.</li>
          <li>20s de gracia antes de que avancen (cada error -2s).</li>
          <li>Haz <b>clic izquierdo</b> sobre una nave para apuntarla.</li>
          <li>Escribe el comando y <b>ENTER</b> o <b>💥 DISPARAR</b>.</li>
          <li>El comando elimina <b>TODAS</b> las naves con esa respuesta.</li>
          <li>Fallo = -3 puntos, -1 🪙 y rompes racha.</li>
        </ol>
        <p style="margin-top:12px"><b>Nivel 4 (JEFE - esquivar):</b></p>
        <ol>
          <li><b>⬅ ➡</b> para mover tu nave y esquivar etiquetas.</li>
          <li>Recogé objetos 🔫 ❓ 💀 que aparecen.</li>
          <li>SPACE para disparar balas al jefe.</li>
          <li>Respondé preguntas para ganar balas.</li>
          <li>Cuidado con las trampas.</li>
        </ol>
        <p><b>Controles答题:</b> ← → mover · Clic apuntar · ENTER disparar</p>
        <p><b>Controles jefe:</b> ← → mover · SPACE disparar (con balas)</p>
      `
    },
    {
      icon: '🛒',
      title: 'Tienda de Skins',
      content: `
        <p>Gana <b>🪙 puntos</b> jugando y cómprate skins en <b>🛒 Tienda</b> (arriba en la barra):</p>
        <table class="table" style="margin-top:8px"><thead><tr><th>Skin</th><th>Precio</th></tr></thead><tbody>
          <tr><td>DEV Cyan</td><td>Gratis</td></tr>
          <tr><td>Crimson Fury</td><td>120 🪙</td></tr>
          <tr><td>Golden Nova</td><td>200 🪙</td></tr>
          <tr><td>Neon Viper</td><td>300 🪙</td></tr>
          <tr><td>Violet Storm</td><td>350 🪙</td></tr>
          <tr><td>Pixel Phantom</td><td>500 🪙</td></tr>
        </tbody></table>
        <ul>
          <li>Cada acierto te da <b>10×nivel</b> (y bonus racha) en 🪙.</li>
          <li><b>Comprar</b> descuenta 🪙, <b>Equipar</b> cambia el color/efecto de tu nave instantáneamente.</li>
          <li>Se guarda en tu cuenta (y en modo offline en el navegador).</li>
        </ul>
      `
    },
    {
      icon: '👑',
      title: 'Jefe Final (Nivel 4)',
      content: `
        <p>Tras superar los 3 niveles答题 aparece el <b>👑 JEFE FINAL</b> — ¡modo esquivar!</p>
        <ul>
          <li><b>El Prof. Froggio 🐸</b> aparece arriba y lanza etiquetas de HTML, CSS, JS y Python.</li>
          <li><b>Tenés 30 HP</b> — cada etiqueta que te daña te quita 1 vida.</li>
          <li><b>⬅ ➡ Mover</b> tu nave para esquivar las etiquetas.</li>
          <li><b>Objetos aleatorios</b> aparecen cada ~5-9 segundos:</li>
          <li>  🔫 <b>Balas</b> (máx 3): SPACE para disparar y hacerle daño al jefe.</li>
          <li>  ❓ <b>Preguntas</b>: verdadero/falso u opción múltiple. Si acertás: +3 balas. 1 intento.</li>
          <li>  💀 <b>Trampas</b>: 50% -1 vida, 50% controles invertidos 4s.</li>
          <li>Al llegar a 0 HP: <b>👑 ¡JEFE VENCIDO! +100 🪙 bonus</b>.</li>
        </ul>
      `
    },
    {
      icon: '🔥',
      title: 'Nivel 1 cambiante (Speedrun)',
      content: `
        <ul>
          <li><b>Velocidad 2.4×</b> + oscilación triple y teletransportes ±15px.</li>
          <li><b>Naves naranjas</b>, bajan en 10s vs 20s.</li>
        </ul>
      `
    },
    {
      icon: '❤️',
      title: 'Vidas, EXP y puntuación',
      content: `
        <ul>
          <li>3 vidas en todos los niveles.</li>
          <li>答题 niveles: Destruir = 10×nivel + bonus racha. Error = -3 puntos.</li>
          <li>Nivel 4 (jefe): Etiqueta te daña = -1 vida. Trampa = -1 vida o controles invertidos.</li>
          <li>Los puntos son también 🪙 para la tienda.</li>
          <li><b>⭐ EXP:</b> +10 EXP por enemigo destruido (cualquier modo). +100 EXP al ganar el juego. La EXP se obtiene al terminar la partida (ganando o perdiendo).</li>
          <li>La EXP sube tu <b>nivel de perfil</b> y desbloquea <b>marcos</b> en la tienda.</li>
        </ul>
      `
    },
    {
      icon: '⚡',
      title: 'Rachas y pistas',
      content: `
        <ul>
          <li>Racha 30s, a los 3 ganas bonus 🔥 y 💡 pista sobre la nave.</li>
          <li>Lento 3s al destruir, rápido 1s al fallar.</li>
        </ul>
      `
    },
    {
      icon: '📊',
      title: 'Niveles',
      content: `
        <table class="table" style="margin-top:10px;"><thead><tr><th>Nivel</th><th>Tema</th><th>Modo</th></tr></thead><tbody>
          <tr><td>1</td><td>Etiquetas HTML básicas</td><td>答题 (escribir respuesta)</td></tr>
          <tr><td>2</td><td>Selectores y propiedades CSS</td><td>答题</td></tr>
          <tr><td>3</td><td>JavaScript básico</td><td>答题</td></tr>
          <tr><td>4</td><td>👑 JEFE FINAL — Prof. Froggio</td><td>Esquivar + objetos</td></tr>
        </tbody></table>
        <p style="margin-top:10px"><b>Niveles 1-3:</b> Naves con preguntas, escribís la respuesta y presionás ENTER.</p>
        <p><b>Nivel 4:</b> Te movés con ← →, esquivás etiquetas, recogés 🔫 ❓ 💀 objetos.</p>
      `
    },
    {
      icon: '🔐',
      title: 'Registro y Perfil',
      content: `<p>"Iniciar sesión" o <b>⚙️ Ajustes</b>. Cualquiera puede cambiar el tema (oscuro/claro), pero para más funciones necesitás cuenta:</p>
        <ul>
          <li><b>Invitados:</b> pueden cambiar el tema oscuro/claro</li>
          <li><b>Con cuenta:</b> foto de perfil, nombre, horas jugadas, EXP, marcos, progreso guardado</li>
        </ul>`
    },
    {
      icon: '🏆',
      title: 'Ranking',
      content: `<p>Debajo del juego. Ordenado por niveles resueltos y menos intentos. El Jefe cuenta como nivel 4.</p>`
    },
    {
      icon: '⚙️',
      title: 'Detalles técnicos',
      content: `<ul><li>Canvas 2D 60fps, Web Audio API</li><li>Node/Express + JSON o modo offline localStorage</li><li>Speedrun: performance.now(), skins: API /api/shop</li></ul>`
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
