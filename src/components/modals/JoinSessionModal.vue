<template>
  <BaseModal
    :is-open="isOpen" 
    title="Unisciti alla Partita" 
    @close="closeModal"
  >
    <div >
      <BaseInput
        id="code"
        v-model="code"
        placeholder="602086fa-4c2.."
        label="Codice"
        required/>

      <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
      <div v-if="success" class="text-green-600 text-sm">Ti sei unito!</div>

    </div>
    <template #footer>
        <ActionButton
          color="blue"
          type="submit"
          :label="loading ? 'Unione...' : 'Unisciti'"
          :disabled="loading"
          @click="join"
          />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { joinSession } from '@/services/sessionService';
import BaseModal from './BaseModal.vue';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits([ "close" ])

// Form state
const code = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const join = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {

    const res = await joinSession(code.value);

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
    code.value = '';
    emit("close");
};
</script>
