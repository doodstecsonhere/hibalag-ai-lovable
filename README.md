# Hibalag AI

Build a mobile-first, modern web app named "Hibalag AI" for Silliman University's 125th Founders Day / Hibalag Festival (August 2026).




1. BRANDING & UI/UX:

   - Modern, sleek UI with Silliman Red (#990000 or deep crimson) accents, crisp typography, and subtle campus festive vibes.

   - Dual-pane layout on desktop (Left: Chat Interface, Right: Interactive Canvas Panel).

   - On mobile, the Canvas panel should slide up smoothly or render inline as an expandable card.

   - Top Bar: Display "Hibalag AI" logo/title with a live status pill reading "2026 Schedule Live" and a quick toggle for "Bisaya / Tagalog / English".

   - Dynamic Suggestion Chips above chat input:

     * "Unsay schedule sa Miss Silliman?"

     * "Show me all religious services"

     * "Parada Sillimaniana Details"

     * "What's happening today?"




2. SUPABASE INTEGRATION:

   - Connect to Supabase using:

     * URL: https://zfjehsrnsszxbtqvgbwq.supabase.co

     * Publishable Key: sb_publishable_sA3doXQCeX371tO-cOuYDQ_XvgupIbM

   - On page load, fetch `markdown_context` from table `schedule_context` where `id = 1`.

   - If `markdown_context` is loading or null, fall back to a clean loading state.

   - Inject this fetched markdown payload dynamically into the AI Chat System Prompt context.




3. AI CHATBOT PERSONA & BEHAVIOR:

   - Identity: "Hibalag AI", a witty, warm, approachable contemporary Bisaya-speaking digital guide for Silliman Founders Day. Sounds like a tech-savvy, friendly Sillimanian student or alum.

   - Language Logic: Speaks contemporary Cebuano/Bisaya (Urban Bisaya / English mix as spoken in Dumaguete) by default. Switches immediately to English or Tagalog if the user prompts in those languages.

   - Context Grounding: Strictly answer schedule questions using the injected Supabase schedule data.




4. CANVAS COMPONENT TRIGGER:

   - When the user asks for multi-day itineraries, event lists by category (e.g., pageants, cultural shows, worship services), or timeline breakdowns, render the formatted schedule cleanly inside the Right Canvas Panel.

   - The Canvas should support filtering by Date (Aug 1 - Aug 29, 2026) and Event Category (Featured, Religious, Alumni, Cultural, Parties).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hibalag-ai.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4ef59776-a621-42b6-a742-783e4ea51b01).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
