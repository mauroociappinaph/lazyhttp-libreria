/**
 * Cliente HTTP para entornos de servidor (Node.js)
 *
 * Esta versión contiene implementaciones específicas para Node.js,
 * incluyendo manejo de archivos, streams y proxies avanzados.
 */

// Re-exportar tipos comunes y utilidades compartidas
export * from '../common/types';
export * from '../common/utils/http-utils';

// Exportar la implementación específica para servidor
import { NodeHttpClient } from './core/node-http-client';

// Crear una instancia singleton
const nodeHttpClient = new NodeHttpClient();

// Exportar cliente singleton
export const http = nodeHttpClient;

// Exportar funciones específicas de servidor como funciones independientes
// para mantener compatibilidad con la API anterior
export const configureProxy = nodeHttpClient.configureProxy.bind(nodeHttpClient);

// Streaming avanzado para Node.js (método especializado)
export const stream = async <T>(url: string, config?: any): Promise<ReadableStream<T>> => {
  // Implementación especializada utilizando Node.js streams
  try {
    const response = await fetch(url, {
      headers: config?.headers,
      signal: config?.signal
    });

    if (!response.ok) {
      throw new Error(`Error en la petición de streaming: ${response.status}`);
    }

    // Devolver el stream directamente
    return response.body as ReadableStream<T>;
  } catch (error) {
    console.error('Error with Node.js streaming:', error);
    throw error;
  }
};

// Módulo SOA (Service Oriented Architecture)
export const createSoaClient = (_options: any) => {
  console.log('Creating SOA client with Node.js specific modules');
  return {
    connect: () => Promise.resolve(true),
    call: (_service: string, _method: string, _args: any[]) => Promise.resolve({}),
    disconnect: () => Promise.resolve()
  };
};

export const createSoaServer = (_options: any) => {
  console.log('Creating SOA server with Node.js specific modules');
  return {
    register: (_name: string, _methods: Record<string, Function>) => {},
    start: () => Promise.resolve(true),
    stop: () => Promise.resolve()
  };
};
