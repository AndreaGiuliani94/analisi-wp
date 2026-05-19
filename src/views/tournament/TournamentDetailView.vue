<template>
  <div class="bg-slate-50">
    <div v-if="loading" class="text-center py-10">
      <p class="text-lg font-medium text-blue-950">Caricamento dettagli torneo...</p>
    </div>

    <div v-else-if="tournament">
      <!-- Header Sezione -->
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-6">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <TournamentCategoryGenderBadge 
              :category="tournament.category"
              :gender="tournament.gender"
            />
            <h1 class="text-3xl font-black text-blue-950 tracking-tight">{{ tournament.name }}</h1>
          </div>
          <p class="text-slate-500 font-medium mt-1">Stagione: {{ tournament.season }}</p>
        </div>
        <div class="flex gap-3 mt-4 md:mt-0">
          <ActionButton 
            label="Modifica Torneo" 
            :icon="PencilIcon" 
            color="blue" 
            @click="showEditModal = true"
          />
          <ActionButton 
            label="Impostazioni" 
            :icon="Cog6ToothIcon" 
            color="blue"
            :solid="false" 
            @click="showSettingsModal = true"
          />
        </div>
      </div>

      <!-- Sezioni Dettagli -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Partite Associate -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-blue-950">Partite Associate ({{ tournament.matches?.length || 0 }})</h2>
            <ActionButton 
              label="Nuova Partita" 
              :icon="PlusIcon" 
              color="green"
              :solid="false"
              :size="'sm'"
              @click="showCreateMatchModal = true"
            />
          </div>
          <div v-if="tournament.matches && tournament.matches.length > 0" class="space-y-4">
            <div v-for="match in tournament.matches" :key="match.id" class="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100">
              <div class="flex flex-col">
                <p class="font-semibold text-blue-950">{{ match.home_team?.club_name }} vs {{ match.away_team?.club_name }}</p>
                <span class="text-xs text-slate-500">{{ (match.name ? (match.name + ' - ') : '') + formatDateTime(match.scheduled_at) }}</span>
              </div>
              <NavButton 
                :to="`/workspace/matches/${match.id}`" 
                label="Vedi Match" 
                :icon="ArrowRightIcon" 
                size="sm"
              />
            </div>
          </div>
          <div v-else class="text-slate-500 text-center py-8">Nessuna partita associata a questo torneo.</div>
        </div>

        <!-- Utenti Associati -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-sm p-4 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-blue-950">Utenti Associati ({{ tournament.participants?.length || 0 }})</h2>
            <ActionButton 
              label="Aggiungi Utente" 
              :icon="UserPlusIcon" 
              color="green"
              :solid="false"
              :size="'sm'"
              @click="showAddUserModal = true"
            />
          </div>
          <div v-if="tournament.participants && tournament.participants.length > 0" class="space-y-4">
            <div v-for="user in tournament.participants" :key="user.user_id" class="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-100">
              <div class="flex items-center gap-3">
                <UserCircleIcon class="size-6 text-slate-400" />
                <p class="font-semibold text-blue-950">{{ user.name }}</p>
              </div> 
              <RoleBadge :role="user.role" />
            </div>
          </div>
          <div v-else class="text-slate-500 text-center py-8">Nessun utente associato a questo torneo.</div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white rounded-4xl border-2 border-dashed border-slate-200 p-20 text-center">
      <div class="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ExclamationTriangleIcon class="size-12 text-slate-200" />
      </div>
      <h2 class="text-2xl font-black text-blue-950 uppercase tracking-tight">Torneo non trovato</h2>
      <p class="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Sembra che il torneo che stai cercando non esista o non sia accessibile.</p>
    </div>

    <!-- Modals -->
    <NewMatchModal 
      v-if="tournament"
      :is-open="showCreateMatchModal" 
      :tournament-id="tournament.id" 
      @close="showCreateMatchModal = false" 
      @created="refreshTournamentDetails"
    />
    <AddUserToTournamentModal
      v-if="tournament"
      :is-open="showAddUserModal"
      :tournament-id="tournament.id"
      :existing-participants="tournament.participants"
      @close="showAddUserModal = false"
      @updated="refreshTournamentDetails"
    />
    <EditTournamentModal 
      :is-open="showEditModal" 
      :tournament="tournament" 
      @close="showEditModal = false" 
      @updated="refreshTournamentDetails"
    />
    <ViewTournamentSettingsModal 
      :is-open="showSettingsModal" 
      :tournament="tournament" 
      @close="showSettingsModal = false"
      @updated="refreshTournamentDetails"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTournamentStore } from '@/stores/tournamentStore'
import ActionButton from '@/components/buttons/ActionButton.vue'
import NavButton from '@/components/buttons/NavButton.vue'
import TournamentCategoryGenderBadge from '@/components/badges/TournamentCategoryGenderBadge.vue'
import EditTournamentModal from '@/components/modals/EditTournamentModal.vue'
import ViewTournamentSettingsModal from '@/components/modals/ViewTournamentSettingsModal.vue'
import NewMatchModal from '@/components/modals/NewMatchModal.vue'
import AddUserToTournamentModal from '@/components/modals/AddUserToTournamentModal.vue'
import { PlusIcon, PencilIcon, Cog6ToothIcon, ArrowRightIcon, UserCircleIcon, ExclamationTriangleIcon, UserPlusIcon } from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/utils'
import type { Tournament } from '@/interfaces/Tournament' // Assicurati che l'interfaccia sia definita
import RoleBadge from '@/components/badges/RoleBadge.vue'

const route = useRoute()
const tournamentStore = useTournamentStore()

const tournament = ref<Tournament | null>(null)
const loading = ref(true)
const showEditModal = ref(false)
const showCreateMatchModal = ref(false)
const showAddUserModal = ref(false)
const showSettingsModal = ref(false)

const fetchTournamentDetails = async () => {
  loading.value = true
  try {
    const tournamentId = route.params.id as string
    const data = await tournamentStore.getTournamentById(tournamentId)
    tournament.value = data
  } catch (error) {
    console.error('Errore nel recupero dei dettagli del torneo:', error)
    tournament.value = null // Imposta a null per mostrare lo stato di errore
  } finally {
    loading.value = false
  }
}

const refreshTournamentDetails = () => {
  showEditModal.value = false; // Chiudi la modale di modifica
  fetchTournamentDetails(); // Ricarica i dettagli del torneo
}

onMounted(fetchTournamentDetails)
</script>
