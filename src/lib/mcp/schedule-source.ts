import { parseSchedule, type Category, type ScheduleEvent } from "@/lib/schedule";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase";

/**
 * Fetches the public Hibalag Festival schedule markdown from Supabase using the
 * publishable (anon) key only — RLS applies as `anon`, so nothing private can leak.
 * No env reads at module scope: everything happens inside this function.
 */
export async function fetchScheduleEvents(): Promise<ScheduleEvent[]> {
  const url = `${SUPABASE_URL}/rest/v1/schedule_context?id=eq.1&select=markdown_context`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Schedule fetch failed (${res.status})`);
  const rows = (await res.json()) as Array<{ markdown_context: string | null }>;
  const markdown = rows?.[0]?.markdown_context ?? "";
  return parseSchedule(markdown);
}

export function matchesFilters(
  event: ScheduleEvent,
  filters: { date?: string; category?: string; query?: string },
) {
  if (filters.date && event.date !== filters.date) return false;
  if (filters.category) {
    const wanted = filters.category.toLowerCase();
    if (!event.categories.some((c) => c.toLowerCase() === wanted)) return false;
  }
  if (filters.query) {
    const haystack = [event.title, event.venue, event.leadUnit, event.description, event.note]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

export function toPlainText(event: ScheduleEvent) {
  const parts = [
    event.title,
    [event.date ?? "Date TBA", event.startTime ? `${event.startTime}${event.endTime ? `–${event.endTime}` : ""}` : null]
      .filter(Boolean)
      .join(" "),
    event.venue ? `Venue: ${event.venue}` : null,
    event.leadUnit ? `Lead: ${event.leadUnit}` : null,
    event.categories.length ? `Categories: ${event.categories.join(", ")}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export type { Category, ScheduleEvent };
