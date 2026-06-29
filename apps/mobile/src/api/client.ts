import { Platform } from "react-native";

const fallbackApiBaseUrl = Platform.select({
  android: "http://10.0.2.2:38191",
  default: "http://localhost:38191",
});

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || fallbackApiBaseUrl;
const REQUEST_TIMEOUT_MS = 8000;

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
  reason?: string;
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

export type VibeCheckPayload = {
  visit_intent: string;
  noise_score: number;
  wifi_score: number;
  crowd_level: string;
  best_use_case: string;
  recommend_mode: string;
  short_note: string;
  location_confidence: number;
};

export type VibeCheckCreated = VibeCheckPayload & {
  id: string;
  place_slug: string;
  created_by_handle: string;
  trust_weight: number;
  submitted_at: string;
};

export type AuthUser = {
  id: string;
  handle: string;
  email: string;
  display_name: string;
  home_city: string;
};

export type AuthStartResponse = {
  delivery: string;
  expires_in_seconds: number;
  otp_code: string | null;
};

export type AuthSessionResponse = {
  access_token: string;
  token_type: "bearer";
  user: AuthUser;
};

export type MyProfile = {
  user: AuthUser;
  stats: {
    vibe_checks_count: number;
    places_contributed_count: number;
  };
  taste_tags: Array<{
    label: string;
    count: number;
  }>;
  recent_drops: Array<{
    place_name: string;
    place_slug: string;
    short_note: string;
    best_use_case: string;
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

async function requestEnvelope<T>(
  path: string,
  init?: RequestInit,
): Promise<{ envelope: ApiEnvelope<T>; response: Response }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });
    return {
      envelope: (await response.json()) as ApiEnvelope<T>,
      response,
    };
  } catch (caught) {
    if (caught instanceof Error && caught.name === "AbortError") {
      throw new Error(`API timed out at ${API_BASE_URL}`);
    }

    const message = caught instanceof Error ? caught.message : "Unknown network error";
    throw new Error(`API request failed at ${API_BASE_URL}: ${message}`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNearbyPlaces(): Promise<NearbyPlace[]> {
  const path = "/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500";
  const { envelope, response } = await requestEnvelope<NearbyPlace[]>(path);
  return unwrapEnvelope(response, envelope, "Failed to load nearby places");
}

export async function searchPlaces(query: string): Promise<NearbyPlace[]> {
  const params = new URLSearchParams({
    lat: "12.9352",
    lng: "77.6245",
    query,
    radius_m: "2500",
  });
  const { envelope, response } = await requestEnvelope<NearbyPlace[]>(
    `/places/search?${params.toString()}`,
  );
  return unwrapEnvelope(response, envelope, "Failed to search places");
}

export async function getPlaceDetail(slug: string): Promise<PlaceDetail> {
  const { envelope, response } = await requestEnvelope<PlaceDetail>(`/places/${slug}`);
  return unwrapEnvelope(response, envelope, "Failed to load place detail");
}

export async function submitVibeCheck(
  slug: string,
  payload: VibeCheckPayload,
  accessToken?: string,
): Promise<VibeCheckCreated> {
  const { envelope, response } = await requestEnvelope<VibeCheckCreated>(
    `/places/${slug}/vibe-checks`,
    {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      method: "POST",
    },
  );
  return unwrapEnvelope(response, envelope, "Failed to drop vibe check");
}

export async function startAuth(email: string): Promise<AuthStartResponse> {
  const { envelope, response } = await requestEnvelope<AuthStartResponse>("/auth/start", {
    body: JSON.stringify({ email }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  return unwrapEnvelope(response, envelope, "Failed to start sign in");
}

export async function verifyAuth(email: string, otpCode: string): Promise<AuthSessionResponse> {
  const { envelope, response } = await requestEnvelope<AuthSessionResponse>("/auth/verify", {
    body: JSON.stringify({ email, otp_code: otpCode }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  return unwrapEnvelope(response, envelope, "Failed to verify sign in");
}

export async function getMyProfile(accessToken: string): Promise<MyProfile> {
  const { envelope, response } = await requestEnvelope<MyProfile>("/profiles/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return unwrapEnvelope(response, envelope, "Failed to load profile");
}

export async function logout(accessToken: string): Promise<void> {
  const { envelope, response } = await requestEnvelope<{ revoked: boolean }>("/auth/logout", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "POST",
  });
  unwrapEnvelope(response, envelope, "Failed to sign out");
}
