# Changelog

Newest entries first. Every implementation commit should add a dated entry explaining what changed and why.

## 2026-06-29 - Add nearby places API

**What changed:** Added trace-aware response envelopes, `/places/nearby`, nearby place schemas, and a PostGIS-backed service query.
**Why:** The mobile map home needs a real local endpoint that returns seeded cafes ordered by distance.
**Files touched:** `services/api/app/main.py`, `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/app/core/response.py`, `services/api/app/core/trace.py`, `services/api/tests/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add database schema and seed data

**What changed:** Added Alembic setup, initial Postgres/PostGIS schema, SQLAlchemy models, and a seed script with Koramangala cafe data.
**Why:** The MVP needs real local data to test map-first discovery and nearby place queries.
**Files touched:** `services/api/alembic.ini`, `services/api/app/db/*`, `services/api/app/scripts/seed.py`, `services/api/Dockerfile`, `infra/docker/postgres/init/001-extensions.sql`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** partially. Code reverts cleanly; local database tables/data remain until Docker volumes are reset or a downgrade/reset is run.

## 2026-06-29 - Normalize seed database connection

**What changed:** Seed script now converts SQLAlchemy's psycopg URL into a direct psycopg connection URL.
**Why:** `psycopg.connect()` does not accept `postgresql+psycopg://` connection strings.
**Files touched:** `services/api/app/scripts/seed.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Fix Alembic sync driver

**What changed:** Updated sync database URLs to use `postgresql+psycopg://`.
**Why:** Alembic selected psycopg2 for plain `postgresql://` URLs, but the backend uses psycopg v3.
**Files touched:** `.env.example`, `docker-compose.yml`, `services/api/app/core/config.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Project process and local foundation

**What changed:** Added project process docs, architecture docs, local Docker infrastructure, FastAPI health endpoint, and initial implementation plan.
**Why:** User requested end-to-end local development with clean code conventions, persistent context, dated changelog entries, small commits, and local Docker services for FastAPI/Postgres/PostGIS/pgvector/Redis/MinIO.
**Files touched:** `AGENTS.md`, `context.md`, `docs/conventions.md`, `docs/architecture/*`, `docs/superpowers/plans/2026-06-29-vibespot-local-mvp-foundation.md`, `docker-compose.yml`, `infra/docker/*`, `services/api/*`, `README.md`, `.env.example`.
**Reverts cleanly?:** partially. Docs revert cleanly; Docker volumes created by local verification are outside Git and need `docker compose down -v` if a full local reset is intended.
