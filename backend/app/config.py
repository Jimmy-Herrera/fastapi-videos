from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440
    AWS_REGION: str = "us-east-1"
    S3_VIDEOS_BUCKET: str
    S3_THUMBNAILS_BUCKET: str
    CORS_ORIGINS: str = "http://localhost:5173"
    MAX_VIDEO_MB: int = 100


settings = Settings()
