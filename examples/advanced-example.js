// Ejemplo avanzado de uso de LazyHTTP
const { http } = require("../");

// Constantes para valores comunes
const BASE_URL = "https://jsonplaceholder.typicode.com";
const TIMEOUT = 5000; // 5 segundos
const RETRIES = 3;
const CUSTOM_HEADER = "LazyHTTP-Example";

// Función para realizar una petición con reintentos
async function fetchWithRetries() {
  console.log("Realizando petición con reintentos...");

  const options = {
    timeout: TIMEOUT,
    retries: RETRIES,
    headers: {
      "X-Custom-Header": CUSTOM_HEADER,
    },
  };

  const response = await http.get(`${BASE_URL}/posts`, options);

  if (response.error) {
    console.error("Error después de reintentos:", response.error);
    return;
  }

  console.log("✅ Datos obtenidos después de reintentos exitosos");
}

// Función para manejar errores avanzados
async function handleErrors() {
  console.log("Probando manejo de errores...");

  const response = await http.get(`${BASE_URL}/nonexistent`);

  if (response.error) {
    console.log("✅ Error detectado correctamente:", {
      mensaje: response.error,
      código: response.status,
    });

    switch (response.status) {
      case 404:
        console.log("Recurso no encontrado");
        break;
      case 0:
        console.log("Error de red o conexión");
        break;
      default:
        if (response.status >= 500) {
          console.log("Error del servidor");
        }
    }

    return;
  }

  console.log("Respuesta inesperada:", response);
}

// Función para realizar una petición autenticada
async function authenticatedRequest() {
  console.log("Realizando petición autenticada...");

  const options = {
    withAuth: true,
    headers: {
      "X-Custom-Header": "LazyHTTP-Auth-Example",
    },
  };

  localStorage.setItem("token", "mi-token-jwt-simulado");

  const response = await http.get(`${BASE_URL}/user/me`, options);

  localStorage.removeItem("token");

  if (response.error) {
    console.warn("Error en petición autenticada:", response.error);
    return;
  }

  console.log("✅ Respuesta de petición autenticada:", response.data);
}

// Función principal para ejecutar los ejemplos
async function runAdvancedExamples() {
  try {
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
