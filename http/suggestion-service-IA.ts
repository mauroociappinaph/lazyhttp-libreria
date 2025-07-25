import { ErrorInfo } from "./types/error.types";

export class SuggestionService {
  private serviceUrl: string = "http://localhost:8000";
  private enabled: boolean = false;

  constructor(serviceUrl?: string) {
    if (serviceUrl) {
      this.serviceUrl = serviceUrl;
    }
  }

  async enable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serviceUrl}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error_type: "HttpUnknownError",
          status_code: 0,
        }),
      });

      if (response.ok) {
        this.enabled = true;
        return true;
      }

      return false;
    } catch {
      console.warn("Suggestion service not available");
      return false;
    }
  }

  async getSuggestion(
    error: ErrorInfo & {
      name?: string;
      status?: number;
      suggestion?: string;
      message?: string;
    },
    request?: Request
  ): Promise<string> {
    if (!this.enabled) {
      return error.suggestion || "Verifica tu conexión a internet";
    }

    try {
      const errorInfo: ErrorInfo = {
        error_type: error.name || "HttpUnknownError",
        status_code: error.status || 0,
        message: error.message,
        method: request?.method,
        url_pattern: request?.url,
      };

      const response = await fetch(`${this.serviceUrl}/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorInfo),
      });

      if (response.ok) {
        const data = await response.json();
        return data.suggestion;
      }
    } catch {
      // Silenciar errores
    }

    return error.suggestion || "Verifica tu conexión a internet";
  }

  async provideFeedback(
    error: ErrorInfo & { name?: string; status?: number; message?: string },
    request: Request | undefined,
    suggestion: string,
    wasHelpful: boolean
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const feedbackData = {
        error_type: error.name || "HttpUnknownError",
        status_code: error.status || 0,
        url_pattern: request?.url,
        method: request?.method,
        message: error.message,
        suggestion,
        was_helpful: wasHelpful,
      };

      await fetch(`${this.serviceUrl}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });
    } catch {
      // Silenciar errores
    }
  }
}

// Instancia global
export const suggestionService = new SuggestionService();
