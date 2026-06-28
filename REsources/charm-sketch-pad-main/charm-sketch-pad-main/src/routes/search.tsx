import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Discovery Query" },
      { name: "description", content: "Search vibe-matched spots near you." },
    ],
  }),
  component: () => <ScreenFrame src="/screens/screen2.html" title="VibeSpot Search" />,
});
