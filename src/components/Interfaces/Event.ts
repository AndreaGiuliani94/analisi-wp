import type { MatchEventType } from "@/enum/MatchEventDescription";
import type { Player } from "./Player";

export interface Event {
  team: string,
  player: Player;
  time: string;
  description: string;
  quarter: number;
  awayScore: number;
  homeScore: number;
  type: MatchEventType;
}