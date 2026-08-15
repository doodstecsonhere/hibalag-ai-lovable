# Keep the "Install Hibalag AI" prompt showing

The manifest and icons are healthy — the app is still installable. The gap is where and when the prompt appears.

## Issues found

1. The install card is only rendered inside the chat shell (`src/components/hibalag-app.tsx`). Since the homepage became a real landing page instead of a redirect, visitors who arrive at `/` or `/schedule` never see it.
2. On iPhone/iPad, Safari never fires the `beforeinstallprompt` event, so the card can never appear there — install has to be explained ("Share → Add to Home Screen").
3. Once dismissed, the card is hidden forever (a permanent localStorage flag), with no way back.

## What to change

- Move the install prompt so it renders app-wide (root layout), so it can appear on the landing page, schedule page, and chat alike.
- Add an iOS/Safari path: when the browser can't fire the native prompt and the app isn't already installed, show the same card with short "Share → Add to Home Screen" instructions instead of the Install button.
- Make dismissal snooze for ~14 days rather than forever, and skip the card entirely when the app is already running installed.
- Keep an always-available "Install app" entry in the side drawer so users who dismissed it can still install.

## Technical notes

- Extract the prompt render out of `HibalagApp` and mount it once in `src/routes/__root.tsx` inside the existing providers (i18n provider must wrap it, since the card uses `t()`).
- Extend `useInstallPrompt` in `src/hooks/use-hibalag.ts`: add iOS detection (`navigator.standalone`, iOS/iPadOS user agent), a `mode: "native" | "ios-manual"` flag, and change the dismissed key to store a timestamp checked against a 14-day window.
- Add the iOS instruction copy to the three locales in `src/lib/i18n.ts`.
- No manifest, service worker, or `vite.config.ts` changes needed.
