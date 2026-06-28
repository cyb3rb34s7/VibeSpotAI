from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.place import NearbyPlace


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
