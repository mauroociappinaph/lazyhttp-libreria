import { metricsManager } from '../../http/metrics/http-metrics-index';
// Import NotificationService usando require para acceder a la función interna
const { NotificationService } = require('../../http/metrics/http-metrics-index');

describe('metricsManager', () => {
  it('should configure, start, track activity, and stop metrics session', async () => {
    metricsManager.configure({ enabled: true });
    metricsManager.startTracking();
    metricsManager.trackActivity('test_event');
    metricsManager.trackRequest('/api/test');
    const metrics = metricsManager.getCurrentMetrics();
    expect(metrics).not.toBeNull();
    if (metrics) {
      expect(metrics.activities['test_event']).toBeGreaterThanOrEqual(1);
      expect(metrics.requestCount).toBeGreaterThanOrEqual(1);
      expect(metrics.sessionId).toBeDefined();
    }
    const finalMetrics = await metricsManager.stopTracking();
    expect(finalMetrics).not.toBeNull();
    if (finalMetrics) {
      expect(finalMetrics.logoutTime).toBeDefined();
    }
  });

  it('should call onMetricsUpdate callback when metrics change', done => {
    metricsManager.configure({
      enabled: true,
      onMetricsUpdate: () => {
        expect(true).toBe(true);
        metricsManager.stopTracking();
        done();
      }
    });
    metricsManager.startTracking();
    // Forzar la notificación manualmente
    NotificationService.notifyMetricsUpdate();
  });

  it('should set up reporting interval and send metrics to endpoint', async () => {
    jest.useFakeTimers();
    const endpoint = 'https://fake-metrics-endpoint.com';
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    metricsManager.configure({ enabled: true, endpoint, reportingInterval: 100 });
    metricsManager.startTracking();
    metricsManager.trackActivity('interval_event');
    jest.advanceTimersByTime(200);
    // Wait for the interval to trigger
    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledWith(endpoint, expect.objectContaining({ method: 'POST' }));
    metricsManager.stopTracking();
    jest.useRealTimers();
  });

  it('should handle error when sending metrics to endpoint', async () => {
    const endpoint = 'https://fake-metrics-endpoint.com';
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    metricsManager.configure({ enabled: true, endpoint, reportingInterval: 100 });
    metricsManager.startTracking();
    metricsManager.trackActivity('error_event');
    // Force send
    await metricsManager.stopTracking();
    expect(global.fetch).toHaveBeenCalledWith(endpoint, expect.objectContaining({ method: 'POST' }));
  });
});
