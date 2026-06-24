import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import type { ButtonProps } from "@/components/ui/button";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  accessorKey?: keyof T & string;
  cell?: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type DataTableRowAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: ButtonProps["variant"];
  onClick: (row: T) => void;
  disabled?: (row: T) => boolean;
};

export type DataTableMultiRowAction<T> = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: ButtonProps["variant"];
  onClick: (rows: T[]) => void;
  disabled?: (rows: T[]) => boolean;
};

export type DataTableToolbarAction = {
  id: string;
  label: string;
  icon?: LucideIcon;
  variant?: ButtonProps["variant"];
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export type DataTableProps<T> = {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  rowActions?: DataTableRowAction<T>[];
  multiRowActions?: DataTableMultiRowAction<T>[];
  toolbarActions?: DataTableToolbarAction[];
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  title?: string;
  description?: string;
  enableRowSelection?: boolean;
};
