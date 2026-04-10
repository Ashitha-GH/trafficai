import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { ArrowLeft, CheckCircle2, LayoutDashboard, Upload } from "lucide-react";
import { useState } from "react";
import { useRegisterUser } from "../hooks/useBackend";
import { UserRole } from "../types";

export function RegisterControlPanelPage() {
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
      { email, role: UserRole.ControlPanelAdmin },
      { onSuccess: () => setSubmitted(true) },
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
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Registration Submitted
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Your Control Panel Admin registration is pending approval.
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
          data-ocid="cp-register-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-card border border-border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-foreground">
                Control Panel Registration
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-primary/40 text-primary mt-0.5"
              >
                ADMIN ACCESS
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cp-email" className="text-sm font-medium">
                Official Email Address
              </Label>
              <Input
                id="cp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@trafficcontrol.gov"
                required
                className="bg-background"
                data-ocid="register-cp-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cp-employee-id" className="text-sm font-medium">
                Employee / Authorization ID
              </Label>
              <Input
                id="cp-employee-id"
                type="text"
                placeholder="CPA-2024-XXXXX"
                required
                className="bg-background"
                data-ocid="register-cp-employee-id"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Authorization Document
              </Label>
              <label
                htmlFor="cp-id-proof"
                className="flex items-center gap-3 w-full cursor-pointer border border-dashed border-input rounded-md px-4 py-3 bg-background hover:bg-muted/20 transition-colors"
                data-ocid="register-cp-id-upload"
              >
                <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate">
                  {fileName || "Upload authorization letter (PDF/JPG/PNG)"}
                </span>
                <input
                  id="cp-id-proof"
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
              data-ocid="register-cp-submit"
            >
              {isPending ? "Submitting..." : "Submit Registration"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
