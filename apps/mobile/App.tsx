import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { MapHomeScreen } from "./src/screens/MapHomeScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <MapHomeScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
