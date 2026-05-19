<template>
  <div class="">
    
      <!-- Header Sezione -->
      <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div v-if="loading" class="p-20 flex flex-col items-center justify-center gap-4">
          <div class="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"></div>
          <p class="text-blue-950 font-bold animate-pulse">Caricamento in corso...</p>
        </div>

        <div v-else-if="error" class="p-20 text-center">
          <div class="text-red-500 font-bold mb-4">{{ error }}</div>
          <ActionButton label="Riprova" @click="fetchMatchDetails" />
        </div>

        <div v-else class="flex flex-col">
          <!-- Matchup, Status & Tournament Summary -->
          <div class="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="p-2 rounded-2xl border border-slate-200 flex flex-row items-end gap-4">
              <div class="flex flex-col items-center md:items-start">
                <h1 class="text-3xl font-black text-blue-950 tracking-tight">{{ matchName }}</h1>
                <p class="text-slate-500 font-medium mt-1">{{ formatDateTime(scheduledAt) }}</p>
              </div>
              <ActionButton  
                :icon="PencilIcon" 
                color="blue"
                size="sm"
                :solid="false"
                @click="showEditMatchDetailsModal = true"
              />
            </div>
            
            <div class="flex items-center gap-3">
              <div class="text-center md:text-right">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Casa</p>
                <p class="text-xl font-bold text-blue-950">{{ homeTeamName || '-' }}</p>
              </div>
              <div class="shrink-0 size-10 bg-white rounded-full flex items-center justify-center text-xs font-black text-slate-300 border border-slate-200 shadow-xs">
                VS
              </div>
              <div class="text-center md:text-left">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Trasferta</p>
                <p class="text-xl font-bold text-blue-950">{{ awayTeamName || '-' }}</p>
              </div>
              <MatchStatusBadge :status="matchStatus" :isLive="isPublicLive" />
            </div>
            

            <div class="flex flex-wrap items-center gap-3">
              <div class="flex flex-col items-end gap-2">
                <TournamentBadge 
                  v-if="tournamentData" 
                  :tournament="tournamentData" 
                />
              </div>
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

           <!-- Footer Actions -->
          <div class="p-8 flex flex-col sm:flex-row justify-center gap-4 border-t border-slate-100">
            <ActionButton
              class="flex-1"
              label="Entra nel Match"
              :icon="PlayIcon"
              :to="`/match/${matchId}`"
              color="green"
            />
            <ShareButton
                :matchId="matchId"
                share-title="Partecipa alla mia partita!"
              />
            <ActionButton
            v-if="canManageParticipants(userRole)"
              class="flex-1"
              label="Elimina partita"
              :icon="TrashIcon"
              @click="openConfirmDelete()"
              color="red"
            />
          </div>

        </div>

        <!-- Modals -->
        <EditMatchDetailsModal
          :is-open="showEditMatchDetailsModal"
          :match-id="matchId"
          :current-match-name="matchName"
          :current-scheduled-at="scheduledAt"
          @close="showEditMatchDetailsModal = false"
          @updated="fetchMatchDetails"
        />
      </div>
  </div>
</template>

<script setup lang="ts">
import ActionButton from '@/components/buttons/ActionButton.vue';
import ShareButton from '@/components/buttons/ShareButton.vue';
import RoleListbox from '@/components/listbox/RoleListbox.vue';
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue';
import EditMatchDetailsModal from '@/components/modals/EditMatchDetailsModal.vue';
import { usePermissions } from '@/composables/usePermissions';
import TournamentBadge from '@/components/badges/TournamentBadge.vue';
import { useAuthStore } from '@/stores/authStore';
import { PlayIcon, TrashIcon } from '@heroicons/vue/24/solid';
import { PencilIcon } from '@heroicons/vue/24/outline';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useToast } from 'vue-toastification';
import { deleteParticipant, getMatchDetails, updateMatchDetails, updateParticipantRole } from '@/services/matchService';
import { MatchRole } from '@/enum/RoleType';
import type { MatchStatus } from '@/enum/MatchStatus';
import { formatDateTime } from '@/utils/utils';

export interface MatchParticipant {
  user_id: string;
  name: string;
  email: string;
  role: MatchRole;
}

const route = useRoute();
const matchId = route.params.id as string;
const matchName = ref('')
const scheduledAt = ref('')
const participants = ref<MatchParticipant[]>([])
const loading = ref(false);
const homeTeamName = ref('');
const awayTeamName = ref('');
const matchStatus = ref<MatchStatus | undefined>(undefined);
const isPublicLive = ref(false);
const showEditMatchDetailsModal = ref(false);
const error = ref('');
const showRemoveConfirmModal = ref(false);
const confirmRemoveMessage = ref('');
const authStore = useAuthStore();
const { canManageParticipants, canEditMatch } = usePermissions();

const userRole = computed(() => {
  const currentUserId = authStore.user?.id;
  const p = participants.value.find(p => p.user_id === currentUserId);
  return p ? p.role : '';
});

const isTimekeeperAssigned = computed(() => {
  return participants.value.some(p => p.role === MatchRole.TIMEKEEPER);
});

const tournamentData = ref<any>(null);

async function fetchMatchDetails() {
  loading.value = true;
  try {
    const matchRes = await getMatchDetails(matchId);
    const match = await matchRes.json();
    participants.value = match.participants;
    matchName.value = match.name;
    homeTeamName.value = match.home_team?.club_name || '';
    awayTeamName.value = match.away_team?.club_name || '';
    matchStatus.value = match.status;
    isPublicLive.value = match.is_public_live;

    tournamentData.value = match.tournament;

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

onMounted(fetchMatchDetails);

// Modifica ruolo
async function updateRole(userId: string, newRole: string) {
  try {
    const res = await updateParticipantRole(matchId, userId, newRole)
    if (!res.ok) throw new Error('Errore aggiornamento ruolo');
    await fetchMatchDetails(); // ricarica dati
  } catch (e) {
    alert((e as Error).message);
  }
}

// Rimuovi partecipante
async function removeParticipant(userId: string) {
  if (!confirm('Sei sicuro di voler rimuovere questo partecipante?')) return;
  try {
    const res = await deleteParticipant(matchId, userId)
    if (!res.ok) throw new Error('Errore rimozione partecipante');
    await fetchMatchDetails(); // ricarica dati
  } catch (e) {
    alert((e as Error).message);
  }
}

const openConfirmDelete = async () => {
  confirmRemoveMessage.value = 'Stai per rimuovere tutti i dati realtivi alla partita ' + matchName + '. Sicuro di voler procedere?'
  showRemoveConfirmModal.value = true;
}

</script>
