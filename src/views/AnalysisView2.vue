<template>
  <div class=" bg-slate-50 min-h-screen">
    <div class="max-w-400 mx-auto">
      
      <div v-if="!videoStore.videoUploaded" class="max-w-full mx-auto bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-12">
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
            
            <!-- <div class="flex gap-2">
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q1</button>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q2</button>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q3</button>
              <button class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-sm">Q4</button>
            </div> -->

            <ActionButton label="Rimuovi questo video" color="red" @click="showCleanupModal = true"
              :icon="TrashIcon" size="sm" :solid="false"/>
            <ActionButton label="Torna alla selezione" color="gray" @click="videoStore.resetStore()"
              :icon="ArrowUturnLeftIcon" size="sm" :solid="false"/>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-70px)] sticky top-4 gap-4">
          
          <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
            <h3 class="text-xs font-black text-slate-400 uppercase tracking-wider">Stazione di Tagging (Pausa al click)</h3>
            
            <div class="grid grid-cols-2 gap-2">
              <button @click="createTag('GOL')" class="p-3 bg-green-500 hover:bg-green-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                GOL
              </button>
              <button @click="createTag('TIRO')" class="p-3 bg-blue-500 hover:bg-blue-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                TIRO
              </button>
              <button @click="createTag('ESPULSIONE')" class="p-3 bg-red-500 hover:bg-red-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                ESPULSIONE
              </button>
              <button @click="createTag('GENERICO')" class="p-3 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm rounded-lg shadow-xs active:scale-98 transition-transform">
                GENERICO
              </button>
            </div>
          </div>

          <div class="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 class="text-sm font-black text-blue-950">Clip Create ({{ videoStore.intervalsNew.length }})</h3>
              <div class="flex gap-2">
                <button 
                  v-if="videoStore.exportedClips.length > 0"
                  @click="showDownloadModal = true"
                  class="text-xs bg-green-600 text-white px-3 py-1 rounded font-bold hover:bg-green-700 transition-colors"
                >
                  Download Clip
                </button>
                <button 
                  v-if="videoStore.intervalsNew.length > 0"
                  @click="videoStore.exportVideoClips()"
                  :disabled="videoStore.isExporting"
                  class="text-xs bg-blue-900 text-white px-3 py-1 rounded font-bold hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ videoStore.isExporting ? 'Esportazione...' : 'Esporta Clip' }}
                </button>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div v-if="videoStore.intervalsNew.length === 0" class="text-center text-slate-400 text-sm py-12">
                Nessun tag inserito. Fai partire il video e premi un bottone per fermarlo e registrare l'azione.
              </div>
              
              <IntervalItem2
                v-for="(interval, index) in videoStore.intervalsNew" 
                :key="interval.id || index"
                :interval="interval"
                @remove="videoStore.intervalsNew.splice(index, 1)"
              />
            </div>
          </div>

        </div>

      </div>

    </div>

  </div>
  <ConfirmModal v-if="showCleanupModal" :isOpen="showCleanupModal" @confirm="confirmCleanup" @close="showCleanupModal = false" />
  <DownloadClipsModal :isOpen="showDownloadModal" :links="videoStore.exportedClips" @close="showDownloadModal = false" />
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue';
import { useVideoStore } from "@/stores/videoStore";
import FileUpload from "@/components/FileUpload.vue";
import ConfirmModal from "@/components/modals/ConfirmModal.vue";
import DownloadClipsModal from "@/components/modals/DownloadClipsModal.vue";
import HlsVideoPlayer2 from '@/components/HlsVideoPlayer2.vue';
import IntervalItem2 from '@/components/IntervalItem2.vue';
import ActionButton from '@/components/buttons/ActionButton.vue';
import { ArrowUturnLeftIcon, TrashIcon } from '@heroicons/vue/24/outline';

const videoStore = useVideoStore();
const playerRef = ref<InstanceType<typeof HlsVideoPlayer2> | null>(null);
const currentVideoTime = ref(0);
const showCleanupModal = ref(false);
const showDownloadModal = ref(false);

// Azione di innesco del Tag
const createTag = (type: string) => {
  if (!playerRef.value) return;

  // 1. Cattura il timestamp esatto dal player in millisecondi
  const anchor = Math.round(playerRef.value.getCurrentTime() * 1000);

  // 2. Metti in pausa il video per compilare i dettagli
  playerRef.value.pause();

  // 3. Inietta la nuova struttura dati nel tuo store esistente
  videoStore.intervalsNew.unshift({
    id: crypto.randomUUID(),
    title: `Azione ${type}`,
    type: type,
    category: '',
    anchorTime: anchor,
    offsetStart: -5, // Default 5s prima
    offsetEnd: 5
  });
};

const confirmCleanup = async () => {
  await videoStore.cleanupBucket();
  showCleanupModal.value = false;
};

const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

onUnmounted(()=>{
  videoStore.unsubscribeVideoUpdates();
})
</script>