import { Compass, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

type FrameProps = {
  children: ReactNode;
};

export function Frame({ children }: FrameProps) {
  return (
    <main className="app-stage">
      <div className="ambient ambient-lime" />
      <div className="ambient ambient-coral" />
      <section className="phone-shell" aria-label="VibeSpot prototype">
        {children}
      </section>
      <aside className="desktop-note">
        <div className="note-mark">
          <Compass size={18} />
        </div>
        <p>Kinetic Noir prototype</p>
        <strong>Explore the city as a living signal, not a review feed.</strong>
        <span>
          Built for mobile first. The desktop frame stays quiet so the phone UI remains the real
          artifact.
        </span>
        <div className="note-pulse">
          <Sparkles size={16} />
          Full-screen vibe check flow
        </div>
      </aside>
    </main>
  );
}
