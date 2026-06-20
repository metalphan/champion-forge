# Changelog

All notable changes to Champion Forge are documented here.
Format: [Semantic Versioning](https://semver.org). Unreleased work lives under `## [Unreleased]`.

---

## [Unreleased]

### Planned
- PWA manifest + service worker (installable on Android)
- AI-generated champion portrait pipeline (fal.ai / Flux)
- Capacitor APK build
- Supabase integration (cross-device persistence, run history)
- Manual combat mode
- Sound effects

---

## [0.1.0] — 2026-06-19

### Added

**Game Loop**
- Full roguelike run: Zone Select → Draft → Auto-Battle → Reward → Retry/Advance
- No permadeath: defeat shows "Retry Floor" (with squad swap) or "Abandon Run"
- Squad Select screen reachable on retry and after champion rewards
- Victory screen with Shards earned; defeat screen with best-floor stat

**Champions**
- 24-ability pool across all 4 affinities + universal abilities
- Affinity-biased ability selection (60% on-theme, 40% universal)
- 5 rarity tiers: Common → Uncommon → Rare → Epic → Legendary
- Stat budget scales with rarity; Legendary has ~2.4× Common's total budget
- Mulberry32 seeded PRNG — deterministic champion generation per run seed

**Combat Engine**
- Auto-battle with SPD-ordered turns
- Status effects: Burn 🔥 (DoT), Poison ☠️ (DoT), Freeze ❄️ (skip turn), Stun ⚡ (60% skip)
- Counter-affinity damage bonus: +25% when attacking your counter target
- Synergy bonuses: ×2 same affinity → +10% ATK; ×3 → +10% ATK/DEF; ×4+ → +20% ATK/DEF +15% SPD
- Buff/debuff system with turn duration
- `CombatEntryType` on every log entry (damage/heal/buff/debuff/dot/status/miss)

**Zones**
- 4 dungeons: Ember Wastes (Fire), Glacial Depths (Water), Storm Citadel (Lightning), Ancient Roots (Earth)
- Each zone has dominant enemy affinity (70% bias) and unique stat modifiers
- Boss floors (multiples of 5 and maxFloor): 4 enemies, stronger scaling, ⚔️ prefix on leader

**Meta-Progression**
- Shards currency earned from runs (floor-scaled)
- Perk Shop with 5 perks: Veteran Recruiter, Battle Hardened, Tactical Advantage, Scavenger, Deep Pockets
- Currency multipliers from perks stack multiplicatively
- `RunModifiers` applied at run start from purchased perks

**Tier 1 Visuals**
- Affinity-gradient champion cards (Fire = red/orange, Water = cyan/blue, etc.)
- Rarity glow shadows (Common = none; Legendary = intense gold box shadow)
- Rarity gem symbols: Common ○, Uncommon ◆, Rare ★, Epic ◈, Legendary ✦
- Animated combat log: 180ms per entry, colored by entry type
- Live HP bars: replay combat log to compute displayed HP per animation frame
- Flash effects: damage → `animate-pulse`, heal → `animate-ping`
- Floor progress tracker with boss floor indicators (⚔ icon, yellow highlight on current)
- Status badges shown after combat animation completes

**Persistence**
- `localStorage` with key `champion-forge:meta`
- Forward-compatible: new fields spread over defaults, old saves not corrupted

**Testing**
- Vitest 4 with V8 coverage
- 48 tests across: rng, champion, synergy, combat, floor, rewards, perks
- 80% line coverage threshold on `src/engine/**` and `src/data/**`

### Infrastructure
- Next.js 16.2.9 (App Router, Turbopack)
- React 19, TypeScript strict mode
- Zustand 5 for game state machine
- Tailwind CSS 4
- GitHub repo: [metalphan/champion-forge](https://github.com/metalphan/champion-forge)
