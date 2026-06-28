# Data, Search, and AI

This document describes the first-pass data model, search architecture, and AI pipeline boundaries.

## Core Data Model

### Users

Stores app identity.

Important fields:

- id
- display name
- handle
- avatar object key
- home city
- created at

### Places

Stores cafes and local venues.

Important fields:

- id
- name
- slug
- category
- address
- city
- neighborhood
- location: PostGIS geography point
- external source references
- created at
- updated at

### Vibe Checks

The most important contribution object.

Important fields:

- id
- user id
- place id
- visit intent
- noise score
- wifi score
- crowd level
- best use case
- recommend mode
- short note
- visit timestamp
- submitted timestamp
- user latitude/longitude, optional
- location confidence
- trust weight
- raw answers JSONB

The `raw_answers` JSONB field gives the product room to evolve the vibe-check flow without destructive migrations for every field experiment.

### Place Summaries

Stores AI-generated living cards.

Important fields:

- place id
- summary text
- best for
- avoid when
- dominant tags
- evidence counts
- confidence score
- data window
- generated at
- model version

### Tags

Tags should be community-earned, not cafe-claimed.

Examples:

- laptop-friendly
- quiet weekday afternoons
- loud after 7pm
- strong wifi
- good first date
- window seats

### Reputation Events

Reputation should be event-sourced so it can be explained and recalculated.

Examples:

- vibe check submitted
- pioneer unlocked
- drop upvoted
- challenge upheld
- challenge rejected

### Badges

Badges should be derived from behavior.

MVP badges:

- Pioneer
- Streak
- Challenger, later
- Neighborhood contributor

## Geospatial Search

PostGIS should power:

- nearby search
- viewport pin loading
- distance sorting
- neighborhood containment
- location confidence for vibe checks

Example nearby logic:

```sql
WHERE ST_DWithin(places.location, :user_location, :radius_meters)
ORDER BY ST_Distance(places.location, :user_location)
```

## Semantic Search

pgvector should store embeddings for:

- place summaries
- vibe-check notes
- tag bundles

The first MVP can rank results with a hybrid score:

```txt
hybrid_score =
  location_score
  + intent_match_score
  + semantic_similarity_score
  + recency_score
  + trust_score
```

Keep the ranking formula explicit. Do not hide the whole ranking inside an LLM.

## Intent Search Pipeline

Intent search should be a pipeline, not an agent.

Flow:

```txt
User query
-> parse query into structured intent JSON
-> validate schema
-> apply geospatial and category filters
-> run vector/text search
-> rank candidates
-> return results with short reasons
```

Example structured intent:

```json
{
  "category": "cafe",
  "intent": "deep_work",
  "constraints": {
    "quiet": true,
    "wifi": "strong",
    "open_after": "21:00"
  },
  "location_hint": "Koramangala",
  "negative_preferences": ["Starbucks"]
}
```

## Place Summary Pipeline

Place summaries should be generated from bounded, recent evidence.

Flow:

```txt
New vibe check
-> enqueue summary refresh
-> fetch recent checks for place
-> aggregate structured fields
-> call LLM with strict JSON schema
-> validate output
-> store summary with evidence counts
```

The summary must expose freshness and evidence:

```txt
Based on 18 vibe checks from the last 30 days.
```

This is important for trust.

## Tag Extraction Pipeline

Tag extraction should convert short notes and structured answers into normalized tags.

Flow:

```txt
Vibe check submitted
-> extract candidate tags
-> normalize to known tag set
-> update tag evidence counts
-> award place tags only after threshold
```

Tags should have thresholds. A cafe should not get `strong wifi` because one person said it.

## Agents Policy

Agents are not part of the MVP default path.

Allowed later only if:

- The workflow needs multiple steps.
- The workflow needs tool use.
- The workflow must inspect conflicting evidence.
- A deterministic pipeline becomes too brittle.

Possible later agents:

- Trust investigation agent
- Baseline enrichment agent

Not agents:

- Place summary generation
- Tag extraction
- Embedding generation
- Simple intent parsing
- Ranking

## Trust And Verification

MVP trust signals:

- Recency decay
- Location confidence
- User reputation weight
- Consensus thresholds for tags
- Evidence counts on summaries

Later trust signals:

- Challenge flow
- Suspicious activity detection
- Cafe-owner conflict detection
- Text similarity and spam checks

## Data Freshness

Old vibe checks should matter less over time.

Suggested decay:

- Last 7 days: full weight
- 8 to 30 days: high weight
- 31 to 90 days: medium weight
- 90+ days: low weight unless data is sparse

The exact formula can evolve, but recency decay should be present from the beginning.
