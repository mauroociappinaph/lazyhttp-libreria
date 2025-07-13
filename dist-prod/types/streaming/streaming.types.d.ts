export interface StreamConfig {
    enabled?: boolean;
    chunkSize?: number;
    onChunk?: (chunk: any) => void;
    onEnd?: () => void;
    onError?: (error: Error) => void;
}
export interface StreamOptions {
    timeout?: number;
    headers?: Record<string, string>;
    withAuth?: boolean;
    decodeText?: boolean;
    encoding?: string;
    delimiter?: string;
    chunkProcessor?: (chunk: any) => any;
}
export interface StreamState {
    active: boolean;
    chunkCount: number;
    bytesReceived: number;
    elapsedTime: number;
    transferRate: number;
    errors: Error[];
}
