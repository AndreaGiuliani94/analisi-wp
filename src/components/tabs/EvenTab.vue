<template>
  <div class="p-2">
    <div>
        Goal: {{ getAllEvens().goals + '/' + getAllEvens().shoots }}
    </div>
    <div>
        Parati: {{ getParati() + '/' + getAllEvens().shoots }}
    </div>
    <div>
        Fuori: {{ getFuori() + '/' + getAllEvens().shoots }}
    </div>
    <div>
        Stoppati: {{ getStoppati() + '/' + getAllEvens().shoots }}
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

const getAllEvens = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsEven));
    var totalGoals = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'GOAL' );
    return {
        goals: totalGoals.length,
        shoots: totalShoots.length
      }
}

const getParati = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsEven));
    var totalParati = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'PARATO' );
    return totalParati.length;
}

const getFuori = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsEven));
    var totalFuori = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'FUORI' );
    return totalFuori.length;
}

const getStoppati = () => {
    var totalShoots: Shot[] = [];
    props.team.players.forEach(pl => totalShoots.push(...pl.shotsEven));
    var totalStoppati = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'STOPPATO' );
    return totalStoppati.length;
}

</script>