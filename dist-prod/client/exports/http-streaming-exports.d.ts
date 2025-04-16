export declare const stream: <T>(endpoint: string, options?: Omit<import("../../http.types").RequestOptions, "method" | "body">) => Promise<ReadableStream<T>>;
