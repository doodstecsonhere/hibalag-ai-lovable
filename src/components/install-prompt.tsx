import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";

type InstallPromptProps = {
  open: boolean;
  platform: "native" | "ios" | null;
  onInstall: () => void;
  onDismiss: () => void;
};

export function InstallPrompt({ open, platform, onInstall, onDismiss }: InstallPromptProps) {
  const { t } = useI18n();
  if (!open || !platform) return null;

  const isIos = platform === "ios";

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-3 sm:p-6">
      <div className="animate-rise w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-[var(--shadow-glow)]">
        <div className="flex items-start gap-3">
          <img
            src="/icon-192.png"
            alt=""
            decoding="async"
            width={44}
            height={44}
            className="size-11 shrink-0 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold">{t("install.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isIos ? t("install.iosBody") : t("install.body")}
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={onInstall}>
                {isIos ? (
                  t("install.gotIt")
                ) : (
                  <>
                    <Download className="mr-1.5 size-4" /> {t("install.action")}
                  </>
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                {t("install.later")}
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label={t("install.dismiss")}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
