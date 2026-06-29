import { useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import type { NearbyPlace } from "../api/client";
import { colors, radii, spacing, typography } from "../theme/tokens";
import { MapPreview } from "./MapPreview";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => unknown;
        Marker: new (options: Record<string, unknown>) => unknown;
      };
    };
    __vibespotGoogleMapsPromise?: Promise<void>;
  }
}

type VibeMapProps = {
  places: NearbyPlace[];
};

const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_BROWSER_KEY;

export function VibeMap({ places }: VibeMapProps) {
  const mapElementRef = useRef<unknown>(null);
  const [hasMapError, setHasMapError] = useState(false);
  const [isGoogleMapVisible, setIsGoogleMapVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web" || !googleMapsKey || places.length === 0) {
      return;
    }

    let isCancelled = false;
    const timers: number[] = [];
    setHasMapError(false);
    setIsGoogleMapVisible(false);

    async function renderMap() {
      try {
        await loadGoogleMaps();

        const element = mapElementRef.current as HTMLElement | null;
        if (isCancelled || !element || !window.google) {
          return;
        }

        const map = new window.google.maps.Map(element, {
          center: { lat: places[0].lat, lng: places[0].lng },
          zoom: 15,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          styles: googleMapStyles,
        });

        places.slice(0, 8).forEach((place) => {
          new window.google!.maps.Marker({
            position: { lat: place.lat, lng: place.lng },
            map,
            title: `${place.name} - ${place.match_percent}%`,
            label: {
              text: String(place.match_percent),
              color: colors.onLime,
              fontSize: "10px",
              fontWeight: "900",
            },
          });
        });

        [700, 1400, 2600].forEach((delay) => {
          const timer = window.setTimeout(() => {
            if (isCancelled) {
              return;
            }

            if (hasGoogleMapFailure(element)) {
              setIsGoogleMapVisible(false);
              setHasMapError(true);
              return;
            }

            if (delay >= 1400) {
              setIsGoogleMapVisible(true);
            }
          }, delay);
          timers.push(timer);
        });
      } catch {
        if (!isCancelled) {
          setIsGoogleMapVisible(false);
          setHasMapError(true);
        }
      }
    }

    renderMap();

    return () => {
      isCancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [places]);

  if (Platform.OS !== "web" || !googleMapsKey || hasMapError) {
    return <MapPreview places={places} />;
  }

  return (
    <View style={styles.container}>
      {!isGoogleMapVisible ? (
        <View style={styles.fallbackLayer}>
          <MapPreview places={places} />
        </View>
      ) : null}
      <View
        ref={mapElementRef as never}
        style={[styles.mapCanvas, !isGoogleMapVisible && styles.hiddenMapCanvas]}
      />
      {isGoogleMapVisible ? (
        <View style={styles.mapLabel}>
          <Text style={styles.mapLabelTitle}>Koramangala Google grid</Text>
          <Text style={styles.mapLabelMeta}>{places.length} seeded spots nearby</Text>
        </View>
      ) : null}
    </View>
  );
}

function hasGoogleMapFailure(element: HTMLElement) {
  const text = element.textContent?.toLowerCase() ?? "";
  return (
    Boolean(element.querySelector(".gm-err-container")) ||
    text.includes("oops") ||
    text.includes("didn't load google maps")
  );
}

function loadGoogleMaps(): Promise<void> {
  if (window.google?.maps) {
    return Promise.resolve();
  }

  if (window.__vibespotGoogleMapsPromise) {
    return window.__vibespotGoogleMapsPromise;
  }

  window.__vibespotGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("vibespot-google-maps");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps failed to load")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "vibespot-google-maps";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      googleMapsKey ?? "",
    )}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google Maps failed to load"));
    document.head.appendChild(script);
  });

  return window.__vibespotGoogleMapsPromise;
}

const googleMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#171A19" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#A8AD9A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0F1014" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#242730" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111318" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#303622" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#101820" }] },
];

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.mapBase,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    height: 238,
    overflow: "hidden",
  },
  mapCanvas: {
    height: "100%",
    width: "100%",
  },
  hiddenMapCanvas: {
    opacity: 0,
  },
  fallbackLayer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  mapLabel: {
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    bottom: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    position: "absolute",
  },
  mapLabelTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800",
  },
  mapLabelMeta: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: 2,
  },
});
