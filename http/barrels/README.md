# Estructura de Barriles (Barrel Structure)

Esta carpeta contiene los "barrel files" (archivos barril) que organizan las exportaciones de la biblioteca `httplazy` por dominio funcional.

## ¿Qué son los archivos barril?

Los archivos barril son una técnica de diseño en TypeScript/JavaScript que consiste en reexportar módulos desde un punto centralizado. Esta técnica facilita:

- Importaciones más limpias y organizadas
- Mejor estructura del código
- Facilidad para refactorizar sin afectar al código cliente

## Estructura de barriles

### Barril Principal

- `index.ts` - Exporta todos los sub-barriles, proporcionando acceso a toda la biblioteca

### Sub-Barriles por Dominio

- `http-core.barrel.ts` - Componentes centrales del cliente HTTP
- `http-auth.barrel.ts` - Funcionalidad de autenticación
- `http-cache.barrel.ts` - Sistema de caché
- `http-metrics.barrel.ts` - Métricas y telemetría
- `http-config.barrel.ts` - Configuración e interceptores
- `http-streaming.barrel.ts` - Funcionalidad de streaming

## Cómo usar los barriles

### Importación completa (todos los componentes)

```typescript
import { HttpCore, metricsManager, cacheManager } from "../barrels";
```

### Importación por dominio (componentes relacionados)

```typescript
// Solo componentes de autenticación
import { configureAuthHelper, loginHelper } from "../barrels/http-auth.barrel";

// Solo componentes de caché
import { cacheManager } from "../barrels/http-cache.barrel";
```

### Importación selectiva (para optimización)

```typescript
// Solo lo que necesitas específicamente
import { HttpCore } from "../barrels/http-core.barrel";
import { cacheManager } from "../barrels/http-cache.barrel";
```

## Beneficios del enfoque por sub-barriles

1. **Organización por dominio funcional**: Código agrupado lógicamente
2. **Escalabilidad**: Facilita añadir nuevas funcionalidades
3. **Mejor Tree Shaking**: Importaciones más específicas = bundles más pequeños
4. **Mantenibilidad**: Cambios aislados por dominio
5. **Documentación implícita**: La estructura comunica la arquitectura
