import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

export const Route = createFileRoute("/place")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Kissa Focus" },
      { name: "description", content: "The real talk on this spot's vibe." },
    ],
  }),
  component: () => <ScreenFrame src="/screens/screen8.html" title="Place Detail" />,
});
