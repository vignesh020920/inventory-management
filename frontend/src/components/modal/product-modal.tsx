import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductForm } from "../forms/product-form";
import { ProductView } from "../products/productView";
import {
  type Product,
  type CreateProductData,
  type UpdateProductData,
} from "@/types/product";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit" | "view";
  productId?: string;
  viewData?: Product | null;
  formData?: CreateProductData | UpdateProductData;
  onSuccess?: () => void;
  handleEditProduct?: (product: Product) => void;
}

export function ProductModal({
  open,
  onOpenChange,
  mode = "create",
  productId,
  viewData,
  formData,
  onSuccess,
  handleEditProduct,
}: ProductModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleEdit = () => {
    if (viewData && handleEditProduct) {
      onOpenChange(false);
      setTimeout(() => {
        handleEditProduct(viewData);
      }, 100);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Product";
      case "edit":
        return "Edit Product";
      case "view":
        return "Product Details";
      default:
        return "Product";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new product to your inventory with all the necessary details";
      case "edit":
        return "Update product information and specifications";
      case "view":
        return "View detailed information about this product";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          mode === "view"
            ? "max-w-4xl md:max-w-5xl lg:max-w-6xl"
            : "max-w-2xl md:max-w-3xl lg:max-w-4xl"
        } w-[95vw] sm:w-[90vw] max-h-[95vh] sm:max-h-[90vh] p-0`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] px-4 sm:px-6 pb-4 sm:pb-6">
          {mode === "view" ? (
            <ProductView
              product={viewData || null}
              onClose={() => onOpenChange(false)}
              onEdit={handleEdit}
            />
          ) : (
            <ProductForm
              mode={mode}
              productId={productId}
              initialData={formData}
              onSuccess={handleSuccess}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
