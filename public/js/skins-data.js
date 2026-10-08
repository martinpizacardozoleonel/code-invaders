/* ═══════════════════════════════════════════════════════════════════════
   SKINS-DATA — Catálogo único de naves del jugador.
   Antes cada archivo mantenía su propia copia (game.js, api.js, multi.js y
   server.js) y por eso agregar una skin era olvidarla en un lado. Ahora
   todos leen de acá.
   Campos:
     id      identificador único (es lo que se guarda en la DB)
     name    nombre visible en la tienda
     price   precio en puntos
     body    color del casco
     accent  color de la cabina
     glow    color del resplandor
     hull    id de silueta (ver Hulls)
     fire    color de la llama del motor
     flame   forma de la llama: 'normal' | 'doble' | 'triple' | 'largo'
     spin    'no' | 'medio' | 'rapido' — aleteo de la nave
     shot    efecto al disparar: 'pulso'|'onda'|'chispa'|'anillo'|'doble'|'estela'
   ═══════════════════════════════════════════════════════════════════════ */
const SKIN_DATA=[
/* ── Las 18 originales: precio y color intactos ───────────────────────── */
{id:'default',name:'DEV Cyan',price:0,body:'#00e5ff',accent:'#80d8ff',glow:'#00e5ff',hull:'arrow',fire:'#ff6d00',flame:'normal',spin:'no',shot:'pulso'},
{id:'crimson',name:'Crimson Fury',price:120,body:'#ff1744',accent:'#ff8a80',glow:'#ff5252',hull:'arrow',fire:'#ffab00',flame:'doble',spin:'no',shot:'onda'},
{id:'gold',name:'Golden Nova',price:200,body:'#ffd600',accent:'#fff176',glow:'#ffea00',hull:'rhomb',fire:'#ff6d00',flame:'triple',spin:'no',shot:'chispa'},
{id:'neon',name:'Neon Viper',price:300,body:'#00e676',accent:'#69f0ae',glow:'#00e676',hull:'kamikaze',fire:'#00e5ff',flame:'largo',spin:'medio',shot:'doble'},
{id:'violet',name:'Violet Storm',price:350,body:'#7c4dff',accent:'#b388ff',glow:'#7c4dff',hull:'delta',fire:'#e040fb',flame:'normal',spin:'no',shot:'pulso'},
{id:'pixel',name:'Pixel Phantom',price:500,body:'#ff6d00',accent:'#ffab40',glow:'#ff9e00',hull:'mummy',fire:'#ffd600',flame:'normal',spin:'no',shot:'chispa'},
{id:'ocean',name:'Oceano',price:600,body:'#2196f3',accent:'#82b4ff',glow:'#2196f3',hull:'bee',fire:'#00e5ff',flame:'doble',spin:'medio',shot:'onda'},
{id:'rosa',name:'Rosa Neon',price:750,body:'#ff4081',accent:'#ff8a80',glow:'#ff4081',hull:'ufo',fire:'#ffd6e0',flame:'normal',spin:'no',shot:'anillo'},
{id:'lima',name:'Lima Acida',price:850,body:'#c6ff00',accent:'#eaff8a',glow:'#c6ff00',hull:'drone',fire:'#76ff03',flame:'triple',spin:'rapido',shot:'chispa'},
{id:'ghost',name:'Fantasma',price:950,body:'#eceff1',accent:'#ffffff',glow:'#ffffff',hull:'ufo',fire:'#b3e5fc',flame:'largo',spin:'medio',shot:'estela'},
{id:'camo',name:'Camuflaje',price:1000,body:'#7c9a3f',accent:'#b2d67c',glow:'#9ccc65',hull:'spider',fire:'#ffab40',flame:'normal',spin:'no',shot:'pulso'},
{id:'magma',name:'Magma',price:1200,body:'#ff3d00',accent:'#ff8a65',glow:'#ff3d00',hull:'loco',fire:'#ffd600',flame:'largo',spin:'no',shot:'onda'},
{id:'ice',name:'Hielo',price:1350,body:'#80d8ff',accent:'#e1f5fe',glow:'#80d8ff',hull:'crystal',fire:'#b3e5fc',flame:'triple',spin:'no',shot:'anillo'},
{id:'nebula',name:'Nebulosa',price:1500,body:'#e040fb',accent:'#ea80fc',glow:'#e040fb',hull:'carrier',fire:'#7c4dff',flame:'largo',spin:'medio',shot:'estela'},
{id:'solar',name:'Solar',price:1650,body:'#fff176',accent:'#fff9c4',glow:'#ffd600',hull:'wings',fire:'#ff9100',flame:'doble',spin:'medio',shot:'onda'},
{id:'platinum',name:'Platino',price:1800,body:'#cfd8dc',accent:'#ffffff',glow:'#ffffff',hull:'rocket',fire:'#00e5ff',flame:'normal',spin:'no',shot:'doble'},
{id:'obsidian',name:'Obsidiana',price:2100,body:'#1a1a2e',accent:'#5c6bc0',glow:'#ff1744',hull:'spider',fire:'#7c4dff',flame:'doble',spin:'no',shot:'anillo'},
{id:'diamond',name:'Diamante',price:2500,body:'#b3ffff',accent:'#ffffff',glow:'#ffffff',hull:'crystal',fire:'#00e5ff',flame:'triple',spin:'rapido',shot:'chispa'},

/* ── Nuevas naves arcade: siluetas y efectos distintos ────────────────── */
{id:'retro_wing',name:'🕹️ Retro Wing',price:2800,body:'#ff5252',accent:'#ff8a80',glow:'#ff1744',hull:'wings',fire:'#ffab00',flame:'normal',spin:'medio',shot:'pulso'},
{id:'turbo_delta',name:'⚡ Turbo Delta',price:3100,body:'#40c4ff',accent:'#b3e5fc',glow:'#00b0ff',hull:'delta',fire:'#ff6d00',flame:'doble',spin:'rapido',shot:'estela'},
{id:'bubble_drone',name:'🫧 Bubble Drone',price:3300,body:'#4dd0e1',accent:'#b2ebf2',glow:'#26c6da',hull:'drone',fire:'#80deea',flame:'normal',spin:'rapido',shot:'anillo'},
{id:'toon_mummy',name:'🧟 Toon Mummy',price:3500,body:'#c5e1a5',accent:'#f0f4c3',glow:'#8bc34a',hull:'mummy',fire:'#aed581',flame:'normal',spin:'medio',shot:'chispa'},
{id:'spider_mech',name:'🕷️ Spider Mech',price:3700,body:'#616161',accent:'#bdbdbd',glow:'#9e9e9e',hull:'spider',fire:'#ff6d00',flame:'doble',spin:'no',shot:'onda'},
{id:'crystal_ship',name:'💎 Crystal Ship',price:3900,body:'#18ffff',accent:'#b2ebf2',glow:'#00e5ff',hull:'crystal',fire:'#64ffda',flame:'triple',spin:'medio',shot:'chispa'},
{id:'bee_sting',name:'🐝 Bee Sting',price:4100,body:'#ffca28',accent:'#fff59d',glow:'#ffab00',hull:'bee',fire:'#ff6d00',flame:'normal',spin:'rapido',shot:'pulso'},
{id:'loco_train',name:'🚂 Loco Train',price:4300,body:'#795548',accent:'#a1887f',glow:'#d7ccc8',hull:'loco',fire:'#ff8f00',flame:'largo',spin:'no',shot:'doble'},
{id:'rocket_sonic',name:'🚀 Sonic Rocket',price:4500,body:'#e53935',accent:'#ffcdd2',glow:'#ff1744',hull:'rocket',fire:'#ff9100',flame:'largo',spin:'no',shot:'estela'},
{id:'deep_space',name:'🌌 Deep Space',price:4700,body:'#311b92',accent:'#7c4dff',glow:'#651fff',hull:'carrier',fire:'#00e5ff',flame:'triple',spin:'medio',shot:'onda'},
{id:'toxic_wasp',name:'☢️ Toxic Wasp',price:4900,body:'#aeea00',accent:'#d4ff80',glow:'#76ff03',hull:'kamikaze',fire:'#00e676',flame:'doble',spin:'rapido',shot:'anillo'},
{id:'stealth_jet',name:'🕶️ Stealth Jet',price:5100,body:'#263238',accent:'#78909c',glow:'#00bcd4',hull:'delta',fire:'#00e5ff',flame:'normal',spin:'medio',shot:'estela'},
{id:'alien_ufo',name:'🛸 Alien UFO',price:5300,body:'#00bfa5',accent:'#64ffda',glow:'#00e5ff',hull:'ufo',fire:'#7c4dff',flame:'largo',spin:'medio',shot:'anillo'},
{id:'pumpkin_jet',name:'🎃 Pumpkin Jet',price:5500,body:'#ff6f00',accent:'#ffab40',glow:'#ff9100',hull:'ufo',fire:'#00e676',flame:'normal',spin:'no',shot:'pulso'},
{id:'lava_dragon',name:'🐉 Lava Dragon',price:5800,body:'#bf360c',accent:'#ff8a65',glow:'#ff3d00',hull:'mummy',fire:'#ffd600',flame:'largo',spin:'no',shot:'onda'},
{id:'frost_wolf',name:'🐺 Frost Wolf',price:6000,body:'#81d4fa',accent:'#e1f5fe',glow:'#4fc3f7',hull:'spider',fire:'#b3e5fc',flame:'triple',spin:'rapido',shot:'chispa'},
{id:'cyber_ronin',name:'🥷 Cyber Ronin',price:6300,body:'#d32f2f',accent:'#ff8a80',glow:'#ff1744',hull:'kamikaze',fire:'#ffd600',flame:'doble',spin:'rapido',shot:'doble'},
{id:'galaxy_wing',name:'🌠 Galaxy Wing',price:6600,body:'#5e35b1',accent:'#b388ff',glow:'#7c4dff',hull:'wings',fire:'#e040fb',flame:'largo',spin:'medio',shot:'estela'},
{id:'toxic_dron',name:'🛸 Toxic Dron',price:6900,body:'#558b2f',accent:'#aed581',glow:'#7cb342',hull:'drone',fire:'#c0ff33',flame:'normal',spin:'rapido',shot:'anillo'},
{id:'plasma_jet',name:'⚛️ Plasma Jet',price:7200,body:'#00bcd4',accent:'#80deea',glow:'#00e5ff',hull:'rocket',fire:'#e040fb',flame:'triple',spin:'no',shot:'onda'},
{id:'magma_horn',name:'🌋 Magma Horn',price:7500,body:'#e64a19',accent:'#ffab91',glow:'#ff3d00',hull:'loco',fire:'#ffca28',flame:'largo',spin:'no',shot:'doble'},
{id:'phantom_wing',name:'👻 Phantom Wing',price:7800,body:'#b0bec5',accent:'#eceff1',glow:'#ffffff',hull:'wings',fire:'#4fc3f7',flame:'normal',spin:'medio',shot:'estela'},
{id:'quantum_node',name:'🔮 Quantum Node',price:8200,body:'#7b1fa2',accent:'#ce93d8',glow:'#e040fb',hull:'rhomb',fire:'#00e5ff',flame:'triple',spin:'rapido',shot:'chispa'},
{id:'solar_flare',name:'☀️ Solar Flare',price:8600,body:'#ffab00',accent:'#ffe082',glow:'#ffd600',hull:'crystal',fire:'#ff3d00',flame:'largo',spin:'medio',shot:'onda'},
{id:'blood_hunter',name:'🩸 Blood Hunter',price:9000,body:'#8e0000',accent:'#ef5350',glow:'#ff1744',hull:'kamikaze',fire:'#ff5252',flame:'doble',spin:'rapido',shot:'doble'},
{id:'ocean_depth',name:'🌊 Ocean Depth',price:9400,body:'#01579b',accent:'#4fc3f7',glow:'#0288d1',hull:'bee',fire:'#00e5ff',flame:'largo',spin:'medio',shot:'anillo'},
{id:'toon_ghost',name:'👻 Toon Ghost',price:9800,body:'#eeeeee',accent:'#ffffff',glow:'#b0bec5',hull:'ufo',fire:'#80d8ff',flame:'normal',spin:'medio',shot:'estela'},
{id:'carnival_jet',name:'🎪 Carnival Jet',price:10200,body:'#e91e63',accent:'#f8bbd0',glow:'#ff4081',hull:'delta',fire:'#ffd600',flame:'doble',spin:'rapido',shot:'chispa'},
{id:'steel_titan',name:'🤖 Steel Titan',price:10800,body:'#546e7a',accent:'#90a4ae',glow:'#78909c',hull:'carrier',fire:'#ff6d00',flame:'largo',spin:'no',shot:'doble'},
{id:'neon_racer',name:'🏎️ Neon Racer',price:11500,body:'#ff2e63',accent:'#ff8a80',glow:'#ff1744',hull:'loco',fire:'#00e5ff',flame:'triple',spin:'rapido',shot:'estela'},
{id:'sakura_dron',name:'🌸 Sakura Dron',price:12200,body:'#f8bbd0',accent:'#fff0f5',glow:'#ff80ab',hull:'drone',fire:'#ff4081',flame:'normal',spin:'medio',shot:'anillo'},
{id:'obsidian_beast',name:'🐲 Obsidian Beast',price:13000,body:'#3a0ca3',accent:'#7209b7',glow:'#f72585',hull:'mummy',fire:'#4cc9f0',flame:'largo',spin:'medio',shot:'onda'},
{id:'pixel_warrior',name:'🕹️ Pixel Warrior',price:13800,body:'#00bcd4',accent:'#e0f7fa',glow:'#00e5ff',hull:'arrow',fire:'#ffea00',flame:'normal',spin:'rapido',shot:'chispa'},
{id:'cyber_punk',name:'🎸 Cyber Punk',price:14600,body:'#d81b60',accent:'#ff80ab',glow:'#ff2e63',hull:'wings',fire:'#00e5ff',flame:'doble',spin:'rapido',shot:'doble'},
{id:'supernova',name:'💥 Supernova',price:15500,body:'#ff1744',accent:'#ff8a80',glow:'#ff5252',hull:'rhomb',fire:'#ffd600',flame:'triple',spin:'rapido',shot:'onda'},
{id:'void_rider',name:'🕳️ Void Rider',price:16500,body:'#120458',accent:'#5e35b1',glow:'#7c4dff',hull:'kamikaze',fire:'#e040fb',flame:'largo',spin:'medio',shot:'estela'},
{id:'neon_arcade',name:'🕹️ Neon Arcade',price:17500,body:'#00e676',accent:'#b9f6ca',glow:'#00ff9d',hull:'arrow',fire:'#ff2e63',flame:'doble',spin:'rapido',shot:'chispa'},
{id:'astro_wing',name:'🌌 Astro Wing',price:18600,body:'#283593',accent:'#5c6bc0',glow:'#3f51b5',hull:'wings',fire:'#ffca28',flame:'largo',spin:'medio',shot:'onda'},
{id:'holy_rhomb',name:'💎 Holy Rhomb',price:19800,body:'#fff9c4',accent:'#ffffff',glow:'#ffeb3b',hull:'rhomb',fire:'#00e5ff',flame:'triple',spin:'no',shot:'anillo'},
{id:'chaos_dron',name:'🌀 Chaos Dron',price:21000,body:'#6a1b9a',accent:'#ba68c8',glow:'#9c27b0',hull:'spider',fire:'#00e676',flame:'doble',spin:'rapido',shot:'onda'},
{id:'iron_beast',name:'🦾 Iron Beast',price:22500,body:'#37474f',accent:'#78909c',glow:'#546e7a',hull:'carrier',fire:'#ff6d00',flame:'largo',spin:'no',shot:'doble'},
{id:'lava_jet',name:'🌋 Lava Jet',price:24000,body:'#bf360c',accent:'#ff8a65',glow:'#ff5722',hull:'rocket',fire:'#ffd600',flame:'triple',spin:'medio',shot:'onda'},
{id:'cyber_laser',name:'🔫 Cyber Laser',price:25500,body:'#1a237e',accent:'#5c6bc0',glow:'#00e5ff',hull:'arrow',fire:'#e040fb',flame:'largo',spin:'medio',shot:'estela'},
{id:'golden_phoenix',name:'🔥 Golden Phoenix',price:27500,body:'#ffab00',accent:'#ffe082',glow:'#ffd600',hull:'wings',fire:'#ff3d00',flame:'triple',spin:'rapido',shot:'onda'},
{id:'plasma_nova',name:'⚡ Plasma Nova',price:30000,body:'#e100ff',accent:'#f0a2ff',glow:'#ff00ff',hull:'crystal',fire:'#00e5ff',flame:'triple',spin:'rapido',shot:'chispa'},
{id:'quantum_jet',name:'⚛️ Quantum Jet',price:33000,body:'#00b0ff',accent:'#80d8ff',glow:'#00e5ff',hull:'delta',fire:'#ff00ff',flame:'largo',spin:'rapido',shot:'doble'},
{id:'time_warp',name:'⏳ Time Warp',price:36000,body:'#311b92',accent:'#9575cd',glow:'#7c4dff',hull:'carrier',fire:'#ffab00',flame:'triple',spin:'medio',shot:'estela'},
{id:'infinite_beast',name:'♾️ Infinite Beast',price:40000,body:'#000000',accent:'#00e676',glow:'#00ff9d',hull:'mummy',fire:'#ff00ff',flame:'largo',spin:'rapido',shot:'anillo'}
];

