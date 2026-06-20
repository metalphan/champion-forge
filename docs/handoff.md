# Champion Forge — Handoff & Current State

_Read this alongside `AGENTS.md` at the start of every new session._
_Last updated: 2026-06-20 (session 4 — portrait art direction fork)_

---

## Current version

| Field | Value |
|-------|-------|
| `package.json` version | `0.1.0` |
| GitHub repo | https://github.com/metalphan/champion-forge |
| Deployed URL | Not yet deployed |
| Next version | `0.2.0` (after Vercel deploy + PWA icons) |

---

## Feature status

| Feature | Status | Notes |
|---------|--------|-------|
| Zone select (4 zones) | ✅ Working | Ember Wastes, Glacial Depths, Storm Citadel, Ancient Roots |
| Draft screen | ✅ Working | 6-champion pool, synergy preview updates live |
| Auto-battle combat | ✅ Working | SPD-ordered, status effects, counter-affinity, synergy bonuses |
| Animated combat log | ✅ Working | 180ms/entry, Skip button, colored by entry type |
| Live HP bars | ✅ Working | Replays log entries to compute displayed HP |
| Reward screen | ✅ Working | 3 options: new champion or stat boost |
| Squad select | ✅ Working | On retry and after champion reward; pre-selects active team |
| Game over / retry | ✅ Working | Retry Floor (squad swap) or Abandon Run |
| Victory screen | ✅ Working | Shows zone, floor, Shards earned |
| Meta perk shop | ✅ Working | 5 perks, currency persistence in localStorage |
| AI portraits (Flux Schnell) | ✅ On main | 16 PNGs in `public/champions/`, wired to ChampionCard |
| AI portraits (Flux Pro Ultra) | 🔄 Branch | `feat/portrait-upgrade` (PR #4 open) — upgraded quality, more revealing designs |
| 4-view portrait system | 🔄 Branch | `portraits/suggestive` — generate-previews.ts, Pyrewing preview awaiting approval |
| ChampionCard Tier 2 | ✅ On main | Portrait + gradient overlay + stats panel |
| PWA manifest | ✅ On main | `public/manifest.json` — active once deployed to Vercel |
| Security headers | ✅ On main | `next.config.ts` — active once deployed to Vercel |
| Vitest suite | ✅ 48/48 passing | Engine + data coverage at 80%+ threshold |
| Engineering docs | ✅ On main | ADRs, DoD, PR template, Runbook, Schema, .env.example |
| PWA icons | ❌ Missing | manifest.json references `/icons/192.png` + `/icons/512.png` — files don't exist yet |
| Vercel deploy | ❌ Not done | Phase 1 |
| Supabase integration | ❌ Not done | Phase 1 |
| Capacitor APK | ❌ Not done | Phase 4 |
| Manual combat mode | ❌ Not done | Phase 6 |

---

## Recent changes

### 2026-06-20 (session 4) — Portrait art direction fork

- **Two long-lived art branches created:**
  - `portraits/standard` — branched from `main`; original Flux Schnell portraits, tasteful designs
  - `portraits/suggestive` — branched from `feat/portrait-upgrade`; Flux Pro Ultra, explicit/revealing designs
- **`scripts/generate-previews.ts`** — new script generating 4 views of one champion
  (front, left ¾, right ¾, back) as approval preview before committing to full 16×4 run
- **Pyrewing 4-view preview generated** (v4, awaiting approval) in `public/champions/previews/`
  - Consistency fix: ¾ angles instead of strict side profile; face anchored as human woman
  - Auburn-red hair locked across all 4 views
  - More revealing/titillating poses and coverage per user direction
- **`feat/portrait-upgrade` PR (#4)** — still open; Flux Pro Ultra upgrade for all 16 champions
- User has NOT yet approved Pyrewing previews for full batch generation

### 2026-06-19 (session 3) — Cross-tool AI workflow + session close

- **`/pm-init` and `/pm-review` skills** deployed to all four AI coding tools:
  Claude Code, Cursor, Antigravity, and Codex
- **Master sync system** created at `~/.ai-rules/` — one source of truth for PM
  workflow skills, propagated via `~/.ai-rules/sync.ps1`
- **Propagation rules** added to every tool's config (CLAUDE.md, Cursor `.mdc` rule,
  Antigravity skill, Codex `instructions.md`) — any AI in any tool knows to edit
  the master and run sync.ps1, never the tool-specific copies
- **PR #2 merged** — portraits, Tier 2 ChampionCard, PWA manifest, security headers,
  AGENTS.md, all engineering docs now on `main`
- Resolved all "not on main yet" known issues from session 2

### 2026-06-20 (session 2) — Engineering standards: ADRs, DoD, PR template, Runbook, Schema, .env.example

- **7 ADRs** in `docs/decisions/`: Next.js, Zustand, phased persistence, auto-battle,
  Mulberry32 PRNG, fal.ai portraits, no-permadeath
- **Definition of Done** added to `AGENTS.md`
- **PR Template** at `.github/PULL_REQUEST_TEMPLATE.md`
- **Runbook** at `docs/RUNBOOK.md` — 10 step-by-step procedures
- **Schema doc** at `docs/SCHEMA.md`
- **`.env.example`** committed with placeholder values

### 2026-06-20 — AI portraits + Tier 2 ChampionCard + docs

- 16 AI portraits via fal.ai Flux Schnell (`scripts/generate-art.ts`)
- ChampionCard Tier 2: 3:4 portrait, gradient name overlay, dark stats panel
- AGENTS.md, handoff.md, ARCHITECTURE, GAME_DESIGN, TESTING, CHANGELOG, ROADMAP
- PWA manifest, Viewport export, security headers

### 2026-06-19 — Full game loop + test suite (PR #1, merged)

- Complete roguelike loop: zone select → draft → combat → reward → retry/advance
- 4 dungeon zones, auto-battle engine, status effects, synergy bonuses
- Tier 1 visuals, Zustand FSM, localStorage persistence
- Vitest: 48 tests, 80% engine coverage threshold

---

## Open PRs / branches

| Branch | Status | Notes |
|--------|--------|-------|
| `feat/portrait-upgrade` | Open (PR #4) | Flux Pro Ultra upgrade for all 16 champions; not yet merged |
| `portraits/standard` | Long-lived | Art direction branch — tasteful/general audience |
| `portraits/suggestive` | Long-lived | Art direction branch — explicit/revealing; awaiting Pyrewing approval |

---

## Known issues

- **Nested button HTML warning**: RewardScreen wraps a `<button>` around a ChampionCard
  that sometimes renders as `<button>`. The `Tag = onClick ? "button" : "div"` fix is in
  place but there may still be hydration warnings in dev mode. Not broken, just noisy.
- **fal.ai rate limiting**: Art generator gets intermittent 403s — re-run `npm run generate-art`,
  it skips already-generated files.
- **PWA icons missing**: `public/manifest.json` references `/icons/192.png` and `/icons/512.png`
  — these files don't exist yet. PWA install will fail until they're generated.

---

## Next steps (prioritized)

1. **Approve Pyrewing previews** — view `public/champions/previews/` (4 views), confirm direction,
   then run `npm run generate-art` on `portraits/suggestive` for full 16×4 batch (~$3.84)
2. **PWA icons** — generate 192×192 and 512×512 PNGs in `public/icons/`
   (use a champion portrait crop or a custom logo; required before Vercel deploy activates PWA)
2. **Vercel deploy** — `vercel --prod` from main; makes the game publicly accessible,
   activates PWA manifest and security headers
3. **Supabase wiring** — create project, schema (`profiles` + `runs` tables per `docs/SCHEMA.md`),
   RLS policies, Supabase Auth, replace localStorage with cloud save
4. **Capacitor APK** — wrap the Vercel-deployed web app for Android (Phase 4)
5. **WinUI / Electron** — desktop wrapper if desired alongside the APK (Phase 4)

---

## Environment & credentials

| Secret | Where | Notes |
|--------|-------|-------|
| `FAL_KEY` | `.env.local` (git-ignored) | fal.ai API key for art generation |
| Supabase URL + anon key | Not yet created | Phase 1 — create at supabase.com |
| Vercel | Not yet configured | Phase 1 — `vercel link` then `vercel --prod` |

**Accounts:** GitHub `metalphan` · fal.ai `metalphan@gmail.com`

---

## For the next AI session

1. Read `AGENTS.md` and this file first
2. Run `npm test` — confirm 48/48 before touching anything
3. Active branches: `portraits/suggestive` (explicit art), `portraits/standard` (tasteful), `feat/portrait-upgrade` (PR #4 open)
4. First real task: approve or adjust Pyrewing previews → run full 16-champion batch on `portraits/suggestive`
5. After your session: update this file's "Last updated" date and add to "Recent changes"
