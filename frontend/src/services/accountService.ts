// src/services/adminAccountService.ts
import apiClient from "./axiosInstance";
import {
  type UpdateAdminProfileData,
  type ChangeAdminPasswordData,
  type AdminProfileResponse,
  type ChangePasswordResponse,
  type UploadAvatarResponse,
} from "@/types/account";

class AdminAccountService {
  private readonly baseUrl = "/account";

  // Get current admin profile
  async getCurrentProfile(): Promise<AdminProfileResponse> {
    return await apiClient.get<AdminProfileResponse>(`${this.baseUrl}/profile`);
  }

  // Update admin profile (name, email)
  async updateProfile(
    data: UpdateAdminProfileData
  ): Promise<AdminProfileResponse> {
    return await apiClient.put<AdminProfileResponse>(
      `${this.baseUrl}/profile`,
      data
    );
  }

  // Change admin password
  async changePassword(
    data: ChangeAdminPasswordData
  ): Promise<ChangePasswordResponse> {
    return await apiClient.put<ChangePasswordResponse>(
      `${this.baseUrl}/password`,
      data
    );
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
    const formData = new FormData();
    formData.append("avatar", file);

    return await apiClient.post<UploadAvatarResponse>(
      `${this.baseUrl}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  // Remove avatar
  async removeAvatar(): Promise<AdminProfileResponse> {
    return await apiClient.delete<AdminProfileResponse>(
      `${this.baseUrl}/avatar`
    );
  }
}

const adminAccountService = new AdminAccountService();
export default adminAccountService;
