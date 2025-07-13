Plan de Ejecución: Potenciando HTTPLazy con Funcionalidades Avanzadas
Este plan detalla la implementación de las mejoras propuestas para HTTPLazy, enfocándose en la generación de comandos cURL, la captura completa de respuestas, la detección de "gigabytes repetidos" y el soporte para la reducción de "código repetido". Cada paso incluye tareas, subtareas, criterios de prueba y la indicación de un commit.

I. Configuración Inicial y Preparación del Entorno
Antes de sumergirnos en las funcionalidades, es crucial establecer una base sólida.

Módulo 1.1: Configuración del Repositorio y Entorno

Tarea 1.1.1: Clonar el Repositorio de HTTPLazy

Descripción: Obtener la última versión del código fuente de HTTPLazy.

Subtareas:

git clone

cd httplazy

npm install (o yarn install) para instalar dependencias existentes.

Prueba: Verificar que el proyecto compile y que las pruebas existentes pasen.

Commit: feat: Initial repository setup and dependency installation

Tarea 1.1.2: Configurar el Entorno de Desarrollo

Descripción: Asegurar que las herramientas de desarrollo (IDE, linter, formateador) estén configuradas para el proyecto.

Subtareas:

Revisar tsconfig.json, .eslintrc.js, prettier.config.js.

Asegurar que el IDE reconozca los tipados de TypeScript.

Prueba: Ejecutar el linter y el formateador para verificar que no haya errores.

Commit: chore: Configure development environment and linting

Tarea 1.1.3: Establecer un Marco de Pruebas Robusto

Descripción: Confirmar que el marco de pruebas (ej. Jest, Vitest) esté configurado correctamente y sea extensible.

Subtareas:

Verificar la configuración de pruebas en package.json.

Crear un archivo de prueba de ejemplo (test/temp.test.ts) y asegurar que se ejecute.

Prueba: npm test (o yarn test) y verificar que todas las pruebas pasen.

Commit: chore: Verify and prepare testing framework for new features

II. Funcionalidad: "Postman Programático" (Generación y Captura de Solicitudes/Respuestas)
Esta es una de las funcionalidades más solicitadas y de alto valor para la depuración. Se construirá de forma incremental.

Módulo 2.1: Mejora del Objeto de Respuesta (Captura Completa)

Tarea 2.1.1: Extender la Interfaz Response de HTTPLazy

Descripción: Añadir nuevas propiedades a la interfaz de respuesta de HTTPLazy para incluir metadatos detallados.

Subtareas:

Definir una nueva interfaz FullResponseMetadata que incluya: requestHeaders, responseHeaders, timing (objeto), rawBody (Buffer/string), errorDetails (objeto).

Modificar la interfaz principal de respuesta de HTTPLazy para incluir opcionalmente esta nueva interfaz.

Prueba: Crear un test unitario que simule una respuesta y verifique que las nuevas propiedades existen (aunque vacías por ahora).

Commit: feat(response): Extend IResponse with full metadata interfaces

Tarea 2.1.2: Implementar la Recopilación de Tiempos de Red

Descripción: Capturar métricas de tiempo detalladas para cada solicitud HTTP.

Subtareas:

Identificar el punto de inicio y fin de la solicitud dentro del código de HTTPLazy (probablemente en el interceptor o en la capa de ejecución subyacente).

Utilizar performance.now() en el navegador y perf_hooks en Node.js para capturar requestStart, dnsLookupEnd, connectEnd, secureConnectionEnd, requestEnd, responseStart, responseEnd (similar a HAR timings ).  

Almacenar estos tiempos en la propiedad timing del objeto de respuesta.

Prueba: Realizar una solicitud de prueba y verificar que el objeto response.timing contenga valores numéricos para las etapas clave.

Commit: feat(response): Implement network timing collection in response metadata

Tarea 2.1.3: Capturar Cabeceras de Solicitud y Respuesta Completas

Descripción: Almacenar todas las cabeceras enviadas y recibidas.

Subtareas:

