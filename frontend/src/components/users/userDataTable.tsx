// src/components/users/UserDataTable.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  type ColumnDef,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  Search,
  Trash2,
  Users,
  MoreHorizontal,
  Loader2,
  X,
  Mail,
  Shield,
  Clock,
  MapPin,
  Grid3X3,
  List,
  Filter,
  Check,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUserStore } from "@/stores/userStore";
import { UserModal } from "@/components/modal/user-modal";
import { type User } from "@/types/user";
import { IMAGE_URL } from "@/lib/utils";

// Fix TypeScript error by properly typing rowSelection
type RowSelection = Record<string, boolean>;

// Generate gradient based on user ID for consistent colors
const generateUserGradient = (userId: string) => {
  const gradients = [
    "from-blue-400 via-purple-500 to-pink-500",
    "from-green-400 via-blue-500 to-purple-500",
    "from-yellow-400 via-orange-500 to-red-500",
    "from-purple-400 via-pink-500 to-red-500",
    "from-indigo-400 via-purple-500 to-pink-500",
    "from-teal-400 via-cyan-500 to-blue-500",
    "from-orange-400 via-red-500 to-pink-500",
    "from-cyan-400 via-blue-500 to-purple-500",
  ];
  const index = userId ? parseInt(userId.slice(-1), 16) % gradients.length : 0;
  return gradients[index];
};

