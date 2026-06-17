<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
</script>

<template>
  <router-link 
    :to="authStore.isLoggedIn ? '/workspace' : '/login'" 
    class="bg-blue-950 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-900 transition-all shadow-md"
  >
    {{ authStore.isLoggedIn ? 'Dashboard' : 'Accedi' }}
  </router-link>
</template>