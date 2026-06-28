# Changelog

Newest entries first. Every implementation commit should add a dated entry explaining what changed and why.

## 2026-06-29 - Project process and local foundation

**What changed:** Added project process docs, architecture docs, local Docker infrastructure, FastAPI health endpoint, and initial implementation plan.
**Why:** User requested end-to-end local development with clean code conventions, persistent context, dated changelog entries, small commits, and local Docker services for FastAPI/Postgres/PostGIS/pgvector/Redis/MinIO.
**Files touched:** `AGENTS.md`, `context.md`, `docs/conventions.md`, `docs/architecture/*`, `docs/superpowers/plans/2026-06-29-vibespot-local-mvp-foundation.md`, `docker-compose.yml`, `infra/docker/*`, `services/api/*`, `README.md`, `.env.example`.
**Reverts cleanly?:** partially. Docs revert cleanly; Docker volumes created by local verification are outside Git and need `docker compose down -v` if a full local reset is intended.
