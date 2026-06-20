# ADR-006: fal.ai Flux for AI-Generated Champion Portraits

**Status:** Accepted (updated 2026-06-20 — model upgraded to Flux Pro Ultra)  
**Date:** 2026-06-20

## Context and Problem Statement

Champion Forge needs art for champion cards. The options are: hire an artist, use stock
assets, use AI image generation via an API, or run a model locally. A solo indie project
with no art budget needs to reach Tier 2 visuals without a human artist.

## Decision Drivers

- No art budget — commercial assets or freelancers are out of scope
- 16 portraits needed initially (4 affinities × 4 rarities)
- Images are generated once and committed to the repo — not generated at runtime
- Consistent art style across all portraits is critical for visual cohesion
- API must be callable from a Node.js script with no GPU required
- Cost per image must be low enough to regenerate the full set freely

## Considered Options

1. **fal.ai Flux Schnell via API** (initial choice — superseded)
2. **fal.ai Flux Pro Ultra via API** (current choice — upgraded 2026-06-20)
3. **DALL-E 3 (OpenAI)** — high quality, consistent, but ~$0.04/image vs $0.06/image
3. **Midjourney** — arguably the best quality, but no API; requires Discord interaction
4. **Replicate (SDXL / Flux)** — similar to fal.ai, slightly higher per-call overhead
5. **Stable Diffusion locally (ComfyUI)** — free after setup, but requires a capable GPU
6. **Stock assets / RPG Maker packs** — fast, but style inconsistency and licensing risk

## Decision Outcome

**Current model: fal.ai Flux Pro Ultra** (`fal-ai/flux-pro/v1.1-ultra`) — upgraded from
Flux Schnell on 2026-06-20. Reason: significantly higher image quality and character fidelity
needed for the RAID Shadow Legends-style aesthetic; the cost increase ($0.003 → ~$0.06/image)
is acceptable for a one-time generation of a fixed portrait set.

The generation script (`scripts/generate-art.ts`) is idempotent — it skips already-
generated files — so re-running it only generates missing portraits.

### Art direction branches

Two long-lived branches exist for different content policies:

| Branch | Target | `safety_tolerance` | Style |
|--------|--------|--------------------|-------|
| `portraits/standard` | General audience / app stores | `"5"` | Tasteful fantasy costumes |
| `portraits/suggestive` | Adult / direct distribution | `"6"` | Revealing, titillating designs |

### 4-view preview system

`scripts/generate-previews.ts` generates 4 angles of a single champion (front, left ¾,
right ¾, back) before committing to the full batch. This gate prevents costly regeneration
of all 16 champions if the art direction needs adjustment.

**Key consistency technique**: use ¾ angles rather than strict side profiles. Strict side
profile causes Flux to render the character's creature aspect (dragon snout, etc.) rather
than the human face. ¾ angles with "face turned toward viewer" keep the human face visible
across all shots.

### Style guide (current)

```
beautiful human woman, [affinity-specific features],
fantasy RPG card art, cinematic digital painting, dramatic lighting,
dark atmospheric background, no text, no border, no watermark
```

Affinity-specific: dragon wings + fire (Fire), sea scales + bioluminescence (Water),
bark skin + vines (Earth), electric tattoos + storm energy (Lightning).

### Consequences

**Positive:**
- ~$0.96 total for 16 portraits — still cheap to regenerate
- Significantly better character fidelity vs Schnell
- Idempotent script: safe to re-run; skips existing files
- Images committed to repo — no API dependency at runtime, works offline
- 4-view preview gate prevents wasted full-batch runs

**Negative:**
- ~$0.06/image vs $0.003 for Schnell — 20× more expensive
- Flux generates each image independently — no character memory across calls;
  consistency across 4 views requires careful prompt engineering (¾ angles, face anchors)
- Requires `FAL_KEY` and account balance; full 16×4 batch = ~$3.84
- fal.ai is a startup — API stability and pricing are not guaranteed long-term

**Neutral:**
- Uncommon rarity reuses Common portraits (4 portraits per affinity, 5 rarities)
- Multi-view portraits (4 angles per champion) are on `portraits/suggestive` branch;
  `portraits/standard` currently uses single-view portraits only
