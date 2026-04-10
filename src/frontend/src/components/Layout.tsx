import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Activity,
  AlertTriangle,
  LayoutDashboard,
  LogOut,
  Radio,
  ShieldCheck,
  User,
} from "lucide-react";
import type { DashboardTab } from "../types";

interface LayoutProps {
  children: React.ReactNode;
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
}

const TABS: {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "emergencies",
    label: "Emergencies",
    icon: <AlertTriangle className="w-4 h-4" />,
    color: "text-destructive",
  },
  {
    id: "control-panel",
    label: "Control Panel",
    icon: <LayoutDashboard className="w-4 h-4" />,
    color: "text-primary",
  },
  {
    id: "traffic-police",
    label: "Traffic Police",
    icon: <ShieldCheck className="w-4 h-4" />,
    color: "text-accent",
  },
  {
    id: "user",
    label: "User",
    icon: <User className="w-4 h-4" />,
    color: "text-chart-3",
  },
];

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { identity, clear } = useInternetIdentity();

  function handleSignOut() {
    clear();
    window.location.href = "/";
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-elevated">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center shrink-0">
              <Activity className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-foreground tracking-tight">
                TrafficAI
              </span>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-primary/40 text-primary hidden sm:flex"
              >
                COMMAND
              </Badge>
            </div>
          </a>

          {/* Live Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-background">
            <Radio className="w-3.5 h-3.5 text-chart-3" />
            <span className="text-xs font-mono text-chart-3">LIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-chart-3 animate-pulse" />
          </div>

          {/* Sign out */}
          {identity && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-xs"
              data-ocid="header-signout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          )}
        </div>

        {/* Tabs */}
        {onTabChange && (
          <div className="flex items-center px-4 border-t border-border bg-card/60 overflow-x-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-smooth whitespace-nowrap ${
                    isActive
                      ? `border-current ${tab.color} bg-muted/40`
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                  data-ocid={`tab-${tab.id}`}
                >
                  <span className={isActive ? tab.color : ""}>{tab.icon}</span>
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background min-h-0">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-3 px-6">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
