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

| Feature               | HttpLazy           | Axios                | Fetch API                    |
| --------------------- | ------------------ | -------------------- | ---------------------------- |
| **Size (approx)**     | ~12KB min+gzip     | ~14KB min+gzip       | Native                       |
| **Universal support** | ✅ (Client/Server) | ✅                   | ✅ (Limited in Node)         |
| **TypeScript**        | ✅ Complete        | ✅ Complete          | Limited                      |
| **Interceptors**      | ✅                 | ✅                   | ❌ (Requires implementation) |
| **Integrated cache**  | ✅                 | ❌                   | ❌                           |
| **Cancellation**      | ✅                 | ✅                   | ✅                           |
| **Authentication**    | ✅ Built-in        | ❌ (Manual)          | ❌ (Manual)                  |
| **Streaming support** | ✅                 | ✅ (Basic)           | ✅                           |
| **Proxy support**     | ✅ (Server)        | ✅                   | ❌                           |
| **Auto-retries**      | ✅ (Exponential)   | ❌ (Requires config) | ❌                           |
| **Built-in metrics**  | ✅                 | ❌                   | ❌                           |

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
