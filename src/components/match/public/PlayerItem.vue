<template>
  <div 
    :class="[
      player.active ? 'bg-red-800 text-white' : 'bg-gray-200 text-gray-400',
    ]"
    class="p-2 w-2/5 lg:w-1/3 transition-colors duration-300 flex justify-start items-center border border-gray-300 rounded-lg select-none"
    >
    <span class="truncate flex-1 min-w-0">
      {{ player.number }}. {{ player.name }}
    </span>
    
    <div class="flex items-center gap-1.5 ml-auto shrink-0">
      <div 
        v-if="player.isGK" 
        class="px-1.5 py-0.5 border rounded-2xl text-xs  transition-all duration-300"
        :class="[player.active ? 'bg-white border-white text-red-700' : '']"
      >
        GK
      </div>

      <ExclamationTriangleIcon 
        v-if="gameStore.isOut(player)"
        class="size-4 text-red-500 animate-pulse" 
      />
    </div>
  </div>

  <div v-if="settings.enableExclution" class="inline-flex items-start ml-2 gap-1 " role="group">
    <ExclutionButton 
      :disabled="userRole === 'viewer'"
      :team="team.name == gameStore.match?.homeTeam.name ? 0 : 1"
      :exclution-state="getExclutionState(0)"
      />
    <ExclutionButton 
      :disabled="userRole === 'viewer'"
      :team="team.name == gameStore.match?.homeTeam.name ? 0 : 1"
      :exclution-state="getExclutionState(1)"
      />
    <ExclutionButton 
      :disabled="userRole === 'viewer'"
      :team="team.name == gameStore.match?.homeTeam.name ? 0 : 1"
      :exclution-state="getExclutionState(2)"
      />
  </div>

  <template v-if="settings.enableShoot">
    <div class=" items-center ml-2 gap-1 text-blue-950 hidden xl:inline-flex" role="group">
      <div class="h-6 w-8 flex items-center justify-end">PARI</div>
      <div class="h-6 w-8 flex items-center"> {{ playerShots?.even.filter(shot => shot.shotOutcome === ShotOutcome.GOAL ).length + '/' + playerShots?.even.length }}</div>
    </div>
    <div class=" items-center justify-center ml-2 gap-1 text-blue-950 hidden xl:inline-flex" role="group">
      <div class="h-6 w-8 inline-flex items-center justify-end" >SUP</div>
      <div class="h-6 w-8 inline-flex items-center tabular-nums"> {{ playerShots?.sup.filter(shot => shot.shotOutcome === ShotOutcome.GOAL ).length + '/' + playerShots?.sup.length }}</div>
    </div>
    <div class=" items-center ml-2 gap-1 text-blue-950 hidden xl:inline-flex" role="group">
      <div class="h-6 w-8 flex items-center justify-end">RIG</div>
      <div class="h-6 w-8 flex items-center"> {{ playerShots?.penalty.filter(shot => shot.shotOutcome === ShotOutcome.GOAL ).length + '/' + playerShots?.penalty.length }}</div>
    </div>
    <div class="flex gap-2 ml-auto items-center" role="group">
      <div class="inline-flex items-center text-blue-950" role="group">
        <div class="h-6 flex items-center font-bold text-base"> 
          <span v-if="player.isGK">
            {{ playerShotsFaced?.saves.length + '/' + playerShotsFaced?.shots.length }}
          </span>
          <span v-else>
            {{ gameStore.getAllPlayerShots(player, null).goals + '/' + gameStore.getAllPlayerShots(player, null).shots }}
          </span>
        </div>
      </div>
  
      <div class="h-6 items-center mr-2">
        <InformationCircleIcon class="size-6 text-blue-950" @click="openPlayerDetailModal"/>
      </div>

    </div>

  </template>

  <PlayerDetailModal :isOpen="isPlayerDetailOpen" :player="player" :team="team"
          @close="isPlayerDetailOpen = false" />

</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/gameStore";
import { ref, nextTick, type PropType, computed } from "vue";
import type { Player } from "@/interfaces/Player";
import ExclutionButton from "@/components/buttons/ExclutionButton.vue";
import { BoltIcon, EllipsisHorizontalCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/vue/24/outline";
import ShotButton from "@/components/buttons/ShotButton.vue";
import { ShotCategory, ShotOutcome } from '@/enum/ShotDescription';
import { useSettingsStore } from "@/stores/settingsStore";
import { useSessionStore } from "@/stores/sessionStore";
import { useUserRole } from "@/composables/useUserRole";
import PlayerDetailModal from "@/components/modals/PlayerDetailModal.vue";
import { foulCategoryLabels, foulPositionLabels } from "@/const/consts";
import { formatTime, getLabel } from "@/utils/utils";
import { FoulType, type EDCSType, type FoulPosition } from "@/enum/ExclutionDescription";
import type { Team } from "@/interfaces/Team";

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

const gameStore = useGameStore();
const settings = useSettingsStore();
const sessionStore = useSessionStore();
const isPlayerDetailOpen = ref<boolean>(false);
const { role: userRole } = useUserRole(sessionStore.currentSession.participants)

const playerShots = computed(() => {
  if(props.player.id) 
    return gameStore.getPlayerShotsByCategory(props.player.id)
  }
);

const playerShotsFaced = computed(() => {
  if(props.player.id && props.player.isGK) 
    return gameStore.getGoalkeeperShotsFaced(props.player.id)
  }
);

const getExclutionState = (index: number) => {
  if(props.player.id){

    const excl = gameStore.getPlayerFouls(props.player.id)[index];
    if(excl) {
      if(excl.foulType === FoulType.EDCS){
        return getLabel(excl.foulType, foulCategoryLabels).toUpperCase().substring(0,2);
      }
      else {
        return getLabel(excl.foulType, foulCategoryLabels).charAt(0) + '-' + getLabel(excl.foulPosition, foulPositionLabels).charAt(0)
      }
    }
  }
  return '';
}

const openPlayerDetailModal = () => {
  isPlayerDetailOpen.value = true;
}

</script>