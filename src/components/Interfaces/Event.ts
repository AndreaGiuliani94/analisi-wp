import type { Player } from "./Player";

export interface Event {
  player: Player;
  time: string;
  description: string;
  quarter: number;
}