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
