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
            :available-players="homeTeamRoster"
            :isLoading="isLoadingHomeRosters"
            @edit-player="handleUpdatePlayerName($event)"
            @fetch-available="fetchAvailableTeams(store.match.homeTeam.name, true)"
            @load-last="loadLastRoster(true)"
            @confirm-team="handleTeamConfirm(true)"
        />

        <TeamRosterEditor
            :team="store.match.awayTeam"
            :isHome="false" 
            :userRole="userRole"
            theme="blue"
            :availableTeams="availableAwayTeams"
            :available-players="awayTeamRoster"
            :suggestedTeams="suggestedTeams"
            :isLoading="isLoadingAwayRosters"
            @edit-player="handleUpdatePlayerName($event)"
            @fetch-available="fetchAvailableTeams(store.match.awayTeam.name, false)"
            @load-last="loadLastRoster(false)"
            @confirm-team="handleTeamConfirm(false)"
        />
    </div>

    <ActionButton 
        :icon="PlayIcon" 
        label="Live!" 
        @click="startLiveMatch"
        :disabled="store.actualPlayers?.length < 7 || store.actualOpponents?.length < 7 || store.match.awayTeam?.name == ''" 
        color="green"
        :loading="isStarting"
    />
  
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
import { useRouter } from 'vue-router';
import { useSessionStateStore } from '@/stores/sessionStateStore';
import type { Team } from '@/interfaces/Team';
import { useToast } from 'vue-toastification';
import type { Player } from '@/interfaces/Player';

const store = useGameStore();
const sessionStore = useSessionStore();
const { role: userRole } = useUserRole(sessionStore.currentSession.participants);

const router = useRouter();
const toast = useToast();
const isStarting = ref(false);

const availableHomeTeams = ref<TeamInfo[]>([]);
const availableAwayTeams = ref<TeamInfo[]>([]);
const suggestedTeams = ref<TeamInfo[]>([]);

const isLoadingHomeRosters = ref(false);
const isLoadingAwayRosters = ref(false);

const lastLoadedHomeTeam = ref("");
const lastLoadedAwayTeam = ref("");

const homeTeamRoster = ref([]);
const awayTeamRoster = ref([]);

// Teniamo traccia dell'ultimo ID confermato per capire se è cambiata una squadra
const lastConfirmedHomeId = ref(store.match.homeTeam.id);
const lastConfirmedAwayId = ref(store.match.awayTeam.id);

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
        console.error(`Errore nel caricamento delle categorie per ${teamName}:`, error);
        toast.error(`Errore nel caricamento delle categorie per ${teamName}`);
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
                localPlayer.id = bePlayer.player_id; 
                localPlayer.name = bePlayer.name;
                localPlayer.isGK = bePlayer.is_gk;
            }
        });

        console.log(`Distinta ${team.name} caricata con successo!`);

    } catch (error) {
        console.error("Errore durante il recupero dell'ultima distinta:", error);
        toast.error("Errore durante il recupero dell'ultima distinta");
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
        console.error("Errore nel caricamento delle squadre", error);
        toast.error("Errore nel caricamento delle squadre");
    }
};

const handleTeamConfirm = async (isHome: boolean) => {
    const team = isHome ? store.match.homeTeam : store.match.awayTeam;
    const previousId = isHome ? lastConfirmedHomeId.value : lastConfirmedAwayId.value;

    // 1. CONTROLLO CAMBIO SQUADRA
    if (team.id !== previousId) {
        console.log(`Cambio squadra rilevato (da ${previousId || 'Nuova'} a ${team.id || 'Nuova'}). Svuoto la distinta...`);
        
        // Svuotiamo i giocatori 
        team.players.forEach((p: any) => {
            p.id = '';
            p.name = '';
            p.isGK = (p.number === 1 || p.number === 13);
        });

        // Aggiorniamo la nostra memoria con il nuovo ID temporaneo
        if (isHome) lastConfirmedHomeId.value = team.id;
        else lastConfirmedAwayId.value = team.id;
    }
    try {
        // 2. CREAZIONE NUOVA SQUADRA (Se ID vuoto)
        if(team.id === '') {
            console.log("Crea nuova squadra: name: " + team.name + ", category: " + team.category )

            const response = await store.createNewTeam(team);
            team.id = response.id;

            if (isHome) lastConfirmedHomeId.value = team.id;
            else lastConfirmedAwayId.value = team.id;
        }
        console.log("Team confermato")
        
        // 3. CARICAMENTO ROSTER
        await loadTeamRoaster(team, isHome);
    } catch (error) {
        console.error("Errore nel caricamento del roster", error);
        toast.error("Errore nel caricamento del roster");
    }
};

const loadTeamRoaster = async (team: Team, isHome: boolean) => {
    const response = await store.getTeamRoster(team.id);
    if(isHome) homeTeamRoster.value = response.players
    else awayTeamRoster.value = response.players
}

const startLiveMatch = async () => {
    // 1. Attiviamo lo spinner sul bottone "Live!"
    isStarting.value = true;

    try {
        // 2. CHIAMATE AL BACKEND (Bulk Save)
        await store.savePregameData();

        // Opzionale: un piccolo feedback se il salvataggio è molto veloce
        console.log("Distinte salvate con successo! Andiamo in Live...");

        // 3. NAVIGAZIONE ALLA PARTITA
        // Solo se le chiamate API non vanno in errore (nessun throw/catch), si cambia pagina
        router.push('/game/live');

    } catch (error) {
        console.error("Errore fatale durante il salvataggio pre-partita:", error);
        toast.error("Errore fatale durante il salvataggio pre-partita");
    } finally {
        // 4. Spegniamo lo spinner (anche se in caso di successo l'utente ha già cambiato pagina)
        isStarting.value = false;
    }
};

const handleUpdatePlayerName = async (payload: any) => {
    try {
        console.log(`Modifica globale richiesta per il giocatore ${payload.id}`);
        
        // 1. Chiamata al Backend
        await store.updatePlayer(payload);
        
        if(payload.name) {
            // 2. Aggiorniamo la "rosa" (availablePlayers)        
            const updateRosterList = (roster: any[]) => {
                const playerInList = roster.find(p => p.id === payload.id);
                if (playerInList) {
                    playerInList.name = payload.name;
                }
            };
            if (homeTeamRoster.value) updateRosterList(homeTeamRoster.value);
            if (awayTeamRoster.value) updateRosterList(awayTeamRoster.value);
        }

    } catch (error) {
        console.error("Errore critico durante l'aggiornamento dell'anagrafica:", error);
        toast.error("Impossibile aggiornare l'anagrafica");
    }
};

onMounted(async () => {
  store.loadStore();
  await loadSuggestedTeams();
  await fetchAvailableTeams(store.match.homeTeam.name, true);
  await fetchAvailableTeams(store.match.awayTeam.name, false);
  if(store.match.homeTeam.id) {
    loadTeamRoaster(store.match.homeTeam, true)
  }
  if(store.match.awayTeam.id) {
    loadTeamRoaster(store.match.awayTeam, false)
  }
});
</script>
