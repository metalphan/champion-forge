"use client";

import { useGameStore } from "@/store/gameStore";
import { PERKS } from "@/data/perks";
import { loadRuns } from "@/lib/persistence";
import { useState, useEffect } from "react";
import type { RunState } from "@/engine/types";

export function HomeScreen() {
  const { meta, goToZoneSelect, purchasePerk } = useGameStore();
  const [runs, setRuns] = useState<RunState[]>([]);
  const [tab, setTab] = useState<"home" | "perks">("home");

  useEffect(() => { setRuns(loadRuns().slice(0, 5)); }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-5 gap-6 max-w-lg mx-auto">

      {/* Title */}
      <div className="text-center pt-4">
        <h1 className="text-5xl font-black tracking-tight text-yellow-400 drop-shadow-lg">
          CHAMPION FORGE
        </h1>
        <p className="text-gray-500 mt-1 text-sm tracking-widest uppercase">Draft • Fight • Conquer</p>
      </div>

      {/* Meta stats */}
      <div className="grid grid-cols-3 gap-3 w-full">
        {[
          { label: "Shards", value: meta.currency, icon: "⚜️" },
          { label: "Best Floor", value: `${meta.bestFloor}/10`, icon: "🏆" },
          { label: "Runs", value: meta.totalRuns, icon: "💀" },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
            <div className="text-xl font-black text-yellow-300">{icon}</div>
            <div className="text-lg font-black text-white">{value}</div>
            <div className="text-[11px] text-gray-500 mt-0.5 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex w-full rounded-xl border border-white/10 overflow-hidden">
        {(["home","perks"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={[
              "flex-1 py-2 text-sm font-semibold capitalize transition-colors",
              tab === t ? "bg-yellow-500 text-black" : "bg-white/5 text-gray-400 hover:text-white",
            ].join(" ")}>
            {t === "home" ? "🗡 Play" : "⚜️ Perks"}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <>
          <button onClick={goToZoneSelect}
            className="w-full py-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xl transition-colors uppercase tracking-wide shadow-lg shadow-yellow-500/20">
            New Run →
          </button>

          {runs.length > 0 && (
            <div className="w-full">
              <h2 className="text-[11px] font-semibold text-gray-600 uppercase tracking-widest mb-2">Recent Runs</h2>
              <div className="space-y-1.5">
                {runs.map((r, i) => (
                  <div key={i} className="flex justify-between items-center rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm">
                    <span className={r.outcome === "victory" ? "text-yellow-400 font-bold" : "text-red-400"}>
                      {r.outcome === "victory" ? "🏆 Victory" : "💀 Defeat"}
                    </span>
                    <span className="text-gray-500 text-xs">Floor {r.floor}/{r.maxFloor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "perks" && (
        <div className="w-full space-y-3">
          <p className="text-xs text-gray-500">Spend shards to unlock permanent run bonuses.</p>
          {PERKS.map((perk) => {
            const owned = meta.purchasedPerks.filter((id) => id === perk.id).length;
            const maxed = owned >= perk.maxPurchases;
            const canAfford = meta.currency >= perk.cost;
            return (
              <div key={perk.id} className={[
                "rounded-xl border p-3 transition-all",
                maxed ? "border-yellow-500/30 bg-yellow-950/10" : "border-white/10 bg-white/5",
              ].join(" ")}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{perk.icon}</span>
                    <div>
                      <div className="font-bold text-white text-sm">{perk.name}</div>
                      <div className="text-gray-400 text-xs">{perk.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => purchasePerk(perk.id)}
                    disabled={maxed || !canAfford}
                    className={[
                      "ml-2 shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                      maxed
                        ? "bg-yellow-500/20 text-yellow-400 cursor-default"
                        : canAfford
                        ? "bg-yellow-500 hover:bg-yellow-400 text-black"
                        : "bg-white/10 text-gray-600 cursor-not-allowed",
                    ].join(" ")}>
                    {maxed ? "✓ Max" : `${perk.cost} ⚜️`}
                  </button>
                </div>
                {perk.maxPurchases > 1 && (
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: perk.maxPurchases }, (_, i) => (
                      <div key={i} className={[
                        "h-1 flex-1 rounded-full",
                        i < owned ? "bg-yellow-400" : "bg-white/15",
                      ].join(" ")} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-gray-700 text-[10px] pb-2">Phase 2 — Champion Forge</p>
    </div>
  );
}
