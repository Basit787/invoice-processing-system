import { useMemo, useState } from "react";

import { DataTable } from "@/components/common/data-table";
import { InvoiceDetailDialog } from "@/pages/home/components/invoice-detail-dialog";
import {
  getInvoiceColumns,
  getInvoiceMultiRowActions,
  getInvoiceRowActions,
  getInvoiceToolbarActions,
} from "@/pages/home/components/invoice-table.config";
import { useDeleteInvoice, useInvoices } from "@/pages/home/hooks";
import type { Invoice } from "@/types/invoice";

export function InvoiceTable() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useInvoices();
  const deleteMutation = useDeleteInvoice();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const columns = useMemo(() => getInvoiceColumns(), []);

  const rowActions = useMemo(
    () =>
      getInvoiceRowActions({
        onView: setSelectedInvoice,
        onDelete: (invoice) => {
          if (confirm(`Delete "${invoice.original_filename}"?`)) {
            deleteMutation.mutate(invoice.id);
          }
        },
        isDeleting: deleteMutation.isPending,
      }),
    [deleteMutation],
  );

  const multiRowActions = useMemo(
    () =>
      getInvoiceMultiRowActions({
        onBulkDelete: (invoices) => {
          if (
            confirm(`Delete ${invoices.length} selected invoice(s)?`)
          ) {
            invoices.forEach((invoice) => deleteMutation.mutate(invoice.id));
          }
        },
        isDeleting: deleteMutation.isPending,
      }),
    [deleteMutation],
  );

  const toolbarActions = useMemo(
    () =>
      getInvoiceToolbarActions({
        onRefresh: () => refetch(),
        isFetching,
      }),
    [isFetching, refetch],
  );

  return (
    <>
      <DataTable<Invoice>
        title="Processed Invoices"
        description={
          data ? `${data.total} invoice(s)` : "Loading invoice data…"
        }
        data={data?.invoices ?? []}
        columns={columns}
        getRowId={(row) => String(row.id)}
        rowActions={rowActions}
        multiRowActions={multiRowActions}
        toolbarActions={toolbarActions}
        isLoading={isLoading}
        error={isError ? (error as Error).message : null}
        emptyMessage="No invoices yet. Upload one to get started."
        enableRowSelection
      />

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={!!selectedInvoice}
        onOpenChange={(open) => !open && setSelectedInvoice(null)}
      />
    </>
  );
}
