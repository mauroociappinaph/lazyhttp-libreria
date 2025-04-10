# Guía de Inicio Rápido - LazyHTTP

## Instalación

Puedes instalar LazyHTTP usando npm:

```bash
npm install lazyhttp
```

## Uso Básico

### Importación

```javascript
// Usando CommonJS
const { http } = require("lazyhttp");

// Usando ES modules
import { http } from "lazyhttp";
```

### Inicialización

Antes de usar la librería, es recomendable inicializarla:

```javascript
await http.initialize();
```

### Peticiones Básicas

#### GET

```javascript
const response = await http.get("https://api.example.com/data");

if (response.error) {
  console.error("Error:", response.error);
  return;
}

console.log("Datos:", response.data);
```

#### POST

```javascript
const userData = {
  name: "Juan",
  email: "juan@example.com",
};

const response = await http.post("https://api.example.com/users", userData);

if (response.error) {
  console.error("Error:", response.error);
  return;
}

console.log("Usuario creado:", response.data);
```

### Opciones Avanzadas

Puedes personalizar las peticiones con varias opciones:

```javascript
const options = {
  headers: {
    "X-Custom-Header": "Valor",
  },
  timeout: 5000, // 5 segundos
  retries: 3, // 3 reintentos si falla
  withAuth: true, // Incluir token de autenticación
};

const response = await http.get("https://api.example.com/protected", options);
```

## Manejo de Errores

LazyHTTP proporciona un manejo de errores robusto:

```javascript
const response = await http.get("https://api.example.com/data");

if (response.error) {
  console.error(`Error (${response.status}):`, response.error);

  // Manejar diferentes tipos de errores según el código de estado
  if (response.status === 401) {
    // Error de autenticación
  } else if (response.status === 404) {
    // Recurso no encontrado
  } else if (response.status >= 500) {
    // Error del servidor
  }

  return;
}

// Continuar con el flujo normal si no hay error
console.log("Datos:", response.data);
```

## CLI (Interfaz de Línea de Comandos)

LazyHTTP incluye una interfaz de línea de comandos:

```bash
# Instalar globalmente
npm install -g lazyhttp

# Uso básico
lazyhttp get https://jsonplaceholder.typicode.com/posts

# Con opciones
lazyhttp post https://jsonplaceholder.typicode.com/posts --data '{"title":"Ejemplo","body":"Contenido"}'

# Ayuda
lazyhttp --help
```

## Ejemplos

Consulta el directorio `/examples` para ver ejemplos completos de uso.

## Referencia de API

Para una documentación completa de la API, consulta el archivo README.md o la documentación en línea.
