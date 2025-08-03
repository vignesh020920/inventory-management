// src/types/user.ts
export interface User {
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

export interface UsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface UserFilters {
  page: number;
  limit: number;
  search: string;
  role: string;
  status: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface UserResponse {
  success: boolean;
  data: User;
}

export interface BulkDeleteData {
  userIds: string[];
}

export interface StatusUpdateData {
  status: "active" | "inactive" | "suspended";
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "user" | "admin";
  status?: "active" | "inactive" | "suspended";
  isEmailVerified?: boolean;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}
