import { SessionMetrics, MetricsConfig } from '../http.types';
export declare const metricsManager: {
    configure: (config: Partial<MetricsConfig>) => void;
    startTracking: () => void;
    stopTracking: () => Promise<SessionMetrics | null>;
    trackRequest: (endpoint: string) => void;
    trackActivity: (type: string) => void;
    getCurrentMetrics: () => SessionMetrics | null;
};
