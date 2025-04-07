import { UserRole } from "./user.model";

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  phoneNumber?: string;
  address?: string;
  enableMfa: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  mfaEnabled: boolean;
  mfaRequired: boolean;
} 
 