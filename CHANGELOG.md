# Changelog

Newest entries first. Every implementation commit should add a dated entry explaining what changed and why.

## 2026-06-29 - Add interactive map place cards

**What changed:** Replaced cryptic marker initials with meaningful compact map labels like `Fresh`, `Cold Brew`, and match percentages, added tappable fallback-map markers, and introduced an Airbnb-style floating place card with name, distance, match, reason, and a `View vibe` CTA that opens the existing detail sheet.
**Why:** Map pins should be useful and premium, not decorative noise; tapping a marker should reveal enough context in-map before the user opens the full place detail.
**Files touched:** `apps/mobile/src/components/MapPreview.tsx`, `apps/mobile/src/components/VibeMap.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Refine home header and map pins

**What changed:** Removed the top-right home profile bubble that collided visually with the Expo dev overlay during local QA, and redesigned the fallback map pins from large green circular blobs into compact glass score tags with subtle anchor points.
**Why:** The previous home screen still felt too toy-like and visually noisy for the premium iOS direction.
**Files touched:** `apps/mobile/src/screens/MapHomeScreen.tsx`, `apps/mobile/src/components/MapPreview.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Fix bottom nav native layout

**What changed:** Added an explicit `containerStyle` to `PressScale` and moved bottom-nav flex distribution onto the outer pressable shell while keeping the animated visual pill inside.
**Why:** Native screenshots showed the bottom navigation items clamped to the left because layout styles were applied only to the animated child, not the touch/layout wrapper.
**Files touched:** `apps/mobile/src/components/PressScale.tsx`, `apps/mobile/src/components/BottomNav.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add native-feel motion and haptics

**What changed:** Added `expo-haptics`, a shared haptic intent helper, haptic-aware press interactions, tab fade/slide transitions, backend-confirmed submit success feedback, a premium affinity proof card in the detail sheet, semantic close controls for the modal, and a stronger Google Maps failure fallback that keeps the stylized VibeSpot map visible until Google is proven healthy.
**Why:** The previous polish pass established the psychological UI layer; this pass makes the app feel more tactile, native, and resilient under local Google Maps key failures.
**Files touched:** `apps/mobile/package.json`, `apps/mobile/package-lock.json`, `apps/mobile/src/utils/haptics.ts`, `apps/mobile/src/components/*`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Reinstall mobile dependencies after reverting package metadata.

## 2026-06-29 - Add premium psychology UI pass

**What changed:** Added fresh-drop reveal mechanics, animated live pins with avatar social proof, a compact unlock moment, social-proof place cards, a docked animated bottom nav with pending/streak indicators, profile streak/taste/city-progress systems, locked achievements, a waveform crowd control, polished auth copy, and tab scroll reset behavior.
**Why:** The mobile MVP needs to feel closer to the intended iOS-like product direction, with behavioral psychology visible in the UI instead of a plain CRUD-style prototype.
**Files touched:** `apps/mobile/src/components/AuthPanel.tsx`, `apps/mobile/src/components/BottomNav.tsx`, `apps/mobile/src/components/FreshDropsPeek.tsx`, `apps/mobile/src/components/MapPreview.tsx`, `apps/mobile/src/components/PlaceDetailSheet.tsx`, `apps/mobile/src/components/PlacePreviewCard.tsx`, `apps/mobile/src/components/ProfilePanel.tsx`, `apps/mobile/src/components/SearchPill.tsx`, `apps/mobile/src/components/VibeMap.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `apps/mobile/src/theme/tokens.ts`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. This is a mobile UI-only slice; backend data written during manual browser submit remains in the local database until reseeded.

## 2026-06-29 - Replace dev auth with OTP sessions

**What changed:** Replaced `/auth/dev-login` and stateless `local-dev.*` tokens with `/auth/start`, `/auth/verify`, `/auth/logout`, hashed OTP challenges, hashed bearer sessions, authenticated-only vibe-check submission, mobile sign-in UI, and updated smoke/API docs.
**Why:** The product should exercise a real auth/session boundary locally instead of relying on mock identity.
**Files touched:** `services/api/app/db/migrations/versions/0002_auth_sessions.py`, `services/api/app/api/routes/auth.py`, `services/api/app/api/routes/places.py`, `services/api/app/schemas/auth.py`, `services/api/app/services/auth_service.py`, `services/api/app/services/places_service.py`, `services/api/app/scripts/seed.py`, `services/api/tests/*`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/*`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `scripts/smoke-local.ps1`, `README.md`, `docs/api-examples.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** code reverts cleanly; local databases migrated to `0002_auth_sessions` need downgrade/reset if reverting.

## 2026-06-29 - Add deterministic intent search

**What changed:** Added `GET /places/search`, explicit keyword-plus-distance ranking with match reasons, backend tests, mobile search input wiring, reason display on cards, and smoke/API docs.
**Why:** The MVP promise is intent-led discovery; the search pill should rank places for queries like quiet wifi without introducing an LLM or agent yet.
**Files touched:** `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/tests/test_places_api.py`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/SearchPill.tsx`, `apps/mobile/src/components/PlacePreviewCard.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `scripts/smoke-local.ps1`, `README.md`, `docs/api-examples.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add local auth and profile loop

**What changed:** Added local dev login, bearer current-user lookup, `/profiles/me`, authenticated vibe-check ownership, mobile in-memory session bootstrapping, a real Profile tab, and smoke/API docs for the new flow.
**Why:** The MVP needs identity and contribution feedback without committing to OTP/provider infrastructure before the local product loop is accepted.
**Files touched:** `services/api/app/api/routes/*`, `services/api/app/schemas/*`, `services/api/app/services/*`, `services/api/tests/test_auth_profile_api.py`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/*`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `scripts/smoke-local.ps1`, `README.md`, `docs/api-examples.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Existing seeded data remains; local dev tokens are stateless and expire only when the implementation changes.

## 2026-06-29 - Add local smoke script

**What changed:** Added `scripts/smoke-local.ps1` to verify Docker containers, API success/error envelopes, seeded nearby/detail data, and optional Expo web/Android bundles.
**Why:** Local development and deployment testing needs a repeatable one-command smoke path instead of hand-running curl and bundle checks.
**Files touched:** `scripts/smoke-local.ps1`, `README.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Mark local MVP foundation plan complete

**What changed:** Updated the local MVP foundation implementation plan checklist to reflect the completed Docker, FastAPI, database, worker, Expo web, and Android smoke work.
**Why:** The tracked implementation plan should match the actual project state before new product slices begin.
**Files touched:** `docs/superpowers/plans/2026-06-29-vibespot-local-mvp-foundation.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Polish Android safe-area layout

**What changed:** Added `react-native-safe-area-context`, wrapped the app in a safe-area provider, moved bottom navigation into the screen safe area, tightened home spacing, shortened preview cards, and added keyboard-aware padding to the place detail submission sheet.
**Why:** Native Android smoke testing showed the deprecated built-in safe area warning and bottom navigation crowding/overlapping content on the emulator.
**Files touched:** `apps/mobile/App.tsx`, `apps/mobile/package.json`, `apps/mobile/package-lock.json`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `apps/mobile/src/components/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Reinstall mobile dependencies after reverting package metadata.

## 2026-06-29 - Add local runbook and API examples

**What changed:** Expanded the README with local run/test commands and added API examples for health, nearby places, place detail, and vibe-check submission.
**Why:** The local MVP should be easy to run and verify from a fresh clone.
**Files touched:** `README.md`, `docs/api-examples.md`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add Dramatiq worker groundwork

**What changed:** Added Redis-backed Dramatiq broker setup, a summary refresh actor, an enqueue boundary test, and a `worker` Docker Compose service.
**Why:** The MVP needs a background job path ready for summary refreshes, tag extraction, embeddings, and future profile work without turning every request into a long-running process.
**Files touched:** `docker-compose.yml`, `services/api/app/jobs/*`, `services/api/tests/test_summary_jobs.py`, `docs/architecture/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Stop/remove `vibespot-worker` if reverting while it is running.

## 2026-06-29 - Refresh summaries after vibe checks

**What changed:** Added deterministic summary refresh after vibe-check submission and tightened tests so evidence counts update and cleanup restores local seed state.
**Why:** Place details should reflect newly submitted local signals immediately without needing an LLM or background worker.
**Files touched:** `services/api/app/services/places_service.py`, `services/api/tests/test_places_api.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Normalize API error envelopes

**What changed:** Added trace-aware handlers for HTTP errors and request validation errors.
**Why:** Mobile and future clients should receive one predictable envelope shape for both success and failure.
**Files touched:** `services/api/app/main.py`, `services/api/app/core/response.py`, `services/api/tests/test_error_envelopes.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add vibe-check submission loop

**What changed:** Added `POST /places/{slug}/vibe-checks`, request/response schemas, local demo-user insertion, API tests, mobile submission client, and an in-sheet signal form.
**Why:** VibeSpot needs a contribution loop so the app can collect fresh local signals, not only display seeded recommendations.
**Files touched:** `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/tests/test_places_api.py`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/PlaceDetailSheet.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** mostly. Code reverts cleanly; any manually submitted local vibe checks remain in the database until deleted or reseeded.

## 2026-06-29 - Add place detail loop

**What changed:** Added `GET /places/{slug}` with summary, signals, and recent vibe checks; added a mobile place detail bottom sheet opened from nearby place cards.
**Why:** The map-first home screen needs a real inspection flow so users can understand why a place is recommended before contributing or visiting.
**Files touched:** `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/app/core/response.py`, `services/api/app/db/session.py`, `services/api/tests/test_places_api.py`, `apps/mobile/src/api/client.ts`, `apps/mobile/src/components/*`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add Expo-safe premium press states

**What changed:** Added a reusable animated `PressScale` wrapper, replaced fragile text glyph icons with Expo vector icons, and tightened the search, place card, and bottom nav interaction states.
**Why:** The mobile shell needs premium-feeling touch feedback without relying on glyph rendering or dependencies that break Metro bundling.
**Files touched:** `apps/mobile/package.json`, `apps/mobile/package-lock.json`, `apps/mobile/src/components/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes. Reinstall mobile dependencies after reverting package metadata.

## 2026-06-29 - Add Google Maps web fallback

**What changed:** Added a `VibeMap` component that tries Google Maps on web when an env key is present and falls back to the stylized local map if Google reports a load error.
**Why:** Local iteration should continue even when Google Cloud key restrictions or API enablement are not fully configured yet.
**Files touched:** `apps/mobile/src/components/VibeMap.tsx`, `apps/mobile/src/screens/MapHomeScreen.tsx`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add Expo mobile shell

**What changed:** Added Expo TypeScript app, premium VibeSpot home screen, theme tokens, backend API client, map preview, place cards, search pill, and bottom navigation.
**Why:** The project needs a local mobile-first surface that can iterate visually while consuming the FastAPI backend.
**Files touched:** `apps/mobile/*`, `services/api/app/main.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** partially. Code reverts cleanly; installed npm packages are local artifacts and can be restored with `npm install`.

## 2026-06-29 - Allow Expo web API calls

**What changed:** Added CORS middleware for local Expo web origins.
**Why:** The browser app on port `38201` could not fetch the FastAPI backend on port `38191` without CORS headers.
**Files touched:** `services/api/app/main.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add nearby places API

**What changed:** Added trace-aware response envelopes, `/places/nearby`, nearby place schemas, and a PostGIS-backed service query.
**Why:** The mobile map home needs a real local endpoint that returns seeded cafes ordered by distance.
**Files touched:** `services/api/app/main.py`, `services/api/app/api/routes/places.py`, `services/api/app/services/places_service.py`, `services/api/app/schemas/place.py`, `services/api/app/core/response.py`, `services/api/app/core/trace.py`, `services/api/tests/*`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Add database schema and seed data

**What changed:** Added Alembic setup, initial Postgres/PostGIS schema, SQLAlchemy models, and a seed script with Koramangala cafe data.
**Why:** The MVP needs real local data to test map-first discovery and nearby place queries.
**Files touched:** `services/api/alembic.ini`, `services/api/app/db/*`, `services/api/app/scripts/seed.py`, `services/api/Dockerfile`, `infra/docker/postgres/init/001-extensions.sql`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** partially. Code reverts cleanly; local database tables/data remain until Docker volumes are reset or a downgrade/reset is run.

## 2026-06-29 - Normalize seed database connection

**What changed:** Seed script now converts SQLAlchemy's psycopg URL into a direct psycopg connection URL.
**Why:** `psycopg.connect()` does not accept `postgresql+psycopg://` connection strings.
**Files touched:** `services/api/app/scripts/seed.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Fix Alembic sync driver

**What changed:** Updated sync database URLs to use `postgresql+psycopg://`.
**Why:** Alembic selected psycopg2 for plain `postgresql://` URLs, but the backend uses psycopg v3.
**Files touched:** `.env.example`, `docker-compose.yml`, `services/api/app/core/config.py`, `context.md`, `CHANGELOG.md`.
**Reverts cleanly?:** yes.

## 2026-06-29 - Project process and local foundation

**What changed:** Added project process docs, architecture docs, local Docker infrastructure, FastAPI health endpoint, and initial implementation plan.
**Why:** User requested end-to-end local development with clean code conventions, persistent context, dated changelog entries, small commits, and local Docker services for FastAPI/Postgres/PostGIS/pgvector/Redis/MinIO.
**Files touched:** `AGENTS.md`, `context.md`, `docs/conventions.md`, `docs/architecture/*`, `docs/superpowers/plans/2026-06-29-vibespot-local-mvp-foundation.md`, `docker-compose.yml`, `infra/docker/*`, `services/api/*`, `README.md`, `.env.example`.
**Reverts cleanly?:** partially. Docs revert cleanly; Docker volumes created by local verification are outside Git and need `docker compose down -v` if a full local reset is intended.
