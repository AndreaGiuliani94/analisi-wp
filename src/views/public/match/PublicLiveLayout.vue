<template>
  <div v-if="loading" class="flex flex-col items-center justify-center min-h-[50vh] gap-4">
    <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"></div>
    <p class="text-blue-950 font-bold animate-pulse">Caricamento partita in corso...</p>
  </div>

  <div v-else>
    <PublicLiveNavbar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRealtimeStore } from '@/stores/realtimeStore';
import { useMatchStateStore } from '@/stores/matchStateStore';
import { useRoute } from 'vue-router';
import PublicLiveNavbar from '@/components/match/public/PublicLiveNavbar.vue';

const route = useRoute();
const matchId = route.params.matchId as string;

const realtimeStore = useRealtimeStore();

const matchStateStore = useMatchStateStore();

const loading = ref(true);

onMounted(async () => {
  try {
    await matchStateStore.joinPublicMatch(matchId);
    realtimeStore.subscribeToMatch();
  } catch (err) {
    console.error("Errore durante l'idratazione della partita pubblica:", err);
  } finally {
    loading.value = false;
  }
})

onUnmounted(() => {
  realtimeStore.unsubscribe();
})
</script>
