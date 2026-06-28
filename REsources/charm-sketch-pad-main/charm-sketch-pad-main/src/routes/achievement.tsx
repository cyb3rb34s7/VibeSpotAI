import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

export const Route = createFileRoute("/achievement")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Achievement Unlocked" },
      { name: "description", content: "You unlocked a new VibeSpot achievement." },
    ],
  }),
  component: () => <ScreenFrame src="/screens/screen5.html" title="Achievement" />,
});
