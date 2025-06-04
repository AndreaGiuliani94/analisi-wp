<template>
    <div class="px-2 pt-2 font-bold">
        Totali: {{ getAllMenUps().goals.length + '/' + getAllMenUps().shoots.length }}
    </div>
    <div class="px-2 grid grid-cols-4">
        <div class="">
            <div class="font-semibold">
                Goal: {{ getAllMenUps().goals.length }}
            </div>
            <div>
                Dx: {{ getGoals(['1', '2']) }}
            </div>
            <div>
                Sx: {{ getGoals(['3', '4']) }}
            </div>
            <div>
                Pali: {{ getGoals(['P5', 'P6']) }}
            </div>
            <div>
                Ripartenze: {{ getGoals(['Ripartenza']) }}
            </div>
        </div>
        <div>
            <div class="font-semibold">
                Parati: {{ getAllMenUps().parati.length }}
            </div>
            <div>
                Dx: {{ getParati(['1', '2']) }}
            </div>
            <div>
                Sx: {{ getParati(['3', '4']) }}
            </div>
            <div>
                Pali: {{ getParati(['P5', 'P6']) }}
            </div>
            <div>
                Ripartenze: {{ getParati(['Ripartenza']) }}
            </div>
        </div>
        <div>
            <div class="font-semibold">
                Fuori: {{ getAllMenUps().fuori.length }}
            </div>
            <div>
                Dx: {{ getFuori(['1', '2']) }}
            </div>
            <div>
                Sx: {{ getFuori(['3', '4']) }}
            </div>
            <div>
                Pali: {{ getFuori(['P5', 'P6']) }}
            </div>
            <div>
                Ripartenze: {{ getFuori(['Ripartenza']) }}
            </div>
        </div>
        <div>
            <div class="font-semibold">
                Stoppati: {{ getAllMenUps().stoppati.length }}
            </div>
            <div>
                Dx: {{ getStoppati(['1', '2']) }}
            </div>
            <div>
                Sx: {{ getStoppati(['3', '4']) }}
            </div>
            <div>
                Pali: {{ getStoppati(['P5', 'P6']) }}
            </div>
            <div>
                Ripartenze: {{ getStoppati(['Ripartenza']) }}
            </div>
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
    var totalParati = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'PARATO' );
    var totalFuori = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'FUORI' );
    var totalStoppati = totalShoots.filter(shoot => shoot.outcome.toUpperCase() === 'STOPPATO' );
    return {
        goals: totalGoals,
        shoots: totalShoots,
        parati: totalParati,
        fuori: totalFuori,
        stoppati: totalStoppati
      }
}

const getGoals = (positions: string[]) => {
    return getAllMenUps().goals.filter(shoot => positions.includes(shoot.position)).length;
}

const getParati = (positions: string[]) => {
    return getAllMenUps().parati.filter(shoot => positions.includes(shoot.position)).length;
}

const getFuori = (positions: string[]) => {
    return getAllMenUps().fuori.filter(shoot => positions.includes(shoot.position)).length;
}

const getStoppati = (positions: string[]) => {
    return getAllMenUps().stoppati.filter(shoot => positions.includes(shoot.position)).length;
}

</script>