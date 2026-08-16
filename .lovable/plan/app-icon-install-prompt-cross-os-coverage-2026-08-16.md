# App-icon install prompt + cross-OS coverage

Make the custom install prompt show the real Hibalag AI app icon, and ensure a prompt actually appears on every OS that can install a PWA — including iOS Safari, which never fires the native `beforeinstallprompt` event.

## 1. App icon in the prompt

`src/components/install-prompt.tsx` currently renders a generic lucide `Smartphone` glyph inside a crimson-gradient square. Replace that square with the real app icon image:

- Use `/icon-192.png` (already referenced by the manifest) as an `<img>` sized to match the current `size-11` box (`44px`), with `rounded-2xl` and the same shrink-0 layout.
- Keep `alt=""` (decorative; the heading already names the app) and `decoding="async"`.
- Drop the now-unused `Smartphone` import; keep `Download` and `X`.

## 2. Detect installability per platform

`src/hooks/use-hibalag.ts` — `useInstallPrompt` today only reacts to `beforeinstallprompt`, so iOS Safari (which supports Add to Home Screen but never fires that event) never shows anything. Extend it to detect the platform and expose a `platform` value:

- `platform: "native"` — a `beforeinstallprompt` event was captured (Android Chrome, Edge desktop, etc.). Use the native `deferred.prompt()` flow.
- `platform: "ios"` — iOS Safari. Detect with a user-agent check (`/iPhone|iPad|iPod/i`) combined with `!window.MSStream` and not already in standalone mode. There is no programmatic install; show manual instructions.
- `platform: null` — not installable or already installed.

Keep the existing `installed` (standalone display-mode) guard so the prompt never shows after install. Keep `dismissed`/`dismiss()` but switch it from a permanent flag to a **14-day snooze** so the prompt resurfaces for users who deferred it (per the earlier-approved install work). Store an ISO timestamp in `hibalag:install-dismissed` and treat it as dismissed only if it's less than 14 days old.

Expose:
- `platform` (as above)
- `canInstall`: `platform !== null && !installed` (replace the old `Boolean(deferred)` check)
- `shouldPrompt`: `canInstall && !dismissed`

## 3. Manual iOS install instructions

When `platform === "ios"`, the prompt cannot call `deferred.prompt()`. Instead show a short step-by-step in the existing prompt card:

- Title and body stay, but the body for iOS is a localized instruction: tap **Share**, then **Add to Home Screen**.
- The primary button on iOS becomes a **"Got it"** dismiss (no `Download` icon, no programmatic install) — there is nothing to trigger.
- The `onInstall` callback from the app shell already no-ops gracefully when `deferred` is null, but for iOS we want the button to just close the prompt, so pass a platform-aware install handler from the shell: native → `install.install()`, ios → `dismiss()`.

Add two i18n keys per language in `src/lib/i18n.ts`:
- `install.iosBody` — the Share → Add to Home Screen instruction.
- `install.gotIt` — the iOS dismiss button label.

Keep the existing `install.title`, `install.body`, `install.action`, `install.later`, `install.dismiss` for the native path.

## 4. Wire the shell

`src/components/hibalag-app.tsx` — the `<InstallPrompt>` call currently passes `open={install.shouldPrompt}` and a single `onInstall`. Update it to pass `platform` through so the prompt can pick the right copy and button:

- `open={install.shouldPrompt}`
- `platform={install.platform}`
- `onInstall={() => (install.platform === "native" ? void install.install() : install.dismiss())}`
- `onDismiss={install.dismiss}` (unchanged)

No other shell changes are needed; the prompt already renders above everything via `z-50`.

## 5. What does NOT change

- Manifest, icons, and head tags are already correct (`vite.config.ts` manifest uses `icon-192.png`, `icon-512.png`, `maskable-icon-512.png`, `apple-touch-icon.png`; `__root.tsx` links them). No manifest edits.
- Service worker / offline behavior untouched.
- The drawer does not get a permanent "Install app" entry in this change — the floating prompt already covers all installable OSes once iOS detection lands. (Can be added later if the user wants a manual re-trigger.)

## Verification

- Build passes.
- On desktop Chrome/Edge preview, `beforeinstallprompt` is suppressed inside the Lovable preview iframe, so the prompt won't fire there — that's expected; native behavior is confirmed on a real published Android/desktop Chrome session.
- iOS detection is unit-checkable: an iPhone user-agent in non-standalone mode yields `platform: "ios"` and the instruction card with a "Got it" button.
