import { get, set } from "idb-keyval";

import { supabase } from "./supabase";

export const CATEGORIES = ["Featured", "Religious", "Alumni", "Cultural", "Parties"] as const;
export type Category = (typeof CATEGORIES)[number];

export type ScheduleEvent = {
  id: string;
  title: string;
  date: string | null; // YYYY-MM-DD
  startTime: string | null; // HH:MM
  endTime: string | null;
  venue: string | null;
  leadUnit: string | null;
  pointPerson: string | null;
  note: string | null;
  description: string | null;
  categories: Category[];
};

export type SchedulePayload = {
  markdown: string;
  events: ScheduleEvent[];
  fetchedAt: number;
  fromCache: boolean;
};

const CACHE_KEY = "hibalag:schedule-context:v1";

const RULES: Array<{ category: Category; re: RegExp }> = [
  {
    category: "Religious",
    re: /worship|church|service|vesper|prayer|devotion|anniversary of the church|thanksgiving|chapel|communion|sunday/i,
  },
  {
    category: "Alumni",
    re: /alumni|alumnae|balik[- ]talent|homecoming|reunion|class of|golden jubil|silver jubil|aai\b|association/i,
  },
  {
    category: "Cultural",
    re: /pageant|miss silliman|mr\.? silliman|concert|cultural|dance|parada|parade|exhibit|show|choral|band|theater|theatre|film|festival|kasadya|literary|music|art/i,
  },
  {
    category: "Parties",
    re: /party|night|disco|bash|kick[- ]?off|rave|social|jam|after[- ]?party|booth|hibalag grounds/i,
  },
];

function detectCategories(text: string, note: string | null): Category[] {
  const found = new Set<Category>();
  if (note && /featured/i.test(note)) found.add("Featured");
  for (const rule of RULES) {
    if (rule.re.test(text)) found.add(rule.category);
  }
  return CATEGORIES.filter((c) => found.has(c));
}

function slug(value: string, index: number) {
  return `${index}-${value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 48)}`;
}

/** Parses the `### Title` + `- **Field**: value` markdown produced by the schedule sync. */
export function parseSchedule(markdown: string): ScheduleEvent[] {
  if (!markdown) return [];
  const blocks = markdown.split(/\n(?=###\s)/g);
  const events: ScheduleEvent[] = [];

  blocks.forEach((block) => {
    const titleMatch = block.match(/^###\s+(.+)$/m);
    if (!titleMatch) return;
    const title = titleMatch[1].trim();

    const field = (name: string) => {
      const m = block.match(new RegExp(`^-\\s*\\*\\*${name}\\*\\*:\\s*([\\s\\S]*?)(?=\\n-\\s\\*\\*|\\n###|$)`, "m"));
      const value = m?.[1]?.trim();
      return value && value.length > 0 ? value : null;
    };

    const dateTime = field("Date/Time");
    let date: string | null = null;
    let startTime: string | null = null;
    let endTime: string | null = null;
    if (dateTime) {
      const dm = dateTime.match(/(\d{4}-\d{2}-\d{2})/);
      date = dm ? dm[1] : null;
      const tm = dateTime.match(/(\d{2}:\d{2})(?::\d{2})?\s*-\s*(\d{2}:\d{2})/);
      if (tm) {
        startTime = tm[1];
        endTime = tm[2];
      } else {
        const single = dateTime.match(/\|\s*(\d{2}:\d{2})/);
        startTime = single ? single[1] : null;
      }
    }

    const note = field("Note");
    const description = field("Description");
    const venue = field("Venue");
    const leadUnit = field("Lead Unit");

    events.push({
      id: slug(title, events.length),
      title,
      date,
      startTime,
      endTime,
      venue,
      leadUnit,
      pointPerson: field("Point Person"),
      note,
      description,
      categories: detectCategories(
        [title, venue ?? "", leadUnit ?? "", description ?? ""].join(" "),
        note,
      ),
    });
  });

  return events.sort((a, b) => {
    const ad = `${a.date ?? "9999-99-99"} ${a.startTime ?? "99:99"}`;
    const bd = `${b.date ?? "9999-99-99"} ${b.startTime ?? "99:99"}`;
    return ad.localeCompare(bd);
  });
}

type CachedSchedule = { markdown: string; fetchedAt: number };

export async function readCachedSchedule(): Promise<CachedSchedule | null> {
  try {
    const cached = await get<CachedSchedule>(CACHE_KEY);
    return cached && typeof cached.markdown === "string" ? cached : null;
  } catch {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as CachedSchedule) : null;
    } catch {
      return null;
    }
  }
}

async function writeCachedSchedule(entry: CachedSchedule) {
  try {
    await set(CACHE_KEY, entry);
  } catch {
    /* ignore quota / private-mode failures */
  }
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* ignore */
  }
}

async function fetchRemoteSchedule(): Promise<string | null> {
  const { data, error } = await supabase
    .from("schedule_context")
    .select("markdown_context")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw error;
  const markdown = (data as { markdown_context: string | null } | null)?.markdown_context ?? null;
  return markdown && markdown.trim().length > 0 ? markdown : null;
}

/**
 * Stale-while-revalidate: returns the cached copy instantly when present and
 * refreshes in the background; falls back to cache when offline.
 */
export async function loadSchedule(options?: {
  onRevalidated?: (payload: SchedulePayload) => void;
}): Promise<SchedulePayload> {
  const cached = await readCachedSchedule();

  const revalidate = async () => {
    const markdown = await fetchRemoteSchedule();
    if (!markdown) return null;
    const entry = { markdown, fetchedAt: Date.now() };
    await writeCachedSchedule(entry);
    return {
      markdown,
      events: parseSchedule(markdown),
      fetchedAt: entry.fetchedAt,
      fromCache: false,
    } satisfies SchedulePayload;
  };

  if (cached) {
    void revalidate()
      .then((fresh) => {
        if (fresh && fresh.markdown !== cached.markdown) options?.onRevalidated?.(fresh);
      })
      .catch(() => undefined);

    return {
      markdown: cached.markdown,
      events: parseSchedule(cached.markdown),
      fetchedAt: cached.fetchedAt,
      fromCache: true,
    };
  }

  const fresh = await revalidate();
  if (fresh) return fresh;
  throw new Error("Wala pa'y schedule nga na-load. Sulayi pag-usab kung naa na'y signal.");
}

export function formatTime(time: string | null) {
  if (!time) return null;
  const [h, m] = time.split(":").map(Number);
  if (Number.isNaN(h)) return time;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

export function formatEventDate(date: string | null) {
  if (!date) return "Date TBA";
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
