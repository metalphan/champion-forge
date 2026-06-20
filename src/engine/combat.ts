import { type Rng } from "./rng";
import {
  COUNTER_AFFINITY,
  COUNTER_DAMAGE_BONUS,
  type Champion,
  type CombatChampion,
  type CombatLogEntry,
  type CombatResult,
  type Stats,
  type StatusEffect,
  type ZoneModifier,
} from "./types";
import { calcSynergies, applyStatSynergies } from "./synergy";

// ─── Setup ───────────────────────────────────────────────────────────────────

function initCombatant(
  champion: Champion,
  teamSynergies: ReturnType<typeof calcSynergies>,
  hpBonus = 0
): CombatChampion {
  const effectiveStats = applyStatSynergies({ ...champion.baseStats }, champion, teamSynergies);
  const maxHp = effectiveStats.hp + hpBonus;
  return {
    champion,
    currentHp: maxHp,
    maxHp,
    effectiveStats: { ...effectiveStats, hp: maxHp },
    cooldownRemaining: 0,
    buffs: [],
    statusEffects: [],
    isAlive: true,
  };
}

// ─── Stat helpers ────────────────────────────────────────────────────────────

function getEffectiveStats(c: CombatChampion): Stats {
  let { atk, def, spd, hp } = c.effectiveStats;
  for (const buff of c.buffs) {
    if (buff.stat === "atk") atk = Math.round(atk * buff.multiplier);
    if (buff.stat === "def") def = Math.round(def * buff.multiplier);
    if (buff.stat === "spd") spd = Math.round(spd * buff.multiplier);
  }
  return { hp, atk, def, spd };
}

function calcDamage(atk: number, defenderDef: number, counterBonus: number): number {
  const dr = defenderDef / (defenderDef + 150);
  return Math.max(1, Math.round(atk * (1 - dr) * (1 + counterBonus)));
}

function isCounterMatch(attacker: Champion, defender: Champion): boolean {
  return COUNTER_AFFINITY[attacker.affinity] === defender.affinity;
}

// ─── Status effect ticks ─────────────────────────────────────────────────────

function processStatusEffects(
  combatant: CombatChampion,
  turn: number,
  log: CombatLogEntry[]
): void {
  for (const effect of combatant.statusEffects) {
    if (effect.kind === "burn" || effect.kind === "poison") {
      const dmg = effect.value;
      combatant.currentHp = Math.max(0, combatant.currentHp - dmg);
      if (combatant.currentHp === 0) combatant.isAlive = false;
      log.push({
        turn,
        actor: effect.kind === "burn" ? "🔥 Burn" : "☠️ Poison",
        action: effect.kind === "burn" ? "Burn" : "Poison",
        entryType: "dot",
        value: dmg,
        target: combatant.champion.name,
      });
    }
  }
}

function tickStatusEffects(c: CombatChampion): void {
  c.statusEffects = c.statusEffects
    .map((e) => ({ ...e, turnsLeft: e.turnsLeft - 1 }))
    .filter((e) => e.turnsLeft > 0);
}

function isFrozenOrStunned(c: CombatChampion, rng: Rng): boolean {
  for (const e of c.statusEffects) {
    if (e.kind === "freeze") return true;
    if (e.kind === "stun" && rng.next() < 0.6) return true; // 60% chance to miss
  }
  return false;
}

