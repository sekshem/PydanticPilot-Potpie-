"use client";

import { useState, useCallback, useRef } from "react";
import { Sparkles, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/app-shell";
import { AgentInputForm } from "@/components/agent-input-form";
import { AgentRunStatus } from "@/components/agent-run-status";
import { AgentOutputViewer } from "@/components/agent-output-viewer";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { OutputSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { runAgent } from "@/lib/api/agent";
import { saveToHistory } from "@/lib/mock-api";
import type {
  AgentRunRequest,
  AgentRunResponse,
  RunStatus,
} from "@/lib/types";

const TIPS = [
  "Be specific about your goal for better results",
  "Add context to help the agent understand your situation",
  "Try different output formats for different use cases",
  "Save outputs to history for future reference",
  "Use constraints to narrow down the scope",
];

export default function WorkspacePage() {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<RunStatus | null>(null);
  const [output, setOutput] = useState<AgentRunResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<AgentRunRequest | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(async (request: AgentRunRequest) => {
    // Cancel any existing run
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this run
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsRunning(true);
    setRunStatus({ currentStep: "validating", progress: 0 });
    setOutput(null);
    setError(null);
    setLastRequest(request);
    setIsSaved(false);

    try {
      const result = await runAgent(
        request,
        (status) => {
          if (!abortController.signal.aborted) {
            setRunStatus(status);
          }
        },
        abortController.signal
      );

      if (!abortController.signal.aborted) {
        setOutput(result);
        setRunStatus(null);
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setRunStatus(null);
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsRunning(false);
      }
    }
  }, []);

  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    setRunStatus(null);
    toast({
      title: "Run cancelled",
      description: "The agent run was cancelled.",
    });
  }, [toast]);

  const handleSave = useCallback(() => {
    if (output && lastRequest) {
      saveToHistory(lastRequest, output);
      setIsSaved(true);
    }
  }, [output, lastRequest]);

  const handleRunAgain = useCallback(() => {
    if (lastRequest) {
      handleSubmit(lastRequest);
    }
  }, [lastRequest, handleSubmit]);

  const handleRetry = useCallback(() => {
    if (lastRequest) {
      handleSubmit(lastRequest);
    }
  }, [lastRequest, handleSubmit]);

  const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Workspace</h1>
          <p className="text-muted-foreground">
            Define your goal and let the agent generate structured outputs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-5">
            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Agent Input
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AgentInputForm
                  onSubmit={handleSubmit}
                  isRunning={isRunning}
                  initialData={lastRequest || undefined}
                />
              </CardContent>
            </Card>

            {/* Tips Card - Desktop Only */}
            <Card className="rounded-2xl border-border mt-6 hidden lg:block">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary flex-shrink-0">
                    <Lightbulb className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Tip
                    </p>
                    <p className="text-sm text-muted-foreground">{randomTip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-7">
            <Card className="rounded-2xl border-border min-h-[400px]">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Output</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Running State */}
                {isRunning && runStatus && (
                  <AgentRunStatus status={runStatus} onCancel={handleCancel} />
                )}

                {/* Loading Skeleton (if running but no status yet) */}
                {isRunning && !runStatus && <OutputSkeleton />}

                {/* Error State */}
                {!isRunning && error && (
                  <ErrorState message={error} onRetry={handleRetry} />
                )}

                {/* Output State */}
                {!isRunning && !error && output && (
                  <AgentOutputViewer
                    output={output}
                    onSave={handleSave}
                    onRunAgain={handleRunAgain}
                    isSaved={isSaved}
                  />
                )}

                {/* Empty State */}
                {!isRunning && !error && !output && (
                  <EmptyState
                    icon={Sparkles}
                    title="No output yet"
                    description="Enter your goal and run the agent to generate structured outputs."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
