<template>
  <div class="p-2">
    <div>
        Goal: {{ getAllMenUps().goals + '/' + getAllMenUps().shoots }}
    </div>
    <div>
        Parati: {{ getParati() + '/' + getAllMenUps().shoots }}
    </div>
    <div>
        Fuori: {{ getFuori() + '/' + getAllMenUps().shoots }}
    </div>
    <div>
        Stoppati: {{ getStoppati() + '/' + getAllMenUps().shoots }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { Team } from '../Interfaces/Team';
import type { Shot } from '../Interfaces/Shot';

const props = defineProps({
    team: {
        type: Object as PropType<Team>,
        required: true,
    }
});

const getAllMenUps = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsSup));
    var totalGoals = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'GOAL' );
    return {
        goals: totalGoals.length,
        shoots: totalShoots.length
      }
}

const getParati = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsSup));
    var totalParati = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'PARATO' );
    return totalParati.length;
}

const getFuori = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsSup));
    var totalFuori = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'FUORI' );
    return totalFuori.length;
}

const getStoppati = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsSup));
    var totalStoppati = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'STOPPATO' );
    return totalStoppati.length;
}

</script>