// Enhanced Status badge component with gradients
const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return (
      <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-sm text-xs">
        Unknown
      </Badge>
    );
  }

  const getStatusStyle = () => {
    switch (status) {
      case "active":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md";
      case "inactive":
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-md";
      case "suspended":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-md";
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0 shadow-md";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "active":
        return <Check className="h-3 w-3 mr-1" />;
      case "inactive":
        return <X className="h-3 w-3 mr-1" />;
      case "suspended":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Badge className={`${getStatusStyle()} text-xs`}>
      {getIcon()}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Enhanced Role badge component with gradients
const RoleBadge = ({ role }: { role: string }) => {
  const isAdmin = role === "admin";

  return (
    <Badge
      className={`text-xs ${
        isAdmin
          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md"
          : "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md"
      }`}
    >
      {isAdmin && <Shield className="h-3 w-3 mr-1" />}
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
};

// Enhanced Email verification badge
const EmailVerificationBadge = ({ isVerified }: { isVerified: boolean }) => {
  return (
    <Badge
      className={`text-xs ${
        isVerified
          ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-md"
          : "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-md"
      }`}
    >
      <Mail className="h-3 w-3 mr-1" />
      {isVerified ? "Verified" : "Unverified"}
    </Badge>
  );
};

// Enhanced Status toggle component
const StatusToggle = ({
  user,
  onUpdate,
}: {
  user: User;
  onUpdate: (id: string, status: "active" | "inactive" | "suspended") => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (
    newStatus: "active" | "inactive" | "suspended"
  ) => {
    setIsUpdating(true);
    try {
      await onUpdate(user._id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            className="h-auto p-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          >
            {isUpdating ? (
              <div className="flex items-center gap-2 px-3 py-1">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                <span className="text-xs">Updating...</span>
              </div>
            ) : (
              <StatusBadge status={user.status} />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleStatusChange("active")}>
            <Check className="mr-2 h-4 w-4 text-green-500" />
            Active
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("inactive")}>
            <X className="mr-2 h-4 w-4 text-gray-500" />
            Inactive
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("suspended")}>
            <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
            Suspended
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Enhanced Mobile user card component with better colors
const UserCard = ({
  user,
  isSelected,
  onSelect,
  onView,
  onDelete,
  onStatusUpdate,
}: {
  user: User;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onView: () => void;
  onDelete: () => void;
  onStatusUpdate: (
    id: string,
    status: "active" | "inactive" | "suspended"
  ) => void;
}) => {
  const cardGradient = generateUserGradient(user._id);

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] group ${
        isSelected
          ? "ring-2 ring-blue-400 shadow-xl scale-[1.02] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
          : "bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-gray-50 hover:to-white dark:hover:from-gray-800 dark:hover:to-gray-700"
      }`}
    >
      {/* Animated background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${cardGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      ></div>

      <CardContent className="p-4 relative z-10">
        <div className="flex items-start space-x-4">
          {/* Selection checkbox with better styling */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="mt-1 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 shadow-sm"
          />

          {/* Enhanced Avatar with gradient border */}
          <div
            className={`p-1 rounded-full bg-gradient-to-br ${cardGradient} shadow-lg group-hover:shadow-xl transition-all duration-300`}
          >
            <Avatar className="h-12 w-12 bg-white">
              <AvatarImage
                src={`${IMAGE_URL}${user.avatar}` || undefined}
                alt={user.name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* User info with enhanced styling */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                  {user.name}
                </h3>
                <p className="text-xs text-gray-500 truncate mb-1">
                  {user.email}
                </p>
                {user.profile?.phone && (
                  <p className="text-xs text-gray-400 truncate flex items-center gap-1">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {user.profile.phone}
                  </p>
                )}
              </div>

              {/* Enhanced Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <MoreHorizontal className="h-4 w-4 text-gray-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl"
                >
                  <DropdownMenuLabel className="text-gray-700">
                    Actions
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={onView}
                    className="hover:bg-blue-50"
                  >
                    <Eye className="mr-2 h-4 w-4 text-blue-500" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Enhanced Badges with better spacing */}
            <div className="flex flex-wrap gap-2 mt-3">
              <RoleBadge role={user.role} />
              <StatusToggle user={user} onUpdate={onStatusUpdate} />
              <EmailVerificationBadge isVerified={user.isEmailVerified} />
            </div>

            {/* Enhanced Additional info with icons and colors */}
            <div className="flex flex-wrap gap-4 mt-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {user.lastLogin && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded">
                    <Clock className="h-3 w-3 text-blue-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">
                    Last: {new Date(user.lastLogin).toLocaleDateString()}
                  </span>
                </div>
              )}
              {user.profile?.address?.city && (
                <div className="flex items-center gap-1 text-xs">
                  <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                    <MapPin className="h-3 w-3 text-green-500" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">
                    {user.profile.address.city}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs">
                <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                  <Calendar className="h-3 w-3 text-purple-500" />
                </div>
                <span className="text-gray-600 dark:text-gray-300">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile filters sheet
const MobileFiltersSheet = ({ children }: { children: React.ReactNode }) => (
  <Sheet>
    <SheetTrigger asChild>
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden bg-white/80 backdrop-blur-sm"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="h-[80vh]">
      <SheetHeader>
        <SheetTitle>Filter Users</SheetTitle>
        <SheetDescription>
          Apply filters to find specific users
        </SheetDescription>
      </SheetHeader>
      <div className="mt-6">{children}</div>
    </SheetContent>
  </Sheet>
);

export default function UserDataTable() {
  const {
    users,
    pagination,
    loading,
    error,
    filters,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    bulkDeleteUsers,
    setFilters,
    clearError,
  } = useUserStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    lastLogin: false,
    emailVerified: false,
  });

  // Fix TypeScript error by properly typing rowSelection
  const [rowSelection, setRowSelection] = useState<RowSelection>({});
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete states
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [usersToBulkDelete, setUsersToBulkDelete] = useState<User[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Fix: Calculate selectedRowsCount more reliably
  const selectedRowsCount = useMemo(() => {
    return Object.values(rowSelection).filter(Boolean).length;
  }, [rowSelection]);

  // Responsive view mode based on screen size
  useEffect(() => {
    const updateViewMode = () => {
      if (window.innerWidth < 1024) {
        setViewMode("cards");
      } else {
        setViewMode("table");
      }
    };

    updateViewMode();
    window.addEventListener("resize", updateViewMode);
    return () => window.removeEventListener("resize", updateViewMode);
  }, []);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters({ search: searchTerm, page: 1 });
    }, 500),
    [setFilters]
  );

  useEffect(() => {
    fetchUsers();
  }, [filters, fetchUsers]);

  useEffect(() => {
    debouncedSearch(localSearch);
  }, [localSearch, debouncedSearch]);

  // Handle status update
  const handleStatusUpdate = async (
    userId: string,
    newStatus: "active" | "inactive" | "suspended"
  ) => {
    try {
      await updateUserStatus(userId, newStatus);
    } catch (error) {
      console.error("Failed to update user status:", error);
      throw error;
    }
  };

  // Modal handlers
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Delete handlers
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await deleteUser(userToDelete._id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  // Bulk delete handlers
  const handleBulkDelete = () => {
    let usersToDelete: User[] = [];

    if (viewMode === "table") {
      const selectedRows = table.getFilteredSelectedRowModel().rows;
      if (selectedRows.length === 0) return;
      usersToDelete = selectedRows.map((row) => row.original);
    } else {
      usersToDelete = users.filter((user) => rowSelection[user._id]);
    }

    setUsersToBulkDelete(usersToDelete);
    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (usersToBulkDelete.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const userIds = usersToBulkDelete.map((user) => user._id);
      await bulkDeleteUsers(userIds);
      setRowSelection({});
      setBulkDeleteDialogOpen(false);
      setUsersToBulkDelete([]);
    } catch (error) {
      console.error("Failed to delete users:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteDialogOpen(false);
    setUsersToBulkDelete([]);
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

  const handleRoleChange = (value: string) => {
    const newFilters = {
      role: value === "all" ? "" : value,
      page: 1,
    };
    setFilters(newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = {
      status: value === "all" ? "" : value,
      page: 1,
    };
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setLocalSearch("");
    const newFilters = {
      search: "",
      role: "",
      status: "",
      page: 1,
    };
    setFilters(newFilters);
  };

  // Fix: Improved card selection handlers
  const handleCardSelect = (user: User, checked: boolean) => {
    setRowSelection((prev) => {
      const newSelection = { ...prev };
      if (checked) {
        newSelection[user._id] = true;
      } else {
        // Properly remove the selection
        delete newSelection[user._id];
      }
      return newSelection;
    });
  };

  const handleSelectAllCards = (checked: boolean) => {
    if (checked) {
      const newSelection: RowSelection = {};
      users.forEach((user) => {
        newSelection[user._id] = true;
      });
      setRowSelection(newSelection);
    } else {
      // Properly clear all selections
      setRowSelection({});
    }
  };

  // Fix: Better check for all cards selected
  const allCardsSelected =
    users.length > 0 && users.every((user) => rowSelection[user._id]);
  const someCardsSelected =
    users.some((user) => rowSelection[user._id]) && !allCardsSelected;

  // Define columns (keeping the existing column definitions but with enhanced styling)
  const columns: ColumnDef<User>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "avatar",
      header: () => <div className="text-center">Avatar</div>,
      cell: ({ row }) => {
        const user = row.original;
        const userGradient = generateUserGradient(user._id);
        return (
          <div className="flex justify-center">
            <div
              className={`p-1 rounded-full bg-gradient-to-br ${userGradient} shadow-md`}
            >
              <Avatar className="h-10 w-10 bg-white">
                <AvatarImage
                  src={`${IMAGE_URL}${user.avatar}` || undefined}
                  alt={user.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-semibold">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: () => (
        <div className="text-left">
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                filters.sortBy === "name" && filters.sortOrder === "asc";
              handleSortChange("name", isAsc ? "desc" : "asc");
            }}
            className="h-auto p-0 hover:bg-transparent justify-start"
          >
            User Details
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="space-y-1 min-w-[200px] text-left">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            {user.profile?.phone && (
              <div className="text-xs text-gray-400">{user.profile.phone}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: () => <div className="text-center">Role</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <RoleBadge role={row.original.role} />
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <StatusToggle user={row.original} onUpdate={handleStatusUpdate} />
      ),
    },
    {
      accessorKey: "emailVerified",
      header: () => <div className="text-center">Email Status</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <EmailVerificationBadge isVerified={row.original.isEmailVerified} />
        </div>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: () => <div className="text-center">Last Login</div>,
      cell: ({ row }) => {
        const lastLogin = row.original.lastLogin;
        return (
          <div className="text-center text-sm">
            {lastLogin ? (
              <div className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                {new Date(lastLogin).toLocaleDateString()}
              </div>
            ) : (
              <span className="text-gray-400">Never</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "profile.address",
      header: () => <div className="text-center">Location</div>,
      cell: ({ row }) => {
        const address = row.original.profile?.address;
        return (
          <div className="text-center text-sm">
            {address?.city && address?.country ? (
              <div className="flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3 text-green-500" />
                {address.city}, {address.country}
              </div>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                filters.sortBy === "createdAt" && filters.sortOrder === "asc";
              handleSortChange("createdAt", isAsc ? "desc" : "asc");
            }}
            className="h-auto p-0 hover:bg-transparent justify-start"
          >
            Joined Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl"
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => handleViewUser(user)}
                  className="hover:bg-blue-50"
                >
                  <Eye className="mr-2 h-4 w-4 text-blue-500" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteUser(user)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pagination?.totalPages || 0,
    rowCount: pagination?.totalUsers || 0,
    state: {
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: (pagination?.currentPage || 1) - 1,
        pageSize: filters.limit,
      },
    },
    getRowId: (row) => row._id,
  });

  // Filter component for reuse
  const FilterControls = () => (
    <div className="space-y-4">
      {/* Role Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Role</label>
        <Select value={filters.role || "all"} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={filters.status || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {(filters.search || filters.role || filters.status) && (
        <Button
          variant="outline"
          onClick={handleResetFilters}
          className="w-full"
        >
          <X className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      )}
    </div>
  );

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

      {/* Enhanced Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <CardContent className="p-5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                Users Management
              </CardTitle>
              <p className="text-sm text-white/90">
                Manage system users and their permissions
                {pagination && (
                  <span className="ml-2">
                    ({pagination.totalUsers} total users)
                  </span>
                )}
              </p>
            </div>

            {/* View Mode Toggle - Desktop only with proper dark mode support */}
            <div className="hidden lg:flex items-center border border-white/30 dark:border-gray-600/50 rounded-md bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm">
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`rounded-r-none border-0 transition-all duration-200 ${
                  viewMode === "table"
                    ? "bg-white/20 dark:bg-gray-700/80 text-white dark:text-gray-100 shadow-md"
                    : "text-white/80 dark:text-gray-300 hover:bg-white/15 dark:hover:bg-gray-700/50 hover:text-white dark:hover:text-gray-100"
                }`}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className={`rounded-l-none border-0 transition-all duration-200 ${
                  viewMode === "cards"
                    ? "bg-white/20 dark:bg-gray-700/80 text-white dark:text-gray-100 shadow-md"
                    : "text-white/80 dark:text-gray-300 hover:bg-white/15 dark:hover:bg-gray-700/50 hover:text-white dark:hover:text-gray-100"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Filters and Controls */}
      <Card className="py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Top Row - Search and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={localSearch}
                    onChange={(event) => setLocalSearch(event.target.value)}
                    className="pl-8 w-full sm:w-[300px] bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />
                )}

                {/* Fixed Bulk Actions - Show for both table and card views */}
                {selectedRowsCount > 0 && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Badge className="bg-blue-500 text-white text-center sm:text-left shadow-md animate-in fade-in-0 duration-200">
                      {selectedRowsCount} selected
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md animate-in fade-in-0 duration-200"
                    >
                      {isBulkDeleting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Delete {selectedRowsCount} user
                      {selectedRowsCount > 1 ? "s" : ""}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                {/* Mobile Filters */}
                <MobileFiltersSheet>
                  <FilterControls />
                </MobileFiltersSheet>

                {/* Desktop Column Visibility - Table view only */}
                {viewMode === "table" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="hidden lg:flex bg-white/80 backdrop-blur-sm"
                      >
                        Columns <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {table
                        .getAllColumns()
                        .filter((column) => column.getCanHide())
                        .map((column) => {
                          return (
                            <DropdownMenuCheckboxItem
                              key={column.id}
                              className="capitalize"
                              checked={column.getIsVisible()}
                              onCheckedChange={(value) =>
                                column.toggleVisibility(!!value)
                              }
                            >
                              {column.id.replace(/([A-Z])/g, " $1").trim()}
                            </DropdownMenuCheckboxItem>
                          );
                        })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {/* Desktop Filters Row */}
            <div className="hidden lg:flex items-center space-x-2">
              <Select
                value={filters.role || "all"}
                onValueChange={handleRoleChange}
              >
                <SelectTrigger className="w-[150px] bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.status || "all"}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[150px] bg-white/80 backdrop-blur-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>

              {(filters.search || filters.role || filters.status) && (
                <Button
                  variant="ghost"
                  onClick={handleResetFilters}
                  className="h-8 px-2 lg:px-3 bg-white/80 backdrop-blur-sm"
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "table" ? (
        /* Desktop Table View */
        <Card className="py-2 hidden lg:block bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-4">
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead
                            key={header.id}
                            className="whitespace-nowrap"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="hover:bg-muted/50"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className="whitespace-nowrap"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Loading users...
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <Users className="h-8 w-8 text-muted-foreground" />
                            <div className="text-muted-foreground">
                              No users found.
                            </div>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Mobile Cards View - Fixed */
        <div className="space-y-4">
          {/* Fixed Select All for Cards */}
          {users.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg lg:hidden border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={allCardsSelected}
                  ref={(el: any) => {
                    if (el) el.indeterminate = someCardsSelected;
                  }}
                  onCheckedChange={handleSelectAllCards}
                  className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Select All
                </span>
              </div>
              {selectedRowsCount > 0 && (
                <Badge className="bg-blue-500 text-white shadow-md animate-in fade-in-0 duration-200">
                  {selectedRowsCount} selected
                </Badge>
              )}
            </div>
          )}

          {/* User Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">
                  Loading users...
                </span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <Card className="bg-gradient-to-br from-gray-50 to-white shadow-xl">
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full">
                    <Users className="h-12 w-12 text-blue-500" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                      No users found
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {filters.search || filters.role || filters.status
                        ? "Try adjusting your filters or search criteria"
                        : "No users have been created yet"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  isSelected={!!rowSelection[user._id]}
                  onSelect={(checked) => handleCardSelect(user, checked)}
                  onView={() => handleViewUser(user)}
                  onDelete={() => handleDeleteUser(user)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-2">
              <div className="flex-1 text-sm text-muted-foreground order-2 sm:order-1 text-center sm:text-left">
                {selectedRowsCount > 0 && (
                  <span className="block sm:inline">
                    {selectedRowsCount} of {users.length} row(s) selected.{" "}
                  </span>
                )}
                Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * filters.limit,
                  pagination.totalUsers
                )}{" "}
                of {pagination.totalUsers} users
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
                      {[10, 20, 30, 40, 50].map((pageSize) => (
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
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <span className="sr-only">Go to previous page</span>
                    {"<"}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
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

      {/* Modals and Dialogs */}
      <UserModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={selectedUser}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the user "{userToDelete?.name}"?
              This action cannot be undone.
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
                "Delete User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Users</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete {usersToBulkDelete.length}{" "}
                  selected users?
                </p>

                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-900">
                  {usersToBulkDelete.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm font-medium">{user.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {user.email}
                      </Badge>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
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
                  Deleting {usersToBulkDelete.length} users...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {usersToBulkDelete.length} Users
                </>
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
