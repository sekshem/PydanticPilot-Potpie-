"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  History,
  Settings,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  {
    href: "/app",
    label: "Workspace",
    icon: LayoutDashboard,
  },
  {
    href: "/history",
    label: "History",
    icon: History,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between h-full px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">PydanticPilot</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 border-r border-border bg-sidebar transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
                <Zap className="h-4 w-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-semibold text-sidebar-foreground">
                PydanticPilot
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-accent-foreground">
                  U
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  User
                </p>
                <p className="text-xs text-sidebar-foreground/60 truncate">
                  Free Plan
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
