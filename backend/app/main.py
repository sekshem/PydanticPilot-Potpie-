from pathlib import Path

from dotenv import load_dotenv

# Force-load backend/.env regardless of uvicorn reload working directory.
ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=ENV_PATH, override=False)

import asyncio
import logging.config
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Tuple

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .agent import run_agent
from .logging_config import get_logging_config
from .schemas import AgentRunRequest, AgentRunResponse
from .settings import get_settings

# Logging setup
logging.config.dictConfig(get_logging_config())
logger = logging.getLogger("app")

settings = get_settings()

app = FastAPI(title="PydanticPilot Backend", version="1.0.0")

# CORS
base_origins = set()
if settings.frontend_origin:
  base_origins.add(str(settings.frontend_origin).rstrip("/"))
base_origins.add("http://localhost:3000")
base_origins.add("http://127.0.0.1:3000")
origins = list(base_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Simple in-memory rate limiting: (ip -> (window_start_ts, count))
RATE_LIMIT_WINDOW_SEC = 60
RATE_LIMIT_MAX = 120
_rate_limit_state: Dict[str, Tuple[float, int]] = {}


@app.on_event("startup")
async def startup_event():
    # Readiness logs (no secrets)
    key = settings.openrouter_api_key or settings.mimo_api_key
    logger.info("PydanticPilot backend started")
    logger.info("OpenRouter configured: %s", bool(key))
    logger.info("MODEL_API_BASE: %s", settings.model_api_base)
    logger.info("MODEL_NAME: %s", settings.model_name)
    logger.info("FALLBACK_MODEL_NAME: %s", settings.fallback_model_name)
    logger.info("Docs: /docs")
    logger.info("Health: /health")


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response: Response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.middleware("http")
async def rate_limit(request: Request, call_next):
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start, count = _rate_limit_state.get(client_ip, (now, 0))
    if now - window_start >= RATE_LIMIT_WINDOW_SEC:
        window_start, count = now, 0
    count += 1
    _rate_limit_state[client_ip] = (window_start, count)
    if count > RATE_LIMIT_MAX:
        return JSONResponse(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            content={"detail": "Rate limit exceeded"},
        )
    return await call_next(request)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/debug/env")
async def debug_env():
    key = settings.openrouter_api_key or settings.mimo_api_key
    return {
        "openrouter_key_present": bool(settings.openrouter_api_key),
        "openrouter_key_prefix": (
            settings.openrouter_api_key[:6] if settings.openrouter_api_key else None
        ),
        "mimo_key_present": bool(settings.mimo_api_key),
        "mimo_key_prefix": (settings.mimo_api_key[:6] if settings.mimo_api_key else None),
        "model_api_base": settings.model_api_base,
        "model_name": settings.model_name,
        "fallback_model_name": settings.fallback_model_name,
        "frontend_origin": str(settings.frontend_origin)
        if settings.frontend_origin
        else None,
        "timeout_seconds": settings.request_timeout_seconds,
        "max_retries": settings.max_retries,
        "env_path_used": str(ENV_PATH),
        "auth_key_prefix_effective": (key[:6] if key else None),
    }


@app.post("/agent/run", response_model=AgentRunResponse)
async def agent_run(request: AgentRunRequest, http_request: Request):
    run_id = str(uuid.uuid4())
    logger.info(
        "agent_request_received",
        extra={
          "run_id": run_id,
          "client": http_request.client.host if http_request.client else "unknown",
          "outputFormat": request.outputFormat,
          "tone": request.tone,
        },
    )
    try:
        result = await asyncio.wait_for(
            run_agent(request),
            timeout=settings.request_timeout_seconds + 5,
        )
        # Ensure runId is set to the server-generated ID (even if model produced its own)
        result.runId = uuid.UUID(str(result.runId)) if result.runId else uuid.UUID(run_id)
        return result
    except asyncio.TimeoutError:
        logger.error("agent_timeout", extra={"run_id": run_id})
        raise HTTPException(
            status_code=504,
            detail="Agent request timed out",
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.error("agent_unhandled_error", exc_info=True, extra={"run_id": run_id})
        return AgentRunResponse(
            runId=uuid.UUID(run_id),
            status="error",
            title="Agent failed",
            summary="The agent encountered an unexpected error.",
            sections=[],
            warnings=[str(exc)],
            confidence=0.0,
            createdAt=datetime.now(timezone.utc).isoformat(),
        )
