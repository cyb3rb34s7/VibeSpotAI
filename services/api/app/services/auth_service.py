import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

from fastapi import Header
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.schemas.auth import AuthStartResponse, AuthUser

OTP_TTL_SECONDS = 10 * 60
SESSION_TTL_DAYS = 30


@dataclass(frozen=True)
class AuthFailure:
    code: str = "unauthorized"
    message: str = "Authentication required"


def hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def normalize_email(email: str) -> str:
    return email.strip().lower()


def generate_otp() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def generate_session_token() -> str:
    return secrets.token_urlsafe(32)


async def get_user_by_email(session: AsyncSession, email: str) -> AuthUser | None:
    result = await session.execute(
        text(
            """
            SELECT id::text, handle, email, display_name, home_city
            FROM users
            WHERE lower(email) = :email
            """
        ),
        {"email": normalize_email(email)},
    )
    row = result.mappings().one_or_none()
    if row is None:
        return None

    return AuthUser(**dict(row))


async def get_user_by_id(session: AsyncSession, user_id: str) -> AuthUser | None:
    result = await session.execute(
        text(
            """
            SELECT id::text, handle, email, display_name, home_city
            FROM users
            WHERE id = :user_id
            """
        ),
        {"user_id": user_id},
    )
    row = result.mappings().one_or_none()
    if row is None:
        return None

    return AuthUser(**dict(row))


async def start_otp(session: AsyncSession, email: str) -> AuthStartResponse | AuthFailure:
    normalized_email = normalize_email(email)
    user = await get_user_by_email(session=session, email=normalized_email)
    if user is None:
        return AuthFailure(code="not_found", message="User not found")

    otp_code = generate_otp()
    expires_at = datetime.now(UTC) + timedelta(seconds=OTP_TTL_SECONDS)
    await session.execute(
        text(
            """
            INSERT INTO auth_otp_challenges (user_id, email, otp_hash, expires_at)
            VALUES (:user_id, :email, :otp_hash, :expires_at)
            """
        ),
        {
            "user_id": user.id,
            "email": normalized_email,
            "otp_hash": hash_secret(otp_code),
            "expires_at": expires_at,
        },
    )
    await session.commit()

    return AuthStartResponse(
        delivery="local_response" if settings.app_env == "local" else "email",
        expires_in_seconds=OTP_TTL_SECONDS,
        otp_code=otp_code if settings.app_env == "local" else None,
    )


async def verify_otp(
    session: AsyncSession,
    *,
    email: str,
    otp_code: str,
) -> tuple[str, AuthUser] | AuthFailure:
    normalized_email = normalize_email(email)
    result = await session.execute(
        text(
            """
            SELECT
                auth_otp_challenges.id::text,
                auth_otp_challenges.user_id::text
            FROM auth_otp_challenges
            WHERE lower(auth_otp_challenges.email) = :email
                AND auth_otp_challenges.otp_hash = :otp_hash
                AND auth_otp_challenges.consumed_at IS NULL
                AND auth_otp_challenges.expires_at > now()
            ORDER BY auth_otp_challenges.created_at DESC
            LIMIT 1
            """
        ),
        {"email": normalized_email, "otp_hash": hash_secret(otp_code)},
    )
    challenge = result.mappings().one_or_none()
    if challenge is None:
        return AuthFailure(code="invalid_otp", message="Invalid or expired OTP")

    user = await get_user_by_id(session=session, user_id=challenge["user_id"])
    if user is None:
        return AuthFailure(code="unauthorized", message="Session user no longer exists")

    token = generate_session_token()
    await session.execute(
        text("UPDATE auth_otp_challenges SET consumed_at = now() WHERE id = :challenge_id"),
        {"challenge_id": challenge["id"]},
    )
    await session.execute(
        text(
            """
            INSERT INTO auth_sessions (user_id, token_hash, expires_at)
            VALUES (:user_id, :token_hash, :expires_at)
            """
        ),
        {
            "user_id": user.id,
            "token_hash": hash_secret(token),
            "expires_at": datetime.now(UTC) + timedelta(days=SESSION_TTL_DAYS),
        },
    )
    await session.commit()

    return token, user


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

    result = await session.execute(
        text(
            """
            SELECT user_id::text
            FROM auth_sessions
            WHERE token_hash = :token_hash
                AND revoked_at IS NULL
                AND expires_at > now()
            LIMIT 1
            """
        ),
        {"token_hash": hash_secret(token)},
    )
    session_row = result.mappings().one_or_none()
    if session_row is None:
        return AuthFailure("unauthorized", "Invalid or expired session")

    user = await get_user_by_id(session=session, user_id=session_row["user_id"])
    if user is None:
        return AuthFailure("unauthorized", "Session user no longer exists")

    return user


async def revoke_session(session: AsyncSession, authorization: str | None) -> bool:
    token = get_bearer_token(authorization)
    if token is None:
        return False

    result = await session.execute(
        text(
            """
            UPDATE auth_sessions
            SET revoked_at = now()
            WHERE token_hash = :token_hash
                AND revoked_at IS NULL
            RETURNING id
            """
        ),
        {"token_hash": hash_secret(token)},
    )
    revoked = result.mappings().one_or_none() is not None
    await session.commit()
    return revoked


async def read_authorization_header(authorization: str | None = Header(default=None)) -> str | None:
    return authorization
