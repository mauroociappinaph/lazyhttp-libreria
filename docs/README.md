# LazyHTTP Documentation

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Advanced Features](#advanced-features)
4. [CLI Usage](#cli-usage)
5. [API Reference](#api-reference)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Installation

### Prerequisites

- Node.js 14.x or higher
- npm, yarn, or pnpm package manager

### Package Installation

```bash
# Using npm
npm install httplazy

# Using yarn
yarn add httplazy

# Using pnpm
pnpm add httplazy
```

### TypeScript Support

LazyHTTP includes TypeScript definitions out of the box. No additional installation is required.

## Basic Usage

### Simple GET Request

```typescript
import { http } from "httplazy";

// Basic GET request
const response = await http.get("https://api.example.com/data");
console.log(response.data);

// GET request with query parameters
const search = await http.get("https://api.example.com/search", {
  params: {
    q: "search term",
    page: 1,
    limit: 10,
  },
});

// GET request with headers
const response = await http.get("https://api.example.com/data", {
  headers: {
    Authorization: "Bearer token",
    "Content-Type": "application/json",
  },
});
```

### POST Request with Data

```typescript
// Basic POST request
const result = await http.post("https://api.example.com/create", {
  name: "John",
  age: 30,
});

// POST request with custom headers
const result = await http.post(
  "https://api.example.com/create",
  {
    name: "John",
    age: 30,
  },
  {
    headers: {
      "X-Custom-Header": "value",
    },
  }
);

// POST request with form data
const formData = new FormData();
formData.append("file", file);
const result = await http.post("https://api.example.com/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

### Other HTTP Methods

```typescript
// PUT request
const update = await http.put("https://api.example.com/update/1", {
  name: "John Updated"
});

// PATCH request
const patch = await http.patch("https://api.example.com/patch/1", {
  name: "John Patched"
});

// DELETE request
const delete = await http.delete("https://api.example.com/delete/1");
```

## Advanced Features

### Error Handling

```typescript
try {
  const response = await http.get("https://api.example.com/data");
} catch (error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error("Error status:", error.response.status);
    console.error("Error data:", error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error("No response received:", error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("Error setting up request:", error.message);
  }
}
```

### Retries

```typescript
// Basic retry configuration
const response = await http.get("https://api.example.com/data", {
  retries: 3,
  retryDelay: 1000,
});

// Advanced retry configuration
const response = await http.get("https://api.example.com/data", {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return error.response?.status === 429 || error.response?.status === 503;
  },
});
```

### Interceptors

```typescript
// Request interceptor
http._setupInterceptors((config) => {
  // Add timestamp to every request
  config.headers["X-Request-Time"] = new Date().toISOString();
  return config;
}, "request");

// Response interceptor
http._setupInterceptors((response) => {
  // Transform response data
  response.data = transformData(response.data);
  return response;
}, "response");

// Error interceptor
http._setupInterceptors((error) => {
  // Handle specific error cases
  if (error.response?.status === 401) {
    // Handle unauthorized
    handleUnauthorized();
  }
  return Promise.reject(error);
}, "error");
```

### Authentication

```typescript
// JWT Authentication
http.configureAuth({
  type: "jwt",
  token: "your-jwt-token",
});

// OAuth2 Authentication
http.configureAuth({
  type: "oauth2",
  clientId: "your-client-id",
  clientSecret: "your-client-secret",
  tokenEndpoint: "https://auth.example.com/token",
  scope: "read write",
});

// Basic Authentication
http.configureAuth({
  type: "basic",
  username: "user",
  password: "pass",
});

// Custom Authentication
http.configureAuth({
  type: "custom",
  getToken: async () => {
    // Custom token retrieval logic
    return "custom-token";
  },
});
```

### Caching

```typescript
// Basic cache configuration
http.configureCaching({
  enabled: true,
  ttl: 3600, // Time to live in seconds
});

// Advanced cache configuration
http.configureCaching({
  enabled: true,
  ttl: 3600,
  maxSize: 100, // Maximum number of cached items
  tags: ["users", "products"], // Cache tags for invalidation
  storage: "memory", // or "localStorage" for browser environments
});

// Cache invalidation
http.invalidateCache("users/*"); // Invalidate by pattern
http.invalidateCacheByTags(["users"]); // Invalidate by tags
```

### Metrics

```typescript
// Basic metrics configuration
http.configureMetrics({
  enabled: true,
  trackRequests: true,
  trackErrors: true,
});

// Advanced metrics configuration
http.configureMetrics({
  enabled: true,
  trackRequests: true,
  trackErrors: true,
  trackTiming: true,
  trackSize: true,
  onMetric: (metric) => {
    // Custom metric handling
    console.log("Metric:", metric);
  },
});

// Get current metrics
const metrics = http.getCurrentMetrics();
console.log("Total requests:", metrics.totalRequests);
console.log("Error rate:", metrics.errorRate);
console.log("Average response time:", metrics.avgResponseTime);
```

### Proxy Support

```typescript
// HTTP/HTTPS proxy
http.configureProxy({
  protocol: "http",
  host: "proxy.example.com",
  port: 8080,
  auth: {
    username: "user",
    password: "pass",
  },
});

// SOCKS proxy
http.configureProxy({
  protocol: "socks",
  host: "socks.example.com",
  port: 1080,
});
```

### Streaming

```typescript
// Basic streaming
const stream = await http.stream("https://api.example.com/stream");
stream.on("data", (chunk) => {
  console.log("Received chunk:", chunk);
});

// Streaming with progress
const stream = await http.stream("https://api.example.com/file", {
  onProgress: (progress) => {
    console.log(`Downloaded: ${progress.percentage}%`);
  },
});

// Streaming with custom chunk size
const stream = await http.stream("https://api.example.com/stream", {
  chunkSize: 8192, // 8KB chunks
});
```

## CLI Usage

### Basic Commands

```bash
# GET request
lazyhttp get https://api.example.com/data

# POST request
lazyhttp post https://api.example.com/create --data '{"name": "John"}'

# PUT request
lazyhttp put https://api.example.com/update/1 --data '{"name": "John"}'

# DELETE request
lazyhttp delete https://api.example.com/delete/1
```

### Options

```bash
# With headers
lazyhttp get https://api.example.com/data --headers '{"Authorization": "Bearer token"}'

# With query parameters
lazyhttp get https://api.example.com/search --params '{"q": "search term"}'

# With timeout
lazyhttp get https://api.example.com/data --timeout 5000

# With retries
lazyhttp get https://api.example.com/data --retries 3

# With authentication
lazyhttp get https://api.example.com/data --auth 'Bearer token'

# Download file
lazyhttp get https://example.com/file.pdf --output file.pdf

# Stream response
lazyhttp get https://example.com/stream --stream
```

## API Reference

### HTTP Methods

- `http.get(url, options?)`
- `http.post(url, data?, options?)`
- `http.put(url, data?, options?)`
- `http.patch(url, data?, options?)`
- `http.delete(url, options?)`

### Options

```typescript
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
  withAuth?: boolean;
  cache?: boolean | CacheOptions;
  stream?: boolean | StreamOptions;
  onProgress?: (progress: ProgressEvent) => void;
}

interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

interface StreamOptions {
  chunkSize?: number;
  onProgress?: (progress: ProgressEvent) => void;
}

interface ProgressEvent {
  loaded: number;
  total: number;
  percentage: number;
}
```

### Response Format

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
  request: any;
}

interface RequestConfig {
  url: string;
  method: string;
  baseURL: string;
  headers: Record<string, string>;
  params: Record<string, any>;
  timeout: number;
  retries: number;
  retryDelay: number;
}
```

## Best Practices

### Error Handling

- Always use try-catch blocks for error handling
- Implement proper error logging
- Use retries for transient failures
- Handle specific error cases appropriately

### Performance

- Use caching for frequently accessed data
- Implement proper timeout values
- Use streaming for large files
- Monitor metrics for performance issues

### Security

- Never store sensitive data in code
- Use environment variables for credentials
- Implement proper authentication
- Validate all input data

### TypeScript

- Use proper type definitions
- Implement interfaces for request/response data
- Use generics for type safety
- Enable strict mode

## Troubleshooting

### Common Issues

1. **Connection Timeouts**

   - Check network connectivity
   - Verify server availability
   - Adjust timeout settings

2. **Authentication Errors**

   - Verify credentials
   - Check token expiration
   - Validate authentication configuration

3. **Rate Limiting**

   - Implement proper retry strategy
   - Use caching to reduce requests
   - Monitor rate limits

4. **Memory Issues**
   - Use streaming for large responses
   - Implement proper cache size limits
   - Monitor memory usage

### Debug Mode

```typescript
// Enable debug mode
http.initialize({
  debug: true,
});

// Debug logs will be printed to console
```
