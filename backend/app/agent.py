import json
import logging
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple

import httpx
from pydantic import ValidationError

from .schemas import AgentRunRequest, AgentRunResponse
from .settings import get_settings

logger = logging.getLogger("agent")

SYSTEM_PROMPT = """
You are PydanticPilot, a productivity AI agent. Always return actionable, concise, structured output as JSON matching the provided schema.
- Honor the requested outputFormat and tone exactly.
- Keep content clear, bullet-like sentences. Avoid verbosity.
- Never return markdown code fences.
- Provide helpful warnings if constraints limit the plan.
""".strip()


def _build_messages(req: AgentRunRequest) -> List[Dict[str, str]]:
    constraints_text = (
        "\nConstraints: " + ", ".join(req.constraints) if req.constraints else ""
    )
    context_text = f"\nContext: {req.context}" if req.context else ""
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                f"Goal: {req.goal}\n"
                f"OutputFormat: {req.outputFormat}\n"
                f"Tone: {req.tone}"
                f"{context_text}"
                f"{constraints_text}"
            ),
        },
    ]


async def _call_model(
    client: httpx.AsyncClient,
    model: str,
    messages: List[Dict[str, str]],
    timeout: int,
    api_key: str,
    api_base: str,
    run_id: uuid.UUID,
) -> Dict:
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        # OpenRouter recommended headers
        "HTTP-Referer": str(settings.frontend_origin or "http://localhost:3000"),
        "X-Title": "PydanticPilot",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.3,
        "response_format": {"type": "json_object"},
    }
    logger.info("request_model", extra={"run_id": str(run_id), "model": model})
    response = await client.post(
        f"{api_base}/chat/completions",
        json=payload,
        headers=headers,
        timeout=timeout,
    )
    response.raise_for_status()
    return response.json()


def _parse_model_content(content: str) -> AgentRunResponse:
    data = json.loads(content)
    return AgentRunResponse.model_validate(data)

def _normalize_to_agent_response(
    *,
    req: AgentRunRequest,
    run_id: uuid.UUID,
    model_name: str,
    raw_content: str,
) -> AgentRunResponse:
    """
    Normalize arbitrary model output into a valid AgentRunResponse.

    - If JSON matches AgentRunResponse, return it (with server-issued runId).
    - If JSON contains a "plan" key, convert into sections.
    - If output is plain text or unknown JSON shape, wrap into a single section.
    """
    created_at = datetime.now(timezone.utc).isoformat()

    # Try JSON first
    parsed_json: Optional[dict] = None
    try:
        parsed = json.loads(raw_content)
        if isinstance(parsed, dict):
            parsed_json = parsed
    except Exception:
        parsed_json = None

    # 1) Already conforms (best case)
    if parsed_json is not None:
        try:
            out = AgentRunResponse.model_validate(parsed_json)
            out.runId = run_id
            if not out.createdAt:
                out.createdAt = created_at
            if out.status not in ("success", "error"):
                out.status = "success"
            return out
        except ValidationError:
            # fall through to normalization
            pass

    # 2) "plan" shape
    if parsed_json is not None and "plan" in parsed_json:
        plan_val = parsed_json.get("plan")
        items: List[str] = []
        if isinstance(plan_val, list):
            for i, item in enumerate(plan_val):
                if isinstance(item, str):
                    items.append(item.strip())
                elif isinstance(item, dict):
                    # Try common keys
                    for k in ("day", "title", "task", "tasks", "content"):
                        if k in item and isinstance(item[k], str):
                            items.append(item[k].strip())
                            break
                    else:
                        items.append(json.dumps(item))
                else:
                    items.append(str(item))
        else:
            items = [str(plan_val)]

        # Add "Day N" prefix if it looks like a 7-day plan but items aren't labeled
        content: List[str] = []
        for idx, text in enumerate([t for t in items if t], start=1):
            if text.lower().startswith("day "):
                content.append(text)
            else:
                content.append(f"Day {idx}: {text}")

        summary = content[0] if content else "Generated a plan based on your goal."
        return AgentRunResponse(
            runId=run_id,
            status="success",
            title="Generated Plan",
            summary=summary[:240],
            sections=[{"heading": "7-Day Plan", "content": content}],
            warnings=[],
            confidence=0.7,
            createdAt=created_at,
        )

    # 3) Plain text / unknown JSON shape
    text = raw_content.strip()
    if parsed_json is not None and not text:
        text = json.dumps(parsed_json)

    if not text:
        text = "No content returned by the model."

    return AgentRunResponse(
        runId=run_id,
        status="success",
        title="Agent Result",
        summary=text.splitlines()[0][:240],
        sections=[{"heading": "Result", "content": [text]}],
        warnings=[f"Normalized non-conforming output from model: {model_name}"],
        confidence=0.7,
        createdAt=created_at,
    )


