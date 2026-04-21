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

import type { Team } from "../../interfaces/Team";
import type { PropType } from "vue";
import TeamStatistics from "../TeamStatistics.vue";
import BaseModal from "./BaseModal.vue";

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

</script>