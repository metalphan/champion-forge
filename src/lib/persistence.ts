import type { MetaState, RunState } from "@/engine/types";

const META_KEY = "champion-forge:meta";
const RUNS_KEY = "champion-forge:runs";

const DEFAULT_META: MetaState = {
  currency: 0,
  totalRuns: 0,
  bestFloor: 0,
  unlockedArchetypes: [],
  purchasedPerks: [],
};

export function loadMeta(): MetaState {
  if (typeof window === "undefined") return DEFAULT_META;
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? { ...DEFAULT_META, ...(JSON.parse(raw) as MetaState) } : DEFAULT_META;
  } catch { return DEFAULT_META; }
}

export function saveMeta(meta: MetaState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function saveRun(run: RunState): void {
  if (typeof window === "undefined") return;
  try {
    const existing: RunState[] = JSON.parse(localStorage.getItem(RUNS_KEY) ?? "[]");
    const updated = [run, ...existing].slice(0, 20);
    localStorage.setItem(RUNS_KEY, JSON.stringify(updated));
  } catch { /* non-fatal */ }
}

export function loadRuns(): RunState[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RUNS_KEY) ?? "[]") as RunState[];
  } catch { return []; }
}
