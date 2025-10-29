export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    role: string;
    businessId: number;
  };
}

export interface RegisterResponse {
  token: string;
  business: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    email: string;
    role: string;
  };
}
