/**
 * Configuración de streaming
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
  onChunk?: (chunk: any) => void;

  /**
   * Callback para cuando el streaming ha terminado
   */
  onEnd?: () => void;

  /**
   * Callback para manejar errores durante el streaming
   */
  onError?: (error: Error) => void;
}
