// src/services/categoryService.ts
import apiClient from "./axiosInstance";
import {
  type CreateCategoryData,
  type UpdateCategoryData,
  type CategoryResponse,
  type CategoriesResponse,
  type DeleteCategoryResponse,
  type CategoryOptionsResponse, // ADDED
} from "@/types/category";

interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class CategoryService {
  private readonly baseUrl = "/categories";

  async getCategories(
    params: CategoryQueryParams = {}
  ): Promise<CategoriesResponse> {
    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, value.toString());
      }
    });

    const url = queryString.toString()
      ? `${this.baseUrl}?${queryString.toString()}`
      : this.baseUrl;

    return await apiClient.get<CategoriesResponse>(url);
  }

  async getCategoryById(id: string): Promise<CategoryResponse> {
    return await apiClient.get<CategoryResponse>(`${this.baseUrl}/${id}`);
  }

  async getCategoryOptions(status: string): Promise<CategoryOptionsResponse> {
    return await apiClient.get<CategoryOptionsResponse>(
      `${this.baseUrl}/options?status=${status}`
    );
  }

  async createCategory(data: CreateCategoryData): Promise<CategoryResponse> {
    return await apiClient.post<CategoryResponse>(this.baseUrl, data);
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryData
  ): Promise<CategoryResponse> {
    return await apiClient.put<CategoryResponse>(`${this.baseUrl}/${id}`, data);
  }

  // UPDATED: Use proper typed response
  async deleteCategory(id: string): Promise<DeleteCategoryResponse> {
    return await apiClient.delete<DeleteCategoryResponse>(
      `${this.baseUrl}/${id}`
    );
  }
}

const categoryService = new CategoryService();
export default categoryService;
