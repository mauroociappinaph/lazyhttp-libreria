// Ejemplo avanzado de uso de LazyHTTP
const { http } = require("../");

// Ejemplo de uso con reintentos y tiempo de espera personalizado
async function fetchWithRetries() {
  console.log("Realizando petición con reintentos...");

  // Definir opciones avanzadas
  const options = {
    timeout: 5000, // 5 segundos de timeout
    retries: 3, // Hasta 3 reintentos
    headers: {
      "X-Custom-Header": "LazyHTTP-Example",
    },
  };

  const response = await http.get(
    "https://jsonplaceholder.typicode.com/posts",
    options
  );

  if (response.error) {
    console.error("Error después de reintentos:", response.error);
    return;
  }

  console.log(`✅ Datos obtenidos después de reintentos exitosos`);
}

// Ejemplo de manejo de errores avanzado
async function handleErrors() {
  console.log("Probando manejo de errores...");

  // URL inexistente para provocar un error
  const response = await http.get(
    "https://jsonplaceholder.typicode.com/nonexistent"
  );

  // Comprobar el error y su tipo
  if (response.error) {
    console.log("✅ Error detectado correctamente:", {
      mensaje: response.error,
      código: response.status,
    });

    // El código status puede ayudar a identificar el tipo de error
    if (response.status === 404) {
      console.log("Recurso no encontrado");
    } else if (response.status >= 500) {
      console.log("Error del servidor");
    } else if (response.status === 0) {
      console.log("Error de red o conexión");
    }

    return;
  }

  console.log("Respuesta inesperada:", response);
}

// Ejemplo con autenticación
async function authenticatedRequest() {
  console.log("Realizando petición autenticada...");

  // Definir opciones con autenticación
  const options = {
    withAuth: true, // Esto añadirá el token automáticamente
    headers: {
      "X-Custom-Header": "LazyHTTP-Auth-Example",
    },
  };

  // Simulación: normalmente establecerías el token con localStorage
  // En este ejemplo solo mostramos el concepto
  localStorage.setItem("token", "mi-token-jwt-simulado");

  const response = await http.get(
    "https://jsonplaceholder.typicode.com/user/me",
    options
  );

  // Limpiar después del ejemplo
  localStorage.removeItem("token");

  if (response.error) {
    console.warn("Error en petición autenticada:", response.error);
    return;
  }

  console.log("✅ Respuesta de petición autenticada:", response.data);
}

// Ejecutar los ejemplos
async function runAdvancedExamples() {
  try {
    // Inicializar antes de usar
    await http.initialize();

    await fetchWithRetries();
    await handleErrors();
    await authenticatedRequest();

    console.log("¡Todos los ejemplos avanzados completados!");
  } catch (error) {
    console.error("Error al ejecutar ejemplos avanzados:", error);
  }
}

// Simulación de localStorage para Node.js
if (typeof localStorage === "undefined") {
  global.localStorage = {
    _data: {},
    setItem(id, val) {
      this._data[id] = String(val);
    },
    getItem(id) {
      return this._data[id] || null;
    },
    removeItem(id) {
      delete this._data[id];
    },
    clear() {
      this._data = {};
    },
  };
}

runAdvancedExamples();
