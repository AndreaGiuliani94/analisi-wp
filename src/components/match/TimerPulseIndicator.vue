<template>
  <span v-if="isRunning" class="relative flex" :class="sizeClass">
    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span class="relative inline-flex rounded-full bg-emerald-500 w-full h-full"></span>
  </span>
  <span v-else class="rounded-full bg-slate-300" :class="sizeClass"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  isRunning: boolean;
  size?: 'sm' | 'md'; // sm = 2 (8px), md = 4 (16px)
}>(), {
  size: 'md'
});

const sizeClass = computed(() => props.size === 'sm' ? 'w-2 h-2' : 'w-4 h-4');
</script>