/* Catálogo de efectos al disparar, con la forma de pintado. */
const SHOT_FX={
 pulso:{name:'Pulso',draw(ctx,s,t){ ctx.beginPath(); ctx.arc(0,0,s*(0.5+t*2.4),0,Math.PI*2); ctx.globalAlpha=1-t*2.2; ctx.lineWidth=3; ctx.stroke(); }},
 onda:{name:'Onda',draw(ctx,s,t){ for(let i=0;i<3;i++){ ctx.globalAlpha=1-t*2.2; ctx.beginPath(); ctx.ellipse(0,0,s*(0.6+t*3.4)*(1+i*.28),s*(0.3+t*1.7)*(1+i*.28),0,0,Math.PI*2); ctx.lineWidth=2.4; ctx.stroke(); } }},
 chispa:{name:'Chispa',draw(ctx,s,t){ ctx.globalAlpha=1-t*2; for(let i=0;i<6;i++){ const a=i*Math.PI/3+t*4; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*s*(0.5+t*3),Math.sin(a)*s*(0.5+t*3)); ctx.lineWidth=2; ctx.stroke(); } }},
 anillo:{name:'Anillo',draw(ctx,s,t){ ctx.globalAlpha=1-t*2.2; ctx.beginPath(); ctx.arc(0,0,s*(0.4+t*4),0,Math.PI*2); ctx.lineWidth=4; ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,s*(0.2+t*2),0,Math.PI*2); ctx.lineWidth=2; ctx.stroke(); }},
 doble:{name:'Doble',draw(ctx,s,t){ for(const d of [-1,1]){ ctx.globalAlpha=1-t*2; ctx.beginPath(); ctx.arc(d*s*(0.4+t*2),0,s*(0.3+t*1.6),0,Math.PI*2); ctx.lineWidth=2.6; ctx.stroke(); } }},
 estela:{name:'Estela',draw(ctx,s,t){ ctx.globalAlpha=1-t*2; ctx.beginPath(); ctx.moveTo(0,-s*2); ctx.lineTo(-s*(0.4+t*1.6),s*2); ctx.lineTo(s*(0.4+t*1.6),s*2); ctx.closePath(); ctx.lineWidth=2; ctx.stroke(); }}
};

/* Índice para búsqueda rápida. */
const SKIN_MAP={};
SKIN_DATA.forEach(s=>{ SKIN_MAP[s.id]=s; });

function skinDataById(id){
  return SKIN_MAP[id]||SKIN_DATA[0];
}
