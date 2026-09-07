const LEVELS = [
  {
    id: 1,
    title: 'Etiquetas HTML básicas',
    questions: [
      { q: 'Encabezado grande', a: '<h1>' },
      { q: 'Párrafo', a: '<p>' },
      { q: 'Enlace', a: '<a>' },
      { q: 'Imagen', a: '<img>' },
      { q: 'Lista ordenada', a: '<ol>' },
      { q: 'Lista desordenada', a: '<ul>' },
      { q: 'Elemento en línea', a: '<span>' },
      { q: 'División', a: '<div>' },
      { q: 'Negrita', a: '<b>' },
      { q: 'Cursiva', a: '<i>' }
    ],
    enemySpeed: 0.4,
    spawnInterval: 100,
    enemyHealth: 1
  },
  {
    id: 2,
    title: 'Más etiquetas HTML',
    questions: [
      { q: 'Botón', a: '<button>' },
      { q: 'Campo de entrada', a: '<input>' },
      { q: 'Etiqueta de formulario', a: '<label>' },
      { q: 'Tabla', a: '<table>' },
      { q: 'Fila de tabla', a: '<tr>' },
      { q: 'Celda de tabla', a: '<td>' },
      { q: 'Encabezado de celda', a: '<th>' },
      { q: 'Separador', a: '<hr>' },
      { q: 'Salto de línea', a: '<br>' },
      { q: 'Negrita fuerte', a: '<strong>' }
    ],
    enemySpeed: 0.5,
    spawnInterval: 90,
    enemyHealth: 1
  },
  {
    id: 3,
    title: 'Selectores CSS',
    questions: [
      { q: 'Selector por ID', a: '#' },
      { q: 'Selector por clase', a: '.' },
      { q: 'Selector universal', a: '*' },
      { q: 'Pseudoclase hover', a: ':hover' },
      { q: 'Pseudoclase active', a: ':active' },
      { q: 'Hijo directo', a: '>' },
      { q: 'Descendiente', a: ' ' },
      { q: 'Pseudoclase focus', a: ':focus' },
      { q: 'Pseudoelemento', a: '::' },
      { q: 'Atributo', a: '[]' }
    ],
    enemySpeed: 0.5,
    spawnInterval: 85,
    enemyHealth: 1
  },
  {
    id: 4,
    title: 'Propiedades CSS',
    questions: [
      { q: 'Color de texto', a: 'color' },
      { q: 'Tamaño de fuente', a: 'font-size' },
      { q: 'Fondo', a: 'background' },
      { q: 'Ancho', a: 'width' },
      { q: 'Altura', a: 'height' },
      { q: 'Margen exterior', a: 'margin' },
      { q: 'Margen interior', a: 'padding' },
      { q: 'Borde', a: 'border' },
      { q: 'Posición', a: 'position' },
      { q: 'Alinear texto', a: 'text-align' }
    ],
    enemySpeed: 0.6,
    spawnInterval: 80,
    enemyHealth: 1
  },
  {
    id: 5,
    title: 'Flexbox CSS',
    questions: [
      { q: 'Alinear contenido', a: 'justify-content' },
      { q: 'Alinear ítems', a: 'align-items' },
      { q: 'Dirección flex', a: 'flex-direction' },
      { q: 'Envolver ítems', a: 'flex-wrap' },
      { q: 'Brecha entre ítems', a: 'gap' },
      { q: 'Alineación individual', a: 'align-self' },
      { q: 'Orden visual', a: 'order' },
      { q: 'Crecimiento flex', a: 'flex-grow' },
      { q: 'Activar flexbox', a: 'display: flex' },
      { q: 'Alinear contenido cruzado', a: 'align-content' }
    ],
    enemySpeed: 0.6,
    spawnInterval: 75,
    enemyHealth: 1
  },
  {
    id: 6,
    title: 'JavaScript básico',
    questions: [
      { q: 'Variable mutable', a: 'let' },
      { q: 'Variable constante', a: 'const' },
      { q: 'Variable global', a: 'var' },
      { q: 'Función flecha', a: '=>' },
      { q: 'Imprimir en consola', a: 'console.log()' },
      { q: 'Comparación estricta', a: '===' },
      { q: 'Condición si', a: 'if' },
      { q: 'Bucle for', a: 'for' },
      { q: 'Concatenar template', a: '``' },
      { q: 'Array literal', a: '[]' }
    ],
    enemySpeed: 0.7,
    spawnInterval: 70,
    enemyHealth: 1
  },
  {
    id: 7,
    title: 'JavaScript DOM',
    questions: [
      { q: 'Obtener elemento por ID', a: 'getElementById()' },
      { q: 'Seleccionar uno', a: 'querySelector()' },
      { q: 'Seleccionar varios', a: 'querySelectorAll()' },
      { q: 'Crear elemento', a: 'createElement()' },
      { q: 'Agregar al DOM', a: 'appendChild()' },
      { q: 'Texto de elemento', a: 'textContent' },
      { q: 'HTML interno', a: 'innerHTML' },
      { q: 'Agregar clase', a: 'classList.add()' },
      { q: 'Escuchar evento', a: 'addEventListener()' },
      { q: 'Estilo en línea', a: 'style' }
    ],
    enemySpeed: 0.7,
    spawnInterval: 65,
    enemyHealth: 2
  },
  {
    id: 8,
    title: 'JavaScript funciones y métodos',
    questions: [
      { q: 'Convertir a número', a: 'parseInt()' },
      { q: 'Convertir a texto', a: 'toString()' },
      { q: 'Longitud de array', a: '.length' },
      { q: 'Agregar al final', a: 'push()' },
      { q: 'Quitar del final', a: 'pop()' },
      { q: 'Buscar en array', a: 'find()' },
      { q: 'Filtrar array', a: 'filter()' },
      { q: 'Transformar array', a: 'map()' },
      { q: 'Reducir array', a: 'reduce()' },
      { q: 'Incluir elemento', a: 'includes()' }
    ],
    enemySpeed: 0.8,
    spawnInterval: 60,
    enemyHealth: 2
  },
  {
    id: 9,
    title: 'Async JS y más',
    questions: [
      { q: 'Función asíncrona', a: 'async' },
      { q: 'Esperar resultado', a: 'await' },
      { q: 'Promesa', a: 'Promise' },
      { q: 'Petición HTTP', a: 'fetch()' },
      { q: 'JSON a objeto', a: 'JSON.parse()' },
      { q: 'Objeto a JSON', a: 'JSON.stringify()' },
      { q: 'Destructurar objeto', a: '{}' },
      { q: 'Parámetro por defecto', a: '=' },
      { q: 'Desestructurar array', a: '[]' },
      { q: 'Spread operator', a: '...' }
    ],
    enemySpeed: 0.9,
    spawnInterval: 55,
    enemyHealth: 2
  },
  {
    id: 10,
    title: '¡Nivel final! Mixto',
    questions: [
      { q: 'Media query', a: '@media' },
      { q: 'Animación CSS', a: '@keyframes' },
      { q: 'Variable CSS', a: '--' },
      { q: 'Clase de error', a: '.error' },
      { q: 'Evento submit', a: 'onsubmit' },
      { q: 'Valor de input', a: '.value' },
      { q: 'LocalStorage', a: 'localStorage' },
      { q: 'Método GET', a: 'fetch("url")' },
      { q: 'Iterar objeto', a: 'for...in' },
      { q: 'Exportar módulo', a: 'export' }
    ],
    enemySpeed: 1.0,
    spawnInterval: 50,
    enemyHealth: 2
  },
  {
    id: 11,
    title: '👑 JEFE FINAL',
    isBoss: true,
    bossHealth: 10,
    questions: [
      { q: 'Encabezado grande', a: '<h1>' },
      { q: 'Color de texto', a: 'color' },
      { q: 'Variable mutable', a: 'let' },
      { q: 'Selector por ID', a: '#' },
      { q: 'Alinear contenido', a: 'justify-content' },
      { q: 'Obtener por ID', a: 'getElementById()' },
      { q: 'Media query', a: '@media' },
      { q: 'Petición HTTP', a: 'fetch()' },
      { q: 'Agregar al final', a: 'push()' },
      { q: 'Promesa', a: 'Promise' },
      { q: 'Borde', a: 'border' },
      { q: 'Función flecha', a: '=>' },
      { q: 'Tabla', a: '<table>' },
      { q: 'Animación CSS', a: '@keyframes' },
      { q: 'LocalStorage', a: 'localStorage' }
    ],
    enemySpeed: 0,
    spawnInterval: 0,
    enemyHealth: 10
  }
];

module.exports = LEVELS;
