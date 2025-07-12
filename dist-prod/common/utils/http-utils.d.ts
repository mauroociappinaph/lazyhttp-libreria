export declare class HttpUtils {
    static buildUrl(baseUrl: string, endpoint: string): string;
    static mergeHeaders(defaultHeaders?: Record<string, string>, customHeaders?: Record<string, string>): Record<string, string>;
    static addQueryParams(url: string, params?: Record<string, string | number | boolean | undefined | null>): string;
    static generateCacheKey(method: string, url: string, data?: any): string;
    static hashString(str: string): string;
    static isNodeEnvironment(): boolean;
    static parseErrorMessage(error: any): string;
}
