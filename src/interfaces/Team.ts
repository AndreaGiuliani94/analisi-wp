import type { Player } from "./Player";

export interface Team {
    name: string,
    activatedTimer: boolean,
    players: Player[],
    score: number,
    timeOut1: boolean,
    timeOut2: boolean
}