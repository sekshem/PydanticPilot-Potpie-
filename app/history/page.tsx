"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { HistoryList } from "@/components/history-list";
import { HistoryDetailDrawer } from "@/components/history-detail-drawer";
import { useToast } from "@/hooks/use-toast";
import {
  getHistory,
  deleteFromHistory,
  exportAsMarkdown,
} from "@/lib/mock-api";
import type { HistoryItem, OutputFormat } from "@/lib/types";

export default function HistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFormat, setFilterFormat] = useState<OutputFormat | "all">("all");
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load history on mount
  useEffect(() => {
    const loadHistory = () => {
      setIsLoading(true);
      // Simulate small delay for loading state
      setTimeout(() => {
        const history = getHistory();
        setItems(history);
        setIsLoading(false);
      }, 300);
    };
    loadHistory();
  }, []);

  const handleItemClick = useCallback((item: HistoryItem) => {
    setSelectedItem(item);
    setIsDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    (runId: string) => {
      deleteFromHistory(runId);
      setItems((prev) => prev.filter((item) => item.runId !== runId));
      toast({
        title: "Deleted",
        description: "The run has been removed from history.",
      });
    },
    [toast]
  );

  const handleCopy = useCallback(
    async (item: HistoryItem) => {
      const markdown = exportAsMarkdown(item);
      await navigator.clipboard.writeText(markdown);
      toast({
        title: "Copied to clipboard",
        description: "Output has been copied as Markdown.",
      });
    },
    [toast]
  );

  const handleRestore = useCallback(
    (item: HistoryItem) => {
      // Store the request in sessionStorage for the workspace to pick up
      sessionStorage.setItem("restoredRequest", JSON.stringify(item.request));
      router.push("/app");
      toast({
        title: "Restored",
        description: "Input has been restored to the workspace.",
      });
    },
    [router, toast]
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setSelectedItem(null);
  }, []);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">History</h1>
          <p className="text-muted-foreground">
            View and manage your saved agent runs.
          </p>
        </div>

        {/* History List */}
        <HistoryList
          items={items}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterFormat={filterFormat}
          onFilterChange={setFilterFormat}
          onItemClick={handleItemClick}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onRestore={handleRestore}
        />

        {/* Detail Drawer */}
        <HistoryDetailDrawer
          item={selectedItem}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          onRestore={handleRestore}
          onCopy={handleCopy}
          onDelete={handleDelete}
        />
      </div>
    </AppShell>
  );
}
