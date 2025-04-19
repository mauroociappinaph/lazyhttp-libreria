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
