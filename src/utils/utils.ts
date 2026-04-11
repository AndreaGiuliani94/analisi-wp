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