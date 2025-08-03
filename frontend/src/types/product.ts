export interface Product {
  _id: string;
  name: string;
  stockQuantity: number;
  inStock: boolean;
  images?: {
    url: string;
    alt?: string;
  }[];
  tags?: string[];
  description?: string;
  status: "active" | "inactive" | "discontinued";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

export interface DeleteProductResponse {
  success: boolean;
  message: string;
}

export interface CreateProductData {
  name: string;
  stockQuantity: number;
  images?: {
    url: string;
    alt?: string;
  }[];
  tags?: string[];
  description?: string;
  status?: "active" | "inactive" | "discontinued";
}

export interface UpdateProductData extends Partial<CreateProductData> {}
