"use client";

import { CheckCircle2, Circle, Loader2, XCircle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { RunStatus, RunStep } from "@/lib/types";

const STEPS: { key: RunStep; label: string }[] = [
  { key: "validating", label: "Validating input" },
  { key: "calling", label: "Calling agent" },
  { key: "generating", label: "Generating structured output" },
  { key: "finalizing", label: "Finalizing response" },
];

interface AgentRunStatusProps {
  status: RunStatus;
  onCancel: () => void;
}

export function AgentRunStatus({ status, onCancel }: AgentRunStatusProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === status.currentStep);
  const isError = status.currentStep === "error";
  const isComplete = status.currentStep === "complete";

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">
            {isError
              ? "Error occurred"
              : isComplete
              ? "Complete"
              : "Processing..."}
          </span>
          <span className="text-muted-foreground">
            {Math.round(status.progress)}%
          </span>
        </div>
        <Progress
          value={status.progress}
          className={`h-2 ${isError ? "[&>div]:bg-destructive" : ""}`}
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {STEPS.map((step, index) => {
          const isActive = step.key === status.currentStep;
          const isDone = !isError && (isComplete || index < currentIndex);
          const isFailed = isError && index === currentIndex;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 text-sm transition-opacity ${
                isDone || isActive
                  ? "opacity-100"
                  : "opacity-40"
              }`}
            >
              {isFailed ? (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
              ) : isDone ? (
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
              ) : isActive ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span
                className={
                  isFailed
                    ? "text-destructive"
                    : isDone
                    ? "text-foreground"
                    : isActive
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {isError && status.error && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{status.error.message}</p>
        </div>
      )}

      {/* Cancel Button */}
      {!isComplete && !isError && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="w-full gap-2 rounded-xl bg-transparent"
        >
          <Square className="h-4 w-4" />
          Cancel
        </Button>
      )}
    </div>
  );
}
