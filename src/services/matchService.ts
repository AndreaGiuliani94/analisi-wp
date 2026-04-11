import type { Credentials } from "@/interfaces/Credentials";
import type { Player } from "@/interfaces/Player";
import { useAuthStore } from "@/stores/authStore";

export const updatePlayerName = async (playerId: string, newName: string) => {
    // 1. Aggiornamento Backend
    const response = await fetch(`${import.meta.env.VITE_BE_URL}/players/${playerId}`, {
        method: 'PATCH', // Usiamo PATCH perché modifichiamo solo un campo parziale
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
    });

    if (!response.ok) {
        throw new Error('Errore durante il salvataggio del giocatore');
    }
};
export const createNewPlayer = async (matchId: string, isHomeTeam: boolean, player: Player) => {
  const response = await fetch(`${import.meta.env.VITE_BE_URL}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      match_id: matchId, // L'ID della partita attuale
      team_type: isHomeTeam ? 'HOME' : 'AWAY', // O il team_id reale se lo hai
      number: player.number,
      name: player.name,
      isGk: player.isGK
    })
  });

  if (!response.ok) throw new Error('Errore durante la creazione del giocatore');
  return response;
}

export const getTeamsByName = async (teamName: string) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/teams/club/${teamName}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}

export const getTeamRoster = async (teamId: string) => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/teams/single/${teamId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}

export const getLastTeamRoster = async (teamId: string, matchId?: string) => {
    const cleanMatchId = matchId ? matchId.replace(/"/g, '') : '';
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/teams/${teamId}/last-roster` + ( cleanMatchId ? `?exclude_match_id=${cleanMatchId}` : ''), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}

export const getAllTeams = async () => {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/teams/all`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}