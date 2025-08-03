import { create } from "zustand";
import { devtools } from "zustand/middleware";
import productService from "../services/productService";
import type {
  CreateProductData,
  UpdateProductData,
  Product,
} from "@/types/product";

interface ProductState {
  // State
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  selectedProduct: Product | null;
  loading: boolean;
  error: string | null;

  // UI State
  isFormSubmitting: boolean;
  isUploadingImages: boolean;

  // Simplified Filters (removed unwanted fields)
  filters: {
    page: number;
    limit: number;
    search: string;
    status: string;
    inStock?: boolean;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };

  // Actions
  fetchProducts: (params?: any) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: CreateProductData | FormData) => Promise<Product>;
  updateProduct: (
    id: string,
    data: UpdateProductData | FormData
  ) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: Partial<ProductState["filters"]>) => void;
  clearError: () => void;
  setSelectedProduct: (product: Product | null) => void;
  resetState: () => void;
}

export const useProductStore = create<ProductState>()(
  devtools(
    (set, get) => ({
      // Initial state
      products: [],
      pagination: null,
      selectedProduct: null,
      loading: false,
      error: null,
      isFormSubmitting: false,
      isUploadingImages: false,
      filters: {
        page: 1,
        limit: 12, // Changed default to 12 for better grid display
        search: "",
        status: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      },

      // Fetch all products with filters
      fetchProducts: async (customParams = {}) => {
        set({ loading: true, error: null });
        try {
          const { filters } = get();
          const params = { ...filters, ...customParams };

          const response = await productService.getProducts(params);
          set({
            products: response.data.products,
            pagination: response.data.pagination,
            loading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch products",
            loading: false,
          });
        }
      },

      // Fetch single product
      fetchProduct: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const response = await productService.getProductById(id);
          set({ selectedProduct: response.data.product, loading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to fetch product",
            loading: false,
          });
        }
      },

      // Create product with file upload support
      createProduct: async (
        data: CreateProductData | FormData
      ): Promise<Product> => {
        set({ isFormSubmitting: true, error: null });

        if (data instanceof FormData) {
          set({ isUploadingImages: true });
        }

        try {
          const response = await productService.createProduct(data);
          const newProduct = response.data.product;

          set((state) => ({
            products: [newProduct, ...state.products],
            isFormSubmitting: false,
            isUploadingImages: false,
          }));

          return newProduct;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to create product";
          set({
            error: errorMessage,
            isFormSubmitting: false,
            isUploadingImages: false,
          });
          throw error;
        }
      },

      // Update product with file upload support
      updateProduct: async (
        id: string,
        data: UpdateProductData | FormData
      ): Promise<Product> => {
        set({ isFormSubmitting: true, error: null });

        if (data instanceof FormData) {
          set({ isUploadingImages: true });
        }

        try {
          const response = await productService.updateProduct(id, data);
          const updatedProduct = response.data.product;

          set((state) => ({
            products: state.products.map((p) =>
              p._id === id ? updatedProduct : p
            ),
            selectedProduct:
              state.selectedProduct?._id === id
                ? updatedProduct
                : state.selectedProduct,
            isFormSubmitting: false,
            isUploadingImages: false,
          }));

          return updatedProduct;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to update product";
          set({
            error: errorMessage,
            isFormSubmitting: false,
            isUploadingImages: false,
          });
          throw error;
        }
      },

      // Delete product
      deleteProduct: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await productService.deleteProduct(id);

          set((state) => ({
            products: state.products.filter((p) => p._id !== id),
            selectedProduct:
              state.selectedProduct?._id === id ? null : state.selectedProduct,
            loading: false,
          }));
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              error.message ||
              "Failed to delete product",
            loading: false,
          });
        }
      },

      // Set filters and auto-fetch
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));

        // Auto-fetch with new filters
        get().fetchProducts();
      },

      // Utility actions
      clearError: () => set({ error: null }),
      setSelectedProduct: (product) => set({ selectedProduct: product }),
      resetState: () =>
        set({
          products: [],
          pagination: null,
          selectedProduct: null,
          loading: false,
          error: null,
          isFormSubmitting: false,
          isUploadingImages: false,
          filters: {
            page: 1,
            limit: 12,
            search: "",
            status: "",
            sortBy: "createdAt",
            sortOrder: "desc",
          },
        }),
    }),
    {
      name: "product-store",
    }
  )
);
