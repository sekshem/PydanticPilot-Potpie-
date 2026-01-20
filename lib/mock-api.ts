import type {
  AgentRunRequest,
  AgentRunResponse,
  HistoryItem,
} from "./types";

// Local storage keys
const HISTORY_KEY = "pydantic_pilot_history";

// History management functions
export function getHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveToHistory(
  request: AgentRunRequest,
  response: AgentRunResponse
): void {
  const history = getHistory();
  const item: HistoryItem = {
    ...response,
    request,
  };
  history.unshift(item);
  // Keep only last 50 items
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
}

export function deleteFromHistory(runId: string): void {
  const history = getHistory();
  const filtered = history.filter((item) => item.runId !== runId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

// Export functions
export function exportAsMarkdown(response: AgentRunResponse): string {
  let md = `# ${response.title}\n\n`;
  md += `${response.summary}\n\n`;

  for (const section of response.sections) {
    md += `## ${section.heading}\n\n`;
    for (const item of section.content) {
      md += `- ${item}\n`;
    }
    md += "\n";
  }

  if (response.warnings?.length) {
    md += `## Warnings\n\n`;
    for (const warning of response.warnings) {
      md += `> ${warning}\n`;
    }
  }

  return md;
}

export function exportAsJson(response: AgentRunResponse): string {
  return JSON.stringify(response, null, 2);
}
