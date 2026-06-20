"use client";

import { create } from "zustand";
import { createRng } from "@/engine/rng";
import { generateDraftPool } from "@/engine/champion";
import { generateEnemyTeam } from "@/engine/floor";
import { resolveCombat } from "@/engine/combat";
import { generateRewards } from "@/engine/rewards";
import { loadMeta, saveMeta, saveRun } from "@/lib/persistence";
import { ZONES, getZone } from "@/data/zones";
import { PERKS, calcRunModifiers, calcCurrencyMultiplier, getPerk } from "@/data/perks";
import type {
  Champion, CombatChampion, CombatLogEntry,
  GamePhase, MetaState, RewardOption, RunModifiers, RunState, Stats, Zone,
} from "@/engine/types";

const DEFAULT_MODIFIERS: RunModifiers = {
  extraDraftSlots: 0,
  startingHpBonus: 0,
  floorScaleReduction: 0,
};

interface GameStore {
  phase: GamePhase;
  run: RunState | null;
  activeZone: Zone | null;

  draftPool: Champion[];
  selectedDraft: Champion[];
  activeTeam: Champion[];

  combatLog: CombatLogEntry[];
  playerCombatants: CombatChampion[];
  enemyCombatants: CombatChampion[];
  combatWon: boolean;

  rewardOptions: RewardOption[];
  meta: MetaState;

  // Actions
  goToZoneSelect: () => void;
  selectZone: (zoneId: string) => void;
  toggleDraftSelection: (champion: Champion) => void;
  confirmDraft: () => void;
  confirmSquadSelect: () => void;
  retryFloor: () => void;
  abandonRun: () => void;
  advanceAfterCombat: () => void;
  pickReward: (option: RewardOption) => void;
  skipReward: () => void;
  returnHome: () => void;
  purchasePerk: (perkId: string) => void;
}

