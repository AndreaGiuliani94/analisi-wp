<template>

<TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 overflow-y-auto text-blue-950">
    <div class="flex items-center justify-center min-h-screen px-4">
        <DialogOverlay class="fixed inset-0 bg-black opacity-40 z-10" />

        <!-- Contenitore della modale -->
        <div class="bg-white p-2 rounded-lg shadow-xl max-w-md w-full transform transition-all z-20">
            <div class="flex items-start">
                <DialogTitle class="text-lg font-bold pl-2">{{ team.name }}
                </DialogTitle>
                <button  class="ml-auto bg-gray-300 p-0.5 min-w-4 min-h-4 rounded text-sm border-1 hover:bg-gray-400 active:bg-gray-500">
                <XMarkIcon class="size-4"
                 @click="closeModal"></XMarkIcon> <!-- da vedere se lasciare il bottone per la chiususra... -->
                </button>
            </div>
            <DialogDescription class="mt-2 ">
                <!-- Mettere statistiche di squadra, vedere se con grid o tabella o altro... -->
            </DialogDescription>

            <!-- Bottoni azione non servono -->
            <!-- <div class="mt-4 flex justify-end">
                <button @click="closeModal" class="mr-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 active:bg-gray-500">
                Annulla
                </button>
                <button @click="confirmAction"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 active:bg-red-700">
                Conferma
                </button>
            </div> -->
        </div>
    </div>
    </Dialog>
</TransitionRoot>

</template>
  
<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, DialogDescription, TransitionRoot } from "@headlessui/vue";
import type { Team } from "../Interfaces/Team";
import type { PropType } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
isOpen: Boolean,
team: {
    type: Object as PropType<Team>,
    required: true,
}
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