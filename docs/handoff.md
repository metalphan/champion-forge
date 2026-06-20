# Champion Forge — Handoff & Current State

_Read this alongside `AGENTS.md` at the start of every new session._
_Last updated: 2026-06-20 (session 2)_

---

## Current version

| Field | Value |
|-------|-------|
| `package.json` version | `0.1.0` |
| GitHub repo | https://github.com/metalphan/champion-forge |
| Deployed URL | Not yet deployed |
| Next version | `0.2.0` (after Vercel deploy + PWA) |

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
| AI portraits | ✅ Complete | 16 PNGs generated via fal.ai Flux, wired to ChampionCard |
| ChampionCard Tier 2 | ✅ Complete | Portrait + gradient overlay + stats panel |
| PWA manifest | ✅ In code | `public/manifest.json` — not live until Vercel deploy |
| Security headers | ✅ In code | `next.config.ts` — not live until Vercel deploy |
| Vitest suite | ✅ 48/48 passing | Engine + data coverage at 80%+ threshold |
| Vercel deploy | ❌ Not done | Phase 1 |
| Supabase integration | ❌ Not done | Phase 1 |
| Capacitor APK | ❌ Not done | Phase 4 |
| Manual combat mode | ❌ Not done | Phase 6 |

---

## Recent changes

### 2026-06-20 (session 2) — Engineering standards: ADRs, DoD, PR template, Runbook, Schema, .env.example

- **7 ADRs** written in `docs/decisions/` covering all major decisions to date:
  Next.js, Zustand, phased persistence, auto-battle, Mulberry32 PRNG, fal.ai portraits, no-permadeath
- **Definition of Done** added to `AGENTS.md` — explicit checklist with code quality,
  testing, documentation, security, UI, and PR criteria
- **PR Template** at `.github/PULL_REQUEST_TEMPLATE.md` — auto-populates every PR with
  type-of-change, test plan, DoD checklist, security, screenshots section
- **Runbook** at `docs/RUNBOOK.md` — 10 step-by-step operational procedures:
  dev setup, daily dev, tests, art generation, Vercel deploy, rollback, PR workflow,
  DB migrations, secret rotation, troubleshooting table
- **Schema doc** at `docs/SCHEMA.md` — MetaState (localStorage), RunState (in-memory),
  planned Supabase tables (profiles + runs) with RLS policy intent, field glossary,
  perk/zone ID reference tables, migration conventions
- **`.env.example`** committed — placeholder values for all env vars with comments
  explaining where to find real values; references 12factor.net config principles

### 2026-06-20 — AI portraits + Tier 2 ChampionCard + docs

- **16 AI portraits** generated via fal.ai Flux Schnell (`scripts/generate-art.ts`)
  — 4 affinities × 4 rarities, saved to `public/champions/`
- **ChampionCard** upgraded to Tier 2: 3:4 portrait with gradient name overlay,
  dark stats panel below, compact mode with 40×40 thumbnail
- **AGENTS.md** fully rewritten with mandatory session-end documentation rule,
  standing PR permission, semver rules, key file index, all commands
- **docs/handoff.md** created (this file) as living current-state document
- **docs/** folder: ARCHITECTURE, GAME_DESIGN, TESTING, CHANGELOG, ROADMAP
- **PWA manifest** + Viewport export + security headers added (take effect on deploy)
- **Art generation script** wired up: `npm run generate-art` (needs `FAL_KEY` in `.env.local`)
- fal.ai key stored in `.env.local` (git-ignored); $10 balance added, ~$0.05 used

### 2026-06-19 — Full game loop + test suite (PR #1, merged)

- Complete roguelike loop: zone select → draft → combat → reward → retry/advance
- 4 dungeon zones with dominant affinity bias and stat modifiers
- Auto-battle engine: status effects (burn, poison, freeze, stun), counter-affinity,
  synergy bonuses, 24-ability pool biased by affinity
- Tier 1 visuals: affinity gradient cards, rarity glow, floor tracker, perk shop
- Zustand store with full game phase state machine
- localStorage persistence
- Vitest: 48 tests, 80% engine coverage threshold

---

## Open PRs / branches

| Branch | PR | Description | Status |
|--------|----|-------------|--------|
| `chore/docs-and-agents` | #2 (pending) | Docs, AGENTS.md, portraits, handoff | In progress |

---

## Known issues

- **Nested button HTML warning**: RewardScreen wraps a `<button>` around a ChampionCard
  that sometimes renders as `<button>`. The `Tag = onClick ? "button" : "div"` fix is in
  place but there may still be hydration warnings in dev mode. Not broken, just noisy.
- **fal.ai rate limiting**: The art generator gets intermittent 403s even with a balance —
  just run `npm run generate-art` again; it skips already-generated files.
- **Portraits not on main yet**: The portrait commit (bb9c0f7) was pushed after PR #1 merged.
  It will land in main when PR #2 merges.
- **`tsconfig.json` and `next.config.ts` reverted on main**: The scripts exclusion and
  security headers are on this branch (`chore/docs-and-agents`), not yet on main.

---

## Next steps (prioritized)

1. **Merge PR #2** — gets portraits, docs, security headers, PWA manifest, and AGENTS.md into main
2. **Vercel deploy** — push main → `vercel --prod`; makes the game publicly accessible and activates PWA
3. **PWA icons** — generate 192×192 and 512×512 icons in `public/icons/` (currently placeholders in manifest)
4. **Supabase wiring** — create project, schema (profiles + runs), RLS, auth, replace localStorage
5. **Capacitor APK** — wrap the web app for Android Play Store / sideload

---

## Environment & credentials

| Secret | Where | Notes |
|--------|-------|-------|
| `FAL_KEY` | `.env.local` (git-ignored) | fal.ai API key for art generation |
| Supabase URL + anon key | Not yet created | Phase 1 |
| Vercel | Not yet configured | Phase 1 |

**Accounts everything depends on:** GitHub `metalphan` · fal.ai `metalphan@gmail.com`

---

## For the next AI session

1. Read `AGENTS.md` and this file first
2. Check open PRs: `gh pr list --repo metalphan/champion-forge`
3. Run `npm test` to confirm 48/48 still pass before making any changes
4. After your session: update this file's "Last updated" date and add to "Recent changes"
