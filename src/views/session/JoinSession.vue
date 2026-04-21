<!-- views/JoinSession.vue -->
<template>
  <div v-if="isLoading" class="flex items-center justify-center h-[80vh]">
    <div class="text-center space-y-4">
      <h2 class="text-2xl font-bold">Unione alla sessione...</h2>
      <p class="text-gray-600">Attendere mentre ti aggiungiamo alla sessione.</p>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </div>
  </div>
  <div v-else class="h-full w-full">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { joinSession } from '@/services/sessionService'
import { useRealtimeStore } from '@/stores/realtimeStore'
import { useSessionStateStore } from '@/stores/sessionStateStore'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const sessionId = route.params.id as string
const isLoading = ref(true)
const error = ref('')

const realtimeStore = useRealtimeStore()

onMounted(async () => {
  try {
    const res = await joinSession(sessionId);
    if (!res.ok) {
      throw new Error('Errore durante l’unione alla sessione.')
    }
    const sessionStateStore = useSessionStateStore();
    await sessionStateStore.joinSession(sessionId);
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
