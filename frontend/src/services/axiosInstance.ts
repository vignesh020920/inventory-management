// services/apiClient.ts
import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import type { ApiError } from "@/types/api";

class ApiClient {
  private instance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - let TypeScript infer types
    this.instance.interceptors.request.use(
      (config) => {
        // No explicit typing needed
        const token = useAuthStore.getState().token;

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        console.error("Request error:", error);
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const authStore = useAuthStore.getState();
            await authStore.refreshAuthToken();
            const newToken = useAuthStore.getState().token;

            this.processQueue(null, newToken);

            if (originalRequest.headers && newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }

            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private handleError(error: any): ApiError {
    const apiError: ApiError = {
      message: "An unexpected error occurred",
      status: error.response?.status,
      data: error.response?.data,
    };

    if (error.response) {
      const responseData = error.response.data;
      apiError.message =
        responseData?.message ||
        responseData?.error ||
        `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      apiError.message =
        "Network error - please check your internet connection";
    } else {
      apiError.message = error.message || "Request setup error";
    }

    return apiError;
  }

  async authRequest<T>(url: string, data?: any): Promise<T> {
    const response = await axios.post<T>(
      `${this.instance.defaults.baseURL}/${url}`,
      data
    );
    return response.data;
  }

  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = void>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }
}

const apiClient = new ApiClient(
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
);

export default apiClient;
export type { ApiError };
