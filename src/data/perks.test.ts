import { describe, it, expect } from "vitest";
import { PERKS, calcRunModifiers, calcCurrencyMultiplier } from "./perks";

describe("PERKS", () => {
  it("all perks have required fields", () => {
    for (const perk of PERKS) {
      expect(perk.id).toBeTruthy();
      expect(perk.name).toBeTruthy();
      expect(perk.cost).toBeGreaterThan(0);
      expect(perk.maxPurchases).toBeGreaterThan(0);
    }
  });
});

describe("calcRunModifiers", () => {
  it("returns zeros with no perks", () => {
    const m = calcRunModifiers([]);
    expect(m.extraDraftSlots).toBe(0);
    expect(m.startingHpBonus).toBe(0);
    expect(m.floorScaleReduction).toBe(0);
  });

  it("accumulates extra_draft_slots", () => {
    const m = calcRunModifiers(["veteran_recruiter", "veteran_recruiter"]);
    expect(m.extraDraftSlots).toBe(4);
  });

  it("accumulates starting_hp_bonus", () => {
    const m = calcRunModifiers(["battle_hardened", "battle_hardened"]);
    expect(m.startingHpBonus).toBe(60);
  });

  it("accumulates floor_scale_reduction", () => {
    const m = calcRunModifiers(["tactical_advantage"]);
    expect(m.floorScaleReduction).toBeCloseTo(0.05);
  });
});

describe("calcCurrencyMultiplier", () => {
  it("returns 1 with no perks", () => {
    expect(calcCurrencyMultiplier([])).toBe(1);
  });

  it("multiplies for scavenger perk", () => {
    expect(calcCurrencyMultiplier(["scavenger"])).toBeCloseTo(1.25);
  });

  it("stacks multipliers", () => {
    expect(calcCurrencyMultiplier(["scavenger", "scavenger"])).toBeCloseTo(1.25 * 1.25);
  });
});
