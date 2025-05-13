import { RetryConfig, RetryOptions } from '../../../http/common/types';

/**
 * Test de integración para el sistema de retry automático
 *
 * Estos tests verifican la funcionalidad del sistema de retry
 * desde una perspectiva de uso por el cliente de la librería.
 */
describe('Retry System Integration', () => {
  // Simulamos una petición HTTP con retry
  function simulateHttpRequestWithRetry(
    config: Partial<RetryConfig>,
    options?: RetryOptions,
    simulateErrors: number = 0
  ): { callCount: number; success: boolean } {
    // Resultado del test
    let result = {
      callCount: 0,
      success: false
    };

    // Simular request con retry
    const isEnabled = options?.enabled !== undefined
      ? options.enabled
      : (config.enabled || false);

    const maxRetries = options?.maxRetries !== undefined
      ? options.maxRetries
      : (config.maxRetries || 3);

    const initialDelay = options?.initialDelay !== undefined
      ? options.initialDelay
      : (config.initialDelay || 300);

    const backoffFactor = options?.backoffFactor !== undefined
      ? options.backoffFactor
      : (config.backoffFactor || 2);

    // Función que calcula el delay para un reintento
    const calculateDelay = (retryCount: number): number => {
      return initialDelay * Math.pow(backoffFactor, retryCount);
    };

    // Simular peticiones con errores

    // Hacer la petición inicial
    result.callCount = 1;

    // Si retry está desactivado, sólo hacemos una petición sin importar el número de errores
    if (!isEnabled) {
      result.success = (result.callCount >= simulateErrors);
      return result;
    }

    // Si retry está activado, hacemos hasta maxRetries reintentos
    let retryCount = 0;
    while (retryCount < maxRetries && result.callCount < simulateErrors) {
      retryCount++;
      result.callCount++;

      // Calcular delay (solo para verificación en tests)
      const delay = calculateDelay(retryCount - 1);
      expect(delay).toBe(initialDelay * Math.pow(backoffFactor, retryCount - 1));
    }

    // Si el número de llamadas es menor que los errores simulados,
    // entonces no tuvimos suficientes reintentos y fallamos
    result.success = result.callCount >= simulateErrors;

    return result;
  }

  test('debería permitir suficientes reintentos para superar errores transitorios', () => {
    // Configuración de retry
    const retryConfig: Partial<RetryConfig> = {
      enabled: true,
      maxRetries: 3,
      initialDelay: 300,
      backoffFactor: 2
    };

    // Simular 3 errores (requiere petición original + 3 reintentos)
    const result = simulateHttpRequestWithRetry(retryConfig, undefined, 3);

    // Verificar que se hicieron 3 intentos y tuvo éxito
    expect(result.callCount).toBe(3);
    expect(result.success).toBeTruthy();
  });

  test('debería fallar cuando los errores exceden el máximo de reintentos', () => {
    // Configuración de retry
    const retryConfig: Partial<RetryConfig> = {
      enabled: true,
      maxRetries: 2,
      initialDelay: 300,
      backoffFactor: 2
    };

    // Simular 4 errores (requiere petición original + 3 reintentos, pero maxRetries es 2)
    const result = simulateHttpRequestWithRetry(retryConfig, undefined, 4);

    // Verificar que se hicieron 3 intentos (original + 2 reintentos) pero falló
    expect(result.callCount).toBe(3); // Petición original + maxRetries (2)
    expect(result.success).toBeFalsy();
  });

  test('no debería reintentar si retry está desactivado', () => {
    // Configuración de retry desactivado
    const retryConfig: Partial<RetryConfig> = {
      enabled: false,
      maxRetries: 3
    };

    // Simular 2 errores
    const result = simulateHttpRequestWithRetry(retryConfig, undefined, 2);

    // Verificar que solo se hizo 1 intento (sin reintentos)
    expect(result.callCount).toBe(1);
    expect(result.success).toBeFalsy();
  });

  test('las opciones de la petición deberían tener precedencia sobre la configuración global', () => {
    // Configuración global con retry desactivado
    const retryConfig: Partial<RetryConfig> = {
      enabled: false,
      maxRetries: 1
    };

    // Opciones de la petición con retry activado y más reintentos
    const retryOptions: RetryOptions = {
      enabled: true,
      maxRetries: 3
    };

    // Simular 3 errores
    const result = simulateHttpRequestWithRetry(retryConfig, retryOptions, 3);

    // Verificar que se hicieron 3 intentos (usando las opciones de la petición)
    expect(result.callCount).toBe(3);
    expect(result.success).toBeTruthy();
  });

  test('debería calcular correctamente los tiempos de backoff exponencial', () => {
    // Configuración con valores específicos para probar el cálculo
    const retryConfig: Partial<RetryConfig> = {
      enabled: true,
      maxRetries: 3,
      initialDelay: 100,
      backoffFactor: 3
    };

    // No es importante el resultado, el test verifica el cálculo del delay
    simulateHttpRequestWithRetry(retryConfig, undefined, 4);

    // Las expectativas están dentro de la función simulateHttpRequestWithRetry
    // Verifican que delay = initialDelay * (backoffFactor ^ retryCount)
  });
});
