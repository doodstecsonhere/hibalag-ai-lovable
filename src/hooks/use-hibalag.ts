import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { useI18n } from "@/lib/i18n-context";
import { supabase } from "@/lib/supabase";

export type { Language } from "@/lib/i18n";

export function useLanguage() {
  const { language, setLanguage } = useI18n();
  return { language, setLanguage };
}


export function useOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return online;
}

/** Optional auth — the app is fully usable while `user` stays null. */
export function useOptionalAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setUser(session?.user ?? null);
    });

    // Offline: never start a session request — supabase-js may try to refresh
    // the token, and the browser can hang on it for 20–30s before rejecting.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setReady(true);
      return () => {
        cancelled = true;
        subscription.subscription.unsubscribe();
      };
    }

    // Never block UI on the session lookup either: mark ready fast and let the
    // resolved session (if any) arrive afterwards.
    const readyTimer = setTimeout(() => {
      if (!cancelled) setReady(true);
    }, 1000);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!cancelled) setUser(data.session?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, ready };
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** "native" = beforeinstallprompt fired (Android Chrome, Edge desktop).
 *  "ios" = iOS/iPadOS Safari — supports Add to Home Screen but never fires the event.
 *  null = not installable or already installed. */
export type InstallPlatform = "native" | "ios" | null;

const INSTALL_DISMISSED_KEY = "hibalag:install-dismissed";
const SNOOZE_DAYS = 14;

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const ua = navigator.userAgent || "";
  const isIosDevice = /iPhone|iPad|iPod/i.test(ua);
  const isNotEdgeLegacy = !(window as unknown as { MSStream?: unknown }).MSStream;
  return isIosDevice && isNotEdgeLegacy;
}

function isDismissedRecently(): boolean {
  try {
    const stored = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (!stored) return false;
    const dismissedAt = Number(stored);
    if (!Number.isFinite(dismissedAt)) return false;
    const ageDays = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    return ageDays < SNOOZE_DAYS;
  } catch {
    return false;
  }
}

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<InstallPlatform>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setInstalled(standalone);
    setDismissed(isDismissedRecently());

    if (!standalone) {
      // iOS Safari supports Add to Home Screen but never fires beforeinstallprompt.
      if (detectIos()) setPlatform("ios");
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setPlatform("native");
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setPlatform(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return "unavailable" as const;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    setDeferred(null);
    return choice.outcome;
  }, [deferred]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  return {
    platform,
    canInstall: platform !== null && !installed,
    shouldPrompt: platform !== null && !installed && !dismissed,
    installed,
    install,
    dismiss,
  };
}
