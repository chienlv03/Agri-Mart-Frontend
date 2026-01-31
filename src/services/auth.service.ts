import apiClient from "@/lib/axios";
import {
  AuthResponse,
  LoginRequest,
  OtpResponse,
  RegisterRequest,
  SendOtpRequest
} from "@/types/auth.types";
import { refresh } from "next/cache";

export const AuthService = {
  // 1. Gửi OTP
  sendOtp: async (data: SendOtpRequest) => {
    return await apiClient.post<OtpResponse>("/auth/otp", data);
  },

  // 2. Đăng ký
  register: async (data: RegisterRequest) => {
    return await apiClient.post<AuthResponse>("/auth/register", data);
  },

  // 3. Đăng nhập
  login: async (data: LoginRequest) => {
    return await apiClient.post<AuthResponse>("/auth/login", data);
  },

  // 4. Lấy thông tin user hiện tại (Me)
  getMe: async () => {
    return await apiClient.get("/users/me");
  },

  // 5. Đăng xuất
  logout: async () => {
    return await apiClient.post("/auth/logout");
  },

  getAllUsers: async (page = 0, size = 10, sortBy = "createdAt", order = "desc") => {
    const res = await apiClient.get(
      `/users?page=${page}&size=${size}&sortBy=${sortBy}&order=${order}`
    );
    return res.data;
  },

  refreshToken: async () => {
    return await apiClient.post<AuthResponse>("/auth/refresh");
  }
};