import { defineMcp } from "@lovable.dev/mcp-js";

import getEventTool from "./tools/get-event";
import listEventDatesTool from "./tools/list-event-dates";
import listEventsTool from "./tools/list-events";

export default defineMcp({
  name: "hibalag-ai-mcp",
  title: "Hibalag AI",
  version: "0.1.0",
  instructions:
    "Public tools for the Silliman University Founders Day / Hibalag Festival schedule (August 2026). Use `list_event_dates` to see which days have events, `list_events` to browse or filter by date, category (Featured, Religious, Alumni, Cultural, Parties) or text, and `get_event` for full details of one event.",
  tools: [listEventsTool, getEventTool, listEventDatesTool],
});
