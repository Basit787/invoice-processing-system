import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Invoice Processing System</h1>
              <p className="text-sm text-muted-foreground">
                Upload, OCR, and extract invoice data
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
