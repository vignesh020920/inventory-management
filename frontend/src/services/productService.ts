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
    try {
      const headers: Record<string, string> = {};

      // Enhanced logging for FormData debugging
      if (data instanceof FormData) {
        console.log("=== ProductService: Creating product with FormData ===");

        // Debug FormData contents (helpful for troubleshooting)
        let fileCount = 0;
        for (let [key, value] of data.entries()) {
          if (value instanceof File) {
            console.log(
              `${key}: File - ${value.name} (${value.size} bytes, ${value.type})`
            );
            fileCount++;

            // Additional validation for empty files
            if (value.size === 0) {
              throw new Error(
                `File "${value.name}" is empty. Please select a valid image.`
              );
            }
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        console.log(`Total files to upload: ${fileCount}`);
        console.log("=== End FormData Debug ===");

        // Don't set Content-Type for FormData - let browser set it with boundary
        // This is crucial for proper multipart/form-data handling
      } else {
        headers["Content-Type"] = "application/json";
        console.log("Creating product with JSON data");
      }

      const response = await apiClient.post<ProductResponse>(
        this.baseUrl,
        data,
        {
          headers,
          // Add timeout for large file uploads
          timeout: data instanceof FormData ? 60000 : 10000, // 60s for FormData, 10s for JSON
        }
      );

      console.log("Product created successfully:", response.data);
      return response;
    } catch (error: any) {
      console.error("ProductService: Create product error:", error);

      // Enhanced error handling for file upload scenarios
      if (error.response?.status === 413) {
        throw new Error(
          "File size too large. Please reduce image sizes and try again."
        );
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.message
      ) {
        throw new Error(error.response.data.message);
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Upload timeout. Please check your internet connection and try again."
        );
      }

      throw error;
    }
  }

  async updateProduct(
    id: string,
    data: UpdateProductData | FormData
  ): Promise<ProductResponse> {
    try {
      const headers: Record<string, string> = {};

      if (data instanceof FormData) {
        console.log(
          `=== ProductService: Updating product ${id} with FormData ===`
        );

        // Debug FormData for updates
        let fileCount = 0;
        let existingImageCount = 0;

        for (let [key, value] of data.entries()) {
          if (value instanceof File) {
            console.log(
              `${key}: New File - ${value.name} (${value.size} bytes)`
            );
            fileCount++;

            if (value.size === 0) {
              throw new Error(
                `File "${value.name}" is empty. Please select a valid image.`
              );
            }
          } else if (key === "existingImages") {
            existingImageCount++;
            console.log(`${key}: Existing image data`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }

        console.log(
          `New files: ${fileCount}, Existing images: ${existingImageCount}`
        );
        console.log("=== End Update FormData Debug ===");
      } else {
        headers["Content-Type"] = "application/json";
        console.log(`Updating product ${id} with JSON data`);
      }

      const response = await apiClient.put<ProductResponse>(
        `${this.baseUrl}/${id}`,
        data,
        {
          headers,
          timeout: data instanceof FormData ? 60000 : 10000,
        }
      );

      console.log("Product updated successfully:", response.data);
      return response;
    } catch (error: any) {
      console.error(`ProductService: Update product ${id} error:`, error);

      if (error.response?.status === 413) {
        throw new Error(
          "File size too large. Please reduce image sizes and try again."
        );
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.message
      ) {
        throw new Error(error.response.data.message);
      } else if (error.code === "ECONNABORTED") {
        throw new Error(
          "Update timeout. Please check your internet connection and try again."
        );
      }

      throw error;
    }
  }

  async deleteProduct(id: string): Promise<DeleteProductResponse> {
    try {
      console.log(`Deleting product: ${id}`);

      const response = await apiClient.delete<DeleteProductResponse>(
        `${this.baseUrl}/${id}`
      );

      return response;
    } catch (error: any) {
      console.error(`ProductService: Delete product ${id} error:`, error);

      if (error.response?.status === 404) {
        throw new Error("Product not found. It may have already been deleted.");
      } else if (
        error.response?.status === 400 &&
        error.response?.data?.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  }
}

const productService = new ProductService();
export default productService;
