import { NextResponse } from "next/server";
import type { AgentRunRequest } from "@/lib/types";

const BACKEND_API_BASE_URL = process.env.BACKEND_API_BASE_URL;

function validateRequest(body: unknown): body is AgentRunRequest {
  if (!body || typeof body !== "object") return false;
  const req = body as Record<string, unknown>;
  const validFormats = ["plan", "checklist", "email", "summary_actions"];
  const validTones = ["professional", "friendly", "strict"];

  if (typeof req.goal !== "string" || req.goal.trim().length === 0) return false;
  if (!validFormats.includes(req.outputFormat as string)) return false;
  if (!validTones.includes(req.tone as string)) return false;
  if (req.context !== undefined && typeof req.context !== "string") return false;
  if (req.constraints !== undefined) {
    if (!Array.isArray(req.constraints)) return false;
    if (!req.constraints.every((c) => typeof c === "string")) return false;
  }
  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON in request body", code: "INVALID_JSON" },
      { status: 400 }
    );
  }

  if (!validateRequest(body)) {
    return NextResponse.json(
      {
        message: "Invalid request format. Required: goal, outputFormat, tone.",
        code: "VALIDATION_ERROR",
      },
      { status: 400 }
    );
  }

  if (!BACKEND_API_BASE_URL) {
    return NextResponse.json(
      {
        message: "Backend is not configured. Set BACKEND_API_BASE_URL.",
        code: "BACKEND_NOT_CONFIGURED",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/agent/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Agent API proxy error:", error);
    return NextResponse.json(
      {
        message: "Failed to reach backend agent",
        code: "BACKEND_ERROR",
      },
      { status: 502 }
    );
  }
}
