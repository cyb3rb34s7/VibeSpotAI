from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.place import (
    NearbyPlace,
    PlaceDetail,
    PlaceSignalSummary,
    RecentVibeCheck,
    SearchPlace,
    VibeCheckCreate,
    VibeCheckCreated,
)


async def get_nearby_places(
    session: AsyncSession,
    lat: float,
    lng: float,
    radius_m: int,
) -> list[NearbyPlace]:
    result = await session.execute(
        text(
            """
            WITH origin AS (
                SELECT ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography AS location
            )
            SELECT
                places.id::text AS id,
                places.name,
                places.slug,
                places.category,
                places.neighborhood,
                ST_Y(places.location::geometry) AS lat,
                ST_X(places.location::geometry) AS lng,
                ROUND(ST_Distance(places.location, origin.location))::integer AS distance_m,
                places.tags,
                LEAST(
                    99,
                    GREATEST(
                        72,
                        96 - (ROUND(ST_Distance(places.location, origin.location))::integer / 180)
                    )
                )::integer AS match_percent,
                place_summaries.summary_text AS summary,
                place_summaries.best_for,
                place_summaries.avoid_when,
                place_summaries.evidence_count
            FROM places
            CROSS JOIN origin
            LEFT JOIN place_summaries ON place_summaries.place_id = places.id
            WHERE ST_DWithin(places.location, origin.location, :radius_m)
            ORDER BY ST_Distance(places.location, origin.location) ASC, places.name ASC
            LIMIT 40
            """
        ),
        {"lat": lat, "lng": lng, "radius_m": radius_m},
    )

    return [NearbyPlace(**dict(row._mapping)) for row in result]


async def search_places(
    session: AsyncSession,
    *,
    query: str,
    lat: float,
    lng: float,
    radius_m: int,
) -> list[SearchPlace]:
    normalized_query = query.strip().lower()
    result = await session.execute(
        text(
            """
            WITH origin AS (
                SELECT ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography AS location
            ),
            candidates AS (
                SELECT
                    places.id,
                    places.name,
                    places.slug,
                    places.category,
                    places.neighborhood,
                    ST_Y(places.location::geometry) AS lat,
                    ST_X(places.location::geometry) AS lng,
                    ROUND(ST_Distance(places.location, origin.location))::integer AS distance_m,
                    places.tags,
                    place_summaries.summary_text AS summary,
                    place_summaries.best_for,
                    place_summaries.avoid_when,
                    place_summaries.evidence_count,
                    CASE
                        WHEN :query LIKE '%quiet%' AND (
                            places.tags::text ILIKE '%quiet%'
                            OR place_summaries.summary_text ILIKE '%quiet%'
                            OR place_summaries.best_for ILIKE '%silent%'
                        ) THEN 26
                        ELSE 0
                    END AS quiet_score,
                    CASE
                        WHEN (:query LIKE '%wifi%' OR :query LIKE '%wi-fi%') AND (
                            places.tags::text ILIKE '%wifi%'
                            OR place_summaries.summary_text ILIKE '%wifi%'
                            OR place_summaries.best_for ILIKE '%wifi%'
                        ) THEN 24
                        ELSE 0
                    END AS wifi_score,
                    CASE
                        WHEN (:query LIKE '%work%' OR :query LIKE '%focus%') AND (
                            places.tags::text ILIKE '%work%'
                            OR place_summaries.best_for ILIKE '%work%'
                            OR place_summaries.summary_text ILIKE '%work%'
                        ) THEN 20
                        ELSE 0
                    END AS work_score,
                    GREATEST(
                        0,
                        18 - (ROUND(ST_Distance(places.location, origin.location))::integer / 160)
                    )::integer AS distance_score
                FROM places
                CROSS JOIN origin
                LEFT JOIN place_summaries ON place_summaries.place_id = places.id
                WHERE ST_DWithin(places.location, origin.location, :radius_m)
            )
            SELECT
                id::text,
                name,
                slug,
                category,
                neighborhood,
                lat,
                lng,
                distance_m,
                tags,
                LEAST(
                    99,
                    GREATEST(72, 78 + quiet_score + wifi_score + work_score + distance_score)
                )::integer AS match_percent,
                summary,
                best_for,
                avoid_when,
                evidence_count,
                CASE
                    WHEN quiet_score + wifi_score + work_score > 0 THEN CONCAT(
                        'Matches ',
                        TRIM(BOTH ', ' FROM CONCAT(
                            CASE WHEN quiet_score > 0 THEN 'quiet, ' ELSE '' END,
                            CASE WHEN wifi_score > 0 THEN 'wifi, ' ELSE '' END,
                            CASE WHEN work_score > 0 THEN 'work, ' ELSE '' END
                        )),
                        ' intent near you.'
                    )
                    ELSE 'Nearby candidate with live local evidence.'
                END AS reason
            FROM candidates
            ORDER BY
                (quiet_score + wifi_score + work_score + distance_score) DESC,
                distance_m ASC,
                name ASC
            LIMIT 20
            """
        ),
        {"query": normalized_query, "lat": lat, "lng": lng, "radius_m": radius_m},
    )

    return [SearchPlace(**dict(row._mapping)) for row in result]


