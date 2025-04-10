import { http } from '../http/http-index';
import { ApiResponse } from '../http/http.types';
import { cacheManager } from '../http/http-cache';
import * as cacheStrategies from '../http/http-cache-strategies';

/**
 * Ejemplo que demuestra el sistema de caché inteligente
 */
async function runCacheExample() {
  console.log('=== Prueba del Sistema de Caché Inteligente ===\n');

  // Configurar el sistema de caché manualmente para evitar problemas con localStorage
  cacheManager.configure({
    enabled: true,
    defaultStrategy: 'cache-first',
    defaultTTL: 10 * 1000, // 10 segundos (para ver los efectos rápidamente)
    storage: 'memory',
    maxSize: 100
  });

  console.log('✅ Sistema de caché configurado e inicializado\n');

  // Función para simular una petición a la red
  const fetchFromNetwork = async <T>(endpoint: string): Promise<ApiResponse<T>> => {
    console.log(`🔄 [RED] Solicitando datos de ${endpoint}...`);

    // Simular un retraso en la red
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      data: {
        endpoint,
        timestamp: new Date().toISOString(),
        randomValue: Math.floor(Math.random() * 1000)
      } as unknown as T,
      error: null,
      status: 200
    };
  };

  // Test 1: Estrategia cache-first
  console.log('=== Estrategia: cache-first ===');

  // Primera petición - no hay caché todavía
  console.log('Primera petición (no hay caché):');
  console.time('Primera petición');
  const cacheKey1 = cacheManager.generateCacheKey('/users');
  const response1 = await cacheStrategies.cacheFirst(
    cacheKey1,
    () => fetchFromNetwork('/users')
  );
  console.timeEnd('Primera petición');
  console.log('📋 Respuesta:', response1.data);

  // Segunda petición - debería usar caché
  console.log('\nSegunda petición (debe usar caché):');
  console.time('Segunda petición');
  const response2 = await cacheStrategies.cacheFirst(
    cacheKey1,
    () => fetchFromNetwork('/users')
  );
  console.timeEnd('Segunda petición');
  console.log('📋 Respuesta:', response2.data);
  console.log('🔍 ¿Misma respuesta?', JSON.stringify(response1.data) === JSON.stringify(response2.data) ? 'Sí (caché funcionando)' : 'No (error en caché)');

  // Esperar a que caduque la caché (simular una caché expirada)
  console.log('\nEsperando a que caduque la caché...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Eliminar manualmente la entrada para simular una caché expirada
  console.log('Forzando expiración de la caché...');
  const cachedData = cacheManager.get(cacheKey1);
  if (cachedData) {
    // Modificar la entrada para que aparezca como expirada
    (cachedData as any).meta = { expired: true };
    cacheManager.delete(cacheKey1);
  }

  // Tercera petición - caché expirada, debería ir a la red
  console.log('\nTercera petición (caché expirada):');
  console.time('Tercera petición');
  const response3 = await cacheStrategies.cacheFirst(
    cacheKey1,
    () => fetchFromNetwork('/users')
  );
  console.timeEnd('Tercera petición');
  console.log('📋 Respuesta:', response3.data);
  console.log('🔍 ¿Diferente a la segunda?', JSON.stringify(response2.data) !== JSON.stringify(response3.data) ? 'Sí (caché expirada correctamente)' : 'No (error en expiración)');

  // Test 2: Estrategia stale-while-revalidate
  console.log('\n=== Estrategia: stale-while-revalidate ===');

  // Primera petición SWR
  console.log('Primera petición con stale-while-revalidate:');
  console.time('Primera petición SWR');
  const cacheKey2 = cacheManager.generateCacheKey('/products');
  const response4 = await cacheStrategies.staleWhileRevalidate(
    cacheKey2,
    () => fetchFromNetwork('/products')
  );
  console.timeEnd('Primera petición SWR');
  console.log('📋 Respuesta:', response4.data);

  // Segunda petición SWR - debería usar caché y actualizar en segundo plano
  console.log('\nSegunda petición SWR (debería usar caché y actualizar en segundo plano):');
  console.time('Segunda petición SWR');
  const response5 = await cacheStrategies.staleWhileRevalidate(
    cacheKey2,
    () => fetchFromNetwork('/products')
  );
  console.timeEnd('Segunda petición SWR');
  console.log('📋 Respuesta:', response5.data);
  console.log('🔍 ¿Misma respuesta que la primera?', JSON.stringify(response4.data) === JSON.stringify(response5.data) ? 'Sí (caché utilizada)' : 'No (error en caché)');

  // Esperar a que se complete la actualización en segundo plano
  console.log('\nEsperando a que se complete la actualización en segundo plano...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Tercera petición SWR - debería usar la caché actualizada
  console.log('\nTercera petición SWR (debería usar la caché actualizada):');
  console.time('Tercera petición SWR');
  const response6 = await cacheStrategies.staleWhileRevalidate(
    cacheKey2,
    () => fetchFromNetwork('/products')
  );
  console.timeEnd('Tercera petición SWR');
  console.log('📋 Respuesta:', response6.data);

  // Test 3: Invalidación de caché por tags
  console.log('\n=== Prueba de invalidación de caché por tags ===');

  // Guardar una entrada con tags
  console.log('Guardando entrada en caché con tags...');
  const cacheKey3 = cacheManager.generateCacheKey('/categories');
  const categoriesResponse = await fetchFromNetwork('/categories');
  cacheManager.set(cacheKey3, categoriesResponse, { tags: ['category', 'list'] });

  // Verificar que está en caché
  console.log('Comprobando que está en caché:');
  console.time('Lectura de caché');
  const cachedCategories = cacheManager.get(cacheKey3);
  console.timeEnd('Lectura de caché');
  console.log('📋 Datos en caché:', cachedCategories?.data);

  // Invalidar por tag
  console.log('\nInvalidando entradas con tag "category"...');
  cacheManager.invalidateByTags(['category']);

  // Verificar que ya no está en caché
  const cachedCategoriesAfter = cacheManager.get(cacheKey3);
  console.log('¿Todavía en caché?', cachedCategoriesAfter ? 'Sí (error en invalidación)' : 'No (invalidación exitosa)');

  // Test 4: Invalidación por patrón
  console.log('\n=== Prueba de invalidación por patrón ===');

  // Guardar varias entradas
  console.log('Guardando múltiples entradas en caché...');
  const keyProducts = cacheManager.generateCacheKey('/products/123');
  const keyUsers = cacheManager.generateCacheKey('/users/456');

  cacheManager.set(keyProducts, await fetchFromNetwork('/products/123'));
  cacheManager.set(keyUsers, await fetchFromNetwork('/users/456'));

  // Invalidar por patrón
  console.log('\nInvalidando entradas que coincidan con patrón "/products/*"...');
  cacheManager.invalidate('GET:/products*');

  // Verificar resultados
  const productsAfter = cacheManager.get(keyProducts);
  const usersAfter = cacheManager.get(keyUsers);

  console.log('¿Productos todavía en caché?', productsAfter ? 'Sí (error en invalidación)' : 'No (invalidación exitosa)');
  console.log('¿Usuarios todavía en caché?', usersAfter ? 'Sí (correcto, no debería afectarle)' : 'No (error, no debería haberse invalidado)');

  console.log('\n=== Prueba finalizada ===');
}

// Ejecutar el ejemplo
runCacheExample().catch(error => {
  console.error('❌ Error en el ejemplo:', error);
});
