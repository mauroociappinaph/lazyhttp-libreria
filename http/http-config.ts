import axios from 'axios';

/**
 * Niveles de depuración para el cliente HTTP
 */
export enum DebugLevel {
  NONE = 0,   // Sin logs
  ERROR = 1,  // Solo errores
  WARNING = 2, // Errores y advertencias
  INFO = 3,   // Información general
  DEBUG = 4   // Todo detallado
}

/**
 * Configuración de depuración
 */
export const debugConfig = {
  /**
   * Nivel de depuración actual
   * @default DebugLevel.ERROR
   */
  level: process.env.NODE_ENV === 'development' ? DebugLevel.INFO : DebugLevel.ERROR,

  /**
   * Registrar detalles de peticiones HTTP
   * @default true
   */
  logRequests: true,

  /**
   * Registrar detalles de respuestas HTTP
   * @default true
   */
  logResponses: true,

  /**
   * Mostrar JSON formateado en consola
   * @default true en desarrollo, false en producción
   */
  prettyPrintJSON: process.env.NODE_ENV === 'development',

  /**
   * Colores para los diferentes niveles de log
   */
  colors: {
    error: '#FF6B6B',
    warning: '#FFD166',
    info: '#06D6A0',
    debug: '#118AB2',
    default: '#073B4C'
  }
};

/**
 * Configuración base para todas las peticiones HTTP
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
export const DEFAULT_TIMEOUT = 10000; // 10 segundos
export const DEFAULT_RETRIES = 0;

/**
 * Configuración para almacenamiento de tokens
 */
export const AUTH_STORAGE = {
  TOKEN_KEY: 'token',
  REFRESH_TOKEN_KEY: 'refreshToken',
};

/**
 * Endpoints para autenticación
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh',
  LOGOUT: '/auth/logout',
};

/**
 * Crea una instancia configurada de Axios
 */
export function createAxiosInstance() {
  return axios.create({
    baseURL: API_URL,
    timeout: DEFAULT_TIMEOUT,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Instancia global de HTTP (Axios)
 */
export const httpInstance = createAxiosInstance();
