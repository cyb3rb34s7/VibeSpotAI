# Backend Design

The backend is a FastAPI application backed by PostgreSQL/PostGIS/pgvector, Redis, and S3-compatible storage.

## Responsibilities

The backend owns:

- User authentication and profiles
- Place data
- Vibe-check submission
- Nearby and map viewport queries
- Intent search
- Saved places
- Badges and reputation events
- AI-generated place summaries
- Background jobs
- Media upload coordination

The backend should not depend on mobile-only logic for data integrity. Important validation must happen server-side.

## Project Shape

Expected backend structure:

```txt
backend/
  app/
    main.py
    core/
      config.py
      security.py
      logging.py
    api/
      routes/
        auth.py
        places.py
        vibe_checks.py
        search.py
        profiles.py
        badges.py
        media.py
    db/
      session.py
      models/
      migrations/
    schemas/
      auth.py
      place.py
      vibe_check.py
      search.py
      profile.py
      badge.py
    services/
      places_service.py
      vibe_checks_service.py
      search_service.py
      reputation_service.py
      summaries_service.py
      media_service.py
    ai/
      prompts/
      pipelines/
        place_summary.py
        intent_parse.py
        tag_extraction.py
    jobs/
      broker.py
      summary_jobs.py
    tests/
```

## Backend Libraries

Recommended backend libraries:

- FastAPI
- Uvicorn
- Pydantic v2
- SQLAlchemy 2.x
- GeoAlchemy2 for PostGIS types/functions
- asyncpg for async Postgres access
- Alembic for migrations
- Dramatiq for jobs
- redis-py
- boto3 or aioboto3 for S3-compatible storage
- OpenAI Python SDK
- pytest
- httpx for API tests

## API Areas

### Auth

MVP auth can begin with email OTP or phone OTP, depending on product preference. The backend should issue app sessions and store users independently of any third-party auth provider.

Endpoints:

```txt
POST /auth/start
POST /auth/verify
POST /auth/logout
GET  /auth/me
```

### Places

Places are the main discovery object.

Endpoints:

```txt
GET  /places/nearby
GET  /places/map
GET  /places/{place_id}
POST /places/{place_id}/save
DELETE /places/{place_id}/save
```

`/places/nearby` should use PostGIS distance filtering.

`/places/map` should use the current map viewport bounds to return pins and lightweight summaries.

### Vibe Checks

Vibe checks are structured contributions, not free-form reviews.

Endpoints:

```txt
POST /vibe-checks
GET  /places/{place_id}/vibe-checks
GET  /users/{user_id}/vibe-checks
```

On creation, the backend should:

1. Validate the user and place.
2. Calculate location confidence if user coordinates are provided.
3. Store structured answers.
4. Create reputation events where appropriate.
5. Refresh the local summary immediately and optionally enqueue follow-up jobs.
6. Return the immediate reward state.

### Search

Search should support intent-first discovery.

Endpoints:

```txt
POST /search/intent
GET  /search/suggestions
```

The intent endpoint should parse a natural-language query into structured filters, then combine geospatial filtering, text search, vector search, and ranking.

### Profiles

Profiles expose identity and progress.

Endpoints:

```txt
GET /profiles/me
GET /profiles/{user_id}
GET /profiles/me/city-map
```

### Badges And Reputation

Badges and reputation should be event-driven, not hardcoded in the mobile app.

Endpoints:

```txt
GET /profiles/me/badges
GET /profiles/me/reputation
```

## Background Jobs

Initial jobs:

- Refresh place summary after new vibe checks
- Extract tags from vibe-check text
- Generate embeddings for places and vibe checks
- Refresh user taste profile
- Recompute local trending scores

Jobs should be idempotent where possible. Re-running a summary job should update the same summary row, not create duplicates.

The current local worker entrypoint is:

```txt
dramatiq app.jobs.summary_jobs
```

## Error Handling

API errors should use a consistent response shape:

```json
{
  "error": {
    "code": "place_not_found",
    "message": "Place not found.",
    "details": {}
  }
}
```

Mobile-friendly error codes matter because the frontend should respond predictably.

## Testing Strategy

Backend tests should cover:

- API validation
- PostGIS nearby queries
- Vibe-check submission
- Summary refresh job behavior
- Intent parser schemas
- Ranking behavior using seeded data
- Authorization boundaries

AI tests should use fixed fixtures and schema validation first. Model quality evals can come later.
