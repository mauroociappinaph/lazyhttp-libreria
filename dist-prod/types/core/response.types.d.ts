import { AxiosResponse } from 'axios';
export interface ErrorDetails {
    description: string;
    cause: string;
    solution: string;
    example?: string;
}
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
    meta?: Record<string, any>;
    details?: ErrorDetails;
}
export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface ApiResponseWithPagination<T> extends ApiResponse<T> {
    pagination: PaginationMeta | null;
}
export interface HttpResponseProcessor {
    processResponse<T>(response: AxiosResponse<T>): ApiResponse<T>;
}
export interface HttpErrorHandler {
    handleError(error: unknown): ApiResponse<never>;
}
