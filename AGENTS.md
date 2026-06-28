# VibeSpot Agent Instructions

This repo is maintained by agentic coding sessions. Every session must begin by reading these files in order:

1. `context.md`
2. `CHANGELOG.md`
3. `docs/conventions.md`
4. `docs/architecture/README.md`
5. The relevant implementation plan under `docs/superpowers/plans/`

## Operating Rules

- Keep changes small and commit frequently with Conventional Commits.
- Update `context.md` and `CHANGELOG.md` in the same commit as the code or documentation change they describe.
- Test every meaningful change before claiming it works.
- Do not hardcode secrets. Use `.env`, `.env.local`, or Expo public env variables as appropriate.
- Treat `REsources/` as reference material only.
- Prefer simple deterministic pipelines over agents. Add an agent only when the workflow truly needs multi-step reasoning or tool use.

## Current Local Ports

- API: `38191`
- Postgres: `38192`
- Redis: `38193`
- MinIO API: `38194`
- MinIO Console: `38195`
- Expo: `38201`

## Verification Expectations

- Backend tests run inside Docker unless a Python 3.11 host environment is available.
- API health check: `curl.exe http://localhost:38191/health`
- Docker health/status: `docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"`

When stuck, update `context.md` with the problem, root cause, attempted solution, and next move before continuing.
