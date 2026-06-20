"use client";

import { useGameStore } from "@/store/gameStore";
import { isBossFloor } from "@/engine/floor";
import { AFFINITY_EMOJI } from "@/engine/champion";
import { type CombatChampion, type CombatLogEntry } from "@/engine/types";
import { useEffect, useMemo, useRef, useState } from "react";

const ENTRY_DELAY_MS = 180;
const STATUS_ICONS: Record<string, string> = {
  burn: "🔥", poison: "☠️", freeze: "❄️", stun: "⚡",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function HpBar({ current, max, flash }: { current: number; max: number; flash?: "damage" | "heal" | null }) {
  const pct = Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  const color = pct > 50 ? "bg-green-500" : pct > 25 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="relative w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${color} ${flash === "damage" ? "animate-pulse" : ""}`}
        style={{ width: `${pct}%` }}
      />
      {flash === "heal" && (
        <div className="absolute inset-0 bg-green-400/30 rounded-full animate-ping" />
      )}
    </div>
  );
}

function StatusBadges({ combatant }: { combatant: CombatChampion }) {
  if (combatant.statusEffects.length === 0) return null;
  return (
    <div className="flex gap-0.5 ml-1">
      {combatant.statusEffects.map((s, i) => (
        <span key={i} className="text-[10px]" title={`${s.kind} (${s.turnsLeft}t)`}>
          {STATUS_ICONS[s.kind]}{s.turnsLeft > 1 ? s.turnsLeft : ""}
        </span>
      ))}
    </div>
  );
}

function CombatantRow({
  combatant, displayedHp, flash, showFinal,
}: {
  combatant: CombatChampion;
  displayedHp: number;
  flash: "damage" | "heal" | null;
  showFinal: boolean;
}) {
  const hp = showFinal ? combatant.currentHp : displayedHp;
  const dead = showFinal && !combatant.isAlive;
  return (
    <div className={`transition-opacity duration-500 ${dead ? "opacity-35" : ""}`}>
      <div className="flex items-center justify-between text-xs mb-1">
        <div className="flex items-center gap-1">
          <span className={dead ? "line-through text-gray-500" : "text-white font-medium"}>
            {combatant.champion.name}
          </span>
          <span className="text-[10px] text-gray-500">
            {AFFINITY_EMOJI[combatant.champion.affinity]}
          </span>
          {showFinal && <StatusBadges combatant={combatant} />}
        </div>
        <span className="text-gray-400 font-mono text-[11px]">
          {hp}/{combatant.maxHp}
          {dead && " 💀"}
        </span>
      </div>
      <HpBar current={hp} max={combatant.maxHp} flash={showFinal ? null : flash} />
    </div>
  );
}

