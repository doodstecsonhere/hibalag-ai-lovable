# Make the Canvas event-count date range dynamic

## Problem
The Schedule Canvas header shows `"{count} events · Aug 1–29, 2026"`. The `{count}` is already dynamic (it's `visible.length` from the live-parsed schedule), so it updates when n8n pushes new `markdown_context` to Supabase. But the date range `Aug 1–29, 2026` is hardcoded inside the i18n string `canvas.count` for all three languages, so it never updates if the festival dates change.

## Goal
Compute the date range from the actual parsed events so it updates automatically alongside the count when n8n changes the schedule.

## Changes

### 1. `src/lib/i18n.ts` — templating only
Change the `canvas.count` string in **all three** languages (bisaya, english, tagalog) from:
```
"{count} events · Aug 1–29, 2026"
```
to:
```
"{count} events · {range}"
```
(The existing `translate()` already substitutes `{name}` vars, so `{range}` works with no helper changes.)

Add localized short month-name maps for the 12 months per language (Bisaya/Tagalog use `Ago` for August; English uses `Aug`), exposed from `i18n.ts` so the Canvas can format a date range in the active language.

### 2. `src/components/canvas-panel.tsx` — compute + pass range
- Add a `useMemo` that derives the festival span from the **full `events` array** (not the filtered `visible`), so the range always reflects the true festival period even when a filter is active:
  - `min` = earliest `event.date`, `max` = latest `event.date` (ignore `null` dates).
  - Format as `Mon D–D, YYYY` when same month, or `Mon D – Mon D, YYYY` across months, using the active language's month names.
  - If no events have dates, fall back to a localized "Dates TBA" string.
- Pass the result as the `{range}` var into `t("canvas.count", { count: visible.length, range })`.

## Behavior after the change
- n8n adds/removes events → count updates (already worked) **and** the date range updates from the new min/max dates.
- Switching the language toggle re-localizes both the count word and the month abbreviations.
- No data-model, Supabase, or service-worker changes needed.

## Out of scope
- Changing `{count}` from filtered to total (not requested; filtered count is intentional UX).
- The standalone `/schedule` page (already server-rendered from live data, no hardcoded range).
