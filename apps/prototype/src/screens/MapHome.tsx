import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { BottomNav, type Screen } from "../components/BottomNav";
import { places, type Place } from "../data";

type MapHomeProps = {
  onNavigate: (screen: Screen) => void;
  onOpenPlace: (place: Place) => void;
  onStartVibeCheck: (place: Place) => void;
};

export function MapHome({ onNavigate, onOpenPlace, onStartVibeCheck }: MapHomeProps) {
  const [selected, setSelected] = useState<Place | null>(null);
  const featured = places[0];

  return (
    <div className="screen map-screen">
      <div className="dark-map" aria-hidden="true">
        <div className="map-grid" />
        <div className="map-roads road-a" />
        <div className="map-roads road-b" />
        <div className="map-roads road-c" />
        <div className="map-label label-one">INDIRANAGAR</div>
        <div className="map-label label-two">DOMLUR</div>
        <div className="map-label label-three">HAL 2ND STAGE</div>
      </div>

      <header className="floating-search">
        <Search size={22} />
        <div>
          <span>Find a live vibe</span>
          <strong>quiet cafe with a live signal</strong>
        </div>
        <button type="button" aria-label="Tune search">
          <SlidersHorizontal size={20} />
        </button>
      </header>

      <section className="place-layer" aria-label="Places on map">
        {places.map((place) => {
          const Icon = place.icon;
          const isSelected = selected?.id === place.id;
          return (
            <motion.button
              className={`map-place-chip ${isSelected ? "is-selected" : selected ? "is-muted" : ""}`}
              key={place.id}
              onClick={() => setSelected(place)}
              style={
                {
                  "--chip-x": `${place.position.x}%`,
                  "--chip-y": `${place.position.y}%`,
                  "--chip-accent": place.accent,
                  "--chip-soft": place.accentSoft,
                } as CSSProperties
              }
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="chip-icon">
                <Icon size={17} />
              </span>
              <span className="chip-copy">
                <strong>{place.name}</strong>
                <small>
                  {place.category} - {place.match}%
                </small>
              </span>
            </motion.button>
          );
        })}
      </section>

      <AnimatePresence mode="wait">
        {selected ? (
          <motion.article
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="selected-place-card"
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            key={selected.id}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="selected-image" style={{ background: selected.image }} />
            <div className="selected-copy">
              <div className="eyebrow-row">
                <span>
                  <MapPin size={13} />
                  {selected.distance}
                </span>
                <span>{selected.match}% match</span>
              </div>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
              <div className="selected-actions">
                <button className="ghost-action" onClick={() => onOpenPlace(selected)} type="button">
                  Open vibe
                </button>
                <button className="primary-action" onClick={() => onStartVibeCheck(selected)} type="button">
                  Drop signal
                </button>
              </div>
            </div>
          </motion.article>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {!selected ? (
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            className="peek-sheet"
            exit={{ opacity: 0, y: 34 }}
            initial={{ opacity: 0, y: 34 }}
            transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="sheet-handle">
              <ChevronUp size={16} />
            </div>
            <div className="sheet-heading">
              <div>
                <span>Fresh nearby</span>
                <h1>Trending nearby</h1>
              </div>
              <div className="avatar-stack">
                <span>A</span>
                <span>M</span>
                <span>+8</span>
              </div>
            </div>
            <button className="trending-preview" onClick={() => onOpenPlace(featured)} type="button">
              <span className="trending-image" style={{ background: featured.image }} />
              <span className="trending-copy">
                <strong>{featured.name}</strong>
                <small>
                  {featured.category} - {featured.match}% match - {featured.distance}
                </small>
              </span>
            </button>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <BottomNav active="map" onNavigate={onNavigate} />
    </div>
  );
}
