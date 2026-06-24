import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DataTableProps } from "@/components/common/data-table/types";

export function DataTable<T>({
  data,
  columns,
  getRowId,
  rowActions = [],
  multiRowActions = [],
  toolbarActions = [],
  isLoading = false,
  error = null,
  emptyMessage = "No data found.",
  title,
  description,
  enableRowSelection = false,
}: DataTableProps<T>) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const defs: ColumnDef<T>[] = [];

    if (enableRowSelection) {
      defs.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all rows"
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
      });
    }

    for (const col of columns) {
      defs.push({
        id: col.id,
        accessorKey: col.accessorKey,
        header: () => col.header,
        cell: ({ row }) => {
          if (col.cell) return col.cell(row.original);
          if (col.accessorKey) {
            const value = row.original[col.accessorKey];
            return value == null ? "—" : String(value);
          }
          return "—";
        },
        meta: {
          className: col.className,
          headerClassName: col.headerClassName,
        },
      });
    }

    if (rowActions.length > 0) {
      defs.push({
        id: "actions",
        header: () => "Actions",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {rowActions.map((action) => {
              const Icon = action.icon;
              const isDisabled = action.disabled?.(row.original) ?? false;
              return (
                <Button
                  key={action.id}
                  variant={action.variant ?? "outline"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => action.onClick(row.original)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  <span className="sr-only sm:not-sr-only">{action.label}</span>
                </Button>
              );
            })}
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      });
    }

    return defs;
  }, [columns, enableRowSelection, rowActions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => getRowId(row),
    onRowSelectionChange: setRowSelection,
    state: { rowSelection },
    enableRowSelection,
  });

  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.original);

  const showMultiRowBar =
    enableRowSelection && multiRowActions.length > 0 && selectedRows.length > 0;

  return (
    <Card>
      {(title || description || toolbarActions.length > 0) && (
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {toolbarActions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {toolbarActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.id}
                    variant={action.variant ?? "outline"}
                    size="sm"
                    disabled={action.disabled || action.loading}
                    onClick={action.onClick}
                  >
                    {Icon && (
                      <Icon
                        className={action.loading ? "animate-spin" : undefined}
                      />
                    )}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {showMultiRowBar && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
            <span className="text-sm text-muted-foreground">
              {selectedRows.length} selected
            </span>
            {multiRowActions.map((action) => {
              const Icon = action.icon;
              const isDisabled =
                action.disabled?.(selectedRows) ?? selectedRows.length === 0;
              return (
                <Button
                  key={action.id}
                  variant={action.variant ?? "secondary"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => action.onClick(selectedRows)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {!isLoading && !error && (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={
                          (
                            header.column.columnDef.meta as {
                              headerClassName?: string;
                            }
                          )?.headerClassName
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={tableColumns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={
                            (
                              cell.column.columnDef.meta as {
                                className?: string;
                              }
                            )?.className
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
