/**
 * Punto de entrada principal para HTTPLazy
 *
 * Este archivo detecta automáticamente si estamos en un entorno navegador
 * o Node.js y carga el módulo apropiado.
 */

// Detectar si estamos en un entorno Node.js
const isNode = typeof process !== 'undefined' &&
               process.versions != null &&
               process.versions.node != null;

// Exportar el módulo adecuado según el entorno
if (isNode) {
  // Estamos en Node.js, exportar la versión completa
  module.exports = require('./server');
} else {
  // Estamos en un navegador, exportar la versión compatible
  module.exports = require('./client');
}

// Exportar tipos comunes para ambos entornos
export * from './common/types';
