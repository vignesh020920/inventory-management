import apiClient from "./axiosInstance";
import {
  type CreateUserData,
  type UpdateUserData,
  type UserResponse,
  type UsersResponse,
  type DeleteUserResponse,
  type BulkDeleteUsersResponse,
} from "@/types/user";

interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

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

  async createUser(data: CreateUserData): Promise<UserResponse> {
    return await apiClient.post<UserResponse>(this.baseUrl, data);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<UserResponse> {
    return await apiClient.put<UserResponse>(`${this.baseUrl}/${id}`, data);
  }

  async deleteUser(id: string): Promise<DeleteUserResponse> {
    return await apiClient.delete<DeleteUserResponse>(`${this.baseUrl}/${id}`);
  }

  async bulkDeleteUsers(userIds: string[]): Promise<BulkDeleteUsersResponse> {
    return await apiClient.delete<BulkDeleteUsersResponse>(
      `${this.baseUrl}/bulk`,
      {
        data: { userIds },
      }
    );
  }

  async updateUserStatus(
    id: string,
    status: "active" | "inactive" | "suspended"
  ): Promise<UserResponse> {
    return await apiClient.patch<UserResponse>(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }
}

const userService = new UserService();
export default userService;
