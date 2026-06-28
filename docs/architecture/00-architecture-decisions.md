# Architecture Decisions

## Product Direction

VibeSpot is a mobile-first local experience intelligence app. The primary user value is not writing reviews; it is finding the right place for a specific intent right now.

The core loop is:

```txt
Map or intent search
-> place intelligence card
-> quick vibe check
-> updated local signal
-> profile/reputation feedback
```

The first MVP should focus on one city, one neighborhood, and one sharp use case: work-friendly cafes in Bangalore.

## Decisions

### Use FastAPI for the backend

FastAPI is the default backend framework for the MVP.

Reasons:

- Python is the better center of gravity for AI, embeddings, data enrichment, and future agent workflows.
- FastAPI gives strong request/response validation through Pydantic.
- The backend can produce OpenAPI docs automatically.
- The React Native app can consume a generated TypeScript client from the OpenAPI schema.
- One backend language keeps the MVP simpler than a TypeScript API plus separate Python AI service.

### Use PostgreSQL as the primary database

PostgreSQL is the primary system of record.

Reasons:

- VibeSpot data is relational: users, places, vibe checks, tags, saves, badges, reputation events, and summaries.
- Postgres supports strong transactions and migrations.
- Postgres supports flexible JSONB fields when the vibe-check schema needs room to evolve.
- Postgres can also support semantic search through pgvector.

### Use PostGIS for location intelligence

PostGIS is required for map-first behavior.

It enables:

- Nearby places
- Distance sorting
- Places inside neighborhoods
- Map viewport filtering
- Location confidence for vibe checks
- Trending places by area

### Use pgvector for semantic retrieval

pgvector should be enabled in Postgres for embeddings.

It will support:

- Intent search
- Semantic matching between user queries and place summaries
- Similar vibe checks
- Taste-profile matching later

### Use Redis for cache and jobs

Redis should be included locally from day one.

Uses:

- Background job broker for summary refreshes
- Short-lived API cache
- Rate-limit counters
- Idempotency keys
- Lightweight locks for duplicate recomputation prevention

### Use Dramatiq for background workers

Dramatiq is the preferred worker system for the MVP.

Reasons:

- Simple Python-first job processing
- Redis broker support
- Less ceremony than Celery for the current scope
- Good fit for deterministic LLM pipelines and summary refresh jobs

Celery remains a later option if scheduling, retries, monitoring, or workflow complexity grows.

### Use S3-compatible storage shape

Local development should use MinIO. Production can use Cloudflare R2, AWS S3, or another S3-compatible object store.

This avoids binding app logic to a local filesystem.

## Non-Decisions For Now

### No Supabase dependency

The system should not depend on Supabase managed cloud. Supabase-like ergonomics are useful, but the app should own its backend, database, and API contracts.

### No MongoDB as primary database

MongoDB is not selected for the primary store because VibeSpot is geospatial, relational, and ranking-heavy. Postgres with PostGIS, JSONB, and pgvector covers both structured and flexible data without splitting the core data model.

### No default agents

Most AI workflows should be deterministic pipelines with strict inputs and outputs. An LLM call is not automatically an agent.

Agents may be introduced only when a workflow genuinely needs multi-step reasoning, tool use, or investigation across uncertain evidence.

## MVP AI Rule

Start with boring, inspectable AI pipelines:

```txt
event happens
-> fetch bounded context
-> call model with schema
-> validate output
-> store result
-> expose confidence and freshness
```

This is easier to test, cheaper to run, and safer for user trust.
