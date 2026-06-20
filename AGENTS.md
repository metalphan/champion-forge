<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Champion Forge — AI Agent Instructions

**Read this file and `docs/handoff.md` before doing anything in a new session.**

---

## What this app is

Champion Forge is a RAID Shadow Legends-inspired roguelike built as a Next.js web app.
Players draft elemental champions, fight auto-battle floors in themed dungeons, and spend
earned currency on permanent meta-perks between runs.

| | |
|---|---|
| Repo | `C:\repos\champion-roguelike` |
| GitHub | https://github.com/metalphan/champion-forge |
| Local dev | `npm run dev` → http://localhost:3000 |
| Deployed | Not yet — Vercel deploy is Phase 1 |

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript 5, `strict: true` |
| State | Zustand 5 (`src/store/gameStore.ts`) |
| Styling | Tailwind CSS 4 |
| Persistence | `localStorage` (Phase 0) → Supabase (Phase 1) |
| Testing | Vitest 4 + @vitest/coverage-v8 |
| AI art | fal.ai Flux via `@fal-ai/client` (`scripts/generate-art.ts`) |

---

## Key source files

| File/Dir | Purpose |
|----------|---------|
| `src/engine/types.ts` | Single source of truth for all types and enums |
| `src/engine/combat.ts` | Auto-battle resolver — pure function |
| `src/engine/champion.ts` | Champion generation + display helpers + portrait lookup |
| `src/store/gameStore.ts` | Zustand store — entire game phase state machine |
| `src/lib/persistence.ts` | localStorage load/save with forward-compat defaults |
| `src/data/zones.ts` | 4 dungeon zone definitions |
| `src/data/perks.ts` | 5 meta-perks + run modifier/currency calculators |
| `public/champions/` | AI-generated portrait PNGs (16 total, ~300KB each) |
| `scripts/generate-art.ts` | fal.ai Flux portrait generator — run with `npm run generate-art` |
| `docs/handoff.md` | Living current-state document — **update after every session** |

---

## Commands

```bash
npm run dev            # start dev server on :3000
npm test               # run Vitest (48 tests)
npm run test:coverage  # coverage report
npm run generate-art   # generate AI portraits (requires FAL_KEY in .env.local)
npx tsc --noEmit       # typecheck
```

---

## Environment variables

`.env.local` is git-ignored (covered by `.env*` in `.gitignore`). Required for art generation:

```
FAL_KEY=<your fal.ai key>
```

When Supabase is added (Phase 1):
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Git workflow

```bash
git checkout main && git pull origin main
git checkout -b feat/description    # or fix/ chore/ security/ test/
# make changes
git commit -m "type: description

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
git push -u origin <branch>
gh pr create --base main ...
```

- **Never commit directly to `main`**
- One branch per logical change
- Branch names: `feat/`, `fix/`, `chore/`, `security/`, `test/` (kebab-case)
- Always include the Co-Authored-By trailer; update model name to whichever is running
- Push branch → open PR → share the PR link

### Standing PR permission

The user grants AI coding assistants standing permission to create, approve, and merge pull
requests into `main` once the assistant has reviewed the changes and considers them ready.

---

## Versioning

Version is managed in **`package.json`** — it is the source of truth.

| Change type | Example | Rule |
|-------------|---------|------|
| Bug fix | `0.1.0` → `0.1.1` | PATCH — no new features |
| New feature | `0.1.x` → `0.2.0` | MINOR — new user-facing feature |
| Major redesign | `0.x.x` → `1.0.0` | MAJOR — breaking change or milestone release |

Update `package.json` version before committing significant feature work.

---

## 🔴 Mandatory documentation rule

**After every session where anything changed — code, config, or design decisions — you must:**

1. **Update `docs/handoff.md`:**
   - Set "Last updated" to today's date
   - Update feature status table (mark resolved issues ✅, add new ones)
   - Add a brief entry under "Recent changes" — what changed and why
   - Update "Known issues" — close resolved ones, add new ones
   - Update "Next steps" if priorities shifted

2. **Update `AGENTS.md`** if any of the following changed:
   - Key source files or their purpose
   - Commands or scripts
   - Environment variables or their meaning
   - Tech stack or major dependencies

3. **Update `docs/CHANGELOG.md`** with a new version entry if the change is shippable.

**Do not close a session without updating `docs/handoff.md`.** The next AI session depends on
it to orient without re-reading the entire conversation history. This rule applies to every AI
assistant, not just Claude.

---

## Architecture notes

Full details in `docs/ARCHITECTURE.md`. Short version:

- **Engine is pure functions** — no React, no I/O, fully testable. Combat resolves
  synchronously; the UI replays the log with a timer.
- **State machine** — `GamePhase` is the discriminant. All transitions in `gameStore.ts`.
  Screens are read-only; they call store actions.
- **Seeded RNG** — Mulberry32. Same seed → same run every time. Always pass a known seed
  in tests.
- **Counter-affinity**: Fire→Earth→Lightning→Water→Fire, +25% damage bonus.
- **Portraits**: `getPortraitUrl(affinity, rarity)` in `champion.ts` maps to
  `/public/champions/<slug>.png`. Uncommon reuses Common portrait.
- **No permadeath**: defeat → retry floor (squad swap allowed) or abandon run.
