import React, { useState, useEffect, useCallback } from "react";
import {
  Eye,
  Edit,
  Plus,
  Search,
  Trash2,
  Package,
  MoreHorizontal,
  Loader2,
  X,
  AlertTriangle,
  Filter,
  SortAsc,
  SortDesc,
  Calendar,
  Minus,
  Check,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProductStore } from "@/stores/productStore";
import { ProductModal } from "@/components/modal/product-modal";
import { type Product } from "@/types/product";
import { productToFormData } from "@/utils/productUtils";
// import { IMAGE_URL } from "@/lib/utils";

// Enhanced Stock status badge component with more colors
const StockBadge = ({ product }: { product: Product }) => {
  if (!product.inStock || product.stockQuantity === 0) {
    return (
      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Out of Stock
      </Badge>
    );
  } else if (product.stockQuantity <= 10) {
    return (
      <Badge className="bg-gradient-to-r from-orange-400 to-orange-500 text-white border-0 shadow-md">
        <TrendingDown className="h-3 w-3 mr-1" />
        Low Stock
      </Badge>
    );
  } else if (product.stockQuantity <= 50) {
    return (
      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-md">
        <TrendingUp className="h-3 w-3 mr-1" />
        Medium Stock
      </Badge>
    );
  } else {
    return (
      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md">
        <Check className="h-3 w-3 mr-1" />
        In Stock
      </Badge>
    );
  }
};

