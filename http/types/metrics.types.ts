/**
 * Métricas de sesión del usuario
 */
export interface SessionMetrics {
  loginTime: number;
  lastActivity: number;
  activeTime: number;
  logoutTime?: number;
  requestCount: number;
  activities: Record<string, number>;
  visitedRoutes: string[];
  sessionId: string;
}

/**
 * Configuración del sistema de métricas
 */
export interface MetricsConfig {
  enabled: boolean;
  endpoint?: string;
  reportingInterval?: number;
  trackRoutes?: boolean;
  trackEvents?: string[];
  onMetricsUpdate?: (metrics: SessionMetrics) => void;
  trackPerformance?: boolean;
  trackErrors?: boolean;
  trackCache?: boolean;
}
