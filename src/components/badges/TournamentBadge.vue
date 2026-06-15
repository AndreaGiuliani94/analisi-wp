<template>
  <router-link 
    v-if="tournament" 
    :to="`/workspace/tournaments/${tournament.id}`" 
    class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors group"
  >
    <TrophyIcon class="size-4 text-blue-400 group-hover:text-blue-600 transition-colors" />
    <span class="text-xs font-bold uppercase tracking-tight whitespace-pre-line text-left">
      {{ label }}
    </span>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrophyIcon } from '@heroicons/vue/24/outline';

const props = defineProps<{
  tournament?: any;
}>();

const label = computed(() => {
  if (!props.tournament) return '';
  const t = props.tournament;
  const details = [t.category, t.gender, t.season ? `(${t.season})` : ''].filter(Boolean).join(' ');
  
  return details ? `${t.name}\n${details}` : t.name;
});
</script>
