// jest.setup.ts

// Mock global para fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

// Suprimir console.error y console.warn que no son errores de prueba reales
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = jest.fn((...args) => {
  // Filtrar errores específicos que sabemos que son "ruido" de los tests
  if (args[0].includes('[HTTP:METRICS] Error al enviar métricas') || args[0].includes('Error al decodificar token')) {
    return;
  }
  originalConsoleError(...args);
});

console.warn = jest.fn((...args) => {
  // Filtrar advertencias específicas que sabemos que son "ruido" de los tests
  if (args[0].includes('Error al decodificar token')) {
    return;
  }
  originalConsoleWarn(...args);
});

// Limpiar mocks después de cada test
afterEach(() => {
  jest.clearAllMocks();
});
