// API response types for Art Souk application

// Common API response structure
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: 'success' | 'error';
}

// Pagination
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

// Authentication
interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse extends ApiResponse<AuthUser> {
  token?: string;
  refreshToken?: string;
}

// Error handling
interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Export types
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  AuthUser,
  AuthResponse,
  ApiError,
};