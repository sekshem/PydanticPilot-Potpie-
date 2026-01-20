import type { AgentRunRequest, AgentRunResponse, RunStatus } from "@/lib/types";
import { simulateMockAgentRun } from "./mockAgent";

// Check if we should use mock mode
const USE_MOCK_AGENT = process.env.NEXT_PUBLIC_USE_MOCK_AGENT === "true";
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_BASE = RAW_API_BASE.replace(/\/$/, "");

// Lightweight debug helper (browser only)
function debugLog(...args: unknown[]) {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[PydanticPilot/api]", ...args);
  }
}

// API error class for typed error handling
export class AgentApiError extends Error {
  code: string;
  statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = "AgentApiError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// Default timeout for API requests (30 seconds)
const DEFAULT_TIMEOUT_MS = 30000;

/**
 * Run the AI agent with the given request.
 * Supports both mock mode (for UI testing) and real backend calls.
 *
 * @param request - The agent run request parameters
 * @param onProgress - Optional callback for progress updates (mock mode only)
 * @param signal - Optional AbortSignal for cancellation
 * @returns Promise<AgentRunResponse>
 */
export async function runAgent(
  request: AgentRunRequest,
  onProgress?: (status: RunStatus) => void,
  signal?: AbortSignal
): Promise<AgentRunResponse> {
  debugLog("runAgent called", {
    useMock: USE_MOCK_AGENT,
    apiBase: API_BASE || "/api (Next.js route)",
  });

  // Use mock mode if enabled
  if (USE_MOCK_AGENT) {
    debugLog("Using mock agent");
    if (!onProgress) {
      // Provide a no-op progress callback if none provided
      onProgress = () => {};
    }
    return simulateMockAgentRun(request, onProgress, signal);
  }

  // Real API call
  return callAgentApi(request, signal);
}

/**
 * Call the real backend API endpoint.
 *
 * @param request - The agent run request
 * @param externalSignal - Optional external abort signal
 * @returns Promise<AgentRunResponse>
 */
async function callAgentApi(
  request: AgentRunRequest,
  externalSignal?: AbortSignal
): Promise<AgentRunResponse> {
  // Create timeout abort controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, DEFAULT_TIMEOUT_MS);

  // Combine external signal with timeout signal
  const combinedSignal = externalSignal
    ? combineAbortSignals(externalSignal, timeoutController.signal)
    : timeoutController.signal;

  try {
    const endpoint = API_BASE
      ? `${API_BASE}/agent/run`
      : "/api/agent/run";

    debugLog("Calling backend", { endpoint, request });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: combinedSignal,
    });

    clearTimeout(timeoutId);

    // Handle non-200 responses
    if (!response.ok) {
      let errorMessage = "An error occurred while running the agent";
      let errorCode = "API_ERROR";

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code || errorCode;
      } catch {
        // JSON parsing failed, use default error message
      }

      throw new AgentApiError(errorMessage, errorCode, response.status);
    }

    // Parse response
    let data: AgentRunResponse;
    try {
      data = await response.json();
    } catch {
      throw new AgentApiError(
        "Failed to parse response from agent",
        "PARSE_ERROR"
      );
    }

    // Validate response shape
    if (!data.runId || !data.status) {
      throw new AgentApiError(
        "Invalid response format from agent",
        "INVALID_RESPONSE"
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    debugLog("runAgent fetch error", error);

    // Handle abort errors
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        if (externalSignal?.aborted) {
          throw new AgentApiError("Agent run was cancelled", "CANCELLED");
        }
        throw new AgentApiError(
          "Request timed out. Please try again.",
          "TIMEOUT"
        );
      }

      // Network / CORS / DNS style errors surface as TypeError("Failed to fetch")
      if (error.name === "TypeError") {
        throw new AgentApiError(
          `Failed to reach agent backend. Check that NEXT_PUBLIC_API_BASE_URL (${RAW_API_BASE ||
            "unset"}) is correct, the backend is running, and CORS allows this origin.`,
          "NETWORK_ERROR"
        );
      }
    }

    // Re-throw AgentApiError as-is
    if (error instanceof AgentApiError) {
      throw error;
    }

    // Wrap other errors
    throw new AgentApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      "UNKNOWN_ERROR"
    );
  }
}

/**
 * Combine multiple abort signals into one.
 * The combined signal will abort when any of the input signals abort.
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  return controller.signal;
}
