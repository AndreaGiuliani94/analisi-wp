<template>
  <div class="flex flex-col items-center justify-center h-screen space-y-4">
    <router-link  to="/game" class="flex items-center space-x-1 px-6 py-2 bg-blue-950 text-white rounded">
        <Icon name="water_polo" size="w-5 h-5" />
        <span class="hidden sm:inline">Gestione Partita Live</span>
    </router-link>
    <router-link to="/analysis" class="flex items-center space-x-1 px-6 py-2 bg-blue-950 text-white rounded">
      <Icon name="analisi" size="w-5 h-5" view-box="0 0 122.88 108.06" />
      <span class="hidden sm:inline">Analisi Video</span>
    </router-link>
    <router-link to="/settings" class="flex items-center space-x-1 px-6 py-2 bg-blue-950 text-white rounded">
      <WrenchScrewdriverIcon class="size-5"></WrenchScrewdriverIcon>
      <span class="hidden sm:inline">Impostazioni</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import Icon from '@/components/icons/Icon.vue';
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline';
</script>