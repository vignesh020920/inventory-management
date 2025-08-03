import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserView } from "../users/userView";
import { type User } from "@/types/user";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function UserModal({ open, onOpenChange, user }: UserModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:w-[90vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl max-h-[95vh] sm:max-h-[90vh] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 sm:pb-4 border-b bg-white dark:bg-gray-900">
          <DialogTitle className="text-lg sm:text-xl font-semibold text-left">
            User Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-left">
            View detailed information about this user
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
          <div className="px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
            <UserView user={user} onClose={() => onOpenChange(false)} />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
