import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Drop a Vibe" },
      { name: "description", content: "Rate the noise level and drop a new vibe." },
    ],
  }),
  component: () => <ScreenFrame src="/screens/screen9.html" title="Submit Vibe" />,
});
