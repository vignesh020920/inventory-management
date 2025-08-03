// src/components/categories/CategoryDataTable.tsx
import { useState, useEffect, useCallback } from "react";
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
  Edit,
  Plus,
  Search,
  Download,
  Trash2,
  FolderOpen,
  MoreHorizontal,
  Loader2,
  X,
  AlertTriangle,
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
import { useCategoryStore } from "@/stores/categoryStore";
import { CategoryModal } from "@/components/modal/category-modal";
import { type Category } from "@/types/category";

// Status badge component
const StatusBadge = ({ status }: { status?: string }) => {
  // Handle undefined/null status
  if (!status) {
    return (
      <Badge variant="secondary" className="text-xs">
        Unknown
      </Badge>
    );
  }

  return (
    <Badge variant={status === "active" ? "default" : "secondary"}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Product count badge component
const ProductCountBadge = ({ count }: { count: number }) => {
  return (
    <Badge
      variant="outline"
      className={`${
        count > 0 ? "text-blue-600 border-blue-600" : "text-gray-500"
      }`}
    >
      {count} {count === 1 ? "Product" : "Products"}
    </Badge>
  );
};

// Status toggle component
const StatusToggle = ({
  category,
  onUpdate,
}: {
  category: Category;
  onUpdate: (id: string, status: "active" | "inactive") => void;
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = () => {
    setIsUpdating(true);
    try {
      const newStatus = category.status === "active" ? "inactive" : "active";
      onUpdate(category._id, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        disabled={isUpdating}
        className="h-auto p-1"
      >
        {isUpdating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <StatusBadge status={category.status} />
        )}
      </Button>
    </div>
  );
};

export default function CategoryDataTable() {
  const {
    categories,
    pagination,
    loading,
    error,
    filters,
    fetchCategories,
    updateCategory,
    deleteCategory,
    setFilters,
    clearError,
  } = useCategoryStore();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    createdAt: false,
  });
  const [rowSelection, setRowSelection] = useState({});
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk delete states
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [categoriesToBulkDelete, setCategoriesToBulkDelete] = useState<
    Category[]
  >([]);
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
    fetchCategories();
  }, [fetchCategories]);

  // Handle search
  useEffect(() => {
    debouncedSearch(localSearch);
  }, [localSearch, debouncedSearch]);

  // Handle status update
  const handleStatusUpdate = async (
    categoryId: string,
    newStatus: "active" | "inactive"
  ) => {
    try {
      console.log(categoryId, newStatus);
      await updateCategory(categoryId, { status: newStatus });
    } catch (error) {
      console.error("Failed to update category status:", error);
      throw error;
    }
  };

  // Modal handlers
  const handleCreateCategory = () => {
    setModalMode("create");
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleViewCategory = (category: Category) => {
    setModalMode("view");
    setSelectedCategory(category);
    setModalOpen(true);
  };

  // Delete handlers
  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await deleteCategory(categoryToDelete._id);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };

  // Bulk delete handlers
  const handleBulkDelete = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    const categoriesToDelete = selectedRows.map((row) => row.original);
    setCategoriesToBulkDelete(categoriesToDelete);
    setBulkDeleteDialogOpen(true);
  };

  // Add new function to confirm bulk delete
  const confirmBulkDelete = async () => {
    if (categoriesToBulkDelete.length === 0) return;

    const categoriesWithoutProducts = categoriesToBulkDelete.filter(
      (cat) => cat.productCount === 0
    );

    if (categoriesWithoutProducts.length === 0) {
      // All categories have products - cannot delete any
      return;
    }

    setIsBulkDeleting(true);
    try {
      // Only delete categories without products
      await Promise.all(
        categoriesWithoutProducts.map((category) =>
          deleteCategory(category._id)
        )
      );
      setRowSelection({});
      setBulkDeleteDialogOpen(false);
      setCategoriesToBulkDelete([]);

      // Show success message if some were skipped
      const skippedCount =
        categoriesToBulkDelete.length - categoriesWithoutProducts.length;
      if (skippedCount > 0) {
        console.log(
          `${categoriesWithoutProducts.length} categories deleted, ${skippedCount} skipped (contain products)`
        );
      }
    } catch (error) {
      console.error("Failed to delete categories:", error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Add function to cancel bulk delete
  const cancelBulkDelete = () => {
    setBulkDeleteDialogOpen(false);
    setCategoriesToBulkDelete([]);
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

  // Define columns
  const columns: ColumnDef<Category>[] = [
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
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
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
            Category Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="space-y-1 min-w-[200px] text-left">
            <div className="font-medium flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-blue-600" />
              {category.name}
            </div>
            {category.description && (
              <div className="text-sm text-gray-500 line-clamp-2 max-w-[250px]">
                {category.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="text-center">Status</div>,
      cell: ({ row }) => (
        <StatusToggle category={row.original} onUpdate={handleStatusUpdate} />
      ),
    },
    {
      accessorKey: "productCount",
      header: () => <div className="text-center">Products</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <ProductCountBadge count={row.original.productCount} />
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => {
              const isAsc =
                filters.sortBy === "createdAt" && filters.sortOrder === "asc";
              handleSortChange("createdAt", isAsc ? "desc" : "asc");
            }}
            className="h-auto p-0 hover:bg-transparent"
          >
            Created
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
        const category = row.original;
        const hasProducts = category.productCount > 0;

        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleViewCategory(category)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Category
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteCategory(category)}
                  className={hasProducts ? "text-gray-400" : "text-red-600"}
                  disabled={hasProducts}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Category
                  {hasProducts && <AlertTriangle className="ml-2 h-4 w-4" />}
                </DropdownMenuItem>
                {hasProducts && (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    Cannot delete: contains products
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: categories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pagination?.totalPages || 0,
    rowCount: pagination?.totalCategories || 0,
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

  const selectedRowsCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <Card className="py-2">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FolderOpen className="h-6 w-6" />
                Categories
              </CardTitle>
              <p className="text-muted-foreground">
                Manage product categories to organize your inventory
                {pagination && (
                  <span className="ml-2">
                    ({pagination.totalCategories} total categories)
                  </span>
                )}
              </p>
            </div>
            <Button onClick={handleCreateCategory} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Controls */}
      <Card className="py-2">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* Top Row - Search and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={localSearch}
                    onChange={(event) => setLocalSearch(event.target.value)}
                    className="pl-8 w-[300px]"
                  />
                </div>

                {loading && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}

                {/* Bulk Actions */}
                {selectedRowsCount > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                  >
                    {isBulkDeleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete {selectedRowsCount} items
                  </Button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Column Visibility */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
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

                {/* Export Button */}
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Second Row - Filters */}
            <div className="flex items-center space-x-2">
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
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(filters.search || filters.status) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setLocalSearch("");
                    setFilters({
                      search: "",
                      status: "",
                      page: 1,
                    });
                  }}
                  className="h-8 px-2 lg:px-3"
                >
                  Reset
                  <X className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="py-2">
        <CardContent className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
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
                        <TableCell key={cell.id}>
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
                          Loading categories...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FolderOpen className="h-8 w-8 text-muted-foreground" />
                          <div className="text-muted-foreground">
                            No categories found.
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateCategory}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add your first category
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Server-side Pagination */}
          {pagination && (
            <div className="flex items-center justify-between space-x-2 p-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {selectedRowsCount > 0 && (
                  <span>
                    {selectedRowsCount} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.{" "}
                  </span>
                )}
                Showing {(pagination.currentPage - 1) * filters.limit + 1} to{" "}
                {Math.min(
                  pagination.currentPage * filters.limit,
                  pagination.totalCategories
                )}{" "}
                of {pagination.totalCategories} categories
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
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
          )}
        </CardContent>
      </Card>

      {/* Category Modal */}
      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        category={selectedCategory}
        onSuccess={() => {
          fetchCategories();
          setModalOpen(false);
        }}
        handleEditCategory={handleEditCategory}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"?
              {categoryToDelete?.productCount &&
              categoryToDelete.productCount > 0 ? (
                <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium">Warning:</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    This category contains {categoryToDelete.productCount}{" "}
                    product(s). You cannot delete a category that contains
                    products.
                  </p>
                </div>
              ) : (
                "This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting || (categoryToDelete?.productCount || 0) > 0}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Category"
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
            <AlertDialogTitle>Delete Multiple Categories</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  Are you sure you want to delete{" "}
                  {categoriesToBulkDelete.length} selected categories?
                </p>

                {/* Show list of categories to be deleted */}
                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50 dark:bg-gray-900">
                  {categoriesToBulkDelete.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                      <Badge
                        variant={
                          category.productCount > 0 ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {category.productCount} products
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Warning for categories with products */}
                {categoriesToBulkDelete.some((cat) => cat.productCount > 0) && (
                  <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">Warning:</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      {
                        categoriesToBulkDelete.filter(
                          (cat) => cat.productCount > 0
                        ).length
                      }{" "}
                      of the selected categories contain products and cannot be
                      deleted. Only categories without products will be deleted.
                    </p>
                  </div>
                )}

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
                  Deleting {categoriesToBulkDelete.length} categories...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete {categoriesToBulkDelete.length} Categories
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
