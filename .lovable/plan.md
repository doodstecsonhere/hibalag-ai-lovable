# Clarify the schedule badge (not unread notifications)

The number on the calendar button in the mobile/tablet header is not a notifications counter. It is the count of events scheduled for today, computed from the live schedule data. It can never be "read away" — it changes only when the day changes or the schedule data changes.

Decision: keep showing today's count, but make it unmistakably a schedule indicator rather than an alert.

## Changes

1. Badge label
   - Give the schedule button an accessible label that states the meaning, e.g. "Open schedule canvas — 3 events today" (falls back to the plain label when there are no events today).
   - Add a `title` tooltip with the same text for pointer/tablet users.
   - Mark the badge number itself `aria-hidden` so screen readers hear the full sentence once instead of a bare number.

2. Visual tone
   - Keep the badge on the schedule button, but style it as an informational count (outline/soft variant of the brand color) instead of a solid alert dot, so it reads as "today's events" rather than "unread".

3. Localization
   - Add a new i18n key (e.g. `header.scheduleToday`: "{count} events today") in Bisaya, English, and Tagalog, used to build the label above.

## Technical notes

- `src/components/hibalag-app.tsx`: `liveCount` stays as-is; update the mobile schedule `Button` (`aria-label`, `title`, badge styling, `aria-hidden` on the span).
- `src/lib/i18n.ts`: add `header.scheduleToday` to all three locale maps.
- No data, storage, or business-logic changes.
