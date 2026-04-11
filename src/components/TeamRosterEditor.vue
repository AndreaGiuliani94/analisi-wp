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
                :options="availableTeams"
                option-label="category"
                option-value="category"
                placeholder="Seleziona categoria..."
                :theme="theme"
                :loading="isLoading"
                :disabled="isLocked || userRole === 'viewer'"
                @select="handleTeamSelect"
                @open="emit('fetch-available')"
                class="w-full lg:w-60"
            />
            <ActionButton 
                v-if="userRole !== 'viewer'"
                @click="toggleLock"
                :color="saveButtonColor"
                size="sm"
                :title="isLocked ? 'Modifica squadra' : 'Conferma e abilita giocatori'"
                :icon="isLocked ? PencilIcon : CheckIcon"
            />

            <ActionButton 
                v-if="isLocked && userRole !== 'viewer'"
                @click="emit('load-last')"
                color="green"
                size="sm"
                title="Ricarica ultima distinta"
                :icon="ArrowPathIcon"
            />
            
        </div>
    </div>

    <div v-if="!isLocked && userRole !== 'viewer'" class="mx-3 mt-1 mb-2 text-xs text-gray-500 italic flex items-center gap-1.5">
      <InformationCircleIcon class="size-4" />
      Salva l'intestazione per sbloccare e compilare i giocatori.
    </div>

    <div v-for="player in team?.players" :key="player.number" class="flex justify-start items-center p-1">
      <div class="w-[1.7em]">
        {{ player.number }}.
      </div>
      
      <div class="w-full">
        <BaseInput 
            v-if="userRole !== 'viewer'" 
            :id="'player-' + player.number"
            v-model="player.name" 
            @focusout="emit('save-player', player)"
            @keyup.enter="emit('save-player', player)"
            :disabled="!isLocked"
            :placeholder="'Giocatore ' + player.number"
            class="w-full"
        />

        <div v-else>
          {{ player.name }}
        </div>
      </div>
      
      <label v-if="player.number === 13 || player.number === 1" class="flex items-center cursor-pointer group ml-1.5">
        <input 
            type="checkbox" 
            v-model="player.isGK" 
            @change="emit('save-player', player)" 
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowPathIcon, CheckIcon, InformationCircleIcon, PencilIcon } from '@heroicons/vue/24/outline';
import BaseListbox from './listbox/BaseListbox.vue';
import BaseInput from './inputs/BaseInput.vue';
import ActionButton from './buttons/ActionButton.vue';
import BaseCombobox from './comboboxes/BaseCombobox.vue';


const props = defineProps({
  team: { type: Object, required: true },
  userRole: { type: String, default: 'editor' },
  availableTeams: { type: Array as () => any[], default: () => [] },
  suggestedTeams: { type: Array as () => any[], default: () => [] },
  isLoading: { type: Boolean, default: false },
  isHome: { type: Boolean, default: false },
  theme: { type: String as () => 'red' | 'blue' | 'gray' | 'green', default: 'blue' },
});

const emit = defineEmits([
  'confirm-team', 
  'fetch-available', 
  'load-last', 
  'save-player'
]);

// STATO DEL BLOCCO: Di default la maschera parte sbloccata
const isLocked = ref(false);

const confirmHeader = () => {
    // 1. Cerchiamo se la squadra/categoria selezionata esiste tra quelle proposte dal Backend
    const matchedTeam = props.availableTeams.find(
        t => t.category === props.team.category
    );

    // 2. Modifichiamo direttamente l'ID all'interno dell'oggetto prop (e quindi di riflesso nel Pinia Store)
    if (matchedTeam) {
    props.team.id = matchedTeam.id;
    // (Opzionale) Assicuriamoci che il nome coincida esattamente con quello del DB in caso di differenze di maiuscole/minuscole
    if (!props.isHome) props.team.name = matchedTeam.name;
    } else {
    // 3. Se l'utente ha scritto a mano una squadra non presente a DB, resettiamo l'ID
        props.team.id = ''; // o null, a seconda di come lo accetta il tuo backend
    }

    // 4. Blocchiamo la UI
    isLocked.value = true;

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
  }
};

const toggleLock = () => {
  if (isLocked.value) {
    isLocked.value = false; // Torna a modificare l'intestazione
  } else {
    confirmHeader(); // Salva e blocca
  }
};

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
  if (isLocked.value) return 'gray';
  return props.theme as 'red' | 'blue' | 'gray' | 'green';
});
</script>