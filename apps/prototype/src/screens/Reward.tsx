import { motion } from "framer-motion";
import { Crown, Flame, Map, Trophy } from "lucide-react";
import type { Screen } from "../components/BottomNav";
import type { Place } from "../data";

type RewardProps = {
  place: Place;
  onNavigate: (screen: Screen) => void;
};

export function Reward({ place, onNavigate }: RewardProps) {
  return (
    <div className="screen reward-screen">
      <header className="reward-topbar">
        <Map size={24} />
        <strong>VIBESPOT</strong>
        <div className="profile-orb tiny" />
      </header>

      <main className="reward-stage">
        <motion.h1
          animate={{ opacity: 1, y: 0, scale: 1 }}
          initial={{ opacity: 0, y: 26, scale: 0.96 }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        >
          Vibe dropped
        </motion.h1>
        <motion.p animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ delay: 0.25 }}>
          Grid status: live
        </motion.p>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="reward-card"
          initial={{ opacity: 0, y: 34 }}
          transition={{ delay: 0.18, duration: 0.52 }}
        >
          <div className="reward-glow" />
          <Crown size={42} />
          <span>Pioneer unlocked</span>
          <h2>You left an early signal at {place.name}.</h2>
          <p>Your mark is permanent on the local grid. People with your taste will see it first.</p>
          <div className="rank-row">
            <div>
              <small>Neighbourhood rank</small>
              <strong>#3 in Indiranagar</strong>
            </div>
            <span>+2 slots</span>
          </div>
        </motion.section>

        <div className="reward-metrics">
          <div>
            <Trophy size={20} />
            <strong>+12</strong>
            <span>Experience</span>
          </div>
          <div>
            <Flame size={20} />
            <strong>4</strong>
            <span>Day streak</span>
          </div>
        </div>
      </main>

      <footer className="reward-actions">
        <button onClick={() => onNavigate("profile")} type="button">
          View profile
        </button>
        <button onClick={() => onNavigate("map")} type="button">
          Maybe later
        </button>
      </footer>
    </div>
  );
}
