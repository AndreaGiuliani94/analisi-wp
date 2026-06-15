<template>
  <div class=" bg-slate-50 min-h-screen">
    <div class="max-w-400 mx-auto">
      
      <div v-if="!videoStore.videoUploaded" class="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-12">
        <h2 class="text-xl font-black text-blue-950 mb-4 text-center">Analisi Video Professionale</h2>
        <FileUpload />
      </div>

      <div v-else class="grid grid-cols-12 gap-6 items-start">
        
        <div class="col-span-12 lg:col-span-8 flex flex-col gap-4">
          
          <HlsVideoPlayer2 
            ref="playerRef"
            :videoUrl="videoStore.videoURL"
            @time-update="currentVideoTime = $event"
          />

          <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Master Video Clock</span>
              <span class="text-3xl font-black font-mono text-blue-950">{{ formatTime(currentVideoTime) }}</span>
            </div>
            
            <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q1</button>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q2</button>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q3</button>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q4</button>
            </div>

            <button 
              @click="showCleanupModal = true"
              class="text-xs font-semibold text-red-700 hover:underline"
            >
              Rimuovi questo video
            </button>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-70px)] sticky top-4 gap-4">
          
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider">Stazione di Tagging (Pausa al click)</h3>
            
            <div class="grid grid-cols-2 gap-2">
              <button @click="createTag('GOL')" class="p-3 bg-green-500 hover:bg-green-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                ⚽ GOL
              </button>
              <button @click="createTag('TIRO')" class="p-3 bg-blue-500 hover:bg-blue-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                🎯 TIRO
              </button>
              <button @click="createTag('ESPULSIONE')" class="p-3 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                🟥 ESPULSIONE
              </button>
              <button @click="createTag('GENERICO')" class="p-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                💡 GENERICO
              </button>
            </div>
          </div>

          <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 class="text-sm font-black text-blue-950">Clip Create ({{ videoStore.intervalsNew.length }})</h3>
              <button 
                v-if="videoStore.intervalsNew.length > 0"
                class="text-xs bg-blue-900 text-white px-3 py-1 rounded font-bold hover:bg-blue-950"
              >
                Esporta Clip
              </button>
            </div>

            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div v-if="videoStore.intervalsNew.length === 0" class="text-center text-slate-400 text-sm py-12">
                Nessun tag inserito. Fai partire il video e premi un bottone per fermarlo e registrare l'azione.
              </div>
              
              <IntervalItem2
                v-for="(interval, index) in videoStore.intervalsNew" 
                :key="index"
                :interval="interval"
                @remove="videoStore.intervalsNew.splice(index, 1)"
              />
            </div>
          </div>

        </div>

      </div>

    </div>

    <ConfirmModal v-if="showCleanupModal" @confirm="confirmCleanup" @close="showCleanupModal = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useVideoStore } from "@/stores/videoStore";
import FileUpload from "@/components/FileUpload.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import HlsVideoPlayer2 from '@/components/HlsVideoPlayer2.vue';
import IntervalItem2 from '@/components/IntervalItem2.vue';

const videoStore = useVideoStore();
const playerRef = ref<InstanceType<typeof HlsVideoPlayer2> | null>(null);
const currentVideoTime = ref(0);
const showCleanupModal = ref(false);

// Azione di innesco del Tag
const createTag = (category: string) => {
  if (!playerRef.value) return;

  // 1. Cattura il timestamp esatto dal player
  const anchor = playerRef.value.getCurrentTime();

  // 2. Metti in pausa il video per compilare i dettagli
  playerRef.value.pause();

  // 3. Inietta la nuova struttura dati nel tuo store esistente
  videoStore.intervalsNew.unshift({
    title: `Azione ${category}`,
    category: category,
    anchorTime: anchor,
    offsetStart: -5, // Default 5s prima
    offsetEnd: 5
  });
};

const confirmCleanup = async () => {
  showCleanupModal.value = false;
  await videoStore.cleanupVideos();
};

const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
</script>