<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 z-50 overflow-y-auto text-blue-950">
      <div class="flex min-h-screen px-4" :class="position === 'center' ? 'items-center justify-center' : 'items-start justify-center mt-[15vh]'">
        
        <DialogOverlay class="fixed inset-0 bg-black opacity-50 z-10 transition-opacity" />

        <div :class="['bg-white p-6 rounded-lg shadow-xl w-full transform transition-all z-20', maxWidth]">
          
          <slot name="header">
            <DialogTitle v-if="title" class="text-xl font-semibold">
              {{ title }}
            </DialogTitle>
          </slot>

          <slot></slot>

          <div v-if="$slots.footer" class="mt-6 flex justify-end gap-2">
            <slot name="footer"></slot>
          </div>

        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: '' },
  // Permette di variare la larghezza (es. max-w-md, max-w-xl, min-w-lg)
  maxWidth: { type: String, default: 'max-w-md' },
  // Permette di centrare la modale o farla partire dall'alto (utile per quelle molto alte)
  position: { type: String, default: 'center' } 
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};
</script>