# LazyHTTP

Una biblioteca HTTP fácil de usar para aplicaciones JavaScript y TypeScript, con soporte para manejo de errores, reintentos, interceptores de peticiones y más.

## Características

- 🚀 API simple y fluida
- 🔄 Reintentos automáticos para peticiones fallidas
- 🛡️ Manejo de errores robusto y tipado
- 🔒 Sistema de autenticación avanzado (JWT, OAuth2)
- 🔁 Renovación automática de tokens
- 🧩 Totalmente tipado con TypeScript
- 📝 Logging avanzado con diferentes niveles
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

## Sistema de Autenticación

LazyHTTP incluye un sistema completo de autenticación:

```typescript
// Configuración del sistema de autenticación
http.configureAuth({
  type: "jwt",
  endpoints: {
    token: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    userInfo: "/auth/me",
  },
  storage: "localStorage",
  tokenKeys: {
    accessToken: "token",
    refreshToken: "refreshToken",
  },
  autoRefresh: true,
});

// Iniciar sesión
const login = async () => {
  try {
    const authInfo = await http.login({
      username: "usuario@ejemplo.com",
      password: "contraseña",
    });

    console.log("Sesión iniciada:", authInfo);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
  }
};

// Realizar petición autenticada
const getProtectedData = async () => {
  if (!http.isAuthenticated()) {
    console.log("No hay sesión activa");
    return;
  }

  const response = await http.get("/protected-data", { withAuth: true });
  console.log("Datos protegidos:", response.data);
};

// Obtener información del usuario
const getUserInfo = async () => {
  const user = await http.getAuthenticatedUser();
  console.log("Usuario:", user);
};

// Cerrar sesión
const logout = async () => {
  await http.logout();
  console.log("Sesión cerrada");
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

### Métodos de Autenticación

- `http.configureAuth(config)`: Configura el sistema de autenticación
- `http.login(credentials)`: Inicia sesión con las credenciales proporcionadas
- `http.logout()`: Cierra la sesión actual
- `http.isAuthenticated()`: Verifica si el usuario está autenticado
- `http.getAuthenticatedUser()`: Obtiene información del usuario autenticado
- `http.getAccessToken()`: Obtiene el token de acceso actual

### Opciones

```typescript
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  withAuth?: boolean;
  timeout?: number;
  retries?: number;
  params?: Record<string, string | number>;
}
```

## Ejemplos

Consulta el directorio `/examples` para ver ejemplos completos de uso.

## Licencia

MIT
