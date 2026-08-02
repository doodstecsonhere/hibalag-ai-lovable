## Goal
Make Hibalag AI fully usable with no connection: chat still answers (from the cached schedule), refreshing any route never hits the browser's offline error page, and the app switches back to the live AI automatically when the network returns.

## 1. Offline answer engine — `src/lib/offline-ai.ts` (new)
- Read the cached schedule markdown via the existing `readCachedSchedule()` + `parseSchedule()` in `src/lib/schedule.ts` (IndexedDB with localStorage fallback — already implemented).
- Intent/keyword matcher over parsed events:
  - normalize the query (lowercase, strip punctuation/diacritics, drop Bisaya/Tagalog/English stop words);
  - score events on title, venue, lead unit, description, category names, and date/day mentions ("today", "karon", "Aug 21", "Agosto 21", weekday names);
  - detect category intent (Featured / Religious / Alumni / Cultural / Parties) and date intent so the result can also drive canvas filters;
  - return `{ events, filters: { date, categories, query } }`, top ~6 events.
- Answer builder: composes a persona-consistent reply in the active language (Bisaya / English / Tagalog) with an offline preamble, a markdown list of matches (title, date, time, venue), and a closing nudge to the Schedule Canvas. New i18n keys added to all three dictionaries in `src/lib/i18n.ts` — no schedule text is translated.
- No-match path: friendly localized fallback pointing at the Canvas.

## 2. Chat panel behaves offline — `src/components/chat-panel.tsx`
- Composer, suggestion chips, and send button stay enabled at all times (no `online` gating).
- On submit, branch: if `navigator.onLine === false`, do **not** call `sendMessage` (so `/api/chat` is never hit). Instead append the user message and an assistant message locally to a small local message overlay, streaming the generated text in word-chunks on a timer for a live feel.
  - Implementation detail: keep a `localMessages` state merged after `useChat` messages, and reuse the existing persistence effect so offline turns are still saved to the thread store (localStorage for guests, Supabase when signed in — Supabase writes are skipped while offline and simply resume later).
- Replace the current offline banner with the subtle top strip: "⚡ Offline Mode — Answers generated from cached schedule data." (localized).
- Also handle the online-but-request-failed case by falling back to the offline answer rather than showing a dead-end error.

## 3. Canvas sync + reconnect toast — `src/components/hibalag-app.tsx`
- Pass an `onOfflineMatch(filters)` callback into `ChatPanel`; when an offline answer is produced, set the canvas `filters` state so the desktop panel and mobile bottom sheet immediately show matching events (mobile: also open the sheet if the user is on a small screen? — plan: do **not** auto-open, just update filters and let the badge/FAB reflect it, so the chat isn't covered).
- Mount `<Toaster />` (sonner) once in `src/routes/__root.tsx`; in the online-status hook (`src/hooks/use-hibalag.ts`) fire a toast "Back online! Live AI reconnected." on the `online` event only after having been offline. Live gateway resumes automatically because the branch is evaluated per-send — no reload.

## 4. Service worker / app-shell fallback — `vite.config.ts`
- Precache the app shell HTML and add `navigateFallback: "/index.html"` with `navigateFallbackAllowlist` covering `/` and `/chat/*`, keeping the existing denylist for `/~oauth`, `/api/`, `/_serverFn/`.
- Keep NetworkFirst for navigations but give it a cached-shell fallback so an offline reload of `/chat/abc` renders the app instead of the dinosaur page; keep CacheFirst for hashed same-origin assets and StaleWhileRevalidate for the `schedule_context` REST call.
- Verify the built `dist` output actually contains a precacheable HTML shell for this TanStack Start setup; if prerendering doesn't emit one, add a minimal prerendered `/` entry so the fallback has something to serve.

## Technical notes
- Nothing new is installed; `sonner`, `idb-keyval`, and `vite-plugin-pwa` are already in the project.
- The offline engine is pure client code with no network access, so it cannot leak keys or hit the gateway.
- Verification: production build + Playwright with the browser context set offline — send a query, confirm an answer renders and no `/api/chat` request is made, then reload `/chat/<id>` offline and confirm the app shell loads.
