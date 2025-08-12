<template>
  <div>
    <h1>Dettagli sessione: {{ session?.name || sessionId }}</h1>

    <div v-if="loading">Caricamento...</div>
    <div v-if="error" class="text-red-600">{{ error }}</div>

    <div v-if="!loading && session">
      <h2>Partecipanti</h2>
      <table class="min-w-full border">
        <thead>
          <tr>
            <th class="border px-2 py-1">Email</th>
            <th class="border px-2 py-1">Nome</th>
            <th class="border px-2 py-1">Ruolo</th>
            <th class="border px-2 py-1">Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in participants" :key="p.user_id">
            <td class="border px-2 py-1">{{ p.email }}</td>
            <td class="border px-2 py-1">{{ p.name }}</td>
            <td class="border px-2 py-1">
              <RoleListbox
                v-model="p.role"
                @update:modelValue="(newRole) => updateRole(p.user_id, newRole)"
              />
            </td>
            <td class="border px-2 py-1">
              <button @click="removeParticipant(p.user_id)" class="text-red-600 hover:underline">Rimuovi</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Participant } from '@/components/Interfaces/Participant';
import type { Session } from '@/components/Interfaces/Session';
import RoleListbox from '@/components/listbox/RoleListbox.vue';
import { updateParticipantRole, getSessionDetails, deleteParticipant } from '@/services/sessionService';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const sessionId = route.params.id as string;
const session = ref<Session | null>(null);
const participants = ref<Participant[]>([])
const loading = ref(false);
const error = ref('');

// Fetch session details + participants
async function fetchSession() {
  loading.value = true;
  try {
    const res = await getSessionDetails(sessionId)
    if (!res.ok) throw new Error('Errore caricamento sessione');
    const data = await res.json();
    session.value = data;
    participants.value = data.participants;
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchSession();
});

// Modifica ruolo
async function updateRole(userId: string, newRole: string) {
  try {
    const res = await updateParticipantRole(sessionId, userId, newRole)
    if (!res.ok) throw new Error('Errore aggiornamento ruolo');
    await fetchSession(); // ricarica dati
  } catch (e) {
    alert((e as Error).message);
  }
}

// Rimuovi partecipante
async function removeParticipant(userId: string) {
  if (!confirm('Sei sicuro di voler rimuovere questo partecipante?')) return;
  try {
    const res = await deleteParticipant(sessionId, userId)
    if (!res.ok) throw new Error('Errore rimozione partecipante');
    await fetchSession(); // ricarica dati
  } catch (e) {
    alert((e as Error).message);
  }
}
</script>