Modificar el interceptor de solicitud para capturar todas las cabeceras enviadas y almacenarlas en requestHeaders.

Modificar el interceptor de respuesta para capturar todas las cabeceras recibidas y almacenarlas en responseHeaders.

Asegurar que los valores de las cabeceras se almacenen como objetos clave-valor.

Prueba: Realizar una solicitud con cabeceras personalizadas y verificar que response.requestHeaders y response.responseHeaders contengan las cabeceras esperadas.

Commit: feat(response): Capture full request and response headers

Tarea 2.1.4: Capturar el Cuerpo Crudo de la Respuesta y Detalles de Error

Descripción: Almacenar el cuerpo de la respuesta sin procesar y proporcionar más detalles sobre los errores.

Subtareas:

Modificar el manejo de la respuesta para almacenar el cuerpo de la respuesta en su formato crudo (string para texto, Buffer para binario) en rawBody.

En caso de error, enriquecer el objeto error con errorDetails que incluya el mensaje de error original, el stack trace, y cualquier información relevante del error HTTP (ej. cuerpo de error del servidor).

Prueba:

Realizar una solicitud que devuelva texto plano y verificar response.rawBody.

Realizar una solicitud que falle (ej. 404, 500) y verificar que response.error.errorDetails contenga información útil.

Commit: feat(response): Capture raw response body and detailed error info

Tarea 2.1.5: Probar y Confirmar el Objeto de Respuesta Mejorado

Descripción: Crear un conjunto de pruebas de integración para el objeto de respuesta completo.

Subtareas:

Escribir tests que realicen solicitudes GET, POST, PUT, DELETE.

Verificar que todas las propiedades de FullResponseMetadata estén pobladas correctamente.

Asegurar que el rendimiento no se vea afectado significativamente.

Prueba: Ejecutar el nuevo conjunto de pruebas de integración.

Commit: test(response): Add integration tests for enhanced response object

Módulo 2.2: Generación de Comandos cURL

Tarea 2.2.1: Crear una Utilidad generateCurl

Descripción: Desarrollar una función que convierta un objeto de configuración de solicitud de HTTPLazy en una cadena de comando cURL.

Subtareas:

Crear un nuevo archivo de utilidad (ej. src/utils/curlGenerator.ts).

La función generateCurl(requestConfig: RequestConfig, responseMetadata?: FullResponseMetadata) debería tomar la configuración de la solicitud y, opcionalmente, los metadatos de la respuesta (para cabeceras finales, etc.).

Implementar la lógica para mapear el método HTTP (-X), la URL, las cabeceras (-H), y el cuerpo (--data, --data-raw) a la sintaxis cURL.

Manejar la serialización de JSON para el cuerpo de la solicitud.

Prueba: Escribir tests unitarios para generateCurl con diferentes tipos de solicitudes (GET sin cuerpo, POST con JSON, PUT con cabeceras personalizadas).

Commit: feat(curl): Implement core curl command generation utility

Tarea 2.2.2: Integrar generateCurl con Interceptores

Descripción: Permitir que los desarrolladores accedan al comando cURL generado después de una solicitud.

Subtareas:

Añadir una opción de configuración a HTTPLazy (ej. debug: { generateCurl: boolean | ((curlCommand: string) => void) }).

Si generateCurl es true o una función, usar un interceptor de respuesta para llamar a generateCurl con la configuración de la solicitud y los metadatos de la respuesta.

Si es true, almacenar la cadena cURL en el objeto de respuesta (ej. response.debug.curlCommand). Si es una función, llamarla con la cadena cURL.

Prueba:

Configurar HTTPLazy para generar cURL y verificar que la propiedad response.debug.curlCommand esté presente y sea correcta.

Probar con un callback personalizado para generateCurl.

Commit: feat(curl): Integrate curl generation into HTTPLazy response object via interceptor

Tarea 2.2.3: Manejo de Datos Sensibles en cURL

Descripción: Ofrecer opciones para redactar o excluir información sensible (tokens de autenticación, cookies) de los comandos cURL generados.

