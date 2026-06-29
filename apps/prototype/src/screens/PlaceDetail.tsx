import { motion } from "framer-motion";
import { ArrowLeft, Clock, MapPin, MessageCircle, PlusCircle, Sparkles, Users, Wifi } from "lucide-react";
import type { Place } from "../data";

type PlaceDetailProps = {
  place: Place;
  onBack: () => void;
  onStartVibeCheck: (place: Place) => void;
};

export function PlaceDetail({ place, onBack, onStartVibeCheck }: PlaceDetailProps) {
  return (
    <div className="screen detail-screen">
      <div className="place-ambient" style={{ background: place.image }} />
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

      <main className="place-page">
        <section className="place-hero" style={{ background: place.image }}>
          <div className="place-hero-caption">
            <span>{place.category}</span>
            <strong>{place.match}% match</strong>
          </div>
        </section>

        <section className="place-intro">
          <div className="place-kicker">
            <span>
              <MapPin size={14} />
              {place.neighborhood} - {place.distance}
            </span>
            <span>{place.signal.bestTime}</span>
          </div>

          <h1>{place.name}</h1>
          <p>{place.summary}</p>

          <div className="place-signal-row" aria-label="Live place signals">
            <span>
              <Clock size={15} />
              {place.signal.bestTime}
            </span>
            <span>
              <Wifi size={15} />
              {place.signal.wifi}
            </span>
            <span>
              <MessageCircle size={15} />
              {place.signal.noise}
            </span>
            <span>
              <Users size={15} />
              {place.signal.crowd}
            </span>
          </div>

          <motion.button
            className="place-drop-cta"
            onClick={() => onStartVibeCheck(place)}
            type="button"
            whileTap={{ scale: 0.96 }}
          >
            <PlusCircle size={20} />
            Drop a vibe
          </motion.button>
        </section>

        <section className="place-section">
          <span>Order this</span>
          <p>{place.order}</p>
        </section>

        <section className="place-section place-social-proof">
          <span>The real talk</span>
          <p>{place.socialProof}</p>
        </section>

        <section className="place-drops-preview">
          <div>
            <span>Latest signal</span>
            <strong>@alex_vibe</strong>
          </div>
          <p>Best from 5PM to 7PM. Go when the room is lively but before it becomes a full crowd.</p>
        </section>
      </main>

    </div>
  );
}
