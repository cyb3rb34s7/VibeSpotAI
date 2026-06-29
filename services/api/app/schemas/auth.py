from pydantic import BaseModel, Field


class DevLoginRequest(BaseModel):
    handle: str = Field(min_length=2, max_length=40)


class AuthUser(BaseModel):
    id: str
    handle: str
    display_name: str
    home_city: str


class DevLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: AuthUser
