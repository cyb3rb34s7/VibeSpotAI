import asyncio

import dramatiq

from app.db.session import AsyncSessionLocal
from app.jobs.broker import redis_broker  # noqa: F401
from app.services.places_service import refresh_place_summary


@dramatiq.actor(queue_name="summary")
def refresh_place_summary_job(slug: str) -> None:
    asyncio.run(_refresh_place_summary(slug))


def enqueue_summary_refresh(slug: str) -> None:
    refresh_place_summary_job.send(slug)


async def _refresh_place_summary(slug: str) -> None:
    async with AsyncSessionLocal() as session:
        await refresh_place_summary(session=session, slug=slug)
        await session.commit()
