<template>
  <div class="min-h-screen bg-slate-50 p-4 md:p-10 flex justify-center">
    <div class="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl w-full max-w-2xl text-center flex flex-col items-center">
      <!-- Profile Header -->
      <div class="flex flex-col items-center gap-4">
        <div class="w-24 h-24 rounded-3xl bg-linear-to-br from-blue-600 to-blue-900 text-white flex items-center justify-center text-3xl font-black shadow-lg">
          {{ initials }}
        </div>
        <div>
          <h2 class="text-2xl font-black text-blue-950 uppercase tracking-tight">
            {{ user?.name }}
          </h2>
          <p class="text-slate-500 font-medium">
            {{ user?.email }}
          </p>
        </div>
      </div>

      <!-- Dashboard Link -->
      <div class="w-full border-t border-slate-100 mt-10 pt-10 flex flex-col gap-4">
        <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Workspace</h3>
        <ActionButton 
          class="w-full justify-center py-4 rounded-2xl"
          to="/workspace/matches" 
          color="blue" 
          label="Le Mie Partite"
        />
      </div>

      <!-- Footer Actions -->
      <div class="mt-8 pt-8 border-t border-slate-50 w-full">
        <ActionButton 
          color="red" 
          @click="handleLogout" 
          label="Esci dall'account"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";
import ActionButton from "@/components/buttons/ActionButton.vue";

const auth = useAuthStore();
const router = useRouter();
const user = auth.user;
const initials = user?.name?.split(' ')
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join('') || "?";

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};

</script>