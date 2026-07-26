import { Download, Smartphone, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type InstallPromptProps = {
  open: boolean;
  onInstall: () => void;
  onDismiss: () => void;
};

export function InstallPrompt({ open, onInstall, onDismiss }: InstallPromptProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-6">
      <div className="animate-rise w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-glow)]">
        <div className="flex items-start gap-3">
          <div className="crimson-gradient flex size-11 shrink-0 items-center justify-center rounded-2xl text-primary-foreground">
            <Smartphone className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold">Install Hibalag AI</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              I-add sa imong home screen para paspas ug ma-browse ang schedule bisan walay signal.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={onInstall}>
                <Download className="mr-1.5 size-4" /> Install
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Not now
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss install prompt"
            className="rounded-full p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
