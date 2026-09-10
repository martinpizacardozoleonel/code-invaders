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
  }
];

module.exports = LEVELS;
