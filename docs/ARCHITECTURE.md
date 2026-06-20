# Architecture

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16.2.9 (App Router) | Server components, file-based routing, easy Vercel deploy |
| Language | TypeScript 5 strict mode | Catches class of bugs at compile time; `strict: true` in tsconfig |
| Runtime state | Zustand 5 | Minimal boilerplate, no provider wrapping, simple slice pattern |
| Styling | Tailwind CSS 4 | Utility-first; no CSS-in-JS overhead; Tailwind 4 uses native CSS cascade layers |
| Testing | Vitest 4 | Native ESM, compatible with the same tsconfig, fast HMR integration |
| Persistence | `localStorage` (Phase 0) → Supabase (Phase 1) | localStorage lets us ship fast; Supabase adds cross-device sync without a custom backend |

---

## Folder Structure

```
src/
  app/           Next.js App Router — layout.tsx, page.tsx (root shell)
  components/
    screens/     One file per GamePhase: HomeScreen, DraftScreen, CombatScreen, …
    ui/          Shared primitives: ChampionCard, CombatLog
  engine/        Pure functions — no React, no I/O, fully unit-testable
    types.ts     All shared interfaces and enums (single source of truth)
    rng.ts       Mulberry32 seeded PRNG
    champion.ts  Champion generation, ability pool, display helpers
    synergy.ts   Synergy bonus calculation
    combat.ts    Auto-battle resolver
    floor.ts     Enemy team generation, boss floor logic
    rewards.ts   Reward option generation
  data/
    zones.ts     4 zone definitions (stats, affinity, descriptions)
    perks.ts     5 meta-perk definitions + calcRunModifiers/calcCurrencyMultiplier
  lib/
    persistence.ts  localStorage load/save with sane defaults and forward-compat spreading
  store/
    gameStore.ts    Zustand store — game phase machine, all player actions
docs/            This folder
scripts/         One-off CLI scripts (art generation, data seeding)
```

---

## State Machine

The game is modelled as a finite state machine. `GamePhase` is the discriminant; each screen renders one phase.

```
HOME
 └─▶ ZONE_SELECT
      └─▶ DRAFT
           └─▶ SQUAD_SELECT ◀─────────────────┐
                └─▶ COMBAT                     │
                     ├─▶ REWARD                │
                     │    └─▶ SQUAD_SELECT ────┘  (champion reward)
                     │    └─▶ COMBAT              (stat boost reward)
                     ├─▶ GAME_OVER
                     │    ├─▶ SQUAD_SELECT         (retry floor)
                     │    └─▶ HOME                 (abandon run)
                     └─▶ VICTORY
                          └─▶ HOME
```

All transitions live in `gameStore.ts`. Screens are read-only; they call store actions and react to state changes.

---

## Engine Design

### Why pure functions?

Every engine module (`combat.ts`, `floor.ts`, `synergy.ts`, `rewards.ts`) is a pure function of its inputs. No React, no Zustand, no side effects. This means:

- Tests are simple `input → output` assertions — no mocking required
- The store can call the same engine functions in different contexts (retry, preview, simulate)
- The engine can be extracted to a shared package for a future server-side leaderboard validator

### RNG: Mulberry32

```ts
// A single 32-bit integer is the entire PRNG state.
// Advancing the state is one multiply + one shift.
function mulberry32(seed: number): () => number { … }
```

Chosen over `Math.random()` because:
- **Deterministic**: same seed → same run, every time. Enables replays and server-side validation.
- **Portable**: pure arithmetic, no platform differences.
- **Fast**: single integer state, no object allocation.

Each seeded PRNG instance is threaded explicitly through engine calls (`resolveCombat(players, enemies, rng, …)`). The store offsets the seed per-floor so floor 1 and floor 2 use different sub-streams from the same run seed.

### Combat Resolution

Auto-battle resolves synchronously. The store stores the full log; the UI replays it with a timer to create the illusion of live action.

Turn order: all combatants sorted by `effectiveStats.spd` descending, re-sorted each round.

Each turn:
1. Process status effects (Burn/Poison DoT; Freeze/Stun skip check)
2. Select ability (use if off cooldown; else basic attack)
3. Apply counter-affinity bonus if applicable (+25%)
4. Apply synergy stat bonuses
5. Apply damage/heal/status; emit a `CombatLogEntry` per event

### Counter-affinity

```
Fire  →  Earth  →  Lightning  →  Water  →  Fire
```
Dealing damage to your counter target adds `COUNTER_DAMAGE_BONUS = 0.25` (25%) to the raw damage calculation.

---

## Key Decisions

### Auto-battle over manual combat

RAID Shadow Legends supports both modes; we defaulted to auto-battle. Reasons:
- Simpler state model (no "waiting for player input" phase)
- Results are fully pre-computable → enables the animated replay pattern
- Manual combat is a Phase 3 addition, not a removal

### No permadeath

On defeat, the player can retry the current floor (with squad swap) or abandon the run. Reasons:
- Permadeath was frustrating for the test user
- Floor retry with squad swap preserves meaningful choice while eliminating pure frustration

### localStorage before Supabase

Phase 0 ships immediately with no backend. `persistence.ts` spreads a `DEFAULT_META` over whatever is in localStorage, so adding new fields in Phase 1 won't corrupt old saves.

---

## Security Headers

Added in `next.config.ts`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

---

## Adding a New Screen

1. Add a `GamePhase` literal to `types.ts`
2. Create `src/components/screens/FooScreen.tsx`
3. Add the transition actions to `gameStore.ts`
4. Add the `case "FOO":` branch in `src/app/page.tsx`
