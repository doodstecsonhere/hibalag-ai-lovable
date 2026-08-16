import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { HibalagApp } from "@/components/hibalag-app";
import { newId } from "@/lib/threads";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hibalag AI" },
      {
        name: "description",
        content:
          "Ask Hibalag AI about Silliman University's Founders Week and Hibalag Festival schedule on August — in Bisaya, Tagalog, English, etc.",
      },
      { property: "og:title", content: "Hibalag AI" },
      {
        property: "og:description",
        content:
          "Ask Hibalag AI about Silliman University's Founders Week and Hibalag Festival schedule on August — in Bisaya, Tagalog, English, etc.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hibalag-ai.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hibalag AI" },
      {
        name: "twitter:description",
        content:
          "Ask Hibalag AI about Silliman University's Founders Week and Hibalag Festival schedule on August — in Bisaya, Tagalog, English, etc.",
      },
    ],
    links: [{ rel: "canonical", href: "https://hibalag-ai.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Festival",
          name: "Silliman University Founders Week & Hibalag Festival 2026",
          startDate: "2026-08-01",
          endDate: "2026-08-29",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          description:
            "Silliman University's Founders Day celebration and Hibalag Festival — parades, religious services, alumni homecoming, cultural shows, and parties across August 2026.",
          location: {
            "@type": "Place",
            name: "Silliman University",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Dumaguete City",
              addressRegion: "Negros Oriental",
              addressCountry: "PH",
            },
          },
          organizer: {
            "@type": "Organization",
            name: "Silliman University",
            url: "https://su.edu.ph/",
          },
          url: "https://hibalag-ai.lovable.app/",
        }),
      },
    ],
  }),
  component: HibalagIndex,
});

function HibalagIndex() {
  const threadId = newId();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6 py-12">
      <main className="max-w-xl space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Hibalag AI: Silliman University Founders Week Guide
        </h1>
        <p className="whitespace-pre-line text-base text-muted-foreground">
          Hibalag AI is your witty Bisaya-speaking guide to Silliman University&apos;s Founders Week
          and Hibalag Festival in Dumaguete City this August.{"\n"}
          Ask about the parade, Miss Silliman, worship services, alumni homecoming, cultural shows,
          open houses, etc.
        </p>
        <p className="text-sm text-muted-foreground">
          Browse the full schedule canvas by date and category, plan a day-by-day itinerary, and
          chat in Bisaya, Tagalog, or English — even offline.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/chat/$threadId"
            params={{ threadId }}
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground"
          >
            Start chatting with Hibalag AI
          </Link>
          <Link
            to="/schedule"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-6 text-sm font-medium text-foreground"
          >
            View the full 2026 schedule
          </Link>
        </div>
      </main>
    </div>
  );
}
