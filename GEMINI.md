# GEMINI.md - Guía de Desarrollo para lazyHttp

Este documento proporciona un contexto esencial para el desarrollo y mantenimiento de la biblioteca `lazyHttp`. Está diseñado para ser una guía de referencia rápida para desarrolladores y para la IA.

## 1. Resumen del Proyecto

`lazyHttp` es una biblioteca cliente HTTP para TypeScript/JavaScript, diseñada para ser potente, fácil de usar y altamente configurable. Ofrece una alternativa moderna a `axios` y `fetch`, con funcionalidades avanzadas integradas como reintentos automáticos, caché, interceptores, y un sistema de autenticación robusto.

**Características Clave:**

*   **API Unificada:** Sintaxis coherente para todas las operaciones HTTP (`.get()`, `.post()`, etc.).
*   **Manejo de Errores:** Respuestas predecibles con el patrón `{ data, error }`.
*   **Reintentos Automáticos:** Configuración de reintentos con backoff exponencial.
*   **Caché Inteligente:** Soporte para caché en memoria, `localStorage` y `sessionStorage`.
*   **Interceptores:** Middlewares para modificar peticiones y respuestas.
*   **Autenticación Integrada:** Soporte para JWT y OAuth2.
*   **Soporte Universal:** Funciona tanto en Node.js como en el navegador.
*   **Componente de IA:** Incluye un servidor de sugerencias en Python/Flask para proponer soluciones a errores comunes.

## 2. Estructura del Proyecto

El proyecto está organizado en los siguientes directorios principales:

*   `http/`: Contiene el código fuente principal de la biblioteca, organizado por funcionalidades (auth, cache, core, etc.).
*   `tests/`: Pruebas unitarias y de integración.
*   `examples/`: Ejemplos de uso de la biblioteca.
*   `ml-suggestions/`: Un microservicio en Python que utiliza `scikit-learn` para sugerir soluciones a errores HTTP.
*   `scripts/`: Scripts de utilidad para el desarrollo (build, análisis, etc.).
*   `.husky/`: Hooks de Git para asegurar la calidad del código antes de los commits.

## 3. Tecnologías y Dependencias Clave

*   **Lenguaje Principal:** TypeScript
*   **Entorno de Ejecución:** Node.js y Navegador
*   **Framework de Pruebas:** Jest
*   **Linter:** ESLint
*   **Formateador:** Prettier
*   **Dependencias Principales:**
    *   `axios`: Utilizado como base para las peticiones HTTP.
    *   `express`: Para el servidor de ejemplos y pruebas.
    *   `typescript`: Para el tipado estático.
*   **Componente de IA:**
    *   `flask`: Para el servidor de sugerencias.
    *   `pandas` y `scikit-learn`: Para el entrenamiento y la predicción del modelo de ML.

## 4. Scripts Esenciales

Los scripts más importantes se encuentran en `package.json`:

*   `npm run build`: Compila el código TypeScript a JavaScript.
*   `npm test`: Ejecuta las pruebas unitarias con Jest.
*   `npm run verify`: Realiza una verificación de tipos y dependencias circulares.
*   `npm run verify:full`: Ejecuta un conjunto completo de verificaciones de calidad de código.
*   `npm run example`: Ejecuta un ejemplo simple de uso de la biblioteca.

## 5. Flujo de Trabajo de Desarrollo

1.  **Instalación:** `npm install`
2.  **Desarrollo:** Realiza cambios en los archivos dentro de `http/`.
3.  **Pruebas:** Añade o actualiza las pruebas en `tests/` y ejecútalas con `npm test`.
4.  **Verificación:** Antes de hacer commit, asegúrate de que todas las verificaciones pasen ejecutando `npm run verify:full`.
5.  **Commit:** El hook de `pre-commit` de Husky ejecutará automáticamente las verificaciones.

### 5.1. Hooks de Git (Husky)

Para asegurar la calidad del código y mantener un historial de commits limpio, `lazyHttp` utiliza hooks de Git gestionados por Husky.

*   **`pre-commit`:**
    *   Se ejecuta **antes de cada commit**.
    *   Utiliza `lint-staged` para ejecutar linters (ESLint) y formateadores (Prettier) solo en los archivos modificados y staged, optimizando el rendimiento.
    *   Ejecuta pruebas unitarias (`pnpm test --findRelatedTests`) solo para los archivos relacionados con los cambios staged, acelerando el ciclo de feedback.
    *   Verifica dependencias circulares (`npx madge --circular http/`).
    *   Realiza revisiones de estilo y buenas prácticas (ej. detección de `export default`, `console.log`, `debugger`, `TODO`).

*   **`commit-msg`:**
    *   Se ejecuta **después de escribir el mensaje de commit y antes de que el commit se complete**.
    *   Utiliza `commitlint` para validar que el mensaje de commit siga la especificación de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Esto es crucial para mantener un historial de commits consistente y para la generación automática de changelogs.

*   **`pre-push`:**
    *   Se ejecuta **antes de enviar los cambios a un repositorio remoto (`git push`)**.
    *   Realiza verificaciones más exhaustivas que no son necesarias en cada commit, pero sí antes de compartir el código.
    *   Actualmente, ejecuta pruebas de integración completas (`pnpm test:ci`) y un análisis de seguridad (`npm run check-security`). Estos comandos pueden ser personalizados para incluir otras verificaciones necesarias.

**Mejora del Feedback (Oportunidad Futura):**
Existe la oportunidad de integrar el componente `ml-suggestions` con los hooks de Husky. Si un hook falla, la salida de error podría enviarse al servidor `ml-suggestions` para obtener y mostrar sugerencias automáticas de solución al desarrollador, mejorando significativamente la experiencia de depuración.

## 6. Convenciones del Proyecto

*   **Estilo de Código:** Se utiliza Prettier para el formateo automático.
*   **Commits:** Se espera que los mensajes de commit sigan la especificación de [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
*   **Exportaciones:** Se prefieren las exportaciones nombradas sobre las exportaciones por defecto para facilitar el *tree-shaking*.
*   **Manejo de Errores:** Todas las funciones que realizan peticiones HTTP deben devolver un objeto con la estructura `{ data, error, status }`. No se deben lanzar excepciones para errores HTTP.

## 7. Componente de IA (Sugerencias de Errores)

El directorio `ml-suggestions/` contiene un servidor Flask que proporciona sugerencias para errores HTTP.

*   **Para iniciar el servidor:**
    1.  Navega a `ml-suggestions/`.
    2.  Crea un entorno virtual: `python -m venv venv`
    3.  Activa el entorno: `source venv/bin/activate`
    4.  Instala las dependencias: `pip install -r requirements.txt`
    5.  Inicia el servidor: `python suggestion_server.py`

*   **Endpoints:**
    *   `POST /suggest`: Recibe información de un error y devuelve una sugerencia.
    *   `POST /feedback`: Recibe feedback sobre la utilidad de una sugerencia para re-entrenar el modelo.