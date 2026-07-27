import { useNavigate } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { CalendarRange, History, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthDialog } from "@/components/auth-dialog";
import { CanvasPanel, type CanvasFilters } from "@/components/canvas-panel";
import { ChatPanel } from "@/components/chat-panel";
import { InstallPrompt } from "@/components/install-prompt";
import { ThreadDrawer } from "@/components/thread-drawer";
import { Button } from "@/components/ui/button";
import logo from "@/assets/hibalag-logo.png";
import {
  useInstallPrompt,
  useLanguage,
  useOnlineStatus,
  useOptionalAuth,
  type Language,
} from "@/hooks/use-hibalag";
import { loadSchedule, type ScheduleEvent } from "@/lib/schedule";
import { supabase } from "@/lib/supabase";
import {
  createThreadStore,
  localThreadCount,
  migrateLocalThreads,
  newId,
  type StoredMessage,
  type Thread,
} from "@/lib/threads";
import { cn } from "@/lib/utils";

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "bisaya", label: "Bisaya" },
  { value: "tagalog", label: "Tagalog" },
  { value: "english", label: "English" },
];

function toUIMessages(stored: StoredMessage[]): UIMessage[] {
  return stored.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }));
}

export function HibalagApp({ threadId }: { threadId: string }) {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const online = useOnlineStatus();
  const { user, ready } = useOptionalAuth();
  const install = useInstallPrompt();
  const store = useMemo(() => createThreadStore(user?.id ?? null), [user?.id]);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [initialMessages, setInitialMessages] = useState<UIMessage[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [localCount, setLocalCount] = useState(0);

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [filters, setFilters] = useState<CanvasFilters>({ date: null, categories: [], query: "" });

  const refreshThreads = useCallback(() => {
    store
      .list()
      .then(setThreads)
      .catch(() => setThreads([]));
  }, [store]);

  useEffect(() => {
    if (!ready) return;
    refreshThreads();
    setLocalCount(user ? localThreadCount() : 0);
  }, [ready, refreshThreads, user]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    setInitialMessages(null);
    store
      .read(threadId)
      .then((stored) => {
        if (!cancelled) setInitialMessages(toUIMessages(stored));
      })
      .catch(() => {
        if (!cancelled) setInitialMessages([]);
      });
    return () => {
      cancelled = true;
    };
  }, [store, threadId, ready]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    loadSchedule({
      onRevalidated: (fresh) => {
        setEvents(fresh.events);
        setFromCache(false);
      },
    })
      .then((payload) => {
        setEvents(payload.events);
        setFromCache(payload.fromCache);
      })
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(refresh, [refresh]);

  const goToThread = useCallback(
    (id: string) => {
      setDrawerOpen(false);
      void navigate({ to: "/chat/$threadId", params: { threadId: id } });
    },
    [navigate],
  );

  const handleNew = useCallback(() => goToThread(newId()), [goToThread]);

  const handleDelete = useCallback(
    (id: string) => {
      void store.remove(id).finally(() => {
        refreshThreads();
        if (id === threadId) handleNew();
      });
    },
    [store, refreshThreads, threadId, handleNew],
  );

  const handleRename = useCallback(
    (thread: Thread, title: string) => {
      void store.rename(thread, title).finally(refreshThreads);
    },
    [store, refreshThreads],
  );

  const handleMigrate = useCallback(() => {
    if (!user) return;
    void migrateLocalThreads(user.id).finally(() => {
      setLocalCount(0);
      refreshThreads();
    });
  }, [user, refreshThreads]);

  return (
    <div className="festive-grain flex h-dvh flex-col bg-background">
      <header className="z-20 flex shrink-0 items-center gap-2 border-b border-border/70 bg-card/85 px-3 py-2 backdrop-blur">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open chat history"
        >
          <History className="size-4" />
        </Button>
        <img src={logo} alt="Hibalag AI" width={36} height={36} className="size-9 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm leading-tight font-semibold">Hibalag AI</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "size-1.5 rounded-full",
                online ? "animate-live-pulse bg-chart-4" : "bg-muted-foreground",
              )}
            />
            {online ? "Live · Founders Day 2026" : "Offline mode"}
            {user ? " · Synced" : ""}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-border bg-background p-0.5">
          {LANGUAGES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLanguage(option.value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                language === option.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-h-0">
          {initialMessages ? (
            <ChatPanel
              key={threadId}
              threadId={threadId}
              initialMessages={initialMessages}
              language={language}
              online={online}
              userId={user?.id ?? null}
              onThreadSaved={refreshThreads}
            />
          ) : null}
        </div>

        <div className="hidden min-h-0 border-l border-border/70 lg:block">
          <CanvasPanel
            events={events}
            filters={filters}
            onFiltersChange={setFilters}
            loading={loading}
            offlineCopy={fromCache && !online}
            error={error}
            onRetry={refresh}
          />
        </div>
      </main>

      <div className="lg:hidden">
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-40 h-[85dvh] rounded-t-3xl border-t border-border bg-background shadow-[var(--shadow-glow)] transition-transform duration-300",
            canvasOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <CanvasPanel
            events={events}
            filters={filters}
            onFiltersChange={setFilters}
            loading={loading}
            offlineCopy={fromCache && !online}
            error={error}
            onRetry={refresh}
            onClose={() => setCanvasOpen(false)}
          />
        </div>

        {!canvasOpen ? (
          <Button
            onClick={() => setCanvasOpen(true)}
            className="fixed right-4 bottom-24 z-30 rounded-full shadow-[var(--shadow-glow)]"
          >
            <CalendarRange className="mr-1.5 size-4" /> Schedule
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setCanvasOpen(false)}
            className="fixed right-4 bottom-4 z-50 rounded-full"
          >
            <MessageSquare className="mr-1.5 size-4" /> Chat
          </Button>
        )}
      </div>

      <ThreadDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        threads={threads}
        activeThreadId={threadId}
        onSelect={goToThread}
        onNew={handleNew}
        onRename={handleRename}
        onDelete={handleDelete}
        email={user?.email ?? null}
        onLogin={() => {
          setDrawerOpen(false);
          setAuthOpen(true);
        }}
        onLogout={() => {
          void supabase.auth.signOut();
        }}
        pendingLocalCount={localCount}
        onMigrate={handleMigrate}
      />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />

      <InstallPrompt
        open={install.shouldPrompt}
        onInstall={() => void install.install()}
        onDismiss={install.dismiss}
      />
    </div>
  );
}
