import type { MatchStatus } from "@/enum/MatchStatus";
import type { Team } from "./Team";

export interface Match {
  id: string;
  isLive: boolean;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
}