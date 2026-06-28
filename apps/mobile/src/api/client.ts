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

export type PlaceDetail = NearbyPlace & {
  address: string;
  city: string;
  data_window: string;
  confidence_score: number;
  signals: {
    avg_noise_score: number;
    avg_wifi_score: number;
    top_crowd_level: string;
    top_recommend_mode: string;
  };
  recent_vibe_checks: Array<{
    visit_intent: string;
    best_use_case: string;
    short_note: string;
    crowd_level: string;
    recommend_mode: string;
    submitted_at: string;
  }>;
};

function unwrapEnvelope<T>(response: Response, envelope: ApiEnvelope<T>, fallbackMessage: string): T {
  if (!response.ok || !envelope.success || !envelope.data) {
    const message = envelope.error?.message || fallbackMessage;
    throw new Error(`${message} (${envelope.trace_id})`);
  }

  return envelope.data;
}

export async function getNearbyPlaces(): Promise<NearbyPlace[]> {
  const response = await fetch(
    `${API_BASE_URL}/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500`,
  );
  const envelope = (await response.json()) as ApiEnvelope<NearbyPlace[]>;
  return unwrapEnvelope(response, envelope, "Failed to load nearby places");
}

export async function getPlaceDetail(slug: string): Promise<PlaceDetail> {
  const response = await fetch(`${API_BASE_URL}/places/${slug}`);
  const envelope = (await response.json()) as ApiEnvelope<PlaceDetail>;
  return unwrapEnvelope(response, envelope, "Failed to load place detail");
}
