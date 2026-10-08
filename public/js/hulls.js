/* ═══════════════════════════════════════════════════════════════════════
   HULLS — Siluetas de nave del jugador (estilo arcade)

   Cada silueta es un polígono centrado en (0,0). Las coordenadas andan
   alrededor de x:-30..30 y y:-30..28, o sea el tamaño real de la nave.

   La idea es que la misma silueta se pueda pintar en el canvas del juego,
   en el canvas del multijugador, en la vista previa de la tienda y en el
   SVG del lobby. Para eso todas usan el mismo formato: una lista de pares
   [x,y].
   ═══════════════════════════════════════════════════════════════════════ */
const Hulls=(function(){
  var P={
    arrow:    [[0,-30],[-26,24],[-9,14],[0,20],[9,14],[26,24]],
    delta:    [[0,-30],[-24,10],[-10,6],[-6,26],[0,18],[6,26],[10,6],[24,10]],
    ufo:      [[-24,-4],[-15,-14],[15,-14],[24,-4],[13,10],[-13,10]],
    drone:    [[0,-26],[-8,-6],[-26,4],[-22,18],[-6,12],[0,22],[6,12],[22,18],[26,4],[8,-6]],
    mummy:    [[0,-28],[-12,-16],[-8,-2],[-24,8],[-16,24],[-4,14],[0,26],[4,14],[16,24],[24,8],[8,-2],[12,-16]],
    crystal:  [[0,-30],[16,-10],[10,24],[0,16],[-10,24],[-16,-10]],
    spider:   [[0,-24],[-6,-6],[-28,-10],[-22,8],[-10,6],[-4,26],[4,26],[10,6],[22,8],[28,-10],[6,-6]],
    wings:    [[0,-28],[-14,-12],[-30,-2],[-20,10],[-8,4],[0,22],[8,4],[20,10],[30,-2],[14,-12]],
    loco:     [[-6,-30],[6,-30],[10,-8],[26,-8],[30,2],[16,6],[8,22],[-8,22],[-16,6],[-30,2],[-26,-8],[-10,-8]],
    rocket:   [[0,-30],[10,-16],[10,4],[20,10],[12,16],[4,12],[-4,12],[-12,16],[-20,10],[-10,4],[-10,-16]],
    bee:      [[0,-26],[-9,-8],[-27,-14],[-20,6],[-7,8],[-3,26],[3,26],[7,8],[20,6],[27,-14],[9,-8]],
    carrier:  [[0,-28],[-20,-12],[-30,2],[-18,10],[-8,6],[-5,26],[5,26],[8,6],[18,10],[30,2],[20,-12]],
    rhomb:    [[0,-30],[20,0],[0,28],[-20,0]],
    kamikaze: [[0,-26],[-30,-4],[-12,-2],[-16,24],[0,14],[16,24],[12,-2],[30,-4]]
  };
  var META={
    arrow:{name:'Flecha',w:52,h:54},      delta:{name:'Delta',w:50,h:56},
    ufo:{name:'OVNI',w:50,h:26},           drone:{name:'Dron',w:54,h:50},
    mummy:{name:'Momia',w:50,h:56},        crystal:{name:'Cristal',w:34,h:54},
    spider:{name:'Araña',w:58,h:52},       wings:{name:'Alas',w:62,h:50},
    loco:{name:'Locomotora',w:62,h:54},    rocket:{name:'Cohete',w:42,h:48},
    bee:{name:'Abeja',w:56,h:54},          carrier:{name:'Nodriza',w:62,h:56},
    rhomb:{name:'Rombo',w:42,h:58},        kamikaze:{name:'Kamikaze',w:60,h:52}
  };
  var IDS=Object.keys(P);

  function points(id){ return P[id]||P.arrow; }
  function meta(id){ return META[id]||META.arrow; }

  // Arma el path del polígono en el contexto. No pinta nada.
  function trace(ctx,id){
    var p=points(id);
    ctx.beginPath();
    ctx.moveTo(p[0][0],p[0][1]);
    for(var i=1;i<p.length;i++) ctx.lineTo(p[i][0],p[i][1]);
    ctx.closePath();
    return p;
  }
  // Solo el contorno, para cuando el que pinta se ocupa del relleno.
  function draw(ctx,id){ return trace(ctx,id); }
  // Relleno + borde. Es lo que usa el juego, el multi y la tienda.
  function drawStroked(ctx,id,body,edge,edgeW){
    trace(ctx,id);
    ctx.fillStyle=body; ctx.fill();
    ctx.strokeStyle=edge||'rgba(255,255,255,.85)';
    ctx.lineWidth=edgeW||1.2;
    ctx.stroke();
  }
  // Versión SVG para el lobby: el mismo polígono en un atributo d.
  function svgPath(id){
    var p=points(id), out=[];
    for(var i=0;i<p.length;i++) out.push((i?'L':'M')+p[i][0]+','+p[i][1]);
    return out.join(' ')+' Z';
  }
  return { IDS:IDS, points:points, meta:meta, draw:draw, drawStroked:drawStroked, svgPath:svgPath };
})();
