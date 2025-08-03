export interface ApiResponse<T> {
  data: {
    data: T;
  };
  message?: string;
  success?: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}
