![HttpLazy Logo](documentacion/logotipo%20empresarial%20empresa%20de%20envíos%20y%20entregas%20minimalista%20con%20letra%20color%20azul%20rojo%20blanco.png)

# HttpLazy

[![npm version](https://img.shields.io/npm/v/httplazy)](https://www.npmjs.com/package/httplazy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.5+-blue)](https://www.typescriptlang.org/)
![Coverage](https://img.shields.io/badge/coverage-44%25-yellow)
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

---

### Comparative Example

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

### Summary

- **HTTPLazy** is ideal if you are looking for a minimalist, fast HTTP library with modern syntax and integrated advanced features, without sacrificing compatibility or scalability.
- It is the perfect choice for projects that require performance, clarity, and ease of maintenance, both in the frontend and backend.

---

### JWT/OAuth2 Authentication

```typescript
import { http } from 'httplazy';
http.configureAuth({ type: 'jwt', token: 'my-token' });
const { data } = await http.getAll('/users');
```

### File Upload

```typescript
const formData = new FormData();
formData.append('file', file);
const { data, error } = await http.post('/api/upload', formData);
```

### Usage in Next.js API Routes

```javascript
// app/api/products/route.js
import { http } from 'httplazy/server';

export async function GET(request) {
  const response = await http.getAll('https://api.com/products');
  return Response.json(response.data);
}
```

### Integration with React Query

```typescript
import { useQuery } from 'react-query';
import { http } from 'httplazy';
const { data, error } = useQuery(['users'], () => http.getAll('/users').then(r => r.data));
```

## 🏆 Best Practices

- Use separate instances for each API or context.
- Centralize HTTP logic in domain-specific services.
- Always handle errors with the `error` property.
- Use caching for infrequently changing data.
- Apply interceptors for logging, metrics, and authentication.
- Document your services and helpers.
- Use explicit typing in all responses.

## Frequently Asked Questions (FAQ)

### Does HTTPLazy support custom, chainable, and asynchronous middlewares (interceptors)?

Yes. HTTPLazy implements the concept of **interceptors** (request, response, and error), which function as middlewares. You can register multiple interceptors per instance; they are composable and can be asynchronous (`Promise`). This allows you to execute logic before or after each request, such as authentication, logging, metrics, etc.

Example:

```typescript
client.useInterceptor(new MyCustomInterceptor());
client.useInterceptor(new AnotherInterceptor());
```

---

### Does it automatically respond with JSON if the handler returns an object?

Yes, when you use the standard methods (`get`, `post`, etc.), if the server responds with JSON, HTTPLazy automatically parses it and exposes it as an object. The `Content-Type: application/json` header is sent by default in requests. If you implement a server, make sure your framework also responds correctly with JSON.

---

### Does HTTPLazy automatically parse query parameters and the body for JSON, x-www-form-urlencoded, and other formats?

- **Query:** Parameters (`params`) are automatically added to the URL.
- **Body:** By default, the body is serialized to JSON. For `form-data` (files), there are helpers (`upload`). For `x-www-form-urlencoded`, you must serialize it manually and set the appropriate header.

---

### Is HTTPLazy compatible with the native fetch API? Does it accept or expose Request and Response objects like in fetch?

It is not 100% compatible. HTTPLazy uses Axios internally, not the native fetch API. It does not accept or return native `Request`/`Response` objects, but the API is very similar (methods, headers, body, etc.). You can use `AbortController` to cancel requests.

---

### Does HTTPLazy have public benchmarks? Is it optimized for high concurrency or serverless environments?

- **Optimization:** HTTPLazy is lightweight (~12KB min+gzip), supports caching, automatic retries, streaming, and integrated metrics. It is compatible with serverless and high-concurrency environments (Next.js, Vercel, AWS Lambda, etc.).
- **Public Benchmarks:** Currently, there are no published benchmarks in the documentation.

---

### HTTP Methods

```javascript
import { http } from 'httplazy';

// GET Request
const { data, error } = await http.getAll('https://api.example.com/users');
if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Users:', data);
}

// POST Request with data
const response = await http.post('https://api.example.com/users', {
  name: 'Ana García',
  email: 'ana@example.com',
});

// Request with query parameters
const searchResponse = await http.getAll('https://api.example.com/search', {
  params: {
    q: 'javascript',
    page: 1,
    limit: 20,
  },
});

// Get resource by ID
const user = await http.getById('https://api.example.com/users', '123');

// Update resource (PUT)
await http.put('https://api.example.com/users/123', {
  name: 'Ana López',
});

// Partial update (PATCH)
await http.patch('https://api.example.com/users/123', {
  status: 'active',
});

// Delete resource
await http.del('https://api.example.com/users/123');
```

---

#### Response Typing and Safe Property Access

When your API response has a known structure (e.g., a login that returns a token), you can type the response so that TypeScript correctly recognizes the properties and avoids errors like:

> Property 'token' does not exist on type '{}'.ts(2339)

**Recommended Example:**

```typescript
// Define the expected type of the login response
interface LoginResponse {
  token: string;
}

// Correct usage with generic typing
const { data } = await http.post<LoginResponse>('https://fakestoreapi.com/auth/login', {
  username: 'user',
  password: 'pass',
});

const token = data?.token; // TypeScript recognizes 'token'

// Use the token in the next request
await http.get('https://fakestoreapi.com/products/1', {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Also works with chained promises:**

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

> **Note:** All main methods (`get`, `post`, etc.) of HttpLazy accept a generic type so you can type the response according to your API and take advantage of TypeScript's autocompletion and validation.

### Concurrent Requests

HttpLazy allows you to make multiple GET requests in parallel easily using the `all` method. This method receives an array of URLs and returns an array with the data from each response (omitting those that are null).

```javascript
import { http } from 'httplazy';

const urls = [
  'https://fakestoreapi.com/products/1',
  'https://fakestoreapi.com/products/2',
  'https://fakestoreapi.com/products/3',
];

const products = await http.all(urls);
console.log(products); // [product1, product2, product3]
```

- If any response has no data (`data === null`), it is omitted from the final array.
- You can pass additional options (headers, params, etc.) as a second argument.

### Initial Configuration

```javascript
// Global configuration
http.initialize({
  baseUrl: 'https://api.example.com',
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
  },
  timeout: 10000, // 10 seconds
  retries: 2, // Retry failed requests
});
```

## API Reference

### Basic Methods

| Method                                       | Description                            | Parameters                                                                                                                          |
| -------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `http.request(method, url, data?, options?)` | Generic method for any type of request | `method`: Request type (GET, POST, etc.)<br>`url`: Endpoint URL<br>`data`: Data to send (optional)<br>`options`: Additional options |
| `http.getAll(url, options?)`                 | GET request optimized for listings     | `url`: Endpoint URL<br>`options`: Additional options                                                                                |
| `http.getById(url, id, options?)`            | GET request for a specific resource    | `url`: Base URL<br>`id`: Resource identifier<br>`options`: Additional options                                                       |
| `http.post(url, data?, options?)`            | POST request                           | `url`: Endpoint URL<br>`data`: Data to send<br>`options`: Additional options                                                        |
| `http.put(url, data?, options?)`             | PUT request                            | `url`: Endpoint URL<br>`data`: Complete data to send<br>`options`: Additional options                                               |
| `http.patch(url, data?, options?)`           | PATCH request                          | `url`: Endpoint URL<br>`data`: Partial data to send<br>`options`: Additional options                                                |
| `http.del(url, options?)`                    | DELETE request                         | `url`: Endpoint URL<br>`options`: Additional options                                                                                |

### Request Options

```typescript
interface RequestOptions {
  headers?: Record<string, string>; // HTTP Headers
  params?: Record<string, any>; // Query string parameters
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
    // Present only on errors
    message: string; // Descriptive message
    code?: string; // Error code
    details?: any; // Additional details
  };
  config?: any; // Configuration used in the request
}
```

### Utility Functions

#### `formatResource(resourceName: string): string`

This utility function standardizes resource names for RESTful routes. It converts PascalCase names (e.g., "User", "ProductCategory") to lowercase and pluralizes them (e.g., "users", "productcategories"). Names already in lowercase and/or plural form are returned as is.

**Example Usage:**

```typescript
import { formatResource } from 'httplazy'; // Assuming it's re-exported from the main package

console.log(formatResource('User')); // Output: "users"
console.log(formatResource('Product')); // Output: "products"
console.log(formatResource('users')); // Output: "users"
console.log(formatResource('Category')); // Output: "categories"
console.log(formatResource('categories')); // Output: "categories"
console.log(formatResource('OrderItem')); // Output: "orderitems"
console.log(formatResource('bus')); // Output: "buses"
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

## Advanced Features

### Authentication

```javascript
// Authentication configuration
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

// Log in
const { data, error } = await http.login({
  username: 'user@example.com',
  password: 'password',
});

// Check authentication status
if (http.isAuthenticated()) {
  // Authenticated user
  const user = http.getAuthenticatedUser();
  console.log('Current user:', user);

  // Get token for manual operations
  const token = http.getAccessToken();
}

// Log out
await http.logout();
```

### Cache

```javascript
// Cache configuration
http.configureCaching({
  enabled: true,
  ttl: 300, // Time to live in seconds
  storage: 'localStorage', // 'memory', 'localStorage', 'sessionStorage'
  maxSize: 100, // Maximum number of entries (memory only)
  invalidateOnMutation: true, // Invalidate on PUT/POST/DELETE operations
});

// Manual invalidation
http.invalidateCache('/users/*'); // Invalidate using patterns
http.invalidateCacheByTags(['users']); // Invalidate by tags

// Use cache in specific requests
const { data } = await http.getAll('users', {
  cache: true, // Enable cache
  tags: ['users', 'list'], // Assign tags
});

// Specify custom TTL
await http.getAll('users', { cache: 3600 }); // 1 hour
```

### Automatic Retry with Exponential Backoff

HttpLazy incorporates an advanced automatic retry system for failed operations, especially useful in environments with unstable connectivity or intermittent services.

```javascript
// Global retry configuration
http.initialize({
  // ... other configurations ...
  retry: {
    enabled: true, // Activates automatic retries
    maxRetries: 3, // Maximum number of attempts
    initialDelay: 300, // Initial time between attempts (ms)
    backoffFactor: 2, // Exponential growth factor
    retryableStatusCodes: [408, 429, 500, 502, 503, 504], // HTTP codes to retry
    retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'], // Network errors to retry
  },
});

// Use retry in a specific request
const response = await http.getAll('https://api.example.com/data', {
  retryOptions: {
    enabled: true, // Activates retry for this request
    maxRetries: 5, // Overwrites the maximum number of attempts
    initialDelay: 500, // Overwrites the initial time
    backoffFactor: 1.5, // Overwrites the growth factor
  },
});
```

The exponential backoff mechanism progressively increases the time between attempts, calculating it with the formula:

```
wait_time = initialDelay * (backoffFactor ^ attempt_number)
```

This strategy helps prevent server overloads and improves the probability of success in adverse network conditions. HttpLazy automatically determines if an error is retryable based on the HTTP status code or the network error type.

### Interceptors

```typescript
import { httpInstance } from 'httplazy';

// Request interceptor
httpInstance.interceptors.request.use(config => {
  config.headers = config.headers || {};
  config.headers['X-Custom-Header'] = 'MyCustomValue';
  console.log('Request interceptor: final config', config);
  return config;
});

// Response interceptor
httpInstance.interceptors.response.use(
  response => {
    console.log('Response interceptor: response received', response);
    return response;
  },
  error => {
    console.error('Error interceptor:', error);
    return Promise.reject(error);
  }
);
```

---

### Global Interceptors

You can apply global interceptors in HttpLazy easily. A global interceptor is one that affects all requests made with a client instance (e.g., the `http` singleton instance).

#### Example: Global interceptor for the entire app

```typescript
import { http } from 'httplazy';
import { LoggingInterceptor } from './logging.interceptor';

// Apply the interceptor to ALL app requests
http.useInterceptor(new LoggingInterceptor());
```

All requests made with `http.get`, `http.post`, etc., will pass through that interceptor.

#### Global Interceptors per Custom Instance

If you create a custom client instance, you can have global interceptors only for that instance:

```typescript
import { HttpCore } from 'httplazy';
import { AuthInterceptor } from './auth.interceptor';

const customClient = new HttpCore.HttpCore();
customClient.useInterceptor(new AuthInterceptor());

// All requests made with customClient will have that interceptor
```

#### How to clear or replace global interceptors?

You can clear all interceptors from an instance using the internal method:

```typescript
// Clear all interceptors from the global instance
http._setupInterceptors();

// Or for a custom instance
customClient._setupInterceptors();
```

> **Note:** Interceptors are global for the instance where you add them. If you use the `http` singleton instance, the interceptor is global for the entire app. If you use multiple instances, you can have different global interceptors per context.

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

// Register custom events
http.trackActivity('page_view');
http.trackActivity('search', { query: 'term' });

// Get current metrics
const metrics = http.getCurrentMetrics();
console.log('Average response time:', metrics.avgResponseTime);
console.log('Error rate:', metrics.errorRate);
```

### Custom Logging

HttpLazy includes a modular and extensible logging system to record information from each HTTP request and response.

```typescript
import { Logger, ConsoleLoggerAdapter } from 'httplazy';

// Basic configuration
// sends logs to console
const logger = Logger.getInstance();
logger.configure({
  level: 'debug',
  adapters: [new ConsoleLoggerAdapter()],
});

logger.info('Informative message', { userId: 123 });
```

**As an HTTP interceptor:**

```typescript
import { LoggingInterceptor } from 'httplazy';

client.useInterceptor(new LoggingInterceptor());
```

- You can create your own adapters by implementing the `ILoggerAdapter` interface.
- Supports levels: debug, info, warn, error.
- Allows multiple log destinations (console, file, external services, etc.).

> See the extended documentation in `http/logging/README.md` for more details and examples.

### Streaming (Server)

```javascript
// Import from server
import { stream } from 'httplazy/server';

// Large file streaming
const fileStream = await stream('https://example.com/large-file.zip', {
  onData: chunk => {
    // Process each chunk
    const percent = (bytesReceived / totalBytes) * 100;
    updateProgressBar(percent);
  },
  onComplete: () => {
    console.log('Download complete');
  },
  onError: err => {
    console.error('Streaming error:', err);
  },
});

// Basic streaming on client
import { stream } from 'httplazy/client';

const textStream = await stream('https://api.example.com/events');
// Process stream with browser APIs
```

### Minimalist HTTP Server (Node.js)

Starting from version 2.x, you can spin up a functional HTTP server in Node.js with a single line using `HttpLazyServer`:

```typescript
import { HttpLazyServer } from 'httplazy';

const app = new HttpLazyServer();
app.start();
```

- The default port is 3000, but you can pass it as an option: `new HttpLazyServer({ port: 4000 })`.
- You can easily add routes:

```typescript
app.get('/ping', (req, res) => res.json({ ok: true }));
```

#### Development with automatic reload

`nodemon` is already integrated for development. Simply run:

```bash
npm run dev
```

This will start your server and automatically reload it whenever there are changes in your entry file (`index.js` or `index.ts`).

### Proxies (Server)

```javascript
// Import from server
import { configureProxy } from 'httplazy/server';

// Configure HTTP proxy
configureProxy({
  protocol: 'http',
  host: 'proxy.company.com',
  port: 8080,
  auth: {
    username: 'user',
    password: 'pass',
  },
});

// SOCKS Proxy
configureProxy({
  protocol: 'socks5',
  host: '127.0.0.1',
  port: 9050,
});
```

## Compatibility with Libraries Expecting Rejected Promises

Some libraries (like React Query, SWR, middlewares, etc.) expect consuming functions to return a promise that rejects in case of an error (i.e., they throw an exception). By default, HttpLazy always returns an object `{ data, error, status }` and **does not throw an exception**. You can easily adapt the behavior with a helper:

### Helper: Throw exception only if there is an error

```typescript
export function ensureSuccess<T>(response: { data: T; error?: any; status: number }): T {
  if (response.error)
    throw Object.assign(new Error(response.error.message), response.error, {
      status: response.status,
    });
  return response.data;
}
```

### Usage Example

```typescript
// Normal usage (HttpLazy pattern)
const resp = await http.getAll('/api/users');
if (resp.error) {
  // Uniform handling
  showError(resp.error.message);
}

// Usage with libraries expecting rejected promises
const data = ensureSuccess(await http.getAll('/api/users'));
// If there's an error, it's thrown as an exception and you can use try/catch or integrate it with React Query, etc.
```

> **Advantage:** This way you can maintain HttpLazy's uniform and predictable flow in your app, but throw exceptions only when you need to for external integrations, without losing any advantage of the `{ data, error }` pattern.

## Error Handling

HttpLazy provides consistent and predictable error handling:

```javascript
const { data, error, status } = await http.getAll('/api/users');

if (error) {
  // Handle by HTTP code
  if (status === 404) {
    console.error('Resource not found');
  } else if (status === 401) {
    console.error('Authentication required');
  } else if (status >= 500) {
    console.error('Server error:', error.message);
  } else {
    console.error(`Error (${status}):`, error.message);
  }

  // Additional details
  if (error.details) {
    console.error('Details:', error.details);
  }
} else {
  // Process successful data
}
```

### Common Error Types

| Code | Type                 | Common Causes                      |
| ---- | -------------------- | ---------------------------------- |
| 400  | Bad Request          | Incorrect data, failed validation  |
| 401  | Unauthorized         | Invalid or expired token           |
| 403  | Forbidden            | Insufficient permissions           |
| 404  | Not Found            | Non-existent resource              |
| 422  | Unprocessable Entity | Valid but logically incorrect data |
| 429  | Too Many Requests    | Rate limit exceeded                |
| 500  | Server Error         | Internal server error              |

### Network Error Handling

```javascript
try {
  const response = await http.getAll('/api/data');

  if (response.error) {
    // HTTP error with server response
    handleApiError(response.error);
  } else {
    processData(response.data);
  }
} catch (err) {
  // Network errors, such as disconnection or timeout
  console.error('Connection error:', err.message);
}
```

### Custom Errors

HttpLazy provides an extensible error handling system that goes beyond standard HTTP codes.

#### HttpLazy-specific error types

The library includes specialized error classes for different situations:

```javascript
// Specific errors by category
import {
  HttpError, // Base error for all HTTP errors
  NetworkError, // Connection, timeout, DNS errors
  AuthenticationError, // Authentication-related errors
  CacheError, // Cache system errors
  ValidationError, // Data validation errors
  RateLimitError, // Rate limit exceeded errors
} from 'httplazy/errors';

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
const { error } = await http.getAll('/api/users');

if (error) {
  switch (error.code) {
    case 'AUTH_EXPIRED':
      await http.refreshToken();
      // Retry request
      break;
    case 'CACHE_MISS':
      // Get from origin
      break;
    case 'RATE_LIMITED':
      // Implement exponential backoff
      break;
    case 'VALIDATION_FAILED':
      // Show validation errors
      showValidationErrors(error.details);
      break;
    default:
      // Generic handling
      showErrorMessage(error.message);
  }
}
```

| Error Code          | Description                                    | Recommended Action               |
| ------------------- | ---------------------------------------------- | -------------------------------- |
| `AUTH_EXPIRED`      | Authentication token expired                   | Refresh token and retry          |
| `AUTH_INVALID`      | Invalid token or incorrect credentials         | Redirect to login                |
| `CACHE_MISS`        | Not found in cache                             | Get from origin                  |
| `RATE_LIMITED`      | Rate limit exceeded                            | Implement exponential backoff    |
| `NETWORK_OFFLINE`   | No Internet connection                         | Show offline mode                |
| `TIMEOUT_EXCEEDED`  | Timeout exceeded                               | Retry or increase timeout        |
| `VALIDATION_FAILED` | Sent data does not meet validation             | Show specific errors to the user |
| `RESOURCE_CONFLICT` | Conflict when modifying resource (concurrency) | Reload and show differences      |

#### How to extend errors

You can create your own custom error classes that integrate with HttpLazy's system:

```javascript
// Define a custom error for your domain
import { HttpError } from 'httplazy/errors';

class PaymentDeclinedError extends HttpError {
  constructor(message, details = {}) {
    super(message, 'PAYMENT_DECLINED', 402, details);
    this.name = 'PaymentDeclinedError';

    // Add specific properties
    this.paymentId = details.paymentId;
    this.reason = details.reason;
    this.canRetry = details.canRetry || false;
  }

  // Custom methods
  suggestAlternative() {
    return this.details.alternatives || [];
  }
}

// Use with the response interceptor
http._setupInterceptors(response => {
  // Transform standard errors into custom ones
  if (response.status === 402 && response.data?.type === 'payment_error') {
    throw new PaymentDeclinedError('Payment declined', {
      paymentId: response.data.paymentId,
      reason: response.data.reason,
      canRetry: response.data.canRetry,
      alternatives: response.data.alternatives,
    });
  }
  return response;
}, 'response');

// In the application code
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

#### Advanced error handling patterns

Structure your code for consistent and maintainable error handling:

```javascript
// Pattern: Centralize error handling logic
const errorHandlers = {
  AUTH_EXPIRED: async error => {
    // Automatically refresh token
    await authService.refreshToken();
    return true; // Indicates that it can be retried
  },
  NETWORK_OFFLINE: error => {
    // Activate offline mode
    appStore.setOfflineMode(true);
    showToast('Working in offline mode');
    return false; // Do not retry automatically
  },
  RATE_LIMITED: error => {
    // Implement backoff
    const retryAfter = error.details.retryAfter || 5000;
    showToast(`Too many requests, retrying in ${retryAfter / 1000}s`);
    return new Promise(resolve => setTimeout(() => resolve(true), retryAfter));
  },
  // Other handlers...
};

// Helper function to process errors
async function processApiError(error, retryFn) {
  // Get specific code or use HTTP status as fallback
  const errorCode = error.code || `HTTP_${error.status}`;

  // Check if there is a specific handler
  if (errorHandlers[errorCode]) {
    const shouldRetry = await errorHandlers[errorCode](error);
    if (shouldRetry && retryFn) {
      return retryFn(); // Retry the operation
    }
  } else {
    // Generic handling for errors without a specific handler
    logError(error);
    showErrorMessage(error.message);
  }

  return null; // Could not handle/retry
}

// Usage in components
async function fetchUserData() {
  try {
    setLoading(true);
    const response = await userService.getAll();

    if (response.error) {
      const result = await processApiError(response.error, fetchUserData);
      if (result !== null) {
        return result; // Error handled successfully
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

This approach allows:

- Centralizing error handling logic
- Implementing automatic recovery (auto-retry, refresh token)
- Keeping business code clean, separating error logic
- Applying consistent policies throughout the application
- Easily extending with new error types

## Usage with Next.js

HttpLazy is optimized for Next.js applications, automatically managing the difference between client and server code.

### In Client Components

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
import { http } from 'httplazy/server';

export async function GET(request) {
  // Get products from an external service
  const response = await http.getAll('https://external-api.com/products');

  if (response.error) {
    return Response.json({ error: response.error.message }, { status: response.status });
  }

  return Response.json(response.data);
}
```

### In Server Actions

```javascript
// app/actions.js
'use server';
import { http } from 'httplazy/server';

export async function processPayment(formData) {
  const paymentData = {
    amount: formData.get('amount'),
    cardNumber: formData.get('cardNumber'),
    // other fields...
  };

  // Use proxy for payment API
  configureProxy({
    protocol: 'https',
    host: 'secure-proxy.company.com',
    port: 443,
  });

  const response = await http.post('https://payment-gateway.com/process', paymentData);

  return response.data;
}
```

## Best Practices

### Code Organization

Create a centralized service for your APIs:

```javascript
// lib/api.js
import { http } from 'httplazy/client';

http.initialize({
  baseUrl: '/api',
  // other configurations...
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

// export other services...
```

### Usage Patterns

1. **Response destructuring**

   ```javascript
   const { data, error, status } = await userService.getAll();
   ```

2. **Parallel promise handling**

   ```javascript
   const [users, products] = await Promise.all([userService.getAll(), productService.getAll()]);
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
           setError({ message: 'Connection error' });
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
   // Infrequently changing data
   const config = await http.getAll('/api/config', { cache: 3600 }); // 1h

   // Frequently changing data
   const notifications = await http.getAll('/api/notifications', { cache: 60 }); // 1min
   ```

2. **Selective invalidation**

   ```javascript
   // After updating a user
   await userService.update(id, userData);
   http.invalidateCacheByTags(['users']);
   ```

3. **Critical data preloading**
   ```javascript
   // Preload common data during initialization
   export async function initializeApp() {
     await Promise.all([
       http.getAll('/api/config', { cache: true }),
       http.getAll('/api/common-data', { cache: true }),
     ]);
   }
   ```

### Tests

#### How to test HTTP errors (404, 500, etc.)

To ensure your application correctly handles HTTP errors (such as 404 Not Found or 500 Internal Server Error), you can simulate these scenarios in several ways:

#### 1. Using test endpoints

Use public endpoints that always return an error:

```js
// 404 Not Found
const resp = await http.get('https://httpstat.us/404');
console.log(resp.status); // 404
console.log(resp.error); // Descriptive error message

// 500 Internal Server Error
const resp2 = await http.get('https://httpstat.us/500');
console.log(resp2.status); // 500
console.log(resp2.error); // Descriptive error message
```

#### 2. Mocking in tests

In your unit tests, you can mock the method to return a simulated error:

```js
jest.spyOn(http, 'get').mockResolvedValue({
  data: null,
  error: 'Resource not found',
  status: 404,
});
const resp = await http.get('/api/fake');
expect(resp.status).toBe(404);
expect(resp.error).toBe('Resource not found');
```

#### 3. Using local servers

You can spin up a local server that returns the desired error code for more advanced tests.

#### Recommendations

- Always check the `error` property and `status` in your tests and UI.
- Simulate both client (4xx) and server (5xx) errors to ensure full coverage.

### HTTP Request Cancellation

HttpLazy supports request cancellation using `AbortController` (in modern browsers and Node.js):

```js
const controller = new AbortController();

const promise = http.get('https://fakestoreapi.com/products', {
  signal: controller.signal,
  timeout: 5000,
});

// To cancel the request:
controller.abort();
```

- In modern Node.js and browsers, cancellation is native.
- Internally, HttpLazy adapts the mechanism for Axios/fetch depending on the environment.
- You can use it in any method: `get`, `post`, `upload`, etc.

### Headers and Request Options

The recommended and typed way to pass headers and options is:

```js
http.get('https://fakestoreapi.com/products', {
  headers: { 'X-Request-ID': '12345' },
  timeout: 5000,
});
```

- **headers**: Must be within the `headers` property.
- **timeout**: Is a top-level option.

**Not recommended:**

```js
// This may not work correctly:
http.get('https://fakestoreapi.com/products', {
  'X-Request-ID': '12345', // ❌ Will not be a header
  timeout: 5000,
});
```

> Always use the `{ headers: { ... }, timeout: ... }` structure for maximum compatibility and TypeScript autocompletion.

## Troubleshooting

### CORS Errors

If you experience CORS errors in development:

```javascript
// Local development configuration
if (process.env.NODE_ENV === 'development') {
  http.initialize({
    // other configurations...
    defaultHeaders: {
      'Content-Type': 'application/json',
      // Add CORS headers if necessary
    },
  });
}
```

### Missing Modules in Next.js Errors

If you encounter errors like "Can't resolve 'net'" in Next.js, make sure you import correctly:

```javascript
// ❌ Incorrect
import { http } from 'httplazy';

// ✅ Correct for client components
import { http } from 'httplazy/client';
```

### TypeScript Errors

If you encounter TypeScript errors related to types:

```typescript
// Explicitly import types
import { http } from 'httplazy/client';
import type { ApiResponse, RequestOptions } from 'httplazy/client';

async function fetchData(): Promise<ApiResponse<UserType[]>> {
  return http.getAll<UserType[]>('/api/users');
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
│  │  - getAll()     │    │      │  │  - getAll()     │    │
│  │  - auth, cache  │    │      │  │  - auth, cache  │    │
│  │                 │    │      │  │                 │    │
│  └────────┬────────┘    │      │  └────────┬────────┘    │
│           │             │      │           │             │
│  ┌────────▼────────┐    │      │  ┌────────▼────────┐    │
│  │                 │    │      │  │                 │    │
│  │  Implementation │    │      │  │  Implementation │    │
│  │  Browser        │    │      │  │  Node.js        │    │
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
│  Call    │--->│Interceptor │--->│  Cache     │--->│  HTTP      │--->│  API    │
│ http.getAll│    │ Request    │    │ Present?   │    │  Request   │    │  Server │
│          │    │            │    │            │    │            │    │         │
└──────────┘    └────────────┘    └─────┬──────┘    └─────┬──────┘    └────┬────┘
                                        │                 │                │
                                        │ Yes             │                │
                                        ▼                 │                │
                                 ┌────────────┐          │                │
                                 │            │          │                │
                                 │  Cached    │          │                │
                                 │  Data      │          │                │
                                 │            │          │                │
                                 └──────┬─────┘          │                │
                                        │                │                │
                                        ▼                │                │
┌──────────┐    ┌────────────┐    ┌────▼──────┐    ┌─────▼──────┐    ┌────▼────┐
│          │    │            │    │           │    │            │    │         │
│ Response │<---│Interceptor │<---│Process    │<---│  HTTP      │<---│ API     │
│ Client   │    │ Response   │    │ Errors    │    │  Response  │    │ Data    │
│          │    │            │    │           │    │            │    │         │
└──────────┘    └────────────┘    └───────────┘    └────────────┘    └─────────┘
```

## Contribution Guide

We are open to contributions to improve HttpLazy. You can contribute in several ways:

### 🤝 How to Contribute

1.  **Fork** the repository
2.  Clone your fork: `git clone ...`
3.  Create a branch: `git checkout -b my-feature`
4.  Make your changes and run tests (`npm test`)
5.  Commit following Conventional Commits
6.  Push your branch: `git push origin my-feature`
7.  Open a **Pull Request** and describe your change

> All contributions are welcome! See the [Contribution Guide](#contribution-guide) for more details.

## Specific Use Cases

### File Upload Handling

```javascript
// Basic file upload
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data, error } = await http.post('/api/upload', formData, {
    headers: {
      // Do not set Content-Type, it is automatically set with boundary
    },
  });

  return { data, error };
}

// Multiple upload with cancellation
async function uploadMultipleFiles(files) {
  const controller = new AbortController();
  const formData = new FormData();

  Array.from(files).forEach((file, index) => {
    formData.append(`file-${index}`, file);
  });

  // Button to cancel in the UI
  cancelButton.addEventListener('click', () => controller.abort());

  try {
    const { data } = await http.post('/api/upload-multiple', formData, {
      signal: controller.signal,
      timeout: 120000, // 2 minutes
      retries: 1, // One retry in case of failure
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

### Uploading multiple files in a single field

You can pass an array of paths, streams, File, or Blob to upload multiple files under the same field:

```js
// Node.js
await http.upload('https://fakestoreapi.com/upload', {
  files: ['./a.txt', './b.txt'], // multiple files in a single field
  description: 'Multiple upload',
});

// Browser
await http.upload('https://fakestoreapi.com/upload', {
  files: [file1, file2], // File or Blob
  description: 'Multiple upload',
});
```

- The field will be repeated in the FormData for each file.
- You can combine simple fields and arrays.

### Expected errors in upload

- If a file does not exist or is not valid, the response will have an error:
  - `File './nonexistent.txt' does not exist or is not a valid file (field 'file')`
- If a file exceeds the maximum allowed size:
  - `File './large.txt' exceeds the maximum allowed size (1048576 bytes)`
- The error will always come in the `error` property of the response, never as an exception (unless it is an API usage error).

### Disabling file validation (advanced cases)

You can disable file existence/size validation using the `validateFiles: false` option:

```js
await http.upload(url, fields, { validateFiles: false });
```

This is useful if you want to delegate validation to the backend or upload special streams.

### Validating maximum file size

You can limit the maximum size of each file (in bytes) using the `maxFileSize` option:

```js
await http.upload(url, fields, { maxFileSize: 1024 * 1024 }); // 1MB
```

If any file exceeds the limit, the response will have a clear error.

### Error handling example

```js
const resp = await http.upload(
  'https://api.com/upload',
  {
    file: './large.txt',
  },
  { maxFileSize: 1024 * 1024 }
);

if (resp.error) {
  console.error('Error uploading file:', resp.error);
  // Example: "File './large.txt' exceeds the maximum allowed size (1048576 bytes)"
} else {
  console.log('Upload successful:', resp.data);
}
```

### Validation and error handling in upload

The `upload` method performs automatic validations in Node.js:

- Verifies that files exist and are valid before uploading them (by default).
- Allows limiting the maximum file size with the `maxFileSize` option (in bytes).
- If a validation error occurs, **the response will have the `error` property with a descriptive message**. No unexpected exception is thrown.

#### Example: Error handling for non-existent file

```js
const resp = await http.upload('https://fakestoreapi.com/upload', {
  file: './nonexistent.txt',
  description: 'Failed attempt',
});

if (resp.error) {
  console.error('Error uploading file:', resp.error);
  // "File './nonexistent.txt' does not exist or is not a valid file (field 'file')"
}
```

#### Example: Limiting maximum file size

```js
const resp = await http.upload(
  'https://fakestoreapi.com/upload',
  {
    file: './large.txt',
  },
  { maxFileSize: 1024 * 1024 }
); // 1MB
if (resp.error) {
  // "File './large.txt' exceeds the maximum allowed size (1048576 bytes)"
}
```

#### Disabling file validation (advanced cases)

You can disable file existence/size validation using the `validateFiles: false` option:

```js
const resp = await http.upload(
  'https://fakestoreapi.com/upload',
  {
    file: './nonexistent.txt',
  },
  { validateFiles: false }
);
// Existence and size are not validated, the field is sent as is
```

#### Best practices in tests

- Mock the `post` method and the FormData helper in your tests to avoid network dependencies or real files.
- Always check the `error` property in the response to handle any failed validation.

## Comparison with Alternatives

| Feature                | HttpLazy           | Axios                | Fetch API                    |
| ---------------------- | ------------------ | -------------------- | ---------------------------- |
| **Size (approx)**      | ~12KB min+gzip     | ~14KB min+gzip       | Native                       |
| **Universal support**  | ✅ (Client/Server) | ✅                   | ✅ (Limited in Node)         |
| **TypeScript**         | ✅ Full            | ✅ Full              | Limited                      |
| **Interceptors**       | ✅                 | ✅                   | ❌ (Requires implementation) |
| **Integrated cache**   | ✅                 | ❌                   | ❌                           |
| **Cancellation**       | ✅                 | ✅                   | ✅                           |
| **Authentication**     | ✅ Integrated      | ❌ (Manual)          | ❌ (Manual)                  |
| **Streaming**          | ✅                 | ✅ (Basic)           | ✅                           |
| **Proxy**              | ✅ (Server)        | ✅                   | ❌                           |
| **Automatic retries**  | ✅ (Exponential)   | ❌ (Requires config) | ❌                           |
| **Integrated metrics** | ✅                 | ❌                   | ❌                           |

### Remaining Technical Differences from Axios

HTTPLazy covers most of Axios's modern and ergonomic features, but there are some minor technical differences:

| Feature                                   | HTTPLazy  | Axios           |
| ----------------------------------------- | --------- | --------------- |
| Automatic transformers (request/response) | ✅        | ✅              |
| File upload/download progress             | Partial\* | ✅              |
| Request cancellation (`AbortController`)  | ✅        | ✅              |
| Custom CancelToken (legacy)               | ❌        | ✅ (deprecated) |
| Low-level customizable HTTP adapter       | ❌        | ✅              |
| Support for legacy browsers (IE11+)       | ❌        | ✅              |
| Advanced query params serialization       | Basic     | Advanced        |

> \*HTTPLazy allows uploading files and canceling requests, but progress tracking may require additional manual integration.

**Why choose HTTPLazy anyway?**
HTTPLazy is optimized for modern projects, prioritizing ergonomics, performance, typing, and universal compatibility (Node.js + browser). If your project does not depend on legacy browsers or very advanced HTTP adapter customizations, HTTPLazy is a lighter, clearer, and easier-to-maintain option.

## Multiple HTTP Clients

Starting from version 2.x, you can create as many HTTP client instances as you need, each with its own configuration, headers, interceptors, or authentication. This is ideal for projects that consume multiple APIs or require different authentication contexts.

### TypeScript Example

```typescript
import { HttpCore } from 'httplazy';

// Options for the first client
const clientA = new HttpCore.HttpCore({
  baseUrl: 'https://api.companyA.com',
  defaultHeaders: {
    Authorization: 'Bearer tokenA',
    'X-App': 'A',
  },
  timeout: 8000,
});

// Options for the second client
const clientB = new HttpCore.HttpCore({
  baseUrl: 'https://api.companyB.com',
  defaultHeaders: {
    Authorization: 'Bearer tokenB',
    'X-App': 'B',
  },
  timeout: 5000,
});

// Each client is completely independent
const { data: dataA } = await clientA.getAll('/users');
const { data: dataB } = await clientB.getAll('/clients');

// You can add specific interceptors or configuration to each one
clientA.useInterceptor(new MyCustomInterceptor());
clientB.useInterceptor(new AnotherInterceptor());
```

- Each instance maintains its own state, configuration, and middlewares.
- You can use as many instances as you need in your application.
- This is equivalent to `axios.create()` but with HTTPLazy's modular and typed approach.

> **Recommendation:** If you have many APIs or contexts, consider creating a small factory to centralize client creation and avoid duplicating logic.

### HTTP Client Factory Example

If your project consumes many APIs or you need to create clients with dynamic configurations, you can centralize the logic in a factory. This avoids duplication and facilitates maintenance.

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

**Usage:**

```typescript
import { HttpClientFactory } from './lib/httpClientFactory';

const apiA = HttpClientFactory.getClient('apiA', {
  baseUrl: 'https://api.companyA.com',
  token: 'tokenA',
  timeout: 8000,
});

const apiB = HttpClientFactory.getClient('apiB', {
  baseUrl: 'https://api.companyB.com',
  token: 'tokenB',
  timeout: 5000,
});

// Independent requests
const { data: usersA } = await apiA.getAll('/users');
const { data: usersB } = await apiB.getAll('/clients');
```

- The factory ensures that each client is created only once per key.
- You can extend the logic to add interceptors, logging, etc.

---

### Advanced Example: Multiple Clients in a Real Context

Suppose you have a user microservice and a product microservice, each with different authentication and configuration:

```typescript
import { HttpCore } from 'httplazy';

// Client for user microservice
const userClient = new HttpCore.HttpCore({
  baseUrl: 'https://api.users.com',
  defaultHeaders: { Authorization: 'Bearer userToken' },
});

// Client for product microservice
const productClient = new HttpCore.HttpCore({
  baseUrl: 'https://api.products.com',
  defaultHeaders: { Authorization: 'Bearer productToken' },
});

// Get data from both services in parallel
const [users, products] = await Promise.all([
  userClient.getAll('/users'),
  productClient.getAll('/products'),
]);

console.log('Users:', users.data);
console.log('Products:', products.data);
```

This allows you to decouple the logic of each domain, maintain separate security and configuration, and scale your application cleanly and maintainably.

#### Example: Manual Interceptor for 401 Responses (Redirect to Login)

If you need to handle redirection to login manually when the server responds with a 401 (unauthorized), you can add an error interceptor like this:

```typescript
import { http } from 'httplazy';

// Error interceptor to handle 401 and redirect to login
http.interceptors.response.use(
  response => response,
  error => {
    if (error?.status === 401) {
      // Redirect to login (you can use window.location or your router)
      window.location.href = '/login';
      // Optional: clear tokens, log out, etc.
    }
    return Promise.reject(error);
  }
);
```

- This pattern is useful if you need custom logic or integration with frameworks like React Router, Next.js, etc.
- If you use the integrated configuration (`configureAuth`), automatic redirection is already supported and you don't need this interceptor.

---

## Service-Oriented Architecture (SOA)

> **HttpLazy** includes native support for exposing and consuming services under the SOA (Service Oriented Architecture) paradigm, facilitating the creation of microservices and the communication between decoupled systems.

### What is SOA in HttpLazy?

- Allows defining and publishing services (remote methods) on a Node.js server in a typed and modular way.
- Clients can consume these services transparently, with TypeScript typing and uniform error handling.
- Ideal for distributed architectures, microservices, or integration between heterogeneous systems.

### Advantages

- **Decoupling:** Services are exposed and consumed by name, not by rigid HTTP routes.
- **Batching:** Allows grouping multiple service calls into a single request (network optimization).
- **Typing:** Clear and reusable contracts between client and server.
- **Extensible:** You can add/remove services on the fly.

### Example: Creating an SOA Server

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

### Example: Consuming SOA Services from a Client

```typescript
import { createSoaClient } from 'httplazy/client';

const client = createSoaClient({
  serviceUrl: 'http://localhost:4000/services',
});

const result = await client.callService('math', 'sum', [2, 3]);
console.log(result); // 5

// Batch call
const results = await client.callBatch([
  { serviceName: 'math', method: 'sum', params: [1, 2] },
  { serviceName: 'math', method: 'multiply', params: [3, 4] },
]);
console.log(results); // [3, 12]
```

### Available SOA API

- `createSoaServer(config)`: Creates and exposes services on the server.
- `createSoaClient(config)`: Allows consuming remote services.
- `callService(serviceName, method, params, options?)`: Calls a remote method.
- `callBatch(calls, options?)`: Calls multiple methods in a single request.
- `getServiceDefinition(serviceName)`: Gets the definition of a service.
- `addService(name, implementation)`: Adds a service on the fly (server).
- `removeService(name)`: Removes a service (server).

### Notes and Recommendations

- The default endpoint is `/services` (configurable).
- Supports CORS and advanced configuration.
- The client can use authentication and custom headers.
- Ideal for microservices, gateways, and distributed systems.

> See the extended documentation or source code for more advanced examples and integration patterns.

### Minimalist HTTP Server (Node.js)

A partir de la versión 2.x, you can spin up a functional HTTP server in Node.js with a single line using `HttpLazyServer`:

```typescript
import { HttpLazyServer } from 'httplazy';

const app = new HttpLazyServer();
app.start();
```

- The default port is 3000, but you can pass it as an option: `new HttpLazyServer({ port: 4000 })`.
- You can easily add routes:

```typescript
app.get('/ping', (req, res) => res.json({ ok: true }));
```

#### Development with automatic reload

`nodemon` is already integrated for development. Simply run:

```bash
npm run dev
```

This will start your server and automatically reload it whenever there are changes in your entry file (`index.js` or `index.ts`).

### Generating cURL Commands (generateCurl Utility)

You can easily generate a ready-to-use cURL command for any HTTP request using the `generateCurl` utility. This is especially useful for debugging, sharing, or reproducing requests outside your app.

**How to use:**

```typescript
import { generateCurl } from 'httplazy';

const curlCommand = generateCurl({
  method: 'post',
  url: 'https://api.example.com/data',
  headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
  body: { foo: 'bar' },
});

console.log(curlCommand);
// Output:
// curl -X POST -H 'Content-Type: application/json' -H 'Authorization: Bearer token' --data '{"foo":"bar"}' 'https://api.example.com/data'
```
