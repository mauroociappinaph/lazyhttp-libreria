/**
 * Ejemplo de uso del sistema de retry automático con backoff exponencial
 *
 * Este ejemplo muestra cómo configurar y utilizar la funcionalidad de reintentos
 * automáticos de HttpLazy para mejorar la resiliencia de las aplicaciones ante
 * fallos temporales de red o servicios.
 */
import { HttpImplementation } from '../http/common/types';

// Creación de un cliente HTTP mock para el ejemplo
// En una aplicación real, importarías el cliente así:
// import { http } from 'httplazy';
const http: any = {
  // Implementación básica simulada para el ejemplo
  initialize: (config: any) => {
    console.log('Configuración aplicada:', JSON.stringify(config, null, 2));
  },

  get: async (url: string, options?: any) => {
    console.log(`[GET] ${url} con opciones:`, options);
    // Simular comportamiento de retry para el ejemplo
    if (url === '/api/usuarios') {
      console.log('Simulando retry: Primer intento - Error 503');
      console.log('Simulando retry: Segundo intento - Error 503');
      console.log('Simulando retry: Tercer intento - Éxito 200');
    }

    return {
      data: { id: 1, nombre: 'Ejemplo', success: true },
      status: 200,
      headers: { 'content-type': 'application/json' }
    };
  },

  post: async (url: string, data?: any, options?: any) => {
    console.log(`[POST] ${url} con datos:`, data, 'y opciones:', options);
    return {
      data: { id: 123, success: true },
      status: 201,
      headers: { 'content-type': 'application/json' }
    };
  },

  // Métodos restantes implementados vacíos para satisfacer la interfaz
  request: () => Promise.resolve({ data: {}, status: 200, headers: {} }),
  getAll: () => Promise.resolve({ data: [], status: 200, headers: {} }),
  getById: () => Promise.resolve({ data: {}, status: 200, headers: {} }),
  put: () => Promise.resolve({ data: {}, status: 200, headers: {} }),
  patch: () => Promise.resolve({ data: {}, status: 200, headers: {} }),
  delete: () => Promise.resolve({ data: {}, status: 200, headers: {} }),
  configureAuth: () => {},
  login: () => Promise.resolve({ user: {}, token: '', refreshToken: '' }),
  logout: () => Promise.resolve(),
  isAuthenticated: () => false,
  getAuthenticatedUser: () => null,
  getAccessToken: () => null,
  configureCaching: () => {},
  invalidateCache: () => {},
  invalidateCacheByTags: () => {},
  configureMetrics: () => {},
  trackActivity: () => {},
  getCurrentMetrics: () => ({})
};

// API que simula fallos aleatorios para demostrar los reintentos
const FLAKY_API_URL = 'https://flaky-api.ejemplo.com';

async function demostraciónRetryAutomático() {
  console.log('🚀 Demostración de Retry Automático con Backoff Exponencial\n');

  // 1. Configuración global de retry
  console.log('1️⃣ Configurando cliente HTTP con retry automático');
  http.initialize({
    baseUrl: FLAKY_API_URL,
    timeout: 5000,
    retry: {
      enabled: true,               // Activa los reintentos automáticos
      maxRetries: 3,               // Número máximo de intentos
      initialDelay: 1000,          // Tiempo inicial entre intentos (ms)
      backoffFactor: 2,            // Factor de crecimiento exponencial
      retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Códigos HTTP a reintentar
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'] // Errores de red
    }
  });

  // 2. Ejemplo de petición con retry automático global
  try {
    console.log('\n2️⃣ Realizando petición con configuración global de retry');
    console.log('   Esto usará los valores de retry configurados globalmente');

    const resultado = await http.get('/api/usuarios');
    console.log(`   ✅ Petición exitosa después de varios intentos`);
    console.log(`   📊 Datos recibidos: ${JSON.stringify(resultado.data)}`);
  } catch (error) {
    console.error(`   ❌ Error después de múltiples intentos: ${error.message}`);
  }

  // 3. Ejemplo de petición con opciones de retry específicas
  try {
    console.log('\n3️⃣ Realizando petición con opciones de retry específicas');
    console.log('   Esto sobrescribirá la configuración global para esta petición');

    const resultado = await http.get('/api/productos', {
      retryOptions: {
        maxRetries: 5,           // Más reintentos que la configuración global
        initialDelay: 500,       // Tiempo inicial más corto
        backoffFactor: 1.5       // Factor de crecimiento más suave
      }
    });

    console.log(`   ✅ Petición exitosa`);
    console.log(`   📊 Datos recibidos: ${JSON.stringify(resultado.data)}`);
  } catch (error) {
    console.error(`   ❌ Error después de múltiples intentos: ${error.message}`);
  }

  // 4. Ejemplo de petición sin reintentos para rutas específicas
  try {
    console.log('\n4️⃣ Realizando petición desactivando los reintentos');
    console.log('   Algunas operaciones no deberían reintentarse automáticamente');

    const resultado = await http.post('/api/pedidos', { id: 123, total: 99.99 }, {
      retryOptions: {
        enabled: false  // Desactivar reintentos para esta petición específica
      }
    });

    console.log(`   ✅ Petición exitosa al primer intento`);
    console.log(`   📊 Datos recibidos: ${JSON.stringify(resultado.data)}`);
  } catch (error) {
    console.error(`   ❌ Error sin reintentos: ${error.message}`);
  }

  // 5. Comportamiento del backoff exponencial
  console.log('\n5️⃣ Comportamiento del backoff exponencial');
  console.log('   Con initialDelay=1000ms y backoffFactor=2:');
  console.log('   • Primer reintento: espera 1000ms');
  console.log('   • Segundo reintento: espera 2000ms (1000 * 2^1)');
  console.log('   • Tercer reintento: espera 4000ms (1000 * 2^2)');
  console.log('   • Cuarto reintento: espera 8000ms (1000 * 2^3)');
  console.log('   Este enfoque reduce la carga en servicios ya sobrecargados.');

  console.log('\n✨ Fin de la demostración de retry automático');
}

// Ejecutar el ejemplo
demostraciónRetryAutomático().catch(error => {
  console.error('Error en la demostración:', error);
});
