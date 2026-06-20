# ADR-003: localStorage Before Supabase (Phased Persistence)

**Status:** Accepted  
**Date:** 2026-06-19

## Context and Problem Statement

The game needs to persist meta-progression (currency, best floor, purchased perks) across
browser sessions. The full vision includes cross-device sync, run history, and a
leaderboard — all of which require a backend. But adding Supabase on day one means
dealing with auth, environment variables, migrations, and RLS before the game loop
is even proven.

## Decision Drivers

- Ship a working game as fast as possible; validate the loop before adding backend complexity
- Adding a backend prematurely creates a hard dependency that blocks local testing
- `localStorage` is synchronous, zero-latency, zero-config, and free
- The meta state is small (~1KB) — no storage limit concerns
- The persistence layer must be swappable without changing the rest of the codebase

## Considered Options

1. **localStorage for Phase 0, Supabase for Phase 1** (chosen)
2. **Supabase from day one** — correct long-term, but adds auth + migration complexity early
3. **No persistence** — acceptable for a prototype, not for a game with meta-progression
4. **IndexedDB** — better for large data, but overkill; awkward async API
5. **PouchDB / Dexie** — libraries over IndexedDB; same overkill argument

## Decision Outcome

**Chosen option: Phased approach** — localStorage for the current phase, Supabase when
cross-device sync or run history is needed.

The key design constraint is **forward compatibility**: `persistence.ts` spreads a
`DEFAULT_META` over whatever is in localStorage, so adding new fields to `MetaState`
in a future commit won't corrupt saves from older versions.

```ts
// Forward-compat spread — new fields get defaults; old unknown fields are ignored
const loaded = JSON.parse(raw);
return { ...DEFAULT_META, ...loaded };
```

### Consequences

**Positive:**
- Zero setup — works on fresh clone with no env vars
- No auth wall before playing — the game is immediately accessible
- Local-first is fast: reads and writes are synchronous, sub-millisecond
- Persistence layer is isolated in `src/lib/persistence.ts` — Supabase swap is
  one file change

**Negative:**
- Progress is lost on clearing browser storage or switching browsers/devices
- No run history — can't review past runs or see trends
- No leaderboard capability until Phase 1
- Not suitable for the deployed production game long-term — users expect their
  saves to follow them

**Neutral:**
- When Supabase is added, the `DEFAULT_META` spread pattern becomes the migration
  strategy: the first Supabase load merges cloud state with any existing localStorage
  state, then deletes the local copy.
