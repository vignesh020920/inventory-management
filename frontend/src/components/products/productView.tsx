import { format } from "date-fns";
import {
  Calendar,
  Package,
  Edit,
  X,
  Clock,
  Tag,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type Product } from "@/types/product";
// import { IMAGE_URL } from "@/lib/utils";

interface ProductViewProps {
  product: Product | null;
  onClose: () => void;
  onEdit?: () => void;
}

export function ProductView({ product, onClose, onEdit }: ProductViewProps) {
  if (!product) {
    return (
      <div className="flex items-center justify-center h-64 p-4">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No product data available</p>
        </div>
      </div>
    );
  }

  // Stock status component
  const StockStatus = () => {
    if (!product.inStock || product.stockQuantity === 0) {
      return (
        <Badge variant="destructive" className="text-xs sm:text-sm">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Out of Stock
        </Badge>
      );
    } else if (product.stockQuantity <= 10) {
      return (
        <Badge
          variant="outline"
          className="text-orange-600 border-orange-600 text-xs sm:text-sm"
        >
          <AlertTriangle className="h-3 w-3 mr-1" />
          Low Stock
        </Badge>
      );
    } else {
      return (
        <Badge variant="default" className="bg-green-600 text-xs sm:text-sm">
          In Stock
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex-shrink-0">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold break-words">
                  {product.name}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge
                    variant={
                      product.status === "active"
                        ? "default"
                        : product.status === "inactive"
                        ? "secondary"
                        : "destructive"
                    }
                    className="text-xs sm:text-sm"
                  >
                    {product.status.charAt(0).toUpperCase() +
                      product.status.slice(1)}
                  </Badge>
                  <StockStatus />
                </div>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0 self-start">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Product Images */}
      {product.images && product.images.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Product Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img
                    // src={`${IMAGE_URL}${image.url}`}
                    src={image.url}
                    alt={image.alt || `Product image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Basic Information */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Product Name
              </label>
              <p className="text-base font-medium mt-1 break-words">
                {product.name}
              </p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-base mt-1 leading-relaxed">
                {product.description || (
                  <span className="text-muted-foreground italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Status
              </label>
              <div className="mt-1">
                <Badge
                  variant={
                    product.status === "active"
                      ? "default"
                      : product.status === "inactive"
                      ? "secondary"
                      : "destructive"
                  }
                  className="text-sm"
                >
                  {product.status.charAt(0).toUpperCase() +
                    product.status.slice(1)}
                </Badge>
              </div>
            </div>

            {product.tags && product.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Tags
                  </label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {product.tags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Stock & Inventory */}
        <Card className="h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              Stock & Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Stock Quantity
              </label>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <span className="text-base font-medium">
                  {product.stockQuantity} units
                </span>
                <StockStatus />
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Stock Status
              </label>
              <div className="mt-1">
                <div
                  className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    product.inStock
                      ? "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                  }`}
                >
                  {product.inStock ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Available
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      Out of Stock
                    </>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Low Stock Alert
              </label>
              <p className="text-sm mt-1 text-muted-foreground">
                {product.stockQuantity <= 10 ? (
                  <span className="text-orange-600 font-medium">
                    ⚠️ Stock is running low
                  </span>
                ) : (
                  <span className="text-green-600">
                    ✅ Stock levels are healthy
                  </span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metadata */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Product ID
              </label>
              <p className="text-sm font-mono mt-1 bg-muted px-2 py-1 rounded break-all">
                {product._id}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Created Date
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {format(
                    new Date(product.createdAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Last Updated
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {format(
                    new Date(product.updatedAt),
                    "MMM dd, yyyy 'at' h:mm a"
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
              Product created{" "}
              {format(new Date(product.createdAt), "MMMM dd, yyyy")}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 order-1 sm:order-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
              {onEdit && (
                <Button onClick={onEdit} className="w-full sm:w-auto">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
