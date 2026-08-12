# Brand name cleanup: "Hibalag AI"

Make "Hibalag AI" the single app name everywhere, dropping taglines and suffixes from install/app-name surfaces, while keeping subpage titles search-friendly.

## Manifest / PWA

In `vite.config.ts` (the manifest is generated there, there is no static `manifest.webmanifest` file):
- `name`: "Hibalag AI" (currently "Hibalag AI — Silliman Founders Day 2026")
- `short_name`: "Hibalag AI" (unchanged)
- `description` stays as-is; only the name fields change.

This controls the installed app icon label and splash title.

## Titles and social tags

There is no `index.html` in this stack — head tags live in route `head()` options.

- Homepage (`src/routes/index.tsx`): title, `og:title`, `twitter:title` become exactly "Hibalag AI".
- Schedule (`src/routes/schedule.tsx`): "Schedule — Hibalag AI".
- Chat (`src/routes/chat.$threadId.tsx`): "Chat — Hibalag AI".
- `src/routes/__root.tsx`: keeps sitewide-only tags; `apple-mobile-web-app-title` already reads "Hibalag AI".

Descriptions stay unique per page so the recently fixed SEO findings keep passing.

## In-app branding check

Confirm the header, thread drawer, and the custom install prompt all show "Hibalag AI" with no tagline — including the i18n strings in `src/lib/i18n.ts` used by the install prompt title. Adjust any that append extra wording.

## Note

Installed PWAs cache the manifest name at install time, so existing installs may keep the old label until reinstalled.
