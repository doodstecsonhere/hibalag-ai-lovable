import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { CanvasPanel, type CanvasFilters } from "@/components/canvas-panel";
import { ChatPanel } from "@/components/chat-panel";
import { InstallPrompt } from "@/components/install-prompt";
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
import { newId } from "@/lib/threads";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hibalag AI: Silliman Founders Week Guide" },
      {
        name: "description",
        content:
          "Ask Hibalag AI about Silliman University's Founders Week and Hibalag Festival schedule on August — in Bisaya, Tagalog, English, etc.",
      },
      { property: "og:title", content: "Hibalag AI: Silliman Founders Week Guide" },
      {
        property: "og:description",
        content:
          "Ask Hibalag AI about Silliman University's Founders Week and Hibalag Festival schedule on August — in Bisaya, Tagalog, English, etc.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HibalagPage,
});

const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "bisaya", label: "Bisaya" },
  { value: "tagalog", label: "Tagalog" },
  { value: "english", label: "English" },
];

function HibalagPage() {
  const { language, setLanguage } = useLanguage();
  const online = useOnlineStatus();
  const { user } = useOptionalAuth();
  const install = useInstallPrompt();

  const [threadId, setThreadId] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canvasOpen, setCanvasOpen] = useState(false);
  const [filters, setFilters] = useState<CanvasFilters>({
    date: null,
    categories: [],
    query: "",
  });

  useEffect(() => setThreadId(newId()), []);

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

  const onThreadSaved = useCallback(() => undefined, []);

  return (
    <div className="festive-grain flex h-dvh flex-col bg-background">
      <header className="z-20 flex shrink-0 items-center gap-2 border-b border-border/70 bg-card/85 px-3 py-2 backdrop-blur">
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
          {threadId ? (
            <ChatPanel
              key={threadId}
              threadId={threadId}
              initialMessages={[]}
              language={language}
              online={online}
              userId={user?.id ?? null}
              onThreadSaved={onThreadSaved}
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

      <InstallPrompt
        open={install.shouldPrompt}
        onInstall={() => void install.install()}
        onDismiss={install.dismiss}
      />
    </div>
  );
}
