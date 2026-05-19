<template>
  <div class="h-screen flex flex-col font-sans">

    <navbar-item />
    
    <div v-if="isLoading" class="flex items-center justify-center h-[80vh]">
      <div class="text-center space-y-4">
        <h2 class="text-2xl font-bold">Unione alla partita...</h2>
        <p class="text-gray-600">Attendere mentre ti aggiungiamo alla partita.</p>
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      </div>
    </div>

    <div v-else class="px-2 md:px-4 py-2 md:py-4 bg-white w-full min-h-full">
      <router-view />
    </div>

  </div>

  
</template>

<script setup lang="ts">
import NavbarItem from '@/components/NavbarItem.vue'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { useMatchStateStore } from '@/stores/matchStateStore'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const matchId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

const realtimeStore = useRealtimeStore()

onMounted(async () => {
  try {
    const matchStateStore = useMatchStateStore();
    await matchStateStore.joinMatch(matchId);
    realtimeStore.subscribeToMatch();
  } catch (err: any) {
    error.value = err.message || 'Errore sconosciuto'
  } finally {
    isLoading.value = false;
  }
})

onUnmounted(() => {
  realtimeStore.unsubscribe();
})
</script>
