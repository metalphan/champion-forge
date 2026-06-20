import { type Rng } from "./rng";
import { generateChampion } from "./champion";
import { type Champion, type RewardOption, type Stats } from "./types";

const STAT_LABELS: Record<keyof Stats, string> = {
  hp: "HP",
  atk: "ATK",
  def: "DEF",
  spd: "SPD",
};

/** Generate 3 distinct reward options after a floor clear */
export function generateRewards(
  rng: Rng,
  playerTeam: Champion[],
  floor: number
): RewardOption[] {
  const options: RewardOption[] = [];

  // Option 1: always a new champion
  const newChamp = generateChampion(rng, `reward-f${floor}`);
  options.push({
    kind: "champion",
    label: `Draft ${newChamp.name}`,
    description: `Add a ${newChamp.rarity} ${newChamp.affinity} champion to your team.`,
    champion: newChamp,
  });

  // Option 2: stat boost on a random team member
  if (playerTeam.length > 0) {
    const targetIdx = rng.int(0, playerTeam.length - 1);
    const target = playerTeam[targetIdx];
    const stat = rng.pick<keyof Stats>(["hp", "atk", "def", "spd"]);
    const boostPct = floor >= 7 ? 20 : floor >= 4 ? 15 : 10;
    const boostAmount = Math.round((target.baseStats[stat] * boostPct) / 100);
    options.push({
      kind: "stat_boost",
      label: `Empower ${target.name}`,
      description: `+${boostAmount} ${STAT_LABELS[stat]} (+${boostPct}%) for ${target.name}.`,
      boostTarget: targetIdx,
      boostStat: stat,
      boostAmount,
    });
  }

  // Option 3: another new champion (higher rarity weight) or a different stat boost
  const altChamp = generateChampion(rng, `reward-alt-f${floor}`);
  options.push({
    kind: "champion",
    label: `Draft ${altChamp.name}`,
    description: `Add a ${altChamp.rarity} ${altChamp.affinity} champion to your team.`,
    champion: altChamp,
  });

  return options;
}
