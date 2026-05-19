<template>
  <BaseModal
    :is-open="isOpen" 
    title="Modifica Torneo" 
    @close="closeModal"
  >
    <div class="flex flex-col gap-4 items-start justify-between">
      <BaseInput
        class="w-full"
        id="name"
        v-model="editedName"
        label="Nome competizione"
        required/>
      
      <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseInput
          id="season"
          v-model="editedSeason"
          label="Stagione"
          required/>

        <BaseSelect
          v-model="editedCategory"
          label="Categoria"
          :options="categoryOptions"
        />

        <BaseSelect
          v-model="editedGender"
          label="Genere"
          :options="genderOptions"
        />
      </div>
      
      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm font-medium">Torneo aggiornato con successo!</div>

    </div>
    <template #footer>
        <ActionButton
          size="lg"
          color="green"
          type="submit"
          :label="loading ? 'Aggiornamento...' : 'Salva Modifiche'"
          @click="updateTournament"
          :disabled="loading"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import BaseSelect from '../selects/BaseSelect.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { useTournamentStore } from '@/stores/tournamentStore';
import BaseModal from './BaseModal.vue';
import { useToast } from 'vue-toastification';
import type { Tournament } from '@/interfaces/Tournament';

const props = defineProps<{
  isOpen: boolean;
  tournament: Tournament | null;
}>();

const emit = defineEmits([ "close", "updated" ])
const tournamentStore = useTournamentStore()
const toast = useToast();

// Form state
const editedName = ref('')
const editedSeason = ref('')
const editedCategory = ref('')
const editedGender = ref('M')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const categoryOptions = [
  { label: 'Scegli...', value: '' },
  ...['U12', 'U14', 'U16', 'U18', 'Senior'].map(cat => ({ label: cat, value: cat }))
]

const genderOptions = [
  { label: 'Maschile (M)', value: 'M' },
  { label: 'Femminile (F)', value: 'F' },
  { label: 'Misto (MIXED)', value: 'MIXED' }
]

// Watch per popolare i campi quando la modale si apre o il torneo cambia
watch(() => props.tournament, (newTournament) => {
  if (newTournament) {
    editedName.value = newTournament.name;
    editedSeason.value = newTournament.season;
    editedCategory.value = newTournament.category;
    editedGender.value = newTournament.gender;
    error.value = '';
    success.value = false;
  }
}, { immediate: true });

const updateTournament = async () => {
  if (!props.tournament?.id) {
    error.value = 'ID Torneo non disponibile per l\'aggiornamento.';
    return;
  }

  if (!editedName.value || !editedSeason.value || !editedCategory.value) {
    error.value = 'Compila tutti i campi obbligatori';
    return;
  }

  error.value = ''
  success.value = false
  loading.value = true

  try {
    const payload = {
      name: editedName.value,
      season: editedSeason.value,
      category: editedCategory.value,
      gender: editedGender.value
      // Non includiamo le impostazioni di gioco qui, solo i dati principali
    }
    
    // Assumendo che esista un'azione `updateTournament` nello store
    await tournamentStore.updateTournament(props.tournament.id, payload);

    success.value = true
    toast.success('Torneo aggiornato con successo!');
    emit("updated"); // Emetti evento per notificare la pagina padre di aggiornare i dati
  } catch (e: any) {
    error.value = e.message || 'Errore durante l\'aggiornamento del torneo';
    toast.error(error.value);
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
    loading.value = false
    success.value = false
    error.value = '';
    emit("close");
};
</script>
