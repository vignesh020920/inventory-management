import apiClient from "./axiosInstance";

interface ProductStatsResponse {
  success: boolean;
  data: {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    discontinuedProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    newProducts: number;
    lowStockProducts: number;
  };
}

interface UserStatsResponse {
  success: boolean;
  data: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    newUsers: number;
    activeThisWeek: number;
  };
}

class DashboardService {
  async getProductStats(): Promise<ProductStatsResponse> {
    return await apiClient.get<ProductStatsResponse>(`products/stats`);
  }

  async getUserStats(): Promise<UserStatsResponse> {
    return await apiClient.get<UserStatsResponse>(`users/stats`);
  }
}

const dashboardService = new DashboardService();
export default dashboardService;
