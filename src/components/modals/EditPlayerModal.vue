<template>
  <BaseModal
    :is-open="isOpen" 
    title="Correggi Anagrafica" 
    @close="closeModal"
  >
    <div >
      <p class="text-sm text-gray-600 mb-4">
        Modificando questo nome, aggiornerai il giocatore in tutto il database.
      </p>

      <BaseInput
        id="edit-player-name"
        v-model="editName"
        label="Nome Giocatore"
        uppercase
        required
        class="w-full"
      />

    </div>
    <template #footer>
        <ActionButton label="Annulla" color="gray" @click="closeModal" />
        <ActionButton label="Salva" color="blue" @click="submitForm" />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseModal from './BaseModal.vue';
import BaseInput from '../inputs/BaseInput.vue';
import ActionButton from '../buttons/ActionButton.vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  initialName: { type: String, default: '' }
});

const emit = defineEmits(['close', 'confirm']);

const editName = ref('');

// Quando la modale si apre, precompilimo l'input con il nome attuale
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    editName.value = props.initialName;
  }
});

const closeModal = () => emit('close');

const submitForm = () => {
  if (editName.value.trim() !== '') {
    emit('confirm', editName.value.trim().toUpperCase());
  }
};
</script>