"use client";

import { useGameStore } from "@/store/gameStore";
import { ChampionCard } from "@/components/ui/ChampionCard";
import { calcSynergies } from "@/engine/synergy";
import { AFFINITY_COLOR } from "@/engine/champion";

export function SquadSelectScreen() {
  const { run, activeZone, activeTeam, selectedDraft, toggleDraftSelection, confirmSquadSelect } = useGameStore();
  if (!run) return null;

  const roster = run.playerTeam;
  const synergies = calcSynergies(selectedDraft);
  const canConfirm = selectedDraft.length > 0 && selectedDraft.length <= 3;

  return (
    <div className="bg-gray-950 text-white flex flex-col p-4 gap-4 max-w-lg mx-auto pb-8">
      <div>
        {activeZone && <p className="text-xs text-gray-500 mb-1">{activeZone.icon} {activeZone.name} — Floor {run.floor}</p>}
        <h2 className="text-2xl font-black text-yellow-400">Select Your Squad</h2>
        <p className="text-gray-400 text-sm">
          Pick up to 3 from your roster — <span className="text-white font-bold">{selectedDraft.length}/3</span> selected
        </p>
      </div>

      {/* Synergy preview */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 min-h-[48px]">
        {synergies.length === 0 ? (
          <p className="text-gray-500 text-xs italic">Match affinities to unlock synergy bonuses.</p>
        ) : (
          <div className="space-y-1">
            {synergies.map((s) => (
              <div key={s.affinity} className={`text-sm font-semibold ${AFFINITY_COLOR[s.affinity]}`}>
                ✦ {s.label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {roster.map((c) => {
          const isSelected = selectedDraft.some((s) => s.id === c.id);
          const wasActive = activeTeam.some((a) => a.id === c.id);
          const isDisabled = !isSelected && selectedDraft.length >= 3;
          return (
            <div key={c.id} className="relative">
              {wasActive && !isSelected && (
                <span className="absolute top-2 right-2 text-[10px] text-gray-600 z-10 pointer-events-none">
                  previously active
                </span>
              )}
              <ChampionCard
                champion={c}
                selected={isSelected}
                onClick={isDisabled ? undefined : () => toggleDraftSelection(c)}
              />
            </div>
          );
        })}
      </div>

      <button
        onClick={confirmSquadSelect}
        disabled={!canConfirm}
        className={[
          "w-full py-3 rounded-xl font-black text-lg uppercase tracking-wide transition-colors",
          canConfirm
            ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20"
            : "bg-white/10 text-white/30 cursor-not-allowed",
        ].join(" ")}
      >
        {canConfirm ? `Fight with ${selectedDraft.length} →` : "Pick at least 1"}
      </button>
    </div>
  );
}
