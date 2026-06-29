from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import error_response, ok
from app.db.session import get_session
from app.services.auth_service import AuthFailure, read_authorization_header, resolve_current_user
from app.services.profile_service import get_my_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
async def profile_me(
    request: Request,
    authorization: str | None = Depends(read_authorization_header),
    session: AsyncSession = Depends(get_session),
) -> dict:
    user = await resolve_current_user(session=session, authorization=authorization)
    if isinstance(user, AuthFailure):
        return error_response(
            request,
            status_code=401,
            code="unauthorized",
            message=user.message,
        )

    profile = await get_my_profile(session=session, user=user)
    return ok(request, profile.model_dump(mode="json"))
