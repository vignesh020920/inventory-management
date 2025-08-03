// src/services/userService.ts
import apiClient from "./axiosInstance";
import {
  type BulkDeleteData,
  type StatusUpdateData,
  type UpdateUserData,
  type UpdateUserResponse,
  type UserQueryParams,
  type UserResponse,
  type UsersResponse,
} from "@/types/user";

class UserService {
  private readonly baseUrl = "/users";

  async getUsers(params: UserQueryParams = {}): Promise<UsersResponse> {
    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, value.toString());
      }
    });

    const url = queryString.toString()
      ? `${this.baseUrl}?${queryString.toString()}`
      : this.baseUrl;

    return await apiClient.get<UsersResponse>(url);
  }

  async getUserById(id: string): Promise<UserResponse> {
    return await apiClient.get<UserResponse>(`${this.baseUrl}/${id}`);
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async updateUserStatus(
    id: string,
    data: StatusUpdateData
  ): Promise<UserResponse> {
    return await apiClient.patch<UserResponse>(
      `${this.baseUrl}/${id}/status`,
      data
    );
  }

  async bulkDeleteUsers(
    data: BulkDeleteData
  ): Promise<{ success: boolean; message: string; deletedCount: number }> {
    return await apiClient.delete(`${this.baseUrl}/bulk`, { data });
  }

  async updateUser(
    id: string,
    data: UpdateUserData
  ): Promise<UpdateUserResponse> {
    return await apiClient.put<UpdateUserResponse>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  async exportUsers(params: UserQueryParams = {}): Promise<Blob> {
    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, value.toString());
      }
    });

    const url = queryString.toString()
      ? `${this.baseUrl}/export?${queryString.toString()}`
      : `${this.baseUrl}/export`;

    return await apiClient.get<Blob>(url, {
      responseType: "blob",
    });
  }
}

const userService = new UserService();
export default userService;
