import { defineStore } from 'pinia';

interface User {
  email: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.user,
  },

  actions: {
    loadFromStorage() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp > now) {
          this.token = token;
          this.user = { email: payload.sub };
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    },

    setAuth(token: string) {
      localStorage.setItem("token", token);
      this.token = token;
      this.loadFromStorage();
    },

    logout() {
      localStorage.removeItem("token");
      this.token = null;
      this.user = null;
    },
  },
});