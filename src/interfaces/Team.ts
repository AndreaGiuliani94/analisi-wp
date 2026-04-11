import type { Player } from "./Player";

export interface Team {
    id: string,
    name: string,
    category:string,
    activatedTimer: boolean,
    players: Player[],
    score: number,
    timeOut1: boolean,
    timeOut2: boolean
}