# VibeSpot Conventions

This is the rulebook for this repo. If a convention becomes wrong or stale, fix this file first, then update the code.

## Reading Order

Every new session starts by reading:

1. `context.md`
2. `CHANGELOG.md`
3. `docs/conventions.md`
4. `docs/architecture/README.md`
5. The relevant plan in `docs/superpowers/plans/`

## Core Principles

1. **KISS:** Build the simplest thing that satisfies the current product slice.
2. **DRY after the third use:** First time write it, second time notice it, third time extract it.
3. **No silent fallbacks:** If a critical path needs a fallback, document and justify it.
4. **Fail closed:** Reject uncertain writes, invalid data, and unverified assumptions.
5. **Traceability:** Errors and logs should be debuggable by request once the API envelope is introduced.
6. **Honesty over polish:** Known gaps go in `context.md`.

## Process

- Each meaningful slice updates code, tests, `context.md`, and `CHANGELOG.md`.
- Commit every small verified slice.
- Use Conventional Commits:

```txt
<type>(<scope>): <subject>
```

Examples:

- `docs(process): add project conventions`
- `feat(api): add nearby places endpoint`
- `test(api): cover geospatial place ordering`

## Local Checks

Backend:

```powershell
docker compose run --rm api pytest -q
curl.exe http://localhost:38191/health
```

Docker infra:

```powershell
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

Mobile:

```powershell
cd apps/mobile
npm run typecheck
npm run lint
npx expo start --port 38201
```

If a check is unavailable because a tool is not installed yet, document the gap in `context.md`.

## Backend Conventions

- Framework: FastAPI.
- Python target: 3.11.
- Validation: Pydantic schemas at API boundaries.
- Database: SQLAlchemy 2.x, Alembic migrations, Postgres/PostGIS/pgvector.
- Geospatial logic belongs in database queries, not ad hoc latitude/longitude math.
- API routes stay thin and call service functions.
- Services own business logic.
- No route should reach directly into another module's internals.
- Use explicit typed schemas for responses; do not return unshaped ORM objects.
- Broad exception catches must re-raise or wrap into typed API errors.

## Frontend Conventions

- Framework: Expo React Native with TypeScript.
- The app should feel premium, iOS-like, smooth, and map-first.
- Components should be presentational where possible.
- API calls live in API/client or hooks, not deep inside visual components.
- Use design tokens from `apps/mobile/src/theme/`.
- Avoid magic strings in branches; use `as const` enums for modes, tags, statuses, and error codes.
- Do not hardcode secrets or API keys in source.

## AI Conventions

- Use deterministic pipelines by default:

```txt
event -> bounded context -> strict model call -> schema validation -> stored output
```

- Do not call a pipeline an agent unless it performs multi-step reasoning or tool use.
- Store model version and evidence counts for generated summaries.
- Never hide AI uncertainty from product surfaces that rely on trust.

## Data Conventions

- Vibe checks are structured contributions, not reviews.
- Place summaries must carry freshness and evidence counts.
- Location columns use PostGIS types.
- Flexible experiment data can use JSONB, but core relations should be explicit tables.

## Secrets

- `.env`, `.env.local`, and Expo env files are local-only.
- `.env.example` documents names but never real values.
- Any exposed Google/OpenAI key should be treated as compromised until restricted or rotated.

## Documentation Discipline

- `context.md` tracks what is happening, what broke, what was decided, and what comes next.
- `CHANGELOG.md` is append-only with newest entries first.
- Architecture docs explain system design; conventions explain how we work.
