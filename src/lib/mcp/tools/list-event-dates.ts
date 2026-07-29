import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { fetchScheduleEvents } from "../schedule-source";

export default defineTool({
  name: "list_event_dates",
  title: "List festival dates",
  description:
    "List every public festival date with how many events happen on it, plus the categories present that day.",
  inputSchema: { _unused: z.string().optional().describe("Not used.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const events = await fetchScheduleEvents();
    const byDate = new Map<string, { date: string; count: number; categories: Set<string> }>();
    for (const e of events) {
      const key = e.date ?? "TBA";
      const entry = byDate.get(key) ?? { date: key, count: 0, categories: new Set<string>() };
      entry.count += 1;
      e.categories.forEach((c) => entry.categories.add(c));
      byDate.set(key, entry);
    }
    const dates = [...byDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ date: d.date, count: d.count, categories: [...d.categories] }));

    return {
      content: [
        {
          type: "text",
          text: dates.map((d) => `${d.date} — ${d.count} event(s)${d.categories.length ? ` (${d.categories.join(", ")})` : ""}`).join("\n"),
        },
      ],
      structuredContent: { dates },
    };
  },
});
