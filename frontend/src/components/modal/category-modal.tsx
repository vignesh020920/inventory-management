// src/components/forms/category-modal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CategoryForm } from "../forms/category-form";
import { CategoryView } from "../category/categoryView";
import { type Category } from "@/types/category";
import { ScrollArea } from "../ui/scroll-area";

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit" | "view";
  category?: Category | null;
  onSuccess?: () => void;
  handleEditCategory?: (category: Category) => void;
}

export function CategoryModal({
  open,
  onOpenChange,
  mode = "create",
  category = null,
  onSuccess,
  handleEditCategory,
}: CategoryModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const getModalTitle = () => {
    switch (mode) {
      case "create":
        return "Create New Category";
      case "edit":
        return "Edit Category";
      case "view":
        return "Category Details";
      default:
        return "Category";
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new product category to organize your inventory";
      case "edit":
        return "Update category information";
      case "view":
        return "View category details and information";
      default:
        return "";
    }
  };

  const handleEdit = () => {
    if (category && handleEditCategory) {
      onOpenChange(false); // Close current modal
      // Small delay to ensure smooth transition
      setTimeout(() => {
        handleEditCategory(category); // Open edit modal
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl md:max-w-3xl w-[90vw] max-h-[90vh] p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
          {mode === "view" ? (
            <CategoryView
              category={category}
              onClose={handleCancel}
              onEdit={handleEdit}
            />
          ) : (
            <CategoryForm
              mode={mode}
              category={category}
              onCancel={handleCancel}
              onSuccess={handleSuccess}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
