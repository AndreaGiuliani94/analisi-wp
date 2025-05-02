<template>

  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <DialogOverlay class="fixed inset-0 bg-black opacity-50" />

        <!-- Contenitore della modale -->
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full transform transition-all">
          <DialogTitle class="text-lg font-bold">{{ title }}</DialogTitle>
          <DialogDescription class="mt-2 text-gray-600">
            {{ message }}
          </DialogDescription>

          <!-- Bottoni azione -->
          <div class="mt-4 flex justify-end">
            <button @click="closeModal" class="mr-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 active:bg-gray-500">
              Annulla
            </button>
            <button @click="confirmAction"
              class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 active:bg-red-700">
              Conferma
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, DialogDescription, TransitionRoot } from "@headlessui/vue";

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