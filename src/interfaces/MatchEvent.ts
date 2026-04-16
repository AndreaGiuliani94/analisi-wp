import type { MatchEventType } from "@/enum/MatchEventDescription";
import type { Player } from "./Player";
import type { ShotCategory, ShotOutcome } from "@/enum/ShotDescription";
import type { EDCSType, FoulPosition, FoulType } from "@/enum/ExclutionDescription";

export interface MatchEvent {
// --- CAMPI PER LA UI (Frontend) ---
  id?: string;
  team: string;
  player: Player;
  homeScore: number;
  awayScore: number;

  // --- CAMPI STRUTTURATI (Database) ---
  matchId: string;
  playerId?: string;
  quarter: number;
  time: string;
  eventType: MatchEventType;

  // Tiri (Opzionali)
  shotCategory?: ShotCategory;
  shotPosition?: string;
  shotOutcome?: ShotOutcome;
  defendingGoalkeeperId?: string;

  // Falli (Opzionali)
  foulType?: FoulType;
  foulPosition?: FoulPosition;
  edcsType?: EDCSType;
  foulWithBall?: boolean;
  earnedByPlayerId?: string;
}