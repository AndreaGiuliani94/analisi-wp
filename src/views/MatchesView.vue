<template>
  <div class="bg-slate-50">
    <!-- Header Sezione -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-6">
    <div>
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">Le Mie Partite</h1>
        <p class="text-slate-500 font-medium mt-1">Gestione delle analisi e match live</p>
    </div>
    <div class="flex gap-3">
        <ActionButton 
        label="Nuova Partita" 
        :icon="PlusIcon" 
        color="green" 
        @click="showCreateModal = true"
        />
        <ActionButton 
        label="Unisciti" 
        :icon="UserGroupIcon" 
        color="blue" 
        @click="showJoinModal = true"
        />
    </div>
    </div>

    <!-- Barra di Ricerca -->
    <div v-if="!loading && (matches.length > 0 || searchQuery)" class="mb-6 flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1 w-full md:max-w-md">
        <label class="text-sm font-semibold text-blue-950 mb-1 block">Cerca partita</label>
        <div class="relative group">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="size-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cerca per squadra, nome o torneo..." 
            class="block w-full pl-11 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div class="w-full md:w-64">
        <TournamentListbox
          v-model="selectedTournamentId" 
          placeholder="Tutti i tornei"
          label="Filtra per torneo"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
      <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full shadow-sm"></div>
      <p class="text-slate-500 font-medium animate-pulse">Caricamento partite...</p>
    </div>

    <!-- Grid Card -->
    <div v-else-if="matches.length > 0">
      <div v-if="filteredMatches.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div v-for="match in filteredMatches" :key="match.id" 
                class="group relative bg-white rounded-lg border border-slate-200 px-4 py-2 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col">
            
            <!-- Header Card -->
            <div class="flex justify-between items-center mb-3">
              
              <div class="flex flex-col overflow-hidden">
                  <h3 class="font-bold text-blue-950 truncate pr-2" :title="getMatchLabel(match)">
                      {{ getMatchLabel(match) }}
                  </h3>
                  <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ formatDateTime(match.scheduled_at) }}</span>
              </div>
              <TournamentBadge 
                  v-if="match.tournament" 
                  :tournament="match.tournament" 
                />
            </div>

            <!-- Matchup Central -->
            <div class="flex-1 flex flex-col justify-center">
                <div class="bg-slate-50 rounded-3xl w-full py-2 border border-slate-100 flex justify-center gap-2 items-center mb-2">
                    <p class="flex-1 text-right font-black text-blue-950 text-sm uppercase truncate">
                        {{ match.home_team?.club_name || '-' }}
                    </p>

                    <div class="shrink-0 size-8 bg-white rounded-full flex items-center justify-center text-[9px] font-black text-slate-300 border border-slate-200 transition-colors duration-300 shadow-sm">
                        VS
                    </div>

                    <p class="flex-1 text-left font-black text-blue-950 text-sm uppercase truncate">
                        {{ match.away_team?.club_name || '-' }}
                    </p>
                </div>
            </div>

            <div class="w-full flex justify-between">
              <div class="flex">
                <MatchStatusBadge :status="match.status" :isLive="match.is_public_live" :size="'sm'" />
              </div>

              <!-- Footer Actions -->
              <div class="justify-end flex items-center gap-4">
                  
                  <NavButton 
                      class=""
                      :icon="MagnifyingGlassIcon"
                      :to="`/workspace/matches/${match.id}`"
                      title="Vedi Dettagli"
                      label="Dettagli"
                  />
                  <NavButton 
                      class=""
                      :to="`/match/${match.id}`" 
                      :icon="ArrowRightIcon" 
                      color="green"
                      title="Live Match"
                      label="Live"
                  />
                  <NavButton 
                      class="shrink-0"
                      :icon="TrashIcon"
                      @click="openConfirmDelete(match)"
                      color="red"
                      title="Elimina"
                      label="Elimina"
                  />
                  
              </div>
            </div>
        </div>
      </div>

      <!-- Nessun Risultato Ricerca -->
      <div v-else class="bg-white rounded-4xl border border-slate-200 p-16 text-center shadow-sm">
        <div class="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MagnifyingGlassIcon class="size-8 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-blue-950">Nessun risultato</h3>
        <p class="text-slate-500 mt-1">Non abbiamo trovato partite che corrispondono a "{{ searchQuery }}".</p>
        <button @click="searchQuery = ''" class="mt-4 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">Resetta filtri</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-4xl border-2 border-dashed border-slate-200 p-20 text-center">
        <div class="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDaysIcon class="size-12 text-slate-200" />
        </div>
        <h2 class="text-2xl font-black text-blue-950 uppercase tracking-tight">Nessuna partita</h2>
        <p class="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Non hai ancora partecipato a nessuna partita. Crea la tua prima partita per iniziare!</p>
    </div>

    <!-- Modals -->
    <ConfirmModal 
      :isOpen="showRemoveConfirmModal" 
      title="Conferma Rimozione"
      :message="confirmRemoveMessage"
      @confirm="removeMatch" 
      @close="showRemoveConfirmModal = false" 
    />
    <NewMatchModal :isOpen="showCreateModal" @close="showCreateModal = false" />
    <JoinMatchModal :isOpen="showJoinModal" @close="showJoinModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ActionButton from '@/components/buttons/ActionButton.vue'
