# Guía de Desarrollo para httplazy

Este documento proporciona instrucciones para configurar y mantener el entorno de desarrollo para la biblioteca httplazy.

## Configuración Inicial

Puedes configurar rápidamente el entorno de desarrollo con un solo comando:

```bash
# Configuración completa automática
npm run setup-dev
```

Este comando instalará:

- Dependencias del proyecto
- Herramientas de desarrollo como madge
- Configurará Husky para hooks de git
- Configurará lint-staged para verificaciones automáticas

### Configuración manual (alternativa)

Si prefieres configurar el entorno manualmente:

1. **Instalar dependencias:**

```bash
npm install
```

2. **Instalar herramientas de desarrollo:**

```bash
# Instalar Madge para análisis de dependencias
npm install -g madge

# Instalar Graphviz (opcional, para visualización de dependencias)
# En macOS:
brew install graphviz

# En Ubuntu/Debian:
sudo apt-get install graphviz

# En Windows (con Chocolatey):
choco install graphviz
```

3. **Configurar Husky para hooks de git:**

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

## Scripts de Desarrollo

El proyecto incluye varios scripts útiles:

```bash
# Configurar entorno de desarrollo
npm run setup-dev

# Verificación básica (tipos y dependencias circulares)
npm run verify

# Verificación completa (tipos, dependencias circulares y análisis de estructura)
npm run verify:full

# Analizar estructura de dependencias
npm run analyze-deps

# Compilar la biblioteca
npm run build

# Ejecutar ejemplos
npm run example
npm run example:advanced
npm run example:auth
```

## Estructura del Proyecto

La biblioteca sigue una arquitectura modular organizada por dominios funcionales:

```
http/
├── barrels/              # Archivos barril para exportaciones
│   ├── index.ts          # Barril principal
│   ├── http-*.barrel.ts  # Sub-barriles por dominio
│   └── README.md         # Documentación de barriles
├── http-core.ts          # Implementación central
├── http-auth.ts          # Funcionalidad de autenticación
├── http-cache.ts         # Sistema de caché
├── http-retry.ts         # Sistema de reintentos automáticos
└── ...                   # Otros módulos
```

## Funcionalidades Implementadas

### Sistema de Reintentos Automáticos

La biblioteca incluye un sistema de reintentos automáticos con backoff exponencial para peticiones fallidas:

- **Configuración global**: Establecer parámetros de reintentos a nivel de cliente
- **Personalización por petición**: Modificar comportamiento para peticiones específicas
- **Backoff exponencial**: Incremento progresivo del tiempo entre reintentos
- **Detección inteligente**: Identificación automática de errores reintentables
- **Integración con métricas**: Tracking de reintentos para análisis

Para extender o modificar el sistema de reintentos:

```typescript
// Ejemplo de implementación personalizada
class MiHttpClient extends BaseHttpClient {
  protected shouldRetry(
    error: any,
    retryCount: number,
    options?: RetryOptions
  ): boolean {
    // Implementación personalizada de lógica de reintentos

    // Primero verificar la implementación base
    const baseDecision = super.shouldRetry(error, retryCount, options);

    // Añadir lógica adicional
    if (error.status === 418) {
      // "I'm a teapot"
      return false; // No reintentar en este caso específico
    }

    return baseDecision;
  }
}
```

## Reglas de Desarrollo

Las reglas completas de desarrollo están en el archivo `.cursorrules` en la raíz del proyecto. Algunos puntos importantes:

- Usar exportaciones nombradas para permitir tree-shaking
- Evitar dependencias circulares
- Organizar código por dominio funcional
- Documentar APIs públicas

## Verificaciones Automáticas

Husky y lint-staged están configurados para ejecutar automáticamente antes de cada commit:

- Verificación de tipos TypeScript
- Linting con ESLint
- Detección de dependencias circulares
- Verificación de reglas de exportación

Si necesitas ejecutar estas verificaciones manualmente:

```bash
# Verificación completa (incluye todas las comprobaciones)
npm run verify:full

# Verificación básica
npm run verify

# Verificar tipos
npx tsc --noEmit

# Verificar dependencias circulares
npx madge --circular http/

# Verificar estructura de dependencias
npx madge http/http-index.ts
```

## Contribución

1. Crea una rama para tu característica (`feature/nueva-caracteristica`)
2. Implementa tus cambios siguiendo las reglas en `.cursorrules`
3. Asegúrate de que todas las verificaciones pasen ejecutando `npm run verify:full`
4. Crea un pull request con una descripción clara de los cambios

## Publicación

Para publicar una nueva versión:

1. Actualiza la versión en `package.json`
2. Ejecuta `npm run build` para compilar la biblioteca
3. Verifica que todo funcione correctamente
4. Ejecuta `npm publish` para publicar en npm
