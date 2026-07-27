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
      { name: "twitter:card", content: "summary_large_image" },
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
