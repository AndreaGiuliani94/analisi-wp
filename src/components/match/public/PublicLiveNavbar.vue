<template>
  <nav class="bg-blue-950 text-white p-2 h-12 flex items-center justify-between">
    <div class="flex justify-between items-center">
      <router-link :to="'/live/' + slug" class="flex items-center space-x-1" :class="{ 'font-bold': $route.path === '/' }">
        <ArrowLeftIcon class="size-5"></ArrowLeftIcon>
        <span class="hidden sm:inline">Live Hub</span>
      </router-link>
    </div>
    <div class="space-x-2 flex bg-blue-900/50 p-1 rounded-lg">
      <router-link :to="'/live/' + slug + '/match/' + matchId" class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors"
        active-class="font-bold bg-blue-600 text-white">
        <span class="hidden sm:inline">Live</span>
      </router-link>
      <router-link :to="'/live/' + slug + '/match/' + matchId + '/events'"
        class="flex items-center space-x-1 px-2 py-1 rounded-md transition-colors" active-class="font-bold bg-blue-600 text-white">
        <span class="hidden sm:inline">Cronaca</span>
      </router-link>
    </div>
    <MatchStatusBadge v-if="gameStore.match" :status="gameStore.match.status" :is-live="gameStore.match.isLive" />
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { ArrowLeftIcon } from '@heroicons/vue/24/outline';
import MatchStatusBadge from '@/components/badges/MatchStatusBadge.vue';

const route = useRoute();
const matchId = route.params.matchId as string;
const slug = route.params.slug as string;
const gameStore = useGameStore();
</script>
