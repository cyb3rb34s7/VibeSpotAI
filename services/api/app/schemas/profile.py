from pydantic import BaseModel, Field

from app.schemas.auth import AuthUser


class ProfileStats(BaseModel):
    vibe_checks_count: int = Field(ge=0)
    places_contributed_count: int = Field(ge=0)


class TasteTag(BaseModel):
    label: str
    count: int = Field(ge=0)


class RecentDrop(BaseModel):
    place_name: str
    place_slug: str
    short_note: str
    best_use_case: str
    submitted_at: str


class MyProfile(BaseModel):
    user: AuthUser
    stats: ProfileStats
    taste_tags: list[TasteTag]
    recent_drops: list[RecentDrop]
