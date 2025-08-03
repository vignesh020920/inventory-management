import { create } from "zustand";
import { devtools } from "zustand/middleware";
import dashboardService from "../services/dashboardService";

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  discontinuedProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  newProducts: number;
  lowStockProducts: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  suspendedUsers: number;
  verifiedUsers: number;
  adminUsers: number;
  newUsers: number;
  activeThisWeek: number;
}

interface DashboardState {
  // State
  productStats: ProductStats | null;
  userStats: UserStats | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchProductStats: () => Promise<void>;
  fetchUserStats: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  devtools(
    (set, get) => ({
      // Initial state
      productStats: null,
      userStats: null,
      loading: false,
      error: null,

      // Fetch product statistics
      fetchProductStats: async () => {
        set({ loading: true, error: null });
        try {
          const response = await dashboardService.getProductStats();
          set({
            productStats: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch product statistics",
            loading: false,
          });
        }
      },

      // Fetch user statistics
      fetchUserStats: async () => {
        set({ loading: true, error: null });
        try {
          const response = await dashboardService.getUserStats();
          set({
            userStats: response.data,
            loading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch user statistics",
            loading: false,
          });
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),
      resetState: () =>
        set({
          productStats: null,
          userStats: null,
          loading: false,
          error: null,
        }),
    }),
    {
      name: "dashboard-store",
    }
  )
);
