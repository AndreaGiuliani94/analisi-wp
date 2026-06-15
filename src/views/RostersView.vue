<template>
  <div class="">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-3xl font-black text-blue-950 tracking-tight">Rosters</h1>
        <p class="text-gray-500 text-sm mt-1">Gestisci le tue squadre e i componenti dei roster.</p>
      </div>
      
      <div class="flex items-center gap-3">
        <ActionButton 
          label="Nuova Squadra" 
          color="blue"
          :size="'md'"
          :icon="PlusIcon"
          @click="showCreateTeamModal = true"
        />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar: Elenco Squadre -->
      <div class="lg:col-span-1 space-y-4">
        <div class="relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Cerca squadra..." 
            class="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-4 border-b border-gray-100 font-bold text-blue-950 text-sm uppercase tracking-wider">Le mie Squadre</div>
          <div class="divide-y divide-gray-100 max-h-150 overflow-y-auto custom-scrollbar">
            <div 
              v-for="team in filteredTeams" 
              :key="team.id"
              @click="selectTeam(team)"
              class="p-4 hover:bg-blue-50 cursor-pointer transition-colors group flex items-center justify-between"
              :class="{ 'bg-blue-50 border-r-4 border-b-0 border-blue-600': selectedTeam?.id === team.id }"
            >
              <span class="font-semibold text-sm text-blue-950 truncate">{{ team.name }} ({{ team.category }})</span>
              <ChevronRightIcon class="size-4 text-gray-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content: Elenco Giocatori -->
      <div class="lg:col-span-3">
        <div v-if="selectedTeam" class="space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-700 font-black border border-blue-100 text-xl shadow-inner shrink-0">
                {{ selectedTeam.name.substring(0,2).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <h2 class="text-2xl font-bold text-blue-950 truncate">{{ selectedTeam.name }}</h2>
                <p class="text-sm text-gray-500">{{ selectedTeam.category }}</p>
              </div>
            </div>
            <div class="flex gap-4">
                <ActionButton 
                  color="blue"
                  :solid="false"
                  :icon="PencilIcon"
                  @click="openSavePlayerModal(null)"
                />
                <ActionButton 
                  color="red" 
                  :solid="false"
                  :icon="TrashIcon"
                  @click="openDeleteTeamModal"
                />
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 border-b border-gray-100">
                  <tr>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Giocatore</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Ruolo</th>
                    <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Data di nascita</th>
                    <th class="px-6 py-4">
                        <ActionButton 
                            color="green"
                            @click="showAddPlayerModal = true"
                            :solid="false"
                            :icon="UserPlusIcon"
                            position="right"
                            />
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="player in players" :key="player.id" class="hover:bg-slate-50 transition-colors group">
                    <td class="px-6 py-2 font-bold text-blue-950">{{ player.name }}</td>
                    <td class="px-6 py-2">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest"
                            :class="player.isGK ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'">
                            {{ player.isGK ? 'Portiere' : 'Giocatore' }}
                        </span>
                    </td>
                    <td class="px-6 py-2 text-sm font-semibold">
                        {{ player.dateOfBirth }}
                    </td>
                    <td class="px-6 py-2 text-right">
                        <button 
                          @click="openSavePlayerModal(player)"
                          class="p-2 text-gray-300 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon class="size-5" />
                        </button>
                        <button 
                            @click="showRemovePlayerModal = true; selectedPlayer = player" 
                            class="p-2 text-gray-300 hover:text-red-600 transition-colors">
                            <TrashIcon class="size-5" />
                        </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="players.length === 0" class="p-16 text-center">
              <div class="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon class="size-6" />
              </div>
              <p class="text-gray-400">Nessun giocatore registrato per questa squadra.</p>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="h-full min-h-100 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div class="w-20 h-20 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-6">
            <UserGroupIcon class="size-10" />
          </div>
          <h3 class="text-xl font-bold text-blue-950 mb-2">Seleziona una squadra</h3>
          <p class="text-gray-500 max-w-xs mx-auto leading-relaxed">Scegli una squadra dalla lista a sinistra per visualizzare e gestire i componenti del roster.</p>
        </div>
      </div>
    </div>
  </div>

  <ConfirmModal 
    :isOpen="showRemovePlayerModal" 
    title="Rimuovi giocatore"
    message="Vuoi davvero rimuovere il giocatore da questo roster?"
    @close="showRemovePlayerModal = false" 
    @confirm="removePlayer"
  />
  <NewTeamModal :isOpen="showCreateTeamModal" @close="showCreateTeamModal = false" @created="refreshTeams" />
  <SavePlayerModal :is-open="showAddPlayerModal" 
    :team-id="selectedTeam?.id" 
    :player="selectedPlayer"
    @close="closePlayerModal" 
    @created="refreshPlayers(selectedTeam)" 
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  PlusIcon, 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  ChevronRightIcon, 
  UserPlusIcon,
  TrashIcon, 
  PencilIcon,
  PencilSquareIcon
} from '@heroicons/vue/24/outline';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { getAllTeams, getTeamRoster, removePlayerfromRoster } from '@/services/matchService';
import NewTeamModal from '@/components/modals/NewTeamModal.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import SavePlayerModal from '@/components/modals/SavePlayerModal.vue';

// Mock data per le squadre
const teams = ref<any[]>([]);
const showCreateTeamModal = ref(false);
const showAddPlayerModal = ref(false);
const showRemovePlayerModal = ref(false);


// Stato
const searchQuery = ref('');
const selectedTeam = ref<any>(null);
const selectedPlayer = ref<any>(null);

const players = ref<any[]>([]);

const filteredTeams = computed(() => {
  if (!searchQuery.value) return teams.value;
  return teams.value.filter((team: any) => 
    team.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    team.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectTeam = async (team: any) => {
    selectedTeam.value = team;
    await refreshPlayers(team);
};

const refreshPlayers = async (team: any) => {
    players.value = [];
    const data = await getTeamRoster(team.id);
    data.json().then(res => res.players.forEach( (el: any) => {
        players.value.push({
            id: el.id,
            name: el.name,
            isGK: el.is_gk,
            dateOfBirth: el.birth_date
        })
    }));
};

const openDeleteTeamModal = () => {
  console.log('Apertura modale creazione squadra');
};

const refreshTeams = async () => {
    teams.value = [];
    const data = await (await getAllTeams()).json();
    data.forEach((element: any) => { 
        teams.value.push({ 
            name: element.club_name, 
            id: element.id,
            category: element.category,
        })
    });
};

const openSavePlayerModal = (player: any) => {
    selectedPlayer.value = player;
    showAddPlayerModal.value = true;
};

const closePlayerModal = () => {
    showAddPlayerModal.value = false;
    selectedPlayer.value = null;
};

const removePlayer = async () => {
    await removePlayerfromRoster(selectedTeam.value.id, selectedPlayer.value.id);
    showRemovePlayerModal.value = false;
    await refreshPlayers(selectedTeam.value)
}

onMounted (async () => {
    await refreshTeams();
})
</script>