Subtareas:

Añadir una opción de configuración (ej. debug: { redactSensitiveHeaders: string }) que especifique qué cabeceras deben ser ofuscadas (ej. Authorization, Cookie).

Modificar generateCurl para aplicar esta redacción.

Prueba: Generar un cURL con una cabecera Authorization y verificar que el token esté redactado.

Commit: feat(curl): Add sensitive data redaction for curl commands

Tarea 2.2.4: Probar y Confirmar la Generación de cURL

Descripción: Crear pruebas de integración que verifiquen la generación de cURL en diferentes escenarios.

Subtareas:

Tests para solicitudes con diferentes métodos, cuerpos (JSON, form-data), cabeceras.

Tests para solicitudes con y sin redacción de datos sensibles.

Prueba: Ejecutar el conjunto de pruebas.

Commit: test(curl): Add integration tests for curl generation

Módulo 2.3: Re-ejecución Interna de Solicitudes (Simulación de Postman)

Tarea 2.3.1: Desarrollar un Método replayRequest

Descripción: Crear una función que tome una configuración de solicitud (o un comando cURL) y la re-ejecute programáticamente a través de HTTPLazy.

Subtareas:

Añadir un nuevo método a la instancia de HTTPLazy (ej. httplazy.replay(requestConfig: RequestConfig | string)).

Si el input es una cadena cURL, se necesitará una utilidad interna para parsear el cURL de nuevo a un objeto RequestConfig (esto es complejo, se puede usar una librería externa si es necesario, o limitarlo a RequestConfig por ahora).

La función debería ejecutar la solicitud utilizando la lógica interna de HTTPLazy y devolver el objeto de respuesta completo mejorado (del Módulo 2.1).

Prueba:

Escribir un test unitario que cree una RequestConfig y la re-ejecute, verificando que la respuesta sea la esperada.

(Opcional, si se implementa el parseo de cURL): Probar la re-ejecución a partir de una cadena cURL.

Commit: feat(replay): Implement core replayRequest method

Tarea 2.3.2: Integrar replayRequest con la Generación de cURL

Descripción: Permitir que el cURL generado se re-ejecute fácilmente.

Subtareas:

Añadir un método de conveniencia (ej. response.debug.replay()) que use el curlCommand generado para re-ejecutar la solicitud.

Prueba: Realizar una solicitud, obtener el cURL generado y usar el método replay() para verificar que la re-ejecución funcione.

Commit: feat(replay): Add convenience method to replay generated curl commands

Tarea 2.3.3: Probar y Confirmar la Re-ejecución

Descripción: Crear pruebas de integración para la funcionalidad de re-ejecución.

Subtareas:

Tests que re-ejecuten solicitudes exitosas y fallidas.

Verificar que los metadatos de la respuesta de la re-ejecución sean consistentes.

Prueba: Ejecutar el conjunto de pruebas.

Commit: test(replay): Add integration tests for request replay functionality

III. Funcionalidad: Detección de "Gigabytes Repetidos" (Optimización de Transferencia de Datos)
Esta funcionalidad se basa en las métricas de respuesta mejoradas del Módulo 2.1.

Módulo 3.1: Recopilación de Métricas de Tráfico Detalladas

Tarea 3.1.1: Ampliar las Métricas de Solicitud Existentes

Descripción: Asegurar que las métricas de solicitud de HTTPLazy incluyan el tamaño del cuerpo de la solicitud y la respuesta (bytes).

Subtareas:

Modificar el interceptor de solicitud para calcular el tamaño del cuerpo de la solicitud antes de enviarlo.

Modificar el interceptor de respuesta para obtener el tamaño del cuerpo de la respuesta.

Añadir estas métricas al objeto de respuesta.

Prueba: Realizar solicitudes con diferentes tamaños de cuerpo y verificar que las métricas de tamaño sean precisas.

Commit: feat(metrics): Add request and response body size to metrics

Tarea 3.1.2: Implementar el Hashing de Cuerpos de Respuesta para Deduplicación

