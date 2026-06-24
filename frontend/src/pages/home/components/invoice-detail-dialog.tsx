import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/pages/home/components/status-badge";
import { formatAmount, formatDate } from "@/lib/utils";
import type { Invoice } from "@/types/invoice";

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words">{value}</span>
    </div>
  );
}

export function InvoiceDetailDialog({
  invoice,
  open,
  onOpenChange,
}: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice.vendor_name || invoice.original_filename}
          </DialogTitle>
          <DialogDescription>Invoice details and OCR output</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <DetailRow label="File" value={invoice.original_filename} />
          <DetailRow
            label="Status"
            value={<StatusBadge status={invoice.status} />}
          />
          <DetailRow label="Vendor" value={invoice.vendor_name ?? "—"} />
          <DetailRow label="Invoice #" value={invoice.invoice_number ?? "—"} />
          <DetailRow label="Date" value={invoice.invoice_date ?? "—"} />
          <DetailRow
            label="Total"
            value={formatAmount(invoice.total_amount, invoice.currency)}
          />
          <DetailRow label="Uploaded" value={formatDate(invoice.created_at)} />
          <DetailRow
            label="Processed"
            value={formatDate(invoice.processed_at)}
          />
        </div>

        {invoice.error_message && (
          <p className="text-sm text-destructive">{invoice.error_message}</p>
        )}

        {invoice.raw_text && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              OCR Raw Text
            </p>
            <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/30 p-4 text-xs whitespace-pre-wrap">
              {invoice.raw_text}
            </pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
