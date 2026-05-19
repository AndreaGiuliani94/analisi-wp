<template>
  <BaseModal
    :is-open="isOpen" 
    title="Nuovo Torneo" 
    @close="closeModal"
  >
    <div class="flex flex-col gap-4 items-start justify-between">
      <BaseInput
        class="w-full"
        id="name"
        v-model="name"
        placeholder="es. Campionato Regionale 2025"
        label="Nome competizione"
        required/>
      
      <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <BaseInput
          id="season"
          v-model="season"
          placeholder="2024/25"
          label="Stagione"
          required/>

        <BaseSelect
          v-model="category"
          label="Categoria"
          :options="categoryOptions"
        />

        <BaseSelect
          v-model="gender"
          label="Genere"
          :options="genderOptions"
        />
      </div>
      
      <!-- Sezione Impostazioni -->
      <div class="w-full border-t border-slate-100 pt-4 mt-2">
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Impostazioni Partita</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <BaseInput
            id="periodDuration"
            v-model="periodDuration"
            placeholder="08:00"
            label="Durata periodo (mm:ss)"
            required/>

          <BaseInput
            id="periodCount"
            type="number"
            v-model="periodCount"
            label="Numero periodi"
            required/>
        </div>

        <div class="flex items-center gap-2 mt-4 ml-1">
          <input 
            id="enablePenalties" 
            type="checkbox" 
            v-model="enablePenalties"
            class="size-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all cursor-pointer"
          />
          <label for="enablePenalties" class="text-sm font-semibold text-slate-700 cursor-pointer select-none">
            Abilita rigori in caso di pareggio
          </label>
        </div>
      </div>
      
      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm font-medium">Torneo creato con successo!</div>

    </div>
    <template #footer>
        <ActionButton
          size="lg"
          color="green"
          type="submit"
          :label="loading ? 'Creazione...' : 'Crea Torneo'"
          @click="register"
          :disabled="loading"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import BaseSelect from '../selects/BaseSelect.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { useTournamentStore } from '@/stores/tournamentStore';
import BaseModal from './BaseModal.vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits([ "close" ])
const tournamentStore = useTournamentStore()

// Form state
const name = ref('')
const season = ref('')
const category = ref('')
const gender = ref('M')
const periodDuration = ref('08:00')
const periodCount = ref('4')
const enablePenalties = ref(false)
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

const register = async () => {
  if (!name.value || !season.value || !category.value) {
    error.value = 'Compila tutti i campi obbligatori'
    return
  }

  error.value = ''
  success.value = false
  loading.value = true

  try {
    const payload = {
      name: name.value,
      season: season.value,
      category: category.value,
      gender: gender.value,
      default_period_length: periodDuration.value,
      default_periods_count: parseInt(periodCount.value),
      allow_ties: enablePenalties.value
    }
    
    await tournamentStore.createNewTournament(payload);

    success.value = true

    useToast().success('Torneo creato con successo!');
    closeModal();
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
    loading.value = false
    success.value = false
    name.value = '';
    season.value = '';
    category.value = '';
    gender.value = 'M';
    periodDuration.value = '08:00';
    periodCount.value = '4';
    enablePenalties.value = false;
    emit("close");
};
</script>
