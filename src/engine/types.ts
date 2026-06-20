// ─── Enums & literals ──────────────────────────────────────────────────────

export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type Affinity = "Fire" | "Water" | "Earth" | "Lightning";
export type StatusKind = "burn" | "poison" | "freeze" | "stun";
export type CombatEntryType = "damage" | "heal" | "buff" | "debuff" | "dot" | "status" | "miss";

export type GamePhase =
  | "HOME"
  | "ZONE_SELECT"
  | "DRAFT"
  | "SQUAD_SELECT"
  | "COMBAT"
  | "REWARD"
  | "GAME_OVER"
  | "VICTORY";

// ─── Champion & ability ─────────────────────────────────────────────────────

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export type AbilityTarget =
  | "single_enemy"
  | "all_enemies"
  | "single_ally"
  | "all_allies"
  | "self";

export type AbilityEffect =
  | { kind: "damage"; multiplier: number }
  | { kind: "heal"; multiplier: number }
  | { kind: "buff"; stat: keyof Stats; multiplier: number; turns: number }
  | { kind: "debuff"; stat: keyof Stats; multiplier: number; turns: number }
  | { kind: "status"; status: StatusKind; duration: number; value?: number };

export interface Ability {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  target: AbilityTarget;
  effect: AbilityEffect;
}

export interface Champion {
  id: string;
  name: string;
  rarity: Rarity;
  affinity: Affinity;
  baseStats: Stats;
  ability: Ability;
}

// ─── In-combat state ────────────────────────────────────────────────────────

export interface StatusEffect {
  kind: StatusKind;
  turnsLeft: number;
  value: number; // damage per tick for burn/poison; unused for freeze/stun
}

export interface CombatChampion {
  champion: Champion;
  currentHp: number;
  maxHp: number;
  effectiveStats: Stats;
  cooldownRemaining: number;
  buffs: Array<{ stat: keyof Stats; multiplier: number; turnsLeft: number }>;
  statusEffects: StatusEffect[];
  isAlive: boolean;
}

export interface CombatLogEntry {
  turn: number;
  actor: string;
  action: string;
  entryType: CombatEntryType;
  value?: number;
  target?: string;
}

export interface CombatResult {
  playerWon: boolean;
  log: CombatLogEntry[];
  floorsCleared: number;
}

// ─── Run state ──────────────────────────────────────────────────────────────

export interface RewardOption {
  kind: "champion" | "stat_boost" | "ability_upgrade";
  label: string;
  description: string;
  champion?: Champion;
  boostTarget?: number;
  boostStat?: keyof Stats;
  boostAmount?: number;
}

export interface RunModifiers {
  extraDraftSlots: number;    // extra champions in the draft pool
  startingHpBonus: number;    // flat HP added to all champions at run start
  floorScaleReduction: number; // reduce enemy floor scaling (0–0.5)
}

export interface RunState {
  id: string;
  seed: number;
  floor: number;
  maxFloor: number;
  zoneId: string;
  playerTeam: Champion[];     // full roster (grows with rewards)
  currentCombatLog: CombatLogEntry[];
  pendingRewards: RewardOption[];
  outcome: "ongoing" | "victory" | "defeat";
  modifiers: RunModifiers;
}

// ─── Meta-progression ───────────────────────────────────────────────────────

export interface MetaState {
  currency: number;
  totalRuns: number;
  bestFloor: number;
  unlockedArchetypes: string[];
  purchasedPerks: string[];
}

// ─── Zones ──────────────────────────────────────────────────────────────────

export interface ZoneModifier {
  enemyAtkMult: number;
  enemyDefMult: number;
  enemySpdMult: number;
  enemyHpMult: number;
  /** Affinity that appears more frequently in enemy teams */
  dominantAffinity: Affinity;
  /** Short description shown on zone select */
  modifierLabel: string;
}

export interface Zone {
  id: string;
  name: string;
  affinity: Affinity;
  description: string;
  modifier: ZoneModifier;
  floorCount: number;
  icon: string;
}

// ─── Counter-affinity ────────────────────────────────────────────────────────

/** Returns the affinity that this affinity counters (deals bonus damage to) */
export const COUNTER_AFFINITY: Record<Affinity, Affinity> = {
  Fire: "Earth",
  Earth: "Lightning",
  Lightning: "Water",
  Water: "Fire",
};

export const COUNTER_DAMAGE_BONUS = 0.25; // +25% damage when countering

// ─── Perks ──────────────────────────────────────────────────────────────────

export type PerkEffect =
  | { kind: "extra_draft_slots"; amount: number }
  | { kind: "starting_hp_bonus"; amount: number }
  | { kind: "floor_scale_reduction"; amount: number }
  | { kind: "currency_multiplier"; multiplier: number };

export interface Perk {
  id: string;
  name: string;
  description: string;
  cost: number;
  maxPurchases: number;
  effect: PerkEffect;
  icon: string;
}
