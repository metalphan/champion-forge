# Data Schema

Documents every data structure the application stores or transmits: current localStorage
schema, planned Supabase tables, and field-level glossary.

*Approach: Every field is documented with its type, valid values, and ownership. This
prevents future sessions from guessing at semantics. Based on practices from dbt's
schema.yml conventions and Stripe's API reference style.*

---

## Current Storage: localStorage

**Key:** `champion-forge:meta`  
**Format:** JSON string  
**Type:** `MetaState`  
**When written:** On every state transition that changes meta-progression  
**Backward compatibility:** New fields spread over `DEFAULT_META` — old saves are not corrupted

### MetaState

```ts
interface MetaState {
  currency:           number;      // Shards ⚜️ earned and unspent
  totalRuns:          number;      // Lifetime run count (including abandoned)
  bestFloor:          number;      // Highest floor reached across all runs and zones
  unlockedArchetypes: string[];    // Reserved for Phase 3 champion collection (currently unused)
  purchasedPerks:     string[];    // Ordered list of perk IDs, with duplicates (e.g. ["battle_hardened", "battle_hardened"])
}
```

### Field Glossary

| Field | Type | Range / Valid values | Notes |
|-------|------|----------------------|-------|
| `currency` | `number` | `0` – uncapped | Displayed as ⚜️ Shards. Earned at run end (floor-scaled × perk multiplier). Spent in perk shop. Never goes negative. |
| `totalRuns` | `number` | `0` – uncapped | Incremented on both victory and defeat, not on abandon. Used for display only. |
| `bestFloor` | `number` | `0` – zone.floorCount | Updated at run end with `run.floor`. Tracks the highest floor *reached*, not cleared. |
| `unlockedArchetypes` | `string[]` | archetype IDs | Currently always `[]`. Phase 3 will populate this as players collect champions. |
| `purchasedPerks` | `string[]` | perk IDs from `src/data/perks.ts` | **Order matters for display only.** Duplicates are valid (buying a perk twice gives it twice). `calcRunModifiers()` sums effects across all entries. |

### Default value

```ts
export const DEFAULT_META: MetaState = {
  currency: 0,
  totalRuns: 0,
  bestFloor: 0,
  unlockedArchetypes: [],
  purchasedPerks: [],
};
```

---

## In-Memory: RunState

Not persisted. Lives in the Zustand store for the duration of a run.

```ts
interface RunState {
  id:                 string;             // nanoid — unique run identifier
  seed:               number;             // Mulberry32 seed — same seed → same run
  floor:              number;             // Current floor (1-indexed)
  maxFloor:           number;             // From zone.floorCount (10 by default)
  zoneId:             string;             // zone.id — which dungeon is active
  playerTeam:         Champion[];         // Full roster (grows with champion rewards)
  currentCombatLog:   CombatLogEntry[];   // Log from the most recent combat
  pendingRewards:     RewardOption[];     // Reward options waiting to be picked
  outcome:            "ongoing" | "victory" | "defeat";
  modifiers:          RunModifiers;       // Derived from purchasedPerks at run start
}
```

### RunModifiers

```ts
interface RunModifiers {
  extraDraftSlots:      number;  // Additional champions added to the draft pool (default 0)
  startingHpBonus:      number;  // Flat HP added to all player champions at combat start
  floorScaleReduction:  number;  // Subtracted from per-floor enemy scaling multiplier (0–0.5)
}
```

---

## Planned: Supabase Schema (Phase 1)

*Not yet implemented. Documented here so the schema is designed before coding begins.*

### Table: `profiles`

One row per authenticated user. Mirrors `MetaState` for cloud persistence.

```sql
CREATE TABLE profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency            INTEGER NOT NULL DEFAULT 0 CHECK (currency >= 0),
  total_runs          INTEGER NOT NULL DEFAULT 0 CHECK (total_runs >= 0),
  best_floor          INTEGER NOT NULL DEFAULT 0 CHECK (best_floor >= 0),
  purchased_perks     TEXT[]  NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS Policy Intent:**
- `SELECT`: authenticated users can read their own row only (`auth.uid() = id`)
- `INSERT`: authenticated users can insert their own row only
- `UPDATE`: authenticated users can update their own row only
- `DELETE`: not allowed (soft-delete or account deletion handled by Supabase Auth cascade)

### Table: `runs`

One row per completed or abandoned run. Append-only — never update existing rows.

```sql
CREATE TABLE runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  zone_id             TEXT NOT NULL,                -- e.g. "ember_wastes"
  seed                BIGINT NOT NULL,              -- Mulberry32 seed used for this run
  floors_cleared      INTEGER NOT NULL DEFAULT 0,
  outcome             TEXT NOT NULL CHECK (outcome IN ('victory', 'defeat', 'abandoned')),
  currency_earned     INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**RLS Policy Intent:**
- `SELECT`: authenticated users can read their own runs only
- `INSERT`: authenticated users can insert runs where `user_id = auth.uid()`
- `UPDATE`, `DELETE`: not allowed — runs are immutable records

### Indexes (planned)

```sql
-- Leaderboard queries: top floors by zone
CREATE INDEX idx_runs_zone_floors ON runs(zone_id, floors_cleared DESC);

-- User history: most recent runs first
CREATE INDEX idx_runs_user_created ON runs(user_id, created_at DESC);
```

---

## Perk IDs (reference)

Valid values for `purchasedPerks` entries and `RunModifiers` derivation:

| Perk ID | Effect type | Amount | Max purchases |
|---------|-------------|--------|---------------|
| `veteran_recruiter` | `extra_draft_slots` | +2 per purchase | 2 |
| `battle_hardened` | `starting_hp_bonus` | +30 per purchase | 3 |
| `tactical_advantage` | `floor_scale_reduction` | 0.05 per purchase | 3 |
| `scavenger` | `currency_multiplier` | ×1.25 per purchase | 2 |
| `deep_pockets` | `currency_multiplier` | ×1.5 per purchase | 1 |

---

## Zone IDs (reference)

Valid values for `RunState.zoneId` and `runs.zone_id`:

| Zone ID | Display name | Dominant affinity |
|---------|-------------|-------------------|
| `ember_wastes` | Ember Wastes | Fire |
| `glacial_depths` | Glacial Depths | Water |
| `storm_citadel` | Storm Citadel | Lightning |
| `ancient_roots` | Ancient Roots | Earth |

---

## Migration Conventions (Phase 1)

- Files live in `supabase/migrations/`
- Named: `NNN_short_description.sql` where NNN is zero-padded (e.g. `001_initial_schema.sql`)
- **Never edit an existing migration** — always create a new numbered file
- Each migration must be idempotent where possible (`CREATE TABLE IF NOT EXISTS`, etc.)
- Include a rollback comment at the top of every migration:
  ```sql
  -- Rollback: DROP TABLE IF EXISTS runs; DROP TABLE IF EXISTS profiles;
  ```
