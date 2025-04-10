# LazyHTTP

Una biblioteca HTTP fácil de usar para aplicaciones JavaScript y TypeScript, con soporte para manejo de errores, reintentos, interceptores de peticiones y más.

## Características

- 🚀 API simple y fluida
- 🔄 Reintentos automáticos para peticiones fallidas
- 🛡️ Manejo de errores robusto y tipado
- 🔒 Soporte para autenticación con tokens
- 📝 Logging avanzado con diferentes niveles
- 🧩 Totalmente tipado con TypeScript
- 🔧 Configuración flexible

## Instalación

```bash
npm install lazyhttp
```

## Uso básico

```typescript
import { http } from "lazyhttp";

// Realizar una petición GET
const getUsers = async () => {
  const response = await http.get("/users");

  if (response.error) {
    console.error("Error:", response.error);
    return;
  }

  console.log("Usuarios:", response.data);
};

// Realizar una petición POST
const createUser = async (userData) => {
  const response = await http.post("/users", userData);

  if (response.error) {
    console.error("Error:", response.error);
    return;
  }

  console.log("Usuario creado:", response.data);
};
```

## Configuración

La biblioteca puede ser inicializada con configuración personalizada:

```typescript
import { http } from "lazyhttp";

// Inicializar la biblioteca
await http.initialize();
```

## API

### Métodos HTTP

- `http.get<T>(endpoint, options?)`: Realiza una petición GET
- `http.post<T>(endpoint, body?, options?)`: Realiza una petición POST
- `http.put<T>(endpoint, body?, options?)`: Realiza una petición PUT
- `http.patch<T>(endpoint, body?, options?)`: Realiza una petición PATCH
- `http.delete<T>(endpoint, options?)`: Realiza una petición DELETE
- `http.request<T>(endpoint, options?)`: Método genérico para cualquier tipo de petición

### Opciones

```typescript
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  withAuth?: boolean;
  timeout?: number;
  retries?: number;
}
```

## Licencia

MIT
