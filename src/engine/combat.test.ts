import { describe, it, expect } from "vitest";
import { createRng } from "./rng";
import { generateChampion } from "./champion";
import { resolveCombat } from "./combat";
import type { Champion } from "./types";

function makeTeam(seed: number, size = 3): Champion[] {
  const rng = createRng(seed);
  return Array.from({ length: size }, (_, i) => generateChampion(rng, `t${i}`));
}

describe("resolveCombat", () => {
  it("returns a winner (playerWon is boolean)", () => {
    const players = makeTeam(1);
    const enemies = makeTeam(2);
    const rng = createRng(3);
    const result = resolveCombat(players, enemies, rng);
    expect(typeof result.playerWon).toBe("boolean");
  });

  it("produces a non-empty combat log", () => {
    const result = resolveCombat(makeTeam(10), makeTeam(11), createRng(12));
    expect(result.log.length).toBeGreaterThan(0);
  });

  it("all log entries have required fields", () => {
    const result = resolveCombat(makeTeam(20), makeTeam(21), createRng(22));
    for (const entry of result.log) {
      expect(entry.turn).toBeGreaterThan(0);
      expect(entry.actor).toBeTruthy();
      expect(entry.action).toBeTruthy();
      expect(entry.entryType).toBeTruthy();
    }
  });

  it("when players win, at least one player has HP > 0", () => {
    for (let seed = 0; seed < 50; seed++) {
      const result = resolveCombat(makeTeam(seed), makeTeam(seed + 100), createRng(seed + 200));
      if (result.playerWon) {
        expect(result.playerCombatants.some((p) => p.currentHp > 0)).toBe(true);
        expect(result.enemyCombatants.every((e) => e.currentHp === 0)).toBe(true);
      }
    }
  });

  it("when players lose, all player HP is 0", () => {
    for (let seed = 0; seed < 50; seed++) {
      const result = resolveCombat(makeTeam(seed), makeTeam(seed + 100), createRng(seed + 200));
      if (!result.playerWon) {
        expect(result.playerCombatants.every((p) => p.currentHp === 0)).toBe(true);
      }
    }
  });

  it("is deterministic for the same seed", () => {
    const players = makeTeam(5);
    const enemies = makeTeam(6);
    const r1 = resolveCombat(players, enemies, createRng(7));
    const r2 = resolveCombat(players, enemies, createRng(7));
    expect(r1.playerWon).toBe(r2.playerWon);
    expect(r1.log).toHaveLength(r2.log.length);
  });

  it("startingHpBonus increases player maxHp", () => {
    const players = makeTeam(30);
    const enemies = makeTeam(31);
    const base = resolveCombat(players, enemies, createRng(32));
    const boosted = resolveCombat(players, enemies, createRng(32), 50);
    const baseMaxHp = base.playerCombatants[0].maxHp;
    const boostedMaxHp = boosted.playerCombatants[0].maxHp;
    expect(boostedMaxHp).toBe(baseMaxHp + 50);
  });

  it("counter-affinity produces damage bonus", () => {
    // Fire counters Earth — a pure Fire team vs pure Earth team should
    // produce some damage entries, and the fight should generally favor Fire
    const rng1 = createRng(99);
    const fireTeam: Champion[] = Array.from({ length: 3 }, (_, i) =>
      ({ ...generateChampion(createRng(i + 500), `f${i}`), affinity: "Fire" as const })
    );
    const earthTeam: Champion[] = Array.from({ length: 3 }, (_, i) =>
      ({ ...generateChampion(createRng(i + 600), `e${i}`), affinity: "Earth" as const })
    );

    let fireWins = 0;
    for (let s = 0; s < 20; s++) {
      const r = resolveCombat(fireTeam, earthTeam, createRng(s));
      if (r.playerWon) fireWins++;
    }
    // Fire should win more often against Earth (counter bonus)
    expect(fireWins).toBeGreaterThan(8);
  });
});
