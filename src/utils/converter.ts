import { ShotCategory } from '@/enum/ShotDescription';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import type { Match } from '@/interfaces/Match';
import type { Player } from '@/interfaces/Player';

/**
 * Converte l'evento grezzo dal DB in un oggetto Event per la UI
 */
export const convertDbEventToUI = (dbEvent: any, matchData: any, match: Match): MatchEvent | null => {
  // 1. Troviamo il giocatore e la sua squadra
  let targetTeam = '';
  let targetPlayer = match.homeTeam.players.find((p: any) => p.id === dbEvent.player_id);
  
  if (targetPlayer) {
    targetTeam = match.homeTeam.name;
  } else {
    targetPlayer = match.awayTeam.players.find((p: any) => p.id === dbEvent.player_id);
    if (targetPlayer) {
      targetTeam = match.awayTeam.name;
    }
  }

  if (!targetPlayer) return null;

  // 2. Costruiamo l'oggetto Event
  return {
    id: dbEvent.id,
    team: targetTeam,
    player: targetPlayer,
    homeScore: matchData?.homeScore || match.homeTeam.score,
    awayScore: matchData?.awayScore || match.awayTeam.score,

    matchId: dbEvent.match_id,
    playerId: dbEvent.player_id,
    quarter: dbEvent.quarter,
    time: dbEvent.time,
    eventType: dbEvent.event_category,

    shotCategory: dbEvent.shot_category,
    shotOutcome: dbEvent.shot_outcome,
    shotPosition: dbEvent.shot_position,
    defendingGoalkeeperId: dbEvent.defending_goalkeeper_id,

    foulType: dbEvent.foul_type,
    foulPosition: dbEvent.foul_position,
    edcsType: dbEvent.edcs_type,
    foulWithBall: dbEvent.foul_with_ball,
    earnedByPlayerId: dbEvent.earned_by_player_id
  };
};


export const refactorSaveEventPayload = (myClientId: string, newEvent: MatchEvent) => {
  return {
    sender_client_id: myClientId,
    match_id: newEvent.matchId,
    player_id: newEvent.playerId,
    quarter: newEvent.quarter,
    time: newEvent.time,
    event_category: newEvent.eventType,
    
    shot_category: newEvent.shotCategory || null,
    shot_position: newEvent.shotPosition || null,
    shot_outcome: newEvent.shotOutcome || null,
    defending_goalkeeper_id: newEvent.defendingGoalkeeperId || null,
    
    foul_type: newEvent.foulType || null,
    foul_position: newEvent.foulPosition || null,
    edcs_type: newEvent.edcsType || null,
    foul_with_ball: newEvent.foulWithBall ?? null,
    earned_by_player_id: newEvent.earnedByPlayerId || null,
  };
}