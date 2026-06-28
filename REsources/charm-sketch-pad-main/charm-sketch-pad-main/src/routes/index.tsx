import { createFileRoute } from "@tanstack/react-router";
import { ScreenFrame } from "@/components/ScreenFrame";

const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ?? "";
const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID ?? "";
const src = `/screens/screen1.html?k=${encodeURIComponent(key)}&c=${encodeURIComponent(channel)}`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeSpot — Cinematic Discovery" },
      { name: "description", content: "Discover hidden vibes nearby on a cinematic live map." },
      { property: "og:title", content: "VibeSpot — Cinematic Discovery" },
      { property: "og:description", content: "Discover hidden vibes nearby on a cinematic live map." },
    ],
  }),
  component: () => <ScreenFrame src={src} title="VibeSpot Map" />,
});