import NavButton from '@/components/buttons/NavButton.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import NewMatchModal from '@/components/modals/NewMatchModal.vue'
import JoinMatchModal from '@/components/modals/JoinMatchModal.vue'
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon, ArrowRightIcon, TrashIcon, CalendarDaysIcon, VideoCameraSlashIcon } from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/utils'
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue'
import { getLatestMatches } from '@/services/matchService'
import type { Match } from '@/components/LatestMatchesItem.vue'
import TournamentBadge from '@/components/badges/TournamentBadge.vue'
import TournamentListbox from '@/components/listbox/TournamentListbox.vue'

const showRemoveConfirmModal = ref(false)
const confirmRemoveMessage = ref('')
const matchToRemove = ref<Match | null>(null)
const showCreateModal = ref(false)
const showJoinModal = ref(false)
const searchQuery = ref('')
const loading = ref(true)
const matches = ref<Match[]>([])
const selectedTournamentId = ref('')

const getMatchLabel = (match: Match) => {
  return match.name || 
    (match.home_team?.club_name && match.away_team?.club_name 
      ? `${match.home_team.club_name} - ${match.away_team.club_name}` 
      : 'Senza Titolo');
}

const fetchMatches = async () => {
  loading.value = true
  try {
    const res = await getLatestMatches()
    if (res.ok) {
      matches.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching matches:', error)
  } finally {
    loading.value = false
  }
}

const filteredMatches = computed(() => {
  return matches.value.filter(match => {
    // Filtro per Selezione Torneo
    if (selectedTournamentId.value && match.tournament?.id !== selectedTournamentId.value) {
      return false;
    }

    // Filtro per Query di ricerca
    const q = searchQuery.value.toLowerCase().trim()
    if (!q) return true;

    const name = match.name?.toLowerCase() || ''
    const homeTeam = match.home_team?.club_name?.toLowerCase() || ''
    const awayTeam = match.away_team?.club_name?.toLowerCase() || ''
    const tournamentName = match.tournament?.name?.toLowerCase() || ''
    const tournamentCategory = match.tournament?.category?.toLowerCase() || ''

    return name.includes(q) || 
           homeTeam.includes(q) || 
           awayTeam.includes(q) ||
           tournamentName.includes(q) ||
           tournamentCategory.includes(q)
  })
})

const openConfirmDelete = (match: Match) => {
  confirmRemoveMessage.value = `Stai per rimuovere definitivamente la partita "${match.name || (match.home_team?.club_name + ' - ' + match.away_team?.club_name)}". Questa azione è irreversibile.`
  matchToRemove.value = match
  showRemoveConfirmModal.value = true
}

const removeMatch = async () => {
  // Logica di eliminazione match da implementare se necessario
  showRemoveConfirmModal.value = false
}

onMounted(fetchMatches)
</script>
