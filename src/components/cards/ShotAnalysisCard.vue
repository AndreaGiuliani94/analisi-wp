<template>
  <div class="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
    
    <div class="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
      <span class="font-bold text-blue-950 uppercase">{{ title }}</span>
      <span class="bg-blue-100 text-blue-900 text-xs font-black px-2 py-1 rounded-full font-mono">
        {{ successCount }}/{{ totalCount }}
      </span>
    </div>

    <div v-for="(category, index) in categories" :key="index" class="mb-3 last:mb-0">
      
      <div class="text-xs font-bold uppercase text-slate-500 mb-1 border-b border-slate-50">
        {{ category.label }} 
        <span class="font-mono ml-1">({{ getShotsLengthByType(shotType, category.key) }})</span>
      </div>
      
      <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        <div 
          v-for="(zone, zIndex) in zones" 
          :key="zIndex" 
          class="flex justify-between"
          :class="getZoneValue(shotType, category.key, zone.values) === 0 ? 'text-slate-300' : 'font-semibold text-blue-900'"
        >
          <span>{{ zone.label }}</span>
          <span class="font-mono">{{ getZoneValue(shotType, category.key, zone.values) }}</span>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category, CategoryKey } from '../../interfaces/shot/Category';
import type { ShotKey } from '../../interfaces/shot/ShotKey';
import type { Zone } from '../../interfaces/shot/Zone';

const props = defineProps<{
  title: string;
  shotType: 'evens' | 'sup' | 'penalties';
  successCount: number; 
  totalCount: number;
  zones: Zone[];
  categories: Category[];
  // Passiamo le funzioni dal parent per non dover importare e ricostruire tutta la logica dello store qui
  getShotsLengthByType: (type: ShotKey, categoryKey: CategoryKey) => number;
  getZoneValue: (type: ShotKey, categoryKey: CategoryKey, zoneValues: string[]) => number;
}>();
</script>