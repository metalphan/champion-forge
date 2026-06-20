# Architecture Decision Records

This directory contains ADRs (Architecture Decision Records) for Champion Forge.

## What is an ADR?

An ADR captures a significant architectural decision: the context that forced it, the
options considered, what was chosen, and the consequences — including trade-offs.

**Why ADRs matter:** `docs/ARCHITECTURE.md` tells you *what* the system looks like.
ADRs tell you *why* it looks that way. Without them, future developers (human or AI)
re-litigate settled decisions, often without the context that made the original choice
obvious. ADRs also serve as a forcing function: writing down the reasoning often reveals
that the reasoning is weak.

*Format based on Michael Nygard's original ADR proposal and the MADR (Markdown ADR)
specification — both widely adopted in the industry.*

---

## Index

| # | Title | Status |
|---|-------|--------|
| [001](001-nextjs-app-router.md) | Next.js App Router as the web framework | Accepted |
| [002](002-zustand-state-management.md) | Zustand for client-side game state | Accepted |
| [003](003-phased-persistence.md) | localStorage before Supabase (phased persistence) | Accepted |
| [004](004-auto-battle-combat.md) | Auto-battle as the default combat model | Accepted |
| [005](005-mulberry32-prng.md) | Mulberry32 seeded PRNG over Math.random() | Accepted |
| [006](006-fal-ai-portraits.md) | fal.ai Flux for AI-generated champion portraits | Accepted |
| [007](007-no-permadeath.md) | Retry-on-defeat instead of permadeath | Accepted |

---

## ADR statuses

| Status | Meaning |
|--------|---------|
| **Proposed** | Decision is being discussed — not yet binding |
| **Accepted** | Decision is in effect |
| **Deprecated** | No longer applies but kept for history |
| **Superseded** | Replaced by a newer ADR (links to it) |

---

## How to add an ADR

1. Copy the template below into a new file: `docs/decisions/NNN-short-title.md`
2. Increment N from the last entry in the index above
3. Fill in all sections — especially "Consequences" (both positive and negative)
4. Add the entry to the index table above
5. Reference the ADR number in your PR description

```markdown
# ADR-NNN: Title

**Status:** Proposed  
**Date:** YYYY-MM-DD

## Context and Problem Statement

What situation or constraint forced this decision?

## Decision Drivers

- Driver 1
- Driver 2

## Considered Options

1. Option A
2. Option B
3. Option C

## Decision Outcome

**Chosen option: Option A** — because [reason].

### Consequences

**Positive:**
- ...

**Negative:**
- ...

**Neutral:**
- ...
```
