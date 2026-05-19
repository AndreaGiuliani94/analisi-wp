<template>
  <BaseModal
    :is-open="isOpen" 
    title="Modifica Dettagli Partita" 
    @close="closeModal"
  >
    <div class="flex flex-col gap-4 items-start justify-between">
      <BaseInput
        class="w-full"
        id="matchName"
        v-model="editedMatchName"
        label="Nome Partita"
        required/>
      
      <BaseInput
        class="w-full"
        id="scheduledAt"
        type="datetime-local"
        v-model="editedScheduledAt"
        label="Data e Ora Programmate"
        required/>
      
      <div v-if="error" class="text-red-500 text-sm font-medium">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm font-medium">Dettagli aggiornati con successo!</div>

    </div>
    <template #footer>
        <ActionButton
          size="lg"
          color="green"
          type="submit"
          :label="loading ? 'Aggiornamento...' : 'Salva Modifiche'"
          @click="updateDetails"
          :disabled="loading"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import BaseModal from './BaseModal.vue';
import { useToast } from 'vue-toastification';
import { updateMatchDetails } from '@/services/matchService';

const props = defineProps<{
  isOpen: boolean;
  matchId: string;
  currentMatchName: string;
  currentScheduledAt: string;
}>();

const emit = defineEmits([ "close", "updated" ])
const toast = useToast();

// Form state
const editedMatchName = ref('')
const editedScheduledAt = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

// Watch per popolare i campi quando la modale si apre o i dati cambiano
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    editedMatchName.value = props.currentMatchName;
    editedScheduledAt.value = props.currentScheduledAt;
    error.value = '';
    success.value = false;
  }
});

const updateDetails = async () => {
  if (!props.matchId) {
    error.value = 'ID Partita non disponibile per l\'aggiornamento.';
    return;
  }

  if (!editedMatchName.value || !editedScheduledAt.value) {
    error.value = 'Compila tutti i campi obbligatori';
    return;
  }

  error.value = ''
  success.value = false
  loading.value = true

  try {
    const payload = {
      title: editedMatchName.value,
      scheduled_at: editedScheduledAt.value
    }
    
    const res = await updateMatchDetails(props.matchId, payload);
    if (!res.ok) throw new Error('Errore durante l\'aggiornamento dei dettagli');

    success.value = true
    toast.success('Dettagli partita aggiornati con successo!');
    emit("updated"); // Emetti evento per notificare la pagina padre di aggiornare i dati
  } catch (e: any) {
    error.value = e.message || 'Errore durante l\'aggiornamento dei dettagli della partita';
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
