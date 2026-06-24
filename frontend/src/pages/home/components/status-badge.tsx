import type { InvoiceStatus } from "@/types/invoice";
import { Badge } from "@/components/ui/badge";

const statusVariant: Record<
  InvoiceStatus,
  "success" | "warning" | "destructive" | "muted" | "secondary"
> = {
  processed: "success",
  processing: "warning",
  failed: "destructive",
  pending: "muted",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <Badge variant={statusVariant[status]} className="uppercase">
      {status}
    </Badge>
  );
}
