import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, MessageCircle, PlusCircle, Sparkles, Wifi } from "lucide-react";
import { BottomNav, type Screen } from "../components/BottomNav";
import type { Place } from "../data";

type PlaceDetailProps = {
  place: Place;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  onStartVibeCheck: (place: Place) => void;
};

export function PlaceDetail({ place, onBack, onNavigate, onStartVibeCheck }: PlaceDetailProps) {
  return (
    <div className="screen detail-screen">
      <div className="detail-map-ghost" />
      <header className="detail-topbar">
        <motion.button aria-label="Back" onClick={onBack} type="button" whileTap={{ scale: 0.92 }}>
          <ArrowLeft size={22} />
        </motion.button>
        <div className="brand-lockup">
          <Sparkles size={16} />
          <span>VibeSpot</span>
        </div>
        <div className="profile-orb" />
      </header>

      <main className="detail-sheet">
        <div className="sheet-handle" />
        <section className="photo-rail">
          <div className="hero-photo" style={{ background: place.image }}>
            <span>@alex_vibe</span>
          </div>
          <div className="side-photo">
            <span>{place.category}</span>
          </div>
        </section>

        <section className="ai-card">
          <div className="detail-title-row">
            <div>
              <h1>{place.name}</h1>
              <p>
                <MapPin size={15} />
                {place.neighborhood}, {place.distance}
              </p>
            </div>
            <strong>{place.match}% Match</strong>
          </div>

          <div className="signal-grid">
            <span>
              <Clock size={17} />
              {place.signal.bestTime}
            </span>
            <span>
              <Wifi size={17} />
              {place.signal.wifi}
            </span>
            <span>
              <MessageCircle size={17} />
              {place.signal.noise}
            </span>
            <span>{place.signal.crowd}</span>
          </div>

          <div className="order-block">
            <span>Order this</span>
            <p>{place.order}</p>
          </div>

          <motion.button
            className="inline-drop"
            onClick={() => onStartVibeCheck(place)}
            type="button"
            whileTap={{ scale: 0.96 }}
          >
            <PlusCircle size={22} />
            Drop a vibe
          </motion.button>
        </section>

        <section className="real-talk">
          <div>
            <h2>The real talk</h2>
            <span>8 drops today</span>
          </div>
          <article>
            <p>{place.summary}</p>
            <small>{place.socialProof}</small>
          </article>
        </section>
      </main>

      <BottomNav active="drop" onNavigate={onNavigate} />
    </div>
  );
}
