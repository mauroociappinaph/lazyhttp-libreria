/**
 * Configuración de streaming
 */
export interface StreamConfig {
  enabled?: boolean;
  chunkSize?: number;
  onChunk?: (chunk: any) => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}
