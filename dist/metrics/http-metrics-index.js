"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsManager = void 0;
const http_config_1 = require("../http-config");
const StateManager = (() => {
    const state = {
        config: {
            enabled: false,
            reportingInterval: 0,
            trackRoutes: false,
            trackEvents: []
        },
        metrics: null,
        intervals: {
            reporting: null
        }
    };
    return {
        getConfig: () => state.config,
        setConfig: (config) => {
            state.config = { ...state.config, ...config };
        },
        getMetrics: () => state.metrics,
        setMetrics: (metrics) => {
            state.metrics = metrics;
        },
        updateMetrics: (updater) => {
            if (state.metrics) {
                updater(state.metrics);
            }
        },
        getReportingInterval: () => state.intervals.reporting,
        setReportingInterval: (interval) => {
            state.intervals.reporting = interval;
        },
        isEnabled: () => state.config.enabled && state.metrics !== null
    };
})();
const IdGenerator = {
    generateSessionId: () => Date.now().toString(36) + Math.random().toString(36).substring(2)
};
const TimeTracker = {
    updateActivityTime: () => {
        StateManager.updateMetrics(metrics => {
            const now = Date.now();
            metrics.activeTime += now - metrics.lastActivity;
            metrics.lastActivity = now;
        });
    }
};
const NotificationService = {
    notifyMetricsUpdate: () => {
        const config = StateManager.getConfig();
        const metrics = StateManager.getMetrics();
        if (config.onMetricsUpdate && metrics) {
            config.onMetricsUpdate({ ...metrics });
        }
    }
};
const ActivityTracker = {
    setupTracking: () => {
        var _a;
        if (typeof window === 'undefined')
            return;
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        const trackActivity = () => {
            TimeTracker.updateActivityTime();
            NotificationService.notifyMetricsUpdate();
        };
        events.forEach(event => window.addEventListener(event, trackActivity));
        const config = StateManager.getConfig();
        if ((_a = config.trackEvents) === null || _a === void 0 ? void 0 : _a.length) {
            config.trackEvents.forEach(eventType => {
                window.addEventListener(eventType, () => {
                    StateManager.updateMetrics(metrics => {
                        metrics.activities[eventType] = (metrics.activities[eventType] || 0) + 1;
                    });
                });
            });
        }
    },
    trackSpecificActivity: (type) => {
        if (!StateManager.isEnabled())
            return;
        StateManager.updateMetrics(metrics => {
            metrics.activities[type] = (metrics.activities[type] || 0) + 1;
            metrics.lastActivity = Date.now();
        });
    },
    trackRequest: (endpoint) => {
        if (!StateManager.isEnabled())
            return;
        StateManager.updateMetrics(metrics => {
            metrics.requestCount++;
            metrics.lastActivity = Date.now();
        });
        RouteTracker.trackRouteVisit(endpoint);
    }
};
const RouteTracker = {
    setupTracking: () => {
        if (typeof window === 'undefined')
            return;
        const config = StateManager.getConfig();
        if (!config.trackRoutes)
            return;
        const trackRoute = () => {
            if (window.location.pathname) {
                RouteTracker.trackRouteVisit(window.location.pathname);
            }
        };
        trackRoute();
        window.addEventListener('popstate', trackRoute);
    },
    trackRouteVisit: (path) => {
        if (!StateManager.isEnabled())
            return;
        const config = StateManager.getConfig();
        if (!config.trackRoutes || !path.startsWith('/'))
            return;
        StateManager.updateMetrics(metrics => {
            if (!metrics.visitedRoutes.includes(path)) {
                metrics.visitedRoutes.push(path);
            }
        });
    }
};
const MetricsReporter = {
    setupReporting: () => {
        const currentInterval = StateManager.getReportingInterval();
        if (currentInterval) {
            clearInterval(currentInterval);
        }
        const config = StateManager.getConfig();
        if (config.enabled && config.reportingInterval && config.reportingInterval > 0) {
            const interval = setInterval(MetricsReporter.sendMetricsToServer, config.reportingInterval);
            StateManager.setReportingInterval(interval);
        }
    },
    sendMetricsToServer: async () => {
        const config = StateManager.getConfig();
        const metrics = StateManager.getMetrics();
        if (!config.enabled || !metrics || !config.endpoint)
            return;
        try {
            TimeTracker.updateActivityTime();
            const response = await fetch(config.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metrics)
            });
            if (!response.ok) {
                throw new Error(`Error al enviar métricas: ${response.status}`);
            }
            if (http_config_1.debugConfig.logRequests) {
                console.log('[HTTP:METRICS] Métricas enviadas al servidor', metrics);
            }
        }
        catch (error) {
            console.error('[HTTP:METRICS] Error al enviar métricas', error);
        }
    }
};
const SessionManager = {
    startSession: () => {
        const config = StateManager.getConfig();
        if (!config.enabled)
            return;
        StateManager.setMetrics({
            loginTime: Date.now(),
            lastActivity: Date.now(),
            activeTime: 0,
            requestCount: 0,
            activities: {},
            visitedRoutes: [],
            sessionId: IdGenerator.generateSessionId()
        });
        ActivityTracker.setupTracking();
        RouteTracker.setupTracking();
        if (http_config_1.debugConfig.logRequests) {
            console.log('[HTTP:METRICS] Iniciado seguimiento de sesión', StateManager.getMetrics());
        }
    },
    endSession: async () => {
        if (!StateManager.isEnabled())
            return null;
        TimeTracker.updateActivityTime();
        StateManager.updateMetrics(metrics => {
            metrics.logoutTime = Date.now();
        });
        const finalMetrics = { ...StateManager.getMetrics() };
        await MetricsReporter.sendMetricsToServer();
        if (http_config_1.debugConfig.logRequests) {
            console.log('[HTTP:METRICS] Finalizado seguimiento de sesión', finalMetrics);
        }
        StateManager.setMetrics(null);
        return finalMetrics;
    },
    getCurrentSession: () => {
        if (!StateManager.isEnabled())
            return null;
        TimeTracker.updateActivityTime();
        return { ...StateManager.getMetrics() };
    }
};
const MetricsController = {
    configure: (config) => {
        StateManager.setConfig(config);
        MetricsReporter.setupReporting();
        if (StateManager.getConfig().enabled) {
            console.log('[HTTP:METRICS] Sistema de métricas configurado', StateManager.getConfig());
        }
    },
    startTracking: () => {
        SessionManager.startSession();
    },
    stopTracking: async () => {
        return SessionManager.endSession();
    },
    getCurrentMetrics: () => {
        return SessionManager.getCurrentSession();
    },
    trackRequest: (endpoint) => {
        ActivityTracker.trackRequest(endpoint);
    },
    trackActivity: (type) => {
        ActivityTracker.trackSpecificActivity(type);
    }
};
exports.metricsManager = {
    configure: MetricsController.configure,
    startTracking: MetricsController.startTracking,
    stopTracking: MetricsController.stopTracking,
    trackRequest: MetricsController.trackRequest,
    trackActivity: MetricsController.trackActivity,
    getCurrentMetrics: MetricsController.getCurrentMetrics
};
