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