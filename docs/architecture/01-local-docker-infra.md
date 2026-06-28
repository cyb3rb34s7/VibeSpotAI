# Local Docker Infrastructure

The local stack should run entirely through Docker for repeatable development. No developer should need to install Postgres, PostGIS, Redis, or object storage directly on the host machine.

## Local Services

| Service | Container name | Internal port | Host port | Purpose |
| --- | --- | ---: | ---: | --- |
| FastAPI API | `vibespot-api` | `8000` | `38191` | Backend API |
| PostgreSQL/PostGIS | `vibespot-postgres` | `5432` | `38192` | Primary database |
| Redis | `vibespot-redis` | `6379` | `38193` | Cache and job broker |
| MinIO API | `vibespot-minio` | `9000` | `38194` | Local S3-compatible storage |
| MinIO Console | `vibespot-minio` | `9001` | `38195` | Local storage admin UI |
| Worker | `vibespot-worker` | none | none | Background jobs |

The host ports are intentionally high and non-standard to avoid conflicts with common local services such as Postgres `5432`, Redis `6379`, FastAPI `8000`, Vite `5173`, Next.js `3000`, and Expo `8081`.

## Local URLs

- API: `http://localhost:38191`
- API docs: `http://localhost:38191/docs`
- Postgres: `localhost:38192`
- Redis: `localhost:38193`
- MinIO API: `http://localhost:38194`
- MinIO Console: `http://localhost:38195`

## Expected Docker Compose Shape

The future `docker-compose.yml` should include:

- `api`
- `worker`
- `postgres`
- `redis`
- `minio`

The `api` and `worker` services should share the same backend image but run different commands.

Example command split:

```txt
api: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
worker: dramatiq app.jobs.summary_jobs
```

## Database Image

Use a PostGIS-enabled Postgres image locally, such as:

```txt
postgis/postgis
```

The app migration setup should enable:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
```

If pgvector is not included in the selected local image, use a custom database image or initialization script that installs/enables it. The implementation should verify this before app code depends on vector search.

## Environment Variables

Suggested local environment variables:

```txt
APP_ENV=local
API_PORT=38191

DATABASE_URL=postgresql+asyncpg://vibespot:vibespot@localhost:38192/vibespot
DATABASE_SYNC_URL=postgresql://vibespot:vibespot@localhost:38192/vibespot

REDIS_URL=redis://localhost:38193/0

S3_ENDPOINT_URL=http://localhost:38194
S3_ACCESS_KEY_ID=vibespot
S3_SECRET_ACCESS_KEY=vibespot-local-secret
S3_BUCKET=vibespot-local
S3_REGION=local

OPENAI_API_KEY=
MAPBOX_ACCESS_TOKEN=
```

`DATABASE_SYNC_URL` is useful for Alembic migrations if the runtime database session uses async SQLAlchemy.

## Local Data Volumes

Docker volumes should persist:

- Postgres data
- Redis data, if configured
- MinIO object data

Example volume names:

```txt
vibespot_postgres_data
vibespot_redis_data
vibespot_minio_data
```

## Local Seed Data

The first seed command should create:

- One city: Bangalore
- One neighborhood: Koramangala or Indiranagar
- 20 to 50 cafes
- 100 to 300 vibe checks
- A small set of users
- Generated place summaries
- Example taste profiles and badges

Seed data should be intentionally realistic enough to test the discovery loop, not just placeholder rows.

## Local Reset Policy

Local reset should be explicit and documented. It should never happen as a side effect of starting containers.

Expected future commands:

```txt
make infra-up
make infra-down
make migrate
make seed
make reset-local-db
```

`reset-local-db` should be clearly destructive and reserved for local development only.
