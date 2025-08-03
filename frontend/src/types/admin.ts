// src/types/admin.ts
export interface Admin {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string | null;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpire?: Date;
  passwordResetToken?: string;
  passwordResetExpire?: Date;
  refreshToken?: string;
  lastLogin?: Date;
  status: "active" | "inactive" | "suspended";
  profile?: {
    bio?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };
    socialLinks?: {
      website?: string;
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface UpdateAdminProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface ChangeAdminPasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AdminProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: Admin;
  };
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface UploadAvatarResponse {
  success: boolean;
  message: string;
  data: {
    avatar: string;
  };
}
