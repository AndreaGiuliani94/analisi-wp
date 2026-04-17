<template>
  <BaseModal
    :is-open="isOpen"
    @close="closeModal"
    :title="player.number + '. ' + player.name"
    max-width="max-w-xl lg:max-w-3xl"
  >

    <div class="px-2 py-2">
        <PlayerDetail :player="player" :get-exclution="getExclution" :align="'col'" :show-g-k-shots="false" :team="team" :is-modal="true"></PlayerDetail>
    </div>
    
  </BaseModal>
</template>
  
<script setup lang="ts">
import type { PropType } from "vue";
import type { Player } from "../../interfaces/Player";
import PlayerDetail from "../PlayerDetail.vue";
import type { Team } from "../../interfaces/Team";
import { getExclution } from "@/utils/utils";
import BaseModal from "./BaseModal.vue";

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