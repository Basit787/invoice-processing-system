import { zodResolver } from "@hookform/resolvers/zod";
import { FileUp, Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUploadInvoice } from "@/pages/home/hooks";
import { cn } from "@/lib/utils";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/tiff",
  "image/bmp",
  "application/pdf",
];

const uploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select an invoice file" })
    .refine(
      (file) =>
        ALLOWED_TYPES.includes(file.type) ||
        file.name.match(/\.(png|jpe?g|tiff?|bmp|pdf)$/i),
      { message: "Allowed: PNG, JPG, TIFF, BMP, PDF" },
    )
    .refine((file) => file.size <= 20 * 1024 * 1024, {
      message: "File must be 20MB or smaller",
    }),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export function UploadForm() {
  const [isDragging, setIsDragging] = useState(false);
  const uploadMutation = useUploadInvoice();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {},
  });

  const selectedFile = form.watch("file");

  const onSubmit = (values: UploadFormValues) => {
    uploadMutation.mutate(values.file, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file) {
        form.setValue("file", file, { shouldValidate: true });
      }
    },
    [form],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Invoice
        </CardTitle>
        <CardDescription>
          Drop an image or PDF — OCR runs inside Docker
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value: _value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>Invoice file</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-primary/50 hover:bg-muted/40",
                        isDragging && "border-primary bg-primary/5",
                      )}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFile(e.dataTransfer.files[0]);
                        onChange(e.dataTransfer.files[0]);
                      }}
                      onClick={() =>
                        document.getElementById("invoice-file")?.click()
                      }
                    >
                      <FileUp className="mb-3 h-10 w-10 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Drag & drop or click to browse
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        PNG, JPG, TIFF, BMP, PDF — max 20MB
                      </p>
                      {selectedFile && (
                        <p className="mt-3 rounded-md bg-secondary px-3 py-1 text-xs">
                          {selectedFile.name}
                        </p>
                      )}
                      <Input
                        id="invoice-file"
                        type="file"
                        className="hidden"
                        accept=".png,.jpg,.jpeg,.tiff,.tif,.bmp,.pdf"
                        {...field}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleFile(file);
                          onChange(file);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Supported formats are processed with Tesseract OCR
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={uploadMutation.isPending || !selectedFile}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Upload />
                  Upload & Process
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
