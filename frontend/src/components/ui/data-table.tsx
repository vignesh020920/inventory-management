import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type Row,
  type ColumnMeta,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";

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
import { cn } from "@/lib/utils";
import { SearchInput } from "./search-input";
import { useState, useEffect } from "react";
import { parseISO, isValid as isDateValid } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  filterOptions?: {
    columnId: string;
    title: string;
    options: { value: string; label: string }[];
  }[];
  pagination?: boolean;
  selection?: boolean;
  defaultPageSize?: number;
}

type SearchType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "select"
  | "date-range";

// Add this type definition near your other types
export type ExtendedColumnMeta<TData> = {
  searchType?: SearchType;
  options?: { value: string; label: string }[];
} & ColumnMeta<TData, unknown>;

interface SmartGlobalSearchProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>;
  textColumns?: string[]; // Columns to search for text matches
  emailColumn?: string;
  numericColumns?: string[];
  dateColumns?: string[];
}

export function SmartGlobalSearch<TData>({
  table,
  textColumns = [],
  emailColumn = "email",
  numericColumns = [],
  dateColumns = ["createdAt"],
}: SmartGlobalSearchProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedFilter = useDebounce(globalFilter, 300);

  // Type detection utilities
  const isNumeric = (value: string) =>
    !isNaN(Number(value)) && value.trim() !== "";
  const isEmail = (value: string) => value.includes("@") && value.includes(".");
  const isValidDate = (value: string) => {
    try {
      return isDateValid(parseISO(value));
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!debouncedFilter) {
      // Reset all filters when search is cleared
      table.resetColumnFilters();
      return;
    }

    // Apply smart filtering based on input type
    if (isValidDate(debouncedFilter)) {
      dateColumns.forEach((col) => {
        table.getColumn(col)?.setFilterValue(parseISO(debouncedFilter));
      });
      return;
    }

    if (isNumeric(debouncedFilter)) {
      numericColumns.forEach((col) => {
        table.getColumn(col)?.setFilterValue(Number(debouncedFilter));
      });
      return;
    }

    if (isEmail(debouncedFilter)) {
      if (emailColumn) {
        table.getColumn(emailColumn)?.setFilterValue(debouncedFilter);
      }
      return;
    }

    // Default text search
    textColumns.forEach((col) => {
      table.getColumn(col)?.setFilterValue(debouncedFilter);
    });
  }, [debouncedFilter, table]);

  return (
    <div className="relative w-full sm:w-[300px]">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search anything..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

export function AdvancedTable<TData, TValue>({
  columns,
  data,
  pagination = true,
  selection = true,
  defaultPageSize = 5,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: defaultPageSize,
      },
    },
    enableRowSelection: selection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        {/* Global search */}
        <SmartGlobalSearch
          table={table}
          textColumns={["status"]}
          emailColumn="email"
          numericColumns={["amount"]}
          dateColumns={["date"]}
        />

        {/* Column-specific filters */}
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanFilter())
          .map((column) => {
            const meta = column.columnDef.meta as
              | ExtendedColumnMeta<any>
              | undefined;

            return (
              <div key={column.id} className="w-full sm:w-[200px]">
                <SearchInput
                  searchKey={column.id}
                  searchType={meta?.searchType}
                  options={meta?.options}
                  placeholder={`Filter ${column.id}...`}
                  value={column.getFilterValue()}
                  onChange={(value) => column.setFilterValue(value)}
                />
              </div>
            );
          })}
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Table Footer */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        {/* Row Selection Info */}
        {selection && (
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Components
// Updated reusable components with proper types

export function SortableHeader<TData>({
  column,
  title,
  className,
}: {
  column: Column<TData, unknown>;
  title: string;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={className}
    >
      {title}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function ActionsColumn<TData>({
  onView,
  onEdit,
  onDelete,
  customActions,
}: {
  onView?: (data: TData) => void;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  customActions?: {
    label: string;
    action: (data: TData) => void;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}): ColumnDef<TData> {
  return {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {onView && (
              <DropdownMenuItem onClick={() => onView(row.original)}>
                View
              </DropdownMenuItem>
            )}
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(row.original)}
              >
                Delete
              </DropdownMenuItem>
            )}
            {customActions && (
              <>
                <DropdownMenuSeparator />
                {customActions.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => action.action(row.original)}
                  >
                    {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };
}

// Define a type for status variants that matches the Badge component's variant prop
type StatusVariant = "default" | "secondary" | "destructive" | "outline";

export function StatusBadgeCell<TData>({
  row,
  columnId,
  statusMap,
}: {
  row: Row<TData>;
  columnId: string;
  statusMap: Record<
    string,
    {
      variant: StatusVariant;
      label?: string;
      icon?: React.ComponentType<{ className?: string }>;
    }
  >;
}) {
  const status = row.getValue(columnId) as string;
  const statusConfig = statusMap[status.toLowerCase()] || {
    variant: "default" as const,
    label: status,
  };
  const Icon = statusConfig.icon;

  // Custom color mappings (using Tailwind classes)
  const customColors: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-800 dark:text-amber-200 rounded",
    processing: "bg-blue-500/20 text-blue-800 dark:text-blue-200 rounded",
    success: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 rounded",
    failed: "bg-red-500/20 text-red-800 dark:text-red-200 rounded",
    custom1: "bg-purple-500/20 text-purple-800 dark:text-purple-200 rounded",
  };

  return (
    <Badge
      variant={statusConfig.variant}
      className={cn(
        customColors[status.toLowerCase()] || "bg-gray-500/20",
        "whitespace-nowrap" // optional
      )}
    >
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {statusConfig.label || status}
    </Badge>
  );
}
