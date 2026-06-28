# VibeSpot Technical Architecture

This folder captures the technical direction for the local-first VibeSpot build before implementation starts.

The current architecture is optimized for fast local iteration, clean backend ownership, and a later path to managed deployment when the product shape is proven.

## Documents

- [Architecture Decisions](./00-architecture-decisions.md)
- [Local Docker Infrastructure](./01-local-docker-infra.md)
- [Backend Design](./02-backend-design.md)
- [Data, Search, and AI](./03-data-search-ai.md)

## Current Stack Choice

- Mobile app: React Native with Expo and TypeScript
- Backend: FastAPI with Python
- Database: PostgreSQL with PostGIS and pgvector
- Cache and jobs: Redis
- Workers: Dramatiq backed by Redis
- Local object storage: MinIO, using the S3 API shape
- AI: OpenAI API through strict, testable LLM pipelines

## Guiding Principle

VibeSpot is a location intelligence product first. The backend should make place discovery, vibe checks, geospatial search, trust signals, and AI summaries easy to iterate on without turning the MVP into an infrastructure project.
