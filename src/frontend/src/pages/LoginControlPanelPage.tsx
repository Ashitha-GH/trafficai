import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LayoutDashboard,
  Lock,
  Upload,
} from "lucide-react";
import { useState } from "react";

const FEATURE_BULLETS = [
  "Full fleet & vehicle oversight",
  "Dynamic signal override controls",
  "System-wide incident management",
  "AI-powered traffic predictions",
];

export function LoginControlPanelPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password || !fileName) {
      setError("Please fill in all fields and upload your ID proof.");
      return;
    }
    setIsLoading(true);
    // Simulate authentication — store role in localStorage then redirect
    setTimeout(() => {
      localStorage.setItem("trafficai_role", "control-panel");
      localStorage.setItem("trafficai_role_email", email);
      setIsLoading(false);
      navigate({ to: "/dashboard", search: { tab: "control-panel" } });
    }, 900);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-card border-r border-border p-10">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-lg font-bold text-foreground tracking-tight">
              TrafficAI
            </span>
          </div>

          <Badge
            variant="outline"
            className="text-[10px] font-mono border-primary/40 text-primary mb-5"
          >
            CONTROL PANEL PORTAL
          </Badge>

          <h2 className="font-display text-3xl font-bold text-foreground leading-tight mb-4">
            Centralized Traffic Control
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Access the Control Panel dashboard to oversee city-wide traffic
            operations, manage vehicle fleets, and respond to critical incidents
            in real time.
          </p>

          <ul className="space-y-3">
            {FEATURE_BULLETS.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground/60 font-mono">
          Authorized personnel only · Secure access
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-primary" />
            </div>
            <span className="font-display text-base font-bold text-foreground">
              TrafficAI
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
            data-ocid="cp-login-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to main login
          </button>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="w-5 h-5 text-primary" />
              <h1 className="font-display text-2xl font-bold text-foreground">
                Control Panel Login
              </h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Sign in as a Control Panel Admin to manage system-wide traffic
              operations.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-primary/40 text-primary"
              >
                ADMIN ACCESS
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-border text-muted-foreground"
              >
                CONTROL PANEL ADMIN
              </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="cp-login-email" className="text-sm font-medium">
                  Official Email Address
                </Label>
                <Input
                  id="cp-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trafficcontrol.gov"
                  required
                  className="bg-background"
                  data-ocid="cp-login-email"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="cp-login-password"
                  className="text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="cp-login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="bg-background pr-10"
                    data-ocid="cp-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ID Proof Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  ID Proof / Authorization Document
                </Label>
                <label
                  htmlFor="cp-login-id"
                  className="flex items-center gap-3 w-full cursor-pointer border border-dashed border-input rounded-md px-4 py-3 bg-background hover:bg-muted/20 transition-colors"
                  data-ocid="cp-login-id-upload"
                >
                  <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {fileName || "Upload government-issued ID (PDF/JPG/PNG)"}
                  </span>
                  <input
                    id="cp-login-id"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-ocid="cp-login-submit"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Login to Control Panel"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate({ to: "/register/control-panel" })}
              className="text-primary hover:underline font-medium transition-colors"
              data-ocid="cp-login-register-link"
            >
              Register as Control Panel Admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
