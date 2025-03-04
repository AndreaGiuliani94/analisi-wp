<template>
  <div class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Analisi video</h2>

    <!-- Upload Video -->
    <div v-if="!videoStore.videoUploaded" class="border p-4 rounded-lg flex flex-col justify-center">

       <FileUpload></FileUpload>

      <button @click="videoStore.uploadVideo" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        :disabled="!videoStore.selectedFile">
        Carica Video
      </button>
    </div>

    <!-- Form per selezionare intervalli -->
    <div v-else class="mt-6">
      <h3 class="text-lg font-semibold">Seleziona intervalli di tempo</h3>

      <div v-for="(interval, index) in videoStore.intervals" :key="index" class="flex space-x-4 mt-2">
        <input type="number" v-model="interval.start" class="border p-2 rounded w-1/3" placeholder="Inizio (sec)">
        <input type="number" v-model="interval.end" class="border p-2 rounded w-1/3" placeholder="Fine (sec)">
        <button @click="videoStore.removeInterval(index)"
          class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">
          ✖
        </button>
      </div>

      <button @click="videoStore.addInterval" class="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Aggiungi Intervallo
      </button>

      <button @click="videoStore.sendIntervals" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        :disabled="videoStore.intervals.length === 0">
        Taglia Video & Scarica ZIP
      </button>

      <button @click="videoStore.resetStore" class="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Resetta
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import FileUpload from "@/components/FileUpload.vue";

// Importiamo lo store di Pinia
const videoStore = useVideoStore();

</script>