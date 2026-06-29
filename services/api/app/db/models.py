import uuid
from datetime import datetime

from geoalchemy2 import Geography
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    handle: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    display_name: Mapped[str] = mapped_column(String(120), nullable=False)
    home_city: Mapped[str] = mapped_column(String(120), nullable=False, default="Bangalore")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    vibe_checks: Mapped[list["VibeCheck"]] = relationship(back_populates="user")


class Place(Base):
    __tablename__ = "places"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(180), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False, default="cafe")
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[str] = mapped_column(String(120), nullable=False, default="Bangalore")
    neighborhood: Mapped[str] = mapped_column(String(120), nullable=False)
    location: Mapped[str] = mapped_column(
        Geography(geometry_type="POINT", srid=4326), nullable=False
    )
    tags: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    vibe_checks: Mapped[list["VibeCheck"]] = relationship(back_populates="place")
    summary: Mapped["PlaceSummary"] = relationship(back_populates="place")


class VibeCheck(Base):
    __tablename__ = "vibe_checks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id"), nullable=False)
    visit_intent: Mapped[str] = mapped_column(String(80), nullable=False)
    noise_score: Mapped[int] = mapped_column(Integer, nullable=False)
    wifi_score: Mapped[int] = mapped_column(Integer, nullable=False)
    crowd_level: Mapped[str] = mapped_column(String(40), nullable=False)
    best_use_case: Mapped[str] = mapped_column(String(120), nullable=False)
    recommend_mode: Mapped[str] = mapped_column(String(80), nullable=False)
    short_note: Mapped[str] = mapped_column(String(180), nullable=False)
    location_confidence: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    trust_weight: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    raw_answers: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    submitted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    user: Mapped[User] = relationship(back_populates="vibe_checks")
    place: Mapped[Place] = relationship(back_populates="vibe_checks")


class PlaceSummary(Base):
    __tablename__ = "place_summaries"

    place_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("places.id"), primary_key=True, nullable=False
    )
    summary_text: Mapped[str] = mapped_column(Text, nullable=False)
    best_for: Mapped[str] = mapped_column(String(160), nullable=False)
    avoid_when: Mapped[str] = mapped_column(String(160), nullable=False)
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    data_window: Mapped[str] = mapped_column(String(80), nullable=False, default="last 30 days")
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()"), nullable=False
    )

    place: Mapped[Place] = relationship(back_populates="summary")