async def get_place_detail(session: AsyncSession, slug: str) -> PlaceDetail | None:
    place_result = await session.execute(
        text(
            """
            WITH target AS (
                SELECT
                    places.id,
                    places.name,
                    places.slug,
                    places.category,
                    places.address,
                    places.city,
                    places.neighborhood,
                    ST_Y(places.location::geometry) AS lat,
                    ST_X(places.location::geometry) AS lng,
                    places.tags,
                    place_summaries.summary_text AS summary,
                    place_summaries.best_for,
                    place_summaries.avoid_when,
                    place_summaries.evidence_count,
                    place_summaries.data_window,
                    place_summaries.confidence_score
                FROM places
                LEFT JOIN place_summaries ON place_summaries.place_id = places.id
                WHERE places.slug = :slug
            ),
            crowd_modes AS (
                SELECT crowd_level
                FROM vibe_checks
                WHERE place_id = (SELECT id FROM target)
                GROUP BY crowd_level
                ORDER BY COUNT(*) DESC, crowd_level ASC
                LIMIT 1
            ),
            recommend_modes AS (
                SELECT recommend_mode
                FROM vibe_checks
                WHERE place_id = (SELECT id FROM target)
                GROUP BY recommend_mode
                ORDER BY COUNT(*) DESC, recommend_mode ASC
                LIMIT 1
            ),
            score_summary AS (
                SELECT
                    ROUND(AVG(noise_score)::numeric, 1)::float AS avg_noise_score,
                    ROUND(AVG(wifi_score)::numeric, 1)::float AS avg_wifi_score
                FROM vibe_checks
                WHERE place_id = (SELECT id FROM target)
            )
            SELECT
                target.id::text AS id,
                target.name,
                target.slug,
                target.category,
                target.address,
                target.city,
                target.neighborhood,
                target.lat,
                target.lng,
                target.tags,
                target.summary,
                target.best_for,
                target.avoid_when,
                target.evidence_count,
                target.data_window,
                target.confidence_score,
                COALESCE(score_summary.avg_noise_score, 0)::float AS avg_noise_score,
                COALESCE(score_summary.avg_wifi_score, 0)::float AS avg_wifi_score,
                COALESCE((SELECT crowd_level FROM crowd_modes), 'unknown') AS top_crowd_level,
                COALESCE((SELECT recommend_mode FROM recommend_modes), 'unknown') AS top_recommend_mode
            FROM target
            CROSS JOIN score_summary
            """
        ),
        {"slug": slug},
    )
    place = place_result.mappings().one_or_none()
    if place is None:
        return None

    checks_result = await session.execute(
        text(
            """
            SELECT
                visit_intent,
                best_use_case,
                short_note,
                crowd_level,
                recommend_mode,
                submitted_at::text AS submitted_at
            FROM vibe_checks
            WHERE place_id = :place_id
            ORDER BY submitted_at DESC
            LIMIT 6
            """
        ),
        {"place_id": place["id"]},
    )

    return PlaceDetail(
        id=place["id"],
        name=place["name"],
        slug=place["slug"],
        category=place["category"],
        address=place["address"],
        city=place["city"],
        neighborhood=place["neighborhood"],
        lat=place["lat"],
        lng=place["lng"],
        tags=place["tags"],
        summary=place["summary"],
        best_for=place["best_for"],
        avoid_when=place["avoid_when"],
        evidence_count=place["evidence_count"],
        data_window=place["data_window"],
        confidence_score=place["confidence_score"],
        signals=PlaceSignalSummary(
            avg_noise_score=place["avg_noise_score"],
            avg_wifi_score=place["avg_wifi_score"],
            top_crowd_level=place["top_crowd_level"],
            top_recommend_mode=place["top_recommend_mode"],
        ),
        recent_vibe_checks=[
            RecentVibeCheck(**dict(row._mapping)) for row in checks_result
        ],
    )


