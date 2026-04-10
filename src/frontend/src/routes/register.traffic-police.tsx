import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ArrowLeft, CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { useRegisterUser } from "../hooks/useBackend";
import { UserRole } from "../types";

// Routing is handled in App.tsx — this file kept for reference only
export function RegisterTrafficPolicePageRoute() {
  const { identity } = useInternetIdentity();
  const [email, setEmail] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutate: registerUser, isPending, error } = useRegisterUser();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !fileName) return;

    registerUser(
      { email, role: UserRole.TrafficPolice },
      {
        onSuccess: () => setSubmitted(true),
      },
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in first.</p>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card border border-border rounded-xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-chart-3" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Registration Submitted
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your Traffic Police registration is pending approval. You will be
            notified once reviewed.
          </p>
          <Button
            onClick={() => {
              window.location.href = "/dashboard";
            }}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-ocid="register-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-accent/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Traffic Police Registration
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-accent/40 text-accent mt-0.5"
              >
                OFFICER PORTAL
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="tp-email" className="text-sm font-medium">
                Official Email Address
              </Label>
              <Input
                id="tp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@traffic.gov"
                required
                className="bg-background"
                data-ocid="register-tp-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tp-password" className="text-sm font-medium">
                Badge / Employee ID
              </Label>
              <Input
                id="tp-password"
                type="text"
                placeholder="TPC-2024-XXXXX"
                required
                className="bg-background"
                data-ocid="register-tp-badge"
              />
              <p className="text-xs text-muted-foreground">
                Enter your official badge or employee ID number
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">ID Proof Document</Label>
              <label
                htmlFor="tp-id-proof"
                className="flex items-center gap-3 w-full cursor-pointer border border-dashed border-input rounded-md px-4 py-3 bg-background hover:bg-muted/20 transition-colors"
                data-ocid="register-tp-id-upload"
              >
                <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {fileName || "Upload government-issued ID (PDF/JPG/PNG)"}
                </span>
                <input
                  id="tp-id-proof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="sr-only"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                Registration failed. Please try again.
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || !email || !fileName}
              data-ocid="register-tp-submit"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit Registration"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
