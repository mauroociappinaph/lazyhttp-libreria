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

#### Resource Accessors con Símbolos

Los resource accessors permiten un acceso más limpio y con mejor soporte de autocompletado a los endpoints de la API:

```typescript
import { http, User, Product } from "httplazy";

// Obtener todos los usuarios
const users = await http.get[User]();

// Obtener un producto por ID
const product = await http.getById[Product]("123");

// Crear un nuevo usuario
await http.post[User]({ name: "John", email: "john@example.com" });

// Actualizar un producto
await http.put[Product]({ id: "123", price: 99.99 });

// Eliminar un comentario
await http.delete[Comment]("456");
```

Los símbolos se convierten automáticamente al formato correcto para la API (por ejemplo, `User` → `users`).

También puedes crear tus propios símbolos para recursos personalizados:

```typescript
import { http, createResource } from "httplazy";

// Crear un símbolo personalizado
const ProductVariant = createResource("ProductVariant");

// Usar el recurso personalizado
const variants = await http.get[ProductVariant]();
```

Esto mejora la legibilidad del código y proporciona un mejor soporte de autocompletado en editores compatibles con TypeScript.

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

LazyHTTP returns an object with `{ data, error, status }` for all methods. This means you don't need to use try/catch blocks in your code to handle errors.

Example for a GET request:

```javascript
const response = await http.get("https://api.example.com/data");

if (response.error) {
  console.error("Error:", response.error.message);
  // If details are available, they provide additional context
  if (response.error.details) {
    console.error("Details:", response.error.details);
  }
} else {
  console.log("Data:", response.data);
}
```

Using destructuring for cleaner code:

```javascript
const { data, error, status, details } = await http.get(
  "https://api.example.com/data"
);

if (error) {
  console.error(`Error (${status}): ${error.message}`);
  if (details) {
    console.error("How to fix:", details.help);
  }
} else {
  // Work directly with the data
  console.log("User data:", data.user);
}
```

Example for a POST request:

```javascript
const response = await http.post("https://api.example.com/users", {
  name: "John",
  email: "john@example.com",
});

if (response.error) {
  console.error("Error:", response.error.message);
} else {
  console.log("User created:", response.data);
}
```

LazyHTTP can return various error types:

- HttpTimeoutError
- HttpNetworkError
- HttpInvalidURLError
- And others...

## Automatic Error Logging

LazyHTTP includes a built-in logging system that automatically logs errors. You can configure the logging behavior:

```javascript
import { httpLogger, http } from "httplazy";

// Configure the logger
httpLogger.configure({
  enabled: true, // Enable/disable logging (default: true)
  level: "error", // Log level: 'error', 'warning', 'info', 'debug' (default: 'error')
  format: "console", // Output format: 'console' or 'json' (default: 'console')
  includeRequestDetails: true, // Include request details in logs (default: true)
});

// Make a request - errors will be automatically logged
const response = await http.get("https://api.example.com/data");

// You can still handle errors in your code if needed
if (response.error) {
  // Error already logged automatically
  // Additional custom error handling
}
```

The automatic logging system:

- Color-codes error messages in console mode for better visibility
- Includes HTTP status codes, error types, and messages
- Provides detailed error context when available
- Can be disabled for production environments if needed

## Contribuir al Proyecto

¿Interesado en contribuir a httplazy? ¡Excelente! Antes de comenzar, por favor lee nuestro archivo [DEVELOPMENT.md](./DEVELOPMENT.md) que contiene información importante sobre:

- Configuración del entorno de desarrollo
- Estructura del proyecto y organización del código
- Reglas de desarrollo y mejores prácticas
- Verificaciones automáticas y hooks pre-commit
- Proceso de contribución y publicación

Seguir estas guías garantiza que el código mantenga alta calidad y consistencia, además de facilitar el proceso de revisión y aprobación de tus contribuciones.

```bash
# Configurar entorno de desarrollo rápidamente
npm run setup-dev
```

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

#### Resource Accessors con Símbolos

Los resource accessors permiten un acceso más limpio y con mejor soporte de autocompletado a los endpoints de la API:

```typescript
import { http, User, Product } from "httplazy";

// Obtener todos los usuarios
const users = await http.get[User]();

// Obtener un producto por ID
const product = await http.getById[Product]("123");

// Crear un nuevo usuario
await http.post[User]({ name: "John", email: "john@example.com" });

// Actualizar un producto
await http.put[Product]({ id: "123", price: 99.99 });

// Eliminar un comentario
await http.delete[Comment]("456");
```

Los símbolos se convierten automáticamente al formato correcto para la API (por ejemplo, `User` → `users`).

