import { SuggestionService } from "./suggestion-service-IA";
import { ErrorDetails } from "./types/error.types";

// Create the suggestion service instance
const suggestionService = new SuggestionService();

export class HttpError extends Error {
  suggestion?: string;
  details?: ErrorDetails;
  error_type: string;

  static ERROR_MESSAGES: Record<string, string> = {
    TIMEOUT: "La solicitud ha excedido el tiempo de espera",
    NETWORK: "Error de conexión con el servidor",
    UNKNOWN: "Error desconocido",
    ABORTED: "La solicitud fue cancelada por timeout",
    SESSION_EXPIRED: "La sesión ha expirado",
    AXIOS_ERROR: "Error de conexión con AxiosError",
  };

  constructor(message?: string) {
    super(message);
    this.error_type = this.name;
  }

  // Método para obtener sugerencia avanzada
  static async getSmartSuggestion(
    error: HttpError,
    request?: Request
  ): Promise<string> {
    return await suggestionService.getSuggestion(error, request);
  }

  // Proporcionar feedback sobre una sugerencia
  static async provideSuggestionFeedback(
    error: HttpError,
    request: Request | undefined,
    suggestion: string,
    wasHelpful: boolean
  ): Promise<void> {
    await suggestionService.provideFeedback(
      error,
      request,
      suggestion,
      wasHelpful
    );
  }
}

export class HttpTimeoutError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.TIMEOUT) {
    super(message);
    this.name = "HttpTimeoutError";
    this.error_type = this.name;
    this.suggestion = "Verifica tu conexión a internet y vuelve a intentarlo";
    this.details = {
      description: "La solicitud ha excedido el tiempo de espera configurado",
      cause:
        "El servidor no respondió dentro del tiempo límite especificado. Esto puede ocurrir por problemas de red, servidor sobrecargado o timeout configurado muy bajo.",
      solution:
        "1. Verifica tu conexión a internet\n2. Aumenta el timeout en la configuración\n3. Verifica si el servidor está respondiendo",
      example: `
// Ejemplo de configuración con timeout personalizado
const http = new Http({
  timeout: 10000 // 10 segundos
});

// También puedes configurar el timeout por petición
const response = await http.get('https://api.example.com/data', {
  timeout: 5000 // 5 segundos para esta petición específica
});
      `,
    };
  }
}

export class HttpNetworkError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.NETWORK) {
    super(message);
    this.name = "HttpNetworkError";
    this.error_type = this.name;
    this.suggestion = "Verifica tu conexión a internet y vuelve a intentarlo";
    this.details = {
      description: "No se pudo establecer conexión con el servidor",
      cause:
        "Problemas de conectividad, servidor no disponible, DNS no resuelto o firewall bloqueando la conexión.",
      solution:
        "1. Verifica tu conexión a internet\n2. Comprueba que el servidor esté en línea\n3. Verifica la URL y el dominio\n4. Revisa la configuración de tu firewall",
      example: `
// Ejemplo de manejo de errores de red
try {
  const response = await http.get('https://api.example.com/data');
  // Procesar respuesta
} catch (error) {
  if (error instanceof HttpNetworkError) {
    console.error('Error de red:', error.details?.description);
    console.log('Solución sugerida:', error.details?.solution);
  }
}
      `,
    };
  }
}

export class HttpAxiosError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.AXIOS_ERROR) {
    super(message);
    this.name = "HttpAxiosError";
    this.error_type = this.name;
    this.suggestion = "Verifica tu conexión a internet y vuelve a intentarlo";
    this.details = {
      description: "Error en la petición HTTP realizada con Axios",
      cause:
        "Problemas con la configuración de Axios, formato de datos incorrecto, o respuesta del servidor no válida.",
      solution:
        "1. Verifica la configuración de la petición\n2. Revisa el formato de los datos enviados\n3. Comprueba los headers y el tipo de contenido",
      example: `
// Ejemplo de configuración correcta de Axios
const http = new Http({
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  validateStatus: (status) => status < 500 // Acepta respuestas con status < 500
});
      `,
    };
  }
}

export class HttpUnknownError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.UNKNOWN) {
    super(message);
    this.name = "HttpUnknownError";
    this.error_type = this.name;
    this.suggestion = "Verifica tu conexión a internet y vuelve a intentarlo";
    this.details = {
      description: "Error desconocido durante la petición HTTP",
      cause:
        "Error no categorizado o inesperado durante la ejecución de la petición.",
      solution:
        "1. Revisa los logs para más detalles\n2. Verifica la configuración general\n3. Comprueba la compatibilidad de versiones",
      example: `
// Ejemplo de manejo de errores desconocidos
try {
  const response = await http.get('https://api.example.com/data');
} catch (error) {
  if (error instanceof HttpUnknownError) {
    console.error('Error desconocido:', error.message);
    console.log('Detalles:', error.details);
  }
}
      `,
    };
  }
}

export class HttpAbortedError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.ABORTED) {
    super(message);
    this.name = "HttpAbortedError";
    this.error_type = this.name;
    this.suggestion = "Verifica tu conexión a internet y vuelve a intentarlo";
    this.details = {
      description: "La petición fue cancelada antes de completarse",
      cause:
        "La petición fue abortada manualmente o por timeout, o el usuario navegó a otra página.",
      solution:
        "1. Verifica si la petición fue cancelada intencionalmente\n2. Aumenta el timeout si es necesario\n3. Implementa reintentos automáticos",
      example: `
// Ejemplo de petición con control de aborto
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 5000);

try {
  const response = await http.get('https://api.example.com/data', {
    signal: controller.signal
  });
  clearTimeout(timeoutId);
} catch (error) {
  if (error instanceof HttpAbortedError) {
    console.log('Petición cancelada:', error.details?.description);
  }
}
      `,
    };
  }
}

export class HttpAuthError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.SESSION_EXPIRED) {
    super(message);
    this.name = "HttpAuthError";
    this.error_type = this.name;
    this.suggestion = "Verifica tu conexión a internet y vuelve a intentarlo";
    this.details = {
      description: "Error de autenticación o sesión expirada",
      cause:
        "Token de autenticación inválido, expirado o falta de credenciales necesarias.",
      solution:
        "1. Verifica que las credenciales sean correctas\n2. Renueva el token de autenticación\n3. Comprueba los permisos del usuario",
      example: `
// Ejemplo de configuración con autenticación
const http = new Http({
  auth: {
    username: 'usuario',
    password: 'contraseña'
  }
});

// O con token
const http = new Http({
  headers: {
    'Authorization': 'Bearer tu-token-aqui'
  }
});
      `,
    };
  }
}