Descripción: Calcular un hash del cuerpo de la respuesta para identificar respuestas idénticas.

Subtareas:

Crear una utilidad de hashing (ej. crypto.createHash('sha256') en Node.js, o una implementación ligera para el navegador).

Modificar el interceptor de respuesta para calcular el hash del rawBody y almacenarlo en el objeto de respuesta (ej. response.debug.bodyHash).

Prueba: Realizar dos solicitudes idénticas y verificar que sus bodyHash sean iguales.

Commit: feat(metrics): Implement response body hashing for deduplication

Tarea 3.1.3: Probar la Recopilación de Métricas

Descripción: Crear pruebas unitarias y de integración para la recopilación de métricas de tráfico.

Subtareas:

Tests que verifiquen la precisión de los tamaños de bytes.

Tests para la consistencia de los hashes de cuerpo.

Prueba: Ejecutar el conjunto de pruebas.

Commit: test(metrics): Add tests for detailed traffic metrics

Módulo 3.2: Detección de Redundancia y Reportes

Tarea 3.2.1: Desarrollar un Módulo de Análisis de Tráfico (Modo Desarrollo)

Descripción: Crear un módulo opcional que monitoree las solicitudes y detecte patrones de redundancia.

Subtareas:

Añadir una opción de configuración (ej. performanceMonitor: { enabled: boolean, duplicateRequestThreshold: number }).

Crear un interceptor global que, si el monitor está habilitado, registre las solicitudes (URL, método, cabeceras clave, bodyHash).

Mantener un historial limitado de solicitudes recientes.

Prueba: Habilitar el monitor y realizar algunas solicitudes para verificar que se registren correctamente.

Commit: feat(perf): Implement core traffic analysis module (dev mode)

Tarea 3.2.2: Generar Reportes de Eficacia de Caché

Descripción: Proporcionar una función para obtener un resumen de la eficacia de la caché interna de HTTPLazy.

Subtareas:

Modificar la caché interna de HTTPLazy para registrar aciertos y fallos.

Añadir un método estático o de instancia (ej. httplazy.getCacheReport()) que devuelva la tasa de aciertos, el número total de solicitudes cacheadas, etc.

Considerar la integración con las métricas de rendimiento para mostrar el impacto de la caché.

Prueba: Realizar solicitudes con y sin caché, y verificar que el reporte de caché refleje los aciertos y fallos correctamente.

Commit: feat(cache): Add cache effectiveness reporting

Tarea 3.2.3: Implementar Advertencias de Solicitudes Duplicadas

Descripción: Notificar al desarrollador cuando se detecten solicitudes idénticas repetidas en un corto período.

Subtareas:

Dentro del módulo de análisis de tráfico (Tarea 3.2.1), comparar las solicitudes entrantes con el historial reciente utilizando el bodyHash y la URL/método.

Si se detecta una duplicación por encima de un umbral, emitir una advertencia en la consola (solo en modo desarrollo) con detalles sobre la solicitud duplicada y sugerencias (ej. "Considere implementar debouncing o throttling").

Prueba: Escribir un test que realice la misma solicitud varias veces rápidamente y verifique que se emita la advertencia.

Commit: feat(perf): Implement duplicate request warnings in dev mode

Tarea 3.2.4: Probar la Detección de Redundancia

Descripción: Crear pruebas de integración para el módulo de detección de redundancia.

Subtareas:

Tests para diferentes escenarios de caché (hit, miss).

Tests para la detección de solicitudes duplicadas con y sin advertencias.

Prueba: Ejecutar el conjunto de pruebas.

Commit: test(perf): Add integration tests for redundancy detection

IV. Funcionalidad: Detección de "Código Repetido" (Prevención y Soporte)
Esta área se enfoca más en la documentación y la guía, ya que la detección directa de código repetido está fuera del alcance de un cliente HTTP.

Módulo 4.1: Refuerzo de la Prevención de Código Repetitivo (Documentación)

