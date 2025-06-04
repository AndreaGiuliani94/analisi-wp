<template>

<TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 overflow-y-auto text-blue-950">
        <div class="flex items-start mt-[35%] justify-center min-h-screen px-4">
            <DialogOverlay class="fixed inset-0 bg-black opacity-40 z-10" />

            <!-- Contenitore della modale -->
            <div class="bg-white p-2 rounded-lg shadow-xl min-w-xl transform transition-all z-20">
                <div class="flex items-start">
                    <DialogTitle class="text-lg font-bold pl-2 text-red-800">{{ team.name }}
                    </DialogTitle>
                </div>
                <div class="mt-1">
                    <TabGroup>
                        <TabList class="flex space-x-2 rounded-xl bg-gray-200 p-1">
                            <Tab
                                v-for="tab in tabs"
                                v-slot="{ selected }"
                                :key="tab"
                                class="w-full text-sm font-medium text-blue-950 rounded-lg focus:outline-none"
                            >
                                <div 
                                class="rounded-lg leading-3 py-2.5"
                                :class="{ 'bg-blue-950 text-white': selected, 'bg-white': !selected }">
                                    {{ tab }}
                                </div>
                            </Tab>
                        </TabList>

                        <TabPanels class="">
                        <TabPanel>
                            <MenUpTab :team="team"></MenUpTab>
                        </TabPanel>
                        <TabPanel>
                            <EvenTab :team="team"></EvenTab>
                        </TabPanel>
                        <TabPanel>
                            <ExclutionsTab :team="team"></ExclutionsTab>
                        </TabPanel>
                        </TabPanels>
                    </TabGroup>
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
import type { Team } from "../Interfaces/Team";
import type { PropType } from "vue";
import MenUpTab from "../tabs/MenUpTab.vue";
import EvenTab from "../tabs/EvenTab.vue";
import ExclutionsTab from "../tabs/ExclutionsTab.vue";

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