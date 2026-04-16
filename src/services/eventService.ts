import type { MatchEvent } from "@/interfaces/MatchEvent";

const BE_URL = import.meta.env.VITE_BE_URL;

export const saveMatchEvent = async (payload: any ) => {
  const response = await fetch(
    `${BE_URL}/events/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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

export const deleteMatchEvent = async (eventId: string, myClientId: string ) => {
  const response = await fetch(
    `${BE_URL}/events/${eventId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({sender_client_id: myClientId}),
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
