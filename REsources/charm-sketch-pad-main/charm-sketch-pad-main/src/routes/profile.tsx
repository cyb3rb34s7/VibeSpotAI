import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Your Profile" },
      { name: "description", content: "Your earned badges, rank, and city map." },
    ],
  }),
  component: () => <ScreenFrame src="/screens/screen7.html" title="Profile" />,
});
