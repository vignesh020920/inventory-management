// src/types/category.ts
export interface Category {
  _id: string;
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  productCount: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  status: "active" | "inactive";
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  status?: "active" | "inactive";
}

export interface CategoryOptions {
  value: string;
  label: string;
}

export interface CategoryOptionsResponse {
  success: boolean;
  data: {
    options: CategoryOptions[];
  };
}

export interface CategoryResponse {
  success: boolean;
  data: {
    category: Category;
  };
  message?: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCategories: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  message?: string;
}

// ADDED: Delete response interface for consistency
export interface DeleteCategoryResponse {
  success: boolean;
  message: string;
}
