

<template>
    <div class=" rounded-b-xl p-2 pt-4 w-full">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            <div 
                v-for="(card, index) in foulStats" 
                :key="index"
                class="bg-white rounded-lg p-2 border border-slate-200 shadow-sm"
            >
                <div class="flex justify-between items-center border-b pb-2 mb-2" :class="card.theme.border">
                    <span class="font-bold uppercase tracking-wider text-xs" :class="card.theme.title">
                        {{ card.title }}
                    </span>
                    <span class="text-xs font-black px-2 py-1 rounded-full font-mono" :class="card.theme.badge">
                        {{ card.total }}
                    </span>
                </div>

                <div v-for="(zone, zIndex) in card.zones" :key="zIndex" class="mb-3 last:mb-0">
                    
                    <div class="flex justify-between items-center text-xs font-bold mb-1"
                         :class="zone.total === 0 ? 'text-slate-300' : 'text-blue-950'">
                        <span>{{ zone.label }}</span>
                        <span class="font-mono">{{ zone.total }}</span>
                    </div>

                    <div class="pl-2 ml-1 border-l-2 text-[11px] flex flex-col gap-1 mt-0.5" :class="card.theme.treeLine">
                        <div class="flex justify-between items-center"
                            :class="zone.withBall === 0 ? 'text-slate-300' : 'font-semibold text-blue-900'">
                            <span class="flex items-center gap-1">
                                <ArrowTurnDownRightIcon class="w-3 h-3" :class="zone.withBall === 0 ? 'text-slate-200' : 'text-slate-400'" />
                                Con palla
                            </span>
                            <span class="font-mono">{{ zone.withBall }}</span>
                        </div>
                        <div class="flex justify-between items-center"
                            :class="zone.withoutBall === 0 ? 'text-slate-300' : 'font-semibold text-blue-900'">
                            <span class="flex items-center gap-1">
                                <ArrowTurnDownRightIcon class="w-3 h-3" :class="zone.withoutBall === 0 ? 'text-slate-200' : 'text-slate-400'" />
                                Senza palla
                            </span>
                            <span class="font-mono">{{ zone.withoutBall }}</span>
                        </div>
                    </div>
                    
                </div>
            </div>
            
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Team } from '../../interfaces/Team';
import type { Exclution } from '../../interfaces/Exclution';
import { computed, type PropType } from 'vue';
import { ArrowTurnDownRightIcon } from '@heroicons/vue/24/outline';
import { FoulPosition, FoulType } from '@/enum/ExclutionDescription';

const props = defineProps({
    team: {
        type: Object as PropType<Team>,
        required: true,
    }
});

const foulStats = computed(() => {
  // Definiamo le zone per ciclare facilmente i calcoli
  const zones = [
    { id: FoulPosition.EXT, label: 'Esterne' },
    { id: FoulPosition.CF, label: 'Ripartenze' },
    { id: FoulPosition.CB, label: 'Centroboa' },
    { id: FoulPosition.OTHER, label: 'Altro' }
  ];

  // 1. ESPULSIONI
  const exclutionsCard = {
    title: 'Espulsioni',
    total: getExclutions().exclutions.length,
    theme: {
      border: 'border-red-100',
      title: 'text-red-800',
      badge: 'bg-red-100 text-red-900',
      treeLine: 'border-slate-100'
    },
    zones: zones.map(z => ({
      label: z.label,
      total: getFouls(FoulType.EXCL, z.id),
      withBall: getFoulsWith(FoulType.EXCL, z.id),
      withoutBall: getFoulsWithout(FoulType.EXCL, z.id)
    }))
  };

  // 2. RIGORI
  const penaltiesCard = {
    title: 'Rigori',
    total: getExclutions().penalties.length,
    theme: {
      border: 'border-red-100',
      title: 'text-red-800',
      badge: 'bg-red-100 text-red-900',
      treeLine: 'border-slate-100'
    },
    zones: zones.map(z => ({
      label: z.label,
      total: getFouls(FoulType.PEN, z.id),
      withBall: getFoulsWith(FoulType.PEN, z.id),
      withoutBall: getFoulsWithout(FoulType.PEN, z.id)
    }))
  };

  // 3. TOTALI
  const totalsCard = {
    title: 'Falli Totali',
    total: exclutionsCard.total + penaltiesCard.total,
    theme: {
      border: 'border-blue-100',
      title: 'text-blue-950',
      badge: 'bg-blue-950 text-white',
      treeLine: 'border-blue-100'
    },
    zones: zones.map(z => ({
      label: z.label,
      total: getFouls(FoulType.EXCL, z.id) + getFouls(FoulType.PEN, z.id),
      withBall: getFoulsWith(FoulType.EXCL, z.id) + getFoulsWith(FoulType.PEN, z.id),
      withoutBall: getFoulsWithout(FoulType.EXCL, z.id) + getFoulsWithout(FoulType.PEN, z.id)
    }))
  };

  return [totalsCard, exclutionsCard, penaltiesCard];
});

const getAllFouls = () => {
    var allFouls: Exclution[] = [];
    props.team.players.forEach(pl => allFouls.push(...pl.exclutions));
    return allFouls;
}

const getExclutions = () => {
    return {
        exclutions: getAllFouls().filter(excl => excl.type.toUpperCase() === FoulType.EXCL ),
        penalties: getAllFouls().filter(excl => excl.type.toUpperCase() === FoulType.PEN )
      }
}

const getFouls = (type: string, position: string) => {
    return getAllFouls().filter(excl => excl.type.toUpperCase() === type.toUpperCase() && excl.position?.toUpperCase() === position.toUpperCase() ).length
}

const getFoulsWith = (type: string, position: string) => {
    switch(type.toUpperCase()) {
        case FoulType.EXCL:
            return getExclutions().exclutions.filter(excl => excl.position?.toUpperCase() === position.toUpperCase() && excl.ball ).length;
        case FoulType.PEN:
            return getExclutions().penalties.filter(excl => excl.position?.toUpperCase() === position.toUpperCase() && excl.ball ).length;
        default:
            return getAllFouls().filter(excl => excl.type.toUpperCase() !== 'EDCS' && excl.ball ).length
    }
}

const getFoulsWithout = (type: string, position: string) => {
    switch(type.toUpperCase()) {
        case FoulType.EXCL:
            return getExclutions().exclutions.filter(excl => excl.position?.toUpperCase() === position.toUpperCase() && !excl.ball ).length;
        case FoulType.PEN:
            return getExclutions().penalties.filter(excl => excl.position?.toUpperCase() === position.toUpperCase() && !excl.ball ).length;
        default:
            return getAllFouls().filter(excl => excl.type.toUpperCase() !== 'EDCS' && !excl.ball ).length
    }
}

</script>