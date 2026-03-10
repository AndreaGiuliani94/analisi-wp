<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 overflow-y-auto text-blue-950">
        <div class="flex items-center justify-center min-h-screen px-4">
            <DialogOverlay class="fixed inset-0 bg-black opacity-50 z-10" />

            <!-- Contenitore della modale -->
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all z-20">
                <DialogTitle class="text-xl font-semibold mb-4">Unisciti alla Partita</DialogTitle>

                <form @submit.prevent="join" class="space-y-2">
                    <BaseInput
                        id="code"
                        v-model="code"
                        required/>

                    <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
                    <div v-if="success" class="text-green-600 text-sm">Ti sei unito!</div>

                    <div class="mt-4">
                        <ActionButton
                            color="blue"
                            type="submit"
                            :label="loading ? 'Unione...' : 'Unisciti'"
                            :disabled="loading"
                            />
                    </div>
                    
                </form>
            </div>
        </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot } from '@headlessui/vue'
import { ref } from 'vue'
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';
import { joinSession } from '@/services/sessionService';

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
