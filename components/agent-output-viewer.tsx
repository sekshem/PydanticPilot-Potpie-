"use client";

import { useState } from "react";
import {
  Copy,
  Save,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { AgentRunResponse } from "@/lib/types";
import { exportAsMarkdown, exportAsJson } from "@/lib/mock-api";

interface AgentOutputViewerProps {
  output: AgentRunResponse;
  onSave: () => void;
  onRunAgain: () => void;
  isSaved?: boolean;
}

export function AgentOutputViewer({
  output,
  onSave,
  onRunAgain,
  isSaved = false,
}: AgentOutputViewerProps) {
  const { toast } = useToast();
  const [justCopied, setJustCopied] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleCopy = async () => {
    const markdown = exportAsMarkdown(output);
    await navigator.clipboard.writeText(markdown);
    setJustCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Output has been copied as Markdown.",
    });
    setTimeout(() => setJustCopied(false), 2000);
  };

  const handleSave = () => {
    onSave();
    setJustSaved(true);
    toast({
      title: "Saved to history",
      description: "This run has been saved to your history.",
    });
    setTimeout(() => setJustSaved(false), 2000);
  };

  const handleExport = (format: "markdown" | "json") => {
    const content =
      format === "markdown"
        ? exportAsMarkdown(output)
        : exportAsJson(output);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sentinel-output-${output.runId}.${
      format === "markdown" ? "md" : "json"
    }`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Exported",
      description: `Output exported as ${format.toUpperCase()}.`,
    });
  };

  const confidencePercent = output.confidence
    ? Math.round(output.confidence * 100)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-foreground text-balance">
            {output.title}
          </h3>
          {confidencePercent !== null && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs text-muted-foreground">Confidence</span>
              <div className="flex items-center gap-2">
                <Progress value={confidencePercent} className="w-16 h-1.5" />
                <span className="text-xs font-medium text-foreground">
                  {confidencePercent}%
                </span>
              </div>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {output.summary}
        </p>
      </div>

      {/* Warnings */}
      {output.warnings && output.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              {output.warnings.map((warning, i) => (
                <p key={i} className="text-sm text-warning-foreground">
                  {warning}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-5">
        {output.sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              {section.heading}
            </h4>
            <ul className="space-y-2">
              {section.content.map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2 rounded-xl bg-transparent"
        >
          {justCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {justCopied ? "Copied" : "Copy"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaved || justSaved}
          className="gap-2 rounded-xl bg-transparent"
        >
          {justSaved || isSaved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {justSaved || isSaved ? "Saved" : "Save to History"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 rounded-xl bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleExport("markdown")}>
              Export as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              Export as JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="secondary"
          size="sm"
          onClick={onRunAgain}
          className="gap-2 rounded-xl ml-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Run Again
        </Button>
      </div>
    </div>
  );
}
