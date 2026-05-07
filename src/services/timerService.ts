const BE_URL = import.meta.env.VITE_BE_URL;

export const timerPlay = async (payload: any) => {
  const response = await fetch(
    `${BE_URL}/timer/play`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    },
  );
}

export const timerStop = async (payload: any) => {
  const response = await fetch(
    `${BE_URL}/timer/stop`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    },
  );
}

export const startPenalties = async (matchId: string, requestBody: any) => {
  const response = await fetch(
    `${BE_URL}/timer/${matchId}/start-penalties`,
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