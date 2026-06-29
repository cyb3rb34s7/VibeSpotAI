from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.response import error_response, ok
from app.db.session import get_session
from app.schemas.auth import AuthSessionResponse, AuthStartRequest, AuthVerifyRequest
from app.services.auth_service import (
    AuthFailure,
    read_authorization_header,
    resolve_current_user,
    revoke_session,
    start_otp,
    verify_otp,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/start")
async def auth_start(
    request: Request,
    payload: AuthStartRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    result = await start_otp(session=session, email=str(payload.email))
    if isinstance(result, AuthFailure):
        return error_response(
            request,
            status_code=404 if result.code == "not_found" else 401,
            code=result.code,
            message=result.message,
        )

    return ok(request, result.model_dump(mode="json"))


@router.post("/verify")
async def auth_verify(
    request: Request,
    payload: AuthVerifyRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    result = await verify_otp(
        session=session,
        email=str(payload.email),
        otp_code=payload.otp_code,
    )
    if isinstance(result, AuthFailure):
        return error_response(
            request,
            status_code=401,
            code=result.code,
            message=result.message,
        )

    token, user = result
    return ok(
        request,
        AuthSessionResponse(access_token=token, user=user).model_dump(mode="json"),
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
            code=user.code,
            message=user.message,
        )

    return ok(request, user.model_dump(mode="json"))


@router.post("/logout")
async def auth_logout(
    request: Request,
    authorization: str | None = Depends(read_authorization_header),
    session: AsyncSession = Depends(get_session),
) -> dict:
    revoked = await revoke_session(session=session, authorization=authorization)
    if not revoked:
        return error_response(
            request,
            status_code=401,
            code="unauthorized",
            message="Invalid or expired session",
        )

    return ok(request, {"revoked": True})
