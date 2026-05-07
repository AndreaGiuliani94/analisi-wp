<template>
  <div
    class="font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-2 shadow-lg"
    :class="[badgeColorClass, badgeSizeClass]"
  >
    <span v-if="showDot" class="bg-white rounded-full animate-pulse" :class="dotSizeClass"></span>
    <span>{{ badgeLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MatchStatus } from '@/enum/MatchStatus';

const props = withDefaults(defineProps<{
  isLive: boolean;
  status: MatchStatus;
  size?: 'sm' | 'md'; // sm for compact views, md for default
}>(), {
  size: 'md'
});

const badgeLabel = computed(() => {
  if(!props.isLive)
    return 'PRIVATE';

  switch (props.status) {
    case MatchStatus.IN_PROGRESS:
      return 'LIVE';
    case MatchStatus.WARMUP:
      return 'WARMUP';
    case MatchStatus.SCHEDULED:
      return 'PROGRAMMATA';
    case MatchStatus.PAUSED:
      return 'PAUSA';
    case MatchStatus.FINISHED:
      return 'FINITA';
    case MatchStatus.CANCELED:
      return 'ANNULLATA';
    default:
      return 'SCONOSCIUTO';
  }
});

const badgeColorClass = computed(() => {
  if(!props.isLive)
    return 'bg-gray-400 text-white';
  switch (props.status) {
    case MatchStatus.IN_PROGRESS:
      return 'bg-red-600 text-white';
    case MatchStatus.WARMUP:
      return 'bg-yellow-600 text-white';
    case MatchStatus.SCHEDULED:
      return 'bg-blue-600 text-white';
    case MatchStatus.PAUSED:
      return 'bg-yellow-600 text-white';
    case MatchStatus.FINISHED:
      return 'bg-gray-500 text-white';
    case MatchStatus.CANCELED:
      return 'bg-purple-600 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
});

const badgeSizeClass = computed(() => props.size === 'sm' ? 'text-[8px] px-2 py-0.5 gap-1' : 'text-[10px] px-3 py-1 gap-2');
const dotSizeClass = computed(() => props.size === 'sm' ? 'size-1.5' : 'size-2');
const showDot = computed(() => props.status === MatchStatus.IN_PROGRESS && props.isLive);
</script>
