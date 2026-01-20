"use client";

import { formatDistanceToNow } from "date-fns";
import { X, Copy, Trash2, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { HistoryItem } from "@/lib/types";

const FORMAT_LABELS: Record<string, string> = {
  plan: "Plan",
  checklist: "Checklist",
  email: "Email Draft",
  summary_actions: "Summary + Actions",
};

const TONE_LABELS: Record<string, string> = {
  professional: "Professional",
  friendly: "Friendly",
  strict: "Strict",
};

interface HistoryDetailDrawerProps {
  item: HistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
  onCopy: (item: HistoryItem) => void;
  onDelete: (runId: string) => void;
}

export function HistoryDetailDrawer({
  item,
  isOpen,
  onClose,
  onRestore,
  onCopy,
  onDelete,
}: HistoryDetailDrawerProps) {
  if (!item) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <SheetTitle className="text-left">{item.title}</SheetTitle>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Badge
              variant={item.status === "success" ? "default" : "destructive"}
              className="rounded-full"
            >
              {item.status === "success" ? "Success" : "Failed"}
            </Badge>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Input Summary */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Input</h4>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Goal:</span>
                <p className="mt-1 text-foreground">{item.request.goal}</p>
              </div>
              {item.request.context && (
                <div>
                  <span className="text-muted-foreground">Context:</span>
                  <p className="mt-1 text-foreground">{item.request.context}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full">
                  {FORMAT_LABELS[item.request.outputFormat]}
                </Badge>
                <Badge variant="secondary" className="rounded-full">
                  {TONE_LABELS[item.request.tone]}
                </Badge>
                {item.request.constraints?.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Output Preview */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Output</h4>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {item.summary}
              </p>
              <div className="space-y-4">
                {item.sections.slice(0, 2).map((section, i) => (
                  <div key={i} className="space-y-2">
                    <h5 className="text-xs font-medium text-foreground">
                      {section.heading}
                    </h5>
                    <ul className="space-y-1">
                      {section.content.slice(0, 3).map((content, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
                          <span>{content}</span>
                        </li>
                      ))}
                      {section.content.length > 3 && (
                        <li className="text-xs text-muted-foreground pl-5">
                          +{section.content.length - 3} more items
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
                {item.sections.length > 2 && (
                  <p className="text-xs text-muted-foreground">
                    +{item.sections.length - 2} more sections
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-border flex flex-wrap gap-2">
          <Button
            variant="default"
            className="gap-2 rounded-xl flex-1"
            onClick={() => {
              onRestore(item);
              onClose();
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Restore to Workspace
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl bg-transparent"
            onClick={() => onCopy(item)}
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
            onClick={() => {
              onDelete(item.runId);
              onClose();
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
