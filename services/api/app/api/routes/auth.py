from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import error_response, ok
from app.db.session import get_session
from app.schemas.auth import DevLoginRequest, DevLoginResponse
from app.services.auth_service import (
    AuthFailure,
    create_local_dev_token,
    get_user_by_handle,
    read_authorization_header,
    resolve_current_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/dev-login")
async def dev_login(
    request: Request,
    payload: DevLoginRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    user = await get_user_by_handle(session=session, handle=payload.handle)
    if user is None:
        return error_response(
            request,
            status_code=404,
            code="not_found",
            message="User not found",
            details={"handle": payload.handle},
        )

    token = create_local_dev_token(user.handle)
    return ok(
        request,
        DevLoginResponse(access_token=token, user=user).model_dump(mode="json"),
    )


@router.get("/me")
async def auth_me(
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

    return ok(request, user.model_dump(mode="json"))
