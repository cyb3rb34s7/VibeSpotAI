from pydantic import BaseModel, Field


class NearbyPlace(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    neighborhood: str
    lat: float
    lng: float
    distance_m: int = Field(ge=0)
    tags: list[str]
    match_percent: int = Field(ge=0, le=100)
    summary: str
    best_for: str
    avoid_when: str
    evidence_count: int = Field(ge=0)


class PlaceSignalSummary(BaseModel):
    avg_noise_score: float = Field(ge=0)
    avg_wifi_score: float = Field(ge=0)
    top_crowd_level: str
    top_recommend_mode: str


class RecentVibeCheck(BaseModel):
    visit_intent: str
    best_use_case: str
    short_note: str
    crowd_level: str
    recommend_mode: str
    submitted_at: str


class PlaceDetail(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    address: str
    city: str
    neighborhood: str
    lat: float
    lng: float
    tags: list[str]
    summary: str
    best_for: str
    avoid_when: str
    evidence_count: int = Field(ge=0)
    data_window: str
    confidence_score: float = Field(ge=0, le=1)
    signals: PlaceSignalSummary
    recent_vibe_checks: list[RecentVibeCheck]


class VibeCheckCreate(BaseModel):
    visit_intent: str = Field(min_length=2, max_length=80)
    noise_score: int = Field(ge=0, le=100)
    wifi_score: int = Field(ge=1, le=5)
    crowd_level: str = Field(min_length=2, max_length=40)
    best_use_case: str = Field(min_length=2, max_length=120)
    recommend_mode: str = Field(min_length=2, max_length=80)
    short_note: str = Field(min_length=4, max_length=180)
    location_confidence: float = Field(default=1.0, ge=0, le=1)


class VibeCheckCreated(BaseModel):
    id: str
    place_slug: str
    visit_intent: str
    noise_score: int = Field(ge=0, le=100)
    wifi_score: int = Field(ge=1, le=5)
    crowd_level: str
    best_use_case: str
    recommend_mode: str
    short_note: str
    location_confidence: float = Field(ge=0, le=1)
    trust_weight: float = Field(ge=0, le=1)
    submitted_at: str
