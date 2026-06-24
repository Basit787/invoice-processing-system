import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deleteInvoice,
  fetchInvoices,
  invoiceKeys,
  uploadInvoice,
} from "@/pages/home/api";

export function useInvoices() {
  return useQuery({
    queryKey: invoiceKeys.list(),
    queryFn: fetchInvoices,
  });
}

export function useUploadInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadInvoice,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.list() });
      toast.success(`"${data.invoice.original_filename}" processed`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.list() });
      toast.success("Invoice deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