async def run_agent(req: AgentRunRequest) -> AgentRunResponse:
    settings = get_settings()
    run_id = uuid.uuid4()
    messages = _build_messages(req)

    # Prefer OpenRouter key if present; fall back to MIMO key.
    api_key = settings.openrouter_api_key or settings.mimo_api_key
    if not api_key:
        raise RuntimeError("Model API key not configured")

    logger.info(
        "agent_config",
        extra={
            "run_id": str(run_id),
            "MODEL_API_BASE": settings.model_api_base,
            "MODEL_NAME": settings.model_name,
            "FALLBACK_MODEL_NAME": settings.fallback_model_name,
            "OPENROUTER_API_KEY_present": bool(settings.openrouter_api_key),
            "MIMO_API_KEY_present": bool(settings.mimo_api_key),
            "key_prefix": api_key[:6],
        },
    )

    async with httpx.AsyncClient() as client:
        attempts: List[Tuple[str, int]] = [
            (settings.model_name, settings.max_retries),
            (settings.fallback_model_name, 1),
        ]

        last_error: Optional[str] = None

        for model_name, max_retries in attempts:
            for attempt in range(1, max_retries + 1):
                try:
                    raw = await _call_model(
                        client=client,
                        model=model_name,
                        messages=messages,
                        timeout=settings.request_timeout_seconds,
                        api_key=api_key,
                        api_base=settings.model_api_base,
                        run_id=run_id,
                    )
                    content = (
                        raw.get("choices", [{}])[0]
                        .get("message", {})
                        .get("content", "")
                    )
                    parsed = _normalize_to_agent_response(
                        req=req,
                        run_id=run_id,
                        model_name=model_name,
                        raw_content=content,
                    )
                    logger.info(
                        "agent_success",
                        extra={
                            "run_id": str(run_id),
                            "model": model_name,
                            "attempt": attempt,
                        },
                    )
                    return parsed
                except (ValidationError, json.JSONDecodeError) as ve:
                    last_error = f"Validation failed on model {model_name}: {ve}"
                    logger.warning(
                        "agent_validation_retry",
                        extra={
                            "run_id": str(run_id),
                            "model": model_name,
                            "attempt": attempt,
                            "error": str(ve),
                        },
                    )
                    if attempt >= max_retries:
                        break
                    continue
                except Exception as e:  # noqa: BLE001
                    last_error = f"Model call failed for {model_name}: {e}"
                    logger.error(
                        "agent_call_error",
                        exc_info=True,
                        extra={
                            "run_id": str(run_id),
                            "model": model_name,
                            "attempt": attempt,
                        },
                    )
                    if attempt >= max_retries:
                        break
                    continue

    # Fallback error response
    logger.error(
        "agent_failed",
        extra={
            "run_id": str(run_id),
            "error": last_error or "Unknown error",
        },
    )
    return AgentRunResponse(
        runId=run_id,
        status="error",
        title="Agent failed",
        summary="The agent could not produce a valid structured response.",
        sections=[],
        warnings=[last_error or "Unknown error"],
        confidence=0.0,
        createdAt=datetime.now(timezone.utc).isoformat(),
    )
