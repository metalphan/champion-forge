"use client";

import { useGameStore } from "@/store/gameStore";
import { ZONES } from "@/data/zones";

const AFFINITY_RING: Record<string, string> = {
  Fire: "border-red-500/60 hover:border-red-400 hover:bg-red-950/30",
  Water: "border-cyan-500/60 hover:border-cyan-400 hover:bg-cyan-950/30",
  Earth: "border-green-500/60 hover:border-green-400 hover:bg-green-950/30",
  Lightning: "border-yellow-400/60 hover:border-yellow-300 hover:bg-yellow-950/30",
};

const AFFINITY_TITLE: Record<string, string> = {
  Fire: "text-red-400", Water: "text-cyan-400",
  Earth: "text-green-400", Lightning: "text-yellow-300",
};

export function ZoneSelectScreen() {
  const { selectZone, returnHome } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-4 gap-4 max-w-lg mx-auto">
      <div>
        <button onClick={returnHome} className="text-gray-500 hover:text-white text-sm mb-2 transition-colors">
          ← Back
        </button>
        <h2 className="text-2xl font-black text-yellow-400">Choose Your Dungeon</h2>
        <p className="text-gray-400 text-sm">Each zone has thematic enemies and a unique modifier.</p>
      </div>

      <div className="flex flex-col gap-3">
        {ZONES.map((zone) => (
          <button
            key={zone.id}
            onClick={() => selectZone(zone.id)}
            className={[
              "rounded-xl border p-4 text-left transition-all duration-200 bg-white/5",
              AFFINITY_RING[zone.affinity],
            ].join(" ")}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{zone.icon}</span>
              <div>
                <h3 className={`font-black text-lg ${AFFINITY_TITLE[zone.affinity]}`}>{zone.name}</h3>
                <p className="text-gray-500 text-xs">{zone.affinity} dominant · {zone.floorCount} floors</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-2">{zone.description}</p>
            <div className="rounded-lg bg-black/30 px-3 py-1.5 text-xs text-gray-400 border border-white/5">
              {zone.modifier.modifierLabel}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
