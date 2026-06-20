import { type Rng } from "./rng";
import { generateChampion } from "./champion";
import { type Champion, type Stats, type Zone } from "./types";

function scaleStats(base: Stats, floor: number, scaleReduction = 0): Stats {
  const rate = Math.max(0.02, 0.12 - scaleReduction);
  const mult = Math.pow(1 + rate, floor - 1);
  return {
    hp:  Math.round(base.hp  * mult),
    atk: Math.round(base.atk * mult),
    def: Math.round(base.def * mult),
    spd: Math.round(base.spd * (1 + (floor - 1) * 0.03)),
  };
}

export function generateEnemyTeam(
  rng: Rng,
  floor: number,
  maxFloor: number,
  zone?: Zone
): Champion[] {
  const isBoss = floor === maxFloor || floor % 5 === 0;
  const teamSize = isBoss ? 4 : 3;

  return Array.from({ length: teamSize }, (_, i) => {
    // 70% chance to use zone's dominant affinity so enemies feel thematic
    const base = generateChampion(rng, `enemy-f${floor}-${i}`);
    const useZoneAffinity = zone && rng.next() < 0.7;
    const champ: Champion = useZoneAffinity
      ? { ...base, affinity: zone!.modifier.dominantAffinity }
      : base;

    return {
      ...champ,
      name: isBoss && i === 0 ? `⚔️ ${champ.name}` : champ.name,
      baseStats: scaleStats(champ.baseStats, floor + (isBoss ? 2 : 0)),
    };
  });
}

export function isBossFloor(floor: number, maxFloor: number): boolean {
  return floor === maxFloor || floor % 5 === 0;
}
