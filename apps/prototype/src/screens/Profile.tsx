import { Bell, Map, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNav, type Screen } from "../components/BottomNav";
import { profile } from "../data";

type ProfileProps = {
  onNavigate: (screen: Screen) => void;
};

export function Profile({ onNavigate }: ProfileProps) {
  return (
    <div className="screen profile-screen">
      <header className="profile-header">
        <div className="brand-lockup large">
          <Map size={22} />
          <span>VibeSpot</span>
        </div>
        <Bell size={21} />
      </header>

      <main className="profile-content">
        <section className="identity">
          <motion.div className="portrait" animate={{ boxShadow: "0 0 36px rgba(189,244,74,.36)" }}>
            <div />
            <span>
              <Sparkles size={18} />
            </span>
          </motion.div>
          <h1>{profile.name}</h1>
          <p>{profile.taste}</p>
        </section>

        <section className="stat-row">
          {profile.stats.map((stat) => (
            <article key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </article>
          ))}
        </section>

        <section className="rank-card">
          <div>
            <span>Neighbourhood rank</span>
            <h2>#4 <small>in Koramangala</small></h2>
          </div>
          <div className="rank-building">
            <span>↑ 2</span>
          </div>
        </section>

        <section className="badge-section">
          <div className="section-title">
            <h2>Earned badges</h2>
            <button type="button">View all</button>
          </div>
          <div className="badge-row">
            {profile.badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <article className={badge.state === "locked" ? "is-locked" : ""} key={badge.label}>
                  <div style={{ color: badge.color, borderColor: `${badge.color}66` }}>
                    <Icon size={24} />
                  </div>
                  <span>{badge.label}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="city-map-card">
          <div className="mini-map">
            <span className="pin p1" />
            <span className="pin p2" />
            <span className="pin p3" />
          </div>
          <div>
            <span>12 locations visited</span>
            <button type="button">Expand map</button>
          </div>
        </section>
      </main>

      <BottomNav active="profile" onNavigate={onNavigate} />
    </div>
  );
}
