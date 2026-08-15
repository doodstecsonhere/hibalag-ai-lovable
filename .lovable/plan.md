# Remove landing and schedule pages

Make the app go straight to the chat experience at `/`, drop the separate schedule page, and keep install + naming behavior intact.

## Routes

- `src/routes/index.tsx`: replace the marketing landing page with the chat app itself. It generates a new thread id and renders `HibalagApp`, so opening `/` (including the installed PWA start URL) lands directly in chat.
- `src/routes/schedule.tsx`: delete. The schedule stays available inside the app as the canvas panel / bottom sheet.
- `src/routes/chat.$threadId.tsx`: unchanged behavior for existing/shared threads.
- Remove the "View the full 2026 schedule" link and any other `/schedule` links.

## Install prompt

`InstallPrompt` is rendered inside `HibalagApp`, which now also backs `/`. Since `/` is the manifest `start_url`, the prompt keeps showing on first load. No changes to `useInstallPrompt` logic.

## Titles

- `/` head: title exactly `Hibalag AI` (already the case) — this is what installed-app/window naming uses.
- `/chat/$threadId` head: change title from `Chat — Hibalag AI` to `Hibalag AI` so no window or share surface ever shows the suffixed form.
- `vite.config.ts` manifest `name` / `short_name` stay `Hibalag AI`.

## Cleanup

- `src/routes/sitemap[.]xml.ts`: drop the `/schedule` entry, keep `/`.
- `public/llms.txt`: remove any schedule-page reference (currently only lists `/`, verify).
- `src/lib/schedule.ts` parsing helpers stay — the canvas still uses them.

## Note

`/schedule` is currently published and indexed; removing it will 404 for anyone with that link.
