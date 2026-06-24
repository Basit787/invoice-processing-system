import { createFileRoute } from "@tanstack/react-router";

import HomePage from "@/pages/home/main";

export const Route = createFileRoute("/")({
  component: HomePage,
});
