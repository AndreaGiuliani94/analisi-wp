<template>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 text-blue-950">
        <DialogOverlay class="fixed inset-0 bg-black opacity-50 z-10" />

        <!-- Contenitore della modale -->
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all z-20">
          <DialogTitle class="text-lg font-bold">{{ title }}</DialogTitle>
          <DialogDescription class="mt-2">
            {{ message }}
          </DialogDescription>

          <!-- Bottoni azione -->
          <div class="mt-4 flex justify-end gap-2">
            <ActionButton label="Annulla" color="gray" @click="closeModal" />
            <ActionButton label="Conferma" color="red" @click="confirmAction" />
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, DialogDescription, TransitionRoot } from "@headlessui/vue";
import ActionButton from "../buttons/ActionButton.vue";

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