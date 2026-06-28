import { StatusBar } from "expo-status-bar";

import { MapHomeScreen } from "./src/screens/MapHomeScreen";
import { colors } from "./src/theme/tokens";

export default function App() {
  return (
    <>
      <MapHomeScreen />
      <StatusBar style="light" />
    </>
  );
}
