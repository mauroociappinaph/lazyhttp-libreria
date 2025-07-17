# GEMINI.md - Guía para el Núcleo de `http/`

Este documento establece las directrices de desarrollo para el directorio `http/`, el núcleo de la biblioteca `lazyHttp`.

## 1. Principios Fundamentales

*   **Cero Dependencias Externas (en `core/`):** El subdirectorio `core/` debe ser agnóstico y no tener dependencias de `node_modules`. Toda la lógica debe ser autocontenida.
*   **Inmutabilidad:** Las configuraciones y opciones recibidas deben tratarse como inmutables. Siempre crea copias en lugar de modificar objetos originales.
*   **Manejo de Errores Explícito:** No se deben lanzar excepciones para errores de red (ej. 404, 500). Todas las funciones que realizan peticiones deben devolver el patrón `{ data, error }`. Las excepciones solo se reservan para errores de programación (ej. configuración inválida).

## 2. Convenciones de Código

*   **Exportaciones Nombradas:** Utiliza siempre `export` en lugar de `export default` para facilitar el *tree-shaking*.
*   **Documentación JSDoc:** Todas las funciones públicas y tipos de datos deben tener una documentación JSDoc clara y concisa, explicando qué hacen, sus parámetros y qué devuelven.
*   **Tipado Estricto:** Evita el uso de `any` a toda costa. Si un tipo es complejo, tómate el tiempo para definir una `interface` o `type` adecuado.

## 3. Flujo de Trabajo

*   **Pruebas Unitarias Obligatorias:** Cualquier cambio o nueva funcionalidad en este directorio **debe** estar acompañado de sus correspondientes pruebas unitarias en el directorio `tests/http/`.
*   **Revisión de Dependencias Circulares:** Antes de finalizar un cambio, es responsabilidad del desarrollador ejecutar `npx madge --circular http/` para asegurar que no se han introducido dependencias circulares.
