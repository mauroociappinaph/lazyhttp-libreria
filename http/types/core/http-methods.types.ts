/**
 * Métodos HTTP soportados por la biblioteca
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Interfaces referenciadas que se definen en otros archivos
// Declaraciones preliminares
import { CacheOptions } from '../cache/cache.types';
import { StreamConfig } from '../streaming/streaming.types';

interface ProxyConfig {
  url: string;
  auth?: {
    username: string;
    password: string;
  };
  protocol?: 'http' | 'https' | 'socks';
  rejectUnauthorized?: boolean;
}

/**
 * Opciones para las peticiones HTTP
 */
export interface RequestOptions {
  /**
   * Método HTTP a utilizar
   * @default 'GET'
   */
  method?: HttpMethod;

  /**
   * Cabeceras HTTP personalizadas
   */
  headers?: Record<string, string>;

  /**
   * Cuerpo de la petición (se serializará a JSON)
   */
  body?: unknown;

  /**
   * Indica si la petición debe incluir el token de autenticación
   * @default false
   */
  withAuth?: boolean;

  /**
   * Tiempo máximo de espera en milisegundos
   * @default 10000 (10 segundos)
   */
  timeout?: number;

  /**
   * Número de reintentos en caso de error
   * @default 0
   */
  retries?: number;

  /**
   * Parámetros de la petición
   */
  params?: Record<string, string | number>;

  /**
   * Configuración de caché para la petición
   */
  cache?: CacheOptions;

  /**
   * Configuración de proxy para esta petición
   */
  proxy?: ProxyConfig;

  /**
   * Configuración de streaming para esta petición
   */
  stream?: StreamConfig;
}

/**
 * Interfaz para respuestas de error
 */
export interface ErrorResponse {
  message?: string;
  code?: string;
}
