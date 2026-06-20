import { describe, it, expect } from "vitest";
import { createRng } from "./rng";
import { generateChampion } from "./champion";
import { calcSynergies, applyStatSynergies } from "./synergy";
import type { Champion } from "./types";

function makeChampion(affinity: Champion["affinity"]): Champion {
  const rng = createRng(Math.random() * 1e9);
  return { ...generateChampion(rng), affinity };
}

describe("calcSynergies", () => {
  it("returns empty for no shared affinity", () => {
    const team = [
      makeChampion("Fire"),
      makeChampion("Water"),
      makeChampion("Earth"),
    ];
    expect(calcSynergies(team)).toHaveLength(0);
  });

  it("detects ×2 synergy", () => {
    const team = [makeChampion("Fire"), makeChampion("Fire"), makeChampion("Water")];
    const syn = calcSynergies(team);
    expect(syn).toHaveLength(1);
    expect(syn[0].affinity).toBe("Fire");
    expect(syn[0].count).toBe(2);
    expect(syn[0].atkMult).toBeCloseTo(1.1);
  });

  it("detects ×3 synergy with higher bonus", () => {
    const team = [makeChampion("Lightning"), makeChampion("Lightning"), makeChampion("Lightning")];
    const syn = calcSynergies(team);
    expect(syn).toHaveLength(1);
    expect(syn[0].count).toBe(3);
    expect(syn[0].atkMult).toBeCloseTo(1.1);
    expect(syn[0].defMult).toBeCloseTo(1.1);
  });

  it("×4 gives max bonus", () => {
    const team = [
      makeChampion("Earth"), makeChampion("Earth"),
      makeChampion("Earth"), makeChampion("Earth"),
    ];
    const syn = calcSynergies(team);
    expect(syn[0].atkMult).toBeCloseTo(1.2);
    expect(syn[0].spdMult).toBeCloseTo(1.15);
  });
});

describe("applyStatSynergies", () => {
  it("boosts ATK for matching affinity", () => {
    const champ = makeChampion("Fire");
    const synergies = [{ affinity: "Fire" as const, count: 2, atkMult: 1.1, defMult: 1.0, spdMult: 1.0, label: "" }];
    const original = { ...champ.baseStats };
    const boosted = applyStatSynergies({ ...original }, champ, synergies);
    expect(boosted.atk).toBeCloseTo(Math.round(original.atk * 1.1));
    expect(boosted.hp).toBe(original.hp); // HP unchanged
  });

  it("does not boost non-matching affinity", () => {
    const champ = makeChampion("Water");
    const synergies = [{ affinity: "Fire" as const, count: 2, atkMult: 1.1, defMult: 1.0, spdMult: 1.0, label: "" }];
    const original = { ...champ.baseStats };
    const boosted = applyStatSynergies({ ...original }, champ, synergies);
    expect(boosted.atk).toBe(original.atk);
  });
});
