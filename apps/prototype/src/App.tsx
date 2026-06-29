import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Frame } from "./components/Frame";
import type { Screen } from "./components/BottomNav";
import { places, type Place } from "./data";
import { MapHome } from "./screens/MapHome";
import { PlaceDetail } from "./screens/PlaceDetail";
import { Profile } from "./screens/Profile";
import { Reward } from "./screens/Reward";
import { VibeCheck } from "./screens/VibeCheck";

function App() {
  const [screen, setScreen] = useState<Screen>("map");
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0]);

  function openPlace(place: Place) {
    setSelectedPlace(place);
    setScreen("place");
  }

  function startVibeCheck(place = selectedPlace) {
    setSelectedPlace(place);
    setScreen("check");
  }

  function navigate(nextScreen: Screen) {
    if (nextScreen === "check") {
      startVibeCheck();
      return;
    }
    setScreen(nextScreen);
  }

  return (
    <Frame>
      <AnimatePresence mode="wait">
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="screen-motion"
          exit={{ opacity: 0, scale: 0.985 }}
          initial={{ opacity: 0, scale: 0.985 }}
          key={screen}
          transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {screen === "map" ? (
            <MapHome
              onNavigate={navigate}
              onOpenPlace={openPlace}
              onStartVibeCheck={startVibeCheck}
            />
          ) : null}
          {screen === "place" ? (
            <PlaceDetail
              onBack={() => setScreen("map")}
              onStartVibeCheck={startVibeCheck}
              place={selectedPlace}
            />
          ) : null}
          {screen === "check" ? (
            <VibeCheck
              onBack={() => setScreen("place")}
              onComplete={() => setScreen("reward")}
              place={selectedPlace}
            />
          ) : null}
          {screen === "reward" ? <Reward onNavigate={navigate} place={selectedPlace} /> : null}
          {screen === "profile" ? <Profile onNavigate={navigate} /> : null}
        </motion.div>
      </AnimatePresence>
    </Frame>
  );
}

export default App;
