export declare function prepareHeaders(headers: Record<string, string>, withAuth: boolean): Record<string, string>;
export declare function refreshToken(): Promise<string>;
export declare function handleRefreshTokenFailure(): Promise<void>;
