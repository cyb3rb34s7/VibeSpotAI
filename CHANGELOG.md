# Changelog

Newest entries first. Every implementation commit should add a dated entry explaining what changed and why.

## 2026-06-29 - Add local runbook and API examples

**What changed:** Expanded the README with local run/test commands and added API examples for health, nearby places, place detail, and vibe-check submission.
**Why:** The local MVP should be easy to run and verify from a fresh clone.
**Files touched:** `README.md`, `docs/api-examples.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add Dramatiq worker groundwork

**What changed:** Added Redis-backed Dramatiq broker setup, a summary refresh actor, an enqueue boundary test, and a `worker` Docker Compose service.
**Why:** The MVP needs a background job path ready for summary refreshes, tag extraction, embeddings, and future profile work without turning every request into a long-running process.
**Files touched:** `docker-compose.yml`, `services/api/app/jobs/*`, `services/api/tests/test_summary_jobs.py`, `docs/architecture/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Stop/remove `vibespot-worker` if reverting while it is running.

## 2026-06-29 - Refresh summaries after vibe checks

**What changed:** Added deterministic summary refresh after vibe-check submission and tightened tests so evidence counts update and cleanup restores local seed state.
**Why:** Place details should reflect newly submitted local signals immediately without needing an LLM or background worker.
**Files touched:** `services/api/app/services/places_service.py`, `services/api/tests/test_places_api.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Normalize API error envelopes

**What changed:** Added trace-aware handlers for HTTP errors and request validation errors.
**Why:** Mobile and future clients should receive one predictable envelope shape for both success and failure.
**Files touched:** `services/api/app/main.py`, `services/api/app/core/response.py`, `services/api/tests/test_error_envelopes.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add vibe-check submission loop

**What changed:** Added `POST /places/{slug}/vibe-checks`, request/response schemas, local demo-user insertion, API tests, mobile submission client, and an in-sheet signal form.
**Why:** VibeSpot needs a contribution loop so the app can collect fresh local signals, not only display seeded recommendations.
**Files touched:** `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/tests/test_places_api.py`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/PlaceDetailSheet.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** mostly. Code reverts cleanly; any manually submitted local vibe checks remain in the database until deleted or reseeded.

## 2026-06-29 - Add place detail loop

**What changed:** Added `GET /places/{slug}` with summary, signals, and recent vibe checks; added a mobile place detail bottom sheet opened from nearby place cards.
**Why:** The map-first home screen needs a real inspection flow so users can understand why a place is recommended before contributing or visiting.
**Files touched:** `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/app/core/response.py`, `services/api/app/db/session.py`, `services/api/tests/test_places_api.py`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/*`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add Expo-safe premium press states

**What changed:** Added a reusable animated `PressScale` wrapper, replaced fragile text glyph icons with Expo vector icons, and tightened the search, place card, and bottom nav interaction states.
**Why:** The mobile shell needs premium-feeling touch feedback without relying on glyph rendering or dependencies that break Metro bundling.
**Files touched:** `apps/mobile/package.json`, `apps/mobile/package-lock.json`, `apps/mobile/src/components/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Reinstall mobile dependencies after reverting package metadata.

## 2026-06-29 - Add Google Maps web fallback

**What changed:** Added a `VibeMap` component that tries Google Maps on web when an env key is present and falls back to the stylized local map if Google reports a load error.
**Why:** Local iteration should continue even when Google Cloud key restrictions or API enablement are not fully configured yet.
**Files touched:** `apps/mobile/src/components/VibeMap.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add Expo mobile shell

**What changed:** Added Expo TypeScript app, premium VibeSpot home screen, theme tokens, backend API client, map preview, place cards, search pill, and bottom navigation.
**Why:** The project needs a local mobile-first surface that can iterate visually while consuming the FastAPI backend.
**Files touched:** `apps/mobile/*`, `services/api/app/main.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** partially. Code reverts cleanly; installed npm packages are local artifacts and can be restored with `npm install`.

## 2026-06-29 - Allow Expo web API calls

**What changed:** Added CORS middleware for local Expo web origins.
**Why:** The browser app on port `38201` could not fetch the FastAPI backend on port `38191` without CORS headers.
**Files touched:** `services/api/app/main.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

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
