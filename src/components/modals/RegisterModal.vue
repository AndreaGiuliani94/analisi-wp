<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 overflow-y-auto text-blue-950">
        <div class="flex items-center justify-center min-h-screen px-4">
            <DialogOverlay class="fixed inset-0 bg-black opacity-50 z-10" />

            <!-- Contenitore della modale -->
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all z-20">
                <DialogTitle class="text-xl font-semibold mb-4">Registrati</DialogTitle>

                <form @submit.prevent="register" class="space-y-2">
                    <BaseInput
                        id="name"
                        label="Nome"
                        label-position="left"
                        v-model="name"
                        required/>
                    
                    <BaseInput
                        id="surname"
                        label="Cognome"
                        label-position="left"
                        v-model="surname"
                        required/>

                    <BaseInput
                        id="email"
                        type="email"
                        label="Email"
                        label-position="left"
                        v-model="email"
                        required/>

                    <BaseInput
                        id="password"
                        type="password"
                        label="Password"
                        label-position="left"
                        v-model="password"
                        required/>

                    <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
                    <div v-if="success" class="text-green-600 text-sm">Registrazione completata!</div>

                    <div class="mt-4">
                        <ActionButton
                            color="green"
                            type="submit"
                            :label="loading ? 'Registrazione...' : 'Registrati'"
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
import { registerWithCredentials } from '@/services/authService';
import type { Credentials } from '../Interfaces/Credentials';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits([ "close" ])

// Form state
const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const register = async () => {
  error.value = ''
  success.value = false
  loading.value = true

  try {
    const credentials: Credentials = {
      email: email.value,
      password: password.value,
      name: name.value + ' ' + surname.value
    }

    const res = await registerWithCredentials(credentials)

    if (!res.ok) {
      const { detail } = await res.json()
      throw new Error(detail || 'Errore nella registrazione')
    }

    success.value = true
    setTimeout(() => {
      closeModal();
    }, 1000)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
    emit("close");
};
</script>
