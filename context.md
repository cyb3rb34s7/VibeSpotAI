# VibeSpot Context

## Now

Building the local MVP foundation end to end:

- Local Docker infra is running for Postgres/PostGIS/pgvector, Redis, and MinIO.
- FastAPI backend is running through Docker with explicit `uvicorn --reload`.
- `/places/nearby` returns seeded Koramangala cafes ordered by PostGIS distance.
- Expo web runs on port `38201` and renders seeded nearby places from the backend.
- Next implementation slice is Google Maps integration and then the place detail/vibe-check loop.

## Done

- 2026-06-29: Explored product concept and UI references.
- 2026-06-29: Settled architecture direction: Expo mobile app, FastAPI backend, Postgres/PostGIS/pgvector, Redis, MinIO, deterministic LLM pipelines.
- 2026-06-29: Added architecture docs under `docs/architecture/`.
- 2026-06-29: Added implementation plan under `docs/superpowers/plans/`.
- 2026-06-29: Added local Docker infra on non-standard ports `38191-38195`.
- 2026-06-29: Verified Postgres has `postgis` and `vector` extensions.
- 2026-06-29: Verified FastAPI health endpoint through Docker at `http://localhost:38191/health`.
- 2026-06-29: Added API response envelope with trace IDs.
- 2026-06-29: Added `/places/nearby` backed by PostGIS distance queries.
- 2026-06-29: Added Expo TypeScript mobile shell with premium VibeSpot map-home UI.
- 2026-06-29: Verified Expo web renders backend place data in a phone-sized viewport.

## Next

1. Add Google Maps integration behind the existing map component.
2. Add the place detail endpoint and place detail screen.
3. Add the vibe-check submission endpoint and mobile flow.
4. Add typed error envelopes and global exception handling.
5. Add backend worker setup for summary refresh jobs.

## Problems & Solutions

### 2026-06-29 - Empty `.git` directory

**Problem:** `git status` failed even though `.git` existed.
**Root cause:** `.git` was an empty directory, not an initialized repository.
**Solution:** Initialize Git before the first required small commit.
**Follow-up:** Keep commits small and update this file plus `CHANGELOG.md` with each meaningful slice.

### 2026-06-29 - Host Python command unavailable

**Problem:** `python` was not available on the Windows PATH; `py` points to Python 3.14 while backend targets Python 3.11.
**Root cause:** Host Python environment does not match runtime target.
**Solution:** Run backend installation and tests inside the Docker Python 3.11 image.
**Follow-up:** Prefer Docker-based backend verification unless a local Python 3.11 virtual environment is intentionally created.

### 2026-06-29 - Alembic sync URL selected psycopg2

**Problem:** `alembic upgrade head` failed with `ModuleNotFoundError: No module named 'psycopg2'`.
**Root cause:** SQLAlchemy treats `postgresql://` sync URLs as psycopg2 by default, but the backend installs psycopg v3.
**Solution:** Use `postgresql+psycopg://` for `DATABASE_SYNC_URL` and local sync URLs.
**Follow-up:** Any sync SQLAlchemy URL in this repo must explicitly include the driver.

### 2026-06-29 - psycopg direct connector rejected SQLAlchemy URL

**Problem:** `python -m app.scripts.seed` failed with `missing "=" after "postgresql+psycopg://..."`.
**Root cause:** `psycopg.connect()` accepts libpq-style or standard Postgres URLs, not SQLAlchemy's driver-qualified URL.
**Solution:** Normalize the seed script connection string from `postgresql+psycopg://` to `postgresql://` before connecting.
**Follow-up:** Keep raw driver connection helpers centralized if more scripts need direct psycopg access.

### 2026-06-29 - Expo web could not fetch local API

**Problem:** Expo web rendered but showed `Backend not reachable` with `Failed to fetch`.
**Root cause:** Browser requests from Expo web origin `http://localhost:38201` to API origin `http://localhost:38191` need explicit CORS headers.
**Solution:** Add FastAPI CORS middleware for `localhost:38201` and `127.0.0.1:38201`.
**Follow-up:** Add production origins only when deployment domains are known; do not use wildcard origins with credentials.

### 2026-06-29 - Expo template installed with npm audit warnings

**Problem:** `npm install` from `create-expo-app` reported 10 moderate vulnerabilities.
**Root cause:** Template dependency tree currently reports advisories through npm audit.
**Solution:** Do not run `npm audit fix --force` blindly because it can introduce breaking dependency changes in Expo projects.
**Follow-up:** Revisit after core app shell is stable; prefer Expo-compatible dependency updates.

### 2026-06-29 - Google Maps script loads but map errors

**Problem:** Expo web loaded the Google Maps JS script, but Google rendered `This page didn't load Google Maps correctly`.
**Root cause:** The browser key likely needs Google Maps JavaScript API enablement, billing, or localhost referrer restrictions configured in Google Cloud.
**Solution:** Keep the real Google Maps path behind `EXPO_PUBLIC_GOOGLE_MAPS_BROWSER_KEY`, detect Google's error container, and fall back to the stylized VibeSpot map.
**Follow-up:** When the Google Cloud key is ready, test `http://localhost:38201` as an allowed referrer and confirm Maps JavaScript API is enabled.

### 2026-06-29 - Postgres image needed both PostGIS and pgvector

**Problem:** A plain pgvector image would not guarantee PostGIS support.
**Root cause:** VibeSpot requires both location functions and vector search.
**Solution:** Added a custom Postgres 16 image that installs `postgresql-16-postgis-3` and `postgresql-16-pgvector`.
**Follow-up:** Keep extension availability checked with `SELECT extname FROM pg_extension WHERE extname IN ('postgis','vector');`.

## Decisions

- Use FastAPI for the entire backend to keep AI/data workflows and API logic in one Python codebase for the MVP.
- Use deterministic LLM pipelines instead of default agents.
- Use Postgres with PostGIS and pgvector as the primary store because VibeSpot is relational, geospatial, and search-heavy.
- Use Docker as the backend runtime and test environment because it gives a stable Python 3.11 environment.
- Treat Lovable/charm-sketch UI as reference only, not production architecture.
- Keep root `AGENTS.md` as the single agent instruction source; remove generated nested agent files from app scaffolds.
- Google Maps integration should degrade to the stylized local map if key/configuration fails during local iteration.

## Critical Files

- `AGENTS.md`: instructions for future coding agents.
- `context.md`: active project memory, problems, and decisions.
- `CHANGELOG.md`: dated history of what changed and why.
- `docs/conventions.md`: coding and process conventions.
- `docs/architecture/`: technical architecture docs.
- `docs/superpowers/plans/2026-06-29-vibespot-local-mvp-foundation.md`: current implementation plan.
- `docker-compose.yml`: local service topology.
- `services/api/app/main.py`: FastAPI entrypoint.

## Solution Notes

- If backend verification fails on host Python, rerun the same check through Docker before changing code.
- If adding a database feature, confirm both migration behavior and runtime API behavior.
- If adding a fallback, document it explicitly before implementing. Silent fallbacks are not allowed.
