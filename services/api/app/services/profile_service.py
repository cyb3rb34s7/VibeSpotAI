from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import AuthUser
from app.schemas.profile import MyProfile, ProfileStats, RecentDrop, TasteTag


async def get_my_profile(session: AsyncSession, user: AuthUser) -> MyProfile:
    stats_result = await session.execute(
        text(
            """
            SELECT
                COUNT(*)::integer AS vibe_checks_count,
                COUNT(DISTINCT place_id)::integer AS places_contributed_count
            FROM vibe_checks
            WHERE user_id = :user_id
            """
        ),
        {"user_id": user.id},
    )
    stats_row = stats_result.mappings().one()

    tags_result = await session.execute(
        text(
            """
            SELECT best_use_case AS label, COUNT(*)::integer AS count
            FROM vibe_checks
            WHERE user_id = :user_id
            GROUP BY best_use_case
            ORDER BY COUNT(*) DESC, best_use_case ASC
            LIMIT 6
            """
        ),
        {"user_id": user.id},
    )

    recent_result = await session.execute(
        text(
            """
            SELECT
                places.name AS place_name,
                places.slug AS place_slug,
                vibe_checks.short_note,
                vibe_checks.best_use_case,
                vibe_checks.submitted_at::text AS submitted_at
            FROM vibe_checks
            JOIN places ON places.id = vibe_checks.place_id
            WHERE vibe_checks.user_id = :user_id
            ORDER BY vibe_checks.submitted_at DESC
            LIMIT 5
            """
        ),
        {"user_id": user.id},
    )

    return MyProfile(
        user=user,
        stats=ProfileStats(**dict(stats_row)),
        taste_tags=[TasteTag(**dict(row._mapping)) for row in tags_result],
        recent_drops=[RecentDrop(**dict(row._mapping)) for row in recent_result],
    )
