import { logout } from '@/services/authService';
import { defineStore } from 'pinia';

interface User {
  email: string;
  name: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    accessToken: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.user,
  },

  actions: {
    setAuth(access: string, user: any) {
      this.accessToken = access;
      this.user = user;
    },
    async logout() {
      const res = await logout();
      console.log(res);
      localStorage.removeItem("token");
      this.accessToken = null;
      this.user = null;
    },
    async refresh() {
      try {
        const res = await fetch(import.meta.env.VITE_BE_URL + '/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        })
        if (res.ok) {
          const data = await res.json();
          this.accessToken = data.access_token;
          this.user = data.user;
          return true;
        } else {
          this.clearAuth();
          return false;
        }
      } catch (e) {
        console.error('Errore durante il refresh', e);
        this.clearAuth();
        return false;
      }
    },
    clearAuth() {
      this.accessToken = null;
      this.user = null;
    }
  },
});