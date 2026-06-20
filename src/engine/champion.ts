import { type Rng } from "./rng";
import { type Ability, type Champion, type Rarity, type Affinity, type Stats } from "./types";

// ─── Static tables ───────────────────────────────────────────────────────────

const RARITIES: Rarity[] = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
const AFFINITIES: Affinity[] = ["Fire", "Water", "Earth", "Lightning"];

export const RARITY_BUDGET: Record<Rarity, number> = {
  Common: 1.0, Uncommon: 1.2, Rare: 1.45, Epic: 1.75, Legendary: 2.1,
};

const RARITY_WEIGHTS = [50, 28, 14, 6, 2];

const FIRST_NAMES = [
  "Iron","Shadow","Storm","Ember","Frost","Tide","Gale","Cinder",
  "Void","Stone","Blaze","Rune","Ash","Drake","Vex","Zara",
  "Kell","Mora","Sable","Thorn","Lumin","Crux","Nyx","Vael",
  "Dusk","Sear","Rime","Quake","Bolt","Surge","Vale","Grim",
];
const LAST_NAMES = [
  "heart","bane","fang","ward","blade","claw","eye","born",
  "forge","shroud","mantle","bind","veil","break","soul","tide",
  "ridge","mark","oath","spark","coil","deep","wind","root",
  "strike","fury","scale","drift","rift","gale","pyre","bloom",
];

// ─── Ability pool (24 abilities) ─────────────────────────────────────────────

export const ABILITY_POOL: Ability[] = [
  // ── Damage ──────────────────────────────────────────────────────────────
  { id:"smash",     name:"Smash",      description:"Deals 180% ATK to one enemy.",         cooldown:2, target:"single_enemy", effect:{kind:"damage",multiplier:1.8} },
  { id:"cleave",    name:"Cleave",     description:"Deals 80% ATK to all enemies.",         cooldown:3, target:"all_enemies",  effect:{kind:"damage",multiplier:0.8} },
  { id:"surge",     name:"Surge",      description:"Deals 240% ATK to one enemy.",          cooldown:4, target:"single_enemy", effect:{kind:"damage",multiplier:2.4} },
  { id:"volley",    name:"Volley",     description:"Deals 60% ATK to all enemies twice.",   cooldown:4, target:"all_enemies",  effect:{kind:"damage",multiplier:0.6} },
  { id:"execute",   name:"Execute",    description:"Deals 300% ATK to one enemy.",          cooldown:5, target:"single_enemy", effect:{kind:"damage",multiplier:3.0} },

  // ── Heal ────────────────────────────────────────────────────────────────
  { id:"mend",        name:"Mend",        description:"Restores 120% ATK HP to one ally.",   cooldown:2, target:"single_ally", effect:{kind:"heal",multiplier:1.2} },
  { id:"heal_pulse",  name:"Heal Pulse",  description:"Restores 60% ATK HP to all allies.",  cooldown:3, target:"all_allies",  effect:{kind:"heal",multiplier:0.6} },
  { id:"rejuvenate",  name:"Rejuvenate",  description:"Restores 200% ATK HP to one ally.",   cooldown:4, target:"single_ally", effect:{kind:"heal",multiplier:2.0} },

  // ── Buffs ────────────────────────────────────────────────────────────────
  { id:"fortify",    name:"Fortify",    description:"Boosts own DEF by 40% for 3 turns.",            cooldown:3, target:"self",      effect:{kind:"buff",stat:"def",multiplier:1.4,turns:3} },
  { id:"battle_cry", name:"Battle Cry", description:"Boosts all allies ATK by 25% for 2 turns.",    cooldown:4, target:"all_allies", effect:{kind:"buff",stat:"atk",multiplier:1.25,turns:2} },
  { id:"haste",      name:"Haste",      description:"Boosts own SPD by 50% for 2 turns.",           cooldown:3, target:"self",      effect:{kind:"buff",stat:"spd",multiplier:1.5,turns:2} },
  { id:"iron_wall",  name:"Iron Wall",  description:"Boosts all allies DEF by 30% for 3 turns.",    cooldown:5, target:"all_allies", effect:{kind:"buff",stat:"def",multiplier:1.3,turns:3} },
  { id:"war_cry",    name:"War Cry",    description:"Boosts self ATK by 60% for 2 turns.",          cooldown:3, target:"self",      effect:{kind:"buff",stat:"atk",multiplier:1.6,turns:2} },

  // ── Debuffs ──────────────────────────────────────────────────────────────
  { id:"rend",       name:"Rend",       description:"Reduces one enemy DEF by 30% for 3 turns.",    cooldown:3, target:"single_enemy", effect:{kind:"debuff",stat:"def",multiplier:0.7,turns:3} },
  { id:"enervate",   name:"Enervate",   description:"Reduces one enemy ATK by 35% for 2 turns.",    cooldown:3, target:"single_enemy", effect:{kind:"debuff",stat:"atk",multiplier:0.65,turns:2} },
  { id:"shatter",    name:"Shatter",    description:"Reduces all enemies DEF by 20% for 2 turns.",  cooldown:4, target:"all_enemies",  effect:{kind:"debuff",stat:"def",multiplier:0.8,turns:2} },

  // ── Status effects ────────────────────────────────────────────────────────
  {
    id:"incinerate", name:"Incinerate",
    description:"Ignites one enemy — burns for 15% ATK/turn for 3 turns.",
    cooldown:3, target:"single_enemy",
    effect:{kind:"status",status:"burn",duration:3},
  },
  {
    id:"wildfire", name:"Wildfire",
    description:"Ignites all enemies — each burns for 12% ATK/turn for 2 turns.",
    cooldown:4, target:"all_enemies",
    effect:{kind:"status",status:"burn",duration:2},
  },
  {
    id:"toxic_sting", name:"Toxic Sting",
    description:"Poisons one enemy — deals 20 damage/turn for 4 turns.",
    cooldown:3, target:"single_enemy",
    effect:{kind:"status",status:"poison",duration:4,value:20},
  },
  {
    id:"plague", name:"Plague",
    description:"Poisons all enemies for 3 turns.",
    cooldown:5, target:"all_enemies",
    effect:{kind:"status",status:"poison",duration:3,value:15},
  },
  {
    id:"flash_freeze", name:"Flash Freeze",
    description:"Freezes one enemy — skips their next 2 actions.",
    cooldown:4, target:"single_enemy",
    effect:{kind:"status",status:"freeze",duration:2},
  },
  {
    id:"blizzard", name:"Blizzard",
    description:"Freezes all enemies for 1 action each.",
    cooldown:5, target:"all_enemies",
    effect:{kind:"status",status:"freeze",duration:1},
  },
  {
    id:"thunderstrike", name:"Thunderstrike",
    description:"Stuns one enemy — 60% chance to skip actions for 2 turns.",
    cooldown:3, target:"single_enemy",
    effect:{kind:"status",status:"stun",duration:2},
  },
  {
    id:"chain_lightning", name:"Chain Lightning",
    description:"Stuns all enemies for 1 turn.",
    cooldown:5, target:"all_enemies",
    effect:{kind:"status",status:"stun",duration:1},
  },
];

