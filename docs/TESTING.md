# Testing Guide

## Philosophy

> Test behaviour, not implementation. A test that breaks when you rename a private variable is not a useful test.

The engine is pure functions — test it exhaustively. The UI is stateful React — test it at the boundary (store actions → state) and for user-visible flows, not internal component wiring.

---

## Stack

| Tool | Role |
|---|---|
| **Vitest 4** | Test runner, coverage, watch mode |
| **@vitest/coverage-v8** | V8 native coverage (no Babel transform needed) |
| **React Testing Library** | (Planned) UI component tests driven from the user's perspective |
| **MSW** | (Planned) Mock Supabase / fal.ai API calls in integration tests |

---

## Coverage Thresholds

Set in `vitest.config.ts`:

| Module | Lines | Why |
|---|---|---|
| `src/engine/**` | 80% | Pure functions — no reason not to cover them |
| `src/data/**` | 80% | Data validators and calculators |
| `src/components/**` | 60% | UI has more acceptable coverage gaps |
| `src/store/**` | 70% | State transitions are critical paths |

Run coverage:

```bash
npm run test:coverage
```

---

## Test Files Map

```
src/engine/
  rng.test.ts         PRNG range, determinism, int/pick/shuffle
  champion.test.ts    Structure, stat budget, rarity ordering, uniqueness
  synergy.test.ts     Bonus tiers (×2/×3/×4), non-matching affinity
  combat.test.ts      Winner invariant, log fields, determinism, HP bonus, counter-affinity
  floor.test.ts       Boss floor detection, team size, enemy scaling, affinity bias
  rewards.test.ts     Option count, champion/stat_boost structure, determinism, floor scaling

src/data/
  perks.test.ts       Field validation, run modifier accumulation, currency multiplier stacking
```

---

## Running Tests

```bash
npm test              # single run (used in CI)
npm run test:watch    # watch mode during development
npm run test:coverage # coverage report in coverage/
```

---

## Writing New Tests

### Seeded RNG — always seed explicitly

```ts
// Bad: non-deterministic
const rng = createRng(Math.random());

// Good: fixed seed — same result on every run
const rng = createRng(42);
```

### Test invariants, not magic numbers

```ts
// Brittle: breaks if balance changes
expect(floor8Team[0].baseStats.hp).toBe(412);

// Robust: tests the invariant that matters
expect(floor8Team[0].baseStats.hp).toBeGreaterThan(floor1Team[0].baseStats.hp);
```

### Probabilistic tests — sample over multiple seeds

```ts
// Don't test one outcome and hope it's representative
// Sample 20+ seeds and assert a ratio
let fireWins = 0;
for (let s = 0; s < 20; s++) {
  if (resolveCombat(fireTeam, earthTeam, createRng(s)).playerWon) fireWins++;
}
expect(fireWins).toBeGreaterThan(8); // Fire should win > 40% vs Earth (counter advantage)
```

### Store tests — call actions, assert state

```ts
// Prefer testing store actions → state over internals
const { getState, setState } = useGameStore;
setState({ phase: "HOME", meta: DEFAULT_META });
getState().startNewRun();
expect(getState().phase).toBe("ZONE_SELECT");
```

### Don't mock what you own

Never mock `generateChampion`, `resolveCombat`, or other engine functions in tests for the store or UI. These are cheap pure functions — call them for real. Mocking internal code couples tests to implementation.

Mock only:
- `localStorage` (when testing persistence)
- External HTTP calls (Supabase, fal.ai) — use MSW

### Co-locate test files

```
src/engine/combat.ts
src/engine/combat.test.ts    ← same directory, not __tests__/
```

---

## CI Integration

### Husky hooks (to be configured)

```
pre-commit:  lint-staged (ESLint + Prettier) + tsc --noEmit   ← fast, always runs
pre-push:    vitest run                                         ← slower, catches regressions
```

### GitHub Actions (to be configured)

```yaml
- name: Test
  run: npm test

- name: Coverage check
  run: npm run test:coverage
```

---

## What Not to Test

| Don't test | Why |
|---|---|
| React internals (hook call order) | Not your code |
| Next.js routing | Framework's job |
| Tailwind class names | Not behaviour |
| `console.log` output | Not user-visible |
| Private helper functions | Test through the public API |
| That a function was called (spy-heavy tests) | Tests implementation, not behaviour |

---

## Planned Test Additions

- [ ] `store/gameStore.test.ts` — state machine transitions, perk purchase, run end currency
- [ ] `lib/persistence.test.ts` — load/save round-trip, forward-compat with missing fields
- [ ] `components/screens/DraftScreen.test.tsx` — champion selection, synergy preview, max selection enforcement
- [ ] `components/screens/CombatScreen.test.tsx` — log animation sequencing, skip button, HP bar values
- [ ] MSW handlers for Supabase (when Phase 1 ships)
