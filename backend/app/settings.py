from functools import lru_cache
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings

# Force-load backend/.env regardless of uvicorn reload working directory.
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)


class Settings(BaseSettings):
    # API / CORS
    frontend_origin: Optional[AnyHttpUrl] = Field(
        default=None, description="Allowed frontend origin for CORS"
    )

    # Models
    model_name: str = Field(default="mimo-v2-flash", description="Primary model name")
    fallback_model_name: str = Field(
        default="allenai/molmo-2-8b",
        description="Fallback model if primary fails",
    )
    model_api_base: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for model provider (OpenRouter-compatible)",
    )

    # Auth
    mimo_api_key: Optional[str] = Field(
        default=None, description="API key for Xiaomi MiMo-V2-Flash / OpenRouter"
    )
    openrouter_api_key: Optional[str] = Field(
        default=None, description="Optional OpenRouter API key (fallback)"
    )

    # Runtime
    request_timeout_seconds: int = Field(default=30, description="HTTP request timeout")
    max_retries: int = Field(default=3, description="Schema validation retries")

    class Config:
        # IMPORTANT: absolute path so it works on Windows + uvicorn reload.
        env_file = str(ENV_PATH)
        env_prefix = ""
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    settings = Settings()
    # Safe env diagnostics (do NOT log full keys)
    import logging

    logger = logging.getLogger("settings")
    key = settings.openrouter_api_key or settings.mimo_api_key
    logger.info(
        "settings_loaded",
        extra={
            "OPENROUTER_API_KEY_present": bool(settings.openrouter_api_key),
            "MIMO_API_KEY_present": bool(settings.mimo_api_key),
            "key_prefix": (key[:6] if key else None),
            "MODEL_API_BASE": settings.model_api_base,
            "MODEL_NAME": settings.model_name,
            "FALLBACK_MODEL_NAME": settings.fallback_model_name,
            "REQUEST_TIMEOUT_SECONDS": settings.request_timeout_seconds,
            "MAX_RETRIES": settings.max_retries,
            "ENV_PATH": str(ENV_PATH),
        },
    )
    return settings
