import { SuggestionService } from './suggestion-service-IA';

// Create the suggestion service instance
const suggestionService = new SuggestionService();

export class HttpError extends Error {
  suggestion?: string;

  static ERROR_MESSAGES: Record<string, string> = {
    TIMEOUT: 'La solicitud ha excedido el tiempo de espera',
    NETWORK: 'Error de conexión con el servidor',
    UNKNOWN: 'Error desconocido',
    ABORTED: 'La solicitud fue cancelada por timeout',
    SESSION_EXPIRED: 'La sesión ha expirado',
    AXIOS_ERROR: 'Error de conexión con AxiosError',
  };

  // Método para obtener sugerencia avanzada
  static async getSmartSuggestion(error: HttpError, request?: Request): Promise<string> {
    return await suggestionService.getSuggestion(error, request);
  }

  // Proporcionar feedback sobre una sugerencia
  static async provideSuggestionFeedback(
    error: HttpError,
    request: Request | undefined,
    suggestion: string,
    wasHelpful: boolean
  ): Promise<void> {
    await suggestionService.provideFeedback(error, request, suggestion, wasHelpful);
  }
}

export class HttpTimeoutError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.TIMEOUT) {
    super(message);
    this.name = 'HttpTimeoutError';
    this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
  }
}

export class HttpNetworkError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.NETWORK) {
    super(message);
    this.name = 'HttpNetworkError';
    this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
  }
}

export class HttpAxiosError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.AXIOS_ERROR) {
    super(message);
    this.name = 'HttpAxiosError';
    this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
  }
}

export class HttpUnknownError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.UNKNOWN) {
    super(message);
    this.name = 'HttpUnknownError';
    this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
  }
}

export class HttpAbortedError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.ABORTED) {
    super(message);
    this.name = 'HttpAbortedError';
    this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
  }
}

export class HttpAuthError extends HttpError {
  constructor(message = HttpError.ERROR_MESSAGES.SESSION_EXPIRED) {
    super(message);
    this.name = 'HttpAuthError';
    this.suggestion = 'Verifica tu conexión a internet y vuelve a intentarlo';
  }
}
