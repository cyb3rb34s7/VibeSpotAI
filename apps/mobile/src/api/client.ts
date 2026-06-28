import { Platform } from "react-native";

const fallbackApiBaseUrl = Platform.select({
  android: "http://10.0.2.2:38191",
  default: "http://localhost:38191",
});

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackApiBaseUrl;

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  trace_id: string;
};

export type NearbyPlace = {
  id: string;
  name: string;
  slug: string;
  category: string;
  neighborhood: string;
  lat: number;
  lng: number;
  distance_m: number;
  tags: string[];
  match_percent: number;
  summary: string;
  best_for: string;
  avoid_when: string;
  evidence_count: number;
};

export async function getNearbyPlaces(): Promise<NearbyPlace[]> {
  const response = await fetch(
    `${API_BASE_URL}/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500`,
  );

  const envelope = (await response.json()) as ApiEnvelope<NearbyPlace[]>;

  if (!response.ok || !envelope.success || !envelope.data) {
    const message = envelope.error?.message || "Failed to load nearby places";
    throw new Error(`${message} (${envelope.trace_id})`);
  }

  return envelope.data;
}
