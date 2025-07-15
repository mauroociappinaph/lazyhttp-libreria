import { SessionMetrics, MetricsConfig } from '../types/core.types';
declare const NotificationService: {
    notifyMetricsUpdate: () => void;
};
export declare const metricsManager: {
    configure: (config: Partial<MetricsConfig>) => void;
    startTracking: () => void;
    stopTracking: () => Promise<SessionMetrics | null>;
    trackRequest: (endpoint: string) => void;
    trackActivity: (type: string) => void;
    getCurrentMetrics: () => SessionMetrics | null;
};
export { NotificationService };
