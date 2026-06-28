# VibeSpot Context

## Now

Building the local MVP foundation end to end:

- Local Docker infra is running for Postgres/PostGIS/pgvector, Redis, and MinIO.
- FastAPI backend is running through Docker with explicit `uvicorn --reload`.
- Next implementation slice is database models, migrations, seed data, and `/places/nearby`.

## Done

- 2026-06-29: Explored product concept and UI references.
- 2026-06-29: Settled architecture direction: Expo mobile app, FastAPI backend, Postgres/PostGIS/pgvector, Redis, MinIO, deterministic LLM pipelines.
- 2026-06-29: Added architecture docs under `docs/architecture/`.
- 2026-06-29: Added implementation plan under `docs/superpowers/plans/`.
- 2026-06-29: Added local Docker infra on non-standard ports `38191-38195`.
- 2026-06-29: Verified Postgres has `postgis` and `vector` extensions.
- 2026-06-29: Verified FastAPI health endpoint through Docker at `http://localhost:38191/health`.

## Next

1. Add SQLAlchemy models and Alembic migration for users, places, vibe checks, and place summaries.
2. Add deterministic seed data for Bangalore/Koramangala cafes.
3. Add `/places/nearby` using PostGIS distance queries.
4. Set up Expo mobile shell on port `38201`.
5. Connect the mobile home screen to backend seed data.
6. Spike Google Maps integration once the basic screen and API loop are stable.

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
