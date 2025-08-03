// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/authService";

export type UserRole = "admin" | "user" | "manager" | "guest";

export interface User {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
  avatar?: string;
  permissions?: string[];
  emailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  updateUserFromAdmin: (adminData: any) => void; // ADD THIS
  getUserRole: () => UserRole;
  setLoading: (loading: boolean) => void;
  hasPermission: (permission: string) => boolean;
  refreshAuthToken: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, token: string, refreshToken?: string) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error("Logout API error:", error);
        } finally {
          set({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          window.location.href = "/login";
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      // ADD: Sync method for admin account updates
      updateUserFromAdmin: (adminData: any) => {
        const currentUser = get().user;
        if (currentUser && adminData) {
          // Map admin data structure to user structure
          const updatedUserData: Partial<User> = {
            name: adminData.name || currentUser.name,
            email: adminData.email || currentUser.email,
            avatar:
              adminData.avatar !== undefined
                ? adminData.avatar
                : currentUser.avatar,
            emailVerified:
              adminData.isEmailVerified !== undefined
                ? adminData.isEmailVerified
                : currentUser.emailVerified,
          };

          set({ user: { ...currentUser, ...updatedUserData } });
        }
      },

      getUserRole: (): UserRole => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return "guest";
        return user.role || "user";
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      hasPermission: (permission: string): boolean => {
        const { user, isAuthenticated } = get();
        if (!isAuthenticated || !user) return false;
        return user.permissions?.includes(permission) || false;
      },

      refreshAuthToken: async () => {
        try {
          const { refreshToken } = get();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await authService.refreshToken();
          set({ token: response.token });
        } catch (error) {
          console.error("Token refresh failed:", error);
          get().logout();
        }
      },

      checkAuthStatus: async () => {
        const { token, isAuthenticated } = get();

        if (!token || !isAuthenticated) {
          return;
        }

        try {
          set({ isLoading: true });
          const response = await authService.getCurrentUser();
          set({ user: response.data, isLoading: false });
        } catch (error) {
          console.error("Auth check failed:", error);
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
