<template>
  <div class="w-full">
    <div v-if="userRole !== 'viewer'" class="flex justify-between items-center">
      <NavButton
        :label="'Pulisci'"
        :icon="TrashIcon"
        :onClick="store.clearDistinta">
      </NavButton>
      <NavButton
        :label="'Reset'"
        :icon="ArrowPathIcon"
        :onClick="store.resetAll">
      </NavButton>
    </div>
  </div>
  
  <h1 class="text-3xl text-center font-bold mb-4 text-blue-950">Distinta</h1>

  <div class="mb-2.5 flex flex-col md:flex-row justify-between gap-3">

    <TeamRosterEditor
      :team="store.match.homeTeam"
      :isHome="true"
      :userRole="userRole"
      theme="blue"
      :availableTeams="availableHomeTeams"
      :isLoading="isLoadingHomeRosters"
      @fetch-available="fetchAvailableTeams(store.match.homeTeam.name, true)"
      @load-last="loadLastRoster(true)"
      @save-player="store.saveOrUpdatePlayer($event, true)"
      @confirm-team="handleTeamConfirm(true)"
    />

    <TeamRosterEditor
      :team="store.match.awayTeam"
      :isHome="false" 
      :userRole="userRole"
      theme="blue"
      :availableTeams="availableAwayTeams"
      :suggestedTeams="suggestedTeams"
      :isLoading="isLoadingAwayRosters"
      @fetch-available="fetchAvailableTeams(store.match.awayTeam.name, false)"
      @load-last="loadLastRoster(false)"
      @save-player="store.saveOrUpdatePlayer($event, false)"
      @confirm-team="handleTeamConfirm(false)"
    />
  </div>
  <ActionButton :icon="PlayIcon" label="Live!" to="/game/live" :disabled="store.actualPlayers?.length < 7 || store.actualOpponents?.length < 7 || store.match.awayTeam?.name == ''" color="green"/>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGameStore } from '../stores/gameStore';
import { ArrowPathIcon, PlayIcon, TrashIcon } from '@heroicons/vue/20/solid';
import NavButton from '@/components/buttons/NavButton.vue';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { useUserRole } from '@/composables/useUserRole';
import { useSessionStore } from '@/stores/sessionStore';
import type { TeamInfo } from '@/interfaces/TeamInfo';
import TeamRosterEditor from '@/components/TeamRosterEditor.vue';

const store = useGameStore();
const sessionStore = useSessionStore();
const { role: userRole } = useUserRole(sessionStore.currentSession.participants);

const availableHomeTeams = ref<TeamInfo[]>([]);
const availableAwayTeams = ref<TeamInfo[]>([]);
const suggestedTeams = ref<TeamInfo[]>([]);

const isLoadingHomeRosters = ref(false);
const isLoadingAwayRosters = ref(false);

const lastLoadedHomeTeam = ref("");
const lastLoadedAwayTeam = ref("");

const fetchAvailableTeams = async (teamName: string, isHome: boolean) => {
    // 1. Evitiamo chiamate a vuoto se il nome non è ancora stato inserito
    if (!teamName || teamName.trim() === '') return;

    // 2. Puntiamo dinamicamente alle Ref corrette in base a isHome
    const targetLoading = isHome ? isLoadingHomeRosters : isLoadingAwayRosters;
    const targetLastLoaded = isHome ? lastLoadedHomeTeam : lastLoadedAwayTeam;
    const targetList = isHome ? availableHomeTeams : availableAwayTeams;

    // 3. Controllo cache: se abbiamo GIÀ caricato le distinte per QUESTO SPECIFICO nome, ci fermiamo
    if (targetLastLoaded.value === teamName) return;

    // 4. Esecuzione
    targetLoading.value = true;
    try {
        const response = await store.getTeamsByName(teamName);
        targetList.value = response;
        
        // Salviamo il nome appena cercato per la cache
        targetLastLoaded.value = teamName; 
    } catch (error) {
        console.error(`Errore nel caricamento delle distinte per ${teamName}:`, error);
        // In caso di errore svuotiamo la lista
        targetList.value = [];
    } finally {
        targetLoading.value = false;
    }
};

const loadLastRoster = async (isHome: boolean) => {
  const team = isHome ? store.match.homeTeam : store.match.awayTeam;

    if (!team.id) {
        console.warn("Attenzione: Seleziona e conferma prima l'intestazione della squadra!");
        // Mostra un toast di avviso
        return;
    }

    try {
        // Chiamata al BE
        const response = store.getLastTeamRoster(team.id);
        const lastRosterData = await response;

        if (!lastRosterData || lastRosterData.length === 0) {
            console.log("Nessuna distinta precedente trovata per questa squadra.");
            return;
        }

        // 1. Pulizia preventiva: Svuotiamo la distinta attuale in memoria
        // Questo serve se l'utente aveva già scritto nomi a mano e poi decide di premere "Ricarica"
        team.players.forEach(p => {
            p.id = ''; // Resettiamo l'ID
            p.name = '';
            p.isGK = (p.number === 1 || p.number === 13);
        });

        // 2. Idratazione corretta con l'ID globale
        lastRosterData.roster.forEach((bePlayer: any) => {
            const localPlayer = team.players.find(p => p.number === bePlayer.cap_number);
            
            if (localPlayer) {
                // ✅ ORA MANTENIAMO L'ID REALE DEL GIOCATORE
                localPlayer.id = bePlayer.player_id; 
                localPlayer.name = bePlayer.name;
                localPlayer.isGK = bePlayer.is_gk;
            }
        });

        console.log(`Distinta ${team.name} caricata con successo!`);

    } catch (error) {
        console.error("Errore durante il recupero dell'ultima distinta:", error);
    }

};

const loadSuggestedTeams = async () => {
    try {
        console.log("Chiamata BE per tutti i team...");
        const response = await store.getAllTeams();
        suggestedTeams.value = response;
        console.log(suggestedTeams.value);
        // Qui andrà la logica per ricaricare l'ultima distinta
    } catch (error) {
        console.error("Errore nel caricamento dell'ultima distinta", error);
    }
};

const handleTeamConfirm = async (isHome: boolean) => {
  const teamId = isHome ? store.match.homeTeam.id : store.match.awayTeam.id;
  try {
        // console.log("Chiamata BE per l'ultima distinta...");
        const response = await store.getTeamRoster(teamId);
        console.log("Team confermato")
        // Qui andrà la logica per ricaricare l'ultima distinta
    } catch (error) {
        console.error("Errore nel caricamento dell'ultima distinta", error);
    }
};

onMounted(async () => {
  store.loadStore();
  await loadSuggestedTeams();
});
</script>
