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