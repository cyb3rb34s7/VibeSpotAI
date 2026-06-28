# VibeSpot Local MVP Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a locally runnable VibeSpot foundation with Docker infrastructure, a FastAPI backend, seedable location data, and an Expo mobile app shell ready for premium map-first product development.

**Architecture:** Use a monorepo with separate mobile, backend, and infrastructure folders. The backend owns data and APIs through FastAPI, PostgreSQL/PostGIS/pgvector, Redis-backed jobs, and MinIO object storage. The mobile app uses Expo React Native with TypeScript and consumes backend APIs from a typed client.

**Tech Stack:** Expo, React Native, TypeScript, FastAPI, Python 3.11, PostgreSQL with PostGIS and pgvector, Redis, Dramatiq, MinIO, Docker Compose, pytest, curl/httpx.

## Global Constraints

- Keep local host ports unique and non-standard: API `38191`, Postgres `38192`, Redis `38193`, MinIO API `38194`, MinIO Console `38195`.
- Treat `REsources/charm-sketch-pad-main/` and `REsources/stitch_vibespot_local_experience_intelligence/` as references only.
- Do not hardcode Google Maps, OpenAI, or other real secrets in source files.
- Use local Docker infrastructure first; cloud deployment is deferred until the local product loop works.
- Use deterministic LLM pipelines, not agents, unless a workflow truly needs multi-step reasoning or tool use.
- Use FastAPI for the whole backend.
- Use PostgreSQL/PostGIS/pgvector as the primary data store.
- Optimize for premium iOS-style UI, smooth motion, solid colors, and a calmer version of the Kinetic Noir direction.

---

## File Structure

Create this structure:

```txt
apps/
  mobile/
services/
  api/
    app/
      main.py
      core/
      api/
      db/
      schemas/
      services/
      jobs/
      ai/
    tests/
infra/
  docker/
docs/
  architecture/
  superpowers/
    plans/
```

Responsibilities:

- `apps/mobile`: Expo app, UI system, navigation, Google Maps integration, API client.
- `services/api`: FastAPI backend, migrations, seed data, tests, worker tasks.
- `infra/docker`: Docker Compose and local infrastructure config.
- `docs`: Architecture and implementation plans.

---

### Task 1: Monorepo Skeleton And Local Environment Contract

**Files:**
- Create: `README.md`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `apps/mobile/.gitkeep`
- Create: `services/api/.gitkeep`
- Create: `infra/docker/.gitkeep`

**Interfaces:**
- Produces: a stable repo layout and documented environment variable names consumed by later Docker, API, and mobile tasks.

- [x] **Step 1: Create the repository folders**

Create:

```txt
apps/mobile/
services/api/
infra/docker/
```

- [x] **Step 2: Add root README**

Create `README.md`:

```md
# VibeSpot

VibeSpot is a map-first local experience intelligence app for discovering places by intent, not star ratings.

## Local Stack

- Mobile: Expo React Native
- Backend: FastAPI
- Database: PostgreSQL with PostGIS and pgvector
- Cache/jobs: Redis
- Storage: MinIO using the S3 API shape

## Reserved Local Ports

- API: http://localhost:38191
- Postgres: localhost:38192
- Redis: localhost:38193
- MinIO API: http://localhost:38194
- MinIO Console: http://localhost:38195

## References

The `REsources/` folder contains concept and UI reference material. It is not the production codebase.
```

- [x] **Step 3: Add root `.env.example`**

Create `.env.example`:

```txt
APP_ENV=local
API_PORT=38191

POSTGRES_DB=vibespot
POSTGRES_USER=vibespot
POSTGRES_PASSWORD=vibespot
DATABASE_URL=postgresql+asyncpg://vibespot:vibespot@postgres:5432/vibespot
DATABASE_SYNC_URL=postgresql://vibespot:vibespot@postgres:5432/vibespot
LOCAL_DATABASE_URL=postgresql+asyncpg://vibespot:vibespot@localhost:38192/vibespot
LOCAL_DATABASE_SYNC_URL=postgresql://vibespot:vibespot@localhost:38192/vibespot

REDIS_URL=redis://redis:6379/0
LOCAL_REDIS_URL=redis://localhost:38193/0

S3_ENDPOINT_URL=http://minio:9000
LOCAL_S3_ENDPOINT_URL=http://localhost:38194
S3_ACCESS_KEY_ID=vibespot
S3_SECRET_ACCESS_KEY=vibespot-local-secret
S3_BUCKET=vibespot-local
S3_REGION=local

OPENAI_API_KEY=
GOOGLE_MAPS_BROWSER_KEY=
EXPO_PUBLIC_API_BASE_URL=http://localhost:38191
EXPO_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=
```

