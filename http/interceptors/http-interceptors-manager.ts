import { setupInterceptors } from './http-helpers';

/**
 * Clase para gestionar los interceptores de peticiones y respuestas
 */
export class InterceptorsManager {
  private requestInterceptors: Array<(config: any) => any> = [];
  private responseInterceptors: Array<(response: any) => any> = [];

  /**
   * Configura o añade un interceptor
   * @param interceptor Función interceptora
   * @param type Tipo de interceptor ('request' | 'response')
   */
  setupInterceptors(interceptor?: any, type?: 'request' | 'response'): void {
    // Si no hay parámetros, reiniciar los arrays
    if (!interceptor && !type) {
      this.requestInterceptors = [];
      this.responseInterceptors = [];
      setupInterceptors();
      return;
    }

    // Añadir el interceptor al array apropiado
    if (type === 'request') {
      this.requestInterceptors.push(interceptor);
    } else if (type === 'response') {
      this.responseInterceptors.push(interceptor);
    }

    // Aplicar los interceptores actualizados
    this.applyInterceptors();
  }

  /**
   * Aplica todos los interceptores configurados
   */
  private applyInterceptors(): void {
    setupInterceptors();

    // Aquí podríamos añadir código para aplicar los interceptores
    // a la instancia de axios u otro cliente HTTP
  }

  /**
   * Devuelve los interceptores de peticiones
   */
  getRequestInterceptors(): Array<(config: any) => any> {
    return this.requestInterceptors;
  }

  /**
   * Devuelve los interceptores de respuestas
   */
  getResponseInterceptors(): Array<(response: any) => any> {
    return this.responseInterceptors;
  }
}

// Exportar una instancia única
export const interceptorsManager = new InterceptorsManager();
