import { createFileRoute, Link } from "@tanstack/react-router";

import { formatEventDate, formatTime, parseSchedule, type ScheduleEvent } from "@/lib/schedule";
import { supabase } from "@/lib/supabase";

const CANONICAL = "https://hibalag-ai.lovable.app/schedule";
const TITLE = "Silliman Founders Day & Hibalag Festival 2026 Schedule";
const META_TITLE = "Hibalag Festival 2026 Schedule · Hibalag AI";
const DESCRIPTION =
  "August 2026 Silliman Founders Day and Hibalag Festival schedule in Dumaguete: parade, Miss Silliman, worship, alumni homecoming, and cultural shows.";

export const Route = createFileRoute("/schedule")({
  loader: async () => {
    const { data } = await supabase
      .from("schedule_context")
      .select("markdown_context")
      .eq("id", 1)
      .maybeSingle();
    const markdown = (data?.markdown_context as string | undefined) ?? "";
    return { events: parseSchedule(markdown) };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${TITLE} · Hibalag AI` },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: TITLE,
          url: CANONICAL,
          itemListElement: (loaderData?.events ?? []).slice(0, 50).map((event, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Event",
              name: event.title,
              startDate:
                event.date && event.startTime
                  ? `${event.date}T${event.startTime}:00+08:00`
                  : (event.date ?? undefined),
              eventStatus: "https://schema.org/EventScheduled",
              eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
              location: {
                "@type": "Place",
                name: event.venue ?? "Silliman University",
                address: {
                  "@type": "PostalAddress",
                  addressLocality: "Dumaguete City",
                  addressRegion: "Negros Oriental",
                  addressCountry: "PH",
                },
              },
            },
          })),
        }),
      },
    ],
  }),
  component: SchedulePage,
});

function groupByDate(events: ScheduleEvent[]) {
  const groups = new Map<string, ScheduleEvent[]>();
  for (const event of events) {
    const key = event.date ?? "TBA";
    const bucket = groups.get(key);
    if (bucket) bucket.push(event);
    else groups.set(key, [event]);
  }
  return [...groups.entries()];
}

function SchedulePage() {
  const { events } = Route.useLoaderData();
  const groups = groupByDate(events);

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{TITLE}</h1>
      <p className="mt-3 text-base text-muted-foreground">{DESCRIPTION}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Need help planning your days?{" "}
        <Link to="/" className="font-medium text-primary underline underline-offset-4">
          Ask Hibalag AI
        </Link>{" "}
        for an itinerary in Bisaya, Tagalog, or English.
      </p>

      {events.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">
          Wala pa ma-load ang schedule. Sulayi pag-refresh o pangutan-a si Hibalag AI.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map(([date, dayEvents]) => (
            <section key={date}>
              <h2 className="text-lg font-semibold text-foreground">
                {date === "TBA" ? "Date TBA" : formatEventDate(date)}
              </h2>
              <ul className="mt-3 space-y-3">
                {dayEvents.map((event) => (
                  <li key={event.id} className="rounded-xl border border-border/70 p-4">
                    <h3 className="text-base font-medium text-foreground">{event.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[
                        formatTime(event.startTime),
                        event.venue,
                        event.leadUnit,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {event.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>
                    ) : null}
                    {event.categories.length > 0 ? (
                      <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {event.categories.join(" · ")}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