Tarea 4.1.1: Documentar Patrones de Uso Óptimos de HTTPLazy

Descripción: Crear una sección en la documentación que muestre cómo usar HTTPLazy para reducir el código repetitivo.

Subtareas:

Ejemplos de configuración de instancias con URL base y cabeceras predeterminadas.

Ejemplos de uso de interceptores para lógica transversal (autenticación, registro de errores).

Ejemplos de cómo la API unificada de HTTPLazy reduce la necesidad de try/catch repetitivos.

Prueba: Revisión de la documentación por pares.

Commit: docs: Add guide on reducing boilerplate with HTTPLazy features

Tarea 4.1.2: Crear Ejemplos de Configuración Compartida

Descripción: Proporcionar ejemplos de cómo crear y compartir instancias de HTTPLazy para evitar la re-configuración.

Subtareas:

Ejemplos de cómo exportar una instancia configurada de HTTPLazy para su uso en toda la aplicación.

Demostrar cómo usar httplazy.extend() para crear instancias con configuraciones específicas sin duplicar la base.

Prueba: Revisión de la documentación por pares.

Commit: docs: Provide examples for shared HTTPLazy instances and extension

Módulo 4.2: Integración con Herramientas de Análisis Estático (Guía)

Tarea 4.2.1: Investigar Herramientas Populares de Análisis Estático

Descripción: Identificar las herramientas más utilizadas para la detección de código duplicado en proyectos JavaScript/TypeScript.

Subtareas:

Investigar jscpd, ESLint (con plugins de duplicación), SonarQube.

Prueba: Documentar las herramientas y sus capacidades relevantes.

Commit: research: Document popular static analysis tools for code duplication

Tarea 4.2.2: Crear Guías de Integración

Descripción: Desarrollar una guía en la documentación de HTTPLazy sobre cómo integrar estas herramientas en un proyecto.

Subtareas:

Explicar cómo configurar las herramientas para escanear el código de la aplicación.

Destacar cómo el uso de HTTPLazy (con sus características de reducción de código repetitivo) puede mejorar los resultados de estas herramientas.

Proporcionar fragmentos de configuración de ejemplo.

Prueba: Revisión de la documentación por pares.

Commit: docs: Add guide for integrating static analysis tools with HTTPLazy projects

V. Pruebas Finales y Documentación
Una vez que las funcionalidades estén implementadas, es crucial asegurar su estabilidad y comunicar su existencia.

Tarea 5.1: Pruebas de Integración End-to-End (E2E)

Descripción: Realizar pruebas exhaustivas que cubran todos los nuevos flujos de trabajo.

Subtareas:

Crear un conjunto de pruebas E2E que simulen un escenario de aplicación real utilizando las nuevas características (generación de cURL, re-ejecución, monitoreo de rendimiento).

Asegurar que las pruebas se ejecuten en entornos de navegador y Node.js.

Prueba: Todas las pruebas E2E pasan.

Commit: test(e2e): Add end-to-end tests for new features

Tarea 5.2: Actualización Completa de la Documentación

Descripción: Actualizar el README.md, la documentación de la API y los ejemplos para reflejar las nuevas características.

Subtareas:

Añadir secciones detalladas para la generación de cURL, el objeto de respuesta mejorado y las métricas de rendimiento.

Actualizar la tabla comparativa de características en la documentación para destacar las nuevas ventajas.

Asegurar que todos los ejemplos de código sean claros y estén actualizados.

Prueba: Revisión completa de la documentación.

Commit: docs: Comprehensive documentation update for all new features

Tarea 5.3: Lanzamiento y Comunicación

Descripción: Preparar el lanzamiento de la nueva versión de HTTPLazy.

Subtareas:

Actualizar el CHANGELOG.md con todas las nuevas características y correcciones.

Preparar un anuncio para la comunidad (ej. blog post, redes sociales) destacando el valor de las nuevas funcionalidades.

Publicar la nueva versión en npm.

Prueba: Versión publicada y anunciada.

Commit: chore(release): Prepare and publish new version with advanced features
