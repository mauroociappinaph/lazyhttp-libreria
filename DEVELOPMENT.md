# Guía de Desarrollo para httplazy

Este documento proporciona instrucciones para configurar y mantener el entorno de desarrollo para la biblioteca httplazy.

## Configuración Inicial

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

3. **Activar hooks de git:**

```bash
chmod +x .git/hooks/pre-commit
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
└── ...                   # Otros módulos
```

## Reglas de Desarrollo

Las reglas completas de desarrollo están en el archivo `.cursorrules` en la raíz del proyecto. Algunos puntos importantes:

- Usar exportaciones nombradas para permitir tree-shaking
- Evitar dependencias circulares
- Organizar código por dominio funcional
- Documentar APIs públicas

## Verificaciones Automáticas

El hook de pre-commit ejecutará automáticamente:

- Verificación de tipos TypeScript
- Detección de dependencias circulares
- Verificación de reglas de exportación

Si necesitas ejecutar estas verificaciones manualmente:

```bash
# Verificar tipos
npx tsc --noEmit

# Verificar dependencias circulares
npx madge --circular http/

# Verificar estructura de dependencias
npx madge --tsconfig tsconfig.json http/http-index.ts
```

## Contribución

1. Crea una rama para tu característica (`feature/nueva-caracteristica`)
2. Implementa tus cambios siguiendo las reglas en `.cursorrules`
3. Asegúrate de que todas las verificaciones pasen
4. Crea un pull request con una descripción clara de los cambios

## Publicación

Para publicar una nueva versión:

1. Actualiza la versión en `package.json`
2. Ejecuta `npm run build` para compilar la biblioteca
3. Verifica que todo funcione correctamente
4. Ejecuta `npm publish` para publicar en npm
