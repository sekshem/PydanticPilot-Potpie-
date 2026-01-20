"use client";

import React from "react"

import { SidebarNav } from "@/components/sidebar-nav";
import { Toaster } from "@/components/ui/toaster";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}
