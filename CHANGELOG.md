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
