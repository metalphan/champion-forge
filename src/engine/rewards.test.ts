import { describe, it, expect } from "vitest";
import { createRng } from "./rng";
import { generateChampion } from "./champion";
import { generateRewards } from "./rewards";

function makeTeam(seed: number) {
  return Array.from({ length: 3 }, (_, i) => generateChampion(createRng(seed + i), `t${i}`));
}

describe("generateRewards", () => {
  it("returns exactly 3 options", () => {
    const rewards = generateRewards(createRng(1), makeTeam(10), 1);
    expect(rewards).toHaveLength(3);
  });

  it("at least one option is a champion", () => {
    const rewards = generateRewards(createRng(5), makeTeam(20), 1);
    expect(rewards.some((r) => r.kind === "champion")).toBe(true);
  });

  it("champion options include a champion object", () => {
    const rewards = generateRewards(createRng(2), makeTeam(30), 1);
    for (const r of rewards) {
      if (r.kind === "champion") {
        expect(r.champion).toBeTruthy();
        expect(r.champion!.name).toBeTruthy();
      }
    }
  });

  it("stat_boost options have valid boost data", () => {
    const rewards = generateRewards(createRng(3), makeTeam(40), 1);
    for (const r of rewards) {
      if (r.kind === "stat_boost") {
        expect(r.boostStat).toBeTruthy();
        expect(r.boostAmount).toBeGreaterThan(0);
        expect(r.boostTarget).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("is deterministic for the same seed and team", () => {
    const team = makeTeam(99);
    const r1 = generateRewards(createRng(7), team, 3);
    const r2 = generateRewards(createRng(7), team, 3);
    expect(r1[0].label).toBe(r2[0].label);
    expect(r1[1].label).toBe(r2[1].label);
  });

  it("boost amount is larger on higher floors", () => {
    const team = makeTeam(50);
    const low = generateRewards(createRng(1), team, 1);
    const high = generateRewards(createRng(1), team, 9);
    const lowBoost = low.find((r) => r.kind === "stat_boost")?.boostAmount ?? 0;
    const highBoost = high.find((r) => r.kind === "stat_boost")?.boostAmount ?? 0;
    expect(highBoost).toBeGreaterThanOrEqual(lowBoost);
  });
});
