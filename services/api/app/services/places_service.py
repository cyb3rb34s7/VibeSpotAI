from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.place import PlaceDetail, PlaceSignalSummary, RecentVibeCheck, NearbyPlace


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
