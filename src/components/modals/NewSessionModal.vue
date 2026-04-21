<template>
  <BaseModal
    :is-open="isOpen" 
    title="Nuova Partita" 
    @close="closeModal"
  >
    <div >
      <BaseInput
        id="name"
        v-model="title"
        :placeholder="settingsStore.homeTeamName + ' - ...'"
        label="Nome partita"
        required/>

      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">Creazione completata!</div>

    </div>
    <template #footer>
        <ActionButton
          color="green"
          type="submit"
          :label="loading ? 'Creazione...' : 'Crea'"
          :disabled="loading"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { createNewSession } from '@/services/sessionService';
import { useSettingsStore } from '@/stores/settingsStore';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits([ "close" ])
const settingsStore = useSettingsStore()

// Form state
const title = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const register = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {

    const res = await createNewSession(title.value);

    if (!res.ok) {
      const { detail } = await res.json()
      throw new Error(detail || 'Errore nella creazione')
    }

    success.value = true

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
    title.value = '';
    emit("close");
};
</script>
