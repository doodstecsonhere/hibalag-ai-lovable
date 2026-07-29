import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { fetchScheduleEvents, matchesFilters, toPlainText } from "../schedule-source";

export default defineTool({
  name: "list_events",
  title: "List festival events",
  description:
    "List public Silliman University Founders Day / Hibalag Festival events, optionally filtered by date (YYYY-MM-DD), category, or a text query.",
  inputSchema: {
    date: z.string().optional().describe("Filter to a single date, format YYYY-MM-DD (August 2026)."),
    category: z
      .string()
      .optional()
      .describe("Filter by category: Featured, Religious, Alumni, Cultural, or Parties."),
    query: z.string().optional().describe("Free-text search across title, venue, lead unit and description."),
    limit: z.number().int().optional().describe("Maximum number of events to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ date, category, query, limit }) => {
    const events = (await fetchScheduleEvents())
      .filter((e) => matchesFilters(e, { date, category, query }))
      .slice(0, Math.max(1, Math.min(limit ?? 50, 200)));

    if (events.length === 0) {
      return { content: [{ type: "text", text: "No matching events found." }] };
    }

    return {
      content: [{ type: "text", text: events.map((e) => `- ${toPlainText(e)}`).join("\n") }],
      structuredContent: { count: events.length, events },
    };
  },
});
