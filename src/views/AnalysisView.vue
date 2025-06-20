<template>
  <div class="max-w-3xl mx-auto p-6 bg-whiterounded-lg">
    <h2 class="text-2xl text-center font-semibold mb-4 text-blue-950">Analisi video</h2>

    <div class="border border-blue-950 text-blue-950 p-4 rounded-lg flex flex-col justify-center">
      <!-- Upload Video -->
      <FileUpload />

      <!-- Video Preview -->
      <div v-if="videoStore.videoURL && videoStore.videoUploaded" class="mb-2">
        <h3 class="text-lg font-semibold">Anteprima del Video</h3>
        <!-- <video :src="videoStore.videoURL" class="w-full mt-1 rounded-lg shadow-md" controls></video> -->
        <HlsVideoPlayer :videoUrl="videoStore.videoURL" :videoName="videoStore.videoName"></HlsVideoPlayer>
      </div>

      <!-- Form per selezionare intervalli -->
      <div v-if="videoStore.videoUploaded">
        <h3 class="text-lg font-semibold">Seleziona intervalli di tempo</h3>

        <div v-for="(interval, index) in videoStore.intervals" :key="index" class="flex w-full justify-between items-start mt-2 gap-2">
          <IntervalItem :interval="interval" :index="index"></IntervalItem>
        </div>

        <div class="flex justify-between font-medium">
          <button @click="videoStore.addInterval"
            class="mt-3 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:border-gray-500 disabled:bg-gray-300"
            :disabled="videoStore.isUploading">
            <PlusIcon class="size-6 font-bold"/>
          </button>
          <button @click="videoStore.sendIntervals"
            class="mt-4 bg-blue-950 text-white px-4 py-2 rounded hover:bg-blue-900 active:bg-white active:text-blue-950 disabled:border-gray-500 disabled:bg-gray-300"
            :disabled="videoStore.intervals.length === 0 || hasErrors || isIntervalEmpy || videoStore.isUploading">
            Taglia Video
          </button>
          <button @click="showConfirmModal = true"
            class="mt-4 bg-red-800 text-white px-4 py-2 rounded hover:bg-red-900 active:bg-white active:text-red-800 disabled:border-gray-500 disabled:bg-gray-300"
            :disabled="videoStore.isUploading">
            Resetta
          </button>
        </div>

        <!-- Modale di conferma -->
        <ConfirmModal :isOpen="showConfirmModal" title="Conferma Eliminazione"
          message="Questa operazione eliminerà tutti i file caricati e convertiti. Vuoi procedere?"
          @confirm="confirmCleanup" @close="showConfirmModal = false" />
      </div>

      <!-- Loanding spinner e message-->
      <div v-if="videoStore.isUploading" class="flex justify-center mt-4">
          <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div v-if="videoStore.clipJobStatusMessage">
            {{ videoStore.clipJobStatusMessage }}
          </div>
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
</template>

<script setup lang="ts">
import { useVideoStore } from "@/stores/videoStore";
import FileUpload from "@/components/FileUpload.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import { computed, ref } from "vue";
import IntervalItem from "@/components/IntervalItem.vue";
import { PlusIcon } from "@heroicons/vue/24/solid";
import HlsVideoPlayer from "@/components/HlsVideoPlayer.vue";

const videoStore = useVideoStore();

const showConfirmModal = ref(false);
const confirmCleanup = async () => {
  showConfirmModal.value = false;
  await videoStore.cleanupVideos();
};

const hasErrors = computed(() =>
  videoStore.intervals.some(interval => interval.errors.start || interval.errors.end)
);

const isIntervalEmpy = computed(()=>
  videoStore.intervals.some(interval => !interval.category || !interval.start || !interval.end || !interval.title)
);

</script>