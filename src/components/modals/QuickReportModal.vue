<template>

<TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 overflow-y-auto text-blue-950 z-20">
        <div class="flex items-start mt-[35%] justify-center min-h-screen px-4">
            <DialogOverlay class="fixed inset-0 bg-black opacity-40 z-10" />

            <!-- Contenitore della modale -->
            <div class="bg-white p-2 rounded-lg shadow-xl min-w-xl transform transition-all z-20">
                <div class="flex items-start">
                    <DialogTitle class="text-lg font-semibold pl-2 text-red-800">{{ team.name }}
                    </DialogTitle>
                </div>
                <div class="mt-1">
                    <TeamStatistics :team="team" :is-modal="true"/>
                </div>
            </div>
        </div>
    </Dialog>
</TransitionRoot>

</template>
  
<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot, Tab, TabGroup,
  TabList,
  TabPanels,
  TabPanel } from "@headlessui/vue";
import type { Team } from "../../interfaces/Team";
import type { PropType } from "vue";
import MenUpTab from "../tabs/ManUpTab.vue";
import EvenTab from "../tabs/EvenTab.vue";
import ExclutionsTab from "../tabs/ExclutionsTab.vue";
import TeamStatistics from "../TeamStatistics.vue";

const props = defineProps({
isOpen: Boolean,
team: {
    type: Object as PropType<Team>,
    required: true,
}
});

const tabs = ['Superiorità', 'Pari', 'Falli']

const emit = defineEmits(["confirm", "close"]);

const closeModal = () => {
    emit("close");
};

</script>