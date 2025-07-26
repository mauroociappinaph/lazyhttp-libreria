/**
 * Datos de respuesta de error de la API
 */
export interface ErrorResponse {
  message?: string;
  code?: string;
}

/**
 * Detalles de un error HTTP
 */
export interface ErrorDetails {
  /**
   * Descripción detallada del error
   */
  description: string;

  /**
   * Causa probable del error
   */
  cause: string;

  /**
   * Pasos para resolver el error
   */
  solution: string;

  /**
   * Ejemplo de código para evitar o manejar el error
   */
  example?: string;
}

export class HttpError extends Error {
  suggestion?: string;
  details?: ErrorDetails;

  static ERROR_MESSAGES: Record<string, string> = {
    TIMEOUT: "La solicitud ha excedido el tiempo de espera",
    NETWORK: "Error de conexión con el servidor",
    UNKNOWN: "Error desconocido",
    ABORTED: "La solicitud fue cancelada por timeout",
    SESSION_EXPIRED: "La sesión ha expirado",
    AXIOS_ERROR: "Error de conexión con AxiosError",
  };
}

export interface ErrorInfo {
  error_type: string;
  status_code?: number;
  url_pattern?: string;
  method?: string;
  message?: string;
}
