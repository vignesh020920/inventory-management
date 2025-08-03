// src/services/authService.ts
import apiClient from "./axiosInstance";
import {
  type LoginData,
  // type RegisterData,
  type AuthResponse,
  type User,
  // type ResetPasswordData,
  type ChangePasswordData,
} from "@/types/auth";

class AuthService {
  private readonly baseUrl = "/auth";

  async login(data: LoginData): Promise<AuthResponse> {
    return await apiClient.authRequest<AuthResponse>(
      `${this.baseUrl}/login`,
      data
    );
  }

  // async register(data: RegisterData): Promise<AuthResponse> {
  //   return await apiClient.post<AuthResponse>(`${this.baseUrl}/register`, data);
  // }

  async logout(): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`${this.baseUrl}/logout`);
  }

  async refreshToken(): Promise<{ token: string }> {
    return await apiClient.post(`${this.baseUrl}/refresh-token`);
  }

  // async forgotPassword(
  //   email: string
  // ): Promise<{ success: boolean; message: string }> {
  //   return await apiClient.post(`${this.baseUrl}/forgot-password`, { email });
  // }

  // async resetPassword(
  //   data: ResetPasswordData
  // ): Promise<{ success: boolean; message: string }> {
  //   return await apiClient.post(`${this.baseUrl}/reset-password`, data);
  // }

  async changePassword(
    data: ChangePasswordData
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.put(`${this.baseUrl}/change-password`, data);
  }

  async getCurrentUser(): Promise<{ data: User }> {
    return await apiClient.get(`${this.baseUrl}/me`);
  }

  async updateProfile(data: Partial<User>): Promise<{ data: User }> {
    return await apiClient.put(`${this.baseUrl}/profile`, data);
  }
}

const authService = new AuthService();
export default authService;
