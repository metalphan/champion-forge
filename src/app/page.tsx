"use client";

import { useGameStore } from "@/store/gameStore";
import { HomeScreen } from "@/components/screens/HomeScreen";
import { DraftScreen } from "@/components/screens/DraftScreen";
import { CombatScreen } from "@/components/screens/CombatScreen";
import { RewardScreen } from "@/components/screens/RewardScreen";
import { EndScreen } from "@/components/screens/EndScreen";
import { SquadSelectScreen } from "@/components/screens/SquadSelectScreen";
import { ZoneSelectScreen } from "@/components/screens/ZoneSelectScreen";

export default function Page() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case "HOME":
      return <HomeScreen />;
    case "ZONE_SELECT":
      return <ZoneSelectScreen />;
    case "DRAFT":
      return <DraftScreen />;
    case "SQUAD_SELECT":
      return <SquadSelectScreen />;
    case "COMBAT":
      return <CombatScreen />;
    case "REWARD":
      return <RewardScreen />;
    case "GAME_OVER":
      return <EndScreen victory={false} />;
    case "VICTORY":
      return <EndScreen victory={true} />;
    default:
      return <HomeScreen />;
  }
}
