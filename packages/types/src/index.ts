// Common API Response interface
export interface ApiResponse<T> {
  data: T;
  isSuccess: boolean;
  message?: string;
  errors?: string[];
}

// Common User Session / Auth interface
export interface UserSession {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
}
