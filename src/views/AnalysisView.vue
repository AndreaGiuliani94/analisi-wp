<template>
  <div class="max-w-3xl mx-auto p-6 bg-whiterounded-lg">
    <h2 class="text-2xl text-center font-semibold mb-4 text-blue-950">Analisi video</h2>

    <div class="border border-blue-950 text-blue-950 p-4 rounded-lg flex flex-col justify-center">
      <!-- Upload Video -->
      <FileUpload />

      <!-- Video Preview -->
      <div v-if="videoStore.videoURL" class="mb-2">
        <h3 class="text-lg font-semibold">Anteprima del Video</h3>
        <video :src="videoStore.videoURL" controls class="w-full mt-1 rounded-lg shadow-md"></video>
      </div>

      <!-- Form per selezionare intervalli -->
      <div v-if="videoStore.videoUploaded">
        <h3 class="text-lg font-semibold">Seleziona intervalli di tempo</h3>

        <div v-for="(interval, index) in videoStore.intervals" :key="index" class="flex space-x-4 mt-2">
          <input type="number" v-model="interval.start" class="border p-2 rounded w-1/3" placeholder="Inizio (sec)">
          <input type="number" v-model="interval.end" class="border p-2 rounded w-1/3" placeholder="Fine (sec)">
          <button @click="videoStore.removeInterval(index)"
            class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">
            ✖
          </button>
        </div>
        
        <div>
          <button @click="videoStore.addInterval"
            class="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Aggiungi Intervallo
          </button>
          <button @click="videoStore.sendIntervals"
            class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            :disabled="videoStore.intervals.length === 0">
            Taglia Video
          </button>
          <button @click="videoStore.resetStore"
            class="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Resetta
          </button>
        </div>

        <!-- Progress Bar -->
        <div v-if="videoStore.downloadProgress > 0" class="w-full bg-gray-200 rounded-full mt-4">
          <div class="bg-blue-500 text-xs font-medium text-white text-center p-1 leading-none rounded-full"
            :style="{ width: videoStore.downloadProgress + '%' }">
            {{ videoStore.downloadProgress.toFixed(0) }}%
          </div>
        </div>


      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import FileUpload from "@/components/FileUpload.vue";

// Importiamo lo store di Pinia
const videoStore = useVideoStore();

</script>