from pydantic import BaseModel, Field, field_validator


class AuthStartRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)

    @field_validator("email")
    @classmethod
    def email_must_look_valid(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address")
        return normalized


class AuthUser(BaseModel):
    id: str
    handle: str
    email: str
    display_name: str
    home_city: str


class AuthStartResponse(BaseModel):
    delivery: str
    expires_in_seconds: int = Field(gt=0)
    otp_code: str | None = None


class AuthVerifyRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    otp_code: str = Field(min_length=6, max_length=6)

    @field_validator("email")
    @classmethod
    def email_must_look_valid(cls, value: str) -> str:
        normalized = value.strip().lower()
        if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
            raise ValueError("Enter a valid email address")
        return normalized


class AuthSessionResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
