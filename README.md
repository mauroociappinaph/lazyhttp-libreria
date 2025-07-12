![HttpLazy Logo](documentacion/logotipo%20empresarial%20empresa%20de%20envíos%20y%20entregas%20minimalista%20con%20letra%20color%20azul%20rojo%20blanco.png)

# HttpLazy

[![npm version](https://img.shields.io/npm/v/httplazy)](https://www.npmjs.com/package/httplazy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-blue)](https://www.typescriptlang.org/)
![Coverage](https://img.shields.io/badge/coverage-95%25-brightgreen)
![Bundle size](https://img.shields.io/bundlephobia/minzip/httplazy)
[![Open Issues](https://img.shields.io/github/issues/mauroociappina/lazyhttp-libreria)](https://github.com/mauroociappina/lazyhttp-libreria/issues)
[![Pull Requests](https://img.shields.io/github/issues-pr/mauroociappina/lazyhttp-libreria)](https://github.com/mauroociappina/lazyhttp-libreria/pulls)

---

# 🇬🇧 English

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
import { http } from 'httplazy';

// Specifically for browser
import { http } from 'httplazy/client';

// Specifically for Node.js
import { http } from 'httplazy/server';
```

---

## 🚦 Visual Comparison

| Feature                | ![HTTPLazy](https://img.shields.io/badge/-HTTPLazy-blue) | ![Axios](https://img.shields.io/badge/-Axios-green) | ![Fetch API](https://img.shields.io/badge/-Fetch%20API-yellow) |
| ---------------------- | :------------------------------------------------------: | :-------------------------------------------------: | :------------------------------------------------------------: |
| **Size (min+gzip)**    |                         🟦 ~12KB                         |                      🟩 ~14KB                       |                           🟨 Native                            |
| **Universal support**  |                     ✅ Client/Server                     |                         ✅                          |                        ⚠️ Limited Node                         |
| **TypeScript**         |                         ✅ Full                          |                       ✅ Full                       |                           ⚠️ Limited                           |
| **Interceptors**       |                            ✅                            |                         ✅                          |                               ❌                               |
| **Integrated cache**   |                            ✅                            |                         ❌                          |                               ❌                               |
| **Cancellation**       |                            ✅                            |                         ✅                          |                               ✅                               |
| **Authentication**     |                      ✅ Integrated                       |                     ❌ (Manual)                     |                          ❌ (Manual)                           |
| **Streaming**          |                            ✅                            |                     ✅ (Basic)                      |                               ✅                               |
| **Proxy**              |                       ✅ (Server)                        |                         ✅                          |                               ❌                               |
| **Automatic retries**  |                     ✅ (Exponential)                     |                         ❌                          |                               ❌                               |
| **Integrated metrics** |                            ✅                            |                         ❌                          |                               ❌                               |
| **Public benchmarks**  |                            ❌                            |                         ❌                          |                               ❌                               |

> 🟦 = Best option for modern and universal projects

## ¿Por qué elegir HTTPLazy frente a Axios o Fetch?

HTTPLazy es una alternativa moderna, minimalista y eficiente para realizar peticiones HTTP en JavaScript/TypeScript, diseñada para superar las limitaciones y el exceso de configuración de otras librerías populares. Aquí te mostramos por qué destaca:

### 🚀 Rendimiento y Ligereza

- **Tamaño reducido:** HTTPLazy pesa ~12KB min+gzip, siendo más ligera que Axios (~14KB) y sin dependencias pesadas.
- **Optimización automática:** Elige internamente la mejor implementación según el entorno (fetch en navegador, http/https en Node.js), sin que tengas que preocuparte por nada.
- **Tree-shaking real:** Solo se importa lo que usas, ideal para bundles modernos.

### 🧩 Sintaxis Intuitiva y Sin Boilerplate

- **API simple y coherente:** Olvídate de configurar instancias o escribir repetidamente try/catch. Todas las respuestas siguen el patrón `{ data, error, status }`.
- **Menos código repetido:** Métodos como `getAll`, `getById`, `post`, `put`, `patch`, `del` y helpers para concurrencia (`all`) y tipado seguro.
- **Tipado TypeScript completo:** Aprovecha autocompletado y validación de tipos en todas las operaciones.

### ✨ Funcionalidades Únicas e Integradas

- **Cancelación nativa:** Soporte para `AbortController` en todos los entornos.
- **Retries automáticos:** Reintentos con backoff exponencial configurables por petición o globalmente.
- **Caché inteligente:** Integración de caché en memoria, localStorage o sessionStorage, con TTL y etiquetas para invalidación.
- **Interceptores composables:** Añade lógica antes/después de cada petición (autenticación, logging, métricas, etc.) de forma sencilla.
- **Manejo de errores avanzado:** Clases de error especializadas y helpers para integración con React Query, SWR, etc.
- **Múltiples clientes:** Crea tantas instancias de cliente como necesites, cada una con su propia configuración y middlewares.

### 🌐 Compatibilidad Universal

- **Funciona en Node.js y navegadores:** Arquitectura dual, sin hacks ni polyfills.
- **Soporte para frameworks modernos:** Optimizada para Next.js, Remix, y aplicaciones isomórficas.
- **Streaming, proxies y más:** Funcionalidades avanzadas disponibles en Node.js sin sacrificar compatibilidad en el navegador.

---

### Ejemplo comparativo

**HTTPLazy:**

```typescript
const { data, error } = await http.getAll('/api/users');
if (error) showError(error.message);
```

**Axios:**

```typescript
try {
  const { data } = await axios.get('/api/users');
} catch (error) {
  showError(error.response?.data?.message || error.message);
}
```

**Fetch:**

```typescript
const resp = await fetch('/api/users');
if (!resp.ok) {
  const error = await resp.json();
  showError(error.message);
}
const data = await resp.json();
```

---

### Resumen

- **HTTPLazy** es ideal si buscas una librería HTTP minimalista, rápida, con sintaxis moderna y funcionalidades avanzadas integradas, sin sacrificar compatibilidad ni escalabilidad.
- Es la opción perfecta para proyectos que requieren rendimiento, claridad y facilidad de mantenimiento, tanto en frontend como en backend.

---

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
    - [Logging Personalizado](#logging-personalizado)
  - [Streaming (Servidor)](#streaming-servidor)
  - [Servidor HTTP Minimalista (Node.js)](#servidor-http-minimalista-nodejs)
  - [Proxies (Servidor)](#proxies-servidor)
  - [Retry Automático con Backoff Exponencial](#retry-automático-con-backoff-exponencial)
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
  - [Tests](#tests)
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
- [Subida de archivos optimizada (upload)](#subida-de-archivos-optimizada-upload)
- [Compatibilidad con librerías que esperan promesas rechazadas](#compatibilidad-con-librerías-que-esperan-promesas-rechazadas)
- [Clientes HTTP múltiples](#clientes-http-múltiples)

---

## 🍳 Recetas y Ejemplos de Uso Real

### Autenticación JWT/OAuth2

```typescript
import { http } from 'httplazy';
http.configureAuth({ type: 'jwt', token: 'mi-token' });
const { data } = await http.getAll('/usuarios');
```

### Subida de Archivos

```typescript
const formData = new FormData();
formData.append('file', archivo);
const { data, error } = await http.post('/api/upload', formData);
```

### Uso en Next.js API Routes

```typescript
import { http } from 'httplazy/server';
export async function GET(request) {
  const response = await http.getAll('https://api.com/productos');
  return Response.json(response.data);
}
```

### Integración con React Query

```typescript
import { useQuery } from 'react-query';
import { http } from 'httplazy';
const { data, error } = useQuery(['usuarios'], () => http.getAll('/usuarios').then(r => r.data));
```

## 🏆 Buenas Prácticas

- Usa instancias separadas para cada API o contexto.
- Centraliza la lógica HTTP en servicios por dominio.
- Maneja errores siempre con la propiedad `error`.
- Usa caché para datos poco cambiantes.
- Aplica interceptores para logging, métricas y autenticación.
- Documenta tus servicios y helpers.
- Usa tipado explícito en todas las respuestas.

## Preguntas Frecuentes (FAQ)

### ¿HTTPLazy soporta middlewares personalizados (interceptores), encadenables y asíncronos?

Sí. HTTPLazy implementa el concepto de **interceptores** (request, response y error), que funcionan como middlewares. Puedes registrar varios interceptores por instancia, son composables y pueden ser asíncronos (`Promise`). Esto permite ejecutar lógica antes o después de cada petición, como autenticación, logging, métricas, etc.

Ejemplo:

```typescript
client.useInterceptor(new MiInterceptorPersonalizado());
client.useInterceptor(new OtroInterceptor());
```

---

### ¿Responde automáticamente con JSON si el handler retorna un objeto?

Sí, cuando usas los métodos estándar (`get`, `post`, etc.), si el servidor responde con JSON, HTTPLazy lo parsea automáticamente y lo expone como objeto. El header `Content-Type: application/json` se envía por defecto en las peticiones. Si implementas un servidor, asegúrate de que tu framework también responda correctamente con JSON.

---

### ¿HTTPLazy parsea automáticamente los parámetros de consulta (query) y el cuerpo (body) para JSON, x-www-form-urlencoded y otros formatos?

- **Query:** Los parámetros (`params`) se agregan automáticamente a la URL.
- **Body:** Por defecto, el body se serializa a JSON. Para `form-data` (archivos) hay helpers (`upload`). Para `x-www-form-urlencoded` debes serializarlo manualmente y establecer el header adecuado.

---

### ¿HTTPLazy es compatible con la API fetch nativa? ¿Acepta o expone objetos Request y Response como en fetch?

No es 100% compatible. HTTPLazy usa Axios internamente, no la API fetch nativa. No acepta ni retorna objetos `Request`/`Response` nativos, pero la API es muy similar (métodos, headers, body, etc.). Puedes usar `AbortController` para cancelar peticiones.

---

### ¿HTTPLazy tiene benchmarks públicos? ¿Está optimizada para alta concurrencia o entornos serverless?

- **Optimización:** HTTPLazy es ligera (~12KB min+gzip), soporta caché, reintentos automáticos, streaming y métricas integradas. Es compatible con entornos serverless y de alta concurrencia (Next.js, Vercel, AWS Lambda, etc.).
- **Benchmarks públicos:** Actualmente no hay benchmarks publicados en la documentación.

---

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

> ⚠️ **Importante:**
>
> A partir de la versión 2.x, la forma recomendada de usar HttpLazy es **instanciando manualmente el cliente**. La importación directa de `http` está deprecada y puede no estar disponible en futuras versiones.
>
> **Nueva forma recomendada:**
>
> ```js
> import { HttpCore } from 'httplazy';
> const http = new HttpCore.HttpCore();
> // Ahora puedes usar http.get, http.post, etc.
> ```
>
> Esto permite crear múltiples clientes con configuraciones independientes y mejora la escalabilidad y testabilidad del código.
>
> Si encuentras ejemplos con `import { http } from 'httplazy'`, actualízalos siguiendo este patrón.

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
import { http } from 'httplazy';

// Petición GET
const { data, error } = await http.getAll('https://api.example.com/users');
if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Usuarios:', data);
}

// Petición POST con datos
const response = await http.post('https://api.example.com/users', {
  name: 'Ana García',
  email: 'ana@example.com',
});

// Petición con parámetros de consulta
const searchResponse = await http.getAll('https://api.example.com/search', {
  params: {
    q: 'javascript',
    page: 1,
    limit: 20,
  },
});

// Obtener recurso por ID
const user = await http.getById('https://api.example.com/users', '123');

// Actualizar recurso (PUT)
await http.put('https://api.example.com/users/123', {
  name: 'Ana López',
});

// Actualización parcial (PATCH)
await http.patch('https://api.example.com/users/123', {
  status: 'active',
});

// Eliminar recurso
await http.del('https://api.example.com/users/123');
```

---

#### Tipado de respuestas y acceso seguro a propiedades

Cuando la respuesta de tu API tiene una estructura conocida (por ejemplo, un login que retorna un token), puedes tipar la respuesta para que TypeScript reconozca correctamente las propiedades y evitar errores como:

> La propiedad 'token' no existe en el tipo '{}'.ts(2339)

**Ejemplo recomendado:**

```typescript
// Define el tipo esperado de la respuesta de login
interface LoginResponse {
  token: string;
}

// Uso correcto con tipado genérico
const { data } = await http.post<LoginResponse>('https://fakestoreapi.com/auth/login', {
  username: 'user',
  password: 'pass',
});

const token = data?.token; // TypeScript reconoce 'token'

// Usar el token en la siguiente petición
await http.get('https://fakestoreapi.com/products/1', {
  headers: { Authorization: `Bearer ${token}` },
});
```

**También funciona con promesas encadenadas:**

```typescript
http
  .post<LoginResponse>('https://fakestoreapi.com/auth/login', {
    username: 'user',
    password: 'pass',
  })
  .then(({ data }) => {
    const token = data?.token;
    return http.get('https://fakestoreapi.com/products/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
  });
```

> **Nota:** Todos los métodos principales (`get`, `post`, etc.) de HttpLazy aceptan un tipo genérico para que puedas tipar la respuesta según tu API y aprovechar el autocompletado y validación de TypeScript.

### Solicitudes Concurrentes

HttpLazy permite realizar múltiples solicitudes GET en paralelo de forma sencilla usando el método `all`. Este método recibe un array de URLs y devuelve un array con los datos de cada respuesta (omitiendo las que sean null).

```javascript
import { http } from 'httplazy';

const urls = [
  'https://fakestoreapi.com/products/1',
  'https://fakestoreapi.com/products/2',
  'https://fakestoreapi.com/products/3',
];

const productos = await http.all(urls);
console.log(productos); // [producto1, producto2, producto3]
```

- Si alguna respuesta no tiene datos (`data === null`), se omite del array final.
- Puedes pasar opciones adicionales (headers, params, etc) como segundo argumento.

### Configuración Inicial

```javascript
// Configuración global
http.initialize({
  baseUrl: 'https://api.example.com',
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept-Language': 'es',
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

#### Advanced Response Metadata: `fullMeta`

> **New in v2.x**: All HTTP methods now return an optional `fullMeta` property in the response object, providing advanced metadata for debugging, monitoring, and replaying requests.

**What is `fullMeta`?**

The `fullMeta` property contains detailed information about the HTTP transaction, including:

- `requestHeaders`: All headers sent with the request (object)
- `responseHeaders`: All headers received in the response (object)
- `timing`: Timing metrics (e.g., `requestStart`, `responseEnd`) for performance analysis
- `rawBody`: The raw, unparsed response body (string or Buffer)
- `errorDetails`: Detailed error information (if any), including stack trace and server error body

**Example:**

```typescript
const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
console.log(response.fullMeta);
/*
{
  requestHeaders: { 'Content-Type': 'application/json' },
  responseHeaders: { 'Content-Type': 'application/json; charset=utf-8', ... },
  timing: { requestStart: 1680000000000, responseEnd: 1680000000123 },
  rawBody: '{ "userId": 1, "id": 1, ... }',
  errorDetails: undefined
}
*/
```

**How to use it:**

- Access `response.fullMeta` after any request (`get`, `post`, `put`, etc.).
- Use the metadata for debugging, logging, or generating cURL commands.
- On errors, check `fullMeta.errorDetails` for in-depth diagnostics.

> **Note:** The `rawBody` field in `fullMeta` can be either a `string` (for text responses or in browser environments) or a `Buffer` (for binary responses in Node.js). To safely handle it, you can use:
>
> ```ts
> const asString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8');
> ```

> **Note:** The presence and completeness of some fields may depend on the environment (browser/Node.js) and the HTTP adapter used.

## Funcionalidades Avanzadas

### Autenticación

```javascript
// Configuración de autenticación
http.configureAuth({
  loginEndpoint: '/auth/login',
  logoutEndpoint: '/auth/logout',
  refreshTokenEndpoint: '/auth/refresh',
  tokenStorage: 'localStorage', // 'localStorage', 'sessionStorage', 'cookie', 'memory'
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user_data',
  autoRefresh: true,
  redirectOnUnauthorized: true,
  unauthorizedRedirectUrl: '/login',
});

// Iniciar sesión
const { data, error } = await http.login({
  username: 'usuario@ejemplo.com',
  password: 'contraseña',
});

// Verificar estado de autenticación
if (http.isAuthenticated()) {
  // Usuario autenticado
  const user = http.getAuthenticatedUser();
  console.log('Usuario actual:', user);

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
  storage: 'localStorage', // 'memory', 'localStorage', 'sessionStorage'
  maxSize: 100, // Máximo número de entradas (solo 'memory')
  invalidateOnMutation: true, // Invalidar en operaciones PUT/POST/DELETE
});

// Invalidación manual
http.invalidateCache('/users/*'); // Invalidar usando patrones
http.invalidateCacheByTags(['users']); // Invalidar por etiquetas

// Usar caché en peticiones específicas
const { data } = await http.getAll('users', {
  cache: true, // Habilitar caché
  tags: ['users', 'list'], // Asignar etiquetas
});

// Especificar TTL personalizado
await http.getAll('users', { cache: 3600 }); // 1 hora
```

### Retry Automático con Backoff Exponencial

HttpLazy incorpora un sistema avanzado de reintentos automáticos para operaciones fallidas, especialmente útil en entornos con conectividad inestable o servicios intermitentes.

```javascript
// Configuración global de retry
http.initialize({
  // ... otras configuraciones ...
  retry: {
    enabled: true, // Activa los reintentos automáticos
    maxRetries: 3, // Número máximo de intentos
    initialDelay: 300, // Tiempo inicial entre intentos (ms)
    backoffFactor: 2, // Factor de crecimiento exponencial
    retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Códigos HTTP a reintentar
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'], // Errores de red a reintentar
  },
});

// Usar retry en una petición específica
const response = await http.getAll('https://api.ejemplo.com/datos', {
  retryOptions: {
    enabled: true, // Activa retry para esta petición
    maxRetries: 5, // Sobrescribe el número máximo de intentos
    initialDelay: 500, // Sobrescribe el tiempo inicial
    backoffFactor: 1.5, // Sobrescribe el factor de crecimiento
  },
});
```

El mecanismo de backoff exponencial incrementa progresivamente el tiempo entre intentos, calculándolo con la fórmula:

```
tiempo_espera = initialDelay * (backoffFactor ^ número_intento)
```

Esta estrategia ayuda a evitar sobrecargas en el servidor y mejora la probabilidad de éxito en condiciones de red adversas. HttpLazy determina automáticamente si un error es reintentable basándose en el código de estado HTTP o el tipo de error de red.

### Interceptores

```typescript
import { httpInstance } from 'httplazy';

// Interceptor de petición
httpInstance.interceptors.request.use(config => {
  config.headers = config.headers || {};
  config.headers['X-Custom-Header'] = 'MiValorPersonalizado';
  console.log('Interceptor de petición: config final', config);
  return config;
});

// Interceptor de respuesta
httpInstance.interceptors.response.use(
  response => {
    console.log('Interceptor de respuesta: respuesta recibida', response);
    return response;
  },
  error => {
    console.error('Interceptor de error:', error);
    return Promise.reject(error);
  }
);
```

---

### Interceptores globales

Puedes aplicar interceptores globales en HttpLazy de forma sencilla. Un interceptor global es aquel que afecta a todas las peticiones realizadas con una instancia de cliente (por ejemplo, la instancia singleton `http`).

#### Ejemplo: interceptor global para toda la app

```typescript
import { http } from 'httplazy';
import { LoggingInterceptor } from './logging.interceptor';

// Aplica el interceptor a TODAS las peticiones de la app
http.useInterceptor(new LoggingInterceptor());
```

Todas las peticiones hechas con `http.get`, `http.post`, etc., pasarán por ese interceptor.

#### Interceptores globales por instancia personalizada

Si creas una instancia personalizada de cliente, puedes tener interceptores globales solo para esa instancia:

```typescript
import { HttpCore } from 'httplazy';
import { AuthInterceptor } from './auth.interceptor';

const customClient = new HttpCore.HttpCore();
customClient.useInterceptor(new AuthInterceptor());

// Todas las peticiones hechas con customClient tendrán ese interceptor
```

#### ¿Cómo limpiar o reemplazar interceptores globales?

Puedes limpiar todos los interceptores de una instancia usando el método interno:

```typescript
// Limpiar todos los interceptores de la instancia global
http._setupInterceptors();

// O para una instancia personalizada
customClient._setupInterceptors();
```

> **Nota:** Los interceptores son globales para la instancia donde los agregues. Si usas la instancia singleton `http`, el interceptor es global para toda la app. Si usas varias instancias, puedes tener diferentes interceptores globales por contexto.

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
http.trackActivity('page_view');
http.trackActivity('search', { query: 'término' });

// Obtener métricas actuales
const metrics = http.getCurrentMetrics();
console.log('Tiempo promedio de respuesta:', metrics.avgResponseTime);
console.log('Tasa de errores:', metrics.errorRate);
```

### Logging Personalizado

HttpLazy incluye un sistema de logging modular y extensible para registrar información de cada petición y respuesta HTTP.

```typescript
import { Logger, ConsoleLoggerAdapter } from "httplazy/http/logging";

// Configuración básica
envía logs a consola
const logger = Logger.getInstance();
logger.configure({
  level: "debug",
  adapters: [new ConsoleLoggerAdapter()],
});

logger.info("Mensaje informativo", { userId: 123 });
```

**Como interceptor HTTP:**

```typescript
import { LoggingInterceptor } from 'httplazy/http/logging';

client.useInterceptor(new LoggingInterceptor());
```

- Puedes crear adaptadores propios implementando la interfaz `ILoggerAdapter`.
- Soporta niveles: debug, info, warn, error.
- Permite múltiples destinos de log (consola, archivo, servicios externos, etc).

> Consulta la documentación extendida en `http/logging/README.md` para más detalles y ejemplos.

### Streaming (Servidor)

```javascript
// Importar desde servidor
import { stream } from 'httplazy/server';

// Streaming de archivo grande
const fileStream = await stream('https://example.com/large-file.zip', {
  onData: chunk => {
    // Procesar cada fragmento
    const percent = (bytesReceived / totalBytes) * 100;
    updateProgressBar(percent);
  },
  onComplete: () => {
    console.log('Descarga completada');
  },
  onError: err => {
    console.error('Error en streaming:', err);
  },
});

// Streaming básico en cliente
import { stream } from 'httplazy/client';

const textStream = await stream('https://api.example.com/events');
// Procesar stream con las APIs del navegador
```

### Servidor HTTP Minimalista (Node.js)

A partir de la versión 2.x, puedes levantar un servidor HTTP funcional en Node.js con una sola línea usando `HttpLazyServer`:

```typescript
import { HttpLazyServer } from 'httplazy';

const app = new HttpLazyServer();
app.start();
```

- El puerto por defecto es 3000, pero puedes pasarlo como opción: `new HttpLazyServer({ port: 4000 })`.
- Puedes agregar rutas fácilmente:

```typescript
app.get('/ping', (req, res) => res.json({ ok: true }));
```

#### Desarrollo con recarga automática

Ya viene integrado `nodemon` para desarrollo. Simplemente ejecuta:

```bash
npm run dev
```

Esto levantará tu servidor y recargará automáticamente ante cualquier cambio en tu archivo de entrada (`index.js` o `index.ts`).

### Proxies (Servidor)

```javascript
// Importar desde servidor
import { configureProxy } from 'httplazy/server';

// Configurar proxy HTTP
configureProxy({
  protocol: 'http',
  host: 'proxy.company.com',
  port: 8080,
  auth: {
    username: 'user',
    password: 'pass',
  },
});

// Proxy SOCKS
configureProxy({
  protocol: 'socks5',
  host: '127.0.0.1',
  port: 9050,
});
```

## Compatibilidad con librerías que esperan promesas rechazadas

Algunas librerías (como React Query, SWR, middlewares, etc.) esperan que las funciones que consumen retornen una promesa que se rechaza en caso de error (es decir, que lancen una excepción). Por defecto, HttpLazy retorna siempre un objeto `{ data, error, status }` y **no lanza excepción**. Puedes adaptar el comportamiento fácilmente con un helper:

### Helper: lanzar excepción solo si hay error

```typescript
export function ensureSuccess<T>(response: { data: T; error?: any; status: number }): T {
  if (response.error)
    throw Object.assign(new Error(response.error.message), response.error, {
      status: response.status,
    });
  return response.data;
}
```

### Ejemplo de uso

```typescript
// Uso normal (patrón HttpLazy)
const resp = await http.getAll('/api/users');
if (resp.error) {
  // Manejo uniforme
  showError(resp.error.message);
}

// Uso con librerías que esperan promesas rechazadas
const data = ensureSuccess(await http.getAll('/api/users'));
// Si hay error, se lanza como excepción y puedes usar try/catch o integrarlo con React Query, etc.
```

> **Ventaja:** Así puedes mantener el flujo uniforme y predecible de HttpLazy en tu app, pero lanzar excepciones solo cuando lo necesitas para integraciones externas, sin perder ninguna ventaja del patrón `{ data, error }`.

## Manejo de Errores

HttpLazy proporciona un manejo de errores consistente y predecible:

```javascript
const { data, error, status } = await http.getAll('/api/users');

if (error) {
  // Manejar según código HTTP
  if (status === 404) {
    console.error('Recurso no encontrado');
  } else if (status === 401) {
    console.error('Autenticación requerida');
  } else if (status >= 500) {
    console.error('Error del servidor:', error.message);
  } else {
    console.error(`Error (${status}):`, error.message);
  }

  // Detalles adicionales
  if (error.details) {
    console.error('Detalles:', error.details);
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
  const response = await http.getAll('/api/data');

  if (response.error) {
    // Error HTTP con respuesta del servidor
    handleApiError(response.error);
  } else {
    processData(response.data);
  }
} catch (err) {
  // Errores de red, como desconexión o timeout
  console.error('Error de conexión:', err.message);
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
} from 'httplazy/errors';

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
const { error } = await http.getAll('/api/users');

if (error) {
  switch (error.code) {
    case 'AUTH_EXPIRED':
      await http.refreshToken();
      // Reintentar petición
      break;
    case 'CACHE_MISS':
      // Obtener desde origen
      break;
    case 'RATE_LIMITED':
      // Implementar backoff exponencial
      break;
    case 'VALIDATION_FAILED':
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
import { HttpError } from 'httplazy/errors';

class PaymentDeclinedError extends HttpError {
  constructor(message, details = {}) {
    super(message, 'PAYMENT_DECLINED', 402, details);
    this.name = 'PaymentDeclinedError';

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
http._setupInterceptors(response => {
  // Transformar errores estándar en personalizados
  if (response.status === 402 && response.data?.type === 'payment_error') {
    throw new PaymentDeclinedError('Pago rechazado', {
      paymentId: response.data.paymentId,
      reason: response.data.reason,
      canRetry: response.data.canRetry,
      alternatives: response.data.alternatives,
    });
  }
  return response;
}, 'response');

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
  AUTH_EXPIRED: async error => {
    // Refrescar token automáticamente
    await authService.refreshToken();
    return true; // Indica que se puede reintentar
  },
  NETWORK_OFFLINE: error => {
    // Activar modo offline
    appStore.setOfflineMode(true);
    showToast('Trabajando en modo offline');
    return false; // No reintentar automáticamente
  },
  RATE_LIMITED: error => {
    // Implementar backoff
    const retryAfter = error.details.retryAfter || 5000;
    showToast(`Demasiadas peticiones, reintentando en ${retryAfter / 1000}s`);
    return new Promise(resolve => setTimeout(() => resolve(true), retryAfter));
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
    const response = await userService.getAll();

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
'use client';
import { useState, useEffect } from 'react';
import { http } from 'httplazy/client';

export default function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await http.getById('/api/users', userId);
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
import { http } from 'httplazy/server';

export async function GET(request) {
  // Obtener productos desde un servicio externo
  const response = await http.getAll('https://external-api.com/products');

  if (response.error) {
    return Response.json({ error: response.error.message }, { status: response.status });
  }

  return Response.json(response.data);
}
```

### En Server Actions

```javascript
// app/actions.js
'use server';
import { http } from 'httplazy/server';

export async function processPayment(formData) {
  const paymentData = {
    amount: formData.get('amount'),
    cardNumber: formData.get('cardNumber'),
    // otros campos...
  };

  // Usar proxy para API de pagos
  configureProxy({
    protocol: 'https',
    host: 'secure-proxy.company.com',
    port: 443,
  });

  const response = await http.post('https://payment-gateway.com/process', paymentData);

  return response.data;
}
```

## Buenas Prácticas

### Organización del Código

Crea un servicio centralizado para tus APIs:

```javascript
// lib/api.js
import { http } from 'httplazy/client';

http.initialize({
  baseUrl: '/api',
  // otras configuraciones...
});

export const userService = {
  getAll: () => http.getAll('/users'),
  getById: id => http.getById('/users', id),
  create: data => http.post('/users', data),
  update: (id, data) => http.put(`/users/${id}`, data),
  delete: id => http.del(`/users/${id}`),
};

export const authService = {
  login: credentials => http.login(credentials),
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
   const [users, products] = await Promise.all([userService.getAll(), productService.getAll()]);
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
           setError({ message: 'Error de conexión' });
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
   const config = await http.getAll('/api/config', { cache: 3600 }); // 1h

   // Datos que cambian con frecuencia
   const notifications = await http.getAll('/api/notifications', { cache: 60 }); // 1min
   ```

2. **Invalidación selectiva**

   ```javascript
   // Después de actualizar un usuario
   await userService.update(id, userData);
   http.invalidateCacheByTags(['users']);
   ```

3. **Precarga de datos críticos**
   ```javascript
   // Precargar datos comunes durante la inicialización
   export async function initializeApp() {
     await Promise.all([
       http.getAll('/api/config', { cache: true }),
       http.getAll('/api/common-data', { cache: true }),
     ]);
   }
   ```

### Tests

#### Cómo probar errores HTTP (404, 500, etc.)

Para asegurar que tu aplicación maneja correctamente los errores HTTP (como 404 Not Found o 500 Internal Server Error), puedes simular estos escenarios de varias formas:

#### 1. Usando endpoints de prueba

Utiliza endpoints públicos que siempre devuelven un error:

```js
// 404 Not Found
const resp = await http.get('https://httpstat.us/404');
console.log(resp.status); // 404
console.log(resp.error); // Mensaje de error descriptivo

// 500 Internal Server Error
const resp2 = await http.get('https://httpstat.us/500');
console.log(resp2.status); // 500
console.log(resp2.error); // Mensaje de error descriptivo
```

#### 2. Mockeando en tests

En tus tests unitarios, puedes mockear el método para devolver un error simulado:

```js
jest.spyOn(http, 'get').mockResolvedValue({
  data: null,
  error: 'Recurso no encontrado',
  status: 404,
});
const resp = await http.get('/api/fake');
expect(resp.status).toBe(404);
expect(resp.error).toBe('Recurso no encontrado');
```

#### 3. Usando servidores locales

Puedes levantar un servidor local que devuelva el código de error deseado para pruebas más avanzadas.

#### Recomendaciones

- Siempre verifica la propiedad `error` y el `status` en tus tests y en la UI.
- Simula tanto errores de cliente (4xx) como de servidor (5xx) para asegurar una cobertura completa.

### Cancelación de solicitudes HTTP

HttpLazy soporta cancelación de peticiones usando `AbortController` (en browser y Node.js moderno):

```js
const controller = new AbortController();

const promesa = http.get('https://fakestoreapi.com/products', {
  signal: controller.signal,
  timeout: 5000,
});

// Para cancelar la petición:
controller.abort();
```

- En Node.js moderno y browser, la cancelación es nativa.
- Internamente, HttpLazy adapta el mecanismo para Axios/fetch según el entorno.
- Puedes usarlo en cualquier método: `get`, `post`, `upload`, etc.

### Headers y opciones de petición

La forma recomendada y tipada de pasar headers y opciones es:

```js
http.get('https://fakestoreapi.com/products', {
  headers: { 'X-Request-ID': '12345' },
  timeout: 5000,
});
```

- **headers**: Deben ir dentro de la propiedad `headers`.
- **timeout**: Es una opción de nivel superior.

**No recomendado:**

```js
// Esto puede no funcionar correctamente:
http.get('https://fakestoreapi.com/products', {
  'X-Request-ID': '12345', // ❌ No irá como header
  timeout: 5000,
});
```

> Usa siempre la estructura `{ headers: { ... }, timeout: ... }` para máxima compatibilidad y autocompletado TypeScript.

## Solución de Problemas

### Errores CORS

Si experimentas errores CORS en desarrollo:

```javascript
// Configuración para desarrollo local
if (process.env.NODE_ENV === 'development') {
  http.initialize({
    // otras configuraciones...
    defaultHeaders: {
      'Content-Type': 'application/json',
      // Añadir headers CORS si es necesario
    },
  });
}
```

### Errores de Módulos Faltantes en Next.js

Si encuentras errores como "Can't resolve 'net'" en Next.js, asegúrate de importar correctamente:

```javascript
// ❌ Incorrecto
import { http } from 'httplazy';

// ✅ Correcto para componentes cliente
import { http } from 'httplazy/client';
```

### Errores de TypeScript

Si encuentras errores de TypeScript relacionados con los tipos:

```typescript
// Importar tipos explícitamente
import { http } from 'httplazy/client';
import type { ApiResponse, RequestOptions } from 'httplazy/client';

async function fetchData(): Promise<ApiResponse<UserType[]>> {
  return http.getAll<UserType[]>('/api/users');
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
│  │  - getAll()     │    │      │  │  - getAll()     │    │
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
│ http.getAll│    │ Petición   │    │ ¿Presente? │    │   HTTP     │    │  API    │
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

### 🤝 Cómo Contribuir

1. Haz un **fork** del repositorio
2. Clona tu fork: `git clone ...`
3. Crea una rama: `git checkout -b mi-feature`
4. Haz tus cambios y pruebas (`npm test`)
5. Haz commit siguiendo Conventional Commits
6. Sube tu rama: `git push origin mi-feature`
7. Abre un **Pull Request** y describe tu cambio

> ¡Toda contribución es bienvenida! Consulta la [Guía de Contribución](#guía-de-contribución) para más detalles.

## Casos de Uso Específicos

### Manejo de Subida de Archivos

```javascript
// Subida básica de archivo
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await http.post('/api/upload', formData, {
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
  cancelButton.addEventListener('click', () => controller.abort());

  try {
    const { data } = await http.post('/api/upload-multiple', formData, {
      signal: controller.signal,
      timeout: 120000, // 2 minutos
      retries: 1, // Un reintento en caso de fallo
    });

    return { success: true, data };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { success: false, aborted: true };
    }
    return { success: false, error };
  }
}
```

### Subir múltiples archivos en un solo campo

Puedes pasar un array de paths, streams, File o Blob para subir varios archivos bajo el mismo campo:

```js
// Node.js
await http.upload('https://fakestoreapi.com/upload', {
  archivos: ['./a.txt', './b.txt'], // varios archivos en un solo campo
  descripcion: 'Subida múltiple',
});

// Browser
await http.upload('https://fakestoreapi.com/upload', {
  archivos: [file1, file2], // File o Blob
  descripcion: 'Subida múltiple',
});
```

- El campo se repetirá en el FormData por cada archivo.
- Puedes combinar campos simples y arrays.

### Errores esperados en upload

- Si un archivo no existe o no es válido, la respuesta tendrá un error:
  - `El archivo './noexiste.txt' no existe o no es un archivo válido (campo 'archivo')`
- Si un archivo excede el tamaño máximo permitido:
  - `Archivo './grande.txt' excede el tamaño máximo permitido (1048576 bytes)`
- El error siempre vendrá en la propiedad `error` de la respuesta, nunca como excepción (a menos que sea un error de uso de la API).

### Desactivar validación de archivos (casos avanzados)

Puedes desactivar la validación de existencia/tamaño de archivos usando la opción `validateFiles: false`:

```js
await http.upload(url, fields, { validateFiles: false });
```

Esto es útil si quieres delegar la validación al backend o subir streams especiales.

### Validar tamaño máximo de archivos

Puedes limitar el tamaño máximo de cada archivo (en bytes) usando la opción `maxFileSize`:

```js
await http.upload(url, fields, { maxFileSize: 1024 * 1024 }); // 1MB
```

Si algún archivo excede el límite, la respuesta tendrá un error claro.

### Ejemplo de manejo de errores

```js
const resp = await http.upload(
  'https://api.com/upload',
  {
    archivo: './grande.txt',
  },
  { maxFileSize: 1024 * 1024 }
);

if (resp.error) {
  console.error('Error al subir archivo:', resp.error);
  // Ejemplo: "Archivo './grande.txt' excede el tamaño máximo permitido (1048576 bytes)"
} else {
  console.log('Subida exitosa:', resp.data);
}
```

### Validación y manejo de errores en upload

El método `upload` realiza validaciones automáticas en Node.js:

- Verifica que los archivos existan y sean válidos antes de subirlos (por defecto).
- Permite limitar el tamaño máximo de los archivos con la opción `maxFileSize` (en bytes).
- Si ocurre un error de validación, **la respuesta tendrá la propiedad `error` con un mensaje descriptivo**. Nunca se lanza una excepción inesperada.

#### Ejemplo: manejo de error por archivo inexistente

```js
const resp = await http.upload('https://fakestoreapi.com/upload', {
  archivo: './noexiste.txt',
  descripcion: 'Intento fallido',
});

if (resp.error) {
  console.error('Error al subir archivo:', resp.error);
  // "El archivo './noexiste.txt' no existe o no es un archivo válido (campo 'archivo')"
}
```

#### Ejemplo: limitar tamaño máximo de archivo

```js
const resp = await http.upload(
  'https://fakestoreapi.com/upload',
  {
    archivo: './grande.txt',
  },
  { maxFileSize: 1024 * 1024 }
); // 1MB
if (resp.error) {
  // "Archivo './grande.txt' excede el tamaño máximo permitido (1048576 bytes)"
}
```

#### Desactivar validación de archivos (casos avanzados)

Puedes desactivar la validación de existencia/tamaño de archivos usando la opción `validateFiles: false`:

```js
const resp = await http.upload(
  'https://fakestoreapi.com/upload',
  {
    archivo: './noexiste.txt',
  },
  { validateFiles: false }
);
// No se valida la existencia ni el tamaño, se envía el campo tal cual
```

#### Buenas prácticas en tests

- Mockea el método `post` y el helper de FormData en tus tests para evitar dependencias de red o de archivos reales.
- Verifica siempre la propiedad `error` en la respuesta para manejar cualquier validación fallida.

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
| **Streaming**              | ✅                    | ✅ (Básico)          | ✅                           |
| **Proxy**                  | ✅ (Servidor)         | ✅                   | ❌                           |
| **Reintentos automáticos** | ✅ (Exponencial)      | ❌ (Requires config) | ❌                           |
| **Métricas integradas**    | ✅                    | ❌                   | ❌                           |

### Diferencias técnicas restantes frente a Axios

HTTPLazy cubre la mayoría de las funcionalidades modernas y ergonómicas de Axios, pero existen algunas diferencias técnicas menores:

| Característica                                 | HTTPLazy  | Axios          |
| ---------------------------------------------- | --------- | -------------- |
| Transformadores automáticos (request/response) | ✅        | ✅             |
| Progreso de subida/descarga de archivos        | Parcial\* | ✅             |
| Cancelación de peticiones (`AbortController`)  | ✅        | ✅             |
| CancelToken personalizado (legacy)             | ❌        | ✅ (deprecado) |
| Adaptador HTTP personalizable a bajo nivel     | ❌        | ✅             |
| Soporte para navegadores legacy (IE11+)        | ❌        | ✅             |
| Serialización avanzada de query params         | Básica    | Avanzada       |

> \*HTTPLazy permite subir archivos y cancelar peticiones, pero el seguimiento de progreso puede requerir integración manual adicional.

**¿Por qué elegir HTTPLazy igualmente?**
HTTPLazy está optimizada para proyectos modernos, priorizando ergonomía, rendimiento, tipado y compatibilidad universal (Node.js + browser). Si tu proyecto no depende de navegadores legacy ni de personalizaciones muy avanzadas del adaptador HTTP, HTTPLazy es una opción más ligera, clara y fácil de mantener.

## Clientes HTTP múltiples

A partir de la versión 2.x, puedes crear tantas instancias de cliente HTTP como necesites, cada una con su propia configuración, headers, interceptores o autenticación. Esto es ideal para proyectos que consumen múltiples APIs o requieren contextos de autenticación distintos.

### Ejemplo en TypeScript

```typescript
import { HttpCore } from 'httplazy';

// Opciones para el primer cliente
const clientA = new HttpCore.HttpCore({
  baseUrl: 'https://api.empresaA.com',
  defaultHeaders: {
    Authorization: 'Bearer tokenA',
    'X-App': 'A',
  },
  timeout: 8000,
});

// Opciones para el segundo cliente
const clientB = new HttpCore.HttpCore({
  baseUrl: 'https://api.empresaB.com',
  defaultHeaders: {
    Authorization: 'Bearer tokenB',
    'X-App': 'B',
  },
  timeout: 5000,
});

// Cada cliente es totalmente independiente
const { data: dataA } = await clientA.getAll('/usuarios');
const { data: dataB } = await clientB.getAll('/clientes');

// Puedes agregar interceptores o configuración específica a cada uno
clientA.useInterceptor(new MiInterceptorPersonalizado());
clientB.useInterceptor(new OtroInterceptor());
```

- Cada instancia mantiene su propio estado, configuración y middlewares.
- Puedes usar tantas instancias como necesites en tu aplicación.
- Esto es equivalente a `axios.create()` pero con el enfoque modular y tipado de HTTPLazy.

> **Recomendación:** Si tienes muchas APIs o contextos, considera crear una pequeña factoría para centralizar la creación de clientes y evitar duplicación de lógica.

### Ejemplo de factoría para clientes HTTP

Si tu proyecto consume muchas APIs o necesitas crear clientes con configuraciones dinámicas, puedes centralizar la lógica en una factoría. Así evitas duplicación y facilitas el mantenimiento.

```typescript
// lib/httpClientFactory.ts
import { HttpCore } from 'httplazy';

interface ClientConfig {
  baseUrl: string;
  token?: string;
  timeout?: number;
}

export class HttpClientFactory {
  private static instances: Record<string, HttpCore.HttpCore> = {};

  static getClient(key: string, config: ClientConfig): HttpCore.HttpCore {
    if (!this.instances[key]) {
      this.instances[key] = new HttpCore.HttpCore({
        baseUrl: config.baseUrl,
        defaultHeaders: config.token ? { Authorization: `Bearer ${config.token}` } : {},
        timeout: config.timeout || 5000,
      });
    }
    return this.instances[key];
  }
}
```

**Uso:**

```typescript
import { HttpClientFactory } from './lib/httpClientFactory';

const apiA = HttpClientFactory.getClient('apiA', {
  baseUrl: 'https://api.empresaA.com',
  token: 'tokenA',
  timeout: 8000,
});

const apiB = HttpClientFactory.getClient('apiB', {
  baseUrl: 'https://api.empresaB.com',
  token: 'tokenB',
  timeout: 5000,
});

// Peticiones independientes
const { data: usersA } = await apiA.getAll('/usuarios');
const { data: usersB } = await apiB.getAll('/clientes');
```

- La factoría asegura que cada cliente se crea una sola vez por clave.
- Puedes extender la lógica para añadir interceptores, logging, etc.

---

### Ejemplo avanzado: múltiples clientes en un contexto real

Supón que tienes un microservicio de usuarios y otro de productos, cada uno con autenticación y configuración distinta:

```typescript
import { HttpCore } from 'httplazy';

// Cliente para microservicio de usuarios
const userClient = new HttpCore.HttpCore({
  baseUrl: 'https://api.usuarios.com',
  defaultHeaders: { Authorization: 'Bearer userToken' },
});

// Cliente para microservicio de productos
const productClient = new HttpCore.HttpCore({
  baseUrl: 'https://api.productos.com',
  defaultHeaders: { Authorization: 'Bearer productToken' },
});

// Obtener datos de ambos servicios en paralelo
const [users, products] = await Promise.all([
  userClient.getAll('/users'),
  productClient.getAll('/products'),
]);

console.log('Usuarios:', users.data);
console.log('Productos:', products.data);
```

Esto te permite desacoplar la lógica de cada dominio, mantener la seguridad y la configuración separada, y escalar tu aplicación de forma limpia y mantenible.

#### Ejemplo: Interceptor manual para respuestas 401 (redirigir al login)

Si necesitas manejar la redirección al login de forma personalizada cuando el servidor responde con un 401 (no autorizado), puedes agregar un interceptor de error así:

```typescript
import { http } from 'httplazy';

// Interceptor de error para manejar 401 y redirigir al login
dhttp.interceptors.response.use(
  response => response,
  error => {
    if (error?.status === 401) {
      // Redirige al login (puedes usar window.location o tu router)
      window.location.href = '/login';
      // Opcional: limpiar tokens, cerrar sesión, etc.
    }
    return Promise.reject(error);
  }
);
```

- Este patrón es útil si necesitas lógica personalizada o integración con frameworks como React Router, Next.js, etc.
- Si usas la configuración integrada (`configureAuth`), la redirección automática ya está soportada y no necesitas este interceptor.

---

## Arquitectura Orientada a Servicios (SOA)

> **HttpLazy** incluye soporte nativo para exponer y consumir servicios bajo el paradigma SOA (Service Oriented Architecture), facilitando la creación de microservicios y la comunicación entre sistemas desacoplados.

### ¿Qué es SOA en HttpLazy?

- Permite definir y publicar servicios (métodos remotos) en un servidor Node.js de forma tipada y modular.
- Los clientes pueden consumir estos servicios de manera transparente, con tipado TypeScript y manejo de errores uniforme.
- Ideal para arquitecturas distribuidas, microservicios, o integración entre sistemas heterogéneos.

### Ventajas

- **Desacoplamiento:** Los servicios se exponen y consumen por nombre, no por rutas HTTP rígidas.
- **Batching:** Permite agrupar múltiples llamadas a servicios en una sola petición (optimización de red).
- **Tipado:** Contratos claros y reutilizables entre cliente y servidor.
- **Extensible:** Puedes agregar/quitar servicios en caliente.

### Ejemplo: Crear un Servidor SOA

```typescript
import { createSoaServer } from 'httplazy/server';

const mathService = {
  async sum(a: number, b: number) {
    return a + b;
  },
  async multiply(a: number, b: number) {
    return a * b;
  },
};

const server = createSoaServer({
  port: 4000,
  services: {
    math: mathService,
  },
});

await server.start();
console.log('SOA server running on port 4000');
```

### Ejemplo: Consumir servicios SOA desde un cliente

```typescript
import { createSoaClient } from 'httplazy/client';

const client = createSoaClient({
  serviceUrl: 'http://localhost:4000/services',
});

const result = await client.callService('math', 'sum', [2, 3]);
console.log(result); // 5

// Llamada batch
const results = await client.callBatch([
  { serviceName: 'math', method: 'sum', params: [1, 2] },
  { serviceName: 'math', method: 'multiply', params: [3, 4] },
]);
console.log(results); // [3, 12]
```

### API SOA disponible

- `createSoaServer(config)`: Crea y expone servicios en el servidor.
- `createSoaClient(config)`: Permite consumir servicios remotos.
- `callService(serviceName, method, params, options?)`: Llama a un método remoto.
- `callBatch(calls, options?)`: Llama a varios métodos en una sola petición.
- `getServiceDefinition(serviceName)`: Obtiene la definición de un servicio.
- `addService(name, implementation)`: Agrega un servicio en caliente (servidor).
- `removeService(name)`: Elimina un servicio (servidor).

### Notas y recomendaciones

- El endpoint por defecto es `/services` (configurable).
- Soporta CORS y configuración avanzada.
- El cliente puede usar autenticación y headers personalizados.
- Ideal para microservicios, gateways, y sistemas distribuidos.

> Consulta la documentación extendida o el código fuente para ver más ejemplos avanzados y patrones de integración.

### Servidor HTTP Minimalista (Node.js)

A partir de la versión 2.x, puedes levantar un servidor HTTP funcional en Node.js con una sola línea usando `HttpLazyServer`:

```typescript
import { HttpLazyServer } from 'httplazy';

const app = new HttpLazyServer();
app.start();
```

- El puerto por defecto es 3000, pero puedes pasarlo como opción: `new HttpLazyServer({ port: 4000 })`.
- Puedes agregar rutas fácilmente:

```typescript
app.get('/ping', (req, res) => res.json({ ok: true }));
```

#### Desarrollo con recarga automática

Ya viene integrado `nodemon` para desarrollo. Simplemente ejecuta:

```bash
npm run dev
```

Esto levantará tu servidor y recargará automáticamente ante cualquier cambio en tu archivo de entrada (`index.js` o `index.ts`).
