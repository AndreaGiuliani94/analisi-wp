<template>
  <div class="p-4">
    <div v-if="sessionStore.sessions?.length > 0" class="m-2 text-lg">Sessioni aperte:

      <div v-for="(session, index) in sessionStore.sessions" class="text-sm bg-gray-200 px-2 py-1 m-1 rounded">
        <RouterLink :to="`/session/${session.session_id}`" class="text-blue-600 hover:underline text-sm">
          {{ frontendBaseUrl }}/session/join/{{ session.session_id }}
        </RouterLink>
        <RoleBadge :role="session.role" />
      </div>
    </div>

    <ActionButton @click="createSession" :disabled="loading" color="blue" label="Crea una nuova sessione">
    </ActionButton>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue'
import { useSessionStore } from '@/stores/sessionStore'
import { onMounted, ref } from 'vue'
import RoleBadge from './RoleBadge.vue'
import { supabase } from '@/lib/supabase'

const loading = ref(false)
const sessionStore = useSessionStore()

const frontendBaseUrl = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173'

const createSession = async () => {
  loading.value = true
  const res = await fetch(import.meta.env.VITE_BE_URL + '/sessions/create', {
    method: 'POST',
    credentials: 'include'
  })

  const data = await res.json()
  sessionStore.getAllSessions()

  const sessionId = data['session_id'];

  const { error } = await supabase.from('session_state').insert([
    {
      session_id: sessionId,
      match: {},         // o null, a seconda della struttura
      events: [],        // array vuoto inizialmente
    }
  ])

  if (error) {
    console.error('Errore durante inizializzazione session_state:', error)
  }

  loading.value = false
}

onMounted(async () => {
  sessionStore.getAllSessions()
})

</script>
