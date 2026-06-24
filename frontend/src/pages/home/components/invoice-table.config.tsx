import { Eye, RefreshCw, Trash2 } from "lucide-react";

import type {
  DataTableColumn,
  DataTableMultiRowAction,
  DataTableRowAction,
  DataTableToolbarAction,
} from "@/components/common/data-table";
import { StatusBadge } from "@/pages/home/components/status-badge";
import { formatAmount, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";

export function getInvoiceColumns(): DataTableColumn<Invoice>[] {
  return [
    {
      id: "vendor",
      header: "Vendor",
      cell: (row) => row.vendor_name || row.original_filename,
    },
    {
      id: "invoice_number",
      header: "Invoice #",
      accessorKey: "invoice_number",
      cell: (row) => row.invoice_number ?? "—",
    },
    {
      id: "invoice_date",
      header: "Date",
      accessorKey: "invoice_date",
      cell: (row) => row.invoice_date ?? "—",
    },
    {
      id: "total",
      header: "Total",
      cell: (row) => formatAmount(row.total_amount, row.currency),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "file",
      header: "File",
      accessorKey: "original_filename",
      className: "max-w-[200px] truncate",
    },
    {
      id: "created_at",
      header: "Uploaded",
      cell: (row) => formatDate(row.created_at),
    },
    {
      id: "processed_at",
      header: "Processed",
      cell: (row) => formatDate(row.processed_at),
    },
  ];
}

export function getInvoiceRowActions(handlers: {
  onView: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  isDeleting?: boolean;
}): DataTableRowAction<Invoice>[] {
  return [
    {
      id: "view",
      label: "View",
      icon: Eye,
      variant: "outline",
      onClick: handlers.onView,
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: handlers.onDelete,
      disabled: () => handlers.isDeleting ?? false,
    },
  ];
}

export function getInvoiceMultiRowActions(handlers: {
  onBulkDelete: (invoices: Invoice[]) => void;
  isDeleting?: boolean;
}): DataTableMultiRowAction<Invoice>[] {
  return [
    {
      id: "bulk-delete",
      label: "Delete selected",
      icon: Trash2,
      variant: "destructive",
      onClick: handlers.onBulkDelete,
      disabled: () => handlers.isDeleting ?? false,
    },
  ];
}

export function getInvoiceToolbarActions(handlers: {
  onRefresh: () => void;
  isFetching?: boolean;
}): DataTableToolbarAction[] {
  return [
    {
      id: "refresh",
      label: "Refresh",
      icon: RefreshCw,
      variant: "outline",
      onClick: handlers.onRefresh,
      loading: handlers.isFetching,
      disabled: handlers.isFetching,
    },
  ];
}
