import { ShotCategory } from '@/enum/ShotDescription';
import type { MatchEvent } from '@/interfaces/MatchEvent';
import type { Match } from '@/interfaces/Match';
import type { Player } from '@/interfaces/Player';
import { MatchEventType } from '@/enum/MatchEventDescription';

/**
 * Converte l'evento grezzo dal DB in un oggetto Event per la UI
 */
export const convertDbEventToUI = (dbEvent: any, matchData: any, match: Match): MatchEvent | null => {
  let targetTeamName = '';
  let targetTeamId = '';
  let targetPlayer: Player | undefined;
  
  if (dbEvent.player_id) { // Se c'è un player_id, è un evento legato a un giocatore (SHOT, FOUL)
    targetPlayer = match.homeTeam.players.find((p: any) => p.id === dbEvent.player_id);
    if (targetPlayer) {
      targetTeamName = match.homeTeam.name;
      targetTeamId = match.homeTeam.id;
    } else {
      targetPlayer = match.awayTeam.players.find((p: any) => p.id === dbEvent.player_id);
      if (targetPlayer) {
        targetTeamName = match.awayTeam.name;
        targetTeamId = match.awayTeam.id;
      }
    }
  } else if (dbEvent.event_category === MatchEventType.TIME_OUT) { // Se non c'è player_id, ma è un TIME_OUT
    // Dobbiamo determinare la squadra basandoci su team_id o team_name dal dbEvent
    if (dbEvent.team_id) {
      if (match.homeTeam.id === dbEvent.team_id) {
        targetTeamName = match.homeTeam.name;
        targetTeamId = match.homeTeam.id;
      } else if (match.awayTeam.id === dbEvent.team_id) {
        targetTeamName = match.awayTeam.name;
        targetTeamId = match.awayTeam.id;
      }
    } else if (dbEvent.team_name) { // Fallback se team_id non è direttamente disponibile nel dbEvent
      if (match.homeTeam.name === dbEvent.team_name) {
        targetTeamName = match.homeTeam.name;
        targetTeamId = match.homeTeam.id;
      } else if (match.awayTeam.name === dbEvent.team_name) {
        targetTeamName = match.awayTeam.name;
        targetTeamId = match.awayTeam.id;
      }
    }
  }

  if (!targetTeamName) {
    console.warn(`Team non identificato per evento ${dbEvent.id}. Salto l'evento.`);
    return null;
  }
  return {
    id: dbEvent.id,
    team: targetTeamName,
    player: targetPlayer,
    homeScore: matchData?.homeScore || match.homeTeam.score,
    awayScore: matchData?.awayScore || match.awayTeam.score,
    teamId: targetTeamId,

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
    player_id: newEvent.playerId || null,
    team_id: newEvent.teamId || null,
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