function tickBuffs(c: CombatChampion): void {
  c.buffs = c.buffs.map((b) => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter((b) => b.turnsLeft > 0);
}

// ─── Action resolver ─────────────────────────────────────────────────────────

function resolveAction(
  actor: CombatChampion,
  allies: CombatChampion[],
  enemies: CombatChampion[],
  turn: number,
  log: CombatLogEntry[],
  rng: Rng
): void {
  const aliveEnemies = enemies.filter((e) => e.isAlive);
  const aliveAllies = allies.filter((a) => a.isAlive);
  if (aliveEnemies.length === 0) return;

  const actorStats = getEffectiveStats(actor);
  const useAbility = actor.cooldownRemaining === 0;

  if (useAbility) {
    actor.cooldownRemaining = actor.champion.ability.cooldown;
    const { effect, target, name } = actor.champion.ability;

    const targets =
      target === "single_enemy" ? [aliveEnemies[rng.int(0, aliveEnemies.length - 1)]] :
      target === "all_enemies"  ? aliveEnemies :
      target === "single_ally"  ? [aliveAllies[rng.int(0, aliveAllies.length - 1)]] :
      target === "all_allies"   ? aliveAllies :
      [actor]; // self

    for (const t of targets) {
      if (effect.kind === "damage") {
        const counter = isCounterMatch(actor.champion, t.champion) ? COUNTER_DAMAGE_BONUS : 0;
        const dmg = calcDamage(Math.round(actorStats.atk * effect.multiplier), getEffectiveStats(t).def, counter);
        t.currentHp = Math.max(0, t.currentHp - dmg);
        if (t.currentHp === 0) t.isAlive = false;
        log.push({ turn, actor: actor.champion.name, action: name, entryType: "damage", value: dmg, target: t.champion.name });
      } else if (effect.kind === "heal") {
        const amount = Math.round(actorStats.atk * effect.multiplier);
        t.currentHp = Math.min(t.maxHp, t.currentHp + amount);
        log.push({ turn, actor: actor.champion.name, action: name, entryType: "heal", value: amount, target: t.champion.name });
      } else if (effect.kind === "buff") {
        t.buffs.push({ stat: effect.stat, multiplier: effect.multiplier, turnsLeft: effect.turns });
        log.push({ turn, actor: actor.champion.name, action: name, entryType: "buff", target: t.champion.name });
      } else if (effect.kind === "debuff") {
        t.buffs.push({ stat: effect.stat, multiplier: effect.multiplier, turnsLeft: effect.turns });
        log.push({ turn, actor: actor.champion.name, action: name, entryType: "debuff", target: t.champion.name });
      } else if (effect.kind === "status") {
        const existing = t.statusEffects.find((s) => s.kind === effect.status);
        const statusValue = effect.value ?? Math.round(actorStats.atk * 0.15);
        if (existing) {
          existing.turnsLeft = Math.max(existing.turnsLeft, effect.duration);
        } else {
          t.statusEffects.push({ kind: effect.status, turnsLeft: effect.duration, value: statusValue });
        }
        const icon = effect.status === "burn" ? "🔥" : effect.status === "poison" ? "☠️" : effect.status === "freeze" ? "❄️" : "⚡";
        log.push({ turn, actor: actor.champion.name, action: name, entryType: "status", target: t.champion.name });
        // Also deal upfront damage for burn/poison abilities
        if (effect.kind === "status" && (effect.status === "burn" || effect.status === "poison")) {
          const dmg = Math.round(actorStats.atk * 0.5);
          t.currentHp = Math.max(0, t.currentHp - dmg);
          if (t.currentHp === 0) t.isAlive = false;
          log.push({ turn, actor: actor.champion.name, action: `${icon} ${name} hit`, entryType: "damage", value: dmg, target: t.champion.name });
        }
      }
    }
  } else {
    // Basic attack
    const t = aliveEnemies[rng.int(0, aliveEnemies.length - 1)];
    const counter = isCounterMatch(actor.champion, t.champion) ? COUNTER_DAMAGE_BONUS : 0;
    const dmg = calcDamage(actorStats.atk, getEffectiveStats(t).def, counter);
    t.currentHp = Math.max(0, t.currentHp - dmg);
    if (t.currentHp === 0) t.isAlive = false;
    log.push({ turn, actor: actor.champion.name, action: "Attack", entryType: "damage", value: dmg, target: t.champion.name });
  }

  if (actor.cooldownRemaining > 0 && !useAbility) actor.cooldownRemaining--;
}

// ─── Main resolver ───────────────────────────────────────────────────────────

export function resolveCombat(
  playerTeam: Champion[],
  enemyTeam: Champion[],
  rng: Rng,
  playerHpBonus = 0,
  zoneModifier?: ZoneModifier
): CombatResult & { playerCombatants: CombatChampion[]; enemyCombatants: CombatChampion[] } {
  const playerSynergies = calcSynergies(playerTeam);
  const enemySynergies = calcSynergies(enemyTeam);

  const players = playerTeam.map((c) => initCombatant(c, playerSynergies, playerHpBonus));
  const enemies = enemyTeam.map((c) => {
    const e = initCombatant(c, enemySynergies);
    if (zoneModifier) {
      e.effectiveStats = {
        hp: Math.round(e.effectiveStats.hp * zoneModifier.enemyHpMult),
        atk: Math.round(e.effectiveStats.atk * zoneModifier.enemyAtkMult),
        def: Math.round(e.effectiveStats.def * zoneModifier.enemyDefMult),
        spd: Math.round(e.effectiveStats.spd * zoneModifier.enemySpdMult),
      };
      e.maxHp = e.effectiveStats.hp;
      e.currentHp = e.maxHp;
    }
    return e;
  });

  const log: CombatLogEntry[] = [];
  let turn = 1;
  const MAX_TURNS = 60;

  while (players.some((p) => p.isAlive) && enemies.some((e) => e.isAlive) && turn <= MAX_TURNS) {
    // Process DoT for all living combatants at start of turn
    [...players, ...enemies].filter((c) => c.isAlive).forEach((c) => {
      processStatusEffects(c, turn, log);
    });

    // Re-check alive after DoT
    if (!players.some((p) => p.isAlive) || !enemies.some((e) => e.isAlive)) break;

    // Order by effective SPD
    const order = [
      ...players.filter((p) => p.isAlive).map((c) => ({ c, isPlayer: true })),
      ...enemies.filter((e) => e.isAlive).map((c) => ({ c, isPlayer: false })),
    ].sort((a, b) => getEffectiveStats(b.c).spd - getEffectiveStats(a.c).spd);

    for (const { c, isPlayer } of order) {
      if (!c.isAlive) continue;
      const foes = isPlayer ? enemies : players;
      const allies = isPlayer ? players : enemies;

      if (!foes.some((f) => f.isAlive)) break;

      // Check freeze/stun
      if (isFrozenOrStunned(c, rng)) {
        log.push({ turn, actor: c.champion.name, action: "Skipped", entryType: "miss" });
        continue;
      }

      resolveAction(c, allies, foes, turn, log, rng);
    }

    [...players, ...enemies].filter((c) => c.isAlive).forEach((c) => {
      tickBuffs(c);
      tickStatusEffects(c);
    });

    turn++;
  }

  const playerWon = players.some((p) => p.isAlive) && !enemies.some((e) => e.isAlive);
  return { playerWon, log, floorsCleared: 0, playerCombatants: players, enemyCombatants: enemies };
}
