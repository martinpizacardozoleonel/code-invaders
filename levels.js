const LEVELS = [
  {
    id: 1,
    title: 'HTML Básico',
    questions: [
      { q: 'Encabezado grande', a: '<h1>' },
      { q: 'Párrafo', a: '<p>' },
      { q: 'Enlace', a: '<a>' },
      { q: 'Imagen', a: '<img>' },
      { q: 'Lista desordenada', a: '<ul>' },
      { q: 'División', a: '<div>' },
      { q: 'Elemento en línea', a: '<span>' },
      { q: 'Botón', a: '<button>' },
      { q: 'Campo de entrada', a: '<input>' },
      { q: 'Tabla', a: '<table>' }
    ],
    enemySpeed: 0.5,
    spawnInterval: 90,
    enemyHealth: 1
  },
  {
    id: 2,
    title: 'CSS Básico',
    questions: [
      { q: 'Margen exterior', a: 'margin' },
      { q: 'Color de texto', a: 'color' },
      { q: 'Borde', a: 'border' },
      { q: 'Posición', a: 'position' },
      { q: 'Selector por clase', a: '.' },
      { q: 'Selector por ID', a: '#' },
      { q: 'Tamaño de fuente', a: 'font-size' },
      { q: 'Alinear texto', a: 'text-align' },
      { q: 'Pseudoclase hover', a: ':hover' },
      { q: 'Activar flexbox', a: 'display: flex' }
    ],
    enemySpeed: 0.7,
    spawnInterval: 75,
    enemyHealth: 1
  },
  {
    id: 3,
    title: 'JS Básico',
    questions: [
      { q: 'Variable mutable', a: 'let' },
      { q: 'Variable constante', a: 'const' },
      { q: 'Comparación estricta', a: '===' },
      { q: 'Función flecha', a: '=>' },
      { q: 'Condición si', a: 'if' },
      { q: 'Bucle for', a: 'for' }
    ],
    enemySpeed: 0.5,
    spawnInterval: 95,
    enemyHealth: 1
  },
  {
    id: 4,
    title: '👑 JEFE FINAL',
    isBoss: true,
    bossHealth: 12,
    questions: [
      { q: 'Encabezado grande', a: '<h1>' },
      { q: 'Color de texto', a: 'color' },
      { q: 'Variable mutable', a: 'let' },
      { q: 'Selector por ID', a: '#' },
      { q: 'Borde', a: 'border' },
      { q: 'Función flecha', a: '=>' },
      { q: 'Tabla', a: '<table>' },
      { q: 'Obtener por ID', a: 'getElementById()' },
      { q: 'Petición HTTP', a: 'fetch()' },
      { q: 'Agregar al final', a: 'push()' }
    ],
    enemySpeed: 0,
    spawnInterval: 0,
    enemyHealth: 12
  },
  {
    id: 5,
    title: '👑 JEFE CSS',
    isBoss: true,
    isCssBoss: true,
    bossHealth: 10,
    questions: [
      { q: 'Color de texto', a: 'color' },
      { q: 'Fondo', a: 'background' },
      { q: 'Margen exterior', a: 'margin' },
      { q: 'Margen interior', a: 'padding' },
      { q: 'Borde', a: 'border' },
      { q: 'Ancho', a: 'width' },
      { q: 'Altura', a: 'height' },
      { q: 'Posición', a: 'position' },
      { q: 'Alinear ítems', a: 'align-items' },
      { q: 'Justificar contenido', a: 'justify-content' }
    ],
    enemySpeed: 0,
    spawnInterval: 0,
    enemyHealth: 1
  },
  {
    // Nivel 6 · Jefe de JavaScript. Va por etapas (el juego las maneja
    // aparte): 4 naves HTML, después 2 naves con vida y después se vuelve
    // furioso y tira 5 naves CSS. Al final abre un portal.
    id: 6,
    title: '👑 JEFE JAVASCRIPT',
    isBoss: true,
    isJsBoss: true,
    bossHealth: 15,
    questions: [
      { tag: '<h1>' }, { tag: '<p>' }, { tag: '<a>' }, { tag: '<img>' },
      { tag: '<ul>' }, { tag: '<div>' }, { tag: '<span>' }, { tag: '<button>' },
      { tag: '<input>' }, { tag: '<table>' }, { tag: 'margin' }, { tag: 'padding' },
      { tag: 'border' }, { tag: 'display: flex' }, { tag: 'text-align' }
    ],
    enemySpeed: 0,
    spawnInterval: 0,
    enemyHealth: 1
  },
  {
    // Nivel 7 · Primer nivel de la GALAXIA 2 (Nebulosa Violeta). Son 13 naves
    // y baja exactamente igual que en la primera galaxia (misma velocidad y
    // mismo tiempo), pero hay más: tardan un poco más en limpiarse.
    id: 7,
    title: 'Galaxia 2 · HTML + CSS + JS',
    galaxy: 2,
    questions: [
      { q: 'Etiqueta de negrita', a: '<strong>' },
      { q: 'Etiqueta de cursiva', a: '<em>' },
      { q: 'Salto de línea', a: '<br>' },
      { q: 'Etiqueta de párrafo', a: '<p>' },
      { q: 'Etiqueta de lista', a: '<ul>' },
      { q: 'Etiqueta de divisor', a: '<hr>' },
      { q: 'Etiqueta de cita', a: '<blockquote>' },
      { q: 'Etiqueta de código', a: '<code>' },
      { q: 'Margen exterior', a: 'margin' },
      { q: 'Margen interior', a: 'padding' },
      { q: 'Borde redondeado', a: 'border-radius' },
      { q: 'Sombra de la caja', a: 'box-shadow' },
      { q: 'Transición', a: 'transition' }
    ],
    enemySpeed: 0.5,
    spawnInterval: 90,
    enemyHealth: 1
  }
];

module.exports = LEVELS;
