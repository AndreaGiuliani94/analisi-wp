<template>
  <div :class="[
    player.active ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-400',
  ]"
    class="p-2 w-1/5 transition-colors flex justify-start items-center border border-gray-300 rounded-lg font-medium"
    @click="handleClick(team.name == 'SC QUINTO' ? 0 : 1)" 
    @mousedown="startHold" 
    @mouseup="stopHold" 
    @mouseleave="stopHold">
    <template v-if="isEditing">
      <input v-model="editableName" class="bg-transparent border-none outline-none w-full"
        @blur="saveEdit(team.name == 'SC QUINTO' ? 0 : 1)" 
        @keyup.enter="saveEdit(team.name == 'SC QUINTO' ? 0 : 1)"
        ref="inputField" />
    </template>
    <template v-else>
      <span class="truncate">
        {{ player.number }}. {{ player.name }}
      </span>
    </template>
    <ExclamationTriangleIcon v-if="store.isOut(player)"
      class="inline-flex ml-auto size-4 text-red-500" />
  </div>

  <div v-if="team.name == 'SC QUINTO' "
    class="font-medium ml-1 w-1/12 text-blue-950">{{ player.active ? '🕒' :
      '⏳'
    }}{{
      store.formatTime(player.actualTime) }}
  </div>

  <div class="inline-flex items-start ml-2 gap-1 " role="group">
    <ExclutionButton 
      :exclution-state="getExclutionState(0)"
      @handleExclution="addExclution($event, 0)"
      @remove="removeExclution(0)" />
    <ExclutionButton 
      :exclution-state="getExclutionState(1)"
      @handleExclution="addExclution($event, 1)"
      @remove="removeExclution(1)" />
    <ExclutionButton 
      :exclution-state="getExclutionState(2)"
      @handleExclution="addExclution($event, 2)" 
      @remove="removeExclution(2)" />
  </div>

  <div class="inline-flex items-start ml-2 gap-1 text-blue-950" role="group">
    <div class="h-6 w-8 flex items-center justify-end">PARI</div>
    <ShotButton 
      :disabled="!player.active" 
      :type="ShotCategory.EVEN" 
      @handleShot="addShot"/>
    <div class="h-6 w-8 flex items-center"> {{ player.shotsEven.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsEven.length }}</div>
  </div>
  <div class="inline-flex items-start ml-2 gap-1 text-blue-950" role="group">
    <div class="h-6 w-8 flex items-center justify-end">SUP</div>
    <ShotButton 
      :disabled="!player.active" 
      :type="ShotCategory.SUP" 
      :is-goal="false" 
      @handleShot="addShot"/>
    <div class="h-6 w-8 flex items-center"> {{ player.shotsSup.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsSup.length }}</div>
  </div>
  <div class="inline-flex items-start ml-2 gap-1 text-blue-950" role="group">
    <div class="h-6 w-8 flex items-center justify-end">RIG</div>
    <ShotButton 
      :disabled="!player.active"
      :type="ShotCategory.PENALTY" 
      :is-goal="false" 
      @handleShot="addShot"/>
    <div class="h-6 w-8 flex items-center"> {{ player.shotsPenalty.filter(shot => shot.outcome.toUpperCase() === 'GOAL' ).length + '/' + player.shotsPenalty.length }}</div>
  </div>
  <div class="inline-flex ml-3 mr-2 text-blue-950" role="group">
    <div class="h-6 w-8 flex items-center"> {{ store.getAllShoots(player).goals + '/' + store.getAllShoots(player).shots }}</div>
  </div>

</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/gameStore";
import { ref, nextTick, type PropType } from "vue";
import type { Player } from "@/components/Interfaces/Player";
import type { Team } from "./Interfaces/Team";
import ExclutionButton from "./buttons/ExclutionButton.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";
import ShotButton from "./buttons/ShotButton.vue";
import { ShotCategory, ShotOutcome } from '@/enum/ShotDescription';

const props = defineProps({
  player: {
    type: Object as PropType<Player>,
    required: true,
  },
  team: {
    type: Object as PropType<Team>,
    required: true,
  },
});

const store = useGameStore();
const holdTimeout = ref<NodeJS.Timeout | null>(null);
const isEditing = ref<boolean>(false);
const editableName = ref<string>(props.player.name);
const isHolding = ref<boolean>(false); // Flag per evitare interferenze con il click
const inputField = ref<HTMLInputElement | null>(null);

const startHold = () => {
  isHolding.value = false; // Reset del flag prima di iniziare
  holdTimeout.value = setTimeout(() => {
    isHolding.value = true; // Imposta il flag se la pressione dura abbastanza
    isEditing.value = true;
    nextTick(() => {
      inputField.value?.focus();
    });
  }, 1500); // 1.5s di pressione
};

const stopHold = () => {
  if (holdTimeout.value) {
    clearTimeout(holdTimeout.value);
  }
};

const handleClick = (team: number) => {
  if (!isHolding.value && !isEditing.value) {
    store.toggleElement(props.player.number, team);
  }
};

const saveEdit = (team: number) => {
  isEditing.value = false;
  store.updatePlayerName(props.player.number, editableName.value, team);
};

const addExclution = (payload : { type: string, position: string, ball: boolean}, exclNumber: number) => {
  store.addExclution(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), payload.type, payload.position, payload.ball, exclNumber);
};

const addShot = (payload : { type: ShotCategory, position: string, outcome: ShotOutcome }) => {
  store.addShoot(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), payload.type, payload.position, payload.outcome)
};

const removeExclution = (exclNumber: number) => {
  store.removeExclution(props.player.number, (props.team.name == 'SC QUINTO' ? 0 : 1), exclNumber);
};

const getExclutionState = (index: number) => {
  if(props.player.exclutions[index]) {
    if(props.player.exclutions[index].type === 'EDCS'){
      return props.player.exclutions[index].type.toUpperCase().substring(0,2);
    }
    else {
      return props.player.exclutions[index].type.charAt(0) + '-' +  props.player.exclutions[index].position.charAt(0)
    }
  }
  return '';
}


</script>