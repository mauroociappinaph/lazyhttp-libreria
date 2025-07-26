import { ApiResponse } from "./core.types";

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
