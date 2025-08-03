import type { Product, CreateProductData } from "@/types/product";

export const productToFormData = (product: Product): CreateProductData => {
  return {
    name: product.name,
    stockQuantity: product.stockQuantity,
    images: product.images || [],
    tags: product.tags || [],
    description: product.description || "",
    status: product.status,
  };
};

export const formatStockStatus = (
  product: Product
): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} => {
  if (!product.inStock || product.stockQuantity === 0) {
    return {
      label: "Out of Stock",
      variant: "destructive",
      color: "text-red-600",
    };
  } else if (product.stockQuantity <= 10) {
    return {
      label: "Low Stock",
      variant: "outline",
      color: "text-orange-600",
    };
  } else {
    return {
      label: "In Stock",
      variant: "default",
      color: "text-green-600",
    };
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "active":
      return "text-green-600";
    case "inactive":
      return "text-gray-600";
    case "discontinued":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};
