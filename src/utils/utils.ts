import type { Exclution } from "@/interfaces/Exclution";
import type { Player } from "@/interfaces/Player";

export function getExclution (exclution: Exclution) {
    var str: string = '';
    str += exclution.quarter + 'T ' + exclution.time + ' ' + (exclution.type + ' ' + exclution.position);
    if(exclution.type !== 'EDCS') {
        str += ' ';
        str += exclution.ball ? 'Con palla' : 'Senza palla';
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
        active: bePlayer.is_playing, // Nessuno in acqua all'inizio
        // Capiamo se è portiere dal ruolo stringa, o per fallback dal numero di calottina
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