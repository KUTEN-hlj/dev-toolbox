from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "mysql+pymysql://toolbox:toolbox123@localhost:3306/dev_toolbox"
    redis_url: str = "redis://localhost:6379/0"
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440  # 24 小时

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
