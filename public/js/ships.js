/* ══ DISEÑOS DE NAVES ENEMIGAS ═══════════════════════════════════════════
   Un único lugar donde se dibujan las naves, para que el modo de un jugador
   y el multijugador se vean IGUALES.

   - DISEÑOS[0..4]  → un modelo por nivel (1 HTML, 2 CSS, 3 JS, 4 jefe final,
                      5 jefe CSS).
   - EnemyShips.draw()        dibuja la nave.
   - EnemyShips.drawLabel()   dibuja el texto legible dentro de la nave
                              (el mismo estilo de siempre: cajita negra con
                              borde y letras blancas con contorno).
   Las rutas están normalizadas en un lienzo de 100x100 y se escalan al
   tamaño que pida cada juego, así sirve para cualquier resolución.        */
const EnemyShips=(()=>{
  // Cada diseño: id, nombre, colores y las partes que lo componen.
  const DISEÑOS=[
    { id:'html',   nombre:'Nave HTML',   body:'#c62828', dark:'#7f1d1d', light:'#ff8a80', glow:'#ff1744', cat:'HTML' },
    { id:'css',    nombre:'Nave CSS',    body:'#1565c0', dark:'#0d3b8f', light:'#82b4ff', glow:'#40c4ff', cat:'CSS'  },
    { id:'js',     nombre:'Nave JS',     body:'#2e7d32', dark:'#14532d', light:'#a5d6a7', glow:'#00e676', cat:'JS'   },
    { id:'boss',   nombre:'Jefe Final',  body:'#6a1b9a', dark:'#2a0a3a', light:'#ce93d8', glow:'#a020f0', cat:'JS'   },
    { id:'bossCss',nombre:'Jefe CSS',    body:'#264de4', dark:'#0d47a1', light:'#90caf9', glow:'#1976d2', cat:'CSS'  }
  ];
  const byId=id=>DISEÑOS.find(d=>d.id===id)||DISEÑOS[0];
  // El multijugador sortea un modelo al azar para que cada nave se vea
  // distinta a las de al lado.
  const random=()=>DISEÑOS[Math.floor(Math.random()*DISEÑOS.length)];

  // Un borde claro alrededor de la nave: sin esto los brillos se comen la
  // forma y todas se ven iguales.
  function edge(ctx,d,w,h){
    ctx.shadowColor='rgba(0,0,0,.85)'; ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=1.2;
    ctx.stroke();
  }
  function glow(ctx,d,blur){ ctx.shadowColor=d.glow; ctx.shadowBlur=blur==null?9:blur; }
  function noGlow(ctx){ ctx.shadowBlur=0; }

  // ── Naves ──────────────────────────────────────────────────────────────
  // Cada función dibuja centrada en (x,y) dentro de un cuadro w x h. La
  // silueta grande va siempre en `dark` y los detalles en `body`, para que se
  // reconozca el modelo aunque el brillo se coma un poco de contraste.
  const bodies={
    // 1 · HTML — Portanaves: punta abajo, alas anchas y cabina adelante
    html(ctx,x,y,w,h,d){
      glow(ctx,d,9);
      // alas (lo primero, para que queden atrás)
      ctx.fillStyle=d.dark;
      ctx.beginPath();
      ctx.moveTo(x,y-h*.10); ctx.lineTo(x-w*.5,y+h*.10); ctx.lineTo(x-w*.5,y+h*.30);
      ctx.lineTo(x-w*.18,y+h*.20); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x,y-h*.10); ctx.lineTo(x+w*.5,y+h*.10); ctx.lineTo(x+w*.5,y+h*.30);
      ctx.lineTo(x+w*.18,y+h*.20); ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      // fuselaje
      noGlow(ctx);
      ctx.fillStyle=d.body;
      ctx.beginPath();
      ctx.moveTo(x,y+h*.5);
      ctx.lineTo(x-w*.19,y+h*.02);
      ctx.lineTo(x-w*.19,y-h*.34);
      ctx.lineTo(x-w*.09,y-h*.48);
      ctx.lineTo(x+w*.09,y-h*.48);
      ctx.lineTo(x+w*.19,y-h*.34);
      ctx.lineTo(x+w*.19,y+h*.02);
      ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      // cabina
      ctx.fillStyle=d.light;
      ctx.beginPath(); ctx.ellipse(x,y-h*.24,w*.1,h*.13,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.ellipse(x,y-h*.27,w*.045,h*.055,0,0,Math.PI*2); ctx.fill();
      // motor
      ctx.fillStyle='#ffca28';
      ctx.beginPath(); ctx.ellipse(x,y+h*.36,w*.075,h*.07,0,0,Math.PI*2); ctx.fill();
    },
    // 2 · CSS — Escudo con el símbolo de las llaves del navegador
    css(ctx,x,y,w,h,d){
      glow(ctx,d,9);
      ctx.fillStyle=d.dark;
      ctx.beginPath();
      ctx.moveTo(x,y-h*.5);
      ctx.lineTo(x+w*.40,y-h*.30);
      ctx.lineTo(x+w*.40,y+h*.16);
      ctx.lineTo(x,y+h*.5);
      ctx.lineTo(x-w*.40,y+h*.16);
      ctx.lineTo(x-w*.40,y-h*.30);
      ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      noGlow(ctx);
      // placa con las llaves { }
      ctx.fillStyle=d.body;
      ctx.beginPath();
      ctx.moveTo(x,y-h*.42);
      ctx.lineTo(x+w*.32,y-h*.26);
      ctx.lineTo(x+w*.32,y+h*.12);
      ctx.lineTo(x,y+h*.42);
      ctx.lineTo(x-w*.32,y+h*.12);
      ctx.lineTo(x-w*.32,y-h*.26);
      ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      ctx.strokeStyle=d.light; ctx.lineWidth=Math.max(1.5,w*.045); ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(x+w*.09,y-h*.20); ctx.lineTo(x-w*.01,y-h*.08);
      ctx.lineTo(x-w*.01,y+h*.08); ctx.lineTo(x+w*.09,y+h*.20);
      ctx.moveTo(x-w*.09,y-h*.20); ctx.lineTo(x+w*.01,y-h*.08);
      ctx.lineTo(x+w*.01,y+h*.08); ctx.lineTo(x-w*.09,y+h*.20);
      ctx.stroke();
      // remaches
      ctx.fillStyle='#ffca28';
      ctx.beginPath(); ctx.arc(x-w*.36,y-h*.28,w*.04,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+w*.36,y-h*.28,w*.04,0,Math.PI*2); ctx.fill();
    },
    // 3 · JS — Robot con ojos, antena y brazos
    js(ctx,x,y,w,h,d){
      // brazos primero
      ctx.fillStyle=d.dark;
      ctx.fillRect(x-w*.52,y-h*.10,w*.14,h*.10);
      ctx.fillRect(x+w*.38,y-h*.10,w*.14,h*.10);
      glow(ctx,d,9);
      ctx.fillStyle=d.dark;
      ctx.beginPath();
      ctx.moveTo(x-w*.26,y-h*.44); ctx.lineTo(x+w*.26,y-h*.44);
      ctx.lineTo(x+w*.32,y-h*.24); ctx.lineTo(x+w*.32,y+h*.16);
      ctx.lineTo(x+w*.16,y+h*.44); ctx.lineTo(x-w*.16,y+h*.44);
      ctx.lineTo(x-w*.32,y+h*.16); ctx.lineTo(x-w*.32,y-h*.24);
      ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      noGlow(ctx);
      // placa
      ctx.fillStyle=d.body;
      ctx.fillRect(x-w*.26,y-h*.40,w*.52,h*.26);
      // ojos
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.ellipse(x-w*.12,y-h*.28,w*.07,h*.08,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x+w*.12,y-h*.28,w*.07,h*.08,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#0b3d16';
      ctx.beginPath(); ctx.arc(x-w*.10,y-h*.28,w*.028,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+w*.14,y-h*.28,w*.028,0,Math.PI*2); ctx.fill();
      // antena
      ctx.strokeStyle=d.light; ctx.lineWidth=Math.max(1.2,w*.035);
      ctx.beginPath(); ctx.moveTo(x,y-h*.44); ctx.lineTo(x,y-h*.60); ctx.stroke();
      ctx.fillStyle='#ffca28';
      ctx.beginPath(); ctx.arc(x,y-h*.64,w*.05,0,Math.PI*2); ctx.fill();
      // cintura
      ctx.fillStyle='#ffca28';
      ctx.fillRect(x-w*.18,y+h*.22,w*.36,h*.07);
      ctx.fillStyle=d.light;
      ctx.fillRect(x-w*.10,y+h*.30,w*.20,h*.10);
    },
    // 4 · Jefe Final — Nodriza grande con tres ventanas
    boss(ctx,x,y,w,h,d){
      glow(ctx,d,11);
      // laterales
      ctx.fillStyle=d.dark;
      ctx.beginPath();
      ctx.moveTo(x-w*.22,y-h*.04); ctx.lineTo(x-w*.52,y+h*.14); ctx.lineTo(x-w*.46,y+h*.34);
      ctx.lineTo(x-w*.20,y+h*.22); ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x+w*.22,y-h*.04); ctx.lineTo(x+w*.52,y+h*.14); ctx.lineTo(x+w*.46,y+h*.34);
      ctx.lineTo(x+w*.20,y+h*.22); ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      // casco
      noGlow(ctx);
      ctx.fillStyle=d.body;
      ctx.beginPath();
      ctx.moveTo(x,y-h*.50);
      ctx.lineTo(x+w*.30,y-h*.34);
      ctx.lineTo(x+w*.34,y+h*.06);
      ctx.lineTo(x+w*.16,y+h*.40);
      ctx.lineTo(x-w*.16,y+h*.40);
      ctx.lineTo(x-w*.34,y+h*.06);
      ctx.lineTo(x-w*.30,y-h*.34);
      ctx.closePath(); ctx.fill();
      edge(ctx,d,w,h);
      // ventanillas
      ctx.fillStyle=d.light;
      ctx.beginPath(); ctx.ellipse(x,y-h*.02,w*.19,h*.19,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffeb3b';
      for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(x-w*.14+i*w*.14,y-h*.26,w*.035,0,Math.PI*2); ctx.fill(); }
    },
    // 5 · Jefe CSS — Globo con las llaves { } y un cable
    bossCss(ctx,x,y,w,h,d){
      glow(ctx,d,11);
      ctx.fillStyle=d.body;
      ctx.beginPath(); ctx.ellipse(x,y-h*.06,w*.46,h*.36,0,0,Math.PI*2); ctx.fill();
      edge(ctx,d,w,h);
      noGlow(ctx);
      // panza
      ctx.fillStyle=d.dark;
      ctx.beginPath();
      ctx.moveTo(x-w*.22,y+h*.14); ctx.lineTo(x+w*.22,y+h*.14);
      ctx.lineTo(x+w*.10,y+h*.42); ctx.lineTo(x-w*.10,y+h*.42);
      ctx.closePath(); ctx.fill();
      // ojos-cápsula
      ctx.fillStyle=d.light;
      ctx.beginPath(); ctx.ellipse(x,y-h*.10,w*.26,h*.24,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#263238'; ctx.lineWidth=Math.max(1.4,w*.04); ctx.lineCap='round';
      ctx.beginPath();
      ctx.moveTo(x+w*.07,y-h*.20); ctx.lineTo(x-w*.02,y-h*.10);
      ctx.lineTo(x-w*.02,y+h*.04); ctx.lineTo(x+w*.07,y+h*.14);
      ctx.moveTo(x-w*.07,y-h*.20); ctx.lineTo(x+w*.02,y-h*.10);
      ctx.lineTo(x+w*.02,y+h*.04); ctx.lineTo(x-w*.07,y+h*.14);
      ctx.stroke();
      // cable y punta
      ctx.strokeStyle=d.light; ctx.lineWidth=Math.max(1.2,w*.035);
      ctx.beginPath(); ctx.moveTo(x,y+h*.42); ctx.lineTo(x,y+h*.56); ctx.stroke();
      ctx.fillStyle='#ffca28';
      ctx.beginPath(); ctx.arc(x,y+h*.58,w*.045,0,Math.PI*2); ctx.fill();
    }
  };

  function draw(ctx,id,x,y,w,h){
    const d=typeof id==='string'?byId(id):(id||DISEÑOS[0]);
    const fn=bodies[d.id]||bodies.html;
    ctx.save();
    fn(ctx,x,y,w,h,d);
    ctx.restore();
    return d;
  }

  // ── Texto legible dentro de la nave ────────────────────────────────────
  // Mismo estilo que el modo de un jugador: caja negra con borde, letras
  // blancas gruesas y un contorno oscuro para que se lean de un vistazo.
  // Ajusta el tamaño de letra y parte el texto en dos líneas si no entra.
  function drawLabel(ctx,text,x,y,maxW,opt){
    opt=opt||{};
    const label=String(text==null?'':text).trim()||'?';
    const base=opt.fontSize||11;
    let fs=base;
    ctx.save();
    ctx.textAlign='center'; ctx.textBaseline='middle';
    const setFont=()=>{ ctx.font='800 '+fs+'px "Segoe UI", system-ui, -apple-system, sans-serif'; };
    setFont();

    let lines=[label];
    const avail=Math.max(30,maxW-8);
    if(ctx.measureText(label).width>avail){
      const words=label.split(' ');
      if(words.length>1){
        // Partir en dos líneas lo más parejas posible
        let best=null;
        for(let i=1;i<words.length;i++){
          const a=words.slice(0,i).join(' '), b=words.slice(i).join(' ');
          const worst=Math.max(ctx.measureText(a).width,ctx.measureText(b).width);
          if(!best||worst<best.worst) best={a,b,worst};
        }
        if(best) lines=[best.a,best.b];
      } else {
        lines=[label];
      }
    }
    // Si con dos líneas tampoco entra, probamos letra más chica.
    for(let attempt=0;attempt<3;attempt++){
      const widest=Math.max(...lines.map(l=>ctx.measureText(l).width));
      if(widest<=avail||fs<=7) break;
      fs-=0.75; setFont();
    }
    // Recorte de emergencia: si una línea sigue sin entrar, se acorta.
    lines=lines.map(l=>{
      if(ctx.measureText(l).width<=avail) return l;
      let s=l;
      while(s.length>1&&ctx.measureText(s+'…').width>avail) s=s.slice(0,-1);
      return s+'…';
    });

    const lineH=Math.round(fs*1.16);
    const padX=Math.max(5,Math.round(fs*.55)), padY=Math.max(3,Math.round(fs*.36));
    let maxLineW=0; for(const l of lines){ const w=ctx.measureText(l).width; if(w>maxLineW) maxLineW=w; }
    const boxW=Math.min(maxLineW+padX*2, maxW);
    const boxH=lines.length*lineH+padY*2;
    const boxY=y+(opt.dy||0);

    // Caja
    const bx=x-boxW/2, by=boxY-boxH/2, r=Math.max(3,Math.round(fs*.35));
    ctx.beginPath();
    ctx.moveTo(bx+r,by); ctx.lineTo(bx+boxW-r,by);
    ctx.quadraticCurveTo(bx+boxW,by,bx+boxW,by+r);
    ctx.lineTo(bx+boxW,by+boxH-r);
    ctx.quadraticCurveTo(bx+boxW,by+boxH,bx+boxW-r,by+boxH);
    ctx.lineTo(bx+r,by+boxH);
    ctx.quadraticCurveTo(bx,by+boxH,bx,by+boxH-r);
    ctx.lineTo(bx,by+r);
    ctx.quadraticCurveTo(bx,by,bx+r,by);
    ctx.closePath();
    ctx.fillStyle=opt.bg||'rgba(0,0,0,.86)';
    ctx.fill();
    ctx.strokeStyle=opt.border||'rgba(255,255,255,.35)';
    ctx.lineWidth=1;
    ctx.stroke();

    // Letras
    ctx.fillStyle=opt.color||'#ffffff';
    ctx.strokeStyle=opt.stroke||'rgba(0,0,0,.9)';
    ctx.lineWidth=Math.max(2,fs*.22);
    ctx.lineJoin='round';
    const y0=boxY-((lines.length-1)*lineH)/2;
    lines.forEach((l,i)=>{
      const ly=y0+i*lineH;
      ctx.strokeText(l,x,ly);
      ctx.fillText(l,x,ly);
    });
    ctx.restore();
    return {w:boxW,h:boxH};
  }

  return { DISEÑOS, byId, random, draw, drawLabel };
})();
