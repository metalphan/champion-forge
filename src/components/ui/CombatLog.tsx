"use client";

import { type CombatLogEntry } from "@/engine/types";

interface CombatLogProps {
  entries: CombatLogEntry[];
}

export function CombatLog({ entries }: CombatLogProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 h-48 overflow-y-auto p-2 font-mono text-xs space-y-0.5">
      {entries.length === 0 && (
        <p className="text-gray-500 italic">No combat yet.</p>
      )}
      {entries.map((e, i) => (
        <div key={i} className="text-gray-300">
          <span className="text-gray-500">[T{e.turn}] </span>
          <span className="text-yellow-300">{e.actor}</span>
          {" → "}
          <span className="text-blue-300">{e.action}</span>
          {e.target && (
            <>
              {" on "}
              <span className="text-red-300">{e.target}</span>
            </>
          )}
          {e.value !== undefined && (
            <span className="text-white ml-1">
              ({e.action === "Heal Pulse" || e.action === "Mend" ? "+" : "-"}
              {e.value})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
