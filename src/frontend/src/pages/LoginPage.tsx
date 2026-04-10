import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BarChart2,
  ChevronRight,
  LayoutDashboard,
  Lock,
  MapPin,
  Shield,
  ShieldCheck,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: <MapPin className="w-5 h-5 text-primary" />,
    title: "Live Traffic Map",
    desc: "Real-time vehicle and incident tracking across the city grid",
  },
  {
    icon: <Zap className="w-5 h-5 text-destructive" />,
    title: "Emergency Response",
    desc: "Instant dispatch coordination for ambulances, fire trucks, and police",
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-accent" />,
    title: "AI Predictions",
    desc: "Simulated AI chatboard powered by live traffic system data",
  },
  {
    icon: <Shield className="w-5 h-5 text-chart-3" />,
    title: "Anomaly Detection",
    desc: "Automated detection of congestion anomalies and unusual patterns",
  },
];

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Decorative background grid */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, oklch(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo + Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-5 shadow-elevated">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            TrafficAI
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge
              variant="outline"
              className="font-mono text-[11px] border-primary/40 text-primary"
            >
              CENTRAL COMMAND
            </Badge>
          </div>
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            AI-powered traffic management platform for real-time monitoring,
            incident response, and dynamic routing.
          </p>
        </div>

        {/* Login card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-elevated mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Secure access via Internet Identity
            </span>
          </div>

          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full font-semibold text-base"
            data-ocid="login-btn"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sign In with Internet Identity
              </span>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-4">
            No password required. Decentralized & secure.
          </p>
        </div>

        {/* Staff / Role portals */}
        <div className="mb-6">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 text-center">
            Staff Portals
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => navigate({ to: "/login/control-panel" })}
              className="flex items-center justify-between gap-2 bg-card border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg px-4 py-3 transition-colors group"
              data-ocid="login-cp-portal-link"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    Control Panel
                  </p>
                  <p className="text-[10px] text-muted-foreground">Admin</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => navigate({ to: "/login/traffic-police" })}
              className="flex items-center justify-between gap-2 bg-card border border-border hover:border-accent/50 hover:bg-accent/5 rounded-lg px-4 py-3 transition-colors group"
              data-ocid="login-tp-portal-link"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-accent/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-foreground leading-tight">
                    Traffic Police
                  </p>
                  <p className="text-[10px] text-muted-foreground">Officer</p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="mb-2">{f.icon}</div>
              <p className="text-xs font-semibold text-foreground mb-1">
                {f.title}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
