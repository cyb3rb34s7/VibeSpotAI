"""initial schema

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-29
"""

from alembic import op

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            handle varchar(40) NOT NULL UNIQUE,
            display_name varchar(120) NOT NULL,
            home_city varchar(120) NOT NULL DEFAULT 'Bangalore',
            created_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS places (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name varchar(160) NOT NULL,
            slug varchar(180) NOT NULL UNIQUE,
            category varchar(80) NOT NULL DEFAULT 'cafe',
            address text NOT NULL,
            city varchar(120) NOT NULL DEFAULT 'Bangalore',
            neighborhood varchar(120) NOT NULL,
            location geography(Point, 4326) NOT NULL,
            tags jsonb NOT NULL DEFAULT '[]'::jsonb,
            created_at timestamptz NOT NULL DEFAULT now(),
            updated_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_places_location ON places USING gist (location)")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS vibe_checks (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
            visit_intent varchar(80) NOT NULL,
            noise_score integer NOT NULL CHECK (noise_score BETWEEN 0 AND 100),
            wifi_score integer NOT NULL CHECK (wifi_score BETWEEN 1 AND 5),
            crowd_level varchar(40) NOT NULL,
            best_use_case varchar(120) NOT NULL,
            recommend_mode varchar(80) NOT NULL,
            short_note varchar(180) NOT NULL,
            location_confidence double precision NOT NULL DEFAULT 1.0,
            trust_weight double precision NOT NULL DEFAULT 1.0,
            raw_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
            submitted_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )
    op.execute("CREATE INDEX IF NOT EXISTS ix_vibe_checks_place_id ON vibe_checks(place_id)")
    op.execute("CREATE INDEX IF NOT EXISTS ix_vibe_checks_submitted_at ON vibe_checks(submitted_at)")
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS place_summaries (
            place_id uuid PRIMARY KEY REFERENCES places(id) ON DELETE CASCADE,
            summary_text text NOT NULL,
            best_for varchar(160) NOT NULL,
            avoid_when varchar(160) NOT NULL,
            evidence_count integer NOT NULL,
            confidence_score double precision NOT NULL,
            data_window varchar(80) NOT NULL DEFAULT 'last 30 days',
            generated_at timestamptz NOT NULL DEFAULT now()
        )
        """
    )


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS place_summaries")
    op.execute("DROP TABLE IF EXISTS vibe_checks")
    op.execute("DROP TABLE IF EXISTS places")
    op.execute("DROP TABLE IF EXISTS users")
