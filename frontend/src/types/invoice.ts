export type InvoiceStatus = "pending" | "processing" | "processed" | "failed";

export interface Invoice {
  id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  status: InvoiceStatus;
  vendor_name: string | null;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number | null;
  currency: string | null;
  raw_text: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface InvoiceListResponse {
  invoices: Invoice[];
  total: number;
}

export interface UploadResponse {
  message: string;
  invoice: Invoice;
}
