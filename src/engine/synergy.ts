import { type Affinity, type Champion, type Stats } from "./types";

export interface SynergyBonus {
  affinity: Affinity;
  count: number;
  atkMult: number;
  defMult: number;
  spdMult: number;
  label: string;
}

/** Returns the active synergy bonuses for a given team */
export function calcSynergies(team: Champion[]): SynergyBonus[] {
  const counts: Partial<Record<Affinity, number>> = {};
  for (const c of team) {
    counts[c.affinity] = (counts[c.affinity] ?? 0) + 1;
  }

  const bonuses: SynergyBonus[] = [];
  for (const [affinity, count] of Object.entries(counts) as [Affinity, number][]) {
    if (count < 2) continue;
    if (count >= 4) {
      bonuses.push({
        affinity,
        count,
        atkMult: 1.2,
        defMult: 1.2,
        spdMult: 1.15,
        label: `${affinity} ×${count} — +20% ATK/DEF, +15% SPD`,
      });
    } else if (count === 3) {
      bonuses.push({
        affinity,
        count,
        atkMult: 1.1,
        defMult: 1.1,
        spdMult: 1.0,
        label: `${affinity} ×3 — +10% ATK/DEF`,
      });
    } else {
      bonuses.push({
        affinity,
        count,
        atkMult: 1.1,
        defMult: 1.0,
        spdMult: 1.0,
        label: `${affinity} ×2 — +10% ATK`,
      });
    }
  }
  return bonuses;
}

/** Apply synergy multipliers to a champion's stats */
export function applyStatSynergies(stats: Stats, champion: Champion, synergies: SynergyBonus[]): Stats {
  let { hp, atk, def, spd } = stats;
  for (const syn of synergies) {
    if (syn.affinity !== champion.affinity) continue;
    atk = Math.round(atk * syn.atkMult);
    def = Math.round(def * syn.defMult);
    spd = Math.round(spd * syn.spdMult);
  }
  return { hp, atk, def, spd };
}
