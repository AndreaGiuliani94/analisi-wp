import type { Player } from "@/interfaces/Player";
const BE_URL = import.meta.env.VITE_BE_URL;

export const updatePlayer = async (playerId: string, payload: any) => {
  // 1. Aggiornamento Backend
  const response = await fetch(
    `${BE_URL}/players/${playerId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error("Errore durante il salvataggio del giocatore");
  }
  return response;
};
export const createNewPlayer = async (
  matchId: string,
  isHomeTeam: boolean,
  player: Player,
) => {
  const response = await fetch(`${BE_URL}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      match_id: matchId, // L'ID della partita attuale
      team_type: isHomeTeam ? "HOME" : "AWAY", // O il team_id reale se lo hai
      number: player.number,
      name: player.name,
      isGk: player.isGK,
    }),
  });

  if (!response.ok)
    throw new Error("Errore durante la creazione del giocatore");
  return response;
};

export const getTeamsByName = async (teamName: string) => {
  const res = await fetch(
    `${BE_URL}/teams/club/${teamName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  return res;
};

export const getTeamRoster = async (teamId: string) => {
  const res = await fetch(
    `${BE_URL}/teams/single/${teamId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  return res;
};

export const getLastTeamRoster = async (teamId: string, matchId?: string) => {
  const cleanMatchId = matchId ? matchId.replace(/"/g, "") : "";
  const res = await fetch(
    `${BE_URL}/teams/${teamId}/last-roster` +
    (cleanMatchId ? `?exclude_match_id=${cleanMatchId}` : ""),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  return res;
};

export const getAllTeams = async () => {
  const res = await fetch(`${BE_URL}/teams/all`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  return res;
};

export const savePregameSetup = async (matchId: string, requestBody: any) => {
  const response = await fetch(
    `${BE_URL}/matches/${matchId}/setup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response;
};

export const createNewTeam = async (requestBody: any) => {
  const response = await fetch(
    `${BE_URL}/teams/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response;
}

export const updateSubstitutions = async (matchId: string, requestBody: any) => {
  const response = await fetch(
    `${BE_URL}/matches/${matchId}/substitutions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      credentials: "include",
    },
  );

  if (!response.ok) {
    // Se il BE risponde con 400 o 500, lanciamo un'eccezione
    const errorData = await response.json();
    throw new Error(errorData.message || `Errore server: ${response.status}`);
  }
  
  return response;
};