<template>
  <div class="grid-rows-2">
    <label class="text-sm font-medium ">Inizio (mm:ss)</label>
    <input type="text"
      class="p-2 h-8 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      :class="{ 'border-red-500': interval.errors.start }" placeholder="mm:ss" v-model="interval.start" maxlength="5"
      @blur="videoStore.validateTime(index, 'start')">
    <p v-if="interval.errors.start" class="text-red-500 text-sm mt-1">{{ interval.errors.start }}</p>
  </div>
  <div class="grid-rows-2">
    <label class="text-sm font-medium">Fine (mm:ss)</label>
    <input type="text"
      class="p-2 h-8 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      :class="{ 'border-red-500': interval.errors.end }" placeholder="mm:ss" v-model="interval.end" maxlength="5"
      @blur="videoStore.validateTime(index, 'end')">
    <p v-if="interval.errors.end" class="text-red-500 text-sm mt-1">{{ interval.errors.end }}</p>
  </div>

  <CategoryListbox v-model="interval.category" />

  <div class="grid-rows-2">
    <div class="h-6"></div>
    <button @click="videoStore.removeInterval(index)" class="bg-red-500 px-2 h-8 rounded hover:bg-red-600">
      <XMarkIcon class="size-5 font-bold text-white" />
    </button>
  </div>
</template>

<script setup lang=ts>
import { useVideoStore } from '@/stores/videoStore';
import type { VideoInterval } from './Interfaces/VideoInterval';
import CategoryListbox from './CategoryListbox.vue';
import { XMarkIcon } from '@heroicons/vue/20/solid';

const videoStore = useVideoStore();

const props = defineProps<{
  interval: VideoInterval;
  index: number;
}>();

</script>
