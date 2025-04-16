# Documentación de LazyHTTP

## Índice de Contenidos

1. [Instalación](#instalación)
2. [Uso Básico](#uso-básico)
3. [Características Avanzadas](#características-avanzadas)
4. [Uso de CLI](#uso-de-cli)
5. [Referencia de API](#referencia-de-api)
6. [Mejores Prácticas](#mejores-prácticas)
7. [Solución de Problemas](#solución-de-problemas)

## Instalación

### Prerrequisitos

- Node.js 14.x o superior
- Gestor de paquetes npm, yarn o pnpm

### Instalación del Paquete

```bash
# Usando npm
npm install httplazy

# Usando yarn
yarn add httplazy

# Usando pnpm
pnpm add httplazy
```

### Soporte de TypeScript

LazyHTTP incluye definiciones de TypeScript listas para usar. No se requiere instalación adicional.

## Uso Básico

### Solicitud GET Simple

```typescript
import { http } from "httplazy";

// Solicitud GET básica
const response = await http.get("https://api.example.com/data");
console.log(response.data);

// Solicitud GET con parámetros de consulta
const search = await http.get("https://api.example.com/search", {
  params: {
    q: "término de búsqueda",
    page: 1,
    limit: 10,
  },
});

// Solicitud GET con encabezados
const response = await http.get("https://api.example.com/data", {
  headers: {
    Authorization: "Bearer token",
    "Content-Type": "application/json",
  },
});
```

### Solicitud POST con Datos

```typescript
// Solicitud POST básica
const result = await http.post("https://api.example.com/create", {
  name: "John",
  age: 30,
});

// Solicitud POST con encabezados personalizados
const result = await http.post(
  "https://api.example.com/create",
  {
    name: "John",
    age: 30,
  },
  {
    headers: {
      "X-Custom-Header": "valor",
    },
  }
);

// Solicitud POST con datos de formulario
const formData = new FormData();
formData.append("file", file);
const result = await http.post("https://api.example.com/upload", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

### Otros Métodos HTTP

```typescript
// Solicitud PUT
const update = await http.put("https://api.example.com/update/1", {
  name: "John Actualizado"
});

// Solicitud PATCH
const patch = await http.patch("https://api.example.com/patch/1", {
  name: "John Parcialmente Actualizado"
});

// Solicitud DELETE
const delete = await http.delete("https://api.example.com/delete/1");
```

## Características Avanzadas

### Manejo de Errores

```typescript
try {
  const response = await http.get("https://api.example.com/data");
} catch (error) {
  if (error.response) {
    // La solicitud fue realizada y el servidor respondió con un código de estado
    // que está fuera del rango de 2xx
    console.error("Estado del error:", error.response.status);
    console.error("Datos del error:", error.response.data);
  } else if (error.request) {
    // La solicitud fue realizada pero no se recibió respuesta
    console.error("No se recibió respuesta:", error.request);
  } else {
    // Algo sucedió en la configuración de la solicitud que provocó un Error
    console.error("Error al configurar la solicitud:", error.message);
  }
}
```

### Reintentos

```typescript
// Configuración básica de reintentos
const response = await http.get("https://api.example.com/data", {
  retries: 3,
  retryDelay: 1000,
});

// Configuración avanzada de reintentos
const response = await http.get("https://api.example.com/data", {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return error.response?.status === 429 || error.response?.status === 503;
  },
});
```

### Interceptores

```typescript
// Interceptor de solicitud
http._setupInterceptors((config) => {
  // Agregar marca de tiempo a cada solicitud
  config.headers["X-Request-Time"] = new Date().toISOString();
  return config;
}, "request");

// Interceptor de respuesta
http._setupInterceptors((response) => {
  // Transformar datos de respuesta
  response.data = transformData(response.data);
  return response;
}, "response");

// Interceptor de error
http._setupInterceptors((error) => {
  // Manejar casos específicos de error
  if (error.response?.status === 401) {
    // Manejar no autorizado
    handleUnauthorized();
  }
  return Promise.reject(error);
}, "error");
```

### Autenticación

```typescript
// Autenticación JWT
http.configureAuth({
  type: "jwt",
  token: "tu-jwt-token",
});

// Autenticación OAuth2
http.configureAuth({
  type: "oauth2",
  clientId: "tu-client-id",
  clientSecret: "tu-client-secret",
  tokenEndpoint: "https://auth.example.com/token",
  scope: "read write",
});

// Autenticación Básica
http.configureAuth({
  type: "basic",
  username: "usuario",
  password: "contraseña",
});

// Autenticación Personalizada
http.configureAuth({
  type: "custom",
  getToken: async () => {
    // Lógica personalizada de obtención de token
    return "token-personalizado";
  },
});
```

### Caché

```typescript
// Configuración básica de caché
http.configureCaching({
  enabled: true,
  ttl: 3600, // Tiempo de vida en segundos
});

// Configuración avanzada de caché
http.configureCaching({
  enabled: true,
  ttl: 3600,
  maxSize: 100, // Número máximo de elementos en caché
  tags: ["usuarios", "productos"], // Etiquetas de caché para invalidación
  storage: "memory", // o "localStorage" para entornos de navegador
});

// Invalidación de caché
http.invalidateCache("usuarios/*"); // Invalidar por patrón
http.invalidateCacheByTags(["usuarios"]); // Invalidar por etiquetas
```

### Métricas

```typescript
// Configuración básica de métricas
http.configureMetrics({
  enabled: true,
  trackRequests: true,
  trackErrors: true,
});

// Configuración avanzada de métricas
http.configureMetrics({
  enabled: true,
  trackRequests: true,
  trackErrors: true,
  trackTiming: true,
  trackSize: true,
  onMetric: (metric) => {
    // Manejo personalizado de métricas
    console.log("Métrica:", metric);
  },
});

// Obtener métricas actuales
const metrics = http.getCurrentMetrics();
console.log("Total de solicitudes:", metrics.totalRequests);
console.log("Tasa de error:", metrics.errorRate);
console.log("Tiempo promedio de respuesta:", metrics.avgResponseTime);
```

### Soporte de Proxy

```typescript
// Proxy HTTP/HTTPS
http.configureProxy({
  protocol: "http",
  host: "proxy.example.com",
  port: 8080,
  auth: {
    username: "usuario",
    password: "contraseña",
  },
});

// Proxy SOCKS
http.configureProxy({
  protocol: "socks",
  host: "socks.example.com",
  port: 1080,
});
```

### Streaming

```typescript
// Streaming básico
const stream = await http.stream("https://api.example.com/stream");
stream.on("data", (chunk) => {
  console.log("Chunk recibido:", chunk);
});

// Streaming con progreso
const stream = await http.stream("https://api.example.com/file", {
  onProgress: (progress) => {
    console.log(`Descargado: ${progress.percentage}%`);
  },
});

// Streaming con tamaño de chunk personalizado
const stream = await http.stream("https://api.example.com/stream", {
  chunkSize: 8192, // Chunks de 8KB
});
```

## Uso de CLI

### Comandos Básicos

```bash
# Solicitud GET
lazyhttp get https://api.example.com/data

# Solicitud POST
lazyhttp post https://api.example.com/create --data '{"name": "John"}'

# Solicitud PUT
lazyhttp put https://api.example.com/update/1 --data '{"name": "John"}'

# Solicitud DELETE
lazyhttp delete https://api.example.com/delete/1
```

### Opciones

```bash
# Con encabezados
lazyhttp get https://api.example.com/data --headers '{"Authorization": "Bearer token"}'

# Con parámetros de consulta
lazyhttp get https://api.example.com/search --params '{"q": "término de búsqueda"}'

# Con timeout
lazyhttp get https://api.example.com/data --timeout 5000

# Con reintentos
lazyhttp get https://api.example.com/data --retries 3

# Con autenticación
lazyhttp get https://api.example.com/data --auth 'Bearer token'

# Descargar archivo
lazyhttp get https://example.com/file.pdf --output file.pdf

# Stream de respuesta
lazyhttp get https://example.com/stream --stream
```

## Referencia de API

### Métodos HTTP

- `http.get(url, options?)`
- `http.post(url, data?, options?)`
- `http.put(url, data?, options?)`
- `http.patch(url, data?, options?)`
- `http.delete(url, options?)`

### Opciones

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

### Formato de Respuesta

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

## Mejores Prácticas

### Manejo de Errores

- Siempre usar bloques try-catch para el manejo de errores
- Implementar registro de errores adecuado
- Usar reintentos para fallos transitorios
- Manejar casos específicos de error apropiadamente

### Rendimiento

- Usar caché para datos frecuentemente accedidos
- Implementar valores de timeout apropiados
- Usar streaming para archivos grandes
- Monitorear métricas para problemas de rendimiento

### Seguridad

- Nunca almacenar datos sensibles en el código
- Usar variables de entorno para credenciales
- Implementar autenticación adecuada
- Validar todos los datos de entrada

### TypeScript

- Usar definiciones de tipos apropiadas
- Implementar interfaces para datos de solicitud/respuesta
- Usar genéricos para seguridad de tipos
- Habilitar modo estricto

## Solución de Problemas

### Problemas Comunes

1. **Timeouts de Conexión**

   - Verificar conectividad de red
   - Verificar disponibilidad del servidor
   - Ajustar configuración de timeout

2. **Errores de Autenticación**

   - Verificar credenciales
   - Verificar expiración de token
   - Validar configuración de autenticación

3. **Limitación de Tasa**

   - Implementar estrategia de reintento adecuada
   - Usar caché para reducir solicitudes
   - Monitorear límites de tasa

4. **Problemas de Memoria**
   - Usar streaming para respuestas grandes
   - Implementar límites de tamaño de caché apropiados
   - Monitorear uso de memoria

### Modo Debug

```typescript
// Habilitar modo debug
http.initialize({
  debug: true,
});

// Los logs de debug se imprimirán en la consola
```

## Acceso a Recursos con Notación de Tipo

LazyHTTP incluye una sintaxis orientada a recursos que proporciona una manera más declarativa de interactuar con los recursos de tu API. Esta sintaxis utiliza la notación de corchetes `http.get['NombreRecurso']` para hacer que tu código sea más legible y autodocumentado.

### Uso de la Notación de Tipo

```typescript
import { http } from "httplazy";

// Recurso de Usuarios
const usuarios = await http.get["Usuario"]("https://api.ejemplo.com/usuarios");
const usuario = await http.get["Usuario"](
  "https://api.ejemplo.com/usuarios/123"
);
const { data, error } = await http.get["Usuario"](
  "https://api.ejemplo.com/usuarios/123"
);

// Crear un nuevo usuario
const nuevoUsuario = await http.post["Usuario"](
  "https://api.ejemplo.com/usuarios",
  {
    nombre: "María García",
    email: "maria@ejemplo.com",
  }
);

// Actualizar un usuario
await http.put["Usuario"]("https://api.ejemplo.com/usuarios/123", {
  nombre: "María Rodríguez",
});

// Actualizar parcialmente un usuario
await http.patch["Usuario"]("https://api.ejemplo.com/usuarios/123", {
  estado: "activo",
});

// Eliminar un usuario
await http.delete["Usuario"]("https://api.ejemplo.com/usuarios/123");

// Recurso de Empresas
const empresas = await http.get["Empresa"]("https://api.ejemplo.com/empresas");
const empresa = await http.get["Empresa"](
  "https://api.ejemplo.com/empresas/456"
);

// Trabajando con relaciones
const usuariosEmpresa = await http.get["Usuario"](
  "https://api.ejemplo.com/empresas/456/usuarios"
);
```

### Beneficios de la Notación de Tipo

- **Código autodocumentado**: Los nombres de recursos hacen que el código sea más legible
- **Nomenclatura consistente de entidades**: Usa el mismo nombre de recurso en toda tu aplicación
- **Mejor navegación de código**: Facilita la búsqueda de todas las llamadas a la API relacionadas con una entidad específica
- **API más limpia**: Todos los métodos HTTP admiten esta notación (get, post, put, patch, delete, getAll, getById)
