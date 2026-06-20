"use client";

import { type Champion } from "@/engine/types";
import {
  AFFINITY_BG, AFFINITY_BORDER, AFFINITY_COLOR, AFFINITY_EMOJI,
  RARITY_COLOR, RARITY_GLOW, RARITY_GEM,
} from "@/engine/champion";

interface ChampionCardProps {
  champion: Champion;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  dimmed?: boolean;
}

export function ChampionCard({ champion, selected, onClick, compact, dimmed }: ChampionCardProps) {
  const { name, rarity, affinity, baseStats, ability } = champion;
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={[
        "rounded-xl border text-left transition-all duration-200 w-full",
        compact ? "p-2" : "p-3",
        AFFINITY_BG[affinity],
        selected
          ? `${AFFINITY_BORDER[affinity]} ring-2 ring-white/60 scale-[1.01]`
          : onClick
          ? `${AFFINITY_BORDER[affinity]} hover:ring-1 hover:ring-white/30 hover:scale-[1.005]`
          : AFFINITY_BORDER[affinity],
        RARITY_GLOW[rarity],
        dimmed ? "opacity-40" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-white truncate text-sm">{name}</span>
        <span className={`text-xs font-bold shrink-0 ${RARITY_COLOR[rarity]}`}>
          {RARITY_GEM[rarity]} {rarity}
        </span>
      </div>

      {/* Affinity tag */}
      <div className={`text-xs mt-0.5 font-medium ${AFFINITY_COLOR[affinity]}`}>
        {AFFINITY_EMOJI[affinity]} {affinity}
      </div>

      {!compact && (
        <>
          {/* Stat grid */}
          <div className="grid grid-cols-4 gap-1 mt-2 text-xs text-center">
            {(["hp","atk","def","spd"] as const).map((stat) => (
              <div key={stat} className="rounded bg-black/30 px-1 py-1">
                <div className="text-gray-500 uppercase text-[10px] font-semibold">{stat}</div>
                <div className="text-white font-mono font-bold">{baseStats[stat]}</div>
              </div>
            ))}
          </div>

          {/* Ability */}
          <div className="mt-2 rounded-lg bg-black/30 px-2 py-1.5 text-xs border border-white/5">
            <div className="flex items-center gap-1">
              <span className="text-yellow-300 font-bold">{ability.name}</span>
              <span className="text-gray-500 text-[10px]">CD:{ability.cooldown}</span>
            </div>
            <p className="text-gray-400 mt-0.5 leading-tight">{ability.description}</p>
          </div>
        </>
      )}
    </Tag>
  );
}
