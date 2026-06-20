# ADR-005: Mulberry32 Seeded PRNG over Math.random()

**Status:** Accepted  
**Date:** 2026-06-19

## Context and Problem Statement

The game generates champions, enemy teams, and reward options procedurally. If generation
uses `Math.random()`, runs are non-reproducible: a bug seen in a player's session cannot
be replicated locally, and tests become non-deterministic. A seeded PRNG solves both.

## Decision Drivers

- Tests must be deterministic: same seed → same run, always
- Bugs in generation must be reproducible from the run seed alone
- PRNG must be portable — identical output in any JS runtime
- Zero runtime dependencies preferred
- Performance is not a concern (thousands of calls per run at most)

## Considered Options

1. **Mulberry32 (hand-rolled)** (chosen)
2. **Math.random()** — built-in, but non-deterministic and non-seedable
3. **`seedrandom` npm package** — well-tested, but a dependency for something trivially implementable
4. **Xorshift32** — similar to Mulberry32, slightly worse statistical properties
5. **Mersenne Twister** — statistically excellent, but 624-integer state array is overkill
6. **crypto.getRandomValues()** — cryptographically secure but completely non-deterministic

## Decision Outcome

**Chosen option: Mulberry32** — because it has excellent statistical properties for a
game PRNG, passes PractRand tests, has a single 32-bit integer as its entire state
(trivially serializable), and is ~5 lines of code with no dependencies.

```ts
export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  return {
    next() {
      s += 0x6d2b79f5;
      let z = s;
      z = Math.imul(z ^ (z >>> 15), z | 1);
      z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
      return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
    },
    // ...
  };
}
```

The store creates per-floor RNG instances by offsetting the run seed (`seed + floor * 1000`),
so each floor is independently reproducible without replaying the entire run.

### Consequences

**Positive:**
- Every test gets a fixed seed → tests never flake due to randomness
- A bug report with a run seed can be reproduced exactly
- State is one integer — trivially serializable for run history / replay features
- Zero dependencies, zero bundle size increase
- Mulberry32 has better statistical properties than LCG (the simplest alternative)
  and is sufficient for game use (not cryptography)

**Negative:**
- Hand-rolled code carries maintenance responsibility — if a bug is found, we fix it
- Mulberry32 has a period of 2^32 (~4 billion) — sufficient but not infinite
- Not cryptographically secure — must never be used for auth tokens, CSRF, etc.

**Neutral:**
- The seed is visible in the run state. This enables cheating (generate seeds until
  you get a favorable draft). For Phase 0, this is acceptable. If a competitive mode
  is added, server-side seed generation will be needed.
