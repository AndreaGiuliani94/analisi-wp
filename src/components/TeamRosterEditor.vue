<template>
  <div class="px-2.5 py-1.5 border border-gray-300 rounded-md mb-2.5 flex flex-col justify-between w-full">
        <!-- :class="isHome ? '' : 'bg-blue-50'"> -->
    
    <div class="m-2.5 flex items-center justify-between flex-wrap gap-3 align-middle font-medium text-lg">
      
      <div class="flex-1 min-w-40">
          <span v-if="isHome || isLocked || userRole === 'viewer'" :class="colorMap.teamName" class="font-bold">
              {{ team?.name || (isHome ? 'Squadra di Casa' : 'Avversari') }}
          </span>
  
          <BaseCombobox 
            v-else
            v-model="team.name"
            :options="suggestedTeams"
            :selected-id="team.id"
            option-label="club_name" 
            option-value="id"
            option-description="category"
            @select="handleTeamSelect"
            @focusout="emit('fetch-available')"
            uppercase
            placeholder="Nome Avversari..."
            class="w-full max-w-xs"
          />
      </div>
    
      <div class="flex items-center gap-2">
          <BaseListbox
            v-model="team.category"
            @update:model-value="handleCategorySelect"
            :options="categoryListboxOptions"
            option-label="label"
            option-value="category"
            placeholder="Seleziona categoria..."
            size="sm"
            :theme="theme"
            :loading="isLoading"
            :disabled="isLocked || userRole === 'viewer' || team.name === ''"
            @open="emit('fetch-available')"
            class="w-full lg:w-60"
          />

          <ActionButton 
            v-if="userRole !== 'viewer'"
            @click="toggleLock"
            :color="saveButtonColor"
            size="sm"
            :disabled="!team.name || !team.category"
            :title="isLocked ? 'Modifica squadra' : 'Conferma e abilita giocatori'"
            :icon="isLocked ? PencilIcon : CheckIcon"
            icon-size="size-4"
          />

          <ActionButton 
            v-if="isLocked && userRole !== 'viewer'"
            @click="emit('load-last')"
            color="green"
            size="sm"
            title="Ricarica ultima distinta"
            :icon="ArrowPathIcon"
            icon-size="size-4"
          />
          
      </div>
    </div>

    <div v-if="!isLocked && userRole !== 'viewer'" class="mx-3 mt-1 mb-2 text-xs text-gray-500 italic flex items-center gap-1.5">
      <InformationCircleIcon class="size-4" />
      Salva l'intestazione per sbloccare e compilare i giocatori.
    </div>

    <div v-for="player in team?.players" :key="player.number" class="flex justify-start items-center p-1 text-blue-950">
      <div class="w-[1.7em]">
        {{ player.number }}.
      </div>
      
      <div class="w-full">

        <div v-if="userRole !== 'viewer'" class="flex-1 flex items-center gap-1">
          <BaseCombobox
            v-model="player.name"
            :selected-id="player.id"
            :options="getAvailablePlayersForSlot(player)"
            option-label="name"
            option-value="id"
            placeholder="Nome Giocatore..."
            :disabled="!isLocked" 
            class="flex-1"
            @select="(selectedObj) => handlePlayerSelect(player, selectedObj)"
          >
            <template #action>
              <button
                v-if="player.id && isLocked"
                @click.stop="openEditModal(player)"
                class="text-blue-950 hover:text-blue-600 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                title="Correggi anagrafica giocatore"
              >
                <PencilIcon class="size-4" />
              </button>
            </template>
          </BaseCombobox>

        </div>
        <div v-else>
          {{ player.name }}
        </div>

      </div>
      
      <label v-if="player.number === 13 || player.number === 1" class="flex items-center cursor-pointer group ml-1.5">
        <input 
          type="checkbox" 
          v-model="player.isGK" 
          @change="emit('edit-player', {id: player.id, isGK: player.isGK})" 
          :disabled="!isLocked"
          class="sr-only peer">
        <div 
          class="px-2 py-1 text-[10px] font-bold border rounded-full transition-all text-gray-400 border-gray-300
          peer-checked:bg-red-700 peer-checked:text-white peer-checked:border-red-700 group-hover:border-red-700"
        >
          GK
        </div>
      </label>
    </div>
    <EditPlayerModal
      :is-open="isEditModalOpen"
      :initial-name="playerSlotToEdit?.name || ''"
      @close="isEditModalOpen = false"
      @confirm="handleEditConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowPathIcon, CheckIcon, InformationCircleIcon, PencilIcon } from '@heroicons/vue/24/outline';
