"use client";

import { useGameStore } from "@/store/gameStore";
import { ChampionCard } from "@/components/ui/ChampionCard";
import { AFFINITY_COLOR } from "@/engine/champion";
import type { RewardOption } from "@/engine/types";

function RewardCard({ option, onPick }: { option: RewardOption; onPick: () => void }) {
  return (
    <button
      onClick={onPick}
      className="w-full rounded-xl border border-white/15 bg-white/5 hover:border-yellow-400/50 hover:bg-yellow-400/5 p-4 text-left transition-all group"
    >
      <div className="font-bold text-white group-hover:text-yellow-300 transition-colors text-sm">
        {option.label}
      </div>
      <p className="text-gray-400 text-xs mt-1">{option.description}</p>
      {option.kind === "champion" && option.champion && (
        <div className="mt-3 pointer-events-none">
          <ChampionCard champion={option.champion} />
        </div>
      )}
    </button>
  );
}

export function RewardScreen() {
  const { run, activeZone, rewardOptions, pickReward, skipReward } = useGameStore();
  if (!run) return null;

  return (
    <div className="bg-gray-950 text-white flex flex-col p-4 gap-4 max-w-lg mx-auto pb-8">
      <div>
        {activeZone && <p className="text-xs text-gray-500 mb-1">{activeZone.icon} {activeZone.name}</p>}
        <h2 className="text-2xl font-black text-yellow-400">Floor {run.floor} Clear!</h2>
        <p className="text-gray-400 text-sm">Choose a reward before the next floor.</p>
      </div>

      <div className="text-xs text-gray-500">
        Roster: {run.playerTeam.length} champion{run.playerTeam.length !== 1 ? "s" : ""}
      </div>

      <div className="flex flex-col gap-3">
        {rewardOptions.map((opt, i) => (
          <RewardCard key={i} option={opt} onPick={() => pickReward(opt)} />
        ))}
      </div>

      <button
        onClick={skipReward}
        className="w-full py-2 rounded-lg border border-white/10 text-gray-500 hover:text-white hover:border-white/30 text-sm transition-colors"
      >
        Skip reward and continue
      </button>
    </div>
  );
}
