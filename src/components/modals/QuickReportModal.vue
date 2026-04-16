<template>
  <BaseModal
    :is-open="isOpen" 
    :title="team.name" 
    @close="closeModal"
    max-width="max-w-3xl"
  >
    <div class="mt-1">
        <TeamStatistics :team="team" :is-modal="true"/>
    </div>
  </BaseModal>
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
import BaseModal from "./BaseModal.vue";

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