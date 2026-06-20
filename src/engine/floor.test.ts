import { describe, it, expect } from "vitest";
import { createRng } from "./rng";
import { generateEnemyTeam, isBossFloor } from "./floor";
import { ZONES } from "@/data/zones";

describe("isBossFloor", () => {
  it("floor 5 and 10 are boss floors in a 10-floor zone", () => {
    expect(isBossFloor(5, 10)).toBe(true);
    expect(isBossFloor(10, 10)).toBe(true);
  });

  it("other floors are not bosses", () => {
    expect(isBossFloor(1, 10)).toBe(false);
    expect(isBossFloor(3, 10)).toBe(false);
    expect(isBossFloor(7, 10)).toBe(false);
  });
});

describe("generateEnemyTeam", () => {
  it("returns 3 enemies on normal floors", () => {
    const rng = createRng(1);
    const team = generateEnemyTeam(rng, 1, 10);
    expect(team).toHaveLength(3);
  });

  it("returns 4 enemies on boss floors", () => {
    const rng = createRng(2);
    const team = generateEnemyTeam(rng, 5, 10);
    expect(team).toHaveLength(4);
  });

  it("boss floor leader has ⚔️ prefix", () => {
    const rng = createRng(3);
    const team = generateEnemyTeam(rng, 5, 10);
    expect(team[0].name).toMatch(/^⚔️/);
  });

  it("enemies scale up in stats at higher floors", () => {
    const zone = ZONES[0];
    const floor1Team = generateEnemyTeam(createRng(10), 1, 10, zone);
    const floor8Team = generateEnemyTeam(createRng(10), 8, 10, zone);
    const f1Hp = floor1Team[0].baseStats.hp;
    const f8Hp = floor8Team[0].baseStats.hp;
    expect(f8Hp).toBeGreaterThan(f1Hp);
  });

  it("with a zone, most enemies match the dominant affinity", () => {
    const zone = ZONES[0]; // Fire zone
    let fireCount = 0;
    let total = 0;
    for (let s = 0; s < 20; s++) {
      const team = generateEnemyTeam(createRng(s), 1, 10, zone);
      for (const e of team) {
        if (e.affinity === "Fire") fireCount++;
        total++;
      }
    }
    // 70% bias means at least 50% should be Fire
    expect(fireCount / total).toBeGreaterThan(0.5);
  });
});
