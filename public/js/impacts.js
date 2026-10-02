/* ══ EFECTOS DE IMPACTO ════════════════════════════════════════════════════
   Dibuja la explosión del momento en que destruís una nave. Un único lugar
   para el modo de un jugador y el multijugador, así el impacto se ve igual en
   todos lados.

   Mismo criterio que lasers.js: el catálogo está duplicado acá a propósito para
   poder pintar sin esperar al servidor, y cada "kind" es una forma.

   La diferencia con el láser: la explosión no se dibuja en un instante, se
   dibuja durante varios cuadros. Por eso recibe "k" (el avance de 0 a 1 de la
   explosión) y "t" (el reloj de la animación). Los que tienen "a"/"b" se mueven
   de verdad mientras se abren, en el juego y también en la tienda.           */
const ImpactFx=(()=>{
  // El mismo catálogo que usa la tienda (el servidor lo manda en /api/shop).
  // Está duplicado acá a propósito para poder pintar sin esperar al servidor.
  const TIPOS=[
    { id:'default',     color:'#ffca28', glow:'#ffea00', kind:'chispa'      },
    { id:'fuego',       color:'#ff6d00', glow:'#ff3d00', kind:'fuego',      a:1.1, b:10   },
    { id:'hielo',       color:'#80d8ff', glow:'#e1f5fe', kind:'hielo',      a:1.4, b:4    },
    { id:'onda',        color:'#40c4ff', glow:'#82b4ff', kind:'onda',       a:1.2, b:6    },
    { id:'espiral',     color:'#e040fb', glow:'#ea80fc', kind:'espiral',    a:1,   b:3    },
    { id:'manga',       color:'#ff4081', glow:'#ff80ab', kind:'manga',      a:1.5, b:5    },
    { id:'glitch',      color:'#00e676', glow:'#00b0ff', kind:'glitch',     a:3,   b:1.2  },
    { id:'neon',        color:'#b3ffff', glow:'#e040fb', kind:'neon',       a:1.1, b:7    },
    { id:'destruccion', color:'#ff1744', glow:'#ff5252', kind:'destruccion', a:1,   b:4    }
  ];
  const byId=id=>TIPOS.find(x=>x.id===id)||TIPOS[0];

  // ── Ayuditas que usan varias formas ──────────────────────────────────────
  // El destello redondo del centro: casi todos los impactos lo tienen.
  function bola(ctx,x,y,r,col,inten){
    const rr=Math.max(1,r);
    const g=ctx.createRadialGradient(x,y,0,x,y,rr);
    g.addColorStop(0,'rgba(255,255,255,'+(0.95*inten).toFixed(3)+')');
    g.addColorStop(.45,col);
    g.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(x,y,rr,0,Math.PI*2); ctx.fill();
  }
  // Una onda expansiva. "a" ya viene multiplicado por el que llama.
  function anillo(ctx,x,y,r,col,w,a){
    ctx.globalAlpha*=a;
    ctx.strokeStyle=col; ctx.lineWidth=Math.max(.5,w);
    ctx.beginPath(); ctx.arc(x,y,Math.max(.5,r),0,Math.PI*2); ctx.stroke();
  }

  // ── Cada tipo dibuja el impacto ──────────────────────────────────────────
  // Todas reciben lo mismo para poder intercambiarlas:
  //   ctx, x, y, color, glow, t (segundos), k (0→1), R (radio final), ficha
  // A = la opacidad queVenía puesta (para no pisar la del que llama).
  const formas={
    // Chispa: el básico. Destello blanco, ocho púas que salen disparadas y una
    // onda que se abre. No se mueve (L.a vacío): lo que se paga es lo que
    // tiene movimiento de verdad.
    chispa(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k*k);
      bola(ctx,x,y,R*k*1.05,col,1-k*.4);
      ctx.shadowColor=glow; ctx.shadowBlur=10;
      ctx.strokeStyle=col; ctx.lineWidth=Math.max(.6,3.5*(1-k));
      const n=8, spin=(L.a||0)*t;
      for(let i=0;i<n;i++){
        const a=(i/n)*Math.PI*2+spin;
        ctx.beginPath();
        ctx.moveTo(x+Math.cos(a)*R*k*.5,y+Math.sin(a)*R*k*.5);
        ctx.lineTo(x+Math.cos(a)*R*k*1.3,y+Math.sin(a)*R*k*1.3);
        ctx.stroke();
      }
      ctx.shadowBlur=0;
      ctx.globalAlpha=A*(1-k)*.8;
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=Math.max(.5,2*(1-k));
      ctx.beginPath(); ctx.arc(x,y,R*k*1.15,0,Math.PI*2); ctx.stroke();
    },
    // Fuego: pétalos de llama que se abren y brasas que suben.
    fuego(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*.9,col,1-k);
      const n=9, sp=(L.a||1);
      for(let i=0;i<n;i++){
        const a=(i/n)*Math.PI*2+sp*t*.5;
        const len=R*k*(.9+Math.sin(t*sp*1.3+i*1.7)*(L.b||10)*.06);
        const wd=Math.max(1,R*.22*(1-k));
        ctx.globalAlpha=A*(1-k)*.9;
        ctx.fillStyle=col; ctx.shadowColor=glow; ctx.shadowBlur=12;
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+Math.cos(a)*len-wd*.5,y+Math.sin(a)*len);
        ctx.quadraticCurveTo(x+Math.cos(a)*len*1.3,y+Math.sin(a)*len*1.3,x+Math.cos(a)*len+wd*.5,y+Math.sin(a)*len);
        ctx.closePath(); ctx.fill();
      }
      ctx.shadowBlur=0;
      // Brasas que salen disparadas hacia arriba.
      const nb=8;
      for(let i=0;i<nb;i++){
        const u=((t*(L.b||10)*.4+i/nb)%1);
        const a=-Math.PI/2+(i-nb/2)*.3;
        const d=R*(.4+u*1.5);
        ctx.globalAlpha=A*(1-u)*.9;
        ctx.fillStyle='#ffe082';
        ctx.beginPath();
        ctx.arc(x+Math.cos(a)*d,y+Math.sin(a)*d-d*.35,Math.max(.6,R*.09*(1-u)),0,Math.PI*2);
        ctx.fill();
      }
    },
    // Hielo: copos que salen disparados y tres ejes de cristal girando.
    hielo(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*.75,'rgba(180,230,255,.95)',1-k);
      const n=10, sp=(L.a||1);
      for(let i=0;i<n;i++){
        const a=(i/n)*Math.PI*2+sp*t*.3;
        const d=R*k*(.5+((i*7)%5)/8);
        ctx.globalAlpha=A*(1-k)*.9;
        ctx.fillStyle=i%2?col:'#ffffff';
        ctx.beginPath();
        ctx.moveTo(x+Math.cos(a)*d,y+Math.sin(a)*d);
        ctx.lineTo(x+Math.cos(a+.18)*d*1.5,y+Math.sin(a+.18)*d*1.5);
        ctx.lineTo(x+Math.cos(a-.18)*d*1.5,y+Math.sin(a-.18)*d*1.5);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha=A*(1-k);
      ctx.strokeStyle='#ffffff'; ctx.shadowColor=glow; ctx.shadowBlur=14; ctx.lineWidth=2;
      const sr=R*(0.6+k*1.1);
      ctx.save(); ctx.translate(x,y); ctx.rotate(t*sp*1.2);
      for(let i=0;i<3;i++){
        ctx.rotate(Math.PI/3);
        ctx.beginPath(); ctx.moveTo(-sr*.8,0); ctx.lineTo(sr*.8,0); ctx.stroke();
      }
      ctx.restore();
      ctx.shadowBlur=0;
    },
    // Onda de choque: anillos punteados que salen corriendo. El guion del
    // anillo se corre con el tiempo, así que se ven rotar de verdad.
    onda(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*.55,col,1-k);
      ctx.shadowColor=glow; ctx.shadowBlur=10;
      ctx.setLineDash([10,8]);
      ctx.lineDashOffset=-t*(L.b||4)*6;
      for(let i=0;i<3;i++){
        const u=(k+i/3)%1;
        ctx.globalAlpha=A*(1-u)*.85;
        anillo(ctx,x,y,R*u*1.35,i%2?col:'#ffffff',Math.max(.6,4*(1-u)),1);
      }
      ctx.setLineDash([]);
      ctx.lineDashOffset=0;
      ctx.globalAlpha=A*(1-k);
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=Math.max(.6,2.4*(1-k));
      ctx.shadowBlur=0;
      ctx.beginPath(); ctx.arc(x,y,R*k*1.35,0,Math.PI*2); ctx.stroke();
    },
    // Remolino: tres brazos en espiral que giran y se abren.
    espiral(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*.4,col,1-k);
      ctx.save(); ctx.translate(x,y); ctx.rotate(t*(L.b||3));
      ctx.strokeStyle=col; ctx.shadowColor=glow; ctx.shadowBlur=12;
      ctx.lineWidth=Math.max(.6,3*(1-k)+.5);
      const arms=3, turns=1.6;
      for(let a=0;a<arms;a++){
        const base=a*Math.PI*2/arms;
        ctx.beginPath();
        for(let i=0;i<=24;i++){
          const u=i/24;
          const ang=base+u*turns*Math.PI*2;
          const d=R*u*(.5+k*.9);
          const px=Math.cos(ang)*d, py=Math.sin(ang)*d;
          if(i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
        }
        ctx.stroke();
      }
      ctx.restore();
      ctx.shadowBlur=0;
      ctx.globalAlpha=A*(1-k)*.8;
      ctx.fillStyle='#ffffff';
      ctx.beginPath(); ctx.arc(x,y,Math.max(1,R*.14*(1-k)),0,Math.PI*2); ctx.fill();
    },
    // Manga: la explosion de comic. Tres triangulos que se abren y lineas
    // de velocidad girando alrededor.
    manga(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*.7,col,1-k);
      for(let i=0;i<3;i++){
        const kk=Math.min(1,k*1.6-i*.22);
        if(kk<=0) continue;
        const d=R*(.25+kk*1.1);
        ctx.globalAlpha=A*(1-kk)*.9;
        ctx.fillStyle=i%2?'#ffffff':col;
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x-d,y-d*.55);
        ctx.lineTo(x-d*.7,y+d*.7);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha=A*(1-k)*.7;
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.5;
      ctx.setLineDash([4,6]); ctx.lineDashOffset=t*(L.b||5)*8;
      for(let i=0;i<10;i++){
        const a=(i/10)*Math.PI*2+(L.a||1)*t*.4;
        const r0=R*.35, r1=R*(.7+k*.9);
        ctx.beginPath();
        ctx.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0);
        ctx.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1);
        ctx.stroke();
      }
      ctx.setLineDash([]); ctx.lineDashOffset=0;
    },
    // Glitch: barras de colores que se mueven de lado, como una tv rota.
    glitch(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*.5,col,1-k);
      const rows=7, amp=(L.b||1.2)*7, sp=(L.a||3);
      for(let i=0;i<rows;i++){
        const yy=y-R*.7+(i+.5)*(R*1.4/rows);
        const j=Math.sin(t*sp+i*2.1)*amp;
        const w=R*(1.1+((i*3)%4)/5);
        ctx.globalAlpha=A*(1-k)*(.18+(i%3)*.12);
        ctx.fillStyle=i%3===0?'#ff1744':(i%3===1?'#00e5ff':col);
        ctx.fillRect(x-w/2+j,yy-Math.max(1,w*.09)/2,w,Math.max(1,w*.09));
      }
      ctx.globalAlpha=A*(1-k)*.9;
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=Math.max(.6,2*(1-k));
      const rr=R*k*.9;
      ctx.beginPath();
      ctx.moveTo(x-rr,y); ctx.lineTo(x+rr,y);
      ctx.moveTo(x,y-rr); ctx.lineTo(x,y+rr);
      ctx.stroke();
    },
    // Neon: corazon que late, anillos con brillo y ocho destellos radially.
    neon(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      const pulse=1+Math.sin(t*(L.a||1.1))*(L.b||7)*.03;
      bola(ctx,x,y,R*k*.95*pulse,col,1-k);
      // Rayos: se van abriendo como una estrella de neón.
      ctx.shadowColor=glow; ctx.shadowBlur=16;
      ctx.strokeStyle=col; ctx.lineWidth=Math.max(.6,2.5*(1-k));
      const nr=8, spin=t*.6;
      for(let i=0;i<nr;i++){
        const a=(i/nr)*Math.PI*2+spin;
        const l0=R*k*.35*pulse, l1=R*k*(.75+.45*Math.abs(Math.sin(t*(L.a||1.1)*2+i)))*pulse;
        ctx.globalAlpha=A*(1-k)*.9;
        ctx.beginPath();
        ctx.moveTo(x+Math.cos(a)*l0,y+Math.sin(a)*l0);
        ctx.lineTo(x+Math.cos(a)*l1,y+Math.sin(a)*l1);
        ctx.stroke();
      }
      ctx.shadowBlur=0;
      for(let i=0;i<2;i++){
        const u=Math.min(1,k*(1.4-i*.4));
        if(u<=0) continue;
        ctx.globalAlpha=A*(1-u)*.95;
        ctx.shadowColor=glow; ctx.shadowBlur=18;
        ctx.strokeStyle=i?'#ffffff':col;
        ctx.lineWidth=Math.max(.6,3.5*(1-u));
        ctx.beginPath(); ctx.arc(x,y,R*u*1.05*pulse,0,Math.PI*2); ctx.stroke();
      }
      ctx.shadowBlur=0;
      ctx.globalAlpha=A*(1-k)*.85;
      ctx.fillStyle='#ffffff';
      ctx.beginPath(); ctx.arc(x,y,Math.max(1,R*.2*(1-k)),0,Math.PI*2); ctx.fill();
    },
    // Destruccion total: cruz de luz que gira, anillos y escombros.
    destruccion(ctx,x,y,col,glow,t,k,R,L){
      const A=ctx.globalAlpha==null?1:ctx.globalAlpha;
      ctx.globalAlpha=A*(1-k);
      bola(ctx,x,y,R*k*1.1,col,1-k);
      ctx.save(); ctx.translate(x,y); ctx.rotate(Math.PI/4+(L.a||1)*t*.3);
      ctx.shadowColor=glow; ctx.shadowBlur=24;
      for(let rot=0;rot<2;rot++){
        ctx.save(); ctx.rotate(rot*Math.PI/2);
        const l=R*k*1.8, w=Math.max(1,R*.16*(1-k));
        const g=ctx.createLinearGradient(-l,0,l,0);
        g.addColorStop(0,'rgba(255,255,255,0)');
        g.addColorStop(.5,'#ffffff');
        g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=g;
        ctx.fillRect(-l,-w/2,l*2,w);
        ctx.restore();
      }
      ctx.restore();
      ctx.shadowBlur=0;
      for(let i=0;i<3;i++){
        const u=(k+i/3)%1;
        ctx.globalAlpha=A*(1-u)*.8;
        ctx.strokeStyle=i%2?col:'#ffffff';
        ctx.lineWidth=Math.max(.5,4*(1-u));
        ctx.beginPath(); ctx.arc(x,y,R*u*1.5,0,Math.PI*2); ctx.stroke();
      }
      const n=10;
      for(let i=0;i<n;i++){
        const a=(i/n)*Math.PI*2+(L.a||1)*t*.8;
        const d=R*(.6+k*1.4);
        ctx.globalAlpha=A*(1-k)*.9;
        ctx.fillStyle='#ffe082';
        ctx.save();
        ctx.translate(x+Math.cos(a)*d,y+Math.sin(a)*d);
        ctx.rotate(a+t*2);
        ctx.fillRect(-R*.07,-R*.07,R*.14,R*.14);
        ctx.restore();
      }
    }
  };

  // ── Dibujo ─────────────────────────────────────────────────────────────
  // opts: { t (segundos), r (radio final), alpha, tint, tintGlow }
  // "tint" pisa el color para cuando la explosión no es del jugador (errores).
  // Devuelve la ficha usada, por si el que llama la necesita.
  function draw(ctx,impactId,x,y,k,opts){
    opts=opts||{};
    const L=byId(impactId);
    let col=L.color, glow=L.glow;
    let kk=Number(k);
    if(!isFinite(kk)) kk=0;
    kk=kk<0?0:(kk>1?1:kk);
    // Un impacto con color propio se queda con su animación, pero teñido.
    if(opts.tint) col=opts.tint;
    if(opts.tintGlow) glow=opts.tintGlow;
    else if(opts.tint) glow=opts.tint;
    const forma=formas[L.kind]||formas.chispa;
    const R=opts.r==null?34:opts.r;
    ctx.save();
    if(opts.alpha!=null) ctx.globalAlpha=opts.alpha;
    ctx.lineCap='round'; ctx.lineJoin='round';
    forma(ctx,x,y,col,glow,opts.t||0,kk,R,L);
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