import { debugConfig } from '../http-config';
import { SessionMetrics, MetricsConfig } from '../http.types';

/**
 * Módulo de gestión de estado
 * Responsabilidad: Almacenar y proporcionar acceso al estado del sistema
 */
const StateManager = (() => {
  // Estado privado
  const state = {
    config: {
      enabled: false,
      reportingInterval: 0,
      trackRoutes: false,
      trackEvents: []
    } as MetricsConfig,
    metrics: null as SessionMetrics | null,
    intervals: {
      reporting: null as NodeJS.Timeout | null
    }
  };

  // API
  return {
    getConfig: () => state.config,
    setConfig: (config: Partial<MetricsConfig>) => {
      state.config = { ...state.config, ...config };
    },
    getMetrics: () => state.metrics,
    setMetrics: (metrics: SessionMetrics | null) => {
      state.metrics = metrics;
    },
    updateMetrics: (updater: (metrics: SessionMetrics) => void) => {
      if (state.metrics) {
        updater(state.metrics);
      }
    },
    getReportingInterval: () => state.intervals.reporting,
    setReportingInterval: (interval: NodeJS.Timeout | null) => {
      state.intervals.reporting = interval;
    },
    isEnabled: () => state.config.enabled && state.metrics !== null
  };
})();

/**
 * Módulo de generación de IDs
 * Responsabilidad: Generar identificadores únicos
 */
const IdGenerator = {
  generateSessionId: () =>
    Date.now().toString(36) + Math.random().toString(36).substring(2)
};

/**
 * Módulo de seguimiento de tiempo
 * Responsabilidad: Calcular y actualizar métricas de tiempo
 */
const TimeTracker = {
  updateActivityTime: () => {
    StateManager.updateMetrics(metrics => {
      const now = Date.now();
      metrics.activeTime += now - metrics.lastActivity;
      metrics.lastActivity = now;
    });
  }
};

/**
 * Módulo de actualización de UI
 * Responsabilidad: Notificar cambios en las métricas
 */
const NotificationService = {
  notifyMetricsUpdate: () => {
    const config = StateManager.getConfig();
    const metrics = StateManager.getMetrics();

    if (config.onMetricsUpdate && metrics) {
      config.onMetricsUpdate({ ...metrics });
    }
  }
};

/**
 * Módulo de seguimiento de actividad
 * Responsabilidad: Registrar interacciones del usuario
 */
const ActivityTracker = {
  setupTracking: () => {
    if (typeof window === 'undefined') return;

    // Eventos de actividad básica
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const trackActivity = () => {
      TimeTracker.updateActivityTime();
      NotificationService.notifyMetricsUpdate();
    };

    events.forEach(event => window.addEventListener(event, trackActivity));

    // Eventos personalizados
    const config = StateManager.getConfig();
    if (config.trackEvents?.length) {
      config.trackEvents.forEach(eventType => {
        window.addEventListener(eventType, () => {
          StateManager.updateMetrics(metrics => {
            metrics.activities[eventType] = (metrics.activities[eventType] || 0) + 1;
          });
        });
      });
    }
  },

  trackSpecificActivity: (type: string) => {
    if (!StateManager.isEnabled()) return;

    StateManager.updateMetrics(metrics => {
      metrics.activities[type] = (metrics.activities[type] || 0) + 1;
      metrics.lastActivity = Date.now();
    });
  },

  trackRequest: (endpoint: string) => {
    if (!StateManager.isEnabled()) return;

    StateManager.updateMetrics(metrics => {
      metrics.requestCount++;
      metrics.lastActivity = Date.now();
    });

    // Registrar también como ruta si es apropiado
    RouteTracker.trackRouteVisit(endpoint);
  }
};

/**
 * Módulo de seguimiento de rutas
 * Responsabilidad: Registrar navegación entre páginas
 */
const RouteTracker = {
  setupTracking: () => {
    if (typeof window === 'undefined') return;

    const config = StateManager.getConfig();
    if (!config.trackRoutes) return;

    const trackRoute = () => {
      if (window.location.pathname) {
        RouteTracker.trackRouteVisit(window.location.pathname);
      }
    };

    // Capturar ruta inicial
    trackRoute();

    // Escuchar cambios de ruta
    window.addEventListener('popstate', trackRoute);
  },

  trackRouteVisit: (path: string) => {
    if (!StateManager.isEnabled()) return;

    const config = StateManager.getConfig();
    if (!config.trackRoutes || !path.startsWith('/')) return;

    StateManager.updateMetrics(metrics => {
      if (!metrics.visitedRoutes.includes(path)) {
        metrics.visitedRoutes.push(path);
      }
    });
  }
};

