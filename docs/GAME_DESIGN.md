# Game Design Specification

## Vision

Champion Forge is a mobile-first roguelike where players draft a team of elemental champions and fight floor-by-floor through thematic dungeons. Inspired by RAID Shadow Legends' champion collecting and auto-battle mechanics, but compressed into a single-session roguelike loop.

**Core feeling:** "My team is perfectly tuned for this zone and it's destroying everything" vs "I need to rethink my draft for this boss."

---

## Core Loop

```
Pick a Zone
  → Draft 3 champions from a pool of 6+
    → Fight Floor 1 (auto-battle, animated)
      → Win: Choose a reward
        → Fight Floor 2 …
      → Lose: Retry (swap champions) or Abandon
  → Clear Floor 10 (boss) → Victory → Earn Shards
→ Spend Shards on perks → Better next run
```

---

## Champions

### Affinities

Four affinities form a counter cycle:

```
Fire  →  Earth  →  Lightning  →  Water  →  Fire
```

`→` means "counters" (deals +25% damage). No affinity advantage or disadvantage in a neutral matchup.

**Visual cues:**
- Fire: red/orange gradient + 🔥
- Water: cyan/blue gradient + 💧
- Earth: green/brown gradient + 🌿
- Lightning: purple/yellow gradient + ⚡

### Rarities

| Rarity | Stat Budget | Color | Glow |
|---|---|---|---|
| Common | 100 | Gray | None |
| Uncommon | 130 | Green | Subtle green |
| Rare | 160 | Blue | Blue |
| Epic | 195 | Purple | Purple |
| Legendary | 240 | Gold | Intense gold |

Stat budget is distributed across HP, ATK, DEF, SPD with some variance (~±15%).

### Stats

| Stat | Role |
|---|---|
| HP | Total damage before KO |
| ATK | Damage multiplier for abilities |
| DEF | Damage reduction for incoming hits |
| SPD | Turn priority (higher = acts first) |

### Abilities

Each champion has one active ability and a passive (basic attack).

**Current ability pool (24 abilities):**

| Category | Abilities |
|---|---|
| Fire | Power Strike, Fury Swipe, Incinerate (Burn DoT), Wildfire (AoE Burn) |
| Water | Aqua Blast, Tidal Wave, Flash Freeze (Freeze CC), Blizzard (AoE Freeze) |
| Earth | Boulder Smash, Earthquake, Toxic Sting (Poison DoT), Plague (AoE Poison) |
| Lightning | Shock Wave, Chain Lightning, Thunderstrike (Stun), Static Field (AoE Stun) |
| Universal | Iron Shield (DEF buff), Rally Cry (ATK buff team), Healing Rain (AoE heal), Enrage (self ATK↑), Exploit Weakness (DEF debuff), Weakening Blow, Vampiric Strike (lifesteal), Last Stand |

Affinity-biased selection: champions get a 60% chance to receive an on-theme ability, 40% universal pool.

---

## Combat

### Format

3 player champions vs 3-4 enemy champions (4 on boss floors). Both sides fight automatically.

### Turn Order

All living combatants sorted by SPD, descending, each round. Highest SPD acts first.

### Damage Formula

```
raw_damage = attacker.atk × ability.multiplier
counter_bonus = target_is_counter_match ? × 1.25 : × 1.0
damage_after_def = raw_damage × counter_bonus × (100 / (100 + defender.def))
final_damage = floor(damage_after_def)
```

### Status Effects

| Status | Source | Effect |
|---|---|---|
| 🔥 Burn | Fire abilities | `value` damage at start of each turn |
| ☠️ Poison | Earth abilities | `value` damage at start of each turn (stacks differently from burn) |
| ❄️ Freeze | Water abilities | Target skips their turn entirely for `duration` turns |
| ⚡ Stun | Lightning abilities | 60% chance to skip turn each turn for `duration` turns |

Status-inflicting abilities deal 50% ATK upfront + apply the status effect.

### Synergy Bonuses

Applied when multiple team members share an affinity:

| Count | Bonus |
|---|---|
| 2 | +10% ATK |
| 3 | +10% ATK, +10% DEF |
| 4+ | +20% ATK, +20% DEF, +15% SPD |

---

## Zones

Four dungeon zones, each with a dominant affinity and enemy stat modifiers:

| Zone | Affinity | Modifier Summary | Challenge |
|---|---|---|---|
| Ember Wastes | Fire 🔥 | +15% enemy ATK, -10% enemy DEF | Enemies hit hard, die fast — race to kill them first |
| Glacial Depths | Water 💧 | +20% enemy DEF, +10% enemy HP, -15% SPD | Tanky slow enemies — bring ATK or AoE |
| Storm Citadel | Lightning ⚡ | +30% enemy SPD, -15% enemy HP/DEF | Enemies act first every round — burst them down |
| Ancient Roots | Earth 🌿 | +30% enemy HP, +15% enemy DEF, -15% enemy ATK | Pure endurance — bring healing or DEF debuffs |

Enemy affinity: 70% chance each enemy uses zone's dominant affinity, 30% random. Counter-pick the zone's affinity in your draft for a significant advantage.

### Boss Floors

Floors that are multiples of 5 OR the zone's `maxFloor` are boss floors:
- 4 enemies instead of 3
- Boss leader receives +2 per-floor bonus to scaling
- Boss leader name has ⚔️ prefix

---

## Progression

### Within a Run

1. **Draft**: Select 3 champions from a pool of 6+ (pool size increases with Veteran Recruiter perk)
2. **Floor rewards**: After each win, choose one of three rewards:
   - New champion added to roster (routes through Squad Select for team management)
   - Stat boost (+ATK/DEF/HP/SPD) applied to a current team member
3. **Squad Select**: Any time a new champion joins or a floor is retried, the player picks their active 3 from the full roster
4. **Run end**: Earn Shards based on floors cleared. Currency multiplier applies from perks.

### Meta-Progression (Perk Shop)

Shards persist between runs and are spent on permanent perks:

| Perk | Cost | Effect | Max |
|---|---|---|---|
| Veteran Recruiter | 80⚜️ | +2 champions in draft pool | 2× |
| Battle Hardened | 60⚜️ | +30 max HP on all champions | 3× |
| Tactical Advantage | 100⚜️ | -5% enemy floor scaling | 3× |
| Scavenger | 120⚜️ | ×1.25 Shards per run | 2× |
| Deep Pockets | 200⚜️ | ×1.5 Shards per run | 1× |

Currency multipliers stack multiplicatively.

---

## Difficulty Scaling

Enemy stats scale per floor:

```
enemy_hp  = base_hp  × (1 + 0.15 × floor) × zone.enemyHpMult
enemy_atk = base_atk × (1 + 0.12 × floor) × zone.enemyAtkMult
enemy_def = base_def × (1 + 0.10 × floor) × zone.enemyDefMult
enemy_spd = base_spd × (1 + 0.08 × floor) × zone.enemySpdMult
```

`floorScaleReduction` perk reduces the per-floor multiplier (e.g. 0.05 reduction changes 0.15 → 0.10).

---

## Out of Scope (v1)

- PvP / multiplayer
- Competitive leaderboards
- Champion trading
- Story / narrative campaign
- Manual combat mode (Phase 3 consideration)
