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
- 📈 Sistema de métricas para seguimiento de usuario y analíticas

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
  baseURL: "https://api.ejemplo.com",
  loginEndpoint: "/auth/login",
  logoutEndpoint: "/auth/logout",
  userInfoEndpoint: "/auth/me", // Opcional
  refreshEndpoint: "/auth/refresh", // Opcional
  tokenKey: "token",
  refreshTokenKey: "refreshToken",
  storage: "localStorage", // o 'sessionStorage' o 'cookie'
  cookieOptions: {
    secure: true,
    httpOnly: true,
    sameSite: "Strict",
  },
  onLogin: (response) => {
    console.log("Usuario autenticado:", response);
  },
  onLogout: () => {
    console.log("Usuario desconectado");
  },
  onError: (error) => {
    console.error("Error de autenticación:", error);
  },
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

  // Configuración del sistema de métricas (opcional)
  metrics: {
    enabled: true, // Activar métricas
    endpoint: "https://tu-api.com/metrics", // URL para enviar métricas (opcional)
    reportingInterval: 60000, // Enviar cada minuto (ms)
    trackRoutes: true, // Registrar rutas visitadas
    trackEvents: ["click", "form_submit"], // Eventos a rastrear
    onMetricsUpdate: (metrics) => {
      // Callback al actualizar (opcional)
      console.log("Tiempo activo:", metrics.activeTime);
    },
  },
});
```

## Inicialización Avanzada

LazyHTTP ofrece múltiples opciones de configuración que puedes establecer durante la inicialización:

```typescript
// Inicializar la biblioteca con configuración avanzada
await http.initialize({
  // URLs base para backend y frontend (opcional)
  baseUrl: "https://api.tuservicio.com", // URL base para peticiones API
  frontendUrl: "https://tuaplicacion.com", // URL base para redirecciones frontend

  // Configuración global de peticiones (opcional)
  timeout: 15000, // Timeout global en ms (15 segundos)
  retries: 2, // Número de reintentos por defecto
  headers: {
    // Headers por defecto para todas las peticiones
    "Accept-Language": "es-ES",
    "X-App-Version": "1.0.0",
  },

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

  // Configuración del sistema de métricas (opcional)
  metrics: {
    enabled: true, // Activar métricas
    endpoint: "https://tu-api.com/metrics", // URL para enviar métricas (opcional)
    reportingInterval: 60000, // Enviar cada minuto (ms)
    trackRoutes: true, // Registrar rutas visitadas
    trackEvents: ["click", "form_submit"], // Eventos a rastrear
    onMetricsUpdate: (metrics) => {
      // Callback al actualizar (opcional)
      console.log("Tiempo activo:", metrics.activeTime);
    },
  },
});
```

### Opciones de Configuración

#### URLs Base

- **baseUrl**: URL base para todas las peticiones API. Se añadirá automáticamente a cada endpoint.
- **frontendUrl**: URL base para redirecciones a páginas frontend, útil para integraciones OAuth o navegación.

#### Configuración Global

- **timeout**: Tiempo máximo en milisegundos para esperar una respuesta (sobrescribible por petición).
- **retries**: Número de reintentos automáticos ante fallos de red (sobrescribible por petición).
- **headers**: Headers HTTP que se incluirán en todas las peticiones.

#### Sistema de Sugerencias

- **suggestionService.enabled**: Activa/desactiva el sistema de sugerencias inteligentes.
- **suggestionService.url**: URL del servidor de sugerencias para el procesamiento.

#### Sistema de Caché

- **cache.enabled**: Activa/desactiva la caché de respuestas HTTP.
- **cache.defaultStrategy**: Estrategia de caché por defecto (`cache-first`, `network-first`, etc).
- **cache.defaultTTL**: Tiempo de vida por defecto de los elementos en caché.
- **cache.storage**: Tipo de almacenamiento (`memory`, `local-storage`, `session-storage`).
- **cache.maxSize**: Tamaño máximo de la caché (número de elementos).

#### Sistema de Métricas

- **metrics.enabled**: Activa/desactiva la recopilación de métricas.
- **metrics.endpoint**: URL donde enviar las métricas recopiladas.
- **metrics.reportingInterval**: Intervalo en ms para el envío periódico de métricas.
- **metrics.trackRoutes**: Activa el seguimiento automático de rutas visitadas.
- **metrics.trackEvents**: Lista de eventos DOM a rastrear automáticamente.
- **metrics.onMetricsUpdate**: Callback que se ejecuta cuando se actualizan las métricas.

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

### Sistema de Tags e Invalidación

El sistema de caché de LazyHTTP ofrece un mecanismo avanzado de tags para agrupar entradas de caché relacionadas, facilitando su invalidación selectiva:

```typescript
// Realizar una petición con tags
const categoriesResponse = await http.get("/api/categories", {
  cache: {
    tags: ["category", "list", "public"], // Asociar múltiples tags
  },
});

