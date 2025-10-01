<!-- views/JoinSession.vue -->
<template>
  <div class="flex items-center justify-center h-[80vh]">
    <div class="text-center space-y-4">
      <h2 class="text-2xl font-bold">Unione alla sessione...</h2>
      <p class="text-gray-600">Attendere mentre ti aggiungiamo alla sessione.</p>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { joinSession } from '@/services/sessionService'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStateStore } from '@/stores/sessionStateStore'
import { useSessionStore } from '@/stores/sessionStore'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const sessionId = route.params.id as string
const error = ref('')

onMounted(async () => {
  try {
    const res = await joinSession(sessionId);
    if (!res.ok) {
      throw new Error('Errore durante l’unione alla sessione.')
    }
    
    const sessionStateStore = useSessionStateStore();
    const authStore = useAuthStore()
    const sessionStore = useSessionStore()

    await sessionStateStore.joinSession(sessionId);
    
    const userRole = sessionStore.getUserRoleByEmail(authStore.user?.email ?? '');
    if (await userRole === 'viewer')
      router.push("/game/live")
    else
      router.push('/game');
  } catch (err: any) {
    error.value = err.message || 'Errore sconosciuto'
  }
})
</script>
