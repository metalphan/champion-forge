# ADR-007: Retry-on-Defeat Instead of Permadeath

**Status:** Accepted  
**Date:** 2026-06-19

## Context and Problem Statement

The original design had full permadeath: a defeat ends the run and the player starts
over from floor 1 with a new draft. After the first playtest, the user reported the
experience as "annoying" — specifically that hitting floor 2 and then reverting to floor 1
felt punishing in a way that wasn't satisfying. Roguelikes exist on a spectrum from
"die and restart" (Spelunky, The Binding of Isaac) to "retry the challenge" (most
mobile RPGs). The question is where Champion Forge sits.

## Decision Drivers

- Primary user explicitly reported permadeath as frustrating, not fun
- The game's skill expression is in draft composition, not combat execution (auto-battle)
  — permadeath punishes a bad draft, not a bad play
- Floor retry with squad swap allows players to adapt their strategy
- Meta-progression (perks, currency) already persists between runs
- Run investment (champion stat boosts earned mid-run) should not be lost to a single floor

## Considered Options

1. **Full permadeath** — defeat ends the run, lose all in-run progress
2. **Retry with same squad** — retry the floor, no changes allowed
3. **Retry with squad swap (chosen)** — retry the floor, player can reorder their active 3
4. **Continue from last floor** — no consequence for defeat; too easy
5. **Checkpoint system** — save state every N floors; complex to implement

## Decision Outcome

**Chosen option: Retry with squad swap** — because it preserves consequence (you still
fight the floor again) while allowing player adaptation (you can rethink your lineup).
Squad swap is meaningful strategy: if a boss floor is counter-affinity to your current 3,
swapping to a counter-pick from your bench is a legitimate skill expression.

The defeat screen presents two explicit choices:
- **Retry Floor** → Squad Select screen (pre-populated with current active team)
- **Abandon Run** → Home screen (run data saved for currency/best-floor stats)

### Consequences

**Positive:**
- Dramatically reduces frustration; player retains run investment (stat boosts, roster)
- Squad swap on retry is a meaningful decision point — it's not "free"
- Players who want more challenge can self-impose permadeath
- Abandoning a run is always available as a "start fresh" option

**Negative:**
- Reduces tension — knowing you can retry makes floors feel lower-stakes
- A very patient player can brute-force any floor by retrying many times
- Harder to create "last stand" emotional moments that permadeath roguelikes excel at

**Neutral:**
- The game's difficulty still ramps naturally via floor scaling and zone modifiers
- Future difficulty modes (Hardcore / Ironman) can add permadeath as an opt-in
  without changing the default experience
- "Abandon Run" still ends the run permanently — there is still real consequence
  at the run level even without permadeath at the floor level
