import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from "../forms/user-form";
import { UserView } from "../users/userView";
import { type User } from "@/types/user";
import { ScrollArea } from "../ui/scroll-area";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "create" | "edit" | "view";
  user?: User | null;
  onSuccess?: () => void;
  handleEditUser?: (user: User) => void;
}

export function UserModal({
  open,
  onOpenChange,
  mode = "create",
  user = null,
  onSuccess,
  handleEditUser,
}: UserModalProps) {
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
        return "Create New User";
      case "edit":
        return "Edit User";
      case "view":
        return "User Details";
      default:
        return "User";
    }
  };

  const getModalDescription = () => {
    switch (mode) {
      case "create":
        return "Add a new user to the system with their details and permissions";
      case "edit":
        return "Update user information and settings";
      case "view":
        return "View detailed information about this user";
      default:
        return "";
    }
  };

  const handleEdit = () => {
    if (user && handleEditUser) {
      onOpenChange(false); // Close current modal
      // Small delay to ensure smooth transition
      setTimeout(() => {
        handleEditUser(user); // Open edit modal
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4 border-b bg-white dark:bg-gray-900">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-left">
            {getModalTitle()}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-left">
            {getModalDescription()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
          <div className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
            {mode === "view" ? (
              <UserView
                user={user}
                onClose={handleCancel}
                onEdit={handleEdit}
              />
            ) : (
              <UserForm
                mode={mode}
                user={user}
                onCancel={handleCancel}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