async def create_vibe_check(
    session: AsyncSession,
    *,
    slug: str,
    payload: VibeCheckCreate,
    user_handle: str = "priya",
) -> VibeCheckCreated | None:
    result = await session.execute(
        text(
            """
            WITH target_place AS (
                SELECT id, slug FROM places WHERE slug = :slug
            ),
            selected_user AS (
                SELECT id, handle FROM users WHERE handle = :user_handle LIMIT 1
            ),
            inserted AS (
                INSERT INTO vibe_checks (
                    user_id,
                    place_id,
                    visit_intent,
                    noise_score,
                    wifi_score,
                    crowd_level,
                    best_use_case,
                    recommend_mode,
                    short_note,
                    location_confidence,
                    trust_weight,
                    raw_answers
                )
                SELECT
                    selected_user.id,
                    target_place.id,
                    :visit_intent,
                    :noise_score,
                    :wifi_score,
                    :crowd_level,
                    :best_use_case,
                    :recommend_mode,
                    :short_note,
                    :location_confidence,
                    :trust_weight,
                    CAST(:raw_answers AS jsonb)
                FROM target_place
                CROSS JOIN selected_user
                RETURNING
                    id::text,
                    place_id,
                    visit_intent,
                    noise_score,
                    wifi_score,
                    crowd_level,
                    best_use_case,
                    recommend_mode,
                    short_note,
                    location_confidence,
                    trust_weight,
                    submitted_at::text
            )
            SELECT
                inserted.id,
                target_place.slug AS place_slug,
                selected_user.handle AS created_by_handle,
                inserted.visit_intent,
                inserted.noise_score,
                inserted.wifi_score,
                inserted.crowd_level,
                inserted.best_use_case,
                inserted.recommend_mode,
                inserted.short_note,
                inserted.location_confidence,
                inserted.trust_weight,
                inserted.submitted_at
            FROM inserted
            JOIN target_place ON target_place.id = inserted.place_id
            JOIN selected_user ON true
            """
        ),
        {
            "slug": slug,
            "user_handle": user_handle,
            "visit_intent": payload.visit_intent,
            "noise_score": payload.noise_score,
            "wifi_score": payload.wifi_score,
            "crowd_level": payload.crowd_level,
            "best_use_case": payload.best_use_case,
            "recommend_mode": payload.recommend_mode,
            "short_note": payload.short_note,
            "location_confidence": payload.location_confidence,
            "trust_weight": round(payload.location_confidence, 2),
            "raw_answers": "{}",
        },
    )
    row = result.mappings().one_or_none()
    if row is None:
        return None

    await refresh_place_summary(session=session, slug=slug)
    await session.commit()
    return VibeCheckCreated(**dict(row))


async def refresh_place_summary(session: AsyncSession, slug: str) -> None:
    await session.execute(
        text(
            """
            WITH target_place AS (
                SELECT id, name
                FROM places
                WHERE slug = :slug
            ),
            stats AS (
                SELECT
                    COUNT(*)::integer AS evidence_count,
                    ROUND(AVG(trust_weight)::numeric, 2)::float AS avg_trust
                FROM vibe_checks
                WHERE place_id = (SELECT id FROM target_place)
            ),
            best_modes AS (
                SELECT best_use_case
                FROM vibe_checks
                WHERE place_id = (SELECT id FROM target_place)
                GROUP BY best_use_case
                ORDER BY COUNT(*) DESC, best_use_case ASC
                LIMIT 1
            )
            UPDATE place_summaries
            SET
                evidence_count = stats.evidence_count,
                best_for = COALESCE((SELECT best_use_case FROM best_modes), best_for),
                summary_text = CONCAT(
                    target_place.name,
                    ' is currently best understood as a ',
                    LOWER(COALESCE((SELECT best_use_case FROM best_modes), best_for)),
                    ' spot based on ',
                    stats.evidence_count,
                    ' local drops.'
                ),
                confidence_score = LEAST(0.95, GREATEST(0.50, stats.avg_trust)),
                generated_at = now()
            FROM target_place, stats
            WHERE place_summaries.place_id = target_place.id
            """
        ),
        {"slug": slug},
    )