- [x] **Step 4: Add root `.gitignore`**

Create `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
__pycache__/
.pytest_cache/
.ruff_cache/
.mypy_cache/
.venv/
node_modules/
.expo/
dist/
build/
.DS_Store
*.log
```

- [x] **Step 5: Verify skeleton**

Run:

```powershell
Get-ChildItem -Recurse -Depth 2
```

Expected: the root folders and environment files exist.

---

### Task 2: Docker Compose Infrastructure

**Files:**
- Create: `docker-compose.yml`
- Create: `infra/docker/postgres/init/001-extensions.sql`
- Create: `infra/docker/minio/create-bucket.sh`

**Interfaces:**
- Consumes: `.env.example` variable names from Task 1.
- Produces: local Postgres/PostGIS/pgvector, Redis, and MinIO services on ports `38192` to `38195`.

- [x] **Step 1: Add Postgres extension init script**

Create `infra/docker/postgres/init/001-extensions.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
```

- [x] **Step 2: Add Docker Compose**

Create `docker-compose.yml`:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    container_name: vibespot-postgres
    environment:
      POSTGRES_DB: vibespot
      POSTGRES_USER: vibespot
      POSTGRES_PASSWORD: vibespot
    ports:
      - "38192:5432"
    volumes:
      - vibespot_postgres_data:/var/lib/postgresql/data
      - ./infra/docker/postgres/init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U vibespot -d vibespot"]
      interval: 5s
      timeout: 5s
      retries: 20

  redis:
    image: redis:7-alpine
    container_name: vibespot-redis
    ports:
      - "38193:6379"
    volumes:
      - vibespot_redis_data:/data
    command: ["redis-server", "--appendonly", "yes"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 20

  minio:
    image: minio/minio:latest
    container_name: vibespot-minio
    environment:
      MINIO_ROOT_USER: vibespot
      MINIO_ROOT_PASSWORD: vibespot-local-secret
    ports:
      - "38194:9000"
      - "38195:9001"
    volumes:
      - vibespot_minio_data:/data
    command: ["server", "/data", "--console-address", ":9001"]
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 5s
      timeout: 5s
      retries: 20

volumes:
  vibespot_postgres_data:
  vibespot_redis_data:
  vibespot_minio_data:
```

- [x] **Step 3: Verify Docker infra starts**

Run:

```powershell
docker compose up -d postgres redis minio
```

Expected: all three containers become healthy.

- [x] **Step 4: Verify ports**

Run:

```powershell
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"
```

Expected: `vibespot-postgres`, `vibespot-redis`, and `vibespot-minio` are running on ports `38192-38195`.

---

### Task 3: FastAPI Backend Skeleton

**Files:**
- Create: `services/api/pyproject.toml`
- Create: `services/api/Dockerfile`
- Create: `services/api/app/main.py`
- Create: `services/api/app/core/config.py`
- Create: `services/api/tests/test_health.py`

**Interfaces:**
- Produces: `GET /health` returning `{"status":"ok","service":"vibespot-api"}`.

- [x] **Step 1: Add backend dependencies**

Create `services/api/pyproject.toml`:

```toml
[project]
name = "vibespot-api"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi>=0.115.0",
  "uvicorn[standard]>=0.30.0",
  "pydantic-settings>=2.4.0",
  "sqlalchemy[asyncio]>=2.0.0",
  "asyncpg>=0.29.0",
  "psycopg[binary]>=3.2.0",
  "geoalchemy2>=0.15.0",
  "alembic>=1.13.0",
  "dramatiq[redis]>=1.17.0",
  "redis>=5.0.0",
  "boto3>=1.34.0",
  "openai>=1.40.0",
]

[project.optional-dependencies]
dev = [
  "pytest>=8.0.0",
  "httpx>=0.27.0",
  "pytest-asyncio>=0.23.0",
  "ruff>=0.5.0",
]

