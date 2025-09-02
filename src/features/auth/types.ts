// auth/types.ts
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  department: string[];
  role: string[];
  password_confirmation: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    department: string[];
    role: string[];
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

// LoginResponse and RegisterResponse can be the same as AuthResponse
export type LoginResponse = AuthResponse;
export type RegisterResponse = AuthResponse;

// src/features/auth/types.ts
export interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ErrorResponse {
  data?: ApiError;
  status?: number;
}