function buildRunCombat(
  activeTeam: Champion[],
  run: RunState,
  zone: Zone,
  seedExtra = 0
) {
  const rng = createRng(run.seed + run.floor * 1000 + seedExtra);
  const enemyTeam = generateEnemyTeam(rng, run.floor, run.maxFloor, zone);
  const result = resolveCombat(
    activeTeam,
    enemyTeam,
    rng,
    run.modifiers.startingHpBonus,
    zone.modifier
  );
  return result;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: "HOME",
  run: null,
  activeZone: null,
  draftPool: [],
  selectedDraft: [],
  activeTeam: [],
  combatLog: [],
  playerCombatants: [],
  enemyCombatants: [],
  combatWon: false,
  rewardOptions: [],
  meta: loadMeta(),

  goToZoneSelect() {
    set({ phase: "ZONE_SELECT" });
  },

  selectZone(zoneId) {
    const { meta } = get();
    const zone = getZone(zoneId);
    const modifiers = calcRunModifiers(meta.purchasedPerks);
    const draftSize = 6 + modifiers.extraDraftSlots;
    const seed = Date.now();
    const rng = createRng(seed);
    const draftPool = generateDraftPool(rng, draftSize);
    const run: RunState = {
      id: `run-${seed}`,
      seed,
      floor: 1,
      maxFloor: zone.floorCount,
      zoneId,
      playerTeam: [],
      currentCombatLog: [],
      pendingRewards: [],
      outcome: "ongoing",
      modifiers,
    };
    set({ phase: "DRAFT", run, activeZone: zone, draftPool, selectedDraft: [] });
  },

  toggleDraftSelection(champion) {
    const { selectedDraft, phase, run } = get();
    const maxPicks = phase === "SQUAD_SELECT" ? Math.min(3, run?.playerTeam.length ?? 3) : 3;
    const already = selectedDraft.find((c) => c.id === champion.id);
    if (already) {
      set({ selectedDraft: selectedDraft.filter((c) => c.id !== champion.id) });
    } else if (selectedDraft.length < maxPicks) {
      set({ selectedDraft: [...selectedDraft, champion] });
    }
  },

  confirmDraft() {
    const { run, selectedDraft, activeZone } = get();
    if (!run || !activeZone || selectedDraft.length !== 3) return;
    const updatedRun = { ...run, playerTeam: selectedDraft };
    const result = buildRunCombat(selectedDraft, updatedRun, activeZone);
    set({
      run: updatedRun,
      activeTeam: selectedDraft,
      combatLog: result.log,
      playerCombatants: result.playerCombatants,
      enemyCombatants: result.enemyCombatants,
      combatWon: result.playerWon,
      phase: "COMBAT",
      selectedDraft: [],
    });
  },

  confirmSquadSelect() {
    const { run, selectedDraft, activeZone } = get();
    if (!run || !activeZone || selectedDraft.length === 0) return;
    const result = buildRunCombat(selectedDraft, run, activeZone, Date.now() % 100000);
    set({
      activeTeam: selectedDraft,
      combatLog: result.log,
      playerCombatants: result.playerCombatants,
      enemyCombatants: result.enemyCombatants,
      combatWon: result.playerWon,
      phase: "COMBAT",
      selectedDraft: [],
    });
  },

  retryFloor() {
    const { activeTeam } = get();
    set({ phase: "SQUAD_SELECT", selectedDraft: [...activeTeam] });
  },

  abandonRun() {
    const { run, meta } = get();
    if (!run) return;
    const currMult = calcCurrencyMultiplier(meta.purchasedPerks);
    const earned = Math.round(run.floor * 10 * currMult);
    const newMeta: MetaState = {
      ...meta,
      totalRuns: meta.totalRuns + 1,
      bestFloor: Math.max(meta.bestFloor, run.floor),
      currency: meta.currency + earned,
    };
    saveMeta(newMeta);
    saveRun({ ...run, outcome: "defeat" });
    set({ phase: "GAME_OVER", meta: newMeta, run: { ...run, outcome: "defeat" } });
  },

  advanceAfterCombat() {
    const { run, meta, activeTeam, activeZone } = get();
    if (!run || !activeZone) return;

    if (run.floor >= run.maxFloor) {
      const currMult = calcCurrencyMultiplier(meta.purchasedPerks);
      const earned = Math.round(run.maxFloor * 25 * currMult);
      const newMeta: MetaState = {
        ...meta,
        totalRuns: meta.totalRuns + 1,
        bestFloor: run.maxFloor,
        currency: meta.currency + earned,
      };
      saveMeta(newMeta);
      saveRun({ ...run, outcome: "victory" });
      set({ phase: "VICTORY", meta: newMeta, run: { ...run, outcome: "victory" } });
      return;
    }

    const rng = createRng(run.seed + run.floor * 999);
    const rewards = generateRewards(rng, activeTeam, run.floor);
    set({ phase: "REWARD", rewardOptions: rewards });
  },

  pickReward(option) {
    const { run, activeTeam, activeZone } = get();
    if (!run || !activeZone) return;
    const nextFloor = run.floor + 1;

    if (option.kind === "champion" && option.champion) {
      const newRoster = [...run.playerTeam, option.champion];
      const updatedRun = { ...run, playerTeam: newRoster, floor: nextFloor };
      set({ run: updatedRun, phase: "SQUAD_SELECT", selectedDraft: [...activeTeam] });
    } else if (
      option.kind === "stat_boost" &&
      option.boostTarget !== undefined &&
      option.boostStat && option.boostAmount !== undefined
    ) {
      const boostedId = activeTeam[option.boostTarget].id;
      const applyBoost = (c: Champion): Champion =>
        c.id !== boostedId ? c : {
          ...c,
          baseStats: { ...c.baseStats, [option.boostStat!]: c.baseStats[option.boostStat!] + option.boostAmount! } as Stats,
        };
      const newActive = activeTeam.map(applyBoost);
      const newRoster = run.playerTeam.map(applyBoost);
      const updatedRun = { ...run, playerTeam: newRoster, floor: nextFloor };
      const result = buildRunCombat(newActive, updatedRun, activeZone);
      set({
        run: updatedRun, activeTeam: newActive,
        combatLog: result.log, playerCombatants: result.playerCombatants,
        enemyCombatants: result.enemyCombatants, combatWon: result.playerWon,
        phase: "COMBAT",
      });
    }
  },

  skipReward() {
    const { run, activeTeam, activeZone } = get();
    if (!run || !activeZone) return;
    const updatedRun = { ...run, floor: run.floor + 1 };
    const result = buildRunCombat(activeTeam, updatedRun, activeZone);
    set({
      run: updatedRun,
      combatLog: result.log, playerCombatants: result.playerCombatants,
      enemyCombatants: result.enemyCombatants, combatWon: result.playerWon,
      phase: "COMBAT",
    });
  },

  returnHome() {
    set({ phase: "HOME", run: null, selectedDraft: [], activeTeam: [], combatLog: [], activeZone: null });
  },

  purchasePerk(perkId) {
    const { meta } = get();
    const perk = getPerk(perkId);
    if (!perk) return;

    const timesPurchased = meta.purchasedPerks.filter((id) => id === perkId).length;
    if (timesPurchased >= perk.maxPurchases) return;
    if (meta.currency < perk.cost) return;

    const newMeta: MetaState = {
      ...meta,
      currency: meta.currency - perk.cost,
      purchasedPerks: [...meta.purchasedPerks, perkId],
    };
    saveMeta(newMeta);
    set({ meta: newMeta });
  },
}));
