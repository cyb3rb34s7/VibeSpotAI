from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import ok
from app.db.session import get_session
from app.services.places_service import get_nearby_places

router = APIRouter(prefix="/places", tags=["places"])


@router.get("/nearby")
async def nearby_places(
    request: Request,
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    radius_m: int = Query(2500, ge=100, le=10000),
    session: AsyncSession = Depends(get_session),
) -> dict:
    places = await get_nearby_places(session=session, lat=lat, lng=lng, radius_m=radius_m)
    return ok(request, [place.model_dump(mode="json") for place in places])
