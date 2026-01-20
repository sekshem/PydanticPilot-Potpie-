"use client";

import { useState } from "react";
import {
  Server,
  Key,
  Moon,
  Sun,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppShell } from "@/components/app-shell";
import { useToast } from "@/hooks/use-toast";
import { clearHistory, getHistory } from "@/lib/mock-api";

export default function SettingsPage() {
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [logLevel, setLogLevel] = useState("info");
  const [historyCount, setHistoryCount] = useState(getHistory().length);

  const handleThemeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast({
      title: "Theme updated",
      description: `Switched to ${checked ? "dark" : "light"} mode.`,
    });
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistoryCount(0);
    toast({
      title: "History cleared",
      description: "All saved runs have been deleted.",
    });
  };

  // Simulated connection status
  const apiKeyStatus = "missing" as "connected" | "missing";

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Configure your workspace preferences.
          </p>
        </div>

        <div className="space-y-6">
          {/* Model Provider */}
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5" />
                Model Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Provider</p>
                  <p className="text-sm text-muted-foreground">
                    OpenRouter (Free Tier)
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Default
                </Badge>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    API Key Status
                  </span>
                </div>
                <Badge
                  variant={apiKeyStatus === "connected" ? "default" : "secondary"}
                  className="rounded-full gap-1"
                >
                  {apiKeyStatus === "connected" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Using Default
                    </>
                  )}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                {isDarkMode ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label
                    htmlFor="dark-mode"
                    className="text-sm font-medium text-foreground"
                  >
                    Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logging */}
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Logging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-foreground">
                    Log Level
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Control the verbosity of logs
                  </p>
                </div>
                <Select value={logLevel} onValueChange={setLogLevel}>
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="rounded-2xl border-destructive/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Clear History
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Delete all {historyCount} saved runs permanently
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 bg-transparent"
                      disabled={historyCount === 0}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear all history?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All {historyCount} saved
                        runs will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClearHistory}
                        className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Clear History
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
