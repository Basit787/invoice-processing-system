import { InvoiceTable } from "@/pages/home/components/invoice-table";
import { UploadForm } from "@/pages/home/components/upload-form";

export default function HomePage() {
  return (
    <>
      <UploadForm />
      <InvoiceTable />
    </>
  );
}