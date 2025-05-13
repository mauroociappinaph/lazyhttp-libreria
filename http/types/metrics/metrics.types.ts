/**
 * Tipos para métricas y telemetría
 */

/**
 * Métricas de sesión
 */
export interface SessionMetrics {
  /**
   * Tiempo de inicio de la sesión (timestamp)
   */
  loginTime: number;

  /**
   * Última actividad registrada (timestamp)
   */
  lastActivity: number;

  /**
   * Tiempo total acumulado en esta sesión (en ms)
   */
  activeTime: number;

  /**
   * Tiempo de cierre de sesión, si está disponible
   */
  logoutTime?: number;

  /**
   * Número de solicitudes HTTP realizadas
   */
  requestCount: number;

  /**
   * Mapa de tipos de actividades y sus conteos
   * Ejemplo: { 'click': 5, 'form_submit': 2 }
   */
  activities: Record<string, number>;

  /**
   * Rutas visitadas durante la sesión
   */
  visitedRoutes: string[];

  /**
   * ID de sesión único
   */
  sessionId: string;
}

/**
 * Configuración para el sistema de métricas
 */
export interface MetricsConfig {
  /**
   * Si las métricas están habilitadas
   */
  enabled: boolean;

  /**
   * URL del endpoint para enviar métricas
   */
  endpoint?: string;

  /**
   * Intervalo para enviar métricas al servidor (en ms)
   * Si es 0, solo se envían al cerrar sesión
   */
  reportingInterval?: number;

  /**
   * Si se debe rastrear la ruta activa
   */
  trackRoutes?: boolean;

  /**
   * Eventos del usuario a rastrear (clicks, form_submit, etc.)
   */
  trackEvents?: string[];

  /**
   * Función a ejecutar cuando hay nuevas métricas
   */
  onMetricsUpdate?: (metrics: SessionMetrics) => void;
}

/**
 * Detalles de una solicitud HTTP para métricas
 */
export interface RequestMetrics {
  /**
   * URL de la solicitud
   */
  url: string;

  /**
   * Método HTTP
   */
  method: string;

  /**
   * Código de estado HTTP
   */
  statusCode: number;

  /**
   * Tiempo de inicio (timestamp)
   */
  startTime: number;

  /**
   * Duración en milisegundos
   */
  duration: number;

  /**
   * Tamaño de la respuesta en bytes
   */
  responseSize?: number;

  /**
   * Si hubo error
   */
  hasError: boolean;

  /**
   * Tipo de error, si lo hubo
   */
  errorType?: string;

  /**
   * Cantidad de reintentos
   */
  retryCount?: number;
}
