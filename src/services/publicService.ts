const BE_URL = import.meta.env.VITE_BE_URL;

export const getClubLiveMatches = async (slug: string) => {
  const res = await fetch(
    `${BE_URL}/live/club-matches/${slug}`,
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

export const getLiveMatchIdBySessionId = async (sessionId: string) => {
    const res = await fetch(`${BE_URL}/live/session/${sessionId}/match`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}

export const getLiveMatchDetails = async (matchId: string) => {
    const res = await fetch(`${BE_URL}/live/match/${matchId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}

export const getLiveEvents = async (matchId: string) => {
    const res = await fetch(`${BE_URL}/live/match/${matchId}/events`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
    })
    return res;
}