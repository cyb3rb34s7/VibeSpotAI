from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import ok
from app.core.response import error_response
from app.db.session import get_session
from app.schemas.place import VibeCheckCreate
from app.services.places_service import create_vibe_check, get_nearby_places, get_place_detail

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


@router.get("/{slug}")
async def place_detail(
    request: Request,
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    place = await get_place_detail(session=session, slug=slug)
    if place is None:
        return error_response(
            request,
            status_code=404,
            code="not_found",
            message="Place not found",
            details={"slug": slug},
        )

    return ok(request, place.model_dump(mode="json"))


@router.post("/{slug}/vibe-checks", status_code=201)
async def submit_vibe_check(
    request: Request,
    payload: VibeCheckCreate,
    slug: str,
    session: AsyncSession = Depends(get_session),
) -> dict:
    vibe_check = await create_vibe_check(session=session, slug=slug, payload=payload)
    if vibe_check is None:
        return error_response(
            request,
            status_code=404,
            code="not_found",
            message="Place not found",
            details={"slug": slug},
        )

    return ok(request, vibe_check.model_dump(mode="json"))
