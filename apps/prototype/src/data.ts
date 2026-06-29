import { BriefcaseBusiness, Coffee, Croissant, Diamond, Flame, Gem, Martini, Moon, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Place = {
  id: string;
  name: string;
  category: string;
  match: number;
  neighborhood: string;
  distance: string;
  icon: LucideIcon;
  accent: string;
  accentSoft: string;
  position: { x: number; y: number };
  image: string;
  tags: string[];
  summary: string;
  order: string;
  signal: {
    noise: string;
    wifi: string;
    crowd: string;
    bestTime: string;
  };
  socialProof: string;
};

export const places: Place[] = [
  {
    id: "toit-brewpub",
    name: "Toit Brewpub",
    category: "Craft Beer",
    match: 96,
    neighborhood: "Indiranagar",
    distance: "420 m",
    icon: BriefcaseBusiness,
    accent: "#bdf44a",
    accentSoft: "rgba(189, 244, 74, 0.24)",
    position: { x: 47, y: 19 },
    image: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,.72)), repeating-linear-gradient(92deg, rgba(255,255,255,.08) 0 2px, transparent 2px 38px), radial-gradient(circle at 22% 18%, rgba(255,224,170,.55), transparent 12%), radial-gradient(circle at 72% 32%, rgba(189,244,74,.16), transparent 14%), linear-gradient(145deg, #3a2818, #111217 64%)",
    tags: ["Wood-fired pizzas", "house brews", "loud after 8"],
    summary: "A high-energy after-work room. Best when you want food, beer, and a place that feels alive without needing a plan.",
    order: "Wood-fired pizza with a citrus-forward wheat beer.",
    signal: { noise: "Lively", wifi: "Good", crowd: "Peaks late", bestTime: "5PM - 7PM" },
    socialProof: "14 people with your evening-social taste saved this this week.",
  },
  {
    id: "glens-bakehouse",
    name: "Glen's Bakehouse",
    category: "Cafe",
    match: 84,
    neighborhood: "Indiranagar",
    distance: "610 m",
    icon: Croissant,
    accent: "#67d8cc",
    accentSoft: "rgba(103, 216, 204, 0.22)",
    position: { x: 52, y: 43 },
    image: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,.7)), repeating-linear-gradient(0deg, rgba(255,255,255,.07) 0 2px, transparent 2px 32px), radial-gradient(circle at 70% 22%, rgba(255,255,255,.38), transparent 14%), radial-gradient(circle at 28% 70%, rgba(103,216,204,.22), transparent 18%), linear-gradient(145deg, #1e3432, #111217 64%)",
    tags: ["cakes", "brunch", "soft crowd"],
    summary: "Warm, casual, slightly nostalgic. Great for low-stakes catchups and a sweet reset between errands.",
    order: "Chocolate cupcake with cold coffee.",
    signal: { noise: "Medium", wifi: "Okay", crowd: "Gentle", bestTime: "11AM - 2PM" },
    socialProof: "Meera, Karan and 6 more dropped brunch notes here.",
  },
  {
    id: "corner-house",
    name: "Corner House",
    category: "Desserts",
    match: 90,
    neighborhood: "Domlur",
    distance: "1.2 km",
    icon: Gem,
    accent: "#c8f55a",
    accentSoft: "rgba(200, 245, 90, 0.22)",
    position: { x: 43, y: 76 },
    image: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,.74)), repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 3px, transparent 3px 34px), radial-gradient(circle at 26% 22%, rgba(255,181,157,.38), transparent 14%), radial-gradient(circle at 68% 72%, rgba(200,245,90,.16), transparent 16%), linear-gradient(145deg, #332318, #111217 64%)",
    tags: ["death by chocolate", "late sugar", "nostalgia"],
    summary: "A comfort landmark. Not subtle, not quiet, but deeply reliable when the night needs something sweet.",
    order: "Death By Chocolate, shared. Do not pretend otherwise.",
    signal: { noise: "Buzzing", wifi: "No", crowd: "Fast turnover", bestTime: "After 9PM" },
    socialProof: "You would be the first in your taste cluster to mark it this month.",
  },
  {
    id: "neon-alley",
    name: "Neon Alley",
    category: "Retro Bar",
    match: 88,
    neighborhood: "HAL 2nd Stage",
    distance: "860 m",
    icon: Martini,
    accent: "#ffb59d",
    accentSoft: "rgba(255, 181, 157, 0.22)",
    position: { x: 58, y: 51 },
    image: "linear-gradient(180deg, transparent 35%, rgba(0,0,0,.72)), repeating-linear-gradient(24deg, rgba(255,255,255,.07) 0 2px, transparent 2px 35px), radial-gradient(circle at 78% 30%, rgba(255,181,157,.36), transparent 12%), radial-gradient(circle at 25% 70%, rgba(200,245,90,.16), transparent 14%), linear-gradient(145deg, #2d1722, #111217 62%)",
    tags: ["retro", "low light", "late conversation"],
    summary: "A moody lane-side bar that works when you want energy without the massive-club feeling.",
    order: "A sour cocktail and fries at the bar counter.",
    signal: { noise: "Warm hum", wifi: "No", crowd: "Builds slowly", bestTime: "8PM - 10PM" },
    socialProof: "7 drops this week, up from 2 last week.",
  },
];

export const profile = {
  name: "Priya",
  handle: "@priya_k",
  taste: "Afternoon worker · Window-seat hunter · Cold brew person",
  stats: [
    { label: "Drops", value: "38" },
    { label: "Places", value: "12" },
    { label: "Pioneered", value: "3" },
  ],
  badges: [
    { label: "Pioneer", icon: Diamond, state: "earned", color: "#ffb34f" },
    { label: "Streak", icon: Flame, state: "active", color: "#bdf44a" },
    { label: "Night Owl", icon: Moon, state: "earned", color: "#ff7a92" },
    { label: "Taster", icon: Coffee, state: "locked", color: "#555761" },
  ],
};

export const vibeSteps = [
  {
    id: "noise",
    eyebrow: "Step 1 of 4",
    title: "Noise level right now?",
    subtitle: "Slide until the room feels honest.",
  },
  {
    id: "crowd",
    eyebrow: "Step 2 of 4",
    title: "How full does it feel?",
    subtitle: "Pick the room energy, not the headcount.",
    options: ["Empty calm", "Soft crowd", "Busy glow", "Packed"],
  },
  {
    id: "use",
    eyebrow: "Step 3 of 4",
    title: "What is this place best for?",
    subtitle: "One signal is stronger than a long review.",
    options: ["Deep work", "First date", "Team catchup", "Solo reset"],
  },
  {
    id: "note",
    eyebrow: "Step 4 of 4",
    title: "One thing worth knowing?",
    subtitle: "Short, specific, useful.",
  },
];

export const quickFilters = [
  { label: "Deep work", icon: Coffee },
  { label: "After 9PM", icon: Moon },
  { label: "Date energy", icon: Martini },
  { label: "Food first", icon: Utensils },
];
