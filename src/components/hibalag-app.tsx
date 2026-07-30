import { useNavigate } from "@tanstack/react-router";
import type { UIMessage } from "ai";
import { CalendarRange, Menu } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthDialog } from "@/components/auth-dialog";
import { CanvasPanel, type CanvasFilters } from "@/components/canvas-panel";
import { ChatPanel } from "@/components/chat-panel";
import { InstallPrompt } from "@/components/install-prompt";
import { ThreadDrawer } from "@/components/thread-drawer";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
const logo = "/apple-touch-icon.png";
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

const LANGUAGE_OPTIONS: Language[] = ["bisaya", "english", "tagalog"];


function toUIMessages(stored: StoredMessage[]): UIMessage[] {
  return stored.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }));
}

function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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

  const liveCount = useMemo(() => {
    const iso = todayIso();
    return events.filter((event) => event.date === iso).length;
  }, [events]);

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
    <div className="festive-grain flex h-dvh flex-col bg-background pt-[env(safe-area-inset-top)]">
      <header className="z-20 grid shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-border/70 bg-card/85 px-2 py-1.5 backdrop-blur sm:px-3 sm:py-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu and chat history"
            className="size-11"
          >
            <Menu className="size-5" />
          </Button>
          <img
            src={logo}
            alt="Hibalag AI"
            width={36}
            height={36}
            className="hidden size-9 shrink-0 rounded-xl sm:block"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate font-display text-sm leading-tight font-semibold">Hibalag AI</p>
          <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                online ? "animate-live-pulse bg-chart-4" : "bg-muted-foreground",
              )}
            />
            <span className="truncate">
              {online ? "Active" : "Offline mode"}
              {user ? " · Synced" : ""}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-full border border-border bg-background p-0.5">
            {LANGUAGES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLanguage(option.value)}
                className={cn(
                  "min-h-9 rounded-full px-2.5 text-[11px] font-semibold transition-colors",
                  option.mobile ? "" : "hidden sm:block",
                  language === option.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => setCanvasOpen(true)}
            aria-label="Open schedule canvas"
            className="relative size-11 rounded-full p-0 lg:hidden"
          >
            <CalendarRange className="size-5" />
            {liveCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {liveCount}
              </span>
            ) : null}
          </Button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-h-0 min-w-0">
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

      {!canvasOpen ? (
        <Button
          onClick={() => setCanvasOpen(true)}
          className="fixed right-4 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-40 min-h-11 rounded-full px-4 shadow-[var(--shadow-glow)] lg:hidden"
        >
          <CalendarRange className="mr-1.5 size-4" /> View Schedule Canvas
        </Button>
      ) : null}

      <Drawer open={canvasOpen} onOpenChange={setCanvasOpen}>
        <DrawerContent className="h-[90dvh] lg:hidden">
          <DrawerTitle className="sr-only">Iskedyul Canvas</DrawerTitle>
          <DrawerDescription className="sr-only">
            Browse and filter Founders Week events.
          </DrawerDescription>
          <div className="min-h-0 flex-1">
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
        </DrawerContent>
      </Drawer>

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
