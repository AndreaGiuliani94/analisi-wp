<script lang="ts" setup>
import PlayerItem from './PlayerItem.vue';
import { ArrowRightIcon } from '@heroicons/vue/20/solid';
import type { Team } from './Interfaces/Team';
import TimeOutButton from './buttons/TimeOutButton.vue';
import type { Player } from './Interfaces/Player';
import { useSessionStore } from '@/stores/sessionStore';
import { useUserRole } from '@/composables/useUserRole';

const sessionStore = useSessionStore()
const { role: userRole } = useUserRole(sessionStore.currentSession.participants)

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
    <div class="ms-2.5 mb-1.5 flex justify-start items-center">
      <a
        class="text-red-800 flex justify-start items-center cursor-pointer"
        @click="handleOpenModal"
      >
        <span class="font-semibold">{{ team.name }}</span>
        <ArrowRightIcon class="size-5 ms-1.5" />
      </a>

      <div class="ml-auto flex items-center justify-end gap-1">
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
