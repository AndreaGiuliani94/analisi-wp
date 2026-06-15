<template>
  <div class="bg-slate-50">
    <!-- Header Sezione -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-6">
    <div>
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">I Miei Tornei</h1>
        <p class="text-slate-500 font-medium mt-1">Gestione dei tornei e delle partite</p>
    </div>
    <div class="flex gap-3">
        <ActionButton 
        label="Nuovo Torneo" 
        :icon="PlusIcon" 
        color="green" 
        @click="showCreateModal = true"
        />
        <ActionButton 
        label="Unisciti al Torneo" 
        :icon="UserGroupIcon" 
        color="blue" 
        @click="showJoinModal = true"
        />
    </div>
    </div>

    <!-- Barra di Ricerca -->
    <div v-if="tournamentStore.tournaments?.length > 0" class="mb-6">
      <div class="relative max-w-md group">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="size-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cerca per nome torneo o squadra..." 
          class="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>
    </div>

    <!-- Grid Card -->
    <div v-if="tournamentStore.tournaments?.length > 0">
      <div v-if="filteredTournaments.length > 0" class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TournamentCard 
          v-for="tournament in filteredTournaments" 
          :key="tournament.tournament_id" 
          :tournament="tournament"
          @delete="openConfirmDeleteTournament"
        />
      </div>

      <!-- Nessun Risultato Ricerca -->
      <div v-else class="bg-white rounded-4xl border border-slate-200 p-16 text-center shadow-sm">
        <div class="size-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <MagnifyingGlassIcon class="size-8 text-slate-300" />
        </div>
        <h3 class="text-lg font-bold text-blue-950">Nessun risultato</h3>
        <p class="text-slate-500 mt-1">Non abbiamo trovato tornei che corrispondono a "{{ searchQuery }}".</p>
        <button @click="searchQuery = ''" class="mt-4 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">Resetta filtri</button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-4xl border-2 border-dashed border-slate-200 p-20 text-center">
        <div class="size-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarDaysIcon class="size-12 text-slate-200" />
        </div>
        <h2 class="text-2xl font-black text-blue-950 uppercase tracking-tight">Nessun Torneo</h2>
        <p class="text-slate-500 mt-2 max-w-sm mx-auto font-medium">Non hai ancora partecipato a nessun torneo. Crea il tuo primo torneo per iniziare!</p>
    </div>

    <!-- Modals -->
    <ConfirmModal 
      :isOpen="showRemoveConfirmModal" 
      title="Conferma Rimozione Torneo"
      :message="confirmRemoveMessage"
      @confirm="removeTournament" 
      @close="showRemoveConfirmModal = false" 
    />
    <NewTournamentModal :isOpen="showCreateModal" @close="showCreateModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTournamentStore } from '@/stores/tournamentStore' // Assuming a new tournament store
import ActionButton from '@/components/buttons/ActionButton.vue'
import NavButton from '@/components/buttons/NavButton.vue'
import RoleBadge from '@/components/badges/RoleBadge.vue'
import TournamentCard from '@/components/cards/TournamentCard.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'
import NewTournamentModal from '@/components/modals/NewTournamentModal.vue' // Assuming a new modal
import { PlusIcon, UserGroupIcon, MagnifyingGlassIcon, ArrowRightIcon, TrashIcon, CalendarDaysIcon, VideoCameraSlashIcon } from '@heroicons/vue/24/outline'
import { formatDateTime } from '@/utils/utils'
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue' // Reusing for now, could be TournamentStatusBadge

const tournamentStore = useTournamentStore()
const showRemoveConfirmModal = ref(false)
const confirmRemoveMessage = ref('')
const tournamentToRemove = ref<any | null>(null)
const showCreateModal = ref(false)
const showJoinModal = ref(false)
const searchQuery = ref('')

const filteredTournaments = computed(() => {
  if (!tournamentStore.tournaments) return []
  
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return tournamentStore.tournaments

  return tournamentStore.tournaments.filter(tournament => {
    const name = tournament.name?.toLowerCase() || ''
    const category = tournament.category?.toLowerCase() || ''
    const gender = tournament.gender?.toLowerCase() || ''
    const season = tournament.season?.toLowerCase() || ''
    // Extend search to include team names from matches within the tournament if needed
    const teamNames = tournament.matches?.map((match: any) => 
      `${match?.home_team?.club_name || ''} ${match?.away_team?.club_name || ''}`.toLowerCase()
    ).join(' ') || ''
    
    return name.includes(q) || teamNames.includes(q) || category.includes(q) || gender.includes(q) || season.includes(q)
  })
})

const openConfirmDeleteTournament = (tournament: any) => {
  confirmRemoveMessage.value = `Stai per rimuovere definitivamente il torneo "${tournament.title}". Questa azione è irreversibile.`
  tournamentToRemove.value = tournament
  showRemoveConfirmModal.value = true
}

const removeTournament = async () => {
  if (tournamentToRemove.value) {
    await tournamentStore.deleteTournament(tournamentToRemove.value.tournament_id)
    await tournamentStore.getAllTournaments()
  }
  showRemoveConfirmModal.value = false
}

onMounted(() => {
  tournamentStore.getAllTournaments()
})
</script>