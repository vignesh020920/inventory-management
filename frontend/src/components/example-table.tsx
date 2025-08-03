import {
  AdvancedTable,
  SortableHeader,
  ActionsColumn,
  StatusBadgeCell,
  type ExtendedColumnMeta,
} from "@/components/ui/data-table";
import { type Table, type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { Input } from "./ui/input";
import React, { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
  date: string;
};

const data: Payment[] = [
  {
    id: "728ed52f",
    amount: 100,
    status: "pending",
    email: "m@example.com",
    date: "2023-11-23",
  },
  {
    id: "a1b2c3d4",
    amount: 250,
    status: "processing",
    email: "jane.doe@example.com",
    date: "2023-11-24",
  },
  {
    id: "e5f6g7h8",
    amount: 75,
    status: "success",
    email: "john.smith@example.com",
    date: "2023-11-25",
  },
  {
    id: "i9j0k1l2",
    amount: 300,
    status: "failed",
    email: "alice.wonder@example.com",
    date: "2023-11-26",
  },
  {
    id: "m3n4o5p6",
    amount: 150,
    status: "pending",
    email: "bob.builder@example.com",
    date: "2023-11-27",
  },
  {
    id: "q7r8s9t0",
    amount: 200,
    status: "processing",
    email: "charlie.brown@example.com",
    date: "2023-11-28",
  },
  {
    id: "u1v2w3x4",
    amount: 50,
    status: "success",
    email: "dora.explorer@example.com",
    date: "2023-11-29",
  },
  {
    id: "y5z6a7b8",
    amount: 400,
    status: "failed",
    email: "elmo.red@example.com",
    date: "2023-11-30",
  },
  {
    id: "c9d0e1f2",
    amount: 120,
    status: "pending",
    email: "fred.flintstone@example.com",
    date: "2023-12-01",
  },
  {
    id: "g3h4i5j6",
    amount: 180,
    status: "success",
    email: "george.curious@example.com",
    date: "2023-12-02",
  },
];

const statusMap = {
  pending: {
    variant: "warning",
    label: "Pending",
    icon: Clock,
  },
  processing: {
    variant: "secondary",
    label: "Processing",
    icon: Loader2,
  },
  success: {
    variant: "success",
    label: "Success",
    icon: CheckCircle,
  },
  failed: {
    variant: "destructive",
    label: "Failed",
    icon: XCircle,
  },
};
interface EmailHeaderProps {
  table: Table<Payment>;
}

const EmailHeader = React.memo(({ table }: EmailHeaderProps) => {
  const column = table.getColumn("email");
  if (!column) {
    console.error("Email column not found in table");

    return (
      <div className="flex flex-col m-2 gap-2">
        <div>Email</div>
      </div>
    );
  }

  const [inputValue, setInputValue] = useState(
    (column?.getFilterValue() as string) ?? ""
  );

  // Using our custom hook with 300ms delay and 1000ms maxWait
  const debouncedValue = useDebounce(inputValue, 300, { maxWait: 1000 });

  useEffect(() => {
    column?.setFilterValue(debouncedValue);
  }, [debouncedValue, column]);

  return (
    <div className="flex flex-col m-2 gap-2">
      <SortableHeader column={column} title="Email" />
      <Input
        placeholder="Filter..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="h-8"
      />
    </div>
  );
});

export const columns: ColumnDef<Payment>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: () => <span className="font-medium">ID</span>,
    cell: ({ row }) => <p>{row.index + 1}</p>,
  },
  {
    accessorKey: "email",
    header: ({ table }) => <EmailHeader table={table} />,
    meta: {
      searchType: "email", // Specify this is an email column
    } as ExtendedColumnMeta<Payment>,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <SortableHeader column={column} title="Amount" />,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: {
      searchType: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "processing", label: "Processing" },
        { value: "success", label: "Success" },
        { value: "failed", label: "Failed" },
      ],
    } as ExtendedColumnMeta<Payment>,
    cell: ({ row }) => (
      <StatusBadgeCell
        row={row}
        columnId="status"
        statusMap={{
          pending: {
            variant: "secondary",
            label: "Pending",
            icon: Clock,
          },
          processing: {
            variant: "secondary",
            label: "Processing",
            icon: Loader2,
          },
          success: {
            variant: "default",
            label: "Success",
            icon: CheckCircle,
          },
          failed: {
            variant: "destructive",
            label: "Failed",
            icon: XCircle,
          },
        }}
      />
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    meta: {
      searchType: "date",
    },
  },
  ActionsColumn<Payment>({
    onView: (payment: any) => console.log("View", payment),
    onEdit: (payment: any) => console.log("Edit", payment),
    onDelete: (payment: any) => console.log("Delete", payment),
    customActions: [
      {
        label: "Duplicate",
        action: (payment: any) => console.log("Duplicate", payment),
        icon: Eye,
      },
    ],
  }),
];

export function ExampleTable() {
  return (
    <AdvancedTable
      columns={columns}
      data={data}
      searchKey="email"
      filterOptions={[
        {
          columnId: "status",
          title: "Status",
          options: Object.entries(statusMap).map(([value, config]) => ({
            value,
            label: config.label || value,
          })),
        },
      ]}
      pagination
      selection
    />
  );
}
