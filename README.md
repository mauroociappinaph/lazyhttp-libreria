![Logotipo de HttpLazy](logotipo%20empresarial%20empresa%20de%20envíos%20y%20entregas%20minimalista%20con%20letra%20color%20azul%20rojo%20blanco.png)

# Documentación de HttpLazy

[![npm version](https://img.shields.io/npm/v/httplazy)](https://www.npmjs.com/package/httplazy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-blue)](https://www.typescriptlang.org/)

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Instalación](#instalación)
- [Arquitectura Cliente/Servidor](#arquitectura-clienteservidor)
  - [Importación según entorno](#importación-según-entorno)
  - [Comparativa de funcionalidades](#comparativa-de-funcionalidades)
- [Uso Básico](#uso-básico)
  - [Métodos HTTP](#métodos-http)
  - [Configuración Inicial](#configuración-inicial)
- [API de Referencia](#api-de-referencia)
  - [Métodos Básicos](#métodos-básicos)
  - [Opciones de Petición](#opciones-de-petición)
  - [Respuesta](#respuesta)
- [Funcionalidades Avanzadas](#funcionalidades-avanzadas)
  - [Autenticación](#autenticación)
  - [Caché](#caché)
  - [Interceptores](#interceptores)
  - [Métricas y Actividad](#métricas-y-actividad)
  - [Streaming (Servidor)](#streaming-servidor)
  - [Proxies (Servidor)](#proxies-servidor)
- [Manejo de Errores](#manejo-de-errores)
  - [Tipos de Errores Comunes](#tipos-de-errores-comunes)
  - [Manejo de Errores de Red](#manejo-de-errores-de-red)
  - [Errores Personalizados](#errores-personalizados)
- [Uso con Next.js](#uso-con-nextjs)
  - [En Componentes Cliente](#en-componentes-cliente)
  - [En API Routes](#en-api-routes)
  - [En Server Actions](#en-server-actions)
- [Buenas Prácticas](#buenas-prácticas)
  - [Organización del Código](#organización-del-código)
  - [Patrones de Uso](#patrones-de-uso)
  - [Optimización](#optimización)
- [Solución de Problemas](#solución-de-problemas)
  - [Errores CORS](#errores-cors)
  - [Errores de Módulos Faltantes en Next.js](#errores-de-módulos-faltantes-en-nextjs)
  - [Errores de TypeScript](#errores-de-typescript)
- [Diagramas de Arquitectura](#diagramas-de-arquitectura)
- [Guía de Contribución](#guía-de-contribución)
- [Casos de Uso Específicos](#casos-de-uso-específicos)
- [Comparativa con Alternativas](#comparativa-con-alternativas)
- [Guía de Migración](#guía-de-migración)
- [Rendimiento](#rendimiento)
- [Convenciones de Código](#convenciones-de-código)
- [Seguridad](#seguridad)
- [Internacionalización](#internacionalización)
- [Recursos Adicionales](#recursos-adicionales)

## Descripción General

**HttpLazy** es una biblioteca HTTP moderna y flexible diseñada para simplificar las peticiones HTTP en aplicaciones JavaScript/TypeScript, tanto en entornos de navegador como de servidor (Node.js). Su arquitectura modular permite utilizarla en cualquier framework, con un soporte especial para aplicaciones universales (isomórficas) como Next.js, Remix o similares.

La biblioteca ofrece funcionalidades avanzadas mientras mantiene una API intuitiva:

- **Interfaz unificada**: API consistente para todas las operaciones HTTP
- **Arquitectura cliente/servidor**: Separación clara entre código de navegador y Node.js
- **Optimización automática**: Detección de entorno para usar la implementación adecuada
- **Funcionalidades avanzadas**: Manejo de errores, caché, autenticación, interceptores, etc.

## Instalación

```bash
# Usando npm
npm install httplazy

# Usando yarn
yarn add httplazy

# Usando pnpm
pnpm add httplazy
```

## Arquitectura Cliente/Servidor

La versión 1.7.0+ de HttpLazy implementa una arquitectura dual que separa el código compatible con navegadores del código exclusivo de Node.js:

```
httplazy/
├── client/   # Código seguro para navegadores
├── server/   # Código con capacidades completas (Node.js)
└── common/   # Código compartido entre ambos entornos
```

### Importación según entorno

```javascript
// Detección automática (recomendado)
import { http } from "httplazy";

// Específicamente para navegador
import { http } from "httplazy/client";

// Específicamente para Node.js
import { http } from "httplazy/server";
```

### Comparativa de funcionalidades

| Característica     | Cliente (Browser) | Servidor (Node.js) |
| ------------------ | ----------------- | ------------------ |
| HTTP básico        | ✅                | ✅                 |
| Autenticación      | ✅                | ✅                 |
| Interceptores      | ✅                | ✅                 |
| Caché básico       | ✅                | ✅                 |
| Manejo de errores  | ✅                | ✅                 |
| Proxies HTTP/SOCKS | ❌                | ✅                 |
| Streaming avanzado | ❌                | ✅                 |
| Soporte SOA        | ❌                | ✅                 |
| Métricas avanzadas | ✅ (limitado)     | ✅ (completo)      |

## Uso Básico

### Métodos HTTP

```javascript
import { http } from "httplazy";

// Petición GET
const { data, error } = await http.get("https://api.example.com/users");
if (error) {
  console.error("Error:", error.message);
} else {
  console.log("Usuarios:", data);
}

// Petición POST con datos
const response = await http.post("https://api.example.com/users", {
  name: "Ana García",
  email: "ana@example.com",
});

// Petición con parámetros de consulta
const searchResponse = await http.get("https://api.example.com/search", {
  params: {
    q: "javascript",
    page: 1,
    limit: 20,
  },
});

// Obtener recurso por ID
const user = await http.getById("https://api.example.com/users", "123");

// Actualizar recurso (PUT)
await http.put("https://api.example.com/users/123", {
  name: "Ana López",
});

// Actualización parcial (PATCH)
await http.patch("https://api.example.com/users/123", {
  status: "active",
});

// Eliminar recurso
await http.del("https://api.example.com/users/123");
```

### Configuración Inicial

```javascript
// Configuración global
http.initialize({
  baseUrl: "https://api.example.com",
  defaultHeaders: {
    "Content-Type": "application/json",
    "Accept-Language": "es",
  },
  timeout: 10000, // 10 segundos
  retries: 2, // Reintentar peticiones fallidas
});
```

## API de Referencia

### Métodos Básicos

| Método                                       | Descripción                                     | Parámetros                                                                                                                                     |
| -------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `http.request(method, url, data?, options?)` | Método genérico para cualquier tipo de petición | `method`: Tipo de petición (GET, POST, etc)<br>`url`: URL del endpoint<br>`data`: Datos a enviar (opcional)<br>`options`: Opciones adicionales |
| `http.get(url, options?)`                    | Petición GET                                    | `url`: URL del endpoint<br>`options`: Opciones adicionales                                                                                     |
| `http.getAll(url, options?)`                 | Petición GET optimizada para listados           | `url`: URL del endpoint<br>`options`: Opciones adicionales                                                                                     |
| `http.getById(url, id, options?)`            | Petición GET para un recurso específico         | `url`: URL base<br>`id`: Identificador del recurso<br>`options`: Opciones adicionales                                                          |
| `http.post(url, data?, options?)`            | Petición POST                                   | `url`: URL del endpoint<br>`data`: Datos a enviar<br>`options`: Opciones adicionales                                                           |
| `http.put(url, data?, options?)`             | Petición PUT                                    | `url`: URL del endpoint<br>`data`: Datos completos a enviar<br>`options`: Opciones adicionales                                                 |
| `http.patch(url, data?, options?)`           | Petición PATCH                                  | `url`: URL del endpoint<br>`data`: Datos parciales a enviar<br>`options`: Opciones adicionales                                                 |
| `http.del(url, options?)`                    | Petición DELETE                                 | `url`: URL del endpoint<br>`options`: Opciones adicionales                                                                                     |

### Opciones de Petición

```typescript
interface RequestOptions {
  headers?: Record<string, string>; // Cabeceras HTTP
  params?: Record<string, any>; // Parámetros de consulta (query string)
  timeout?: number; // Tiempo máximo en ms
  retries?: number; // Número de reintentos
  cache?: boolean | number; // Habilitar caché y TTL en segundos
  tags?: string[]; // Etiquetas para invalidación de caché
}
```

### Respuesta

```typescript
interface ApiResponse<T = any> {
  data: T; // Datos de respuesta
  status: number; // Código de estado HTTP
  headers: Record<string, string>; // Cabeceras de respuesta
  error?: {
    // Presente solo en errores
    message: string; // Mensaje descriptivo
    code?: string; // Código de error
    details?: any; // Detalles adicionales
  };
  config?: any; // Configuración usada en la petición
}
```

## Funcionalidades Avanzadas

### Autenticación

```javascript
// Configuración de autenticación
http.configureAuth({
  loginEndpoint: "/auth/login",
  logoutEndpoint: "/auth/logout",
  refreshTokenEndpoint: "/auth/refresh",
  tokenStorage: "localStorage", // 'localStorage', 'sessionStorage', 'cookie', 'memory'
  tokenKey: "access_token",
  refreshTokenKey: "refresh_token",
  userKey: "user_data",
  autoRefresh: true,
  redirectOnUnauthorized: true,
  unauthorizedRedirectUrl: "/login",
});

// Iniciar sesión
const { data, error } = await http.login({
  username: "usuario@ejemplo.com",
  password: "contraseña",
});

// Verificar estado de autenticación
if (http.isAuthenticated()) {
  // Usuario autenticado
  const user = http.getAuthenticatedUser();
  console.log("Usuario actual:", user);

  // Obtener token para operaciones manuales
  const token = http.getAccessToken();
}

// Cerrar sesión
await http.logout();
```

### Caché

```javascript
// Configuración de caché
http.configureCaching({
  enabled: true,
  ttl: 300, // Tiempo de vida en segundos
  storage: "localStorage", // 'memory', 'localStorage', 'sessionStorage'
  maxSize: 100, // Máximo número de entradas (solo 'memory')
  invalidateOnMutation: true, // Invalidar en operaciones PUT/POST/DELETE
});

// Invalidación manual
http.invalidateCache("/users/*"); // Invalidar usando patrones
http.invalidateCacheByTags(["users"]); // Invalidar por etiquetas

// Usar caché en peticiones específicas
const { data } = await http.get("/users", {
  cache: true, // Habilitar caché
  tags: ["users", "list"], // Asignar etiquetas
});

// Especificar TTL personalizado
await http.get("/users", { cache: 3600 }); // 1 hora
```

### Interceptores

```javascript
// Interceptor de petición
http._setupInterceptors((config) => {
  // Modificar la petición antes de enviarla
  config.headers = config.headers || {};
  config.headers["X-Client-Version"] = "1.0.0";

  // Registrar la petición
  console.log("Petición saliente:", config.url);

  return config;
}, "request");

// Interceptor de respuesta
http._setupInterceptors((response) => {
  // Modificar la respuesta antes de entregarla
  if (response.data && response.data.results) {
    response.data = response.data.results; // Extraer datos
  }

  return response;
}, "response");
```

### Métricas y Actividad

```javascript
// Configurar métricas
http.configureMetrics({
  enabled: true,
  trackErrors: true,
  trackPerformance: true,
  trackCache: true,
  sampleRate: 100, // Porcentaje de peticiones a medir
});

// Registrar eventos personalizados
http.trackActivity("page_view");
http.trackActivity("search", { query: "término" });

// Obtener métricas actuales
const metrics = http.getCurrentMetrics();
console.log("Tiempo promedio de respuesta:", metrics.avgResponseTime);
console.log("Tasa de errores:", metrics.errorRate);
```

### Streaming (Servidor)

```javascript
// Importar desde servidor
import { stream } from "httplazy/server";

// Streaming de archivo grande
const fileStream = await stream("https://example.com/large-file.zip", {
  onData: (chunk) => {
    // Procesar cada fragmento
    const percent = (bytesReceived / totalBytes) * 100;
    updateProgressBar(percent);
  },
  onComplete: () => {
    console.log("Descarga completada");
  },
  onError: (err) => {
    console.error("Error en streaming:", err);
  },
});

// Streaming básico en cliente
import { stream } from "httplazy/client";

const textStream = await stream("https://api.example.com/events");
// Procesar stream con las APIs del navegador
```

### Proxies (Servidor)

```javascript
// Importar desde servidor
import { configureProxy } from "httplazy/server";

// Configurar proxy HTTP
configureProxy({
  protocol: "http",
  host: "proxy.company.com",
  port: 8080,
  auth: {
    username: "user",
    password: "pass",
  },
});

// Proxy SOCKS
configureProxy({
  protocol: "socks5",
  host: "127.0.0.1",
  port: 9050,
});
```

## Manejo de Errores

HttpLazy proporciona un manejo de errores consistente y predecible:

```javascript
const { data, error, status } = await http.get("/api/users");

if (error) {
  // Manejar según código HTTP
  if (status === 404) {
    console.error("Recurso no encontrado");
  } else if (status === 401) {
    console.error("Autenticación requerida");
  } else if (status >= 500) {
    console.error("Error del servidor:", error.message);
  } else {
    console.error(`Error (${status}):`, error.message);
  }

  // Detalles adicionales
  if (error.details) {
    console.error("Detalles:", error.details);
  }
} else {
  // Procesar datos exitosos
}
```

### Tipos de Errores Comunes

| Código | Tipo                 | Causas habituales                          |
| ------ | -------------------- | ------------------------------------------ |
| 400    | Bad Request          | Datos incorrectos, validación fallida      |
| 401    | Unauthorized         | Token inválido o expirado                  |
| 403    | Forbidden            | Permisos insuficientes                     |
| 404    | Not Found            | Recurso inexistente                        |
| 422    | Unprocessable Entity | Datos válidos pero lógicamente incorrectos |
| 429    | Too Many Requests    | Límite de tasa excedido                    |
| 500    | Server Error         | Error interno del servidor                 |

### Manejo de Errores de Red

```javascript
try {
  const response = await http.get("/api/data");

  if (response.error) {
    // Error HTTP con respuesta del servidor
    handleApiError(response.error);
  } else {
    processData(response.data);
  }
} catch (err) {
  // Errores de red, como desconexión o timeout
  console.error("Error de conexión:", err.message);
}
```

### Errores Personalizados

HttpLazy proporciona un sistema extensible de manejo de errores que va más allá de los códigos HTTP estándar.

#### Tipos de errores específicos de HttpLazy

La biblioteca incluye clases de error especializadas para diferentes situaciones:

```javascript
// Errores específicos por categoría
import {
  HttpError, // Error base para todos los errores HTTP
  NetworkError, // Errores de conexión, timeout, DNS
  AuthenticationError, // Errores relacionados con autenticación
  CacheError, // Errores en el sistema de caché
  ValidationError, // Errores de validación de datos
  RateLimitError, // Errores por límite de peticiones excedido
} from "httplazy/errors";

// Verificar tipo de error
if (error instanceof AuthenticationError) {
  // Manejar error de autenticación
  redirectToLogin();
} else if (error instanceof NetworkError) {
  // Manejar error de red
  showOfflineMessage();
}
```

#### Códigos de error personalizados

Además de los códigos HTTP estándar, HttpLazy define códigos internos para situaciones específicas:

```javascript
// Ejemplo de manejo de códigos personalizados
const { error } = await http.get("/api/users");

if (error) {
  switch (error.code) {
    case "AUTH_EXPIRED":
      await http.refreshToken();
      // Reintentar petición
      break;
    case "CACHE_MISS":
      // Obtener desde origen
      break;
    case "RATE_LIMITED":
      // Implementar backoff exponencial
      break;
    case "VALIDATION_FAILED":
      // Mostrar errores de validación
      showValidationErrors(error.details);
      break;
    default:
      // Manejo genérico
      showErrorMessage(error.message);
  }
}
```

| Código de Error     | Descripción                                   | Acción recomendada                     |
| ------------------- | --------------------------------------------- | -------------------------------------- |
| `AUTH_EXPIRED`      | Token de autenticación expirado               | Refrescar token y reintentar           |
| `AUTH_INVALID`      | Token inválido o credenciales incorrectas     | Redirigir a login                      |
| `CACHE_MISS`        | No se encontró en caché                       | Obtener desde origen                   |
| `RATE_LIMITED`      | Límite de peticiones excedido                 | Implementar backoff exponencial        |
| `NETWORK_OFFLINE`   | Sin conexión a Internet                       | Mostrar modo offline                   |
| `TIMEOUT_EXCEEDED`  | Tiempo de espera agotado                      | Reintentar o aumentar timeout          |
| `VALIDATION_FAILED` | Datos enviados no cumplen validación          | Mostrar errores específicos al usuario |
| `RESOURCE_CONFLICT` | Conflicto al modificar recurso (concurrencia) | Recarga y muestra diferencias          |

#### Cómo extender los errores

Puedes crear tus propias clases de error personalizadas que se integren con el sistema de HttpLazy:

```javascript
// Definir un error personalizado para tu dominio
import { HttpError } from "httplazy/errors";

class PaymentDeclinedError extends HttpError {
  constructor(message, details = {}) {
    super(message, "PAYMENT_DECLINED", 402, details);
    this.name = "PaymentDeclinedError";

    // Agregar propiedades específicas
    this.paymentId = details.paymentId;
    this.reason = details.reason;
    this.canRetry = details.canRetry || false;
  }

  // Métodos personalizados
  suggestAlternative() {
    return this.details.alternatives || [];
  }
}

// Usar con el interceptor de respuesta
http._setupInterceptors((response) => {
  // Transformar errores estándar en personalizados
  if (response.status === 402 && response.data?.type === "payment_error") {
    throw new PaymentDeclinedError("Pago rechazado", {
      paymentId: response.data.paymentId,
      reason: response.data.reason,
      canRetry: response.data.canRetry,
      alternatives: response.data.alternatives,
    });
  }
  return response;
}, "response");

// En el código de la aplicación
try {
  await paymentService.processPayment(paymentData);
} catch (error) {
  if (error instanceof PaymentDeclinedError) {
    if (error.canRetry) {
      showRetryMessage(error.reason);
    } else {
      const alternatives = error.suggestAlternative();
      showAlternativePaymentMethods(alternatives);
    }
  }
}
```

#### Patrones de manejo de errores avanzados

Estructura tu código para un manejo de errores consistente y mantenible:

```javascript
// Patrón: Centralizar lógica de manejo de errores
const errorHandlers = {
  AUTH_EXPIRED: async (error) => {
    // Refrescar token automáticamente
    await authService.refreshToken();
    return true; // Indica que se puede reintentar
  },
  NETWORK_OFFLINE: (error) => {
    // Activar modo offline
    appStore.setOfflineMode(true);
    showToast("Trabajando en modo offline");
    return false; // No reintentar automáticamente
  },
  RATE_LIMITED: (error) => {
    // Implementar backoff
    const retryAfter = error.details.retryAfter || 5000;
    showToast(`Demasiadas peticiones, reintentando en ${retryAfter / 1000}s`);
    return new Promise((resolve) =>
      setTimeout(() => resolve(true), retryAfter)
    );
  },
  // Otros manejadores...
};

// Función helper para procesar errores
async function processApiError(error, retryFn) {
  // Obtener código específico o usar HTTP status como fallback
  const errorCode = error.code || `HTTP_${error.status}`;

  // Ver si hay un manejador específico
  if (errorHandlers[errorCode]) {
    const shouldRetry = await errorHandlers[errorCode](error);
    if (shouldRetry && retryFn) {
      return retryFn(); // Reintentar la operación
    }
  } else {
    // Manejo genérico para errores sin manejador específico
    logError(error);
    showErrorMessage(error.message);
  }

  return null; // No se pudo manejar/reintentar
}

// Uso en componentes
async function fetchUserData() {
  try {
    setLoading(true);
    const response = await userService.getUser();

    if (response.error) {
      const result = await processApiError(response.error, fetchUserData);
      if (result !== null) {
        return result; // Error manejado con éxito
      }
      setError(response.error);
      return null;
    }

    return response.data;
  } catch (err) {
    await processApiError(err, fetchUserData);
    setError(err);
    return null;
  } finally {
    setLoading(false);
  }
}
```

Este enfoque permite:

- Centralizar la lógica de manejo de errores
- Implementar recuperación automática (auto-retry, refresh token)
- Mantener el código de negocio limpio, separando la lógica de error
- Aplicar políticas consistentes en toda la aplicación
- Extender fácilmente con nuevos tipos de errores

## Uso con Next.js

HttpLazy está optimizado para aplicaciones Next.js, gestionando automáticamente la diferencia entre código de cliente y servidor.

### En Componentes Cliente

```jsx
"use client";
import { useState, useEffect } from "react";
import { http } from "httplazy/client";

export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await http.getById("/api/users", userId);
      if (!error) {
        setUser(data);
      }
      setLoading(false);
    }

    loadUser();
  }, [userId]);

  if (loading) return <div>Cargando...</div>;
  if (!user) return <div>Usuario no encontrado</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### En API Routes

```javascript
// app/api/products/route.js
import { http } from "httplazy/server";

export async function GET(request) {
  // Obtener productos desde un servicio externo
  const response = await http.get("https://external-api.com/products");

  if (response.error) {
    return Response.json(
      { error: response.error.message },
      { status: response.status }
    );
  }

  return Response.json(response.data);
}
```

### En Server Actions

```javascript
// app/actions.js
"use server";
import { http } from "httplazy/server";

export async function processPayment(formData) {
  const paymentData = {
    amount: formData.get("amount"),
    cardNumber: formData.get("cardNumber"),
    // otros campos...
  };

  // Usar proxy para API de pagos
  configureProxy({
    protocol: "https",
    host: "secure-proxy.company.com",
    port: 443,
  });

  const response = await http.post(
    "https://payment-gateway.com/process",
    paymentData
  );

  return response.data;
}
```

## Buenas Prácticas

### Organización del Código

Crea un servicio centralizado para tus APIs:

```javascript
// lib/api.js
import { http } from "httplazy/client";

http.initialize({
  baseUrl: "/api",
  // otras configuraciones...
});

export const userService = {
  getAll: () => http.get("/users"),
  getById: (id) => http.getById("/users", id),
  create: (data) => http.post("/users", data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.del(`/users/${id}`),
};

export const authService = {
  login: (credentials) => http.login(credentials),
  logout: () => http.logout(),
  getCurrentUser: () => http.getAuthenticatedUser(),
};

// exportar otros servicios...
```

### Patrones de Uso

1. **Desestructuración de respuestas**

   ```javascript
   const { data, error, status } = await userService.getAll();
   ```

2. **Manejo de promesas en paralelo**

   ```javascript
   const [users, products] = await Promise.all([
     userService.getAll(),
     productService.getAll(),
   ]);
   ```

3. **Patrones de carga con React**

   ```javascript
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
     let isMounted = true;

     async function fetchData() {
       try {
         setLoading(true);
         const response = await userService.getAll();

         if (isMounted) {
           if (response.error) {
             setError(response.error);
             setData(null);
           } else {
             setData(response.data);
             setError(null);
           }
         }
       } catch (err) {
         if (isMounted) {
           setError({ message: "Error de conexión" });
           setData(null);
         }
       } finally {
         if (isMounted) {
           setLoading(false);
         }
       }
     }

     fetchData();

     return () => {
       isMounted = false;
     };
   }, []);
   ```

### Optimización

1. **Uso adecuado de caché**

   ```javascript
   // Datos que cambian poco
   const config = await http.get("/api/config", { cache: 3600 }); // 1h

   // Datos que cambian con frecuencia
   const notifications = await http.get("/api/notifications", { cache: 60 }); // 1min
   ```

2. **Invalidación selectiva**

   ```javascript
   // Después de actualizar un usuario
   await userService.update(id, userData);
   http.invalidateCacheByTags(["users"]);
   ```

3. **Precarga de datos críticos**
   ```javascript
   // Precargar datos comunes durante la inicialización
   export async function initializeApp() {
     await Promise.all([
       http.get("/api/config", { cache: true }),
       http.get("/api/common-data", { cache: true }),
     ]);
   }
   ```

## Solución de Problemas

### Errores CORS

Si experimentas errores CORS en desarrollo:

```javascript
// Configuración para desarrollo local
if (process.env.NODE_ENV === "development") {
  http.initialize({
    // otras configuraciones...
    defaultHeaders: {
      "Content-Type": "application/json",
      // Añadir headers CORS si es necesario
    },
  });
}
```

### Errores de Módulos Faltantes en Next.js

Si encuentras errores como "Can't resolve 'net'" en Next.js, asegúrate de importar correctamente:

```javascript
// ❌ Incorrecto
import { http } from "httplazy";

// ✅ Correcto para componentes cliente
import { http } from "httplazy/client";
```

### Errores de TypeScript

Si encuentras errores de TypeScript relacionados con los tipos:

```typescript
// Importar tipos explícitamente
import { http } from "httplazy/client";
import type { ApiResponse, RequestOptions } from "httplazy/client";

async function fetchData(): Promise<ApiResponse<UserType[]>> {
  return http.get<UserType[]>("/api/users");
}
```

## Diagramas de Arquitectura

### Arquitectura Cliente/Servidor

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   CLIENTE (Navegador)   │      │   SERVIDOR (Node.js)    │
│                         │      │                         │
│  ┌─────────────────┐    │      │  ┌─────────────────┐    │
│  │                 │    │      │  │                 │    │
│  │  Core API       │    │      │  │  Core API       │    │
│  │  - request()    │    │      │  │  - request()    │    │
│  │  - get(), post()│    │      │  │  - get(), post()│    │
│  │  - auth, caché  │    │      │  │  - auth, caché  │    │
│  │                 │    │      │  │                 │    │
│  └────────┬────────┘    │      │  └────────┬────────┘    │
│           │             │      │           │             │
│  ┌────────▼────────┐    │      │  ┌────────▼────────┐    │
│  │                 │    │      │  │                 │    │
│  │  Implementación │    │      │  │  Implementación │    │
│  │  Browser        │    │      │  │  Node.js        │    │
│  │  (fetch/XHR)    │    │      │  │  (http/https)   │    │
│  │                 │    │      │  │                 │    │
│  └─────────────────┘    │      │  └─────────────────┘    │
│                         │      │           │             │
└─────────────────────────┘      │  ┌────────▼────────┐    │
                                 │  │                 │    │
                                 │  │  Extensiones    │    │
                                 │  │  - Proxies      │    │
                                 │  │  - Streaming    │    │
                                 │  │  - SOA          │    │
                                 │  │                 │    │
                                 │  └─────────────────┘    │
                                 │                         │
                                 └─────────────────────────┘
```

### Flujo de una Petición HTTP

```
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐
│          │    │            │    │            │    │            │    │         │
│ Llamada  │--->│Interceptor │--->│  Caché     │--->│ Solicitud  │--->│ Servidor│
│ http.get │    │ Petición   │    │ ¿Presente? │    │   HTTP     │    │  API    │
│          │    │            │    │            │    │            │    │         │
└──────────┘    └────────────┘    └─────┬──────┘    └─────┬──────┘    └────┬────┘
                                        │                 │                │
                                        │ Sí              │                │
                                        ▼                 │                │
                                 ┌────────────┐          │                │
                                 │            │          │                │
                                 │   Datos    │          │                │
                                 │  Cacheados │          │                │
                                 │            │          │                │
                                 └──────┬─────┘          │                │
                                        │                │                │
                                        ▼                │                │
┌──────────┐    ┌────────────┐    ┌────▼──────┐    ┌─────▼──────┐    ┌────▼────┐
│          │    │            │    │           │    │            │    │         │
│ Respuesta│<---│Interceptor │<---│Procesar   │<---│ Respuesta  │<---│ Datos   │
│ Cliente  │    │ Respuesta  │    │ Errores   │    │   HTTP     │    │ API     │
│          │    │            │    │           │    │            │    │         │
└──────────┘    └────────────┘    └───────────┘    └────────────┘    └─────────┘
```

## Guía de Contribución

Estamos abiertos a contribuciones para mejorar HttpLazy. Puedes contribuir de varias formas:

### Cómo Contribuir

1. **Fork del repositorio**: Crea tu propio fork del proyecto desde GitHub
2. **Clona**: `git clone https://github.com/tu-usuario/lazyhttp-libreria.git`
3. **Instala**: `npm install` para instalar dependencias
4. **Crea una rama**: `git checkout -b nombre-caracteristica`
5. **Desarrolla**: Implementa tu característica o corrección
6. **Prueba**: Ejecuta `npm test` para asegurar que todo funciona
7. **Compila**: `npm run build` para verificar la compilación
8. **Commit**: `git commit -m "feat: descripción de tu cambio"`
9. **Push**: `git push origin nombre-caracteristica`
10. **Crea un Pull Request**: Abre un PR en GitHub con una descripción detallada

### Guías de Estilo

- Seguimos las convenciones de TypeScript estándar
- Usamos ESLint con la configuración del proyecto
- Todos los cambios deben incluir pruebas
- Documentar cualquier nueva API o cambio en la API existente

### Proceso de Revisión

- Cada PR es revisado por al menos un mantenedor del proyecto
- Los CI checks deben pasar (tests, linting, tipado)
- El código debe seguir las [Convenciones de Código](#convenciones-de-código)

## Casos de Uso Específicos

### Manejo de Subida de Archivos

```javascript
// Subida básica de archivo
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const { data, error } = await http.post("/api/upload", formData, {
    headers: {
      // No establecer Content-Type, se establece automáticamente con boundary
    },
  });

  return { data, error };
}

// Subida múltiple con cancelación
async function uploadMultipleFiles(files) {
  const controller = new AbortController();
  const formData = new FormData();

  Array.from(files).forEach((file, index) => {
    formData.append(`file-${index}`, file);
  });

  // Botón para cancelar en la UI
  cancelButton.addEventListener("click", () => controller.abort());

  try {
    const { data } = await http.post("/api/upload-multiple", formData, {
      signal: controller.signal,
      timeout: 120000, // 2 minutos
      retries: 1, // Un reintento en caso de fallo
    });

    return { success: true, data };
  } catch (error) {
    if (error.name === "AbortError") {
      return { success: false, aborted: true };
    }
    return { success: false, error };
  }
}
```

## Comparativa con Alternativas

| Característica             | HttpLazy              | Axios                | Fetch API                    |
| -------------------------- | --------------------- | -------------------- | ---------------------------- |
| **Tamaño (aprox)**         | ~12KB min+gzip        | ~14KB min+gzip       | Nativo                       |
| **Soporte universal**      | ✅ (Cliente/Servidor) | ✅                   | ✅ (Limitado en Node)        |
| **TypeScript**             | ✅ Completo           | ✅ Completo          | Limitado                     |
| **Interceptores**          | ✅                    | ✅                   | ❌ (Requiere implementación) |
| **Caché integrada**        | ✅                    | ❌                   | ❌                           |
| **Cancelación**            | ✅                    | ✅                   | ✅                           |
| **Autenticación**          | ✅ Integrada          | ❌ (Manual)          | ❌ (Manual)                  |
| **Soporte para Streaming** | ✅                    | ✅ (Básico)          | ✅                           |
| **Soporte para Proxy**     | ✅ (Servidor)         | ✅                   | ❌                           |
| **Reintentos automáticos** | ✅                    | ❌ (Requiere config) | ❌                           |
| **Métricas integradas**    | ✅                    | ❌                   | ❌                           |

### ¿Por qué elegir HttpLazy?

- **Uniformidad**: Una sola API para cliente y servidor
- **Optimización automática**: Uso eficiente según el entorno
- **Todo incluido**: No requiere múltiples librerías para caché, auth, etc.
- **Tree-shaking eficiente**: Solo incluye lo que usas
- **Enfoque en TypeScript**: Tipado completo para mejor DX
- **Arquitectura modular**: Fácil de extender

## Guía de Migración

### Migración desde v1.6.x a v1.7.x

La versión 1.7.0 introdujo la arquitectura cliente/servidor. Si vienes de versiones anteriores, sigue estos pasos:

1. **Actualiza la dependencia**:

   ```bash
   npm install httplazy@latest
   ```

2. **Importaciones**: Modifica tus importaciones según el entorno:

```javascript
// Antes (todas las versiones)
import { http } from "httplazy";

// Ahora (específico para navegador)
import { http } from "httplazy/client";

// Ahora (específico para Node.js)
import { http } from "httplazy/server";

// Ahora (detección automática - recomendado)
import { http } from "httplazy";
```

3. **Funciones renombradas**:

   ```javascript
   // Antes
   http.delete("/api/users/123");

   // Ahora
   http.del("/api/users/123");
   ```

4. **Cambios en tipos**:

```typescript
// Antes
import { HttpResponse } from "httplazy";

// Ahora
import { ApiResponse } from "httplazy/common/types";
// o
import type { ApiResponse } from "httplazy";
```

5. **Métodos obsoletos**:

   ```javascript
   // Antes (obsoleto)
   http.configure({
     /* config */
   });

   // Ahora
   http.initialize({
     /* config */
   });
   ```

### Migración desde Axios

Si estás migrando desde Axios, estos son los cambios principales:

```javascript
// Axios
import axios from "axios";

const api = axios.create({
  baseURL: "https://api.example.com",
  timeout: 10000,
  headers: { "X-Custom-Header": "value" },
});

api
  .get("/users")
  .then((response) => console.log(response.data))
  .catch((error) => console.error(error));

// HttpLazy
import { http } from "httplazy";

http.initialize({
  baseUrl: "https://api.example.com",
  timeout: 10000,
  defaultHeaders: { "X-Custom-Header": "value" },
});

const { data, error } = await http.get("/users");
if (error) {
  console.error(error);
} else {
  console.log(data);
}
```

## Rendimiento

HttpLazy está optimizado para ofrecer un rendimiento excelente en diversas condiciones.

### Estrategias de Optimización

#### 1. Uso de Caché

```javascript
// Configuración óptima para recursos estáticos
http.configureCaching({
  enabled: true,
  ttl: 3600, // 1 hora
  storage: "localStorage",
  maxSize: 50,
});

// Peticiones con caché
await http.get("/api/countries", {
  cache: true,
  tags: ["reference-data"],
});
```

#### 2. Estrategia stale-while-revalidate

```javascript
// Usar caché mientras se actualiza en segundo plano
const { data } = await http.get("/api/dashboard-data", {
  cache: {
    strategy: "stale-while-revalidate",
  },
});
```

### Recomendaciones de Rendimiento

1. **Agrupar recursos relacionados**: Usar un único endpoint que devuelva múltiples recursos relacionados.
2. **Usar caché con tags**: Las etiquetas permiten invalidar selectivamente solo ciertos recursos.
3. **Configurar timeouts adecuados**: Ajusta los timeouts según el tipo de operación.
4. **Limitar reintentos automáticos**: Configura un número bajo de reintentos para evitar sobrecargar el servidor.

## Convenciones de Código

HttpLazy sigue unas convenciones estrictas en su desarrollo para mantener consistencia y calidad. Estas mismas convenciones se recomiendan para extender la librería:

### Nomenclatura

- **PascalCase**: Clases, interfaces, tipos y enumerados

  ```typescript
  class HttpClient {}
  interface RequestOptions {}
  ```

- **camelCase**: Variables, funciones, métodos y propiedades

  ```typescript
  const defaultConfig = {};
  function sendRequest() {}
  ```

- **UPPER_SNAKE_CASE**: Constantes y valores de enumerados
  ```typescript
  const DEFAULT_TIMEOUT = 30000;
  enum HttpMethod {
    GET = "GET",
    POST = "POST",
  }
  ```

### Estructura de Archivos

- Un concepto, una responsabilidad por archivo
- Nombres de archivos en kebab-case (ej: `http-client.ts`)
- Carpetas organizadas por dominio funcional
- Extensiones según contenido: `.ts`, `.test.ts`, `.d.ts`

### Documentación de Código

- Comentarios JSDoc para todas las APIs públicas
- Comentarios de una línea para lógica compleja
- Ejemplos de uso para funcionalidades no triviales

Ejemplo:

```typescript
/**
 * Realiza una petición HTTP.
 * @param method - El método HTTP a utilizar (GET, POST, etc.)
 * @param url - La URL de destino
 * @param data - Los datos a enviar (opcional)
 * @param options - Opciones adicionales de la petición
 * @returns Promesa que resuelve a la respuesta
 * @example
 * // Petición GET básica
 * const response = await request('GET', 'https://api.example.com/users');
 */
async function request<T>(
  method: HttpMethod,
  url: string,
  data?: any,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  // Implementación
}
```

### Manejo de Errores

- Errores explícitos con mensajes descriptivos
- Clases de error específicas según el dominio
- Propagación consistente (no mezclar excepciones y códigos de retorno)

### Testing

- Pruebas unitarias para cada función pública
- Pruebas de integración para flujos completos
- Mocks y fixtures compartidos en carpetas dedicadas

## Seguridad

La seguridad es una prioridad en HttpLazy. Aquí hay algunas consideraciones importantes y buenas prácticas:

### Consideraciones de Seguridad

#### Protección de tokens y datos sensibles

HttpLazy implementa protección para los tokens de autenticación:

```javascript
// Redacción automática de tokens en logs
http.initialize({
  baseUrl: "https://api.example.com",
  logging: {
    level: "info",
    redactSensitiveData: true,
  },
});
```

#### Almacenamiento Seguro de Tokens

HttpLazy ofrece opciones para el almacenamiento de tokens:

```javascript
http.configureAuth({
  tokenStorage: "localStorage", // Opciones: 'localStorage', 'sessionStorage', 'cookie', 'memory'
  tokenKey: "access_token",
  refreshTokenKey: "refresh_token",
});
```

### Vulnerabilidades Comunes a Evitar

1. **Inyección (Injection)**: Validar siempre los datos de entrada
2. **Exposición de datos sensibles**: No incluir tokens o claves en URLs
3. **XSS (Cross-Site Scripting)**: Sanitizar datos y utilizar cabeceras de seguridad
4. **Configuración insegura**: No deshabilitar la verificación SSL, incluso en desarrollo

## Recursos Adicionales

- **GitHub**: [github.com/mauroociappinaph/lazyhttp-libreria](https://github.com/mauroociappinaph/lazyhttp-libreria)
- **NPM**: [npmjs.com/package/httplazy](https://npmjs.com/package/httplazy)
- **Ejemplos**: Consulta la carpeta `/examples` para ver implementaciones completas

---

Esta documentación cubre las características principales de HttpLazy. Para casos de uso específicos o soporte, consulta el repositorio de GitHub o abre un issue si encuentras algún problema.

![HttpLazy Logo](documentacion/logotipo%20empresarial%20empresa%20de%20envíos%20y%20entregas%20minimalista%20con%20letra%20color%20azul%20rojo%20blanco.png)

# HttpLazy Documentation

[![npm version](https://img.shields.io/npm/v/httplazy)](https://www.npmjs.com/package/httplazy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-blue)](https://www.typescriptlang.org/)

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Client/Server Architecture](#clientserver-architecture)
  - [Environment-based Imports](#environment-based-imports)
  - [Feature Comparison](#feature-comparison)
- [Basic Usage](#basic-usage)
  - [HTTP Methods](#http-methods)
  - [Initial Configuration](#initial-configuration)
- [API Reference](#api-reference)
  - [Basic Methods](#basic-methods)
  - [Request Options](#request-options)
  - [Response](#response)
- [Advanced Features](#advanced-features)
  - [Authentication](#authentication)
  - [Cache](#cache)
  - [Interceptors](#interceptors)
  - [Metrics and Activity](#metrics-and-activity)
  - [Streaming (Server)](#streaming-server)
  - [Proxies (Server)](#proxies-server)
- [Error Handling](#error-handling)
  - [Common Error Types](#common-error-types)
  - [Network Error Handling](#network-error-handling)
  - [Custom Errors](#custom-errors)
- [Using with Next.js](#using-with-nextjs)
  - [In Client Components](#in-client-components)
  - [In API Routes](#in-api-routes)
  - [In Server Actions](#in-server-actions)
- [Best Practices](#best-practices)
  - [Code Organization](#code-organization)
  - [Usage Patterns](#usage-patterns)
  - [Optimization](#optimization)
- [Troubleshooting](#troubleshooting)
  - [CORS Errors](#cors-errors)
  - [Missing Modules in Next.js](#missing-modules-in-nextjs)
  - [TypeScript Errors](#typescript-errors)
- [Architecture Diagrams](#architecture-diagrams)
- [Contribution Guide](#contribution-guide)
- [Specific Use Cases](#specific-use-cases)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [Migration Guide](#migration-guide)
- [Performance](#performance)
- [Code Conventions](#code-conventions)
- [Security](#security)
- [Internationalization](#internationalization)
- [Additional Resources](#additional-resources)

## Overview

**HttpLazy** is a modern and flexible HTTP library designed to simplify HTTP requests in JavaScript/TypeScript applications, both in browser environments and on the server (Node.js). Its modular architecture allows it to be used in any framework, with special support for universal (isomorphic) applications like Next.js, Remix, or similar.

The library offers advanced features while maintaining an intuitive API:

- **Unified interface**: Consistent API for all HTTP operations
- **Client/server architecture**: Clear separation between browser code and Node.js
- **Automatic optimization**: Environment detection to use the appropriate implementation
- **Advanced features**: Error handling, cache, authentication, interceptors, etc.

## Installation

```bash
# Using npm
npm install httplazy

# Using yarn
yarn add httplazy

# Using pnpm
pnpm add httplazy
```

## Client/Server Architecture

Version 1.7.0+ of HttpLazy implements a dual architecture that separates browser-compatible code from Node.js-exclusive code:

```
httplazy/
├── client/   # Browser-safe code
├── server/   # Full capabilities code (Node.js)
└── common/   # Shared code between environments
```

### Environment-based Imports

```javascript
// Automatic detection (recommended)
import { http } from "httplazy";

// Specifically for browser
import { http } from "httplazy/client";

// Specifically for Node.js
import { http } from "httplazy/server";
```

### Feature Comparison

| Feature            | Client (Browser) | Server (Node.js) |
| ------------------ | ---------------- | ---------------- |
| Basic HTTP         | ✅               | ✅               |
| Authentication     | ✅               | ✅               |
| Interceptors       | ✅               | ✅               |
| Basic Cache        | ✅               | ✅               |
| Error handling     | ✅               | ✅               |
| HTTP/SOCKS Proxies | ❌               | ✅               |
| Advanced Streaming | ❌               | ✅               |
| SOA Support        | ❌               | ✅               |
| Advanced Metrics   | ✅ (limited)     | ✅ (complete)    |

## Basic Usage

### HTTP Methods

```javascript
import { http } from "httplazy";

// GET request
const { data, error } = await http.get("https://api.example.com/users");
if (error) {
  console.error("Error:", error.message);
} else {
  console.log("Users:", data);
}

// POST request with data
const response = await http.post("https://api.example.com/users", {
  name: "John Smith",
  email: "john@example.com",
});

// Request with query parameters
const searchResponse = await http.get("https://api.example.com/search", {
  params: {
    q: "javascript",
    page: 1,
    limit: 20,
  },
});

// Get resource by ID
const user = await http.getById("https://api.example.com/users", "123");

// Update resource (PUT)
await http.put("https://api.example.com/users/123", {
  name: "John Anderson",
});

// Partial update (PATCH)
await http.patch("https://api.example.com/users/123", {
  status: "active",
});

// Delete resource
await http.del("https://api.example.com/users/123");
```

### Initial Configuration

```javascript
// Global configuration
http.initialize({
  baseUrl: "https://api.example.com",
  defaultHeaders: {
    "Content-Type": "application/json",
    "Accept-Language": "en",
  },
  timeout: 10000, // 10 seconds
  retries: 2, // Retry failed requests
});
```

## API Reference

### Basic Methods

| Method                                       | Description                            | Parameters                                                                                                                         |
| -------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `http.request(method, url, data?, options?)` | Generic method for any type of request | `method`: Request type (GET, POST, etc)<br>`url`: Endpoint URL<br>`data`: Data to send (optional)<br>`options`: Additional options |
| `http.get(url, options?)`                    | GET request                            | `url`: Endpoint URL<br>`options`: Additional options                                                                               |
| `http.getAll(url, options?)`                 | GET request optimized for lists        | `url`: Endpoint URL<br>`options`: Additional options                                                                               |
| `http.getById(url, id, options?)`            | GET request for a specific resource    | `url`: Base URL<br>`id`: Resource identifier<br>`options`: Additional options                                                      |
| `http.post(url, data?, options?)`            | POST request                           | `url`: Endpoint URL<br>`data`: Data to send<br>`options`: Additional options                                                       |
| `http.put(url, data?, options?)`             | PUT request                            | `url`: Endpoint URL<br>`data`: Complete data to send<br>`options`: Additional options                                              |
| `http.patch(url, data?, options?)`           | PATCH request                          | `url`: Endpoint URL<br>`data`: Partial data to send<br>`options`: Additional options                                               |
| `http.del(url, options?)`                    | DELETE request                         | `url`: Endpoint URL<br>`options`: Additional options                                                                               |

### Request Options

```typescript
interface RequestOptions {
  headers?: Record<string, string>; // HTTP headers
  params?: Record<string, any>; // Query parameters (query string)
  timeout?: number; // Maximum time in ms
  retries?: number; // Number of retries
  cache?: boolean | number; // Enable cache and TTL in seconds
  tags?: string[]; // Tags for cache invalidation
}
```

### Response

```typescript
interface ApiResponse<T = any> {
  data: T; // Response data
  status: number; // HTTP status code
  headers: Record<string, string>; // Response headers
  error?: {
    // Present only in errors
    message: string; // Descriptive message
    code?: string; // Error code
    details?: any; // Additional details
  };
  config?: any; // Configuration used in the request
}
```

## Advanced Features

### Authentication

```javascript
// Authentication configuration
http.configureAuth({
  loginEndpoint: "/auth/login",
  logoutEndpoint: "/auth/logout",
  refreshTokenEndpoint: "/auth/refresh",
  tokenStorage: "localStorage", // 'localStorage', 'sessionStorage', 'cookie', 'memory'
  tokenKey: "access_token",
  refreshTokenKey: "refresh_token",
  userKey: "user_data",
  autoRefresh: true,
  redirectOnUnauthorized: true,
  unauthorizedRedirectUrl: "/login",
});

// Login
const { data, error } = await http.login({
  username: "user@example.com",
  password: "password",
});

// Check authentication status
if (http.isAuthenticated()) {
  // Authenticated user
  const user = http.getAuthenticatedUser();
  console.log("Current user:", user);

  // Get token for manual operations
  const token = http.getAccessToken();
}

// Logout
await http.logout();
```

### Cache

```javascript
// Cache configuration
http.configureCaching({
  enabled: true,
  ttl: 300, // Time to live in seconds
  storage: "localStorage", // 'memory', 'localStorage', 'sessionStorage'
  maxSize: 100, // Maximum number of entries (only 'memory')
  invalidateOnMutation: true, // Invalidate on PUT/POST/DELETE operations
});

// Manual invalidation
http.invalidateCache("/users/*"); // Invalidate using patterns
http.invalidateCacheByTags(["users"]); // Invalidate by tags

// Use cache in specific requests
const { data } = await http.get("/users", {
  cache: true, // Enable cache
  tags: ["users", "list"], // Assign tags
});

// Specify custom TTL
await http.get("/users", { cache: 3600 }); // 1 hour
```

### Interceptors

```javascript
// Request interceptor
http._setupInterceptors((config) => {
  // Modify the request before sending
  config.headers = config.headers || {};
  config.headers["X-Client-Version"] = "1.0.0";

  // Log the request
  console.log("Outgoing request:", config.url);

  return config;
}, "request");

// Response interceptor
http._setupInterceptors((response) => {
  // Modify the response before delivering
  if (response.data && response.data.results) {
    response.data = response.data.results; // Extract data
  }

  return response;
}, "response");
```

### Metrics and Activity

```javascript
// Configure metrics
http.configureMetrics({
  enabled: true,
  trackErrors: true,
  trackPerformance: true,
  trackCache: true,
  sampleRate: 100, // Percentage of requests to measure
});

// Record custom events
http.trackActivity("page_view");
http.trackActivity("search", { query: "term" });

// Get current metrics
const metrics = http.getCurrentMetrics();
console.log("Average response time:", metrics.avgResponseTime);
console.log("Error rate:", metrics.errorRate);
```

### Streaming (Server)

```javascript
// Import from server
import { stream } from "httplazy/server";

// Large file streaming
const fileStream = await stream("https://example.com/large-file.zip", {
  onData: (chunk) => {
    // Process each fragment
    const percent = (bytesReceived / totalBytes) * 100;
    updateProgressBar(percent);
  },
  onComplete: () => {
    console.log("Download completed");
  },
  onError: (err) => {
    console.error("Streaming error:", err);
  },
});

// Basic streaming in client
import { stream } from "httplazy/client";

const textStream = await stream("https://api.example.com/events");
// Process stream with browser APIs
```

### Proxies (Server)

```javascript
// Import from server
import { configureProxy } from "httplazy/server";

// Configure HTTP proxy
configureProxy({
  protocol: "http",
  host: "proxy.company.com",
  port: 8080,
  auth: {
    username: "user",
    password: "pass",
  },
});

// SOCKS proxy
configureProxy({
  protocol: "socks5",
  host: "127.0.0.1",
  port: 9050,
});
```

## Error Handling

HttpLazy provides consistent and predictable error handling:

```javascript
const { data, error, status } = await http.get("/api/users");

if (error) {
  // Handle according to HTTP code
  if (status === 404) {
    console.error("Resource not found");
  } else if (status === 401) {
    console.error("Authentication required");
  } else if (status >= 500) {
    console.error("Server error:", error.message);
  } else {
    console.error(`Error (${status}):`, error.message);
  }

  // Additional details
  if (error.details) {
    console.error("Details:", error.details);
  }
} else {
  // Process successful data
}
```

### Common Error Types

| Code | Type                 | Common causes                      |
| ---- | -------------------- | ---------------------------------- |
| 400  | Bad Request          | Incorrect data, validation failed  |
| 401  | Unauthorized         | Invalid or expired token           |
| 403  | Forbidden            | Insufficient permissions           |
| 404  | Not Found            | Non-existent resource              |
| 422  | Unprocessable Entity | Valid data but logically incorrect |
| 429  | Too Many Requests    | Rate limit exceeded                |
| 500  | Server Error         | Internal server error              |

### Network Error Handling

```javascript
try {
  const response = await http.get("/api/data");

  if (response.error) {
    // HTTP error with server response
    handleApiError(response.error);
  } else {
    processData(response.data);
  }
} catch (err) {
  // Network errors, such as disconnection or timeout
  console.error("Connection error:", err.message);
}
```

### Custom Errors

HttpLazy provides an extensible error handling system that goes beyond standard HTTP codes.

#### HttpLazy-specific error types

The library includes specialized error classes for different situations:

```javascript
// Specific error categories
import {
  HttpError, // Base error for all HTTP errors
  NetworkError, // Connection, timeout, DNS errors
  AuthenticationError, // Authentication-related errors
  CacheError, // Cache system errors
  ValidationError, // Data validation errors
  RateLimitError, // Rate limit exceeded errors
} from "httplazy/errors";

// Check error type
if (error instanceof AuthenticationError) {
  // Handle authentication error
  redirectToLogin();
} else if (error instanceof NetworkError) {
  // Handle network error
  showOfflineMessage();
}
```

#### Custom error codes

In addition to standard HTTP codes, HttpLazy defines internal codes for specific situations:

```javascript
// Example of custom code handling
const { error } = await http.get("/api/users");

if (error) {
  switch (error.code) {
    case "AUTH_EXPIRED":
      await http.refreshToken();
      // Retry request
      break;
    case "CACHE_MISS":
      // Get from origin
      break;
    case "RATE_LIMITED":
      // Implement exponential backoff
      break;
    case "VALIDATION_FAILED":
      // Show validation errors
      showValidationErrors(error.details);
      break;
    default:
      // Generic handling
      showErrorMessage(error.message);
  }
}
```

| Error Code          | Description                               | Recommended Action            |
| ------------------- | ----------------------------------------- | ----------------------------- |
| `AUTH_EXPIRED`      | Authentication token expired              | Refresh token and retry       |
| `AUTH_INVALID`      | Invalid token or credentials              | Redirect to login             |
| `CACHE_MISS`        | Not found in cache                        | Get from origin               |
| `RATE_LIMITED`      | Rate limit exceeded                       | Implement exponential backoff |
| `NETWORK_OFFLINE`   | No Internet connection                    | Show offline mode             |
| `TIMEOUT_EXCEEDED`  | Timeout expired                           | Retry or increase timeout     |
| `VALIDATION_FAILED` | Sent data fails validation                | Show specific errors to user  |
| `RESOURCE_CONFLICT` | Conflict modifying resource (concurrency) | Reload and show differences   |

## Using with Next.js

HttpLazy is optimized for Next.js applications, automatically managing the difference between client and server code.

### In Client Components

```jsx
"use client";
import { useState, useEffect } from "react";
import { http } from "httplazy/client";

export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await http.getById("/api/users", userId);
      if (!error) {
        setUser(data);
      }
      setLoading(false);
    }

    loadUser();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### In API Routes

```javascript
// app/api/products/route.js
import { http } from "httplazy/server";

export async function GET(request) {
  // Get products from an external service
  const response = await http.get("https://external-api.com/products");

  if (response.error) {
    return Response.json(
      { error: response.error.message },
      { status: response.status }
    );
  }

  return Response.json(response.data);
}
```

### In Server Actions

```javascript
// app/actions.js
"use server";
import { http } from "httplazy/server";

export async function processPayment(formData) {
  const paymentData = {
    amount: formData.get("amount"),
    cardNumber: formData.get("cardNumber"),
    // other fields...
  };

  // Use proxy for payment API
  configureProxy({
    protocol: "https",
    host: "secure-proxy.company.com",
    port: 443,
  });

  const response = await http.post(
    "https://payment-gateway.com/process",
    paymentData
  );

  return response.data;
}
```

## Best Practices

### Code Organization

Create a centralized service for your APIs:

```javascript
// lib/api.js
import { http } from "httplazy/client";

http.initialize({
  baseUrl: "/api",
  // other configurations...
});

export const userService = {
  getAll: () => http.get("/users"),
  getById: (id) => http.getById("/users", id),
  create: (data) => http.post("/users", data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: (id) => http.del(`/users/${id}`),
};

export const authService = {
  login: (credentials) => http.login(credentials),
  logout: () => http.logout(),
  getCurrentUser: () => http.getAuthenticatedUser(),
};

// export other services...
```

### Usage Patterns

1. **Response destructuring**

   ```javascript
   const { data, error, status } = await userService.getAll();
   ```

2. **Parallel promise handling**

   ```javascript
   const [users, products] = await Promise.all([
     userService.getAll(),
     productService.getAll(),
   ]);
   ```

3. **Loading patterns with React**

   ```javascript
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
     let isMounted = true;

     async function fetchData() {
       try {
         setLoading(true);
         const response = await userService.getAll();

         if (isMounted) {
           if (response.error) {
             setError(response.error);
             setData(null);
           } else {
             setData(response.data);
             setError(null);
           }
         }
       } catch (err) {
         if (isMounted) {
           setError({ message: "Connection error" });
           setData(null);
         }
       } finally {
         if (isMounted) {
           setLoading(false);
         }
       }
     }

     fetchData();

     return () => {
       isMounted = false;
     };
   }, []);
   ```

### Optimization

1. **Proper cache usage**

   ```javascript
   // Data that changes infrequently
   const config = await http.get("/api/config", { cache: 3600 }); // 1h

   // Data that changes frequently
   const notifications = await http.get("/api/notifications", { cache: 60 }); // 1min
   ```

2. **Selective invalidation**

   ```javascript
   // After updating a user
   await userService.update(id, userData);
   http.invalidateCacheByTags(["users"]);
   ```

3. **Preloading critical data**
   ```javascript
   // Preload common data during initialization
   export async function initializeApp() {
     await Promise.all([
       http.get("/api/config", { cache: true }),
       http.get("/api/common-data", { cache: true }),
     ]);
   }
   ```

## Troubleshooting

### CORS Errors

If you experience CORS errors in development:

```javascript
// Configuration for local development
if (process.env.NODE_ENV === "development") {
  http.initialize({
    // other configurations...
    defaultHeaders: {
      "Content-Type": "application/json",
      // Add CORS headers if needed
    },
  });
}
```

### Missing Modules in Next.js

If you encounter errors like "Can't resolve 'net'" in Next.js, make sure to import correctly:

```javascript
// ❌ Incorrect
import { http } from "httplazy";

// ✅ Correct for client components
import { http } from "httplazy/client";
```

### TypeScript Errors

If you encounter TypeScript errors related to types:

```typescript
// Import types explicitly
import { http } from "httplazy/client";
import type { ApiResponse, RequestOptions } from "httplazy/client";

async function fetchData(): Promise<ApiResponse<UserType[]>> {
  return http.get<UserType[]>("/api/users");
}
```

## Architecture Diagrams

### Client/Server Architecture

```
┌─────────────────────────┐      ┌─────────────────────────┐
│                         │      │                         │
│   CLIENT (Browser)      │      │   SERVER (Node.js)      │
│                         │      │                         │
│  ┌─────────────────┐    │      │  ┌─────────────────┐    │
│  │                 │    │      │  │                 │    │
│  │  Core API       │    │      │  │  Core API       │    │
│  │  - request()    │    │      │  │  - request()    │    │
│  │  - get(), post()│    │      │  │  - get(), post()│    │
│  │  - auth, cache  │    │      │  │  - auth, cache  │    │
│  │                 │    │      │  │                 │    │
│  └────────┬────────┘    │      │  └────────┬────────┘    │
│           │             │      │           │             │
│  ┌────────▼────────┐    │      │  ┌────────▼────────┐    │
│  │                 │    │      │  │                 │    │
│  │  Browser        │    │      │  │  Node.js        │    │
│  │  Implementation │    │      │  │  Implementation │    │
│  │  (fetch/XHR)    │    │      │  │  (http/https)   │    │
│  │                 │    │      │  │                 │    │
│  └─────────────────┘    │      │  └─────────────────┘    │
│                         │      │           │             │
└─────────────────────────┘      │  ┌────────▼────────┐    │
                                 │  │                 │    │
                                 │  │  Extensions     │    │
                                 │  │  - Proxies      │    │
                                 │  │  - Streaming    │    │
                                 │  │  - SOA          │    │
                                 │  │                 │    │
                                 │  └─────────────────┘    │
                                 │                         │
                                 └─────────────────────────┘
```

### HTTP Request Flow

```
┌──────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐    ┌─────────┐
│          │    │            │    │            │    │            │    │         │
│ http.get │--->│ Request    │--->│ Cache      │--->│ HTTP       │--->│ API     │
│ Call     │    │ Interceptor│    │ Present?   │    │ Request    │    │ Server  │
│          │    │            │    │            │    │            │    │         │
└──────────┘    └────────────┘    └─────┬──────┘    └─────┬──────┘    └────┬────┘
                                        │                 │                │
                                        │ Yes             │                │
                                        ▼                 │                │
                                 ┌────────────┐          │                │
                                 │            │          │                │
                                 │ Cached     │          │                │
                                 │ Data       │          │                │
                                 │            │          │                │
                                 └──────┬─────┘          │                │
                                        │                │                │
                                        ▼                │                │
┌──────────┐    ┌────────────┐    ┌────▼──────┐    ┌─────▼──────┐    ┌────▼────┐
│          │    │            │    │           │    │            │    │         │
│ Client   │<---│ Response   │<---│ Process   │<---│ HTTP       │<---│ API     │
│ Response │    │ Interceptor│    │ Errors    │    │ Response   │    │ Data    │
│          │    │            │    │           │    │            │    │         │
└──────────┘    └────────────┘    └───────────┘    └────────────┘    └─────────┘
```

## Contribution Guide

We welcome contributions to improve HttpLazy. You can contribute in several ways:

### How to Contribute

1. **Fork the repository**: Create your own fork of the project from GitHub
2. **Clone**: `git clone https://github.com/your-username/lazyhttp-library.git`
3. **Install**: `npm install` to install dependencies
4. **Create a branch**: `git checkout -b feature-name`
5. **Develop**: Implement your feature or fix
6. **Test**: Run `npm test` to ensure everything works
7. **Build**: `npm run build` to verify the build
8. **Commit**: `git commit -m "feat: description of your change"`
9. **Push**: `git push origin feature-name`
10. **Create a Pull Request**: Open a PR on GitHub with a detailed description

### Style Guidelines

- We follow standard TypeScript conventions
- We use ESLint with the project configuration
- All changes should include tests
- Document any new API or changes to existing API

### Review Process

- Each PR is reviewed by at least one project maintainer
- CI checks must pass (tests, linting, typing)
- Code must follow the [Code Conventions](#code-conventions)

## Comparison with Alternatives

| Feature                | HttpLazy           | Axios                | Fetch API                    |
| ---------------------- | ------------------ | -------------------- | ---------------------------- |
| **Size (approx)**      | ~12KB min+gzip     | ~14KB min+gzip       | Native                       |
| **Universal support**  | ✅ (Client/Server) | ✅                   | ✅ (Limited in Node)         |
| **TypeScript**         | ✅ Complete        | ✅ Complete          | Limited                      |
| **Interceptors**       | ✅                 | ✅                   | ❌ (Requires implementation) |
| **Integrated cache**   | ✅                 | ❌                   | ❌                           |
| **Cancellation**       | ✅                 | ✅                   | ✅                           |
| **Authentication**     | ✅ Integrated      | ❌ (Manual)          | ❌ (Manual)                  |
| **Streaming support**  | ✅                 | ✅ (Basic)           | ✅                           |
| **Proxy support**      | ✅ (Server)        | ✅                   | ❌                           |
| **Automatic retries**  | ✅                 | ❌ (Requires config) | ❌                           |
| **Integrated metrics** | ✅                 | ❌                   | ❌                           |

### Why choose HttpLazy?

- **Uniformity**: A single API for client and server
- **Automatic optimization**: Efficient use according to environment
- **All-in-one**: Doesn't require multiple libraries for cache, auth, etc.
- **Efficient tree-shaking**: Only includes what you use
- **TypeScript focus**: Complete typing for better DX
- **Modular architecture**: Easy to extend

## Security

Security is a priority in HttpLazy. Here are some important considerations and best practices:

### Security Considerations

#### Protection of tokens and sensitive data

HttpLazy implements protection for authentication tokens:

```javascript
// Automatic redaction of tokens in logs
http.initialize({
  baseUrl: "https://api.example.com",
  logging: {
    level: "info",
    redactSensitiveData: true,
  },
});
```

#### Secure Token Storage

HttpLazy offers options for token storage:

```javascript
http.configureAuth({
  tokenStorage: "localStorage", // Options: 'localStorage', 'sessionStorage', 'cookie', 'memory'
  tokenKey: "access_token",
  refreshTokenKey: "refresh_token",
});
```

### Common Vulnerabilities to Avoid

1. **Injection**: Always validate input data
2. **Sensitive data exposure**: Don't include tokens or keys in URLs
3. **XSS (Cross-Site Scripting)**: Sanitize data and use security headers
4. **Insecure configuration**: Don't disable SSL verification, even in development

## Additional Resources

- **GitHub**: [github.com/mauroociappinaph/lazyhttp-library](https://github.com/mauroociappinaph/lazyhttp-library)
- **NPM**: [npmjs.com/package/httplazy](https://npmjs.com/package/httplazy)
- **Examples**: Check the `/examples` folder for complete implementations

---

This documentation covers the main features of HttpLazy. For specific use cases or support, check the GitHub repository or open an issue if you find a problem.
