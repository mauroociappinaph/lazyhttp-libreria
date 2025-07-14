/**
 * Tipos para streaming de datos HTTP
 */

/**
 * Configuración para peticiones con streaming
 */
export interface StreamConfig {
  /**
   * Si se debe usar streaming para esta petición
   * @default false
   */
  enabled?: boolean;

  /**
   * Tamaño del chunk en bytes
   * @default 8192
   */
  chunkSize?: number;

  /**
   * Callback para procesar cada chunk de datos
   */
  onChunk?: (chunk: unknown) => void;

  /**
   * Callback para cuando el streaming ha terminado
   */
  onEnd?: () => void;

  /**
   * Callback para manejar errores durante el streaming
   */
  onError?: (error: Error) => void;
}

/**
 * Opciones avanzadas para configurar una petición de streaming
 */
export interface StreamOptions {
  /**
   * Tiempo máximo de espera en milisegundos
   * @default 30000 (30 segundos)
   */
  timeout?: number;

  /**
   * Cabeceras HTTP personalizadas
   */
  headers?: Record<string, string>;

  /**
   * Indica si la petición debe incluir el token de autenticación
   * @default false
   */
  withAuth?: boolean;

  /**
   * Si se debe usar decodificación de texto
   * @default true
   */
  decodeText?: boolean;

  /**
   * Codificación del texto
   * @default 'utf-8'
   */
  encoding?: string;

  /**
   * Delimitador para separar chunks de texto
   */
  delimiter?: string;

  /**
   * Procesador de chunks
   */
  chunkProcessor?: (chunk: unknown) => unknown;
}

/**
 * Estado de una transferencia de streaming
 */
export interface StreamState {
  /**
   * Indica si el streaming está activo
   */
  active: boolean;

  /**
   * Número de chunks recibidos
   */
  chunkCount: number;

  /**
   * Tamaño total recibido en bytes
   */
  bytesReceived: number;

  /**
   * Tiempo transcurrido en ms
   */
  elapsedTime: number;

  /**
   * Tasa de transferencia en bytes por segundo
   */
  transferRate: number;

  /**
   * Errores ocurridos
   */
  errors: Error[];
}
