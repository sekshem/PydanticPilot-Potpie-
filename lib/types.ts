// Agent Run Request
export type OutputFormat = "plan" | "checklist" | "email" | "summary_actions";
export type Tone = "professional" | "friendly" | "strict";

export interface AgentRunRequest {
  goal: string;
  context?: string;
  outputFormat: OutputFormat;
  tone: Tone;
  constraints?: string[];
}

// Agent Run Response
export interface AgentSection {
  heading: string;
  content: string[];
}

export interface AgentRunResponse {
  runId: string;
  status: "success" | "error";
  title: string;
  summary: string;
  sections: AgentSection[];
  warnings?: string[];
  confidence?: number; // 0-1
  createdAt: string;
}

// Agent Error
export interface AgentError {
  message: string;
  code?: string;
}

// History Item (extends response with input data)
export interface HistoryItem extends AgentRunResponse {
  request: AgentRunRequest;
}

// Run Status Steps
export type RunStep = 
  | "validating"
  | "calling"
  | "generating"
  | "finalizing"
  | "complete"
  | "error";

export interface RunStatus {
  currentStep: RunStep;
  progress: number;
  error?: AgentError;
}
