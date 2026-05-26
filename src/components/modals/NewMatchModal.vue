<template>
  <BaseModal
    :is-open="isOpen" 
    title="Nuova Partita" 
    @close="closeModal"
  >
    <div class="flex flex-col gap-4 items-start justify-between ">
      <BaseInput
        class="w-full"
        id="name"
        v-model="name"
        :placeholder="useAuthStore().user?.organization?.name + ' - ...'"
        label="Nome partita"
        required/>

      <TournamentListbox
        v-if="!tournamentId"
        class="w-full"
        v-model="selectedTournamentId"
        label="Associa a un torneo (opzionale)"
        placeholder="Nessun torneo"
      />

      <div class=" w-full grid grid-cols-2 gap-4 ">
        <BaseInput
          id="scheduledDate"
          type="date"
          v-model="date"
          label="Data partita"
          required/>
        <BaseInput
          id="scheduledTime"
          type="time"
          v-model="time"
          placeholder="Orario partita"
          label="Orario partita"
          required/>
      </div>
      
      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">Creazione completata!</div>

    </div>
    <template #footer>
        <ActionButton
          size="lg"
          color="green"
          type="submit"
          :label="loading ? 'Creazione...' : 'Crea'"
          @click="register"
          :disabled="loading"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { createNewMatch } from '@/services/matchService';
import { useSettingsStore } from '@/stores/settingsStore';
import BaseModal from './BaseModal.vue';
import TournamentListbox from '../listbox/TournamentListbox.vue';
import { useAuthStore } from '@/stores/authStore.ts';

const props = defineProps({
  isOpen: Boolean,
  tournamentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits([ "close", "created" ])
const settingsStore = useSettingsStore()

// Form state
const name = ref('')
const date = ref('')
const time = ref('')
const selectedTournamentId = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const register = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const payload = {
      name: name.value,
      date: date.value,
      time: time.value,
      tournament_id: props.tournamentId || selectedTournamentId.value || null
    }
    const res = await createNewMatch(payload);

    if (!res.ok) {
      const { detail } = await res.json()
      throw new Error(detail || 'Errore nella creazione')
    }

    success.value = true

    emit('created')

    setTimeout(() => {
      closeModal();
    }, 1000);
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
    selectedTournamentId.value = '';
    emit("close");
};
</script>
