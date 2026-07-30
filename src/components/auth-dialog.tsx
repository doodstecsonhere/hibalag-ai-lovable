import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n-context";
import { supabase } from "@/lib/supabase";

type AuthDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;
        setMessage("Check your email para ma-confirm ang account.");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        onOpenChange(false);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Naay problema sa pag-login.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (oauthError) setError(oauthError.message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display">
            {mode === "signin" ? "Log in sa Hibalag AI" : "Paghimo ug account"}
          </DialogTitle>
          <DialogDescription>
            Optional ni — ang chat mo-gana bisan guest. Mag-login lang kung gusto nimo ma-sync ang
            imong mga chat sa tanan nimong device.
          </DialogDescription>
        </DialogHeader>

        <Button type="button" variant="outline" onClick={() => void google()}>
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> o gamita ang email <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="auth-email">Email</Label>
            <Input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <Input
              id="auth-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}

          <Button type="submit" disabled={busy}>
            {mode === "signin" ? "Log in" : "Sign up"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Wala pa'y account? Sign up" : "Naa na'y account? Log in"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
