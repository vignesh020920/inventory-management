// src/stores/userStore.ts
import { create } from "zustand";
import userService from "@/services/userService";
import { type UpdateUserData, type User, type UserFilters } from "@/types/user";

interface UserState {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  loading: boolean;
  error: string | null;
  filters: UserFilters;
}

interface UserActions {
  fetchUsers: () => Promise<void>;
  getUserById: (id: string) => Promise<User | null>;
  updateUserStatus: (
    userId: string,
    status: "active" | "inactive" | "suspended"
  ) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  bulkDeleteUsers: (userIds: string[]) => Promise<void>;
  setFilters: (newFilters: Partial<UserFilters>) => void;
  clearError: () => void;
  exportUsers: () => Promise<void>;
  updateUser: (userId: string, data: UpdateUserData) => Promise<User>;
}

const defaultFilters: UserFilters = {
  page: 1,
  limit: 10,
  search: "",
  role: "",
  status: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  users: [],
  pagination: null,
  loading: false,
  error: null,
  filters: defaultFilters,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await userService.getUsers(get().filters);
      set({
        users: response.data.users,
        pagination: response.data.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch users",
        loading: false,
      });
    }
  },

  getUserById: async (id: string) => {
    try {
      const response = await userService.getUserById(id);
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch user",
      });
      return null;
    }
  },

  updateUserStatus: async (
    userId: string,
    status: "active" | "inactive" | "suspended"
  ) => {
    try {
      await userService.updateUserStatus(userId, { status });

      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? { ...user, status } : user
        ),
      }));

      // Refresh data to ensure consistency
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error?.message || "Failed to update user status",
      });
      throw error;
    }
  },

  updateUser: async (userId: string, data: UpdateUserData): Promise<User> => {
    try {
      const response = await userService.updateUser(userId, data);
      const updatedUser = response.data.user;

      // Update local state
      set((state) => ({
        users: state.users.map((user) =>
          user._id === userId ? updatedUser : user
        ),
      }));

      // Refresh data to ensure consistency
      await get().fetchUsers();

      return updatedUser;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update user",
      });
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    try {
      await userService.deleteUser(userId);

      // Remove from local state
      set((state) => ({
        users: state.users.filter((user) => user._id !== userId),
      }));

      // Refresh data to update pagination
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete user",
      });
      throw error;
    }
  },

  bulkDeleteUsers: async (userIds: string[]) => {
    try {
      await userService.bulkDeleteUsers({ userIds });

      // Remove from local state
      set((state) => ({
        users: state.users.filter((user) => !userIds.includes(user._id)),
      }));

      // Refresh data to update pagination
      await get().fetchUsers();
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete users",
      });
      throw error;
    }
  },

  setFilters: (newFilters: Partial<UserFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearError: () => {
    set({ error: null });
  },

  exportUsers: async () => {
    try {
      const blob = await userService.exportUsers(get().filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to export users",
      });
      throw error;
    }
  },
}));
