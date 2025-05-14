# Changelog - httplazy

## [1.6.3] - 2023-11-02

### Added

- Soporte para resource accessors con símbolos, permitiendo un acceso más limpio y con mejor autocompletado a los endpoints
- Nuevo archivo de recursos exportando símbolos predefinidos para entidades comunes (User, Product, etc.)
- Función helper `createResource()` para crear símbolos personalizados
- Conversión automática de formato PascalCase a lowercase y plural (ej: User → users)

### Fixed

- Mejora en la implementación del Proxy para mantener el contexto correcto
- Soporte mejorado para TypeScript y autocompletado con los resource accessors

### Documentation

- Actualizado README con ejemplos de uso de resource accessors con símbolos
- Nuevo ejemplo de uso (`examples/symbol-accessor-example.js`)

## [1.6.2] - 2023-10-26

## [2.2.0] - 2024-06-XX

### 🚀 Nuevas funcionalidades

- **upload**: Soporte para múltiples archivos por campo (arrays) en Node.js y browser.
- **Validación avanzada**: Validación automática de existencia y tamaño de archivos en Node.js.
- **Opciones avanzadas**: Nuevas opciones `validateFiles` (desactiva validación) y `maxFileSize` (límite de tamaño por archivo).

### 🧪 Tests

- Tests unitarios para todos los casos de validación de archivos, arrays, tamaño máximo y validación desactivada.
- Mockeo de métodos para evitar dependencias externas en los tests.

### 📚 Documentación

- Ejemplos claros de manejo de errores en upload.
- Sección de filosofía de diseño: por qué `{ data, error }` y cuándo puede ser contraproducente.
- Ejemplos de integración con librerías que esperan Promesas rechazadas.
- Buenas prácticas para testing y mockeo.

### 🛠️ Otros

- Refactor de manejo de errores para que siempre retorne `{ data, error }` en vez de lanzar excepciones inesperadas.
- Mejoras menores de consistencia y estilo en el código y la documentación.
