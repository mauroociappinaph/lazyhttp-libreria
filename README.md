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
- 📊 Caché inteligente con estrategias personalizables
- 🧠 Sistema inteligente de sugerencias para errores (experimental)

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

// Inicializar la biblioteca con configuración avanzada
await http.initialize({
  // Configuración del sistema de sugerencias inteligentes (opcional)
  suggestionService: {
    enabled: true,
    url: "http://tu-servidor-de-sugerencias.com",
  },

  // Configuración del sistema de caché (opcional)
  cache: {
    enabled: true,
    defaultStrategy: "cache-first",
    defaultTTL: 5 * 60 * 1000, // 5 minutos
    storage: "memory",
    maxSize: 100,
  },
});
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

### Métodos Helper

- `http.getAll<T>(endpoint, options?)`: Obtiene una lista paginada de recursos
- `http.getById<T>(endpoint, id, options?)`: Obtiene un recurso específico por su ID
- `http.create<T>(endpoint, data, options?)`: Alias mejorado para crear recursos
- `http.update<T>(endpoint, id, data, options?)`: Actualiza un recurso existente
- `http.remove(endpoint, id, options?)`: Elimina un recurso por su ID

### Métodos de Caché

- `http.configureCaching(config)`: Configura el sistema de caché
- `http.invalidateCache(pattern)`: Invalida entradas de caché que coincidan con un patrón
- `http.invalidateCacheByTags(tags)`: Invalida entradas de caché con ciertos tags

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
  cache?: {
    enabled?: boolean;
    strategy?:
      | "cache-first"
      | "network-first"
      | "stale-while-revalidate"
      | "network-only"
      | "cache-only";
    ttl?: number;
    key?: string;
    tags?: string[];
  };
}
```

## Ejemplos

Consulta el directorio `/examples` para ver ejemplos completos de uso.

## Ejemplos Avanzados

### Interceptores de Peticiones

Puedes interceptar cualquier petición antes de que se envíe al servidor, por ejemplo para agregar headers dinámicos:

```typescript
http.addRequestInterceptor((config) => {
  config.headers = {
    ...config.headers,
    "X-Custom-Header": "LazyRocks",
  };
  return config;
});
```

### Sistema de Caché Inteligente

LazyHTTP incluye un potente sistema de caché que mejora significativamente el rendimiento y la experiencia del usuario:

```typescript
// Configurar el sistema de caché globalmente
await http.initialize({
  cache: {
    enabled: true, // Habilitar caché
    defaultStrategy: "cache-first", // Estrategia por defecto
    defaultTTL: 5 * 60 * 1000, // Tiempo de vida: 5 minutos
    storage: "memory", // Tipo de almacenamiento
    maxSize: 100, // Número máximo de entradas
  },
});

// Petición que usa la caché con la estrategia por defecto
const response = await http.get("/users");

// Petición con estrategia personalizada
const response2 = await http.get("/frequently-changing-data", {
  cache: {
    strategy: "network-first", // Priorizar la red
    ttl: 30 * 1000, // TTL personalizado: 30 segundos
    tags: ["users", "list"], // Tags para invalidación selectiva
  },
});

// Petición que omite la caché
const response3 = await http.get("/no-cache-data", {
  cache: { enabled: false },
});

// Invalidar entradas de caché por patrón
http.invalidateCache("GET:/users*");

// Invalidar entradas de caché por tags
http.invalidateCacheByTags(["users"]);
```

#### Estrategias de caché disponibles

LazyHTTP soporta varias estrategias de caché para diferentes casos de uso:

- **cache-first**: Intenta usar caché primero, si no existe o expiró va a la red. Ideal para datos que cambian poco.
- **network-first**: Intenta obtener datos frescos de la red, pero usa caché como respaldo si la red falla. Bueno para datos que cambian con frecuencia.
- **stale-while-revalidate**: Devuelve datos de caché inmediatamente mientras actualiza la caché en segundo plano. Perfecto para interfaces de usuario muy responsivas.
- **network-only**: Solo usa la red, nunca la caché (aunque sí almacena la respuesta). Útil para datos críticos que deben ser siempre actuales.
- **cache-only**: Solo usa la caché, nunca la red. Útil para modo offline.

#### Beneficios del sistema de caché

- 🚀 **Rendimiento mejorado**: Reduce las peticiones de red innecesarias
- 📱 **Soporte parcial offline**: Funciona cuando la red no está disponible usando datos en caché
- ⚡ **Experiencia de usuario más fluida**: Respuestas instantáneas desde caché mientras se actualizan datos en segundo plano
- 🔄 **Invalidación inteligente**: Invalidación automática de caché en operaciones de escritura (POST/PUT/PATCH/DELETE)
- 🏷️ **Sistema de tags**: Permite agrupar e invalidar entradas de caché relacionadas

## Sistema de Sugerencias Inteligentes

LazyHTTP incorpora un sistema de sugerencias inteligentes para ayudar a los usuarios a resolver errores comunes:

```typescript
// Las sugerencias se generan automáticamente cuando ocurre un error
if (response.error) {
  // Obtener una sugerencia inteligente para el error
  const suggestion = await HttpError.getSmartSuggestion(
    response.error,
    request
  );
  console.log("Sugerencia:", suggestion);

  // Proporcionar feedback sobre la sugerencia
  await HttpError.provideSuggestionFeedback(
    response.error,
    request,
    suggestion,
    true // true si fue útil, false si no
  );
}
```

El sistema de sugerencias utiliza aprendizaje automático para mejorar con el tiempo basado en el feedback de los usuarios.

> **Nota**: El sistema de sugerencias inteligentes funciona automáticamente en modo degradado (usando sugerencias estáticas) si el servicio de ML no está disponible. No se requiere configuración adicional para usar las sugerencias básicas.

### Configuración del Servicio de Sugerencias (Opcional)

Para habilitar las sugerencias basadas en ML, puedes configurar la URL del servicio:

```typescript
// Configurar la URL del servicio de sugerencias (opcional)
await http.initialize({
  suggestionService: {
    enabled: true,
    url: "http://tu-servidor-de-sugerencias.com", // URL personalizada
  },
});
```

### Ejemplo en consola

Así se ve el sistema de sugerencias en la consola:

```
> npm run example:http

Making GET request to https://api.example.com/users…
❌ Error: Failed to connect to the server

💡 Suggestion: Check your internet connection and make sure the server is up and running
Was this suggestion helpful? (y/n): y
✅ Thank you for your feedback

Making POST request to https://api.example.com/login…
❌ Error: Authentication failed

💡 Suggestion: Ensure your credentials are correct or try resetting your password
Was this suggestion helpful? (y/n): n
📝 Feedback recorded. We'll work on improving our suggestions.
```

## Licencia

MIT
