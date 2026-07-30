## Goal

Every piece of interface text in Hibalag AI switches instantly between Bisaya, English, and Tagalog, the mobile toggle offers all three, and the AI answers in the selected language. Fetched schedule content stays untouched.

## 1. Translation layer

New `src/lib/i18n.ts`:
- A typed dictionary `translations: Record<Language, Record<TranslationKey, string>>` where keys are derived from the Bisaya dictionary, so a missing key in English/Tagalog is a compile error.
- Supports simple interpolation (`{count}`, `{name}`) for strings like "3 events · Aug 1–29, 2026" and "You have {count} guest chats".
- `Language` type narrows to `"bisaya" | "english" | "tagalog"`. The current `"auto"` option is dropped — the toggle now always states an explicit language (stored value `auto` migrates to `bisaya` on read).

New `src/lib/i18n-context.tsx`:
- `LanguageProvider` holding the active language (persisted in `localStorage` under the existing `hibalag:language` key) plus a `useI18n()` hook returning `{ language, setLanguage, t }`.
- Provider mounted in `src/components/hibalag-app.tsx` around the whole app shell, so a toggle change re-renders every consumer immediately.
- `useLanguage` in `src/hooks/use-hibalag.ts` becomes a thin re-export of the context hook so existing call sites keep working.

## 2. Strings to translate

All hardcoded copy moves to dictionary keys in these files:
- `hibalag-app.tsx` — status pill ("Active" / "Offline mode" / "Synced"), menu and schedule button aria-labels, floating "View Schedule Canvas" chip, drawer titles.
- `chat-panel.tsx` — welcome heading and intro paragraph, offline banner, typing indicator, error line, composer placeholder, send aria-label, and the five suggestion chips (each written natively per language, not machine-translated).
- `canvas-panel.tsx` — "Schedule Canvas" heading, event count line, "Offline copy", search placeholder, "All days" / "Aug N" day chips, category filter labels, empty-filter and error states, retry button, footer badge.
- `thread-drawer.tsx` — "Mga chat", "Bag-ong chat", empty history line, guest-sync prompt and button, rename/delete/save aria-labels, "Log in (optional)" / "Log out".
- `auth-dialog.tsx` and `install-prompt.tsx` — titles, descriptions, buttons, validation and error messages.

**Schedule data exception:** category *filter labels* are translated for display only via a lookup keyed by the canonical English `Category` value; the underlying `Category` union, filter/matching logic in `src/lib/schedule.ts`, and every event title, time, venue, lead unit, and description render exactly as parsed from Supabase. Date headers keep using `formatEventDate` (locale-neutral English month names) so they match the source data.

## 3. Mobile language selector

- Remove the `mobile: boolean` flag and the `hidden sm:block` conditional in `hibalag-app.tsx` that hides Tagalog under 768px.
- Replace with a compact 3-way segmented pill (`Bis` / `Eng` / `Tag` short labels under `sm`, full names from `sm` up), each segment ≥44px tall with a 44px minimum hit area, `aria-pressed` on the active option.
- Header grid stays `auto / 1fr / auto`; the title column already has `min-w-0 truncate`, and the segmented control gets `shrink-0` plus tightened padding so the header holds at 360px without clipping. Verified with Playwright at 360px and 393px.

## 4. AI system prompt sync

- `chat-panel.tsx` already sends `language` in the transport body; the transport is recreated on language change so the new value is sent from the very next message.
- In `src/routes/api/chat.ts`, drop the `auto` branch from `languageRule` and make each of the three explicit rules stronger: Bisaya = contemporary Dumaguete Bisaya-English mix, English = warm casual English, Tagalog = conversational Taglish — always overriding the language the user typed in. The persona, grounding rules, and schedule injection are unchanged.
- Also localize the assistant's UI-facing pointer ("full breakdown is in the Canvas panel") wording per language inside the prompt.

## Verification

Playwright run at 360px and 393px: switch through all three languages, confirm header, chat empty state, suggestion chips, drawer, and bottom-sheet canvas all change text, no horizontal overflow, and event card content stays identical across languages.
