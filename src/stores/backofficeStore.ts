import { getAdminDshboard, getOrganizationDetail, removeUserFromOrg } from "@/services/adminService";
import { defineStore } from "pinia";

export const useBackofficeStore = defineStore('backoffice', {
  state: () => ({
    organizations: [] as any[],
    users: [] as any[]
  }),

  getters: {
    
  },

  actions: {
    async getAdminDashboard() {
      const res = await getAdminDshboard();
      this.organizations = res.organizations 
      this.users = res.users
    },
    async removeUser(userId: string, orgId: string) {
      const res = await removeUserFromOrg(userId, orgId);
      this.users = this.users.filter(u => u.id !== res.user_id);
    },
    async getOrganization(orgId: string) {
      const res = await getOrganizationDetail(orgId);
      this.organizations = res.organizations 
      this.users = res.users
    }
  
  },
});