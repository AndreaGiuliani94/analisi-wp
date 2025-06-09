<template>
  <div class="flex flex-col text-sm w-20">
    <label class="font-medium ">*Inizio:</label>
    <TimeInput v-model="interval.start" :error="interval.errors.start" 
      @blur="videoStore.validateTime(index, 'start')"/>
    <p v-if="interval.errors.start" class="text-red-500 mt-1">{{ interval.errors.start }}</p>
  </div>
  <div class="flex flex-col text-sm w-20 ">
    <label class="font-medium">*Fine:</label>
    <TimeInput v-model="interval.end" :error="interval.errors.end" 
      @blur="videoStore.validateTime(index, 'end')"/>
    <p v-if="interval.errors.end" class="text-red-500 mt-1">{{ interval.errors.end }}</p>
  </div>
  <div class="flex flex-col text-sm relative">
    <label class="font-medium">Titolo:</label>
    <input type="text"
      class="p-2 h-8 border border-gray-300 rounded-md transition duration-150 ease-in-out focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none"
      :class="{ 'border-red-500': interval.errors.title }" placeholder="Titolo della clip" v-model="interval.title"
      @blur="videoStore.validateTitle(index)">
    <div
      v-if="interval.errors.title"
      class="text-red-500 mt-1"
    >
      {{ interval.errors.title }}
    </div>
    
  </div>

  <CategoryListbox v-model="interval.category" />

  <div class="flex flex-col">
    <div class="h-5"></div>
    <button @click="videoStore.removeInterval(index)" class="bg-red-800 px-2 h-8 rounded hover:bg-red-800" :disabled="videoStore.isUploading">
      <XMarkIcon class="size-5 font-bold text-white" />
    </button>
  </div>
</template>

<script setup lang=ts>
import { useVideoStore } from '@/stores/videoStore';
import type { VideoInterval } from './Interfaces/VideoInterval';
import CategoryListbox from './CategoryListbox.vue';
import { XMarkIcon } from '@heroicons/vue/20/solid';
import TimeInput from './inputs/TimeInput.vue';

const videoStore = useVideoStore();

const props = defineProps<{
  interval: VideoInterval;
  index: number;
}>();

</script>
