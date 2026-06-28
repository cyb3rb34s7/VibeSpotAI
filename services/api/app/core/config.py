from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "local"
    database_url: str = "postgresql+asyncpg://vibespot:vibespot@localhost:38192/vibespot"
    database_sync_url: str = "postgresql://vibespot:vibespot@localhost:38192/vibespot"
    redis_url: str = "redis://localhost:38193/0"
    s3_endpoint_url: str = "http://localhost:38194"
    s3_bucket: str = "vibespot-local"
    openai_api_key: str = ""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
