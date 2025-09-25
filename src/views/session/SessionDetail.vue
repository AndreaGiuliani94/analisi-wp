<template>
  <div class="flex justify-center text-blue-950">
    <div class="bg-white p-8 rounded-2xl border-2 border-gray-300 shadow-lg w-2/3 text-center">
      <div class="flex flex-col items-center gap-4">

        <h1 class="text-xl font-bold text-center">{{ session?.name || sessionId }}</h1>

        <div v-if="loading">Caricamento...</div>
        <div v-if="error" class="text-red-600">{{ error }}</div>

        <div v-if="!loading && session">
          <h2 class="text-lg">Partecipanti</h2>
          
          <div v-for="p in participants" :key="p.user_id">
            <div class="flex w-full justify-between bg-gray-200 px-2 py-1 m-1 items-center gap-2 rounded">
              <div class="">{{ p.name }} ({{ p.email }})</div>
              <RoleListbox
                v-model="p.role"
                :userRole="userRole"
                @update:modelValue="(newRole) => updateRole(p.user_id, newRole)"
              />
              <ActionButton
                label="Rimuovi"
                color="red"
                :icon="XMarkIcon"
                iconSize="size-4"
                @click="removeParticipant(p.user_id)"
                size="sm"
                v-if="userRole == 'owner'"
              ></ActionButton>
            </div>
          </div>
        </div>

        <div class="flex justify-between gap-2">
          <ActionButton
            label="Entra"
            :icon="PlayIcon"
            :to="`/session/join/${sessionId}`"
            ></ActionButton>

          <ActionButton
            label="Elimina"
            :icon="TrashIcon"
            @click="openConfirmDelete()"
            color="red"
          ></ActionButton>
          
        </div>

        
      </div>
    </div>
  </div>
  <ConfirmModal :isOpen="showRemoveConfirmModal" title="Conferma Rimozione"
        :message=confirmRemoveMessage
        @confirm="removeSession(sessionId)" @close="showRemoveConfirmModal = false" />

</template>
<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue';
import type { Participant } from '@/components/Interfaces/Participant';
import type { Session } from '@/components/Interfaces/Session';
import RoleListbox from '@/components/listbox/RoleListbox.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import router from '@/router';
import { updateParticipantRole, getSessionDetails, deleteParticipant, deleteSession } from '@/services/sessionService';
import { PlayIcon, TrashIcon, XMarkIcon } from '@heroicons/vue/24/solid';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const sessionId = route.params.id as string;
const session = ref<Session | null>(null);
const participants = ref<Participant[]>([])
const loading = ref(false);
const error = ref('');
const userRole = ref('');
const showRemoveConfirmModal = ref(false);
const confirmRemoveMessage = ref('');

// Fetch session details + participants
async function fetchSession() {
  loading.value = true;
  try {
    const res = await getSessionDetails(sessionId)
    if (!res.ok) throw new Error('Errore caricamento sessione');
    const data = await res.json();
    session.value = data;
    participants.value = data.participants;
    userRole.value = data.user_role;
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

const openConfirmDelete = async () => {
  confirmRemoveMessage.value = 'Stai per rimuovere tutti i dati realtivi alla partita ' + session.value?.name + '. Sicuro di voler procedere?'
  showRemoveConfirmModal.value = true;
}

const removeSession = async (sessionId: string) => {
  loading.value = true
  const res = await deleteSession(sessionId);

  showRemoveConfirmModal.value = false
  loading.value = false

  router.push("/profile")
}
</script>

