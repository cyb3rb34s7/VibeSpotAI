import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

export const Route = createFileRoute("/success")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Vibe Dropped" },
      { name: "description", content: "Your vibe is live. Pioneer status unlocked." },
    ],
  }),
  component: () => <ScreenFrame src="/screens/screen6.html" title="Vibe Dropped" />,
});