/**
 * Módulo de envío de métricas
 * Responsabilidad: Comunicarse con el servidor
 */
const MetricsReporter = {
  setupReporting: () => {
    // Limpiar intervalo anterior si existe
    const currentInterval = StateManager.getReportingInterval();
    if (currentInterval) {
      clearInterval(currentInterval);
    }

    // Configurar nuevo intervalo si está habilitado
    const config = StateManager.getConfig();
    if (config.enabled && config.reportingInterval && config.reportingInterval > 0) {
      const interval = setInterval(
        MetricsReporter.sendMetricsToServer,
        config.reportingInterval
      );
      StateManager.setReportingInterval(interval);
    }
  },

  sendMetricsToServer: async (): Promise<void> => {
    const config = StateManager.getConfig();
    const metrics = StateManager.getMetrics();

    if (!config.enabled || !metrics || !config.endpoint) return;

    try {
      // Actualizar tiempos antes de enviar
      TimeTracker.updateActivityTime();

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error(`Error al enviar métricas: ${response.status}`);
      }

      if (debugConfig.logRequests) {
        console.log('[HTTP:METRICS] Métricas enviadas al servidor', metrics);
      }
    } catch (error) {
      console.error('[HTTP:METRICS] Error al enviar métricas', error);
    }
  }
};

/**
 * Módulo de ciclo de vida de métricas
 * Responsabilidad: Iniciar y detener la sesión de métricas
 */
const SessionManager = {
  startSession: () => {
    const config = StateManager.getConfig();
    if (!config.enabled) return;

    // Inicializar métricas
    StateManager.setMetrics({
      loginTime: Date.now(),
      lastActivity: Date.now(),
      activeTime: 0,
      requestCount: 0,
      activities: {},
      visitedRoutes: [],
      sessionId: IdGenerator.generateSessionId()
    });

    // Configurar seguimiento
    ActivityTracker.setupTracking();
    RouteTracker.setupTracking();

    if (debugConfig.logRequests) {
      console.log('[HTTP:METRICS] Iniciado seguimiento de sesión', StateManager.getMetrics());
    }
  },

  endSession: async (): Promise<SessionMetrics | null> => {
    if (!StateManager.isEnabled()) return null;

    // Actualizar tiempos finales
    TimeTracker.updateActivityTime();

    StateManager.updateMetrics(metrics => {
      metrics.logoutTime = Date.now();
    });

    // Guardar una copia antes de limpiar
    const finalMetrics = { ...StateManager.getMetrics()! };

    // Enviar al servidor
    await MetricsReporter.sendMetricsToServer();

    if (debugConfig.logRequests) {
      console.log('[HTTP:METRICS] Finalizado seguimiento de sesión', finalMetrics);
    }

    // Limpiar estado
    StateManager.setMetrics(null);

    return finalMetrics;
  },

  getCurrentSession: (): SessionMetrics | null => {
    if (!StateManager.isEnabled()) return null;

    TimeTracker.updateActivityTime();
    return { ...StateManager.getMetrics()! };
  }
};

/**
 * Módulo principal - Punto de entrada API pública
 * Responsabilidad: Coordinar los demás módulos y exponer API
 */
const MetricsController = {
  configure: (config: Partial<MetricsConfig>): void => {
    StateManager.setConfig(config);
    MetricsReporter.setupReporting();

    if (StateManager.getConfig().enabled) {
      console.log('[HTTP:METRICS] Sistema de métricas configurado', StateManager.getConfig());
    }
  },

  startTracking: (): void => {
    SessionManager.startSession();
  },

  stopTracking: async (): Promise<SessionMetrics | null> => {
    return SessionManager.endSession();
  },

  getCurrentMetrics: (): SessionMetrics | null => {
    return SessionManager.getCurrentSession();
  },

  trackRequest: (endpoint: string): void => {
    ActivityTracker.trackRequest(endpoint);
  },

  trackActivity: (type: string): void => {
    ActivityTracker.trackSpecificActivity(type);
  }
};

// Exportación pública
export const metricsManager = {
  configure: MetricsController.configure,
  startTracking: MetricsController.startTracking,
  stopTracking: MetricsController.stopTracking,
  trackRequest: MetricsController.trackRequest,
  trackActivity: MetricsController.trackActivity,
  getCurrentMetrics: MetricsController.getCurrentMetrics
};
