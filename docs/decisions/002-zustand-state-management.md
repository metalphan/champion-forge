# ADR-002: Zustand for Client-Side Game State

**Status:** Accepted  
**Date:** 2026-06-19

## Context and Problem Statement

The game is a finite state machine: HOME → ZONE_SELECT → DRAFT → COMBAT → REWARD → …
All screens share access to the same game state. The state includes the current phase,
run data (floor, team, log), and meta-progression (currency, perks). Screens should be
able to read state and trigger transitions without prop-drilling or context gymnastics.

## Decision Drivers

- Game state is global and shared across all screens
- Transitions must be atomic (no intermediate states where half the data is updated)
- No server state — all state is client-only until Supabase is wired in
- State must survive hot-module reload during development
- Minimal boilerplate — a solo project doesn't benefit from ceremony
- Zustand 5 is already in the ecosystem; no new dependency needed

## Considered Options

1. **Zustand 5** (chosen)
2. **Redux Toolkit** — industry standard for large teams, excellent DevTools
3. **Jotai** — atomic state, excellent for fine-grained reactivity
4. **XState** — explicit state machine library, purpose-built for FSMs
5. **React Context + useReducer** — zero dependencies, built into React

## Decision Outcome

**Chosen option: Zustand 5** — because it requires no provider wrapping, state slices
are simple objects, and the store can be called outside of React components (useful for
the engine functions). The FSM is small enough (8 phases) that XState's complexity isn't
justified.

### Consequences

**Positive:**
- No `<Provider>` wrapper needed — store is imported directly
- Works outside React: engine tests can inspect state without rendering
- `useGameStore(selector)` syntax means components only re-render when their slice changes
- Immer middleware available if state mutations get complex
- DevTools: Zustand has Redux DevTools support via middleware

**Negative:**
- Less opinionated than Redux — more freedom means more responsibility to structure correctly
- No built-in time-travel debugging (unless Redux DevTools middleware is added)
- Smaller community and fewer Stack Overflow answers than Redux

**Neutral:**
- XState would be more "correct" architecturally for a FSM, but the overhead of
  learning XState and the ceremony of defining guards/actions/transitions is not
  justified for 8 states with clear, simple transitions. Revisit if the state
  machine grows past ~15 states.
- All game phase transitions live in `src/store/gameStore.ts`. Do not split into
  multiple stores — the transitions are tightly coupled and splitting creates bugs.
