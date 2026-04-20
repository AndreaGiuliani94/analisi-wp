import { edcsCategoryLabels, foulCategoryLabels, foulPositionLabels, shotCategoryLabels, shotOutcomeLabels, shotPositionLabels } from "@/const/consts";
import { FoulType } from "@/enum/ExclutionDescription";
import { MatchEventType } from "@/enum/MatchEventDescription";
import type { MatchEvent } from "@/interfaces/MatchEvent";
import type { Exclution } from "@/interfaces/Exclution";
import type { Player } from "@/interfaces/Player";
import { useGameStore } from "@/stores/gameStore";
import { useSettingsStore } from "@/stores/settingsStore";
import type { Team } from "@/interfaces/Team";

export function getExclution (exclution: Exclution) {
    var str: string = '';
    str += exclution.quarter + 'T ' + exclution.time + ' ' + getLabel(exclution.type, foulCategoryLabels) + ' ';
    if(exclution.type !== 'EDCS') {
      str += getLabel(exclution.position, foulPositionLabels) + ' ' + (exclution.ball ? 'Con palla' : 'Senza palla');
    } else {
      str += getLabel(exclution.edcsType, edcsCategoryLabels);
    }
    return str;
}

// Funzione helper interna per mappare un singolo giocatore dal BE al FE
export const mapPlayerToFE = (bePlayer: any): Player => {
    return {
        id: bePlayer.player_info.id,
        number: bePlayer.cap_number,
        name: bePlayer.player_info.name,
        activeTime: bePlayer.active_time,
        benchTime: bePlayer.bench_time,
        actualTime: 0,
        active: bePlayer.is_playing, 
        isGK: bePlayer.player_info.is_gk,
        // Inizializziamo tutti gli array vuoti richiesti dal FE
        exclutions: [],
        shotsEven: [],
        shotsSup: [],
        shotsPenalty: [],
        shotsFaced: []
    };
};

/**
 * Prende un array di giocatori dal DB e garantisce che l'array finale 
 * abbia sempre `maxPlayers` elementi (es. 15), mantenendo l'ordine dei calottini.
 */
export const padRosterToMax = (
    fetchedPlayers: Player[], 
    maxPlayers: number = 15,
    enablePlayersTime: boolean = false
): Player[] => {
    return Array.from({ length: maxPlayers }, (_, i) => {
        const playerNumber = i + 1;
        
        // 1. Cerchiamo se il DB ci ha restituito questo specifico numero di calottino
        const existingPlayer = fetchedPlayers?.find(p => p.number === playerNumber);

        // 2. Se esiste, restituiamo il giocatore del DB
        if (existingPlayer) {
            return existingPlayer;
        }

        // 3. Se non esiste, creiamo uno slot vuoto di default (esattamente come nel gameStore)
        return {
            id: '',
            number: playerNumber,
            name: "",
            activeTime: 0,
            benchTime: 0,
            actualTime: 0,
            shotsEven: [],
            shotsSup: [],
            shotsPenalty: [],
            exclutions: [],
            shotsFaced: [],
            active: !enablePlayersTime,
            isGK: (playerNumber === 1 || playerNumber === 13),
        } as Player;
    });
};

export const getEventDescription = (event: MatchEvent): string => {
  switch (event.eventType) {
    case MatchEventType.SHOT:
      return getShotDescription(event);

    case MatchEventType.FOUL:
      return getFoulDescription(event);

    default:
      return 'Azione di gioco';
  }
};

/**
 * Traduce una stringa tecnica in una label leggibile usando un dizionario.
 * Se la traduzione non esiste, ritorna il valore originale.
 */
export const getLabel = (value: string | undefined, mapping: Record<string, string>): string => {
  if (!value) return '';
  return mapping[value] || value;
};

function getFoulDescription(event: MatchEvent) {
  const fType = foulCategoryLabels[event.foulType || ''] || event.foulType || '';
  if(event.foulType === FoulType.EDCS) {
    const fEdcsCat = (edcsCategoryLabels[event.edcsType || ''] || event.edcsType || '')
    return `${fType}${fEdcsCat ? ' - ' + fEdcsCat : ''}`.trim();
  }
  const fPos = foulPositionLabels[event.foulPosition || ''] || event.foulPosition || '';
  const fBall = event.foulWithBall ? 'con palla' : 'senza palla';
  const fEarnedBy = event.earnedByPlayerId ?
    (event.team === useSettingsStore().homeTeamName
      ? useGameStore().match.awayTeam.players.find(pl => pl.id === event.earnedByPlayerId)?.name
      : useGameStore().match.homeTeam.players.find(pl => pl.id === event.earnedByPlayerId)?.name) : '';
  return `${fType}${fPos ? ' - ' + fPos : ''}, ${fBall}${fEarnedBy ? ', guadagnata da ' + fEarnedBy : ''}`.trim();
}

function getShotDescription(event: MatchEvent) {
  const outcome = shotOutcomeLabels[event.shotOutcome || ''] || event.shotOutcome || '';
  const category = shotCategoryLabels[event.shotCategory || ''] || event.shotCategory || '';
  const pos = shotPositionLabels[event.shotPosition || ''] || event.shotPosition || '';
  const gk = event.defendingGoalkeeperId ?
    (event.team === useSettingsStore().homeTeamName
      ? useGameStore().match.awayTeam.players.find(pl => pl.id === event.defendingGoalkeeperId)?.name
      : useGameStore().match.homeTeam.players.find(pl => pl.id === event.defendingGoalkeeperId)?.name) : '';
  return `${outcome} - ${category}${pos ? ', ' + pos : ''}${gk ? ', portiere: ' + gk : ''}`.trim();
}


export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export function resetTeam (team: Team, isHome: boolean) {
  team.category = '';
  team.id = '';
  team.activatedTimer = isHome ? useSettingsStore().enableHomePlayersTime : useSettingsStore().enableOppPlayersTime;
  team.name = isHome ? useSettingsStore().homeTeamName : '';
  team.score = 0;
  team.timeOut1 = false;
  team.timeOut2 = false;
  team.players.forEach((p: Player) => {
    p.id = '';
    p.name = '';
    p.isGK = p.number === 1 || p.number === 13;
    p.shotsEven = [];
    p.shotsSup = [];
    p.shotsPenalty = [];
    p.exclutions = [];
    p.active = p.active ? p.active : !isHome;
    p.activeTime = 0;
    p.actualTime = 0;
    p.benchTime = 0;
    p.shotsFaced = [];
  });
};

export function clearTeam (team: Team, isHome: boolean) {
  team.score = 0;
  team.timeOut1 = false;
  team.timeOut2 = false;
  team.players.forEach((p: Player) => {
    p.shotsEven = [];
    p.shotsSup = [];
    p.shotsPenalty = [];
    p.exclutions = [];
    p.active = !isHome;
    p.activeTime = 0;
    p.actualTime = 0;
    p.benchTime = 0;
    p.shotsFaced = [];
  });
};