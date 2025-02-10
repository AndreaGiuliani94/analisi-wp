<template>
  <h1>{{ store.match.name }}</h1>
  <div class="countdown">{{ store.formatTime(store.countdown) }}</div>
  <div class="quarter">{{ store.match.quarter }} T</div>
  <div class="button-box">
    <button class="mini-button" @click="" :disabled="store.activeCount !== 7">
      -10s</button>
    <button class="mini-button" @click="" :disabled="store.activeCount !== 7">
      -1s</button>
    <button @click="store.toggleGlobalTimer()" :disabled="store.activeCount !== 7">
      <span v-if="store.globalInterval"><font-awesome-icon :icon="['far', 'circle-play']"/></span>
      <span v-else><font-awesome-icon :icon="['far', 'circle-pause']" /></span>
    </button>
    <button class="mini-button" @click="" :disabled="store.activeCount !== 7">
      +1s</button>
    <button class="mini-button" @click="" :disabled="store.activeCount !== 7">
      +10s</button>
  </div>

  <div v-for="player in store.players" :key="player.number" class="element">
    <div class="player-box" :class="[player.active ? 'player-box-active' : 'player-box-bench', store.activeCount < 7 || player.active ? 'selectable': '']"
      @click="store.toggleElement(player.number)">
      <span>{{ player.number }}. {{ player.name }}</span>
    </div>
    <div class="timer">{{ player.active ? '🕒' : '⏳' }} {{ store.formatTime(player.actualTime) }}</div>
    <div class="mini-button-box">
      <button @click="store.addShoot(player.number)" :disabled="!player.active"  class="button-28">S</button>
      <button @click="store.addGoal(player.number)" :disabled="!player.active" class="button-28">G</button>
      <button @click="store.addExclution(player.number)" :disabled="!player.active"  class="button-28">E</button>
    </div>
  </div>

  <div class="button-box">
    <button @click="$router.push('/report')">Vai al Report</button>
    <button @click="$router.push('/events')">Vai a Eventi</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useElementStore } from '../stores/store';
const store = useElementStore();

</script>