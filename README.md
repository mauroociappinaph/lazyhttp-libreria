# LazyHTTP

[English](#english) | [Español](#español)

## English

### Description

LazyHTTP is a powerful and easy-to-use HTTP client library for Node.js that provides a simple interface for making HTTP requests with built-in error handling, retries, interceptors, and more. It's designed to make HTTP requests as simple as possible while providing advanced features when needed.

### Key Features

- **Simple and Intuitive API**: Clean and consistent interface for all HTTP methods
- **Built-in Error Handling**: Comprehensive error handling with detailed error messages
- **Automatic Retries**: Configurable retry mechanism for failed requests
- **Request/Response Interceptors**: Modify requests and responses globally
- **Authentication Support**:
  - JWT Authentication
  - OAuth2 Support
  - Basic Auth
  - Custom Auth Schemes
- **Advanced Caching**:
  - In-memory caching
  - Configurable TTL
  - Cache invalidation
  - Cache tags
- **Metrics Tracking**:
  - Request/Response timing
  - Error tracking
  - Performance metrics
- **Proxy Support**:
  - HTTP/HTTPS proxies
  - SOCKS proxies
  - Proxy authentication
- **Streaming Support**:
  - Large file downloads
  - Real-time data processing
  - Progress tracking
- **TypeScript Support**: Full type definitions and autocompletion

### Installation

```bash
# Using npm
npm install httplazy

# Using yarn
yarn add httplazy

# Using pnpm
pnpm add httplazy
```

### Quick Start

#### Basic Usage

```typescript
import { http } from "httplazy";

// Simple GET request
const response = await http.get("https://api.example.com/data");
console.log(response.data);

// POST request with data
const result = await http.post("https://api.example.com/create", {
  name: "John",
  age: 30,
});

// Using query parameters
const search = await http.get("https://api.example.com/search", {
  params: {
    q: "search term",
    page: 1,
    limit: 10,
  },
});
```

#### Advanced Features

```typescript
// Configure global settings
http.initialize({
  baseUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  headers: {
    "Content-Type": "application/json",
  },
});

// Using interceptors
http._setupInterceptors((config) => {
  console.log("Request:", config);
  return config;
}, "request");

// Authentication
http.configureAuth({
  type: "jwt",
  token: "your-jwt-token",
});

// Caching
http.configureCaching({
  enabled: true,
  ttl: 3600,
});

// Metrics
http.configureMetrics({
  enabled: true,
  trackRequests: true,
});
```

### CLI Usage

```bash
# Basic GET request
lazyhttp get https://api.example.com/data

# POST request with data
lazyhttp post https://api.example.com/create --data '{"name": "John"}'

# Using query parameters
lazyhttp get https://api.example.com/search --params '{"q": "search term"}'

# With headers
lazyhttp get https://api.example.com/data --headers '{"Authorization": "Bearer token"}'

# With authentication
lazyhttp get https://api.example.com/data --auth 'Bearer token'

# With timeout
lazyhttp get https://api.example.com/data --timeout 5000

# With retries
lazyhttp get https://api.example.com/data --retries 3

# Download file
lazyhttp get https://example.com/file.pdf --output file.pdf

# Stream response
lazyhttp get https://example.com/stream --stream
```

### Documentation

For detailed documentation, please visit our [documentation page](docs/README.md).

### Error Handling

LazyHTTP provides comprehensive error handling with detailed error messages that help you quickly identify and fix issues:

```typescript
try {
  const response = await http.get("https://api.example.com/data");
  // Process response
} catch (error) {
  if (error instanceof HttpTimeoutError) {
    console.error("Timeout error:", error.details?.description);
    console.log("Cause:", error.details?.cause);
    console.log("Solution:", error.details?.solution);
    console.log("Example:", error.details?.example);
  }
}
```

Each error includes:

- **Description**: Clear explanation of what went wrong
- **Cause**: Probable reason for the error
- **Solution**: Steps to resolve the issue
- **Example**: Code example showing how to avoid or handle the error

Error types include:

- `HttpTimeoutError`: Request exceeded the timeout limit
- `HttpNetworkError`: Connection issues with the server
- `HttpAuthError`: Authentication or authorization problems
- `HttpAxiosError`: Issues with the Axios request
- `HttpAbortedError`: Request was aborted before completion
- `HttpUnknownError`: Unclassified or unexpected errors

## Español

### Descripción

LazyHTTP es una biblioteca cliente HTTP potente y fácil de usar para Node.js que proporciona una interfaz simple para realizar solicitudes HTTP con manejo de errores incorporado, reintentos, interceptores y más. Está diseñada para hacer las solicitudes HTTP lo más simples posible mientras proporciona características avanzadas cuando se necesitan.

### Características Principales

- **API Simple e Intuitiva**: Interfaz limpia y consistente para todos los métodos HTTP
- **Manejo de Errores Incorporado**: Manejo completo de errores con mensajes detallados
- **Reintentos Automáticos**: Mecanismo configurable de reintentos para solicitudes fallidas
- **Interceptores de Solicitud/Respuesta**: Modificar solicitudes y respuestas globalmente
- **Soporte de Autenticación**:
  - Autenticación JWT
  - Soporte OAuth2
  - Autenticación Básica
  - Esquemas de Autenticación Personalizados
- **Caché Avanzado**:
  - Caché en memoria
  - TTL configurable
  - Invalidación de caché
  - Etiquetas de caché
- **Seguimiento de Métricas**:
  - Tiempo de solicitud/respuesta
  - Seguimiento de errores
  - Métricas de rendimiento
- **Soporte de Proxy**:
  - Proxies HTTP/HTTPS
  - Proxies SOCKS
  - Autenticación de proxy
- **Soporte de Streaming**:
  - Descarga de archivos grandes
  - Procesamiento de datos en tiempo real
  - Seguimiento de progreso
- **Soporte de TypeScript**: Definiciones de tipos completas y autocompletado

### Instalación

```bash
# Usando npm
npm install httplazy

# Usando yarn
yarn add httplazy

# Usando pnpm
pnpm add httplazy
```

### Inicio Rápido

#### Uso Básico

```typescript
import { http } from "httplazy";

// Solicitud GET simple
const response = await http.get("https://api.example.com/data");
console.log(response.data);

// Solicitud POST con datos
const result = await http.post("https://api.example.com/create", {
  name: "John",
  age: 30,
});

// Usando parámetros de consulta
const search = await http.get("https://api.example.com/search", {
  params: {
    q: "término de búsqueda",
    page: 1,
    limit: 10,
  },
});
```

#### Características Avanzadas

```typescript
// Configurar ajustes globales
http.initialize({
  baseUrl: "https://api.example.com",
  timeout: 5000,
  retries: 3,
  headers: {
    "Content-Type": "application/json",
  },
});

// Usando interceptores
http._setupInterceptors((config) => {
  console.log("Solicitud:", config);
  return config;
}, "request");

// Autenticación
http.configureAuth({
  type: "jwt",
  token: "tu-jwt-token",
});

// Caché
http.configureCaching({
  enabled: true,
  ttl: 3600,
});

// Métricas
http.configureMetrics({
  enabled: true,
  trackRequests: true,
});
```

### Uso de CLI

```bash
# Solicitud GET básica
lazyhttp get https://api.example.com/data

# Solicitud POST con datos
lazyhttp post https://api.example.com/create --data '{"name": "John"}'

# Usando parámetros de consulta
lazyhttp get https://api.example.com/search --params '{"q": "término de búsqueda"}'

# Con encabezados
lazyhttp get https://api.example.com/data --headers '{"Authorization": "Bearer token"}'

# Con autenticación
lazyhttp get https://api.example.com/data --auth 'Bearer token'

# Con timeout
lazyhttp get https://api.example.com/data --timeout 5000

# Con reintentos
lazyhttp get https://api.example.com/data --retries 3

# Descargar archivo
lazyhttp get https://example.com/file.pdf --output file.pdf

# Stream de respuesta
lazyhttp get https://example.com/stream --stream
```

### Documentación

Para documentación detallada, por favor visite nuestra [página de documentación](docs/README.md).

### Manejo de Errores

LazyHTTP proporciona un manejo completo de errores con mensajes detallados que te ayudan a identificar y solucionar problemas rápidamente:

```typescript
try {
  const response = await http.get("https://api.example.com/data");
  // Procesar respuesta
} catch (error) {
  if (error instanceof HttpTimeoutError) {
    console.error("Error de timeout:", error.details?.description);
    console.log("Causa:", error.details?.cause);
    console.log("Solución:", error.details?.solution);
    console.log("Ejemplo:", error.details?.example);
  }
}
```

Cada error incluye:

- **Descripción**: Explicación clara de lo que salió mal
- **Causa**: Razón probable del error
- **Solución**: Pasos para resolver el problema
- **Ejemplo**: Ejemplo de código que muestra cómo evitar o manejar el error

Los tipos de error incluyen:

- `HttpTimeoutError`: La solicitud excedió el límite de tiempo
- `HttpNetworkError`: Problemas de conexión con el servidor
- `HttpAuthError`: Problemas de autenticación o autorización
- `HttpAxiosError`: Problemas con la solicitud de Axios
- `HttpAbortedError`: La solicitud fue abortada antes de completarse
- `HttpUnknownError`: Errores no clasificados o inesperados

### Documentación

Para documentación detallada, por favor visite nuestra [página de documentación](docs/README.md).
