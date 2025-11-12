export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  [key: string]: any;
}

export interface NewApiResponse<T> {
  status: number;
  message: string;
  payload: T;
  serverTime: number;
  [key: string]: any;
}

export interface ICommonPayloadResponse {
  success: boolean;
  message: string;
}

/**
 * Standard pagination result structure from Swagger API
 */
export interface IGetListResult<T = any> {
  /** Total number of documents */
  total: number;
  /** Total data count in current result */
  totalData: number;
  /** Items per page */
  perPage: number;
  /** Total pages available */
  totalPages: number;
  /** Current page number */
  page: number;
  /** Paging counter */
  pagingCounter: number;
  /** Has previous page */
  hasPrevPage: boolean;
  /** Has next page */
  hasNextPage: boolean;
  /** Actual data array */
  data: T[];
}
