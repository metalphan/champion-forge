# ADR-006: fal.ai Flux for AI-Generated Champion Portraits

**Status:** Accepted  
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

1. **fal.ai Flux Schnell via API** (chosen)
2. **DALL-E 3 (OpenAI)** — high quality, consistent, but ~$0.04/image vs $0.003/image
3. **Midjourney** — arguably the best quality, but no API; requires Discord interaction
4. **Replicate (SDXL / Flux)** — similar to fal.ai, slightly higher per-call overhead
5. **Stable Diffusion locally (ComfyUI)** — free after setup, but requires a capable GPU
6. **Stock assets / RPG Maker packs** — fast, but style inconsistency and licensing risk

## Decision Outcome

**Chosen option: fal.ai Flux Schnell** — because it has the best cost/quality ratio at
~$0.003/image, a clean JavaScript SDK (`@fal-ai/client`), fast inference (~2 seconds
per image), and Flux's outputs have the dark painterly RPG aesthetic needed for the game.

The generation script (`scripts/generate-art.ts`) is idempotent — it skips already-
generated files — so re-running it only generates missing portraits.

### Style guide prompt

```
fantasy RPG card art, dark painterly style, dramatic lighting,
character portrait, black gradient background, game card illustration,
high detail, cinematic, no text, no border
```

Affinity-specific additions:
- Fire: `fire elemental warrior, red and orange flames, molten armor, ember glow`
- Water: `water elemental mage, blue and cyan ice crystals, flowing robes, frost aura`
- Earth: `earth elemental guardian, stone armor, green vines, nature magic`
- Lightning: `lightning elemental striker, purple and yellow electricity, storm energy`

### Consequences

**Positive:**
- $0.05 total for 16 portraits — trivially cheap to regenerate
- Fast: full set generates in ~5 minutes
- Consistent style achievable by anchoring all prompts to the same style guide
- Images committed to repo — no API dependency at runtime, works offline
- Idempotent script: safe to re-run; skips existing files

**Negative:**
- Generated images are static archetypes — all Fire Commons look identical
  regardless of their procedurally generated name and stats
- Requires `FAL_KEY` and account balance to regenerate (though ~$0.05 per full run)
- Flux can generate inconsistent anatomy on complex compositions
- fal.ai is a startup — API stability and pricing are not guaranteed long-term

**Neutral:**
- Uncommon rarity reuses Common portraits (4 portraits per affinity, 5 rarities)
  because generating 5 per affinity (20 total) was not enough visual differentiation
  to justify the cost
- When a persistent champion collection is added (Phase 3), unique portraits for
  named champions should be generated on-demand or pre-generated for a fixed roster
