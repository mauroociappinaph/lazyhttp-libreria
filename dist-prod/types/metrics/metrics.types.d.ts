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
export interface MetricsConfig {
    enabled: boolean;
    endpoint?: string;
    reportingInterval?: number;
    trackRoutes?: boolean;
    trackEvents?: string[];
    onMetricsUpdate?: (metrics: SessionMetrics) => void;
}
export interface RequestMetrics {
    url: string;
    method: string;
    statusCode: number;
    startTime: number;
    duration: number;
    responseSize?: number;
    hasError: boolean;
    errorType?: string;
    retryCount?: number;
}
