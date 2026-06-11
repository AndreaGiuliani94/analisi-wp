<template>
  <BaseModal
    :is-open="isOpen"
    :title="isEdit ? 'Modifica Giocatore' : 'Aggiungi Giocatore'"
    @close="$emit('close')"
  >
    <!-- Switcher Sezioni (solo in creazione) -->
    <div v-if="!isEdit" class="flex p-1 bg-slate-100 rounded-xl mb-6 mt-4">
      <button 
        @click="activeTab = 'new'"
        :class="[
          'flex-1 py-2 text-sm font-bold rounded-lg transition-all',
          activeTab === 'new' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        Crea Nuovo
      </button>
      <button 
        @click="activeTab = 'existing'"
        :class="[
          'flex-1 py-2 text-sm font-bold rounded-lg transition-all',
          activeTab === 'existing' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'
        ]"
      >
        Da Anagrafica
      </button>
    </div>

    <!-- SEZIONE 1: CREAZIONE NUOVO / EDIT -->
    <div v-if="activeTab === 'new' || isEdit" class="flex flex-col gap-4" :class="{'mt-4': isEdit}">
      <BaseInput
        id="playerName"
        v-model="formData.name"
        label="Nome"
        placeholder="es. Mario Rossi"
        required
      />
      <BaseInput
        id="playerBirthDate"
        v-model="formData.dateOfBirth"
        label="Data di nascita"
        type="date"
      />
      <div class="flex items-center gap-2">
        <input
          type="checkbox"
          id="isGK"
          v-model="formData.isGK"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label for="isGK" class="text-sm font-medium text-gray-800">È Portiere?</label>
      </div>
    </div>

    <!-- SEZIONE 2: SELEZIONE DA ANAGRAFICA -->
    <div v-else class="flex flex-col gap-4">
      <BaseInput
        id="clubSearch"
        v-model="clubSearchQuery"
        label="Cerca Società/Club"
        placeholder="es. Pro Recco"
      />

      <!-- Risultati Società -->
      <div v-if="foundClubs.length > 0 && !selectedClub" class="max-h-40 overflow-y-auto border border-slate-200 rounded-lg divide-y bg-white">
        <div 
          v-for="club in foundClubs" 
          :key="club.id"
          class="p-3 hover:bg-slate-50 cursor-pointer text-sm flex justify-between items-center"
          @click="handleSelectClub(club)"
        >
          <span class="font-medium text-slate-700">{{ club.name }}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{{ club.category }}</span>
        </div>
      </div>

      <!-- Selezione Giocatore -->
      <div v-if="selectedClub" class="flex flex-col gap-3">
        <div class="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Società Selezionata</span>
            <span class="text-sm font-bold text-blue-900">{{ selectedClub.name }}</span>
          </div>
          <button @click="selectedClub = null" class="text-xs font-bold text-blue-600 hover:text-blue-800">Cambia</button>
        </div>

        <div v-if="clubPlayers.length > 0" class="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y bg-white">
          <div 
            v-for="p in clubPlayers" 
            :key="p.id"
            :class="[
              'p-3 cursor-pointer text-sm flex justify-between items-center transition-colors',
              selectedPlayerId === p.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-50 text-slate-700'
            ]"
            @click="selectedPlayerId = p.id"
          >
            <span class="font-medium">{{ p.name }}</span>
            <span v-if="p.isGK" :class="['text-[10px] font-bold px-1.5 py-0.5 rounded uppercase', selectedPlayerId === p.id ? 'bg-blue-500' : 'bg-slate-100 text-slate-500']">GK</span>
          </div>
        </div>
        <div v-else class="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-dashed text-sm">
          Nessun giocatore in questo club
        </div>
      </div>
    </div>

    <template #footer>
      <ActionButton
        :label="isEdit ? 'Salva Modifiche' : (activeTab === 'new' ? 'Aggiungi Giocatore' : 'Associa Giocatore')"
        color="blue"
        :loading="isLoading"
        @click="handleSavePlayer"
        :disabled="isSaveDisabled"
      />
      <ActionButton
        label="Annulla"
        color="gray"
        :solid="false"
        @click="$emit('close')"
      />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { useToast } from 'vue-toastification';
