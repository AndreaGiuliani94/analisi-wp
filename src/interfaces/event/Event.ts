import type { MatchEventType } from "@/enum/MatchEventDescription";
import type { Player } from "../Player";

export interface Event {
  team: string,
  player: Player;
  time: string;
  description: string;
  quarter: number;
  awayScore: number;
  homeScore: number;
  type: MatchEventType;
  // --- NUOVI CAMPI STRUTTURATI ---
  // Aggiungiamo questi campi opzionali in modo che al momento del salvataggio 
  // su BE sappiamo esattamente cosa inviare, senza dover fare il "parsing" della description
  situation?: string; // Es. EVEN, SUPERIORITY, PENALTY
  outcome?: string;   // Es. GOAL, SAVED, MISSED
  position?: string;  // Es. "1", "2", "CB", "P6"
  withBall?: boolean; // Utile per i falli (Con palla / Senza palla)
}