// Affinities bias ability selection to thematically fitting abilities
const AFFINITY_ABILITY_BIAS: Record<Affinity, string[]> = {
  Fire:      ["incinerate","wildfire","smash","surge","war_cry","execute"],
  Water:     ["flash_freeze","blizzard","heal_pulse","mend","rejuvenate","rend"],
  Earth:     ["toxic_sting","plague","fortify","iron_wall","smash","rejuvenate"],
  Lightning: ["thunderstrike","chain_lightning","haste","surge","volley","enervate"],
};

// ─── Generation ──────────────────────────────────────────────────────────────

function rollRarity(rng: Rng): Rarity {
  const roll = rng.int(1, 100);
  let cumulative = 0;
  for (let i = 0; i < RARITIES.length; i++) {
    cumulative += RARITY_WEIGHTS[i];
    if (roll <= cumulative) return RARITIES[i];
  }
  return "Common";
}

function rollStats(rng: Rng, rarity: Rarity): Stats {
  const budget = RARITY_BUDGET[rarity];
  return {
    hp:  Math.round(rng.int(80,  120) * budget),
    atk: Math.round(rng.int(18,  28)  * budget),
    def: Math.round(rng.int(10,  20)  * budget),
    spd: rng.int(80, 120), // SPD intentionally not rarity-scaled
  };
}

function rollAbility(rng: Rng, affinity: Affinity): Ability {
  // 60% chance to pick from affinity-biased pool, 40% random
  const biased = AFFINITY_ABILITY_BIAS[affinity];
  if (rng.next() < 0.60) {
    const id = rng.pick(biased);
    const ability = ABILITY_POOL.find((a) => a.id === id);
    if (ability) return ability;
  }
  return rng.pick(ABILITY_POOL);
}

export function generateChampion(rng: Rng, idPrefix = "c"): Champion {
  const rarity   = rollRarity(rng);
  const affinity = rng.pick(AFFINITIES);
  const name     = `${rng.pick(FIRST_NAMES)}${rng.pick(LAST_NAMES)}`;
  const ability  = rollAbility(rng, affinity);
  return {
    id: `${idPrefix}-${rng.int(100000, 999999)}`,
    name,
    rarity,
    affinity,
    baseStats: rollStats(rng, rarity),
    ability,
  };
}

export function generateDraftPool(rng: Rng, count = 6): Champion[] {
  return Array.from({ length: count }, (_, i) => generateChampion(rng, `draft-${i}`));
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const RARITY_COLOR: Record<Rarity, string> = {
  Common:    "text-gray-400",
  Uncommon:  "text-green-400",
  Rare:      "text-blue-400",
  Epic:      "text-purple-400",
  Legendary: "text-yellow-400",
};

export const RARITY_GLOW: Record<Rarity, string> = {
  Common:    "",
  Uncommon:  "shadow-sm shadow-green-500/30",
  Rare:      "shadow-md shadow-blue-500/40",
  Epic:      "shadow-lg shadow-purple-500/50",
  Legendary: "shadow-xl shadow-yellow-400/60",
};

export const RARITY_GEM: Record<Rarity, string> = {
  Common: "○", Uncommon: "◆", Rare: "◆", Epic: "◆", Legendary: "★",
};

export const AFFINITY_COLOR: Record<Affinity, string> = {
  Fire: "text-red-400", Water: "text-cyan-400",
  Earth: "text-lime-400", Lightning: "text-yellow-300",
};

export const AFFINITY_EMOJI: Record<Affinity, string> = {
  Fire: "🔥", Water: "💧", Earth: "🌿", Lightning: "⚡",
};

export const AFFINITY_BORDER: Record<Affinity, string> = {
  Fire:      "border-red-500/50",
  Water:     "border-cyan-500/50",
  Earth:     "border-green-500/50",
  Lightning: "border-yellow-400/50",
};

export const AFFINITY_BG: Record<Affinity, string> = {
  Fire:      "bg-gradient-to-br from-red-950/50 to-orange-950/20",
  Water:     "bg-gradient-to-br from-cyan-950/50 to-blue-950/20",
  Earth:     "bg-gradient-to-br from-green-950/50 to-lime-950/20",
  Lightning: "bg-gradient-to-br from-yellow-950/50 to-amber-950/20",
};
