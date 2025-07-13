# 📄 Auto-Postman & Autodocumentación para HTTPLazy

## 1. Objetivo

Proveer una funcionalidad opcional y solo para desarrollo que registre automáticamente todos los endpoints utilizados a través de HTTPLazy, permitiendo:

- Generar documentación y ejemplos reales de requests/responses.
- Exportar la colección a Postman, Swagger/OpenAPI, o JSON.
- (Opcional) Probar endpoints desde una UI embebida en la app.

---

## 2. ¿Cómo funciona?

- Cada vez que se realiza una request con HTTPLazy, se guarda un registro en memoria (solo en desarrollo).
- Se expone una API para exportar la colección de endpoints y ejemplos.
- (Opcional) Se puede mostrar una UI visual para explorar y probar endpoints.

---

## 3. API Sugerida

```ts
// Importación explícita, solo en desarrollo
import {
  enableAutoPostman,
  exportApiCollection,
  exportPostmanCollection,
  clearApiCollection,
} from 'httplazy/devtools';

// Activar el registro automático
enableAutoPostman();

// Exportar la colección en formato JSON
const collection = exportApiCollection();

// Exportar en formato Postman
const postmanJson = exportPostmanCollection();

// Limpiar la colección
clearApiCollection();
```

---

## 4. Estructura de Datos (Ejemplo JSON)

```json
[
  {
    "method": "GET",
    "url": "/api/users",
    "headers": { "Authorization": "Bearer ..." },
    "requestBody": null,
    "responseStatus": 200,
    "responseBody": [{ "id": 1, "name": "Juan" }],
    "timestamp": "2024-06-01T12:00:00Z"
  },
  {
    "method": "POST",
    "url": "/api/login",
    "headers": { "Content-Type": "application/json" },
    "requestBody": { "user": "juan", "pass": "1234" },
    "responseStatus": 401,
    "responseBody": { "error": "Unauthorized" },
    "timestamp": "2024-06-01T12:01:00Z"
  }
]
```

---

## 5. Exportación a Postman/Swagger

- Se provee una función para convertir la colección a formato Postman v2.1.
- (Opcional) Exportación a OpenAPI/Swagger.

---

## 6. UI Embebida (Opcional)

- Panel visual React/Vue solo en desarrollo.
- Lista de endpoints detectados.
- Detalle de cada request/response.
- Botón para repetir o modificar la request ("Try it").
- Filtros por método, status, endpoint.

---

## 7. Consideraciones de Seguridad

- Solo habilitado en modo desarrollo.
- No guardar ni exportar datos sensibles por defecto.
- Permitir limpiar/resetear la colección.
- Documentar claramente los riesgos y buenas prácticas.

---

## 8. Ejemplo de Uso

```ts
// En tu entrypoint de desarrollo
if (process.env.NODE_ENV === 'development') {
  import('httplazy/devtools').then(({ enableAutoPostman }) => {
    enableAutoPostman();
  });
}

// Luego puedes exportar la colección para documentar tu API o compartirla con QA
```

---

## 9. Roadmap de Implementación

1. Instrumentar requests/responses en HTTPLazy (solo en devtools).
2. Exponer API para exportar, limpiar y convertir la colección.
3. Documentar bien la funcionalidad y advertencias.
4. (Opcional) Crear UI visual embebida.
5. (Opcional) Exportación a Swagger/OpenAPI.

---

## 10. Beneficios

- Documentación y ejemplos reales sin esfuerzo manual.
- Facilita pruebas, QA y debugging.
- Diferenciación frente a otros clientes HTTP.
- Mejora la experiencia del desarrollador (DX).