import BaseListbox from './listbox/BaseListbox.vue';
import ActionButton from './buttons/ActionButton.vue';
import BaseCombobox from './comboboxes/BaseCombobox.vue';
import { categoryEnumOptions } from '@/enum/TeamCategory';
import EditPlayerModal from './modals/EditPlayerModal.vue';


const props = defineProps({
  team: { type: Object, required: true },
  userRole: { type: String, default: 'editor' },
  availableTeams: { type: Array as () => any[], default: () => [] },
  suggestedTeams: { type: Array as () => any[], default: () => [] },
  availablePlayers: { type: Array as () => any[], default: () => [] },
  isLoading: { type: Boolean, default: false },
  isHome: { type: Boolean, default: false },
  theme: { type: String as () => 'red' | 'blue' | 'gray' | 'green', default: 'blue' },
});

const emit = defineEmits([
  'confirm-team', 
  'fetch-available', 
  'load-last',
  'edit-player'
]);

// --------------- COMPUTED && REF ---------------------
// Flag locale per ricordarci se l'utente ha cliccato la "Matita" per forzare la modifica
const isManuallyUnlocked = ref(false);

// Stato della modale
const isEditModalOpen = ref(false);
const playerSlotToEdit = ref<any>(null);

// Computed: l'intestazione è "bloccata" (quindi i giocatori pronti alla selezione)
// se abbiamo già ID e Nome. Se però l'utente preme la matita, lo sblocchiamo.
const isLocked = computed(() => {
  if (isManuallyUnlocked.value) {
    return false; // L'utente ha forzato lo sblocco
  }
  // Altrimenti, si blocca in automatico se i dati sono già valorizzati!
  return !!(props.team?.id && props.team?.name && props.team?.category);
});

// Mappa dei colori dinamica per aggirare il "purging" di Tailwind CSS
const colorMap = computed(() => {
  if (props.theme === 'blue') {
    return {
        teamName: 'text-red-700',
        text: 'text-blue-950',
        hoverText: 'hover:text-blue-600',
        inputFocus: 'focus:border-blue-400 focus:ring-blue-300',
        bgButton: 'bg-blue-600 hover:bg-blue-700'
    };
  }
  return {
    text: 'text-red-700',
    hoverText: 'hover:text-red-600',
    inputFocus: 'focus:border-red-400 focus:ring-red-300',
    bgButton: 'bg-red-600 hover:bg-red-700'
  };
});

const saveButtonColor = computed(() => {
  if (isManuallyUnlocked.value) return 'gray';
  return props.theme as 'red' | 'blue' | 'gray' | 'green';
});

// La Computed che "unisce" l'Enum con i dati del Backend
const categoryListboxOptions = computed(() => {
  return categoryEnumOptions.map(cat => {
    // Verifichiamo se questa categoria è già presente nell'array scaricato dal Backend
    const existingTeam = props.availableTeams.find(t => t.category === cat.id);
    
    if (existingTeam) {
      // Restituiamo L'INTERO OGGETTO del BE, aggiungendo solo la label per la tendina
      return {
        ...existingTeam, 
        label: cat.label 
      };
    }
    
    // Se la categoria non esiste ancora a DB, costruiamo un oggetto "compatibile"
    return {
      id: '', // Vuoto, così la tua funzione sa che è da creare
      club_name: props.team.name, // Mantiene il nome che l'utente ha scritto
      category: cat.id,
      label: `${cat.label} (Nuova)`
    };
  });
});


// --------------- FUNCTION ---------------------

// Funzione chiamata quando si clicca un'opzione dalla Listbox delle categorie
const handleCategorySelect = (selectedCategoryString: string) => {
  // 1. Troviamo l'oggetto "ricco" che abbiamo generato nella computed
  const fullObj = categoryListboxOptions.value.find(c => c.category === selectedCategoryString);
  
  // 2. Lo passiamo in pasto alla tua funzione che aggiornerà ID, Nome e Categoria in un colpo solo!
  handleTeamSelect(fullObj);
};

