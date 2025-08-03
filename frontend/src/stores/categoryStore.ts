// src/stores/categoryStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import categoryService from "../services/categoryService";
import type {
  CreateCategoryData,
  UpdateCategoryData,
  Category,
  CategoryOptions,
} from "@/types/category";

interface CategoryState {
  // State
  categories: Category[];
  categoryOptions: CategoryOptions[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCategories: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;

  // Filters
  filters: {
    page: number;
    limit: number;
    search: string;
    status: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };

  // Actions
  fetchCategories: (params?: any) => Promise<void>;
  fetchCategory: (id: string) => Promise<void>;
  fetchCategoryOptions: (status?: string) => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryData) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  setFilters: (filters: Partial<CategoryState["filters"]>) => void;
  clearError: () => void;
  setSelectedCategory: (category: Category | null) => void;
  resetState: () => void;
}

export const useCategoryStore = create<CategoryState>()(
  devtools(
    (set, get) => ({
      // Initial state
      categories: [],
      pagination: null,
      selectedCategory: null,
      categoryOptions: [],
      loading: false,
      error: null,
      filters: {
        page: 1,
        limit: 10,
        search: "",
        status: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      },

      // Fetch all categories with filters
      fetchCategories: async (customParams = {}) => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const params = { ...filters, ...customParams };

          const response = await categoryService.getCategories(params);
          set({
            categories: response.data.categories,
            pagination: response.data.pagination,
            loading: false,
          });
        } catch (error: any) {
          // IMPROVED: Better error typing
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch categories",
            loading: false,
          });
        }
      },

      // Fetch single category
      fetchCategory: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await categoryService.getCategoryById(id);
          set({ selectedCategory: response.data.category, loading: false });
        } catch (error: any) {
          // IMPROVED: Better error typing
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch category",
            loading: false,
          });
        }
      },

      // Fetch single category
      fetchCategoryOptions: async (status: string = "active") => {
        set({ error: null });
        try {
          const response = await categoryService.getCategoryOptions(status);
          set({ categoryOptions: response.data.options });
        } catch (error: any) {
          // IMPROVED: Better error typing
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch category",
          });
        }
      },

      // Create category
      createCategory: async (data: CreateCategoryData): Promise<Category> => {
        set({ loading: true, error: null });
        try {
          const response = await categoryService.createCategory(data);

          // IMPROVED: Add to local state instead of refetching
          const newCategory = response.data.category;
          set((state) => ({
            categories: [newCategory, ...state.categories],
            loading: false,
          }));

          // Optionally refresh to ensure pagination is correct
          // get().fetchCategories();

          return newCategory;
        } catch (error: any) {
          // IMPROVED: Better error typing
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to create category";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      // Update category
      updateCategory: async (
        id: string,
        data: UpdateCategoryData
      ): Promise<Category> => {
        set({ loading: true, error: null });
        try {
          const response = await categoryService.updateCategory(id, data);

          set((state) => ({
            categories: state.categories.map((c) =>
              c._id === id ? { ...c, ...data } : c
            ),
            selectedCategory:
              state.selectedCategory?._id === id
                ? { ...state.selectedCategory, ...data }
                : state.selectedCategory,
            loading: false,
          }));

          return response.data.category;
        } catch (error: any) {
          // IMPROVED: Better error typing
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update category";
          set({
            error: errorMessage,
            loading: false,
          });
          throw error;
        }
      },

      // Delete category
      deleteCategory: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await categoryService.deleteCategory(id);

          set((state) => ({
            categories: state.categories.filter((c) => c._id !== id),
            selectedCategory:
              state.selectedCategory?._id === id
                ? null
                : state.selectedCategory,
            loading: false,
          }));
        } catch (error: any) {
          // IMPROVED: Better error typing
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to delete category",
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
        get().fetchCategories();
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      resetState: () =>
        set({
          categories: [],
          pagination: null,
          selectedCategory: null,
          loading: false,
          error: null,
          filters: {
            page: 1,
            limit: 10,
            search: "",
            status: "",
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        }),
    }),
    {
      name: "category-store",
    }
  )
);
