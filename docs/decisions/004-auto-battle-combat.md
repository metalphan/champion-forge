# ADR-004: Auto-Battle as the Default Combat Model

**Status:** Accepted  
**Date:** 2026-06-19

## Context and Problem Statement

RAID Shadow Legends (the primary inspiration) supports both auto-battle and manual
combat. The game's core loop is about *team building and strategy* — choosing the right
champions, affinities, and synergies — not about executing abilities at the right moment.
We need to choose a default combat model for Phase 0.

## Decision Drivers

- Combat resolution must be fully testable without UI interaction
- The animated combat log requires knowing the full outcome before animating
- Team-building strategy (draft, synergy, perk choices) is the game's core skill expression
- Solo developer — implementing real-time input handling doubles UI complexity
- Manual combat is a valid Phase 3+ addition, not a prerequisite

## Considered Options

1. **Auto-battle only** (chosen for Phase 0)
2. **Manual combat only** — player selects ability and target each turn
3. **Hybrid: auto with manual override** — auto plays unless player intervenes
4. **Speed-up / slow-down controls** — auto but with player-controlled pacing

## Decision Outcome

**Chosen option: Auto-battle (Phase 0), with manual combat planned for Phase 6.**

The key insight is that auto-battle allows the entire combat to be resolved as a pure
function: `resolveCombat(players, enemies, rng)` → `CombatResult`. This makes the
result deterministic, testable, and replay-able. The UI then *animates* the pre-computed
log rather than waiting for live input. This architecture would need to be significantly
redesigned to support manual combat.

### Consequences

**Positive:**
- `resolveCombat()` is a pure function — fully unit-testable, no React dependency
- Combat result is available instantly; UI animation is cosmetic, skippable
- Seeded RNG makes the entire run reproducible for debugging
- Team composition (draft, synergies, perk choices) becomes the primary skill expression
- Dramatically less UI complexity in Phase 0

**Negative:**
- Reduces moment-to-moment player agency — you watch, you don't play
- Some players find auto-battle unsatisfying, especially skilled players who want
  to demonstrate mechanical skill
- Adding manual combat later requires a new game phase (`COMBAT_PLAYER_TURN`),
  an AI opponent, ability targeting UI, and cooldown preview — significant work

**Neutral:**
- The primary user confirmed they use auto-battle in RAID anyway
- Manual combat is explicitly on the roadmap as Phase 6 — the architecture note
  in `docs/ROADMAP.md` describes what that refactor looks like
