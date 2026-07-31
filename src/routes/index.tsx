import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { newId } from "@/lib/threads";

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
      { property: "og:url", content: "https://hibalag-ai.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const navigate = useNavigate();

  useEffect(() => {
    void navigate({
      to: "/chat/$threadId",
      params: { threadId: newId() },
      replace: true,
    });
  }, [navigate]);

  return (
    <div className="flex h-dvh items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Gi-andam ang Hibalag AI…</p>
    </div>
  );
}
