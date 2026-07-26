import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export type Language = "auto" | "bisaya" | "tagalog" | "english";

const LANG_KEY = "hibalag:language";

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>("auto");

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Language | null;
    if (stored) setLanguageState(stored);
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

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
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));

    return () => subscription.subscription.unsubscribe();
  }, []);

  return { user, ready };
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const INSTALL_DISMISSED_KEY = "hibalag:install-dismissed";

export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(INSTALL_DISMISSED_KEY) === "1");
    setInstalled(window.matchMedia("(display-mode: standalone)").matches);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
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
      localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return {
    canInstall: Boolean(deferred) && !installed,
    shouldPrompt: Boolean(deferred) && !installed && !dismissed,
    installed,
    install,
    dismiss,
  };
}
