// src/stores/adminAccountStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import adminAccountService from "@/services/adminAccountService";
import { useAuthStore } from "./authStore"; // ADD THIS IMPORT
import {
  type Admin,
  type UpdateAdminProfileData,
  type ChangeAdminPasswordData,
} from "@/types/admin";

interface AdminAccountState {
  currentAdmin: Admin | null;
  loading: boolean;
  error: string | null;
  isUpdatingProfile: boolean;
  isChangingPassword: boolean;
  isUploadingAvatar: boolean;
}

interface AdminAccountActions {
  fetchCurrentProfile: () => Promise<void>;
  updateProfile: (data: UpdateAdminProfileData) => Promise<Admin>;
  changePassword: (data: ChangeAdminPasswordData) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  removeAvatar: () => Promise<void>;
  clearError: () => void;
  resetState: () => void;
  setCurrentAdmin: (admin: Admin | null) => void;
}

export const useAdminAccountStore = create<
  AdminAccountState & AdminAccountActions
>()(
  devtools(
    (set) => ({
      currentAdmin: null,
      loading: false,
      error: null,
      isUpdatingProfile: false,
      isChangingPassword: false,
      isUploadingAvatar: false,

      fetchCurrentProfile: async () => {
        set({ loading: true, error: null });
        try {
          const response = await adminAccountService.getCurrentProfile();
          const adminData = response.data.user;

          set({
            currentAdmin: adminData,
            loading: false,
          });

          // SYNC WITH AUTH STORE
          const { updateUserFromAdmin } = useAuthStore.getState();
          updateUserFromAdmin(adminData);
        } catch (error: any) {
          set({
            error: error.response?.data?.message || "Failed to fetch profile",
            loading: false,
          });
        }
      },

      updateProfile: async (data: UpdateAdminProfileData): Promise<Admin> => {
        set({ isUpdatingProfile: true, error: null });
        try {
          const response = await adminAccountService.updateProfile(data);
          const updatedAdmin = response.data.user;

          set({
            currentAdmin: updatedAdmin,
            isUpdatingProfile: false,
          });

          // SYNC WITH AUTH STORE
          const { updateUserFromAdmin } = useAuthStore.getState();
          updateUserFromAdmin(updatedAdmin);

          return updatedAdmin;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to update profile";
          set({
            error: errorMessage,
            isUpdatingProfile: false,
          });
          throw error;
        }
      },

      changePassword: async (data: ChangeAdminPasswordData): Promise<void> => {
        set({ isChangingPassword: true, error: null });
        try {
          await adminAccountService.changePassword(data);
          set({ isChangingPassword: false });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to change password";
          set({
            error: errorMessage,
            isChangingPassword: false,
          });
          throw error;
        }
      },

      uploadAvatar: async (file: File): Promise<string> => {
        set({ isUploadingAvatar: true, error: null });
        try {
          const response = await adminAccountService.uploadAvatar(file);
          const avatarUrl = response.data.avatar;

          // Update current admin with new avatar
          set((state) => ({
            currentAdmin: state.currentAdmin
              ? { ...state.currentAdmin, avatar: avatarUrl }
              : null,
            isUploadingAvatar: false,
          }));

          // SYNC WITH AUTH STORE
          const { updateUserFromAdmin } = useAuthStore.getState();
          updateUserFromAdmin({ avatar: avatarUrl });

          return avatarUrl;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to upload avatar";
          set({
            error: errorMessage,
            isUploadingAvatar: false,
          });
          throw error;
        }
      },

      removeAvatar: async (): Promise<void> => {
        set({ isUploadingAvatar: true, error: null });
        try {
          const response = await adminAccountService.removeAvatar();
          const updatedAdmin = response.data.user;

          set({
            currentAdmin: updatedAdmin,
            isUploadingAvatar: false,
          });

          // SYNC WITH AUTH STORE
          const { updateUserFromAdmin } = useAuthStore.getState();
          updateUserFromAdmin(updatedAdmin);
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Failed to remove avatar";
          set({
            error: errorMessage,
            isUploadingAvatar: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      resetState: () =>
        set({
          currentAdmin: null,
          loading: false,
          error: null,
          isUpdatingProfile: false,
          isChangingPassword: false,
          isUploadingAvatar: false,
        }),

      setCurrentAdmin: (admin: Admin | null) => set({ currentAdmin: admin }),
    }),
    {
      name: "admin-account-store",
    }
  )
);
