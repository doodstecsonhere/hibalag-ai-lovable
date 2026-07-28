## Goal
Make Hibalag AI feel like a native mobile app: single-column chat, schedule in a draggable bottom sheet, thumb-friendly targets, and edge-to-edge PWA display.

## 1. Header + navigation (`src/components/hibalag-app.tsx`)
- Rebuild the top bar as a responsive grid (`grid-cols-[auto_minmax(0,1fr)_auto]`) so it never clips at 393px.
- Mobile: hamburger icon (left, 44x44) opens the existing thread drawer; logo + "Hibalag AI" title with the live-status dot inline; right side gets a compact language toggle (Bisaya / English only on mobile via a small select or 2-chip switch — Tagalog/Auto stay available in the full toggle at `sm:` and up) and a "Schedule" pill button with a small count badge of today's/live events.
- Desktop (`lg:`) keeps the current full four-option toggle and dual-pane layout unchanged.

## 2. Canvas as a bottom sheet
- Replace the hand-rolled `translate-y-full` mobile panel with the existing shadcn `Drawer` (Vaul) in `src/components/ui/drawer.tsx` — real drag handle, swipe-to-dismiss, snap to ~90dvh.
- Keep `CanvasPanel` unchanged in content; it renders inside `DrawerContent` with its own scroll container.
- Fixed FAB chip at the bottom-right ("📅 View Schedule Canvas"), min 44px tall, sitting above the composer and respecting `env(safe-area-inset-bottom)`; it disappears while the sheet is open.
- Desktop side panel behavior is untouched.

## 3. Touch targets & scrolling
- Audit `chat-panel.tsx`, `canvas-panel.tsx`, `thread-drawer.tsx`: bump icon buttons, suggestion chips, category filters, date pills, and the send button to a minimum 44x44 (`size-11` / `min-h-11`), with larger tap padding and comfortable gaps.
- Chat composer: wrap in a sticky footer using `pb-[max(0.75rem,env(safe-area-inset-bottom))]`, textarea `min-h-11`, `text-base` (prevents iOS zoom-on-focus), and container heights on `dvh` (already partly done) so the keyboard doesn't cover it.
- Add a `smooth-scroll-y` utility in `src/styles.css` (`overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain`) applied to the sheet's event list and chat transcript.

## 4. PWA display & status bar
- `src/routes/__root.tsx`: viewport meta → `width=device-width, initial-scale=1, viewport-fit=cover`; add `apple-mobile-web-app-status-bar-style: black-translucent`; `theme-color` #990000 already present.
- Add safe-area padding tokens to the app shell so content clears the notch/home indicator.
- Manifest in `vite.config.ts` already uses #990000 theme/`standalone` — verify `background_color` matches and leave the rest as is.

## Verification
Playwright at 393x852 and 768/1280 widths: screenshot header, open the sheet, drag/dismiss it, focus the composer, and confirm no horizontal overflow or clipped text.

### Technical notes
No backend, schema, or AI-prompt changes. Work stays in `hibalag-app.tsx`, `chat-panel.tsx`, `canvas-panel.tsx`, `thread-drawer.tsx`, `styles.css`, `__root.tsx`, plus the existing Vaul-based `ui/drawer.tsx` (already installed, no new dependencies).
