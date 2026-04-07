<template>

<TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 overflow-y-auto text-blue-950 z-20">
        <div class="flex items-start mt-[35%] justify-center min-h-screen px-4">
            <DialogOverlay class="fixed inset-0 bg-black opacity-40 z-10" />

            <!-- Contenitore della modale -->
            <div class="bg-white p-2 rounded-lg shadow-xl min-w-lg lg:min-w-2/3 transform transition-all z-20">
                <div class="flex items-start">
                    <DialogTitle class="text-lg font-semibold pl-2 text-red-800">{{ player.number + '. ' + player.name }}
                    </DialogTitle>
                </div>
                <div class="px-2 py-2">
                    <PlayerDetail :player="player" :get-exclution="getExclution" :align="'col'" :show-g-k-shots="false" :team="team" :is-modal="true"></PlayerDetail>
                </div>
            </div>
        </div>
    </Dialog>
</TransitionRoot>

</template>
  
<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot } from "@headlessui/vue";
import type { PropType } from "vue";
import type { Player } from "../Interfaces/Player";
import PlayerDetail from "../PlayerDetail.vue";
import type { Team } from "../Interfaces/Team";
import { getExclution } from "@/utils/utils";

const props = defineProps({
    isOpen: Boolean,
    player: {
        type: Object as PropType<Player>,
        required: true,
    },
    team: {
        type: Object as PropType<Team>,
        required: true,
    },
});

const emit = defineEmits(["confirm", "close"]);

const closeModal = () => {
    emit("close");
};

</script>