También puedes crear tus propios símbolos para recursos personalizados:

```typescript
import { http, createResource } from "httplazy";

// Crear un símbolo personalizado
const ProductVariant = createResource("ProductVariant");

// Usar el recurso personalizado
const variants = await http.get[ProductVariant]();
```

Esto mejora la legibilidad del código y proporciona un mejor soporte de autocompletado en editores compatibles con TypeScript.

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

LazyHTTP devuelve un objeto con `{ data, error, status }` para todos los métodos. Esto significa que no necesitas usar bloques try/catch en tu código para manejar errores.

Ejemplo para una petición GET:

```javascript
const response = await http.get("https://api.example.com/data");

if (response.error) {
  console.error("Error:", response.error.message);
  // Si hay detalles disponibles, proporcionan contexto adicional
  if (response.error.details) {
    console.error("Detalles:", response.error.details);
  }
} else {
  console.log("Datos:", response.data);
}
```

Usando desestructuración para un código más limpio:

```javascript
const { data, error, status, details } = await http.get(
  "https://api.example.com/data"
);

if (error) {
  console.error(`Error (${status}): ${error.message}`);
  if (details) {
    console.error("Cómo solucionarlo:", details.help);
  }
} else {
  // Trabajar directamente con los datos
  console.log("Datos del usuario:", data.user);
}
```

Ejemplo para una petición POST:

```javascript
const response = await http.post("https://api.example.com/users", {
  name: "John",
  email: "john@example.com",
});

if (response.error) {
  console.error("Error:", response.error.message);
} else {
  console.log("Usuario creado:", response.data);
}
```

LazyHTTP puede devolver varios tipos de errores:

- HttpTimeoutError
- HttpNetworkError
- HttpInvalidURLError
- Y otros...

## Registro Automático de Errores

LazyHTTP incluye un sistema de registro integrado que registra automáticamente los errores. Puedes configurar el comportamiento del registro:

```javascript
import { httpLogger, http } from "httplazy";

// Configurar el logger
httpLogger.configure({
  enabled: true, // Habilitar/deshabilitar registro (por defecto: true)
  level: "error", // Nivel de registro: 'error', 'warning', 'info', 'debug' (por defecto: 'error')
  format: "console", // Formato de salida: 'console' o 'json' (por defecto: 'console')
  includeRequestDetails: true, // Incluir detalles de la petición en los registros (por defecto: true)
});

// Realizar una petición - los errores se registrarán automáticamente
const response = await http.get("https://api.example.com/data");

// Aún puedes manejar errores en tu código si es necesario
if (response.error) {
  // El error ya ha sido registrado automáticamente
  // Manejo de errores personalizado adicional
}
```

El sistema de registro automático:

- Colorea los mensajes de error en modo consola para mejor visibilidad
- Incluye códigos de estado HTTP, tipos de error y mensajes
- Proporciona contexto detallado del error cuando está disponible
- Puede ser deshabilitado para entornos de producción si es necesario

## Resource Access with Type Notation Syntax

LazyHTTP includes a resource-oriented syntax that provides a more declarative way to interact with your API resources. This syntax uses bracket notation `http.get['ResourceName']` to make your code more readable and self-documenting.

### Using Type Notation Syntax

```typescript
import { http } from "httplazy";

// Users resource
const users = await http.get["User"]("https://api.example.com/users");
const user = await http.get["User"]("https://api.example.com/users/123");
const { data, error } = await http.get["User"](
  "https://api.example.com/users/123"
);

// Create a new user
const newUser = await http.post["User"]("https://api.example.com/users", {
  name: "Jane Doe",
  email: "jane@example.com",
});

// Update a user
await http.put["User"]("https://api.example.com/users/123", {
  name: "Jane Smith",
});

// Partially update a user
await http.patch["User"]("https://api.example.com/users/123", {
  status: "active",
});

// Delete a user
await http.delete["User"]("https://api.example.com/users/123");

// Companies resource
const companies = await http.get["Company"](
  "https://api.example.com/companies"
);
const company = await http.get["Company"](
  "https://api.example.com/companies/456"
);

// Working with relationships
const companyUsers = await http.get["User"](
  "https://api.example.com/companies/456/users"
);
```

### Benefits of Type Notation Syntax

- **Self-documenting code**: Resource names make the code more readable
- **Consistent entity naming**: Use the same resource name across your application
- **Better code navigation**: Makes it easier to search for all API calls related to a specific entity
- **Cleaner API**: All HTTP methods support this notation (get, post, put, patch, delete, getAll, getById)
