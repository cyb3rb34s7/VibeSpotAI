import { Map, PlusCircle, Search, UserRound } from "lucide-react";
import { motion } from "framer-motion";

export type Screen = "map" | "place" | "check" | "reward" | "profile";

type BottomNavProps = {
  active: "map" | "search" | "drop" | "profile";
  onNavigate: (screen: Screen) => void;
};

const navItems = [
  { id: "map", icon: Map, target: "map" as Screen, label: "Map" },
  { id: "search", icon: Search, target: "map" as Screen, label: "Search" },
  { id: "drop", icon: PlusCircle, target: "check" as Screen, label: "Drop" },
  { id: "profile", icon: UserRound, target: "profile" as Screen, label: "Profile" },
] as const;

export function BottomNav({ active, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Prototype navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id === active;
        return (
          <motion.button
            aria-label={item.label}
            className={`nav-button ${isActive ? "is-active" : ""}`}
            key={item.id}
            onClick={() => onNavigate(item.target)}
            type="button"
            whileTap={{ scale: 0.9 }}
          >
            <Icon size={24} strokeWidth={isActive ? 2.6 : 2.2} />
          </motion.button>
        );
      })}
    </nav>
  );
}