// Posteriormente, invalidar todas las entradas con el tag 'category'
http.invalidateCacheByTags(["category"]);
```

#### Funcionamiento interno

Cuando asignas tags a una petición cacheada:

1. Los tags se incorporan directamente en la clave de caché, creando un identificador único
2. Cuando se solicita invalidar por tag, el sistema busca todas las entradas cuya clave contenga ese tag
3. Solo las entradas que coincidan con al menos uno de los tags especificados son invalidadas

Esta implementación garantiza que:

- La invalidación por tags es eficiente y precisa
- Se pueden usar múltiples tags para crear categorías superpuestas de datos
- Solo se invalidan las entradas específicas, manteniendo intactas las demás

#### Ejemplo práctico

```typescript
// Estas entradas se almacenarán con claves diferentes
await http.get("/api/news", { cache: { tags: ["news", "public"] } });
await http.get("/api/categories", { cache: { tags: ["category", "public"] } });
await http.get("/api/admin/stats", { cache: { tags: ["admin", "stats"] } });

// Esto invalidará la primera y segunda entrada, pero no la tercera
http.invalidateCacheByTags(["public"]);

// Esto solo invalidará la tercera entrada
http.invalidateCacheByTags(["admin"]);
```

#### Cuándo usar tags

- Para agrupar recursos relacionados que deben invalidarse juntos
- Cuando múltiples endpoints devuelven datos superpuestos
- Para implementar invalidación selectiva basada en roles o permisos
- Para crear capas de caché con diferentes políticas de expiración

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

## Sistema de Métricas de Usuario

LazyHTTP incluye un potente sistema de métricas que te permite registrar y analizar el comportamiento del usuario. Las métricas se recopilan automáticamente durante una sesión y pueden enviarse a un servidor para análisis o utilizarse localmente.

### Características principales

- 🔍 **Seguimiento automático**: Registra solicitudes HTTP, tiempo activo y navegación sin configuración adicional
- 📊 **Métricas personalizables**: Define qué eventos rastrear y cómo procesarlos
- 🌐 **Envío a servidor**: Configura un endpoint para enviar datos periódicamente
- 📱 **Funciona offline**: Almacena métricas localmente y envía cuando haya conexión
- 🔄 **Callbacks en vivo**: Recibe actualizaciones en tiempo real para mostrar en UI

### Configuración básica

```typescript
// Al inicializar la biblioteca
await http.initialize({
  metrics: {
    enabled: true,
    endpoint: "https://analytics.miapp.com/metrics",
    reportingInterval: 5 * 60 * 1000, // Cada 5 minutos
  },
});
```

### Registro de eventos personalizados

```typescript
// Registrar una actividad específica
http.trackActivity("boton_confirmacion_clickeado");
http.trackActivity("formulario_enviado");
```

### Obtener métricas actuales

```typescript
// Obtener las métricas de la sesión actual
const metrics = http.getCurrentMetrics();
console.log(`Tiempo activo: ${metrics.activeTime / 1000} segundos`);
console.log(`Peticiones realizadas: ${metrics.requestCount}`);
```

### Callbacks en tiempo real

```typescript
await http.initialize({
  metrics: {
    enabled: true,
    onMetricsUpdate: (metrics) => {
      // Actualizar componentes de UI con las métricas actuales
      updateDashboard(metrics);
    },
  },
});
```

### Integración con sistemas de analítica

```typescript
await http.initialize({
  metrics: {
    enabled: true,
    onMetricsUpdate: (metrics) => {
      // Integrar con Google Analytics, MixPanel, etc.
      sendToAnalytics(metrics);
    },
  },
});
```

## Licencia

MIT