import { addPlayerToTeamRoster, updatePlayer } from '@/services/matchService';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps<{
  isOpen: boolean;
  teamId: string;
  player?: any; // Passato solo in fase di edit
}>();

const emit = defineEmits(['close', 'created']);
const toast = useToast();
const isLoading = ref(false);
const gameStore = useGameStore();

const isEdit = computed(() => !!props.player);

const activeTab = ref<'new' | 'existing'>('new');
const clubSearchQuery = ref('');
const foundClubs = ref<any[]>([]);
const selectedClub = ref<any>(null);
const clubPlayers = ref<any[]>([]);
const selectedPlayerId = ref<string | null>(null);

const isSaveDisabled = computed(() => {
  if (isLoading.value) return true;
  if (isEdit.value || activeTab.value === 'new') return !formData.name;
  return !selectedPlayerId.value;
});

const formData = reactive({
  name: '',
  isGK: false,
  dateOfBirth: '',
});

const handleSavePlayer = async () => {
  if (activeTab.value === 'new' || isEdit.value) {
    if (!props.teamId || !formData.name) {
      toast.error('Assicurati di aver inserito il nome del giocatore.');
      return;
    }
  } else {
    if (!selectedPlayerId.value) {
      toast.error('Seleziona un giocatore dalla lista.');
      return;
    }
  }

  isLoading.value = true;
  try {
    if (isEdit.value) {
      // Chiamata PATCH per l'edit
      await updatePlayer(props.player.id, formData);
      toast.success('Anagrafica aggiornata con successo!');
    } else if (activeTab.value === 'new') {
      // Chiamata POST per la creazione
      await addPlayerToTeamRoster(props.teamId, {
        name: formData.name,
        isGK: formData.isGK,
        dateOfBirth: formData.dateOfBirth,
      });
      toast.success('Giocatore aggiunto con successo!');
    } else {
      // Caso 'existing': associa il giocatore tramite ID
      const p = clubPlayers.value.find(pl => pl.id === selectedPlayerId.value);
      await addPlayerToTeamRoster(props.teamId, {
        playerId: p.id,
        name: p.name,
        isGK: p.isGK,
        dateOfBirth: p.dateOfBirth,
      });
      toast.success('Giocatore associato con successo!');
    }

    emit('created');
    emit('close');
  } catch (error: any) {
    toast.error(error.message || 'Errore durante il salvataggio.');
  } finally {
    isLoading.value = false;
  }
};

watch(clubSearchQuery, async (newVal) => {
  if (newVal && newVal.length > 2) {
    try {
      foundClubs.value = await gameStore.getTeamsByName(newVal);
    } catch (e) {
      console.error(e);
    }
  } else {
    foundClubs.value = [];
  }
});

const handleSelectClub = async (club: any) => {
  selectedClub.value = club;
  selectedPlayerId.value = null;
  try {
    const res = await gameStore.getTeamRoster(club.id);
    clubPlayers.value = res.players.map((item: any) => ({
      id: item.id,
      name: item.name,
      isGK: item.is_gk,
      dateOfBirth: item.birth_date
    }));
  } catch (e) {
    toast.error("Errore nel recupero della rosa");
  }
};

// Sincronizza i dati del form quando la modale si apre o cambia il giocatore
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    activeTab.value = 'new';
    selectedClub.value = null;
    clubSearchQuery.value = '';
    selectedPlayerId.value = null;
    foundClubs.value = [];
    if (props.player) {
      formData.name = props.player.name;
      formData.isGK = props.player.isGK;
      formData.dateOfBirth = props.player.dateOfBirth;
    } else {
      formData.name = '';
      formData.isGK = false;
      formData.dateOfBirth = '';
    }
  }
});
</script>
