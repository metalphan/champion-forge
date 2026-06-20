# ADR-001: Next.js App Router as the Web Framework

**Status:** Accepted  
**Date:** 2026-06-19

## Context and Problem Statement

Champion Forge needs a web framework to host the game UI. The game is client-heavy
(real-time animation, local state machine) but will eventually need server-side features:
Supabase auth callbacks, API route protection, cron jobs for future leaderboards.

The project is also a candidate for mobile (Capacitor APK) and desktop (Tauri), so the
web layer needs to remain thin enough to wrap in a native shell.

## Decision Drivers

- Ship fast — minimal boilerplate, good defaults out of the box
- Vercel deployment in one command (target hosting platform)
- TypeScript-first with strict mode
- Strong ecosystem for auth, image optimization, and API routes
- Mobile/desktop wrappability — must produce a static-exportable or hybrid output
- Familiar to the primary developer (React ecosystem)

## Considered Options

1. **Next.js 16 App Router** (chosen)
2. **Vite + React SPA** — no server, purely static
3. **Remix** — server-first, excellent data loading patterns
4. **SvelteKit** — smaller bundle, different mental model
5. **Astro** — great for static, but poor fit for a real-time game UI

## Decision Outcome

**Chosen option: Next.js 16 App Router** — because Vercel integration is seamless,
the App Router's server components give us progressive server capability without forcing
it on the game UI, image optimization handles champion portraits automatically, and the
developer is already fluent in React.

### Consequences

**Positive:**
- `next/image` handles portrait optimization, lazy loading, and WebP conversion automatically
- Server components available when Supabase Edge Functions or auth callbacks are needed
- Vercel deploy is `vercel --prod` — zero configuration
- Security headers via `next.config.ts` `headers()` export
- Large ecosystem: Supabase client, Zustand, Tailwind all have Next.js guides

**Negative:**
- App Router has a higher learning curve than Pages Router — `"use client"` boundaries
  must be managed deliberately
- Some third-party packages assume Pages Router and need client wrappers
- Cold start on Vercel Hobby tier can be 1–2 seconds (not relevant for a game)
- Turbopack (dev mode) is faster but occasionally has HMR edge cases

**Neutral:**
- Next.js 16 is not the "stable" LTS — it includes breaking changes vs 14/15.
  `AGENTS.md` has a standing warning to read the bundled docs before coding.
- Capacitor wrapping works by pointing at the `out/` static export; requires
  `output: "export"` in `next.config.ts` when building for APK.
