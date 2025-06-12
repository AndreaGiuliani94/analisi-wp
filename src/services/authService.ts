import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const API_URL = "http://localhost:8000";

export const loginWithGoogle = async (googleToken: string) => {
  const response = await axios.post(`${API_URL}/google-login`, {
    token: googleToken,
  });

  const token = response.data.access_token;
  const auth = useAuthStore();
  auth.setAuth(token);
};

// Token JWT finto (mock)
const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiZXhwIjo5OTk5OTk5OTk5fQ.b8HyrC5P7hljWCgODxIOjUm8xUhWaSPSxgLUkre7elE";

export const loginWithGoogleMock = async (_googleToken: string) => {
  const auth = useAuthStore();

  // Simula attesa API
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mocka login: salva token finto nello store
  auth.setAuth(mockToken);
};