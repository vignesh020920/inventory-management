import { create } from "zustand";
import { devtools } from "zustand/middleware";
import userService from "../services/userService";
import type { CreateUserData, UpdateUserData, User } from "@/types/user";

interface UserState {
  // State
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  selectedUser: User | null;
  loading: boolean;
  error: string | null;

  // Filters
  filters: {
    page: number;
    limit: number;
    search: string;
    role: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };

  // Actions
  fetchUsers: (params?: any) => Promise<void>;
  fetchUser: (id: string) => Promise<void>;
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: string, data: UpdateUserData) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  bulkDeleteUsers: (userIds: string[]) => Promise<void>;
  updateUserStatus: (
    id: string,
    status: "active" | "inactive" | "suspended"
  ) => Promise<void>;
  setFilters: (filters: Partial<UserState["filters"]>) => void;
  clearError: () => void;
  setSelectedUser: (user: User | null) => void;
  resetState: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // Initial state
      users: [],
      pagination: null,
      selectedUser: null,
      loading: false,
      error: null,
      filters: {
        page: 1,
        limit: 10,
        search: "",
        role: "",
        status: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      },

      // Fetch all users with filters
      fetchUsers: async (customParams = {}) => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const params = { ...filters, ...customParams };

          const response = await userService.getUsers(params);
          set({
            users: response.data.users,
            pagination: response.data.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch users",
            loading: false,
          });
        }
      },

      // Fetch single user
      fetchUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await userService.getUserById(id);
          set({ selectedUser: response.data.user, loading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch user",
            loading: false,
          });
        }
      },

      // Create user
      createUser: async (data: CreateUserData): Promise<User> => {
        set({ loading: true, error: null });
        try {
          const response = await userService.createUser(data);
          const newUser = response.data.user;

          set((state) => ({
            users: [newUser, ...state.users],
            loading: false,
          }));

          return newUser;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to create user";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      // Update user
      updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
        set({ loading: true, error: null });
        try {
          const response = await userService.updateUser(id, data);

          set((state) => ({
            users: state.users.map((u) =>
              u._id === id ? { ...u, ...data } : u
            ),
            selectedUser:
              state.selectedUser?._id === id
                ? { ...state.selectedUser, ...data }
                : state.selectedUser,
            loading: false,
          }));

          return response.data.user;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update user";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      // Delete user
      deleteUser: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await userService.deleteUser(id);

          set((state) => ({
            users: state.users.filter((u) => u._id !== id),
            selectedUser:
              state.selectedUser?._id === id ? null : state.selectedUser,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to delete user",
            loading: false,
          });
        }
      },

      // Bulk delete users
      bulkDeleteUsers: async (userIds: string[]) => {
        set({ loading: true, error: null });
        try {
          await userService.bulkDeleteUsers(userIds);

          set((state) => ({
            users: state.users.filter((u) => !userIds.includes(u._id)),
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to delete users",
            loading: false,
          });
        }
      },

      // Update user status
      updateUserStatus: async (
        id: string,
        status: "active" | "inactive" | "suspended"
      ) => {
        set({ loading: true, error: null });
        try {
          await userService.updateUserStatus(id, status);

          set((state) => ({
            users: state.users.map((u) =>
              u._id === id ? { ...u, status } : u
            ),
            selectedUser:
              state.selectedUser?._id === id
                ? { ...state.selectedUser, status }
                : state.selectedUser,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to update user status",
            loading: false,
          });
        }
      },

      // Set filters
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));

        // Auto-fetch with new filters
        get().fetchUsers();
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setSelectedUser: (user) => set({ selectedUser: user }),
      resetState: () =>
        set({
          users: [],
          pagination: null,
          selectedUser: null,
          loading: false,
          error: null,
          filters: {
            page: 1,
            limit: 10,
            search: "",
            role: "",
            status: "",
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        }),
    }),
    {
      name: "user-store",
    }
  )
);
