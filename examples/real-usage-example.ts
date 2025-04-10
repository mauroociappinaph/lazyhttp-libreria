// En un entorno real, se importaría así:
// import { http } from 'lazyhttp';
// Para este ejemplo de desarrollo usamos:
import { http } from '../http/http-index';

/**
 * Ejemplo que demuestra el uso real de la librería con el sistema de caché
 */
async function runRealUsageExample() {
  console.log('=== Ejemplo de Uso Real de httplazy con Caché ===\n');

  // En un ejemplo real, el usuario no tendría acceso directo a la implementación
  // Pero necesitamos simular el comportamiento de la red aquí
  // Guardamos una referencia al método original
  const originalRequest = http.request;

  // Caché manual para simular el comportamiento
  const cache = new Map();

  // Sobreescribimos el método request para simular peticiones
  http.request = async <T>(endpoint: string, options: any = {}) => {
    const method = options?.method || 'GET';

    // Determinar si debemos usar caché (solo para GET)
    const useCache = method === 'GET' && options?.cache?.enabled !== false;

    // Generar clave de caché (incluyendo tags)
    let cacheKey = `${method}:${endpoint}`;
    if (options?.cache?.tags && options.cache.tags.length > 0) {
      cacheKey += `:tags=${options.cache.tags.sort().join(',')}`;
    }

    // Estrategia de caché
    const strategy = options?.cache?.strategy || 'cache-first';

    // Si es cache-first, intentar primero la caché
    if (useCache && strategy === 'cache-first') {
      const cachedItem = cache.get(cacheKey);
      if (cachedItem) {
        return cachedItem;
      }
    }

    // Simular petición a la red
    console.log(`🔄 Petición HTTP ${method} a ${endpoint}`);

    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Crear respuesta simulada
    const response = {
      data: {
        id: Math.floor(Math.random() * 1000),
        name: `Item from ${endpoint}`,
        timestamp: new Date().toISOString()
      } as any,
      error: null,
      status: 200
    };

    // Guardar en caché si corresponde
    if (useCache && method === 'GET') {
      cache.set(cacheKey, response);
    }

    // Invalidar caché para métodos de escritura
    if (method !== 'GET') {
      // Invalidar todas las peticiones GET a este recurso
      const pattern = new RegExp(`GET:${endpoint.split('/').slice(0, -1).join('/')}.*`);
      for (const key of cache.keys()) {
        if (pattern.test(key)) {
          cache.delete(key);
        }
      }
    }

    return response;
  };

  // Sobreescribir el método invalidateCacheByTags
  const originalInvalidateByTags = http.invalidateCacheByTags;
  http.invalidateCacheByTags = (tags: string[]) => {
    // Invalidar en nuestra caché manual
    for (const key of cache.keys()) {
      // Si la clave contiene alguno de los tags especificados
      if (tags.some(tag => key.includes(`tags=`) && key.includes(tag))) {
        cache.delete(key);
      }
    }
  };

  // Inicializar la librería con el sistema de caché habilitado
  console.log('Inicializando httplazy con caché...');
  await http.initialize({
    cache: {
      enabled: true,
      defaultStrategy: 'cache-first',
      defaultTTL: 30 * 1000, // 30 segundos
      storage: 'memory',
      maxSize: 50
    }
  });
  console.log('✅ Librería inicializada con caché\n');

  // Ejemplo 1: Petición simple con caché por defecto
  console.log('=== Ejemplo 1: Petición con estrategia por defecto (cache-first) ===');
  console.log('Primera petición a /api/users (debería ir a la red):');
  console.time('Primera petición');
  const response1 = await http.get('/api/users');
  console.timeEnd('Primera petición');
  console.log('📋 Respuesta:', response1.data);

  console.log('\nSegunda petición a /api/users (debería usar caché):');
  console.time('Segunda petición');
  const response2 = await http.get('/api/users');
  console.timeEnd('Segunda petición');
  console.log('📋 Respuesta:', response2.data);

  // Ejemplo 2: Petición con estrategia personalizada
  console.log('\n=== Ejemplo 2: Petición con estrategia personalizada ===');
  console.log('Petición a /api/products con estrategia network-first:');
  console.time('Petición network-first');
  const response3 = await http.get('/api/products', {
    cache: {
      strategy: 'network-first',
      ttl: 60 * 1000 // 1 minuto
    }
  });
  console.timeEnd('Petición network-first');
  console.log('📋 Respuesta:', response3.data);

  // Ejemplo 3: Petición con tags para invalidación
  console.log('\n=== Ejemplo 3: Uso de tags para invalidación ===');
  console.log('Petición a /api/categories con tags:');
  console.time('Petición con tags');
  const response4 = await http.get('/api/categories', {
    cache: {
      tags: ['category', 'list']
    }
  });
  console.timeEnd('Petición con tags');
  console.log('📋 Respuesta:', response4.data);

  console.log('\nSegunda petición a /api/categories (debería usar caché):');
  console.time('Segunda petición con tags');
  const response5 = await http.get('/api/categories', {
    cache: {
      tags: ['category', 'list']
    }
  });
  console.timeEnd('Segunda petición con tags');
  console.log('📋 Respuesta:', response5.data);

  // Invalidar caché por tag
  console.log('\nInvalidando caché con tag "category":');
  http.invalidateCacheByTags(['category']);
  console.log('Caché invalidada');

  console.log('\nTercera petición a /api/categories después de invalidar (debería ir a la red):');
  console.time('Petición después de invalidar');
  const response6 = await http.get('/api/categories', {
    cache: {
      tags: ['category', 'list']
    }
  });
  console.timeEnd('Petición después de invalidar');
  console.log('📋 Respuesta:', response6.data);

  // Ejemplo 4: Modificación e invalidación automática
  console.log('\n=== Ejemplo 4: Invalidación automática con métodos de escritura ===');
  console.log('Petición GET a /api/posts:');
  await http.get('/api/posts');

  console.log('\nCreando un nuevo post (POST):');
  await http.post('/api/posts', { title: 'Nuevo post', content: 'Contenido...' });

  console.log('\nPetición GET a /api/posts después de POST (debería ir a la red):');
  console.time('GET después de POST');
  await http.get('/api/posts');
  console.timeEnd('GET después de POST');

  // Restaurar método original
  http.request = originalRequest;
  http.invalidateCacheByTags = originalInvalidateByTags;

  console.log('\n=== Ejemplo finalizado ===');
}

// Ejecutar el ejemplo
runRealUsageExample().catch(error => {
  console.error('❌ Error en el ejemplo:', error);
});

// NOTA: Para que este ejemplo funcione en el entorno de desarrollo, en realidad
// importamos desde '../http/http-index', pero en una aplicación real sería:
// import { http } from 'lazyhttp';
