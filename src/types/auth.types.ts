export enum UserRole {
  BUYER = "BUYER",
  SELLER = "SELLER",
  ADMIN = "ADMIN",
}

export interface UserStatus {
  status: "ACTIVE" | "LOCKED" | "BANNED";
}

export interface SendOtpRequest {
  phoneNumber: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  otpCode: string;
  // fullName: string;
  userRole: UserRole;
}

export interface LoginRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface OtpResponse {
  otp: string;
}
