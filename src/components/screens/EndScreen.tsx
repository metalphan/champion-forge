"use client";

import { useGameStore } from "@/store/gameStore";
import { ChampionCard } from "@/components/ui/ChampionCard";

export function EndScreen({ victory }: { victory: boolean }) {
  const { run, activeZone, meta, returnHome } = useGameStore();
  if (!run) return null;

  const earned = victory ? run.maxFloor * 25 : run.floor * 10;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-5 gap-5 max-w-lg mx-auto">
      <div className="text-center mt-6">
        <div className="text-6xl mb-2">{victory ? "🏆" : "💀"}</div>
        <h2 className={`text-4xl font-black ${victory ? "text-yellow-400" : "text-red-400"}`}>
          {victory ? "Victory!" : "Defeated"}
        </h2>
        {activeZone && (
          <p className="text-gray-500 text-sm mt-1">{activeZone.icon} {activeZone.name}</p>
        )}
        <p className="text-gray-400 mt-1 text-sm">
          {victory
            ? `Cleared all ${run.maxFloor} floors!`
            : `Fell on floor ${run.floor} of ${run.maxFloor}.`}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { label: "Floor Reached", value: run.floor },
          { label: "Shards Earned", value: `+${earned} ⚜️` },
          { label: "Best Floor", value: meta.bestFloor },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-lg font-black text-yellow-300">{value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      <div className="w-full">
        <h3 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-2">Final Roster</h3>
        <div className="space-y-2">
          {run.playerTeam.map((c) => (
            <ChampionCard key={c.id} champion={c} compact />
          ))}
        </div>
      </div>

      <button
        onClick={returnHome}
        className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg uppercase tracking-wide transition-colors shadow-lg shadow-yellow-500/20"
      >
        Return Home
      </button>
    </div>
  );
}
