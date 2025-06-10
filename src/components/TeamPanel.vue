<template>
    <div class="mt-2">
        <TeamStatistics :team="team"></TeamStatistics>
        <TeamTable :team="team" :getAllShoots="getAllShoots"></TeamTable>
    </div>
</template>

<script setup lang="ts">
import type { Player } from './Interfaces/Player';
import type { Team } from './Interfaces/Team';
import TeamTable from '@/components/TeamTable.vue';
import TeamStatistics from '@/components/TeamStatistics.vue';

const props = defineProps<{
  team: Team;
  getAllShoots: (player: Player) => string;
}>();

</script>