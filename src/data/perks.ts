import { type Perk } from "@/engine/types";

export const PERKS: Perk[] = [
  {
    id: "veteran_recruiter",
    name: "Veteran Recruiter",
    description: "Draft pool shows 2 extra champions each run.",
    cost: 80,
    maxPurchases: 2,
    icon: "🎯",
    effect: { kind: "extra_draft_slots", amount: 2 },
  },
  {
    id: "battle_hardened",
    name: "Battle Hardened",
    description: "All champions start each run with +30 bonus HP.",
    cost: 60,
    maxPurchases: 3,
    icon: "🛡️",
    effect: { kind: "starting_hp_bonus", amount: 30 },
  },
  {
    id: "tactical_advantage",
    name: "Tactical Advantage",
    description: "Enemy floor scaling is reduced by 5% per purchase.",
    cost: 100,
    maxPurchases: 3,
    icon: "⚔️",
    effect: { kind: "floor_scale_reduction", amount: 0.05 },
  },
  {
    id: "scavenger",
    name: "Scavenger",
    description: "Earn 25% more currency from every run.",
    cost: 120,
    maxPurchases: 2,
    icon: "💰",
    effect: { kind: "currency_multiplier", multiplier: 1.25 },
  },
  {
    id: "deep_pockets",
    name: "Deep Pockets",
    description: "Earn 50% more currency from every run.",
    cost: 200,
    maxPurchases: 1,
    icon: "💎",
    effect: { kind: "currency_multiplier", multiplier: 1.5 },
  },
];

export function getPerk(id: string): Perk | undefined {
  return PERKS.find((p) => p.id === id);
}

/** Compute RunModifiers from purchased perk IDs */
export function calcRunModifiers(purchasedPerks: string[]) {
  let extraDraftSlots = 0;
  let startingHpBonus = 0;
  let floorScaleReduction = 0;

  for (const id of purchasedPerks) {
    const perk = getPerk(id);
    if (!perk) continue;
    if (perk.effect.kind === "extra_draft_slots") extraDraftSlots += perk.effect.amount;
    if (perk.effect.kind === "starting_hp_bonus") startingHpBonus += perk.effect.amount;
    if (perk.effect.kind === "floor_scale_reduction") floorScaleReduction += perk.effect.amount;
  }

  return { extraDraftSlots, startingHpBonus, floorScaleReduction };
}

/** Currency multiplier from purchased perks */
export function calcCurrencyMultiplier(purchasedPerks: string[]): number {
  let mult = 1;
  for (const id of purchasedPerks) {
    const perk = getPerk(id);
    if (perk?.effect.kind === "currency_multiplier") mult *= perk.effect.multiplier;
  }
  return mult;
}
