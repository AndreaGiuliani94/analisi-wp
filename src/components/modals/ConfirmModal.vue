<template>
  <BaseModal :is-open="isOpen" :title="title" @close="closeModal">
    
    <p class="mt-2 text-gray-600">{{ message }}</p>

    <template #footer>
      <ActionButton label="Annulla" color="gray" @click="closeModal" />
      <ActionButton label="Conferma" :color="props.buttonColor" @click="confirmAction" />
    </template>
    
  </BaseModal>
</template>

<script setup lang="ts">
import type { PropType } from "vue";
import ActionButton from "../buttons/ActionButton.vue";
import BaseModal from "./BaseModal.vue";

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: "Sei sicuro?",
  },
  message: {
    type: String,
    default: "Vuoi davvero procedere con questa azione?",
  },
  buttonColor: {
    type: String as PropType<"red" | "green" | "blue" | "gray" | undefined>,
    default: "red",
  },
});

const emit = defineEmits(["confirm", "close"]);

const closeModal = () => {
  emit("close");
};

const confirmAction = () => {
  emit("confirm");
  closeModal();
};
</script>