// Enhanced Status badge component with gradient colors
const StatusBadge = ({ status }: { status: string }) => {
  const getBadgeProps = () => {
    switch (status) {
      case "active":
        return {
          className:
            "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md",
          icon: <Check className="h-3 w-3 mr-1" />,
        };
      case "inactive":
        return {
          className:
            "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-md",
          icon: <Minus className="h-3 w-3 mr-1" />,
        };
      case "discontinued":
        return {
          className:
            "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md",
          icon: <X className="h-3 w-3 mr-1" />,
        };
      default:
        return {
          className:
            "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-md",
          icon: <Minus className="h-3 w-3 mr-1" />,
        };
    }
  };

  const { className, icon } = getBadgeProps();

  return (
    <Badge className={className}>
      {icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Enhanced Stock input component with better UI
const EditableStockInput = ({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate: (id: string, newStock: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(product.stockQuantity.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = () => {
    const newStock = parseInt(value);
    if (!isNaN(newStock) && newStock >= 0) {
      setIsUpdating(true);
      try {
        onUpdate(product._id, newStock);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update stock:", error);
        setValue(product.stockQuantity.toString());
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleCancel = () => {
    setValue(product.stockQuantity.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const quickAdjust = (delta: number) => {
    const newStock = Math.max(0, product.stockQuantity + delta);
    onUpdate(product._id, newStock);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className="w-16 h-8 text-sm text-center border-blue-300 focus:border-blue-500"
          type="number"
          min="0"
          autoFocus
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isUpdating}
          className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
        >
          {isUpdating ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isUpdating}
          className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {/* Quick decrease button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => quickAdjust(-1)}
        className="h-6 w-6 p-0 text-red-500 border-red-300 hover:bg-red-50"
        disabled={product.stockQuantity <= 0}
      >
        <Minus className="h-3 w-3" />
      </Button>

      {/* Stock display */}
      <div
        className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 px-3 py-1 rounded-lg min-w-[50px] text-center text-sm font-semibold border-2 border-transparent hover:border-blue-200 transition-all duration-200"
        onClick={() => setIsEditing(true)}
        title="Click to edit stock quantity"
      >
        <div className="flex items-center justify-center gap-1">
          <ShoppingCart className="h-3 w-3 text-blue-500" />
          <span className="text-blue-700 dark:text-blue-300">
            {product.stockQuantity}
          </span>
        </div>
      </div>

      {/* Quick increase button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => quickAdjust(1)}
        className="h-6 w-6 p-0 text-green-500 border-green-300 hover:bg-green-50"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

// Enhanced Product Card Component with colorful design
const ProductCard = ({
  product,
  isSelected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onStockUpdate,
}: {
  product: Product;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStockUpdate: (id: string, newStock: number) => void;
}) => {
  const firstImage = product.images?.[0];

  // Generate a random gradient for each card based on product ID
  const gradients = [
    "from-purple-400 via-pink-500 to-red-500",
    "from-blue-400 via-purple-500 to-pink-500",
    "from-green-400 via-blue-500 to-purple-500",
    "from-yellow-400 via-orange-500 to-red-500",
    "from-indigo-400 via-purple-500 to-pink-500",
    "from-teal-400 via-cyan-500 to-blue-500",
  ];

  const gradientIndex = product._id
    ? parseInt(product._id.slice(-1), 16) % gradients.length
    : 0;
  const cardGradient = gradients[gradientIndex];

  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group overflow-hidden ${
        isSelected
          ? "ring-2 ring-blue-400 shadow-2xl scale-[1.02] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
          : "bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-700"
      }`}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${cardGradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>

      <CardContent className="p-4 relative z-10">
        {/* Selection Checkbox with better styling */}
        <div className="absolute top-3 left-3 z-20">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-white border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 shadow-md"
          />
        </div>

        {/* Actions Dropdown with colorful styling */}
        <div className="absolute top-3 right-3 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 bg-background/90 backdrop-blur-md shadow-lg border border-border hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/95 backdrop-blur-md border border-border shadow-xl"
            >
              <DropdownMenuLabel className="text-foreground">
                Actions
              </DropdownMenuLabel>

              {/* View Details */}
              <DropdownMenuItem
                onClick={onView}
                className="hover:bg-blue-50 dark:hover:bg-blue-950/50 focus:bg-blue-50 dark:focus:bg-blue-950/50"
              >
                <Eye className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-foreground">View Details</span>
              </DropdownMenuItem>

              {/* Edit Product */}
              <DropdownMenuItem
                onClick={onEdit}
                className="hover:bg-emerald-50 dark:hover:bg-emerald-950/50 focus:bg-emerald-50 dark:focus:bg-emerald-950/50"
              >
                <Edit className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-foreground">Edit Product</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Delete Product */}
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 focus:bg-red-50 dark:focus:bg-red-950/50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-4">
          {/* Product Image with colorful border */}
          <div className="flex justify-center pt-6">
            <div
              className={`p-1 rounded-full bg-gradient-to-br ${cardGradient} shadow-lg`}
            >
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 bg-white">
                {/* <AvatarImage
                  src={`${IMAGE_URL}${firstImage?.url}`}
                  alt={firstImage?.alt || product.name}
                  className="object-cover"
                /> */}
                <AvatarImage
                  src={firstImage?.url}
                  alt={firstImage?.alt || product.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200">
                  <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Product Info with enhanced styling */}
          <div className="space-y-2 text-center">
            <h3 className="font-bold text-base sm:text-lg line-clamp-2 break-words text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 break-words bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                {product.description}
              </p>
            )}
          </div>

          {/* Status with enhanced design */}
          <div className="flex justify-center gap-2 flex-wrap">
            <StatusBadge status={product.status} />
          </div>

          {/* Stock section with colorful design */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-300">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Stock Management</span>
              </div>
              <EditableStockInput product={product} onUpdate={onStockUpdate} />
              <StockBadge product={product} />
            </div>
          </div>

          {/* Metadata with colorful design */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 text-blue-500" />
              <span>
                Created: {new Date(product.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons with gradient styling */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300 transition-all duration-200"
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 text-xs bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 transition-all duration-200"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProductCardList() {
  const {
    products,
    pagination,
    loading,
    error,
    filters,
    fetchProducts,
    updateProduct,
    deleteProduct,
    setFilters,
    clearError,
  } = useProductStore();

  const [localSearch, setLocalSearch] = useState(filters.search);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete states
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters({ search: searchTerm, page: 1 });
    }, 500),
    [setFilters]
  );

  // Fetch data on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle search
  useEffect(() => {
    debouncedSearch(localSearch);
  }, [localSearch, debouncedSearch]);

  // Handle stock update
  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      await updateProduct(productId, { stockQuantity: newStock });
    } catch (error) {
      console.error("Failed to update stock:", error);
      throw error;
    }
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(products.map((p) => p._id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Modal handlers
  const handleCreateProduct = () => {
    setModalMode("create");
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setModalMode("edit");
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setModalMode("view");
    setSelectedProduct(product);
    setModalOpen(true);
  };

  // Delete handlers
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete._id);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  // Bulk delete handlers
  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(
        Array.from(selectedProducts).map((id) => deleteProduct(id))
      );
      setSelectedProducts(new Set());
      setBulkDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete products:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteDialogOpen(false);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setFilters({ limit: newPageSize, page: 1 });
  };

  // Handle sorting
  const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
    setFilters({ sortBy, sortOrder, page: 1 });
  };

  const selectedCount = selectedProducts.size;
  const allSelected =
    products.length > 0 && selectedProducts.size === products.length;
  const someSelected =
    selectedProducts.size > 0 && selectedProducts.size < products.length;

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm">{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <CardContent className="p-5 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                Products
              </CardTitle>
              <p className="text-sm text-white/90">
                Manage your product inventory and details
                {pagination && (
                  <span className="ml-2">
                    ({pagination.totalProducts} total products)
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                onClick={handleCreateProduct}
                className="gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card className="py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Top Row - Search and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={localSearch}
                    onChange={(event) => setLocalSearch(event.target.value)}
                    className="pl-8 w-full sm:w-[300px] bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
                )}

                {selectedCount > 0 && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {selectedCount} selected
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="text-xs"
                    >
                      {isBulkDeleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete Selected
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                {/* Select All */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={allSelected}
                    ref={(el: any) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm">Select All</span>
                </div>
                {/* Sorting */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="gap-2 w-full sm:w-auto bg-white/80 backdrop-blur-sm"
                      >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Sort</span>
                        {filters.sortBy &&
                          (filters.sortOrder === "asc" ? (
                            <SortAsc className="h-4 w-4" />
                          ) : (
                            <SortDesc className="h-4 w-4" />
                          ))}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("name", "asc")}
                      >
                        Name (A-Z)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("name", "desc")}
                      >
                        Name (Z-A)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleSortChange("stockQuantity", "desc")
                        }
                      >
                        Stock (High to Low)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("stockQuantity", "asc")}
                      >
                        Stock (Low to High)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("createdAt", "desc")}
                      >
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSortChange("createdAt", "asc")}
                      >
                        Oldest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Second Row - Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              {/* Status Filter */}
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => {
                  setFilters({
                    status: value === "all" ? "" : value,
                    page: 1,
                  });
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px] bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              {/* Stock Filter */}
              <Select
                value={
                  filters.inStock !== undefined
                    ? filters.inStock.toString()
                    : "all"
                }
                onValueChange={(value) => {
                  const inStock =
                    value === "all" ? undefined : value === "true";
                  setFilters({ inStock, page: 1 });
                }}
              >
                <SelectTrigger className="w-full sm:w-[150px] bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="true">In Stock</SelectItem>
                  <SelectItem value="false">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(filters.search ||
                filters.status ||
                filters.inStock !== undefined) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocalSearch("");
                    setFilters({
                      search: "",
                      status: "",
                      inStock: undefined,
                      page: 1,
                    });
                  }}
                  className="h-8 px-2 lg:px-3 w-full sm:w-auto bg-white/80 backdrop-blur-sm"
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <span className="text-lg font-medium text-gray-600">
                Loading products...
              </span>
            </div>
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-gradient-to-br from-gray-50 to-white shadow-xl">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                  <Package className="h-12 w-12 text-blue-500" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    No products found
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {filters.search || filters.status
                      ? "Try adjusting your filters or search criteria"
                      : "Get started by adding your first product"}
                  </p>
                </div>
                <Button
                  onClick={handleCreateProduct}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div
            className={`grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`}
          >
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isSelected={selectedProducts.has(product._id)}
                onSelect={(checked) =>
                  handleSelectProduct(product._id, checked)
                }
                onView={() => handleViewProduct(product)}
                onEdit={() => handleEditProduct(product)}
                onDelete={() => handleDeleteProduct(product)}
                onStockUpdate={handleStockUpdate}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2">
                <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                  Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
                  {Math.min(
                    pagination.currentPage * filters.limit,
                    pagination.totalProducts
                  )}{" "}
                  of {pagination.totalProducts} products
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={`${filters.limit}`}
                      onValueChange={(value) =>
                        handlePageSizeChange(Number(value))
                      }
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={filters.limit} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[12, 24, 36, 48].map((pageSize) => (
                          <SelectItem key={pageSize} value={`${pageSize}`}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrevPage}
                    >
                      <span className="sr-only">Go to first page</span>
                      {"<<"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.hasPrevPage}
                    >
                      <span className="sr-only">Go to previous page</span>
                      {"<"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.hasNextPage}
                    >
                      <span className="sr-only">Go to next page</span>
                      {">"}
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => handlePageChange(pagination.totalPages)}
                      disabled={!pagination.hasNextPage}
                    >
                      <span className="sr-only">Go to last page</span>
                      {">>"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        viewData={
          modalMode === "view" && selectedProduct ? selectedProduct : undefined
        }
        formData={
          modalMode === "edit" && selectedProduct
            ? productToFormData(selectedProduct)
            : modalMode === "create"
            ? undefined
            : undefined
        }
        productId={selectedProduct?._id}
        onSuccess={() => {
          console.log("Product operation completed");
          setSelectedProduct(null);
        }}
        handleEditProduct={handleEditProduct}
      />

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the product "
              {productToDelete?.name}"?
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning:</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This action cannot be undone. This will permanently delete the
                  product and remove all associated data.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Product"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} selected products?
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning:</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  This action cannot be undone. This will permanently delete all
                  selected products and remove all associated data.
                </p>
                <div className="mt-2">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {selectedCount} products will be permanently deleted.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelBulkDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              disabled={isBulkDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isBulkDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting {selectedCount} products...
                </>
              ) : (
                `Delete ${selectedCount} Products`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
