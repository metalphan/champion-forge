"use client";

import Image from "next/image";
import { type Champion } from "@/engine/types";
import {
  AFFINITY_BORDER, AFFINITY_COLOR, AFFINITY_EMOJI,
  RARITY_COLOR, RARITY_GLOW, RARITY_GEM,
  getPortraitUrl,
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
  const portrait = getPortraitUrl(affinity, rarity);

  if (compact) {
    return (
      <Tag
        onClick={onClick}
        className={[
          "rounded-lg border text-left transition-all duration-200 w-full overflow-hidden",
          "flex items-center gap-2 p-2",
          selected
            ? `${AFFINITY_BORDER[affinity]} ring-2 ring-white/60 bg-black/60`
            : onClick
            ? `${AFFINITY_BORDER[affinity]} hover:ring-1 hover:ring-white/30 bg-black/40`
            : `${AFFINITY_BORDER[affinity]} bg-black/40`,
          RARITY_GLOW[rarity],
          dimmed ? "opacity-40" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="relative w-10 h-10 rounded shrink-0 overflow-hidden">
          <Image src={portrait} alt={name} fill className="object-cover object-top" sizes="40px" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-xs truncate">{name}</div>
          <div className={`text-[10px] font-medium ${AFFINITY_COLOR[affinity]}`}>
            {AFFINITY_EMOJI[affinity]} {affinity} · <span className={RARITY_COLOR[rarity]}>{rarity}</span>
          </div>
        </div>
      </Tag>
    );
  }

  return (
    <Tag
      onClick={onClick}
      className={[
        "rounded-xl border text-left transition-all duration-200 w-full overflow-hidden",
        selected
          ? `${AFFINITY_BORDER[affinity]} ring-2 ring-white/60 scale-[1.01]`
          : onClick
          ? `${AFFINITY_BORDER[affinity]} hover:ring-1 hover:ring-white/30 hover:scale-[1.005]`
          : AFFINITY_BORDER[affinity],
        RARITY_GLOW[rarity],
        dimmed ? "opacity-40" : "",
      ].filter(Boolean).join(" ")}
    >
      {/* Portrait */}
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <Image
          src={portrait}
          alt={name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 50vw, 200px"
        />
        {/* Gradient overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        {/* Name + rarity overlay on portrait */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <div className="font-bold text-white text-sm leading-tight truncate drop-shadow">{name}</div>
          <div className="flex items-center justify-between mt-0.5">
            <span className={`text-xs font-medium ${AFFINITY_COLOR[affinity]}`}>
              {AFFINITY_EMOJI[affinity]} {affinity}
            </span>
            <span className={`text-xs font-bold ${RARITY_COLOR[rarity]}`}>
              {RARITY_GEM[rarity]} {rarity}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-black/70 px-2 pt-2 pb-1">
        <div className="grid grid-cols-4 gap-1 text-xs text-center">
          {(["hp","atk","def","spd"] as const).map((stat) => (
            <div key={stat} className="rounded bg-white/5 px-1 py-1">
              <div className="text-gray-500 uppercase text-[10px] font-semibold">{stat}</div>
              <div className="text-white font-mono font-bold">{baseStats[stat]}</div>
            </div>
          ))}
        </div>

        {/* Ability */}
        <div className="mt-1.5 mb-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-xs border border-white/5">
          <div className="flex items-center gap-1">
            <span className="text-yellow-300 font-bold">{ability.name}</span>
            <span className="text-gray-500 text-[10px]">CD:{ability.cooldown}</span>
          </div>
          <p className="text-gray-400 mt-0.5 leading-tight">{ability.description}</p>
        </div>
      </div>
    </Tag>
  );
}
