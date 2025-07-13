export declare function buildUrl(endpoint: string): string;
export declare function addQueryParams(url: string, params?: Record<string, string | number | boolean | undefined | null>): string;
export declare function normalizePath(path: string): string;
export declare function joinPaths(...segments: string[]): string;
