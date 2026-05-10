<template>
  <div class="">
    
      <!-- Header Sezione -->
      <div class="mb-8">
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">Dettagli</h1>
        <p class="text-slate-500 font-medium mt-1">Gestisci le informazioni del match e i partecipanti</p>
      </div>

      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div v-if="loading" class="p-20 flex flex-col items-center justify-center gap-4">
          <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"></div>
          <p class="text-blue-950 font-bold animate-pulse">Caricamento in corso...</p>
        </div>

        <div v-else-if="error" class="p-20 text-center">
          <div class="text-red-500 font-bold mb-4">{{ error }}</div>
          <ActionButton label="Riprova" @click="fetchSession" />
        </div>

        <div v-else class="flex flex-col">
          <!-- Info Principali (Modificabili) -->
          <div class="p-8 border-b border-slate-100">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partita</label>
                <input 
                  v-model="sessionName" 
                  type="text" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-hidden font-bold text-blue-950"
                  placeholder="Inserisci titolo..."
                  :disabled="userRole !== 'owner'"
                />
              </div>

              <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data e Ora programmata</label>
                <input 
                  v-model="scheduledAt" 
                  type="datetime-local" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-hidden font-bold text-blue-950"
                  :disabled="userRole !== 'owner'"
                />

              </div>
            </div>

            <div class="mt-6 flex justify-end" v-if="userRole === 'owner'">
              <ActionButton 
                label="Salva Modifiche" 
                :icon="CheckIcon" 
                color="blue" 
                @click="saveDetails"
              />
            </div>
          </div>

          <!-- Partecipanti -->
          <div class="p-4">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-black text-blue-950 uppercase tracking-tight">Partecipanti</h2>
            </div>
            
            <div class="space-y-3">
              <div v-for="p in participants" :key="p.user_id" 
                   class="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-200 transition-all">
                <div class="flex flex-col min-w-0">
                  <span class="font-bold text-blue-950 truncate">{{ p.name }}</span>
                  <span class="text-xs text-slate-500 truncate">{{ p.email }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <RoleListbox
                    v-model="p.role"
                    :userRole="userRole"
                    :hasTimekeeper="isTimekeeperAssigned"
                    @update:modelValue="(newRole) => updateRole(p.user_id, newRole)"
                  />
                  <ActionButton
                    :icon="TrashIcon"
                    @click="removeParticipant(p.user_id)"
                    color="red"
                    size="sm"
                    :solid="false"
                  />
                  
                </div>
              </div>
            </div>
          </div>

          <!-- <ShareButton
            :sessionId="sessionId"
            share-title="Partecipa alla mia sessione!"
          />

          <ActionButton
            label="Elimina"
            :icon="TrashIcon"
            @click="openConfirmDelete()"
            color="red"
          /> -->

           <!-- Footer Actions -->
          <div class="p-8 flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-100">
            <ActionButton
              class="flex-1"
              label="Entra nel Match"
              :icon="PlayIcon"
              :to="`/match/${sessionId}`"
              color="green"
            />
            <ShareButton
                :sessionId="sessionId"
                share-title="Partecipa alla mia sessione!"
              />
            <ActionButton
              v-if="userRole === 'owner'"
              class="flex-1"
              label="Elimina Sessione"
              :icon="TrashIcon"
              @click="openConfirmDelete()"
              color="red"
            />
          </div>

        </div>

      </div>


  </div>

  <ConfirmModal 
    :isOpen="showRemoveConfirmModal" 
    title="Conferma Rimozione"
    :message="confirmRemoveMessage"
    @confirm="removeSession(sessionId)" 
    @close="showRemoveConfirmModal = false" 
  />
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue';
import ShareButton from '@/components/buttons/ShareButton.vue';
import type { Participant } from '@/interfaces/Participant';
import RoleListbox from '@/components/listbox/RoleListbox.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import router from '@/router';
import { updateParticipantRole, deleteParticipant, deleteSession, getMatchDetails, getMatchIdBySessionId, updateSessionDetails } from '@/services/sessionService';
import { useSessionStore } from '@/stores/sessionStore';
import { PlayIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/vue/24/solid';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';

const route = useRoute();
const sessionId = route.params.id as string;
const sessionName = ref('')
const scheduledAt = ref('')
const participants = ref<Participant[]>([])
const loading = ref(false);
const error = ref('');
const userRole = ref('');
const showRemoveConfirmModal = ref(false);
const confirmRemoveMessage = ref('');
const sessionStore = useSessionStore();

const isTimekeeperAssigned = computed(() => {
  return participants.value.some(p => p.role === 'timekeeper');
});

const toast = useToast();

// Fetch session details + participants
async function fetchSession() {
  loading.value = true;
  try {
    await sessionStore.getSessionDetails(sessionId);
    const session = sessionStore.currentSession;
    participants.value = session.participants;
    userRole.value = session.user_role;
    sessionName.value = session.name;

    let matchId = '';
    const res = await getMatchIdBySessionId(sessionId);
    const data = await res.json()
    matchId = data.match_id;

    const matchRes = await getMatchDetails(matchId);
    const match = await matchRes.json();


    // Formattazione data per input datetime-local (YYYY-MM-DDTHH:mm)
    if (match.scheduled_at) {
      const date = new Date(match.scheduled_at);
      const tzoffset = date.getTimezoneOffset() * 60000;
      scheduledAt.value = new Date(date.getTime() - tzoffset).toISOString().slice(0, 16);
    }
  } catch (e) {
    error.value = (e as Error).message;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchSession();
});

async function saveDetails() {
  try {
    loading.value = true;
    const res = await updateSessionDetails(sessionId, {
      title: sessionName.value,
      scheduled_at: scheduledAt.value
    });
    if (!res.ok) throw new Error();
    toast.success("Dettagli aggiornati con successo");
    await fetchSession();
  } catch (e) {
    toast.error("Errore durante l'aggiornamento dei dettagli");
  } finally {
    loading.value = false;
  }
}

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
  confirmRemoveMessage.value = 'Stai per rimuovere tutti i dati realtivi alla partita ' + sessionName + '. Sicuro di voler procedere?'
  showRemoveConfirmModal.value = true;
}

const removeSession = async (sessionId: string) => {
  loading.value = true
  await deleteSession(sessionId);

  showRemoveConfirmModal.value = false
  loading.value = false

  router.push("/profile")
}
</script>

