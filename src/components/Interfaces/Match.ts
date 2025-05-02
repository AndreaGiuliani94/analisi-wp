import type { Team } from "./Team";

export interface Match {
  quarter: number;
  homeTeam: Team;
  awayTeam: Team;
}