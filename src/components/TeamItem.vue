<script lang="ts" setup>
import PlayerItem from './PlayerItem.vue';
import type { Team } from '../interfaces/Team';
import TimeOutButton from './buttons/TimeOutButton.vue';
import type { Player } from '../interfaces/Player';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserRole } from '@/composables/useUserRole';
import { useGameStore } from '@/stores/gameStore';
import { ShotCategory } from '@/enum/ShotDescription';
import { computed } from 'vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';

const sessionStore = useSessionStore()
const { role: userRole } = useUserRole(sessionStore.currentSession.participants)
const gameStore = useGameStore()

const stats = computed(() => ({
  even: gameStore.getAllTeamShotsByType(props.team, ShotCategory.EVEN),
  sup: gameStore.getAllTeamShotsByType(props.team, ShotCategory.SUP),
  pen: gameStore.getAllTeamShotsByType(props.team, ShotCategory.PENALTY),
  tot: gameStore.getAllTeamShotsByType(props.team, ShotCategory.OUTCOME)
}));

const props = defineProps<{
  team: Team
  players: Player[]
  teamKey: 'HOME' | 'AWAY'
}>()

const emit = defineEmits<{
  (e: 'openModal', team: Team): void
  (e: 'toggleTimeOut', payload: { teamName: 'HOME' | 'AWAY', number: 1 | 2 }): void
}>()

const handleTimeOutToggle = (number: 1 | 2) => {
  if(userRole && userRole.value !== 'viewer'){
    emit('toggleTimeOut', { teamName: props.teamKey, number })
  }
}

const handleOpenModal = () => {
  emit('openModal', props.team)
}
</script>

<template>
  <div class="p-2.5 border border-gray-300 rounded-md mb-2.5 flex flex-col font-medium text-lg w-full">
    <div class="ms-2.5 mb-1.5 grid grid-cols-[max-content_auto_max-content] items-center">
      <div
        class="text-red-800 flex justify-start items-center cursor-pointer"
        @click="handleOpenModal"
      >
        <span class="font-semibold">{{ team.name }}</span>
        <div class="h-6 w-6 flex justify-center items-center ms-2">
          <InformationCircleIcon class="size-6 text-red-800"/>
        </div>
      </div>
      <div class="flex justify-center gap-5 text-base text-blue-950">
        <div class="inline-flex items-center gap-1" role="group">
          <div class="text-sm font-semibold">PARI</div>
          <span class="tabular-nums font-bold">{{ stats.even.goals.length }}/{{ stats.even.shots.length }}</span>
        </div>
        <div class="inline-flex items-baseline gap-1.5" role="group">
          <div class="text-sm font-semibold">SUP</div>
          <span class="tabular-nums font-bold">{{ stats.sup.goals.length }}/{{ stats.sup.shots.length }}</span>
        </div>
        <div class="inline-flex items-baseline gap-1.5" role="group">
          <div class="text-sm font-semibold">RIG</div>
          <span class="tabular-nums font-bold">{{ stats.pen.goals.length }}/{{ stats.pen.shots.length }}</span>
        </div>
        <div class="inline-flex items-baseline gap-1.5" role="group">
          <div class="text-sm font-semibold">TOT</div>
          <span class="tabular-nums font-bold">{{ stats.tot.goals.length }}/{{ stats.tot.shots.length }}</span>
        </div>
      </div>

      <div class="ml-4 flex items-center justify-end gap-1">
        <span class="text-blue-950">TO</span>
        <TimeOutButton
          :number="1"
          :teamName="teamKey"
          :used="team.timeOut1"
          @toggleTimeOut="handleTimeOutToggle(1)"
        />
        <TimeOutButton
          :number="2"
          :teamName="teamKey"
          :used="team.timeOut2"
          @toggleTimeOut="handleTimeOutToggle(2)"
        />
      </div>
    </div>

    <div class="flex flex-col text-sm">
      <div
        v-for="player in players"
        :key="player.number"
        class="border border-gray-300 rounded-lg mt-1 flex justify-between items-center overflow-x-auto"
      >
        <PlayerItem :player="player" :team="team" />
      </div>
    </div>
  </div>
</template>