const handlePlayerSelect = (targetPlayerSlot: any, selectedPlayerObj: any) => {
  if (selectedPlayerObj) {
    // 1. L'utente ha scelto un giocatore esistente dalla tendina
    targetPlayerSlot.id = selectedPlayerObj.id; // Salviamo il VERO ID
    targetPlayerSlot.name = selectedPlayerObj.name;
    
    // Opzionale: se il tuo DB restituisce anche il ruolo, puoi pre-compilare il check del portiere!
    if (selectedPlayerObj.role === 'Portiere') {
        targetPlayerSlot.isGK = true;
    }
  } else {
    // 2. L'utente ha scritto a mano un nome nuovo e ha premuto invio
    targetPlayerSlot.id = ''; // ID vuoto = Il Backend creerà un nuovo record
    // targetPlayerSlot.name si aggiorna da solo grazie al v-model
  }
};

const getAvailablePlayersForSlot = (currentPlayerSlot: any) => {
  // 1. Raccogliamo tutti gli ID già assegnati nella distinta
  const assignedIds = props.team.players
    .map((p: { id: any; }) => p.id) // Prendiamo gli ID
    .filter((id: any) => id && id !== currentPlayerSlot.id); // Escludiamo gli ID vuoti e l'ID del calottino attuale

  // 2. Filtriamo l'array del backend escludendo i giocatori già assegnati altrove
  return props.availablePlayers.filter(player => !assignedIds.includes(player.id));
};

const confirmHeader = () => {
  if(props.isHome && props.team?.id && props.team?.name && props.team?.category) {
    isManuallyUnlocked.value = false;
    emit('confirm-team', props.team);
    return;
  }

  // 1. Cerchiamo se la squadra/categoria selezionata esiste tra quelle proposte dal Backend
  const matchedTeam = props.availableTeams.find(
      t => t.category === props.team.category
  );

  // 2. Modifichiamo direttamente l'ID all'interno dell'oggetto prop (e quindi di riflesso nel Pinia Store)
  if (matchedTeam) {
    props.team.id = matchedTeam.id;
    // (Opzionale) Assicuriamoci che il nome coincida esattamente con quello del DB in caso di differenze di maiuscole/minuscole
    if (!props.isHome) props.team.name = matchedTeam.club_name;
  } else {
  // 3. Se l'utente ha scritto a mano una squadra non presente a DB, resettiamo l'ID
      props.team.id = ''; // o null, a seconda di come lo accetta il tuo backend
  }

  // 4. Blocchiamo la UI
  isManuallyUnlocked.value = false;

  // 5. Avvisiamo la View principale (che deciderà se fare fetch del roster o meno)
  emit('confirm-team', props.team);
};

// Funzione che scatta quando l'utente clicca una squadra dai suggerimenti
const handleTeamSelect = (selectedTeamObj: any) => {
  if (selectedTeamObj) {
    // L'utente ha selezionato una squadra esistente dal BE
    props.team.id = selectedTeamObj.id;
    // Assegnamo il nome 
    props.team.name = selectedTeamObj.club_name;
    // Assegnamo la categoria
    props.team.category = selectedTeamObj.category; 
    
  } else {
    // L'utente ha scritto una squadra nuova a mano e ha premuto invio
    props.team.id = '';
    // La categoria rimarrà quella attuale (o vuota), e potrà sceglierla dalla Listbox
    props.team.category = '';
  }
};

const toggleLock = () => {
  if (isLocked.value) {
    isManuallyUnlocked.value = true; // Torna a modificare l'intestazione
  } else {
    confirmHeader(); // Salva e blocca
  }
};

const openEditModal = (playerSlot: any) => {
  playerSlotToEdit.value = playerSlot;
  isEditModalOpen.value = true;
};

const handleEditConfirm = (newName: string) => {
  if (playerSlotToEdit.value && newName !== playerSlotToEdit.value.name) {
    playerSlotToEdit.value.name = newName;
    
    emit('edit-player', {
      id: playerSlotToEdit.value.id,
      name: newName
    });
  }
  
  // Chiudiamo la modale
  isEditModalOpen.value = false;
};
</script>