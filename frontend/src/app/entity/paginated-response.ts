export interface PaginatedResponse<T> {
  count: number;
  page: number;
  perPage: number;
  pageData: T[];
}
