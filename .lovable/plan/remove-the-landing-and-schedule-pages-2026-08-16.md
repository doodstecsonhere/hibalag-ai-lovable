# Remove the landing and schedule pages

Make `/` open the chat app directly, and drop the standalone schedule page — the schedule already lives inside the app's canvas panel.

## Routes

- `src/routes/index.tsx`: replace the static landing content with the chat app itself. It creates a fresh thread id on load and renders the same component `/chat/$threadId` uses, so there is no extra click and no redirect.
- `src/routes/schedule.tsx`: deleted. Its Supabase fetch and event list duplicate the canvas panel.
- `src/routes/chat.$threadId.tsx`: unchanged, so existing thread links keep working.

## PWA title

- The manifest already uses exactly "Hibalag AI" (name and short name), so the installed icon label stays correct.
- `/` gets the plain title "Hibalag AI" — since the app now lives at `/`, the installed app opens on that title instead of "Chat — Hibalag AI".
- `/chat/<id>` keeps "Chat — Hibalag AI" for shared/bookmarked threads.

## Install prompt

The custom install modal lives inside the app component, which now renders at `/` — the PWA start URL. So it shows on the first screen every visitor and every installed launch sees. No change to the prompt logic itself.

## Offline

- Nothing changes in the service worker strategy: navigations stay network-first with an app-shell fallback, assets cache-first, schedule data stale-while-revalidate.
- The offline answer engine and cached schedule are untouched.
- One clean-up: the removed `/schedule` route is dropped from `sitemap.xml` so crawlers stop being pointed at a 404. `llms.txt` already lists only `/` and `/mcp`.

## Content check

The landing copy (H1 and description) currently gives `/` its indexable text. When the chat app takes over `/`, the app's existing visible heading and intro text carry that role, and `/` keeps its unique title, description, social tags, canonical, and Festival JSON-LD so the recently fixed SEO findings keep passing.
