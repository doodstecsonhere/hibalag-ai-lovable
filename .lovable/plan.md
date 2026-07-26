## Hibalag AI — Silliman 125th Founders Day guide

Mobile-first chat + schedule canvas, grounded in your Supabase `schedule_context`, speaking contemporary Dumaguete Bisaya by default. Works fully offline for schedule browsing, installable to the home screen.

### Note on your Supabase project
I can read `schedule_context` from `zfjehsrnsszxbtqvgbwq` immediately with the publishable key. But `chat_threads` / `chat_messages` and auth need changes in a project I don't manage, so I'll hand you a ready SQL script to paste into your Supabase SQL editor once, and you enable Email + Google in Auth → Providers. Guest mode works with zero setup, so the app is fully usable before you run it.

### 1. Design & branding
- Silliman Red (`#990000`) primary, deep crimson gradients, ivory/near-black surfaces, subtle festive campus motifs.
- Crisp modern type pairing; all colors as semantic tokens (light + dark).
- Generated Hibalag AI brand mark used for logo, empty state, and icons.

### 2. Layout
- **Desktop:** dual pane — chat left, Interactive Canvas right.
- **Mobile:** chat full-screen; Canvas slides up as a smooth bottom sheet plus an inline expandable card.
- **Top bar:** logo + "Hibalag AI", live pulsing "2026 Schedule Live" pill, Bisaya / Tagalog / English toggle, and a subtle "Log In" button (avatar + menu when signed in). On mobile these collapse into the drawer.
- **Suggestion chips** above the composer: "Unsay schedule sa Miss Silliman?", "Show me all religious services", "Parada Sillimaniana Details", "What's happening today?" — refreshed contextually after replies.

### 3. Schedule data + offline cache
- Fetch `markdown_context` from `schedule_context` where `id = 1` on load.
- Persist the markdown to IndexedDB with a fetched-at timestamp; on subsequent loads render the cached copy instantly, then revalidate in the background.
- Skeleton loading state on true first load; friendly fallback if null and no cache.
- Markdown feeds both the AI system prompt and the parsed event list for the Canvas.

### 4. AI persona
- "Hibalag AI": witty, warm, tech-savvy Sillimanian voice.
- Defaults to urban Cebuano/Bisaya-English mix; auto-switches to Tagalog or English from the user's message, and respects the top-bar toggle.
- Strictly grounded in the schedule data; admits gaps rather than inventing events.
- Streaming replies, markdown rendering, immediate typing indicator.

### 5. Canvas panel
- Triggered when the user asks for itineraries, category lists, or timelines; the assistant emits a structured view into the Canvas alongside its chat reply.
- Date filter across Aug 1–29, 2026 (scrollable day strip) + category filters: Featured, Religious, Alumni, Cultural, Parties.
- Event cards with time, venue, category badge, "Today" quick jump.
- Fully functional offline from the cached markdown.

### 6. Optional auth + thread history
- **Guest (default, no login):** threads saved in `localStorage`, thread list and `/chat/:threadId` URLs work identically.
- **Signed in (Email/password or Google):** threads and messages save to `chat_threads` / `chat_messages`, scoped by RLS to the user.
- Thread drawer with list, "New chat", rename, delete. Reloading `/chat/:threadId` restores that exact conversation in either mode.
- On first sign-in, offer to migrate existing local threads into the account.

### 7. Offline behavior
- When the network is down: banner reading "Offline ka karon, bay! Showing cached schedule..." (localized to the active language), chat composer disabled with a clear reason, Canvas and schedule browsing fully usable.
- Queued message is preserved and re-enabled when connectivity returns.

### 8. PWA install + icons
- Installable PWA with offline app-shell caching (network-first for pages, cache-first for hashed assets, stale-while-revalidate for the schedule data), generated through the standard Vite PWA tooling and disabled inside the Lovable preview iframe so previews never serve stale builds.
- Custom install banner: intercepts `beforeinstallprompt`, shows "Install Hibalag AI on your Home Screen for instant offline access to Silliman Founders Week!" with an "Install App" button and a dismiss that is remembered. iOS gets tailored "Share → Add to Home Screen" instructions since it has no prompt event.
- `manifest.webmanifest` with name, short name, theme/background colors, `standalone`, and:
  - `/icon-192.png` (192×192, `any`)
  - `/icon-512.png` (512×512, `any`)
  - `/maskable-icon-512.png` (512×512, `maskable`, with safe-area padding)
  - `/apple-touch-icon.png` (180×180)
  - SVG favicon for high-DPI desktop, replacing the default favicon.

### Technical notes
- TanStack Start; chat streams from a server route via the Lovable AI Gateway (key stays server-side).
- Publishable Supabase key is safe in client code; the schedule read goes through a cached server function with the client-side IndexedDB layer in front.
- A single storage adapter abstracts guest-vs-account thread persistence so the UI is identical either way.
- AI Elements for transcript, composer, and streaming states.

### Sequence
1. Design system, layout shell, top bar, suggestion chips.
2. Supabase schedule fetch + IndexedDB cache + offline banner.
3. Chat streaming, Hibalag AI persona, language logic.
4. Canvas with date/category filters and mobile bottom sheet.
5. Guest thread storage + `/chat/:threadId` routing.
6. PWA manifest, icons, offline caching, custom install prompt.
7. Optional Supabase auth + cloud thread sync (after you run the SQL script).
