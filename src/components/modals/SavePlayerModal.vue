<template>
  <BaseModal
    :is-open="isOpen"
    :title="isEdit ? 'Modifica Giocatore' : 'Aggiungi Nuovo Giocatore'"
    @close="$emit('close')"
  >
    <div class="flex flex-col gap-4 mt-4">
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
    <template #footer>
      <ActionButton
        :label="isEdit ? 'Salva Modifiche' : 'Aggiungi Giocatore'"
        color="blue"
        :loading="isLoading"
        @click="handleSavePlayer"
        :disabled="!formData.name || isLoading"
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

const props = defineProps<{
  isOpen: boolean;
  teamId: string;
  player?: any; // Passato solo in fase di edit
}>();

const emit = defineEmits(['close', 'created']);
const toast = useToast();
const isLoading = ref(false);

const isEdit = computed(() => !!props.player);

const formData = reactive({
  name: '',
  isGK: false,
  dateOfBirth: '',
});

const handleSavePlayer = async () => {
  if (!props.teamId || !formData.name ) {
    toast.error('Assicurati di aver selezionato una squadra e inserito nome e numero del giocatore.');
    return;
  }

  isLoading.value = true;
  try {
    if (isEdit.value) {
      // Chiamata PATCH per l'edit
      await updatePlayer(props.player.id, formData);
      toast.success('Anagrafica aggiornata con successo!');
    } else {
      // Chiamata POST per la creazione
      await addPlayerToTeamRoster(props.teamId, {
        name: formData.name,
        isGK: formData.isGK,
        dateOfBirth: formData.dateOfBirth,
      });
      toast.success('Giocatore aggiunto con successo!');
    }

    emit('created');
    emit('close');
  } catch (error: any) {
    toast.error(error.message || 'Errore durante il salvataggio.');
  } finally {
    isLoading.value = false;
  }
};

// Sincronizza i dati del form quando la modale si apre o cambia il giocatore
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
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
