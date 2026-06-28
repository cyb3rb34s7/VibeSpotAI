# VibeSpot

VibeSpot is a map-first local experience intelligence app for discovering places by intent, not star ratings.

## Local Stack

- Mobile: Expo React Native
- Backend: FastAPI
- Database: PostgreSQL with PostGIS and pgvector
- Cache/jobs: Redis
- Workers: Dramatiq
- Storage: MinIO using the S3 API shape

## Reserved Local Ports

- API: http://localhost:38191
- Postgres: localhost:38192
- Redis: localhost:38193
- MinIO API: http://localhost:38194
- MinIO Console: http://localhost:38195
- Expo: http://localhost:38201

## Local Runbook

Start infrastructure and backend:

```powershell
docker compose up -d --build postgres redis minio minio-init api worker
```

Run migrations and seed data:

```powershell
docker compose run --rm api alembic upgrade head
docker compose run --rm api python -m app.scripts.seed
```

Run backend tests:

```powershell
docker compose run --rm api pytest -q
```

Start the mobile app on the reserved Expo web port:

```powershell
cd apps/mobile
npm install
npm run web
```

Check the core local endpoints:

```powershell
curl.exe http://localhost:38191/health
curl.exe "http://localhost:38191/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500"
```

## Current MVP Loop

The local MVP supports:

- Nearby place discovery around Koramangala using PostGIS.
- Place detail sheets with summary, signal averages, and recent drops.
- Local vibe-check submission through the mobile detail sheet.
- Deterministic summary refresh after submissions.
- Trace-aware API success and error envelopes.
- Redis-backed Dramatiq worker groundwork for future async jobs.

## References

The `REsources/` folder contains concept and UI reference material. It is not the production codebase.
