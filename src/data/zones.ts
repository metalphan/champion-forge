import { type Zone } from "@/engine/types";

export const ZONES: Zone[] = [
  {
    id: "ember_wastes",
    name: "Ember Wastes",
    affinity: "Fire",
    description: "A scorched battlefield where enemies fight with reckless aggression. They hit hard but leave themselves open.",
    icon: "🔥",
    floorCount: 10,
    modifier: {
      dominantAffinity: "Fire",
      enemyAtkMult: 1.15,
      enemyDefMult: 0.9,
      enemyHpMult: 1.0,
      enemySpdMult: 1.0,
      modifierLabel: "Enemies deal +15% damage but have -10% DEF",
    },
  },
  {
    id: "glacial_depths",
    name: "Glacial Depths",
    affinity: "Water",
    description: "A frozen dungeon where slow, armoured enemies stalk every corridor. Control the battlefield or be overwhelmed.",
    icon: "❄️",
    floorCount: 10,
    modifier: {
      dominantAffinity: "Water",
      enemyAtkMult: 0.9,
      enemyDefMult: 1.2,
      enemyHpMult: 1.1,
      enemySpdMult: 0.85,
      modifierLabel: "Enemies have +20% DEF and +10% HP but -15% SPD",
    },
  },
  {
    id: "storm_citadel",
    name: "Storm Citadel",
    affinity: "Lightning",
    description: "A fortress cracking with electricity. Enemies are blindingly fast but fragile — kill them before they act.",
    icon: "⚡",
    floorCount: 10,
    modifier: {
      dominantAffinity: "Lightning",
      enemyAtkMult: 1.05,
      enemyDefMult: 0.85,
      enemyHpMult: 0.85,
      enemySpdMult: 1.3,
      modifierLabel: "Enemies are +30% faster but have -15% HP and DEF",
    },
  },
  {
    id: "ancient_roots",
    name: "Ancient Roots",
    affinity: "Earth",
    description: "Deep underground, massive stone golems and poison-soaked beasts grind you down. Endurance and healing win here.",
    icon: "🌿",
    floorCount: 10,
    modifier: {
      dominantAffinity: "Earth",
      enemyAtkMult: 0.85,
      enemyDefMult: 1.15,
      enemyHpMult: 1.3,
      enemySpdMult: 0.9,
      modifierLabel: "Enemies have +30% HP and +15% DEF but -15% ATK",
    },
  },
];

export function getZone(id: string): Zone {
  return ZONES.find((z) => z.id === id) ?? ZONES[0];
}
