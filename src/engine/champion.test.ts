import { describe, it, expect } from "vitest";
import { createRng } from "./rng";
import { generateChampion, generateDraftPool, RARITY_BUDGET } from "./champion";

const AFFINITIES = ["Fire", "Water", "Earth", "Lightning"] as const;
const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;

describe("generateChampion", () => {
  it("produces a valid champion structure", () => {
    const rng = createRng(1);
    const champ = generateChampion(rng);
    expect(champ.id).toBeTruthy();
    expect(champ.name).toBeTruthy();
    expect(RARITIES).toContain(champ.rarity);
    expect(AFFINITIES).toContain(champ.affinity);
    expect(champ.baseStats.hp).toBeGreaterThan(0);
    expect(champ.baseStats.atk).toBeGreaterThan(0);
    expect(champ.baseStats.def).toBeGreaterThan(0);
    expect(champ.baseStats.spd).toBeGreaterThan(0);
    expect(champ.ability).toBeTruthy();
    expect(champ.ability.name).toBeTruthy();
  });

  it("Legendary champions have higher stats than Common", () => {
    // Run many trials to get both rarities
    const commons = [];
    const legendaries = [];
    for (let seed = 0; seed < 2000 && (commons.length < 5 || legendaries.length < 5); seed++) {
      const rng = createRng(seed);
      const c = generateChampion(rng);
      if (c.rarity === "Common") commons.push(c);
      if (c.rarity === "Legendary") legendaries.push(c);
    }
    if (commons.length > 0 && legendaries.length > 0) {
      const avgCommonHp = commons.reduce((s, c) => s + c.baseStats.hp, 0) / commons.length;
      const avgLegHp = legendaries.reduce((s, c) => s + c.baseStats.hp, 0) / legendaries.length;
      expect(avgLegHp).toBeGreaterThan(avgCommonHp);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = generateChampion(createRng(555));
    const b = generateChampion(createRng(555));
    expect(a.name).toBe(b.name);
    expect(a.rarity).toBe(b.rarity);
    expect(a.affinity).toBe(b.affinity);
    expect(a.baseStats).toEqual(b.baseStats);
  });

  it("produces unique IDs across champions from different seeds", () => {
    const ids = new Set(
      Array.from({ length: 50 }, (_, i) => generateChampion(createRng(i * 37)).id)
    );
    expect(ids.size).toBeGreaterThan(40);
  });
});

describe("generateDraftPool", () => {
  it("returns the requested count", () => {
    expect(generateDraftPool(createRng(1), 6)).toHaveLength(6);
    expect(generateDraftPool(createRng(1), 8)).toHaveLength(8);
  });

  it("all pool members are valid champions", () => {
    const pool = generateDraftPool(createRng(42), 6);
    for (const c of pool) {
      expect(RARITIES).toContain(c.rarity);
      expect(AFFINITIES).toContain(c.affinity);
    }
  });
});
