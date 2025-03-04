import type { Player } from "./Player";

export interface Event {
  team: string,
  player: Player;
  time: string;
  description: string;
  quarter: number;
}