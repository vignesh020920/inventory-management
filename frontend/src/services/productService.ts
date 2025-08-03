import apiClient from "./axiosInstance";
import {
  type CreateProductData,
  type UpdateProductData,
  type ProductsResponse,
  type ProductResponse,
  type DeleteProductResponse,
} from "@/types/product";

interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  inStock?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class ProductService {
  private readonly baseUrl = "/products";

  async getProducts(
    params: ProductQueryParams = {}
  ): Promise<ProductsResponse> {
    const queryString = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryString.append(key, value.toString());
      }
    });

    const url = queryString.toString()
      ? `${this.baseUrl}?${queryString.toString()}`
      : this.baseUrl;

    return await apiClient.get<ProductsResponse>(url);
  }

  async getProductById(id: string): Promise<ProductResponse> {
    return await apiClient.get<ProductResponse>(`${this.baseUrl}/${id}`);
  }

  async createProduct(
    data: CreateProductData | FormData
  ): Promise<ProductResponse> {
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return await apiClient.post<ProductResponse>(this.baseUrl, data, {
      headers,
    });
  }

  async updateProduct(
    id: string,
    data: UpdateProductData | FormData
  ): Promise<ProductResponse> {
    const headers: Record<string, string> = {};

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return await apiClient.put<ProductResponse>(`${this.baseUrl}/${id}`, data, {
      headers,
    });
  }

  async deleteProduct(id: string): Promise<DeleteProductResponse> {
    return await apiClient.delete<DeleteProductResponse>(
      `${this.baseUrl}/${id}`
    );
  }
}

const productService = new ProductService();
export default productService;
