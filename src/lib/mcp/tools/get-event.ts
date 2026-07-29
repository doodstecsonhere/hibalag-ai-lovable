import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

import { fetchScheduleEvents } from "../schedule-source";

export default defineTool({
  name: "get_event",
  title: "Get event details",
  description:
    "Get the full public details of one Hibalag Festival event by its id (from list_events) or by an exact/partial title match.",
  inputSchema: {
    id: z.string().optional().describe("Event id returned by list_events."),
    title: z.string().optional().describe("Full or partial event title."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, title }) => {
    if (!id && !title) {
      return { content: [{ type: "text", text: "Provide either an id or a title." }], isError: true };
    }
    const events = await fetchScheduleEvents();
    const event =
      (id ? events.find((e) => e.id === id) : undefined) ??
      (title ? events.find((e) => e.title.toLowerCase().includes(title.toLowerCase())) : undefined);

    if (!event) return { content: [{ type: "text", text: "Event not found." }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(event, null, 2) }],
      structuredContent: { event },
    };
  },
});