[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
```

- [x] **Step 2: Add backend Dockerfile**

Create `services/api/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN pip install --upgrade pip

COPY pyproject.toml ./
RUN pip install -e ".[dev]"

COPY app ./app
COPY tests ./tests

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [x] **Step 3: Add config**

Create `services/api/app/core/config.py`:

```python
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    database_url: str = "postgresql+asyncpg://vibespot:vibespot@localhost:38192/vibespot"
    redis_url: str = "redis://localhost:38193/0"
    s3_endpoint_url: str = "http://localhost:38194"
    s3_bucket: str = "vibespot-local"
    openai_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
```

- [x] **Step 4: Add FastAPI app**

Create `services/api/app/main.py`:

```python
from fastapi import FastAPI

app = FastAPI(title="VibeSpot API", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "vibespot-api"}
```

- [x] **Step 5: Add health test**

Create `services/api/tests/test_health.py`:

```python
from fastapi.testclient import TestClient

from app.main import app


def test_health_returns_ok() -> None:
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "vibespot-api"}
```

- [x] **Step 6: Run backend test**

Run:

```powershell
cd services/api
python -m pip install -e ".[dev]"
pytest -q
```

Expected: `1 passed`.

---

### Task 4: Wire API Container Into Docker Compose

**Files:**
- Modify: `docker-compose.yml`

**Interfaces:**
- Consumes: backend from Task 3.
- Produces: local API at `http://localhost:38191/health`.

- [x] **Step 1: Add API service to Compose**

Add to `docker-compose.yml`:

```yaml
  api:
    build:
      context: ./services/api
    container_name: vibespot-api
    environment:
      APP_ENV: local
      DATABASE_URL: postgresql+asyncpg://vibespot:vibespot@postgres:5432/vibespot
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT_URL: http://minio:9000
      S3_BUCKET: vibespot-local
      OPENAI_API_KEY: ${OPENAI_API_KEY:-}
    ports:
      - "38191:8000"
    volumes:
      - ./services/api/app:/app/app
      - ./services/api/tests:/app/tests
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
```

- [x] **Step 2: Start API**

Run:

```powershell
docker compose up -d --build api
```

Expected: `vibespot-api` starts.

- [x] **Step 3: Curl health endpoint**

Run:

```powershell
curl.exe http://localhost:38191/health
```

Expected:

```json
{"status":"ok","service":"vibespot-api"}
```

---

### Task 5: Database Models, Migrations, And Seed Data

**Files:**
- Create: `services/api/alembic.ini`
- Create: `services/api/app/db/session.py`
- Create: `services/api/app/db/base.py`
- Create: `services/api/app/db/models.py`
- Create: `services/api/app/db/migrations/env.py`
- Create: `services/api/app/db/migrations/versions/0001_initial.py`
- Create: `services/api/app/scripts/seed.py`
- Create: `services/api/tests/test_seed_data.py`

**Interfaces:**
- Produces tables: `users`, `places`, `vibe_checks`, `place_summaries`.
- Produces seed command: `python -m app.scripts.seed`.

- [x] **Step 1: Define models**

Create SQLAlchemy models for users, places, vibe checks, and place summaries. Place locations use `Geography(geometry_type="POINT", srid=4326)`.

- [x] **Step 2: Add Alembic migration**

Create a migration that enables `postgis` and `vector`, then creates the MVP tables.

- [x] **Step 3: Add seed script**

Seed Bangalore/Koramangala with at least 12 cafes and 40 vibe checks. Use real-looking place names and coordinates around Koramangala.

- [x] **Step 4: Verify migrations**

Run:

```powershell
cd services/api
alembic upgrade head
```

Expected: migration succeeds.

- [x] **Step 5: Verify seed**

Run:

```powershell
python -m app.scripts.seed
```

Expected: prints `Seeded VibeSpot local data`.

---

### Task 6: Places API And Geospatial Query

**Files:**
- Create: `services/api/app/api/routes/places.py`
- Modify: `services/api/app/main.py`
- Create: `services/api/app/schemas/place.py`
- Create: `services/api/app/services/places_service.py`
- Create: `services/api/tests/test_places_api.py`

**Interfaces:**
- Produces: `GET /places/nearby?lat=12.9352&lng=77.6245&radius_m=2000`.

- [x] **Step 1: Write API test**

Test that `/places/nearby` returns seeded cafes ordered by distance.

- [x] **Step 2: Implement service**

Use `ST_DWithin` and `ST_Distance` to fetch nearby places.

- [x] **Step 3: Implement route**

Return JSON cards with `id`, `name`, `neighborhood`, `distance_m`, `tags`, and `match_percent`.

- [x] **Step 4: Verify with curl**

Run:

```powershell
curl.exe "http://localhost:38191/places/nearby?lat=12.9352&lng=77.6245&radius_m=2000"
```

Expected: a JSON array of seeded cafes.

---

### Task 7: Expo Mobile Shell

**Files:**
- Create: `apps/mobile/package.json`
- Create: `apps/mobile/app.json`
- Create: `apps/mobile/tsconfig.json`
- Create: `apps/mobile/src/App.tsx`
- Create: `apps/mobile/src/theme/tokens.ts`
- Create: `apps/mobile/src/components/AppShell.tsx`

**Interfaces:**
- Produces: Expo app running on a non-standard port if web is used.

- [x] **Step 1: Create Expo app dependencies**

Use Expo with TypeScript, React Navigation or Expo Router, Reanimated, and Google Maps support.

- [x] **Step 2: Add premium theme tokens**

Create a calm Kinetic Noir theme:

```ts
export const colors = {
  background: "#0F1014",
  surface: "#181A20",
  surfaceHigh: "#242730",
  text: "#F2F1EA",
  muted: "#A8AD9A",
  lime: "#BDF44A",
  coral: "#FF9A7A",
};
```

- [x] **Step 3: Add app shell**

Create a first screen with VibeSpot title, map placeholder, search pill, bottom nav, and premium spacing.

- [x] **Step 4: Run app**

Run:

```powershell
cd apps/mobile
npm install
npx expo start --port 38201
```

Expected: Expo starts without using common ports.

---

### Task 8: Connect Mobile App To Backend

**Files:**
- Create: `apps/mobile/src/api/client.ts`
- Create: `apps/mobile/src/screens/MapHomeScreen.tsx`
- Modify: `apps/mobile/src/App.tsx`

**Interfaces:**
- Consumes: `GET /places/nearby` from Task 6.
- Produces: mobile home screen showing seeded places from the backend.

- [x] **Step 1: Add API client**

Implement:

```ts
export async function getNearbyPlaces() {
  const response = await fetch(`${API_BASE_URL}/places/nearby?lat=12.9352&lng=77.6245&radius_m=2500`);
  if (!response.ok) throw new Error("Failed to load nearby places");
  return response.json();
}
```

- [x] **Step 2: Render nearby places**

Show cards using backend data. Keep the map placeholder until native Google Maps is configured.

- [x] **Step 3: Verify in Expo**

Run the backend and mobile app, then confirm seeded cafes appear in the UI.

---

### Task 9: Google Maps Integration Spike

**Files:**
- Modify: `apps/mobile/app.json`
- Create: `apps/mobile/src/components/VibeMap.tsx`
- Modify: `apps/mobile/src/screens/MapHomeScreen.tsx`

**Interfaces:**
- Consumes: `EXPO_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` or native Google Maps config.
- Produces: map view with seeded cafe pins.

- [x] **Step 1: Add env key shape**

Use:

```txt
EXPO_PUBLIC_GOOGLE_MAPS_BROWSER_KEY=
```

Do not commit a real key.

- [x] **Step 2: Add map component**

Use `react-native-maps` for native preview or Google Maps JS only if running Expo web.

- [x] **Step 3: Render pins**

Use backend `lat/lng` data to render markers.

- [x] **Step 4: Verify**

Run on Expo Go or Android emulator and confirm that the map renders and pins are visible.

---

### Task 10: Premium UX Pass

**Files:**
- Modify: `apps/mobile/src/theme/tokens.ts`
- Modify: `apps/mobile/src/screens/MapHomeScreen.tsx`
- Create: `apps/mobile/src/components/SearchPill.tsx`
- Create: `apps/mobile/src/components/PlacePreviewCard.tsx`
- Create: `apps/mobile/src/components/BottomNav.tsx`

**Interfaces:**
- Produces: a polished first-screen experience matching the product direction.

- [x] **Step 1: Extract UI components**

Create focused components for search, place preview cards, and bottom navigation.

- [x] **Step 2: Add motion**

Use Reanimated for press states and bottom-sheet/card transitions.

- [x] **Step 3: Visual check**

Open the app in Expo web and Android emulator. Confirm:

- no overlapping text
- bottom nav is reachable
- map area feels primary
- colors feel premium, not toy-like
- motion is smooth

---

## Self-Review

Spec coverage:

- Local Docker infra is covered in Tasks 2 and 4.
- FastAPI backend is covered in Tasks 3 through 6.
- Postgres/PostGIS/pgvector is covered in Tasks 2 and 5.
- Redis is covered in Task 2 and reserved for jobs.
- Expo mobile shell is covered in Tasks 7 through 10.
- Google Maps is covered in Task 9.
- Lovable mockup usage as reference-only is covered in global constraints.

Placeholder scan:

- This plan intentionally defers cloud deployment because the user asked for local first.
- No production credentials are embedded.
- No default agent workflow is introduced.

Type consistency:

- Backend exposes `/health` and `/places/nearby`.
- Mobile consumes `/places/nearby`.
- Port assignments match `docs/architecture/01-local-docker-infra.md`.
