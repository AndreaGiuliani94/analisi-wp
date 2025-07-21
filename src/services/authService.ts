import { useAuthStore } from "@/stores/authStore";

export const loginWithGoogle = async (code: any) => {
  const res = await fetch(import.meta.env.VITE_BE_URL + "/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
    credentials: "include"
  });
  return res;
};

export const loginWithCredentials = async (email: string, password: string) => {
  const res = await fetch(import.meta.env.VITE_BE_URL + '/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    });
    return res;
}

export const logout = async () => {
  const res = await fetch(import.meta.env.VITE_BE_URL + "/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });
  return res;
};

export const refresh = async () => {
  const res = await fetch(import.meta.env.VITE_BE_URL + '/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });
  return res;
}

export const joinSession = async (sessionId: string) => {
  const res = await fetch(import.meta.env.VITE_BE_URL + `/sessions/join/${sessionId}`, {
      method: 'POST',
      credentials: 'include'
    })
    return res;
}

// Token JWT finto (mock)
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.b8HyrC5P7hljWCgODxIOjUm8xUhWaSPSxgLUkre7elE";

export const loginWithGoogleMock = async (_googleToken: string) => {
  const auth = useAuthStore();

  // Simula attesa API
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mocka login: salva token finto nello store
  // auth.setAuth(mockToken);
};