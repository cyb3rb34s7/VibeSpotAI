import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, Mic2, PencilLine, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { Place } from "../data";
import { vibeSteps } from "../data";

type VibeCheckProps = {
  place: Place;
  onBack: () => void;
  onComplete: () => void;
};

const noiseLabels = [
  { at: 0, label: "Silent Study" },
  { at: 25, label: "Whisper Zone" },
  { at: 50, label: "Coffee Shop Hum" },
  { at: 75, label: "Lively Social" },
  { at: 90, label: "Full Chaos" },
];

export function VibeCheck({ place, onBack, onComplete }: VibeCheckProps) {
  const [step, setStep] = useState(0);
  const [noise, setNoise] = useState(18);
  const [crowd, setCrowd] = useState("Soft crowd");
  const [useCase, setUseCase] = useState("Deep work");
  const [note, setNote] = useState("Window seats are calmer than the counter.");
  const current = vibeSteps[step];
  const progress = ((step + 1) / vibeSteps.length) * 100;
  const noiseLabel = useMemo(
    () => noiseLabels.toReversed().find((item) => noise >= item.at)?.label ?? "Silent Study",
    [noise],
  );

  function next() {
    if (step >= vibeSteps.length - 1) {
      onComplete();
      return;
    }
    setStep((value) => value + 1);
  }

  return (
    <div className="screen check-screen">
      <header className="check-topbar">
        <button aria-label="Back" onClick={step === 0 ? onBack : () => setStep((s) => s - 1)} type="button">
          <ChevronLeft size={24} />
        </button>
        <strong>VibeSpot</strong>
        <button aria-label="Close vibe check" onClick={onBack} type="button">
          ×
        </button>
      </header>

      <div className="story-progress">
        <motion.span animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.main
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          className="check-stage"
          exit={{ opacity: 0, x: -28, filter: "blur(8px)" }}
          initial={{ opacity: 0, x: 28, filter: "blur(8px)" }}
          key={current.id}
          transition={{ duration: 0.38, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="check-copy">
            <span>{current.eyebrow}</span>
            <h1>{current.title}</h1>
            <p>{current.subtitle}</p>
          </div>

          {current.id === "noise" ? (
            <NoiseStep noise={noise} label={noiseLabel} onNoiseChange={setNoise} />
          ) : null}

          {current.id === "crowd" ? (
            <ChoiceStep
              icon="crowd"
              options={current.options ?? []}
              selected={crowd}
              onSelect={setCrowd}
            />
          ) : null}

          {current.id === "use" ? (
            <ChoiceStep
              icon="use"
              options={current.options ?? []}
              selected={useCase}
              onSelect={setUseCase}
            />
          ) : null}

          {current.id === "note" ? (
            <NoteStep note={note} place={place} onChange={setNote} />
          ) : null}
        </motion.main>
      </AnimatePresence>

      <footer className="check-footer">
        <div>
          <span>{place.name}</span>
          <strong>{current.id === "noise" ? noiseLabel : current.id === "crowd" ? crowd : current.id === "use" ? useCase : "Ready to publish"}</strong>
        </div>
        <motion.button onClick={next} type="button" whileTap={{ scale: 0.94 }}>
          {step === vibeSteps.length - 1 ? "Drop vibe" : "Next"}
          <ArrowRight size={19} />
        </motion.button>
      </footer>
    </div>
  );
}

function NoiseStep({
  label,
  noise,
  onNoiseChange,
}: {
  label: string;
  noise: number;
  onNoiseChange: (value: number) => void;
}) {
  const bars = Array.from({ length: 46 }, (_, index) => {
    const intensity = noise / 100;
    const wave = Math.sin(index * 0.52) * 18 * intensity;
    const center = 1 - Math.abs(index - 23) / 23;
    return Math.max(8, 8 + intensity * 58 * center + wave + (index % 5) * intensity * 4);
  });

  return (
    <section className="noise-step">
      <div className="noise-label">
        <Mic2 size={18} />
        <strong>{label}</strong>
      </div>
      <div className="waveform" aria-hidden="true">
        {bars.map((height, index) => (
          <motion.span
            animate={{ height }}
            key={`${index}-${height}`}
            style={{ opacity: 0.26 + (noise / 100) * 0.58 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          />
        ))}
      </div>
      <input
        aria-label="Noise level"
        className="noise-slider"
        max="100"
        min="0"
        onChange={(event) => onNoiseChange(Number(event.target.value))}
        onInput={(event) => onNoiseChange(Number(event.currentTarget.value))}
        type="range"
        value={noise}
      />
      <div className="range-labels">
        <span>Silent</span>
        <span>Chaotic</span>
      </div>
    </section>
  );
}

function ChoiceStep({
  icon,
  onSelect,
  options,
  selected,
}: {
  icon: "crowd" | "use";
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <section className={`choice-step ${icon}`}>
      {options.map((option, index) => {
        const isSelected = selected === option;
        return (
          <motion.button
            animate={{ opacity: 1, y: 0 }}
            className={isSelected ? "is-selected" : ""}
            initial={{ opacity: 0, y: 18 }}
            key={option}
            onClick={() => onSelect(option)}
            transition={{ delay: index * 0.05 }}
            type="button"
            whileTap={{ scale: 0.96 }}
          >
            <span>
              {icon === "crowd" ? <UsersRound size={22} /> : <Check size={22} />}
            </span>
            <strong>{option}</strong>
            <small>{isSelected ? "Selected" : "Tap to choose"}</small>
          </motion.button>
        );
      })}
    </section>
  );
}

function NoteStep({
  note,
  onChange,
  place,
}: {
  note: string;
  onChange: (value: string) => void;
  place: Place;
}) {
  return (
    <section className="note-step">
      <div className="note-card">
        <PencilLine size={22} />
        <textarea
          aria-label="One thing worth knowing"
          onChange={(event) => onChange(event.target.value)}
          value={note}
        />
        <p>Others will see this when they open {place.name}. Keep it useful, not performative.</p>
      </div>
    </section>
  );
}
