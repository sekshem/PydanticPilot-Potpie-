"use client";

import React from "react"

import { useState, useCallback } from "react";
import { Play, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { AgentRunRequest, OutputFormat, Tone } from "@/lib/types";

const OUTPUT_FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "plan", label: "Plan" },
  { value: "checklist", label: "Checklist" },
  { value: "email", label: "Email Draft" },
  { value: "summary_actions", label: "Summary + Actions" },
];

const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "strict", label: "Strict" },
];

const CONSTRAINT_OPTIONS = [
  "Time-bound",
  "Budget-limited",
  "Beginner-friendly",
  "Technical",
  "High-priority",
];

interface AgentInputFormProps {
  onSubmit: (request: AgentRunRequest) => void;
  isRunning: boolean;
  initialData?: Partial<AgentRunRequest>;
}

const MAX_GOAL_LENGTH = 500;
const MAX_CONTEXT_LENGTH = 2000;

export function AgentInputForm({
  onSubmit,
  isRunning,
  initialData,
}: AgentInputFormProps) {
  const [goal, setGoal] = useState(initialData?.goal || "");
  const [context, setContext] = useState(initialData?.context || "");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>(
    initialData?.outputFormat || "plan"
  );
  const [tone, setTone] = useState<Tone>(initialData?.tone || "professional");
  const [constraints, setConstraints] = useState<string[]>(
    initialData?.constraints || []
  );
  const [errors, setErrors] = useState<{ goal?: string }>({});

  const validate = useCallback(() => {
    const newErrors: { goal?: string } = {};
    if (!goal.trim()) {
      newErrors.goal = "Goal is required";
    } else if (goal.length > MAX_GOAL_LENGTH) {
      newErrors.goal = `Goal must be under ${MAX_GOAL_LENGTH} characters`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      goal: goal.trim(),
      context: context.trim() || undefined,
      outputFormat,
      tone,
      constraints: constraints.length > 0 ? constraints : undefined,
    });
  };

  const handleReset = () => {
    setGoal("");
    setContext("");
    setOutputFormat("plan");
    setTone("professional");
    setConstraints([]);
    setErrors({});
  };

  const toggleConstraint = (constraint: string) => {
    setConstraints((prev) =>
      prev.includes(constraint)
        ? prev.filter((c) => c !== constraint)
        : [...prev, constraint]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Goal Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="goal" className="text-sm font-medium">
            Goal <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {goal.length}/{MAX_GOAL_LENGTH}
          </span>
        </div>
        <Textarea
          id="goal"
          placeholder="Describe what you want the agent to accomplish..."
          value={goal}
          onChange={(e) => {
            setGoal(e.target.value);
            if (errors.goal) setErrors({});
          }}
          disabled={isRunning}
          className={`min-h-[100px] resize-none rounded-xl ${
            errors.goal ? "border-destructive focus-visible:ring-destructive" : ""
          }`}
        />
        {errors.goal && (
          <p className="text-xs text-destructive">{errors.goal}</p>
        )}
      </div>

      {/* Context Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="context" className="text-sm font-medium">
            Context{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {context.length}/{MAX_CONTEXT_LENGTH}
          </span>
        </div>
        <Textarea
          id="context"
          placeholder="Add any relevant background information, constraints, or details..."
          value={context}
          onChange={(e) => setContext(e.target.value)}
          disabled={isRunning}
          className="min-h-[80px] resize-none rounded-xl"
        />
      </div>

      {/* Format and Tone Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Output Format</Label>
          <Select
            value={outputFormat}
            onValueChange={(v) => setOutputFormat(v as OutputFormat)}
            disabled={isRunning}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_FORMATS.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Tone</Label>
          <Select
            value={tone}
            onValueChange={(v) => setTone(v as Tone)}
            disabled={isRunning}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TONES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Constraints */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Constraints{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="flex flex-wrap gap-2">
          {CONSTRAINT_OPTIONS.map((constraint) => (
            <Badge
              key={constraint}
              variant={constraints.includes(constraint) ? "default" : "outline"}
              className={`cursor-pointer transition-colors rounded-full px-3 py-1 ${
                isRunning ? "opacity-50 cursor-not-allowed" : "hover:bg-accent"
              }`}
              onClick={() => !isRunning && toggleConstraint(constraint)}
            >
              {constraints.includes(constraint) && (
                <X className="h-3 w-3 mr-1" />
              )}
              {constraint}
            </Badge>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isRunning || !goal.trim()}
          className="flex-1 gap-2 rounded-xl h-11"
        >
          <Play className="h-4 w-4" />
          {isRunning ? "Running..." : "Run Agent"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isRunning}
          className="gap-2 rounded-xl h-11 bg-transparent"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </form>
  );
}
