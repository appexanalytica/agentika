import { Request } from 'express';

export type UserRole = 'super_admin' | 'admin' | 'user';

export interface TokenPayload {
  sub: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload & { _id: string };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse | PaginatedResponse<T>;

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  role?: UserRole;
  assignedTo?: string;
  category?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}