function FloorTracker({ floor, maxFloor }: { floor: number; maxFloor: number }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {Array.from({ length: maxFloor }, (_, i) => {
        const f = i + 1;
        const isCurrent = f === floor;
        const isCleared = f < floor;
        const isBoss = f % 5 === 0 || f === maxFloor;
        return (
          <div
            key={f}
            title={`Floor ${f}${isBoss ? " — Boss" : ""}`}
            className={[
              "rounded transition-all text-xs font-bold flex items-center justify-center",
              isBoss ? "w-6 h-6" : "w-4 h-4",
              isCurrent
                ? "bg-yellow-400 text-black scale-110 shadow-md shadow-yellow-400/40"
                : isCleared
                ? "bg-green-600/60 text-green-300"
                : "bg-white/10 text-gray-600",
            ].join(" ")}
          >
            {isBoss ? "⚔" : "·"}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export function CombatScreen() {
  const {
    run, activeZone, combatLog, playerCombatants, enemyCombatants,
    combatWon, advanceAfterCombat, retryFloor, abandonRun,
  } = useGameStore();

  const [visibleCount, setVisibleCount] = useState(0);
  const [flashes, setFlashes] = useState<Record<string, "damage" | "heal" | null>>({});
  const logRef = useRef<HTMLDivElement>(null);

  // Reset when new combat starts
  useEffect(() => {
    setVisibleCount(0);
    setFlashes({});
  }, [combatLog]);

  // Tick entries
  useEffect(() => {
    if (visibleCount >= combatLog.length) return;
    const timer = setTimeout(() => {
      const entry = combatLog[visibleCount];
      if (entry?.target && (entry.entryType === "damage" || entry.entryType === "dot")) {
        setFlashes((f) => ({ ...f, [entry.target!]: "damage" }));
        setTimeout(() => setFlashes((f) => ({ ...f, [entry.target!]: null })), 400);
      }
      if (entry?.target && entry.entryType === "heal") {
        setFlashes((f) => ({ ...f, [entry.target!]: "heal" }));
        setTimeout(() => setFlashes((f) => ({ ...f, [entry.target!]: null })), 400);
      }
      setVisibleCount((v) => v + 1);
    }, ENTRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount, combatLog]);

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [visibleCount]);

  // Compute displayed HPs from log replay
  const displayedHps = useMemo(() => {
    const hps: Record<string, number> = {};
    const maxHps: Record<string, number> = {};
    [...playerCombatants, ...enemyCombatants].forEach((c) => {
      hps[c.champion.name] = c.maxHp;
      maxHps[c.champion.name] = c.maxHp;
    });
    for (const entry of combatLog.slice(0, visibleCount)) {
      if (!entry.target || entry.value === undefined) continue;
      if (entry.entryType === "damage" || entry.entryType === "dot") {
        hps[entry.target] = Math.max(0, (hps[entry.target] ?? 0) - entry.value);
      } else if (entry.entryType === "heal") {
        hps[entry.target] = Math.min(maxHps[entry.target] ?? 0, (hps[entry.target] ?? 0) + entry.value);
      }
    }
    return hps;
  }, [visibleCount, combatLog, playerCombatants, enemyCombatants]);

  const animating = visibleCount < combatLog.length;
  const showFinal = !animating;
  const visibleEntries = combatLog.slice(0, visibleCount);

  if (!run || !activeZone) return null;

  const boss = isBossFloor(run.floor, run.maxFloor);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col p-4 gap-3 max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-black text-yellow-400">
            {boss ? "⚔️ Boss — " : ""}{activeZone.icon} Floor {run.floor}
          </h2>
          <FloorTracker floor={run.floor} maxFloor={run.maxFloor} />
        </div>
        {showFinal && (
          <div className={[
            "px-3 py-1 rounded-full text-sm font-bold",
            combatWon ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400",
          ].join(" ")}>
            {combatWon ? "VICTORY" : "DEFEAT"}
          </div>
        )}
      </div>

      {/* Zone modifier reminder */}
      <div className="text-[11px] text-gray-500 bg-white/5 rounded px-2 py-1">
        {activeZone.modifier.modifierLabel}
      </div>

      {/* Enemy team */}
      <section className="rounded-xl border border-red-900/40 bg-red-950/10 p-3 space-y-2">
        <h3 className="text-[11px] font-semibold text-red-400/70 uppercase tracking-widest">Enemies</h3>
        {enemyCombatants.map((ec) => (
          <CombatantRow
            key={ec.champion.id}
            combatant={ec}
            displayedHp={displayedHps[ec.champion.name] ?? ec.maxHp}
            flash={flashes[ec.champion.name] ?? null}
            showFinal={showFinal}
          />
        ))}
      </section>

      {/* Combat log */}
      <div
        ref={logRef}
        className="rounded-xl border border-white/10 bg-black/40 h-40 overflow-y-auto p-2 font-mono text-[11px] space-y-0.5"
      >
        {visibleEntries.length === 0 && (
          <p className="text-gray-600 italic">Battle beginning…</p>
        )}
        {visibleEntries.map((e, i) => (
          <LogLine key={i} entry={e} />
        ))}
        {animating && <div className="text-gray-600 animate-pulse">▌</div>}
      </div>

      {/* Player team */}
      <section className="rounded-xl border border-blue-900/40 bg-blue-950/10 p-3 space-y-2">
        <h3 className="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest">Your Team</h3>
        {playerCombatants.map((pc) => (
          <CombatantRow
            key={pc.champion.id}
            combatant={pc}
            displayedHp={displayedHps[pc.champion.name] ?? pc.maxHp}
            flash={flashes[pc.champion.name] ?? null}
            showFinal={showFinal}
          />
        ))}
      </section>

      {/* Action buttons */}
      {animating ? (
        <button
          onClick={() => setVisibleCount(combatLog.length)}
          className="w-full py-2.5 rounded-xl border border-white/20 text-gray-400 hover:text-white hover:border-white/40 text-sm font-semibold transition-colors"
        >
          Skip →
        </button>
      ) : combatWon ? (
        <button
          onClick={advanceAfterCombat}
          className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg uppercase tracking-wide transition-colors"
        >
          {run.floor >= run.maxFloor ? "Claim Victory 🏆" : "Choose Reward →"}
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={retryFloor}
            className="flex-1 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-wide transition-colors">
            Retry Floor
          </button>
          <button onClick={abandonRun}
            className="flex-1 py-3 rounded-xl border border-red-700/50 text-red-400 hover:bg-red-900/30 font-semibold transition-colors">
            Abandon
          </button>
        </div>
      )}
    </div>
  );
}

function LogLine({ entry }: { entry: CombatLogEntry }) {
  const typeColor: Record<string, string> = {
    damage: "text-red-400", heal: "text-green-400",
    buff: "text-yellow-300", debuff: "text-orange-400",
    dot: "text-orange-300", status: "text-purple-300", miss: "text-gray-600",
  };
  return (
    <div className="flex gap-1 text-gray-300">
      <span className="text-gray-600 shrink-0">[{entry.turn}]</span>
      <span className="text-yellow-200">{entry.actor}</span>
      <span className={typeColor[entry.entryType] ?? "text-blue-300"}>{entry.action}</span>
      {entry.target && <><span className="text-gray-500">→</span><span className="text-gray-300">{entry.target}</span></>}
      {entry.value !== undefined && (
        <span className={entry.entryType === "heal" ? "text-green-400" : "text-red-300"}>
          {entry.entryType === "heal" ? "+" : "-"}{entry.value}
        </span>
      )}
    </div>
  );
}
