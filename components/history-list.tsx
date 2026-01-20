"use client";

import { formatDistanceToNow } from "date-fns";
import { Search, Trash2, Copy, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HistoryItem, OutputFormat } from "@/lib/types";
import { EmptyState } from "./empty-state";
import { HistoryItemSkeleton } from "./loading-skeleton";
import { History } from "lucide-react";

interface HistoryListProps {
  items: HistoryItem[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterFormat: OutputFormat | "all";
  onFilterChange: (format: OutputFormat | "all") => void;
  onItemClick: (item: HistoryItem) => void;
  onDelete: (runId: string) => void;
  onCopy: (item: HistoryItem) => void;
  onRestore: (item: HistoryItem) => void;
}

const FORMAT_LABELS: Record<OutputFormat | "all", string> = {
  all: "All Formats",
  plan: "Plan",
  checklist: "Checklist",
  email: "Email Draft",
  summary_actions: "Summary + Actions",
};

export function HistoryList({
  items,
  isLoading,
  searchQuery,
  onSearchChange,
  filterFormat,
  onFilterChange,
  onItemClick,
  onDelete,
  onCopy,
  onRestore,
}: HistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 rounded-xl bg-muted animate-pulse" />
          <div className="w-40 h-10 rounded-xl bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <HistoryItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.request.goal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat =
      filterFormat === "all" || item.request.outputFormat === filterFormat;
    return matchesSearch && matchesFormat;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by goal or title..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
        <Select
          value={filterFormat}
          onValueChange={(v) => onFilterChange(v as OutputFormat | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={History}
          title={items.length === 0 ? "No runs saved yet" : "No results found"}
          description={
            items.length === 0
              ? "Your saved agent runs will appear here. Run an agent and save the output to get started."
              : "Try adjusting your search or filters."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.runId}
              className="group rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors cursor-pointer"
              onClick={() => onItemClick(item)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.request.goal}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <span className="text-border">|</span>
                    <span>{FORMAT_LABELS[item.request.outputFormat]}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={item.status === "success" ? "default" : "destructive"}
                    className="rounded-full gap-1"
                  >
                    {item.status === "success" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {item.status === "success" ? "Success" : "Failed"}
                  </Badge>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRestore(item);
                  }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(item);
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.runId);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
