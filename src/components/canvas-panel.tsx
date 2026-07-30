import { CalendarDays, Filter, MapPin, RefreshCw, Users, WifiOff, X } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n-context";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  formatEventDate,
  formatTime,
  type Category,
  type ScheduleEvent,
} from "@/lib/schedule";


export type CanvasFilters = {
  date: string | null;
  categories: Category[];
  query: string;
};

const FESTIVAL_DAYS = Array.from({ length: 29 }, (_, index) => {
  const day = index + 1;
  return `2026-08-${String(day).padStart(2, "0")}`;
});

const CATEGORY_STYLES: Record<Category, string> = {
  Featured: "bg-gold/25 text-gold-foreground border-gold/40",
  Religious: "bg-chart-3/15 text-foreground border-chart-3/30",
  Alumni: "bg-chart-4/15 text-foreground border-chart-4/30",
  Cultural: "bg-chart-5/15 text-foreground border-chart-5/30",
  Parties: "bg-primary/12 text-primary border-primary/25",
};

export function filterEvents(events: ScheduleEvent[], filters: CanvasFilters) {
  const query = filters.query.trim().toLowerCase();
  return events.filter((event) => {
    if (filters.date && event.date !== filters.date) return false;
    if (filters.categories.length > 0 && !filters.categories.some((c) => event.categories.includes(c))) {
      return false;
    }
    if (query) {
      const haystack = [event.title, event.venue, event.leadUnit, event.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

function categoryKey(category: Category): TranslationKey {
  return `category.${category}` as TranslationKey;
}

function EventCard({ event }: { event: ScheduleEvent }) {
  const { t } = useI18n();
  const start = formatTime(event.startTime);
  const end = formatTime(event.endTime);


  return (
    <article className="animate-rise rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-elev)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-base leading-snug font-semibold text-foreground">
            {event.title}
          </h3>
          <p className="mt-1 text-xs font-medium text-primary">
            {formatEventDate(event.date)}
            {start ? ` · ${start}${end ? `–${end}` : ""}` : ""}
          </p>
        </div>
      </div>

      {event.description ? (
        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{event.description}</p>
      ) : null}

      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        {event.venue ? (
          <p className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{event.venue}</span>
          </p>
        ) : null}
        {event.leadUnit ? (
          <p className="flex items-center gap-1.5">
            <Users className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{event.leadUnit}</span>
          </p>
        ) : null}
      </div>

      {event.categories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {event.categories.map((category) => (
            <span
              key={category}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                CATEGORY_STYLES[category],
              )}
            >
              {t(categoryKey(category))}

            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

type CanvasPanelProps = {
  events: ScheduleEvent[];
  filters: CanvasFilters;
  onFiltersChange: (filters: CanvasFilters) => void;
  loading: boolean;
  offlineCopy: boolean;
  error: string | null;
  onRetry: () => void;
  onClose?: () => void;
};

export function CanvasPanel({
  events,
  filters,
  onFiltersChange,
  loading,
  offlineCopy,
  error,
  onRetry,
  onClose,
}: CanvasPanelProps) {
  const { t } = useI18n();
  const visible = useMemo(() => filterEvents(events, filters), [events, filters]);


  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    visible.forEach((event) => {
      const key = event.date ?? "TBA";
      map.set(key, [...(map.get(key) ?? []), event]);
    });
    return Array.from(map.entries());
  }, [visible]);

  const toggleCategory = (category: Category) => {
    const active = filters.categories.includes(category);
    onFiltersChange({
      ...filters,
      categories: active
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    });
  };

  return (
    <section
      aria-label={t("canvas.aria")}
      className="flex h-full min-h-0 flex-col bg-surface/70"
    >
      <header className="shrink-0 border-b border-border/70 bg-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-semibold">{t("canvas.title")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("canvas.count", { count: visible.length })}
            </p>

          </div>
          <div className="flex items-center gap-1">
            {offlineCopy ? (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">
                <WifiOff className="size-3" aria-hidden /> {t("canvas.offlineCopy")}
              </span>
            ) : null}
            {onClose ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label={t("canvas.close")}
                className="size-11"
              >
                <X className="size-5" />
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-3">
          <input
            value={filters.query}
            onChange={(event) => onFiltersChange({ ...filters, query: event.target.value })}
            placeholder={t("canvas.search")}
            className="min-h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:text-sm"
          />
        </div>

        <div className="scrollbar-slim mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => onFiltersChange({ ...filters, date: null })}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors",
              filters.date === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-accent",
            )}
          >
            <CalendarDays className="mr-1 inline size-3.5" aria-hidden /> {t("canvas.allDays")}
          </button>
          {FESTIVAL_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => onFiltersChange({ ...filters, date: day })}
              className={cn(
                "min-h-11 min-w-11 shrink-0 rounded-full border px-4 text-xs font-semibold transition-colors",
                filters.date === day
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent",
              )}
            >
              {t("canvas.dayChip", { day: Number(day.slice(-2)) })}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" aria-hidden />
          {CATEGORIES.map((category) => {
            const active = filters.categories.includes(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={active}
                className={cn(
                  "min-h-11 rounded-full border px-3.5 text-[11px] font-semibold transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-accent",
                )}
              >
                {t(categoryKey(category))}

              </button>
            );
          })}
        </div>
      </header>

      <div className="scrollbar-slim smooth-scroll-y min-h-0 flex-1 space-y-5 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button className="mt-3" size="sm" onClick={onRetry}>
              <RefreshCw className="mr-1.5 size-3.5" /> Sulayi pag-usab
            </Button>
          </div>
        ) : grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Walay event nga mo-match ani nga filter, bay. Sulayi ug lain nga adlaw o category.
            </p>
          </div>
        ) : (
          grouped.map(([date, dayEvents]) => (
            <div key={date}>
              <div className="sticky top-0 z-10 -mx-1 mb-2 bg-surface/90 px-1 py-1 backdrop-blur">
                <h3 className="font-display text-sm font-semibold tracking-wide text-primary uppercase">
                  {date === "TBA" ? "Date TBA" : formatEventDate(date)}
                </h3>
              </div>
              <div className="space-y-3">
                {dayEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="shrink-0 border-t border-border/70 bg-card/70 px-4 py-2">
        <Badge variant="secondary" className="text-[11px] font-medium">
          Silliman University · Founders Day Celebration
        </Badge>
      </footer>
    </section>
  );
}
