/* ══ EFECTOS DE LÁSER ═════════════════════════════════════════════════════
   Dibuja el disparo del jugador en el canvas. Un único lugar para el modo de
   un jugador y el multijugador, así el láser se ve igual en todos lados.

   La forma sale de "kind" y el movimiento de la animación del tiempo (t), con
   lo que la tienda marca como "anim". Los láseres sin animación son líneas
   simples, que es lo más rápido de dibujar.                           */
const LaserFx=(()=>{
  // El mismo catálogo que usa la tienda (el servidor lo manda en /api/shop).
  // Está duplicado acá a propósito para poder pintar sin esperar al servidor.
  const TIPOS=[
    { id:'default', color:'#00e5ff', glow:'#00e5ff', kind:'rayo'    },
    { id:'oro',     color:'#ffd600', glow:'#ffea00', kind:'rayo'    },
    { id:'verde',   color:'#00e676', glow:'#69f0ae', kind:'bola'    },
    { id:'fuego',   color:'#ff6d00', glow:'#ff3d00', kind:'bola',    a:1.1, b:10 },
    { id:'hielo',   color:'#80d8ff', glow:'#e1f5fe', kind:'onda',    a:1.4, b:4  },
    { id:'doble',   color:'#ff4081', glow:'#ff80ab', kind:'doble',   a:1.2, b:6  },
    { id:'arcoiris',color:'#e040fb', glow:'#ea80fc', kind:'rayo',    a:3,   b:1.2},
    { id:'plasma',  color:'#b3ffff', glow:'#e040fb', kind:'plasma',  a:1.1, b:7  },
    { id:'drilo',   color:'#00e676', glow:'#00b0ff', kind:'taladro', a:1,   b:3  }
  ];
  const byId=id=>TIPOS.find(x=>x.id===id)||TIPOS[0];

  // Arcoíris: el color va cambiando con el tiempo en vez de ser fijo.
  function rainbowAt(t,hueShift){
    const h=((t*(hueShift||60)+200)%360+360)%360;
    return 'hsl('+Math.round(h)+',100%,62%)';
  }

  // ── Cada tipo dibuja el disparo ─────────────────────────────────────────
  // Todas reciben los mismos argumentos para poder intercambiarlas.
  const formas={
    // Línea simple con un núcleo claro (finito, para que no lave el color).
    rayo(ctx,x1,y1,x2,y2,col,glow,t,L){
      const w=L.w||3;
      ctx.strokeStyle=col; ctx.lineWidth=w;
      ctx.shadowColor=glow; ctx.shadowBlur=(L.blur==null?10:L.blur);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,.55)'; ctx.lineWidth=Math.max(.8,w*.28);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    },
    // Pulso redondo. Sólo late si el tipo trae "a" (los que no se animan
    // dibujan siempre igual).
    bola(ctx,x1,y1,x2,y2,col,glow,t,L){
      formas.rayo(ctx,x1,y1,x2,y2,col,glow,t,Object.assign({},L,{w:(L.w||3)*1.1,blur:(L.blur==null?10:L.blur)*1.4}));
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      const base=(L.r||9);
      const p=L.a?1+Math.sin(t*L.a)*(L.b||.18):1;
      const r=Math.max(1,base*p);
      const g=ctx.createRadialGradient(mx,my,0,mx,my,r);
      g.addColorStop(0,'rgba(255,255,255,.95)');
      g.addColorStop(.5,col);
      g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(mx,my,r,0,Math.PI*2); ctx.fill();
    },
    // Dos líneas que se abren y cierran.
    doble(ctx,x1,y1,x2,y2,col,glow,t,L){
      const dx=x2-x1, dy=y2-y1;
      const len=Math.hypot(dx,dy)||1;
      const nx=-dy/len, ny=dx/len;
      const off=(L.off||6)*(1+Math.sin(t*(L.a||2))*.6);
      for(const s of [-1,1]){
        ctx.strokeStyle=col; ctx.lineWidth=L.w||3;
        ctx.shadowColor=glow; ctx.shadowBlur=L.blur==null?10:L.blur;
        ctx.beginPath();
        ctx.moveTo(x1+nx*off*s, y1+ny*off*s);
        ctx.lineTo(x2+nx*off*s, y2+ny*off*s);
        ctx.stroke();
      }
      ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,.75)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    },
    // Hielo: la línea base ondula y salen esquirlas puntiagudas.
    onda(ctx,x1,y1,x2,y2,col,glow,t,L){
      const len=Math.hypot(x2-x1,y2-y1)||1;
      const dx=(x2-x1)/len, dy=(y2-y1)/len;
      const nx=-dy, ny=dx;
      const amp=(L.amp||7);
      const waves=(L.waves||4);
      const steps=Math.max(6,Math.min(40,Math.round(len/8)));
      ctx.beginPath();
      for(let i=0;i<=steps;i++){
        const u=i/steps;
        // La onda "viaja": la punta se aplana y la cola ondea.
        const env=Math.sin(u*Math.PI);
        const o=Math.sin(u*waves*Math.PI*2 - t*(L.b||3))*amp*env;
        const px=x1+dx*len*u+nx*o, py=y1+dy*len*u+ny*o;
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle=col; ctx.lineWidth=L.w||3;
      ctx.shadowColor=glow; ctx.shadowBlur=L.blur==null?12:L.blur;
      ctx.lineJoin='round'; ctx.lineCap='round';
      ctx.stroke();
      ctx.shadowBlur=0;
      // Esquirlas: puntitas que se abren y cierran a lo largo del disparo.
      const n=5;
      for(let i=1;i<n;i++){
        const u=i/n;
        const spread=(0.4+Math.abs(Math.sin(t*(L.a||2)+i))*0.6)*amp*1.5;
        const bx=x1+dx*len*u, by=y1+dy*len*u;
        for(const s of [-1,1]){
          ctx.fillStyle='rgba(255,255,255,.75)';
          ctx.beginPath();
          ctx.moveTo(bx+nx*spread*s, by+ny*spread*s);
          ctx.lineTo(bx+dx*4, by+dy*4);
          ctx.lineTo(bx-dx*3, by-dy*3);
          ctx.closePath(); ctx.fill();
        }
      }
    },
    // Esfera palpitante en el medio del disparo.
    plasma(ctx,x1,y1,x2,y2,col,glow,t,L){
      formas.rayo(ctx,x1,y1,x2,y2,col,glow,t,Object.assign({},L,{blur:(L.blur==null?10:L.blur)*2}));
      const mx=(x1+x2)/2, my=(y1+y2)/2;
      const puls=1+Math.sin(t*(L.a||2))*(L.b||.2)*.3;
      const r=Math.max(2,(L.r||8)*puls);
      const g=ctx.createRadialGradient(mx,my-r*.3,0,mx,my,r);
      g.addColorStop(0,'#ffffff');
      g.addColorStop(.35,col);
      g.addColorStop(1,glow);
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.arc(mx,my,r,0,Math.PI*2); ctx.fill();
      // Onditas que salen de la esfera.
      ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1.2;
      const k=(t*(L.b||2))%1;
      ctx.globalAlpha=1-k;
      ctx.beginPath(); ctx.arc(mx,my,r*(1+k*1.6),0,Math.PI*2); ctx.stroke();
      ctx.globalAlpha=1;
    },
    // Taladro: espiral apretada (muchas vueltas) con cabeza que gira.
    taladro(ctx,x1,y1,x2,y2,col,glow,t,L){
      const len=Math.hypot(x2-x1,y2-y1)||1;
      const dx=(x2-x1)/len, dy=(y2-y1)/len;
      const nx=-dy, ny=dx;
      const amp=(L.amp||4);
      const turns=(L.turns||8);
      const steps=Math.max(24,Math.min(120,Math.round(len/2.5)));
      // La espiral: apretada y girando con el tiempo.
      ctx.beginPath();
      for(let i=0;i<=steps;i++){
        const u=i/steps;
        const spin=u*turns*Math.PI*2 - t*(L.b||2)*2;
        const o=Math.sin(spin)*amp;
        const px=x1+dx*len*u+nx*o, py=y1+dy*len*u+ny*o;
        if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.strokeStyle=col; ctx.lineWidth=L.w||2.5;
      ctx.shadowColor=glow; ctx.shadowBlur=L.blur==null?10:L.blur;
      ctx.stroke();
      ctx.shadowBlur=0;
      // Cabeza del taladro: galera de 3 aletas girando en la punta.
      const spin=-t*(L.b||2)*3;
      const hr=Math.max(4,(L.w||2.5)*2.1);
      ctx.save();
      ctx.translate(x2,y2);
      ctx.rotate(spin);
      ctx.fillStyle=col;
      for(let i=0;i<3;i++){
        ctx.rotate(Math.PI*2/3);
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.lineTo(hr*1.9,-hr*.75);
        ctx.lineTo(hr*1.3,hr*.4);
        ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(0,0,hr*.55,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
  };

  // ── Dibujo ─────────────────────────────────────────────────────────────
  // opts: { w, alpha, timeScale, tint, tintGlow }
  // "tint" pisa el color para los disparos especiales (jefes, errores).
  // Devuelve el tipo usado, por si el que llama lo necesita.
  function draw(ctx,laserId,x1,y1,x2,y2,t,opts){
    opts=opts||{};
    const L=byId(laserId);
    const time=(t||0)*(opts.timeScale==null?1:opts.timeScale);
    let col=L.color, glow=L.glow;
    // Un láser con color propio se queda con su animación, pero teñido.
    if(opts.tint) col=opts.tint;
    if(opts.tintGlow) glow=opts.tintGlow;
    else if(opts.tint) glow=opts.tint;
    if(L.id==='arcoiris'&&!opts.tint){ col=rainbowAt(time,40); glow=col; }
    const forma=formas[L.kind]||formas.rayo;
    ctx.save();
    if(opts.alpha!=null) ctx.globalAlpha=opts.alpha;
    ctx.lineCap='round'; ctx.lineJoin='round';
    forma(ctx,x1,y1,x2,y2,col,glow,time,{
      w:opts.w||3, blur:opts.blur, r:opts.r, amp:opts.amp,
      off:opts.off, waves:opts.waves, turns:opts.turns,
      a:L.a, b:L.b
    });
    ctx.restore();
    return L;
  }

  // Colores para pintar la ficha en la tienda.
  function info(id){
    const L=byId(id);
    return { id:L.id, color:L.color, glow:L.glow, kind:L.kind, animated:!!(L.a||L.b) };
  }

  return { TIPOS, byId, draw, info };
})();
