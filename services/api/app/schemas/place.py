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
