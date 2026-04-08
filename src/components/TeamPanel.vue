<template>
    <div class="mt-2 ">
        <TeamStatistics :team="team" :isModal="false"></TeamStatistics>
        <TeamTable :team="team" :getAllShoots="getAllShoots"></TeamTable>
    </div>
</template>

<script setup lang="ts">
import type { Player } from '../interfaces/Player';
import type { Team } from '../interfaces/Team';
import TeamTable from '@/components/TeamTable.vue';
import TeamStatistics from '@/components/TeamStatistics.vue';

const props = defineProps<{
  team: Team;
  getAllShoots: (player: Player) => string;
}>();

</script>