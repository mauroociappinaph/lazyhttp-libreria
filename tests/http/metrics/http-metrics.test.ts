import { metricsManager } from '../../../http/metrics/http-metrics-index';

describe('Metrics Manager', () => {
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mockear fetch para evitar llamadas de red reales
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ message: 'Metrics received' }),
    } as Response);

    // Limpiar el estado de las métricas antes de cada test
    metricsManager.stopTracking();
    metricsManager.configure({ enabled: false });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    metricsManager.stopTracking();
    metricsManager.configure({ enabled: false });
    jest.runOnlyPendingTimers(); // Ejecutar cualquier temporizador pendiente
    jest.useRealTimers(); // Restaurar temporizadores reales
  });

  test('debería enviar métricas al servidor cuando se detiene el seguimiento', async () => {
    // Arrange
    metricsManager.configure({
      enabled: true,
      endpoint: 'https://fake-metrics-endpoint.com/report',
      reportingInterval: 0, // Deshabilitar el envío automático por intervalo para este test
    });
    metricsManager.startTracking();
    metricsManager.trackActivity('test_activity');

    // Act
    await metricsManager.stopTracking();

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://fake-metrics-endpoint.com/report',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('test_activity'),
      })
    );
  });

  test('no debería enviar métricas si el seguimiento no está habilitado', async () => {
    // Arrange
    metricsManager.configure({ enabled: false });
    metricsManager.startTracking(); // Esto no debería iniciar nada si enabled es false

    // Act
    await metricsManager.stopTracking();

    // Assert
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('debería enviar métricas automáticamente en el intervalo configurado', async () => {
    jest.useFakeTimers();

    // Arrange
    metricsManager.configure({
      enabled: true,
      endpoint: 'https://fake-metrics-endpoint.com/report',
      reportingInterval: 1000, // Cada 1 segundo
    });
    metricsManager.startTracking();
    metricsManager.trackActivity('interval_activity');

    // Act - Avanzar los temporizadores
    jest.advanceTimersByTime(1000);

    // Assert - Debería haber enviado métricas una vez
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://fake-metrics-endpoint.com/report',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('interval_activity'),
      })
    );

    // Act - Avanzar de nuevo
    jest.advanceTimersByTime(1000);

    // Assert - Debería haber enviado métricas dos veces
    expect(fetchSpy).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  test('debería manejar errores al enviar métricas', async () => {
    // Arrange
    fetchSpy.mockRestore(); // Restaurar mock para simular un error real
    fetchSpy = jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    // Espiar console.error para verificar que se loguea el error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    metricsManager.configure({
      enabled: true,
      endpoint: 'https://fake-metrics-endpoint.com/report',
      reportingInterval: 0,
    });
    metricsManager.startTracking();

    // Act
    await metricsManager.stopTracking();

    // Assert
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[HTTP:METRICS] Error al enviar métricas',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
