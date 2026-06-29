import base64
from dataclasses import dataclass

from fastapi import Header
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import AuthUser

LOCAL_TOKEN_PREFIX = "local-dev."


@dataclass(frozen=True)
class AuthFailure:
    message: str = "Authentication required"


def create_local_dev_token(handle: str) -> str:
    encoded = base64.urlsafe_b64encode(handle.encode("utf-8")).decode("ascii").rstrip("=")
    return f"{LOCAL_TOKEN_PREFIX}{encoded}"


def read_local_dev_token(token: str) -> str | None:
    if not token.startswith(LOCAL_TOKEN_PREFIX):
        return None

    encoded = token.removeprefix(LOCAL_TOKEN_PREFIX)
    padding = "=" * (-len(encoded) % 4)
    try:
        return base64.urlsafe_b64decode(f"{encoded}{padding}").decode("utf-8")
    except (UnicodeDecodeError, ValueError):
        return None


async def get_user_by_handle(session: AsyncSession, handle: str) -> AuthUser | None:
    result = await session.execute(
        text(
            """
            SELECT id::text, handle, display_name, home_city
            FROM users
            WHERE handle = :handle
            """
        ),
        {"handle": handle},
    )
    row = result.mappings().one_or_none()
    if row is None:
        return None

    return AuthUser(**dict(row))


def get_bearer_token(authorization: str | None) -> str | None:
    if authorization is None:
        return None

    prefix = "Bearer "
    if not authorization.startswith(prefix):
        return None

    token = authorization.removeprefix(prefix).strip()
    return token or None


async def resolve_current_user(
    session: AsyncSession,
    authorization: str | None,
) -> AuthUser | AuthFailure:
    token = get_bearer_token(authorization)
    if token is None:
        return AuthFailure()

    handle = read_local_dev_token(token)
    if handle is None:
        return AuthFailure("Invalid local session")

    user = await get_user_by_handle(session=session, handle=handle)
    if user is None:
        return AuthFailure("Session user no longer exists")

    return user


async def read_authorization_header(authorization: str | None = Header(default=None)) -> str | None:
    return authorization
