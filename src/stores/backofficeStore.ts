import { getAdminDshboard } from "@/services/adminService";
import { defineStore } from "pinia";

export const useBackofficeStore = defineStore('backoffice', {
  state: () => ({
    organizations: [] as any[],
    users: [] as any[]
  }),

  getters: {
    
  },

  actions: {
    async getAdminDshboard() {
      const res = await getAdminDshboard();
      console.log(res);
      this.organizations = res.organizations 
      this.users = res.users
    },
    
  },
});